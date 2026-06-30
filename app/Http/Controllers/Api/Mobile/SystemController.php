<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;

class SystemController extends Controller
{
    public function ping()
    {
        return response()->json([
            'success' => true,
            'app' => 'Re Tech',
            'server' => 'Local Server',
            'version' => '1.0.0',
            'time' => now()->toDateTimeString()
        ]);
    }
}
