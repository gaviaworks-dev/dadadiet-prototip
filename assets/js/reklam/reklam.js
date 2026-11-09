/* kaynak: DadaDiet public/reklam/reklam.js (DadaGastro@905288b7b2) · uyarlama (prototip): sayım, beacon ve POST çağrıları çıkarıldı; menü hücrelerinin mobil taşınması prototip çekmecesine göre. Gerisi birebir. */
// Ortak ankraj yaşam döngüsü: masaüstünde karta bağlı, mobilde kaydırma kilitli.
const rkMobilPencereKilitleri = new Set();
function rkTakipliPencere(tetikleyici, kapat, yerlestir) {
  const mobil = window.matchMedia('(max-width:640px)').matches;
  const baslangic = window.scrollY, ilkUst = tetikleyici.getBoundingClientRect().top;
  const kilit = Symbol('reklam-pencere');
  if (mobil) { rkMobilPencereKilitleri.add(kilit); document.documentElement.classList.add('rk-sheet-lock'); }
  const kaydir = () => {
    if (mobil) return;
    const r = tetikleyici.getBoundingClientRect();
    if (Math.abs(window.scrollY - baslangic) > 200 || Math.abs(r.top - ilkUst) > 200 || r.bottom <= 0 || r.top >= window.innerHeight || r.right <= 0 || r.left >= window.innerWidth) kapat();
    else yerlestir();
  };
  window.addEventListener('scroll', kaydir, {passive:true, capture:true});
  window.addEventListener('resize', kapat);
  return () => {
    window.removeEventListener('scroll', kaydir, true); window.removeEventListener('resize', kapat);
    if (mobil) { rkMobilPencereKilitleri.delete(kilit); if (!rkMobilPencereKilitleri.size) document.documentElement.classList.remove('rk-sheet-lock'); }
  };
}

/* Prototip uyarlaması (dadadiet-prototip, 9 Kasım): canlıdaki gösterim sayımı (IntersectionObserver + sendBeacon/fetch POST)
   çıkarıldı; prototipte gösterim ya da tıklama sayılmaz, hiçbir istek gönderilmez. Aynı blokta kalan menü hücrelerinin mobil
   çekmeceye taşınması prototip çekmecesine göre yazıldı: HD-MEGA ve seçki hücresi ilk mega menünün çekmece alt listesine,
   HD-WEEK aynı listenin sonuna, HD-DOLAP-SPON "Diyetisyenler" satırının yerine (canlı kural). */
