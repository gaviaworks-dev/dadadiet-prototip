// Beslenme alanı: besin kütüphanesi, kaç kalori, rehberler, ipuçları ve püf noktaları.
import { K, kac, ikon, icerik, bant, bolumBas, dugme, bolum, gorselKart, yatayKart, metin, DETAY, sayfa, dizi, sayi, deger, araMetni, bilgiNot, cipler, aramaKutusu, liste, ilgili, bloklar, kaynakListe, kunyeKart, paylas, akordeon } from '../../parcalar/public-beslenme/ortak.mjs';
import { bicim } from '../../parcalar/bicim.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';

/* Reklam kancaları: yayılım şeritleri (üst ve sayfa sonu) ve kenar kutusu kalıbı */
const ustSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', kap: false })).join('');
const sonSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', konum: 'alt' })).join('');

const A = { aktif: 'Beslenme' };
const L = { ...A, js: ['liste'] };

const BESIN_IKON = { Sebzeler: 'fa-carrot', Meyveler: 'fa-apple-whole', 'Et & Tavuk': 'fa-drumstick-bite', 'Balık & Deniz': 'fa-fish', Baklagiller: 'fa-seedling', Tahıllar: 'fa-wheat-awn', 'Süt Ürünleri & Yumurta': 'fa-cheese', Kuruyemiş: 'fa-cookie-bite', 'Yağlar & Soslar': 'fa-bottle-droplet', 'Tatlılar & Atıştırmalıklar': 'fa-candy-cane' };
/* Canlı sekme sayıları (541'e toplanır). Örnek kaydı olmayan Baharatlar ve İçecekler çipte gösterilmez. */
const BESIN_SAYI = { Sebzeler: 74, Meyveler: 50, 'Et & Tavuk': 65, 'Balık & Deniz': 49, Baklagiller: 32, Tahıllar: 62, 'Süt Ürünleri & Yumurta': 62, Kuruyemiş: 31, 'Yağlar & Soslar': 27, 'Tatlılar & Atıştırmalıklar': 75 };

/* Alfabetik erişim (site haritası 8.9): baş harf süzgeci */
const basHarf = (ad) => ad.charAt(0).toLocaleUpperCase('tr');
const besinSatir = (b, i) => `<a class="veri-satir" href="${K}${DETAY.besin}" data-kart data-kategori="${b.kategori_kodu}" data-kategori-ad="${kac(b.kategori)}" data-harf="${basHarf(b.ad)}" data-ara="${araMetni(b.ad, b.kategori)}"${i >= 24 ? ' hidden' : ''}>
<span class="ikon-kutu">${ikon(BESIN_IKON[b.kategori] ?? 'fa-leaf')}</span><span class="veri-satir-ad"><b>${kac(b.ad)}</b><span>100 g</span></span><span class="veri-satir-sutun">${deger(b.protein, 'g', 1)}<small>Pro</small></span><span class="veri-satir-sutun">${deger(b.karb, 'g', 1)}<small>Karb</small></span><span class="veri-satir-kalori">${b.kcal === null ? '<span class="veri-yok">veri yok</span>' : `${sayi(b.kcal, 0)} <small>kcal</small>`}</span>${ikon('fa-chevron-right veri-satir-ok')}
</a>`;

const harfler = (l) => {
  const say = new Map();
  l.forEach((b) => say.set(basHarf(b.ad), (say.get(basHarf(b.ad)) || 0) + 1));
  const sira = [...say.keys()].sort((a, b) => a.localeCompare(b, 'tr'));
  return `<div class="liste-satir">${cipler('harf', 'Baş harfe göre', [{ ad: 'A–Z', deger: '' }, ...sira.map((h) => ({ ad: h, deger: h, sayi: say.get(h) }))], { sinif: 'tek-satir harf-dizin' })}</div>`;
};

function besinKutuphanesi(veri) {
  const l = [...veri.besinler.besinler].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
  const kodlar = new Map(l.map((b) => [b.kategori, b.kategori_kodu]));
  const kalem = Object.keys(BESIN_SAYI).filter((k) => kodlar.has(k)).map((k) => ({ ad: k, deger: kodlar.get(k), sayi: BESIN_SAYI[k], ikon: BESIN_IKON[k] }));
  const ust = `<div class="liste-satir">${cipler('kategori', 'Besin kategorisi', [{ ad: 'Tümü', deger: '', sayi: veri.sayaclar.besin, ikon: 'fa-layer-group' }, ...kalem], { sinif: 'serit' })}${aramaKutusu('besinAra', 'Besin ara', 'Örneğin avokado, kinoa')}${dugme('Besin Karşılaştır', 'besin-karsilastir/', 'birincil', 'fa-scale-balanced')}</div>${harfler(l)}`;
  const kapBas = '<div class="veri-liste-bas" aria-hidden="true"><span class="veri-liste-ad">Besin</span><span class="veri-satir-sutun">Protein</span><span class="veri-satir-sutun">Karb.</span><span class="veri-satir-kalori">Kalori</span><span class="veri-satir-ok"></span></div>';
  return sayfa('besin-kutuphanesi', 'Besin Kütüphanesi',
    bant({ yol: [['Besin Kütüphanesi']], etiket: 'BESİN KÜTÜPHANESİ', h1: 'Besin değerlerini keşfet', alt: `${veri.sayaclar.besin} besinin kalori, protein, yağ ve karbonhidrat değerini ara; her değerin hangi kaynaktan geldiğini gör.`, gorsel: 'assets/img/hero/besin-kutuphanesi-canli.webp' })
    + dizi(bolum(ustSerit('AN-B1') + liste({ toplam: veri.sayaclar.besin, birim: 'besinden', ust, ustNot: '<p class="liste-not"><span><span data-liste-sayac role="status"></span> 100 g başına değerler.</span></p>', kapBas, kapSinif: 'veri-liste', sarmal: 'veri-kart', kartlar: l.map(besinSatir).join(''), boyut: 24, bosMetin: 'Aradığın besin bu listede yok. Farklı bir kelime dene ya da süzgeçleri temizle.' }).replace('<div class="yigin" data-liste ', '<div class="yigin" data-liste data-benzer ') + rk('DN-RAIL', { hedef: '.veri-liste', sira: 1 }) + rk('ansiklopedi-liste.kategori-rozeti', { kategori: 'Süt Ürünleri & Yumurta', hedef: '.liste-satir .cipler', yon: 'sonra' }) + rk('AN-N1', { kategori: 'Süt Ürünleri & Yumurta', hedef: '.liste-not', yon: 'sona' }) + bilgiNot(), { ilk: true }), sonSerit('AN-B1-END')), L);
}

