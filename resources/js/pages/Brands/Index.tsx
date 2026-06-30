import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Trash2, Plus, MoreVertical, Image as ImageIcon, Search } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

export default function Index({ brands, filters }: { brands: any, filters: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<any>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: searchData, setData: setSearchData, get } = useForm({
        search: filters?.search || '',
    });

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        description: '',
        is_active: true,
        image: null as File | null,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/brands', { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingBrand(null);
        setImagePreview(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (brand: any) => {
        setEditingBrand(brand);
        setImagePreview(brand.image ? `/storage/${brand.image}` : null);
        setData({
            name: brand.name,
            description: brand.description || '',
            is_active: brand.is_active,
            image: null
        });
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingBrand) {
            router.post(`/brands/${editingBrand.id}`, {
                _method: 'put',
                ...data,
            }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Marka güncellendi.');
                }
            });
        } else {
            post('/brands', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Marka oluşturuldu.');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Bu markayı silmek istediğinize emin misiniz?')) {
            router.delete(`/brands/${id}`, {
                onSuccess: () => toast.success('Marka silindi.')
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Markalar', href: '/brands' }]}>
            <Head title="Markalar" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Marka Yönetimi</h1>
                    <Button onClick={openCreateModal} className="bg-orange-600 hover:bg-orange-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Yeni Marka Ekle
                    </Button>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-sm border bg-card p-4 shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-1 items-center gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Marka Ara..." 
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
                                    <th className="px-6 py-4 w-20">GÖRSEL</th>
                                    <th className="px-6 py-4">MARKA ADI</th>
                                    <th className="px-6 py-4">AÇIKLAMA</th>
                                    <th className="px-6 py-4 text-center">DURUM</th>
                                    <th className="px-6 py-4 text-right">İŞLEMLER</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brands?.data?.map((brand: any) => (
                                    <tr key={brand.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="w-10 h-10 rounded-md bg-neutral-100 border overflow-hidden flex items-center justify-center">
                                                {brand.image ? (
                                                    <img src={`/storage/${brand.image}`} className="w-full h-full object-cover" alt={brand.name} />
                                                ) : (
                                                    <ImageIcon className="w-4 h-4 text-neutral-400" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-semibold">{brand.name}</td>
                                        <td className="px-6 py-3 text-muted-foreground">{brand.description || '-'}</td>
                                        <td className="px-6 py-3 text-center">
                                            {brand.is_active ? 
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Aktif</span> : 
                                                <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-bold">Pasif</span>
                                            }
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" onClick={() => openEditModal(brand)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(brand.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!brands?.data || brands.data.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Gösterilecek marka bulunamadı.</td>
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
                        <DialogTitle>{editingBrand ? 'Markayı Düzenle' : 'Yeni Marka Ekle'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="flex justify-center mb-6">
                            <div 
                                className="w-32 h-32 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-orange-500 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-medium">Değiştir</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-neutral-400">
                                        <ImageIcon className="w-8 h-8 mb-2" />
                                        <span className="text-xs">Görsel Seç</span>
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

                        <div className="space-y-2">
                            <Label>Marka Adı *</Label>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Açıklama</Label>
                            <Input value={data.description} onChange={e => setData('description', e.target.value)} />
                            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="is_active" 
                                checked={data.is_active} 
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                            />
                            <Label htmlFor="is_active">Marka Aktif (Ürün eklerken seçilebilir)</Label>
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
