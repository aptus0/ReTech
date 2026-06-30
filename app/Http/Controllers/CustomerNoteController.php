<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerNote;
use Illuminate\Http\Request;

class CustomerNoteController extends Controller
{
    public function store(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $customer->customerNotes()->create([
            'content' => $validated['content'],
            'user_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Not başarıyla eklendi.');
    }

    public function update(Request $request, CustomerNote $customerNote)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        // Authorization check could be added here
        $customerNote->update([
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'Not güncellendi.');
    }

    public function destroy(CustomerNote $customerNote)
    {
        // Authorization check could be added here
        $customerNote->delete();

        return back()->with('success', 'Not silindi.');
    }
}