const AVOKADO_OZET = 'Tekli doymamış yağ ve lif açısından zengin taze meyve.';
const MIKRO = [['sodyum', 'Sodyum'], ['potasyum', 'Potasyum'], ['kalsiyum', 'Kalsiyum'], ['demir', 'Demir'], ['magnezyum', 'Magnezyum'], ['cinko', 'Çinko'], ['fosfor', 'Fosfor'], ['a_vit', 'A vitamini'], ['c_vit', 'C vitamini'], ['d_vit', 'D vitamini'], ['b12', 'B12 vitamini'], ['folat', 'Folat'], ['kolesterol', 'Kolesterol']];

function besinDetay(veri) {
  const b = veri.besinler.besinler.find((x) => x.slug === 'avokado');
  const yuzde = (kcal) => Math.round((kcal / b.kcal) * 100);
  const makro = [['Protein', b.protein, yuzde(b.protein * 4)], ['Karbonhidrat', b.karb, yuzde(b.karb * 4)], ['Yağ', b.yag, yuzde(b.yag * 9)]];
  const satir = (a, v) => `<tr><th scope="row">${a}</th><td class="sag">${v}</td></tr>`;
  /* Porsiyonlu satır: ham değer data-deger ile gider, seçilen miktar sütununu betik doldurur */
  const psatir = (a, n, br = 'g', bs = 2) => `<tr><th scope="row">${a}</th><td class="sag">${deger(n, br, bs)}</td><td class="sag" data-porsiyon${n === null || n === undefined ? '' : ` data-deger="${n}" data-birim="${br}" data-basamak="${bs}"`}>${deger(n, br, bs)}</td></tr>`;
  const pGram = b.porsiyon && b.porsiyon.gram ? b.porsiyon.gram : 100;
  const birim = veri.besinler.birimler;
  const sol = `<div class="yigin">
<div class="kart tasma-kapali" id="besinPorsiyon" data-slug="${b.slug}" data-ad="${kac(b.ad)}"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-table-list')} Besin Değerleri</h2></div>
<div class="kart-govde"><div class="alan-izgara c2"><div class="alan"><label class="alan-etiket" for="porsiyonGram">Miktar</label><div class="alan-birimli"><input class="alan-girdi" id="porsiyonGram" type="number" inputmode="decimal" min="1" max="2000" step="5" value="${pGram}"><span>g</span></div></div><div class="alan"><span class="alan-etiket" id="porsiyonHizliEtiket">Hızlı seçim</span><div class="cipler" id="porsiyonHizli" role="group" aria-labelledby="porsiyonHizliEtiket">${[...new Set([50, 100, 150, ...(b.porsiyon && b.porsiyon.gram ? [b.porsiyon.gram] : [])])].sort((x, y) => x - y).map((g) => `<button class="cip${g === pGram ? ' aktif' : ''}" type="button" data-gram="${g}">${b.porsiyon && b.porsiyon.gram === g ? kac(b.porsiyon.ad) + ' · ' : ''}${g} g</button>`).join('')}</div></div></div>
<p class="alan-yardim"><span>${b.porsiyon && b.porsiyon.gram ? `Kaynağın porsiyon ölçüsü: ${kac(b.porsiyon.ad)} = ${b.porsiyon.gram} g.` : 'Bu kayıtta adet, kase ya da dilim ölçüsü yayımlanmıyor; gramı kendin gir. Değerler 100 g kaydından orantılanır.'}</span></p></div>
<div class="tablo-kap cerceve-yok"><table class="tablo"><thead><tr><th>Besin ögesi</th><th class="sag"><span class="birim">100 g</span></th><th class="sag"><span class="birim" id="porsiyonBaslik">${pGram} g</span></th></tr></thead><tbody>
${psatir('Enerji', b.kcal, 'kcal', 0)}${psatir('Protein', b.protein)}${psatir('Yağ', b.yag)}${psatir('Doymuş yağ', b.doymus_yag)}${psatir(`Karbonhidrat (${b.karb_lif_dahil ? 'lif dahil' : 'lif hariç'})`, b.karb)}${psatir('Lif', b.lif)}${psatir('Şeker', b.seker)}
</tbody></table></div>
<div class="kart-govde ust-cizgili"><div class="alan"><label class="alan-etiket" for="besinOgun">Hangi öğünün?</label><select class="alan-secim" id="besinOgun"><option value="kahvalti">Kahvaltı</option><option value="ara1">Ara Öğün</option><option value="ogle" selected>Öğle Yemeği</option><option value="ara2">İkindi</option><option value="aksam">Akşam Yemeği</option></select></div><button class="dugme birincil tam-en" type="button" id="besinOgunEkle">${ikon('fa-calendar-plus')} Bugünkü öğünüme ekle</button><p class="sonuc-kayit" id="besinOgunDurum" role="status" hidden></p></div></div>
<div class="kart tasma-kapali"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-flask')} Vitamin ve Mineraller</h2><p>Bu kayıtta mikro değer yayımlanmıyor; kaynağı olmayan değer yazılmaz.</p></div></div><div class="tablo-kap cerceve-yok"><table class="tablo"><thead><tr><th>Besin ögesi</th><th class="sag"><span class="birim">100 g</span></th></tr></thead><tbody>${MIKRO.map(([k, a]) => satir(a, deger(b.mikrolar[k], birim[k], 2))).join('')}</tbody></table></div></div>
</div>`;
  const sag = `<div class="yigin yapiskan">
<div class="kart"><img class="kart-ust-gorsel" src="${K}assets/img/besin/avokado.webp" alt="Avokado"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-chart-pie')} Makro Dağılımı (100 G)</h2></div><div class="kart-govde yigin sik">${makro.map(([a, g, y]) => `<div class="olcu-satir"><span>${a}</span><div class="olcer hap"><span data-oran="${y}"></span></div><span>${deger(g)} · %${y}</span></div>`).join('')}<p class="alan-yardim"><span>Yüzdeler kaydın kendi enerji değeri (${bicim.kcal(b.kcal)}) taban alınarak hesaplanır: protein ve karbonhidrat 4 kcal/g, yağ 9 kcal/g. Bu kayıtta karbonhidrat lif hariç verildiği için lif üç dilimin dışında kalır; tabloda kendi satırında listelenir. Günlük ihtiyaç kişiye göre değişir.</span></p></div></div>
${kunyeKart('Kaynak', [['Veri tabanı', kac(b.kaynak.ad)], ['Kayıt kodu', kac(b.kaynak.kod)]], `<a class="dugme hayalet kucuk tam-en" href="${kac(b.kaynak.url)}" target="_blank" rel="noopener">${ikon('fa-arrow-up-right-from-square')} Kaydı aç</a><a class="dugme birincil kucuk tam-en" href="${K}besin-karsilastir/?a=${b.slug}">${ikon('fa-scale-balanced')} Başka besinle karşılaştır</a>`)}
${rk('AD-B1-SIDE', { tur: 'yan' })}<div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-heart')} Sık Tükettiklerin</h2></div><div class="kart-govde yigin sik"><p class="kart-metin">Favorilerin Akıllı Tabak'ın tek besin aramasında önce gelir.</p><button class="dugme hayalet kucuk tam-en" type="button" data-kaydet="besinler" data-slug="${b.slug}" data-ad="${kac(b.ad)}" data-ikon="fa-heart" data-etiket="Favori besinlerime ekle" data-etiket-tamam="Favori besinlerimde" data-tamam-metin="favori besinlerine eklendi.">${ikon('fa-heart')} Favori besinlerime ekle</button><a class="dugme hayalet kucuk tam-en" href="${K}akilli-tabak-ve-degisim/?besin=${b.slug}">${ikon('fa-chart-pie')} Tabağıma ekle</a></div></div>
</div>`;
  return sayfa('besin/avokado', 'Avokado',
    bant({ yol: [['Besin Kütüphanesi', 'besin-kutuphanesi/'], ['Avokado']], etiket: 'MEYVELER', etiketIkon: 'fa-apple-whole', h1: 'Avokado', alt: AVOKADO_OZET, gorsel: 'assets/img/besin/avokado-hero.webp', sayilar: [[sayi(b.kcal, 0), '<span class="birim">kcal / 100 g</span>'], [`${bicim.gram(b.yag)}`, 'yağ'], [`${sayi(b.lif, 1)} g`, 'lif']] })
    + dizi(bolum(`${ustSerit('AD-B1')}<div class="iki-kolon">${sol}${sag}</div>`, { ilk: true }), sonSerit('AD-B1-END')), { ...A, onJs: ['assets/js/misafir.js'], js: ['besin'] });
}

