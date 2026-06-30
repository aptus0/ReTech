import { Head, Link, useForm, router } from '@inertiajs/react';
import { Edit, ArrowLeft, Phone, Mail, MapPin, Briefcase, CreditCard, Activity, Calendar, Receipt, TrendingUp, AlertTriangle, Clock, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

export default function Show({ customer, cashMovements, registers, paymentMethods }: { customer: any, cashMovements: any[], registers: any[], paymentMethods: any[] }) {
    const [activeTab, setActiveTab] = useState('ozet');
    const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

    const { data: collectData, setData: setCollectData, post: postCollect, processing: collectProcessing, reset: resetCollect, clearErrors: clearCollectErrors } = useForm({
        amount: '',
        cash_register_id: registers?.[0]?.id ? String(registers[0].id) : '',
        payment_method_id: paymentMethods?.[0]?.id ? String(paymentMethods[0].id) : '',
        description: '',
        movement_date: new Date().toISOString().split('T')[0],
    });

    const { data: noteData, setData: setNoteData, post: postNote, put: putNote, delete: deleteNote, processing: noteProcessing, reset: resetNote, clearErrors: clearNoteErrors } = useForm({
        content: ''
    });

    const handleCollect = (e: React.FormEvent) => {
        e.preventDefault();
        postCollect(`/customers/${customer.id}/collect`, {
            onSuccess: () => {
                setIsCollectModalOpen(false);
                resetCollect();
            }
        });
    };

    const handleNoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingNoteId) {
            putNote(`/customer-notes/${editingNoteId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingNoteId(null);
                    resetNote();
                    clearNoteErrors();
                },
                onError: () => {
                    console.error("Not güncellenirken hata oluştu.");
                }
            });
        } else {
            postNote(`/customers/${customer.id}/notes`, {
                preserveScroll: true,
                onSuccess: () => {
                    resetNote();
                    clearNoteErrors();
                }
            });
        }
    };

    const renderTabContent = () => {
        if (activeTab === 'ozet') {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`border rounded-xl p-6 flex flex-col relative overflow-hidden ${Number(customer.balance) > 0 ? 'bg-orange-50/50 border-orange-100 text-orange-900' : 'bg-neutral-50 border-neutral-100'}`}>
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                                <CreditCard className="w-32 h-32" />
                            </div>
                            <p className="text-sm font-medium mb-1 text-muted-foreground flex items-center">
                                Cari Bakiye
                                {Number(customer.balance) > 0 && <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">Borçlu</span>}
                            </p>
                            <h3 className="text-4xl font-black mt-2">₺{Number(customer.balance || 0).toLocaleString('tr-TR')}</h3>
                            <p className="text-xs mt-3 opacity-80 font-medium">Risk Limiti: ₺150.000,00</p>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl p-6 flex flex-col relative overflow-hidden shadow-sm">
                            <div className="absolute -right-4 -bottom-4 opacity-[0.03]">
                                <Activity className="w-32 h-32" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center">Toplam İşlem Hacmi</p>
                            <h3 className="text-4xl font-bold mt-2">₺12.450,00</h3>
                            <p className="text-xs mt-3 text-green-600 font-medium flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Geçen aya göre %15 artış</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900 shadow-sm col-span-2">
                            <h4 className="text-sm font-semibold mb-4 flex items-center"><Calendar className="w-4 h-4 mr-2 text-blue-500" /> Bakiye Gelişimi (Son 6 Ay)</h4>
                            <div className="h-40 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[
                                        { month: 'Oca', bakiye: 5000 },
                                        { month: 'Şub', bakiye: 4200 },
                                        { month: 'Mar', bakiye: 8000 },
                                        { month: 'Nis', bakiye: 3000 },
                                        { month: 'May', bakiye: 12000 },
                                        { month: 'Haz', bakiye: Number(customer.balance) || 5000 },
                                    ]} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorBakiye" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                        <RechartsTooltip cursor={{stroke: '#ea580c', strokeWidth: 1, strokeDasharray: '3 3'}} />
                                        <Area type="monotone" dataKey="bakiye" stroke="#ea580c" strokeWidth={2} fillOpacity={1} fill="url(#colorBakiye)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900 shadow-sm flex flex-col">
                            <h4 className="text-sm font-semibold mb-4 flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-orange-500" /> Vadesi Gelenler</h4>
                            <div className="flex-1 flex flex-col justify-center items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                                    <span className="text-2xl font-bold text-orange-600">2</span>
                                </div>
                                <p className="text-sm font-medium">Ödenmemiş Fatura</p>
                                <p className="text-xs text-muted-foreground mt-1">Toplam: ₺4.500,00</p>
                                <Button size="sm" variant="outline" className="mt-4 w-full border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => setIsCollectModalOpen(true)}>Tahsilat Al</Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'satis') {
            return (
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center"><Receipt className="w-4 h-4 mr-2 text-green-500" /> Son Satış ve Faturalar</h4>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tarih</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fatura No</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Tutar</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Durum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3].map((_, i) => (
                                    <tr key={i} className="border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                        <td className="px-4 py-3 font-mono text-xs">{new Date(Date.now() - (i*15) * 86400000).toLocaleDateString('tr-TR')}</td>
                                        <td className="px-4 py-3 font-medium text-blue-600 hover:underline cursor-pointer">RET2026000{145 - i}</td>
                                        <td className="px-4 py-3 text-right font-bold">₺{(4500 - (i*1200)).toLocaleString('tr-TR')}</td>
                                        <td className="px-4 py-3 text-center">
                                            {i === 0 ? <Badge variant="outline" className="border-orange-200 text-orange-700">Açık</Badge> : <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Ödendi</Badge>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (activeTab === 'tahsilat') {
            return (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold flex items-center"><CreditCard className="w-4 h-4 mr-2 text-blue-500" /> Tahsilat Geçmişi</h4>
                        <Button size="sm" onClick={() => setIsCollectModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">Tahsilat Ekle</Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tarih</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Açıklama</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kasa</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cashMovements?.length > 0 ? cashMovements.map((mov) => (
                                    <tr key={mov.id} className="border-b last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                        <td className="px-4 py-3 font-mono text-xs">{new Date(mov.movement_date).toLocaleDateString('tr-TR')}</td>
                                        <td className="px-4 py-3">{mov.description || 'Tahsilat'}</td>
                                        <td className="px-4 py-3">{mov.register?.name || '-'}</td>
                                        <td className="px-4 py-3 text-right font-bold text-green-600">+₺{Number(mov.amount).toLocaleString('tr-TR')}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Henüz tahsilat bulunmuyor.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (activeTab === 'notlar') {
            return (
                <div className="space-y-6">
                    <h4 className="text-sm font-semibold flex items-center"><Edit2 className="w-4 h-4 mr-2 text-orange-500" /> Cari Notları</h4>
                    
                    <form onSubmit={handleNoteSubmit} className="flex flex-col gap-2">
                        <textarea 
                            value={noteData.content} 
                            onChange={e => setNoteData('content', e.target.value)} 
                            className="w-full min-h-[100px] p-3 border rounded-md bg-neutral-50 focus:bg-white dark:bg-neutral-900 transition-colors resize-y text-sm" 
                            placeholder="Bu müşteri hakkında yeni bir not ekleyin..."
                            required
                        ></textarea>
                        <div className="flex justify-end gap-2">
                            {editingNoteId && <Button type="button" variant="ghost" onClick={() => { setEditingNoteId(null); resetNote(); }}>İptal</Button>}
                            <Button type="submit" disabled={noteProcessing} className="bg-orange-600 hover:bg-orange-700">{editingNoteId ? 'Güncelle' : 'Not Ekle'}</Button>
                        </div>
                    </form>

                    <div className="space-y-4 mt-6">
                        {customer.customer_notes?.length > 0 ? customer.customer_notes.map((note: any) => (
                            <div key={note.id} className="p-4 border rounded-lg bg-white dark:bg-neutral-950 shadow-sm relative group">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button onClick={() => { setEditingNoteId(note.id); setNoteData('content', note.content); }} className="text-blue-500 hover:text-blue-700 p-1"><Edit2 className="w-4 h-4"/></button>
                                    <button onClick={() => { if(confirm('Silmek istediğinize emin misiniz?')) deleteNote(`/customer-notes/${note.id}`); }} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4"/></button>
                                </div>
                                <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between pr-16">
                                    <span className="font-medium text-orange-600">{note.user?.name || 'Kullanıcı'}</span>
                                    <span>{new Date(note.created_at).toLocaleString('tr-TR')}</span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-muted-foreground">Kayıtlı not bulunamadı.</div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Clock className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-1">{activeTab.toUpperCase()} Geçmişi</h3>
                <p className="text-sm">Bu sekmeye ait yeterli veri bulunmuyor veya yakında eklenecek.</p>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Cariler', href: '/customers' },
            { title: customer.name, href: `/customers/${customer.id}` }
        ]}>
            <Head title={customer.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/customers">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                            <div className="flex items-center space-x-3 mt-2 text-sm text-muted-foreground">
                                <Badge variant="secondary" className="px-2 py-0.5">{customer.type === 'corporate' ? 'Kurumsal Cari' : 'Bireysel Müşteri'}</Badge>
                                <span className="font-mono">{customer.customer_code}</span>
                            </div>
                        </div>
                    </div>
                    <Link href={`/customers/${customer.id}/edit`}>
                        <Button className="bg-orange-600 hover:bg-orange-700 shadow-sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Düzenle
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                    <Card className="lg:col-span-4 shadow-md border-neutral-200/60 dark:border-neutral-800 h-fit">
                        <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b pb-4">
                            <CardTitle className="text-lg flex items-center"><Briefcase className="w-5 h-5 mr-2 text-orange-600"/> Cari Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="flex items-start space-x-3 text-sm">
                                <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-500">Vergi Dairesi / No</p>
                                    <p className="text-base font-medium">{customer.tax_office || '-'} / <span className="font-mono">{customer.tax_number || customer.identity_number || '-'}</span></p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-500">Telefon</p>
                                    <p className="text-base font-medium font-mono">{customer.phone || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-500">E-posta</p>
                                    <p className="text-base font-medium">{customer.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-500">Adres</p>
                                    <p className="text-base font-medium">{customer.address || '-'} {customer.district ? <><br/><span className="text-muted-foreground">{customer.district} / {customer.city}</span></> : ''}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-8 flex flex-col">
                        <div className="bg-white dark:bg-neutral-950 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-1.5 mb-6 flex gap-1 overflow-x-auto w-fit">
                            {[
                                { id: 'ozet', label: 'Cari Ekstre & Özet' },
                                { id: 'satis', label: 'Faturalar & İşlemler' },
                                { id: 'tahsilat', label: 'Tahsilatlar' },
                                { id: 'notlar', label: 'Notlar' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-2.5 text-sm font-semibold rounded-lg whitespace-nowrap transition-all duration-200 ${activeTab === tab.id ? 'bg-orange-100 text-orange-700 shadow-sm' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        <Card className="shadow-md border-neutral-200/60 dark:border-neutral-800 flex-1">
                            <CardContent className="p-6 md:p-8 h-full min-h-[400px]">
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {renderTabContent()}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={isCollectModalOpen} onOpenChange={setIsCollectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tahsilat Al</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCollect} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tutar (₺)</Label>
                            <Input type="number" step="0.01" value={collectData.amount} onChange={e => setCollectData('amount', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Kasa / Hesap</Label>
                            <Select value={String(collectData.cash_register_id)} onValueChange={v => setCollectData('cash_register_id', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {registers?.map((reg: any) => (
                                        <SelectItem key={reg.id} value={String(reg.id)}>{reg.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ödeme Yöntemi</Label>
                            <Select value={String(collectData.payment_method_id)} onValueChange={v => setCollectData('payment_method_id', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {paymentMethods?.map((pm: any) => (
                                        <SelectItem key={pm.id} value={String(pm.id)}>{pm.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Açıklama</Label>
                            <Input value={collectData.description} onChange={e => setCollectData('description', e.target.value)} placeholder="Nakit ödeme, havale vb." />
                        </div>
                        <div className="space-y-2">
                            <Label>Tarih</Label>
                            <Input type="date" value={collectData.movement_date} onChange={e => setCollectData('movement_date', e.target.value)} required />
                        </div>
                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsCollectModalOpen(false)}>İptal</Button>
                            <Button type="submit" disabled={collectProcessing} className="bg-orange-600 hover:bg-orange-700">Tahsilatı Kaydet</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
