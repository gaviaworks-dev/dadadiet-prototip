/* Program başlatma: ?program=<slug> ile gelir; aynı program ikinci kez eklenmez */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const katalog = JSON.parse($('#programKatalog').textContent);
  const slug = new URLSearchParams(location.search).get('program');
  const p = katalog.find((x) => x.slug === slug);
  const b = U.bugun();

  if (!p) {
    U.bas('#pbKap', U.bos({ ikon: 'fa-list-check', baslik: 'Başlatılacak program seçilmedi', metin: 'Program kütüphanesinden bir program seç; başlattığında bugünün öğünleri burada açılır.', eylem: U.bag('Program kütüphanesine git', 'programlar/') }));
    return;
  }

  const liste = U.programlar();
  let kayit = liste.find((x) => x.slug === slug && x.durum !== 'tamamlandi');
  const zatenVar = !!kayit;
  if (!kayit) {
    kayit = { slug: p.slug, ad: p.ad, aciklama: p.aciklama, sure_gun: p.sure_gun, enerji: p.enerji, zorluk: p.zorluk, baslangic: b, durum: 'devam' };
    if (p.ornekGunler) kayit.ornekGunler = p.ornekGunler;
    liste.push(kayit);
    U.yerel('programHareket', []).push({ tarih: b, ad: p.ad, hareket: 'Program başlatıldı' });
  }
  U.yerel('gorunum', {}).kaynak = slug;
  U.kaydet();

  const k = { anahtar: slug, tip: 'program', ad: kayit.ad, program: kayit };
  $('#pbBildirimMetin').innerHTML = zatenVar ? '<b>Bu program zaten planında.</b> Kaldığın yerden devam edebilirsin.' : '<b>Program beslenme planına eklendi.</b> Bugünün öğünlerini aşağıdan işaretleyebilirsin.';
  $('#pbBildirim').hidden = false;
  const h1 = document.querySelector('.sayfa-bas h1');
  if (h1) h1.textContent = zatenVar ? 'Programın Sürüyor' : 'Programın Başladı';
  U.bas('#pbBas', '<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid fa-seedling" aria-hidden="true"></i> Aktif programın</span><h2>' + U.kac(kayit.ad) + '</h2><p class="giris-metni">' + U.kac(kayit.aciklama) + '</p></div></div>');

  function ciz() {
    const l = U.gunOgunleri(k, b), i = U.isaret(k, b);
    U.bas('#pbUyum', U.uyumGovde(k));
    U.bas('#pbOgunler', l.map((o) => U.ogunSatir(o, U.ogunDurum(i, o))).join(''));
    $('#pbOzet').textContent = U.tarih(b) + ' · ' + l.length + ' öğün planlandı, ' + l.filter((o) => i[o.anahtar]).length + ' tanesi tamamlandı.';
  }
  document.addEventListener('dd:ogun', ciz);
  ciz();
})();
