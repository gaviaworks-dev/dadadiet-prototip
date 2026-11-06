// Üye ekranlarının ortak üst parçası: kimlik bandı + sekme rayı + pano iskeleti.
// Bütün hesabim/* sayfaları bu parçadan geçer; kimlik alanlarını uye-ortak.js demo durumundan doldurur.
const K = '{{kok}}';

const kirinti = (ad, kok) => `<nav class="kirinti" aria-label="Sayfa yolu"><a class="kirinti-ev" href="${K}"><i class="fa-solid fa-house" aria-hidden="true"></i><span class="yalniz-okuyucu">Dada Diet ana sayfa</span></a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>${kok ? '' : `<a href="${K}hesabim/">Hesabım</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>`}<span class="kirinti-simdi">${ad}</span></nav>`;

export function kimlikBant({ ad, muhur, ikon = 'fa-seedling', giris, kapak = 'assets/img/hero/beslenme-reh-hero.jpg', kok = false, duzenle = false }) {
  const kapakDugme = duzenle ? `<button type="button" class="kapak-duzenle" data-ac="#kapakSec"><i class="fa-solid fa-camera" aria-hidden="true"></i> Kapağı Değiştir</button>` : '';
  const avatarDugme = duzenle ? `<button type="button" class="kimlik-avatar-duzenle" data-ac="#avatarSec" aria-label="Profil fotoğrafını değiştir"><i class="fa-solid fa-camera" aria-hidden="true"></i></button>` : '';
  return `<section class="bolum kabuk-alti kimlik-bant${duzenle ? ' duzenlenebilir' : ''}"><div class="kap">
${kirinti(ad, kok)}
<div class="kapak" data-kapak data-arkaplan="${K}${kapak}"><span class="kapak-muhur"><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${muhur}</span>${kapakDugme}</div>
<div class="kimlik"><span class="kimlik-avatar harf" data-uye-avatar><span data-uye="harf"></span>${avatarDugme}</span>
<div class="kimlik-govde"><h1>${ad}</h1><span class="kimlik-kullanici"><span data-uye="adSoyad"></span> · <span class="kimlik-uad" data-uye="kullanici"></span></span><p class="kimlik-giris">${giris}</p>
<div class="kimlik-meta"><span><i class="fa-solid fa-box-open" aria-hidden="true"></i> <span data-uye="paket"></span></span><span><i class="fa-solid fa-award" aria-hidden="true"></i> <span data-uye="rozet"></span></span><span><i class="fa-solid fa-calendar-days" aria-hidden="true"></i> <span data-uye="uyelik"></span></span></div></div></div>
</div></section>`;
}

export const sekme = (grup, s, i) => `<button class="sekme${i === 0 ? ' aktif' : ''}" type="button" role="tab" id="${grup}-tab-${s.id}" aria-controls="${grup}-pane-${s.id}" aria-selected="${i === 0}"${i === 0 ? '' : ' tabindex="-1"'}><i class="fa-solid ${s.ikon}" aria-hidden="true"></i> ${s.ad}${s.sayi ? ` <span class="sekme-sayi" data-sayi="${s.sayi}"></span>` : ''}</button>`;

export const sekmeRay = (grup, etiket, sekmeler) => `<div class="sekme-ray"><div class="wrap kap"><div class="sekmeler ortali" role="tablist" aria-label="${etiket}">${sekmeler.map((s, i) => sekme(grup, s, i)).join('')}</div></div></div>`;

export const pano = (grup, s, i) => `<div class="fit-pane" id="${grup}-pane-${s.id}" role="tabpanel" aria-labelledby="${grup}-tab-${s.id}" tabindex="-1"${i === 0 ? '' : ' hidden'}><div class="wrap kap">${s.govde}</div></div>`;

export const bolumBas = ({ etiket, ikon, baslik, metin, arac = '' }) => `<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${etiket}</span><h2>${baslik}</h2>${metin ? `<p class="giris-metni">${metin}</p>` : ''}${arac ? `<div class="bolum-araclar">${arac}</div>` : ''}</div></div>`;

// Tek noktadan üye sayfası: sekmeli (grup + sekmeler) ya da tek gövdeli (govde).
export function uyeSayfa({ yol, ad, muhur, ikon, giris, kapak, kok, duzenle, grup, sekmeler, govde, sonEk = '', js = [] }) {
  const ust = kimlikBant({ ad, muhur, ikon, giris, kapak, kok, duzenle });
  const orta = sekmeler
    ? sekmeRay(grup, `${ad} bölümleri`, sekmeler) + sekmeler.map((s, i) => pano(grup, s, i)).join('')
    : `<div class="fit-pane"><div class="wrap kap">${govde}</div></div>`;
  return {
    yol,
    meta: { baslik: ad, duzen: 'uye', js: ['assets/js/sayfa/uye-ortak.js', ...js] },
    govde: `<div class="modul-govde"><div class="zebra">${ust}${orta}</div></div>${sonEk}`,
  };
}

