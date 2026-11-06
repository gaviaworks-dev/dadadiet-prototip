/* Public araçlar ortak: bant görseli, kanon --bant-gorsel üzerinden basılır (satır içi stil yazılmaz). */
(function () {
  'use strict';
  document.querySelectorAll('[data-bant-gorsel]').forEach((e) => {
    e.style.setProperty('--bant-gorsel', 'url("' + new URL(e.dataset.bantGorsel, document.baseURI).href + '")');
  });
  /* [data-toast] bağlı olmayan yüzeylerde kullanıcıya durumu söyler */
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-toast]'); if (t) DD.toast(t.dataset.toast, t.dataset.toastTip); });
})();
