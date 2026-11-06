// Tarifler, tarif detayı ve Dışarıda Ne Yesem.
import { K, kac, ikon, icerik, bant, bolumBas, dugme, bolum, gorselKart, metin, DETAY, sayfa, dizi, sayi, araMetni, bilgiNot, cipler, aramaKutusu, liste, ilgili, kunyeKart, paylas, akordeon } from '../../parcalar/public-beslenme/ortak.mjs';

const A = { aktif: 'Beslenme' };
const slug = (s) => s.toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const faset = (ad) => metin.tarifFaset.find((f) => f.ad.startsWith(ad)).kalem.map((k) => { const m = k.match(/^(.*) (\d+)$/); return { ad: m[1], sayi: +m[2] }; });
const OGUN = { Kahvaltı: 'kahvalti', Brunch: 'brunch', 'Öğle Yemeği': 'ogle-yemegi', 'Akşam Yemeği': 'aksam-yemegi', 'Ara Öğün': 'ara-ogun', 'İkindi ve Çay Saati': 'ikindi-ve-cay-saati', 'Beslenme Çantası': 'beslenme-cantasi' };
const ETIKET = ['Vegan', 'Vejetaryen', 'Glütensiz'];

const tarifKart = (t, i) => gorselKart({
  href: DETAY.tarif, gorsel: icerik(t.gorsel_dosya), rozet: kac(t.kategori), altRozet: `${sayi(t.kcal, 0)} kcal`, baslik: kac(t.ad), metin: kac(t.ozet),
  etiketler: t.etiketler.filter((e) => ETIKET.includes(e)).map((e) => `<span class="rozet olumlu">${e}</span>`).join(''),
  not: `${t.sure} dk · ${t.zorluk} · ${t.porsiyon} kişilik`, git: 'Tarife Git', sinif: 'buyuk',
  veri: ` data-kart data-kategori="${slug(t.kategori)}" data-ogun="${t.ogunler.join('|')}" data-etiket="${t.etiketler.filter((e) => ETIKET.includes(e)).map(slug).join('|')}" data-zorluk="${slug(t.zorluk)}" data-ara="${araMetni(t.ad, t.kategori, t.ozet, t.malzemeler.join(' '))}"${i >= 12 ? ' hidden' : ''}`,
});

const secim = (id, etiket, alan, tumu, kalemler) => `<div class="alan"><label class="alan-etiket" for="${id}">${etiket}</label><select class="alan-secim" id="${id}" data-liste-secim="${alan}"><option value="">${tumu}</option>${kalemler.map((k) => `<option value="${k.deger}" data-sayi="${k.sayi}">${kac(k.ad)} (${k.sayi})</option>`).join('')}</select></div>`;

function tarifler(veri) {
  const l = veri.tarifler.tarifler;
  const s = veri.sayaclar;
  const var_ = new Set(l.map((t) => slug(t.kategori)));
  const kat = faset('Kategori').map((k) => ({ ...k, deger: slug(k.ad) })).filter((k) => var_.has(k.deger));
  const ust = `<div class="liste-arac">${aramaKutusu('tarifAra', 'Tarif ara', 'Örneğin mercimek, yoğurt')}
${secim('tarifOgun', 'Öğün', 'ogun', 'Tüm öğünler', faset('Öğün').filter((k) => OGUN[k.ad]).map((k) => ({ ...k, deger: OGUN[k.ad] })))}
${secim('tarifZorluk', 'Zorluk', 'zorluk', 'Tüm zorluklar', faset('Zorluk').filter((k) => k.ad !== 'Zor').map((k) => ({ ...k, deger: slug(k.ad) })))}
${secim('tarifEtiket', 'Beslenme etiketi', 'etiket', 'Tüm etiketler', faset('Beslenme Etiketi').map((k) => ({ ...k, deger: slug(k.ad) })))}</div>
${cipler('kategori', 'Tarif kategorisi', [{ ad: 'Tümü', deger: '', sayi: s.tarif }, ...kat])}`;
  return sayfa('tarifler', 'Sağlıklı Tarifler',
    bant({ yol: [['Tarifler']], etiket: 'SAĞLIKLI TARİFLER', etiketIkon: 'fa-utensils', h1: 'Bütün tarifler, tek dizinde', alt: 'Kategoriye, öğüne ve beslenme etiketine göre daralt; sofrana uygun tarifi bul.', gorsel: 'assets/img/hero/tarifler-lst-top.jpg', sayilar: [[s.tarif, 'tarif'], [s.tarif_kategori, 'kategori'], [s.tarif, 'besin değeri hesaplı']] })
    + dizi(bolum(liste({ toplam: s.tarif, birim: 'tariften', ust, kartlar: l.map(tarifKart).join(''), bosMetin: 'Bu süzgeçlere uyan tarif yok. Bir süzgeci kaldırmayı dene.' }), { ilk: true })), { ...A, js: ['liste'] });
}

