<?php

use App\Http\Controllers\BarcodePrintController;
use App\Http\Controllers\BarcodePrinterController;
use App\Http\Controllers\BarcodeSchemaController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CalendarEventController;
use App\Http\Controllers\CashMovementController;
use App\Http\Controllers\CashRegisterController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerNoteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DecisionReportController;
use App\Http\Controllers\EDocumentController;
use App\Http\Controllers\EDocumentSettingController;
use App\Http\Controllers\LicenseController;
use App\Http\Controllers\OpenTransactionController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SalesFlowController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\MarketplaceController;
use App\Http\Controllers\MarketplaceProductController;
use App\Http\Controllers\MarketplaceOrderController;
use App\Http\Controllers\MarketplaceReturnController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::prefix('products/barcode-print')->name('barcode-print.')->group(function () {
        Route::get('/', [BarcodePrintController::class, 'products'])->name('products');
        Route::get('/quick', [BarcodePrintController::class, 'quick'])->name('quick');
        Route::post('/raw', [BarcodePrintController::class, 'raw'])->name('raw');
    });

    // Ürünler (Products) resource route
    Route::delete('products/bulk-delete', [ProductController::class, 'bulkDestroy'])->name('products.bulk-delete');
    Route::resource('products', ProductController::class);
    Route::patch('products/{product}/status', [ProductController::class, 'toggleStatus'])
        ->name('products.toggle-status');

    // Stok Hareketleri
    Route::resource('stock-movements', StockMovementController::class)->only(['index', 'create', 'store', 'show']);

    // Customers (Cari)
    Route::post('customers/api/store', [CustomerController::class, 'apiStore'])->name('customers.api.store');
    Route::resource('customers', CustomerController::class);
    Route::post('customers/{customer}/notes', [CustomerNoteController::class, 'store'])->name('customers.notes.store');
    Route::put('customer-notes/{customerNote}', [CustomerNoteController::class, 'update'])->name('customer-notes.update');
    Route::delete('customer-notes/{customerNote}', [CustomerNoteController::class, 'destroy'])->name('customer-notes.destroy');
    Route::post('customers/{customer}/collect', [CustomerController::class, 'collect'])->name('customers.collect');

    // Inventory
    Route::resource('categories', CategoryController::class);
    Route::resource('brands', BrandController::class);
    Route::resource('units', UnitController::class);

    // Finance (Finans / Kasa)
    Route::resource('cash-registers', CashRegisterController::class);
    Route::resource('payment-methods', PaymentMethodController::class);
    Route::resource('cash-movements', CashMovementController::class);

    // Calendar Events
    Route::post('calendar-events', [CalendarEventController::class, 'store'])->name('calendar-events.store');
    Route::delete('calendar-events/{calendarEvent}', [CalendarEventController::class, 'destroy'])->name('calendar-events.destroy');
    Route::put('calendar-events/{calendarEvent}', [CalendarEventController::class, 'update'])->name('calendar-events.update');

    // System Status API
    Route::get('/api/system-status', [SystemController::class, 'status']);

    Route::patch('customers/{customer}/status', [CustomerController::class, 'toggleStatus'])->name('customers.status');

    // Satış Akışı
    Route::get('/sales-flow', [SalesFlowController::class, 'index'])->name('sales-flow.index');
    Route::post('/sales-flow', [SalesFlowController::class, 'store'])->name('sales-flow.store');

    // Açık İşlemler
    Route::resource('open-transactions', OpenTransactionController::class)->only(['index', 'show']);
    Route::post('/open-transactions/{openTransaction}/collect', [OpenTransactionController::class, 'collect'])->name('open-transactions.collect');

    // E-Belgeler
    Route::get('/e-documents', [EDocumentController::class, 'index'])->name('e-documents.index');
    Route::get('/e-documents/{invoice}', [EDocumentController::class, 'show'])->name('e-documents.show');
    Route::post('/e-documents/{invoice}/send', [EDocumentController::class, 'send'])->name('e-documents.send');
    Route::post('/e-documents/{invoice}/status', [EDocumentController::class, 'checkStatus'])->name('e-documents.status');

    // GİB Live Fetch API
    Route::get('/api/e-documents/gib', [EDocumentController::class, 'fetchFromGib'])->name('api.e-documents.gib');
    Route::get('/api/e-documents/gib/{uuid}/html', [EDocumentController::class, 'getGibHtml'])->name('api.e-documents.gib.html');
    
    // GİB SMS İmza API
    Route::post('/api/e-documents/gib/sign/start', [EDocumentController::class, 'startGibSign'])->name('api.e-documents.gib.sign.start');
    Route::post('/api/e-documents/gib/sign/complete', [EDocumentController::class, 'completeGibSign'])->name('api.e-documents.gib.sign.complete');

    // Karar Raporları
    Route::get('/decision-reports', [DecisionReportController::class, 'index'])->name('decision-reports.index');

    // e-Belge Ayarları
    Route::prefix('settings/e-documents')->name('settings.e-documents.')->group(function () {
        Route::get('/', [EDocumentSettingController::class, 'edit'])->name('edit');
        Route::put('/', [EDocumentSettingController::class, 'update'])->name('update');
        Route::post('/test-connection', [EDocumentSettingController::class, 'testConnection'])->name('test-connection');
    });

    // Barkod Yazdırma ve Şema Ayarları
    Route::resource('barcode-printers', BarcodePrinterController::class);
    Route::resource('barcode-schemas', BarcodeSchemaController::class);

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');

    // PazaryeriOS
    Route::prefix('marketplace')->name('marketplace.')->group(function () {
        Route::get('/', [MarketplaceController::class, 'index'])->name('index');
        
        Route::get('accounts', [MarketplaceController::class, 'accounts'])->name('accounts.index');
        Route::post('accounts', [MarketplaceController::class, 'storeAccount'])->name('accounts.store');
        Route::delete('accounts/{account}', [MarketplaceController::class, 'destroyAccount'])->name('accounts.destroy');
        Route::post('accounts/{account}/test', [MarketplaceController::class, 'testConnection'])->name('accounts.test');
        
        Route::post('products/sync', [MarketplaceProductController::class, 'sync'])->name('products.sync');
        Route::post('products/push-new', [MarketplaceProductController::class, 'pushNew'])->name('products.push-new');
        Route::post('products/push-stocks', [MarketplaceProductController::class, 'pushStocks'])->name('products.push-stocks');
        Route::post('orders/sync', [MarketplaceOrderController::class, 'sync'])->name('orders.sync');
        Route::post('orders/{id}/approve', [MarketplaceOrderController::class, 'approve'])->name('orders.approve');
        Route::post('orders/{id}/invoice', [MarketplaceOrderController::class, 'invoice'])->name('orders.invoice');
        Route::delete('products/bulk-delete', [MarketplaceProductController::class, 'bulkDestroy'])->name('products.bulk-delete');
        Route::resource('products', MarketplaceProductController::class);
        Route::resource('orders', MarketplaceOrderController::class);
        Route::resource('returns', MarketplaceReturnController::class);
    });
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/license-expired', [LicenseController::class, 'expired'])->name('license.expired');
    Route::post('/license-verify', [LicenseController::class, 'verify'])->name('license.verify');
    Route::get('/license/purchase', [LicenseController::class, 'purchase'])->name('license.purchase');
    Route::post('/license/purchase', [LicenseController::class, 'processPurchase'])->name('license.process-purchase');
});

require __DIR__.'/settings.php';
