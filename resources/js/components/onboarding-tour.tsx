import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export const onboardingEventTarget = new EventTarget();

const TOUR_STEPS = [
    {
        title: "Re Tech'e Hoş Geldiniz! 🚀",
        content: "Re Tech Terminali, işletmenizin kasa, stok, e-belge ve barkod yönetimini tek bir noktadan, ışık hızında yapmanızı sağlar.",
        icon: "👋"
    },
    {
        title: "Hızlı Barkod Sistemi 🖨️",
        content: "Kasanızın yanında barkodsuz ürünlere anında etiket basabilir, USB yazıcınıza saniyeler içinde bağlanabilirsiniz.",
        icon: "🏷️"
    },
    {
        title: "Mobil Uygulama Gücü 📱",
        content: "İOS Mobil uygulamamız sayesinde mağaza içinde gezerken kameranızla ürün okutun, stok sayın ve fiyat güncelleyin.",
        icon: "📲"
    },
    {
        title: "Kiosk (Tam Ekran) Koruması 🔒",
        content: "Personellerinizin masaüstünde gezinmesini engellemek için Ayarlar > Ekran & Kiosk Ayarları bölümünden sistemi tam ekrana kilitleyebilirsiniz.",
        icon: "🛡️"
    },
    {
        title: "Hazırsınız! 🎉",
        content: "Sistemi kullanmaya başlamak için hazırsınız. Üst menüdeki (i) butonuna basarak bu rehberi tekrar açabilirsiniz.",
        icon: "✅"
    }
];

export function OnboardingTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Otomatik başlama kontrolü
        const isCompleted = localStorage.getItem('retech_onboarding_completed');

        if (!isCompleted) {
            setIsOpen(true);
        }

        // Manuel tetikleme eventi dinleyicisi
        const handleStartTour = () => {
            setCurrentStep(0);
            setIsOpen(true);
        };
        onboardingEventTarget.addEventListener('startTour', handleStartTour);
        
        return () => {
            onboardingEventTarget.removeEventListener('startTour', handleStartTour);
        };
    }, []);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem('retech_onboarding_completed', 'true');
        setIsOpen(false);
    };

    if (!isOpen) {
return null;
}

    const step = TOUR_STEPS[currentStep];

    return (
        <Dialog open={isOpen} onOpenChange={handleComplete}>
            <DialogContent className="sm:max-w-lg z-[99999]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{step.icon}</span>
                        <DialogTitle className="text-2xl">{step.title}</DialogTitle>
                    </div>
                </DialogHeader>
                
                <div className="py-6 min-h-[120px] flex items-center">
                    <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {step.content}
                    </p>
                </div>

                <div className="flex items-center justify-between w-full mt-4">
                    <div className="flex gap-1">
                        {TOUR_STEPS.map((_, index) => (
                            <div 
                                key={index} 
                                className={`h-2 rounded-full transition-all ${index === currentStep ? 'w-6 bg-orange-600' : 'w-2 bg-neutral-200 dark:bg-neutral-700'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {currentStep < TOUR_STEPS.length - 1 ? (
                            <>
                                <Button variant="ghost" onClick={handleComplete}>Atla</Button>
                                <Button onClick={handleNext} className="bg-orange-600 hover:bg-orange-700">İleri</Button>
                            </>
                        ) : (
                            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 text-white px-8">Başla!</Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
