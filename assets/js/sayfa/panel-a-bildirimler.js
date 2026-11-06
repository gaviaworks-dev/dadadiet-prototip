/* Bildirimler: durumdan türeyen liste, okundu bilgisi demo durumuna yazılır. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const $ = (id) => document.getElementById(id);
  let sekme = 'tumu';

  function ciz() {
    const hepsi = PA.bildirimler();
    const sayi = { tumu: hepsi.length, okunmamis: hepsi.filter((b) => !b.okundu).length, okundu: hepsi.filter((b) => b.okundu).length };
    Object.keys(sayi).forEach((k) => { document.querySelector('[data-sayi="' + k + '"]').textContent = sayi[k]; });
    const l = hepsi.filter((b) => sekme === 'tumu' || (sekme === 'okundu') === b.okundu);
    $('bildirimListe').innerHTML = l.map((b) => `<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ${b.ikon}" aria-hidden="true"></i></span><span class="as-metin"><b><a href="${b.git}" data-bildirim="${h(b.id)}">${h(b.baslik)}</a></b><span>${h(b.metin)}</span><span>${h(b.tur)} · ${PA.tarih(b.zaman)} ${b.zaman.slice(11, 16)}</span></span><span class="as-eylem">${b.okundu ? PA.hap('Okundu', 'kapali') : PA.hap('Yeni', 'acik') + `<button class="ikon-dugme" type="button" data-oku="${h(b.id)}" aria-label="Okundu işaretle"><i class="fa-solid fa-check" aria-hidden="true"></i></button>`}</span></div>`).join('');
    $('bildirimBos').hidden = l.length > 0;
    $('tumunuOku').disabled = !sayi.okunmamis;
    PA.sekmeSabitle($('bildirimSekme'));
  }
  const oku = (id) => { PA.okunanlar()[id] = true; PA.kaydet(); };
  $('bildirimSekme').addEventListener('click', (e) => { const t = e.target.closest('[data-sekme]'); if (t) { sekme = t.dataset.sekme; ciz(); } });
  $('bildirimSekme').addEventListener('keydown', (e) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) setTimeout(() => { sekme = document.activeElement.dataset.sekme; ciz(); }, 0); });
  $('bildirimListe').addEventListener('click', (e) => {
    const b = e.target.closest('[data-oku]');
    if (b) { oku(b.dataset.oku); ciz(); return; }
    const a = e.target.closest('[data-bildirim]');
    if (a) oku(a.dataset.bildirim);
  });
  $('tumunuOku').addEventListener('click', () => {
    PA.bildirimler().forEach((b) => { PA.okunanlar()[b.id] = true; });
    PA.kaydet(); ciz();
    DD.toast('Bütün bildirimler okundu işaretlendi.');
  });
  document.addEventListener('pa:degisti', ciz);
  ciz();
})();
