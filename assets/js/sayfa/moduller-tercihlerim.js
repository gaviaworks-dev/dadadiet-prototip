/* Tercihlerim: onboarding cevaplarının düzenlenmesi. Değişiklik demo.uye.tercihler'e yazılır, hedef yeniden hesaplanır. */
(function () {
  'use strict';
  const M = window.DDM, S = M.soru, U = window.DDU, kac = M.kac;
  const $ = (id) => document.getElementById(id);
  let t = S.tercih();
  DD.demo.kaydet();

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

  const satirHtml = (id) => {
    const s = SATIR[id]; if (s.kosul && !s.kosul()) return '';
    return '<div class="ayar-satir"><span class="as-ikon" aria-hidden="true"><i class="fa-solid ' + s.ikon + '"></i></span><div class="as-metin"><b>' + s.ad + '</b><span>' + kac(s.deger() || bos) + '</span></div><div class="as-eylem"><button class="dugme hayalet kucuk" type="button" data-duzenle="' + id + '" aria-label="' + s.ad + ' düzenle"><i class="fa-solid fa-pen" aria-hidden="true"></i> Düzenle</button></div></div>';
  };
  function hedefCiz() {
    const kap = $('gunlukHedef');
    if (!t.kcal) { kap.innerHTML = '<p class="kart-metin">' + (S.riskli(t) ? 'Bu dönemde günlük hedefini diyetisyeninle belirle.' : 'Ölçülerini ve aktiviteni tamamladığında günlük hedefin burada görünür.') + '</p>'; return; }
    kap.innerHTML = '<dl class="kunye iki-sutun"><div><dt>Kalori</dt><dd>' + enerjiYaz(t.kcal) + '</dd></div><div><dt>Protein</dt><dd>' + M.goster(t.protein, 'g', 0) + '</dd></div><div><dt>Karbonhidrat</dt><dd>' + M.goster(t.karb, 'g', 0) + '</dd></div><div><dt>Yağ</dt><dd>' + M.goster(t.yag, 'g', 0) + '</dd></div></dl>';
  }
  function ciz() {
    document.querySelectorAll('[data-kart]').forEach((k) => { k.innerHTML = KART[k.dataset.kart].map(satirHtml).join(''); });
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
  }
  function hesapYenile() {
    const r = S.hesapla(t);
    if (r) S.yaz(r.riskli ? { kcal: null, protein: null, karb: null, yag: null } : { kcal: r.hedefKcal, protein: r.protein, karb: r.karb, yag: r.yag, lif: r.lif, su_ml: r.suMl });
  }

  /* Düzenleme: sihirbazla aynı denetimler */
  let aktif = null;
  function alanHtml(id) {
    const s = SATIR[id];
    if (S.SAYI[id]) return S.sayiCiz(id, t[id]);
    if (id === 'ilk_ogun_saati') return S.saatCiz(t.ilk_ogun_saati);
    const h = id === 'hassasiyet' ? '<div class="uyari-kutu adim-not"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>' + kac(S.HASSASIYET_UYARI) + '</span></div>' : '';
    const gebe = S.riskli(t);
    return S.secenekCiz(id, s.coklu ? t[id] || [] : t[id], { etiket: s.ad, coklu: s.coklu, kapali: id === 'oruc_protokol' && gebe ? (x) => x.id !== 'yok' : null }) + h + '<span class="alan-hata" id="tercihHata"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> <span></span></span>';
  }
  function hataYaz(metin) { const e = $('tercihHata'); if (e) { e.classList.add('goster'); e.querySelector('span').textContent = metin; } }
  function kaydet() {
    const k = $('tercihModalGovde'), id = aktif;
    let v;
    if (S.SAYI[id]) {
      v = S.sayiOku(k, id);
      const hata = id === 'hedef_kilo_kg' ? S.hedefKiloHatasi(t, v) : S.sayiGecerli(id, v) ? null : S.SAYI[id].hata();
      S.hataGoster(k, id, hata);
      if (hata) return;
    } else if (id === 'ilk_ogun_saati') {
      v = k.querySelector('[data-alan="ilk_ogun_saati"]').value;
    } else {
      v = S.secimOku(k, id);
      if (SATIR[id].coklu ? !v.length && id !== 'hassasiyet' : v == null) { hataYaz('Kaydetmek için bir seçim yap.'); return; }
    }
    const ek = { [id]: v };
    if (id === 'hedef' && S.KILO_HEDEFI.includes(v) && !t.tempo) ek.tempo = 'dengeli';
    if (id === 'hassasiyet' && v.some((x) => S.RISKLI.includes(x))) ek.oruc_protokol = 'yok';
    if (id === 'oruc_protokol' && v !== 'yok' && !t.ilk_ogun_saati) ek.ilk_ogun_saati = '12:00';
    S.yaz(ek); hesapYenile(); ciz();
    DD.kapat($('tercihModal'));
    DD.toast(SATIR[id].ad + ' güncellendi.');
  }
  document.addEventListener('click', (e) => {
    const d = e.target.closest('[data-duzenle]');
    if (d) {
      aktif = d.dataset.duzenle;
      $('tercihModalBaslik').textContent = SATIR[aktif].ad;
      $('tercihModalGovde').innerHTML = alanHtml(aktif);
      DD.ac('#tercihModal');
    }
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
  document.addEventListener('dd:secim', (e) => {
    const g = e.target.closest && e.target.closest('[data-birim]');
    if (!g) return;
    const a = ayar(); a.bolge = a.bolge || {}; a.bolge[g.dataset.birim] = e.detail.deger; U.kaydet(); ciz();
    DD.toast('Birim tercihin kaydedildi.');
  });
  $('sifirlaOnay').addEventListener('change', (e) => { $('sifirla').disabled = !e.target.checked; });
  $('sifirla').addEventListener('click', () => {
    const u = S.uye();
    u.tercihler = { bicim: 2, boy_cm: t.boy_cm, kilo_kg: t.kilo_kg, kvkk_riza: false, hassasiyet: [] };
    t = u.tercihler; DD.demo.kaydet();
    $('sifirlaOnay').checked = false; $('sifirla').disabled = true;
    ciz(); DD.toast('Tercihlerin sıfırlandı.');
  });
  ciz();
})();
