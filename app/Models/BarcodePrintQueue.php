<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BarcodePrintQueue extends Model
{
    protected $fillable = ['product_id', 'copies', 'status'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
