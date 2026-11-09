/* Giriş, kayıt, şifre, e-posta doğrulama: prototip oturumu. Parola hiçbir yere yazılmaz.
   ?donus=yol: girişten sonra başlanan sayfaya dönülür. Misafir deposu (misafir.js) oturum açılınca hesaba aktarılır. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const epostaMi = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const hata = (id, var_) => { const g = $(id), h = $(id + 'Hata'); if (g) { g.classList.toggle('hatali', var_); g.setAttribute('aria-invalid', String(var_)); } if (h) h.classList.toggle('goster', var_); return var_; };
  const metin = (id) => $(id).value.trim();
  const M = DD.misafir;
  const donus = DD.davet ? DD.davet.guvenliYol(new URLSearchParams(location.search).get('donus') || '') : '';

  /* Dönüş yolu kayıt ve giriş arasında taşınır */
  if (donus) document.querySelectorAll('[data-donus-tasi]').forEach((a) => { a.href += '?donus=' + encodeURIComponent(donus); });
  /* Misafirken kaydedilenler: kartın üstünde sayı, oturum açılınca aktarılır */
  const n = M ? M.sayi() : 0;
  document.querySelectorAll('[data-misafir-not]').forEach((p) => {
    p.hidden = !n;
    p.innerHTML = '<i class="fa-solid fa-box-archive" aria-hidden="true"></i><span>Misafirken kaydettiğin ' + n + ' kayıt hesabına aktarılacak.</span>';
  });

  /* Oturumu aç, misafir kayıtlarını aktar. Aktarım olduysa bildirim okunsun diye yönlendirme kısa bekler */
  function bitir(hedef) {
    DD.oturum.ac();
    const a = M ? M.aktar() : 0;
    const git = () => { location.href = DD.kok + hedef; };
    if (!a) { git(); return; }
    DD.toast(M.aktarimMetni(a));
    setTimeout(git, 1400);
  }
  const kayitHedefi = (f) => (f.dataset.dogrula ? f.dataset.dogrula + (donus ? '?donus=' + encodeURIComponent(donus) : '') : donus || f.dataset.hedef);

  document.addEventListener('click', (e) => {
    const goz = e.target.closest('[data-goz]');
    if (goz) {
      const g = $(goz.dataset.goz), ac = g.type === 'password';
      g.type = ac ? 'text' : 'password';
      goz.setAttribute('aria-pressed', String(ac));
      goz.setAttribute('aria-label', ac ? 'Şifreyi gizle' : 'Şifreyi göster');
      goz.querySelector('i').className = 'fa-solid ' + (ac ? 'fa-eye-slash' : 'fa-eye');
    }
    const sos = e.target.closest('[data-sosyal]');
    if (sos) {
      /* Kayıtta sosyal hesapla açılış önce yasal onay ister; girişte doğrudan açılır */
      if ($('kayitForm')) { $('sosyalOnayKaynak').textContent = sos.textContent.replace(/ (ile )?kayıt ol$/, '').trim() + ' hesabınla'; DD.ac('#sosyalOnay'); return; }
      bitir(donus || 'hesabim/');
    }
    const rol = e.target.closest('#girisRol button');
    if (rol) {
      rol.parentElement.querySelectorAll('button').forEach((b) => { const a = b === rol; b.classList.toggle('aktif', a); b.setAttribute('aria-pressed', String(a)); });
      /* Demo: rol değişince o hesabın kurgu bilgileri dolar */
      $('eposta').value = rol.dataset.eposta; $('sifre').value = 'demo1234';
      hata('eposta', false); hata('sifre', false);
    }
  });
  /* E-posta / telefon ile giriş */
  const yol = () => { const b = document.querySelector('#girisYolu [aria-pressed="true"]'); return b ? b.dataset.deger : 'eposta'; };
  document.addEventListener('dd:secim', (e) => {
    if (e.target.id !== 'girisYolu') return;
    document.querySelectorAll('[data-giris-yolu]').forEach((k) => { k.hidden = k.dataset.girisYolu !== yol(); });
    hata('eposta', false); hata('telefon', false);
  });

  const giris = $('girisForm');
  if (giris) giris.addEventListener('submit', (e) => {
    e.preventDefault();
    const tel = metin('telefon').replace(/\D/g, '');
    const h1 = yol() === 'telefon' ? hata('telefon', !/^5\d{9}$/.test(tel)) : hata('eposta', !epostaMi(metin('eposta')));
    const h2 = hata('sifre', $('sifre').value.length < 8);
    if (h1 || h2) return;
    if (giris.querySelector('#girisRol .aktif').dataset.rol === 'diyetisyen') { location.href = DD.kok + 'diyetisyen-paneli/'; return; }
    bitir(donus || giris.dataset.hedef);
  });

  const kayit = $('kayitForm');
  if (kayit) kayit.addEventListener('submit', (e) => {
    e.preventDefault();
    const s = $('sifre').value;
    const l = [hata('ad', !metin('ad')), hata('soyad', !metin('soyad')), hata('eposta', !epostaMi(metin('eposta'))), hata('sifre', s.length < 8 || !/[a-zçğıöşü]/.test(s) || !/[A-ZÇĞİÖŞÜ]/.test(s) || !/\d/.test(s))];
    const onay = $('kosul').checked && $('kvkk').checked;
    $('onayHata').classList.toggle('goster', !onay);
    if (l.some(Boolean) || !onay) return;
    try { sessionStorage.setItem('dd-dogrula-adres', metin('eposta')); } catch (h) { /* yok say */ }
    bitir(kayitHedefi(kayit));
  });
  const sosyalOnay = $('sosyalOnayForm');
  if (sosyalOnay) sosyalOnay.addEventListener('submit', (e) => {
    e.preventDefault();
    const onay = $('soKosul').checked && $('soKvkk').checked;
    $('soOnayHata').classList.toggle('goster', !onay);
    if (onay) bitir(donus || kayit.dataset.hedef);
  });

  /* E-posta doğrulama: örnek akış */
  const devam = $('dogrulaDevam');
  if (devam) {
    if (donus) devam.href = DD.kok + donus;
    try { const a = sessionStorage.getItem('dd-dogrula-adres'); if (a) $('dogrulaAdres').textContent = a; } catch (h) { /* yok say */ }
    $('dogrulaYeniden').addEventListener('click', () => DD.toast('Doğrulama bağlantısı yeniden gönderildi (örnek akış).'));
  }

  const sifre = $('sifreForm');
  if (sifre) sifre.addEventListener('submit', (e) => {
    e.preventDefault();
    if (hata('eposta', !epostaMi(metin('eposta')))) return;
    sifre.hidden = true; $('sifreBasari').classList.add('acik');
  });
})();
