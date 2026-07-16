<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;

class DashboardController extends Controller
{
    public function index()
    {
        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();
        $lowStockProductsCount = Product::whereColumn('current_stock', '<=', 'min_stock')->count();
        $totalCategories = Category::count();

        $latestMovements = StockMovement::with('product')
            ->latest()
            ->take(10)
            ->get();

        $calendarEvents = CalendarEvent::where('user_id', auth()->id())->get();

        $salesChartData = [];
        $dayMap = [
            'Monday' => 'Pzt', 'Tuesday' => 'Sal', 'Wednesday' => 'Çar', 
            'Thursday' => 'Per', 'Friday' => 'Cum', 'Saturday' => 'Cmt', 'Sunday' => 'Paz'
        ];

        // Son 7 günün verilerini topla
        for ($i = 6; $i >= 0; $i--) {
            $date = \Carbon\Carbon::today()->subDays($i);
            $dayName = $dayMap[$date->format('l')];
            
            // Yerel faturalar (Satışlar)
            $invoiceSales = \App\Models\Invoice::whereDate('issue_date', $date->format('Y-m-d'))->sum('grand_total');
            $invoiceCount = \App\Models\Invoice::whereDate('issue_date', $date->format('Y-m-d'))->count();
            
            // Pazaryeri siparişleri
            $mpSales = \App\Models\MarketplaceOrder::whereDate('ordered_at', $date->format('Y-m-d'))->sum('total_amount');
            $mpCount = \App\Models\MarketplaceOrder::whereDate('ordered_at', $date->format('Y-m-d'))->count();
            
            $salesChartData[] = [
                'name' => $dayName,
                'sales' => $invoiceSales + $mpSales,
                'orders' => $invoiceCount + $mpCount,
                'carts' => 0 // Gerçek sepet verisi API'lerden gelmediği için 0 (veya ileride e-ticaret sitenizden beslenebilir)
            ];
        }

        return inertia('dashboard', [
            'stats' => [
                'totalProducts' => $totalProducts,
                'activeProducts' => $activeProducts,
                'lowStockProductsCount' => $lowStockProductsCount,
                'totalCategories' => $totalCategories,
            ],
            'latestMovements' => $latestMovements,
            'calendarEvents' => $calendarEvents,
            'salesChartData' => $salesChartData,
        ]);
    }
}