const MALZEME = [
  ['Yoğurt için', [[245, 'Süzme Yoğurt', '1 su bardağı, oda sıcaklığında'], [3, 'Sarımsak', '1 diş, ezilmiş'], [null, 'Tuz', '¼ çay kaşığı']]],
  ['Yumurta için', [[200, 'Yumurta (tam · çiğ)', '4 adet'], [null, 'Sirke', '1 yemek kaşığı, poşe suyu için']]],
  ['Sos için', [[9, 'Zeytinyağı', '2 çay kaşığı'], [null, 'Pul biber', '1 çay kaşığı']]],
  ['Servis için', [[10, 'Dereotu', 'birkaç dal, kıyılmış']]],
];
const HESAP = [['Süzme Yoğurt', '245 g'], ['Sarımsak', '3 g'], ['Yumurta (tam · çiğ)', '200 g'], ['Zeytinyağı', '9 g'], ['Dereotu', '10 g']];

function tarifDetay(veri) {
  const t = veri.tarifler.tarifler.find((x) => x.slug === 'cilbir');
  const malzeme = MALZEME.map(([g, l]) => `<h3 class="malzeme-grup">${g}</h3>${l.map(([m, ad, not]) => `<label class="malzeme-satir"><input type="checkbox"><b${m ? ` data-miktar="${m}"` : ''}>${m ? `${m} g` : ''}</b><span>${ad}<small>${not}</small></span></label>`).join('')}`).join('');
  const notlar = [['fa-circle-info', 'Alerjen notu', kac(t.alerjen_notu)], ['fa-lightbulb', 'İpucu', 'Yumurtayı önce küçük bir kâseye kırın, sonra suya kaydırın; beyazı dağılmadan toplanır. Sarısı tam pişmiş isteyenler süreyi 4–5 dakikaya uzatabilir.'], ['fa-pen', 'Neler değişti', 'Sostaki 2 yemek kaşığı tereyağı yerine 2 çay kaşığı zeytinyağı kullanılır. Sos ocakta kızdırılmaz; pul biber zeytinyağında birkaç dakika bekletilerek rengini verir. Servise kıyılmış dereotu eklenir.']];
  const dagilim = [['Protein', 30], ['Karbonhidrat', 3], ['Yağ', 67]];
  const sol = `<div class="yigin">
<div class="okuma"><p class="okuma-giris">Çılbırın kimliği sarımsaklı süzme yoğurt ile poşe yumurtadır; bu tarifte ikisine de dokunulmaz. Değişen yalnız üstteki sos ve servisteki dereotu.</p></div>
<div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-list-ol')} Nasıl yapılır?</h2></div><div class="kart-govde"><ol class="sira-liste metinli">${t.adimlar.map((a, i) => `<li><span class="adim-no">${i + 1}</span><p>${kac(a)}</p></li>`).join('')}</ol></div></div>
<div class="kart"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-heart-pulse')} Besin Değerleri</h2><p>1 porsiyon · değerler tahminidir</p></div></div><div class="kart-govde yigin sik">
<dl class="kunye"><div><dt>Kalori</dt><dd>${sayi(t.kcal, 0)} kcal</dd></div><div><dt>Protein</dt><dd>${sayi(t.protein)} g</dd></div><div><dt>Karbonhidrat</dt><dd>${sayi(t.karb)} g</dd></div><div><dt>Yağ</dt><dd>${sayi(t.yag)} g</dd></div></dl>
${dagilim.map(([a, y]) => `<div class="olcu-satir"><span>${a}</span><div class="olcer hap"><span data-oran="${y}"></span></div><span>%${y}</span></div>`).join('')}
<p class="kart-metin">Klasik tarif ≈ 396 kcal · bu tarif ≈ 332 kcal (porsiyon başına). Porsiyon başına, malzemelerin Besin Kütüphanesi değerlerinden hesaplanmıştır (TürKomp).</p>
${akordeon([{ soru: 'Nasıl hesapladık', ikon: 'fa-calculator', govde: `<div class="okuma"><p>Her malzeme besin kütüphanemizdeki bir kayda bağlı; gramı ve değerlerin geldiği kaynak aşağıda.</p><ul>${HESAP.map(([a, g]) => `<li><b>${a}</b> ${g} · TürKomp — Ulusal Gıda Kompozisyon Veri Tabanı</li>`).join('')}</ul></div>` }])}
</div></div>
${notlar.map(([i, b, m]) => `<div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon(i)} ${b}</h2></div><div class="kart-govde"><p class="kart-metin">${m}</p></div></div>`).join('')}
</div>`;
  const sag = `<aside class="yigin yapiskan" aria-label="Malzemeler">
<div class="kart"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-basket-shopping')} Malzemeler</h2><p>8 malzeme</p></div></div><div class="kart-govde">
<div class="adet-satir"><span class="alan-etiket" id="porsiyonEtiket">Porsiyon</span><div class="adet" data-taban="${t.porsiyon}"><button type="button" data-yon="azalt" aria-label="Porsiyonu azalt">${ikon('fa-minus')}</button><input id="porsiyon" type="number" min="1" max="12" step="1" value="${t.porsiyon}" readonly aria-labelledby="porsiyonEtiket"><button type="button" data-yon="artir" aria-label="Porsiyonu artır">${ikon('fa-plus')}</button></div></div>
${malzeme}<p class="alan-yardim tamam"><span>Miktarlar porsiyona göre otomatik güncellenir</span></p></div></div>
${kunyeKart('Tarif künyesi', [['Hazırlık + Pişirme', `${t.hazirlik_dk} dk + ${t.pisirme_dk} dk`], ['Zorluk', t.zorluk], ['Beslenme etiketleri', 'Vejetaryen, Glütensiz'], ['Yayın', '28 Ekim 2026']], `${paylas}<button class="dugme hayalet kucuk tam-en" type="button" disabled>${ikon('fa-calendar-plus')} Programına ekle · Yakında</button>`)}
</aside>`;
  const benzer = metin.kartlar['ilgili-tarif'].map((c) => gorselKart({ href: DETAY.tarif, gorsel: `${K}${c.gorsel}`, rozet: kac(c.kategori), altRozet: c.meta.at(-1), baslik: kac(c.ad), not: `${c.meta[0]} · ${c.meta[1]} · ${c.meta[3]}`, git: 'Tarife Git' })).join('');
  const prog = [['Vejetaryen Dört Hafta', 'vejetaryen-dort-hafta'], ['Glütensiz Hafta', 'glutensiz-hafta']].map(([a, g]) => gorselKart({ href: DETAY.program, gorsel: `${K}assets/img/program/${g}.webp`, rozet: 'Program', rozetIkon: 'fa-list-check', baslik: a, git: 'Programı İncele' })).join('');
  return sayfa('tarif/cilbir', 'Çılbır',
    bant({ yol: [['Tarifler', 'tarifler/'], ['Yumurta Tarifleri', 'tarifler/?kategori=yumurta-tarifleri'], ['Çılbır']], etiket: 'YUMURTA TARİFLERİ', etiketIkon: 'fa-egg', h1: 'Çılbır', alt: kac(t.ozet), gorsel: `assets/img/icerik/${t.gorsel_dosya}`, sayilar: [[`${t.kcal} kcal`, 'porsiyon başı'], [`${t.sure} dk`, 'toplam süre'], [`${t.porsiyon} kişilik`, 'porsiyon']] })
    + dizi(
      bolum(`<div class="iki-kolon genis-yan-orta">${sol}${sag}</div>`, { ilk: true }),
      ilgili({ etiket: 'BENZER TARİFLER', baslik: 'Bunları da seveceksin', metin: 'Aynı kategoriden, sofrana yakışacak başka tarifler.', tumu: 'tarifler/', tumuAd: 'Tamamını Gör', kartlar: benzer }),
      bolum(`${bolumBas({ etiket: 'PROGRAMLARDA', ikon: 'fa-calendar-days', baslik: 'Bu tarifi kullanan programlar', metin: 'Bu tarif aşağıdaki beslenme programlarının öğünlerinde yer alıyor ya da onlara uygun.' })}<div class="kart-izgara c4">${prog}</div>`),
    ), { ...A, js: ['tarif'] });
}

