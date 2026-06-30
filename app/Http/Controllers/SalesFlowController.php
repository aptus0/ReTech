<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use App\Models\Customer;
use App\Models\Product;
use App\Services\Sales\SaleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesFlowController extends Controller
{
    public function index()
    {
        $products = Product::where('is_active', true)->get();
        $customers = Customer::where('is_active', true)->get();
        $registers = CashRegister::where('is_active', true)->get();

        return Inertia::render('SalesFlow/Index', [
            'products' => $products,
            'customers' => $customers,
            'registers' => $registers,
        ]);
    }

    public function store(Request $request, SaleService $saleService)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.product_name' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric',
            'tax_total' => 'required|numeric',
            'grand_total' => 'required|numeric',
            'payment_type' => 'required|in:cash,credit,partial',
            'cash_amount' => 'required_if:payment_type,cash,partial|numeric|min:0',
            'register_id' => 'required_if:payment_type,cash,partial|exists:cash_registers,id',
            'due_date' => 'nullable|date',
        ]);

        try {
            $invoice = $saleService->createSale($validated);

            return redirect()->route('e-documents.show', $invoice->id)->with('success', 'Satış başarıyla tamamlandı. Fatura No: '.$invoice->invoice_number);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Satış işlemi sırasında bir hata oluştu: '.$e->getMessage()]);
        }
    }
}
