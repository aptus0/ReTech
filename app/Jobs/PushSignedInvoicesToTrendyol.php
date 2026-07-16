<?php

namespace App\Jobs;

use App\Models\MarketplaceOrder;
use App\Models\EDocumentSetting;
use App\Services\Marketplaces\TrendyolService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PushSignedInvoicesToTrendyol implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120; // 2 minutes

    protected array $documents;

    /**
     * Create a new job instance.
     * $documents is an array of ETTN (UUIDs)
     */
    public function __construct(array $documents)
    {
        $this->documents = $documents;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $setting = EDocumentSetting::first();
        if (!$setting || empty($setting->gib_user_code)) {
            Log::error("GİB ayarları eksik olduğu için Trendyol'a PDF gönderilemedi.");
            return;
        }

        $gib = new \Mlevent\Fatura\Gib();
        if ($setting->environment === 'test') {
            $gib->setTestCredentials();
        } else {
            $gib->login($setting->gib_user_code, $setting->gib_password);
        }

        foreach ($this->documents as $uuid) {
            try {
                // Find order by uuid in payload or we can search if any order has this UUID.
                // Wait, the UUID is stored in MarketplaceOrder when drafted? No! 
                // MarketplaceOrder doesn't store the ETTN. Actually, in `MarketplaceOrderController::invoice`, it just returns back(). 
                // Let's find the order by parsing the HTML or we need to link the order ID and ETTN!
                // Ah, wait! The GİB API returns `belgeNumarasi`, `aliciVknTckn` etc. 
                // Let's fetch the document details to see siparisNumarasi.
                
                $html = $gib->getHtml($uuid, true);
                
                // We need to parse Sipariş No from the HTML or from $gib->getDocument($uuid)
                $docDetails = $gib->getDocument($uuid);
                // $docDetails is usually an array, but we can't be sure it contains siparisNumarasi directly.
                // Wait, let's just generate the PDF first.
                
                $pdfPath = storage_path('app/public/invoices/fatura_' . $uuid . '.pdf');
                
                if (!file_exists(storage_path('app/public/invoices'))) {
                    mkdir(storage_path('app/public/invoices'), 0755, true);
                }

                // Generates PDF using dompdf
                Pdf::loadHTML($html)->setPaper('a4', 'portrait')->save($pdfPath);

                // Find the associated MarketplaceOrder
                // Since we set $invoice->siparisNumarasi = substr($order->external_order_id, 0, 30)
                // Let's parse sipariş no from HTML
                preg_match('/<td[^>]*>Sipariş\s*Numarası\s*<\/td>.*?<td[^>]*>(.*?)<\/td>/is', $html, $matches);
                if (!isset($matches[1])) {
                    Log::error("Trendyol sipariş numarası GİB HTML'inden bulunamadı: " . $uuid);
                    continue;
                }

                $orderNumber = trim(strip_tags($matches[1]));

                if ($orderNumber) {
                    $order = MarketplaceOrder::where('external_order_id', $orderNumber)->first();
                    
                    if ($order && $order->marketplaceAccount->marketplace->code === 'trendyol') {
                        $service = new TrendyolService($order->marketplaceAccount);
                        
                        $payload = json_decode($order->raw_payload, true);
                        $packageId = $payload['packageNumber'] ?? $payload['shipmentPackageId'] ?? null;
                        
                        if ($packageId) {
                            $service->uploadInvoiceFile($packageId, $pdfPath, 'GIB' . substr($uuid, 0, 13), time() * 1000);
                            
                            $order->update(['status' => 'Invoiced']);
                            Log::info("Trendyol'a fatura başarıyla gönderildi: " . $orderNumber);
                        }
                    }
                }

            } catch (\Exception $e) {
                Log::error("Trendyol PDF gönderim hatası ($uuid): " . $e->getMessage());
            }
        }
        
        $gib->logout();
    }
}
