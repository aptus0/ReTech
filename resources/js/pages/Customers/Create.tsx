import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type {BreadcrumbItem} from '@/types';

export default function Create() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cari Yönetimi', href: '/customers' },
        { title: 'Yeni Cari', href: '/customers/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        type: 'customer',
        name: '',
        phone: '',
        email: '',
        address: '',
        tax_office: '',
        tax_number: '',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customers');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Yeni Cari Ekle" />

            <div className="max-w-3xl mx-auto p-4 md:p-6 w-full">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Yeni Cari Ekle</h1>
                    <Link href="/customers">
                        <Button variant="outline">Geri Dön</Button>
                    </Link>
                </div>

                <div className="bg-card rounded-xl border shadow-sm p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Cari Tipi *</Label>
                                <select
                                    id="type"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    required
                                >
                                    <option value="customer">Müşteri (Alıcı)</option>
                                    <option value="supplier">Tedarikçi (Satıcı)</option>
                                    <option value="both">Her İkisi</option>
                                </select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Cari Adı / Firma Ünvanı *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                    placeholder="Örn: Re Tech A.Ş."
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    placeholder="0555 555 5555"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="ornek@firma.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tax_office">Vergi Dairesi</Label>
                                <Input
                                    id="tax_office"
                                    value={data.tax_office}
                                    onChange={e => setData('tax_office', e.target.value)}
                                />
                                <InputError message={errors.tax_office} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tax_number">Vergi Numarası / TCKN</Label>
                                <Input
                                    id="tax_number"
                                    value={data.tax_number}
                                    onChange={e => setData('tax_number', e.target.value)}
                                />
                                <InputError message={errors.tax_number} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Adres</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                rows={3}
                            />
                            <InputError message={errors.address} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notlar</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                rows={2}
                                placeholder="Cari ile ilgili ek notlar..."
                            />
                            <InputError message={errors.notes} />
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit" disabled={processing} className="w-full md:w-auto">
                                Kaydet
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
