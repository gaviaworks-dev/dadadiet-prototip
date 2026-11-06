// Public beslenme ve kurumsal ekibin ortak parçaları. Bant, bölüm ve görselli kart public-araclar kalıbıyla aynı bileşendir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bicim } from '../bicim.mjs';

/* public-araclar/ortak.mjs ile aynı markup ve aynı sınıflar. O dosya yazılırken imzası değiştiği için içe aktarılmıyor; lead birleştirir. */
export const K = '{{kok}}';
export const kac = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
export const ikon = (i) => `<i class="${i.includes('fa-solid') ? i : 'fa-solid ' + i}" aria-hidden="true"></i>`;
export const icerik = (dosya) => `${K}assets/img/icerik/${dosya}`;
const kirinti = (...yollar) => `<nav class="kirinti" aria-label="Sayfa yolu"><a class="kirinti-ev" href="${K}">${ikon('fa-house')}<span class="yalniz-okuyucu">Dada Diet ana sayfa</span></a>${yollar.map(([ad, href]) => `${ikon('fa-chevron-right')}${href ? `<a href="${K}${href}">${ad}</a>` : `<span class="kirinti-simdi">${ad}</span>`}`).join('')}</nav>`;
const bantSayilar = (l) => `<dl class="bant-sayilar">${l.map(([s, e]) => `<div><dd>${s}</dd><dt>${e}</dt></div>`).join('')}</dl>`;
/* gorsel: kökten yol (assets/img/...) */
export const bant = ({ yol = [], etiket, etiketIkon = 'fa-seedling', h1, alt, gorsel, sayilar, eylem = '' }) => `<section class="bant"${gorsel ? ` data-bant-gorsel="${K}${gorsel}"` : ''}><div class="kap">
${yol.length ? kirinti(...yol) : ''}<span class="ust-etiket">${ikon(etiketIkon)} ${etiket}</span>
<h1>${h1}</h1>
${alt ? `<p class="bant-alt">${alt}</p>` : ''}${eylem ? `<div class="bant-eylem">${eylem}</div>` : ''}${sayilar ? bantSayilar(sayilar) : ''}
</div></section>`;
export const bolumBas = ({ etiket, ikon: i = 'fa-seedling', baslik, metin: m, arac = '' }) => `<div class="bolum-bas"><div>${etiket ? `<span class="ust-etiket">${ikon(i)} ${etiket}</span>` : ''}<h2>${baslik}</h2>${arac ? `<div class="bolum-araclar">${arac}</div>` : ''}${m ? `<p class="giris-metni">${m}</p>` : ''}</div></div>`;
export const dugme = (m, href, sinif = 'birincil', i, sag) => `<a class="dugme ${sinif}" href="${K}${href}">${i && !sag ? ikon(i) + ' ' : ''}${m}${i && sag ? ' ' + ikon(i) : ''}</a>`;
export const bolum = (html, { ilk = false, id, sinif = '' } = {}) => `<section class="bolum${ilk ? ' dikis bant-ustunde' : ''}${sinif ? ' ' + sinif : ''}"${id ? ` id="${id}"` : ''}><div class="kap">${html}</div></section>`;
export const gorselKart = ({ href, gorsel, rozet, rozetIkon, altRozet, baslik, metin: m, etiketler = '', not = '', git = 'İncele', sinif = '', veri = '' }) => `<a class="sonuc-kart${sinif ? ' ' + sinif : ''}" href="${K}${href}"${veri}><div class="sonuc-gorsel"><img src="${gorsel}" alt="" loading="lazy">${rozet ? `<span class="sonuc-rozet">${rozetIkon ? ikon(rozetIkon) + ' ' : ''}${rozet}</span>` : ''}${altRozet ? `<span class="sonuc-rozet alt">${altRozet}</span>` : ''}</div><div class="sonuc-govde"><h3 class="kart-baslik">${baslik}</h3>${m ? `<p>${m}</p>` : ''}${etiketler ? `<div class="sonuc-etiketler">${etiketler}</div>` : ''}<div class="sonuc-alt">${not ? `<span class="sonuc-not-kisa">${not}</span>` : '<span></span>'}<span class="sonuc-git">${git} ${ikon('fa-arrow-right')}</span></div></div></a>`;
export const ikonKart = ({ href, ikon: i, baslik, metin: m, rozet = '' }) => `<a class="kart ikon-kart" href="${K}${href}"><span class="ikon-kutu">${ikon(i)}</span><span class="ikon-kart-metin"><span class="kart-baslik">${baslik}${rozet}</span><span class="kart-metin">${m}</span></span>${ikon('fa-arrow-right ikon-kart-ok')}</a>`;

