<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketplaceReturn extends Model
{
    protected $guarded = [];

    public function marketplaceOrder()
    {
        return $this->belongsTo(MarketplaceOrder::class);
    }

    public function marketplaceAccount()
    {
        return $this->belongsTo(MarketplaceAccount::class);
    }
}
