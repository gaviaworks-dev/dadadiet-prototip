// Reklam modülü: canlı dadadiet.com reklam bileşenlerinin (resources/views/components/reklam/*, parcalar/public/reklam/*)
// markup'ını prototipte üretir. Kaynak katalog _src/veri/reklam-alanlari.json (146 alan).
//
// Görünürlük (lead kararı, 9 Kasım): canlıda misafire reklam basılmaz (bayraklar kapalı). Prototipte de varsayılan görünümde
// tek bayt görünmez: her alan `<template data-rk-yer="KOD">` kancası olarak durur. assets/js/reklam/onizle.js kancayı
// `?reklam=KOD`, `?reklam=hepsi` ya da ekranlar sayfasındaki "Reklamlı görünüm" anahtarıyla açar.
//
// Kreatifler kurgu markalardır (gerçek marka, logo ya da sponsorluk yok); her kreatif "Sponsorlu" etiketinin yanında
// "prototip örneği" taşır. Bağlantılar dış siteye gitmez: tıklama toast verir (onizle.js, [data-rk-ornek]) ya da prototip içinde gezer.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const oku = (p) => JSON.parse(fs.readFileSync(path.join(KOK, p), 'utf8'));
export const KATALOG = oku('_src/veri/reklam-alanlari.json');
export const ALANLAR = KATALOG.alanlar;
const ALAN = new Map(ALANLAR.map((a) => [a.kod, a]));
export const alan = (kod) => {
  const a = ALAN.get(kod);
  if (!a) throw new Error('Reklam alanı yok: ' + kod);
  return a;
};
const DIYETISYENLER = oku('_src/veri/diyetisyenler.json').diyetisyenler;

const K = '{{kok}}';
const kac = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const ik = (i) => `<i class="fa-solid ${i}" aria-hidden="true"></i>`;

/* Kurgu markalar. Renk satırları assets/css/reklam/reklam-demo.css (canlı MarkaRengi::css hesabı). */
export const MARKALAR = {
  'ornek-sut': { marka: 'Örnek Süt Markası', renk: '1f5fa8', tur: 'urun', baslik: 'Kahvaltıya Sade Yoğurt', metin: 'Sade ve süzme yoğurt seçenekleri; besin değerleri paketin üstünde.', kart: 'Süt ürünlerini öğünlere yaymanın üç yolu', gorsel: 'ipucu/gunde-kac-porsiyon-sut-urunu-gerekir.webp' },
  'demo-market': { marka: 'Demo Market', renk: 'd9531e', tur: 'marka', baslik: 'Haftalık Listen Tek Sepette', metin: 'Alışveriş listendeki ürünleri tek dokunuşla sepete aktar.', kart: 'Haftalık market listesini on dakikada kur', gorsel: 'ipucu/haftalik-yemek-plani-nasil-kurulur.webp' },
  'ornek-teslimat': { marka: 'Örnek Teslimat', renk: '6f3fb0', tur: 'marka', baslik: 'Malzemeler Kapına Gelsin', metin: 'Yakındaki marketlerden aynı gün teslimat.', kart: 'Online market alışverişini planlamak', gorsel: 'ipucu/ogle-yemegini-evden-goturmek-ne-degistirir.webp' },
  'ornek-klinik': { marka: 'Örnek Klinik', renk: '0e8a7e', tur: 'marka', baslik: 'Diyetisyenle İlk Görüşmen', metin: 'Klinikteki uzmanlarla online ya da yüz yüze görüşme planla.', kart: 'Diyetisyen görüşmesine nasıl hazırlanılır?', gorsel: 'hero/giris-pano-diyetisyen.webp' },
  'ornek-mutfak': { marka: 'Örnek Mutfak Ekipmanı', renk: '3a4651', tur: 'urun', baslik: 'Porsiyonu Gramla Gör', metin: 'Gram hassasiyetli mutfak tartısı ve ölçü kapları.', kart: 'Mutfak tartısıyla porsiyonu ölçmek', gorsel: 'ipucu/ekmegi-tartmadan-nasil-olcersin.webp' },
  'ornek-su': { marka: 'Örnek Su Markası', renk: '1793c9', tur: 'urun', baslik: 'Gün Boyu Yanında Su', metin: 'Cam şişede kaynak suyu: 0,5 ve 1,5 litre.', kart: 'Gün boyu suyu unutmamanın üç yolu', gorsel: 'ipucu/sabah-uyaninca-su-icmek-ne-getirir.webp' },
  'ornek-glutensiz': { marka: 'Örnek Glütensiz Gıda', renk: 'b7791a', tur: 'urun', baslik: 'Glütensiz Kahvaltılıklar', metin: 'Glütensiz yulaf, kraker ve ekmek seçenekleri.', kart: 'Glütensiz beslenmeye başlarken beş kural', gorsel: 'ipucu/bir-porsiyon-kuru-baklagil-ne-kadar.webp' },
  'demo-spor': { marka: 'Demo Spor Mağazası', renk: 'b8283c', tur: 'marka', baslik: 'Antrenmanda Yanında Matara', metin: 'Matara, ölçü kabı ve spor ekipmanları tek mağazada.', kart: 'Antrenman sonrası beslenme', gorsel: 'ipucu/spor-yaparken-sivi-nasil-takip-edilir.webp' },
};
const SIRA = Object.keys(MARKALAR);
/* Alan → marka: sayfanın konusuna uyan kurgu marka; geri kalanı koda göre sırayla dağılır. */
const ATAMA = {
  'DN-FRIDGE': 'ornek-klinik', 'DN-P1': 'ornek-klinik', 'DN-P2': 'ornek-klinik', 'DN-P3': 'ornek-klinik', 'DN-P4': 'ornek-klinik', 'DN-P5': 'ornek-klinik',
  'KL-ANASAYFA': 'ornek-klinik', 'KL-PROGRAM': 'ornek-klinik', 'KL-TAHLIL': 'ornek-klinik', 'HD-DOLAP-SPON': 'ornek-klinik', 'AS-SEF-1': 'ornek-klinik', 'SF-N2': 'ornek-klinik', 'SF-L1': 'ornek-klinik', 'SF-P1': 'ornek-klinik',
  'AL-P1': 'demo-market', 'TD-SHOP': 'demo-market', 'TD-LISTE-PARTNER': 'demo-market', 'TD-SIPARIS-YS': 'demo-market', 'AL-P2': 'ornek-teslimat', 'TD-SIPARIS-A101': 'ornek-teslimat', 'AL-P3': 'ornek-su', 'AL-P4': 'ornek-sut',
  'OB-FIRIN': 'ornek-mutfak', 'OB-DONUSTURUCU': 'ornek-mutfak', 'TD-SB2': 'ornek-mutfak', 'OB-B1': 'ornek-mutfak', 'OB-B1-SIDE': 'demo-spor', 'OB-B1-END': 'ornek-su',
  'TD-ING': 'ornek-sut', 'DN-RAIL': 'ornek-sut', 'AN-N1': 'ornek-sut', 'ansiklopedi-liste.kategori-rozeti': 'ornek-sut', 'TD-PHOTO': 'ornek-glutensiz', 'AN-B1': 'ornek-glutensiz', 'AN-B1-END': 'demo-market',
  'PD-END': 'ornek-su', 'PD-R1': 'ornek-su', 'PD-END-END': 'demo-spor', 'TD-SB1': 'ornek-sut',
  'PL-N1': 'ornek-su', 'TL-M1': 'ornek-glutensiz', 'TL-M2': 'demo-spor', 'PL-B1': 'demo-market', 'MG-KONU': 'ornek-mutfak', 'PL-B1-END': 'ornek-su', 'MG-KONU-END': 'ornek-sut',
  'KT-HERO': 'ornek-glutensiz', 'KT-M1': 'ornek-sut', 'SD-B1': 'demo-market', 'SD-B1-END': 'ornek-su',
  'AS-SEF-2': 'demo-spor', 'AS-CHEF': 'ornek-glutensiz', 'ana-sayfa.marka-sef-karti': 'ornek-sut', 'AS-DAY': 'ornek-su', 'HD-WEEK': 'ornek-glutensiz', 'HD-MEGA': 'ornek-sut', 'menu.secki-hucresi': 'ornek-glutensiz',
  'STD-ALTBAR': 'demo-market', 'STD-SIDE': 'demo-spor', 'STD-SIDE-LEFT': 'ornek-su', 'STD-POPUP': 'ornek-glutensiz', 'STD-VIDEO': 'demo-spor',
};
export function kreatif(kod) {
  let slug = ATAMA[kod];
  if (!slug) { let h = 0; for (const c of kod) h = (h * 31 + c.charCodeAt(0)) >>> 0; slug = SIRA[h % SIRA.length]; }
  const m = MARKALAR[slug];
  return { slug, ...m, renkSinif: 'rk-renk-' + m.renk, cta: m.tur === 'urun' ? 'İncele' : 'Keşfet', logo: `${K}assets/img/reklam/demo/${slug}.svg`, amblem: `${K}assets/img/reklam/demo/${slug}-amblem.svg`, resim: `${K}assets/img/${m.gorsel}` };
}

