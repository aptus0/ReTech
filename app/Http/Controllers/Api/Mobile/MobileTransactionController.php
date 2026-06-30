<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MobileTransactionController extends Controller
{
    /**
     * Submit an inventory count (Sayım Yap)
     */
    public function inventoryCount(Request $request)
    {
        $validated = $request->validate([
            'barcode' => 'required|string',
            'counted_quantity' => 'required|integer|min:0'
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
                'notes' => 'Mobil Sayım Düzenlemesi'
            ]);
            
            $product->current_stock = $newStock;
            $product->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Sayım kaydedildi',
            'old_stock' => $oldStock,
            'new_stock' => $newStock
        ]);
    }

    /**
     * Get transaction history (İşlem Geçmişi)
     */
    public function history(Request $request)
    {
        $movements = StockMovement::with(['product' => function($query) {
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
                    'notes' => $mov->notes,
                    'date' => $mov->created_at->format('d.m.Y H:i'),
                    'product_name' => $mov->product ? $mov->product->name : 'Bilinmeyen Ürün',
                    'barcode' => $mov->product ? ($mov->product->barcode ?? $mov->product->code) : ''
                ];
            })
        ]);
    }
}
