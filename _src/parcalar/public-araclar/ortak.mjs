// Public araçlar ekibinin ortak parçaları: bant, kırıntı, bölüm başı, kartlar. Yalnız kanon sınıfları + public-araclar.css.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bicim } from '../bicim.mjs';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const logo = fs.readFileSync(path.join(KOK, '_src/kabuk/logo.svg'), 'utf8');
export const K = '{{kok}}';
export const JS = 'assets/js/sayfa/public-araclar-ortak.js';
export const sayfaJs = (...ad) => [JS, ...ad.map((a) => `assets/js/sayfa/public-araclar-${a}.js`)];
export const kac = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
export const jsonGom = (id, v) => `<script type="application/json" id="${id}">${JSON.stringify(v).replace(/</g, '\\u003c')}</script>`;
export const ikon = (i) => `<i class="${i.includes('fa-solid') ? i : 'fa-solid ' + i}" aria-hidden="true"></i>`;
export const icerik = (dosya) => `${K}assets/img/icerik/${dosya}`;
export const sayi = (n) => bicim.sayi(n, 3);

/* Örneklenen detaylar: bütün kartlar buraya bağlanır. */
export const DETAY = {
  hesaplayici: 'hesaplayici/gunluk-kalori/', test: 'test/beslenme/', program: 'program/akdeniz-tipi-beslenme/',
  diyetisyen: 'diyetisyen/dyt-elif-sahin/', besin: 'besin/avokado/',
};

export const kirinti = (...yollar) => `<nav class="kirinti" aria-label="Sayfa yolu"><a class="kirinti-ev" href="${K}">${ikon('fa-house')}<span class="yalniz-okuyucu">Dada Diet ana sayfa</span></a>${yollar.map(([ad, href]) => `${ikon('fa-chevron-right')}${href ? `<a href="${K}${href}">${ad}</a>` : `<span class="kirinti-simdi">${ad}</span>`}`).join('')}</nav>`;

export const bantSayilar = (l) => `<dl class="bant-sayilar">${l.map(([s, e]) => `<div><dd>${s}</dd><dt>${e}</dt></div>`).join('')}</dl>`;

