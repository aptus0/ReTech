import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { props } = usePage<any>();
    const storeName = props.store_name || 'KobiX';
    const storeLogo = props.store_logo || '/header-logo.png?v=1';

    if (storeLogo) {
        return (
            <div className="flex h-16 items-center justify-center overflow-hidden">
                <img
                    src={storeLogo}
                    alt={storeName}
                    className="h-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                />
                <div className="hidden flex aspect-square size-10 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
                    <AppLogoIcon className="size-8 fill-current text-primary-foreground" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
                <AppLogoIcon className="size-6 fill-current text-primary-foreground" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {storeName}
                </span>
                <span className="truncate text-[10px] tracking-wider text-muted-foreground uppercase">
                    Mobile Terminal
                </span>
            </div>
        </>
    );
}
