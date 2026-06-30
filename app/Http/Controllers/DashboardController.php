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

        return inertia('dashboard', [
            'stats' => [
                'totalProducts' => $totalProducts,
                'activeProducts' => $activeProducts,
                'lowStockProductsCount' => $lowStockProductsCount,
                'totalCategories' => $totalCategories,
            ],
            'latestMovements' => $latestMovements,
            'calendarEvents' => $calendarEvents,
        ]);
    }
}