const HEDEF_ETIKET = (n) => `≤ ${n} kcal`;
const TIP = [['Vejetaryen', 'vejetaryen'], ['Vegan ve Bitkisel', 'bitkisel'], ['Glütensiz', 'glutensiz'], ['Protein Ağırlıklı', 'yuksek-protein'], ['Düşük Karbonhidrat', 'dusuk-karbonhidrat']];
const ALERJEN = [['Gluten', 'gluten'], ['Kabuklu deniz ürünleri', 'kabuklu-deniz'], ['Yumurta', 'yumurta'], ['Balık', 'balik'], ['Süt', 'sut'], ['Susam', 'susam']];
const SEHIR = [['İstanbul', 88], ['Muğla', 34], ['Antalya', 25], ['İzmir', 22], ['Nevşehir', 16], ['Ankara', 8]];
const REHBER = ['Restoran menüsü nasıl okunur?', 'Paket siparişte neler değişir?', 'Hızlı servis restoranında seçim nasıl yapılır?', 'Seyahatte öğün düzeni nasıl kurulur?', 'Davet sofrasında porsiyon nasıl yönetilir?', 'Dışarıda kahvaltı nasıl seçilir?'];

function disarida(veri) {
  const d = veri.disarida;
  const yemek = (ad) => d.yemekler.find((y) => y.ad === ad);
  const mutfaklar = [...new Set(d.mekan_ornekleri.map((m) => m.mutfak))];
  const grup = (b, html) => `<div class="suzgec-grup"><h3 class="alan-etiket">${b}</h3>${html}</div>`;
  const filtre = `<div class="suzgec-yigin">
${grup('Şehir', `<label class="yalniz-okuyucu" for="dzSehir">Şehir seç</label><select class="alan-secim" id="dzSehir">${SEHIR.map(([a, s]) => `<option value="${a}" data-sayi="${s}">${a} (${s})</option>`).join('')}</select>`)}
${grup('Öğün hedefi', cipler('hedef', 'Öğün hedefi', [{ ad: 'Tümü', deger: '' }, ...d.kalori_hedefleri.map((n) => ({ ad: HEDEF_ETIKET(n), deger: String(n) }))], { sinif: '' }))}
${grup('Beslenme tipi', cipler('tip', 'Beslenme tipi', [{ ad: 'Tümü', deger: '' }, ...TIP.map(([a, v]) => ({ ad: a, deger: v }))], { sinif: '' }))}
${grup('Alerjiler', `<div class="cipler" data-coklu-secim id="dzAlerji" role="group" aria-label="Alerjiler">${ALERJEN.map(([a, v]) => `<button class="cip" type="button" data-deger="${v}" aria-pressed="false">${a}</button>`).join('')}</div>`)}
${grup('Mutfak', cipler('mutfak', 'Mutfak', [{ ad: 'Tümü', deger: '' }, ...mutfaklar.map((m) => ({ ad: m, deger: m }))], { sinif: '' }))}
<button class="dugme hayalet kucuk tam-en" type="button" id="dzTemizle">Tümünü Temizle</button>
</div>`;
  const kart = (m) => `<article class="kart" data-mekan data-mutfak="${kac(m.mutfak)}">
<div class="kart-bas"><div class="kart-bas-sol"><span class="ikon-kutu">${ikon('fa-utensils')}</span><div><h3 class="kart-baslik">${kac(m.ad)}</h3><p>${kac(m.etiket)}</p></div></div><span class="rozet olumlu">${kac(m.mutfak)}</span></div>
<div class="kart-govde yigin sik"><h4 class="alan-etiket">Programına uygun örnekler</h4><ul class="ozellik-liste">${m.ornek_yemekler.map(yemek).map((y) => `<li data-yemek data-kcal="${y.kcal}" data-tip="${y.diyet_etiketleri.join(' ')}" data-alerjen="${y.alerjenler.join(' ')}">${ikon('fa-check')}<span>${kac(y.ad)} · ${kac(y.porsiyon.ad)}</span><span>≈ ${y.kcal} kcal</span></li>`).join('')}</ul></div>
<div class="kart-alt"><span class="not">Fiyat ${m.fiyat}</span><a class="dugme hayalet kucuk" href="https://dadagourmet.com" target="_blank" rel="noopener">Dada Gourmet'te gör ${ikon('fa-arrow-up-right-from-square')}</a></div></article>`;
  return sayfa('disarida-ne-yesem', 'Dışarıda Ne Yesem?',
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['Dışarıda Ne Yesem?']], etiket: 'RESTORAN VE MENÜ NAVİGATÖRÜ', etiketIkon: 'fa-location-dot', h1: 'Dışarıda ne yesem?', alt: 'Dada Gourmet mekanlarını gör; her mekanın mutfağında programına uyan örnek seçimleri ve tahmini kalorilerini incele.', gorsel: 'assets/img/program/olculu-porsiyon-programi.jpg', sayilar: [[d.sayaclar.mekan, 'Dada Gourmet mekanı'], [d.sayaclar.sehir, 'şehirde mekan'], [d.sayaclar.mutfak, 'mutfak türü']] })
    + dizi(bolum(`<div class="iki-kolon sol-yan">
<aside class="yapiskan" aria-label="Filtreler">${akordeon([{ soru: 'Filtreler', ikon: 'fa-sliders', acik: 'genis', govde: filtre }])}</aside>
<div class="yigin" id="dzListe"><p class="sonuc-not-kisa" id="dzSayac" role="status"></p><p class="alan-yardim"><span>Bu mekanların menüsü Dada Gourmet'te yayımlanmadı; örnekler bu mutfakta sık bulunan yemeklerdir ve değerleri tahminidir (kaynak: Dada Diet besin veritabanı).</span></p>
<div class="kart-izgara c2" id="dzKartlar">${d.mekan_ornekleri.map(kart).join('')}</div>
<div class="bos-durum kart-ici" id="dzBos" hidden><span class="bos-ikon">${ikon('fa-location-dot')}</span><h3 id="dzBosBaslik">Bu süzgeçlere uyan mekan yok</h3><p id="dzBosMetin">Öğün hedefini yükselt ya da bir süzgeci kaldır.</p><button class="dugme birincil" type="button" id="dzBosTemizle">Süzgeçleri temizle</button></div>
<div class="yigin sik"><h2 class="kart-baslik">Dışarıda yemek rehberleri</h2><div class="cipler">${REHBER.map((r) => `<a class="cip" href="${K}${DETAY.rehber}">${r}</a>`).join('')}</div></div>
${bilgiNot('Bu sayfadaki değerler <b>tahminidir</b> ve genel bilgilendirme amaçlıdır; <b>tıbbi teşhis veya tedavi yerine geçmez</b>. Alerjin ya da klinik bir durumun varsa siparişten önce mekana danış.', false)}
</div></div>`, { ilk: true })), { ...A, js: ['disarida'] });
}

export default ({ veri }) => [tarifler(veri), tarifDetay(veri), disarida(veri)];
