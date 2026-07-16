<?php

namespace Database\Seeders;

use App\Models\CashRegister;
use App\Models\PaymentMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        CashRegister::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Merkez Kasa',
                'code' => 'MERKEZ',
                'is_default' => true,
                'is_active' => true,
            ]
        );

        PaymentMethod::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Nakit',
                'type' => 'cash',
                'is_active' => true,
            ]
        );

        PaymentMethod::firstOrCreate(
            ['id' => 2],
            [
                'name' => 'Kredi Kartı',
                'type' => 'credit_card',
                'is_active' => true,
            ]
        );
    }
}
