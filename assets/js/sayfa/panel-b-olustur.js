/* Plan oluşturucu. Durum S üzerinde tutulur, her değişiklikte görünüm yeniden kurulur.
   Plan kaydı demo.planlar şemasındadır; üye tarafı aynı kaydı hesabim/beslenme-planim ekranında okur. */
(function () {
  'use strict';
  const { $, $$, esc, sayi } = PB;
  const dar = window.matchMedia('(max-width:1199px)');
  let S, kirli = false, secGun = 0, hedefHucre = null, acikKalem = null, menuKalem = null, menuGun = null, acikMenu = null;
  let kaynak = 'tarif', tarifKaynak = 'gastro', duzenTarif = null, arama = '', mikroSuzgec = null, altHedef = null, degistirHedef = null;
  let gorunum = 'hafta', analizKapsam = 'hafta', analizOge = 'kcal', bosBasladi = false, kopyaKalem = null, sablonGun = null, onizGun = 0;

  /* ── Durum ─────────────────────────────────────────────────────────── */
  const yeniPlan = () => ({
    id: null, danisan_id: '', ad: '', hedef_kcal: 1600, durum: 'taslak', danisana_not: '', makro: PB.makroVarsayilan(),
    baslangic: PB.gunEkle(DD.bugun, 3), ogun_duzeni: PB.ogunSablonu(), gunler: PB.bosGunler(), surum: 0,
  });
  const kopya = (o) => JSON.parse(JSON.stringify(o));
  /* Serbest kalem slug taşımaz: ad, olcu ve değerler kalemin kendisindedir */
  const kalemSade = (k) => {
    const y = k.tur === 'serbest' ? { tur: 'serbest', ad: k.ad, olcu: k.olcu, miktar: k.miktar || 1, kcal: k.kcal || 0, protein: k.protein || 0, yag: k.yag || 0, karb: k.karb || 0 } : { tur: k.tur, slug: k.slug, miktar: k.miktar };
    /* Kayıtlı tarifin plandaki kopyası: tarif sonradan değişse de gönderilen plan aynı kalır */
    if (k.baz) ['tarif_id', 'baz', 'lif', 'alerjenler', 'malzemeler'].forEach((a) => { if (k[a] != null) y[a] = k[a]; });
    if (k.alternatif) y.alternatif = kalemSade(k.alternatif);
    return y;
  };
  const gunIcerikleri = (gunler) => gunler.map((g) => {
    const y = { gun: g.gun, ad: g.ad, ogunler: {} };
    PB.ogunSablonu().forEach((o) => { y.ogunler[o.id] = (g.ogunler[o.id] || []).map(kalemSade); });
    return y;
  });
  function yukle() {
    const id = PB.parametre('plan'), sablonId = PB.parametre('sablon');
    const kayit = id && PB.liste('planlar').find((p) => p.id === id);
    S = yeniPlan();
    if (kayit) {
      /* Gönderilmiş planın kaydedilmiş düzenlemesi taslak alanında bekler; danışan eski sürümü görür */
      const kaynakPlan = kayit.taslak || kayit;
      Object.assign(S, kopya(kaynakPlan));
      S.gunler = gunIcerikleri(kaynakPlan.gunler);
      S.ogun_duzeni = kaynakPlan.ogun_duzeni ? kopya(kaynakPlan.ogun_duzeni) : PB.ogunSablonu();
      S.baslangic = kaynakPlan.baslangic || kaynakPlan.tarih || S.baslangic;
      S.makro = kaynakPlan.makro ? kopya(kaynakPlan.makro) : PB.makroVarsayilan();
    } else if (id) DD.toast('Bu plan bulunamadı, boş plan açıldı.', 'uyari');
    const d = PB.parametre('danisan');
    if (d && PB.danisan(d)) S.danisan_id = d;
    const sb = sablonId && PB.liste('sablonlar').find((s) => s.id === sablonId);
    if (sb) sablonUygula(sb);
  }
  const danisan = () => PB.danisan(S.danisan_id);
  const acikOgunler = () => S.ogun_duzeni.filter((o) => o.acik);
  const gunKalemleri = (g) => acikOgunler().flatMap((o) => g.ogunler[o.id]);
  const dolu = () => S.gunler.some((g) => Object.values(g.ogunler).some((l) => l.length));
  const degisti = () => { kirli = true; ciz(); };
  const gunAd = (i) => PB.gunAd(S.baslangic, i);
  const gunKisa = (i) => PB.gunKisa(S.baslangic, i);
  /* Hafta içi ve hafta sonu plan sırasına göre değil, günün takvimdeki yerine göre seçilir */
  const gunGrubu = (haftaSonu) => S.gunler.map((_, i) => i).filter((i) => (PB.haftaGunu(S.baslangic, i) >= 5) === haftaSonu);
  const gunTarihi = (i) => PB.tarih(PB.gunEkle(S.baslangic, i)).slice(0, 5);
  const makroHedef = () => PB.makroGram(S.hedef_kcal, S.makro);
  const makroToplam = () => S.makro.p + S.makro.k + S.makro.y;
  const uyariOf = (k) => PB.kalemUyariK(k, danisan()).concat(k.alternatif ? PB.kalemUyariK(k.alternatif, danisan()) : []);
  const gorselHtml = (k, sinif) => {
    const g = k.tur === 'serbest' ? '' : PB.gorsel(k.tur, k.slug), c = k.tur === 'besin' ? PB.katalog(k) : null;
    return '<span class="' + sinif + '">' + (g ? '<img src="' + g + '" alt="" loading="lazy">' : '<i class="fa-solid ' + (k.baz ? 'fa-bookmark' : k.tur === 'serbest' ? 'fa-pen' : c ? PB.besinIkon(c) : 'fa-bowl-food') + '" aria-hidden="true"></i>') + '</span>';
  };

  /* ── Hafta ızgarası ────────────────────────────────────────────────── */
  function kartHtml(k, gi, oid, ki) {
    const d = PB.kalemDeger(k), uy = uyariOf(k), ad = esc(PB.kalemAd(k)), cumle = esc(PB.kalemCumle(k)), adr = ' data-g="' + gi + '" data-o="' + oid + '" data-k="' + ki + '"';
    return '<div class="plan-kart' + (uy.length ? ' uyarili' : '') + '" draggable="true"' + adr + ' title="' + cumle + '">' +
      '<button class="plan-kart-ac" type="button" data-plan="kalem-ac"' + adr + ' aria-label="' + cumle + ', ' + sayi(d.kcal) + ' kcal, porsiyonu düzenle">' +
      '<span class="plan-kart-ust">' + gorselHtml(k, 'plan-kart-gorsel') + '<span>' + sayi(d.kcal) + ' kcal</span>' + (uy.length ? '<i class="fa-solid fa-triangle-exclamation uyari-ikon" aria-hidden="true"></i>' : '') + '</span>' +
      '<span class="plan-kart-ad">' + ad + '</span>' + (k.alternatif ? '<span class="veya">veya ' + esc(PB.kalemAd(k.alternatif)) + '</span>' : '') + '</button>' +
      '<button class="plan-mini-dugme plan-kart-menu" type="button" data-plan="kart-menu"' + adr + ' aria-haspopup="menu" aria-label="' + ad + ' işlemleri"><i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i></button>' +
      '<span class="yazdirma-metin">' + cumle + (k.alternatif ? ' veya ' + esc(PB.kalemCumle(k.alternatif)) : '') + '</span></div>';
  }
  function izgaraCiz() {
    const kap = $('#planIzgara'), gunler = S.gunler.map((_, i) => i);
    kap.style.setProperty('--plan-gun', gunler.length);
    let h = '<div class="plan-bas plan-kose"></div>';
    gunler.forEach((i) => {
      const t = PB.topla(gunKalemleri(S.gunler[i])), s = PB.sapma(t.kcal, S.hedef_kcal);
      h += '<div class="plan-bas' + (i === secGun ? ' secili' : '') + '"><div class="plan-bas-ust"><button class="plan-gun-ac" type="button" data-plan="gun-sec" data-g="' + i + '" aria-pressed="' + (i === secGun) + '">' + gunKisa(i) + '<small>' + (i + 1) + '. Gün · ' + gunTarihi(i) + '</small></button>' +
        '<button class="plan-mini-dugme" type="button" data-plan="gun-menu" data-g="' + i + '" aria-haspopup="menu" aria-label="' + gunAd(i) + ' işlemleri"><i class="fa-solid fa-ellipsis" aria-hidden="true"></i></button></div>' +
        '<span class="gun-rozet ' + s.durum + '" title="' + (s.durum ? 'Hedefe göre ' + s.etiket : 'Gün boş') + '">' + (t.kcal ? sayi(t.kcal) : '—') + '<span class="rozet-hedef"> / ' + sayi(S.hedef_kcal) + '</span></span></div>';
    });
    acikOgunler().forEach((o) => {
      h += '<div class="plan-ogun"><i class="fa-solid ' + o.ikon + '" aria-hidden="true"></i>' + esc(o.ad) + '<small>' + esc(DD.bicim.saat(o.saat)) + '</small></div>';
      gunler.forEach((i) => {
        const l = S.gunler[i].ogunler[o.id];
        const ekle = '<button class="plan-ekle simge" type="button" data-plan="ekle-ac" data-g="' + i + '" data-o="' + o.id + '" aria-label="' + gunAd(i) + ' ' + esc(o.ad) + ' öğününe ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>';
        h += '<div class="plan-hucre' + (l.length ? '' : ' bos') + '" data-g="' + i + '" data-o="' + o.id + '">' + l.map((k, ki) => kartHtml(k, i, o.id, ki)).join('') +
          '<div class="plan-hucre-alt">' + (l.length ? '<span class="plan-ogun-toplam">' + sayi(PB.topla(l).kcal) + ' kcal</span><button class="plan-mini-dugme ogun-kopya" type="button" data-plan="kopyala-ac" data-g="' + i + '" data-o="' + o.id + '" aria-label="' + gunAd(i) + ' ' + esc(o.ad) + ' öğününü kopyala"><i class="fa-solid fa-clone" aria-hidden="true"></i></button>' : '') + ekle + '</div></div>';
      });
    });
    h += '<div class="plan-ogun">Makro</div>';
    gunler.forEach((i) => {
      const t = PB.topla(gunKalemleri(S.gunler[i])), s = PB.sapma(t.kcal, S.hedef_kcal);
      h += '<div class="plan-toplam yigilmis ' + s.durum + '"><small>P ' + sayi(t.protein) + ' · K ' + sayi(t.karb) + ' · Y ' + sayi(t.yag) + '</small></div>';
    });
    kap.innerHTML = h;
  }

  /* ── Gün görünümü ──────────────────────────────────────────────────── */
  function gunOzetCiz() {
    const t = PB.topla(gunKalemleri(S.gunler[secGun])), h = makroHedef(), s = PB.sapma(t.kcal, S.hedef_kcal);
    const olcu = (sinif, ad, v, hedef, birim) => '<div class="hedef-olcu ' + sinif + '"><span class="ust-satir">' + ad + '<b>' + sayi(v) + ' / ' + sayi(hedef) + ' ' + birim + '</b></span>' +
      '<span class="olcer"><span data-oran="' + (hedef ? Math.min(100, Math.round((v / hedef) * 100)) : 0) + '"></span></span></div>';
    const kap = $('#gunOzet');
    kap.innerHTML = '<div class="hedef-gun"><button class="plan-mini-dugme" type="button" data-plan="gun-sec" data-g="' + ((secGun + 6) % 7) + '" aria-label="Önceki gün"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>' +
      '<span>' + gunAd(secGun) + '<small>' + gunTarihi(secGun) + '</small></span>' +
      '<button class="plan-mini-dugme" type="button" data-plan="gun-sec" data-g="' + ((secGun + 1) % 7) + '" aria-label="Sonraki gün"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div>' +
      olcu('enerji ' + s.durum, 'Enerji', t.kcal, S.hedef_kcal, 'kcal') + olcu('protein', 'Protein', t.protein, h.protein, 'g') + olcu('karb', 'Karb.', t.karb, h.karb, 'g') + olcu('yag', 'Yağ', t.yag, h.yag, 'g');
    $$('[data-oran]', kap).forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
  }
  function gunCiz() {
    $('#gunSecici').innerHTML = S.gunler.map((g, i) => {
      const t = PB.topla(gunKalemleri(g)), s = PB.sapma(t.kcal, S.hedef_kcal);
      return '<button type="button" data-plan="gun-sec" data-g="' + i + '" aria-pressed="' + (i === secGun) + '">' + gunKisa(i) + ' ' + gunTarihi(i) + '<span class="gun-rozet ' + s.durum + '">' + (t.kcal ? sayi(t.kcal) : '—') + '</span></button>';
    }).join('');
    gunOzetCiz();
    const g = secGun, mak = (d) => '<span class="num makro">' + sayi(d.protein, 1) + '</span><span class="num makro">' + sayi(d.karb, 1) + '</span><span class="num makro">' + sayi(d.yag, 1) + '</span><span class="num makro">' + sayi(d.lif, 1) + '</span>';
    $('#gunDetay').innerHTML = acikOgunler().map((o) => {
      const l = S.gunler[g].ogunler[o.id], t = PB.topla(l);
      return '<section class="gun-ogun plan-hucre-gun" data-g="' + g + '" data-o="' + o.id + '"><div class="gun-ogun-bas"><b><i class="fa-solid ' + o.ikon + '" aria-hidden="true"></i>' + esc(o.ad) + ' <small>' + esc(DD.bicim.saat(o.saat)) + '</small></b><span class="num">kcal</span><span class="num makro">P</span><span class="num makro">K</span><span class="num makro">Y</span><span class="num makro">Lif</span><span></span></div>' +
        l.map((k, ki) => {
          const d = PB.kalemDeger(k), uy = uyariOf(k), adr = ' data-g="' + g + '" data-o="' + o.id + '" data-k="' + ki + '"';
          return '<div class="gun-kalem' + (uy.length ? ' uyarili' : '') + '">' + gorselHtml(k, 'secim-gorsel') + '<button class="gun-kalem-ac" type="button" data-plan="kalem-ac"' + adr + '>' + esc(PB.kalemCumle(k)) + (k.alternatif ? '<small>veya ' + esc(PB.kalemCumle(k.alternatif)) + '</small>' : '') + (uy.length ? '<small>' + esc(uy.map(PB.hassasiyetAd).join(', ')) + '</small>' : '') + '</button>' +
            '<span class="num">' + sayi(d.kcal) + '</span>' + mak(d) + '<button class="plan-mini-dugme" type="button" data-plan="kart-menu"' + adr + ' aria-haspopup="menu" aria-label="' + esc(PB.kalemAd(k)) + ' işlemleri"><i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i></button></div>';
        }).join('') +
        '<div class="gun-ogun-alt"><button class="sonraki-bag" type="button" data-plan="ekle-ac" data-g="' + g + '" data-o="' + o.id + '"><i class="fa-solid fa-plus" aria-hidden="true"></i> Kalem ekle</button><span class="num">' + sayi(t.kcal) + '</span>' + mak(t) + '<span></span></div></section>';
    }).join('');
  }

  /* ── Analiz: gün tablosu, katkı listesi, makro ve öğün payı ─────────── */
  const kapsamGunleri = () => (analizKapsam === 'hafta' ? [0, 1, 2, 3, 4, 5, 6] : analizKapsam === 'hafta-ici' ? gunGrubu(false) : analizKapsam === 'hafta-sonu' ? gunGrubu(true) : [+analizKapsam]);
  function analizCiz() {
    const satir = S.gunler.map((g, i) => ({ i, t: PB.topla(gunKalemleri(g)) }));
    const hucre = (t, ad) => {
      const s = PB.sapma(t.kcal, S.hedef_kcal);
      return '<td>' + ad + '</td><td class="num" data-etiket="kcal">' + sayi(t.kcal) + '</td><td data-etiket="Sapma"><span class="plan-toplam yalin ' + s.durum + '">' + s.etiket + '</span></td><td class="num" data-etiket="Protein">' + sayi(t.protein) + ' g</td><td class="num" data-etiket="Karb.">' + sayi(t.karb) + ' g</td><td class="num" data-etiket="Yağ">' + sayi(t.yag) + ' g</td><td class="num" data-etiket="Lif">' + sayi(t.lif) + ' g</td>';
    };
    $('#analizSatirlar').innerHTML = satir.map((r) => '<tr>' + hucre(r.t, '<button class="plan-gun-ac" type="button" data-plan="analiz-gun" data-g="' + r.i + '">' + gunAd(r.i) + '</button>') + '</tr>').join('');
    const doluG = satir.filter((r) => r.t.kcal), n = doluG.length || 1;
    const ort = doluG.reduce((a, r) => { ['kcal', 'protein', 'karb', 'yag', 'lif'].forEach((k) => { a[k] += r.t[k] / n; }); return a; }, { kcal: 0, protein: 0, karb: 0, yag: 0, lif: 0 });
    $('#analizToplam').innerHTML = '<tr>' + hucre(ort, '<b>Ortalama</b>') + '</tr>';
    const sec = $('#analizKapsam');
    sec.innerHTML = [['hafta', 'Hafta ortalaması'], ['hafta-ici', 'Hafta içi'], ['hafta-sonu', 'Hafta sonu']].concat(S.gunler.map((_, i) => [String(i), gunAd(i)])).map(([v, a]) => '<option value="' + v + '">' + a + '</option>').join('');
    sec.value = analizKapsam;
    const gunler = kapsamGunleri(), harita = new Map();
    gunler.forEach((gi) => gunKalemleri(S.gunler[gi]).forEach((k) => {
      const anahtar = k.tur + ':' + (k.slug || k.ad), d = PB.kalemDeger(k), e = harita.get(anahtar) || { k, deger: 0, adet: 0 };
      e.deger += d[analizOge] / gunler.length; e.adet += 1; harita.set(anahtar, e);
    }));
    const l = [...harita.values()].sort((a, b) => b.deger - a.deger), toplam = l.reduce((a, x) => a + x.deger, 0), birim = analizOge === 'kcal' ? 'kcal' : 'g';
    $('#analizKatki').innerHTML = l.length ? l.slice(0, 5).map((x) => {
      const pay = toplam ? Math.round((x.deger / toplam) * 100) : 0;
      return '<div class="deger-satir"><span>' + esc(PB.kalemAd(x.k)) + ' <small>' + x.adet + ' kez</small></span><b>' + sayi(x.deger) + ' ' + birim + ' · %' + pay + '</b></div><div class="olcer hap"><span data-oran="' + pay + '"></span></div>';
    }).join('') : '<div class="deger-satir"><span>Bu kapsamda kalem yok; önce plana kalem ekle.</span></div>';
    const kapsamT = PB.topla(gunler.flatMap((gi) => gunKalemleri(S.gunler[gi])));
    const enerji = kapsamT.protein * 4 + kapsamT.karb * 4 + kapsamT.yag * 9;
    $('#analizMakro').innerHTML = [['Protein', kapsamT.protein * 4, S.makro.p, 'protein'], ['Karbonhidrat', kapsamT.karb * 4, S.makro.k, 'karb'], ['Yağ', kapsamT.yag * 9, S.makro.y, 'yag']].map(([ad, v, h, c]) => {
      const pay = enerji ? Math.round((v / enerji) * 100) : 0;
      return '<div class="hedef-olcu ' + c + '"><span class="ust-satir">' + ad + '<b>%' + pay + ' / %' + h + '</b></span><span class="olcer"><span data-oran="' + pay + '"></span></span></div>';
    }).join('');
    $('#analizOgun').innerHTML = acikOgunler().map((o) => {
      const v = PB.topla(gunler.flatMap((gi) => S.gunler[gi].ogunler[o.id])).kcal, pay = kapsamT.kcal ? Math.round((v / kapsamT.kcal) * 100) : 0;
      return '<span class="halka-kalem"><span class="halka kucuk" data-oran="' + pay + '"><span>%' + pay + '</span></span><b>' + esc(o.ad) + '</b>' + sayi(v / gunler.length) + ' kcal</span>';
    }).join('');
    $$('#analizKatki [data-oran],#analizMakro [data-oran],#analizOgun [data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
  }
  function gorunumSec(g) {
    gorunum = g;
    $('#haftaPano').hidden = g !== 'hafta';
    $('#gunPano').hidden = g !== 'gun';
    $('#analizPano').hidden = g !== 'analiz';
    $$('#planGorunum button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === g)));
    if (g === 'gun') gunCiz();
    if (g === 'analiz') analizCiz();
  }

  /* ── Sağ panel ─────────────────────────────────────────────────────── */
  function makroCiz() {
    const h = makroHedef(), n = makroToplam();
    $('#makroNot').innerHTML = n === 100 ? '<i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>Günlük hedef: P ' + sayi(h.protein) + ' g · K ' + sayi(h.karb) + ' g · Y ' + sayi(h.yag) + ' g</span>' :
      '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>Toplam %' + n + '. Yüzdeler %100 etmeli.</span>';
    $$('#makroHazir .cip').forEach((c) => c.classList.toggle('aktif', c.dataset.deger === [S.makro.p, S.makro.k, S.makro.y].join(',')));
  }
  const makroDoldur = () => { $('#makroP').value = S.makro.p; $('#makroK').value = S.makro.k; $('#makroY').value = S.makro.y; makroCiz(); };
  function danisanCiz() {
    const d = danisan(), kap = $('#danisanOzet');
    if (!d) {
      kap.innerHTML = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-user-plus" aria-hidden="true"></i></span><h3>Danışan seçilmedi</h3><p>Danışan seçince hassasiyet ve tahlil kuralları plana uygulanır.</p><button class="dugme hayalet" type="button" data-plan="danisan-odak">Danışan seç</button></div>';
      return;
    }
    const has = (d.hassasiyetler || []).map((h) => '<span class="rozet bekleme">' + esc(PB.hassasiyetAd(h)) + '</span>').join(' ');
    const kr = (d.kronik || []).map((h) => '<span class="rozet pasif">' + esc(h) + '</span>').join(' ');
    const izin = PB.tahlilIzni(d), tah = izin ? PB.sonTahlil(d).filter((x) => PB.tahlilDurum(x)) : [];
    const iz = d.izinler || {}, izinMetin = [['olcum', 'Ölçüm'], ['tahlil', 'Tahlil'], ['gunluk', 'Günlük']].map(([k, a]) => '<span class="rozet ' + (iz[k] === false ? 'pasif' : 'olumlu') + '">' + a + (iz[k] === false ? ' kapalı' : ' açık') + '</span>').join(' ');
    kap.innerHTML = '<div class="yigin sik">' +
      '<a class="kisi-hucre" href="' + DD.kok + 'diyetisyen-paneli/danisanlar/' + d.id + '/"><span class="kisi-avatar" aria-hidden="true">' + esc(PB.basHarf(d.ad)) + '</span><span class="kisi-bilgi"><span class="kisi-ad">' + esc(d.ad) + '</span><span class="kisi-alt">' + d.yas + ' yaş · ' + d.boy + ' cm · ' + sayi(d.kilo, 1) + ' kg <i class="fa-solid fa-arrow-right" aria-hidden="true"></i> ' + sayi(d.hedef_kilo, 1) + ' kg</span></span></a>' +
      '<p class="alan-yardim"><i class="fa-solid fa-bullseye" aria-hidden="true"></i><span>' + esc(d.hedef) + '</span></p>' +
      '<div class="deger-liste"><div class="deger-satir"><span>Hassasiyet</span><span>' + (has || 'Kayıt yok') + '</span></div>' +
      (kr ? '<div class="deger-satir"><span>Kronik</span><span>' + kr + '</span></div>' : '') +
      (izin ? (tah.length ? tah.map((x) => '<div class="deger-satir"><span>' + esc(x.ad) + '</span><b>' + sayi(x.sonuc, 1) + ' ' + esc(x.birim) + ' <span class="rozet durdu">' + (PB.tahlilDurum(x) === 'dusuk' ? 'Düşük' : 'Yüksek') + '</span></b></div>').join('') : '<div class="deger-satir"><span>Son tahlil</span><span>Referans dışı değer yok</span></div>') : '<div class="deger-satir"><span>Tahlil</span><span>Paylaşılmıyor</span></div>') +
      '<div class="deger-satir"><span>İzinler</span><span>' + izinMetin + '</span></div></div></div>';
  }
  /* Bütün plan için uyarılar: hassasiyet çakışması, tahlil notu, sapma, boş gün */
  function uyarilar() {
    const d = danisan(), cakisma = [], sapma = [], bos = [];
    S.gunler.forEach((g, gi) => {
      acikOgunler().forEach((o) => g.ogunler[o.id].forEach((k, ki) => {
        PB.kalemUyariK(k, d).forEach((h) => cakisma.push({ h, gi, o, ki, ad: PB.kalemAd(k) }));
        if (k.alternatif) PB.kalemUyariK(k.alternatif, d).forEach((h) => cakisma.push({ h, gi, o, ki, ad: PB.kalemAd(k.alternatif) + ' (alternatif)' }));
      }));
      const t = PB.topla(gunKalemleri(g));
      if (!t.kcal) bos.push(gi); else if (PB.sapma(t.kcal, S.hedef_kcal).durum === 'sapma') sapma.push(gi);
    });
    return { cakisma, sapma, bos, oneri: PB.oneriler(d) };
  }
  const gunListe = (l) => l.map((i) => gunKisa(i)).join(', ');
  function uyariCiz() {
    const u = uyarilar();
    let h = '';
    u.cakisma.forEach((c) => {
      h += '<div class="ayar-satir"><span class="as-ikon uyari"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i></span><span class="as-metin"><b>' + esc(c.ad) + '</b><span>' + esc(PB.hassasiyetAd(c.h)) + ' · ' + gunAd(c.gi) + ' ' + esc(c.o.ad) + '</span></span>' +
        '<span class="as-eylem"><button class="dugme hayalet kucuk" type="button" data-plan="kalem-ac" data-g="' + c.gi + '" data-o="' + c.o.id + '" data-k="' + c.ki + '">Kalemi aç</button></span></div>';
    });
    if (u.sapma.length) h += '<div class="ayar-satir"><span class="as-ikon tehlike"><i class="fa-solid fa-gauge-high" aria-hidden="true"></i></span><span class="as-metin"><b>Hedeften sapan gün</b><span>' + gunListe(u.sapma) + ' günleri ±%15 dışında.</span></span></div>';
    u.oneri.forEach((o) => {
      h += '<div class="ayar-satir"><span class="as-ikon bilgi"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i></span><span class="as-metin"><b>' + esc(o.baslik) + '</b><span>' + esc(o.not) + '</span></span>' +
        (o.mikro ? '<span class="as-eylem"><button class="dugme hayalet kucuk" type="button" data-plan="mikro-ac" data-mikro="' + o.mikro + '" data-ad="' + esc(o.mikroAd) + '">' + esc(o.mikroAd) + '</button></span>' : '') + '</div>';
    });
    $('#uyariGovde').innerHTML = h ? '<div class="ayar-liste sarar">' + h + '</div>' :
      '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-circle-check" aria-hidden="true"></i></span><h3>Uyarı yok</h3><p>' + (danisan() ? 'Plan danışanın hassasiyet ve tahlil verisiyle çakışmıyor.' : 'Danışan seçilince kurallar burada çalışır.') + '</p></div>';
    const n = u.cakisma.length + u.sapma.length, r = $('#uyariSayi');
    r.hidden = !n; r.textContent = n + ' uyarı';
  }
  function ozetCiz() {
    const o = PB.planOzet({ gunler: S.gunler.map((g) => ({ ogunler: Object.fromEntries(acikOgunler().map((x) => [x.id, g.ogunler[x.id]])) })), hedef_kcal: S.hedef_kcal });
    const tum = PB.topla(S.gunler.flatMap(gunKalemleri)), n = S.gunler.length, b = o.dolu || 1;
    const mh = makroHedef(), makro = [['Protein', tum.protein / b, mh.protein], ['Karbonhidrat', tum.karb / b, mh.karb], ['Yağ', tum.yag / b, mh.yag]];
    $('#ozetGovde').innerHTML = '<div class="deger-satir"><span>Ortalama kcal' + (o.dolu < n ? ' (' + o.dolu + ' dolu gün)' : '') + '</span><b>' + sayi(o.ort) + '</b></div>' +
      '<div class="deger-satir"><span>Hedef</span><b>' + sayi(S.hedef_kcal) + '</b></div>' +
      '<div class="deger-satir"><span>Hedefteki gün</span><b>' + o.hedefte + ' / ' + n + '</b></div>' + PB.gunSerit(o.durumlar) +
      makro.map(([ad, v, h]) => '<div class="deger-satir"><span>' + ad + '</span><b>' + sayi(v) + ' <small>/ ' + sayi(h) + ' g</small></b></div><div class="olcer hap"><span data-oran="' + Math.min(100, Math.round((v / h) * 100 || 0)) + '"></span></div>').join('');
    $$('#ozetGovde [data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
    const dr = $('#ozetDurum'), iyi = o.hedefte >= 6, orta = o.hedefte >= 3;
    dr.textContent = iyi ? 'Hedefe uygun' : orta ? 'Dengelenmeli' : 'Eksik plan';
    dr.className = 'durum-hapi ' + (iyi ? 'cozulen' : orta ? 'bekleyen' : 'kapali');
    $('#kayitNot').innerHTML = 'Ort. <b>' + sayi(o.ort) + ' kcal</b> · <b>' + o.hedefte + '/' + n + '</b> hedefte · ' + (kirli ? 'Kaydedilmemiş değişiklik var' : S.id ? 'Son kayıt ' + PB.tarihSaat(S.guncelleme || S.tarih) : 'Henüz kaydedilmedi');
  }
  function baslikCiz() {
    const d = PB.planDurum(S.durum), hap = $('#planDurum');
    $('#planBaslik').textContent = S.ad || 'Yeni beslenme planı';
    hap.textContent = d.ad + (S.surum > 1 ? ' · sürüm ' + S.surum : '');
    hap.className = 'durum-hapi ' + d.hap;
    const dn = danisan();
    $('#yazdirmaBaslik').innerHTML = '<h1>' + esc(S.ad || 'Beslenme planı') + '</h1><p>' +
      [dn ? 'Danışan: ' + esc(dn.ad) : '', 'Hedef: ' + sayi(S.hedef_kcal) + ' kcal/gün', PB.tarih(S.baslangic) + ' – ' + PB.tarih(PB.gunEkle(S.baslangic, 6)), esc(PB.demo().diyetisyen.ad)].filter(Boolean).join(' · ') + '</p>' +
      (S.danisana_not ? '<p>' + esc(S.danisana_not) + '</p>' : '');
    $('#planBitis').textContent = PB.tarih(PB.gunEkle(S.baslangic, 6));
  }
  /* Gönderilmiş planda sıradaki iş: danışana haber, kontrol görüşmesi, üyenin gördüğü ekran */
  function sonrakiCiz() {
    const gonderildi = S.durum === 'gonderildi', dn = danisan(), kart = $('#sonrakiKart');
    kart.hidden = !gonderildi || !dn;
    if (kart.hidden) return;
    const k = DD.kok + 'diyetisyen-paneli/', uye = PB.demo().uye && PB.demo().uye.danisan_id === S.danisan_id;
    const degisik = kirli || (PB.liste('planlar').find((p) => p.id === S.id) || {}).taslak;
    const sira = window.PA && PA.siradaki ? PA.siradaki(dn) : null; /* danışan listesi ve kartıyla aynı cümle */
    $('#sonrakiAdim').innerHTML = '<span class="as-ikon"><i class="fa-solid fa-circle-check" aria-hidden="true"></i></span><span class="as-metin"><b>Plan ' + esc(dn.ad) + ' için gönderildi' + (S.surum > 1 ? ', sürüm ' + S.surum : '') + '</b><span>' + (degisik ? 'Gönderilmemiş değişiklik var; danışan önceki sürümü görüyor.' : sira && sira.etiket ? 'Sıradaki adım: ' + esc(sira.baslik) + '. ' + esc(sira.metin) : 'Sıradaki adım: danışana haber ver, kontrol görüşmesini planla.') + '</span></span>' +
      '<a class="dugme hayalet kucuk" href="' + k + 'mesajlar/?danisan=' + dn.id + '"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Danışana mesaj yaz</a>' +
      '<a class="dugme hayalet kucuk" href="' + k + 'takvim/?yeni=1&danisan=' + dn.id + '"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i> Kontrol randevusu oluştur</a>' +
      (uye ? '<a class="dugme hayalet kucuk" href="' + DD.kok + 'hesabim/beslenme-planim/" target="_blank" rel="noopener"><i class="fa-solid fa-mobile-screen" aria-hidden="true"></i> Üye ekranını gör</a>' : '<a class="dugme hayalet kucuk" href="' + k + 'danisanlar/' + dn.id + '/?sekme=plan"><i class="fa-solid fa-id-card" aria-hidden="true"></i> Danışan kartını aç</a>');
  }
  function ciz() {
    sonrakiCiz();
    $('#baslangic').hidden = !!S.id || dolu() || bosBasladi;
    izgaraCiz(); uyariCiz(); ozetCiz(); baslikCiz();
    if (gorunum === 'gun') gunCiz();
    if (gorunum === 'analiz') analizCiz();
  }
  function formDoldur() {
    const sec = $('#planDanisan');
    sec.innerHTML = '<option value="">Danışan seç</option>' + PB.danisanlar().filter((d) => d.durum !== 'bitti' || d.id === S.danisan_id).map((d) => '<option value="' + d.id + '">' + esc(d.ad) + '</option>').join('');
    sec.value = S.danisan_id;
    makroDoldur();
    $('#planAd').value = S.ad; $('#planHedef').value = S.hedef_kcal; $('#planNot').value = S.danisana_not || ''; $('#planBaslangic').value = S.baslangic;
    danisanCiz();
  }

  /* ── Açılır menüler: kart ve gün ───────────────────────────────────── */
  function menuKapat() {
    if (!acikMenu) return;
    acikMenu.el.hidden = true;
    acikMenu.btn.removeAttribute('aria-expanded');
    acikMenu = null;
  }
  function menuAc(id, btn) {
    menuKapat();
    const el = $(id), r = btn.getBoundingClientRect();
    el.hidden = false;
    const w = el.offsetWidth, h = el.offsetHeight;
    el.style.left = Math.max(8, Math.min(r.left - 8, innerWidth - w - 8)) + 'px';
    el.style.top = (r.bottom + h + 8 > innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4) + 'px';
    btn.setAttribute('aria-expanded', 'true');
    acikMenu = { el, btn };
    $('button', el).focus();
  }

  /* ── Seçici drawer ─────────────────────────────────────────────────── */
  const OGUN_TIP = { kahvalti: 'kahvalti', ara1: 'ara', ogle: 'ogle', ara2: 'ara', aksam: 'aksam' };
  const TIP_TARIF = { kahvalti: ['kahvalti', 'brunch'], ara: ['ara-ogun', 'ikindi-ve-cay-saati', 'beslenme-cantasi'], ogle: ['ogle-yemegi'], aksam: ['aksam-yemegi'] };
  const ETLI = ['Et & Tavuk', 'Balık & Deniz', 'Balık ve Deniz Ürünleri', 'Tavuk ve Hindi', 'Kırmızı Et'];
  const diyetUyar = (c, d) => {
    const et = c.etiketler || [], al = c.alerjenler || c.hassasiyet || [];
    if (d === 'Laktozsuz') return !al.includes('laktoz');
    if (d === 'Glütensiz') return !al.includes('gluten');
    if (d === 'Vejetaryen') return et.includes('Vejetaryen') || et.includes('Vegan') || (!c.etiketler && !ETLI.includes(c.kategori));
    return et.includes('Vegan') || (!c.etiketler && !ETLI.includes(c.kategori) && !al.includes('sut') && !al.includes('yumurta') && c.slug !== 'bal');
  };
  function kaynakListe() {
    const q = PB.kucuk(arama), tip = $('#suzOgun').value, kcal = $('#suzKcal').value, kat = $('#suzKategori').value, diyet = $$('#suzDiyet .cip.aktif').map((c) => c.dataset.deger);
    let l = kaynak === 'tarif' ? PB.tarifler.slice() : PB.besinSec();
    if (mikroSuzgec) l = mikroSuzgec.liste.map((s) => l.find((b) => b.slug === s)).filter(Boolean);
    if (kaynak === 'tarif' && tip) l = l.filter((t) => (t.ogunler || []).some((x) => TIP_TARIF[tip].includes(x)));
    if (kat) l = l.filter((x) => x.kategori === kat);
    if (kcal) {
      const [a, b] = kcal.split('-').map(Number);
      l = l.filter((x) => { const v = PB.kalemDeger({ tur: kaynak, slug: x.slug, miktar: PB.varsayilanMiktar(kaynak, x.slug) }).kcal; return v >= a && v < b; });
    }
    diyet.forEach((d) => { l = l.filter((x) => diyetUyar(x, d)); });
    if (q) l = l.filter((x) => PB.kucuk(x.ad).includes(q));
    const dn = danisan(), uygunsuz = (x) => (PB.kalemUyari(kaynak, x.slug, dn).length ? 1 : 0);
    if (!mikroSuzgec) l.sort((a, b) => uygunsuz(a) - uygunsuz(b) || a.ad.localeCompare(b.ad, 'tr'));
    return { uygun: l.filter((x) => !uygunsuz(x)), uygunsuz: l.filter(uygunsuz) };
  }
  function kategoriCiz() {
    const l = kaynak === 'tarif' ? PB.tarifler : PB.besinSec(), sec = $('#suzKategori');
    sec.innerHTML = '<option value="">Tümü</option>' + [...new Set(l.map((x) => x.kategori))].map((a) => '<option>' + esc(a) + '</option>').join('');
    $('#suzOgun').closest('.alan').hidden = kaynak !== 'tarif';
  }
  const satirMeta = (tur, c, miktar) => {
    const d = PB.kalemDeger({ tur, slug: c.slug, miktar });
    return (tur === 'besin' && c.porsiyon ? esc(c.porsiyon.ad) + ' = ' + sayi(c.porsiyon.gram) + ' g · ' : '') + sayi(d.kcal) + ' kcal · P ' + sayi(d.protein) + ' · K ' + sayi(d.karb) + ' · Y ' + sayi(d.yag) + ' g';
  };
  function satirHtml(c) {
    const tur = kaynak, m = PB.varsayilanMiktar(tur, c.slug), uy = PB.kalemUyari(tur, c.slug, danisan());
    return '<div class="secim-satir" data-slug="' + c.slug + '">' + gorselHtml({ tur, slug: c.slug }, 'secim-gorsel') +
      '<span class="secim-metin"><b>' + esc(c.ad) + '</b><small data-rol="meta">' + satirMeta(tur, c, m) + '</small>' +
      (uy.length ? '<span class="secim-etiketler">' + uy.map((h) => '<span class="rozet bekleme"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> ' + esc(PB.hassasiyetAd(h)) + '</span>').join('') + '</span>' : '') + '</span>' +
      '<span class="adet"><button type="button" data-yon="azalt" aria-label="Azalt"><i class="fa-solid fa-minus" aria-hidden="true"></i></button><input type="number" min="' + PB.adim(tur) + '" step="' + PB.adim(tur) + '" value="' + m + '" aria-label="' + esc(c.ad) + ' miktarı, ' + (tur === 'tarif' ? 'porsiyon' : 'gram') + '"><button type="button" data-yon="artir" aria-label="Artır"><i class="fa-solid fa-plus" aria-hidden="true"></i></button></span>' +
      '<button class="dugme hayalet kucuk" type="button" data-plan="ekle" data-slug="' + c.slug + '">' + (degistirHedef ? 'Seç' : altHedef ? 'Alternatif yap' : 'Ekle') + '</button></div>';
  }
  const tarifMeta = (t, m) => sayi(t.kcal * m) + ' kcal · P ' + sayi(t.protein * m) + ' · K ' + sayi(t.karb * m) + ' · Y ' + sayi(t.yag * m) + ' g';
  function kayitliSatir(t) {
    const uy = PB.kalemUyariK(PB.tarifKalemi(t, 1), danisan());
    return '<div class="secim-satir" data-tarif="' + esc(t.id) + '"><span class="secim-gorsel"><i class="fa-solid fa-bookmark" aria-hidden="true"></i></span>' +
      '<span class="secim-metin"><b>' + esc(t.ad) + '</b><small data-rol="meta">' + tarifMeta(t, 1) + '</small>' +
      (uy.length || t.ornek ? '<span class="secim-etiketler">' + (t.ornek ? '<span class="rozet pasif">Prototip örneği</span>' : '') + uy.map((h) => '<span class="rozet bekleme"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> ' + esc(PB.hassasiyetAd(h)) + '</span>').join('') + '</span>' : '') + '</span>' +
      '<span class="adet"><button type="button" data-yon="azalt" aria-label="Azalt"><i class="fa-solid fa-minus" aria-hidden="true"></i></button><input type="number" min="0.5" step="0.5" value="1" aria-label="' + esc(t.ad) + ' miktarı, porsiyon"><button type="button" data-yon="artir" aria-label="Artır"><i class="fa-solid fa-plus" aria-hidden="true"></i></button></span>' +
      '<span class="secim-eylem"><button class="ikon-dugme" type="button" data-plan="tarif-duzenle" data-id="' + esc(t.id) + '" aria-label="' + esc(t.ad) + ' tarifini düzenle"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>' +
      '<button class="ikon-dugme yikici" type="button" data-plan="tarif-sil" data-id="' + esc(t.id) + '" aria-label="' + esc(t.ad) + ' tarifini sil"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>' +
      '<button class="dugme hayalet kucuk" type="button" data-plan="tarif-ekle" data-id="' + esc(t.id) + '">' + (degistirHedef ? 'Seç' : altHedef ? 'Alternatif yap' : 'Ekle') + '</button></span></div>';
  }
  function kayitliCiz() {
    const q = PB.kucuk(arama), hepsi = PB.tariflerim(), l = hepsi.filter((t) => PB.kucuk(t.ad).includes(q));
    const uygunsuz = (t) => (PB.kalemUyariK(PB.tarifKalemi(t, 1), danisan()).length ? 1 : 0);
    l.sort((a, b) => uygunsuz(a) - uygunsuz(b) || a.ad.localeCompare(b.ad, 'tr'));
    $('#sheetBos').hidden = true;
    $('#sheetListe').innerHTML = l.length ? l.map(kayitliSatir).join('') :
      '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-bookmark" aria-hidden="true"></i></span><h3>' + (hepsi.length ? 'Bu aramayla tarif yok' : 'Kayıtlı tarifin yok') + '</h3><p>Yeni tarif girdiğinde burada kalır, başka planlarda da kullanırsın.</p><button class="dugme hayalet" type="button" data-plan="tarif-yeni">Yeni tarif gir</button></div>';
  }
  function listeCiz() {
    if (kaynak === 'serbest') return;
    if (kaynak === 'tarif' && tarifKaynak === 'yeni') return;
    if (kaynak === 'tarif' && tarifKaynak === 'kayitli') { kayitliCiz(); return; }
    const { uygun, uygunsuz } = kaynakListe();
    $('#sheetBos').hidden = uygun.length + uygunsuz.length > 0;
    $('#sheetListe').innerHTML = uygun.map(satirHtml).join('') + (uygunsuz.length ? '<div class="secim-ayrac">Danışanın hassasiyetiyle çakışanlar</div>' + uygunsuz.map(satirHtml).join('') : '');
  }
  function sheetOzet() {
    if (!hedefHucre) return;
    const l = S.gunler[hedefHucre.g].ogunler[hedefHucre.o], t = PB.topla(gunKalemleri(S.gunler[hedefHucre.g])), h = makroHedef(), kap = $('#sheetOzet');
    kap.className = 'not ' + PB.sapma(t.kcal, S.hedef_kcal).durum;
    kap.innerHTML = (l.length ? 'Öğün ' + sayi(PB.topla(l).kcal) + ' kcal · ' : '') + 'Gün <b>' + sayi(t.kcal) + ' / ' + sayi(S.hedef_kcal) + ' kcal</b> · P ' + sayi(t.protein) + '/' + sayi(h.protein) + ' · K ' + sayi(t.karb) + '/' + sayi(h.karb) + ' · Y ' + sayi(t.yag) + '/' + sayi(h.yag);
  }
  function kaynakSec(k) {
    kaynak = k;
    $$('#seciciPanel [role=tab]').forEach((t) => { const b = t.dataset.kaynak === k; t.classList.toggle('aktif', b); t.setAttribute('aria-selected', b); t.tabIndex = b ? 0 : -1; });
    const tarif = k === 'tarif', yeni = tarif && tarifKaynak === 'yeni';
    $('#tarifKaynak').hidden = !tarif;
    $$('#tarifKaynak button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === tarifKaynak)));
    $('#tarifSayi').textContent = PB.tariflerim().length;
    $('#yeniTarifAlan').hidden = !yeni;
    $('#serbestAlan').hidden = k !== 'serbest';
    $('#katalogAlan').hidden = k === 'serbest' || yeni;
    if (k === 'serbest' || yeni) return;
    const kayitli = tarif && tarifKaynak === 'kayitli';
    $('#suzgecAlan').hidden = kayitli;
    $('#sheetAra').placeholder = kayitli ? 'Kayıtlı tariflerinde ara' : tarif ? 'Yemek ara, örn. çorba' : 'Besin ara, örn. mercimek';
    kategoriCiz(); listeCiz();
  }
  /* Üç kaynak: Dada Gastro kataloğu, yeni tarif formu, diyetisyenin kayıtlı tarifleri */
  function tarifKaynakSec(d) {
    tarifKaynak = d;
    if (d !== 'yeni') tarifFormTemizle();
    kaynakSec('tarif');
    if (d === 'yeni') $('#ytAd').focus(); else $('#sheetAra').focus();
  }
  const SAYI_ALANI = { kcal: '#ytKcal', protein: '#ytP', karb: '#ytK', yag: '#ytY', lif: '#ytLif' };
  function tarifFormTemizle() {
    duzenTarif = null;
    $('#yeniTarifAlan').reset();
    $$('#ytAlerjen .cip').forEach((c) => { c.classList.remove('aktif'); c.setAttribute('aria-pressed', 'false'); });
    $('#ytVazgec').hidden = true;
    $('#ytKaydet').innerHTML = '<i class="fa-solid fa-plus" aria-hidden="true"></i> Plana ekle ve kaydet';
    if (hedefHucre) $('#ytOgun').value = OGUN_TIP[hedefHucre.o];
  }
  function tarifDuzenle(id) {
    const t = PB.tariflerim().find((x) => x.id === id);
    if (!t) return;
    tarifKaynak = 'yeni'; kaynakSec('tarif');
    duzenTarif = id;
    $('#ytAd').value = t.ad; $('#ytOgun').value = t.ogun; $('#ytMalzeme').value = (t.malzemeler || []).join('\n'); $('#ytAdim').value = t.hazirlanis || '';
    Object.keys(SAYI_ALANI).forEach((a) => { $(SAYI_ALANI[a]).value = t[a] || ''; });
    $$('#ytAlerjen .cip').forEach((c) => { const a = (t.alerjenler || []).includes(c.dataset.deger); c.classList.toggle('aktif', a); c.setAttribute('aria-pressed', String(a)); });
    $('#ytVazgec').hidden = false;
    $('#ytKaydet').textContent = 'Değişiklikleri kaydet';
    $('#ytAd').focus();
  }
  function tarifKaydet() {
    if (!PB.formGecerli($('#yeniTarifAlan'))) return;
    const say = (s) => parseFloat($(s).value) || 0, t = {
      ad: $('#ytAd').value.trim(), ogun: $('#ytOgun').value, malzemeler: $('#ytMalzeme').value.split('\n').map((x) => x.trim()).filter(Boolean),
      hazirlanis: $('#ytAdim').value.trim(), alerjenler: $$('#ytAlerjen .cip.aktif').map((c) => c.dataset.deger), tarih: DD.bugun,
    };
    Object.keys(SAYI_ALANI).forEach((a) => { t[a] = say(SAYI_ALANI[a]); });
    const l = PB.tariflerim();
    if (duzenTarif) {
      Object.assign(l.find((x) => x.id === duzenTarif), t);
      PB.kaydet(); tarifKaynakSec('kayitli');
      DD.toast('Tarif güncellendi. Plandaki kopyalar değişmez.');
      return;
    }
    t.id = PB.yeniId('tf');
    l.unshift(t);
    PB.kaydet();
    const y = PB.tarifKalemi(t, 1), yerlesti = kalemYerlestir(y);
    if (!yerlesti) {
      S.gunler[hedefHucre.g].ogunler[hedefHucre.o].push(y);
      degisti(); sheetOzet();
    }
    const uy = PB.kalemUyariK(y, danisan());
    tarifKaynak = 'kayitli'; tarifFormTemizle();
    if (!yerlesti) kaynakSec('tarif');
    DD.toast(uy.length ? PB.hassasiyetAd(uy[0]) + ': tarif eklendi, uyarı listesine düştü.' : '“' + t.ad + '” öğüne eklendi, Tariflerim listesine kaydedildi.', uy.length ? 'uyari' : undefined);
  }
  function tarifSil(id) {
    const l = PB.tariflerim(), i = l.findIndex((x) => x.id === id);
    if (i < 0) return;
    window.DM_ONAY('Tarif silinsin mi?', '“' + l[i].ad + '” Tariflerim listesinden kalkar. Plana eklenmiş kopyalar yerinde kalır.', 'Sil', (ok) => {
      if (!ok) return;
      l.splice(i, 1); PB.kaydet(); kaynakSec('tarif'); DD.toast('Tarif silindi.');
    });
  }
  /* Drawer örtüsüz açılır: ızgara görünür kalır, başka hücreye tıklayınca hedef değişir */
  function seciciAc(g, o, mikro) {
    hedefHucre = { g, o };
    mikroSuzgec = mikro || null;
    const og = S.ogun_duzeni.find((x) => x.id === o), odak = (k) => PB.kalemCumle(S.gunler[k.g].ogunler[k.o][k.k]);
    $('#sheetBaslik').textContent = altHedef ? 'Alternatif seç · ' + odak(altHedef) : degistirHedef ? 'Değiştir · ' + odak(degistirHedef) : gunAd(g) + ' · ' + og.ad + ' · ' + DD.bicim.saat(og.saat) + (mikro ? ' · ' + mikro.ad : '');
    arama = ''; $('#sheetAra').value = '';
    $('#suzOgun').value = OGUN_TIP[o]; $('#suzKcal').value = ''; $('#suzKategori').value = '';
    if (mikro) $('#suzOgun').value = '';
    $$('#suzDiyet .cip').forEach((c) => { c.classList.remove('aktif'); c.setAttribute('aria-pressed', 'false'); });
    if (tarifKaynak === 'yeni') tarifKaynak = 'gastro';
    tarifFormTemizle();
    kaynakSec(mikro ? 'besin' : kaynak === 'serbest' ? 'tarif' : kaynak);
    sheetOzet();
    $('#seciciPanel').hidden = false;
    $('#sheetAra').focus();
    if (secGun !== g) { secGun = g; izgaraCiz(); if (gorunum === 'gun') gunCiz(); }
  }
  function kalemYerlestir(y) {
    if (altHedef) {
      const a = altHedef; altHedef = null;
      S.gunler[a.g].ogunler[a.o][a.k].alternatif = y;
      $('#seciciPanel').hidden = true; degisti(); kalemAc(a.g, a.o, a.k);
      return true;
    }
    if (degistirHedef) {
      const a = degistirHedef; degistirHedef = null;
      S.gunler[a.g].ogunler[a.o][a.k] = y;
      $('#seciciPanel').hidden = true; degisti(); DD.toast('Kalem değiştirildi.');
      return true;
    }
    return false;
  }

  /* ── Kalem penceresi ───────────────────────────────────────────────── */
  function kalemCiz() {
    const { g, o, k: ki } = acikKalem, k = S.gunler[g].ogunler[o][ki], serbest = k.tur === 'serbest' && !k.baz, c = k.tur === 'serbest' ? null : PB.katalog(k), d = PB.kalemDeger(k), uy = PB.kalemUyariK(k, danisan());
    $('#kalemBaslik').textContent = PB.kalemAd(k);
    const notlar = uy.map((h) => '<div class="uyari-kutu uyari"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span><b>' + esc(PB.hassasiyetAd(h)) + '.</b> ' + esc((c && c.alerjen_notu) || 'Bu kalem danışanın hassasiyetiyle eşleşiyor.') + '</span></div>').join('');
    const gorsel = k.tur === 'serbest' ? '' : PB.gorsel(k.tur, k.slug), sirala = '<div class="eylem-satiri"><button class="dugme hayalet kucuk" type="button" data-plan="kalem-tasi" data-yon="-1"' + (ki ? '' : ' disabled') + '><i class="fa-solid fa-arrow-up" aria-hidden="true"></i> Yukarı</button><button class="dugme hayalet kucuk" type="button" data-plan="kalem-tasi" data-yon="1"' + (ki < S.gunler[g].ogunler[o].length - 1 ? '' : ' disabled') + '><i class="fa-solid fa-arrow-down" aria-hidden="true"></i> Aşağı</button></div>';
    if (serbest && !$('#kalemSerbest')) {
      const alan = (ad, et, tip) => '<div class="alan"><label class="alan-etiket" for="ks' + ad + '">' + et + '</label><input class="alan-girdi" id="ks' + ad + '" type="' + tip + '" min="0" data-serbest="' + ad + '" value="' + esc(k[ad]) + '"></div>';
      $('#kalemGovde').innerHTML = '<div id="kalemSerbest"><div class="alan-izgara c2">' + alan('ad', 'Kalem adı', 'text') + alan('olcu', 'Ölçü', 'text') + alan('kcal', 'Enerji (kcal)', 'number') + alan('protein', 'Protein (g)', 'number') + alan('karb', 'Karbonhidrat (g)', 'number') + alan('yag', 'Yağ (g)', 'number') + '</div></div><div id="kalemSira"></div><div id="kalemAlt"></div><div id="kalemNot"></div>';
    } else if (!serbest && !$('#kalemMiktar')) {
      $('#kalemGovde').innerHTML = (gorsel ? '<span class="gorsel-bant kisa"><img src="' + gorsel + '" alt=""></span>' : '') + '<div class="alan"><label class="alan-etiket" for="kalemMiktar">Miktar <span class="istege-bagli">' + (k.tur === 'besin' ? 'gram' : 'porsiyon') + '</span></label>' +
        '<span class="adet"><button type="button" data-yon="azalt" aria-label="Azalt"><i class="fa-solid fa-minus" aria-hidden="true"></i></button><input id="kalemMiktar" type="number" min="' + PB.adim(k.baz ? 'tarif' : k.tur) + '" step="' + PB.adim(k.baz ? 'tarif' : k.tur) + '" value="' + k.miktar + '"><button type="button" data-yon="artir" aria-label="Artır"><i class="fa-solid fa-plus" aria-hidden="true"></i></button></span>' +
        (k.tur === 'besin' && c && c.porsiyon ? '<p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>' + esc(c.porsiyon.ad) + ' = ' + sayi(c.porsiyon.gram) + ' g</span></p>' : '') + '</div><div class="deger-liste" id="kalemDeger"></div><div id="kalemSira"></div><div id="kalemAlt"></div><div id="kalemNot"></div>';
    }
    $('#kalemSira').innerHTML = sirala;
    if (!serbest) $('#kalemDeger').innerHTML = '<div class="deger-satir"><span>Enerji</span><b>' + sayi(d.kcal) + ' kcal</b></div><div class="deger-satir"><span>Protein</span><b>' + sayi(d.protein, 1) + ' g</b></div><div class="deger-satir"><span>Karbonhidrat</span><b>' + sayi(d.karb, 1) + ' g</b></div><div class="deger-satir"><span>Yağ</span><b>' + sayi(d.yag, 1) + ' g</b></div>';
    $('#kalemNot').innerHTML = notlar;
    $('#kalemAlt').innerHTML = k.alternatif ?
      '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-right-left" aria-hidden="true"></i></span><span class="as-metin"><b>veya ' + esc(PB.kalemCumle(k.alternatif)) + '</b><span>Toplamı ilk seçenek belirler.</span></span><span class="as-eylem"><button class="ikon-dugme yikici" type="button" data-plan="alt-sil" aria-label="Alternatifi kaldır"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></span></div>' :
      '<button class="dugme hayalet kucuk" type="button" data-plan="alt-ac"><i class="fa-solid fa-right-left" aria-hidden="true"></i> Alternatif ekle</button>';
  }
  function kalemAc(g, o, k) {
    acikKalem = { g, o, k };
    if (secGun !== g) { secGun = g; izgaraCiz(); if (gorunum === 'gun') gunCiz(); }
    $('#kalemGovde').innerHTML = '';
    kalemCiz();
    DD.ac('#kalemModal');
  }

  /* ── Kopyalama: gün, öğün, tek kalem ───────────────────────────────── */
  const kaynakPlanlar = () => PB.liste('planlar').filter((p) => p.id !== S.id).map((p) => ({ id: 'p:' + p.id, ad: p.ad, gunler: p.gunler, bas: p.baslangic || p.tarih }))
    .concat(PB.liste('sablonlar').map((p) => ({ id: 's:' + p.id, ad: 'Şablon: ' + p.ad, gunler: p.gunler })));
  const kopyaGunleri = () => { const v = $('#kopyaPlan').value; return v ? gunIcerikleri(kaynakPlanlar().find((x) => x.id === v).gunler) : S.gunler; };
  const gunTopla = (g) => PB.topla(Object.values(g.ogunler).flat()).kcal;
  function kopyaKaynakCiz(sec) {
    const l = kopyaGunleri();
    const secili = kaynakPlanlar().find((x) => x.id === $('#kopyaPlan').value);
    const etiket = (i) => (!secili ? gunAd(i) : secili.bas ? PB.gunAd(secili.bas, i) : (i + 1) + '. gün');
    $('#kopyaKaynak').innerHTML = l.map((_, i) => etiket(i)).map((a, i) => '<option value="' + i + '"' + (i === sec ? ' selected' : '') + '>' + a + ' (' + sayi(gunTopla(l[i])) + ' kcal)</option>').join('');
    kopyaHedefCiz();
  }
  const kopyaTuru = () => (kopyaKalem ? 'kalem' : $('#kopyaTur [aria-pressed=true]').dataset.deger);
  function kopyaTurSec(t) {
    $$('#kopyaTur button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === t)));
    const kalem = !!kopyaKalem;
    $('#kopyaTurAlan').hidden = kalem;
    $('#kopyaKaynakAlan').hidden = kalem;
    $('#kopyaOgunKaynakAlan').hidden = kalem;
    $('#kopyaOgunAlan').hidden = !kalem && t !== 'ogun';
    $('#kopyaKip').hidden = kalem;
    $('#kopyaKalemKip').hidden = !kalem;
    $('#kopyaKipEtiket').textContent = kalem ? 'İşlem' : 'Hedefteki kalemler';
    $('#kopyaBaslik').textContent = kalem ? PB.kalemCumle(S.gunler[kopyaKalem.g].ogunler[kopyaKalem.o][kopyaKalem.k]) : t === 'ogun' ? 'Öğünü kopyala' : 'Günü kopyala';
    kopyaHedefCiz();
  }
  function kopyaAc(g, o, kalem) {
    kopyaKalem = kalem || null;
    const secenek = acikOgunler().map((x) => '<option value="' + x.id + '">' + esc(x.ad) + ' · ' + esc(DD.bicim.saat(x.saat)) + '</option>').join('');
    $('#kopyaOgunKaynak').innerHTML = secenek; $('#kopyaOgunHedef').innerHTML = secenek;
    if (o) { $('#kopyaOgunKaynak').value = o; $('#kopyaOgunHedef').value = o; }
    $('#kopyaPlan').innerHTML = '<option value="">Bu plan</option>' + kaynakPlanlar().map((p) => '<option value="' + esc(p.id) + '">' + esc(p.ad) + '</option>').join('');
    kopyaKaynakCiz(g == null ? secGun : g);
    kopyaTurSec(o ? 'ogun' : 'gun');
    DD.ac('#kopyaModal');
  }
  function kopyaHedefCiz() {
    const k = +$('#kopyaKaynak').value, buPlan = !$('#kopyaPlan').value, tur = kopyaTuru();
    const ayniOgun = tur === 'gun' || $('#kopyaOgunKaynak').value === $('#kopyaOgunHedef').value;
    $('#kopyaHedef').innerHTML = S.gunler.map((_, i) => gunAd(i)).map((a, i) => (buPlan && ayniOgun && i === k ? '' : '<button class="cip" type="button" data-deger="' + i + '" aria-pressed="false">' + a + '</button>')).join('');
    kopyaOnayCiz();
  }
  function kopyaOnayCiz() {
    const n = $$('#kopyaHedef .cip.aktif').length;
    $('#kopyaOnay').textContent = n ? n + ' güne kopyala' : 'Kopyala';
  }
  function kopyaHizli(d) {
    const k = +$('#kopyaKaynak').value;
    const hedef = d === 'tumu' ? [0, 1, 2, 3, 4, 5, 6] : d === 'hafta-ici' ? gunGrubu(false) : [1, 2, 3].map((x) => (k + x) % 7);
    $$('#kopyaHedef .cip').forEach((b) => { const a = hedef.includes(+b.dataset.deger); b.classList.toggle('aktif', a); b.setAttribute('aria-pressed', String(a)); });
    kopyaOnayCiz();
  }
  function kopyala() {
    const hedefler = $$('#kopyaHedef .cip.aktif').map((b) => +b.dataset.deger);
    if (!hedefler.length) { DD.toast('En az bir hedef gün seç.', 'uyari'); return; }
    const ho = $('#kopyaOgunHedef').value;
    if (kopyaKalem) {
      const a = kopyaKalem, l = S.gunler[a.g].ogunler[a.o], k = l[a.k], tasi = $('#kopyaKalemKip [aria-pressed=true]').dataset.deger === 'tasi';
      hedefler.forEach((h) => S.gunler[h].ogunler[ho].push(kopya(k)));
      if (tasi) l.splice(a.k, 1);
      kopyaKalem = null;
      DD.kapat($('#kopyaModal')); degisti();
      DD.toast(tasi ? 'Kalem taşındı.' : 'Kalem ' + hedefler.length + ' güne kopyalandı.');
      return;
    }
    const k = +$('#kopyaKaynak').value, kip = $('#kopyaKip [aria-pressed=true]').dataset.deger, kaynakGun = kopyaGunleri()[k], ogunKipi = kopyaTuru() === 'ogun', ko = $('#kopyaOgunKaynak').value;
    const eslesme = ogunKipi ? [[ko, ho]] : Object.keys(kaynakGun.ogunler).map((o) => [o, o]);
    if (!eslesme.some(([a]) => kaynakGun.ogunler[a].length)) { DD.toast('Kaynakta kopyalanacak kalem yok.', 'uyari'); return; }
    hedefler.forEach((h) => eslesme.forEach(([a, b]) => {
      const l = kopya(kaynakGun.ogunler[a]);
      S.gunler[h].ogunler[b] = kip === 'yaz' ? l : S.gunler[h].ogunler[b].concat(l);
    }));
    DD.kapat($('#kopyaModal'));
    degisti();
    DD.toast((ogunKipi ? 'Öğün ' : '') + hedefler.length + ' güne kopyalandı.');
  }
  function tumGunlere(a) {
    const k = S.gunler[a.g].ogunler[a.o][a.k];
    let n = 0;
    S.gunler.forEach((g, i) => {
      if (i === a.g || g.ogunler[a.o].some((x) => (x.slug || x.ad) === (k.slug || k.ad))) return;
      g.ogunler[a.o].push(kopya(k)); n++;
    });
    degisti();
    DD.toast(n ? 'Kalem ' + n + ' güne eklendi.' : 'Kalem zaten bütün günlerde var.', n ? undefined : 'uyari');
  }

  /* ── Şablon ve önceki plan ─────────────────────────────────────────── */
  const secenekHtml = (s, plan) => '<button class="secenek" type="button" data-plan="' + plan + '" data-id="' + esc(s.id) + '">' + (s.gorsel ? '<img src="' + s.gorsel + '" alt="" loading="lazy">' : '<i class="fa-solid fa-layer-group" aria-hidden="true"></i>') + '<span>' + esc(s.ad) + '<small>' + esc(s.alt) + '</small></span></button>';
  function sablonCiz() {
    const l = PB.liste('sablonlar').map((s) => ({ id: s.id, ad: s.ad + ' · ' + sayi(s.kcal) + ' kcal', alt: s.aciklama || '', gorsel: PB.sablonGorsel(s), kendi: s.kendi || s.ozel }));
    const grup = (ad, x) => (x.length ? '<p class="alan-yardim"><b>' + ad + '</b></p>' + x.map((s) => secenekHtml(s, 'sablon-sec')).join('') : '');
    $('#sablonBaslik').textContent = sablonGun == null ? 'Şablondan doldur' : gunAd(sablonGun) + ' gününü doldur';
    $('#sablonListe').innerHTML = grup('Kendi şablonlarım', l.filter((s) => s.kendi)) + grup('Hazır şablonlar', l.filter((s) => !s.kendi));
  }
  function sablonUygula(s) {
    S.gunler = gunIcerikleri(s.gunler);
    S.hedef_kcal = s.kcal;
    if (s.makro) S.makro = kopya(s.makro);
    if (s.ogun_duzeni) S.ogun_duzeni = kopya(s.ogun_duzeni);
    if (!S.ad) S.ad = s.ad;
    S.sablon_id = s.id;
    kirli = true;
  }
  function sablonKaydet() {
    if (!dolu()) { DD.toast('Şablon için plana en az bir kalem ekle.', 'uyari'); return; }
    const ad = S.ad || 'Kendi şablonum', o = planYaz();
    PB.liste('sablonlar').push({ id: PB.yeniId('s'), ad, kcal: S.hedef_kcal, aciklama: 'Kendi şablonun · ' + PB.tarih(DD.bugun), ortalama: o.ortalama, gunler: o.gunler, ogun_duzeni: kopya(S.ogun_duzeni), makro: kopya(S.makro), kendi: true });
    PB.kaydet();
    DD.toast('“' + ad + '” kendi şablonlarına eklendi.');
  }
  function oncekiCiz() {
    const dn = S.danisan_id, l = PB.liste('planlar').filter((p) => p.id !== S.id).sort((a, b) => (b.danisan_id === dn ? 1 : 0) - (a.danisan_id === dn ? 1 : 0));
    $('#oncekiListe').innerHTML = l.map((p) => {
      const d = PB.danisan(p.danisan_id);
      return secenekHtml({ id: p.id, ad: p.ad, alt: (d ? d.ad + ' · ' : '') + sayi(p.hedef_kcal) + ' kcal · ' + PB.planDurum(p.durum).ad, gorsel: PB.sablonGorsel(p) }, 'onceki-sec');
    }).join('');
  }
  function ogunCiz() {
    $('#ogunListe').innerHTML = S.ogun_duzeni.map((o, i) =>
      '<div class="ogun-sutun' + (o.acik ? '' : ' kapali') + '"><span class="as-ikon"><i class="fa-solid ' + o.ikon + '" aria-hidden="true"></i></span><b>' + esc(o.ad) + '</b>' +
      '<input class="alan-girdi" type="time" value="' + esc(o.saat) + '" data-ogun-saat="' + i + '" aria-label="' + esc(o.ad) + ' saati">' +
      '<label class="anahtar"><input type="checkbox" data-ogun-acik="' + i + '"' + (o.acik ? ' checked' : '') + ' aria-label="' + esc(o.ad) + ' açık"><span class="anahtar-ray"></span></label></div>').join('');
  }

  /* ── Önizleme: danışanın Beslenme Planım'da göreceği metin ─────────── */
  function onizleCiz() {
    const dn = danisan(), dy = PB.demo().diyetisyen, g = S.gunler[onizGun], t = PB.topla(gunKalemleri(g));
    const metin = (k) => PB.kalemAd(k) + ' ' + (k.tur === 'serbest' ? k.olcu : k.tur === 'tarif' ? sayi(k.miktar, 1) + ' porsiyon' : sayi(k.miktar) + ' g');
    $('#onizleGovde').innerHTML = '<p class="alan-yardim"><i class="fa-solid fa-eye" aria-hidden="true"></i><span>' + (dn ? esc(dn.ad) + ' planı' : 'Danışan') + ' Beslenme Planım ekranında böyle görür. Henüz kaydedilmemiş değişiklikler dahildir.</span></p>' +
      '<div class="deger-liste"><div class="deger-satir"><span>Plan</span><b>' + esc(S.ad || 'Adsız plan') + '</b></div><div class="deger-satir"><span>Diyetisyenin</span><b>' + esc(dy.ad) + '</b></div><div class="deger-satir"><span>Hedef</span><b>' + sayi(S.hedef_kcal) + ' kcal/gün</b></div></div>' +
      (S.danisana_not ? '<div class="bilgi-notu"><i class="fa-solid fa-comment-medical" aria-hidden="true"></i><p>' + esc(S.danisana_not) + '</p></div>' : '') +
      '<div class="gun-sekme">' + S.gunler.map((_, i) => '<button type="button" data-plan="oniz-gun" data-g="' + i + '" aria-pressed="' + (i === onizGun) + '">' + gunKisa(i) + ' ' + gunTarihi(i) + '</button>').join('') + '</div>' +
      '<div>' + acikOgunler().map((o) => {
        const l = g.ogunler[o.id];
        return '<div class="oniz-ogun"><span><b>' + esc(DD.bicim.saat(o.saat)) + '</b><small>' + esc(o.ad) + '</small></span><ul>' + (l.length ? l.map((k) => '<li>' + esc(metin(k)) + (k.alternatif ? '<small>veya ' + esc(metin(k.alternatif)) + '</small>' : '') + '</li>').join('') : '<li><small>Bu öğün için kalem yok.</small></li>') + '</ul><b>' + sayi(PB.topla(l).kcal) + ' kcal</b></div>';
      }).join('') + '</div>' +
      '<div class="deger-satir"><span>Gün toplamı</span><b>' + sayi(t.kcal) + ' / ' + sayi(S.hedef_kcal) + ' kcal</b></div>';
  }

  /* ── Alışveriş listesi: planın malzemeleri toplanır, reyona göre gruplanır ── */
  const GRUPLAR = [
    ['Sebze ve meyve', ['domates', 'biber', 'salatalık', 'marul', 'roka', 'soğan', 'sarımsak', 'havuç', 'kabak', 'patlıcan', 'ıspanak', 'pırasa', 'patates', 'mantar', 'limon', 'muz', 'elma', 'portakal', 'çilek', 'armut', 'kivi', 'nar ', 'üzüm', 'maydanoz', 'dereotu', 'avokado', 'mandalina', 'şeftali', 'brokoli', 'karnabahar', 'taze']],
    ['Et, tavuk, balık', ['tavuk', 'piliç', 'hindi', 'dana', 'kıyma', 'levrek', 'somon', 'ton balığı', 'uskumru', 'alabalık', 'karides']],
    ['Süt ürünleri ve yumurta', ['süt', 'yoğurt', 'peynir', 'kefir', 'ayran', 'yumurta', 'tereyağ']],
    ['Tahıl ve baklagil', ['ekmek', 'bulgur', 'pirinç', 'makarna', 'yulaf', 'kinoa', 'mercimek', 'nohut', 'fasulye', 'barbunya', 'buğday', 'kuskus', 'mısır', 'irmik', 'un']],
    ['Kuruyemiş ve yağ', ['ceviz', 'badem', 'fındık', 'kaju', 'fıstık', 'zeytinyağı', 'zeytin', 'ayçiçek', 'tahin', 'susam']],
  ];
  const BAHARAT = ['karabiber', 'pul biber', 'salça', 'tuz', 'kimyon', 'kekik', 'nane', 'tarçın', 'sirke', 'ekşisi', 'baharat', 'zerdeçal', 'sumak'];
  const grubu = (ad) => {
    const a = PB.kucuk(ad) + ' ';
    if (BAHARAT.some((k) => a.includes(k))) return 'Baharat ve diğer';
    const e = GRUPLAR.find((x) => x[1].some((k) => a.includes(k)));
    return e ? e[0] : 'Baharat ve diğer';
  };
  function alisverisListe() {
    const h = new Map(), ekle = (ad, gram, metin) => {
      const anahtar = PB.kucuk(ad.replace(/\s*\(.*$/, ''));
      const e = h.get(anahtar) || { ad: ad.replace(/\s*\(.*$/, ''), gram: 0, metin: new Set() };
      e.gram += gram || 0; if (metin) e.metin.add(metin); h.set(anahtar, e);
    };
    S.gunler.forEach((g) => gunKalemleri(g).forEach((k) => {
      if (k.tur === 'serbest' && !(k.malzemeler || []).length) { ekle(k.ad, 0, k.olcu); return; }
      const c = k.tur === 'serbest' ? { malzemeler: k.malzemeler, porsiyon: 1 } : PB.katalog(k);
      if (!c) return;
      if (k.tur === 'besin') { ekle(c.ad, k.miktar); return; }
      const oran = k.miktar / (c.porsiyon || 1);
      (c.malzemeler || []).forEach((m) => {
        const r = m.match(/^([\d.,]+)\s*(g|ml)\s+(.+)$/);
        if (r) ekle(r[3], parseFloat(r[1].replace(',', '.')) * oran);
        else if (!/(^|\s)su(yu)?$/i.test(m.trim())) m.split(',').forEach((x) => ekle(x.trim().replace(/^./, (h) => h.toLocaleUpperCase('tr')), 0));
      });
    }));
    const sonuc = new Map();
    [...h.values()].sort((a, b) => a.ad.localeCompare(b.ad, 'tr')).forEach((e) => {
      const grup = grubu(e.ad), g = Math.round(e.gram / 5) * 5;
      const miktar = g >= 1000 ? sayi(g / 1000, 1) + ' kg' : g ? sayi(g) + ' g' : [...e.metin].join(', ');
      if (!sonuc.has(grup)) sonuc.set(grup, []);
      sonuc.get(grup).push({ ad: e.ad, miktar });
    });
    return [...GRUPLAR.map((x) => x[0]), 'Baharat ve diğer'].filter((a) => sonuc.has(a)).map((a) => [a, sonuc.get(a)]);
  }
  function alisverisCiz() {
    const l = alisverisListe(), n = l.reduce((a, x) => a + x[1].length, 0);
    $('#alisverisGovde').innerHTML = l.length ? l.map(([ad, x]) => '<div class="liste-grup"><h3>' + esc(ad) + '</h3><div class="deger-liste">' + x.map((m) => '<div class="deger-satir"><span>' + esc(m.ad) + '</span><b>' + esc(m.miktar) + '</b></div>').join('') + '</div></div>').join('') : '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-basket-shopping" aria-hidden="true"></i></span><h3>Liste boş</h3><p>Plana kalem ekleyince malzemeler burada toplanır.</p></div>';
    $('#alisverisNot').textContent = n ? n + ' malzeme, ' + S.gunler.length + ' günlük plan' : '';
  }

  /* ── Kayıt ve gönderim ─────────────────────────────────────────────── */
  function planYaz() {
    const r = (v) => Math.round(v * 10) / 10;
    const gunler = S.gunler.map((g) => {
      const ogunler = {};
      S.ogun_duzeni.forEach((o) => {
        if (!o.acik) return;
        ogunler[o.id] = g.ogunler[o.id].map((k) => {
          const d = PB.kalemDeger(k);
          return Object.assign(kalemSade(k), { kcal: r(d.kcal), protein: r(d.protein), yag: r(d.yag), karb: r(d.karb) });
        });
      });
      const t = PB.topla(Object.values(ogunler).flat()), s = PB.sapma(t.kcal, S.hedef_kcal);
      return { gun: g.gun, ad: gunAd(g.gun - 1), ogunler, toplam: { kcal: r(t.kcal), protein: r(t.protein), yag: r(t.yag), karb: r(t.karb) }, sapma_yuzde: t.kcal ? Math.round(s.oran * 1000) / 10 : null, durum: t.kcal ? s.durum : 'bos' };
    });
    const doluGun = gunler.filter((g) => g.toplam.kcal), n = doluGun.length || 1, top = (a) => Math.round((doluGun.reduce((x, g) => x + g.toplam[a], 0) / n) * 10) / 10;
    const o = { id: S.id, danisan_id: S.danisan_id, ad: S.ad, hedef_kcal: S.hedef_kcal, durum: S.durum, danisana_not: S.danisana_not, makro: kopya(S.makro), tarih: S.tarih || DD.bugun, baslangic: S.baslangic, ortalama: { kcal: top('kcal'), protein: top('protein'), yag: top('yag'), karb: top('karb') }, gunler, ogun_duzeni: kopya(S.ogun_duzeni), guncelleme: S.guncelleme, surum: S.surum, gonderim: S.gonderim, sablon_id: S.sablon_id };
    if (doluGun.length < gunler.length) o.dolu_gun = doluGun.length;
    return o;
  }
  function kaydet(yayinla) {
    const liste = PB.liste('planlar');
    if (!S.id) { S.id = PB.yeniId('pl'); history.replaceState(null, '', '?plan=' + S.id); }
    S.guncelleme = PB.simdi();
    const o = planYaz(), i = liste.findIndex((p) => p.id === S.id);
    if (i < 0) liste.unshift(o);
    else if (S.durum === 'gonderildi' && !yayinla) liste[i].taslak = o;
    else liste[i] = o;
    PB.kaydet();
    kirli = false;
    ciz();
  }
  function gondermeyeHazir() {
    if (!S.ad.trim()) { DD.toast('Plan adı olmadan gönderilemez.', 'hata'); $('#planAd').focus(); return false; }
    if (!S.danisan_id) { DD.toast('Göndermek için danışan seç.', 'hata'); $('#planDanisan').focus(); return false; }
    if (!dolu()) { DD.toast('Plan boş, önce kalem ekle.', 'hata'); return false; }
    if (makroToplam() !== 100) { DD.toast('Makro yüzdeleri %100 etmeli.', 'hata'); return false; }
    return true;
  }
  function gonderAc() {
    if (!gondermeyeHazir()) return;
    const u = uyarilar(), o = planYaz(), d = danisan();
    const engel = u.cakisma.length > 0;
    let h = '<div class="deger-liste"><div class="deger-satir"><span>Danışan</span><b>' + esc(d.ad) + '</b></div><div class="deger-satir"><span>Plan</span><b>' + esc(S.ad) + '</b></div><div class="deger-satir"><span>Ortalama / hedef</span><b>' + sayi(o.ortalama.kcal) + ' / ' + sayi(S.hedef_kcal) + ' kcal</b></div></div>';
    if (u.cakisma.length) h += '<div class="uyari-kutu tehlike"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span><b>' + u.cakisma.length + ' kalem danışanın hassasiyetiyle çakışıyor:</b> ' + esc([...new Set(u.cakisma.map((c) => c.ad))].join(', ')) + '.</span></div>';
    if (u.sapma.length) h += '<div class="uyari-kutu uyari"><i class="fa-solid fa-gauge-high" aria-hidden="true"></i><span><b>' + u.sapma.length + ' gün hedeften sapıyor:</b> ' + gunListe(u.sapma) + '.</span></div>';
    if (u.bos.length) h += '<div class="uyari-kutu uyari"><i class="fa-solid fa-calendar-xmark" aria-hidden="true"></i><span><b>' + u.bos.length + ' gün boş:</b> ' + gunListe(u.bos) + '.</span></div>';
    if (u.oneri.length) h += '<div class="bilgi-notu"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i><p><b>Tahlil ve kronik durum notları:</b> ' + esc(u.oneri.map((x) => x.baslik).join(', ')) + '. Önerileri planda kontrol ettiysen devam et.</p></div>';
    if (!u.cakisma.length && !u.sapma.length && !u.bos.length) h += '<div class="bilgi-notu"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><p>Plan kurallardan geçti. Danışan planı Beslenme Planım ekranında görecek.</p></div>';
    if (engel) h += '<label class="ayar-satir"><input type="checkbox" id="gonderOnayKutu"><span class="as-metin"><b>Çakışmaları gördüm, yine de göndereceğim.</b></span></label>';
    $('#gonderGovde').innerHTML = h;
    $('#gonderOnay').disabled = engel;
    DD.ac('#gonderModal');
  }
  function gonder() {
    S.durum = 'gonderildi'; S.surum = (S.surum || 0) + 1; S.gonderim = PB.simdi(); S.tarih = DD.bugun;
    kaydet(true);
    const d = PB.demo();
    if (d.uye && d.uye.danisan_id === S.danisan_id) d.uye.plan_id = S.id;
    if (window.PA && PA.mesajYaz) PA.mesajYaz(S.danisan_id, '“' + S.ad + '” planını gönderdim. Beslenme Planım ekranından görebilirsiniz.');
    PB.kaydet();
    DD.kapat($('#gonderModal'));
    DD.toast(danisan().ad + ' planı Beslenme Planım ekranında görecek.');
    sonrakiCiz();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function yanDegistir() {
    const kap = $('#planCalisma'), kapali = kap.classList.toggle('yan-kapali'), d = $('#yanDugme');
    d.setAttribute('aria-pressed', String(!kapali));
    d.setAttribute('aria-label', kapali ? 'Sağ paneli göster' : 'Sağ paneli gizle');
  }

  /* ── Olaylar ───────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const c = e.target.closest('[data-plan]');
    if (acikMenu && !(c && ['kart-menu', 'gun-menu'].includes(c.dataset.plan)) && !e.target.closest('.plan-menu')) menuKapat();
    const secilen = e.target.closest('#kopyaHedef .cip');
    if (secilen) { secilen.classList.toggle('aktif'); secilen.setAttribute('aria-pressed', secilen.classList.contains('aktif')); kopyaOnayCiz(); return; }
    const hizli = e.target.closest('#kopyaHizli .cip');
    if (hizli) { kopyaHizli(hizli.dataset.deger); return; }
    const makroCip = e.target.closest('#makroHazir .cip');
    if (makroCip) { const [p, k, y] = makroCip.dataset.deger.split(',').map(Number); S.makro = { p, k, y }; makroDoldur(); degisti(); return; }
    const diyet = e.target.closest('#suzDiyet .cip');
    if (diyet) { diyet.classList.toggle('aktif'); diyet.setAttribute('aria-pressed', diyet.classList.contains('aktif')); listeCiz(); return; }
    const alerjen = e.target.closest('#ytAlerjen .cip');
    if (alerjen) { const a = alerjen.classList.toggle('aktif'); alerjen.setAttribute('aria-pressed', String(a)); return; }
    const kay = e.target.closest('#seciciPanel [data-kaynak]');
    if (kay) { mikroSuzgec = null; $('#suzKategori').value = ''; kaynakSec(kay.dataset.kaynak); return; }
    if (!c) return;
    const g = +c.dataset.g, o = c.dataset.o, k = +c.dataset.k, a = menuKalem;
    switch (c.dataset.plan) {
      case 'ekle-ac': altHedef = null; degistirHedef = null; seciciAc(g, o); break;
      case 'danisan-odak': $('#planDanisan').focus(); break;
      case 'bos-basla': bosBasladi = true; ciz(); break;
      case 'yan-degistir': yanDegistir(); break;
      case 'serbest-gec': kaynakSec('serbest'); $('#sbAd').value = arama; $('#sbAd').focus(); break;
      case 'serbest-ekle': {
        const ad = $('#sbAd').value.trim(), kcal = parseFloat($('#sbKcal').value), sayiOku = (s) => parseFloat($(s).value) || 0;
        if (!ad) { DD.toast('Kalem adı zorunlu.', 'hata'); $('#sbAd').focus(); return; }
        if (!(kcal >= 0)) { DD.toast('Enerji değeri zorunlu.', 'hata'); $('#sbKcal').focus(); return; }
        const y = { tur: 'serbest', ad, olcu: $('#sbOlcu').value.trim() || '1 porsiyon', miktar: 1, kcal, protein: sayiOku('#sbP'), karb: sayiOku('#sbK'), yag: sayiOku('#sbY') };
        ['#sbAd', '#sbOlcu', '#sbKcal', '#sbP', '#sbK', '#sbY'].forEach((s) => { $(s).value = ''; });
        if (kalemYerlestir(y)) return;
        S.gunler[hedefHucre.g].ogunler[hedefHucre.o].push(y);
        degisti(); sheetOzet();
        const uy = PB.kalemUyariK(y, danisan());
        DD.toast(uy.length ? PB.hassasiyetAd(uy[0]) + ': kalem eklendi, uyarı listesine düştü.' : 'Serbest kalem eklendi.', uy.length ? 'uyari' : undefined);
        $('#sbAd').focus();
        break;
      }
      case 'kalem-tasi': {
        const b = acikKalem, l = S.gunler[b.g].ogunler[b.o], yeni = b.k + +c.dataset.yon;
        [l[b.k], l[yeni]] = [l[yeni], l[b.k]]; b.k = yeni; degisti(); kalemCiz();
        break;
      }
      case 'mikro-ac': {
        const hc = hedefHucre || { g: secGun, o: 'ogle' };
        altHedef = null; degistirHedef = null;
        seciciAc(hc.g, hc.o, { ad: c.dataset.ad, liste: PB.mikroKaynaklari(c.dataset.mikro) });
        break;
      }
      case 'ekle': {
        const satir = c.closest('.secim-satir'), m = parseFloat(satir.querySelector('input').value);
        if (!(m > 0)) { DD.toast('Miktar sıfırdan büyük olmalı.', 'uyari'); return; }
        const y = { tur: kaynak, slug: c.dataset.slug, miktar: m };
        if (kalemYerlestir(y)) return;
        S.gunler[hedefHucre.g].ogunler[hedefHucre.o].push(y);
        degisti(); sheetOzet();
        const uy = PB.kalemUyari(kaynak, c.dataset.slug, danisan());
        if (uy.length) DD.toast(PB.hassasiyetAd(uy[0]) + ': kalem eklendi, uyarı listesine düştü.', 'uyari');
        c.textContent = 'Eklendi'; setTimeout(() => { if (c.isConnected) c.textContent = 'Ekle'; }, 1200);
        break;
      }
      case 'tarif-ekle': {
        const t = PB.tariflerim().find((x) => x.id === c.dataset.id), m = parseFloat(c.closest('.secim-satir').querySelector('input').value);
        if (!t) return;
        if (!(m > 0)) { DD.toast('Miktar sıfırdan büyük olmalı.', 'uyari'); return; }
        const y = PB.tarifKalemi(t, m);
        if (kalemYerlestir(y)) return;
        S.gunler[hedefHucre.g].ogunler[hedefHucre.o].push(y);
        degisti(); sheetOzet();
        const uy = PB.kalemUyariK(y, danisan());
        if (uy.length) DD.toast(PB.hassasiyetAd(uy[0]) + ': kalem eklendi, uyarı listesine düştü.', 'uyari');
        c.textContent = 'Eklendi'; setTimeout(() => { if (c.isConnected) c.textContent = 'Ekle'; }, 1200);
        break;
      }
      case 'tarif-yeni': tarifKaynakSec('yeni'); break;
      case 'tarif-duzenle': tarifDuzenle(c.dataset.id); break;
      case 'tarif-sil': tarifSil(c.dataset.id); break;
      case 'tarif-vazgec': tarifKaynakSec('kayitli'); break;
      case 'kalem-ac': kalemAc(g, o, k); break;
      case 'kart-menu': menuKalem = { g, o, k }; if (acikMenu && acikMenu.btn === c) menuKapat(); else menuAc('#kartMenu', c); break;
      case 'gun-menu': menuGun = g; if (acikMenu && acikMenu.btn === c) menuKapat(); else menuAc('#gunMenu', c); break;
      case 'k-degistir': menuKapat(); altHedef = null; degistirHedef = a; seciciAc(a.g, a.o); break;
      case 'k-porsiyon': menuKapat(); kalemAc(a.g, a.o, a.k); break;
      case 'k-kopyala': menuKapat(); kopyaAc(a.g, a.o, a); $('#kopyaOgunHedef').value = a.o; break;
      case 'k-tumu': menuKapat(); tumGunlere(a); break;
      case 'k-sil': menuKapat(); S.gunler[a.g].ogunler[a.o].splice(a.k, 1); degisti(); break;
      case 'g-kopyala': menuKapat(); kopyaAc(menuGun); break;
      case 'g-sablon': menuKapat(); sablonGun = menuGun; sablonCiz(); DD.ac('#sablonModal'); break;
      case 'g-temizle': {
        menuKapat();
        const i = menuGun;
        window.DM_ONAY(gunAd(i) + ' temizlensin mi?', 'Bu günün bütün kalemleri kaldırılır.', 'Temizle', (ok) => {
          if (!ok) return;
          Object.keys(S.gunler[i].ogunler).forEach((x) => { S.gunler[i].ogunler[x] = []; });
          degisti(); DD.toast(gunAd(i) + ' temizlendi.');
        });
        break;
      }
      case 'alt-ac': altHedef = acikKalem; degistirHedef = null; DD.kapat($('#kalemModal')); seciciAc(altHedef.g, altHedef.o); break;
      case 'alt-sil': delete S.gunler[acikKalem.g].ogunler[acikKalem.o][acikKalem.k].alternatif; degisti(); kalemCiz(); break;
      case 'analiz-gun': analizKapsam = String(g); analizCiz(); break;
      case 'kalem-sil': {
        const b = acikKalem; S.gunler[b.g].ogunler[b.o].splice(b.k, 1);
        DD.kapat($('#kalemModal')); degisti(); break;
      }
      case 'gun-sec': secGun = g; izgaraCiz(); if (gorunum === 'gun') gunCiz(); break;
      case 'kopyala-ac': kopyaAc(Number.isNaN(g) ? null : g, o); break;
      case 'kopyala': kopyala(); break;
      case 'ogun-ac': ogunCiz(); DD.ac('#ogunModal'); break;
      case 'sablon-ac': sablonGun = null; sablonCiz(); DD.ac('#sablonModal'); break;
      case 'onceki-ac': oncekiCiz(); DD.ac('#oncekiModal'); break;
      case 'sablon-sec': {
        const s = PB.liste('sablonlar').find((x) => x.id === c.dataset.id);
        if (sablonGun != null) {
          const i = sablonGun, kaynakGun = gunIcerikleri(s.gunler)[i];
          S.gunler[i].ogunler = kaynakGun.ogunler; sablonGun = null;
          DD.kapat($('#sablonModal')); degisti(); DD.toast(gunAd(i) + ', “' + s.ad + '” şablonundan dolduruldu.');
          return;
        }
        const uygula = () => { sablonUygula(s); DD.kapat($('#sablonModal')); formDoldur(); ciz(); DD.toast('“' + s.ad + '” şablonu ızgaraya uygulandı.'); };
        if (dolu()) window.DM_ONAY('Şablon uygulansın mı?', 'Izgaradaki kalemler “' + s.ad + '” şablonuyla değişir.', 'Uygula', (ok) => { if (ok) uygula(); });
        else uygula();
        break;
      }
      case 'onceki-sec': {
        const p = PB.liste('planlar').find((x) => x.id === c.dataset.id);
        S.gunler = gunIcerikleri(p.gunler); S.hedef_kcal = p.hedef_kcal;
        if (p.makro) S.makro = kopya(p.makro);
        if (p.ogun_duzeni) S.ogun_duzeni = kopya(p.ogun_duzeni);
        if (!S.ad) S.ad = p.ad + ' (kopya)';
        kirli = true; DD.kapat($('#oncekiModal')); formDoldur(); ciz(); DD.toast('“' + p.ad + '” planından kopyalandı.');
        break;
      }
      case 'sablon-kaydet': sablonKaydet(); break;
      case 'onizle-ac': onizGun = secGun; onizleCiz(); DD.ac('#onizleModal'); break;
      case 'oniz-gun': onizGun = g; onizleCiz(); break;
      case 'alisveris-ac': alisverisCiz(); DD.ac('#alisverisModal'); break;
      case 'alisveris-kopyala': {
        const metin = alisverisListe().map(([ad, x]) => ad + '\n' + x.map((m) => '- ' + m.ad + (m.miktar ? ': ' + m.miktar : '')).join('\n')).join('\n\n');
        const yaz = navigator.clipboard ? navigator.clipboard.writeText(metin) : Promise.reject();
        yaz.then(() => DD.toast('Liste kopyalandı.'), () => DD.toast('Liste kopyalanamadı.', 'uyari'));
        break;
      }
      case 'yazdir': window.print(); break;
      case 'kaydet':
        if (!S.ad.trim()) { DD.toast('Plan adı zorunlu.', 'hata'); $('#planAd').focus(); return; }
        if (S.durum === 'arsiv') S.durum = 'taslak';
        kaydet(); DD.toast(S.durum === 'gonderildi' ? 'Değişiklik kaydedildi. Danışan yeniden gönderene kadar önceki sürümü görür.' : 'Taslak kaydedildi.');
        break;
      case 'gonder-ac': gonderAc(); break;
      case 'gonder': gonder(); break;
    }
  });
  $('#yeniTarifAlan').addEventListener('submit', (e) => { e.preventDefault(); tarifKaydet(); });
  document.addEventListener('dd:secim', function (e) {
    if (e.target.id === 'planGorunum') gorunumSec(e.detail.deger);
    if (e.target.id === 'kopyaTur') kopyaTurSec(e.detail.deger);
    if (e.target.id === 'tarifKaynak') tarifKaynakSec(e.detail.deger);
    if (e.target.id === 'analizOge') { analizOge = e.detail.deger; analizCiz(); }
  });
  /* Drawer kapanınca değiştirme ve alternatif modu düşer, odak hücreye döner */
  new MutationObserver(() => {
    if (!$('#seciciPanel').hidden) return;
    altHedef = null; degistirHedef = null;
    const h = hedefHucre && $('.plan-hucre[data-g="' + hedefHucre.g + '"][data-o="' + hedefHucre.o + '"] .plan-ekle');
    if (h && gorunum === 'hafta') h.focus({ preventScroll: true });
  }).observe($('#seciciPanel'), { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && acikMenu) { const b = acikMenu.btn; menuKapat(); b.focus(); } });
  addEventListener('scroll', menuKapat, { passive: true });
  document.addEventListener('input', function (e) {
    const t = e.target;
    if (t.id === 'sheetAra') { arama = t.value.trim(); listeCiz(); return; }
    if (t.id === 'kalemMiktar') {
      const v = parseFloat(t.value);
      if (v > 0) { const a = acikKalem, y = S.gunler[a.g].ogunler[a.o][a.k]; if (y.baz) Object.assign(y, PB.tarifOlcekle(y, v)); else y.miktar = v; degisti(); kalemCiz(); }
      return;
    }
    const satir = t.closest && t.closest('.secim-satir');
    if (satir && t.type === 'number') {
      if (satir.dataset.tarif) { satir.querySelector('[data-rol=meta]').innerHTML = tarifMeta(PB.tariflerim().find((x) => x.id === satir.dataset.tarif), parseFloat(t.value) || 0); return; }
      const c = PB.katalog({ tur: kaynak, slug: satir.dataset.slug });
      satir.querySelector('[data-rol=meta]').innerHTML = satirMeta(kaynak, c, parseFloat(t.value) || 0);
      return;
    }
    if (t.dataset.makro) { S.makro[t.dataset.makro] = parseFloat(t.value) || 0; makroCiz(); degisti(); return; }
    if (t.dataset.serbest) {
      const a = acikKalem, k = S.gunler[a.g].ogunler[a.o][a.k];
      k[t.dataset.serbest] = t.type === 'number' ? parseFloat(t.value) || 0 : t.value;
      degisti(); kalemCiz();
      return;
    }
    if (t.dataset.ogunSaat != null) { S.ogun_duzeni[+t.dataset.ogunSaat].saat = t.value; degisti(); return; }
    if (t.id === 'planAd') { S.ad = t.value; kirli = true; baslikCiz(); ozetCiz(); }
    if (t.id === 'planHedef') { const v = parseFloat(t.value); if (v > 0) { S.hedef_kcal = v; degisti(); } }
    if (t.id === 'planNot') { S.danisana_not = t.value; kirli = true; baslikCiz(); ozetCiz(); }
  });
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.id === 'planDanisan') { S.danisan_id = t.value; danisanCiz(); degisti(); }
    if (t.id === 'planBaslangic' && t.value) { S.baslangic = t.value; degisti(); }
    if (t.id === 'kopyaKaynak' || t.id === 'kopyaOgunKaynak' || t.id === 'kopyaOgunHedef') kopyaHedefCiz();
    if (t.id === 'kopyaPlan') kopyaKaynakCiz(+$('#kopyaKaynak').value);
    if (t.id === 'analizKapsam') { analizKapsam = t.value; analizCiz(); }
    if (['suzOgun', 'suzKcal', 'suzKategori'].includes(t.id)) listeCiz();
    if (t.dataset.ogunAcik != null) { S.ogun_duzeni[+t.dataset.ogunAcik].acik = t.checked; t.closest('.ogun-sutun').classList.toggle('kapali', !t.checked); degisti(); }
    if (t.id === 'gonderOnayKutu') $('#gonderOnay').disabled = !t.checked;
  });

  /* Sürükle-bırak: taşır, Alt basılıysa kopyalar. Kenara gelince sayfa kayar, uzak hücreye ulaşılır */
  let suruk = null;
  const izgara = $('#planIzgara');
  izgara.addEventListener('dragstart', (e) => {
    const k = e.target.closest('.plan-kart');
    if (!k) return;
    suruk = { g: +k.dataset.g, o: k.dataset.o, k: +k.dataset.k };
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', k.title);
    k.classList.add('surukleniyor');
  });
  izgara.addEventListener('dragover', (e) => {
    const h = e.target.closest('.plan-hucre');
    if (!h || !suruk) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move';
    $$('.surukle-hedef', izgara).forEach((x) => x.classList.remove('surukle-hedef'));
    h.classList.add('surukle-hedef');
  });
  document.addEventListener('dragover', (e) => {
    if (!suruk) return;
    const alt = innerHeight - 96;
    if (e.clientY > alt) scrollBy(0, 24); else if (e.clientY < 136) scrollBy(0, -24);
  });
  izgara.addEventListener('dragend', () => { suruk = null; $$('.surukle-hedef,.surukleniyor', izgara).forEach((x) => x.classList.remove('surukle-hedef', 'surukleniyor')); });
  izgara.addEventListener('drop', (e) => {
    const h = e.target.closest('.plan-hucre');
    if (!h || !suruk) return;
    e.preventDefault();
    const kaynakL = S.gunler[suruk.g].ogunler[suruk.o], hedefL = S.gunler[+h.dataset.g].ogunler[h.dataset.o];
    if (e.altKey) hedefL.push(kopya(kaynakL[suruk.k]));
    else if (kaynakL !== hedefL) hedefL.push(kaynakL.splice(suruk.k, 1)[0]);
    suruk = null;
    degisti();
  });
  window.addEventListener('beforeunload', (e) => { if (kirli) e.preventDefault(); });

  /* Hafta görünümü için sol menü daralır: yedi gün ve sağ panel birlikte sığar */
  if (innerWidth >= 1200) {
    document.body.classList.add('panel-katli');
    const k = $('.panel-katla');
    if (k) k.setAttribute('aria-pressed', 'true');
  }
  new ResizeObserver(() => {
    const w = $('#planKart').offsetWidth, g = $('#planIzgara');
    g.classList.toggle('dar', w < 790); g.classList.toggle('cok-dar', w < 720);
  }).observe($('#planKart'));

  yukle();
  formDoldur();
  ciz();
  if (dar.matches) { gorunum = 'gun'; $$('#planGorunum button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === 'gun'))); }
  gorunumSec(gorunum);
  if (PB.parametre('yazdir')) setTimeout(() => window.print(), 300);
  if (PB.parametre('gonder')) gonderAc();
})();
