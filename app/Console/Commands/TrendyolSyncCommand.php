<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MarketplaceAccount;
use App\Services\Marketplaces\TrendyolService;
use App\Models\Product;
use App\Models\MarketplaceProduct;

class TrendyolSyncCommand extends Command
{
    protected $signature = 'trendyol:test {action} {--barcode=} {--qty=} {--price=}';
    protected $description = 'Test Trendyol API actions: pull, update-stock';

    public function handle()
    {
        $action = $this->argument('action');
        
        $account = MarketplaceAccount::where('supplier_id', '1252460')->first();
        if (!$account) {
            $this->error('Test hesabı (Supplier ID: 1252460) bulunamadı!');
            return;
        }

        $service = new TrendyolService($account);

        if ($action === 'pull') {
            $this->info('Trendyol\'dan ürünler çekiliyor...');
            
            try {
                $result = $service->pullProducts();
                $products = $result['content'] ?? [];
                
                $this->info("Toplam " . count($products) . " ürün çekildi.");

                foreach ($products as $tp) {
                    // Update or Create Product
                    $product = Product::updateOrCreate(
                        ['barcode' => $tp['barcode']],
                        [
                            'name' => $tp['title'],
                            'code' => $tp['stockCode'] ?? $tp['productCode'],
                            'sale_price' => $tp['salePrice'] ?? 0,
                            'current_stock' => $tp['quantity'] ?? 0,
                            'is_active' => $tp['approved'] ?? true,
                        ]
                    );

                    // Map to MarketplaceProduct
                    MarketplaceProduct::updateOrCreate(
                        [
                            'marketplace_account_id' => $account->id,
                            'barcode' => $tp['barcode']
                        ],
                        [
                            'product_id' => $product->id,
                            'marketplace_product_id' => $tp['id'] ?? null,
                            'stock_code' => $tp['stockCode'] ?? null,
                            'status' => 'active',
                            'last_synced_at' => now(),
                        ]
                    );

                    $this->line("Kaydedildi/Güncellendi: " . $tp['barcode'] . " - " . $tp['title']);
                }
                
                $this->info('Çekme işlemi tamamlandı.');
            } catch (\Exception $e) {
                $this->error('Hata: ' . $e->getMessage());
            }

        } elseif ($action === 'update-stock') {
            $barcode = $this->option('barcode');
            $qty = $this->option('qty') ?? 10;
            $price = $this->option('price') ?? 100;

            if (!$barcode) {
                $this->error('Lütfen bir barcode belirtin: --barcode=...');
                return;
            }

            $this->info("Güncelleniyor: Barcode={$barcode}, Miktar={$qty}, Fiyat={$price}");

            try {
                $items = [
                    [
                        'barcode' => $barcode,
                        'quantity' => (int)$qty,
                        'salePrice' => (float)$price,
                        'listPrice' => (float)$price
                    ]
                ];

                $result = $service->updatePriceAndInventory($items);
                $this->info("İşlem başarılı! Batch Request ID: " . ($result['batchRequestId'] ?? 'Bilinmiyor'));
            } catch (\Exception $e) {
                $this->error('Hata: ' . $e->getMessage());
            }
        } else {
            $this->error('Bilinmeyen eylem. Geçerli eylemler: pull, update-stock');
        }
    }
}
