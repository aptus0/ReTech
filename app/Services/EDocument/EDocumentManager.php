<?php

namespace App\Services\EDocument;

use App\Models\EDocumentSetting;
use App\Services\EDocument\Contracts\EDocumentProviderInterface;
use App\Services\EDocument\Providers\GibPortalProvider;
use App\Services\EDocument\Providers\MockProvider;
use Exception;

class EDocumentManager
{
    protected EDocumentSetting $setting;

    public function __construct()
    {
        $setting = EDocumentSetting::first();
        
        if (!$setting) {
            throw new Exception("e-Belge ayarları bulunamadı. Lütfen önce ayarları yapılandırın.");
        }

        $this->setting = $setting;
    }

    /**
     * Get the active provider instance based on settings.
     */
    public function provider(): EDocumentProviderInterface
    {
        if (!$this->setting->is_active) {
            throw new Exception("e-Belge entegrasyonu aktif değil.");
        }

        switch ($this->setting->provider) {
            case 'gib_portal':
                return new GibPortalProvider($this->setting);
            case 'mock':
                return new MockProvider($this->setting);
            case 'gib_direct':
            case 'private_integrator':
                throw new Exception("Seçili sağlayıcı ({$this->setting->provider}) henüz implement edilmedi.");
            default:
                return new MockProvider($this->setting);
        }
    }
}
