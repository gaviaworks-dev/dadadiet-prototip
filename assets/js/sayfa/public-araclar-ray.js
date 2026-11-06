/* Anasayfa: kart rayı okları, Nasıl Çalışır adım şeridi, bölüm belirme hareketi. */
(function () {
  'use strict';
  document.querySelectorAll('[data-ray]').forEach((kok) => {
    const iz = kok.querySelector('.kart-ray'), g = kok.querySelector('.ray-ok.geri'), i = kok.querySelector('.ray-ok.ileri');
    const durum = () => { g.hidden = iz.scrollLeft < 8; i.hidden = iz.scrollLeft + iz.clientWidth >= iz.scrollWidth - 8; };
    const git = (y) => iz.scrollBy({ left: y * iz.clientWidth * 0.8, behavior: 'smooth' });
    g.addEventListener('click', () => git(-1)); i.addEventListener('click', () => git(1));
    iz.addEventListener('scroll', durum, { passive: true }); addEventListener('resize', durum); durum();
  });

  const yol = document.getElementById('nasilYol'), dugme = document.getElementById('sonrakiAdim');
  if (yol && dugme) {
    const l = [...yol.children]; let a = 0;
    dugme.addEventListener('click', () => {
      a = (a + 1) % l.length;
      l.forEach((x, k) => { x.classList.toggle('acik', k === a); x.classList.toggle('bitti', k < a); });
    });
  }

  /* Canlıdaki reveal: yalnız kayma, görünürlük hiç kapanmaz */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const g = new IntersectionObserver((l) => l.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('gorundu'); g.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.bolum-dizi > .bolum .bolum-bas, .bolum-dizi > .bolum .vurgu-panel').forEach((e) => { e.classList.add('belir'); g.observe(e); });
  }
})();
