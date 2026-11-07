// Arama: GET ?q= sonuç kabuğu. Dizin derlemede sayfaya gömülür, besin DD_VERI'den okunur.
import { K, JS, kirinti, ikon, jsonGom, DETAY } from '../../parcalar/public-araclar/ortak.mjs';

const SEKMELER = [['tumu', 'Tümü', 'fa-layer-group'], ['hesap', 'Araçlar', 'fa-calculator'], ['besin', 'Besinler', 'fa-leaf'], ['program', 'Programlar', 'fa-list-check'], ['rehber', 'Rehber', 'fa-book-open'], ['diyetisyen', 'Diyetisyenler', 'fa-user-doctor']];
const POPULER = ['avokado', 'kalori', 'akdeniz', 'kilo', 'çorba', 'protein', 'aralıklı oruç', 'diyetisyen'];

export default ({ veri }) => {
  const dizin = [
    ...veri.hesaplayicilar.hesaplayicilar.map((h) => ({ tur: 'hesap', ad: h.ad, metin: h.ozet, href: DETAY.hesaplayici, ikon: h.ikon.replace('fa-solid ', ''), etiket: 'Hesaplayıcı' })),
    ...[['Akıllı Tabak ve Değişim', 'Tabağını kur, muadilini bul', 'akilli-tabak-ve-degisim/', 'fa-chart-pie'], ['Aralıklı Oruç Rehberi', 'Protokolünü ve saatlerini seç', 'aralikli-oruc-rehberi/', 'fa-clock'], ['Besin Karşılaştır', 'İki besini yan yana gör', 'besin-karsilastir/', 'fa-scale-balanced']].map(([ad, metin, href, ikon]) => ({ tur: 'hesap', ad, metin, href, ikon, etiket: 'Araç' })),
    ...veri.testler.testler.map((t) => ({ tur: 'hesap', ad: t.ad, metin: t.aciklama, href: DETAY.test, gorsel: t.gorsel_dosya, etiket: 'Test' })),
    ...veri.programlar.programlar.map((p) => ({ tur: 'program', ad: p.ad, metin: p.aciklama, href: DETAY.program, gorsel: p.gorsel_dosya, etiket: p.sure, tercih: p.tercih, hedef: p.hedef, sure_gun: p.sure_gun })),
    ...veri.rehberler.rehberler.map((r) => ({ tur: 'rehber', ad: r.ad, metin: r.ozet, href: 'besin-rehberi/dengeli-tabak/', gorsel: r.gorsel_dosya, etiket: 'Rehber' })),
    ...veri.diyetisyenler.diyetisyenler.map((d) => ({ tur: 'diyetisyen', ad: d.ad, metin: `${d.uzmanlik[0]} · ${d.sehir}`, href: DETAY.diyetisyen, harf: d.harf, etiket: d.unvan })),
  ];
  const govde = `<section class="bant" data-bant-gorsel="${K}assets/img/hero/besin-kutuphanesi-nb-top.webp"><div class="kap">
${kirinti(['Arama'])}<span class="ust-etiket">${ikon('fa-seedling')} Dada Diet · Arama</span>
<h1 id="aramaBaslik">Dada Diet'te <span class="vurgu">ara</span></h1>
<p class="bant-alt" id="aramaGiris">Hesaplayıcı, besin, program, rehber ya da diyetisyen: tek kutudan tüm içerikte ara.</p>
<form class="arama-kutu" id="aramaForm" role="search" autocomplete="off" method="get" action="${K}arama/"><div class="arama-satir"><div class="arama-girdi-kap">${ikon('fa-magnifying-glass')}<input id="aramaGirdi" name="q" type="search" placeholder="Hesaplayıcı, besin, program veya diyetisyen ara" aria-label="Dada Diet içeriğinde ara"></div><button class="dugme birincil" type="submit">${ikon('fa-magnifying-glass')} Ara</button></div></form>
<p class="arama-ozet" id="aramaOzet"></p>
</div></section>
<section class="arama-pop dikis bant-ustunde" id="aramaPop"><div class="kap"><h3>${ikon('fa-fire')} Popüler Aramalar</h3><div class="cipler">${POPULER.map((p) => `<a class="cip hap" href="${K}arama/?q=${encodeURIComponent(p)}">${p}</a>`).join('')}</div></div></section>
<div class="sekme-ray yapiskan dikis bant-ustunde" id="aramaSekme" hidden><div class="kap"><div class="sekmeler" role="tablist" aria-label="İçerik türü">${SEKMELER.map(([v, a, i], n) => `<button class="sekme${n === 0 ? ' aktif' : ''}" type="button" role="tab" data-tur="${v}" aria-selected="${n === 0}"${n ? ' tabindex="-1"' : ''}>${ikon(i)} ${a} <span class="sekme-sayi" data-sayi="${v}">0</span></button>`).join('')}</div></div></div>
<section class="sonuc-bant" id="aramaSonuc" hidden aria-live="polite"><div class="kap"><p class="sonuc-not" id="aramaNot"></p><div class="sonuc-izgara" id="aramaIzgara"></div><div class="bos-durum kart-ici" id="aramaBos" hidden><span class="bos-ikon">${ikon('fa-magnifying-glass')}</span><h3>Bu aramada sonuç yok</h3><p>Yazımı kontrol et ya da daha genel bir kelime dene.</p><a class="dugme birincil" href="${K}besin-kutuphanesi/">Besin kütüphanesine git</a></div></div></section>
<div class="uyari-serit"><div class="kap">${ikon('fa-circle-info')}<p>Arama sonuçları genel bilgi amaçlıdır; kişiye özel tıbbi ya da beslenme önerisi değildir.</p></div></div>
${jsonGom('aramaDizin', { dizin, besinDetay: DETAY.besin })}`;
  return [{ yol: 'arama', meta: { baslik: 'Arama', duzen: 'public', hero: true, js: [JS, 'assets/js/tercih-uyum.js', 'assets/js/sayfa/public-araclar-arama.js'] }, govde }];
};
