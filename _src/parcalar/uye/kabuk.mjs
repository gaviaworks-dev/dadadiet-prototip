// Üye alanının tek kabuğu: canlı Diet ve Gastro hesap yapısı.
// Kırıntı + kapak + kimlik kartı + sayaç şeridi + alt sekme rayı + tam genişlik içerik.
// Bölümler arası geçiş üstteki avatar menüsündedir. İmza: tasks/uye-kabuk.md.
import { uyeMenu } from '../../kabuk/menu.mjs';

const K = '{{kok}}';
const i = (ikon) => `<i class="fa-solid ${ikon}" aria-hidden="true"></i>`;
const menuIkon = (h) => (uyeMenu.flat().find((m) => m[2] === h) || [])[0];

const kirinti = (baslik, ust) => `<nav class="kirinti" aria-label="Sayfa yolu"><a class="kirinti-ev" href="${K}">${i('fa-house')}<span class="yalniz-okuyucu">Dada Diet ana sayfa</span></a>${i('fa-chevron-right')}<a href="${K}hesabim/">Hesabım</a>${ust.map(([a, h]) => `${i('fa-chevron-right')}<a href="${K}${h}">${a}</a>`).join('')}${i('fa-chevron-right')}<span class="kirinti-simdi">${baslik}</span></nav>`;

const sayac = (ad, ikon, etiket) => `<a class="sayac" data-ozet="${ad}" href="${K}hesabim/">${i(ikon)}<div><span>${etiket}</span><b></b></div></a>`;
const seritHtml = `<div class="sayac-serit" role="group" aria-label="Hesap özeti">${sayac('hedef', 'fa-bullseye', 'Hedef')}${sayac('kalori', 'fa-fire', 'Kalan kalori')}${sayac('program', 'fa-clipboard-list', 'Aktif program')}${sayac('diyetisyen', 'fa-user-doctor', 'Diyetisyen')}</div>`;

const kimlik = (aciklama, eylem, duzenle) => `<div class="kimlik"><span class="kimlik-avatar harf" data-uye-avatar><span data-uye="harf"></span>${duzenle ? `<button type="button" class="kimlik-avatar-duzenle" data-ac="#kabukAvatar" aria-label="Profil fotoğrafını değiştir">${i('fa-camera')}</button>` : ''}</span><div class="kimlik-govde"><h1><span data-uye="adSoyad"></span> <span class="rozet dolu">${i('fa-user')} <span data-uye="kademe"></span></span> <span class="rozet dolu" data-uye-paket hidden>${i('fa-box-open')} <span data-uye="paket"></span></span></h1><span class="kimlik-kullanici"><span class="kimlik-uad" data-uye="kullanici"></span></span>${aciklama ? `<p class="kimlik-giris">${aciklama}</p>` : ''}<div class="kimlik-meta"><span>${i('fa-calendar-days')} <span data-uye="uyelik"></span></span><span>${i('fa-award')} <span data-uye="rozet"></span></span></div></div>${eylem ? `<div class="eylem-satiri">${eylem}</div>` : ''}</div>`;

const sekme = (grup, s, n) => `<button class="sekme${n === 0 ? ' aktif' : ''}" type="button" role="tab" id="${grup}-tab-${s.id}" aria-controls="${grup}-pane-${s.id}" aria-selected="${n === 0}"${n === 0 ? '' : ' tabindex="-1"'}>${i(s.ikon)} ${s.ad}${s.sayi ? ` <span class="sekme-sayi" data-sayi="${s.sayi}"></span>` : ''}</button>`;
const pano = (grup, s, n) => `<div class="fit-pane" id="${grup}-pane-${s.id}" role="tabpanel" aria-labelledby="${grup}-tab-${s.id}" tabindex="-1"${n === 0 ? '' : ' hidden'}><div class="wrap kap">${s.govde}</div></div>`;

