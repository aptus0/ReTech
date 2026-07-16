<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketplaceProduct extends Model
{
    protected $guarded = [];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function marketplaceAccount()
    {
        return $this->belongsTo(MarketplaceAccount::class);
    }
}
