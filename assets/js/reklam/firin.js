/* kaynak: DadaGastro@905288b7b2:public/reklam/firin.js · uyarlama: birebir */
// Ölçü rehberi fırın alanı (OB-FIRIN · madde 120): foto-etiketin tek-açık-kart sözleşmesi (reklam.js) kendi sahnesinde.
// Masaüstünde kart noktanın yanında sahneye sığdırılır; ≤640 px'te alt sayfa (<dialog class="rk-foto-mobil">) olur.
// Kapatma: ikinci tıklama · dışarı tıklama · Esc (odak noktaya döner) · yeniden boyutlama · sahne ekrandan çıkınca.
// Noktanın yeri kreatiften (karar 156): `data-x/y` fotoğrafın yüzdesi; fotoğraf sahneyi `object-fit: cover` ve `object-position`la
// doldurur (masaüstü 2:1, ≤640 px 3:2), çizilen boy ve kayma hesaplanıp nokta sahnenin yüzdesiyle konur (nokta.js `olcu` kalıbı).
(function () {
  var etiketler = [];
  function mobil() { return matchMedia('(max-width:640px)').matches; }
  function hoverKapat(etiket) { clearTimeout(etiket.hoverZamani); etiket.nokta.classList.remove('rk-hover'); }
  function acik() { return etiketler.find(function (e) { return e.nokta.open; }); }
  document.querySelectorAll('.rk-firin-sahne .rk-foto-nokta').forEach(function (nokta) {
    var kart = nokta.querySelector('.rk-foto-kart'), dugme = nokta.querySelector('summary');
    var foto = nokta.closest('.rk-firin-sahne'), portal = null, takip = null;
    if (!kart || !dugme) return;
    var etiket = {nokta:nokta, kart:kart, dugme:dugme, foto:foto};
    etiketler.push(etiket);
    // Kırpımın dışına düşen yer sahnenin kenarına yaslanır: nokta görünür, kart erişilebilir kalır.
    etiket.konumla = function () {
      var img = foto.querySelector('.rk-firin-foto');
      var x = parseFloat(nokta.getAttribute('data-x')), y = parseFloat(nokta.getAttribute('data-y'));
      // Oran o an çizilen kaynaktan (G8 §9.2: dar ekranda <picture>'ın 16:9 mobil görseli); yüklenmeden önce <img>'nin width/height'ı.
      var yuklu = img && img.complete && img.naturalWidth > 0;
      var gg = img ? (yuklu ? img.naturalWidth : +img.getAttribute('width')) : 0, gy = img ? (yuklu ? img.naturalHeight : +img.getAttribute('height')) : 0;
      var g = foto.clientWidth, h = foto.clientHeight;
      if (isNaN(x) || isNaN(y) || !gg || !gy || !g || !h) return;
      var olcek = Math.max(g / gg, h / gy), cg = gg * olcek, cy = gy * olcek;
      var yer = getComputedStyle(img).objectPosition.split(' ');
      function kayma(deger, bosluk) { return /%$/.test(deger) ? bosluk * parseFloat(deger) / 100 : parseFloat(deger) || 0; }
      var px = kayma(yer[0], g - cg) + x / 100 * cg, py = kayma(yer[1] || '50%', h - cy) + y / 100 * cy;
      var r = dugme.offsetWidth / 2;
      nokta.style.left = Math.min(g - r, Math.max(r, px)) / g * 100 + '%';
      nokta.style.top = Math.min(h - r, Math.max(r, py)) / h * 100 + '%';
    };
    etiket.konumla();
    // Görsel yüklenince (ve kırılımda <picture> kaynağı değişince) yer gerçek orandan yeniden hesaplanır.
    var foto0 = foto.querySelector('.rk-firin-foto');
    if (foto0) foto0.addEventListener('load', etiket.konumla);
    function yerlestir() {
      if (portal && nokta.open && mobil()) return;
      if (portal) { portal.close(); nokta.append(kart); portal.remove(); portal = null; kart.querySelector('.rk-foto-kapat')?.remove(); }
      kart.style.removeProperty('translate');
      var f = foto.getBoundingClientRect(), n = dugme.getBoundingClientRect();
      nokta.classList.toggle('rk-sola', n.left - f.left > f.width / 2);
      dugme.setAttribute('aria-expanded', String(nokta.open));
      if (!nokta.open) return;
      if (mobil()) {
        portal = document.createElement('dialog'); portal.className = 'rk-foto-mobil';
        portal.setAttribute('aria-label', dugme.getAttribute('aria-label'));
        document.body.append(portal); portal.append(kart);
        var kapat = document.createElement('button'); kapat.type = 'button'; kapat.className = 'rk-foto-kapat'; kapat.setAttribute('aria-label', 'Ürün kartını kapat'); kapat.textContent = '×';
        kart.querySelector('.rk-foto-baslik').append(kapat);
        kapat.addEventListener('click', function () { etiket.kapat(true); });
        portal.addEventListener('cancel', function (e) { e.preventDefault(); etiket.kapat(true); });
        portal.showModal();
      } else {
        nokta.classList.toggle('rk-yukari', f.bottom - n.bottom < kart.getBoundingClientRect().height + 24);
        var r = kart.getBoundingClientRect();
        var dx = Math.max(f.left + 8 - r.left, Math.min(0, f.right - 8 - r.right));
        var dy = Math.max(f.top + 8 - r.top, Math.min(0, f.bottom - 8 - r.bottom));
        kart.style.translate = dx + 'px ' + dy + 'px';
        var yeni = kart.getBoundingClientRect();
        kart.style.setProperty('--rk-caret-x', Math.max(12, Math.min(yeni.width - 28, n.left + n.width / 2 - yeni.left - 8)) + 'px');
      }
    }
    etiket.kapat = function (odak) {
      if (takip) { takip(); takip = null; }
      hoverKapat(etiket); nokta.open = false; nokta.classList.add('rk-dinleniyor'); yerlestir();
      if (odak) dugme.focus({preventScroll:true});
    };
    etiket.ac = function () {
      etiketler.forEach(function (diger) { if (diger !== etiket && diger.nokta.open) diger.kapat(false); });
      hoverKapat(etiket); nokta.classList.remove('rk-dinleniyor'); nokta.open = true; yerlestir();
      if (typeof rkTakipliPencere === 'function') takip = rkTakipliPencere(dugme, function () { etiket.kapat(false); }, yerlestir);
    };
    dugme.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (nokta.open) etiket.kapat(false); else etiket.ac();
    });
    dugme.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !matchMedia('(hover:hover) and (pointer:fine)').matches || acik()) return;
      clearTimeout(etiket.hoverZamani); nokta.classList.remove('rk-dinleniyor'); nokta.classList.add('rk-hover');
    });
    dugme.addEventListener('pointerleave', function () {
      clearTimeout(etiket.hoverZamani);
      etiket.hoverZamani = setTimeout(function () { hoverKapat(etiket); }, 140);
    });
    kart.addEventListener('click', function (e) { e.stopPropagation(); });
    nokta.addEventListener('toggle', yerlestir);
    yerlestir();
  });
  if (!etiketler.length) return;
  var yutulanTik = false, temizle;
  function disarida(e, aktif) { return !aktif.kart.contains(e.target) && !aktif.dugme.contains(e.target); }
  document.addEventListener('pointerdown', function (e) {
    var aktif = acik();
    if (aktif && disarida(e, aktif)) {
      aktif.kapat(false); yutulanTik = true;
      clearTimeout(temizle); temizle = setTimeout(function () { yutulanTik = false; }, 700);
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('click', function (e) {
    var aktif = acik();
    if (yutulanTik || (aktif && disarida(e, aktif))) {
      if (aktif) aktif.kapat(false);
      yutulanTik = false; clearTimeout(temizle); e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('keydown', function (e) {
    var aktif = acik();
    if (e.key === 'Escape' && aktif) { e.preventDefault(); e.stopImmediatePropagation(); aktif.kapat(true); }
  }, true);
  window.addEventListener('resize', function () { etiketler.forEach(function (e) { if (e.nokta.open && !mobil()) e.kapat(false); }); });
  // Sahnenin oranı kırılımda değişir (2:1 → 3:2): nokta yeniden konur.
  if ('ResizeObserver' in window) {
    var boyGozcusu = new ResizeObserver(function () { etiketler.forEach(function (e) { e.konumla(); }); });
    etiketler.forEach(function (e) { boyGozcusu.observe(e.foto); });
  } else {
    window.addEventListener('resize', function () { etiketler.forEach(function (e) { e.konumla(); }); });
  }
  var gozcu = new IntersectionObserver(function (girdiler) {
    girdiler.forEach(function (g) { if (!g.isIntersecting) etiketler.filter(function (e) { return e.foto === g.target && e.nokta.open && !mobil(); }).forEach(function (e) { e.kapat(false); }); });
  });
  etiketler.forEach(function (e) { gozcu.observe(e.foto); });
})();
