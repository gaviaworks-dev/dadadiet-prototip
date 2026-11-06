// Public araçlar ekibinin ortak parçaları: bant, kırıntı, bölüm başı, kartlar. Yalnız kanon sınıfları + public-araclar.css.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const logo = fs.readFileSync(path.join(KOK, '_src/kabuk/logo.svg'), 'utf8');
export const K = '{{kok}}';
export const JS = 'assets/js/sayfa/public-araclar-ortak.js';
export const sayfaJs = (...ad) => [JS, ...ad.map((a) => `assets/js/sayfa/public-araclar-${a}.js`)];
export const kac = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
export const jsonGom = (id, v) => `<script type="application/json" id="${id}">${JSON.stringify(v).replace(/</g, '\\u003c')}</script>`;
export const ikon = (i) => `<i class="${i.includes('fa-solid') ? i : 'fa-solid ' + i}" aria-hidden="true"></i>`;
export const icerik = (dosya) => `${K}assets/img/icerik/${dosya}`;
export const sayi = (n) => Number(n).toLocaleString('tr-TR');

/* Örneklenen detaylar: bütün kartlar buraya bağlanır. */
export const DETAY = {
  hesaplayici: 'hesaplayici/gunluk-kalori/', test: 'test/beslenme/', program: 'program/akdeniz-tipi-beslenme/',
  diyetisyen: 'diyetisyen/dyt-elif-sahin/', besin: 'besin/avokado/', tarif: 'tarif/cilbir/',
};

export const kirinti = (...yollar) => `<nav class="kirinti" aria-label="Sayfa yolu"><a class="kirinti-ev" href="${K}">${ikon('fa-house')}<span class="yalniz-okuyucu">Dada Diet ana sayfa</span></a>${yollar.map(([ad, href]) => `${ikon('fa-chevron-right')}${href ? `<a href="${K}${href}">${ad}</a>` : `<span class="kirinti-simdi">${ad}</span>`}`).join('')}</nav>`;

export const bantSayilar = (l) => `<dl class="bant-sayilar">${l.map(([s, e]) => `<div><dd>${s}</dd><dt>${e}</dt></div>`).join('')}</dl>`;

/* Üst bant: tek yükseklik (.bant), tek h1 ölçüsü. Görsel --bant-gorsel üzerinden ortak JS ile basılır. */
export function bant({ yol = [], etiket, etiketIkon = 'fa-seedling', h1, alt, gorsel, sayilar, eylem = '' }) {
  return `<section class="bant"${gorsel ? ` data-bant-gorsel="${K}assets/img/${gorsel}"` : ''}><div class="kap">
${yol.length ? kirinti(...yol) : ''}<span class="ust-etiket">${ikon(etiketIkon)} ${etiket}</span>
<h1>${h1}</h1>
${alt ? `<p class="bant-alt">${alt}</p>` : ''}${eylem ? `<div class="bant-eylem">${eylem}</div>` : ''}${sayilar ? bantSayilar(sayilar) : ''}
</div></section>`;
}

export const bolumBas = ({ etiket, ikon: i = 'fa-seedling', baslik, metin, arac = '' }) => `<div class="bolum-bas"><div>${etiket ? `<span class="ust-etiket">${ikon(i)} ${etiket}</span>` : ''}<h2>${baslik}</h2>${arac ? `<div class="bolum-araclar">${arac}</div>` : ''}${metin ? `<p class="giris-metni">${metin}</p>` : ''}</div></div>`;

export const dugme = (metin, href, sinif = 'birincil', i, sag) => `<a class="dugme ${sinif}" href="${K}${href}">${i && !sag ? ikon(i) + ' ' : ''}${metin}${i && sag ? ' ' + ikon(i) : ''}</a>`;

/* Bölüm: ilk bölüm banda biner (.dikis.bant-ustunde), sonrakiler .bolum-dizi ile dönüşümlü zemin alır. */
export const bolum = (icerikHtml, { ilk = false, id, sinif = '' } = {}) => `<section class="bolum${ilk ? ' dikis bant-ustunde' : ''}${sinif ? ' ' + sinif : ''}"${id ? ` id="${id}"` : ''}><div class="kap">${icerikHtml}</div></section>`;

