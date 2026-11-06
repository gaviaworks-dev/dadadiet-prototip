/* Marka iş birlikleri: süre seçimi kart metinlerini ve formu günceller, paket düğmesi teklif formunu doldurur. */
(function () {
  'use strict';
  const paket = document.getElementById('tPaket'), sure = document.getElementById('tSure');
  document.getElementById('sureSec').addEventListener('dd:secim', function (e) {
    document.querySelectorAll('[data-sure-metin]').forEach((s) => { s.textContent = e.detail.deger; });
    sure.value = e.detail.deger;
  });
  document.addEventListener('click', function (e) {
    const d = e.target.closest('[data-paket]');
    if (!d) return;
    paket.value = d.dataset.paket;
    document.getElementById('teklif').scrollIntoView({ block: 'start' });
    DD.toast(d.dataset.paket + ' teklif formuna eklendi.');
  });
})();
