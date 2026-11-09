/* Genel Bakış: şimdi ne yapmalıyım sorusunun tek yanıtı. Yeni üyede boş blok görünmez */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  DD.tercihUyum.uyeBagla(U);
  const $ = (s) => document.querySelector(s);
  const u = U.uye(), b = U.bugun(), dy = U.diyetisyen(), duyarli = U.yemeDuyarli();
  const bag = (metin, yol, sinif) => '<a class="dugme ' + sinif + '" href="' + DD.kok + yol + '">' + metin + '</a>';
  const kartHtml = (ikon, baslik, metin, sag, govde, alt) => '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i> ' + baslik + '</h3>' + (metin ? '<p>' + metin + '</p>' : '') + '</div>' + (sag || '') + '</div>' + (govde || '') + (alt ? '<div class="kart-alt eylem">' + alt + '</div>' : '') + '</div>';
  const sayac = (i, e, d) => '<div class="sayac"><i class="fa-solid ' + i + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + d + '</b></div></div>';

  /* Adım verisi DadaFit'ten gelir: alanın tamamı oraya götürür */
  const adimSayac = () => '<a class="sayac dis-bag" href="https://dadafit.com.tr" target="_blank" rel="noopener" aria-label="Adım: ' + U.sayi(u.adim.bugun) + '. DadaFit\'te gör, yeni sekmede açılır"><i class="fa-solid fa-shoe-prints" aria-hidden="true"></i><div><span>Adım</span><b>' + U.sayi(u.adim.bugun) + '</b><small>DadaFit\'te gör <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></small></div></a>';

  function ciz() {
    const k = U.aktifKaynak(), yeni = !k && !dy, ohAcik = ogunCiz(yeni);
    /* Öğün Hatırlatıcı açıkken sıradaki öğün kendi kartında: yapılacaklar ve günün özeti tekrar etmez */
    const l = U.yapilacaklar().filter((x) => !(ohAcik && x.ogun)), ilk = l[0];
    const ad = (u.ad || '').split(' ')[0];
    $('#gbSelam').textContent = 'Merhaba ' + ad + '. Bugün ' + U.tarih(b) + ' ' + U.gunAdi(b) + '.';
    U.bas('#gbSiradaki', ilk ? kartHtml(ilk.ikon, ilk.baslik, U.kac(ilk.metin), '<div class="as-eylem">' + bag(ilk.etiket, ilk.yol, 'birincil') + '</div>') : kartHtml('fa-circle-check', 'Bugün için her şey tamam', 'Yarın görüşmek üzere; kayıtların diyetisyeninle paylaşıldı.'));

    /* Bugünün özeti: uyum önde, kalan kalori küçük */
    $('#gbKolon').hidden = yeni;
    if (k) {
      const i = U.isaret(k, b), og = U.secilenOgunler(k, b), n = og.filter((o) => i[o.anahtar]).length, s = og.find((o) => !U.ogunDurum(i, o)), t = U.gunToplam();
      const oran = og.length ? Math.round((n / og.length) * 100) : 0, hk = (u.tercihler || {}).kcal || (k.tip === 'plan' ? k.plan.hedef_kcal : 0);
      const ilkSayac = duyarli ? sayac('fa-utensils', 'Öğün', n + ' / ' + og.length) : sayac('fa-fire', 'Hedef <span class="birim">' + DD.bicim.kcal(hk) + '</span>', DD.bicim.kcal(t.kcal));
      const kart = kartHtml('fa-sun', 'Bugünün Özeti', U.kac(k.ad), '<div class="as-eylem"><span class="durum-hapi ' + (n === og.length && n ? 'cozulen' : 'bekleyen') + '">' + n + ' / ' + og.length + ' öğün</span></div>',
        '<div class="kart-govde"><div class="olcer hap" role="img" aria-label="Bugünkü öğün uyumu: yüzde ' + oran + '"><span data-oran="' + oran + '"></span></div><div class="sayac-izgara uc">' + ilkSayac + sayac('fa-droplet', 'Su', U.sayi(u.su.bugun_ml) + ' ml') + adimSayac() + '</div></div>' + (s && !ohAcik ? '<div class="kart-govde bosluksuz"><div class="kalem-liste">' + U.ogunSatir(s, '') + '</div></div>' : (og.length ? '' : '<div class="kart-govde">' + U.bugunBos(k) + '</div>')),
        bag('Bütün öğünler', 'hesabim/beslenme-planim/#ogun', 'hayalet'));
      U.bas('#gbGun', duyarli ? '<div class="yigin">' + U.uzmanNot() + kart + '</div>' : kart);
    } else U.bas('#gbGun', '');

    ilkCiz(k);
    /* Yeni üyede İlk Adımlar kartı sıradaki adımı zaten içerir: üstteki tekrar etmesin */
    if (yeni && $('#gbIlk').innerHTML) U.bas('#gbSiradaki', '');
    grafikCiz();

    const su = u.su;
    U.bas('#gbKayit', [
      ['fa-utensils', 'Öğün', k ? 'Plana uyduysan tek dokunuşla işaretle.' : 'Yediklerini günlüğe ekle.', bag('Ekle', 'hesabim/gunluk-takibim/', 'hayalet kucuk')],
      ['fa-droplet', 'Su', U.sayi(su.bugun_ml) + ' / ' + U.sayi(su.hedef_ml) + ' ml · ' + Math.round(su.hedef_ml / su.bardak_ml) + ' bardak', '<button class="dugme hayalet kucuk" type="button" data-su-ekle="' + su.bardak_ml + '">1 su bardağı (' + su.bardak_ml + ' ml)</button>'],
      ['fa-weight-scale', 'Ölçüm', 'Kilo, bel ve yağ oranı.', bag('Ekle', 'hesabim/saglik-dosyam/#olcum', 'hayalet kucuk')],
    ].map((x) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + x[0] + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + x[1] + '</b><span>' + x[2] + '</span></div><span class="as-eylem">' + x[3] + '</span></div>').join(''));

    /* Sıradaki görüşme */
    const r = U.tumRandevular().find((x) => x.tarih >= b && U.rAcik(x));
    const rUzman = r && (U.uzmanlar().find((x) => x.slug === r.uzman) || dy);
    U.bas('#gbRandevu', r ? kartHtml('fa-calendar-day', 'Sıradaki Görüşmen', U.tarih(r.tarih) + ', ' + DD.bicim.saat(r.saat) + ' · ' + U.kac(r.tur) + (rUzman ? '<br>' + U.kac(rUzman.ad) : ''), '<div class="as-eylem">' + U.rHap(r) + '</div>', '', bag('Randevularım', 'hesabim/diyetisyenim/#randevu', 'hayalet'))
      : dy ? kartHtml('fa-calendar-plus', 'Planlı görüşmen yok', 'Diyetisyeninle yeni bir görüşme ayarla.', '', '', bag('Randevu Oluştur', 'hesabim/diyetisyenim/#randevu', 'birincil')) : '');

    /* Diyetisyenin son sözü: otomatik metin üretilmez */
    const m = U.sohbet().mesajlar.filter((x) => x.kimden !== 'danisan').slice(-1)[0];
    U.bas('#gbMesaj', dy && m ? kartHtml('fa-comments', 'Diyetisyeninden Son Mesaj', U.kac(dy.ad) + ' · ' + U.tarih(m.zaman) + (u.okunmamis_mesaj ? ' · ' + u.okunmamis_mesaj + ' okunmamış' : ''), '', '<div class="kart-govde"><p class="kart-metin">' + U.kac(m.metin || (m.ek ? m.ek.ad : '')) + '</p></div>', bag('Yanıtla', 'hesabim/diyetisyenim/#mesaj', 'hayalet')) : '');

    /* Yapılacaklar: en çok üç satır, ilki yukarıda önerildi */
    const kalan = l.slice(1, 4);
    U.bas('#gbGorev', kalan.length ? kartHtml('fa-list-check', 'Yapılacaklar', '', '', '<div class="kart-govde bosluksuz"><div class="ayar-liste">' + kalan.map((x) => '<a class="ayar-satir" href="' + DD.kok + x.yol + '"><span class="as-ikon"><i class="fa-solid ' + x.ikon + '" aria-hidden="true"></i></span><span class="as-metin"><b>' + U.kac(x.baslik) + '</b><span>' + U.kac(x.metin) + '</span></span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a>').join('') + '</div></div>') : '');
  }
  /* Bugünün Öğünleri (PLAN §3.2): Öğün Hatırlatıcı motorunun günü, zaman çizelgesi olarak. Kapalıysa tek satır.
     Yeni üyede iki kolon gizli olduğundan kart kolonun dışındaki yuvaya çizilir */
  /* Ara öğünün saati hatırlatma noktasıdır; penceresi metinde yazar (sıra saatle tutarlı kalsın) */
  const zaman = (o) => DD.bicim.saat(o.planlanan);
  const pencere = (o) => (o.pencere && !o.sabit ? 'Pencere ' + DD.bicim.saat(o.pencere.bas) + '–' + DD.bicim.saat(o.pencere.bit) + '.' : '');
  const NOT_IKON = { oruc: 'fa-hourglass-half', gec: 'fa-moon', sessiz: 'fa-bell-slash', gercek: 'fa-clock-rotate-left' };
  const notHtml = (o) => o.notlar.filter((n) => !(n.kod === 'gercek' && ['yedi', 'atladi'].includes(o.durum))).map((n) => '<br><i class="fa-solid ' + (NOT_IKON[n.kod] || 'fa-circle-info') + '" aria-hidden="true"></i> ' + U.kac(n.metin)).join('') + (o.aktif ? '' : '<br><i class="fa-solid fa-bell-slash" aria-hidden="true"></i> Bu öğün için hatırlatma kapalı.');
  const rozet = (m, sinif) => ' <span class="rozet ' + sinif + ' zc-burada">' + m + '</span>';
  const protokolAd = (p) => (p === 'sirkadiyen' ? 'Sirkadiyen' : String(p).replace('-', ':'));
  function ogunKalem(o, h) {
    const odak = o.tur === h.odak;
    let metin = '', ek = '';
    if (o.durum === 'yedi') metin = '<i class="fa-solid fa-check" aria-hidden="true"></i> Yedin' + (o.gercek ? ' · ' + DD.bicim.saat(o.gercek) : '');
    else if (o.durum === 'atladi') metin = '<i class="fa-solid fa-xmark" aria-hidden="true"></i> Atladın';
    else if (o.durum === 'gecti') {
      metin = 'Saati geçti. Atladın mı?';
      ek = '<div class="segment kucuk ogun-durum" role="group" aria-label="' + U.kac(o.ad) + ' durumu"><button class="olumsuz" type="button" data-ogun-durum="atladi" data-ogun-kalem="' + o.tur + '" aria-pressed="false"><i class="fa-solid fa-xmark" aria-hidden="true"></i> Atladım</button><button type="button" data-ogun-durum="uydu" data-ogun-kalem="' + o.tur + '" data-ogun-zamansiz aria-pressed="false"><i class="fa-solid fa-check" aria-hidden="true"></i> Yedim</button></div>';
    } else if (odak) metin = U.kac(U.ogunOneri(o, h));
    else if (o.hatirlatma && o.hatirlatma !== o.planlanan) metin = 'Hatırlatma ' + DD.bicim.saat(o.hatirlatma) + '.';
    if (['simdi', 'siradaki', 'sonra'].includes(o.durum) && pencere(o)) metin += (metin ? '<br>' : '') + pencere(o);
    metin += notHtml(o);
    if (metin.startsWith('<br>')) metin = metin.slice(4);
    const sinif = o.durum === 'yedi' ? ' gecti' : o.durum === 'atladi' ? ' soluk' : odak ? ' secili' : '';
    const etiket = (o.durum === 'simdi' ? rozet('Şimdi', 'olumlu') : odak ? rozet('Sıradaki', 'olumlu') : '') + (o.kaynak === 'elle' ? rozet('Elle', 'pasif') : '');
    return '<div class="zc-kalem' + sinif + '"><div class="zc-zaman">' + zaman(o) + '</div><div class="zc-baslik">' + U.kac(o.ad) + etiket + '</div>' + (metin ? '<div class="zc-metin">' + metin + '</div>' : '') + ek + '</div>';
  }
  function ogunCiz(yeni) {
    const a = U.ogunAyar(), yer = yeni ? '#gbOgunYeni' : '#gbOgun';
    U.bas(yeni ? '#gbOgun' : '#gbOgunYeni', '');
    if (!a.acik) {
      U.bas(yer, '<div class="kart panel tam-kolon"><div class="kart-govde bosluksuz"><div class="ayar-liste"><div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-bell" aria-hidden="true"></i></span><div class="as-metin"><b>Öğün hatırlatıcısını aç</b><span>Öğün saatin geldiğinde site içinde haber verir; günün öğünleri burada sıralanır.</span></div><span class="as-eylem"><button class="dugme hayalet kucuk" type="button" data-oh-ac>Aç</button></span></div></div></div></div>');
      return false;
    }
    const h = U.ogunHesap(), l = h.ogunler.filter((o) => o.durum !== 'kapali'), od = l.find((o) => o.tur === h.odak);
    const kaynak = l.some((o) => o.kaynak === 'plan') ? 'Saatler diyetisyen planından' : h.oruc ? protokolAd(h.oruc.protokol) + ' yeme penceren ' + DD.bicim.saat(h.oruc.bas) + '–' + DD.bicim.saat(h.oruc.bit) : 'Kahvaltı ' + DD.bicim.saat(h.kahvalti) + ' saatine göre kuruldu';
    const hat = (a.once_dk ? 'hatırlatma ' + a.once_dk + ' dk önce' : 'hatırlatma öğün saatinde') + ', site içi';
    const yedim = od ? '<span class="not">Sıradaki: ' + U.kac(od.ad) + ' · ' + zaman(od) + '</span><button class="dugme birincil" type="button" data-ogun-durum="uydu" data-ogun-kalem="' + od.tur + '" data-oh-yedim><i class="fa-solid fa-check" aria-hidden="true"></i> Yedim</button>' : '<span class="not">Bugünün öğünleri tamam.</span>';
    U.bas(yer, kartHtml('fa-clock', 'Bugünün Öğünleri', kaynak + ' · ' + hat + '.', od ? '<div class="as-eylem">' + U.durum(od.durum === 'simdi' ? 'acik' : 'bekleyen', (od.durum === 'simdi' ? 'Şimdi ' : 'Sıradaki ') + zaman(od)) + '</div>' : '',
      '<div class="kart-govde"><div class="zaman-cizelgesi" aria-label="Bugünün öğün saatleri">' + l.map((o) => ogunKalem(o, h)).join('') + '</div></div>',
      bag('Saatleri düzenle', 'hesabim/ayarlar/#ogun', 'hayalet') + yedim));
    return true;
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-oh-ac]')) {
      U.ogunAyar().acik = true;
      U.kaydet(); ciz();
      DD.toast('Öğün hatırlatıcın açıldı. Saatlerini Ayarlar › Öğün Saatlerim’den düzenleyebilirsin.');
      return;
    }
    const y = e.target.closest('[data-oh-yedim]');
    if (y) {
      const o = U.ogunHesap().ogunler.find((x) => x.tur === y.dataset.ogunKalem);
      DD.toast((o ? o.ad : 'Öğün') + ' yendi olarak işaretlendi' + (U.aktifKaynak() ? '; günlük takibine yazıldı.' : '. Ne yediğini Günlük Takibim’e ekleyebilirsin.'));
    }
  });

  /* İlk adımlar (SH-6-12): üç boş durum aynı kartta; tamamlanan adım işaretlenir, üçü bitince kart kalkar */
  function ilkCiz(k) {
    const t = u.tercihler || {}, ek = U.yerel('gunlukEk', {});
    const adim = [
      ['fa-bullseye', 'İlk hedefini belirle', 'Birkaç soruyla hedefini ve tercihlerini seç; önerilerin buna göre kurulur.', !!(t.hedef || t.kcal), 'Hedef belirle', 'hesabim/hos-geldin/'],
      ['fa-list-check', 'Bir program seç', 'Sana uygun programı bul; bugünün öğünleri hemen hazır olsun.', !!k, 'Program bul', 'programlar/program-bul/'],
      ['fa-utensils', 'İlk öğününü ekle', 'Yediğini günlüğe ekle; Akıllı Tabak’tan ya da yalnız kaloriyle de olur.', Object.keys(ek).some((x) => ek[x].length) || (k && Object.keys(U.isaret(k, b)).length > 0), 'Öğün ekle', 'hesabim/gunluk-takibim/'],
    ];
    const kalan = adim.filter((x) => !x[3]).length;
    U.bas('#gbIlk', kalan ? kartHtml('fa-flag', 'İlk Adımların', (3 - kalan) + ' / 3 tamamlandı', '', '<div class="kart-govde bosluksuz"><div class="ayar-liste">' + adim.map((x) => '<div class="ayar-satir sarmali"><span class="as-ikon"><i class="fa-solid ' + (x[3] ? 'fa-check' : x[0]) + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + x[1] + '</b><span>' + x[2] + '</span></div><span class="as-eylem">' + (x[3] ? U.durum('cozulen', 'Tamam') : bag(x[4], x[5], 'hayalet kucuk')) + '</span></div>').join('') + '</div></div>') : '');
  }
  /* Kısa ilerleme grafiği (SH-11-7): son 8 ölçümün kilosu; yeme bozukluğu öyküsünde gösterilmez (K21.10) */
  function grafikCiz() {
    const l = (U.danisan().olcumler || []).filter((x) => x.kilo != null).slice(-8);
    if (duyarli || l.length < 2) { U.bas('#gbGrafik', ''); return; }
    const f = l[l.length - 1].kilo - l[0].kilo;
    U.bas('#gbGrafik', kartHtml('fa-chart-line', 'Kilo Gidişatın', 'Son ' + l.length + ' ölçüm · ' + U.tarih(l[0].tarih) + ' – ' + U.tarih(l[l.length - 1].tarih) + ' · ' + (Math.abs(f) < 0.05 ? 'değişim yok' : U.sayi(Math.abs(f), 1) + ' kg ' + (f < 0 ? 'azaldı' : 'arttı')), '', '<div class="kart-govde"><div id="gbGrafikCizim"></div></div>', bag('Bütün ölçümler', 'hesabim/saglik-dosyam/#olcum', 'hayalet')));
    const hk = U.danisan().hedef_kilo;
    DD.grafik.cizgi($('#gbGrafikCizim'), { baslik: 'Son ölçümlerde kilo', etiketler: l.map((x) => U.tarih(x.tarih).slice(0, 5)), seriler: [{ ad: 'Kilo', degerler: l.map((x) => x.kilo) }], hedef: hk || undefined });
  }
  document.addEventListener('dd:ogun', ciz);
  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-su-ekle]');
    if (!s) return;
    u.su.bugun_ml += Number(s.dataset.suEkle);
    U.kaydet(); ciz();
    DD.toast('Su kaydın eklendi.');
  });
  ciz();
})();
