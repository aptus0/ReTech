import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Trash2, Plus, MoreVertical, Search, Ruler } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

export default function Index({ units, filters }: { units: any, filters: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<any>(null);

    const { data: searchData, setData: setSearchData, get } = useForm({
        search: filters?.search || '',
    });

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        short_name: '',
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/units', { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingUnit(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (unit: any) => {
        setEditingUnit(unit);
        setData({
            name: unit.name,
            short_name: unit.short_name || '',
            is_active: unit.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingUnit) {
            put(`/units/${editingUnit.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Birim güncellendi.');
                }
            });
        } else {
            post('/units', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Birim oluşturuldu.');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Bu birimi silmek istediğinize emin misiniz?')) {
            destroy(`/units/${id}`, {
                onSuccess: () => toast.success('Birim silindi.')
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Birimler', href: '/units' }]}>
            <Head title="Birimler" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Birim Yönetimi</h1>
                    <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Yeni Birim Ekle
                    </Button>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-sm border bg-card p-4 shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-1 items-center gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Birim Adı veya Kısaltma Ara..." 
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
                                    <th className="px-6 py-4">BİRİM ADI</th>
                                    <th className="px-6 py-4">KISALTMA</th>
                                    <th className="px-6 py-4 text-center">DURUM</th>
                                    <th className="px-6 py-4 text-right">İŞLEMLER</th>
                                </tr>
                            </thead>
                            <tbody>
                                {units?.data?.map((unit: any) => (
                                    <tr key={unit.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="w-10 h-10 rounded-md bg-neutral-100 border flex items-center justify-center">
                                                <Ruler className="w-4 h-4 text-neutral-400" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-semibold">{unit.name}</td>
                                        <td className="px-6 py-3 text-muted-foreground">{unit.short_name || '-'}</td>
                                        <td className="px-6 py-3 text-center">
                                            {unit.is_active ? 
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Aktif</span> : 
                                                <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-bold">Pasif</span>
                                            }
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" onClick={() => openEditModal(unit)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(unit.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!units?.data || units.data.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Gösterilecek birim bulunamadı.</td>
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
                        <DialogTitle>{editingUnit ? 'Birimi Düzenle' : 'Yeni Birim Ekle'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Birim Adı *</Label>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} required placeholder="Örn: Adet, Kilogram" />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Kısaltma *</Label>
                            <Input value={data.short_name} onChange={e => setData('short_name', e.target.value)} required placeholder="Örn: AD, KG" />
                            {errors.short_name && <p className="text-sm text-red-500">{errors.short_name}</p>}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="is_active" 
                                checked={data.is_active} 
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                            />
                            <Label htmlFor="is_active">Birim Aktif (Ürün eklerken seçilebilir)</Label>
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
