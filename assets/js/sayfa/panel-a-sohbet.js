/* Sohbet alanı: mesajlar ekranı ve danışan kartının Mesajlar sekmesi aynı parçayı kullanır.
   Karşı taraf cevap üretmez, okundu tiki yoktur. Dosyanın yalnız adı ve boyutu kaydedilir. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const boyut = (b) => (b >= 1048576 ? PA.sayi(b / 1048576) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');

  function balon(m) {
    const ben = m.kimden === 'diyetisyen';
    const ek = m.ek ? `<span class="sohbet-ek"><i class="fa-solid fa-paperclip" aria-hidden="true"></i><b>${h(m.ek.ad)}</b><small>${boyut(m.ek.boyut)}</small></span>` : '';
    return `<div class="sohbet-balon ${ben ? 'uye' : 'karsi'}">${m.metin && !(m.ek && m.metin === m.ek.ad) ? `<p>${h(m.metin)}</p>` : ''}${ek}<div class="sohbet-kunye">${m.zaman.slice(11, 16)}</div></div>`;
  }
  function akis(k) {
    let gun = '', s = '';
    k.mesajlar.forEach((m) => {
      const g = m.zaman.slice(0, 10);
      if (g !== gun) { gun = g; s += `<div class="sohbet-gun">${g === DD.bugun ? 'Bugün' : g === PA.ekle(DD.bugun, -1) ? 'Dün' : PA.tarih(g)}</div>`; }
      s += balon(m);
    });
    return s;
  }

  /* o: {geri: fn, kisayol: bool, gonderildi: fn} */
  PA.sohbet = function (kap, id, o = {}) {
    const dn = PA.danisan(id);
    const k = PA.konusma(id, false) || { mesajlar: [] };
    let ek = null;
    if (k.okunmamis) { k.okunmamis = 0; PA.kaydet(); }
    const i = PA.ilerleme(dn);
    const bas = o.kisayol === false ? '' : `<div class="sohbet-alan-bas"><div class="kisi-hucre">
<button class="ikon-dugme sohbet-alan-geri" type="button" data-sohbet="geri" aria-label="Konuşmalara dön"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>${PA.avatar(dn.ad)}<span class="kisi-bilgi"><span class="kisi-ad">${h(dn.ad)}</span><span class="kisi-alt">${(PA.durumlar[dn.durum] || [''])[0]}${i ? ' · ' + i.hafta + '. hafta' : ''}</span></span></div>
<div class="eylem-satiri"><button class="ikon-dugme" type="button" data-randevu-ac data-danisan="${dn.id}" aria-label="Randevu planla"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i></button><a class="ikon-dugme" href="${PA.yol.danisan(dn.id)}" aria-label="Danışan kartını aç"><i class="fa-solid fa-id-card" aria-hidden="true"></i></a></div></div>`;
    kap.innerHTML = `${bas}<div class="sohbet-akis" aria-live="polite"></div>
<form class="sohbet-yaz"><div class="sohbet-kunye" hidden></div><div class="sohbet-yaz-satir">
<input type="file" hidden aria-hidden="true" tabindex="-1">
<button class="sohbet-dugme-kucuk" type="button" data-sohbet="ek" aria-label="Dosya ekle"><i class="fa-solid fa-paperclip" aria-hidden="true"></i></button>
<textarea rows="1" placeholder="Mesaj yaz" aria-label="Mesaj yaz"></textarea>
<button class="sohbet-dugme-kucuk gonder" type="submit" aria-label="Gönder"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button></div></form>`;
    const akisEl = kap.querySelector('.sohbet-akis'), yazi = kap.querySelector('textarea'), dosya = kap.querySelector('input[type=file]'), kunye = kap.querySelector('.sohbet-kunye');
    const ciz = () => {
      const g = PA.konusma(id, false);
      akisEl.innerHTML = g && g.mesajlar.length ? akis(g) : '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-comment-dots" aria-hidden="true"></i></span><h3>Henüz mesaj yok</h3><p>İlk mesajı yazarak konuşmayı başlat.</p></div>';
      akisEl.scrollTop = akisEl.scrollHeight;
    };
    const ekCiz = () => {
      kunye.hidden = !ek;
      kunye.innerHTML = ek ? `<span class="rozet pasif"><i class="fa-solid fa-paperclip" aria-hidden="true"></i> ${h(ek.ad)} · ${boyut(ek.boyut)}</span><button class="ikon-dugme" type="button" data-sohbet="ek-sil" aria-label="Eki kaldır"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button><span>Prototipte dosyanın yalnız adı ve boyutu kaydedilir.</span>` : '';
    };
    const gonder = () => {
      const metin = yazi.value.trim();
      if (!metin && !ek) { DD.toast('Önce bir mesaj yaz.', 'uyari'); yazi.focus(); return; }
      PA.mesajYaz(id, metin, ek);
      PA.yanitlandi(id);
      ek = null; yazi.value = ''; dosya.value = '';
      PA.kaydet(); ekCiz(); ciz();
      if (o.gonderildi) o.gonderildi();
    };
    kap.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); gonder(); });
    yazi.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gonder(); } });
    dosya.addEventListener('change', () => { const f = dosya.files[0]; if (f) { ek = { ad: f.name, boyut: f.size }; ekCiz(); } });
    kap.onclick = (e) => {
      const b = e.target.closest('[data-sohbet]');
      if (!b) return;
      if (b.dataset.sohbet === 'ek') dosya.click();
      if (b.dataset.sohbet === 'ek-sil') { ek = null; dosya.value = ''; ekCiz(); }
      if (b.dataset.sohbet === 'geri' && o.geri) o.geri();
    };
    ciz();
    return { ciz };
  };
})();
