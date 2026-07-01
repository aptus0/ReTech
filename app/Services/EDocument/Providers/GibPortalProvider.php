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

            $gibInvoice = new \Mlevent\Fatura\Models\InvoiceModel();
            
            // Map our invoice model to GIB invoice model
            $gibInvoice->setUuid((string) str()->uuid());
            $gibInvoice->setDocumentDate($invoice->date->format('d/m/Y'));
            $gibInvoice->setDocumentTime($invoice->date->format('H:i:s'));
            
            $gibInvoice->setRecipientName($invoice->customer->name ?? 'Nihai Tüketici');
            $gibInvoice->setRecipientId($invoice->customer->tax_number ?? '11111111111');
            $gibInvoice->setRecipientTaxOffice($invoice->customer->tax_office ?? 'Dairesiz');
            $gibInvoice->setRecipientAddress($invoice->customer->address ?? 'Adres Belirtilmedi');
            
            foreach ($invoice->items as $item) {
                $gibInvoiceItem = new \Mlevent\Fatura\Models\InvoiceItemModel();
                $gibInvoiceItem->setName($item->product->name ?? 'Ürün/Hizmet');
                $gibInvoiceItem->setQuantity($item->quantity);
                $gibInvoiceItem->setUnitPrice($item->unit_price);
                $gibInvoiceItem->setVatRate($item->tax_rate ?? 20);
                $gibInvoiceItem->setPrice($item->total);
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
