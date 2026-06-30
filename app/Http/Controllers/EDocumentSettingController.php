<?php

namespace App\Http\Controllers;

use App\Models\EDocumentSetting;
use App\Services\EDocument\EDocumentManager;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EDocumentSettingController extends Controller
{
    public function edit()
    {
        $setting = EDocumentSetting::first() ?? new EDocumentSetting([
            'provider' => 'mock',
            'environment' => 'test',
            'is_active' => false,
            'e_invoice_enabled' => false,
            'e_archive_enabled' => false,
            'default_document_type' => 'auto',
            'invoice_prefix' => 'GIB',
            'invoice_start_no' => '2023000000001',
            'auto_send_after_sale' => false,
        ]);

        return Inertia::render('settings/EDocuments/Edit', [
            'setting' => [
                'id' => $setting->id,
                'provider' => $setting->provider,
                'environment' => $setting->environment,
                'is_active' => $setting->is_active,
                'company_title' => $setting->company_title,
                'tax_number' => $setting->tax_number,
                'tax_office' => $setting->tax_office,
                'gib_user_code' => $setting->gib_user_code,
                // We send a boolean to indicate if password exists, rather than sending the plain/encrypted password to the frontend
                'has_gib_password' => ! empty($setting->gib_password_encrypted),
                'e_invoice_enabled' => $setting->e_invoice_enabled,
                'e_archive_enabled' => $setting->e_archive_enabled,
                'default_document_type' => $setting->default_document_type,
                'invoice_prefix' => $setting->invoice_prefix,
                'invoice_start_no' => $setting->invoice_start_no,
                'last_invoice_no' => $setting->last_invoice_no,
                'auto_send_after_sale' => $setting->auto_send_after_sale,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string|in:gib_portal,gib_direct,private_integrator,mock',
            'environment' => 'required|string|in:test,production',
            'is_active' => 'boolean',
            'company_title' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:50',
            'tax_office' => 'nullable|string|max:255',
            'gib_user_code' => 'nullable|string|max:255',
            'gib_password' => 'nullable|string', // Plain password from request
            'e_invoice_enabled' => 'boolean',
            'e_archive_enabled' => 'boolean',
            'default_document_type' => 'required|string|in:auto,e_invoice,e_archive',
            'invoice_prefix' => 'required|string|max:3',
            'invoice_start_no' => 'required|string|max:16',
            'auto_send_after_sale' => 'boolean',
        ]);

        $setting = EDocumentSetting::first();

        if (! $setting) {
            $setting = new EDocumentSetting;
        }

        // Exclude gib_password from massive assignment if empty and already exists
        $plainPassword = $validated['gib_password'] ?? null;
        unset($validated['gib_password']);

        $setting->fill($validated);

        if ($plainPassword) {
            // This will securely encrypt via the model mutator
            $setting->gib_password = $plainPassword;
        }

        $setting->save();

        return redirect()->back()->with('success', 'e-Belge ayarları başarıyla kaydedildi.');
    }

    public function testConnection()
    {
        try {
            $manager = app(EDocumentManager::class);
            $result = $manager->provider()->testConnection();

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
