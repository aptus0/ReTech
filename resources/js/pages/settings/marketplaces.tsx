import { Head } from '@inertiajs/react';
import { Store, Plus, KeyRound, CheckCircle2, XCircle, Settings, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MarketplacesSettings() {
    // This is a UI mockup for Sprint 15. The actual CRUD will be wired in future sprints.
    const mockAccounts = [
        {
            id: 1,
            marketplace: 'Trendyol',
            store_name: 'Karacabey Gross Market',
            status: 'active',
            last_sync: '10 dakika önce'
        },
        {
            id: 2,
            marketplace: 'Hepsiburada',
            store_name: 'Erler AVM',
            status: 'error',
            last_sync: '2 gün önce'
        }
    ];

    return (
        <>
            <Head title="Pazaryeri Bağlantıları" />

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Pazaryeri Bağlantıları</h3>
                    <p className="text-sm text-muted-foreground">
                        Trendyol, Hepsiburada ve N11 mağazalarınızın API anahtarlarını yönetin ve bağlantılarını test edin.
                    </p>
                </div>

                <Card className="relative overflow-hidden">
                    {/* YAKINDA GELECEK GÖLGELENDİRMESİ */}
                    <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/60 dark:bg-black/60 flex flex-col items-center justify-center p-6 text-center">
                        <div className="bg-white dark:bg-neutral-900 border border-orange-200 dark:border-orange-900/50 p-8 rounded-2xl shadow-xl max-w-md transform transition-all">
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Store className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">PazaryeriOS Yakında!</h2>
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Tüm Trendyol, Hepsiburada ve N11 entegrasyonları, sipariş yönetimi ve stok senkronizasyonu özellikleri <strong>bir sonraki büyük güncelleme paketiyle</strong> (Sprint 16) aktif olacaktır.
                            </p>
                        </div>
                    </div>

                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4 opacity-50 select-none pointer-events-none">
                        <div>
                            <CardTitle>Bağlı Mağazalar</CardTitle>
                            <CardDescription>Sisteme entegre edilmiş tüm pazaryeri hesaplarınız.</CardDescription>
                        </div>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Mağaza Ekle
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4 opacity-50 select-none pointer-events-none">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pazaryeri</TableHead>
                                    <TableHead>Mağaza Adı</TableHead>
                                    <TableHead>Bağlantı Durumu</TableHead>
                                    <TableHead>Son Senkronizasyon</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockAccounts.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Store className="w-4 h-4 text-neutral-500" />
                                            {account.marketplace}
                                        </TableCell>
                                        <TableCell>{account.store_name}</TableCell>
                                        <TableCell>
                                            {account.status === 'active' ? (
                                                <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md w-fit text-xs font-semibold">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Başarılı
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-md w-fit text-xs font-semibold">
                                                    <XCircle className="w-3 h-3 mr-1" /> API Hatası
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-neutral-500 text-sm">
                                            {account.last_sync}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="icon" title="Bağlantıyı Test Et">
                                                <RefreshCcw className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" title="API Bilgileri">
                                                <KeyRound className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" title="Mağaza Ayarları">
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

MarketplacesSettings.layout = {
    breadcrumbs: [
        {
            title: 'Pazaryeri Bağlantıları',
            href: '/settings/marketplaces',
        },
    ],
};