/* Kaç Kalori */
const kkKart = (y, kategoriSlug) => yatayKart({ href: DETAY.kacKalori, gorsel: y.gorsel_dosya ? icerik(y.gorsel_dosya) : `${K}${y.gorsel}`, ikon: y.ikon ?? 'fa-fire', baslik: kac(y.ad), metin: kac(y.ozet), etiket: kac(y.kategori), meta: `${y.okunma} okunma`, veri: ` data-kart${kategoriSlug ? ` data-kategori="${kategoriSlug(y.kategori)}"` : ''} data-okunma="${y.okunma}" data-ara="${araMetni(y.ad, y.ozet, y.kategori)}"` });
const siralama = `<div class="segment" role="group" aria-label="Sıralama" data-liste-sirala><button type="button" data-deger="yeni" aria-pressed="true">${ikon('fa-clock')} En Yeni</button><button type="button" data-deger="okunma" aria-pressed="false">${ikon('fa-fire')} En Çok Okunan</button></div>`;
const KK_UST_NOT = `<p class="liste-not">${ikon('fa-circle-info')}<span><span data-liste-sayac role="status"></span> Verilen değerler <b>ortalamadır</b>; ürün, çeşit ve pişirme biçimine göre değişir.</span></p>`;
const KK_IKON = { sebze: 'fa-carrot', pisirme: 'fa-fire-burner', icecek: 'fa-mug-hot', atistirmalik: 'fa-cookie-bite', ekmek: 'fa-bread-slice', et: 'fa-drumstick-bite', sut: 'fa-cheese', baklagil: 'fa-seedling', tatli: 'fa-candy-cane' };
const KK_NOT = 'Buradaki kalori değerleri <b>ortalamalardır</b> ve <b>genel bilgi amaçlıdır</b>; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi değildir. Ürün markası, besinin çeşidi, porsiyon ölçüsü ve pişirme biçimi rakamı değiştirir. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.';

