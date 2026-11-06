/* Kaydedilenler: demo.uye.kaydedilenler listesini gösterir ve yönetir */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const kat = JSON.parse($('#kdKatalog').textContent);
  const TUR = [['tarifler', 'Tarif', 'tarif/'], ['besinler', 'Besin', 'besin/'], ['programlar', 'Program', 'program/'], ['rehberler', 'Rehber', 'beslenme/']];
  const k = () => { const u = U.uye(); u.kaydedilenler = u.kaydedilenler || {}; return u.kaydedilenler; };
  let suzgec = 'tumu';
  const adi = (tur, s) => {
    if (tur === 'tarifler') return (U.tarif(s) || {}).ad || s;
    if (tur === 'besinler') return (U.besin(s) || {}).ad || s;
    return kat[tur][s] || s;
  };
  function ciz() {
    const l = TUR.flatMap(([t, ad, yol]) => (k()[t] || []).map((s) => ({ t, ad, yol, s })));
    U.bas('#kdSuzgec', '<button class="cip' + (suzgec === 'tumu' ? ' aktif' : '') + '" type="button" data-deger="tumu">Tümü <span class="cip-sayi">' + l.length + '</span></button>' + TUR.map(([t, ad]) => '<button class="cip' + (suzgec === t ? ' aktif' : '') + '" type="button" data-deger="' + t + '">' + ad + ' <span class="cip-sayi">' + (k()[t] || []).length + '</span></button>').join(''));
    const g = l.filter((x) => suzgec === 'tumu' || x.t === suzgec);
    U.bas('#kdListe', g.map((x) => '<tr><td><span class="no">' + U.kac(adi(x.t, x.s)) + '</span></td><td>' + x.ad + '</td><td class="eylem-kolon"><div class="tablo-eylem"><button class="dugme hayalet tehlike kucuk" type="button" data-cikar="' + x.t + '|' + x.s + '">Çıkar</button><a class="dugme hayalet kucuk" href="' + DD.kok + x.yol + x.s + '/">Aç</a></div></td></tr>').join('') || '<tr><td colspan="3" class="bos-hucre">Bu türde kaydettiğin içerik yok.</td></tr>');
  }
  document.addEventListener('dd:suzgec', (e) => { if (e.target.id === 'kdSuzgec') { suzgec = e.detail.deger; ciz(); } });
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cikar]');
    if (!c) return;
    const [t, s] = c.dataset.cikar.split('|');
    k()[t] = k()[t].filter((x) => x !== s);
    U.kaydet(); ciz();
    DD.toast('Kaydedilenlerden çıkarıldı.', 'uyari');
  });
  ciz();
})();
