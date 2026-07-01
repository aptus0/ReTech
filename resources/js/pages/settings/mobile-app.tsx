import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Smartphone, Wifi, QrCode, ScanLine, ShieldCheck, Zap, Download, ScanBarcode, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MobileApp({ serverIp, apiToken }: { serverIp: string, apiToken: string }) {
    const [copiedField, setCopiedField] = useState<'server' | 'token' | null>(null);
    const serverUrl = /^https?:\/\//i.test(serverIp) ? serverIp : `http://${serverIp}`;
    const qrData = JSON.stringify({ ip: serverUrl, token: apiToken });

    const copyToClipboard = async (value: string, field: 'server' | 'token') => {
        await navigator.clipboard.writeText(value);
        setCopiedField(field);
        window.setTimeout(() => setCopiedField(null), 1600);
    };

    return (
        <>
            <Head title="Mobil App Bağlantısı" />
            
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="bg-gradient-to-r from-orange-600 to-orange-400 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl font-extrabold tracking-tight mb-3">ReTech Mobile'ı Bağlayın</h1>
                            <p className="text-orange-50 text-lg font-medium opacity-90 leading-relaxed">
                                El terminalinizden barkod okutmak, sayım yapmak ve hızlı stok yönetimi için mobil uygulamayı anında siteme entegre edin.
                            </p>
                        </div>
                        <div className="flex-shrink-0 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30">
                            <Smartphone className="w-16 h-16 text-white" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center group transition-all hover:shadow-lg hover:border-orange-500/30">
                            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <ScanLine className="w-10 h-10 text-orange-600 dark:text-orange-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Hızlı Eşleşme (QR)</h3>
                            <p className="text-muted-foreground mb-8 text-sm px-4">
                                Mobil uygulamayı açın, "QR Kod ile Bağlan" seçeneğine dokunun ve aşağıdaki kodu kameraya okutun.
                            </p>
                            
                            <div className="bg-white p-6 rounded-2xl shadow-[0_0_40px_rgba(2ea44f,0.1)] border-2 border-orange-100 dark:border-neutral-800 relative">
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-neutral-900">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                                <QRCodeSVG value={qrData} size={220} level="H" includeMargin={false} />
                            </div>
                        </div>

                        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-6 flex items-start gap-4">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg mt-0.5">
                                <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Ağ Gereksinimi</h4>
                                <p className="text-sm text-blue-800/80 dark:text-blue-400/80 leading-relaxed">
                                    Bağlantının kurulabilmesi için telefonunuzun ve bu bilgisayarın <strong>aynı Wi-Fi (Yerel Ağ)</strong> üzerinde olması gerekmektedir.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
                            <h3 className="font-semibold text-xl mb-6 flex items-center">
                                <ShieldCheck className="w-5 h-5 text-green-500 mr-2" /> Manuel Bağlantı Bilgileri
                            </h3>
                            <p className="text-sm text-neutral-500 mb-6">
                                Kameranız bozuksa veya QR okutamıyorsanız, mobil uygulamadaki <strong>Manuel Giriş</strong> ekranına aşağıdaki bilgileri yazabilirsiniz. <br/><span className="text-orange-500">Not: Güvenliğiniz için uygulama doğrudan Veritabanına (MySQL) değil, şifreli ReTech API'sine bağlanır. Bu yüzden sadece Server IP ve Token yeterlidir.</span>
                            </p>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Server URL / IP Adresi</label>
                                    </div>
                                    <div className="bg-neutral-50 dark:bg-neutral-950 font-mono p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 font-medium text-lg flex items-center justify-between">
                                        <span>{serverUrl}</span>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(serverUrl, 'server')}
                                            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-2 py-1 rounded transition-colors"
                                        >
                                            {copiedField === 'server' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                            {copiedField === 'server' ? 'KOPYALANDI' : 'KOPYALA'}
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Güvenlik Token'ı (API Token)</label>
                                    </div>
                                    <div className="bg-neutral-50 dark:bg-neutral-950 font-mono p-4 pr-28 rounded-xl border border-orange-200 dark:border-orange-900/50 font-medium text-xs text-orange-600 dark:text-orange-400 break-all overflow-hidden relative">
                                        {apiToken}
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(apiToken, 'token')}
                                            className="absolute top-2 right-2 inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 bg-orange-100 hover:bg-orange-200 dark:text-orange-300 dark:bg-orange-900/50 dark:hover:bg-orange-900 px-2 py-1 rounded transition-colors"
                                        >
                                            {copiedField === 'token' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                            {copiedField === 'token' ? 'KOPYALANDI' : 'KOPYALA'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-sm">
                            <h3 className="font-semibold text-xl mb-6 flex items-center">
                                <Zap className="w-5 h-5 text-yellow-500 mr-2" /> Mobil Uygulamanın Özellikleri
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                                        <ScanBarcode className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Barkod Okuma</h4>
                                        <p className="text-sm text-muted-foreground">Kamerayı kullanarak anında ürün barkodu okutun ve sisteme işleyin.</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                                        <QrCode className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Stok Sayımı</h4>
                                        <p className="text-sm text-muted-foreground">Deponuzda gezerken stok hareketlerini hızlıca eşitleyin.</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Smartphone className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Fiyat Gör</h4>
                                        <p className="text-sm text-muted-foreground">Reyonda müşteriye anında güncel fiyat bilgisi verin.</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Download className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Uygulamayı İndir</h4>
                                        <p className="text-sm text-muted-foreground">Android veya iOS mağazasından ReTech uygulamasını indirebilirsiniz.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

MobileApp.layout = {
    breadcrumbs: [
        { title: 'Mobil App Bağlantısı', href: '/settings/mobile-app' },
    ],
};
