<?php

namespace App\Services\Finance;

use App\Models\OpenTransaction;
use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;

class CollectionService
{
    public function collect(OpenTransaction $transaction, array $data)
    {
        return DB::transaction(function () use ($transaction, $data) {
            $amount = $data['amount'];
            $registerId = $data['register_id'];
            $paymentMethodId = $data['payment_method_id'] ?? null;
            $user_id = auth()->id();

            // 1. Kasa Hareketi Oluştur
            CashMovement::create([
                'register_id' => $registerId,
                'account_id' => $transaction->account_id,
                'payment_method_id' => $paymentMethodId,
                'type' => $transaction->type === 'receivable' ? 'collection' : 'payment',
                'amount' => $amount,
                'movement_date' => now(),
                'description' => $data['description'] ?? 'Açık Hesap Tahsilatı/Ödemesi',
                'created_by' => $user_id,
            ]);

            // 2. Kasa Bakiyesini Güncelle
            $register = CashRegister::find($registerId);
            if ($transaction->type === 'receivable') {
                $register->increment('current_balance', $amount);
            } else {
                $register->decrement('current_balance', $amount);
            }

            // 3. Müşteri (Cari) Bakiyesini Güncelle
            $customer = Customer::find($transaction->account_id);
            if ($transaction->type === 'receivable') {
                $customer->decrement('balance', $amount); // Alacak tahsil edildiğinde bakiye düşer
            } else {
                $customer->increment('balance', $amount); // Borç ödendiğinde bakiye (borçlu olduğumuz tutar) düşer/artar. (Tedarikçi mantığı)
            }

            // 4. Açık İşlemi (OpenTransaction) Güncelle
            $transaction->paid_amount += $amount;
            $transaction->remaining_amount = $transaction->amount - $transaction->paid_amount;
            
            if ($transaction->remaining_amount <= 0) {
                $transaction->status = 'paid';
                $transaction->remaining_amount = 0; // Olası fazladan ödeme durumunda negatife inmesini engelle
            } else {
                $transaction->status = 'partial';
            }
            
            $transaction->save();

            return $transaction;
        });
    }
}
