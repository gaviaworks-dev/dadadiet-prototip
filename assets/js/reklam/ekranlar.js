/* Ekran haritası · Reklam alanları: "Reklamlı görünüm" anahtarı. Açıkken bu sekmede gezilen bütün sayfalarda reklam alanları basılır
   (kip sekmenin oturumunda: assets/js/reklam/onizle.js, sessionStorage dd-reklam-mod). Kapatınca kip silinir. */
(function () {
  'use strict';
  var a = document.getElementById('reklamAnahtar');
  if (!a || !window.DD_REKLAM) return;
  a.checked = window.DD_REKLAM.acik();
  a.addEventListener('change', function () {
    if (a.checked) window.DD_REKLAM.ac(); else window.DD_REKLAM.kapat();
    if (window.DD && DD.toast) DD.toast(a.checked ? 'Reklamlı görünüm açık: bu sekmede gezdiğin bütün sayfalarda reklam alanları basılır.' : 'Reklamlı görünüm kapandı.');
    setTimeout(function () { var u = new URL(location.href); u.searchParams.delete('reklam'); location.replace(u.toString()); }, 700);
  });
})();
