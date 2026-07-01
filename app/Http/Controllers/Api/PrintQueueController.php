<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BarcodePrintQueue;
use App\Models\Product;
use Illuminate\Http\Request;

class PrintQueueController extends Controller
{
    public function index()
    {
        $queue = BarcodePrintQueue::with('product')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($queue);
    }

    public function store(Request $request)
    {
        $request->validate([
            'barcode' => 'required|string',
        ]);

        $product = Product::where('barcode', $request->barcode)
            ->orWhere('code', $request->barcode)
            ->first();

        if (! $product) {
            return response()->json(['message' => 'Ürün bulunamadı'], 404);
        }

        $queue = BarcodePrintQueue::create([
            'product_id' => $product->id,
            'copies' => 1,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Kuyruğa eklendi',
            'product' => $product,
            'queue' => $queue,
        ]);
    }

    public function destroy($id)
    {
        $queue = BarcodePrintQueue::findOrFail($id);
        $queue->delete();

        return response()->json(['message' => 'Kuyruktan silindi']);
    }
}
