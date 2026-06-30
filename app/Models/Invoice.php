<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id', 'type', 'invoice_number', 'issue_date', 'due_date',
        'subtotal', 'tax_total', 'discount_total', 'grand_total', 'status',
        'e_document_type', 'e_document_status', 'e_document_uuid', 'e_document_response', 'e_document_sent_at',
        'notes', 'created_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'e_document_sent_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function openTransaction()
    {
        return $this->hasOne(OpenTransaction::class);
    }

    public function cashMovements()
    {
        return $this->hasMany(CashMovement::class, 'source_id')->where('source_type', 'invoice');
    }
}
