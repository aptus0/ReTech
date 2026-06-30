<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_account_id')->nullable()->constrained('marketplace_accounts')->onDelete('cascade');
            
            $table->string('action'); // connect, fetch_categories, create_product vs
            $table->string('method')->nullable();
            $table->string('endpoint')->nullable();
            
            $table->longText('request_payload')->nullable();
            $table->longText('response_payload')->nullable();
            
            $table->integer('status_code')->nullable();
            $table->boolean('success')->default(false);
            $table->text('error_message')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_logs');
    }
};
