import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import { useState } from 'react';

export default function Show({ customer }: { customer: any }) {
    const [activeTab, setActiveTab] = useState('ozet');

    const renderTabContent = () => {
        if (activeTab === 'ozet') {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
                            <p className="text-sm font-medium text-orange-800 mb-1">Cari Bakiye</p>
                            <h3 className="text-3xl font-black text-orange-600">₺{Number(customer.balance || 0).toLocaleString('tr-TR')}</h3>
                        </div>
                        <div className="bg-neutral-50 border rounded-lg p-4 text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Toplam İşlem Hacmi</p>
                            <h3 className="text-3xl font-bold">₺0,00</h3>
                        </div>
                    </div>
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                        Özet grafikleri bu alanda yer alacaktır.
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center py-16 text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">{activeTab} sekmesi yapım aşamasında.</h3>
                <p className="text-sm">İşlem geçmişi ve detaylar yakında eklenecektir.</p>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Cariler', href: '/customers' },
            { title: customer.name, href: `/customers/${customer.id}` }
        ]}>
            <Head title={customer.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/customers">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">{customer.name}</h1>
                            <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                                <Badge variant="secondary">{customer.type === 'corporate' ? 'Kurumsal' : 'Bireysel'}</Badge>
                                <span>{customer.customer_code}</span>
                            </div>
                        </div>
                    </div>
                    <Link href={`/customers/${customer.id}/edit`}>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <Edit className="w-4 h-4 mr-2" />
                            Düzenle
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="col-span-1 shadow-sm h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg">Cari Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start space-x-3 text-sm">
                                <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Vergi Dairesi / No</p>
                                    <p className="text-muted-foreground">{customer.tax_office || '-'} / {customer.tax_number || customer.identity_number || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Telefon</p>
                                    <p className="text-muted-foreground">{customer.phone || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">E-posta</p>
                                    <p className="text-muted-foreground">{customer.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Adres</p>
                                    <p className="text-muted-foreground">{customer.address || '-'} {customer.district ? `${customer.district} / ${customer.city}` : ''}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="col-span-2 flex flex-col">
                        <div className="bg-card rounded-md shadow-sm border p-1 mb-4 flex gap-1 overflow-x-auto">
                            {[
                                { id: 'ozet', label: 'Özet & Ekstre' },
                                { id: 'satis', label: 'Satışlar & Alışlar' },
                                { id: 'tahsilat', label: 'Tahsilat & Ödemeler' },
                                { id: 'acik', label: 'Açık İşlemler' },
                                { id: 'notlar', label: 'Notlar' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 text-sm font-medium rounded-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-orange-100 text-orange-700' : 'hover:bg-neutral-100 text-muted-foreground'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        
                        <Card className="shadow-sm flex-1">
                            <CardContent className="p-6 h-full min-h-[400px]">
                                {renderTabContent()}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
