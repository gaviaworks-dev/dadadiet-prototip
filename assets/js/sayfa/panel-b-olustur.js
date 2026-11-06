/* Plan oluşturucu. Durum S üzerinde tutulur, her değişiklikte görünüm yeniden kurulur.
   Plan kaydı demo.planlar şemasındadır; üye tarafı aynı kaydı hesabim/beslenme-planim ekranında okur. */
(function () {
  'use strict';
  const { $, $$, esc, sayi } = PB;
  const dar = window.matchMedia('(max-width:720px)');
  let S, kirli = false, secGun = 0, hedefHucre = null, acikKalem = null;
  let kaynak = 'tarif', kategori = 'Tümü', arama = '', mikroSuzgec = null, altHedef = null;
  let gorunum = 'plan', analizKapsam = 'hafta', analizOge = 'kcal';

  /* ── Durum ─────────────────────────────────────────────────────────── */
  const yeniPlan = () => ({
    id: null, danisan_id: '', ad: '', hedef_kcal: 1600, durum: 'taslak', danisana_not: '', makro: PB.makroVarsayilan(),
    baslangic: PB.gunEkle(DD.bugun, 3), ogun_duzeni: PB.ogunSablonu(), gunler: PB.bosGunler(), surum: 0,
  });
  const kopya = (o) => JSON.parse(JSON.stringify(o));
  /* Serbest kalem slug taşımaz: ad, olcu ve değerler kalemin kendisindedir */
  const kalemSade = (k) => {
    const y = k.tur === 'serbest' ? { tur: 'serbest', ad: k.ad, olcu: k.olcu, miktar: 1, kcal: k.kcal || 0, protein: k.protein || 0, yag: k.yag || 0, karb: k.karb || 0 } : { tur: k.tur, slug: k.slug, miktar: k.miktar };
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
  const degisti = () => { kirli = true; ciz(); };

  /* ── Izgara ────────────────────────────────────────────────────────── */
  const gunAd = (i) => PB.gunAd(S.baslangic, i);
  const gunKisa = (i) => PB.gunKisa(S.baslangic, i);
  /* Hafta içi ve hafta sonu plan sırasına göre değil, günün takvimdeki yerine göre seçilir */
  const gunGrubu = (haftaSonu) => S.gunler.map((_, i) => i).filter((i) => (PB.haftaGunu(S.baslangic, i) >= 5) === haftaSonu);
  const gunTarihi = (i) => PB.tarih(PB.gunEkle(S.baslangic, i)).slice(0, 5);
  function kalemHtml(k, gi, oid, ki) {
    const d = PB.kalemDeger(k), p = PB.kalemParca(k);
    const uy = PB.kalemUyariK(k, danisan()).concat(k.alternatif ? PB.kalemUyariK(k.alternatif, danisan()) : []);
    const ad = esc(PB.kalemAd(k));
    return '<div class="plan-kalem' + (uy.length ? ' uyarili' : '') + '" draggable="true" data-g="' + gi + '" data-o="' + oid + '" data-k="' + ki + '">' +
      '<button class="plan-kalem-ac" type="button" data-plan="kalem-ac" data-g="' + gi + '" data-o="' + oid + '" data-k="' + ki + '" aria-label="' + ad + ', miktarı düzenle">' +
      (uy.length ? '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>' : '') + esc(p.on) + ' <b>' + ad + '</b> ' + esc(p.son) +
      '<small>' + sayi(d.kcal) + ' kcal</small>' + (k.alternatif ? '<span class="veya">veya ' + esc(PB.kalemCumle(k.alternatif)) + '</span>' : '') + '</button>' +
      '<button class="plan-mini-dugme" type="button" data-plan="kalem-cikar" data-g="' + gi + '" data-o="' + oid + '" data-k="' + ki + '" aria-label="' + ad + ' kalemini çıkar"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>';
  }
  function izgaraCiz(hepsi) {
    const kap = $('#planIzgara');
    const gunler = hepsi || !dar.matches ? S.gunler.map((_, i) => i) : [secGun];
    kap.style.setProperty('--plan-gun', gunler.length);
    let h = '<div class="plan-bas plan-kose"></div>';
    gunler.forEach((i) => {
      h += '<div class="plan-bas' + (i === secGun ? ' secili' : '') + '"><button class="plan-gun-ac" type="button" data-plan="gun-sec" data-g="' + i + '" aria-pressed="' + (i === secGun) + '">' + gunKisa(i) + '<small>' + (i + 1) + '. Gün · ' + gunTarihi(i) + '</small></button>' +
        '<button class="plan-mini-dugme" type="button" data-plan="kopyala-ac" data-g="' + i + '" aria-label="' + gunAd(i) + ' gününü kopyala"><i class="fa-solid fa-clone" aria-hidden="true"></i></button></div>';
    });
    acikOgunler().forEach((o) => {
      h += '<div class="plan-ogun"><i class="fa-solid ' + o.ikon + '" aria-hidden="true"></i>' + esc(o.ad) + '<small>' + esc(o.saat) + '</small></div>';
      gunler.forEach((i) => {
        const l = S.gunler[i].ogunler[o.id];
        h += '<div class="plan-hucre" data-g="' + i + '" data-o="' + o.id + '">' + l.map((k, ki) => kalemHtml(k, i, o.id, ki)).join('') +
          (l.length > 1 ? '<div class="plan-ogun-toplam">Öğün: ' + sayi(PB.topla(l).kcal) + ' kcal</div>' : '') +
          '<div class="plan-hucre-alt"><button class="plan-ekle" type="button" data-plan="ekle-ac" data-g="' + i + '" data-o="' + o.id + '" aria-label="' + gunAd(i) + ' ' + esc(o.ad) + ' öğününe ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i> Ekle</button>' +
          (l.length ? '<button class="plan-mini-dugme" type="button" data-plan="kopyala-ac" data-g="' + i + '" data-o="' + o.id + '" aria-label="' + gunAd(i) + ' ' + esc(o.ad) + ' öğününü kopyala"><i class="fa-solid fa-clone" aria-hidden="true"></i></button>' : '') + '</div></div>';
      });
    });
    h += '<div class="plan-ogun">Gün toplamı</div>';
    gunler.forEach((i) => {
      const t = PB.topla(gunKalemleri(S.gunler[i])), s = PB.sapma(t.kcal, S.hedef_kcal);
      const oran = S.hedef_kcal ? Math.min(100, Math.round((t.kcal / S.hedef_kcal) * 100)) : 0;
      h += '<div class="plan-toplam yigilmis ' + s.durum + '"><span class="ust-satir"><span>' + sayi(t.kcal) + ' kcal</span><span>' + s.etiket + '</span></span>' +
        '<span class="olcer hap"><span data-oran="' + oran + '"></span></span>' +
        '<small>P ' + sayi(t.protein) + ' · K ' + sayi(t.karb) + ' · Y ' + sayi(t.yag) + ' g</small></div>';
    });
    kap.innerHTML = h;
    $$('[data-oran]', kap).forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
    $('#gunSecici').innerHTML = S.gunler.map((g, i) => '<button type="button" data-plan="gun-sec" data-g="' + i + '" aria-pressed="' + (i === secGun) + '">' + gunKisa(i) + '<small>' + sayi(PB.topla(gunKalemleri(g)).kcal) + '</small></button>').join('');
  }

  /* Hedef şeridi: seçili günün gerçek / hedef ölçüleri, makro payı hedef kaloriden */
  const makroHedef = () => PB.makroGram(S.hedef_kcal, S.makro);
  const makroToplam = () => S.makro.p + S.makro.k + S.makro.y;
  function makroCiz() {
    const h = makroHedef(), n = makroToplam(), not = $('#makroNot');
    not.innerHTML = n === 100 ? '<i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>Günlük hedef: P ' + sayi(h.protein) + ' g · K ' + sayi(h.karb) + ' g · Y ' + sayi(h.yag) + ' g</span>' :
      '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>Toplam %' + n + '. Yüzdeler %100 etmeli.</span>';
    $$('#makroHazir .cip').forEach((c) => c.classList.toggle('aktif', c.dataset.deger === [S.makro.p, S.makro.k, S.makro.y].join(',')));
  }
  const makroDoldur = () => { $('#makroP').value = S.makro.p; $('#makroK').value = S.makro.k; $('#makroY').value = S.makro.y; makroCiz(); };
  const haftaSerit = () => PB.gunSerit(S.gunler.map((g) => PB.sapma(PB.topla(gunKalemleri(g)).kcal, S.hedef_kcal).durum));
  function gunOzetCiz() {
    const t = PB.topla(gunKalemleri(S.gunler[secGun])), h = makroHedef(), s = PB.sapma(t.kcal, S.hedef_kcal);
    const olcu = (sinif, ad, v, hedef, birim) => '<div class="hedef-olcu ' + sinif + '"><span class="ust-satir">' + ad + '<b>' + sayi(v) + ' / ' + sayi(hedef) + ' ' + birim + '</b></span>' +
      '<span class="olcer"><span data-oran="' + (hedef ? Math.min(100, Math.round((v / hedef) * 100)) : 0) + '"></span></span></div>';
    const kap = $('#gunOzet');
    kap.innerHTML = '<div class="hedef-gun"><button class="plan-mini-dugme" type="button" data-plan="gun-sec" data-g="' + ((secGun + 6) % 7) + '" aria-label="Önceki gün"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>' +
      '<span>' + gunAd(secGun) + haftaSerit() + '</span>' +
      '<button class="plan-mini-dugme" type="button" data-plan="gun-sec" data-g="' + ((secGun + 1) % 7) + '" aria-label="Sonraki gün"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div>' +
      olcu('enerji ' + s.durum, 'Enerji', t.kcal, S.hedef_kcal, 'kcal') + olcu('protein', 'Protein', t.protein, h.protein, 'g') + olcu('karb', 'Karb.', t.karb, h.karb, 'g') + olcu('yag', 'Yağ', t.yag, h.yag, 'g');
    $$('[data-oran]', kap).forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
  }
  /* Analiz: gün tablosu düz ortalamayla; katkı listesi seçili kapsam ve besin öğesine göre sıralanır */
  const kapsamGunleri = () => (analizKapsam === 'hafta' ? [0, 1, 2, 3, 4, 5, 6] : analizKapsam === 'hafta-ici' ? gunGrubu(false) : analizKapsam === 'hafta-sonu' ? gunGrubu(true) : [+analizKapsam]);
  function analizCiz() {
    const satir = S.gunler.map((g, i) => ({ i, t: PB.topla(gunKalemleri(g)) }));
    const hucre = (t, ad) => {
      const s = PB.sapma(t.kcal, S.hedef_kcal);
      return '<td>' + ad + '</td><td class="num" data-etiket="kcal">' + sayi(t.kcal) + '</td><td data-etiket="Sapma"><span class="plan-toplam yalin ' + s.durum + '">' + s.etiket + '</span></td><td class="num" data-etiket="Protein">' + sayi(t.protein) + ' g</td><td class="num" data-etiket="Karb.">' + sayi(t.karb) + ' g</td><td class="num" data-etiket="Yağ">' + sayi(t.yag) + ' g</td><td class="num" data-etiket="Lif">' + sayi(t.lif) + ' g</td>';
    };
    $('#analizSatirlar').innerHTML = satir.map((r) => '<tr>' + hucre(r.t, '<button class="plan-gun-ac" type="button" data-plan="analiz-gun" data-g="' + r.i + '">' + gunAd(r.i) + '</button>') + '</tr>').join('');
    const ort = satir.reduce((a, r) => { ['kcal', 'protein', 'karb', 'yag', 'lif'].forEach((k) => { a[k] += r.t[k] / 7; }); return a; }, { kcal: 0, protein: 0, karb: 0, yag: 0, lif: 0 });
    $('#analizToplam').innerHTML = '<tr>' + hucre(ort, '<b>Hafta ortalaması</b>') + '</tr>';
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
    /* Kapsamın makro enerji payı hedef yüzdeyle yan yana, öğün payı halkada sayıyla */
    const kapsamT = PB.topla(gunler.flatMap((gi) => gunKalemleri(S.gunler[gi])));
    const enerji = kapsamT.protein * 4 + kapsamT.karb * 4 + kapsamT.yag * 9;
    $('#analizMakro').innerHTML = [['Protein', kapsamT.protein * 4, S.makro.p, 'protein'], ['Karbonhidrat', kapsamT.karb * 4, S.makro.k, 'karb'], ['Yağ', kapsamT.yag * 9, S.makro.y, 'yag']].map(([ad, v, h, c]) => {
      const pay = enerji ? Math.round((v / enerji) * 100) : 0;
      return '<div class="hedef-olcu ' + c + '"><span class="ust-satir">' + ad + '<b>%' + pay + ' / %' + h + '</b></span><span class="olcer"><span data-oran="' + pay + '"></span></span></div>';
    }).join('');
    const kcalKapsam = kapsamT.kcal;
    $('#analizOgun').innerHTML = acikOgunler().map((o) => {
      const v = PB.topla(gunler.flatMap((gi) => S.gunler[gi].ogunler[o.id])).kcal, pay = kcalKapsam ? Math.round((v / kcalKapsam) * 100) : 0;
      return '<span class="halka-kalem"><span class="halka kucuk" data-oran="' + pay + '"><span>%' + pay + '</span></span><b>' + esc(o.ad) + '</b>' + sayi(v / gunler.length) + ' kcal</span>';
    }).join('');
    $$('#analizKatki [data-oran],#analizMakro [data-oran],#analizOgun [data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
  }
  function gorunumSec(g) {
    gorunum = g;
    $('#planPano').hidden = g !== 'plan';
    $('#analizPano').hidden = g !== 'analiz';
    if (g === 'analiz') analizCiz();
  }

  /* ── Yan görünümler ────────────────────────────────────────────────── */
  function danisanCiz() {
    const d = danisan(), kap = $('#danisanOzet');
    if (!d) {
      kap.innerHTML = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-user-plus" aria-hidden="true"></i></span><h3>Danışan seçilmedi</h3><p>Danışan seçince hassasiyet ve tahlil kuralları plana uygulanır.</p><button class="dugme hayalet" type="button" data-plan="danisan-odak">Danışan seç</button></div>';
      return;
    }
    const has = (d.hassasiyetler || []).map((h) => '<span class="rozet bekleme">' + esc(PB.hassasiyetAd(h)) + '</span>').join(' ');
    const kr = (d.kronik || []).map((h) => '<span class="rozet pasif">' + esc(h) + '</span>').join(' ');
    const tah = PB.sonTahlil(d).filter((x) => PB.tahlilDurum(x));
    kap.innerHTML = '<div class="yigin sik">' +
      '<a class="kisi-hucre" href="' + DD.kok + 'diyetisyen-paneli/danisanlar/' + d.id + '/"><span class="kisi-avatar" aria-hidden="true">' + esc(PB.basHarf(d.ad)) + '</span><span class="kisi-bilgi"><span class="kisi-ad">' + esc(d.ad) + '</span><span class="kisi-alt">' + d.yas + ' yaş · ' + d.boy + ' cm · ' + sayi(d.kilo, 1) + ' kg → ' + sayi(d.hedef_kilo, 1) + ' kg</span></span></a>' +
      '<div class="deger-liste"><div class="deger-satir"><span>Hedef</span><b>' + esc(d.hedef) + '</b></div>' +
      '<div class="deger-satir"><span>Hassasiyet</span><span>' + (has || 'Kayıt yok') + '</span></div>' +
      (kr ? '<div class="deger-satir"><span>Kronik durum</span><span>' + kr + '</span></div>' : '') +
      (tah.length ? tah.map((x) => '<div class="deger-satir"><span>' + esc(x.ad) + '</span><b>' + sayi(x.sonuc, 1) + ' ' + esc(x.birim) + ' <span class="rozet durdu">' + (PB.tahlilDurum(x) === 'dusuk' ? 'Düşük' : 'Yüksek') + '</span></b></div>').join('') : '<div class="deger-satir"><span>Son tahlil</span><span>Referans dışı değer yok</span></div>') +
      '</div></div>';
  }
  /* Bütün plan için uyarıları toplar: hassasiyet çakışması, tahlil notu, sapma, boş gün */
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
    const tum = PB.topla(S.gunler.flatMap(gunKalemleri)), n = S.gunler.length;
    const mh = makroHedef(), makro = [['Protein', tum.protein / n, mh.protein], ['Karbonhidrat', tum.karb / n, mh.karb], ['Yağ', tum.yag / n, mh.yag]];
    $('#ozetGovde').innerHTML = '<div class="deger-satir"><span>Günlük ortalama</span><b>' + sayi(o.ort) + ' kcal</b></div>' +
      '<div class="deger-satir"><span>Hedef</span><b>' + sayi(S.hedef_kcal) + ' kcal</b></div>' +
      '<div class="deger-satir"><span>Hedefteki gün</span><b>' + o.hedefte + ' / ' + n + '</b></div>' +
      makro.map(([ad, v, h]) => '<div class="deger-satir"><span>' + ad + ' (günlük ort.)</span><b>' + sayi(v) + ' g <small>/ ' + sayi(h) + ' g</small></b></div><div class="olcer hap"><span data-oran="' + Math.min(100, Math.round((v / h) * 100 || 0)) + '"></span></div>').join('');
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
    $('#planBitis').value = PB.tarih(PB.gunEkle(S.baslangic, 6));
  }
  function ciz() { $('#planBos').hidden = dolu(); izgaraCiz(); gunOzetCiz(); uyariCiz(); ozetCiz(); baslikCiz(); if (gorunum === 'analiz') analizCiz(); }
  function formDoldur() {
    const sec = $('#planDanisan');
    sec.innerHTML = '<option value="">Danışan seç</option>' + PB.danisanlar().filter((d) => d.durum !== 'bitti' || d.id === S.danisan_id).map((d) => '<option value="' + d.id + '">' + esc(d.ad) + '</option>').join('');
    sec.value = S.danisan_id;
    makroDoldur();
    $('#planAd').value = S.ad; $('#planHedef').value = S.hedef_kcal; $('#planNot').value = S.danisana_not || ''; $('#planBaslangic').value = S.baslangic;
    danisanCiz();
  }

  /* ── Ekleme sheet'i ────────────────────────────────────────────────── */
  const OGUN_TARIF = { kahvalti: ['kahvalti', 'brunch'], ara1: ['ara-ogun', 'ikindi-ve-cay-saati', 'beslenme-cantasi'], ogle: ['ogle-yemegi'], ara2: ['ara-ogun', 'ikindi-ve-cay-saati', 'beslenme-cantasi'], aksam: ['aksam-yemegi'] };
  const uygun = (t) => hedefHucre && (t.ogunler || []).some((x) => OGUN_TARIF[hedefHucre.o].includes(x));
  function kaynakListe() {
    const q = PB.kucuk(arama);
    let l = kaynak === 'tarif' ? PB.tarifler.slice() : PB.besinSec();
    if (mikroSuzgec) l = mikroSuzgec.liste.map((s) => l.find((b) => b.slug === s)).filter(Boolean);
    if (kategori === 'Bu öğüne uygun') l = l.filter(uygun); else if (kategori !== 'Tümü') l = l.filter((x) => x.kategori === kategori);
    if (q) l = l.filter((x) => PB.kucuk(x.ad).includes(q));
    if (kaynak === 'tarif') l = l.sort((a, b) => (uygun(b) ? 1 : 0) - (uygun(a) ? 1 : 0));
    return l;
  }
  function kategoriCiz() {
    const l = kaynak === 'tarif' ? PB.tarifler : PB.besinSec();
    const adlar = ['Tümü', ...(kaynak === 'tarif' ? ['Bu öğüne uygun'] : []), ...new Set(l.map((x) => x.kategori))];
    $('#sheetKategori').innerHTML = adlar.map((a) => '<button class="cip' + (a === kategori ? ' aktif' : '') + '" type="button" data-deger="' + esc(a) + '">' + esc(a) + '</button>').join('');
  }
  const satirMeta = (tur, c, miktar) => {
    const d = PB.kalemDeger({ tur, slug: c.slug, miktar });
    return (tur === 'besin' && c.porsiyon ? esc(c.porsiyon.ad) + ' = ' + sayi(c.porsiyon.gram) + ' g · ' : '') + sayi(d.kcal) + ' kcal · P ' + sayi(d.protein) + ' · K ' + sayi(d.karb) + ' · Y ' + sayi(d.yag) + ' g';
  };
  function listeCiz() {
    const l = kaynakListe(), tur = kaynak, dn = danisan();
    $('#sheetBos').hidden = l.length > 0;
    $('#sheetListe').innerHTML = l.map((c) => {
      const m = PB.varsayilanMiktar(tur, c.slug), uy = PB.kalemUyari(tur, c.slug, dn), g = PB.gorsel(tur, c.slug);
      return '<div class="secim-satir" data-slug="' + c.slug + '">' +
        '<span class="secim-gorsel">' + (g ? '<img src="' + g + '" alt="" loading="lazy">' : '<i class="fa-solid ' + (tur === 'tarif' ? 'fa-bowl-food' : PB.besinIkon(c)) + '" aria-hidden="true"></i>') + '</span>' +
        '<span class="secim-metin"><b>' + esc(c.ad) + '</b><small data-rol="meta">' + satirMeta(tur, c, m) + '</small>' +
        (uy.length ? '<span class="secim-etiketler">' + uy.map((h) => '<span class="rozet bekleme"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> ' + esc(PB.hassasiyetAd(h)) + '</span>').join('') + '</span>' : '') + '</span>' +
        '<span class="adet"><button type="button" data-yon="azalt" aria-label="Azalt"><i class="fa-solid fa-minus" aria-hidden="true"></i></button><input type="number" min="' + PB.adim(tur) + '" step="' + PB.adim(tur) + '" value="' + m + '" aria-label="' + esc(c.ad) + ' miktarı, ' + (tur === 'tarif' ? 'porsiyon' : 'gram') + '"><button type="button" data-yon="artir" aria-label="Artır"><i class="fa-solid fa-plus" aria-hidden="true"></i></button></span>' +
        '<button class="dugme hayalet kucuk" type="button" data-plan="ekle" data-slug="' + c.slug + '">Ekle</button></div>';
    }).join('');
  }
  function sheetOzet() {
    if (!hedefHucre) return;
    const l = S.gunler[hedefHucre.g].ogunler[hedefHucre.o], t = PB.topla(gunKalemleri(S.gunler[hedefHucre.g])), h = makroHedef(), kap = $('#sheetOzet');
    kap.className = 'not ' + PB.sapma(t.kcal, S.hedef_kcal).durum;
    kap.innerHTML = (l.length ? 'Öğün ' + sayi(PB.topla(l).kcal) + ' kcal · ' : '') + 'Gün <b>' + sayi(t.kcal) + ' / ' + sayi(S.hedef_kcal) + ' kcal</b> · P ' + sayi(t.protein) + '/' + sayi(h.protein) + ' · K ' + sayi(t.karb) + '/' + sayi(h.karb) + ' · Y ' + sayi(t.yag) + '/' + sayi(h.yag) + ' g';
  }
  function sheetAc(g, o, mikro) {
    hedefHucre = { g, o };
    if (secGun !== g) { secGun = g; izgaraCiz(); gunOzetCiz(); }
    mikroSuzgec = mikro || null;
    const og = S.ogun_duzeni.find((x) => x.id === o);
    $('#sheetBaslik').textContent = altHedef ? 'Alternatif seç · ' + PB.kalemCumle(S.gunler[altHedef.g].ogunler[altHedef.o][altHedef.k]) : gunAd(g) + ' · ' + og.ad + ' · ' + og.saat + (mikro ? ' · ' + mikro.ad : '');
    arama = ''; $('#sheetAra').value = ''; kategori = 'Tümü';
    kaynakSec(mikro ? 'besin' : kaynak === 'serbest' ? 'tarif' : kaynak);
    sheetOzet();
    DD.ac('#eklemeSheet');
  }
  function kaynakSec(k) {
    kaynak = k;
    $$('#eklemeSheet [role=tab]').forEach((t) => { const b = t.dataset.kaynak === k; t.classList.toggle('aktif', b); t.setAttribute('aria-selected', b); t.tabIndex = b ? 0 : -1; });
    $('#serbestAlan').hidden = k !== 'serbest';
    $('#katalogAlan').hidden = k === 'serbest';
    if (k === 'serbest') return;
    $('#sheetAra').placeholder = k === 'tarif' ? 'Tarif ara, örn. çorba' : 'Besin ara, örn. mercimek';
    kategoriCiz(); listeCiz();
  }

  /* ── Kalem penceresi ───────────────────────────────────────────────── */
  function kalemCiz() {
    const { g, o, k: ki } = acikKalem, k = S.gunler[g].ogunler[o][ki], serbest = k.tur === 'serbest', c = serbest ? null : PB.katalog(k), d = PB.kalemDeger(k), uy = PB.kalemUyariK(k, danisan());
    $('#kalemBaslik').textContent = PB.kalemAd(k);
    const notlar = uy.map((h) => '<div class="uyari-kutu uyari"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span><b>' + esc(PB.hassasiyetAd(h)) + '.</b> ' + esc((c && c.alerjen_notu) || 'Bu kalem danışanın hassasiyetiyle eşleşiyor.') + '</span></div>').join('');
    const gorsel = serbest ? '' : PB.gorsel(k.tur, k.slug), sirala = '<div class="eylem-satiri"><button class="dugme hayalet kucuk" type="button" data-plan="kalem-tasi" data-yon="-1"' + (ki ? '' : ' disabled') + '><i class="fa-solid fa-arrow-up" aria-hidden="true"></i> Yukarı</button><button class="dugme hayalet kucuk" type="button" data-plan="kalem-tasi" data-yon="1"' + (ki < S.gunler[g].ogunler[o].length - 1 ? '' : ' disabled') + '><i class="fa-solid fa-arrow-down" aria-hidden="true"></i> Aşağı</button></div>';
    if (serbest && !$('#kalemSerbest')) {
      const alan = (ad, et, tip) => '<div class="alan"><label class="alan-etiket" for="ks' + ad + '">' + et + '</label><input class="alan-girdi" id="ks' + ad + '" type="' + tip + '" min="0" data-serbest="' + ad + '" value="' + esc(k[ad]) + '"></div>';
      $('#kalemGovde').innerHTML = '<div id="kalemSerbest"><div class="alan-izgara c2">' + alan('ad', 'Kalem adı', 'text') + alan('olcu', 'Ölçü', 'text') + alan('kcal', 'Enerji (kcal)', 'number') + alan('protein', 'Protein (g)', 'number') + alan('karb', 'Karbonhidrat (g)', 'number') + alan('yag', 'Yağ (g)', 'number') + '</div></div><div id="kalemSira"></div><div id="kalemAlt"></div><div id="kalemNot"></div>';
    } else if (!serbest && !$('#kalemMiktar')) {
      $('#kalemGovde').innerHTML = (gorsel ? '<span class="gorsel-bant kisa"><img src="' + gorsel + '" alt=""></span>' : '') + '<div class="alan"><label class="alan-etiket" for="kalemMiktar">Miktar <span class="istege-bagli">' + (k.tur === 'tarif' ? 'porsiyon' : 'gram') + '</span></label>' +
        '<span class="adet"><button type="button" data-yon="azalt" aria-label="Azalt"><i class="fa-solid fa-minus" aria-hidden="true"></i></button><input id="kalemMiktar" type="number" min="' + PB.adim(k.tur) + '" step="' + PB.adim(k.tur) + '" value="' + k.miktar + '"><button type="button" data-yon="artir" aria-label="Artır"><i class="fa-solid fa-plus" aria-hidden="true"></i></button></span>' +
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
    if (secGun !== g) { secGun = g; izgaraCiz(); gunOzetCiz(); }
    $('#kalemGovde').innerHTML = '';
    kalemCiz();
    DD.ac('#kalemModal');
  }

  /* ── Kopyalama, şablon, öğün düzeni ────────────────────────────────── */
  /* Kaynak bu plan, kayıtlı başka plan ya da şablon olabilir; gün seçimi ve hızlı seçimler aynı modalde */
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
  const kopyaTuru = () => $('#kopyaTur [aria-pressed=true]').dataset.deger;
  function kopyaTurSec(t) {
    $$('#kopyaTur button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === t)));
    $('#kopyaOgunAlan').hidden = t !== 'ogun';
    $('#kopyaBaslik').textContent = t === 'ogun' ? 'Öğünü kopyala' : 'Günü kopyala';
    kopyaHedefCiz();
  }
  function kopyaAc(g, o) {
    const secenek = acikOgunler().map((x) => '<option value="' + x.id + '">' + esc(x.ad) + ' · ' + esc(x.saat) + '</option>').join('');
    $('#kopyaOgunKaynak').innerHTML = secenek; $('#kopyaOgunHedef').innerHTML = secenek;
    if (o) { $('#kopyaOgunKaynak').value = o; $('#kopyaOgunHedef').value = o; }
    $('#kopyaPlan').innerHTML = '<option value="">Bu plan</option>' + kaynakPlanlar().map((p) => '<option value="' + esc(p.id) + '">' + esc(p.ad) + '</option>').join('');
    kopyaKaynakCiz(g == null ? secGun : g);
    kopyaTurSec(o ? 'ogun' : 'gun');
    DD.ac('#kopyaModal');
  }
  function kopyaHedefCiz() {
    const k = +$('#kopyaKaynak').value, buPlan = !$('#kopyaPlan').value;
    const ayniOgun = kopyaTuru() === 'gun' || $('#kopyaOgunKaynak').value === $('#kopyaOgunHedef').value;
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
    const k = +$('#kopyaKaynak').value, kip = $('#kopyaKip [aria-pressed=true]').dataset.deger, kaynakGun = kopyaGunleri()[k], ogunKipi = kopyaTuru() === 'ogun';
    const hedefler = $$('#kopyaHedef .cip.aktif').map((b) => +b.dataset.deger);
    if (!hedefler.length) { DD.toast('En az bir hedef gün seç.', 'uyari'); return; }
    const ko = $('#kopyaOgunKaynak').value, ho = $('#kopyaOgunHedef').value;
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
  function sablonCiz() {
    $('#sablonListe').innerHTML = PB.liste('sablonlar').map((s) =>
      '<button class="secenek" type="button" data-plan="sablon-sec" data-id="' + esc(s.id) + '">' + (PB.sablonGorsel(s) ? '<img src="' + PB.sablonGorsel(s) + '" alt="" loading="lazy">' : '<i class="fa-solid fa-layer-group" aria-hidden="true"></i>') + '<span>' + esc(s.ad) + ' · ' + sayi(s.kcal) + ' kcal<small>' + esc(s.aciklama || '') + '</small></span></button>').join('');
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
  const dolu = () => S.gunler.some((g) => Object.values(g.ogunler).some((l) => l.length));
  function sablonKaydet() {
    if (!dolu()) { DD.toast('Şablon için plana en az bir kalem ekle.', 'uyari'); return; }
    const ad = S.ad || 'Kendi şablonum', o = planYaz();
    PB.liste('sablonlar').push({ id: PB.yeniId('s'), ad, kcal: S.hedef_kcal, aciklama: 'Kendi şablonun · ' + PB.tarih(DD.bugun), ortalama: o.ortalama, gunler: o.gunler, ogun_duzeni: kopya(S.ogun_duzeni), makro: kopya(S.makro), ozel: true });
    PB.kaydet();
    DD.toast('“' + ad + '” şablonlara eklendi.');
  }
  function ogunCiz() {
    $('#ogunListe').innerHTML = S.ogun_duzeni.map((o, i) =>
      '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + o.ikon + '" aria-hidden="true"></i></span><span class="as-metin"><b>' + esc(o.ad) + '</b></span>' +
      '<span class="as-eylem"><input class="alan-girdi" type="time" value="' + esc(o.saat) + '" data-ogun-saat="' + i + '" aria-label="' + esc(o.ad) + ' saati">' +
      '<label class="anahtar"><input type="checkbox" data-ogun-acik="' + i + '"' + (o.acik ? ' checked' : '') + ' aria-label="' + esc(o.ad) + ' açık"><span class="anahtar-ray"></span></label></span></div>').join('');
  }

  /* ── Kayıt ve gönderim ─────────────────────────────────────────────── */
  function planYaz() {
    const gunler = S.gunler.map((g) => {
      const ogunler = {};
      S.ogun_duzeni.forEach((o) => {
        if (!o.acik) return;
        ogunler[o.id] = g.ogunler[o.id].map((k) => {
          const d = PB.kalemDeger(k), r = (v) => Math.round(v * 10) / 10;
          return Object.assign(kalemSade(k), { kcal: r(d.kcal), protein: r(d.protein), yag: r(d.yag), karb: r(d.karb) });
        });
      });
      const t = PB.topla(Object.values(ogunler).flat()), s = PB.sapma(t.kcal, S.hedef_kcal), r = (v) => Math.round(v * 10) / 10;
      return { gun: g.gun, ad: gunAd(g.gun - 1), ogunler, toplam: { kcal: r(t.kcal), protein: r(t.protein), yag: r(t.yag), karb: r(t.karb) }, sapma_yuzde: Math.round(s.oran * 1000) / 10, durum: s.durum || 'sapma' };
    });
    const n = gunler.length, top = (a) => Math.round((gunler.reduce((x, g) => x + g.toplam[a], 0) / n) * 10) / 10;
    return { id: S.id, danisan_id: S.danisan_id, ad: S.ad, hedef_kcal: S.hedef_kcal, durum: S.durum, danisana_not: S.danisana_not, makro: kopya(S.makro), tarih: S.tarih || DD.bugun, baslangic: S.baslangic, ortalama: { kcal: top('kcal'), protein: top('protein'), yag: top('yag'), karb: top('karb') }, gunler, ogun_duzeni: kopya(S.ogun_duzeni), guncelleme: S.guncelleme, surum: S.surum, gonderim: S.gonderim, sablon_id: S.sablon_id };
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
    if (makroToplam() !== 100) { DD.toast('Makro yüzdeleri %100 etmeli.', 'hata'); $('#makroP').focus(); return false; }
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
    PB.kaydet();
    DD.kapat($('#gonderModal'));
    DD.toast(danisan().ad + ' planı Beslenme Planım ekranında görecek.');
  }

  /* ── Olaylar ───────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    const c = e.target.closest('[data-plan]');
    const secilen = e.target.closest('#kopyaHedef .cip');
    if (secilen) { secilen.classList.toggle('aktif'); secilen.setAttribute('aria-pressed', secilen.classList.contains('aktif')); kopyaOnayCiz(); return; }
    const hizli = e.target.closest('#kopyaHizli .cip');
    if (hizli) { kopyaHizli(hizli.dataset.deger); return; }
    const makroCip = e.target.closest('#makroHazir .cip');
    if (makroCip) { const [p, k, y] = makroCip.dataset.deger.split(',').map(Number); S.makro = { p, k, y }; makroDoldur(); degisti(); return; }
    const kay = e.target.closest('#eklemeSheet [data-kaynak]');
    if (kay) { mikroSuzgec = null; kategori = 'Tümü'; kaynakSec(kay.dataset.kaynak); return; }
    if (!c) return;
    const g = +c.dataset.g, o = c.dataset.o, k = +c.dataset.k;
    switch (c.dataset.plan) {
      case 'ekle-ac': sheetAc(g, o); break;
      case 'danisan-odak': $('#planDanisan').focus(); break;
      case 'serbest-gec': kaynakSec('serbest'); $('#sbAd').value = arama; $('#sbAd').focus(); break;
      case 'serbest-ekle': {
        const ad = $('#sbAd').value.trim(), kcal = parseFloat($('#sbKcal').value), sayiOku = (s) => parseFloat($(s).value) || 0;
        if (!ad) { DD.toast('Kalem adı zorunlu.', 'hata'); $('#sbAd').focus(); return; }
        if (!(kcal >= 0)) { DD.toast('Enerji değeri zorunlu.', 'hata'); $('#sbKcal').focus(); return; }
        const y = { tur: 'serbest', ad, olcu: $('#sbOlcu').value.trim() || '1 porsiyon', miktar: 1, kcal, protein: sayiOku('#sbP'), karb: sayiOku('#sbK'), yag: sayiOku('#sbY') };
        ['#sbAd', '#sbOlcu', '#sbKcal', '#sbP', '#sbK', '#sbY'].forEach((s) => { $(s).value = ''; });
        if (altHedef) {
          const a = altHedef; altHedef = null;
          S.gunler[a.g].ogunler[a.o][a.k].alternatif = y;
          DD.kapat($('#eklemeSheet')); degisti(); kalemAc(a.g, a.o, a.k);
          return;
        }
        S.gunler[hedefHucre.g].ogunler[hedefHucre.o].push(y);
        degisti(); sheetOzet();
        const uy = PB.kalemUyariK(y, danisan());
        DD.toast(uy.length ? PB.hassasiyetAd(uy[0]) + ': kalem eklendi, uyarı listesine düştü.' : 'Serbest kalem eklendi.', uy.length ? 'uyari' : undefined);
        $('#sbAd').focus();
        break;
      }
      case 'kalem-tasi': {
        const a = acikKalem, l = S.gunler[a.g].ogunler[a.o], yeni = a.k + +c.dataset.yon;
        [l[a.k], l[yeni]] = [l[yeni], l[a.k]]; a.k = yeni; degisti(); kalemCiz();
        break;
      }
      case 'mikro-ac': {
        const hc = hedefHucre || { g: dar.matches ? secGun : 0, o: 'ogle' };
        sheetAc(hc.g, hc.o, { ad: c.dataset.ad, liste: PB.mikroKaynaklari(c.dataset.mikro) });
        break;
      }
      case 'ekle': {
        const satir = c.closest('.secim-satir'), m = parseFloat(satir.querySelector('input').value);
        if (!(m > 0)) { DD.toast('Miktar sıfırdan büyük olmalı.', 'uyari'); return; }
        if (altHedef) {
          const a = altHedef; altHedef = null;
          S.gunler[a.g].ogunler[a.o][a.k].alternatif = { tur: kaynak, slug: c.dataset.slug, miktar: m };
          DD.kapat($('#eklemeSheet')); degisti(); kalemAc(a.g, a.o, a.k);
          return;
        }
        S.gunler[hedefHucre.g].ogunler[hedefHucre.o].push({ tur: kaynak, slug: c.dataset.slug, miktar: m });
        degisti(); sheetOzet();
        const uy = PB.kalemUyari(kaynak, c.dataset.slug, danisan());
        if (uy.length) DD.toast(PB.hassasiyetAd(uy[0]) + ': kalem eklendi, uyarı listesine düştü.', 'uyari');
        c.textContent = 'Eklendi'; setTimeout(() => { if (c.isConnected) c.textContent = 'Ekle'; }, 1200);
        break;
      }
      case 'kalem-ac': kalemAc(g, o, k); break;
      case 'alt-ac': altHedef = acikKalem; DD.kapat($('#kalemModal')); sheetAc(altHedef.g, altHedef.o); break;
      case 'alt-sil': delete S.gunler[acikKalem.g].ogunler[acikKalem.o][acikKalem.k].alternatif; degisti(); kalemCiz(); break;
      case 'analiz-gun': analizKapsam = String(g); analizCiz(); break;
      case 'kalem-cikar': S.gunler[g].ogunler[o].splice(k, 1); degisti(); break;
      case 'kalem-sil': {
        const a = acikKalem; S.gunler[a.g].ogunler[a.o].splice(a.k, 1);
        DD.kapat($('#kalemModal')); degisti(); break;
      }
      case 'gun-sec': secGun = g; izgaraCiz(); gunOzetCiz(); break;
      case 'kopyala-ac': kopyaAc(Number.isNaN(g) ? null : g, o); break;
      case 'kopyala': kopyala(); break;
      case 'ogun-ac': ogunCiz(); DD.ac('#ogunModal'); break;
      case 'sablon-ac': sablonCiz(); DD.ac('#sablonModal'); break;
      case 'sablon-sec': {
        const s = PB.liste('sablonlar').find((x) => x.id === c.dataset.id);
        const uygula = () => { sablonUygula(s); DD.kapat($('#sablonModal')); formDoldur(); ciz(); DD.toast('“' + s.ad + '” şablonu ızgaraya uygulandı.'); };
        if (dolu()) window.DM_ONAY('Şablon uygulansın mı?', 'Izgaradaki kalemler “' + s.ad + '” şablonuyla değişir.', 'Uygula', (ok) => { if (ok) uygula(); });
        else uygula();
        break;
      }
      case 'sablon-kaydet': sablonKaydet(); break;
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
  document.addEventListener('dd:secim', function (e) {
    if (e.target.id === 'planGorunum') gorunumSec(e.detail.deger);
    if (e.target.id === 'kopyaTur') kopyaTurSec(e.detail.deger);
    if (e.target.id === 'analizOge') { analizOge = e.detail.deger; analizCiz(); }
  });
  /* Sheet alternatif seçilmeden kapanırsa sonraki açılış normal ekleme olur */
  new MutationObserver(() => { if ($('#eklemeSheet').hidden) altHedef = null; }).observe($('#eklemeSheet'), { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('dd:suzgec', function (e) { if (e.target.id === 'sheetKategori') { kategori = e.detail.deger; listeCiz(); } });
  document.addEventListener('input', function (e) {
    const t = e.target;
    if (t.id === 'sheetAra') { arama = t.value.trim(); listeCiz(); return; }
    if (t.id === 'kalemMiktar') {
      const v = parseFloat(t.value);
      if (v > 0) { const a = acikKalem; S.gunler[a.g].ogunler[a.o][a.k].miktar = v; degisti(); kalemCiz(); }
      return;
    }
    const satir = t.closest && t.closest('.secim-satir');
    if (satir && t.type === 'number') {
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
    if (t.dataset.ogunAcik != null) { S.ogun_duzeni[+t.dataset.ogunAcik].acik = t.checked; degisti(); }
    if (t.id === 'gonderOnayKutu') $('#gonderOnay').disabled = !t.checked;
  });
  /* Kalemi hücreler arasında sürükle: taşır, Alt basılıysa kopyalar */
  let suruk = null;
  const izgara = $('#planIzgara');
  izgara.addEventListener('dragstart', (e) => {
    const k = e.target.closest('.plan-kalem');
    if (!k) return;
    suruk = { g: +k.dataset.g, o: k.dataset.o, k: +k.dataset.k };
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', k.textContent);
  });
  izgara.addEventListener('dragover', (e) => {
    const h = e.target.closest('.plan-hucre');
    if (!h || !suruk) return;
    e.preventDefault();
    $$('.surukle-hedef', izgara).forEach((x) => x.classList.remove('surukle-hedef'));
    h.classList.add('surukle-hedef');
  });
  izgara.addEventListener('dragend', () => { suruk = null; $$('.surukle-hedef', izgara).forEach((x) => x.classList.remove('surukle-hedef')); });
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
  dar.addEventListener('change', () => izgaraCiz());
  window.addEventListener('beforeprint', () => izgaraCiz(true));
  window.addEventListener('afterprint', () => izgaraCiz());
  window.addEventListener('beforeunload', (e) => { if (kirli) e.preventDefault(); });

  yukle();
  formDoldur();
  ciz();
  if (PB.parametre('yazdir')) setTimeout(() => window.print(), 300);
})();
