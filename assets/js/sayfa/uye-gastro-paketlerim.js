/* Paketlerim: kademe kartı, kademe görünümü, haber ver */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU, G = window.DDG;
  const katalog = G.katalog('gKademe');
  const SIRA = katalog.map((k) => k.kod);
  const haber = () => U.yerel('kademeHaber', {});
  function ciz() {
    const a = G.kademeAl();
    U.bas('#pkAktif', G.paketKarti(katalog, 'paket'));
    document.querySelectorAll('#pkGorunum [data-kademe]').forEach((b) => {
      const on = b.dataset.kademe === a.kademe;
      b.classList.toggle('aktif', on);
      b.setAttribute('aria-pressed', on);
    });
    document.querySelectorAll('[data-kademe-kart]').forEach((kart) => {
      const k = kart.dataset.kademeKart, simdi = k === a.kademe, b = kart.querySelector('[data-bayrak]');
      kart.classList.toggle('aktif', simdi);
      b.hidden = !simdi && k !== 'ucretsiz';
      b.classList.toggle('simdi', simdi);
      b.innerHTML = simdi ? G.i('fa-circle-check') + ' Mevcut paketin' : 'Herkese açık';
      const yer = kart.querySelector('[data-kademe-eylem]');
      if (simdi) yer.innerHTML = '<button class="dugme hayalet tam-en" type="button" disabled>Mevcut paketin</button>';
      else if (SIRA.indexOf(k) < SIRA.indexOf(a.kademe)) yer.innerHTML = '<button class="dugme hayalet tam-en" type="button" data-dusur="' + k + '">' + U.kac(katalog.find((x) => x.kod === k).ad) + ' Kademesine Dön</button>';
      else yer.innerHTML = '<button class="dugme ' + (haber()[k] ? 'hayalet' : 'birincil') + ' tam-en" type="button" data-haber="' + k + '" aria-pressed="' + !!haber()[k] + '">' + G.i(haber()[k] ? 'fa-bell-slash' : 'fa-bell') + ' ' + (haber()[k] ? 'Haber Vermeyi Bırak' : 'Bana Haber Ver') + '</button>';
    });
    const p = U.paket(), h = G.hizmetler().find((x) => x.paket_id === (p && p.id) && !x.bitti);
    const hak = h ? G.haklar()[h.id] : null;
    U.bas('#pkDiyetisyen', p && hak ? 'Aktif görüşme paketin ' + U.kac(p.ad) + ': ' + hak.kalan + ' görüşme hakkın duruyor.' : 'Aktif görüşme paketin yok.');
  }
  document.addEventListener('click', (e) => {
    const g = e.target.closest('#pkGorunum [data-kademe]');
    if (g) {
      const a = G.kademeAl();
      Object.assign(a, { kademe: g.dataset.kademe, iptal: false, dondurma: '' });
      U.kaydet(); ciz();
      DD.toast(g.textContent + ' görünümü açıldı.');
      return;
    }
    const d = e.target.closest('[data-dusur]');
    if (d) {
      Object.assign(G.kademeAl(), { kademe: d.dataset.dusur, iptal: false, dondurma: '' });
      U.kaydet(); ciz();
      DD.toast('Kademen değişti.');
      return;
    }
    const h = e.target.closest('[data-haber]');
    if (h) {
      const k = h.dataset.haber, l = haber();
      l[k] = !l[k];
      U.kaydet(); ciz();
      DD.toast(l[k] ? 'Satışa açıldığında sana haber vereceğiz.' : 'Haber verme kapatıldı.');
    }
  });
  ciz();
})();
