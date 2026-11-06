/* Destek Grupları: katılım ve paylaşım üye tarafında tutulur */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const { gruplar, kurallar } = JSON.parse($('#dgKatalog').textContent);
  const uyelik = () => U.yerel('grupUyelik', {});
  const akis = (s) => { const a = U.yerel('grupAkis', {}); a[s] = a[s] || []; return a[s]; };
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
      const l = akis(g.slug);
      U.bas('#dgDetay', bas + '<div class="msj-akis sohbet-akis">' + (l.map((m) => '<div class="sohbet-balon uye"><p>' + U.kac(m.metin) + '</p><span class="sohbet-kunye">' + U.kisaTarih(m.tarih) + '</span></div>').join('') || U.bos({ ikon: 'fa-comments', baslik: 'Akış boş', metin: 'İlk gönderiyi sen paylaş.' })) + '</div><form class="msj-yaz sohbet-yaz" id="dgYaz"><div class="sohbet-yaz-satir"><label class="yalniz-okuyucu" for="dgMetin">Gönderin</label><textarea id="dgMetin" rows="1" placeholder="Gruba yaz"></textarea><button class="sohbet-dugme-kucuk gonder" type="submit" aria-label="Paylaş"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button></div><p class="sohbet-ipucu"><button class="dugme hayalet kucuk" type="button" id="dgAyril">Gruptan ayrıl</button></p></form>');
      return;
    }
    U.bas('#dgDetay', bas + '<form class="kart-govde msj-akis" id="dgKatil"><p class="kart-metin">' + U.kac(g.aciklama) + '</p>' + (g.saglik ? '<div class="uyari-kutu"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>Bu grup sağlık durumunu belli edebilir; üyeliğin sağlık verisi sayılır. Takma adla katılmayı seçebilirsin.</span></div>' : '') + '<div class="ayar-liste"><label class="secim-satir ayar-satir" for="dgGercek"><span class="as-ikon" aria-hidden="true"><i class="fa-solid fa-user"></i></span><div class="as-metin"><b>Gerçek adımla</b><span>Grupta ' + U.kac(U.uye().ad) + ' olarak görünürsün.</span></div><input class="secim-radyo" type="radio" name="kip" id="dgGercek" value="gercek" checked></label><label class="secim-satir ayar-satir" for="dgTakma"><span class="as-ikon" aria-hidden="true"><i class="fa-solid fa-user-secret"></i></span><div class="as-metin"><b>Takma adla</b><span>Gerçek adın gizli kalır; yalnız seçtiğin takma ad görünür.</span></div><input class="secim-radyo" type="radio" name="kip" id="dgTakma" value="takma"></label></div><div class="alan"><label class="alan-etiket" for="dgTakmaAd">Takma ad</label><input class="alan-girdi" id="dgTakmaAd" minlength="3" maxlength="30" disabled></div><div class="alan"><span class="alan-etiket">Grup kuralları</span><ol class="madde-liste">' + kurallar.map((k) => '<li>' + U.kac(k) + '</li>').join('') + '</ol></div><label class="onay-kutusu"><input type="checkbox" id="dgOnay" required><span>Grup kurallarını okudum ve uyacağım.</span></label><div class="alan-gonder"><button class="dugme birincil" type="submit">Gruba katıl</button></div></form>');
  }
  const ciz = () => { liste(); detay(); };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-grup]');
    if (b) { secili = b.dataset.grup; ciz(); return; }
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
    if (e.target.id === 'dgKatil') {
      e.preventDefault();
      const takma = e.target.elements.kip.value === 'takma';
      uyelik()[secili] = { gorunen: takma ? $('#dgTakmaAd').value.trim() : U.uye().ad, tarih: U.bugun() };
      U.kaydet(); ciz();
      DD.toast('Gruba katıldın.');
    }
    if (e.target.id === 'dgYaz') {
      e.preventDefault();
      const m = $('#dgMetin'), metin = m.value.trim();
      if (!metin) return;
      akis(secili).push({ metin, tarih: U.bugun() });
      U.kaydet(); detay();
    }
  });
  ciz();
})();
