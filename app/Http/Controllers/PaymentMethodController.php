<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentMethodRequest;
use App\Http\Requests\UpdatePaymentMethodRequest;
use App\Models\CashMovement;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    public function index(Request $request)
    {
        $methods = PaymentMethod::orderBy('name')->get();

        return inertia('Finance/PaymentMethods/Index', [
            'methods' => $methods,
        ]);
    }

    public function create()
    {
        return inertia('Finance/PaymentMethods/Create');
    }

    public function store(StorePaymentMethodRequest $request)
    {
        PaymentMethod::create($request->validated());

        return redirect()->route('payment-methods.index')->with('success', 'Ödeme tipi eklendi.');
    }

    public function edit(PaymentMethod $paymentMethod)
    {
        return inertia('Finance/PaymentMethods/Edit', [
            'method' => $paymentMethod,
        ]);
    }

    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod)
    {
        $paymentMethod->update($request->validated());

        return redirect()->route('payment-methods.index')->with('success', 'Ödeme tipi güncellendi.');
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        // Don't delete if used in cash movements
        if (CashMovement::where('payment_method_id', $paymentMethod->id)->exists()) {
            return redirect()->back()->withErrors('Bu ödeme tipi hareketlerde kullanıldığı için silinemez.');
        }

        $paymentMethod->delete();

        return redirect()->route('payment-methods.index')->with('success', 'Ödeme tipi silindi.');
    }
}