(function () {
  'use strict';
  function basla() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var mega = document.querySelector('.nav-item.has-mega');
    var ad = mega && mega.querySelector(':scope > a') ? mega.querySelector(':scope > a').textContent.trim() : '';
    var cekmece = [].slice.call(document.querySelectorAll('.d-item.d-has-sub')).find(function (d) { return d.querySelector('.d-link') && d.querySelector('.d-link').textContent.trim() === ad; });
    var altListe = cekmece && cekmece.querySelector('.d-sub');
    var tasinan = ['HD-MEGA', 'menu.secki-hucresi', 'HD-WEEK'].map(function (k) { return document.querySelector('[data-rk-slot="' + k + '"]'); }).filter(Boolean);
    var isaret = tasinan.map(function (n) { var c = document.createComment('rk ' + n.dataset.rkSlot); n.after(c); return c; });
    var dolap = document.querySelector('[data-rk-slot="HD-DOLAP-SPON"]');
    var dolapMobil = document.querySelector('.d-item > .d-row > .d-link[href$="diyetisyenler/"]');
    var dolapIsaret = dolap ? document.createComment('rk HD-DOLAP-SPON') : null;
    if (dolap) dolap.after(dolapIsaret);
    function tasi() {
      var mobil = getComputedStyle(nav).display === 'none';
      tasinan.forEach(function (n, i) { if (mobil && altListe) altListe.append(n); else isaret[i].before(n); });
      if (dolap && dolapMobil) { var satir = dolapMobil.closest('.d-row'); satir.hidden = mobil; if (mobil) satir.after(dolap); else dolapIsaret.before(dolap); }
    }
    tasi(); window.addEventListener('resize', tasi);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();

// Foto-etiketler iki yüzeyde aynı tek-açık-kart yaşam döngüsünü kullanır.
(function () {
  var etiketler = [];
  function hoverKapat(etiket) {
    clearTimeout(etiket.hoverZamani);
    etiket.nokta.classList.remove('rk-hover');
  }
  function hoverleriKapat() { etiketler.forEach(hoverKapat); }
  document.querySelectorAll('.rk-foto-nokta').forEach(function (nokta) {
    var kart = nokta.querySelector('.rk-foto-kart'), dugme = nokta.querySelector('summary');
    var foto = nokta.closest('.rk-dolap-sahne, .rd-stage'), portal = null, takip = null;
    if (!kart || !foto || !dugme) return;
    var etiket = {nokta:nokta, kart:kart, dugme:dugme, foto:foto};
    etiketler.push(etiket);
    function yerlestir() {
      if (portal && nokta.open && matchMedia('(max-width:640px)').matches) return;
      if (portal) { portal.close(); nokta.append(kart); portal.remove(); portal = null; kart.querySelector('.rk-foto-kapat')?.remove(); }
      kart.style.removeProperty('translate');
      var f = foto.getBoundingClientRect(), n = dugme.getBoundingClientRect();
      nokta.classList.toggle('rk-sola', n.left - f.left > f.width / 2);
      dugme.setAttribute('aria-expanded', String(nokta.open));
      if (!nokta.open) return;
      if (matchMedia('(max-width:640px)').matches) {
        portal = document.createElement('dialog'); portal.className = 'rk-foto-mobil';
        portal.setAttribute('aria-label', dugme.getAttribute('aria-label'));
        document.body.append(portal); portal.append(kart);
        var kapatDugme = document.createElement('button'); kapatDugme.type='button'; kapatDugme.className='rk-foto-kapat'; kapatDugme.setAttribute('aria-label','Ürün kartını kapat'); kapatDugme.textContent='×'; kart.querySelector('.rk-foto-baslik').append(kapatDugme);
        kapatDugme.addEventListener('click',function(){etiket.kapat(true)});
        portal.addEventListener('cancel',function(e){e.preventDefault();etiket.kapat(true)});
        portal.showModal();
        var mobileCard = kart.getBoundingClientRect();
        kart.style.setProperty('--rk-caret-x', Math.max(12, Math.min(mobileCard.width - 28, n.left + n.width / 2 - mobileCard.left - 8)) + 'px');
      } else {
        nokta.classList.toggle('rk-yukari', f.bottom - n.bottom < kart.getBoundingClientRect().height + 24);
        var r = kart.getBoundingClientRect();
        var dx = Math.max(f.left + 8 - r.left, Math.min(0, f.right - 8 - r.right));
        var dy = Math.max(f.top + 8 - r.top, Math.min(0, f.bottom - 8 - r.bottom));
        kart.style.translate = dx + 'px ' + dy + 'px';
        var placed = kart.getBoundingClientRect();
        kart.style.setProperty('--rk-caret-x', Math.max(12, Math.min(placed.width - 28, n.left + n.width / 2 - placed.left - 8)) + 'px');
      }
    }
    etiket.kapat = function (odak) {
      if(takip){takip();takip=null;}
      hoverleriKapat(); nokta.open = false; nokta.classList.add('rk-dinleniyor'); yerlestir();
      if (odak) dugme.focus({preventScroll:true});
    };
    etiket.ac = function () {
      hoverleriKapat();
      etiketler.forEach(function (diger) { if (diger !== etiket && diger.nokta.open) diger.kapat(false); });
      nokta.classList.remove('rk-dinleniyor'); nokta.open = true; yerlestir();
      takip=rkTakipliPencere(dugme,function(){etiket.kapat(false)},yerlestir);
    };
    dugme.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (nokta.open) etiket.kapat(false); else etiket.ac();
    });
    // Summary + görünmez bağ köprüsü + logo tek kesintisiz pointer alanıdır.
    dugme.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !matchMedia('(hover:hover) and (pointer:fine)').matches || acik()) return;
      etiketler.forEach(function (diger) { if (diger !== etiket) hoverKapat(diger); });
      clearTimeout(etiket.hoverZamani);
      nokta.classList.remove('rk-dinleniyor'); nokta.classList.add('rk-hover');
    });
    dugme.addEventListener('pointerleave', function () {
      clearTimeout(etiket.hoverZamani);
      etiket.hoverZamani = setTimeout(function () { hoverKapat(etiket); }, 140);
    });
    // Kartın bağlantısı normal takip URL'sine gider; kapak lightbox'ına tıklama aktarılmaz.
    kart.addEventListener('click', function (e) { e.stopPropagation(); });
    nokta.addEventListener('toggle', yerlestir);
    yerlestir();
  });
  var yutulanTik = false, temizle;
  function acik() { return etiketler.find(function (e) { return e.nokta.open; }); }
  function disarida(e, aktif) {
    return !aktif.kart.contains(e.target) && !etiketler.some(function (t) { return t.dugme.contains(e.target); });
  }
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
  window.addEventListener('resize', function () { etiketler.forEach(function (e) { e.kapat(false); }); });
  var gozcu = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { if (!entry.isIntersecting) etiketler.filter(function (e) { return e.foto === entry.target && e.nokta.open; }).forEach(function (e) { e.kapat(false); }); });
  });
  new Set(etiketler.map(function (e) { return e.foto; })).forEach(function (f) { gozcu.observe(f); });
})();

