<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarcodeSchemaItem extends Model
{
    protected $guarded = [];

    protected $casts = [
        'visible' => 'boolean',
        'options_json' => 'array',
    ];

    public function schema()
    {
        return $this->belongsTo(BarcodeSchema::class, 'barcode_schema_id');
    }
}
