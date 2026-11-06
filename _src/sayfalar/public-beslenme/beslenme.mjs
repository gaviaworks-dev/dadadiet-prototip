// Beslenme alanı: besin kütüphanesi, kaç kalori, rehberler, ipuçları ve püf noktaları.
import { K, kac, ikon, icerik, bant, bolumBas, dugme, bolum, gorselKart, ikonKart, metin, DETAY, sayfa, dizi, sayi, deger, araMetni, bilgiNot, cipler, aramaKutusu, liste, ilgili, bloklar, kaynakListe, kunyeKart, paylas, akordeon } from '../../parcalar/public-beslenme/ortak.mjs';
import { bicim } from '../../parcalar/bicim.mjs';

const A = { aktif: 'Beslenme' };
const L = { ...A, js: ['liste'] };

const BESIN_IKON = { Sebzeler: 'fa-carrot', Meyveler: 'fa-apple-whole', 'Et & Tavuk': 'fa-drumstick-bite', 'Balık & Deniz': 'fa-fish', Baklagiller: 'fa-seedling', Tahıllar: 'fa-wheat-awn', 'Süt Ürünleri & Yumurta': 'fa-cheese', Kuruyemiş: 'fa-cookie-bite', 'Yağlar & Soslar': 'fa-bottle-droplet', 'Tatlılar & Atıştırmalıklar': 'fa-candy-cane' };
/* Canlı sekme sayıları (541'e toplanır). Örnek kaydı olmayan Baharatlar ve İçecekler çipte gösterilmez. */
const BESIN_SAYI = { Sebzeler: 74, Meyveler: 50, 'Et & Tavuk': 65, 'Balık & Deniz': 49, Baklagiller: 32, Tahıllar: 62, 'Süt Ürünleri & Yumurta': 62, Kuruyemiş: 31, 'Yağlar & Soslar': 27, 'Tatlılar & Atıştırmalıklar': 75 };

const besinKart = (b, i) => `<article class="kart" data-kart data-kategori="${b.kategori_kodu}" data-ara="${araMetni(b.ad, b.kategori)}"${i >= 12 ? ' hidden' : ''}>
<div class="kart-bas"><div class="kart-bas-sol"><span class="ikon-kutu">${ikon(BESIN_IKON[b.kategori] ?? 'fa-leaf')}</span><div><h3 class="kart-baslik">${kac(b.ad)}</h3><p>${kac(b.kategori)} · 100 g</p></div></div><span class="deger-vurgu">${b.kcal === null ? '<span class="veri-yok">veri yok</span>' : `${sayi(b.kcal, 0)} <small>kcal</small>`}</span></div>
<div class="kart-govde"><dl class="kunye uc-sutun"><div><dt>Protein</dt><dd>${deger(b.protein, 'g', 1)}</dd></div><div><dt>Karb.</dt><dd>${deger(b.karb, 'g', 1)}</dd></div><div><dt>Yağ</dt><dd>${deger(b.yag, 'g', 1)}</dd></div></dl></div>
<div class="kart-alt">${dugme('İncele', DETAY.besin, 'hayalet kucuk', 'fa-arrow-right', true)}<a class="dugme hayalet kucuk" href="${K}besin-karsilastir/?a=${b.slug}">${ikon('fa-scale-balanced')} Karşılaştır</a></div>
</article>`;

function besinKutuphanesi(veri) {
  const l = [...veri.besinler.besinler].sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
  const kodlar = new Map(l.map((b) => [b.kategori, b.kategori_kodu]));
  const kalem = Object.keys(BESIN_SAYI).filter((k) => kodlar.has(k)).map((k) => ({ ad: k, deger: kodlar.get(k), sayi: BESIN_SAYI[k], ikon: BESIN_IKON[k] }));
  const ust = `<div class="liste-arac">${aramaKutusu('besinAra', 'Besin ara', 'Örneğin avokado, kinoa, yoğurt')}${dugme('Besin Karşılaştır', 'besin-karsilastir/', 'birincil', 'fa-scale-balanced')}</div>${cipler('kategori', 'Besin kategorisi', [{ ad: 'Tümü', deger: '', sayi: veri.sayaclar.besin, ikon: 'fa-layer-group' }, ...kalem])}`;
  return sayfa('besin-kutuphanesi', 'Besin Kütüphanesi',
    bant({ yol: [['Besin Kütüphanesi']], etiket: 'BESİN KÜTÜPHANESİ', etiketIkon: 'fa-magnifying-glass', h1: 'Besin değerlerini keşfet', alt: `${veri.sayaclar.besin} besinin kalori, protein, yağ ve karbonhidrat değerini ara; her değerin hangi kaynaktan geldiğini gör.`, gorsel: 'assets/img/hero/besin-kutuphanesi-nb-top.webp', sayilar: [[veri.sayaclar.besin, 'besin değeri'], ['12', 'kategori'], ['100 g', 'referans ölçü']] })
    + dizi(bolum(liste({ toplam: veri.sayaclar.besin, birim: 'besinden', ust, kartlar: l.map(besinKart).join(''), bosMetin: 'Aradığın besin bu listede yok. Farklı bir kelime dene ya da süzgeçleri temizle.' }) + bilgiNot(), { ilk: true })), L);
}

