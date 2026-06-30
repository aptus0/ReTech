<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_category_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_account_id')->constrained('marketplace_accounts')->onDelete('cascade');
            $table->foreignId('local_category_id')->constrained('categories')->onDelete('cascade');
            
            $table->string('marketplace_category_id');
            $table->string('marketplace_category_name');
            
            $table->json('required_attributes_json')->nullable(); // Zorunlu özelliklerin listesi (önbellek)
            
            $table->timestamps();
            
            $table->unique(['marketplace_account_id', 'local_category_id'], 'mk_acc_cat_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_category_mappings');
    }
};
