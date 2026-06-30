import { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Zap, CreditCard, Landmark, Copy, CheckCircle2, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLogo from '@/components/app-logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Purchase() {
    const { pending_request } = usePage().props as any;
    
    const { data, setData, post, processing, errors } = useForm({
        plan: 'monthly',
        phone: '',
    });
    
    const [step, setStep] = useState<'plan' | 'payment'>('plan');
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const iban = "TR27 0004 6004 7888 8000 1596 66";
    const bankName = "Akbank";
    const accountName = "ReTech Yazılım Teknolojileri A.Ş.";

    useEffect(() => {
        if (pending_request && pending_request.status === 'pending') {
            const updateTimer = () => {
                const now = Math.floor(Date.now() / 1000);
                const passed = now - pending_request.timestamp;
                const remaining = 300 - passed; // 5 minutes = 300 seconds
                setTimeLeft(remaining > 0 ? remaining : 0);
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [pending_request]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(iban.replace(/\s/g, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const notifyPayment = () => {
        post('/license/purchase');
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (pending_request && pending_request.status === 'pending') {
        const isWaitingForCall = timeLeft <= 0;

        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center py-12 px-4">
                <Head title="Ödeme Kontrolü" />
                
                <div className="w-full max-w-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl flex flex-col relative text-center">
                    {!isWaitingForCall ? (
                        <>
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 mx-auto rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Clock className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Ödemeniz Kontrol Ediliyor</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
                                Ödeme bildiriminiz alındı. Sistem yöneticilerimiz şu anda hesabınızı doğruluyor. Lütfen bu ekrandan ayrılmayın.
                            </p>
                            <div className="text-5xl font-mono font-black text-red-600 tracking-wider">
                                {formatTime(timeLeft)}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 text-green-600 mx-auto rounded-full flex items-center justify-center mb-6">
                                <Phone className="w-10 h-10 animate-bounce" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Arama Bekleniyor</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6">
                                Ödemeniz onay sırasına alındı. Müşteri temsilcimiz lisans kodunuzu iletmek ve kurulum işlemlerini tamamlamak için <strong className="text-neutral-900 dark:text-white">{pending_request.phone}</strong> numarasından sizi arayacaktır.
                            </p>
                            <div className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl text-neutral-600 dark:text-neutral-400 text-xs">
                                Lütfen telefonunuzu açık tutun.
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center py-12 px-4">
            <Head title="Lisans Satın Al" />
            
            <div className="w-full max-w-5xl mb-8 flex justify-between items-center">
                <Button variant="ghost" asChild className="text-neutral-500">
                    <Link href="/settings/license">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
                    </Link>
                </Button>
                <AppLogo />
                <div className="w-24"></div> {/* spacer */}
            </div>

            <div className="text-center mb-12 max-w-2xl mx-auto">
                <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-4">
                    ReTech Terminal Lisansı
                </h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                    Sisteminizin kesintisiz çalışması ve tüm özelliklerden faydalanabilmeniz için lisansınızı aktifleştirin.
                </p>
            </div>

            <div className="w-full max-w-lg mx-auto">
                {step === 'plan' ? (
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl flex flex-col relative transition-all">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-sm">
                            Tam Sürüm
                        </div>
                        <div className="mb-6 text-center mt-2">
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">ReTech Aylık Lisans</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Tüm premium özellikler dahil</p>
                        </div>
                        <div className="mb-8 flex items-baseline justify-center">
                            <span className="text-5xl font-extrabold text-neutral-900 dark:text-white">₺499,99</span>
                            <span className="text-neutral-500 dark:text-neutral-400 ml-2 font-medium">/ay</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Tüm Premium Özellikler', '30 Gün Kesintisiz Kullanım', 'Öncelikli Canlı Destek', 'Ücretsiz Güncellemeler'].map((f, i) => (
                                <li key={i} className="flex items-center text-neutral-600 dark:text-neutral-300 text-sm font-medium">
                                    <Check className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" /> {f}
                                </li>
                            ))}
                        </ul>
                        <Button 
                            onClick={() => setStep('payment')}
                            className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 text-lg"
                        >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Satın Al ve Devam Et
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl flex flex-col relative transition-all">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setStep('plan')} 
                            className="absolute top-4 left-4 text-neutral-400"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Geri
                        </Button>
                        <div className="mb-6 text-center mt-6">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 mx-auto rounded-full flex items-center justify-center mb-4">
                                <Landmark className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Banka Havalesi / EFT</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm px-4">
                                Lütfen <strong>499,99 ₺</strong> tutarını aşağıdaki banka hesabımıza gönderiniz. Açıklama kısmına işletme adınızı yazmayı unutmayınız.
                            </p>
                        </div>
                        
                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-5 mb-6 border border-neutral-100 dark:border-neutral-800">
                            <div className="mb-4">
                                <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Banka Adı</p>
                                <p className="font-semibold text-neutral-900 dark:text-white flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>
                                    {bankName}
                                </p>
                            </div>
                            <div className="mb-4">
                                <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Hesap Sahibi</p>
                                <p className="font-semibold text-neutral-900 dark:text-white">{accountName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">IBAN Numarası</p>
                                <div className="flex items-center justify-between bg-white dark:bg-neutral-950 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                    <code className="font-mono font-bold text-sm text-neutral-800 dark:text-neutral-200">
                                        {iban}
                                    </code>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={copyToClipboard}
                                        className={copied ? 'text-green-500' : 'text-neutral-400'}
                                    >
                                        {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <Label htmlFor="phone" className="text-neutral-700 dark:text-neutral-300 mb-2 block">
                                İletişim Numaranız (Size ulaşabilmemiz için)
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="05XX XXX XX XX"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                className="h-12 text-lg"
                                required
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        <Button 
                            disabled={processing || !data.phone} 
                            onClick={notifyPayment}
                            className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 text-lg"
                        >
                            {processing ? (
                                'İşleniyor...'
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 mr-2" />
                                    Ödemeyi Yaptım, Bildir
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
