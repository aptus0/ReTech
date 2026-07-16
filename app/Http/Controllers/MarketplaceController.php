<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\MarketplaceOrder;
use App\Models\MarketplaceAccount;
use App\Models\MarketplaceOrderItem;

class MarketplaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $now = Carbon::now();
        $oneWeekAgo = Carbon::now()->subDays(7);
        $twoWeeksAgo = Carbon::now()->subDays(14);

        // Total stats
        $totalOrders = MarketplaceOrder::count();
        $totalRevenue = MarketplaceOrder::sum('total_amount') ?? 0;
        $activeAccounts = MarketplaceAccount::where('is_active', true)->count();
        $pendingOrders = MarketplaceOrder::whereIn('status', ['new', 'Created', 'Picking'])->count();

        // Trends (This week vs Last week)
        $thisWeekRevenue = MarketplaceOrder::where('ordered_at', '>=', $oneWeekAgo)->sum('total_amount') ?? 0;
        $lastWeekRevenue = MarketplaceOrder::whereBetween('ordered_at', [$twoWeeksAgo, $oneWeekAgo])->sum('total_amount') ?? 0;
        $revenueTrend = $lastWeekRevenue > 0 ? (($thisWeekRevenue - $lastWeekRevenue) / $lastWeekRevenue) * 100 : ($thisWeekRevenue > 0 ? 100 : 0);

        $thisWeekOrders = MarketplaceOrder::where('ordered_at', '>=', $oneWeekAgo)->count();
        $lastWeekOrders = MarketplaceOrder::whereBetween('ordered_at', [$twoWeeksAgo, $oneWeekAgo])->count();
        $ordersTrend = $lastWeekOrders > 0 ? (($thisWeekOrders - $lastWeekOrders) / $lastWeekOrders) * 100 : ($thisWeekOrders > 0 ? 100 : 0);

        // Chart Data (Last 7 Days)
        $salesByDate = MarketplaceOrder::where('ordered_at', '>=', $oneWeekAgo)
            ->select(DB::raw('DATE(ordered_at) as date'), DB::raw('SUM(total_amount) as sales'), DB::raw('COUNT(*) as orders'))
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        $dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dateString = $date->format('Y-m-d');
            $chartData[] = [
                'name' => $dayNames[$date->dayOfWeek],
                'fullDate' => $date->format('d.m.Y'),
                'satis' => isset($salesByDate[$dateString]) ? (float)$salesByDate[$dateString]->sales : 0,
                'siparis' => isset($salesByDate[$dateString]) ? (int)$salesByDate[$dateString]->orders : 0,
            ];
        }

        // Order Status Distribution
        $statusDistributionRaw = MarketplaceOrder::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        $statusMap = [
            'new' => 'Yeni',
            'Created' => 'Yeni',
            'Picking' => 'Hazırlanıyor',
            'Invoiced' => 'Faturalandı',
            'Shipped' => 'Kargoda',
            'Delivered' => 'Teslim Edildi',
            'Cancelled' => 'İptal',
            'Returned' => 'İade',
        ];

        $statusDistribution = [];
        foreach ($statusDistributionRaw as $item) {
            $mappedStatus = $statusMap[$item->status] ?? $item->status;
            
            // Group similar statuses
            $existingIndex = array_search($mappedStatus, array_column($statusDistribution, 'name'));
            if ($existingIndex !== false) {
                $statusDistribution[$existingIndex]['value'] += $item->count;
            } else {
                $statusDistribution[] = [
                    'name' => $mappedStatus,
                    'value' => $item->count,
                ];
            }
        }

        // Top 5 Products
        $topProductsRaw = MarketplaceOrderItem::with('product')
            ->select('product_id', 'barcode', DB::raw('SUM(quantity) as total_quantity'), DB::raw('SUM(quantity * price) as total_revenue'))
            ->groupBy('product_id', 'barcode')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();
            
        $topProducts = $topProductsRaw->map(function ($item) {
            return [
                'name' => $item->product ? $item->product->name : ($item->barcode ?: 'Bilinmeyen Ürün'),
                'quantity' => (int)$item->total_quantity,
                'revenue' => (float)$item->total_revenue,
                'barcode' => $item->barcode,
            ];
        });

        $stats = [
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'active_accounts' => $activeAccounts,
            'pending_orders' => $pendingOrders,
            'trends' => [
                'revenue' => round($revenueTrend, 1),
                'orders' => round($ordersTrend, 1),
            ],
            'chartData' => $chartData,
            'statusDistribution' => $statusDistribution,
            'topProducts' => $topProducts,
        ];
        
        return inertia('Marketplace/Index', ['stats' => $stats]);
    }

    public function accounts()
    {
        $marketplaces = \App\Models\Marketplace::all();
        $accounts = \App\Models\MarketplaceAccount::with('marketplace')->get();

        // Reveal parts of the keys for display (optional masking)
        $accounts->transform(function ($account) {
            $account->has_api_key = !empty($account->api_key_encrypted);
            $account->has_api_secret = !empty($account->api_secret_encrypted);
            return $account;
        });

        return inertia('Marketplace/Accounts', [
            'marketplaces' => $marketplaces,
            'accounts' => $accounts
        ]);
    }

    public function storeAccount(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'marketplace_id' => 'required|exists:marketplaces,id',
            'store_name' => 'required|string',
            'supplier_id' => 'required|string',
            'api_key' => 'required|string',
            'api_secret' => 'required|string',
        ]);

        $account = new \App\Models\MarketplaceAccount();
        $account->marketplace_id = $validated['marketplace_id'];
        $account->store_name = $validated['store_name'];
        $account->supplier_id = $validated['supplier_id'];
        $account->api_key_encrypted = $validated['api_key'];
        $account->api_secret_encrypted = $validated['api_secret'];
        $account->save();

        return back()->with('success', 'Hesap başarıyla eklendi.');
    }

    public function testConnection(\App\Models\MarketplaceAccount $account)
    {
        if ($account->marketplace->code === 'trendyol') {
            $service = new \App\Services\Marketplaces\TrendyolService($account);
            $result = $service->testConnection();

            if ($result['success']) {
                $account->update(['last_connection_at' => now(), 'is_active' => true]);
                return back()->with('success', $result['message']);
            } else {
                $account->update(['is_active' => false]);
                return back()->with('error', $result['message']);
            }
        }

        return back()->with('error', 'Bu pazaryeri için test entegrasyonu bulunmuyor.');
    }

    public function destroyAccount(\App\Models\MarketplaceAccount $account)
    {
        $account->delete();
        return back()->with('success', 'Hesap başarıyla silindi.');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
