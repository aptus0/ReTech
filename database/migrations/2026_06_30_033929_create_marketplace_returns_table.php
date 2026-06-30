<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_account_id')->constrained('marketplace_accounts')->onDelete('cascade');
            $table->foreignId('marketplace_order_id')->constrained('marketplace_orders')->onDelete('cascade');
            
            $table->string('external_return_id');
            $table->string('status');
            $table->string('reason')->nullable();
            
            $table->json('raw_payload')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_returns');
    }
};
