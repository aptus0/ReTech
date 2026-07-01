import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function LicenseGuard() {
    const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
    const [activationKey, setActivationKey] = useState('');
    const [isTrial, setIsTrial] = useState(true);

    useEffect(() => {
        const key = localStorage.getItem('retech_activation_key');

        if (key && key.length > 5) {
            setIsTrial(false);

            return;
        }

        // Handle Trial Logic
        let trialStartStr = localStorage.getItem('retech_trial_start');

        if (!trialStartStr) {
            trialStartStr = new Date().toISOString();
            localStorage.setItem('retech_trial_start', trialStartStr);
        }

        const trialStartDate = new Date(trialStartStr);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - trialStartDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 14) {
            // Lock the system
            setIsActivationModalOpen(true);
        } else if (diffDays === 13) {
            // Warning on the 13th day
            toast.warning('Lisansınızın bitmesine 1 gün kaldı. Lütfen sistem kilitlenmeden önce lisansınızı yenileyin.', {
                duration: 10000,
            });
        }
    }, []);

    const handleActivation = (e: React.FormEvent) => {
        e.preventDefault();

        if (activationKey.length > 5) {
            localStorage.setItem('retech_activation_key', activationKey);
            setIsActivationModalOpen(false);
            setIsTrial(false);
            toast.success('Uygulama başarıyla aktifleştirildi.');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            toast.error('Geçersiz aktivasyon anahtarı.');
        }
    };

    return (
        <Dialog open={isActivationModalOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md [&>button]:hidden outline-none pointer-events-auto z-[99999]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-red-600">Re Tech Lisans Süresi Doldu</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                        14 günlük ücretsiz deneme süreniz sona erdi. Sisteme erişmeye devam etmek için lütfen lisans anahtarınızı giriniz.
                    </p>
                    <form onSubmit={handleActivation} className="space-y-4">
                        <Input 
                            placeholder="Lisans Anahtarı: XXXX-XXXX-XXXX-XXXX" 
                            value={activationKey} 
                            onChange={e => setActivationKey(e.target.value)} 
                            required 
                            autoFocus
                        />
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Lisansı Doğrula ve Aktifleştir</Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
