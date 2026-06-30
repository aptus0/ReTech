import { Head, useForm, router } from '@inertiajs/react';
import { FileCode2, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        company_name: '',
        description: '',
        label_width_mm: 50,
        label_height_mm: 30,
        gap_mm: 3,
        columns: 1,
        rows: 1,
        margin_left_mm: 0,
        margin_top_mm: 0,
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
            company_name: schema.company_name || '',
            description: schema.description || '',
            label_width_mm: schema.label_width_mm || 50,
            label_height_mm: schema.label_height_mm || 30,
            gap_mm: schema.gap_mm || 3,
            columns: schema.columns || 1,
            rows: schema.rows || 1,
            margin_left_mm: schema.margin_left_mm || 0,
            margin_top_mm: schema.margin_top_mm || 0,
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

    // Gelişmiş Etiket Önizleme
    const renderPreview = (schema: any, isLarge = false) => {
        const scale = isLarge ? 6 : 3; 
        const w = (schema.label_width_mm || data.label_width_mm) * scale;
        const h = (schema.label_height_mm || data.label_height_mm) * scale;
        const bType = schema.barcode_type || data.barcode_type;
        const cols = schema.columns || data.columns || 1;
        
        return (
            <div className={`flex gap-${isLarge ? '6' : '2'} items-center justify-center`}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                    <div
                        key={colIndex}
                        className="border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 rounded-sm flex flex-col p-2 relative shadow-md transition-all duration-300 overflow-hidden"
                        style={{ width: w, height: h, minWidth: isLarge ? 240 : 120, minHeight: isLarge ? 140 : 80 }}
                    >
                        {/* Ust Kisım: Firma ve Urun Adi */}
                        <div className="w-full text-center flex-shrink-0">
                            <div className={`font-black tracking-widest text-neutral-800 dark:text-neutral-100 uppercase ${isLarge ? 'text-[14px]' : 'text-[10px]'}`}>{schema.company_name || data.company_name || 'FİRMA ADI'}</div>
                            <div className={`text-neutral-500 dark:text-neutral-400 mt-0.5 truncate w-full font-medium ${isLarge ? 'text-[12px]' : 'text-[9px]'}`}>Premium Kışlık Mont - Siyah</div>
                        </div>

                        {/* Orta Kisım: Barkod */}
                        <div className="flex flex-col items-center justify-center flex-1 w-full my-auto overflow-hidden">
                            {bType === 'QR' ? (
                                <div className={`border-2 border-neutral-800 dark:border-neutral-200 grid grid-cols-4 grid-rows-4 gap-0.5 p-1 bg-white ${isLarge ? 'w-24 h-24' : 'w-12 h-12'}`}>
                                    {Array.from({length: 16}).map((_, i) => (
                                        <div key={i} className={`${[0,1,2,4,5,7,8,10,11,13,15].includes(i) ? 'bg-neutral-900 dark:bg-neutral-800' : 'bg-transparent'}`} />
                                    ))}
                                </div>
                            ) : (
                                <div className={`flex items-end justify-center gap-0.5 w-full bg-white px-2 ${isLarge ? 'h-16' : 'h-10'} overflow-hidden`}>
                                    {Array.from({length: isLarge ? 40 : 20}).map((_, i) => {
                                        const width = [1, 2, 3, 4][(i * 13) % 4];
                                        return <div key={i} className="bg-neutral-900 dark:bg-neutral-800 h-full flex-shrink-0" style={{ width: `${width}px` }} />
                                    })}
                                </div>
                            )}
                            {(schema.show_human_readable ?? data.show_human_readable) && (
                                <div className={`font-mono text-neutral-800 dark:text-neutral-200 tracking-[0.25em] font-semibold flex-shrink-0 ${isLarge ? 'text-[14px] mt-2' : 'text-[10px] mt-1'}`}>
                                    {bType === 'QR' ? 'QR-123456789' : '8690000012345'}
                                </div>
                            )}
                        </div>

                        {/* Alt Kisım: Fiyat */}
                        <div className="w-full flex justify-between items-end flex-shrink-0 pt-1 border-t border-dashed border-neutral-200 dark:border-neutral-700 mt-1">
                            <div className={`text-neutral-500 font-mono ${isLarge ? 'text-[11px]' : 'text-[7px]'}`}>SKU: PRM-001</div>
                            <div className={`font-black text-neutral-900 dark:text-white leading-none ${isLarge ? 'text-[24px]' : 'text-[14px]'}`}>₺2.499,00</div>
                        </div>
                    </div>
                ))}
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

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {schemas.map(schema => (
                        <Card key={schema.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="w-full sm:w-64 bg-neutral-100 dark:bg-neutral-900/80 border-b sm:border-b-0 sm:border-r flex items-center justify-center p-6 min-h-[160px]">
                                        {renderPreview(schema, false)}
                                    </div>
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-lg">{schema.name}</h3>
                                                {schema.is_default && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">Varsayılan</span>}
                                                {!schema.is_active && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">Pasif</span>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                                                <p className="text-xs text-muted-foreground">Boyut: <strong className="text-neutral-700 dark:text-neutral-300">{schema.label_width_mm}×{schema.label_height_mm}mm</strong></p>
                                                <p className="text-xs text-muted-foreground">Düzen: <strong className="text-neutral-700 dark:text-neutral-300">{schema.columns} Kolon</strong></p>
                                                <p className="text-xs text-muted-foreground">Barkod: <strong className="text-neutral-700 dark:text-neutral-300">{barcodeTypes.find(t => t.value === schema.barcode_type)?.label || schema.barcode_type}</strong></p>
                                                <p className="text-xs text-muted-foreground">Dil: <strong className="text-neutral-700 dark:text-neutral-300">{schema.printer_language?.toUpperCase()}</strong></p>
                                            </div>
                                            {schema.description && <p className="text-xs text-muted-foreground mt-3 italic bg-neutral-50 dark:bg-neutral-900 p-2 rounded">{schema.description}</p>}
                                        </div>
                                        <div className="flex gap-2 mt-4">
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

            <Dialog open={isModalOpen} onOpenChange={(open) => {
 setIsModalOpen(open);

 if (!open) {
 reset(); setEditingSchema(null); 
} 
}}>
                <DialogContent className="max-w-[90vw] lg:max-w-7xl h-[95vh] flex flex-col p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 pb-4 border-b bg-neutral-50/50 dark:bg-neutral-900/50">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {editingSchema ? <Edit2 className="w-6 h-6 text-orange-600" /> : <Plus className="w-6 h-6 text-orange-600" />}
                            {editingSchema ? 'Şema Düzenle' : 'Yeni Şema Oluştur'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sol Form */}
                        <div className="w-full lg:w-2/5 p-6 overflow-y-auto border-r border-neutral-200 dark:border-neutral-800 custom-scrollbar">
                            <form id="schema-form" onSubmit={submit} className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200 border-b pb-2 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-orange-100 text-orange-700 flex items-center justify-center text-xs">1</div>
                                        Temel Bilgiler
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Şema Adı *</Label>
                                            <Input required value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ör: Standart Raf Etiketi" className="h-10" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Etiket Başlığı (Firma Adı)</Label>
                                            <Input value={data.company_name} onChange={e => setData('company_name', e.target.value)} placeholder="Ör: KARACA TİCARET" className="h-10" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Açıklama</Label>
                                            <Input value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Opsiyonel açıklama" className="h-10" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200 border-b pb-2 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-orange-100 text-orange-700 flex items-center justify-center text-xs">2</div>
                                        Fiziksel Boyutlar
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Genişlik (mm) *</Label>
                                            <Input type="number" required min={10} value={data.label_width_mm} onChange={e => setData('label_width_mm', parseFloat(e.target.value))} className="h-10" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Yükseklik (mm) *</Label>
                                            <Input type="number" required min={10} value={data.label_height_mm} onChange={e => setData('label_height_mm', parseFloat(e.target.value))} className="h-10" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Kolon Sayısı (Yan Yana)</Label>
                                            <Input type="number" min={1} max={5} value={data.columns} onChange={e => setData('columns', parseInt(e.target.value))} className="h-10" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Boşluk (Gap mm)</Label>
                                            <Input type="number" min={0} value={data.gap_mm} onChange={e => setData('gap_mm', parseFloat(e.target.value))} className="h-10" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Sol Marjin (mm)</Label>
                                            <Input type="number" min={0} value={data.margin_left_mm} onChange={e => setData('margin_left_mm', parseFloat(e.target.value))} className="h-10" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Üst Marjin (mm)</Label>
                                            <Input type="number" min={0} value={data.margin_top_mm} onChange={e => setData('margin_top_mm', parseFloat(e.target.value))} className="h-10" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200 border-b pb-2 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-orange-100 text-orange-700 flex items-center justify-center text-xs">3</div>
                                        Baskı Ayarları
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label>Barkod Tipi *</Label>
                                            <Select value={data.barcode_type} onValueChange={v => setData('barcode_type', v)}>
                                                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
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
                                                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tspl">TSPL (TSC / Xprinter)</SelectItem>
                                                    <SelectItem value="zpl">ZPL (Zebra)</SelectItem>
                                                    <SelectItem value="epl">EPL (Eltron)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Koyuluk (Density)</Label>
                                            <Input type="number" min={1} max={15} value={data.density} onChange={e => setData('density', parseInt(e.target.value))} className="h-10" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Hız (Speed)</Label>
                                            <Input type="number" min={1} max={10} value={data.speed} onChange={e => setData('speed', parseInt(e.target.value))} className="h-10" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200 border-b pb-2 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-orange-100 text-orange-700 flex items-center justify-center text-xs">4</div>
                                        Görünüm Seçenekleri
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-neutral-900 border border-transparent focus-within:border-orange-500 transition-colors p-3.5 rounded-lg shadow-sm">
                                            <Checkbox id="show_human_readable" checked={data.show_human_readable} onCheckedChange={(c) => setData('show_human_readable', !!c)} className="w-5 h-5 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600" />
                                            <Label htmlFor="show_human_readable" className="text-[15px] font-medium cursor-pointer flex-1">Barkod Numarasını Göster</Label>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-neutral-900 border border-transparent focus-within:border-orange-500 transition-colors p-3.5 rounded-lg shadow-sm">
                                            <Checkbox id="is_default" checked={data.is_default} onCheckedChange={(c) => setData('is_default', !!c)} className="w-5 h-5 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600" />
                                            <Label htmlFor="is_default" className="text-[15px] font-medium cursor-pointer flex-1">Varsayılan Şema Olarak Ata</Label>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-neutral-50 dark:bg-neutral-900 border border-transparent focus-within:border-orange-500 transition-colors p-3.5 rounded-lg shadow-sm">
                                            <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(c) => setData('is_active', !!c)} className="w-5 h-5 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600" />
                                            <Label htmlFor="is_active" className="text-[15px] font-medium cursor-pointer flex-1">Şema Aktif (Kullanılabilir)</Label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        {/* Sağ Önizleme Alanı */}
                        <div className="hidden lg:flex w-3/5 bg-[#f8fafc] dark:bg-[#0f172a] p-10 flex-col relative overflow-hidden shadow-[inset_10px_0_20px_rgba(0,0,0,0.02)]">
                            <div className="absolute top-6 right-6 bg-white dark:bg-neutral-800 px-4 py-2 rounded-full shadow-md text-sm font-bold flex items-center gap-2 border border-neutral-100 dark:border-neutral-700 z-20">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                CANLI ÖNİZLEME
                            </div>
                            
                            <div className="flex-1 flex items-center justify-center border-[3px] border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50 p-8 overflow-auto relative z-10 shadow-inner">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                                <div className="relative z-10 transition-all duration-300 transform hover:scale-105 drop-shadow-2xl">
                                    {renderPreview(data, true)}
                                </div>
                            </div>
                            
                            <div className="mt-6 flex flex-wrap gap-4 text-[15px] text-neutral-600 dark:text-neutral-400 justify-center font-medium bg-white dark:bg-neutral-900 py-3 px-6 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center gap-1.5"><span className="text-neutral-400">↔</span> Genişlik: <strong className="text-neutral-900 dark:text-white">{data.label_width_mm}mm</strong></div>
                                <span className="opacity-30">|</span>
                                <div className="flex items-center gap-1.5"><span className="text-neutral-400">↕</span> Yükseklik: <strong className="text-neutral-900 dark:text-white">{data.label_height_mm}mm</strong></div>
                                <span className="opacity-30">|</span>
                                <div className="flex items-center gap-1.5"><span className="text-neutral-400">▤</span> Kolon: <strong className="text-neutral-900 dark:text-white">{data.columns}</strong></div>
                                <span className="opacity-30">|</span>
                                <div className="flex items-center gap-1.5"><span className="text-neutral-400">❖</span> Tip: <strong className="text-neutral-900 dark:text-white">{barcodeTypes.find(t => t.value === data.barcode_type)?.label || data.barcode_type}</strong></div>
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter className="p-5 border-t bg-white dark:bg-neutral-950 flex justify-end gap-3 z-20">
                        <Button type="button" variant="outline" className="h-12 px-6 rounded-lg font-semibold" onClick={() => {
 setIsModalOpen(false); reset(); setEditingSchema(null); 
}}>Vazgeç</Button>
                        <Button type="submit" form="schema-form" disabled={processing} className="h-12 px-8 rounded-lg font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 transition-all hover:scale-105 active:scale-95">
                            {processing ? 'KAYDEDİLİYOR...' : (editingSchema ? 'DEĞİŞİKLİKLERİ KAYDET' : 'ŞEMAYI OLUŞTUR VE KAYDET')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

import AppLayout from '@/layouts/app-layout';

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Ayarlar', href: '/settings/profile' },
            { title: 'Barkod Şemaları', href: '/barcode-schemas' }
        ]}
    >
        {page}
    </AppLayout>
);
