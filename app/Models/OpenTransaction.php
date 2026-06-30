<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpenTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id', 'invoice_id', 'type', 'amount', 'paid_amount', 'remaining_amount',
        'due_date', 'status', 'priority', 'last_contacted_at', 'note', 'created_by',
    ];

    protected $casts = [
        'due_date' => 'date',
        'last_contacted_at' => 'datetime',
    ];

    public function account()
    {
        return $this->belongsTo(Customer::class, 'account_id');
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
