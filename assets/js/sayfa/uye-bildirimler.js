/* Bildirimler sayfası (Gastro g-bildirimler + public/f4/uye-bildirimler.js): Tümü sayaçlı, kategori çipleri sayaçsız; satıra dokunmak okundu işaretler; sil geri alınır. Veri ve satır DD.bildirim'den. */
(function () {
  'use strict';
  const DD = window.DD, B = DD.bildirim;
  const $ = (s) => document.querySelector(s);
  let suzgec = 'tumu', silinen = null;
  const cip = (k, ad, ikon, n) => '<button class="cip' + (suzgec === k ? ' aktif' : '') + '" type="button" data-deger="' + k + '" aria-pressed="' + (suzgec === k) + '">' + (ikon ? '<i class="fa-solid ' + ikon + '" aria-hidden="true"></i> ' : '') + ad + (n != null ? ' <span class="cip-sayi">' + n + '</span>' : '') + '</button>';
  const grup = (ad, a) => (a.length ? '<div class="gun-etiketi">' + ad + '</div><div class="bildirim-liste">' + a.map((x) => B.satir(x)).join('') + '</div>' : '');
  function ciz() {
    const l = B.liste(), n = l.filter((x) => !x.okundu).length, rozet = $('#bnRozet');
    rozet.hidden = !n;
    rozet.textContent = n + ' okunmamış';
    $('#bnHepsi').disabled = !n;
    $('#bnSuzgec').innerHTML = cip('tumu', 'Tümü', '', l.length) + Object.keys(B.TUR).map((k) => cip(k, B.TUR[k][0], B.TUR[k][1])).join('');
    const g = l.filter((x) => suzgec === 'tumu' || x.tur === suzgec), fark = (x) => B.gunFarki(x.tarih);
    $('#bnListe').innerHTML = grup('Bugün', g.filter((x) => fark(x) <= 0)) + grup('Dün', g.filter((x) => fark(x) === 1)) + grup('Daha Eski', g.filter((x) => fark(x) > 1));
    const bos = $('#bnBos');
    bos.hidden = !!g.length;
    if (!g.length) {
      const hic = !l.length;
      bos.querySelector('h3').textContent = hic ? 'Henüz bildirimin yok' : 'Bu türde bildirim yok';
      bos.querySelector('p').textContent = hic ? 'Bir program başlat, diyetisyeninle görüş; hesabın işledikçe burası dolacak.' : 'Süzgeci değiştir ya da "Tümü"ne dönüp akışın tamamına bak.';
      $('#bnBosEylem').hidden = !hic;
    }
  }
  document.addEventListener('dd:suzgec', (e) => { if (e.target.id === 'bnSuzgec') { suzgec = e.detail.deger; ciz(); } });
  document.addEventListener('dd:bildirim', ciz);
  $('#bnListe').addEventListener('click', (e) => {
    const s = e.target.closest('.bildirim-satir');
    if (!s) return;
    const id = s.dataset.id, op = e.target.closest('[data-op]');
    if (!op) { if (s.classList.contains('okunmadi')) B.oku(id); return; }
    if (op.dataset.op === 'oku') { B.oku(id); return; }
    silinen = id;
    B.sil(id);
    $('#bnGeriMetin').textContent = 'Bildirim silindi.';
    $('#bnGeri').hidden = false;
  });
  $('#bnGeriDugme').addEventListener('click', () => {
    if (silinen) B.geriAl(silinen);
    silinen = null;
    $('#bnGeri').hidden = true;
  });
  $('#bnHepsi').addEventListener('click', () => {
    B.hepsiniOku();
    DD.toast('Bütün bildirimler okundu.');
  });
  ciz();
})();
