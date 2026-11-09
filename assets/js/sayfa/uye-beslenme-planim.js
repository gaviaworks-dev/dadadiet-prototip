/* Beslenme Planım: panelde gönderilen plan ve başlatılan programlar burada yaşar */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const b = U.bugun(), TU = DD.tercihUyum, duyarli = U.yemeDuyarli();
  TU.uyeBagla(U);
  const kk = () => U.aktifKaynak();
  /* Öğün Alternatifleri sekmesi kalktı (B2): eski #alternatif adresi Günlük Öğünlerim'e iner, kabuk sekmeyi DOMContentLoaded'da açar */
  if (location.hash === '#alternatif') history.replaceState(null, '', location.pathname + location.search + '#ogun');
  const bolumBas = (i, e, h, m, a) => '<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid ' + i + '" aria-hidden="true"></i> ' + e + '</span><h2>' + U.kac(h) + '</h2>' + (m ? '<p class="giris-metni">' + m + '</p>' : '') + (a ? '<div class="bolum-araclar">' + a + '</div>' : '') + '</div></div>';
  const tarihEtiket = U.tarih(b).replace(/ \d{4}$/, '') + ' ' + U.gunAdi(b);
  const hareketler = () => U.yerel('programHareket', []);
  const sure = (k) => (k.tip === 'plan' ? k.plan.gunler.length : k.program.sure_gun);
  const durakli = (k) => (k.tip === 'plan' ? !!U.yerel('planDurak', {})[k.anahtar] : k.program.durum === 'duraklatildi');

  function kaynakCiz() {
    const l = U.kaynaklar(), e = $('#bpKaynak'), a = kk();
    e.hidden = l.length < 2;
    e.innerHTML = l.map((k) => '<button class="cip' + (a && k.anahtar === a.anahtar ? ' aktif' : '') + '" type="button" data-deger="' + k.anahtar + '">' + U.kac(k.ad) + '</button>').join('');
  }

  function aktifCiz() {
    const k = kk();
    if (!k) {
      U.bas('#bpAktif', U.bos({ ikon: 'fa-clipboard-list', baslik: 'Aktif programın yok', metin: 'Bir program başlattığında ya da diyetisyenin plan gönderdiğinde burada görünür.', eylem: U.bag('Program kütüphanesine git', 'programlar/') }));
      return;
    }
    const dy = U.diyetisyen();
    const dongu = sure(k) + ' günlük döngü hâlinde ilerliyor.';
    const alt = k.tip === 'plan'
      ? '<i class="fa-solid fa-user-doctor" aria-hidden="true"></i> Diyetisyenin: ' + U.kac(dy ? dy.ad : '') + ' · ' + U.tarih(k.plan.tarih) + ' · Başlangıç ' + U.tarih(U.planBas(k.plan)) + (duyarli ? '' : ' · ' + DD.bicim.kcal(k.plan.hedef_kcal) + ' hedef') + '. ' + dongu
      : dongu + ' ' + U.kac(U.enerjisiz(TU.aciklama(k.program.aciklama || '', k.program))) + (U.olcekMetin(k.program) ? ' ' + U.olcekMetin(k.program) : '');
    U.bas('#bpBas', bolumBas('fa-seedling', 'Yürüyen program', k.ad, alt, U.bag('Program kütüphanesine git', 'programlar/', 'hayalet')));
    U.bas('#bpNotKap', k.tip === 'plan' && k.plan.danisana_not
      ? '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-comment-medical" aria-hidden="true"></i> Diyetisyeninin Notu</h3><p>' + U.kac(dy ? dy.ad : '') + ' · ' + U.tarih(k.plan.tarih) + '</p></div></div><div class="kart-govde okuma"><p>' + U.kac(k.plan.danisana_not) + '</p></div></div>'
      : '');
    U.bas('#bpUyum', uyumKisa(k));
    bitisCiz(k);
    const u = U.uyum(k);
    $('#bpUyumMetin').textContent = u.tamam ? u.toplam + ' öğünün ' + u.tamam + ' tanesinde plana uydun.' : 'Henüz işaretlenmiş bir öğün yok.';
    U.bas('#bpDurumHap', durakli(k) ? U.durum('bekleyen', 'Duraklatıldı', 'fa-pause') : U.durum('cozulen', 'Yürüyor', 'fa-play'));
    const d = $('#bpDuraklat');
    d.innerHTML = durakli(k) ? '<i class="fa-solid fa-play" aria-hidden="true"></i> Programa devam et' : '<i class="fa-solid fa-pause" aria-hidden="true"></i> Programı duraklat';
    dokumCiz();
    notlarCiz();
  }

  /* Uyum durumu (B1): ince ölçer ve tek satırda küçük değerler; ayrıntı uyum dökümünde */
  function uyumKisa(k) {
    const u = U.uyum(k), bas = U.kaynakBas(k), s = sure(k), gun = Math.max(0, Math.min(s, U.gunFarki(bas, b) + 1));
    const d = (e, v) => '<div><dt>' + e + '</dt><dd>' + v + '</dd></div>';
    return '<div class="olcer-satir"><div class="olcer hap" role="img" aria-label="Programa uyum: yüzde ' + u.oran + '"><span data-oran="' + u.oran + '"></span></div><b>%' + u.oran + '</b></div>'
      + '<dl class="kisa-degerler">' + d('Gün', gun ? gun + ' / ' + s : 'Başlamadı') + d('Öğün', u.tamam + ' / ' + u.toplam) + d('Kalan', (s - gun) + ' gün') + d('Bitiş', U.tarih(U.gunEkle(bas, s - 1))) + '</dl>'
      + '<p class="alan-yardim"><span>Uyum, tamamlanan öğünlerin planlanan öğünlere oranıdır; duraklatırsan kalan günler ileri kayar.</span></p>';
  }

  /* Program bitince: ilerleme özeti ve sıradaki program önerisi */
  const katalog = JSON.parse(($('#bpKatalog') || {}).textContent || '[]');
  function olcumFarki(bas, son) {
    if (duyarli) return '';
    const l = (U.danisan().olcumler || []).filter((x) => x.kilo != null).sort((x, y) => x.tarih.localeCompare(y.tarih));
    const ilk = l.filter((x) => x.tarih <= bas).slice(-1)[0] || l.find((x) => x.tarih >= bas && x.tarih <= son), sn = l.filter((x) => x.tarih <= son).slice(-1)[0];
    if (!ilk || !sn || ilk === sn) return 'Bu aralıkta iki ölçüm olmadığı için kilo değişimi hesaplanmadı.';
    const f = sn.kilo - ilk.kilo;
    return 'Kilon ' + U.tarih(ilk.tarih) + ' ile ' + U.tarih(sn.tarih) + ' arasında ' + (Math.abs(f) < 0.05 ? 'değişmedi' : U.sayi(Math.abs(f), 1) + ' kg ' + (f < 0 ? 'azaldı' : 'arttı')) + '.';
  }
  function benzerler(p) {
    const bitti = U.programlar().map((x) => x.slug), puan = (x) => (x.hedef || []).filter((h) => (p.hedef || []).includes(h)).length * 2 + (x.tercih || []).filter((h) => (p.tercih || []).includes(h)).length;
    return katalog.filter((x) => x.slug !== p.slug && !bitti.includes(x.slug)).map((x) => [puan(x), x]).filter((x) => x[0] > 0).sort((a, c) => c[0] - a[0]).slice(0, 2).map((x) => x[1]);
  }
  function bitisCiz(k) {
    const bas = U.kaynakBas(k), son = U.gunEkle(bas, sure(k) - 1);
    if (b <= son || (k.tip === 'program' && k.program.durum === 'tamamlandi')) { U.bas('#bpBitis', ''); return; }
    const u = U.uyum(k), p = k.tip === 'program' ? k.program : null, oneri = p ? benzerler(p) : [];
    const sat = (i, m) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + i + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + m[0] + '</b><span>' + m[1] + '</span></div>' + (m[2] || '') + '</div>';
    const satirlar = sat('fa-percent', ['Uyumun %' + u.oran, u.toplam + ' öğünün ' + u.tamam + ' tanesinde plana uydun.'])
      + (duyarli ? '' : sat('fa-weight-scale', ['Ölçüm', olcumFarki(bas, son), '<div class="as-eylem"><a class="dugme hayalet kucuk" href="' + DD.kok + 'hesabim/saglik-dosyam/#olcum">Ölçüm ekle</a></div>']))
      + oneri.map((x) => sat('fa-arrow-right', ['Sıradaki için: ' + U.kac(x.ad), x.sure_gun + ' günlük, hedefi ya da tarzı bitirdiğin programa yakın.', '<div class="as-eylem"><a class="dugme hayalet kucuk" href="' + DD.kok + 'program/' + x.slug + '/">İncele</a></div>'])).join('');
    const eylem = p ? '<button class="dugme hayalet" type="button" id="bpArsivle"><i class="fa-solid fa-box-archive" aria-hidden="true"></i> Arşive al</button>' + U.bag('<i class="fa-solid fa-compass" aria-hidden="true"></i> Program Bul', 'programlar/program-bul/') : '<button class="dugme birincil" type="button" data-not-ac><i class="fa-solid fa-pen" aria-hidden="true"></i> Diyetisyenimden yeni plan iste</button>';
    U.bas('#bpBitis', '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-flag-checkered" aria-hidden="true"></i> Program Tamamlandı</h3><p>' + U.kac(k.ad) + ' · ' + U.tarih(bas) + ' – ' + U.tarih(son) + '. Özetin işaretlediğin öğünlerden ve ölçümlerinden çıkar; bir sağlık değerlendirmesi değildir.</p></div></div><div class="kart-govde bosluksuz"><div class="ayar-liste">' + satirlar + '</div></div><div class="kart-alt eylem">' + eylem + '</div></div>');
  }

  /* Uyum dökümü hafta hafta: program başından bugüne, süren hafta da sayılır */
  function dokumCiz() {
    const k = kk();
    if (!k) return;
    const bas = U.kaynakBas(k), son = U.gunEkle(bas, sure(k) - 1), bit = b < son ? b : son;
    let s = '', tt = 0, tp = 0;
    for (let h = 0, t0 = bas; t0 <= bit; h++, t0 = U.gunEkle(t0, 7)) {
      let n = 0, p = 0;
      for (let t = t0; t <= bit && t < U.gunEkle(t0, 7); t = U.gunEkle(t, 1)) {
        const l = U.gunOgunleri(k, t), i = U.isaret(k, t);
        p += l.length; n += l.filter((o) => i[o.anahtar]).length;
      }
      tt += n; tp += p;
      const oran = p ? Math.round((n / p) * 100) : 0, t1 = U.gunEkle(t0, 6);
      s += '<tr><td><span class="no">' + (h + 1) + '. hafta<small>' + U.kisaTarih(t0) + ' – ' + U.kisaTarih(t1) + (b <= t1 && b >= t0 ? ' · sürüyor' : '') + '</small></span></td><td class="sag">' + n + '</td><td class="sag">' + p + '</td><td class="sag">' + U.durum(oran >= 80 ? 'cozulen' : 'bekleyen', '%' + oran) + '</td></tr>';
    }
    U.bas('#bpDokum', s
      ? '<div class="tablo-kap"><table class="tablo panel"><caption class="yalniz-okuyucu">Hafta hafta tamamlanan öğünler</caption><thead><tr><th scope="col">Hafta</th><th scope="col" class="sag">Tamamlanan öğün</th><th scope="col" class="sag">Planlanan</th><th scope="col" class="sag">Uyum</th></tr></thead><tbody>' + s + '</tbody></table></div><p class="alan-yardim"><span>Toplam <b>' + tt + ' / ' + tp + '</b> öğün. Üstteki oran bu haftaların toplamıdır; süren hafta tamamlanmadan sayılır.</span></p>'
      : '<p class="alan-yardim"><span>Programın henüz ölçülebilecek bir haftası yok.</span></p>');
  }

  function notlarCiz() {
    const k = kk(), l = U.tohumla('planNotlari').filter((n) => n.kaynak === (k && k.anahtar));
    U.bas('#bpNotlar', l.length
      ? '<div class="ayar-liste">' + l.slice().reverse().map((n) => '<div class="ayar-satir sarmali"><span class="as-ikon"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.tarih(n.tarih) + (n.konu ? ' · ' + U.kac(n.konu) : '') + '</b><span>' + U.kac(n.metin) + '</span></div><span class="as-eylem">' + (n.ornek ? U.durum('kapali', 'Prototip örneği') : '') + U.durum('cozulen', 'Gönderildi') + '</span></div>').join('') + '</div>'
      : U.bos({ ikon: 'fa-comments', baslik: 'Henüz not göndermedin', metin: 'Planla ilgili sorun ya da değişiklik isteğin varsa buradan ilet.', eylem: '<button class="dugme hayalet" type="button" data-not-ac>Not yaz</button>' }));
  }

  /* Her besin kendi satırında: uzun tek cümle yerine göz gezdirilen liste */
  const haftaOgun = (o, x) => '<div class="hafta-ogun' + (x ? '' : ' bos') + '"><span class="hafta-ogun-ad"><i class="fa-solid ' + o[3] + '" aria-hidden="true"></i> ' + o[1] + '</span>' + (x ? '<ul>' + x.metin.split(' + ').map((m) => '<li>' + U.kac(m) + '</li>').join('') + '</ul>' + U.veyaSatir(x) : '<small>Bu gün yok</small>') + '</div>';

  /* Alışveriş işaretleri haftaya bağlı: yeni haftada liste baştan başlar */
  let haftaBas = b, alisverisAdlar = [];
  const alinan = () => { const a = U.yerel('alisveris', {}), k = (kk() || {}).anahtar + '|' + haftaBas; a[k] = a[k] || {}; return a[k]; };

  function haftaCiz() {
    const k = kk();
    if (!k) { U.bas('#bpHaftaBas', ''); U.bas('#bpHafta', '<li>' + U.bos({ ikon: 'fa-calendar-week', baslik: 'Haftalık menün yok', metin: 'Bir program başlattığında öğünlerin gün gün burada görünür.', eylem: U.bag('Program seç', 'programlar/') }) + '</li>'); return; }
    /* Hafta, programın başladığı günden sayılır */
    const kb = U.kaynakBas(k), bas = U.gunEkle(kb, Math.max(0, Math.floor(U.gunFarki(kb, b) / 7)) * 7);
    U.bas('#bpHaftaBas', bolumBas('fa-calendar-week', U.kisaTarih(bas) + ' – ' + U.kisaTarih(U.gunEkle(bas, 6)), 'Haftalık Menün', 'Gün gün öğünlerin. Porsiyonlar plan kalemlerinin ölçüsüyle verilir; bugünün öğününü değiştirmek için Günlük Öğünlerim’de satırdaki alternatif düğmesini kullan.', U.bag('<i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Yapay zekâ haftalık menüm', 'hesabim/haftalik-menum/', 'hayalet')));
    haftaBas = bas;
    /* Kapatılan öğün o günün kaydında yer almaz; kolon haftanın herhangi bir gününde varsa görünür */
    const haftaGunleri = [0, 1, 2, 3, 4, 5, 6].map((i) => U.gunOgunleri(k, U.gunEkle(bas, i)));
    const tanim = U.ogunTanimi.filter((o) => haftaGunleri.some((g) => g.some((x) => x.anahtar === o[0])));
    const kap = $('#bpHafta');
    kap.style.setProperty('--ogun-sayi', tanim.length);
    let h = '';
    for (let i = 0; i < 7; i++) {
      const t = U.gunEkle(bas, i), l = U.secilenOgunler(k, t);
      const hap = t === b ? U.durum('acik', 'Bugün') : t < b ? U.durum('cozulen', 'Geçti') : U.durum('kapali', 'Planlandı');
      /* Telefonda yalnız bugün açık gelir, diğer günler başlıktaki düğmeyle açılır (.hafta-gun-ac yalnız 640 altında görünür) */
      h += '<li class="hafta-gun' + (t === b ? ' bugun acik' : '') + '"><div class="hafta-gun-bas"><b>' + U.gunAdi(t) + '</b><small>' + U.kisaTarih(t) + ' · ' + l.length + ' öğün</small>' + hap + '<button class="hafta-gun-ac" type="button" aria-expanded="' + (t === b) + '" aria-controls="bpGun' + i + '" aria-label="' + U.gunAdi(t) + ' öğünleri"><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button></div><div class="hafta-ogunler" id="bpGun' + i + '">' + tanim.map((o) => haftaOgun(o, l.find((m) => m.anahtar === o[0]))).join('') + '</div></li>';
    }
    U.bas(kap, h);
    /* Alışveriş listesi: hafta boyunca kalem toplamı */
    const top = {};
    for (let i = 0; i < 7; i++) U.secilenOgunler(k, U.gunEkle(bas, i)).forEach((o) => o.kalemler.forEach((x) => { const a = U.kalemAd(x); top[a] = top[a] || { tarif: x.tur === 'tarif', m: 0 }; if (x.slug) top[a].m += Number(x.miktar || x.gram) || 0; top[a].olcu = x.olcu; }));
    alisverisAdlar = Object.keys(top).sort((x, y) => x.localeCompare(y, 'tr'));
    const al = alinan();
    const sp = sepet();
    alisverisMiktar = (a) => (top[a].m ? U.sayi(top[a].m) + (top[a].tarif ? ' porsiyon' : ' g') : top[a].olcu || '');
    U.bas('#bpAlisverisListe', alisverisAdlar.map((a, n) => '<div class="kalem-satiri"><div class="ks-metin"><b>' + U.kac(a) + '</b><small>' + U.kac(alisverisMiktar(a)) + '</small></div><div class="as-eylem">' + (al[a] ? U.durum('cozulen', 'Alındı') : U.durum('bekleyen', 'Bekliyor')) + '<button class="dugme ' + (sp[a] ? 'birincil' : 'hayalet') + ' kucuk" type="button" data-sepet="' + n + '" aria-pressed="' + !!sp[a] + '" aria-label="' + U.kac(a) + (sp[a] ? ' sepette, çıkar' : ' Dada Market sepetine ekle') + '"><i class="fa-solid fa-cart-' + (sp[a] ? 'arrow-down' : 'plus') + '" aria-hidden="true"></i></button><label class="anahtar"><input type="checkbox" data-alindi="' + n + '"' + (al[a] ? ' checked' : '') + ' aria-label="' + U.kac(a) + ' alındı"><span class="anahtar-ray"></span></label></div></div>').join(''));
    $('#bpAlisverisMetin').textContent = U.kisaTarih(bas) + ' – ' + U.kisaTarih(U.gunEkle(bas, 6)) + ' menüsündeki öğünlerden çıkarıldı. Aldıklarını işaretle.';
    const n = alisverisAdlar.filter((a) => al[a]).length;
    $('#bpAlisverisSayac').textContent = n + ' / ' + alisverisAdlar.length + ' tamamlandı';
    $('#bpAlisverisSayac').className = 'durum-hapi ' + (n === alisverisAdlar.length && n ? 'cozulen' : 'bekleyen');
    $('#bpAlisverisHepsi').disabled = n === alisverisAdlar.length;
    sepetSayi();
  }
  /* Dada Market sepeti: prototip örneği, yalnız bu tarayıcıda; ürün ve fiyat yok */
  const sepet = () => U.yerel('marketSepet', {});
  let alisverisMiktar = () => '';
  function sepetSayi() {
    const n = Object.keys(sepet()).length;
    $('#bpSepetSayi').textContent = n ? 'Sepette ' + n + ' malzeme var.' : '';
    $('#bpSepetGor').disabled = !n;
  }
  function sepetCiz() {
    const s = sepet(), l = Object.keys(s);
    U.bas('#bpSepetListe', l.map((a) => '<div class="kalem-satiri"><div class="ks-metin"><b>' + U.kac(a) + '</b><small>' + U.kac(s[a]) + '</small></div><div class="as-eylem"><button class="dugme hayalet kucuk" type="button" data-sepet-cikar="' + U.kac(a) + '">Çıkar</button></div></div>').join('') || U.bos({ ikon: 'fa-cart-shopping', baslik: 'Sepetin boş', metin: 'Alışveriş listesindeki sepet simgesiyle malzeme ekle.' }));
    $('#bpSepetBosalt').disabled = !l.length;
  }
  document.addEventListener('click', (e) => {
    const d = e.target.closest('[data-sepet]');
    if (d) {
      const a = alisverisAdlar[Number(d.dataset.sepet)], s = sepet(), var_ = !!s[a];
      if (var_) delete s[a]; else s[a] = alisverisMiktar(a);
      U.kaydet(); haftaCiz();
      DD.toast(var_ ? a + ' sepetten çıkarıldı.' : a + ' Dada Market sepetine eklendi (prototip örneği).');
      return;
    }
    const c = e.target.closest('[data-sepet-cikar]');
    if (c) { delete sepet()[c.dataset.sepetCikar]; U.kaydet(); sepetCiz(); haftaCiz(); return; }
    if (e.target.closest('#bpSepetGor')) { sepetCiz(); DD.kapat($('#bpAlisveris')); DD.ac('#bpSepet'); return; }
    if (e.target.closest('#bpSepetBosalt')) { U.yerel('marketSepet', {}); U.d().uyeYerel.marketSepet = {}; U.kaydet(); sepetCiz(); haftaCiz(); DD.toast('Sepetin boşaltıldı.'); return; }
    if (e.target.closest('#bpArsivle')) {
      const k = kk();
      k.program.durum = 'tamamlandi';
      hareketler().push({ tarih: b, ad: k.ad, hareket: 'Tamamlandı' });
      U.yerel('gorunum', {}).kaynak = null;
      U.kaydet(); ciz();
      DD.toast(k.ad + ' arşive alındı.');
    }
  });

  function ogunCiz() {
    const k = kk();
    U.bas('#bpOgunBas', bolumBas('fa-calendar-day', tarihEtiket, 'Bugünün Öğünleri', 'Plana uyduysan tek dokunuşla işaretle; ' + (duyarli ? 'uyumun' : 'toplamın ve uyumun') + ' buna göre güncellenir.', U.bag('Günlük Takibim', 'hesabim/gunluk-takibim/', 'hayalet')));
    const l = U.secilenOgunler(k, b);
    if (!k) { U.bas('#bpOgunler', U.bos({ ikon: 'fa-utensils', baslik: 'Bugün için öğün yok', metin: 'Aktif bir programın olduğunda öğünlerin burada listelenir.', eylem: U.bag('Program seç', 'programlar/') })); return; }
    const i = U.isaret(k, b);
    U.bas('#bpOgunler', l.map((o) => U.ogunSatirKisa(o, U.ogunDurum(i, o), U.alternatif(U.gunOgunleri(k, b).find((x) => x.anahtar === o.anahtar) || o).length ? U.ikonDugme('fa-right-left', 'Alternatif seç', 'data-alt-ac="' + o.anahtar + '"') : '')).join('') || U.bugunBos(k));
    const n = l.filter((o) => i[o.anahtar]).length;
    $('#bpOgunOzet').textContent = k.ad + ' · ' + l.length + ' öğün planlandı.';
    $('#bpOgunSayac').textContent = n + ' / ' + l.length + ' tamamlandı';
    $('#bpOgunSayac').className = 'durum-hapi ' + (n === l.length ? 'cozulen' : 'bekleyen');
    $('#bpHepsi').disabled = l.every((o) => U.ogunDurum(i, o));
    $('#bpOgunNot').textContent = n === l.length ? 'Bugünün bütün öğünleri tamam.' : '';
    /* Pasif düğmenin nedeni ekranda yazar */
    const dy = U.diyetisyen();
    document.querySelectorAll('[data-not-ac]').forEach((d) => { d.disabled = !dy; });
    if (!dy) $('#bpOgunNot').textContent = 'Not gönderebilmek için etkin bir diyetisyenin olmalı.';
    const say = (a) => l.filter((o) => i[o.anahtar]).reduce((t, o) => t + o[a], 0);
    const hed = (a) => l.reduce((t, o) => t + o[a], 0);
    const satir = (ad, a, birim, bs) => { const al = say(a), h = hed(a); return '<tr><td><b>' + ad + '</b></td><td class="tutar sag">' + U.sayi(al, bs) + ' ' + birim + '</td><td class="tutar sag">' + U.sayi(h, bs) + ' ' + birim + '</td><td class="tutar sag">' + U.sayi(Math.max(0, h - al), bs) + ' ' + birim + '</td></tr>'; };
    U.bas('#bpMakro', satir('Enerji', 'kcal', 'kcal', 0) + satir('Protein', 'protein', 'g', 1) + satir('Karbonhidrat', 'karb', 'g', 1) + satir('Yağ', 'yag', 'g', 1));
  }

  /* Alternatif seçimi (B2): öğün satırındaki ikon düğme pencereyi açar. Plandaki öğün ve enerjisi en yakın iki tarif; seçim bugünün planına yazılır */
  let altOgun = '';
  function alternatifCiz() {
    const k = kk();
    if (!k || !altOgun) return;
    const o = U.gunOgunleri(k, b).find((x) => x.anahtar === altOgun);
    if (!o) return;
    const sec = ((U.yerel('alternatifler', {})[k.anahtar] || {})[b] || {})[o.anahtar] || '';
    const kc = (v) => (duyarli ? '' : ' · ' + DD.bicim.kcal(v));
    const sat = (slug, ikon, ad, alt) => '<button class="secenek" type="button" data-alt-ogun="' + o.anahtar + '" data-alt="' + slug + '" aria-pressed="' + (sec === slug) + '"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i><span>' + ad + '<small>' + alt + '</small></span></button>';
    $('#bpAltBaslik').textContent = o.ad + ' · Alternatif Seç';
    U.bas('#bpAlternatif', sat('', o.ikon, 'Plandaki öğün' + kc(o.kcal), U.kac(o.metin)) + U.alternatif(o).map((t) => sat(t.slug, 'fa-right-left', U.kac(t.ad) + kc(t.kcal), 'Plandaki öğünün yerine geçen tarif')).join(''));
  }

  function arsivCiz() {
    const bitti = U.programlar().filter((x) => x.durum === 'tamamlandi');
    U.bas('#bpTamamBas', bolumBas('fa-box-archive', 'Arşiv', 'Tamamladığın Programlar', 'Sonuna kadar uyguladığın programlar ve uyum oranların.', ''));
    U.bas('#bpTamam', bitti.map((x, n) => {
      const k = { anahtar: x.slug, tip: 'program', program: x }, u = U.uyum(k), son = U.gunEkle(x.baslangic, x.sure_gun - 1);
      const sonraki = benzerler(x)[0], olc = olcumFarki(x.baslangic, son);
      return '<tr><td><span class="no">' + U.kac(x.ad) + '<small>' + x.sure_gun + ' günlük döngü</small></span></td><td class="tarih">' + U.kisaTarih(x.baslangic) + ' – ' + U.kisaTarih(son) + '</td><td>' + U.durum(u.oran >= 80 ? 'cozulen' : 'bekleyen', '%' + u.oran) + '</td><td class="eylem-kolon"><button class="dugme hayalet kucuk" type="button" data-dokum-ac="' + n + '" aria-expanded="false" aria-controls="bpTamamDokum' + n + '">Dökümü aç</button></td></tr>'
        + '<tr id="bpTamamDokum' + n + '" hidden><td colspan="4"><p class="alan-yardim"><span><b>' + U.kac(x.ad) + ' · program dökümü.</b> ' + x.sure_gun + ' gün, ' + U.tarih(x.baslangic) + ' – ' + U.tarih(son) + ', uyum %' + u.oran + '. Planlanan öğün ' + u.toplam + ', tamamlanan ' + u.tamam + '; program döngüsü ' + x.sure_gun + ' gün. ' + (olc ? olc + ' ' : '') + 'Bu döküm yalnız işaretlediğin öğünlerden çıkarıldı; bir sağlık değerlendirmesi değildir.' + (sonraki ? ' Sıradaki için öneri: <a href="' + DD.kok + 'program/' + sonraki.slug + '/">' + U.kac(sonraki.ad) + '</a>.' : '') + '</span></p></td></tr>';
    }).join('') || '<tr><td colspan="4" class="bos-hucre">Henüz tamamlanmış bir programın yok.</td></tr>');
    U.sayac('tamamlanan', bitti.length);
    const p = U.plan();
    const l = hareketler().slice().reverse();
    if (p) l.push({ tarih: p.tarih, ad: p.ad, hareket: 'Diyetisyen planı gönderdi', not: p.surum ? 'Sürüm ' + p.surum : '' });
    U.bas('#bpGecmisBas', bolumBas('fa-clock-rotate-left', 'Bütün hareketler', 'Program Geçmişin', 'Başlattığın, duraklattığın ve devam ettirdiğin programların tam kaydı; tamamlananlar da bu listede.', ''));
    $('#bpGecmisSayi').textContent = l.length + ' kayıt';
    const HAP = { 'Duraklatıldı': 'bekleyen', 'Devam ettirildi': 'acik', 'Program başlatıldı': 'acik', 'Tamamlandı': 'cozulen' };
    U.bas('#bpGecmis', l.map((h) => '<tr><td class="tarih">' + U.kisaTarih(h.tarih) + '</td><td><span class="no">' + U.kac(h.ad) + '</span></td><td>' + U.durum(HAP[h.hareket] || 'kapali', U.kac(h.hareket)) + '</td><td>' + (h.not ? U.kac(h.not) : '—') + '</td></tr>').join('') || '<tr><td colspan="4" class="bos-hucre">Henüz bir hareket kaydın yok.</td></tr>');
  }

  /* Program için uyarlama bilgisi, diyetisyen planı için aykırı kalem uyarısı */
  function tercihCiz() {
    const k = kk();
    const h = !k ? '' : k.tip === 'plan' ? TU.planUyariHtml(U, k.plan) : TU.bilgiHtml(TU.ogunOzeti(U.gunOgunleri(k, b)));
    document.querySelectorAll('[data-bp-tercih]').forEach((e) => U.bas(e, h));
  }

  function ciz() { kaynakCiz(); aktifCiz(); haftaCiz(); ogunCiz(); arsivCiz(); tercihCiz(); }

  document.addEventListener('dd:suzgec', (e) => {
    if (e.target.id !== 'bpKaynak') return;
    U.yerel('gorunum', {}).kaynak = e.detail.deger; U.kaydet(); ciz();
  });
  document.addEventListener('dd:ogun', () => { ogunCiz(); aktifCiz(); });
  document.addEventListener('click', (e) => {
    const ac = e.target.closest('[data-alt-ac]');
    if (ac) { altOgun = ac.dataset.altAc; alternatifCiz(); DD.ac('#bpAltModal'); return; }
    const a = e.target.closest('[data-alt]');
    if (a) {
      const k = kk(), s = U.yerel('alternatifler', {});
      s[k.anahtar] = s[k.anahtar] || {}; s[k.anahtar][b] = s[k.anahtar][b] || {};
      const o = a.dataset.altOgun, once = s[k.anahtar][b][o] || '';
      if (a.dataset.alt) s[k.anahtar][b][o] = a.dataset.alt; else delete s[k.anahtar][b][o];
      U.kaydet(); ogunCiz(); haftaCiz(); DD.kapat($('#bpAltModal'));
      const d = document.querySelector('[data-alt-ac="' + o + '"]');
      if (d) d.focus();
      if (once !== a.dataset.alt) DD.toast(a.dataset.alt ? 'Alternatif bugünün planına yazıldı.' : 'Öğün plana geri döndü.');
      return;
    }
    if (e.target.closest('[data-not-ac]')) {
      const k = kk(), dy = U.diyetisyen(), gun = k ? Math.max(1, U.gunFarki(U.kaynakBas(k), b) + 1) : 0;
      $('#bpNotBaglam').textContent = dy ? 'Notun ' + dy.ad + ' adlı diyetisyenine' + (k ? ', bu programın ' + gun + '. günü bağlamıyla,' : '') + ' iletilir.' : '';
      DD.ac('#bpNotModal');
    }
  });
  $('#bpHepsi').addEventListener('click', () => {
    const k = kk(), i = U.isaret(k, b);
    /* Kalan: henüz işaretlenmemiş öğünler; atladım denenler değişmez */
    U.gunOgunleri(k, b).filter((o) => !U.ogunDurum(i, o)).forEach((o) => { i[o.anahtar] = true; });
    U.kaydet(); ogunCiz(); aktifCiz();
    DD.toast('Kalan öğünler işaretlendi.');
  });
  $('#bpDokumDugme').addEventListener('click', (e) => {
    const d = $('#bpDokum'), ac = d.hidden;
    d.hidden = !ac; e.currentTarget.setAttribute('aria-expanded', String(ac));
  });
  /* Duraklatma ve devam onaylı: kutu işaretlenmeden düğme açılmaz */
  $('#bpDuraklat').addEventListener('click', () => {
    const k = kk(), yeni = !durakli(k), kalan = Math.max(0, sure(k) - Math.max(0, U.gunFarki(U.kaynakBas(k), b) + 1));
    $('#bpDurakBaslik').textContent = yeni ? 'Programı Duraklatmak Üzeresin' : 'Programı Devam Ettirmek Üzeresin';
    $('#bpDurakOzet').textContent = yeni ? k.ad + ' duraklatılırsa bugünden sonraki günler ileri kayar; tamamladığın günler ve uyum oranın korunur.' : k.ad + ' devam ettirilirse kalan günler bugünden sayılır.';
    $('#bpDurakOnayMetin').textContent = yeni ? 'Programın duraklatılacağını ve kalan ' + kalan + ' günün ileri kayacağını anladım.' : 'Programın devam ettirileceğini ve kalan günlerin bugünden sayılacağını anladım.';
    $('#bpDurakUygula').innerHTML = '<i class="fa-solid fa-' + (yeni ? 'pause' : 'play') + '" aria-hidden="true"></i> ' + (yeni ? 'Programı duraklat' : 'Programa devam et');
    $('#bpDurakOnay').checked = false; $('#bpDurakUygula').disabled = true; U.gizle($('#bpDurakKilit'), false);
    DD.ac('#bpDurakModal');
  });
  $('#bpDurakOnay').addEventListener('change', (e) => { $('#bpDurakUygula').disabled = !e.target.checked; U.gizle($('#bpDurakKilit'), e.target.checked); });
  $('#bpDurakForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$('#bpDurakOnay').checked) return;
    const k = kk(), yeni = !durakli(k);
    if (k.tip === 'plan') U.yerel('planDurak', {})[k.anahtar] = yeni;
    else k.program.durum = yeni ? 'duraklatildi' : 'devam';
    hareketler().push({ tarih: b, ad: k.ad, hareket: yeni ? 'Duraklatıldı' : 'Devam ettirildi' });
    U.kaydet(); DD.kapat($('#bpDurakModal')); ciz();
    DD.toast(yeni ? 'Program duraklatıldı.' : 'Programa devam ediyorsun.');
  });
  /* Alışveriş listesi: işaretler bu hafta için saklanır */
  $('#bpAlisverisListe').addEventListener('change', (e) => {
    const c = e.target.closest('[data-alindi]');
    if (!c) return;
    const a = alisverisAdlar[Number(c.dataset.alindi)], al = alinan();
    if (c.checked) al[a] = true; else delete al[a];
    U.kaydet(); haftaCiz();
  });
  $('#bpAlisverisHepsi').addEventListener('click', () => {
    const al = alinan();
    alisverisAdlar.forEach((a) => { al[a] = true; });
    U.kaydet(); haftaCiz();
    DD.toast('Listenin hepsi alındı olarak işaretlendi.');
  });
  $('#bpTamam').addEventListener('click', (e) => {
    const d = e.target.closest('[data-dokum-ac]');
    if (!d) return;
    const r = document.getElementById('bpTamamDokum' + d.dataset.dokumAc), ac = r.hidden;
    r.hidden = !ac; d.setAttribute('aria-expanded', String(ac)); d.textContent = ac ? 'Dökümü kapat' : 'Dökümü aç';
  });
  $('#bpPdf').addEventListener('click', () => {
    const k = kk();
    if (!k) { DD.toast('Aktif programın olmadığı için menü yok.', 'uyari'); return; }
    const gunler = [0, 1, 2, 3, 4, 5, 6].map((i) => { const t = U.gunEkle(haftaBas, i); return { gun: U.gunAdi(t), tarih: U.kisaTarih(t), durum: t === b ? 'Bugün' : t < b ? 'Geçti' : 'Planlandı', ogunler: U.secilenOgunler(k, t).map((o) => ({ ad: o.ad, saat: DD.bicim.saat(o.saat), metin: o.metin })) }; });
    DD.menuPdf({ program: k.ad, aralik: U.kisaTarih(haftaBas) + ' – ' + U.kisaTarih(U.gunEkle(haftaBas, 6)), uye: U.uye().ad, gunler })
      .then(() => DD.toast('Haftalık menün PDF olarak indirildi.'))
      .catch(() => DD.toast('PDF hazırlanamadı, tekrar dene.', 'hata'));
  });
  $('#bpHafta').addEventListener('click', (e) => {
    const d = e.target.closest('.hafta-gun-ac');
    if (!d) return;
    const acik = d.closest('.hafta-gun').classList.toggle('acik');
    d.setAttribute('aria-expanded', acik);
  });
  $('#bpYazdir').addEventListener('click', () => DD.yazdir($('#bpYazdir').closest('.kart'), 'Haftalık Menü'));
  /* Duyarlı üye: alınan, hedef ve kalan tablosu yerine uzman notu */
  if (duyarli) {
    $('#bpMakroKart').outerHTML = U.uzmanNot();
    $('#bpAltMetin').textContent = 'Seçtiğin alternatif yalnız bugünün planına yazılır.';
  }
  $('#bpNotForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const m = $('#bpNotMetin'), konu = $('#bpNotKonu').value, metin = m.value.trim(), k = kk();
    if (!metin) { DD.toast('Notun boş olamaz; diyetisyenine ne iletmek istediğini yaz.', 'hata'); return; }
    U.yerel('planNotlari', []).push({ kaynak: k.anahtar, tarih: b, konu, metin });
    U.sohbet().mesajlar.push({ kimden: 'danisan', zaman: b + 'T' + new Date().toTimeString().slice(0, 5), metin: 'Plan notu · ' + konu + ': ' + metin });
    U.sohbet().okunmamis = (U.sohbet().okunmamis || 0) + 1; /* panelde okunmamış görünür */
    U.kaydet(); m.value = ''; DD.kapat($('#bpNotModal')); notlarCiz();
    DD.toast('Notun diyetisyenine iletildi.');
  });
  ciz();
})();
