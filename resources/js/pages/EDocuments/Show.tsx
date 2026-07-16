import { Head, Link, router } from '@inertiajs/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ArrowLeft, Download, FileImage, FileText, Printer, Send, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

export default function Show({ invoice, companySettings }: { invoice: any, companySettings: any }) {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [smsCode, setSmsCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current) {
return;
}
        
        const promise = new Promise(async (resolve, reject) => {
            try {
                const canvas = await html2canvas(invoiceRef.current!, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Fatura_${invoice.invoice_number || invoice.id}.pdf`);
                resolve(true);
            } catch (error) {
                console.error("PDF oluşturulurken hata:", error);
                reject(error);
            }
        });

        toast.promise(promise, {
            loading: 'PDF dosyası hazırlanıyor, lütfen bekleyin...',
            success: 'PDF başarıyla indirildi!',
            error: 'PDF oluşturulamadı. Harici logolar (CORS) engelliyor olabilir.'
        });
    };

    const handleDownloadPNG = async () => {
        if (!invoiceRef.current) {
return;
}
        
        const promise = new Promise(async (resolve, reject) => {
            try {
                const canvas = await html2canvas(invoiceRef.current!, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });
                
                const link = document.createElement('a');
                link.download = `Fatura_${invoice.invoice_number || invoice.id}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                resolve(true);
            } catch (error) {
                console.error("PNG oluşturulurken hata:", error);
                reject(error);
            }
        });

        toast.promise(promise, {
            loading: 'PNG resmi hazırlanıyor, lütfen bekleyin...',
            success: 'Resim başarıyla indirildi!',
            error: 'Resim oluşturulamadı. Harici logolar (CORS) engelliyor olabilir.'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSendGib = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (smsCode !== '123456') {
            toast.error('Hatalı SMS kodu! Test için "123456" giriniz.');

            return;
        }

        setIsSubmitting(true);
        
        router.post(`/e-documents/${invoice.id}/send`, {}, {
            onSuccess: () => {
                setIsSmsModalOpen(false);
                setSmsCode('');
                toast.success('Fatura başarıyla e-imzalandı ve GİB\'e gönderildi!');
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string || 'Gönderim sırasında hata oluştu.');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const isEDocument = invoice.e_document_type === 'e_invoice' || invoice.e_document_type === 'e_archive';

    // Fatura KDV Dahil/Hariç Mantığını Düzelt
    // Eğer veritabanında subtotal ve grand_total eşitse, KDV fiyata dahil olarak kaydedilmiş demektir.
    // Ancak resmi faturada "Mal Hizmet Tutarı" ve "Birim Fiyat" HER ZAMAN KDV HARİÇ gösterilmelidir.
    const isKdvIncluded = Number(invoice.subtotal) === Number(invoice.grand_total) && Number(invoice.tax_total) > 0;
    const realInvoiceSubtotal = isKdvIncluded ? (Number(invoice.grand_total) - Number(invoice.tax_total)) : Number(invoice.subtotal);

    return (
        <AppLayout breadcrumbs={[
            { title: 'e-Belgeler', href: '/e-documents' },
            { title: invoice.invoice_number || `Fatura #${invoice.id}`, href: `/e-documents/${invoice.id}` }
        ]}>
            <Head title={invoice.invoice_number || `Fatura #${invoice.id}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
                {/* Header and Actions */}
                <div className="flex items-center justify-between no-print flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/e-documents">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Fatura Görüntüleme</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground font-mono">{invoice.invoice_number || 'Taslak Fatura'}</span>
                                {invoice.e_document_status === 'sent' || invoice.e_document_status === 'accepted' ? (
                                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> GİB ONAYLI
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full">
                                        TASLAK
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {(!invoice.e_document_status || invoice.e_document_status === 'draft' || invoice.e_document_status === 'failed') && (
                            <Dialog open={isSmsModalOpen} onOpenChange={setIsSmsModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-green-600 hover:bg-green-700 shadow-md">
                                        <Send className="w-4 h-4 mr-2" /> GİB'e Gönder (E-İmza)
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-green-600" />
                                            E-İmza / SMS Onayı
                                        </DialogTitle>
                                        <DialogDescription>
                                            Faturayı GİB'e göndermek ve e-imzalamak için yetkili telefonunuza gönderilen 6 haneli doğrulama kodunu giriniz.
                                            <br/><br/>
                                            <span className="text-xs text-orange-600 font-medium">Not: Test ortamı için "123456" yazınız.</span>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSendGib} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="code" className="sr-only">SMS Kodu</Label>
                                            <Input
                                                id="code"
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                placeholder="123456"
                                                value={smsCode}
                                                onChange={(e) => setSmsCode(e.target.value)}
                                                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                                                autoFocus
                                                required
                                            />
                                        </div>
                                        <DialogFooter className="sm:justify-between flex-row-reverse">
                                            <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSubmitting || smsCode.length !== 6}>
                                                {isSubmitting ? 'Gönderiliyor...' : 'Onayla ve Gönder'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button variant="outline" onClick={handleDownloadPNG}>
                            <FileImage className="w-4 h-4 mr-2" /> PNG İndir
                        </Button>
                        <Button variant="outline" onClick={handleDownloadPDF} className="border-red-200 text-red-700 hover:bg-red-50">
                            <FileText className="w-4 h-4 mr-2" /> PDF İndir
                        </Button>
                        <Button onClick={handlePrint} className="bg-orange-600 hover:bg-orange-700">
                            <Printer className="w-4 h-4 mr-2" /> Yazdır
                        </Button>
                    </div>
                </div>

                {/* A4 Paper Container for Invoice */}
                <div className="flex justify-center w-full overflow-x-auto print:overflow-visible print:w-auto print:block">
                    <div 
                        ref={invoiceRef}
                        id="invoice-print-area"
                        className="bg-white text-black p-8 md:p-12 shadow-xl border border-neutral-200 w-[210mm] min-h-[297mm] relative shrink-0 print:shadow-none print:border-none print:p-0 print:m-0"
                    >
                        {/* Header: Company Info (Left), Center (Empty), GIB Logo (Right) */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col max-w-[40%] text-xs text-neutral-800">
                                {companySettings.store_logo && (
                                    <img src={companySettings.store_logo} alt="LOGO" className="h-16 w-auto object-contain mb-4" crossOrigin="anonymous" />
                                )}
                                <h2 className="text-sm font-bold text-neutral-800 uppercase mb-1">{companySettings.company_name}</h2>
                                <div className="space-y-0.5 font-medium">
                                    <p>{companySettings.address} {companySettings.district} {companySettings.city ? `/ ${companySettings.city}` : ''}</p>
                                    <p>Tel: {companySettings.phone || '-'} | E-Posta: {companySettings.email || '-'}</p>
                                    {companySettings.website && <p>Web: {companySettings.website}</p>}
                                    <p>Vergi Dairesi: <span className="font-semibold">{companySettings.tax_office || '-'}</span></p>
                                    <p>VKN/TCKN: <span className="font-semibold">{companySettings.tax_number || '-'}</span></p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center pt-8">
                                {isEDocument && (
                                    <p className="text-xl font-bold mt-2 uppercase tracking-widest text-neutral-800">
                                        {invoice.e_document_type === 'e_invoice' ? 'e-FATURA' : 'e-ARŞİV FATURA'}
                                    </p>
                                )}
                            </div>

                            <div className="w-[30%] flex justify-end">
                                <img src="/images/gib_logo.png" alt="GİB" className="w-32 h-auto object-contain" />
                            </div>
                        </div>

                        <div className="border-t-[3px] border-black mb-1"></div>
                        <div className="border-t border-black mb-8"></div>

                        {/* Customer and Invoice Details */}
                        <div className="flex justify-between mb-10">
                            <div className="w-1/2 pr-4">
                                <h3 className="text-xs font-bold text-neutral-800 mb-1 uppercase border-b-2 border-black pb-0.5">SAYIN</h3>
                                <h4 className="text-sm font-bold text-neutral-800 uppercase mb-3">{invoice.customer?.name || 'Müşteri Bilgisi Yok'}</h4>
                                <div className="text-[11px] text-neutral-800 mt-2 space-y-0.5 font-medium">
                                    <p>{invoice.customer?.address || ''} {invoice.customer?.district || ''} {invoice.customer?.city ? `/ ${invoice.customer.city}` : ''}</p>
                                    <p className="pt-2">E-Posta: {invoice.customer?.email || '-'}</p>
                                    <p>Tel: {invoice.customer?.phone || '-'} Fax: -</p>
                                    <p>Vergi Dairesi: {invoice.customer?.tax_office || '-'}</p>
                                    <p>VKN/TCKN: {invoice.customer?.tax_number || invoice.customer?.identity_number || '-'}</p>
                                </div>
                            </div>

                            <div className="w-1/3 pl-4">
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr>
                                            <td className="py-1 font-semibold text-neutral-600">Özelleştirme No</td>
                                            <td className="py-1 text-right">TR1.2</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 font-semibold text-neutral-600">Senaryo</td>
                                            <td className="py-1 text-right">{invoice.e_document_type === 'e_invoice' ? 'TİCARİ FATURA' : 'TEMEL FATURA'}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 font-semibold text-neutral-600">Fatura Tipi</td>
                                            <td className="py-1 text-right">SATIŞ</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 font-semibold text-neutral-600">Fatura Tarihi</td>
                                            <td className="py-1 text-right">{new Date(invoice.issue_date || invoice.created_at).toLocaleDateString('tr-TR')}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 font-semibold text-neutral-600">Fatura No</td>
                                            <td className="py-1 text-right font-mono font-bold text-orange-700">{invoice.invoice_number || '-'}</td>
                                        </tr>
                                            <tr>
                                                <td colSpan={2} className="py-2 text-xs font-semibold text-neutral-800 break-all border-t mt-2 pt-2">
                                                    ETTN: {invoice.e_document_uuid || invoice.id}
                                                </td>
                                            </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-8">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-neutral-100 text-neutral-800 border-y-2 border-neutral-300">
                                        <th className="py-2 px-2 text-left w-12">Sıra</th>
                                        <th className="py-2 px-2 text-left">Mal / Hizmet</th>
                                        <th className="py-2 px-2 text-center w-20">Miktar</th>
                                        <th className="py-2 px-2 text-right w-24">Birim Fiyat</th>
                                        <th className="py-2 px-2 text-right w-16">KDV</th>
                                        <th className="py-2 px-2 text-right w-28">Tutar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items?.length > 0 ? invoice.items.map((item: any, index: number) => {
                                        const itemTotalWithTax = Number(item.total);
                                        const itemTax = Number(item.tax_amount);
                                        const itemTotalWithoutTax = isKdvIncluded ? (itemTotalWithTax - itemTax) : itemTotalWithTax;
                                        const itemUnitPriceWithoutTax = Number(item.quantity) > 0 ? (itemTotalWithoutTax / Number(item.quantity)) : 0;
                                        const calculatedTaxRate = (itemTax > 0 && itemTotalWithoutTax > 0) ? (itemTax / itemTotalWithoutTax * 100).toFixed(0) : (item.tax_rate || '0');

                                        return (
                                            <tr key={item.id} className="border-b border-neutral-200">
                                                <td className="py-3 px-2 text-center">{index + 1}</td>
                                                <td className="py-3 px-2">
                                                    <div className="font-semibold text-neutral-800">{item.product_name}</div>
                                                    {item.description && <div className="text-[10px] text-neutral-500">{item.description}</div>}
                                                </td>
                                                <td className="py-3 px-2 text-center">{Number(item.quantity)} {item.unit}</td>
                                                <td className="py-3 px-2 text-right">₺{itemUnitPriceWithoutTax.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                                                <td className="py-3 px-2 text-right">%{calculatedTaxRate}</td>
                                                <td className="py-3 px-2 text-right">₺{itemTotalWithoutTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-neutral-500 border-b border-neutral-200">
                                                Fatura detayı (kalem) bulunamadı.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals and Notes */}
                        <div className="flex justify-between items-start pt-4">
                            <div className="w-1/2 pr-8 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xs font-bold text-neutral-500 uppercase mb-2">Not</h3>
                                    <p className="text-[11px] text-neutral-600 border p-3 rounded bg-neutral-50/50 min-h-[60px]">
                                        {invoice.notes || 'İşbu fatura muhteviyatı ürünler eksiksiz ve sağlam olarak teslim edilmiştir. Vadesinde ödenmeyen faturalara aylık %5 vade farkı uygulanır.'}
                                    </p>
                                    
                                    {invoice.cashMovements?.length > 0 && (
                                        <div className="mt-4 border p-3 rounded bg-green-50/50 text-green-800 text-xs">
                                            <p className="font-semibold mb-1">Tahsilat Bilgisi</p>
                                            {invoice.cashMovements.map((mov: any) => (
                                                <div key={mov.id} className="flex justify-between">
                                                    <span>{new Date(mov.movement_date).toLocaleDateString('tr-TR')} - {mov.register?.name || 'Kasa'}</span>
                                                    <span className="font-mono">₺{Number(mov.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 flex flex-col items-center w-max">
                                    <QRCodeSVG 
                                        value={`https://gib.gov.tr/fatura-sorgula?ettn=${invoice.e_document_uuid || invoice.id}`}
                                        size={96}
                                        level="M"
                                        includeMargin={true}
                                        className="border border-neutral-200 rounded"
                                    />
                                    <p className="text-[9px] text-neutral-400 mt-1">Fatura Sorgulama</p>
                                </div>
                            </div>

                            <div className="w-[40%]">
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b border-neutral-100">
                                            <td className="py-2 text-neutral-600">Mal Hizmet Toplam Tutar</td>
                                            <td className="py-2 text-right font-mono">₺{realInvoiceSubtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                        {Number(invoice.discount_total) > 0 && (
                                            <tr className="border-b border-neutral-100 text-orange-600">
                                                <td className="py-2">Toplam İskonto</td>
                                                <td className="py-2 text-right font-mono">-₺{Number(invoice.discount_total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        )}
                                        <tr className="border-b border-neutral-100">
                                            <td className="py-2 text-neutral-600">Hesaplanan KDV</td>
                                            <td className="py-2 text-right font-mono">₺{Number(invoice.tax_total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                        <tr className="border-b-2 border-neutral-800 font-bold text-lg bg-neutral-50/50">
                                            <td className="py-3 px-2">ÖDENECEK TUTAR</td>
                                            <td className="py-3 px-2 text-right font-mono text-orange-700">₺{Number(invoice.grand_total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <div className="text-center mt-8">
                                    <p className="text-[10px] text-neutral-400">KobiX tarafından mali mühür ile imzalanmıştır.</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer decorative line */}
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 to-red-600"></div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0; size: A4 portrait; }
                    body { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                        background: white !important; 
                    }
                    body * { 
                        visibility: hidden; 
                    }
                    #invoice-print-area, #invoice-print-area * { 
                        visibility: visible; 
                    }
                    #invoice-print-area {
                        position: absolute;
                        left: 50%;
                        top: 5mm;
                        transform: translateX(-50%) scale(0.92);
                        transform-origin: top center;
                        width: 210mm;
                        margin: 0;
                        padding: 0;
                        border: none !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </AppLayout>
    );
}
