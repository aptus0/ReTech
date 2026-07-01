import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Printer, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import qz from 'qz-tray';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

export default function Products({ products, printers, schemas }: { products: any[], printers: any[], schemas: any[] }) {
    const [selectedProducts, setSelectedProducts] = useState<{product_id: number, copies: number}[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);
    
    const { data, setData, post, processing } = useForm({
        printer_id: printers.find(p => p.is_default)?.id || (printers[0]?.id || ''),
        schema_id: schemas.find(s => s.is_default)?.id || (schemas[0]?.id || ''),
        items: [] as any[],
    });

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    const handleSelectProduct = (productId: number, checked: boolean) => {
        if (checked) {
            setSelectedProducts([...selectedProducts, { product_id: productId, copies: 1 }]);
        } else {
            setSelectedProducts(selectedProducts.filter(p => p.product_id !== productId));
        }
    };

    const updateCopies = (productId: number, copies: number) => {
        if (copies < 1) {
copies = 1;
}

        setSelectedProducts(selectedProducts.map(p => p.product_id === productId ? { ...p, copies } : p));
    };

    const handlePrint = async () => {
        if (selectedProducts.length === 0) {
            toast.error('Lütfen barkodunu yazdırmak istediğiniz ürünleri seçin.');

            return;
        }

        if (!data.printer_id || !data.schema_id) {
            toast.error('Lütfen bir yazıcı ve barkod şeması seçin.');

            return;
        }

        setData('items', selectedProducts);
        setIsPrinting(true);
        const toastId = toast.loading('Yazdırma komutu hazırlanıyor...');
        
        try {
            const response = await axios.post('/products/barcode-print/raw', {
                printer_id: data.printer_id,
                schema_id: data.schema_id,
                items: selectedProducts
            });
            
            const result = response.data;
            
            if (result.success) {
                toast.loading('Yazıcıya gönderiliyor (QZ Tray)...', { id: toastId });
                
                try {
                    if (!qz.websocket.isActive()) {
                        await qz.websocket.connect();
                    }

                    const config = qz.configs.create(result.printer_name);
                    const printData = [
                        { type: 'raw', format: 'command', data: result.raw_command }
                    ];
                    
                    await qz.print(config, printData);
                    
                    toast.success('Barkod başarıyla yazdırıldı! 🖨️', { id: toastId });
                    
                    // Show OS Notification for Mobile/Desktop
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('ReTech Terminal', { 
                            body: 'Barkod yazdırma işlemi başarıyla tamamlandı!',
                            icon: '/favicon.ico' // Assuming a favicon exists
                        });
                    }
                    
                    // Vibrate on mobile for tactile feedback
                    if ('vibrate' in navigator) {
                        navigator.vibrate([200, 100, 200]);
                    }
                    
                } catch (qzError: any) {
                    console.error("QZ Error:", qzError);
                    toast.error('Yazıcı bağlantı hatası: ' + (qzError.message || qzError), { id: toastId });
                }
            } else {
                toast.error(result.message || 'Yazdırma komutu oluşturulurken hata oluştu.', { id: toastId });
            }
        } catch(e: any) {
            toast.error('Yazdırma işlemi başarısız: ' + (e.response?.data?.message || e.message), { id: toastId });
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Ürünler', href: '/products' },
            { title: 'Toplu Barkod Yazdırma', href: '/products/barcode-print' }
        ]}>
            <Head title="Toplu Barkod Yazdırma" />

            <div className="flex h-full flex-1 flex-col lg:flex-row gap-6 p-2 md:p-4">
                <div className="w-full lg:w-3/4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl md:text-2xl font-semibold">Barkod Yazdırılacak Ürünler</h1>
                    </div>
                    
                    <div className="rounded-xl border bg-card shadow-sm overflow-x-auto flex-1 w-full block">
                        <table className="w-full text-sm text-left text-card-foreground min-w-[600px]">
                            <thead className="text-[11px] uppercase bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-b">
                                <tr>
                                    <th className="px-4 py-3 md:px-6 md:py-4 w-12 text-center">SEÇ</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4">Ürün Adı</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4 text-right">Fiyat</th>
                                    <th className="px-4 py-3 md:px-6 md:py-4 text-center">Baskı Adedi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => {
                                    const selected = selectedProducts.find(p => p.product_id === product.id);

                                    return (
                                        <tr key={product.id} className={`border-b last:border-0 hover:bg-muted/50 transition-colors ${selected ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}>
                                            <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 w-5 h-5 md:w-4 md:h-4 text-orange-600 focus:ring-orange-500 cursor-pointer"
                                                    checked={!!selected}
                                                    onChange={e => handleSelectProduct(product.id, e.target.checked)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 md:px-6 md:py-4 font-medium cursor-pointer" onClick={() => handleSelectProduct(product.id, !selected)}>
                                                {product.name}
                                                {product.barcode && <div className="text-xs text-muted-foreground mt-0.5">{product.barcode}</div>}
                                            </td>
                                            <td className="px-4 py-3 md:px-6 md:py-4 text-right font-semibold">₺{product.sale_price}</td>
                                            <td className="px-4 py-3 md:px-6 md:py-4">
                                                <div className="flex justify-center items-center">
                                                    <Input 
                                                        type="number" 
                                                        className="w-16 md:w-20 text-center h-9 md:h-8" 
                                                        min="1" 
                                                        value={selected?.copies || 1}
                                                        onChange={e => updateCopies(product.id, parseInt(e.target.value))}
                                                        disabled={!selected}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="w-full lg:w-1/4 space-y-4">
                    <Card className="sticky top-4 border-orange-200 dark:border-orange-900/50 shadow-md">
                        <CardHeader className="bg-orange-50 dark:bg-orange-950/20 rounded-t-xl border-b border-orange-100 dark:border-orange-900/50 pb-4">
                            <CardTitle className="flex items-center text-orange-800 dark:text-orange-400">
                                <Printer className="w-5 h-5 mr-2" /> 
                                Yazdırma Ayarları
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2.5">
                                <Label className="text-sm font-semibold">Yazıcı</Label>
                                <Select value={data.printer_id.toString()} onValueChange={v => setData('printer_id', v)}>
                                    <SelectTrigger className="h-11"><SelectValue placeholder="Yazıcı Seçin" /></SelectTrigger>
                                    <SelectContent>
                                        {printers.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-sm font-semibold">Barkod Şeması</Label>
                                <Select value={data.schema_id.toString()} onValueChange={v => setData('schema_id', v)}>
                                    <SelectTrigger className="h-11"><SelectValue placeholder="Şema Seçin" /></SelectTrigger>
                                    <SelectContent>
                                        {schemas.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name} ({s.label_width_mm}x{s.label_height_mm}mm)</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-5 border-t mt-6">
                                <div className="flex justify-between items-center text-sm mb-3">
                                    <span className="text-muted-foreground">Seçilen Ürün:</span>
                                    <span className="font-bold text-lg">{selectedProducts.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mb-6 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                    <span className="text-orange-800 dark:text-orange-400 font-medium">Toplam Etiket:</span>
                                    <span className="font-black text-xl text-orange-600 dark:text-orange-400">{selectedProducts.reduce((acc, curr) => acc + curr.copies, 0)}</span>
                                </div>
                                <Button 
                                    className="w-full bg-orange-600 hover:bg-orange-700 h-14 text-lg font-bold shadow-lg shadow-orange-600/20 rounded-xl" 
                                    onClick={handlePrint}
                                    disabled={selectedProducts.length === 0 || isPrinting}
                                >
                                    {isPrinting ? (
                                        <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
                                    ) : (
                                        <Printer className="w-6 h-6 mr-2" /> 
                                    )}
                                    {isPrinting ? 'Yazdırılıyor...' : 'Yazdır'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
