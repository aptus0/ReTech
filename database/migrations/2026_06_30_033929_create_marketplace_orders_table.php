<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_account_id')->constrained('marketplace_accounts')->onDelete('cascade');

            $table->string('external_order_id');
            $table->string('external_package_id')->nullable();

            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();

            $table->decimal('total_amount', 10, 2);
            $table->string('status'); // new, preparing, invoiced, packed, shipped, delivered, cancelled, returned, failed

            $table->json('raw_payload')->nullable();
            $table->timestamp('ordered_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_orders');
    }
};
