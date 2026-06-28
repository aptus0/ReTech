<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SystemController extends Controller
{
    public function status(Request $request)
    {
        // CPU Load (Mac/Linux)
        $cpuLoad = sys_getloadavg();
        $cpuPercent = isset($cpuLoad[0]) ? round($cpuLoad[0] * 10, 1) : rand(10, 30);

        // Memory (Dummy for now as accurate mac memory via php is complex without shell commands)
        $ramPercent = rand(35, 65);

        return response()->json([
            'cpu' => $cpuPercent,
            'ram' => $ramPercent,
            'local_ip' => $request->ip(),
            'external_ip' => '176.88.99.100', // Mock external
            'time' => now()->format('H:i:s'),
        ]);
    }
}
