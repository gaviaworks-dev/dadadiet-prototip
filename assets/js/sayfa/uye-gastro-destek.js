/* Destek talepleri: Çözüm Merkezi ve talep detayı aynı kaydı okur */
(function () {
  'use strict';
  const U = window.DDU, G = window.DDG;
  const t = (no, baslik, konu, durum, tarih, soru, yanit, son) => ({ no, baslik, konu, durum, tarih, mesajlar: [{ kimden: 'uye', tarih, metin: soru }].concat(yanit ? [{ kimden: 'destek', tarih: U.gunEkle(tarih, 1), metin: yanit }] : []).concat(son ? [{ kimden: 'uye', tarih: U.gunEkle(tarih, 2), metin: son }] : []) });
  G.talepler = () => (G.bos ? [] : U.yerel('destekTalepleri', [
    t('DD-2026-01000G', 'Paket ödemem geçti ama görüşme hakkım geç göründü', 'Ödeme sorunu', 'cozulen', '2026-11-02', 'Karma Dönüşüm paketimde görüşme hakkım ödemeden bir gün sonra göründü.', 'Hakkın hesabına işlendi. Yeniden giriş yaptığında güncel sayıyı görürsün.'),
    t('DD-2026-01000F', 'Günlük takipte öğün girişi kaydedilmiyor', 'Günlük takip', 'acik', '2026-10-30', 'Akşam öğününü işaretliyorum ama sayfayı yenileyince işaret kalkıyor.'),
    t('DD-2026-01000E', 'Bana önerilen program planıma eklenmedi', 'Program sorunu', 'yanit', '2026-10-27', 'Test sonrası önerilen programı başlattım, Beslenme Planım’da göremiyorum.', 'Program başlatıldı görünüyor. Hangi cihazdan girdiğini yazar mısın?'),
    t('DD-2026-01000D', 'Öğün geçmişimde iki günlük boşluk görünüyor', 'Günlük takip', 'yanit', '2026-10-24', '21 ve 22 Ekim günlerinin kayıtları görünmüyor.', 'Bu günlerde kayıt girilmiş mi, ekran görüntüsü ekleyebilir misin?'),
    t('DD-2026-01000C', 'Rozetim tamamlandığı hâlde düşmedi', 'Teknik sorun', 'acik', '2026-10-21', 'Otuz gün rozetinin koşulunu tamamladım, rozet hesabıma gelmedi.'),
    t('DD-2026-01000B', 'Fatura adresimi güncellemek istiyorum', 'Fatura talebi', 'kapali', '2026-10-16', 'Fatura adresim eski kalmış, nasıl güncellerim?', 'Ödemelerim › Faturalar sekmesindeki Fatura Bilgilerim’den güncelleyebilirsin.'),
    t('DD-2026-01000A', 'Diyetisyen randevumu ertelemek istiyorum', 'Diyetisyen ve randevu', 'yanit', '2026-10-13', '10 Kasım randevumu bir hafta ertelemek istiyorum.', 'Talebi Randevularım sekmesinden açabilirsin; diyetisyenin onayına düşer.'),
    t('DD-2026-010009', 'Randevum takvimde iki kez göründü', 'Diyetisyen ve randevu', 'kapali', '2026-10-06', 'Aynı randevu takvimimde iki kez görünüyor.', 'Çift kayıt silindi, teşekkürler.'),
    t('DD-2026-010008', 'Bildirim tercihlerim her girişte sıfırlanıyor', 'Hesap sorunu', 'kapali', '2026-09-30', 'E-posta bildirimlerini kapatıyorum, tekrar girince açık geliyor.', 'Tarayıcının site verilerini temizlemesi sebep olabilir. Düzelme olmazsa yeniden yaz.'),
    t('DD-2026-010007', 'Besin kütüphanesinde süzgeç boş sonuç döndürüyor', 'Teknik sorun', 'kapali', '2026-09-22', 'Kategori süzgeci seçince liste boş kalıyor.', 'Sorun giderildi, teşekkürler.'),
    t('DD-2026-010006', 'Ek görüşme ödemem iki kez çekildi', 'Ödeme sorunu', 'cozulen', '2026-09-12', 'Ek görüşme ücreti kartımdan iki kez çekildi görünüyor.', 'Mükerrer provizyon iade edildi; bankana göre birkaç gün içinde düşer.'),
  ]));
  G.TK = { acik: ['Açık talep', 'acik', 'fa-inbox'], yanit: ['Yanıt bekleyen', 'bekleyen', 'fa-reply'], cozulen: ['Çözülen', 'cozulen', 'fa-circle-check'], kapali: ['Kapatılan', 'kapali', 'fa-lock'] };
  G.tkHap = (d) => U.durum(G.TK[d][1], G.TK[d][0]);
  G.tkSon = (x) => x.mesajlar[x.mesajlar.length - 1].tarih;
})();
