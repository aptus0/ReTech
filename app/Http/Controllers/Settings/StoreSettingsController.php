<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoreSettingsController extends Controller
{
    public function edit()
    {
        return inertia('settings/store', [
            'storeName' => Setting::get('store_name', 'Re Tech Terminal'),
            'storeLogo' => Setting::get('store_logo'),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'store_name' => ['required', 'string', 'max:255'],
            'store_logo' => ['nullable', 'image', 'max:2048'], // max 2MB
        ]);

        Setting::set('store_name', $request->store_name);

        if ($request->hasFile('store_logo')) {
            $path = $request->file('store_logo')->store('logos', 'public');
            Setting::set('store_logo', '/storage/' . $path);
        }

        return redirect()->back()->with('success', 'Mağaza ayarları güncellendi.');
    }
}
