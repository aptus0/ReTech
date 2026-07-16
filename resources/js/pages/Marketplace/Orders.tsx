import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ShoppingBag, Printer, Eye, Truck, CheckCircle2, Clock, XCircle, AlertCircle, PackageSearch } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function MarketplaceOrders({ orders }: any) {
    const [days, setDays] = useState(15);
    const [processing, setProcessing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);

    const handleSync = () => {
        setProcessing(true);
        router.post('/marketplace/orders/sync', { days: days }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false)
        });
    };

    const handleApprove = (id: number) => {
        if (!confirm('Bu siparişi onaylayıp "Hazırlanıyor" aşamasına almak istediğinize emin misiniz?')) return;
        router.post(`/marketplace/orders/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Sipariş başarıyla onaylandı.'),
            onError: () => toast.error('Sipariş onaylanırken bir hata oluştu.')
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'new':
            case 'created':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"><Clock className="w-3 h-3 mr-1" /> Yeni</Badge>;
            case 'picking':
                return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none"><PackageSearch className="w-3 h-3 mr-1" /> Hazırlanıyor</Badge>;
            case 'shipped':
                return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none"><Truck className="w-3 h-3 mr-1" /> Kargoda</Badge>;
            case 'delivered':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Teslim Edildi</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none"><XCircle className="w-3 h-3 mr-1" /> İptal</Badge>;
            case 'invoiced':
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none"><Printer className="w-3 h-3 mr-1" /> Faturalandı</Badge>;
            default:
                return <Badge className="bg-neutral-100 text-neutral-700 hover:bg-neutral-100 border-none"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Pazaryeri Siparişleri" />
            
            <div className="flex flex-col gap-6 p-4 lg:p-8 h-full bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 dark:bg-neutral-900/30 backdrop-blur-sm p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Sipariş Yönetimi</h1>
                        <p className="text-muted-foreground mt-1">Tüm pazaryerlerinden düşen siparişlerinizi buradan yönetin ve kargo/fatura işlemlerini yapın.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select 
                            value={days} 
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="h-10 rounded-xl border border-input bg-white dark:bg-neutral-950 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            <option value={7}>Son 7 Gün</option>
                            <option value={15}>Son 15 Gün</option>
                            <option value={30}>Son 30 Gün</option>
                            <option value={60}>Son 60 Gün</option>
                            <option value={90}>Son 90 Gün</option>
                        </select>
                        <Button onClick={handleSync} disabled={processing} className="rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white transition-all">
                            <RefreshCw className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                            {processing ? 'Siparişler Çekiliyor...' : 'Siparişleri Çek'}
                        </Button>
                    </div>
                </div>
                
                <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm transition-all hover:shadow-md">
                    {(!orders?.data || orders.data.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                            <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-full mb-4">
                                <ShoppingBag className="h-12 w-12 text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Sipariş Bulunamadı</h3>
                            <p className="max-w-md mt-2 text-neutral-500">Trendyol veya diğer platformlardan henüz KobiX'e sipariş düşmedi veya seçili tarih aralığında veri yok.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-neutral-50/80 dark:bg-neutral-900/80">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-semibold py-4">Sipariş No</TableHead>
                                        <TableHead className="font-semibold">Pazaryeri</TableHead>
                                        <TableHead className="font-semibold">Müşteri</TableHead>
                                        <TableHead className="font-semibold">Tarih</TableHead>
                                        <TableHead className="font-semibold">Tutar</TableHead>
                                        <TableHead className="font-semibold">Durum</TableHead>
                                        <TableHead className="text-right font-semibold">İşlem</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.data.map((order: any) => (
                                        <TableRow key={order.id} className="group transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                                            <TableCell className="font-mono font-medium text-blue-600 dark:text-blue-400">{order.external_order_id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                                    {order.marketplaceAccount?.marketplace?.name || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{order.customer_name}</TableCell>
                                            <TableCell className="text-neutral-500">{new Date(order.ordered_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</TableCell>
                                            <TableCell className="font-semibold">₺{order.total_amount}</TableCell>
                                            <TableCell>
                                                {getStatusBadge(order.status)}
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-700" title="Sipariş Detayı" onClick={() => {
                                                        setSelectedOrder(order);
                                                        setDetailModalOpen(true);
                                                    }}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-emerald-100 hover:text-emerald-700" title="Siparişi Onayla" onClick={() => handleApprove(order.id)} disabled={order.status !== 'new' && order.status !== 'Created'}>
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-orange-100 hover:text-orange-700" title="Fatura Kes (E-Belge)" onClick={() => {
                                                        if (confirm('Bu siparişe e-Fatura/e-Arşiv kesmek istediğinize emin misiniz?')) {
                                                            router.post(`/marketplace/orders/${order.id}/invoice`, {}, { preserveScroll: true });
                                                        }
                                                    }}>
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isDetailModalOpen} onOpenChange={setDetailModalOpen}>
                <DialogContent className="max-w-[90vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <PackageSearch className="w-5 h-5 text-blue-600"/>
                            Sipariş Detayı: <span className="font-mono text-blue-600">{selectedOrder?.external_order_id}</span>
                        </DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6 mt-4">
                            {(() => {
                                let details: any = {};
                                try {
                                    details = JSON.parse(selectedOrder.raw_payload || '{}');
                                } catch (e) {
                                    details = {};
                                }

                                const shipment = details.shipmentAddress || {};
                                const invoice = details.invoiceAddress || {};
                                const lines = details.lines || [];

                                return (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-neutral-900 p-5 rounded-xl border shadow-sm">
                                                    <h3 className="font-semibold text-xs mb-3 text-blue-600 uppercase tracking-widest flex items-center gap-2"><Truck className="w-4 h-4"/> Teslimat Bilgileri</h3>
                                                    <p className="font-bold text-lg">{shipment.fullName || `${shipment.firstName || ''} ${shipment.lastName || ''}`}</p>
                                                    <p className="text-sm mt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">{shipment.address1} {shipment.address2}</p>
                                                    <p className="text-sm font-medium mt-1">{shipment.district} / {shipment.city}</p>
                                                    <p className="text-sm mt-3 font-mono bg-white dark:bg-neutral-950 inline-block px-2 py-1 rounded border">Tel: {shipment.phone || '-'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-900/10 dark:to-neutral-900 p-5 rounded-xl border shadow-sm">
                                                    <h3 className="font-semibold text-xs mb-3 text-orange-600 uppercase tracking-widest flex items-center gap-2"><Printer className="w-4 h-4"/> Fatura Bilgileri</h3>
                                                    <p className="font-bold text-lg">{invoice.fullName || `${invoice.firstName || ''} ${invoice.lastName || ''}`}</p>
                                                    <p className="text-sm mt-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">{invoice.address1} {invoice.address2}</p>
                                                    <p className="text-sm font-medium mt-1">{invoice.district} / {invoice.city}</p>
                                                    <p className="text-sm mt-3 font-mono bg-white dark:bg-neutral-950 inline-block px-2 py-1 rounded border">TC/VKN: {invoice.tcIdentityNumber || invoice.taxNumber || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 border rounded-xl overflow-hidden shadow-sm">
                                            <Table>
                                                <TableHeader className="bg-neutral-50 dark:bg-neutral-900">
                                                    <TableRow>
                                                        <TableHead>Ürün Adı</TableHead>
                                                        <TableHead>Barkod</TableHead>
                                                        <TableHead className="text-center">Adet</TableHead>
                                                        <TableHead className="text-right">Birim Fiyat</TableHead>
                                                        <TableHead className="text-right">Toplam</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {lines.map((line: any, idx: number) => (
                                                        <TableRow key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50">
                                                            <TableCell className="font-medium">{line.productName}</TableCell>
                                                            <TableCell className="font-mono text-xs text-muted-foreground">{line.barcode}</TableCell>
                                                            <TableCell className="text-center font-medium">
                                                                <Badge variant="secondary" className="px-2 py-0.5">{line.quantity}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right text-muted-foreground">₺{line.price}</TableCell>
                                                            <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">₺{(line.price * line.quantity).toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-xl text-white w-full md:w-72 shadow-md">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium opacity-90 uppercase text-xs tracking-wider">Genel Toplam</span>
                                                    <span className="text-2xl font-black">₺{details.totalPrice || selectedOrder.total_amount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
