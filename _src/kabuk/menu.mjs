// Bilgi mimarisi tek kaynağı (Site Haritası v2.4). Üst menü, çekmece, footer buradan üretilir.
export const anaMenu = [
  { ad: 'Sağlık Araçları', href: 'hesaplayicilar/', ikon: 'fa-toolbox', kalemler: [
    { ad: 'Hesaplayıcılar', alt: '10 araç: BKİ, kalori, su, makro', href: 'hesaplayicilar/', ikon: 'fa-calculator' },
    { ad: 'Sağlık Testleri', alt: '58 test ile alışkanlığını ölç', href: 'saglik-testleri/', ikon: 'fa-clipboard-question' },
    { ad: 'Akıllı Tabak ve Değişim', alt: 'Tabağını kur, muadilini bul', href: 'akilli-tabak-ve-degisim/', ikon: 'fa-chart-pie' },
    { ad: 'Aralıklı Oruç Rehberi', alt: 'Protokolünü ve saatlerini seç', href: 'aralikli-oruc-rehberi/', ikon: 'fa-clock' },
  ] },
  { ad: 'Beslenme', href: 'besin-kutuphanesi/', ikon: 'fa-book-open', kalemler: [
    { ad: 'Besin Kütüphanesi', alt: '541 besinin değeri', href: 'besin-kutuphanesi/', ikon: 'fa-magnifying-glass' },
    { ad: 'Besin Karşılaştır', alt: 'İki besini yan yana gör', href: 'besin-karsilastir/', ikon: 'fa-scale-balanced' },
    { ad: 'Kaç Kalori?', alt: 'Porsiyon karşılıkları', href: 'kac-kalori/', ikon: 'fa-fire' },
    { ad: 'Besin Rehberi', alt: 'Dengeli tabak, öğün, porsiyon', href: 'besin-rehberi/', ikon: 'fa-book-open' },
    { ad: 'İpuçları & Püf Noktaları', alt: '159 ipucu, 277 püf noktası', href: 'ipuclari-ve-puf-noktalari/', ikon: 'fa-lightbulb' },
    { ad: 'Dışarıda Ne Yesem?', alt: 'Dada Gourmet mekanlarını keşfet', href: 'disarida-ne-yesem/', ikon: 'fa-location-dot' },
  ], vitrin: { etiket: 'Rehber', baslik: 'Dengeli bir tabak nasıl kurulur?', href: 'besin-rehberi/', gorsel: 'assets/img/hero/mega-photo-1467453678174-768ec283a940.avif' } },
  { ad: 'Programlar', href: 'programlar/', ikon: 'fa-list-check', kalemler: [
    { ad: 'Program Bul', alt: 'Beş adımda eşleştirme', href: 'programlar/program-bul/', ikon: 'fa-wand-magic-sparkles', sihirbaz: true },
    { ad: 'Hedefe Göre', alt: 'Kilo ver, dengelen, kas yap', href: 'programlar/hedefe-gore/', ikon: 'fa-bullseye' },
    { ad: 'Yaşam Biçimine Göre', alt: 'Aile, öğrenci, sporcu, bitkisel', href: 'programlar/yasam-bicimine-gore/', ikon: 'fa-people-roof' },
    { ad: 'Beslenme Tercihine Göre', alt: 'Akdeniz, bitkisel, aralıklı oruç', href: 'programlar/beslenme-tercihine-gore/', ikon: 'fa-seedling' },
    { ad: 'İhtiyacına Göre', alt: 'Ekonomik, pratik, tok tutan', href: 'programlar/ihtiyacina-gore/', ikon: 'fa-list-check' },
    { ad: 'Süreye Göre', alt: 'Kaç gün, günde ne kadar vakit', href: 'programlar/sureye-gore/', ikon: 'fa-calendar' },
  ], vitrin: { etiket: 'Popüler', baslik: 'Akdeniz Tipi Beslenme: 7 günlük', href: 'programlar/', gorsel: 'assets/img/hero/mega-photo-1540420773420-3366772f4999.jpg' } },
  { ad: 'Diyetisyenler', href: 'diyetisyenler/', ikon: 'fa-user-doctor' },
];

