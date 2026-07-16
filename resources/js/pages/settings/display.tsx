import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import SettingsLayout from '@/layouts/settings/layout';

const RESOLUTIONS = [
    { value: 'Auto', label: 'Otomatik (Duyarlı)' },
    { value: '1024x768', label: '1024 x 768' },
    { value: '1280x720', label: '1280 x 720 (HD)' },
    { value: '1366x768', label: '1366 x 768 (Laptop)' },
    { value: '1600x900', label: '1600 x 900' },
    { value: '1920x1080', label: '1920 x 1080 (FHD)' },
    { value: '2560x1440', label: '2560 x 1440 (2K)' }
];

export default function DisplaySettings() {
    const [resolution, setResolution] = useState('Auto');
    const [kioskMode, setKioskMode] = useState(false);

    useEffect(() => {
        setResolution(localStorage.getItem('envanzo_resolution') || 'Auto');
        setKioskMode(localStorage.getItem('envanzo_kiosk_mode') === 'true');
    }, []);

    const saveSettings = () => {
        localStorage.setItem('envanzo_resolution', resolution);
        localStorage.setItem('envanzo_kiosk_mode', kioskMode ? 'true' : 'false');
        
        toast.success('Görüntü ayarları kaydedildi. Sayfa yenileniyor...');
        setTimeout(() => window.location.reload(), 1500);
    };

    return (
        <>
            <Head title="Ekran ve Grafik Ayarları" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Ekran ve Grafik Ayarları"
                    description="Kiosk Modu (Tam Ekran Kilidi) ve Arayüz Ölçeklendirme seçenekleri"
                />

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-8">
                    
                    {/* Resolution Section */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Arayüz Çözünürlüğü</h3>
                            <p className="text-sm text-neutral-500">Uygulama arayüzünün hangi boyutta render edileceğini seçin. Otomatik seçenek ekranınıza göre ayarlar.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {RESOLUTIONS.map(res => (
                                <button
                                    key={res.value}
                                    type="button"
                                    onClick={() => setResolution(res.value)}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        resolution === res.value 
                                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500' 
                                        : 'border-neutral-200 dark:border-neutral-800 hover:border-orange-300'
                                    }`}
                                >
                                    <div className="font-semibold">{res.label}</div>
                                    <div className="text-xs text-neutral-500 mt-1">{res.value === 'Auto' ? 'Cihaza Göre Ölçekle' : 'Sabit Zoom Oranı'}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-neutral-200 dark:bg-neutral-800 w-full" />

                    {/* Kiosk Mode Section */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    Kiosk Modu (Tam Ekran Kilidi)
                                </h3>
                                <p className="text-sm text-neutral-500 mt-1 max-w-xl">
                                    Bu seçenek aktif edildiğinde uygulama masaüstünü tamamen kaplar. Kullanıcı çıkmak isterse (ESC tuşuna basarsa) yönetici şifresi (123456) sorulur.
                                </p>
                            </div>
                            <Switch 
                                checked={kioskMode} 
                                onCheckedChange={setKioskMode} 
                                className={kioskMode ? '!bg-orange-600' : ''}
                            />
                        </div>
                        
                        {kioskMode && (
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg text-sm flex gap-2">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>Kiosk Modunu kaydettikten sonra sayfaya ilk girişinizde tam ekrana geçmek için ekranda bir buton belirecektir. Şifreniz <b>123456</b> olarak ayarlanmıştır.</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button onClick={saveSettings} className="bg-orange-600 hover:bg-orange-700 text-white w-full md:w-auto px-8">
                            Ayarları Kaydet ve Uygula
                        </Button>
                    </div>

                </div>
            </div>
        </>
    );
}

DisplaySettings.layout = {
    breadcrumbs: [
        {
            title: 'Ekran & Kiosk Ayarları',
            href: '/settings/display',
        },
    ],
};