/* Görselli kart: kanon .sonuc-kart. Başlık her yerde .kart-baslik. */
export const gorselKart = ({ href, gorsel, rozet, rozetIkon, altRozet, baslik, metin, etiketler = '', not = '', git = 'İncele', sinif = '', veri = '' }) => `<a class="sonuc-kart${sinif ? ' ' + sinif : ''}" href="${K}${href}"${veri}><div class="sonuc-gorsel"><img src="${gorsel}" alt="" loading="lazy">${rozet ? `<span class="sonuc-rozet">${rozetIkon ? ikon(rozetIkon) + ' ' : ''}${rozet}</span>` : ''}${altRozet ? `<span class="sonuc-rozet alt">${altRozet}</span>` : ''}</div><div class="sonuc-govde"><h3 class="kart-baslik">${baslik}</h3>${metin ? `<p>${metin}</p>` : ''}${etiketler ? `<div class="sonuc-etiketler">${etiketler}</div>` : ''}<div class="sonuc-alt">${not ? `<span class="sonuc-not-kisa">${not}</span>` : '<span></span>'}<span class="sonuc-git">${git} ${ikon('fa-arrow-right')}</span></div></div></a>`;

const HEDEF_IKON = { dengeli: 'fa-scale-balanced', detoks: 'fa-leaf', oruc: 'fa-hourglass-half', protein: 'fa-drumstick-bite', vegan: 'fa-seedling', seker: 'fa-cubes-stacked', kilo: 'fa-weight-scale', kas: 'fa-dumbbell' };
export const programIkon = (p) => HEDEF_IKON[p.hedef?.[0]] ?? 'fa-list-check';

export const programKart = (p, { gizli = false } = {}) => gorselKart({
  href: DETAY.program, gorsel: icerik(p.gorsel_dosya), rozet: p.kategori, rozetIkon: programIkon(p), altRozet: `${ikon('fa-calendar')} ${p.sure}`,
  baslik: kac(p.ad), metin: kac(p.aciklama),
  etiketler: `<span class="rozet olumlu ikonlu">${ikon('fa-fire')} ${kac(p.enerji)}</span>${p.zorluk !== 'Belirtilmedi' ? `<span class="rozet pasif ikonlu">${ikon('fa-signal')} ${p.zorluk}</span>` : ''}`,
  not: `${p.ogun_sayisi} öğün planı`, sinif: 'buyuk',
  veri: ` data-kart data-hedef="${p.hedef.join(' ')}" data-yasam="${p.yasam.join(' ')}" data-tercih="${p.tercih.join(' ')}" data-ihtiyac="${p.ihtiyac.join(' ')}" data-sure="${p.sure_gun}"${gizli ? ' hidden' : ''}`,
});

export const testKart = (t) => gorselKart({
  href: DETAY.test, gorsel: icerik(t.gorsel_dosya), rozet: t.grup === 'Sağlık & Beslenme' ? 'Sağlık' : 'Eğlence', rozetIkon: t.grup === 'Sağlık & Beslenme' ? 'fa-heart-pulse' : 'fa-gamepad',
  altRozet: `${ikon('fa-circle-question')} ${t.soru_sayisi} soru`, baslik: kac(t.ad), metin: kac(t.aciklama), git: 'Teste başla', sinif: 'buyuk',
  veri: ` data-kart data-grup="${t.grup === 'Sağlık & Beslenme' ? 'saglik' : 'eglence'}"`,
});

export const ikonKart = ({ href, ikon: i, baslik, metin, rozet = '' }) => `<a class="kart ikon-kart" href="${K}${href}"><span class="ikon-kutu">${ikon(i)}</span><span class="ikon-kart-metin"><span class="kart-baslik">${baslik}${rozet}</span><span class="kart-metin">${metin}</span></span>${ikon('fa-arrow-right ikon-kart-ok')}</a>`;

export const hesapKart = (h) => ikonKart({ href: DETAY.hesaplayici, ikon: h.ikon, baslik: kac(h.ad), metin: kac(h.ozet) });

export const gorusme = (d) => d.online && d.yuz_yuze ? 'Online ve yüz yüze' : d.online ? 'Online' : 'Yüz yüze';

