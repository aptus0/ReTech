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
        Schema::table('barcode_print_queues', function (Blueprint $table) {
            $table->string('printer_name')->nullable()->after('id');
            $table->string('connection_type')->nullable()->after('printer_name');
            $table->longText('raw_command')->nullable()->after('connection_type');
            $table->foreignId('product_id')->nullable()->change();
            $table->integer('copies')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('barcode_print_queues', function (Blueprint $table) {
            $table->dropColumn(['printer_name', 'connection_type', 'raw_command']);
        });
    }
};