const BU = path.dirname(fileURLToPath(import.meta.url));
export const metin = JSON.parse(fs.readFileSync(path.join(BU, 'metin.json'), 'utf8'));

/* Örneklenen detaylar: kart bağlantıları buraya gider. */
export const DETAY = {
  besin: 'besin/avokado/', kacKalori: 'kac-kalori/bir-avuc-badem-kac-kalori/', rehber: 'besin-rehberi/dengeli-tabak/',
  makro: 'makro-rehberi/protein-kaynaklari-hayvansal-bitkisel/', ipucu: 'ipuclari/gunde-ne-kadar-su-icmek-gerekir/',
  puf: 'puflar/buzdolabinda-hangi-raf-neye-ait/', yasal: 'yasal/kvkk/', program: 'program/akdeniz-tipi-beslenme/',
  diyetisyenBul: 'diyetisyen-bul-sihirbazi/',
};

export const sayfa = (yol, baslik, govde, { aktif, js = [] } = {}) => ({
  yol, govde,
  meta: { baslik, duzen: 'public', hero: true, ...(aktif ? { aktif } : {}), js: ['assets/js/sayfa/public-beslenme-ortak.js', ...js.map((a) => `assets/js/sayfa/public-beslenme-${a}.js`)] },
});

export const dizi = (...b) => `<div class="bolum-dizi">${b.join('')}</div>`;
export const sayi = (n, b = 1) => (n === null || n === undefined ? null : bicim.sayi(n, b));
export const deger = (n, birim = 'g', b = 2) => (n === null || n === undefined ? '<span class="veri-yok">veri yok</span>' : `${sayi(n, b)} ${birim}`);
export const araMetni = (...p) => kac(p.filter(Boolean).join(' ').toLocaleLowerCase('tr'));

/* Yasal not: tek kalıp, iki gövde. CTA yalnız canlıda olan sayfalarda. */
const notGovde = '<b>Genel bilgi notu.</b> Bu içerik genel beslenme okuryazarlığını desteklemek amacıyla hazırlanmıştır; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi niteliği taşımaz. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.';
export const bilgiNot = (govde = notGovde, cta = true) => `<div class="bilgi-notu ortali">${ikon('fa-circle-info')}<p>${govde}</p>${cta ? dugme('Diyetisyen Bul', DETAY.diyetisyenBul, 'birincil kucuk', 'fa-arrow-right', true) : ''}</div>`;

/* Süzgeç çipleri: gerçek sayılarla. kalemler: [{ad, deger, sayi, ikon?, tur?, href?}] */
export const cipler = (alan, etiket, kalemler, { aktif = '', sinif = 'dar-kayar' } = {}) => `<div class="cipler ${sinif}" data-suzgec data-alan="${alan}" role="group" aria-label="${kac(etiket)}">${kalemler.map((c) => {
  const ic = `${c.ikon ? ikon(c.ikon) + ' ' : ''}${kac(c.ad)}${c.sayi !== undefined ? ` <span class="cip-sayi">${c.sayi}</span>` : ''}`;
  const ek = `data-deger="${c.deger ?? ''}"${c.sayi !== undefined ? ` data-sayi="${c.sayi}"` : ''}${c.tur ? ` data-tur="${c.tur}"` : ''}`;
  const sn = `cip${(c.deger ?? '') === aktif ? ' aktif' : ''}`;
  return c.href ? `<a class="${sn}" href="${K}${c.href}" ${ek}>${ic}</a>` : `<button class="${sn}" type="button" ${ek}>${ic}</button>`;
}).join('')}</div>`;

export const aramaKutusu = (id, etiket, yerTutucu) => `<div class="alan liste-arama"><label class="alan-etiket" for="${id}">${etiket}</label><input class="alan-girdi" id="${id}" type="search" placeholder="${yerTutucu}" autocomplete="off" data-liste-ara></div>`;

