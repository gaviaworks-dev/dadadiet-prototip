/* Mesajlar: konuşma listesi ve sohbet alanı. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const $ = (id) => document.getElementById(id);
  const v = { secili: null, suzgec: 'tumu' };
  const son = (k) => k.mesajlar[k.mesajlar.length - 1];

  function liste() {
    const q = $('konusmaAra').value.trim().toLocaleLowerCase('tr');
    const l = PA.d().mesajlar.filter((k) => k.mesajlar.length)
      .filter((k) => PA.danisan(k.danisan_id).ad.toLocaleLowerCase('tr').includes(q) || son(k).metin.toLocaleLowerCase('tr').includes(q))
      .filter((k) => v.suzgec === 'tumu' || k.okunmamis)
      .sort((a, b) => son(b).zaman.localeCompare(son(a).zaman));
    $('konusmaListe').innerHTML = l.length ? l.map((k) => {
      const dn = PA.danisan(k.danisan_id), m = son(k);
      return `<button class="sohbet-liste-kalem${k.okunmamis ? ' okunmamis' : ''}${dn.id === v.secili ? ' secili' : ''}" type="button" data-konusma="${dn.id}">${PA.avatar(dn.ad)}<span class="sohbet-liste-metin"><b>${h(dn.ad)}</b><span>${m.kimden === 'diyetisyen' ? 'Sen: ' : ''}${h(m.metin || (m.ek ? m.ek.ad : ''))}</span></span><span class="sohbet-liste-yan">${PA.zaman(m.zaman)}${k.okunmamis ? `<span class="sohbet-liste-sayi" aria-label="${k.okunmamis} okunmamış">${k.okunmamis}</span>` : ''}</span></button>`;
    }).join('') : '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-comment-slash" aria-hidden="true"></i></span><h3>Konuşma bulunamadı</h3><p>Aramayı değiştir ya da yeni mesaj başlat.</p></div>';
    const n = PA.okunmamis();
    $('mesajOzet').textContent = n ? n + ' okunmamış mesajın var.' : 'Bütün mesajlar okundu.';
  }
  function sec(id, mobilGec) {
    v.secili = id;
    PA.sohbet($('sohbetAlan'), id, { geri: () => { $('sohbetDuzen').dataset.gorunum = 'liste'; }, gonderildi: liste });
    if (mobilGec) $('sohbetDuzen').dataset.gorunum = 'sohbet';
    const u = new URL(location.href);
    u.searchParams.set('danisan', id);
    history.replaceState(null, '', u);
    liste();
  }
  function bosAlan() {
    $('sohbetAlan').innerHTML = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-comments" aria-hidden="true"></i></span><h3>Bir konuşma seç</h3><p>Soldaki listeden bir danışan seç ya da yeni mesaj başlat.</p></div>';
  }

  $('ymDanisan').innerHTML = '<option value="">Danışan seç</option>' + PA.danisanlar().map((x) => `<option value="${x.id}">${h(x.ad)}</option>`).join('');
  $('konusmaAra').addEventListener('input', liste);
  $('konusmaSuzgec').addEventListener('dd:secim', (e) => { v.suzgec = e.detail.deger; liste(); });
  $('konusmaListe').addEventListener('click', (e) => { const b = e.target.closest('[data-konusma]'); if (b) sec(b.dataset.konusma, true); });
  $('yeniMesajForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!PA.formGecerli(e.target)) return;
    const id = $('ymDanisan').value;
    PA.mesajYaz(id, $('ymMetin').value.trim());
    PA.yanitlandi(id);
    PA.kaydet(); e.target.reset(); DD.kapat($('yeniMesaj'));
    sec(id, true);
    DD.toast('Mesaj gönderildi.');
  });
  document.addEventListener('pa:degisti', () => { if (v.secili) sec(v.secili, false); });

  const adres = PA.parametre('danisan');
  const adresDn = adres && PA.danisan(adres);
  bosAlan();
  if (adresDn) sec(adresDn.id, true);
  else {
    if (window.matchMedia('(min-width:901px)').matches) {
      /* Açılışta okunmamış konuşma kendiliğinden okundu sayılmasın: en yeni okunmuş konuşma açılır */
      const ilk = PA.d().mesajlar.filter((k) => k.mesajlar.length && !k.okunmamis).sort((a, b) => son(b).zaman.localeCompare(son(a).zaman))[0];
      if (ilk) { v.secili = ilk.danisan_id; PA.sohbet($('sohbetAlan'), ilk.danisan_id, { geri: () => { $('sohbetDuzen').dataset.gorunum = 'liste'; }, gonderildi: liste }); }
    }
    liste();
  }
  if (PA.parametre('sekme') === 'yeni') DD.ac('#yeniMesaj');
})();
