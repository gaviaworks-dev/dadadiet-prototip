/* Destek Grupları: katılım ve paylaşım üye tarafında tutulur */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const { gruplar, kurallar } = JSON.parse($('#dgKatalog').textContent);
  const uyelik = () => U.yerel('grupUyelik', {});
  const akis = (s) => { const a = U.yerel('grupAkis', {}); a[s] = a[s] || []; return a[s]; };
  /* Gönderi: { id, kim: 'ben' | 'moderator', metin, tarih, begendim, yorumlar: [{ metin, tarih }], sikayet }.
     Beğeni kişi başına tek (yalnız senin beğenin sayılır, başka sayı uydurulmaz). Moderatörün karşılama gönderisi prototip örneğidir */
  const KARSILAMA = (g) => ({ id: 'mod-' + g.slug, kim: 'moderator', metin: 'Hoş geldin! Bu grupta ' + g.ad + ' deneyimlerini paylaşıyoruz. Lütfen kuralları oku; tanı ve ilaç kararlarını hekiminle ver. Kurala aykırı bir gönderi görürsen “Şikâyet et” ile bize ilet.', tarih: '2026-10-31', ornek: true, yorumlar: [] });
  const gonderiler = (g) => {
    const l = akis(g.slug);
    l.forEach((m, i) => { if (!m.id) { m.id = g.slug + '-' + i + '-' + m.tarih; m.kim = 'ben'; m.yorumlar = m.yorumlar || []; } });
    const s = U.yerel('grupSistem', {});
    return [s[g.slug] || (s[g.slug] = KARSILAMA(g))].concat(l);
  };
  const bul = (g, id) => gonderiler(g).find((m) => m.id === id);
  const acikYorum = {};
  const saglikKilit = (g) => g.saglik && !U.rizaVar('grup');
  function gonderiHtml(g, m, u) {
    const ben = m.kim === 'ben', ac = acikYorum[m.id], y = m.yorumlar || [];
    const kim = ben ? U.kac(u.gorunen) + ' (sen)' : 'Dada Diet moderatörü';
    return '<div class="sohbet-balon ' + (ben ? 'uye' : 'karsi') + '"><p>' + U.kac(m.metin) + '</p><span class="sohbet-kunye">' + kim + ' · ' + U.kisaTarih(m.tarih) + (m.ornek ? ' · prototip örneği' : '') + '</span></div>'
      + '<div class="cipler"><button class="cip' + (m.begendim ? ' aktif' : '') + '" type="button" data-begen="' + m.id + '" aria-pressed="' + !!m.begendim + '" aria-label="Beğen, ' + (m.begendim ? 1 : 0) + ' beğeni"><i class="fa-solid fa-heart" aria-hidden="true"></i> ' + (m.begendim ? 1 : 0) + '</button><button class="cip' + (ac ? ' aktif' : '') + '" type="button" data-yorum-ac="' + m.id + '" aria-expanded="' + !!ac + '"><i class="fa-solid fa-comment" aria-hidden="true"></i> Yorumlar ' + y.length + '</button>' + (ben ? '' : m.sikayet ? U.durum('bekleyen', 'Şikâyetin incelemede') : '<button class="cip" type="button" data-sikayet="' + m.id + '"><i class="fa-solid fa-flag" aria-hidden="true"></i> Şikâyet et</button>') + '</div>'
      + (ac ? y.map((x) => '<div class="sohbet-balon sistem"><p><b>' + U.kac(u.gorunen) + ':</b> ' + U.kac(x.metin) + '</p></div>').join('') + '<form class="sohbet-yaz" data-yorum-form="' + m.id + '"><div class="sohbet-yaz-satir"><label class="yalniz-okuyucu" for="dgYorum-' + m.id + '">Yorumun</label><textarea id="dgYorum-' + m.id + '" rows="1" maxlength="1000" placeholder="Yorum yaz"' + (saglikKilit(g) ? ' disabled' : '') + '></textarea><button class="sohbet-dugme-kucuk gonder" type="submit" aria-label="Yorumu gönder"' + (saglikKilit(g) ? ' disabled' : '') + '><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button></div></form>' : '');
  }
  let sikayetId = null;
  let secili = gruplar[0].slug;

  function liste() {
    const n = Object.keys(uyelik()).length;
    $('#dgSayi').textContent = gruplar.length + ' grup · ' + n + ' üyeliğin';
    U.bas('#dgListe', gruplar.map((g) => '<button class="sohbet-kisi' + (g.slug === secili ? ' secili' : '') + '" type="button" data-grup="' + g.slug + '"><span class="sohbet-mono ' + (uyelik()[g.slug] ? 'ok' : 'wait') + '">' + g.mono + '</span><span class="sohbet-kisi-txt"><b>' + U.kac(g.ad) + '</b><small>' + (uyelik()[g.slug] ? 'Üyesin' : 'Üye değilsin') + (g.saglik ? ' · Sağlık grubu' : '') + '</small></span></button>').join(''));
  }
  function detay() {
    const g = gruplar.find((x) => x.slug === secili);
    const u = uyelik()[g.slug];
    const bas = '<div class="msj-kart-bas sohbet-bas"><span class="sohbet-mono buyuk ' + (u ? 'ok' : 'wait') + '">' + g.mono + '</span><div class="sohbet-bas-kimlik"><h2>' + U.kac(g.ad) + '</h2><p class="sohbet-bas-alt">' + (u ? 'Grupta ' + U.kac(u.gorunen) + ' olarak görünüyorsun' : 'Üye değilsin') + '</p></div></div>';
    if (u) {
      const l = gonderiler(g), kilit = saglikKilit(g);
      U.bas('#dgDetay', bas + '<div class="msj-akis sohbet-akis">' + l.map((m) => gonderiHtml(g, m, u)).join('') + (kilit ? '<div class="sohbet-balon sistem"><p>Sağlık grupları için açık rızanı geri aldın; rızan olmadan yeni gönderi ve yorum yapılmaz. <a href="' + DD.kok + 'hesabim/veri-izinlerim/#riza">Rızalarımı yönet</a></p></div>' : '') + '</div><form class="msj-yaz sohbet-yaz" id="dgYaz"><div class="sohbet-yaz-satir"><label class="yalniz-okuyucu" for="dgMetin">Gönderin</label><textarea id="dgMetin" rows="1" placeholder="Gruba yaz"' + (kilit ? ' disabled' : '') + '></textarea><button class="sohbet-dugme-kucuk gonder" type="submit" aria-label="Paylaş"' + (kilit ? ' disabled' : '') + '><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button></div><p class="sohbet-ipucu"><button class="dugme hayalet kucuk" type="button" id="dgAyril">Gruptan ayrıl</button></p></form>');
      return;
    }
    U.bas('#dgDetay', bas + '<form class="kart-govde msj-akis" id="dgKatil"><p class="kart-metin">' + U.kac(g.aciklama) + '</p>' + (g.saglik ? '<div class="uyari-kutu"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>Bu grup sağlık durumunu belli edebilir; üyeliğin sağlık verisi sayılır. Takma adla katılmayı seçebilirsin.</span></div>' : '') + '<div class="ayar-liste"><label class="secim-satir ayar-satir" for="dgGercek"><span class="as-ikon" aria-hidden="true"><i class="fa-solid fa-user"></i></span><div class="as-metin"><b>Gerçek adımla</b><span>Grupta ' + U.kac(U.uye().ad) + ' olarak görünürsün.</span></div><input class="secim-radyo" type="radio" name="kip" id="dgGercek" value="gercek" checked></label><label class="secim-satir ayar-satir" for="dgTakma"><span class="as-ikon" aria-hidden="true"><i class="fa-solid fa-user-secret"></i></span><div class="as-metin"><b>Takma adla</b><span>Gerçek adın gizli kalır; yalnız seçtiğin takma ad görünür.</span></div><input class="secim-radyo" type="radio" name="kip" id="dgTakma" value="takma"></label></div><div class="alan"><label class="alan-etiket" for="dgTakmaAd">Takma ad</label><input class="alan-girdi" id="dgTakmaAd" minlength="3" maxlength="30" disabled></div><div class="alan"><span class="alan-etiket">Grup kuralları</span><ol class="madde-liste">' + kurallar.map((k) => '<li>' + U.kac(k) + '</li>').join('') + '</ol></div><label class="onay-kutusu"><input type="checkbox" id="dgOnay" required><span>Grup kurallarını okudum ve uyacağım.</span></label>' + (saglikKilit(g) ? U.rizaKutu('grup') : '') + '<div class="alan-gonder"><button class="dugme birincil" type="submit">Gruba katıl</button></div></form>');
  }
  const ciz = () => { liste(); detay(); };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-grup]');
    if (b) { secili = b.dataset.grup; ciz(); return; }
    const g = gruplar.find((x) => x.slug === secili);
    const bg = e.target.closest('[data-begen]');
    if (bg) { const m = bul(g, bg.dataset.begen); m.begendim = !m.begendim; U.kaydet(); detay(); return; }
    const ya = e.target.closest('[data-yorum-ac]');
    if (ya) { acikYorum[ya.dataset.yorumAc] = !acikYorum[ya.dataset.yorumAc]; detay(); const t = document.getElementById('dgYorum-' + ya.dataset.yorumAc); if (t && !t.disabled) t.focus(); return; }
    const sk = e.target.closest('[data-sikayet]');
    if (sk) { sikayetId = sk.dataset.sikayet; const m = bul(g, sikayetId); $('#dgSikayetOzet').textContent = '“' + (m.metin.length > 90 ? m.metin.slice(0, 89) + '…' : m.metin) + '”'; $('#dgSikayetForm').reset(); DD.ac('#dgSikayet'); return; }
    if (e.target.closest('#dgAyril')) {
      delete uyelik()[secili];
      U.kaydet(); ciz();
      DD.toast('Gruptan ayrıldın.', 'uyari');
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.name === 'kip') { const t = $('#dgTakmaAd'); t.disabled = e.target.value !== 'takma'; t.required = !t.disabled; if (!t.disabled) t.focus(); }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'dgSikayetForm') {
      e.preventDefault();
      const m = bul(gruplar.find((x) => x.slug === secili), sikayetId), n = e.target.elements.neden.value;
      if (!n) { DD.toast('Bir şikâyet nedeni seç.', 'hata'); return; }
      m.sikayet = { neden: n, not: $('#dgSikayetNot').value.trim(), tarih: U.bugun() };
      U.kaydet(); DD.kapat($('#dgSikayet')); detay();
      DD.toast('Şikâyetin moderasyona iletildi (prototipte gönderilmez).');
      return;
    }
    const yf = e.target.closest('[data-yorum-form]');
    if (yf) {
      e.preventDefault();
      const t = yf.querySelector('textarea'), metin = t.value.trim();
      if (!metin) return;
      const m = bul(gruplar.find((x) => x.slug === secili), yf.dataset.yorumForm);
      (m.yorumlar = m.yorumlar || []).push({ metin, tarih: U.bugun() });
      U.kaydet(); detay();
      return;
    }
    if (e.target.id === 'dgKatil') {
      e.preventDefault();
      const rk = e.target.querySelector('[data-riza-onay]');
      if (rk && !rk.checked) { DD.toast('Sağlık grubuna katılmak için açık rıza kutusunu işaretle.', 'hata'); return; }
      if (rk) U.rizaVer('grup', true);
      const takma = e.target.elements.kip.value === 'takma';
      uyelik()[secili] = { gorunen: takma ? $('#dgTakmaAd').value.trim() : U.uye().ad, tarih: U.bugun() };
      U.kaydet(); ciz();
      DD.toast('Gruba katıldın.');
    }
    if (e.target.id === 'dgYaz') {
      e.preventDefault();
      const m = $('#dgMetin'), metin = m.value.trim();
      if (!metin || saglikKilit(gruplar.find((x) => x.slug === secili))) return;
      akis(secili).push({ id: secili + '-' + Date.now(), kim: 'ben', metin, tarih: U.bugun(), yorumlar: [] });
      U.kaydet(); detay();
    }
  });
  ciz();
})();
