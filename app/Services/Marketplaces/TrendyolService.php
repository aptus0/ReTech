<?php

namespace App\Services\Marketplaces;

use App\Models\MarketplaceAccount;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class TrendyolService
{
    protected $account;
    protected $baseUrl = 'https://api.trendyol.com/sapigw';

    public function __construct(MarketplaceAccount $account)
    {
        $this->account = $account;
    }

    /**
     * Get authorized HTTP client
     */
    protected function client()
    {
        if (!$this->account->supplier_id || !$this->account->api_key_encrypted || !$this->account->api_secret_encrypted) {
            throw new Exception("Trendyol hesap bilgileri eksik.");
        }

        return Http::withOptions([
                'verify' => false,
                'timeout' => 30,
                'connect_timeout' => 30,
            ])
            ->withBasicAuth($this->account->api_key_encrypted, $this->account->api_secret_encrypted)
            ->withHeaders([
                'User-Agent' => $this->account->supplier_id . ' - SelfIntegration',
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Accept-Language' => 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            ]);
    }

    /**
     * Test API connection
     */
    public function testConnection()
    {
        try {
            $response = $this->client()->get($this->baseUrl . "/suppliers/{$this->account->supplier_id}/orders", [
                'size' => 1
            ]);

            if ($response->successful()) {
                return ['success' => true, 'message' => 'Bağlantı başarılı.'];
            }
            return ['success' => false, 'message' => 'Trendyol API hatası: ' . $response->body()];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Hata: ' . $e->getMessage()];
        }
    }

    public function pullProducts($page = 0, $size = 50)
    {
        try {
            // DOĞRU ENDPOINT: https://api.trendyol.com/integration/product/sellers/{sellerId}/products
            // sapigw endpoint'i Cloudflare WAF engeline takılıyordu ve deaktive ediliyordu.
            $response = $this->client()->get("https://api.trendyol.com/integration/product/sellers/{$this->account->supplier_id}/products", [
                'page' => $page,
                'size' => $size,
                'approved' => 'true'
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Trendyol Pull Products Error', ['response' => $response->body(), 'status' => $response->status()]);
            throw new Exception("Ürünler çekilirken hata oluştu (HTTP {$response->status()}): " . substr($response->body(), 0, 500));
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Update Price and Inventory
     * Format of $items array:
     * [
     *   [ 'barcode' => '...', 'quantity' => 10, 'salePrice' => 100.50, 'listPrice' => 120.00 ],
     *   ...
     * ]
     */
    public function updatePriceAndInventory(array $items)
    {
        try {
            $payload = [
                'items' => $items
            ];

            // DOĞRU ENDPOINT: https://api.trendyol.com/integration/product/sellers/{sellerId}/products/price-and-inventory
            $response = $this->client()->post("https://api.trendyol.com/integration/product/sellers/{$this->account->supplier_id}/products/price-and-inventory", $payload);

            if ($response->successful()) {
                return $response->json(); // Contains batchRequestId
            }

            Log::error('Trendyol Update Price/Inventory Error', ['response' => $response->body(), 'payload' => $payload]);
            throw new Exception("Fiyat/Stok güncellenirken hata oluştu: " . $response->body());
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Push a new product to Trendyol
     * Note: Creating a product requires strict Brand and Category matching from Trendyol API.
     */
    public function pushProduct(array $productData)
    {
        try {
            $payload = [
                'items' => [$productData]
            ];

            $response = $this->client()->post($this->baseUrl . "/suppliers/{$this->account->supplier_id}/v2/products", $payload);

            if ($response->successful()) {
                return $response->json(); // Contains batchRequestId
            }

            Log::error('Trendyol Push Product Error', ['response' => $response->body(), 'payload' => $payload]);
            throw new Exception("Ürün gönderilirken hata oluştu: " . $response->body());
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Pull orders from Trendyol
     */
    public function pullOrders($startDate = null, $endDate = null, $status = null)
    {
        try {
            $params = [];
            
            // Trendyol requires dates in milliseconds since epoch
            if ($startDate) {
                $params['startDate'] = $startDate;
            } else {
                // Default to last 15 days if not specified
                $params['startDate'] = now()->subDays(15)->timestamp * 1000;
            }
            
            if ($endDate) {
                $params['endDate'] = $endDate;
            } else {
                $params['endDate'] = now()->timestamp * 1000;
            }

            if ($status) {
                $params['status'] = $status;
            }

            // Siparişlerin güncellenme tarihine göre getirilmesi için (böylece kargoya verilenler vb. yakalanır)
            $params['orderByField'] = 'PackageLastModifiedDate';
            $params['orderByDirection'] = 'DESC';

            // DOĞRU ENDPOINT: https://api.trendyol.com/integration/order/sellers/{sellerId}/orders
            // Ürünlerde olduğu gibi sapigw uç noktası WAF engeline takılmaktadır.
            $response = $this->client()->get("https://api.trendyol.com/integration/order/sellers/{$this->account->supplier_id}/orders", $params);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Trendyol Pull Orders Error', ['response' => $response->body()]);
            throw new Exception("Siparişler çekilirken hata oluştu: " . substr($response->body(), 0, 500));
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Update package status (Approve order)
     */
    public function updatePackageStatus(array $lineIds, string $status = 'Picking')
    {
        try {
            $payload = [
                'lines' => array_map(function($id) {
                    return ['lineId' => $id];
                }, $lineIds),
                'params' => [],
                'status' => $status
            ];

            $response = $this->client()->put("https://api.trendyol.com/integration/order/sellers/{$this->account->supplier_id}/orders/status", $payload);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Trendyol Update Package Status Error', ['response' => $response->body(), 'payload' => $payload]);
            throw new Exception("Paket durumu güncellenirken hata oluştu: " . $response->body());
        } catch (Exception $e) {
            throw $e;
        }
    }
    public function testDateQueryType($startDate, $endDate)
    {
        $params = [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'orderByField' => 'PackageLastModifiedDate',
            'orderByDirection' => 'DESC'
        ];
        $response = $this->client()->get("https://api.trendyol.com/integration/order/sellers/{$this->account->supplier_id}/orders", $params);
        if ($response->successful()) {
            return $response->json();
        }
        return ['error' => $response->body()];
    }

    /**
     * Upload an invoice file (PDF, JPEG, PNG) to Trendyol.
     */
    public function uploadInvoiceFile(string $shipmentPackageId, string $filePath, ?string $invoiceNumber = null, ?int $invoiceDateTime = null)
    {
        try {
            $url = "https://api.trendyol.com/integration/sellers/{$this->account->supplier_id}/seller-invoice-file";
            
            $payload = [
                'shipmentPackageId' => $shipmentPackageId
            ];

            if ($invoiceNumber) {
                $payload['invoiceNumber'] = $invoiceNumber;
            }
            if ($invoiceDateTime) {
                $payload['invoiceDateTime'] = $invoiceDateTime;
            }

            // Client() includes 'Content-Type' => 'application/json' by default. We must remove it for multipart/form-data.
            $client = Http::withOptions([
                    'verify' => false,
                    'timeout' => 30,
                    'connect_timeout' => 30,
                ])
                ->withBasicAuth($this->account->api_key_encrypted, $this->account->api_secret_encrypted)
                ->withHeaders([
                    'User-Agent' => $this->account->supplier_id . ' - SelfIntegration',
                    'Accept' => 'application/json',
                    'Accept-Language' => 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                ]);

            $response = $client->attach(
                'file', file_get_contents($filePath), basename($filePath)
            )->post($url, $payload);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Trendyol Upload Invoice Error', ['response' => $response->body(), 'package' => $shipmentPackageId]);
            throw new Exception("Fatura dosyası gönderilirken hata oluştu: " . substr($response->body(), 0, 500));
        } catch (Exception $e) {
            throw $e;
        }
    }
}