const KAPAKLAR = ['beslenme-reh-hero.jpg', 'css-8.jpg', 'css-nasil-calisir-1.jpg', 'diet-hero-poster.jpg'];
const ortu = (id, baslik, govde, ayak) => `<div class="modal-ortu" id="${id}" hidden><div class="modal-kutu" role="dialog" aria-modal="true" aria-labelledby="${id}-b"><div class="modal-bas"><h2 id="${id}-b">${baslik}</h2><button class="kapat-dugme" type="button" data-kapat aria-label="Kapat">${i('fa-xmark')}</button></div><div class="modal-govde">${govde}</div><div class="modal-ayak-cubuk">${ayak}</div></div></div>`;
const kabukOrtu = ortu('kabukKapak', 'Kapak görselini seç', `<div class="secenek-izgara" data-tek-secim>${KAPAKLAR.map((k, n) => `<button class="secenek" type="button" data-kapak-sec="assets/img/hero/${k}" aria-pressed="${n === 0}">${i('fa-image')}<span>Kapak ${n + 1}</span></button>`).join('')}</div>`, `<button class="dugme hayalet" type="button" data-kapat>Vazgeç</button><button class="dugme birincil" type="button" data-kapak-uygula>Kapağı Kullan</button>`)
  + ortu('kabukAvatar', 'Profil fotoğrafı', `<div class="alan"><label class="alan-etiket" for="kabukAvatarDosya">Dosya seç</label><input class="alan-girdi" id="kabukAvatarDosya" type="file" accept="image/*"><p class="alan-yardim"><span>JPG, PNG veya WebP, en çok 5 MB. Fotoğrafın yalnız bu tarayıcıda durur.</span></p></div>`, `<button class="dugme hayalet" type="button" data-avatar-sil>Baş harfi kullan</button><button class="dugme birincil" type="button" data-kapat>Tamam</button>`);

// baslik: sayfa adı; kapak mührü, kırıntı ve <title>. h1 üyenin adıdır (Gastro ile aynı).
// aciklama: kimlik kartı tanıtım cümlesi. eylem: kimlik kartının sağındaki düğmeler.
// sekmeler + grup: kartın altındaki ray; verilmezse govde tek pano olur.
// duzenle: kapak ve avatar kamerası; Gastro'da olduğu gibi yalnız Hesap Ayarları açar.
export function uyeKabuk({ yol, baslik, aciklama = '', eylem = '', aktif, ust = [], grup, sekmeler, govde = '', sonEk = '', js = [], muhur, ikon, duzenle = false, kapak = 'assets/img/hero/beslenme-reh-hero.jpg' }) {
  const mikon = ikon || menuIkon(aktif ?? `${yol}/`) || 'fa-seedling';
  const bant = `<section class="bolum kimlik-bant${duzenle ? ' is-editable duzenlenebilir' : ''} kabuk-alti"><div class="kap">${kirinti(baslik, ust)}<div class="kapak" data-kapak data-arkaplan="${K}${kapak}"><span class="kapak-muhur">${i(mikon)} ${muhur || `${baslik} · kişisel alanın`}</span>${duzenle ? `<button type="button" class="kapak-duzenle" data-ac="#kabukKapak">${i('fa-camera')} Kapağı Değiştir</button>` : ''}</div>${kimlik(aciklama, eylem, duzenle)}${seritHtml}</div></section>`;
  const orta = sekmeler
    ? `<div class="pf-tabbar sekme-ray"><div class="wrap kap"><div class="sekmeler ortali" role="tablist" aria-label="${baslik} bölümleri">${sekmeler.map((s, n) => sekme(grup, s, n)).join('')}</div></div></div>${sekmeler.map((s, n) => pano(grup, s, n)).join('')}`
    : `<div class="fit-pane"><section class="bolum"><div class="wrap kap">${govde}</div></section></div>`;
  return {
    yol,
    meta: { baslik, duzen: 'uye', js: ['assets/js/sayfa/uye-ortak.js', ...js] },
    govde: `<div class="modul-govde"><div class="zebra">${bant}${orta}</div></div>${duzenle ? kabukOrtu : ''}${sonEk}`,
  };
}
