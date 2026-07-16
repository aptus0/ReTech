import { Head, Link, useForm, router } from '@inertiajs/react';
import { ChevronDown, Plus, Trash2, Printer, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type {BreadcrumbItem} from '@/types';

export default function Index({ products, filters, categories, brands, units }: { products: any, filters: any, categories: any[], brands: any[], units: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Stok Yönetimi', href: '/products' },
    ];

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const { data: searchData, setData: setSearchData, get } = useForm({
        search: filters?.search || '',
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
        if (!confirm('Seçili ürünleri silmek istediğinize emin misiniz?')) {
            return;
        }
        
        router.delete('/products/bulk-delete', {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                toast.success('Seçili ürünler silindi.');
            }
        });
    };

    const handleBulkBarcode = () => {
        if (selectedIds.length === 0) {
            return;
        }

        router.get('/products/barcode-print', { ids: selectedIds.join(',') });
    };

    return (
        <>
            <Head title="Stok Kartları" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Stok Kartları</h1>
                    
                    <Link href="/products/create">
                        <Button className="font-bold uppercase tracking-wider text-xs bg-orange-600 hover:bg-orange-700">
                            <Plus className="w-4 h-4 mr-2" /> Yeni Ürün Ekle
                        </Button>
                    </Link>
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
                                <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                    if(confirm('Seçili ürünleri Trendyol\'a göndermek istediğinize emin misiniz?')) {
                                        router.post('/marketplace/products/push-new', { ids: selectedIds }, {
                                            onSuccess: () => {
                                                setSelectedIds([]);
                                                toast.success('İşlem başlatıldı.');
                                            }
                                        });
                                    }
                                }}>
                                    <Printer className="w-4 h-4 mr-2" /> Trendyol'a Gönder (Yeni Ürün)
                                </DropdownMenuItem>
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
                                                    <img 
                                                        src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`} 
                                                        className="w-full h-full object-cover" 
                                                        alt={product.name} 
                                                    />
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
