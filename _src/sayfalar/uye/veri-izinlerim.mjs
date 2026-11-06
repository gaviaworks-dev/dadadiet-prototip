import { uyeSayfa, bolumBas, kart, ayarSatir, anahtar, dugme, modal, tablo, secim } from '../../parcalar/uye/ust.mjs';

const aktif = `<div class="yigin">
${bolumBas({ etiket: 'Varsayılan: kapalı', ikon: 'fa-shield-halved', baslik: 'Veri paylaşım izinlerin', metin: 'Sağlık verilerin sen izin vermeden kimseyle paylaşılmaz; verdiğin izni istediğin an geri çekebilirsin.' })}
${kart({
    ikon: 'fa-heart-pulse', baslik: 'Sağlık verisi paylaşımı', metin: 'Kapattığında bütün erişimler anında durur.', bosluksuz: true,
    sag: '<div class="as-eylem"><span id="viOzet"></span></div>',
    govde: `<div class="ayar-liste">${ayarSatir({ ikon: 'fa-power-off', baslik: 'Sağlık verisi paylaşımına genel izin', metin: 'Açıkken aşağıda seçtiğin veri türleri diyetisyenine açılır.', sag: anahtar('genel', 'Sağlık verisi paylaşımına genel izin', false, ' id="viGenel"') })}</div>`,
  })}
${kart({
    ikon: 'fa-sliders', baslik: 'Veri türü izinleri', metin: 'Her tür ayrı açılır; değişiklik anında kaydedilir ve diyetisyen paneline yansır.', bosluksuz: true,
    govde: '<div class="ayar-liste" id="viTurler"></div>',
    alt: dugme('Bütün izinleri geri çek', { sinif: 'hayalet tehlike', ikon: 'fa-ban', ek: ' data-ac="#viGeriCek"' }),
  })}
</div>`;

const erisim = `<div class="yigin">
${bolumBas({ etiket: 'Yürürlükte', ikon: 'fa-user-doctor', baslik: 'Diyetisyen erişimleri', metin: 'Verilerine şu an kimin, hangi kapsamda ve ne kadar süreyle eriştiği.', arac: dugme('Yeni izin ver', { sinif: 'birincil', ikon: 'fa-plus', ek: ' data-ac="#viYeni"' }) })}
${kart({ ikon: 'fa-user-check', baslik: 'Yürürlükteki erişimler', bosluksuz: true, govde: '<div class="ayar-liste" id="viErisim"></div>' })}
</div>`;

const belge = `<div class="yigin">
${bolumBas({ etiket: 'Belgelerin', ikon: 'fa-file-shield', baslik: 'Paylaşılan belgeler', metin: 'Belge bazında paylaşımı aç ya da kapat. Kapalı belgeyi diyetisyenin görmez.' })}
${kart({ ikon: 'fa-folder-open', baslik: 'Belge paylaşım durumu', bosluksuz: true, govde: '<div class="ayar-liste" id="viBelgeler"></div>' })}
</div>`;

const olcum = `<div class="yigin">
${bolumBas({ etiket: 'Ölçümlerin', ikon: 'fa-weight-scale', baslik: 'Paylaşılan ölçümler', metin: 'Diyetisyeninin vücut ölçümlerinde gördüğü aralık.' })}
${kart({ ikon: 'fa-eye', baslik: 'Diyetisyeninin gördüğü aralık', form: ' data-ayar-form="olcumAralik" data-mesaj="Görünür aralık kaydedildi."', govde: secim({ ad: 'aralik', etiket: 'Görünür ölçüm aralığı', secenekler: ['Bütün ölçümler', 'Son 3 ay', 'Son 1 ay'] }), alt: dugme('Kaydet', { sinif: 'birincil', tur: 'submit' }) })}
${kart({ ikon: 'fa-table-list', baslik: 'Ölçüm ölçüm görünürlük', bosluksuz: true, govde: tablo({ id: 'viOlcumler', etiket: 'Ölçümler ve görünürlük durumları', basliklar: ['Tarih', ['Kilo', 'sag'], ['Bel', 'sag'], ['Yağ oranı', 'sag'], ['Görünürlük', 'dar-kolon']] }) })}
</div>`;

