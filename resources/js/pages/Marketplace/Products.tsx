import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Package, Trash2, Printer, CheckCircle2, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export default function MarketplaceProducts({ marketplaceProducts, filters }: any) {
    const [processing, setProcessing] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { data: searchData, setData: setSearchData, get } = useForm({
        search: filters?.search || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/marketplace/products', { preserveState: true });
    };

    const handleSync = () => {
        setProcessing(true);
        router.post('/marketplace/products/sync', {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => toast.success('Ürünler başarıyla senkronize edildi.'),
        });
    };

    const handlePushStocks = () => {
        if (!confirm('Tüm güncel stok ve fiyat bilgilerini Trendyol\'a göndermek istediğinize emin misiniz?')) return;
        
        router.post('/marketplace/products/push-stocks', {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Stoklar başarıyla gönderildi.'),
            onError: () => toast.error('Stok gönderimi sırasında bir hata oluştu.')
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(marketplaceProducts.data.map((p: any) => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        }
    };

    const handleBulkDelete = () => {
        if(selectedIds.length === 0) return;
        if(confirm('Seçili ürünlerin pazaryeri bağlantılarını silmek istediğinize emin misiniz?')) {
            router.delete('/marketplace/products/bulk-delete', {
                data: { ids: selectedIds },
                onSuccess: () => {
                    setSelectedIds([]);
                    toast.success('Seçili ürünlerin bağlantıları silindi.');
                }
            });
        }
    };

    const handleBulkBarcode = () => {
        if(selectedIds.length === 0) return;
        toast.info('Seçili ürünler için barkod yazdırma işlemi başlatıldı.');
    };

    const filteredProducts = marketplaceProducts?.data || [];

    return (
        <AppLayout>
            <Head title="Pazaryeri Ürünleri" />
            
            <div className="flex flex-col gap-6 p-4 lg:p-8 h-full bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 dark:bg-neutral-900/30 backdrop-blur-sm p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pazaryeri Ürünleri</h1>
                        <p className="text-muted-foreground mt-1">Trendyol ve diğer platformlardaki ürünlerinizi, stoklarınızı ve eşleşmeleri yönetin.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={handlePushStocks} className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-colors">
                            <Package className="mr-2 h-4 w-4" />
                            Stok/Fiyat Gönder
                        </Button>
                        <Button onClick={handleSync} disabled={processing} className="rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white transition-all">
                            <RefreshCw className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                            {processing ? 'Senkronize Ediliyor...' : 'Ürünleri Çek'}
                        </Button>
                    </div>
                </div>
                
                <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm transition-all hover:shadow-md">
                    <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Ürün adı veya barkod ile ara..." 
                                className="pl-9 rounded-xl border-neutral-200/80 bg-white dark:bg-neutral-900"
                                value={searchData.search}
                                onChange={(e) => setSearchData('search', e.target.value)}
                            />
                        </form>
                        {selectedIds.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
                                        Toplu İşlemler ({selectedIds.length})
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl">

                                    <DropdownMenuItem className="cursor-pointer" onClick={handleBulkBarcode}>
                                        <Printer className="w-4 h-4 mr-2" /> Barkod Bas
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50" onClick={handleBulkDelete}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Seçilenleri Sil
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                            <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-full mb-4">
                                <Package className="h-12 w-12 text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Eşleşen Ürün Bulunamadı</h3>
                            <p className="max-w-md mt-2 text-neutral-500">Arama kriterlerinize uyan veya senkronize edilmiş bir ürün bulunmuyor.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-neutral-50/80 dark:bg-neutral-900/80">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-12 text-center py-4">
                                            <Checkbox 
                                                checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead className="w-16">Görsel</TableHead>
                                        <TableHead className="font-semibold">Ürün Adı</TableHead>
                                        <TableHead className="font-semibold">Pazaryeri</TableHead>
                                        <TableHead className="font-semibold">Barkod</TableHead>
                                        <TableHead className="font-semibold text-right">Stok</TableHead>
                                        <TableHead className="font-semibold text-right">Fiyat</TableHead>
                                        <TableHead className="font-semibold text-center">Durum</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((mp: any) => (
                                        <TableRow key={mp.id} className="group transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-900/10">
                                            <TableCell className="text-center">
                                                <Checkbox 
                                                    checked={selectedIds.includes(mp.id)}
                                                    onCheckedChange={(checked) => handleSelect(mp.id, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 bg-white shadow-sm flex items-center justify-center relative">
                                                    {mp.product?.image ? (
                                                        <img 
                                                            src={mp.product.image.startsWith('http') ? mp.product.image : `/storage/${mp.product.image}`} 
                                                            alt={mp.product.name}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125"
                                                        />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-neutral-300" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-neutral-800 dark:text-neutral-200">{mp.product?.name}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{mp.product?.category?.name || 'Kategorisiz'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                                    {mp.marketplaceAccount?.marketplace?.name || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">{mp.barcode || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary" className={`px-2 py-0.5 ${mp.product?.current_stock < 5 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {mp.product?.current_stock}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                                                ₺{mp.product?.sale_price}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {mp.approval_status === 'approved' ? (
                                                    <div className="flex items-center justify-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-full w-max mx-auto border border-emerald-100">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Onaylı
                                                    </div>
                                                ) : mp.approval_status === 'rejected' ? (
                                                    <div className="flex items-center justify-center text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded-full w-max mx-auto border border-red-100">
                                                        <XCircle className="w-3 h-3 mr-1" /> Reddedildi
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center text-orange-600 text-sm font-medium bg-orange-50 px-2 py-1 rounded-full w-max mx-auto border border-orange-100">
                                                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Bekliyor
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {/* Sayfalama */}
                    {marketplaceProducts?.links && marketplaceProducts.data.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-neutral-50 dark:bg-neutral-900/50">
                            <div className="text-sm text-muted-foreground">
                                Toplam <span className="font-bold text-neutral-800 dark:text-neutral-200">{marketplaceProducts.total}</span> ürün
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {marketplaceProducts.links.map((link: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(link.url, {}, { preserveScroll: true });
                                            }
                                        }}
                                        disabled={!link.url}
                                        className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                                            link.active 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                                : 'bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-neutral-200 dark:border-neutral-700'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
