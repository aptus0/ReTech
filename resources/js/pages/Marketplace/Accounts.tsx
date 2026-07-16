import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Link as LinkIcon, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function Accounts({ marketplaces, accounts }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        marketplace_id: '',
        store_name: '',
        supplier_id: '',
        api_key: '',
        api_secret: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/marketplace/accounts', {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            }
        });
    };

    const handleTest = (accountId: number) => {
        router.post(`/marketplace/accounts/${accountId}/test`);
    };

    const handleDelete = (accountId: number) => {
        if (confirm('Bu hesabı silmek istediğinizden emin misiniz?')) {
            router.delete(`/marketplace/accounts/${accountId}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Pazaryeri Hesap Bağlantıları" />

            <div className="flex flex-col gap-4 p-4 lg:p-6 h-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pazaryeri Hesap Bağlantıları</h1>
                        <p className="text-muted-foreground">Trendyol, Hepsiburada gibi entegrasyonların API ayarlarını buradan yönetebilirsiniz.</p>
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Yeni Hesap Ekle
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Pazaryeri Hesabı Ekle</DialogTitle>
                                <DialogDescription>API bilgilerinizi girerek yeni bir bağlantı oluşturun. Bilgileriniz şifrelenerek saklanacaktır.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Pazaryeri Platformu</Label>
                                    <Select 
                                        onValueChange={(value) => setData('marketplace_id', value)}
                                        value={data.marketplace_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Platform Seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {marketplaces.map((mp: any) => (
                                                <SelectItem key={mp.id} value={mp.id.toString()}>
                                                    {mp.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.marketplace_id && <p className="text-sm text-red-500">{errors.marketplace_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Mağaza Adı (Tanımlayıcı)</Label>
                                    <Input 
                                        value={data.store_name} 
                                        onChange={(e) => setData('store_name', e.target.value)} 
                                        placeholder="Örn: KobiX Trendyol Dükkanı" 
                                    />
                                    {errors.store_name && <p className="text-sm text-red-500">{errors.store_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Satıcı (Supplier) ID</Label>
                                    <Input 
                                        value={data.supplier_id} 
                                        onChange={(e) => setData('supplier_id', e.target.value)} 
                                    />
                                    {errors.supplier_id && <p className="text-sm text-red-500">{errors.supplier_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>API Key</Label>
                                    <Input 
                                        value={data.api_key} 
                                        onChange={(e) => setData('api_key', e.target.value)} 
                                        type="password"
                                    />
                                    {errors.api_key && <p className="text-sm text-red-500">{errors.api_key}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>API Secret Key</Label>
                                    <Input 
                                        value={data.api_secret} 
                                        onChange={(e) => setData('api_secret', e.target.value)} 
                                        type="password"
                                    />
                                    {errors.api_secret && <p className="text-sm text-red-500">{errors.api_secret}</p>}
                                </div>

                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>Kaydet</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    {accounts.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-8 text-center border rounded-xl border-dashed">
                            <LinkIcon className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">Henüz hesap eklenmemiş</h3>
                            <p className="text-sm text-muted-foreground mt-1">Sağ üstteki "Yeni Hesap Ekle" butonunu kullanarak ilk entegrasyonunuzu başlatın.</p>
                        </div>
                    ) : (
                        accounts.map((account: any) => (
                            <div key={account.id} className="flex flex-col gap-2 rounded-xl border bg-card p-6 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{account.store_name}</h3>
                                        <p className="text-sm text-muted-foreground">{account.marketplace.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(account.id)} className="text-red-500 hover:text-red-700 hover:bg-red-100">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Satıcı ID:</span>
                                        <span className="font-mono">{account.supplier_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">API Durumu:</span>
                                        {account.has_api_key && account.has_api_secret ? (
                                            <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Yüklü (Şifreli)</span>
                                        ) : (
                                            <span className="text-red-500 flex items-center gap-1"><XCircle className="h-3 w-3"/> Eksik</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Son Bağlantı:</span>
                                        <span>{account.last_connection_at ? new Date(account.last_connection_at).toLocaleString('tr-TR') : 'Test Edilmedi'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Bağlantı Durumu:</span>
                                        <span>
                                            {account.is_active ? 
                                                <span className="text-green-600 font-medium">Aktif</span> : 
                                                <span className="text-red-500 font-medium">Bağlantı Hatası</span>
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <Button variant="outline" className="w-full" onClick={() => handleTest(account.id)}>
                                        <LinkIcon className="mr-2 h-4 w-4" /> Bağlantıyı Test Et
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
