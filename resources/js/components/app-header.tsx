import { Link, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Search, Zap, ScanBarcode, PackagePlus, Users, Receipt, Wallet, Layers, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLogo from '@/components/app-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import { onboardingEventTarget } from '@/components/onboarding-tour';

export function AppHeader() {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [searchTerm, setSearchTerm] = useState('');
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        setCanGoBack(window.history.length > 2 || (page.url !== '/dashboard' && page.url !== '/'));
    }, [page.url]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.get('/products', { search: searchTerm });
            setSearchTerm('');
        }
    };

    return (
        <div className="border-b border-sidebar-border/80 bg-background">
            <div className="mx-auto flex h-14 items-center justify-between px-4">
                <div className="flex items-center space-x-1">
                    {canGoBack && page.url !== '/dashboard' && page.url !== '/' && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => window.history.back()}
                            className="mr-2 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:text-white dark:hover:bg-neutral-800"
                            title="Geri Dön"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <Link href={dashboard()} prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>
                </div>

                <div className="flex items-center space-x-2">
                    <form onSubmit={handleSearch} className="relative flex items-center space-x-1 mr-2 hidden md:flex">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Ürünlerde Ara..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-9 w-64 rounded-md border border-input bg-neutral-100 dark:bg-neutral-900 px-3 py-1 pl-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
                            />
                        </div>
                    </form>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="hidden md:flex gap-2 border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-orange-900/50 dark:hover:bg-orange-900/20 text-orange-600 mr-2 rounded-full px-4 h-9 shadow-sm">
                                <Zap className="w-4 h-4 fill-orange-500 text-orange-500" />
                                <span className="font-semibold text-sm tracking-wide">Hızlı İşlemler</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 mt-1" align="end">
                            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Satış & Ürün</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href="/sales-flow" className="cursor-pointer flex items-center font-medium">
                                    <Receipt className="w-4 h-4 mr-2 text-blue-500" /> Yeni Satış / Fatura
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/products/barcode-print/quick" className="cursor-pointer flex items-center font-medium">
                                    <ScanBarcode className="w-4 h-4 mr-2 text-orange-500" /> Hızlı Barkod Yazdır
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/products/create" className="cursor-pointer flex items-center font-medium">
                                    <PackagePlus className="w-4 h-4 mr-2 text-green-500" /> Yeni Ürün Ekle
                                </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuLabel className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Cari & Finans</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href="/customers/create" className="cursor-pointer flex items-center font-medium">
                                    <Users className="w-4 h-4 mr-2 text-indigo-500" /> Yeni Cari Ekle
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/cash-movements" className="cursor-pointer flex items-center font-medium">
                                    <Wallet className="w-4 h-4 mr-2 text-amber-500" /> Kasa Hareketi Ekle
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                        onClick={() => onboardingEventTarget.dispatchEvent(new Event('startTour'))}
                        title="Kullanım Sihirbazı (Yardım)"
                    >
                        <Info className="h-5 w-5" />
                    </Button>

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
