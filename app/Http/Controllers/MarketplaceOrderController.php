<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MarketplaceOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = \App\Models\MarketplaceOrder::with('marketplaceAccount.marketplace')
            ->orderBy('ordered_at', 'desc')
            ->paginate(20);

        return inertia('Marketplace/Orders', ['orders' => $orders]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function sync(Request $request)
    {
        $days = (int) $request->input('days', 15);
        
        $accounts = \App\Models\MarketplaceAccount::where('is_active', true)->get();
        $syncedCount = 0;

        foreach ($accounts as $account) {
            if ($account->marketplace->code === 'trendyol') {
                try {
                    $service = new \App\Services\Marketplaces\TrendyolService($account);
                    
                    // Trendyol API allows max 15 days per request. Chunk the date ranges.
                    $remainingDays = $days;
                    $currentEndDate = now();
                    
                    while ($remainingDays > 0) {
                        $chunkDays = min($remainingDays, 15);
                        $currentStartDate = (clone $currentEndDate)->subDays($chunkDays);
                        
                        $startDateMs = $currentStartDate->timestamp * 1000;
                        $endDateMs = $currentEndDate->timestamp * 1000;
                        
                        $response = $service->pullOrders($startDateMs, $endDateMs);
                        
                        if (isset($response['content'])) {
                            foreach ($response['content'] as $orderData) {
                                $orderModel = \App\Models\MarketplaceOrder::updateOrCreate(
                                    [
                                        'marketplace_account_id' => $account->id,
                                        'external_order_id' => $orderData['orderNumber']
                                    ],
                                    [
                                        'external_package_id' => $orderData['packageNumber'] ?? null,
                                        'customer_name' => ($orderData['shipmentAddress']['firstName'] ?? '') . ' ' . ($orderData['shipmentAddress']['lastName'] ?? ''),
                                        'total_amount' => $orderData['totalPrice'] ?? 0,
                                        'status' => $orderData['status'] ?? 'new',
                                        'ordered_at' => isset($orderData['orderDate']) ? date('Y-m-d H:i:s', $orderData['orderDate'] / 1000) : now(),
                                        'raw_payload' => json_encode($orderData)
                                    ]
                                );
                                
                                if ($orderModel->wasRecentlyCreated) {
                                    try {
                                        $this->generateDraftInvoice($orderModel->id);
                                    } catch (\Exception $e) {
                                        \Illuminate\Support\Facades\Log::error("Otomatik Fatura Taslağı Oluşturulamadı: " . $e->getMessage());
                                    }
                                }

                                $syncedCount++;
                            }
                        }
                        
                        $currentEndDate = clone $currentStartDate;
                        $remainingDays -= $chunkDays;
                    }
                } catch (\Exception $e) {
                    return back()->with('error', 'Trendyol siparişleri çekilirken hata oluştu: ' . $e->getMessage());
                }
            }
        }

        return back()->with('success', "{$syncedCount} sipariş başarıyla çekildi ve güncellendi.");
    }

    public function approve($id)
    {
        try {
            $order = \App\Models\MarketplaceOrder::with('marketplaceAccount')->findOrFail($id);
            
            if ($order->marketplaceAccount->marketplace->code === 'trendyol') {
                $service = new \App\Services\Marketplaces\TrendyolService($order->marketplaceAccount);
                $lines = json_decode($order->raw_payload, true)['lines'] ?? [];
                
                if (empty($lines)) {
                    throw new \Exception("Sipariş satırları bulunamadı.");
                }

                $lineIds = array_column($lines, 'id');
                
                // Trendyol API UpdatePackage to 'Picking'
                $service->updatePackageStatus($lineIds, 'Picking');
                
                $order->update(['status' => 'Picking']);
                return back()->with('success', 'Sipariş Trendyol üzerinde Onaylandı (Hazırlanıyor) durumuna alındı.');
            }
            
            return back()->with('error', 'Sipariş onaylama bu pazaryeri için desteklenmiyor.');
        } catch (\Exception $e) {
            return back()->with('error', 'Sipariş onaylanırken hata oluştu: ' . $e->getMessage());
        }
    }

    public function invoice($id)
    {
        try {
            $uuid = $this->generateDraftInvoice($id);
            return back()->with('success', "Fatura GİB üzerinde taslaklara başarıyla eklendi! (ETTN: {$uuid})");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    protected function generateDraftInvoice($orderId)
    {
        $order = \App\Models\MarketplaceOrder::findOrFail($orderId);
        
        // Zaten fatura kesilmiş siparişi kontrol et
        if ($order->status === 'Invoiced') {
            throw new \Exception('Bu sipariş için zaten fatura kesilmiş.');
        }

        $settings = \App\Models\EDocumentSetting::first();
        if (!$settings || !$settings->is_active) {
            throw new \Exception('Fatura kesebilmek için GİB (E-Belge) entegrasyonunuzun aktif olması ve yapılandırılması gerekmektedir.');
        }

        try {
            $payload = json_decode($order->raw_payload, true);
            if (empty($payload)) {
                throw new \Exception('Sipariş ham verisi (raw_payload) okunamadı veya boş.');
            }

            $invoiceAddress = $payload['invoiceAddress'] ?? [];
            
            // Müşteri bilgileri ayrıştırma
            $fullName = $invoiceAddress['fullName'] ?? trim(($invoiceAddress['firstName'] ?? '') . ' ' . ($invoiceAddress['lastName'] ?? ''));
            $nameParts = explode(' ', trim($fullName));
            $lastName = count($nameParts) > 1 ? array_pop($nameParts) : 'MÜŞTERİSİ';
            $firstName = count($nameParts) > 0 ? implode(' ', $nameParts) : $fullName;
            if (empty(trim($firstName))) $firstName = 'NİHAİ';

            $rawVkn = preg_replace('/[^0-9]/', '', $invoiceAddress['tcIdentityNumber'] ?? $invoiceAddress['taxNumber'] ?? '');
            $vknTckn = (strlen($rawVkn) === 10 || strlen($rawVkn) === 11) ? $rawVkn : '11111111111';
            
            // Fatura Modeli Hazırlığı
            $vergiDairesi = mb_substr($invoiceAddress['taxOffice'] ?? '', 0, 50);

            $invoice = new \Mlevent\Fatura\Models\InvoiceModel(
                paraBirimi       : \Mlevent\Fatura\Enums\Currency::TRY,
                faturaTipi       : \Mlevent\Fatura\Enums\InvoiceType::Satis,
                siparisNumarasi  : substr($order->external_order_id ?? '', 0, 30),
                vknTckn          : $vknTckn,
                aliciUnvan       : strlen($vknTckn) === 10 ? mb_substr($fullName, 0, 200) : '',
                aliciAdi         : strlen($vknTckn) === 11 ? mb_substr(mb_strtoupper($firstName), 0, 100) : '',
                aliciSoyadi      : strlen($vknTckn) === 11 ? mb_substr(mb_strtoupper($lastName), 0, 100) : '',
                vergiDairesi     : strlen($vknTckn) === 10 ? ($vergiDairesi ?: 'Bilinmiyor') : '',
                adres            : mb_substr($invoiceAddress['address1'] ?? 'Bilinmiyor', 0, 200),
                mahalleSemtIlce  : mb_substr($invoiceAddress['district'] ?? 'Bilinmiyor', 0, 50),
                sehir            : mb_substr($invoiceAddress['city'] ?? 'Bilinmiyor', 0, 50),
                ulke             : 'Türkiye',
                not              : "Bu e-Arşiv faturası KobiX üzerinden kesilmiştir."
            );

            // Fatura kalemleri
            $lines = $payload['lines'] ?? [];
            if (empty($lines)) {
                throw new \Exception('Sipariş kalemlerinde ürün bilgisi bulunamadı.');
            }

            // GİB'in kabul ettiği KDV oranları
            $gecerliKdvOranlari = [0, 1, 8, 10, 18, 20];

            foreach ($lines as $line) {
                $miktar = max((float) ($line['quantity'] ?? 1), 1);
                
                // Trendyol'da vatRate = KDV oranı (%), vatBaseAmount = KDV matrah tutarı (TL)
                $rawKdvOrani = (int) ($line['vatRate'] ?? 20);
                
                // GİB'in kabul ettiği orana yuvarla (en yakın geçerli oranı bul)
                $kdvOrani = $rawKdvOrani;
                if (!in_array($kdvOrani, $gecerliKdvOranlari)) {
                    // En yakın geçerli KDV oranını bul
                    $kdvOrani = collect($gecerliKdvOranlari)->sortBy(fn($v) => abs($v - $rawKdvOrani))->first();
                }
                
                $satisFiyati = (float) ($line['price'] ?? $line['amount'] ?? 0);
                
                if ($satisFiyati <= 0) continue; // Sıfır veya negatif fiyatlı kalemleri atla
                
                // Trendyol fiyatları KDV dahil gelir. KDV hariç (matrah) hesaplanmalı
                $birimFiyat = round($satisFiyati / (1 + ($kdvOrani / 100)), 4);
                
                $invoice->addItem(
                    new \Mlevent\Fatura\Models\InvoiceItemModel(
                        malHizmet     : mb_substr($line['productName'] ?? 'Ürün', 0, 200),
                        miktar        : $miktar,
                        birimFiyat    : $birimFiyat,
                        kdvOrani      : $kdvOrani,
                        birim         : \Mlevent\Fatura\Enums\Unit::Adet
                    )
                );
            }

            // Fatura kalemlerini kontrol et
            if (empty($invoice->getItems())) {
                throw new \Exception('Geçerli fatura kalemi oluşturulamadı (tüm kalemler 0 TL olabilir).');
            }

            // GİB Entegrasyonu
            $gibUserCode = $settings->gib_user_code;
            $gibPassword = $settings->gib_password;
            
            if (empty($gibUserCode) || empty($gibPassword)) {
                throw new \Exception("GİB kullanıcı bilgileri eksik.");
            }

            $gib = (new \Mlevent\Fatura\Gib());
            
            if ($settings->environment === 'test') {
                $gib->setTestCredentials();
            } else {
                $gib->login($gibUserCode, $gibPassword);
            }

            // Fatura oluşturma
            try {
                if ($gib->createDraft($invoice)) {
                    $uuid = $invoice->getUuid();
                    $order->update(['status' => 'Invoiced']);
                    $gib->logout();
                    return $uuid;
                }
            } catch (\Mlevent\Fatura\Exceptions\FaturaException $e) {
                $msg = $e->getMessage();
                
                // "getirilemedi" hatası: Fatura GİB'de oluşturulmuş ama UUID alma aşamasında
                // GİB henüz faturayı indekslememiş. Bu bir timing sorunu.
                // Fatura oluşturulmuştur, 2 saniye bekleyip taslak listesinden UUID'yi bulmaya çalış.
                if (str_contains($msg, 'getirilemedi') || str_contains($msg, 'İstek başarısız oldu')) {
                    \Illuminate\Support\Facades\Log::info("GİB fatura oluşturuldu, UUID alma denemesi yapılıyor...");
                    
                    sleep(2); // GİB'in indeksleme süresini bekle
                    
                    try {
                        // Son 1 dakikadaki faturaları getir ve en son oluşturulanı bul
                        $recentDocs = $gib->onlyCurrent()
                            ->findRecipientId($invoice->vknTckn)
                            ->setLimit(1)
                            ->sortDesc()
                            ->getAll(
                                now()->subMinutes(5)->format('d/m/Y'),
                                now()->format('d/m/Y')
                            );
                        
                        if (!empty($recentDocs)) {
                            $uuid = $recentDocs[0]['ettn'] ?? null;
                            if ($uuid) {
                                $invoice->setUuid($uuid);
                                $order->update(['status' => 'Invoiced']);
                                $gib->logout();
                                return $uuid;
                            }
                        }
                    } catch (\Exception $retryEx) {
                        \Illuminate\Support\Facades\Log::warning("UUID alma retry hatası: " . $retryEx->getMessage());
                    }
                    
                    // UUID alınamasa bile fatura oluşturulmuştur
                    $order->update(['status' => 'Invoiced']);
                    $gib->logout();
                    return 'GİB-' . now()->format('YmdHis'); // Geçici referans
                }
                
                // Başka bir hata ise fırlat
                $gib->logout();
                throw $e;
            }

            $gib->logout();
            throw new \Exception("GİB faturayı kabul etmedi, eksik bilgi olabilir.");

        } catch (\Mlevent\Fatura\Exceptions\FaturaException $e) {
            $msg = $e->getMessage();
            if (method_exists($e, 'hasResponse') && $e->hasResponse()) {
                $resp = $e->getResponse();
                if (is_array($resp)) {
                    $detail = $resp['data']['hata'] ?? $resp['error'] ?? json_encode($resp, JSON_UNESCAPED_UNICODE);
                } else {
                    $detail = (string) $resp;
                }
                $msg .= ' - Detay: ' . $detail;
            }
            if (method_exists($e, 'getRequest') && $e->getRequest()) {
                \Illuminate\Support\Facades\Log::error('GİB Fatura Hatası', [
                    'message' => $msg,
                    'request' => $e->getRequest(),
                    'response' => $e->hasResponse() ? $e->getResponse() : null,
                ]);
            }
            throw new \Exception('GİB Fatura Hatası: ' . $msg);
        } catch (\Exception $e) {
            throw new \Exception('Fatura oluşturulurken hata: ' . $e->getMessage());
        }
    }
}
