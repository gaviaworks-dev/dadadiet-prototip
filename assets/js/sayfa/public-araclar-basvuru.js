/* Diyetisyen Ol: doğrulama, tamamlanma, taslak (DD.demo), gönderim sonrası durum.
   Dosyalar yüklenmez; e-posta, telefon ve diploma numarası taslağa yazılmaz. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const form = $('basvuruForm'), alan = $('basvuruAlan'), durum = $('basvuruDurum');
  const TASLAK = ['ad', 'soyad', 'sehir', 'cinsiyet', 'universite', 'mezuniyet', 'unvan', 'deneyim', 'bio', 'klinikAd', 'klinikAdres', 'diller', 'ucretNot'];
  const ZORUNLU = ['ad', 'soyad', 'eposta', 'telefon', 'sehir', 'diploma', 'universite', 'mezuniyet', 'unvan', 'deneyim', 'bio'];
  const uzmanlar = () => [...$('uzmanlik').querySelectorAll('[aria-pressed="true"]')].map((b) => b.dataset.deger);
  const gorusme = () => [...$('gorusme').querySelectorAll('[aria-pressed="true"]')].map((b) => b.dataset.deger);
  const dosyaVar = (id) => !$(id + 'Liste').hidden;
  const epostaMi = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const gecerli = (id) => {
    const g = $(id), v = g.value.trim();
    if (!v) return false;
    if (id === 'eposta') return epostaMi(v);
    if (g.type === 'number') return +v >= +g.min && +v <= +g.max;
    return true;
  };
  const BOLUM = {
    kisisel: () => ['ad', 'soyad', 'eposta', 'telefon', 'sehir'].every(gecerli),
    mesleki: () => ['diploma', 'universite', 'mezuniyet', 'unvan', 'deneyim'].every(gecerli) && uzmanlar().length > 0,
    belgeler: () => dosyaVar('diplomaDosya') && dosyaVar('foto'),
    profil: () => gecerli('bio') && gorusme().length > 0 && $('riza1').checked && $('riza2').checked,
  };

  function tamamlanma() {
    const parca = ZORUNLU.filter(gecerli).length + (uzmanlar().length ? 1 : 0) + (dosyaVar('diplomaDosya') ? 1 : 0) + (dosyaVar('foto') ? 1 : 0) + (gorusme().length ? 1 : 0) + ($('riza1').checked ? 1 : 0) + ($('riza2').checked ? 1 : 0);
    const oran = Math.round((parca / (ZORUNLU.length + 6)) * 100);
    $('tamamCubuk').style.setProperty('--oran', oran);
    $('tamamCubuk').parentElement.setAttribute('aria-valuenow', oran);
    $('tamamMetin').textContent = '%' + oran + ' tamamlandı';
    Object.keys(BOLUM).forEach((k) => document.querySelector('[data-bag="' + k + '"]').classList.toggle('tamam', BOLUM[k]()));
  }
  function taslakYaz() {
    const d = DD.demo.al(), t = {};
    TASLAK.forEach((k) => { t[k] = $(k).value; });
    t.uzmanlik = uzmanlar(); t.gorusme = gorusme();
    d.diyetisyen_basvuru = Object.assign({}, d.diyetisyen_basvuru, { taslak: t });
    DD.demo.kaydet();
  }
  function taslakOku() {
    const b = DD.demo.al().diyetisyen_basvuru, t = b && b.taslak;
    if (!t) return;
    TASLAK.forEach((k) => { if (t[k] != null) $(k).value = t[k]; });
    (t.uzmanlik || []).forEach((u) => { const c = [...$('uzmanlik').children].find((x) => x.dataset.deger === u); if (c) c.setAttribute('aria-pressed', 'true'); });
    (t.gorusme || []).forEach((u) => { const c = $('gorusme').querySelector('[data-deger="' + u + '"]'); if (c) c.setAttribute('aria-pressed', 'true'); });
  }
  function sayaclar() {
    $('uzmanSayac').textContent = uzmanlar().length + ' / 5';
    $('bioSayac').textContent = $('bio').value.length + ' / 600';
    $('klinikAlani').hidden = !gorusme().includes('yuz');
  }
  function durumGoster(b) {
    alan.hidden = true; durum.hidden = false;
    $('durumMetin').textContent = b.ad + ', başvurun ' + b.tarih.split('-').reverse().join('.') + ' tarihinde alındı. Doğrulama 2-3 iş günü sürer.';
  }

  form.addEventListener('input', () => { sayaclar(); tamamlanma(); taslakYaz(); });
  form.addEventListener('change', () => { tamamlanma(); });
  $('gorusme').addEventListener('dd:secim', () => { sayaclar(); tamamlanma(); taslakYaz(); });
  $('uzmanlik').addEventListener('click', (e) => {
    const b = e.target.closest('.cip'); if (!b) return;
    const secili = b.getAttribute('aria-pressed') === 'true';
    if (!secili && uzmanlar().length >= 5) { DD.toast('En fazla 5 uzmanlık alanı seçebilirsin.', 'uyari'); return; }
    b.setAttribute('aria-pressed', String(!secili));
    sayaclar(); tamamlanma(); taslakYaz();
  });
  form.querySelectorAll('input[type=file]').forEach((g) => g.addEventListener('change', () => {
    const l = $(g.id + 'Liste');
    l.hidden = !g.files.length;
    l.querySelector('span').textContent = [...g.files].map((f) => f.name).join(', ');
    tamamlanma();
  }));
  form.addEventListener('click', (e) => {
    const s = e.target.closest('[data-dosya-sil]'); if (!s) return;
    const g = $(s.dataset.dosyaSil); g.value = ''; $(g.id + 'Liste').hidden = true; tamamlanma();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const eksik = [];
    const isaretle = (id, hata, ad) => { const h = $(id + 'Hata'), g = $(id); if (h) h.classList.toggle('goster', hata); if (g && g.classList.contains('alan-girdi')) g.classList.toggle('hatali', hata); if (hata) eksik.push(ad); };
    ZORUNLU.forEach((id) => isaretle(id, !gecerli(id), $(id).dataset.baslik));
    isaretle('uzmanlik', !uzmanlar().length, 'Uzmanlık alanı');
    isaretle('diplomaDosya', !dosyaVar('diplomaDosya'), 'Diploma belgesi');
    isaretle('foto', !dosyaVar('foto'), 'Profil Fotoğrafı');
    isaretle('gorusme', !gorusme().length, 'Görüşme türü');
    isaretle('riza', !($('riza1').checked && $('riza2').checked), 'Onaylar');
    const ozet = $('hataOzet');
    ozet.classList.toggle('goster', eksik.length > 0);
    if (eksik.length) { ozet.querySelector('span').textContent = 'Eksik alanlar: ' + eksik.join(', ') + '.'; ozet.focus(); ozet.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    const d = DD.demo.al();
    d.diyetisyen_basvuru = Object.assign({}, d.diyetisyen_basvuru, { durum: 'alindi', ad: $('ad').value.trim(), tarih: DD.bugun });
    DD.demo.kaydet();
    durumGoster(d.diyetisyen_basvuru);
    durum.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
  $('yeniBasvuru').addEventListener('click', () => {
    durum.hidden = true; alan.hidden = false; alan.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });

  taslakOku(); sayaclar(); tamamlanma();
  const b = DD.demo.al().diyetisyen_basvuru;
  if (b && b.durum === 'alindi') durumGoster(b);
})();
