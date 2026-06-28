<?php

namespace App\Services\Barcode;

use App\Models\BarcodePrinter;
use App\Models\BarcodeSchema;
use App\Services\Barcode\Renderers\TsplRenderer;

class BarcodePrintService
{
    /**
     * Generate raw commands for multiple products based on a schema and printer
     */
    public function generateRawCommands(BarcodePrinter $printer, BarcodeSchema $schema, array $items): string
    {
        $rawCommand = "";

        if ($printer->language === 'tspl') {
            $renderer = new TsplRenderer($printer, $schema);
            
            // For TSPL, we setup the document configuration once at the top
            $renderer->begin();

            $schemaItems = $schema->items()->get()->toArray();

            foreach ($items as $item) {
                // $item contains product data and 'copies'
                $data = $item['data'];
                $copies = $item['copies'] ?? 1;

                // Render the items for this specific product
                $renderer->renderItems($schemaItems, $data);
                
                // Add print command for N copies of this label
                $renderer->print($copies);
            }

            $rawCommand = $renderer->getRaw();
        } else {
            throw new \Exception("Desteklenmeyen yazıcı dili: {$printer->language}");
        }

        return $rawCommand;
    }
}
