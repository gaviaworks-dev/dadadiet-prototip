/* kaynak: tasks/prototip/klinik-koridor_dosyalar/kk-kart-konum.js (Beyar onaylı prototip, revize 3) · uyarlama: birebir; ok yönünün sınıfları klinik-koridor.css'te */
/* Klinik koridoru kartının konumu (Beyar revize 3). Gastro'nun foto-etiket yaşam döngüsü (tek açık kart, dışarı tık,
   Escape, 390'da alttan açılan sayfa; reklam.js) olduğu gibi kalır; masaüstünde kart NOKTANIN değil yanındaki KARE avatar kartının
   kenarından açılır: önce sağa, sığmazsa sola, ikisi de sığmazsa aşağı; ok kare karta bakar. */
(function () {
  'use strict';
  var BOSLUK = 12, KENAR = 12;
  var mobil = function () { return window.matchMedia('(max-width:640px)').matches; };

  function yerlestir(nokta) {
    var kart = nokta.querySelector('.rk-foto-kart');
    var hap = nokta.querySelector('.kk-hap');
    var sahne = nokta.closest('.rk-dolap-sahne');
    if (!kart || !hap || !sahne || mobil() || !nokta.open || !kart.isConnected || kart.closest('dialog')) return;
    kart.style.translate = 'none';
    kart.style.right = 'auto';
    kart.style.bottom = 'auto';
    var d = nokta.getBoundingClientRect(), h = hap.getBoundingClientRect(), f = sahne.getBoundingClientRect();
    // Uyarlama (D2-rc): bandın ardındaki panel koridorun alt şeridine biner (-22 px); kart o şeridin altında kalmasın diye alt sınır panelin üstü.
    var panel = nokta.closest('.kk-koridor').nextElementSibling, p = panel ? panel.getBoundingClientRect() : null;
    var alt = p && p.height && p.top > f.top && p.top < f.bottom ? p.top : f.bottom;
    var g = kart.offsetWidth, y = kart.offsetHeight;
    var sinirSol = Math.max(f.left, 0) + KENAR, sinirSag = Math.min(f.right, window.innerWidth) - KENAR;
    var yon, sol, ust;
    if (h.right + BOSLUK + g <= sinirSag) { yon = 'sag'; sol = h.right + BOSLUK; }
    else if (h.left - BOSLUK - g >= sinirSol) { yon = 'sol'; sol = h.left - BOSLUK - g; }
    else { yon = 'alt'; sol = Math.min(Math.max(h.left + h.width / 2 - g / 2, sinirSol), sinirSag - g); }
    if (yon === 'alt') { ust = h.bottom + BOSLUK; }
    else { ust = Math.min(Math.max(h.top + h.height / 2 - 40, f.top + KENAR), alt - KENAR - y); }
    kart.style.left = (sol - d.left) + 'px';
    kart.style.top = (ust - d.top) + 'px';
    nokta.classList.remove('kk-yon-sag', 'kk-yon-sol', 'kk-yon-alt');
    nokta.classList.add('kk-yon-' + yon);
    // Ok kare kartın ortasına bakar: yan açılışta dikey, alt açılışta yatay konum.
    if (yon === 'alt') kart.style.setProperty('--kk-ok', Math.max(16, Math.min(g - 28, h.left + h.width / 2 - sol - 8)) + 'px');
    else kart.style.setProperty('--kk-ok', Math.max(16, Math.min(y - 28, h.top + h.height / 2 - ust - 8)) + 'px');
  }

  /* Revize 28 Eki (Beyar madde 4, "kart başka kapıdan çıkıyor"): reklam.js kartı tıklamada Gastro'nun genel kuralıyla (noktanın
     altı/üstü, kadraja kıstırılmış) görünür yapıyor ve `rk-kart-ac` animasyonu orada başlıyordu; aşağıdaki `toggle` (async) + 2 rAF
     yerleştirmesi kartı ancak 2 kare sonra tıklanan kapının yanına taşıyordu (ölçüldü 1440: kapı 5 kartı (704,98) → (818,343)).
     `open` özniteliği değişir değişmez mikro görevde yerleştirilir: ilk boyanan kare tıklanan kapının kartıdır. */
  var acilis = 'MutationObserver' in window ? new MutationObserver(function (kayitlar) {
    kayitlar.forEach(function (k) { if (k.target.open) yerlestir(k.target); });
  }) : null;

  document.querySelectorAll('.kk-koridor details.rk-foto-nokta').forEach(function (nokta) {
    if (acilis) acilis.observe(nokta, { attributes: true, attributeFilter: ['open'] });
    nokta.addEventListener('toggle', function () {
      if (!nokta.open) { nokta.classList.remove('kk-yon-sag', 'kk-yon-sol', 'kk-yon-alt'); return; }
      // foto-etiket.js kendi yerleştirmesini aynı olayda yapar; bizimki bir kare sonra son sözü söyler.
      requestAnimationFrame(function () { requestAnimationFrame(function () { yerlestir(nokta); }); });
    });
  });
})();
