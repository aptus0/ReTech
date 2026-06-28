import { Head, Link, useForm, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { MoreVertical, Phone, FileText, CheckCircle, Clock, Banknote } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Index({ transactions, registers, filters }: { transactions: any, registers: any[], filters: any }) {
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [isCollectOpen, setIsCollectOpen] = useState(false);

    const { data: searchData, setData: setSearchData, get } = useForm({
        search: filters?.search || '',
    });

    const { data: collectData, setData: setCollectData, post, processing, errors, reset } = useForm({
        amount: 0,
        register_id: registers.length > 0 ? registers[0].id : '',
        description: ''
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/open-transactions', { preserveState: true });
    };

    const openCollect = (tx: any) => {
        setSelectedTx(tx);
        setCollectData({
            amount: tx.remaining_amount,
            register_id: registers.length > 0 ? registers[0].id : '',
            description: 'Tahsilat'
        });
        setIsCollectOpen(true);
    };

    const submitCollect = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTx) return;

        post(`/open-transactions/${selectedTx.id}/collect`, {
            onSuccess: () => {
                setIsCollectOpen(false);
                reset();
                toast.success('İşlem başarıyla kaydedildi.');
            }
        });
    };

    const getRowStyle = (tx: any) => {
        if (tx.status === 'paid') return 'bg-green-50 dark:bg-green-950/20';
        if (tx.status === 'overdue') return 'bg-red-50 dark:bg-red-950/20';
        const daysToDue = (new Date(tx.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        if (daysToDue <= 0) return 'bg-orange-50 dark:bg-orange-950/20';
        if (daysToDue <= 3) return 'bg-yellow-50 dark:bg-yellow-950/20';
        return '';
    };

    const getStatusBadge = (tx: any) => {
        if (tx.status === 'paid') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ödendi</Badge>;
        if (tx.status === 'overdue') return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Gecikmiş</Badge>;
        if (tx.status === 'partial') return <Badge variant="outline" className="text-blue-600 border-blue-200">Kısmi Ödendi</Badge>;
        const daysToDue = Math.ceil((new Date(tx.due_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        if (daysToDue === 0) return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Bugün</Badge>;
        if (daysToDue > 0 && daysToDue <= 3) return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Yaklaşıyor</Badge>;
        return <Badge variant="secondary">Açık</Badge>;
    };

    return (
        <>
            <Head title="Açık İşlemler" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Açık İşlemler (Tahsilat Takibi)</h1>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-sm border bg-card p-4 shadow-sm">
                    <form onSubmit={handleSearch} className="flex flex-1 items-center gap-4">
                        <Input 
                            placeholder="Müşteri/Cari Adı Ara..." 
                            value={searchData.search} 
                            onChange={e => setSearchData('search', e.target.value)} 
                            className="max-w-md"
                        />
                        <Button type="submit" variant="secondary">Ara</Button>
                    </form>
                </div>

                <div className="rounded-sm border bg-card shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-card-foreground">
                            <thead className="text-[11px] uppercase bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-b">
                                <tr>
                                    <th className="px-4 py-3">CARİ/MÜŞTERİ</th>
                                    <th className="px-4 py-3">TİP</th>
                                    <th className="px-4 py-3">VADE TARİHİ</th>
                                    <th className="px-4 py-3 text-right">TOPLAM</th>
                                    <th className="px-4 py-3 text-right">KALAN</th>
                                    <th className="px-4 py-3 text-center">DURUM</th>
                                    <th className="px-4 py-3 text-right">İŞLEMLER</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.data.map((tx: any) => (
                                    <tr key={tx.id} className={`border-b last:border-0 hover:opacity-80 transition-opacity ${getRowStyle(tx)}`}>
                                        <td className="px-4 py-3 font-medium">
                                            <Link href={`/customers/${tx.account_id}`} className="hover:underline flex items-center">
                                                {tx.account?.name || 'Bilinmiyor'}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            {tx.type === 'receivable' ? 
                                                <span className="text-green-600 font-medium">Alacak</span> : 
                                                <span className="text-red-600 font-medium">Borç</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 font-mono">{new Date(tx.due_date).toLocaleDateString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">₺{Number(tx.amount).toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-right font-bold text-lg">₺{Number(tx.remaining_amount).toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-center">
                                            {getStatusBadge(tx)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {tx.status !== 'paid' && (
                                                        <DropdownMenuItem onClick={() => openCollect(tx)} className="font-medium text-orange-600">
                                                            <Banknote className="w-4 h-4 mr-2" /> Tahsilat / Ödeme
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem>
                                                        <Phone className="w-4 h-4 mr-2" /> Arandı İşaretle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <FileText className="w-4 h-4 mr-2" /> Faturayı Gör
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {transactions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Kayıt bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Tahsilat Drawer */}
            <Sheet open={isCollectOpen} onOpenChange={setIsCollectOpen}>
                <SheetContent side="right">
                    <SheetHeader className="mb-6">
                        <SheetTitle>{selectedTx?.type === 'receivable' ? 'Tahsilat Al' : 'Ödeme Yap'}</SheetTitle>
                    </SheetHeader>
                    <div className="bg-orange-50 text-orange-800 p-4 rounded-md mb-6 border border-orange-100">
                        <div className="text-sm">Cari: <strong>{selectedTx?.account?.name}</strong></div>
                        <div className="text-sm mt-1">Kalan Bakiye: <strong>₺{Number(selectedTx?.remaining_amount || 0).toLocaleString('tr-TR')}</strong></div>
                    </div>
                    <form onSubmit={submitCollect} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tutar *</Label>
                            <Input 
                                type="number" 
                                step="0.01" 
                                value={collectData.amount} 
                                onChange={e => setCollectData('amount', parseFloat(e.target.value))} 
                                required 
                            />
                            <InputError message={errors.amount} />
                        </div>
                        <div className="space-y-2">
                            <Label>Kasa Seçimi *</Label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={collectData.register_id}
                                onChange={e => setCollectData('register_id', e.target.value)}
                                required
                            >
                                <option value="">Seçiniz...</option>
                                {registers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <InputError message={errors.register_id} />
                        </div>
                        <div className="space-y-2">
                            <Label>Açıklama</Label>
                            <Input value={collectData.description} onChange={e => setCollectData('description', e.target.value)} />
                            <InputError message={errors.description} />
                        </div>
                        
                        <div className="pt-6 flex justify-end gap-3 border-t mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCollectOpen(false)}>İptal</Button>
                            <Button type="submit" disabled={processing} className="bg-orange-600 hover:bg-orange-700">Kaydet</Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Açık İşlemler', href: '/open-transactions' }]}>
        {page}
    </AppLayout>
);
