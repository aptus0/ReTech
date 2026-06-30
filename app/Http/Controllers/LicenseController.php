<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LicenseController extends Controller
{
    public function expired(Request $request)
    {
        if (Storage::exists('license.key')) {
            return redirect()->route('dashboard');
        }

        // Caydırıcı loglama simülasyonu
        Log::warning('LICENSE EXPIRED: Unauthorized access attempt detected.', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toDateTimeString(),
        ]);

        return Inertia::render('License/Expired', [
            'client_ip' => $request->ip(),
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'license_key' => 'required|string|size:30',
        ]);

        $key = $request->input('license_key');

        // Basit bir simülasyon: Girilen 30 haneli key'i doğrudan kaydediyoruz.
        // İstenirse burada ekstra şifre çözme/kontrol yapılabilir.
        Storage::put('license.key', $key);

        return redirect()->route('dashboard')->with('success', 'Lisans başarıyla doğrulandı. Sistem tekrar aktif.');
    }
}
