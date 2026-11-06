/* Besin Karşılaştır: statik sonuç derlemede basılır, değişiklikte aynı motor yeniden çizer. */
(function () {
  'use strict';
  const M = window.DDM, kap = document.getElementById('karsilastir');
  if (!kap) return;
  const sonuc = document.getElementById('karsilastirSonuc'), baslik = document.getElementById('karsilastirBaslik');
  const gA = document.getElementById('besinA'), gB = document.getElementById('besinB');
  const sorgu = new URLSearchParams(location.search);
  const durum = { a: M.besin(sorgu.get('a') || kap.dataset.a), b: M.besin(sorgu.get('b') || kap.dataset.b), kip: '100' };
  const adresYaz = () => { if (durum.a && durum.b) history.replaceState(null, '', location.pathname + '?a=' + durum.a.slug + '&b=' + durum.b.slug); };
  function ciz() {
    if (!durum.a || !durum.b) {
      sonuc.innerHTML = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i></span><h3>İki besin seç</h3><p>Yukarıdaki iki kutuya birer besin yazınca tablo burada açılır.</p><a class="dugme birincil" href="' + DD.kok + 'besin-karsilastir/kinoa-vs-pirinc/">Örnek karşılaştırmayı aç</a></div>';
      return;
    }
    sonuc.innerHTML = M.karsilastirHtml(durum.a, durum.b, durum.kip, DD.kok);
    sonuc.querySelectorAll('[data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
    if (baslik) baslik.textContent = M.kisaAd(durum.a) + ' vs ' + M.kisaAd(durum.b);
  }
  const bagla = (girdi, anahtar, diger) => {
    M.oneri(girdi, {
      haric: () => (durum[diger] ? [durum[diger].slug] : []),
      secildi(b) { durum[anahtar] = b; girdi.value = M.kisaAd(b); ciz(); adresYaz(); },
    });
    girdi.addEventListener('input', () => { if (!girdi.value.trim()) { durum[anahtar] = null; ciz(); } });
    girdi.addEventListener('blur', () => { if (durum[anahtar] && girdi.value.trim()) setTimeout(() => { girdi.value = durum[anahtar] ? M.kisaAd(durum[anahtar]) : ''; }, 140); });
  };
  bagla(gA, 'a', 'b'); bagla(gB, 'b', 'a');
  if (durum.a) gA.value = M.kisaAd(durum.a);
  if (durum.b) gB.value = M.kisaAd(durum.b);
  kap.querySelector('.segment').addEventListener('dd:secim', (e) => { durum.kip = e.detail.deger; ciz(); });
  document.getElementById('yerDegistir').addEventListener('click', () => {
    [durum.a, durum.b] = [durum.b, durum.a];
    gA.value = durum.a ? M.kisaAd(durum.a) : ''; gB.value = durum.b ? M.kisaAd(durum.b) : ''; ciz(); adresYaz();
  });
  if (sorgu.get('a') || sorgu.get('b')) ciz();
})();
