/* Misafir deposu, kaydetme ve yumuşak kayıt daveti (Web Kullanıcı Akışı v1.0, K24.1).
   Misafire sert duvar yok. Ürettiği değer (tabak, test ya da hesap sonucu, hedef, favori besin, kaydedilen program)
   bu tarayıcıda tek anahtarda (`dd-misafir`) 24 saat tutulur; kayıt ya da girişte demo hesaba (DD.demo) aktarılır.
   Prototip: kayıt demo oturumu açar, hiçbir bilgi gönderilmez. Üründe aktarım ve Dada Mentor SSO arka uçtadır.

   API
   DD.misafir.ekle(tur, veri, anahtar)  tur: tabak | test | hesap | hedef | kaydet. Anahtar verilirse aynı kaydın yerine geçer.
   DD.misafir.sil(tur, anahtar), .var(tur, anahtar), .kayitlar(), .sayi(), .taslak(ad[, deger]), .aktar() → aktarılan sayı
   DD.kaydet.var(grup, slug), .degistir(grup, slug) → true eklendi / false çıkarıldı  (grup: besinler | programlar | rehberler | diyetisyenler)
   DD.davet.ac({ baslik, metin, sonra })  hızlı kayıt penceresi; sonra: kayıttan sonra gidilecek yol (kökten, ör. 'hesabim/')
   DD.davet.serit({ ikon, metin, dugme, davet, sonra })  .bilgi-notu.ortali davet şeridi HTML'i
   Bildirim: oturum açılınca document üzerinde 'dd:oturum' olayı ({ detail: { aktarilan } }).
   İşaretleme: [data-davet="Hook metni"][data-davet-metin][data-davet-sonra] misafirde pencereyi açar, üyede sonra yoluna gider.
               [data-kaydet="grup"][data-slug][data-etiket][data-etiket-tamam] iki durumlu kaydet düğmesi. */
