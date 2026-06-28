import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, Box, Users, ShoppingCart, Tags, Ruler, FileText } from 'lucide-react';
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

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
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

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