/* Üst bant: tek yükseklik (.bant), tek h1 ölçüsü. Görsel --bant-gorsel üzerinden ortak JS ile basılır. */
export function bant({ yol = [], etiket, etiketIkon = 'fa-seedling', h1, alt, gorsel, sayilar, eylem = '', alttaki = '' }) {
  return `<section class="bant"${gorsel ? ` data-bant-gorsel="${K}assets/img/${gorsel}"` : ''}><div class="kap">
${yol.length ? kirinti(...yol) : ''}<span class="ust-etiket">${ikon(etiketIkon)} ${etiket}</span>
<h1>${h1}</h1>
${alt ? `<p class="bant-alt">${alt}</p>` : ''}${eylem ? `<div class="bant-eylem">${eylem}</div>` : ''}${alttaki}${sayilar ? bantSayilar(sayilar) : ''}
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

/* Liste süzgeci için: günlük enerjinin alt sınırı üç banda, öğün sayısı güne bölünür (veri toplam öğünü taşır) */
export const enerjiBandi = (p) => { const n = parseInt(String(p.enerji).replace(/\./g, '').match(/\d+/)?.[0] ?? '0', 10); return n < 1500 ? 'alt' : n < 1800 ? 'orta' : 'ust'; };
export const gunlukOgun = (p) => Math.round(p.ogun_sayisi / (p.sure_gun || 1));
export const programKart = (p, { gizli = false } = {}) => gorselKart({
  href: DETAY.program, gorsel: icerik(p.gorsel_dosya), rozet: p.kategori, rozetIkon: programIkon(p), altRozet: `${ikon('fa-calendar')} ${p.sure}`,
  baslik: kac(p.ad), metin: kac(p.aciklama),
  etiketler: `<span class="rozet olumlu ikonlu">${ikon('fa-fire')} ${kac(p.enerji)}</span>${p.zorluk !== 'Belirtilmedi' ? `<span class="rozet pasif ikonlu">${ikon('fa-signal')} ${p.zorluk}</span>` : ''}`,
  not: `${p.ogun_sayisi} öğün planı`, sinif: 'buyuk',
  veri: ` data-kart data-hedef="${p.hedef.join(' ')}" data-yasam="${p.yasam.join(' ')}" data-tercih="${p.tercih.join(' ')}" data-ihtiyac="${p.ihtiyac.join(' ')}" data-sure="${p.sure_gun}" data-zorluk="${p.zorluk}" data-enerji="${enerjiBandi(p)}" data-ogun="${gunlukOgun(p)}"${gizli ? ' hidden' : ''}`,
});

export const testKart = (t) => gorselKart({
  href: DETAY.test, gorsel: icerik(t.gorsel_dosya), rozet: t.grup === 'Sağlık & Beslenme' ? 'Sağlık' : 'Eğlence', rozetIkon: t.grup === 'Sağlık & Beslenme' ? 'fa-heart-pulse' : 'fa-gamepad',
  altRozet: `${ikon('fa-circle-question')} ${t.soru_sayisi} soru · 3 dk`, baslik: kac(t.ad), metin: kac(t.aciklama), git: 'Teste başla', sinif: 'buyuk',
  veri: ` data-kart data-grup="${t.grup === 'Sağlık & Beslenme' ? 'saglik' : 'eglence'}"`,
});

const testGrup = (t) => (t.grup === 'Sağlık & Beslenme' ? 'saglik' : 'eglence');
const medyaKart = (t, { ust = '', alt, veri = '' }) => `<a class="medya-kart" href="${K}${DETAY.test}"${veri}><div class="medya-kart-gorsel"><img src="${icerik(t.gorsel_dosya)}" alt="" loading="lazy">${ust}</div><div class="medya-kart-govde"><h3 class="medya-kart-baslik">${kac(t.ad)}</h3><p class="medya-kart-metin">${kac(t.aciklama)}</p><div class="medya-kart-alt">${alt}</div></div></a>`;
const testGit = `<span class="medya-kart-git">Başla ${ikon('fa-arrow-right')}</span>`;

/* Canlı test listesi kartı: görselde rozet yok, soru sayısı alt satırda. */
export const testListeKart = (t) => medyaKart(t, { alt: `<span>${ikon('fa-clipboard-question')} ${t.soru_sayisi} soru</span>${testGit}`, veri: ` data-kart data-grup="${testGrup(t)}"` });

/* Canlı "Diğer Testler" kartı: grup ve soru sayısı görselin üstünde. */
export const testOneriKart = (t) => medyaKart(t, { ust: `<span class="medya-kart-kategori">${kac(t.grup)}</span><span class="medya-kart-etiket">${ikon('fa-circle-question')} ${t.soru_sayisi} soru</span>`, alt: testGit });

export const ikonKart = ({ href, ikon: i, baslik, metin, rozet = '', ek = '' }) => `<a class="kart ikon-kart" href="${K}${href}"${ek}><span class="ikon-kutu">${ikon(i)}</span><span class="ikon-kart-metin"><span class="kart-baslik">${baslik}${rozet}</span><span class="kart-metin">${metin}</span></span>${ikon('fa-arrow-right ikon-kart-ok')}</a>`;

export const hesapKart = (h, ek = '') => ikonKart({ href: DETAY.hesaplayici, ikon: h.ikon, baslik: kac(h.ad), metin: kac(h.ozet), ek });

export const gorusme = (d) => d.online && d.yuz_yuze ? 'Online ve yüz yüze' : d.online ? 'Online' : 'Yüz yüze';

/* Diyetisyen kartı: canlı iskelet. Ton sırası komşu kartları ayırır; 10 yıl ve üzeri deneyim öne çıkar (veriden gelir). */
const KART_TONLARI = ['koyu', 'acik', 'marka', 'orta'];
const UZMANLIK_IKON = { 'Kilo Yönetimi': 'fa-weight-scale', 'Sporcu Beslenmesi': 'fa-dumbbell', 'Gebelik & Emzirme': 'fa-person-pregnant', 'Geriatri Beslenmesi': 'fa-person-cane', 'Hormonal Denge & PCOS': 'fa-venus', 'Bağırsak Sağlığı': 'fa-seedling' };
const kartGorusme = (d) => (d.online && d.yuz_yuze ? 'Online &amp; Yüz yüze' : d.online ? 'Online' : 'Yüz yüze');
/* Örnek profil verisi (puan, fiyat, doğrulama) iki hâlli basılır: ?bos=1'de [data-bos] canlıdaki boş hâl görünür */
const kartFiyat = (f) => (f.min === f.max ? bicim.para(f.min) : `${bicim.para(f.min)}–${bicim.sayi(f.max)}`);
export const uzmanKart = (d, sira = 0, href = d.yol ? d.yol.replace(/^\//, '') + '/' : DETAY.diyetisyen) => {
  const oneCikan = d.deneyim_yil >= 10;
  const puan = d.puan ? `<span data-ornek>${ikon('fa-star')} ${bicim.sayi(d.puan, 1, 1)} (${d.degerlendirme_sayisi} yorum)</span><span data-bos>Henüz değerlendirme yok</span>` : 'Henüz değerlendirme yok';
  const ek = `${d.dogrulandi ? `<span data-ornek>${ikon('fa-circle-check')} Doğrulandı</span>` : ''}${d.fiyat_araligi ? `<span data-ornek>${ikon('fa-tag')} ${kartFiyat(d.fiyat_araligi)}</span>` : ''}`;
  return `<a class="vitrin-kart${oneCikan ? ' one-cikan' : ''}" data-ton="${KART_TONLARI[sira % KART_TONLARI.length]}" href="${K}${href}" data-kart data-uzmanlik="${kac(d.uzmanlik.join('|'))}" data-gorusme="${[d.online && 'online', d.yuz_yuze && 'yuz'].filter(Boolean).join(' ')}" data-sehir="${d.sehir}" data-dogrulama="${d.dogrulandi ? '1' : ''}" data-dil="${kac((d.diller || []).join('|'))}" data-fiyat-bant="${d.fiyat_bant || ''}" data-deneyim="${d.deneyim_yil}" data-puan="${d.puan ?? ''}" data-degerlendirme="${d.degerlendirme_sayisi}" data-fiyat="${d.fiyat_araligi?.min ?? ''}">${oneCikan ? `<span class="vitrin-kart-kurdele">${ikon('fa-award')} 10+ yıl deneyim</span>` : ''}<span class="vitrin-kart-serit" aria-hidden="true">${ikon(UZMANLIK_IKON[d.uzmanlik[0]] ?? 'fa-leaf')}</span><div class="vitrin-kart-ust"><div class="vitrin-kart-avatar"><span aria-hidden="true">${d.harf}</span></div><div class="vitrin-kart-kimlik"><h3>${kac(d.ad)}</h3><p class="vitrin-kart-unvan">${d.unvan}</p><div class="vitrin-kart-puan">${puan}</div></div></div><div class="vitrin-kart-etiketler">${d.uzmanlik.map((u) => `<span class="vitrin-kart-etiket">${kac(u)}</span>`).join('')}</div><div class="vitrin-kart-meta"><span>${ikon('fa-location-dot')} ${d.sehir}</span><span>${ikon('fa-video')} ${kartGorusme(d)}</span>${ek}</div><div class="vitrin-kart-alt"><span class="vitrin-kart-git">Profili Gör ${ikon('fa-arrow-right')}</span></div></a>`;
};

/* Yatay kart rayı: canlıdaki slider, oklar public-araclar-ray.js ile çalışır */
export const ray = (kartlar, kolon = 'c3', etiket = 'Kartlar') => `<div class="ray-kap" data-ray><button class="ray-ok geri" type="button" aria-label="Geri kaydır" hidden>${ikon('fa-chevron-left')}</button><div class="kart-izgara ${kolon} ray-dar kart-ray" tabindex="0" role="group" aria-label="${etiket}">${kartlar}</div><button class="ray-ok ileri" type="button" aria-label="İleri kaydır">${ikon('fa-chevron-right')}</button></div>`;

/* Adım yolu: canlıdaki numaralı adım şeridi. Sihirbazda ve Nasıl Çalışır'da ortak. */
/* Kalemin 4. öğesi ek öznitelik (ör. bayrak: data-bayrak="ad") */
export const adimYol = (l, id = 'adimYol') => `<ol class="adim-yol" id="${id}">${l.map(([b, m, href, ek], i) => `<li${i === 0 ? ' class="acik"' : ''}${ek ? ' ' + ek : ''}><span>${i + 1}</span>${href ? `<a href="${K}${href}">${b}</a>` : b}<small>${m}</small></li>`).join('')}</ol>`;

export const genelNot = `<div class="bilgi-notu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><p>Bu içerik genel beslenme okuryazarlığını desteklemek amacıyla hazırlanmıştır; <b>tıbbi teşhis veya tedavi yerine geçmez</b>. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır. Gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.</p></div>`;

/* Sihirbaz: canlıdaki gibi bant altında adım yollu kart; sonuç aynı sayfada açılır. İç parçalar kanon .sihirbaz-adim, .secenek. */
export const sihirbazNot = (metin) => `<div class="bilgi-notu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><p>${metin}</p></div>`;
export const sihirbazBolum = ({ id, adimlar, govde, sonuc, not, ek = '' }) => `<section class="bolum dikis bant-ustunde"><div class="kap"><div id="sihirbaz" data-sihirbaz="${id}"><div class="okuma-kolon yigin" id="sihirbazAkis"><div class="kart tasma-kapali" id="sihirbazKart">${adimYol(adimlar)}<div class="kart-govde">${govde}</div><div class="kart-alt"><span class="not" id="sayac" aria-live="polite"></span><span class="alan-hata" id="adimHata" role="alert"></span><div class="eylem-satiri sag-eylem"><button class="dugme hayalet" id="geri" type="button">${ikon('fa-arrow-left')} Geri</button><button class="dugme birincil" id="ileri" type="button">İleri ${ikon('fa-arrow-right')}</button></div></div></div>${sihirbazNot(not)}</div>${sonuc}</div></div></section>${ek}`;
export const guven = (l) => `<div class="hero-video-guven">${l.map(([i, m]) => `<span>${ikon(i)} ${m}</span>`).join('')}</div>`;

export const secenek = ({ deger, baslik, alt, ikon: i }) => `<button class="secenek" type="button" data-deger="${deger}" aria-pressed="false">${i ? ikon(i) : ''}<span>${baslik}${alt ? `<small>${alt}</small>` : ''}</span></button>`;

/* Adım: tek seçim alanları. alanlar: [{ad, etiket?, secenekler, sinif?, coklu?, istege?}] */
export const adim = ({ id, baslik, alt, alanlar }) => `<section class="sihirbaz-adim" data-adim="${id}" hidden><div class="bolum-bas"><div><h2 tabindex="-1">${baslik}</h2><p class="giris-metni">${alt}</p></div></div>${alanlar.map((a) => `${a.etiket ? `<h3 class="kart-baslik sihirbaz-alt-baslik">${a.etiket}</h3>` : ''}<div class="secenek-izgara${a.sinif ? ' ' + a.sinif : ''}" data-alan="${a.ad}"${a.istege ? ' data-istege="1"' : ''}${a.kosul ? ` data-kosul="${a.kosul}" hidden` : ''} ${a.coklu ? 'data-coklu-secim' : 'data-tek-secim'} role="group" aria-label="${a.etiket ?? baslik}">${a.secenekler.map(secenek).join('')}</div>`).join('')}</section>`;
