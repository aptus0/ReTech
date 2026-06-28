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
        // Here we would implement real cURL/SOAP requests to GIB Test or Prod API
        
        return [
            'success' => false,
            'message' => 'GİB İnteraktif Portal Entegrasyonu henüz aktif edilmedi.',
        ];
    }

    public function sendInvoice(Invoice $invoice): array
    {
        return [
            'success' => false,
            'status' => 'failed',
            'message' => 'GİB İnteraktif Portal Entegrasyonu henüz aktif edilmedi.',
        ];
    }

    public function checkStatus(Invoice $invoice): array
    {
        return [
            'success' => false,
            'status' => 'failed',
            'message' => 'GİB İnteraktif Portal Entegrasyonu henüz aktif edilmedi.',
        ];
    }

    public function cancelInvoice(Invoice $invoice, string $reason): array
    {
        return [
            'success' => false,
            'status' => 'failed',
            'message' => 'GİB İnteraktif Portal Entegrasyonu henüz aktif edilmedi.',
        ];
    }
}