(function () {
  'use strict';
  const DD = (window.DD = window.DD || {});
  const ANAHTAR = 'dd-misafir', BILDIRIM = 'dd-misafir-bildirim', OMUR = 24 * 3600 * 1000;
  const bos = () => ({ zaman: Date.now(), kayitlar: [], taslak: {} });
  const oku = () => {
    try {
      const v = JSON.parse(localStorage.getItem(ANAHTAR));
      if (v && Array.isArray(v.kayitlar) && Date.now() - (v.zaman || 0) < OMUR) return Object.assign(bos(), v);
    } catch (e) { /* gizli pencere ya da bozuk kayıt: boş depo */ }
    return bos();
  };
  let depo = oku();
  const yaz = () => { depo.zaman = Date.now(); try { localStorage.setItem(ANAHTAR, JSON.stringify(depo)); } catch (e) { /* bellekte kalır */ } };
  const kac = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ikon = (i) => '<i class="fa-solid ' + i + '" aria-hidden="true"></i>';
  const kok = () => DD.kok || './';
  /* Yalnız site içi göreli yol kabul edilir: dış adrese yönlendirme yok */
  const guvenliYol = (y) => (y && !/^[a-z]+:|^\/\/|\\/i.test(y) ? y.replace(/^\/+/, '') : '');
  const buSayfa = () => { const k = new URL(kok(), location.href).pathname; return location.pathname.slice(k.length) + location.search; };

  DD.misafir = {
    kayitlar: () => depo.kayitlar.slice(),
    sayi: () => depo.kayitlar.length,
    var: (tur, anahtar) => depo.kayitlar.some((x) => x.tur === tur && x.anahtar === anahtar),
    ekle(tur, veri, anahtar) {
      const k = { tur, veri, anahtar: anahtar == null ? null : String(anahtar), tarih: DD.bugun };
      const i = k.anahtar == null ? -1 : depo.kayitlar.findIndex((x) => x.tur === tur && x.anahtar === k.anahtar);
      if (i >= 0) depo.kayitlar[i] = k; else depo.kayitlar.push(k);
      yaz();
      return k;
    },
    sil(tur, anahtar) { depo.kayitlar = depo.kayitlar.filter((x) => !(x.tur === tur && x.anahtar === String(anahtar))); yaz(); },
    taslak(ad, deger) { if (arguments.length > 1) { if (deger == null) delete depo.taslak[ad]; else depo.taslak[ad] = deger; yaz(); } return depo.taslak[ad]; },
    /* Kayıtları demo hesaba yazar, depoyu boşaltır. Sayfa betikleri hesabım ekranlarının okuduğu alanlara yazar */
    aktar() {
      const l = depo.kayitlar;
      if (!l.length || !DD.demo) return 0;
      const d = DD.demo.al(), u = (d.uye = d.uye || {});
      l.forEach((k) => {
        const v = k.veri || {};
        if (k.tur === 'tabak') {
          d.uyeYerel = d.uyeYerel || {};
          const ek = (d.uyeYerel.gunlukEk = d.uyeYerel.gunlukEk || {});
          ek[DD.bugun] = (ek[DD.bugun] || []).concat((v.kalemler || []).map((x) => Object.assign({}, x, { ogun: v.ogun, kaynak: 'akilli-tabak' })));
        } else if (k.tur === 'test') (u.test_sonuclari = u.test_sonuclari || []).push(v);
        else if (k.tur === 'hesap') (u.hesaplayici_sonuclari = u.hesaplayici_sonuclari || []).push(v);
        else if (k.tur === 'hedef') { u.tercihler = u.tercihler || {}; if (v.kcal) u.tercihler.kcal = v.kcal; }
        else if (k.tur === 'kaydet') {
          const kd = (u.kaydedilenler = u.kaydedilenler || {}), g = (kd[v.grup] = kd[v.grup] || []);
          if (!g.includes(v.slug)) g.push(v.slug);
        }
      });
      DD.demo.kaydet();
      const n = l.length;
      depo = bos(); yaz();
      return n;
    },
  };
  const aktarimMetni = (n) => 'Misafirken kaydettiğin ' + n + ' kayıt hesabına aktarıldı.';
  /* Sayfa değişse de bildirim kaybolmasın: bir sonraki sayfa gösterir (60 saniye geçerli) */
  DD.misafir.bildir = (metin) => { try { sessionStorage.setItem(BILDIRIM, JSON.stringify({ metin, zaman: Date.now() })); } catch (e) { /* yok say */ } };
  DD.misafir.aktarimMetni = aktarimMetni;

  /* Kaydet: üyede demo hesabın kaydedilenleri, misafirde misafir deposu */
  DD.kaydet = {
    var(grup, slug) {
      if (DD.oturum && DD.oturum.acik()) { const kd = ((DD.demo.al().uye || {}).kaydedilenler || {})[grup] || []; return kd.includes(slug); }
      return DD.misafir.var('kaydet', grup + '|' + slug);
    },
    degistir(grup, slug) {
      const vardi = DD.kaydet.var(grup, slug);
      if (DD.oturum && DD.oturum.acik()) {
        const d = DD.demo.al(), u = (d.uye = d.uye || {}), kd = (u.kaydedilenler = u.kaydedilenler || {});
        kd[grup] = (kd[grup] || []).filter((x) => x !== slug);
        if (!vardi) kd[grup].push(slug);
        DD.demo.kaydet();
      } else if (vardi) DD.misafir.sil('kaydet', grup + '|' + slug);
      else DD.misafir.ekle('kaydet', { grup, slug }, grup + '|' + slug);
      return !vardi;
    },
  };

  /* Hızlı kayıt penceresi: e-posta, şifre, iki onay. Kanon .modal-ortu iskeleti */
  let sonraYol = '', gerekce = '';
  function pencere() {
    let o = document.getElementById('hizliKayit');
    if (o) return o;
    o = document.createElement('div');
    o.className = 'modal-ortu'; o.id = 'hizliKayit'; o.hidden = true;
    o.innerHTML = '<div class="modal-kutu" role="dialog" aria-modal="true" aria-labelledby="hizliKayitBaslik"><form class="modal-form" id="hizliKayitForm" novalidate>'
      + '<div class="modal-bas"><h2 id="hizliKayitBaslik">Ücretsiz Hesabını Oluştur</h2><button class="kapat-dugme" type="button" data-kapat aria-label="Kapat">' + ikon('fa-xmark') + '</button></div>'
      + '<div class="modal-govde yigin sik"><p class="kart-metin" id="hizliKayitMetin"></p><p class="sonuc-kayit" id="hizliKayitAktarim" hidden></p>'
      + '<div class="alan"><label class="alan-etiket" for="hkEposta">E-posta <span class="zorunlu" aria-hidden="true">*</span></label><input class="alan-girdi" id="hkEposta" type="email" placeholder="ornek@eposta.com" autocomplete="email" required aria-describedby="hkEpostaHata"><span class="alan-hata" id="hkEpostaHata">' + ikon('fa-circle-exclamation') + ' Geçerli bir e-posta adresi gir.</span></div>'
      + '<div class="alan"><label class="alan-etiket" for="hkSifre">Şifre <span class="zorunlu" aria-hidden="true">*</span></label><input class="alan-girdi" id="hkSifre" type="password" placeholder="En az 8 karakter" autocomplete="new-password" required aria-describedby="hkSifreHata"><span class="alan-hata" id="hkSifreHata">' + ikon('fa-circle-exclamation') + ' Şifre en az 8 karakter olmalı.</span></div>'
      + '<div class="onay-satirlari"><label class="onay-kutusu"><input type="checkbox" id="hkKosul" required><span><a href="' + kok() + 'yasal/kullanim-kosullari/">Kullanım Koşulları</a>\'nı kabul ediyorum. <span class="zorunlu">*</span></span></label><label class="onay-kutusu"><input type="checkbox" id="hkKvkk" required><span><a href="' + kok() + 'yasal/kvkk/">KVKK Aydınlatma Metni</a>\'ni okudum. <span class="zorunlu">*</span></span></label></div><span class="alan-hata" id="hkOnayHata">' + ikon('fa-circle-exclamation') + ' Devam etmek için iki onayı da işaretle.</span>'
      + '<div class="giris-ayrac">veya</div><button class="sosyal-dugme" type="button" data-mentor-sso>' + ikon('fa-compass') + ' Dada Mentor hesabınla devam et</button>'
      + '<p class="alan-yardim"><span>Dada Gastro, Dada Fit ya da Dada Gourmet hesabın varsa aynı hesapla Dada Diet profilini eşitlersin. Prototipte örnek akış: demo oturum açılır, gerçek eşitleme yapılmaz.</span></p></div>'
      + '<div class="modal-ayak-cubuk yayik"><a class="baglanti-metin" id="hizliKayitGiris" href="' + kok() + 'giris/">Zaten üye misin? Giriş yap</a><button class="dugme birincil" type="submit">' + ikon('fa-user-plus') + ' Hesabımı oluştur</button></div>'
      + '</form></div>';
    (document.getElementById('pageMain') || document.body).appendChild(o);
    o.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const ep = o.querySelector('#hkEposta'), sf = o.querySelector('#hkSifre');
      const h1 = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ep.value.trim()), h2 = sf.value.length < 8, h3 = !(o.querySelector('#hkKosul').checked && o.querySelector('#hkKvkk').checked);
      [[ep, h1, 'hkEpostaHata'], [sf, h2, 'hkSifreHata']].forEach(([g, h, id]) => { g.classList.toggle('hatali', h); g.setAttribute('aria-invalid', String(h)); o.querySelector('#' + id).classList.toggle('goster', h); });
      o.querySelector('#hkOnayHata').classList.toggle('goster', h3);
      if (h1 || h2 || h3) return;
      oturumAc();
    });
    o.querySelector('[data-mentor-sso]').addEventListener('click', oturumAc);
    return o;
  }
  function oturumAc() {
    DD.oturum.ac();
    const n = DD.misafir.aktar(), o = document.getElementById('hizliKayit');
    if (o) { o.querySelector('form').reset(); DD.kapat(o); }
    const metin = n ? aktarimMetni(n) : 'Hesabın açıldı.';
    document.dispatchEvent(new CustomEvent('dd:oturum', { detail: { aktarilan: n, gerekce } }));
    if (sonraYol) { DD.misafir.bildir(metin); location.href = kok() + sonraYol; return; }
    DD.toast(metin);
  }
  DD.davet = {
    ac({ baslik, metin, sonra } = {}) {
      const o = pencere();
      sonraYol = guvenliYol(sonra || '');
      gerekce = baslik || '';
      o.querySelector('#hizliKayitBaslik').textContent = 'Ücretsiz Hesabını Oluştur';
      o.querySelector('#hizliKayitMetin').textContent = metin || 'Kaydolunca sonuçların, tabakların ve kayıtların hesabında kalır; gelişimini zaman içinde izlersin.';
      const n = DD.misafir.sayi(), ak = o.querySelector('#hizliKayitAktarim');
      ak.hidden = !n;
      ak.innerHTML = ikon('fa-box-archive') + '<span>Misafirken kaydettiğin ' + n + ' kayıt hesabına aktarılacak.</span>';
      o.querySelector('#hizliKayitGiris').href = kok() + 'giris/?donus=' + encodeURIComponent(sonraYol || buSayfa());
      DD.ac(o);
    },
    serit({ ikon: i = 'fa-user-plus', metin, dugme, davet, sonra = '', dugmeIkon = 'fa-bookmark' }) {
      return '<div class="bilgi-notu ortali davet-serit">' + ikon(i) + '<p>' + metin + '</p><button class="dugme birincil kucuk" type="button" data-davet="' + kac(dugme) + '"' + (davet ? ' data-davet-metin="' + kac(davet) + '"' : '') + (sonra ? ' data-davet-sonra="' + kac(sonra) + '"' : '') + '>' + ikon(dugmeIkon) + ' ' + kac(dugme) + '</button></div>';
    },
    guvenliYol,
  };

  /* Kaydet düğmesi: iki durumlu, etiket ve ikon durumla değişir */
  const kaydetCiz = (b) => {
    const v = DD.kaydet.var(b.dataset.kaydet, b.dataset.slug);
    b.setAttribute('aria-pressed', String(v));
    b.innerHTML = ikon(v ? 'fa-circle-check' : (b.dataset.ikon || 'fa-bookmark')) + ' ' + kac(v ? (b.dataset.etiketTamam || 'Kaydedildi') : b.dataset.etiket);
  };
  const kaydetHepsi = () => document.querySelectorAll('[data-kaydet][data-slug]').forEach(kaydetCiz);

  document.addEventListener('click', (e) => {
    const k = e.target.closest('[data-kaydet][data-slug]');
    if (k) {
      e.preventDefault();
      const eklendi = DD.kaydet.degistir(k.dataset.kaydet, k.dataset.slug);
      kaydetHepsi();
      const ad = k.dataset.ad || 'Kayıt';
      if (DD.oturum.acik()) { DD.toast(eklendi ? ad + ' ' + (k.dataset.tamamMetin || 'kaydedilenlerine eklendi.') : ad + ' kaydedilenlerinden çıkarıldı.', eklendi ? '' : 'uyari'); return; }
      if (!eklendi) { DD.toast(ad + ' bu tarayıcıdaki listenden çıkarıldı.', 'uyari'); return; }
      DD.davet.ac({ baslik: k.dataset.etiket, metin: ad + ' bu tarayıcıda tutuluyor. Kaydolunca hesabındaki kaydedilenlere aktarılır; her cihazdan ulaşırsın.' });
      return;
    }
    const d = e.target.closest('[data-davet]');
    if (!d) return;
    e.preventDefault();
    const sonra = d.dataset.davetSonra || '';
    if (DD.oturum.acik()) { if (sonra) location.href = kok() + guvenliYol(sonra); return; }
    DD.davet.ac({ baslik: d.dataset.davet, metin: d.dataset.davetMetin, sonra });
  });
  document.addEventListener('dd:oturum', kaydetHepsi);

  function basla() {
    kaydetHepsi();
    /* Başka yoldan (üst menüdeki Giriş, sosyal düğme) oturum açıldıysa bekleyen kayıtlar burada aktarılır */
    if (DD.oturum && DD.oturum.acik() && DD.misafir.sayi()) DD.toast(aktarimMetni(DD.misafir.aktar()));
    try {
      const b = JSON.parse(sessionStorage.getItem(BILDIRIM));
      sessionStorage.removeItem(BILDIRIM);
      if (b && Date.now() - b.zaman < 60000) DD.toast(b.metin);
    } catch (e) { /* yok say */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();