const AVOKADO_OZET = 'Tekli doymamış yağ ve lif açısından zengin taze meyve.';
const MIKRO = [['sodyum', 'Sodyum'], ['potasyum', 'Potasyum'], ['kalsiyum', 'Kalsiyum'], ['demir', 'Demir'], ['magnezyum', 'Magnezyum'], ['cinko', 'Çinko'], ['fosfor', 'Fosfor'], ['a_vit', 'A vitamini'], ['c_vit', 'C vitamini'], ['d_vit', 'D vitamini'], ['b12', 'B12 vitamini'], ['folat', 'Folat'], ['kolesterol', 'Kolesterol']];

function besinDetay(veri) {
  const b = veri.besinler.besinler.find((x) => x.slug === 'avokado');
  const yuzde = (kcal) => Math.round((kcal / b.kcal) * 100);
  const makro = [['Protein', b.protein, yuzde(b.protein * 4)], ['Karbonhidrat', b.karb, yuzde(b.karb * 4)], ['Yağ', b.yag, yuzde(b.yag * 9)]];
  const satir = (a, v) => `<tr><th scope="row">${a}</th><td class="sag">${v}</td></tr>`;
  const birim = veri.besinler.birimler;
  const sol = `<div class="yigin">
<div class="kart tasma-kapali"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-table-list')} Besin Değerleri · 100 g</h2></div><div class="tablo-kap cerceve-yok"><table class="tablo"><thead><tr><th>Besin ögesi</th><th class="sag"><span class="birim">100 g</span></th></tr></thead><tbody>
${satir('Enerji', deger(b.kcal, 'kcal', 0))}${satir('Protein', deger(b.protein))}${satir('Yağ', deger(b.yag))}${satir('Doymuş yağ', deger(b.doymus_yag))}${satir(`Karbonhidrat (${b.karb_lif_dahil ? 'lif dahil' : 'lif hariç'})`, deger(b.karb))}${satir('Lif', deger(b.lif))}${satir('Şeker', deger(b.seker))}
</tbody></table></div></div>
<div class="kart tasma-kapali"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-flask')} Vitamin ve mineraller</h2><p>Bu kayıtta mikro değer yayımlanmıyor; kaynağı olmayan değer yazılmaz.</p></div></div><div class="tablo-kap cerceve-yok"><table class="tablo"><thead><tr><th>Besin ögesi</th><th class="sag"><span class="birim">100 g</span></th></tr></thead><tbody>${MIKRO.map(([k, a]) => satir(a, deger(b.mikrolar[k], birim[k], 2))).join('')}</tbody></table></div></div>
</div>`;
  const sag = `<div class="yigin yapiskan">
<div class="kart"><img class="kart-ust-gorsel" src="${K}assets/img/besin/avokado.webp" alt="Avokado"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-chart-pie')} Makro Dağılımı (100 g)</h2></div><div class="kart-govde yigin sik">${makro.map(([a, g, y]) => `<div class="olcu-satir"><span>${a}</span><div class="olcer hap"><span data-oran="${y}"></span></div><span>${deger(g)} · %${y}</span></div>`).join('')}<p class="alan-yardim"><span>Yüzdeler kaydın kendi enerji değeri (${bicim.kcal(b.kcal)}) taban alınarak hesaplanır: protein ve karbonhidrat 4 kcal/g, yağ 9 kcal/g. Bu kayıtta karbonhidrat lif hariç verildiği için lif üç dilimin dışında kalır; tabloda kendi satırında listelenir. Günlük ihtiyaç kişiye göre değişir.</span></p></div></div>
${kunyeKart('Kaynak', [['Veri tabanı', kac(b.kaynak.ad)], ['Kayıt kodu', kac(b.kaynak.kod)]], `<a class="dugme hayalet kucuk tam-en" href="${kac(b.kaynak.url)}" target="_blank" rel="noopener">${ikon('fa-arrow-up-right-from-square')} Kaydı aç</a><a class="dugme birincil kucuk tam-en" href="${K}besin-karsilastir/?a=${b.slug}">${ikon('fa-scale-balanced')} Başka besinle karşılaştır</a>`)}
</div>`;
  return sayfa('besin/avokado', 'Avokado',
    bant({ yol: [['Besin Kütüphanesi', 'besin-kutuphanesi/'], ['Avokado']], etiket: 'MEYVELER', etiketIkon: 'fa-apple-whole', h1: 'Avokado', alt: AVOKADO_OZET, gorsel: 'assets/img/besin/avokado-hero.webp', sayilar: [[sayi(b.kcal, 0), '<span class="birim">kcal / 100 g</span>'], [`${bicim.gram(b.yag)}`, 'yağ'], [`${sayi(b.lif, 1)} g`, 'lif']] })
    + dizi(bolum(`<div class="iki-kolon">${sol}${sag}</div>${bilgiNot('Bu sayfadaki içerik genel bilgilendirme amaçlıdır; <b>tıbbi teşhis veya tedavi yerine geçmez</b>. Kişiye özel beslenme planı yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır. Gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.', false)}`, { ilk: true })), A);
}