/* Ortak parçalar */
const ORNEK = '<span class="rk-ornek"> · prototip örneği</span>';
const etiket = (ek = '') => `<span class="rk-etiket${ek}">Sponsorlu${ORNEK}</span>`;
const logo = (k, alt) => `<img class="rk-logo" src="${k.logo}" alt="${alt ?? kac(k.marka)}" loading="lazy" decoding="async">`;
const amblem = (k, alt = '') => `<img class="rk-logo" src="${k.amblem}" alt="${alt}" loading="lazy" decoding="async">`;
/* Dış bağ yerine prototip: tıklama toast verir (onizle.js) */
const bag = (kod) => `href="#rk-${kac(kod)}" data-rk-ornek rel="sponsored nofollow noopener"`;
const kok = (kod, k, sinif, ek = '') => `class="${sinif}" id="rk-${kac(kod)}" data-rk-slot="${kac(kod)}"${k ? ` aria-label="Sponsorlu içerik · ${kac(k.marka)}"` : ''}${ek}`;
const kimlik = (k, cta) => `<span class="rk-native-kimlik"><span class="rk-native-wordmark">${logo(k)}</span><span class="rk-native-kesfet"><span class="rk-native-prefix">Sponsorlu · </span>${cta ?? k.cta} <span class="rk-native-ok" aria-hidden="true">→</span></span></span>`;
const hap = '<span class="rk-native-hap">Sponsorlu</span>';

