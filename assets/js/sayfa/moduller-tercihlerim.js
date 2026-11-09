/* Tercihlerim: onboarding cevaplarının düzenlenmesi. Değişiklik demo.uye.tercihler'e yazılır, hedef yeniden hesaplanır. */
(function () {
  'use strict';
  const M = window.DDM, S = M.soru, U = window.DDU, kac = M.kac;
  const $ = (id) => document.getElementById(id);
  const t = S.tercih();
  DD.demo.kaydet();
  /* T1 kök neden: pencere #pageMain'in çocuğuydu. #pageMain kabukta kendi yığın bağlamını kurar (kabuk.css .page-main z-index:2)
     ve footer perdesi ona göre katmanlanır; pencerenin ortada ve her şeyin önünde durması html:has(#pageMain .modal-ortu) yamasına
     ve footer'ın açılışta sticky'den static'e dönmesine bağlıydı. Pencere gövdeye taşınınca kök yığın bağlamında --kat-ortu ile durur. */
  document.querySelectorAll('#pageMain > .modal-ortu').forEach((m) => document.body.appendChild(m));

  const ayar = () => U.yerel('ayarlar', {});
  const birim = (ad, varsay) => (ayar().bolge && ayar().bolge[ad]) || varsay;
  const lb = () => birim('agirlik', '').startsWith('Pound');
  const inc = () => birim('boy', '').startsWith('İnç');
  const kj = () => birim('enerji', '').startsWith('Kilojul');
  const kiloYaz = (v) => (lb() ? M.sayi(v * 2.20462, 1) + ' lb' : M.sayi(v, 1) + ' kg');
  const boyYaz = (v) => (inc() ? M.sayi(v / 2.54, 1) + ' inç' : M.sayi(v, 0) + ' cm');
  const enerjiYaz = (v) => (kj() ? M.sayi(v * 4.184, 0) + ' kJ' : M.sayi(v, 0) + ' kcal');
  const bos = 'Henüz seçilmedi';

  const liste = (alan, v) => (v && v.length ? v.map((x) => S.etiket(alan, x)).filter(Boolean).join(', ') : null);
  const SATIR = {
    hedef: { ad: 'Hedef', ikon: 'fa-bullseye', deger: () => S.etiket('hedef', t.hedef) },
    tempo: { ad: 'Tempo', ikon: 'fa-gauge', kosul: () => S.kiloHedefli(t), deger: () => { const x = S.bul('tempo', t.tempo); return x ? x.ad + ' · ' + x.alt : null; } },
    hedef_kilo_kg: { ad: 'Hedef kilo', ikon: 'fa-flag', kosul: () => S.kiloHedefli(t), deger: () => (t.hedef_kilo_kg ? kiloYaz(t.hedef_kilo_kg) : null) },
    cinsiyet: { ad: 'Cinsiyet', ikon: 'fa-venus-mars', deger: () => S.etiket('cinsiyet', t.cinsiyet) },
    dogum_yili: { ad: 'Doğum yılı', ikon: 'fa-cake-candles', deger: () => (t.dogum_yili ? t.dogum_yili + ' · ' + S.yas(t) + ' yaş' : null) },
    boy_cm: { ad: 'Boy', ikon: 'fa-ruler-vertical', deger: () => (t.boy_cm ? boyYaz(t.boy_cm) : null) },
    kilo_kg: { ad: 'Güncel kilo', ikon: 'fa-weight-scale', deger: () => (t.kilo_kg ? kiloYaz(t.kilo_kg) : null) },
    aktivite: { ad: 'Aktivite', ikon: 'fa-person-walking', deger: () => S.etiket('aktivite', t.aktivite) },
    beslenme_tarzi: { ad: 'Beslenme tarzı', ikon: 'fa-seedling', coklu: true, deger: () => liste('beslenme_tarzi', t.beslenme_tarzi) },
    ogun_sayisi: { ad: 'Günlük öğün sayısı', ikon: 'fa-utensils', deger: () => (t.ogun_sayisi ? t.ogun_sayisi + ' öğün' : null) },
    oruc_protokol: { ad: 'Aralıklı oruç', ikon: 'fa-hourglass-half', deger: () => (!t.oruc_protokol || t.oruc_protokol === 'yok' ? 'Oruç istemiyorum' : S.etiket('oruc_protokol', t.oruc_protokol)) },
    ilk_ogun_saati: { ad: 'İlk öğün saati', ikon: 'fa-clock', kosul: () => t.oruc_protokol && t.oruc_protokol !== 'yok', deger: () => t.ilk_ogun_saati },
    hassasiyet: { ad: 'Hassasiyet ve kronik durum', ikon: 'fa-shield-halved', coklu: true, kosul: () => t.kvkk_riza, deger: () => liste('hassasiyet', t.hassasiyet) },
  };
  const KART = { hedef: ['hedef', 'tempo', 'hedef_kilo_kg'], olcu: ['cinsiyet', 'dogum_yili', 'boy_cm', 'kilo_kg', 'aktivite'], ritim: ['beslenme_tarzi', 'ogun_sayisi', 'oruc_protokol', 'ilk_ogun_saati'], saglik: ['hassasiyet'] };
  /* T3: her grup tek pencerede düzenlenir; pencere başlığı grubun adıdır */
  const GRUP_AD = { hedef: 'Hedefin', olcu: 'Ölçülerin ve Hareketin', ritim: 'Beslenme ve Öğün Ritmin', saglik: 'Hassasiyet ve Kronik Durum' };

  /* T2: değerler kısa künye; ad ile değer yan yana, grubun Düzenle ikon düğmesi kart başlığında */
  const kunyeHtml = (grup) => '<dl class="kunye oto">' + KART[grup].filter((id) => !SATIR[id].kosul || SATIR[id].kosul()).map((id) => '<div><dt>' + SATIR[id].ad + '</dt><dd>' + kac(SATIR[id].deger() || bos) + '</dd></div>').join('') + '</dl>';
  const saglikSatir = () => '<div class="ayar-satir"><span class="as-ikon" aria-hidden="true"><i class="fa-solid ' + SATIR.hassasiyet.ikon + '"></i></span><div class="as-metin"><b>' + SATIR.hassasiyet.ad + '</b><span>' + kac(SATIR.hassasiyet.deger() || bos) + '</span></div><div class="as-eylem"><button class="ikon-dugme" type="button" data-grup-duzenle="saglik" aria-label="Düzenle"><i class="fa-solid fa-pen" aria-hidden="true"></i></button></div></div>';
  function hedefCiz() {
    const kap = $('gunlukHedef');
    U.gizle($('gunlukHedefKart'), U.yemeDuyarli());
    if (U.yemeDuyarli()) { kap.innerHTML = ''; return; }
    if (!t.kcal) { kap.innerHTML = '<p class="kart-metin">' + (S.riskli(t) ? 'Bu dönemde günlük hedefini diyetisyeninle belirle.' : 'Ölçülerini ve aktiviteni tamamladığında günlük hedefin burada görünür.') + '</p>'; return; }
    kap.innerHTML = '<dl class="kunye iki-sutun"><div><dt>Kalori</dt><dd>' + enerjiYaz(t.kcal) + '</dd></div><div><dt>Protein</dt><dd>' + M.goster(t.protein, 'g', 0) + '</dd></div><div><dt>Karbonhidrat</dt><dd>' + M.goster(t.karb, 'g', 0) + '</dd></div><div><dt>Yağ</dt><dd>' + M.goster(t.yag, 'g', 0) + '</dd></div></dl>';
  }
  /* Yeme bozukluğu öyküsü seçilince hedef ve enerji satırları kalkar; seçim kaldırılınca geri gelir */
  function duyarliCiz() {
    const d = U.yemeDuyarli();
    U.gizle($('tercihGirisHedef'), d);
    $('tercihOlcuMetin').textContent = d ? 'Önerilerin bu değerlere göre uyarlanır.' : 'Enerji ihtiyacın bu değerlerle hesaplanır.';
    U.gizle($('birim-enerji'), d);
    $('birim-agirlik').querySelector('.as-metin span').textContent = d ? 'Kilonda kullanılır.' : 'Kilon ve hedef kilonda kullanılır.';
    U.ozet();
  }
  function ciz() {
    document.querySelectorAll('[data-kart]').forEach((k) => {
      const g = k.dataset.kart, uzman = g === 'hedef' && U.yemeDuyarli();
      k.innerHTML = uzman ? '<div class="ayar-liste">' + U.uzmanSatir() + '</div>' : g === 'saglik' ? (t.kvkk_riza ? saglikSatir() : '') : kunyeHtml(g);
      /* Yeme bozukluğu öyküsünde hedef uzmanla kurulur; hedef grubunun Düzenle düğmesi kalkar */
      if (g === 'hedef') U.gizle(document.querySelector('[data-grup-duzenle="hedef"]'), uzman);
    });
    duyarliCiz();
    const riza = $('rizaAnahtar'); riza.checked = Boolean(t.kvkk_riza);
    const sag = document.querySelector('[data-kart="saglik"]');
    if (!t.kvkk_riza) sag.innerHTML = '<div class="ayar-satir"><span class="as-ikon" aria-hidden="true"><i class="fa-solid fa-lock"></i></span><div class="as-metin"><b>Hassasiyet ve kronik durum</b><span>Onay vermediğin için bu bilgi kullanılmıyor.</span></div></div>';
    hedefCiz();
    document.querySelectorAll('[data-birim]').forEach((g) => {
      const secili = birim(g.dataset.birim, g.querySelector('button').dataset.deger);
      g.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === secili)));
    });
    const b = ayar().bildirim || {};
    document.querySelectorAll('[data-bildirim]').forEach((g) => { if (g.dataset.bildirim in b) g.checked = Boolean(b[g.dataset.bildirim]); });
    hatirlatmaCiz();
  }
  /* Su hatırlatması: uye.su.hatirlatma. Anahtar kapalıyken sessiz saatler pasiftir */
  const hatirlatma = () => { const s = U.uye().su; s.hatirlatma = s.hatirlatma || { acik: false, sessiz_bas: '23:00', sessiz_bit: '08:00' }; return s.hatirlatma; };
  function hatirlatmaCiz() {
    const h = hatirlatma(), bas = $('suSessizBas'), bit = $('suSessizBit');
    $('suHatirlatma').checked = h.acik;
    bas.value = h.sessiz_bas; bit.value = h.sessiz_bit;
    bas.disabled = bit.disabled = !h.acik;
    $('suSessizMetin').textContent = 'Saat başı hatırlatır; ' + DD.bicim.saat(h.sessiz_bas) + '–' + DD.bicim.saat(h.sessiz_bit) + ' arası sessizdir.';
  }
  function hesapYenile() {
    const r = S.hesapla(t);
    if (r) S.yaz(r.riskli ? { kcal: null, protein: null, karb: null, yag: null } : { kcal: r.hedefKcal, protein: r.protein, karb: r.karb, yag: r.yag, lif: r.lif, su_ml: r.suMl });
  }

  /* Düzenleme: sihirbazla aynı denetimler, bir grubun bütün alanları tek pencerede */
  let aktif = null;
  const kap = () => $('tercihModalGovde');
  /* Penceredeki seçim henüz kaydedilmedi; koşullu alanlar (tempo, hedef kilo, ilk öğün saati) bu geçici değere göre açılır */
  function gecici() {
    const k = kap(), g = Object.assign({}, t);
    ['hedef', 'oruc_protokol', 'hassasiyet'].forEach((id) => { const v = S.secimOku(k, id); if (v !== undefined && v !== null) g[id] = v; });
    return g;
  }
  const KOSUL = { tempo: (g) => S.kiloHedefli(g), hedef_kilo_kg: (g) => S.kiloHedefli(g), ilk_ogun_saati: (g) => g.oruc_protokol && g.oruc_protokol !== 'yok' };
  function kosulUygula() {
    const g = gecici();
    kap().querySelectorAll('[data-tercih-alan]').forEach((e) => { const f = KOSUL[e.dataset.tercihAlan]; U.gizle(e, Boolean(f && !f(g))); });
  }
  function alanHtml(id) {
    const s = SATIR[id];
    if (S.SAYI[id]) return S.sayiCiz(id, t[id]);
    if (id === 'ilk_ogun_saati') return S.saatCiz(t.ilk_ogun_saati);
    const h = id === 'hassasiyet' ? '<div class="uyari-kutu adim-not"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>' + kac(S.HASSASIYET_UYARI) + '</span></div>' : '';
    const gebe = S.riskli(t);
    return '<div class="alan"><span class="alan-etiket">' + s.ad + '</span>' + S.secenekCiz(id, s.coklu ? t[id] || [] : t[id], { etiket: s.ad, coklu: s.coklu, kapali: id === 'oruc_protokol' && gebe ? (x) => x.id !== 'yok' : null }) + h + '<span class="alan-hata" data-hata="' + id + '"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> <span></span></span></div>';
  }
  /* Ardışık sayı alanları tek ızgarada yan yana durur (doğum yılı, boy, kilo) */
  function grupHtml(grup) {
    const l = KART[grup], parca = [];
    for (let i = 0; i < l.length; i++) {
      if (S.SAYI[l[i]]) {
        const sira = [];
        while (i < l.length && S.SAYI[l[i]]) sira.push(l[i++]);
        i--;
        parca.push('<div class="alan-izgara c' + Math.max(2, sira.length) + '">' + sira.map((id) => '<div data-tercih-alan="' + id + '">' + alanHtml(id) + '</div>').join('') + '</div>');
      } else parca.push('<div data-tercih-alan="' + l[i] + '">' + alanHtml(l[i]) + '</div>');
    }
    return '<div class="yigin">' + parca.join('') + '</div>';
  }
  function kaydet() {
    const k = kap(), alanlar = KART[aktif].filter((id) => !k.querySelector('[data-tercih-alan="' + id + '"]').hidden);
    const ek = {};
    let ilkHata = null;
    alanlar.forEach((id) => {
      let v, hata = null;
      if (S.SAYI[id]) {
        v = S.sayiOku(k, id);
        hata = id === 'hedef_kilo_kg' ? null : S.sayiGecerli(id, v) ? null : S.SAYI[id].hata();
      } else if (id === 'ilk_ogun_saati') {
        v = k.querySelector('[data-alan="ilk_ogun_saati"]').value;
      } else {
        v = S.secimOku(k, id);
        if (SATIR[id].coklu ? !v.length && id !== 'hassasiyet' : v == null) hata = 'Kaydetmek için bir seçim yap.';
      }
      ek[id] = v;
      S.hataGoster(k, id, hata);
      if (hata && !ilkHata) ilkHata = id;
    });
    /* Hedef kilo güncel kiloya ve hedefe göre denetlenir; ikisi aynı pencerede değişmiş olabilir */
    if ('hedef_kilo_kg' in ek) { const h = S.hedefKiloHatasi(Object.assign({}, t, ek), ek.hedef_kilo_kg); S.hataGoster(k, 'hedef_kilo_kg', h); if (h && !ilkHata) ilkHata = 'hedef_kilo_kg'; }
    if (ilkHata) { const e = k.querySelector('[data-tercih-alan="' + ilkHata + '"]'); e.scrollIntoView({ block: 'nearest' }); (e.querySelector('input,button') || e).focus(); return; }
    if (ek.hedef && S.KILO_HEDEFI.includes(ek.hedef) && !t.tempo && !ek.tempo) ek.tempo = 'dengeli';
    if (ek.hassasiyet && ek.hassasiyet.some((x) => S.RISKLI.includes(x))) ek.oruc_protokol = 'yok';
    if (ek.oruc_protokol && ek.oruc_protokol !== 'yok' && !t.ilk_ogun_saati && !ek.ilk_ogun_saati) ek.ilk_ogun_saati = '12:00';
    S.yaz(ek); hesapYenile(); ciz();
    DD.kapat($('tercihModal'));
    DD.toast(GRUP_AD[aktif] + ' güncellendi.');
  }
  document.addEventListener('click', (e) => {
    const d = e.target.closest('[data-grup-duzenle]');
    if (d) {
      aktif = d.dataset.grupDuzenle;
      $('tercihModalBaslik').textContent = GRUP_AD[aktif];
      kap().innerHTML = grupHtml(aktif);
      kosulUygula();
      DD.ac('#tercihModal');
      return;
    }
    if (e.target.closest('#tercihModalGovde [data-alan] > button')) setTimeout(kosulUygula);
  });
  $('tercihKaydet').addEventListener('click', kaydet);

  $('rizaAnahtar').addEventListener('change', (e) => {
    const ac = e.target.checked;
    S.yaz(ac ? { kvkk_riza: true, kvkk_riza_tarih: DD.bugun } : { kvkk_riza: false, kvkk_riza_tarih: null, hassasiyet: [] });
    hesapYenile(); ciz();
    DD.toast(ac ? 'Açık rızan kaydedildi.' : 'Açık rızan geri alındı, hassasiyet bilgilerin silindi.', ac ? undefined : 'uyari');
  });
  document.addEventListener('change', (e) => {
    const b = e.target.closest('[data-bildirim]');
    if (!b) return;
    const a = ayar(); a.bildirim = a.bildirim || {}; a.bildirim[b.dataset.bildirim] = b.checked; U.kaydet();
    DD.toast('Bildirim tercihin kaydedildi.');
  });
  $('suHatirlatma').addEventListener('change', (e) => {
    hatirlatma().acik = e.target.checked; U.kaydet(); hatirlatmaCiz();
    DD.toast(e.target.checked ? 'Su hatırlatması açıldı.' : 'Su hatırlatması kapatıldı.');
  });
  [['suSessizBas', 'sessiz_bas'], ['suSessizBit', 'sessiz_bit']].forEach(([id, alan]) => $(id).addEventListener('change', (e) => {
    const h = hatirlatma();
    if (e.target.value === h[alan === 'sessiz_bas' ? 'sessiz_bit' : 'sessiz_bas']) { hatirlatmaCiz(); DD.toast('Başlangıç ve bitiş saati aynı olamaz.', 'hata'); return; }
    h[alan] = e.target.value; U.kaydet(); hatirlatmaCiz();
    DD.toast('Sessiz saatlerin kaydedildi.');
  }));
  document.addEventListener('dd:secim', (e) => {
    const g = e.target.closest && e.target.closest('[data-birim]');
    if (!g) return;
    const a = ayar(); a.bolge = a.bolge || {}; a.bolge[g.dataset.birim] = e.detail.deger; U.kaydet(); ciz();
    DD.toast('Birim tercihin kaydedildi.');
  });
  ciz();
})();
