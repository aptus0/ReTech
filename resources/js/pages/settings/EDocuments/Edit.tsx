import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Save, ShieldAlert, CheckCircle2, FlaskConical, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Edit({ setting }: { setting: any }) {
    const [isTesting, setIsTesting] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        provider: setting.provider || 'mock',
        environment: setting.environment || 'test',
        is_active: setting.is_active || false,
        company_title: setting.company_title || '',
        tax_number: setting.tax_number || '',
        tax_office: setting.tax_office || '',
        gib_user_code: setting.gib_user_code || '',
        gib_password: '', // Boş başlar, sadece güncellenmek istenirse doldurulur
        e_invoice_enabled: setting.e_invoice_enabled || false,
        e_archive_enabled: setting.e_archive_enabled || false,
        default_document_type: setting.default_document_type || 'auto',
        invoice_prefix: setting.invoice_prefix || 'GIB',
        invoice_start_no: setting.invoice_start_no || '2023000000001',
        auto_send_after_sale: setting.auto_send_after_sale || false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/e-documents', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('e-Belge entegrasyon ayarları başarıyla kaydedildi.');
                setData('gib_password', ''); // Başarılı kayıttan sonra şifre alanını temizle
            },
        });
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            const response = await fetch('/settings/e-documents/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });
            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Bağlantı testi sırasında bir hata oluştu.');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <>
            <Head title="e-Belge Ayarları" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">e-Belge Entegrasyonu</h1>
                        <p className="text-muted-foreground mt-2">
                            e-Fatura ve e-Arşiv gönderim ayarlarını yönetin.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {setting.is_active ? (
                            <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                <span className="font-semibold text-sm">Entegrasyon Aktif</span>
                            </div>
                        ) : (
                            <div className="flex items-center text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full border">
                                <ShieldAlert className="w-4 h-4 mr-2" />
                                <span className="font-semibold text-sm">Entegrasyon Pasif</span>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sol Kolon - Temel Ayarlar */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bağlantı ve Ortam Ayarları</CardTitle>
                                    <CardDescription>GİB veya Özel Entegratör bağlantı tercihlerinizi belirleyin.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-900">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Entegrasyonu Aktifleştir</Label>
                                            <p className="text-sm text-muted-foreground">Sistemin e-belge oluşturmasına izin ver.</p>
                                        </div>
                                        <Switch checked={data.is_active} onCheckedChange={(c) => setData('is_active', c)} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Sağlayıcı (Provider)</Label>
                                            <Select value={data.provider} onValueChange={(v) => setData('provider', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="gib_portal">GİB e-Arşiv Portal (İnteraktif)</SelectItem>
                                                    <SelectItem value="gib_direct">GİB Doğrudan Entegrasyon (API)</SelectItem>
                                                    <SelectItem value="private_integrator">Özel Entegratör (Uyumsoft vb.)</SelectItem>
                                                    <SelectItem value="mock">Geliştirici / Mock Modu</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Çalışma Ortamı</Label>
                                            <Select value={data.environment} onValueChange={(v) => setData('environment', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="test">
                                                        <div className="flex items-center"><FlaskConical className="w-4 h-4 mr-2 text-orange-500" /> Test Ortamı</div>
                                                    </SelectItem>
                                                    <SelectItem value="production">
                                                        <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Canlı (Production)</div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Firma ve GİB Kimlik Bilgileri</CardTitle>
                                    <CardDescription>Resmi fatura kesiminde kullanılacak firma kimlik ve GİB giriş bilgileri.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Firma Ünvanı</Label>
                                        <Input value={data.company_title} onChange={e => setData('company_title', e.target.value)} placeholder="Karaca Ticaret Ltd. Şti." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>VKN / TCKN</Label>
                                            <Input value={data.tax_number} onChange={e => setData('tax_number', e.target.value)} placeholder="1234567890" maxLength={11} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Vergi Dairesi</Label>
                                            <Input value={data.tax_office} onChange={e => setData('tax_office', e.target.value)} placeholder="Mecidiyeköy VD" />
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900 mt-4 space-y-4">
                                        <div className="flex items-center text-orange-800 dark:text-orange-400 font-semibold mb-2">
                                            <ShieldAlert className="w-4 h-4 mr-2" /> GİB Portal / Entegratör Kimlik Bilgileri
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Kullanıcı Kodu</Label>
                                                <Input value={data.gib_user_code} onChange={e => setData('gib_user_code', e.target.value)} placeholder="GIBXXXXX" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Şifre / API Key</Label>
                                                <Input 
                                                    type="password" 
                                                    value={data.gib_password} 
                                                    onChange={e => setData('gib_password', e.target.value)} 
                                                    placeholder={setting.has_gib_password ? '******** (Değiştirmek için yazın)' : 'Şifrenizi girin'} 
                                                />
                                                <p className="text-[10px] text-muted-foreground mt-1">Şifreler veritabanında şifrelenmiş (AES-256) olarak saklanır.</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sağ Kolon - Belge Tercihleri */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Belge Yönetimi</CardTitle>
                                    <CardDescription>Fatura numaralandırma ve belge türü tercihleri.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label>e-Fatura Mükellefiyim</Label>
                                        <Switch checked={data.e_invoice_enabled} onCheckedChange={(c) => setData('e_invoice_enabled', c)} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>e-Arşiv Mükellefiyim</Label>
                                        <Switch checked={data.e_archive_enabled} onCheckedChange={(c) => setData('e_archive_enabled', c)} />
                                    </div>

                                    <div className="pt-4 border-t space-y-2">
                                        <Label>Fatura Seri Ön Eki (3 Harf)</Label>
                                        <Input value={data.invoice_prefix} onChange={e => setData('invoice_prefix', e.target.value.toUpperCase())} maxLength={3} placeholder="GIB" className="uppercase font-mono font-bold tracking-widest text-center" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sıradaki Fatura Numarası</Label>
                                        <Input value={data.invoice_start_no} onChange={e => setData('invoice_start_no', e.target.value)} placeholder="2023000000001" className="font-mono text-center" />
                                        <p className="text-[10px] text-muted-foreground text-center">Yıl (4) + Sıra (9)</p>
                                    </div>
                                    
                                    <div className="pt-4 border-t space-y-2">
                                        <Label>Satış Sonrası İşlem</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch checked={data.auto_send_after_sale} onCheckedChange={(c) => setData('auto_send_after_sale', c)} />
                                            <span className="text-sm">Otomatik GİB'e Gönder</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Kapalıysa fatura "Taslak" olarak bekler, manuel onay gerekir.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-neutral-50 dark:bg-neutral-900 border-dashed">
                                <CardContent className="p-6 space-y-4">
                                    <Button type="button" variant="outline" className="w-full" onClick={handleTestConnection} disabled={isTesting || !data.is_active}>
                                        {isTesting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                                        Bağlantıyı Test Et
                                    </Button>
                                    <Button type="submit" disabled={processing} className="w-full bg-orange-600 hover:bg-orange-700">
                                        <Save className="w-4 h-4 mr-2" />
                                        Ayarları Kaydet
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Ayarlar', href: '/settings/profile' },
        { title: 'e-Fatura / e-Arşiv Entegrasyonu', href: '/settings/e-documents' }
    ]
};