/* Kaç Kalori */
const kkKart = (y, i, kategoriSlug) => gorselKart({ href: DETAY.kacKalori, gorsel: y.gorsel_dosya ? icerik(y.gorsel_dosya) : `${K}${y.gorsel}`, rozet: y.kategori, rozetIkon: y.ikon?.replace('fa-solid ', ''), baslik: kac(y.ad), metin: kac(y.ozet), not: `${y.okunma} okunma`, git: 'Oku', sinif: 'buyuk', veri: ` data-kart data-kategori="${kategoriSlug(y.kategori)}" data-okunma="${y.okunma}" data-ara="${araMetni(y.ad, y.ozet, y.kategori)}"` });
const siralama = `<div class="segment" role="group" aria-label="Sıralama" data-liste-sirala><button type="button" data-deger="yeni" aria-pressed="true">En Yeni</button><button type="button" data-deger="okunma" aria-pressed="false">En Çok Okunan</button></div>`;
const KK_NOT = 'Buradaki kalori değerleri <b>ortalamalardır</b> ve <b>genel bilgi amaçlıdır</b>; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi değildir. Ürün markası, besinin çeşidi, porsiyon ölçüsü ve pişirme biçimi rakamı değiştirir. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.';

function kacKalori(veri) {
  const k = veri.kac_kalori;
  const slug = (ad) => k.kategoriler.find((c) => c.ad === ad)?.slug ?? '';
  const dolu = new Set(k.yazilar.map((y) => y.kategori));
  const kalem = k.kategoriler.filter((c) => dolu.has(c.ad)).map((c) => ({ ad: c.ad, deger: c.slug, sayi: c.sayi, href: c.slug === 'sebze' ? 'kac-kalori/kategori/sebze/' : undefined }));
  const ust = `<div class="liste-arac">${aramaKutusu('kkAra', 'Yazılarda ara', 'Örneğin badem, ekmek, kaşık')}${siralama}</div>${cipler('kategori', 'Kaç kalori kategorisi', [{ ad: 'Tümü', deger: '', sayi: k.toplam }, ...kalem])}`;
  return sayfa('kac-kalori', 'Kaç Kalori?',
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['Kaç Kalori?']], etiket: 'KAÇ KALORİ?', etiketIkon: 'fa-fire', h1: 'Bir porsiyon <span class="vurgu">tam olarak</span> ne kadar?', alt: 'Tek soruya tek cevap: bir besin ya da bir pişirme biçimi kaç kalori, o rakam hangi porsiyona karşılık geliyor, aynı işi gören başka bir seçenek kaç kalori.', gorsel: 'assets/img/hero/kac-kalori-reh-hero.jpg', sayilar: [[k.toplam, 'yazı'], [k.kategoriler.length, 'kategori'], ['~2 dk', 'ortalama okuma']] })
    + dizi(bolum(liste({ toplam: k.toplam, birim: 'yazıdan', ust, kartlar: k.yazilar.map((y, i) => kkKart(y, i, slug)).join(''), bosMetin: 'Aradığın kelime bu yazılarda geçmiyor. Farklı bir kelime dene ya da süzgeçleri temizle.' }) + bilgiNot(KK_NOT), { ilk: true })), L);
}

