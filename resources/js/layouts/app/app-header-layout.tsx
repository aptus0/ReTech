import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { BottomAppBar } from '@/components/bottom-app-bar';
import { LicenseGuard } from '@/components/license-guard';
import { OnboardingTour } from '@/components/onboarding-tour';
import { StatusBar } from '@/components/status-bar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    const { flash, errors } = usePage().props as unknown as { flash: { success?: string; error?: string, license_warning?: string }, errors: any };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }

        if (errors && Object.keys(errors).length > 0) {
            // Show the first validation error as a toast
            const firstError = Object.values(errors)[0] as string;
            toast.error(firstError || 'Lütfen formdaki hataları kontrol edin.');
        }
    }, [flash, errors]);

    // Kiosk Mode & Resolution States
    const [isKioskMode, setIsKioskMode] = useState(false);
    const [showKioskUnlock, setShowKioskUnlock] = useState(false);
    const [kioskPassword, setKioskPassword] = useState('');
    const [needsFullscreenClick, setNeedsFullscreenClick] = useState(false);

    useEffect(() => {
        const kioskEnabled = localStorage.getItem('envanzo_kiosk_mode') === 'true';

        if (kioskEnabled) {
            setIsKioskMode(true);

            if (!document.fullscreenElement) {
                setNeedsFullscreenClick(true);
            }
        }

        const handleResize = () => {
            const resolution = localStorage.getItem('envanzo_resolution') || 'Auto';
            let scale = 1;
            const width = window.innerWidth;
            
            if (resolution === 'Auto') {
                if (width <= 1024) {
scale = 0.8;
} else if (width <= 1366) {
scale = 0.9;
} else {
scale = 1;
}
            } else {
                const targetWidth = parseInt(resolution.split('x')[0]);
                scale = width / targetWidth;

                if (scale > 1.5) {
scale = 1.5;
} 
            }
            
            // Use fontSize for Tailwind rem scaling instead of CSS zoom to prevent Radix UI Dropdown bugs
            document.documentElement.style.fontSize = `${16 * scale}px`;
            // Remove legacy zoom if present
            // @ts-ignore
            document.documentElement.style.zoom = '';
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && localStorage.getItem('envanzo_kiosk_mode') === 'true') {
                setShowKioskUnlock(true);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.documentElement.style.fontSize = '16px';
        };
    }, []);

    const enterFullscreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
            setNeedsFullscreenClick(false);
            setShowKioskUnlock(false);
        }
    };

    const handleUnlockKiosk = (e: React.FormEvent) => {
        e.preventDefault();

        if (kioskPassword === '123456') {
            localStorage.setItem('envanzo_kiosk_mode', 'false');
            setIsKioskMode(false);
            setShowKioskUnlock(false);
            setKioskPassword('');
            toast.success('Kiosk modundan çıkıldı.');
        } else {
            toast.error('Hatalı şifre!');
        }
    };

    return (
        <AppShell variant="header">
            <LicenseGuard />
            <OnboardingTour />
            
            {needsFullscreenClick && (
                <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-2xl max-w-md text-center space-y-6">
                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold">Kiosk Modu Aktif</h2>
                        <p className="text-neutral-500">Sistem tam ekran modunda çalışmak üzere ayarlandı. Başlamak için lütfen aşağıdaki butona tıklayın.</p>
                        <Button onClick={enterFullscreen} className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700">Tam Ekrana Geç ve Başla</Button>
                    </div>
                </div>
            )}

            <Dialog open={showKioskUnlock} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-md [&>button]:hidden outline-none pointer-events-auto z-[99999]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Kiosk Modundan Çık</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-neutral-500">
                            Sistem şu anda Tam Ekran (Kiosk) modunda kilitlidir. Çıkmak için yönetici şifresini girin.
                        </p>
                        <form onSubmit={handleUnlockKiosk} className="space-y-4">
                            <Input 
                                type="password"
                                placeholder="Şifre (123456)" 
                                value={kioskPassword} 
                                onChange={e => setKioskPassword(e.target.value)} 
                                required 
                                autoFocus
                            />
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={enterFullscreen}>İptal (Tam Ekrana Dön)</Button>
                                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">Kilidi Aç</Button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
            <div className="flex flex-col w-full z-50 fixed top-0">
                <StatusBar />
                <AppHeader />
            </div>
            {/* Added padding top to account for StatusBar(32px) + AppHeader(56px) = 88px */}
            <div className="pb-[80px] pt-[88px]">
                <AppContent variant="header">{children}</AppContent>
            </div>
            <BottomAppBar />
        </AppShell>
    );
}
