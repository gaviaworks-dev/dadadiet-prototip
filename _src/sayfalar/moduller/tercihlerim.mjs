// Tercihlerim: yalnız onboarding setinin düzenlenmesi + bildirim ve birim ayarları. Kabuk: tasks/uye-kabuk.md.
import { uyeKabuk } from '../../parcalar/uye/kabuk.mjs';
import { kart, ayarSatir, anahtar, dugme, modal } from '../../parcalar/uye/ust.mjs';

const bildirimler = [
  ['takip_uygulama', 'fa-utensils', 'Öğün hatırlatması', 'Öğün girmediğin günlerde akşam hatırlatması.', true],
  ['su_uygulama', 'fa-droplet', 'Su hatırlatması', 'Günlük su hedefine ulaşmadığında hatırlatma.', true],
  ['oruc_uygulama', 'fa-hourglass-half', 'Oruç penceresi hatırlatması', 'Yeme penceren açılmadan ve kapanmadan önce haber verir.', false],
  ['rapor_eposta', 'fa-chart-line', 'Haftalık özet', 'Pazar akşamı e-postayla öğün, su ve ölçüm özeti.', true],
];
const birimler = [
  ['agirlik', 'fa-weight-scale', 'Ağırlık', 'Kilon ve hedef kilonda kullanılır.', [['Kilogram (kg)', 'kg'], ['Pound (lb)', 'lb']]],
  ['boy', 'fa-ruler-vertical', 'Boy', 'Boyunda kullanılır.', [['Santimetre (cm)', 'cm'], ['İnç (inç)', 'inç']]],
  ['enerji', 'fa-fire', 'Enerji', 'Günlük hedefinde kullanılır.', [['Kilokalori (kcal)', 'kcal'], ['Kilojul (kJ)', 'kJ']]],
];
// Saat başı hatırlatmanın sessiz aralığı tam saatlerden seçilir. Değer 23:00, görünen 23.00.
const saatSecim = (id, etiket) => `<select class="alan-secim" id="${id}" aria-label="${etiket}">${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((s) => `<option value="${s}:00">${s}.00</option>`).join('')}</select>`;
const suSatiri = `<div class="ayar-satir sarmali"><span class="as-ikon"><i class="fa-solid fa-droplet" aria-hidden="true"></i></span><div class="as-metin"><b>Su hatırlatması</b><span id="suSessizMetin"></span></div><div class="as-eylem"><div class="saat-aralik">${saatSecim('suSessizBas', 'Sessiz saatlerin başlangıcı')}<span aria-hidden="true">–</span>${saatSecim('suSessizBit', 'Sessiz saatlerin bitişi')}</div>${anahtar('su_saat_basi', 'Su hatırlatması', false, ' id="suHatirlatma"')}</div></div>`;
const segment = ([ad, , etiket, , l]) => `<div class="segment" role="group" aria-label="${etiket} birimi" data-birim="${ad}">${l.map(([d, k], i) => `<button type="button" data-deger="${d}" aria-pressed="${i === 0}">${k}</button>`).join('')}</div>`;

const govde = `<div class="yigin">
${kart({ ikon: 'fa-bullseye', baslik: 'Hedefin', bosluksuz: true, govde: '<div class="ayar-liste" data-kart="hedef"></div>' })}
${kart({ ikon: 'fa-person-walking', baslik: 'Ölçülerin ve hareketin', metin: 'Enerji ihtiyacın bu değerlerle hesaplanır.', bosluksuz: true, govde: '<div class="ayar-liste" data-kart="olcu"></div>' })}
${kart({ ikon: 'fa-seedling', baslik: 'Beslenme ve öğün ritmin', bosluksuz: true, govde: '<div class="ayar-liste" data-kart="ritim"></div>' })}
${kart({
    ikon: 'fa-notes-medical', baslik: 'Sağlık verilerin', metin: 'Yalnız açık rızanla işlenir, rızanı istediğin an geri alabilirsin.', bosluksuz: true,
    govde: `<div class="ayar-liste">${ayarSatir({ ikon: 'fa-file-signature', baslik: 'Sağlık verisi açık rızası', metin: 'Hassasiyetlerinin önerilerde kullanılmasına izin verir.', sag: anahtar('kvkk_riza', 'Sağlık verisi açık rızası', false, ' id="rizaAnahtar"') })}</div><div class="ayar-liste" data-kart="saglik"></div>`,
  })}
${kart({ ikon: 'fa-gauge-high', baslik: 'Günlük hedefin', metin: 'Bir diyetisyenle çalışıyorsan planındaki değerler esastır.', govde: '<div id="gunlukHedef"></div>' })}
${kart({
    ikon: 'fa-bell', baslik: 'Bildirimler', metin: 'Tüm kanallar Hesap Ayarları içinde.', bosluksuz: true,
    sag: dugme('Tümünü yönet', { sinif: 'hayalet kucuk', href: 'hesabim/ayarlar/#bildirim' }),
    govde: `<div class="ayar-liste">${bildirimler.map(([ad, ikon, b, m, acik]) => (ad === 'su_uygulama' ? suSatiri : ayarSatir({ ikon, baslik: b, metin: m, sag: anahtar(ad, b, acik, ` data-bildirim="${ad}"`) }))).join('')}</div>`,
  })}
${kart({ ikon: 'fa-ruler', baslik: 'Birimler', metin: 'Değerler bu birimlerle gösterilir.', bosluksuz: true, govde: `<div class="ayar-liste">${birimler.map((b) => ayarSatir({ ikon: b[1], baslik: b[2], metin: b[3], sag: `<div class="as-eylem">${segment(b)}</div>` })).join('')}</div>` })}
${kart({
    ikon: 'fa-rotate-left', baslik: 'Tercihlerimi sıfırla', metin: 'Boy ve kilo dışındaki bütün cevapların silinir.', sinif: 'tehlike-kart',
    govde: `<label class="onay-kutusu"><input type="checkbox" id="sifirlaOnay"><span>Tercihlerimin sıfırlanacağını anladım.</span></label>`,
    alt: dugme('Tercihlerimi sıfırla', { sinif: 'tehlike', ikon: 'fa-rotate-left', ek: ' id="sifirla" disabled' }),
  })}
</div>`;

const duzenle = modal({ id: 'tercihModal', baslik: '<span id="tercihModalBaslik">Düzenle</span>', govde: '<div id="tercihModalGovde"></div>', ayak: `${dugme('Vazgeç', { ek: ' data-kapat' })}${dugme('Kaydet', { sinif: 'birincil', ek: ' id="tercihKaydet"' })}` });

export default () => [uyeKabuk({
  yol: 'hesabim/tercihlerim', baslik: 'Tercihlerim',
  aciklama: 'Planın ve önerilerin bu cevaplardan hesaplanır. Bir değeri değiştirdiğinde günlük hedefin de güncellenir.',
  eylem: dugme('Soruları baştan yanıtla', { ikon: 'fa-wand-magic-sparkles', href: 'hesabim/hos-geldin/' }),
  govde, sonEk: duzenle, js: ['assets/js/sayfa/moduller-ortak.js', 'assets/js/sayfa/moduller-soru.js', 'assets/js/sayfa/moduller-tercihlerim.js'],
})];
