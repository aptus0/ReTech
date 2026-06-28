<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
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
            'filters' => $request->only(['search', 'type'])
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

    public function show(Customer $customer)
    {
        return inertia('Customers/Show', [
            'customer' => $customer
        ]);
    }

    public function edit(Customer $customer)
    {
        return inertia('Customers/Edit', [
            'customer' => $customer
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
        $customer->update(['is_active' => !$customer->is_active]);

        return redirect()->back()
            ->with('success', 'Cari durumu güncellendi.');
    }
}
