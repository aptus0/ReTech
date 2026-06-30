<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockMovementRequest;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'brand'])
            ->orderBy('current_stock', 'asc')
            ->paginate(20);

        $recentMovements = StockMovement::with(['product'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $totalStockValue = Product::sum(DB::raw('current_stock * sale_price'));
        $lowStockCount = Product::where('current_stock', '<', 10)->count();

        return inertia('StockMovements/Index', [
            'products' => $products,
            'recentMovements' => $recentMovements,
            'stats' => [
                'totalValue' => $totalStockValue,
                'lowStockCount' => $lowStockCount,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $products = Product::where('is_active', true)->get();

        return inertia('StockMovements/Create', [
            'products' => $products,
            'selected_product_id' => $request->product_id,
        ]);
    }

    public function store(StoreStockMovementRequest $request)
    {
        DB::transaction(function () use ($request) {
            $data = $request->validated();
            $data['user_id'] = auth()->id();

            StockMovement::create($data);

            $product = Product::lockForUpdate()->findOrFail($data['product_id']);
            if ($data['type'] === 'in') {
                $product->current_stock += $data['quantity'];
            } else {
                $product->current_stock -= $data['quantity'];
            }
            $product->save();
        });

        return redirect()->route('products.show', $request->product_id)
            ->with('success', 'Stok hareketi başarıyla kaydedildi.');
    }
}
