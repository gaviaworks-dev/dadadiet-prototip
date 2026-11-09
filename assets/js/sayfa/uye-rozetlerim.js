/* Rozetlerim: kazanılanlar demo.uye.rozetler, katalog sayfa verisinden */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const { aileler, kademeler } = JSON.parse($('#rzKatalog').textContent);
  const u = U.uye(), b = U.bugun();
  const hepsi = aileler.flatMap((a) => a.rozetler.map((r) => ({ ...r, aile: a.ad })));
  const gun = (U.danisan().olcumler || []).length ? U.gunFarki(U.danisan().olcumler[0].tarih, U.bugun()) : 0;
  /* Kazanılanlar, puan ve kademe: meydan okuma rozeti verilince yeniden hesaplanır */
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
  let suzgec = 'kazanilan';

  const pk = (i, b, s, a) => '<div class="puan-karti"><span class="puan-bas"><i class="fa-solid ' + i + '" aria-hidden="true"></i> ' + b + '</span><b class="puan-sayi">' + s + '</b><span class="puan-alt">' + a + '</span></div>';
  const kart = (r) => {
    const k = kazanilan[r.ad];
    return '<button type="button" class="rozet-karti' + (k ? '' : ' kilitli') + '" data-rozet="' + U.kac(r.ad) + '"><span class="rozet-puan">+' + r.puan + '</span><span class="rozet-ikon"><i class="fa-solid ' + r.ikon + '" aria-hidden="true"></i></span><div><b>' + U.kac(r.ad) + '</b><span>' + (k ? 'Kazanıldı' : 'Yolda') + '</span></div><span class="rozet-not' + (k ? ' kazanildi' : '') + '"><i class="fa-solid ' + (k ? 'fa-circle-check' : 'fa-lock') + '" aria-hidden="true"></i><span class="rozet-sol">' + (k ? U.tarih(k.tarih) : 'Henüz kazanılmadı') + '</span></span></button>';
  };

  function koleksiyon() {
    U.bas('#rzOzet', pk('fa-medal', 'Kazanılan rozet', (u.rozetler || []).length, 'toplam ' + hepsi.length + ' rozetten') + pk('fa-star', 'Toplam puan', puan, 'rozetlerinden gelir') + pk('fa-calendar-check', 'Takip günü', gun, 'ilk ölçümünden bu yana') + pk('fa-stairs', 'Kademen', suanki[0], sonraki ? 'sıradaki ' + sonraki[0] : 'en üst basamak') + pk('fa-lock-open', 'Açık puan', U.sayi(hepsi.reduce((t, r) => t + r.puan, 0) - puan), 'kazanılmayı bekliyor'));
    const sayi = (a) => a.rozetler.filter((r) => kazanilan[r.ad]).length;
    U.bas('#rzSuzgec', '<button class="cip' + (suzgec === 'kazanilan' ? ' aktif' : '') + '" type="button" data-deger="kazanilan">Kazandıkların</button><button class="cip' + (suzgec === 'tumu' ? ' aktif' : '') + '" type="button" data-deger="tumu">Tümü</button>' + aileler.map((a) => '<button class="cip' + (suzgec === a.ad ? ' aktif' : '') + '" type="button" data-deger="' + U.kac(a.ad) + '">' + U.kac(a.ad) + ' <span class="cip-sayi">' + sayi(a) + ' / ' + a.rozetler.length + '</span></button>').join(''));
    const secili = suzgec === 'kazanilan' ? aileler.filter((a) => sayi(a)) : aileler.filter((a) => suzgec === 'tumu' || a.ad === suzgec);
    const listele = (a) => (suzgec === 'kazanilan' ? a.rozetler.filter((r) => kazanilan[r.ad]) : a.rozetler);
    U.bas('#rzAileler', secili.map((a) => '<div class="rozet-ailesi"><div class="rozet-aile-bas"><h3><i class="fa-solid ' + a.ikon + '" aria-hidden="true"></i> ' + U.kac(a.ad) + '</h3><span class="rozet-aile-sayi">' + sayi(a) + ' / ' + a.rozetler.length + '</span></div><p class="rozet-aile-not">' + U.kac(a.not) + '</p><div class="rozet-izgara">' + listele(a).map(kart).join('') + '</div></div>').join('') || U.bos({ ikon: 'fa-medal', baslik: 'Henüz rozetin yok', metin: 'İlk öğününü işaretlediğinde koleksiyonun başlar.', eylem: U.bag('Günlük takibe git', 'hesabim/gunluk-takibim/') }));
  }
  /* Seçili çip tek satırlı süzgeçte görünür alana gelir */
  const ortala = () => { const k = $('#rzSuzgec'), c = k.querySelector('.cip.aktif'); if (c) k.scrollTo({ left: c.offsetLeft - k.offsetLeft - (k.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' }); };
  function kademe() {
    $('#rzKademe').textContent = 'Şu Anki Kademen: ' + suanki[0];
    $('#rzSonraki').textContent = sonraki ? 'Sıradaki basamak ' + sonraki[0] + ': ' + Math.max(0, sonraki[1] - puan) + ' puan, ' + Math.max(0, sonraki[2] - gun) + ' gün ve ' + Math.max(0, sonraki[3] - hedef) + ' hedef kaldı.' : 'En üst basamaktasın.';
    const oran = sonraki ? Math.min(100, Math.round((puan / sonraki[1]) * 100)) : 100;
    U.bas('#rzKademeOlcer', '<div class="olcer hap" role="img" aria-label="Sıradaki kademeye ilerleme: yüzde ' + oran + '"><span data-oran="' + oran + '"></span></div>');
    U.bas('#rzMerdiven', kademeler.map((k) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + (k === suanki ? 'fa-location-dot' : kademeler.indexOf(k) < kademeler.indexOf(suanki) ? 'fa-check' : 'fa-lock') + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + k[0] + '</b><span>' + U.sayi(k[1]) + ' puan · ' + k[2] + ' gün · ' + k[3] + ' hedef</span></div>' + (k === suanki ? '<span class="as-eylem">' + U.durum('cozulen', 'Buradasın') + '</span>' : '') + '</div>').join(''));
  }
  function defter() {
    U.bas('#rzPuanAile', aileler.map((a) => {
      const l = a.rozetler.filter((r) => kazanilan[r.ad]), t = l.reduce((s, r) => s + r.puan, 0), m = a.rozetler.reduce((s, r) => s + r.puan, 0), oran = m ? Math.round((t / m) * 100) : 0;
      return '<div class="puan-karti"><span class="puan-bas"><i class="fa-solid ' + a.ikon + '" aria-hidden="true"></i> ' + U.kac(a.ad) + '</span><b class="puan-sayi">' + U.sayi(t) + '<small> / ' + U.sayi(m) + ' puan</small></b><div class="olcer hap" role="img" aria-label="' + U.kac(a.ad) + ' ailesi: yüzde ' + oran + '"><span data-oran="' + oran + '"></span></div><span class="puan-alt">' + l.length + ' / ' + a.rozetler.length + ' rozet</span></div>';
    }).join(''));
    const liste = (u.rozetler || []).slice().sort((a, b) => b.tarih.localeCompare(a.tarih));
    const gecmis = $('#rzPuanGecmis');
    gecmis.classList.toggle('puan-izgara', !!liste.length);
    U.bas(gecmis, liste.map((r) => { const c = hepsi.find((x) => x.ad === r.ad); return '<div class="puan-karti"><span class="puan-bas"><i class="' + U.kac(r.ikon) + '" aria-hidden="true"></i> ' + U.kac(r.ad) + '</span><b class="puan-sayi">+' + (c ? c.puan : 0) + '<small> puan</small></b><span class="puan-alt">' + U.tarih(r.tarih) + '</span><span class="puan-alt">' + U.kac(r.aciklama) + '</span></div>'; }).join('') || U.bos({ ikon: 'fa-star', baslik: 'Henüz puanın yok', metin: 'İlk rozetini kazandığında burada görünür.' }));
  }
  function liderlik() {
    const ayar = (U.yerel('ayarlar', {}).gorunurluk || {});
    const gorunur = ayar.liderlik !== false;
    const p = (u.ad || '').split(' ');
    U.bas('#rzLiderlik', gorunur
      ? '<div class="siralama-satir ben"><span class="siralama-sira">1</span><span class="siralama-kim"><b>' + U.kac(p[0] + ' ' + (p[1] || '').charAt(0) + '.') + ' <span class="rozet olumlu">Sen</span></b><small>@' + U.kullaniciAdi() + ' · ' + (u.rozetler || []).length + ' rozet</small></span><span class="siralama-puan"><b>' + puan + '</b><small>puan</small></span></div>'
      : U.bos({ ikon: 'fa-eye-slash', baslik: 'Adın tabloda görünmüyor', metin: 'Sıralamaya katılmak için görünürlüğünü aç.', eylem: U.bag('Hesap Ayarları', 'hesabim/ayarlar/') }));
    meydan();
  }
  /* Meydan okumalar: canlı tohumdaki iki kayıt (2026_10_31_160200_rozet_ve_meydan_okuma_tohumu). Elle işaretlenen ve su kaydından kendiliğinden işaretlenen */
  const MEYDAN = [
    { slug: '21-gun-sekersiz-yasam', ad: '21 Gün Şekersiz Yaşam', ikon: 'fa-cube', sure: 21, kural: 'elle', aciklama: '21 gün boyunca eklenmiş şeker içeren yiyecek ve içecekleri bırakmayı dene. Her akşam gününü işaretle; seri ne kadar uzarsa alışkanlık o kadar yerleşir.', gorev: 'Bugün eklenmiş şeker içeren yiyecek ya da içecek tüketmedim.', kaynak: ['WHO. Guideline: Sugars intake for adults and children (2015)', 'https://www.who.int/publications/i/item/9789241549028'] },
    { slug: '14-gunluk-su-icme-serueni', ad: '14 Günlük Su İçme Serüveni', ikon: 'fa-glass-water', sure: 14, kural: 'su', hedef: 2000, aciklama: '14 gün boyunca su içtiğin her bardağı Günlük Takibim’e kaydet. Gün içindeki toplam 2.000 ml’ye ulaştığında gün kendiliğinden işaretlenir.', gorev: 'Gün içinde en az 2.000 ml su içip Günlük Takibim’e kaydet.', kaynak: ['EFSA. Scientific Opinion on Dietary reference values for water. EFSA Journal 2010;8(3):1459', 'https://doi.org/10.2903/j.efsa.2010.1459'] },
  ];
  const katilim = () => U.yerel('meydan', {});
  const suMl = (t) => (t === b ? u.su.bugun_ml : ((u.su.hafta || []).find((x) => x.tarih === t) || {}).ml || 0);
  const isaretli = (m, k, t) => (m.kural === 'su' ? suMl(t) >= m.hedef : !!k.isaret[t]);
  function meydanDurum(m) {
    const k = katilim()[m.slug];
    if (!k) return { k: null };
    const son = U.gunEkle(k.baslangic, m.sure - 1), bit = b < son ? b : son;
    let n = 0, seri = 0, enUzun = 0;
    for (let t = k.baslangic; t <= bit; t = U.gunEkle(t, 1)) { if (isaretli(m, k, t)) { n++; seri++; enUzun = Math.max(enUzun, seri); } else if (t < b) seri = 0; }
    const durum = k.birakti ? 'birakti' : n >= m.sure ? 'tamam' : b > son ? 'bitti' : 'devam';
    return { k, son, n, seri, enUzun, durum, kalan: Math.max(0, U.gunFarki(b, son) + (b <= son ? 1 : 0)) };
  }
  function meydanKart(m) {
    const d = meydanDurum(m), k = d.k;
    const HAP = { devam: ['acik', 'Devam ediyor'], tamam: ['cozulen', 'Tamamladın'], bitti: ['kapali', 'Bitti'], birakti: ['kapali', 'Bıraktın'] };
    const hap = k ? U.durum(HAP[d.durum][0], HAP[d.durum][1]) : U.durum('bekleyen', 'Katılmadın');
    const s = (i, e, v) => '<div class="sayac"><i class="fa-solid ' + i + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + v + '</b></div></div>';
    let govde = '<p class="alan-yardim"><i class="fa-solid fa-list-check" aria-hidden="true"></i> <span><b>Bugünün görevi:</b> ' + U.kac(m.gorev) + '</span></p>';
    if (k) {
      const oran = Math.round((d.n / m.sure) * 100), bas = Math.max(0, Math.min(m.sure - 7, U.gunFarki(k.baslangic, b) - 3));
      let serit = '';
      for (let i = bas; i < Math.min(m.sure, bas + 7); i++) {
        const t = U.gunEkle(k.baslangic, i), x = isaretli(m, k, t);
        serit += '<div class="gun-kutu"><b>' + (i + 1) + '. gün</b><small>' + U.kisaTarih(t) + '</small>' + (x ? U.durum('cozulen', m.kural === 'su' ? 'Otomatik' : 'İşaretli') : t > b ? U.durum('kapali', 'Sırada') : t === b ? U.durum('acik', 'Bugün') : U.durum('bekleyen', 'İşaretsiz')) + '</div>';
      }
      govde += '<div class="sayac-izgara">' + s('fa-fire', 'Güncel seri', d.seri + ' gün') + s('fa-trophy', 'En uzun seri', d.enUzun + ' gün') + s('fa-circle-check', 'İşaretli gün', d.n + ' / ' + m.sure) + s('fa-flag-checkered', 'Kalan gün', d.kalan + ' gün') + s('fa-hand-pointer', 'İşaretleme', m.kural === 'su' ? 'Otomatik' : 'Elle') + '</div><div class="olcer hap" role="img" aria-label="İlerleme: yüzde ' + oran + '"><span data-oran="' + oran + '"></span></div><div class="gun-serit-liste" role="list" aria-label="Gün gün ilerleme">' + serit + '</div>';
    } else govde += '<p class="alan-yardim"><span>Henüz katılmadın. ' + m.sure + ' gün sürer; katıldığın gün 1. gün sayılır.</span></p>';
    govde += '<p class="alan-yardim"><span>Kaynak: <a href="' + m.kaynak[1] + '" rel="external noopener" target="_blank">' + U.kac(m.kaynak[0]) + '</a></span></p>';
    let alt = '';
    if (!k || d.durum === 'birakti' || d.durum === 'bitti') alt = '<button class="dugme birincil" type="button" data-meydan-katil="' + m.slug + '">' + (k ? 'Yeniden başla' : 'Meydan okumaya katıl') + '</button>';
    else if (d.durum === 'devam') {
      alt = '<button class="dugme hayalet tehlike" type="button" data-meydan-birak="' + m.slug + '">Meydan okumayı bırak</button>';
      if (m.kural === 'su') alt += U.bag('Günlük Takibi aç', 'hesabim/gunluk-takibim/#su');
      else {
        const dun = U.gunEkle(b, -1);
        if (dun >= k.baslangic && !k.isaret[dun]) alt += '<button class="dugme hayalet" type="button" data-meydan-isaret="' + m.slug + '" data-gun="' + dun + '">Dünü işaretle</button>';
        alt += k.isaret[b] ? '<button class="dugme hayalet" type="button" data-meydan-isaret="' + m.slug + '" data-gun="' + b + '">Bugünün işaretini geri al</button>' : '<button class="dugme birincil" type="button" data-meydan-isaret="' + m.slug + '" data-gun="' + b + '">Bugünü işaretle</button>';
      }
    }
    return '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid ' + m.ikon + '" aria-hidden="true"></i> ' + m.ad + '</h3><p>' + U.kac(m.aciklama) + '</p></div><div class="as-eylem">' + hap + '</div></div><div class="kart-govde">' + govde + '</div>' + (alt ? '<div class="kart-alt eylem">' + alt + '</div>' : '') + '</div>';
  }
  /* Meydan okuma bitince rozet (ES-HS-68): gün sayısı dolan meydan okumanın katalogdaki rozeti kazanılmış yazılır; bildirim U.bildirimler'den türer */
  const ROZET = { '21-gun-sekersiz-yasam': '21 Gün Şekersiz Yaşam', '14-gunluk-su-icme-serueni': '14 Günlük Su Serüveni' };
  function rozetVer() {
    const yeni = [];
    MEYDAN.forEach((m) => {
      const d = meydanDurum(m), c = hepsi.find((x) => x.ad === ROZET[m.slug]);
      if (!d.k || d.durum !== 'tamam' || !c || kazanilan[c.ad]) return;
      (u.rozetler = u.rozetler || []).push({ slug: m.slug, ad: c.ad, ikon: 'fa-solid ' + c.ikon, aciklama: c.aciklama, tarih: b });
      yeni.push(c);
    });
    if (!yeni.length) return false;
    U.kaydet(); hesapla();
    yeni.forEach((c) => DD.toast('Yeni rozet: ' + c.ad + ' (+' + c.puan + ' puan).'));
    return true;
  }
  function meydan() {
    if (rozetVer()) { koleksiyon(); kademe(); defter(); }
    U.bas('#rzMeydan', MEYDAN.map(meydanKart).join(''));
  }
  document.addEventListener('click', (e) => {
    const k = e.target.closest('[data-meydan-katil]'), bi = e.target.closest('[data-meydan-birak]'), is = e.target.closest('[data-meydan-isaret]');
    if (!k && !bi && !is) return;
    const l = katilim();
    if (k) { l[k.dataset.meydanKatil] = { baslangic: b, isaret: {} }; DD.toast('Meydan okumaya katıldın. Bugün 1. gün.'); }
    if (bi) { l[bi.dataset.meydanBirak].birakti = true; DD.toast('Meydan okumayı bıraktın.', 'uyari'); }
    if (is) { const x = l[is.dataset.meydanIsaret], t = is.dataset.gun; if (x.isaret[t]) { delete x.isaret[t]; DD.toast('İşaret geri alındı.'); } else { x.isaret[t] = true; DD.toast(t === b ? 'Bugün işaretlendi.' : 'Dün işaretlendi.'); } }
    U.kaydet(); meydan();
  });
  document.addEventListener('dd:suzgec', (e) => { if (e.target.id === 'rzSuzgec') { suzgec = e.detail.deger; koleksiyon(); ortala(); } });
  document.addEventListener('click', (e) => {
    const r = e.target.closest('.rozet-karti');
    if (!r) return;
    const c = hepsi.find((x) => x.ad === r.dataset.rozet);
    DD.toast(c.ad + ': ' + c.aciklama);
  });
  koleksiyon(); kademe(); defter(); liderlik();
})();
