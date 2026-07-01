<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index(Request $request)
    {
        $query = Unit::query();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('short_name', 'like', "%{$search}%");
        }

        $units = $query->orderBy('name')->paginate(15);

        return inertia('Units/Index', [
            'units' => $units,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        Unit::create($validated);

        return redirect()->back()->with('success', 'Birim eklendi.');
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        $unit->update($validated);

        return redirect()->back()->with('success', 'Birim güncellendi.');
    }

    public function destroy(Unit $unit)
    {
        try {
            $unit->delete();

            return redirect()->back()->with('success', 'Birim silindi.');
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                return redirect()->back()->withErrors(['error' => 'Bu birim ürünlerde kullanıldığı için silinemez.']);
            }

            return redirect()->back()->withErrors(['error' => 'Birim silinirken bir hata oluştu.']);
        }
    }
}
