/* Reklam önizlemesi (prototip). Canlıda misafire reklam basılmaz (config/reklam.php bayrakları kapalı); prototipte de varsayılan
   görünümde hiçbir alan basılmaz, kancalar <template data-rk-yer="KOD"> olarak durur (_src/parcalar/reklam.mjs).
   Açma yolları: ?reklam=KOD (tek alan, o alana kaydırır; virgülle birden çok kod), ?reklam=hepsi (sayfadaki tümü) ve ekranlar
   sayfasındaki "Reklamlı görünüm" anahtarı (site genelinde tümü). Seçilen kip bu sekmenin oturumuna yazılır (sessionStorage
   dd-reklam-mod) ve bütün iç gezinmede (panel ve hesabım dahil) korunur; kapatma ?reklam=kapali, şeritteki "Kapat" ya da anahtar.
   Panel ve tam ekran düzeninde reklam yüzeyi yoktur: betik orada yalnız kipi okur ya da yazar, sayfaya dokunmaz. Açıkken public ve
   üye sayfalarında kapatılabilir bir "Reklam önizlemesi açık" şeridi durur. Canlı modülün CSS'i ve betikleri (assets/css/reklam,
   assets/js/reklam) yalnız önizleme açıkken ve yalnız kancası olan sayfaya yüklenir. Gösterim ya da tıklama sayılmaz, istek gitmez. */
