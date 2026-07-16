import { usePage } from '@inertiajs/react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { QuickSearchModal } from '@/components/QuickSearchModal';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const { auth } = page.props;
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        setCanGoBack(window.history.length > 2 || (page.url !== '/dashboard' && page.url !== '/'));
    }, [page.url]);

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-blue-900/10 dark:border-blue-500/10 px-4 md:px-6 transition-[width,height] ease-linear bg-white/70 dark:bg-[#0A0F1C]/70 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-2 md:gap-3">
                <SidebarTrigger className="-ml-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30" />
                {canGoBack && page.url !== '/dashboard' && page.url !== '/' && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => window.history.back()}
                        className="rounded-full w-8 h-8 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-all hidden sm:flex"
                        title="Geri Dön"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block"></div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
                <QuickSearchModal />
                
                <Button variant="ghost" size="icon" className="relative rounded-full text-neutral-500 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-neutral-900"></span>
                </Button>
                
                {auth.user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 px-2 flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-all">
                                <UserInfo user={auth.user} showEmail={false} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56 rounded-xl mt-1"
                            align="end"
                        >
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
