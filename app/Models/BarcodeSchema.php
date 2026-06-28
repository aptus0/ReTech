<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarcodeSchema extends Model
{
    protected $guarded = [];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'show_human_readable' => 'boolean',
    ];

    public function items()
    {
        return $this->hasMany(BarcodeSchemaItem::class);
    }
}
