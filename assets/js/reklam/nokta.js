/* kaynak: DadaGastro@905288b7b2:public/reklam/nokta.js · uyarlama: birebir */
/**
 * NOKTA KATMANI — konum ve etkileşim (Faz 5a · N4). Bileşen: `components/reklam/nokta-katmani.blade.php`.
 *
 * · Konum binde ve GÖRSELE göredir. Görsel kabı `object-fit: cover` ile doldurduğu için çizilen boy ve kayma
 *   hesaplanır (`olcu`) ve noktanın merkezi piksele çevrilir; kap değişince (ResizeObserver) yeniden konur.
 * · Mobil çerçevede (`data-rk-nk-cerceve="mobil"`, ya da `oto` ve 640 px ve altı) nokta ayrı mobil konumunu
 *   kullanır; yoksa masaüstü konumunu.
 * · Sitede kırpımın dışında kalan nokta gizlenir (boşluğun üstünde nokta basılmaz). Düzenleme kipinde kenara
 *   yaslanır ve `rk-nk-disarida` alır: düzenleyici onu görünür tutup sürükletebilir.
 * · Sitede nokta foto-etiket bileşenidir (`.rk-foto-nokta`): burada yalnız konumlanır; tek açık kart, dışarı tık,
 *   Escape ve mobil alt pencere `reklam.js`in foto-etiket yaşam döngüsüdür.
 * · Etkileşim (onizleme kipi): tek açık kart (`details[name]`), dışarı tıklayınca ve Escape'le kapanır, kart
 *   çerçevenin içine sığdırılır. Düzenleme kipinde özet tıklaması kart açmaz; olayları düzenleyici kurar.
 * Düzenleyici bu dosyanın hesabını `window.DM_NOKTA_KATMANI` üzerinden kullanır; iki yerde iki hesap yoktur.
 */
