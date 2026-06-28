<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashRegister extends Model
{
    /** @use HasFactory<\Database\Factories\CashRegisterFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'opening_balance',
        'current_balance',
        'is_default',
        'is_active',
        'description',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'opening_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
    ];

    public function movements()
    {
        return $this->hasMany(CashMovement::class);
    }
}
