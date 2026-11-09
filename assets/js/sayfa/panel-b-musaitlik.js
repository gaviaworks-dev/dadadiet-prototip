/* Müsaitlik: hızlı kural + 30 dakikalık ızgara. Hücre tıklamayla sırayla kapalı, online, yüz yüze olur.
   Hücre değeri '' (kapalı), 'online' ya da 'yuzyuze'. Kayıtta demo.musaitlik.haftalik türetilir:
   gün aralığı, en geniş boşluk "ara", her açık parça biçimiyle "araliklar". Takvim, randevu,
   public profil ve üye ekranları haftalik alanını okur; araliklar yeni ve ek alandır. */
(function () {
  'use strict';
  const { $, $$ } = PB;
  const BAS = 8 * 60, BIT = 21 * 60, ADIM = 30, SATIR = (BIT - BAS) / ADIM;
  const AD = { '': 'Kapalı', online: 'Online', yuzyuze: 'Yüz yüze' };
  const IKON = { '': 'fa-minus', online: 'fa-video', yuzyuze: 'fa-location-dot' };
  const dk = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const saat = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  const kopya = (x) => JSON.parse(JSON.stringify(x));
  const m = PB.nesne('musaitlik');
  let I, kayitli, kuralKayitli, sonKural;
  const gecmis = [];

  /* Kayıtlı ızgara yoksa aralıklardan kurulur; gün biçimi o gündeki randevuların çoğunluğundan gelir */
  function gunTuru(gi) {
    const say = { online: 0, yuzyuze: 0 };
    PB.liste('randevular').forEach((r) => { if ((new Date(r.tarih + 'T12:00').getDay() + 6) % 7 === gi) say[r.tur === 'online' ? 'online' : 'yuzyuze']++; });
    return say.yuzyuze > say.online ? 'yuzyuze' : 'online';
  }
  function izgaraKur() {
    /* Eski kayıt 08.00–20.00 (24 satır) idi: eksik satırlar kapalı eklenir */
    if (Array.isArray(m.izgara) && m.izgara.length === 7) return m.izgara.map((g) => Array.from({ length: SATIR }, (_, i) => g[i] || ''));
    return m.haftalik.map((g, gi) => {
      const tur = gunTuru(gi);
      return Array.from({ length: SATIR }, (_, i) => {
        const t = BAS + i * ADIM;
        if (!g.acik || t < dk(g.baslangic) || t >= dk(g.bitis)) return '';
        if (g.ara && t >= dk(g.ara[0]) && t < dk(g.ara[1])) return '';
        return tur;
      });
    });
  }

  /* ---------- Izgara ---------- */
  let odak = { g: 0, i: 2 };
  const hucreSec = (g, i) => '[data-g="' + g + '"][data-i="' + i + '"]';
  function hucre(gi, i) {
    const d = I[gi][i], degisti = d !== kayitli[gi][i];
    return '<button class="takvim-slot ' + (d || 'bos') + (degisti ? ' degisti' : '') + '" type="button" role="gridcell" tabindex="' + (odak.g === gi && odak.i === i ? 0 : -1) + '" data-g="' + gi + '" data-i="' + i + '" aria-label="' + PB.GUNLER[gi] + ' ' + DD.bicim.saat(saat(BAS + i * ADIM)) + ', ' + AD[d] + (degisti ? ', kaydedilmedi' : '') + '"><i class="fa-solid ' + IKON[d] + '" aria-hidden="true"></i></button>';
  }
  const gunSaat = (gi) => I[gi].filter(Boolean).length / 2;
  function gunBas(gi) {
    const s = gunSaat(gi);
    return '<button type="button" class="gun-menu-dugme" data-gun-menu="' + gi + '" aria-haspopup="menu" aria-expanded="false" aria-controls="gunMenu" aria-label="' + PB.GUNLER[gi] + ', ' + (s ? PB.sayi(s, 1) + ' saat açık' : 'kapalı') + ', gün menüsü"><span>' + PB.GUN_KISA[gi] + '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></span><small>' + (s ? PB.sayi(s, 1) + ' sa' : 'Kapalı') + '</small></button>';
  }
  function ciz() {
    let h = '<div class="takvim-kose" role="columnheader">Saat</div>';
    for (let gi = 0; gi < 7; gi++) h += '<div class="takvim-gun-bas' + (gunSaat(gi) ? '' : ' kapali') + '" role="columnheader" data-gun-bas="' + gi + '">' + gunBas(gi) + '</div>';
    for (let i = 0; i < SATIR; i++) {
      h += '<div class="takvim-saat" role="rowheader">' + (i % 2 ? '' : DD.bicim.saat(saat(BAS + i * ADIM))) + '</div>';
      for (let gi = 0; gi < 7; gi++) h += '<div class="takvim-hucre">' + hucre(gi, i) + '</div>';
    }
    $('#musaitIzgara').innerHTML = h;
    ozet();
  }
  function hucreTazele(gi, i) {
    const e = $(hucreSec(gi, i));
    if (e) e.outerHTML = hucre(gi, i);
  }
  function gunBasTazele(gi) {
    const k = $('[data-gun-bas="' + gi + '"]');
    k.classList.toggle('kapali', !gunSaat(gi));
    k.innerHTML = gunBas(gi);
  }
  function hucreYaz(gi, i, d) {
    if (I[gi][i] === d) return false;
    I[gi][i] = d;
    hucreTazele(gi, i);
    gunBasTazele(gi);
    return true;
  }

  /* ---------- Geçmiş ve sayaç ---------- */
  const kurallar = () => ({ on: $('#slotOnline').value, yz: $('#slotYuz').value, tp: $('#tampon').value, onay: $('#onayKural').value, ko: $('#kabulOnline').checked, ky: $('#kabulYuz').checked });
  const KURAL_ID = { on: 'slotOnline', yz: 'slotYuz', tp: 'tampon', onay: 'onayKural', ko: 'kabulOnline', ky: 'kabulYuz' };
  function kuralYaz(k) { Object.keys(KURAL_ID).forEach((a) => { const e = $('#' + KURAL_ID[a]); if (e.type === 'checkbox') e.checked = k[a]; else e.value = k[a]; }); }
  const anlik = () => ({ I: kopya(I), k: kurallar() });
  function adimAc() { gecmis.push(anlik()); if (gecmis.length > 60) gecmis.shift(); }
  /* Değişmeyen adım geçmişte kalmaz */
  function adimKapat() {
    const son = gecmis[gecmis.length - 1];
    if (son && JSON.stringify(son) === JSON.stringify(anlik())) gecmis.pop();
    sayac();
  }
  function degisimSay() {
    let n = 0;
    for (let g = 0; g < 7; g++) for (let i = 0; i < SATIR; i++) if (I[g][i] !== kayitli[g][i]) n++;
    const k = kurallar();
    Object.keys(k).forEach((a) => { if (k[a] !== kuralKayitli[a]) n++; });
    return n;
  }
  function sayac() {
    const n = degisimSay();
    $('#degisimSayac').textContent = n ? PB.sayi(n) + ' değişiklik' : 'Değişiklik yok';
    $('#musaitNot').textContent = n ? 'Kaydedilmedi' : (m.son_kayit ? 'Kaydedildi · ' + PB.tarihSaat(m.son_kayit) : 'Kaydedilmiş düzen');
    $('[data-musait="geri"]').disabled = !gecmis.length;
    $('[data-musait="hepsini-geri"]').disabled = !n;
    ozet();
  }
  function geriAl() {
    const s = gecmis.pop();
    if (!s) return;
    I = s.I; kuralYaz(s.k); sonKural = kurallar(); ciz(); sayac();
  }

  /* ---------- Özet ---------- */
  function ozet() {
    const duz = I.flat();
    $('#haftaSaat').textContent = PB.sayi(duz.filter(Boolean).length / 2, 1);
    $('#haftaOnline').textContent = PB.sayi(duz.filter((x) => x === 'online').length / 2, 1);
    $('#haftaYuz').textContent = PB.sayi(duz.filter((x) => x === 'yuzyuze').length / 2, 1);
    const sOn = +$('#slotOnline').value, sYz = +$('#slotYuz').value, tp = +$('#tampon').value;
    let n = 0;
    for (let k = 0; k < 7; k++) {
      const iso = PB.gunEkle(DD.bugun, k), gi = (new Date(iso + 'T12:00').getDay() + 6) % 7;
      if ((m.kapali_tarihler || []).some((x) => x.tarih === iso)) continue;
      n += parcalar(I[gi]).reduce((t, p) => t + Math.floor(((p.bit - p.bas) * ADIM) / ((p.bicim === 'online' ? sOn : sYz) + tp)), 0);
      n -= PB.liste('randevular').filter((r) => r.tarih === iso && r.durum !== 'iptal').length;
    }
    $('#acikSeans').textContent = Math.max(0, n);
  }
  /* Ardışık aynı biçimli hücreler tek parça */
  function parcalar(g) {
    const l = [];
    g.forEach((d, i) => {
      const s = l[l.length - 1];
      if (!d) return;
      if (s && s.bicim === d && s.bit === i) s.bit = i + 1; else l.push({ bicim: d, bas: i, bit: i + 1 });
    });
    return l;
  }

  /* ---------- Kayıt ---------- */
  function aralikYaz() {
    m.haftalik = I.map((g, gi) => {
      const acik = g.map((d, i) => (d ? i : -1)).filter((i) => i >= 0);
      if (!acik.length) return { gun: PB.GUNLER[gi], acik: false, baslangic: null, bitis: null, ara: null, araliklar: [] };
      let ara = null, enGenis = 0;
      for (let k = 1; k < acik.length; k++) {
        const bos = acik[k] - acik[k - 1] - 1;
        if (bos > enGenis) { enGenis = bos; ara = [saat(BAS + (acik[k - 1] + 1) * ADIM), saat(BAS + acik[k] * ADIM)]; }
      }
      const araliklar = parcalar(g).map((p) => ({ baslangic: saat(BAS + p.bas * ADIM), bitis: saat(BAS + p.bit * ADIM), bicim: p.bicim }));
      return { gun: PB.GUNLER[gi], acik: true, baslangic: saat(BAS + acik[0] * ADIM), bitis: saat(BAS + (acik[acik.length - 1] + 1) * ADIM), ara, araliklar };
    });
    m.kapali_gunler = m.haftalik.filter((g) => !g.acik).map((g) => g.gun);
    m.izgara = kopya(I);
  }
  function kaydet() {
    aralikYaz();
    m.slot = { online: +$('#slotOnline').value, 'yüz yüze': +$('#slotYuz').value };
    m.tampon = +$('#tampon').value;
    m.onay = $('#onayKural').value;
    m.son_kayit = PB.simdi();
    const d = PB.demo().diyetisyen;
    d.online = $('#kabulOnline').checked; d.yuz_yuze = $('#kabulYuz').checked;
    PB.kaydet();
    kayitli = kopya(I); kuralKayitli = kurallar(); sonKural = kuralKayitli; gecmis.length = 0;
    ciz(); sayac();
    DD.toast('Müsaitlik kaydedildi, takvim bu saatlerle güncellendi.');
  }
  function kurallarDoldur() {
    const d = PB.demo().diyetisyen;
    $('#slotOnline').value = m.slot.online; $('#slotYuz').value = m.slot['yüz yüze'];
    $('#tampon').value = m.tampon || 0; $('#onayKural').value = m.onay || 'elle';
    $('#kabulOnline').checked = !!d.online; $('#kabulYuz').checked = !!d.yuz_yuze;
  }

  /* ---------- Hızlı kural ---------- */
  const gunSecimi = (kap) => $$('button', kap).filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => +b.dataset.gun);
  const gunCipleri = (haric) => PB.GUN_KISA.map((g, gi) => '<button class="cip" type="button" aria-pressed="false" data-gun="' + gi + '"' + (gi === haric ? ' disabled' : '') + ' aria-label="' + PB.GUNLER[gi] + '">' + g + '</button>').join('');
  function kuralSecenek() {
    const s = (a, b, sec) => { let h = ''; for (let t = a; t <= b; t += ADIM) h += '<option value="' + saat(t) + '"' + (t === sec ? ' selected' : '') + '>' + DD.bicim.saat(saat(t)) + '</option>'; return h; };
    $('#hkBas').innerHTML = s(BAS, BIT - ADIM, 9 * 60);
    $('#hkBit').innerHTML = s(BAS + ADIM, BIT, 17 * 60);
    $('#hkGunler').innerHTML = gunCipleri(-1);
    gunlerYaz([0, 1, 2, 3, 4]);
  }
  function gunlerYaz(l) {
    $$('#hkGunler button').forEach((b) => b.setAttribute('aria-pressed', String(l.includes(+b.dataset.gun))));
    kuralOzet();
  }
  const kuralBicim = () => ($('#hkBicim [aria-pressed="true"]') || {}).dataset.deger || 'online';
  function kuralOzet() {
    const l = gunSecimi($('#hkGunler')), a = dk($('#hkBas').value), b = dk($('#hkBit').value), ara = $('#hkAra').value;
    $$('[data-kisayol]').forEach((k) => { const h = k.dataset.kisayol.split(',').map(Number); k.setAttribute('aria-pressed', String(h.length === l.length && h.every((x) => l.includes(x)))); });
    if (!l.length) { $('#hkOzet').textContent = 'Önce en az bir gün seç.'; return; }
    if (b <= a) { $('#hkOzet').textContent = 'Bitiş saati başlangıçtan sonra olmalı.'; return; }
    let sure = b - a;
    if (ara) { const [x, y] = ara.split('-').map(dk); sure -= Math.max(0, Math.min(b, y) - Math.max(a, x)); }
    $('#hkOzet').textContent = PB.sayi(l.length) + ' gün × ' + PB.sayi(sure / 60, 1) + ' saat ' + AD[kuralBicim()].toLocaleLowerCase('tr') + ' yazılacak.';
  }
  function kuralUygula() {
    const l = gunSecimi($('#hkGunler')), a = dk($('#hkBas').value), b = dk($('#hkBit').value), ara = $('#hkAra').value, bicim = kuralBicim(), kalan = $('#hkKalan').checked;
    if (!l.length) { DD.toast('Önce en az bir gün seç.', 'uyari'); return; }
    if (b <= a) { DD.toast('Bitiş saati başlangıçtan sonra olmalı.', 'uyari'); $('#hkBit').focus(); return; }
    const [x, y] = ara ? ara.split('-').map(dk) : [-1, -1];
    adimAc();
    l.forEach((gi) => {
      I[gi] = I[gi].map((d, i) => {
        const t = BAS + i * ADIM;
        if (t >= a && t < b) return t >= x && t < y ? '' : bicim;
        return kalan ? '' : d;
      });
    });
    ciz(); adimKapat();
    DD.toast(l.map((g) => PB.GUN_KISA[g]).join(', ') + ': ' + DD.bicim.saat(saat(a)) + '–' + DD.bicim.saat(saat(b)) + ' ' + AD[bicim].toLocaleLowerCase('tr') + ' yazıldı. Kaydetmeyi unutma.');
  }

  /* ---------- Gün menüsü, kopyala ve yapıştır ---------- */
  const menu = $('#gunMenu');
  let menuGun = 0, pano = null;
  function menuKapat() {
    const t = $('[aria-controls="gunMenu"][aria-expanded="true"]');
    if (t) t.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }
  function menuKonum(t) {
    menuGun = +t.dataset.gunMenu;
    $('#gunMenuBas').textContent = PB.GUNLER[menuGun];
    const y = menu.querySelector('[data-musait="gun-yapistir"]');
    y.hidden = !pano || pano.gi === menuGun;
    if (pano) y.querySelector('span').textContent = PB.GUNLER[pano.gi] + ' düzenini buraya yapıştır';
    menuYerlestir(t);
    /* panel.js açar; ilk kalem odak alır */
    requestAnimationFrame(() => { if (!menu.hidden) { const k = menu.querySelector('.acilir-kalem:not([hidden])'); if (k) k.focus({ preventScroll: true }); } });
  }
  /* Menü kaydırma kabının dışında, sabit konumda: düğmeyi izler, düğme görünümden çıkarsa kapanır */
  function menuYerlestir(t) {
    const r = t.getBoundingClientRect(), en = 240;
    if (r.bottom < 0 || r.top > innerHeight) { menuKapat(); return; }
    menu.style.setProperty('top', Math.round(r.bottom + 4) + 'px');
    menu.style.setProperty('left', Math.round(Math.max(8, Math.min(r.left, innerWidth - en - 8))) + 'px');
  }
  function kopyaSeritAc(gi) {
    pano = { gi, g: I[gi].slice() };
    $('#kopyaKaynak').textContent = PB.GUNLER[gi];
    $('#kopyaGunler').innerHTML = gunCipleri(gi) + '<button class="cip" type="button" data-kopya-kisayol aria-pressed="false">Hafta içi</button>';
    $('#kopyaSerit').hidden = false;
    $('#kopyaGunler button').focus();
  }
  function yapistir(l) {
    if (!pano || !l.length) { DD.toast('Yapıştırılacak günü seç.', 'uyari'); return; }
    adimAc();
    l.forEach((gi) => { I[gi] = pano.g.slice(); });
    ciz(); adimKapat();
    DD.toast(PB.GUNLER[pano.gi] + ' düzeni ' + l.map((g) => PB.GUN_KISA[g]).join(', ') + ' günlerine yapıştırıldı.');
  }

  /* ---------- Hücre işaretleme: 7e0a04d öncesi davranış ----------
     Tıklama hücreyi sırayla kapalı, online, yüz yüze yapar. Fareyle sürüklemede ilk hücrenin yeni değeri
     üzerinden geçilen hücrelere yazılır. Dokunmatikte ve klavyede tıklama döndürür.
     Her tıklama ve her sürükleme tek geri alma adımıdır. */
  const DURUM = ['', 'online', 'yuzyuze'];
  const sonraki = (d) => DURUM[(DURUM.indexOf(d) + 1) % 3];
  let boya = null, tikYut = false;
  const izgara = $('#musaitIzgara');
  const slot = (el) => el && el.closest && el.closest('#musaitIzgara .takvim-slot');
  izgara.addEventListener('pointerdown', function (e) {
    const b = slot(e.target);
    if (!b || e.pointerType !== 'mouse' || e.button !== 0) return;
    e.preventDefault();
    const g = +b.dataset.g, i = +b.dataset.i;
    odakKoy(g, i, false);
    adimAc();
    boya = sonraki(I[g][i]); tikYut = true;
    hucreYaz(g, i, boya);
  });
  izgara.addEventListener('pointerover', function (e) {
    const b = slot(e.target);
    if (b && boya !== null) hucreYaz(+b.dataset.g, +b.dataset.i, boya);
  });
  /* Hücre basılınca yeniden çizildiği için tarayıcı click'i hiç göndermeyebilir: yutma bayrağı bu görevden sonra düşer */
  document.addEventListener('pointerup', () => { if (boya === null) return; boya = null; adimKapat(); setTimeout(() => { tikYut = false; }); });

  /* Klavye: gezici tabindex, oklar gezer; Boşluk ve Enter düğmeye tıklar */
  function odakKoy(g, i, odakla) {
    const once = $(hucreSec(odak.g, odak.i));
    if (once) once.tabIndex = -1;
    odak = { g, i };
    const e = $(hucreSec(g, i));
    if (e) { e.tabIndex = 0; if (odakla !== false) e.focus(); }
  }
  izgara.addEventListener('keydown', function (e) {
    const b = slot(e.target);
    if (!b) return;
    const g = +b.dataset.g, i = +b.dataset.i;
    const yon = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (yon) {
      e.preventDefault();
      odakKoy(Math.max(0, Math.min(6, g + yon[0])), Math.max(0, Math.min(SATIR - 1, i + yon[1])));
      return;
    }
    if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); odakKoy(g, e.key === 'Home' ? 0 : SATIR - 1); }
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && !e.target.closest('input,select,textarea')) { e.preventDefault(); geriAl(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#kopyaSerit').hidden && $('#kopyaSerit').contains(e.target)) { $('#kopyaSerit').hidden = true; }
  });

  /* ---------- Tıklama dağıtıcısı ---------- */
  document.addEventListener('click', function (e) {
    const s = slot(e.target);
    if (s) {
      if (tikYut) { tikYut = false; return; }
      const g = +s.dataset.g, i = +s.dataset.i;
      adimAc(); hucreYaz(g, i, sonraki(I[g][i])); adimKapat();
      odakKoy(g, i);
      return;
    }
    tikYut = false;
    const t = e.target.closest('[data-gun-menu]');
    if (t) { menuKonum(t); return; }
    const k = e.target.closest('[data-kisayol]');
    if (k) { gunlerYaz(k.dataset.kisayol.split(',').map(Number)); return; }
    const kk = e.target.closest('[data-kopya-kisayol]');
    if (kk) {
      $$('#kopyaGunler [data-gun]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.gun < 5 && !b.disabled)));
      kk.setAttribute('aria-pressed', 'false');
      return;
    }
    const d = e.target.closest('[data-musait]');
    if (!d) return;
    switch (d.dataset.musait) {
      case 'kural': kuralUygula(); break;
      case 'gun-kopyala': menuKapat(); kopyaSeritAc(menuGun); break;
      case 'gun-yapistir': menuKapat(); yapistir([menuGun]); break;
      case 'gun-temizle': {
        menuKapat();
        if (!I[menuGun].some(Boolean)) { DD.toast(PB.GUNLER[menuGun] + ' zaten kapalı.', 'uyari'); break; }
        adimAc(); I[menuGun] = I[menuGun].map(() => ''); ciz(); adimKapat();
        DD.toast(PB.GUNLER[menuGun] + ' temizlendi. Geri almak için Geri al.');
        $('[data-gun-menu="' + menuGun + '"]').focus();
        break;
      }
      case 'yapistir': yapistir(gunSecimi($('#kopyaGunler')).filter((x) => !isNaN(x))); $('#kopyaSerit').hidden = true; break;
      case 'kopya-vazgec': $('#kopyaSerit').hidden = true; break;
      case 'geri': geriAl(); break;
      case 'hepsini-geri':
        adimAc(); I = kopya(kayitli); kuralYaz(kuralKayitli); sonKural = kurallar(); ciz(); adimKapat();
        DD.toast('Kaydedilmiş düzene dönüldü.');
        break;
      case 'kaydet': kaydet(); break;
      case 'izin-ekle': {
        const t2 = $('#izinTarih').value;
        if (!t2) { DD.toast('Önce tarih seç.', 'uyari'); return; }
        if (t2 < DD.bugun) { DD.toast('Geçmiş tarih kapatılamaz.', 'uyari'); return; }
        m.kapali_tarihler = m.kapali_tarihler || [];
        if (m.kapali_tarihler.some((x) => x.tarih === t2)) { DD.toast('Bu tarih zaten kapalı.', 'uyari'); return; }
        m.kapali_tarihler.push({ tarih: t2, neden: $('#izinNeden').value.trim() || 'Kapalı' });
        PB.kaydet(); $('#izinTarih').value = ''; $('#izinNeden').value = ''; izinCiz(); ozet(); DD.toast(PB.tarih(t2) + ' kapatıldı.');
        break;
      }
      case 'izin-sil':
        m.kapali_tarihler = m.kapali_tarihler.filter((x) => x.tarih !== d.dataset.tarih);
        PB.kaydet(); izinCiz(); ozet(); DD.toast('Tarih yeniden açıldı.');
        break;
    }
  });
  const menuIzle = () => { const t = $('[aria-controls="gunMenu"][aria-expanded="true"]'); if (t && !menu.hidden) menuYerlestir(t); };
  window.addEventListener('scroll', menuIzle, { passive: true });
  window.addEventListener('resize', menuIzle);
  $('.musait-kap').addEventListener('scroll', menuIzle, { passive: true });
  menu.addEventListener('keydown', function (e) {
    const l = $$('.acilir-kalem:not([hidden])', menu), i = l.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); l[(i + (e.key === 'ArrowDown' ? 1 : l.length - 1)) % l.length].focus(); }
    if (e.key === 'Tab') menuKapat();
  });

  function izinCiz() {
    const l = (m.kapali_tarihler || []).slice().sort((a, b) => a.tarih.localeCompare(b.tarih));
    $('#izinListe').innerHTML = l.map((x) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-calendar-xmark" aria-hidden="true"></i></span><span class="as-metin"><b>' + PB.tarih(x.tarih) + '</b><span>' + PB.esc(x.neden || 'Kapalı') + '</span></span><span class="as-eylem"><button class="ikon-dugme yikici" type="button" data-musait="izin-sil" data-tarih="' + x.tarih + '" aria-label="' + PB.tarih(x.tarih) + ' tarihini kaldır"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></span></div>').join('');
  }

  $('#hkGunler').addEventListener('dd:secim', kuralOzet);
  $('#hkBicim').addEventListener('dd:secim', kuralOzet);
  ['#hkBas', '#hkBit', '#hkAra'].forEach((s) => $(s).addEventListener('change', kuralOzet));
  /* Yan sütun ayarları da sayaca girer ve geri alınabilir: önceki değer adım olarak saklanır */
  $('#musaitForm').addEventListener('change', function (e) {
    if (!e.target.closest('.form-yan')) return;
    gecmis.push({ I: kopya(I), k: sonKural });
    sonKural = kurallar();
    sayac();
  });
  $('#musaitForm').addEventListener('submit', (e) => e.preventDefault());
  window.addEventListener('beforeunload', (e) => { if (degisimSay()) e.preventDefault(); });

  kurallarDoldur();
  kuralKayitli = kurallar();
  sonKural = kuralKayitli;
  I = izgaraKur();
  kayitli = kopya(I);
  kuralSecenek();
  ciz();
  sayac();
  izinCiz();
})();
