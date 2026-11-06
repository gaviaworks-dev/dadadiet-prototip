/* Ortak davranış: örtü katmanları, toast, sekme, akordeon, segment, grafik, üst menü.
   Tek yazar: lead. Hem public/üye hem panelde yüklenir; panelde sekme ve açılırı panel.js sürer. */
(function () {
  'use strict';
  const DD = (window.DD = window.DD || {});
  const panelKipi = document.body.classList.contains('yetkili');

  /* Video hero: kaynak sayfa açıldıktan sonra bağlanır; azaltılmış hareket ve veri tasarrufunda poster kalır */
  const hareketAzalt = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const veriTasarrufu = navigator.connection && navigator.connection.saveData;
  if (!hareketAzalt && !veriTasarrufu) document.querySelectorAll('video source[data-src]').forEach((k) => {
    k.src = k.dataset.src;
    const v = k.parentElement;
    if (!k.nextElementSibling) { v.load(); v.play().catch(() => { /* otomatik oynatma engellenirse poster kalır */ }); }
  });

  /* Toast */
  DD.toast = function (mesaj, tip) {
    let kap = document.querySelector('.dd-toast-kap');
    if (!kap) { kap = document.createElement('div'); kap.className = 'dd-toast-kap'; kap.setAttribute('role', 'status'); document.body.appendChild(kap); }
    const t = document.createElement('div');
    t.className = 'dd-toast' + (tip ? ' ' + tip : '');
    const ikon = tip === 'hata' ? 'fa-circle-xmark' : tip === 'uyari' ? 'fa-triangle-exclamation' : 'fa-circle-check';
    t.innerHTML = '<i class="fa-solid ' + ikon + '" aria-hidden="true"></i><span></span>';
    t.querySelector('span').textContent = mesaj;
    kap.appendChild(t);
    setTimeout(() => t.remove(), 3600);
  };

  /* Örtü katmanları: [data-ac="#id"] açar, [data-kapat] / Esc / örtü kapatır */
  let sonOdak = null;
  DD.ac = function (sec) {
    const o = typeof sec === 'string' ? document.querySelector(sec) : sec;
    if (!o) return;
    sonOdak = document.activeElement;
    o.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    const hedef = o.querySelector('input,select,textarea,button');
    if (hedef) hedef.focus();
    o.dispatchEvent(new CustomEvent('dd:acildi', { bubbles: true }));
  };
  DD.kapat = function (o) {
    if (!o) return;
    o.hidden = true;
    if (!document.querySelector('.yan-panel-ortu:not([hidden]),.sheet-ortu:not([hidden]),.modal-ortu:not([hidden])')) document.documentElement.style.overflow = '';
    if (sonOdak && sonOdak.focus) sonOdak.focus();
  };
  const ORTU = '.yan-panel-ortu,.sheet-ortu,.modal-ortu';
  document.addEventListener('click', function (e) {
    const ac = e.target.closest('[data-ac]');
    if (ac) { e.preventDefault(); DD.ac(ac.getAttribute('data-ac')); return; }
    const kapat = e.target.closest('[data-kapat]');
    if (kapat) { DD.kapat(kapat.closest(ORTU)); return; }
    if (e.target.matches(ORTU)) DD.kapat(e.target);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll(ORTU).forEach((o) => { if (!o.hidden) DD.kapat(o); });
  });

  /* Segment ve tekli seçim: [data-tek-secim] içinde aria-pressed tek olur */
  document.addEventListener('click', function (e) {
    const d = e.target.closest('.segment button,[data-tek-secim] > button');
    if (!d) return;
    const kap = d.parentElement;
    kap.querySelectorAll(':scope > button').forEach((b) => b.setAttribute('aria-pressed', String(b === d)));
    kap.dispatchEvent(new CustomEvent('dd:secim', { bubbles: true, detail: { deger: d.dataset.deger } }));
  });
  /* Çoklu seçim: [data-coklu-secim] içinde aria-pressed değişir */
  document.addEventListener('click', function (e) {
    const d = e.target.closest('[data-coklu-secim] > button');
    if (!d) return;
    d.setAttribute('aria-pressed', String(d.getAttribute('aria-pressed') !== 'true'));
    d.parentElement.dispatchEvent(new CustomEvent('dd:secim', { bubbles: true }));
  });
  /* Süzgeç çipleri: .cipler[data-suzgec] içinde .aktif tek olur */
  document.addEventListener('click', function (e) {
    const c = e.target.closest('.cipler[data-suzgec] .cip');
    if (!c) return;
    c.parentElement.querySelectorAll('.cip').forEach((x) => x.classList.toggle('aktif', x === c));
    c.parentElement.dispatchEvent(new CustomEvent('dd:suzgec', { bubbles: true, detail: { deger: c.dataset.deger } }));
  });

  /* Adet ayarlayıcı */
  document.addEventListener('click', function (e) {
    const b = e.target.closest('.adet button');
    if (!b) return;
    const g = b.parentElement.querySelector('input');
    if (!g) return;
    const adim = parseFloat(g.step) || 1, en = g.min === '' ? 0 : parseFloat(g.min);
    g.value = Math.max(en, (parseFloat(g.value) || 0) + (b.dataset.yon === 'azalt' ? -adim : adim));
    g.dispatchEvent(new Event('input', { bubbles: true }));
  });

  /* Grafik: DD.grafik.cizgi(el, {etiketler, seriler:[{ad,degerler,renk}], hedef}) */
  DD.grafik = {
    cizgi(el, o) {
      const G = 640, Y = 240, sol = 40, sag = 12, ust = 12, alt = 28;
      const hepsi = o.seriler.flatMap((s) => s.degerler).concat(o.hedef != null ? [o.hedef] : []);
      /* Eksen okunaklı olsun diye sınırlar yuvarlak adıma oturur (1, 2, 2.5, 5 x 10^n) */
      const hamEn = Math.min(...hepsi), hamBu = Math.max(...hepsi);
      const kaba = (hamBu - hamEn || 1) / 4, kuvvet = Math.pow(10, Math.floor(Math.log10(kaba)));
      const adim = [1, 2, 2.5, 5, 10].map((c) => c * kuvvet).find((c) => c >= kaba);
      const en = Math.floor(hamEn / adim) * adim, bu = Math.max(Math.ceil(hamBu / adim) * adim, en + adim);
      const cizgi = Math.round((bu - en) / adim);
      const x = (i) => sol + (i * (G - sol - sag)) / Math.max(1, o.etiketler.length - 1);
      const y = (v) => ust + ((bu - v) * (Y - ust - alt)) / (bu - en);
      let s = '<svg class="grafik" viewBox="0 0 ' + G + ' ' + Y + '" role="img" aria-label="' + (o.baslik || 'Grafik') + '">';
      for (let i = 0; i <= cizgi; i++) { const v = en + adim * i; s += '<line class="kilavuz" x1="' + sol + '" x2="' + (G - sag) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="eksen" x="' + (sol - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v.toLocaleString('tr-TR', { maximumFractionDigits: o.basamak ?? 1 }) + '</text>'; }
      o.etiketler.forEach((t, i) => { s += '<text class="eksen" x="' + x(i) + '" y="' + (Y - 8) + '" text-anchor="middle">' + t + '</text>'; });
      if (o.hedef != null) s += '<line class="hedef" x1="' + sol + '" x2="' + (G - sag) + '" y1="' + y(o.hedef) + '" y2="' + y(o.hedef) + '"/>';
      o.seriler.forEach((sr, k) => {
        const renk = sr.renk || 'var(--grafik-' + (k + 1) + ')';
        s += '<polyline class="seri" stroke="' + renk + '" points="' + sr.degerler.map((v, i) => x(i) + ',' + y(v)).join(' ') + '"/>';
        sr.degerler.forEach((v, i) => { s += '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="3.5" fill="' + renk + '"><title>' + o.etiketler[i] + ': ' + v + '</title></circle>'; });
      });
      el.innerHTML = s + '</svg>';
    },
  };

  if (panelKipi) return; /* Aşağısı yalnız public/üye: panelde panel.js sürer */

  /* Sekmeler: .sekmeler[role=tablist] */
  document.addEventListener('click', function (e) {
    const t = e.target.closest('.sekmeler[role=tablist] .sekme');
    if (!t) return;
    sekmeSec(t);
  });
  function sekmeSec(t) {
    const ray = t.closest('.sekmeler');
    ray.querySelectorAll('.sekme').forEach((s) => {
      const secili = s === t;
      s.classList.toggle('aktif', secili);
      s.setAttribute('aria-selected', String(secili));
      s.tabIndex = secili ? 0 : -1;
      const p = s.getAttribute('aria-controls') && document.getElementById(s.getAttribute('aria-controls'));
      if (p) p.hidden = !secili;
    });
    ray.dispatchEvent(new CustomEvent('dd:sekme', { bubbles: true, detail: { id: t.id } }));
  }
  document.addEventListener('keydown', function (e) {
    const t = e.target.closest && e.target.closest('.sekmeler[role=tablist] .sekme');
    if (!t || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    const l = [...t.closest('.sekmeler').querySelectorAll('.sekme')];
    const i = l.indexOf(t);
    const n = e.key === 'Home' ? l[0] : e.key === 'End' ? l[l.length - 1] : l[(i + (e.key === 'ArrowRight' ? 1 : -1) + l.length) % l.length];
    e.preventDefault(); sekmeSec(n); n.focus();
  });

  /* Akordeon: grupta tek açık */
  document.addEventListener('click', function (e) {
    const b = e.target.closest('.akordeon-bas');
    if (!b) return;
    const k = b.closest('.akordeon-kalem');
    const acilacak = !k.classList.contains('acik');
    k.closest('.akordeon').querySelectorAll('.akordeon-kalem').forEach((x) => {
      x.classList.remove('acik');
      x.querySelector('.akordeon-bas').setAttribute('aria-expanded', 'false');
      x.querySelector('.akordeon-govde').style.maxHeight = '';
    });
    if (acilacak) {
      k.classList.add('acik');
      b.setAttribute('aria-expanded', 'true');
      const g = k.querySelector('.akordeon-govde');
      g.style.maxHeight = g.scrollHeight + 'px';
    }
  });

  /* Üst kabuk: kaydırma, mobil çekmece, başa dön */
  const header = document.querySelector('[data-site-header]');
  if (header) {
    const hero = header.hasAttribute('data-hero');
    const guncelle = () => {
      const tepede = window.scrollY < 8;
      header.classList.toggle('scrolled', !tepede);
      if (hero) { header.classList.toggle('at-top', tepede); header.classList.toggle('tepede', tepede); }
    };
    addEventListener('scroll', guncelle, { passive: true });
    guncelle();
  }
  const drawer = document.getElementById('drawer'), ort = document.getElementById('drawerOverlay');
  const cekmece = (ac) => {
    if (!drawer) return;
    drawer.classList.toggle('open', ac); if (ort) ort.classList.toggle('open', ac);
    drawer.setAttribute('aria-hidden', String(!ac)); drawer.inert = !ac;
    document.documentElement.style.overflow = ac ? 'hidden' : '';
  };
  document.addEventListener('click', function (e) {
    if (e.target.closest('#hamburger')) cekmece(true);
    if (e.target.closest('#drawerClose') || e.target.id === 'drawerOverlay') cekmece(false);
    const tg = e.target.closest('.d-toggle');
    if (tg) { const it = tg.closest('.d-item'); const ac = !it.classList.contains('open'); it.classList.toggle('open', ac); tg.setAttribute('aria-expanded', String(ac)); }
  });
})();
