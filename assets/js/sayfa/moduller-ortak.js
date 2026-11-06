/* Modüllerin ortak çekirdeği: besin değerleri, biçimleme, otomatik tamamlama, karşılaştırma motoru.
   Saf işlevler DOM'a dokunmaz: besin-karsilastir.mjs aynı dosyayı derlemede çalıştırıp statik sonucu üretir. */
(function (kok) {
  'use strict';
  const M = (kok.DDM = kok.DDM || {});

  /* ── Veri erişimi ───────────────────────────────────────────────────────── */
  const liste = () => { const b = kok.DD_VERI && kok.DD_VERI.besinler; return Array.isArray(b) ? b : (b && b.besinler) || []; };
  M.besinler = liste;
  /* Tarifler porsiyon değeriyle besin kaydına çevrilir: gramı yok, bölmesi enerji payından gelir */
  let tarifOnbellek = null;
  const tarifBolmesi = (t) => {
    if (!t.kcal) return 'sebze';
    if ((t.protein * 4) / t.kcal >= 0.3) return 'protein';
    return (t.karb * 4) / t.kcal >= 0.45 ? 'karb' : 'sebze';
  };
  M.tarifKayitlari = () => {
    if (tarifOnbellek) return tarifOnbellek;
    const k = kok.DD_VERI && kok.DD_VERI.tarifler, l = Array.isArray(k) ? k : (k && k.tarifler) || [];
    const var_ = new Set(liste().map((b) => b.slug));
    tarifOnbellek = l.filter((t) => !var_.has(t.slug) && t.kcal != null).map((t) => ({
      slug: 'tarif-' + t.slug, ad: t.ad, kategori: 'Tarif', tarif_turu: t.kategori, kategori_kodu: 'tarif', kayit_turu: 'tarif', tabak_grubu: tarifBolmesi(t),
      porsiyon: { ad: '1 porsiyon', gram: null }, kcal: null, protein: null, yag: null, karb: null, lif: null, karb_lif_dahil: null,
      porsiyon_degerleri: { kcal: t.kcal, protein: t.protein, yag: t.yag, karb: t.karb, lif: t.lif }, alerjenler: t.hassasiyet || [], yol: t.yol,
    }));
    return tarifOnbellek;
  };
  M.tumKayitlar = () => liste().concat(M.tarifKayitlari());
  M.tarifMi = (b) => b.kayit_turu === 'tarif';
  M.besin = (slug) => liste().find((x) => x.slug === slug) || M.tarifKayitlari().find((x) => x.slug === slug) || null;
  M.kesir = (v) => {
    const tam = Math.floor(v), k = { 0.25: '¼', 0.5: '½', 0.75: '¾' }[+(v - tam).toFixed(2)] || '';
    return (tam || !k ? tam : '') + k;
  };
  M.kisaAd = (b) => b.ad.replace(/\s*\(.*\)\s*$/, '').trim();
  const kac = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  M.kac = kac;

  /* Yok değer 0 sayılmaz: çağıran null'ı "veri yok" diye gösterir */
  M.sayi = (v, b = 1) => (v == null || Number.isNaN(v) ? null : Number(v).toLocaleString('tr-TR', { maximumFractionDigits: b }));
  M.goster = (v, birim, b = 1) => (v == null ? 'veri yok' : M.sayi(v, b) + (birim ? ' ' + birim : ''));
  M.yuvarla = (v, adim) => Math.round(v / adim) * adim;
  M.kucult = (s) => String(s).replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase()
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');

  /* Kaynaklar arası tutarlılık: USDA karbonhidratı lif dahil, TürKomp lif hariç yazar. Hepsi lif dahil toplanır. */
  const karb100 = (b) => {
    if (b.karb == null) return null;
    return b.karb_lif_dahil === false && b.lif != null ? b.karb + b.lif : b.karb;
  };
  const yuzGram = (b, alan) => (alan === 'karb' ? karb100(b) : b[alan]);
  const pGram = (b) => (b.porsiyon && b.porsiyon.gram) || null;
  M.porsiyonGram = pGram;

  /* Tek alanın değeri. kip: '100' ya da 'porsiyon'. porsiyon_notu olan kayıtta porsiyon değeri esastır. */
  function deger(b, alan, kip) {
    const v = yuzGram(b, alan);
    if (kip === '100') return v == null ? null : v;
    const pd = b.porsiyon_degerleri || {}, g = pGram(b);
    if (kip === '100kcal') {
      if (b.kcal) return v == null ? null : (v * 100) / b.kcal;
      return pd.kcal && pd[alan] != null ? (pd[alan] * 100) / pd.kcal : null;
    }
    if (b.porsiyon_notu && pd[alan] != null) return pd[alan];
    if (v != null && g) return (v * g) / 100;
    return pd[alan] == null ? null : pd[alan];
  }
  M.deger = deger;
  const mikro = (b, alan, kip) => {
    const v = b.mikrolar ? b.mikrolar[alan] : null;
    if (v == null) return null;
    if (kip === '100') return v;
    if (kip === '100kcal') return b.kcal ? (v * 100) / b.kcal : null;
    const g = pGram(b);
    return g ? (v * g) / 100 : null;
  };
  const glisemikYuk = (b, kip) => {
    if (b.glisemik_yuk == null) return null;
    if (kip === 'porsiyon') return b.glisemik_yuk;
    const g = pGram(b);
    if (!g) return null;
    const yuz = (b.glisemik_yuk * 100) / g;
    return kip === '100kcal' ? (b.kcal ? (yuz * 100) / b.kcal : null) : yuz;
  };

  /* Belirli miktarın değerleri: gram ya da porsiyon adedi (gramı olmayan tarif kayıtları) */
  M.miktarDeger = function (b, alan, miktar, birim) {
    if (birim === 'porsiyon') { const v = deger(b, alan, 'porsiyon'); return v == null ? null : v * miktar; }
    const g = pGram(b);
    if (b.porsiyon_notu && g) { const v = deger(b, alan, 'porsiyon'); return v == null ? null : (v * miktar) / g; }
    const v = yuzGram(b, alan);
    return v == null ? null : (v * miktar) / 100;
  };

  /* ── Otomatik tamamlama (.oneri-kap içindeki girdi) ─────────────────────── */
  let oneriNo = 0;
  M.oneri = function (girdi, secenek) {
    const kap = girdi.closest('.oneri-kap');
    const kimlik = 'oneri-' + (++oneriNo);
    const ul = document.createElement('div');
    ul.className = 'oneri-liste'; ul.id = kimlik; ul.hidden = true; ul.setAttribute('role', 'listbox');
    ul.setAttribute('aria-label', 'Besin önerileri');
    kap.appendChild(ul);
    girdi.setAttribute('role', 'combobox'); girdi.setAttribute('aria-autocomplete', 'list');
    girdi.setAttribute('aria-expanded', 'false'); girdi.setAttribute('aria-controls', kimlik); girdi.autocomplete = 'off';
    let sonuc = [], etkin = -1;
    const kapat = () => { ul.hidden = true; girdi.setAttribute('aria-expanded', 'false'); girdi.removeAttribute('aria-activedescendant'); etkin = -1; };
    const isaretle = () => {
      [...ul.children].forEach((k, i) => k.setAttribute('aria-selected', String(i === etkin)));
      if (etkin >= 0) { girdi.setAttribute('aria-activedescendant', kimlik + '-' + etkin); ul.children[etkin].scrollIntoView({ block: 'nearest' }); }
    };
    const ciz = () => {
      const q = M.kucult(girdi.value.trim());
      const haric = secenek.haric ? secenek.haric() : [];
      sonuc = (secenek.kaynak || liste)().filter((b) => !haric.includes(b.slug) && (!secenek.suz || secenek.suz(b)) && (!q || M.kucult(b.ad).includes(q) || M.kucult(b.kategori || '').includes(q)))
        .sort((x, y) => (M.kucult(y.ad).startsWith(q) ? 1 : 0) - (M.kucult(x.ad).startsWith(q) ? 1 : 0)).slice(0, 8);
      if (!sonuc.length) {
        ul.innerHTML = '<div class="oneri-kalem" role="option" aria-disabled="true">Bu adla kayıtlı besin yok</div>';
      } else {
        ul.innerHTML = sonuc.map((b, i) => '<button type="button" class="oneri-kalem" role="option" id="' + kimlik + '-' + i + '" aria-selected="false" data-slug="' + b.slug + '"><span>' + kac(b.ad) + '</span><small>' + kac(b.kategori || '') + '</small></button>').join('');
      }
      etkin = -1; ul.hidden = false; girdi.setAttribute('aria-expanded', 'true');
    };
    const sec = (slug) => { kapat(); secenek.secildi(M.besin(slug)); };
    girdi.addEventListener('focus', ciz);
    girdi.addEventListener('input', ciz);
    girdi.addEventListener('blur', () => setTimeout(kapat, 120));
    ul.addEventListener('mousedown', (e) => e.preventDefault());
    ul.addEventListener('click', (e) => { const k = e.target.closest('[data-slug]'); if (k) sec(k.dataset.slug); });
    girdi.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { kapat(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (ul.hidden) ciz();
        if (!sonuc.length) return;
        etkin = (etkin + (e.key === 'ArrowDown' ? 1 : -1) + sonuc.length) % sonuc.length;
        isaretle();
      } else if (e.key === 'Enter' && !ul.hidden && sonuc.length) {
        e.preventDefault(); sec(sonuc[Math.max(etkin, 0)].slug);
      }
    });
  };

  /* ── Karşılaştırma motoru ───────────────────────────────────────────────── */
  M.HAZIR = [
    { yol: 'kinoa-vs-pirinc', a: 'kinoa-pismis', b: 'pirinc-pismis', baslik: 'Kinoa vs Pirinç', ozet: 'İki pişmiş tahıl: lif, protein ve tahmini glisemik yük.', not: 'İki değer de pişmiş ürün içindir. Kuru ağırlıkla karşılaştırma yaparsan sonuç değişir.' },
    { yol: 'somon-vs-tavuk-gogsu', a: 'somon-atlantik-ciftlik', b: 'tavuk-gogsu-izgara', baslik: 'Somon vs Tavuk Göğsü', ozet: 'Protein yoğunluğu, yağ ve mikro besinler.', not: 'Omega-3 bu veri setinde ayrı bir öge olarak yok, somonun yağ kalitesi tabloya yansımaz.' },
    { yol: 'badem-vs-ceviz', a: 'badem', b: 'ceviz-ic', baslik: 'Badem vs Ceviz', ozet: 'Bir avuç kuruyemişte enerji, protein ve lif.', not: 'Kuruyemişlerde porsiyon küçüktür. Günlük seçim için "1 porsiyon" görünümü daha gerçekçi sonuç verir.' },
    { yol: 'zeytinyagi-vs-tereyagi', a: 'zeytinyagi', b: 'tereyagi', baslik: 'Zeytinyağı vs Tereyağı', ozet: 'İki yağ: kalori, doymuş yağ ve alerjen farkı.', not: 'Yağlarda kalori birbirine yakındır, seçimde asıl fark doymuş yağ payıdır. Kalori farkı tek başına seçim nedeni olmamalı.' },
  ];

  const ANA = [
    { a: 'kcal', ad: 'Kalori', birim: 'kcal', b: 0, yon: 'az', isaretsiz: true, esik: 5, rozet: 'Daha düşük kalori', neden: 'Aynı miktarda daha az kalori almak istediğinde' },
    { a: 'protein', ad: 'Protein', birim: 'g', yon: 'cok', esik: 0.5, rozet: 'Daha yüksek protein', neden: 'Öğünün proteinini artırmak istediğinde' },
    { a: 'yag', ad: 'Toplam yağ', birim: 'g' },
    { a: 'doymus_yag', ad: 'Doymuş yağ', birim: 'g', yon: 'az', esik: 0.1, rozet: 'Daha az doymuş yağ', neden: 'Doymuş yağı sınırlaman gerektiğinde' },
    { a: 'karb', ad: 'Karbonhidrat (lif dahil)', birim: 'g' },
    { a: 'lif', ad: 'Lif', birim: 'g', yon: 'cok', esik: 0.3, rozet: 'Daha yüksek lif', neden: 'Tokluğu uzatmak ve lif hedefini tamamlamak istediğinde' },
    { a: 'seker', ad: 'Şeker', birim: 'g', yon: 'az', esik: 0.3, rozet: 'Daha az şeker', neden: 'Şeker alımını azaltmak istediğinde' },
  ];
  const GLISEMIK = [
    { a: 'gi', ad: 'Glisemik indeks', birim: '', b: 0, yon: 'az', esik: 3, rozet: 'Düşük glisemik indeks' },
    { a: 'gy', ad: 'Glisemik yük', birim: '', yon: 'az', esik: 1, rozet: 'Düşük glisemik yük', neden: 'Kan şekerini daha dengeli tutmak istediğinde' },
  ];
  const MIKRO = [
    { a: 'demir', ad: 'Demir', birim: 'mg', yon: 'cok', esik: 0.1, rozet: 'Daha yüksek demir', neden: 'Demir alımını desteklemek istediğinde' },
    { a: 'kalsiyum', ad: 'Kalsiyum', birim: 'mg', b: 0, yon: 'cok', esik: 5, rozet: 'Daha yüksek kalsiyum', neden: 'Kalsiyum alımını artırmak istediğinde' },
    { a: 'magnezyum', ad: 'Magnezyum', birim: 'mg', b: 0, yon: 'cok', esik: 3, rozet: 'Daha yüksek magnezyum', neden: 'Magnezyum alımını artırmak istediğinde' },
    { a: 'potasyum', ad: 'Potasyum', birim: 'mg', b: 0, yon: 'cok', esik: 10, rozet: 'Daha yüksek potasyum', neden: 'Potasyum alımını artırmak istediğinde' },
    { a: 'sodyum', ad: 'Sodyum', birim: 'mg', b: 0, yon: 'az', esik: 5, rozet: 'Daha az sodyum', neden: 'Tuz alımına dikkat ettiğinde' },
    { a: 'cinko', ad: 'Çinko', birim: 'mg', yon: 'cok', esik: 0.1, rozet: 'Daha yüksek çinko' },
    { a: 'fosfor', ad: 'Fosfor', birim: 'mg', b: 0, yon: 'cok', esik: 10, rozet: 'Daha yüksek fosfor' },
    { a: 'a_vit', ad: 'A vitamini', birim: 'µg', b: 0, yon: 'cok', esik: 5, rozet: 'Daha yüksek A vitamini', birimDegisken: true },
    { a: 'c_vit', ad: 'C vitamini', birim: 'mg', yon: 'cok', esik: 0.5, rozet: 'Daha yüksek C vitamini', neden: 'C vitamini almak istediğinde' },
    { a: 'd_vit', ad: 'D vitamini', birim: 'µg', yon: 'cok', esik: 0.1, rozet: 'Daha yüksek D vitamini', neden: 'D vitamini almak istediğinde' },
    { a: 'b12', ad: 'B12 vitamini', birim: 'µg', yon: 'cok', esik: 0.1, rozet: 'Daha yüksek B12', neden: 'B12 vitamini almak istediğinde' },
    { a: 'folat', ad: 'Folat', birim: 'µg', b: 0, yon: 'cok', esik: 3, rozet: 'Daha yüksek folat' },
    { a: 'kolesterol', ad: 'Kolesterol', birim: 'mg', b: 0, yon: 'az', esik: 3, rozet: 'Daha az kolesterol' },
  ];
  const ALERJEN = { gluten: 'glüten', sut: 'süt', laktoz: 'laktoz', kuruyemis: 'kuruyemiş', balik: 'balık', yumurta: 'yumurta', 'kabuklu-deniz': 'kabuklu deniz ürünü', susam: 'susam', 'yer-fistigi': 'yer fıstığı' };
  const kaynakTuru = (b) => (b.mikro_kaynak || '').split(' ')[0];
  const mineralSupheli = (b) => Boolean(b.mikro_uyari);

  /* -1: A önde, 1: B önde, 0: fark yok ya da karşılaştırılamaz */
  function kazanan(s, x, y) {
    if (!s.yon || x == null || y == null) return 0;
    const fark = Math.abs(x - y), buyuk = Math.max(Math.abs(x), Math.abs(y));
    if (fark < (s.esik || 0) || fark < buyuk * 0.1) return 0;
    const aOnde = s.yon === 'az' ? x < y : x > y;
    return aOnde ? -1 : 1;
  }

  M.karsilastirma = function (a, b, kip) {
    const oku = (x, s, grup) => (grup === 'mikro' ? mikro(x, s.a, kip) : s.a === 'gi' ? x.glisemik_indeks : s.a === 'gy' ? glisemikYuk(x, kip) : deger(x, s.a, kip));
    const satirlar = (l, grup) => l.map((s) => {
      const x = oku(a, s, grup), y = oku(b, s, grup);
      /* Eşit kaloride değerler küçülür: eşik ve hane ölçüye uyar */
      const olcu = kip === '100kcal' ? { ...s, esik: (s.esik || 0) * 0.2, b: (s.b == null ? 1 : s.b) + 1 } : s;
      let k = kazanan(olcu, x, y);
      if (grup === 'mikro' && (mineralSupheli(a) || mineralSupheli(b))) k = 0;
      if (s.birimDegisken && kaynakTuru(a) !== kaynakTuru(b)) k = 0;
      return { s: olcu, x, y, k, grup };
    });
    const ana = satirlar(ANA, 'ana'), gli = satirlar(GLISEMIK, 'gli'), mik = satirlar(MIKRO, 'mikro');
    return { ana, gli, mik, tum: ana.concat(gli, mik) };
  };

  const onde = (r) => (r.s.isaretsiz ? 0 : r.k);
  const hucre = (r, taraf) => {
    const v = taraf === 'a' ? r.x : r.y, ben = onde(r) === (taraf === 'a' ? -1 : 1);
    if (v == null) return '<td class="sag tablo-yok">veri yok</td>';
    const metin = (ben ? '<i class="fa-solid fa-circle-check" aria-hidden="true"></i> ' : '') + kac(M.goster(v, r.s.birim, r.s.b == null ? 1 : r.s.b));
    let cubuk = '';
    if (r.grup === 'mikro' && r.x != null && r.y != null && Math.max(r.x, r.y) > 0) {
      cubuk = '<div class="olcer ince seri-' + taraf + '"><span data-oran="' + Math.round((v / Math.max(r.x, r.y)) * 100) + '"></span></div>';
    }
    return '<td class="sag' + (ben ? ' kazanan' : '') + '">' + metin + cubuk + '</td>';
  };
  /* Son sütun: önde, fark yok, veri yok ve karşılaştırılamaz durumları ayrıdır */
  const sonucHucre = (r, adlar) => {
    if (r.x == null || r.y == null) return '<td class="sag tablo-yok">–</td>';
    if (!r.s.yon || r.s.isaretsiz) return '<td class="sag tablo-yok">–</td>';
    if (onde(r) !== 0) return '<td class="sag"><b>' + adlar[onde(r) === -1 ? 0 : 1] + '</b></td>';
    return '<td class="sag tablo-yakin">' + (r.x === r.y ? 'aynı' : 'yakın') + '</td>';
  };
  const satirHtml = (r, adlar) => '<tr><th scope="row">' + kac(r.s.ad) + '</th>' + hucre(r, 'a') + hucre(r, 'b') + sonucHucre(r, adlar) + '</tr>';
  const grupHtml = (ad) => '<tr class="tablo-grup"><th colspan="4" scope="colgroup"><span>' + kac(ad) + '</span></th></tr>';
  const baslikOlcu = (b, kip) => (kip === '100' ? '100 g başına' : kip === '100kcal' ? (b.kcal ? '100 kcal başına (' + M.sayi(10000 / b.kcal, 0) + ' g)' : '100 kcal başına') : b.porsiyon ? b.porsiyon.ad + (pGram(b) ? ' (' + pGram(b) + ' g)' : '') : 'Porsiyon verisi yok');
  const yolu = (b, kok2) => kok2 + String(b.yol || '').replace(/^\//, '') + '/';

  function rozetler(r, taraf) {
    const benim = taraf === 'a' ? -1 : 1;
    const ana = r.ana.concat(r.gli).filter((x) => x.k === benim && x.s.rozet);
    const mik = r.mik.filter((x) => x.k === benim && x.s.neden).slice(0, 2);
    return ana.concat(mik).slice(0, 5);
  }

  function neZaman(a, b, r, taraf) {
    const ben = taraf === 'a' ? a : b, diger = taraf === 'a' ? b : a, benim = taraf === 'a' ? -1 : 1;
    const l = r.ana.concat(r.gli).filter((x) => x.k === benim && x.s.neden).map((x) => x.s.neden);
    const benK = r.ana[0][taraf === 'a' ? 'x' : 'y'], digerK = r.ana[0][taraf === 'a' ? 'y' : 'x'];
    if (benK != null && digerK != null && benK > digerK * 1.3) l.push('Az hacimde daha çok enerji gerektiğinde');
    const fark = (diger.alerjenler || []).filter((x) => !(ben.alerjenler || []).includes(x)).map((x) => ALERJEN[x] || x);
    if (fark.length) l.unshift(fark.join(' ve ').replace(/^./, (h) => h.toLocaleUpperCase('tr-TR')) + ' hassasiyetin varsa');
    r.mik.filter((x) => x.k === benim && x.s.neden).slice(0, 2).forEach((x) => l.push(x.s.neden));
    return l.slice(0, 5);
  }

  const eksikler = (b, r, taraf) => r.tum.filter((x) => (taraf === 'a' ? x.x : x.y) == null && x.grup !== 'mikro').map((x) => x.s.ad.replace(' (lif dahil)', '').toLocaleLowerCase('tr-TR'));

  /* Sonuç bloğu: hem derlemede hem tarayıcıda aynı HTML'i üretir */
  M.karsilastirHtml = function (a, b, kip, kok2) {
    const r = M.karsilastirma(a, b, kip);
    const adA = kac(M.kisaAd(a)), adB = kac(M.kisaAd(b));
    const kart = (x, taraf) => {
      const rz = rozetler(r, taraf);
      return '<div class="kart"><div class="kart-bas"><div><h2 class="kart-baslik">' + kac(M.kisaAd(x)) + '</h2><p>' + kac(x.kategori || '') + ' · ' + kac(baslikOlcu(x, kip)) + '</p></div>'
        + (x.yol ? '<a class="dugme hayalet kucuk" href="' + yolu(x, kok2) + '">Besin kartı</a>' : '') + '</div><div class="kart-govde">'
        + (rz.length ? '<div class="cipler">' + rz.map((q) => '<span class="rozet olumlu"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ' + kac(q.s.rozet) + '</span>').join('') + '</div>'
          : '<p class="kart-metin">Karşılaştırılan ölçütlerde öne çıkan bir farkı yok.</p>') + '</div></div>';
    };
    const iki = (l) => l.filter((x) => x.x != null || x.y != null);
    const sat = (x) => satirHtml(x, [adA, adB]);
    /* Üst şerit: tabloya inmeden beş sayı */
    const serit = '<div class="karsi-serit"><p class="alan-yardim"><span><b>' + adA + '</b> ↔ <b>' + adB + '</b> · ' + kac(kip === '100' ? '100 g başına' : kip === 'porsiyon' ? 'birer porsiyon' : '100 kcal başına') + '</span></p><dl class="kunye c5">'
      + r.ana.filter((x) => ['kcal', 'protein', 'yag', 'karb', 'lif'].includes(x.s.a)).map((x) => {
        const v = (d, t) => (d == null ? '–' : (onde(x) === t ? '<b>' + M.sayi(d, x.s.b == null ? 1 : x.s.b) + '</b>' : M.sayi(d, x.s.b == null ? 1 : x.s.b)));
        return '<div><dt>' + kac(x.s.ad.replace(' (lif dahil)', '').replace('Karbonhidrat', 'Karb').replace('Toplam yağ', 'Yağ')) + '</dt><dd class="karsi-deger">' + v(x.x, -1) + ' ↔ ' + v(x.y, 1) + ' <small>' + x.s.birim + '</small></dd></div>';
      }).join('') + '</dl></div>';
    const mikGor = iki(r.mik);
    const mikYok = r.mik.filter((x) => x.x == null && x.y == null).map((x) => x.s.ad);
    const tablo = '<div class="kart"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-table-list" aria-hidden="true"></i> Besin değerleri</h3><p>' + ({ 100: 'Karşılaştırma 100 g üzerinden.', porsiyon: 'Karşılaştırma birer porsiyon üzerinden; porsiyon gramajları farklı olabilir.', '100kcal': 'Karşılaştırma eşit kalori üzerinden: 100 kcal için gereken miktar.' }[kip]) + '</p></div></div>'
      + '<div class="kart-govde bosluksuz"><div class="tablo-kap cerceve-yok"><table class="tablo sabit-ilk"><thead><tr><th scope="col">Öge</th><th class="sag" scope="col">' + adA + '</th><th class="sag" scope="col">' + adB + '</th><th class="sag" scope="col">Önde</th></tr></thead><tbody>'
      + r.ana.map(sat).join('') + grupHtml('Glisemik değerler (tahmini, uzman onayı bekliyor)') + r.gli.map(sat).join('')
      + (mikGor.length ? grupHtml('Vitamin ve mineraller') + mikGor.map(sat).join('') : '')
      + '</tbody></table></div></div></div>';
    const nzKart = (x, taraf) => {
      const l = neZaman(a, b, r, taraf);
      return '<div class="kart"><div class="kart-bas"><h3 class="kart-baslik"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i> ' + kac(M.kisaAd(x)) + ' seç</h3></div><div class="kart-govde">'
        + (l.length ? '<ul class="isaretli-liste">' + l.map((t) => '<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>' + kac(t) + '</span></li>').join('') + '</ul>' : '<p class="kart-metin">Bu ikiliyi ayıran belirgin bir kural çıkmadı.</p>') + '</div><div class="kart-alt"><a class="dugme hayalet kucuk" href="' + kok2 + 'akilli-tabak-ve-degisim/?besin=' + x.slug + '"><i class="fa-solid fa-chart-pie" aria-hidden="true"></i> Tabağımda dene</a></div></div>';
    };
    const hazir = M.HAZIR.find((h) => (h.a === a.slug && h.b === b.slug) || (h.a === b.slug && h.b === a.slug));
    const eksikA = eksikler(a, r, 'a'), eksikB = eksikler(b, r, 'b');
    const eksikMetin = [[adA, eksikA], [adB, eksikB]].filter((e) => e[1].length).map((e) => '<b>' + e[0] + '</b> için ' + kac(e[1].join(', ')) + ' verisi yok').join('; ');
    const porsiyonYok = kip === 'porsiyon' ? [a, b].filter((x) => deger(x, 'kcal', 'porsiyon') == null) : kip === '100' ? [a, b].filter((x) => x.kcal == null) : [];
    let notlar = '';
    if (porsiyonYok.length) notlar += '<div class="uyari-kutu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>' + porsiyonYok.map((x) => kac(M.kisaAd(x))).join(' ve ') + ' için ' + (kip === '100' ? '100 g değeri kayıtlı değil, değerleri "1 porsiyon" görünümünde gör.' : 'porsiyon kaydı yok, değerleri "100 g" görünümünde gör.') + '</span></div>';
    return serit + notlar + '<div class="iki-kolon esit">' + kart(a, 'a') + kart(b, 'b') + '</div>' + tablo
      + '<div class="bolum-bas sik-bas"><div><h2>Hangisini ne zaman tercih etmelisin?</h2><p class="giris-metni">Tablodaki farklardan kurallarla çıkarıldı. Kişisel durumun için diyetisyenine danış.</p></div></div>'
      + '<div class="iki-kolon esit">' + nzKart(a, 'a') + nzKart(b, 'b') + '</div>'
      + '<div class="bilgi-notu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><div>'
      + '<p><b>Glisemik değerler tahminidir, uzman onayı bekliyor.</b> Rozet ve öneriler de bu tahmine dayanır. Değerler uluslararası glisemik indeks tablolarından alınmıştır ve her besin için kayıtlı değildir; yerel ürün ve pişirme yöntemine göre değişir. Karbonhidratlar kaynaklar arasında tutarlı olsun diye lif dahil gösterilir.</p>'
      + (hazir ? '<p>' + kac(hazir.not) + '</p>' : '')
      + (eksikMetin ? '<p>' + eksikMetin + '; bu ölçütler sıralamaya girmedi.</p>' : '')
      + (mikYok.length ? '<p>İki kayıtta da verisi olmayan ögeler: ' + kac(mikYok.join(', ')) + '.</p>' : '')
      + (mineralSupheli(a) || mineralSupheli(b) ? '<p>Bu kayıttaki mineral değerleri kaynak doğrulaması bekliyor, mineral sıralamasına alınmadı.</p>' : '')
      + '</div></div>';
  };
})(typeof window !== 'undefined' ? window : globalThis);
