/* Tahlil değer listesi: diyetisyen paneli ve Sağlık Dosyam aynı HTML'i basar.
   Konum imleci [data-oran] ile gelir; basan sayfa PA.oranlar ya da U.bas ile değerini verir.

   Referans aralığı sırası (revize 9 Kasım F5):
   1. Raporun kendi laboratuvar aralığı (değerdeki ref_alt / ref_ust).
   2. Rapor aralık vermiyorsa aşağıdaki varsayılan tablo; birim aynı değilse tablo kullanılmaz.
   3. Kılavuzu laboratuvardan sıkı olan satırda (yalnız ferritin) alt sınır kılavuzdan gelir:
      eski "düşük ama yeterli" bölge artık yetersiz sayılır. Laboratuvar aralığı yine yazılır.

   Varsayılan tablo (tarih: kaynağın yayımı; tablo 9 Kasım 2026'da derlendi, uzman onayı bekliyor):
   | Tetkik        | Normal               | Kaynak                                                         |
   | Ferritin      | 30 ng/mL üstü        | ASH 2026 demir eksikliği tanı kılavuzu, Blood Adv. Eylül 2026  |
   | Hemoglobin    | kadın ≥12, erkek ≥13 | WHO hemoglobin eşikleri kılavuzu, Mart 2024                    |
   | Açlık glukozu | 100 mg/dL altı       | ADA Standards of Care 2026, Diabetes Care 49 Ek 1, Aralık 2025 |
   | HbA1c         | %5,7 altı            | ADA Standards of Care 2026, Diabetes Care 49 Ek 1, Aralık 2025 | */
