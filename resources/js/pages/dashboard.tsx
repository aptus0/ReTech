import trLocale from '@fullcalendar/core/locales/tr';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CalendarDays, Package, Tags, AlertTriangle, ArrowUpRight, ArrowDownRight, Server, Activity, Cpu } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

export default function Dashboard({ stats, latestMovements, calendarEvents, salesChartData }: { stats: any, latestMovements: any[], calendarEvents: any[], salesChartData: any[] }) {
    const calendarRef = useRef<FullCalendar>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    
    // System Status State
    const [systemStatus, setSystemStatus] = useState({
        cpu: 0, ram: 0, internal_ip: 'Bekleniyor...', external_ip: 'Bekleniyor...'
    });
    
    useEffect(() => {
        const fetchStatus = () => {
            fetch('/api/system-status')
                .then(res => res.json())
                .then(data => setSystemStatus(data))
                .catch(err => console.error("Status fetch error", err));
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    const { data: eventData, setData: setEventData, post, processing, reset } = useForm({
        title: '',
        description: '',
        start: new Date(),
        end: new Date(),
        all_day: true,
        color: '#2563eb' // Default KobiX Blue
    });

    const events = calendarEvents ? calendarEvents.map(ev => ({
        id: String(ev.id),
        title: ev.title,
        start: ev.start,
        end: ev.end,
        allDay: ev.all_day == 1 || ev.all_day == true,
        backgroundColor: ev.color || '#2563eb',
        borderColor: ev.color || '#2563eb',
        extendedProps: {
            description: ev.description
        }
    })) : [];

    const handleDateSelect = (selectInfo: any) => {
        setEventData({
            ...eventData,
            start: selectInfo.start,
            end: selectInfo.end,
            all_day: selectInfo.allDay
        });
        setIsEventModalOpen(true);
        selectInfo.view.calendar.unselect();
    };

    const handleEventSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/calendar-events', {
            onSuccess: () => {
                setIsEventModalOpen(false);
                reset();
                toast.success('Not eklendi');
            }
        });
    };

    const handleEventClick = (clickInfo: any) => {
        if(confirm(`"${clickInfo.event.title}" notunu silmek istediğinize emin misiniz?`)) {
            router.delete(`/calendar-events/${clickInfo.event.id}`, {
                onSuccess: () => toast.success('Not silindi')
            });
        }
    };

    const handleEventDrop = (dropInfo: any) => {
        router.put(`/calendar-events/${dropInfo.event.id}`, {
            start: dropInfo.event.start,
            end: dropInfo.event.end || dropInfo.event.start,
            all_day: dropInfo.event.allDay,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Tarih güncellendi')
        });
    };

    const handleEventResize = (resizeInfo: any) => {
        router.put(`/calendar-events/${resizeInfo.event.id}`, {
            start: resizeInfo.event.start,
            end: resizeInfo.event.end,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Süre güncellendi')
        });
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex-1 space-y-6 p-4 md:p-6 max-w-7xl mx-auto w-full pb-20">
                {/* STAT CARDS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-900/20">
                        <div className="absolute -right-6 -top-6 text-white/10">
                            <Package className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-100">Toplam Ürün</p>
                                <p className="mt-1 text-3xl font-bold tracking-tight">{stats?.totalProducts || 0}</p>
                            </div>
                            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-md">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0A0F1C] border border-blue-100 dark:border-blue-900/30 p-6 shadow-xl shadow-neutral-200/40 dark:shadow-blue-900/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Aktif Ürünler</p>
                                <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{stats?.activeProducts || 0}</p>
                            </div>
                            <div className="rounded-xl bg-green-50 dark:bg-green-500/10 p-3">
                                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0A0F1C] border border-blue-100 dark:border-blue-900/30 p-6 shadow-xl shadow-neutral-200/40 dark:shadow-blue-900/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Toplam Kategori</p>
                                <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{stats?.totalCategories || 0}</p>
                            </div>
                            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 p-3">
                                <Tags className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 p-6 text-white shadow-xl shadow-rose-900/20">
                        <div className="absolute -right-6 -top-6 text-white/10">
                            <AlertTriangle className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-rose-100">Kritik Stok</p>
                                <p className="mt-1 text-3xl font-bold tracking-tight">{stats?.lowStockProductsCount || 0}</p>
                            </div>
                            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-md">
                                <AlertTriangle className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHARTS ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white dark:bg-[#0A0F1C] border border-blue-100 dark:border-blue-900/30 shadow-xl shadow-neutral-200/40 dark:shadow-blue-900/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            Haftalık Satış Grafiği
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" dark={{ stroke: "#1e3a8a" }} />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                    <YAxis stroke="#6b7280" fontSize={12} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-bg-opacity, #fff)' }} 
                                        itemStyle={{ color: '#111827' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Line type="monotone" name="Satış (₺)" dataKey="sales" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0A0F1C] border border-blue-100 dark:border-blue-900/30 shadow-xl shadow-neutral-200/40 dark:shadow-blue-900/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
                            <Package className="h-5 w-5 text-indigo-600" />
                            Sipariş ve Sepet Etkileşimleri
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                                    <YAxis stroke="#6b7280" fontSize={12} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                        itemStyle={{ color: '#111827' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Bar name="Sipariş" dataKey="orders" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                    <Bar name="Sepet" dataKey="carts" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* CALENDAR COLUMN */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#0A0F1C] border border-blue-100 dark:border-blue-900/30 shadow-xl shadow-neutral-200/40 dark:shadow-blue-900/10 rounded-2xl overflow-hidden flex flex-col">
                            <div className="border-b border-neutral-100 dark:border-blue-900/20 px-6 py-4 flex items-center justify-between bg-blue-50/50 dark:bg-blue-900/10">
                                <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-blue-600" />
                                    KobiX Ajanda
                                </h2>
                                <Button size="sm" onClick={() => setIsEventModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 shadow-md shadow-blue-600/20 transition-all">
                                    + Yeni Not
                                </Button>
                            </div>
                            <div className="p-4" style={{ minHeight: '600px' }}>
                                <style dangerouslySetInnerHTML={{__html: `
                                    .fc { font-family: inherit; height: 100%; min-height: 550px; }
                                    .fc .fc-toolbar-title { font-weight: 700; font-size: 1.25rem; color: #1e40af; }
                                    .dark .fc .fc-toolbar-title { color: #60a5fa; }
                                    .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9; }
                                    .dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #1e3a8a; }
                                    .fc-theme-standard .fc-scrollgrid { border-color: #f1f5f9; border-radius: 12px; overflow: hidden; }
                                    .dark .fc-theme-standard .fc-scrollgrid { border-color: #1e3a8a; }
                                    
                                    .fc .fc-button-primary { background-color: #2563eb !important; border-color: #2563eb !important; font-weight: 500; text-transform: capitalize; padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.875rem; transition: all 0.2s; }
                                    .fc .fc-button-primary:hover { background-color: #1d4ed8 !important; border-color: #1d4ed8 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
                                    
                                    .fc .fc-day-today { background-color: #eff6ff !important; }
                                    .dark .fc .fc-day-today { background-color: #1e3a8a !important; }
                                    
                                    .fc-event { cursor: pointer; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 2px 6px; font-weight: 500; font-size: 0.8rem; border: none !important; transition: transform 0.1s ease; }
                                    .fc-event:hover { transform: scale(1.02); z-index: 10; }
                                    .fc-event-main { color: #fff !important; }
                                    
                                    .fc-list-day-cushion { background-color: #f8fafc !important; }
                                    .dark .fc-list-day-cushion { background-color: #0f172a !important; color: white !important;}
                                `}} />
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                                    initialView="dayGridMonth"
                                    locales={[trLocale]}
                                    locale="tr"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,listMonth'
                                    }}
                                    events={events}
                                    selectable={true}
                                    selectMirror={true}
                                    dayMaxEvents={true}
                                    weekends={true}
                                    editable={true}
                                    droppable={true}
                                    select={handleDateSelect}
                                    eventClick={handleEventClick}
                                    eventDrop={handleEventDrop}
                                    eventResize={handleEventResize}
                                    height="100%"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SIDE COLUMN */}
                    <div className="space-y-6">
                        {/* SYSTEM STATUS PANEL */}
                        <div className="bg-white dark:bg-[#0A0F1C] border border-blue-100 dark:border-blue-900/30 shadow-xl shadow-neutral-200/40 dark:shadow-blue-900/10 rounded-2xl overflow-hidden p-6 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Server className="h-24 w-24" />
                            </div>
                            <h3 className="text-sm font-bold tracking-wider text-neutral-400 uppercase mb-4 flex items-center gap-2">
                                <Cpu className="h-4 w-4" /> Sistem Durumu
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs font-semibold text-neutral-500 mb-1 flex justify-between">
                                        <span>CPU Kullanımı</span>
                                        <span className="text-blue-600 dark:text-blue-400">{systemStatus.cpu}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5">
                                        <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${systemStatus.cpu}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-neutral-500 mb-1 flex justify-between">
                                        <span>RAM Tüketimi</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">{systemStatus.ram}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5">
                                        <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${systemStatus.ram}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LATEST MOVEMENTS */}
                        <div className="bg-white dark:bg-[#0A0F1C] border border-blue-100 dark:border-blue-900/30 shadow-xl shadow-neutral-200/40 dark:shadow-blue-900/10 rounded-2xl overflow-hidden">
                            <div className="border-b border-neutral-100 dark:border-blue-900/20 px-6 py-4 flex justify-between items-center bg-blue-50/30 dark:bg-blue-900/10">
                                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Son Stok Hareketleri</h3>
                                <Link href="/stock-movements" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Tümünü Gör</Link>
                            </div>
                            <div className="p-2">
                                {latestMovements && latestMovements.length > 0 ? (
                                    <div className="divide-y divide-neutral-100 dark:divide-blue-900/20">
                                        {latestMovements.map((movement: any) => (
                                            <div key={movement.id} className="p-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${movement.type === 'in' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                                                        {movement.type === 'in' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1">{movement.product?.name || 'Bilinmeyen Ürün'}</p>
                                                        <p className="text-xs text-neutral-500">{new Date(movement.created_at).toLocaleDateString('tr-TR')}</p>
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-bold ${movement.type === 'in' ? 'text-green-600' : 'text-rose-600'}`}>
                                                    {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-neutral-500 text-sm">
                                        Henüz stok hareketi bulunmuyor.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* EVENT MODAL */}
            <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                <DialogContent className="sm:max-w-[425px] border-blue-100 dark:border-blue-900 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-blue-900 dark:text-blue-100">Yeni Takvim Notu</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEventSubmit} className="space-y-5 mt-4">
                        <div className="space-y-2">
                            <Label>Not Başlığı <span className="text-rose-500">*</span></Label>
                            <Input value={eventData.title} onChange={e => setEventData('title', e.target.value)} required placeholder="Örn: Müşteri Görüşmesi" className="h-11 focus-visible:ring-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <Label>Açıklama (Opsiyonel)</Label>
                            <Input value={eventData.description} onChange={e => setEventData('description', e.target.value)} placeholder="Detaylı bilgi..." className="h-11 focus-visible:ring-blue-600" />
                        </div>
                        <div className="space-y-3 pt-2">
                            <Label>Etiket Rengi</Label>
                            <div className="flex gap-3 justify-between">
                                {['#2563eb', '#0891b2', '#16a34a', '#eab308', '#f97316', '#dc2626', '#9333ea'].map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`w-9 h-9 rounded-full shadow-sm transition-all ${eventData.color === color ? 'ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-neutral-900 scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setEventData('color', color)}
                                    />
                                ))}
                            </div>
                        </div>
                        <DialogFooter className="mt-8 gap-2">
                            <Button type="button" variant="ghost" className="h-11 rounded-xl px-6" onClick={() => setIsEventModalOpen(false)}>İptal</Button>
                            <Button type="submit" disabled={processing} className="h-11 rounded-xl px-8 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 text-white">Kaydet</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
        {page}
    </AppLayout>
);
