<?php

namespace App\Http\Controllers;

use App\Models\BarcodePrinter;
use App\Models\BarcodeSchema;
use App\Models\Product;
use App\Services\Barcode\BarcodePrintService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarcodePrintController extends Controller
{
    public function products(Request $request)
    {
        $products = Product::orderBy('name')->get();
        $printers = BarcodePrinter::where('is_active', true)->get();
        $schemas = BarcodeSchema::where('is_active', true)->with('items')->get();

        return Inertia::render('BarcodePrint/Products', [
            'products' => $products,
            'printers' => $printers,
            'schemas' => $schemas,
        ]);
    }

    public function raw(Request $request, BarcodePrintService $printService)
    {
        $validated = $request->validate([
            'printer_id' => 'required|exists:barcode_printers,id',
            'schema_id' => 'required|exists:barcode_schemas,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.copies' => 'required|integer|min:1',
        ]);

        try {
            $printer = BarcodePrinter::findOrFail($validated['printer_id']);
            $schema = BarcodeSchema::with('items')->findOrFail($validated['schema_id']);

            // Fetch products and format data for renderer
            $printItems = [];
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                // Map product fields to schema placeholders
                $data = [
                    'product_name' => $product->name,
                    'product_code' => $product->sku ?? $product->barcode ?? $product->id, // fallback to barcode or ID
                    'price' => number_format($product->sale_price, 2, ',', '.') . ' TL',
                    'company_name' => 'Karaca Ticaret', // In real app, fetch from settings
                ];

                $printItems[] = [
                    'data' => $data,
                    'copies' => $item['copies']
                ];
            }

            $rawCommand = $printService->generateRawCommands($printer, $schema, $printItems);

            return response()->json([
                'success' => true,
                'raw_command' => $rawCommand,
                'printer_name' => $printer->printer_name, // System printer name for QZ Tray
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
