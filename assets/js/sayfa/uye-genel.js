/* Genel Bakış: şimdi ne yapmalıyım sorusunun tek yanıtı. Yeni üyede boş blok görünmez */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const u = U.uye(), b = U.bugun(), dy = U.diyetisyen();
  const bag = (metin, yol, sinif) => '<a class="dugme ' + sinif + '" href="' + DD.kok + yol + '">' + metin + '</a>';
  const kartHtml = (ikon, baslik, metin, sag, govde, alt) => '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i> ' + baslik + '</h3>' + (metin ? '<p>' + metin + '</p>' : '') + '</div>' + (sag || '') + '</div>' + (govde || '') + (alt ? '<div class="kart-alt eylem">' + alt + '</div>' : '') + '</div>';
  const sayac = (i, e, d) => '<div class="sayac"><i class="fa-solid ' + i + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + d + '</b></div></div>';

  function ciz() {
    const k = U.aktifKaynak(), l = U.yapilacaklar(), ilk = l[0];
    const ad = (u.ad || '').split(' ')[0];
    $('#gbSelam').textContent = 'Merhaba ' + ad + '. Bugün ' + U.tarih(b) + ' ' + U.gunAdi(b) + '.';
    U.bas('#gbSiradaki', ilk ? kartHtml(ilk.ikon, ilk.baslik, U.kac(ilk.metin), '<div class="as-eylem">' + bag(ilk.etiket, ilk.yol, 'birincil') + '</div>') : kartHtml('fa-circle-check', 'Bugün için her şey tamam', 'Yarın görüşmek üzere; kayıtların diyetisyeninle paylaşıldı.'));

    /* Bugünün özeti: uyum önde, kalan kalori küçük */
    const yeni = !k && !dy;
    $('#gbKolon').hidden = yeni;
    if (k) {
      const i = U.isaret(k, b), og = U.secilenOgunler(k, b), n = og.filter((o) => i[o.anahtar]).length, s = og.find((o) => !U.ogunDurum(i, o)), t = U.gunToplam();
      const oran = og.length ? Math.round((n / og.length) * 100) : 0, hk = (u.tercihler || {}).kcal || (k.tip === 'plan' ? k.plan.hedef_kcal : 0);
      U.bas('#gbGun', kartHtml('fa-sun', 'Bugünün özeti', U.kac(k.ad), '<div class="as-eylem"><span class="durum-hapi ' + (n === og.length && n ? 'cozulen' : 'bekleyen') + '">' + n + ' / ' + og.length + ' öğün</span></div>',
        '<div class="kart-govde"><div class="olcer hap" role="img" aria-label="Bugünkü öğün uyumu: yüzde ' + oran + '"><span data-oran="' + oran + '"></span></div><div class="sayac-izgara uc">' + sayac('fa-fire', 'Hedef <span class="birim">' + DD.bicim.kcal(hk) + '</span>', DD.bicim.kcal(t.kcal)) + sayac('fa-droplet', 'Su', U.sayi(u.su.bugun_ml) + ' ml') + sayac('fa-shoe-prints', 'Adım', U.sayi(u.adim.bugun)) + '</div></div>' + (s ? '<div class="kart-govde bosluksuz"><div class="kalem-liste">' + U.ogunSatir(s, '') + '</div></div>' : (og.length ? '' : '<div class="kart-govde">' + U.bugunBos(k) + '</div>')),
        bag('Bütün öğünler', 'hesabim/beslenme-planim/#ogun', 'hayalet')));
    } else U.bas('#gbGun', '');

    const su = u.su;
    U.bas('#gbKayit', [
      ['fa-utensils', 'Öğün', k ? 'Plana uyduysan tek dokunuşla işaretle.' : 'Yediklerini günlüğe ekle.', bag('Ekle', 'hesabim/gunluk-takibim/', 'hayalet kucuk')],
      ['fa-droplet', 'Su', U.sayi(su.bugun_ml) + ' / ' + U.sayi(su.hedef_ml) + ' ml', '<button class="dugme hayalet kucuk" type="button" data-su-ekle="250">+250 ml</button>'],
      ['fa-weight-scale', 'Ölçüm', 'Kilo, bel ve yağ oranı.', bag('Ekle', 'hesabim/saglik-dosyam/#olcum', 'hayalet kucuk')],
    ].map((x) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + x[0] + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + x[1] + '</b><span>' + x[2] + '</span></div><span class="as-eylem">' + x[3] + '</span></div>').join(''));

    /* Sıradaki görüşme */
    const r = U.randevular().find((x) => x.tarih >= b && U.rAcik(x));
    U.bas('#gbRandevu', r ? kartHtml('fa-calendar-day', 'Sıradaki görüşmen', U.tarih(r.tarih) + ', ' + DD.bicim.saat(r.saat) + ' · ' + U.kac(r.tur), '<div class="as-eylem">' + U.rHap(r) + '</div>', '', bag('Randevularım', 'hesabim/diyetisyenim/#randevu', 'hayalet'))
      : dy ? kartHtml('fa-calendar-plus', 'Planlı görüşmen yok', 'Diyetisyeninle yeni bir görüşme ayarla.', '', '', bag('Randevu oluştur', 'hesabim/diyetisyenim/#randevu', 'birincil')) : '');

    /* Diyetisyenin son sözü: otomatik metin üretilmez */
    const m = U.sohbet().mesajlar.filter((x) => x.kimden !== 'danisan').slice(-1)[0];
    U.bas('#gbMesaj', dy && m ? kartHtml('fa-comments', U.kac(dy.ad), U.tarih(m.zaman) + (u.okunmamis_mesaj ? ' · ' + u.okunmamis_mesaj + ' okunmamış' : ''), '', '<div class="kart-govde"><p class="kart-metin">' + U.kac(m.metin || (m.ek ? m.ek.ad : '')) + '</p></div>', bag('Yanıtla', 'hesabim/diyetisyenim/#mesaj', 'hayalet')) : '');

    /* Yapılacaklar: en çok üç satır, ilki yukarıda önerildi */
    const kalan = l.slice(1, 4);
    U.bas('#gbGorev', kalan.length ? kartHtml('fa-list-check', 'Yapılacaklar', '', '', '<div class="kart-govde bosluksuz"><div class="ayar-liste">' + kalan.map((x) => '<a class="ayar-satir" href="' + DD.kok + x.yol + '"><span class="as-ikon"><i class="fa-solid ' + x.ikon + '" aria-hidden="true"></i></span><span class="as-metin"><b>' + U.kac(x.baslik) + '</b><span>' + U.kac(x.metin) + '</span></span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a>').join('') + '</div></div>') : '');
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
