/* Profil: demo.diyetisyen alanlarını ve ek profil kaydını düzenler; ?sekme= açılış sekmesini seçer. */
(function () {
  'use strict';
  const { $, $$, esc } = PB;
  const UZMANLIK = ['Kilo Yönetimi', 'Sporcu Beslenmesi', 'İnsülin Direnci & Diyabet', 'Bağırsak Sağlığı', 'Gebelik & Emzirme', 'Geriatri Beslenmesi', 'Hormonal Denge & PCOS', 'Çocuk Beslenmesi', 'Vejetaryen Beslenme'];
  const DILLER = ['Türkçe', 'İngilizce', 'Almanca', 'Arapça', 'Rusça'];
  const SEHIRLER = ['Adana', 'Ankara', 'Antalya', 'Bursa', 'Denizli', 'Diyarbakır', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Hatay', 'İstanbul', 'İzmir', 'Kayseri', 'Kocaeli', 'Konya', 'Malatya', 'Manisa', 'Mersin', 'Muğla', 'Samsun', 'Sakarya', 'Tekirdağ', 'Trabzon', 'Van'];
  const VARSAYILAN = {
    baslik: 'Sürdürülebilir Kilo Yönetimi ve Sporcu Beslenmesi',
    kisa: 'Kilo yönetimi ve sporcu beslenmesinde, yaşam tarzına uyan sürdürülebilir planlar hazırlıyorum.',
    metin: 'Dört yıldır kilo yönetimi, insülin direnci ve sporcu beslenmesi üzerine çalışıyorum. Danışanlarımla klinikte ve online görüşüyorum. Amacım kısa süreli bir diyet değil, günlük hayatına uyan ve uzun vadede sürdürebileceğin bir beslenme düzeni kurmak.\n\nİlk görüşmede alışkanlıklarını, hedefini ve günlük ritmini birlikte konuşuyoruz. Planı buna göre kuruyor, iki haftada bir gözden geçirip ihtiyacın olan yerde güncelliyoruz.',
    ilce: 'Kadıköy', cinsiyet: 'Kadın', diller: ['Türkçe', 'İngilizce'], dernek: 'Türkiye Diyetisyenler Derneği',
    egitim: [{ kurum: 'Beslenme ve Diyetetik Bölümü', program: 'Lisans' }, { kurum: 'Klinik Beslenme', program: 'Yüksek lisans' }],
    sertifika: 'Sporcu Beslenmesi Eğitimi\nDiyabette Beslenme Tedavisi',
    belgeler: [{ ad: 'Lisans diploması', tur: 'Diploma', durum: 'Doğrulandı', tarih: '2026-02-11' }, { ad: 'Mesleki sorumluluk belgesi', tur: 'Belge', durum: 'Doğrulandı', tarih: '2026-02-11' }],
  };
  const dyt = PB.demo().diyetisyen;
  let P, kirli = false, secUzmanlik, secDil;
  const durumYaz = (d) => { kirli = d; $('#profilNot').textContent = d ? 'Kaydedilmemiş değişiklik var' : 'Kaydedilmiş profil'; };

  /* Görsel küçültülür ve data URL olarak saklanır; demo durumu tarayıcıda olduğu için boyut sınırlıdır */
  function gorselOku(dosya, en, boy, cb) {
    const img = new Image();
    img.onload = () => {
      const o = Math.max(en / img.width, boy / img.height), c = document.createElement('canvas');
      c.width = en; c.height = boy;
      c.getContext('2d').drawImage(img, (en - img.width * o) / 2, (boy - img.height * o) / 2, img.width * o, img.height * o);
      URL.revokeObjectURL(img.src);
      cb(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => DD.toast('Görsel okunamadı.', 'hata');
    img.src = URL.createObjectURL(dosya);
  }
  const resim = (u) => '<img src="' + u + '" alt="">';
  function gorselCiz() {
    if (P.foto) $('#fotoOnizleme').innerHTML = resim(P.foto); else $('#fotoOnizleme').textContent = PB.basHarf(dyt.ad);
    $('#kapakOnizleme').innerHTML = P.kapak ? resim(P.kapak) : '<i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>&nbsp;Görsel seçmek için tıkla';
  }
  /* Önizleme formun o anki değerinden çizilir: kaydedilmemiş değişiklik de görünür */
  function onizlemeCiz() {
    const yil = $('#fDeneyim').value || 0, kipler = [$('#fOnline').checked ? 'Online' : '', $('#fYuz').checked ? 'Yüz yüze' : ''].filter(Boolean).join(' · ');
    const fiyat = PB.liste('paketler').filter((p) => p.aktif).map((p) => p.fiyat / p.seans);
    $('#onizleme').innerHTML = '<div class="onizleme-kapak">' + (P.kapak ? resim(P.kapak) : '') + '</div><div class="onizleme-govde"><span class="gorsel-kare">' + (P.foto ? resim(P.foto) : esc(PB.basHarf(dyt.ad))) + '</span>' +
      '<h3>' + esc(dyt.ad) + '</h3><p><b>' + esc($('#fBaslik').value) + '</b></p><p>' + esc($('#fKisa').value) + '</p>' +
      '<p>' + yil + ' yıl deneyim · ' + esc($('#fSehir').value) + (kipler ? ' · ' + kipler : '') + '</p>' +
      '<div class="etiketler">' + secUzmanlik.slice(0, 3).map((u) => '<span class="rozet olumlu">' + esc(u) + '</span>').join('') + '</div>' +
      (fiyat.length ? '<p>Seans ' + PB.tl(Math.min(...fiyat)) + ' başlayan fiyatlarla</p>' : '') + '</div>';
  }
  function durumCiz() {
    const t = PBD.tanim(), d = PBD.durum();
    const eylem = d === 'eksik-belge' ? '<a class="dugme birincil" href="?sekme=belgeler" data-profil="belgeye-git">Belgeyi yükle</a>' : d === 'onay-bekliyor' ? '<a class="dugme hayalet" href="?sekme=belgeler" data-profil="belgeye-git">Belgelerimi gör</a>' : '<a class="dugme hayalet" href="' + DD.kok + 'diyetisyen-paneli/musaitlik/">Müsaitliği kontrol et</a>';
    $('#durumSerit').innerHTML = '<span class="as-ikon ' + (d === 'onayli' ? '' : d === 'eksik-belge' ? 'tehlike' : 'uyari') + '"><i class="fa-solid ' + t.ikon + '" aria-hidden="true"></i></span>' +
      '<span class="as-metin"><b>' + t.baslik + ' <span class="durum-hapi ' + t.hap + '">' + t.ad + '</span></b><span>' + t.metin + '</span></span>' + eylem +
      '<span class="demo-gecis">Demo durumu <span class="segment" role="group" aria-label="Demo onay durumu" id="durumGecis">' + Object.keys(PBD.DURUMLAR).map((k) => '<button type="button" data-deger="' + k + '" aria-pressed="' + (k === d) + '">' + PBD.DURUMLAR[k].ad + '</button>').join('') + '</span></span>';
    const acik = PBD.onayli();
    $('#yayinHap').innerHTML = '<span class="durum-hapi ikonlu ' + (acik ? 'cozulen' : 'kapali') + '"><i class="fa-solid ' + (acik ? 'fa-circle-check' : 'fa-eye-slash') + '" aria-hidden="true"></i> ' + (acik ? 'Yayında' : 'Yayında değil') + '</span>';
    $('#fKabul').disabled = !acik; $('#fKabul').checked = PBD.yeniRandevuAcik(); $('#kabulNot').hidden = acik;
    belgeCiz();
  }
  function kisaSayac() {
    const n = $('#fKisa').value.length, s = $('#fKisaSayac');
    s.textContent = n + ' / 280'; s.classList.toggle('sinirda', n >= 280);
  }
  function cipCiz() {
    $('#uzmanlikCip').innerHTML = UZMANLIK.concat(secUzmanlik.filter((u) => !UZMANLIK.includes(u))).map((u) => '<button class="cip' + (secUzmanlik.includes(u) ? ' aktif' : '') + '" type="button" data-deger="' + esc(u) + '" aria-pressed="' + secUzmanlik.includes(u) + '">' + esc(u) + '</button>').join('');
    $('#uzmanlikSayac').textContent = secUzmanlik.length + ' / 6';
    $('#dilCip').innerHTML = DILLER.map((u) => '<button class="cip' + (secDil.includes(u) ? ' aktif' : '') + '" type="button" data-deger="' + esc(u) + '" aria-pressed="' + secDil.includes(u) + '">' + esc(u) + '</button>').join('');
  }
  function egitimCiz() {
    $('#egitimListe').innerHTML = P.egitim.map((e, i) => '<div class="alan-izgara c2" data-egitim="' + i + '"><div class="alan"><label class="alan-etiket" for="eK' + i + '">Kurum ya da bölüm</label><input class="alan-girdi" id="eK' + i + '" type="text" value="' + esc(e.kurum) + '" data-alan-ad="kurum"></div>' +
      '<div class="alan"><label class="alan-etiket" for="eP' + i + '">Program</label><div class="girdi-satir"><input class="alan-girdi" id="eP' + i + '" type="text" value="' + esc(e.program) + '" data-alan-ad="program"><button class="ikon-dugme yikici" type="button" data-profil="egitim-sil" data-i="' + i + '" aria-label="Eğitim satırını sil"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></div></div></div>').join('');
  }
  function belgeCiz() {
    /* Eksik belge durumunda sorumluluk belgesi yeni yükleme gelene kadar eksik görünür */
    const eksik = PBD.durum() === 'eksik-belge' && !P.belgeler.some((b) => b.durum === 'İnceleniyor');
    const liste = P.belgeler.map((b) => (eksik && /sorumluluk/i.test(b.ad) ? Object.assign({}, b, { durum: 'Eksik' }) : b));
    $('#belgeSayi').textContent = P.belgeler.length + ' belge';
    $('#belgeListe').innerHTML = liste.map((b) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-file-lines" aria-hidden="true"></i></span><span class="as-metin"><b>' + esc(b.ad) + '</b><span>' + esc(b.tur) + ' · ' + PB.tarih(b.tarih) + '</span></span><span class="as-eylem"><span class="durum-hapi ' + (b.durum === 'Doğrulandı' ? 'cozulen' : b.durum === 'Eksik' ? 'hata' : 'bekleyen') + '">' + esc(b.durum) + '</span></span></div>').join('');
  }
  function hizmetCiz() {
    const l = PB.liste('paketler');
    $('#hizmetSayi').textContent = l.length + ' paket';
    $('#hizmetSatirlar').innerHTML = l.map((p) => '<tr><td><a href="' + DD.kok + 'diyetisyen-paneli/hizmet-paketleri/yeni/?id=' + encodeURIComponent(p.id) + '"><b>' + esc(p.ad) + '</b></a></td><td>' + p.seans + ' seans · ' + p.sure + ' dk</td><td class="num">' + PB.tl(p.fiyat) + '</td><td><span class="durum-hapi ' + (p.aktif ? 'cozulen' : 'kapali') + '">' + (p.aktif ? 'Yayında' : 'Pasif') + '</span></td></tr>').join('');
  }
  function doldur() {
    P = JSON.parse(JSON.stringify(Object.assign({}, VARSAYILAN, dyt.profil || {})));
    secUzmanlik = (dyt.uzmanlik || []).slice(); secDil = P.diller.slice();
    $('#profilAd').textContent = dyt.ad;
    $('#profilGor').href = DD.kok + 'diyetisyen/' + dyt.slug + '/?onizleme=1';
    gorselCiz();
    $('#fAd').value = dyt.ad; $('#fUnvan').value = dyt.unvan; $('#fKullanici').value = dyt.slug; $('#fCinsiyet').value = P.cinsiyet;
    const sehirler = SEHIRLER.includes(dyt.sehir) ? SEHIRLER : SEHIRLER.concat(dyt.sehir);
    $('#fSehir').innerHTML = sehirler.map((s) => '<option>' + esc(s) + '</option>').join('');
    $('#fSehir').value = dyt.sehir; $('#fIlce').value = P.ilce; $('#fDeneyim').value = dyt.deneyim_yil;
    $('#fBaslik').value = P.baslik; $('#fKisa').value = P.kisa; $('#fMetin').value = P.metin;
    const en = (P.ceviri && P.ceviri.en) || {};
    $('#fBaslikEn').value = en.baslik || ''; $('#fKisaEn').value = en.kisa || ''; $('#fMetinEn').value = en.metin || '';
    $('#fOnline').checked = !!dyt.online; $('#fYuz').checked = !!dyt.yuz_yuze;
    $('#fSertifika').value = P.sertifika; $('#fDernek').value = P.dernek;
    kisaSayac(); cipCiz(); egitimCiz(); hizmetCiz(); durumCiz(); onizlemeCiz();
    durumYaz(false);
  }
  function kaydet() {
    if (!PB.formGecerli($('#profilForm'))) return;
    if (!secUzmanlik.length) { DD.toast('En az bir uzmanlık alanı seç.', 'hata'); $('#t-uzmanlik').click(); return; }
    Object.assign(dyt, { sehir: $('#fSehir').value, deneyim_yil: +$('#fDeneyim').value, uzmanlik: secUzmanlik, online: $('#fOnline').checked, yuz_yuze: $('#fYuz').checked });
    Object.assign(P, { cinsiyet: $('#fCinsiyet').value, ilce: $('#fIlce').value.trim(), baslik: $('#fBaslik').value.trim(), kisa: $('#fKisa').value.trim(), metin: $('#fMetin').value.trim(), diller: secDil, sertifika: $('#fSertifika').value.trim(), dernek: $('#fDernek').value.trim() });
    P.ceviri = Object.assign({}, P.ceviri, { en: { baslik: $('#fBaslikEn').value.trim(), kisa: $('#fKisaEn').value.trim(), metin: $('#fMetinEn').value.trim() } });
    if (PBD.onayli()) dyt.yeni_randevu = $('#fKabul').checked;
    dyt.profil = JSON.parse(JSON.stringify(P));
    const belgeTamam = PBD.durum() === 'eksik-belge' && P.belgeler.some((b) => b.durum === 'İnceleniyor');
    if (belgeTamam) PBD.durumYaz('onay-bekliyor');
    PB.kaydet();
    durumYaz(false);
    durumCiz();
    $('#profilNot').textContent = 'Kaydedildi · ' + PB.tarihSaat(PB.simdi());
    DD.toast(belgeTamam ? 'Belgen yönetim incelemesine gitti, durumun Onay bekliyor oldu.' : 'Profil kaydedildi.');
    onizlemeCiz();
  }
  document.addEventListener('click', function (e) {
    const cip = e.target.closest('#uzmanlikCip .cip,#dilCip .cip');
    if (cip) {
      const uz = !!cip.closest('#uzmanlikCip'), l = uz ? secUzmanlik : secDil, d = cip.dataset.deger, i = l.indexOf(d);
      if (i >= 0) l.splice(i, 1);
      else if (uz && l.length >= 6) { DD.toast('En çok 6 uzmanlık seçebilirsin.', 'uyari'); return; } else l.push(d);
      cipCiz(); durumYaz(true); onizlemeCiz();
      return;
    }
    const d = e.target.closest('[data-profil]');
    if (!d) return;
    switch (d.dataset.profil) {
      case 'kaydet': kaydet(); break;
      case 'geri': doldur(); DD.toast('Değişiklikler geri alındı.'); break;
      case 'foto-kaldir': P.foto = ''; $('#fotoDosya').value = ''; gorselCiz(); onizlemeCiz(); durumYaz(true); DD.toast('Fotoğraf kaldırıldı, baş harfler görünecek.'); break;
      case 'belgeye-git': e.preventDefault(); $('#t-belgeler').click(); $('#t-belgeler').scrollIntoView({ block: 'center' }); break;
      case 'egitim-ekle': P.egitim.push({ kurum: '', program: '' }); egitimCiz(); durumYaz(true); break;
      case 'egitim-sil': P.egitim.splice(+d.dataset.i, 1); egitimCiz(); durumYaz(true); break;
    }
  });
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.dataset.gorsel && t.files[0]) {
      const f = t.files[0];
      if (f.size > 5 * 1024 * 1024) { DD.toast('Görsel en çok 5 MB olabilir.', 'hata'); t.value = ''; return; }
      const kapak = t.id === 'kapakDosya';
      /* Kitin kırpma penceresi: dosya kırpılıp döner, sonra küçültülerek durumda saklanır */
      window.DM_KIRPMA_PENCERESI(f, kapak ? '5:1' : '1:1', (son) => {
        gorselOku(son, kapak ? 1200 : 400, kapak ? 240 : 400, (u) => { if (kapak) P.kapak = u; else P.foto = u; gorselCiz(); onizlemeCiz(); durumYaz(true); });
      }, () => { t.value = ''; });
    }
    if (t.id === 'belgeDosya' && t.files[0]) {
      P.belgeler.push({ ad: t.files[0].name, tur: 'Yeni belge', durum: 'İnceleniyor', tarih: DD.bugun });
      t.value = ''; belgeCiz(); durumYaz(true); DD.toast('Belge eklendi, kaydedince yönetim incelemesine gider.');
    }
  });
  $('#profilForm').addEventListener('input', function (e) {
    const s = e.target.closest('[data-egitim]');
    if (s) P.egitim[+s.dataset.egitim][e.target.dataset.alanAd] = e.target.value;
    if (e.target.id === 'fKisa') kisaSayac();
    durumYaz(true); onizlemeCiz();
  });
  $('#profilForm').addEventListener('change', onizlemeCiz);
  document.addEventListener('dd:secim', (e) => { if (e.target.id === 'durumGecis') { PBD.durumYaz(e.detail.deger); durumCiz(); } });
  $('#profilForm').addEventListener('submit', (e) => e.preventDefault());
  window.addEventListener('beforeunload', (e) => { if (kirli) e.preventDefault(); });
  doldur();
  const sk = PB.parametre('sekme'), t = sk && document.getElementById('t-' + sk);
  if (t) t.click();
})();
