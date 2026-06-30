import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profil',
        href: edit(),
        icon: null,
    },
    {
        title: 'Güvenlik',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Görünüm (Tema)',
        href: editAppearance(),
        icon: null,
    },
    {
        title: 'Ekran & Kiosk Ayarları',
        href: '/settings/display',
        icon: null,
    },
    {
        title: 'Program & Şirket Ayarları',
        href: '/settings/store',
        icon: null,
    },
    {
        title: 'e-Belge ve Fatura Şeması',
        href: '/settings/e-documents',
        icon: null,
    },
    {
        title: 'Kullanıcı Yönetimi',
        href: '/settings/users',
        icon: null,
    },
    {
        title: 'Mobil App Bağlantısı',
        href: '/settings/mobile-app',
        icon: null,
    },
    {
        title: 'Barkod Yazıcıları',
        href: '/barcode-printers',
        icon: null,
    },
    {
        title: 'Barkod Şemaları',
        href: '/barcode-schemas',
        icon: null,
    },
    {
        title: 'Pazaryeri Bağlantıları',
        href: '/settings/marketplaces',
        icon: null,
    },
    {
        title: 'Lisans Yöneticisi',
        href: '/settings/license',
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { license } = usePage().props as any;

    return (
        <div className="px-4 py-6 max-w-[1600px] mx-auto w-full">
            <Heading
                title="Ayarlar"
                description="Sistem, profil ve entegrasyon ayarlarınızı yönetin"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-8 mt-6">
                <aside className="w-full lg:w-72 flex-shrink-0">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 w-full min-w-0">
                    <section className="w-full space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