export const footerKolonlar = [
  { ad: 'Sağlık Araçları', kalemler: [['Hesaplayıcılar', 'hesaplayicilar/'], ['Sağlık Testleri', 'saglik-testleri/'], ['Akıllı Tabak ve Değişim', 'akilli-tabak-ve-degisim/'], ['Aralıklı Oruç Rehberi', 'aralikli-oruc-rehberi/'], ['Bana Uygun Olanı Bul', 'bana-uygun-olani-bul/']] },
  { ad: 'Beslenme', kalemler: [['Besin Kütüphanesi', 'besin-kutuphanesi/'], ['Besin Karşılaştır', 'besin-karsilastir/'], ['Kaç Kalori?', 'kac-kalori/'], ['Besin Rehberi', 'besin-rehberi/'], ['İpuçları & Püf Noktaları', 'ipuclari-ve-puf-noktalari/'], ['Makro Rehberi', 'makro-rehberi/']] },
  { ad: 'Uzman Desteği', kalemler: [['Programlar', 'programlar/'], ['Diyetisyenler', 'diyetisyenler/'], ['Diyetisyen Bul', 'diyetisyen-bul-sihirbazi/'], ['Diyetisyen Ol', 'diyetisyen-ol/'], ['Nasıl Çalışır?', 'sayfa/nasil-calisir/'], ['Uzmanla Çalışma Rehberi', 'sayfa/uzmanla-calisma-rehberi/']] },
];
export const footerKurumsal = [['Hakkımızda', 'sayfa/hakkimizda/'], ['Editoryal ve Bilimsel Kurul', 'sayfa/editoryal-kurul/'], ['Künye', 'sayfa/kunye/'], ['İletişim', 'sayfa/iletisim/'], ['Çözüm Merkezi', 'sayfa/cozum-merkezi/'], ['Pro', 'pro/'], ['Reklam Ver', 'reklam-ver/'], ['Marka İş Birlikleri', 'marka-is-birlikleri/']];
export const footerYasal = [['KVKK Aydınlatma Metni', 'yasal/kvkk/'], ['Tüm Yasal Metinler', 'yasal/']];

export const uyeMenu = [
  [['fa-gauge-high', 'Genel Bakış', 'hesabim/'], ['fa-clipboard-list', 'Beslenme Planım', 'hesabim/beslenme-planim/'], ['fa-utensils', 'Günlük Takibim', 'hesabim/gunluk-takibim/'], ['fa-list-check', 'Programlarım', 'hesabim/programlarim/'], ['fa-user-doctor', 'Diyetisyenim', 'hesabim/diyetisyenim/']],
  [['fa-notes-medical', 'Sağlık Dosyam', 'hesabim/saglik-dosyam/'], ['fa-user-shield', 'Veri İzinlerim', 'hesabim/veri-izinlerim/'], ['fa-medal', 'Rozetlerim', 'hesabim/rozetlerim/'], ['fa-user-pen', 'Tercihlerim', 'hesabim/tercihlerim/']],
  [['fa-crown', 'Paketlerim', 'hesabim/paketlerim/'], ['fa-receipt', 'Ödemelerim', 'hesabim/odemelerim/'], ['fa-sliders', 'Hesap Ayarlarım', 'hesabim/ayarlar/'], ['fa-headset', 'Çözüm Merkezi', 'hesabim/cozum-merkezi/']],
];

export const panelMenu = [
  { bolum: 'Danışan İşleri', kalemler: [
    ['genel-bakis', 'fa-gauge-high', 'Genel Bakış', 'diyetisyen-paneli/'],
    ['takvim', 'fa-calendar-check', 'Takvim & Randevular', 'diyetisyen-paneli/takvim/', 4],
    ['danisanlar', 'fa-users', 'Danışanlarım', 'diyetisyen-paneli/danisanlar/'],
    ['planlar', 'fa-clipboard-list', 'Beslenme Planları', 'diyetisyen-paneli/planlar/'],
    ['mesajlar', 'fa-comments', 'Mesajlar', 'diyetisyen-paneli/mesajlar/', 3],
  ] },
  { bolum: 'Profil ve Hizmet', kalemler: [
    ['profil', 'fa-id-badge', 'Profilim', 'diyetisyen-paneli/profil/'],
    ['paketler', 'fa-box-open', 'Hizmet Paketlerim', 'diyetisyen-paneli/hizmet-paketleri/'],
    ['musaitlik', 'fa-clock', 'Müsaitlik', 'diyetisyen-paneli/musaitlik/'],
    ['kazanclar', 'fa-wallet', 'Kazançlarım', 'diyetisyen-paneli/kazanclar/'],
  ] },
];
