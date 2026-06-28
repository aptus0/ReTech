<?php

namespace App\Services\EDocument\Providers;

use App\Models\EDocumentSetting;
use App\Models\Invoice;
use App\Services\EDocument\Contracts\EDocumentProviderInterface;
use Illuminate\Support\Str;

class MockProvider implements EDocumentProviderInterface
{
    protected EDocumentSetting $setting;

    public function __construct(EDocumentSetting $setting)
    {
        $this->setting = $setting;
    }

    public function testConnection(): array
    {
        // Simulate network delay
        sleep(1);

        if (!$this->setting->gib_user_code || !$this->setting->gib_password) {
            return [
                'success' => false,
                'message' => 'GİB Kullanıcı Kodu veya Şifre eksik.',
            ];
        }

        return [
            'success' => true,
            'message' => "Mock Provider: {$this->setting->company_title} için bağlantı başarılı.",
        ];
    }

    public function sendInvoice(Invoice $invoice): array
    {
        $uuid = (string) Str::uuid();
        $prefix = $this->setting->invoice_prefix ?: 'GIB';
        $number = $prefix . date('Y') . str_pad(rand(1, 99999), 9, '0', STR_PAD_LEFT);

        return [
            'success' => true,
            'status' => 'sent',
            'uuid' => $uuid,
            'document_no' => $number,
            'message' => 'Fatura başarıyla Mock GİB ortamına gönderildi.',
        ];
    }

    public function checkStatus(Invoice $invoice): array
    {
        return [
            'success' => true,
            'status' => 'accepted',
            'message' => 'Fatura GİB tarafından onaylanmıştır.',
        ];
    }

    public function cancelInvoice(Invoice $invoice, string $reason): array
    {
        return [
            'success' => true,
            'status' => 'cancelled',
            'message' => 'Fatura Mock GİB ortamında iptal edildi.',
        ];
    }
}
