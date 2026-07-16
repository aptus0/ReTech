<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class StoreSettingsController extends Controller
{
    public function edit()
    {
        return inertia('settings/store', [
            'storeName' => Setting::get('store_name', 'KobiX'),
            'storeLogo' => Setting::get('store_logo'),
            'companyName' => Setting::get('company_name', ''),
            'phone' => Setting::get('phone', ''),
            'email' => Setting::get('email', ''),
            'address' => Setting::get('address', ''),
            'district' => Setting::get('district', ''),
            'city' => Setting::get('city', ''),
            'taxOffice' => Setting::get('tax_office', ''),
            'taxNumber' => Setting::get('tax_number', ''),
            'website' => Setting::get('website', ''),
            'supportLine' => Setting::get('support_line', ''),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'store_name' => ['required', 'string', 'max:255'],
            'store_logo' => ['nullable', 'image', 'max:2048'], // max 2MB
            'company_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'support_line' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['required', 'string'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'tax_office' => ['required', 'string', 'max:255'],
            'tax_number' => ['required', 'string', 'max:50'],
            'website' => ['nullable', 'string', 'max:255'],
        ], [
            'company_name.required' => 'Firma unvanı zorunludur.',
            'tax_office.required' => 'Vergi dairesi zorunludur.',
            'tax_number.required' => 'Vergi/TC Kimlik numarası zorunludur.',
            'address.required' => 'Açık adres zorunludur (Fatura kesimi için).',
        ]);

        Setting::set('store_name', $request->store_name);
        Setting::set('company_name', $request->company_name);
        Setting::set('address', $request->address);
        Setting::set('tax_office', $request->tax_office);
        Setting::set('tax_number', $request->tax_number);

        if ($request->has('phone')) {
            Setting::set('phone', $request->phone);
        }
        if ($request->has('support_line')) {
            Setting::set('support_line', $request->support_line);
        }
        if ($request->has('email')) {
            Setting::set('email', $request->email);
        }
        if ($request->has('district')) {
            Setting::set('district', $request->district);
        }
        if ($request->has('city')) {
            Setting::set('city', $request->city);
        }
        if ($request->has('website')) {
            Setting::set('website', $request->website);
        }

        if ($request->hasFile('store_logo')) {
            $path = $request->file('store_logo')->store('logos', 'public');
            Setting::set('store_logo', '/storage/'.$path);
        }

        return redirect()->back()->with('success', 'Mağaza ayarları güncellendi.');
    }
}
