// Arama: GET ?q= sonuç kabuğu. Dizin derlemede sayfaya gömülür, besin ve tarif DD_VERI'den okunur.
import { K, JS, kirinti, ikon, jsonGom, DETAY } from '../../parcalar/public-araclar/ortak.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';
const ustSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', kap: false })).join('');
const sonSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', konum: 'alt' })).join('');

const SEKMELER = [['tumu', 'Tümü', 'fa-layer-group'], ['hesap', 'Araçlar', 'fa-calculator'], ['besin', 'Besinler', 'fa-leaf'], ['program', 'Programlar', 'fa-list-check'], ['tarif', 'Tarifler', 'fa-utensils'], ['rehber', 'Rehber', 'fa-book-open'], ['diyetisyen', 'Diyetisyenler', 'fa-user-doctor']];
/* Boş sonuçta türün kendi listesi: aranan şey o listede süzgeçle bulunur */
const TURLER = [['Besin Kütüphanesi', 'besin-kutuphanesi/', 'fa-leaf'], ['Hesaplayıcılar', 'hesaplayicilar/', 'fa-calculator'], ['Sağlık Testleri', 'saglik-testleri/', 'fa-clipboard-question'], ['Programlar', 'programlar/', 'fa-list-check'], ['İpuçları & Püf Noktaları', 'ipuclari-ve-puf-noktalari/', 'fa-lightbulb'], ['Kaç Kalori?', 'kac-kalori/', 'fa-fire'], ['Diyetisyenler', 'diyetisyenler/', 'fa-user-doctor']];
const POPULER = ['avokado', 'kalori', 'akdeniz', 'kilo', 'çorba', 'protein', 'aralıklı oruç', 'diyetisyen'];

