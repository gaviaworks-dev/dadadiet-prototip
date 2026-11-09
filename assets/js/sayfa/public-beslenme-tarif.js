/* Tarif detayı: porsiyon değişince ölçülü malzemeler orantılanır; Yazdır düğmesi tarayıcının yazdırma penceresini açar. */
(function () {
  'use strict';
  document.querySelectorAll('[data-yazdir]').forEach((d) => d.addEventListener('click', () => window.print()));
  const g = document.getElementById('porsiyon');
  if (!g) return;
  const taban = +g.closest('.adet').dataset.taban;
  const yuvarla = (n) => (n >= 10 ? Math.round(n) : Math.round(n * 10) / 10).toLocaleString('tr-TR');
  g.addEventListener('input', function () {
    const k = Math.min(+g.max, Math.max(+g.min, +g.value || taban));
    g.value = k;
    document.querySelectorAll('[data-miktar]').forEach((m) => { m.textContent = yuvarla((+m.dataset.miktar * k) / taban) + (m.dataset.birim ? ' ' + m.dataset.birim : ''); });
  });
})();
