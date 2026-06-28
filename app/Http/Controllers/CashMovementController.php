<?php

namespace App\Http\Controllers;

use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Http\Requests\StoreCashMovementRequest;
use App\Http\Requests\UpdateCashMovementRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CashMovementController extends Controller
{
    public function index(Request $request)
    {
        $movements = CashMovement::with(['register', 'account', 'paymentMethod'])
            ->orderByDesc('movement_date')
            ->orderByDesc('id')
            ->paginate(15);

        return inertia('Finance/CashMovements/Index', [
            'movements' => $movements,
            'registers' => CashRegister::where('is_active', true)->get(),
            'accounts' => Customer::all(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->get(),
        ]);
    }

    public function create()
    {
        return inertia('Finance/CashMovements/Create', [
            'registers' => CashRegister::where('is_active', true)->get(),
            'accounts' => Customer::all(),
            'paymentMethods' => PaymentMethod::where('is_active', true)->get(),
        ]);
    }

    public function store(StoreCashMovementRequest $request)
    {
        DB::transaction(function () use ($request) {
            $movement = CashMovement::create($request->validated() + ['created_by' => auth()->id()]);

            // Update cash register balance
            $register = $movement->register;
            if (in_array($movement->type, ['income', 'collection', 'sale'])) {
                $register->increment('current_balance', $movement->amount);
            } else {
                $register->decrement('current_balance', $movement->amount);
            }

            // Update customer balance if applicable
            if ($movement->account_id) {
                $account = $movement->account;
                if (in_array($movement->type, ['collection', 'income'])) {
                    $account->decrement('balance', $movement->amount); // tahsilat bakiyeyi düşürür
                } elseif (in_array($movement->type, ['payment', 'expense'])) {
                    $account->increment('balance', $movement->amount); // ödeme bakiyeyi artırır
                }
            }
        });

        return redirect()->route('cash-movements.index')->with('success', 'Kasa hareketi işlendi.');
    }

    public function show(CashMovement $cashMovement)
    {
        return inertia('Finance/CashMovements/Show', [
            'movement' => $cashMovement->load(['register', 'account', 'paymentMethod'])
        ]);
    }

    public function destroy(CashMovement $cashMovement)
    {
        DB::transaction(function () use ($cashMovement) {
            // Reverse cash register balance
            $register = $cashMovement->register;
            if (in_array($cashMovement->type, ['income', 'collection', 'sale'])) {
                $register->decrement('current_balance', $cashMovement->amount);
            } else {
                $register->increment('current_balance', $cashMovement->amount);
            }

            // Reverse customer balance
            if ($cashMovement->account_id) {
                $account = $cashMovement->account;
                if (in_array($cashMovement->type, ['collection', 'income'])) {
                    $account->increment('balance', $cashMovement->amount);
                } elseif (in_array($cashMovement->type, ['payment', 'expense'])) {
                    $account->decrement('balance', $cashMovement->amount);
                }
            }

            $cashMovement->delete();
        });

        return redirect()->route('cash-movements.index')->with('success', 'Hareket geri alındı ve silindi.');
    }
}
