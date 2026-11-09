/* Diyetisyen profili. Ece Tunalı alanları demo durumundan okunur; panelde yapılan değişiklik burada görünür. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const kac = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const ikon = (x) => '<i class="fa-solid ' + x + '" aria-hidden="true"></i>';
  const tl = (n) => DD.bicim.para(n);
  const ilkBuyuk = (s) => { const m = String(s == null ? '' : s); return m.charAt(0).toLocaleUpperCase('tr') + m.slice(1); };

  document.addEventListener('click', (e) => {
    const p = e.target.closest('[data-paylas]');
    if (p) {
      const yaz = navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject();
      yaz.then(() => DD.toast('Profil bağlantısı kopyalandı.'), () => DD.toast('Bağlantı kopyalanamadı.', 'uyari'));
    }
    const g = e.target.closest('[data-sekme-git]');
    if (g) { e.preventDefault(); const t = $(g.dataset.sekmeGit); t.click(); t.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    /* Misafir üye alanına düşmez: Mesaj, Paketi seç ve Randevuyu tamamla girişe gider */
    const uye = e.target.closest('.page-main a[href*="hesabim/"]');
    if (uye && !DD.oturum.acik()) { e.preventDefault(); location.href = DD.kok + 'giris/'; return; }
    if (DD.oturum.acik() && e.target.closest('[data-randevu],[data-mesaj]')) {
      e.preventDefault();
      DD.toast(e.target.closest('[data-randevu]') ? 'Bu hafta açık saat yok. Uzmanın takvimi açıldığında bildirim alırsın.' : 'Mesajlaşma, uzmanla bir görüşme başlattığında açılır.', 'uyari');
    }
  });

  /* Dar ekranda kayan şerit: seçilen sekme görünür alana gelir */
  document.addEventListener('dd:sekme', (e) => {
    const ray = e.target, t = $(e.detail.id);
    if (!t || ray.scrollWidth <= ray.clientWidth) return;
    const a = ray.getBoundingClientRect(), b = t.getBoundingClientRect();
    ray.scrollBy({ left: b.left - a.left - (a.width - b.width) / 2, behavior: 'smooth' });
  });

  if (!$('paketler')) return;
  const d = DD.demo.al(), dyt = d.diyetisyen, P = dyt.profil || {};

  /* Panelde değişen alanlar: derleme değerinin üstüne yazılır */
  const yaz = (ad, v) => document.querySelectorAll('[data-alan="' + ad + '"]').forEach((e) => { e.textContent = v; });
  yaz('deneyim', dyt.deneyim_yil + ' yıl');
  yaz('sehir', dyt.sehir);
  yaz('gorusme', dyt.online && dyt.yuz_yuze ? 'Online ve yüz yüze' : dyt.online ? 'Online' : 'Yüz yüze');
  yaz('uzmanlik1', (dyt.uzmanlik || [])[0] || '');
  /* Seans ücreti aralığı panel Seans Kuralları'ndan (kayıtta fiyat aralığına yazılır) */
  const fa = dyt.fiyat_araligi || {};
  if (fa.min != null) yaz('ucret', fa.min === fa.max ? tl(fa.min) : tl(fa.min) + '–' + DD.bicim.sayi(fa.max));
  $('eceAlan').innerHTML = (dyt.uzmanlik || []).map((u) => '<span class="rozet olumlu">' + kac(u) + '</span>').join('');
  if (P.foto) { const a = $('profilAvatar'); a.textContent = ''; a.classList.remove('harf'); a.style.backgroundImage = 'url("' + P.foto + '")'; }
  if (P.kapak) $('profilKapak').style.backgroundImage = 'url("' + P.kapak + '")';

  /* Yayın durumu: onaylı değilse ziyaretçi profili görmez; ?onizleme=1 durumdan bağımsız açar */
  const onizleme = new URLSearchParams(location.search).get('onizleme') === '1';
  const yayinda = (dyt.onay_durumu || 'onayli') === 'onayli';
  $('onizlemeSerit').hidden = !onizleme;
  if (!yayinda && !onizleme) { $('profilKapali').hidden = false; $('profilGovde').hidden = true; $('profilEylem').hidden = true; }

  $('eceKisa').textContent = P.kisa || 'Kilo yönetimi ve sporcu beslenmesinde, yaşam tarzına uyan sürdürülebilir planlar hazırlıyorum.';
  $('eceBaslik').querySelector('span').textContent = P.baslik || 'Sürdürülebilir Kilo Yönetimi ve Sporcu Beslenmesi';
  const metin = P.metin || 'Dört yıldır kilo yönetimi, insülin direnci ve sporcu beslenmesi üzerine çalışıyorum. Danışanlarımla klinikte ve online görüşüyorum. Amacım kısa süreli bir diyet değil, günlük hayatına uyan ve uzun vadede sürdürebileceğin bir beslenme düzeni kurmak.\n\nİlk görüşmede alışkanlıklarını, hedefini ve günlük ritmini birlikte konuşuyoruz. Planı buna göre kuruyor, iki haftada bir gözden geçirip ihtiyacın olan yerde güncelliyoruz.';
  $('eceMetin').innerHTML = metin.split(/\n{2,}/).map((p) => '<p>' + kac(p) + '</p>').join('');

  /* Eğitim ve doğrulama: panel Profil > Belgeler kaydı; panel hiç açılmadıysa paneldeki başlangıç değerleri */
  const egitim = P.egitim || [{ kurum: 'Beslenme ve Diyetetik Bölümü', program: 'Lisans' }, { kurum: 'Klinik Beslenme', program: 'Yüksek lisans' }];
  const belgeler = P.belgeler || [{ ad: 'Lisans diploması', tur: 'Diploma', durum: 'Doğrulandı', tarih: '2026-02-11' }, { ad: 'Mesleki sorumluluk belgesi', tur: 'Belge', durum: 'Doğrulandı', tarih: '2026-02-11' }];
  const sertifika = String(P.sertifika != null ? P.sertifika : 'Sporcu Beslenmesi Eğitimi\nDiyabette Beslenme Tedavisi').split(/\n+/).filter(Boolean);
  const diller = P.diller || ['Türkçe', 'İngilizce'];
  const hap = (durum) => '<span class="durum-hapi ' + (durum === 'Doğrulandı' ? 'cozulen' : 'bekleyen') + '">' + kac(durum) + '</span>';
  const egSatir = (i, b, m, sag) => '<div class="ayar-satir"><span class="as-ikon" aria-hidden="true">' + ikon(i) + '</span><div class="as-metin"><b>' + b + '</b><span>' + m + '</span></div>' + (sag || '') + '</div>';
  $('eceEgitimListe').innerHTML = egitim.filter((x) => x.kurum).map((x) => egSatir('fa-graduation-cap', kac(x.kurum), kac(x.program || 'Eğitim'))).join('')
    + sertifika.map((x) => egSatir('fa-certificate', kac(x), 'Sertifika')).join('')
    + belgeler.map((b) => egSatir('fa-file-shield', kac(b.ad), kac(b.tur) + (b.tarih ? ' · ' + DD.bicim.tarih(b.tarih) : ''), hap(b.durum))).join('')
    + egSatir('fa-language', 'Görüşme dili', kac(diller.join(', ')))
    + egSatir('fa-utensils', 'Örnek menüler', 'Uzman örnek menü yayınladığında İçerikler sekmesinde listelenir.', '<span class="rozet bekleme">bekliyor</span>');

  const paket = d.paketler.filter((p) => p.aktif);
  $('paketSayi').textContent = paket.length;
  $('paketler').innerHTML = paket.map((p) => '<div class="kart"><div class="kart-bas"><h3 class="kart-baslik">' + ikon('fa-box-open') + ' ' + kac(p.ad) + '</h3><span class="rozet pasif">' + kac(ilkBuyuk(p.tur)) + '</span></div><div class="kart-govde"><p class="sonuc-sayi kucuk">' + tl(p.fiyat) + '</p><p class="kart-metin">' + kac(p.aciklama) + '</p><ul class="uzman-meta">' + '<li>' + ikon('fa-comments') + ' ' + p.seans + ' seans</li><li>' + ikon('fa-clock') + ' ' + p.sure + ' dk görüşme</li></ul></div><div class="kart-alt"><a class="dugme birincil tam-en" href="' + DD.kok + 'hesabim/odeme/?paket=' + encodeURIComponent(p.id) + '">Paketi seç</a></div></div>').join('');

  /* Randevu seçici. Kaynaklar panelde: Müsaitlik ızgarası (gün, saat aralığı, biçim), Seans Kuralları (süre, ücret, tampon),
     kapalı tarihler, takvim blokları, açık seanslar ve dolu randevular. Tarihler bugünden üretilir, geçmiş gün gösterilmez;
     panel seansları 28 gün ileriye açtığı için şerit dört hafta. Saatler üye randevu formuyla aynı adımla dizilir
     (gün başından süre kadar), panel ızgarasında seçilen biçime ait olmayan saat düşer. */
  const GUN = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const GUN_UZUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const AY_UZUN = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const m = d.musaitlik || {}, HAFTA = 4, ON_SURE = 60;
  const TUR = {
    online: { ad: 'Online', ikon: 'fa-video', bilgi: 'Görüntülü görüşme', acik: !!dyt.online, ucret: (m.ucret || {}).online, yedek: (dyt.fiyat_araligi || {}).min },
    'yüz yüze': { ad: 'Yüz yüze', ikon: 'fa-location-dot', bilgi: 'Klinik · ' + (dyt.sehir || ''), acik: !!dyt.yuz_yuze, ucret: (m.ucret || {})['yüz yüze'], yedek: (dyt.fiyat_araligi || {}).max },
  };
  const sure = (t) => (m.slot || {})[t] || 45;
  const ucret = (t) => (TUR[t].ucret != null ? TUR[t].ucret : TUR[t].yedek);
  const dk = (x) => { const [a, b] = x.split(':'); return +a * 60 + +b; };
  const saat = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  const iso = (t) => t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  const simdi = new Date(), bugun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate(), 12);
  const enErken = simdi.getHours() * 60 + simdi.getMinutes() + ON_SURE;

  /* Panel ızgarası: 08.00'den 30 dakikalık hücreler; kayıt yoksa panelin kendi kuruluşu (gün biçimi o günün randevu çoğunluğu) */
  const IZ_BAS = 8 * 60, IZ_ADIM = 30;
  const izgara = (() => {
    if (Array.isArray(m.izgara) && m.izgara.length === 7) return m.izgara;
    return ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((ad, gi) => {
      const g = (m.haftalik || []).find((x) => x.gun === ad) || {}, say = { online: 0, yuzyuze: 0 };
      d.randevular.forEach((r) => { if ((new Date(r.tarih + 'T12:00').getDay() + 6) % 7 === gi) say[r.tur === 'online' ? 'online' : 'yuzyuze']++; });
      const tur = say.yuzyuze > say.online ? 'yuzyuze' : 'online';
      return Array.from({ length: 26 }, (_, i) => { const t = IZ_BAS + i * IZ_ADIM; return g.acik && t >= dk(g.baslangic) && t < dk(g.bitis) && !(g.ara && t >= dk(g.ara[0]) && t < dk(g.ara[1])) ? tur : ''; });
    });
  })();
  /* Seansın değdiği her hücre seçilen biçimde olmalı (45 dk seans 30 dk hücrelerin ortasından başlayabilir) */
  const bicimUyar = (gi, bas, bit, tur) => {
    for (let h = Math.floor((bas - IZ_BAS) / IZ_ADIM); h < Math.ceil((bit - IZ_BAS) / IZ_ADIM); h++) if ((izgara[gi][h] || '') !== (tur === 'online' ? 'online' : 'yuzyuze')) return false;
    return true;
  };

  /* Bir günün saatleri: [{ s: 'HH:MM', dolu }]; kapalı gün null */
  function gunSaatleri(t, tur) {
    const ti = iso(t), g = (m.haftalik || []).find((x) => x.gun === GUN_UZUN[t.getDay()]), n = sure(tur), tampon = m.tampon || 0, gi = (t.getDay() + 6) % 7;
    const ekler = (m.ek_seanslar || []).filter((e) => e.tarih === ti && e.sure >= n && (!e.tur || e.tur === tur));
    const kapali = !g || !g.acik || (m.kapali_tarihler || []).some((k) => k.tarih === ti);
    if (kapali && !ekler.length) return null;
    const mesgul = d.randevular.filter((r) => r.tarih === ti && r.durum !== 'iptal').map((r) => [dk(r.saat), dk(r.saat) + (r.sure || 45)])
      .concat((d.takvim_bloklari || []).filter((x) => x.tarih === ti).map((x) => [dk(x.saat), dk(x.saat) + (x.sure || 45)]));
    const dolu = (a) => mesgul.some(([x, z]) => a - tampon < z && a + n + tampon > x);
    const l = [];
    if (!kapali) {
      const ara = Array.isArray(g.ara) && g.ara.length === 2 ? [dk(g.ara[0]), dk(g.ara[1])] : null;
      for (let a = dk(g.baslangic); a + n <= dk(g.bitis); a += n) {
        if (ara && a < ara[1] && a + n > ara[0]) continue;
        if (bicimUyar(gi, a, a + n, tur)) l.push({ s: saat(a), dolu: dolu(a) });
      }
    }
    ekler.forEach((e) => { if (!l.some((x) => x.s === e.saat)) l.push({ s: e.saat, dolu: dolu(dk(e.saat)) }); });
    return l.filter((x) => ti !== iso(bugun) || dk(x.s) >= enErken).sort((x, y) => x.s.localeCompare(y.s));
  }

  const gunler = Array.from({ length: HAFTA * 7 }, (_, i) => { const t = new Date(bugun); t.setDate(t.getDate() + i); return t; });
  const gunAd = (t, i) => (i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : GUN[t.getDay()]);
  const tarihKisa = (t) => t.getDate() + ' ' + AY[t.getMonth()];
  const tarihUzun = (t) => GUN_UZUN[t.getDay()] + ', ' + t.getDate() + ' ' + AY_UZUN[t.getMonth()];
  const sec = { tur: TUR.online.acik || !TUR['yüz yüze'].acik ? 'online' : 'yüz yüze', gun: -1, saat: null, hafta: 0 };

  /* Gün durumu: kapalı, bu biçimde saat yok, dolu ya da boş saat sayısı */
  function gunDurum(i) {
    const t = gunler[i], l = gunSaatleri(t, sec.tur);
    if (l === null) return { tip: 'kapali', metin: 'Kapalı' };
    const bos = l.filter((x) => !x.dolu).length;
    if (bos) return { tip: 'bos', metin: bos + ' boş saat', l };
    if (l.length) return { tip: 'dolu', metin: 'Dolu', l };
    const diger = sec.tur === 'online' ? 'yüz yüze' : 'online', ds = TUR[diger].acik && gunSaatleri(t, diger);
    if (ds && ds.some((x) => !x.dolu)) return { tip: 'yok', metin: 'Yalnız ' + TUR[diger].ad.toLocaleLowerCase('tr') };
    return { tip: 'dolu', metin: i === 0 ? 'Saat kalmadı' : 'Dolu', l };
  }

  function turCiz() {
    $('slotTur').innerHTML = Object.keys(TUR).map((k) => {
      const x = TUR[k];
      return '<button class="secenek" type="button" role="radio" aria-checked="' + (k === sec.tur) + '" data-deger="' + k + '"' + (x.acik ? '' : ' disabled') + '>' + ikon(x.ikon)
        + '<span>' + x.ad + '<small>' + (x.acik ? kac(x.bilgi) : 'Bu uzman sunmuyor') + '</small></span>'
        + (x.acik ? '<span class="secenek-ek"><b>' + tl(ucret(k)) + '</b><small>' + sure(k) + ' dk</small></span>' : '') + '</button>';
    }).join('');
  }

  function gunCiz() {
    const bas = sec.hafta * 7, son = gunler[bas + 6];
    const ilk = gunler[bas];
    $('haftaAralik').textContent = ilk.getMonth() === son.getMonth() ? ilk.getDate() + '–' + son.getDate() + ' ' + AY_UZUN[son.getMonth()] : tarihKisa(ilk) + ' – ' + tarihKisa(son);
    $('haftaGeri').disabled = sec.hafta === 0;
    $('haftaIleri').disabled = sec.hafta === HAFTA - 1;
    let html = '';
    for (let i = bas; i < bas + 7; i++) {
      const t = gunler[i], du = gunDurum(i), secili = i === sec.gun;
      html += '<button class="gun-kutu ' + du.tip + '" type="button" role="radio" aria-checked="' + secili + '" tabindex="' + (secili ? 0 : -1) + '" data-gun="' + i + '"' + (du.tip === 'bos' ? '' : ' disabled')
        + ' aria-label="' + tarihUzun(t) + ', ' + du.metin + '"><small>' + gunAd(t, i) + '</small><b>' + tarihKisa(t) + '</b><small>' + du.metin + '</small></button>';
    }
    $('gunSerit').innerHTML = html;
    seritOrtala();
    if (!$('gunSerit').querySelector('[tabindex="0"]')) { const b = $('gunSerit').querySelector('.gun-kutu:not(:disabled)'); if (b) b.tabIndex = 0; }
  }

  /* Dar ekranda kayan şeritte seçili gün görünür alana gelir (sayfa kaymaz). Sekme gizliyken ölçü yok: sekme açılınca yeniden */
  function seritOrtala() {
    const sr = $('gunSerit'), sg = sr.querySelector('[aria-checked="true"]');
    if (sg && sr.scrollWidth > sr.clientWidth) sr.scrollLeft += sg.getBoundingClientRect().left - sr.getBoundingClientRect().left - (sr.clientWidth - sg.offsetWidth) / 2;
  }
  document.addEventListener('dd:sekme', (e) => { if (e.detail.id === 't-randevu') requestAnimationFrame(seritOrtala); });

  const DILIM = [['Sabah', 'fa-mug-saucer', 0, 12 * 60], ['Öğle', 'fa-sun', 12 * 60, 17 * 60], ['Akşam', 'fa-moon', 17 * 60, 24 * 60]];
  function saatCiz() {
    if (sec.gun < 0) { $('slotlar').innerHTML = '<p class="kart-metin">Önümüzdeki dört haftada ' + TUR[sec.tur].ad.toLocaleLowerCase('tr') + ' görüşme için boş saat yok. Diğer görüşme türüne bak ya da uzmana mesaj gönder.</p>'; return; }
    const t = gunler[sec.gun], l = gunDurum(sec.gun).l || [];
    $('slotlar').innerHTML = '<p class="alan-etiket">' + tarihUzun(t) + ' <span class="kart-metin">' + sure(sec.tur) + ' dakikalık görüşme</span></p>' + DILIM.map(([ad, ik, a, z]) => {
      const g = l.filter((x) => dk(x.s) >= a && dk(x.s) < z);
      if (!g.length) return '';
      return '<p class="gun-baslik">' + ikon(ik) + ' ' + ad + '</p><div class="saat-izgara esit">' + g.map((x) => {
        const s2 = DD.bicim.saat(x.s), on = sec.saat === x.s;
        return '<button class="cip' + (on ? ' aktif' : '') + '" type="button" aria-pressed="' + on + '" data-saat="' + x.s + '"' + (x.dolu ? ' disabled aria-label="' + s2 + ' dolu"' : '') + '>' + s2 + '</button>';
      }).join('') + '</div>';
    }).join('');
  }

  function ozetCiz() {
    const x = TUR[sec.tur], t = sec.gun >= 0 ? gunler[sec.gun] : null;
    const satir = (e, v) => '<div class="ozet-satir"><span>' + e + '</span><span>' + v + '</span></div>';
    $('ozetListe').innerHTML = satir('Görüşme türü', x.ad) + satir('Tarih', t ? tarihUzun(t) : 'Seçilmedi') + satir('Saat', sec.saat ? DD.bicim.saat(sec.saat) : 'Seçilmedi')
      + satir('Süre', sure(sec.tur) + ' dk') + '<div class="ozet-satir toplam"><span>Ücret</span><span>' + tl(ucret(sec.tur)) + '</span></div>';
    $('ozetSatir').innerHTML = '<b>' + (t && sec.saat ? gunAd(t, sec.gun) + ', ' + tarihKisa(t) + ' · ' + DD.bicim.saat(sec.saat) : 'Saat seçilmedi') + '</b><span>' + x.ad + ' · ' + sure(sec.tur) + ' dk · ' + tl(ucret(sec.tur)) + '</span>';
    const a = $('slotDevam'), hazir = !!(t && sec.saat);
    a.setAttribute('aria-disabled', String(!hazir)); a.classList.toggle('pasif', !hazir);
    a.href = DD.kok + 'hesabim/diyetisyenim/' + (hazir ? '?tarih=' + iso(t) + '&saat=' + encodeURIComponent(sec.saat) + '&tur=' + encodeURIComponent(sec.tur) : '') + '#randevu';
    $('slotNot').textContent = hazir ? 'Randevunu hesabından onaylarsın; ' + (m.onay === 'otomatik' ? 'uzman takvimi otomatik onaylıyor.' : 'uzman talebini onaylayınca kesinleşir.') : 'Saat seçince randevunu hesabından onaylarsın.';
  }

  /* Tür değişince seçili gün korunur; o günde bu türde boş saat yoksa ilk uygun güne geçilir */
  function ilkUygun(bas) { for (let i = Math.max(0, bas); i < gunler.length; i++) if (gunDurum(i).tip === 'bos') return i; return -1; }
  function hepsi() {
    if (sec.gun < 0 || gunDurum(sec.gun).tip !== 'bos') { sec.gun = ilkUygun(0); sec.saat = null; }
    if (sec.gun >= 0) sec.hafta = Math.floor(sec.gun / 7);
    turCiz(); gunCiz(); saatCiz(); ozetCiz();
  }

  $('slotTur').addEventListener('click', (e) => {
    const b = e.target.closest('.secenek');
    if (!b || b.disabled || b.dataset.deger === sec.tur) return;
    sec.tur = b.dataset.deger; sec.saat = null; hepsi();
    $('slotTur').querySelector('[aria-checked="true"]').focus();
  });
  $('gunSerit').addEventListener('click', (e) => {
    const b = e.target.closest('.gun-kutu');
    if (!b || b.disabled) return;
    sec.gun = +b.dataset.gun; sec.saat = null; gunCiz(); saatCiz(); ozetCiz();
    $('gunSerit').querySelector('[data-gun="' + sec.gun + '"]').focus();
  });
  /* Ok tuşları radyo grubu gibi: seçilebilir bir sonraki güne geçer */
  $('gunSerit').addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const l = [...$('gunSerit').querySelectorAll('.gun-kutu:not(:disabled)')], i = l.indexOf(document.activeElement);
    const h = l[i + (e.key === 'ArrowRight' ? 1 : -1)];
    if (h) { e.preventDefault(); h.click(); }
  });
  const haftaGit = (y) => {
    sec.hafta = Math.min(HAFTA - 1, Math.max(0, sec.hafta + y));
    const bas = sec.hafta * 7;
    if (sec.gun < bas || sec.gun >= bas + 7) { const i = ilkUygun(bas); sec.gun = i >= 0 && i < bas + 7 ? i : sec.gun; sec.saat = null; }
    gunCiz(); saatCiz(); ozetCiz();
  };
  $('haftaGeri').addEventListener('click', () => haftaGit(-1));
  $('haftaIleri').addEventListener('click', () => haftaGit(1));
  $('slotlar').addEventListener('click', (e) => {
    const b = e.target.closest('.cip');
    if (!b || b.disabled) return;
    sec.saat = b.dataset.saat; saatCiz(); ozetCiz();
    $('slotlar').querySelector('[data-saat="' + sec.saat + '"]').focus();
  });
  $('slotDevam').addEventListener('click', (e) => {
    if ($('slotDevam').getAttribute('aria-disabled') !== 'true') return;
    e.preventDefault(); e.stopPropagation();
    DD.toast('Önce bir gün ve saat seç.', 'uyari');
  }, true);
  hepsi();
})();
