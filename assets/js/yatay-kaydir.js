/* Tek satırlı çip şeridi: fareyle sürüklenir. Dokunmatik ekran ve dokunmatik yüzey şeridi kendisi kaydırır */
(function () {
  'use strict';
  const SEC = '.cipler.tek-satir';
  let kap = null, x0 = 0, s0 = 0, kaydi = false;
  document.addEventListener('pointerdown', (e) => {
    const k = e.pointerType === 'mouse' && e.target.closest && e.target.closest(SEC);
    if (!k || k.scrollWidth <= k.clientWidth) return;
    kap = k; x0 = e.clientX; s0 = k.scrollLeft; kaydi = false;
  });
  document.addEventListener('pointermove', (e) => {
    if (!kap) return;
    const d = e.clientX - x0;
    if (Math.abs(d) > 5 && !kaydi) { kaydi = true; kap.style.scrollSnapType = 'none'; }
    if (kaydi) kap.scrollLeft = s0 - d;
  });
  document.addEventListener('pointerup', () => { if (kap) kap.style.scrollSnapType = ''; kap = null; });
  /* Sürükleme bitince çip seçilmez */
  document.addEventListener('click', (e) => {
    if (kaydi && e.target.closest && e.target.closest(SEC)) { e.preventDefault(); e.stopPropagation(); }
    kaydi = false;
  }, true);
})();
