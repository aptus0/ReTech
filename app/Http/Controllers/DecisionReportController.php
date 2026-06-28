<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Invoice;
use App\Models\OpenTransaction;
use App\Models\StockMovement;
use App\Models\CashMovement;

class DecisionReportController extends Controller
{
    public function index()
    {
        // Temel veriler
        $todaySales = Invoice::where('type', 'sale')->whereDate('created_at', today())->sum('grand_total');
        $todayCollections = CashMovement::where('type', 'collection')->whereDate('created_at', today())->sum('amount');
        
        $overdueReceivables = OpenTransaction::where('type', 'receivable')->where('status', 'overdue')->sum('remaining_amount');
        $upcomingReceivables = OpenTransaction::where('type', 'receivable')
            ->whereIn('status', ['open', 'partial'])
            ->whereBetween('due_date', [today(), today()->addDays(7)])
            ->sum('remaining_amount');

        $totalProducts = \App\Models\Product::count();
        $activeProducts = \App\Models\Product::where('is_active', true)->count();
        $lowStockProductsCount = \App\Models\Product::whereColumn('current_stock', '<=', 'min_stock')->count();
        $totalCategories = \App\Models\Category::count();

        return Inertia::render('DecisionReports/Index', [
            'todaySales' => $todaySales,
            'todayCollections' => $todayCollections,
            'overdueReceivables' => $overdueReceivables,
            'upcomingReceivables' => $upcomingReceivables,
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
            'lowStockProductsCount' => $lowStockProductsCount,
            'totalCategories' => $totalCategories,
        ]);
    }
}
