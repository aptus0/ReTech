<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\CashRegister;
use App\Models\CashMovement;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('tax_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        $customers = $query->orderBy('name')->paginate(15)->withQueryString();

        return inertia('Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function create()
    {
        return inertia('Customers/Create');
    }

    public function store(StoreCustomerRequest $request)
    {
        Customer::create($request->validated());

        return redirect()->route('customers.index')
            ->with('success', 'Cari kart başarıyla oluşturuldu.');
    }

    public function apiStore(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());

        return response()->json([
            'success' => true,
            'customer' => $customer,
            'message' => 'Cari başarıyla oluşturuldu.'
        ]);
    }

    public function show(Customer $customer)
    {
        $customer->load('customerNotes.user');
        $cashMovements = CashMovement::where('account_id', $customer->id)->with('register')->latest('movement_date')->get();
        $registers = CashRegister::where('is_active', true)->get();
        $paymentMethods = \App\Models\PaymentMethod::where('is_active', true)->get();

        return inertia('Customers/Show', [
            'customer' => $customer,
            'cashMovements' => $cashMovements,
            'registers' => $registers,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function edit(Customer $customer)
    {
        return inertia('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());

        return redirect()->route('customers.index')
            ->with('success', 'Cari kart başarıyla güncellendi.');
    }

    public function destroy(Customer $customer)
    {
        // Actually soft-delete or just hide in a real ERP, but let's delete for now
        // if no movements exist. For this scope we just delete.
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Cari kart silindi.');
    }

    public function toggleStatus(Customer $customer)
    {
        $customer->update(['is_active' => ! $customer->is_active]);

        return redirect()->back()
            ->with('success', 'Cari durumu güncellendi.');
    }

    public function collect(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'cash_register_id' => 'required|exists:cash_registers,id',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'description' => 'nullable|string',
            'movement_date' => 'required|date',
        ]);

        $customer->balance -= $validated['amount'];
        $customer->save();

        CashMovement::create([
            'cash_register_id' => $validated['cash_register_id'],
            'account_id' => $customer->id,
            'payment_method_id' => $validated['payment_method_id'],
            'type' => 'in',
            'amount' => $validated['amount'],
            'description' => $validated['description'],
            'source_type' => Customer::class,
            'source_id' => $customer->id,
            'created_by' => $request->user()->id,
            'movement_date' => $validated['movement_date'],
        ]);

        return redirect()->back()->with('success', 'Tahsilat başarıyla alındı.');
    }
}
