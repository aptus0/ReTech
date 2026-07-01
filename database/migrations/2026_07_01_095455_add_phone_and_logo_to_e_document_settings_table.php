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
        Schema::table('e_document_settings', function (Blueprint $table) {
            $table->string('company_phone')->nullable()->after('company_title');
            $table->string('company_logo_url')->nullable()->after('company_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('e_document_settings', function (Blueprint $table) {
            $table->dropColumn(['company_phone', 'company_logo_url']);
        });
    }
};
