<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProductInquiryController extends Controller
{
    public function show($barcode)
    {
        $product = \App\Models\Product::where('barcode', $barcode)
            ->orWhere('code', $barcode)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'Ürün bulunamadı'], 404);
        }

        return response()->json($product);
    }
}
