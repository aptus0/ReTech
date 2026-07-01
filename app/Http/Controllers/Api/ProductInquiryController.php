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
}