function kacKaloriKategori(veri) {
  const k = veri.kac_kalori;
  const kartlar = metin.kartlar['kac-kalori-sebze'].map((y) => gorselKart({ href: DETAY.kacKalori, gorsel: `${K}${y.gorsel}`, rozet: y.kategori, rozetIkon: y.ikon?.replace('fa-solid ', ''), baslik: kac(y.ad), metin: kac(y.ozet), not: `${y.okunma} okunma`, git: 'Oku', sinif: 'buyuk', veri: ` data-kart data-okunma="${y.okunma}" data-ara="${araMetni(y.ad, y.ozet)}"` })).join('');
  const kalem = [{ ad: 'Tümü', deger: 'tumu', sayi: k.toplam, href: 'kac-kalori/' }, ...k.kategoriler.filter((c) => k.yazilar.some((y) => y.kategori === c.ad)).map((c) => ({ ad: c.ad, deger: c.slug, sayi: c.sayi, href: c.slug === 'sebze' ? 'kac-kalori/kategori/sebze/' : `kac-kalori/?kategori=${c.slug}` }))];
  const ust = `<div class="liste-arac">${aramaKutusu('kkkAra', 'Yazılarda ara', 'Örneğin mango, marul, kâse')}${siralama}</div><div class="cipler dar-kayar" role="group" aria-label="Kaç kalori kategorisi">${kalem.map((c) => `<a class="cip${c.deger === 'sebze' ? ' aktif' : ''}" href="${K}${c.href}"${c.deger === 'sebze' ? ' aria-current="page"' : ''}>${kac(c.ad)} <span class="cip-sayi">${c.sayi}</span></a>`).join('')}</div>`;
  return sayfa('kac-kalori/kategori/sebze', 'Sebze & Meyve',
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['Kaç Kalori?', 'kac-kalori/'], ['Sebze &amp; Meyve']], etiket: 'KAÇ KALORİ?', etiketIkon: 'fa-fire', h1: 'Sebze &amp; Meyve', alt: 'Meyvelerin ve sebzelerin porsiyon olarak ne ettiği, kabuğuyla yenmesiyle suyunun sıkılması arasında değerin nerede ayrıştığı bu başlıkta karşılaştırılır.', gorsel: 'assets/img/hero/kac-kalori-reh-hero.jpg', sayilar: [[51, 'yazı'], ['~3 dk', 'ortalama okuma']] })
    + dizi(bolum(liste({ toplam: 51, birim: 'yazıdan', ust, kartlar, bosMetin: 'Aradığın kelime bu yazılarda geçmiyor. Farklı bir kelime dene.' }) + bilgiNot(), { ilk: true })), L);
}

/* Makale iskeleti: kaç kalori, ipucu, püf ve makro detayı aynı kalıptır */
const makale = ({ yol, baslik, bantV, m, yan, not = bilgiNot(), ilgiliHtml = '' }) => sayfa(yol, baslik, bant(bantV) + dizi(bolum(`<div class="iki-kolon"><div class="yigin"><article class="okuma">${bloklar(m.bloklar)}</article>${kaynakListe(m.kaynaklar)}${not}</div><aside class="yigin yan-sabit" aria-label="Yazı bilgileri">${yan}</aside></div>`, { ilk: true }), ilgiliHtml), A);

const ilgiliKart = (y, href, rozet, rozetIkon, git) => gorselKart({ href, gorsel: `${K}${y.gorsel}`, rozet: y.kategori ?? rozet, rozetIkon, baslik: kac(y.ad), metin: kac(y.ozet), not: y.meta?.[0] ?? '', git });

