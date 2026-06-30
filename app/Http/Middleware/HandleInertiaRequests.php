<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $licenseInfo = [
            'is_trial' => false,
            'is_active' => true,
        ];

        if (! \Illuminate\Support\Facades\Storage::exists('license.key')) {
            $installDateStr = \Illuminate\Support\Facades\Storage::exists('install_date.txt') 
                ? \Illuminate\Support\Facades\Storage::get('install_date.txt') 
                : now()->toDateTimeString();
            $installDate = \Carbon\Carbon::parse($installDateStr);
            $daysPassed = now()->diffInDays($installDate);
            $daysLeft = 14 - $daysPassed;
            $licenseInfo = [
                'is_trial' => true,
                'is_active' => $daysLeft > 0,
                'days_left' => $daysLeft > 0 ? $daysLeft : 0,
                'total_days' => 14,
                'type' => 'Deneme Sürümü (Trial)',
            ];
        } else {
            // Lisans varsa
            if (\Illuminate\Support\Facades\Storage::exists('license_expires_at.txt')) {
                $expiresAt = \Carbon\Carbon::parse(\Illuminate\Support\Facades\Storage::get('license_expires_at.txt'));
                $daysLeft = now()->diffInDays($expiresAt, false); // false for negative if expired
                $licenseInfo = [
                    'is_trial' => false,
                    'is_active' => $daysLeft > 0,
                    'days_left' => $daysLeft > 0 ? (int)$daysLeft : 0,
                    'expires_at' => $expiresAt->format('d.m.Y'),
                    'type' => 'Abonelik',
                ];
            } else {
                $licenseInfo = [
                    'is_trial' => false,
                    'is_active' => true,
                    'type' => 'Ömür Boyu (Lifetime)',
                ];
            }
        }

        return [
            ...parent::share($request),
            'license' => $licenseInfo,
            'auth' => [
                'user' => $request->user(),
            ],
            'name' => config('app.name', 'Re Tech Terminal'),
            'store_name' => Setting::get('store_name', 'Re Tech Terminal'),
            'store_logo' => Setting::get('store_logo'),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'license_warning' => fn () => $request->session()->get('license_warning'),
            ],
        ];
    }
}
