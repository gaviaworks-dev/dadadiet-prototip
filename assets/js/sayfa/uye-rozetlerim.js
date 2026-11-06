/* Rozetlerim: kazanılanlar demo.uye.rozetler, katalog sayfa verisinden */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const { aileler, kademeler } = JSON.parse($('#rzKatalog').textContent);
  const u = U.uye();
  const kazanilan = {};
  (u.rozetler || []).forEach((r) => { kazanilan[r.ad] = r; });
  const hepsi = aileler.flatMap((a) => a.rozetler.map((r) => ({ ...r, aile: a.ad })));
  const puan = hepsi.filter((r) => kazanilan[r.ad]).reduce((t, r) => t + r.puan, 0);
  const gun = (U.danisan().olcumler || []).length ? U.gunFarki(U.danisan().olcumler[0].tarih, U.bugun()) : 0;
  const hedef = (u.rozetler || []).filter((r) => r.slug === 'ilk-hedef').length;
  const suanki = kademeler.filter((k) => puan >= k[1] && gun >= k[2] && hedef >= k[3]).pop() || kademeler[0];
  const sonraki = kademeler[kademeler.indexOf(suanki) + 1];
  let suzgec = 'tumu';

  const pk = (i, b, s, a) => '<div class="puan-karti"><span class="puan-bas"><i class="fa-solid ' + i + '" aria-hidden="true"></i> ' + b + '</span><b class="puan-sayi">' + s + '</b><span class="puan-alt">' + a + '</span></div>';
  const kart = (r) => {
    const k = kazanilan[r.ad];
    return '<button type="button" class="rozet-karti' + (k ? '' : ' kilitli') + '" data-rozet="' + U.kac(r.ad) + '"><span class="rozet-puan">+' + r.puan + '</span><span class="rozet-ikon"><i class="fa-solid ' + r.ikon + '" aria-hidden="true"></i></span><div><b>' + U.kac(r.ad) + '</b><span>' + (k ? 'Kazanıldı' : 'Yolda') + '</span></div><span class="rozet-not' + (k ? ' kazanildi' : '') + '"><i class="fa-solid ' + (k ? 'fa-circle-check' : 'fa-lock') + '" aria-hidden="true"></i><span class="rozet-sol">' + (k ? U.tarih(k.tarih) : 'Henüz kazanılmadı') + '</span></span></button>';
  };

  function koleksiyon() {
    U.bas('#rzOzet', pk('fa-medal', 'Kazanılan rozet', (u.rozetler || []).length, 'toplam ' + hepsi.length + ' rozetten') + pk('fa-star', 'Toplam puan', puan, 'rozetlerinden gelir') + pk('fa-calendar-check', 'Takip günü', gun, 'ilk ölçümünden bu yana') + pk('fa-stairs', 'Kademen', suanki[0], sonraki ? 'sıradaki ' + sonraki[0] : 'en üst basamak') + pk('fa-lock-open', 'Açık puan', U.sayi(hepsi.reduce((t, r) => t + r.puan, 0) - puan), 'kazanılmayı bekliyor'));
    const sayi = (a) => a.rozetler.filter((r) => kazanilan[r.ad]).length;
    U.bas('#rzSuzgec', '<button class="cip' + (suzgec === 'tumu' ? ' aktif' : '') + '" type="button" data-deger="tumu">Tümü</button>' + aileler.map((a) => '<button class="cip' + (suzgec === a.ad ? ' aktif' : '') + '" type="button" data-deger="' + U.kac(a.ad) + '">' + U.kac(a.ad) + ' <span class="cip-sayi">' + sayi(a) + ' / ' + a.rozetler.length + '</span></button>').join(''));
    U.bas('#rzAileler', aileler.filter((a) => suzgec === 'tumu' || a.ad === suzgec).map((a) => '<div class="rozet-ailesi"><div class="rozet-aile-bas"><h3><i class="fa-solid ' + a.ikon + '" aria-hidden="true"></i> ' + U.kac(a.ad) + '</h3><span class="rozet-aile-sayi">' + sayi(a) + ' / ' + a.rozetler.length + '</span></div><p class="rozet-aile-not">' + U.kac(a.not) + '</p><div class="rozet-izgara">' + a.rozetler.map(kart).join('') + '</div></div>').join(''));
  }
  function kademe() {
    $('#rzKademe').textContent = 'Şu anki kademen: ' + suanki[0];
    $('#rzSonraki').textContent = sonraki ? 'Sıradaki basamak ' + sonraki[0] + ': ' + Math.max(0, sonraki[1] - puan) + ' puan, ' + Math.max(0, sonraki[2] - gun) + ' gün ve ' + Math.max(0, sonraki[3] - hedef) + ' hedef kaldı.' : 'En üst basamaktasın.';
    const oran = sonraki ? Math.min(100, Math.round((puan / sonraki[1]) * 100)) : 100;
    U.bas('#rzKademeOlcer', '<div class="olcer hap" role="img" aria-label="Sıradaki kademeye ilerleme: yüzde ' + oran + '"><span data-oran="' + oran + '"></span></div>');
    U.bas('#rzMerdiven', kademeler.map((k) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + (k === suanki ? 'fa-location-dot' : kademeler.indexOf(k) < kademeler.indexOf(suanki) ? 'fa-check' : 'fa-lock') + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + k[0] + '</b><span>' + U.sayi(k[1]) + ' puan · ' + k[2] + ' gün · ' + k[3] + ' hedef</span></div>' + (k === suanki ? '<span class="as-eylem">' + U.durum('cozulen', 'Buradasın') + '</span>' : '') + '</div>').join(''));
  }
  function defter() {
    U.bas('#rzPuanAile', aileler.map((a) => { const t = a.rozetler.filter((r) => kazanilan[r.ad]).reduce((s, r) => s + r.puan, 0), m = a.rozetler.reduce((s, r) => s + r.puan, 0); return '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + a.ikon + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(a.ad) + '</b><span>' + a.rozetler.filter((r) => kazanilan[r.ad]).length + ' / ' + a.rozetler.length + ' rozet · ailenin tamamı ' + U.sayi(m) + ' puan</span></div><span class="as-eylem"><b>' + t + '</b></span></div>'; }).join(''));
    U.bas('#rzPuanGecmis', (u.rozetler || []).slice().sort((a, b) => b.tarih.localeCompare(a.tarih)).map((r) => { const c = hepsi.find((x) => x.ad === r.ad); return '<div class="ayar-satir"><span class="as-ikon"><i class="' + U.kac(r.ikon) + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(r.ad) + '</b><span>' + U.tarih(r.tarih) + ' · ' + U.kac(r.aciklama) + '</span></div><span class="as-eylem">' + U.durum('cozulen', '+' + (c ? c.puan : 0) + ' puan') + '</span></div>'; }).join(''));
  }
  function liderlik() {
    const ayar = (U.yerel('ayarlar', {}).gorunurluk || {});
    const gorunur = ayar.liderlik !== false;
    const p = (u.ad || '').split(' ');
    U.bas('#rzLiderlik', gorunur
      ? '<div class="siralama-satir ben"><span class="siralama-sira">1</span><span class="siralama-kim"><b>' + U.kac(p[0] + ' ' + (p[1] || '').charAt(0) + '.') + ' <span class="rozet olumlu">Sen</span></b><small>@' + U.kullaniciAdi() + ' · ' + (u.rozetler || []).length + ' rozet</small></span><span class="siralama-puan"><b>' + puan + '</b><small>puan</small></span></div>'
      : U.bos({ ikon: 'fa-eye-slash', baslik: 'Adın tabloda görünmüyor', metin: 'Sıralamaya katılmak için görünürlüğünü aç.', eylem: U.bag('Hesap Ayarları', 'hesabim/') }));
    U.bas('#rzMeydan', U.bos({ ikon: 'fa-trophy', baslik: 'Şu an açık meydan okuma yok', metin: 'Yeni meydan okumalar açıldığında burada görünür.', eylem: U.bag('Günlük takibe dön', 'hesabim/gunluk-takibim/', 'hayalet') }));
  }
  document.addEventListener('dd:suzgec', (e) => { if (e.target.id === 'rzSuzgec') { suzgec = e.detail.deger; koleksiyon(); } });
  document.addEventListener('click', (e) => {
    const r = e.target.closest('.rozet-karti');
    if (!r) return;
    const c = hepsi.find((x) => x.ad === r.dataset.rozet);
    DD.toast(c.ad + ': ' + c.aciklama);
  });
  koleksiyon(); kademe(); defter(); liderlik();
})();
