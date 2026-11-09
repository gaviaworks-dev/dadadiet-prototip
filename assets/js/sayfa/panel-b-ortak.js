/* Panel B ortak yardımcıları: biçimleme, demo erişimi, besin değeri hesabı, uyarı kuralları. */
(function () {
  'use strict';
  const PB = (window.PB = {});
  const V = window.DD_VERI || {};
  PB.$ = (s, k) => (k || document).querySelector(s);
  PB.$$ = (s, k) => Array.from((k || document).querySelectorAll(s));
  PB.esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  PB.kucuk = (s) => String(s || '').toLocaleLowerCase('tr');
  PB.sayi = (n, b) => DD.bicim.sayi(n || 0, b || 0);
  PB.tl = (n) => DD.bicim.para(n || 0, Number.isInteger(Number(n || 0)) ? 0 : 2);
  PB.tarih = (iso) => (iso ? DD.bicim.tarih(String(iso)) : '—');
  PB.tarihSaat = (iso) => { if (!iso) return '—'; const s = String(iso); return PB.tarih(s) + (s.length > 10 ? ' ' + DD.bicim.saat(s.slice(11, 16)) : ''); };
  PB.simdi = () => DD.bugun + 'T' + new Date().toTimeString().slice(0, 5);
  PB.gunEkle = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  PB.yeniId = (on) => on + '-' + Date.now().toString(36);
  PB.parametre = (ad) => new URLSearchParams(location.search).get(ad);
  PB.basHarf = (ad) => String(ad || '').replace(/^(Dyt\.|Uzm\.|Dr\.)\s*/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toLocaleUpperCase('tr');

  /* Alan denetimi kitin kuralıyla: hata alanın altında, odak ilk hatada, tek toast */
  PB.formGecerli = (kap) => {
    let ilk = null;
    PB.$$('.alan .alan-girdi,.alan .alan-secim,.alan .alan-metin', kap).forEach((g) => {
      if (g.offsetParent !== null && !window.DM_ALAN_DENETLE(g) && !ilk) ilk = g;
    });
    if (ilk) { ilk.focus(); DD.toast('Kaydedilmedi, zorunlu alanları doldur.', 'hata'); }
    return !ilk;
  };
  PB.demo = () => DD.demo.al();
  /* Kayıt kabuk sayaçlarını da tazeler: panel-a-ortak her panel sayfasında yüklüdür */
  PB.kaydet = () => { DD.demo.kaydet(); if (window.PA && PA.kabukTazele) PA.kabukTazele(); };
  /* Tablo metinle sıralandığı için tarih ve tutar hücresine gizli sıralama anahtarı eklenir */
  PB.sira = (v) => '<span hidden>' + (typeof v === 'number' ? String(Math.round(v)).padStart(12, '0') : v) + ' </span>';
  /* Demo durumunda dizi alan: yoksa oluşturur, yazılan kayıt üye tarafına da aynı durumdan gider */
  PB.liste = (anahtar) => { const d = PB.demo(); if (!Array.isArray(d[anahtar])) d[anahtar] = []; return d[anahtar]; };
  PB.nesne = (anahtar, bas) => { const d = PB.demo(); if (!d[anahtar] || typeof d[anahtar] !== 'object') d[anahtar] = bas || {}; return d[anahtar]; };
  PB.danisanlar = () => PB.liste('danisanlar');
  PB.danisan = (id) => PB.danisanlar().find((x) => x.id === id) || null;

  PB.tarifler = (V.tarifler && V.tarifler.tarifler) || [];
  PB.besinler = (V.besinler && V.besinler.besinler) || [];
  const tarifHarita = new Map(PB.tarifler.map((t) => [t.slug, t]));
  const besinHarita = new Map(PB.besinler.map((b) => [b.slug, b]));
  PB.katalog = (k) => (k.tur === 'tarif' ? tarifHarita.get(k.slug) : besinHarita.get(k.slug)) || null;
  /* Tarif görseli yerelde, gorsel_dosya adıyla; besinlerde yalnız avokadonun görseli var, kalanı kategori ikonu */
  PB.gorsel = (tur, slug) => {
    if (tur === 'besin') return slug === 'avokado' ? DD.kok + 'assets/img/besin/avokado.webp' : '';
    const t = tarifHarita.get(slug);
    return t && t.gorsel_dosya ? DD.kok + 'assets/img/icerik/' + t.gorsel_dosya : '';
  };
  const BESIN_IKON = { Tahıllar: 'fa-wheat-awn', 'Balık & Deniz': 'fa-fish', 'Et & Tavuk': 'fa-drumstick-bite', Kuruyemiş: 'fa-seedling', 'Yağlar & Soslar': 'fa-bottle-droplet', Sebzeler: 'fa-carrot', Baklagiller: 'fa-bowl-rice', 'Süt Ürünleri & Yumurta': 'fa-cheese', Meyveler: 'fa-apple-whole', 'Tatlılar & Atıştırmalıklar': 'fa-cookie' };
  PB.besinIkon = (b) => BESIN_IKON[b.kategori] || 'fa-carrot';
  PB.sablonGorsel = (s) => {
    /* Şablon başına farklı kapak: tarif sırası şablon adından seçilir */
    const l = [...new Set((s.gunler || []).flatMap((g) => Object.values(g.ogunler).flat()).filter((x) => x.tur === 'tarif').map((x) => x.slug))];
    return l.length ? PB.gorsel('tarif', l[[...s.ad].reduce((a, c) => a + c.charCodeAt(0), 0) % l.length]) : '';
  };
  /* Reçetelerim: diyetisyenin kendi tarifleri, yalnız ona görünür; danışan reçeteyi planındaki kalem olarak görür.
     Demo anahtarı geriye uyum için `tariflerim` kaldı. Eski tarayıcı durumunda alan yoksa demo verisinden başlar */
  PB.tariflerim = () => {
    const d = PB.demo();
    if (!Array.isArray(d.tariflerim)) d.tariflerim = JSON.parse(JSON.stringify((V.demo && V.demo.tariflerim) || []));
    return d.tariflerim;
  };
  /* Reçetenin kaç planda kullanıldığı: plan kalemi tarif_id taşır */
  PB.receteKullanim = (id) => PB.liste('planlar').filter((p) => (p.gunler || []).some((g) => Object.values(g.ogunler || {}).flat().some((k) => k.tarif_id === id))).length;

  /* ── Öğün uygunluğu: TEK KAYNAK ─────────────────────────────────────
     Öğün tipleri kahvalti, ara, ogle, aksam. Sıra:
     1) Dada Gastro tarifinde `ogunler` etiketi varsa veri esastır (TARIF_ETIKET).
     2) Etiketi olmayan tarif kategorisinden okunur (TARIF_KATEGORI).
     3) Besin kategorisinden okunur, kategori dışına düşen besin slug ile yazılır (BESIN_KATEGORI, BESIN_ISTISNA).
     4) Reçete diyetisyenin işaretlediği öğünlerdir (ogunler, eski kayıtta ogun).
     Bilinmeyen kategori hiçbir öğünden saklanmaz. Seçicinin süzgeci öğün değil kategori listesidir (PB.KATEGORILER). */
  PB.OGUN_TIPLERI = [{ id: 'kahvalti', ad: 'Kahvaltı', uygun: 'Kahvaltıya uygun' }, { id: 'ara', ad: 'Ara öğün', uygun: 'Ara öğüne uygun' }, { id: 'ogle', ad: 'Öğle', uygun: 'Öğleye uygun' }, { id: 'aksam', ad: 'Akşam', uygun: 'Akşama uygun' }];
  PB.ogunTipi = (planOgunId) => ({ kahvalti: 'kahvalti', ara1: 'ara', ogle: 'ogle', ara2: 'ara', aksam: 'aksam' }[planOgunId] || '');
  const HEPSI = ['kahvalti', 'ara', 'ogle', 'aksam'], ANA = ['ogle', 'aksam'];
  const TARIF_ETIKET = { kahvalti: ['kahvalti', 'brunch'], ara: ['ara-ogun', 'ikindi-ve-cay-saati', 'beslenme-cantasi'], ogle: ['ogle-yemegi'], aksam: ['aksam-yemegi'] };
  const TARIF_KATEGORI = {
    Kahvaltılık: ['kahvalti'], 'Yumurta Tarifleri': ['kahvalti'], 'Meyve Tarifleri': ['kahvalti', 'ara'], İçecek: ['kahvalti', 'ara'],
    Tatlı: ['ara'], 'Dondurma ve Soğuk Tatlılar': ['ara'], Meze: ['ara', 'aksam'], Salata: ['ara', 'ogle', 'aksam'], 'Sandviç, Burger ve Dürüm': ['ara', 'ogle'],
    Çorba: ANA, Pilav: ANA, Bakliyat: ANA, Zeytinyağlılar: ANA, Sebze: ANA, 'Tavuk ve Hindi': ANA, 'Kırmızı Et': ANA, 'Balık ve Deniz Ürünleri': ANA, Makarna: ANA, Kebap: ANA, 'Hamur İşi': ['kahvalti', 'ara', 'ogle'],
  };
  const BESIN_KATEGORI = {
    Tahıllar: ANA, Sebzeler: ANA, 'Et & Tavuk': ANA, 'Balık & Deniz': ANA, Baklagiller: ANA,
    Meyveler: ['kahvalti', 'ara'], 'Süt Ürünleri & Yumurta': ['kahvalti', 'ara'], Kuruyemiş: ['kahvalti', 'ara'], 'Tatlılar & Atıştırmalıklar': ['kahvalti', 'ara'], 'Yağlar & Soslar': HEPSI,
  };
  const BESIN_ISTISNA = {
    'tam-bugday-ekmegi': HEPSI, 'beyaz-ekmek': HEPSI, 'kepekli-ekmek': HEPSI, 'glutensiz-ekmek': HEPSI, 'yulaf-beyaz': ['kahvalti', 'ara'],
    domates: HEPSI, salatalik: HEPSI, 'carliston-biber': HEPSI, roka: HEPSI, 'marul-kivircik': HEPSI, havuc: ['ara', 'ogle', 'aksam'],
    'ispanak-haslanmis': ['kahvalti', 'ogle', 'aksam'], 'kultur-mantari-cig': ['kahvalti', 'ogle', 'aksam'], 'patates-haslanmis': ['kahvalti', 'ogle', 'aksam'],
    'yogurt-yarim-yagli': HEPSI, 'ayran-tam-yagli': HEPSI, avokado: HEPSI, 'humus-ev-yapimi': ['ara', 'ogle', 'aksam'],
  };
  PB.ogunleri = (tur, x) => {
    if (!x) return HEPSI;
    if (tur === 'recete') return x.ogunler && x.ogunler.length ? x.ogunler : x.ogun ? [x.ogun] : HEPSI;
    if (tur === 'tarif') {
      if (x.ogunler && x.ogunler.length) return HEPSI.filter((t) => x.ogunler.some((e) => TARIF_ETIKET[t].includes(e)));
      return TARIF_KATEGORI[x.kategori] || HEPSI;
    }
    return BESIN_ISTISNA[x.slug] || BESIN_KATEGORI[x.kategori] || HEPSI;
  };
  PB.ogunUygun = (tur, x, tip) => !tip || PB.ogunleri(tur, x).includes(tip);
  PB.ogunAd = (tip) => (PB.OGUN_TIPLERI.find((o) => o.id === tip) || {}).ad || '';

  /* ── Yemek kategorisi: seçicinin "Kategori" listesi ─────────────────
     Gruplar Dada Gastro "Ne pişirsem" kap türlerinden (config/bnp.php ogun_options: Kahvaltılık, Çorba,
     Ana Yemek, Tatlı, İçecek; "Yan Lezzet"in salatası ayrı) ve Gastro öğün ekseninin "Ara Öğün" değerinden.
     Üyeler Gastro'nun 33 kategorisidir; kanon kümesi dar olduğu için (yumurta, pilav, makarna dışarıda) her
     Gastro kategorisi bir gruba yazıldı. Sos, Turşu ve Konserve, Bebek ve Çocuk Tarifleri yalnız "Tümü"de çıkar.
     Varsayılan grup hedef öğünden gelir: kahvaltıda Kahvaltılık, ara öğünde Ara öğün, öğle ve akşamda Ana yemek.
     Reçetede kategori diyetisyenin seçtiğidir; eski kayıtta öğününden okunur. */
  PB.KATEGORILER = [
    { id: 'kahvaltilik', ad: 'Kahvaltılık', gastro: ['Kahvaltılık', 'Yumurta Tarifleri', 'Ekmek', 'Reçel'], ogunler: ['kahvalti'] },
    { id: 'corba', ad: 'Çorba', gastro: ['Çorba'], ogunler: ANA },
    { id: 'ana-yemek', ad: 'Ana yemek', gastro: ['Kırmızı Et', 'Tavuk ve Hindi', 'Balık ve Deniz Ürünleri', 'Köfte ve Kebap', 'Sebze', 'Zeytinyağlılar', 'Mantı ve Dolgulu Hamurlar', 'Pilav', 'Makarna', 'Bakliyat', 'Dolma ve Sarma', 'Sakatat', 'Pizza ve Pide'], ogunler: ANA },
    { id: 'salata', ad: 'Salata', gastro: ['Salata'], ogunler: ['ara', 'ogle', 'aksam'] },
    { id: 'ara-ogun', ad: 'Ara öğün', gastro: ['Atıştırmalık', 'Meze', 'Meyve Tarifleri', 'Sandviç, Burger ve Dürüm', 'Hamur İşi'], ogunler: ['ara'] },
    { id: 'tatli', ad: 'Tatlı', gastro: ['Tatlı', 'Kek ve Pasta', 'Kurabiye', 'Dondurma ve Soğuk Tatlılar'], ogunler: ['ara'] },
    { id: 'icecek', ad: 'İçecek', gastro: ['İçecek'], ogunler: ['kahvalti', 'ara'] },
  ];
  const OGUN_KATEGORI = { kahvalti: 'kahvaltilik', ara: 'ara-ogun', ogle: 'ana-yemek', aksam: 'ana-yemek' };
  PB.ogunKategori = (tip) => OGUN_KATEGORI[tip] || '';
  PB.kategoriAd = (id) => (PB.KATEGORILER.find((k) => k.id === id) || {}).ad || '';
  PB.kategorisi = (tur, x) => {
    if (!x) return '';
    if (tur === 'recete') return x.kategori || OGUN_KATEGORI[PB.ogunleri('recete', x)[0]] || '';
    return (PB.KATEGORILER.find((k) => k.gastro.includes(x.kategori)) || {}).id || '';
  };
  /* Kayıtlı tarif plana serbest kalem olarak geçer: üye tarafı bu biçimi zaten okur, değerler kalemin kendisindedir */
  PB.tarifOlcekle = (k, m) => {
    const b = k.baz, r = (v) => Math.round(v * m * 10) / 10;
    return { miktar: m, olcu: PB.sayi(m, 1) + ' porsiyon', kcal: r(b.kcal), protein: r(b.protein), karb: r(b.karb), yag: r(b.yag), lif: r(b.lif) };
  };
  PB.tarifKalemi = (t, m) => {
    const baz = { kcal: t.kcal || 0, protein: t.protein || 0, karb: t.karb || 0, yag: t.yag || 0, lif: t.lif || 0 };
    return Object.assign({ tur: 'serbest', ad: t.ad, tarif_id: t.id, baz, alerjenler: t.alerjenler || [], malzemeler: t.malzemeler || [] }, PB.tarifOlcekle({ baz }, m));
  };
  PB.kalemAd = (k) => { if (k.ad) return k.ad; const c = PB.katalog(k); return c ? c.ad : k.slug; };
  /* Kalem miktarı demo sözleşmesiyle aynı: besin gram, tarif porsiyon. Besin değeri 100 g başınadır. */
  PB.besinSec = () => PB.besinler.filter((b) => b.kcal != null);
  PB.varsayilanMiktar = (tur, slug) => {
    if (tur === 'tarif') return 1;
    const b = besinHarita.get(slug);
    return (b && b.porsiyon && b.porsiyon.gram) || 100;
  };
  PB.adim = (tur) => (tur === 'tarif' ? 0.5 : 10);
  PB.kalemDeger = (k) => {
    const c = k.tur === 'serbest' ? null : PB.katalog(k);
    if (!c) return { kcal: k.kcal || 0, protein: k.protein || 0, karb: k.karb || 0, yag: k.yag || 0, lif: k.lif || 0 };
    const o = k.tur === 'tarif' ? k.miktar : k.miktar / 100;
    return { kcal: (c.kcal || 0) * o, protein: (c.protein || 0) * o, karb: (c.karb || 0) * o, yag: (c.yag || 0) * o, lif: (c.lif || 0) * o };
  };
  /* Kalem cümlesi: miktar ve birim önde, gram parantezde. Örn. 1 orta boy Muz (100 g) */
  PB.kalemParca = (k) => {
    if (k.tur === 'serbest') return { on: k.olcu || '', ad: k.ad, son: '' };
    const c = PB.katalog(k), ad = c ? c.ad : k.slug;
    if (k.tur === 'tarif') return { on: PB.sayi(k.miktar, 1) + ' porsiyon', ad, son: '' };
    const p = c && c.porsiyon, kat = p && p.gram ? k.miktar / p.gram : 0;
    if (kat && Number.isInteger(kat * 2) && /^1 /.test(p.ad)) return { on: p.ad.replace(/^1 /, PB.sayi(kat, 1) + ' '), ad, son: '(' + PB.sayi(k.miktar) + ' g)' };
    return { on: PB.sayi(k.miktar) + ' g', ad, son: '' };
  };
  PB.kalemCumle = (k) => { const p = PB.kalemParca(k); return [p.on, p.ad, p.son].filter(Boolean).join(' '); };
  PB.topla = (kalemler) => kalemler.reduce((t, k) => { const d = PB.kalemDeger(k); t.kcal += d.kcal; t.protein += d.protein; t.karb += d.karb; t.yag += d.yag; t.lif += d.lif; return t; }, { kcal: 0, protein: 0, karb: 0, yag: 0, lif: 0 });

  /* Sapma: ±%5 hedefte, ±%15 sınırda, üstü sapma */
  PB.sapma = (kcal, hedef) => {
    if (!kcal || !hedef) return { durum: '', etiket: '—', oran: 0 };
    const d = (kcal - hedef) / hedef, y = Math.round(Math.abs(d) * 100);
    const durum = Math.abs(d) <= 0.05 ? 'hedefte' : Math.abs(d) <= 0.15 ? 'sinirda' : 'sapma';
    return { durum, oran: d, etiket: y === 0 ? '%0' : (d > 0 ? '+%' : '−%') + y };
  };

  /* Hassasiyet kuralı: danışan kodu, katalogdaki alerjen ya da hassasiyet etiketiyle eşleşir */
  const HASSASIYET_AD = {
    laktoz: 'Laktoz hassasiyeti', sut: 'Süt alerjisi', gluten: 'Glüten hassasiyeti', yumurta: 'Yumurta alerjisi', balik: 'Balık alerjisi',
    'kabuklu-deniz': 'Kabuklu deniz ürünü alerjisi', kuruyemis: 'Kuruyemiş alerjisi', 'yer-fistigi': 'Yer fıstığı alerjisi', susam: 'Susam alerjisi', vejetaryen: 'Vejetaryen beslenme',
  };
  const ETLI_KATEGORI = ['Et & Tavuk', 'Balık & Deniz', 'Balık ve Deniz Ürünleri', 'Tavuk ve Hindi', 'Kırmızı Et'];
  PB.hassasiyetAd = (kod) => HASSASIYET_AD[kod] || kod;
  /* Uyarı kodları: danışanın hassasiyetleri ve tanımlı protokolün hassasiyet karşılığı (glütensiz → gluten) */
  PB.protokoller = (danisan) => (window.PA && PA.protokoller ? PA.protokoller(danisan) : []);
  PB.kurallar = (danisan) => (danisan ? [...new Set((danisan.hassasiyetler || []).concat(PB.protokoller(danisan).map((p) => p.hassasiyet).filter(Boolean)))] : []);
  PB.kalemUyari = (tur, slug, danisan) => {
    const c = PB.katalog({ tur, slug });
    if (!c || !danisan) return [];
    const et = c.alerjenler || c.hassasiyet || [];
    return PB.kurallar(danisan).filter((h) => (h === 'vejetaryen' ? ETLI_KATEGORI.includes(c.kategori) : et.includes(h)));
  };

  /* Serbest kalem katalogda yok: hassasiyet kuralı ad içindeki kelime başlarıyla çalışır */
  const SERBEST_ANAHTAR = {
    laktoz: ['süt', 'peynir', 'yoğurt', 'kefir', 'ayran', 'krema', 'tereyağ'], sut: ['süt', 'peynir', 'yoğurt', 'kefir', 'ayran', 'krema', 'tereyağ'],
    gluten: ['ekmek', 'makarna', 'bulgur', 'un', 'simit', 'börek', 'bisküvi', 'kek', 'yulaf'], yumurta: ['yumurta', 'omlet', 'menemen'],
    balik: ['balık', 'somon', 'ton', 'levrek', 'uskumru', 'hamsi'], 'kabuklu-deniz': ['karides', 'midye', 'kalamar'],
    kuruyemis: ['ceviz', 'badem', 'fındık', 'kaju', 'antep'], 'yer-fistigi': ['yer fıstığı'], susam: ['susam', 'tahin'],
    vejetaryen: ['et', 'tavuk', 'hindi', 'köfte', 'sucuk', 'balık'],
  };
  PB.kalemUyariK = (k, danisan) => {
    if (k.tur !== 'serbest') return PB.kalemUyari(k.tur, k.slug, danisan);
    /* Kayıtlı tarifte malzemeler de taranır, diyetisyenin işaretlediği etiket doğrudan sayılır */
    const metin = PB.kucuk([k.ad].concat(k.malzemeler || []).join(' ')), kelime = metin.split(/[\s,()]+/);
    return PB.kurallar(danisan).filter((h) => (k.alerjenler || []).includes(h) || (SERBEST_ANAHTAR[h] || []).some((a) => (a.includes(' ') ? metin.includes(a) : a.length < 3 ? kelime.includes(a) : kelime.some((w) => w.startsWith(a)))));
  };

  /* Tahlil kuralı: her testin son sonucu referans aralığıyla karşılaştırılır, kalem işaretlemez, öneri notu üretir */
  const TAHLIL = [
    { anahtar: ['ferritin'], yon: 'dusuk', mikro: 'demir', mikroAd: 'Demir kaynakları', not: 'Demir kaynağı öğünleri artır; kırmızı et, baklagil ve yeşil yapraklıyı C vitamini kaynağıyla birlikte planla. Çay ve kahveyi öğün aralarına al.' },
    { anahtar: ['b12'], yon: 'dusuk', mikro: 'b12', mikroAd: 'B12 kaynakları', not: 'Et, balık, yumurta ve süt ürünlerini plana düzenli koy; vejetaryen danışanda takviye için hekim görüşü iste.' },
    { anahtar: ['d vitamini'], yon: 'dusuk', mikro: 'd_vit', mikroAd: 'D vitamini kaynakları', not: 'Yağlı balığı haftada iki öğüne çıkar. Takviye kararı hekimindir.' },
    { anahtar: ['hba1c', 'açlık glukozu'], yon: 'yuksek', not: 'Rafine karbonhidratı azalt, öğünlere lif ve protein ekle; ara öğünü meyve ve kuruyemişle dengele.' },
    { anahtar: ['ldl', 'total kolesterol', 'trigliserid'], yon: 'yuksek', not: 'Doymuş yağı azalt; zeytinyağı, baklagil, yulaf ve balığı öne çıkar.' },
  ];
  const KRONIK = [
    { anahtar: 'diyabet', not: 'Karbonhidratı günün öğünlerine eşit dağıt; lifli tahıl ve baklagili tercih et.' },
    { anahtar: 'insülin', not: 'Karbonhidratı günün öğünlerine eşit dağıt; lifli tahıl ve baklagili tercih et.' },
    { anahtar: 'hipertansiyon', not: 'Tuzlu peynir, zeytin ve hazır sosları sınırla; potasyumdan zengin sebze ve meyveyi artır.' },
    { anahtar: 'osteoporoz', not: 'Kalsiyum ve protein hedefini her gün karşıla; yeşil yapraklı ve süt ürünü kaynaklarını dağıt.' },
    { anahtar: 'reflü', not: 'Akşam öğününü erken ve hafif tut; asitli ve yağlı kalemleri sınırla.' },
    { anahtar: 'hipotiroidi', not: 'Öğün düzenini sabit tut; ilaçla kahvaltı arasını en az yarım saat bırak.' },
    { anahtar: 'polikistik', not: 'Protein ve lifi her öğüne ekle; rafine şeker kaynaklarını sınırla.' },
  ];
  PB.sonTahlil = (danisan) => {
    const son = new Map();
    ((danisan && danisan.tahliller) || []).slice().sort((a, b) => a.tarih.localeCompare(b.tarih))
      .forEach((p) => (p.degerler || []).forEach((d) => son.set(d.ad, Object.assign({ tarih: p.tarih }, d))));
    return [...son.values()];
  };
  /* Danışan kartı ve Sağlık Dosyam ile aynı kural (tahlil-deger.js: rapor aralığı, yoksa varsayılan tablo, ferritinde kılavuz sınırı) */
  PB.tahlilDurum = (d) => {
    if (DD.tahlilDeger) { const r = DD.tahlilDeger.durum(d); return r === 'dusuk' || r === 'yuksek' ? r : ''; }
    return d.ref_alt != null && d.sonuc < d.ref_alt ? 'dusuk' : d.ref_ust != null && d.sonuc > d.ref_ust ? 'yuksek' : '';
  };
  PB.tahlilIzni = (danisan) => !danisan.izinler || danisan.izinler.tahlil !== false;
  PB.oneriler = (danisan) => {
    if (!danisan) return [];
    const sonuc = [];
    (PB.tahlilIzni(danisan) ? PB.sonTahlil(danisan) : []).forEach((d) => {
      const yon = PB.tahlilDurum(d), ad = PB.kucuk(d.ad);
      const k = TAHLIL.find((x) => x.yon === yon && x.anahtar.some((a) => ad.includes(a)));
      if (!k || sonuc.some((s) => s.not === k.not)) return;
      sonuc.push({ baslik: d.ad + (yon === 'dusuk' ? ' düşük' : ' yüksek') + ' (' + PB.sayi(d.sonuc, 1) + ' ' + d.birim + ')', not: k.not, mikro: k.mikro, mikroAd: k.mikroAd });
    });
    (danisan.kronik || []).forEach((h) => {
      const k = KRONIK.find((x) => PB.kucuk(h).includes(x.anahtar));
      if (k && !sonuc.some((s) => s.not === k.not)) sonuc.push({ baslik: h, not: k.not });
    });
    PB.protokoller(danisan).forEach((p) => sonuc.push({ baslik: 'Protokol: ' + p.ad, not: p.not }));
    return sonuc;
  };
  PB.mikroKaynaklari = (mikro) => PB.besinSec().filter((b) => b.mikrolar && b.mikrolar[mikro])
    .sort((a, b) => b.mikrolar[mikro] - a.mikrolar[mikro]).slice(0, 12).map((b) => b.slug);

  /* Plan durumu ortak sözlüğü */
  PB.planDurum = (d) => ({
    gonderildi: { ad: 'Gönderildi', hap: 'cozulen', sekme: 'aktif' },
    arsiv: { ad: 'Arşiv', hap: 'kapali', sekme: 'arsiv' },
  }[d] || { ad: 'Taslak', hap: 'bekleyen', sekme: 'taslak' });

  /* Öğün düzeni ve gün iskeleti: anahtarlar demo planlarıyla aynı */
  PB.ogunSablonu = () => [
    { id: 'kahvalti', ad: 'Kahvaltı', saat: '07:30', ikon: 'fa-mug-hot', acik: true },
    { id: 'ara1', ad: 'Ara öğün', saat: '10:30', ikon: 'fa-apple-whole', acik: true },
    { id: 'ogle', ad: 'Öğle', saat: '13:00', ikon: 'fa-bowl-food', acik: true },
    { id: 'ara2', ad: 'Ara öğün', saat: '16:00', ikon: 'fa-seedling', acik: true },
    { id: 'aksam', ad: 'Akşam', saat: '20:00', ikon: 'fa-utensils', acik: true },
  ];
  PB.gunSerit = (durumlar) => '<span class="gun-serit" role="img" aria-label="Hedefteki gün ' + durumlar.filter((d) => d === 'hedefte').length + ' / ' + durumlar.length + '">' + durumlar.map((d) => '<i class="' + d + '"></i>').join('') + '</span>';
  /* Makro payı enerji yüzdesidir; gram hedefi hedef kaloriden çıkar */
  PB.makroVarsayilan = () => ({ p: 30, k: 40, y: 30 });
  PB.makroGram = (kcal, m) => ({ protein: (kcal * m.p) / 400, karb: (kcal * m.k) / 400, yag: (kcal * m.y) / 900 });
  PB.GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  PB.GUN_KISA = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  /* Plan günü i, başlangıç tarihinden i gün sonradır; ad tarihten çıkar. haftaGunu: Pazartesi 0 */
  PB.haftaGunu = (iso, i) => (new Date(PB.gunEkle(iso, i) + 'T12:00:00').getDay() + 6) % 7;
  PB.gunAd = (iso, i) => PB.GUNLER[PB.haftaGunu(iso, i)];
  PB.gunKisa = (iso, i) => PB.GUN_KISA[PB.haftaGunu(iso, i)];
  PB.bosGun = (i) => ({ gun: i + 1, ad: PB.GUNLER[i % 7], ogunler: { kahvalti: [], ara1: [], ogle: [], ara2: [], aksam: [] } });
  PB.bosGunler = (n) => Array.from({ length: n || 7 }, (_, i) => PB.bosGun(i));
  PB.planOzet = (p) => {
    const g = (p.gunler || []).map((x) => PB.topla(Object.values(x.ogunler).flat()));
    const dolu = g.filter((x) => x.kcal > 0);
    /* Yarım planda ortalama dolu günlerden alınır */
    const ort = dolu.length ? dolu.reduce((a, x) => a + x.kcal, 0) / dolu.length : 0;
    const durumlar = g.map((x) => PB.sapma(x.kcal, p.hedef_kcal).durum);
    return { ort, dolu: dolu.length, durumlar, hedefte: durumlar.filter((x) => x === 'hedefte').length };
  };
})();
