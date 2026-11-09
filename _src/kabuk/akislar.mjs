// Ekran haritasındaki tıklanabilir akışlar. Adımlar tasks/akislar.md ile aynıdır.
export const akislar = [
  { grup: 'Üye akışları', liste: [
    { ad: 'Kayıttan günlük takibe', adimlar: [
      ['Kayıt ol', 'kayit/'], ['Onboarding sihirbazı', 'hesabim/hos-geldin/'], ['Program seç', 'hesabim/program-baslat/?program=akdeniz-tipi-beslenme'],
      ['Programlarım', 'hesabim/programlarim/'], ['Bugünün öğünleri', 'hesabim/beslenme-planim/#ogun'], ['Günlük Takibim', 'hesabim/gunluk-takibim/'] ] },
    { ad: 'Diyetisyenden plana', adimlar: [
      ['Diyetisyen Bul', 'diyetisyen-bul-sihirbazi/'], ['Uzman profili', 'diyetisyen/dyt-ece-tunali/'], ['Paket al', 'hesabim/odeme/?paket=p1'],
      ['Randevu', 'hesabim/diyetisyenim/?paket=p1#randevu'], ['Diyetisyenim', 'hesabim/diyetisyenim/'], ['Beslenme Planım', 'hesabim/beslenme-planim/'] ] },
    { ad: 'Tahlilden diyetisyen notuna', adimlar: [
      ['Tahlil yükle', 'hesabim/saglik-dosyam/#tahlil'], ['Diyetisyene izin ver', 'hesabim/veri-izinlerim/'], ['Diyetisyen notu', 'hesabim/saglik-dosyam/#not'] ] },
  ] },
  { grup: 'Diyetisyen akışları', liste: [
    { ad: 'İş günü', adimlar: [
      ['Yeni talep, kabul', 'diyetisyen-paneli/'], ['İlk randevu', 'diyetisyen-paneli/danisanlar/d13/'], ['Görüşme ve anamnez', 'diyetisyen-paneli/takvim/'],
      ['Tahlil ve izin iste', 'diyetisyen-paneli/danisanlar/d1/'], ['Plan oluştur', 'diyetisyen-paneli/planlar/olustur/?danisan=d1'], ['Mesaj ve kontrol', 'diyetisyen-paneli/mesajlar/?danisan=d1'], ['Kazançlar ve ödeme', 'diyetisyen-paneli/kazanclar/'] ] },
    { ad: 'Plan oluşturucu', adimlar: [
      ['Plan listesi', 'diyetisyen-paneli/planlar/'], ['Tam dolu plan', 'diyetisyen-paneli/planlar/olustur/?plan=pl3'], ['Yarım plan', 'diyetisyen-paneli/planlar/olustur/?plan=pl6'],
      ['Şablondan başla', 'diyetisyen-paneli/planlar/olustur/?sablon=s5&danisan=d1'], ['Üyede gör', 'hesabim/beslenme-planim/'], ['Plan geçmişi', 'diyetisyen-paneli/danisanlar/d1/?sekme=plan'] ] },
    { ad: 'Profil durumu', adimlar: [
      ['İncelemede', 'diyetisyen-paneli/profil/?durum=onay-bekliyor'], ['Revizyon istendi', 'diyetisyen-paneli/profil/?durum=eksik-belge'], ['Onaylandı', 'diyetisyen-paneli/profil/?durum=onayli'], ['Public önizleme', 'diyetisyen/dyt-ece-tunali/?onizleme=1'] ] },
  ] },
];