export default ({ veri }) => {
  const dizin = [
    ...veri.hesaplayicilar.hesaplayicilar.map((h) => ({ tur: 'hesap', ad: h.ad, metin: h.ozet, href: DETAY.hesaplayici, ikon: h.ikon.replace('fa-solid ', ''), etiket: 'Hesaplayıcı' })),
    ...[['Akıllı Tabak ve Değişim', 'Tabağını kur, muadilini bul', 'akilli-tabak-ve-degisim/', 'fa-chart-pie'], ['Aralıklı Oruç Rehberi', 'Protokolünü ve saatlerini seç', 'aralikli-oruc-rehberi/', 'fa-clock'], ['Besin Karşılaştır', 'İki besini yan yana gör', 'besin-karsilastir/', 'fa-scale-balanced']].map(([ad, metin, href, ikon]) => ({ tur: 'hesap', ad, metin, href, ikon, etiket: 'Araç' })),
    ...veri.testler.testler.map((t) => ({ tur: 'hesap', ad: t.ad, metin: t.aciklama, href: DETAY.test, gorsel: t.gorsel_dosya, etiket: 'Test' })),
    ...veri.programlar.programlar.map((p) => ({ tur: 'program', ad: p.ad, metin: p.aciklama, href: DETAY.program, gorsel: p.gorsel_dosya, etiket: p.sure, tercih: p.tercih, hedef: p.hedef, sure_gun: p.sure_gun })),
    ...veri.rehberler.rehberler.map((r) => ({ tur: 'rehber', ad: r.ad, metin: r.ozet, href: 'besin-rehberi/dengeli-tabak/', gorsel: r.gorsel_dosya, etiket: 'Rehber' })),
    ...veri.ipuclari.ipuclari.map((y) => ({ tur: 'rehber', ad: y.ad, metin: y.ozet, href: `ipuclari/${y.slug}/`, gorsel: y.gorsel_dosya, ikon: y.ikon.replace('fa-solid ', ''), etiket: 'İpucu' })),
    ...veri.puflar.puflar.map((y) => ({ tur: 'rehber', ad: y.ad, metin: y.ozet, href: `puflar/${y.slug}/`, gorsel: y.gorsel_dosya, ikon: y.ikon.replace('fa-solid ', ''), etiket: 'Püf noktası' })),
    ...veri.kac_kalori.yazilar.map((y) => ({ tur: 'rehber', ad: y.ad, metin: y.ozet, href: `kac-kalori/${y.slug}/`, gorsel: y.gorsel_dosya, ikon: y.ikon.replace('fa-solid ', ''), etiket: 'Kaç kalori?' })),
    ...veri.diyetisyenler.diyetisyenler.map((d) => ({ tur: 'diyetisyen', ad: d.ad, metin: `${d.uzmanlik[0]} · ${d.sehir}`, href: `diyetisyen/${d.slug}/`, harf: d.harf, etiket: d.unvan })),
  ];
  const govde = `<section class="bant" data-bant-gorsel="${K}assets/img/hero/besin-kutuphanesi-nb-top.webp"><div class="kap">
${kirinti(['Arama'])}<span class="ust-etiket">${ikon('fa-seedling')} Dada Diet · Arama</span>
<h1 id="aramaBaslik">Dada Diet'te <span class="vurgu">ara</span></h1>
<p class="bant-alt" id="aramaGiris">Hesaplayıcı, besin, program, rehber ya da diyetisyen: tek kutudan tüm içerikte ara.</p>
<form class="arama-kutu" id="aramaForm" role="search" autocomplete="off" method="get" action="${K}arama/"><div class="arama-satir"><div class="arama-girdi-kap">${ikon('fa-magnifying-glass')}<input id="aramaGirdi" name="q" type="search" placeholder="Hesaplayıcı, besin, program veya diyetisyen ara" aria-label="Dada Diet içeriğinde ara" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="aramaOneri"></div><button class="dugme birincil" type="submit">${ikon('fa-magnifying-glass')} Ara</button></div><div class="arama-oneri" id="aramaOneri" role="listbox" aria-label="Arama önerileri"></div></form>
<p class="arama-ozet" id="aramaOzet"></p>
</div></section>
<section class="arama-pop dikis bant-ustunde" id="aramaPop"><div class="kap">${ustSerit('AR-B1')}<div class="arama-pop-izgara"><div><h3>${ikon('fa-fire')} Popüler Aramalar</h3><div class="cipler">${POPULER.map((p) => `<a class="cip hap" href="${K}arama/?q=${encodeURIComponent(p)}">${p}</a>`).join('')}</div></div><div id="sonAramaKap" hidden><div class="son-arama-bas"><h3>${ikon('fa-clock-rotate-left')} Son Aramaların</h3><button class="suzme-temizle" type="button" id="sonAramaTemizle">Temizle</button></div><div class="son-arama" id="sonArama"></div></div></div></div></section>
<div class="sekme-ray yapiskan dikis bant-ustunde" id="aramaSekme" hidden><div class="kap"><div class="sekmeler" role="tablist" aria-label="İçerik türü">${SEKMELER.map(([v, a, i], n) => `<button class="sekme${n === 0 ? ' aktif' : ''}" type="button" role="tab" data-tur="${v}" aria-selected="${n === 0}"${n ? ' tabindex="-1"' : ''}>${ikon(i)} ${a} <span class="sekme-sayi" data-sayi="${v}">0</span></button>`).join('')}</div></div></div>
<section class="sonuc-bant" id="aramaSonuc" hidden aria-live="polite"><div class="kap"><p class="sonuc-not" id="aramaNot"></p><div class="sonuc-izgara" id="aramaIzgara"></div><div class="bos-durum kart-ici" id="aramaBos" hidden><span class="bos-ikon">${ikon('fa-magnifying-glass')}</span><h3>Bu aramada sonuç yok</h3><p>Yazımı kontrol et ya da daha genel bir kelime dene.</p><div class="bos-oneri"><span class="alan-etiket">Bunları dene</span><div class="cipler">${POPULER.slice(0, 6).map((p) => `<a class="cip hap" href="${K}arama/?q=${encodeURIComponent(p)}">${p}</a>`).join('')}</div><span class="alan-etiket">Türüne göre göz at</span><div class="cipler">${TURLER.map(([a, h, i]) => `<a class="cip" href="${K}${h}">${ikon(i)} ${a}</a>`).join('')}</div></div></div></div></section>
<div class="uyari-serit"><div class="kap">${ikon('fa-circle-info')}<p>Arama sonuçları genel bilgi amaçlıdır; kişiye özel tıbbi ya da beslenme önerisi değildir.</p></div></div>
${sonSerit('AR-B1-END')}
${jsonGom('aramaDizin', { dizin, besinDetay: DETAY.besin, tarifDetay: 'tarif/' })}`;
  return [{ yol: 'arama', meta: { baslik: 'Arama', duzen: 'public', hero: true, js: [JS, 'assets/js/tercih-uyum.js', 'assets/js/sayfa/public-araclar-arama.js'] }, govde }];
};
