<?php

namespace App\Http\Controllers;

use App\Models\BarcodePrintQueue;
use Illuminate\Http\Request;

class BarcodePrintQueueWorkerController extends Controller
{
    public function pending()
    {
        $jobs = BarcodePrintQueue::where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get(['id', 'printer_name', 'connection_type', 'raw_command'])
            ->map(function ($job) {
                return [
                    'Id' => $job->id,
                    'PrinterName' => $job->printer_name,
                    'ConnectionType' => $job->connection_type,
                    'RawCommand' => $job->raw_command,
                ];
            });

        return response()->json([
            'Jobs' => $jobs
        ]);
    }

    public function complete(Request $request, $id)
    {
        $job = BarcodePrintQueue::find($id);
        if ($job) {
            $job->update(['status' => 'completed']);
            return response()->json(['success' => true]);
        }
        return response()->json(['success' => false], 404);
    }
}
