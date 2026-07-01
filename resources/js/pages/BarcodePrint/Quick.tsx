import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ScanBarcode, Printer, Settings2, Search, List, Trash2, CheckCircle2 } from 'lucide-react';
import qz from 'qz-tray';
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

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

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
        if (!autoPrint || queue.length === 0 || isPrinting || !selectedPrinter || !selectedSchema) {
return;
}

        const processNextInQueue = async () => {
            const item = queue[0];

            if (!item || !item.product) {
return;
}

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
                    try {
                        if (!qz.websocket.isActive()) {
await qz.websocket.connect();
}

                        const config = qz.configs.create(res.data.printer_name);
                        const printData = [{ type: 'raw', format: 'command', data: res.data.raw_command }];
                        await qz.print(config, printData);
                        
                        toast.success(`${item.product.name} otomatik yazdırıldı!`);
                        setLastPrinted({
                            barcode: item.product.barcode || item.product.sku,
                            time: new Date().toLocaleTimeString('tr-TR'),
                            status: 'Oto-Yazdırıldı'
                        });
                        
                        if ('Notification' in window && Notification.permission === 'granted') {
                            new Notification('ReTech Terminal', { body: `${item.product.name} otomatik yazdırıldı!` });
                        }

                        if ('vibrate' in navigator) {
navigator.vibrate([200, 100, 200]);
}

                        // Delete from queue
                        await axios.delete(`/api/mobile/print-queue/${item.id}`);
                        setQueue(q => q.filter(qItem => qItem.id !== item.id));
                    } catch (qzError: any) {
                        toast.error('QZ Hatası: ' + (qzError.message || qzError));
                    }
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
                try {
                    if (!qz.websocket.isActive()) {
await qz.websocket.connect();
}

                    const config = qz.configs.create(response.data.printer_name);
                    const printData = [{ type: 'raw', format: 'command', data: response.data.raw_command }];
                    await qz.print(config, printData);

                    const product = response.data.product;
                    const displayTitle = product ? product.name : barcode;
                    toast.success(`${displayTitle} yazdırıldı!`);
                    
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('ReTech Terminal', { body: `${displayTitle} başarıyla yazdırıldı!` });
                    }

                    if ('vibrate' in navigator) {
navigator.vibrate([200, 100, 200]);
}

                    setLastPrinted({
                        barcode: displayTitle,
                        time: new Date().toLocaleTimeString('tr-TR'),
                        status: 'Başarılı'
                    });
                    
                    // 2 Saniye ekranda göster
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (qzError: any) {
                    toast.error('QZ Hatası: ' + (qzError.message || qzError));
                }
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

            <div className="min-h-[calc(100vh-4rem)] bg-neutral-50 dark:bg-neutral-950 flex flex-col p-4 md:p-8">
                {/* Header Area */}
                <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                            <ScanBarcode className="w-8 h-8 text-orange-500" />
                            Hızlı Barkod Basma
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                            Okuyucu ile barkodu okutun, etiket anında yazdırılsın.
                        </p>
                    </div>

                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="relative h-12 px-6 rounded-full bg-white dark:bg-neutral-900 shadow-sm border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                                <List className="w-5 h-5 mr-2 text-neutral-600 dark:text-neutral-300" /> 
                                <span className="font-semibold text-neutral-700 dark:text-neutral-200">Mobil Kuyruk</span>
                                {queue.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                                        {queue.length}
                                    </span>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[480px] flex flex-col shadow-2xl bg-white dark:bg-neutral-950">
                            <SheetHeader className="mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-6">
                                <SheetTitle className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <List className="w-5 h-5 text-orange-500" />
                                        <span>Mobil Kuyruk</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-full">
                                        <Label htmlFor="auto-print" className="cursor-pointer text-sm font-medium">Oto Yazdır</Label>
                                        <Switch id="auto-print" checked={autoPrint} onCheckedChange={setAutoPrint} />
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                {queue.length === 0 ? (
                                    <div className="text-center text-neutral-400 pt-20">
                                        <ScanBarcode className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <p className="font-medium">Kuyruk boş</p>
                                    </div>
                                ) : (
                                    queue.map((item) => (
                                        <div key={item.id} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                            <div className="flex-1 mr-4">
                                                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">{item.product?.name || 'Bilinmeyen Ürün'}</h4>
                                                <div className="text-xs text-neutral-500 font-mono mt-1">{item.product?.barcode || item.product?.sku}</div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFromQueue(item.id)} className="text-neutral-400 hover:text-red-500">
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Main Centered Scanner */}
                <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center gap-8 pb-20">
                    
                    <Card className="border-0 shadow-2xl bg-white dark:bg-neutral-900 rounded-[2rem] overflow-hidden relative">
                        {isPrinting && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-200 dark:border-neutral-800 border-t-orange-500 mb-4"></div>
                                <span className="font-bold text-orange-600 tracking-wider">YAZDIRILIYOR...</span>
                            </div>
                        )}
                        <CardContent className="p-8 md:p-12">
                            <form onSubmit={handleBarcodeSubmit} className="space-y-8">
                                <div className="text-center">
                                    <Label htmlFor="barcode" className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
                                        Barkod Okutun veya Yazın
                                    </Label>
                                </div>
                                
                                <div>
                                    <Input
                                        ref={inputRef}
                                        id="barcode"
                                        type="text"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        placeholder="BARKOD..."
                                        className="text-4xl md:text-5xl h-24 md:h-32 text-center font-mono tracking-widest uppercase bg-neutral-50 dark:bg-neutral-950 border-2 border-neutral-200 dark:border-neutral-800 focus-visible:ring-0 focus-visible:border-orange-500 focus-visible:bg-white dark:focus-visible:bg-neutral-900 rounded-2xl transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-800"
                                        autoFocus
                                        autoComplete="off"
                                        disabled={isPrinting}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-neutral-500 flex items-center gap-2 uppercase">
                                            <Printer className="w-4 h-4" /> Hedef Yazıcı
                                        </Label>
                                        <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
                                            <SelectTrigger className="h-12 rounded-xl bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                                                <SelectValue placeholder="Yazıcı Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {printers.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold text-neutral-500 flex items-center gap-2 uppercase">
                                            <Settings2 className="w-4 h-4" /> Etiket Şeması
                                        </Label>
                                        <Select value={selectedSchema} onValueChange={setSelectedSchema}>
                                            <SelectTrigger className="h-12 rounded-xl bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
                                                <SelectValue placeholder="Şema Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {schemas.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Success Notification - Minimalist */}
                    <div className={`transition-all duration-500 ease-in-out ${lastPrinted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        {lastPrinted && (
                            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-5 flex items-center gap-4">
                                <div className="bg-green-500 text-white p-3 rounded-full shrink-0">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-green-700 dark:text-green-400 font-medium">Başarıyla Yazdırıldı</div>
                                    <div className="font-bold text-green-900 dark:text-green-300 text-lg">{lastPrinted.barcode}</div>
                                </div>
                                <div className="text-green-600/60 dark:text-green-400/60 text-sm font-medium">
                                    {lastPrinted.time}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
