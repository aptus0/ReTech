<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SystemController extends Controller
{
    public function status(Request $request)
    {
        // CPU Load (sys_getloadavg is not available on Windows)
        if (function_exists('sys_getloadavg')) {
            $cpuLoad = sys_getloadavg();
            $cpuPercent = isset($cpuLoad[0]) ? round($cpuLoad[0] * 10, 1) : rand(10, 30);
        } else {
            $cpuPercent = rand(5, 25); // Mock for Windows
        }

        // Memory (Dummy for now)
        $ramPercent = rand(35, 65);

        return response()->json([
            'cpu' => $cpuPercent,
            'ram' => $ramPercent,
            'internal_ip' => $request->ip() === '::1' ? '127.0.0.1' : $request->ip(),
            'external_ip' => '176.88.99.100', // Mock external
            'time' => now()->format('H:i:s'),
        ]);
    }
}
