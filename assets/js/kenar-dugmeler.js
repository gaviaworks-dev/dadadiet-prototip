/* Sağ alt kenar kalemleri: "Başa dön" ve diyetisyen sohbeti. Kaynak canlı dadadiet.com (#toTop, #msjFab, #sohbetPanel), kanon §26 ve §28.
   Mentör ile aynı yerlerde basılır: public ve üye kabuğu; panel, tam ekran, kimlik sayfaları, /pro ve hata sayfalarında yok.
   Misafir canlıdaki giriş daveti panelini görür; üye demo yazışmasını okur ve yazar (dd-demo-durum, prototip örneği). */
(function () {
  'use strict';
  const DD = window.DD;
  const HARIC = ['giris', 'kayit', 'sifremi-unuttum', 'pro'];
  const ENGEL = '#cookieBanner,.alt-cubuk,.bottom-nav,.sihirbaz-ayak,.rd-actbar,.actbar,.rk-std-altbar';
  const AKIS = '.sohbet-yaz-satir,.suzme-ac,.filtre-ac';
  const ESIK = 500;

  function uygun() {
    if (!DD || document.body.classList.contains('yetkili') || !document.querySelector('[data-site-header]')) return false;
    if (document.title.startsWith('Sayfa bulunamadı')) return false;
    const kokYol = new URL(DD.kok, location.href).pathname;
    return !HARIC.includes(location.pathname.slice(kokYol.length).split('/')[0]);
  }
  const ik = (ad) => '<i class="fa-solid ' + ad + '" aria-hidden="true"></i>';
  const kac = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function kur() {
    if (!uygun()) return;
    const K = DD.kok;
    const basa = document.createElement('button');
    basa.className = 'basa-don';
    basa.type = 'button';
    basa.setAttribute('aria-label', 'Başa dön');
    basa.innerHTML = ik('fa-arrow-up');
    const dugme = document.createElement('button');
    dugme.className = 'yuzen-dugme';
    dugme.type = 'button';
    dugme.id = 'msjFab';
    dugme.setAttribute('aria-controls', 'sohbetPanel');
    dugme.setAttribute('aria-expanded', 'false');
    dugme.setAttribute('aria-label', 'Diyetisyen sohbeti');
    dugme.innerHTML = ik('fa-comment-dots') + '<span class="sohbet-rozet" hidden></span>';
    const ortu = document.createElement('div');
    ortu.className = 'sohbet-ortu';
    const panel = document.createElement('aside');
    panel.className = 'sohbet-panel';
    panel.id = 'sohbetPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Diyetisyen sohbeti');
    panel.inert = true;
    document.body.append(basa, dugme, ortu, panel);

    const uye = () => DD.oturum && DD.oturum.acik();
    const veri = () => {
      const d = DD.demo.al();
      d.mesajlar = d.mesajlar || [];
      const id = (d.uye && d.uye.danisan_id) || 'd1';
      let s = d.mesajlar.find((m) => m.danisan_id === id);
      if (!s) { s = { danisan_id: id, okunmamis: 0, mesajlar: [] }; d.mesajlar.push(s); }
      return { d, s };
    };
    const rozet = () => {
      const r = dugme.querySelector('.sohbet-rozet');
      const n = uye() ? veri().s.okunmamis || 0 : 0;
      r.hidden = !n;
      r.textContent = n;
    };
    const bas = (ad, alt, mono) => '<div class="sohbet-bas">' + (mono ? '<span class="sohbet-mono buyuk ok" aria-hidden="true">' + mono + '</span>' : '')
      + '<div class="sohbet-bas-kimlik"><h2>' + kac(ad) + '</h2><p class="sohbet-bas-alt">' + kac(alt) + '</p></div>'
      + '<a class="dugme ikon" href="' + K + (uye() ? 'hesabim/diyetisyenim/#mesaj' : 'giris/') + '" aria-label="Tüm mesajlar" title="Tüm mesajlar">' + ik('fa-up-right-from-square') + '</a>'
      + '<button class="sohbet-kapat" type="button" data-sohbet-kapat aria-label="Sohbeti kapat">' + ik('fa-xmark') + '</button></div>';

    function ciz() {
      if (!uye()) {
        panel.innerHTML = bas('Diyetisyen sohbeti', 'Görüşmeye başlamak için giriş yap.')
          + '<div class="sohbet-akis"><div class="bos-durum kart-ici"><span class="bos-ikon">' + ik('fa-comment-dots') + '</span><h4>Diyetisyeninle yazışmak için giriş yap</h4>'
          + '<p>Görüşmeler seninle diyetisyenin arasında geçer. Mesajlarını görmek ve kaldığın yerden devam etmek için giriş yap.</p>'
          + '<div class="sohbet-cta"><a class="dugme birincil" href="' + K + 'giris/">' + ik('fa-right-to-bracket') + ' Giriş yap</a><a class="sohbet-cta-ikincil" href="' + K + 'diyetisyenler/">Diyetisyenlere göz at ' + ik('fa-arrow-right') + '</a></div></div></div>';
        return;
      }
      const { d, s } = veri();
      const ad = (d.diyetisyen && d.diyetisyen.ad) || 'Diyetisyenin';
      const mono = ad.replace(/^(Uzm\.\s*)?Dyt\.\s*/, '').split(/\s+/).map((p) => p[0]).slice(0, 2).join('');
      let gun = '';
      const akis = s.mesajlar.map((m) => {
        const t = m.zaman.slice(0, 10);
        const ayrac = t !== gun ? '<span class="sohbet-gun">' + DD.bicim.tarih(t) + '</span>' : '';
        gun = t;
        return ayrac + '<div class="sohbet-balon ' + (m.kimden === 'danisan' ? 'uye' : 'karsi') + '"><p>' + kac(m.metin || (m.ek && m.ek.ad)) + '</p><span class="sohbet-kunye">' + DD.bicim.saat(m.zaman.slice(11, 16)) + '</span></div>';
      }).join('');
      panel.innerHTML = bas(ad, 'Prototip örneği yazışma', mono)
        + '<div class="sohbet-akis">' + (akis || '<div class="bos-durum kart-ici"><span class="bos-ikon">' + ik('fa-comments') + '</span><h4>Henüz mesaj yok</h4><p>Diyetisyenine ilk mesajını aşağıdan yaz.</p></div>') + '</div>'
        + '<form class="sohbet-yaz" data-sohbet-form><div class="sohbet-yaz-satir"><label class="yalniz-okuyucu" for="sohbetMesaj">Mesajın</label><textarea id="sohbetMesaj" rows="1" placeholder="Mesajını yaz"></textarea><button class="sohbet-dugme-kucuk gonder" type="submit" aria-label="Gönder">' + ik('fa-paper-plane') + '</button></div></form>';
      const a = panel.querySelector('.sohbet-akis');
      a.scrollTop = a.scrollHeight;
    }

    let sonOdak = null;
    function ac() {
      ciz();
      sonOdak = document.activeElement;
      panel.inert = false;
      panel.classList.add('acik');
      ortu.classList.add('acik');
      dugme.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
      if (uye()) { const { s } = veri(); if (s.okunmamis) { s.okunmamis = 0; DD.demo.kaydet(); } rozet(); }
      (panel.querySelector('textarea') || panel.querySelector('[data-sohbet-kapat]')).focus();
    }
    function kapat() {
      if (!panel.classList.contains('acik')) return;
      panel.classList.remove('acik');
      ortu.classList.remove('acik');
      panel.inert = true;
      dugme.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      if (sonOdak) sonOdak.focus();
    }
    dugme.addEventListener('click', ac);
    ortu.addEventListener('click', kapat);
    panel.addEventListener('click', (e) => { if (e.target.closest('[data-sohbet-kapat]')) kapat(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') kapat(); });
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && e.target.matches('textarea')) { e.preventDefault(); e.target.form.requestSubmit(); }
    });
    panel.addEventListener('submit', (e) => {
      e.preventDefault();
      const alan = panel.querySelector('textarea'), metin = alan.value.trim();
      if (!metin) return;
      const simdi = new Date(), iki = (n) => String(n).padStart(2, '0');
      veri().s.mesajlar.push({ kimden: 'danisan', zaman: DD.bugun + 'T' + iki(simdi.getHours()) + ':' + iki(simdi.getMinutes()), metin });
      DD.demo.kaydet();
      ciz();
      panel.querySelector('textarea').focus();
    });

    const hareketsiz = matchMedia('(prefers-reduced-motion: reduce)').matches;
    basa.addEventListener('click', () => scrollTo({ top: 0, behavior: hareketsiz ? 'auto' : 'smooth' }));

    /* Dipteki sabit yüzeylerin ve akıştaki yazma satırlarının üstüne çıkar; Mentör'ün ölçüsünün sağ kenar karşılığı */
    const gorunur = (o) => !o.hidden && o.getClientRects().length > 0 && getComputedStyle(o).visibility !== 'hidden';
    let bekliyor = false;
    function olc() {
      bekliyor = false;
      basa.classList.toggle('gorunur', scrollY > ESIK);
      const sol = innerWidth - 92;
      let engel = 0;
      document.querySelectorAll(ENGEL).forEach((o) => {
        if (!gorunur(o)) return;
        const r = o.getBoundingClientRect(), konum = getComputedStyle(o).position;
        const dipte = konum === 'fixed' || (konum === 'sticky' && r.bottom >= innerHeight - 2);
        if (dipte && r.height > 0 && r.top < innerHeight && r.right > sol) engel = Math.max(engel, Math.round(innerHeight - r.top));
      });
      document.querySelectorAll(AKIS).forEach((o) => {
        if (!gorunur(o) || panel.contains(o)) return;
        const r = o.getBoundingClientRect();
        if (r.right > sol && r.top < innerHeight - 16 && r.bottom > innerHeight - 92) engel = Math.max(engel, Math.round(innerHeight - r.top));
      });
      /* Canlı kuralı (dm-diet-t5d-p.css): telefonda 85 / 148 px sabitleri alt sekme çubuğunun payını zaten içerir; çubuk ayrıca eklenmez,
         yalnız onun üstünde duran şerit (çerez bandı, reklam alt bandı) kadar yukarı kaçılır. */
      const cubuk = document.querySelector('.bottom-nav');
      if (cubuk && gorunur(cubuk)) { const r = cubuk.getBoundingClientRect(); if (r.top < innerHeight) engel = Math.max(0, engel - Math.round(innerHeight - r.top)); }
      document.documentElement.style.setProperty('--kenar-engel', engel + 'px');
    }
    const iste = () => { if (!bekliyor) { bekliyor = true; requestAnimationFrame(olc); } };
    addEventListener('scroll', iste, { passive: true });
    addEventListener('resize', iste);
    rozet();
    olc();
  }

  /* Canlı kabuğun global öğeleri (9 Kasım): dil menüsü, Görüş Bildir, çerez bandı. Markup _src/kabuk/canli-ogeler.mjs.
     Prototipte sunucu yok: dil seçiminde sayfanın basılı "henüz yayımlanmadı" notu çıkar, Görüş Bildir yerel başarı ekranı
     gösterir (gönderilmez), çerez kararı tarayıcıda kalır. */
  function globalOgeler() {
    const DEP = 'dd-cerez-karar';
    const al = () => { try { return localStorage.getItem(DEP); } catch (e) { return null; } };
    const yaz = (v) => { try { if (v) localStorage.setItem(DEP, v); else localStorage.removeItem(DEP); } catch (e) { /* yok say */ } };
    const bant = document.getElementById('cookieBanner');
    if (bant) {
      /* Bant açılıp kapanınca yüzen düğmeler (--kenar-engel) yeniden ölçülür; geçiş bitince bir kez daha */
      /* T8: bant açıkken sayfa altına bandın kapladığı yükseklik kadar boşluk (canlıda sabit 140/370 px; 768'de son satırı örtüyordu) */
      const boyOlc = () => { const r = bant.getBoundingClientRect(); document.documentElement.style.setProperty('--cerez-boy', bant.classList.contains('show') ? Math.ceil(innerHeight - r.top + 12) + 'px' : '0px'); };
      if (window.ResizeObserver) new ResizeObserver(boyOlc).observe(bant);
      addEventListener('resize', boyOlc);
      const olcTetik = () => { boyOlc(); dispatchEvent(new Event('resize')); setTimeout(() => { boyOlc(); dispatchEvent(new Event('resize')); }, 450); };
      const goster = () => { bant.classList.add('show'); document.body.classList.add('cerez-acik'); olcTetik(); };
      const gizle = () => { bant.classList.remove('show'); document.body.classList.remove('cerez-acik'); olcTetik(); };
      if (!al()) goster();
      bant.addEventListener('click', (e) => {
        if (e.target.closest('[data-cookie-accept]')) { yaz('kabul'); gizle(); DD.toast('Çerez tercihin kaydedildi: tümü kabul.'); }
        else if (e.target.closest('[data-cookie-reject]')) { yaz('ret'); gizle(); DD.toast('Çerez tercihin kaydedildi: yalnız gerekli çerezler.'); }
      });
      document.addEventListener('click', (e) => { if (e.target.closest('[data-cerez-sifirla]')) { yaz(null); goster(); } });
    }
    /* Dil menüsü: canlı dil-menusu.js davranışı; TR dışı diller prototipte yayında değil, notu gösterilir */
    const kutular = [...document.querySelectorAll('.tb-lang, .drawer-lang')];
    const tetik = (k) => k.querySelector('.tb-lang-btn, .drawer-lang-toggle');
    const notSil = (k) => k.querySelectorAll('[data-dil-yok-not]').forEach((n) => n.remove());
    const kapat = (k) => { k.classList.remove('open'); notSil(k); tetik(k)?.setAttribute('aria-expanded', 'false'); };
    kutular.forEach((k) => {
      tetik(k)?.addEventListener('click', (e) => { e.stopPropagation(); const acik = k.classList.contains('open'); kutular.forEach(kapat); if (!acik) { k.classList.add('open'); tetik(k).setAttribute('aria-expanded', 'true'); } });
      k.addEventListener('click', (e) => {
        const s = e.target.closest('[data-lang]');
        if (!s) return;
        e.stopPropagation();
        if (s.dataset.lang === 'tr') { kapat(k); return; }
        notSil(k);
        const sablon = document.querySelector('template[data-dil-yok="' + s.dataset.lang + '"]');
        const liste = k.querySelector('.tb-lang-menu, .drawer-lang-list');
        if (sablon && liste) liste.appendChild(sablon.content.cloneNode(true));
      });
    });
    document.addEventListener('click', () => kutular.forEach((k) => k.classList.contains('open') && kapat(k)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') kutular.forEach(kapat); });
    /* Görüş Bildir */
    const sekme = document.getElementById('fbTab'), modal = document.getElementById('fbModal'), ortu = document.getElementById('fbOverlay');
    if (!sekme || !modal) return;
    const form = document.getElementById('fbForm'), basari = document.getElementById('fbSuccess'), hata = document.getElementById('fbError');
    const ac = () => { modal.classList.add('show'); ortu.classList.add('show'); modal.removeAttribute('inert'); modal.setAttribute('aria-hidden', 'false'); sekme.setAttribute('aria-expanded', 'true'); document.getElementById('fbPageUrl').value = location.pathname; setTimeout(() => modal.querySelector('.fb-topic.active')?.focus(), 50); };
    const kapa = () => { modal.classList.remove('show'); ortu.classList.remove('show'); modal.setAttribute('inert', ''); modal.setAttribute('aria-hidden', 'true'); sekme.setAttribute('aria-expanded', 'false'); sekme.focus(); };
    const konu = (t) => {
      modal.querySelectorAll('.fb-topic').forEach((b) => b.classList.toggle('active', b.dataset.topic === t));
      modal.querySelectorAll('.fb-fields').forEach((f) => { const on = f.dataset.for === t; f.classList.toggle('active', on); f.querySelectorAll('input,select,textarea,button').forEach((x) => { if (!x.hasAttribute('data-static-disabled')) x.disabled = !on; }); });
      document.getElementById('fbTopicValue').value = t; hata.hidden = true;
    };
    sekme.addEventListener('click', ac);
    sekme.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ac(); } });
    ortu.addEventListener('click', kapa);
    document.getElementById('fbClose').addEventListener('click', kapa);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('show')) kapa(); });
    modal.addEventListener('click', (e) => {
      const t = e.target.closest('.fb-topic'); if (t) { konu(t.dataset.topic); return; }
      const c = e.target.closest('.fb-chiprow .chip'); if (c) { c.parentElement.querySelectorAll('.chip').forEach((x) => x.classList.toggle('active', x === c)); document.getElementById('fbAreaValue').value = c.dataset.area; return; }
      const p = e.target.closest('.fb-emoji button'); if (p) { p.parentElement.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x === p)); document.getElementById('fbRatingValue').value = p.dataset.val; }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const gecersiz = [...form.querySelectorAll('input,select,textarea')].find((x) => !x.disabled && !x.checkValidity());
      const puanEksik = document.getElementById('fbTopicValue').value === 'puan' && !document.getElementById('fbRatingValue').value;
      if (gecersiz || puanEksik) { document.getElementById('fbErrorText').textContent = puanEksik ? 'Bir puan seç.' : gecersiz.type === 'checkbox' ? 'KVKK onayını işaretle.' : 'Zorunlu alanları doldur.'; hata.hidden = false; (gecersiz || form).focus?.(); return; }
      form.hidden = true; basari.hidden = false;
    });
    document.getElementById('fbAgain').addEventListener('click', () => { kapa(); form.reset(); form.hidden = false; basari.hidden = true; konu('oneri'); });
    konu('oneri');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { kur(); globalOgeler(); }); else { kur(); globalOgeler(); }
})();
