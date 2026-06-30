import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, Box, FileText, Tags, Ruler, ShoppingCart, Calculator, Calendar, FileCheck, RefreshCcw, PieChart, Store, Globe, PackageCheck, CornerUpLeft } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

const navGroups = [
    {
        title: 'Başlangıç',
        icon: LayoutGrid,
        singleHref: dashboard(),
    },
    {
        title: 'Satış & Kasa',
        icon: ShoppingCart,
        items: [
            { title: 'Satıştan Tahsilata', href: '/sales-flow', icon: Calculator },
            { title: 'Açık İşlemler', href: '/open-transactions', icon: RefreshCcw },
            { title: 'Kasa Hareketleri', href: '/cash-movements', icon: FileText },
            { title: 'Kasalar', href: '/cash-registers', icon: Box },
        ]
    },
    {
        title: 'Stok Yönetimi',
        icon: Box,
        items: [
            { title: 'Ürünler', href: '/products', icon: Box },
            { title: 'Kategoriler', href: '/categories', icon: Tags },
            { title: 'Markalar', href: '/brands', icon: Tags },
            { title: 'Birimler', href: '/units', icon: Ruler },
        ]
    },
    {
        title: 'Cari & Fatura',
        icon: Users,
        items: [
            { title: 'Müşteriler & Tedarikçiler', href: '/customers', icon: Users },
            { title: 'e-Belge Yönetimi', href: '/e-documents', icon: FileCheck },
        ]
    },
    {
        title: 'PazaryeriOS',
        icon: Store,
        items: [
            { title: 'Dashboard', href: '/marketplace/dashboard', icon: Globe },
            { title: 'Ürün Havuzu', href: '/marketplace/products', icon: Box },
            { title: 'Siparişler', href: '/marketplace/orders', icon: PackageCheck },
            { title: 'İade ve İptal', href: '/marketplace/returns', icon: CornerUpLeft },
        ]
    },
    {
        title: 'Raporlar',
        icon: PieChart,
        singleHref: '/decision-reports',
    }
];

export function BottomAppBar() {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 flex justify-center shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)]">
            <div className="flex h-full w-full max-w-3xl justify-around items-center px-2">
                {navGroups.map((group) => {
                    const isActiveGroup = group.singleHref 
                        ? isCurrentUrl(group.singleHref)
                        : group.items?.some(i => isCurrentUrl(i.href));

                    const buttonContent = (
                        <div className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors hover:text-orange-600 px-4 cursor-pointer relative",
                            isActiveGroup ? "text-orange-600" : "text-neutral-500 dark:text-neutral-400"
                        )}>
                            <group.icon className={cn("w-6 h-6", isActiveGroup && "fill-orange-600/20")} strokeWidth={isActiveGroup ? 2.5 : 2} />
                            <span className={cn("text-[10px] uppercase font-bold tracking-wider", isActiveGroup && "font-black")}>{group.title}</span>
                            
                            {isActiveGroup && (
                                <span className="absolute top-0 block w-12 h-1 bg-orange-600 rounded-b-md" />
                            )}
                        </div>
                    );

                    if (group.singleHref) {
                        return (
                            <Link key={group.title} href={group.singleHref} className="h-full">
                                {buttonContent}
                            </Link>
                        );
                    }

                    return (
                        <DropdownMenu key={group.title}>
                            <DropdownMenuTrigger asChild className="h-full outline-none">
                                {buttonContent}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="center" className="w-56 mb-2" sideOffset={8}>
                                <DropdownMenuLabel>{group.title}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {group.items?.map(item => (
                                    <DropdownMenuItem key={item.title} asChild>
                                        <Link href={item.href} className="flex items-center w-full cursor-pointer py-2">
                                            <item.icon className="w-4 h-4 mr-2 opacity-70" />
                                            {item.title}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                })}
            </div>
        </div>
    );
}
