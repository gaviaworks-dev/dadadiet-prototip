/* Programlarım: her program kendi kartında; gün gün durum, uyum ve tek sıradaki eylem */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const b = U.bugun(), TU = DD.tercihUyum;
  TU.uyeBagla(U);

  function kaynaklar() {
    const p = U.plan(), l = p ? [{ anahtar: p.id, tip: 'plan', ad: p.ad, plan: p }] : [];
    U.programlar().forEach((x) => l.push({ anahtar: x.slug, tip: 'program', ad: x.ad, program: x }));
    return l;
  }
  const durum = (k) => (k.tip === 'program' ? k.program.durum : U.yerel('planDurak', {})[k.anahtar] ? 'duraklatildi' : 'devam');
  const sure = (k) => (k.tip === 'plan' ? k.plan.gunler.length : k.program.sure_gun);

  /* Gün şeridi: en çok 7 gün; biten, bugün ve sıradakiler */
  function gunler(k) {
    const bas = U.kaynakBas(k), n = sure(k), i0 = Math.max(0, Math.min(n - 7, U.gunFarki(bas, b) - 3));
    let s = '';
    for (let i = i0; i < Math.min(n, i0 + 7); i++) {
      const t = U.gunEkle(bas, i), og = U.gunOgunleri(k, t), is = U.isaret(k, t), tamam = og.filter((o) => is[o.anahtar]).length;
      const hap = t > b ? U.durum('kapali', 'Sırada') : t === b ? U.durum('acik', 'Bugün') : tamam === og.length && og.length ? U.durum('cozulen', 'Tamam') : U.durum('bekleyen', tamam + ' / ' + og.length);
      s += '<div class="gun-kutu"><b>' + (i + 1) + '. gün</b><small>' + U.kisaTarih(t) + '</small>' + hap + '</div>';
    }
    return '<div class="gun-serit-liste" role="list" aria-label="Gün gün ilerleme">' + s + '</div>';
  }

  /* Program öğünleri tercihe uyarlanır; plan değişmez, aykırı kalem varsa kartta yazar */
  function tercihNot(k) {
    if (k.tip === 'plan') return TU.planUyariHtml(U, k.plan);
    const m = TU.bilgiMetni(TU.ogunOzeti(U.gunOgunleri(k, b)));
    return m ? '<p class="alan-yardim"><i class="fa-solid fa-sliders" aria-hidden="true"></i> <span>' + m + '</span></p>' : '';
  }

  function kart(k) {
    const d = durum(k), bas = U.kaynakBas(k), son = U.gunEkle(bas, sure(k) - 1), u = U.uyum(k);
    const gun = Math.max(0, Math.min(sure(k), U.gunFarki(bas, b) + 1));
    const hap = d === 'duraklatildi' ? U.durum('bekleyen', 'Duraklatıldı', 'fa-pause') : gun ? U.durum('cozulen', gun + '. gün / ' + sure(k), 'fa-play') : U.durum('bekleyen', 'Başlamadı');
    return '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid ' + (k.tip === 'plan' ? 'fa-user-doctor' : 'fa-list-check') + '" aria-hidden="true"></i> ' + U.kac(k.ad) + '</h3><p>' + (k.tip === 'plan' ? 'Diyetisyen planı' : sure(k) + ' günlük program') + ' · ' + U.kisaTarih(bas) + ' – ' + U.kisaTarih(son) + '</p></div><div class="as-eylem">' + hap + '</div></div><div class="kart-govde"><p class="alan-yardim"><span>Uyum <b>%' + u.oran + '</b> · ' + u.tamam + ' / ' + u.toplam + ' öğün tamamlandı</span></p><div class="olcer hap" role="img" aria-label="Uyum: yüzde ' + u.oran + '"><span data-oran="' + u.oran + '"></span></div>' + gunler(k) + tercihNot(k) + '</div><div class="kart-alt eylem"><a class="dugme hayalet" href="' + DD.kok + 'hesabim/gunluk-takibim/" data-kaynak="' + k.anahtar + '">Günlük takip</a><a class="dugme birincil" href="' + DD.kok + 'hesabim/beslenme-planim/#ogun" data-kaynak="' + k.anahtar + '"><i class="fa-solid fa-utensils" aria-hidden="true"></i> Bugünün öğünleri</a></div></div>';
  }
  function bittiKart(k) {
    const u = U.uyum(k);
    return '<a class="ayar-satir" href="' + DD.kok + 'program/' + k.program.slug + '/"><span class="as-ikon"><i class="fa-solid fa-circle-check" aria-hidden="true"></i></span><span class="as-metin"><b>' + U.kac(k.ad) + '</b><span>' + U.kisaTarih(k.program.baslangic) + ' – ' + U.kisaTarih(U.gunEkle(k.program.baslangic, sure(k) - 1)) + ' · Uyum %' + u.oran + '</span></span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a>';
  }

  function ciz() {
    const l = kaynaklar(), devam = l.filter((k) => durum(k) !== 'tamamlandi'), bitti = l.filter((k) => durum(k) === 'tamamlandi');
    /* His kaydı diyeti sürdüren üye içindir: devam eden program yoksa kart çıkmaz */
    if (devam.length) DD.hisKaydi.bas('#prHis'); else U.bas('#prHis', '');
    U.bas('#prDevam', devam.map(kart).join('') || '<div class="kart panel tam-kolon">' + U.bos({ ikon: 'fa-list-check', baslik: 'Henüz başlattığın program yok', metin: 'Sana uygun programı bul; bugünün öğünleri hemen hazır olsun.', eylem: U.bag('Program bul', 'programlar/program-bul/') }) + '</div>');
    U.bas('#prTamam', bitti.length ? '<div class="kart panel tam-kolon"><div class="kart-govde bosluksuz"><div class="ayar-liste">' + bitti.map(bittiKart).join('') + '</div></div></div>' : '<div class="kart panel tam-kolon">' + U.bos({ ikon: 'fa-circle-check', baslik: 'Henüz tamamladığın program yok', metin: 'Programını bitirdiğinde uyum oranınla burada arşivlenir.', eylem: U.bag('Devam edenlere dön', 'hesabim/programlarim/', 'hayalet') }) + '</div>');
    U.sayac('devam', devam.length); U.sayac('tamamlanan', bitti.length);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-kaynak]');
    if (a) { U.yerel('gorunum', {}).kaynak = a.dataset.kaynak; U.kaydet(); }
  });
  ciz();
})();