const dolan = `<div class="yigin">
${bolumBas({ etiket: 'Arşiv', ikon: 'fa-hourglass-end', baslik: 'Süresi dolan izinler', metin: 'Geri çektiğin ya da süresi dolan izinlerin kaydı.' })}
${kart({ ikon: 'fa-clock-rotate-left', baslik: 'Kapanmış izin kaydı', bosluksuz: true, govde: tablo({ id: 'viDolan', etiket: 'Kapanmış izinler', basliklar: [['Tarih', 'dar-kolon'], 'İzin', ['Durum', 'dar-kolon']] }) })}
</div>`;

const gecmis = `<div class="yigin">
${bolumBas({ etiket: 'Erişim kaydı', ikon: 'fa-clock-rotate-left', baslik: 'Erişim geçmişin', metin: 'Verilerine yapılan her erişim ve senin izin hareketlerin burada kayıtlıdır.' })}
${kart({ ikon: 'fa-eye', baslik: 'Erişim kaydı', metin: 'Kim, ne zaman, hangi veriye erişti.', bosluksuz: true, govde: tablo({ id: 'viKayit', etiket: 'Veri erişim kaydı', basliklar: [['Tarih', 'dar-kolon'], ['Erişen', 'dar-kolon'], 'Veri türü', ['İşlem', 'dar-kolon']] }) })}
${kart({ ikon: 'fa-sliders', baslik: 'Senin izin hareketlerin', bosluksuz: true, govde: tablo({ id: 'viHareket', etiket: 'İzin hareketleri', basliklar: [['Tarih', 'dar-kolon'], ['Hareket', 'sol']] }) })}
${kart({
    ikon: 'fa-scale-balanced', baslik: 'Verilerin üzerindeki hakların', metin: 'KVKK kapsamındaki taleplerin tek yerden başlar.', bosluksuz: true,
    govde: `<div class="ayar-liste">${ayarSatir({ ikon: 'fa-download', baslik: 'Verilerimi indir', metin: 'Erişim kaydın dahil bütün verilerin tek arşivde iner.', sag: `<span class="as-eylem">${dugme('Verilerimi indir', { sinif: 'hayalet kucuk', ek: ' id="viIndir"' })}</span>` })}${ayarSatir({ ikon: 'fa-eraser', baslik: 'Verilerimin silinmesini iste', metin: 'Talebin kimliğin doğrulandıktan sonra işleme alınır.', sag: `<span class="as-eylem">${dugme('Silme talebi oluştur', { sinif: 'hayalet tehlike kucuk', ek: ' id="viSil"' })}</span>` })}</div>`,
  })}
</div>`;

const sonEk = modal({
  id: 'viGeriCek', baslik: 'Bütün izinleri geri çek',
  govde: '<div class="okuma"><p>Diyetisyenin ölçüm, tahlil, günlük takip, belge ve sağlık profiline erişemez. Erişimi istediğin zaman yeniden açabilirsin.</p></div>',
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('İzinleri geri çek', { sinif: 'tehlike', ek: ' id="viGeriCekOnay"' }),
}) + modal({
  id: 'viYeni', baslik: 'Yeni izin ver', form: ' id="viYeniForm"',
  govde: `${secim({ ad: 'tur', etiket: 'Veri türü', secenekler: [] })}${secim({ ad: 'sure', etiket: 'İzin süresi', secenekler: ['30 gün', '90 gün', 'Ben geri çekene kadar'] })}`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('İzni ver', { sinif: 'birincil', tur: 'submit' }),
});

export default () => [uyeSayfa({
  yol: 'hesabim/veri-izinlerim', ad: 'Veri İzinlerim', muhur: 'Veri izinlerin · kişisel alanın', ikon: 'fa-user-shield',
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
