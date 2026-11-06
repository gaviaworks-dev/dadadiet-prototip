/* Hesap sayfalarının ortak modeli: abonelik, kart, hizmet ödemesi, fatura, iade.
   Kayıtlar DD.demo üzerinde uyeYerel altında durur. ?bos=1 bütün listeleri boş gösterir (boş durum incelemesi). */
(function () {
  'use strict';
  const U = window.DDU;
  const G = (window.DDG = {});
  const bos = new URLSearchParams(location.search).has('bos');
  G.bos = bos;
  const liste = (ad, tohum) => (bos ? [] : U.yerel(ad, tohum()));
  G.i = (ikon) => '<i class="fa-solid ' + ikon + '" aria-hidden="true"></i>';
  G.katalog = (id) => JSON.parse(document.getElementById(id).textContent);
  G.eposta = () => U.uye().eposta || U.kullaniciAdi() + '@ornek.test';

  /* Sonuç satırı: kart içinde kalan geri bildirim */
  G.sonuc = (id, metin, ikon) => {
    const e = document.getElementById(id);
    if (!e) return;
    e.querySelector('span').textContent = metin;
    e.querySelector('i').className = 'fa-solid ' + (ikon || 'fa-circle-check');
    e.hidden = false;
  };
  G.kademeAl = () => U.yerel('abonelik', { kademe: 'ucretsiz', yenileme: true, kart: 'k1', iptal: false, dondurma: '' });
  G.DONEM = { bas: '2026-10-15', bit: '2026-11-14', yenileme: '2026-11-15' };

  /* Abonelik kartı: Paketlerim ve Ödemelerim aynı kaydı okur */
  G.paketKarti = function (katalog, gorunum) {
    const a = G.kademeAl(), k = katalog.find((x) => x.kod === a.kademe) || katalog[0];
    const ucretsiz = k.kod === 'ucretsiz', sira = katalog.indexOf(k), ust = katalog[sira + 1];
    const hap = ucretsiz ? U.durum('kapali', 'Süresiz', 'fa-infinity')
      : a.dondurma ? U.durum('bekleyen', 'Donduruldu', 'fa-snowflake')
      : a.iptal ? U.durum('bekleyen', 'Dönem sonunda bitiyor', 'fa-hourglass-half')
      : U.durum('acik', gorunum === 'odeme' && a.yenileme ? 'Aylık yenileniyor' : 'Etkin', gorunum === 'odeme' && a.yenileme ? 'fa-rotate' : 'fa-circle-check');
    const yenile = ucretsiz ? 'Süresi dolmaz, tahsilat yapılmaz, iptal edilecek bir abonelik yok.'
      : a.dondurma ? a.dondurma + ' süreyle donduruldu; tahsilat duruyor, kayıtların olduğu gibi kalır.'
      : a.iptal || !a.yenileme ? 'Dönem ' + U.tarih(G.DONEM.bit) + ' tarihinde bitiyor, sonra Ücretsiz kademeye dönersin.'
      : 'Dönem ' + U.kisaTarih(G.DONEM.bas) + ' – ' + U.tarih(G.DONEM.bit) + ' · sonraki tahsilat ' + U.tarih(G.DONEM.yenileme) + '.';
    let govde;
    if (ucretsiz) govde = '<p class="durum-satir">' + G.i('fa-infinity') + ' <span>Ücretsiz kademede abonelik kaydı tutulmaz: dönem tarihi, yenileme ve iptal yoktur.' + (gorunum === 'odeme' ? ' Bu sekmedeki yenileme ve iptal kutuları yalnız ücretli kademelerde açılır; Pro görünümünü <a href="' + window.DD.kok + 'hesabim/paketlerim/">Paketlerim</a> sayfasındaki kademe görünümünden deneyebilirsin.' : ' Açık olan ' + k.ozellik.length + ' özelliği aşağıda görürsün.') + '</span></p>';
    else govde = '<p class="durum-satir">' + G.i('fa-eye') + ' <span><b>Örnek görünüm.</b> ' + k.ad + ' henüz satışa açılmadı; açıldığında ekranın böyle görünür. Bu görünümde tahsilat yapılmaz.</span></p>';
    if (gorunum !== 'odeme') {
      const tum = katalog.slice(0, sira + 1).flatMap((x) => x.ozellik);
      govde += '<div class="paket-ozellikler">' + k.ozellik.slice(0, 8).map((o) => '<span>' + G.i('fa-check') + ' ' + U.kac(o) + '</span>').join('') + '</div><p class="durum-satir">' + G.i('fa-list') + ' <span>Bu kademede toplam <b>' + tum.length + ' özellik</b> açık. Tam döküm <a href="#karsilastir" data-sekme-git="karsilastir">Karşılaştırma</a> sekmesinde.</span></p>';
    }
    const karsi = gorunum === 'odeme' ? '<a class="dugme hayalet" href="' + window.DD.kok + 'hesabim/paketlerim/#karsilastir">' + G.i('fa-table-list') + ' Kademeleri Karşılaştır</a>' : '<a class="dugme hayalet" href="#karsilastir" data-sekme-git="karsilastir">' + G.i('fa-table-list') + ' Kademeleri Karşılaştır</a>';
    const yukselt = ust ? '<a class="dugme birincil" href="' + window.DD.kok + 'pro/">' + G.i(ust.ikon) + ' ' + U.kac(ust.ad) + '’yu İncele</a>' : '';
    return '<div class="paket-karti"><div class="paket-bas"><span class="paket-rozet' + (ucretsiz ? ' ucretsiz' : '') + '">' + G.i(k.ikon) + ' ' + U.kac(k.ad) + '</span><div class="paket-bilgi"><b>' + U.kac(k.tamAd) + ' ' + hap + '</b><span class="paket-yenileme">' + G.i(ucretsiz ? 'fa-infinity' : 'fa-calendar-day') + ' ' + yenile + '</span></div><div class="paket-fiyat">' + (ucretsiz ? '<b>₺0</b><span>/ ay</span>' : '<b aria-hidden="true">—</b><span>Fiyat yakında</span>') + '</div></div><div class="paket-govde">' + govde + '</div><div class="paket-eylemler">' + yukselt + karsi + '</div></div>';
  };

  /* Kartlar: gerçek kart yok, yalnız demo kayıtlar */
  G.DEMO_KART = [
    { id: 'k1', marka: 'Visa', ikon: 'fa-brands fa-cc-visa', sinif: '', son: '4242', skt: '08 / 2027' },
    { id: 'k2', marka: 'Mastercard', ikon: 'fa-brands fa-cc-mastercard', sinif: ' mastercard', son: '8821', skt: '03 / 2027' },
    { id: 'k3', marka: 'Troy', ikon: 'fa-solid fa-credit-card', sinif: '', son: '1907', skt: '11 / 2028' },
  ];
  G.kartlar = () => liste('kartlar', () => [{ ...G.DEMO_KART[0], varsayilan: true }, { ...G.DEMO_KART[1], varsayilan: false }]);
  G.kartAd = (k) => k.marka + ' •••• ' + k.son;

  /* Diyetisyen ödemeleri: paketler demo.paketler kaydından, tutar satın alma anındaki bedeldir */
  const paketBul = (id) => (U.d().paketler || []).find((p) => p.id === id) || {};
  G.paketBul = paketBul;
  G.diyetisyenAd = () => (U.diyetisyen() || {}).ad || 'Diyetisyenin';
  G.hizmetler = () => liste('hizmetOdemeleri', () => {
    const p3 = paketBul('p3'), p4 = paketBul('p4');
    return [
      { id: 's1', tip: 'paket', paket_id: 'p3', ad: p3.ad, seans: p3.seans, tarih: '2026-08-18', tutar: p3.fiyat, durum: 'odendi', no: 'DD-2026-004095' },
      { id: 's2', tip: 'tek', ad: 'Ek online görüşme · 30 dk', tarih: '2026-10-20', tutar: 600, durum: 'iade-surecinde', no: 'DD-2026-004312' },
      { id: 's3', tip: 'tek', ad: 'Ek online görüşme · 30 dk', tarih: '2026-09-22', tutar: 600, durum: 'iade-edildi', no: 'DD-2026-004201' },
      { id: 's4', tip: 'paket', paket_id: 'p4', ad: p4.ad, seans: p4.seans, tarih: '2026-08-11', tutar: p4.fiyat, durum: 'odendi', no: 'DD-2026-004031', bitti: true, bitis: '2026-08-13' },
    ];
  });
  G.iadeler = () => liste('iadeTalepleri', () => [
    { no: 'IAD-2026-0042', tahsilat: 's2', ad: 'Ek online görüşme · kullanılmayan görüşme', tarih: '2026-10-22', tutar: 600, durum: 'inceleniyor' },
    { no: 'IAD-2026-0031', tahsilat: 's3', ad: 'Ek online görüşme · görüşme gerçekleşmedi', tarih: '2026-09-24', tutar: 600, durum: 'iade-edildi' },
    { no: 'IAD-2026-0018', tahsilat: 's1', ad: 'Görüşme paketi · mükerrer tahsilat iddiası', tarih: '2026-08-20', tutar: paketBul('p3').fiyat, durum: 'reddedildi' },
  ]);
  const HAP = { odendi: ['cozulen', 'Ödendi', 'fa-circle-check'], 'iade-surecinde': ['bekleyen', 'İade sürecinde', 'fa-hourglass-half'], 'iade-edildi': ['kapali', 'İade edildi', 'fa-rotate-left'], inceleniyor: ['bekleyen', 'İnceleniyor', 'fa-hourglass-half'], reddedildi: ['hata', 'Reddedildi', 'fa-circle-xmark'] };
  G.hap = (d) => { const h = HAP[d] || HAP.odendi; return U.durum(h[0], h[1], h[2]); };

  /* Paket hakkı: randevular aynı pakete ait kayıtlara satın alma sırasıyla dağıtılır */
  G.haklar = function () {
    const paketler = G.hizmetler().filter((x) => x.tip === 'paket').slice().sort((a, b) => a.tarih.localeCompare(b.tarih));
    const sonuc = {};
    const kalanRandevu = {};
    paketler.forEach((x) => {
      if (x.bitti) { sonuc[x.id] = { kullanilan: x.seans, kalan: 0 }; return; }
      if (!(x.paket_id in kalanRandevu)) kalanRandevu[x.paket_id] = U.randevular().filter((r) => r.paket_id === x.paket_id && r.durum !== 'iptal').length;
      const kullanilan = Math.min(x.seans, kalanRandevu[x.paket_id]);
      kalanRandevu[x.paket_id] -= kullanilan;
      sonuc[x.id] = { kullanilan, kalan: x.seans - kullanilan };
    });
    return sonuc;
  };

  /* Satın alma: üye akışının ödeme adımı burayı çağırır */
  G.satinAl = function (paket, kart) {
    const l = U.yerel('hizmetOdemeleri', G.hizmetler());
    const sira = 5000 + l.length;
    const kayit = { id: 's' + Date.now(), tip: 'paket', paket_id: paket.id, ad: paket.ad, seans: paket.seans, tarih: U.bugun(), tutar: paket.fiyat, durum: 'odendi', no: 'DD-2026-00' + sira, kart: G.kartAd(kart), senin: true };
    l.unshift(kayit);
    U.kaydet(); /* dn.paket_id ve diyetisyen_slug'ı Diyetisyenim ?paket= ile yazar */
    return kayit;
  };

  /* Fatura defteri: tahsilatlar ve sonuçlanan iadeler tek listede */
  G.faturalar = function () {
    const l = G.hizmetler().map((x) => ({ no: x.no, tur: 'diyetisyen', baslik: (x.tip === 'paket' ? 'Görüşme paketi' : 'Tek görüşme') + ' · ' + x.ad + ' · ' + G.diyetisyenAd(), tarih: x.tarih, tutar: x.tutar, durum: x.durum === 'iade-edildi' ? 'odendi' : x.durum, senin: x.senin, kaynak: x }));
    G.iadeler().filter((i) => i.durum === 'iade-edildi').forEach((i) => l.push({ no: i.no.replace('IAD', 'DD'), tur: 'iade', baslik: i.ad + ' iadesi', tarih: i.tarih, tutar: -i.tutar, durum: 'iade-edildi', kaynak: i }));
    return l.sort((a, b) => b.tarih.localeCompare(a.tarih));
  };
  G.tutar = (n) => (n < 0 ? '−' : '') + U.tl(Math.abs(n));
  G.faturaBilgi = () => U.yerel('faturaBilgi', { tip: 'bireysel', ad: U.uye().ad, tel: U.uye().telefon || '', eposta: G.eposta(), il: 'İstanbul', ilce: '', adres: '', unvan: '', daire: '', vkn: '', varsayilan: true });
})();
