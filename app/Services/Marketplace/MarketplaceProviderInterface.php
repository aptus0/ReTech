<?php

namespace App\Services\Marketplace;

use App\Models\MarketplaceAccount;
use App\Models\Product;

class MarketplaceResult
{
    public bool $success;
    public ?string $message;
    public mixed $data;

    public function __construct(bool $success, ?string $message = null, mixed $data = null)
    {
        $this->success = $success;
        $this->message = $message;
        $this->data = $data;
    }

    public static function success(mixed $data = null, string $message = 'Success'): self
    {
        return new self(true, $message, $data);
    }

    public static function error(string $message, mixed $data = null): self
    {
        return new self(false, $message, $data);
    }
}

interface MarketplaceProviderInterface
{
    public function testConnection(MarketplaceAccount $account): MarketplaceResult;

    public function fetchCategories(MarketplaceAccount $account): MarketplaceResult;

    public function fetchBrands(MarketplaceAccount $account, array $filters = []): MarketplaceResult;

    public function createProduct(MarketplaceAccount $account, Product $product): MarketplaceResult;

    public function updateProduct(MarketplaceAccount $account, Product $product): MarketplaceResult;

    public function updatePriceAndStock(MarketplaceAccount $account, Product $product): MarketplaceResult;

    public function deleteOrDeactivateProduct(MarketplaceAccount $account, Product $product): MarketplaceResult;

    public function fetchOrders(MarketplaceAccount $account, array $filters = []): MarketplaceResult;

    public function fetchReturns(MarketplaceAccount $account, array $filters = []): MarketplaceResult;
}
