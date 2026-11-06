import { uyeSayfa, bolumBas, kart, dugme, tablo, modal, secim } from '../../parcalar/uye/ust.mjs';

const sekmeler = [
  { id: 'abonelik', ad: 'Abonelik Ödemeleri', ikon: 'fa-crown', govde: `<div class="yigin">
${bolumBas({ etiket: 'Paket aboneliği', ikon: 'fa-crown', baslik: 'Aktif aboneliğin', metin: 'Kademen ve dönem tarihlerin. Kademelerin içeriği Paketlerim sayfasında.' })}
<div class="paket-karti"><div class="paket-bas"><span class="paket-rozet ucretsiz"><i class="fa-solid fa-user" aria-hidden="true"></i> Ücretsiz</span><div class="paket-bilgi"><b>Dada Diet Ücretsiz <span class="durum-hapi kucuk-ikonlu cozulen"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Etkin</span></b><span class="paket-yenileme"><i class="fa-solid fa-infinity" aria-hidden="true"></i> Tahsilat yapılmaz, iptal edilecek bir abonelik yok.</span></div><div class="paket-fiyat"><b>₺0</b><span>/ ay</span></div></div><div class="paket-eylemler">${dugme('Pro’ya Yükselt', { sinif: 'birincil', ikon: 'fa-bolt', href: 'pro/' })}${dugme('Kademeleri Karşılaştır', { href: 'hesabim/paketler/#karsilastir' })}</div></div>
</div>` },
  { id: 'hizmet', ad: 'Hizmet / Uzman Ödemeleri', ikon: 'fa-user-doctor', govde: `<div class="yigin">
${bolumBas({ etiket: 'Diyetisyen ödemeleri', ikon: 'fa-user-doctor', baslik: 'Diyetisyene ödediklerin', metin: 'Satın aldığın görüşme hakları ve seans tahsilatların.' })}
${kart({ bosluksuz: true, govde: tablo({ id: 'odHizmet', etiket: 'Diyetisyen tahsilatları', basliklar: [['Tarih', 'dar-kolon'], 'Açıklama', ['Tutar', 'dar-kolon sag'], ['Durum', 'dar-kolon']] }) })}
</div>` },
  { id: 'faturalar', ad: 'Faturalar', ikon: 'fa-file-invoice', govde: `<div class="yigin">
${bolumBas({ etiket: 'Fatura defteri', ikon: 'fa-file-invoice', baslik: 'Faturaların', metin: 'Kesilen faturalar ve ayrıntıları.' })}
${kart({ bosluksuz: true, govde: tablo({ id: 'odFatura', etiket: 'Faturalar', basliklar: [['Fatura no', 'dar-kolon'], ['Tarih', 'dar-kolon'], 'Açıklama', ['Tutar', 'dar-kolon sag'], ['İşlem', 'dar-kolon']] }) })}
</div>` },
  { id: 'kartlar', ad: 'Kayıtlı Kartlar', ikon: 'fa-credit-card', govde: `<div class="yigin">
${bolumBas({ etiket: 'Kartların', ikon: 'fa-credit-card', baslik: 'Kayıtlı kartların', metin: 'Kart bilgisi Dada Diet’te tutulmaz; ödeme kuruluşunda saklanır.' })}
${kart({ bosluksuz: true, govde: '<div id="odKartlar"></div>' })}
</div>` },
  { id: 'iade', ad: 'İade Talepleri', ikon: 'fa-rotate-left', govde: `<div class="yigin">
${bolumBas({ etiket: 'İadeler', ikon: 'fa-rotate-left', baslik: 'İade talepleri', metin: 'Bir tahsilat için iade talebi aç, durumunu buradan izle.' })}
${kart({ ikon: 'fa-list', baslik: 'Taleplerin', bosluksuz: true, govde: tablo({ id: 'odIadeler', etiket: 'İade talepleri', basliklar: [['Tarih', 'dar-kolon'], 'Tahsilat', ['Neden', 'dar-kolon'], ['Durum', 'dar-kolon']] }) })}
${kart({
    ikon: 'fa-pen-to-square', baslik: 'Yeni iade talebi', form: ' id="odIadeForm"',
    govde: `<div class="alan-izgara c2"><div class="alan"><label class="alan-etiket" for="odTahsilat">İade istediğin tahsilat <span class="zorunlu">*</span></label><select class="alan-secim" id="odTahsilat" required></select></div>${secim({ ad: 'odNeden', etiket: 'İade nedeni', secenekler: ['Hizmeti almadım', 'Yanlış tahsilat', 'Çift tahsilat', 'Görüşme iptal edildi', 'Hizmetten memnun kalmadım', 'Diğer'] })}</div><div class="alan"><label class="alan-etiket" for="odAciklama">Açıklama <span class="zorunlu">*</span></label><textarea class="alan-metin" id="odAciklama" rows="3" maxlength="600" required></textarea></div>`,
    alt: dugme('Talebi Gönder', { sinif: 'birincil', tur: 'submit' }),
  })}
</div>` },
];

const sonEk = modal({
  id: 'odDetay', baslik: 'Fatura detayı',
  govde: '<dl class="kunye" id="odDetayGovde"></dl>',
  ayak: dugme('Yazdır', { ikon: 'fa-print', ek: ' id="odYazdir"' }) + dugme('Kapat', { sinif: 'birincil', ek: ' data-kapat' }),
});

export default () => [uyeSayfa({
  yol: 'hesabim/odemelerim', ad: 'Ödemelerim', muhur: 'Ödemelerin · kişisel alanın', ikon: 'fa-receipt',
  giris: 'Abonelik, diyetisyen ödemeleri, faturalar, kartlar ve iade talepleri tek adreste.',
  grup: 'od', sekmeler, sonEk, js: ['assets/js/sayfa/uye-odemelerim.js'],
})];
