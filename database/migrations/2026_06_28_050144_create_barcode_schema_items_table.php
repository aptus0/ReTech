<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('barcode_schema_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('barcode_schema_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // text, barcode, qrcode, logo, line, box, price, product_name, product_code, company_name
            $table->string('field_key')->nullable();
            $table->string('static_text')->nullable();
            $table->decimal('x_mm', 8, 2)->default(0);
            $table->decimal('y_mm', 8, 2)->default(0);
            $table->decimal('width_mm', 8, 2)->nullable();
            $table->decimal('height_mm', 8, 2)->nullable();
            $table->integer('font_size')->default(10);
            $table->string('font_weight')->default('normal');
            $table->string('align')->default('left');
            $table->integer('rotation')->default(0);
            $table->boolean('visible')->default(true);
            $table->json('options_json')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barcode_schema_items');
    }
};