function kacKaloriDetay(veri) {
  const y = veri.kac_kalori.yazilar[0];
  return makale({
    yol: 'kac-kalori/bir-avuc-badem-kac-kalori', baslik: y.ad,
    bantV: { yol: [['Beslenme', 'besin-rehberi/'], ['Kaç Kalori?', 'kac-kalori/'], [kac(y.ad)]], etiket: 'KAÇ KALORİ?', etiketIkon: 'fa-fire', h1: kac(y.ad), alt: kac(y.ozet), gorsel: `assets/img/icerik/${y.gorsel_dosya}`, sayilar: [['180', '<span class="birim">kalori / 30 g</span>'], ['600', '<span class="birim">kcal / 100 g</span>'], ['30 g', 'bir avuç']] },
    m: metin.makale['kac-kalori-detay'],
    yan: kunyeKart('Besin kaydı', [['Kayıt', 'Badem (iç · kavrulmuş)'], ['Enerji', '600 kcal / 100 g'], ['Kaynak', 'TürKomp — Ulusal Gıda Kompozisyon Veri Tabanı'], ['Yayın', '13.08.2026'], ['Kategori', kac(y.kategori)]], paylas),
    ilgiliHtml: ilgili({ etiket: 'DEVAM ET', baslik: 'Bunlar da işine yarar', metin: 'Aynı mantıkla kurulmuş, yine iki dakikalık kalori soruları.', tumu: 'kac-kalori/', tumuAd: 'Tüm Yazılar', kartlar: metin.kartlar['ilgili-kac-kalori'].map((c) => ilgiliKart(c, DETAY.kacKalori, 'Kaç Kalori?', 'fa-fire', 'Oku')).join('') }),
  });
}

const HUB_ALT = { 'kac-kalori': 'kacKalori', ipucu: 'ipucu', puf: 'puf' };
const hubKart = (veri) => (y) => {
  const s = y.yol.split('/').pop();
  const aile = veri.kac_kalori.yazilar.some((x) => x.slug === s) ? 'kac-kalori' : veri.ipuclari.ipuclari.some((x) => x.slug === s) ? 'ipucu' : veri.puflar.puflar.some((x) => x.slug === s) ? 'puf' : null;
  return gorselKart({ href: aile ? DETAY[HUB_ALT[aile]] : DETAY.rehber, gorsel: `${K}${y.gorsel}`, rozet: 'Rehber', rozetIkon: 'fa-book-open', baslik: kac(y.ad), metin: kac(y.ozet), git: 'Rehberi Aç', sinif: 'buyuk' });
};

function besinRehberi(veri) {
  const s = veri.sayaclar;
  const aileler = [['Besin Kütüphanesi', `${s.besin} besinin değeri`, 'besin-kutuphanesi/', 'fa-magnifying-glass'], ['Kaç Kalori?', 'Porsiyon karşılıkları', 'kac-kalori/', 'fa-fire'], ['Makro Rehberi', `${s.makro_rehberi} rehber: protein, lif, yağ, karbonhidrat`, 'makro-rehberi/', 'fa-chart-pie'], ['İpuçları ve Püf Noktaları', `${s.ipucu} ipucu, ${s.puf} püf noktası`, 'ipuclari-ve-puf-noktalari/', 'fa-lightbulb']];
  return sayfa('besin-rehberi', 'Besin Rehberi',
    bant({ yol: [['Besin Rehberi']], etiket: 'BESLENME', etiketIkon: 'fa-book-open', h1: 'Ne yediğini bil, nasıl besleneceğini öğren', alt: 'Yayınlanmış besin değerleri ve uygulanabilir beslenme bilgisi tek merkezde.', gorsel: 'assets/img/hero/beslenme-reh-hero.jpg', sayilar: [[s.icerik_toplam, 'yayınlanmış rehber'], ['5', 'içerik ailesi']] })
    + dizi(
      bolum(`${bolumBas({ etiket: 'BESLENME REHBERİ', ikon: 'fa-book-open', baslik: 'Nereden başlamak istersin?', metin: 'Hesap yapmadan önce mantığı anla: dengeli tabak, öğün planı, porsiyon, alışveriş, mutfak alışkanlıkları, içecekler, dışarıda yemek ve ara öğünler. Sade, genel ve suçlamasız bir rehber; her başlık kısa ve uygulanabilir, sırayla okumak zorunda değilsin.' })}<div class="kart-izgara c3">${metin.kartlar['besin-rehberi'].map(hubKart(veri)).join('')}</div>`, { ilk: true }),
      bolum(`${bolumBas({ etiket: 'İÇERİK AİLELERİ', ikon: 'fa-layer-group', baslik: 'Aradığını doğrudan bul' })}<div class="kart-izgara c2">${aileler.map(([b, m, h, i]) => ikonKart({ href: h, ikon: i, baslik: b, metin: m })).join('')}</div>${bilgiNot('Bu sayfadaki içerikler <b>genel bilgi amaçlıdır</b>; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi değildir. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.')}`),
    ), A);
}