function kacKalori(veri) {
  const k = veri.kac_kalori;
  const slug = (ad) => k.kategoriler.find((c) => c.ad === ad)?.slug ?? '';
  const dolu = new Set(k.yazilar.map((y) => y.kategori));
  const kalem = k.kategoriler.filter((c) => dolu.has(c.ad)).map((c) => ({ ad: c.ad, deger: c.slug, sayi: c.sayi, ikon: KK_IKON[c.slug], href: c.slug === 'sebze' ? 'kac-kalori/kategori/sebze/' : undefined }));
  const ust = `<div class="liste-satir">${cipler('kategori', 'Kaç kalori kategorisi', [{ ad: 'Tümü', deger: '', sayi: k.toplam, ikon: 'fa-layer-group' }, ...kalem], { sinif: 'serit' })}${aramaKutusu('kkAra', 'Yazılarda ara', 'Örneğin badem, ekmek')}${siralama}</div>`;
  return sayfa('kac-kalori', 'Kaç Kalori?',
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['Kaç Kalori?']], etiket: 'KAÇ KALORİ?', etiketIkon: 'fa-fire', h1: 'Bir porsiyon <span class="vurgu">tam olarak</span> ne kadar?', alt: 'Tek soruya tek cevap: bir besin ya da bir pişirme biçimi kaç kalori, o rakam hangi porsiyona karşılık geliyor, aynı işi gören başka bir seçenek kaç kalori.', gorsel: 'assets/img/hero/kac-kalori-canli.jpg', sayilar: [[k.toplam, 'yazı'], [k.kategoriler.length, 'kategori'], ['~2 dk', 'ortalama okuma']] })
    + dizi(bolum(liste({ toplam: k.toplam, birim: 'yazıdan', ust, ustNot: KK_UST_NOT, kapSinif: 'yatay-izgara', kartlar: k.yazilar.map((y) => kkKart(y, slug)).join(''), bosMetin: 'Aradığın kelime bu yazılarda geçmiyor. Farklı bir kelime dene ya da süzgeçleri temizle.' }) + bilgiNot(KK_NOT), { ilk: true })), L);
}

function kacKaloriKategori(veri) {
  const k = veri.kac_kalori;
  const kartlar = metin.kartlar['kac-kalori-sebze'].map((y) => kkKart(y)).join('');
  const kalem = [{ ad: 'Tümü', deger: 'tumu', sayi: k.toplam, href: 'kac-kalori/' }, ...k.kategoriler.filter((c) => k.yazilar.some((y) => y.kategori === c.ad)).map((c) => ({ ad: c.ad, deger: c.slug, sayi: c.sayi, href: c.slug === 'sebze' ? 'kac-kalori/kategori/sebze/' : `kac-kalori/?kategori=${c.slug}` }))];
  const ust = `<div class="liste-satir"><div class="cipler serit" role="group" aria-label="Kaç kalori kategorisi">${kalem.map((c) => `<a class="cip${c.deger === 'sebze' ? ' aktif' : ''}" href="${K}${c.href}"${c.deger === 'sebze' ? ' aria-current="page"' : ''}>${ikon(c.deger === 'tumu' ? 'fa-layer-group' : KK_IKON[c.deger] ?? 'fa-tag')} ${kac(c.ad)} <span class="cip-sayi">${c.sayi}</span></a>`).join('')}</div>${aramaKutusu('kkkAra', 'Yazılarda ara', 'Örneğin mango, marul')}${siralama}</div>`;
  return sayfa('kac-kalori/kategori/sebze', 'Sebze & Meyve',
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['Kaç Kalori?', 'kac-kalori/'], ['Sebze &amp; Meyve']], etiket: 'KAÇ KALORİ?', etiketIkon: 'fa-fire', h1: 'Sebze &amp; Meyve', alt: 'Meyvelerin ve sebzelerin porsiyon olarak ne ettiği, kabuğuyla yenmesiyle suyunun sıkılması arasında değerin nerede ayrıştığı bu başlıkta karşılaştırılır.', gorsel: 'assets/img/hero/kac-kalori-canli.jpg', sayilar: [[51, 'yazı'], ['~3 dk', 'ortalama okuma']] })
    + dizi(bolum(liste({ toplam: 51, birim: 'yazıdan', ust, ustNot: KK_UST_NOT, kapSinif: 'yatay-izgara', kartlar, bosMetin: 'Aradığın kelime bu yazılarda geçmiyor. Farklı bir kelime dene.' }) + bilgiNot(), { ilk: true })), L);
}

/* Makale iskeleti: kaç kalori, ipucu, püf ve makro detayı aynı kalıptır */
/* rk: reklam kancaları (ust: bant altı şerit, yan: kenar sütunu, govdeSonu: yazı gövdesinin ardı, ic: [başlık, html] o başlığın önüne, son: sayfa sonu) */
const makaleIc = (html, ic) => (ic ? html.replace(`<h2>${ic[0]}</h2>`, `${ic[1]}<h2>${ic[0]}</h2>`) : html);
const makale = ({ yol, baslik, bantV, m, yan, not = bilgiNot(), ilgiliHtml = '', rk: r = {} }) => sayfa(yol, baslik, bant(bantV) + dizi(bolum(`${r.ust ?? ''}<div class="iki-kolon"><div class="yigin"><article class="okuma">${makaleIc(bloklar(m.bloklar), r.ic)}</article>${r.govdeSonu ?? ''}${kaynakListe(m.kaynaklar)}${not}</div><aside class="yigin yan-sabit" aria-label="Yazı bilgileri">${yan}${r.yan ?? ''}</aside></div>`, { ilk: true }), ilgiliHtml, r.son ?? ''), A);

