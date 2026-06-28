import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Search, Plus, Building2, User, RefreshCw, Trash2, Edit } from 'lucide-react';

export default function Index({ customers, filters }: { customers: any, filters: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Cari Yönetimi', href: '/customers' },
    ];

    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/customers', { search, type }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setType('');
        router.get('/customers');
    };

    const toggleStatus = (id: number) => {
        if(confirm('Cari durumunu değiştirmek istediğinize emin misiniz?')) {
            router.patch(`/customers/${id}/status`);
        }
    };

    const deleteCustomer = (id: number) => {
        if(confirm('Bu cari kartı silmek istediğinize emin misiniz?')) {
            router.delete(`/customers/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cari Yönetimi" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Cari Yönetimi</h1>
                        <p className="text-muted-foreground">Müşteri ve tedarikçilerinizi yönetin, bakiye durumlarını takip edin.</p>
                    </div>
                    <Link href="/customers/create">
                        <Button className="w-full md:w-auto gap-2">
                            <Plus className="w-4 h-4" /> Yeni Cari Ekle
                        </Button>
                    </Link>
                </div>

                <div className="bg-card rounded-xl border shadow-sm p-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3">
                            <label className="text-sm font-medium mb-1 block">Arama</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Cari adı, telefon veya vergi no..." 
                                    className="pl-9"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/4">
                            <label className="text-sm font-medium mb-1 block">Cari Tipi</label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={type}
                                onChange={e => setType(e.target.value)}
                            >
                                <option value="">Tümü</option>
                                <option value="customer">Müşteri</option>
                                <option value="supplier">Tedarikçi</option>
                                <option value="both">Her İkisi</option>
                            </select>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button type="submit">Filtrele</Button>
                            <Button type="button" variant="outline" onClick={handleReset}>Temizle</Button>
                        </div>
                    </form>
                </div>

                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                                <tr>
                                    <th className="px-4 py-3">Cari Adı / Firma</th>
                                    <th className="px-4 py-3">Tip</th>
                                    <th className="px-4 py-3">İletişim</th>
                                    <th className="px-4 py-3 text-right">Bakiye (TL)</th>
                                    <th className="px-4 py-3 text-center">Durum</th>
                                    <th className="px-4 py-3 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.data.map((customer: any) => (
                                    <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-2">
                                                {customer.type === 'supplier' ? 
                                                    <Building2 className="w-4 h-4 text-muted-foreground"/> : 
                                                    <User className="w-4 h-4 text-muted-foreground"/>}
                                                <Link href={`/customers/${customer.id}`} className="hover:underline hover:text-primary">
                                                    {customer.name}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {customer.type === 'customer' && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Müşteri</Badge>}
                                            {customer.type === 'supplier' && <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Tedarikçi</Badge>}
                                            {customer.type === 'both' && <Badge variant="outline">Her İkisi</Badge>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-xs">{customer.phone || '-'}</div>
                                            <div className="text-xs text-muted-foreground">{customer.email || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            <span className={customer.balance < 0 ? "text-destructive" : "text-green-600"}>
                                                {Number(customer.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => toggleStatus(customer.id)} className="focus:outline-none">
                                                {customer.is_active ? 
                                                    <Badge className="bg-green-500 hover:bg-green-600 cursor-pointer">Aktif</Badge> : 
                                                    <Badge variant="secondary" className="cursor-pointer">Pasif</Badge>
                                                }
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/customers/${customer.id}`}>
                                                    <Button variant="ghost" size="icon" title="Detay">
                                                        <Search className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/customers/${customer.id}/edit`}>
                                                    <Button variant="ghost" size="icon" title="Düzenle">
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" title="Sil" onClick={() => deleteCustomer(customer.id)}>
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {customers.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Kayıtlı cari bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {customers.links && customers.links.length > 3 && (
                        <div className="flex items-center justify-center p-4 border-t">
                            <div className="flex gap-1">
                                {customers.links.map((link: any, i: number) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm border rounded-md ${link.active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
