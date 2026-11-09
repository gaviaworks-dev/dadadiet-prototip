/* Arama: ?q= ile dizinde yerel arama. Türkçe küçültme, ad ve metin üstünde kelime eşleşmesi. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const V = JSON.parse($('aramaDizin').textContent);
  const kucult = (s) => String(s || '').toLocaleLowerCase('tr').normalize('NFC');
  const kac = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
  const ikon = (x) => '<i class="fa-solid ' + x + '" aria-hidden="true"></i>';
  const veri = window.DD_VERI || {};
  /* Oturum açık üyede adı tercihe aykırı program sonuçlara girmez, kalanın tanıtım cümlesi uyarlanır */
  const TU = DD.tercihUyum;
  const aykiri = (k) => k.tur === 'program' && !TU.programUygunMu(k);
  const gizli = V.dizin.filter(aykiri);
  const dizin = V.dizin.filter((k) => !aykiri(k)).map((k) => (k.tur === 'program' ? { ...k, metin: TU.aciklama(k.metin, k) } : k)).concat(
    (veri.besinler ? veri.besinler.besinler : []).map((b) => ({ tur: 'besin', ad: b.ad, metin: DD.bicim.kcal(b.kcal) + ' / 100 g · ' + b.kategori, href: V.besinDetay, ikon: 'fa-leaf', etiket: 'Besin' })),
    (veri.tarifler ? veri.tarifler.tarifler : []).map((t) => ({ tur: 'tarif', ad: t.ad, metin: t.ozet, href: V.tarifDetay + t.slug + '/', gorsel: t.gorsel_dosya, etiket: 'Tarif' })));

  const eslesen = (sorgu) => {
    const kelimeler = kucult(sorgu).split(/\s+/).filter(Boolean);
    return dizin.map((k) => {
      const ad = kucult(k.ad), tum = ad + ' ' + kucult(k.metin);
      if (!kelimeler.length || !kelimeler.every((w) => tum.includes(w))) return null;
      return { k, puan: (ad.startsWith(kelimeler[0]) ? 3 : 0) + (kelimeler.every((w) => ad.includes(w)) ? 2 : 0) };
    }).filter(Boolean).sort((a, b) => b.puan - a.puan).map((x) => x.k);
  };

  /* Son aramalar: yalnız bu tarayıcıda, en çok 5 terim */
  const SON = 'dd-son-aramalar';
  const sonOku = () => { try { const l = JSON.parse(localStorage.getItem(SON)); return Array.isArray(l) ? l.slice(0, 5) : []; } catch (e) { return []; } };
  const sonYaz = (l) => { try { if (l.length) localStorage.setItem(SON, JSON.stringify(l.slice(0, 5))); else localStorage.removeItem(SON); } catch (e) { /* gizli pencere */ } };
  const aramaYolu = (t) => DD.kok + 'arama/?q=' + encodeURIComponent(t);
  function sonCiz() {
    const l = sonOku();
    $('sonAramaKap').hidden = !l.length;
    $('sonArama').innerHTML = l.map((t) => '<a class="son-arama-satir" href="' + aramaYolu(t) + '">' + ikon('fa-clock-rotate-left') + '<span class="terim">' + kac(t) + '</span>' + ikon('fa-arrow-right ok') + '</a>').join('');
  }
  $('sonAramaTemizle').addEventListener('click', () => { sonYaz([]); sonCiz(); kutu.classList.remove('oneri-acik'); DD.toast('Son aramaların temizlendi.'); });

  /* Yazarken öneri: dizinden ilk 6 eşleşme; boş kutuda son aramalar */
  const kutu = $('aramaForm'), girdi = $('aramaGirdi'), oneri = $('aramaOneri');
  let etkin = -1;
  const isaretle = (ad, sorgu) => { const i = kucult(ad).indexOf(kucult(sorgu)); return i < 0 || !sorgu ? kac(ad) : kac(ad.slice(0, i)) + '<mark>' + kac(ad.slice(i, i + sorgu.length)) + '</mark>' + kac(ad.slice(i + sorgu.length)); };
  function oneriCiz() {
    const v = girdi.value.trim();
    let html = '';
    if (v.length >= 2) {
      const l = eslesen(v).slice(0, 6);
      if (l.length) html = '<div class="oneri-grup">' + ikon('fa-magnifying-glass') + ' Öneriler</div>' + l.map((k) => '<a class="oneri-kalem" role="option" href="' + DD.kok + k.href + '"><span class="oneri-ikon">' + ikon(k.harf ? 'fa-user-doctor' : k.ikon || (k.tur === 'program' ? 'fa-list-check' : k.tur === 'rehber' ? 'fa-book-open' : 'fa-leaf')) + '</span><span class="oneri-govde"><span class="oneri-baslik">' + isaretle(k.ad, v) + '</span><span class="oneri-alt">' + kac(k.etiket) + '</span></span></a>').join('')
        + '<a class="oneri-kalem" role="option" href="' + aramaYolu(v) + '"><span class="oneri-ikon">' + ikon('fa-arrow-right') + '</span><span class="oneri-govde"><span class="oneri-baslik">“' + kac(v) + '” için tüm sonuçlar</span></span></a>';
    } else if (!v) {
      const l = sonOku();
      if (l.length) html = '<div class="oneri-grup">' + ikon('fa-clock-rotate-left') + ' Son aramaların</div>' + l.map((t) => '<a class="oneri-kalem" role="option" href="' + aramaYolu(t) + '"><span class="oneri-ikon">' + ikon('fa-clock-rotate-left') + '</span><span class="oneri-govde"><span class="oneri-baslik">' + kac(t) + '</span></span></a>').join('');
    }
    oneri.innerHTML = html; etkin = -1;
    kutu.classList.toggle('oneri-acik', !!html);
    girdi.setAttribute('aria-expanded', String(!!html));
  }
  girdi.addEventListener('input', oneriCiz);
  girdi.addEventListener('focus', oneriCiz);
  girdi.addEventListener('keydown', (e) => {
    const l = [...oneri.querySelectorAll('.oneri-kalem')];
    if (e.key === 'Escape') { kutu.classList.remove('oneri-acik'); girdi.setAttribute('aria-expanded', 'false'); return; }
    if (!l.length || !kutu.classList.contains('oneri-acik')) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      /* -1 hiçbiri: ok tuşları kalemler ile "hiçbiri" arasında döner */
      const n = l.length, yer = ((etkin < 0 ? n : etkin) + (e.key === 'ArrowDown' ? 1 : -1) + n + 1) % (n + 1);
      etkin = yer === n ? -1 : yer;
      l.forEach((a, i) => { a.classList.toggle('etkin', i === etkin); a.setAttribute('aria-selected', String(i === etkin)); });
    } else if (e.key === 'Enter' && etkin >= 0) { e.preventDefault(); location.href = l[etkin].href; }
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('#aramaForm')) { kutu.classList.remove('oneri-acik'); girdi.setAttribute('aria-expanded', 'false'); } });

  const q = (new URLSearchParams(location.search).get('q') || '').trim();
  girdi.value = q;
  if (q) sonYaz([q].concat(sonOku().filter((t) => kucult(t) !== kucult(q))));
  sonCiz();
  if (!q) { $('aramaOzet').innerHTML = '<span class="arama-ipucu">Aramak için yukarıya yaz ya da popüler aramalardan birini seç.</span>'; return; }

  const kelimeler = kucult(q).split(/\s+/);
  const gizlenen = gizli.filter((k) => kelimeler.every((w) => (kucult(k.ad) + ' ' + kucult(k.metin)).includes(w))).length;
  const sonuc = eslesen(q);

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
    const uyum = gizlenen && (tur === 'tumu' || tur === 'program') ? gizlenen + ' program tercihinle örtüşmediği için gösterilmiyor.' : '';
    $('aramaNot').innerHTML = [l.length ? '<b>' + l.length + '</b> sonuç' + (l.length > 24 ? ', ilk 24 tanesi gösteriliyor' : '') : '', uyum].filter(Boolean).join(' · ');
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
