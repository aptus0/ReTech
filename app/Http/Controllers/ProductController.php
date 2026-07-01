<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'unit'])->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->has('low_stock') && $request->low_stock == '1') {
            $query->whereColumn('current_stock', '<=', 'min_stock');
        }

        $products = $query->paginate(20)->withQueryString();

        return inertia('Products/Index', [
            'products' => $products,
            'filters' => $request->all(['search', 'category_id', 'brand_id', 'is_active', 'low_stock']),
            'categories' => Category::all(),
            'brands' => Brand::all(),
            'units' => Unit::all(),
        ]);
    }

    public function create()
    {
        return inertia('Products/Create', [
            'categories' => Category::all(),
            'brands' => Brand::all(),
            'units' => Unit::all(),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        DB::transaction(function () use ($request) {
            $data = $request->validated();
            $openingStock = $data['opening_stock'];
            unset($data['opening_stock']);

            $data['current_stock'] = $openingStock;

            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('products', 'public');
            }

            $product = Product::create($data);

            if ($openingStock > 0) {
                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => 'in',
                    'quantity' => $openingStock,
                    'unit_price' => $product->purchase_price,
                    'document_type' => 'Açılış Stoku',
                    'user_id' => auth()->id(),
                ]);
            }
        });

        return redirect()->route('products.index')->with('success', 'Ürün başarıyla oluşturuldu.');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'brand', 'unit']);
        $movements = StockMovement::with('user')->where('product_id', $product->id)->latest()->take(100)->get();

        return inertia('Products/Show', [
            'product' => $product,
            'movements' => $movements,
        ]);
    }

    public function edit(Product $product)
    {
        return inertia('Products/Edit', [
            'product' => $product,
            'categories' => Category::all(),
            'brands' => Brand::all(),
            'units' => Unit::all(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        return redirect()->route('products.index')->with('success', 'Ürün başarıyla güncellendi.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Ürün başarıyla silindi.');
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id',
        ]);

        Product::whereIn('id', $validated['ids'])->delete();

        return redirect()->route('products.index')
            ->with('success', count($validated['ids']).' ürün başarıyla silindi.');
    }

    public function toggleStatus(Product $product)
    {
        $product->update(['is_active' => ! $product->is_active]);

        return redirect()->back()->with('success', 'Ürün durumu güncellendi.');
    }
}
