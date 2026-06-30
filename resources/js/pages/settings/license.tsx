import { Head, Link, usePage } from '@inertiajs/react';
import { ShieldCheck, Calendar, Key, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';

export default function LicenseSettings() {
    const { license } = usePage().props as any;

    if (!license) return null;

    return (
        <>
            <Head title="Lisans Yöneticisi" />

            <div className="space-y-8 pb-8">
                <Heading
                    variant="small"
                    title="Lisans Yöneticisi"
                    description="Sisteminizin lisans, deneme süresi ve abonelik bilgilerini yönetin."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Status Card */}
                    <div className="bg-white dark:bg-neutral-950 border rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <h3 className="text-lg font-semibold flex items-center mb-6 text-neutral-800 dark:text-neutral-200">
                            <ShieldCheck className="w-5 h-5 mr-2 text-orange-600" />
                            Lisans Durumu
                        </h3>
                        
                        {license.is_trial ? (
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-start">
                                    <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        Sistemi şu anda <strong className="text-neutral-900 dark:text-white">Deneme Sürümü</strong> ile kullanıyorsunuz. Süre bitiminde erişim kısıtlanacaktır.
                                    </p>
                                </div>
                                <div className="flex items-center mt-6 bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 p-5 rounded-xl font-medium border border-orange-100 dark:border-orange-900/50">
                                    <div className="text-5xl font-black mr-5 tracking-tighter">{license.days_left}</div>
                                    <div>
                                        <div className="text-sm font-bold uppercase tracking-wider">Gün Kaldı</div>
                                        <div className="text-xs opacity-80 mt-1">Ücretsiz kullanım süresinin bitimine kalan zaman</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        Lisansınız aktif durumda. Sistemi tüm özellikleri ile sorunsuz kullanabilirsiniz.
                                    </p>
                                </div>
                                <div className="flex items-center mt-6 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-400 p-5 rounded-xl font-medium border border-green-100 dark:border-green-900/50">
                                    <div className="text-3xl font-black mr-5 tracking-tighter">{license.type}</div>
                                    <div>
                                        <div className="text-xs opacity-80 mt-1">Aktif Plan</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Expiration Details */}
                    <div className="bg-white dark:bg-neutral-950 border rounded-2xl p-6 md:p-8 shadow-sm">
                        <h3 className="text-lg font-semibold flex items-center mb-6 text-neutral-800 dark:text-neutral-200">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Süre & Bitiş Detayları
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-800">
                                <span className="text-neutral-500 dark:text-neutral-400">Lisans Tipi</span>
                                <span className="font-semibold text-neutral-900 dark:text-white">{license.type}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-800">
                                <span className="text-neutral-500 dark:text-neutral-400">Durum</span>
                                {license.is_active ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        Aktif
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                        Süresi Doldu
                                    </span>
                                )}
                            </div>
                            
                            {license.expires_at && (
                                <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-800">
                                    <span className="text-neutral-500 dark:text-neutral-400">Bitiş Tarihi</span>
                                    <span className="font-semibold text-neutral-900 dark:text-white">{license.expires_at}</span>
                                </div>
                            )}

                            {(!license.is_trial && license.type !== 'Ömür Boyu (Lifetime)') && (
                                <div className="flex justify-between items-center py-3 border-b border-neutral-100 dark:border-neutral-800">
                                    <span className="text-neutral-500 dark:text-neutral-400">Kalan Süre</span>
                                    <span className="font-semibold text-neutral-900 dark:text-white">{license.days_left} Gün</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 bg-white dark:bg-neutral-950 border rounded-2xl p-6 md:p-8 shadow-sm">
                        <h3 className="text-lg font-semibold flex items-center mb-6 text-neutral-800 dark:text-neutral-200">
                            <Key className="w-5 h-5 mr-2 text-indigo-600" />
                            Lisans İşlemleri
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-3xl">
                            Eğer sisteminize yeni bir lisans tanımlamak veya mevcut sürenizi uzatmak istiyorsanız aşağıdaki satın alma ekranına gidebilirsiniz.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 font-semibold h-12 px-8">
                                <Link href="/license/purchase">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Lisans Satın Al / Yenile
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

LicenseSettings.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Lisans Yöneticisi', href: '/settings/license' },
        ]}
    >
        <SettingsLayout>{page}</SettingsLayout>
    </AppLayout>
);
