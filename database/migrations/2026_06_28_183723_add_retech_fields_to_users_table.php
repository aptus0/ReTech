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
        Schema::table('users', function (Blueprint $table) {
            $table->string('store_code')->nullable()->after('email');
            $table->string('personnel_no')->nullable()->after('store_code');
            $table->string('role')->default('personnel')->after('personnel_no'); // admin, manager, sales_consultant, warehouse, personnel
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['store_code', 'personnel_no', 'role']);
        });
    }
};
