import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft, Package, Barcode, Tag } from 'lucide-react';
import { useState } from 'react';

export default function Show({ product }: { product: any }) {
    const [activeTab, setActiveTab] = useState('ozet');

    const renderTabContent = () => {
        if (activeTab === 'ozet') {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`border rounded-lg p-4 text-center ${product.current_stock > product.critical_stock ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                            <p className="text-sm font-medium mb-1">Mevcut Stok</p>
                            <h3 className="text-3xl font-black">{product.current_stock}</h3>
                            <p className="text-xs mt-1 opacity-80">Kritik Stok: {product.critical_stock}</p>
                        </div>
                        <div className="bg-neutral-50 border rounded-lg p-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Satış Fiyatı</p>
                            <h3 className="text-3xl font-bold">₺{Number(product.sale_price || 0).toLocaleString('tr-TR')}</h3>
                            <p className="text-xs mt-1 text-muted-foreground">KDV Oranı: %{product.tax_rate}</p>
                        </div>
                    </div>
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                        Ürün grafikleri bu alanda yer alacaktır.
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center py-16 text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">{activeTab} sekmesi yapım aşamasında.</h3>
                <p className="text-sm">Geçmiş ve hareket dökümleri yakında eklenecektir.</p>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Ürünler', href: '/products' },
            { title: product.name, href: `/products/${product.id}` }
        ]}>
            <Head title={product.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/products">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{product.name}</h1>
                            <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                                <Badge variant="secondary">{product.category?.name || 'Kategorisiz'}</Badge>
                                <span>Stok Kodu: {product.stock_code}</span>
                            </div>
                        </div>
                    </div>
                    <Link href={`/products/${product.id}/edit`}>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <Edit className="w-4 h-4 mr-2" />
                            Düzenle
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="col-span-1 shadow-sm h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg">Ürün Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start space-x-3 text-sm">
                                <Barcode className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Barkod</p>
                                    <p className="text-muted-foreground font-mono">{product.barcode || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-sm">
                                <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Marka</p>
                                    <p className="text-muted-foreground">{product.brand?.name || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-sm">
                                <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Birim</p>
                                    <p className="text-muted-foreground">{product.unit?.name || '-'}</p>
                                </div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-dashed space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Alış Fiyatı</span>
                                    <span className="font-medium">₺{Number(product.purchase_price || 0).toLocaleString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Durum</span>
                                    {product.is_active ? 
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Aktif</Badge> : 
                                        <Badge variant="secondary">Pasif</Badge>
                                    }
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="col-span-2 flex flex-col">
                        <div className="bg-card rounded-md shadow-sm border p-1 mb-4 flex gap-1 overflow-x-auto">
                            {[
                                { id: 'ozet', label: 'Özet' },
                                { id: 'stok', label: 'Stok Hareketleri' },
                                { id: 'alis', label: 'Alış Geçmişi' },
                                { id: 'satis', label: 'Satış Geçmişi' },
                                { id: 'iade', label: 'İade / Değişim' },
                                { id: 'fiyat', label: 'Fiyat Geçmişi' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 text-sm font-medium rounded-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-orange-100 text-orange-700' : 'hover:bg-neutral-100 text-muted-foreground'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        <Card className="shadow-sm flex-1">
                            <CardContent className="p-6 h-full min-h-[400px]">
                                {renderTabContent()}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