// Kart ve satır yardımcıları: kanon iskeletini tek yerden basar.
export const kart = ({ ikon, baslik, metin, sag = '', govde = '', alt = '', bosluksuz = false, sinif = '', form = '', id = '', kolon = false }) => {
  const etiket = form ? 'form' : 'div';
  const bas = baslik ? `<div class="kart-bas"><div><h3 class="kart-baslik">${ikon ? `<i class="fa-solid ${ikon}" aria-hidden="true"></i> ` : ''}${baslik}</h3>${metin ? `<p>${metin}</p>` : ''}</div>${sag}</div>` : '';
  return `<${etiket} class="kart panel${kolon ? '' : ' tam-kolon'}${sinif ? ' ' + sinif : ''}"${id ? ` id="${id}"` : ''}${form}>${bas}${govde ? `<div class="kart-govde${bosluksuz ? ' bosluksuz' : ''}">${govde}</div>` : ''}${alt ? `<div class="kart-alt eylem">${alt}</div>` : ''}</${etiket}>`;
};

export const ayarSatir = ({ ikon, baslik, metin = '', sag = '', id = '' }) => `<div class="ayar-satir"${id ? ` id="${id}"` : ''}>${ikon ? `<span class="as-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span>` : ''}<div class="as-metin"><b>${baslik}</b>${metin ? `<span>${metin}</span>` : ''}</div>${sag}</div>`;

export const anahtar = (ad, etiket, acik = false, ek = '') => `<label class="anahtar"><input type="checkbox" name="${ad}"${acik ? ' checked' : ''} aria-label="${etiket}"${ek}><span class="anahtar-ray"></span></label>`;

export const alan = ({ ad, etiket, tur = 'text', zorunlu = false, yardim = '', deger = '', ek = '', istege = false }) => `<div class="alan"><label class="alan-etiket" for="${ad}">${etiket}${zorunlu ? ' <span class="zorunlu">*</span>' : ''}${istege ? ' <span class="istege-bagli">(isteğe bağlı)</span>' : ''}</label><input class="alan-girdi" id="${ad}" name="${ad}" type="${tur}"${deger ? ` value="${deger}"` : ''}${zorunlu ? ' required' : ''}${ek}>${yardim ? `<p class="alan-yardim"><span>${yardim}</span></p>` : ''}</div>`;

export const secim = ({ ad, etiket, secenekler, yardim = '' }) => `<div class="alan"><label class="alan-etiket" for="${ad}">${etiket}</label><select class="alan-secim" id="${ad}" name="${ad}">${secenekler.map((s) => `<option>${s}</option>`).join('')}</select>${yardim ? `<p class="alan-yardim"><span>${yardim}</span></p>` : ''}</div>`;

export const dugme = (metin, { sinif = 'hayalet', ikon = '', href = '', ek = '', tur = 'button' } = {}) => {
  const ic = `${ikon ? `<i class="fa-solid ${ikon}" aria-hidden="true"></i> ` : ''}${metin}`;
  return href ? `<a class="dugme ${sinif}" href="{{kok}}${href}"${ek}>${ic}</a>` : `<button class="dugme ${sinif}" type="${tur}"${ek}>${ic}</button>`;
};

export const bilgi = (ikon, metin) => `<div class="bilgi-notu"><i class="fa-solid ${ikon}" aria-hidden="true"></i><p>${metin}</p></div>`;

export const modal = ({ id, baslik, govde, ayak = '', form = '' }) => `<div class="modal-ortu" id="${id}" hidden><div class="modal-kutu" role="dialog" aria-modal="true" aria-labelledby="${id}-b">${form ? `<form class="modal-form"${form}>` : ''}<div class="modal-bas"><h2 id="${id}-b">${baslik}</h2><button class="kapat-dugme" type="button" data-kapat aria-label="Kapat"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div><div class="modal-govde">${govde}</div>${ayak ? `<div class="modal-ayak-cubuk">${ayak}</div>` : ''}${form ? '</form>' : ''}</div></div>`;

// Kart içine gömülü tablo: başlıklar .kart.panel ile aynı yan payda (.tablo.panel, 22)
export const tablo = ({ id, etiket, basliklar, sabit = true }) => `<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="${etiket}"><table class="tablo panel${sabit ? ' sabit' : ''}"><caption class="yalniz-okuyucu">${etiket}</caption><thead><tr>${basliklar.map((b) => (Array.isArray(b) ? `<th scope="col" class="${b[1]}">${b[0]}</th>` : `<th scope="col">${b}</th>`)).join('')}</tr></thead><tbody id="${id}"></tbody></table></div>`;
