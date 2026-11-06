/* Dışarıda Ne Yesem: süzgeçler yemek satırını, satırı kalmayan kartı gizler. Şehir örneği yalnız İstanbul'dur. */
(function () {
  'use strict';
  const kartlar = [...document.querySelectorAll('[data-mekan]')];
  const kap = document.getElementById('dzKartlar'), bos = document.getElementById('dzBos'), sayac = document.getElementById('dzSayac');
  const sehir = document.getElementById('dzSehir'), alerji = document.getElementById('dzAlerji');
  const bosBaslik = document.getElementById('dzBosBaslik'), bosMetin = document.getElementById('dzBosMetin');
  const cip = (alan) => { const a = document.querySelector('.cipler[data-alan="' + alan + '"] .cip.aktif'); return a ? a.dataset.deger : ''; };

  function ciz() {
    const hedef = +cip('hedef') || Infinity, tip = cip('tip'), mutfak = cip('mutfak');
    const yasak = [...alerji.querySelectorAll('[aria-pressed="true"]')].map((b) => b.dataset.deger);
    alerji.querySelectorAll('.cip').forEach((b) => b.classList.toggle('aktif', b.getAttribute('aria-pressed') === 'true'));
    const orneklenen = sehir.value === 'İstanbul';
    let gorunen = 0;
    kartlar.forEach((k) => {
      let kalan = 0;
      k.querySelectorAll('[data-yemek]').forEach((y) => {
        const al = y.dataset.alerjen.split(' ');
        const uyar = +y.dataset.kcal <= hedef && (!tip || y.dataset.tip.split(' ').includes(tip)) && !yasak.some((a) => al.includes(a));
        y.hidden = !uyar;
        if (uyar) kalan++;
      });
      const goster = orneklenen && kalan > 0 && (!mutfak || k.dataset.mutfak === mutfak);
      k.hidden = !goster;
      if (goster) gorunen++;
    });
    const toplam = sehir.selectedOptions[0].dataset.sayi;
    kap.hidden = !gorunen;
    bos.hidden = Boolean(gorunen);
    sayac.textContent = orneklenen ? (gorunen ? toplam + ' mekandan ' + gorunen + ' tanesi gösteriliyor · ' + sehir.value + ' ilinin tamamı' : 'Sonuç yok') : toplam + ' mekan · ' + sehir.value;
    bosBaslik.textContent = orneklenen ? 'Bu süzgeçlere uyan mekan yok' : sehir.value + ' mekanları bu önizlemede yok';
    bosMetin.textContent = orneklenen ? 'Öğün hedefini yükselt ya da bir süzgeci kaldır.' : 'Örnek kartlar İstanbul için listelendi. İstanbul\'a dönerek süzgeçleri deneyebilirsin.';
  }

  function temizle() {
    sehir.value = 'İstanbul';
    document.querySelectorAll('.suzgec-yigin .cipler[data-suzgec]').forEach((s) => s.querySelectorAll('.cip').forEach((c, i) => c.classList.toggle('aktif', i === 0)));
    alerji.querySelectorAll('.cip').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    ciz();
  }

  document.addEventListener('dd:suzgec', ciz);
  alerji.addEventListener('dd:secim', ciz);
  sehir.addEventListener('change', ciz);
  document.getElementById('dzTemizle').addEventListener('click', temizle);
  document.getElementById('dzBosTemizle').addEventListener('click', temizle);
  ciz();
})();
