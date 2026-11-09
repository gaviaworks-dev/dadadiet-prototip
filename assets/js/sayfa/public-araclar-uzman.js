/* Diyetisyen vitrini: canlı süzgeç ve sıralama. Alan içinde VEYA, alanlar arası VE. Dar ekranda süzgeç alttan açılır. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const kok = $('uzmanListe'), izgara = $('uzmanKartlar'), kartlar = [...izgara.children], ilkSira = kartlar.slice();
  const kutular = [...kok.querySelectorAll('[data-suz]')], sutun = $('suzmeSutun'), ortu = $('suzmeOrtu');
  const secili = (a) => kutular.filter((k) => k.dataset.suz === a && k.checked).map((k) => k.value);
  const sayi = (v) => (v === '' ? null : +v);

  function cipleriCiz(aktif) {
    const kap = $('suzmeCipler');
    kap.hidden = !aktif.length;
    kap.replaceChildren(...aktif.map((k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'suzme-cip'; b.textContent = k.dataset.ad + ' ';
      b.setAttribute('aria-label', k.dataset.ad + ' filtresini kaldır');
      b.insertAdjacentHTML('beforeend', '<i class="fa-solid fa-xmark" aria-hidden="true"></i>');
      b.addEventListener('click', () => { k.checked = false; ciz(); });
      return b;
    }));
    if (aktif.length) {
      const t = document.createElement('button');
      t.type = 'button'; t.className = 'suzme-temizle'; t.dataset.temizle = ''; t.textContent = 'Tümünü Temizle';
      kap.append(t);
    }
  }
  function ciz() {
    const u = secili('uzmanlik'), g = secili('gorusme'), s = secili('sehir'), d = secili('dogrulama');
    let adet = 0;
    kartlar.forEach((k) => {
      const uy = (!u.length || k.dataset.uzmanlik.split('|').some((x) => u.includes(x))) && (!g.length || k.dataset.gorusme.split(' ').some((x) => g.includes(x))) && (!s.length || s.includes(k.dataset.sehir)) && (!d.length || d.includes(k.dataset.dogrulama));
      k.hidden = !uy; if (uy) adet++;
    });
    $('uzmanSayi').textContent = adet + ' uzman';
    $('suzmeUygula').textContent = adet + ' uzmanı göster';
    izgara.hidden = !adet; $('uzmanBos').hidden = !!adet;
    kok.querySelectorAll('.suzme-grup').forEach((grup) => {
      const n = grup.querySelectorAll('[data-suz]:checked').length;
      grup.classList.toggle('dolu', n > 0);
      grup.querySelector('.suzme-rozet').textContent = n;
    });
    const aktif = kutular.filter((k) => k.checked);
    $('suzmeSayi').hidden = !aktif.length; $('suzmeSayi').textContent = aktif.length;
    cipleriCiz(aktif);
  }
  function panel(ac) {
    sutun.classList.toggle('acik', ac); ortu.classList.toggle('acik', ac);
    document.documentElement.style.overflow = ac ? 'hidden' : '';
  }
  const SIRA = {
    puan: (a, b) => (sayi(b.dataset.puan) ?? -1) - (sayi(a.dataset.puan) ?? -1),
    degerlendirme: (a, b) => b.dataset.degerlendirme - a.dataset.degerlendirme,
    fiyat: (a, b) => (sayi(a.dataset.fiyat) ?? Infinity) - (sayi(b.dataset.fiyat) ?? Infinity) || 0,
    deneyim: (a, b) => b.dataset.deneyim - a.dataset.deneyim,
    uygunluk: (a, b) => String(a.dataset.uygun || '9999').localeCompare(String(b.dataset.uygun || '9999')),
  };
  function siraMenu(ac) {
    $('siraKutu').classList.toggle('acik', ac);
    $('siraDugme').setAttribute('aria-expanded', String(ac));
  }

  kok.addEventListener('change', (e) => { if (e.target.matches('[data-suz]')) ciz(); });
  kok.addEventListener('click', (e) => {
    if (e.target.closest('[data-temizle]')) { kutular.forEach((k) => { k.checked = false; }); ciz(); return; }
    const bas = e.target.closest('.suzme-grup-bas');
    if (bas) { bas.setAttribute('aria-expanded', String(bas.parentElement.classList.toggle('acik'))); return; }
    const daha = e.target.closest('.suzme-daha');
    if (daha) {
      const acik = daha.closest('.suzme-grup').classList.toggle('tumu-acik');
      daha.setAttribute('aria-expanded', String(acik));
      daha.querySelector('span').textContent = acik ? 'Daha az göster' : 'Tüm alanları göster';
      return;
    }
    const secim = e.target.closest('[data-sira]');
    if (secim) {
      /* En yakın uygunluk: kartta açık saat tarihi (data-uygun) yoksa sıra değişmez, neden söylenir */
      if (secim.dataset.sira === 'uygunluk' && !kartlar.some((k) => k.dataset.uygun)) DD.toast('Uzmanlar açık saatlerini yayınladığında bu sıralama en yakın randevuya göre dizer. Şimdilik önerilen sıra gösteriliyor.', 'uyari');
      const f = SIRA[secim.dataset.sira];
      (f ? ilkSira.slice().sort(f) : ilkSira).forEach((k) => izgara.append(k));
      kok.querySelectorAll('[data-sira]').forEach((b) => b.classList.toggle('aktif', b === secim));
      $('siraSimdi').textContent = secim.textContent.trim();
      siraMenu(false);
    }
  });
  $('siraDugme').addEventListener('click', (e) => { e.stopPropagation(); siraMenu(!$('siraKutu').classList.contains('acik')); });
  document.addEventListener('click', (e) => { if (!e.target.closest('#siraKutu')) siraMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { siraMenu(false); panel(false); } });
  $('suzmeAc').addEventListener('click', () => panel(true));
  [$('suzmeKapat'), $('suzmeUygula'), ortu].forEach((el) => el.addEventListener('click', () => panel(false)));
})();
