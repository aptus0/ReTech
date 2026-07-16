import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Box, Users, ShoppingCart, Tags, Ruler, FileText, UserCog, Zap } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const navMainItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Hızlı İşlemler',
        href: '#',
        icon: Zap,
        isActive: false,
        items: [
            { title: 'Yeni Satış / Fatura', href: '/sales-flow' },
            { title: 'Hızlı Barkod Yazdır', href: '/products/barcode-print/quick' },
            { title: 'Yeni Ürün Ekle', href: '/products/create' },
            { title: 'Yeni Cari Ekle', href: '/customers/create' },
        ],
    },
];

const navMarketplaceItems: NavItem[] = [
    {
        title: 'Pazaryeri OS',
        href: '#',
        icon: ShoppingCart,
        isActive: false,
        items: [
            { title: 'Dashboard', href: '/marketplace' },
            { title: 'Siparişler', href: '/marketplace/orders' },
            { title: 'İadeler', href: '/marketplace/returns' },
            { title: 'Ürün Senkronizasyonu', href: '/marketplace/products' },
            { title: 'Hesap Bağlantıları', href: '/marketplace/accounts' },
        ],
    },
];

const navInventoryItems: NavItem[] = [
    {
        title: 'Stok Yönetimi',
        href: '/products',
        icon: Box,
    },
    {
        title: 'Kategoriler',
        href: '/categories',
        icon: Tags,
    },
    {
        title: 'Markalar',
        href: '/brands',
        icon: Tags,
    },
    {
        title: 'Birimler',
        href: '/units',
        icon: Ruler,
    },
];

const navFinanceItems: NavItem[] = [
    {
        title: 'Faturalar & E-Belgeler',
        href: '/e-documents',
        icon: FileText,
    },
    {
        title: 'Cari Yönetimi',
        href: '/customers',
        icon: Users,
    },
    {
        title: 'Finans',
        href: '#',
        icon: FileText,
        isActive: false,
        items: [
            {
                title: 'Kasa Hareketleri',
                href: '/cash-movements',
            },
            {
                title: 'Kasalar',
                href: '/cash-registers',
            },
            {
                title: 'Ödeme Tipleri',
                href: '/payment-methods',
            },
        ],
    },
];

const navSettingsItems: NavItem[] = [
    {
        title: 'Kullanıcılar',
        href: '/settings/profile',
        icon: UserCog,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar 
            collapsible="icon" 
            variant="inset"
            className="border-r border-blue-900/10 dark:border-blue-500/10 shadow-[4px_0_24px_rgba(37,99,235,0.05)] bg-white/80 dark:bg-[#0A0F1C]/80 backdrop-blur-xl"
        >
            <SidebarHeader className="py-4 px-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all rounded-xl p-2">
                            <Link href={dashboard()} prefetch className="flex items-center gap-3">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 pb-6 pt-2 custom-scrollbar space-y-2">
                <NavMain label="Ana Menü" items={navMainItems} />
                <NavMain label="Pazaryeri" items={navMarketplaceItems} />
                <NavMain label="Stok & Ürün" items={navInventoryItems} />
                <NavMain label="Finans & Cari" items={navFinanceItems} />
                <NavMain label="Ayarlar" items={navSettingsItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-blue-900/10 dark:border-blue-500/10 p-2">
                <NavFooter items={footerNavItems} />
            </SidebarFooter>
        </Sidebar>
    );
}
