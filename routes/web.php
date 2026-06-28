<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\SalesFlowController;
use App\Http\Controllers\OpenTransactionController;
use App\Http\Controllers\EDocumentController;
use App\Http\Controllers\DecisionReportController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Ürünler (Products) resource route
    Route::resource('products', ProductController::class);
    Route::patch('products/{product}/status', [ProductController::class, 'toggleStatus'])
        ->name('products.toggle-status');

    // Stok Hareketleri
    Route::resource('stock-movements', App\Http\Controllers\StockMovementController::class)->only(['index', 'create', 'store', 'show']);

    // Customers (Cari)
    Route::resource('customers', \App\Http\Controllers\CustomerController::class);
    
    // Inventory
    Route::resource('categories', \App\Http\Controllers\CategoryController::class);
    Route::resource('brands', \App\Http\Controllers\BrandController::class);
    Route::resource('units', \App\Http\Controllers\UnitController::class);

    // Finance (Finans / Kasa)
    Route::resource('cash-registers', \App\Http\Controllers\CashRegisterController::class);
    Route::resource('payment-methods', \App\Http\Controllers\PaymentMethodController::class);
    Route::resource('cash-movements', \App\Http\Controllers\CashMovementController::class);

    // Calendar Events
    Route::post('calendar-events', [\App\Http\Controllers\CalendarEventController::class, 'store'])->name('calendar-events.store');
    Route::delete('calendar-events/{calendarEvent}', [\App\Http\Controllers\CalendarEventController::class, 'destroy'])->name('calendar-events.destroy');
    
    // System Status API
    Route::get('/api/system-status', [\App\Http\Controllers\SystemController::class, 'status']);
    
    Route::patch('customers/{customer}/status', [App\Http\Controllers\CustomerController::class, 'toggleStatus'])->name('customers.status');

    // Satış Akışı
    Route::get('/sales-flow', [SalesFlowController::class, 'index'])->name('sales-flow.index');
    Route::post('/sales-flow', [SalesFlowController::class, 'store'])->name('sales-flow.store');

    // Açık İşlemler
    Route::resource('open-transactions', OpenTransactionController::class)->only(['index', 'show']);
    Route::post('/open-transactions/{openTransaction}/collect', [OpenTransactionController::class, 'collect'])->name('open-transactions.collect');

    // E-Belgeler
    Route::get('/e-documents', [EDocumentController::class, 'index'])->name('e-documents.index');
    Route::post('/e-documents/{invoice}/send', [EDocumentController::class, 'send'])->name('e-documents.send');
    Route::post('/e-documents/{invoice}/status', [EDocumentController::class, 'checkStatus'])->name('e-documents.status');

    // Karar Raporları
    Route::get('/decision-reports', [DecisionReportController::class, 'index'])->name('decision-reports.index');

    // e-Belge Ayarları
    Route::prefix('settings/e-documents')->name('settings.e-documents.')->group(function () {
        Route::get('/', [\App\Http\Controllers\EDocumentSettingController::class, 'edit'])->name('edit');
        Route::put('/', [\App\Http\Controllers\EDocumentSettingController::class, 'update'])->name('update');
        Route::post('/test-connection', [\App\Http\Controllers\EDocumentSettingController::class, 'testConnection'])->name('test-connection');
    });

    // Barkod Yazdırma ve Şema Ayarları
    Route::resource('barcode-printers', \App\Http\Controllers\BarcodePrinterController::class);
    Route::resource('barcode-schemas', \App\Http\Controllers\BarcodeSchemaController::class);
    
    Route::prefix('products/barcode-print')->name('barcode-print.')->group(function () {
        Route::get('/', [\App\Http\Controllers\BarcodePrintController::class, 'products'])->name('products');
        Route::post('/raw', [\App\Http\Controllers\BarcodePrintController::class, 'raw'])->name('raw');
    });

    Route::get('settings/profile', [App\Http\Controllers\Settings\ProfileController::class, 'edit'])->name('profile.edit');
});

require __DIR__.'/settings.php';
