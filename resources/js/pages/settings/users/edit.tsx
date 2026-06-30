import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export default function UsersEdit({ user }: { user: any }) {

    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        store_code: user.store_code || '',
        personnel_no: user.personnel_no || '',
        role: user.role || 'personnel',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/settings/users/${user.id}`);
    };

    return (
        <>
            <Head title="Kullanıcı Düzenle" />

            <div className="p-6 max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Kullanıcı Düzenle</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">"{user.name}" isimli personelin bilgilerini güncelleyin.</p>
                </div>

                <div className="rounded-md border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                    <form onSubmit={submit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Ad Soyad</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta Adresi</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="store_code">Mağaza Kodu</Label>
                                <Input id="store_code" value={data.store_code} onChange={(e) => setData('store_code', e.target.value)} required />
                                <InputError message={errors.store_code} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="personnel_no">Personel No</Label>
                                <Input id="personnel_no" value={data.personnel_no} onChange={(e) => setData('personnel_no', e.target.value)} required />
                                <InputError message={errors.personnel_no} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Kullanıcı Rolü</Label>
                                <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Rol Seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="personnel">Personel</SelectItem>
                                        <SelectItem value="warehouse">Depo</SelectItem>
                                        <SelectItem value="sales_consultant">Satış Danışmanı</SelectItem>
                                        <SelectItem value="manager">Müdür</SelectItem>
                                        <SelectItem value="admin">Sistem Yöneticisi</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>
                        </div>

                        <hr className="my-6 border-gray-200 dark:border-gray-800" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="password">Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)</Label>
                                <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Yeni Şifre (Tekrar)</Label>
                                <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                                <InputError message={errors.password_confirmation} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/settings/users">İptal</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Değişiklikleri Kaydet
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

UsersEdit.layout = {
    breadcrumbs: [
        { title: 'Kullanıcı Yönetimi', href: '/settings/users' },
        { title: 'Kullanıcı Düzenle', href: '#' },
    ],
};
