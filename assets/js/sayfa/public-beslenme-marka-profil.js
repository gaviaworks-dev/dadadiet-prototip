/* Marka profili (marka-profil.takip): "Takip Et" giriş ister. Misafir giriş sayfasına gider, girişten sonra bu sayfaya döner
   (canlı: misafirde giriş sayfasına GET formu). Üyede takip demo hesabında tutulur (uye.marka_takip); takipçi sayısı yalnız bu
   tarayıcıdaki demo takibini sayar, sahte sayı yok. Canlıda POST /markalar/{marka}/takip (marka_takipleri). */
(function () {
  'use strict';
  const DD = window.DD || {};
  const d = document.querySelector('[data-marka-takip]');
  if (!d) return;
  const marka = d.dataset.markaTakip;
  const sayi = document.querySelector('[data-marka-takipci]');
  const sonuc = document.querySelector('[data-marka-takip-sonuc]');
  const acik = () => DD.oturum && DD.oturum.acik();
  const liste = () => { const u = (DD.demo.al().uye = DD.demo.al().uye || {}); return (u.marka_takip = u.marka_takip || []); };
  const takipte = () => acik() && liste().includes(marka);
  function ciz() {
    const t = takipte();
    d.setAttribute('aria-pressed', String(t));
    d.classList.toggle('birincil', !t);
    d.classList.toggle('hayalet', t);
    d.querySelector('i').className = 'fa-solid ' + (t ? 'fa-user-check' : 'fa-user-plus');
    d.querySelector('span').textContent = t ? 'Takibi Bırak' : 'Takip Et';
    if (sayi) sayi.textContent = t ? '1' : '0';
  }
  d.addEventListener('click', function () {
    if (!acik()) {
      const kok = new URL(DD.kok || './', location.href).pathname;
      location.href = (DD.kok || './') + 'giris/?donus=' + encodeURIComponent(location.pathname.slice(kok.length));
      return;
    }
    const l = liste(), i = l.indexOf(marka);
    if (i === -1) l.push(marka); else l.splice(i, 1);
    DD.demo.kaydet();
    ciz();
    const metin = i === -1 ? 'Markayı takip ediyorsun.' : 'Markayı takip etmeyi bıraktın.';
    if (sonuc) { sonuc.hidden = false; sonuc.querySelector('span').textContent = metin; }
    if (DD.toast) DD.toast(i === -1 ? 'Markayı takip ediyorsun' : 'Takip bırakıldı');
  });
  ciz();
})();
