<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id', 'product_id', 'product_name', 'quantity', 'unit_price',
        'tax_rate', 'tax_amount', 'discount_rate', 'discount_amount', 'total'
    ];

    public function invoice() { return $this->belongsTo(Invoice::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
