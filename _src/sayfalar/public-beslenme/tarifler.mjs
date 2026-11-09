// Sağlıklı Tarifler: liste (tarifler/), kategori (tarifler/kategori/<slug>/), detay (tarif/<slug>/).
// Kurgu DadaDiet/tasks/diet-saglikli-tarifler-plan.md (Yasin Bey onaylı, Beyar 24 Eki): tarif Diet'in kendi içeriğidir, belirli bir Gastro
// tarifinin hafif hâlidir ve altında "Bu tarifin klasik hali Dada Gastro'da" bağı durur; kalori ve besin değerleri besin kütüphanesinden
// hesaplanır; etiket yalnız Vegan, Vejetaryen, Glütensiz (K11); uygun programlar listelenir; yayın editör onayıyla.
// Temel kayıt _src/veri/tarifler.json (36 tarif, plan oluşturucu da okur); detay alanları _src/veri/tarif-detay.json (canlı GET, 9 Kasım).
// Reklam kancaları canlı tarif-detay, tarifler, tarifler-kategori ve parcalar/public/tarif/dizin-govde Blade'lerindeki yerlerinde.
import { K, kac, ikon, icerik, bant, bolumBas, bolum, gorselKart, DETAY, sayfa, dizi, araMetni, cipler, aramaKutusu, liste, ilgili, kunyeKart, paylas, akordeon, bilgiNot } from '../../parcalar/public-beslenme/ortak.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';
import { bicim } from '../../parcalar/bicim.mjs';
/* Besin bağı (9 Kasım tam tarama): prototipte yalnız bazı besinlerin detay sayfası var (besin/avokado). Sayfası olmayan
   besin Besin Kütüphanesi'nde adıyla aranmış listeye açılır (public-beslenme-liste.js ?ara=); kırık bağ kalmaz. */
const BESIN_SAYFASI = new Set(['avokado']);
const besinBag = (slug, ad) => (BESIN_SAYFASI.has(slug) ? `${K}besin/${slug}/` : `${K}besin-kutuphanesi/?ara=${encodeURIComponent(String(ad).split(/[,(]/)[0].trim())}`);

const A = { aktif: 'Beslenme' };
const ETIKET = [['Vegan', 'vegan', 'fa-seedling'], ['Vejetaryen', 'vejetaryen', 'fa-carrot'], ['Glütensiz', 'glutensiz', 'fa-wheat-awn-circle-exclamation']];
const OGUN = [['kahvalti', 'Kahvaltı'], ['brunch', 'Brunch'], ['ogle-yemegi', 'Öğle Yemeği'], ['aksam-yemegi', 'Akşam Yemeği'], ['ara-ogun', 'Ara Öğün'], ['ikindi-ve-cay-saati', 'İkindi ve Çay Saati'], ['beslenme-cantasi', 'Beslenme Çantası']];
const SURE = [['15-alti', '15 dakikadan az', (d) => d < 15], ['15-30', '15–30 dakika', (d) => d >= 15 && d < 30], ['30-45', '30–45 dakika', (d) => d >= 30 && d < 45], ['45-60', '45–60 dakika', (d) => d >= 45 && d < 60], ['60-120', '1–2 saat', (d) => d >= 60 && d < 120], ['120-ustu', '2 saatten uzun', (d) => d >= 120]];
const KALORI = [['200-alti', '200 kcal\'den az', (k) => k < 200], ['200-400', '200–400 kcal', (k) => k >= 200 && k < 400], ['400-600', '400–600 kcal', (k) => k >= 400 && k < 600], ['600-ustu', '600 kcal ve üzeri', (k) => k >= 600]];
const ZORLUK = [['kolay', 'Kolay'], ['orta', 'Orta'], ['zor', 'Zor']];
const ORNEK_NOT = (n) => `Bu önizlemede canlı dadadiet.com'daki 143 tariften plan oluşturucunun kullandığı ${n} tanesi listelenir (prototip örneği); süzgeç sayıları bu tarifleri sayar. Tarif metinleri ve değerleri canlıdan alındı (9 Kasım 2026).`;
/* Kategori sayfası reklam önizlemesi: KT-M2 7., KT-T1 10. karttan sonra açılır (canlı kural), bu yüzden en az 10 tarifli kategori */
export const REKLAM_KATEGORI = 'kahvaltilik';

