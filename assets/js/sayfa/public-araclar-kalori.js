/* Günlük kalori: Mifflin-St Jeor BMH × aktivite; bandlar hesaplayicilar.json band_farki_kcal. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const form = $('kaloriForm'), EN_DUSUK = 1400;
  const tr = (n) => DD.bicim.sayi(Math.round(n));
  const secili = (kap) => { const b = kap.querySelector('[aria-pressed="true"]'); return b ? b : null; };
  const hata = (id, var_) => { $(id + 'Hata').classList.toggle('goster', var_); const g = $(id); if (g.tagName === 'INPUT') { g.classList.toggle('hatali', var_); g.setAttribute('aria-invalid', String(var_)); } };
  let son = null;

  function sayiOku(id) {
    const g = $(id), v = parseFloat(g.value), iyi = !isNaN(v) && v >= +g.min && v <= +g.max;
    hata(id, !iyi);
    return iyi ? v : null;
  }
  function hesapla() {
    const boy = sayiOku('boy'), kilo = sayiOku('kilo'), yas = sayiOku('yas');
    const c = secili($('cinsiyet')), a = secili($('aktivite'));
    hata('cinsiyet', !c); hata('aktivite', !a);
    if (boy == null || kilo == null || yas == null || !c || !a) { const h = form.querySelector('.alan-hata.goster'); if (h) h.closest('.alan').scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    const ek = +form.dataset[c.dataset.deger === 'erkek' ? 'ekErkek' : 'ekKadin'], bant = +form.dataset.bant;
    const bmh = Math.round(10 * kilo + 6.25 * boy - 5 * yas + ek), tdee = Math.round(bmh * +a.dataset.deger);
    const ver = tdee - bant, sinir = ver < EN_DUSUK;
    son = { boy, kilo, yas, bmh, tdee, tarih: DD.bugun };
    $('tdee').textContent = tr(tdee); $('bmh').textContent = tr(bmh);
    $('kiloVer').textContent = DD.bicim.kcal(Math.max(ver, EN_DUSUK)); $('kiloAl').textContent = DD.bicim.kcal(tdee + bant);
    $('altSinir').hidden = !sinir;
    $('sonucAktivite').textContent = a.querySelector('span').firstChild.textContent;
    son.kilo_ver = Math.max(ver, EN_DUSUK); son.kilo_al = tdee + bant;
    hedefYaz();
    $('hedefDurum').hidden = true;
    $('sonucBos').hidden = true; $('sonuc').hidden = false;
    if (innerWidth <= 1024) $('sonuc').scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); hesapla(); });
  $('ornek').addEventListener('click', () => {
    $('boy').value = 165; $('kilo').value = 65; $('yas').value = 30;
    $('cinsiyet').querySelector('[data-deger="kadin"]').click();
    $('aktivite').querySelector('[data-deger="1.375"]').click();
    hesapla();
  });
  $('sifirla').addEventListener('click', () => {
    ['boy', 'kilo', 'yas'].forEach((i) => { $(i).value = ''; hata(i, false); });
    ['cinsiyet', 'aktivite'].forEach((i) => { hata(i, false); $(i).querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false')); });
    son = null; $('sonuc').hidden = true; $('sonucBos').hidden = false;
  });
  /* Hedef: kilo vermek, korumak ya da almak. Üyede tercih edilen hedef önden seçilir */
  const HEDEF_AD = { ver: 'kilo vermek', koru: 'korumak', al: 'kilo almak' };
  const hedefTuru = () => { const b = $('hedefSec').querySelector('[aria-pressed="true"]'); return b ? b.dataset.deger : 'koru'; };
  const hedefKcal = () => (son ? { ver: son.kilo_ver, koru: son.tdee, al: son.kilo_al }[hedefTuru()] : 0);
  function hedefYaz() { $('hedefKcal').textContent = DD.bicim.kcal(hedefKcal()); }
  if (DD.oturum.acik()) {
    const t = ((DD.demo.al().uye || {}).tercihler || {}).hedef;
    const on = t === 'kilo' ? 'ver' : t === 'kas' ? 'al' : null;
    if (on) $('hedefSec').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === on)));
  }
  $('hedefSec').addEventListener('dd:secim', hedefYaz);
  const kayit = () => Object.assign({ arac: 'gunluk-kalori', hedef: hedefKcal(), hedef_turu: hedefTuru() }, son);
  const durum = (metin) => { const d = $('hedefDurum'); d.hidden = false; d.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>' + metin + '</span>'; };
  const uyeKaydet = () => {
    const d = DD.demo.al(); d.uye = d.uye || {};
    (d.uye.hesaplayici_sonuclari = d.uye.hesaplayici_sonuclari || []).push(kayit());
    DD.demo.kaydet();
  };
  const uyeHedef = () => {
    const d = DD.demo.al(); d.uye = d.uye || {}; d.uye.tercihler = d.uye.tercihler || {};
    d.uye.tercihler.kcal = hedefKcal();
    DD.demo.kaydet();
  };
  /* Web Kullanıcı Akışı: misafirde sonuç tarayıcıda tutulur, davet açılır; kaydolunca hesaba aktarılır */
  let bekleyen = null;
  $('kaydet').addEventListener('click', () => {
    if (!son) return;
    if (DD.oturum.acik()) {
      uyeKaydet();
      durum('Sonucun Sağlık Dosyana kaydedildi · <a href="' + DD.kok + 'hesabim/saglik-dosyam/">Sağlık Dosyamı aç</a>');
      DD.toast('Sonucun Sağlık Dosyana kaydedildi.');
      return;
    }
    DD.misafir.ekle('hesap', kayit(), 'gunluk-kalori');
    bekleyen = 'sonuc';
    DD.davet.ac({ baslik: 'Sonucumu Sağlık Dosyama kaydet', metin: 'Sonucun (' + DD.bicim.kcal(son.tdee) + ' / gün) bu tarayıcıda tutuluyor. Kaydolunca Sağlık Dosyana işlenir, değişimini zaman içinde görürsün.' });
  });
  $('hedefBelirle').addEventListener('click', () => {
    if (!son) return;
    if (DD.oturum.acik()) {
      uyeKaydet(); uyeHedef();
      durum('Günlük kalori hedefin ' + DD.bicim.kcal(hedefKcal()) + ' oldu · <a href="' + DD.kok + 'hesabim/gunluk-takibim/">Günlük takibimde gör</a>');
      DD.toast('Günlük kalori hedefin güncellendi.');
      return;
    }
    DD.misafir.ekle('hesap', kayit(), 'gunluk-kalori');
    DD.misafir.ekle('hedef', { kcal: hedefKcal(), tur: hedefTuru() }, 'kcal');
    bekleyen = 'hedef';
    DD.davet.ac({ baslik: 'Hedefimi belirle', metin: 'Hedefin ' + HEDEF_AD[hedefTuru()] + ', günde ' + DD.bicim.kcal(hedefKcal()) + '. Kaydolunca günlük kalori hedefin olarak hesabına yazılır ve kişisel planın bu hedefle kurulur.' });
  });
  document.addEventListener('dd:oturum', () => {
    if (bekleyen === 'hedef') durum('Günlük kalori hedefin ' + DD.bicim.kcal(hedefKcal()) + ' oldu · <a href="' + DD.kok + 'hesabim/gunluk-takibim/">Günlük takibimde gör</a>');
    else if (bekleyen === 'sonuc') durum('Sonucun Sağlık Dosyana kaydedildi · <a href="' + DD.kok + 'hesabim/saglik-dosyam/">Sağlık Dosyamı aç</a>');
    bekleyen = null;
  });
})();
