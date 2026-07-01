import trLocale from '@fullcalendar/core/locales/tr';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

export default function Dashboard({ stats, latestMovements, calendarEvents }: { stats: any, latestMovements: any[], calendarEvents: any[] }) {
    const calendarRef = useRef<FullCalendar>(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    
    // System Status State
    const [systemStatus, setSystemStatus] = useState({
        cpu: 0, ram: 0, internal_ip: 'Bekleniyor...', external_ip: 'Bekleniyor...'
    });
    
    useEffect(() => {
        const fetchStatus = () => {
            fetch('/api/mobile/system/status')
                .then(res => res.json())
                .then(data => setSystemStatus(data))
                .catch(err => console.error("Status fetch error", err));
        };
        fetchStatus(); // initial call
        const interval = setInterval(fetchStatus, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
        const fetchStatus = () => {
            fetch('/api/mobile/system/status')
                .then(res => res.json())
                .then(data => setSystemStatus(data))
                .catch(err => console.error("Status fetch error", err));
        };
        fetchStatus(); // initial call
        const interval = setInterval(fetchStatus, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, []);

    const { data: eventData, setData: setEventData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        start: new Date(),
        end: new Date(),
        all_day: true,
        color: '#ea580c'
    });

    // FullCalendar Events
    const events = calendarEvents ? calendarEvents.map(ev => ({
        id: String(ev.id),
        title: ev.title,
        start: ev.start,
        end: ev.end,
        allDay: ev.all_day == 1 || ev.all_day == true,
        backgroundColor: ev.color || '#ea580c',
        borderColor: ev.color || '#ea580c',
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
        selectInfo.view.calendar.unselect(); // clear date selection
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

    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.pageX, y: e.pageY, show: true });
    };

    const closeContextMenu = () => {
        if (contextMenu.show) {
            setContextMenu({ ...contextMenu, show: false });
        }
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-[calc(100vh-64px)] flex-1 flex-col p-4 md:p-6 gap-6" onClick={closeContextMenu}>
                {/* LIVE SYSTEM STATUS PANEL */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                        <div className="text-sm font-semibold text-neutral-500 mb-1 flex justify-between">
                            <span>CPU Kullanımı</span>
                            <span className="text-orange-600">{systemStatus.cpu}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2.5">
                            <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${systemStatus.cpu}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                        <div className="text-sm font-semibold text-neutral-500 mb-1 flex justify-between">
                            <span>RAM Tüketimi</span>
                            <span className="text-blue-600">{systemStatus.ram}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2.5">
                            <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${systemStatus.ram}%` }}></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-lg text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-neutral-500">İç Ağ IP (LAN)</div>
                            <div className="font-mono text-sm font-medium">{systemStatus.internal_ip}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-lg text-purple-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-neutral-500">Dış IP (WAN)</div>
                            <div className="font-mono text-sm font-medium">{systemStatus.external_ip}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-950 shadow-lg flex-1 flex flex-col overflow-hidden relative border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4 flex justify-between items-center z-10">
                        <h2 className="font-bold text-xl flex items-center text-neutral-800 dark:text-neutral-100">
                            <svg className="w-6 h-6 mr-2 text-orange-600 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            ReTech Profesyonel Ajanda
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                className="bg-white dark:bg-neutral-800"
                                onClick={() => {
                                    if(calendarRef.current) {
                                        calendarRef.current.getApi().today();
                                    }
                                }}
                            >
                                Bugüne Dön
                            </Button>
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20" onClick={() => setIsEventModalOpen(true)}>
                                ➕ Yeni Not Ekle
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-2 md:p-4 lg:p-6 overflow-y-auto custom-scrollbar" onContextMenu={handleContextMenu}>
                        <style dangerouslySetInnerHTML={{__html: `
                            .fc { font-family: inherit; height: 100%; min-height: 700px; }
                            .fc .fc-toolbar-title { font-weight: 700; font-size: 1.5rem; color: #1f2937; }
                            .dark .fc .fc-toolbar-title { color: #f3f4f6; }
                            .fc-theme-standard td, .fc-theme-standard th { border-color: #e5e7eb; }
                            .dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #374151; }
                            .fc-theme-standard .fc-scrollgrid { border-color: #e5e7eb; border-radius: 8px; overflow: hidden; }
                            .dark .fc-theme-standard .fc-scrollgrid { border-color: #374151; }
                            
                            /* Header Buttons */
                            .fc .fc-button-primary { background-color: #ea580c !important; border-color: #ea580c !important; font-weight: 600; text-transform: capitalize; padding: 0.4rem 1rem; border-radius: 6px; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
                            .fc .fc-button-primary:hover { background-color: #c2410c !important; border-color: #c2410c !important; }
                            .fc .fc-button-primary:disabled { background-color: #fdba74 !important; border-color: #fdba74 !important; }
                            .fc .fc-button-active { background-color: #9a3412 !important; border-color: #9a3412 !important; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.1) !important; }
                            
                            /* Today Highlight */
                            .fc .fc-day-today { background-color: #fff7ed !important; }
                            .dark .fc .fc-day-today { background-color: #431407 !important; }
                            
                            /* Events */
                            .fc-event { cursor: pointer; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 2px 4px; font-weight: 500; font-size: 0.85rem; border: none !important; transition: transform 0.1s ease, box-shadow 0.1s ease; }
                            .fc-event:hover { transform: scale(1.02); box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10; }
                            .fc-event-main { color: #fff !important; }
                            
                            /* List View */
                            .fc-list-event:hover td { background-color: #f9fafb; }
                            .dark .fc-list-event:hover td { background-color: #1f2937; }
                            .fc-list-day-cushion { background-color: #f3f4f6 !important; }
                            .dark .fc-list-day-cushion { background-color: #111827 !important; color: white !important;}
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
                                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                            }}
                            events={events}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            weekends={true}
                            editable={true} // enables drag and drop
                            droppable={true}
                            select={handleDateSelect}
                            eventClick={handleEventClick}
                            eventDrop={handleEventDrop}
                            eventResize={handleEventResize}
                            height="100%"
                            contentHeight="auto"
                            aspectRatio={1.5}
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                meridiem: false,
                                hour12: false
                            }}
                        />
                    </div>
                    
                    {contextMenu.show && (
                        <div 
                            className="fixed z-50 min-w-[200px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-lg overflow-hidden py-1 transform scale-100 transition-all"
                            style={{ top: contextMenu.y, left: contextMenu.x }}
                        >
                            <button className="w-full text-left px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors" onClick={() => {
                                setIsEventModalOpen(true); setContextMenu({ ...contextMenu, show: false }); 
                            }}>
                                ➕ Yeni Not Ekle
                            </button>
                            <button className="w-full text-left px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors" onClick={() => {
                                if(calendarRef.current) {
calendarRef.current.getApi().today();
}

                                setContextMenu({ ...contextMenu, show: false }); 
                            }}>
                                📅 Bugüne Git
                            </button>
                            <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1"></div>
                            <button className="w-full text-left px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium text-red-600 transition-colors" onClick={() => setContextMenu({ ...contextMenu, show: false })}>
                                ❌ İptal
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Yeni Takvim Notu</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEventSubmit} className="space-y-5 mt-4">
                        <div className="space-y-2">
                            <Label>Not Başlığı <span className="text-red-500">*</span></Label>
                            <Input value={eventData.title} onChange={e => setEventData('title', e.target.value)} required placeholder="Örn: Kira Ödemesi, Müşteri Görüşmesi" className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label>Açıklama (Opsiyonel)</Label>
                            <Input value={eventData.description} onChange={e => setEventData('description', e.target.value)} placeholder="Detaylı bilgi..." className="h-11" />
                        </div>
                        <div className="space-y-3 pt-2">
                            <Label>Etiket Rengi</Label>
                            <div className="flex gap-3 justify-between">
                                {['#ea580c', '#16a34a', '#2563eb', '#dc2626', '#9333ea', '#4f46e5', '#0891b2'].map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`w-9 h-9 rounded-full shadow-sm transition-all ${eventData.color === color ? 'ring-2 ring-offset-2 ring-neutral-800 dark:ring-neutral-200 dark:ring-offset-neutral-900 scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setEventData('color', color)}
                                    />
                                ))}
                            </div>
                        </div>
                        <DialogFooter className="mt-8 gap-2">
                            <Button type="button" variant="outline" className="h-11 rounded-full px-6" onClick={() => setIsEventModalOpen(false)}>İptal</Button>
                            <Button type="submit" disabled={processing} className="h-11 rounded-full px-8 bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20">Kaydet</Button>
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