// Prototip uyarlaması: canlıda kapatma tercihi sunucu oturumuna POST ile yazılır; prototipte yalnız bu sekmenin oturumunda (sessionStorage).
document.querySelectorAll('[data-rk-kapatilabilir]').forEach(function (slot) {
  var anahtar = 'dd-rk-kapali-' + slot.dataset.rkSlot;
  try { if (sessionStorage.getItem(anahtar)) slot.hidden = true; } catch (e) {}
  slot.querySelector('[data-rk-kapat]').addEventListener('click', function () {
    slot.hidden = true;
    try { sessionStorage.setItem(anahtar, '1'); } catch (e) {}
  });
});

// Aynı kaynaktaki kapak fotoğrafının, etiket çevresindeki gerçek parlaklığını örnekle.
// Resim yüklenemezse okunaklı beyaz baloncuk ve ortak koyu filtre korunur.
document.querySelectorAll('.rd-stage:has(.rk-foto-nokta)').forEach(function (foto) {
  var src = getComputedStyle(foto).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
  if (!src) return;
  var img = new Image();
  img.onload = function () {
    function olc() {
      var f = foto.getBoundingClientRect();
      if (!f.width || !f.height) return;
      var canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
      var ctx = canvas.getContext('2d', {willReadFrequently:true});
      var scale = Math.max(f.width / img.naturalWidth, f.height / img.naturalHeight);
      var cropX = (img.naturalWidth * scale - f.width) / 2, cropY = (img.naturalHeight * scale - f.height) / 2;
      foto.querySelectorAll('.rk-foto-nokta').forEach(function (n) {
        var r = n.querySelector('.rk-nokta-marka').getBoundingClientRect();
        var x = (r.x + r.width / 2 - f.x + cropX) / scale, y = (r.y + r.height / 2 - f.y + cropY) / scale;
        try {
          ctx.drawImage(img, Math.max(0,x-24/scale), Math.max(0,y-24/scale), 48/scale, 48/scale, 0,0,64,64);
          var data = ctx.getImageData(0,0,64,64).data, total = 0;
          for (var i=0;i<data.length;i+=4) total += .2126*data[i]+.7152*data[i+1]+.0722*data[i+2];
          var brightness = total / (data.length/4);
          n.dataset.rkParlaklik = brightness.toFixed(1);
          n.classList.toggle('rk-hale-acik', brightness < 128);
          n.classList.toggle('rk-hale-koyu', brightness >= 128);
        } catch (_) { n.classList.add('rk-hale-koyu'); }
      });
    }
    olc(); window.addEventListener('resize', olc);
  };
  img.src = src[1];
});

