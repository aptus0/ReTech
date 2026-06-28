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
        Schema::create('cash_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_register_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('account_id')->nullable(); // Customer/Supplier ID
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // income, expense, collection, payment, sale, purchase, refund, adjustment
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->string('source_type')->nullable(); // model class like App\Models\Invoice
            $table->unsignedBigInteger('source_id')->nullable(); // invoice id
            $table->unsignedBigInteger('created_by')->nullable(); // User ID
            $table->date('movement_date')->default(now());
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_movements');
    }
};
