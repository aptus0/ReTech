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
        Schema::create('e_document_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->string('document_type')->nullable(); // e_invoice, e_archive
            $table->string('provider')->nullable(); // gib_portal, private_integrator, mock
            $table->string('environment')->nullable();
            $table->string('status')->default('draft'); // draft, preparing, sent, accepted, rejected, failed, cancelled
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->string('gib_uuid')->nullable();
            $table->string('gib_document_no')->nullable();
            $table->string('error_code')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('checked_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('e_document_logs');
    }
};
