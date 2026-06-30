<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_attribute_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_account_id')->constrained('marketplace_accounts')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('cascade'); // Hangi ürüne ait özellik
            
            $table->string('local_attribute_key')->nullable(); // Kendi sistemimizdeki karşılığı (örn: color, size)
            $table->string('marketplace_attribute_id'); // Trendyol Renk ID'si (örn: 338)
            $table->string('marketplace_attribute_name'); // Renk
            
            $table->string('marketplace_attribute_value_id')->nullable(); // Seçilen değerin ID'si (örn: 6991 - Siyah)
            $table->string('marketplace_attribute_value_name')->nullable(); // Siyah
            
            $table->timestamps();
            
            // Eğer kategori bazlı genel eşleme yapılacaksa product_id null olabilir.
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_attribute_mappings');
    }
};
