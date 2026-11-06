/* Arama: ?q= ile dizinde yerel arama. Türkçe küçültme, ad ve metin üstünde kelime eşleşmesi. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const V = JSON.parse($('aramaDizin').textContent);
  const kucult = (s) => String(s || '').toLocaleLowerCase('tr').normalize('NFC');
  const kac = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const ikon = (x) => '<i class="fa-solid ' + x + '" aria-hidden="true"></i>';
  const veri = window.DD_VERI || {};
  const dizin = V.dizin.concat(
    (veri.besinler ? veri.besinler.besinler : []).map((b) => ({ tur: 'besin', ad: b.ad, metin: DD.bicim.kcal(b.kcal) + ' / 100 g · ' + b.kategori, href: V.besinDetay, ikon: 'fa-leaf', etiket: 'Besin' })),
    (veri.tarifler ? veri.tarifler.tarifler : []).map((t) => ({ tur: 'tarif', ad: t.ad, metin: t.ozet, href: V.tarifDetay, gorsel: t.gorsel_dosya, etiket: 'Tarif' })));

  const q = (new URLSearchParams(location.search).get('q') || '').trim();
  $('aramaGirdi').value = q;
  if (!q) { $('aramaOzet').innerHTML = '<span class="arama-ipucu">Aramak için yukarıya yaz ya da popüler aramalardan birini seç.</span>'; return; }

  const kelimeler = kucult(q).split(/\s+/);
  const sonuc = dizin.map((k) => {
    const ad = kucult(k.ad), tum = ad + ' ' + kucult(k.metin);
    if (!kelimeler.every((w) => tum.includes(w))) return null;
    return { k, puan: (ad.startsWith(kelimeler[0]) ? 3 : 0) + (kelimeler.every((w) => ad.includes(w)) ? 2 : 0) };
  }).filter(Boolean).sort((a, b) => b.puan - a.puan).map((x) => x.k);

  function kart(k) {
    const ust = k.gorsel
      ? '<div class="sonuc-gorsel"><img src="' + DD.kok + 'assets/img/icerik/' + k.gorsel + '" alt="" loading="lazy"><span class="sonuc-rozet">' + kac(k.etiket) + '</span></div>'
      : '<div class="sonuc-yuzey">' + (k.harf ? '<span class="kisi-avatar buyuk" aria-hidden="true">' + kac(k.harf) + '</span>' : ikon(k.ikon)) + '<span class="sonuc-rozet">' + kac(k.etiket) + '</span></div>';
    return '<a class="sonuc-kart" href="' + DD.kok + k.href + '">' + ust + '<div class="sonuc-govde"><h3 class="kart-baslik">' + kac(k.ad) + '</h3><p>' + kac(k.metin) + '</p><span class="sonuc-git">Aç ' + ikon('fa-arrow-right') + '</span></div></a>';
  }
  function ciz(tur) {
    const l = tur === 'tumu' ? sonuc : sonuc.filter((k) => k.tur === tur);
    $('aramaIzgara').innerHTML = l.slice(0, 24).map(kart).join('');
    $('aramaIzgara').hidden = !l.length;
    $('aramaBos').hidden = !!l.length;
    $('aramaNot').innerHTML = l.length ? '<b>' + l.length + '</b> sonuç' + (l.length > 24 ? ', ilk 24 tanesi gösteriliyor' : '') : '';
  }

  $('aramaPop').hidden = true;
  $('aramaSekme').hidden = false;
  $('aramaSonuc').hidden = false;
  $('aramaBaslik').innerHTML = '“<span class="vurgu">' + kac(q) + '</span>” sonuçları';
  $('aramaOzet').innerHTML = '<b>' + sonuc.length + '</b> sonuç bulundu';
  document.title = q + ' · Arama · Dada Diet';
  document.querySelectorAll('[data-sayi]').forEach((s) => { const t = s.dataset.sayi; s.textContent = t === 'tumu' ? sonuc.length : sonuc.filter((k) => k.tur === t).length; });
  document.querySelector('#aramaSekme .sekmeler').addEventListener('dd:sekme', (e) => ciz(document.getElementById(e.detail.id) ? document.getElementById(e.detail.id).dataset.tur : document.querySelector('#aramaSekme .sekme.aktif').dataset.tur));
  ciz('tumu');
})();