(function () {
  'use strict';
  const DD = window.DD;
  const kac = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const oku = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
  const sayi = (v) => DD.bicim.sayi(v, 2);
  const birimli = (v, b) => (b === '%' ? '%' + sayi(v) : sayi(v) + (b ? ' ' + kac(b) : ''));
  const kucuk = (s) => String(s || '').toLocaleLowerCase('tr').trim();
  const DURUM = {
    dusuk: { sinif: 'bekleme', ikon: 'fa-arrow-down', ad: 'Düşük', konum: 'referansın altında' },
    yuksek: { sinif: 'bekleme', ikon: 'fa-arrow-up', ad: 'Yüksek', konum: 'referansın üstünde' },
    normal: { sinif: 'olumlu', ikon: 'fa-check', ad: 'Normal', konum: 'referans içinde' },
  };

  const KAYNAK = {
    ash: { kisa: 'ASH 2026', ad: 'American Society of Hematology 2026 demir eksikliği tanı kılavuzu', yer: 'Blood Advances, doi:10.1182/bloodadvances.2025015950', tarih: 'Eylül 2026' },
    who: { kisa: 'WHO 2024', ad: 'WHO, anemi tanımı için hemoglobin eşikleri kılavuzu', yer: 'Dünya Sağlık Örgütü', tarih: 'Mart 2024' },
    ada: { kisa: 'ADA 2026', ad: 'ADA Standards of Care in Diabetes 2026, Bölüm 2', yer: 'Diabetes Care 49 (Ek 1)', tarih: 'Aralık 2025' },
  };
  /* altDahil: sınırın kendisi düşük sayılır (ferritin ≤30). ustDahil: sınırın kendisi yüksek sayılır (glukoz 100, HbA1c 5,7).
     kilavuz: laboratuvar alt sınırı daha gevşekse kılavuz sınırı geçerli olur. */
  const VARSAYILAN = [
    { gorunen: 'Ferritin', adlar: ['ferritin'], birim: 'ng/mL', alt: 30, altDahil: true, kilavuz: true, kaynak: 'ash', yazi: '30 ng/mL üstü', not: 'Erişkinde 30 ng/mL ve altı demir eksikliği sayılır; eski eşik 15 ng/mL idi. Belirgin kayıp ya da yakınma varsa eşik 50, inflamasyonda 100 ng/mL kullanılabilir.' },
    { gorunen: 'Hemoglobin', adlar: ['hemoglobin', 'hgb'], birim: 'g/dL', alt: { 'kadın': 12, erkek: 13 }, kaynak: 'who', yazi: 'Kadın 12, erkek 13 g/dL ve üstü', not: 'Gebe olmayan 15 yaş üstü erişkinler; gebelikte eşik farklıdır.' },
    { gorunen: 'Açlık glukozu', adlar: ['açlık glukozu', 'açlık kan şekeri', 'glukoz (açlık)'], birim: 'mg/dL', ust: 100, ustDahil: true, kaynak: 'ada', yazi: '100 mg/dL altı', not: '100–125 mg/dL bozulmuş açlık glukozu (prediyabet) aralığıdır.' },
    { gorunen: 'HbA1c', adlar: ['hba1c', 'hemoglobin a1c'], birim: '%', ust: 5.7, ustDahil: true, kaynak: 'ada', yazi: '%5,7 altı', not: '%5,7–6,4 prediyabet aralığıdır.' },
  ];
  const sec = (x, c) => (x && typeof x === 'object' ? (x[c] ?? null) : (x ?? null));
  const tabloSatir = (d) => { const a = kucuk(d.ad); return VARSAYILAN.find((v) => v.adlar.includes(a) && (!d.birim || v.birim === d.birim)); };

  /* Değerin geçerli referansı: { alt, ust, altDahil, ustDahil, kaynak: rapor | tablo | kilavuz, lab, v } ya da null */
  function referans(d, o) {
    const c = (o || {}).cinsiyet, ra = oku(d.ref_alt), ru = oku(d.ref_ust), v = tabloSatir(d);
    const va = v ? sec(v.alt, c) : null, vu = v ? sec(v.ust, c) : null;
    if (ra != null || ru != null) {
      if (v && v.kilavuz && va != null && (ra == null || ra < va)) return { alt: va, ust: ru, altDahil: v.altDahil, kaynak: 'kilavuz', lab: { alt: ra, ust: ru }, v };
      return { alt: ra, ust: ru, kaynak: 'rapor' };
    }
    if (va != null || vu != null) return { alt: va, ust: vu, altDahil: v.altDahil, ustDahil: v.ustDahil, kaynak: 'tablo', v };
    return null;
  }

  /* Sınırın kendisi normaldir (tablo aksini söylemedikçe); referans ya da sonuç yoksa durum da yoktur */
  function durum(d, o) {
    const s = oku(d.sonuc), r = referans(d, o);
    if (s == null || !r) return null;
    if (r.alt != null && (s < r.alt || (r.altDahil && s === r.alt))) return 'dusuk';
    if (r.ust != null && (s > r.ust || (r.ustDahil && s === r.ust))) return 'yuksek';
    return 'normal';
  }
  const disi = (d, o) => { const r = durum(d, o); return r === 'dusuk' || r === 'yuksek'; };

  /* Çubuk: %25 alt bölge, %50 normal bölge, %25 üst bölge. Tek sınırlı referansta
     normal bölge açık uca kadar uzanır. Referans dışı imleç sınırın üstüne binmesin
     diye en az PAY kadar dışarıda durur. */
  const ALT = 25, UST = 75, PAY = 6;
  const oran = (fark, olcek) => Math.min(1, fark / (Math.abs(olcek) || 1));
  const disari = (t) => PAY + (ALT - PAY) * t;
  function konum(s, a, u, r) {
    if (r === 'dusuk') return ALT - disari(oran(a - s, a));
    if (r === 'yuksek') return UST + disari(oran(s - u, u - (a == null ? 0 : a)));
    if (a != null && u != null) return u > a ? ALT + (UST - ALT) * (s - a) / (u - a) : 50;
    if (u != null) return u > 0 ? UST * Math.max(s, 0) / u : UST / 2;
    return ALT + (100 - ALT) * oran(s - a, a);
  }

  function aralik(r, b) {
    if (!r) return null;
    const a = r.alt, u = r.ust, bi = b === '%' ? '' : b ? ' ' + kac(b) : '', yuzde = b === '%' ? '%' : '';
    const n = (v) => yuzde + sayi(v);
    if (a != null && u != null) return { yazi: n(a) + '–' + n(u) + bi, okunus: sayi(a) + ' ile ' + sayi(u) + ' arası' };
    if (u != null) return { yazi: '&lt; ' + n(u) + bi, okunus: sayi(u) + ' altı' };
    return { yazi: '&gt; ' + n(a) + bi, okunus: sayi(a) + ' üstü' };
  }
  /* Referansın nereden geldiği satırın altına yazılır */
  function kaynakYazi(r, b) {
    if (r.kaynak === 'rapor') return 'Laboratuvar aralığı';
    const k = KAYNAK[r.v.kaynak];
    if (r.kaynak === 'tablo') return 'Rapor aralık vermedi · ' + k.kisa;
    const l = aralik(r.lab, b);
    return 'Laboratuvar ' + (l ? l.yazi : '—') + ' · alt sınır ' + k.kisa;
  }

  function cubuk(d, s, ref, r, metin) {
    const a = ref.alt, u = ref.ust, sinir = a != null && u != null ? 'iki' : u != null ? 'ust' : 'alt';
    const etiket = 'Referans çubuğu: ' + birimli(s, d.birim) + ', referans ' + metin.okunus + ', ' + DURUM[r].konum;
    return `<div class="referans-cubuk" data-sinir="${sinir}" role="img" aria-label="${etiket}"><span class="rc-normal"></span>${a != null ? '<span class="rc-sinir alt"></span>' : ''}${u != null ? '<span class="rc-sinir ust"></span>' : ''}<span class="rc-imlec" data-oran="${Math.round(konum(s, a, u, r) * 10) / 10}"></span></div>`;
  }

  function satir(d, onceki, o) {
    const s = oku(d.sonuc), ref = referans(d, o), r = durum(d, o), metin = aralik(ref, d.birim);
    const e = (onceki || []).find((x) => x.ad === d.ad && oku(x.sonuc) != null);
    const rozet = r ? `<span class="rozet ${DURUM[r].sinif} ikonlu rs-durum"><i class="fa-solid ${DURUM[r].ikon}" aria-hidden="true"></i>${DURUM[r].ad}</span>` : '<span class="rozet pasif rs-durum">Referans yok</span>';
    const alt = ref ? `<small>Referans ${metin.yazi}</small><small class="rs-kaynak${ref.kaynak === 'rapor' ? '' : ' vurgu'}">${kaynakYazi(ref, d.birim)}</small>` : '<small>Rapor aralık vermedi, varsayılan tabloda yok</small>';
    return `<li class="referans-satir${r === 'dusuk' || r === 'yuksek' ? ' disi' : ''}"><div class="rs-ad"><b>${kac(d.ad)}</b>${alt}</div><div class="rs-deger"><b>${s == null ? '—' : birimli(s, d.birim)}</b>${e ? `<small>Önceki ${sayi(e.sonuc)}</small>` : ''}</div>${r ? cubuk(d, s, ref, r, metin) : ''}${rozet}</li>`;
  }

  /* Referans dışı olanlar üstte; iki grubun içi kayıt sırasını korur.
     o.cinsiyet: varsayılan tablodaki cinsiyete bağlı eşik için ('kadın' | 'erkek') */
  function liste(degerler, o) {
    o = o || {};
    const l = degerler || [], d = (x) => disi(x, o);
    const sirali = l.filter(d).concat(l.filter((x) => !d(x)));
    return `<ul class="referans-liste" role="list" aria-label="Tahlil değerleri">${sirali.map((x) => satir(x, o.onceki, o)).join('')}</ul>`;
  }

  /* Liste altındaki kaynak notu: hangi aralığın nereden geldiği, tablo kaynakları ve onay durumu */
  function kaynakNotu(degerler, o) {
    const l = (degerler || []).map((x) => referans(x, o)).filter(Boolean);
    const say = (k) => l.filter((r) => r.kaynak === k).length, tablo = say('tablo'), kilavuz = say('kilavuz');
    const kaynaklar = [...new Set(l.filter((r) => r.v).map((r) => r.v.kaynak))].map((k) => KAYNAK[k].kisa + ' (' + KAYNAK[k].tarih + ')');
    const parca = [];
    if (kilavuz) parca.push(kilavuz + ' değerde alt sınır güncel kılavuzdan');
    if (tablo) parca.push(tablo + ' değerde rapor aralık vermediği için varsayılan tablodan');
    const ilk = parca.length ? 'Aralıklar önce raporun kendi laboratuvarından alınır; ' + parca.join(', ') + ' geldi: ' + kaynaklar.join(', ') + '.' : 'Aralıklar raporun kendi laboratuvar aralığıdır.';
    return `<p class="referans-kaynak"><i class="fa-solid fa-book-medical" aria-hidden="true"></i><span>${ilk} Varsayılan tablo uzman onayı bekliyor. Sonuçları diyetisyenin ya da hekiminle değerlendir.</span></p>`;
  }

  /* Varsayılan tablonun kendisi: kaynak ve tarih ile; iki tarafta da aynı liste görünür, dar ekranda satırlar alt alta iner */
  function tablo() {
    return `<div class="ayar-liste" role="list" aria-label="Varsayılan referans tablosu">${VARSAYILAN.map((v) => { const k = KAYNAK[v.kaynak]; return `<div class="ayar-satir" role="listitem"><span class="as-ikon"><i class="fa-solid fa-vial" aria-hidden="true"></i></span><div class="as-metin"><b>${kac(v.gorunen)}: ${kac(v.yazi)}</b><span>${kac(v.not)}</span><small class="referans-kaynak-satir">${kac(k.ad)} · ${kac(k.yer)} · ${k.tarih}</small></div></div>`; }).join('')}</div>`;
  }

  /* Kişiye bağlı kısayol: filter(T.disi) gibi kullanımlarda cinsiyet kaybolmasın */
  const kisi = (o) => ({ durum: (d) => durum(d, o), disi: (d) => disi(d, o), liste: (l, ek) => liste(l, { ...o, ...ek }), kaynakNotu: (l) => kaynakNotu(l, o) });

  DD.tahlilDeger = { durum: (d) => durum(d), disi: (d) => disi(d), liste, referans, kaynakNotu, tablo, kisi, VARSAYILAN, KAYNAK, ONAY: 'Uzman onayı bekliyor', DERLEME: '9 Kasım 2026' };
})();
