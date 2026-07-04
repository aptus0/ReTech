<?php

use App\Http\Controllers\Api\Mobile\AuthController;
use App\Http\Controllers\Api\Mobile\MobileProductController;
use App\Http\Controllers\Api\Mobile\MobileTransactionController;
use App\Http\Controllers\Api\Mobile\SystemController;
use App\Http\Controllers\Api\Mobile\SystemStatusController;
use App\Http\Controllers\Api\PrintQueueController;
use App\Http\Controllers\Api\ProductInquiryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('mobile')->group(function () {
    Route::get('/ping', [SystemController::class, 'ping']);
    Route::post('/login', [AuthController::class, 'login']);

    // System Status
    Route::get('/system/status', [SystemStatusController::class, 'index']);

    // Barcode & Queue
    Route::get('/print-queue', [PrintQueueController::class, 'index']);
    Route::post('/print-queue/add', [PrintQueueController::class, 'store']);
    Route::delete('/print-queue/{id}', [PrintQueueController::class, 'destroy']);
    Route::get('/products/search', [ProductInquiryController::class, 'search']);
    Route::get('/products/inquiry/{barcode}', [ProductInquiryController::class, 'show']);

    // Products & Prices
    Route::get('/products/form-data', [MobileProductController::class, 'formData']);
    Route::post('/products/add', [MobileProductController::class, 'store']);
    Route::post('/products/{barcode}/price', [MobileProductController::class, 'updatePrice']);

    // Inventory & Transactions
    Route::post('/inventory-count', [MobileTransactionController::class, 'inventoryCount']);
    Route::get('/inventory/list', [MobileTransactionController::class, 'inventoryList']);
    Route::get('/inventory/reports', [MobileTransactionController::class, 'inventoryReports']);
});

// Print Worker API
Route::get('/barcode-print-queues/pending', [\App\Http\Controllers\BarcodePrintQueueWorkerController::class, 'pending']);
Route::post('/barcode-print-queues/{id}/complete', [\App\Http\Controllers\BarcodePrintQueueWorkerController::class, 'complete']);
