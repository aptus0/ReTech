import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { props } = usePage<any>();
    const storeName = props.store_name || 'Re Tech Terminal';
    const storeLogo = props.store_logo;

    if (storeLogo) {
        return (
            <div className="flex h-10 items-center justify-center overflow-hidden">
                <img
                    src={storeLogo}
                    alt={storeName}
                    className="h-full object-contain"
                />
            </div>
        );
    }

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md bg-orange-600 text-white">
                <AppLogoIcon className="size-6 fill-current text-white" />
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