const ilgiliKart = (y, href, rozet, rozetIkon, git) => gorselKart({ href, gorsel: `${K}${y.gorsel}`, rozet: y.kategori ?? rozet, rozetIkon, baslik: kac(y.ad), metin: kac(y.ozet), not: y.meta?.[0] ?? '', git });

function kacKaloriDetay(veri) {
  const y = veri.kac_kalori.yazilar[0];
  return makale({
    yol: 'kac-kalori/bir-avuc-badem-kac-kalori', baslik: y.ad,
    bantV: { yol: [['Beslenme', 'besin-rehberi/'], ['Kaç Kalori?', 'kac-kalori/'], [kac(y.ad)]], etiket: 'KAÇ KALORİ?', etiketIkon: 'fa-fire', h1: kac(y.ad), alt: kac(y.ozet), gorsel: `assets/img/icerik/${y.gorsel_dosya}`, sayilar: [['180', '<span class="birim">kalori / 30 g</span>'], ['600', '<span class="birim">kcal / 100 g</span>'], ['30 g', 'bir avuç']] },
    m: metin.makale['kac-kalori-detay'],
    rk: { ic: ['Diğer kuruyemişlerle yan yana', rk('OB-FIRIN')] },
    yan: kunyeKart('Besin Kaydı', [['Kayıt', 'Badem (iç · kavrulmuş)'], ['Enerji', '600 kcal / 100 g'], ['Kaynak', 'TürKomp — Ulusal Gıda Kompozisyon Veri Tabanı'], ['Yayın', '13.08.2026'], ['Kategori', kac(y.kategori)]], paylas),
    ilgiliHtml: ilgili({ etiket: 'DEVAM ET', baslik: 'Bunlar da İşine Yarar', metin: 'Aynı mantıkla kurulmuş, yine iki dakikalık kalori soruları.', tumu: 'kac-kalori/', tumuAd: 'Tüm Yazılar', kartlar: metin.kartlar['ilgili-kac-kalori'].map((c) => ilgiliKart(c, DETAY.kacKalori, 'Kaç Kalori?', 'fa-fire', 'Oku')).join('') }),
  });
}

const rehberKart = ({ href, y }) => gorselKart({ href, gorsel: `${K}${y.gorsel}`, baslik: kac(y.ad), metin: kac(y.ozet), not: `${ikon('fa-book-open')} Rehber`, git: 'Rehberi Aç', sinif: 'buyuk ayrac-alt' });
const HUB_ALT = { 'kac-kalori': 'kacKalori', ipucu: 'ipucu', puf: 'puf' };
const hubKart = (veri) => (y) => {
  const s = y.yol.split('/').pop();
  const aile = veri.kac_kalori.yazilar.some((x) => x.slug === s) ? 'kac-kalori' : veri.ipuclari.ipuclari.some((x) => x.slug === s) ? 'ipucu' : veri.puflar.puflar.some((x) => x.slug === s) ? 'puf' : null;
  return rehberKart({ href: aile ? DETAY[HUB_ALT[aile]] : DETAY.rehber, y });
};

function besinRehberi(veri) {
  const s = veri.sayaclar;
  const kartlar = metin.kartlar['besin-rehberi'];
  return sayfa('besin-rehberi', 'Beslenme Rehberi',
    bant({ yol: [['Beslenme Rehberi']], etiket: 'BESLENME', h1: 'Ne yediğini <span class="vurgu">bil</span>, nasıl besleneceğini öğren', alt: 'Yayınlanmış besin değerleri ve uygulanabilir beslenme bilgisi tek merkezde.', gorsel: 'assets/img/hero/besin-rehberi-canli.avif', sayilar: [[s.icerik_toplam, 'yayınlanmış rehber'], ['5', 'içerik ailesi']] })
    + dizi(
      bolum(`${ustSerit('MG-B1')}${bolumBas({ etiket: 'BESLENME REHBERİ', ikon: 'fa-book-open', baslik: 'Nereden Başlamak İstersin?', metin: 'Hesap yapmadan önce mantığı anla: dengeli tabak, öğün planı, porsiyon, alışveriş, mutfak alışkanlıkları, içecekler, dışarıda yemek ve ara öğünler. Sade, genel ve suçlamasız bir rehber; her başlık kısa ve uygulanabilir, sırayla okumak zorunda değilsin.' })}<div class="kart-izgara c3">${kartlar.map(hubKart(veri)).join('')}${rk('MG-N1', { tur: 'sonuc', sira: 1 })}</div><p class="liste-aralik">${s.icerik_toplam} rehberden 1–${kartlar.length} arası gösteriliyor</p>${rk('MG-B1-SIDE', { tur: 'yan' })}${bilgiNot('Bu sayfadaki içerikler <b>genel bilgi amaçlıdır</b>; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi değildir. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.')}`, { ilk: true }),
    ), A);
}

