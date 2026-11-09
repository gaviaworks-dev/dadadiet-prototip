/* Ekran haritası · Reklam alanları: "Reklamlı görünüm" anahtarı. Açıkken bütün sayfalarda reklam alanları basılır (assets/js/reklam/onizle.js). */
(function () {
  'use strict';
  var a = document.getElementById('reklamAnahtar');
  if (!a || !window.DD_REKLAM) return;
  a.checked = window.DD_REKLAM.acik();
  a.addEventListener('change', function () {
    if (a.checked) window.DD_REKLAM.ac(); else window.DD_REKLAM.kapat();
    if (window.DD && DD.toast) DD.toast(a.checked ? 'Reklamlı görünüm açık: bütün sayfalarda reklam alanları basılır.' : 'Reklamlı görünüm kapandı.');
    setTimeout(function () { location.reload(); }, 700);
  });
})();
