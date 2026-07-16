<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Sipariş {{ $order->external_order_id }} Faturası</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; padding: 0; font-size: 18px; }
        .boxes { width: 100%; margin-bottom: 20px; }
        .boxes td { width: 50%; vertical-align: top; }
        .box { border: 1px solid #ccc; padding: 10px; min-height: 100px; }
        .box-title { font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
        .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items th, .items td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        .items th { background-color: #f5f5f5; }
        .text-right { text-align: right; }
        .total-box { float: right; width: 250px; }
        .total-box table { width: 100%; border-collapse: collapse; }
        .total-box th, .total-box td { padding: 5px; border-bottom: 1px solid #ccc; }
        .clear { clear: both; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SİPARİŞ BİLGİ FORMU / PROFORMA</h1>
        <p>Sipariş No: {{ $order->external_order_id }} | Tarih: {{ \Carbon\Carbon::parse($order->ordered_at)->format('d.m.Y H:i') }}</p>
        <p>Pazaryeri: {{ $order->marketplaceAccount->marketplace->name }} ({{ $order->marketplaceAccount->store_name }})</p>
    </div>

    <table class="boxes">
        <tr>
            <td style="padding-right: 10px;">
                <div class="box">
                    <div class="box-title">Fatura Bilgileri</div>
                    {{ $invoice['fullName'] ?? ($invoice['firstName'] ?? '') . ' ' . ($invoice['lastName'] ?? '') }}<br>
                    {{ $invoice['address1'] ?? '' }} {{ $invoice['address2'] ?? '' }}<br>
                    {{ $invoice['district'] ?? '' }} / {{ $invoice['city'] ?? '' }}<br>
                    TC/VKN: {{ $invoice['tcIdentityNumber'] ?? ($invoice['taxNumber'] ?? '-') }}
                </div>
            </td>
            <td style="padding-left: 10px;">
                <div class="box">
                    <div class="box-title">Teslimat Bilgileri</div>
                    {{ $shipment['fullName'] ?? ($shipment['firstName'] ?? '') . ' ' . ($shipment['lastName'] ?? '') }}<br>
                    {{ $shipment['address1'] ?? '' }} {{ $shipment['address2'] ?? '' }}<br>
                    {{ $shipment['district'] ?? '' }} / {{ $shipment['city'] ?? '' }}<br>
                    Tel: {{ $shipment['phone'] ?? '-' }}
                </div>
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Ürün Adı</th>
                <th>Barkod</th>
                <th class="text-right">Miktar</th>
                <th class="text-right">Birim Fiyat</th>
                <th class="text-right">Toplam</th>
            </tr>
        </thead>
        <tbody>
            @foreach($lines as $line)
            <tr>
                <td>{{ $line['productName'] ?? '-' }}</td>
                <td>{{ $line['barcode'] ?? '-' }}</td>
                <td class="text-right">{{ $line['quantity'] ?? 1 }}</td>
                <td class="text-right">{{ number_format($line['price'] ?? 0, 2, ',', '.') }} ₺</td>
                <td class="text-right">{{ number_format(($line['price'] ?? 0) * ($line['quantity'] ?? 1), 2, ',', '.') }} ₺</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total-box">
        <table>
            <tr>
                <th>Ara Toplam:</th>
                <td class="text-right">{{ number_format($order->total_amount, 2, ',', '.') }} ₺</td>
            </tr>
            <tr>
                <th>KDV (%18):</th>
                <td class="text-right">Dahil</td>
            </tr>
            <tr>
                <th>Genel Toplam:</th>
                <td class="text-right" style="font-weight: bold; font-size: 14px;">{{ number_format($order->total_amount, 2, ',', '.') }} ₺</td>
            </tr>
        </table>
    </div>
    
    <div class="clear"></div>
    <div style="margin-top: 50px; text-align: center; color: #666; font-size: 10px;">
        Bu belge KobiX Pazaryeri OS üzerinden otomatik üretilmiştir. E-Fatura/E-Arşiv yerine geçmez, bilgi amaçlıdır.
    </div>
</body>
</html>
