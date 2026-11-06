// Üye ekranlarının kart, satır ve form yardımcıları. Kabuk: kabuk.mjs (imza tasks/uye-kabuk.md).
import { uyeKabuk } from './kabuk.mjs';

export const bolumBas = ({ etiket, ikon, baslik, metin, arac = '' }) => `<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${etiket}</span><h2>${baslik}</h2>${metin ? `<p class="giris-metni">${metin}</p>` : ''}${arac ? `<div class="bolum-araclar">${arac}</div>` : ''}</div></div>`;

// Eski çağrı biçimi: ad/giris adlarını kabuğa taşır.
export const uyeSayfa = ({ ad, giris, ...o }) => uyeKabuk({ baslik: ad, aciklama: giris, ...o });

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
