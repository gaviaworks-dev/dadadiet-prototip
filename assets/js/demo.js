/* Prototip demo durumu. Panelde yapılan işlem üye tarafına yansısın diye tarayıcıda tutulur.
   Yalnız prototip içindir; ürüne taşınmaz (üründe hesaba yazılır). Başlangıç verisi DD_VERI.demo. */
(function () {
  'use strict';
  const DD = (window.DD = window.DD || {});
  const ANAHTAR = 'dd-demo-durum-v2'; /* veri değişince sürüm artar, eski tarayıcı durumu okunmaz */
  const bas = () => JSON.parse(JSON.stringify((window.DD_VERI && window.DD_VERI.demo) || {}));
  let durum;
  try { durum = JSON.parse(localStorage.getItem(ANAHTAR)) || bas(); } catch (e) { durum = bas(); }
  DD.bugun = (durum && durum.bugun) || '2026-11-06';
  DD.kok = document.documentElement.dataset.kok || './';
  DD.demo = {
    al: () => durum,
    kaydet() { try { localStorage.setItem(ANAHTAR, JSON.stringify(durum)); } catch (e) { /* gizli pencere: bellekte kalır */ } },
    sifirla() { durum = bas(); try { localStorage.removeItem(ANAHTAR); } catch (e) { /* yok say */ } },
  };
  DD.oturum = {
    acik: () => document.documentElement.dataset.oturum === '1',
    ac() { try { localStorage.setItem('dd-oturum', '1'); } catch (e) { /* yok say */ } document.documentElement.dataset.oturum = '1'; },
    kapat() { try { localStorage.removeItem('dd-oturum'); } catch (e) { /* yok say */ } delete document.documentElement.dataset.oturum; },
  };
  document.addEventListener('click', function (e) { if (e.target.closest('[data-cikis]')) DD.oturum.kapat(); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-demo-sifirla]')) return;
    try { Object.keys(localStorage).filter((k) => k.startsWith('dd-')).forEach((k) => localStorage.removeItem(k)); } catch (h) { /* yok say */ }
    DD.demo.sifirla();
    location.reload();
  });
  /* İçerik örnekleme: her tipte 1 detay üretildi. Öteki kayıtlara giden bağlantı o tipin örneğini açar. */
  const ORNEK = { besin: 'avokado', tarif: 'cilbir', program: 'akdeniz-tipi-beslenme', hesaplayici: 'gunluk-kalori', test: 'beslenme', ipuclari: 'gunde-ne-kadar-su-icmek-gerekir', puflar: 'buzdolabinda-hangi-raf-neye-ait', 'kac-kalori': 'bir-avuc-badem-kac-kalori', 'besin-rehberi': 'dengeli-tabak', beslenme: 'dengeli-tabak' };
  const ORNEK_DISI = ['kategori'];
  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.origin !== location.origin) return;
    const kokYol = new URL(DD.kok, location.href).pathname;
    if (!a.pathname.startsWith(kokYol)) return;
    const p = a.pathname.slice(kokYol.length).split('/').filter(Boolean);
    if (p.length < 2 || !(p[0] in ORNEK) || p[1] === ORNEK[p[0]] || ORNEK_DISI.includes(p[1])) return;
    e.preventDefault();
    location.href = kokYol + (p[0] === 'beslenme' ? 'besin-rehberi' : p[0]) + '/' + ORNEK[p[0]] + '/';
  });
  /* Satır içi stil yasağı: arka plan görselleri ve oranlar nitelikten uygulanır */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-arkaplan]').forEach((e) => { e.style.backgroundImage = 'url("' + e.dataset.arkaplan + '")'; });
    document.querySelectorAll('[data-oran]').forEach((e) => { e.style.setProperty('--oran', e.dataset.oran); });
  });
})();