/* Diyetisyen kartı: harfli avatar (canlıda fotoğraf yok), puan yoksa "Henüz değerlendirme yok". */
export const uzmanKart = (d, href = DETAY.diyetisyen) => `<a class="kart uzman-kart" href="${K}${href}" data-kart><div class="uzman-bas"><span class="kisi-avatar buyuk" aria-hidden="true">${d.harf}</span><div><h3 class="kart-baslik">${kac(d.ad)}</h3><span class="kart-metin">${d.unvan}</span></div></div><div class="sonuc-etiketler">${d.uzmanlik.map((u) => `<span class="rozet olumlu">${kac(u)}</span>`).join('')}</div><ul class="uzman-meta"><li>${ikon('fa-location-dot')} ${d.sehir}</li><li>${ikon('fa-video')} ${gorusme(d)}</li><li>${ikon('fa-briefcase')} ${d.deneyim_yil} yıl deneyim</li><li>${ikon('fa-star')} ${d.puan ? `${String(d.puan).replace('.', ',')} puan` : 'Henüz değerlendirme yok'}</li></ul><span class="sonuc-git">Profili gör ${ikon('fa-arrow-right')}</span></a>`;

export const genelNot = `<div class="bilgi-notu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><p>Bu içerik genel beslenme okuryazarlığını desteklemek amacıyla hazırlanmıştır; <b>tıbbi teşhis veya tedavi yerine geçmez</b>. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır. Gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.</p></div>`;

/* Tam ekran sihirbaz kabuğu: kanon .sihirbaz iç bileşenleri. */
export const sihirbazKabuk = ({ id, cikis, govde, ek = '' }) => `<div class="sihirbaz" id="sihirbaz" data-sihirbaz="${id}">
<header class="sihirbaz-ust"><a href="${K}" aria-label="Dada Diet ana sayfa">${logo}</a>
<div class="sihirbaz-ilerleme"><div class="olcer hap" role="progressbar" aria-label="Sihirbaz ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="ilerleme" data-oran="0"></span></div><span class="sihirbaz-sayac" id="sayac" aria-live="polite"></span></div>
<a class="kapat-dugme" href="${K}${cikis}" aria-label="Sihirbazdan çık">${ikon('fa-xmark')}</a></header>
<main class="sihirbaz-govde" id="sihirbazGovde">${govde}</main>
<footer class="sihirbaz-ayak" id="sihirbazAyak"><button class="dugme hayalet" id="geri" type="button">${ikon('fa-arrow-left')} Geri</button><div class="sag"><span class="alan-hata" id="adimHata" role="alert"></span><button class="dugme birincil" id="ileri" type="button">Devam et ${ikon('fa-arrow-right')}</button></div></footer>
</div>${ek}`;

export const secenek = ({ deger, baslik, alt, ikon: i }) => `<button class="secenek" type="button" data-deger="${deger}" aria-pressed="false">${i ? ikon(i) : ''}<span>${baslik}${alt ? `<small>${alt}</small>` : ''}</span></button>`;

/* Adım: tek seçim alanları. alanlar: [{ad, etiket?, secenekler, sinif?, coklu?, istege?}] */
export const adim = ({ id, baslik, alt, alanlar, gorsel, gorselIkon, sonuc = false }) => `<section class="sihirbaz-adim" data-adim="${id}"${gorsel ? ` data-gorsel="${K}assets/img/${gorsel}"` : ''}${gorselIkon ? ` data-gorsel-ikon="${gorselIkon}"` : ''} hidden><h1 tabindex="-1">${baslik}</h1><p>${alt}</p>${alanlar.map((a) => `${a.etiket ? `<h2 class="kart-baslik sihirbaz-alt-baslik">${a.etiket}</h2>` : ''}<div class="secenek-izgara${a.sinif ? ' ' + a.sinif : ''}" data-alan="${a.ad}"${a.istege ? ' data-istege="1"' : ''}${a.kosul ? ` data-kosul="${a.kosul}" hidden` : ''} ${a.coklu ? 'data-coklu-secim' : 'data-tek-secim'} role="group" aria-label="${a.etiket ?? baslik}">${a.secenekler.map(secenek).join('')}</div>`).join('')}</section>`;
