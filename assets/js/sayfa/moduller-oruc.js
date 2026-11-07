/* Aralıklı Oruç Rehberi: protokol + ilk lokma saati -> pencere, çark, çizelge */
(function () {
  'use strict';
  const M = window.DDM, S = M.soru;
  const $ = (id) => document.getElementById(id);
  /* Süre önde, ad arkada; başlangıç düzeni ilk sırada ve varsayılan */
  const PROTOKOL = [
    { id: 'sirkadiyen', ad: 'Sirkadiyen', baslik: '14 saat oruç', alt: 'Sirkadiyen 14:10, yeni başlayanlar için', ikon: 'fa-sun', yeme: 10, ilk: '08:00' },
    { id: '16-8', ad: '16:8', baslik: '16 saat oruç', alt: '16:8, en çok tercih edilen', ikon: 'fa-hourglass-half', yeme: 8, ilk: '12:00' },
    { id: '18-6', ad: '18:6', baslik: '18 saat oruç', alt: '18:6, ileri düzey', ikon: 'fa-stopwatch', yeme: 6, ilk: '13:00' },
    { id: '20-4', ad: '20:4 / OMAD', baslik: '20 saat oruç', alt: '20:4 / OMAD, en ileri düzey', ikon: 'fa-bowl-food', yeme: 4, ilk: '15:00' },
    /* Rehberin listesinde yok, onboarding'de seçilmişse üyeye kendi düzeni olarak gösterilir */
    { id: '12-12', ad: '12:12', baslik: '12 saat oruç', alt: '12:12, yumuşak başlangıç', ikon: 'fa-moon', yeme: 12, ilk: '08:00', ek: true },
  ];
  /* Kesintisiz evreler; cümleler uzman onayına kadar temkinli kipte */
  const ASAMA = [
    { bas: 0, bit: 4, ad: 'İnsülin dengelenir', metin: 'Son öğünün sindirilirken kan şekeri ve insülin genellikle yavaş yavaş iner.' },
    { bas: 4, bit: 8, ad: 'Kan şekeri sakinleşir', metin: 'Sindirim tamamlanırken vücut depolanmış glikojeni kullanmaya yönelebilir.' },
    { bas: 8, bit: 12, ad: 'Glikojen azalır, yağ kullanımı artabilir', metin: 'Karaciğerdeki glikojen deposu azaldıkça vücut enerji için yağa yönelebilir.' },
    { bas: 12, bit: 16, ad: 'Ketozis başlayabilir', metin: 'Keton üretimi artabilir; bu genellikle 14-16. saatlerde belirginleşir ve kişiden kişiye değişir.' },
    { bas: 16, bit: null, ad: 'Otofaji artabilir', metin: 'Hücresel temizlik süreçlerinin artabileceği düşünülüyor. İnsanlarda kanıt sınırlıdır, daha çok araştırma gerekiyor.' },
  ];
  const durum = { p: PROTOKOL[0], saat: PROTOKOL[0].ilk, elle: false };
  /* Sistem kullanıcıyı tercihlerinden bilir: oturum açık ve protokol doluysa seçim sorulmaz */
  const t = DD.oturum.acik() ? S.tercih() : {};
  const oruclu = Boolean(t.oruc_protokol) && t.oruc_protokol !== 'yok';
  const kayitli = oruclu ? PROTOKOL.find((x) => x.id === ({ '14-10': 'sirkadiyen' }[t.oruc_protokol] || t.oruc_protokol)) : null;
  if (kayitli) { durum.p = kayitli; durum.saat = kayitli.ilk; }
  if (t.ilk_ogun_saati && t.oruc_protokol !== 'yok') { durum.saat = t.ilk_ogun_saati; durum.elle = true; }
  const dk = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
  const saat = (d) => { d = ((d % 1440) + 1440) % 1440; return String(Math.floor(d / 60)).padStart(2, '0') + '.' + String(d % 60).padStart(2, '0'); };

  /* Çark */
  const simdi = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
  const sure = (d) => { const h = Math.floor(d / 60), m = d % 60; return (h ? h + ' sa ' : '') + m + ' dk'; };
  const C = 180, R = 124, KAL = 30;
  const nokta = (d, r) => { const a = (d / 1440) * 2 * Math.PI - Math.PI / 2; return [C + r * Math.cos(a), C + r * Math.sin(a)].map((v) => +v.toFixed(2)); };
  const yay = (b, e, r) => { const s = ((e - b) % 1440 + 1440) % 1440, [x1, y1] = nokta(b, r), [x2, y2] = nokta(e, r); return 'M' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 ' + (s > 720 ? 1 : 0) + ' 1 ' + x2 + ' ' + y2; };
  function carkCiz(bas, bit, orucSaat) {
    let s = '<svg class="cizim" viewBox="0 0 360 360" role="group" aria-label="24 saatlik zaman çarkı. Yeme penceresi ' + saat(bas) + ' ile ' + saat(bit) + ' arası, kalan ' + orucSaat + ' saat oruç.">';
    s += '<path d="' + yay(bit, bas, R) + '" fill="none" stroke="var(--cizgi-vurgu)" stroke-width="' + KAL + '"/>';
    s += '<path d="' + yay(bas, bit, R) + '" fill="none" stroke="var(--aksan-koyu)" stroke-width="' + KAL + '"/>';
    for (let h = 0; h < 24; h++) {
      const a = nokta(h * 60, R + KAL / 2 + 4), b = nokta(h * 60, R + KAL / 2 + (h % 3 ? 8 : 12));
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="var(--cizgi-vurgu)" stroke-width="1.5"/>';
      if (h % 3 === 0) { const c = nokta(h * 60, R + KAL / 2 + 24); s += '<text class="cark-saat" x="' + c[0] + '" y="' + (c[1] + 4) + '" text-anchor="middle">' + String(h).padStart(2, '0') + '</text>'; }
    }
    ASAMA.forEach((a) => {
      if (a.bas === 0 || a.bas >= orucSaat) return;
      const p1 = nokta(bit + a.bas * 60, R - KAL / 2), p2 = nokta(bit + a.bas * 60, R + KAL / 2);
      s += '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="var(--kagit)" stroke-width="3"><title>Orucun yaklaşık ' + a.bas + '. saati: ' + a.ad + '</title></line>';
    });
    s += '<path id="carkEvre" class="cark-evre" d="" fill="none" stroke="var(--aksan)" stroke-width="5" stroke-linecap="round"/>';
    const su = simdi(), sn = nokta(su, R);
    s += '<circle class="cark-su-an" cx="' + sn[0] + '" cy="' + sn[1] + '" r="8" fill="var(--kagit)" stroke="var(--aksan-koyu)" stroke-width="3.5"><title>Şu an ' + saat(su) + '</title></circle>';
    const tn = nokta(bas, R), tv = saat(bas);
    s += '<g class="cark-tutamac" id="carkTutamac" role="slider" tabindex="0" aria-label="İlk lokma saati" aria-valuemin="0" aria-valuemax="1425" aria-valuenow="' + bas + '" aria-valuetext="' + tv + '"><circle cx="' + tn[0] + '" cy="' + tn[1] + '" r="15"/><path d="M' + (tn[0] - 3.5) + ' ' + (tn[1] - 5) + 'v10M' + tn[0] + ' ' + (tn[1] - 5) + 'v10M' + (tn[0] + 3.5) + ' ' + (tn[1] - 5) + 'v10"/></g>';
    s += '<text class="cark-buyuk" x="' + C + '" y="' + (C - 8) + '" text-anchor="middle">' + saat(bas) + ' – ' + saat(bit) + '</text>';
    s += '<text class="cark-kucuk" x="' + C + '" y="' + (C + 16) + '" text-anchor="middle">yeme penceren</text>';
    s += '<text class="cark-kucuk" x="' + C + '" y="' + (C + 36) + '" text-anchor="middle">' + orucSaat + ' saat oruç</text>';
    const odakta = document.activeElement && document.activeElement.id === 'carkTutamac';
    $('cark').innerHTML = s + '</svg>';
    if (odakta) $('carkTutamac').focus();
  }

  /* Çark ile çizelgenin ortak "şu an"ı: oruçtaysa kaçıncı saatte olduğu */
  function suAn(bas, bit) {
    const n = simdi(), yemeDk = durum.p.yeme * 60, gecen = (((n - bas) % 1440) + 1440) % 1440;
    if (gecen < yemeDk) return { yeme: true, kalan: yemeDk - gecen };
    const orucDk = (((n - bit) % 1440) + 1440) % 1440;
    return { yeme: false, kalan: 1440 - yemeDk - orucDk, saat: orucDk / 60 };
  }
  function suAnCiz(bas, bit) {
    const d = suAn(bas, bit);
    $('suAn').querySelector('span').textContent = d.yeme ? 'Bu düzende şu an yeme penceresindesin, ' + sure(d.kalan) + ' kaldı.' : 'Bu düzende şu an oruç penceresindesin, ilk lokmaya ' + sure(d.kalan) + ' kaldı.';
    document.querySelectorAll('.zc-burada').forEach((e) => e.remove());
    if (d.yeme) return;
    const i = ASAMA.findIndex((a) => d.saat >= a.bas && (a.bit == null || d.saat < a.bit));
    const k = $('cizelge').children[i];
    if (k) k.querySelector('.zc-baslik').insertAdjacentHTML('beforeend', ' <span class="rozet olumlu zc-burada">Şu an buradasın</span>');
  }
  function evreGoster(i) {
    const yol = $('carkEvre'), a = ASAMA[i], bit = dk(durum.saat) + durum.p.yeme * 60, oruc = 24 - durum.p.yeme;
    document.querySelectorAll('#cizelge .zc-kalem').forEach((k, n) => k.classList.toggle('secili', n === i));
    if (!yol) return;
    if (!a || a.bas >= oruc) { yol.setAttribute('d', ''); return; }
    const son = a.bit == null ? oruc : Math.min(a.bit, oruc);
    yol.setAttribute('d', yay(bit + a.bas * 60, bit + son * 60, R - KAL / 2 - 7));
  }
  function ciz() {
    const bas = dk(durum.saat), bit = bas + durum.p.yeme * 60, oruc = 24 - durum.p.yeme;
    const sonrakiIlk = bas + 1440, ertesi = '<small>ertesi gün</small>';
    carkCiz(bas, bit, oruc);
    $('pencereOzet').innerHTML = [['İlk lokma', saat(bas)], ['Son lokma', saat(bit) + (bit >= 1440 ? ertesi : '')], ['Yeni pencere', saat(sonrakiIlk) + ertesi], ['Oruç / yeme', oruc + ' / ' + durum.p.yeme + ' saat']].map((x) => '<div><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>').join('');
    $('cizelge').innerHTML = ASAMA.map((a, i) => {
      const ulasir = oruc > a.bas, tam = a.bit != null && oruc >= a.bit;
      const zaman = a.bit == null ? 'Yaklaşık ' + a.bas + '. saatten sonra · ' + saat(bit + a.bas * 60) + ' sonrası' : 'Yaklaşık ' + a.bas + '-' + a.bit + '. saat · ' + saat(bit + a.bas * 60) + ' – ' + saat(bit + a.bit * 60);
      const ek = !ulasir ? ' Bu protokolde bu saate ulaşmazsın.' : !tam && a.bit != null ? ' Bu protokolde yalnız başlangıcına ulaşırsın.' : '';
      return '<div class="zc-kalem' + (ulasir ? ' gecti' : ' soluk') + '" data-evre="' + i + '" tabindex="0"><div class="zc-zaman">' + zaman + '</div><div class="zc-baslik">' + a.ad + '</div><div class="zc-metin">' + a.metin + ek + '</div></div>';
    }).join('');
    suAnCiz(bas, bit);
    const not = $('saatNotu'), son = ((bit % 1440) + 1440) % 1440, gec = son > 21 * 60 || son < 4 * 60;
    const sirk = durum.p.id === 'sirkadiyen' && son > 19 * 60;
    not.hidden = !(gec || sirk);
    not.querySelector('span').textContent = sirk && !gec ? 'Sirkadiyen düzende pencere gün batımına yakın kapanır. İlk lokmanı biraz öne almayı dene.' : 'Son lokman gece geç saate kalıyor. Uyumadan en az 2-3 saat önce bitirecek şekilde ilk lokmanı öne alabilirsin.';
    document.querySelectorAll('#saatCipler .cip').forEach((c) => c.classList.toggle('aktif', c.dataset.saat === durum.saat));
    document.querySelectorAll('#protokoller .secenek').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === durum.p.id)));
    $('ilkLokma').value = durum.saat;
    const oz = $('bilinenDuzen');
    oz.querySelector('.secili-ozet-ikon i').className = 'fa-solid ' + durum.p.ikon;
    oz.querySelector('b').textContent = durum.p.baslik;
    oz.querySelector('small').textContent = durum.p.alt + ' · ilk lokma ' + saat(bas);
  }
  const kayitYaz = (k, ilk) => { $('kayitDurum').querySelector('span').textContent = k ? (ilk ? 'Saatlerin profilinde kayıtlı: ' : 'Saatlerin profiline kaydedildi: ') + durum.p.ad + ', ilk lokma ' + DD.bicim.saat(durum.saat) + '.' : 'Bir seçim yaptığında saatlerin profiline kaydedilir.'; };
  function kaydet() {
    if (!DD.oturum.acik()) return;
    S.yaz({ oruc_protokol: durum.p.id, ilk_ogun_saati: durum.saat });
    kayitYaz(true);
  }

  $('protokoller').innerHTML = PROTOKOL.filter((p) => !p.ek || p === durum.p).map((p) => '<button class="secenek" type="button" data-deger="' + p.id + '" aria-pressed="false"><i class="fa-solid ' + p.ikon + '" aria-hidden="true"></i><span>' + p.baslik + '<small>' + p.alt + '</small></span></button>').join('');
  $('saatCipler').innerHTML = ['08:00', '10:00', '12:00', '14:00'].map((s) => '<button class="cip" type="button" data-saat="' + s + '">' + DD.bicim.saat(s) + '</button>').join('');
  $('protokoller').addEventListener('dd:secim', (e) => {
    durum.p = PROTOKOL.find((x) => x.id === e.detail.deger); if (!durum.elle) durum.saat = durum.p.ilk; ciz(); kaydet();
  });
  $('saatCipler').addEventListener('click', (e) => { const c = e.target.closest('[data-saat]'); if (c) { durum.saat = c.dataset.saat; durum.elle = true; ciz(); kaydet(); } });
  $('ilkLokma').addEventListener('change', (e) => { if (e.target.value) { durum.saat = e.target.value; durum.elle = true; ciz(); kaydet(); } });

  /* Çarkta sürükleme: halkadan tutulur, yeme penceresi 15 dakikalık adımlarla döner.
     Yayın içinden tutulunca tutulan nokta korunur, boş halkaya basınca pencere oraya gelir. */
  const ADIM = 15, cark = $('cark');
  const sekle = (d) => { d = ((Math.round(d / ADIM) * ADIM) % 1440 + 1440) % 1440; return String(Math.floor(d / 60)).padStart(2, '0') + ':' + String(d % 60).padStart(2, '0'); };
  const konum = (e) => {
    const r = cark.querySelector('svg').getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 360 - C, y = (e.clientY - r.top) / r.height * 360 - C;
    return { uzak: Math.hypot(x, y), dk: ((Math.atan2(x, -y) / (2 * Math.PI)) * 1440 + 1440) % 1440 };
  };
  const saatAyarla = (s) => { if (s === durum.saat) return; durum.saat = s; durum.elle = true; ciz(); };
  let surukleme = null;
  cark.addEventListener('pointerdown', (e) => {
    const k = konum(e);
    if (Math.abs(k.uzak - R) > KAL / 2 + 10 || e.button) return;
    const bas = dk(durum.saat), icinde = ((k.dk - bas) % 1440 + 1440) % 1440 < durum.p.yeme * 60;
    surukleme = { fark: icinde && !e.target.closest('#carkTutamac') ? k.dk - bas : 0 };
    cark.setPointerCapture(e.pointerId); cark.classList.add('surukleniyor'); e.preventDefault();
    if (!surukleme.fark) saatAyarla(sekle(k.dk));
  });
  cark.addEventListener('pointermove', (e) => { if (surukleme) saatAyarla(sekle(konum(e).dk - surukleme.fark)); });
  const birak = () => { if (!surukleme) return; surukleme = null; cark.classList.remove('surukleniyor'); kaydet(); };
  cark.addEventListener('pointerup', birak);
  cark.addEventListener('pointercancel', birak);
  cark.addEventListener('keydown', (e) => {
    const a = { ArrowRight: ADIM, ArrowUp: ADIM, ArrowLeft: -ADIM, ArrowDown: -ADIM, PageUp: 60, PageDown: -60 }[e.key];
    if (!a || e.target.id !== 'carkTutamac') return;
    e.preventDefault(); saatAyarla(sekle(dk(durum.saat) + a)); kaydet();
  });

  /* Evre ile çark bağı: üstüne gelince, odakta ve dokununca yay vurgulanır */
  const evre = (e) => { const k = e.target.closest && e.target.closest('[data-evre]'); return k ? +k.dataset.evre : null; };
  const cizelge = $('cizelge');
  ['mouseover', 'focusin', 'click'].forEach((o) => cizelge.addEventListener(o, (e) => { const i = evre(e); if (i != null) evreGoster(i); }));
  cizelge.addEventListener('mouseleave', () => evreGoster(-1));
  cizelge.addEventListener('focusout', () => evreGoster(-1));
  setInterval(() => { const b = dk(durum.saat); carkCiz(b, b + durum.p.yeme * 60, 24 - durum.p.yeme); suAnCiz(b, b + durum.p.yeme * 60); }, 60000);

  /* Bilinen üye özeti görür, seçim ancak Değiştir ile açılır */
  function secimGoster(acik) {
    $('protokolSecim').hidden = !acik; $('bilinenDuzen').hidden = acik;
    $('pencereOzet').classList.toggle('dort-kutu', !acik);
    const d = $('duzenDegistir'); d.textContent = acik ? 'Kapat' : 'Değiştir'; d.setAttribute('aria-expanded', String(acik));
    $('duzenBaslik').textContent = acik ? 'Düzenini değiştir' : 'Senin düzenin';
    $('duzenAlt').textContent = acik ? 'Yaptığın seçim profiline hemen kaydedilir.' : 'Tercihlerinden geldi, yeniden seçmen gerekmiyor.';
  }
  ciz();
  kayitYaz(Boolean(kayitli), true);
  if (kayitli) {
    $('duzenDegistir').hidden = false;
    $('duzenDegistir').addEventListener('click', () => secimGoster($('protokolSecim').hidden));
    secimGoster(false);
    document.querySelector('.bant-alt').textContent = 'Düzenin tercihlerinden geldi; yeme ve oruç pencereni, oruç sırasında vücudunda neler olduğunu saat saat gör.';
  }
})();