function dengeliTabak() {
  const d = metin.dengeli;
  const y = metin.kartlar['besin-rehberi'][0];
  return sayfa('besin-rehberi/dengeli-tabak', 'Dengeli Tabak',
    bant({ yol: [['Besin Rehberi', 'besin-rehberi/'], ['Dengeli Tabak']], etiket: 'BESLENME REHBERİ', etiketIkon: 'fa-book-open', h1: 'Dengeli Tabak', alt: 'Beslenmeyi karmaşık kurallara dönüştürmeden, tabağına bakarak sağlıklı bir denge kurmanın yolları.', gorsel: y.gorsel })
    + dizi(
      bolum(`${bolumBas({ etiket: 'BU REHBERDE', ikon: 'fa-list-check', baslik: 'Dengeli tabağın temelleri', metin: 'Dört soruda dengeli tabak: oran mantığı, besin gruplarının dengesi, ev porsiyonu ve sade akşam yemeği.' })}
<div class="iki-kolon"><div class="yigin">${akordeon(d.qa.map((q, i) => ({ soru: q.soru, ikon: 'fa-utensils', acik: i === 0, govde: `<div class="okuma">${bloklar(q.bloklar.map((b, j, l) => (b.t === 'p' && l[j + 1]?.t === 'ul' ? { ...b, t: 'h3' } : b)))}</div>` })))}<p class="sonuc-not-kisa">${d.dip[0]}</p>${bilgiNot()}</div>
<aside class="yigin yan-sabit" aria-label="İlgili araç"><div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-chart-pie')} Tabağını şimdi kur</h2></div><div class="kart-govde yigin sik"><p class="kart-metin">Tabağını kur, muadilini bul: bölmeler doldukça denge skorun hemen değişir.</p>${dugme('Akıllı Tabak ve Değişim', 'akilli-tabak-ve-degisim/', 'birincil tam-en', 'fa-arrow-right', true)}</div></div>${kunyeKart('Bu rehber', [['Başlık', '4 soru'], ['Kaynak', 'TÜBER 2022']], paylas)}</aside></div>`, { ilk: true }),
      ilgili({ etiket: 'SIRADA', baslik: 'Bunlar da işine yarar', metin: 'Aynı konuya yakın diğer rehber sayfaları.', tumu: 'besin-rehberi/', tumuAd: 'Tüm Rehberler', kartlar: metin.kartlar['ilgili-rehber'].map((c) => ilgiliKart(c, DETAY.rehber, 'Rehber', 'fa-book-open', 'Rehberi Aç')).join('') }),
    ), A);
}

function makroRehberi(veri) {
  const kart = (y) => gorselKart({ href: DETAY.makro, gorsel: `${K}${y.gorsel}`, rozet: 'Rehber', rozetIkon: 'fa-chart-pie', baslik: kac(y.ad), metin: kac(y.ozet), git: 'Rehberi Aç', sinif: 'buyuk' });
  return sayfa('makro-rehberi', 'Makro Rehberi',
    bant({ yol: [['Besin Rehberi', 'besin-rehberi/'], ['Makro Rehberi']], etiket: 'MAKRO REHBERİ', etiketIkon: 'fa-chart-pie', h1: 'Protein, karbonhidrat, yağ ve lif rehberi', alt: 'Makroların ne anlattığını, hangi besinde bulunduğunu ve etikette nasıl okunduğunu kaynaklarıyla anlatan yazılar.', gorsel: 'assets/img/hero/makro-rehberi-reh-hero.jpg', sayilar: [[veri.sayaclar.makro_rehberi, 'yayınlanmış rehber'], ['~4 dk', 'ortalama okuma']] })
    + dizi(bolum(`${bolumBas({ etiket: 'MAKRO REHBERİ', ikon: 'fa-chart-pie', baslik: 'Hangi makroyla başlamak istersin?', metin: `${veri.sayaclar.makro_rehberi} rehberden 12 tanesi gösteriliyor.` })}<div class="kart-izgara c3">${metin.kartlar['makro-rehberi'].map(kart).join('')}</div>${bilgiNot('Bu sayfadaki içerikler <b>genel bilgi amaçlıdır</b>; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi değildir. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.')}`, { ilk: true })), A);
}

