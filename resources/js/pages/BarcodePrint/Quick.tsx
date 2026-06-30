import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ScanBarcode, Printer, Settings2, Search, List, Trash2, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function QuickBarcodePrint({ printers, schemas, default_schema, default_printer }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hızlı Barkod Basma', href: '/products/barcode-print/quick' },
    ];

    const [barcode, setBarcode] = useState('');
    const [selectedPrinter, setSelectedPrinter] = useState(default_printer?.id?.toString() || '');
    const [selectedSchema, setSelectedSchema] = useState(default_schema?.id?.toString() || '');
    const [lastPrinted, setLastPrinted] = useState<any>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    
    // Queue State
    const [queue, setQueue] = useState<any[]>([]);
    const [autoPrint, setAutoPrint] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Auto focus the input for the barcode scanner
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        
        // Refocus window clicks
        const handleWindowClick = (e: MouseEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) {
return;
}

            if (inputRef.current) {
inputRef.current.focus();
}
        };
        
        window.addEventListener('click', handleWindowClick);

        return () => window.removeEventListener('click', handleWindowClick);
    }, []);

    // Polling Queue from Server
    useEffect(() => {
        let isPolling = true;

        const fetchQueue = async () => {
            try {
                const res = await axios.get('/api/mobile/print-queue');
                if (isPolling) {
                    setQueue(res.data);
                }
            } catch (err) {
                console.error("Kuyruk çekilemedi", err);
            }
        };

        fetchQueue();
        const intervalId = setInterval(fetchQueue, 3000);

        return () => {
            isPolling = false;
            clearInterval(intervalId);
        };
    }, []);

    // Auto-Print Processor
    useEffect(() => {
        if (!autoPrint || queue.length === 0 || isPrinting || !selectedPrinter || !selectedSchema) return;

        const processNextInQueue = async () => {
            const item = queue[0];
            if (!item || !item.product) return;

            setIsPrinting(true);
            try {
                // Submit to raw printer endpoint
                const res = await axios.post('/products/barcode-print/raw', {
                    barcode: item.product.barcode || item.product.sku,
                    printer_id: selectedPrinter,
                    schema_id: selectedSchema,
                    quantity: item.copies || 1,
                });

                if (res.data.success) {
                    toast.success(`${item.product.name} otomatik yazdırıldı!`);
                    setLastPrinted({
                        barcode: item.product.barcode || item.product.sku,
                        time: new Date().toLocaleTimeString('tr-TR'),
                        status: 'Oto-Yazdırıldı'
                    });
                    // Delete from queue
                    await axios.delete(`/api/mobile/print-queue/${item.id}`);
                    setQueue(q => q.filter(qItem => qItem.id !== item.id));
                } else {
                    toast.error(res.data.message || 'Yazdırılamadı.');
                }
            } catch (error) {
                console.error("Oto-yazdırma hatası:", error);
            } finally {
                setIsPrinting(false);
            }
        };

        processNextInQueue();
    }, [queue, autoPrint, isPrinting, selectedPrinter, selectedSchema]);

    const handleRemoveFromQueue = async (id: number) => {
        try {
            await axios.delete(`/api/mobile/print-queue/${id}`);
            setQueue(q => q.filter(item => item.id !== id));
            toast.success('Kuyruktan silindi.');
        } catch (error) {
            toast.error('Silinirken hata oluştu.');
        }
    };

    const handleBarcodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!barcode.trim()) {
return;
}

        if (!selectedPrinter || !selectedSchema) {
            toast.error('Lütfen yazıcı ve şema seçin.');

            return;
        }

        setIsPrinting(true);

        try {
            // Barkodu backend'e gönder ve ürün ara & yazdır (Backend raw print endpoint'ini kullanır)
            const response = await axios.post('/products/barcode-print/raw', {
                barcode: barcode,
                printer_id: selectedPrinter,
                schema_id: selectedSchema,
                quantity: 1, // Hızlı modda hep 1 adet çıkar
            });

            if (response.data.success) {
                const product = response.data.product;
                const displayTitle = product ? product.name : barcode;
                toast.success(`${displayTitle} yazdırıldı!`);
                setLastPrinted({
                    barcode: displayTitle,
                    time: new Date().toLocaleTimeString('tr-TR'),
                    status: 'Başarılı'
                });
                
                // 2 Saniye ekranda göster
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                toast.error(response.data.message || 'Ürün bulunamadı veya yazdırılamadı.');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Bir hata oluştu.');
        } finally {
            setIsPrinting(false);
            setBarcode(''); // Clear for next scan

            if (inputRef.current) {
inputRef.current.focus();
}
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hızlı Barkod Basma" />

            <div className="relative min-h-[calc(100vh-4rem)] bg-neutral-50/50 dark:bg-neutral-950/50">
                {/* Background Decor */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-orange-400/10 blur-[120px]" />
                    <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[100px]" />
                </div>

                <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto flex flex-col h-full">
                    
                    {/* Header Area */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30 flex items-center justify-center transform hover:scale-105 transition-transform">
                                <ScanBarcode className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-1">
                                    Hızlı Barkod Modu
                                </h1>
                                <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                                    Okuyucu ile veya mobil cihazdan anında etiket yazdırın.
                                </p>
                            </div>
                        </div>

                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button className="relative h-14 px-8 rounded-full bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 border-2 border-transparent hover:border-orange-500/50 shadow-xl shadow-neutral-200/50 dark:shadow-none transition-all group">
                                    <List className="w-5 h-5 mr-3 text-orange-500 group-hover:scale-110 transition-transform" /> 
                                    <span className="font-semibold text-base">Mobil Kuyruk</span>
                                    {queue.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2.5 py-1 flex items-center justify-center rounded-full font-bold shadow-lg shadow-red-500/40 animate-bounce">
                                            {queue.length} Yeni
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[480px] flex flex-col border-l-0 shadow-2xl bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl">
                                <SheetHeader className="mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-6">
                                    <SheetTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                                <List className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                                            </div>
                                            <span>Mobil Bekleyenler</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-900 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800">
                                            <Label htmlFor="auto-print" className="cursor-pointer text-sm font-semibold text-neutral-700 dark:text-neutral-300">Oto Yazdır</Label>
                                            <Switch 
                                                id="auto-print" 
                                                checked={autoPrint} 
                                                onCheckedChange={setAutoPrint} 
                                                className="data-[state=checked]:bg-green-500"
                                            />
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                    {queue.length === 0 ? (
                                        <div className="text-center text-neutral-400 dark:text-neutral-500 pt-20 flex flex-col items-center">
                                            <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                                                <ScanBarcode className="w-12 h-12 opacity-50" />
                                            </div>
                                            <p className="font-semibold text-lg text-neutral-700 dark:text-neutral-300">Kuyruk şu an boş</p>
                                            <p className="text-sm mt-2 max-w-[250px]">Mobil uygulamadan okuttuğunuz ürünler anında buraya düşer.</p>
                                        </div>
                                    ) : (
                                        queue.map((item) => (
                                            <div key={item.id} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-right-4">
                                                <div className="flex-1 mr-4">
                                                    <h4 className="font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">{item.product?.name || 'Bilinmeyen Ürün'}</h4>
                                                    <div className="text-sm text-neutral-500 font-mono mt-1 bg-neutral-50 dark:bg-neutral-950 inline-block px-2 py-0.5 rounded border dark:border-neutral-800">{item.product?.barcode || item.product?.sku}</div>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveFromQueue(item.id)} className="h-10 w-10 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* Scanner Area */}
                        <div className="lg:col-span-8 flex flex-col space-y-8">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200"></div>
                                <Card className="relative border-0 shadow-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                                    <CardContent className="p-10 md:p-16">
                                        <form onSubmit={handleBarcodeSubmit} className="space-y-8 relative">
                                            <div className="flex flex-col items-center justify-center mb-4">
                                                <div className="inline-flex items-center justify-center p-4 bg-orange-50 dark:bg-orange-500/10 rounded-full mb-4 group-focus-within:scale-110 group-focus-within:bg-orange-100 dark:group-focus-within:bg-orange-500/20 transition-all duration-500">
                                                    <Search className="w-10 h-10 text-orange-500" />
                                                </div>
                                                <Label htmlFor="barcode" className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                                                    Barkod Bekleniyor
                                                </Label>
                                            </div>
                                            
                                            <div className="relative max-w-2xl mx-auto">
                                                <Input
                                                    ref={inputRef}
                                                    id="barcode"
                                                    type="text"
                                                    value={barcode}
                                                    onChange={(e) => setBarcode(e.target.value)}
                                                    placeholder="LÜTFEN OKUTUNUZ..."
                                                    className="text-4xl md:text-5xl h-32 md:h-40 text-center font-mono tracking-[0.2em] uppercase bg-neutral-50/50 dark:bg-neutral-950/50 border-4 border-dashed border-neutral-300 dark:border-neutral-800 focus-visible:ring-0 focus-visible:border-orange-500 focus-visible:bg-white dark:focus-visible:bg-neutral-900 rounded-[1.5rem] transition-all shadow-inner placeholder:text-neutral-300 dark:placeholder:text-neutral-800"
                                                    autoFocus
                                                    autoComplete="off"
                                                    disabled={isPrinting}
                                                />
                                                {isPrinting && (
                                                    <div className="absolute inset-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center z-10">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 dark:border-neutral-800 border-t-orange-500"></div>
                                                            <span className="font-bold text-lg text-orange-600 tracking-widest animate-pulse">YAZDIRILIYOR...</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                            
                            {/* Success Notification */}
                            {lastPrinted && (
                                <div className="bg-green-500 text-white rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-green-500/20 animate-in fade-in slide-in-from-bottom-4 transform transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="bg-white/20 p-3 rounded-full">
                                            <CheckCircle2 className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-green-50 font-medium mb-1">Son İşlem Başarılı</div>
                                            <div className="font-bold font-mono text-2xl tracking-wider">{lastPrinted.barcode}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 bg-black/10 px-4 py-2 rounded-xl">
                                        <span className="text-xs text-green-100 font-medium uppercase tracking-wider">{lastPrinted.status}</span>
                                        <span className="font-bold text-lg">{lastPrinted.time}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Settings Sidebar */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <Card className="border-0 shadow-xl shadow-neutral-200/40 dark:shadow-none bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-3xl overflow-hidden">
                                <div className="bg-neutral-50 dark:bg-neutral-950 p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
                                        <Settings2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-bold text-xl text-neutral-800 dark:text-neutral-100">Yazdırma Ayarları</h3>
                                </div>
                                <CardContent className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Hedef Yazıcı</Label>
                                        <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                                            <SelectTrigger className="h-14 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:ring-0 focus:border-blue-500 font-medium text-lg">
                                                <SelectValue placeholder="Yazıcı Seçin" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {printers.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id.toString()} className="font-medium">{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Etiket Şeması</Label>
                                        <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                                            <SelectTrigger className="h-14 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 focus:ring-0 focus:border-blue-500 font-medium text-lg">
                                                <SelectValue placeholder="Şema Seçin" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {schemas.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id.toString()} className="font-medium">{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-3xl p-6 flex gap-4">
                                <div className="mt-1">
                                    <Printer className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Oto-Odaklama Aktif</h4>
                                    <p className="text-sm text-blue-800/70 dark:text-blue-400/70">
                                        Bu sayfada herhangi bir yere tıkladığınızda imleç otomatik olarak barkod alanına odaklanır. Sürekli okutma yapabilirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