(function () {
  'use strict';
  if (window.DM_NOKTA_KATMANI) return;

  var MOBIL = '(max-width: 640px)';
  var kurulu = new WeakSet();
  var gozcu = 'ResizeObserver' in window ? new ResizeObserver(function (girdiler) {
    girdiler.forEach(function (g) { konumla(g.target); });
  }) : null;

  function sinirla(v, alt, ust) { return Math.min(ust, Math.max(alt, v)); }
  function sayi(v) { return v === null || v === undefined || v === '' ? null : Number(v); }
  function kipi(katman) { return katman.getAttribute('data-rk-nk-kip') || 'site'; }

  function resmi(katman) {
    return katman.querySelector('.rk-nk-gorsel') ||
      (katman.parentElement ? katman.parentElement.querySelector(':scope > img') : null);
  }

  function mobilMi(katman) {
    var c = katman.getAttribute('data-rk-nk-cerceve');
    return c === 'mobil' || (c === 'oto' && window.matchMedia(MOBIL).matches);
  }

  /* Kabın boyu ve `cover` kırpımı: görselin çizilen genişliği/yüksekliği ve sol üstünün kaydığı yer. */
  function olcu(katman) {
    var img = resmi(katman);
    var g = katman.clientWidth, y = katman.clientHeight;
    if (!img || !img.naturalWidth || !img.naturalHeight || !g || !y) return null;
    var olcek = Math.max(g / img.naturalWidth, y / img.naturalHeight);
    var cg = img.naturalWidth * olcek, cy = img.naturalHeight * olcek;
    return { g: g, y: y, cg: cg, cy: cy, sx: (g - cg) / 2, sy: (y - cy) / 2 };
  }

  /* Noktanın bu çerçevedeki binde konumu: mobilde ayrı konum varsa o, yoksa masaüstü. */
  function binde(nokta, mobil) {
    var mx = sayi(nokta.getAttribute('data-mx')), my = sayi(nokta.getAttribute('data-my'));
    if (mobil && mx !== null && my !== null) return [mx, my];
    return [sayi(nokta.getAttribute('data-x')) || 0, sayi(nokta.getAttribute('data-y')) || 0];
  }

  function piksele(o, b) { return [o.sx + b[0] / 1000 * o.cg, o.sy + b[1] / 1000 * o.cy]; }

  /* Çerçevedeki piksel → görsele göre binde (0–1000). */
  function bindeye(o, px, py) {
    return [sinirla(Math.round((px - o.sx) / o.cg * 1000), 0, 1000), sinirla(Math.round((py - o.sy) / o.cy * 1000), 0, 1000)];
  }

  /* Görselin bu çerçevede görünen kısmı (binde): düzenleyici sürüklemeyi bu kutuya sınırlar. */
  function gorunenBinde(o) {
    var sol = bindeye(o, 0, 0), sag = bindeye(o, o.g, o.y);
    return { x0: sol[0], y0: sol[1], x1: sag[0], y1: sag[1] };
  }

  function konumla(katman) {
    var o = olcu(katman);
    if (!o) return;
    var mobil = mobilMi(katman);
    var duzenleme = kipi(katman) === 'duzenleme';
    katman.querySelectorAll('.rk-nk-nokta').forEach(function (n) {
      var p = piksele(o, binde(n, mobil));
      var disarida = p[0] < 0 || p[0] > o.g || p[1] < 0 || p[1] > o.y;
      if (duzenleme) {
        n.hidden = false;
        n.classList.toggle('rk-nk-disarida', disarida);
        p = [sinirla(p[0], 0, o.g), sinirla(p[1], 0, o.y)];
      } else {
        n.hidden = disarida;
      }
      n.style.left = p[0] + 'px';
      n.style.top = p[1] + 'px';
      n.classList.toggle('rk-nk-sola', p[0] > o.g / 2);
      n.classList.toggle('rk-nk-yukari', p[1] > o.y / 2);
    });
    /* Sitede nokta foto-etiket bileşenidir (`.rk-foto-nokta`; aç/kapa `reklam.js`te): kap işaretin (`summary`) sol üstü
       olduğundan işaretin merkezi noktaya oturtulur. Balonun ve kartın yönü (`rk-sola`) `reklam.js`in kuralıyla (işaret
       sahnenin sağ yarısında) burada da yazılır: o betik yönü yalnız açılış ve kapanışta yeniler, konum ondan sonra gelebilir. */
    katman.querySelectorAll('.rk-foto-nokta').forEach(function (n) {
      var p = piksele(o, binde(n, mobil));
      n.hidden = p[0] < 0 || p[0] > o.g || p[1] < 0 || p[1] > o.y;
      if (n.hidden) return;
      var isaret = n.querySelector('summary');
      var sol = p[0] - (isaret ? isaret.offsetWidth : 0) / 2, ust = p[1] - (isaret ? isaret.offsetHeight : 0) / 2;
      n.style.left = sol + 'px';
      n.style.top = ust + 'px';
      n.classList.toggle('rk-sola', sol > o.g / 2);
    });
    katman.querySelectorAll('.rk-nk-nokta[open]').forEach(kartiSigdir);
  }

  /* Açık kart çerçevenin içinde kalır (çerçeve `overflow: hidden`). */
  function kartiSigdir(n) {
    var kart = n.querySelector('.rk-nk-kart');
    var katman = n.closest('[data-rk-nk]');
    if (!kart || kart.hidden || !katman) return;
    kart.style.removeProperty('translate');
    var f = katman.getBoundingClientRect(), r = kart.getBoundingClientRect();
    var dx = Math.max(f.left + 8 - r.left, Math.min(0, f.right - 8 - r.right));
    var dy = Math.max(f.top + 8 - r.top, Math.min(0, f.bottom - 8 - r.bottom));
    if (dx || dy) kart.style.translate = dx + 'px ' + dy + 'px';
  }

  function kur(katman) {
    if (!katman || kurulu.has(katman)) { if (katman) konumla(katman); return; }
    kurulu.add(katman);
    var img = resmi(katman);
    if (img && !img.complete) img.addEventListener('load', function () { konumla(katman); });
    if (gozcu) gozcu.observe(katman);
    katman.addEventListener('toggle', function (e) {
      if (e.target.matches && e.target.matches('.rk-nk-nokta') && e.target.open) kartiSigdir(e.target);
    }, true);
    konumla(katman);
  }

  function katmanlar() { return document.querySelectorAll('[data-rk-nk]'); }

  /* Düzenleme kipinde özet kart açmaz (düzenleyici seçer); öbür kiplerde dışarı tıklama kartı kapatır. */
  document.addEventListener('click', function (e) {
    var t = e.target instanceof Element ? e.target : null;
    var ozet = t && t.closest('.rk-nk-nokta > summary');
    var katman = ozet && ozet.closest('[data-rk-nk]');
    if (katman && kipi(katman) === 'duzenleme') { e.preventDefault(); return; }
    katmanlar().forEach(function (k) {
      if (kipi(k) === 'duzenleme') return;
      k.querySelectorAll('.rk-nk-nokta[open]').forEach(function (n) { if (!n.contains(t)) n.open = false; });
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    katmanlar().forEach(function (k) {
      k.querySelectorAll('.rk-nk-nokta[open]').forEach(function (n) {
        n.open = false;
        var ozet = n.querySelector('summary');
        if (ozet && n.contains(document.activeElement)) ozet.focus();
      });
    });
  });

  window.addEventListener('resize', function () { katmanlar().forEach(konumla); });

  window.DM_NOKTA_KATMANI = {
    kur: kur, konumla: konumla, olcu: olcu, binde: binde, piksele: piksele, bindeye: bindeye,
    gorunenBinde: gorunenBinde, mobilMi: mobilMi
  };

  function basla() { katmanlar().forEach(kur); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
}());
