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
        Schema::create('barcode_printers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand')->nullable(); // TSC, Zebra, XPrinter, Argox
            $table->string('model')->nullable(); // TTP-244CE
            $table->string('printer_name')->nullable(); // The exact OS printer name for QZ Tray
            $table->string('connection_type')->default('usb'); // usb, ethernet, bluetooth
            $table->string('language')->default('tspl'); // tspl, zpl, epl, pplb
            $table->integer('dpi')->default(203);
            $table->decimal('default_width_mm', 8, 2)->default(50);
            $table->decimal('default_height_mm', 8, 2)->default(30);
            $table->decimal('default_gap_mm', 8, 2)->default(3);
            $table->integer('default_speed')->default(4);
            $table->integer('default_density')->default(8);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('settings_json')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barcode_printers');
    }
};