(function () {
  'use strict';
  var MOD = 'dd-reklam-mod';
  var ESKI = 'dd-reklam-onizleme'; /* eski anahtar (localStorage, site geneli): bir kez oturuma taşınır ve silinir */
  var kok = document.documentElement.dataset.kok || './';
  /* Dinamik yüklenen reklam dosyalarının önbellek sürümü (kabuk: reklam klasörlerinin içerik özeti) */
  var surum = document.currentScript && document.currentScript.dataset.rkSurum ? '?v=' + document.currentScript.dataset.rkSurum : '';
  var adres = new URL(location.href);
  var param = (adres.searchParams.get('reklam') || '').trim();
  /* Satış vitrinindeki ölçekli önizleme çerçeveleri (?reklam=KOD) sekmenin kipini değiştirmez */
  var cerceve = window.self !== window.top;
  var oku = function () { try { return sessionStorage.getItem(MOD) || ''; } catch (e) { return ''; } };
  var yaz = function (v) { try { if (v) sessionStorage.setItem(MOD, v); else sessionStorage.removeItem(MOD); } catch (e) { /* depo kapalı */ } };
  var eskiSil = function () { try { localStorage.removeItem(ESKI); } catch (e) { /* depo kapalı */ } };

  window.DD_REKLAM = {
    acik: function () { return !!oku(); },
    ac: function () { yaz('hepsi'); eskiSil(); },
    kapat: function () { yaz(''); eskiSil(); },
  };

  if (param === 'kapali') {
    if (cerceve) return;
    window.DD_REKLAM.kapat();
    adres.searchParams.delete('reklam');
    history.replaceState(history.state, '', adres.pathname + adres.search + adres.hash);
    return;
  }
  if (!cerceve) {
    try { if (localStorage.getItem(ESKI) === '1') { if (!oku()) yaz('hepsi'); eskiSil(); } } catch (e) { /* depo kapalı */ }
    if (param) yaz(param);
  }
  /* Kip: adresteki parametre, yoksa bu sekmenin oturumu. Tek alana kaydırma yalnız adresten gelince yapılır. */
  var urlden = !!param;
  param = param || (cerceve ? '' : oku());
  /* Önizleme kapalıysa ya da sayfanın reklam yüzeyi yoksa (panel, tam ekran) sayfaya tek bayt dokunulmaz */
  if (!param || !document.querySelector('[data-site-header]')) return;
  var hepsi = !param || param === 'hepsi';
  var istenen = hepsi ? null : param.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  var kancalar = [].slice.call(document.querySelectorAll('template[data-rk-yer]'));
  var secili = kancalar.filter(function (t) {
    if (hepsi) return true;
    return t.dataset.rkYer.split(' ').some(function (k) { return istenen.indexOf(k) !== -1; });
  });
  document.documentElement.classList.add('rk-onizleme');
  if (!hepsi) document.documentElement.classList.add('rk-tek');
  if (cerceve) document.documentElement.classList.add('rk-cerceve');

  function serit() {
    if (cerceve || document.querySelector('.rk-onizleme-serit')) return;
    var s = document.createElement('div');
    s.className = 'rk-onizleme-serit';
    s.setAttribute('role', 'status');
    var ne = hepsi ? (secili.length ? 'Reklam önizlemesi açık' : 'Reklam önizlemesi açık · bu sayfada reklam alanı yok') : 'Reklam önizlemesi açık · ' + istenen.join(', ') + (secili.length ? '' : ' · bu sayfada yok');
    s.innerHTML = '<div class="kap"><i class="fa-solid fa-rectangle-ad" aria-hidden="true"></i><span>' + ne + '</span><span class="rk-onizleme-not">prototip örneği, kurgu markalar</span><button type="button" class="dugme hayalet kucuk" data-rk-onizleme-kapat>Kapat</button></div>';
    document.body.prepend(s);
    /* Şerit sabit başlığın hemen altında, küçük bir hap olarak durur */
    var ust = document.querySelector('[data-site-header]');
    var konumla = function () { if (ust) document.documentElement.style.setProperty('--rk-serit-ust', Math.max(8, Math.round(ust.getBoundingClientRect().bottom + 8)) + 'px'); };
    konumla();
    addEventListener('scroll', konumla, { passive: true });
    addEventListener('resize', konumla);
    s.querySelector('[data-rk-onizleme-kapat]').addEventListener('click', function () {
      window.DD_REKLAM.kapat();
      adres.searchParams.delete('reklam');
      location.replace(adres.toString());
    });
  }

  function stil(ad) {
    return new Promise(function (tamam) {
      var l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = kok + 'assets/css/reklam/' + ad + '.css' + surum;
      l.onload = l.onerror = function () { tamam(); };
      document.head.appendChild(l);
    });
  }
  function betik(ad, modul) {
    return new Promise(function (tamam) {
      var s = document.createElement('script');
      s.src = kok + 'assets/js/reklam/' + ad + '.js' + surum;
      if (modul) s.type = 'module';
      s.onload = s.onerror = function () { tamam(); };
      document.body.appendChild(s);
    });
  }

  /* Kancayı açar: yerinde, kabın N. öğesi olarak (data-rk-sira) ya da bir hedefe göre (data-rk-hedef + data-rk-yon) */
  function ac(t) {
    var parca = t.content.cloneNode(true);
    if (!hepsi) {
      /* Tek alan: standart katmanda yalnız istenen biçim kalır */
      parca.querySelectorAll('[data-rk-bicim]').forEach(function (n) {
        if (istenen.indexOf(n.dataset.rkSlot) === -1 && !n.closest('.rk-video-slot')) n.remove();
      });
    }
    var hedef = t.dataset.rkHedef, yon = t.dataset.rkYon;
    if (hedef === 'yayilim') return false;
    if (hedef) {
      var el = t.closest(hedef) || (t.parentElement && t.parentElement.querySelector(':scope > ' + hedef)) || document.querySelector(hedef);
      if (!el) { t.replaceWith(parca); return true; }
      if (t.dataset.rkSira) {
        var oge = [].slice.call(el.children).filter(function (c) { return c.tagName !== 'TEMPLATE'; })[+t.dataset.rkSira - 1];
        if (oge) oge.before(parca); else el.append(parca);
        t.remove();
        return true;
      }
      if (yon === 'yerine') { el.replaceWith(parca); t.remove(); }
      else if (yon === 'once') { el.before(parca); t.remove(); }
      else if (yon === 'basa') { el.prepend(parca); t.remove(); }
      else if (yon === 'sona') { el.append(parca); t.remove(); }
      else { el.after(parca); t.remove(); }
      return true;
    }
    if (t.dataset.rkSira) {
      var kap = t.parentElement;
      var ogeler = [].slice.call(kap.children).filter(function (c) { return c.tagName !== 'TEMPLATE'; });
      var once = ogeler[+t.dataset.rkSira - 1];
      if (once) once.before(parca); else kap.append(parca);
      t.remove();
      return true;
    }
    t.replaceWith(parca);
    return true;
  }

  /* STD-VIDEO: sayfanın ilk yayılım yuvasının yerine basılır (canlı karar 151); yuvanın kendi kreatifi gizli kalır */
  function video(t) {
    var parca = t.content.cloneNode(true);
    var yuva = document.querySelector('main .rk-yayilim-bant, main .rk-sar');
    if (yuva) {
      var sakla = document.createElement('div');
      sakla.setAttribute('data-rk-review-static', '');
      sakla.hidden = true;
      yuva.before(parca);
      yuva.before(sakla);
      sakla.append(yuva);
    } else {
      var bolum = document.querySelector('main .bolum .kap, main section .kap');
      if (bolum) bolum.prepend(parca); else document.querySelector('main').prepend(parca);
    }
    t.remove();
  }

  function basla() {
    serit();
    if (!secili.length) return;
    var CSS = ['reklam', 'reklam-demo', 'yayilim', 'nokta', 'klinik-koridor', 'firin', 'standart', 'diyetisyen-karti', 'besin-satiri'];
    var bekle = Promise.all(CSS.map(stil));
    var zaman = new Promise(function (t) { setTimeout(t, 2500); });
    Promise.race([bekle, zaman]).then(function () {
      var videolar = [];
      secili.forEach(function (t) { if (ac(t) === false) videolar.push(t); });
      videolar.forEach(video);
      /* Pop-up sıklığı: canlıda sunucu oturumu sayar; prototipte bu sekmenin oturumu (en az 2. sayfa, 4 sayfada bir) */
      var katman = document.querySelector('[data-rk-standart]');
      if (katman) {
        var n = 0;
        try { n = (+sessionStorage.getItem('dd-rk-sayfa') || 0) + 1; sessionStorage.setItem('dd-rk-sayfa', String(n)); } catch (e) { /* yok say */ }
        katman.dataset.rkSayfa = String(n);
        /* Canlıda çerez bandı açıkken standart biçimler basılmaz; yönetici önizlemesi (data-rk-cookie-exempt) bandın üstünde
           görünür kalır ve alt bant bandın üstüne çıkar (standart.js alignAltbar). Prototip önizlemesi yönetici önizlemesidir. */
        katman.setAttribute('data-rk-cookie-exempt', '1');
        if (istenen && istenen.indexOf('STD-POPUP') !== -1) katman.setAttribute('data-rk-popup-force', '');
      }
      var sira = Promise.resolve();
      var yukle = function (ad, kosul, modul) { if (kosul) sira = sira.then(function () { return betik(ad, modul); }); };
      yukle('nokta', document.querySelector('.rk-nk'));
      yukle('reklam', true);
      yukle('klinik-koridor', document.querySelector('.kk-koridor'));
      yukle('firin', document.querySelector('.rk-firin'));
      yukle('standart', document.querySelector('[data-rk-standart], [data-rk-video]'), true);
      sira.then(odakla);
    });
  }

  /* Tek alan: o alana kaydır; menü alanlarında ilk mega menü açılır */
  function odakla() {
    if (hepsi || !urlden) return;
    var kod = istenen[0];
    var el = document.getElementById('rk-' + kod);
    if (!el) return;
    var mega = el.closest('.nav-item');
    if (mega) { mega.classList.add('open'); return; }
    /* Mobilde menü hücreleri çekmecede: çekmece ve ilgili alt menü açılır */
    var cekmece = el.closest('.drawer');
    if (cekmece) {
      var h = document.getElementById('hamburger');
      if (h) h.click();
      var alt = el.closest('.d-item');
      var t = alt && alt.querySelector('.d-toggle');
      if (t && t.getAttribute('aria-expanded') !== 'true') setTimeout(function () { t.click(); }, 300);
      return;
    }
    if (el.closest('[data-rk-standart]')) return;
    /* Kapalı yüzeydeki alan kendi düğmesiyle açılır: sekme paneli (sekmesi), modal (data-ac), dialog (aria-controls) */
    var tikla = function (q) {
      var d = document.querySelector(q);
      if (d) { d.click(); setTimeout(function () { el.scrollIntoView({ block: 'center' }); }, 350); }
      return !!d;
    };
    var pano = el.closest('[role="tabpanel"][hidden]');
    if (pano && pano.id) tikla('[role="tab"][aria-controls="' + pano.id + '"]');
    var modal = el.closest('.modal-ortu[hidden]');
    if (modal && modal.id && tikla('[data-ac="#' + modal.id + '"]')) { el.classList.add('rk-vurgu'); return; }
    var dlg = el.closest('dialog:not([open])');
    if (dlg && dlg.id && tikla('[aria-controls="' + dlg.id + '"]')) { el.classList.add('rk-vurgu'); return; }
    /* Yatay kart rayındaki alan: ray o karta kayar */
    var ray = el.closest('.kart-ray');
    if (ray) ray.scrollLeft = el.offsetLeft - ray.offsetLeft;
    /* Koridor kapısı: kapının kartı açılır */
    if (el.tagName === 'DETAILS') setTimeout(function () { el.open = true; }, 400);
    var ust = document.querySelector('[data-site-header]');
    var git = function () {
      var pay = (ust ? ust.getBoundingClientRect().bottom : 0) + 72;
      scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY - pay), behavior: 'auto' });
    };
    git();
    /* Görseller yüklendikçe sayfa uzar: yükleme bitince bir kez daha */
    if (document.readyState !== 'complete') addEventListener('load', function () { setTimeout(git, 50); }); else setTimeout(git, 300);
    el.classList.add('rk-vurgu');
  }

  /* Kurgu markaların bağları dış siteye gitmez */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-rk-ornek]');
    if (!a) return;
    e.preventDefault();
    var m = 'Prototip örneği: canlıda bu bağlantı markanın sayfasını yeni sekmede açar.';
    if (window.DD && DD.toast) DD.toast(m); else alert(m);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();
