import { Head, useForm, router } from '@inertiajs/react';
import { AlertTriangle, Lock, ShieldAlert, Terminal, Server, Key, Unlock, ShoppingCart, Check, CreditCard, Banknote } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Expired({ client_ip }: { client_ip: string }) {
    const [view, setView] = useState<'enter_key' | 'purchase' | 'iban_details'>('enter_key');

    const { data, setData, post, processing, errors } = useForm({
        license_key: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/license-verify', {
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Lisans Süresi Doldu" />
            
            <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-red-900 selection:text-white py-12">
                {/* Scary Background Elements */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse"></div>
                    <div className="absolute top-0 right-0 h-full w-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-0 left-0 h-full w-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    
                    {/* Simulated terminal lines */}
                    <div className="absolute top-10 left-10 text-red-500/30 text-xs">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="mb-1">{`> [SYS] KERNEL_HALT_${Math.random().toString(36).substring(2, 8).toUpperCase()} ... [OK]`}</div>
                        ))}
                    </div>
                </div>

                <div className="w-full max-w-3xl bg-neutral-950 border-2 border-red-900 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.3)] p-8 relative z-10 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col items-center text-center mb-8 shrink-0">
                        <div className="w-24 h-24 bg-red-950 rounded-full flex items-center justify-center mb-6 relative animate-pulse">
                            <Lock className="w-12 h-12 text-red-500" />
                            <ShieldAlert className="w-8 h-8 text-red-500 absolute -bottom-2 -right-2" />
                        </div>
                        <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-2">
                            14 Günlük Ücretsiz Sürüm Sona Erdi
                        </h1>
                        <h2 className="text-xl font-bold text-neutral-300">
                            ReTech Sistem Erişimi Kilitlendi
                        </h2>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mb-8 shrink-0">
                        <Button 
                            variant="outline" 
                            className={`flex-1 h-14 text-lg font-bold border-2 ${view === 'enter_key' ? 'border-red-500 text-red-500 bg-red-950/50' : 'border-neutral-800 text-neutral-400 bg-black hover:bg-neutral-900 hover:text-white'}`}
                            onClick={() => setView('enter_key')}
                        >
                            <Key className="w-5 h-5 mr-2" />
                            Lisans Anahtarı Gir
                        </Button>
                        <Button 
                            variant="outline" 
                            className={`flex-1 h-14 text-lg font-bold border-2 ${view === 'purchase' || view === 'iban_details' ? 'border-green-500 text-green-500 bg-green-950/50' : 'border-neutral-800 text-neutral-400 bg-black hover:bg-neutral-900 hover:text-white'}`}
                            onClick={() => setView('purchase')}
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Lisans Satın Al
                        </Button>
                    </div>

                    <div className="flex-1 min-h-0">
                        {view === 'enter_key' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-red-950/30 border border-red-900 rounded-md p-5 mb-8">
                                    <div className="flex items-start mb-4 text-red-400">
                                        <AlertTriangle className="w-6 h-6 mr-3 shrink-0 mt-0.5" />
                                        <p className="text-sm leading-relaxed text-justify">
                                            <strong className="text-red-500 block mb-1">DİKKAT! YASAL UYARI VE GÜVENLİK PROTOKOLÜ</strong>
                                            ReTech deneme süreniz dolmuştur. Güvenlik protokolü gereği sistem veritabanı erişimlerini geçici olarak durdurmuştur. 
                                            Şu anda bu makinenin <strong className="text-red-300">İç/Dış IP Adresi ({client_ip})</strong> kayıt altındadır.
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-800 pt-8 mt-2">
                                    <h3 className="text-lg font-bold text-neutral-300 mb-4 flex items-center justify-center">
                                        <Key className="w-5 h-5 mr-2 text-neutral-400" />
                                        Sistemi Açmak İçin Lisans Anahtarını Girin
                                    </h3>
                                    
                                    <form onSubmit={submit} className="space-y-4">
                                        <div>
                                            <Input 
                                                type="text"
                                                className="bg-black border-red-900 text-red-500 font-mono text-center h-14 text-lg uppercase placeholder:text-red-900/50 focus-visible:ring-red-500"
                                                placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                                                maxLength={30}
                                                value={data.license_key}
                                                onChange={e => setData('license_key', e.target.value.toUpperCase())}
                                                required
                                                autoComplete="off"
                                            />
                                            <div className="text-center mt-2">
                                                <InputError message={errors.license_key} className="text-red-500" />
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            disabled={processing || data.license_key.length !== 30}
                                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold tracking-wider rounded flex items-center justify-center disabled:opacity-50 disabled:bg-neutral-800 disabled:text-neutral-500 transition-all"
                                        >
                                            {processing ? (
                                                <span className="flex items-center"><Server className="w-5 h-5 mr-2 animate-spin" /> DOĞRULANIYOR...</span>
                                            ) : (
                                                <span className="flex items-center"><Unlock className="w-5 h-5 mr-2" /> KİLİDİ AÇ VE SİSTEMİ BAŞLAT</span>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {view === 'purchase' && (
                            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col h-full justify-center">
                                <div className="bg-neutral-900 border-2 border-green-900/50 rounded-xl overflow-hidden relative shadow-2xl">
                                    <div className="absolute top-0 right-0 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">EN ÇOK SATAN</div>
                                    <div className="p-6 text-center border-b border-neutral-800 bg-black/50">
                                        <h3 className="text-2xl font-bold text-white mb-2">ReTech Ömür Boyu Lisans</h3>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-5xl font-black text-green-500">499,99</span>
                                            <span className="text-2xl font-bold text-neutral-400">₺</span>
                                        </div>
                                        <p className="text-neutral-500 text-sm mt-2">Tek seferlik ödeme. Aylık ücret yok.</p>
                                    </div>
                                    <div className="p-6 bg-neutral-900">
                                        <ul className="space-y-4 mb-8">
                                            {[
                                                'Sınırsız Kasa ve Cihaz Erişimi',
                                                'PazaryeriOS (Trendyol, Hepsiburada, N11)',
                                                'Sınırsız e-Fatura / e-Arşiv Gönderimi',
                                                'Akıllı Barkod Şemaları & Direkt Baskı',
                                                'Gelişmiş Karar Destek Raporları',
                                                'Bulut Senkronizasyon Desteği',
                                                'Öncelikli Teknik Destek'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center text-neutral-300">
                                                    <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                                                    <span className="font-sans font-medium">{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button 
                                            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg flex items-center justify-center"
                                            onClick={() => setView('iban_details')}
                                        >
                                            <Banknote className="w-6 h-6 mr-2" />
                                            IBAN İle Satın Al (EFT / Havale)
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {view === 'iban_details' && (
                            <div className="animate-in slide-in-from-right-8 duration-500">
                                <div className="bg-neutral-900 border-2 border-green-900/50 rounded-xl p-8 text-center mb-6">
                                    <Banknote className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-2">EFT / Havale Bilgileri</h3>
                                    <p className="text-neutral-400 font-sans mb-6">
                                        Aşağıdaki IBAN numarasına ödemeyi gerçekleştirdikten sonra bizimle iletişime geçiniz. 
                                        Lisans anahtarınız manuel olarak oluşturulup size iletilecektir.
                                    </p>

                                    <div className="bg-black border border-neutral-800 rounded-lg p-6 space-y-4 text-left">
                                        <div>
                                            <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Banka</div>
                                            <div className="text-white text-lg font-semibold">Akbank</div>
                                        </div>
                                        <div>
                                            <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Alıcı Adı Soyadı</div>
                                            <div className="text-white text-lg font-semibold">Samet ER</div>
                                        </div>
                                        <div>
                                            <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">IBAN Numarası</div>
                                            <div className="text-green-500 font-mono text-xl font-bold tracking-widest break-all">
                                                TR27 0004 6004 7888 8000 1596 66
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Tutar</div>
                                            <div className="text-white text-lg font-semibold">499,99 ₺</div>
                                        </div>
                                        <div>
                                            <div className="text-neutral-500 text-xs font-bold uppercase tracking-wider mb-1">Açıklama Kısmına</div>
                                            <div className="text-white text-sm">Adınızı ve Soyadınızı yazmanız yeterlidir.</div>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    variant="outline" 
                                    className="w-full h-12 border-neutral-800 text-neutral-400 hover:text-white"
                                    onClick={() => setView('purchase')}
                                >
                                    Geri Dön
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
