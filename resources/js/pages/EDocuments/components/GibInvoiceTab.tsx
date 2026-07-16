import React, { useState } from 'react';
import { RefreshCw, Download, FileText, CheckCircle2, AlertTriangle, Eye, Send, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import axios from 'axios';

export default function GibInvoiceTab() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewInvoice, setPreviewInvoice] = useState<any>(null);
    const [loadingHtml, setLoadingHtml] = useState(false);
    
    // SMS Signing States
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [smsCode, setSmsCode] = useState('');
    const [signingOid, setSigningOid] = useState<string | null>(null);
    const [isSigning, setIsSigning] = useState(false);

    const fetchGibInvoices = async () => {
        setLoading(true);
        setSelectedInvoices([]);
        try {
            const res = await axios.get('/api/e-documents/gib');
            if (res.data.success) {
                setInvoices(res.data.data);
                toast.success('Faturalar GİB\'den başarıyla çekildi.');
            } else {
                toast.error(res.data.message || 'GİB\'den faturalar alınamadı.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (ettn: string) => {
        setSelectedInvoices(prev => 
            prev.includes(ettn) ? prev.filter(i => i !== ettn) : [...prev, ettn]
        );
    };

    const toggleAll = () => {
        const signable = invoices.filter(i => i.onayDurumu === 'Onay Bekliyor' || i.onayDurumu === 'İmzasız');
        if (selectedInvoices.length === signable.length) {
            setSelectedInvoices([]);
        } else {
            setSelectedInvoices(signable.map(i => i.ettn));
        }
    };

    const handleStartSign = async () => {
        if (selectedInvoices.length === 0) {
            toast.error('Lütfen imzalanacak faturaları seçin.');
            return;
        }

        setIsSigning(true);
        try {
            const res = await axios.post('/api/e-documents/gib/sign/start');
            if (res.data.success) {
                setSigningOid(res.data.oid);
                setSmsCode('');
                setIsSignModalOpen(true);
                toast.success('SMS kodu cep telefonunuza gönderildi.');
            } else {
                toast.error(res.data.message || 'SMS başlatılamadı.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setIsSigning(false);
        }
    };

    const handleCompleteSign = async () => {
        if (!smsCode || smsCode.length < 6) {
            toast.error('Lütfen geçerli bir SMS kodu girin.');
            return;
        }

        setIsSigning(true);
        try {
            const res = await axios.post('/api/e-documents/gib/sign/complete', {
                code: smsCode,
                oid: signingOid,
                documents: selectedInvoices
            });
            if (res.data.success) {
                toast.success('Faturalar başarıyla imzalandı ve Trendyol aktarım kuyruğuna eklendi.');
                setIsSignModalOpen(false);
                setSelectedInvoices([]);
                fetchGibInvoices(); // Refresh the list
            } else {
                toast.error(res.data.message || 'Onaylama işlemi başarısız.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Onaylama hatası.');
        } finally {
            setIsSigning(false);
        }
    };

    const viewGibInvoice = async (invoice: any) => {
        setPreviewInvoice(invoice);
        setPreviewHtml(null);
        setLoadingHtml(true);

        try {
            const res = await axios.get(`/api/e-documents/gib/${invoice.ettn}/html`);
            if (res.data.success) {
                setPreviewHtml(res.data.html);
            } else {
                toast.error(res.data.message || 'Fatura detayı alınamadı.');
                setPreviewInvoice(null);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Fatura HTML alınırken hata oluştu.');
            setPreviewInvoice(null);
        } finally {
            setLoadingHtml(false);
        }
    };

    const downloadImage = async (type: 'png' | 'jpeg') => {
        const iframe = document.getElementById('gib-invoice-iframe') as HTMLIFrameElement;
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument) {
            toast.error('Fatura henüz yüklenmedi.');
            return;
        }

        const toastId = toast.loading(`${type.toUpperCase()} hazırlanıyor...`);
        try {
            const body = iframe.contentDocument.body;
            
            const originalMargin = body.style.margin;
            body.style.margin = '0';
            
            const canvas = await html2canvas(body, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 800,
            });
            
            body.style.margin = originalMargin;

            const link = document.createElement('a');
            link.download = `fatura_${previewInvoice?.ettn}.${type}`;
            link.href = canvas.toDataURL(`image/${type}`, 1.0);
            link.click();
            toast.success(`${type.toUpperCase()} indirildi.`, { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Resim oluşturulamadı.', { id: toastId });
        }
    };

    const downloadPdf = async () => {
        const iframe = document.getElementById('gib-invoice-iframe') as HTMLIFrameElement;
        if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

        const toastId = toast.loading('PDF hazırlanıyor...');
        try {
            const body = iframe.contentDocument.body;
            const originalMargin = body.style.margin;
            body.style.margin = '0';
            
            const canvas = await html2canvas(body, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 800,
            });
            
            body.style.margin = originalMargin;

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`fatura_${previewInvoice?.ettn}.pdf`);
            toast.success('PDF indirildi.', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('PDF oluşturulamadı.', { id: toastId });
        }
    };

    const signableInvoicesCount = invoices.filter(i => i.onayDurumu === 'Onay Bekliyor' || i.onayDurumu === 'İmzasız').length;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white dark:bg-neutral-900 border rounded-xl shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">GİB Portal (Canlı Veri)</h2>
                    <p className="text-sm text-neutral-500">Bu sayfada, GİB e-Arşiv portalında doğrudan sizin veya adınıza kesilen son 30 günlük faturaları canlı olarak listeleyebilirsiniz.</p>
                </div>
                <div className="flex gap-2">
                    {selectedInvoices.length > 0 && (
                        <Button 
                            onClick={handleStartSign} 
                            disabled={isSigning} 
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                            <Key className="w-4 h-4" />
                            {selectedInvoices.length} Faturayı İmzala
                        </Button>
                    )}
                    <Button onClick={fetchGibInvoices} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Çekiliyor...' : 'GİB\'den Faturaları Getir'}
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-card-foreground">
                        <thead className="text-[11px] uppercase bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-b">
                            <tr>
                                <th className="px-6 py-4 w-[50px]">
                                    <Checkbox 
                                        checked={selectedInvoices.length === signableInvoicesCount && signableInvoicesCount > 0} 
                                        onCheckedChange={toggleAll}
                                        disabled={signableInvoicesCount === 0}
                                    />
                                </th>
                                <th className="px-6 py-4">BELGE TARİHİ</th>
                                <th className="px-6 py-4">BELGE NO / ETTN (UUID)</th>
                                <th className="px-6 py-4">ALICI/SATICI BİLGİSİ</th>
                                <th className="px-6 py-4 text-right">TUTAR</th>
                                <th className="px-6 py-4 text-center">DURUM</th>
                                <th className="px-6 py-4 text-right">İŞLEMLER</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? invoices.map((invoice: any) => {
                                const isSignable = invoice.onayDurumu === 'Onay Bekliyor' || invoice.onayDurumu === 'İmzasız';
                                return (
                                <tr key={invoice.ettn} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-3">
                                        {isSignable ? (
                                            <Checkbox 
                                                checked={selectedInvoices.includes(invoice.ettn)}
                                                onCheckedChange={() => toggleSelection(invoice.ettn)}
                                            />
                                        ) : (
                                            <div className="w-4 h-4 rounded border bg-neutral-100 opacity-50 cursor-not-allowed"></div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 font-mono">
                                        {invoice.belgeTarihi}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-orange-600">{invoice.belgeNumarasi || '-'}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono">{invoice.ettn}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="font-medium">{invoice.aliciUnvanAdSoyad || invoice.saticiUnvanAdSoyad || 'Bilinmeyen Cari'}</div>
                                        <div className="text-[10px] text-muted-foreground">VKN/TCKN: {invoice.aliciVknTckn || invoice.saticiVknTckn || '-'}</div>
                                    </td>
                                    <td className="px-6 py-3 text-right font-bold font-mono text-base">
                                        {invoice.odenecekTutar}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        {invoice.onayDurumu === 'Onaylandı' ? (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Onaylandı</Badge>
                                        ) : invoice.onayDurumu === 'İptal Edildi' ? (
                                            <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><AlertTriangle className="w-3 h-3 mr-1"/> İptal</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-neutral-100 text-neutral-600">{invoice.onayDurumu}</Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="h-8 gap-1"
                                            onClick={() => viewGibInvoice(invoice)}
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Görüntüle
                                        </Button>
                                    </td>
                                </tr>
                            )}) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                                        {!loading ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <FileText className="w-12 h-12 mb-4 opacity-20" />
                                                <span>Listelenecek GİB faturası bulunmuyor. Sağ üstteki butondan çekebilirsiniz.</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center">
                                                <RefreshCw className="w-8 h-8 mb-4 animate-spin opacity-40 text-orange-600" />
                                                <span>GİB Portalından faturalar getiriliyor, lütfen bekleyin...</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>GİB SMS Doğrulama</DialogTitle>
                        <DialogDescription>
                            Lütfen telefonunuza GİB tarafından gönderilen 6 haneli SMS kodunu giriniz. İmzalanacak Fatura Sayısı: <strong className="text-orange-600">{selectedInvoices.length}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <Input 
                            type="text" 
                            placeholder="Örn: 123456" 
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value)}
                            maxLength={6}
                            className="text-center text-2xl tracking-widest font-mono"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSignModalOpen(false)}>İptal</Button>
                        <Button onClick={handleCompleteSign} disabled={isSigning || smsCode.length < 6} className="gap-2">
                            {isSigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            İmzala ve Gönder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Sheet open={!!previewInvoice} onOpenChange={(o) => !o && setPreviewInvoice(null)}>
                <SheetContent side="right" className="w-full sm:max-w-4xl sm:w-[1000px] overflow-hidden flex flex-col p-0">
                    <SheetHeader className="p-6 pb-4 border-b shrink-0 flex flex-row items-center justify-between shadow-sm bg-white z-10">
                        <div>
                            <SheetTitle className="text-2xl font-bold text-orange-600">GİB Fatura Görüntüleyici</SheetTitle>
                            <p className="text-sm text-muted-foreground">Orijinal GİB e-Arşiv faturası tasarımı.</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            {previewHtml && (
                                <>
                                    <Button size="sm" variant="outline" className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50" onClick={downloadPdf}>
                                        <Download className="w-4 h-4"/> PDF
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => downloadImage('png')}>
                                        <Download className="w-4 h-4"/> PNG
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-2 border-green-200 text-green-700 hover:bg-green-50" onClick={() => downloadImage('jpeg')}>
                                        <Download className="w-4 h-4"/> JPEG
                                    </Button>
                                </>
                            )}
                        </div>
                    </SheetHeader>
                    
                    <div className="flex-1 overflow-auto bg-neutral-100 p-6 flex justify-center">
                        {loadingHtml ? (
                            <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                                <RefreshCw className="w-8 h-8 mb-4 animate-spin text-orange-600" />
                                <span>GİB'den fatura HTML'i indiriliyor...</span>
                            </div>
                        ) : previewHtml ? (
                            <div className="bg-white shadow-xl max-w-[850px] w-full min-h-[1100px] overflow-hidden">
                                <iframe 
                                    id="gib-invoice-iframe"
                                    srcDoc={previewHtml} 
                                    className="w-full h-[1100px] border-0" 
                                    title="GIB Fatura"
                                    sandbox="allow-same-origin allow-scripts"
                                />
                            </div>
                        ) : null}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
