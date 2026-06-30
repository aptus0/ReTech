import { Head, Link, useForm, router } from '@inertiajs/react';
import { ChevronDown, Plus, Trash2, Printer, Image as ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type {BreadcrumbItem} from '@/types';

export default function Index({ products, filters, categories, brands, units }: { products: any, filters: any, categories: any[], brands: any[], units: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Stok Yönetimi', href: '/products' },
    ];

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: searchData, setData: setSearchData, get } = useForm({
        search: filters?.search || '',
    });

    const { data: formData, setData: setFormData, post, processing, errors, reset } = useForm({
        name: '', code: '', barcode: '', category_id: '', brand_id: '', unit_id: '',
        purchase_price: '', sale_price: '', tax_rate: '20', min_stock: '0', opening_stock: '0',
        location: '', description: '', is_active: true, image: null as File | null
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/products', { preserveState: true });
    };

    const toggleStatus = (id: number) => {
        router.patch(`/products/${id}/status`, {}, { preserveScroll: true });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(products.data.map((p: any) => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(i => i !== id));
        }
    };

    const handleBulkDelete = () => {
        if (!confirm('Seçili ürünleri silmek istediğinize emin misiniz?')) return;
        
        router.delete('/products/bulk-delete', {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                toast.success('Seçili ürünler silindi.');
            }
        });
    };

    const handleBulkBarcode = () => {
        if (selectedIds.length === 0) return;
        router.get('/products/barcode-print', { ids: selectedIds.join(',') });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setFormData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/products', {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                setImagePreview(null);
                toast.success('Ürün başarıyla oluşturuldu.');
            }
        });
    };

    return (
        <>
            <Head title="Stok Kartları" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Stok Kartları</h1>
                    
                    <Sheet open={isCreateOpen} onOpenChange={(open) => {
                        setIsCreateOpen(open);

                        if (!open) {
                            reset();
                            setImagePreview(null);
                        }
                    }}>
                        <SheetTrigger asChild>
                            <Button className="font-bold uppercase tracking-wider text-xs bg-orange-600 hover:bg-orange-700"><Plus className="w-4 h-4 mr-2" /> Yeni Ürün Ekle</Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[400px] sm:w-[540px] md:w-[700px] lg:w-[1000px] xl:w-[1200px] overflow-y-auto sm:max-w-none">
                            <SheetHeader className="border-b pb-4 mb-4">
                                <SheetTitle className="text-xl">Yeni Stok Kartı Oluştur</SheetTitle>
                            </SheetHeader>
                            <form onSubmit={submitCreate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Sol Taraf: Görsel */}
                                    <div className="col-span-1 flex flex-col items-center space-y-4">
                                        <Label className="text-muted-foreground w-full text-left">Ürün Görseli</Label>
                                        <div 
                                            className="w-full aspect-square rounded-xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-orange-500 transition-colors bg-neutral-50"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ImageIcon className="w-6 h-6 text-white mb-1" />
                                                        <span className="text-white text-xs font-medium">Değiştir</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center text-neutral-400 p-4 text-center">
                                                    <ImageIcon className="w-10 h-10 mb-3 text-neutral-300" />
                                                    <span className="text-sm font-medium text-neutral-500">Görsel Seçmek İçin Tıklayın</span>
                                                    <span className="text-xs mt-1">PNG, JPG (Max. 2MB)</span>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Sağ Taraf: Detaylı Form Alanları */}
                                    <div className="col-span-1 md:col-span-2 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Ürün Adı *</Label>
                                            <Input value={formData.name} onChange={e => setFormData('name', e.target.value)} required placeholder="Örn: Karaca Bio Diamond Tencere Seti" className="text-lg py-5" />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Stok Kodu</Label>
                                                <Input value={formData.code} onChange={e => setFormData('code', e.target.value)} placeholder="STK-001" />
                                                <InputError message={errors.code} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="barcode">Barkod</Label>
                                                <div className="flex">
                                                    <Input id="barcode" value={formData.barcode} onChange={e => setFormData('barcode', e.target.value)} className="rounded-r-none" placeholder="13 Haneli EAN" />
                                                    <Button type="button" variant="outline" className="rounded-l-none px-3" onClick={() => setFormData('barcode', Math.floor(Math.random() * 8999999999999 + 1000000000000).toString())} title="Otomatik Üret">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                                    </Button>
                                                </div>
                                                <InputError message={errors.barcode} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Kategori *</Label>
                                                <Select onValueChange={v => setFormData('category_id', v)} value={formData.category_id}>
                                                    <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.category_id} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Marka</Label>
                                                <Select onValueChange={v => setFormData('brand_id', v)} value={formData.brand_id}>
                                                    <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {brands.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.brand_id} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50/50 border border-orange-100 rounded-lg">
                                            <div className="space-y-2">
                                                <Label>Alış Fiyatı *</Label>
                                                <Input type="number" step="0.01" value={formData.purchase_price} onChange={e => setFormData('purchase_price', e.target.value)} required />
                                                <InputError message={errors.purchase_price} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-orange-700 font-bold">Satış Fiyatı *</Label>
                                                <Input type="number" step="0.01" value={formData.sale_price} onChange={e => setFormData('sale_price', e.target.value)} required className="border-orange-300 focus-visible:ring-orange-500" />
                                                <InputError message={errors.sale_price} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>KDV (%)</Label>
                                                <Input type="number" step="0.01" value={formData.tax_rate} onChange={e => setFormData('tax_rate', e.target.value)} required />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Açılış Stoku *</Label>
                                                <Input type="number" value={formData.opening_stock} onChange={e => setFormData('opening_stock', e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Min Stok (Kritik)</Label>
                                                <Input type="number" value={formData.min_stock} onChange={e => setFormData('min_stock', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Birim *</Label>
                                                <Select onValueChange={v => setFormData('unit_id', v)} value={formData.unit_id}>
                                                    <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                                                    <SelectContent>
                                                        {units.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.unit_id} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Açıklama / Detay</Label>
                                            <Input value={formData.description} onChange={e => setFormData('description', e.target.value)} placeholder="Ürün özelliklerini buraya yazabilirsiniz..." />
                                        </div>

                                        <div className="flex items-center space-x-2 pt-2 border-t mt-4">
                                            <Checkbox id="is_active" checked={formData.is_active} onCheckedChange={(c) => setFormData('is_active', !!c)} />
                                            <Label htmlFor="is_active" className="cursor-pointer">Aktif (Satışa Açık - Tüm ekranlarda görünür)</Label>
                                        </div>
                                    </div>
                                </div>

                                <SheetFooter className="pt-4 mt-6">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>İptal</Button>
                                    <Button type="submit" disabled={processing} className="bg-orange-600 hover:bg-orange-700 px-8">Stok Kartını Kaydet</Button>
                                </SheetFooter>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-sm border bg-card p-4 shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-1 items-center gap-4">
                        <Input 
                            placeholder="Ürün Adı, Kodu veya Barkod Ara..." 
                            value={searchData.search} 
                            onChange={e => setSearchData('search', e.target.value)} 
                            className="max-w-md"
                        />
                        <Button type="submit" variant="secondary">Ara</Button>
                    </form>

                    {selectedIds.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Toplu İşlemler ({selectedIds.length}) <ChevronDown className="w-4 h-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleBulkDelete}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Seçilenleri Sil
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={handleBulkBarcode}>
                                    <Printer className="w-4 h-4 mr-2" /> Barkod Bas
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="rounded-sm border bg-card shadow-sm overflow-hidden flex-1">
                    <div className="overflow-x-auto h-full">
                        <table className="w-full text-sm text-left text-card-foreground">
                            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                                <tr>
                                    <th className="px-4 py-3 w-[40px]">
                                        <Checkbox 
                                            checked={products.data.length > 0 && selectedIds.length === products.data.length}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 w-14">Görsel</th>
                                    <th className="px-4 py-3">Ürün Adı</th>
                                    <th className="px-4 py-3">Kod / Barkod</th>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3 text-right">Fiyat</th>
                                    <th className="px-4 py-3 text-right">Stok</th>
                                    <th className="px-4 py-3 text-center">Durum</th>
                                    <th className="px-4 py-3 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((product: any) => (
                                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <Checkbox 
                                                checked={selectedIds.includes(product.id)}
                                                onCheckedChange={(c) => handleSelect(product.id, !!c)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="w-10 h-10 rounded-md bg-white border flex items-center justify-center overflow-hidden">
                                                {product.image ? (
                                                    <img src={`/storage/${product.image}`} className="w-full h-full object-cover" alt={product.name} />
                                                ) : (
                                                    <ImageIcon className="w-4 h-4 text-neutral-300" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold">{product.name}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-xs">{product.code || '-'}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">{product.barcode || ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="text-xs bg-neutral-50">{product.category?.name || '-'}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-orange-600">
                                            ₺{Number(product.sale_price).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`font-bold ${product.current_stock <= product.min_stock ? 'text-red-600' : 'text-green-600'}`}>
                                                    {product.current_stock}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">{product.unit?.short_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => toggleStatus(product.id)}>
                                                {product.is_active ? 
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none rounded-full">Aktif</Badge> : 
                                                    <Badge variant="secondary" className="rounded-full">Pasif</Badge>
                                                }
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                            <Link href={`/products/${product.id}`}>
                                                <Button variant="secondary" size="sm" className="rounded-sm">Detay</Button>
                                            </Link>
                                            <Link href={`/products/${product.id}/edit`}>
                                                <Button variant="outline" size="sm" className="rounded-sm">Düzenle</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {products.data.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-lg">Gösterilecek kayıt bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Basit Sayfalama */}
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-neutral-50">
                        <div className="text-sm text-muted-foreground">
                            Toplam <span className="font-bold text-black">{products.total}</span> kayıt
                        </div>
                        <div className="flex gap-1">
                            {products.links.map((link: any, i: number) => (
                                <Link 
                                    key={i} 
                                    href={link.url || '#'} 
                                    className={`px-3 py-1 rounded-sm text-sm border ${link.active ? 'bg-orange-600 text-white border-orange-600' : 'bg-white hover:bg-neutral-100'} ${!link.url ? 'opacity-50 cursor-not-allowed bg-neutral-100' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Stok Yönetimi', href: '/products' }]}>
        {page}
    </AppLayout>
);
