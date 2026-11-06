/* Public araçlar ortak: bant görseli, kanon --bant-gorsel üzerinden basılır (satır içi stil yazılmaz). */
(function () {
  'use strict';
  document.querySelectorAll('[data-bant-gorsel]').forEach((e) => {
    e.style.setProperty('--bant-gorsel', 'url("' + new URL(e.dataset.bantGorsel, document.baseURI).href + '")');
  });
  /* Açık başlayan akordeon kalemi: kanon gövdeyi max-height ile açar */
  document.querySelectorAll('.akordeon-kalem.acik .akordeon-govde').forEach((g) => { g.style.maxHeight = g.scrollHeight + 'px'; });
  /* [data-toast] bağlı olmayan yüzeylerde kullanıcıya durumu söyler */
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-toast]'); if (t) { e.preventDefault(); DD.toast(t.dataset.toast, t.dataset.toastTip); } });
})();