/* Süzgeçli liste kabı: davranış public-beslenme-liste.js. */
export const liste = ({ toplam, birim, ust, kartlar, sinif = 'c3', bosMetin, boyut = 12, altNot = '' }) => `<div class="yigin" data-liste data-toplam="${toplam}" data-birim="${birim}" data-boyut="${boyut}">
<div class="liste-ust yigin sik">${ust}</div>
<p class="sonuc-not-kisa" data-liste-sayac role="status"></p>
<div class="kart-izgara ${sinif}" data-liste-kap>${kartlar}</div>
<div class="bos-durum kart-ici" data-liste-bos hidden><span class="bos-ikon">${ikon('fa-magnifying-glass')}</span><h3>Aramana uyan sonuç yok</h3><p>${bosMetin}</p><button class="dugme birincil" type="button" data-liste-temizle>Süzgeçleri temizle</button></div>
<nav class="sayfalama" aria-label="Sayfalar" data-liste-sayfalama hidden></nav>${altNot}
</div>`;

/* İlgili içerik bölümü */
export const ilgili = ({ etiket, baslik, metin: m, tumu, tumuAd, kartlar, sinif = 'c4' }) => bolum(`${bolumBas({ etiket, ikon: 'fa-arrow-right', baslik, metin: m, arac: tumu ? dugme(tumuAd, tumu, 'hayalet kucuk', 'fa-arrow-right', true) : '' })}<div class="kart-izgara ${sinif}">${kartlar}</div>`);

/* Makale gövdesi: h2, h3, p, ul blokları .okuma içinde tek ölçüyle */
export const bloklar = (l) => l.map((b) => {
  if (b.t === 'h2' || b.t === 'h3') return `<${b.t}${b.id ? ` id="${b.id}"` : ''}>${b.h}</${b.t}>`;
  if (b.t === 'lead') return `<p class="okuma-giris">${b.h}</p>`;
  if (b.t === 'ul' || b.t === 'ol') return `<${b.t}>${b.l.map((x) => `<li>${x}</li>`).join('')}</${b.t}>`;
  return `<p>${b.h}</p>`;
}).join('');

export const kaynakListe = (l) => !l.length ? '' : `<div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-book-medical')} Kaynaklar</h2></div><div class="kart-govde"><ol class="kaynak-liste">${l.map((k) => `<li>${k.a ? `<a href="${kac(k.a)}" target="_blank" rel="noopener">${k.h}</a>` : k.h}</li>`).join('')}</ol></div></div>`;

export const kunyeKart = (baslik, satirlar, ek = '') => `<div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-circle-info')} ${baslik}</h2></div><div class="kart-govde yigin sik"><dl class="kunye tek-sutun">${satirlar.map(([d, v]) => `<div><dt>${d}</dt><dd>${v}</dd></div>`).join('')}</dl>${ek}</div></div>`;

export const paylas = `<button class="dugme hayalet kucuk tam-en" type="button" data-paylas>${ikon('fa-link')} Bağlantıyı kopyala</button>`;

/* Sıralı adımlar: public-araclar .adim-no ile aynı rozet */
export const siraListe = (l) => `<ol class="sira-liste">${l.map(([b, m], i) => `<li><span class="adim-no">${i + 1}</span><div><h3 class="kart-baslik">${b}</h3>${m ? `<p class="kart-metin">${m}</p>` : ''}</div></li>`).join('')}</ol>`;

/* Başlık ve metinli sade kart */
export const metinKart = ({ ikon: i, baslik, metin: m, eylem = '' }) => `<div class="kart"><div class="kart-govde yigin sik">${i ? `<span class="ikon-kutu">${ikon(i)}</span>` : ''}<h3 class="kart-baslik">${baslik}</h3><p class="kart-metin">${m}</p>${eylem}</div></div>`;

export const akordeon = (l) => `<div class="akordeon">${l.map(({ soru, ikon: i = 'fa-circle-question', govde, acik }) => `<div class="akordeon-kalem"><button class="akordeon-bas" type="button" aria-expanded="false"${acik ? ` data-ilk-acik="${acik === true ? '' : acik}"` : ''}><span class="akordeon-ikon">${ikon(i)}</span>${soru}${ikon('fa-chevron-down akordeon-ok')}</button><div class="akordeon-govde">${govde}</div></div>`).join('')}</div>`;

export const kapanis = ({ ikon: i, baslik, metin: m, eylem }) => `<div class="kapanis"><span class="kapanis-ikon">${ikon(i)}</span><h3>${baslik}</h3><p>${m}</p><div class="kapanis-eylemler">${eylem}</div></div>`;
