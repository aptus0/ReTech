import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { ImagePlus, Package, ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import { ImageCropper } from '@/components/image-cropper';
import { Link } from '@inertiajs/react';

interface Props {
    categories: Array<{ id: number; name: string }>;
    brands: Array<{ id: number; name: string }>;
    units: Array<{ id: number; name: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ürünler', href: '/products' },
    { title: 'Yeni Ürün Ekle', href: '/products/create' },
];

export default function CreateProduct({ categories, brands, units }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        barcode: '',
        category_id: '',
        brand_id: '',
        unit_id: units[0]?.id?.toString() || '',
        purchase_price: '0',
        sale_price: '0',
        tax_rate: '20',
        min_stock: '0',
        opening_stock: '0',
        location: '',
        description: '',
        is_active: true,
        image: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/products');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setIsCropperOpen(true);
        }
    };

    const handleCropComplete = (croppedFile: File) => {
        setData('image', croppedFile);
        const url = URL.createObjectURL(croppedFile);
        setPreviewUrl(url);
    };

    const removeImage = () => {
        setData('image', null);
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/products">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Yeni Ürün</h1>
                            <p className="text-sm text-muted-foreground">Kataloğunuza yeni bir ürün ekleyin.</p>
                        </div>
                    </div>
                    <Button onClick={submit} disabled={processing}>
                        {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Kaydet
                    </Button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <form onSubmit={submit} className="mx-auto max-w-5xl space-y-8">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            
                            {/* Sol Kolon: Ana Bilgiler */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="rounded-xl border bg-card p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4">Temel Bilgiler</h2>
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Ürün Adı <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Örn: Siyah Pamuklu T-Shirt"
                                            />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="code">Stok Kodu</Label>
                                                <Input
                                                    id="code"
                                                    value={data.code}
                                                    onChange={(e) => setData('code', e.target.value)}
                                                    placeholder="Örn: TSH-001"
                                                />
                                                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="barcode">Barkod</Label>
                                                <Input
                                                    id="barcode"
                                                    value={data.barcode}
                                                    onChange={(e) => setData('barcode', e.target.value)}
                                                    placeholder="Örn: 8690000000001"
                                                />
                                                {errors.barcode && <p className="text-sm text-destructive">{errors.barcode}</p>}
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Açıklama</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Ürün açıklaması..."
                                                rows={4}
                                            />
                                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border bg-card p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4">Fiyatlandırma ve Stok</h2>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="purchase_price">Alış Fiyatı (₺)</Label>
                                            <Input
                                                id="purchase_price"
                                                type="number"
                                                step="0.01"
                                                value={data.purchase_price}
                                                onChange={(e) => setData('purchase_price', e.target.value)}
                                            />
                                            {errors.purchase_price && <p className="text-sm text-destructive">{errors.purchase_price}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="sale_price">Satış Fiyatı (₺) <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="sale_price"
                                                type="number"
                                                step="0.01"
                                                value={data.sale_price}
                                                onChange={(e) => setData('sale_price', e.target.value)}
                                            />
                                            {errors.sale_price && <p className="text-sm text-destructive">{errors.sale_price}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="tax_rate">KDV Oranı (%)</Label>
                                            <Input
                                                id="tax_rate"
                                                type="number"
                                                value={data.tax_rate}
                                                onChange={(e) => setData('tax_rate', e.target.value)}
                                            />
                                            {errors.tax_rate && <p className="text-sm text-destructive">{errors.tax_rate}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="opening_stock">Açılış Stoğu</Label>
                                            <Input
                                                id="opening_stock"
                                                type="number"
                                                value={data.opening_stock}
                                                onChange={(e) => setData('opening_stock', e.target.value)}
                                            />
                                            {errors.opening_stock && <p className="text-sm text-destructive">{errors.opening_stock}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="min_stock">Kritik Stok Seviyesi</Label>
                                            <Input
                                                id="min_stock"
                                                type="number"
                                                value={data.min_stock}
                                                onChange={(e) => setData('min_stock', e.target.value)}
                                            />
                                            {errors.min_stock && <p className="text-sm text-destructive">{errors.min_stock}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="location">Depo / Raf Konumu</Label>
                                            <Input
                                                id="location"
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                placeholder="Örn: A-Blok Raf-3"
                                            />
                                            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sağ Kolon: Görsel ve Kategoriler */}
                            <div className="space-y-8">
                                <div className="rounded-xl border bg-card p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4">Ürün Görseli</h2>
                                    
                                    <div className="space-y-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                        />

                                        {previewUrl ? (
                                            <div className="relative group rounded-lg overflow-hidden border">
                                                <img src={previewUrl} alt="Önizleme" className="w-full h-auto aspect-square object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button type="button" variant="secondary" size="sm" onClick={() => setIsCropperOpen(true)}>
                                                        Düzenle
                                                    </Button>
                                                    <Button type="button" variant="destructive" size="icon" onClick={removeImage}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div 
                                                className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                                    <ImagePlus className="h-6 w-6 text-primary" />
                                                </div>
                                                <p className="text-sm font-medium">Görsel Yükle</p>
                                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, max 2MB</p>
                                            </div>
                                        )}
                                        {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                                    </div>
                                </div>

                                <div className="rounded-xl border bg-card p-6 shadow-sm">
                                    <h2 className="text-lg font-semibold mb-4">Sınıflandırma</h2>
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label>Kategori <span className="text-red-500">*</span></Label>
                                            <Select value={data.category_id} onValueChange={(v) => setData('category_id', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Kategori Seçin" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((c) => (
                                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Marka</Label>
                                            <Select value={data.brand_id} onValueChange={(v) => setData('brand_id', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Marka Seçin" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Markasız</SelectItem>
                                                    {brands.map((b) => (
                                                        <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.brand_id && <p className="text-sm text-destructive">{errors.brand_id}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Birim <span className="text-red-500">*</span></Label>
                                            <Select value={data.unit_id} onValueChange={(v) => setData('unit_id', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Birim Seçin" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {units.map((u) => (
                                                        <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.unit_id && <p className="text-sm text-destructive">{errors.unit_id}</p>}
                                        </div>

                                        <div className="flex items-center justify-between border-t pt-4 mt-4">
                                            <div className="space-y-0.5">
                                                <Label>Aktif Durumu</Label>
                                                <p className="text-xs text-muted-foreground">Ürün satışa açık mı?</p>
                                            </div>
                                            <Switch
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <ImageCropper 
                open={isCropperOpen} 
                onOpenChange={setIsCropperOpen} 
                imageFile={selectedFile} 
                onCropComplete={handleCropComplete} 
            />
        </AppLayout>
    );
}
