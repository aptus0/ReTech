import { Head, Link, useForm, router } from '@inertiajs/react';
import { Send, RefreshCw, MoreVertical, Search, FileText, CheckCircle2, AlertTriangle, FileSignature, Printer, Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import GibInvoiceTab from './components/GibInvoiceTab';

export default function Index({ invoices, filters, stats }: { invoices: any, filters: any, stats: any }) {
    const [processingIds, setProcessingIds] = useState<number[]>([]);
    const [previewInvoice, setPreviewInvoice] = useState<any>(null);

    const { data: searchData, setData: setSearchData, get } = useForm({
        search: filters?.search || '',
        status: filters?.status || 'all',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/e-documents', { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        setSearchData('status', status);
        router.get('/e-documents', { search: searchData.search, status: status === 'all' ? '' : status }, { preserveState: true });
    };

    const sendToGib = (id: number) => {
        setProcessingIds(prev => [...prev, id]);
        router.post(`/e-documents/${id}/send`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Fatura GİB\'e gönderildi.');
            },
            onError: (err) => {
                toast.error(err.error || 'Gönderim sırasında hata oluştu.');
            },
            onFinish: () => {
                setProcessingIds(prev => prev.filter(i => i !== id));
            }
        });
    };

    const checkGibStatus = (id: number) => {
        setProcessingIds(prev => [...prev, id]);
        router.post(`/e-documents/${id}/status`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('GİB durumu başarıyla güncellendi.');
            },
            onError: (err) => {
                toast.error(err.error || 'Durum sorgulama hatası.');
            },
            onFinish: () => {
                setProcessingIds(prev => prev.filter(i => i !== id));
            }
        });
    };

    const StatusBadge = ({ status, error }: { status: string, error?: string }) => {
        switch(status) {
            case 'accepted':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Onaylandı</Badge>;
            case 'sent':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200"><Send className="w-3 h-3 mr-1"/> GİB'e İletildi</Badge>;
            case 'failed':
            case 'rejected':
                return (
                    <div className="flex flex-col items-center">
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><AlertTriangle className="w-3 h-3 mr-1"/> Hatalı / Reddedildi</Badge>
                        {error && <span className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={error}>{error}</span>}
                    </div>
                );
            case 'draft':
            default:
                return <Badge variant="secondary" className="bg-neutral-100 text-neutral-600"><FileSignature className="w-3 h-3 mr-1"/> Taslak (Bekliyor)</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'e-Belge Yönetimi', href: '/e-documents' }]}>
            <Head title="e-Belge (GİB) Yönetimi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">e-Fatura / e-Arşiv Yönetimi</h1>
                        <p className="text-muted-foreground mt-1">Kesilen faturaları GİB'e gönderin ve durumlarını takip edin.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="bg-neutral-50 dark:bg-neutral-900 border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-xs font-medium text-muted-foreground uppercase">Toplam Fatura</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-700">{stats.sent}</div>
                            <div className="text-xs font-medium text-blue-600 uppercase">GİB'de Bekleyen</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 dark:bg-green-900/20 border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-700">{stats.accepted}</div>
                            <div className="text-xs font-medium text-green-600 uppercase">Onaylanan</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-900/20 border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
                            <div className="text-xs font-medium text-red-600 uppercase">Hatalı / Red</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-orange-50 dark:bg-orange-900/20 border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-700">{stats.draft}</div>
                            <div className="text-xs font-medium text-orange-600 uppercase">Gönderilmeyi Bekleyen</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="local" className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <TabsList className="bg-neutral-100 dark:bg-neutral-800 p-1">
                            <TabsTrigger value="local" className="px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">Sistem Faturaları</TabsTrigger>
                            <TabsTrigger value="gib" className="px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900">GİB Portal Canlı Veri</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="local" className="m-0 flex-1 flex flex-col">
                        <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm mb-4">
                            <form onSubmit={handleSearch} className="flex flex-1 items-center gap-4">
                                <div className="relative w-full max-w-md">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="ERP Fatura No, GİB No veya Cari Ara..." 
                                        value={searchData.search} 
                                        onChange={e => setSearchData('search', e.target.value)} 
                                        className="pl-9 h-11"
                                    />
                                </div>
                                <Select value={searchData.status} onValueChange={handleStatusFilter}>
                                    <SelectTrigger className="w-[180px] h-11">
                                        <SelectValue placeholder="Tüm Durumlar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tüm Durumlar</SelectItem>
                                        <SelectItem value="draft">Taslak (Bekliyor)</SelectItem>
                                        <SelectItem value="sent">GİB'e İletildi</SelectItem>
                                        <SelectItem value="accepted">Onaylandı</SelectItem>
                                        <SelectItem value="failed">Hatalı</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button type="submit" variant="secondary" className="h-11 px-6">Filtrele</Button>
                            </form>
                        </div>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-card-foreground">
                            <thead className="text-[11px] uppercase bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-b">
                                <tr>
                                    <th className="px-6 py-4">SİSTEM FATURA NO</th>
                                    <th className="px-6 py-4">GİB BELGE NO / UUID</th>
                                    <th className="px-6 py-4">CARİ BİLGİSİ</th>
                                    <th className="px-6 py-4">TARİH</th>
                                    <th className="px-6 py-4 text-right">TUTAR</th>
                                    <th className="px-6 py-4 text-center">E-BELGE DURUMU</th>
                                    <th className="px-6 py-4 text-right">İŞLEMLER</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices?.data?.map((invoice: any) => (
                                    <tr key={invoice.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors group">
                                        <td className="px-6 py-3 font-mono font-semibold text-orange-600 cursor-pointer hover:underline" onClick={() => setPreviewInvoice(invoice)}>
                                            {invoice.invoice_number}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{invoice.e_document_no || '-'}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">{invoice.e_document_uuid || 'UUID Yok'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="font-medium">{invoice.customer?.name || 'Perakende Müşteri'}</div>
                                            {invoice.customer?.tax_number && (
                                                <div className="text-[10px] text-muted-foreground">VKN: {invoice.customer.tax_number}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            {new Date(invoice.issue_date).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-3 text-right font-bold font-mono text-base">
                                            ₺{Number(invoice.grand_total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <StatusBadge status={invoice.e_document_status} error={invoice.e_document_error} />
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(invoice.e_document_status === 'draft' || invoice.e_document_status === 'failed') && (
                                                    <Button 
                                                        size="sm" 
                                                        className="bg-orange-600 hover:bg-orange-700 text-xs py-1 h-8 shadow-sm"
                                                        onClick={() => sendToGib(invoice.id)}
                                                        disabled={processingIds.includes(invoice.id)}
                                                    >
                                                        {processingIds.includes(invoice.id) ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                                                        GİB'e Gönder
                                                    </Button>
                                                )}
                                                {(invoice.e_document_status === 'sent') && (
                                                    <Button 
                                                        variant="outline"
                                                        size="sm" 
                                                        className="text-xs py-1 h-8"
                                                        onClick={() => checkGibStatus(invoice.id)}
                                                        disabled={processingIds.includes(invoice.id)}
                                                    >
                                                        <RefreshCw className={`w-3 h-3 mr-1 ${processingIds.includes(invoice.id) ? 'animate-spin' : ''}`} />
                                                        Durum Sorgula
                                                    </Button>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="w-4 h-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <Link href={`/e-documents/${invoice.id}`}>
                                                            <DropdownMenuItem className="cursor-pointer">
                                                                <FileText className="w-4 h-4 mr-2" /> Fatura Detayı / PDF
                                                            </DropdownMenuItem>
                                                        </Link>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!invoices?.data || invoices.data.length === 0) && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 mb-4 opacity-20" />
                                            <span>Gösterilecek e-belge bulunamadı.</span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </TabsContent>

                <TabsContent value="gib" className="m-0 flex-1 flex flex-col h-full">
                    <GibInvoiceTab />
                </TabsContent>
            </Tabs>
            </div>

            <Sheet open={!!previewInvoice} onOpenChange={(o) => !o && setPreviewInvoice(null)}>
                <SheetContent side="right" className="w-full sm:max-w-2xl sm:w-[800px] overflow-y-auto">
                    <SheetHeader className="mb-6 flex flex-row items-center justify-between border-b pb-4">
                        <div>
                            <SheetTitle className="text-2xl font-bold text-orange-600">Fatura Görüntüleyici</SheetTitle>
                            <p className="text-sm text-muted-foreground">Belge detayları ve görselleştirilmiş UBL formatı.</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/e-documents/${previewInvoice?.id}`}>
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white" size="sm">
                                    <FileText className="w-4 h-4 mr-2"/> Tam Ekran & PDF Görüntüle
                                </Button>
                            </Link>
                        </div>
                    </SheetHeader>
                    
                    {previewInvoice && (
                        <div className="space-y-6">
                            <div className="bg-white border rounded-xl shadow-sm p-8 font-mono text-sm relative">
                                <div className="absolute right-8 top-8">
                                    <div className="border-4 border-double border-neutral-300 p-2 text-center text-neutral-400 font-bold uppercase rotate-12">
                                        e-{previewInvoice.e_document_status === 'accepted' ? 'FATURA' : 'ARŞİV'}
                                    </div>
                                </div>
                                <div className="flex justify-between items-start mb-12">
                                    <div className="max-w-[50%]">
                                        <h3 className="text-xl font-bold mb-2">ENVANZO MAĞAZACILIK A.Ş.</h3>
                                        <p className="text-neutral-500">Mecidiyeköy Mah. Büyükdere Cad. No:12<br/>Şişli / İSTANBUL<br/>VD: Şişli - 1234567890</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">Fatura No:</p>
                                        <p className="mb-2 text-orange-600">{previewInvoice.e_document_no || previewInvoice.invoice_number}</p>
                                        <p className="font-bold">Düzenleme Tarihi:</p>
                                        <p className="mb-2">{new Date(previewInvoice.issue_date).toLocaleDateString('tr-TR')}</p>
                                        <p className="font-bold">UUID:</p>
                                        <p className="text-[10px] break-all w-48 text-right float-right">{previewInvoice.e_document_uuid || 'Oluşturulmadı'}</p>
                                    </div>
                                </div>
                                
                                <div className="border border-neutral-200 rounded-lg p-4 mb-8 bg-neutral-50">
                                    <h4 className="font-bold mb-2 border-b pb-2">SAYIN</h4>
                                    <p className="font-bold text-lg">{previewInvoice.customer?.name || 'Perakende Müşteri'}</p>
                                    <p>{previewInvoice.customer?.address || 'Türkiye'}</p>
                                    <p>VD/TCKN: {previewInvoice.customer?.tax_number || '11111111111'}</p>
                                </div>
                                
                                <table className="w-full mb-8">
                                    <thead className="border-b-2 border-neutral-800">
                                        <tr>
                                            <th className="py-2 text-left">Ürün/Hizmet</th>
                                            <th className="py-2 text-center">Miktar</th>
                                            <th className="py-2 text-right">B.Fiyat</th>
                                            <th className="py-2 text-right">KDV</th>
                                            <th className="py-2 text-right">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-b border-neutral-300">
                                        {previewInvoice.items && previewInvoice.items.length > 0 ? (
                                            previewInvoice.items.map((item: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="py-3">{item.product?.name || item.description || 'Ürün'}</td>
                                                    <td className="py-3 text-center">{item.quantity} Adet</td>
                                                    <td className="py-3 text-right">{(item.unit_price).toFixed(2)}</td>
                                                    <td className="py-3 text-right">%{item.tax_rate || 20}</td>
                                                    <td className="py-3 text-right">{(item.total).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="py-3">Muhtelif Ürün ve Hizmetler</td>
                                                <td className="py-3 text-center">1.00 Adet</td>
                                                <td className="py-3 text-right">{(previewInvoice.grand_total / 1.2).toFixed(2)}</td>
                                                <td className="py-3 text-right">%20</td>
                                                <td className="py-3 text-right">{(previewInvoice.grand_total / 1.2).toFixed(2)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                
                                <div className="flex justify-end">
                                    <div className="w-64">
                                        <div className="flex justify-between py-1">
                                            <span className="font-bold">Mal/Hizmet Toplamı:</span>
                                            <span>₺{(previewInvoice.grand_total / 1.2).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b">
                                            <span className="font-bold">Hesaplanan KDV:</span>
                                            <span>₺{(previewInvoice.grand_total - (previewInvoice.grand_total / 1.2)).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 text-lg">
                                            <span className="font-black">GENEL TOPLAM:</span>
                                            <span className="font-black">₺{Number(previewInvoice.grand_total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-12 text-center text-xs text-neutral-400">
                                    <p>Bu e-belge elektronik ortamda oluşturulmuş olup, mali değeri {previewInvoice.e_document_status === 'accepted' ? 'vardır' : 'taslak halindedir'}.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
