/* Günlük Takibim: öğün işaretleri Beslenme Planım ile ortak; su ve adım demo.uye alanına yazar */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU, TU = DD.tercihUyum;
  TU.uyeBagla(U);
  const $ = (s) => document.querySelector(s);
  const u = U.uye(), dn = U.danisan(), b = U.bugun(), t = u.tercihler || {}, duyarli = U.yemeDuyarli();
  const k = U.aktifKaynak();
  const ekler = () => { const e = U.yerel('gunlukEk', {}); e[b] = e[b] || []; return e[b]; };
  const ogunler = () => U.secilenOgunler(k, b);
  const ogunAd = (a) => (U.ogunTanimi.find((o) => o[0] === a) || [])[1] || a;
  const dun = U.gunEkle(b, -1);
  const gunEk = (t) => (U.yerel('gunlukEk', {})[t]) || [];
  /* Kalemin nereden geldiği: Akıllı Tabak (dk-public yazar, kaynak 'akilli-tabak'), Dada Gastro "Pişirdim" (örnek kayıt), hızlı ekleme, dünden ya da favoriden kopya */
  const KAYNAK = { 'akilli-tabak': ['Akıllı Tabak', 'fa-plate-wheat'], gastro: ['Dada Gastro · Pişirdim', 'fa-kitchen-set'], hizli: ['Hızlı ekleme', 'fa-bolt'], dun: ['Dünden kopyalandı', 'fa-copy'], favori: ['Favori öğünden', 'fa-star'] };
  /* Başlangıç verisindeki örnek kalemler (id'li) önceki tarayıcı durumuna bir kez katılır; aynı id iki kez yazılmaz */
  (function tohum() {
    if (U.bosKip) return;
    const ilk = ((((window.DD_VERI || {}).demo || {}).uyeYerel || {}).gunlukEk) || {}, e = U.yerel('gunlukEk', {}), bayrak = U.yerel('gunlukEkTohum', {});
    let degisti = false;
    Object.keys(ilk).forEach((t) => ilk[t].forEach((x) => {
      if (!x.id || bayrak[x.id]) return;
      bayrak[x.id] = true; degisti = true;
      e[t] = e[t] || [];
      if (!e[t].some((y) => y.id === x.id)) e[t].push(JSON.parse(JSON.stringify(x)));
    }));
    if (degisti) DD.demo.kaydet();
  })();

  const toplam = () => U.gunToplam();
  const kcalMetin = (v) => (duyarli ? '' : DD.bicim.kcal(v));
  /* Su: bardak ölçüsü kayıttan gelir; Geri al bugünkü son eklemeyi söker */
  const bardakMl = () => u.su.bardak_ml || 200;
  const suHedefMetin = () => U.sayi(u.su.hedef_ml) + ' ml · ' + U.sayi(Math.ceil(u.su.hedef_ml / bardakMl())) + ' bardak';
  const suEkler = () => { const e = U.yerel('suEk', {}); e[b] = e[b] || []; return e[b]; };
  const gunSu = (x) => (x.tarih === b ? u.su.bugun_ml : x.ml);
  /* Bardak dizisi mobildeki su kartının kuralları: hedef kadar bardak, kısmi bardak kısmi dolar, sıradaki + taşır, hedef aşılınca bardak eklenir */
  const suBardak = (ml) => Math.ceil(ml / bardakMl());
  const suSiradaki = (ml) => Math.floor(ml / bardakMl());
  const suKalan = (s) => (s.bugun_ml >= s.hedef_ml ? 'Hedefe ulaştın' : U.sayi(suBardak(s.hedef_ml - s.bugun_ml)) + ' bardak kaldı');
  /* Dolu bardak bir bardak geri alır: bugünkü eklemeler sondan düşülür */
  function suCikar() {
    const l = suEkler();
    for (let kalan = bardakMl(); kalan > 0 && l.length;) {
      const son = l.length - 1;
      if (l[son] <= kalan) kalan -= l.pop(); else { l[son] -= kalan; kalan = 0; }
    }
    u.su.bugun_ml = Math.max(0, u.su.bugun_ml - bardakMl());
  }
  /* Bardaklar yerinde güncellenir ki dolum geçişi yalnız değişen bardakta oynasın */
  function bardakCiz() {
    const s = u.su, kap = $('#gtSuBardaklar'), sira = suSiradaki(s.bugun_ml), n = Math.max(suBardak(s.hedef_ml), sira + 1);
    kap.setAttribute('aria-label', U.sayi(suBardak(s.hedef_ml)) + ' bardaklık hedef');
    while (kap.children.length > n) kap.lastElementChild.remove();
    while (kap.children.length < n) kap.insertAdjacentHTML('beforeend', '<button class="su-bardak" type="button"><span class="su-bardak-ic"><i></i></span><span class="su-bardak-arti" aria-hidden="true"><i class="fa-solid fa-plus"></i></span></button>');
    Array.from(kap.children).forEach((d, i) => {
      const oran = Math.min(1, Math.max(0, (s.bugun_ml - i * bardakMl()) / bardakMl())), dolu = oran >= 1;
      d.style.setProperty('--oran', oran.toFixed(3));
      d.style.setProperty('--i', i);
      d.classList.toggle('siradaki', i === sira);
      d.dataset.su = dolu ? 'cikar' : 'bardak';
      d.setAttribute('aria-label', '1 su bardağı ' + (dolu ? 'geri al' : 'ekle'));
    });
  }

  function ogunCiz() {
    U.bas('#gtBas', '<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> ' + U.kisaTarih(b) + ' ' + U.gunAdi(b) + '</span><h2>Bugün Ne Yedin</h2><p class="giris-metni">Plandan farklı yediysen artıya basıp besin ekle.</p><div class="bolum-araclar"><a class="dugme hayalet" href="' + DD.kok + 'besin-kutuphanesi/">Besin kütüphanesinde ara</a></div></div></div>');
    if (!k) { U.bas('#gtOgunler', U.bos({ ikon: 'fa-utensils', baslik: 'Bugün için planın yok', metin: 'Program seçtiğinde öğünlerin burada açılır; besinlerini yine de ekleyebilirsin.', eylem: '<a class="dugme birincil" href="' + DD.kok + 'programlar/program-bul/">Program bul</a><button class="dugme hayalet" type="button" data-besin-ekle="kahvalti">Besin ekle</button>' })); $('#gtOzet').textContent = ekler().length + ' kalem kayıtlı.'; $('#gtKcal').textContent = kcalMetin(toplam().kcal); $('#gtPaylas').hidden = true; return; }
    const i = U.isaret(k, b), e = ekler();
    U.bas('#gtTercih', k.tip === 'plan' ? TU.planUyariHtml(U, k.plan) : TU.bilgiHtml(TU.ogunOzeti(ogunler())));
    if (!ogunler().length) U.bas('#gtOgunler', U.bugunBos(k));
    else U.bas('#gtOgunler', ogunler().map((o) => {
      const ek = e.filter((x) => x.ogun === o.anahtar);
      const ekMetin = ek.length ? ' Eklediğin: ' + ek.map((x) => U.kalemMetin(x)).join(', ') + '.' : '';
      const durum = U.ogunDurum(i, o);
      const satir = DD.ogunFoto.satir(U.ogunSatir({ ...o, metin: 'Planlanan: ' + o.metin + '.' + ekMetin }, durum), o, durum);
      return satir.replace('<div class="segment"', '<button class="dugme hayalet kucuk" type="button" data-besin-ekle="' + o.anahtar + '" aria-label="' + U.kac(o.ad) + ' için besin ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i></button><div class="segment"');
    }).join(''));
    const tm = toplam();
    $('#gtOzet').textContent = ogunler().filter((o) => i[o.anahtar]).length + ' / ' + ogunler().length + ' öğün tamamlandı, ' + e.length + ' ek kalem kayıtlı.';
    $('#gtKcal').textContent = kcalMetin(tm.kcal);
    /* Paylaşım izne bağlı: nedeni ekranda yazar */
    const izin = !!(dn.izinler && dn.izinler.gunluk) && !!U.diyetisyen();
    $('#gtPaylas').disabled = !izin;
    $('#gtPaylasNot').innerHTML = izin ? '' : 'Paylaşmak için <a href="' + DD.kok + 'hesabim/veri-izinlerim/">günlük takip iznini</a> aç.';
  }

  const olcer = (oran, etiket) => '<div class="olcer hap" role="img" aria-label="' + etiket + ': yüzde ' + oran + '"><span data-oran="' + Math.min(100, oran) + '"></span></div>';
  const kisaGun = (x) => U.gunAdi(x).slice(0, 3);

  function suCiz() {
    const s = u.su;
    $('#gtSuDeger').textContent = U.sayi(s.bugun_ml);
    $('#gtSuOlcu').textContent = '/ ' + suHedefMetin();
    $('#gtSuKalan').textContent = suKalan(s);
    $('#gtSuHedef').textContent = suHedefMetin();
    $('#gtSuBardak').textContent = '1 su bardağı (' + U.sayi(bardakMl()) + ' ml)';
    $('#gtSuGeri').disabled = !suEkler().length;
    bardakCiz();
    hatirlatCiz();
    if (s.hafta.length) DD.grafik.cizgi($('#gtSuGrafik'), { baslik: 'Son yedi günün su alımı', etiketler: s.hafta.map((x) => kisaGun(x.tarih)), seriler: [{ ad: 'Su', degerler: s.hafta.map(gunSu) }], hedef: s.hedef_ml });
  }
  /* Su hatırlatması: uye.su.hatirlatma, Tercihlerim ile aynı kayıt. Kapalıyken sessiz saatler pasif */
  const hatirlatma = () => { u.su.hatirlatma = u.su.hatirlatma || { acik: false, sessiz_bas: '23:00', sessiz_bit: '08:00' }; return u.su.hatirlatma; };
  const saat = (x) => Number(x.slice(0, 2));
  /* Saat sessiz aralıkta mı: aralık gece yarısını geçebilir (23–08) */
  const sessizde = (s, h) => { const a = saat(h.sessiz_bas), z = saat(h.sessiz_bit); return a < z ? s >= a && s < z : s >= a || s < z; };
  function siradaki(h) {
    for (let s = new Date().getHours() + 1, n = 0; n < 24; s++, n++) if (!sessizde(s % 24, h)) return (n + new Date().getHours() + 1 >= 24 ? 'yarın ' : '') + String(s % 24).padStart(2, '0') + '.00';
    return null;
  }
  function hatirlatCiz() {
    const h = hatirlatma(), bas = $('#gtSessizBas'), bit = $('#gtSessizBit');
    $('#gtHatirlatma').checked = h.acik;
    bas.value = h.sessiz_bas; bit.value = h.sessiz_bit;
    bas.disabled = bit.disabled = !h.acik;
    const aralik = DD.bicim.saat(h.sessiz_bas) + '–' + DD.bicim.saat(h.sessiz_bit) + ' arası sessiz';
    const sonraki = u.su.bugun_ml >= u.su.hedef_ml ? 'bugünkü hedefine ulaştın, yarın yeniden başlar' : 'sıradaki ' + siradaki(h);
    $('#gtHatirlatMetin').textContent = h.acik ? 'Açık; ' + aralik + ', ' + sonraki + '.' : 'Kapalı. Açınca ' + aralik + ' kalır.';
  }
  $('#gtHatirlatma').addEventListener('change', (e) => {
    hatirlatma().acik = e.target.checked; U.kaydet(); hatirlatCiz();
    DD.toast(e.target.checked ? 'Su hatırlatması açıldı. Prototipte bildirim gönderilmez.' : 'Su hatırlatması kapatıldı.');
  });
  [['#gtSessizBas', 'sessiz_bas'], ['#gtSessizBit', 'sessiz_bit']].forEach(([id, alan]) => $(id).addEventListener('change', (e) => {
    const h = hatirlatma();
    if (e.target.value === h[alan === 'sessiz_bas' ? 'sessiz_bit' : 'sessiz_bas']) { hatirlatCiz(); DD.toast('Başlangıç ve bitiş saati aynı olamaz.', 'hata'); return; }
    h[alan] = e.target.value; U.kaydet(); hatirlatCiz();
    DD.toast('Sessiz saatlerin kaydedildi.');
  }));
  function adimCiz() {
    const a = u.adim, oran = Math.round((a.bugun / a.hedef) * 100);
    $('#gtAdimMetin').textContent = U.sayi(a.bugun) + ' adım / ' + U.sayi(a.hedef) + ' adım hedef';
    U.bas('#gtAdim', olcer(oran, 'Adım hedefi'));
    if (a.hafta.length) DD.grafik.cizgi($('#gtAdimGrafik'), { baslik: 'Son yedi günün adımları', etiketler: a.hafta.map((x) => kisaGun(x.tarih)), seriler: [{ ad: 'Adım', degerler: a.hafta.map((x) => x.tarih === b ? a.bugun : x.adim) }], hedef: a.hedef });
  }
  function makroCiz() {
    const tm = toplam();
    /* Halka Akıllı Tabak'taki makro payıyla aynı hesap: protein ve karbonhidrat 4, yağ 9 kcal/g */
    const m = [['Protein', 'protein', t.protein, 4, 'm-protein'], ['Karbonhidrat', 'karb', t.karb, 4, 'm-karb'], ['Yağ', 'yag', t.yag, 9, 'm-yag']];
    const enerji = m.reduce((a, x) => a + tm[x[1]] * x[3], 0);
    const pay = m.map((x) => (enerji ? Math.round((tm[x[1]] * x[3] / enerji) * 100) : 0));
    const satir = (ad, deger, hedef, birim, sinif, ek) => { const o = hedef ? Math.round((deger / hedef) * 100) : 0; return '<div class="makro-satir ' + sinif + '"><div class="olcum-bas"><span class="lejant-kalem ' + sinif + '">' + ad + (ek ? ' <small>' + ek + '</small>' : '') + '</span><b>' + U.sayi(deger) + ' / ' + U.sayi(hedef) + ' ' + birim + ' <small>%' + o + '</small></b></div><div class="yigma-cubuk" role="img" aria-label="' + ad + ' hedefi: yüzde ' + o + '"><span data-oran="' + Math.min(100, o) + '"></span></div></div>'; };
    const halka = U.bas('#gtMakro', '<div class="halka dilimli' + (enerji ? '' : ' bos') + '" role="img" aria-label="' + (enerji ? m.map((x, i) => x[0] + ' yüzde ' + pay[i]).join(', ') : 'Bugün henüz kalem yok') + '"><span><b>' + U.sayi(tm.kcal) + '</b><small>/ ' + U.sayi(t.kcal) + ' kcal</small></span></div><div class="yigin sik">' + satir('Enerji', tm.kcal, t.kcal, 'kcal', 'm-enerji') + m.map((x, i) => satir(x[0], tm[x[1]], x[2], 'g', x[4], enerji ? 'enerji payı %' + pay[i] : '')).join('') + '</div>');
    const dilim = halka && halka.querySelector('.halka');
    if (dilim) { dilim.style.setProperty('--dilim-1', pay[0]); dilim.style.setProperty('--dilim-2', pay[0] + pay[1]); }
    U.bas('#gtKalemler', tm.l.map((x) => '<tr><td><span class="no">' + U.kac(U.kalemMetin(x)) + '</span></td><td>' + ogunAd(x.ogun) + '</td><td class="tutar sag">' + DD.bicim.kcal(x.kcal) + '</td><td class="tutar sag">' + U.sayi(x.protein, 1) + ' g</td><td class="tutar sag">' + U.sayi(x.yag, 1) + ' g</td><td class="tutar sag">' + U.sayi(x.karb, 1) + ' g</td></tr>').join('') || '<tr><td colspan="6" class="bos-hucre">Bugün henüz kalem kaydedilmedi.</td></tr>');
  }
  function notCiz() {
    const l = U.yerel('gunlukNot', []).slice().reverse();
    U.bas('#gtNotlar', l.length
      ? '' + l.map((n) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-note-sticky" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.tarih(n.tarih) + ' · ' + U.kac(n.etiket) + '</b><span>' + U.kac(n.metin) + '</span></div>' + (n.paylasildi ? '<span class="as-eylem">' + U.durum('cozulen', 'Paylaşıldı') + '</span>' : '') + '</div>').join('')
      : U.bos({ ikon: 'fa-note-sticky', baslik: 'Henüz not yok', metin: 'Bugüne ilk notunu yukarıdan ekle.' }));
  }
  function ozetCiz() {
    const s = u.su, a = u.adim;
    const k1 = (i, e, d) => '<div class="sayac"><i class="fa-solid ' + i + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + d + '</b></div></div>';
    const hedefGun = s.hafta.filter((x) => gunSu(x) >= s.hedef_ml).length;
    /* Yeni üyede hafta boştur; bugünün satırı yine çıkar ki his kaydı görünsün */
    const gunler = s.hafta.length ? s.hafta : [{ tarih: b, ml: s.bugun_ml }];
    /* Gün gün öğün: plana uyulan öğün / planlanan; enerji işaretlenen öğünler ve eklenen kalemlerden */
    const gunOgun = (t) => { const l = U.secilenOgunler(k, t), i = k ? U.isaret(k, t) : {}, ek = (U.yerel('gunlukEk', {})[t]) || []; const y = l.filter((o) => i[o.anahtar]); return { n: y.length, top: l.length, kcal: y.reduce((x, o) => x + o.kcal, 0) + ek.reduce((x, e) => x + (Number(e.kcal) || 0), 0), ek: ek.length }; };
    const og = gunler.map((x) => gunOgun(x.tarih)), kayitli = og.filter((x) => x.n || x.ek);
    U.bas('#gtOrtalama', (duyarli ? '' : k1('fa-fire', 'Günlük enerji', kayitli.length ? DD.bicim.kcal(Math.round(kayitli.reduce((x, o) => x + o.kcal, 0) / kayitli.length)) : 'Kayıt yok')) + k1('fa-utensils', 'Kaydedilen öğün', og.reduce((x, o) => x + o.n, 0) + ' / ' + og.reduce((x, o) => x + o.top, 0)) + k1('fa-droplet', 'Su ortalaması', U.sayi(s.ortalama_ml) + ' ml') + k1('fa-shoe-prints', 'Adım ortalaması', U.sayi(a.ortalama)) + k1('fa-bullseye', 'Su hedefi tutan gün', hedefGun + ' / 7') + k1('fa-percent', 'Program uyumu', '%' + U.uyum(k).oran));
    U.bas('#gtHafta', gunler.slice().reverse().map((x) => {
      const y = a.hafta.find((z) => z.tarih === x.tarih) || {}, ml = gunSu(x), adim = x.tarih === b ? a.bugun : y.adim, his = DD.hisKaydi.kayit(x.tarih);
      const o = gunOgun(x.tarih), uyum = !o.top ? U.durum('kapali', 'Plan yok') : !o.n ? U.durum('kapali', 'Kayıt yok') : o.n === o.top ? U.durum('cozulen', 'Tam') : U.durum('bekleyen', 'Kısmi');
      return '<tr><td><span class="no">' + U.gunAdi(x.tarih) + '<small>' + U.kisaTarih(x.tarih) + '</small></span></td>' + (duyarli ? '' : '<td class="tutar sag">' + (o.n || o.ek ? DD.bicim.kcal(o.kcal) : '—') + '</td>') + '<td><span class="no">' + o.n + ' / ' + o.top + '</span> ' + uyum + '</td>' + (his ? '<td>' + DD.hisKaydi.hap(his) + '</td>' : '<td class="bos-hucre">Kayıt yok</td>') + '<td class="tutar sag">' + U.sayi(ml) + ' ml</td><td class="tutar sag">' + U.sayi(adim) + '</td><td>' + (ml >= s.hedef_ml ? U.durum('cozulen', 'Tuttu') : U.durum('bekleyen', 'Altında')) + '</td></tr>';
    }).join(''));
  }
  /* Eklenen kalemler: kaynak rozeti, Düzelt ve Sil */
  function ekCiz() {
    const e = ekler(), gastro = e.some((x) => x.kaynak === 'gastro');
    U.bas('#gtEkler', (e.length ? e.map((x, n) => {
      const kn = KAYNAK[x.kaynak];
      return '<div class="ayar-satir sarmali"><span class="as-ikon"><i class="fa-solid ' + (kn ? kn[1] : 'fa-plus') + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(U.kalemMetin(x)) + '</b><span>' + ogunAd(x.ogun) + (duyarli ? '' : ' · ' + (x.kcal ? DD.bicim.kcal(Math.round(x.kcal)) : 'enerji girilmedi')) + '</span></div><div class="as-eylem">' + (kn ? U.durum('acik', kn[0]) : '') + (x.ornek ? U.durum('kapali', 'Prototip örneği') : '') + '<button class="dugme hayalet kucuk" type="button" data-ek-duzelt="' + n + '">Düzelt</button><button class="dugme hayalet kucuk" type="button" data-ek-sil="' + n + '" aria-label="' + U.kac(U.kalemAd(x)) + ' kalemini sil"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div></div>';
    }).join('') : U.bos({ ikon: 'fa-plus', baslik: 'İlk öğününü ekle', metin: 'Plandan farklı yediğin her şeyi buraya ekle; Akıllı Tabak’tan ya da yalnız kaloriyle de ekleyebilirsin.' }))
      + (gastro ? '<div class="bilgi-notu"><i class="fa-solid fa-kitchen-set" aria-hidden="true"></i><p><b>Dada Gastro:</b> tarif sayfasında “Pişirdim” dediğin yemek günlüğüne kendiliğinden düşer. Buradaki kayıt prototip örneğidir; iki hesabın bağlanması canlıda yapılır.</p></div>' : ''));
  }
  /* Öğün penceresinin kısayolları: dünü kopyala, Akıllı Tabak, favori öğünler, sık eklenenler */
  const favoriler = () => U.yerel('favoriOgunler', []);
  function sikEklenenler() {
    const l = [], gor = {};
    const ekle = (slug) => { const x = U.besin(slug); if (x && !gor[slug] && l.length < 10) { gor[slug] = true; l.push(x); } };
    ((u.kaydedilenler || {}).besinler || []).forEach(ekle);
    const e = U.yerel('gunlukEk', {});
    Object.keys(e).sort().reverse().forEach((t) => e[t].slice().reverse().forEach((x) => { if (x.tur === 'besin' && x.slug) ekle(x.slug); }));
    return l;
  }
  function kisayolCiz() {
    const og = $('#gtOgunSec').value, d = gunEk(dun).filter((x) => x.ogun === og), bugunEk = ekler().filter((x) => x.ogun === og), fav = favoriler(), sik = sikEklenenler();
    const tabak = DD.kok + 'akilli-tabak-ve-degisim/?ogun=' + og + '&donus=hesabim/gunluk-takibim/';
    U.bas('#gtKisayol', '<div class="alan"><span class="alan-etiket">Kısayollar</span><div class="cipler"><button class="cip" type="button" data-gt-dun' + (d.length ? '' : ' disabled') + '><i class="fa-solid fa-copy" aria-hidden="true"></i> ' + (d.length ? 'Dünü kopyala (' + d.length + ' kalem)' : 'Dün bu öğüne kayıt yok') + '</button><a class="cip" href="' + tabak + '"><i class="fa-solid fa-plate-wheat" aria-hidden="true"></i> Akıllı Tabak’tan ekle</a>' + (bugunEk.length ? '<button class="cip" type="button" data-gt-fav-kaydet><i class="fa-solid fa-star" aria-hidden="true"></i> Bugünkü ' + U.kac(ogunAd(og).toLocaleLowerCase('tr')) + ' favorim olsun</button>' : '') + '</div></div>'
      + (fav.length ? '<div class="alan"><span class="alan-etiket">Favori öğünlerin</span><div class="cipler">' + fav.map((f, n) => '<button class="cip" type="button" data-gt-fav="' + n + '" title="' + U.kac(f.kalemler.map(U.kalemMetin).join(', ')) + '"><i class="fa-solid fa-star" aria-hidden="true"></i> ' + U.kac(f.ad) + '</button>').join('') + '</div></div>' : '')
      + (sik.length ? '<div class="alan"><span class="alan-etiket">Kaydettiklerin ve son eklediklerin</span><div class="cipler">' + sik.map((x) => '<button class="cip" type="button" data-besin-sec="' + x.slug + '" data-ad="' + U.kac(x.ad) + '">' + U.kac(x.ad) + '</button>').join('') + '</div></div>' : ''));
  }
  /* Kip: Besin ara ya da Hızlı ekle (yalnız kalori) */
  function kipKur(kip) {
    const hizli = kip === 'hizli';
    $('#gtKip').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.deger === kip)));
    U.gizle($('#gtListeAlan'), hizli); U.gizle($('#gtHizliAlan'), !hizli);
    $('#gtBesin').required = $('#gtGram').required = !hizli;
    $('#gtHizliKcal').required = hizli;
  }
  function pencereAc(og) {
    $('#gtOgunSec').value = og; kipKur('liste'); kisayolCiz(); DD.ac('#gtBesinModal');
  }
  /* Protein önerisi: protein hedefin %70'inin altındaysa kütüphanedeki porsiyon değerleriyle üç dört seçenek */
  const PROTEIN_ADAY = ['yogurt-yarim-yagli', 'yumurta-haslanmis', 'mercimek-haslanmis', 'nohut-haslanmis', 'beyaz-peynir-yarim-yagli', 'tavuk-gogsu-izgara'];
  function proteinCiz() {
    const kap = $('#gtProtein');
    if (!kap) return;
    const hedef = Number(t.protein) || 0, tm = toplam(), oran = hedef ? Math.round((tm.protein / hedef) * 100) : 100;
    if (!hedef || oran >= 70) { kap.innerHTML = ''; return; }
    const tarz = t.beslenme_tarzi || '', bitkisel = tarz === 'vegan' ? ['mercimek-haslanmis', 'nohut-haslanmis'] : null;
    const l = (bitkisel || PROTEIN_ADAY.filter((x) => !(tarz === 'vejetaryen' && x === 'tavuk-gogsu-izgara'))).map(U.besin).filter(Boolean).slice(0, 4);
    const satir = (x) => { const g = (x.porsiyon && x.porsiyon.gram) || 100, pr = (x.protein * g) / 100; return '<div class="ayar-satir sarmali"><span class="as-ikon"><i class="fa-solid fa-egg" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(x.ad) + '</b><span>' + U.kac((x.porsiyon && x.porsiyon.ad) || '100 g') + ' (' + U.sayi(g) + ' g): ' + U.sayi(pr, 1) + ' g protein, ' + DD.bicim.kcal(Math.round((x.kcal * g) / 100)) + '</span></div><div class="as-eylem"><button class="dugme hayalet kucuk" type="button" data-protein-ekle="' + x.slug + '" data-gram="' + g + '">Öğüne ekle</button></div></div>'; };
    kap.innerHTML = '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-dumbbell" aria-hidden="true"></i> Proteinin Eksik Kalıyor</h3><p>Bugün ' + U.sayi(tm.protein, 1) + ' / ' + U.sayi(hedef) + ' g protein aldın (%' + oran + '). Kalan öğünlerinde şunlardan biri açığı kapatmana yardım eder.</p></div></div><div class="kart-govde bosluksuz"><div class="ayar-liste">' + l.map(satir).join('') + '</div></div><div class="kart-alt eylem"><span class="eylem-notu">Değerler Besin Kütüphanesi’nden, porsiyon başına.</span><a class="dugme hayalet" href="' + DD.kok + 'besin-kutuphanesi/">Besin kütüphanesi</a></div></div>';
  }
  const ciz = () => { DD.hisKaydi.bas('#gtHis'); ogunCiz(); ekCiz(); suCiz(); adimCiz(); makroCiz(); proteinCiz(); notCiz(); ozetCiz(); };

  /* Öğün işareti */
  document.addEventListener('dd:ogun', () => { ogunCiz(); makroCiz(); proteinCiz(); ozetCiz(); });
  document.addEventListener('dd:ogun-foto', ogunCiz);
  document.addEventListener('dd:his', ozetCiz);
  /* Su */
  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-su]');
    if (s) {
      const l = suEkler(), once = u.su.bugun_ml;
      if (s.dataset.su === 'geri') u.su.bugun_ml = Math.max(0, u.su.bugun_ml - (l.pop() || 0));
      else if (s.dataset.su === 'cikar') suCikar();
      else { const ml = s.dataset.su === 'bardak' ? bardakMl() : Number(s.dataset.su); l.push(ml); u.su.bugun_ml += ml; }
      U.kaydet(); suCiz(); ozetCiz();
      /* Bardak dokunuşu mesaj açmaz; geri bildirimi dolum ve sayaçtır */
      if (!s.classList.contains('su-bardak') && once < u.su.hedef_ml && u.su.bugun_ml >= u.su.hedef_ml) DD.toast('Su hedefine ulaştın.');
      return;
    }
    const a = e.target.closest('[data-besin-ekle]');
    if (a) { pencereAc(a.dataset.besinEkle); return; }
    const o = e.target.closest('[data-besin-sec]');
    if (o) { kipKur('liste'); secilen = o.dataset.besinSec; $('#gtBesin').value = o.dataset.ad; $('#gtOneri').hidden = true; return; }
    const pe = e.target.closest('[data-protein-ekle]');
    if (pe) { const x = U.besin(pe.dataset.proteinEkle); pencereAc(siradakiOgun()); secilen = x.slug; $('#gtBesin').value = x.ad; $('#gtGram').value = pe.dataset.gram; return; }
    if (e.target.closest('[data-gt-dun]')) {
      const og = $('#gtOgunSec').value, l = gunEk(dun).filter((x) => x.ogun === og);
      l.forEach((x) => { const y = JSON.parse(JSON.stringify(x)); delete y.id; delete y.ornek; y.kaynak = 'dun'; ekler().push(y); });
      U.kaydet(); DD.kapat($('#gtBesinModal')); ciz();
      DD.toast('Dünkü ' + ogunAd(og).toLocaleLowerCase('tr') + ' kalemlerin (' + l.length + ') bugüne kopyalandı.');
      return;
    }
    if (e.target.closest('[data-gt-fav-kaydet]')) {
      const og = $('#gtOgunSec').value, l = ekler().filter((x) => x.ogun === og).map((x) => { const y = JSON.parse(JSON.stringify(x)); delete y.id; delete y.ornek; delete y.ogun; return y; });
      const ad = ogunAd(og) + ' · ' + l.map(U.kalemAd).slice(0, 2).join(', ') + (l.length > 2 ? ' +' + (l.length - 2) : '');
      favoriler().push({ ad, kalemler: l }); U.kaydet(); kisayolCiz();
      DD.toast('“' + ad + '” favori öğünlerine eklendi.');
      return;
    }
    const fv = e.target.closest('[data-gt-fav]');
    if (fv) {
      const f = favoriler()[Number(fv.dataset.gtFav)], og = $('#gtOgunSec').value;
      f.kalemler.forEach((x) => ekler().push(Object.assign(JSON.parse(JSON.stringify(x)), { ogun: og, kaynak: 'favori' })));
      U.kaydet(); DD.kapat($('#gtBesinModal')); ciz();
      DD.toast(f.ad + ' bugünkü ' + ogunAd(og).toLocaleLowerCase('tr') + ' öğününe eklendi.');
      return;
    }
    const sl = e.target.closest('[data-ek-sil]');
    if (sl) { const x = ekler().splice(Number(sl.dataset.ekSil), 1)[0]; U.kaydet(); ciz(); DD.toast(U.kalemAd(x) + ' günlüğünden çıkarıldı.'); return; }
    const dz = e.target.closest('[data-ek-duzelt]');
    if (dz) duzeltAc(Number(dz.dataset.ekDuzelt));
  });
  $('#gtElle').addEventListener('change', (e) => U.gizle($('#gtElleAlan'), !e.target.checked));
  $('#gtKip').addEventListener('dd:secim', (e) => kipKur(e.detail.deger));
  $('#gtOgunSec').addEventListener('change', kisayolCiz);
  /* Duyarlı üye kalori yazmaz: Hızlı ekle seçeneği kalkar */
  if (duyarli) U.gizle($('#gtKip').closest('.alan'), true);
  kipKur('liste');
  /* Saate göre sıradaki öğün: öneri kartından açılan pencere bunu seçer */
  const siradakiOgun = () => { const s = new Date().getHours() * 60 + new Date().getMinutes(); const o = U.ogunTanimi.find((x) => { const p = x[2].split(':'); return p[0] * 60 + Number(p[1]) >= s; }); return o ? o[0] : 'aksam'; };
  /* Düzelt: miktarı olan kalemde değerler oranla ölçeklenir; serbest ve hızlı kalemde ad ile enerji düzeltilir */
  let duzeltNo = -1;
  const birimAd = (x) => (x.tur === 'tarif' && x.kaynak !== 'akilli-tabak' ? 'porsiyon' : 'g');
  const miktarli = (x) => x.miktar > 0 && x.tur !== 'serbest';
  function duzeltAc(n) {
    const x = ekler()[n], m = miktarli(x);
    duzeltNo = n;
    $('#gtDuzeltAd').textContent = U.kalemMetin(x) + ' · ' + ogunAd(x.ogun);
    U.gizle($('#gtDuzeltMiktarAlan'), !m); U.gizle($('#gtDuzeltSerbestAlan'), m);
    $('#gtDuzeltMiktar').required = m;
    $('#gtDuzeltMiktar').value = x.miktar || '';
    $('label[for="gtDuzeltMiktar"]').firstChild.textContent = 'Miktar (' + birimAd(x) + ') ';
    $('#gtDuzeltAdGir').value = x.ad || '';
    $('#gtDuzeltKcal').value = x.kcal ? Math.round(x.kcal) : '';
    U.gizle($('#gtDuzeltKcal').closest('.alan'), duyarli);
    $('#gtDuzeltOgun').innerHTML = $('#gtOgunSec').innerHTML;
    $('#gtDuzeltOgun').value = x.ogun;
    DD.ac('#gtDuzeltModal');
  }
  $('#gtDuzeltForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const x = ekler()[duzeltNo];
    if (!x) return;
    if (miktarli(x)) {
      const yeni = Number($('#gtDuzeltMiktar').value);
      if (!(yeni > 0)) { DD.toast('Miktarı yaz.', 'hata'); return; }
      const o = yeni / x.miktar;
      ['kcal', 'protein', 'yag', 'karb'].forEach((a) => { if (x[a] != null) x[a] = (Number(x[a]) || 0) * o; });
      x.miktar = yeni;
      if (x.olcu) x.olcu = U.sayi(yeni, yeni % 1 ? 1 : 0) + ' ' + birimAd(x);
    } else {
      const ad = $('#gtDuzeltAdGir').value.trim();
      if (!ad) { DD.toast('Kalemin adını yaz.', 'hata'); return; }
      x.ad = ad;
      if (!duyarli) x.kcal = Number($('#gtDuzeltKcal').value) || 0;
    }
    x.ogun = $('#gtDuzeltOgun').value;
    U.kaydet(); DD.kapat($('#gtDuzeltModal')); ciz();
    DD.toast('Kalem düzeltildi.');
  });
  $('#gtOgunSec').innerHTML = U.ogunTanimi.map((o) => '<option value="' + o[0] + '">' + o[1] + '</option>').join('');

  /* Besin arama: kütüphane verisinden */
  const liste = (Array.isArray(window.DD_VERI.besinler) ? window.DD_VERI.besinler : window.DD_VERI.besinler.besinler) || [];
  let secilen = '';
  $('#gtBesin').addEventListener('input', (e) => {
    secilen = '';
    const q = e.target.value.toLocaleLowerCase('tr').trim(), o = $('#gtOneri');
    const l = q ? liste.filter((x) => x.ad.toLocaleLowerCase('tr').includes(q)).slice(0, 6) : [];
    o.hidden = !l.length;
    o.innerHTML = l.map((x) => '<button class="oneri-kalem" type="button" data-besin-sec="' + x.slug + '" data-ad="' + U.kac(x.ad) + '">' + U.kac(x.ad) + '</button>').join('');
  });
  $('#gtBesinForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#gtKip [aria-pressed="true"]').dataset.deger === 'hizli') {
      const kcal = Number($('#gtHizliKcal').value), og = $('#gtOgunSec').value;
      if (!(kcal > 0)) { DD.toast('Enerjiyi kcal olarak yaz.', 'hata'); return; }
      ekler().push({ tur: 'serbest', ad: $('#gtHizliAd').value.trim() || 'Hızlı ekleme', ogun: og, kcal, kaynak: 'hizli' });
      U.kaydet(); e.target.reset(); DD.kapat($('#gtBesinModal')); ciz();
      DD.toast(DD.bicim.kcal(kcal) + ' bugünkü ' + ogunAd(og).toLocaleLowerCase('tr') + ' öğününe eklendi.');
      return;
    }
    const x = liste.find((y) => y.slug === secilen) || liste.find((y) => y.ad.toLocaleLowerCase('tr') === $('#gtBesin').value.toLocaleLowerCase('tr').trim());
    /* Listede olmayan besin: ad, birim ve elle girilen değerlerle serbest kalem */
    if (!x && $('#gtElle').checked) {
      const ad = $('#gtBesin').value.trim(), n = (id) => Number($(id).value) || 0, mk = Number($('#gtGram').value) || 1, birim = $('#gtBirim').value.replace(/^.*\((.*)\)$/, '$1');
      if (!ad) { DD.toast('Besin ya da öğün adını yaz.', 'hata'); return; }
      ekler().push({ tur: 'serbest', ad: ad + ' ' + U.sayi(mk) + ' ' + birim, ogun: $('#gtOgunSec').value, kcal: n('#gtElleKcal'), protein: n('#gtElleProtein'), yag: n('#gtElleYag'), karb: n('#gtElleKarb') });
      U.kaydet(); e.target.reset(); secilen = ''; U.gizle($('#gtElleAlan'), true); DD.kapat($('#gtBesinModal')); ciz();
      DD.toast(ad + ' günlüğüne eklendi.');
      return;
    }
    if (!x) { DD.toast('Listeden bir besin seç ya da değerleri elle gir.', 'hata'); return; }
    const g = Number($('#gtGram').value) || 100, oran = g / 100;
    const v = (a) => (Number(x[a]) || 0) * oran;
    ekler().push({ tur: 'besin', slug: x.slug, ad: x.ad, miktar: g, ogun: $('#gtOgunSec').value, kcal: v('kcal'), protein: v('protein'), yag: v('yag'), karb: v('karb') });
    U.kaydet(); e.target.reset(); secilen = ''; DD.kapat($('#gtBesinModal')); ciz();
    DD.toast(x.ad + ' günlüğüne eklendi.');
  });
  $('#gtAdimForm').addEventListener('submit', (e) => {
    e.preventDefault();
    u.adim.bugun += Number($('#gtAdimSayi').value) || 0;
    U.kaydet(); DD.kapat($('#gtAdimModal')); adimCiz();
    DD.toast('Adımların eklendi.');
  });
  $('#gtNotForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = $('#gtNot'), metin = n.value.trim(), p = $('#gtNotPaylas').checked;
    if (!metin) return;
    U.yerel('gunlukNot', []).push({ tarih: b, etiket: $('#gtEtiket').value, metin, paylasildi: p });
    if (p) { const s = U.sohbet(); s.mesajlar.push({ kimden: 'danisan', zaman: b + 'T' + new Date().toTimeString().slice(0, 5), metin: 'Günlük not: ' + metin }); s.okunmamis = (s.okunmamis || 0) + 1; }
    U.kaydet(); e.target.reset(); notCiz();
    DD.toast(p ? 'Notun kaydedildi ve paylaşıldı.' : 'Notun kaydedildi.');
  });
  $('#gtPaylas').addEventListener('click', () => {
    const tm = toplam(), s = U.sohbet();
    s.mesajlar.push({ kimden: 'danisan', zaman: b + 'T' + new Date().toTimeString().slice(0, 5), metin: 'Günlük özetim: ' + (duyarli ? '' : DD.bicim.kcal(tm.kcal) + ', ') + U.sayi(u.su.bugun_ml) + ' ml su, ' + U.sayi(u.adim.bugun) + ' adım.' });
    s.okunmamis = (s.okunmamis || 0) + 1;
    U.kaydet();
    DD.toast('Günün özeti diyetisyenine gönderildi.');
  });
  /* Duyarlı üye: enerji sekmesi ve kalori hapı kalkar, yerine uzman notu gelir. Hafta tablosundaki hedef su hedefidir */
  if (duyarli) {
    ['gt-tab-makro', 'gt-pane-makro'].forEach((id) => { const e = document.getElementById(id); if (e) e.remove(); });
    U.gizle($('#gtKcal').parentElement, true);
    $('#gtBas').insertAdjacentHTML('afterend', U.uzmanNot());
    $('#gtHafta').closest('table').querySelector('th:last-child').textContent = 'Su hedefi';
    $('#gtHafta').closest('table').querySelector('th:nth-child(2)').remove();
  }
  ciz();
  /* Akıllı Tabak'tan dönüş: ?tabak=1 */
  if (new URLSearchParams(location.search).has('tabak')) {
    const n = ekler().filter((x) => x.kaynak === 'akilli-tabak').length;
    if (n) DD.toast('Akıllı Tabak’taki tabağın günlüğüne eklendi.'); else DD.toast('Akıllı Tabak’tan kalem gelmedi.', 'uyari');
    history.replaceState(null, '', location.pathname + location.hash);
  }
})();
