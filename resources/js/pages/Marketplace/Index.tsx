import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ShoppingBag, PackageSearch, CircleDollarSign, Link2, TrendingUp, TrendingDown, PackageOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function MarketplaceDashboard({ stats }: any) {
    const { chartData, statusDistribution, topProducts, trends, total_orders, total_revenue, active_accounts, pending_orders } = stats;

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

    return (
        <AppLayout>
            <Head title="Pazaryeri Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-8 bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pazaryeri Raporları</h1>
                        <p className="text-muted-foreground mt-1 text-sm md:text-base">Satış ve sipariş verilerinizi anlık olarak takip edin.</p>
                    </div>
                </div>

                {/* İstatistik Kartları */}
                <div className="grid auto-rows-min gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="group relative overflow-hidden rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-neutral-900 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="absolute -right-6 -top-6 rounded-full bg-blue-100/50 dark:bg-blue-900/20 p-8 transition-transform duration-500 group-hover:scale-110">
                            <ShoppingBag className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Toplam Siparişler</h3>
                        <p className="text-4xl font-black mt-3 text-neutral-800 dark:text-neutral-100">{total_orders}</p>
                        <p className={`text-xs font-medium flex items-center mt-3 ${trends.orders >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {trends.orders >= 0 ? <TrendingUp className="w-3 h-3 mr-1"/> : <TrendingDown className="w-3 h-3 mr-1"/>}
                            {trends.orders >= 0 ? '+' : ''}{trends.orders}% geçen haftaya göre
                        </p>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-neutral-900 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="absolute -right-6 -top-6 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 p-8 transition-transform duration-500 group-hover:scale-110">
                            <CircleDollarSign className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Toplam Ciro</h3>
                        <p className="text-4xl font-black mt-3 text-neutral-800 dark:text-neutral-100">₺{Number(total_revenue).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className={`text-xs font-medium flex items-center mt-3 ${trends.revenue >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {trends.revenue >= 0 ? <TrendingUp className="w-3 h-3 mr-1"/> : <TrendingDown className="w-3 h-3 mr-1"/>}
                            {trends.revenue >= 0 ? '+' : ''}{trends.revenue}% geçen haftaya göre
                        </p>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-neutral-900 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="absolute -right-6 -top-6 rounded-full bg-orange-100/50 dark:bg-orange-900/20 p-8 transition-transform duration-500 group-hover:scale-110">
                            <PackageSearch className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-orange-600/80 uppercase tracking-wider">Bekleyen Siparişler</h3>
                        <p className="text-4xl font-black mt-3 text-orange-600">{pending_orders}</p>
                        <p className="text-xs font-medium text-orange-600/80 flex items-center mt-3">İşlem bekliyor</p>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-neutral-900 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                        <div className="absolute -right-6 -top-6 rounded-full bg-purple-100/50 dark:bg-purple-900/20 p-8 transition-transform duration-500 group-hover:scale-110">
                            <Link2 className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Aktif Bağlantılar</h3>
                        <p className="text-4xl font-black mt-3 text-neutral-800 dark:text-neutral-100">{active_accounts}</p>
                        <p className="text-xs font-medium text-purple-600/80 flex items-center mt-3">Entegrasyon durumu: Aktif</p>
                    </div>
                </div>

                {/* Grafikler Alanı */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
                    {/* Ciro Grafiği */}
                    <div className="lg:col-span-2 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/30 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-500 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">Haftalık Satış Grafiği</h2>
                                <p className="text-sm text-muted-foreground mt-1">Son 7 günlük satış analiziniz</p>
                            </div>
                        </div>
                        
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSatis" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number, name: string) => [
                                            name === 'satis' ? `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value, 
                                            name === 'satis' ? 'Ciro' : 'Sipariş'
                                        ]}
                                        labelFormatter={(label, data) => data?.[0]?.payload?.fullDate || label}
                                    />
                                    <Area type="monotone" dataKey="satis" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSatis)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sipariş Durumları */}
                    <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/30 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-neutral-800 to-neutral-500 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent mb-1">Sipariş Durumları</h2>
                        <p className="text-sm text-muted-foreground mb-6">Tüm zamanların dağılımı</p>
                        
                        <div className="h-[250px] w-full flex items-center justify-center">
                            {statusDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {statusDistribution.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} Sipariş`]} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-muted-foreground">Henüz sipariş verisi yok</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* En Çok Satanlar */}
                <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/30 backdrop-blur-sm p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                            <PackageOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">En Çok Satan Ürünler (Top 5)</h2>
                            <p className="text-sm text-muted-foreground">Adet bazında en yüksek satış yapan ürünleriniz</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] uppercase text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                                <tr>
                                    <th className="pb-3 font-semibold">Ürün Adı / Barkod</th>
                                    <th className="pb-3 font-semibold text-center">Satış Adedi</th>
                                    <th className="pb-3 font-semibold text-right">Elde Edilen Ciro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.length > 0 ? topProducts.map((product: any, index: number) => (
                                    <tr key={index} className="border-b border-neutral-100 dark:border-neutral-800/50 last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20 transition-colors">
                                        <td className="py-4">
                                            <div className="font-medium text-neutral-900 dark:text-neutral-100">{product.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono mt-0.5">{product.barcode}</div>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-bold">
                                                {product.quantity} Adet
                                            </span>
                                        </td>
                                        <td className="py-4 text-right font-bold font-mono">
                                            ₺{Number(product.revenue).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                                            Henüz satış verisi bulunmuyor.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
