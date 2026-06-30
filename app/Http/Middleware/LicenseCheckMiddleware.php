<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class LicenseCheckMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Don't block the license pages or login/logout
        $excludedRoutes = [
            'license.expired',
            'license.verify',
            'login',
            'logout',
            'password.request',
            'password.reset',
        ];

        if ($request->route() && in_array($request->route()->getName(), $excludedRoutes)) {
            return $next($request);
        }

        if (!Storage::exists('install_date.txt')) {
            Storage::put('install_date.txt', now()->toDateTimeString());
        }

        if (! Storage::exists('license.key')) {
            $installDate = \Carbon\Carbon::parse(Storage::get('install_date.txt'));
            $daysPassed = now()->diffInDays($installDate);
            $daysLeft = 14 - $daysPassed;

            if ($daysLeft <= 0) {
                // Sadece AJAX/Inertia değil, tüm normal web requestlerini de yönlendir
                return redirect()->route('license.expired');
            } else {
                if ($request->isMethod('get') && !$request->expectsJson() && !$request->routeIs('license.*')) {
                    session()->now('license_warning', "Sistemi deneme sürümünde kullanıyorsunuz. $daysLeft gün sonra erişim kilitlenecektir. Lütfen lisans satın alınız.");
                }
            }
        }

        // İsteğe bağlı: Dosyadaki key'in doğruluğunu da kontrol edebiliriz
        // $key = Storage::get('license.key');
        // if (strlen(trim($key)) !== 30) { ... }

        return $next($request);
    }
}
