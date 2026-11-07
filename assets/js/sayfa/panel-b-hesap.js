/* Hesap ayarları: bildirim matrisi, hatırlatmalar, dil, şifre ve oturumlar. */
(function () {
  'use strict';
  const { $, esc } = PB;
  const dyt = PB.demo().diyetisyen;
  const BILDIRIM = [['randevu', 'Yeni randevu talebi', 'Danışan randevu istediğinde anında haber ver'], ['mesaj', 'Yeni Mesaj', 'Danışanlarından gelen mesajlar'], ['yorum', 'Yeni değerlendirme', 'Profilin yorum ya da puan aldığında'], ['ozet', 'Haftalık panel özeti', 'Randevu, danışan ve mesaj istatistikleri']];
  const HATIRLAT = [['danisan', 'fa-clock', 'Danışana otomatik hatırlatma', 'Randevudan 24 saat önce danışana e-posta gönderilir'], ['ajanda', 'fa-mobile-screen', 'Bana sabah ajandası', 'Her sabah 08.00\'de günün randevu listesi'], ['sessiz', 'fa-moon', 'Sessiz saatler', '21.00 – 08.00 arası push bildirimi gelmez']];
  const V = { kanal: { randevu: { eposta: true, push: true }, mesaj: { eposta: false, push: true }, yorum: { eposta: true, push: false }, ozet: { eposta: true, push: false } }, hatirlat: { danisan: true, ajanda: true, sessiz: false }, dil: 'Türkçe', iki_adim: true, oturumlar: [{ ad: 'Bu cihaz · Chrome, macOS', zaman: 'Şu an etkin', bu: true }, { ad: 'iPhone · Safari', zaman: 'Dün 21.40' }] };
  const A = Object.assign({}, JSON.parse(JSON.stringify(V)), dyt.ayarlar || {});
  const anahtar = (ad, ac, etiket) => '<label class="anahtar"><input type="checkbox" data-anahtar="' + ad + '"' + (ac ? ' checked' : '') + ' aria-label="' + esc(etiket) + '"><span class="anahtar-ray"></span></label>';
  const degisti = () => { $('#ayarNot').textContent = 'Kaydedilmemiş değişiklik var'; };

  function ciz() {
    $('#bildirimSatirlar').innerHTML = BILDIRIM.map(([k, a, m]) => '<tr><td><b>' + a + '</b><small>' + m + '</small></td><td>' + anahtar('kanal.' + k + '.eposta', A.kanal[k].eposta, a + ' e-posta') + '</td><td>' + anahtar('kanal.' + k + '.push', A.kanal[k].push, a + ' push') + '</td></tr>').join('');
    $('#hatirlatmaListe').innerHTML = HATIRLAT.map(([k, i, a, m]) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + i + '" aria-hidden="true"></i></span><span class="as-metin"><b>' + a + '</b><span>' + m + '</span></span><span class="as-eylem">' + anahtar('hatirlat.' + k, A.hatirlat[k], a) + '</span></div>').join('');
    $('#panelDil').value = A.dil;
    $('#hesapOzet').innerHTML = '<div class="deger-satir"><span>Ad soyad</span><b>' + esc(dyt.ad) + '</b></div><div class="deger-satir"><span>E-posta</span><b>hesap@ornek.com</b></div><div class="deger-satir"><span>Üyelik</span><b>Diyetisyen</b></div><div class="deger-satir"><span>Şifre</span><b>' + (A.sifre_son ? PB.tarihSaat(A.sifre_son) + ' değişti' : 'Son 90 günde değişmedi') + '</b></div>';
    sifreDurum();
    guvenlikCiz();
  }
  function sifreDurum() {
    const e = $('#sifreSonuc');
    e.hidden = !A.sifre_son;
    if (A.sifre_son) e.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i><p><b>Şifren güncellendi.</b> ' + PB.tarihSaat(A.sifre_son) + ' tarihinde değişti; diğer cihazlardaki oturumlar kapatıldı.</p>';
  }
  function guvenlikCiz() {
    const digerler = A.oturumlar.filter((o) => !o.bu);
    $('#guvenlikListe').innerHTML = '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i></span><span class="as-metin"><b>İki adımlı doğrulama</b><span>Girişte SMS koduyla ek güvenlik</span></span><span class="as-eylem">' + anahtar('iki_adim', A.iki_adim, 'İki adımlı doğrulama') + '</span></div>' +
      A.oturumlar.map((o) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-laptop" aria-hidden="true"></i></span><span class="as-metin"><b>' + esc(o.ad) + '</b><span>' + esc(o.zaman) + '</span></span></div>').join('') +
      '<div class="ayar-satir"><span class="as-metin"><b>Diğer cihazlardan çık</b><span>' + digerler.length + ' başka oturum açık</span></span><span class="as-eylem"><button class="dugme hayalet kucuk" type="button" data-ayar="oturum"' + (digerler.length ? '' : ' disabled') + '>Oturumları kapat</button></span></div>';
  }
  const yaz = (yol, v) => { const p = yol.split('.'), s = p.pop(); p.reduce((o, k) => o[k], A)[s] = v; };
  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.dataset.anahtar) { yaz(t.dataset.anahtar, t.checked); degisti(); }
    if (t.id === 'panelDil') { A.dil = t.value; degisti(); }
  });
  document.addEventListener('click', function (e) {
    const d = e.target.closest('[data-ayar]');
    if (!d) return;
    if (d.dataset.ayar === 'kaydet') {
      dyt.ayarlar = JSON.parse(JSON.stringify(A)); PB.kaydet();
      $('#ayarNot').textContent = 'Kaydedildi · ' + PB.tarihSaat(PB.simdi());
      DD.toast('Ayarlar kaydedildi.');
    }
    if (d.dataset.ayar === 'oturum') {
      window.DM_ONAY('Diğer cihazlardan çıkılsın mı?', 'Bu cihaz dışındaki bütün oturumlar kapanır.', 'Oturumları kapat', (ok) => {
        if (!ok) return;
        A.oturumlar = A.oturumlar.filter((o) => o.bu);
        dyt.ayarlar = JSON.parse(JSON.stringify(A)); PB.kaydet();
        guvenlikCiz(); DD.toast('Diğer oturumlar kapatıldı.');
      });
    }
    if (d.dataset.ayar === 'sifre') {
      const eski = $('#sEski'), yeni = $('#sYeni'), tekrar = $('#sTekrar');
      if (!PB.formGecerli($('#sifreAlan'))) return;
      if (yeni.value.length < 8) { window.DM_HATA_YAZ(yeni.closest('.alan'), 'En az 8 karakter olmalı.'); yeni.focus(); return; }
      if (yeni.value !== tekrar.value) { window.DM_HATA_YAZ(tekrar.closest('.alan'), 'İki şifre aynı değil.'); tekrar.focus(); return; }
      eski.value = yeni.value = tekrar.value = '';
      A.sifre_son = PB.simdi();
      A.oturumlar = A.oturumlar.filter((o) => o.bu);
      dyt.ayarlar = JSON.parse(JSON.stringify(A)); PB.kaydet();
      ciz();
      DD.toast('Şifren güncellendi.');
    }
  });
  $('#ayarForm').addEventListener('submit', (e) => e.preventDefault());
  ciz();
})();
