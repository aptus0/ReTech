<?php

namespace App\Models;

use Database\Factories\CashMovementFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashMovement extends Model
{
    /** @use HasFactory<CashMovementFactory> */
    use HasFactory;

    protected $fillable = [
        'cash_register_id',
        'account_id',
        'payment_method_id',
        'type',
        'amount',
        'description',
        'source_type',
        'source_id',
        'created_by',
        'movement_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'movement_date' => 'date',
    ];

    public function register()
    {
        return $this->belongsTo(CashRegister::class, 'cash_register_id');
    }

    public function account()
    {
        return $this->belongsTo(Customer::class, 'account_id');
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}
