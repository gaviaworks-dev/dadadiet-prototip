/* Rozetlerim: Gastro g-rozetlerim yapısı. Kazanılanlar demo.uye.rozetler, katalog sayfa verisinden.
   Ölçüsü kayıtlardan okunabilen rozet (ölçüm, kayıt, test, puan, üyelik süresi, meydan okuma) ilerleme çubuğu taşır;
   eşiği geçen rozet kazanılmış yazılır ve bildirimi U.bildirimler'den türer. */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const { aileler, kademeler, kademeIkon, liderlik: ORNEK } = JSON.parse($('#rzKatalog').textContent);
  const u = U.uye(), b = U.bugun();
  const hepsi = aileler.flatMap((a) => a.rozetler.map((r) => ({ ...r, aile: a.ad })));
  const olcumler = (U.danisan().olcumler || []).slice().sort((x, y) => String(x.tarih).localeCompare(String(y.tarih)));
  const gun = olcumler.length ? U.gunFarki(olcumler[0].tarih, b) : 0;
  const kayit = u.kaydedilenler || {}, kayitSayi = Object.keys(kayit).reduce((t, k) => t + (Array.isArray(kayit[k]) ? kayit[k].length : 0), 0);
  const testSayi = new Set((u.test_sonuclari || []).map((t) => t.test)).size;
  const ik = (i, s) => '<i class="fa-solid ' + i + (s ? ' ' + s : '') + '" aria-hidden="true"></i>';
  const kIkon = (k) => kademeIkon[k[0]] || 'fa-medal';

  let kazanilan, puan, hedef, suanki, sonraki;
  function hesapla() {
    kazanilan = {};
    (u.rozetler || []).forEach((r) => { kazanilan[r.ad] = r; });
    puan = hepsi.filter((r) => kazanilan[r.ad]).reduce((t, r) => t + r.puan, 0);
    hedef = (u.rozetler || []).filter((r) => r.slug === 'ilk-hedef').length;
    suanki = kademeler.filter((k) => puan >= k[1] && gun >= k[2] && hedef >= k[3]).pop() || kademeler[0];
    sonraki = kademeler[kademeler.indexOf(suanki) + 1];
  }
  hesapla();

  /* Meydan okumalar: canlı tohumdaki iki kayıt (2026_10_31_160200_rozet_ve_meydan_okuma_tohumu) */
  const MEYDAN = [
    { slug: '21-gun-sekersiz-yasam', rozet: '21 Gün Şekersiz Yaşam', ad: '21 Gün Şekersiz Yaşam', ikon: 'fa-cube', sure: 21, kural: 'elle', aciklama: '21 gün boyunca eklenmiş şeker içeren yiyecek ve içecekleri bırakmayı dene. Her akşam gününü işaretle; seri ne kadar uzarsa alışkanlık o kadar yerleşir.', gorev: 'Bugün eklenmiş şeker içeren yiyecek ya da içecek tüketmedim.', kaynak: ['WHO. Guideline: Sugars intake for adults and children (2015)', 'https://www.who.int/publications/i/item/9789241549028'] },
    { slug: '14-gunluk-su-icme-serueni', rozet: '14 Günlük Su Serüveni', ad: '14 Günlük Su İçme Serüveni', ikon: 'fa-glass-water', sure: 14, kural: 'su', hedef: 2000, aciklama: '14 gün boyunca su içtiğin her bardağı Günlük Takibim’e kaydet. Gün içindeki toplam 2.000 ml’ye ulaştığında gün kendiliğinden işaretlenir.', gorev: 'Gün içinde en az 2.000 ml su içip Günlük Takibim’e kaydet.', kaynak: ['EFSA. Scientific Opinion on Dietary reference values for water. EFSA Journal 2010;8(3):1459', 'https://doi.org/10.2903/j.efsa.2010.1459'] },
  ];
  const katilim = () => U.yerel('meydan', {});
  const suMl = (t) => (t === b ? u.su.bugun_ml : ((u.su.hafta || []).find((x) => x.tarih === t) || {}).ml || 0);
  const isaretli = (m, k, t) => (m.kural === 'su' ? suMl(t) >= m.hedef : !!k.isaret[t]);
  function meydanDurum(m) {
    const k = katilim()[m.slug];
    if (!k) return { k: null, n: 0 };
    const son = U.gunEkle(k.baslangic, m.sure - 1), bit = b < son ? b : son;
    let n = 0, seri = 0, enUzun = 0;
    for (let t = k.baslangic; t <= bit; t = U.gunEkle(t, 1)) { if (isaretli(m, k, t)) { n++; seri++; enUzun = Math.max(enUzun, seri); } else if (t < b) seri = 0; }
    const durum = k.birakti ? 'birakti' : n >= m.sure ? 'tamam' : b > son ? 'bitti' : 'devam';
    return { k, son, n, seri, enUzun, durum, kalan: Math.max(0, U.gunFarki(b, son) + (b <= son ? 1 : 0)) };
  }

  /* Kayıtlardan okunan ölçüler: d değer, h eşik, t eşiğin geçildiği gün */
  const OLCU = {
    'Ölçüm Günlüğü': () => ({ d: olcumler.length, h: 10, t: olcumler[9] && olcumler[9].tarih, birim: 'ölçüm' }),
    'Ölçüm Arşivi': () => ({ d: olcumler.length, h: 50, birim: 'ölçüm' }),
    'Test Çözücü': () => ({ d: testSayi, h: 3, birim: 'test' }),
    'Arşivci': () => ({ d: kayitSayi, h: 25, birim: 'içerik' }),
    'Besin Kâşifi': () => ({ d: (kayit.besinler || []).length, h: 50, birim: 'besin' }),
    'Bir Yıldır Buradasın': () => ({ d: gun, h: 365, birim: 'gün' }),
    'Bin Puan': () => ({ d: puan, h: 1000, birim: 'puan' }),
  };
  MEYDAN.forEach((m) => { OLCU[m.rozet] = () => { const d = meydanDurum(m); return { d: d.n, h: m.sure, t: d.durum === 'tamam' ? b : null, birim: 'gün' }; }; });
  const durumu = (r) => {
    if (kazanilan[r.ad]) return { tur: 'kazanildi' };
    const f = OLCU[r.ad], o = f && f();
    return o && o.d > 0 ? { tur: 'yolda', o, oran: Math.min(99, Math.round((o.d / o.h) * 100)) } : { tur: 'kilitli' };
  };

  /* Eşiği geçen rozet kazanılmış yazılır (ES-HS-68) */
  function rozetVer() {
    const yeni = [];
    hepsi.forEach((c) => {
      const f = OLCU[c.ad], o = f && f();
      if (!o || kazanilan[c.ad] || o.d < o.h) return;
      (u.rozetler = u.rozetler || []).push({ slug: c.ad.toLocaleLowerCase('tr').replace(/[^a-z0-9ğüşıöç]+/g, '-'), ad: c.ad, ikon: 'fa-solid ' + c.ikon, aciklama: c.aciklama, tarih: o.t || b });
      kazanilan[c.ad] = true;
      yeni.push(c);
    });
    if (!yeni.length) return false;
    U.kaydet(); hesapla();
    yeni.forEach((c) => DD.toast('Yeni rozet: ' + c.ad + ' (+' + c.puan + ' puan).'));
    return true;
  }

  /* ── Koleksiyon ── */
  let suzgec = 'tumu';
  const hap = (i, s, n, metin) => '<span class="galeri-hap">' + ik(i, s) + ' <b>' + n + '</b> ' + metin + '</span>';
  function kart(r) {
    const d = durumu(r), kz = kazanilan[r.ad];
    const ipucu = '<span class="rozet-ipucu"><b>' + U.kac(r.ad) + ' · ' + r.puan + ' puan</b><p>' + U.kac(r.aciklama) + '</p><span class="nasil">'
      + (d.tur === 'kazanildi' ? ik('fa-circle-check') + ' ' + U.tarih(kz.tarih) : d.tur === 'yolda' ? ik('fa-hourglass-half') + ' ' + U.sayi(d.o.d) + ' / ' + U.sayi(d.o.h) + ' ' + d.o.birim : ik('fa-lock') + ' Henüz başlamadın') + '</span></span>';
    if (d.tur === 'kazanildi') return '<button type="button" class="rozet-karti" data-rozet="' + U.kac(r.ad) + '"><span class="rozet-puan">+' + r.puan + '</span><span class="rozet-ikon">' + ik(r.ikon) + '</span><div><b>' + U.kac(r.ad) + '</b><span>Kazanıldı</span></div><span class="rozet-not kazanildi">' + ik('fa-circle-check') + '<span class="rozet-cubuk"><span data-oran="100"></span></span><span class="rozet-sol">' + U.tarih(kz.tarih) + '</span></span>' + ipucu + '</button>';
    const yolda = d.tur === 'yolda';
    return '<button type="button" class="rozet-karti kilitli" data-rozet="' + U.kac(r.ad) + '"><span class="rozet-puan">' + ik('fa-lock') + '+' + r.puan + '</span><span class="rozet-ikon">' + ik(r.ikon) + '</span><div><b>' + U.kac(r.ad) + '</b><span>' + (yolda ? 'Yolda' : 'Kilitli') + '</span></div><span class="rozet-not kilitli">' + ik(yolda ? 'fa-hourglass-half' : 'fa-circle-minus') + '<span class="rozet-cubuk"><span data-oran="' + (yolda ? d.oran : 0) + '"></span></span><span class="rozet-sol">' + (yolda ? U.sayi(d.o.d) + ' / ' + U.sayi(d.o.h) + ' ' + d.o.birim : 'Henüz başlamadın') + '</span></span>' + ipucu + '</button>';
  }
  function koleksiyon() {
    const say = { kazanildi: 0, yolda: 0, kilitli: 0 };
    hepsi.forEach((r) => { say[durumu(r).tur]++; });
    U.bas('#rzStat', hap('fa-circle-check', 'hap-kazanildi', say.kazanildi, 'kazanıldı') + hap('fa-hourglass-half', 'hap-yolda', say.yolda, 'yolda') + hap('fa-lock', 'hap-olcusuz', say.kilitli, 'kilitli') + hap('fa-coins', 'hap-kazanildi', U.sayi(puan), 'puan'));
    U.bas('#rzNot', 'Sayılar kayıtlarından okundu: <b>' + olcumler.length + '</b> ölçüm, <b>' + gun + '</b> takip günü, <b>' + kayitSayi + '</b> kaydedilen içerik, <b>' + testSayi + '</b> farklı test. <b>' + say.yolda + '</b> rozet yolda; ilerledikçe çubukları dolar.');
    const kz = (a) => a.rozetler.filter((r) => kazanilan[r.ad]).length;
    U.bas('#rzCips', '<button class="cip' + (suzgec === 'tumu' ? ' aktif' : '') + '" type="button" data-deger="tumu" aria-pressed="' + (suzgec === 'tumu') + '">Tümü</button>' + aileler.map((a) => '<button class="cip' + (suzgec === a.ad ? ' aktif' : '') + '" type="button" data-deger="' + U.kac(a.ad) + '" aria-pressed="' + (suzgec === a.ad) + '">' + ik(a.ikon) + ' ' + U.kac(a.ad) + ' ' + kz(a) + '/' + a.rozetler.length + '</button>').join(''));
    const secili = aileler.filter((a) => suzgec === 'tumu' || a.ad === suzgec);
    U.bas('#rzFiltre', '<span class="suzgec-ikon">' + ik(suzgec === 'tumu' ? 'fa-medal' : secili[0].ikon) + '</span><span class="suzgec-metin"><b>' + (suzgec === 'tumu' ? 'Tüm aileler' : U.kac(suzgec)) + '</b><small>' + secili.length + ' aile · ' + secili.reduce((t, a) => t + a.rozetler.length, 0) + ' rozet · ' + secili.reduce((t, a) => t + kz(a), 0) + ' kazanıldı</small></span>' + (suzgec === 'tumu' ? '' : '<button class="galeri-temizle" type="button" data-suzgec-temizle>' + ik('fa-xmark') + ' Süzgeci temizle</button>'));
    U.bas('#rzGaleri', secili.map((a) => '<div class="rozet-ailesi"><div class="rozet-aile-bas"><h3>' + ik(a.ikon) + ' ' + U.kac(a.ad) + '</h3><span class="rozet-aile-sayi">' + kz(a) + ' / ' + a.rozetler.length + '</span></div><p class="rozet-aile-not">' + U.kac(a.not) + '</p><div class="rozet-izgara">' + a.rozetler.map(kart).join('') + '</div></div>').join(''));
  }

  /* ── Kademem ── */
  const pk = (i, bas, s, alt) => '<div class="puan-karti"><span class="puan-bas">' + ik(i) + ' ' + bas + '</span><b class="puan-sayi">' + s + '</b><span class="puan-alt">' + alt + '</span></div>';
  function kademe() {
    const sira = kademeler.indexOf(suanki) + 1, gecti = puan >= suanki[1] && gun >= suanki[2] && hedef >= suanki[3];
    U.bas('#rzRank', '<div class="ozet-bas"><h3>' + ik(kIkon(suanki)) + ' ' + suanki[0] + '</h3><span class="rozet olumlu">' + ik('fa-medal') + ' ' + (u.rozetler || []).length + ' rozet</span></div><b>' + sira + '. kademe</b><p>' + suanki[0] + ' kademesi <b>' + U.sayi(suanki[1]) + ' puan</b>, <b>' + suanki[2] + ' takip günü</b> ve <b>' + suanki[3] + ' hedef</b> istiyor; ' + (gecti ? 'üçünü de geçtin.' : 'henüz üçünü birden karşılamıyorsun.')
      + (sonraki ? ' Sıradaki kademe <b>' + sonraki[0] + '</b>: ' + U.sayi(sonraki[1]) + ' puan, ' + sonraki[2] + ' gün ve ' + sonraki[3] + ' hedef. ' + U.sayi(Math.max(0, sonraki[1] - puan)) + ' puan, ' + Math.max(0, sonraki[2] - gun) + ' gün ve ' + Math.max(0, sonraki[3] - hedef) + ' hedef kaldı.' : ' Merdivenin son basamağındasın.')
      + '</p><div class="ozet-kunye"><span>Toplam puan: <b>' + U.sayi(puan) + '</b></span><span>Takip günü: <b>' + gun + '</b></span><span>Ulaşılan hedef: <b>' + hedef + '</b></span></div>');
    const i = kademeler.indexOf(suanki);
    U.bas('#rzLadder', kademeler.map((k, n) => {
      const d = n < i ? 'tamam' : n === i ? 'simdiki' : 'kilitli';
      return '<div class="basamak ' + d + '" role="listitem">' + ik(d === 'tamam' ? 'fa-check' : d === 'simdiki' ? 'fa-location-dot' : 'fa-lock', 'basamak-kilit') + '<div class="basamak-ikon">' + ik(kIkon(k)) + '</div><b>' + k[0] + '</b><span>' + U.sayi(k[1]) + ' puan · ' + k[2] + ' gün</span><span class="basamak-sayi">' + (d === 'simdiki' ? 'Buradasın' : k[3] + ' hedef') + '</span></div>';
    }).join(''));
    const katildigi = MEYDAN.filter((m) => katilim()[m.slug]).length;
    U.bas('#rzOlcu', pk('fa-coins', 'Toplam puan', U.sayi(puan), 'kademenin birinci ölçütü') + pk('fa-calendar-check', 'Takip günü', gun, 'kademenin ikinci ölçütü') + pk('fa-bullseye', 'Ulaşılan hedef', hedef, 'kademenin üçüncü ölçütü') + pk('fa-weight-scale', 'Kayıtlı ölçüm', olcumler.length, 'ilk ölçümünden bu yana')
      + pk('fa-medal', 'Kazanılan rozet', (u.rozetler || []).length, 'toplam ' + hepsi.length + ' rozetten') + pk('fa-bookmark', 'Kaydedilen içerik', kayitSayi, 'tarif, besin ve program') + pk('fa-list-check', 'Çözülen test', testSayi, 'farklı test') + pk('fa-trophy', 'Meydan okuma', katildigi, 'katıldığın, ' + MEYDAN.length + ' meydan okumadan'));
  }

  /* ── Puan Defteri ── */
  function defter() {
    const tavan = hepsi.reduce((t, r) => t + r.puan, 0), adet = (u.rozetler || []).length;
    U.bas('#rzPuanKart', '<div class="ozet-bas"><h3>' + ik('fa-coins') + ' Toplam Puanın</h3><span class="rozet olumlu">' + ik('fa-medal') + ' ' + adet + ' rozet</span></div><b>' + U.sayi(puan) + '</b><p>' + hepsi.length + ' rozetin ' + adet + '’i sende. Kalan ' + (hepsi.length - adet) + ' rozeti kazandıkça puanın burada birikir.</p><div class="ozet-kunye"><span>Kademe: <b>' + suanki[0] + '</b></span><span>Liderlik sırası: <b>' + (benSira() ? '#' + benSira() : 'gizli') + '</b></span><span>Açık puan: <b>' + U.sayi(tavan - puan) + '</b></span></div>');
    $('#rzAileNot').textContent = 'Her ailenin kendi puan tavanı var; çubuk o ailenin ne kadarını topladığını gösterir. ' + aileler.length + ' ailenin tamamı ' + U.sayi(tavan) + ' puan eder.';
    U.bas('#rzPuanAile', aileler.map((a) => {
      const l = a.rozetler.filter((r) => kazanilan[r.ad]), t = l.reduce((s, r) => s + r.puan, 0), m = a.rozetler.reduce((s, r) => s + r.puan, 0), oran = m ? Math.round((t / m) * 100) : 0;
      return '<div class="puan-karti"><span class="puan-bas">' + ik(a.ikon) + ' ' + U.kac(a.ad) + '</span><b class="puan-sayi">' + U.sayi(t) + '</b><span class="puan-alt">' + l.length + ' / ' + a.rozetler.length + ' rozet · ailenin tamamı ' + U.sayi(m) + ' puan</span><div class="olcer hap" role="img" aria-label="' + U.kac(a.ad) + ' ailesi: yüzde ' + oran + '"><span data-oran="' + oran + '"></span></div></div>';
    }).join(''));
    const liste = (u.rozetler || []).slice().sort((x, y) => y.tarih.localeCompare(x.tarih));
    $('#rzDefterNot').textContent = 'En yeni üstte. Tarih, rozetin kazanıldığı gündür. ' + (liste.length ? 'Toplam ' + liste.length + ' kazanımın hepsi burada.' : 'Henüz kazanımın yok; ilk rozetini kazandığında defter dolmaya başlar.');
    U.bas('#rzDefter', liste.length
      ? '<div class="tablo-kap cerceveli" role="region" aria-label="Kazanım defteri" tabindex="0"><table class="tablo"><caption class="yalniz-okuyucu">Kazandığın rozetler, tarihleri, aileleri ve puanları</caption><thead><tr><th scope="col">Tarih</th><th scope="col">Rozet</th><th scope="col">Aile</th><th scope="col">Puan</th></tr></thead><tbody>'
        + liste.map((r) => { const c = hepsi.find((x) => x.ad === r.ad) || {}; return '<tr><th scope="row">' + U.tarih(r.tarih) + '</th><td>' + U.kac(r.ad) + '</td><td>' + U.kac(c.aile || '') + '</td><td>+' + (c.puan || 0) + '</td></tr>'; }).join('') + '</tbody></table></div>'
      : U.bos({ ikon: 'fa-lock', baslik: 'Henüz kazanımın yok', metin: 'İlk rozetini kazandığında tarihi, ailesi ve puanı burada birikmeye başlar.', eylem: U.bag('Günlük takibe git', 'hesabim/gunluk-takibim/') }));
  }

  /* ── Liderlik: çevren (üstte beş, altta iki), diğer satırlar prototip örneği ── */
  const gorunur = () => ((U.yerel('ayarlar', {}).gorunurluk || {}).liderlik !== false);
  function tablo() {
    const p = (u.ad || '').split(' ');
    const satirlar = ORNEK.map((s) => ({ ad: s[0], uad: s[1], rozet: s[2], puan: s[3] }));
    if (gorunur()) satirlar.push({ ad: p[0] + ' ' + (p[1] || '').charAt(0) + '.', uad: U.kullaniciAdi(), rozet: (u.rozetler || []).length, puan, ben: true });
    return satirlar.sort((x, y) => y.puan - x.puan || (y.ben ? 1 : 0) - (x.ben ? 1 : 0));
  }
  const benSira = () => { const l = tablo(), i = l.findIndex((s) => s.ben); return i < 0 ? 0 : i + 1; };
  function liderlik() {
    U.bas('#rzLdTablo', tablo().map((s, n) => '<div class="siralama-satir' + (s.ben ? ' ben' : '') + '"' + (s.ben ? ' aria-current="true"' : '') + '><span class="siralama-sira">' + (n + 1) + '</span><span class="siralama-kim"><b>' + U.kac(s.ad) + (s.ben ? ' <span class="rozet olumlu">Sen</span>' : '') + '</b><small>@' + U.kac(s.uad) + ' · ' + s.rozet + ' rozet' + (s.ben ? '' : ' · prototip örneği') + '</small></span><span class="siralama-puan"><b>' + U.sayi(s.puan) + '</b><small>puan</small></span></div>').join('')
      + (gorunur() ? '' : U.bos({ ikon: 'fa-eye-slash', baslik: 'Adın tabloda görünmüyor', metin: 'Sıralamaya katılmak için görünürlüğünü aç.', eylem: U.bag('Hesap Ayarları', 'hesabim/ayarlar/') })));
  }

  /* ── Meydan okumalar ── */
  const ikonDugme = (ad, i, ek) => '<button class="ikon-dugme" type="button" aria-label="' + ad + '"' + ek + '>' + ik(i) + '</button>';
  function meydanKart(m) {
    const d = meydanDurum(m), k = d.k;
    const HAP = { devam: ['acik', 'Devam ediyor'], tamam: ['cozulen', 'Tamamladın'], bitti: ['kapali', 'Bitti'], birakti: ['kapali', 'Bıraktın'] };
    const hp = k ? U.durum(HAP[d.durum][0], HAP[d.durum][1]) : U.durum('bekleyen', 'Katılmadın');
    const s = (i, e, v) => '<div class="sayac">' + ik(i) + '<div><span>' + e + '</span><b>' + v + '</b></div></div>';
    let govde = '<p class="alan-yardim">' + ik('fa-list-check') + ' <span><b>Bugünün görevi:</b> ' + U.kac(m.gorev) + '</span></p>';
    if (k) {
      const oran = Math.round((d.n / m.sure) * 100), bas = Math.max(0, Math.min(m.sure - 7, U.gunFarki(k.baslangic, b) - 3));
      let serit = '';
      for (let n = bas; n < Math.min(m.sure, bas + 7); n++) {
        const t = U.gunEkle(k.baslangic, n), x = isaretli(m, k, t);
        serit += '<div class="gun-kutu"><b>' + (n + 1) + '. gün</b><small>' + U.kisaTarih(t) + '</small>' + (x ? U.durum('cozulen', m.kural === 'su' ? 'Otomatik' : 'İşaretli') : t > b ? U.durum('kapali', 'Sırada') : t === b ? U.durum('acik', 'Bugün') : U.durum('bekleyen', 'İşaretsiz')) + '</div>';
      }
      govde += '<div class="sayac-izgara">' + s('fa-fire', 'Güncel seri', d.seri + ' gün') + s('fa-trophy', 'En uzun seri', d.enUzun + ' gün') + s('fa-circle-check', 'İşaretli gün', d.n + ' / ' + m.sure) + s('fa-flag-checkered', 'Kalan gün', d.kalan + ' gün') + s('fa-hand-pointer', 'İşaretleme', m.kural === 'su' ? 'Otomatik' : 'Elle') + '</div><div class="olcer hap" role="img" aria-label="İlerleme: yüzde ' + oran + '"><span data-oran="' + oran + '"></span></div><div class="gun-serit-liste" role="list" aria-label="Gün gün ilerleme">' + serit + '</div>';
    } else govde += '<p class="alan-yardim"><span>Henüz katılmadın. ' + m.sure + ' gün sürer; katıldığın gün 1. gün sayılır.</span></p>';
    govde += '<p class="alan-yardim"><span>Kaynak: <a href="' + m.kaynak[1] + '" rel="external noopener" target="_blank">' + U.kac(m.kaynak[0]) + '</a></span></p>';
    let alt = '';
    if (!k || d.durum === 'birakti' || d.durum === 'bitti') alt = '<button class="dugme birincil" type="button" data-meydan-katil="' + m.slug + '">' + (k ? 'Yeniden başla' : 'Meydan okumaya katıl') + '</button>';
    else if (d.durum === 'devam') {
      alt = ikonDugme('Meydan okumayı bırak', 'fa-xmark', ' data-meydan-birak="' + m.slug + '"');
      if (m.kural === 'su') alt += '<a class="ikon-dugme" href="' + DD.kok + 'hesabim/gunluk-takibim/#su" aria-label="Su kaydına git">' + ik('fa-glass-water') + '</a>';
      else {
        const dun = U.gunEkle(b, -1);
        if (dun >= k.baslangic && !k.isaret[dun]) alt += ikonDugme('Dünü işaretle', 'fa-check', ' data-meydan-isaret="' + m.slug + '" data-gun="' + dun + '"');
        alt += k.isaret[b] ? ikonDugme('Bugünün işaretini geri al', 'fa-rotate-left', ' data-meydan-isaret="' + m.slug + '" data-gun="' + b + '"') : '<button class="dugme birincil" type="button" data-meydan-isaret="' + m.slug + '" data-gun="' + b + '">Bugünü işaretle</button>';
      }
    }
    return '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik">' + ik(m.ikon) + ' ' + m.ad + '</h3><p>' + U.kac(m.aciklama) + '</p></div><div class="as-eylem">' + hp + '</div></div><div class="kart-govde">' + govde + '</div>' + (alt ? '<div class="kart-alt eylem">' + alt + '</div>' : '') + '</div>';
  }
  function meydan() { U.bas('#rzMeydan', MEYDAN.map(meydanKart).join('')); }

  function hepsiniCiz() { rozetVer(); koleksiyon(); kademe(); defter(); liderlik(); meydan(); }

  document.addEventListener('click', (e) => {
    const k = e.target.closest('[data-meydan-katil]'), bi = e.target.closest('[data-meydan-birak]'), is = e.target.closest('[data-meydan-isaret]');
    if (!k && !bi && !is) return;
    const l = katilim();
    if (k) { l[k.dataset.meydanKatil] = { baslangic: b, isaret: {} }; DD.toast('Meydan okumaya katıldın. Bugün 1. gün.'); }
    if (bi) { l[bi.dataset.meydanBirak].birakti = true; DD.toast('Meydan okumayı bıraktın.', 'uyari'); }
    if (is) { const x = l[is.dataset.meydanIsaret], t = is.dataset.gun; if (x.isaret[t]) { delete x.isaret[t]; DD.toast('İşaret geri alındı.'); } else { x.isaret[t] = true; DD.toast(t === b ? 'Bugün işaretlendi.' : 'Dün işaretlendi.'); } }
    U.kaydet(); hepsiniCiz();
  });
  document.addEventListener('dd:suzgec', (e) => { if (e.target.id === 'rzCips') { suzgec = e.detail.deger; koleksiyon(); } });
  /* Rozet kartı: dokununca ipucu açılır (Gastro .rozet-karti.ipucu-acik), dışarı dokunmak ve Esc kapatır */
  const kapat = (h) => document.querySelectorAll('.rozet-karti.ipucu-acik').forEach((x) => { if (x !== h) x.classList.remove('ipucu-acik'); });
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-suzgec-temizle]')) { suzgec = 'tumu'; koleksiyon(); return; }
    const r = e.target.closest('.rozet-karti');
    kapat(r);
    if (r) r.classList.toggle('ipucu-acik');
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') kapat(null); });
  hepsiniCiz();
})();
