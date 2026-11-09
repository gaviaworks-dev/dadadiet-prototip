/* Akıllı Tabak ve Değişim */
(function () {
  'use strict';
  const M = window.DDM, kac = M.kac;
  const $ = (id) => document.getElementById(id);

  /* İdeal tabak: Akıllı Tabak spesifikasyonu v1.2, Akdeniz tipi öğün hedefi */
  const BOLME = {
    sebze: { ad: 'Sebze', aralik: [40, 50], renk: 'var(--makro-sebze)', ikon: 'fa-carrot', kural: 'Tabağın %40–50’si. Meyve de burada sayılır, patates sayılmaz.' },
    protein: { ad: 'Protein', aralik: [20, 25], renk: 'var(--makro-protein)', ikon: 'fa-drumstick-bite', kural: 'Tabağın %20–25’i. Balık, tavuk, yumurta, baklagil ya da yoğurt.' },
    karb: { ad: 'Karbonhidrat', aralik: [20, 25], renk: 'var(--makro-karb)', ikon: 'fa-wheat-awn', kural: 'Tabağın %20–25’i. Tam tahıl, bulgur ve patates burada.' },
    yag: { ad: 'Yağ', aralik: [5, 10], renk: 'var(--makro-yag)', ikon: 'fa-droplet', kural: 'Tabağın %5–10’u: zeytinyağı, kuruyemiş ya da yemeğin kendi yağı.' },
  };
  const bolmesi = (b) => {
    if (b.slug === 'avokado') return 'yag';
    return { sebze: 'sebze', meyve: 'sebze', protein: 'protein', sut: 'protein', karb: 'karb', diger: 'karb', yag: 'yag' }[b.tabak_grubu] || 'karb';
  };
  /* Yemek tek bölmeye yazılmaz: kategori dört bölmeye yüzde dağılım [sebze, protein, karb, yağ] taşır.
     et, bakliyat, zeytinyagli ve hamur spesifikasyon v1.2'den;
     salata, yumurta, meze, meyve ve tatli tariflerin malzeme gramlarından hesaplandı (onay/akilli-tabak sayfası).
     gram orta porsiyon, olcu küçük/orta/büyük el ve kap karşılığıdır. */
  const KATEGORI = {
    et: { oran: [15, 60, 0, 25], gram: 200, olcu: ['½ tabak', '1 tabak', '1,5 tabak'] },
    bakliyat: { oran: [5, 35, 45, 15], gram: 250, olcu: ['½ kase', '1 kase', '1,5 kase'] },
    zeytinyagli: { oran: [65, 0, 15, 20], gram: 200, olcu: ['½ tabak', '1 tabak', '1,5 tabak'] },
    hamur: { oran: [0, 10, 70, 20], gram: 150, olcu: ['3 yemek kaşığı', '6 yemek kaşığı', '9 yemek kaşığı'] },
    salata: { oran: [95, 0, 0, 5], gram: 200, olcu: ['1 küçük kase', '1 kase', '1 büyük kase'] },
    yumurta: { oran: [45, 50, 0, 5], gram: 150, olcu: ['½ tabak', '1 tabak', '1,5 tabak'] },
    meze: { oran: [25, 65, 0, 10], gram: 100, olcu: ['2 yemek kaşığı', '4 yemek kaşığı', '6 yemek kaşığı'] },
    meyve: { oran: [70, 30, 0, 0], gram: 150, olcu: ['½ kase', '1 kase', '1,5 kase'] },
    tatli: { oran: [75, 20, 0, 5], gram: 150, olcu: ['½ kase', '1 kase', '1,5 kase'] },
  };
  /* Tarif kataloğunda olmayan iki yemek. Değerler USDA FoodData Central ile tarif varsayımından hesaplandı */
  const EK_YEMEK = [
    { slug: 'karniyarik', ad: 'Karnıyarık', tur: 'Sebze Yemeği', deger: { kcal: 298, protein: 14.4, yag: 19.6, karb: 18.8, lif: 7.8 } },
    { slug: 'somon-izgara', ad: 'Somon Izgara', tur: 'Balık ve Deniz Ürünleri', deger: { kcal: 353, protein: 33.1, yag: 23.5, karb: 0, lif: 0 } },
  ];
  EK_YEMEK.forEach((y) => M.yemekKayitlari().push({ slug: 'tarif-' + y.slug, ad: y.ad, kategori: 'Tarif', tarif_turu: y.tur, kategori_kodu: 'tarif', kayit_turu: 'tarif', tabak_grubu: 'sebze', porsiyon: { ad: '1 porsiyon', gram: null }, kcal: null, protein: null, yag: null, karb: null, lif: null, karb_lif_dahil: null, porsiyon_degerleri: y.deger, alerjenler: [], yol: '' }));
  /* Sıra, boş aramada önerilen sıradır. Köfte spesifikasyonun kendi örneğidir */
  const YEMEK = {
    'karniyarik': { oran: [80, 15, 0, 5], gram: 300, olcu: ['½ patlıcan', '1 patlıcan', '1,5 patlıcan'] }, 'somon-izgara': { oran: [0, 95, 0, 5], gram: 155, olcu: ['½ dilim', '1 dilim', '1,5 dilim'] },
    'firinda-sebzeli-tavuk': 'et', 'yesil-mercimek-yemegi': 'bakliyat', 'mercimek-koftesi': { oran: [10, 30, 50, 10], gram: 150, olcu: ['2 sıkım', '1 tabak / 4 sıkım', '1,5 tabak / 6 sıkım'] },
    'domatesli-bulgur-pilavi': 'hamur', 'mevsim-salatasi': 'salata', 'sebzeli-levrek-bugulama': 'et', 'imambayildi': 'zeytinyagli', 'mercimek-corbasi': 'bakliyat',
    'menemen': 'yumurta', 'sebzeli-tavuk-sote': 'et', 'yogurtlu-tavuk-sis': 'et', 'izgara-sebzeli-dana-bonfile': 'et', 'karidesli-guvec': 'et', 'ton-balikli-salata': 'et',
    'ezogelin-corbasi': 'bakliyat', 'nohut-salatasi': 'bakliyat', 'kisir': 'hamur', 'zeytinyagli-pirasa': 'zeytinyagli', 'firinda-sebze-turlusu': 'zeytinyagli',
    'izgara-sebzeli-sandvic': 'hamur', 'pose-yumurtali-ekmek': 'hamur', 'kahvalti-patatesi': 'hamur', 'overnight-yulaf': 'hamur',
    'sebzeli-peynirli-omlet': 'yumurta', 'ispanakli-omlet': 'yumurta', 'cilbir': 'yumurta', 'otlu-kaygana': 'yumurta', 'sebzeli-yumurta-muffin': 'yumurta',
    'sebze-cubuklu-humus': 'meze', 'haydari': 'meze', 'girit-ezmesi': 'meze',
    'naneli-meyve-salatasi': 'meyve', 'cilekli-smoothie': 'meyve', 'cilekli-donmus-yogurt': 'tatli', 'firinda-tarcinli-elma': 'tatli', 'tarcinli-firin-armudu': 'tatli',
  };
  const BOLME_SIRA = ['sebze', 'protein', 'karb', 'yag'];
  const PORSIYON = [['Küçük', 0.5], ['Orta', 1], ['Büyük', 1.5]];
  const yemekBilgi = (b) => { if (!M.tarifMi(b)) return null; const y = YEMEK[b.slug.slice(6)]; return typeof y === 'string' ? KATEGORI[y] : y || null; };
  const yakinPorsiyon = (m) => PORSIYON.reduce((e, p) => (Math.abs(p[1] - m) < Math.abs(e[1] - m) ? p : e))[1];
  const yemekler = () => Object.keys(YEMEK).map((s) => M.besin('tarif-' + s)).filter(Boolean).map((b) => ({ ...b, kategori: b.tarif_turu }));
  /* Ana yemeğin yanına en sık eklenenler, ölçü birimiyle gelir */
  const YAN = ['kepekli-ekmek', 'beyaz-ekmek', 'zeytinyagi', 'ceviz-ic', 'yogurt-yarim-yagli', 'roka'];
  /* Favori besinler (besin detayındaki "Favori besinlerime ekle") tek besin aramasında önce gelir */
  const favoriSluglar = () => (DD.oturum.acik() ? (((DD.demo.al().uye || {}).kaydedilenler || {}).besinler || []) : DD.misafir.kayitlar().filter((k) => k.tur === 'kaydet' && k.veri.grup === 'besinler').map((k) => k.veri.slug));
  const besinKaynak = () => {
    const fav = favoriSluglar().map((s) => M.besin(s)).filter(Boolean).map((b) => ({ ...b, kategori: 'Favorin · ' + (b.kategori || '') }));
    const v = new Set(fav.map((b) => b.slug)), yan = YAN.filter((s) => !v.has(s)).map((s) => M.besin(s)).filter(Boolean);
    YAN.forEach((s) => v.add(s));
    return fav.concat(yan, M.besinler().filter((b) => !v.has(b.slug)));
  };
  /* Tabakta girdi ölçüsü: besinin ev ölçüsü varsa o (yoğurtta yemek kaşığı, USDA FNDDS 2705464: 1 tablespoon = 15 g), yoksa porsiyonu */
  const olcuAdi = (b) => (b.ev_olcusu ? b.ev_olcusu.ad : b.porsiyon && b.porsiyon.ad ? b.porsiyon.ad : 'porsiyon').replace(/^1\s+/, '');
  const olcuGram = (b) => (b.ev_olcusu && b.ev_olcusu.gram) || M.porsiyonGram(b);
  /* Eksik bölme için tek dokunuşluk öneri ve tek tıkla değişim */
  const ONERI = { sebze: ['roka', 75, 'bol yeşillik ve limon', 'Yeşillik ekle'], protein: ['yogurt-yarim-yagli', 120, 'yoğurt', 'Yoğurt ekle'], karb: ['kepekli-ekmek', 50, 'iki dilim kepekli ekmek', 'Ekmek ekle'], yag: ['zeytinyagi', 10, 'iki tatlı kaşığı zeytinyağı', 'Zeytinyağı ekle'] };
  /* Tek tıkla muadil. Değer dizi olabilir: skoru en çok yükselten aday seçilir, eşitlikte lifi yüksek olan (AT §5 örnekleri: beyaz pirinç → esmer pirinç
     ya da karabuğday, kızartma yerine fırın; karabuğday ve patates verisi USDA FDC 170686, 170698, 170093, 9 Kasım 2026) */
  const TAKAS = { 'pirinc-pismis': ['esmer-pirinc-pismis', 'karabugday-pismis'], 'beyaz-ekmek': 'kepekli-ekmek', 'makarna-haslanmis': 'tam-bugday-makarna', tereyagi: 'zeytinyagi', 'patates-kizartmasi': 'patates-firinda' };
  /* Tabakta durması tek başına muadil önerisi doğuran doymuş yağ kalemleri */
  const DOYMUS = ['tereyagi'];
  const olcusu = (b) => {
    if (M.porsiyonGram(b) == null && b.kcal == null) return { birim: 'porsiyon', adim: 0.5, ilk: 1 };
    const g = M.porsiyonGram(b) || 100;
    const yag = bolmesi(b) === 'yag';
    return { birim: 'g', adim: yag ? 5 : 10, ilk: yag ? Math.max(5, g) : Math.max(50, M.yuvarla(g, 10)) };
  };

  const HAZIR = [
    { ad: 'Tavuklu tabak', kalem: [['firinda-sebzeli-tavuk', 1], ['domatesli-bulgur-pilavi', 1], ['mevsim-salatasi', 1]] },
    { ad: 'Balıklı tabak', kalem: [['sebzeli-levrek-bugulama', 1], ['domatesli-bulgur-pilavi', 1], ['mevsim-salatasi', 1]] },
    { ad: 'Ev yemeği', kalem: [['yesil-mercimek-yemegi', 1], ['mevsim-salatasi', 1.5]] },
    { ad: 'Vejetaryen tabak', kalem: [['imambayildi', 1], ['mercimek-koftesi', 1], ['haydari', 0.5]] },
  ];
  let kalemler = [], hazirNo = 0, seciliBolme = null;
  const yukle = (i) => { hazirNo = i; kalemler = HAZIR[i].kalem.filter((k) => M.besin('tarif-' + k[0])).map((k) => ({ slug: 'tarif-' + k[0], miktar: k[1], birim: 'porsiyon' })); };

  /* Çizim: yarım daire sebze, iki çeyrek, dışarıda sosluk */
  const CX = 190, CY = 200, R = 158, ARA = 3;
  const dilim = {
    sebze: `M${CX - ARA} ${CY - R} A${R} ${R} 0 0 0 ${CX - ARA} ${CY + R} Z`,
    protein: `M${CX + ARA} ${CY - ARA} L${CX + ARA} ${CY - R} A${R} ${R} 0 0 1 ${CX + R} ${CY - ARA} Z`,
    karb: `M${CX + ARA} ${CY + ARA} L${CX + R} ${CY + ARA} A${R} ${R} 0 0 1 ${CX + ARA} ${CY + R} Z`,
  };
  const SOS = { x: 344, y: 54, r: 38 };
  const SINIR = { sebze: [CY - R, 2 * R], protein: [CY - R, R], karb: [CY, R], yag: [SOS.y - SOS.r, 2 * SOS.r] };
  function cizimKur() {
    const clip = (id, d) => `<clipPath id="kirp-${id}">${d}</clipPath>`;
    const taban = (id, sekil) => `<g clip-path="url(#kirp-${id})"><rect class="tabak-zemin" x="0" y="0" width="400" height="400" fill="${BOLME[id].renk}" fill-opacity=".14"/><rect class="tabak-dolgu" data-bolme="${id}" x="0" y="${SINIR[id][0]}" width="400" height="${SINIR[id][1]}" fill="${BOLME[id].renk}" fill-opacity=".62"/></g>${sekil}`;
    const kenar = (id) => `<path d="${dilim[id]}" fill="none" stroke="${BOLME[id].renk}" stroke-width="1.5"/>`;
    const yazi = (x, y, sat1, id) => `<text class="tabak-yazi" x="${x}" y="${y}" text-anchor="middle">${sat1}</text><text class="tabak-yazi kucuk" data-etiket="${id}" x="${x}" y="${y + 18}" text-anchor="middle"></text>`;
    $('tabakCizim').innerHTML = `<svg class="cizim" viewBox="0 0 392 372" role="img" aria-label="Dört bölmeli tabak: sebze, protein, karbonhidrat ve küçük soslukta yağ">
      <defs>${clip('sebze', `<path d="${dilim.sebze}"/>`)}${clip('protein', `<path d="${dilim.protein}"/>`)}${clip('karb', `<path d="${dilim.karb}"/>`)}${clip('yag', `<circle cx="${SOS.x}" cy="${SOS.y}" r="${SOS.r}"/>`)}</defs>
      <circle cx="${CX}" cy="${CY}" r="${R + 12}" fill="var(--kagit)" stroke="var(--cizgi)" stroke-width="2"/>
      ${taban('sebze', kenar('sebze'))}${taban('protein', kenar('protein'))}${taban('karb', kenar('karb'))}
      <circle cx="${SOS.x}" cy="${SOS.y}" r="${SOS.r + 6}" fill="var(--kagit)" stroke="var(--cizgi)" stroke-width="2"/>
      ${taban('yag', `<circle cx="${SOS.x}" cy="${SOS.y}" r="${SOS.r}" fill="none" stroke="${BOLME.yag.renk}" stroke-width="1.5"/>`)}
      ${['sebze', 'protein', 'karb'].map((id) => `<path class="tabak-dilim" d="${dilim[id]}" data-bolme-sec="${id}" role="button" tabindex="0" aria-pressed="false" aria-label="${BOLME[id].ad} bölmesi: ${BOLME[id].kural}"/>`).join('')}
      <circle class="tabak-dilim" cx="${SOS.x}" cy="${SOS.y}" r="${SOS.r}" data-bolme-sec="yag" role="button" tabindex="0" aria-pressed="false" aria-label="${BOLME.yag.ad} bölmesi: ${BOLME.yag.kural}"/>
      ${yazi(CX - R / 2 - 4, CY - 6, 'Sebze', 'sebze')}${yazi(CX + R / 2 - 4, CY - R / 2 + 12, 'Protein', 'protein')}${yazi(CX + R / 2 - 4, CY + R / 2 - 4, 'Karb', 'karb')}${yazi(SOS.x, SOS.y - 4, 'Yağ', 'yag')}
    </svg>`;
  }

  /* Skor: bölme oranlarının ideal aralığa uzaklığı. Spesifikasyon formül vermiyor, katsayı
     yalnız Mercimek Köftesi orta porsiyon ~72 örneğine göre ayarlandı */
  const SKOR_KATSAYI = 0.47;
  function hesap(liste) {
    const gram = { sebze: 0, protein: 0, karb: 0, yag: 0 };
    const top = { kcal: 0, protein: 0, yag: 0, karb: 0, lif: 0 }, eksik = new Set();
    (liste || kalemler).forEach((k) => {
      const b = M.besin(k.slug), y = yemekBilgi(b);
      if (y) BOLME_SIRA.forEach((id, i) => { gram[id] += (y.gram * k.miktar * y.oran[i]) / 100; });
      else gram[bolmesi(b)] += k.miktar;
      Object.keys(top).forEach((a) => {
        const v = M.miktarDeger(b, a, k.miktar, k.birim);
        if (v == null) eksik.add(a); else top[a] += v;
      });
    });
    const T = BOLME_SIRA.reduce((t, id) => t + gram[id], 0), oran = {};
    let sapma = 0;
    BOLME_SIRA.forEach((id) => {
      const o = T ? (gram[id] / T) * 100 : 0, [alt, ust] = BOLME[id].aralik;
      oran[id] = o; sapma += o < alt ? alt - o : o > ust ? o - ust : 0;
    });
    return { gram, top, eksik, oran, skor: T ? Math.round(Math.max(0, 100 - sapma * SKOR_KATSAYI)) : 0 };
  }

  function kalemCiz() {
    const kap = $('tabakKalemler');
    if (!kalemler.length) {
      kap.innerHTML = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-utensils" aria-hidden="true"></i></span><h3>Tabağın boş</h3><p>Yukarıdan yemeğini ara ya da hazır bir tabak seç.</p><button class="dugme birincil" type="button" data-hazir="0">Hazır tabakla başla</button></div>';
      return;
    }
    kap.innerHTML = '<div class="ayar-liste porsiyonlu">' + kalemler.map((k, i) => {
      const b = M.besin(k.slug), bo = BOLME[bolmesi(b)], o = olcusu(b);
      const y = yemekBilgi(b), pg = olcuGram(b);
      const gramBag = '<button class="metin-bag" type="button" data-gram-ac>' + (k.gram ? 'Porsiyona dön' : 'Gramajı kendim girmek istiyorum') + '</button>';
      const sil = '<button class="kapat-dugme" type="button" data-sil="' + i + '" aria-label="' + kac(M.kisaAd(b)) + ' kalemini sil"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
      const metin = (bag) => '<div class="as-metin"><b>' + kac(b.ad) + '</b><span data-kalem-alt="' + i + '">' + kac(altMetin(b, k, bo)) + '</span>' + bag + '</div>';
      if (y && !k.gram) return '<div class="ayar-satir porsiyon-satir" data-sira="' + i + '"><span class="as-ikon" aria-hidden="true"><i class="fa-solid fa-bowl-food"></i></span>' + metin(gramBag)
        + '<div class="segment kucuk porsiyon-secim" role="group" aria-label="' + kac(b.ad) + ' porsiyonu">' + PORSIYON.map(([ad, c], n) => '<button type="button" data-porsiyon="' + c + '" aria-pressed="' + (yakinPorsiyon(k.miktar) === c) + '">' + ad + '<small>' + y.olcu[n].replace(' / ', '\u00a0/ ') + '</small></button>').join('') + '</div>' + sil + '</div>';
      /* Girdi birimi: yemek gramda, besin ölçüsünde (dilim, kaşık, adet) ya da gramda */
      const olcu = !y && !k.gram && pg;
      const deger = y ? Math.round(y.gram * k.miktar) : olcu ? M.yuvarla(k.miktar / pg, 0.5) : k.miktar;
      const birimAd = olcu ? olcuAdi(b) : 'g';
      const adim = olcu ? 1 : y ? 10 : o.adim;
      return '<div class="ayar-satir porsiyon-satir" data-sira="' + i + '"><span class="as-ikon" aria-hidden="true"><i class="fa-solid ' + bo.ikon + '"></i></span>' + metin(pg || y ? gramBag : '')
        + '<div class="miktar-secim"><div class="adet"><button type="button" data-yon="azalt" aria-label="' + kac(M.kisaAd(b)) + ' miktarını azalt"><i class="fa-solid fa-minus" aria-hidden="true"></i></button><input type="number" min="' + adim + '" step="' + adim + '" value="' + deger + '" aria-label="' + kac(M.kisaAd(b)) + ' miktarı, ' + (birimAd === 'g' ? 'gram' : birimAd) + '"><button type="button" data-yon="artir" aria-label="' + kac(M.kisaAd(b)) + ' miktarını artır"><i class="fa-solid fa-plus" aria-hidden="true"></i></button></div>'
        + '<span class="adet-birim">' + kac(birimAd) + '</span></div>' + sil + '</div>';
    }).join('') + '<div class="yan-ekle"><button class="dugme hayalet kucuk" type="button" id="yanEkle"><i class="fa-solid fa-plus" aria-hidden="true"></i> Yanına Ekle</button><span class="not">Ekmek, zeytinyağı, ceviz, yoğurt</span></div></div>';
  }
  /* Satırda gram ve kalori yok: yemek bölmelerini, besin bölmesini söyler. Toplamlar ayrı karttadır */
  const altMetin = (b, k, bo) => {
    const y = yemekBilgi(b);
    if (!y) return bo.ad + ' bölmesi' + (k.gram || !M.porsiyonGram(b) ? ' · ' + M.sayi(k.miktar, 0) + ' g' : '');
    return BOLME_SIRA.map((id, i) => [BOLME[id].ad, y.oran[i]]).filter((x) => x[1] > 0).map((x) => x[0] + ' %' + x[1]).join(' · ');
  };

  const hedefYaz = (id) => '%' + BOLME[id].aralik.join('–');
  function ozetCiz() {
    const h = hesap(), t = h.top;
    /* Bölme dolgusu */
    Object.keys(BOLME).forEach((id) => {
      const dol = Math.min(1, h.oran[id] / BOLME[id].aralik[1]);
      const r = document.querySelector('.tabak-dolgu[data-bolme="' + id + '"]');
      if (r) r.style.transform = 'translateY(' + SINIR[id][1] * (1 - dol) + 'px)';
      const e = document.querySelector('[data-etiket="' + id + '"]');
      if (e) e.textContent = kalemler.length ? '%' + M.sayi(h.oran[id], 0) : 'hedef ' + hedefYaz(id);
    });
    /* Bölme listesi */
    const kalemVar = kalemler.length > 0;
    $('bolmeListe').innerHTML = Object.keys(BOLME).map((id) => {
      const bo = BOLME[id], oran = (h.oran[id] / bo.aralik[1]) * 100;
      const sag = !kalemVar ? 'hedef ' + hedefYaz(id) : '%' + M.sayi(h.oran[id], 0) + ' <small>hedef ' + hedefYaz(id) + '</small>';
      return '<div class="olcum-satir secilir" data-bolme-sec="' + id + '" role="button" tabindex="0" aria-pressed="false"><div class="olcum-bas"><span>' + bo.ad + '</span><b>' + sag + '</b></div><div class="olcer hap renkli" data-bolme="' + id + '"><span data-oran="' + Math.min(100, oran) + '"></span></div><small class="olcum-kural">' + bo.kural + '</small></div>';
    }).join('');
    document.querySelectorAll('#bolmeListe [data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
    bolmeIsaretle();
    /* Makro */
    const pk = t.protein * 4, kk = t.karb * 4, yk = t.yag * 9, tk = pk + kk + yk;
    const dil = [['Protein', pk, 'var(--makro-protein)', t.protein], ['Karbonhidrat', kk, 'var(--makro-karb)', t.karb], ['Yağ', yk, 'var(--makro-yag)', t.yag]];
    const yuzde = dil.map((d) => (tk ? Math.round((d[1] / tk) * 100) : 0));
    $('makroCubuk').innerHTML = tk ? dil.map((d, i) => '<span data-oran="' + yuzde[i] + '" data-renk="' + d[2] + '" title="' + d[0] + ' %' + yuzde[i] + '"></span>').join('') : '';
    $('makroCubuk').setAttribute('aria-label', tk ? dil.map((d, i) => d[0] + ' yüzde ' + yuzde[i]).join(', ') : 'Tabak boş');
    $('makroCubuk').querySelectorAll('span').forEach((e) => { e.style.setProperty('--oran', e.dataset.oran); e.style.setProperty('--renk', e.dataset.renk); });
    $('makroLejant').innerHTML = tk ? dil.map((d, i) => '<span class="lejant-kalem m-' + ['protein', 'karb', 'yag'][i] + '">' + d[0] + ' %' + yuzde[i] + '</span>').join('') : '<span>Besin ekleyince makro dağılımın görünür.</span>';
    /* Toplam */
    const hucre = (ad, v, birim, a) => '<div><dt>' + ad + '</dt><dd>' + (h.eksik.has(a) ? 'en az ' : '') + M.sayi(v, birim === 'kcal' ? 0 : 1) + ' ' + birim + '</dd></div>';
    $('tabakToplam').hidden = !kalemVar; $('tabakToplamBos').hidden = kalemVar;
    $('tabakToplam').innerHTML = hucre('Kalori', t.kcal, 'kcal', 'kcal') + hucre('Protein', t.protein, 'g', 'protein') + hucre('Yağ', t.yag, 'g', 'yag') + hucre('Karb', t.karb, 'g', 'karb') + hucre('Lif', t.lif, 'g', 'lif');
    const ek = $('tabakEksik'), adlar = { kcal: 'kalori', protein: 'protein', yag: 'yağ', karb: 'karbonhidrat', lif: 'lif' };
    ek.hidden = !h.eksik.size;
    ek.textContent = h.eksik.size ? 'Bazı kalemlerde ' + [...h.eksik].map((a) => adlar[a]).join(', ') + ' verisi yok; toplam bu kalemleri içermiyor.' : '';
    $('tabakSayac').textContent = kalemVar ? kalemler.length + ' kalem' : 'Kalem yok';
    $('tabakTemizle').hidden = !kalemVar;
    /* Skor: sayı tek başına durmaz, cümle ve tek eylemle gelir */
    const skorMetin = kalemVar ? String(h.skor) : '–';
    $('skorDeger').textContent = skorMetin; $('skorKisa').textContent = skorMetin;
    const hal = $('skorHalka'); hal.dataset.oran = kalemVar ? h.skor : 0; hal.style.setProperty('--oran', kalemVar ? h.skor : 0);
    const c = skorCumleleri(h);
    $('skorParcalar').innerHTML = kalemVar ? c.satirlar.map((x) => '<li class="' + (x.iyi ? '' : 'eksi') + '"><i class="fa-solid ' + (x.iyi ? 'fa-plus' : 'fa-minus') + '" aria-hidden="true"></i><span>' + x.metin + '</span></li>').join('') : '<li class="eksi"><i class="fa-solid fa-utensils" aria-hidden="true"></i><span>Yemek eklediğinde skorun burada cümleyle açıklanır.</span></li>';
    /* Bildirim tabağın yanında durur: önce eksik bölme, sonra muadil */
    const not = (c.oneri ? '<p class="kart-metin">' + c.oneri.metin + '</p>' : '') + (c.takas ? '<p class="kart-metin">' + c.takas.metin + '</p>' : '');
    const dugme = (c.oneri ? '<button class="dugme hayalet kucuk" type="button" data-oner-ekle="' + c.oneri.ekle + '"><i class="fa-solid fa-plus" aria-hidden="true"></i> ' + c.oneri.dugme + '</button>' : '')
      + (c.takas ? '<button class="dugme hayalet kucuk" type="button" ' + c.takas.attr + '><i class="fa-solid fa-right-left" aria-hidden="true"></i> ' + c.takas.dugme + '</button>' : '');
    const yalin = h.skor >= 90 ? 'Tabağın dengede. Porsiyonunu öğün hedefine göre ayarlayabilirsin.' : 'Bölmelerin bir kısmı ideal aralığın dışında. Porsiyonları değiştirerek dengeyi dene.';
    $('skorOneri').innerHTML = !kalemVar ? '' : not
      ? '<div class="uyari-kutu"><i class="fa-solid fa-bell" aria-hidden="true"></i><div class="yigin sik">' + not + '<div class="eylem-satiri">' + dugme + '</div></div></div>'
      : '<p class="alan-yardim' + (h.skor >= 90 ? ' tamam' : '') + '"><i class="fa-solid ' + (h.skor >= 90 ? 'fa-circle-check' : 'fa-circle-info') + '" aria-hidden="true"></i> <span>' + yalin + '</span></p>';
  }

  /* Ağır bölme: en büyük payı alan kalem bulunur, karşılığı varsa tek tıkla değişir, yoksa muadil bulucu açılır */
  function agirKalem(id) {
    const pay = (k) => hesap([k]).gram[id];
    const enBuyuk = (l) => l.reduce((e, k) => (pay(k) > (e ? pay(e) : 0) ? k : e), null);
    const k = enBuyuk(kalemler.filter((x) => TAKAS[x.slug])) || enBuyuk(kalemler);
    return k ? kalemler.indexOf(k) : null;
  }
  /* Tek tıkla değişim uygulanmadan önce hesaplanır: skoru düşüren değişim önerilmez */
  const takasOlur = (i, h) => {
    let en = null, enSkor = h.skor;
    [].concat(TAKAS[kalemler[i].slug] || []).filter((s) => M.besin(s)).forEach((s) => {
      const skor = hesap(kalemler.map((x, n) => (n === i ? { ...x, slug: s } : x))).skor;
      if (en === null ? skor >= enSkor : skor > enSkor || (skor === enSkor && (M.besin(s).lif || 0) > (M.besin(en).lif || 0))) { en = s; enSkor = skor; }
    });
    return en;
  };
  const takasDugme = (b, i, hedef) => ({ dugme: M.kisaAd(M.besin(hedef)) + ' ile değiştir', attr: 'data-takas="' + i + '" data-takas-hedef="' + hedef + '"' });
  function takasOneri(h) {
    const dy = kalemler.findIndex((k) => DOYMUS.includes(k.slug));
    const dyHedef = dy >= 0 ? takasOlur(dy, h) : null;
    if (dyHedef) { const b = M.besin(kalemler[dy].slug); return { metin: M.kisaAd(b) + ' doymuş yağı yüksek bir kalem.', ...takasDugme(b, dy, dyHedef) }; }
    if (h.skor >= 90) return null;
    const id = h.oran.karb > BOLME.karb.aralik[1] + 5 ? 'karb' : h.oran.yag > BOLME.yag.aralik[1] + 5 ? 'yag' : null;
    if (!id) return null;
    const i = agirKalem(id);
    if (i == null) return null;
    const b = M.besin(kalemler[i].slug);
    const metin = BOLME[id].ad + ' ağırlığı en çok ' + M.kisaAd(b) + ' kaleminden geliyor.';
    const hedef = TAKAS[b.slug] ? takasOlur(i, h) : null;
    if (hedef) return { metin, ...takasDugme(b, i, hedef) };
    /* Bulucu yalnız skoru düşürmeyen bir muadil varsa önerilir */
    const temel = id === 'karb' ? 'karb' : 'kcal';
    if (!muadilVar(b, temel)) return null;
    return { metin, dugme: 'Muadilini bul', attr: 'data-muadil-ac="' + i + '" data-temel="' + temel + '"' };
  }
  function skorCumleleri(h) {
    const satirlar = [], eksikler = [];
    BOLME_SIRA.forEach((id) => {
      const bo = BOLME[id], o = Math.round(h.oran[id]), [alt, ust] = bo.aralik;
      if (o >= alt && o <= ust) satirlar.push({ iyi: true, metin: bo.ad + ' payın iyi' });
      else satirlar.push({ iyi: false, metin: bo.ad + ' ' + (o < alt ? alt - o : o - ust) + ' puan ' + (o < alt ? 'eksik' : 'fazla') });
      if (o < alt) eksikler.push({ id, fark: alt - o });
    });
    eksikler.sort((a, b) => b.fark - a.fark);
    let oneri = null;
    if (eksikler.length) {
      const id = eksikler[0].id, [slug, gram, ne, dugme] = ONERI[id], b = BOLME[id];
      const sonra = hesap(kalemler.concat({ slug, miktar: gram, birim: 'g' })).skor;
      /* Öneri yalnız skoru gerçekten yükseltiyorsa çıkar */
      if (sonra > h.skor) {
        const sonuc = h.skor < 90 && sonra >= 90 ? 'puanını 90 üzerine çıkarabilirsin' : 'puanını ' + sonra + ' civarına çıkarabilirsin';
        oneri = { ekle: id, dugme, metin: 'Tabağında ' + b.ad.toLocaleLowerCase('tr-TR') + ' oranı düşük kaldı. Yanına ' + ne + ' ekleyerek ' + sonuc + '.' };
      }
    }
    return { satirlar, oneri, takas: takasOneri(h) };
  }

  function bolmeIsaretle() {
    document.querySelectorAll('[data-bolme-sec]').forEach((e) => {
      const s = e.dataset.bolmeSec === seciliBolme;
      e.classList.toggle('secili', s); e.setAttribute('aria-pressed', String(s));
    });
    const c = $('bolmeSuzgec'), g = $('tabakArama');
    c.hidden = !seciliBolme;
    if (seciliBolme) c.innerHTML = kac(BOLME[seciliBolme].ad) + ' bölmesine ekliyorsun <i class="fa-solid fa-xmark" aria-hidden="true"></i><span class="yalniz-okuyucu"> Süzgeci kaldır</span>';
    g.placeholder = seciliBolme ? BOLME[seciliBolme].ad + ' ara' : kip === 'yemek' ? 'Örneğin karnıyarık, mercimek köftesi, somon ızgara' : 'Örneğin brokoli, tavuk, bulgur';
  }
  /* Yemek ana yol, tek besin ikinci seçenek, fotoğraf üçüncü. Bölme süzgeci besin aramasıyla çalışır */
  let kip = 'yemek';
  function kipSec(k) {
    kip = k;
    document.querySelectorAll('#eklemeKipi button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.deger === k)));
    $('tabakAramaEtiket').textContent = k === 'yemek' ? 'Yemek ara' : 'Besin ara';
    if (k !== 'besin' && seciliBolme) seciliBolme = null;
    $('tabakAramaAlani').hidden = k === 'foto'; $('tabakFoto').hidden = k !== 'foto';
    bolmeIsaretle();
  }
  const bolmeSec = (id) => { seciliBolme = seciliBolme === id ? null : id; if (seciliBolme) kip = 'besin'; kipSec(kip); };

  function hazirCiz() {
    $('hazirTabaklar').innerHTML = HAZIR.map((t, i) => '<button class="cip' + (i === hazirNo ? ' aktif' : '') + '" type="button" data-hazir="' + i + '" aria-pressed="' + (i === hazirNo) + '">' + t.ad + '</button>').join('');
  }
  /* Tabak taslağı tarayıcıda kalır: sayfa yenilenince hazır tabağa dönmez (misafir deposu, 24 saat) */
  const taslakYaz = () => DD.misafir.taslak('tabak', { kalemler, hazirNo });
  const yenile = () => { kalemCiz(); ozetCiz(); hazirCiz(); muadilCiz(); taslakYaz(); };

  function ekle(b, miktar, birim) {
    const o = olcusu(b), bir = birim || o.birim, var_ = kalemler.find((k) => k.slug === b.slug), pg = M.porsiyonGram(b);
    if (var_ && yemekBilgi(b)) { DD.toast(b.ad + ' zaten tabağında, porsiyonunu satırdan değiştir'); return; }
    hazirNo = -1;
    const ilk = miktar || (bir === 'g' && pg ? pg : o.ilk);
    if (var_ && var_.birim === bir) var_.miktar += ilk;
    else kalemler.push({ slug: b.slug, miktar: yemekBilgi(b) ? yakinPorsiyon(ilk) : ilk, birim: bir });
    yenile();
    DD.toast(M.kisaAd(b) + ' tabağına eklendi');
  }

  document.addEventListener('click', (e) => {
    const hz = e.target.closest('[data-hazir]');
    if (hz) { yukle(+hz.dataset.hazir); yenile(); return; }
    const ps = e.target.closest('[data-porsiyon]');
    if (ps) {
      const i = ps.closest('[data-sira]').dataset.sira, c = ps.dataset.porsiyon;
      kalemler[+i].miktar = +c; hazirNo = -1; yenile();
      document.querySelector('[data-sira="' + i + '"] [data-porsiyon="' + c + '"]').focus();
      return;
    }
    const ga = e.target.closest('[data-gram-ac]');
    if (ga) {
      const k = kalemler[+ga.closest('[data-sira]').dataset.sira];
      k.gram = !k.gram; if (!k.gram && yemekBilgi(M.besin(k.slug))) k.miktar = yakinPorsiyon(k.miktar);
      yenile(); return;
    }
    if (e.target.closest('#yanEkle')) { seciliBolme = null; kipSec('besin'); $('tabakArama').focus(); return; }
    const oe = e.target.closest('[data-oner-ekle]');
    if (oe) { const [slug, gram] = ONERI[oe.dataset.onerEkle]; ekle(M.besin(slug), gram, 'g'); return; }
    const tk = e.target.closest('[data-takas]');
    if (tk) {
      const k = kalemler[+tk.dataset.takas], eski = M.kisaAd(M.besin(k.slug)), yeni = tk.dataset.takasHedef;
      const ayni = kalemler.find((x) => x.slug === yeni && x.birim === k.birim);
      if (ayni) { ayni.miktar += k.miktar; kalemler.splice(kalemler.indexOf(k), 1); } else k.slug = yeni;
      hazirNo = -1; yenile();
      DD.toast(eski + ' yerine ' + M.kisaAd(M.besin(yeni)) + ' geldi'); return;
    }
    const ma = e.target.closest('[data-muadil-ac]');
    if (ma) { muadilAc(M.besin(kalemler[+ma.dataset.muadilAc].slug), ma.dataset.temel); return; }
    const sil = e.target.closest('[data-sil]');
    if (sil) { const b = M.besin(kalemler[+sil.dataset.sil].slug); kalemler.splice(+sil.dataset.sil, 1); hazirNo = -1; yenile(); DD.toast(M.kisaAd(b) + ' tabaktan çıkarıldı'); return; }
    if (e.target.closest('#tabakTemizle')) { kalemler = []; hazirNo = -1; yenile(); return; }
    const bs = e.target.closest('[data-bolme-sec]');
    if (bs) { bolmeSec(bs.dataset.bolmeSec); return; }
    if (e.target.closest('#bolmeSuzgec')) { seciliBolme = null; bolmeIsaretle(); return; }
    const on = e.target.closest('[data-oner]');
    if (on) { seciliBolme = on.dataset.oner; kipSec('besin'); $('tabakArama').focus(); return; }
    const kp = e.target.closest('#eklemeKipi [data-deger]');
    if (kp) { kipSec(kp.dataset.deger); if (kip !== 'foto') $('tabakArama').focus(); }
  });
  document.addEventListener('keydown', (e) => {
    const bs = e.target.closest && e.target.closest('[data-bolme-sec]');
    if (bs && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); bolmeSec(bs.dataset.bolmeSec); }
  });
  $('tabakKalemler').addEventListener('input', (e) => {
    const satir = e.target.closest('[data-sira]');
    if (!satir || e.target.tagName !== 'INPUT') return;
    const i = +satir.dataset.sira, v = parseFloat(e.target.value);
    if (!(v > 0)) return;
    const k = kalemler[i], b = M.besin(k.slug), y = yemekBilgi(b), pg = olcuGram(b);
    k.miktar = y ? v / y.gram : !k.gram && pg ? v * pg : v; hazirNo = -1;
    satir.querySelector('[data-kalem-alt]').textContent = altMetin(b, k, BOLME[bolmesi(b)]);
    ozetCiz(); hazirCiz();
  });
  const arama = $('tabakArama');
  M.oneri(arama, { kaynak: () => (kip === 'yemek' ? yemekler() : besinKaynak()), suz: (b) => !seciliBolme || bolmesi(b) === seciliBolme, bosMetin: () => (kip === 'yemek' ? 'Bu adla yemek yok, Tek besin sekmesinden ekleyebilirsin' : 'Bu adla kayıtlı besin yok'), secildi(b) { arama.value = ''; ekle(b); } });

  /* Fotoğraf: tanıma yok. Fotoğraf öğün bileşeniyle kaydedilir, tabak yemek seçilerek kurulur */
  DD.ogunFoto.gomulu($('tabakFoto'), {
    ogun: 'tabak', ad: 'Tabak',
    qrMetin: 'Bu kod gerçek bir bağlantı açmaz. Aşağıdaki düğme telefondan gelecek fotoğrafın yerine örnek görsel ekler.',
    qrDurum: 'Örnek akış',
    kaynakNotu: { telefon: ['fa-mobile-screen', 'Örnek akış: telefon yerine örnek görsel eklendi.'] },
    kayitMesaj: 'Fotoğrafın kaydedildi. Tabağını yemek seçerek kur.',
    telefonMesaj: 'Örnek fotoğraf eklendi. Tabağını yemek seçerek kur.',
    sonra: { metin: 'Yemek seçerek tabağı kur', ikon: 'fa-utensils', tikla() { kipSec('yemek'); arama.focus(); } },
  });

  /* ── Muadil bulucu: temel seçilir, temelde eşit, ötekilerde nötr fark ─────── */
  const KEPCE = 0.75; /* 1 kepçe = 3/4 tarif porsiyonu */
  const muadil = { b: M.besin('tam-bugday-ekmegi'), adet: 1, temel: 'karb' };
  const TEMEL = {
    karb: { ad: 'karbonhidrat', birim: 'g', esik: 5, baslik: 'Bu besinin karbonhidratı çok az', metin: 'Bir tahıl, baklagil ya da meyve seç, ya da kalori temeline geç.' },
    kcal: { ad: 'kalori', birim: 'kcal', esik: 10, baslik: 'Bu besinin kalorisi çok az', metin: 'Bir ana öğün besini seç.' },
    protein: { ad: 'protein', birim: 'g', esik: 3, baslik: 'Bu besinin proteini çok az', metin: 'Et, balık, yumurta, baklagil ya da süt ürünü seç, ya da karbonhidrat temeline geç.' },
  };
  const DEGER = [['karb', 'Karb', 'g'], ['kcal', 'Kalori', 'kcal'], ['protein', 'Protein', 'g']];
  const HIZLI = ['tam-bugday-ekmegi', 'bulgur-pismis', 'makarna-haslanmis', 'tavuk-gogsu-izgara', 'muz-anamur'];
  const porsiyonAdi = (b) => (M.tarifMi(b) ? 'porsiyon' : b.porsiyon && M.porsiyonGram(b) ? b.porsiyon.ad.replace(/^1\s+/, '') : '100 g');
  const kaynakGram = () => (M.porsiyonGram(muadil.b) || 100) * muadil.adet;
  const tarifMi = M.tarifMi;
  const kaynakDeger = (a) => (tarifMi(muadil.b) ? M.miktarDeger(muadil.b, a, muadil.adet, 'porsiyon') : M.miktarDeger(muadil.b, a, kaynakGram(), 'g'));
  function ozelMuadil(kat) {
    return [
      { slug: 'bulgur-pismis', etiket: M.sayi(3 * kat) + ' yemek kaşığı bulgur pilavı', alt: 'yaklaşık ' + M.sayi(75 * kat, 0) + ' g', miktar: 75 * kat, birim: 'g' },
      { slug: 'patates-haslanmis', etiket: M.sayi(kat) + ' küçük haşlanmış patates', alt: M.sayi(90 * kat, 0) + ' g', miktar: 90 * kat, birim: 'g' },
      { slug: 'mercimek-corbasi', etiket: M.sayi(kat) + ' kepçe mercimek çorbası', alt: 'yaklaşık ¾ porsiyon', miktar: KEPCE * kat, birim: 'porsiyon' },
    ];
  }
  /* Aday havuzu temele göre: besin 100 g, tarif porsiyon değeriyle değerlendirilir */
  const TATLI = ['Meyve Tarifleri', 'Tatlı', 'İçecek', 'Dondurma ve Soğuk Tatlılar'];
  const birimDeger = (b, a) => M.deger(b, a, tarifMi(b) ? 'porsiyon' : '100');
  const adayMi = (b) => {
    if (b.slug === muadil.b.slug || birimDeger(b, 'kcal') == null || b.tabak_grubu === 'diger') return false;
    const t = tarifMi(b), karb = birimDeger(b, 'karb'), kcal = birimDeger(b, 'kcal'), meyveKaynak = muadil.b.tabak_grubu === 'meyve';
    /* Tatlı ve meyve, ana öğün besinine muadil gösterilmez */
    if (t && TATLI.includes(b.tarif_turu) && !meyveKaynak) return false;
    if (b.tabak_grubu === 'meyve' && !meyveKaynak) return false;
    if (muadil.temel === 'karb') return t ? karb >= 15 && (karb * 4) / kcal >= 0.4 : (b.tabak_grubu === 'karb' || b.kategori_kodu === 'baklagil' || meyveKaynak) && karb >= 10;
    if (muadil.temel === 'protein') return birimDeger(b, 'protein') >= 10;
    return bolmesi(b) === bolmesi(muadil.b);
  };
  function adayHesap(b, hedef, ikincil, kaynakIkincil) {
    const v = birimDeger(b, muadil.temel);
    if (!v) return null;
    const t = tarifMi(b), miktar = t ? M.yuvarla(hedef / v, 0.25) : M.yuvarla((hedef / v) * 100, 5), birim = t ? 'porsiyon' : 'g';
    if (t ? miktar < 0.5 || miktar > 2 : miktar < 5 || miktar > 400) return null;
    if (t && Math.abs(v * miktar - hedef) / hedef > 0.2) return null;
    const fark = Math.abs((M.miktarDeger(b, ikincil, miktar, birim) || 0) - kaynakIkincil);
    return { b, miktar, birim, puan: fark - (M.miktarDeger(b, 'lif', miktar, birim) || 0) * 4 };
  }
  /* Muadilin tabağa yazılacak hali: tabaktaki miktar kaynak miktarından farklıysa eşdeğer aynı oranda ölçeklenir */
  function degisimKalemi(m, k) {
    const oran = tarifMi(muadil.b) ? k.miktar / muadil.adet : k.miktar / kaynakGram();
    const miktar = m.birim === 'g' ? Math.max(5, M.yuvarla(m.miktar * oran, 5)) : Math.max(0.5, M.yuvarla(m.miktar * oran, 0.25));
    return { slug: m.slug, miktar, birim: m.birim };
  }
  /* Kaynak tabaktaysa muadil, değişimin skoru düşürmediği sürece önerilir */
  const skoruKorur = (m) => { const k = tabaktaki(); return !k || hesap(kalemler.map((x) => (x === k ? degisimKalemi(m, k) : x))).skor >= hesap().skor; };
  /* Ekleme de aynı kuralla: ekle() yemeği en yakın porsiyona yuvarlar */
  const eklemeKorur = (m) => hesap(kalemler.concat({ slug: m.slug, miktar: yemekBilgi(M.besin(m.slug)) ? yakinPorsiyon(m.miktar) : m.miktar, birim: m.birim })).skor >= hesap().skor;
  /* İki besin + uygunsa bir tarif: hazır yemek de seçenek olsun */
  function hesapliMuadil(hedef) {
    const ikincil = muadil.temel === 'kcal' ? 'protein' : 'kcal', kaynakIkincil = kaynakDeger(ikincil) || 0;
    const aday = M.tumKayitlar().filter(adayMi).map((b) => adayHesap(b, hedef, ikincil, kaynakIkincil)).filter(Boolean).filter((a) => skoruKorur({ slug: a.b.slug, miktar: a.miktar, birim: a.birim })).sort((x, y) => x.puan - y.puan);
    const tarif = aday.find((a) => tarifMi(a.b)), besinler = aday.filter((a) => !tarifMi(a.b));
    const secilen = [], tur = new Set(), kota = tarif ? 2 : 3;
    for (const a of besinler) { if (secilen.length === kota) break; if (tur.has(a.b.kategori_kodu)) continue; tur.add(a.b.kategori_kodu); secilen.push(a); }
    for (const a of besinler) { if (secilen.length === kota) break; if (!secilen.includes(a)) secilen.push(a); }
    if (tarif) secilen.push(tarif);
    return secilen.map((a) => {
      const ad = M.kisaAd(a.b).toLocaleLowerCase('tr-TR'), pg = M.porsiyonGram(a.b);
      if (a.birim === 'porsiyon') return { slug: a.b.slug, etiket: M.kesir(a.miktar) + ' porsiyon ' + ad, alt: 'Tarif', tarif: true, miktar: a.miktar, birim: a.birim };
      return { slug: a.b.slug, etiket: M.sayi(a.miktar, 0) + ' g ' + ad, alt: pg ? 'yaklaşık ' + M.sayi(a.miktar / pg, 1) + ' ' + porsiyonAdi(a.b) : '', miktar: a.miktar, birim: a.birim };
    });
  }
  /* Fark hapı nötr: yön iyi ya da kötü diye boyanmaz */
  function farkHapi(alan, v, k, birim) {
    if (v == null || k == null) return '';
    const fark = v - k, yakinlik = k ? Math.abs(fark) / k : 1;
    if (alan === muadil.temel) return '<span class="rozet olumlu">' + (yakinlik <= 0.05 ? 'eşit' : 'yakın') + '</span>';
    if (Math.abs(fark) < (birim === 'kcal' ? 5 : 1)) return '<span class="rozet pasif">aynı</span>';
    return '<span class="rozet pasif"><i class="fa-solid ' + (fark > 0 ? 'fa-arrow-up' : 'fa-arrow-down') + '" aria-hidden="true"></i> ' + M.sayi(Math.abs(fark), 0) + ' ' + birim + '<span class="yalniz-okuyucu"> ' + (fark > 0 ? 'daha fazla' : 'daha az') + '</span></span>';
  }
  const tabaktaki = () => (muadil.b ? kalemler.find((k) => k.slug === muadil.b.slug) : null);
  const muadilListesi = (hedef) => (muadil.b.slug === 'tam-bugday-ekmegi' && muadil.temel === 'karb' ? ozelMuadil(muadil.adet).filter(skoruKorur) : hesapliMuadil(hedef));
  /* Bulucu açılmadan sorulur: kaynak ve temel geçici yazılır, kullanıcının bulucu durumu geri gelir */
  function muadilVar(b, temel) {
    const eski = { ...muadil };
    Object.assign(muadil, { b, adet: 1, temel });
    const hedef = kaynakDeger(temel), var_ = hedef != null && hedef >= TEMEL[temel].esik && muadilListesi(hedef).length > 0;
    Object.assign(muadil, eski);
    return var_;
  }
  function muadilCiz() {
    const b = muadil.b, tm = TEMEL[muadil.temel];
    if (document.activeElement !== $('muadilArama')) $('muadilArama').value = b ? b.ad : '';
    $('muadilBirim').textContent = b ? '× ' + porsiyonAdi(b) + (M.porsiyonGram(b) ? ' (' + M.porsiyonGram(b) + ' g)' : '') : '';
    document.querySelectorAll('#muadilHizli .cip').forEach((c) => c.classList.toggle('aktif', Boolean(b) && c.dataset.slug === b.slug));
    $('muadilNot').textContent = 'Eşdeğerler ' + tm.ad + ' miktarına göre hesaplanır. Fark okları artı ya da eksi değer yargısı taşımaz.';
    const oz = $('muadilOzet'), son = $('muadilSonuc');
    if (!b) { oz.innerHTML = ''; son.innerHTML = ''; return; }
    const kay = { karb: kaynakDeger('karb'), kcal: kaynakDeger('kcal'), protein: kaynakDeger('protein') };
    oz.innerHTML = '<div class="muadil-ad"><span class="ust-etiket">Referans</span><b>' + M.sayi(muadil.adet) + ' ' + kac(porsiyonAdi(b)) + ' ' + kac(M.kisaAd(b).toLocaleLowerCase('tr-TR')) + '</b>' + (M.porsiyonGram(b) ? '<span>' + M.sayi(kaynakGram(), 0) + ' g</span>' : '') + '</div><div class="deger-satir temel-secici" role="group" aria-label="Eşitleme temeli: değere dokun">'
      + DEGER.map(([a, ad, br]) => '<button type="button" data-temel-sec="' + a + '" class="' + (a === muadil.temel ? 'temel' : '') + '" aria-pressed="' + (a === muadil.temel) + '"><span>' + ad + '</span><b>' + M.goster(kay[a], br, 0) + '</b></button>').join('') + '</div>';
    const hedef = kay[muadil.temel];
    if (hedef == null || hedef < tm.esik) {
      son.innerHTML = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-scale-unbalanced" aria-hidden="true"></i></span><h3>' + tm.baslik + '</h3><p>' + tm.metin + '</p><button class="dugme birincil" type="button" data-muadil-sec="tam-bugday-ekmegi">Tam buğday ekmeğiyle dene</button></div>';
      son._liste = []; return;
    }
    const l = muadilListesi(hedef), varMi = tabaktaki();
    if (!l.length) {
      son.innerHTML = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i></span><h3>' + (varMi ? 'Skorunu düşürmeyen muadil yok' : 'Uygun muadil bulunamadı') + '</h3><p>' + (varMi ? 'Eşdeğerlerin hepsi tabağının dengesini bozuyor. Temeli değiştirebilir ya da eksik bölmeyi tamamlayabilirsin.' : 'Temeli ya da miktarı değiştirip yeniden dene.') + '</p></div>';
      son._liste = []; return;
    }
    const eklenir = l.map(eklemeKorur);
    if (eklenir.includes(false)) $('muadilNot').textContent += ' Tabağa eklenince skoru düşürecek seçeneklerde ekleme düğmesi çıkmaz.';
    son.innerHTML = '<div class="kart-izgara c3">' + l.map((m, i) => {
      const x = M.besin(m.slug);
      return '<div class="kart dolgulu muadil-kart"><h3 class="kart-baslik">' + kac(m.etiket) + '</h3><p class="kart-metin">' + kac(m.alt) + '</p><dl class="deger-tablo">'
        + DEGER.map(([a, ad, br]) => { const v = M.miktarDeger(x, a, m.miktar, m.birim); return '<div' + (a === muadil.temel ? ' class="temel"' : '') + '><dt>' + ad + '</dt><dd>' + M.goster(v, br, 0) + '</dd>' + farkHapi(a, v, kay[a], br) + '</div>'; }).join('')
        + '</dl>' + (varMi || eklenir[i] ? '<div class="eylem-satiri">' + (varMi ? '<button class="dugme birincil kucuk" type="button" data-muadil-degistir="' + i + '"><i class="fa-solid fa-right-left" aria-hidden="true"></i> Tabağımda değiştir</button>' : '')
        + (eklenir[i] ? '<button class="dugme hayalet kucuk" type="button" data-muadil-ekle="' + i + '"><i class="fa-solid fa-plus" aria-hidden="true"></i> Tabağa ekle</button>' : '') + '</div>' : '') + '</div>';
    }).join('') + '</div>';
    son._liste = l;
  }
  $('muadilHizli').innerHTML = HIZLI.map((s) => { const b = M.besin(s); return b ? '<button class="cip" type="button" data-slug="' + s + '">' + kac(M.kisaAd(b)) + '</button>' : ''; }).join('');
  const muadilSec = (b) => { muadil.b = b; muadil.adet = 1; $('muadilAdet').value = 1; muadilCiz(); };
  const muadilAc = (b, temel) => {
    muadil.temel = temel;
    muadilSec(b); $('muadil').scrollIntoView({ block: 'start' });
  };
  M.oneri($('muadilArama'), { kaynak: M.tumKayitlar, secildi(b) { $('muadilArama').blur(); muadilSec(b); } });
  $('muadilArama').addEventListener('blur', () => setTimeout(() => { if (muadil.b) $('muadilArama').value = muadil.b.ad; }, 140));
  $('muadilHizli').addEventListener('click', (e) => { const c = e.target.closest('[data-slug]'); if (c) muadilSec(M.besin(c.dataset.slug)); });
  $('muadilAdet').addEventListener('input', (e) => { const v = parseFloat(e.target.value); if (v > 0) { muadil.adet = v; muadilCiz(); } });
  $('muadil').addEventListener('click', (e) => {
    const ts = e.target.closest('[data-temel-sec]');
    if (ts) { muadil.temel = ts.dataset.temelSec; muadilCiz(); $('muadilOzet').querySelector('[data-temel-sec="' + muadil.temel + '"]').focus(); return; }
    const s = e.target.closest('[data-muadil-sec]');
    if (s) { const yeni = M.besin(s.dataset.muadilSec); muadil.temel = 'karb'; muadilSec(yeni); return; }
    const liste = $('muadilSonuc')._liste;
    const a = e.target.closest('[data-muadil-ekle]');
    if (a) { const m = liste[+a.dataset.muadilEkle]; ekle(M.besin(m.slug), m.miktar, m.birim); return; }
    const d = e.target.closest('[data-muadil-degistir]');
    if (d) {
      const m = liste[+d.dataset.muadilDegistir], k = tabaktaki(), x = M.besin(m.slug), eski = M.kisaAd(muadil.b);
      kalemler[kalemler.indexOf(k)] = degisimKalemi(m, k);
      hazirNo = -1; yenile();
      DD.toast(eski + ' yerine ' + M.kisaAd(x) + ' geldi');
    }
  });

  /* Besin Karşılaştır'dan gelen besin: aynı bölmedeki ilk kalemin yerine geçer */
  function disaridan() {
    const b = M.besin(new URLSearchParams(location.search).get('besin'));
    if (!b) return;
    const o = olcusu(b), i = kalemler.findIndex((k) => bolmesi(M.besin(k.slug)) === bolmesi(b));
    const kalem = { slug: b.slug, miktar: o.ilk, birim: o.birim };
    if (i >= 0) kalemler[i] = kalem; else kalemler.push(kalem);
    hazirNo = -1; muadil.b = b;
    DD.toast(M.kisaAd(b) + ' tabağına eklendi');
  }
  /* Bant sayıları aramanın kapsamıdır: aramanın okuduğu listelerden sayılır */
  document.querySelector('[data-arama-sayi="yemek"]').textContent = M.sayi(yemekler().length, 0);
  document.querySelector('[data-arama-sayi="besin"]').textContent = M.sayi(besinKaynak().length, 0);
  /* Öğüne ekle (Web Kullanıcı Akışı: Akıllı Tabak). Üyede bugünkü günlüğe yazar; misafirde tabak depoda tutulur ve kayıt penceresi açılır */
  const OGUN_AD = { kahvalti: 'Kahvaltı', ara1: 'Ara Öğün', ogle: 'Öğle Yemeği', ara2: 'İkindi', aksam: 'Akşam Yemeği' };
  const porsiyonEtiket = (m) => { const p = PORSIYON.find((x) => x[1] === m); return p ? p[0] + ' porsiyon' : M.sayi(m, 1) + ' porsiyon'; };
  function gunlukKalemleri() {
    return kalemler.map((k) => {
      const b = M.besin(k.slug), tarif = M.tarifMi(b), v = (a) => M.miktarDeger(b, a, k.miktar, k.birim) || 0;
      const olcu = yemekBilgi(b) ? porsiyonEtiket(k.miktar) : k.birim === 'g' ? M.sayi(k.miktar, 0) + ' g' : M.sayi(k.miktar, 1) + ' ' + olcuAdi(b);
      const gram = yemekBilgi(b) ? Math.round(yemekBilgi(b).gram * k.miktar) : k.birim === 'g' ? k.miktar : null;
      return { tur: tarif ? 'tarif' : 'besin', slug: tarif ? k.slug.slice(6) : k.slug, ad: b.ad, olcu, miktar: gram, kcal: v('kcal'), protein: v('protein'), yag: v('yag'), karb: v('karb') };
    });
  }
  function kayitDurum(ogun) {
    const d = $('tabakKayitDurum');
    d.hidden = false;
    d.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>Tabağın ' + OGUN_AD[ogun] + ' öğününe eklendi · <a href="' + DD.kok + 'hesabim/gunluk-takibim/">Günlük takibimde gör</a></span>';
  }
  const sorgu = new URLSearchParams(location.search);
  if (OGUN_AD[sorgu.get('ogun')]) $('tabakOgun').value = sorgu.get('ogun');
  let bekleyenOgun = null;
  $('tabakKaydet').addEventListener('click', () => {
    if (!kalemler.length) { DD.toast('Önce tabağına bir yemek ekle.', 'uyari'); return; }
    const ogun = $('tabakOgun').value, l = gunlukKalemleri(), h = hesap();
    if (DD.oturum.acik()) {
      const d = DD.demo.al();
      d.uyeYerel = d.uyeYerel || {};
      const ek = (d.uyeYerel.gunlukEk = d.uyeYerel.gunlukEk || {});
      ek[DD.bugun] = (ek[DD.bugun] || []).concat(l.map((x) => Object.assign(x, { ogun, kaynak: 'akilli-tabak' })));
      DD.demo.kaydet();
      /* Günlük Takibim'in "Yeni öğün ekle" penceresinden gelindiyse oraya dönülür */
      const donus = DD.davet.guvenliYol(sorgu.get('donus') || '');
      if (donus) { location.href = DD.kok + donus + (donus.includes('?') ? '&' : '?') + 'tabak=1'; return; }
      kayitDurum(ogun);
      DD.toast('Tabağın ' + OGUN_AD[ogun] + ' öğününe eklendi.');
      return;
    }
    DD.misafir.ekle('tabak', { ogun, kalemler: l, skor: h.skor }, 'tabak-' + ogun);
    bekleyenOgun = ogun;
    DD.davet.ac({ baslik: 'Bu tabağı bugünkü öğünlerime ekle', metin: 'Tabağın (' + h.skor + ' / 100) bu tarayıcıda tutuluyor. Kaydolunca bugünkü ' + OGUN_AD[ogun] + ' öğününe eklenir ve takibe başlarsın.' });
  });
  document.addEventListener('dd:oturum', () => { if (bekleyenOgun) { kayitDurum(bekleyenOgun); bekleyenOgun = null; } });

  cizimKur();
  const taslak = DD.misafir.taslak('tabak');
  if (taslak && Array.isArray(taslak.kalemler) && taslak.kalemler.every((k) => M.besin(k.slug))) { kalemler = taslak.kalemler; hazirNo = taslak.hazirNo; } else yukle(0);
  disaridan(); yenile();
})();
