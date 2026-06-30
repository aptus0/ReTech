<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_id')->constrained('marketplaces')->onDelete('cascade');
            $table->string('store_name');
            $table->string('store_logo')->nullable();
            
            // Credentials
            $table->string('seller_id')->nullable();
            $table->string('merchant_id')->nullable();
            $table->string('supplier_id')->nullable();
            
            // Encrypted Secrets
            $table->text('api_key_encrypted')->nullable();
            $table->text('api_secret_encrypted')->nullable();
            $table->text('app_key_encrypted')->nullable();
            $table->text('app_secret_encrypted')->nullable();
            
            $table->string('environment')->default('production'); // test or production
            $table->boolean('is_active')->default(true);
            
            $table->timestamp('last_connection_at')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->json('settings_json')->nullable();
            
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_accounts');
    }
};
