<?php

namespace App\Http\Controllers;

use App\Models\BarcodePrinter;
use App\Models\BarcodeSchema;
use App\Models\Product;
use App\Services\Barcode\BarcodePrintService;
use Illuminate\Http\Request;

class BarcodePrintController extends Controller
{
    public function products(Request $request)
    {
        $selectedIds = [];
        if ($request->has('ids')) {
            $selectedIds = explode(',', $request->input('ids'));
        }

        return inertia('BarcodePrint/Products', [
            'printers' => BarcodePrinter::where('is_active', true)->get(),
            'schemas' => BarcodeSchema::where('is_active', true)->get(),
            'default_schema' => BarcodeSchema::where('is_default', true)->first(),
            'default_printer' => BarcodePrinter::where('is_default', true)->first(),
            'products' => Product::orderBy('name')->get(),
            'selectedIds' => $selectedIds,
        ]);
    }

    public function quick()
    {
        return inertia('BarcodePrint/Quick', [
            'printers' => BarcodePrinter::where('is_active', true)->get(),
            'schemas' => BarcodeSchema::where('is_active', true)->get(),
            'default_schema' => BarcodeSchema::where('is_default', true)->first(),
            'default_printer' => BarcodePrinter::where('is_default', true)->first(),
        ]);
    }

    public function raw(Request $request, BarcodePrintService $printService)
    {
        $validated = $request->validate([
            'printer_id' => 'required|exists:barcode_printers,id',
            'schema_id' => 'required|exists:barcode_schemas,id',
            'items' => 'nullable|array',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.copies' => 'required_with:items|integer|min:1',
            'barcode' => 'nullable|string',
            'quantity' => 'nullable|integer|min:1',
        ]);

        try {
            $printer = BarcodePrinter::findOrFail($validated['printer_id']);
            $schema = BarcodeSchema::with('items')->findOrFail($validated['schema_id']);

            $printItems = [];

            if (! empty($validated['items'])) {
                foreach ($validated['items'] as $item) {
                    $product = Product::findOrFail($item['product_id']);
                    $printItems[] = [
                        'data' => [
                            'product_name' => $product->name,
                            'product_code' => $product->code ?? $product->barcode ?? $product->id,
                            'price' => number_format($product->sale_price, 2, ',', '.').' TL',
                            'company_name' => $schema->company_name ?: 'KARACA TİCARET',
                        ],
                        'copies' => $item['copies'],
                    ];
                }
            } elseif (! empty($validated['barcode'])) {
                $product = Product::where('barcode', $validated['barcode'])
                    ->orWhere('code', $validated['barcode'])
                    ->first();

                if (! $product) {
                    return response()->json(['success' => false, 'message' => 'Ürün bulunamadı'], 404);
                }

                $printItems[] = [
                    'data' => [
                        'product_name' => $product->name,
                        'product_code' => $product->code ?? $product->barcode ?? $product->id,
                        'price' => number_format($product->sale_price, 2, ',', '.').' TL',
                        'company_name' => $schema->company_name ?: 'KARACA TİCARET',
                    ],
                    'copies' => $validated['quantity'] ?? 1,
                ];
            } else {
                return response()->json(['success' => false, 'message' => 'Items veya barcode gönderilmelidir.'], 422);
            }

            $rawCommand = $printService->generateRawCommands($printer, $schema, $printItems);

            $printerName = $printer->printer_name;

            // Save to Print Queue instead of direct printing
            $queueIds = [];
            
            // We can either create 1 queue record with all commands, or if it's already a single string, just 1 record.
            $queue = \App\Models\BarcodePrintQueue::create([
                'printer_name' => $printerName,
                'connection_type' => $printer->connection_type, // 'USB' or 'COM'
                'raw_command' => $rawCommand,
                'status' => 'pending',
                'product_id' => $product->id ?? null,
                'copies' => $validated['quantity'] ?? 1,
            ]);
            
            $queueIds[] = $queue->id;

            return response()->json([
                'success' => true,
                'raw_command' => $rawCommand,
                'product' => $product ?? null,
                'printer_name' => $printerName,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
