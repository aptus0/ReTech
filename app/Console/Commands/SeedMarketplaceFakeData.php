<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Marketplace;
use App\Models\MarketplaceAccount;
use App\Models\Product;
use App\Models\MarketplaceProduct;
use App\Models\MarketplaceOrder;
use App\Models\MarketplaceReturn;
use Illuminate\Support\Str;

class SeedMarketplaceFakeData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:seed-marketplace-fake-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed fake marketplace data for UI testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Seeding Marketplace Fake Data...');

        // 1. Ensure Trendyol Marketplace exists
        $trendyol = Marketplace::firstOrCreate(
            ['code' => 'trendyol'],
            ['name' => 'Trendyol', 'is_active' => true, 'logo' => 'trendyol.png']
        );

        // 2. Ensure an account exists
        $account = MarketplaceAccount::firstOrCreate(
            ['marketplace_id' => $trendyol->id, 'store_name' => 'Test Trendyol Mağazası'],
            [
                'supplier_id' => '123456',
                'api_key_encrypted' => 'fake_api_key',
                'api_secret_encrypted' => 'fake_api_secret',
                'is_active' => true
            ]
        );

        // 3. Ensure some products exist
        if (Product::count() == 0) {
            $unit = \App\Models\Unit::firstOrCreate(['name' => 'Adet'], ['short_name' => 'AD', 'is_active' => true]);
            Product::create(['name' => 'iPhone 15 Pro Max', 'barcode' => '8691234567890', 'code' => 'APL-IP15PM', 'current_stock' => 10, 'sale_price' => 70000, 'unit_id' => $unit->id]);
            Product::create(['name' => 'Samsung S24 Ultra', 'barcode' => '8691234567891', 'code' => 'SAM-S24U', 'current_stock' => 5, 'sale_price' => 65000, 'unit_id' => $unit->id]);
            Product::create(['name' => 'MacBook Air M3', 'barcode' => '8691234567892', 'code' => 'APL-MBA-M3', 'current_stock' => 3, 'sale_price' => 45000, 'unit_id' => $unit->id]);
        }

        // 4. Create Marketplace Products
        foreach (Product::take(3)->get() as $product) {
            MarketplaceProduct::firstOrCreate(
                ['marketplace_account_id' => $account->id, 'product_id' => $product->id],
                [
                    'marketplace_sku' => 'TY-' . $product->code,
                    'barcode' => $product->barcode,
                    'status' => 'published',
                    'last_synced_at' => now()
                ]
            );
        }

        // 5. Create Fake Orders
        if (MarketplaceOrder::count() < 10) {
            for ($i = 1; $i <= 5; $i++) {
                $order = MarketplaceOrder::create([
                    'marketplace_account_id' => $account->id,
                    'external_order_id' => 'TY-ORD-' . rand(100000, 999999),
                    'customer_name' => 'Test Müşteri ' . $i,
                    'total_amount' => rand(1500, 50000) . '.00',
                    'status' => ['new', 'preparing', 'shipped', 'delivered'][rand(0, 3)],
                    'ordered_at' => now()->subDays(rand(0, 5))
                ]);

                // Create a return for 1 out of 5 orders randomly
                if ($i == 3) {
                    MarketplaceReturn::create([
                        'marketplace_account_id' => $account->id,
                        'marketplace_order_id' => $order->id,
                        'external_return_id' => 'TY-RET-' . rand(100000, 999999),
                        'status' => 'waiting',
                        'reason' => 'Beden uymadı / Vazgeçtim'
                    ]);
                }
            }
        }

        $this->info('Fake data created successfully!');
    }
}
