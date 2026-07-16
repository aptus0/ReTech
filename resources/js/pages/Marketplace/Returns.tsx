import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Undo2, CheckCircle2 } from 'lucide-react';

export default function MarketplaceReturns({ returns }: any) {
    return (
        <AppLayout>
            <Head title="Pazaryeri İadeleri" />
            
            <div className="flex flex-col gap-4 p-4 lg:p-6 h-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">İade Yönetimi</h1>
                        <p className="text-muted-foreground">Pazaryerlerinden gelen iade taleplerini, iptal edilen siparişleri buradan onaylayın ve takip edin.</p>
                    </div>
                    <Button>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        İadeleri Güncelle
                    </Button>
                </div>
                
                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border bg-card overflow-hidden mt-4">
                    {(!returns?.data || returns.data.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                            <Undo2 className="h-16 w-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-medium text-foreground">İade Talebi Yok</h3>
                            <p className="max-w-sm mt-1">Harika! Şu an için onayınızı bekleyen veya gerçekleşen bir iade/iptal talebi bulunmuyor.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>İade No</TableHead>
                                        <TableHead>Sipariş No</TableHead>
                                        <TableHead>Müşteri</TableHead>
                                        <TableHead>İade Nedeni</TableHead>
                                        <TableHead>Tarih</TableHead>
                                        <TableHead>Durum</TableHead>
                                        <TableHead className="text-right">İşlem</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {returns.data.map((ret: any) => (
                                        <TableRow key={ret.id}>
                                            <TableCell className="font-mono font-medium">{ret.return_id}</TableCell>
                                            <TableCell className="text-muted-foreground">{ret.marketplaceOrder?.external_order_id}</TableCell>
                                            <TableCell>{ret.marketplaceOrder?.customer_name}</TableCell>
                                            <TableCell>{ret.reason || 'Belirtilmedi'}</TableCell>
                                            <TableCell>{new Date(ret.created_at).toLocaleDateString('tr-TR')}</TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">{ret.status || 'İade Edildi'}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Onayla
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
