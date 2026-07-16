<?php

namespace App\Http\Controllers;

use App\Models\EDocumentLog;
use App\Models\EDocumentSetting;
use App\Models\Invoice;
use App\Models\Setting;
use App\Services\EDocument\EDocumentManager;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with('customer')
            ->where('grand_total', '>', 0)
            ->orderBy('created_at', 'desc');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhere('e_document_no', 'like', "%{$search}%")
                    ->orWhere('id', $search) // Allow searching by ID from OpenTransactions link
                    ->orWhereHas('customer', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%")
                            ->orWhere('tax_number', 'like', "%{$search}%");
                    });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('e_document_status', $status);
        }

        $invoices = $query->paginate(20)->withQueryString();

        $statsQuery = Invoice::where('grand_total', '>', 0);
        $stats = [
            'total' => (clone $statsQuery)->count(),
            'sent' => (clone $statsQuery)->where('e_document_status', 'sent')->count(),
            'accepted' => (clone $statsQuery)->where('e_document_status', 'accepted')->count(),
            'failed' => (clone $statsQuery)->where('e_document_status', 'failed')->count(),
            'draft' => (clone $statsQuery)->where('e_document_status', 'draft')->count(),
        ];

        return Inertia::render('EDocuments/Index', [
            'invoices' => $invoices,
            'filters' => $request->only('search', 'status'),
            'stats' => $stats,
        ]);
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['customer', 'items', 'cashMovements.register']);

        $logoUrl = Setting::get('store_logo');
        $logoBase64 = null;
        if ($logoUrl) {
            try {
                // Determine if it's a relative path or absolute URL
                $fetchUrl = $logoUrl;
                if (!filter_var($logoUrl, FILTER_VALIDATE_URL)) {
                    $fetchUrl = public_path($logoUrl);
                }

                $logoData = @file_get_contents($fetchUrl);
                if ($logoData) {
                    $type = pathinfo($fetchUrl, PATHINFO_EXTENSION);
                    if (!$type) $type = 'png';
                    $logoBase64 = 'data:image/' . $type . ';base64,' . base64_encode($logoData);
                } else {
                    $logoBase64 = $logoUrl;
                }
            } catch (\Exception $e) {
                $logoBase64 = $logoUrl;
            }
        }

        return Inertia::render('EDocuments/Show', [
            'invoice' => $invoice,
            'companySettings' => [
                'company_name' => Setting::get('company_name', 'Bilinmeyen Firma'),
                'store_logo' => $logoBase64,
                'tax_office' => Setting::get('tax_office', ''),
                'tax_number' => Setting::get('tax_number', ''),
                'address' => Setting::get('address', ''),
                'district' => Setting::get('district', ''),
                'city' => Setting::get('city', ''),
                'phone' => Setting::get('phone', ''),
                'email' => Setting::get('email', ''),
                'website' => Setting::get('website', ''),
            ],
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

                return back()->with('success', 'e-Belge başarıyla gönderildi: '.($result['document_no'] ?? ''));
            } else {
                $invoice->update([
                    'e_document_status' => 'failed',
                    'e_document_error' => $result['message'],
                ]);

                // Log the failure
                $this->createLog($invoice, $result, 'send');

                return back()->withErrors(['error' => 'Gönderim hatası: '.$result['message']]);
            }
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gönderim hatası: '.$e->getMessage()]);
        }
    }

    public function checkStatus(Invoice $invoice, EDocumentManager $manager)
    {
        try {
            if (! $invoice->e_document_uuid) {
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

            return back()->with('success', 'Belge durumu güncellendi: '.$invoice->e_document_status);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Durum sorgulama hatası: '.$e->getMessage()]);
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

    public function fetchFromGib(Request $request)
    {
        $setting = EDocumentSetting::first();

        if (!$setting || empty($setting->gib_user_code)) {
            return response()->json(['success' => false, 'message' => 'GİB bilgileri eksik. Ayarlardan kontrol edin.'], 400);
        }

        try {
            $gib = new \Mlevent\Fatura\Gib();
            if ($setting->environment === 'test') {
                $gib->setTestCredentials();
            } else {
                $gib->login($setting->gib_user_code, $setting->gib_password);
            }

            // Son 30 günlük faturaları getir. (GİB tarafında tarih aralığı verilir)
            $startDate = now()->subDays(30)->format('d/m/Y');
            $endDate = now()->format('d/m/Y');

            // Kullanıcıya kesilen (gelen) veya kullanıcının kestiği (giden) faturalar
            $documents = $gib->getAll($startDate, $endDate);

            return response()->json(['success' => true, 'data' => $documents]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'GİB bağlantı hatası: ' . $e->getMessage()], 500);
        }
    }

    public function getGibHtml(Request $request, $uuid)
    {
        $setting = EDocumentSetting::first();

        if (!$setting || empty($setting->gib_user_code)) {
            return response()->json(['success' => false, 'message' => 'GİB bilgileri eksik.'], 400);
        }

        try {
            $gib = new \Mlevent\Fatura\Gib();
            if ($setting->environment === 'test') {
                $gib->setTestCredentials();
            } else {
                $gib->login($setting->gib_user_code, $setting->gib_password);
            }

            $html = $gib->getHtml($uuid, true); // true = signed
            return response()->json(['success' => true, 'html' => $html]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'HTML alınamadı: ' . $e->getMessage()], 500);
        }
    }
    public function startGibSign(Request $request)
    {
        $setting = EDocumentSetting::first();

        if (!$setting || empty($setting->gib_user_code)) {
            return response()->json(['success' => false, 'message' => 'GİB bilgileri eksik.'], 400);
        }

        try {
            $gib = new \Mlevent\Fatura\Gib();
            if ($setting->environment === 'test') {
                $gib->setTestCredentials();
            } else {
                $gib->login($setting->gib_user_code, $setting->gib_password);
            }

            $oid = $gib->startSmsVerification();

            if ($oid) {
                return response()->json(['success' => true, 'oid' => $oid]);
            } else {
                return response()->json(['success' => false, 'message' => 'SMS doğrulaması başlatılamadı. Telefon numaranız GİB Portalda kayıtlı olmayabilir.'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'SMS başlatma hatası: ' . $e->getMessage()], 500);
        }
    }

    public function completeGibSign(Request $request)
    {
        $setting = EDocumentSetting::first();

        $code = $request->input('code');
        $oid = $request->input('oid');
        $documents = $request->input('documents', []); // Array of ETTNs

        if (!$setting || empty($setting->gib_user_code) || !$code || !$oid || empty($documents)) {
            return response()->json(['success' => false, 'message' => 'Eksik parametreler.'], 400);
        }

        try {
            $gib = new \Mlevent\Fatura\Gib();
            if ($setting->environment === 'test') {
                $gib->setTestCredentials();
            } else {
                $gib->login($setting->gib_user_code, $setting->gib_password);
            }

            $result = $gib->completeSmsVerification($code, $oid, $documents);

            if ($result) {
                // If successful, generate PDF and upload to Trendyol in the background or right away
                dispatch(new \App\Jobs\PushSignedInvoicesToTrendyol($documents));

                return response()->json(['success' => true, 'message' => 'Faturalar başarıyla imzalandı.']);
            } else {
                return response()->json(['success' => false, 'message' => 'Hatalı SMS kodu veya onay başarısız.'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'SMS onay hatası: ' . $e->getMessage()], 500);
        }
    }
}
