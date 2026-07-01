<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
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
        // If someone verifies a key manually, let's just make it a lifetime key for now
        if (Storage::exists('license_expires_at.txt')) {
            Storage::delete('license_expires_at.txt');
        }

        return redirect()->route('dashboard')->with('success', 'Lisans başarıyla doğrulandı. Sistem tekrar aktif.');
    }

    public function purchase()
    {
        $pendingRequest = null;
        if (Storage::exists('license_pending.json')) {
            $pendingRequest = json_decode(Storage::get('license_pending.json'), true);
        }

        return Inertia::render('License/Purchase', [
            'is_expired' => ! Storage::exists('license.key') && (14 - now()->diffInDays(Carbon::parse(Storage::get('install_date.txt')))) <= 0,
            'pending_request' => $pendingRequest,
        ]);
    }

    public function processPurchase(Request $request)
    {
        $request->validate([
            'plan' => 'required|string|in:monthly,yearly,lifetime,annual',
            'phone' => 'required|string|min:10',
        ]);

        // Simulating sending the request to admin
        Storage::put('license_pending.json', json_encode([
            'status' => 'pending',
            'phone' => $request->input('phone'),
            'timestamp' => now()->timestamp,
        ]));

        return redirect()->route('license.purchase');
    }
}
