import { Head, Link, useForm } from '@inertiajs/react';
import { Briefcase, Building2, Hash, Mail, MapPin, Phone, StickyNote, User } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type {BreadcrumbItem} from '@/types';

export default function Edit({ customer }: { customer: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cari Yönetimi', href: '/customers' },
        { title: 'Cari Düzenle', href: `/customers/${customer.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        type: customer.type || 'corporate',
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        tax_office: customer.tax_office || '',
        tax_number: customer.tax_number || '',
        notes: customer.notes || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/customers/${customer.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Cari Düzenle: ${customer.name}`} />

            <div className="max-w-4xl mx-auto p-4 md:p-8 w-full">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Cari Düzenle</h1>
                        <p className="text-muted-foreground mt-1">{customer.name} cari hesabını güncelliyorsunuz.</p>
                    </div>
                    <Link href="/customers">
                        <Button variant="outline" className="rounded-full px-6">İptal Et</Button>
                    </Link>
                </div>

                <div className="bg-white dark:bg-neutral-950 rounded-2xl border shadow-sm overflow-hidden">
                    <div className="bg-neutral-50/50 dark:bg-neutral-900/50 px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold flex items-center"><Briefcase className="w-5 h-5 mr-2 text-orange-600" /> Temel Bilgiler</h2>
                    </div>
                    <form onSubmit={submit} className="p-6 md:p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="type" className="text-neutral-600 dark:text-neutral-400">Cari Tipi <span className="text-red-500">*</span></Label>
                                <select
                                    id="type"
                                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:border-orange-600 transition-colors"
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    required
                                >
                                    <option value="customer">Müşteri</option>
                                    <option value="supplier">Tedarikçi</option>
                                    <option value="both">Hem Müşteri Hem Tedarikçi</option>
                                </select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-neutral-600 dark:text-neutral-400">Cari Adı / Firma Ünvanı <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                    <Input
                                        id="name"
                                        className="pl-10 h-11 rounded-lg focus-visible:ring-orange-600 focus-visible:border-orange-600"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                        placeholder="Örn: ReTech A.Ş."
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="phone" className="text-neutral-600 dark:text-neutral-400">Telefon Numarası</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                    <Input
                                        id="phone"
                                        className="pl-10 h-11 rounded-lg focus-visible:ring-orange-600"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="05XX XXX XX XX"
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-neutral-600 dark:text-neutral-400">E-posta Adresi</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-10 h-11 rounded-lg focus-visible:ring-orange-600"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="ornek@firma.com"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="tax_office" className="text-neutral-600 dark:text-neutral-400">Vergi Dairesi</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                    <Input
                                        id="tax_office"
                                        className="pl-10 h-11 rounded-lg focus-visible:ring-orange-600"
                                        value={data.tax_office}
                                        onChange={e => setData('tax_office', e.target.value)}
                                        placeholder="Örn: Şişli VD."
                                    />
                                </div>
                                <InputError message={errors.tax_office} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="tax_number" className="text-neutral-600 dark:text-neutral-400">Vergi Numarası / TCKN</Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                    <Input
                                        id="tax_number"
                                        className="pl-10 h-11 rounded-lg focus-visible:ring-orange-600"
                                        value={data.tax_number}
                                        onChange={e => setData('tax_number', e.target.value)}
                                        placeholder="10 Haneli VKN / 11 Haneli TCKN"
                                    />
                                </div>
                                <InputError message={errors.tax_number} />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label htmlFor="address" className="text-neutral-600 dark:text-neutral-400">Açık Adres</Label>
                            <Textarea
                                id="address"
                                className="rounded-lg focus-visible:ring-orange-600 resize-none"
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                rows={3}
                                placeholder="Fatura veya teslimat adresi..."
                            />
                            <InputError message={errors.address} />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="notes" className="text-neutral-600 dark:text-neutral-400">Özel Notlar</Label>
                            <div className="relative">
                                <StickyNote className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                <Textarea
                                    id="notes"
                                    className="pl-10 rounded-lg focus-visible:ring-orange-600 resize-none"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows={2}
                                    placeholder="Cari ile ilgili ek notlar..."
                                />
                            </div>
                            <InputError message={errors.notes} />
                        </div>

                        <div className="flex justify-end pt-8 border-t mt-8">
                            <Button type="submit" disabled={processing} className="w-full md:w-auto px-8 h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 rounded-full transition-all hover:scale-105 active:scale-95">
                                Değişiklikleri Kaydet
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
