import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { StatusBar } from '@/components/status-bar';
import { BottomAppBar } from '@/components/bottom-app-bar';
import type { AppLayoutProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    const { flash } = usePage().props as unknown as { flash: { success?: string; error?: string } };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Ekran çözünürlüğüne göre otomatik ölçeklendirme
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            let zoom = 1;
            
            if (width <= 1024) {
                zoom = 0.8; // 1024x768
            } else if (width <= 1366) {
                zoom = 0.9; // 1366x768
            } else {
                zoom = 1; // 1920x1080 ve üzeri
            }
            
            // @ts-ignore
            document.documentElement.style.zoom = zoom;
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            // @ts-ignore
            document.documentElement.style.zoom = 1;
        };
    }, []);

    return (
        <AppShell variant="header">
            <div className="flex flex-col w-full z-50 fixed top-0">
                <StatusBar />
                <AppHeader />
            </div>
            {/* Added padding top to account for StatusBar(32px) + AppHeader(56px) = 88px */}
            <div className="pt-[88px] pb-[80px]">
                <AppContent variant="header">{children}</AppContent>
            </div>
            <BottomAppBar />
        </AppShell>
    );
}
