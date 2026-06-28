import { Link, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';

export function AppHeader() {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();

    return (
        <div className="border-b border-sidebar-border/80 bg-background">
            <div className="mx-auto flex h-14 items-center justify-between px-4">
                <Link href={dashboard()} prefetch className="flex items-center space-x-2">
                    <AppLogo />
                </Link>

                <div className="flex items-center space-x-2">
                    <div className="relative flex items-center space-x-1">
                        <Button variant="ghost" size="icon" className="group h-9 w-9 cursor-pointer">
                            <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                        </Button>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-10 rounded-full p-1">
                                <Avatar className="size-8 overflow-hidden rounded-sm">
                                    <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                    <AvatarFallback className="rounded-sm bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(auth.user?.name ?? '')}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            {auth.user && <UserMenuContent user={auth.user} />}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
