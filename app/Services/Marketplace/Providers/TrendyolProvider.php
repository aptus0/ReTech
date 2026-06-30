<?php

namespace App\Services\Marketplace\Providers;

use App\Models\MarketplaceAccount;
use App\Models\Product;
use App\Services\Marketplace\MarketplaceProviderInterface;
use App\Services\Marketplace\MarketplaceResult;

class TrendyolProvider implements MarketplaceProviderInterface
{
    public function testConnection(MarketplaceAccount $account): MarketplaceResult
    {
        return MarketplaceResult::success(null, 'Trendyol connection logic goes here (Sprint 15)');
    }

    public function fetchCategories(MarketplaceAccount $account): MarketplaceResult
    {
        return MarketplaceResult::success();
    }

    public function fetchBrands(MarketplaceAccount $account, array $filters = []): MarketplaceResult
    {
        return MarketplaceResult::success();
    }

    public function createProduct(MarketplaceAccount $account, Product $product): MarketplaceResult
    {
        return MarketplaceResult::success();
    }

    public function updateProduct(MarketplaceAccount $account, Product $product): MarketplaceResult
    {
        return MarketplaceResult::success();
    }

    public function updatePriceAndStock(MarketplaceAccount $account, Product $product): MarketplaceResult
    {
        return MarketplaceResult::success();
    }

    public function deleteOrDeactivateProduct(MarketplaceAccount $account, Product $product): MarketplaceResult
    {
        return MarketplaceResult::success();
    }

    public function fetchOrders(MarketplaceAccount $account, array $filters = []): MarketplaceResult
    {
        return MarketplaceResult::success();
    }

    public function fetchReturns(MarketplaceAccount $account, array $filters = []): MarketplaceResult
    {
        return MarketplaceResult::success();
    }
}
