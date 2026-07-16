<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarketplaceAccount extends Model
{
    protected $guarded = [];

    protected $casts = [
        'api_key_encrypted' => 'encrypted',
        'api_secret_encrypted' => 'encrypted',
        'app_key_encrypted' => 'encrypted',
        'app_secret_encrypted' => 'encrypted',
        'is_active' => 'boolean',
        'last_connection_at' => 'datetime',
        'last_sync_at' => 'datetime',
        'settings_json' => 'array',
    ];

    public function marketplace()
    {
        return $this->belongsTo(Marketplace::class);
    }
}
