import { Head, Link, usePage } from '@inertiajs/react';
import { Package, ArrowDownRight, ArrowUpRight, AlertTriangle, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function StockMovementsIndex() {
    const { products, recentMovements, stats } = usePage().props as any;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Depo Yönetimi', href: '/stock-movements' },
    ];

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Depo Yönetimi" />

            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Depo ve Stok Yönetimi</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ürün stoklarınızı profesyonel bir şekilde takip edin.</p>
                    </div>
                    <Button asChild>
                        <Link href="/stock-movements/create" className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Yeni Stok Hareketi
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-t-4 border-t-blue-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Toplam Depo Değeri</CardTitle>
                            <Package className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Sistemdeki tüm ürünlerin satış fiyatı üzerinden değeri</p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-red-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-red-600">Kritik Stok Uyarısı</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.lowStockCount} Ürün</div>
                            <p className="text-xs text-muted-foreground mt-1">Stoğu 10'un altına düşen ürün sayısı</p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-green-500 shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Son Hareketler</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{recentMovements.length} İşlem</div>
                            <p className="text-xs text-muted-foreground mt-1">Yakın zamanda yapılan stok giriş/çıkışları</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Güncel Stok Durumu</CardTitle>
                                <CardDescription>Tüm ürünlerinizin anlık stok seviyeleri</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Ürün Adı</TableHead>
                                                <TableHead>Kategori</TableHead>
                                                <TableHead>Fiyat</TableHead>
                                                <TableHead className="text-right">Mevcut Stok</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.data.map((product: any) => (
                                                <TableRow key={product.id}>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell>{product.category?.name || '-'}</TableCell>
                                                    <TableCell>{formatCurrency(product.sale_price)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge variant={product.current_stock < 10 ? 'destructive' : 'secondary'} className="font-mono text-sm px-2 py-1">
                                                            {product.current_stock}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/stock-movements/create?product_id=${product.id}`}>
                                                                Ekle/Çıkar
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Son Stok Hareketleri</CardTitle>
                                <CardDescription>Depo giriş ve çıkış logları</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentMovements.length > 0 ? (
                                        recentMovements.map((movement: any) => (
                                            <div key={movement.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 dark:bg-gray-800/50">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{movement.product?.name}</span>
                                                    <span className="text-xs text-muted-foreground">{new Date(movement.created_at).toLocaleString('tr-TR')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {movement.type === 'in' ? (
                                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300">
                                                            <ArrowDownRight className="w-3 h-3 mr-1" />
                                                            +{movement.quantity}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300">
                                                            <ArrowUpRight className="w-3 h-3 mr-1" />
                                                            -{movement.quantity}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-sm text-muted-foreground">Henüz stok hareketi yok.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
