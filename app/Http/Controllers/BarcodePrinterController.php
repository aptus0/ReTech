<?php

namespace App\Http\Controllers;

use App\Models\BarcodePrinter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarcodePrinterController extends Controller
{
    public function index()
    {
        $printers = BarcodePrinter::orderBy('created_at', 'desc')->get();

        return Inertia::render('BarcodePrinters/Index', [
            'printers' => $printers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'printer_name' => 'nullable|string|max:255',
            'connection_type' => 'required|string',
            'language' => 'required|string',
            'dpi' => 'required|integer',
            'default_width_mm' => 'required|numeric',
            'default_height_mm' => 'required|numeric',
            'default_gap_mm' => 'required|numeric',
            'default_speed' => 'required|integer',
            'default_density' => 'required|integer',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if (! empty($validated['is_default'])) {
            BarcodePrinter::where('id', '>', 0)->update(['is_default' => false]);
        }

        BarcodePrinter::create($validated);

        return back()->with('success', 'Yazıcı profili başarıyla eklendi.');
    }

    public function update(Request $request, BarcodePrinter $barcodePrinter)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'printer_name' => 'nullable|string|max:255',
            'connection_type' => 'required|string',
            'language' => 'required|string',
            'dpi' => 'required|integer',
            'default_width_mm' => 'required|numeric',
            'default_height_mm' => 'required|numeric',
            'default_gap_mm' => 'required|numeric',
            'default_speed' => 'required|integer',
            'default_density' => 'required|integer',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if (! empty($validated['is_default'])) {
            BarcodePrinter::where('id', '!=', $barcodePrinter->id)->update(['is_default' => false]);
        }

        $barcodePrinter->update($validated);

        return back()->with('success', 'Yazıcı profili güncellendi.');
    }

    public function destroy(BarcodePrinter $barcodePrinter)
    {
        $barcodePrinter->delete();

        return back()->with('success', 'Yazıcı silindi.');
    }
}
