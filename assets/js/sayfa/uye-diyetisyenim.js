/* Diyetisyenim: randevu, mesaj ve notlar demo durumundan okunur; değişiklik panele yansır */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  /* Pencereler #pageMain'in kendi yığın bağlamından (kabuk .page-main z-index:2) çıkıp gövdeye taşınır; Tercihlerim T1 ile aynı kök neden */
  document.querySelectorAll('#pageMain > .modal-ortu').forEach((m) => document.body.appendChild(m));
  /* Diyetisyen profilinden paket seçilerek gelindi: ilişki ve paket kurulur, randevu formu açılır */
  const paketId = new URLSearchParams(location.search).get('paket');
  const secilen = paketId && (U.d().paketler || []).find((p) => p.id === paketId);
  if (secilen) {
    U.danisan().paket_id = secilen.id;
    U.uye().diyetisyen_slug = U.d().diyetisyen.slug;
    U.kaydet();
  }
  const dy = U.diyetisyen(), dn = U.danisan(), pk = U.paket(), b = U.bugun();
  if (!dy) {
    U.sayfaBos(U.bos({ ikon: 'fa-user-doctor', baslik: 'Henüz bir diyetisyenle çalışmıyorsun', metin: 'Hedefine uygun uzmanı bul; paketini seçince randevun, mesajların ve planın burada toplanır.', eylem: U.bag('Diyetisyen bul', 'diyetisyen-bul-sihirbazi/') }));
    return;
  }
  /* Kişi: panel diyetisyeni (ana) ve uzman ilişkileri aynı biçimde okunur */
  const ece = () => Object.assign({}, dy, { ana: true, durum: 'aktif', profil: 'diyetisyen/' + dy.slug + '/', paket: U.paket(), musaitlik: U.d().musaitlik || {}, randevular: U.randevular(), notlar: [], dosyalar: [] });
  const kisiler = () => [ece()].concat(U.uzmanlar());
  const aktifler = () => kisiler().filter((k) => k.durum === 'aktif');
  const gecmisler = () => kisiler().filter((k) => k.durum === 'gecmis');
  const kisi = (slug) => kisiler().find((k) => k.slug === slug) || ece();
  const sahip = (r) => kisi(r.uzman || dy.slug);
  const sohbetAl = (k) => (k.ana ? U.sohbet() : (k.sohbet = k.sohbet || { okunmamis: 0, mesajlar: [] }));
  const aralik = (k) => U.tarih(k.baslangic) + ' – ' + U.tarih(k.bitis);
  let sohbetKisi = dy.slug;
  const bosSatir = (n, m) => '<tr><td colspan="' + n + '" class="bos-hucre">' + m + '</td></tr>';
  const gecen = (r) => ['tamamlandi', 'sonuc-bekliyor', 'gelmedi'].includes(U.rDurum(r));
  const yaklasan = () => U.tumRandevular().filter((r) => r.tarih >= b && U.rAcik(r));
  /* Tamamlanan görüşmede panelin özeti öne geçer; ozel_not hiçbir yerde okunmaz */
  const gorusmeMetni = (r) => (U.rDurum(r) === 'tamamlandi' && r.ozet ? r.ozet : r.not);
  const bekleyenTalep = (r) => r.talep && r.talep.durum === 'bekliyor';
  /* Eylem: bekleyen talep varsa geri alınır, yoksa iptal ve saat değişikliği talebi açılır */
  const katil = (r, sinif) => (r.tur === 'online' && /^https?:\/\//.test(r.baglanti || '') ? '<a class="dugme ' + sinif + '" href="' + U.kac(r.baglanti) + '" target="_blank" rel="noopener"><i class="fa-solid fa-video" aria-hidden="true"></i> Görüşmeye katıl</a>' : '');
  const eylemler = (r, kucuk) => {
    const k = kucuk ? ' kucuk' : '';
    if (bekleyenTalep(r)) return '<button class="dugme hayalet' + k + '" type="button" data-talep-geri="' + r.id + '">Talebi geri al</button>';
    /* Tablo satırında ikon düğme (üç yazılı düğme satırı üç kat uzatıyordu); Sıradaki Görüşmen kartında yazılı kalır */
    if (kucuk) return ikonDugme('İptal talebi', 'fa-ban', 'data-iptal="' + r.id + '"', 'yikici') + ikonDugme('Saat değişikliği talebi', 'fa-clock-rotate-left', 'data-ertele="' + r.id + '"');
    return '<button class="dugme hayalet tehlike" type="button" data-iptal="' + r.id + '">İptal talebi</button><button class="dugme birincil" type="button" data-ertele="' + r.id + '">Saat değişikliği talebi</button>';
  };
  const satirKur = (i, baslik, metin, sag) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + i + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(baslik) + '</b><span>' + U.kac(metin) + '</span></div>' + (sag ? '<span class="as-eylem">' + sag + '</span>' : '') + '</div>';

  /* Sayfa Revizesi 1: işlem düğmeleri ikon düğmedir; ad aria-label'da, ipucu ortak.js'ten. Aynı işlev her yerde aynı ikon */
  const ikonDugme = (ad, ikon, ek, sinif) => '<button class="ikon-dugme' + (sinif ? ' ' + sinif : '') + '" type="button" aria-label="' + U.kac(ad) + '" ' + (ek || '') + '><i class="fa-solid ' + ikon + '" aria-hidden="true"></i></button>';
  const ikonBag = (ad, ikon, href) => '<a class="ikon-dugme" href="' + href + '" aria-label="' + U.kac(ad) + '"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i></a>';
  /* Kompakt bilgi satırı: Unvan, paket, sıradaki görüşme tek satırda ikonlu */
  const metaHtml = (l) => '<div class="kimlik-meta">' + l.map((x) => '<span><i class="fa-solid ' + x[0] + '" aria-hidden="true"></i> <span>' + x[1] + '</span></span>').join('') + '</div>';
  const kartBas = (ikon, k, sag) => '<div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i> ' + U.kac(k.ad) + '</h3><p>' + U.kac((k.uzmanlik || []).join(' · ')) + '</p></div><div class="as-eylem">' + sag + '</div></div>';
  const profilBag = (k) => ikonBag('Profili gör', 'fa-user', DD.kok + k.profil);
  /* Diploma doğrulaması (ES-HS-50): tarih yalnız kayıtta varsa yazılır; kurgu diyetisyenin tarihi prototip örneği */
  const dogrulama = (k) => k.dogrulama || (k.ana ? (((window.DD_VERI || {}).demo || {}).diyetisyen || {}).dogrulama : null);
  const aktifKart = (k) => {
    const y = yaklasan().find((r) => sahip(r).slug === k.slug), dg = dogrulama(k);
    const eylem = '<span class="durum-hapi cozulen">Doğrulanmış</span><span class="satir-eylem">' + profilBag(k) + ikonDugme('Mesaj', 'fa-comment', 'data-sohbet-git="' + k.slug + '"') + ikonDugme('Randevu oluştur', 'fa-calendar-plus', 'data-randevu-al="' + k.slug + '"') + '</span>';
    return '<div class="kart panel tam-kolon">' + kartBas('fa-id-card', k, eylem)
      + '<div class="kart-govde">' + metaHtml([['fa-id-badge', U.kac(k.unvan)], ['fa-box-open', k.paket ? U.kac(k.paket.ad) + ' paketi' : 'Paket yok'], ['fa-calendar-day', y ? 'Sıradaki görüşme <b>' + U.tarih(y.tarih) + ', ' + DD.bicim.saat(y.saat) + '</b>' : 'Planlı görüşme yok']])
      + '<p class="alan-yardim"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> <span>' + (dg ? U.kac(dg.kapsam) + ' Dada Diet tarafından <b>' + U.tarih(dg.tarih) + '</b> tarihinde doğrulandı' + (dg.ornek ? ' (prototip örneği)' : '') + '.' : 'Diploması Dada Diet tarafından doğrulandı; doğrulama tarihi kayıtta yok.') + '</span></p></div></div>';
  };
  /* Geçmiş kart: yeni talep varsa düğme geri alma olur */
  const gecmisKart = (k) => {
    const talep = k.randevular.find((r) => r.tarih >= b && U.rAcik(r));
    const gorusme = k.randevular.filter(gecen).length;
    const eylem = U.durum('kapali', 'Sona erdi') + '<span class="satir-eylem">' + profilBag(k) + ikonDugme('Geçmiş mesajlar', 'fa-comment', 'data-sohbet-git="' + k.slug + '"') + (talep ? '' : ikonDugme('Tekrar randevu al', 'fa-calendar-plus', 'data-randevu-al="' + k.slug + '"')) + '</span>';
    return '<div class="kart panel soluk">' + kartBas('fa-user-clock', k, eylem)
      + '<div class="kart-govde">' + metaHtml([['fa-calendar', 'Çalışma tarihi ' + aralik(k)], ['fa-comments', gorusme + ' görüşme']]) + '</div>'
      + (talep ? '<div class="kart-alt eylem"><span class="eylem-notu">Randevu talebin ' + U.tarih(talep.tarih) + ', ' + DD.bicim.saat(talep.saat) + ' için onay bekliyor.</span><button class="dugme hayalet kucuk" type="button" data-randevu-geri="' + talep.id + '">Talebi geri al</button></div>' : '') + '</div>';
  };
  function bilgi() {
    U.bas('#dyAktifler', aktifler().map(aktifKart).join(''));
    const g = gecmisler();
    U.gizle($('#dyGecmisBolum'), !g.length);
    U.bas('#dyGecmisler', g.map(gecmisKart).join(''));
  }

  function hizmet() {
    const satir = (k) => '<tr><td><span class="no">' + U.kac(k.paket.ad) + '<small>' + U.kac(k.ad) + ' · ' + U.kac(k.paket.aciklama) + '</small></span></td><td>' + U.kac(U.basHarf(k.paket.tur)) + '</td><td class="sag">' + k.paket.seans + '</td><td class="tutar sag">' + U.tl(k.paket.fiyat) + '</td><td>' + (k.durum === 'gecmis' ? U.durum('kapali', 'Tamamlandı') : U.durum('cozulen', 'Aktif')) + '</td><td class="eylem-kolon"><span class="satir-eylem">' + ikonBag('Faturayı gör', 'fa-eye', DD.kok + 'hesabim/odemelerim/#faturalar') + '</span></td></tr>';
    const l = kisiler().filter((k) => k.paket), aktif = l.filter((k) => k.durum !== 'gecmis').length;
    $('#dyHizmetOzet').textContent = l.length ? aktif + ' aktif paket, ' + (l.length - aktif) + ' tamamlanmış hizmet. Fatura belgesi Ödemelerim’den indirilir.' : 'Henüz hizmet kaydın yok.';
    U.bas('#dyHizmet', l.map(satir).join('') || bosSatir(6, 'Henüz bir hizmet almadın.'));
  }

  function randevu() {
    const y = yaklasan();
    U.sayac('randevu', y.length);
    const s = y[0];
    const talep = s && U.rTalepMetin(s);
    U.bas('#dySiradaki', s
      ? '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> Sıradaki Görüşmen</h3><p>' + U.tarih(s.tarih) + ' ' + U.gunAdi(s.tarih) + ', ' + DD.bicim.saat(s.saat) + ' · ' + s.sure + ' dakika · ' + U.kac(s.tur) + ' · ' + U.kac(sahip(s).ad) + '</p></div><div class="as-eylem">' + U.rHap(s) + U.durum('acik', U.gunFarki(b, s.tarih) === 0 ? 'Bugün' : U.gunFarki(b, s.tarih) + ' gün sonra') + '</div></div>' + (s.not ? '<div class="kart-govde okuma"><p>' + U.kac(s.not) + '</p></div>' : '') + hazirlik(s) + '<div class="kart-alt eylem">' + (talep ? '<span class="eylem-notu">' + talep + '</span>' : '') + takvimDugme(s, false) + eylemler(s, false) + katil(s, 'birincil') + '</div></div>'
      : '');
    const durumHucre = (r) => { const m = U.rTalepMetin(r); return U.rHap(r) + (m ? '<small class="eylem-notu">' + m + '</small>' : ''); };
    U.bas('#dyRandevular', U.tumRandevular().slice().reverse().map((r) => '<tr><td class="tarih">' + U.noktaliTarih(r.tarih) + '</td><td>' + DD.bicim.saat(r.saat) + '</td><td><span class="no">' + U.kac(U.basHarf(r.tur)) + ' görüşme<small>' + U.kac(sahip(r).ad) + ' · ' + r.sure + ' dakika</small></span></td><td>' + durumHucre(r) + '</td><td class="eylem-kolon"><div class="satir-eylem">' + (r.tarih >= b && U.rAcik(r) && r !== s ? takvimDugme(r, true) + eylemler(r, true) + katil(r, 'birincil kucuk') : '') + '</div></td></tr>').join('') || bosSatir(5, 'Henüz randevun yok.'));
    /* Son iki görüşme özet kartı (ES-HS-53): panelin yazdığı görüşme özeti, yoksa randevu notu */
    const son2 = U.tumRandevular().filter(gecen).slice(-2).reverse();
    U.bas('#dyGorusmeSon', son2.map((r) => '<div class="kart panel"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-clipboard-check" aria-hidden="true"></i> ' + U.tarih(r.tarih) + ' Görüşmesi</h3><p>' + U.kac(U.basHarf(r.tur)) + ' · ' + r.sure + ' dakika · ' + U.kac(sahip(r).ad) + '</p></div><div class="as-eylem">' + U.rHap(r) + '</div></div><div class="kart-govde okuma"><p>' + U.kac(gorusmeMetni(r) || 'Bu görüşme için not yazılmadı.') + '</p></div><div class="kart-alt eylem"><button class="dugme hayalet" type="button" data-sekme-git="not">Diyetisyen notları</button></div></div>').join(''));
    U.gizle($('#dyGorusmeSon'), !son2.length);
    U.bas('#dyGorusme', U.tumRandevular().filter(gecen).reverse().map((r) => '<tr><td class="tarih">' + U.noktaliTarih(r.tarih) + '</td><td>' + U.rHap(r) + '</td><td class="sol"><span class="no">' + U.kac(gorusmeMetni(r) || '—') + '<small>' + U.kac(sahip(r).ad) + '</small></span></td></tr>').join('') || bosSatir(3, 'Henüz tamamlanan görüşmen yok.'));
    hak();
    /* İstek ve hareketler: randevu kayıtlarından türer, en yeni üstte */
    const HR = [];
    U.tumRandevular().forEach((r) => {
      const ne = U.tarih(r.tarih) + ', ' + DD.bicim.saat(r.saat) + ' · ' + sahip(r).ad;
      HR.push({ t: r.olusturma || r.tarih, i: 'fa-calendar-plus', b: 'Randevu oluşturuldu', m: ne, h: U.rHap(r) });
      if (r.talep) HR.push({ t: r.tarih, i: r.talep.tur === 'iptal' ? 'fa-calendar-xmark' : 'fa-clock-rotate-left', b: r.talep.tur === 'iptal' ? 'İptal talebi' : 'Saat değişikliği talebi', m: ne, h: r.talep.durum === 'bekliyor' ? U.durum('bekleyen', 'Onay bekliyor') : U.durum('kapali', 'Sonuçlandı') });
      if (r.talep_sonuc) HR.push({ t: r.tarih, i: 'fa-reply', b: r.talep_sonuc === 'kabul' ? 'Talebin kabul edildi' : 'Talebin reddedildi', m: ne, h: U.durum(r.talep_sonuc === 'kabul' ? 'cozulen' : 'hata', r.talep_sonuc === 'kabul' ? 'Kabul' : 'Red') });
      if (U.rDurum(r) === 'iptal') HR.push({ t: r.tarih, i: 'fa-ban', b: 'Randevu iptal edildi', m: ne, h: U.durum('kapali', r.iptal_eden === 'diyetisyen' ? 'Diyetisyen iptal etti' : 'İptal') });
    });
    U.bas('#dyRandevuHareket', HR.sort((a, c) => String(c.t).localeCompare(String(a.t))).slice(0, 8).map((x) => satirKur(x.i, x.b, x.m, x.h)).join('') || U.bos({ ikon: 'fa-timeline', baslik: 'Henüz randevu hareketin yok', metin: 'Randevu oluşturduğunda ya da değişiklik istediğinde burada görünür.' }));
  }

  /* Mesaj eki (Dy2): dosya bu tarayıcının belge kasasına (IndexedDB) yazılır, mesaj adı, boyutu, türü ve anahtarı taşır.
     Diyetisyen paneli aynı tarayıcıda eki indirir; başka cihazda yalnız adı görünür. */
  const kasa = DD.belgeKasa || null, resimler = new Map();
  const gorselMi = (ek) => /^image\//.test(ek.tip || '') || /\.(png|jpe?g|webp|gif)$/i.test(ek.ad || '');
  function resimYukle() {
    document.querySelectorAll('#dyAkis img[data-ek-resim]').forEach((img) => {
      const k = img.dataset.ekResim;
      if (resimler.has(k)) { img.src = resimler.get(k); return; }
      if (kasa) kasa.al(k).then((v) => { if (v) { resimler.set(k, v.url); img.src = v.url; } else img.closest('.sohbet-ek').classList.add('yok'); });
    });
  }
  const boyut = (n) => (n >= 1048576 ? U.sayi(n / 1048576, 1) + ' MB' : U.sayi(Math.max(1, n / 1024)) + ' KB');
  const okunmamis = (k) => (k.ana ? U.uye().okunmamis_mesaj || 0 : k.okunmamis || 0);
  function kisiSerit() {
    U.bas('#dyKisiler', kisiler().map((k) => {
      const n = okunmamis(k), son = sohbetAl(k).mesajlar.slice(-1)[0];
      return '<button class="sohbet-kisi' + (k.slug === sohbetKisi ? ' secili' : '') + '" type="button" data-sohbet-sec="' + k.slug + '" aria-pressed="' + (k.slug === sohbetKisi) + '"><span class="sohbet-mono ' + (k.durum === 'aktif' ? 'ok' : 'pasif') + '">' + U.kac(k.harf || k.ad[0]) + '</span><span class="sohbet-kisi-txt"><b>' + U.kac(k.ad) + '</b><small>' + (k.durum === 'aktif' ? (n ? n + ' okunmamış' : son ? U.tarih(son.zaman) : 'Henüz mesaj yok') : 'Geçmiş, yalnız okunur') + '</small></span></button>';
    }).join(''));
  }
  function mesaj() {
    const k = kisi(sohbetKisi), s = sohbetAl(k), acik = k.durum === 'aktif', y = yaklasan().find((r) => sahip(r).slug === k.slug);
    kisiSerit();
    $('#dyMono').textContent = k.harf || k.ad[0];
    $('#dyMono').className = 'sohbet-mono buyuk ' + (acik ? 'ok' : 'pasif');
    $('#dySohbetAd').textContent = k.ad;
    $('#dySohbetAlt').textContent = !acik ? 'Çalışma tarihi · ' + aralik(k) : y ? 'Sıradaki görüşmen · ' + U.kisaTarih(y.tarih) + ', ' + DD.bicim.saat(y.saat) : 'Planlanmış görüşmen yok';
    let gun = '';
    U.bas('#dyAkis', s.mesajlar.map((m, i) => {
      const t = m.zaman.slice(0, 10);
      const ayrac = t !== gun ? '<span class="sohbet-gun">' + U.kisaTarih(t) + '</span>' : '';
      gun = t;
      /* Diyetisyenin eki bu tarayıcının belge kasasındaysa indirilir (panel sohbeti yazar); yoksa adı ve boyutu görünür */
      const ek = !m.ek ? '' : m.ek.kaldirildi ? '<span class="sohbet-ek"><i class="fa-solid fa-file-circle-xmark" aria-hidden="true"></i><small>' + U.kac(m.ek.ad) + ' kaldırıldı</small></span>'
        : m.ek.anahtar && gorselMi(m.ek) ? '<button class="sohbet-ek gorsel" type="button" data-ek-gor="' + U.kac(m.ek.anahtar) + '" data-ek-ad="' + U.kac(m.ek.ad) + '" aria-label="' + U.kac(m.ek.ad) + ' görselini aç"><img class="sohbet-ek-resim" data-ek-resim="' + U.kac(m.ek.anahtar) + '" alt=""><small>' + U.kac(m.ek.ad) + (m.ek.boyut ? ' · ' + boyut(m.ek.boyut) : '') + '</small></button>'
        : m.ek.anahtar ? '<button class="sohbet-ek" type="button" data-ek-indir="' + U.kac(m.ek.anahtar) + '" data-ek-ad="' + U.kac(m.ek.ad) + '" aria-label="' + U.kac(m.ek.ad) + ' dosyasını indir"><i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i><b>' + U.kac(m.ek.ad) + '</b>' + (m.ek.boyut ? '<small>' + boyut(m.ek.boyut) + '</small>' : '') + '</button>'
        : '<span class="sohbet-ek"><i class="fa-solid fa-paperclip" aria-hidden="true"></i><b>' + U.kac(m.ek.ad) + '</b>' + (m.ek.boyut ? '<small>' + boyut(m.ek.boyut) + '</small>' : '') + '</span>';
      return ayrac + '<div class="sohbet-balon ' + (m.kimden === 'danisan' ? 'uye' : 'karsi') + '">' + (m.metin && !(m.ek && m.metin === m.ek.ad) ? '<p>' + U.kac(m.metin) + '</p>' : '') + ek + '<span class="sohbet-kunye">' + DD.bicim.saat(m.zaman.slice(11, 16)) + (m.kimden === 'danisan' ? '' : m.uye_bildirdi ? ' · <span class="rozet bekleme"><i class="fa-solid fa-flag" aria-hidden="true"></i> Bildirildi</span>' : ' · <button class="bag-dugme" type="button" data-mesaj-bildir="' + i + '" aria-label="Bu mesajı bildir"><i class="fa-solid fa-flag" aria-hidden="true"></i> Bildir</button>') + '</span></div>';
    }).join('') || U.bos({ ikon: 'fa-comments', baslik: 'Henüz mesaj yok', metin: acik ? 'Diyetisyenine ilk mesajını aşağıdan yaz.' : 'Bu uzmanla yazışman olmadı.' }));
    resimYukle();
    const a = $('#dyAkis'); a.scrollTop = a.scrollHeight;
    /* Geçmiş ilişkide yazma alanı yerine sebebi söyleyen not */
    U.gizle($('#dyMesajForm'), !acik);
    U.gizle($('#dyMesajKapali'), acik);
    U.bas('#dyMesajKapali', acik ? '' : '<span class="not"><i class="fa-solid fa-lock" aria-hidden="true"></i> ' + U.kac(k.ad) + ' ile çalışman ' + U.tarih(k.bitis) + ' tarihinde sona erdi. Geçmiş mesajlarını okuyabilirsin; yeni mesaj için önce tekrar randevu almalısın.</span><button class="dugme hayalet kucuk" type="button" data-randevu-al="' + k.slug + '">Tekrar randevu al</button>');
    U.sayac('mesaj', kisiler().reduce((t, x) => t + okunmamis(x), 0));
  }
  function okundu() {
    const k = kisi(sohbetKisi);
    if (!okunmamis(k)) return;
    if (k.ana) U.uye().okunmamis_mesaj = 0; else k.okunmamis = 0;
    U.kaydet(); mesaj();
  }

  function notlar() {
    const p = U.plan();
    const l = [];
    if (p && p.danisana_not) l.push(satirKur('fa-clipboard-list', p.ad + ' · ' + U.tarih(p.tarih), p.danisana_not));
    (dn.klinik_notlar || []).filter((x) => x.paylasildi).slice().reverse().forEach((x) => l.push(satirKur('fa-comment-medical', 'Diyetisyen notu · ' + U.tarih(x.tarih), x.metin)));
    U.uzmanlar().forEach((k) => (k.notlar || []).slice().reverse().forEach((x) => l.push(satirKur('fa-comment-medical', k.ad + ' · ' + U.tarih(x.tarih), x.metin))));
    U.tumRandevular().filter((r) => gecen(r) && gorusmeMetni(r)).reverse().forEach((r) => l.push(satirKur('fa-calendar-check', 'Görüşme · ' + sahip(r).ad + ' · ' + U.tarih(r.tarih), gorusmeMetni(r))));
    /* Sabit not + önceki notlar akordeonu (ES-HS-56): panelde sabitlenen paylaşılmış not üstte, yoksa en yeni not */
    const pay = (dn.klinik_notlar || []).filter((x) => x.paylasildi).slice().sort((a, c) => (c.sabit ? 1 : 0) - (a.sabit ? 1 : 0) || String(c.tarih).localeCompare(String(a.tarih)));
    const ust = pay[0];
    U.bas('#dyNotSabit', ust ? '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-thumbtack" aria-hidden="true"></i> ' + (ust.sabit ? 'Sabitlenen Not' : 'Son Not') + '</h3><p>' + U.kac(dy.ad) + ' · ' + U.tarih(ust.tarih) + '</p></div></div><div class="kart-govde okuma"><p>' + U.kac(ust.metin) + '</p></div></div>' : '');
    const once = [];
    if (p && p.danisana_not) once.push({ ikon: 'fa-clipboard-list', b: p.ad + ' · ' + U.tarih(p.tarih), m: p.danisana_not });
    pay.slice(1).forEach((x) => once.push({ ikon: 'fa-comment-medical', b: 'Diyetisyen notu · ' + U.tarih(x.tarih), m: x.metin }));
    U.uzmanlar().forEach((kk) => (kk.notlar || []).slice().reverse().forEach((x) => once.push({ ikon: 'fa-comment-medical', b: kk.ad + ' · ' + U.tarih(x.tarih), m: x.metin })));
    U.tumRandevular().filter((r) => gecen(r) && gorusmeMetni(r)).reverse().forEach((r) => once.push({ ikon: 'fa-calendar-check', b: 'Görüşme · ' + sahip(r).ad + ' · ' + U.tarih(r.tarih), m: gorusmeMetni(r) }));
    $('#dyNotSayi').textContent = once.length ? once.length + ' not; başlığa dokununca açılır.' : '';
    U.bas('#dyNotlar', once.map((x) => '<div class="akordeon-kalem"><button class="akordeon-bas" type="button" aria-expanded="false"><span class="akordeon-ikon"><i class="fa-solid ' + x.ikon + '" aria-hidden="true"></i></span>' + U.kac(x.b) + '<i class="fa-solid fa-chevron-down akordeon-ok" aria-hidden="true"></i></button><div class="akordeon-govde"><p>' + U.kac(x.m) + '</p></div></div>').join('') || U.bos({ ikon: 'fa-note-sticky', baslik: ust ? 'Başka not yok' : 'Henüz paylaşılan not yok', metin: 'Diyetisyenin sana not bıraktığında burada görünür.' }));
  }

  function dosyalar() {
    const p = U.plan();
    /* Gelen dosyada Görüntüle / İndir (ES-HS-57): plan PDF'i istemcide üretilir, mesaj eki belge kasasından açılır;
       içeriği prototipte olmayan örnek dosya Görüntüle'de bunu söyler */
    const gelen = (p ? [satirKur('fa-file-pdf', p.ad + '.pdf', U.tarih(U.planBas(p)) + ' · Beslenme planı · ' + dy.ad, '<span class="satir-eylem">' + ikonBag('Görüntüle', 'fa-eye', DD.kok + 'hesabim/beslenme-planim/#hafta') + ikonDugme('İndir', 'fa-download', 'data-plan-pdf') + '</span>')] : [])
      .concat((U.sohbet().mesajlar || []).filter((m) => m.kimden === 'diyetisyen' && m.ek && !m.ek.kaldirildi).reverse().map((m) => satirKur('fa-paperclip', m.ek.ad, U.tarih(m.zaman.slice(0, 10)) + ' · Mesaj eki · ' + dy.ad, '<span class="satir-eylem">' + (m.ek.anahtar ? ikonDugme('Görüntüle', 'fa-eye', 'data-ek-gor="' + U.kac(m.ek.anahtar) + '" data-ek-ad="' + U.kac(m.ek.ad) + '"') + ikonDugme('İndir', 'fa-download', 'data-ek-indir="' + U.kac(m.ek.anahtar) + '" data-ek-ad="' + U.kac(m.ek.ad) + '"') : ikonDugme('Görüntüle', 'fa-eye', 'data-ornek-dosya="' + U.kac(m.ek.ad) + '" data-kimden="' + U.kac(dy.ad) + '"')) + '</span>')))
      .concat(...U.uzmanlar().map((k) => (k.dosyalar || []).map((x) => satirKur('fa-file-pdf', x.ad, U.tarih(x.tarih) + ' · ' + x.tur + ' · ' + k.ad, '<span class="satir-eylem">' + ikonDugme('Görüntüle', 'fa-eye', 'data-ornek-dosya="' + U.kac(x.ad) + '" data-kimden="' + U.kac(k.ad) + '"') + '</span>'))));
    U.bas('#dyGelen', gelen.join('') || U.bos({ ikon: 'fa-inbox', baslik: 'Henüz dosya yok', metin: 'Diyetisyenin dosya gönderdiğinde burada listelenir.' }));
    const l = (dn.tahliller || []).map((t) => satirKur('fa-file-pdf', t.dosya_adi, U.tarih(t.tarih) + ' · Tahlil'))
      .concat(U.yerel('paylasilanDosya', []).map((d) => satirKur('fa-file-arrow-up', d.ad, U.tarih(d.tarih) + ' · ' + (d.tur ? d.tur + ' · ' : '') + 'Sen paylaştın', U.durum('acik', 'Giden'))))
      .concat((U.sohbet().mesajlar || []).filter((m) => m.kimden === 'danisan' && m.ek && !m.ek.kaldirildi).reverse().map((m) => satirKur(gorselMi(m.ek) ? 'fa-image' : 'fa-paperclip', m.ek.ad, U.tarih(m.zaman.slice(0, 10)) + ' · Mesaj eki · ' + dy.ad, m.ek.anahtar ? '<span class="satir-eylem">' + ikonDugme('Görüntüle', 'fa-eye', 'data-ek-gor="' + U.kac(m.ek.anahtar) + '" data-ek-ad="' + U.kac(m.ek.ad) + '"') + '</span>' : '')));
    U.bas('#dyGiden', l.join('') || U.bos({ ikon: 'fa-folder-open', baslik: 'Henüz paylaşmadın', metin: 'Tahlil ya da belge paylaşabilirsin.', eylem: '<button class="dugme hayalet" type="button" data-ac="#dyDosya">Dosya paylaş</button>' }));
  }

  function hak() {
    const l = aktifler().filter((k) => k.paket);
    if (!l.length) { U.bas('#dyHak', '<p class="alan-yardim"><span>Aktif paketin yok.</span></p>'); return; }
    const kullanim = (k) => k.randevular.filter((r) => r.paket_id === k.paket.id && r.durum !== 'iptal');
    const s = (i, e, d) => '<div class="sayac"><i class="fa-solid ' + i + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + d + '</b></div></div>';
    U.bas('#dyHak', '<div class="yigin">' + l.map((k) => {
      const kull = kullanim(k), biten = kull.filter(gecen).length, ayrilan = kull.length - biten, kalan = Math.max(0, k.paket.seans - kull.length);
      const oran = Math.min(100, Math.round((kull.length / k.paket.seans) * 100));
      return '<div><p class="kart-metin"><b>' + U.kac(k.ad) + '</b></p><div class="olcer hap" role="img" aria-label="' + U.kac(k.ad) + ' paket kullanımı: yüzde ' + oran + '"><span data-oran="' + oran + '"></span></div><div class="sayac-izgara">' + s('fa-box-open', 'Paket', U.kac(k.paket.ad)) + s('fa-circle-check', 'Kullanılan', biten + ' seans') + s('fa-calendar-check', 'Ayrılan', ayrilan + ' seans') + s('fa-ticket', 'Kalan', kalan + ' seans') + '</div></div>';
    }).join('') + '</div>');
    const gecmis = l.reduce((t, k) => t.concat(kullanim(k)), []).sort((x, y) => (y.tarih + y.saat).localeCompare(x.tarih + x.saat));
    U.bas('#dyHakGecmis', gecmis.map((r) => '<tr><td class="tarih">' + U.noktaliTarih(r.tarih) + '</td><td><span class="no">' + U.kac(U.basHarf(r.tur)) + ' görüşme · ' + DD.bicim.saat(r.saat) + '<small>' + U.kac(sahip(r).ad) + '</small></span></td><td>' + (gecen(r) ? U.durum(U.rDurum(r) === 'gelmedi' ? 'hata' : 'cozulen', U.rDurum(r) === 'gelmedi' ? 'Gelmedi, hak düştü' : 'Kullanıldı') : U.durum('acik', 'Ayrıldı')) + '</td></tr>').join('') || bosSatir(3, 'Henüz hak kullanmadın.'));
  }

  /* Takvim: musaitlik ve dolu randevulara göre saat listesi */
  function saatler(k, tarih, sure, haric) {
    const d = U.d(), m = k.musaitlik || {};
    const g = (m.haftalik || []).find((x) => x.gun === U.gunAdi(tarih));
    const dk = (s) => { const p = s.split(':').map(Number); return p[0] * 60 + p[1]; };
    /* Diyetisyenin tek seferlik açtığı seans (panel Takvim > Açık seans) müsaitlik dışında da seçilir */
    const ekler = k.ana ? ((d.musaitlik || {}).ek_seanslar || []).filter((e) => e.tarih === tarih && e.sure >= sure) : [];
    if (!g || !g.acik || (m.kapali_tarihler || []).some((x) => x.tarih === tarih)) return ekSaatler(d, k, tarih, ekler, sure, haric, dk);
    /* Kapalı saat blokları, uzmanın açık randevuları ve üyenin öteki görüşmeleri çakışma sayılır */
    const aralikDk = (r) => [dk(r.saat), dk(r.saat) + r.sure];
    const acikGun = (r) => r.tarih === tarih && U.rAcik(r) && r.id !== haric;
    const dolu = (k.ana ? (d.takvim_bloklari || []).filter((x) => x.tarih === tarih).map(aralikDk).concat((d.randevular || []).filter(acikGun).map(aralikDk)) : [])
      .concat(U.tumRandevular().filter(acikGun).map(aralikDk));
    /* Seanslar arası tampon iki yöne uygulanır; panelde olduğu gibi öğle arasına uygulanmaz */
    const tampon = m.tampon || 0, ara = Array.isArray(g.ara) && g.ara.length === 2 ? [dk(g.ara[0]), dk(g.ara[1])] : null;
    const l = [];
    for (let t = dk(g.baslangic); t + sure <= dk(g.bitis); t += sure) {
      if (ara && t < ara[1] && t + sure > ara[0]) continue;
      if (!dolu.some(([a, z]) => t - tampon < z && t + sure + tampon > a)) l.push(String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'));
    }
    ekSaatler(d, k, tarih, ekler, sure, haric, dk).forEach((s) => { if (!l.includes(s)) l.push(s); });
    return l.sort();
  }
  function ekSaatler(d, k, tarih, ekler, sure, haric, dk) {
    if (!ekler.length) return [];
    const aralikDk = (r) => [dk(r.saat), dk(r.saat) + r.sure];
    const acikGun = (r) => r.tarih === tarih && U.rAcik(r) && r.id !== haric;
    const dolu = (d.randevular || []).filter(acikGun).map(aralikDk).concat(U.tumRandevular().filter(acikGun).map(aralikDk));
    return ekler.map((e) => e.saat).filter((s) => !dolu.some(([a, z]) => dk(s) < z && dk(s) + sure > a));
  }
  function saatBagla(onek, sure, haric, sahibi) {
    const t = $('#' + onek + 'Tarih'), s = $('#' + onek + 'Saat'), y = $('#' + onek + 'Yardim span');
    t.min = U.gunEkle(b, 1);
    const yenile = () => {
      const l = t.value ? saatler(sahibi(), t.value, sure(), haric && haric()) : [];
      s.innerHTML = l.map((x) => '<option>' + x + '</option>').join('');
      s.disabled = !l.length;
      y.textContent = !t.value ? 'Önce tarih seç.' : l.length ? l.length + ' uygun saat var.' : 'Bu tarihte diyetisyenin müsait değil, başka bir gün seç.';
    };
    t.addEventListener('change', yenile);
    yenile();
    return yenile;
  }
  const otomatik = (k) => (k.musaitlik || {}).onay === 'otomatik';
  const slot = (k, tur) => ((k.musaitlik || {}).slot || {})[tur] || 45;
  const uzSec = $('#yeniUzman'), turSec = $('#yeniTur');
  const seciliKisi = () => kisi(uzSec.value);
  uzSec.innerHTML = kisiler().map((k) => '<option value="' + k.slug + '">' + U.kac(k.ad) + (k.durum === 'gecmis' ? ' (geçmiş)' : '') + '</option>').join('');
  const yeniYenile = saatBagla('yeni', () => slot(seciliKisi(), turSec.value), null, seciliKisi);
  /* Seçilen uzmanın sunmadığı görüşme türü kapanır */
  function uzmanUygula() {
    const k = seciliKisi();
    [...turSec.options].forEach((o) => { o.disabled = !(o.value === 'online' ? k.online : k.yuz_yuze); });
    if (turSec.selectedOptions[0].disabled) turSec.value = k.online ? 'online' : 'yüz yüze';
    $('#dyRandevuForm button[type=submit]').textContent = otomatik(k) ? 'Randevu Oluştur' : 'Talebi gönder';
    yeniYenile();
  }
  uzSec.addEventListener('change', uzmanUygula);
  turSec.addEventListener('change', yeniYenile);
  uzmanUygula();
  let secili = null;
  const seciliR = () => U.tumRandevular().find((x) => x.id === secili);
  const ertYenile = saatBagla('ert', () => (seciliR() ? seciliR().sure : 45), () => secili, () => (seciliR() ? sahip(seciliR()) : ece()));

  const ciz = () => { bilgi(); hizmet(); randevu(); notlar(); mesaj(); dosyalar(); };

  $('#dyRandevuForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = $('#yeniTarih').value, s = $('#yeniSaat').value, tur = turSec.value, k = seciliKisi();
    if (!t || !s) { DD.toast('Tarih ve saat seç.', 'hata'); return; }
    const kayit = { id: 'r-u' + Date.now(), danisan_id: U.uyeId(), paket_id: k.ana ? dn.paket_id : (k.durum === 'aktif' && k.paket && k.randevular.filter((r) => r.paket_id === k.paket.id && r.durum !== 'iptal').length < k.paket.seans ? k.paket.id : null), tarih: t, saat: s, sure: slot(k, tur), tur, durum: otomatik(k) ? 'dolu' : 'onay-bekliyor', not: '', olusturan: 'uye' };
    if (k.ana) U.d().randevular.push(kayit); else k.randevular.push(Object.assign(kayit, { uzman: k.slug }));
    U.kaydet(); DD.kapat($('#dyRandevu')); ciz(); yeniYenile();
    DD.toast(otomatik(k) ? 'Randevun oluşturuldu: ' + U.tarih(t) + ', ' + s + '.' : 'Randevu talebin ' + k.ad + ' için iletildi, onay bekliyor.');
  });
  /* Takvime ekle (SH-10-22): .ics dosyası; saat Türkiye saatiyle yazılır */
  function takvimDugme(r, kucuk) { return kucuk ? ikonDugme('Takvime ekle', 'fa-calendar-check', 'data-takvim="' + r.id + '"') : '<button class="dugme hayalet" type="button" data-takvim="' + r.id + '"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Takvime ekle</button>'; }
  function ics(r) {
    const k = sahip(r), z = (t, s) => t.replace(/-/g, '') + 'T' + s.replace(':', '') + '00';
    const bas = new Date(r.tarih + 'T' + r.saat + ':00'), son = new Date(bas.getTime() + (r.sure || 45) * 60000);
    const iki = (n) => String(n).padStart(2, '0'), bit = son.getFullYear() + iki(son.getMonth() + 1) + iki(son.getDate()) + 'T' + iki(son.getHours()) + iki(son.getMinutes()) + '00';
    const kac = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/[,;]/g, (x) => '\\' + x).replace(/\n/g, '\\n');
    const yer = r.tur === 'online' ? (r.baglanti || 'Online görüşme; bağlantı Diyetisyenim sayfasında') : 'Yüz yüze görüşme · ' + (k.sehir || '');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dada Diet//Prototip//TR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', 'UID:' + r.id + '@dadadiet.com', 'DTSTAMP:' + z(b, '00:00') + 'Z', 'DTSTART;TZID=Europe/Istanbul:' + z(r.tarih, r.saat), 'DTEND;TZID=Europe/Istanbul:' + bit, 'SUMMARY:' + kac('Dada Diet · ' + k.ad + ' ile görüşme'), 'LOCATION:' + kac(yer), 'DESCRIPTION:' + kac((r.not ? r.not + ' ' : '') + 'Randevunu Hesabım › Diyetisyenim sayfasından yönetebilirsin.'), 'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:' + kac('Görüşmen 30 dakika sonra'), 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  /* Görüşmeye hazırlık paneli (ES-HS-52): bağlantının açılacağı saat ve üç madde */
  function hazirlik(r) {
    const ac = U.gunEkle(r.tarih, 0), dk = Number(r.saat.slice(0, 2)) * 60 + Number(r.saat.slice(3, 5)) - 10, saat = String(Math.floor(dk / 60)).padStart(2, '0') + ':' + String(dk % 60).padStart(2, '0');
    const online = r.tur === 'online', bag = online && /^https?:\/\//.test(r.baglanti || '');
    const madde = online ? ['Kamera, mikrofon ve internet bağlantını kontrol et.', 'Sessiz ve aydınlık bir yer seç; kulaklık sesi netleştirir.', 'Son ölçümünü ve sormak istediklerini önceden not al.'] : ['Görüşmeye 10 dakika erken gel.', 'Son tahlil ve ölçüm sonuçlarını yanında getir.', 'Sormak istediklerini önceden not al.'];
    const ust = online ? (bag ? 'Görüşme bağlantın hazır; ' + U.tarih(ac) + ' günü ' + DD.bicim.saat(saat) + '’dan itibaren katılabilirsin.' : 'Görüşme bağlantısı ' + U.tarih(ac) + ' günü ' + DD.bicim.saat(saat) + '’da (görüşmeden 10 dakika önce) açılır; diyetisyenin ekleyince burada ve bildirimlerinde görünür.') : 'Yüz yüze görüşme; adres ve yol tarifi diyetisyeninin profilinde.';
    return '<div class="kart-govde"><p class="alan-yardim"><i class="fa-solid ' + (online ? 'fa-video' : 'fa-location-dot') + '" aria-hidden="true"></i> <span><b>Görüşmeye hazırlık.</b> ' + ust + '</span></p><ol class="madde-liste">' + madde.map((m) => '<li>' + m + '</li>').join('') + '</ol></div>';
  }
  let bildirilen = null;
  document.addEventListener('click', (e) => {
    const tk = e.target.closest('[data-takvim]');
    if (tk) {
      const r = U.tumRandevular().find((x) => x.id === tk.dataset.takvim);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics(r)], { type: 'text/calendar;charset=utf-8' }));
      a.download = 'dada-diet-gorusme-' + r.tarih + '.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      DD.toast('Görüşmen takvim dosyası olarak indirildi; açınca takvimine eklenir.');
      return;
    }
    if (e.target.closest('[data-plan-pdf]')) {
      const p = U.plan(), kk = { anahtar: p.id, tip: 'plan', ad: p.ad, plan: p }, bas = U.planBas(p);
      const gunler = [0, 1, 2, 3, 4, 5, 6].map((i) => { const t = U.gunEkle(bas, i); return { gun: U.gunAdi(t), tarih: U.kisaTarih(t), durum: t === b ? 'Bugün' : t < b ? 'Geçti' : 'Planlandı', ogunler: U.secilenOgunler(kk, t).map((o) => ({ ad: o.ad, saat: DD.bicim.saat(o.saat), metin: o.metin })) }; });
      DD.menuPdf({ program: p.ad, aralik: U.kisaTarih(bas) + ' – ' + U.kisaTarih(U.gunEkle(bas, 6)), uye: U.uye().ad, gunler })
        .then(() => DD.toast(p.ad + ' PDF olarak indirildi.'))
        .catch(() => DD.toast('PDF hazırlanamadı, tekrar dene.', 'hata'));
      return;
    }
    const gr = e.target.closest('[data-ek-gor]');
    if (gr) {
      if (!DD.belgeKasa) { DD.toast('Dosya bu tarayıcıda açılamıyor.', 'uyari'); return; }
      DD.belgeKasa.al(gr.dataset.ekGor).then((v) => {
        if (!v) { DD.toast('Dosya bu tarayıcıda yok. Prototipte dosya gönderildiği tarayıcıda saklanır.', 'uyari'); return; }
        const gorsel = /^image\//.test(v.tip || '') || /\.(png|jpe?g|webp|gif)$/i.test(gr.dataset.ekAd);
        $('#dyDosyaGorBaslik').textContent = gr.dataset.ekAd;
        U.bas('#dyDosyaGorGovde', gorsel ? '<img class="belge-gorsel" src="' + v.url + '" alt="' + U.kac(gr.dataset.ekAd) + '">' : '<iframe class="belge-cerceve" src="' + v.url + '" title="' + U.kac(gr.dataset.ekAd) + '"></iframe>');
        DD.ac('#dyDosyaGor');
      });
      return;
    }
    const od = e.target.closest('[data-ornek-dosya]');
    if (od) {
      $('#dyDosyaGorBaslik').textContent = od.dataset.ornekDosya;
      U.bas('#dyDosyaGorGovde', U.bos({ ikon: 'fa-file-circle-question', baslik: 'Prototip örneği dosya', metin: od.dataset.kimden + ' bu dosyayı paylaştı. Örnek kayıtta dosyanın içeriği yok; canlıda diyetisyeninin yüklediği belge burada açılır ve indirilir.' }));
      DD.ac('#dyDosyaGor');
      return;
    }
    const mb = e.target.closest('[data-mesaj-bildir]');
    if (mb) {
      const kk = kisi(sohbetKisi), m = sohbetAl(kk).mesajlar[Number(mb.dataset.mesajBildir)];
      bildirilen = { kk, m };
      $('#dyBildirAlinti').textContent = '“' + (m.metin || (m.ek ? m.ek.ad : '')) + '”';
      $('#dyBildirForm').reset();
      DD.ac('#dyBildir');
      return;
    }
    const ind = e.target.closest('[data-ek-indir]');
    if (ind) {
      if (!DD.belgeKasa) { DD.toast('Dosya bu tarayıcıda açılamıyor.', 'uyari'); return; }
      DD.belgeKasa.al(ind.dataset.ekIndir).then((v) => {
        if (!v) { DD.toast('Dosya bu tarayıcıda yok. Prototipte dosya gönderildiği tarayıcıda saklanır.', 'uyari'); return; }
        const a = document.createElement('a');
        a.href = v.url; a.download = ind.dataset.ekAd; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(v.url), 4000);
      });
      return;
    }
    const al = e.target.closest('[data-randevu-al]');
    if (al) { uzSec.value = al.dataset.randevuAl; uzmanUygula(); DD.ac('#dyRandevu'); }
    const git = e.target.closest('[data-sohbet-git]');
    /* Mesaj düğmesi sekmeyi değiştirince tıklanan düğme gizlenir ve odak gövdeye düşüyordu; odak yazma alanına (geçmişte kişi düğmesine) geçer */
    if (git) { sohbetKisi = git.dataset.sohbetGit; mesaj(); U.sekmeAc('mesaj'); okundu(); const hedef = kisi(sohbetKisi).durum === 'aktif' ? $('#dyMesaj') : document.querySelector('[data-sohbet-sec="' + sohbetKisi + '"]'); if (hedef) hedef.focus({ preventScroll: true }); }
    const sec = e.target.closest('[data-sohbet-sec]');
    if (sec) { sohbetKisi = sec.dataset.sohbetSec; mesaj(); okundu(); }
    const rg = e.target.closest('[data-randevu-geri]');
    if (rg) {
      const k = U.uzmanlar().find((x) => x.randevular.some((r) => r.id === rg.dataset.randevuGeri));
      k.randevular = k.randevular.filter((r) => r.id !== rg.dataset.randevuGeri);
      U.kaydet(); ciz();
      DD.toast('Randevu talebin geri alındı.', 'uyari');
    }
    const i = e.target.closest('[data-iptal]');
    if (i) {
      secili = i.dataset.iptal;
      const r = seciliR();
      $('#dyIptalMetin').textContent = U.tarih(r.tarih) + ', ' + DD.bicim.saat(r.saat) + ' görüşmen için iptal talebi gönderilecek. Diyetisyenin onayladığında randevu iptal olur ve seans hakkın geri yüklenir.';
      $('#dyIptalKutu').checked = false; $('#dyIptalOnay').disabled = true; U.gizle($('#dyIptalKilit'), false);
      DD.ac('#dyIptal');
    }
    const t = e.target.closest('[data-ertele]');
    if (t) { secili = t.dataset.ertele; ertYenile(); DD.ac('#dyErtele'); }
    const g = e.target.closest('[data-talep-geri]');
    if (g) {
      delete U.tumRandevular().find((x) => x.id === g.dataset.talepGeri).talep;
      U.kaydet(); ciz();
      DD.toast('Talebin geri alındı.', 'uyari');
    }
  });
  /* Randevu değişmez; talep panelde onaylanınca uygulanır */
  /* Mesaj bildirme (ES-HS-54): panelin mesaj_bildirimleri kaydına üye tarafı olarak yazılır */
  $('#dyBildirForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!bildirilen) return;
    const g = $('#dyBildirGerekce').value;
    if (!g) { DD.toast('Bir gerekçe seç.', 'hata'); return; }
    const d = U.d();
    (d.mesaj_bildirimleri = d.mesaj_bildirimleri || []).push({ id: 'mb' + Date.now(), danisan_id: U.uyeId(), uzman: bildirilen.kk.slug, bildiren: 'danisan', mesaj_zaman: bildirilen.m.zaman, gerekce: g, aciklama: $('#dyBildirAciklama').value.trim(), zaman: b, durum: 'inceleniyor' });
    bildirilen.m.uye_bildirdi = true;
    U.kaydet(); DD.kapat($('#dyBildir')); mesaj();
    DD.toast('Mesaj moderasyon ekibine bildirildi.');
  });
  $('#dyIptalKutu').addEventListener('change', (e) => { $('#dyIptalOnay').disabled = !e.target.checked; U.gizle($('#dyIptalKilit'), e.target.checked); });
  $('#dyIptalOnay').addEventListener('click', () => {
    if (!$('#dyIptalKutu').checked) return;
    seciliR().talep = { tur: 'iptal', durum: 'bekliyor' };
    delete seciliR().talep_sonuc;
    U.kaydet(); DD.kapat($('#dyIptal')); ciz();
    DD.toast('İptal talebin diyetisyenine iletildi.', 'uyari');
  });
  $('#dyErteleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = $('#ertTarih').value, s = $('#ertSaat').value;
    if (!t || !s) { DD.toast('Tarih ve saat seç.', 'hata'); return; }
    seciliR().talep = { tur: 'saat', durum: 'bekliyor', yeni_tarih: t, yeni_saat: s };
    delete seciliR().talep_sonuc;
    U.kaydet(); DD.kapat($('#dyErtele')); ciz();
    DD.toast('Saat değişikliği talebin iletildi: ' + U.tarih(t) + ', ' + s + '.');
  });
  /* Ek seçimi: gönderilmeden önce yazma alanının üstünde önizlenir (görselse küçük resim), kaldırılabilir */
  let ekDosya = null, ekUrl = null;
  const EK_SINIR = 10 * 1024 * 1024;
  function ekCiz() {
    const o = $('#dyEkOnizleme');
    U.gizle(o, !ekDosya);
    if (!ekDosya) { o.innerHTML = ''; return; }
    const g = /^image\//.test(ekDosya.type);
    o.innerHTML = (g ? '<img class="sohbet-ek-onizleme" src="' + ekUrl + '" alt="">' : '<span class="as-ikon"><i class="fa-solid fa-file-lines" aria-hidden="true"></i></span>')
      + '<span class="sohbet-ek-ad"><b>' + U.kac(ekDosya.name) + '</b><small>' + boyut(ekDosya.size) + ' · dosya bu tarayıcıda saklanır, diyetisyenin aynı tarayıcıdaki panelde açar (prototip)</small></span>'
      + ikonDugme('Eki kaldır', 'fa-trash', 'id="dyEkKaldir"', 'yikici');
  }
  function ekBirak() { if (ekUrl && !resimlerdeMi(ekUrl)) URL.revokeObjectURL(ekUrl); ekDosya = null; ekUrl = null; $('#dyEkDosya').value = ''; ekCiz(); }
  const resimlerdeMi = (u) => [...resimler.values()].includes(u);
  $('#dyEkSec').addEventListener('click', () => $('#dyEkDosya').click());
  $('#dyEkDosya').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > EK_SINIR) { DD.toast('Dosya 10 MB sınırını aşıyor.', 'hata'); e.target.value = ''; return; }
    if (ekUrl) URL.revokeObjectURL(ekUrl);
    ekDosya = f; ekUrl = URL.createObjectURL(f); ekCiz();
    $('#dyMesaj').focus({ preventScroll: true }); yazmaYerlestir();
  });
  $('#dyEkOnizleme').addEventListener('click', (e) => { if (e.target.closest('#dyEkKaldir')) { ekBirak(); $('#dyMesaj').focus(); } });
  $('#dyMesajForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const m = $('#dyMesaj'), metin = m.value.trim();
    if (!metin && !ekDosya) return;
    const k = kisi(sohbetKisi), s = sohbetAl(k);
    if (k.durum !== 'aktif') return;
    const zaman = b + 'T' + new Date().toTimeString().slice(0, 5), kayit = { kimden: 'danisan', zaman, metin: metin || (ekDosya ? ekDosya.name : '') };
    const f = ekDosya;
    if (f) {
      kayit.ek = { ad: f.name, boyut: f.size, tip: f.type };
      const anahtar = 'mesaj|' + U.uyeId() + '|' + zaman + '|' + Date.now();
      if (kasa) { kayit.ek.anahtar = anahtar; resimler.set(anahtar, ekUrl); kasa.koy(anahtar, f).then((ok) => { if (!ok) { delete kayit.ek.anahtar; U.kaydet(); mesaj(); DD.toast('Dosya bu tarayıcıya kaydedilemedi; yalnız adı gönderildi.', 'uyari'); } }); }
    }
    s.mesajlar.push(kayit);
    if (k.ana) s.okunmamis = (s.okunmamis || 0) + 1; /* panelde okunmamış olarak görünür */
    ekDosya = null; ekUrl = null; $('#dyEkDosya').value = ''; ekCiz();
    U.kaydet(); m.value = ''; mesaj(); dosyalar();
  });
  $('#dyMesaj').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#dyMesajForm').requestSubmit(); } });
  $('#dyDosyaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = $('#dyDosyaGirdi').files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { DD.toast('Dosya 10 MB sınırını aşıyor.', 'hata'); return; }
    U.yerel('paylasilanDosya', []).push({ ad: f.name, tarih: b, tur: $('#dyDosyaTur').value });
    U.kaydet(); e.target.reset(); DD.kapat($('#dyDosya')); dosyalar();
    DD.toast('Dosyan paylaşıldı.');
  });
  /* Mesajlar sekmesi açılınca akış yeniden çizilir (yüzen sohbet panelinden yazılan mesaj da görünür) ve en son mesaja iner */
  /* Yazma alanı ekranda kalsın: form, alttaki sabit yüzeylerin (mobil sekme çubuğu, köşedeki Mentör ve kenar düğmeleri) üstüne getirilir.
     Bu yüzeylerin kendi kaçınma ölçüsü yazma satırını yalnız ekranın en dibindeyken görüyor (mentor.js, kenar-dugmeler.js) */
  function yazmaYerlestir() {
    const f = $('#dyMesajForm').hidden ? $('#dyMesajKapali') : $('#dyMesajForm'), r = f.getBoundingClientRect();
    const ust = [...document.querySelectorAll('.bottom-nav,.alt-cubuk,#dadaMentor,#msjFab,.basa-don')].filter((o) => o.getClientRects().length && getComputedStyle(o).visibility !== 'hidden' && getComputedStyle(o).opacity !== '0').map((o) => o.getBoundingClientRect()).filter((o) => o.top > innerHeight / 2 && o.left < r.right && o.right > r.left).map((o) => o.top);
    const alt = Math.min(innerHeight, ...ust) - 12;
    if (r.bottom > alt) window.scrollBy({ top: r.bottom - alt, behavior: 'smooth' });
  }
  function yazmaGoster() {
    const yap = yazmaYerlestir;
    if ('onscrollend' in window) { let bitti = false; window.addEventListener('scrollend', () => { if (!bitti) { bitti = true; yap(); } }, { once: true }); setTimeout(() => { if (!bitti) { bitti = true; yap(); } }, 700); } else setTimeout(yap, 500);
  }
  document.addEventListener('dd:sekme', (e) => { if (e.detail.id === 'dy-tab-mesaj') { mesaj(); okundu(); yazmaGoster(); } });

  ciz();

  /* Takvimden gelen ?tarih=YYYY-MM-DD&saat=HH:MM randevu formunu ön dolu açar */
  function onDoldur() {
    const q = new URLSearchParams(location.search), tarih = q.get('tarih'), saat = q.get('saat');
    if (secilen) { DD.toast(secilen.ad + ' paketin seçildi. Şimdi ilk görüşmeni planla.'); U.sekmeAc('randevu'); DD.ac('#dyRandevu'); }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tarih || '')) return;
    DD.ac('#dyRandevu');
    if (tarih <= b) { DD.toast('Geçmiş bir tarih için randevu alınamaz, yeni tarih seç.', 'uyari'); return; }
    $('#yeniTarih').value = tarih;
    yeniYenile();
    if (!/^\d{2}:\d{2}$/.test(saat || '')) return;
    /* Profilde seçilen tür (?tur=) önce denenir; saat o türün aralığında yoksa diğer tür */
    const tur = [q.get('tur'), turSec.value, ...[...turSec.options].map((o) => o.value)].filter((t) => t && [...turSec.options].some((o) => o.value === t && !o.disabled)).find((t) => saatler(seciliKisi(), tarih, slot(seciliKisi(), t)).includes(saat));
    if (!tur) { DD.toast(U.tarih(tarih) + ', ' + saat + ' uygun değil; aynı günden başka bir saat seç.', 'uyari'); return; }
    turSec.value = tur;
    yeniYenile();
    $('#yeniSaat').value = saat;
  }
  document.addEventListener('DOMContentLoaded', onDoldur);
})();
