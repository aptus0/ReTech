import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';

import { Package, CheckCircle, ListTree } from 'lucide-react';

export default function DecisionReports({ 
    todaySales, todayCollections, overdueReceivables, upcomingReceivables,
    totalProducts, activeProducts, lowStockProductsCount, totalCategories
}: any) {
    return (
        <>
            <Head title="Karar Raporları" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Karar Destek Raporları</h1>
                </div>

                <h2 className="text-lg font-medium border-b pb-2">Finansal Özet</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Bugünkü Ciro (Satışlar)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700">₺{Number(todaySales || 0).toLocaleString('tr-TR')}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Bugünkü Tahsilat (Kasa Girişi)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700">₺{Number(todayCollections || 0).toLocaleString('tr-TR')}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Vadesi Geçmiş Alacaklar</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700">₺{Number(overdueReceivables || 0).toLocaleString('tr-TR')}</div>
                            <p className="text-xs text-muted-foreground mt-1">Acil tahsil edilmesi gereken tutar.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Yaklaşan Tahsilatlar (7 Gün)</CardTitle>
                            <Clock className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-700">₺{Number(upcomingReceivables || 0).toLocaleString('tr-TR')}</div>
                            <p className="text-xs text-muted-foreground mt-1">Önümüzdeki hafta beklenen nakit akışı.</p>
                        </CardContent>
                    </Card>
                </div>

                <h2 className="text-lg font-medium border-b pb-2 mt-4">Stok & Envanter Özeti</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Ürün</CardTitle>
                            <Package className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalProducts || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Ürünler</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-700">{activeProducts || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Düşük Stok</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700">{lowStockProductsCount || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Kategori</CardTitle>
                            <ListTree className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700">{totalCategories || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex-1 bg-card rounded-md border shadow-sm flex items-center justify-center p-8 mt-4">
                    <div className="text-center">
                        <h2 className="text-xl font-medium mb-2">Detaylı Raporlama Sistemi Hazırlanıyor</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">Alacak yaşlandırma raporları, stok tükenme öngörüleri ve karlılık analizleri yakında bu sayfada detaylandırılacaktır.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

DecisionReports.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Karar Raporları', href: '/decision-reports' }]}>
        {page}
    </AppLayout>
);
