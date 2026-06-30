import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ComingSoon() {
    const [timeLeft, setTimeLeft] = useState({
        days: 240,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 240);
        
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <>
            <Head title="PazaryeriOS - Yakında" />

            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] w-full relative overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a]">
                
                {/* Subtle Apple-like gradient orb in the background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-orange-500/10 via-red-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />
                
                <div className="relative z-10 w-full max-w-5xl px-6 py-12 flex flex-col items-center text-center">
                    
                    {/* Badge */}
                    <div className="mb-8 inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md px-6 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 shadow-sm transition-all hover:bg-white dark:hover:bg-neutral-900">
                        <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-3 animate-pulse"></span>
                        GELİŞTİRİCİ BAKIM MODU
                    </div>

                    {/* Main Typography */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-neutral-900 dark:text-white mb-6">
                        PazaryeriOS.
                    </h1>
                    
                    <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-neutral-400 dark:text-neutral-500 mb-10">
                        Yeniden Tasarlanıyor.
                    </h2>

                    <p className="max-w-2xl text-lg md:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed mb-16 font-medium">
                        Şu anda API'ler güncelleniyor. Trendyol, Hepsiburada ve N11 için en stabil sipariş ve stok senkronizasyon altyapısı kuruluyor. Kusursuz bir deneyim için hazırlanıyoruz.
                    </p>

                    {/* Countdown Timer - Apple Style */}
                    <div className="flex items-center justify-center gap-4 md:gap-8 mb-20">
                        <div className="flex flex-col items-center">
                            <span className="text-5xl md:text-7xl font-light tabular-nums text-neutral-900 dark:text-white tracking-tight">
                                {formatNumber(timeLeft.days)}
                            </span>
                            <span className="text-xs md:text-sm font-semibold uppercase tracking-widest text-neutral-400 mt-2">Gün</span>
                        </div>
                        <span className="text-4xl md:text-6xl font-light text-neutral-300 dark:text-neutral-800 -mt-8">:</span>
                        
                        <div className="flex flex-col items-center">
                            <span className="text-5xl md:text-7xl font-light tabular-nums text-neutral-900 dark:text-white tracking-tight">
                                {formatNumber(timeLeft.hours)}
                            </span>
                            <span className="text-xs md:text-sm font-semibold uppercase tracking-widest text-neutral-400 mt-2">Saat</span>
                        </div>
                        <span className="text-4xl md:text-6xl font-light text-neutral-300 dark:text-neutral-800 -mt-8">:</span>

                        <div className="flex flex-col items-center">
                            <span className="text-5xl md:text-7xl font-light tabular-nums text-neutral-900 dark:text-white tracking-tight">
                                {formatNumber(timeLeft.minutes)}
                            </span>
                            <span className="text-xs md:text-sm font-semibold uppercase tracking-widest text-neutral-400 mt-2">Dakika</span>
                        </div>
                        <span className="text-4xl md:text-6xl font-light text-neutral-300 dark:text-neutral-800 -mt-8">:</span>

                        <div className="flex flex-col items-center">
                            <span className="text-5xl md:text-7xl font-light tabular-nums text-orange-500 tracking-tight">
                                {formatNumber(timeLeft.seconds)}
                            </span>
                            <span className="text-xs md:text-sm font-semibold uppercase tracking-widest text-orange-500/70 mt-2">Saniye</span>
                        </div>
                    </div>

                    <Button 
                        variant="ghost" 
                        className="rounded-full px-8 h-14 text-base font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Geri Dön
                    </Button>
                </div>
            </div>
        </>
    );
}