function makroDetay() {
  const y = metin.kartlar['makro-rehberi'][1];
  return makale({
    yol: 'makro-rehberi/protein-kaynaklari-hayvansal-bitkisel', baslik: y.ad,
    bantV: { yol: [['Besin Rehberi', 'besin-rehberi/'], ['Makro Rehberi', 'makro-rehberi/'], [kac(y.ad)]], etiket: 'BESİN DEĞERLERİ', etiketIkon: 'fa-chart-pie', h1: kac(y.ad), alt: kac(y.ozet), gorsel: y.gorsel },
    m: metin.makale['makro-rehberi-detay'],
    yan: kunyeKart('Bu yazı', [['Aile', 'Makro Rehberi'], ['Okuma', '~4 dk'], ['Kaynak', 'TÜBER 2022']], `${paylas}${dugme('Besin Kütüphanesi', 'besin-kutuphanesi/', 'birincil kucuk tam-en', 'fa-arrow-right', true)}`),
  });
}

/* İpuçları ve püf noktaları: tek kütüphane */
function kutuphane(veri) {
  const { ipuclari: ip, puflar: pu, sayaclar: s } = veri;
  const ks = (l, ad) => l.find((c) => c.ad === ad)?.slug ?? '';
  const kart = (tur) => (y) => {
    const ipucu = tur === 'ipucu';
    return gorselKart({ href: ipucu ? DETAY.ipucu : DETAY.puf, gorsel: icerik(y.gorsel_dosya), rozet: ipucu ? 'İpucu' : 'Püf Noktası', rozetIkon: ipucu ? 'fa-lightbulb' : 'fa-wand-magic-sparkles', altRozet: kac(y.kategori), baslik: kac(y.ad), metin: kac(y.ozet), not: `${y.okuma_dk ? `~${y.okuma_dk} dk · ` : ''}${y.okunma} okunma`, git: 'Oku', sinif: 'buyuk', veri: ` data-kart data-tur="${tur}" data-kategori="${ks(ipucu ? ip.kategoriler : pu.kategoriler, y.kategori)}" data-okunma="${y.okunma}" data-ara="${araMetni(y.ad, y.ozet, y.kategori)}"` });
  };
  const a = ip.ipuclari.map(kart('ipucu')), b = pu.puflar.map(kart('puf'));
  const karisik = a.flatMap((x, i) => [x, b[i]].filter(Boolean)).map((h, i) => (i >= 12 ? h.replace(' data-kart', ' data-kart hidden') : h)).join('');
  const toplam = s.ipucu + s.puf;
  const ust = `<div class="liste-arac">${aramaKutusu('ipAra', 'İpucu ve püf noktası ara', 'Örneğin su, porsiyon, buzdolabı')}${siralama}</div>
${cipler('tur', 'İçerik türü', [{ ad: 'Tümü', deger: '', sayi: toplam, ikon: 'fa-layer-group' }, { ad: 'İpucu', deger: 'ipucu', sayi: s.ipucu, ikon: 'fa-lightbulb' }, { ad: 'Püf Noktası', deger: 'puf', sayi: s.puf, ikon: 'fa-wand-magic-sparkles' }], { sinif: '' })}
${cipler('kategori', 'Kategori', [{ ad: 'Tüm kategoriler', deger: '', sayi: toplam }, ...ip.kategoriler.map((c) => ({ ad: c.ad, deger: c.slug, sayi: c.sayi, tur: 'ipucu' })), ...pu.kategoriler.map((c) => ({ ad: c.ad, deger: c.slug, sayi: c.sayi, tur: 'puf' }))])}`;
  return sayfa('ipuclari-ve-puf-noktalari', 'Beslenme İpuçları & Püf Noktaları',
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['İpuçları ve Püf Noktaları']], etiket: 'BESLENME İPUÇLARI VE PÜF NOKTALARI', etiketIkon: 'fa-lightbulb', h1: 'Küçük değişiklikler, kalıcı alışkanlıklar', alt: 'Uzun rehber okumaya vaktin yoksa buradan başla. Her yazı tek bir soruyu yanıtlar, kısa sürede okunur ve bugün uygulanabilir.', gorsel: 'assets/img/hero/puflar-reh-hero.jpg', sayilar: [[s.ipucu, 'ipucu'], [s.puf, 'püf noktası'], [ip.kategoriler.length + pu.kategoriler.length, 'kategori']] })
    + dizi(bolum(liste({ toplam, birim: 'yazıdan', ust, kartlar: karisik, bosMetin: 'Aradığın kelime bu yazılarda geçmiyor. Farklı bir kelime dene ya da süzgeçleri temizle.' }) + bilgiNot('Buradaki ipuçları ve püf noktaları pratik bilgilerdir ve <b>genel bilgi amaçlıdır</b>; <b>tıbbi teşhis veya tedavi yerine geçmez</b>, kişisel beslenme tavsiyesi değildir. Kişiye özel plan yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır; gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur</b>.'), { ilk: true })), L);
}

