<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;

class SystemStatusController extends Controller
{
    public function index()
    {
        $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        
        // RAM Usage
        $ramPercent = 0;
        if ($isWindows) {
            @exec('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value', $output);
            if (!empty($output)) {
                $free = 0;
                $total = 0;
                foreach ($output as $line) {
                    if (strpos($line, 'FreePhysicalMemory') !== false) {
                        $free = explode('=', $line)[1] ?? 0;
                    }
                    if (strpos($line, 'TotalVisibleMemorySize') !== false) {
                        $total = explode('=', $line)[1] ?? 0;
                    }
                }
                if ($total > 0) {
                    $ramPercent = round((($total - $free) / $total) * 100, 1);
                }
            }
        } else {
            // Mac/Linux
            $free = shell_exec('free -m 2>/dev/null | grep Mem');
            if ($free) {
                $free_arr = explode(" ", preg_replace('/\s+/', ' ', $free));
                $total = $free_arr[1] ?? 0;
                $used = $free_arr[2] ?? 0;
                if ($total > 0) {
                    $ramPercent = round(($used / $total) * 100, 1);
                }
            } else {
                // macOS specific (vm_stat)
                $vm = shell_exec('vm_stat 2>/dev/null');
                if ($vm) {
                    preg_match('/Pages free:\s+(\d+)/', $vm, $freeMatch);
                    preg_match('/Pages active:\s+(\d+)/', $vm, $activeMatch);
                    $freePages = $freeMatch[1] ?? 0;
                    $activePages = $activeMatch[1] ?? 0;
                    $total = $freePages + $activePages;
                    if ($total > 0) {
                        $ramPercent = round(($activePages / $total) * 100, 1);
                    }
                }
            }
        }

        // CPU Usage
        $cpuPercent = 0;
        if (function_exists('sys_getloadavg')) {
            $load = sys_getloadavg();
            $cpuPercent = round($load[0] * 10, 1); // rough estimate
            if ($cpuPercent > 100) $cpuPercent = 100;
        }

        // Network IPs
        $internalIp = request()->getHost();
        if ($internalIp === '127.0.0.1' || $internalIp === 'localhost' || $internalIp === '::1') {
            if ($isWindows) {
                $internalIp = gethostbyname(gethostname());
            } else {
                $macIp = trim(shell_exec("ipconfig getifaddr en0 2>/dev/null"));
                $internalIp = $macIp ?: trim(shell_exec("hostname -I | awk '{print $1}' 2>/dev/null"));
            }
        }
        
        // External IP (cached for 10 minutes to avoid rate limits)
        $externalIp = \Illuminate\Support\Facades\Cache::remember('external_ip', 600, function () {
            try {
                return trim(file_get_contents('https://ifconfig.me/ip'));
            } catch (\Exception $e) {
                return 'Bulunamadı';
            }
        });

        return response()->json([
            'cpu' => $cpuPercent,
            'ram' => $ramPercent,
            'internal_ip' => $internalIp,
            'external_ip' => $externalIp
        ]);
    }
}
