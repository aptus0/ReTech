<?php

namespace App\Services\Barcode\Renderers;

use App\Models\BarcodePrinter;
use App\Models\BarcodeSchema;

class TsplRenderer
{
    protected BarcodePrinter $printer;
    protected BarcodeSchema $schema;
    protected array $commands = [];

    public function __construct(BarcodePrinter $printer, BarcodeSchema $schema)
    {
        $this->printer = $printer;
        $this->schema = $schema;
    }

    /**
     * Convert mm to printer dots based on DPI
     */
    protected function mmToDot($mm): int
    {
        // 203 DPI = 8 dots per mm
        // 300 DPI = 11.8 dots per mm
        // 600 DPI = 23.6 dots per mm
        $dotsPerMm = $this->printer->dpi / 25.4;
        return (int) round($mm * $dotsPerMm);
    }

    /**
     * Start the TSPL document
     */
    public function begin(): self
    {
        $this->commands = [];
        
        // Setup label size and gap
        $width = $this->schema->label_width_mm;
        $height = $this->schema->label_height_mm;
        $gap = $this->schema->gap_mm;

        $this->commands[] = "SIZE {$width} mm,{$height} mm";
        $this->commands[] = "GAP {$gap} mm,0 mm";
        
        // Setup density, speed and direction
        $this->commands[] = "DENSITY {$this->schema->density}";
        $this->commands[] = "SPEED {$this->schema->speed}";
        $this->commands[] = "DIRECTION 1";
        $this->commands[] = "REFERENCE 0,0";
        $this->commands[] = "CLS";

        return $this;
    }

    /**
     * Map schema items to TSPL commands using data values
     */
    public function renderItems(array $schemaItems, array $data): self
    {
        foreach ($schemaItems as $item) {
            if (!$item['visible']) continue;

            $x = $this->mmToDot($item['x_mm']);
            $y = $this->mmToDot($item['y_mm']);

            // Get value from data or use static text
            $value = $item['static_text'];
            if ($item['field_key'] && isset($data[$item['field_key']])) {
                $value = $data[$item['field_key']];
                if ($item['static_text']) { // If there's static text, prepend it (e.g., 'Fiyat: ')
                    $value = $item['static_text'] . $value;
                }
            }

            if (!$value) continue;

            switch ($item['type']) {
                case 'text':
                case 'product_name':
                case 'company_name':
                case 'price':
                    // TSPL TEXT x,y,"font",rotation,x-multi,y-multi,"content"
                    // Use internal font "2" or "3" depending on font_size roughly
                    $font = $item['font_size'] > 12 ? "3" : "2";
                    // basic TSPL text mapping
                    $this->commands[] = "TEXT {$x},{$y},\"{$font}\",{$item['rotation']},1,1,\"{$value}\"";
                    break;
                
                case 'barcode':
                case 'product_code':
                    // TSPL BARCODE x,y,"code type",height,human_readable,rotation,narrow,wide,"content"
                    $height = $this->mmToDot($item['height_mm'] ?: 10);
                    $human = $this->schema->show_human_readable ? 1 : 0;
                    $type = $this->schema->barcode_type === '128' ? "128" : "EAN13";
                    
                    $this->commands[] = "BARCODE {$x},{$y},\"{$type}\",{$height},{$human},{$item['rotation']},2,2,\"{$value}\"";
                    break;

                case 'qrcode':
                    // TSPL QRCODE x,y,ECC level,cell width,mode,rotation,"content"
                    $width = $this->mmToDot($item['width_mm'] ?: 10) / 10; // rough scale
                    $width = max(1, (int)$width);
                    $this->commands[] = "QRCODE {$x},{$y},H,{$width},A,{$item['rotation']},\"{$value}\"";
                    break;

                case 'box':
                    $endX = $this->mmToDot($item['x_mm'] + $item['width_mm']);
                    $endY = $this->mmToDot($item['y_mm'] + $item['height_mm']);
                    $this->commands[] = "BOX {$x},{$y},{$endX},{$endY},2";
                    break;
                
                case 'line':
                    $width = $this->mmToDot($item['width_mm']);
                    $height = $this->mmToDot($item['height_mm']);
                    $this->commands[] = "BAR {$x},{$y},{$width},{$height}";
                    break;
            }
        }

        return $this;
    }

    /**
     * Add print command for N copies
     */
    public function print(int $copies = 1): self
    {
        $this->commands[] = "PRINT {$copies},1";
        return $this;
    }

    /**
     * Get the final raw TSPL string
     */
    public function getRaw(): string
    {
        return implode("\r\n", $this->commands) . "\r\n";
    }
}
