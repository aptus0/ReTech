<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketplace_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marketplace_account_id')->constrained('marketplace_accounts')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');

            // External Identifiers
            $table->string('marketplace_product_id')->nullable(); // Pazaryeri'nin verdiği asıl ürün ID'si
            $table->string('marketplace_content_id')->nullable(); // Trendyol contentId vb.
            $table->string('marketplace_sku')->nullable(); // N11 itemCode, HB SKU

            // Our Identifiers matched to them
            $table->string('barcode')->nullable();
            $table->string('stock_code')->nullable();

            // Statuses
            $table->string('status')->default('not_sent'); // not_sent, pending, published, error, archived
            $table->string('approval_status')->nullable(); // approved, rejected, waiting

            $table->text('last_error')->nullable();
            $table->timestamp('last_synced_at')->nullable();

            $table->timestamps();

            // Ensure a product is only listed once per marketplace account
            $table->unique(['marketplace_account_id', 'product_id'], 'mk_acc_prod_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketplace_products');
    }
};
