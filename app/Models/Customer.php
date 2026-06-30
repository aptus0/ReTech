<?php

namespace App\Models;

use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'phone',
        'email',
        'address',
        'tax_office',
        'tax_number',
        'balance',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'balance' => 'decimal:2',
    ];

    public function customerNotes()
    {
        return $this->hasMany(CustomerNote::class)->orderByDesc('created_at');
    }
}
