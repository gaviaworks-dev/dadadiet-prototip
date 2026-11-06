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
  const bosSatir = (n, m) => '<tr><td colspan="' + n + '" class="bos-hucre">' + m + '</td></tr>';
  const gecen = (r) => ['tamamlandi', 'sonuc-bekliyor', 'gelmedi'].includes(U.rDurum(r));
  const yaklasan = () => U.randevular().filter((r) => r.tarih >= b && U.rAcik(r));
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

  function bilgi() {
    const uz = (dy.uzmanlik || []).join(' · ');
    $('#dyAd').textContent = dy.ad;
    $('#dyUzmanlik').textContent = uz;
    $('#dyProfil').href = DD.kok + 'diyetisyen/' + dy.slug + '/';
    const k = [['Unvan', dy.unvan], ['Deneyim', dy.deneyim_yil + ' yıl'], ['Görüşme kipi', [dy.online && 'Online', dy.yuz_yuze && 'Yüz yüze'].filter(Boolean).join(' ve ')], ['Şehir', dy.sehir]];
    U.bas('#dyKunye', k.map((x) => '<div><dt>' + x[0] + '</dt><dd>' + U.kac(x[1]) + '</dd></div>').join(''));
  }

  function hizmet() {
    U.bas('#dyHizmet', pk ? '<tr><td><span class="no">' + U.kac(pk.ad) + '<small>' + U.kac(pk.aciklama) + '</small></span></td><td>' + U.kac(U.basHarf(pk.tur)) + '</td><td class="sag">' + pk.seans + '</td><td class="tutar sag">' + U.tl(pk.fiyat) + '</td></tr>' : bosSatir(4, 'Henüz bir hizmet almadın.'));
  }

  function randevu() {
    const y = yaklasan();
    U.sayac('randevu', y.length);
    const s = y[0];
    const talep = s && U.rTalepMetin(s);
    U.bas('#dySiradaki', s
      ? '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> Sıradaki görüşmen</h3><p>' + U.tarih(s.tarih) + ' ' + U.gunAdi(s.tarih) + ', ' + s.saat + ' · ' + s.sure + ' dakika · ' + U.kac(s.tur) + '</p></div><div class="as-eylem">' + U.rHap(s) + U.durum('acik', U.gunFarki(b, s.tarih) === 0 ? 'Bugün' : U.gunFarki(b, s.tarih) + ' gün sonra') + '</div></div>' + (s.not ? '<div class="kart-govde okuma"><p>' + U.kac(s.not) + '</p></div>' : '') + '<div class="kart-alt eylem">' + (talep ? '<span class="eylem-notu">' + talep + '</span>' : '') + eylemler(s, false) + katil(s, 'birincil') + '</div></div>'
      : '');
    const durumHucre = (r) => { const m = U.rTalepMetin(r); return U.rHap(r) + (m ? '<small class="eylem-notu">' + m + '</small>' : ''); };
    U.bas('#dyRandevular', U.randevular().slice().reverse().map((r) => '<tr><td class="tarih">' + U.noktaliTarih(r.tarih) + '</td><td>' + r.saat + '</td><td><span class="no">' + U.kac(U.basHarf(r.tur)) + ' görüşme<small>' + r.sure + ' dakika</small></span></td><td>' + durumHucre(r) + '</td><td class="eylem-kolon"><div class="tablo-eylem">' + (r.tarih >= b && U.rAcik(r) && r !== s ? eylemler(r, true) + katil(r, 'birincil kucuk') : '') + '</div></td></tr>').join('') || bosSatir(5, 'Henüz randevun yok.'));
    U.bas('#dyGorusme', U.randevular().filter(gecen).reverse().map((r) => '<tr><td class="tarih">' + U.noktaliTarih(r.tarih) + '</td><td>' + U.rHap(r) + '</td><td class="sol">' + U.kac(gorusmeMetni(r) || '—') + '</td></tr>').join('') || bosSatir(3, 'Henüz tamamlanan görüşmen yok.'));
    hak();
  }

  const boyut = (n) => (n >= 1048576 ? U.sayi(n / 1048576, 1) + ' MB' : U.sayi(Math.max(1, n / 1024)) + ' KB');
  function mesaj() {
    const s = U.sohbet(), y = yaklasan()[0];
    $('#dyMono').textContent = dy.harf || dy.ad[0];
    $('#dySohbetAd').textContent = dy.ad;
    $('#dySohbetAlt').textContent = y ? 'Sıradaki görüşmen · ' + U.kisaTarih(y.tarih) + ', ' + y.saat : 'Planlanmış görüşmen yok';
    let gun = '';
    U.bas('#dyAkis', s.mesajlar.map((m) => {
      const t = m.zaman.slice(0, 10);
      const ayrac = t !== gun ? '<span class="sohbet-gun">' + U.kisaTarih(t) + '</span>' : '';
      gun = t;
      /* Dosya içeriği saklanmaz; balonda adı ve boyutu görünür */
      const ek = m.ek ? '<span class="sohbet-ek"><i class="fa-solid fa-paperclip" aria-hidden="true"></i><b>' + U.kac(m.ek.ad) + '</b>' + (m.ek.boyut ? '<small>' + boyut(m.ek.boyut) + '</small>' : '') + '</span>' : '';
      return ayrac + '<div class="sohbet-balon ' + (m.kimden === 'danisan' ? 'uye' : 'karsi') + '">' + (m.metin && !(m.ek && m.metin === m.ek.ad) ? '<p>' + U.kac(m.metin) + '</p>' : '') + ek + '<span class="sohbet-kunye">' + m.zaman.slice(11, 16) + '</span></div>';
    }).join('') || U.bos({ ikon: 'fa-comments', baslik: 'Henüz mesaj yok', metin: 'Diyetisyenine ilk mesajını aşağıdan yaz.' }));
    const a = $('#dyAkis'); a.scrollTop = a.scrollHeight;
    U.sayac('mesaj', U.uye().okunmamis_mesaj || 0);
  }
  function okundu() {
    if (!U.uye().okunmamis_mesaj) return;
    U.uye().okunmamis_mesaj = 0; U.kaydet(); U.sayac('mesaj', 0);
  }

  function notlar() {
    const p = U.plan();
    const l = [];
    if (p && p.danisana_not) l.push(satirKur('fa-clipboard-list', p.ad + ' · ' + U.tarih(p.tarih), p.danisana_not));
    (dn.klinik_notlar || []).filter((x) => x.paylasildi).slice().reverse().forEach((x) => l.push(satirKur('fa-comment-medical', 'Diyetisyen notu · ' + U.tarih(x.tarih), x.metin)));
    U.randevular().filter((r) => gecen(r) && gorusmeMetni(r)).reverse().forEach((r) => l.push(satirKur('fa-calendar-check', 'Görüşme · ' + U.tarih(r.tarih), gorusmeMetni(r))));
    U.bas('#dyNotlar', l.join('') || U.bos({ ikon: 'fa-note-sticky', baslik: 'Henüz paylaşılan not yok', metin: 'Diyetisyenin sana not bıraktığında burada görünür.' }));
  }

  function dosyalar() {
    const p = U.plan();
    U.bas('#dyGelen', p
      ? satirKur('fa-file-pdf', p.ad + '.pdf', U.tarih(U.planBas(p)) + ' · Beslenme planı', '<a class="dugme hayalet kucuk" href="' + DD.kok + 'hesabim/beslenme-planim/">Planda aç</a>')
      : U.bos({ ikon: 'fa-inbox', baslik: 'Henüz dosya yok', metin: 'Diyetisyenin dosya gönderdiğinde burada listelenir.' }));
    const l = (dn.tahliller || []).map((t) => satirKur('fa-file-pdf', t.dosya_adi, U.tarih(t.tarih) + ' · Tahlil'))
      .concat(U.yerel('paylasilanDosya', []).map((d) => satirKur('fa-file-arrow-up', d.ad, U.tarih(d.tarih) + ' · Sen paylaştın')));
    U.bas('#dyGiden', l.join('') || U.bos({ ikon: 'fa-folder-open', baslik: 'Henüz paylaşmadın', metin: 'Tahlil ya da belge paylaşabilirsin.', eylem: '<button class="dugme hayalet" type="button" data-ac="#dyDosya">Dosya paylaş</button>' }));
  }

  function hak() {
    if (!pk) { U.bas('#dyHak', '<p class="alan-yardim"><span>Aktif paketin yok.</span></p>'); return; }
    const kull = U.randevular().filter((r) => r.paket_id === pk.id && r.durum !== 'iptal');
    const biten = kull.filter(gecen).length, ayrilan = kull.length - biten, kalan = Math.max(0, pk.seans - kull.length);
    const oran = Math.round((kull.length / pk.seans) * 100);
    const s = (i, e, d) => '<div class="sayac"><i class="fa-solid ' + i + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + d + '</b></div></div>';
    U.bas('#dyHak', '<div class="olcer hap" role="img" aria-label="Paket kullanımı: yüzde ' + oran + '"><span data-oran="' + oran + '"></span></div><div class="sayac-izgara">' + s('fa-box-open', 'Paket', U.kac(pk.ad)) + s('fa-circle-check', 'Kullanılan', biten + ' seans') + s('fa-calendar-check', 'Ayrılan', ayrilan + ' seans') + s('fa-ticket', 'Kalan', kalan + ' seans') + '</div>');
    U.bas('#dyHakGecmis', kull.slice().reverse().map((r) => '<tr><td class="tarih">' + U.noktaliTarih(r.tarih) + '</td><td>' + U.kac(U.basHarf(r.tur)) + ' görüşme · ' + r.saat + '</td><td>' + (gecen(r) ? U.durum(U.rDurum(r) === 'gelmedi' ? 'hata' : 'cozulen', U.rDurum(r) === 'gelmedi' ? 'Gelmedi, hak düştü' : 'Kullanıldı') : U.durum('acik', 'Ayrıldı')) + '</td></tr>').join('') || bosSatir(3, 'Henüz hak kullanmadın.'));
  }

  /* Takvim: musaitlik ve dolu randevulara göre saat listesi */
  function saatler(tarih, sure, haric) {
    const d = U.d(), m = d.musaitlik || {};
    const g = (m.haftalik || []).find((x) => x.gun === U.gunAdi(tarih));
    if (!g || !g.acik || (m.kapali_tarihler || []).some((k) => k.tarih === tarih)) return [];
    const dk = (s) => { const p = s.split(':').map(Number); return p[0] * 60 + p[1]; };
    /* Kapalı saat blokları ve açık randevular çakışma sayılır */
    const dolu = (d.takvim_bloklari || []).filter((x) => x.tarih === tarih).map((x) => [dk(x.saat), dk(x.saat) + x.sure])
      .concat((d.randevular || []).filter((r) => r.tarih === tarih && U.rAcik(r) && r.id !== haric).map((r) => [dk(r.saat), dk(r.saat) + r.sure]));
    /* Seanslar arası tampon iki yöne uygulanır; panelde olduğu gibi öğle arasına uygulanmaz */
    const tampon = m.tampon || 0, ara = Array.isArray(g.ara) && g.ara.length === 2 ? [dk(g.ara[0]), dk(g.ara[1])] : null;
    const l = [];
    for (let t = dk(g.baslangic); t + sure <= dk(g.bitis); t += sure) {
      if (ara && t < ara[1] && t + sure > ara[0]) continue;
      if (!dolu.some(([a, z]) => t - tampon < z && t + sure + tampon > a)) l.push(String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'));
    }
    return l;
  }
  function saatBagla(onek, sure, haric) {
    const t = $('#' + onek + 'Tarih'), s = $('#' + onek + 'Saat'), y = $('#' + onek + 'Yardim span');
    t.min = U.gunEkle(b, 1);
    const yenile = () => {
      const l = t.value ? saatler(t.value, sure(), haric && haric()) : [];
      s.innerHTML = l.map((x) => '<option>' + x + '</option>').join('');
      s.disabled = !l.length;
      y.textContent = !t.value ? 'Önce tarih seç.' : l.length ? l.length + ' uygun saat var.' : 'Bu tarihte diyetisyenin müsait değil, başka bir gün seç.';
    };
    t.addEventListener('change', yenile);
    yenile();
    return yenile;
  }
  const otomatik = () => (U.d().musaitlik || {}).onay === 'otomatik';
  if (otomatik()) $('#dyRandevuForm button[type=submit]').textContent = 'Randevu oluştur';
  const slot = (tur) => ((U.d().musaitlik || {}).slot || {})[tur] || 45;
  const turSec = $('#yeniTur');
  const yeniYenile = saatBagla('yeni', () => slot(turSec.value));
  turSec.addEventListener('change', yeniYenile);
  let secili = null;
  const seciliR = () => U.d().randevular.find((x) => x.id === secili);
  const ertYenile = saatBagla('ert', () => (seciliR() ? seciliR().sure : 45), () => secili);

  const ciz = () => { randevu(); notlar(); mesaj(); dosyalar(); };

  $('#dyRandevuForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = $('#yeniTarih').value, s = $('#yeniSaat').value, tur = turSec.value;
    if (!t || !s) { DD.toast('Tarih ve saat seç.', 'hata'); return; }
    U.d().randevular.push({ id: 'r-u' + Date.now(), danisan_id: U.uyeId(), paket_id: dn.paket_id, tarih: t, saat: s, sure: slot(tur), tur, durum: otomatik() ? 'dolu' : 'onay-bekliyor', not: '', olusturan: 'uye' });
    U.kaydet(); DD.kapat($('#dyRandevu')); ciz();
    DD.toast(otomatik() ? 'Randevun oluşturuldu: ' + U.tarih(t) + ', ' + s + '.' : 'Randevu talebin diyetisyenine iletildi, onay bekliyor.');
  });
  document.addEventListener('click', (e) => {
    const i = e.target.closest('[data-iptal]');
    if (i) {
      secili = i.dataset.iptal;
      const r = seciliR();
      $('#dyIptalMetin').textContent = U.tarih(r.tarih) + ', ' + r.saat + ' görüşmen için iptal talebi gönderilecek. Diyetisyenin onayladığında randevu iptal olur ve seans hakkın geri yüklenir.';
      DD.ac('#dyIptal');
    }
    const t = e.target.closest('[data-ertele]');
    if (t) { secili = t.dataset.ertele; ertYenile(); DD.ac('#dyErtele'); }
    const g = e.target.closest('[data-talep-geri]');
    if (g) {
      delete U.d().randevular.find((x) => x.id === g.dataset.talepGeri).talep;
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
    const s = U.sohbet();
    s.mesajlar.push({ kimden: 'danisan', zaman: b + 'T' + new Date().toTimeString().slice(0, 5), metin });
    s.okunmamis = (s.okunmamis || 0) + 1; /* panelde okunmamış olarak görünür */
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

  bilgi(); hizmet(); ciz();

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
    const tur = [turSec.value, ...[...turSec.options].map((o) => o.value)].find((t) => saatler(tarih, slot(t)).includes(saat));
    if (!tur) { DD.toast(U.tarih(tarih) + ', ' + saat + ' uygun değil; aynı günden başka bir saat seç.', 'uyari'); return; }
    turSec.value = tur;
    yeniYenile();
    $('#yeniSaat').value = saat;
  }
  document.addEventListener('DOMContentLoaded', onDoldur);
})();
