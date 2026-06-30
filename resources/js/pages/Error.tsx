import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ShieldAlert, FileQuestion, ServerCrash, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ status }: { status: number }) {
    const title = {
        503: 'Hizmet Kullanılamıyor',
        500: 'Sunucu Hatası',
        404: 'Sayfa Bulunamadı',
        403: 'Yetkisiz Erişim',
    }[status] || 'Bir Hata Oluştu';

    const description = {
        503: 'Şu anda bakım yapıyoruz. Lütfen kısa bir süre sonra tekrar deneyin.',
        500: 'Sunucularımızda beklenmeyen bir hata oluştu ve bu hata sistem loglarına kaydedildi. Teknik ekip bilgilendirildi.',
        404: 'Şu an yapmak istediğiniz işlem (veya sayfa) bulunmamaktadır. Lütfen girdiğiniz bağlantıyı kontrol edin.',
        403: 'Bu işlemi yapmak veya bu sayfayı görüntülemek için yeterli yetkiniz bulunmuyor.',
    }[status] || 'Bilinmeyen bir hata ile karşılaştık.';

    const Icon = {
        503: ShieldAlert,
        500: ServerCrash,
        404: FileQuestion,
        403: AlertCircle,
    }[status] || AlertCircle;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
            <Head title={title} />
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <Icon className="w-12 h-12" />
                </div>
                
                <h1 className="text-6xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">{status}</h1>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{title}</h2>
                <p className="text-muted-foreground">{description}</p>
                
                <div className="pt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri Dön
                    </Button>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
                            <Home className="w-4 h-4 mr-2" />
                            Ana Sayfaya Git
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
