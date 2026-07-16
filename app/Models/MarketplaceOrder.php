<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketplaceOrder extends Model
{
    protected $guarded = [];

    public function marketplaceAccount()
    {
        return $this->belongsTo(MarketplaceAccount::class);
    }
}
