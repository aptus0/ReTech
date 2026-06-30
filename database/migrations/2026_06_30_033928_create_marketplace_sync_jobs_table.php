<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_sync_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_account_id')->constrained('marketplace_accounts')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('cascade');
            
            $table->string('job_type'); // product_create, product_update, price_stock_update
            
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            
            $table->string('external_task_id')->nullable(); // Trendyol batchRequestId, N11 taskId
            
            $table->string('status')->default('pending'); // pending, processing, success, failed
            $table->text('error_message')->nullable();
            
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_sync_jobs');
    }
};
