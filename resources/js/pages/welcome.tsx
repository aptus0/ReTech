import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type GuideSection = {
    id: string;
    kicker: string;
    title: string;
    body: string[];
    cards?: {
        title: string;
        description: string;
    }[];
    steps?: {
        title: string;
        description: string;
    }[];
    table?: {
        headers: string[];
        rows: string[][];
    };
    note?: {
        type: 'note' | 'warning' | 'success' | 'danger';
        text: string;
    };
};

const sections: GuideSection[] = [
    {
        id: 'dashboard',
        kicker: 'Bölüm 01',
        title: 'Dashboard',
        body: [
            'Dashboard, işletmenin anlık durumunu gösteren ana ekrandır. Burada amaç detaylı kayıt girmek değil, günlük durumu hızlıca görmek ve hangi alana müdahale gerektiğini anlamaktır.',
            'Bugünkü satış, bugünkü tahsilat, kasa durumu, düşük stoklu ürünler, açık işlemler, son hareketler ve hızlı erişim bağlantıları bu ekranda bulunur.',
        ],
        cards: [
            {
                title: 'Bugünkü Satış',
                description: 'Gün içinde yapılan toplam satışları gösterir. Gün sonu kontrolünde kullanılır.',
            },
            {
                title: 'Bugünkü Tahsilat',
                description: 'Nakit, kart veya cari tahsilat toplamını gösterir.',
            },
            {
                title: 'Düşük Stok',
                description: 'Minimum stok seviyesinin altındaki ürünleri gösterir.',
            },
            {
                title: 'Açık İşlemler',
                description: 'Tahsil edilmemiş alacakları ve ödenmemiş borçları vade sırasıyla listeler.',
            },
            {
                title: 'Son Hareketler',
                description: 'Stok, cari, kasa ve satış tarafındaki son işlemleri gösterir.',
            },
            {
                title: 'Hızlı Erişim',
                description: 'Satış, ürün ekleme, cari ekleme ve barkod basma gibi işlemlere hızlı geçiş sağlar.',
            },
        ],
        note: {
            type: 'note',
            text: 'Dashboard verileri diğer modüllerden otomatik beslenir. Satış yaptığınızda stok düşer, kasa veya cari etkilenir ve dashboard kartları güncellenir.',
        },
    },
    {
        id: 'stok',
        kicker: 'Bölüm 02',
        title: 'Stok Yönetimi',
        body: [
            'Stok Yönetimi; kategori, marka, birim, ürün kartı ve stok hareketlerinin yönetildiği bölümdür. Perakende mağazada sistemin en önemli temelidir.',
            'Stok doğru tutulmazsa satış, fatura, düşük stok raporu, alış planı ve barkod işlemleri de yanlış sonuç verir.',
        ],
        table: {
            headers: ['Ekran', 'Ne İşe Yarar?', 'Nasıl Kullanılır?'],
            rows: [
                ['Kategoriler', 'Ürünleri gruplandırır.', 'Gıda, temizlik, kırtasiye, mobilya gibi gruplar açılır.'],
                ['Markalar', 'Ürün marka bilgisini tutar.', 'Rapor ve filtreleme için marka bilgisi düzenli girilir.'],
                ['Birimler', 'Adet, koli, kilogram, metre gibi ölçüleri tanımlar.', 'Ürün kartı açılırken uygun birim seçilir.'],
                ['Stok Hareketleri', 'Ürünün neden arttığını veya azaldığını gösterir.', 'Satış, alış, iade, sayım ve manuel düzeltmeler buradan izlenir.'],
            ],
        },
        note: {
            type: 'warning',
            text: 'Stok miktarını doğrudan elle bozmak yerine stok hareketi oluşturmak daha güvenlidir. Böylece ürünün neden arttığı veya azaldığı geçmişten takip edilebilir.',
        },
    },
    {
        id: 'urunler',
        kicker: 'Bölüm 03',
        title: 'Ürün Kartları',
        body: [
            'Ürün Kartları ekranı, satılan veya stokta takip edilen ürünlerin kaydedildiği bölümdür. Ürün kartı doğru açılırsa satış, barkod, fiyat, fatura ve rapor süreçleri sağlıklı çalışır.',
            'Ürün kartında ürün adı, ürün kodu, barkod, kategori, marka, birim, alış fiyatı, satış fiyatı, KDV oranı, minimum stok, aktif/pasif durumu ve açıklama yer alır.',
        ],
        steps: [
            {
                title: 'Stok Yönetimi > Ürünler ekranını açın.',
                description: 'Yeni Ürün butonuyla ürün oluşturma ekranına geçin.',
            },
            {
                title: 'Ürün temel bilgilerini girin.',
                description: 'Ürün adı, ürün kodu, barkod, kategori, marka ve birim seçilir.',
            },
            {
                title: 'Fiyat ve KDV bilgilerini girin.',
                description: 'Alış fiyatı, satış fiyatı ve KDV oranı doğru yazılmalıdır.',
            },
            {
                title: 'Minimum stok ve başlangıç stokunu girin.',
                description: 'Başlangıç stoku varsa sistem otomatik açılış stok hareketi oluşturur.',
            },
            {
                title: 'Kaydet butonuna basın.',
                description: 'Ürün listede görünür ve satış/barkod işlemlerinde kullanılabilir hale gelir.',
            },
        ],
        note: {
            type: 'success',
            text: 'Kullanılmayan ürünleri silmek yerine pasif yapın. Böylece geçmiş faturalar ve raporlar bozulmaz.',
        },
    },
    {
        id: 'cari',
        kicker: 'Bölüm 04',
        title: 'Cari Yönetimi',
        body: [
            'Cari Yönetimi, müşteri ve tedarikçilerin tek listede takip edildiği bölümdür. Bir cari hem müşteri hem tedarikçi olabilir.',
            'Cari detay ekranında satışlar, alışlar, tahsilatlar, ödemeler, açık işlemler, cari ekstre, vade ve bakiye durumu görüntülenir.',
        ],
        cards: [
            {
                title: 'Müşteri',
                description: 'Satış yaptığınız ve sizden ürün/hizmet alan kişi veya firmadır.',
            },
            {
                title: 'Tedarikçi',
                description: 'Ürün aldığınız ve ödeme yaptığınız kişi veya firmadır.',
            },
            {
                title: 'Cari Ekstre',
                description: 'Cariyle ilgili tüm borç, alacak, ödeme ve tahsilat geçmişini gösterir.',
            },
            {
                title: 'Risk Limiti',
                description: 'Müşterinin belirlenen borç sınırını aşmasını takip etmek için kullanılır.',
            },
        ],
    },
    {
        id: 'satis',
        kicker: 'Bölüm 05',
        title: 'Satıştan Tahsilata Tek Akış',
        body: [
            'Satıştan Tahsilata ekranı, Re Tech’in en önemli işlem akışıdır. Kullanıcı satış oluşturur; sistem stok, cari, kasa ve açık işlem kayıtlarını otomatik üretir.',
            'Bu yapı sayesinde satış anında stok düşer, tahsilat alınırsa kasa artar, vadeli satış yapılırsa açık işlem oluşur.',
        ],
        steps: [
            {
                title: 'Müşteri seçilir.',
                description: 'Peşin satışta zorunlu olmayabilir; vadeli satışta cari seçilmelidir.',
            },
            {
                title: 'Ürün okutulur veya aranır.',
                description: 'Barkod okuyucu ile ürün hızlıca sepete eklenir.',
            },
            {
                title: 'Ödeme tipi seçilir.',
                description: 'Nakit, kart, havale, cari veya parçalı ödeme kullanılabilir.',
            },
            {
                title: 'Satış onaylanır.',
                description: 'Fatura oluşur, stok düşer, kasa veya cari hareketi yazılır.',
            },
        ],
        table: {
            headers: ['Satış Tipi', 'Sistemde Oluşan Kayıt', 'Sonuç'],
            rows: [
                ['Peşin Nakit', 'Satış faturası + stok çıkışı + kasa girişi', 'İşlem kapanır.'],
                ['Kartlı Satış', 'Satış faturası + stok çıkışı + kart tahsilatı', 'POS/kart raporunda görünür.'],
                ['Cari Satış', 'Satış faturası + stok çıkışı + açık alacak', 'Müşteri borçlanır.'],
                ['Parçalı Ödeme', 'Kısmi tahsilat + kalan açık işlem', 'Kalan borç vade takibine düşer.'],
            ],
        },
    },
    {
        id: 'fatura',
        kicker: 'Bölüm 06',
        title: 'Fatura Kesme',
        body: [
            'Fatura modülü; satış faturası, alış faturası, iade faturası ve değişim faturalarının yönetildiği bölümdür.',
            'Fatura yalnızca belge değildir; stok, cari, kasa ve rapor kayıtlarını etkileyen ana işlem kaydıdır.',
        ],
        cards: [
            {
                title: 'Satış Faturası',
                description: 'Müşteriye yapılan satışı kaydeder. Stok düşer, cari veya kasa etkilenir.',
            },
            {
                title: 'Alış Faturası',
                description: 'Tedarikçiden alınan ürünü kaydeder. Stok artar, tedarikçi bakiyesi oluşur.',
            },
            {
                title: 'İade Faturası',
                description: 'Satış veya alış iadesini düzenler. Stok ve cari ters yönde etkilenir.',
            },
            {
                title: 'Değişim Faturası',
                description: 'Eski ürün girişi ve yeni ürün çıkışını beraber yönetir.',
            },
        ],
        note: {
            type: 'warning',
            text: 'Fatura onaylandıktan sonra silme yerine iptal, iade veya düzeltme hareketi kullanılmalıdır.',
        },
    },
    {
        id: 'acik-islemler',
        kicker: 'Bölüm 07',
        title: 'Açık İşlemler ve Vade Takibi',
        body: [
            'Açık İşlemler ekranı, tahsil edilmemiş alacaklar ve ödenmemiş borçların takip edildiği bölümdür.',
            'Hangi müşterinin hangi gün aranacağı ve hangi ödemenin yaklaşmakta olduğu bu ekrandan anlaşılır.',
        ],
        table: {
            headers: ['Renk', 'Durum', 'Yapılacak İşlem'],
            rows: [
                ['Kırmızı', 'Vadesi geçmiş', 'Müşteri aranmalı veya ödeme planı yapılmalıdır.'],
                ['Turuncu', 'Bugün vadesi gelen', 'Gün içinde takip edilmelidir.'],
                ['Sarı', 'Yaklaşan vade', 'Hatırlatma yapılabilir.'],
                ['Yeşil', 'Kapanmış', 'Geçmiş kayıt olarak izlenir.'],
            ],
        },
    },
    {
        id: 'finans',
        kicker: 'Bölüm 08',
        title: 'Finans, Kasa ve Ödeme İşlemleri',
        body: [
            'Finans modülü işletmenin para hareketlerini yönetir. Nakit, kart, banka, tahsilat ve ödeme işlemleri burada takip edilir.',
            'Kasa hareketleri mümkün olduğunca silinmemeli, yanlış işlem varsa düzeltme hareketi oluşturulmalıdır.',
        ],
        cards: [
            {
                title: 'Kasalar',
                description: 'Nakit kasa, banka hesabı veya POS hesabı gibi para noktalarıdır.',
            },
            {
                title: 'Ödeme Tipleri',
                description: 'Nakit, kredi kartı, havale, cari ve parçalı ödeme seçeneklerini tanımlar.',
            },
            {
                title: 'Tahsilat',
                description: 'Müşteriden para alma işlemidir.',
            },
            {
                title: 'Ödeme',
                description: 'Tedarikçiye veya gider için para çıkışı işlemidir.',
            },
        ],
    },
    {
        id: 'barkod',
        kicker: 'Bölüm 09',
        title: 'Barkod, Etiket ve Yazıcı İşlemleri',
        body: [
            'Barkod modülü, ürün etiketi tasarlamak ve barkod yazıcıdan çıktı almak için kullanılır.',
            'TSC TTP-244CE, Zebra, XPrinter ve Argox gibi yazıcılar için şema ve yazdırma altyapısı planlanır.',
            'Barkod şeması, etiket üzerinde hangi bilginin nerede duracağını belirleyen tasarımdır. Etikette logo, firma adı, ürün adı, fiyat, barkod, barkod numarası, ürün kodu ve raf bilgisi bulunabilir.',
        ],
        table: {
            headers: ['Ayar', 'TSC TTP-244CE Önerisi'],
            rows: [
                ['Yazıcı Dili', 'TSPL'],
                ['DPI', '203'],
                ['Etiket', '50mm x 30mm'],
                ['Gap', '3mm'],
                ['Hız', '4'],
                ['Koyuluk', '8'],
                ['Barkod Tipi', 'Code 128 veya EAN-13'],
            ],
        },
        note: {
            type: 'note',
            text: 'Mobil uygulamadan barkod basıldığında iPhone doğrudan yazıcıya bağlanmaz. Mobil uygulama API üzerinden server’a baskı emri gönderir; server üzerindeki yazdırma servisi etiketi basar.',
        },
    },
    {
        id: 'mobil',
        kicker: 'Bölüm 10',
        title: 'Mobil Terminal iOS',
        body: [
            'Re Tech Mobile, iPhone’u el terminali gibi kullanmak için tasarlanır.',
            'Amaç telefondan uzun muhasebe işlemi yapmak değil; sahada hızlı barkod okutmak, stok sorgulamak, sayım yapmak, fiyat güncellemek, ürün eklemek ve barkod basma emri göndermektir.',
        ],
        cards: [
            {
                title: 'Stok Sorgulama',
                description: 'Barkod okutulur, ürünün stok ve fiyat bilgisi görüntülenir.',
            },
            {
                title: 'Sayım',
                description: 'Raf veya depo seçilir, ürünler okutularak fiziksel miktar girilir.',
            },
            {
                title: 'Fiyat Güncelleme',
                description: 'Yetkili kullanıcı ürünü okutup yeni fiyatı kaydedebilir.',
            },
            {
                title: 'Barkod Basma',
                description: 'Ürün, şema ve adet seçilir; API üzerinden server’a baskı emri gönderilir.',
            },
        ],
    },
    {
        id: 'efatura',
        kicker: 'Bölüm 11',
        title: 'e-Fatura ve e-Arşiv',
        body: [
            'e-Fatura/e-Arşiv bölümü, satış faturalarının elektronik belge sürecine hazırlanması, gönderilmesi ve durumunun takip edilmesi için kullanılır.',
            'Canlı e-Fatura/e-Arşiv kullanımı mevzuat ve entegratör gereksinimlerine bağlıdır. Canlıya almadan önce test ortamında doğrulama yapılmalıdır.',
        ],
        steps: [
            {
                title: 'Program Ayarları açılır.',
                description: 'e-Fatura/e-Arşiv entegrasyon bölümü seçilir.',
            },
            {
                title: 'Sağlayıcı ve ortam seçilir.',
                description: 'GİB, özel entegratör, test veya canlı ortam belirlenir.',
            },
            {
                title: 'Firma ve kullanıcı bilgileri girilir.',
                description: 'VKN/TCKN, kullanıcı kodu, şifre ve seri ayarları tanımlanır.',
            },
            {
                title: 'Fatura gönderilir.',
                description: 'Gönderim sonucu fatura detayında durum olarak gösterilir.',
            },
        ],
    },
    {
        id: 'raporlar',
        kicker: 'Bölüm 12',
        title: 'Karar Destekleyici Raporlar',
        body: [
            'Raporlar, işletme sahibinin veya yöneticinin hızlı karar alması için hazırlanır.',
            'Amaç karmaşık veri yığını değil, sade ve anlaşılır özetler sunmaktır.',
        ],
        cards: [
            {
                title: 'Cari Bakiye Raporu',
                description: 'Müşteri ve tedarikçi borç/alacak durumunu gösterir.',
            },
            {
                title: 'Alacak Yaşlandırma',
                description: 'Alacakları vade aralıklarına göre ayırır.',
            },
            {
                title: 'Stok Durum Raporu',
                description: 'Mevcut stok, düşük stok ve stok değeri bilgisini gösterir.',
            },
            {
                title: 'Nakit Akışı',
                description: 'Kasaya giren ve çıkan para hareketlerini özetler.',
            },
        ],
    },
    {
        id: 'ayarlar',
        kicker: 'Bölüm 13',
        title: 'Program Ayarları',
        body: [
            'Program Ayarları, sistemin genel davranışını belirleyen alandır.',
            'Bu ekran yalnızca yetkili kişiler tarafından düzenlenmelidir.',
        ],
        table: {
            headers: ['Ayar', 'Ne İşe Yarar?'],
            rows: [
                ['Firma Bilgileri', 'Unvan, adres, telefon, vergi bilgisi ve logo ayarlanır.'],
                ['Barkod Yazıcı', 'Varsayılan yazıcı, etiket ölçüsü, hız ve koyuluk belirlenir.'],
                ['e-Fatura/e-Arşiv', 'Elektronik belge entegrasyon ayarları yapılır.'],
                ['Mobil API', 'iOS terminal bağlantısı ve yetkileri yönetilir.'],
                ['Yedekleme', 'Otomatik yedekleme klasörü ve zamanlaması ayarlanır.'],
            ],
        },
    },
    {
        id: 'yetkiler',
        kicker: 'Bölüm 14',
        title: 'Kullanıcılar ve Yetkiler',
        body: [
            'Kullanıcı ve yetki sistemi, personelin sadece kendi işiyle ilgili ekranlara erişmesini sağlar.',
            'Bu yapı hem güvenlik hem de veri doğruluğu için önemlidir.',
        ],
        table: {
            headers: ['Rol', 'Önerilen Erişim'],
            rows: [
                ['Admin', 'Tüm ekranlar.'],
                ['Mağaza Müdürü', 'Stok, satış, cari, rapor ve fiyat güncelleme.'],
                ['Kasiyer', 'POS, ürün arama ve satış.'],
                ['Depo Personeli', 'Stok, sayım, ürün ekleme ve barkod basma.'],
                ['Muhasebe', 'Cari, fatura, finans ve rapor.'],
            ],
        },
    },
    {
        id: 'yedekleme',
        kicker: 'Bölüm 15',
        title: 'Yedekleme ve Güvenli Kullanım',
        body: [
            'Re Tech yerel ağda çalışsa bile veri güvenliği önemlidir.',
            'MySQL veritabanı ve yüklenen dosyalar düzenli yedeklenmelidir.',
        ],
        note: {
            type: 'danger',
            text: 'Yedekleme yapılmayan sistemde disk arızası, yanlış silme veya elektrik kesintisi veri kaybına neden olabilir.',
        },
    },
    {
        id: 'sss',
        kicker: 'Bölüm 16',
        title: 'Sık Sorulan Sorular',
        body: [
            'Ürün stok miktarı yanlış görünüyorsa ürün detayındaki stok hareketlerini kontrol edin. Satış, alış, iade veya sayım düzeltmesi miktarı değiştirmiş olabilir.',
            'Satış yaptığınız halde kasa artmadıysa satış cari/vadeli kaydedilmiş olabilir. Böyle bir durumda kasa hareketi yerine açık işlem oluşur.',
            'Barkod yazıcıdan çıktı gelmiyorsa yazıcının açık olduğundan, kağıt/ribon durumundan, Windows driverının kurulu olduğundan ve doğru yazıcının seçildiğinden emin olun.',
            'Mobil uygulama server’a bağlanmıyorsa iPhone ve server aynı yerel ağda olmalıdır. Server adresi doğru yazılmalıdır.',
        ],
    },
    {
        id: 'destek',
        kicker: 'Bölüm 17',
        title: 'Destek, Hata Bildirimi ve Modül Talebi',
        body: [
            'Programda bir hata, kullanım sorunu, eksik gördüğünüz bir alan veya eklenmesini istediğiniz yeni bir modül olursa detaylı açıklama ile temasre@aol.com kişisel mail adresine ulaşabilirsiniz.',
            'Mail içinde hangi ekranda sorun yaşadığınızı, hangi işlemi yaparken hata aldığınızı, mümkünse ekran görüntüsünü ve kullandığınız cihaz bilgisini paylaşmanız önerilir.',
            'Destek talebiniz alındıktan sonra en geç 4 saat içerisinde mail ile dönüş yapılacaktır.',
        ],
    },
];

