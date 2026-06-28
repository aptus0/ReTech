<?php

namespace App\Services\EDocument\Contracts;

use App\Models\Invoice;

interface EDocumentProviderInterface
{
    /**
     * Test the connection to the E-Document provider.
     */
    public function testConnection(): array;

    /**
     * Send an invoice to the E-Document provider.
     */
    public function sendInvoice(Invoice $invoice): array;

    /**
     * Check the status of an invoice.
     */
    public function checkStatus(Invoice $invoice): array;

    /**
     * Cancel an invoice.
     */
    public function cancelInvoice(Invoice $invoice, string $reason): array;
}
