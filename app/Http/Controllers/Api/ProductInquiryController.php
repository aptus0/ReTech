<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;

class ProductInquiryController extends Controller
{
    public function show($barcode)
    {
        $product = Product::where('barcode', $barcode)
            ->orWhere('code', $barcode)
            ->first();

        if (! $product) {
            return response()->json(['message' => 'Ürün bulunamadı'], 404);
        }

        return response()->json($product);
    }

    public function search(\Illuminate\Http\Request $request)
    {
        $query = $request->query('q');
        
        if (empty($query)) {
            $products = Product::where('is_active', true)
                ->limit(50)
                ->get();
            return response()->json($products);
        }

        $products = Product::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'LIKE', '%' . $query . '%')
                  ->orWhere('barcode', $query)
                  ->orWhere('code', $query);
            })
            ->limit(20)
            ->get();

        return response()->json($products);
    }
}
