/* Tercihe göre öğün uyarlama: tek kaynak. Kısıt demo.uye.tercihler'den (beslenme_tarzi, hassasiyet) okunur,
   "Besin alerjisi"nin içeriği danışan kaydındaki hassasiyetlerdir. Oturum yoksa hiçbir şey değişmez.
   Alternatif listesi sıralıdır: kısıtların tamamına uyan ilk aday seçilir, porsiyon ve öğün rolü korunur.
   Uygun aday yoksa kalem yerinde kalır ve işaretlenir. Diyetisyenin planına dokunulmaz, yalnız denetlenir.
     DD.tercihUyum.uygunMu(metin)  metin kısıtlara uyuyor mu
     DD.tercihUyum.uyarla(metin)   "A 1 kâse + B 2 dilim" satırını uyarlanmış metin olarak döndürür */
(function () {
  'use strict';
  const DD = (window.DD = window.DD || {});
  const R = (s) => new RegExp(s, 'u');
  const B = '(?<!\\p{L})'; /* JS'te \b Türkçe harfi tanımaz */
  const kucuk = (s) => String(s == null ? '' : s).toLocaleLowerCase('tr');
  const kac = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const buyukBas = (s) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

  /* ── Besin etiketleri: [etiket, eşleşme, eşleşmeden önce silinen güvenli ifade] ── */
  const SUT = B + '(?:süt(?!\\p{L}*s[uü]z)|yoğurt|yoğurd|ayran|kefir|peynir(?!siz)|kaşar|lor(?!\\p{L})|çökelek|labne|tereyağ|krema|kaymak|cacık|haydari|dondurma|muhallebi|kazandibi|girit ezmesi)';
  const BITKISEL_SUT = 'soya yoğurd\\p{L}*|(?:hindistan cevizi|badem|yulaf|soya) süt\\p{L}*|(?:kaju|hindistan cevizi) krema\\p{L}*';
  const ETIKET = [
    ['et', R(B + '(?:dana|kuzu(?! kulağı)|sığır|biftek|antrikot|bonfile|kıyma|köfte|sucuk|salam|sosis|pastırma|kavurma|ciğer|kokoreç|döner|kuşbaşı|et(?:li|i|in|ler)?(?!\\p{L}))'), R('(?:mercimek|nohut|tofu|mantar|sebze|kabak|patates|ıspanak) köfte\\p{L}*')],
    ['tavuk', R(B + '(?:tavuk|piliç|hindi(?!stan))')],
    ['balik', R('balı[kğ]|' + B + '(?:çipura|levrek|somon|hamsi|palamut|sardalya|uskumru|lüfer|mezgit|barbun(?!ya)|kefal|istavrit)')],
    ['kabuklu', R(B + '(?:karides|kalamar|midye|istakoz|yengeç|ahtapot)')],
    ['yumurta', R(B + '(?:yumurta(?!sız)|omlet|menemen|mücver|kaygana|çılbır|frittata)'), R('tofulu menemen')],
    ['sut', R(SUT), R(BITKISEL_SUT)],
    ['laktoz', R(SUT), R(BITKISEL_SUT + '|laktozsuz \\p{L}+(?: peynir\\p{L}*)?')],
    ['bal', R(B + 'bal(?:lı)?(?!\\p{L})')],
    ['gluten', R(B + '(?:buğday|ekmek|simit|lavaş|yufka|börek|poğaça|açma(?!\\p{L})|pide|bazlama|bulgur|kısır|ezogelin|makarna|erişte|şehriye|kuskus|irmik|galeta|arpa|çavdar|yulaf|granola|müsli|tarhana|mantı|bisküvi|mercimek köfte|kaygana)'), R('gl[üu]tensiz \\p{L}+|(?:kinoalı|karnabaharlı) (?:kısır|mercimek köftesi)|karabuğday(?: \\p{L}+)?')],
    ['karb', R(B + '(?:ekmek|simit|lavaş|yufka|börek|poğaça|pide|bazlama|bulgur|kısır|ezogelin|pilav|pirinç|kinoa|makarna|erişte|şehriye|kuskus|yulaf|granola|müsli|karabuğday|patates|mısır|mercimek|nohut|barbunya|fasulye|bakla(?!\\p{L})|humus|tarhana|elma|armut|muz(?!\\p{L})|üzüm|portakal|mandalina|nar(?!\\p{L})|greyfurt|kayısı|incir|hurma|kiraz|şeftali|karpuz|kavun|kivi|meyve|bal(?:lı)?(?!\\p{L})|pekmez|reçel|şeker(?!siz))'), R('taze fasulye|karnabahar\\p{L}* (?:pilav\\p{L}*|kısır|püre\\p{L}*)|nar ekşisi')],
    ['kuruyemis', R(B + '(?:badem|ceviz|fındık|fıstık|yer fıstığı|kaju|pekan)'), R('hindistan cevizi\\p{L}*')],
    ['susam', R(B + '(?:susam|tahin|humus|simit)')],
  ];

  /* ── Kısıt → yasak etiketler ── */
  const TARZ = {
    vegan: ['et', 'tavuk', 'balik', 'kabuklu', 'yumurta', 'sut', 'laktoz', 'bal'],
    vejetaryen: ['et', 'tavuk', 'balik', 'kabuklu'],
    glutensiz: ['gluten'],
    laktozsuz: ['laktoz'],
    ketojenik: ['karb'],
  };
  const TARZ_AD = { vegan: 'vegan', vejetaryen: 'vejetaryen', glutensiz: 'glütensiz', laktozsuz: 'laktozsuz', ketojenik: 'ketojenik' };
  const ALERJEN = { laktoz: ['laktoz'], sut: ['sut', 'laktoz'], gluten: ['gluten'], yumurta: ['yumurta'], kuruyemis: ['kuruyemis'], balik: ['balik', 'kabuklu'], 'kabuklu-deniz': ['kabuklu'], susam: ['susam'] };
  const ALERJEN_AD = { laktoz: 'laktoz', sut: 'süt', gluten: 'gluten', yumurta: 'yumurta', kuruyemis: 'kuruyemiş', balik: 'balık', 'kabuklu-deniz': 'kabuklu deniz ürünü', susam: 'susam' };
  /* Alerjinin içeriği bilinmiyorsa bu etiketli kalemler değişmez, işaretlenir */
  const YAYGIN_ALERJEN = ['laktoz', 'gluten', 'yumurta', 'kuruyemis', 'balik', 'kabuklu', 'susam'];
  /* Program zaten bu kısıta göre yazılmışsa metni uyarlanmaz: program etiketi → karşıladığı tarz */
  const PROGRAM_KARSILAR = { bitkisel: ['vegan', 'vejetaryen'], vegan: ['vegan', 'vejetaryen'], vejetaryen: ['vejetaryen'], glutensiz: ['glutensiz'] };
  /* Program adında geçince programın özü kısıta aykırıdır; öğün uyarlaması kurtarmaz */
  const AD_ENGELI = ['et', 'tavuk', 'balik', 'kabuklu', 'yumurta', 'sut', 'laktoz'];

  function kisitlar() {
    const bos = { tarz: [], alerjen: [], belirsiz: false, yasak: new Set() };
    if (!DD.oturum || !DD.oturum.acik() || !DD.demo) return bos;
    const d = DD.demo.al() || {}, u = d.uye || {}, t = u.tercihler || {};
    const tarz = [].concat(t.beslenme_tarzi || []).filter((x) => TARZ[x]);
    const dn = (d.danisanlar || []).find((x) => x.id === u.danisan_id) || {};
    const kayit = (dn.hassasiyetler || []).filter((x) => ALERJEN[x]);
    const alerjiVar = t.hassasiyet == null ? kayit.length > 0 : t.hassasiyet.includes('alerji');
    const alerjen = alerjiVar ? kayit : [];
    const yasak = new Set();
    tarz.forEach((x) => TARZ[x].forEach((e) => yasak.add(e)));
    const tarzYasak = new Set(yasak);
    alerjen.forEach((x) => ALERJEN[x].forEach((e) => yasak.add(e)));
    return { tarz, alerjen, belirsiz: alerjiVar && !kayit.length, yasak, tarzYasak };
  }
  const aktif = () => { const k = kisitlar(); return k.yasak.size > 0 || k.belirsiz; };

  function etiketler(metin) {
    const t = kucuk(metin);
    return ETIKET.filter(([, re, haric]) => re.test(haric ? t.replace(new RegExp(haric.source, 'gu'), ' ') : t)).map((e) => e[0]);
  }
  const catisir = (metin, yasak) => etiketler(metin).some((e) => yasak.has(e));
  const uygunMu = (metin) => !catisir(metin, kisitlar().yasak);

  /* ── Alternatifler: [eşleşme, sıralı adaylar]. k100: besin kaydı olmayan adayın 100 g enerjisi ── */
  const TOFU = { k100: 130 };
  const a = (ad, ek) => ({ ad, ...ek });
  const IZGARA_TAVUK = a('Izgara tavuk', { slug: 'tavuk-gogsu-izgara' }), FIRIN_TAVUK = a('Fırında tavuk', { slug: 'tavuk-but-firinda' });
  const IZGARA_TOFU = a('Izgara tofu', TOFU), FIRIN_TOFU = a('Fırında tofu', TOFU), FIRIN_NOHUT = a('Fırında nohut', { slug: 'nohut-haslanmis', olcu: '1 kâse' });
  const IZGARA_MANTAR = a('Izgara mantar', { slug: 'kultur-mantari-cig' }), MANTAR_SOTE = a('Mantar sote', { slug: 'kultur-mantari-cig' });
  const KARNABAHAR_PILAVI = a('Karnabahar pilavı', { slug: 'karnabahar-haslanmis' }), SEBZE_CORBASI = a('Sebze çorbası');
  const KRAKER = a('Keten tohumlu kraker', { olcu: '1 avuç', k100: 450 });
  const MEYVE = (ad) => a(ad, { olcu: '1 küçük kase', k100: 40 });
  const CEKIRDEK = [a('Kabak çekirdeği', { olcu: '1 avuç', k100: 560 }), a('Ayçekirdeği', { olcu: '1 avuç', k100: 580 })];
  const ALT = [
    /* Balık ve deniz ürünü */
    [/çipura/, [IZGARA_TAVUK, IZGARA_TOFU, IZGARA_MANTAR]],
    [/levrek/, [IZGARA_TAVUK, FIRIN_NOHUT, IZGARA_TOFU, IZGARA_MANTAR]],
    [/somon/, [FIRIN_TAVUK, FIRIN_TOFU, IZGARA_MANTAR]],
    [/balı[kğ]|hamsi|sardalya|uskumru|palamut|mezgit/, [IZGARA_TAVUK, FIRIN_NOHUT, IZGARA_TOFU, IZGARA_MANTAR]],
    [/karides|kalamar|midye/, [IZGARA_TAVUK, MANTAR_SOTE]],
    /* Kümes hayvanı ve kırmızı et */
    [/tavuk|piliç|hindi/, [IZGARA_TOFU, FIRIN_NOHUT, IZGARA_MANTAR]],
    [/mercimek köfte/, [a('Kinoalı mercimek köftesi'), IZGARA_MANTAR]],
    [/köfte/, [a('Izgara nohut köftesi', { slug: 'nohut-haslanmis' }), a('Izgara tofu köftesi', TOFU), IZGARA_MANTAR]],
    [/dana|kuzu|kıyma|kuşbaşı|biftek|bonfile/, [a('Haşlanmış nohut', { slug: 'nohut-haslanmis', olcu: '1 kâse' }), a('Sotelenmiş tofu', TOFU), MANTAR_SOTE]],
    /* Yumurta */
    [/menemen/, [a('Tofulu menemen')]],
    [/omlet/, [a('Sebzeli omlet', { slug: 'omlet' }), a('Tofulu sebze sote')]],
    [/yumurta/, [a('Baharatlı tofu', { olcu: '2 dilim', k100: 130 }), a('Haşlanmış nohut', { slug: 'nohut-haslanmis', olcu: '1 kâse' })]],
    /* Süt ürünü */
    [/cacık/, [a('Laktozsuz cacık'), a('Tahinli salatalık'), a('Limonlu salatalık salatası')]],
    [/haydari/, [a('Laktozsuz haydari'), a('Patlıcan ezmesi')]],
    [/ayran/, [a('Laktozsuz ayran'), a('Soya içeceği', { k100: 40 })]],
    [/kefir/, [a('Laktozsuz kefir', { k100: 50 }), a('Soya yoğurdu', { k100: 60 })]],
    [/yoğur[td]/, [a('Laktozsuz yoğurt', { k100: 50 }), a('Soya yoğurdu', { k100: 60 })]],
    [/peynir|kaşar|lor(?!\p{L})|labne|çökelek/u, [a('Laktozsuz beyaz peynir', { k100: 250 }), a('Tofu', TOFU), a('Avokado', { slug: 'avokado', olcu: '2 dilim' })]],
    [/tereyağ/, [a('Zeytinyağı', { slug: 'zeytinyagi' })]],
    [/krema/, [a('Kaju kreması'), a('Hindistan cevizi kreması')]],
    [/(?<!\p{L})süt(?:ü|lü)?(?!\p{L})/u, [a('Laktozsuz süt', { slug: 'laktozsuz-sut' }), a('Soya içeceği', { k100: 40 })]],
    [/(?<!\p{L})bal(?:lı)?(?!\p{L})/u, [a('Pekmez'), a('Tarçın')]],
    /* Tahıl ve ekmek */
    [/lavaş/, [a('Glütensiz lavaş'), a('Marul yaprağı', { olcu: '3 yaprak', k100: 15 })]],
    [/simit/, [a('Glütensiz ekmek', { slug: 'glutensiz-ekmek', olcu: '2 dilim' }), KRAKER]],
    [/ekme[kğ]/, [a('Glütensiz ekmek', { slug: 'glutensiz-ekmek' }), KRAKER]],
    [/kısır/, [a('Kinoalı kısır'), a('Karnabaharlı kısır')]],
    [/bulgur/, [a('Kinoa pilavı', { slug: 'kinoa-pismis' }), KARNABAHAR_PILAVI]],
    [/pirinç|pilav/, [KARNABAHAR_PILAVI]],
    [/makarna|erişte|şehriye|kuskus/, [a('Karabuğday makarnası'), a('Kabak spagetti', { slug: 'kabak-haslanmis' })]],
    [/yulaf/, [a('Karabuğday lapası', { k100: 90 }), a('Chia pudingi', { k100: 110 })]],
    [/granola|müsli/, [a('Glütensiz granola'), a('Ceviz-badem karışımı'), ...CEKIRDEK]],
    [/patates/, [a('Karnabahar püresi', { slug: 'karnabahar-haslanmis' })]],
    /* Baklagil ve çorba */
    [/ezogelin/, [a('Mercimek çorbası', { slug: 'mercimek-corbasi' }), SEBZE_CORBASI]],
    [/mercimek çorba/, [SEBZE_CORBASI]],
    [/humus/, [a('Avokado ezmesi', { slug: 'avokado' })]],
    [/barbunya|kuru fasulye/, [a('Zeytinyağlı karnabahar', { slug: 'karnabahar-haslanmis' })]],
    [/nohut/, [MANTAR_SOTE]],
    [/mercimek/, [a('Izgara kabak', { slug: 'kabak-haslanmis' })]],
    /* Kuruyemiş */
    [/badem|ceviz|fındık|fıstı[kğ]|kaju/, CEKIRDEK],
    [/tahin|susam/, [a('Zeytinyağı', { slug: 'zeytinyagi' })]],
    /* Meyve */
    [/kuru üzüm|kuru kayısı/, CEKIRDEK],
    [/elma|muz/, [MEYVE('Çilek')]],
    [/armut|kivi|üzüm/, [MEYVE('Ahududu')]],
    [/portakal|mandalina|greyfurt|nar(?!\p{L})|kayısı|şeftali/u, [MEYVE('Böğürtlen')]],
    [/meyve/, [MEYVE('Çilek ve böğürtlen')]],
  ];
  /* Aynı öğünde aynı ana besin iki kez gelmesin: kullanılanı son seçeneğe bırakır */
  const anaBesin = (ad) => (kucuk(ad).match(/tofu|nohut|mantar|karnabahar|soya|avokado/) || [kucuk(ad)])[0];
  function alternatifBul(ad, yasak, kullanilan = new Set()) {
    const t = kucuk(ad);
    for (const [re, adaylar] of ALT) {
      if (!re.test(t)) continue;
      const l = adaylar.filter((x) => !catisir(x.ad, yasak));
      const c = l.find((x) => !kullanilan.has(anaBesin(x.ad))) || l[0];
      if (c) { kullanilan.add(anaBesin(c.ad)); return c; }
    }
    return null;
  }
  const dikkatMi = (ad, k) => k.belirsiz && etiketler(ad).some((e) => YAYGIN_ALERJEN.includes(e));

  /* ── Metin satırı ── */
  const OLCU = /^(.*?)(\s(?:\d[\d.,\-–/]*|½|¼|¾|yarım|bir)\s.+)$/iu;
  function cozumle(metin) {
    const k = kisitlar(), kullanilan = new Set();
    const parcalar = String(metin == null ? '' : metin).split(/\s\+\s/).map((ozgun) => {
      const m = ozgun.match(OLCU), ad = m ? m[1] : ozgun, olcu = m ? m[2].trim() : '';
      if (!catisir(ozgun, k.yasak)) return { ozgun, yeni: ozgun, durum: dikkatMi(ad, k) ? 'dikkat' : 'ayni' };
      const c = alternatifBul(ad, k.yasak, kullanilan);
      if (!c) return { ozgun, yeni: ozgun, durum: 'uyari' };
      const o = c.olcu || olcu;
      return { ozgun, yeni: c.ad + (o ? ' ' + o : ''), durum: 'degisti' };
    });
    return {
      metin: parcalar.map((p) => p.yeni).join(' + '), parcalar,
      degisen: parcalar.filter((p) => p.durum === 'degisti').length,
      uyari: parcalar.filter((p) => p.durum === 'uyari' || p.durum === 'dikkat').length,
    };
  }
  const uyarla = (metin) => cozumle(metin).metin;

  /* ── Tarif ── */
  const dizi = (x, a2) => (Array.isArray(x) ? x : (x && x[a2]) || []);
  const veri = () => window.DD_VERI || {};
  const tarifler = () => dizi(veri().tarifler, 'tarifler');
  const besin = (slug) => dizi(veri().besinler, 'besinler').find((b) => b.slug === slug);
  const TARIF_ALT = {
    menemen: ['Tofulu Menemen'],
    'sebzeli-peynirli-omlet': ['Sebzeli Omlet', 'Sebzeli Tofu Sote'],
    'ispanakli-omlet': ['Peynirsiz Ispanaklı Omlet', 'Ispanaklı Tofu Sote'],
    'overnight-yulaf': ['Soya İçecekli Overnight Yulaf', 'Çilekli Chia Pudingi'],
    'sebzeli-yumurta-muffin': ['Peynirsiz Yumurta Muffin', 'Sebzeli Tofu Sote'],
    haydari: ['Patlıcan Ezmesi'],
    'cilekli-smoothie': ['Soya İçecekli Çilekli Smoothie'],
    'cilekli-donmus-yogurt': ['Çilekli Chia Pudingi'],
    'tarcinli-firin-armudu': ['Pekmezli Tarçınlı Fırın Armudu', 'Tarçınlı Fırın Armudu'],
    'ton-balikli-salata': ['Nohutlu Salata', 'Mevsim Salatası'],
    'izgara-sebzeli-sandvic': ['Izgara Sebzeli Tabak'],
    'sebzeli-levrek-bugulama': ['Sebzeli Tofu Buğulama'],
    'firinda-sebzeli-tavuk': ['Fırında Sebzeli Tofu'],
    'sebzeli-tavuk-sote': ['Sebzeli Tofu Sote'],
    'yogurtlu-tavuk-sis': ['Tavuk Şiş', 'Tofu Şiş'],
    'izgara-sebzeli-dana-bonfile': ['Izgara Sebzeli Tofu'],
    'karidesli-guvec': ['Mantarlı Güveç'],
  };
  const HASSASIYET_ETIKET = { 'kabuklu-deniz': 'kabuklu' };
  function tarifCatisir(t, yasak) {
    if (!yasak.size) return false;
    if ((t.hassasiyet || []).some((h) => yasak.has(HASSASIYET_ETIKET[h] || h))) return true;
    return catisir(t.ad + ' ' + (t.malzemeler || []).join(' '), yasak);
  }
  const tarifUygunMu = (t) => !tarifCatisir(t, kisitlar().yasak);
  /* Uyuyorsa tarifin kendisi, adı uyarlanabiliyorsa kopyası, ikisi de değilse null */
  function tarifUyarla(t) {
    const y = kisitlar().yasak;
    if (!tarifCatisir(t, y)) return t;
    const ad = (TARIF_ALT[t.slug] || []).find((x) => !catisir(x, y));
    return ad ? { ...t, ad, uyarlandi: true } : null;
  }
  /* Bir öğün tipinin kısıta uyan havuzu */
  const tarifHavuzu = (tip) => tarifler().filter((t) => t.ogun === tip).map(tarifUyarla).filter((t, i, l) => t && l.findIndex((x) => x && x.ad === t.ad) === i);

  /* ── Yapılı kalem (program ve plan öğünleri) ── */
  function kalemUyarla(k0, kullanilan) {
    const k = kisitlar(), ad = k0.ad || '';
    if (k0.tur === 'tarif') {
      const t = tarifler().find((x) => x.slug === k0.slug), u = t && tarifUyarla(t);
      if (u === t) return t && dikkatMi(t.ad + ' ' + (t.malzemeler || []).join(' '), k) ? { ...k0, uyum: 'dikkat' } : k0;
      return u ? { ...k0, ad: u.ad, uyum: 'degisti', onceki: ad } : { ...k0, uyum: 'uyari' };
    }
    if (!catisir(ad, k.yasak)) return dikkatMi(ad, k) ? { ...k0, uyum: 'dikkat' } : k0;
    const c = alternatifBul(ad, k.yasak, kullanilan);
    if (!c) return { ...k0, uyum: 'uyari' };
    const n = { ...k0, ad: c.ad, uyum: 'degisti', onceki: ad };
    if (c.olcu) n.olcu = c.olcu;
    if ('besin_slug' in n) n.besin_slug = c.slug || null;
    const b = c.slug && besin(c.slug), k100 = b ? b.kcal : c.k100;
    if (k100 && k0.gram) n.kcal = Math.round((k0.gram * k100) / 100);
    return n;
  }

  /* ── Program kartı ve açıklama ── */
  function programYasak(p) {
    const k = kisitlar(), etk = [].concat(p.tercih || [], p.hedef || []);
    const karsilanan = new Set(etk.flatMap((x) => PROGRAM_KARSILAR[x] || []));
    const y = new Set();
    k.tarz.filter((x) => !karsilanan.has(x)).forEach((x) => TARZ[x].forEach((e) => y.add(e)));
    k.alerjen.forEach((x) => ALERJEN[x].forEach((e) => y.add(e)));
    return y;
  }
  const programUygunMu = (p) => { const y = programYasak(p); return !etiketler(p.ad).some((e) => y.has(e) && AD_ENGELI.includes(e)); };
  /* Tanıtım cümlesi: kısıta uyan menü cümlesi kalır, yoksa genel cümle gelir */
  function aciklama(metin, p = {}) {
    const y = programYasak(p);
    if (!catisir(metin, y)) return metin;
    const kalan = String(metin).replace(/\.$/, '').split(';').map((s) => s.trim()).filter((s) => /(?:menü|menüsü|programı?)$/u.test(s) && !catisir(s, y));
    const gun = p.sure_gun || p.sure;
    if (kalan.length) return buyukBas(kalan.join('; ')) + '. Öğünler tercihine göre uyarlanır.';
    return (gun ? gun + ' günlük menü' : 'Menü') + '; öğünler tercihine göre uyarlanır.';
  }

  /* ── Bilgi metni ── */
  function goreMetni() {
    const k = kisitlar();
    const tarz = k.tarz.filter((x) => !(x === 'vejetaryen' && k.tarz.includes('vegan'))).map((x) => '<b>' + TARZ_AD[x] + '</b>');
    const alerjen = k.alerjen.filter((x) => !ALERJEN[x].every((e) => k.tarzYasak.has(e))).map((x) => '<b>' + ALERJEN_AD[x] + '</b>');
    const ve = (l) => (l.length > 1 ? l.slice(0, -1).join(', ') + ' ve ' + l[l.length - 1] : l[0]);
    return [tarz.length ? ve(tarz) + ' tercihine' : '', alerjen.length ? ve(alerjen) + ' hassasiyetine' : ''].filter(Boolean).join(' ve ');
  }
  const tercihBag = () => '<a class="uyum-bag" href="' + DD.kok + 'hesabim/tercihlerim/">Tercihlerim</a>';
  /* Plan dışı her yüzey aynı cümleyi kurar: tur ogun | liste */
  function bilgiMetni({ tur = 'ogun', degisen = 0, uyari = 0, gizlenen = 0 } = {}) {
    const k = kisitlar(), gore = goreMetni(), l = [];
    if (gore && tur === 'liste') l.push('Öğünler ' + gore + ' göre uyarlanır.');
    if (gore && tur === 'ogun' && degisen) l.push('Öğünler ' + gore + ' göre uyarlandı, ' + degisen + ' kalem değişti.');
    if (gizlenen) l.push(gizlenen + ' program bu tercihle örtüşmediği için listede yok.');
    if (uyari && !k.belirsiz) l.push('İşaretli ' + uyari + ' kalem için uygun alternatif bulamadık, diyetisyenine danış.');
    if (k.belirsiz) l.push('Besin alerjin kayıtlı ama hangi besin olduğunu bilmiyoruz' + (tur === 'ogun' && uyari ? '; alerjen içerebilecek ' + uyari + ' kalemi işaretledik.' : '; öğünleri başlamadan önce kontrol et.'));
    return l.length ? l.join(' ') + ' ' + tercihBag() : '';
  }
  const bilgiHtml = (o) => { const m = bilgiMetni(o); return m ? '<div class="bilgi-notu uyum-notu" role="note"><i class="fa-solid fa-sliders" aria-hidden="true"></i><p>' + m + '</p></div>' : ''; };

  /* ── Public sayfa işaretleri: data-uyum-ogun, data-uyum-cumle, data-kart, data-uyum-bilgi ── */
  function parcaHtml(p) {
    if (p.durum === 'degisti') return '<span title="' + kac(p.ozgun) + ' yerine">' + kac(p.yeni) + '</span>';
    if (p.durum === 'ayni') return kac(p.yeni);
    return '<span class="kalem-uyari' + (p.durum === 'dikkat' ? ' dikkat' : '') + '">' + kac(p.yeni) + ' <small><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> ' + (p.durum === 'uyari' ? 'Tercihine uymuyor' : 'Alerjen içerebilir') + '</small></span>';
  }
  const kartVeri = (e) => ({ ad: (e.querySelector('.kart-baslik') || {}).textContent || '', tercih: (e.dataset.tercih || '').split(' '), hedef: (e.dataset.hedef || '').split(' '), sure_gun: e.dataset.sure });
  function sayfaUyarla() {
    if (!aktif()) return;
    let degisen = 0, uyari = 0, gizlenen = 0;
    document.querySelectorAll('[data-uyum-ogun]').forEach((e) => {
      const c = cozumle(e.dataset.uyumOgun);
      degisen += c.degisen; uyari += c.uyari;
      if (c.degisen || c.uyari) e.innerHTML = c.parcalar.map(parcaHtml).join(' + ');
    });
    document.querySelectorAll('[data-uyum-cumle]').forEach((e) => { e.textContent = aciklama(e.textContent, { tercih: (e.dataset.tercih || '').split(' '), hedef: (e.dataset.hedef || '').split(' '), sure_gun: e.dataset.sure }); });
    document.querySelectorAll('[data-kart][data-tercih]').forEach((e) => {
      const p = kartVeri(e), m = e.querySelector('.sonuc-govde > p');
      if (!programUygunMu(p)) { e.remove(); gizlenen++; return; }
      if (m) m.textContent = aciklama(m.textContent, p);
    });
    /* Yedekli ızgara: çıkan kartın yerine sıradaki gelir */
    document.querySelectorAll('[data-uyum-yedekli]').forEach((g) => { [...g.children].forEach((k, i) => { k.hidden = i >= +g.dataset.uyumYedekli; }); });
    document.querySelectorAll('[data-uyum-bilgi]').forEach((e) => {
      const tur = e.dataset.uyumBilgi;
      e.innerHTML = bilgiHtml(tur === 'ogun' ? { tur, degisen, uyari } : { tur: 'liste', gizlenen: e.closest('[data-liste]') ? gizlenen : 0 });
    });
    /* Akordeon yüksekliği metin değişmeden önce ölçüldüyse yeniden ölçülür */
    document.querySelectorAll('.akordeon-kalem.acik .akordeon-govde').forEach((g) => { if (g.style.maxHeight) g.style.maxHeight = g.scrollHeight + 'px'; });
  }

  /* ── Üye ekranları: başlatılan programın öğünleri bu katmandan geçer, plan geçmez ── */
  const OGUN_TIP = { kahvalti: 'kahvaltı', ara1: 'ara', ogle: 'öğle', ara2: 'ara', aksam: 'akşam' };
  const NOT = { uyari: ' (tercihine uymuyor)', dikkat: ' (alerjen içerebilir)' };
  function uyeBagla(U) {
    if (U.tercihBagli) return;
    U.tercihBagli = true;
    const hamGun = U.gunOgunleri, hamAlt = U.alternatif, hamSec = U.secilenOgunler;
    const karma = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7);
    const topla = (l, x) => l.reduce((t, k) => t + (Number(k[x]) || 0), 0);
    const tarifKalem = (t, onceki) => ({ tur: 'tarif', slug: t.slug, ad: t.ad, miktar: 1, kcal: t.kcal, protein: t.protein, yag: t.yag, karb: t.karb, uyum: 'degisti', onceki });
    function ogunUyarla(o, sira) {
      const kullanilan = new Set();
      const kalemler = o.kalemler.map((x, i) => {
        const y = kalemUyarla(x, kullanilan);
        if (x.tur !== 'tarif' || y.uyum !== 'uyari') return y;
        /* Adı uyarlanamayan tarif: aynı öğün tipinin havuzundan seçilir */
        const h = tarifHavuzu(OGUN_TIP[o.anahtar]);
        return h.length ? tarifKalem(h[(sira + i) % h.length], x.ad) : y;
      });
      const degisen = kalemler.filter((x) => x.uyum === 'degisti').length, uyari = kalemler.filter((x) => x.uyum === 'uyari' || x.uyum === 'dikkat').length;
      if (!degisen && !uyari) return o;
      return { ...o, kalemler, metin: kalemler.map((x) => U.kalemMetin(x) + (NOT[x.uyum] || '')).join(' + '), kcal: topla(kalemler, 'kcal'), protein: topla(kalemler, 'protein'), yag: topla(kalemler, 'yag'), karb: topla(kalemler, 'karb'), uyumDegisen: degisen, uyumUyari: uyari };
    }
    U.gunOgunleri = function (k, tarih) {
      const l = hamGun.call(U, k, tarih);
      if (!k || k.tip === 'plan' || !aktif()) return l;
      const taban = karma(k.anahtar) + U.gunFarki(k.program.baslangic, tarih);
      return l.map((o, i) => ogunUyarla(o, taban + i));
    };
    /* Tercih değişmeden önce seçilmiş alternatif artık uymuyorsa öğün plana döner */
    U.secilenOgunler = function (k, tarih) {
      const l = hamSec.call(U, k, tarih);
      if (!k || k.tip === 'plan' || !aktif()) return l;
      return l.map((o) => { if (!o.degisti || uygunMu(o.metin)) return o; return U.gunOgunleri(k, tarih).find((x) => x.anahtar === o.anahtar) || o; });
    };
    U.alternatif = function (o) {
      if (!aktif()) return hamAlt.call(U, o);
      const l = tarifler().filter((t) => t.ogun === OGUN_TIP[o.anahtar] && tarifUygunMu(t) && !o.kalemler.some((x) => x.slug === t.slug));
      return l.sort((x, y) => Math.abs(x.kcal - o.kcal) - Math.abs(y.kcal - o.kcal)).slice(0, 2);
    };
    U.ozet(); /* kabuk şeridi bağlamadan önce çizildi: kalan kalori uyarlanmış öğünlerden gelsin */
  }
  /* Öğün listesinin özeti: bilgiHtml'e verilir */
  const ogunOzeti = (l) => ({ tur: 'ogun', degisen: l.reduce((t, o) => t + (o.uyumDegisen || 0), 0), uyari: l.reduce((t, o) => t + (o.uyumUyari || 0), 0) });

  /* Diyetisyen planı: değiştirilmez, kısıta aykırı kalemler adıyla bildirilir */
  function planDenetle(U, plan) {
    const y = kisitlar().yasak, adlar = new Set();
    if (!y.size || !plan) return [];
    (plan.gunler || []).forEach((g) => Object.values(g.ogunler || {}).forEach((l) => l.forEach((x) => {
      const t = x.tur === 'tarif' && U.tarif(x.slug), ad = U.kalemAd(x);
      if (t ? tarifCatisir(t, y) : catisir(ad, y)) adlar.add(ad);
    })));
    return [...adlar];
  }
  function planUyariHtml(U, plan) {
    const l = planDenetle(U, plan), gore = goreMetni();
    if (!l.length) return '';
    const gorunen = l.slice(0, 4).map(kac).join(', ') + (l.length > 4 ? ' ve ' + (l.length - 4) + ' kalem daha' : '');
    return '<div class="uyari-kutu" role="note"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span><b>Planında ' + gore.replace(/<\/?b>/g, '') + ' uymayan ' + l.length + ' kalem var:</b> ' + gorunen + '. Planı diyetisyenin hazırladığı için değiştirmedik; uygun bulursan diyetisyenine not gönder.</span></div>';
  }

  DD.tercihUyum = { aktif, kisitlar, etiketler, uygunMu, uyarla, cozumle, tarifUygunMu, tarifUyarla, tarifHavuzu, kalemUyarla, programUygunMu, aciklama, bilgiMetni, bilgiHtml, uyeBagla, ogunOzeti, planDenetle, planUyariHtml };
  sayfaUyarla();
})();
