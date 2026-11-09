/* Program detayı: alışveriş listesini yazdırma ve oturum açılınca açık akordeonun yüksekliğini yenileme.
   Gün kilidi, Programa başla ve Programı kaydet davranışı misafir.js'te ([data-davet], [data-kaydet]). */
(function () {
  'use strict';
  const baslik = (document.querySelector('.bant h1') || {}).textContent || '';
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-liste-yazdir]')) return;
    DD.yazdir('#alisverisListe', 'Alışveriş Listesi', baslik.trim() + (DD.oturum.acik() ? ' · 7 gün' : ' · 1. gün'));
  });
  /* Kilitli günün gövdesi davet şeridinden öğün listesine dönünce yükseklik değişir */
  document.addEventListener('dd:oturum', () => {
    document.querySelectorAll('.akordeon-kalem.acik .akordeon-govde').forEach((g) => { g.style.maxHeight = g.scrollHeight + 'px'; });
  });
})();
