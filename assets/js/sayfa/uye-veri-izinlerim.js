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
  ];
  const adi = (k) => (TUR.find((t) => t[0] === k) || [])[2] || k;
  const hareket = () => U.yerel('izinHareket', []);
  const kapanan = () => U.yerel('izinKapanan', []);
  const sureler = () => U.yerel('izinSure', {});
  const dy = U.diyetisyen();
  const acikTurler = () => TUR.filter((t) => iz[t[0]]);
  const bosSatir = (n, m) => '<tr><td colspan="' + n + '" class="bos-hucre">' + m + '</td></tr>';
  const yaz = (metin) => hareket().push({ tarih: U.bugun(), metin });

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
      : U.bos({ ikon: 'fa-user-shield', baslik: 'Açık erişim yok', metin: 'Diyetisyenin şu an sağlık verilerini göremez.', eylem: '<button class="dugme birincil" type="button" data-ac="#viYeni">Yeni İzin Ver</button>' }));
    const sec = $('#viYeniForm').elements.tur;
    const kapali = TUR.filter((t) => !iz[t[0]]);
    sec.innerHTML = (kapali.length ? kapali : TUR).map((t) => '<option value="' + t[0] + '">' + t[2] + '</option>').join('');
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
    U.bas('#viDolan', kapanan().slice().reverse().map((k) => '<tr><td class="tarih">' + U.noktaliTarih(k.tarih) + '</td><td>' + U.kac(k.izin) + '</td><td>' + U.durum('kapali', k.durum) + '</td></tr>').join('') || bosSatir(3, 'Kapanmış izin kaydın yok.'));
    /* Erişim kaydı: diyetisyenin klinik notu yazdığı günler verinin okunduğu günlerdir */
    const l = (dn.klinik_notlar || []).slice().reverse();
    U.bas('#viKayit', l.map((n) => '<tr><td class="tarih">' + U.noktaliTarih(n.tarih) + '</td><td>' + U.kac(dy ? dy.ad : '') + '</td><td>Ölçüm ve tahlil kayıtları</td><td>Görüntüleme</td></tr>').join('') || bosSatir(4, 'Henüz erişim kaydı yok.'));
    U.bas('#viHareket', hareket().slice().reverse().map((h) => '<tr><td class="tarih">' + U.noktaliTarih(h.tarih) + '</td><td class="sol">' + U.kac(h.metin) + '</td></tr>').join('') || bosSatir(2, 'Henüz izin hareketin yok.'));
  }

  function ciz() { aktifCiz(); erisimCiz(); belgeCiz(); olcumCiz(); kayitCiz(); }
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
  $('#viYeniForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, k = f.elements.tur.value;
    if (!iz[k]) turDegis(k, true);
    sureler()[k] = f.elements.sure.value;
    DD.kapat($('#viYeni'));
    bitir(adi(k) + ' için izin verildi.');
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