const etiketler = (t) => ETIKET.filter(([ad]) => t.etiketler.includes(ad));
const bant_ = (a, l) => (l.find(([, , f]) => f(a)) || [''])[0];

export function birlestir(veri) {
  const D = veri['tarif-detay'].tarifler;
  return veri.tarifler.tarifler.map((t) => ({ ...t, d: D[t.slug] })).filter((t) => t.d);
}
const kategoriler = (t) => [t.d.kategori, ...t.d.kategoriler.filter((k) => k.slug !== t.d.kategori.slug)];

export const tarifKart = (t, imza = '') => gorselKart({
  href: `tarif/${t.slug}/`, gorsel: icerik(t.gorsel_dosya), rozet: kac(t.d.kategori.ad), altRozet: bicim.kcal(t.kcal), baslik: kac(t.ad), metin: kac(t.ozet),
  etiketler: imza + etiketler(t).map(([ad, , i]) => `<span class="rozet olumlu ikonlu">${ikon(i)} ${ad}</span>`).join(''),
  not: `${t.sure} dk · ${t.zorluk} · ${t.porsiyon} kişilik`, git: 'Tarife Git', sinif: 'buyuk',
  veri: ` data-kart data-kategori="${kategoriler(t).map((k) => k.slug).join('|')}" data-ogun="${t.ogunler.join('|')}" data-etiket="${etiketler(t).map(([, s]) => s).join('|')}" data-zorluk="${t.zorluk.toLocaleLowerCase('tr')}" data-sure="${bant_(t.sure, SURE)}" data-kalori="${bant_(t.kcal, KALORI)}" data-ara="${araMetni(t.ad, t.d.kategori.ad, t.ozet, t.malzemeler.join(' '))}"`,
});

const secim = (id, etiket, alan, tumu, kalemler) => `<div class="alan"><label class="alan-etiket" for="${id}">${etiket}</label><select class="alan-secim" id="${id}" data-liste-secim="${alan}"><option value="">${tumu}</option>${kalemler.filter((k) => k.sayi).map((k) => `<option value="${k.deger}" data-sayi="${k.sayi}">${kac(k.ad)} (${k.sayi})</option>`).join('')}</select></div>`;
const say = (l, f) => l.filter(f).length;

