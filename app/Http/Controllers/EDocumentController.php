<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Invoice;
use App\Models\EDocumentLog;
use App\Models\EDocumentSetting;
use App\Services\EDocument\EDocumentManager;

class EDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with('customer')->orderBy('created_at', 'desc');

        if ($search = $request->input('search')) {
            $query->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('e_document_no', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('tax_number', 'like', "%{$search}%");
                  });
        }

        if ($status = $request->input('status')) {
            $query->where('e_document_status', $status);
        }

        $invoices = $query->paginate(20)->withQueryString();

        $stats = [
            'total' => Invoice::count(),
            'sent' => Invoice::where('e_document_status', 'sent')->count(),
            'accepted' => Invoice::where('e_document_status', 'accepted')->count(),
            'failed' => Invoice::where('e_document_status', 'failed')->count(),
            'draft' => Invoice::where('e_document_status', 'draft')->count(),
        ];
            
        return Inertia::render('EDocuments/Index', [
            'invoices' => $invoices,
            'filters' => $request->only('search', 'status'),
            'stats' => $stats
        ]);
    }

    public function send(Invoice $invoice, EDocumentManager $manager)
    {
        try {
            if (in_array($invoice->e_document_status, ['sent', 'accepted'])) {
                return back()->withErrors(['error' => 'Bu fatura zaten GİB\'e gönderilmiş.']);
            }

            $provider = $manager->provider();
            $result = $provider->sendInvoice($invoice);

            if ($result['success']) {
                $invoice->update([
                    'e_document_status' => $result['status'],
                    'e_document_uuid' => $result['uuid'] ?? null,
                    'e_document_no' => $result['document_no'] ?? null,
                    'e_document_sent_at' => now(),
                    'e_document_response' => $result['message'],
                    'e_document_error' => null,
                ]);

                // Log the success
                $this->createLog($invoice, $result, 'send');

                return back()->with('success', 'e-Belge başarıyla gönderildi: ' . ($result['document_no'] ?? ''));
            } else {
                $invoice->update([
                    'e_document_status' => 'failed',
                    'e_document_error' => $result['message']
                ]);

                // Log the failure
                $this->createLog($invoice, $result, 'send');

                return back()->withErrors(['error' => 'Gönderim hatası: ' . $result['message']]);
            }
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gönderim hatası: ' . $e->getMessage()]);
        }
    }

    public function checkStatus(Invoice $invoice, EDocumentManager $manager)
    {
        try {
            if (!$invoice->e_document_uuid) {
                return back()->withErrors(['error' => 'Faturaya ait UUID bulunamadı, önce GİB\'e gönderilmelidir.']);
            }

            $provider = $manager->provider();
            $result = $provider->checkStatus($invoice);

            if ($result['success']) {
                $invoice->update([
                    'e_document_status' => $result['status'],
                    'e_document_response' => $result['message'],
                ]);
            } else {
                $invoice->update([
                    'e_document_error' => $result['message'],
                ]);
            }

            // Log status check
            $this->createLog($invoice, $result, 'status_check');

            return back()->with('success', 'Belge durumu güncellendi: ' . $invoice->e_document_status);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Durum sorgulama hatası: ' . $e->getMessage()]);
        }
    }

    protected function createLog(Invoice $invoice, array $result, string $actionType)
    {
        $setting = EDocumentSetting::first();
        
        EDocumentLog::create([
            'invoice_id' => $invoice->id,
            'document_type' => $invoice->e_document_type,
            'provider' => $setting ? $setting->provider : 'unknown',
            'environment' => $setting ? $setting->environment : 'unknown',
            'status' => $result['status'] ?? 'failed',
            'request_payload' => ['action' => $actionType, 'invoice_no' => $invoice->invoice_number],
            'response_payload' => $result,
            'gib_uuid' => $result['uuid'] ?? $invoice->e_document_uuid,
            'gib_document_no' => $result['document_no'] ?? $invoice->e_document_no,
            'error_message' => $result['success'] ? null : ($result['message'] ?? 'Unknown Error'),
            'sent_at' => $actionType === 'send' ? now() : $invoice->e_document_sent_at,
            'checked_at' => now(),
        ]);
    }
}