// Rozet zemini sahnenin üst köşesindeki parlaklığa göre seçilir; iki seçenek de AA.
document.querySelectorAll('.rk-hafta').forEach(function (kart) {
  var img = kart.querySelector('.rk-hafta-zemin');
  if (!img) return;
  function rozet() {
    try {
      var c=document.createElement('canvas'); c.width=16; c.height=16;
      var ctx=c.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(img,0,0,img.naturalWidth*.6,img.naturalHeight*.25,0,0,16,16);
      var px=ctx.getImageData(0,0,16,16).data,sum=0;
      for(var i=0;i<px.length;i+=4) sum+=.2126*px[i]+.7152*px[i+1]+.0722*px[i+2];
      kart.classList.toggle('rk-rozet-acik',sum/(px.length/4)<128);
    } catch (_) { /* Siyah %70 varsayılanı en açık sahnede de AA sağlar. */ }
  }
  if(img.complete && img.naturalWidth) rozet(); else img.addEventListener('load',rozet,{once:true});
});

// Kanon rayın otomatik akışına yalnız sponsorlu rayda duraklama adaptörü.
// İlk kart kullanıcı kaydırmadan kaybolmaz; elle sürükleme ve yatay kaydırma serbest.
document.querySelectorAll('.mz-grid:has(> .rk-dolap-kart)').forEach(function (ray) {
  Object.defineProperty(ray,'_hold',{configurable:true,get:function(){return true;},set:function(){}});
  ray.scrollLeft=0;
  ray.classList.add('at-start');
});

// Rectangle bütçesi: sol içeriğin gerçek son satırını geçecek reklam gösterilmez.
// Grid stretch yüksekliği ölçülmez; yorum alanının doğal alt kenarı esas alınır.
(function () {
  const left=document.querySelector('.rd-cols > .rd-main'), right=document.querySelector('.rd-cols > .rd-aside');
  if(!left || !right) return;
  const cards=[...right.querySelectorAll('.rk-rectangle')].filter(c=>c.dataset.rkSlot!=='TD-PORS');
  if(!cards.length) return;
  let frame;
  function fit(){
    const extra=right.querySelector('[data-rk-slot="TD-PORS"]');
    function apply(count,showExtra){cards.forEach((c,i)=>{c.hidden=i>=count;const w=c.closest('.rk-sar');if(w)w.hidden=c.hidden;});if(extra)extra.hidden=!showExtra;}
    apply(cards.length,true);
    if(matchMedia('(max-width:900px)').matches) return;
    const bottom=Math.max(...[...left.children].map(n=>n.getBoundingClientRect().bottom));
    function end(){return Math.max(...[...right.children].map(n=>n.getBoundingClientRect().bottom));}
    // Whole cards keep their anatomy. The optional portion ad also shares the height budget;
    // ingredient rows, quantities, partner action and real chef are never hidden.
    let best=null;
    for(const showExtra of [true]) for(let count=cards.length;count>=0;count--){
      apply(count,showExtra);const delta=end()-bottom;
      if(delta>120)continue;
      if(!best || Math.abs(delta)<Math.abs(best.delta))best={count,showExtra,delta};
    }
    if(best)apply(best.count,best.showExtra);else apply(0,true);
    right.dataset.rkKolonFarki=Math.round(end()-bottom);
  }
  function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(fit);}
  new ResizeObserver(schedule).observe(left);
  window.addEventListener('resize',schedule);
  document.fonts.ready.then(schedule);
  right.querySelectorAll('img').forEach(n=>n.addEventListener('load',schedule));
  fit();
})();