/* Liste gövdesi: canlı dizin-govde sırası. on: reklam öneki (TL ya da KT) */
export function dizin(l, on, { kategoriCip = true, tumuSayi, imza = '', not } = {}) {
  const kats = new Map();
  l.forEach((t) => kategoriler(t).forEach((k) => kats.set(k.slug, { ...k, sayi: (kats.get(k.slug)?.sayi || 0) + 1 })));
  const katCip = [...kats.values()].sort((a, b) => b.sayi - a.sayi || a.ad.localeCompare(b.ad, 'tr'));
  const id = (on || 'kt').toLowerCase();
  const r = (kod, o) => (on ? rk(kod, o) : '');
  const ust = `<div class="liste-arac">${aramaKutusu(`${id}Ara`, 'Tarif ara', 'Örneğin mercimek, yoğurt')}
${secim(`${id}Ogun`, 'Öğün', 'ogun', 'Tüm öğünler', OGUN.map(([d, ad]) => ({ ad, deger: d, sayi: say(l, (t) => t.ogunler.includes(d)) })))}
${secim(`${id}Sure`, 'Süre', 'sure', 'Tüm süreler', SURE.map(([d, ad, f]) => ({ ad, deger: d, sayi: say(l, (t) => f(t.sure)) })))}
${secim(`${id}Zorluk`, 'Zorluk', 'zorluk', 'Tüm zorluklar', ZORLUK.map(([d, ad]) => ({ ad, deger: d, sayi: say(l, (t) => t.zorluk === ad) })))}
${secim(`${id}Etiket`, 'Beslenme etiketi', 'etiket', 'Tüm etiketler', ETIKET.map(([ad, d]) => ({ ad, deger: d, sayi: say(l, (t) => t.etiketler.includes(ad)) })))}
${secim(`${id}Kalori`, 'Kalori (porsiyon)', 'kalori', 'Tüm kaloriler', KALORI.map(([d, ad, f]) => ({ ad, deger: d, sayi: say(l, (t) => f(t.kcal)) })))}
</div>${r(`${on}-FILTER`, { tur: 'filtre' })}
${kategoriCip ? `<div class="tarif-tema">${cipler('kategori', 'Tarif kategorisi', [{ ad: 'Tümü', deger: '', sayi: tumuSayi ?? l.length }, ...katCip.map((k) => ({ ad: k.ad, deger: k.slug, sayi: k.sayi }))])}${on === 'TL' ? rk('TL-THEME', { tur: 'tema', hedef: '.tarif-tema .cipler', sira: 2 }) : ''}</div>` : ''}`;
  const ara = (n, kod, o) => (l.length >= n ? r(kod, o) : '');
  const kartlar = l.map((t) => tarifKart(t, imza)).join('') + r(`${on}-M1`, { tur: 'sonuc', sira: 2 }) + ara(7, `${on}-M2`, { tur: 'sonuc', sira: 9 }) + ara(10, `${on}-T1`, { tur: 'liste-sira', sira: 13 });
  const kopru = on === 'TL' ? rk('TL-BRIDGE', { tur: 'sar', kap: false }) + rk('tarif-liste.dolap-koprusu', { tur: 'sar', kap: false }) : '';
  return liste({ toplam: tumuSayi ?? l.length, birim: 'tariften', ust, ustNot: kopru, kartlar, bosMetin: 'Bu süzgeçlere uyan tarif yok. Bir süzgeci kaldırmayı dene.', altNot: `${r(`${on}-B1`, { tur: 'sar', kap: false })}<p class="alan-yardim"><span>${not ?? ORNEK_NOT(tumuSayi ?? l.length)}</span></p>` });
}

function tarifler(veri, l) {
  const katSayi = new Set(l.flatMap((t) => kategoriler(t).map((k) => k.slug))).size;
  return sayfa('tarifler', 'Sağlıklı Tarifler',
    bant({ yol: [['Tarifler']], etiket: 'SAĞLIKLI TARİFLER', etiketIkon: 'fa-bowl-food', h1: 'Bütün tarifler, tek dizinde', alt: 'Kategoriye, öğüne, süreye ve beslenme etiketine göre daralt; sofrana uygun tarifi bul.', gorsel: 'assets/img/hero/tarifler-lst-top.jpg', sayilar: [[l.length, 'tarif'], [katSayi, 'kategori'], [l.length, 'besin değeri hesaplı']], eylem: rk('TL-HERO') })
    + dizi(bolum(dizin(l, 'TL'), { ilk: true })), { ...A, js: ['liste'] });
}

function kategori(l, k) {
  const ic = l.filter((t) => kategoriler(t).some((x) => x.slug === k.slug));
  return sayfa(`tarifler/kategori/${k.slug}`, `${k.ad} Tarifleri`,
    bant({ yol: [['Tarifler', 'tarifler/'], [k.ad]], etiket: 'KATEGORİ', etiketIkon: 'fa-bowl-food', h1: kac(k.ad), alt: `${kac(k.ad)} kategorisindeki sağlıklı tarifler; süre, öğün ve beslenme etiketine göre süz.`, gorsel: 'assets/img/hero/tarifler-lst-top.jpg', sayilar: [[ic.length, 'tarif']], eylem: k.slug === REKLAM_KATEGORI ? rk('KT-HERO') : '' })
    + dizi(bolum((k.slug === REKLAM_KATEGORI ? rk('KT-SPON', { tur: 'pano', hedef: '.bant', yon: 'sonra' }) : '') + dizin(ic, k.slug === REKLAM_KATEGORI ? 'KT' : null, { kategoriCip: false }), { ilk: true })), { ...A, js: ['liste'] });
}

