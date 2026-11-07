/* Diyetisyenim: randevu, mesaj ve notlar demo durumundan okunur; değişiklik panele yansır */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
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
    return '<button class="dugme hayalet tehlike' + k + '" type="button" data-iptal="' + r.id + '">İptal talebi</button><button class="dugme ' + (kucuk ? 'hayalet' : 'birincil') + k + '" type="button" data-ertele="' + r.id + '">Saat değişikliği talebi</button>';
  };
  const satirKur = (i, baslik, metin, sag) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + i + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(baslik) + '</b><span>' + U.kac(metin) + '</span></div>' + (sag ? '<span class="as-eylem">' + sag + '</span>' : '') + '</div>';

  const kunyeHtml = (l, sinif) => '<dl class="kunye' + (sinif ? ' ' + sinif : '') + '">' + l.map((x) => '<div><dt>' + x[0] + '</dt><dd>' + U.kac(x[1]) + '</dd></div>').join('') + '</dl>';
  const kartBas = (ikon, k, sag) => '<div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i> ' + U.kac(k.ad) + '</h3><p>' + U.kac((k.uzmanlik || []).join(' · ')) + '</p></div><div class="as-eylem">' + sag + '</div></div>';
  const profilBag = (k, metin) => '<a class="dugme hayalet" href="' + DD.kok + k.profil + '">' + metin + '</a>';
  const kip = (k) => [k.online && 'Online', k.yuz_yuze && 'Yüz yüze'].filter(Boolean).join(' ve ');
  const aktifKart = (k) => {
    const y = yaklasan().find((r) => sahip(r).slug === k.slug);
    return '<div class="kart panel tam-kolon">' + kartBas('fa-id-card', k, '<span class="durum-hapi cozulen">Doğrulanmış</span>')
      + '<div class="kart-govde">' + kunyeHtml([['Unvan', k.unvan], ['Deneyim', k.deneyim_yil + ' yıl'], ['Görüşme kipi', kip(k)], ['Şehir', k.sehir], ['Paket', k.paket ? k.paket.ad : 'Paket yok'], ['Sıradaki görüşme', y ? U.tarih(y.tarih) + ', ' + DD.bicim.saat(y.saat) : 'Planlı görüşme yok']], 'uc-sutun') + '</div>'
      + '<div class="kart-alt eylem">' + profilBag(k, 'Profili gör') + '<button class="dugme hayalet" type="button" data-sohbet-git="' + k.slug + '"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Mesaj gönder</button><button class="dugme birincil" type="button" data-randevu-al="' + k.slug + '"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i> Randevu oluştur</button></div></div>';
  };
  /* Geçmiş kart: yeni talep varsa düğme geri alma olur */
  const gecmisKart = (k) => {
    const talep = k.randevular.find((r) => r.tarih >= b && U.rAcik(r));
    const gorusme = k.randevular.filter(gecen).length;
    return '<div class="kart panel soluk">' + kartBas('fa-user-clock', k, U.durum('kapali', 'Sona erdi'))
      + '<div class="kart-govde">' + kunyeHtml([['Çalışma tarihi', aralik(k)], ['Görüşme', gorusme + ' görüşme']]) + '</div>'
      + '<div class="kart-alt eylem">' + (talep ? '<span class="eylem-notu">Randevu talebin ' + U.tarih(talep.tarih) + ', ' + DD.bicim.saat(talep.saat) + ' için onay bekliyor.</span>' : '')
      + '<button class="dugme hayalet" type="button" data-sohbet-git="' + k.slug + '">Geçmiş mesajlar</button>' + profilBag(k, 'Profili gör')
      + (talep ? '<button class="dugme hayalet" type="button" data-randevu-geri="' + talep.id + '">Talebi geri al</button>' : '<button class="dugme birincil" type="button" data-randevu-al="' + k.slug + '"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i> Tekrar randevu al</button>') + '</div></div>';
  };
  function bilgi() {
    U.bas('#dyAktifler', aktifler().map(aktifKart).join(''));
    const g = gecmisler();
    U.gizle($('#dyGecmisBolum'), !g.length);
    U.bas('#dyGecmisler', g.map(gecmisKart).join(''));
  }

  function hizmet() {
    const satir = (k) => '<tr><td><span class="no">' + U.kac(k.paket.ad) + '<small>' + U.kac(k.ad) + (k.durum === 'gecmis' ? ' · Tamamlandı' : '') + ' · ' + U.kac(k.paket.aciklama) + '</small></span></td><td>' + U.kac(U.basHarf(k.paket.tur)) + '</td><td class="sag">' + k.paket.seans + '</td><td class="tutar sag">' + U.tl(k.paket.fiyat) + '</td></tr>';
    U.bas('#dyHizmet', kisiler().filter((k) => k.paket).map(satir).join('') || bosSatir(4, 'Henüz bir hizmet almadın.'));
  }

  function randevu() {
    const y = yaklasan();
    U.sayac('randevu', y.length);
    const s = y[0];
    const talep = s && U.rTalepMetin(s);
    U.bas('#dySiradaki', s
      ? '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> Sıradaki görüşmen</h3><p>' + U.tarih(s.tarih) + ' ' + U.gunAdi(s.tarih) + ', ' + DD.bicim.saat(s.saat) + ' · ' + s.sure + ' dakika · ' + U.kac(s.tur) + ' · ' + U.kac(sahip(s).ad) + '</p></div><div class="as-eylem">' + U.rHap(s) + U.durum('acik', U.gunFarki(b, s.tarih) === 0 ? 'Bugün' : U.gunFarki(b, s.tarih) + ' gün sonra') + '</div></div>' + (s.not ? '<div class="kart-govde okuma"><p>' + U.kac(s.not) + '</p></div>' : '') + '<div class="kart-alt eylem">' + (talep ? '<span class="eylem-notu">' + talep + '</span>' : '') + eylemler(s, false) + katil(s, 'birincil') + '</div></div>'
      : '');
    const durumHucre = (r) => { const m = U.rTalepMetin(r); return U.rHap(r) + (m ? '<small class="eylem-notu">' + m + '</small>' : ''); };
    U.bas('#dyRandevular', U.tumRandevular().slice().reverse().map((r) => '<tr><td class="tarih">' + U.noktaliTarih(r.tarih) + '</td><td>' + DD.bicim.saat(r.saat) + '</td><td><span class="no">' + U.kac(U.basHarf(r.tur)) + ' görüşme<small>' + U.kac(sahip(r).ad) + ' · ' + r.sure + ' dakika</small></span></td><td>' + durumHucre(r) + '</td><td class="eylem-kolon"><div class="tablo-eylem">' + (r.tarih >= b && U.rAcik(r) && r !== s ? eylemler(r, true) + katil(r, 'birincil kucuk') : '') + '</div></td></tr>').join('') || bosSatir(5, 'Henüz randevun yok.'));
    U.bas('#dyGorusme', U.tumRandevular().filter(gecen).reverse().map((r) => '<tr><td class="tarih">' + U.noktaliTarih(r.tarih) + '</td><td>' + U.rHap(r) + '</td><td class="sol"><span class="no">' + U.kac(gorusmeMetni(r) || '—') + '<small>' + U.kac(sahip(r).ad) + '</small></span></td></tr>').join('') || bosSatir(3, 'Henüz tamamlanan görüşmen yok.'));
    hak();
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
    U.bas('#dyAkis', s.mesajlar.map((m) => {
      const t = m.zaman.slice(0, 10);
      const ayrac = t !== gun ? '<span class="sohbet-gun">' + U.kisaTarih(t) + '</span>' : '';
      gun = t;
      /* Dosya içeriği saklanmaz; balonda adı ve boyutu görünür */
      const ek = m.ek ? '<span class="sohbet-ek"><i class="fa-solid fa-paperclip" aria-hidden="true"></i><b>' + U.kac(m.ek.ad) + '</b>' + (m.ek.boyut ? '<small>' + boyut(m.ek.boyut) + '</small>' : '') + '</span>' : '';
      return ayrac + '<div class="sohbet-balon ' + (m.kimden === 'danisan' ? 'uye' : 'karsi') + '">' + (m.metin && !(m.ek && m.metin === m.ek.ad) ? '<p>' + U.kac(m.metin) + '</p>' : '') + ek + '<span class="sohbet-kunye">' + DD.bicim.saat(m.zaman.slice(11, 16)) + '</span></div>';
    }).join('') || U.bos({ ikon: 'fa-comments', baslik: 'Henüz mesaj yok', metin: acik ? 'Diyetisyenine ilk mesajını aşağıdan yaz.' : 'Bu uzmanla yazışman olmadı.' }));
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
    U.bas('#dyNotlar', l.join('') || U.bos({ ikon: 'fa-note-sticky', baslik: 'Henüz paylaşılan not yok', metin: 'Diyetisyenin sana not bıraktığında burada görünür.' }));
  }

  function dosyalar() {
    const p = U.plan();
    const gelen = (p ? [satirKur('fa-file-pdf', p.ad + '.pdf', U.tarih(U.planBas(p)) + ' · Beslenme planı · ' + dy.ad, '<a class="dugme hayalet kucuk" href="' + DD.kok + 'hesabim/beslenme-planim/">Planda aç</a>')] : [])
      .concat(...U.uzmanlar().map((k) => (k.dosyalar || []).map((x) => satirKur('fa-file-pdf', x.ad, U.tarih(x.tarih) + ' · ' + x.tur + ' · ' + k.ad))));
    U.bas('#dyGelen', gelen.join('') || U.bos({ ikon: 'fa-inbox', baslik: 'Henüz dosya yok', metin: 'Diyetisyenin dosya gönderdiğinde burada listelenir.' }));
    const l = (dn.tahliller || []).map((t) => satirKur('fa-file-pdf', t.dosya_adi, U.tarih(t.tarih) + ' · Tahlil'))
      .concat(U.yerel('paylasilanDosya', []).map((d) => satirKur('fa-file-arrow-up', d.ad, U.tarih(d.tarih) + ' · Sen paylaştın')));
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
    if (!g || !g.acik || (m.kapali_tarihler || []).some((x) => x.tarih === tarih)) return [];
    const dk = (s) => { const p = s.split(':').map(Number); return p[0] * 60 + p[1]; };
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
    return l;
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
    $('#dyRandevuForm button[type=submit]').textContent = otomatik(k) ? 'Randevu oluştur' : 'Talebi gönder';
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
  document.addEventListener('click', (e) => {
    const al = e.target.closest('[data-randevu-al]');
    if (al) { uzSec.value = al.dataset.randevuAl; uzmanUygula(); DD.ac('#dyRandevu'); }
    const git = e.target.closest('[data-sohbet-git]');
    if (git) { sohbetKisi = git.dataset.sohbetGit; mesaj(); U.sekmeAc('mesaj'); okundu(); }
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
  $('#dyIptalOnay').addEventListener('click', () => {
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
  $('#dyMesajForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const m = $('#dyMesaj'), metin = m.value.trim();
    if (!metin) return;
    const k = kisi(sohbetKisi), s = sohbetAl(k);
    if (k.durum !== 'aktif') return;
    s.mesajlar.push({ kimden: 'danisan', zaman: b + 'T' + new Date().toTimeString().slice(0, 5), metin });
    if (k.ana) s.okunmamis = (s.okunmamis || 0) + 1; /* panelde okunmamış olarak görünür */
    U.kaydet(); m.value = ''; mesaj();
  });
  $('#dyMesaj').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#dyMesajForm').requestSubmit(); } });
  $('#dyDosyaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = $('#dyDosyaGirdi').files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { DD.toast('Dosya 10 MB sınırını aşıyor.', 'hata'); return; }
    U.yerel('paylasilanDosya', []).push({ ad: f.name, tarih: b });
    U.kaydet(); e.target.reset(); DD.kapat($('#dyDosya')); dosyalar();
    DD.toast('Dosyan paylaşıldı.');
  });
  document.addEventListener('dd:sekme', (e) => { if (e.detail.id === 'dy-tab-mesaj') { okundu(); const a = $('#dyAkis'); a.scrollTop = a.scrollHeight; } });

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
    /* Saat seçili türün aralığında yoksa diğer tür denenir */
    const tur = [turSec.value, ...[...turSec.options].map((o) => o.value)].find((t) => saatler(seciliKisi(), tarih, slot(seciliKisi(), t)).includes(saat));
    if (!tur) { DD.toast(U.tarih(tarih) + ', ' + saat + ' uygun değil; aynı günden başka bir saat seç.', 'uyari'); return; }
    turSec.value = tur;
    yeniYenile();
    $('#yeniSaat').value = saat;
  }
  document.addEventListener('DOMContentLoaded', onDoldur);
})();
