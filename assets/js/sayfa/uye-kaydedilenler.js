/* Kaydedilenler: demo.uye.kaydedilenler listesini gösterir ve yönetir */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const kat = JSON.parse($('#kdKatalog').textContent);
  const TUR = [['tarifler', 'Tarif', 'tarif/'], ['besinler', 'Besin', 'besin/'], ['programlar', 'Program', 'program/'], ['rehberler', 'Rehber', 'besin-rehberi/'], ['diyetisyenler', 'Diyetisyen', 'diyetisyen/'], ['yonlendirmeler', 'Öneri', '']];
  /* Prototipte her türün tek örnek detay sayfası var, ötekiler kendi listesine gider */
  const DETAY = { besinler: ['avokado'], programlar: ['akdeniz-tipi-beslenme'], rehberler: ['dengeli-tabak'], diyetisyenler: ['dyt-ece-tunali', 'dyt-elif-sahin'] };
  const LISTE = { besinler: 'besin-kutuphanesi/', programlar: 'programlar/', rehberler: 'besin-rehberi/', diyetisyenler: 'diyetisyenler/', yonlendirmeler: 'bana-uygun-olani-bul/' };
  const yolu = (x) => {
    if (x.t === 'tarifler') return U.tarif(x.s) ? 'tarif/' + x.s + '/' : 'tarifler/';
    if (x.t === 'yonlendirmeler') return (kat.yonlendirmeler[x.s] || [])[1] || LISTE[x.t];
    return (DETAY[x.t] || []).includes(x.s) ? x.yol + x.s + '/' : LISTE[x.t];
  };
  /* Kaydedilme tarihi: kaydet düğmesi uye.kaydedilenler_tarih['grup|slug'] alanına yazar; tarihsiz eski kayıtta "—" */
  const tarihi = (x) => { const t = (U.uye().kaydedilenler_tarih || {})[x.t + '|' + x.s]; return t ? U.tarih(t) : '—'; };
  const k = () => { const u = U.uye(); u.kaydedilenler = u.kaydedilenler || {}; return u.kaydedilenler; };
  let suzgec = 'tumu';
  const adi = (tur, s) => {
    if (tur === 'besinler') return (U.besin(s) || {}).ad || s;
    if (tur === 'tarifler') return (U.tarif(s) || {}).ad || s;
    if (tur === 'yonlendirmeler') return (kat.yonlendirmeler[s] || [s])[0];
    return (kat[tur] || {})[s] || s;
  };
  function ciz() {
    const l = TUR.flatMap(([t, ad, yol]) => (k()[t] || []).map((s) => ({ t, ad, yol, s })));
    U.bas('#kdSuzgec', '<button class="cip' + (suzgec === 'tumu' ? ' aktif' : '') + '" type="button" data-deger="tumu">Tümü <span class="cip-sayi">' + l.length + '</span></button>' + TUR.map(([t, ad]) => '<button class="cip' + (suzgec === t ? ' aktif' : '') + '" type="button" data-deger="' + t + '">' + ad + ' <span class="cip-sayi">' + (k()[t] || []).length + '</span></button>').join(''));
    const g = l.filter((x) => suzgec === 'tumu' || x.t === suzgec);
    U.bas('#kdListe', g.map((x) => '<tr><td><span class="no">' + U.kac(adi(x.t, x.s)) + '</span></td><td>' + x.ad + '</td><td class="tarih">' + tarihi(x) + '</td><td class="eylem-kolon"><div class="tablo-eylem">' + (x.t === 'programlar' ? '<a class="ikon-dugme" href="' + DD.kok + 'hesabim/program-baslat/?program=' + encodeURIComponent(x.s) + '" aria-label="Programa başla"><i class="fa-solid fa-play" aria-hidden="true"></i></a>' : '') + '<a class="ikon-dugme" href="' + DD.kok + yolu(x) + '" aria-label="Görüntüle"><i class="fa-solid fa-eye" aria-hidden="true"></i></a><button class="ikon-dugme" type="button" data-cikar="' + x.t + '|' + x.s + '" aria-label="Kaydedildi, kayıttan çıkar"><i class="fa-solid fa-circle-check" aria-hidden="true"></i></button></div></td></tr>').join('') || '<tr><td colspan="4" class="bos-hucre">' + (l.length ? 'Bu türde kaydettiğin içerik yok.' : 'Henüz bir şey kaydetmedin. Programını Bul sonucundaki “Kaydet” ile programları buraya ekleyebilirsin. <a href="' + DD.kok + 'programlar/program-bul/">Programını Bul</a>') + '</td></tr>');
  }
  document.addEventListener('dd:suzgec', (e) => { if (e.target.id === 'kdSuzgec') { suzgec = e.detail.deger; ciz(); } });
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cikar]');
    if (!c) return;
    const [t, s] = c.dataset.cikar.split('|');
    k()[t] = k()[t].filter((x) => x !== s);
    delete (U.uye().kaydedilenler_tarih || {})[t + '|' + s];
    U.kaydet(); ciz();
    DD.toast('Kayıttan çıkarıldı.', 'uyari');
  });
  ciz();
})();
