import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Program Ayarları',
        href: '/settings/store',
    },
];

export default function StoreSettings({ storeName, storeLogo }: { storeName: string, storeLogo: string }) {
    const { data, setData, post, processing, errors } = useForm({
        store_name: storeName || '',
        store_logo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/store', {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Program Ayarları" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Program ve Mağaza Ayarları"
                    description="Mağazanızın adını ve program içerisinde görünecek logonuzu güncelleyin."
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="store_name">Mağaza Adı / Program Başlığı</Label>
                        <Input
                            id="store_name"
                            value={data.store_name}
                            onChange={e => setData('store_name', e.target.value)}
                            className="max-w-md"
                        />
                        <InputError message={errors.store_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="store_logo">Mağaza Logosu</Label>
                        {storeLogo && (
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-2">Mevcut Logo:</p>
                                <img src={storeLogo} alt="Store Logo" className="h-16 w-auto object-contain rounded border p-1 bg-white" />
                            </div>
                        )}
                        <Input
                            id="store_logo"
                            type="file"
                            accept="image/*"
                            onChange={e => setData('store_logo', e.target.files ? e.target.files[0] : null)}
                            className="max-w-md"
                        />
                        <p className="text-xs text-muted-foreground">Önerilen format: PNG, JPG. Maksimum 2MB.</p>
                        <InputError message={errors.store_logo} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Ayarları Kaydet</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

StoreSettings.layout = {
    breadcrumbs: [
        {
            title: 'Program Ayarları',
            href: '/settings/store',
        },
    ],
};
