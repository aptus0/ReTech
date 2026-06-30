import { Head, useForm, router } from '@inertiajs/react';
import { Printer, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Index({ printers }: { printers: any[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        brand: '',
        model: '',
        printer_name: '',
        connection_type: 'usb',
        language: 'tspl',
        dpi: 203,
        default_width_mm: 50,
        default_height_mm: 30,
        default_gap_mm: 3,
        default_speed: 4,
        default_density: 8,
        is_default: false,
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/barcode-printers', {
            onSuccess: () => {
                toast.success('Yazıcı eklendi');
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Emin misiniz?')) {
            router.delete(`/barcode-printers/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Ayarlar', href: '/settings/profile' },
            { title: 'Barkod Yazıcıları', href: '/barcode-printers' }
        ]}>
            <Head title="Barkod Yazıcı Ayarları" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Barkod Yazıcıları</h1>
                            <p className="text-muted-foreground mt-2">Sistemde kullanılacak direkt termal/termal transfer yazıcıları tanımlayın.</p>
                        </div>
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="w-4 h-4 mr-2" /> Yeni Yazıcı Ekle</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Yeni Barkod Yazıcı Tanımla</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Yazıcı Tanımı (Örn: Depo Yazıcısı)</Label>
                                            <Input required value={data.name} onChange={e => setData('name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>İşletim Sistemi Yazıcı Adı (QZ Tray için)</Label>
                                            <Input required value={data.printer_name} onChange={e => setData('printer_name', e.target.value)} placeholder="TSC TTP-244CE" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Marka</Label>
                                            <Input value={data.brand} onChange={e => setData('brand', e.target.value)} placeholder="TSC" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Model</Label>
                                            <Input value={data.model} onChange={e => setData('model', e.target.value)} placeholder="TTP-244CE" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Yazıcı Dili (ÖNEMLİ)</Label>
                                            <Select value={data.language} onValueChange={v => setData('language', v)}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tspl">TSPL (TSC / XPrinter)</SelectItem>
                                                    <SelectItem value="zpl">ZPL (Zebra)</SelectItem>
                                                    <SelectItem value="epl">EPL</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Çözünürlük (DPI)</Label>
                                            <Input type="number" required value={data.dpi} onChange={e => setData('dpi', parseInt(e.target.value))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Varsayılan Etiket Genişliği (mm)</Label>
                                            <Input type="number" required value={data.default_width_mm} onChange={e => setData('default_width_mm', parseFloat(e.target.value))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Varsayılan Etiket Yüksekliği (mm)</Label>
                                            <Input type="number" required value={data.default_height_mm} onChange={e => setData('default_height_mm', parseFloat(e.target.value))} />
                                        </div>
                                        <div className="space-y-2 flex items-center justify-between col-span-2 border p-3 rounded">
                                            <Label>Varsayılan Yazıcı Yap</Label>
                                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300" checked={data.is_default} onChange={e => setData('is_default', e.target.checked)} />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={processing} className="w-full mt-4">Kaydet</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {printers.map(printer => (
                            <Card key={printer.id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                            <Printer className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{printer.name}</h3>
                                                {printer.is_default && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">Varsayılan</span>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{printer.brand} {printer.model} • OS Adı: <span className="font-mono">{printer.printer_name}</span> • Dil: {printer.language.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(printer.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {printers.length === 0 && (
                            <div className="text-center p-12 border border-dashed rounded-lg text-muted-foreground">
                                Henüz yazıcı tanımlanmamış.
                            </div>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
