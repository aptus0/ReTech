<?php

namespace App\Services\Sales;

use App\Models\CashMovement;
use App\Models\CashRegister;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\OpenTransaction;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class SaleService
{
    public function createSale(array $data)
    {
        return DB::transaction(function () use ($data) {
            $user_id = auth()->id();

            // 1. Fatura Başlığı (Invoice) Oluştur
            $invoice = Invoice::create([
                'customer_id' => $data['customer_id'] ?? null,
                'type' => 'sale',
                'invoice_number' => 'INV-'.strtoupper(uniqid()),
                'issue_date' => now(),
                'due_date' => $data['due_date'] ?? null,
                'subtotal' => $data['subtotal'],
                'tax_total' => $data['tax_total'],
                'discount_total' => $data['discount_total'] ?? 0,
                'grand_total' => $data['grand_total'],
                'status' => 'completed',
                'e_document_type' => $data['e_document_type'] ?? 'none',
                'created_by' => $user_id,
                'notes' => $data['notes'] ?? null,
            ]);

            // 2. Fatura Kalemleri (InvoiceItems) ve Stok Düşüşü
            foreach ($data['items'] as $item) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'tax_rate' => $item['tax_rate'] ?? 0,
                    'tax_amount' => $item['tax_amount'] ?? 0,
                    'discount_rate' => $item['discount_rate'] ?? 0,
                    'discount_amount' => $item['discount_amount'] ?? 0,
                    'total' => $item['total'],
                ]);

                // Stok Düşüşü
                if (! empty($item['product_id'])) {
                    $product = Product::find($item['product_id']);
                    if ($product) {
                        StockMovement::create([
                            'product_id' => $product->id,
                            'type' => 'out',
                            'quantity' => $item['quantity'],
                            'unit_price' => $item['unit_price'],
                            'document_type' => 'sale',
                            'document_no' => $invoice->invoice_number,
                            'description' => 'Satış Çıkışı - Fatura: '.$invoice->invoice_number,
                            'user_id' => $user_id,
                        ]);

                        $product->decrement('current_stock', $item['quantity']);
                    }
                }
            }

            // 3. Ödeme ve Cari Hareketleri
            $paymentType = $data['payment_type'] ?? 'cash'; // cash, credit, partial
            $cashAmount = $data['cash_amount'] ?? 0;
            $registerId = $data['register_id'] ?? null;
            $paymentMethodId = $data['payment_method_id'] ?? null;

            if ($data['customer_id']) {
                $customer = Customer::find($data['customer_id']);
                // Satış faturası müşterinin bakiyesini (borcunu) artırır.
                $customer->increment('balance', $data['grand_total']);
            }

            if ($paymentType === 'cash' || $paymentType === 'partial') {
                // Peşin veya Kısmi Tahsilat
                if ($cashAmount > 0 && $registerId) {
                    CashMovement::create([
                        'cash_register_id' => $registerId,
                        'account_id' => $data['customer_id'] ?? null,
                        'payment_method_id' => $paymentMethodId,
                        'type' => 'sale',
                        'amount' => $cashAmount,
                        'movement_date' => now(),
                        'source_type' => 'invoice',
                        'source_id' => $invoice->id,
                        'description' => 'Peşin Satış Tahsilatı - '.$invoice->invoice_number,
                        'created_by' => $user_id,
                    ]);

                    $register = CashRegister::find($registerId);
                    if ($register) {
                        $register->increment('current_balance', $cashAmount);
                    }

                    if ($data['customer_id']) {
                        // Kasa girişi kadar müşterinin borcu (bakiyesi) düşer
                        $customer = Customer::find($data['customer_id']);
                        $customer->decrement('balance', $cashAmount);
                    }
                }
            }

            // Vadeli (Açık İşlem) oluşacak tutar hesaplaması
            $remainingAmount = $data['grand_total'] - $cashAmount;

            if ($remainingAmount > 0 && $data['customer_id']) {
                OpenTransaction::create([
                    'account_id' => $data['customer_id'],
                    'invoice_id' => $invoice->id,
                    'type' => 'receivable', // Alacak (bizim alacağımız)
                    'amount' => $data['grand_total'],
                    'paid_amount' => $cashAmount,
                    'remaining_amount' => $remainingAmount,
                    'due_date' => $data['due_date'] ?? now()->addDays(30),
                    'status' => 'open',
                    'priority' => 'normal',
                    'note' => 'Satış Faturasından Kaynaklı',
                    'created_by' => $user_id,
                ]);
            }

            return $invoice;
        });
    }
}