// Sipariş kanalları: bir açık dialog, yerel odak döndürme, mobil alt sayfa.
(function(){
 let active=null;
 document.querySelectorAll('[data-rk-siparis-ac]').forEach(button=>{
  const dialog=document.getElementById(button.getAttribute('aria-controls'));if(!dialog)return;let takip=null;
  const place=()=>{if(innerWidth<=640)return;const r=button.getBoundingClientRect();dialog.style.left=Math.max(16,Math.min(innerWidth-dialog.offsetWidth-16,r.right-dialog.offsetWidth))+'px';dialog.style.top=Math.max(16,Math.min(innerHeight-dialog.offsetHeight-16,r.bottom+8))+'px'};
  const close=()=>{if(takip){takip();takip=null}dialog.close()};
  button.addEventListener('click',()=>{if(dialog.open){close();return}if(active)active.close();dialog.showModal();active=dialog;button.setAttribute('aria-expanded','true');place();takip=rkTakipliPencere(button,close,place)});
  dialog.querySelector('[data-rk-siparis-kapat]').addEventListener('click',close);
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}});
  dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
  dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)){e.preventDefault();e.stopPropagation();close()}});
  dialog.addEventListener('close',()=>{if(takip){takip();takip=null}button.setAttribute('aria-expanded','false');if(active===dialog)active=null;button.focus({preventScroll:true})});
  window.addEventListener('resize',()=>{if(dialog.open)place()});
 });
})();

