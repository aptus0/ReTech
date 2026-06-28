import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileCode2, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';

const barcodeTypes = [
    { value: '128', label: 'Code 128' },
    { value: '39', label: 'Code 39' },
    { value: 'EAN13', label: 'EAN-13' },
    { value: 'EAN8', label: 'EAN-8' },
    { value: 'UPCA', label: 'UPC-A' },
    { value: 'QR', label: 'QR Code' },
];

export default function Index({ schemas }: { schemas: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchema, setEditingSchema] = useState<any>(null);
    const [previewSchema, setPreviewSchema] = useState<any>(null);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        label_width_mm: 50,
        label_height_mm: 30,
        gap_mm: 3,
        barcode_type: '128',
        density: 8,
        speed: 4,
        printer_language: 'tspl',
        show_human_readable: true,
        is_default: false,
        is_active: true,
    });

    const openCreate = () => {
        setEditingSchema(null);
        reset();
        setIsModalOpen(true);
    };

    const openEdit = (schema: any) => {
        setEditingSchema(schema);
        setData({
            name: schema.name || '',
            description: schema.description || '',
            label_width_mm: schema.label_width_mm || 50,
            label_height_mm: schema.label_height_mm || 30,
            gap_mm: schema.gap_mm || 3,
            barcode_type: schema.barcode_type || '128',
            density: schema.density || 8,
            speed: schema.speed || 4,
            printer_language: schema.printer_language || 'tspl',
            show_human_readable: schema.show_human_readable ?? true,
            is_default: schema.is_default ?? false,
            is_active: schema.is_active ?? true,
        });
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSchema) {
            put(`/barcode-schemas/${editingSchema.id}`, {
                onSuccess: () => {
                    toast.success('Şema güncellendi');
                    setIsModalOpen(false);
                    reset();
                    setEditingSchema(null);
                }
            });
        } else {
            post('/barcode-schemas', {
                onSuccess: () => {
                    toast.success('Şema eklendi');
                    setIsModalOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Şemayı silmek istediğinize emin misiniz?')) {
            router.delete(`/barcode-schemas/${id}`, {
                onSuccess: () => toast.success('Şema silindi'),
            });
        }
    };

    // Etiket Önizleme — basit CSS preview
    const renderPreview = (schema: any) => {
        const scale = 3; // 1mm = 3px
        const w = (schema.label_width_mm || data.label_width_mm) * scale;
        const h = (schema.label_height_mm || data.label_height_mm) * scale;
        const bType = schema.barcode_type || data.barcode_type;
        return (
            <div
                className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 rounded flex flex-col items-center justify-center gap-1 relative overflow-hidden"
                style={{ width: w, height: h, minWidth: 120, minHeight: 80 }}
            >
                <div className="text-[8px] text-neutral-400 absolute top-1 left-1">
                    {(schema.label_width_mm || data.label_width_mm)}x{(schema.label_height_mm || data.label_height_mm)}mm
                </div>
                {bType === 'QR' ? (
                    <div className="w-10 h-10 border border-neutral-400 grid grid-cols-3 grid-rows-3 gap-px">
                        {Array.from({length: 9}).map((_, i) => (
                            <div key={i} className={`${[0,1,2,3,5,6,8].includes(i) ? 'bg-neutral-800 dark:bg-neutral-200' : 'bg-white dark:bg-neutral-900'}`} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-end gap-px h-8">
                        {Array.from({length: 20}).map((_, i) => (
                            <div key={i} className="bg-neutral-800 dark:bg-neutral-200" style={{ width: i % 3 === 0 ? 2 : 1, height: 24 + (i % 5) * 2 }} />
                        ))}
                    </div>
                )}
                {(schema.show_human_readable ?? data.show_human_readable) && (
                    <div className="text-[7px] font-mono text-neutral-600 dark:text-neutral-400 tracking-widest">
                        {bType === 'QR' ? 'QR DATA' : '8690000012345'}
                    </div>
                )}
                <div className="text-[6px] text-neutral-400 absolute bottom-1 right-1">{bType}</div>
            </div>
        );
    };

    return (
        <>
            <Head title="Barkod Şemaları" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Barkod Şemaları</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Etiket boyutları, barkod tipi ve içerik dizilimlerini yönetin.</p>
                    </div>
                    <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="w-4 h-4 mr-2" /> Yeni Şema
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schemas.map(schema => (
                        <Card key={schema.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex">
                                    {/* Sol: Önizleme */}
                                    <div className="w-48 bg-neutral-50 dark:bg-neutral-900/50 border-r flex items-center justify-center p-4">
                                        {renderPreview(schema)}
                                    </div>
                                    {/* Sağ: Detaylar */}
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg">{schema.name}</h3>
                                                {schema.is_default && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">Varsayılan</span>}
                                                {!schema.is_active && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">Pasif</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {schema.label_width_mm}×{schema.label_height_mm}mm • Gap: {schema.gap_mm}mm • {barcodeTypes.find(t => t.value === schema.barcode_type)?.label || schema.barcode_type}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Dil: {schema.printer_language?.toUpperCase()} • Yoğunluk: {schema.density} • Hız: {schema.speed}
                                            </p>
                                            {schema.description && <p className="text-xs text-muted-foreground mt-1 italic">{schema.description}</p>}
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button variant="outline" size="sm" onClick={() => openEdit(schema)}>
                                                <Edit2 className="w-3.5 h-3.5 mr-1" /> Düzenle
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(schema.id)}>
                                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Sil
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {schemas.length === 0 && (
                        <div className="col-span-2 text-center p-12 border border-dashed rounded-lg text-muted-foreground">
                            <FileCode2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            Henüz barkod şeması tanımlanmamış.
                        </div>
                    )}
                </div>
            </div>

            {/* ── Ekle / Düzenle Modal ── */}
            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) { reset(); setEditingSchema(null); } }}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingSchema ? 'Şema Düzenle' : 'Yeni Şema Ekle'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label>Şema Adı *</Label>
                                <Input required value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ör: Standart Raf Etiketi" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Etiket Genişliği (mm) *</Label>
                                <Input type="number" required min={10} value={data.label_width_mm} onChange={e => setData('label_width_mm', parseFloat(e.target.value))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Etiket Yüksekliği (mm) *</Label>
                                <Input type="number" required min={10} value={data.label_height_mm} onChange={e => setData('label_height_mm', parseFloat(e.target.value))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Etiketler Arası Boşluk (mm)</Label>
                                <Input type="number" min={0} value={data.gap_mm} onChange={e => setData('gap_mm', parseFloat(e.target.value))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Barkod Tipi *</Label>
                                <Select value={data.barcode_type} onValueChange={v => setData('barcode_type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {barcodeTypes.map(bt => (
                                            <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Yazıcı Dili</Label>
                                <Select value={data.printer_language} onValueChange={v => setData('printer_language', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tspl">TSPL (TSC)</SelectItem>
                                        <SelectItem value="zpl">ZPL (Zebra)</SelectItem>
                                        <SelectItem value="epl">EPL (Eltron)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Yoğunluk (Density)</Label>
                                <Input type="number" min={1} max={15} value={data.density} onChange={e => setData('density', parseInt(e.target.value))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Baskı Hızı (Speed)</Label>
                                <Input type="number" min={1} max={10} value={data.speed} onChange={e => setData('speed', parseInt(e.target.value))} />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <Label>Açıklama</Label>
                                <Input value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Opsiyonel" />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 pt-2 border-t">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="show_human_readable" checked={data.show_human_readable} onCheckedChange={(c) => setData('show_human_readable', !!c)} />
                                <Label htmlFor="show_human_readable" className="text-sm">Barkod altında numara göster</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is_default" checked={data.is_default} onCheckedChange={(c) => setData('is_default', !!c)} />
                                <Label htmlFor="is_default" className="text-sm">Varsayılan şema olarak ata</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(c) => setData('is_active', !!c)} />
                                <Label htmlFor="is_active" className="text-sm">Aktif</Label>
                            </div>
                        </div>

                        {/* Önizleme */}
                        <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-900/30">
                            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">Etiket Önizleme</p>
                            <div className="flex justify-center">
                                {renderPreview(data)}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); reset(); setEditingSchema(null); }}>İptal</Button>
                            <Button type="submit" disabled={processing} className="bg-orange-600 hover:bg-orange-700">
                                {processing ? 'Kaydediliyor...' : (editingSchema ? 'Güncelle' : 'Kaydet')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Ayarlar', href: '/settings/profile' },
        { title: 'Barkod Şemaları', href: '/barcode-schemas' }
    ]
};
