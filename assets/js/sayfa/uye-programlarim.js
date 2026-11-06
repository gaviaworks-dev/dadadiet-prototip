/* Programlarım: diyetisyen planı ve başlatılan programlar aynı tabloda */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const kok = DD.kok;

  function satirlar() {
    const l = [];
    const p = U.plan();
    if (p) {
      const son = U.gunEkle(p.tarih, p.gunler.length - 1);
      const gun = Math.min(p.gunler.length, U.gunFarki(p.tarih, U.bugun()) + 1);
      l.push({ anahtar: p.id, ad: p.ad, alt: 'Diyetisyen planı', bas: p.tarih, son, durum: 'devam', gun, toplam: p.gunler.length });
    }
    U.programlar().forEach((x) => {
      const son = U.gunEkle(x.baslangic, x.sure_gun - 1);
      l.push({ anahtar: x.slug, slug: x.slug, ad: x.ad, alt: x.sure_gun + ' günlük program', bas: x.baslangic, son, durum: x.durum, gun: Math.min(x.sure_gun, U.gunFarki(x.baslangic, U.bugun()) + 1), toplam: x.sure_gun });
    });
    return l;
  }
  const hap = (s) => (s.durum === 'tamamlandi' ? U.durum('cozulen', 'Tamamlandı', 'fa-circle-check') : s.durum === 'duraklatildi' ? U.durum('bekleyen', 'Duraklatıldı', 'fa-pause') : U.durum('cozulen', 'Sürüyor · ' + s.gun + '. gün / ' + s.toplam, 'fa-play'));
  const eylem = (s) => (s.durum === 'tamamlandi'
    ? '<a class="dugme hayalet kucuk" href="' + kok + 'program/' + s.slug + '/">İncele</a>'
    : '<a class="dugme hayalet kucuk" href="' + kok + 'hesabim/gunluk-takibim/">Günlük takip</a><a class="dugme birincil kucuk" href="' + kok + 'hesabim/beslenme-planim/#ogun" data-kaynak="' + s.anahtar + '">Planıma git</a>');
  const satir = (s) => '<tr><td><span class="no">' + U.kac(s.ad) + '<small>' + U.kac(s.alt) + '</small></span></td><td class="tarih">' + U.kisaTarih(s.bas) + ' – ' + U.kisaTarih(s.son) + '</td><td>' + hap(s) + '</td><td class="eylem-kolon"><div class="tablo-eylem">' + eylem(s) + '</div></td></tr>';
  const bosSatir = (m) => '<tr><td colspan="4" class="bos-hucre">' + m + '</td></tr>';

  function ciz() {
    const l = satirlar();
    const devam = l.filter((s) => s.durum !== 'tamamlandi'), bitti = l.filter((s) => s.durum === 'tamamlandi');
    U.bas('#prDevam', devam.map(satir).join('') || bosSatir('Devam eden programın yok. Kütüphaneden bir program başlatabilirsin.'));
    U.bas('#prTamam', bitti.map(satir).join('') || bosSatir('Henüz tamamladığın bir program yok.'));
    U.bas('#prTumu', l.map(satir).join('') || bosSatir('Henüz bir programın yok.'));
    U.sayac('devam', devam.length); U.sayac('tamamlanan', bitti.length); U.sayac('tumu', l.length);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-kaynak]');
    if (a) { U.yerel('gorunum', {}).kaynak = a.dataset.kaynak; U.kaydet(); }
  });
  ciz();
})();
