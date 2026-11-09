/* Program başlatma: ?program=<slug> ile gelir; aynı program ikinci kez eklenmez */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const katalog = JSON.parse($('#programKatalog').textContent);
  const slug = new URLSearchParams(location.search).get('program');
  const p = katalog.find((x) => x.slug === slug);
  const b = U.bugun(), TU = DD.tercihUyum;
  TU.uyeBagla(U);

  if (!p) {
    U.bas('#pbKap', U.bos({ ikon: 'fa-list-check', baslik: 'Başlatılacak program seçilmedi', metin: 'Program kütüphanesinden bir program seç; başlattığında bugünün öğünleri burada açılır.', eylem: U.bag('Program kütüphanesine git', 'programlar/') }));
    return;
  }

  const liste = U.programlar();
  let kayit = liste.find((x) => x.slug === slug && x.durum !== 'tamamlandi');
  const zatenVar = !!kayit;
  const duyarli = U.yemeDuyarli();

  /* Başlangıç günü seçenekleri: bugün, yarın, gelecek pazartesi */
  const pzt = U.gunEkle(b, ((8 - U.gun(b).getDay()) % 7) || 7);
  const TARIH = [['bugun', 'Bugün', b, 'fa-calendar-day'], ['yarin', 'Yarın', U.gunEkle(b, 1), 'fa-calendar-plus'], ['pazartesi', 'Gelecek pazartesi', pzt, 'fa-calendar-week']];
  /* Birden fazla aktif plan kuralı: aynı anda sürenler sayılır. Diyetisyen planı buradan duraklatılmaz (onaylı duraklatma Beslenme Planım'da);
     üyenin kendi başlattığı programlar için seçim: öncekini duraklat ya da birlikte sürdür */
  const plan = U.plan(), planSurer = plan && !U.yerel('planDurak', {})[plan.id];
  const surenler = liste.filter((x) => x.durum === 'devam' && x.slug !== slug);

  function onayCiz() {
    const ornek = U.gunOgunleri({ anahtar: slug, tip: 'program', ad: p.ad, program: { ...p, baslangic: b } }, b);
    const s = (i, e, d) => '<div class="sayac"><i class="fa-solid ' + i + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + d + '</b></div></div>';
    const ozet = s('fa-calendar-days', 'Süre', p.sure_gun + ' gün') + (duyarli ? '' : s('fa-fire', 'Günlük enerji', U.kac(p.enerji || '—'))) + s('fa-utensils', 'Günlük öğün', ornek.length + ' öğün') + s('fa-signal', 'Zorluk', U.kac(p.zorluk || '—'));
    const tarih = '<div class="secenek-izgara c3" data-tek-secim id="pbTarih" role="group" aria-label="Başlangıç günü">' + TARIH.map((x, n) => '<button class="secenek" type="button" data-deger="' + x[0] + '" aria-pressed="' + (n === 0) + '"><i class="fa-solid ' + x[3] + '" aria-hidden="true"></i><span>' + x[1] + '<small>' + U.tarih(x[2]) + ' ' + U.gunAdi(x[2]) + '</small></span></button>').join('') + '</div>';
    let birlikte = '';
    if (surenler.length) birlikte = '<div class="alan"><span class="alan-etiket">Şu an sürdürdüğün ' + (surenler.length > 1 ? 'programlar' : 'program') + ': ' + surenler.map((x) => '<b>' + U.kac(x.ad) + '</b>').join(', ') + '</span><div class="secenek-izgara" data-tek-secim id="pbBirlikte" role="group" aria-label="Önceki programlar"><button class="secenek" type="button" data-deger="duraklat" aria-pressed="true"><i class="fa-solid fa-pause" aria-hidden="true"></i><span>Öncekini duraklat<small>Tek program, öğünler karışmaz. Önerilen.</small></span></button><button class="secenek" type="button" data-deger="birlikte" aria-pressed="false"><i class="fa-solid fa-layer-group" aria-hidden="true"></i><span>İkisini birlikte sürdür<small>Beslenme Planım’da hangisini göreceğini seçersin.</small></span></button></div></div>';
    const planNot = planSurer ? '<div class="bilgi-notu"><i class="fa-solid fa-user-doctor" aria-hidden="true"></i><p>Diyetisyeninin hazırladığı <b>' + U.kac(plan.ad) + '</b> planı sürüyor. Bu program onun yanında ayrı izlenir; planını değiştirmeden önce diyetisyenine danışman önerilir.</p></div>' : '';
    U.bas('#pbOnay', '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-list-check" aria-hidden="true"></i> ' + U.kac(p.ad) + '</h3><p>' + U.kac(U.enerjisiz(TU.aciklama(p.aciklama, p))) + '</p></div></div><div class="kart-govde"><div class="yigin"><div class="sayac-izgara">' + ozet + '</div><div class="alan"><span class="alan-etiket">Ne zaman başlayalım?</span>' + tarih + '</div>' + birlikte + planNot + '<p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span id="pbTarihOzet"></span></p></div></div><div class="kart-alt eylem"><a class="dugme hayalet" href="' + DD.kok + 'program/' + p.slug + '/">Vazgeç</a><button class="dugme birincil" type="button" id="pbAktar"><i class="fa-solid fa-check" aria-hidden="true"></i> Planıma aktar</button></div></div>');
    tarihOzet();
  }
  const secilen = (id) => { const x = document.querySelector('#' + id + ' [aria-pressed="true"]'); return x ? x.dataset.deger : null; };
  function tarihOzet() {
    const t = TARIH.find((x) => x[0] === secilen('pbTarih')) || TARIH[0];
    $('#pbTarihOzet').textContent = p.ad + ' ' + U.tarih(t[2]) + ' günü başlar, ' + U.tarih(U.gunEkle(t[2], p.sure_gun - 1)) + ' günü biter.' + (t[2] > b ? ' O güne kadar öğünlerin değişmez.' : '');
  }
  document.addEventListener('dd:secim', (e) => { if (e.target.id === 'pbTarih') tarihOzet(); });

  function aktar() {
    const t = (TARIH.find((x) => x[0] === secilen('pbTarih')) || TARIH[0])[2];
    kayit = { slug: p.slug, ad: p.ad, aciklama: p.aciklama, tercih: p.tercih, hedef: p.hedef, sure_gun: p.sure_gun, enerji: p.enerji, zorluk: p.zorluk, baslangic: t, durum: 'devam' };
    if (p.ornekGunler) kayit.ornekGunler = p.ornekGunler;
    const h = U.yerel('programHareket', []);
    if (surenler.length && secilen('pbBirlikte') === 'duraklat') surenler.forEach((x) => { x.durum = 'duraklatildi'; h.push({ tarih: b, ad: x.ad, hareket: 'Duraklatıldı' }); });
    else if (surenler.length) kayit.birlikte = true;
    liste.push(kayit);
    h.push({ tarih: b, ad: p.ad, hareket: t > b ? 'Program planlandı (' + U.tarih(t) + ')' : 'Program başlatıldı' });
    U.yerel('gorunum', {}).kaynak = slug;
    U.kaydet();
    return t;
  }
  if (!zatenVar) {
    U.gizle($('#pbAktif'), true);
    onayCiz();
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#pbAktar')) return;
      const t = aktar();
      U.bas('#pbOnay', '');
      U.gizle($('#pbAktif'), false);
      goster(false, t);
      DD.toast(t > b ? 'Program ' + U.tarih(t) + ' günü başlayacak.' : 'Program beslenme planına eklendi.');
    });
    return;
  }
  U.yerel('gorunum', {}).kaynak = slug;
  U.kaydet();
  goster(true, kayit.baslangic);

  function goster(eski, t) {
  const k = { anahtar: slug, tip: 'program', ad: kayit.ad, program: kayit };
  $('#pbBildirimMetin').innerHTML = eski ? '<b>Bu program zaten planında.</b> Kaldığın yerden devam edebilirsin.' : t > b ? '<b>Program planına eklendi, ' + U.tarih(t) + ' günü başlıyor.</b> Öğünlerini o gün buradan ve Beslenme Planım’dan işaretlersin.' : '<b>Program beslenme planına eklendi.</b> Bugünün öğünlerini aşağıdan işaretleyebilirsin.';
  $('#pbBildirim').hidden = false;
  U.bas('#pbBas', '<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid fa-seedling" aria-hidden="true"></i> Aktif programın</span><h2>' + U.kac(kayit.ad) + '</h2><p class="giris-metni">' + U.kac(U.enerjisiz(TU.aciklama(kayit.aciklama, { ...p, ...kayit }))) + '</p></div></div>');

  function ciz() {
    const l = U.gunOgunleri(k, b), i = U.isaret(k, b);
    U.bas('#pbTercih', TU.bilgiHtml(TU.ogunOzeti(l)));
    U.bas('#pbUyum', U.uyumGovde(k));
    if (b < kayit.baslangic) { U.bas('#pbOgunler', U.bugunBos(k)); $('#pbOzet').textContent = 'Başlangıç ' + U.tarih(kayit.baslangic) + '.'; return; }
    U.bas('#pbOgunler', l.map((o) => U.ogunSatir(o, U.ogunDurum(i, o))).join(''));
    $('#pbOzet').textContent = U.tarih(b) + ' · ' + l.length + ' öğün planlandı, ' + l.filter((o) => i[o.anahtar]).length + ' tanesi tamamlandı.';
  }
  document.addEventListener('dd:ogun', ciz);
  ciz();
  }
})();
