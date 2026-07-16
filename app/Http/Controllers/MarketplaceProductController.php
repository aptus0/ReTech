<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MarketplaceProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\MarketplaceProduct::with(['product', 'marketplaceAccount.marketplace']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            })->orWhere('barcode', 'like', "%{$search}%");
        }

        $marketplaceProducts = $query->paginate(20)->withQueryString();

        // Fetch local products for the "Add New Link" dropdown
        $localProducts = \App\Models\Product::select('id', 'name', 'barcode', 'code')->get();
        $marketplaceAccounts = \App\Models\MarketplaceAccount::where('is_active', true)->with('marketplace')->get();
        $categories = \App\Models\Category::all();

        return inertia('Marketplace/Products', [
            'marketplaceProducts' => $marketplaceProducts,
            'localProducts' => $localProducts,
            'marketplaceAccounts' => $marketplaceAccounts,
            'categories' => $categories,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'marketplace_account_id' => 'required|exists:marketplace_accounts,id',
        ]);

        try {
            $product = \App\Models\Product::findOrFail($request->product_id);
            
            // Check if already linked
            $exists = \App\Models\MarketplaceProduct::where('product_id', $product->id)
                ->where('marketplace_account_id', $request->marketplace_account_id)
                ->exists();
                
            if ($exists) {
                return back()->with('error', 'Bu ürün zaten bu pazaryerine bağlı.');
            }

            \App\Models\MarketplaceProduct::create([
                'product_id' => $product->id,
                'marketplace_account_id' => $request->marketplace_account_id,
                'barcode' => $product->barcode ?? $product->code,
                'stock_code' => $product->code,
                'status' => 'published', // Assumption for manual links
            ]);

            return back()->with('success', 'Ürün pazaryeri listesine başarıyla eklendi.');
        } catch (\Exception $e) {
            return back()->with('error', 'Ekleme sırasında hata oluştu: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|string',
            'sale_price' => 'required|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'current_stock' => 'required|integer|min:0',
        ]);

        try {
            $marketplaceProduct = \App\Models\MarketplaceProduct::with(['product', 'marketplaceAccount.marketplace'])->findOrFail($id);
            $localProduct = $marketplaceProduct->product;

            // Update local product
            $localProduct->update([
                'name' => $request->name,
                'image' => $request->image,
                'sale_price' => $request->sale_price,
                'purchase_price' => $request->purchase_price ?? $localProduct->purchase_price,
                'category_id' => $request->category_id ?? $localProduct->category_id,
                'current_stock' => $request->current_stock,
            ]);

            // Push to Trendyol
            if ($marketplaceProduct->marketplaceAccount->marketplace->code === 'trendyol' && $marketplaceProduct->barcode) {
                $service = new \App\Services\Marketplaces\TrendyolService($marketplaceProduct->marketplaceAccount);
                
                $items = [
                    [
                        'barcode' => $marketplaceProduct->barcode,
                        'quantity' => (int) $request->current_stock,
                        'salePrice' => (float) $request->sale_price,
                        'listPrice' => (float) $request->sale_price, // Trendyol genellikle listPrice de ister
                    ]
                ];
                
                $service->updatePriceAndInventory($items);
            }

            return back()->with('success', 'Ürün fiyat ve stok bilgisi güncellendi, Trendyol\'a iletildi.');
        } catch (\Exception $e) {
            return back()->with('error', 'Ürün güncellenirken hata oluştu: ' . $e->getMessage());
        }
    }

    public function destroy(string $id)
    {
        try {
            $marketplaceProduct = \App\Models\MarketplaceProduct::findOrFail($id);
            $marketplaceProduct->delete();
            return back()->with('success', 'Ürünün pazaryeri bağlantısı başarıyla koparıldı.');
        } catch (\Exception $e) {
            return back()->with('error', 'Silme işlemi sırasında hata oluştu: ' . $e->getMessage());
        }
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:marketplace_products,id',
        ]);

        try {
            \App\Models\MarketplaceProduct::whereIn('id', $validated['ids'])->delete();
            return back()->with('success', count($validated['ids']) . ' adet ürün pazaryeri bağlantısı başarıyla silindi.');
        } catch (\Exception $e) {
            return back()->with('error', 'Toplu silme sırasında hata oluştu: ' . $e->getMessage());
        }
    }

    public function pushNew(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:products,id'
        ]);

        $account = \App\Models\MarketplaceAccount::where('is_active', true)
            ->whereHas('marketplace', function($q) {
                $q->where('code', 'trendyol');
            })->first();

        if (!$account) {
            return back()->with('error', 'Aktif Trendyol hesabı bulunamadı.');
        }

        try {
            $service = new \App\Services\Marketplaces\TrendyolService($account);
            $products = \App\Models\Product::whereIn('id', $request->ids)->get();
            $pushedCount = 0;

            foreach ($products as $product) {
                // Sadece Trendyol'a yüklenmemiş olanları gönder
                $isAlreadyLinked = \App\Models\MarketplaceProduct::where('product_id', $product->id)
                    ->where('marketplace_account_id', $account->id)
                    ->exists();
                
                if ($isAlreadyLinked) continue;

                $brandName = $product->brand ? $product->brand->name : 'Diğer';
                $categoryName = $product->category ? $product->category->name : 'Diğer';
                
                // Trendyol beklentisi olan format:
                $productData = [
                    'barcode' => $product->barcode ?? $product->code,
                    'title' => $product->name,
                    'productMainId' => $product->code,
                    'brandId' => 200222, // Sabit test markası ID'si (Örn: Diğer markası, gerçek senaryoda eşleşme gerekir)
                    'categoryId' => 387, // Sabit test kategori ID'si (Gömlek vb, gerçekte eşleşme gerekir)
                    'quantity' => (int) $product->current_stock,
                    'stockCode' => $product->code,
                    'dimensionalWeight' => 1,
                    'description' => $product->description ?? 'KobiX üzerinden yüklendi.',
                    'currencyType' => 'TRY',
                    'listPrice' => (float) $product->sale_price,
                    'salePrice' => (float) $product->sale_price,
                    'vatRate' => 20,
                    'cargoCompanyId' => 10,
                    'images' => [
                        ['url' => $product->image ? (str_starts_with($product->image, 'http') ? $product->image : url('storage/' . $product->image)) : 'https://cdn.dsmcdn.com/ty1/product/media/images/20200812/11/7625141/111111111_1_org_zoom.jpg']
                    ],
                    'attributes' => [
                        ['attributeId' => 346, 'attributeValueId' => 4294] // Beden, Renk vs.
                    ]
                ];

                try {
                    $service->pushProduct($productData);
                    
                    \App\Models\MarketplaceProduct::create([
                        'product_id' => $product->id,
                        'marketplace_account_id' => $account->id,
                        'barcode' => $productData['barcode'],
                        'stock_code' => $productData['stockCode'],
                        'status' => 'waiting',
                        'approval_status' => 'waiting',
                    ]);

                    $pushedCount++;
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Trendyol Ürün Yükleme Hatası: ' . $e->getMessage());
                    // Devam et, diğer ürünleri dene
                }
            }

            if ($pushedCount > 0) {
                return back()->with('success', "{$pushedCount} ürün Trendyol'a onaya gönderildi.");
            } else {
                return back()->with('info', 'Gönderilecek yeni ürün bulunamadı veya hata oluştu.');
            }

        } catch (\Exception $e) {
            return back()->with('error', 'Trendyol servisi hatası: ' . $e->getMessage());
        }
    }

    public static function pushSingleProductToTrendyol($product)
    {
        $account = \App\Models\MarketplaceAccount::where('is_active', true)
            ->whereHas('marketplace', function($q) {
                $q->where('code', 'trendyol');
            })->first();

        if (!$account) return false;

        try {
            $service = new \App\Services\Marketplaces\TrendyolService($account);
            
            $isAlreadyLinked = \App\Models\MarketplaceProduct::where('product_id', $product->id)
                ->where('marketplace_account_id', $account->id)
                ->exists();
            
            if ($isAlreadyLinked) return true;

            $productData = [
                'barcode' => $product->barcode ?? $product->code,
                'title' => $product->name,
                'productMainId' => $product->code,
                'brandId' => 200222,
                'categoryId' => 387,
                'quantity' => (int) $product->current_stock,
                'stockCode' => $product->code,
                'dimensionalWeight' => 1,
                'description' => $product->description ?? 'KobiX üzerinden yüklendi.',
                'currencyType' => 'TRY',
                'listPrice' => (float) $product->sale_price,
                'salePrice' => (float) $product->sale_price,
                'vatRate' => 20,
                'cargoCompanyId' => 10,
                'images' => [
                    ['url' => $product->image ? (str_starts_with($product->image, 'http') ? $product->image : url('storage/' . $product->image)) : 'https://cdn.dsmcdn.com/ty1/product/media/images/20200812/11/7625141/111111111_1_org_zoom.jpg']
                ],
                'attributes' => [
                    ['attributeId' => 346, 'attributeValueId' => 4294]
                ]
            ];

            $service->pushProduct($productData);
            
            \App\Models\MarketplaceProduct::create([
                'product_id' => $product->id,
                'marketplace_account_id' => $account->id,
                'barcode' => $productData['barcode'],
                'stock_code' => $productData['stockCode'],
                'status' => 'waiting',
                'approval_status' => 'waiting',
            ]);

            return true;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Trendyol Oto Ürün Yükleme Hatası: ' . $e->getMessage());
            return false;
        }
    }

    public function pushStocks(Request $request)
    {
        $accounts = \App\Models\MarketplaceAccount::where('is_active', true)->get();
        $pushedCount = 0;

        foreach ($accounts as $account) {
            if ($account->marketplace->code === 'trendyol') {
                try {
                    $service = new \App\Services\Marketplaces\TrendyolService($account);
                    $marketplaceProducts = \App\Models\MarketplaceProduct::with('product')
                        ->where('marketplace_account_id', $account->id)
                        ->whereNotNull('barcode')
                        ->get();

                    if ($marketplaceProducts->isEmpty()) continue;

                    // Trendyol API allows max 1000 items per request, we'll chunk by 100 for safety
                    foreach ($marketplaceProducts->chunk(100) as $chunk) {
                        $items = [];
                        foreach ($chunk as $mpProduct) {
                            if (!$mpProduct->product) continue;
                            $items[] = [
                                'barcode' => $mpProduct->barcode,
                                'quantity' => (int) $mpProduct->product->current_stock,
                                'salePrice' => (float) $mpProduct->product->sale_price,
                                'listPrice' => (float) $mpProduct->product->sale_price,
                            ];
                        }
                        
                        if (!empty($items)) {
                            $service->updatePriceAndInventory($items);
                            $pushedCount += count($items);
                        }
                    }
                } catch (\Exception $e) {
                    return back()->with('error', 'Trendyol stokları gönderilirken hata oluştu: ' . $e->getMessage());
                }
            }
        }

        return back()->with('success', "{$pushedCount} ürünün güncel stok/fiyat bilgisi Trendyol'a başarıyla gönderildi.");
    }

    public function sync(Request $request)
    {
        $accounts = \App\Models\MarketplaceAccount::where('is_active', true)->get();
        $syncedCount = 0;
        $unmatchedCount = 0;

        foreach ($accounts as $account) {
            if ($account->marketplace->code === 'trendyol') {
                try {
                    $service = new \App\Services\Marketplaces\TrendyolService($account);
                    // Fetch first page of products (up to 100)
                    $response = $service->pullProducts(0, 100);
                    
                    if (isset($response['content'])) {
                        foreach ($response['content'] as $tyProduct) {
                            $barcode = $tyProduct['barcode'] ?? null;
                            if (!$barcode) continue;

                            $stockCode = !empty($tyProduct['stockCode']) ? $tyProduct['stockCode'] : $barcode;
                            
                            // Find local product by barcode or code
                            $localProduct = \App\Models\Product::where('barcode', $barcode)
                                ->orWhere('code', $stockCode)
                                ->first();

                            // Handle Category
                            $categoryId = null;
                            if (!empty($tyProduct['categoryName'])) {
                                $category = \App\Models\Category::firstOrCreate(
                                    ['name' => $tyProduct['categoryName']],
                                    [
                                        'slug' => \Illuminate\Support\Str::slug($tyProduct['categoryName']),
                                        'description' => 'Trendyol API: ' . $tyProduct['categoryName']
                                    ]
                                );
                                $categoryId = $category->id;
                            }

                            // Handle Brand
                            $brandId = null;
                            if (!empty($tyProduct['brand'])) {
                                $brand = \App\Models\Brand::firstOrCreate(
                                    ['name' => $tyProduct['brand']],
                                    [
                                        'slug' => \Illuminate\Support\Str::slug($tyProduct['brand']),
                                        'description' => 'Trendyol API: ' . $tyProduct['brand']
                                    ]
                                );
                                $brandId = $brand->id;
                            }

                            $imageUrl = !empty($tyProduct['images'][0]['url']) ? $tyProduct['images'][0]['url'] : null;
                            $description = !empty($tyProduct['description']) ? $tyProduct['description'] : null;

                            // Eğer ürün sistemde yoksa otomatik olarak oluştur
                            if (!$localProduct) {
                                $unit = \App\Models\Unit::first();
                                if (!$unit) {
                                    $unit = \App\Models\Unit::create(['name' => 'Adet', 'short_name' => 'Ad']);
                                }
                                
                                // Ensure code is unique before creating
                                $uniqueCode = $stockCode;
                                if (\App\Models\Product::where('code', $uniqueCode)->exists()) {
                                    $uniqueCode = $uniqueCode . '-' . uniqid();
                                }
                                
                                $localProduct = \App\Models\Product::create([
                                    'name' => !empty($tyProduct['title']) ? $tyProduct['title'] : 'İsimsiz Ürün',
                                    'code' => $uniqueCode,
                                    'barcode' => $barcode,
                                    'unit_id' => $unit->id,
                                    'sale_price' => !empty($tyProduct['salePrice']) ? $tyProduct['salePrice'] : 0,
                                    'category_id' => $categoryId,
                                    'brand_id' => $brandId,
                                    'description' => $description,
                                    'image' => $imageUrl,
                                ]);
                            } else {
                                // Mevcut ürünü de API'den gelen bu zengin verilerle güncelle (Sadece boşsa)
                                $updateData = [];
                                if (!$localProduct->category_id && $categoryId) $updateData['category_id'] = $categoryId;
                                if (!$localProduct->brand_id && $brandId) $updateData['brand_id'] = $brandId;
                                if (!$localProduct->description && $description) $updateData['description'] = $description;
                                if (!$localProduct->image && $imageUrl) $updateData['image'] = $imageUrl;

                                if (!empty($updateData)) {
                                    $localProduct->update($updateData);
                                }
                            }

                            if ($localProduct) {
                                \App\Models\MarketplaceProduct::updateOrCreate(
                                    [
                                        'marketplace_account_id' => $account->id,
                                        'product_id' => $localProduct->id,
                                    ],
                                    [
                                        'marketplace_product_id' => $tyProduct['id'] ?? null,
                                        'marketplace_content_id' => $tyProduct['productMainId'] ?? null,
                                        'barcode' => $barcode,
                                        'stock_code' => $tyProduct['stockCode'] ?? null,
                                        'status' => 'published',
                                        'approval_status' => $tyProduct['approved'] ? 'approved' : 'waiting',
                                        'last_synced_at' => now(),
                                    ]
                                );
                                $syncedCount++;
                            } else {
                                $unmatchedCount++;
                            }
                        }
                    }
                } catch (\Exception $e) {
                    return back()->with('error', 'Trendyol ürünleri çekilirken hata oluştu: ' . $e->getMessage());
                }
            }
        }

        $msg = "{$syncedCount} ürün başarıyla eşleştirildi ve güncellendi.";
        if ($unmatchedCount > 0) {
            $msg .= " ({$unmatchedCount} ürünün barkodu sistemde bulunamadı)";
        }

        return back()->with('success', $msg);
    }
}
