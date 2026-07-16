<?php

namespace App\Services\EDocument\Providers;

use App\Models\EDocumentSetting;
use App\Models\Invoice;
use App\Services\EDocument\Contracts\EDocumentProviderInterface;

class GibPortalProvider implements EDocumentProviderInterface
{
    protected EDocumentSetting $setting;

    public function __construct(EDocumentSetting $setting)
    {
        $this->setting = $setting;
    }

    public function testConnection(): array
    {
        if (empty($this->setting->gib_user_code) || empty($this->setting->gib_password)) {
            return [
                'success' => false,
                'message' => 'Lütfen GİB kullanıcı kodu ve şifrenizi girip kaydedin.',
            ];
        }

        try {
            $gib = new \Mlevent\Fatura\Gib();
            
            if ($this->setting->environment === 'test') {
                $gib->setTestCredentials();
            } else {
                $gib->login($this->setting->gib_user_code, $this->setting->gib_password);
            }

            return [
                'success' => true,
                'message' => 'GİB İnteraktif Portal bağlantısı başarılı.',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Bağlantı hatası: ' . $e->getMessage(),
            ];
        }
    }

    public function sendInvoice(Invoice $invoice): array
    {
        if (! $this->setting->is_active) {
            return [
                'success' => false,
                'status' => 'failed',
                'message' => 'e-Belge entegrasyonu aktif değil.',
            ];
        }

        try {
            $gib = new \Mlevent\Fatura\Gib();
            
            if ($this->setting->environment === 'test') {
                $gib->setTestCredentials();
            } else {
                $gib->login($this->setting->gib_user_code, $this->setting->gib_password);
            }

            $nameParts = explode(' ', $invoice->customer->name ?? 'Nihai Tüketici');
            $surname = count($nameParts) > 1 ? array_pop($nameParts) : 'Tüketici';
            $name = implode(' ', $nameParts);

            $gibInvoice = new \Mlevent\Fatura\Models\InvoiceModel(
                vknTckn: $invoice->customer->tax_number ?? '11111111111',
                aliciAdi: $name,
                aliciSoyadi: $surname,
                mahalleSemtIlce: $invoice->customer->district ?? 'Belirtilmedi',
                sehir: $invoice->customer->city ?? 'Belirtilmedi',
                ulke: 'Türkiye',
                adres: $invoice->customer->address ?? 'Adres Belirtilmedi',
                tarih: $invoice->date->format('d/m/Y'),
                saat: $invoice->date->format('H:i:s'),
                vergiDairesi: $invoice->customer->tax_office ?? '',
                not: 'Fatura No: ' . $invoice->invoice_number,
            );
            
            $gibInvoice->setUuid((string) str()->uuid());
            
            foreach ($invoice->items as $item) {
                $gibInvoiceItem = new \Mlevent\Fatura\Models\InvoiceItemModel(
                    malHizmet: $item->product->name ?? 'Ürün/Hizmet',
                    miktar: $item->quantity,
                    birimFiyat: $item->unit_price,
                    kdvOrani: $item->tax_rate ?? 20,
                    birim: \Mlevent\Fatura\Enums\Unit::Adet
                );
                $gibInvoice->addItem($gibInvoiceItem);
            }

            // Mükellef olmayanlara e-Arşiv oluşturuyoruz.
            if ($gib->createDraft($gibInvoice)) {
                return [
                    'success' => true,
                    'status' => 'draft',
                    'message' => 'Fatura başarıyla GİB Portal\'a taslak olarak iletildi.',
                    'document_uuid' => $gibInvoice->getUuid(),
                ];
            }

            return [
                'success' => false,
                'status' => 'failed',
                'message' => 'Fatura taslağı oluşturulamadı.',
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'status' => 'failed',
                'message' => 'GİB Hatası: ' . $e->getMessage(),
            ];
        }
    }

    public function checkStatus(Invoice $invoice): array
    {
        return [
            'success' => false,
            'status' => 'failed',
            'message' => 'Manuel onaylama gereklidir. Lütfen GİB Portal\'dan faturanızı onaylayınız.',
        ];
    }

    public function cancelInvoice(Invoice $invoice, string $reason): array
    {
        // Cancel logic can be implemented using $gib->cancellationRequest
        return [
            'success' => false,
            'status' => 'failed',
            'message' => 'İptal işlemi şu anda yalnızca GİB Portal üzerinden yapılabilmektedir.',
        ];
    }
}