// Madde 118 (Beyar 2026-09-27): ansiklopedide sponsorlu kategorinin başlığındaki "<marka> sponsorluğunda" satırı yalnız o
// kategori açıkken görünür; başka kategoriye, "Tüm kategoriler"e ya da aramaya geçince gizlenir. Donör betiği (ansiklopedi.js)
// değişmez: katmanların `hidden` / `is-hidden` değişimi izlenir.
(function () {
  function basla() {
    var satir = document.querySelector('[data-rk-kat-sponsor]');
    var drill = document.getElementById('ansDrill');
    if (!satir || !drill) return;
    var bolum = satir.closest('.ans-catsec');
    var ara = document.getElementById('ansSearch');
    function guncelle() {
      var acik = !drill.hidden && !!bolum && !bolum.classList.contains('is-hidden') && !(ara && ara.value.trim());
      if (satir.hidden === acik) satir.hidden = !acik;
    }
    new MutationObserver(guncelle).observe(drill, { attributes: true, subtree: true, attributeFilter: ['hidden', 'class'] });
    if (ara) ara.addEventListener('input', guncelle);
    guncelle();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();

// Madde 119 (Beyar 2026-09-27): /dolapta-ne-var akordeonundaki sponsor kartı organik malzemesine eşliyse (`data-rk-ing`) dış siteye
// gitmez, normal malzeme gibi davranır: tıklama aynı akordeondaki organik `.mz[data-ing]` çipine iletilir (donör betiği seçimi,
// seçilenler şeridini ve sayacı yalnız organik çipten yürütür — ad malzemenin adıdır, çift sayım olmaz). Kartın seçili görünümü
// organik çipin `.sel` durumundan aynalanır (şeritteki X ile kaldırma da dahil). Kart `.sel` almaz: donörün sayacı `.mz.sel` sayar.
(function () {
  function basla() {
    document.querySelectorAll('.rk-dolap-kart[data-rk-ing]').forEach(function (kart) {
      var cip = kart.parentElement && kart.parentElement.querySelector('.mz[data-ing="' + kart.getAttribute('data-rk-ing') + '"]');
      if (!cip) return;
      var aynala = function () { var secili = cip.classList.contains('sel'); kart.classList.toggle('rk-secili', secili); kart.setAttribute('aria-pressed', secili ? 'true' : 'false'); };
      new MutationObserver(aynala).observe(cip, { attributes: true, attributeFilter: ['class'] });
      kart.addEventListener('click', function () { cip.click(); });
      aynala();
    });
    // Lead kararı LK9 (duzelt 2026-09-27): eşli kart malzemenin tek görünen kartıdır; organik ikiz `hidden` + `data-rk-ikiz` ile
    // görünmez durum tutucudur (sayfa basar). Donörün canlı malzeme süzgeci her `.mz`yi KENDİ adıyla süzer: kartın adı ürün adıdır
    // ("Banvit Piliç Göğüs"), malzemenin adı ("Tavuk Göğsü") yalnız ikizde. Süzgeç koştuktan sonra (belge düzeyinde, kabarcıkta)
    // kart, ikizi eşleşiyorsa da görünür — malzeme aramada kaybolmaz.
    var ara = document.getElementById('panSearch');
    if (ara) document.addEventListener('input', function (e) {
      if (e.target !== ara) return;
      document.querySelectorAll('#paneHave .rk-dolap-kart[data-rk-ing]').forEach(function (kart) {
        var ikiz = kart.parentElement.querySelector('.mz[data-rk-ikiz][data-ing="' + kart.getAttribute('data-rk-ing') + '"]');
        if (ikiz && ikiz.style.display !== 'none') kart.style.display = '';
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();

/* %30 YOĞUNLUK (Faz 6b, E1.2 Better Ads): mobilde (≤ 767 px) görünür reklam birimlerinin yükseklik toplamı içeriğin
   (`main`) `data-rk-yogunluk` yüzdesini geçerse sayfanın sonundan başa doğru birim gizlenir; premium birimler
   (`data-rk-korunan`: noktalar, malzeme satırı, "Sipariş et") ve pop-up gizlenmez. Gizlenen birim görünmediği için
   sayılmaz; gerçek sayı = min(üyelik, sayfa kuralı, %30). */
(function () {
  'use strict';
  var betik = document.querySelector('script[data-rk-yogunluk]');
  var sinir = betik && Number(betik.getAttribute('data-rk-yogunluk'));
  if (!sinir || !window.matchMedia) return;
  var korunan = (betik.getAttribute('data-rk-korunan') || '').split(',');
  function gorunur(n) {
    return n.checkVisibility ? n.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : n.offsetHeight > 0;
  }
  function sinirla() {
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    var icerik = document.querySelector('main') || document.body;
    var kutular = [].slice.call(document.querySelectorAll('[data-rk-slot]')).filter(function (n) {
      // Diet (Beyar 28 Eki, c): çekmecedeki birimler (menü satırı, seçkiler, Haftanın Sponsoru, koridor kartı) sayfa içeriği değil —
      // kapalı çekmece ekran dışında ama "görünür" sayılıyordu ve 390'da bütçeyi doldurup koridoru gizliyordu.
      return !n.parentElement.closest('[data-rk-slot]') && !n.closest('[data-rk-bicim="popup"]') && !n.closest('#drawer') && gorunur(n);
    });
    var yukseklik = function (n) { return n.getBoundingClientRect().height; };
    var toplam = kutular.reduce(function (t, n) { return t + yukseklik(n); }, 0);
    for (var i = kutular.length - 1; i >= 0 && toplam > icerik.scrollHeight * sinir / 100; i--) {
      var n = kutular[i];
      if (korunan.indexOf(n.getAttribute('data-rk-slot').split(':')[0]) !== -1) continue;
      toplam -= yukseklik(n);
      (n.closest('.rk-liste-sira') || n).setAttribute('data-rk-yogunluk-gizli', '');
      // Bölümler arası sarmalayıcıda (`.rk-sar`) görünür birim kalmadıysa sarmalayıcı da gizlenir: yoksa dolgusu boş şerit
      // olarak kalıyordu (5 Eki 2026, ana sayfa 390 px sayfa sonu AS-B1: 61 px).
      var sar = n.closest('.rk-sar');
      if (sar && ![].some.call(sar.querySelectorAll('[data-rk-slot]'), gorunur)) sar.setAttribute('data-rk-yogunluk-gizli', '');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sinirla); else sinirla();
  window.addEventListener('load', sinirla);
})();

/* Tam sıra: ızgaranın organik kartları sıraları tam dolduruyorsa sponsor kartlar son sırayı yarım bırakmaz. Sütun sayısı kap
   genişliğinden gelir (auto-fill); artakalan kadar sondaki sponsor kart o genişlikte gizlenir, görünmeyen kart gösterim saymaz.
   Organik kart gizlenmez; organik sayısı sırayı zaten yarım bırakıyorsa ızgaraya dokunulmaz. Genişlik değişince yeniden hesaplanır. */
(function () {
  'use strict';
  var NITELIK = 'data-rk-tam-sira-gizli';
  function gorunur(n) {
    return n.checkVisibility ? n.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : n.offsetHeight > 0;
  }
  function duzenle() {
    [].slice.call(document.querySelectorAll('[' + NITELIK + ']')).forEach(function (n) { n.removeAttribute(NITELIK); });
    var izgaralar = [];
    [].slice.call(document.querySelectorAll('[data-rk-slot]')).forEach(function (n) {
      var kap = n.parentElement;
      if (kap && !kap.closest('[data-rk-slot]') && izgaralar.indexOf(kap) === -1) izgaralar.push(kap);
    });
    izgaralar.forEach(function (kap) {
      var cs = getComputedStyle(kap);
      if (cs.display !== 'grid' && cs.display !== 'inline-grid') return;
      var sutunlar = cs.gridTemplateColumns.split(' ').filter(function (x) { return /px$/.test(x); }).map(parseFloat);
      if (sutunlar.length < 2) return;
      var bosluk = parseFloat(cs.columnGap) || 0;
      // Yalnız tek hücrelik öğeler sayılır; tam genişlik satır (bant) kendi sırasını doldurur.
      var tek = [].slice.call(kap.children).filter(function (n) {
        return gorunur(n) && Math.round((n.getBoundingClientRect().width + bosluk) / (sutunlar[0] + bosluk)) < sutunlar.length;
      });
      var sponsor = tek.filter(function (n) { return n.hasAttribute('data-rk-slot'); });
      if (!sponsor.length || (tek.length - sponsor.length) % sutunlar.length !== 0) return;
      for (var fazla = tek.length % sutunlar.length, i = sponsor.length - 1; fazla > 0 && i >= 0; fazla--, i--) {
        sponsor[i].setAttribute(NITELIK, '');
      }
    });
  }
  var bekleyen = 0;
  function zamanla() { cancelAnimationFrame(bekleyen); bekleyen = requestAnimationFrame(duzenle); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', duzenle); else duzenle();
  window.addEventListener('load', duzenle);
  window.addEventListener('resize', zamanla);
})();

/* Banner dönüşü (6b Y6, BannerDonusu): `[data-rk-donus]` kabında tek birim görünür, öbürleri `hidden`. dongu: kabın en az
   yarısı ekrandayken ve sekme görünürken biriken süre `data-rk-donus-sn`e (en az 30) varınca sonraki birim; ekran dışında ve
   gizli sekmede süre birikmez. ok: "Sonraki" düğmesi bir sonrakini gösterir. Depoya ve sunucuya bir şey yazılmaz; gelen
   birimin gösterimini yukarıdaki sayım `d` kanalıyla bildirir. */
(function () {
  'use strict';
  function kur(kap) {
    var birimler = [].slice.call(kap.querySelectorAll(':scope > [data-rk-donus-birim]'));
    if (birimler.length < 2) return;
    var sira = 0;
    function goster(i) {
      birimler[sira].hidden = true;
      sira = i % birimler.length;
      birimler[sira].hidden = false;
      kap.setAttribute('data-rk-donus-sira', String(sira));
    }
    if (kap.getAttribute('data-rk-donus') === 'ok') {
      var dugme = kap.querySelector('[data-rk-donus-sonraki]');
      if (dugme) dugme.addEventListener('click', function () { goster(sira + 1); });
      return;
    }
    var sure = Math.max(30, Number(kap.getAttribute('data-rk-donus-sn')) || 30) * 1000, ekranda = false, biriken = 0;
    new IntersectionObserver(function (g) {
      ekranda = g[g.length - 1].isIntersecting && g[g.length - 1].intersectionRatio >= 0.5;
    }, { threshold: [0, 0.5, 1] }).observe(kap);
    setInterval(function () {
      if (!ekranda || document.visibilityState !== 'visible') return;
      biriken += 1000;
      if (biriken >= sure) { biriken = 0; goster(sira + 1); }
    }, 1000);
  }
  function basla() { document.querySelectorAll('[data-rk-donus]').forEach(kur); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();
/* Prototip uyarlaması: canlıdaki seçki tıklama sayımı (sendBeacon) çıkarıldı; prototipte seçki sayfası yok ve sayım yapılmaz. */
