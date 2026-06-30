import { Head, Link, useForm } from '@inertiajs/react';
import { User, Mail, Hash, Store, Shield, Lock, ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export default function UsersCreate() {

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        store_code: '',
        personnel_no: '',
        role: 'personnel',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/users');
    };

    return (
        <>
            <Head title="Yeni Kullanıcı Ekle" />

            <div className="flex flex-col">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Yeni Kullanıcı Ekle</h1>
                        <p className="text-muted-foreground mt-1">Sisteme yeni bir personel veya yönetici ekleyin ve yetkilendirin.</p>
                    </div>
                    <Link href="/settings/users">
                        <Button variant="outline" className="rounded-full px-6 shadow-sm">İptal Et</Button>
                    </Link>
                </div>

                <div className="bg-white dark:bg-neutral-950 rounded-2xl border shadow-sm overflow-hidden">
                    <div className="bg-neutral-50/50 dark:bg-neutral-900/50 px-6 py-4 border-b flex items-center">
                        <User className="w-5 h-5 mr-2 text-orange-600" />
                        <h2 className="text-lg font-semibold">Kullanıcı Bilgileri</h2>
                    </div>
                    
                    <form onSubmit={submit} className="p-6 md:p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-neutral-600 dark:text-neutral-400">Ad Soyad <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                    <Input 
                                        id="name" 
                                        className="pl-10 h-11 rounded-lg focus-visible:ring-orange-600 focus-visible:border-orange-600 transition-colors"
                                        value={data.name} 
                                        onChange={(e) => setData('name', e.target.value)} 
                                        required 
                                        placeholder="Örn: Ahmet Yılmaz"
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-neutral-600 dark:text-neutral-400">E-posta Adresi <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        className="pl-10 h-11 rounded-lg focus-visible:ring-orange-600 focus-visible:border-orange-600 transition-colors"
                                        value={data.email} 
                                        onChange={(e) => setData('email', e.target.value)} 
                                        required 
                                        placeholder="ahmet@firma.com"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="store_code" className="text-neutral-600 dark:text-neutral-400">Mağaza Kodu <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                    <Input 
                                        id="store_code" 
                                        className="pl-10 h-11 rounded-lg focus-visible:ring-orange-600 transition-colors"
                                        value={data.store_code} 
                                        onChange={(e) => setData('store_code', e.target.value)} 
                                        required 
                                        placeholder="Örn: MGZ-01" 
                                    />
                                </div>
                                <InputError message={errors.store_code} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="personnel_no" className="text-neutral-600 dark:text-neutral-400">Personel No <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                    <Input 
                                        id="personnel_no" 
                                        className="pl-10 h-11 rounded-lg focus-visible:ring-orange-600 transition-colors"
                                        value={data.personnel_no} 
                                        onChange={(e) => setData('personnel_no', e.target.value)} 
                                        required 
                                        placeholder="Örn: 10045" 
                                    />
                                </div>
                                <InputError message={errors.personnel_no} />
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="role" className="text-neutral-600 dark:text-neutral-400">Kullanıcı Rolü & Yetkilendirme <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-3 h-5 w-5 text-neutral-400 z-10" />
                                    <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                                        <SelectTrigger className="pl-10 h-11 rounded-lg focus:ring-orange-600">
                                            <SelectValue placeholder="Rol Seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="personnel">Personel (Sınırlı Yetki)</SelectItem>
                                            <SelectItem value="warehouse">Depo Sorumlusu (Stok ve Sevkiyat)</SelectItem>
                                            <SelectItem value="sales_consultant">Satış Danışmanı (Satış ve İade)</SelectItem>
                                            <SelectItem value="manager">Mağaza Müdürü (Tam Yetki - Mağaza İçi)</SelectItem>
                                            <SelectItem value="admin">Sistem Yöneticisi (Tüm Sistem)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <InputError message={errors.role} />
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800">
                            <h3 className="text-lg font-semibold mb-6 flex items-center">
                                <Lock className="w-5 h-5 mr-2 text-orange-600" />
                                Güvenlik ve Şifre
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="password" className="text-neutral-600 dark:text-neutral-400">Giriş Şifresi <span className="text-red-500">*</span></Label>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        className="h-11 rounded-lg focus-visible:ring-orange-600 transition-colors"
                                        value={data.password} 
                                        onChange={(e) => setData('password', e.target.value)} 
                                        required 
                                        placeholder="En az 8 karakter"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="password_confirmation" className="text-neutral-600 dark:text-neutral-400">Şifre (Tekrar) <span className="text-red-500">*</span></Label>
                                    <Input 
                                        id="password_confirmation" 
                                        type="password" 
                                        className="h-11 rounded-lg focus-visible:ring-orange-600 transition-colors"
                                        value={data.password_confirmation} 
                                        onChange={(e) => setData('password_confirmation', e.target.value)} 
                                        required 
                                        placeholder="Şifreyi doğrulayın"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-8 border-t mt-8">
                            <Button 
                                type="submit" 
                                disabled={processing} 
                                className="w-full md:w-auto px-8 h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 rounded-full transition-all hover:scale-105 active:scale-95"
                            >
                                Kullanıcıyı Kaydet ve Yetkilendir
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

UsersCreate.layout = {
    breadcrumbs: [
        { title: 'Kullanıcı Yönetimi', href: '/settings/users' },
        { title: 'Yeni Kullanıcı', href: '/settings/users/create' },
    ],
};
