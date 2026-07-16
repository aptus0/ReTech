import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import FlashMessages from '@/components/flash-messages';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <FlashMessages />
            {children}
        </AppSidebarLayout>
    );
}
