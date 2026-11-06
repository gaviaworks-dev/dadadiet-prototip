/* Onboarding soru seti ve hesaplar. Mobil (dadadiet-mobil/veri/onboarding.js) ile aynı kimlikler; sihirbaz ve Tercihlerim tek kaynak. */
(function () {
  'use strict';
  const M = window.DDM, kac = M.kac;
  const S = (M.soru = {});

  S.KILO_HEDEFI = ['kilo-vermek', 'kas-kazanmak'];
  /* Bu seçimler kalori sayısı üretmez, uzmana yönlendirir. Set mobille aynı kalsın diye yalnız burada genişler */
  S.RISKLI = ['gebelik'];
  S.riskli = (t) => (t.hassasiyet || []).some((x) => S.RISKLI.includes(x));
  S.SECENEK = {
    hedef: [
      { id: 'kilo-vermek', ad: 'Kilo vermek', ikon: 'fa-weight-scale', alt: 'Sağlıklı bir hızla hedefe in' },
      { id: 'formu-korumak', ad: 'Formumu korumak', ikon: 'fa-scale-balanced', alt: 'Bugünkü dengemi sürdüreyim' },
      { id: 'kas-kazanmak', ad: 'Kas kazanmak', ikon: 'fa-dumbbell', alt: 'Protein ve toparlanma odaklı' },
      { id: 'sikilasmak', ad: 'Sıkılaşmak', ikon: 'fa-person-running', alt: 'Yağ oranını azalt, kası koru' },
      { id: 'oruc-aliskanligi', ad: 'Aralıklı oruç alışkanlığı', ikon: 'fa-hourglass-half', alt: 'Öğünlerimi bir pencereye toplayayım' },
      { id: 'saglikli-yasam', ad: 'Sağlıklı yaşam', ikon: 'fa-heart-pulse', alt: 'Daha dengeli beslenmek istiyorum' },
    ],
    cinsiyet: [{ id: 'kadin', ad: 'Kadın', ikon: 'fa-venus' }, { id: 'erkek', ad: 'Erkek', ikon: 'fa-mars' }],
    tempo: [
      { id: 'yavas', ad: 'Yavaş', ikon: 'fa-feather', alt: 'Haftada ~0,25 kg', kcal: 250, kg: 0.25 },
      { id: 'dengeli', ad: 'Dengeli', ikon: 'fa-scale-balanced', alt: 'Haftada ~0,3 kg', kcal: 300, kg: 0.3, onerilen: true },
      { id: 'hizli', ad: 'Hızlı', ikon: 'fa-bolt', alt: 'Haftada ~0,5 kg', kcal: 500, kg: 0.5 },
    ],
    aktivite: [
      { id: 'hareketsiz', ad: 'Masa başı', ikon: 'fa-couch', alt: 'Az yürüyüş, çoğunlukla oturarak', katsayi: 1.2 },
      { id: 'hafif', ad: 'Hafif aktif', ikon: 'fa-person-walking', alt: 'Haftada 1-3 gün hareket', katsayi: 1.375 },
      { id: 'orta', ad: 'Orta aktif', ikon: 'fa-person-running', alt: 'Haftada 3-5 gün spor', katsayi: 1.55 },
      { id: 'cok', ad: 'Çok aktif', ikon: 'fa-dumbbell', alt: 'Haftada 6-7 gün spor', katsayi: 1.725 },
    ],
    beslenme_tarzi: [
      { id: 'standart', ad: 'Standart', ikon: 'fa-utensils', tek: true },
      { id: 'akdeniz', ad: 'Akdeniz', ikon: 'fa-fish' },
      { id: 'vejetaryen', ad: 'Vejetaryen', ikon: 'fa-carrot' },
      { id: 'vegan', ad: 'Vegan', ikon: 'fa-seedling' },
      { id: 'ketojenik', ad: 'Ketojenik', ikon: 'fa-bacon' },
      { id: 'glutensiz', ad: 'Glütensiz', ikon: 'fa-wheat-awn-circle-exclamation' },
      { id: 'laktozsuz', ad: 'Laktozsuz', ikon: 'fa-glass-water' },
      { id: 'yuksek-protein', ad: 'Yüksek protein', ikon: 'fa-egg' },
    ],
    hassasiyet: [
      { id: 'diyabet', ad: 'Diyabet', ikon: 'fa-droplet' },
      { id: 'insulin-direnci', ad: 'İnsülin direnci', ikon: 'fa-syringe' },
      { id: 'tiroid', ad: 'Tiroid', ikon: 'fa-shield-halved' },
      { id: 'hipertansiyon', ad: 'Hipertansiyon', ikon: 'fa-heart-pulse' },
      { id: 'kolesterol', ad: 'Yüksek kolesterol', ikon: 'fa-heart' },
      { id: 'pcos', ad: 'PCOS', ikon: 'fa-venus' },
      { id: 'gebelik', ad: 'Gebelik ya da emzirme', ikon: 'fa-baby' },
      { id: 'alerji', ad: 'Besin alerjisi', ikon: 'fa-shield-halved' },
      { id: 'yok', ad: 'Yok', ikon: 'fa-circle-check', tek: true },
    ],
    ogun_sayisi: [2, 3, 4, 5].map((n) => ({ id: n, ad: n + ' öğün', ikon: 'fa-utensils' })),
    oruc_protokol: [
      { id: 'yok', ad: 'Oruç istemiyorum', ikon: 'fa-utensils', alt: 'Üç öğün düzeni' },
      { id: '12-12', ad: '12:12', ikon: 'fa-moon', alt: 'Yumuşak başlangıç' },
      { id: '14-10', ad: '14:10', ikon: 'fa-clock', alt: 'Kolay' },
      { id: '16-8', ad: '16:8', ikon: 'fa-hourglass-half', alt: 'En çok tercih edilen' },
      { id: '18-6', ad: '18:6', ikon: 'fa-stopwatch', alt: 'İleri' },
    ],
  };
  /* Rehberin ek protokolleri Tercihlerim'de okunur */
  const EK_PROTOKOL = { '20-4': '20:4 / OMAD', sirkadiyen: 'Sirkadiyen' };

  S.RIZA = 'Boy, kilo, beslenme ve sağlık bilgilerimin, bana özel beslenme önerileri sunulması amacıyla Dada Diet tarafından işlenmesine açık rıza veriyorum.';
  S.RIZA_DETAY = 'Kişisel sağlık verilerin yalnız belirtilen amaç ve gerekli izin kapsamında işlenir. Rızanı Veri İzinlerim ekranından dilediğin an geri alabilirsin.';
  S.HASSASIYET_UYARI = 'Gebelik, kronik hastalık ya da düzenli ilaç kullanımı varsa plana başlamadan önce hekimine ve diyetisyenine danış. Yeme bozukluğu öyküsün varsa planını bir uzmanla kur.';

  /* Sayısal alan sınırları mobil ile aynı */
  const YIL = () => Number(String((window.DD && DD.bugun) || '2026-11-06').slice(0, 4));
  S.SAYI = {
    dogum_yili: { etiket: 'Doğum yılın', birim: '', mod: 'numeric', min: () => YIL() - 80, max: () => YIL() - 18, adim: 1, yer: '1990', hata: () => 'Dada Diet 18 yaş ve üzeri içindir. ' + (YIL() - 80) + ' ile ' + (YIL() - 18) + ' arasında bir yıl yaz.' },
    boy_cm: { etiket: 'Boyun', birim: 'cm', mod: 'numeric', min: () => 140, max: () => 210, adim: 1, yer: '165', hata: () => 'Boyunu 140 ile 210 cm arasında yaz.' },
    kilo_kg: { etiket: 'Güncel kilon', birim: 'kg', min: () => 40, max: () => 180, adim: 0.1, yer: '72', hata: () => 'Kilonu 40 ile 180 kg arasında yaz.' },
    hedef_kilo_kg: { etiket: 'Hedef kilon', birim: 'kg', min: () => 40, max: () => 180, adim: 0.1, yer: '66', hata: () => 'Hedef kilonu 40 ile 180 kg arasında yaz.' },
  };

  /* ── Kayıt: demo.uye.tercihler ──────────────────────────────────────────── */
  S.uye = () => { const d = DD.demo.al(); d.uye = d.uye || {}; return d.uye; };
  /* Eski demo kaydı bir kez ortak sete çevrilir; ölçüler panelin gördüğü danışan kaydından gelir */
  S.tercih = () => {
    const u = S.uye(); const t = (u.tercihler = u.tercihler || {});
    if (t.bicim === 2) return t;
    const d = DD.demo.al(), dn = (d.danisanlar || []).find((x) => x.id === u.danisan_id);
    if (t.hedef === 'kilo') t.hedef = 'kilo-vermek';
    if (typeof t.beslenme_tarzi === 'string') t.beslenme_tarzi = [t.beslenme_tarzi];
    if (dn) {
      if (t.boy_cm == null) t.boy_cm = dn.boy;
      if (t.kilo_kg == null) t.kilo_kg = dn.kilo;
      if (t.hedef_kilo_kg == null) t.hedef_kilo_kg = dn.hedef_kilo;
      if (t.dogum_yili == null && dn.yas) t.dogum_yili = YIL() - dn.yas;
      if (t.cinsiyet == null) t.cinsiyet = dn.cinsiyet === 'erkek' ? 'erkek' : dn.cinsiyet ? 'kadin' : null;
      if (t.kvkk_riza == null) t.kvkk_riza = Boolean(dn.izinler && dn.izinler.anamnez);
      if (t.hassasiyet == null) t.hassasiyet = (dn.hassasiyetler && dn.hassasiyetler.length) ? ['alerji'] : ['yok'];
    }
    t.bicim = 2;
    return t;
  };
  S.yaz = (alanlar) => { Object.assign(S.tercih(), alanlar); DD.demo.kaydet(); };

  S.kiloHedefli = (t) => S.KILO_HEDEFI.includes(t.hedef);
  S.bul = (alan, id) => (S.SECENEK[alan] || []).find((x) => String(x.id) === String(id)) || null;
  S.etiket = (alan, id) => { if (alan === 'oruc_protokol' && EK_PROTOKOL[id]) return EK_PROTOKOL[id]; const x = S.bul(alan, id); return x ? x.ad : null; };

  /* ── Hesap ──────────────────────────────────────────────────────────────── */
  const EN_AZ = 1200;
  S.saglikliAralik = (boy_cm) => { const m = boy_cm / 100; return [Math.ceil(18.5 * m * m), Math.floor(24.9 * m * m)]; };
  S.yas = (t) => YIL() - t.dogum_yili;
  S.hesapla = function (t) {
    if (!t.cinsiyet || !t.dogum_yili || !t.boy_cm || !t.kilo_kg || !t.aktivite) return null;
    const bazal = 10 * t.kilo_kg + 6.25 * t.boy_cm - 5 * S.yas(t) + (t.cinsiyet === 'erkek' ? 5 : -161);
    const gunluk = bazal * S.bul('aktivite', t.aktivite).katsayi;
    const riskli = S.riskli(t);
    const tempo = S.kiloHedefli(t) ? S.bul('tempo', t.tempo) : null;
    const yon = t.hedef === 'kas-kazanmak' ? 1 : -1;
    const fark = tempo && !riskli ? yon * tempo.kcal : 0;
    const ham = gunluk + fark, hedefKcal = Math.max(EN_AZ, M.yuvarla(ham, 10));
    const tarz = t.beslenme_tarzi || [];
    const oran = tarz.includes('ketojenik') ? [0.25, 0.08, 0.67]
      : tarz.includes('yuksek-protein') || ['kas-kazanmak', 'sikilasmak'].includes(t.hedef) ? [0.3, 0.4, 0.3] : [0.27, 0.4, 0.33];
    let hedefTarihi = null, hafta = null;
    if (tempo && !riskli && t.hedef_kilo_kg) {
      hafta = Math.round(Math.abs(t.kilo_kg - t.hedef_kilo_kg) / tempo.kg);
      const d = new Date(DD.bugun + 'T12:00:00');
      d.setDate(d.getDate() + Math.round(hafta * 7));
      hedefTarihi = d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    }
    return {
      bazal: Math.round(bazal), gunluk: Math.round(gunluk), fark, hedefKcal, altSinir: ham < EN_AZ, riskli,
      protein: Math.round((hedefKcal * oran[0]) / 4), karb: Math.round((hedefKcal * oran[1]) / 4), yag: Math.round((hedefKcal * oran[2]) / 9),
      oran: oran.map((o) => Math.round(o * 100)), lif: Math.round((hedefKcal / 1000) * 17), suMl: M.yuvarla(t.kilo_kg * 30, 100), hedefTarihi, hafta,
    };
  };

  /* Program önerisi: tarz kısıtı keser, hedef ve tercih puanlar */
  const HEDEF_ESLEME = {
    'kilo-vermek': { hedef: ['kilo'], tercih: ['dengeli'] }, 'formu-korumak': { hedef: ['dengeli'], tercih: ['dengeli'] },
    'kas-kazanmak': { hedef: ['kas', 'protein'], tercih: ['yuksek-protein'] }, sikilasmak: { hedef: ['protein', 'kas', 'kilo'], tercih: ['yuksek-protein'] },
    'oruc-aliskanligi': { hedef: ['oruc'], tercih: ['aralikli-oruc'] }, 'saglikli-yasam': { hedef: ['dengeli', 'seker'], tercih: ['dengeli', 'akdeniz'] },
  };
  const kesisir = (a, b) => (a || []).some((x) => (b || []).includes(x));
  S.programOner = function (t, programlar) {
    const tarz = t.beslenme_tarzi || [], riskli = S.riskli(t);
    const oruclu = t.oruc_protokol && t.oruc_protokol !== 'yok';
    const uygun = (p) => {
      if (riskli && (p.hedef.includes('oruc') || p.tercih.includes('aralikli-oruc'))) return false;
      if (tarz.includes('vegan') && !p.tercih.includes('bitkisel') && !p.hedef.includes('vegan')) return false;
      if (tarz.includes('vejetaryen') && !tarz.includes('vegan') && !kesisir(p.tercih, ['vejetaryen', 'bitkisel']) && !p.hedef.includes('vegan')) return false;
      return true;
    };
    const e = HEDEF_ESLEME[t.hedef] || { hedef: [], tercih: [] };
    const puanli = programlar.filter(uygun).map((p) => {
      let puan = 0; const neden = [];
      if (kesisir(p.hedef, e.hedef)) { puan += 5; neden.push('Hedefinle uyumlu'); }
      if (kesisir(p.tercih, e.tercih)) puan += 2;
      if (tarz.includes('akdeniz') && p.tercih.includes('akdeniz')) { puan += 3; neden.push('Akdeniz tarzın'); }
      if (tarz.includes('glutensiz') && p.tercih.includes('glutensiz')) { puan += 4; neden.push('Glütensiz'); }
      if (tarz.includes('yuksek-protein') && p.tercih.includes('yuksek-protein')) { puan += 3; neden.push('Yüksek protein'); }
      if (tarz.includes('vegan') && kesisir(p.tercih, ['bitkisel'])) neden.push('Vegan');
      else if (tarz.includes('vejetaryen') && kesisir(p.tercih, ['vejetaryen', 'bitkisel'])) neden.push('Vejetaryen');
      if (oruclu && !riskli && p.hedef.includes('oruc')) { puan += 3; neden.push('Oruç pencerene uygun'); }
      if (p.sure_gun >= 14) puan += 1;
      return { p, puan, neden };
    }).sort((a, b) => b.puan - a.puan);
    return puanli.slice(0, 3).map((x) => ({ ...x.p, neden: x.neden[0] || 'Dengeli başlangıç' }));
  };

  /* ── Alan çizimi: sihirbaz ve Tercihlerim aynı denetimi kullanır ─────────── */
  const secenekHtml = (x, secili, kapali) => '<button class="secenek" type="button" data-deger="' + x.id + '" aria-pressed="' + secili + '"' + (kapali ? ' disabled' : '') + '><i class="fa-solid ' + x.ikon + '" aria-hidden="true"></i><span>' + kac(x.ad) + (x.alt ? '<small>' + kac(x.alt) + '</small>' : '') + '</span></button>';
  S.secenekCiz = function (alan, deger, o = {}) {
    const coklu = Array.isArray(deger) || o.coklu;
    const sec = (id) => (coklu ? (deger || []).map(String).includes(String(id)) : String(deger) === String(id));
    return '<div class="secenek-izgara' + (o.sinif ? ' ' + o.sinif : '') + '" ' + (coklu ? 'data-coklu-secim' : 'data-tek-secim') + ' data-alan="' + alan + '" role="group" aria-label="' + kac(o.etiket || alan) + '">'
      + S.SECENEK[alan].map((x) => secenekHtml(x, sec(x.id), o.kapali && (o.kapali === true || o.kapali(x)))).join('') + '</div>';
  };
  S.sayiCiz = function (alan, deger) {
    const s = S.SAYI[alan], id = 'alan-' + alan;
    return '<div class="alan"><label class="alan-etiket" for="' + id + '">' + kac(s.etiket) + '</label><div class="olcu-girdi"><input id="' + id + '" data-alan="' + alan + '" type="number" inputmode="' + (s.mod || 'decimal') + '" min="' + s.min() + '" max="' + s.max() + '" step="' + s.adim + '" placeholder="' + s.yer + '" value="' + (deger == null ? '' : deger) + '">' + (s.birim ? '<span>' + s.birim + '</span>' : '') + '</div><span class="alan-hata" data-hata="' + alan + '"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> <span></span></span></div>';
  };
  S.saatCiz = (deger) => '<div class="alan"><label class="alan-etiket" for="alan-ilk_ogun_saati">İlk öğün saatin</label><input class="alan-girdi saat-girdi" id="alan-ilk_ogun_saati" data-alan="ilk_ogun_saati" type="time" min="06:00" max="15:00" step="900" value="' + (deger || '12:00') + '"></div>';
  S.secimOku = (kap, alan) => {
    const k = kap.querySelector('[data-alan="' + alan + '"]');
    if (!k) return undefined;
    const l = [...k.querySelectorAll('button[aria-pressed="true"]')].map((b) => b.dataset.deger);
    if (k.hasAttribute('data-coklu-secim')) return l;
    return l[0] == null ? null : (alan === 'ogun_sayisi' ? Number(l[0]) : l[0]);
  };
  S.sayiOku = (kap, alan) => { const g = kap.querySelector('input[data-alan="' + alan + '"]'); if (!g || g.value === '') return null; return Number(g.value); };
  S.sayiGecerli = (alan, v) => { const s = S.SAYI[alan]; return v != null && v >= s.min() && v <= s.max(); };
  S.hataGoster = function (kap, alan, metin) {
    const h = kap.querySelector('[data-hata="' + alan + '"]');
    if (h) { h.classList.toggle('goster', Boolean(metin)); h.querySelector('span').textContent = metin || ''; }
    const g = kap.querySelector('.olcu-girdi input[data-alan="' + alan + '"]');
    if (g) g.closest('.olcu-girdi').classList.toggle('hatali', Boolean(metin));
  };
  S.hedefKiloHatasi = function (t, v) {
    if (!S.sayiGecerli('hedef_kilo_kg', v)) return S.SAYI.hedef_kilo_kg.hata();
    if (t.hedef === 'kilo-vermek' && v >= t.kilo_kg) return 'Hedef kilon güncel kilondan düşük olmalı.';
    if (t.hedef === 'kas-kazanmak' && v <= t.kilo_kg) return 'Hedef kilon güncel kilondan yüksek olmalı.';
    if (t.boy_cm) {
      const a = S.saglikliAralik(t.boy_cm);
      if (v < a[0]) return 'Bu hedef boyuna göre sağlıklı aralığın altında kalıyor (' + a[0] + '-' + a[1] + ' kg).' + (t.kilo_kg <= a[0] ? ' Hedefini Formumu korumak ya da Sağlıklı yaşam olarak değiştirebilirsin.' : '');
    }
    return null;
  };
  /* Tek başına seçilen seçenek: Standart ve Yok diğerlerini kapatır */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-coklu-secim] > button');
    if (!b) return;
    const alan = b.parentElement.dataset.alan, tek = (S.SECENEK[alan] || []).filter((x) => x.tek).map((x) => String(x.id));
    if (!tek.length) return;
    setTimeout(() => {
      if (b.getAttribute('aria-pressed') !== 'true') return;
      const benTek = tek.includes(b.dataset.deger);
      b.parentElement.querySelectorAll('button').forEach((x) => {
        if (x !== b && (benTek || tek.includes(x.dataset.deger))) x.setAttribute('aria-pressed', 'false');
      });
      b.parentElement.dispatchEvent(new CustomEvent('dd:secim', { bubbles: true }));
    });
  });
})();