export default function Welcome() {
    const [query, setQuery] = useState('');

    const filteredSections = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');

        if (!normalizedQuery) {
            return sections;
        }

        return sections.filter((section) => {
            const searchableText = [
                section.kicker,
                section.title,
                ...section.body,
                ...(section.cards?.flatMap((card) => [card.title, card.description]) ?? []),
                ...(section.steps?.flatMap((step) => [step.title, step.description]) ?? []),
                ...(section.table?.headers ?? []),
                ...(section.table?.rows.flat() ?? []),
                section.note?.text ?? '',
            ]
                .join(' ')
                .toLocaleLowerCase('tr-TR');

            return searchableText.includes(normalizedQuery);
        });
    }, [query]);

    return (
        <>
            <Head title="Re Tech Kullanım Kılavuzu" />

            <div className="guide-page">
                <aside className="guide-sidebar">
                    <div className="guide-brand">
                        <div className="guide-brand-logo">Re.</div>
                        <div>
                            <span className="guide-brand-title">Re Tech</span>
                            <span className="guide-brand-subtitle">
                                Ön Kobi Muhasebe ve Dijital Çözüm Programı
                            </span>
                        </div>
                    </div>

                    <div className="guide-search">
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            type="search"
                            placeholder="Kılavuzda ara..."
                        />
                    </div>

                    <div className="guide-toc-title">İçindekiler</div>

                    <nav className="guide-toc">
                        {sections.map((section) => (
                            <a key={section.id} href={`#${section.id}`}>
                                {section.title}
                            </a>
                        ))}
                    </nav>

                    <div className="guide-actions">
                        <button type="button" className="guide-button primary" onClick={() => window.print()}>
                            Yazdır / PDF Al
                        </button>

                        <a
                            className="guide-button"
                            href="mailto:temasre@aol.com?subject=Re%20Tech%20Destek%20Talebi"
                        >
                            Destek Maili
                        </a>
                    </div>
                </aside>

                <main className="guide-content">
                    <section className="guide-hero" id="baslangic">
                        <div className="guide-hero-content">
                            <div>
                                <span className="guide-badge">Rehber Turu ve Kullanım Kılavuzu</span>

                                <h1>Re Tech Ön Kobi Muhasebe ve Dijital Çözüm Programı</h1>

                                <p>
                                    Bu kılavuz, Re Tech programının modüllerini, işlem akışlarını,
                                    dikkat edilmesi gereken noktaları, mobil terminal ve barkod süreçlerini
                                    tek sayfada ayrıntılı şekilde anlatır.
                                </p>

                                <div className="guide-meta">
                                    <span>Stok</span>
                                    <span>Cari</span>
                                    <span>Fatura</span>
                                    <span>Kasa</span>
                                    <span>Barkod</span>
                                    <span>Mobil Terminal</span>
                                    <span>e-Fatura</span>
                                </div>
                            </div>

                            <div className="guide-hero-logo">Re.</div>
                        </div>
                    </section>

                    {filteredSections.map((section) => (
                        <GuideSection key={section.id} section={section} />
                    ))}

                    {filteredSections.length === 0 && (
                        <section className="guide-section">
                            <h2>Sonuç bulunamadı</h2>
                            <p>Aradığın kelimeyle eşleşen bir kılavuz bölümü bulunamadı.</p>
                        </section>
                    )}

                    <footer className="guide-footer">
                        Re Tech Ön Kobi Muhasebe ve Dijital Çözüm Programı — JSX kullanım kılavuzu.
                    </footer>
                </main>
            </div>

            <style>{guideStyles}</style>
        </>
    );
}

