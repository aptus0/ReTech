<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MobileAppController extends Controller
{
    public function index(Request $request)
    {
        // In local development, HTTP_HOST is usually 127.0.0.1:8000
        $hostIp = $request->getHost();
        $port = $request->getPort();

        if ($hostIp === '127.0.0.1' || $hostIp === 'localhost' || $hostIp === '::1') {
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                $hostIp = gethostbyname(gethostname());
            } else {
                $macIp = trim(shell_exec('ipconfig getifaddr en0 2>/dev/null'));
                if ($macIp) {
                    $hostIp = $macIp;
                } else {
                    $linuxIp = trim(shell_exec("hostname -I | awk '{print $1}' 2>/dev/null"));
                    if ($linuxIp) {
                        $hostIp = explode(' ', $linuxIp)[0];
                    }
                }
            }
        }

        $serverIp = $port ? $hostIp.':'.$port : $hostIp;

        $user = $request->user();
        if ($user) {
            // Cache the plain text token forever so it doesn't change on every page reload
            $apiToken = Cache::rememberForever('mobile_app_token_'.$user->id, function () use ($user) {
                return $user->createToken('mobile-app')->plainTextToken;
            });
        } else {
            $apiToken = 'UNAUTHORIZED';
        }

        return inertia('settings/mobile-app', [
            'serverIp' => $serverIp,
            'apiToken' => $apiToken,
        ]);
    }
}
