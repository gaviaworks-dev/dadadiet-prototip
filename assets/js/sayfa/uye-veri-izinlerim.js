/* Veri izinleri: d1 izinler alanını yönetir, değişiklik panele yansır */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const dn = U.danisan();
  dn.izinler = dn.izinler || {};
  const iz = dn.izinler;
  const TUR = [
    ['olcum', 'fa-weight-scale', 'Vücut ölçümlerim', 'Kilo, bel çevresi ve yağ oranı.'],
    ['tahlil', 'fa-flask-vial', 'Tahlil ve raporlarım', 'Yüklediğin tahlil değerleri ve dosyaları.'],
    ['gunluk', 'fa-clipboard-list', 'Günlük takip verilerim', 'Öğün, su, adım kayıtları ve günlük notların.'],
    ['anamnez', 'fa-notes-medical', 'Sağlık profilim', 'Alışkanlıkların, ilaçların ve aile öykün.'],
    ['belge', 'fa-file-prescription', 'Reçete ve belgelerim', 'Sağlık Dosyam’a eklediğin belgeler.'],
    ['test', 'fa-clipboard-question', 'Test sonuçlarım', 'Çözdüğün beslenme testlerinin sonuçları.'],
  ];
  const adi = (k) => (TUR.find((t) => t[0] === k) || [])[2] || k;
  const hareket = () => U.yerel('izinHareket', []);
  const kapanan = () => U.yerel('izinKapanan', []);
  const sureler = () => U.yerel('izinSure', {});
  const dy = U.diyetisyen();
  const acikTurler = () => TUR.filter((t) => iz[t[0]]);
  const bosSatir = (n, m) => '<tr><td colspan="' + n + '" class="bos-hucre">' + m + '</td></tr>';
  const yaz = (metin) => hareket().push({ tarih: U.bugun(), metin });
  /* Başlangıç kayıtları demo.json uyeYerel.izinKapanan/izinHareket: prototip örneği */
  const ornek = (x) => (x.ornek ? '<span class="ornek-etiket satir-ici">prototip örneği</span>' : '');

  function turDegis(k, acik) {
    iz[k] = acik;
    if (acik && dn.izin_cevap) delete dn.izin_cevap[k]; /* yeniden verilen izinde eski red kalkar */
    yaz(adi(k) + (acik ? ' izni açıldı.' : ' izni kapatıldı.'));
    if (!acik) kapanan().push({ tarih: U.bugun(), izin: adi(k), durum: 'Geri çekildi' });
  }

  function istekCiz() {
    const l = Object.keys(dn.izin_talepleri || {}).filter((t) => !iz[t]);
    U.bas('#viIstek', l.length ? '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-hand" aria-hidden="true"></i> Bekleyen izin istekleri</h3><p>Karar senin; onaylamazsan diyetisyenin bu veriyi göremez.</p></div></div><div class="kart-govde bosluksuz"><div class="ayar-liste">' + l.map((t) => { const x = TUR.find((y) => y[0] === t) || [t, 'fa-shield-halved', t, '']; return '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + x[1] + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + x[2] + '</b><span>' + U.kac(dy ? dy.ad : '') + ' · ' + U.tarih(dn.izin_talepleri[t]) + ' tarihinde istedi</span></div><span class="as-eylem"><button class="dugme hayalet kucuk" type="button" data-istek-red="' + t + '">Reddet</button><button class="dugme birincil kucuk" type="button" data-istek-onay="' + t + '">Onayla</button></span></div>'; }).join('') + '</div></div></div>' : '');
  }

  function aktifCiz() {
    istekCiz();
    const n = acikTurler().length;
    $('#viGenel').checked = n > 0;
    U.bas('#viOzet', n ? U.durum('cozulen', n + ' veri türü açık') : U.durum('kapali', 'Paylaşım kapalı'));
    U.bas('#viTurler', TUR.map((t) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + t[1] + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + t[2] + '</b><span>' + t[3] + '</span></div><label class="anahtar"><input type="checkbox" data-izin="' + t[0] + '"' + (iz[t[0]] ? ' checked' : '') + ' aria-label="' + t[2] + ' paylaşılıyor"><span class="anahtar-ray"></span></label></div>').join(''));
  }

  function erisimCiz() {
    const l = acikTurler();
    U.bas('#viErisim', l.length
      ? l.map((t) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + t[1] + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(dy ? dy.ad : 'Diyetisyenin') + '</b><span>' + t[2] + ' · ' + U.kac(sureler()[t[0]] || 'Ben geri çekene kadar') + '</span></div><span class="as-eylem">' + U.durum('cozulen', 'Açık') + '<button class="dugme hayalet tehlike kucuk" type="button" data-kapat-izin="' + t[0] + '">Geri çek</button></span></div>').join('')
      : U.bos({ ikon: 'fa-user-shield', baslik: 'Açık erişim yok', metin: 'Diyetisyenin şu an sağlık verilerini göremez.', eylem: '<button class="dugme birincil" type="button" data-ac="#viYeni">Yeni izin ver</button>' }));
    /* Yeni izin: tek diyetisyen (K22.6), çok tür, süre ya da bitiş tarihi */
    $('#viYeniDyt').textContent = dy ? dy.ad : 'Etkin diyetisyenin yok; izin diyetisyen seçtiğinde geçerli olur.';
    U.bas('#viYeniTurler', TUR.map((t) => '<label class="onay-kutusu" for="viT-' + t[0] + '"><input type="checkbox" id="viT-' + t[0] + '" name="tur" value="' + t[0] + '"' + (iz[t[0]] ? ' checked disabled' : '') + '><span>' + t[2] + (iz[t[0]] ? ' (açık)' : '') + '</span></label>').join(''));
    $('#viYeniBitis').min = U.gunEkle(U.bugun(), 1);
  }

  function belgeCiz() {
    const gizli = U.yerel('belgeGizli', {});
    const l = (dn.tahliller || []).map((t) => ({ ad: t.dosya_adi, tarih: t.tarih }));
    U.bas('#viBelgeler', l.length
      ? l.map((b) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(b.ad) + '</b><span>' + U.tarih(b.tarih) + (iz.tahlil ? '' : ' · Tahlil izni kapalı olduğu için paylaşılmıyor') + '</span></div><label class="anahtar"><input type="checkbox" data-belge="' + U.kac(b.ad) + '"' + (iz.tahlil && !gizli[b.ad] ? ' checked' : '') + (iz.tahlil ? '' : ' disabled') + ' aria-label="' + U.kac(b.ad) + ' paylaşılıyor"><span class="anahtar-ray"></span></label></div>').join('')
      : U.bos({ ikon: 'fa-folder-open', baslik: 'Belge yok', metin: 'Sağlık Dosyam’a belge eklediğinde burada listelenir.', eylem: U.bag('Sağlık Dosyam', 'hesabim/saglik-dosyam/#tahlil', 'hayalet') }));
  }

  function olcumCiz() {
    U.bas('#viOlcumler', (dn.olcumler || []).slice().reverse().map((o) => '<tr><td class="tarih">' + U.noktaliTarih(o.tarih) + '</td><td class="tutar sag">' + U.sayi(o.kilo, 1) + ' kg</td><td class="tutar sag">' + U.sayi(o.bel, 1) + ' cm</td><td class="tutar sag">%' + U.sayi(o.yag_orani, 1) + '</td><td>' + (iz.olcum ? U.durum('cozulen', 'Görünür') : U.durum('kapali', 'Gizli')) + '</td></tr>').join('') || bosSatir(5, 'Henüz ölçüm yok.'));
  }

  function kayitCiz() {
    U.bas('#viDolan', kapanan().slice().reverse().map((k) => '<tr><td class="tarih">' + U.noktaliTarih(k.tarih) + '</td><td>' + U.kac(k.izin) + ornek(k) + '</td><td>' + U.durum('kapali', k.durum) + '</td></tr>').join('') || bosSatir(3, 'Kapanmış izin kaydın yok.'));
    /* Erişim kaydı: diyetisyenin klinik notu yazdığı günler verinin okunduğu günlerdir */
    const l = (dn.klinik_notlar || []).slice().reverse();
    U.bas('#viKayit', l.map((n) => '<tr><td class="tarih">' + U.noktaliTarih(n.tarih) + '</td><td>' + U.kac(dy ? dy.ad : '') + '</td><td>Ölçüm ve tahlil kayıtları</td><td>Görüntüleme</td></tr>').join('') || bosSatir(4, 'Henüz erişim kaydı yok.'));
    U.bas('#viHareket', hareket().slice().reverse().map((h) => '<tr><td class="tarih">' + U.noktaliTarih(h.tarih) + '</td><td class="sol">' + U.kac(h.metin) + ornek(h) + '</td></tr>').join('') || bosSatir(2, 'Henüz izin hareketin yok.'));
  }

  /* Sağlık verisi rızası: kapsam başına ver, geri al, verilerimi sil */
  const SIL = {
    profil: ['alerji ve hassasiyet kayıtların, ilaç ve takviyelerin, kronik rahatsızlıkların ve sağlık öykün', () => { dn.hassasiyetler = []; dn.kronik = []; dn.anamnez = {}; }],
    tahlil: ['yüklediğin tahliller, okunan değerler ve sağlık belgelerin', () => { dn.tahliller = []; U.d().uyeYerel.saglikBelge = []; }],
    his: ['bütün his kayıtların', () => { dn.his_kayitlari = []; }],
    grup: ['sağlık gruplarındaki üyeliğin ve gönderilerin', () => { const u = U.yerel('grupUyelik', {}), a = U.yerel('grupAkis', {}); ['pcos-ile-savasanlar'].forEach((g) => { delete u[g]; delete a[g]; }); }],
  };
  function rizaCiz() {
    const r = U.riza(), n = U.RIZA.filter(([k]) => U.rizaVar(k)).length;
    $('#viRizaOzet').textContent = U.RIZA.length + ' kapsamın ' + n + ' tanesinde açık rızan var.';
    U.bas('#viRiza', U.RIZA.map(([k, ikon, ad, metin]) => {
      const x = r[k], var_ = U.rizaVar(k);
      const hap = var_ ? U.durum('cozulen', 'Rıza verildi · ' + U.noktaliTarih(x.tarih)) : x ? U.durum('kapali', 'Geri alındı · ' + U.noktaliTarih(x.tarih)) : U.durum('bekleyen', 'Rıza verilmedi');
      return '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + ad + '</b><span>' + metin + '</span></div><div class="as-eylem">' + hap + (var_ ? '<button class="dugme hayalet kucuk" type="button" data-riza-geri="' + k + '">Rızamı geri al</button>' : '<button class="dugme birincil kucuk" type="button" data-riza-ver="' + k + '">Rıza ver</button>') + '<button class="dugme hayalet tehlike kucuk" type="button" data-riza-sil="' + k + '">Verilerimi sil</button></div></div>';
    }).join(''));
  }
  function ciz() { aktifCiz(); rizaCiz(); erisimCiz(); belgeCiz(); olcumCiz(); kayitCiz(); }
  document.addEventListener('dd:riza', ciz);
  let silKapsam = null;
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-riza-geri]');
    if (g) { U.rizaVer(g.dataset.rizaGeri, false); bitir(U.rizaAd(g.dataset.rizaGeri) + ' için rızan geri alındı; yeni kayıt yapılmaz.', 'uyari'); return; }
    const s = e.target.closest('[data-riza-sil]');
    if (s) {
      silKapsam = s.dataset.rizaSil;
      $('#viRizaSilBaslik').textContent = U.rizaAd(silKapsam) + ' Verilerimi Sil';
      $('#viRizaSilMetin').textContent = 'Bu kapsamdaki verilerin (' + SIL[silKapsam][0] + ') hesabından silinir ve rızan geri alınır. Prototipte silme bu tarayıcıdaki demo kaydında yapılır; canlıda talep kimlik doğrulamasından sonra işlenir.';
      $('#viRizaSilOnay').checked = false; $('#viRizaSilUygula').disabled = true;
      DD.ac('#viRizaSil');
    }
  });
  $('#viRizaSilOnay').addEventListener('change', (e) => { $('#viRizaSilUygula').disabled = !e.target.checked; });
  $('#viRizaSilUygula').addEventListener('click', () => {
    if (!silKapsam || !$('#viRizaSilOnay').checked) return;
    SIL[silKapsam][1]();
    if (U.rizaVar(silKapsam)) U.rizaVer(silKapsam, false);
    yaz(U.rizaAd(silKapsam) + ' verileri silindi.');
    DD.kapat($('#viRizaSil'));
    bitir(U.rizaAd(silKapsam) + ' verilerin silindi.', 'uyari');
  });
  const bitir = (m, t) => { U.kaydet(); ciz(); DD.toast(m, t); };

  function hepsiniKapat() {
    U.yerel('izinYedek', {});
    U.d().uyeYerel.izinYedek = { ...iz };
    TUR.forEach((t) => { if (iz[t[0]]) turDegis(t[0], false); });
  }

  document.addEventListener('change', (e) => {
    const c = e.target.closest('[data-izin]');
    if (c) { turDegis(c.dataset.izin, c.checked); bitir(adi(c.dataset.izin) + (c.checked ? ' paylaşılıyor.' : ' artık paylaşılmıyor.')); return; }
    const b = e.target.closest('[data-belge]');
    if (b) { U.yerel('belgeGizli', {})[b.dataset.belge] = !b.checked; yaz(b.dataset.belge + (b.checked ? ' paylaşıma açıldı.' : ' paylaşımdan çıkarıldı.')); bitir(b.checked ? 'Belge paylaşıma açıldı.' : 'Belge paylaşımdan çıkarıldı.'); return; }
    if (e.target.id === 'viGenel') {
      if (e.target.checked) {
        const y = U.yerel('izinYedek', null) || { olcum: true, tahlil: true, gunluk: true, belge: true, anamnez: true };
        TUR.forEach((t) => { if (y[t[0]] && !iz[t[0]]) turDegis(t[0], true); });
        bitir('Paylaşım yeniden açıldı.');
      } else { hepsiniKapat(); bitir('Bütün erişimler durdu.', 'uyari'); }
    }
  });
  document.addEventListener('click', (e) => {
    const k = e.target.closest('[data-kapat-izin]');
    if (k) { turDegis(k.dataset.kapatIzin, false); bitir(adi(k.dataset.kapatIzin) + ' izni geri çekildi.', 'uyari'); }
    const o = e.target.closest('[data-istek-onay]'), r = e.target.closest('[data-istek-red]');
    if (o) { const t = o.dataset.istekOnay; turDegis(t, true); delete dn.izin_talepleri[t]; bitir(adi(t) + ' izni verildi; diyetisyenin artık görebilir.'); }
    if (r) { const t = r.dataset.istekRed; delete dn.izin_talepleri[t]; (dn.izin_cevap = dn.izin_cevap || {})[t] = 'red'; yaz(adi(t) + ' isteği reddedildi.'); bitir('İzin isteği reddedildi.', 'uyari'); }
  });
  $('#viGeriCekOnay').addEventListener('click', () => { hepsiniKapat(); DD.kapat($('#viGeriCek')); bitir('Bütün izinler geri çekildi.', 'uyari'); });
  $('#viYeniForm').elements.sure.addEventListener('change', (e) => { const t = e.target.value === 'Belirli bir tarihe kadar'; U.gizle($('#viYeniBitisAlan'), !t); $('#viYeniBitis').required = t; });
  $('#viYeniForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, l = [...f.querySelectorAll('[name=tur]:checked:not(:disabled)')].map((c) => c.value);
    if (!l.length) { DD.toast('En az bir veri türü seç.', 'hata'); return; }
    const s = f.elements.sure.value, bit = $('#viYeniBitis').value;
    if (s === 'Belirli bir tarihe kadar' && !bit) { DD.toast('Bitiş tarihini seç.', 'hata'); return; }
    const sure = s === 'Belirli bir tarihe kadar' ? U.noktaliTarih(bit) + ' tarihine kadar' : s === 'Ben geri çekene kadar' ? s : s + ' (' + U.noktaliTarih(U.gunEkle(U.bugun(), parseInt(s, 10))) + ' tarihine kadar)';
    l.forEach((k) => { turDegis(k, true); sureler()[k] = sure; });
    f.reset(); U.gizle($('#viYeniBitisAlan'), true);
    DD.kapat($('#viYeni'));
    bitir(l.length === 1 ? adi(l[0]) + ' için izin verildi.' : l.length + ' veri türü için izin verildi.');
  });
  $('#viIndir').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ izinler: iz, hareketler: hareket(), olusturma: U.bugun() }, null, 2)], { type: 'application/json' }));
    a.download = 'dada-diet-verilerim.json';
    a.click();
    DD.toast('Verilerin indirildi.');
  });
  $('#viSil').addEventListener('click', () => { yaz('Veri silme talebi oluşturuldu.'); bitir('Silme talebin alındı.', 'uyari'); });
  ciz();
})();
