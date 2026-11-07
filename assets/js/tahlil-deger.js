/* Tahlil değer listesi: diyetisyen paneli ve Sağlık Dosyam aynı HTML'i basar.
   Konum imleci [data-oran] ile gelir; basan sayfa PA.oranlar ya da U.bas ile değerini verir. */
(function () {
  'use strict';
  const DD = window.DD;
  const kac = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const oku = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
  const sayi = (v) => DD.bicim.sayi(v, 2);
  const birimli = (v, b) => (b === '%' ? '%' + sayi(v) : sayi(v) + (b ? ' ' + kac(b) : ''));
  const DURUM = {
    dusuk: { sinif: 'bekleme', ikon: 'fa-arrow-down', ad: 'Düşük', konum: 'referansın altında' },
    yuksek: { sinif: 'bekleme', ikon: 'fa-arrow-up', ad: 'Yüksek', konum: 'referansın üstünde' },
    normal: { sinif: 'olumlu', ikon: 'fa-check', ad: 'Normal', konum: 'referans içinde' },
  };

  /* Sınırın kendisi normaldir; referans ya da sonuç yoksa durum da yoktur */
  function durum(d) {
    const s = oku(d.sonuc), a = oku(d.ref_alt), u = oku(d.ref_ust);
    if (s == null || (a == null && u == null)) return null;
    if (a != null && s < a) return 'dusuk';
    if (u != null && s > u) return 'yuksek';
    return 'normal';
  }
  const disi = (d) => { const r = durum(d); return r === 'dusuk' || r === 'yuksek'; };

  /* Çubuk: %25 alt bölge, %50 normal bölge, %25 üst bölge. Tek sınırlı referansta
     normal bölge açık uca kadar uzanır. Referans dışı imleç sınırın üstüne binmesin
     diye en az PAY kadar dışarıda durur. */
  const ALT = 25, UST = 75, PAY = 6;
  const oran = (fark, olcek) => Math.min(1, fark / (Math.abs(olcek) || 1));
  const disari = (t) => PAY + (ALT - PAY) * t;
  function konum(s, a, u) {
    if (a != null && s < a) return ALT - disari(oran(a - s, a));
    if (u != null && s > u) return UST + disari(oran(s - u, u - (a == null ? 0 : a)));
    if (a != null && u != null) return u > a ? ALT + (UST - ALT) * (s - a) / (u - a) : 50;
    if (u != null) return u > 0 ? UST * Math.max(s, 0) / u : UST / 2;
    return ALT + (100 - ALT) * oran(s - a, a);
  }

  function aralik(a, u) {
    if (a != null && u != null) return { yazi: sayi(a) + '–' + sayi(u), okunus: sayi(a) + ' ile ' + sayi(u) + ' arası' };
    if (u != null) return { yazi: '&lt; ' + sayi(u), okunus: sayi(u) + ' altı' };
    if (a != null) return { yazi: '&gt; ' + sayi(a), okunus: sayi(a) + ' üstü' };
    return null;
  }

  function cubuk(d, s, a, u, r, ref) {
    const sinir = a != null && u != null ? 'iki' : u != null ? 'ust' : 'alt';
    const etiket = 'Referans çubuğu: ' + birimli(s, d.birim) + ', referans ' + ref.okunus + ', ' + DURUM[r].konum;
    return `<div class="referans-cubuk" data-sinir="${sinir}" role="img" aria-label="${etiket}"><span class="rc-normal"></span>${a != null ? '<span class="rc-sinir alt"></span>' : ''}${u != null ? '<span class="rc-sinir ust"></span>' : ''}<span class="rc-imlec" data-oran="${Math.round(konum(s, a, u) * 10) / 10}"></span></div>`;
  }

  function satir(d, onceki) {
    const s = oku(d.sonuc), a = oku(d.ref_alt), u = oku(d.ref_ust), r = durum(d), ref = aralik(a, u);
    const e = (onceki || []).find((x) => x.ad === d.ad && oku(x.sonuc) != null);
    const rozet = r ? `<span class="rozet ${DURUM[r].sinif} ikonlu rs-durum"><i class="fa-solid ${DURUM[r].ikon}" aria-hidden="true"></i>${DURUM[r].ad}</span>` : '';
    return `<li class="referans-satir${disi(d) ? ' disi' : ''}"><div class="rs-ad"><b>${kac(d.ad)}</b><small>${ref ? 'Referans ' + ref.yazi : 'Referans yok'}</small></div><div class="rs-deger"><b>${s == null ? '—' : birimli(s, d.birim)}</b>${e ? `<small>Önceki ${sayi(e.sonuc)}</small>` : ''}</div>${r ? cubuk(d, s, a, u, r, ref) : ''}${rozet}</li>`;
  }

  /* Referans dışı olanlar üstte; iki grubun içi kayıt sırasını korur */
  function liste(degerler, { onceki } = {}) {
    const l = degerler || [];
    const sirali = l.filter(disi).concat(l.filter((d) => !disi(d)));
    return `<ul class="referans-liste" role="list" aria-label="Tahlil değerleri">${sirali.map((d) => satir(d, onceki)).join('')}</ul>`;
  }

  DD.tahlilDeger = { durum, disi, liste };
})();
