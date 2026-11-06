/* Giriş, kayıt, şifre: prototip oturumu. Parola hiçbir yere yazılmaz. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const epostaMi = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const hata = (id, var_) => { const g = $(id), h = $(id + 'Hata'); if (g) { g.classList.toggle('hatali', var_); g.setAttribute('aria-invalid', String(var_)); } if (h) h.classList.toggle('goster', var_); return var_; };
  const git = (y) => { location.href = DD.kok + y; };
  const metin = (id) => $(id).value.trim();

  document.addEventListener('click', (e) => {
    const goz = e.target.closest('[data-goz]');
    if (goz) {
      const g = $(goz.dataset.goz), ac = g.type === 'password';
      g.type = ac ? 'text' : 'password';
      goz.setAttribute('aria-pressed', String(ac));
      goz.setAttribute('aria-label', ac ? 'Şifreyi gizle' : 'Şifreyi göster');
      goz.querySelector('i').className = 'fa-solid ' + (ac ? 'fa-eye-slash' : 'fa-eye');
    }
    if (e.target.closest('[data-sosyal]')) { DD.oturum.ac(); git($('kayitForm') ? 'hesabim/hos-geldin/' : 'hesabim/'); }
    const rol = e.target.closest('#girisRol button');
    if (rol) rol.parentElement.querySelectorAll('button').forEach((b) => { const a = b === rol; b.classList.toggle('aktif', a); b.setAttribute('aria-pressed', String(a)); });
  });

  const giris = $('girisForm');
  if (giris) giris.addEventListener('submit', (e) => {
    e.preventDefault();
    const h1 = hata('eposta', !epostaMi(metin('eposta'))), h2 = hata('sifre', $('sifre').value.length < 8);
    if (h1 || h2) return;
    DD.oturum.ac();
    git(giris.querySelector('#girisRol .aktif').dataset.rol === 'diyetisyen' ? 'diyetisyen-paneli/' : giris.dataset.hedef);
  });

  const kayit = $('kayitForm');
  if (kayit) kayit.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = $('sifre').value;
    const l = [hata('ad', !metin('ad')), hata('soyad', !metin('soyad')), hata('eposta', !epostaMi(metin('eposta'))), hata('sifre', s.length < 8 || !/[a-zçğıöşü]/.test(s) || !/[A-ZÇĞİÖŞÜ]/.test(s) || !/\d/.test(s))];
    const onay = $('kosul').checked && $('kvkk').checked;
    $('onayHata').classList.toggle('goster', !onay);
    if (l.some(Boolean) || !onay) return;
    DD.oturum.ac(); git(kayit.dataset.hedef);
  });

  const sifre = $('sifreForm');
  if (sifre) sifre.addEventListener('submit', (e) => {
    e.preventDefault();
    if (hata('eposta', !epostaMi(metin('eposta')))) return;
    sifre.hidden = true; $('sifreBasari').classList.add('acik');
  });
})();