/* Detay */
const miktar = (s) => (s.miktar == null ? '' : `<b data-miktar="${s.miktar}" data-birim="${kac(s.birim || '')}">${bicim.sayi(s.miktar, 1)} ${kac(s.birim || '')}</b>`);
const yuzde = (t) => {
  const p = t.protein * 4, c = t.karb * 4, y = t.yag * 9, top = p + c + y || 1;
  const l = [Math.round((p / top) * 100), Math.round((c / top) * 100)];
  return [['Protein', l[0]], ['Karbonhidrat', l[1]], ['Yağ', 100 - l[0] - l[1]]];
};

function benzerler(t, l) {
  const bs = new Map(l.map((x) => [x.slug, x]));
  const sira = [...t.d.benzer.filter((s) => bs.has(s)), ...l.filter((x) => x.d.kategori.slug === t.d.kategori.slug).map((x) => x.slug), ...l.filter((x) => kategoriler(x).some((k) => kategoriler(t).some((y) => y.slug === k.slug))).map((x) => x.slug)];
  return [...new Set(sira)].filter((s) => s !== t.slug).slice(0, 4).map((s) => bs.get(s));
}

function tarifDetay(veri, l, t) {
  const d = t.d;
  const P = new Map(veri.programlar.programlar.map((p) => [p.slug, p]));
  const satirlar = d.malzeme_gruplari.map((g, gi) => `${g.ad ? `<h3 class="malzeme-grup">${kac(g.ad)}</h3>` : ''}<div class="malzeme-liste">${g.satirlar.map((s) => `<label class="malzeme-satir"><input type="checkbox">${miktar(s) || '<b></b>'}<span>${s.besin ? `<a href="${besinBag(s.besin, s.ad)}">${kac(s.ad)}</a>` : kac(s.ad)}${s.not ? `<small>${kac(s.not)}</small>` : ''}</span></label>`).join('')}${gi === 0 ? rk(['TD-ING', 'TD-LISTE-PARTNER', 'TD-SIPARIS-YS', 'TD-SIPARIS-A101'], { sira: 2 }) : ''}</div>`).join('');
  const gastroUst = d.gastro ? `<a class="rozet olumlu ikonlu" href="${d.gastro.url}" target="_blank" rel="external noopener">${ikon('fa-arrow-up-right-from-square')} Bu tarifin klasik hali Dada Gastro'da</a>` : '';
  const gastroAlt = d.gastro ? `<div class="kart"><div class="kart-govde yigin sik"><span class="ikon-kutu">${ikon('fa-utensils')}</span><h2 class="kart-baslik">Bu tarifin klasik hali Dada Gastro'da</h2><p class="kart-metin">Bu tarif, Dada Gastro'daki klasik tarifin hafif hâlidir; yemeğin kimliği aynı kalır, değişenler yukarıda.</p><a class="dugme hayalet kucuk" href="${d.gastro.url}" target="_blank" rel="external noopener">Klasik tarife git ${ikon('fa-arrow-up-right-from-square')}</a></div></div>` : '';
  const not = (i, b, m, ek = '') => (m ? `<div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon(i)} ${b}</h2></div><div class="kart-govde yigin sik"><p class="kart-metin">${kac(m)}</p>${ek}</div></div>` : '');
  const hesap = d.hesap.length ? akordeon([{ soru: 'Nasıl hesapladık', ikon: 'fa-calculator', govde: `<div class="okuma"><p>Her malzeme besin kütüphanemizdeki bir kayda bağlı; gramı ve değerlerin geldiği kaynak aşağıda.</p><ul>${d.hesap.map((h) => `<li><b>${kac(h.ad)}</b> ${kac(h.gram)}${h.besin ? ` · <a href="${besinBag(h.besin, h.ad)}">besin kaydı</a>` : ''}${h.kaynak ? ` · ${h.kaynak_url ? `<a href="${kac(h.kaynak_url)}" target="_blank" rel="noopener nofollow">${kac(h.kaynak)}</a>` : kac(h.kaynak)}` : ''}</li>`).join('')}</ul>${d.hesap_toplam ? `<p>${kac(d.hesap_toplam)}</p>` : ''}<p>Değerler malzemelerin besin kütüphanemizdeki kaynaklı değerlerinden hesaplanır; pişirme kayıpları dahil değildir.</p></div>` }]) : '';
  const sol = `<div class="yigin">
${d.giris ? `<div class="okuma"><p class="okuma-giris">${kac(d.giris)}</p></div>` : ''}
<div class="kart"><div class="kart-bas"><div><span class="ust-etiket">${ikon('fa-list-ol')} Adım adım</span><h2 class="kart-baslik">Nasıl Yapılır?</h2></div><button class="dugme hayalet kucuk" type="button" data-yazdir>${ikon('fa-print')} Yazdır</button></div><div class="kart-govde yigin sik">${rk('CM-TOP', { tur: 'pisirme' })}${rk('TD-COOK')}<ol class="sira-liste metinli">${t.adimlar.map((a, i) => `<li><span class="adim-no">${i + 1}</span><p>${kac(a)}</p></li>`).join('')}</ol></div></div>
${rk('TD-MW')}
${not('fa-circle-info', 'Alerjen Notu', d.alerjen || t.alerjen_notu)}
${not('fa-bell', 'İpucu', d.ipucu, rk('TD-TIP'))}
${not('fa-feather', 'Neler Değişti', d.neler_degisti)}
<div class="kart"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-heart-pulse')} Besin Değerleri</h2><p>1 porsiyon · değerler tahminidir</p></div></div><div class="kart-govde yigin sik">
${d.klasik_kcal ? `<p class="durum-satir">${ikon('fa-scale-balanced')}<span>Klasik tarif ≈ ${bicim.kcal(d.klasik_kcal)} · bu tarif ≈ ${bicim.kcal(t.kcal)} (porsiyon başına)</span></p>` : ''}
<dl class="kunye"><div><dt>Kalori</dt><dd>${bicim.kcal(t.kcal)}</dd></div><div><dt>Protein</dt><dd>${bicim.gram(t.protein)}</dd></div><div><dt>Karbonhidrat</dt><dd>${bicim.gram(t.karb)}</dd></div><div><dt>Yağ</dt><dd>${bicim.gram(t.yag)}</dd></div></dl>
${yuzde(t).map(([a, y]) => `<div class="olcu-satir"><span>${a}</span><div class="olcer hap"><span data-oran="${y}"></span></div><span>%${y}</span></div>`).join('')}
<p class="kart-metin">${kac(d.hesap_not || 'Porsiyon başına, malzemelerin Besin Kütüphanesi değerlerinden hesaplanmıştır.')}</p>
${hesap}
</div></div>
${rk('TD-NUT')}
${gastroAlt}
${rk('TD-YORUM-ALT')}
</div>`;
  const sag = `<aside class="yigin yapiskan" aria-label="Malzemeler">
<div class="kart"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-basket-shopping')} Malzemeler</h2><p>${d.malzeme_sayisi || t.malzemeler.length} malzeme</p></div></div><div class="kart-govde">
<div class="adet-satir"><span class="alan-etiket" id="porsiyonEtiket">Porsiyon</span><div class="adet" data-taban="${t.porsiyon}"><button type="button" data-yon="azalt" aria-label="Porsiyonu azalt">${ikon('fa-minus')}</button><input id="porsiyon" type="number" min="1" max="24" step="1" value="${t.porsiyon}" readonly aria-labelledby="porsiyonEtiket"><button type="button" data-yon="artir" aria-label="Porsiyonu artır">${ikon('fa-plus')}</button></div></div>
${rk('TD-PORS')}
${satirlar}<p class="alan-yardim tamam"><span>Miktarlar porsiyona göre otomatik güncellenir</span></p></div></div>
${rk('TD-CART')}
${kunyeKart('Tarif Künyesi', [['Hazırlık + Pişirme', `${t.hazirlik_dk} dk + ${t.pisirme_dk} dk`], ['Zorluk', t.zorluk], ['Kategori', kategoriler(t).map((k) => `<a href="${K}tarifler/kategori/${k.slug}/">${kac(k.ad)}</a>`).join(', ')], ['Beslenme etiketleri', etiketler(t).map(([a]) => a).join(', ') || 'Yok'], ['Yayın', `${kac(d.yayin || '')} · editör onayıyla`]], `${paylas}<button class="dugme hayalet kucuk tam-en" type="button" disabled>${ikon('fa-calendar-plus')} Programına ekle · Yakında</button>`)}
${rk('TD-BYLINE')}${rk('TD-SB1')}${rk('TD-SB2')}
</aside>`;
  const benzer = benzerler(t, l).map((x) => tarifKart(x)).join('') + rk('TD-SIM', { tur: 'sonuc', sira: 3 });
  const prog = d.programlar.filter((p) => P.has(p.slug)).map((p) => gorselKart({ href: DETAY.program, gorsel: `${K}assets/img/program/${p.slug}.webp`, rozet: 'Program', rozetIkon: 'fa-list-check', baslik: kac(P.get(p.slug).ad), metin: kac(P.get(p.slug).sure || ''), git: 'Programı İncele' })).join('');
  return sayfa(`tarif/${t.slug}`, t.ad,
    bant({ yol: [['Tarifler', 'tarifler/'], [kac(d.kategori.ad), `tarifler/kategori/${d.kategori.slug}/`], [kac(t.ad)]], etiket: kac(d.kategori.ad).toLocaleUpperCase('tr'), etiketIkon: 'fa-bowl-food', h1: kac(t.ad), alt: kac(t.ozet), gorsel: `assets/img/icerik/${t.gorsel_dosya}`, sayilar: [[bicim.kcal(t.kcal), 'porsiyon başı'], [`${t.sure} dk`, 'toplam süre'], [`${t.porsiyon} kişilik`, 'porsiyon']], eylem: `${etiketler(t).map(([a, , i]) => `<span class="rozet olumlu ikonlu">${ikon(i)} ${a}</span>`).join('')}${gastroUst}` })
    + dizi(
      bolum(`${rk('TD-TOP', { tur: 'sar', kap: false, hedef: '.bant', yon: 'once' })}${rk('TD-PHOTO', { hedef: '.bant', yon: 'basa', nokta: { x: 620, y: 560, mx: 540, my: 600, gorsel: `assets/img/icerik/${t.gorsel_dosya}` } })}${rk('TD-AUDIO', { tur: 'sar', kap: false })}${rk('TD-VIDEO', { tur: 'sar', kap: false })}${rk('TD-T1', { tur: 'sar', kap: false })}<div class="iki-kolon genis-yan-orta">${sol}${sag}</div>`, { ilk: true }),
      ilgili({ etiket: 'BENZER TARİFLER', baslik: 'Bunları da Seveceksin', metin: 'Aynı kategoriden, sofrana yakışacak başka tarifler.', tumu: `tarifler/kategori/${d.kategori.slug}/`, tumuAd: 'Tamamını Gör', kartlar: benzer }),
      bolum(`${rk('TD-EQUIP', { tur: 'pano' })}${rk('TD-SHOP', { tur: 'pano' })}${rk('TD-END', { tur: 'pano' })}${rk('TD-COUPON', { tur: 'pano' })}${prog ? `${bolumBas({ etiket: 'PROGRAMLARDA', ikon: 'fa-calendar-days', baslik: 'Bu Tarifi Kullanan Programlar', metin: 'Bu tarif aşağıdaki beslenme programlarının öğünlerinde yer alıyor ya da onlara uygun.' })}<div class="kart-izgara c4">${prog}</div>` : ''}${rk('TD-B1', { tur: 'sar', kap: false })}${bilgiNot('Tarif değerleri tahminidir ve genel bilgilendirme amaçlıdır; <b>tıbbi teşhis veya tedavi yerine geçmez</b>. Alerjin ya da klinik bir durumun varsa bir diyetisyene danış.', false)}${rk('TD-STK', { tur: 'sar', kap: false })}`),
    ), { ...A, js: ['tarif'] });
}

export default ({ veri }) => {
  const l = birlestir(veri);
  const kats = new Map();
  l.forEach((t) => kategoriler(t).forEach((k) => kats.set(k.slug, k)));
  return [tarifler(veri, l), ...[...kats.values()].map((k) => kategori(l, k)), ...l.map((t) => tarifDetay(veri, l, t))];
};
