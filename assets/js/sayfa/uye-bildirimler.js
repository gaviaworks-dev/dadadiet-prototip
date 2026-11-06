/* Bildirimler: filtre, okundu ve silme; üst menü zili aynı sayıyı okur */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const TUR = { randevu: ['Randevu', 'fa-calendar-check'], mesaj: ['Mesaj', 'fa-comments'], program: ['Program', 'fa-clipboard-list'], rozet: ['Rozet', 'fa-award'] };
  const dur = () => U.yerel('bildirimDurum', { okundu: {}, silindi: {} });
  let suzgec = 'tumu';
  const satir = (x) => { const t = TUR[x.tur]; return '<div class="bildirim-satir' + (x.okundu ? '' : ' okunmadi') + '" data-id="' + U.kac(x.id) + '"><span class="bs-ikon"><i class="fa-solid ' + t[1] + '" aria-hidden="true"></i></span><span class="bs-metin"><p><b>' + U.kac(x.baslik) + '</b> ' + U.kac(x.metin) + '</p><span class="bs-meta"><span class="tur"><i class="fa-solid ' + t[1] + '" aria-hidden="true"></i> ' + t[0] + '</span> · <span>' + U.tarih(x.tarih) + '</span></span></span><span class="bs-islemler"><a class="bs-islem" href="' + DD.kok + x.yol + '" aria-label="Git" data-git><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' + (x.okundu ? '' : '<button class="bs-islem okundu" type="button" data-op="oku" aria-label="Okundu olarak işaretle"><i class="fa-solid fa-check" aria-hidden="true"></i></button>') + '<button class="bs-islem sil" type="button" data-op="sil" aria-label="Bildirimi sil"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></span>' + (x.okundu ? '' : '<span class="bs-benek"></span>') + '</div>'; };
  function ciz() {
    const l = U.bildirimler(), n = U.zil();
    $('#bnOzet').textContent = n ? n + ' okunmamış' : 'Hepsi okundu';
    $('#bnHepsi').disabled = !n;
    U.bas('#bnSuzgec', '<button class="cip' + (suzgec === 'tumu' ? ' aktif' : '') + '" type="button" data-deger="tumu">Tümü <span class="cip-sayi">' + l.length + '</span></button>' + Object.keys(TUR).map((k) => '<button class="cip' + (suzgec === k ? ' aktif' : '') + '" type="button" data-deger="' + k + '"><i class="fa-solid ' + TUR[k][1] + '" aria-hidden="true"></i> ' + TUR[k][0] + ' <span class="cip-sayi">' + l.filter((x) => x.tur === k).length + '</span></button>').join(''));
    const g = l.filter((x) => suzgec === 'tumu' || x.tur === suzgec);
    const yeni = g.filter((x) => U.gunFarki(x.tarih, U.bugun()) <= 7), eski = g.filter((x) => U.gunFarki(x.tarih, U.bugun()) > 7);
    const grup = (ad, a) => (a.length ? '<span class="gun-etiketi">' + ad + '</span><div class="bildirim-liste">' + a.map(satir).join('') + '</div>' : '');
    U.bas('#bnListe', g.length ? grup('Bu hafta', yeni) + grup('Daha eski', eski) : '<div class="kart">' + U.bos({ ikon: 'fa-bell-slash', baslik: 'Bildirim yok', metin: 'Bu türde bildirimin bulunmuyor.', eylem: '<a class="dugme hayalet" href="' + DD.kok + 'hesabim/#bildirim">Bildirim ayarları</a>' }) + '</div>');
  }
  document.addEventListener('dd:suzgec', (e) => { if (e.target.id === 'bnSuzgec') { suzgec = e.detail.deger; ciz(); } });
  document.addEventListener('click', (e) => {
    const s = e.target.closest('.bildirim-satir');
    if (!s) return;
    const id = s.dataset.id, op = e.target.closest('[data-op]');
    if (op) {
      if (op.dataset.op === 'oku') dur().okundu[id] = true; else dur().silindi[id] = true;
      U.kaydet(); ciz();
      if (op.dataset.op === 'sil') DD.toast('Bildirim silindi.', 'uyari');
    } else if (e.target.closest('[data-git]')) { dur().okundu[id] = true; U.kaydet(); }
  });
  $('#bnHepsi').addEventListener('click', () => {
    U.bildirimler().forEach((x) => { dur().okundu[x.id] = true; });
    U.kaydet(); ciz();
    DD.toast('Bütün bildirimler okundu.');
  });
  ciz();
})();
