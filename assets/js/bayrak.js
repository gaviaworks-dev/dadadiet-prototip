/* Özellik bayrakları (9 Kasım Tur 3, T1 GİZLE). Tek kaynak _src/veri/bayraklar.json: her bayrakta ad, acik, satir, dayanak, aciklama.
   Kapalı bayraklı öğe silinmez: işaretlemede data-bayrak="ad" taşır, ek-bilesenler.css'teki tek genel kural onu basmaz.
   İnceleme: ?bayrak=ad (virgülle birden çok) ya da ?bayrak=hepsi o sayfada açar; tarayıcıya yazılmaz, sonraki sayfaya taşınmaz.
   JS davranışı: window.DD_BAYRAK.acik('ad'). Bu dosya yüklenmemiş sayfada her bayrak kapalı sayılır (window.DD_BAYRAK yok).
   Varsayılan değer DD_VERI.bayraklar'dan okunur (derleyici istemci verisine eklediğinde); yoksa JSON'daki gibi hepsi kapalı. */
(function () {
  'use strict';
  const kayit = (((window.DD_VERI || {}).bayraklar || {}).bayraklar) || [];
  const varsayilan = {};
  kayit.forEach((b) => { varsayilan[b.ad] = !!b.acik; });
  const q = new URLSearchParams(location.search).get('bayrak');
  const istek = q ? q.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const hepsi = istek.includes('hepsi');
  const acik = (ad) => hepsi || istek.includes(ad) || !!varsayilan[ad];
  /* Sonradan basılan öğeler için de çağrılır: kök altındaki bayraklı öğelerden açık olanları işaretler */
  const isle = (kok) => (kok || document).querySelectorAll('[data-bayrak]').forEach((el) => { if (acik(el.dataset.bayrak)) el.setAttribute('data-bayrak-acik', ''); });
  window.DD_BAYRAK = { acik, isle, istek };
  isle();
  if (istek.length && window.DD && DD.toast) setTimeout(() => DD.toast('İnceleme: gizli özellik açık (' + istek.join(', ') + ').', 'uyari'), 400);
})();
