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
        Schema::create('barcode_schemas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('printer_language')->default('tspl');
            $table->decimal('label_width_mm', 8, 2)->default(50);
            $table->decimal('label_height_mm', 8, 2)->default(30);
            $table->decimal('gap_mm', 8, 2)->default(3);
            $table->integer('columns')->default(1);
            $table->integer('rows')->default(1);
            $table->decimal('margin_left_mm', 8, 2)->default(0);
            $table->decimal('margin_top_mm', 8, 2)->default(0);
            $table->integer('density')->default(8);
            $table->integer('speed')->default(4);
            $table->string('barcode_type')->default('128'); // Code 128
            $table->boolean('show_human_readable')->default(true);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barcode_schemas');
    }
};
