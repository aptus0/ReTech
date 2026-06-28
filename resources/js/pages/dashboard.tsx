import { Head, Link, useForm, router } from '@inertiajs/react';
import { Package, CheckCircle, AlertTriangle, ListTree, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import type {BreadcrumbItem} from '@/types';
// @ts-ignore
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { tr } from 'date-fns/locale/tr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';
import InputError from '@/components/input-error';

const locales = {
  'tr': tr,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

export default function Dashboard({ stats, latestMovements, calendarEvents }: { stats: any, latestMovements: any[], calendarEvents: any[] }) {
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    
    const { data: eventData, setData: setEventData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        start: new Date(),
        end: new Date(),
        all_day: true,
        color: '#ea580c'
    });

    const handleSelectSlot = (slotInfo: any) => {
        setEventData({
            ...eventData,
            start: slotInfo.start,
            end: slotInfo.end || slotInfo.start,
        });
        setIsEventModalOpen(true);
    };

    const handleEventSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/calendar-events', {
            onSuccess: () => {
                setIsEventModalOpen(false);
                reset();
            }
        });
    };

    const handleSelectEvent = (event: any) => {
        if(confirm(`"${event.title}" notunu silmek istediğinize emin misiniz?`)) {
            router.delete(`/calendar-events/${event.id}`);
        }
    };

    // Format DB events for react-big-calendar
    const events = calendarEvents ? calendarEvents.map(ev => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
    })) : [];

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, show: true });
    };

    const closeContextMenu = () => {
        if (contextMenu.show) setContextMenu({ ...contextMenu, show: false });
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-[calc(100vh-140px)] flex-1 flex-col gap-6 p-4" onClick={closeContextMenu}>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-card shadow-lg flex-1 flex flex-col overflow-hidden relative">
                    <div className="bg-neutral-100 dark:bg-neutral-900 border-b p-3 flex justify-between items-center">
                        <h2 className="font-semibold text-lg flex items-center">
                            <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            ERP Ajanda & Takvim
                        </h2>
                        <Button variant="outline" size="sm" onClick={() => setIsEventModalOpen(true)}>Yeni Not Ekle</Button>
                    </div>
                    <div className="flex-1 p-4" onContextMenu={handleContextMenu}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            culture="tr"
                            messages={{
                                next: "İleri",
                                previous: "Geri",
                                today: "Bugün",
                                month: "Ay",
                                week: "Hafta",
                                day: "Gün",
                                agenda: "Ajanda"
                            }}
                            selectable
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleSelectEvent}
                            style={{ height: '100%' }}
                            className="bg-white dark:bg-black rounded-sm border-neutral-200 dark:border-neutral-800 rbc-custom-theme"
                            eventPropGetter={(event: any) => ({
                                style: {
                                    backgroundColor: event.color || '#ea580c',
                                    borderRadius: '4px',
                                    opacity: 0.9,
                                    color: 'white',
                                    border: '0px',
                                    display: 'block',
                                    padding: '2px 5px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }
                            })}
                        />
                    </div>
                    
                    {contextMenu.show && (
                        <div 
                            className="fixed z-50 min-w-[200px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-md overflow-hidden py-1"
                            style={{ top: contextMenu.y, left: contextMenu.x }}
                        >
                            <button className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium" onClick={() => { setIsEventModalOpen(true); setContextMenu({ ...contextMenu, show: false }); }}>
                                ➕ Yeni Not Ekle
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium" onClick={() => { router.get('/dashboard'); setContextMenu({ ...contextMenu, show: false }); }}>
                                📅 Bugüne Git
                            </button>
                            <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1"></div>
                            <button className="w-full text-left px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium text-red-600" onClick={() => setContextMenu({ ...contextMenu, show: false })}>
                                ❌ İptal
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yeni Takvim Notu Ekle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEventSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Not Başlığı *</Label>
                            <Input value={eventData.title} onChange={e => setEventData('title', e.target.value)} required placeholder="Örn: Kira Ödemesi, Müşteri Görüşmesi" />
                            <InputError message={errors.title} />
                        </div>
                        <div className="space-y-2">
                            <Label>Açıklama</Label>
                            <Input value={eventData.description} onChange={e => setEventData('description', e.target.value)} />
                            <InputError message={errors.description} />
                        </div>
                        <div className="space-y-2">
                            <Label>Renk</Label>
                            <div className="flex gap-2">
                                {['#ea580c', '#16a34a', '#2563eb', '#dc2626', '#9333ea'].map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`w-8 h-8 rounded-full border-2 ${eventData.color === color ? 'border-neutral-900 dark:border-white scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setEventData('color', color)}
                                    />
                                ))}
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsEventModalOpen(false)}>İptal</Button>
                            <Button type="submit" disabled={processing} className="bg-orange-600 hover:bg-orange-700">Kaydet</Button>
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
