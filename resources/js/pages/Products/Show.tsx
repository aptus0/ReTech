import { Head, Link } from '@inertiajs/react';
import { Edit, ArrowLeft, Package, Barcode, Tag, TrendingUp, TrendingDown, Clock, Activity, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

export default function Show({ product, movements = [] }: { product: any, movements: any[] }) {
    const [activeTab, setActiveTab] = useState('ozet');

    const inMovements = movements.filter(m => m.type === 'in');
    const outMovements = movements.filter(m => m.type === 'out');

    const renderTabContent = () => {
        if (activeTab === 'ozet') {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`border rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden ${product.current_stock > product.critical_stock ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <Package className="w-24 h-24" />
                            </div>
                            <p className="text-sm font-medium mb-1">Mevcut Stok</p>
                            <h3 className="text-5xl font-black">{product.current_stock}</h3>
                            <p className="text-xs mt-2 opacity-80 font-medium">Kritik Eşik: {product.critical_stock}</p>
                        </div>
                        <div className="bg-neutral-50 border rounded-lg p-6 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10 text-neutral-400">
                                <CreditCard className="w-24 h-24" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Satış Fiyatı</p>
                            <h3 className="text-4xl font-bold">₺{Number(product.sale_price || 0).toLocaleString('tr-TR')}</h3>
                            <p className="text-xs mt-2 text-muted-foreground font-medium">KDV: %{product.tax_rate}</p>
                        </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900 shadow-sm">
                        <h4 className="text-sm font-semibold mb-4 flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-500" /> Son 6 Aylık Stok Trendi</h4>
                        <div className="h-40 flex items-end justify-between gap-2 px-2">
                            {/* Mock Chart */}
                            {[45, 60, 30, 80, 50, Number(product.current_stock) || 10].map((val, i) => (
                                <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                    <div className="text-xs font-medium text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">{val}</div>
                                    <div className="w-full bg-blue-100 dark:bg-blue-900/40 rounded-t-sm relative overflow-hidden transition-all duration-500 hover:bg-blue-200 dark:hover:bg-blue-800/60" style={{ height: `${Math.min(100, Math.max(10, val))}%` }}>
                                        <div className="absolute bottom-0 w-full bg-blue-500" style={{ height: '4px' }}></div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground uppercase">{['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'stok') {
            return (
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center"><Package className="w-4 h-4 mr-2 text-orange-500" /> Son Stok Hareketleri</h4>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tarih</th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">İşlem</th>
                                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Miktar</th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Açıklama</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Hareket bulunamadı.</td>
                                    </tr>
                                ) : movements.map((m: any, i: number) => (
                                    <tr key={m.id || i} className="border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                        <td className="px-4 py-3 font-mono text-xs">{new Date(m.created_at).toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3">
                                            {m.type === 'in' ? 
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><TrendingUp className="w-3 h-3 mr-1"/> Giriş</Badge> : 
                                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><TrendingDown className="w-3 h-3 mr-1"/> Çıkış</Badge>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold">{m.type === 'in' ? '+' : '-'}{m.quantity}</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">{m.description || m.document_type || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
        
        if (activeTab === 'satis') {
            const totalSold = outMovements.reduce((sum, m) => sum + Number(m.quantity), 0);
            const totalRevenue = outMovements.reduce((sum, m) => sum + (Number(m.quantity) * Number(m.unit_price)), 0);

            return (
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-green-500" /> Satış Analizi ve Geçmişi</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-4 border rounded bg-card">
                            <div className="text-xs text-muted-foreground">Toplam Satılan Adet</div>
                            <div className="text-2xl font-bold text-green-600">{totalSold}</div>
                        </div>
                        <div className="p-4 border rounded bg-card">
                            <div className="text-xs text-muted-foreground">Toplam Gelir</div>
                            <div className="text-2xl font-bold">₺{totalRevenue.toLocaleString('tr-TR')}</div>
                        </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden mt-4">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tarih</th>
                                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Miktar</th>
                                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Birim Fiyat</th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Kullanıcı</th>
                                </tr>
                            </thead>
                            <tbody>
                                {outMovements.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Satış kaydı bulunamadı.</td></tr>
                                ) : outMovements.map((m: any, i: number) => (
                                    <tr key={i} className="border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                        <td className="px-4 py-3 font-mono text-xs">{new Date(m.created_at).toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-right font-bold text-red-600">-{m.quantity}</td>
                                        <td className="px-4 py-3 text-right">₺{Number(m.unit_price).toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">{m.user?.name || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (activeTab === 'alis') {
            const totalBought = inMovements.reduce((sum, m) => sum + Number(m.quantity), 0);
            
            return (
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center"><TrendingDown className="w-4 h-4 mr-2 text-blue-500" /> Alış Geçmişi</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-4 border rounded bg-card">
                            <div className="text-xs text-muted-foreground">Toplam Alınan Adet</div>
                            <div className="text-2xl font-bold text-blue-600">{totalBought}</div>
                        </div>
                        <div className="p-4 border rounded bg-card flex flex-col justify-center">
                            <div className="text-xs text-muted-foreground">Son Alış Fiyatı</div>
                            <div className="text-2xl font-bold">₺{Number(inMovements[0]?.unit_price || product.purchase_price || 0).toLocaleString('tr-TR')}</div>
                        </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden mt-4">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tarih</th>
                                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Miktar</th>
                                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Birim Fiyat</th>
                                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Açıklama</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inMovements.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Alış kaydı bulunamadı.</td></tr>
                                ) : inMovements.map((m: any, i: number) => (
                                    <tr key={i} className="border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                        <td className="px-4 py-3 font-mono text-xs">{new Date(m.created_at).toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-right font-bold text-green-600">+{m.quantity}</td>
                                        <td className="px-4 py-3 text-right">₺{Number(m.unit_price).toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">{m.description || m.document_type || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Clock className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-1">{activeTab.toUpperCase()} Geçmişi</h3>
                <p className="text-sm">Bu sekmeye ait yeterli veri bulunmuyor veya yakında eklenecek.</p>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Ürünler', href: '/products' },
            { title: product.name, href: `/products/${product.id}` }
        ]}>
            <Head title={product.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/products">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                            <div className="flex items-center space-x-3 mt-2 text-sm text-muted-foreground">
                                <Badge variant="secondary" className="px-2 py-0.5">{product.category?.name || 'Kategorisiz'}</Badge>
                                <span className="flex items-center"><Barcode className="w-3 h-3 mr-1" /> {product.stock_code}</span>
                            </div>
                        </div>
                    </div>
                    <Link href={`/products/${product.id}/edit`}>
                        <Button className="bg-orange-600 hover:bg-orange-700 shadow-sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Düzenle
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                    <Card className="lg:col-span-4 shadow-md border-neutral-200/60 dark:border-neutral-800 h-fit">
                        <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b pb-4">
                            <CardTitle className="text-lg flex items-center"><Package className="w-5 h-5 mr-2 text-orange-600"/> Ürün Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="flex items-start space-x-3 text-sm">
                                <Barcode className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-500">Barkod Numarası</p>
                                    <p className="text-lg font-mono font-medium text-neutral-900 dark:text-neutral-100">{product.barcode || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-sm">
                                <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-500">Marka</p>
                                    <p className="text-base font-medium">{product.brand?.name || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-sm">
                                <Package className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-500">Birim</p>
                                    <p className="text-base font-medium">{product.unit?.name || '-'}</p>
                                </div>
                            </div>
                            <div className="pt-4 mt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Alış Fiyatı</span>
                                    <span className="font-semibold text-base">₺{Number(product.purchase_price || 0).toLocaleString('tr-TR')}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Durum</span>
                                    {product.is_active ? 
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-0.5">Aktif</Badge> : 
                                        <Badge variant="secondary" className="px-2 py-0.5">Pasif</Badge>
                                    }
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-8 flex flex-col">
                        <div className="bg-white dark:bg-neutral-950 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-1.5 mb-6 flex gap-1 overflow-x-auto w-fit">
                            {[
                                { id: 'ozet', label: 'Genel Özet' },
                                { id: 'stok', label: 'Stok Hareketleri' },
                                { id: 'satis', label: 'Satış Analizi' },
                                { id: 'alis', label: 'Alış Geçmişi' },
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-2.5 text-sm font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${activeTab === tab.id ? 'bg-orange-100 text-orange-700 shadow-sm' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        <Card className="shadow-md border-neutral-200/60 dark:border-neutral-800 flex-1">
                            <CardContent className="p-6 md:p-8 h-full min-h-[400px]">
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {renderTabContent()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
