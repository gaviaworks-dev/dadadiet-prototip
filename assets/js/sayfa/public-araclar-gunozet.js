/* Ana sayfa Günün Özeti: misafirde örnek gün kalır; üyede kendi günü (Web Kullanıcı Akışı, Günün Özeti).
   Değerler Günlük Takibim'in hesabıyla aynı kaynaktan gelir: uye-ortak.js U.gunToplam (işaretli öğünler + günlüğe eklenenler). */
(function () {
  'use strict';
  const kart = document.querySelector('[data-gun-ozet]');
  if (!kart) return;
  const ORNEK = { protein: [96, 150], karb: [140, 240], yag: [38, 65], kalan: 540 };
  const yazSatir = (alan, deger, hedef) => {
    const s = kart.querySelector('[data-gun-makro="' + alan + '"]');
    if (!s) return;
    s.querySelector('[data-gun-deger]').textContent = DD.bicim.sayi(Math.round(deger));
    s.querySelector('[data-gun-hedef]').textContent = hedef ? DD.bicim.gram(hedef, 0) : 'hedef yok';
    const o = s.querySelector('[data-oran]'), oran = hedef ? Math.min(100, Math.round((deger / hedef) * 100)) : 0;
    o.dataset.oran = oran; o.style.setProperty('--oran', oran);
    s.querySelector('.olcer').setAttribute('aria-label', s.querySelector('.olcum-bas span').textContent + ': ' + Math.round(deger) + ' / ' + (hedef ? hedef + ' g' : 'hedef yok'));
  };
  const kalanYaz = (metin, gizle) => { const k = kart.querySelector('[data-gun-kalan]'); k.hidden = !!gizle; k.querySelector('span').textContent = metin; };
  function ornek() {
    ['protein', 'karb', 'yag'].forEach((a) => yazSatir(a, ORNEK[a][0], ORNEK[a][1]));
    kalanYaz('Hedefine ' + ORNEK.kalan + ' kcal kaldı');
    document.querySelector('[data-gun-rozet]').textContent = 'Örnek gün';
  }
  function uye() {
    const U = window.DDU;
    if (!U) return;
    if (DD.tercihUyum && DD.tercihUyum.uyeBagla) DD.tercihUyum.uyeBagla(U);
    const t = U.gunToplam(), h = (U.uye().tercihler || {});
    ['protein', 'karb', 'yag'].forEach((a) => yazSatir(a, t[a], h[a]));
    /* Yeme bozukluğu öyküsü seçili üyede kalori sayacı gösterilmez (K21.7) */
    if (U.yemeDuyarli()) kalanYaz('', true);
    else if (!h.kcal) kalanYaz('Günlük kalori hedefin yok; hesaplayıcıdan belirleyebilirsin');
    else { const k = Math.round(h.kcal - t.kcal); kalanYaz(k >= 0 ? 'Hedefine ' + DD.bicim.kcal(k) + ' kaldı' : 'Hedefini ' + DD.bicim.kcal(-k) + ' aştın'); }
    document.querySelector('[data-gun-rozet]').textContent = 'Bugün · ' + DD.bicim.tarih(DD.bugun);
  }
  /* Üye ortak betiği yalnız oturum açıkken yüklenir: misafir sayfası üye koduna dokunmaz */
  function yukle() {
    if (!DD.oturum.acik()) { ornek(); return; }
    if (window.DDU) { uye(); return; }
    const sc = document.createElement('script');
    sc.src = DD.kok + 'assets/js/sayfa/uye-ortak.js';
    sc.onload = uye;
    document.head.appendChild(sc);
  }
  yukle();
  document.addEventListener('dd:oturum', yukle);
})();
