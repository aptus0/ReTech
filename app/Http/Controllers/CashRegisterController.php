<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use Illuminate\Http\Request;

class CashRegisterController extends Controller
{
    public function index(Request $request)
    {
        $query = CashRegister::query();
        
        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $registers = $query->orderBy('name')->paginate(15);

        return inertia('CashRegisters/Index', [
            'registers' => $registers,
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'currency' => 'required|string|max:3',
            'is_active' => 'boolean'
        ]);

        CashRegister::create($validated);

        return redirect()->back()->with('success', 'Kasa eklendi.');
    }

    public function update(Request $request, CashRegister $cashRegister)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'currency' => 'required|string|max:3',
            'is_active' => 'boolean'
        ]);

        $cashRegister->update($validated);

        return redirect()->back()->with('success', 'Kasa güncellendi.');
    }

    public function destroy(CashRegister $cashRegister)
    {
        if ($cashRegister->movements()->exists()) {
            return redirect()->back()->withErrors('Bu kasaya ait hareketler olduğu için silinemez.');
        }

        $cashRegister->delete();
        
        return redirect()->back()->with('success', 'Kasa silindi.');
    }
}
