<?php

namespace App\Http\Controllers;

use App\Models\CashMovement;
use App\Models\Invoice;
use App\Models\OpenTransaction;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DecisionReportController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $thirtyDaysAgo = Carbon::today()->subDays(30);

        // ==========================================
        // 1. KÂRLILIK VE FİNANSAL PERFORMANS (Son 30 Gün)
        // ==========================================

        // Son 30 günlük ciro (sadece satış faturaları)
        $monthlySales = Invoice::where('type', 'sale')
            ->whereDate('created_at', '>=', $thirtyDaysAgo)
            ->sum('grand_total');

        // Satılan ürünlerin toplam maliyeti (COGS)
        $monthlyCogs = DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->where('invoices.type', 'sale')
            ->whereDate('invoices.created_at', '>=', $thirtyDaysAgo)
            ->sum(DB::raw('invoice_items.quantity * products.purchase_price'));

        $grossProfit = $monthlySales - $monthlyCogs;
        $profitMargin = $monthlySales > 0 ? ($grossProfit / $monthlySales) * 100 : 0;

        // Vadesi geçmiş ve yaklaşan nakit akışı
        $overdueReceivables = OpenTransaction::where('type', 'receivable')->where('status', 'overdue')->sum('remaining_amount');
        $upcomingReceivables = OpenTransaction::where('type', 'receivable')
            ->whereIn('status', ['open', 'partial'])
            ->whereBetween('due_date', [today(), today()->addDays(30)])
            ->sum('remaining_amount');

        $upcomingPayables = OpenTransaction::where('type', 'payable')
            ->whereIn('status', ['open', 'partial'])
            ->whereBetween('due_date', [today(), today()->addDays(30)])
            ->sum('remaining_amount');

        // ==========================================
        // 2. STOK VE ENVANTER DEĞERLEMESİ
        // ==========================================

        // Depodaki toplam sermaye (Maliyet)
        $inventoryCapital = Product::where('is_active', true)
            ->where('current_stock', '>', 0)
            ->sum(DB::raw('current_stock * purchase_price'));

        // Beklenen Ciro (Satış Fiyatı Üzerinden)
        $expectedRevenue = Product::where('is_active', true)
            ->where('current_stock', '>', 0)
            ->sum(DB::raw('current_stock * sale_price'));

        $potentialProfit = $expectedRevenue - $inventoryCapital;

        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();
        $lowStockProductsCount = Product::whereColumn('current_stock', '<=', 'min_stock')->count();

        // ==========================================
        // 3. EN ÇOK SATAN ÜRÜNLER (Son 30 Gün)
        // ==========================================
        $topSellingProducts = DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.barcode',
                DB::raw('SUM(invoice_items.quantity) as total_quantity'),
                DB::raw('SUM(invoice_items.total) as total_revenue')
            )
            ->where('invoices.type', 'sale')
            ->whereDate('invoices.created_at', '>=', $thirtyDaysAgo)
            ->groupBy('products.id', 'products.name', 'products.barcode')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get();

        // ==========================================
        // 4. HAFTALIK SATIŞ VE TAHSİLAT TRENDİ (Son 7 Gün)
        // ==========================================
        $salesTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);

            $dailySales = Invoice::where('type', 'sale')
                ->whereDate('created_at', $date)
                ->sum('grand_total');

            $dailyCollections = CashMovement::where('type', 'collection')
                ->whereDate('created_at', $date)
                ->sum('amount');

            $salesTrend[] = [
                'name' => $date->translatedFormat('D'), // Pzt, Sal vb.
                'fullDate' => $date->format('d M'),
                'satis' => (float) $dailySales,
                'tahsilat' => (float) $dailyCollections,
            ];
        }

        // Bugünkü Anlık Veriler
        $todaySales = Invoice::where('type', 'sale')->whereDate('created_at', today())->sum('grand_total');
        $todayCollections = CashMovement::where('type', 'collection')->whereDate('created_at', today())->sum('amount');

        return Inertia::render('DecisionReports/Index', [
            'metrics' => [
                'profitability' => [
                    'monthlySales' => $monthlySales,
                    'monthlyCogs' => $monthlyCogs,
                    'grossProfit' => $grossProfit,
                    'profitMargin' => round($profitMargin, 2),
                ],
                'cashFlow' => [
                    'todaySales' => $todaySales,
                    'todayCollections' => $todayCollections,
                    'overdueReceivables' => $overdueReceivables,
                    'upcomingReceivables' => $upcomingReceivables,
                    'upcomingPayables' => $upcomingPayables,
                ],
                'inventory' => [
                    'totalProducts' => $totalProducts,
                    'activeProducts' => $activeProducts,
                    'lowStockProductsCount' => $lowStockProductsCount,
                    'inventoryCapital' => $inventoryCapital,
                    'expectedRevenue' => $expectedRevenue,
                    'potentialProfit' => $potentialProfit,
                ],
                'topSellers' => $topSellingProducts,
                'trendData' => $salesTrend,
            ],
        ]);
    }
}
