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
  $('kaydet').addEventListener('click', () => {
    if (!DD.oturum.acik()) { location.href = DD.kok + 'giris/'; return; }
    const d = DD.demo.al(); d.uye = d.uye || {};
    (d.uye.hesaplayici_sonuclari = d.uye.hesaplayici_sonuclari || []).push(Object.assign({ arac: 'gunluk-kalori' }, son));
    DD.demo.kaydet(); DD.toast('Sonucun hesabına kaydedildi.');
  });
})();
