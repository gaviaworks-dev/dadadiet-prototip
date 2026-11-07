/* Diyetisyen profili. Ece Tunalı alanları demo durumundan okunur; panelde yapılan değişiklik burada görünür. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const kac = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const ikon = (x) => '<i class="fa-solid ' + x + '" aria-hidden="true"></i>';
  const tl = (n) => DD.bicim.para(n);
  const ilkBuyuk = (s) => { const m = String(s == null ? '' : s); return m.charAt(0).toLocaleUpperCase('tr') + m.slice(1); };

  document.addEventListener('click', (e) => {
    const p = e.target.closest('[data-paylas]');
    if (p) {
      const yaz = navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject();
      yaz.then(() => DD.toast('Profil bağlantısı kopyalandı.'), () => DD.toast('Bağlantı kopyalanamadı.', 'uyari'));
    }
    const g = e.target.closest('[data-sekme-git]');
    if (g) { e.preventDefault(); const t = $(g.dataset.sekmeGit); t.click(); t.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    /* Misafir üye alanına düşmez: Mesaj, Paketi seç ve Randevuyu tamamla girişe gider */
    const uye = e.target.closest('.page-main a[href*="hesabim/"]');
    if (uye && !DD.oturum.acik()) { e.preventDefault(); location.href = DD.kok + 'giris/'; return; }
    if (DD.oturum.acik() && e.target.closest('[data-randevu],[data-mesaj]')) {
      e.preventDefault();
      DD.toast(e.target.closest('[data-randevu]') ? 'Bu hafta açık saat yok. Uzmanın takvimi açıldığında bildirim alırsın.' : 'Mesajlaşma, uzmanla bir görüşme başlattığında açılır.', 'uyari');
    }
  });

  /* Dar ekranda kayan şerit: seçilen sekme görünür alana gelir */
  document.addEventListener('dd:sekme', (e) => {
    const ray = e.target, t = $(e.detail.id);
    if (!t || ray.scrollWidth <= ray.clientWidth) return;
    const a = ray.getBoundingClientRect(), b = t.getBoundingClientRect();
    ray.scrollBy({ left: b.left - a.left - (a.width - b.width) / 2, behavior: 'smooth' });
  });

  if (!$('paketler')) return;
  const d = DD.demo.al(), dyt = d.diyetisyen, P = dyt.profil || {};

  /* Panelde değişen alanlar: derleme değerinin üstüne yazılır */
  const yaz = (ad, v) => document.querySelectorAll('[data-alan="' + ad + '"]').forEach((e) => { e.textContent = v; });
  yaz('deneyim', dyt.deneyim_yil + ' yıl');
  yaz('sehir', dyt.sehir);
  yaz('gorusme', dyt.online && dyt.yuz_yuze ? 'Online ve yüz yüze' : dyt.online ? 'Online' : 'Yüz yüze');
  yaz('uzmanlik1', (dyt.uzmanlik || [])[0] || '');
  $('eceAlan').innerHTML = (dyt.uzmanlik || []).map((u) => '<span class="rozet olumlu">' + kac(u) + '</span>').join('');
  if (P.foto) { const a = $('profilAvatar'); a.textContent = ''; a.classList.remove('harf'); a.style.backgroundImage = 'url("' + P.foto + '")'; }
  if (P.kapak) $('profilKapak').style.backgroundImage = 'url("' + P.kapak + '")';

  /* Yayın durumu: onaylı değilse ziyaretçi profili görmez; ?onizleme=1 durumdan bağımsız açar */
  const onizleme = new URLSearchParams(location.search).get('onizleme') === '1';
  const yayinda = (dyt.onay_durumu || 'onayli') === 'onayli';
  $('onizlemeSerit').hidden = !onizleme;
  if (!yayinda && !onizleme) { $('profilKapali').hidden = false; $('profilGovde').hidden = true; $('profilEylem').hidden = true; }

  $('eceKisa').textContent = P.kisa || 'Kilo yönetimi ve sporcu beslenmesinde, yaşam tarzına uyan sürdürülebilir planlar hazırlıyorum.';
  $('eceBaslik').querySelector('span').textContent = P.baslik || 'Sürdürülebilir kilo yönetimi ve sporcu beslenmesi';
  const metin = P.metin || 'Dört yıldır kilo yönetimi, insülin direnci ve sporcu beslenmesi üzerine çalışıyorum. Danışanlarımla klinikte ve online görüşüyorum. Amacım kısa süreli bir diyet değil, günlük hayatına uyan ve uzun vadede sürdürebileceğin bir beslenme düzeni kurmak.\n\nİlk görüşmede alışkanlıklarını, hedefini ve günlük ritmini birlikte konuşuyoruz. Planı buna göre kuruyor, iki haftada bir gözden geçirip ihtiyacın olan yerde güncelliyoruz.';
  $('eceMetin').innerHTML = metin.split(/\n{2,}/).map((p) => '<p>' + kac(p) + '</p>').join('');

  const paket = d.paketler.filter((p) => p.aktif);
  $('paketSayi').textContent = paket.length;
  $('paketler').innerHTML = paket.map((p) => '<div class="kart"><div class="kart-bas"><h3 class="kart-baslik">' + ikon('fa-box-open') + ' ' + kac(p.ad) + '</h3><span class="rozet pasif">' + kac(ilkBuyuk(p.tur)) + '</span></div><div class="kart-govde"><p class="sonuc-sayi kucuk">' + tl(p.fiyat) + '</p><p class="kart-metin">' + kac(p.aciklama) + '</p><ul class="uzman-meta">' + '<li>' + ikon('fa-comments') + ' ' + p.seans + ' seans</li><li>' + ikon('fa-clock') + ' ' + p.sure + ' dk görüşme</li></ul></div><div class="kart-alt"><a class="dugme birincil tam-en" href="' + DD.kok + 'hesabim/odeme/?paket=' + encodeURIComponent(p.id) + '">Paketi seç</a></div></div>').join('');

  /* Yaklaşan günler: haftalık müsaitlik + kapalı tarih + dolu randevular. Dolu saat üstü çizili kalır. */
  const GUN = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const GUN_UZUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const m = d.musaitlik, dolu = new Set(d.randevular.map((r) => r.tarih + ' ' + r.saat));
  const dk = (s) => { const [a, b] = s.split(':'); return +a * 60 + +b; };
  const saat = (n) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
  const bugun = new Date(DD.bugun + 'T12:00:00');
  const iso = (t) => t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');

  function slotCiz(tur) {
    const adim = m.slot[tur] || 30;
    let html = '';
    for (let i = 1, gosterilen = 0; i <= 10 && gosterilen < 4; i++) {
      const t = new Date(bugun); t.setDate(t.getDate() + i);
      const g = m.haftalik.find((x) => x.gun === GUN_UZUN[t.getDay()]);
      if (!g || !g.acik || m.kapali_tarihler.some((k) => k.tarih === iso(t))) continue;
      const l = [];
      for (let n = dk(g.baslangic); n + adim <= dk(g.bitis); n += adim) {
        if (g.ara && n + adim > dk(g.ara[0]) && n < dk(g.ara[1])) continue;
        l.push(saat(n));
      }
      if (!l.length) continue;
      gosterilen++;
      const ad = (i === 1 ? 'Yarın, ' : '') + GUN[t.getDay()] + ', ' + DD.bicim.tarih(iso(t));
      html += '<p class="gun-baslik">' + ad + '</p><div class="saat-izgara">' + l.slice(0, 10).map((s) => { const k = dolu.has(iso(t) + ' ' + s); return '<button class="cip" type="button" aria-pressed="false"' + (k ? ' disabled aria-label="' + DD.bicim.saat(s) + ' dolu"' : '') + ' data-deger="' + iso(t) + ' ' + s + '" data-etiket="' + ad + ', ' + DD.bicim.saat(s) + '">' + DD.bicim.saat(s) + '</button>'; }).join('') + '</div>';
    }
    $('slotlar').innerHTML = html;
    $('slotNot').textContent = 'Bir saat seçilmedi.';
    $('slotDevam').href = DD.kok + 'hesabim/diyetisyenim/#randevu';
  }
  $('slotTur').addEventListener('dd:secim', (e) => slotCiz(e.detail.deger));
  slotCiz('online');
  $('slotlar').addEventListener('click', (e) => {
    const b = e.target.closest('.cip');
    if (!b || b.disabled) return;
    $('slotlar').querySelectorAll('.cip').forEach((c) => { const a = c === b; c.classList.toggle('aktif', a); c.setAttribute('aria-pressed', String(a)); });
    $('slotNot').textContent = b.dataset.etiket + ' seçildi.';
    const [tarih, sa] = b.dataset.deger.split(' ');
    $('slotDevam').href = DD.kok + 'hesabim/diyetisyenim/?tarih=' + tarih + '&saat=' + encodeURIComponent(sa) + '#randevu';
  });
})();