function GuideSection({ section }: { section: GuideSection }) {
    const isSupport = section.id === 'destek';

    return (
        <section className={isSupport ? 'guide-support' : 'guide-section'} id={section.id}>
            <div className="guide-section-kicker">{section.kicker}</div>

            <h2>{section.title}</h2>

            {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
            ))}

            {section.cards && (
                <div className="guide-grid">
                    {section.cards.map((card) => (
                        <div className="guide-card" key={card.title}>
                            <strong>{card.title}</strong>
                            <p>{card.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {section.steps && (
                <div className="guide-steps">
                    {section.steps.map((step) => (
                        <div className="guide-step" key={step.title}>
                            <div>
                                <strong>{step.title}</strong>
                                <span>{step.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {section.table && (
                <div className="guide-table-wrap">
                    <table>
                        <thead>
                            <tr>
                                {section.table.headers.map((header) => (
                                    <th key={header}>{header}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {section.table.rows.map((row) => (
                                <tr key={row.join('-')}>
                                    {row.map((cell) => (
                                        <td key={cell}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {section.note && <div className={`guide-alert ${section.note.type}`}>{section.note.text}</div>}

            {isSupport && (
                <a
                    className="guide-support-link"
                    href="mailto:temasre@aol.com?subject=Re%20Tech%20Destek%20Talebi"
                >
                    temasre@aol.com adresine destek maili gönder
                </a>
            )}
        </section>
    );
}

const guideStyles = `
:root {
    --guide-bg: #f5f6f8;
    --guide-paper: #ffffff;
    --guide-soft: #fafafa;
    --guide-ink: #111827;
    --guide-muted: #6b7280;
    --guide-line: #e5e7eb;
    --guide-black: #0b0b0d;
    --guide-orange: #f97316;
    --guide-orange-soft: #fff7ed;
}

* {
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    margin: 0;
}

.guide-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    background:
        radial-gradient(circle at top right, rgba(249, 115, 22, 0.12), transparent 32rem),
        var(--guide-bg);
    color: var(--guide-ink);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    line-height: 1.7;
}

.guide-sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    background: var(--guide-black);
    color: #ffffff;
    padding: 28px 22px;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.guide-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
}

.guide-brand-logo,
.guide-hero-logo {
    display: grid;
    place-items: center;
    font-weight: 950;
    letter-spacing: -0.1em;
    line-height: 1;
    user-select: none;
}

.guide-brand-logo {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    background: #ffffff;
    color: #0b0b0d;
    font-size: 28px;
}

.guide-brand-title {
    display: block;
    font-size: 18px;
    font-weight: 950;
    letter-spacing: -0.03em;
}

.guide-brand-subtitle {
    display: block;
    margin-top: 3px;
    color: #d1d5db;
    font-size: 12px;
    line-height: 1.35;
}

.guide-search {
    margin: 18px 0 20px;
    padding: 11px 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 15px;
}

.guide-search input {
    width: 100%;
    border: 0;
    outline: none;
    background: transparent;
    color: #ffffff;
    font-size: 13px;
}

.guide-search input::placeholder {
    color: #9ca3af;
}

.guide-toc-title {
    margin: 22px 0 10px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.13em;
    font-size: 11px;
    font-weight: 900;
}

.guide-toc {
    display: grid;
    gap: 4px;
}

.guide-toc a {
    display: block;
    color: #e5e7eb;
    text-decoration: none;
    border-radius: 12px;
    padding: 8px 10px;
    font-size: 13px;
    transition: background 0.18s ease, color 0.18s ease;
}

.guide-toc a:hover {
    background: rgba(249, 115, 22, 0.2);
    color: #ffffff;
}

.guide-actions {
    display: grid;
    gap: 10px;
    margin-top: 24px;
}

.guide-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    min-height: 42px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    font-size: 13px;
    font-weight: 900;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
}

.guide-button.primary {
    background: var(--guide-orange);
    border-color: var(--guide-orange);
    color: #111111;
}

.guide-content {
    width: 100%;
    max-width: 1260px;
    padding: 34px;
}

.guide-hero,
.guide-section,
.guide-support {
    background: var(--guide-paper);
    border: 1px solid var(--guide-line);
    border-radius: 28px;
    margin: 0 0 18px;
    padding: 30px;
    box-shadow: 0 12px 42px rgba(15, 23, 42, 0.055);
}

.guide-hero {
    background:
        radial-gradient(circle at top right, rgba(249, 115, 22, 0.25), transparent 34%),
        #ffffff;
    box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
}

.guide-hero-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 28px;
}

.guide-badge {
    display: inline-flex;
    align-items: center;
    border: 1px solid #fed7aa;
    background: var(--guide-orange-soft);
    color: #9a3412;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 900;
}

.guide-hero h1 {
    max-width: 880px;
    margin: 17px 0 14px;
    font-size: clamp(34px, 5vw, 64px);
    line-height: 0.96;
    letter-spacing: -0.06em;
}

.guide-hero p,
.guide-section p,
.guide-support p {
    margin: 0 0 13px;
    color: #4b5563;
}

.guide-hero p {
    max-width: 880px;
    font-size: 17px;
}

.guide-hero-logo {
    min-width: 118px;
    width: 118px;
    height: 118px;
    border-radius: 30px;
    background: #0b0b0d;
    color: #ffffff;
    font-size: 54px;
    box-shadow: 0 18px 60px rgba(0, 0, 0, 0.16);
}

.guide-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
}

.guide-meta span {
    border: 1px solid var(--guide-line);
    background: rgba(255, 255, 255, 0.75);
    border-radius: 999px;
    padding: 7px 12px;
    color: #374151;
    font-size: 13px;
    font-weight: 800;
}

.guide-section-kicker {
    margin-bottom: 8px;
    color: #9a3412;
    text-transform: uppercase;
    letter-spacing: 0.13em;
    font-size: 11px;
    font-weight: 950;
}

.guide-section h2,
.guide-support h2 {
    margin: 0 0 12px;
    font-size: 28px;
    line-height: 1.16;
    letter-spacing: -0.035em;
}

.guide-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin: 16px 0;
}

.guide-card {
    background: var(--guide-soft);
    border: 1px solid var(--guide-line);
    border-radius: 20px;
    padding: 17px;
}

.guide-card strong {
    display: block;
    margin-bottom: 6px;
    color: #111827;
    font-size: 15px;
}

.guide-card p {
    margin: 0;
    color: #4b5563;
    font-size: 14px;
}

.guide-steps {
    counter-reset: step;
    display: grid;
    gap: 12px;
    margin: 16px 0;
}

.guide-step {
    counter-increment: step;
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
    border: 1px solid var(--guide-line);
    border-radius: 20px;
    background: #ffffff;
    padding: 16px;
}

.guide-step::before {
    content: counter(step);
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: #111111;
    color: #ffffff;
    font-weight: 950;
}

.guide-step strong {
    display: block;
    margin-bottom: 4px;
}

.guide-step span {
    color: #4b5563;
    font-size: 14px;
}

.guide-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--guide-line);
    border-radius: 20px;
    margin: 14px 0;
    background: #ffffff;
}

.guide-table-wrap table {
    width: 100%;
    min-width: 720px;
    border-collapse: collapse;
}

.guide-table-wrap th,
.guide-table-wrap td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--guide-line);
    text-align: left;
    vertical-align: top;
    font-size: 14px;
}

.guide-table-wrap th {
    background: #f9fafb;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 12px;
}

.guide-table-wrap tr:last-child td {
    border-bottom: 0;
}

.guide-alert {
    border: 1px solid;
    border-radius: 20px;
    padding: 15px 16px;
    margin: 14px 0;
    font-weight: 700;
}

.guide-alert.note {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1e3a8a;
}

.guide-alert.warning {
    background: #fffbeb;
    border-color: #fde68a;
    color: #713f12;
}

.guide-alert.success {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #14532d;
}

.guide-alert.danger {
    background: #fef2f2;
    border-color: #fecaca;
    color: #7f1d1d;
}

.guide-support {
    position: relative;
    overflow: hidden;
    background: #0b0b0d;
    color: #ffffff;
}

.guide-support::after {
    content: "";
    position: absolute;
    right: -90px;
    top: -90px;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(249, 115, 22, 0.35), transparent 70%);
    pointer-events: none;
}

.guide-support h2,
.guide-support p,
.guide-support .guide-section-kicker,
.guide-support .guide-support-link {
    position: relative;
    z-index: 1;
}

.guide-support p {
    color: #f3f4f6;
}

.guide-support-link {
    display: inline-flex;
    margin-top: 8px;
    color: #ffffff;
    font-weight: 950;
    text-decoration: underline;
    text-underline-offset: 4px;
}

.guide-footer {
    padding: 16px 0 50px;
    color: #6b7280;
    font-size: 13px;
}

@media (max-width: 1100px) {
    .guide-page {
        grid-template-columns: 1fr;
    }

    .guide-sidebar {
        position: relative;
        height: auto;
    }

    .guide-toc {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .guide-content {
        max-width: none;
        padding: 18px;
    }
}

@media (max-width: 760px) {
    .guide-hero-content {
        flex-direction: column-reverse;
    }

    .guide-hero,
    .guide-section,
    .guide-support {
        padding: 20px;
        border-radius: 21px;
    }

    .guide-toc,
    .guide-grid {
        grid-template-columns: 1fr;
    }

    .guide-hero-logo {
        width: 86px;
        height: 86px;
        min-width: 86px;
        border-radius: 23px;
        font-size: 38px;
    }

    .guide-table-wrap table {
        min-width: 640px;
    }
}

@media print {
    .guide-page {
        display: block;
        background: #ffffff;
    }

    .guide-sidebar {
        display: none;
    }

    .guide-content {
        max-width: none;
        padding: 0;
    }

    .guide-hero,
    .guide-section,
    .guide-support {
        box-shadow: none;
        break-inside: avoid;
    }
}
`;