function dengeliTabak() {
  const d = metin.dengeli;
  const y = metin.kartlar['besin-rehberi'][0];
  return sayfa('besin-rehberi/dengeli-tabak', 'Dengeli Tabak',
    bant({ yol: [['Beslenme Rehberi', 'besin-rehberi/'], ['Dengeli Tabak']], etiket: 'BESLENME REHBERİ', etiketIkon: 'fa-book-open', h1: 'Dengeli Tabak', alt: 'Beslenmeyi karmaşık kurallara dönüştürmeden, tabağına bakarak sağlıklı bir denge kurmanın yolları.', gorsel: y.gorsel })
    + dizi(
      bolum(`${ustSerit('MD-B1', 'MD-READ')}${bolumBas({ etiket: 'BU REHBERDE', ikon: 'fa-list-check', baslik: 'Dengeli Tabağın Temelleri', metin: 'Dört soruda dengeli tabak: oran mantığı, besin gruplarının dengesi, ev porsiyonu ve sade akşam yemeği.' })}
<div class="iki-kolon"><div class="yigin">${akordeon(d.qa.map((q, i) => ({ soru: q.soru, ikon: 'fa-utensils', acik: i === 0, govde: `<div class="okuma">${bloklar(q.bloklar.map((b, j, l) => (b.t === 'p' && l[j + 1]?.t === 'ul' ? { ...b, t: 'h3' } : b)))}</div>` })))}<p class="sonuc-not-kisa">${d.dip[0]}</p>${bilgiNot()}</div>
<aside class="yigin yan-sabit" aria-label="İlgili araç"><div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-chart-pie')} Tabağını Şimdi Kur</h2></div><div class="kart-govde yigin sik"><p class="kart-metin">Tabağını kur, muadilini bul: bölmeler doldukça denge skorun hemen değişir.</p>${dugme('Akıllı Tabak ve Değişim', 'akilli-tabak-ve-degisim/', 'birincil tam-en', 'fa-arrow-right', true)}</div></div>${kunyeKart('Bu Rehber', [['Başlık', '4 soru'], ['Kaynak', 'TÜBER 2022']], paylas)}${rk('MD-READ-SIDE', { tur: 'yan' })}</aside></div>`, { ilk: true }),
      ilgili({ etiket: 'SIRADA', baslik: 'Bunlar da İşine Yarar', metin: 'Aynı konuya yakın diğer rehber sayfaları.', tumu: 'besin-rehberi/', tumuAd: 'Tüm Rehberler', kartlar: metin.kartlar['ilgili-rehber'].map((c) => ilgiliKart(c, DETAY.rehber, 'Rehber', 'fa-book-open', 'Rehberi Aç')).join('') }),
      sonSerit('MD-B1-END', 'MD-READ-END'),
    ), A);
}

function makroRehberi(veri) {
  const kart = (y) => rehberKart({ href: DETAY.makro, y });
  return sayfa('makro-rehberi', 'Makro Rehberi',
    bant({ yol: [['Beslenme Rehberi', 'besin-rehberi/'], ['Makro Rehberi']], etiket: 'MAKRO REHBERİ', etiketIkon: 'fa-chart-pie', h1: 'Protein, karbonhidrat, yağ ve lif rehberi', alt: 'Makroların ne anlattığını, hangi besinde bulunduğunu ve etikette nasıl okunduğunu kaynaklarıyla anlatan yazılar.', gorsel: 'assets/img/hero/makro-rehberi-reh-hero.jpg', sayilar: [[veri.sayaclar.makro_rehberi, 'yayınlanmış rehber'], ['~4 dk', 'ortalama okuma']] })
    + dizi(bolum(`${ustSerit('SZ-B1')}${bolumBas({ etiket: 'MAKRO REHBERİ', ikon: 'fa-chart-pie', baslik: 'Hangi Makroyla Başlamak İstersin?', metin: `${veri.sayaclar.makro_rehberi} rehberden 12 tanesi gösteriliyor.` })}<div class="kart-izgara c3">${metin.kartlar['makro-rehberi'].map(kart).join('')}${rk('SZ-N1', { tur: 'sonuc', sira: 4 })}</div>${bilgiNot('Bu sayfadaki içerikler <b>genel bilgi amaçlıdır</b>; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi değildir. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.')}`, { ilk: true }), sonSerit('SZ-B1-END')), A);
}

function makroDetay() {
  const y = metin.kartlar['makro-rehberi'][1];
  return makale({
    yol: 'makro-rehberi/protein-kaynaklari-hayvansal-bitkisel', baslik: y.ad,
    bantV: { yol: [['Beslenme Rehberi', 'besin-rehberi/'], ['Makro Rehberi', 'makro-rehberi/'], [kac(y.ad)]], etiket: 'BESİN DEĞERLERİ', etiketIkon: 'fa-chart-pie', h1: kac(y.ad), alt: kac(y.ozet), gorsel: y.gorsel },
    m: metin.makale['makro-rehberi-detay'],
    rk: { ust: ustSerit('ZD-B1'), son: sonSerit('ZD-B1-END') },
    yan: kunyeKart('Bu Yazı', [['Aile', 'Makro Rehberi'], ['Okuma', '~4 dk'], ['Kaynak', 'TÜBER 2022']], `${paylas}${dugme('Besin Kütüphanesi', 'besin-kutuphanesi/', 'birincil kucuk tam-en', 'fa-arrow-right', true)}`),
  });
}

