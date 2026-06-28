import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type {BreadcrumbItem} from '@/types';

export default function Create({ products, selected_product_id }: { products: any[], selected_product_id?: string }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Stok Yönetimi', href: '/products' },
        { title: 'Manuel Stok Hareketi Ekle', href: '/stock-movements/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        product_id: selected_product_id || '',
        type: 'in',
        quantity: '1',
        unit_price: '',
        document_type: 'Manuel Giriş',
        document_no: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/stock-movements');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manuel Stok Hareketi Ekle" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Manuel Stok Hareketi İşlemi</h1>
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>Geri Dön</Button>
                </div>

                <div className="rounded-xl border bg-card p-6 text-card-foreground shadow max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="product_id">Ürün Seçimi <span className="text-destructive">*</span></Label>
                            <Select onValueChange={v => setData('product_id', v)} value={data.product_id}>
                                <SelectTrigger><SelectValue placeholder="Ürün seçiniz..." /></SelectTrigger>
                                <SelectContent>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.code || p.barcode})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.product_id} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Hareket Yönü <span className="text-destructive">*</span></Label>
                                <Select onValueChange={v => setData('type', v)} value={data.type}>
                                    <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in">Stok Girişi (In)</SelectItem>
                                        <SelectItem value="out">Stok Çıkışı (Out)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Miktar <span className="text-destructive">*</span></Label>
                                <Input id="quantity" type="number" min="1" value={data.quantity} onChange={e => setData('quantity', e.target.value)} required />
                                <InputError message={errors.quantity} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_price">Birim Fiyat (Opsiyonel)</Label>
                                <Input id="unit_price" type="number" step="0.01" value={data.unit_price} onChange={e => setData('unit_price', e.target.value)} />
                                <InputError message={errors.unit_price} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="document_type">Belge Tipi</Label>
                                <Input id="document_type" value={data.document_type} onChange={e => setData('document_type', e.target.value)} />
                                <InputError message={errors.document_type} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="document_no">Belge Numarası</Label>
                                <Input id="document_no" value={data.document_no} onChange={e => setData('document_no', e.target.value)} />
                                <InputError message={errors.document_no} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Input id="description" value={data.description} onChange={e => setData('description', e.target.value)} />
                            <InputError message={errors.description} />
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
