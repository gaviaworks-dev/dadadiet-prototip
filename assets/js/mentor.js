/* Sol alt Mentör düğmesi. Kaynak gastro-mentor dalı dikey/mentor: public/kabuk/mentor.js, parcalar/kabuk/mentor.blade.php, MentorKabugu.php.
   Panel sohbet değildir: Mentör'ün ne yaptığını anlatır, "Pro pakette · Yakında" taşır, misafiri kayda, üyeyi /pro'ya götürür.
   Gastro kuralı: yönetim, tam ekran, kimlik sayfaları, /pro ve hata sayfalarında basılmaz. Durum tutulmaz, her sayfa kapalı başlar. */
(function () {
  'use strict';
  const DD = window.DD;
  const HARIC = ['giris', 'kayit', 'sifremi-unuttum', 'eposta-dogrula', 'pro'];
  /* Düğmeyle aynı sütunda dipten yer kaplayan yüzeyler; düğme bunların üstüne oturur */
  const ENGEL = '#cookieBanner,.alt-cubuk,.bottom-nav,.sihirbaz-ayak,.rd-actbar,.actbar';
  /* Akışta duran denetimler: kapalı düğmenin dinlenme kutusuna girince düğme üstüne çıkar, kutudan çıkınca iner */
  const AKIS = '.sohbet-yaz-satir,.suzme-ac,.filtre-ac';

  function uygun() {
    if (!DD || document.body.classList.contains('yetkili') || !document.querySelector('[data-site-header]')) return false;
    if (document.title.startsWith('Sayfa bulunamadı')) return false;
    const kokYol = new URL(DD.kok, location.href).pathname;
    return !HARIC.includes(location.pathname.slice(kokYol.length).split('/')[0]);
  }

  function kur() {
    if (!uygun()) return;
    const ik = (ad) => '<i class="fa-solid ' + ad + '" aria-hidden="true"></i>';
    const kok = document.createElement('aside');
    kok.id = 'dadaMentor';
    kok.dataset.state = 'mini';
    kok.setAttribute('aria-label', 'DadaMentor');
    kok.innerHTML = '<div class="mp-media"><div class="mp-atmos"></div><video muted loop playsinline preload="none" aria-hidden="true"></video></div><div class="mp-fade"></div>'
      + '<button class="mp-mini-overlay" type="button" aria-expanded="false" aria-controls="dadaMentorGovde" aria-label="Mentör panelini aç"><span class="mav">' + ik('fa-compass') + '</span><span class="mp-mini-lbl">Mentör</span></button>'
      + '<div class="mp-top" inert><span class="mp-tag">' + ik('fa-comment-dots') + ' Mentor</span><button class="mp-toggle" type="button" aria-label="Paneli küçült">' + ik('fa-minus') + '</button></div>'
      + '<div class="mp-chat" id="dadaMentorGovde" inert><div class="mp-id"><span class="mp-av">' + ik('fa-compass') + '</span><span class="mp-kimlik"><span class="nm"><span class="bd">Dada</span><span class="sf">Mentor</span></span><span class="mp-rozetler"><span class="mp-pro">' + ik('fa-crown') + ' Pro pakette</span><span class="mp-yakinda">Yakında</span></span></span></div>'
      + '<div class="mp-bubble">Beslenmende sana yol gösteren kişisel rehberin.</div><p class="mp-hint">Bugün ne yiyeceğini, tabağını nasıl dengeleyeceğini ve haftalık menünü Mentör\'le planlarsın.</p><div class="mp-row"><a class="mp-opt active"></a></div></div>';
    document.body.append(kok);

    const ac = kok.querySelector('.mp-mini-overlay'), kucult = kok.querySelector('.mp-toggle'), ust = kok.querySelector('.mp-top');
    const govde = kok.querySelector('.mp-chat'), video = kok.querySelector('video'), cagri = kok.querySelector('.mp-opt');
    const hareketsiz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ana = document.getElementById('pageMain');
    let acik = false;

    const gorunur = (o) => !o.hidden && o.getClientRects().length > 0 && getComputedStyle(o).visibility !== 'hidden';
    function olc() {
      const sol = kok.offsetLeft, sag = sol + (acik ? Math.min(360, innerWidth - 32) : (innerWidth > 640 ? 148 : 56));
      let engel = 0;
      document.querySelectorAll(ENGEL).forEach((o) => {
        if (!gorunur(o)) return;
        const r = o.getBoundingClientRect(), konum = getComputedStyle(o).position;
        const dipte = konum === 'fixed' || (konum === 'sticky' && r.bottom >= innerHeight - 2);
        if (dipte && r.height > 0 && r.top < innerHeight && r.left < sag && r.right > sol) engel = Math.max(engel, Math.round(innerHeight - r.top));
      });
      if (!acik) {
        const taban = innerWidth > 640 ? 24 : 16, dinlenme = innerHeight - taban - 56;
        document.querySelectorAll(AKIS).forEach((o) => {
          if (!gorunur(o)) return;
          const r = o.getBoundingClientRect();
          if (r.left < sag && r.right > sol && r.top < innerHeight - taban && r.bottom > dinlenme) engel = Math.max(engel, Math.round(innerHeight - r.top));
        });
      }
      kok.style.setProperty('--mentor-engel', engel + 'px');
      /* Footer perdesi: içeriğin alt kenarı düğmenin dibine gelince kenara çekilir. Açık panel kullanıcının elinde, çekilmez */
      const en = document.documentElement.scrollHeight - innerHeight;
      kok.classList.toggle('foot-hide', !acik && en > 320 && !!ana && ana.getBoundingClientRect().bottom < innerHeight - 8);
    }
    let bekleyen = false;
    function olcSonra() {
      if (bekleyen) return;
      bekleyen = true;
      requestAnimationFrame(() => { bekleyen = false; olc(); });
    }

    function durum(yeni, odak) {
      acik = yeni;
      kok.dataset.state = acik ? 'full' : 'mini';
      ac.setAttribute('aria-expanded', String(acik));
      ac.inert = acik;
      ust.inert = !acik;
      govde.inert = !acik;
      if (acik) {
        const uye = DD.oturum.acik();
        cagri.href = DD.kok + (uye ? 'pro/' : 'kayit/');
        cagri.textContent = uye ? 'Pro\'yu incele' : 'Üye ol';
        if (!video.getAttribute('src')) video.setAttribute('src', DD.kok + 'assets/video/mentor-panel.mp4');
        if (!hareketsiz) { const oynat = video.play(); if (oynat) oynat.catch(() => {}); }
        kucult.focus({ preventScroll: true });
      } else {
        video.pause();
        if (odak) ac.focus({ preventScroll: true });
      }
      olcSonra();
    }

    ac.addEventListener('click', () => durum(true));
    kucult.addEventListener('click', () => durum(false, true));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && acik) durum(false, true); });
    document.addEventListener('click', (e) => { if (acik && !kok.contains(e.target)) durum(false); });
    kok.addEventListener('focusout', (e) => { if (acik && e.relatedTarget && !kok.contains(e.relatedTarget)) durum(false); });
    window.addEventListener('scroll', olcSonra, { passive: true });
    window.addEventListener('resize', olcSonra, { passive: true });
    window.addEventListener('load', olcSonra);
    olc();
  }
  document.addEventListener('DOMContentLoaded', kur);
})();
