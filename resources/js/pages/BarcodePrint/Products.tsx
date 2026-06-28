import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, RefreshCw, Layers } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Products({ products, printers, schemas }: { products: any[], printers: any[], schemas: any[] }) {
    const [selectedProducts, setSelectedProducts] = useState<{product_id: number, copies: number}[]>([]);
    
    const { data, setData, post, processing } = useForm({
        printer_id: printers.find(p => p.is_default)?.id || (printers[0]?.id || ''),
        schema_id: schemas.find(s => s.is_default)?.id || (schemas[0]?.id || ''),
        items: [] as any[],
    });

    const handleSelectProduct = (productId: number, checked: boolean) => {
        if (checked) {
            setSelectedProducts([...selectedProducts, { product_id: productId, copies: 1 }]);
        } else {
            setSelectedProducts(selectedProducts.filter(p => p.product_id !== productId));
        }
    };

    const updateCopies = (productId: number, copies: number) => {
        if (copies < 1) copies = 1;
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
        
        // Use standard fetch to receive JSON with TSPL raw command
        try {
            const response = await fetch('/products/barcode-print/raw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    printer_id: data.printer_id,
                    schema_id: data.schema_id,
                    items: selectedProducts
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success('TSPL komutu oluşturuldu! QZ Tray eklenecek.');
                console.log("TSPL RAW COMMAND:", result.raw_command);
                
                // TODO: Here QZ Tray websocket integration will connect and send the result.raw_command 
                // to result.printer_name
            } else {
                toast.error(result.message || 'Yazdırma komutu oluşturulurken hata oluştu.');
            }
        } catch(e: any) {
            toast.error('Yazdırma işlemi başarısız: ' + e.message);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Ürünler', href: '/products' },
            { title: 'Toplu Barkod Yazdırma', href: '/products/barcode-print' }
        ]}>
            <Head title="Toplu Barkod Yazdırma" />

            <div className="flex h-full flex-1 flex-col md:flex-row gap-6 p-4">
                <div className="w-full md:w-3/4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Barkod Yazdırılacak Ürünler</h1>
                    </div>
                    
                    <div className="rounded-sm border bg-card shadow-sm overflow-hidden flex-1">
                        <table className="w-full text-sm text-left text-card-foreground">
                            <thead className="text-[11px] uppercase bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-b">
                                <tr>
                                    <th className="px-6 py-4 w-12">SEÇ</th>
                                    <th className="px-6 py-4">Ürün Adı</th>
                                    <th className="px-6 py-4 text-right">Fiyat</th>
                                    <th className="px-6 py-4 text-center">Baskı Adedi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => {
                                    const selected = selectedProducts.find(p => p.product_id === product.id);
                                    return (
                                        <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="px-6 py-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded border-gray-300 w-4 h-4"
                                                    checked={!!selected}
                                                    onChange={e => handleSelectProduct(product.id, e.target.checked)}
                                                />
                                            </td>
                                            <td className="px-6 py-3 font-medium">{product.name}</td>
                                            <td className="px-6 py-3 text-right">₺{product.sale_price}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex justify-center">
                                                    <Input 
                                                        type="number" 
                                                        className="w-20 text-center h-8" 
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

                <div className="w-full md:w-1/4 space-y-4">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle className="flex items-center"><Printer className="w-5 h-5 mr-2" /> Yazdırma Ayarları</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Yazıcı</Label>
                                <Select value={data.printer_id.toString()} onValueChange={v => setData('printer_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Yazıcı Seçin" /></SelectTrigger>
                                    <SelectContent>
                                        {printers.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.printer_name})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Barkod Şeması</Label>
                                <Select value={data.schema_id.toString()} onValueChange={v => setData('schema_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Şema Seçin" /></SelectTrigger>
                                    <SelectContent>
                                        {schemas.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name} ({s.label_width_mm}x{s.label_height_mm}mm)</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="text-muted-foreground">Seçilen Ürün:</span>
                                    <span className="font-bold">{selectedProducts.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mb-4">
                                    <span className="text-muted-foreground">Toplam Etiket:</span>
                                    <span className="font-bold">{selectedProducts.reduce((acc, curr) => acc + curr.copies, 0)}</span>
                                </div>
                                <Button 
                                    className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg" 
                                    onClick={handlePrint}
                                    disabled={selectedProducts.length === 0}
                                >
                                    <Printer className="w-5 h-5 mr-2" /> 
                                    Yazdır
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