/* İpuçları ve püf noktaları: tek kütüphane */
const IP_IKON = { porsiyon: 'fa-scale-balanced', ogun: 'fa-clock', alisveris: 'fa-cart-shopping', pisirme: 'fa-fire-burner', su: 'fa-glass-water', hazirlik: 'fa-list-check', saklama: 'fa-box-archive', aliskanlik: 'fa-repeat', olcu: 'fa-ruler' };
function kutuphane(veri) {
  const { ipuclari: ip, puflar: pu, sayaclar: s } = veri;
  const ks = (l, ad) => l.find((c) => c.ad === ad)?.slug ?? '';
  const kart = (tur) => (y) => {
    const ipucu = tur === 'ipucu';
    return yatayKart({ href: ipucu ? DETAY.ipucu : DETAY.puf, gorsel: icerik(y.gorsel_dosya), ikon: y.ikon ?? (ipucu ? 'fa-lightbulb' : 'fa-wand-magic-sparkles'), baslik: kac(y.ad), metin: kac(y.ozet), etiket: `${ipucu ? 'İpucu' : 'Püf Noktası'} · ${kac(y.kategori)}`, meta: `${y.okuma_dk ? `~${y.okuma_dk} dk · ` : ''}${y.okunma} okunma`, metaIkon: y.okuma_dk ? 'fa-clock' : 'fa-eye', veri: ` data-kart data-tur="${tur}" data-kategori="${ks(ipucu ? ip.kategoriler : pu.kategoriler, y.kategori)}" data-okunma="${y.okunma}" data-ara="${araMetni(y.ad, y.ozet, y.kategori)}"` });
  };
  const a = ip.ipuclari.map(kart('ipucu')), b = pu.puflar.map(kart('puf'));
  const karisik = a.flatMap((x, i) => [x, b[i]].filter(Boolean)).map((h, i) => (i >= 12 ? h.replace(' data-kart', ' data-kart hidden') : h)).join('');
  const toplam = s.ipucu + s.puf;
  const ust = `<div class="liste-satir">${cipler('tur', 'İçerik türü', [{ ad: 'Tümü', deger: '', sayi: toplam, ikon: 'fa-layer-group' }, { ad: 'İpucu', deger: 'ipucu', sayi: s.ipucu, ikon: 'fa-lightbulb' }, { ad: 'Püf Noktası', deger: 'puf', sayi: s.puf, ikon: 'fa-wand-magic-sparkles' }], { sinif: 'serit' })}${aramaKutusu('ipAra', 'İpucu ve püf noktası ara', 'Örneğin su, porsiyon, buzdolabı')}${siralama}</div>
${cipler('kategori', 'Kategori', [{ ad: 'Tüm kategoriler', deger: '', sayi: toplam, ikon: 'fa-layer-group' }, ...ip.kategoriler.map((c) => ({ ad: c.ad, deger: c.slug, sayi: c.sayi, tur: 'ipucu', ikon: IP_IKON[c.slug], href: c.slug === IP_KATEGORI ? `${IP_KATEGORI_YOL}/` : undefined })), ...pu.kategoriler.map((c) => ({ ad: c.ad, deger: c.slug, sayi: c.sayi, tur: 'puf', ikon: IP_IKON[c.slug] }))], { sinif: 'serit' })}`;
  return sayfa('ipuclari-ve-puf-noktalari', 'İpuçları & Püf Noktaları',
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['İpuçları ve Püf Noktaları']], etiket: 'BESLENME İPUÇLARI VE PÜF NOKTALARI', etiketIkon: 'fa-lightbulb', h1: 'Küçük değişiklikler, <span class="vurgu">kalıcı</span> alışkanlıklar', alt: 'Uzun rehber okumaya vaktin yoksa buradan başla. Her yazı tek bir soruyu yanıtlar, kısa sürede okunur ve bugün uygulanabilir.', gorsel: 'assets/img/hero/beslenme-ipuclari-canli.avif', sayilar: [[s.ipucu, 'ipucu'], [s.puf, 'püf noktası'], [ip.kategoriler.length + pu.kategoriler.length, 'kategori']] })
    + dizi(bolum(ustSerit('PL-B1', 'MG-KONU') + liste({ toplam, birim: 'yazıdan', ust, kapSinif: 'yatay-izgara', kartlar: karisik + rk('PL-N1', { tur: 'yatay', sira: 4 }), bosMetin: 'Aradığın kelime bu yazılarda geçmiyor. Farklı bir kelime dene ya da süzgeçleri temizle.' }) + bilgiNot('Buradaki ipuçları ve püf noktaları pratik bilgilerdir ve <b>genel bilgi amaçlıdır</b>; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi değildir. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.'), { ilk: true }), sonSerit('PL-B1-END', 'MG-KONU-END')), L);
}

/* İpucu kategori sayfası (canlı /ipuclari/kategori/{k}, aile-liste.blade.php): kaç kalori kategorisi gibi tek örnek kategori.
   Reklam: canlı "rehber-kategori" yayılımı (config/reklam-yayilim.php): üst şerit MG-ROTA, sayfa sonu MG-ROTA-END.
   Başlık, açıklama ve sayaçlar canlı sayfadan (dadadiet.com/ipuclari/kategori/ogun, 9 Kasım GET); kartlar örnek kayıtlardan. */