/* ── Biçimler (canlı bileşenlerin markup'ı) ───────────────────────────── */
// x-reklam.slot bicim=serit
function serit(kod) {
  const k = kreatif(kod);
  return `<aside ${kok(kod, k, `rk-slot rk-serit rk-ince-banner ${k.renkSinif} rk-gorsel-${k.tur}`)}>${etiket()}<a class="rk-serit-bag" ${bag(kod)}><img class="rk-serit-urun" src="${k.resim}" alt="" loading="lazy"><span class="rk-zemin-perde" aria-hidden="true"></span><span class="rk-serit-kimlik">${logo(k)}</span><span class="rk-serit-metin"><b>${k.baslik}</b><span>${k.metin}</span></span><span class="rk-serit-cta">${k.cta} ${ik('fa-arrow-right')}</span></a></aside>`;
}
// x-reklam.slot bicim=pano (native_panel)
function pano(kod) {
  const k = kreatif(kod), a = alan(kod);
  return `<aside ${kok(kod, k, `rk-slot rk-pano rk-ince-banner rk-format-${a.format} ${k.renkSinif} rk-gorsel-${k.tur}`)}>${etiket()}<a class="rk-pano-bag" ${bag(kod)}><img class="rk-pano-gorsel" src="${k.resim}" alt="" loading="lazy" decoding="async"><span class="rk-zemin-perde" aria-hidden="true"></span><span class="rk-pano-logo">${logo(k)}</span><span class="rk-pano-metin"><b>${k.baslik}</b><span>${k.metin}</span></span><span class="rk-pano-cta">${k.cta} ${ik('fa-arrow-right')}</span></a></aside>`;
}
// native_rectangle
function rectangle(kod) {
  const k = kreatif(kod);
  return `<aside ${kok(kod, k, `rk-slot rk-rectangle rk-rectangle-tip-${k.tur} ${k.renkSinif}`)}><a class="rk-rectangle-bag" ${bag(kod)}><span class="rk-rectangle-vitrin"><img class="rk-rectangle-urun" src="${k.resim}" alt="" loading="lazy"><span class="rk-rectangle-logo">${logo(k)}</span><span class="rk-rectangle-etiket">Sponsorlu${ORNEK}</span></span><span class="rk-rectangle-icerik"><span class="rk-rectangle-marka">${k.marka}</span><b class="rk-rectangle-baslik">${k.baslik}</b><span class="rk-rectangle-metin">${k.metin}</span><span class="rk-rectangle-cta">${k.cta} ${ik('fa-arrow-right')}</span></span></a></aside>`;
}
// x-reklam.slot bicim=eslik ("… sunar" hapı)
function eslik(kod) {
  const k = kreatif(kod);
  return `<a ${kok(kod, null, `rk-slot rk-eslik ${k.renkSinif} rk-gorsel-${k.tur}`)} ${bag(kod)}><span class="rk-eslik-logo">${logo(k)}</span><span>${etiket()}<span>${k.marka} sponsorluğunda</span></span></a>`;
}
// x-reklam.gunun-sponsoru (AS-DAY): "Sponsorlu" kelimesi yok (canlı)
function gununSponsoru(kod) {
  const k = kreatif(kod);
  return `<a ${kok(kod, null, `rk-slot rk-gunun-sponsoru ${k.renkSinif}`)} ${bag(kod)}>${logo(k)}<span>${k.marka} sponsorluğunda${ORNEK}</span></a>`;
}
// x-reklam.slot bicim=menu (HD-MEGA, menu.secki-hucresi)
function menu(kod) {
  const k = kreatif(kod);
  const baslik = kod === 'menu.secki-hucresi' ? `${k.marka} Seçkisi` : k.baslik;
  return `<a ${kok(kod, null, `rk-slot rk-menu${kod === 'menu.secki-hucresi' ? ' rk-secki-menu' : ''}`)} ${bag(kod)} aria-label="Sponsorlu · ${kac(k.marka)}" title="${kac(baslik)}"><span class="rk-menu-logo">${amblem(k)}</span><span><b>${baslik}</b><small class="rk-etiket">Sponsorlu${ORNEK}</small></span></a>`;
}
// x-reklam.hafta (HD-WEEK): organik vitrin kartının yerine
function hafta(kod) {
  const k = kreatif(kod);
  return `<a ${kok(kod, null, `mf-fig rk-slot rk-hafta ${k.renkSinif}`)} ${bag(kod)}><img class="rk-hafta-zemin" src="${k.resim}" alt=""><span class="rk-zemin-perde" aria-hidden="true"></span><span class="r-chip">${ik('fa-star')} Haftanın Sponsoru${ORNEK}</span><span class="rk-hafta-icerik"><span class="rk-hafta-logo">${logo(k)}</span><span class="rk-hafta-metin"><b>${k.baslik}</b><span>${k.cta} →</span></span></span></a>`;
}
// x-reklam.dolap-menu (HD-DOLAP-SPON): Diet'te klinik koridoru / Diyetisyenler kartı
function dolapMenu(kod) {
  const k = kreatif(kod);
  return `<div ${kok(kod, null, `mega-find rk-dolap-menu rk-slot ${k.renkSinif}`)}><a class="rk-dolap-menu-hedef" href="${K}diyetisyenler/"><span class="mf-ico">${ik('fa-user-doctor')}</span><span class="mf-body"><b>Diyetisyenler</b><small>Koridorda uzmanını bul</small></span></a><a class="rk-dolap-menu-marka" ${bag(kod)} aria-label="${kac(k.marka)} · Sponsorlu">${logo(k)}<small>Sponsorlu${ORNEK}</small></a>${ik('fa-arrow-right mf-arr')}</div>`;
}
// Sponsorlu liste kartı ve tarif kartı: komşu organik kartın anatomisi (G slot kuralı) + "Sponsorlu" hapı + native kimlik
function nativeKart(kod, tur) {
  const k = kreatif(kod);
  const s = (sinif) => kok(kod, k, `${sinif} rk-slot rk-native-kart ${k.renkSinif}`, ' data-native-sponsor');
  if (tur === 'yatay') return `<a ${s('yatay-kart')} ${bag(kod)}><div class="yatay-kart-gorsel"><img src="${k.resim}" alt="" loading="lazy">${hap}</div><span class="yatay-kart-ikon">${amblem(k)}</span><div class="yatay-kart-govde"><h3 class="kart-baslik">${k.kart}</h3><p>${k.metin}</p><div class="yatay-kart-alt">${kimlik(k)}</div></div></a>`;
  if (tur === 'medya') return `<a ${s('medya-kart')} ${bag(kod)}><div class="medya-kart-gorsel"><img src="${k.resim}" alt="" loading="lazy">${hap}</div><div class="medya-kart-govde"><h3 class="medya-kart-baslik">${k.kart}</h3><p class="medya-kart-metin">${k.metin}</p><div class="medya-kart-alt">${kimlik(k)}</div></div></a>`;
  if (tur === 'ikon') return `<a ${s('kart ikon-kart')} ${bag(kod)}><span class="ikon-kutu rk-ikon-logo">${amblem(k)}</span><span class="ikon-kart-metin"><span class="kart-baslik">${k.baslik}</span><span class="kart-metin">${k.marka} · Sponsorlu${ORNEK}</span></span>${ik('fa-arrow-right ikon-kart-ok')}</a>`;
  if (tur === 'uzman') return `<a ${s('vitrin-kart rk-dz-kart')} data-ton="marka" ${bag(kod)}><span class="vitrin-kart-serit" aria-hidden="true">${ik('fa-hospital')}</span><div class="vitrin-kart-ust"><div class="vitrin-kart-avatar rk-dz-logo">${amblem(k)}</div><div class="vitrin-kart-kimlik"><h3>${k.marka}</h3><p class="vitrin-kart-unvan">${hap}</p><div class="vitrin-kart-puan">${k.metin}</div></div></div><div class="vitrin-kart-alt"><span class="vitrin-kart-git">${k.cta} ${ik('fa-arrow-right')}</span></div></a>`;
  // sonuc-kart (gorselKart): rehber, program, makro ızgaraları
  return `<a ${s('sonuc-kart')} ${bag(kod)}><div class="sonuc-gorsel"><img src="${k.resim}" alt="" loading="lazy">${hap}</div><div class="sonuc-govde"><h3 class="kart-baslik">${k.kart}</h3><p>${k.metin}</p><div class="sonuc-alt">${kimlik(k)}</div></div></a>`;
}
// x-reklam.slot bicim=kart-sef (AS-SEF-*, AS-CHEF, marka diyetisyen kartı): ana sayfa uzman listesindeki satırın anatomisi
function sefKart(kod) {
  const k = kreatif(kod);
  return `<div ${kok(kod, k, `satir-baglanti diet-doc rk-slot rk-kucuk-kart${kod === 'ana-sayfa.marka-sef-karti' ? ' rk-marka-sef' : ''} ${k.renkSinif}`)}><span class="av rk-sef-logo kisi-avatar" aria-hidden="true">${amblem(k)}</span><span class="di"><b>${k.marka}</b><span class="rk-etiket">Sponsorlu${ORNEK}</span></span><span class="rk-sef-eylem"><a class="tag rk-sef-cta" ${bag(kod)}>${k.cta}</a></span></div>`;
}
// Ana sayfa kategori ve video kartları (AS-CAT, AS-VID): komşu kartın anatomisi
function kucukKart(kod, tur) {
  const k = kreatif(kod);
  if (tur === 'ikon') return nativeKart(kod, 'ikon');
  return `<a ${kok(kod, k, `sonuc-kart rk-slot rk-kucuk-kart${tur === 'video' ? ' vid-card' : ' rk-kategori-sponsor'} ${k.renkSinif}`, ' data-native-sponsor')} ${bag(kod)}><div class="sonuc-gorsel"><img src="${k.resim}" alt="" loading="lazy">${tur === 'video' ? `<span class="rk-video-ikon" aria-hidden="true">${ik('fa-play')}</span>` : ''}${hap}</div><div class="sonuc-govde"><h3 class="kart-baslik">${k.kart}</h3><p>${k.metin}</p><div class="sonuc-alt">${kimlik(k)}</div></div></a>`;
}
// besinler/index kategori rozeti (AN-N1) ve ansiklopedi-liste.kategori-rozeti
function katSponsor(kod, kategori) {
  const k = kreatif(kod);
  /* Kategori sekmesinin yanındaki kompakt rozet: logo ve etiket, sponsorluk cümlesi başlıkta */
  if (kod === 'ansiklopedi-liste.kategori-rozeti') return `<span ${kok(kod, null, `rk-kat-sponsor rk-kat-rozet rk-slot ${k.renkSinif}`)} title="${kac(kategori ?? '')} · ${kac(k.marka)} sponsorluğunda"><a ${bag(kod)} aria-label="${kac(kategori ?? '')} · ${kac(k.marka)} sponsorluğunda">${amblem(k)}</a>${etiket()}</span>`;
  return `<span ${kok(kod, null, `rk-kat-sponsor rk-slot ${k.renkSinif}`)} data-rk-kat-sponsor="${kac(kategori ?? '')}"><a ${bag(kod)}>${logo(k)}<span>${kategori ? kac(kategori) + ' · ' : ''}${k.marka} sponsorluğunda</span></a>${etiket()}</span>`;
}
// parcalar/public/reklam/besin-satiri (DN-RAIL): Besin Kütüphanesi satırının anatomisi
function besinSatiri(kod) {
  const k = kreatif(kod);
  return `<a ${kok(kod, null, `veri-satir food-row rk-dolap-kart rk-slot ${k.renkSinif}`)} ${bag(kod)} aria-label="Sponsorlu ürün · ${kac(k.baslik)} · ${k.cta}"><span class="ikon-kutu fr-ico rk-dolap-marka">${amblem(k)}</span><span class="veri-satir-ad fr-name"><b>${k.baslik}</b>${etiket()}</span><span class="veri-satir-sutun fr-m"></span><span class="veri-satir-sutun fr-m"></span><span class="veri-satir-kalori fr-kcal">${k.cta}</span>${ik('fa-chevron-right veri-satir-ok fr-go')}</a>`;
}
// x-reklam.slot bicim=filtre (TL-FILTER, KT-FILTER): süzgeç kartı, şeridin anatomisiyle
function filtre(kod) {
  const k = kreatif(kod);
  return `<aside ${kok(kod, k, `fct rk-slot rk-filtre ${k.renkSinif} rk-gorsel-${k.tur}`)}>${etiket()}<a class="rk-serit-bag" ${bag(kod)}><img class="rk-serit-urun" src="${k.resim}" alt="" loading="lazy"><span class="rk-zemin-perde" aria-hidden="true"></span><span class="rk-serit-kimlik">${logo(k)}</span><span class="rk-serit-metin"><b>${k.baslik}</b><span>${k.metin}</span></span><span class="rk-serit-cta">${k.cta} ${ik('fa-arrow-right')}</span></a></aside>`;
}
// x-reklam.slot bicim=tema (TL-THEME): alt kategori şeridinde marka kalemi
function tema(kod) {
  const k = kreatif(kod);
  return `<a ${kok(kod, null, `rk-slot subcat rk-tema ${k.renkSinif}`)} ${bag(kod)} aria-label="Sponsorlu · ${kac(k.marka)}" title="${kac(k.baslik)}"><span class="rk-menu-logo">${amblem(k)}</span><span><b>${k.baslik}</b><span class="rk-etiket">Sponsorlu${ORNEK}</span></span></a>`;
}
// x-reklam.pisirme (CM-TOP): adımların üstünde kapatılabilir şerit
function pisirme(kod) {
  const k = kreatif(kod);
  return `<aside ${kok(kod, null, `rk-slot rk-pisirme ${k.renkSinif}`)}><span class="rk-pisirme-logo">${logo(k)}</span><span class="rk-pisirme-metin">${etiket()}<b>${k.baslik}</b></span><a ${bag(kod)}>${k.cta} →</a><button type="button" aria-label="Reklamı kapat" data-rk-kapat>×</button></aside>`;
}
// x-reklam.malzeme (TD-ING): malzeme satırı sponsoru + "Sipariş Et" penceresi
function malzeme(kod) {
  const k = kreatif(kod), id = 'rk-siparis-' + kod.toLowerCase();
  const kanal = (p, kk, alt) => `<a class="rk-siparis-kanal rk-siparis-partner rk-slot ${kk.renkSinif}" id="rk-${p}" data-rk-slot="${p}" ${bag(p)}><span class="rk-siparis-logo">${logo(kk)}</span><span>${kk.marka}<small>${alt}</small></span>${ik('fa-arrow-up-right-from-square')}</a>`;
  /* Sağlıklı Tarif malzeme listesinde satır sponsoru; "Sipariş Et" penceresinde canlının üç partneri (x-reklam.malzeme :partnerler) */
  return `<div ${kok(kod, k, 'veri-satir rk-malzeme rk-slot')}><div class="ing-sponsor sp-line"><span class="sp-logo rk-harf" aria-hidden="true">${amblem(k)}</span><div class="sp-info"><b title="${kac(k.baslik)}">${k.baslik}</b><span>${k.metin}</span>${etiket()}</div><div class="rk-malzeme-sag"><span class="rk-malzeme-urun" aria-hidden="true"><img class="rk-logo" src="${k.resim}" alt="" loading="lazy"></span><button class="sp-go" type="button" data-rk-siparis-ac aria-haspopup="dialog" aria-expanded="false" aria-controls="${id}">Sipariş Et ${ik('fa-arrow-right')}</button></div><dialog id="${id}" class="rk-siparis-kart ${k.renkSinif}" aria-labelledby="${id}-baslik"><div class="rk-siparis-baslik"><div><b id="${id}-baslik">Hemen sipariş ver</b><small>Teslimat kanalı seç</small></div><button type="button" data-rk-siparis-kapat aria-label="Sipariş seçeneklerini kapat"><svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button></div>${['TD-LISTE-PARTNER', 'TD-SIPARIS-YS', 'TD-SIPARIS-A101'].map((p) => kanal(p, kreatif(p), 'Sponsorlu · prototip örneği')).join('')}</dialog></div></div>`;
}
// x-reklam.nokta-katmani + foto-etiket (TD-PHOTO): fotoğraf üstü nokta ve açılır kart
function fotoNokta(kod, { x = 500, y = 500, mx, my, gorsel } = {}) {
  const k = kreatif(kod);
  return `<div class="rk-nk rk-nk--tarif_kapagi rk-foto-katman" id="rk-${kac(kod)}" data-rk-nk="" data-rk-nk-cerceve="oto" data-rk-nk-kip="site">${gorsel ? `<picture class="rk-nk-resim"><img class="rk-nk-gorsel" src="${K}${gorsel}" alt="" decoding="async"></picture>` : ''}<details class="rk-foto-nokta ${k.renkSinif}" name="kapak-noktalari" data-x="${x}" data-y="${y}" data-mx="${mx ?? x}" data-my="${my ?? y}"><span class="rk-nokta-filtre" aria-hidden="true"></span><summary aria-expanded="false" aria-label="Sponsorlu ürün: ${kac(k.baslik)}"><span class="rk-nokta-hap rk-nokta-marka"><span class="rk-nokta-logo">${amblem(k, kac(k.marka))}</span></span></summary><div class="rk-foto-kart rk-slot ${k.renkSinif}" data-rk-slot="${kac(kod)}"><div class="rk-foto-baslik"><div class="rk-foto-kimlik"><span class="rk-foto-logo">${logo(k)}</span></div>${etiket()}</div><div class="rk-foto-govde"><span class="rk-foto-urun"><img src="${k.resim}" alt="${kac(k.baslik)}" loading="lazy"></span><div class="rk-foto-metin"><b>${k.baslik}</b><p>${k.metin}</p></div></div><a class="rk-foto-cta" ${bag(kod)}>İncele →</a></div></details></div>`;
}
// x-reklam.olcu (OB-FIRIN): Kaç Kalori porsiyon tablosu ardında ürün sahnesi + nokta
function firin(kod) {
  const k = kreatif(kod);
  return `<section ${kok(kod, null, `rk-slot rk-firin ${k.renkSinif}`)} aria-label="Sponsorlu: ${kac(k.marka)}"><div class="rk-firin-sahne"><img class="rk-firin-foto" src="${k.resim}" width="1200" height="800" alt="${kac(k.baslik)}" loading="lazy" decoding="async"><span class="rk-firin-rozet">${etiket()}</span><details class="rk-foto-nokta rk-firin-nokta" data-x="52" data-y="48"><summary aria-expanded="false" aria-label="Sponsorlu ürün: ${kac(k.baslik)}"><span class="rk-nokta-hap rk-nokta-marka"><span class="rk-nokta-logo">${amblem(k)}</span></span></summary><div class="rk-foto-kart rk-slot rk-firin-kart ${k.renkSinif}" role="group" aria-label="${kac(k.baslik)}"><div class="rk-foto-baslik"><div class="rk-foto-kimlik"><span class="rk-foto-logo">${logo(k)}</span></div>${etiket()}</div><div class="rk-foto-metin"><b>${k.baslik}</b><p>${k.metin}</p></div><a class="rk-foto-cta rk-firin-bag" ${bag(kod)}>İncele →</a></div></details></div></section>`;
}
// x-reklam.olcu (OB-DONUSTURUCU): hesaplayıcı sonucunun altında 64 px ürünlü modül
function donusturucu(kod) {
  const k = kreatif(kod);
  return `<article ${kok(kod, null, `rk-slot rk-ob rk-ob-donusturucu ${k.renkSinif}`)}><div class="rk-ob-icerik"><div class="rk-ob-kimlik"><span class="rk-ob-logo">${logo(k)}</span><span class="rk-ob-wordmark">${k.marka}</span><span class="rk-ob-rozet">Sponsorlu${ORNEK}</span></div><img class="rk-ob-urun" src="${k.resim}" alt="" loading="lazy"><h3 title="${kac(k.baslik)}">${k.baslik}</h3><p title="${kac(k.metin)}">${k.metin}</p><a class="rk-ob-cta" ${bag(kod)}>İncele ${ik('fa-arrow-right')}</a></div></article>`;
}
// x-reklam.klinik-koridor: tam hâl (DN-FRIDGE + DN-P1…P5, /diyetisyenler bandının yerine) ve dar hâl (KL-*)
const KAPILAR = [['DN-P1', 107, 455, 60, 560], ['DN-P2', 895, 455, 935, 600], ['DN-P3', 282, 470, 240, 520], ['DN-P4', 720, 470, 768, 540], ['DN-P5', 500, 470, 500, 470]];
function koridor(kod, { dar = false, ust = '' } = {}) {
  const sponsor = kreatif(kod);
  const grup = dar ? '-' + kod.toLowerCase() : '';
  const gorusme = (d) => (d.online && d.yuz_yuze ? 'Online ve yüz yüze' : d.online ? 'Online' : 'Yüz yüze');
  const kapilar = KAPILAR.map(([kapi, x, y, mx, my], i) => {
    const d = DIYETISYENLER[i];
    const ilk = d.ad.replace(/^(Uzm\. )?Dyt\. /, '').split(' ')[0];
    return `<details class="rk-foto-nokta rk-renk-009a44 rk-dinleniyor"${dar ? '' : ` id="rk-${kapi}"`} name="koridor-kapilari${grup}" data-x="${x}" data-y="${y}" data-mx="${mx}" data-my="${my}" data-kapi="${i + 1}"><span class="rk-nokta-filtre" aria-hidden="true"></span><summary aria-expanded="false" aria-label="Sponsorlu diyetisyen: ${kac(d.ad)}"><span class="rk-nokta-hap rk-nokta-marka kk-hap"><span class="rk-nokta-logo"><span class="kk-bas" aria-hidden="true">${d.harf}</span></span><span class="kk-hap-ad">Diyetisyen ${kac(ilk)}</span></span></summary><div class="rk-foto-kart rk-slot rk-renk-009a44 kk-kart" data-rk-slot="${dar ? kod : kapi}" data-kk-marka="${sponsor.renk}"><div class="rk-foto-baslik"><div class="rk-foto-kimlik"><span class="rk-foto-logo kk-sponsor-logo"><img class="kk-logo" src="${sponsor.logo}" alt="${kac(sponsor.marka)}"></span></div><span class="rk-etiket kk-sponsorlu">Sponsorlu${ORNEK}</span></div><div class="kk-kimlik"><span class="kk-avatar kk-bas" aria-hidden="true">${d.harf}</span><div><b class="kk-ad">${kac(d.ad)}</b><span class="kk-unvan">${kac(d.unvan)}</span></div></div><ul class="kk-satirlar"><li>${ik('fa-stethoscope')}<span>${d.uzmanlik.map(kac).join(' · ')}</span></li><li>${ik('fa-location-dot')}<span>${kac(d.sehir)} · ${gorusme(d)}</span></li></ul><div class="kk-ctalar"><a class="rk-foto-cta kk-cta-birincil" href="${K}diyetisyen/dyt-elif-sahin/">Profili gör</a><a class="rk-foto-cta kk-cta-ikincil" href="${K}diyetisyen/dyt-ece-tunali/#p-randevu">Randevu al</a></div></div></details>`;
  }).join('');
  return `<section ${kok(kod, null, `${dar ? 'kk-dar' : 'lst-top'} kk-koridor rk-dolap rk-slot rk-renk-009a44`, ` data-kk-marka="${sponsor.renk}"`)} aria-label="Sponsorlu klinik koridoru"><div class="rk-dolap-sahne"><div class="rk-dolap-kadraj kk-kadraj"><div class="rk-nk rk-nk--klinik_koridor" data-rk-nk="" data-rk-nk-cerceve="oto" data-rk-nk-kip="site"><picture class="rk-nk-resim"><source media="(max-width: 640px)" srcset="${K}assets/img/reklam/demo/koridor-mobil.webp"><img class="rk-nk-gorsel" src="${K}assets/img/reklam/demo/koridor-masaustu.webp" alt="${kac(sponsor.marka)} sponsorluğunda klinik koridoru" decoding="async"></picture><span class="kk-karartma" aria-hidden="true"></span>${kapilar}</div></div>${dar ? '' : `<div class="kk-ust"><div class="wrap kap">${ust}</div></div>`}<a class="rk-dolap-kunye kk-sponsor" ${bag(kod)} aria-label="${kac(sponsor.marka)} sponsorluğunda"><span class="kk-sponsor-logo-alan"><img class="kk-logo" src="${sponsor.logo}" alt="${kac(sponsor.marka)}"></span><span class="kk-sponsor-metin"><span class="kk-sponsor-alt">sponsorluğunda</span><span class="rk-etiket kk-sponsorlu">Sponsorlu${ORNEK}</span></span></a><p class="rk-dolap-not kk-not">Kapılara dokunarak diyetisyenleri incele</p></div></section>`;
}
// x-reklam.partnerler (AL-P1…P4): alışveriş listesi paneli
function partnerler() {
  const kodlar = ['AL-P1', 'AL-P2', 'AL-P3', 'AL-P4'];
  const kart = (kod, i) => {
    const k = kreatif(kod), ana = i === 0;
    return `<div class="rk-slot rk-market-partner ${ana ? 'rk-market-ana' : 'rk-market-kompakt'} ${k.renkSinif}" id="rk-${kod}" data-rk-slot="${kod}"><a ${bag(kod)}>${ana ? `<img class="rk-market-filigran" src="${k.logo}" alt="" aria-hidden="true"><span class="rk-market-ana-hap">Ana Sponsor</span>` : ''}<span class="rk-market-logo"><img src="${k.logo}" alt="${kac(k.marka)}"></span><span class="rk-market-metin"><b>${ana ? `${k.marka}'de sipariş ver` : k.marka}</b>${ana ? '<span>Listendeki kalemler sepete hazır (örnek)</span>' : '<span class="rk-market-stok">Örnek stok</span>'}</span>${ana ? `<span class="rk-market-cta">Sepeti ${k.marka}'e Aktar ${ik('fa-arrow-right')}</span>` : `<span class="rk-market-aktar">Aktar ${ik('fa-arrow-right')}</span>`}</a></div>`;
  };
  return `<aside class="rk-market-panel shop-summary" aria-label="Listeni Nereden Alırsın?" data-rk-partner-panel><h3>Listeni Nereden Alırsın?</h3><span class="rk-market-etiket">Sponsorlu${ORNEK}</span><div class="rk-market-secenekler">${kodlar.map(kart).join('')}</div><p class="rk-market-not">Demo stok bilgisi · Canlı stok değildir.</p></aside>`;
}
// x-reklam.liste-partner (TD-LISTE-PARTNER)
function listePartner(kod) {
  const k = kreatif(kod);
  return `<a ${kok(kod, null, `rk-slot rk-liste-partner ${k.renkSinif}`)} ${bag(kod)}><span class="rk-liste-partner-logo"><img src="${k.amblem}" alt="${kac(k.marka)}" loading="lazy"></span><span class="rk-liste-partner-yazi">${k.marka} ile sipariş et →</span><span class="rk-liste-partner-rozet">Sponsorlu${ORNEK}</span></a>`;
}
// Sipariş kanalı satırı (TD-SIPARIS-YS, TD-SIPARIS-A101): sipariş penceresindeki satır
function siparisKanal(kod) {
  const k = kreatif(kod);
  return `<a ${kok(kod, null, `rk-siparis-kanal rk-siparis-partner rk-slot ${k.renkSinif}`)} ${bag(kod)}><span class="rk-siparis-logo">${logo(k)}</span><span>${k.marka}<small>Sponsorlu · prototip örneği</small></span>${ik('fa-arrow-up-right-from-square')}</a>`;
}
// x-reklam.standart (STD-SIDE, STD-SIDE-LEFT, STD-POPUP, STD-ALTBAR, STD-VIDEO)
function standart(kod, bicim, { vitrin = false } = {}) {
  const k = kreatif(kod);
  const medya = bicim === 'side' || bicim === 'popup' ? `<div class="rk-std-medya">${bicim === 'side' ? '<span class="rk-side-image">' : ''}<img src="${k.resim}" alt="" loading="lazy" width="640" height="480">${bicim === 'side' ? '</span>' : ''}</div>` : '';
  const video = bicim === 'video' ? `<div class="rk-std-video-medya" data-rk-video><video poster="${K}assets/img/hero/anasayfa-sh-hero-vid.webp" preload="none" playsinline muted loop data-rk-src="${K}assets/video/diet-hero.mp4" aria-label="${kac(k.baslik)} (örnek video)"></video><button type="button" class="rk-video-baslat" aria-label="Videoyu başlat" hidden>${ik('fa-play')}</button><button type="button" class="rk-std-oynat" aria-label="Videoyu oynat">${ik('fa-play')}</button><button type="button" class="rk-std-ses" aria-label="Sesi aç" aria-pressed="false">${ik('fa-volume-xmark')}</button></div>` : '';
  const urun = bicim === 'altbar' && k.tur === 'urun' ? `<span class="rk-altbar-urun"><img src="${k.resim}" alt="" width="40" height="40" loading="lazy" decoding="async"></span>` : '';
  return `<aside class="rk-std rk-std-${bicim} ${k.renkSinif}" id="rk-${kod}" data-rk-bicim="${bicim}" data-rk-popup-varyant="gorsel" data-rk-popup-sira="video,gorsel" data-rk-popup-aralik="4" data-rk-popup-gun="1" data-rk-kampanya="ornek" data-rk-oturum="1" data-rk-gun="1" data-rk-kapatma="24" data-rk-slot="${kod}"${vitrin ? '' : ' hidden'} aria-label="Sponsorlu · ${kac(k.marka)}"><div class="rk-std-kart"${bicim === 'popup' ? ` role="dialog" aria-modal="true" aria-label="${kac(k.baslik)} · Sponsorlu" tabindex="-1"` : ''}>${bicim !== 'video' ? '<button type="button" class="rk-std-kapat" aria-label="Reklamı kapat"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>' : ''}${medya}${video}<div class="rk-std-mesaj"><span class="rk-std-logo">${amblem(k, kac(k.marka))}</span>${urun}<div class="rk-std-yazi"><span class="rk-std-etiket">${bicim === 'altbar' ? `<strong>${k.marka}</strong> · ` : ''}Sponsorlu${ORNEK}</span><b>${k.baslik}</b><p>${k.metin}</p></div><a class="rk-std-cta" ${bag(kod)}>${k.cta} <span aria-hidden="true">→</span></a></div></div></aside>`;
}

