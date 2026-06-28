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
        Schema::create('e_document_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider')->default('mock'); // gib_portal, gib_direct, private_integrator, mock
            $table->string('environment')->default('test'); // test, production
            $table->boolean('is_active')->default(false);
            $table->string('company_title')->nullable();
            $table->string('tax_number')->nullable();
            $table->string('tax_office')->nullable();
            $table->string('gib_user_code')->nullable();
            $table->text('gib_password_encrypted')->nullable();
            $table->boolean('e_invoice_enabled')->default(false);
            $table->boolean('e_archive_enabled')->default(false);
            $table->string('default_document_type')->default('auto'); // auto, e_invoice, e_archive
            $table->string('invoice_prefix')->default('GIB');
            $table->string('invoice_start_no')->default('2023000000001');
            $table->string('last_invoice_no')->nullable();
            $table->boolean('auto_send_after_sale')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('e_document_settings');
    }
};
