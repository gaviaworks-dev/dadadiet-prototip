/* Hesap Ayarları: profil, güvenlik, kapak, veri arşivi, dondurma ve silme */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const u = U.uye();

  /* Profil formu üye kaydına yazar; kimlik bandı anında güncellenir */
  const pf = $('#profilForm');
  const parca = (u.ad || '').split(' ');
  const alanlar = { ad: parca.slice(0, -1).join(' ') || parca[0], soyad: parca.length > 1 ? parca[parca.length - 1] : '', kullanici: U.kullaniciAdi(), eposta: u.eposta || U.kullaniciAdi() + '@ornek.test', telefon: u.telefon };
  Object.keys(alanlar).forEach((k) => { if (pf.elements[k] && alanlar[k]) pf.elements[k].value = alanlar[k]; });
  pf.addEventListener('submit', (e) => {
    e.preventDefault();
    u.ad = (pf.elements.ad.value.trim() + ' ' + pf.elements.soyad.value.trim()).trim();
    U.danisan().ad = u.ad; /* panelde de aynı ad görünür */
    u.kullanici = pf.elements.kullanici.value.trim().replace(/^@/, '');
    u.telefon = pf.elements.telefon.value.trim();
    U.kaydet(); U.kimlik();
    DD.toast('Profil bilgilerin kaydedildi.');
  });

  /* Profil tamamlanma oranı dolu alanlardan hesaplanır */
  const t = u.tercihler || {};
  const adimlar = [u.ad, u.telefon, t.hedef, t.beslenme_tarzi, t.aktivite, t.ogun_sayisi, U.danisan().boy];
  const oran = Math.round((adimlar.filter(Boolean).length / adimlar.length) * 100);
  const o = $('#profilOran');
  if (o) { o.dataset.oran = oran; o.style.setProperty('--oran', oran); o.parentElement.setAttribute('aria-label', 'Profil tamamlanma oranı: yüzde ' + oran); }

  /* Şifre */
  $('#sifreForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.elements.sifre1.value !== f.elements.sifre2.value) { DD.toast('Yeni şifreler birbiriyle aynı değil.', 'hata'); return; }
    f.reset();
    DD.toast('Şifren güncellendi.');
  });

  /* Giriş yöntemi bağlama */
  const bagli = U.yerel('bagli', {});
  const baglaCiz = () => document.querySelectorAll('[data-bagla]').forEach((b) => { b.textContent = bagli[b.dataset.bagla] ? 'Bağlantıyı kes' : 'Bağla'; });
  baglaCiz();
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bagla]');
    if (!b) return;
    const ad = b.dataset.bagla;
    bagli[ad] = !bagli[ad];
    U.kaydet(); baglaCiz();
    DD.toast(ad + (bagli[ad] ? ' hesabın bağlandı.' : ' bağlantısı kaldırıldı.'));
  });

  /* Oturumlar */
  const oturumlar = U.yerel('oturumlar', [
    { ad: 'Bu tarayıcı', ikon: 'fa-laptop', metin: 'Şu anda aktif', bu: true },
    { ad: 'Dada Diet mobil uygulaması', ikon: 'fa-mobile-screen', metin: 'Son görülme: dün' },
  ]);
  const oturumCiz = () => U.bas('#oturumlar', oturumlar.map((o) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + o.ikon + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(o.ad) + '</b><span>' + U.kac(o.metin) + '</span></div>' + (o.bu ? '<span class="as-eylem">' + U.durum('cozulen', 'Bu cihaz') + '</span>' : '') + '</div>').join(''));
  oturumCiz();
  $('#oturumKapat').addEventListener('click', () => {
    const kalan = oturumlar.filter((o) => o.bu);
    if (kalan.length === oturumlar.length) { DD.toast('Bu cihaz dışında açık oturum yok.', 'uyari'); return; }
    oturumlar.length = 0; oturumlar.push(...kalan);
    U.kaydet(); oturumCiz();
    DD.toast('Diğer oturumlar kapatıldı.');
  });

  /* Kapak */
  $('#kapakUygula').addEventListener('click', () => {
    const s = document.querySelector('[data-kapak-sec][aria-pressed="true"]');
    U.yerel('gorunum', {}).kapak = s.dataset.kapakSec;
    U.kaydet(); U.kimlik();
    DD.kapat($('#kapakSec'));
    DD.toast('Kapak görselin değişti.');
  });

  /* Avatar: dosya yalnız bu tarayıcıda gösterilir */
  const avatar = document.querySelector('[data-uye-avatar]');
  $('#avatarDosya').addEventListener('change', (e) => {
    const d = e.target.files[0];
    if (!d) return;
    if (d.size > 5 * 1024 * 1024) { DD.toast('Dosya 5 MB sınırını aşıyor.', 'hata'); return; }
    avatar.style.backgroundImage = 'url("' + URL.createObjectURL(d) + '")';
    avatar.querySelector('[data-uye="harf"]').hidden = true;
    DD.kapat($('#avatarSec'));
    DD.toast('Profil fotoğrafın güncellendi.');
  });
  $('#avatarSil').addEventListener('click', () => {
    avatar.style.backgroundImage = '';
    avatar.querySelector('[data-uye="harf"]').hidden = false;
    DD.kapat($('#avatarSec'));
  });

  /* Tutulan veriler ve arşiv */
  const d = U.d();
  const say = (x) => (Array.isArray(x) ? x.length : 0);
  U.bas('#veriListeGovde', [
    ['fa-clipboard-list', 'Beslenme planları', say((d.planlar || []).filter((p) => p.danisan_id === U.uyeId())) + ' kayıt'],
    ['fa-calendar-check', 'Randevular', say(U.randevular()) + ' kayıt'],
    ['fa-weight-scale', 'Vücut ölçümleri', say(U.danisan().olcumler) + ' kayıt'],
    ['fa-flask-vial', 'Tahliller', say(U.danisan().tahliller) + ' kayıt'],
  ].map((s) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + s[0] + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + s[1] + '</b><span>' + s[2] + '</span></div></div>').join(''));
  $('#arsivOlustur').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ uye: u, olusturma: U.bugun() }, null, 2)], { type: 'application/json' }));
    a.download = 'dada-diet-verilerim.json';
    a.click();
    DD.toast('Arşivin indirildi.');
  });

  /* Dondurma ve silme kapıları */
  const dOnay = $('#dondurOnay'), dDugme = $('#dondurDugme');
  dOnay.addEventListener('change', () => { dDugme.disabled = !dOnay.checked; });
  $('#dondurForm').addEventListener('submit', (e) => {
    e.preventDefault();
    U.yerel('hesap', {}).dondurma = e.target.elements.sure.value;
    U.kaydet();
    DD.toast('Dondurma talebin alındı: ' + e.target.elements.sure.value + '.', 'uyari');
  });
  const sOnay = $('#silOnay'), sMetin = $('#silMetin'), sDugme = $('#silDugme');
  const silKontrol = () => { sDugme.disabled = !(sOnay.checked && sMetin.value.trim() === 'HESABIMI SİL'); };
  sOnay.addEventListener('change', silKontrol);
  sMetin.addEventListener('input', silKontrol);
  $('#silForm').addEventListener('submit', (e) => {
    e.preventDefault();
    U.yerel('hesap', {}).silmeTalebi = U.bugun();
    U.kaydet();
    DD.toast('Silme talebin oluşturuldu. Ekibimiz seninle iletişime geçecek.', 'uyari');
  });
})();
