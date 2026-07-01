<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;

class MobileProductController extends Controller
{
    /**
     * Get categories and brands for mobile form
     */
    public function formData()
    {
        return response()->json([
            'success' => true,
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Add a new product from the mobile app
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'barcode' => 'required|string|unique:products,barcode',
            'sale_price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'code' => 'nullable|string|unique:products,code',
            'category_id' => 'nullable|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Auto-generate code if empty
        if (empty($validated['code'])) {
            $validated['code'] = 'MOB-'.strtoupper(uniqid());
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $defaultUnit = \App\Models\Unit::first();

        $product = Product::create([
            'name' => $validated['name'],
            'barcode' => $validated['barcode'],
            'code' => $validated['code'],
            'sale_price' => $validated['sale_price'],
            'purchase_price' => 0, // Default
            'current_stock' => $validated['stock_quantity'],
            'category_id' => $validated['category_id'] ?? null,
            'brand_id' => $validated['brand_id'] ?? null,
            'unit_id' => $defaultUnit ? $defaultUnit->id : 1,
            'image' => $imagePath,
            'is_active' => true,
        ]);

        // If stock > 0, log stock movement
        if ($validated['stock_quantity'] > 0) {
            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id ?? null,
                'type' => 'in',
                'quantity' => $validated['stock_quantity'],
                'description' => 'Mobil uygulamadan başlangıç stoğu',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ürün başarıyla eklendi',
            'product' => $product,
        ]);
    }

    /**
     * Update product price
     */
    public function updatePrice(Request $request, $barcode)
    {
        $validated = $request->validate([
            'price' => 'required|numeric|min:0',
        ]);

        $product = Product::where('barcode', $barcode)->orWhere('code', $barcode)->firstOrFail();

        $oldPrice = $product->sale_price;
        $product->sale_price = $validated['price'];
        $product->save();

        return response()->json([
            'success' => true,
            'message' => 'Fiyat güncellendi',
            'old_price' => $oldPrice,
            'new_price' => $product->sale_price,
        ]);
    }
}
