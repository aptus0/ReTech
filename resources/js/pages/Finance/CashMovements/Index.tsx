import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';

interface Props {
    movements: any;
    registers: any[];
    accounts: any[];
    paymentMethods: any[];
}

const movementTypes = [
    { value: 'income', label: 'Gelir' },
    { value: 'expense', label: 'Gider' },
    { value: 'collection', label: 'Tahsilat' },
    { value: 'payment', label: 'Ödeme' },
];

export default function Index({ movements, registers, accounts, paymentMethods }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        cash_register_id: '',
        type: '',
        amount: '',
        description: '',
        payment_method_id: '',
        account_id: '',
        movement_date: new Date().toISOString().split('T')[0],
    });

    const formatCurrency = (amount: number) => {
        return parseFloat(amount.toString()).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';
    };

    const isIncome = (type: string) =>
        type === 'income' || type === 'collection' || type === 'sale';

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cash-movements', {
            onSuccess: () => {
                toast.success('Kasa hareketi başarıyla oluşturuldu.');
                setCreateOpen(false);
                reset();
                router.reload();
            },
            onError: () => {
                toast.error('Bir hata oluştu. Lütfen alanları kontrol edin.');
            },
        });
    };

    const openDeleteDialog = (id: number) => {
        setDeletingId(id);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!deletingId) return;
        router.delete(`/cash-movements/${deletingId}`, {
            onSuccess: () => {
                toast.success('Kasa hareketi başarıyla silindi.');
                setDeleteOpen(false);
                setDeletingId(null);
            },
            onError: () => {
                toast.error('Silme işlemi sırasında bir hata oluştu.');
                setDeleteOpen(false);
                setDeletingId(null);
            },
        });
    };

    return (
        <>
            <Head title="Kasa Hareketleri" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Kasa Hareketleri</h1>
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="font-bold uppercase tracking-wider text-xs bg-orange-600 hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Kasa İşlemi
                    </Button>
                </div>

                <div className="rounded-sm border bg-card shadow-sm overflow-hidden mt-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-card-foreground">
                            <thead className="text-[11px] uppercase bg-neutral-50 dark:bg-neutral-900/50 text-neutral-500 border-b">
                                <tr>
                                    <th className="px-4 py-3">TARİH</th>
                                    <th className="px-4 py-3">İŞLEM / BELGE</th>
                                    <th className="px-4 py-3">TÜR</th>
                                    <th className="px-4 py-3">KASA / CARİ</th>
                                    <th className="px-4 py-3 text-right">TUTAR</th>
                                    <th className="px-4 py-3 text-right w-[60px]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.data.length > 0 ? movements.data.map((movement: any) => (
                                    <tr key={movement.id} className="border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {new Date(movement.movement_date).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{movement.description || '-'}</div>
                                            <div className="text-[10px] text-muted-foreground">{movement.payment_method?.name || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isIncome(movement.type) ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-sm px-2">
                                                    <ArrowDownRight className="w-3 h-3 mr-1" /> GİRİŞ
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-sm px-2">
                                                    <ArrowUpRight className="w-3 h-3 mr-1" /> ÇIKIŞ
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{movement.register?.name || '-'}</div>
                                            <div className="text-xs text-muted-foreground">{movement.account?.name || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            <span className={isIncome(movement.type) ? 'text-green-600' : 'text-red-600'}>
                                                {isIncome(movement.type) ? '+' : '-'} {formatCurrency(movement.amount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => openDeleteDialog(movement.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Kayıt bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-muted-foreground">
                            Toplam <span className="font-medium">{movements.total}</span> kayıt
                        </div>
                        <div className="flex gap-1">
                            {movements.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded-sm text-sm ${link.active ? 'bg-orange-600 text-white' : 'bg-muted hover:bg-muted/80'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Create Movement Modal ── */}
            <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) reset(); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Yeni Kasa İşlemi</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Kasa */}
                            <div className="space-y-1.5">
                                <Label htmlFor="cash_register_id">Kasa</Label>
                                <Select
                                    value={data.cash_register_id}
                                    onValueChange={(val) => setData('cash_register_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kasa seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {registers.map((r: any) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.cash_register_id && (
                                    <p className="text-xs text-red-500">{errors.cash_register_id}</p>
                                )}
                            </div>

                            {/* İşlem Türü */}
                            <div className="space-y-1.5">
                                <Label htmlFor="type">İşlem Türü</Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(val) => setData('type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tür seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {movementTypes.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-xs text-red-500">{errors.type}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Tutar */}
                            <div className="space-y-1.5">
                                <Label htmlFor="amount">Tutar</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                />
                                {errors.amount && (
                                    <p className="text-xs text-red-500">{errors.amount}</p>
                                )}
                            </div>

                            {/* Ödeme Yöntemi */}
                            <div className="space-y-1.5">
                                <Label htmlFor="payment_method_id">Ödeme Yöntemi</Label>
                                <Select
                                    value={data.payment_method_id}
                                    onValueChange={(val) => setData('payment_method_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Yöntem seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentMethods.map((pm: any) => (
                                            <SelectItem key={pm.id} value={String(pm.id)}>
                                                {pm.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.payment_method_id && (
                                    <p className="text-xs text-red-500">{errors.payment_method_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Açıklama */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description">Açıklama</Label>
                            <Input
                                id="description"
                                placeholder="İşlem açıklaması"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && (
                                <p className="text-xs text-red-500">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Cari */}
                            <div className="space-y-1.5">
                                <Label htmlFor="account_id">Cari (Opsiyonel)</Label>
                                <Select
                                    value={data.account_id}
                                    onValueChange={(val) => setData('account_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Cari seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map((a: any) => (
                                            <SelectItem key={a.id} value={String(a.id)}>
                                                {a.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.account_id && (
                                    <p className="text-xs text-red-500">{errors.account_id}</p>
                                )}
                            </div>

                            {/* Tarih */}
                            <div className="space-y-1.5">
                                <Label htmlFor="movement_date">Tarih</Label>
                                <Input
                                    id="movement_date"
                                    type="date"
                                    value={data.movement_date}
                                    onChange={(e) => setData('movement_date', e.target.value)}
                                />
                                {errors.movement_date && (
                                    <p className="text-xs text-red-500">{errors.movement_date}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setCreateOpen(false); reset(); }}
                            >
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                {processing ? 'Kaydediliyor...' : 'Kaydet'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation Modal ── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>İşlemi Sil</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Bu kasa hareketini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </p>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => { setDeleteOpen(false); setDeletingId(null); }}
                        >
                            İptal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Kasa Hareketleri', href: '/cash-movements' }]}>
        {page}
    </AppLayout>
);
