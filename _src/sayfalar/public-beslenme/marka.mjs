// Marka yüzeyleri (reklam envanteri §3): seçki sayfası (secki.sayfa, canlı /tarifler/seckiler/{secki}) ve marka profili
// (marka-profil.sayfa + marka-profil.takip, canlı /markalar/{marka}). Canlıda ikisi de reklam yayını açıkken görünür, misafire 404.
// Kaynak: DadaDiet resources/views/reklam/secki/hero, turetilmis/public/tarifler-kategori (seçki dalı), turetilmis/public/markalar-profil,
// reklam/marka-profil/takip-formu. Marka kurgu (reklam modülünün 8 örnek markasından biri), logo kurgu; her yerde "prototip örneği".
// Seçki tarif yazmaz: Sağlıklı Tarifler'den seçilen tarifleri marka imzasıyla listeler (kategori sayfasının şablonu).
import { K, kac, ikon, bant, bolum, sayfa, dizi, paylas, liste } from '../../parcalar/public-beslenme/ortak.mjs';
import { kreatif } from '../../parcalar/reklam.mjs';
import { birlestir, dizin, tarifKart } from './tarifler.mjs';

export const SECKI = { marka: 'ornek-glutensiz', slug: 'ornek-glutensiz-ile-glutensiz-sofralar', ad: 'Örnek Glütensiz Gıda ile Glütensiz Sofralar', ikon: 'fa-wheat-awn-circle-exclamation' };
export const SECKI_YOL = `tarifler/seckiler/${SECKI.slug}`;
export const PROFIL_YOL = `markalar/${SECKI.marka}`;
const ORNEK = '<span class="ornek-etiket satir-ici">prototip örneği</span>';
const NOT = 'Prototip örneği: marka ve logo kurgudur, gerçek bir sponsorluk yoktur. Canlıda bu sayfa yalnız reklam yayını açıkken görünür (misafire kapalı). Seçki tarif yazmaz; Sağlıklı Tarifler\'deki glütensiz tarifleri marka imzasıyla listeler.';

const imza = (k) => `<span class="marka-imza ${k.renkSinif}"><img src="${k.amblem}" alt="" loading="lazy">${kac(k.marka)}</span>`;
const seckiTarifleri = (veri) => birlestir(veri).filter((t) => t.etiketler.includes('Glütensiz'));

function secki(veri) {
  const k = kreatif(SECKI.marka);
  const l = seckiTarifleri(veri);
  const kimlik = `<span class="marka-kimlik ${k.renkSinif}" id="rk-secki.sayfa"><img src="${k.logo}" alt="${kac(k.marka)}"><span class="rozet dolu">Sponsorlu</span></span>${ORNEK}<a class="dugme hayalet kucuk" href="${K}${PROFIL_YOL}/">${ikon('fa-store')} Marka profilini gör</a>`;
  return sayfa(SECKI_YOL, SECKI.ad,
    bant({ yol: [['Tarifler', 'tarifler/'], [kac(SECKI.ad)]], etiket: 'MARKA SEÇKİSİ', etiketIkon: SECKI.ikon, h1: kac(SECKI.ad), alt: `${kac(k.marka)} sponsorluğunda glütensiz tarifler: her biri Dada Diet'in kendi tarifi, değerleri besin kütüphanesinden.`, gorsel: k.resim.replace(K, ''), sayilar: [[l.length, 'tarif']], eylem: kimlik })
    + dizi(bolum(dizin(l, null, { kategoriCip: false, imza: imza(k), not: NOT }), { ilk: true, sinif: 'marka-secki' })), { aktif: 'Beslenme', js: ['liste'] });
}

function profil(veri) {
  const k = kreatif(SECKI.marka);
  const l = seckiTarifleri(veri);
  const kirinti = `<nav class="kirinti" aria-label="Sayfa yolu"><a class="kirinti-ev" href="${K}">${ikon('fa-house')}<span class="yalniz-okuyucu">Dada Diet ana sayfa</span></a>${ikon('fa-chevron-right')}<span>Markalar</span>${ikon('fa-chevron-right')}<span class="kirinti-simdi">${kac(k.marka)}</span></nav>`;
  const sayac = (i, et, deger, ek = '') => `<div class="sayac"${ek}>${ikon(i)}<div><span>${et}</span><b>${deger}</b></div></div>`;
  const eylem = `<button class="dugme birincil" type="button" id="rk-marka-profil.takip" data-marka-takip="${SECKI.marka}" aria-pressed="false">${ikon('fa-user-plus')} <span>Takip Et</span></button><a class="dugme hayalet" href="${K}${SECKI_YOL}/">${ikon(SECKI.ikon)} Seçkiyi Gör</a>${paylas.replace(' tam-en', '')}`;
  const bas = `<section class="bolum kimlik-bant kabuk-alti" id="rk-marka-profil.sayfa"><div class="kap">${kirinti}<div class="kapak" data-kapak data-arkaplan="${k.resim}"><span class="kapak-muhur">${ikon(SECKI.ikon)} ${kac(SECKI.ad)}</span></div>
<div class="kimlik"><span class="kimlik-avatar marka-avatar ${k.renkSinif}"><img src="${k.amblem}" alt="${kac(k.marka)}"></span><div class="kimlik-govde"><h1>${kac(k.marka)} <span class="rozet dolu">${ikon('fa-bullhorn')} Sponsorlu</span> ${ORNEK}</h1><span class="kimlik-kullanici"><span class="kimlik-uad">Marka profili</span></span><p class="kimlik-giris">${kac(k.metin)}</p></div><div class="eylem-satiri">${eylem}</div></div>
<p class="durum-satir" data-marka-takip-sonuc hidden>${ikon('fa-circle-check')}<span></span></p>
<div class="sayac-serit" role="group" aria-label="Marka özeti">${sayac('fa-utensils', 'Tarif', l.length)}${sayac('fa-user-group', 'Takipçi', '<span data-marka-takipci>0</span>')}</div></div></section>`;
  const ray = `<div class="pf-tabbar sekme-ray"><div class="wrap kap"><div class="sekmeler ortali" role="tablist" aria-label="Marka profili bölümleri"><button class="sekme aktif" type="button" role="tab" id="marka-tab-tarifler" aria-controls="marka-pane-tarifler" aria-selected="true">${ikon('fa-utensils')} Tarifler <span class="sekme-sayi">${l.length}</span></button></div></div></div>`;
  const pano = `<div class="fit-pane" id="marka-pane-tarifler" role="tabpanel" aria-labelledby="marka-tab-tarifler"><section class="bolum"><div class="wrap kap yigin">${liste({ toplam: l.length, birim: 'tariften', ust: '', kapSinif: 'kart-izgara c4', kartlar: l.map((t) => tarifKart(t, imza(k))).join(''), bosMetin: 'Bu markanın henüz tarifi yok.' })}<p class="alan-yardim"><span>${NOT.replace('Seçki tarif yazmaz', 'Marka profili tarif yazmaz').replace('marka imzasıyla listeler', 'listeler; takipçi sayısı yalnız bu tarayıcıdaki demo takibini sayar')}</span></p></div></section></div>`;
  const s = sayfa(PROFIL_YOL, `${k.marka} · Marka Profili`, `<div class="modul-govde"><div class="zebra">${bas}${ray}${pano}</div></div>`, { aktif: 'Beslenme', js: ['liste', 'marka-profil'] });
  s.meta.hero = false;
  return s;
}

export default ({ veri }) => [secki(veri), profil(veri)];
