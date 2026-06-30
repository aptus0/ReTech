<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\StoreSettingsController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/store', [StoreSettingsController::class, 'edit'])->name('settings.store');
    Route::post('settings/store', [StoreSettingsController::class, 'update'])->name('settings.store.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
    Route::inertia('settings/display', 'settings/display')->name('settings.display');
    Route::inertia('settings/marketplaces', 'settings/marketplaces')->name('settings.marketplaces');

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::resource('users', \App\Http\Controllers\UserController::class)->except(['show']);
        Route::get('mobile-app', [\App\Http\Controllers\Settings\MobileAppController::class, 'index'])->name('mobile-app');
    });
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
