<?php

namespace App\Http\Controllers;

use App\Models\BarcodeSchema;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarcodeSchemaController extends Controller
{
    public function index()
    {
        $schemas = BarcodeSchema::with('items')->orderBy('created_at', 'desc')->get();

        return Inertia::render('BarcodeSchemas/Index', [
            'schemas' => $schemas,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'printer_language' => 'required|string',
            'label_width_mm' => 'required|numeric',
            'label_height_mm' => 'required|numeric',
            'gap_mm' => 'required|numeric',
            'density' => 'required|integer',
            'speed' => 'required|integer',
            'barcode_type' => 'required|string',
            'show_human_readable' => 'boolean',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'items' => 'nullable|array',
        ]);

        if (! empty($validated['is_default'])) {
            BarcodeSchema::where('id', '>', 0)->update(['is_default' => false]);
        }

        $items = $validated['items'] ?? [];
        unset($validated['items']);

        $schema = BarcodeSchema::create($validated);

        foreach ($items as $item) {
            $schema->items()->create($item);
        }

        return back()->with('success', 'Barkod şeması başarıyla oluşturuldu.');
    }

    public function update(Request $request, BarcodeSchema $barcodeSchema)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'printer_language' => 'required|string',
            'label_width_mm' => 'required|numeric',
            'label_height_mm' => 'required|numeric',
            'gap_mm' => 'required|numeric',
            'density' => 'required|integer',
            'speed' => 'required|integer',
            'barcode_type' => 'required|string',
            'show_human_readable' => 'boolean',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
            'items' => 'nullable|array',
        ]);

        if (! empty($validated['is_default'])) {
            BarcodeSchema::where('id', '!=', $barcodeSchema->id)->update(['is_default' => false]);
        }

        $items = $validated['items'] ?? [];
        unset($validated['items']);

        $barcodeSchema->update($validated);

        // Sync items
        $barcodeSchema->items()->delete();
        foreach ($items as $item) {
            $barcodeSchema->items()->create($item);
        }

        return back()->with('success', 'Barkod şeması güncellendi.');
    }

    public function destroy(BarcodeSchema $barcodeSchema)
    {
        $barcodeSchema->delete();

        return back()->with('success', 'Barkod şeması silindi.');
    }
}
