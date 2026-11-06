/* Profil: demo.diyetisyen alanlarını ve ek profil kaydını düzenler; ?sekme= açılış sekmesini seçer. */
(function () {
  'use strict';
  const { $, $$, esc } = PB;
  const UZMANLIK = ['Kilo Yönetimi', 'Sporcu Beslenmesi', 'İnsülin Direnci & Diyabet', 'Bağırsak Sağlığı', 'Gebelik & Emzirme', 'Geriatri Beslenmesi', 'Hormonal Denge & PCOS', 'Çocuk Beslenmesi', 'Vejetaryen Beslenme'];
  const DILLER = ['Türkçe', 'İngilizce', 'Almanca', 'Arapça', 'Rusça'];
  const SEHIRLER = ['Adana', 'Ankara', 'Antalya', 'Bursa', 'Denizli', 'Diyarbakır', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Hatay', 'İstanbul', 'İzmir', 'Kayseri', 'Kocaeli', 'Konya', 'Malatya', 'Manisa', 'Mersin', 'Muğla', 'Samsun', 'Sakarya', 'Tekirdağ', 'Trabzon', 'Van'];
  const VARSAYILAN = {
    baslik: 'Sürdürülebilir kilo yönetimi ve sporcu beslenmesi',
    kisa: 'Kilo yönetimi ve sporcu beslenmesinde, yaşam tarzına uyan sürdürülebilir planlar hazırlıyorum.',
    metin: 'Klinik ve online danışmanlık deneyimimle kilo yönetimi, insülin direnci ve sporcu beslenmesi alanlarında çalışıyorum.\n\nİlk görüşmede alışkanlıklarını, hedefini ve günlük ritmini konuşuyoruz; planı birlikte kuruyor, iki haftada bir gözden geçiriyoruz.',
    ilce: 'Kadıköy', cinsiyet: 'Kadın', diller: ['Türkçe', 'İngilizce'], kabul: true, dernek: 'Türkiye Diyetisyenler Derneği',
    egitim: [{ kurum: 'Beslenme ve Diyetetik Bölümü', program: 'Lisans' }, { kurum: 'Klinik Beslenme', program: 'Yüksek lisans' }],
    sertifika: 'Sporcu Beslenmesi Eğitimi\nDiyabette Beslenme Tedavisi',
    belgeler: [{ ad: 'Lisans diploması', tur: 'Diploma', durum: 'Doğrulandı', tarih: '2026-02-11' }, { ad: 'Mesleki sorumluluk belgesi', tur: 'Belge', durum: 'Doğrulandı', tarih: '2026-02-11' }],
  };
  const dyt = PB.demo().diyetisyen;
  let P, kirli = false, secUzmanlik, secDil;
  const durumYaz = (d) => { kirli = d; $('#profilNot').textContent = d ? 'Kaydedilmemiş değişiklik var' : 'Kaydedilmiş profil'; };

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
    $('#belgeSayi').textContent = P.belgeler.length + ' belge';
    $('#belgeListe').innerHTML = P.belgeler.map((b) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-file-lines" aria-hidden="true"></i></span><span class="as-metin"><b>' + esc(b.ad) + '</b><span>' + esc(b.tur) + ' · ' + PB.tarih(b.tarih) + '</span></span><span class="as-eylem"><span class="durum-hapi ' + (b.durum === 'Doğrulandı' ? 'cozulen' : 'bekleyen') + '">' + esc(b.durum) + '</span></span></div>').join('');
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
    $('#profilGor').href = DD.kok + 'diyetisyen/' + dyt.slug + '/';
    $('#fotoOnizleme').textContent = PB.basHarf(dyt.ad);
    $('#fAd').value = dyt.ad; $('#fUnvan').value = dyt.unvan; $('#fKullanici').value = dyt.slug; $('#fCinsiyet').value = P.cinsiyet;
    const sehirler = SEHIRLER.includes(dyt.sehir) ? SEHIRLER : SEHIRLER.concat(dyt.sehir);
    $('#fSehir').innerHTML = sehirler.map((s) => '<option>' + esc(s) + '</option>').join('');
    $('#fSehir').value = dyt.sehir; $('#fIlce').value = P.ilce; $('#fDeneyim').value = dyt.deneyim_yil;
    $('#fBaslik').value = P.baslik; $('#fKisa').value = P.kisa; $('#fMetin').value = P.metin;
    $('#fOnline').checked = !!dyt.online; $('#fYuz').checked = !!dyt.yuz_yuze; $('#fKabul').checked = !!P.kabul;
    $('#fSertifika').value = P.sertifika; $('#fDernek').value = P.dernek;
    kisaSayac(); cipCiz(); egitimCiz(); belgeCiz(); hizmetCiz();
    durumYaz(false);
  }
  function kaydet() {
    if (!PB.formGecerli($('#profilForm'))) return;
    if (!secUzmanlik.length) { DD.toast('En az bir uzmanlık alanı seç.', 'hata'); $('#t-uzmanlik').click(); return; }
    Object.assign(dyt, { sehir: $('#fSehir').value, deneyim_yil: +$('#fDeneyim').value, uzmanlik: secUzmanlik, online: $('#fOnline').checked, yuz_yuze: $('#fYuz').checked });
    Object.assign(P, { cinsiyet: $('#fCinsiyet').value, ilce: $('#fIlce').value.trim(), baslik: $('#fBaslik').value.trim(), kisa: $('#fKisa').value.trim(), metin: $('#fMetin').value.trim(), diller: secDil, kabul: $('#fKabul').checked, sertifika: $('#fSertifika').value.trim(), dernek: $('#fDernek').value.trim() });
    dyt.profil = JSON.parse(JSON.stringify(P));
    PB.kaydet();
    durumYaz(false);
    $('#profilNot').textContent = 'Kaydedildi · ' + PB.tarihSaat(PB.simdi());
    DD.toast('Profil kaydedildi.');
  }
  document.addEventListener('click', function (e) {
    const cip = e.target.closest('#uzmanlikCip .cip,#dilCip .cip');
    if (cip) {
      const uz = !!cip.closest('#uzmanlikCip'), l = uz ? secUzmanlik : secDil, d = cip.dataset.deger, i = l.indexOf(d);
      if (i >= 0) l.splice(i, 1);
      else if (uz && l.length >= 6) { DD.toast('En çok 6 uzmanlık seçebilirsin.', 'uyari'); return; } else l.push(d);
      cipCiz(); durumYaz(true);
      return;
    }
    const d = e.target.closest('[data-profil]');
    if (!d) return;
    switch (d.dataset.profil) {
      case 'kaydet': kaydet(); break;
      case 'geri': doldur(); DD.toast('Değişiklikler geri alındı.'); break;
      case 'foto-kaldir': $('#fotoOnizleme').textContent = PB.basHarf(dyt.ad); $('#fotoDosya').value = ''; durumYaz(true); DD.toast('Fotoğraf kaldırıldı, baş harfler görünecek.'); break;
      case 'egitim-ekle': P.egitim.push({ kurum: '', program: '' }); egitimCiz(); durumYaz(true); break;
      case 'egitim-sil': P.egitim.splice(+d.dataset.i, 1); egitimCiz(); durumYaz(true); break;
    }
  });
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.dataset.gorsel && t.files[0]) {
      const f = t.files[0], hedef = $(t.dataset.gorsel);
      if (f.size > 5 * 1024 * 1024) { DD.toast('Görsel en çok 5 MB olabilir.', 'hata'); t.value = ''; return; }
      const img = new Image(); img.alt = ''; img.src = URL.createObjectURL(f);
      hedef.replaceChildren(img); durumYaz(true);
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
    durumYaz(true);
  });
  $('#profilForm').addEventListener('submit', (e) => e.preventDefault());
  window.addEventListener('beforeunload', (e) => { if (kirli) e.preventDefault(); });
  doldur();
  const sk = PB.parametre('sekme'), t = sk && document.getElementById('t-' + sk);
  if (t) t.click();
})();
