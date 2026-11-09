// Sağlık testleri listesi + beslenme testi soru akışı ve sonucu.
import { sayfaJs, bant, bantSayilar, bolum, bolumBas, dugme, ikon, icerik, testListeKart, testOneriKart, jsonGom, kac } from '../../parcalar/public-araclar/ortak.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';
const ustSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', kap: false })).join('');
const sonSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', konum: 'alt' })).join('');

const altSayilar = (l) => bantSayilar(l).replace('bant-sayilar', 'bant-sayilar alt-hiza');
const GRUP_SLUG = { 'Sağlık & Beslenme': 'saglik', 'Eğlence & Bilgi Yarışması': 'eglence' };

export default ({ veri }) => {
  const s = veri.sayaclar, T = veri.testler, d = T.detay, ilk = T.testler.find((t) => t.slug === d.slug);
  const sekmeler = [['', 'Tümü', T.toplam, 'fa-layer-group'], ...T.gruplar.map((g) => [GRUP_SLUG[g.ad], g.ad, g.sayi, g.ad.startsWith('Sağlık') ? 'fa-heart-pulse' : 'fa-face-grin-stars'])];
  const liste = `${bant({ yol: [['Beslenme Testi']], etiket: 'Beslenme Testi', etiketIkon: 'fa-clipboard-question', h1: '<span class="dar-baslik">Beslenme alışkanlıkların ne durumda?</span>', gorsel: 'hero/testler-tst-top.jpg', alt: 'Kısa bir testle beslenme alışkanlığını analiz et; sonunda kişisel değerlendirmeni gör.', alttaki: altSayilar([[s.test, 'Test'], [s.test_soru, 'Soru']]) })}
${bolum(`${ustSerit('VD-B1', 'VS-B1')}<div data-liste data-alan="grup" data-param="grup" data-boyut="12" data-toplam="${T.toplam}" data-birim="test">
<div class="sekme-ray liste-ust tam-serit-kap"><div class="sekmeler suzgec tam-serit" role="tablist" aria-label="Test grupları">${sekmeler.map(([v, a, n, i], k) => `<button class="sekme${k === 0 ? ' aktif' : ''}" type="button" role="tab" data-deger="${v}" aria-selected="${k === 0}"${k ? ' tabindex="-1"' : ''}>${ikon(i)} ${kac(a)} <span class="sekme-sayi">${n}</span></button>`).join('')}</div></div>
<div class="medya-izgara" data-izgara>${T.testler.map(testListeKart).join('')}</div>
<nav class="sayfalama" data-sayfalama aria-label="Sayfalama"></nav><p class="sayfalama-not" data-not></p>
</div>${rk('VD-N1', { tur: 'medya', hedef: '.medya-izgara[data-izgara]', sira: 4 })}
<div class="bilgi-notu genis">${ikon('fa-circle-info')}<div><p><b>Genel bilgi notu.</b> Bu içerik genel beslenme okuryazarlığını desteklemek amacıyla hazırlanmıştır; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi niteliği taşımaz. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.</p>${dugme('Diyetisyen Bul', 'diyetisyenler/', 'birincil', 'fa-arrow-right', true)}</div></div>`, { ilk: true, sinif: 'ust-dar' })}${sonSerit('VD-B1-END', 'VS-B1-END')}`;

  const benzer = T.testler.filter((t) => t.slug !== d.slug && t.grup === ilk.grup).slice(0, 3);
  const detay = `${bant({ yol: [['Testler', 'saglik-testleri/'], [kac(d.ad)]], etiket: 'Beslenme testi', etiketIkon: 'fa-circle-question', h1: kac(d.ad), gorsel: 'hero/test-beslenme-tst-top.webp', alt: kac(d.aciklama), alttaki: altSayilar([[d.sorular.length, 'Soru']]) })}
<div class="bolum-dizi">
${bolum(`${ustSerit('VD-S1')}<div class="soru-kolon" id="testKok">
<div class="kapak-kart" id="testKapak"><div class="kapak-kart-gorsel"><img src="${icerik(ilk.gorsel_dosya)}" alt=""></div><div class="kapak-kart-govde"><p class="kapak-kart-metin">${kac(d.aciklama)}</p><ul class="kapak-liste">${['Görsel kartlardan seçimini yap, test kendiliğinden ilerler', 'Sonunda seni tanımlayan bir sonuç kartı ve puanına özel bir açıklama çıkar', 'Kayıt olmadan çözersin; sonucunu Sağlık Dosyana kaydetmek istersen tek adımda üye olursun'].map((m) => `<li>${ikon('fa-check')}<span>${m}</span></li>`).join('')}</ul><div class="kapak-eylem"><span class="kapak-not">${ikon('fa-clock')} ${d.sorular.length} soru · yaklaşık 3 dk · kayıt gerekmez</span><button class="dugme birincil" id="testBasla" type="button">${ikon('fa-play')} Teste Başla</button></div></div></div>
<div class="soru-kart" id="testOyun" hidden><div class="soru-ust"><span class="soru-adim" id="testMetin"></span><span class="soru-yuzde" id="testYuzde" aria-live="polite"></span></div><div class="soru-cubuk" role="progressbar" aria-label="Test ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="testCubuk"></i></div>
<div class="soru-sahne" id="soruSahne"><h2 class="soru-baslik" id="soruMetin" tabindex="-1"></h2><div class="sik-izgara" id="soruSecenek" data-tek-secim role="group" aria-labelledby="soruMetin"></div></div>
<div class="soru-alt"><button class="soru-geri" id="soruGeri" type="button" disabled>${ikon('fa-arrow-left')} Geri</button><span class="soru-ipucu">${ikon('fa-wand-magic-sparkles')} Seçince otomatik ilerler</span></div></div>
<div class="sonuc-levha" id="testSonuc" hidden></div>
</div>`, { ilk: true, sinif: 'ust-orta' })}
${bolum(`${bolumBas({ etiket: 'Diğer Testler', ikon: 'fa-layer-group', baslik: 'Sıradaki Testin Hazır', metin: 'Kendini farklı açılardan keşfetmeye devam et.', arac: dugme('Tüm Testler', 'saglik-testleri/', 'hayalet orta notr', 'fa-arrow-right', true) })}<div class="medya-izgara">${benzer.map(testOneriKart).join('')}</div>`)}
${sonSerit('VD-S1-END')}
</div>${jsonGom('testVeri', d)}`;

  return [
    { yol: 'saglik-testleri', meta: { baslik: 'Sağlık Testleri', duzen: 'public', aktif: 'Sağlık Araçları', hero: true, js: sayfaJs('liste') }, govde: liste },
    { yol: 'test/beslenme', meta: { baslik: d.ad, duzen: 'public', aktif: 'Sağlık Araçları', hero: true, js: [...sayfaJs('test'), 'assets/js/misafir.js'] }, govde: detay },
  ];
};
