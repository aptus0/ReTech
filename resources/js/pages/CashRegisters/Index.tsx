import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Trash2, Plus, MoreVertical, Search, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

export default function Index({ registers, filters }: { registers: any, filters: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRegister, setEditingRegister] = useState<any>(null);

    const { data: searchData, setData: setSearchData, get } = useForm({
        search: filters?.search || '',
    });

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        currency: 'TRY',
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/cash-registers', { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingRegister(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (register: any) => {
        setEditingRegister(register);
        setData({
            name: register.name,
            currency: register.currency || 'TRY',
            is_active: register.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingRegister) {
            put(`/cash-registers/${editingRegister.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Kasa güncellendi.');
                }
            });
        } else {
            post('/cash-registers', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Kasa oluşturuldu.');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Bu kasayı silmek istediğinize emin misiniz?')) {
            destroy(`/cash-registers/${id}`, {
                onSuccess: () => toast.success('Kasa silindi.'),
                onError: (err) => {
                    if (err[0]) {
toast.error(err[0]);
}
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Kasa Tanımları', href: '/cash-registers' }]}>
            <Head title="Kasa Tanımları" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Kasa Tanımları</h1>
                    <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Yeni Kasa Ekle
                    </Button>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-sm border bg-card p-4 shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-1 items-center gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Kasa Adı Ara..." 
                                value={searchData.search} 
                                onChange={e => setSearchData('search', e.target.value)} 
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary">Ara</Button>
                    </form>
                </div>

                <div className="rounded-sm border bg-card shadow-sm overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-card-foreground">
                            <thead className="text-[11px] uppercase bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-b">
                                <tr>
                                    <th className="px-6 py-4 w-16">İKON</th>
                                    <th className="px-6 py-4">KASA ADI</th>
                                    <th className="px-6 py-4">DÖVİZ CİNSİ</th>
                                    <th className="px-6 py-4 text-right">BAKİYE</th>
                                    <th className="px-6 py-4 text-center">DURUM</th>
                                    <th className="px-6 py-4 text-right">İŞLEMLER</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registers?.data?.map((register: any) => (
                                    <tr key={register.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="w-10 h-10 rounded-md bg-neutral-100 border flex items-center justify-center">
                                                <Wallet className="w-4 h-4 text-neutral-400" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-semibold">{register.name}</td>
                                        <td className="px-6 py-3 text-muted-foreground">{register.currency}</td>
                                        <td className="px-6 py-3 text-right font-bold font-mono">
                                            {Number(register.current_balance || 0).toLocaleString('tr-TR', { style: 'currency', currency: register.currency || 'TRY' })}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            {register.is_active ? 
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Aktif</span> : 
                                                <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-bold">Pasif</span>
                                            }
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditModal(register)}>
                                                        <Edit className="w-4 h-4 mr-2" /> Düzenle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(register.id)} className="text-red-600">
                                                        <Trash2 className="w-4 h-4 mr-2" /> Sil
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {(!registers?.data || registers.data.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Gösterilecek kasa bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRegister ? 'Kasayı Düzenle' : 'Yeni Kasa Ekle'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Kasa Adı *</Label>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="Örn: Merkez Kasa, TL Kasası" />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Döviz Cinsi *</Label>
                            <select 
                                value={data.currency} 
                                onChange={e => setData('currency', e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="TRY">Türk Lirası (TRY)</option>
                                <option value="USD">Dolar (USD)</option>
                                <option value="EUR">Euro (EUR)</option>
                            </select>
                            {errors.currency && <p className="text-sm text-red-500">{errors.currency}</p>}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="is_active" 
                                checked={data.is_active} 
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                            />
                            <Label htmlFor="is_active">Kasa Aktif</Label>
                        </div>

                        <DialogFooter className="mt-6 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>İptal</Button>
                            <Button type="submit" disabled={processing} className="bg-orange-600 hover:bg-orange-700">Kaydet</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
