import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 dark text-slate-100">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=2070&auto=format&fit=crop"
                    alt="Background"
                    className="h-full w-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 mix-blend-multiply" />
            </div>

            {/* Glowing Orbs */}
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-600/30 blur-[120px] pointer-events-none" />

            {/* Content Card */}
            <div className="relative z-10 w-full max-w-md px-6 py-12 mx-auto">
                <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
                    {/* Glass shine effect */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <Link
                        href={home()}
                        className="flex items-center justify-center mb-8 gap-3 group"
                    >
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <AppLogoIcon className="h-8 w-8 text-white fill-current" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                            {name}
                        </span>
                    </Link>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">{title}</h1>
                        <p className="text-sm text-slate-400">
                            {description}
                        </p>
                    </div>
                    
                    <div className="text-slate-200">
                        {children}
                    </div>
                </div>
                
                <p className="text-center text-xs text-slate-500 mt-6">
                    &copy; {new Date().getFullYear()} {name}. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    );
}
