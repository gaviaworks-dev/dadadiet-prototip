/* Besin Karşılaştır: sonuç blokları derlemede basılır, değişiklikte aynı işlev yeniden çizer.
   Bloklar saf metin üretir: besin-karsilastir.mjs dosyayı derlemede de çalıştırır, DOM kısmı document yoksa atlanır. */
(function () {
  'use strict';
  const M = window.DDM, kac = M.kac;

  /* ── Besin görseli: yalnız yerel dosyalar. Özel görseli olmayan kayıt kategori görselini alır. ── */
  const GORSEL = {
    'kinoa-pismis': 'icerik/9b0fff0da41bd7e106006dc7d2c148f6b5d6a7ce8eabe02381a271db80fe0758.webp',
    'pirinc-pismis': 'puf/pirinci-ve-bakliyati-ayiklayip-yikamak.webp',
    'bulgur-pismis': 'icerik/a00be5fd-0610-46c9-ab74-cd8d5abc6129.webp',
    'kuskus-pismis': 'icerik/2122d4d7629f5a4253900b6e589b4601bbd56ac954809adf4b10f17202e25c3d.webp',
    'yulaf-beyaz': 'icerik/c41cbaf9-9877-470d-82b0-827f6142ade1.webp',
    'makarna-haslanmis': 'icerik/b6386e15a3e6229c701d7a07ada615e855876f101836c445530b5f7f4a4d786d.webp',
    'tam-bugday-makarna': 'icerik/c4bffd4c010cb84556c119a328279dfd79ca689e8338407b3f68a2d923d7a2ad.webp',
    'tam-bugday-ekmegi': 'rehber/tam-tahil-rafine-fark.webp',
    'kepekli-ekmek': 'icerik/28dab0aa-be4a-4f30-b2df-321833ea3c39.webp',
    'beyaz-ekmek': 'rehber/bir-dilim-ekmek-kac-kalori.webp',
    'mercimek-corbasi': 'tarif/mercimek-corbasi.webp',
    'somon-atlantik-ciftlik': 'icerik/9f275525a4fc920d6a5d2044cbff17383c0c93e21be13d7d67f0cf12297a0ed2.webp',
    'levrek-izgara': 'icerik/71c3d47531ba1f54641c6f8a8d19823d2d7f29f6d3119c88457c05d5315a3381.webp',
    'alabalik-izgara': 'icerik/6deef8df4941252185f3b7e9464ec599d8e5eb4ca921878262a239a33fc108c4.webp',
    'ton-baligi-suda': 'icerik/8d8963ec-e7d1-4e85-bc27-9e8fbf294777.webp',
    'karides-haslanmis': 'icerik/b33bb9ef-62da-4bb1-9a6a-26e3e3308f95.webp',
    'tavuk-gogsu-izgara': 'icerik/efa5b7027e0b6e1230b1a4f88a3f224632973cb78852cf208adab78db2c68969.webp',
    'hindi-gogsu-firinda': 'icerik/21fd2f48a6cc58406e32eaed5bcb0ace404c6b56ffd041bf40530208c5b6b1af.webp',
    'tavuk-but-firinda': 'puf/evde-yemek-termometresi-nasil-kullanilir.webp',
    'dana-kusbasi-haslanmis': 'icerik/8bf21bae6d7147edd8d6fe1f038b156703bdca9bad004929589858268552f57e.webp',
    badem: 'rehber/bir-avuc-badem-kac-kalori.webp',
    'ceviz-ic': 'kac-kalori/bir-avuc-ceviz-kac-kalori.webp',
    'findik-cig': 'kac-kalori/bir-avuc-findik-kac-kalori.webp',
    zeytinyagi: 'icerik/70db90fa80ba13a5cf527084e4985258bfefe5600427ce1bb1cb915a2e4f44e8.webp',
    tereyagi: 'rehber/doymus-doymamis-yag-farki.webp',
    avokado: 'besin/avokado.webp',
    'muz-anamur': 'icerik/2c1df147415c465c3a23fc2cb1eaa401dccd4e4870b4cbb786bfd05988c51be0.webp',
    roka: 'kac-kalori/bir-porsiyon-roka-kac-kalori.webp',
    'marul-kivircik': 'kac-kalori/bir-porsiyon-marul-kac-kalori.webp',
    'carliston-biber': 'kac-kalori/bir-porsiyon-yesil-biber-kac-kalori.webp',
    havuc: 'icerik/d8745ed43d540af6008b1342c3e9c4c1eeb929064fe74972b74d63d6a15f3143.webp',
    'mercimek-haslanmis': 'icerik/8e2ba3cfe856813685e23c3e8a1086b0a4ffef7d8038f348ecfffbb31f80caab.webp',
    'humus-ev-yapimi': 'icerik/7690eb2c-4da7-4658-9d94-6a0530bb080d.webp',
    'yumurta-haslanmis': 'icerik/cb258b8a9f4c08f5ca6583fa193bdf00b3c0a8eba45760bbe31bf814b9e3364d.webp',
    omlet: 'icerik/d7a13b7e-25d4-4569-99da-d6361470b870.webp',
    'beyaz-peynir-yarim-yagli': 'icerik/8ea06735394dc44f67a32fff334f05d8add0ab5a454fc47f452cc26d7a37bfcd.webp',
    'kuru-kayisi': 'rehber/karbonhidrat-turleri-basit-bilesik.webp',
    bal: 'rehber/karbonhidrat-turleri-basit-bilesik.webp',
  };
  const KATEGORI_GORSEL = {
    tahil: 'icerik/3d852d457625d14a05d04a16fdb067c6f2f0ade5f2ccfe8388c9cd081052f572.webp',
    sebze: 'rehber/sebzeleri-onceden-hazirlamak-ne-degistirir.webp',
    meyve: 'ipucu/gunde-kac-porsiyon-meyve-yenir.webp',
    sut: 'ipucu/gunde-kac-porsiyon-sut-urunu-gerekir.webp',
    balik: 'icerik/3fcc72cf55323efa5d1c6348e50dfe239f4a7ab0c8dd17ef6d146f83eee661f4.webp',
    et: 'icerik/26771504-7769-49db-8a36-a1e590229f2d.webp',
    baklagil: 'ipucu/kuru-baklagili-islatmak-neyi-kolaylastirir.webp',
    kuruyemis: 'ipucu/bir-avuc-kuruyemis-ne-kadar-eder.webp',
    yag: 'icerik/70db90fa80ba13a5cf527084e4985258bfefe5600427ce1bb1cb915a2e4f44e8.webp',
    tatli: 'rehber/karbonhidrat-turleri-basit-bilesik.webp',
    tarif: 'icerik/28b9b1db1889215e8cb26ee4f4def93efc95860ae47c11e7fdd67058a3a2d513.webp',
  };
  const tarifGorseli = (b) => {
    const k = window.DD_VERI && window.DD_VERI.tarifler, l = Array.isArray(k) ? k : (k && k.tarifler) || [];
    const t = l.find((x) => 'tarif-' + x.slug === b.slug);
    return t && t.gorsel ? 'icerik/' + t.gorsel.split('/').pop() : null;
  };
  M.besinGorsel = (b, kok2) => kok2 + 'assets/img/' + (GORSEL[b.slug] || (M.tarifMi(b) && tarifGorseli(b)) || KATEGORI_GORSEL[b.kategori_kodu] || KATEGORI_GORSEL.tarif);

  /* ── Sonuç blokları ─────────────────────────────────────────────────────── */
  const olcuMetni = (b, kip) => {
    const g = M.porsiyonGram(b);
    if (kip === '100') return '100 g başına';
    if (kip === '100kcal') return b.kcal ? '100 kcal başına (' + M.sayi(10000 / b.kcal, 0) + ' g)' : '100 kcal başına';
    return b.porsiyon ? b.porsiyon.ad + (g ? ' (' + g + ' g)' : '') : 'Porsiyon verisi yok';
  };
  const hane = (r) => (r.s.b == null ? 1 : r.s.b);
  const degerYaz = (r, v) => M.goster(v, r.s.birim, hane(r));
  const bolumBas = (ikon, etiket, baslik, metin) => '<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i> ' + etiket + '</span><h2>' + baslik + '</h2><p class="giris-metni">' + metin + '</p></div></div>';

  /* Rozetler karşılaştırma motorunun verdiği önde bilgisinden gelir */
  const rozetler = (r, benim) => r.ana.concat(r.gli).filter((x) => x.k === benim && x.s.rozet)
    .concat(r.mik.filter((x) => x.k === benim && x.s.neden).slice(0, 2)).slice(0, 5);

  /* Prototipte tek besin detayı üretilir, bütün besin kartları ona bağlanır (ortak.mjs DETAY.besin) */
  const kartYolu = (x) => (M.tarifMi(x) ? String(x.yol).replace(/^\//, '') + '/' : 'besin/avokado/');

  function duelloKart(x, r, taraf, kip, kok2) {
    const satir = r.ana[0], kcal = taraf === 'a' ? satir.x : satir.y, rz = rozetler(r, taraf === 'a' ? -1 : 1);
    return '<article class="duello-kart"><div class="duello-gorsel"><img src="' + M.besinGorsel(x, kok2) + '" alt=""></div><div class="duello-govde">'
      + '<div class="duello-bas"><div><h2 class="kart-baslik"><span class="seri-nokta ' + taraf + '" aria-hidden="true"></span>' + kac(M.kisaAd(x)) + '</h2><p class="duello-alt">' + kac(x.kategori || '') + ' · ' + kac(olcuMetni(x, kip)) + '</p></div>'
      + '<p class="duello-kalori">' + (kcal == null ? '<span>veri yok</span>' : '<b>' + M.sayi(kcal, hane(satir)) + '</b><span>kcal</span>') + '</p></div>'
      + (rz.length ? '<div class="cipler">' + rz.map((q) => '<span class="rozet olumlu"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> ' + kac(q.s.rozet) + '</span>').join('') + '</div>'
        : '<p class="kart-metin">Karşılaştırılan ölçütlerde öne çıkan bir farkı yok.</p>')
      + (x.yol ? '<a class="dugme hayalet kucuk" href="' + kok2 + kartYolu(x) + '">Besin kartı</a>' : '') + '</div></article>';
  }

  /* Makro: enerji payı 4/4/9 ile, akıllı tabakla aynı hesap. Üç makrodan biri yoksa halka çizilmez. */
  const MAKRO = [['protein', 'Protein', 4, 'var(--makro-protein)', 'm-protein'], ['karb', 'Karbonhidrat', 4, 'var(--makro-karb)', 'm-karb'], ['yag', 'Yağ', 9, 'var(--makro-yag)', 'm-yag']];
  function makroKart(x, kip) {
    const gram = MAKRO.map((m) => M.deger(x, m[0], kip)), kcal = M.deger(x, 'kcal', kip), lif = M.deger(x, 'lif', kip);
    const tamam = gram.every((g) => g != null), enerji = gram.map((g, i) => (tamam ? g * MAKRO[i][2] : 0)), toplam = enerji.reduce((a, b) => a + b, 0);
    const yuzde = enerji.map((e) => (toplam ? Math.round((e / toplam) * 100) : 0));
    const bas = '<div class="kart"><div class="kart-bas"><div><h3 class="kart-baslik"><span class="seri-nokta ' + (makroKart.taraf) + '" aria-hidden="true"></span>' + kac(M.kisaAd(x)) + '</h3><p>' + kac(olcuMetni(x, kip)) + '</p></div></div><div class="kart-govde">';
    if (!toplam) return bas + '<p class="kart-metin">Bu ölçüde makro verisi kayıtlı değil, başka bir ölçü seç.</p></div></div>';
    let kayma = 0;
    const dilim = enerji.map((e, i) => {
      const pay = (e / toplam) * 100;
      if (pay < 0.5) return '';
      /* Dilimler arasında 1 birimlik zemin boşluğu; tek dilimde boşluk yok */
      const bosluk = yuzde.filter((y) => y > 0).length > 1 ? 1 : 0;
      const s = '<circle cx="60" cy="60" r="48" fill="none" stroke="' + MAKRO[i][3] + '" stroke-width="16" pathLength="100" stroke-dasharray="' + Math.max(pay - bosluk, 0.5).toFixed(2) + ' 100" stroke-dashoffset="' + (-kayma).toFixed(2) + '" transform="rotate(-90 60 60)"><title>' + MAKRO[i][1] + ' %' + yuzde[i] + '</title></circle>';
      kayma += pay;
      return s;
    }).join('');
    const etiket = MAKRO.map((m, i) => m[1] + ' yüzde ' + yuzde[i]).join(', ');
    return bas + '<div class="makro-halka-satir"><svg class="makro-halka" viewBox="0 0 120 120" role="img" aria-label="' + kac(M.kisaAd(x)) + ' enerjisinin makro dağılımı: ' + etiket + '">'
      + '<circle cx="60" cy="60" r="48" fill="none" stroke="var(--olcer-zemin)" stroke-width="16"/>' + dilim
      + (kcal == null ? '' : '<text class="makro-halka-sayi" x="60" y="60" text-anchor="middle">' + M.sayi(kcal, 0) + '</text><text class="makro-halka-birim" x="60" y="76" text-anchor="middle">kcal</text>') + '</svg>'
      + '<dl class="makro-liste">' + MAKRO.map((m, i) => '<div><dt><span class="lejant-kalem ' + m[4] + '">' + m[1] + '</span></dt><dd>' + M.goster(gram[i], 'g') + '<b>%' + yuzde[i] + '</b></dd></div>').join('')
      + '<div><dt><span class="lejant-kalem m-lif">Lif</span></dt><dd>' + M.goster(lif, 'g') + '</dd></div></dl></div></div></div>';
  }

  /* Yan yana çubuklar: her satırın ölçeği kendi içinde, birimler farklı olduğu için satırlar birbiriyle kıyaslanmaz */
  function yanYana(r, adA, adB) {
    const oran = (v, u) => (v == null || u == null || Math.max(v, u) <= 0 ? 0 : Math.round((v / Math.max(v, u)) * 100));
    const satir = (x) => '<div class="kelebek-satir"><span class="kelebek-ad">' + kac(x.s.ad.replace(' (lif dahil)', '')) + '</span>'
      + '<span class="kelebek-deger sol">' + degerYaz(x, x.x) + '</span><div class="olcer ters seri-a"><span data-oran="' + oran(x.x, x.y) + '"></span></div>'
      + '<div class="olcer seri-b"><span data-oran="' + oran(x.y, x.x) + '"></span></div><span class="kelebek-deger sag">' + degerYaz(x, x.y) + '</span></div>';
    return '<div class="kart"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-chart-simple" aria-hidden="true"></i> Yan Yana Değerler</h3><p>Her satırda uzun çubuk o değeri yüksek olan besindir.</p></div></div><div class="kart-govde">'
      + '<div class="kelebek-bas"><span><span class="seri-nokta a" aria-hidden="true"></span>' + adA + '</span><span>' + adB + '<span class="seri-nokta b" aria-hidden="true"></span></span></div>'
      + '<div class="kelebek">' + r.ana.filter((x) => ['kcal', 'protein', 'yag', 'doymus_yag', 'karb', 'lif', 'seker'].includes(x.s.a)).map(satir).join('') + '</div></div></div>';
  }

  /* Öne çıkan farklar: iki taraftan da en belirgin olanlar, önce makro ve glisemik, sonra mikro */
  function farklar(r) {
    const l = r.tum.filter((x) => x.k !== 0 && !x.s.isaretsiz && x.s.rozet).map((x) => {
      const yuksek = Math.max(x.x, x.y), dusuk = Math.min(x.x, x.y);
      return { ...x, yuksek, dusuk, kat: dusuk > 0 ? yuksek / dusuk : Infinity };
    }).sort((p, q) => (p.grup === 'mikro') - (q.grup === 'mikro') || q.kat - p.kat);
    const a = l.filter((x) => x.k === -1), b = l.filter((x) => x.k === 1), secili = a.slice(0, 2).concat(b.slice(0, 2));
    return secili.concat(l.filter((x) => !secili.includes(x))).slice(0, 4);
  }
  const farkMetni = (x) => {
    if (x.dusuk <= 0) return x.s.yon === 'az' ? 'Bu besinde 0' : 'Karşısındakinde 0';
    if (x.s.yon === 'az') return '%' + M.sayi(((x.yuksek - x.dusuk) / x.yuksek) * 100, 0) + ' daha az';
    return x.kat >= 2 ? M.sayi(x.kat, 1) + ' kat daha fazla' : '%' + M.sayi((x.kat - 1) * 100, 0) + ' daha fazla';
  };
  function farkKart(x, a, b, kok2) {
    const kazanan = x.k === -1 ? a : b, yuzde = (v) => (x.yuksek > 0 ? Math.round((v / x.yuksek) * 100) : 0);
    const cubuk = (ad, v, taraf) => '<div class="fark-satir"><span class="fark-besin">' + kac(ad) + '</span><b>' + degerYaz(x, v) + '</b><div class="olcer seri-' + taraf + '"><span data-oran="' + yuzde(v) + '"></span></div></div>';
    return '<article class="fark-kart"><div class="fark-ust"><img src="' + M.besinGorsel(kazanan, kok2) + '" alt="" loading="lazy"><div><p class="fark-kazanan">' + kac(M.kisaAd(kazanan)) + '</p><h3 class="kart-baslik">' + kac(x.s.rozet) + '</h3></div></div>'
      + '<p class="fark-buyuk">' + farkMetni(x) + (x.grup === 'gli' ? ' <small>tahmini</small>' : '') + '</p>' + cubuk(M.kisaAd(a), x.x, 'a') + cubuk(M.kisaAd(b), x.y, 'b') + '</article>';
  }

  M.karsilastirBloklar = function (a, b, kip, kok2) {
    const r = M.karsilastirma(a, b, kip), p = M.karsilastirParcalar(a, b, kip, kok2);
    const adA = kac(M.kisaAd(a)), adB = kac(M.kisaAd(b)), fark = farklar(r);
    const makro = (x, taraf) => { makroKart.taraf = taraf; return makroKart(x, kip); };
    return {
      ozet: p.notlar + '<div class="duello">' + duelloKart(a, r, 'a', kip, kok2) + '<span class="duello-vs" aria-hidden="true">vs</span>' + duelloKart(b, r, 'b', kip, kok2) + '</div>',
      makro: bolumBas('fa-chart-pie', 'Makro dağılımı', 'Enerji Nereden Geliyor?', 'Protein ve karbonhidrat gramı 4, yağ gramı 9 kcal sayılır; oranlar bu yaklaşık hesaptan gelir.')
        + '<div class="yigin"><div class="iki-kolon esit">' + makro(a, 'a') + makro(b, 'b') + '</div>' + yanYana(r, adA, adB) + '</div>',
      fark: bolumBas('fa-bolt', 'Öne çıkan farklar', 'İkisini Ayıran Değerler', 'Aynı ölçüde karşılaştırıldığında en belirgin farklar.')
        + (fark.length ? '<div class="kart-izgara c4 ray-dar fark-izgara">' + fark.map((x) => farkKart(x, a, b, kok2)).join('') + '</div>' : '<div class="kart"><div class="kart-govde"><p class="kart-metin">Bu ikili karşılaştırılan ölçütlerde birbirine yakın, belirgin bir fark çıkmadı.</p></div></div>'),
      tablo: bolumBas('fa-table-list', 'Ayrıntılı tablo', 'Bütün Değerler', 'Vitamin ve mineraller dahil kayıtlı her değer. Kaydı olmayan değer boş bırakılır, tahmin edilmez.') + p.tablo,
      secim: '<div class="yigin">' + p.secim.replace('<div class="bolum-bas sik-bas"><div>', '<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i> Seçim rehberi</span>') + '</div>',
    };
  };

  if (typeof document === 'undefined') return;
  const kap = document.getElementById('karsilastir');
  if (!kap) return;
  const ozet = document.getElementById('karsilastirSonuc'), baslik = document.getElementById('karsilastirBaslik');
  const alanlar = ['makro', 'fark', 'tablo', 'secim'].map((ad) => [ad, document.getElementById('sonuc-' + ad)]);
  const gA = document.getElementById('besinA'), gB = document.getElementById('besinB');
  const sorgu = new URLSearchParams(location.search);
  const durum = { a: M.besin(sorgu.get('a') || kap.dataset.a), b: M.besin(sorgu.get('b') || kap.dataset.b), kip: '100' };
  const adresYaz = () => { if (durum.a && durum.b) history.replaceState(null, '', location.pathname + '?a=' + durum.a.slug + '&b=' + durum.b.slug); };
  function ciz() {
    const tam = durum.a && durum.b;
    alanlar.forEach((x) => { x[1].hidden = !tam; });
    if (!tam) {
      ozet.innerHTML = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i></span><h3>İki besin seç</h3><p>Yukarıdaki iki kutuya birer besin yazınca karşılaştırma burada açılır.</p><a class="dugme birincil" href="' + DD.kok + 'besin-karsilastir/kinoa-vs-pirinc/">Örnek karşılaştırmayı aç</a></div>';
      return;
    }
    const bl = M.karsilastirBloklar(durum.a, durum.b, durum.kip, DD.kok);
    ozet.innerHTML = bl.ozet;
    alanlar.forEach((x) => { x[1].querySelector('.kap').innerHTML = bl[x[0]]; });
    document.querySelectorAll('.bolum-dizi [data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
    if (baslik) baslik.textContent = M.kisaAd(durum.a) + ' ve ' + M.kisaAd(durum.b);
  }
  const bagla = (girdi, anahtar, diger) => {
    M.oneri(girdi, {
      haric: () => (durum[diger] ? [durum[diger].slug] : []),
      secildi(b) { durum[anahtar] = b; girdi.value = M.kisaAd(b); ciz(); adresYaz(); },
    });
    girdi.addEventListener('input', () => { if (!girdi.value.trim()) { durum[anahtar] = null; ciz(); } });
    girdi.addEventListener('blur', () => { if (durum[anahtar] && girdi.value.trim()) setTimeout(() => { girdi.value = durum[anahtar] ? M.kisaAd(durum[anahtar]) : ''; }, 140); });
  };
  bagla(gA, 'a', 'b'); bagla(gB, 'b', 'a');
  if (durum.a) gA.value = M.kisaAd(durum.a);
  if (durum.b) gB.value = M.kisaAd(durum.b);
  kap.querySelector('.segment').addEventListener('dd:secim', (e) => { durum.kip = e.detail.deger; ciz(); });
  document.getElementById('yerDegistir').addEventListener('click', () => {
    [durum.a, durum.b] = [durum.b, durum.a];
    gA.value = durum.a ? M.kisaAd(durum.a) : ''; gB.value = durum.b ? M.kisaAd(durum.b) : ''; ciz(); adresYaz();
  });
  if (sorgu.get('a') || sorgu.get('b')) ciz();
})();
