<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use App\Models\OpenTransaction;
use App\Models\PaymentMethod;
use App\Services\Finance\CollectionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OpenTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = OpenTransaction::with(['account', 'invoice'])
            ->orderByRaw("CASE WHEN status = 'overdue' THEN 1 WHEN status = 'open' THEN 2 ELSE 3 END")
            ->orderBy('due_date', 'asc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('account', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $transactions = $query->paginate(15);
        $registers = CashRegister::where('is_active', true)->get();
        $paymentMethods = PaymentMethod::where('is_active', true)->get();

        return Inertia::render('OpenTransactions/Index', [
            'transactions' => $transactions,
            'registers' => $registers,
            'paymentMethods' => $paymentMethods,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(OpenTransaction $openTransaction)
    {
        $openTransaction->load(['account', 'invoice']);

        return Inertia::render('OpenTransactions/Show', [
            'transaction' => $openTransaction,
        ]);
    }

    public function collect(Request $request, OpenTransaction $openTransaction, CollectionService $collectionService)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.1|max:'.$openTransaction->remaining_amount,
            'register_id' => 'required|exists:cash_registers,id',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'description' => 'nullable|string',
        ]);

        try {
            $collectionService->collect($openTransaction, $validated);

            return back()->with('success', 'Tahsilat başarıyla kaydedildi.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Tahsilat işlemi sırasında bir hata oluştu: '.$e->getMessage()]);
        }
    }
}