const IP_KATEGORI = 'ogun';
const IP_KATEGORI_YOL = 'ipuclari-ve-puf-noktalari/kategori/ogun';
function ipucuKategori(veri) {
  const ip = veri.ipuclari;
  const k = ip.kategoriler.find((c) => c.slug === IP_KATEGORI);
  const kartlar = ip.ipuclari.filter((y) => y.kategori === k.ad).map((y) => yatayKart({ href: DETAY.ipucu, gorsel: icerik(y.gorsel_dosya), ikon: y.ikon ?? 'fa-lightbulb', baslik: kac(y.ad), metin: kac(y.ozet), etiket: `İpucu · ${kac(y.kategori)}`, meta: `${y.okuma_dk ? `~${y.okuma_dk} dk · ` : ''}${y.okunma} okunma`, metaIkon: y.okuma_dk ? 'fa-clock' : 'fa-eye', veri: ` data-kart data-okunma="${y.okunma}" data-ara="${araMetni(y.ad, y.ozet, y.kategori)}"` })).join('');
  const kalem = [{ ad: 'Tümü', deger: 'tumu', href: 'ipuclari-ve-puf-noktalari/?tur=ipucu' }, ...ip.kategoriler.map((c) => ({ ad: c.ad, deger: c.slug, sayi: c.sayi, href: c.slug === IP_KATEGORI ? `${IP_KATEGORI_YOL}/` : `ipuclari-ve-puf-noktalari/?tur=ipucu&kategori=${c.slug}` }))];
  const ust = `<div class="liste-satir"><div class="cipler serit" role="group" aria-label="İpucu kategorisi">${kalem.map((c) => `<a class="cip${c.deger === IP_KATEGORI ? ' aktif' : ''}" href="${K}${c.href}"${c.deger === IP_KATEGORI ? ' aria-current="page"' : ''}>${ikon(c.deger === 'tumu' ? 'fa-layer-group' : IP_IKON[c.deger] ?? 'fa-tag')} ${kac(c.ad)}${c.sayi !== undefined ? ` <span class="cip-sayi">${c.sayi}</span>` : ''}</a>`).join('')}</div>${aramaKutusu('ipkAra', 'Yazılarda ara', 'Örneğin kahvaltı, ara öğün')}${siralama}</div>`;
  return sayfa(IP_KATEGORI_YOL, k.ad,
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['İpuçları ve Püf Noktaları', 'ipuclari-ve-puf-noktalari/'], [kac(k.ad)]], etiket: 'BESLENME İPUÇLARI', etiketIkon: 'fa-lightbulb', h1: kac(k.ad), alt: 'Kahvaltı atlanınca günün nasıl değiştiği, akşam geç yemenin neyi etkilediği ve öğün arasının ne kadar açık kalabileceği gibi kısa sorular bu başlıkta toplanır.', gorsel: 'assets/img/hero/beslenme-ipuclari-canli.avif', sayilar: [[k.sayi, 'yazı'], ['~2 dk', 'ortalama okuma']] })
    + dizi(bolum(ustSerit('MG-ROTA') + liste({ toplam: k.sayi, birim: 'yazıdan', ust, kapSinif: 'yatay-izgara', kartlar, bosMetin: 'Aradığın kelime bu yazılarda geçmiyor. Farklı bir kelime dene.' }) + bilgiNot('Buradaki ipuçları pratik bilgilerdir ve <b>genel bilgi amaçlıdır</b>; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi değildir.'), { ilk: true }), sonSerit('MG-ROTA-END')), L);
}

function ipucuDetay(veri) {
  const y = veri.ipuclari.ipuclari.find((x) => x.slug === 'gunde-ne-kadar-su-icmek-gerekir');
  return makale({
    yol: 'ipuclari/gunde-ne-kadar-su-icmek-gerekir', baslik: y.ad,
    bantV: { yol: [['Beslenme', 'besin-rehberi/'], ['İpuçları ve Püf Noktaları', 'ipuclari-ve-puf-noktalari/'], [kac(y.ad)]], etiket: 'BESLENME İPUCU', etiketIkon: 'fa-lightbulb', h1: kac(y.ad), alt: kac(y.ozet), gorsel: `assets/img/icerik/${y.gorsel_dosya}` },
    m: metin.makale['ipuclari-detay'],
    rk: { ust: ustSerit('PD-END'), govdeSonu: rk('PD-R1', { tur: 'yan' }), son: sonSerit('PD-END-END') },
    yan: kunyeKart('Bu Yazı', [['Yayın', '22.08.2026'], ['Kategori', kac(y.kategori)], ['Okuma', `~${y.okuma_dk} dk`], ['Okunma', y.okunma]], paylas),
    ilgiliHtml: ilgili({ etiket: 'SIRADA', baslik: 'Bunlar da İşine Yarar', metin: 'Aynı konuya yakın, yine iki dakikalık ipuçları.', tumu: 'ipuclari-ve-puf-noktalari/?tur=ipucu', tumuAd: 'Tüm İpuçları', kartlar: metin.kartlar['ilgili-ipucu'].map((c) => ilgiliKart(c, DETAY.ipucu, 'İpucu', 'fa-lightbulb', 'Oku')).join('') }),
  });
}

function pufDetay(veri) {
  const y = veri.puflar.puflar.find((x) => x.slug === 'buzdolabinda-hangi-raf-neye-ait');
  return makale({
    yol: 'puflar/buzdolabinda-hangi-raf-neye-ait', baslik: y.ad,
    bantV: { yol: [['Beslenme', 'besin-rehberi/'], ['İpuçları ve Püf Noktaları', 'ipuclari-ve-puf-noktalari/'], [kac(y.ad)]], etiket: 'PÜF NOKTASI', etiketIkon: 'fa-wand-magic-sparkles', h1: kac(y.ad), alt: kac(y.ozet), gorsel: `assets/img/icerik/${y.gorsel_dosya}` },
    m: metin.makale['puflar-detay'],
    yan: kunyeKart('Bu Yazı', [['Yayın', '13.08.2026'], ['Kategori', kac(y.kategori)], ['Okunma', y.okunma]], paylas),
    ilgiliHtml: ilgili({ etiket: 'DEVAM ET', baslik: 'Bunlar da İşine Yarar', metin: 'Aynı mantıkla kurulmuş, mutfakta karşılığı olan diğer püf noktaları.', tumu: 'ipuclari-ve-puf-noktalari/?tur=puf', tumuAd: 'Tüm Yazılar', kartlar: metin.kartlar['ilgili-puf'].map((c) => ilgiliKart(c, DETAY.puf, 'Püf Noktası', 'fa-wand-magic-sparkles', 'Oku')).join('') }),
  });
}

export default ({ veri }) => [besinKutuphanesi(veri), besinDetay(veri), kacKalori(veri), kacKaloriKategori(veri), kacKaloriDetay(veri), besinRehberi(veri), dengeliTabak(), makroRehberi(veri), makroDetay(), kutuphane(veri), ipucuKategori(veri), ipucuDetay(veri), pufDetay(veri)];
