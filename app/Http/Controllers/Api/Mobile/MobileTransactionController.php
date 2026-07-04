<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;

class MobileTransactionController extends Controller
{
    /**
     * Submit an inventory count (Sayım Yap)
     */
    public function inventoryCount(Request $request)
    {
        $validated = $request->validate([
            'barcode' => 'required|string',
            'counted_quantity' => 'required|integer|min:0',
        ]);

        $product = Product::where('barcode', $validated['barcode'])
            ->orWhere('code', $validated['barcode'])
            ->firstOrFail();

        $oldStock = $product->current_stock;
        $newStock = $validated['counted_quantity'];

        if ($oldStock != $newStock) {
            $difference = $newStock - $oldStock;

            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id ?? null,
                'type' => $difference > 0 ? 'in' : 'out',
                'quantity' => abs($difference),
                'description' => 'Mobil Sayım Düzenlemesi',
            ]);

            $product->current_stock = $newStock;
            $product->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Sayım kaydedildi',
            'old_stock' => $oldStock,
            'new_stock' => $newStock,
        ]);
    }

    /**
     * Get transaction history (İşlem Geçmişi)
     */
    public function history(Request $request)
    {
        $movements = StockMovement::with(['product' => function ($query) {
            $query->select('id', 'name', 'barcode', 'code');
        }])
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return response()->json([
            'success' => true,
            'transactions' => $movements->map(function ($mov) {
                return [
                    'id' => $mov->id,
                    'type' => $mov->type,
                    'quantity' => $mov->quantity,
                    'notes' => $mov->description,
                    'date' => $mov->created_at->format('d.m.Y H:i'),
                    'product_name' => $mov->product ? $mov->product->name : 'Bilinmeyen Ürün',
                    'barcode' => $mov->product ? ($mov->product->barcode ?? $mov->product->code) : '',
                ];
            }),
        ]);
    }

    /**
     * Get list of in-stock products (Stok Listesi)
     */
    public function inventoryList(Request $request)
    {
        $query = Product::where('is_active', true)
            ->where('current_stock', '>', 0);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'stock_asc':
                    $query->orderBy('current_stock', 'asc');
                    break;
                case 'stock_desc':
                    $query->orderBy('current_stock', 'desc');
                    break;
                case 'price_asc':
                    $query->orderBy('sale_price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('sale_price', 'desc');
                    break;
                case 'name_asc':
                    $query->orderBy('name', 'asc');
                    break;
                default:
                    $query->orderBy('current_stock', 'desc');
            }
        } else {
            $query->orderBy('current_stock', 'desc');
        }

        $products = $query->paginate(20);

        return response()->json($products);
    }

    /**
     * Get inventory reports and aggregates (Raporlar)
     */
    public function inventoryReports(Request $request)
    {
        $totalProducts = Product::where('is_active', true)->count();
        $totalStock = Product::where('is_active', true)->sum('current_stock');
        
        $totalPurchaseValue = Product::where('is_active', true)
            ->selectRaw('SUM(current_stock * purchase_price) as total')
            ->value('total') ?? 0;
            
        $totalSaleValue = Product::where('is_active', true)
            ->selectRaw('SUM(current_stock * sale_price) as total')
            ->value('total') ?? 0;

        return response()->json([
            'success' => true,
            'total_products' => $totalProducts,
            'total_stock' => (int)$totalStock,
            'total_purchase_value' => (float)$totalPurchaseValue,
            'total_sale_value' => (float)$totalSaleValue,
        ]);
    }
}
