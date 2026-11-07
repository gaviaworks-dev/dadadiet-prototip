import { uyeSayfa, bolumBas, kart, ayarSatir, anahtar, dugme, modal, tablo, secim } from '../../parcalar/uye/ust.mjs';

const aktif = `<div class="yigin">
<div id="viIstek"></div>
${bolumBas({ etiket: 'Varsayılan: kapalı', ikon: 'fa-shield-halved', baslik: 'Veri Paylaşım İzinlerin', metin: 'Sağlık verilerin sen izin vermeden kimseyle paylaşılmaz; verdiğin izni istediğin an geri çekebilirsin.' })}
${kart({
    ikon: 'fa-heart-pulse', baslik: 'Sağlık Verisi Paylaşımı', metin: 'Kapattığında bütün erişimler anında durur.', bosluksuz: true,
    sag: '<div class="as-eylem"><span id="viOzet"></span></div>',
    govde: `<div class="ayar-liste">${ayarSatir({ ikon: 'fa-power-off', baslik: 'Sağlık verisi paylaşımına genel izin', metin: 'Açıkken aşağıda seçtiğin veri türleri diyetisyenine açılır.', sag: anahtar('genel', 'Sağlık verisi paylaşımına genel izin', false, ' id="viGenel"') })}</div>`,
  })}
${kart({
    ikon: 'fa-sliders', baslik: 'Veri Türü İzinleri', metin: 'Her tür ayrı açılır; değişiklik anında kaydedilir ve diyetisyen paneline yansır.', bosluksuz: true,
    govde: '<div class="ayar-liste" id="viTurler"></div>',
    alt: dugme('Bütün İzinleri Geri Çek', { sinif: 'hayalet tehlike', ikon: 'fa-ban', ek: ' data-ac="#viGeriCek"' }),
  })}
</div>`;

const erisim = `<div class="yigin">
${bolumBas({ etiket: 'Yürürlükte', ikon: 'fa-user-doctor', baslik: 'Diyetisyen Erişimleri', metin: 'Verilerine şu an kimin, hangi kapsamda ve ne kadar süreyle eriştiği.', arac: dugme('Yeni İzin Ver', { sinif: 'birincil', ikon: 'fa-plus', ek: ' data-ac="#viYeni"' }) })}
${kart({ ikon: 'fa-user-check', baslik: 'Yürürlükteki Erişimler', bosluksuz: true, govde: '<div class="ayar-liste" id="viErisim"></div>' })}
</div>`;

const belge = `<div class="yigin">
${bolumBas({ etiket: 'Belgelerin', ikon: 'fa-file-shield', baslik: 'Paylaşılan Belgeler', metin: 'Belge bazında paylaşımı aç ya da kapat. Kapalı belgeyi diyetisyenin görmez.' })}
${kart({ ikon: 'fa-folder-open', baslik: 'Belge Paylaşım Durumu', bosluksuz: true, govde: '<div class="ayar-liste" id="viBelgeler"></div>' })}
</div>`;

const olcum = `<div class="yigin">
${bolumBas({ etiket: 'Ölçümlerin', ikon: 'fa-weight-scale', baslik: 'Paylaşılan Ölçümler', metin: 'Diyetisyeninin vücut ölçümlerinde gördüğü aralık.' })}
${kart({ ikon: 'fa-eye', baslik: 'Diyetisyeninin Gördüğü Aralık', form: ' data-ayar-form="olcumAralik" data-mesaj="Görünür aralık kaydedildi."', govde: secim({ ad: 'aralik', etiket: 'Görünür ölçüm aralığı', secenekler: ['Bütün ölçümler', 'Son 3 ay', 'Son 1 ay'] }), alt: dugme('Kaydet', { sinif: 'birincil', tur: 'submit' }) })}
${kart({ ikon: 'fa-table-list', baslik: 'Ölçüm Ölçüm Görünürlük', bosluksuz: true, govde: tablo({ id: 'viOlcumler', etiket: 'Ölçümler ve görünürlük durumları', basliklar: ['Tarih', ['Kilo', 'sag'], ['Bel', 'sag'], ['Yağ oranı', 'sag'], ['Görünürlük', 'dar-kolon']] }) })}
</div>`;

