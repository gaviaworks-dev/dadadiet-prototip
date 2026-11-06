/* Paketlerim: diyetisyen paketi demo kaydından; Pro kademeleri henüz satışta değil */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const pk = U.paket(), e = document.getElementById('pkDiyetisyen');
  if (e) e.textContent = pk ? pk.ad + ' · ' + pk.seans + ' seans · ' + U.tl(pk.fiyat) : 'Aktif diyetisyen paketin yok.';
  const haber = () => U.yerel('paketHaber', {});
  const ciz = () => document.querySelectorAll('[data-haber]').forEach((b) => { if (haber()[b.dataset.haber]) b.textContent = 'Listedesin'; });
  ciz();
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-haber]');
    if (!b) return;
    const ad = b.dataset.haber;
    haber()[ad] = !haber()[ad];
    if (!haber()[ad]) b.textContent = 'Bana haber ver';
    U.kaydet(); ciz();
    DD.toast(haber()[ad] ? ad + ' satışa açılınca sana haber vereceğiz.' : 'Haber listesinden çıktın.');
  });
})();
