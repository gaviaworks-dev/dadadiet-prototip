/* Diyetisyen vitrini: canlıdaki süzgeç sütunu. Alan içinde VEYA, alanlar arası VE. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const kok = $('uzmanListe'), izgara = $('uzmanKartlar'), kartlar = [...izgara.children], ilkSira = kartlar.slice();
  const kutular = [...kok.querySelectorAll('[data-suz]')];
  const secili = (a) => kutular.filter((k) => k.dataset.suz === a && k.checked).map((k) => k.value);

  function ciz() {
    const u = secili('uzmanlik'), g = secili('gorusme'), s = secili('sehir');
    let adet = 0;
    kartlar.forEach((k) => {
      const uy = (!u.length || k.dataset.uzmanlik.split('|').some((x) => u.includes(x))) && (!g.length || k.dataset.gorusme.split(' ').some((x) => g.includes(x))) && (!s.length || s.includes(k.dataset.sehir));
      k.hidden = !uy; if (uy) adet++;
    });
    $('uzmanSayi').textContent = adet + ' uzman';
    izgara.hidden = !adet; $('uzmanBos').hidden = !!adet;
  }
  kok.addEventListener('change', (e) => {
    if (e.target.id === 'uzmanSira') {
      const l = e.target.value === 'deneyim' ? kartlar.slice().sort((a, b) => b.dataset.deneyim - a.dataset.deneyim) : ilkSira;
      l.forEach((k) => izgara.append(k));
      return;
    }
    ciz();
  });
  $('suzgecTemizle').addEventListener('click', (e) => { e.preventDefault(); kutular.forEach((k) => { k.checked = false; }); ciz(); });
  const d = kok.querySelector('details');
  if (innerWidth <= 1024) d.open = false;
})();