function ipucuDetay(veri) {
  const y = veri.ipuclari.ipuclari.find((x) => x.slug === 'gunde-ne-kadar-su-icmek-gerekir');
  return makale({
    yol: 'ipuclari/gunde-ne-kadar-su-icmek-gerekir', baslik: y.ad,
    bantV: { yol: [['Beslenme', 'besin-rehberi/'], ['İpuçları ve Püf Noktaları', 'ipuclari-ve-puf-noktalari/'], [kac(y.ad)]], etiket: 'BESLENME İPUCU', etiketIkon: 'fa-lightbulb', h1: kac(y.ad), alt: kac(y.ozet), gorsel: `assets/img/icerik/${y.gorsel_dosya}` },
    m: metin.makale['ipuclari-detay'],
    yan: kunyeKart('Bu yazı', [['Yayın', '22.08.2026'], ['Kategori', kac(y.kategori)], ['Okuma', `~${y.okuma_dk} dk`], ['Okunma', y.okunma]], paylas),
    ilgiliHtml: ilgili({ etiket: 'SIRADA', baslik: 'Bunlar da işine yarar', metin: 'Aynı konuya yakın, yine iki dakikalık ipuçları.', tumu: 'ipuclari-ve-puf-noktalari/?tur=ipucu', tumuAd: 'Tüm İpuçları', kartlar: metin.kartlar['ilgili-ipucu'].map((c) => ilgiliKart(c, DETAY.ipucu, 'İpucu', 'fa-lightbulb', 'Oku')).join('') }),
  });
}

function pufDetay(veri) {
  const y = veri.puflar.puflar.find((x) => x.slug === 'buzdolabinda-hangi-raf-neye-ait');
  return makale({
    yol: 'puflar/buzdolabinda-hangi-raf-neye-ait', baslik: y.ad,
    bantV: { yol: [['Beslenme', 'besin-rehberi/'], ['İpuçları ve Püf Noktaları', 'ipuclari-ve-puf-noktalari/'], [kac(y.ad)]], etiket: 'PÜF NOKTASI', etiketIkon: 'fa-wand-magic-sparkles', h1: kac(y.ad), alt: kac(y.ozet), gorsel: `assets/img/icerik/${y.gorsel_dosya}` },
    m: metin.makale['puflar-detay'],
    yan: kunyeKart('Bu yazı', [['Yayın', '13.08.2026'], ['Kategori', kac(y.kategori)], ['Okunma', y.okunma]], paylas),
    ilgiliHtml: ilgili({ etiket: 'DEVAM ET', baslik: 'Bunlar da işine yarar', metin: 'Aynı mantıkla kurulmuş, mutfakta karşılığı olan diğer püf noktaları.', tumu: 'ipuclari-ve-puf-noktalari/?tur=puf', tumuAd: 'Tüm Yazılar', kartlar: metin.kartlar['ilgili-puf'].map((c) => ilgiliKart(c, DETAY.puf, 'Püf Noktası', 'fa-wand-magic-sparkles', 'Oku')).join('') }),
  });
}

export default ({ veri }) => [besinKutuphanesi(veri), besinDetay(veri), kacKalori(veri), kacKaloriKategori(veri), kacKaloriDetay(veri), besinRehberi(veri), dengeliTabak(), makroRehberi(veri), makroDetay(), kutuphane(veri), ipucuDetay(veri), pufDetay(veri)];
