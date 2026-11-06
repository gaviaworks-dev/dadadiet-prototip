/* Müsaitlik: 30 dakikalık hücre ızgarası. Kayıtta demo.musaitlik.haftalik aralıkları türetilir;
   takvim ve randevu ekranları aynı alanı okur. */
(function () {
  'use strict';
  const { $, $$, esc } = PB;
  const BAS = 8 * 60, ADIM = 30, SATIR = 24, DURUM = ['', 'online', 'yuzyuze'];
  const dk = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const saat = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  const m = PB.nesne('musaitlik');
  let I, kirli = false;

  /* Kayıtlı ızgara yoksa aralıklardan kurulur; gün tipi o gündeki randevuların çoğunluğundan gelir */
  function gunTuru(gi) {
    const say = { online: 0, yuzyuze: 0 };
    PB.liste('randevular').forEach((r) => { if ((new Date(r.tarih + 'T12:00').getDay() + 6) % 7 === gi) say[r.tur === 'online' ? 'online' : 'yuzyuze']++; });
    return say.yuzyuze > say.online ? 'yuzyuze' : 'online';
  }
  function izgaraKur() {
    if (m.izgara) return JSON.parse(JSON.stringify(m.izgara));
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
  function ciz() {
    let h = '<div class="takvim-kose">Saat</div>';
    PB.GUN_KISA.forEach((g, gi) => {
      const kapali = !I[gi].some(Boolean);
      h += '<div class="takvim-gun-bas' + (kapali ? ' kapali' : '') + '"><button type="button" data-musait="gun" data-g="' + gi + '" aria-label="' + PB.GUNLER[gi] + ' ' + (kapali ? 'aç' : 'kapat') + '">' + g + '<small>' + (kapali ? 'Kapalı' : 'Açık') + '</small></button></div>';
    });
    for (let i = 0; i < SATIR; i++) {
      h += '<div class="takvim-saat">' + (i % 2 ? '' : DD.bicim.saat(saat(BAS + i * ADIM))) + '</div>';
      I.forEach((gun, gi) => { h += '<div class="takvim-hucre">' + hucre(gi, i) + '</div>'; });
    }
    $('#musaitIzgara').innerHTML = h;
    ozet();
  }
  const AD = { '': 'Kapalı', online: 'Online', yuzyuze: 'Yüz yüze' };
  const IKON = { '': 'fa-minus', online: 'fa-video', yuzyuze: 'fa-location-dot' };
  function hucre(gi, i) {
    const d = I[gi][i];
    return '<button class="takvim-slot ' + (d || 'bos') + '" type="button" data-g="' + gi + '" data-i="' + i + '" aria-label="' + PB.GUNLER[gi] + ' ' + DD.bicim.saat(saat(BAS + i * ADIM)) + ', ' + AD[d] + '"><i class="fa-solid ' + IKON[d] + '" aria-hidden="true"></i></button>';
  }
  function hucreYaz(gi, i, d) {
    if (I[gi][i] === d) return;
    I[gi][i] = d;
    $('[data-g="' + gi + '"][data-i="' + i + '"]').outerHTML = hucre(gi, i);
    kirlet();
  }
  function kirlet() { kirli = true; $('#musaitNot').textContent = 'Kaydedilmemiş değişiklik var'; ozet(); }
  function ozet() {
    const dolu = I.flat().filter(Boolean).length;
    $('#haftaSaat').textContent = PB.sayi(dolu / 2, 1);
    const sOn = +$('#slotOnline').value, sYz = +$('#slotYuz').value, tp = +$('#tampon').value;
    let n = 0;
    for (let k = 0; k < 7; k++) {
      const iso = PB.gunEkle(DD.bugun, k), gi = (new Date(iso + 'T12:00').getDay() + 6) % 7;
      if ((m.kapali_tarihler || []).some((x) => x.tarih === iso)) continue;
      const on = I[gi].filter((x) => x === 'online').length * ADIM, yz = I[gi].filter((x) => x === 'yuzyuze').length * ADIM;
      n += Math.floor(on / (sOn + tp)) + Math.floor(yz / (sYz + tp));
      n -= PB.liste('randevular').filter((r) => r.tarih === iso && r.durum !== 'iptal').length;
    }
    $('#acikSeans').textContent = Math.max(0, n);
  }
  function izinCiz() {
    const l = (m.kapali_tarihler || []).slice().sort((a, b) => a.tarih.localeCompare(b.tarih));
    $('#izinListe').innerHTML = l.map((x) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-calendar-xmark" aria-hidden="true"></i></span><span class="as-metin"><b>' + PB.tarih(x.tarih) + '</b><span>' + esc(x.neden || 'Kapalı') + '</span></span><span class="as-eylem"><button class="ikon-dugme yikici" type="button" data-musait="izin-sil" data-tarih="' + x.tarih + '" aria-label="' + PB.tarih(x.tarih) + ' tarihini kaldır"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></span></div>').join('');
  }
  /* Izgaradan gün aralığı: ilk açık, son açık ve en geniş ara */
  function aralikYaz() {
    m.haftalik = I.map((g, gi) => {
      const acik = g.map((d, i) => (d ? i : -1)).filter((i) => i >= 0);
      if (!acik.length) return { gun: PB.GUNLER[gi], acik: false, baslangic: null, bitis: null, ara: null };
      let ara = null, enGenis = 0;
      for (let k = 1; k < acik.length; k++) {
        const bos = acik[k] - acik[k - 1] - 1;
        if (bos > enGenis) { enGenis = bos; ara = [saat(BAS + (acik[k - 1] + 1) * ADIM), saat(BAS + acik[k] * ADIM)]; }
      }
      return { gun: PB.GUNLER[gi], acik: true, baslangic: saat(BAS + acik[0] * ADIM), bitis: saat(BAS + (acik[acik.length - 1] + 1) * ADIM), ara };
    });
    m.kapali_gunler = m.haftalik.filter((g) => !g.acik).map((g) => g.gun);
    m.izgara = JSON.parse(JSON.stringify(I));
  }
  function kaydet() {
    aralikYaz();
    m.slot = { online: +$('#slotOnline').value, 'yüz yüze': +$('#slotYuz').value };
    m.tampon = +$('#tampon').value;
    m.onay = $('#onayKural').value;
    const d = PB.demo().diyetisyen;
    d.online = $('#kabulOnline').checked; d.yuz_yuze = $('#kabulYuz').checked;
    PB.kaydet();
    kirli = false;
    $('#musaitNot').textContent = 'Kaydedildi · ' + PB.tarihSaat(PB.simdi());
    DD.toast('Müsaitlik kaydedildi, takvim bu saatlerle güncellendi.');
  }
  function kurallarDoldur() {
    const d = PB.demo().diyetisyen;
    $('#slotOnline').value = m.slot.online; $('#slotYuz').value = m.slot['yüz yüze'];
    $('#tampon').value = m.tampon || 0; $('#onayKural').value = m.onay || 'elle';
    $('#kabulOnline').checked = !!d.online; $('#kabulYuz').checked = !!d.yuz_yuze;
  }

  /* Fareyle sürükleyerek boyama; dokunmatik ve klavye tıklamayla döner */
  let boya = null, tikYut = false;
  const sonraki = (d) => DURUM[(DURUM.indexOf(d) + 1) % 3];
  const ilgili = (e) => e.target.closest && e.target.closest('.takvim-slot');
  $('#musaitIzgara').addEventListener('pointerdown', function (e) {
    const b = ilgili(e);
    if (!b || e.pointerType !== 'mouse') return;
    e.preventDefault();
    boya = sonraki(I[+b.dataset.g][+b.dataset.i]); tikYut = true;
    hucreYaz(+b.dataset.g, +b.dataset.i, boya);
  });
  $('#musaitIzgara').addEventListener('pointerover', function (e) {
    const b = ilgili(e);
    if (b && boya !== null) hucreYaz(+b.dataset.g, +b.dataset.i, boya);
  });
  document.addEventListener('pointerup', () => { boya = null; });
  document.addEventListener('click', function (e) {
    const s = ilgili(e);
    if (s) {
      if (tikYut) { tikYut = false; return; }
      const g = +s.dataset.g, i = +s.dataset.i, kimlik = '[data-g="' + g + '"][data-i="' + i + '"]';
      hucreYaz(g, i, sonraki(I[g][i]));
      $(kimlik).focus();
      return;
    }
    tikYut = false;
    const d = e.target.closest('[data-musait]');
    if (!d) return;
    const dolu = (a, b, tur) => Array.from({ length: SATIR }, (_, i) => { const t = BAS + i * ADIM; return t >= a && t < b ? tur : ''; });
    switch (d.dataset.musait) {
      case 'gun': {
        const gi = +d.dataset.g;
        I[gi] = I[gi].some(Boolean) ? I[gi].map(() => '') : dolu(9 * 60, 17 * 60, gunTuru(gi));
        ciz(); kirlet(); break;
      }
      case 'hafta-ici': for (let g = 0; g < 5; g++) I[g] = dolu(9 * 60, 17 * 60, gunTuru(g)); ciz(); kirlet(); break;
      case 'pzt-uygula': for (let g = 1; g < 5; g++) I[g] = I[0].slice(); ciz(); kirlet(); break;
      case 'temizle': I = I.map((g) => g.map(() => '')); ciz(); kirlet(); break;
      case 'geri': I = izgaraKur(); kurallarDoldur(); kirli = false; ciz(); $('#musaitNot').textContent = 'Kaydedilmiş düzen'; break;
      case 'kaydet': kaydet(); break;
      case 'izin-ekle': {
        const t = $('#izinTarih').value;
        if (!t) { DD.toast('Önce tarih seç.', 'uyari'); return; }
        if (t < DD.bugun) { DD.toast('Geçmiş tarih kapatılamaz.', 'uyari'); return; }
        m.kapali_tarihler = m.kapali_tarihler || [];
        if (m.kapali_tarihler.some((x) => x.tarih === t)) { DD.toast('Bu tarih zaten kapalı.', 'uyari'); return; }
        m.kapali_tarihler.push({ tarih: t, neden: $('#izinNeden').value.trim() || 'Kapalı' });
        PB.kaydet(); $('#izinTarih').value = ''; $('#izinNeden').value = ''; izinCiz(); ozet(); DD.toast(PB.tarih(t) + ' kapatıldı.');
        break;
      }
      case 'izin-sil':
        m.kapali_tarihler = m.kapali_tarihler.filter((x) => x.tarih !== d.dataset.tarih);
        PB.kaydet(); izinCiz(); ozet(); DD.toast('Tarih yeniden açıldı.');
        break;
    }
  });
  $('#musaitForm').addEventListener('change', function (e) { if (e.target.closest('.form-yan')) kirlet(); });
  $('#musaitForm').addEventListener('submit', (e) => e.preventDefault());
  window.addEventListener('beforeunload', (e) => { if (kirli) e.preventDefault(); });
  kurallarDoldur();
  I = izgaraKur();
  ciz();
  izinCiz();
})();
