// Sağlık testleri listesi + beslenme testi soru akışı ve sonucu.
import { K, sayfaJs, bant, bolum, bolumBas, dugme, ikon, icerik, testKart, genelNot, jsonGom, kac } from '../../parcalar/public-araclar/ortak.mjs';

const GRUP_SLUG = { 'Sağlık & Beslenme': 'saglik', 'Eğlence & Bilgi Yarışması': 'eglence' };

export default ({ veri }) => {
  const s = veri.sayaclar, T = veri.testler, d = T.detay, ilk = T.testler.find((t) => t.slug === d.slug);
  const sekmeler = [['', 'Tümü', T.toplam, 'fa-layer-group'], ...T.gruplar.map((g) => [GRUP_SLUG[g.ad], g.ad, g.sayi, g.ad.startsWith('Sağlık') ? 'fa-heart-pulse' : 'fa-gamepad'])];
  const liste = `${bant({ yol: [['Sağlık Testleri']], etiket: 'Sağlık testleri', etiketIkon: 'fa-clipboard-question', h1: 'Birkaç soruda <span class="vurgu">kendini keşfet</span>', gorsel: 'hero/testler-tst-top.jpg', alt: 'Alışkanlığını ölç, sonucuna özel açıklamayı oku. Testler teşhis koymaz, kendini tanımana yardım eder.', sayilar: [[s.test, 'Test'], [s.test_soru, 'Soru'], ['3 dk', 'Ortalama süre']] })}
<div class="bolum-dizi">
${bolum(`<div data-liste data-alan="grup" data-param="grup" data-boyut="12" data-toplam="${T.toplam}" data-birim="test">
<div class="sekme-ray liste-ust"><div class="sekmeler suzgec" role="tablist" aria-label="Test grubu">${sekmeler.map(([v, a, n, i], k) => `<button class="sekme${k === 0 ? ' aktif' : ''}" type="button" role="tab" data-deger="${v}" aria-selected="${k === 0}"${k ? ' tabindex="-1"' : ''}>${ikon(i)} ${a} <span class="sekme-sayi">${n}</span></button>`).join('')}</div></div>
<div class="kart-izgara c3" data-izgara>${T.testler.map(testKart).join('')}</div>
<nav class="sayfalama" data-sayfalama aria-label="Sayfalama"></nav><p class="sayfalama-not" data-not></p>
</div>`, { ilk: true })}
${bolum(genelNot)}
</div>`;

  const benzer = T.testler.filter((t) => t.slug !== d.slug && t.grup === ilk.grup).slice(0, 3);
  const detay = `${bant({ yol: [['Sağlık Testleri', 'saglik-testleri/'], [kac(d.ad)]], etiket: 'Sağlık testi', etiketIkon: 'fa-clipboard-question', h1: kac(d.ad), gorsel: 'hero/test-beslenme-tst-top.webp', alt: kac(d.aciklama), sayilar: [[d.sorular.length, 'Soru'], ['3 dk', 'Süre'], ['Anında', 'Sonuç']] })}
<div class="bolum-dizi">
${bolum(`<div class="okuma-kolon" id="testKok">
<div class="sonuc-kart buyuk kapakli" id="testKapak"><div class="sonuc-gorsel"><img src="${icerik(ilk.gorsel_dosya)}" alt=""></div><div class="sonuc-govde"><p class="kart-metin">${kac(d.aciklama)}</p><ul class="isaretli-liste">${['Seçimini yap, test kendiliğinden ilerler', 'Sonunda seni tanımlayan bir sonuç ve puanına özel açıklama çıkar', 'Giriş yaptıysan sonucun hesabına kaydedilir'].map((m) => `<li>${ikon('fa-check')}<span>${m}</span></li>`).join('')}</ul><div class="sonuc-alt"><span class="sonuc-not-kisa">${ikon('fa-unlock')} Kayıt gerekmez, sonuç anında</span><button class="dugme birincil" id="testBasla" type="button">${ikon('fa-arrow-right')} Teste başla</button></div></div></div>
<div class="kart" id="testOyun" hidden><div class="kart-govde">
<div class="olcum-satir soru-ilerleme-dik"><div class="olcum-bas"><b id="testMetin"></b><span id="testYuzde" aria-live="polite"></span></div><div class="olcer hap" role="progressbar" aria-label="Test ilerlemesi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span id="testCubuk" data-oran="0"></span></div></div>
<h2 class="soru-metin" id="soruMetin" tabindex="-1"></h2><div class="secenek-izgara" id="soruSecenek" data-tek-secim role="group" aria-labelledby="soruMetin"></div>
</div><div class="kart-alt"><button class="dugme hayalet kucuk" id="soruGeri" type="button">${ikon('fa-arrow-left')} Geri</button><span class="not sag-not">${ikon('fa-wand-magic-sparkles')} Seçince otomatik ilerler</span></div></div>
<div class="kart sonuc-yuzeyi" id="testSonuc" hidden><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-award')} Sonucun</h2><span class="rozet olumlu" id="sonucPuan"></span></div><div class="kart-govde"><p class="sonuc-sayi" id="sonucBaslik" tabindex="-1"></p><div class="olcer hap sonuc-olcer" role="img" id="sonucOlcerKap"><span id="sonucOlcer" data-oran="0"></span></div><p class="kart-metin" id="sonucMetin"></p></div><div class="kart-alt"><button class="dugme hayalet" id="testTekrar" type="button">${ikon('fa-rotate-left')} Testi tekrar çöz</button>${dugme('Sana uygun olanı bul', 'bana-uygun-olani-bul/', 'birincil', 'fa-arrow-right', true)}</div></div>
</div>`, { ilk: true })}
${bolum(`${bolumBas({ etiket: 'Diğer testler', ikon: 'fa-clipboard-question', baslik: 'Sıradaki testin hazır', metin: 'Kendini farklı açılardan keşfetmeye devam et.', arac: dugme('Tüm testler', 'saglik-testleri/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c3">${benzer.map(testKart).join('')}</div>`)}
${bolum(genelNot)}
</div>${jsonGom('testVeri', d)}`;

  return [
    { yol: 'saglik-testleri', meta: { baslik: 'Sağlık Testleri', duzen: 'public', aktif: 'Sağlık Araçları', hero: true, js: sayfaJs('liste') }, govde: liste },
    { yol: 'test/beslenme', meta: { baslik: d.ad, duzen: 'public', aktif: 'Sağlık Araçları', hero: true, js: sayfaJs('test') }, govde: detay },
  ];
};
