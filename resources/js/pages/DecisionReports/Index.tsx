import { Head } from '@inertiajs/react';
import { 
    TrendingUp, TrendingDown, Clock, AlertCircle, Package, 
    CheckCircle, ListTree, Banknote, LineChart as LineChartIcon,
    ArrowUpRight, ArrowDownRight, Wallet, ShoppingBag
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

export default function DecisionReports({ metrics }: any) {
    const { profitability, cashFlow, inventory, topSellers, trendData } = metrics;

    const formatCurrency = (val: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('tr-TR').format(val);

    return (
        <>
            <Head title="Karar Raporları" />
            <div className="flex h-full flex-1 flex-col gap-8 p-4 max-w-7xl mx-auto w-full pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Karar Destek Raporları</h1>
                        <p className="text-neutral-500 mt-1">İşletmenizin finansal durumunu, kârlılığını ve stok potansiyelini analiz edin.</p>
                    </div>
                </div>

                {/* 1. KÂRLILIK VE FİNANSAL PERFORMANS */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
                        <LineChartIcon className="h-5 w-5 text-orange-500" />
                        Kârlılık ve Finansal Performans (Son 30 Gün)
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-100">Toplam Ciro (Satışlar)</CardTitle>
                                <Banknote className="h-5 w-5 text-orange-100" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{formatCurrency(profitability.monthlySales)}</div>
                                <p className="text-xs text-orange-100 mt-2 opacity-80">Son 30 gün içinde kesilen faturalar</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Satış Maliyeti (COGS)</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">{formatCurrency(profitability.monthlyCogs)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Satılan ürünlerin alış maliyeti</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Brüt Kâr</CardTitle>
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(profitability.grossProfit)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Ciro eksi satılan malın maliyeti</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Ortalama Kâr Marjı</CardTitle>
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">%{profitability.profitMargin}</div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 mt-3">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(profitability.profitMargin, 100)}%` }}></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 2. STOK VE ENVANTER ANALİZİ */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-2 mt-4">
                        <Package className="h-5 w-5 text-indigo-500" />
                        Stok ve Envanter Değerlemesi
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Depoya Bağlı Sermaye (Maliyet)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{formatCurrency(inventory.inventoryCapital)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Depodaki tüm malların alış fiyatı toplamı</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Beklenen Ciro (Satış Değeri)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(inventory.expectedRevenue)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Tüm mallar mevcut fiyattan satılırsa</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-green-800 dark:text-green-500">Potansiyel Gelecek Kârı</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(inventory.potentialProfit)}</div>
                                <p className="text-xs text-green-600/80 dark:text-green-500/80 mt-1">Depo tamamen eritilirse elde edilecek kâr</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 3. TRENDLER VE NAKİT AKIŞI */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="col-span-1 lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Satış ve Tahsilat Trendi (Son 7 Gün)
                        </h2>
                        <Card className="shadow-sm">
                            <CardContent className="p-6 h-[380px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSatis" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorTahsilat" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `₺${value/1000}k`} />
                                        <Tooltip 
                                            formatter={(value: number) => formatCurrency(value)}
                                            labelFormatter={(label: string, payload: any) => payload[0]?.payload?.fullDate || label}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Area type="monotone" dataKey="satis" name="Faturalı Satışlar" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorSatis)" />
                                        <Area type="monotone" dataKey="tahsilat" name="Kasa Tahsilatları" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorTahsilat)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="col-span-1 space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-2">
                            <Wallet className="h-5 w-5 text-teal-500" />
                            Kısa Vadeli Nakit Durumu
                        </h2>
                        
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                                        <span>Bugünkü Ciro</span>
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Bugün</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold">{formatCurrency(cashFlow.todaySales)}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                                        <span>Bugünkü Tahsilat (Kasa)</span>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Bugün</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold text-blue-600">{formatCurrency(cashFlow.todayCollections)}</div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50">
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-xs font-medium text-red-800 dark:text-red-400">Gecikmiş Alacak</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="text-lg font-bold text-red-700">{formatCurrency(cashFlow.overdueReceivables)}</div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/50">
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-xs font-medium text-orange-800 dark:text-orange-400">Bekleyen Tahsilat (30G)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="text-lg font-bold text-orange-700">{formatCurrency(cashFlow.upcomingReceivables)}</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. EN ÇOK SATANLAR */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2 border-b pb-2 mt-4">
                        <ShoppingBag className="h-5 w-5 text-purple-500" />
                        En Çok Satan Ürünler (Son 30 Gün)
                    </h2>
                    
                    <Card className="overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900 border-b">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">Ürün Adı / Barkod</th>
                                        <th scope="col" className="px-6 py-4 text-center">Satış Adedi</th>
                                        <th scope="col" className="px-6 py-4 text-right">Elde Edilen Ciro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topSellers.length > 0 ? (
                                        topSellers.map((product: any, index: number) => (
                                            <tr key={index} className="bg-white dark:bg-neutral-950 border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                                                <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-xs">
                                                            #{index + 1}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">{product.name}</div>
                                                            <div className="text-xs text-neutral-500">{product.barcode}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md font-semibold">
                                                        {formatNumber(product.total_quantity)} Adet
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-green-600">
                                                    {formatCurrency(product.total_revenue)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                                                Son 30 güne ait satış verisi bulunamadı.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                
            </div>
        </>
    );
}

DecisionReports.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Karar Destek Raporları', href: '/decision-reports' }]}>
        {page}
    </AppLayout>
);
