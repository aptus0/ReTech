<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_brand_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_account_id')->constrained('marketplace_accounts')->onDelete('cascade');
            $table->foreignId('local_brand_id')->constrained('brands')->onDelete('cascade');

            $table->string('marketplace_brand_id');
            $table->string('marketplace_brand_name');

            $table->timestamps();

            $table->unique(['marketplace_account_id', 'local_brand_id'], 'mk_acc_brand_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_brand_mappings');
    }
};
