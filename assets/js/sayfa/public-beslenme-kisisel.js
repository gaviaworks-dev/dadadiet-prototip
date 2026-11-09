/* Dışarıda Ne Yesem kişiselleştirme (eski sitede "Giriş yaparsan liste programına ve günlük hedefine göre kişiselleşir").
   Üyede: beslenme tercihi Gourmet'in Beslenme süzgecini önden seçer, öğün başına kalori payını aşan örnek yemek işaretlenir.
   Misafirde: davet şeridi. Yeme bozukluğu öyküsü seçili üyede kalori işareti yapılmaz (K21.7). */
(function () {
  'use strict';
  const kap = document.querySelector('[data-kisisel]');
  if (!kap) return;
  const TARZ = { vegan: 'vegan', vejetaryen: 'vejetaryen' };
  function misafir() {
    kap.innerHTML = DD.davet.serit({ ikon: 'fa-wand-magic-sparkles', metin: '<b>Giriş yaparsan liste</b> beslenme tercihine ve günlük kalori hedefine göre kişiselleşir.', dugme: 'Listemi kişiselleştir', dugmeIkon: 'fa-user-plus', davet: 'Kaydolunca beslenme tercihin süzgece kendiliğinden uygulanır, öğün hedefini aşan yemekler işaretlenir.' });
  }
  function uye() {
    const t = (DD.demo.al().uye || {}).tercihler || {}, duyarli = (t.hassasiyet || []).includes('yeme-bozuklugu');
    const sec = [TARZ[t.beslenme_tarzi], (t.hassasiyet || []).includes('gluten') || (t.alerjiler || []).includes('gluten') ? 'glutensiz' : null].filter(Boolean);
    const sorgu = new URLSearchParams(location.search);
    sec.forEach((d) => {
      const c = document.querySelector('#dzPanel input[name="beslenme"][value="' + d + '"]');
      if (c && !c.checked && !sorgu.has('beslenme')) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    const pay = !duyarli && t.kcal ? Math.round(t.kcal / (t.ogun_sayisi || 3)) : 0;
    let n = 0;
    document.querySelectorAll('[data-yemek]').forEach((s) => {
      const k = parseInt((s.querySelector('b') || {}).textContent.replace(/\D/g, ''), 10) || 0;
      const ust = pay > 0 && k > pay;
      s.classList.toggle('hedef-ustu', ust);
      if (ust) { s.title = 'Öğün başına payının (' + DD.bicim.kcal(pay) + ') üstünde'; n++; } else s.removeAttribute('title');
    });
    const parca = [];
    if (sec.length) parca.push('Beslenme tercihine göre <b>' + sec.map((x) => (x === 'glutensiz' ? 'Glutensiz' : x.charAt(0).toLocaleUpperCase('tr') + x.slice(1))).join(', ') + '</b> süzgeci seçildi.');
    if (pay) parca.push('Günlük hedefin ' + DD.bicim.kcal(t.kcal) + ', öğün başına payın ≈ ' + DD.bicim.kcal(pay) + (n ? '; bunu aşan ' + n + ' örnek yemek turuncu işaretli.' : '; listedeki örnek yemeklerin hepsi bu payın içinde.'));
    if (!parca.length) parca.push('Beslenme tercihini ve kalori hedefini <a href="' + DD.kok + 'hesabim/tercihlerim/">Tercihlerim</a> sayfasında belirlersen liste sana göre süzülür.');
    kap.innerHTML = '<div class="bilgi-notu">' + '<i class="fa-solid fa-user-check" aria-hidden="true"></i><p>' + parca.join(' ') + '</p></div>';
  }
  const ciz = () => (DD.oturum.acik() ? uye() : misafir());
  ciz();
  document.addEventListener('dd:oturum', ciz);
})();
