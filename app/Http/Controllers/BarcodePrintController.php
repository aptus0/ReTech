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

            if (!empty($validated['items'])) {
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
            } elseif (!empty($validated['barcode'])) {
                $product = Product::where('barcode', $validated['barcode'])
                    ->orWhere('code', $validated['barcode'])
                    ->first();

                if (!$product) {
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

            // Print directly via USB
            $printerName = $printer->printer_name;
            $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
            
            if ($isWindows) {
                // Windows Printer Check via CMD
                $wmicQuery = 'wmic printer where "Name=\'' . str_replace("'", "", $printerName) . '\'" get Name,PortName,PrinterState,PrinterStatus 2>&1';
                $checkPrinter = shell_exec($wmicQuery);
                
                // If wmic returns "No Instance(s) Available." or doesn't find the name
                if (strpos($checkPrinter, 'No Instance') !== false || stripos($checkPrinter, $printerName) === false) {
                     return response()->json([
                         'success' => false,
                         'message' => 'Yazıcı Windows Driverları arasında bulunamadı: ' . $printerName
                     ], 500);
                }
                
                // If it's found, check if it's on USB or COM
                if (stripos($checkPrinter, 'USB') === false && stripos($checkPrinter, 'COM') === false) {
                     return response()->json([
                         'success' => false,
                         'message' => 'Yazıcı USB veya COM portuna bağlı değil: ' . $printerName
                     ], 500);
                }
                
                $tmpFile = tempnam(sys_get_temp_dir(), 'print_');
                file_put_contents($tmpFile, $rawCommand);
                // Print using copy command in Windows
                exec("copy /B " . escapeshellarg($tmpFile) . " " . escapeshellarg("\\\\localhost\\" . $printerName));
                @unlink($tmpFile);
                
            } else {
                // Mac/Linux Printer Check
                $checkPrinter = shell_exec("lpstat -p " . escapeshellarg($printerName) . " 2>&1");
                if (strpos($checkPrinter, 'Unknown destination') !== false || strpos($checkPrinter, 'Not connected') !== false) {
                     return response()->json([
                         'success' => false,
                         'message' => 'Yazıcı USB ile takılı değil veya sistemde bulunamadı: ' . $printerName
                     ], 500);
                }

                $tmpFile = tempnam(sys_get_temp_dir(), 'print_');
                file_put_contents($tmpFile, $rawCommand);
                exec("lpr -P " . escapeshellarg($printerName) . " -o raw " . escapeshellarg($tmpFile));
                @unlink($tmpFile);
            }

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