const dolan = `<div class="yigin">
${bolumBas({ etiket: 'Arşiv', ikon: 'fa-hourglass-end', baslik: 'Süresi Dolan İzinler', metin: 'Geri çektiğin ya da süresi dolan izinlerin kaydı.' })}
${kart({ ikon: 'fa-clock-rotate-left', baslik: 'Kapanmış İzin Kaydı', bosluksuz: true, govde: tablo({ id: 'viDolan', etiket: 'Kapanmış izinler', basliklar: [['Tarih', 'dar-kolon'], 'İzin', ['Durum', 'dar-kolon']] }) })}
</div>`;

const gecmis = `<div class="yigin">
${bolumBas({ etiket: 'Erişim Kaydı', ikon: 'fa-clock-rotate-left', baslik: 'Erişim Geçmişin', metin: 'Verilerine yapılan her erişim ve senin izin hareketlerin burada kayıtlıdır.' })}
${kart({ ikon: 'fa-eye', baslik: 'Erişim Kaydı', metin: 'Kim, ne zaman, hangi veriye erişti.', bosluksuz: true, govde: tablo({ id: 'viKayit', etiket: 'Veri erişim kaydı', basliklar: [['Tarih', 'dar-kolon'], ['Erişen', 'dar-kolon'], 'Veri türü', ['İşlem', 'dar-kolon']] }) })}
${kart({ ikon: 'fa-sliders', baslik: 'Senin İzin Hareketlerin', bosluksuz: true, govde: tablo({ id: 'viHareket', etiket: 'İzin hareketleri', basliklar: [['Tarih', 'dar-kolon'], ['Hareket', 'sol']] }) })}
${kart({
    ikon: 'fa-scale-balanced', baslik: 'Verilerin Üzerindeki Hakların', metin: 'KVKK kapsamındaki taleplerin tek yerden başlar.', bosluksuz: true,
    govde: `<div class="ayar-liste">${ayarSatir({ ikon: 'fa-download', baslik: 'Verilerimi indir', metin: 'Erişim kaydın dahil bütün verilerin tek arşivde iner.', sag: `<span class="as-eylem">${dugme('Verilerimi indir', { sinif: 'hayalet kucuk', ek: ' id="viIndir"' })}</span>` })}${ayarSatir({ ikon: 'fa-eraser', baslik: 'Verilerimin silinmesini iste', metin: 'Talebin kimliğin doğrulandıktan sonra işleme alınır.', sag: `<span class="as-eylem">${dugme('Silme talebi oluştur', { sinif: 'hayalet tehlike kucuk', ek: ' id="viSil"' })}</span>` })}</div>`,
  })}
</div>`;

const sonEk = modal({
  id: 'viGeriCek', baslik: 'Bütün İzinleri Geri Çek',
  govde: '<div class="okuma"><p>Diyetisyenin ölçüm, tahlil, günlük takip, belge ve sağlık profiline erişemez. Erişimi istediğin zaman yeniden açabilirsin.</p></div>',
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('İzinleri geri çek', { sinif: 'tehlike', ek: ' id="viGeriCekOnay"' }),
}) + modal({
  id: 'viYeni', baslik: 'Yeni İzin Ver', form: ' id="viYeniForm"',
  govde: `${secim({ ad: 'tur', etiket: 'Veri türü', secenekler: [] })}${secim({ ad: 'sure', etiket: 'İzin süresi', secenekler: ['30 gün', '90 gün', 'Ben geri çekene kadar'] })}`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('İzni ver', { sinif: 'birincil', tur: 'submit' }),
});

export default () => [uyeSayfa({
  yol: 'hesabim/veri-izinlerim', ad: 'Veri İzinlerim',
  giris: 'Sağlık verilerinin hangi kapsamda ve ne kadar süreyle paylaşılacağını buradan yönetirsin.',
  grup: 'vi',
  sekmeler: [
    { id: 'aktif', ad: 'Aktif İzinler', ikon: 'fa-shield-halved', govde: aktif },
    { id: 'erisim', ad: 'Diyetisyen Erişimleri', ikon: 'fa-user-doctor', govde: erisim },
    { id: 'belge', ad: 'Paylaşılan Belgeler', ikon: 'fa-file-shield', govde: belge },
    { id: 'olcum', ad: 'Paylaşılan Ölçümler', ikon: 'fa-weight-scale', govde: olcum },
    { id: 'dolan', ad: 'Süresi Dolan İzinler', ikon: 'fa-hourglass-end', govde: dolan },
    { id: 'gecmis', ad: 'Erişim Geçmişi', ikon: 'fa-clock-rotate-left', govde: gecmis },
  ],
  sonEk, js: ['assets/js/sayfa/uye-veri-izinlerim.js'],
})];
