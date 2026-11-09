/* Sohbet alanı: mesajlar ekranı ve danışan kartının Mesajlar sekmesi aynı parçayı kullanır.
   Karşı taraf cevap üretmez, okundu tiki yoktur.
   Ek dosya bu tarayıcının IndexedDB deposuna yazılır (DD.belgeKasa, anahtar `mesaj|danışan|zaman`);
   balondan ve "Notlar ve dosyalar" çekmecesinden indirilir. Depo yoksa yalnız ad ve boyut kalır, ekran bunu söyler. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const boyut = (b) => (b >= 1048576 ? PA.sayi(b / 1048576) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
  const kasa = () => DD.belgeKasa || null;
  const GEREKCE = ['Hakaret ya da taciz', 'Spam ya da reklam', 'Uygunsuz içerik', 'Kişisel veri paylaşımı', 'Platform dışı ödeme isteği', 'Diğer'];
  const kapat = '<button class="ikon-dugme" type="button" aria-label="Kapat" data-kapat><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';

  /* Çekmeceler bir kez kurulur: mesaj bildirme ve konuşmanın notları ile dosyaları */
  if (!document.getElementById('mesajBildir')) {
    document.body.insertAdjacentHTML('beforeend', `
<div class="yan-panel-ortu" id="mesajBildir" hidden><aside class="yan-panel" role="dialog" aria-modal="true" aria-labelledby="mbBaslik">
  <div class="yan-panel-bas"><h2 id="mbBaslik">Mesajı Bildir</h2>${kapat}</div>
  <form class="yan-panel-govde" id="mbForm" novalidate>
    <div class="not-kutu" id="mbAlinti"></div>
    <div class="alan"><label class="alan-etiket" for="mbGerekce">Gerekçe <span class="zorunlu" aria-hidden="true">*</span></label><select class="alan-secim" id="mbGerekce" required><option value="">Gerekçe seç</option>${GEREKCE.map((g) => `<option>${g}</option>`).join('')}</select></div>
    <div class="alan"><label class="alan-etiket" for="mbAciklama">Açıklama <span class="istege-bagli">(isteğe bağlı)</span></label><textarea class="alan-metin" id="mbAciklama" rows="4" placeholder="Moderasyon ekibinin bilmesi gereken ayrıntı"></textarea></div>
    <div class="bilgi-notu"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><p>Bildirim Dada Diet moderasyon ekibine gider, danışana haber verilmez. Konuşma açık kalır; gerekirse ekip seninle iletişime geçer.</p></div>
  </form>
  <div class="yan-panel-ayak"><button class="dugme hayalet" type="button" data-kapat>Vazgeç</button><button class="dugme birincil" type="submit" form="mbForm">Bildir</button></div>
</aside></div>
<div class="yan-panel-ortu" id="sohbetKutu" hidden><aside class="yan-panel" role="dialog" aria-modal="true" aria-labelledby="skBaslik">
  <div class="yan-panel-bas"><h2 id="skBaslik">Notlar ve Dosyalar</h2>${kapat}</div>
  <div class="yan-panel-govde" id="skGovde"></div>
  <div class="yan-panel-ayak"><button class="dugme hayalet" type="button" data-kapat>Kapat</button><a class="dugme birincil" id="skKart" href="#"><i class="fa-solid fa-id-card" aria-hidden="true"></i> Danışan kartı</a></div>
</aside></div>
<input type="file" id="skDosya" hidden aria-hidden="true" tabindex="-1">`);
  }
  const $ = (id) => document.getElementById(id);
  let aktif = null; /* {id, ciz} açık konuşma */
  let bildirilen = null, guncellenen = null;

  const ekAnahtar = (id, m) => 'mesaj|' + id + '|' + m.zaman;
  function ekKaydet(id, m, f) {
    const k = kasa();
    if (!k) return Promise.resolve(false);
    const anahtar = ekAnahtar(id, m);
    return k.koy(anahtar, f).then((ok) => { if (ok) { m.ek.anahtar = anahtar; PA.kaydet(); } return ok; });
  }
  function indir(ek) {
    const k = kasa();
    if (!k || !ek.anahtar) { DD.toast('Bu dosya bu tarayıcıda yok. Prototipte dosya yüklendiği tarayıcıda saklanır.', 'uyari'); return; }
    k.al(ek.anahtar).then((v) => {
      if (!v) { DD.toast('Dosya bu tarayıcıda bulunamadı.', 'uyari'); return; }
      const a = document.createElement('a');
      a.href = v.url; a.download = ek.ad; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(v.url), 4000);
    });
  }

  function balon(m, i) {
    const ben = m.kimden === 'diyetisyen';
    const ek = !m.ek ? '' : m.ek.kaldirildi
      ? `<span class="sohbet-ek"><i class="fa-solid fa-file-circle-xmark" aria-hidden="true"></i><small>${h(m.ek.ad)} kaldırıldı</small></span>`
      : `<button class="sohbet-ek" type="button" data-sohbet="indir" data-i="${i}" aria-label="${h(m.ek.ad)} dosyasını indir"><i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i><b>${h(m.ek.ad)}</b><small>${boyut(m.ek.boyut)}${m.ek.guncelleme ? ' · güncellendi' : ''}</small></button>`;
    const bildir = ben ? '' : m.bildirildi ? '<span class="rozet bekleme"><i class="fa-solid fa-flag" aria-hidden="true"></i> Bildirildi</span>' : `<button class="bag-dugme" type="button" data-sohbet="bildir" data-i="${i}" aria-label="Bu mesajı bildir"><i class="fa-solid fa-flag" aria-hidden="true"></i> Bildir</button>`;
    return `<div class="sohbet-balon ${ben ? 'uye' : 'karsi'}">${m.metin && !(m.ek && m.metin === m.ek.ad) ? `<p>${h(m.metin)}</p>` : ''}${ek}<div class="sohbet-kunye">${DD.bicim.saat(m.zaman.slice(11, 16))}${bildir}</div></div>`;
  }
  function akis(k) {
    let gun = '', s = '';
    k.mesajlar.forEach((m, i) => {
      const g = m.zaman.slice(0, 10);
      if (g !== gun) { gun = g; s += `<div class="sohbet-gun">${g === DD.bugun ? 'Bugün' : g === PA.ekle(DD.bugun, -1) ? 'Dün' : PA.tarih(g)}</div>`; }
      s += balon(m, i);
    });
    return s;
  }

  /* ── Notlar ve dosyalar çekmecesi (eski paneldeki konuşma yanı kutuları) ── */
  function kutuCiz() {
    const id = aktif.id, dn = PA.danisan(id), k = PA.konusma(id, false) || { mesajlar: [] };
    const notlar = (dn.klinik_notlar || []).map((n, i) => ({ n, i })).sort((a, b) => b.n.tarih.localeCompare(a.n.tarih)).slice(0, 3);
    const dosyalar = k.mesajlar.map((m, i) => ({ m, i })).filter((x) => x.m.ek && !x.m.ek.kaldirildi).reverse();
    $('skBaslik').textContent = dn.ad;
    $('skKart').href = PA.yol.danisan(id, 'not');
    $('skGovde').innerHTML = `<h3 class="form-bolum-bas"><i class="fa-solid fa-note-sticky" aria-hidden="true"></i> Danışan Notları</h3>
${notlar.length ? `<div class="ayar-liste">${notlar.map(({ n }) => `<div class="ayar-satir"><span class="as-metin"><b>${PA.tarih(n.tarih)}${n.paylasildi ? ' · danışanla paylaşıldı' : ''}</b><span>${h(n.metin)}</span></span></div>`).join('')}</div>` : '<p class="alan-yardim"><span>Henüz klinik not yok.</span></p>'}
<form id="skNotForm" class="alan" novalidate><label class="alan-etiket" for="skNot">Hızlı not</label><textarea class="alan-metin" id="skNot" rows="3" placeholder="Yalnız sen görürsün; paylaşmak için danışan kartından aç."></textarea></form>
<div class="eylem-satiri"><button class="dugme hayalet kucuk" type="submit" form="skNotForm"><i class="fa-solid fa-plus" aria-hidden="true"></i> Not ekle</button><a class="dugme hayalet kucuk" href="${PA.yol.danisan(id, 'not')}">Tüm notlar</a></div>
<h3 class="form-bolum-bas"><i class="fa-solid fa-folder-open" aria-hidden="true"></i> Dosyalar</h3>
${dosyalar.length ? `<div class="ayar-liste">${dosyalar.map(({ m, i }) => `<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-file-lines" aria-hidden="true"></i></span><span class="as-metin"><b>${h(m.ek.ad)}</b><span>${m.kimden === 'diyetisyen' ? 'Sen' : h(PA.ilkAd(dn.ad))} · ${PA.tarih(m.zaman)} · ${boyut(m.ek.boyut)}${m.ek.guncelleme ? ' · ' + PA.tarih(m.ek.guncelleme) + ' güncellendi' : ''}${m.ek.anahtar ? '' : ' · bu tarayıcıda yok'}</span></span><span class="as-eylem"><span class="satir-eylem"><button class="ikon-dugme" type="button" data-sk="indir" data-i="${i}" aria-label="${h(m.ek.ad)} indir"><i class="fa-solid fa-download" aria-hidden="true"></i></button>${m.kimden === 'diyetisyen' ? `<button class="ikon-dugme" type="button" data-sk="guncelle" data-i="${i}" aria-label="${h(m.ek.ad)} yeni sürümle güncelle"><i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i></button><button class="ikon-dugme yikici" type="button" data-sk="kaldir" data-i="${i}" aria-label="${h(m.ek.ad)} kaldır"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>` : ''}</span></span></div>`).join('')}</div>` : '<p class="alan-yardim"><span>Bu konuşmada dosya yok.</span></p>'}
<div class="eylem-satiri"><button class="dugme hayalet kucuk" type="button" data-sk="yukle"><i class="fa-solid fa-upload" aria-hidden="true"></i> Dosya yükle</button></div>
<p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>Yüklenen dosya danışana mesaj eki olarak gider. Prototipte dosya bu tarayıcıda saklanır, başka cihazda açılmaz.</span></p>`;
  }
  $('skGovde').addEventListener('submit', (e) => {
    if (e.target.id !== 'skNotForm') return;
    e.preventDefault();
    const metin = $('skNot').value.trim();
    if (!metin) { DD.toast('Önce notu yaz.', 'uyari'); $('skNot').focus(); return; }
    const dn = PA.danisan(aktif.id);
    (dn.klinik_notlar = dn.klinik_notlar || []).push({ tarih: DD.bugun, metin });
    PA.kaydet(); kutuCiz(); DD.toast('Not eklendi.');
  });
  $('skGovde').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sk]');
    if (!b) return;
    const k = PA.konusma(aktif.id, false), m = k && k.mesajlar[+b.dataset.i];
    if (b.dataset.sk === 'yukle') { guncellenen = null; $('skDosya').click(); return; }
    if (!m || !m.ek) return;
    if (b.dataset.sk === 'indir') indir(m.ek);
    if (b.dataset.sk === 'guncelle') { guncellenen = m; $('skDosya').click(); }
    if (b.dataset.sk === 'kaldir') {
      window.DM_ONAY('Dosya kaldırılsın mı?', m.ek.ad + ' konuşmadan ve danışanın ekranından kalkar.', 'Kaldır', (ok) => {
        if (!ok) return;
        if (kasa() && m.ek.anahtar) kasa().sil(m.ek.anahtar);
        m.ek.kaldirildi = true; delete m.ek.anahtar;
        PA.kaydet(); kutuCiz(); aktif.ciz(); DD.toast('Dosya kaldırıldı.');
      });
    }
  });
  $('skDosya').addEventListener('change', () => {
    const f = $('skDosya').files[0], id = aktif && aktif.id;
    $('skDosya').value = '';
    if (!f || !id) return;
    if (guncellenen) {
      const m = guncellenen;
      guncellenen = null;
      Object.assign(m.ek, { ad: f.name, boyut: f.size, guncelleme: DD.bugun });
      ekKaydet(id, m, f).then((ok) => { kutuCiz(); aktif.ciz(); DD.toast(ok ? 'Dosya yeni sürümle güncellendi.' : 'Dosya adı güncellendi, içerik bu tarayıcıda saklanamadı.', ok ? undefined : 'uyari'); });
      PA.kaydet();
      return;
    }
    const m = PA.mesajYaz(id, '', { ad: f.name, boyut: f.size });
    PA.kaydet();
    ekKaydet(id, m, f).then((ok) => { kutuCiz(); aktif.ciz(); DD.toast(ok ? 'Dosya danışana gönderildi.' : 'Dosya gönderildi, içerik bu tarayıcıda saklanamadı.', ok ? undefined : 'uyari'); });
  });

  /* ── Mesaj bildirme ── */
  $('mbForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!PA.formGecerli(e.target) || !bildirilen) return;
    const { id, m } = bildirilen, d = PA.d();
    (d.mesaj_bildirimleri = d.mesaj_bildirimleri || []).push({ id: 'mb' + Date.now(), danisan_id: id, mesaj_zaman: m.zaman, gerekce: $('mbGerekce').value, aciklama: $('mbAciklama').value.trim(), zaman: PA.simdi, durum: 'inceleniyor' });
    m.bildirildi = true;
    PA.kaydet();
    DD.kapat($('mesajBildir'));
    DD.toast('Mesaj moderasyon ekibine bildirildi.');
    if (aktif) aktif.ciz();
  });

  /* o: {geri: fn, kisayol: bool, gonderildi: fn} */
  PA.sohbet = function (kap, id, o = {}) {
    const dn = PA.danisan(id);
    const k = PA.konusma(id, false) || { mesajlar: [] };
    let ek = null, ekDosya = null;
    if (k.okunmamis) { k.okunmamis = 0; PA.kaydet(); }
    const i = PA.ilerleme(dn);
    const dosyaSay = k.mesajlar.filter((m) => m.ek && !m.ek.kaldirildi).length;
    const bas = o.kisayol === false ? '' : `<div class="sohbet-alan-bas"><div class="kisi-hucre">
<button class="ikon-dugme sohbet-alan-geri" type="button" data-sohbet="geri" aria-label="Konuşmalara dön"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>${PA.avatar(dn.ad)}<span class="kisi-bilgi"><span class="kisi-ad">${h(dn.ad)}</span><span class="kisi-alt">${(PA.durumlar[dn.durum] || [''])[0]}${i ? ' · ' + i.hafta + '. hafta' : ''}</span></span></div>
<div class="eylem-satiri">${PA.takipte(dn) ? `<button class="dugme hayalet kucuk" type="button" data-randevu-ac data-danisan="${dn.id}"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i> Kontrol randevusu</button>` : ''}<button class="ikon-dugme" type="button" data-sohbet="kutu" aria-label="Notlar ve dosyalar${dosyaSay ? ', ' + dosyaSay + ' dosya' : ''}"><i class="fa-solid fa-folder-open" aria-hidden="true"></i></button><a class="ikon-dugme" href="${PA.yol.danisan(dn.id)}" aria-label="Danışan kartını aç"><i class="fa-solid fa-id-card" aria-hidden="true"></i></a></div></div>`;
    kap.innerHTML = `${bas}<div class="sohbet-akis" aria-live="polite"></div>
<form class="sohbet-yaz"><div class="sohbet-kunye" hidden></div><div class="sohbet-yaz-satir">
<input type="file" hidden aria-hidden="true" tabindex="-1">
<button class="sohbet-dugme-kucuk" type="button" data-sohbet="ek" aria-label="Dosya ekle"><i class="fa-solid fa-paperclip" aria-hidden="true"></i></button>
<textarea rows="1" placeholder="Mesaj yaz" aria-label="Mesaj yaz"></textarea>
<button class="sohbet-dugme-kucuk gonder" type="submit" aria-label="Gönder"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button></div></form>`;
    const akisEl = kap.querySelector('.sohbet-akis'), yazi = kap.querySelector('textarea'), dosya = kap.querySelector('input[type=file]'), kunye = kap.querySelector('.sohbet-kunye');
    const ciz = () => {
      const g = PA.konusma(id, false);
      akisEl.innerHTML = g && g.mesajlar.length ? akis(g) : '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-comment-dots" aria-hidden="true"></i></span><h3>Henüz mesaj yok</h3><p>İlk mesajı yazarak konuşmayı başlat.</p></div>';
      akisEl.scrollTop = akisEl.scrollHeight;
    };
    const ekCiz = () => {
      kunye.hidden = !ek;
      kunye.innerHTML = ek ? `<span class="rozet pasif"><i class="fa-solid fa-paperclip" aria-hidden="true"></i> ${h(ek.ad)} · ${boyut(ek.boyut)}</span><button class="ikon-dugme" type="button" data-sohbet="ek-sil" aria-label="Eki kaldır"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button><span>Dosya bu tarayıcıda saklanır, danışan ekranında indirilebilir.</span>` : '';
    };
    const gonder = () => {
      const metin = yazi.value.trim();
      if (!metin && !ek) { DD.toast('Önce bir mesaj yaz.', 'uyari'); yazi.focus(); return; }
      const m = PA.mesajYaz(id, metin, ek), f = ekDosya;
      PA.yanitlandi(id);
      ek = null; ekDosya = null; yazi.value = ''; dosya.value = '';
      PA.kaydet(); ekCiz(); ciz();
      if (f) ekKaydet(id, m, f).then((ok) => { if (!ok) DD.toast('Dosya gönderildi, içerik bu tarayıcıda saklanamadı.', 'uyari'); });
      if (o.gonderildi) o.gonderildi();
    };
    kap.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); gonder(); });
    yazi.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gonder(); } });
    dosya.addEventListener('change', () => { const f = dosya.files[0]; if (f) { ek = { ad: f.name, boyut: f.size }; ekDosya = f; ekCiz(); } });
    const kendi = { id, ciz };
    kap.onclick = (e) => {
      const b = e.target.closest('[data-sohbet]');
      if (!b) return;
      const g = PA.konusma(id, false), m = g && b.dataset.i != null ? g.mesajlar[+b.dataset.i] : null;
      if (b.dataset.sohbet === 'ek') dosya.click();
      if (b.dataset.sohbet === 'ek-sil') { ek = null; ekDosya = null; dosya.value = ''; ekCiz(); }
      if (b.dataset.sohbet === 'geri' && o.geri) o.geri();
      if (b.dataset.sohbet === 'indir' && m && m.ek) indir(m.ek);
      if (b.dataset.sohbet === 'kutu') { aktif = kendi; kutuCiz(); DD.ac('#sohbetKutu'); }
      if (b.dataset.sohbet === 'bildir' && m) {
        aktif = kendi; bildirilen = { id, m };
        $('mbAlinti').innerHTML = `<b>${h(dn.ad)} · ${PA.tarih(m.zaman)} ${DD.bicim.saat(m.zaman.slice(11, 16))}</b>${h(m.metin || (m.ek ? m.ek.ad : ''))}`;
        $('mbForm').reset();
        DD.ac('#mesajBildir');
      }
    };
    aktif = kendi;
    ciz();
    return { ciz };
  };
})();
