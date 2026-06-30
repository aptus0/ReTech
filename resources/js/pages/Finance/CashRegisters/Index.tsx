import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type {BreadcrumbItem} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kasalar',
        href: '/cash-registers',
    },
];

export default function Index({ registers }: { registers: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kasalar" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Kasalar</h2>
                    <Button asChild>
                        <Link href="/cash-registers/create">Yeni Kasa Ekle</Link>
                    </Button>
                </div>

                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kasa Kodu</TableHead>
                                <TableHead>Kasa Adı</TableHead>
                                <TableHead className="text-right">Açılış Bakiyesi</TableHead>
                                <TableHead className="text-right">Mevcut Bakiye</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registers.map((register) => (
                                <TableRow key={register.id}>
                                    <TableCell>{register.code}</TableCell>
                                    <TableCell className="font-medium">{register.name}</TableCell>
                                    <TableCell className="text-right">{parseFloat(register.opening_balance).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</TableCell>
                                    <TableCell className="text-right font-bold text-orange-600">{parseFloat(register.current_balance).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</TableCell>
                                    <TableCell>{register.is_active ? 'Aktif' : 'Pasif'}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/cash-registers/${register.id}/edit`} className="text-sm text-blue-600 hover:underline">Düzenle</Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {registers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">Henüz kasa eklenmemiş.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
