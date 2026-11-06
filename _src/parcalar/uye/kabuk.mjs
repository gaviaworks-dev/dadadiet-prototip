// Üye alanının tek kabuğu: kırıntı + özet şeridi + sol menü + içerik.
// İmza ve kullanım: tasks/uye-kabuk.md. Özet alanlarını uye-ortak.js demo durumundan doldurur.
import { uyeMenu } from '../../kabuk/menu.mjs';

const K = '{{kok}}';
const i = (ikon) => `<i class="fa-solid ${ikon}" aria-hidden="true"></i>`;

const kirinti = (baslik, ust) => `<nav class="kirinti" aria-label="Sayfa yolu"><a class="kirinti-ev" href="${K}">${i('fa-house')}<span class="yalniz-okuyucu">Dada Diet ana sayfa</span></a>${i('fa-chevron-right')}<a href="${K}hesabim/">Hesabım</a>${ust.map(([a, h]) => `${i('fa-chevron-right')}<a href="${K}${h}">${a}</a>`).join('')}${i('fa-chevron-right')}<span class="kirinti-simdi">${baslik}</span></nav>`;

const ozetHucre = (ad, ikon, etiket) => `<a class="sayac" data-ozet="${ad}" href="${K}hesabim/">${i(ikon)}<div><span>${etiket}</span><b></b></div></a>`;

export const uyeOzet = () => `<section class="sayac-serit uye-ozet" aria-label="Hesap özeti"><a class="sayac uye-ozet-kisi" href="${K}hesabim/ayarlar/"><span class="kisi-avatar" data-uye="harf"></span><div><span data-uye="kullanici"></span><b data-uye="adSoyad"></b></div></a>${ozetHucre('hedef', 'fa-bullseye', 'Hedef')}${ozetHucre('kalori', 'fa-fire', 'Kalan kalori')}${ozetHucre('program', 'fa-clipboard-list', 'Aktif program')}${ozetHucre('diyetisyen', 'fa-user-doctor', 'Diyetisyen')}</section>`;

export const uyeSolMenu = (aktif) => `<nav class="uye-menu" aria-label="Hesabım menüsü">${uyeMenu.map((g) => `<div class="uye-menu-grup">${g.map(([ikon, ad, h]) => `<a href="${K}${h}"${h === aktif ? ' aria-current="page"' : ''}>${i(ikon)}<span>${ad}</span></a>`).join('')}</div>`).join('')}</nav>`;

const sekme = (grup, s, n) => `<button class="sekme${n === 0 ? ' aktif' : ''}" type="button" role="tab" id="${grup}-tab-${s.id}" aria-controls="${grup}-pane-${s.id}" aria-selected="${n === 0}"${n === 0 ? '' : ' tabindex="-1"'}>${i(s.ikon)} ${s.ad}${s.sayi ? ` <span class="sekme-sayi" data-sayi="${s.sayi}"></span>` : ''}</button>`;
const pano = (grup, s, n) => `<div class="fit-pane" id="${grup}-pane-${s.id}" role="tabpanel" aria-labelledby="${grup}-tab-${s.id}" tabindex="-1"${n === 0 ? '' : ' hidden'}>${s.govde}</div>`;

// aktif: menüde işaretlenecek uyeMenu yolu ('hesabim/beslenme-planim/'); verilmezse yol + '/'.
// ust: kırıntıda ara halkalar [['Beslenme Planım','hesabim/beslenme-planim/']].
// sekmeler + grup verilirse içerikte alt sekme; verilmezse govde tek pano olur.
export function uyeKabuk({ yol, baslik, aciklama = '', eylem = '', aktif, ust = [], grup, sekmeler, govde = '', sonEk = '', js = [] }) {
  const orta = sekmeler
    ? `<div class="sekme-ray"><div class="sekmeler" role="tablist" aria-label="${baslik} bölümleri">${sekmeler.map((s, n) => sekme(grup, s, n)).join('')}</div></div>${sekmeler.map((s, n) => pano(grup, s, n)).join('')}`
    : `<div class="fit-pane">${govde}</div>`;
  const bas = `<div class="sayfa-bas"><div><h1>${baslik}</h1>${aciklama ? `<p>${aciklama}</p>` : ''}</div>${eylem ? `<div class="eylem-satiri">${eylem}</div>` : ''}</div>`;
  return {
    yol,
    meta: { baslik, duzen: 'uye', js: ['assets/js/sayfa/uye-ortak.js', ...js] },
    govde: `<div class="zebra"><section class="bolum kabuk-alti kendi-zemini uye-alan"><div class="kap">${kirinti(baslik, ust)}${uyeOzet()}<div class="uye-kabuk">${uyeSolMenu(aktif ?? `${yol}/`)}<div class="uye-icerik">${bas}${orta}</div></div></div></section></div>${sonEk}`,
  };
}
