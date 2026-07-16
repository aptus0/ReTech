<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Marketplace;
use App\Models\MarketplaceAccount;

// Create or find Marketplace
$marketplace = Marketplace::firstOrCreate(
    ['code' => 'trendyol'],
    [
        'name' => 'Trendyol',
        'is_active' => true
    ]
);

// Create Account
$account = MarketplaceAccount::updateOrCreate(
    [
        'marketplace_id' => $marketplace->id,
        'supplier_id' => '1252460'
    ],
    [
        'store_name' => 'Trendyol Test Mağazası',
        'seller_id' => '1252460',
        'api_key_encrypted' => 'KOL145m50lrohuwV8XBX',
        'api_secret_encrypted' => 'hWoCyh25XnuUk3xN5n9y',
        'is_active' => true,
        'environment' => 'production'
    ]
);

echo "Trendyol Account Created: ID " . $account->id . "\n";
