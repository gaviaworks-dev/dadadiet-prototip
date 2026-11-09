/* Üst bar bildirim zili ve açılır paneli. Zil rozeti Gastro kuralıyla çalışır (public/kabuk/zil-sayaci.*): sayı yazılana kadar gizli, sıfırda yok.
   Gastro'da zil yalnız bağlantıdır, açılır paneli yoktur; panel kanonun .acilir-yuzey + .acilir-bas iskeletine §59 .bildirim-satir satırını koyar.
   DD.bildirim panel ile /hesabim/bildirimler sayfasının tek veri ve satır kaynağıdır. Okunma durumu DD.demo içinde (uyeYerel.bildirimDurum). */
(function () {
  'use strict';
  const DD = window.DD;
  if (!DD || !DD.demo || !DD.bicim) return;
  const TUR = { randevu: ['Randevu', 'fa-calendar-check'], mesaj: ['Mesaj', 'fa-comments'], program: ['Program', 'fa-clipboard-list'], diyetisyen: ['Diyetisyen', 'fa-user-doctor'], rozet: ['Rozet', 'fa-award'], sistem: ['Sistem', 'fa-gear'] };
  const PANEL_SATIR = 6;
  const kac = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const gun = (t) => { const p = String(t).slice(0, 10).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const gunFarki = (t) => Math.round((gun(DD.bugun) - gun(t)) / 86400000);
  const durum = () => {
    const d = DD.demo.al();
    d.uyeYerel = d.uyeYerel || {};
    d.uyeYerel.bildirimDurum = d.uyeYerel.bildirimDurum || { okundu: {}, silindi: {} };
    return d.uyeYerel.bildirimDurum;
  };

  /* Üye ekranında DDU.bildirimler asıl kaynaktır. uye-ortak.js public sayfalarda yüklenmediği için oturum açıkken aynı türetme burada koşar. */
  function turet() {
    const d = DD.demo.al(), u = d.uye || {}, id = u.danisan_id || 'd1', b = DD.bugun, l = [];
    const dy = u.diyetisyen_slug ? d.diyetisyen || null : null, dyAd = dy ? dy.ad : 'Diyetisyenin';
    const tarih = DD.bicim.tarih;
    const p = (d.planlar || []).filter((x) => x.danisan_id === id && x.durum === 'gonderildi').sort((x, y) => String(y.tarih).localeCompare(String(x.tarih)))[0];
    if (p) l.push({ id: 'plan-' + p.id, tur: 'program', tarih: p.tarih, baslik: 'Beslenme planın hazır', metin: dyAd + ' senin için hazırladığı ' + p.ad + ' planını paylaştı.', yol: 'hesabim/beslenme-planim/' });
    const R = { dolu: 'Yaklaşan randevun', 'onay-bekliyor': 'Randevu talebin onay bekliyor', 'sonuc-bekliyor': 'Görüşme sonucu bekleniyor', tamamlandi: 'Görüşmen tamamlandı', gelmedi: 'Görüşmeye katılmadın' };
    (d.randevular || []).filter((r) => r.danisan_id === id).forEach((r) => {
      const dr = r.durum === 'dolu' && r.tarih < b ? 'tamamlandi' : r.durum;
      const bas = dr === 'iptal' ? (r.iptal_eden === 'diyetisyen' ? 'Diyetisyenin randevuyu iptal etti' : '') : R[dr];
      if (bas) l.push({ id: 'rnd-' + r.id + '-' + dr, tur: 'randevu', tarih: r.tarih >= b ? b : r.tarih, baslik: bas, metin: dyAd + ' ile ' + tarih(r.tarih) + ', ' + DD.bicim.saat(r.saat) + ' görüşmen.', yol: 'hesabim/diyetisyenim/#randevu' });
    });
    const sohbet = (d.mesajlar || []).find((m) => m.danisan_id === id);
    const son = sohbet && (sohbet.mesajlar || []).filter((m) => m.kimden !== 'danisan').slice(-1)[0];
    if (son) l.push({ id: 'msj-' + son.zaman, tur: 'mesaj', tarih: son.zaman.slice(0, 10), baslik: 'Yeni bir mesajın var', metin: dyAd + ': ' + (son.metin || (son.ek ? son.ek.ad : '')), yol: 'hesabim/diyetisyenim/#mesaj' });
    const dn = (d.danisanlar || []).find((x) => x.id === id) || {}, IZ = { olcum: 'ölçüm', tahlil: 'tahlil', gunluk: 'günlük takip', belge: 'belge', anamnez: 'sağlık profili' };
    Object.keys(dn.izin_talepleri || {}).filter((t) => !(dn.izinler || {})[t]).forEach((t) => l.push({ id: 'izn-' + t, tur: 'diyetisyen', tarih: dn.izin_talepleri[t], baslik: 'İzin isteği', metin: dyAd + ' ' + IZ[t] + ' verini görmek istiyor.', yol: 'hesabim/veri-izinlerim/' }));
    if (dn.tahlil_istegi) l.push({ id: 'thl-' + dn.tahlil_istegi.tarih, tur: 'diyetisyen', tarih: dn.tahlil_istegi.tarih, baslik: 'Tahlil isteği', metin: dn.tahlil_istegi.not || dyAd + ' güncel tahlilini istiyor.', yol: 'hesabim/saglik-dosyam/#tahlil' });
    (dn.klinik_notlar || []).filter((x) => x.paylasildi).forEach((x) => l.push({ id: 'not-' + x.tarih, tur: 'diyetisyen', tarih: x.tarih, baslik: 'Diyetisyeninden not', metin: x.metin, yol: 'hesabim/saglik-dosyam/#not' }));
    (u.rozetler || []).forEach((r) => l.push({ id: 'roz-' + r.slug, tur: 'rozet', tarih: r.tarih, baslik: 'Yeni rozet: ' + r.ad, metin: r.aciklama, yol: 'hesabim/rozetlerim/' }));
    const dur = durum();
    return l.filter((x) => !dur.silindi[x.id]).map((x) => ({ ...x, okundu: dur.okundu[x.id] != null ? dur.okundu[x.id] : gunFarki(x.tarih) > 14 })).sort((a, c) => c.tarih.localeCompare(a.tarih));
  }

  const liste = () => (window.DDU && window.DDU.bildirimler ? window.DDU.bildirimler() : turet());
  const okunmamis = () => liste().filter((x) => !x.okundu).length;
  /* ?bos=1 kaydı yazmaz: DDU.kaydet bu kuralı taşır */
  const kaydet = () => {
    if (window.DDU) window.DDU.kaydet(); else DD.demo.kaydet();
    document.dispatchEvent(new CustomEvent('dd:bildirim'));
  };
  const zaman = (t) => {
    const n = gunFarki(t);
    if (n <= 0) return 'Bugün';
    if (n === 1) return 'Dün';
    if (n < 7) return n + ' gün önce';
    return n < 30 ? Math.floor(n / 7) + ' hafta önce' : Math.floor(n / 30) + ' ay önce';
  };
  /* Satır biçimi tek yerde. islem: liste sayfasının kalem işlemleri; panelde satırın tamamı bağlantıdır */
  function satir(x, islem) {
    const t = TUR[x.tur] || TUR.program, ik = '<i class="fa-solid ' + t[1] + '" aria-hidden="true"></i>', href = DD.kok + x.yol;
    const ic = '<span class="bs-ikon">' + ik + '</span><div class="bs-metin"><p><b>' + kac(x.baslik) + '</b> ' + kac(x.metin) + '</p><span class="bs-meta"><span class="tur">' + ik + ' ' + t[0] + '</span> · <span>' + zaman(x.tarih) + '</span></span></div>';
    const benek = x.okundu ? '' : '<span class="bs-benek" role="img" aria-label="Okunmadı"></span>';
    const sinif = 'bildirim-satir' + (x.okundu ? '' : ' okunmadi');
    if (!islem) return '<a class="' + sinif + '" href="' + kac(href) + '" data-id="' + kac(x.id) + '">' + ic + benek + '</a>';
    return '<div class="' + sinif + '" data-type="' + x.tur + '" data-id="' + kac(x.id) + '">' + ic + '<span class="bs-islemler"><a class="bs-islem" href="' + kac(href) + '" aria-label="İlgili sayfaya git" title="İlgili sayfaya git" data-git><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a><button class="bs-islem okundu" type="button" data-op="oku" aria-label="Okundu olarak işaretle" title="Okundu olarak işaretle"><i class="fa-solid fa-check" aria-hidden="true"></i></button><button class="bs-islem sil" type="button" data-op="sil" aria-label="Bildirimi sil" title="Bildirimi sil"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></span>' + benek + '</div>';
  }

  DD.bildirim = {
    TUR, liste, okunmamis, satir, zaman, gunFarki,
    oku(id) { durum().okundu[id] = true; kaydet(); },
    hepsiniOku() { liste().forEach((x) => { durum().okundu[x.id] = true; }); kaydet(); },
    sil(id) { durum().silindi[id] = true; kaydet(); },
    geriAl(id) { delete durum().silindi[id]; kaydet(); },
  };

  function kur() {
    const zil = document.querySelector('.head-bell');
    if (!zil) return;
    const rozet = zil.querySelector('.hb-badge');
    const kap = document.createElement('div');
    kap.className = 'acilir-kap zil-kap oturum-acik';
    zil.before(kap);
    kap.append(zil);
    const yuzey = document.createElement('div');
    yuzey.className = 'acilir-yuzey saga zil-panel';
    yuzey.id = 'zilPanel';
    yuzey.hidden = true;
    yuzey.tabIndex = -1;
    yuzey.setAttribute('role', 'dialog');
    yuzey.setAttribute('aria-label', 'Bildirimler');
    kap.append(yuzey);
    zil.setAttribute('role', 'button');
    zil.setAttribute('aria-haspopup', 'dialog');
    zil.setAttribute('aria-expanded', 'false');
    zil.setAttribute('aria-controls', yuzey.id);

    function sayac() {
      const n = okunmamis();
      if (rozet) { rozet.textContent = n; rozet.hidden = !n; }
      document.documentElement.dataset.zilSayaci = n ? 'yazildi' : 'sifir';
      zil.setAttribute('aria-label', n ? 'Bildirimler, ' + n + ' okunmamış' : 'Bildirimler');
    }
    function ciz() {
      const l = liste(), n = l.filter((x) => !x.okundu).length;
      const bos = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-bell-slash" aria-hidden="true"></i></span><h3>Henüz bildirimin yok</h3><p>Randevu, mesaj ve program hareketlerin burada görünecek.</p></div>';
      yuzey.innerHTML = '<div class="acilir-bas"><span>Bildirimler</span>' + (n ? '<button type="button" data-zil-hepsi>Tümünü okundu işaretle</button>' : '') + '</div>'
        + '<div class="zil-liste">' + (l.length ? l.slice(0, PANEL_SATIR).map((x) => satir(x)).join('') : bos) + '</div>'
        + '<a class="zil-alt" href="' + DD.kok + 'hesabim/bildirimler/">Tüm bildirimleri gör <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>';
    }
    const acik = () => !yuzey.hidden;
    function kapat(odakGeri) {
      if (!acik()) return;
      yuzey.hidden = true;
      zil.setAttribute('aria-expanded', 'false');
      if (odakGeri) zil.focus();
    }
    function ac() {
      ciz();
      const bas = zil.closest('header');
      if (bas) yuzey.style.setProperty('--zil-ust', Math.round(bas.getBoundingClientRect().bottom) + 'px');
      yuzey.hidden = false;
      zil.setAttribute('aria-expanded', 'true');
      yuzey.focus({ preventScroll: true });
    }

    zil.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      if (acik()) kapat(true); else ac();
    });
    zil.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); zil.click(); } });
    yuzey.addEventListener('click', (e) => {
      if (e.target.closest('[data-zil-hepsi]')) {
        DD.bildirim.hepsiniOku();
        yuzey.focus({ preventScroll: true });
        DD.toast('Bütün bildirimler okundu.');
        return;
      }
      const s = e.target.closest('.bildirim-satir');
      if (s) DD.bildirim.oku(s.dataset.id);
      if (s || e.target.closest('.zil-alt')) kapat(false);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && acik()) kapat(true); });
    /* composedPath: yeniden çizimde DOM'dan çıkan düğme de panelin içi sayılır */
    document.addEventListener('click', (e) => { if (acik() && !e.composedPath().includes(kap)) kapat(false); });
    kap.addEventListener('focusout', (e) => { if (e.relatedTarget && !kap.contains(e.relatedTarget)) kapat(false); });
    document.addEventListener('dd:bildirim', () => { sayac(); if (acik()) ciz(); });
    sayac();
  }
  document.addEventListener('DOMContentLoaded', kur);
})();
