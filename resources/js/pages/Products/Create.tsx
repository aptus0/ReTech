import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type {BreadcrumbItem} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Stok Yönetimi', href: '/products' },
    { title: 'Yeni Ürün Ekle', href: '/products/create' },
];

export default function Create({ categories, brands, units }: { categories: any[], brands: any[], units: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        barcode: '',
        category_id: '',
        brand_id: '',
        unit_id: '',
        purchase_price: '',
        sale_price: '',
        tax_rate: '20',
        min_stock: '0',
        opening_stock: '0',
        location: '',
        description: '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/products');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Yeni Ürün Ekle" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Yeni Stok Kartı</h1>
                    <Link href="/products" className="text-sm text-muted-foreground hover:underline">Geri Dön</Link>
                </div>

                <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="name">Ürün Adı <span className="text-destructive">*</span></Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} autoFocus required />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">Ürün Kodu</Label>
                                <Input id="code" value={data.code} onChange={e => setData('code', e.target.value)} />
                                <InputError message={errors.code} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barkod</Label>
                                <Input id="barcode" value={data.barcode} onChange={e => setData('barcode', e.target.value)} />
                                <InputError message={errors.barcode} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category_id">Kategori <span className="text-destructive">*</span></Label>
                                <Select onValueChange={v => setData('category_id', v)} value={data.category_id}>
                                    <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.category_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brand_id">Marka</Label>
                                <Select onValueChange={v => setData('brand_id', v)} value={data.brand_id}>
                                    <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                                    <SelectContent>
                                        {brands.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.brand_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_id">Birim <span className="text-destructive">*</span></Label>
                                <Select onValueChange={v => setData('unit_id', v)} value={data.unit_id}>
                                    <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                                    <SelectContent>
                                        {units.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.unit_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purchase_price">Alış Fiyatı <span className="text-destructive">*</span></Label>
                                <Input id="purchase_price" type="number" step="0.01" value={data.purchase_price} onChange={e => setData('purchase_price', e.target.value)} required />
                                <InputError message={errors.purchase_price} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sale_price">Satış Fiyatı <span className="text-destructive">*</span></Label>
                                <Input id="sale_price" type="number" step="0.01" value={data.sale_price} onChange={e => setData('sale_price', e.target.value)} required />
                                <InputError message={errors.sale_price} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tax_rate">KDV Oranı (%) <span className="text-destructive">*</span></Label>
                                <Input id="tax_rate" type="number" step="0.01" value={data.tax_rate} onChange={e => setData('tax_rate', e.target.value)} required />
                                <InputError message={errors.tax_rate} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="min_stock">Minimum Stok <span className="text-destructive">*</span></Label>
                                <Input id="min_stock" type="number" value={data.min_stock} onChange={e => setData('min_stock', e.target.value)} required />
                                <InputError message={errors.min_stock} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="opening_stock">Açılış Stoku <span className="text-destructive">*</span></Label>
                                <Input id="opening_stock" type="number" value={data.opening_stock} onChange={e => setData('opening_stock', e.target.value)} required />
                                <InputError message={errors.opening_stock} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Depo / Raf</Label>
                                <Input id="location" value={data.location} onChange={e => setData('location', e.target.value)} />
                                <InputError message={errors.location} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Input id="description" value={data.description} onChange={e => setData('description', e.target.value)} />
                            <InputError message={errors.description} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(c) => setData('is_active', !!c)} />
                            <Label htmlFor="is_active">Aktif</Label>
                        </div>

                        <div className="flex items-center justify-end gap-4 border-t pt-4">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>İptal</Button>
                            <Button type="submit" disabled={processing}>Kaydet</Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