/* ── Kanca ─────────────────────────────────────────────────────────────── */
/* Biçim seçimi künyenin format_type'ından; `tur` sayfanın komşu kartını ya da yerleşim kabını söyler.
   tur: sar (bölümler arası şerit, kendi kabıyla) · bant (yayılım üst/alt şeridi) · yan (yayılım kenar kutusu) · kart türü (yatay, sonuc, medya, ikon, uzman) */
export function reklamHtml(kod, s = {}) {
  const a = alan(kod);
  const f = a.format;
  if (s.tur === 'bant') return `<div class="rk-yayilim-alan${s.kap === false ? '' : ' kap'} rk-yayilim-bant" data-rk-yayilim="${kac(a.aile)}" data-rk-konum="${s.konum ?? 'ust'}" aria-label="Sponsorlu içerik">${serit(kod)}</div>`;
  if (s.tur === 'yan') return `<div class="rk-yayilim-alan rk-yayilim-side" data-rk-yayilim="${kac(a.aile)}" data-rk-konum="sidebar" aria-label="Sponsorlu içerik">${rectangle(kod)}</div>`;
  if (s.tur === 'liste-sira') return `<div class="rk-liste-sira" data-rk-yer-kap="${kac(kod)}">${serit(kod)}</div>`;
  let ic;
  if (s.tur === 'filtre') ic = filtre(kod);
  else if (s.tur === 'tema') ic = tema(kod);
  else if (s.tur === 'pisirme') ic = pisirme(kod);
  else if (kod === 'AS-DAY') ic = gununSponsoru(kod);
  else if (kod === 'HD-WEEK') ic = hafta(kod);
  else if (kod === 'HD-DOLAP-SPON') ic = dolapMenu(kod);
  else if (kod === 'HD-MEGA' || kod === 'menu.secki-hucresi') ic = menu(kod);
  else if (kod === 'AN-N1' || kod === 'ansiklopedi-liste.kategori-rozeti') ic = katSponsor(kod, s.kategori);
  else if (kod === 'DN-RAIL') ic = besinSatiri(kod);
  else if (kod === 'TD-ING') ic = malzeme(kod);
  else if (kod === 'TD-PHOTO') ic = fotoNokta(kod, s.nokta);
  else if (kod === 'OB-FIRIN') ic = firin(kod);
  else if (kod === 'OB-DONUSTURUCU') ic = donusturucu(kod);
  else if (kod === 'DN-FRIDGE') ic = koridor(kod, { ust: s.ust });
  else if (f === 'klinik_koridor') ic = koridor(kod, { dar: true });
  else if (/^AL-P/.test(kod)) ic = partnerler();
  else if (kod === 'TD-LISTE-PARTNER') ic = listePartner(kod);
  else if (kod.startsWith('TD-SIPARIS')) ic = siparisKanal(kod);
  else if (f === 'native_chef' || kod === 'ana-sayfa.marka-sef-karti') ic = sefKart(kod);
  else if (f === 'native_category') ic = kucukKart(kod, s.tur === 'ikon' ? 'ikon' : 'kategori');
  else if (f === 'native_video') ic = kucukKart(kod, 'video');
  else if (f === 'native_recipe' || f === 'native_module') ic = nativeKart(kod, s.tur);
  else if (f === 'native_signature') ic = eslik(kod);
  else if (f === 'native_rectangle') ic = rectangle(kod);
  else if (f === 'native_panel' && s.tur === 'pano') ic = pano(kod);
  else if (f === 'side' || f === 'popup' || f === 'altbar' || f === 'video') ic = standart(kod, f, s);
  else ic = serit(kod);
  return s.tur === 'sar' ? `<div class="${s.kap === false ? '' : 'kap '}rk-sar" data-rk-yer-kap="${kac(kod)}">${ic}</div>` : ic;
}

