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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('type'); // sale, purchase, return
            $table->string('invoice_number')->unique();
            $table->date('issue_date');
            $table->date('due_date')->nullable();
            
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_total', 15, 2)->default(0);
            $table->decimal('discount_total', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            
            $table->string('status')->default('draft'); // draft, completed, cancelled
            
            // E-Document fields
            $table->string('e_document_type')->default('none'); // none, e_invoice, e_archive
            $table->string('e_document_status')->default('draft'); // draft, ready, sent, accepted, rejected, cancelled, failed
            $table->uuid('e_document_uuid')->nullable();
            $table->text('e_document_response')->nullable();
            $table->timestamp('e_document_sent_at')->nullable();
            
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
