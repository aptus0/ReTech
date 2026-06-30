import { Head, useForm, usePage } from '@inertiajs/react';
import { Store, Building2, Phone, MapPin, Receipt, UploadCloud, ShieldCheck } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StoreSettings({ 
    storeName, 
    storeLogo,
    companyName,
    phone,
    email,
    address,
    district,
    city,
    taxOffice,
    taxNumber,
    website,
    supportLine
}: any) {
    const { license } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm({
        store_name: storeName || '',
        store_logo: null as File | null,
        company_name: companyName || '',
        phone: phone || '',
        email: email || '',
        address: address || '',
        district: district || '',
        city: city || '',
        tax_office: taxOffice || '',
        tax_number: taxNumber || '',
        website: website || '',
        support_line: supportLine || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/store', {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Program & Şirket Ayarları" />

            <div className="space-y-8 pb-8">
                <Heading
                    variant="small"
                    title="Program & Şirket Ayarları"
                    description="Sistemde ve e-belgelerde kullanılacak firma bilgilerinizi düzenleyin."
                />

                <form onSubmit={submit} className="space-y-8">
                    
                    {/* Basic Store Settings */}
                    <div className="bg-white dark:bg-neutral-950 border rounded-2xl p-6 md:p-8 shadow-sm">
                        <h3 className="text-lg font-semibold flex items-center mb-6">
                            <Store className="w-5 h-5 mr-2 text-orange-600" />
                            Program / Sistem Görünümü
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label htmlFor="store_name">Mağaza / Sistem Adı <span className="text-red-500">*</span></Label>
                                <Input
                                    id="store_name"
                                    value={data.store_name}
                                    onChange={e => setData('store_name', e.target.value)}
                                    className="h-11 rounded-lg"
                                />
                                <p className="text-xs text-muted-foreground">Ekranda sol üst köşede görünecek kısa isim.</p>
                                <InputError message={errors.store_name} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="store_logo">Sistem Logosu</Label>
                                {storeLogo && (
                                    <div className="mb-2">
                                        <img src={storeLogo} alt="Store Logo" className="h-12 w-auto object-contain rounded border p-1 bg-white" />
                                    </div>
                                )}
                                <div className="relative">
                                    <Input
                                        id="store_logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setData('store_logo', e.target.files ? e.target.files[0] : null)}
                                        className="h-11 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                </div>
                                <InputError message={errors.store_logo} />
                            </div>
                        </div>
                    </div>

                    {/* Official Company Info */}
                    <div className="bg-white dark:bg-neutral-950 border rounded-2xl p-6 md:p-8 shadow-sm">
                        <h3 className="text-lg font-semibold flex items-center mb-6">
                            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                            Resmi Firma Bilgileri (e-Fatura İçin)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="company_name">Firma Tam Unvanı <span className="text-red-500">*</span></Label>
                                <Input
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={e => setData('company_name', e.target.value)}
                                    className="h-11 rounded-lg"
                                    placeholder="Örn: Karaca Giyim Sanayi ve Ticaret A.Ş."
                                    required
                                />
                                <InputError message={errors.company_name} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="tax_office">Vergi Dairesi <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Receipt className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                                    <Input
                                        id="tax_office"
                                        value={data.tax_office}
                                        onChange={e => setData('tax_office', e.target.value)}
                                        className="h-11 rounded-lg pl-10"
                                        placeholder="Örn: Karaisalı Mal Müdürü"
                                        required
                                    />
                                </div>
                                <InputError message={errors.tax_office} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="tax_number">VKN / TCKN <span className="text-red-500">*</span></Label>
                                <Input
                                    id="tax_number"
                                    value={data.tax_number}
                                    onChange={e => setData('tax_number', e.target.value)}
                                    className="h-11 rounded-lg font-mono"
                                    placeholder="Örn: 1234567801"
                                    required
                                />
                                <InputError message={errors.tax_number} />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white dark:bg-neutral-950 border rounded-2xl p-6 md:p-8 shadow-sm">
                        <h3 className="text-lg font-semibold flex items-center mb-6">
                            <Phone className="w-5 h-5 mr-2 text-green-600" />
                            İletişim Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="phone">Telefon & Faks</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className="h-11 rounded-lg"
                                    placeholder="Örn: 02626798000"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="support_line">Destek / İletişim Hattı</Label>
                                <Input
                                    id="support_line"
                                    value={data.support_line}
                                    onChange={e => setData('support_line', e.target.value)}
                                    className="h-11 rounded-lg"
                                    placeholder="Örn: 0850 123 45 67"
                                />
                                <InputError message={errors.support_line} />
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="email">E-Posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="h-11 rounded-lg"
                                    placeholder="Örn: info@firma.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="website">Web Sitesi</Label>
                                <Input
                                    id="website"
                                    value={data.website}
                                    onChange={e => setData('website', e.target.value)}
                                    className="h-11 rounded-lg"
                                    placeholder="Örn: www.firma.com.tr"
                                />
                                <InputError message={errors.website} />
                            </div>
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="bg-white dark:bg-neutral-950 border rounded-2xl p-6 md:p-8 shadow-sm">
                        <h3 className="text-lg font-semibold flex items-center mb-6">
                            <MapPin className="w-5 h-5 mr-2 text-red-600" />
                            Adres Bilgileri
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 md:col-span-2">
                                <Label htmlFor="address">Tam Adres <span className="text-red-500">*</span></Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    className="h-11 rounded-lg"
                                    placeholder="Cadde, sokak, mahalle vs."
                                    required
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="district">İlçe</Label>
                                <Input
                                    id="district"
                                    value={data.district}
                                    onChange={e => setData('district', e.target.value)}
                                    className="h-11 rounded-lg"
                                    placeholder="Örn: Gebze"
                                />
                                <InputError message={errors.district} />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="city">İl</Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                    className="h-11 rounded-lg"
                                    placeholder="Örn: Kocaeli"
                                />
                                <InputError message={errors.city} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button 
                            disabled={processing}
                            className="bg-orange-600 hover:bg-orange-700 h-12 px-8 rounded-full shadow-lg shadow-orange-600/20 font-semibold"
                        >
                            Tüm Bilgileri Kaydet
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

StoreSettings.layout = {
    breadcrumbs: [
        {
            title: 'Program & Şirket Ayarları',
            href: '/settings/store',
        },
    ],
};
