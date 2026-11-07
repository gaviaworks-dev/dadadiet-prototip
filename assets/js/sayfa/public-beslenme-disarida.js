/* Dışarıda Ne Yesem: Gourmet kalıbı sol filtre. Grup içinde VEYA, gruplar arasında VE. Dar ekranda panel alttan açılır. */
(function () {
  'use strict';
  const BOYUT = 12;
  const TIP = { vegan: 'bitkisel', vejetaryen: 'vejetaryen', glutensiz: 'glutensiz' };
  const kartlar = [...document.querySelectorAll('[data-mekan]')];
  const panel = document.getElementById('dzPanel'), perde = document.getElementById('dzPerde'), ac = document.getElementById('dzFiltreAc');
  const kap = document.getElementById('dzKartlar'), bos = document.getElementById('dzBos'), sayac = document.getElementById('dzSayac');
  const sayfalama = document.getElementById('dzSayfalama'), goster = document.getElementById('dzGoster'), filtreSayi = document.getElementById('dzFiltreSayi');
  const gruplar = [...panel.querySelectorAll('[data-filtre-grup]')];
  let sayfa = 1;

  const secim = (g) => [...g.querySelectorAll('input:checked')];

  const uyum = (y) => !DD.tercihUyum || DD.tercihUyum.uygunMu(y.dataset.uyum);

  /* Kartta üyenin tercihine ve Beslenme seçimine uyan tüm örnekler kalorisiyle görünür; vegan seçiminde tavuk gösterilmez. */
  function ornekSuz(k, tipler) {
    const satirlar = [...k.querySelectorAll('[data-yemek]')];
    const uygun = (y) => uyum(y) && (!tipler.length || tipler.some((t) => y.dataset.tip.split(' ').includes(t)));
    satirlar.forEach((y) => { y.hidden = !uygun(y); });
    k.querySelector('[data-yemek-yok]').hidden = satirlar.some(uygun);
  }

  function ciz(basaDon) {
    const sec = gruplar.map((g) => ({ alan: g.dataset.filtreGrup, kutular: secim(g), g }));
    const dolu = sec.filter((s) => s.kutular.length);
    const uyan = kartlar.filter((k) => dolu.every((s) => {
      const degerler = k.dataset[s.alan].split('|');
      return s.kutular.some((c) => degerler.includes(c.value));
    }));
    const sayfaSayi = Math.max(1, Math.ceil(uyan.length / BOYUT));
    if (sayfa > sayfaSayi) sayfa = 1;
    const gorunen = uyan.slice((sayfa - 1) * BOYUT, sayfa * BOYUT);
    kartlar.forEach((k) => { k.hidden = !gorunen.includes(k); });
    kap.hidden = !uyan.length;
    bos.hidden = Boolean(uyan.length);

    const beslenme = sec.find((s) => s.alan === 'beslenme').kutular.map((c) => TIP[c.value]);
    kartlar.forEach((k) => ornekSuz(k, beslenme));

    sec.forEach((s) => {
      const r = s.g.querySelector('.filtre-grup-sayi');
      r.textContent = s.kutular.length;
      r.hidden = !s.kutular.length;
    });
    const secimSayi = dolu.reduce((n, s) => n + s.kutular.length, 0);
    filtreSayi.textContent = secimSayi;
    filtreSayi.hidden = !secimSayi;

    const tekSayi = dolu.length === 1 && dolu[0].kutular.length === 1 ? dolu[0].kutular[0].closest('.filtre-satir').querySelector('.filtre-sayi').textContent : null;
    sayac.innerHTML = !uyan.length ? '<b>Sonuç yok</b>' : (!dolu.length ? '<b>' + kap.dataset.toplam + ' mekan</b> içinden ' + uyan.length + ' örnek listeleniyor' : tekSayi ? '<b>' + tekSayi + ' mekan</b> içinden ' + uyan.length + ' örnek listeleniyor' : '<b>' + uyan.length + ' örnek mekan</b> listeleniyor');
    goster.textContent = uyan.length ? uyan.length + ' Mekanı Göster' : 'Sonuç Yok';

    sayfalama.hidden = sayfaSayi < 2;
    let h = '<button class="sayfa-dugme ok" type="button" data-sayfa="' + (sayfa - 1) + '" aria-label="Önceki sayfa"' + (sayfa === 1 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>';
    for (let i = 1; i <= sayfaSayi; i++) h += '<button class="sayfa-dugme' + (i === sayfa ? ' aktif' : '') + '" type="button" data-sayfa="' + i + '"' + (i === sayfa ? ' aria-current="page"' : '') + '>' + i + '</button>';
    h += '<button class="sayfa-dugme ok" type="button" data-sayfa="' + (sayfa + 1) + '" aria-label="Sonraki sayfa"' + (sayfa === sayfaSayi ? ' disabled' : '') + '><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>';
    sayfalama.innerHTML = h;
    if (basaDon) document.getElementById('dzListe').scrollIntoView({ block: 'start' });
  }

  function temizle() {
    panel.querySelectorAll('input:checked').forEach((c) => { c.checked = false; });
    sayfa = 1;
    ciz();
  }

  function paneliAc() {
    panel.classList.add('acik');
    perde.hidden = false;
    ac.setAttribute('aria-expanded', 'true');
    document.documentElement.style.setProperty('overflow', 'hidden');
    panel.querySelector('.filtre-kapat').focus();
  }

  function paneliKapat() {
    if (!panel.classList.contains('acik')) return;
    panel.classList.remove('acik');
    perde.hidden = true;
    ac.setAttribute('aria-expanded', 'false');
    document.documentElement.style.removeProperty('overflow');
    ac.focus();
  }

  panel.addEventListener('change', function () { sayfa = 1; ciz(); });
  panel.addEventListener('click', function (e) {
    const b = e.target.closest('.filtre-grup-bas');
    if (!b) return;
    b.setAttribute('aria-expanded', String(b.parentElement.classList.toggle('acik')));
  });
  document.addEventListener('click', function (e) { if (e.target.closest('[data-filtre-kapat]')) paneliKapat(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') paneliKapat(); });
  ac.addEventListener('click', paneliAc);
  sayfalama.addEventListener('click', function (e) {
    const d = e.target.closest('[data-sayfa]');
    if (!d || d.disabled) return;
    sayfa = +d.dataset.sayfa;
    ciz(true);
  });
  document.getElementById('dzTemizle').addEventListener('click', temizle);
  document.getElementById('dzBosTemizle').addEventListener('click', temizle);
  ciz();
})();