/* `<template>` kancası. sira: içinde bulunduğu kabın N. öğesi olarak açılır (kanca kabın sonunda durur, kabın sayımını
   ve :first-child kurallarını bozmaz). hedef + yon: kancanın dışındaki bir öğeye göre açılır (yerine: o öğenin yerine geçer). */
export function reklamYeri(kod, s = {}) {
  const kodlar = Array.isArray(kod) ? kod : [kod];
  kodlar.forEach(alan);
  const ek = [s.sira && `data-rk-sira="${s.sira}"`, s.hedef && `data-rk-hedef="${kac(s.hedef)}"`, s.yon && `data-rk-yon="${s.yon}"`, s.yayilim && 'data-rk-yayilim-yeri'].filter(Boolean).map((x) => ' ' + x).join('');
  return `<template data-rk-yer="${kodlar.map(kac).join(' ')}"${ek}>${s.html ?? reklamHtml(kodlar[0], s)}</template>`;
}

/* Kabuğun standart katmanı (StandartReklamlar ara katmanı → x-reklam.standart-katman): yan çift, pop-up, alt bant; ayrıca videolu banner. */
export function standartKatman() {
  const katman = `<div data-rk-standart data-rk-kilitli="0" data-rk-gecikme="9" data-rk-sayfa="0" data-rk-popup-izin="1" data-rk-popup-sayac="0"><div data-rk-side-pair>${standart('STD-SIDE-LEFT', 'side')}${standart('STD-SIDE', 'side')}</div>${standart('STD-POPUP', 'popup')}${standart('STD-ALTBAR', 'altbar')}</div>`;
  return reklamYeri(['STD-SIDE-LEFT', 'STD-SIDE', 'STD-POPUP', 'STD-ALTBAR'], { html: katman })
    + reklamYeri('STD-VIDEO', { html: `<div class="rk-video-slot" data-rk-video-format="serit">${standart('STD-VIDEO', 'video', { vitrin: true })}</div>`, hedef: 'yayilim' });
}

/* Ekran haritası ve satış vitrini için özet */
export const reklamOzet = () => {
  const yerlesik = ALANLAR.filter((a) => a.durum === 'yerlesik');
  return {
    alan: ALANLAR.length,
    format: new Set(ALANLAR.map((a) => a.format).filter(Boolean)).size,
    yerlesik: yerlesik.length,
    yok: ALANLAR.filter((a) => a.durum === 'yok').length,
    uye: ALANLAR.filter((a) => a.durum === 'uye').length,
    sayfa: new Set(yerlesik.map((a) => a.yol)).size,
  };
};
/* Önizleme adresi: kabuk alanları ana sayfada açılır */
export const onizlemeYolu = (a) => (a.yol === 'kabuk' ? '' : a.yol);
