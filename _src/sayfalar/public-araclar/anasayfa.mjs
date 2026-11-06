// Anasayfa: canlı bölüm sırası, yeni bilgi mimarisine göre araç ve modül kartları, gerçek sayaçlar.
import { K, JS, bant, bolum, bolumBas, dugme, ikon, ikonKart, hesapKart, testKart, programKart, gorselKart, icerik, kac, sayi, DETAY, genelNot } from '../../parcalar/public-araclar/ortak.mjs';

const SEHIRLER = [['İstanbul', 88, 'istanbul'], ['Muğla', 34, 'mugla'], ['Antalya', 25, 'antalya'], ['İzmir', 22, 'izmir'], ['Nevşehir', 16, 'nevsehir'], ['Ankara', 8, 'ankara']];
const MODULLER = [
  { href: 'akilli-tabak-ve-degisim/', ikon: 'fa-chart-pie', baslik: 'Akıllı Tabak ve Değişim', metin: 'Tabağını kur, dengeni gör, bir besini muadiliyle değiştir.' },
  { href: 'aralikli-oruc-rehberi/', ikon: 'fa-clock', baslik: 'Aralıklı Oruç Rehberi', metin: 'Protokolünü seç, yeme ve oruç saatlerini çarkta gör.' },
  { href: 'besin-karsilastir/', ikon: 'fa-scale-balanced', baslik: 'Besin Karşılaştır', metin: 'İki besini yan yana koy, farkı tek tabloda oku.' },
];
const ADIMLAR = [
  ['Kendini tanı', 'Hesaplayıcılar ve testlerle başla.', 'hesaplayicilar/'],
  ['Programını seç', 'Hedefine uyan menüyü bul.', 'programlar/program-bul/'],
  ['Günlük takibini yap', 'Öğün, su ve porsiyon takibi.', 'hesabim/gunluk-takibim/'],
  ['Uzman desteği al', 'Diyetisyenle birebir ilerle.', 'diyetisyen-bul-sihirbazi/'],
];
const makro = (ad, deger, hedef, sinif) => `<div class="olcum-satir"><div class="olcum-bas"><span>${ad}</span><b>${deger} <small>/ ${hedef} g</small></b></div><div class="olcer hap" role="img" aria-label="${ad}: ${deger} / ${hedef} gram"><span data-oran="${Math.round((deger / hedef) * 100)}"></span></div></div>`;

export default ({ veri }) => {
  const s = veri.sayaclar;
  const hizli = [
    ikonKart({ href: DETAY.hesaplayici, ikon: 'fa-utensils', baslik: 'Kalori Hesapla', metin: 'Günlük kalori ihtiyacın' }),
    ikonKart({ href: 'akilli-tabak-ve-degisim/', ikon: 'fa-chart-pie', baslik: 'Tabağını Kur', metin: 'Dengeni tek bakışta gör' }),
    ikonKart({ href: 'besin-kutuphanesi/', ikon: 'fa-magnifying-glass', baslik: 'Besin Ara', metin: `${s.besin} besinin değeri` }),
    ikonKart({ href: 'saglik-testleri/', ikon: 'fa-clipboard-question', baslik: 'Teste Başla', metin: 'Alışkanlığını ölç' }),
    ikonKart({ href: 'diyetisyen-bul-sihirbazi/', ikon: 'fa-user-doctor', baslik: 'Diyetisyen Bul', metin: 'Sana uygun uzmanı eşleştir' }),
  ].join('');
  const besinler = ['avokado', 'tavuk-gogsu-izgara', 'somon-atlantik-ciftlik'].map((sl) => veri.besinler.besinler.find((b) => b.slug === sl));
  const rehberler = ['dengeli-tabak', 'ogun-planlama', 'porsiyon-kontrolu', 'alisveris-ve-etiket-okuma'].map((sl) => veri.rehberler.rehberler.find((r) => r.slug === sl));
  const tarifler = ['cilbir', 'menemen', 'mercimek-corbasi', 'kisir'].map((sl) => veri.tarifler.tarifler.find((t) => t.slug === sl));
  const uzmanlar = veri.diyetisyenler.diyetisyenler.slice(0, 3);
  const P = veri.programlar.programlar;
  const programlar = ['akdeniz-tipi-beslenme', 'hafif-detoks-programi', '16-8-aralikli-oruc'].map((sl, i) => P.find((p) => p.slug === sl) ?? P[i]);

  const govde = `${bant({
    etiket: 'Sağlıklı mutfak', h1: 'Sağlığını <span class="vurgu">mutfakta</span> yönet', gorsel: 'hero/anasayfa-sh-hero-vid.webp',
    alt: 'Hesaplayıcılar, sağlık testleri, beslenme programları ve besin kütüphanesi: vücudunu tanı, hedefine uygun seçimi yap.',
    eylem: dugme('Bana Uygun Olanı Bul', 'bana-uygun-olani-bul/', 'birincil', 'fa-wand-magic-sparkles') + dugme('Programları İncele', 'programlar/', 'koyu-zemin', 'fa-list-check'),
    sayilar: [[s.hesaplayici, 'Hesaplayıcı'], [s.test, 'Sağlık testi'], [s.besin, 'Besin değeri']],
  })}
<div class="bolum-dizi">
${bolum(`${bolumBas({ etiket: 'Hızlı başlangıç', ikon: 'fa-bolt', baslik: 'En çok kullanılan beş giriş', metin: 'Ne arayacağını biliyorsan doğrudan buradan başla.' })}<div class="kart-izgara c5">${hizli}</div>`, { ilk: true })}
${bolum(`${bolumBas({ etiket: 'Yeni araçlar', ikon: 'fa-wand-magic-sparkles', baslik: 'Tabağın, saatin, seçimin', metin: 'Üç yeni araçla kararını veriye dayandır.' })}<div class="kart-izgara c3 ray-dar">${MODULLER.map((m) => `<a class="sonuc-kart" href="${K}${m.href}"><div class="sonuc-yuzey">${ikon(m.ikon)}<span class="sonuc-rozet">Yeni</span></div><div class="sonuc-govde"><h3 class="kart-baslik">${m.baslik}</h3><p>${m.metin}</p><div class="sonuc-alt"><span></span><span class="sonuc-git">Aracı aç ${ikon('fa-arrow-right')}</span></div></div></a>`).join('')}</div>`)}
${bolum(`<div class="vurgu-panel"><div><span class="ust-etiket">${ikon('fa-sun')} Günün özeti</span><h2>Bugünü tek bakışta gör</h2><p class="oturum-kapali">Giriş yaptığında protein, karbonhidrat ve yağ dengen burada görünür. Şimdilik örnek bir gün gösteriyoruz.</p><p class="oturum-acik">Öğünlerini işledikçe protein, karbonhidrat ve yağ dengen günlük takibinde güncellenir.</p><div class="eylem-satiri"><a class="dugme birincil oturum-kapali" href="${K}bana-uygun-olani-bul/">${ikon('fa-wand-magic-sparkles')} Bana Uygun Olanı Bul</a><a class="dugme birincil oturum-acik" href="${K}hesabim/gunluk-takibim/">${ikon('fa-utensils')} Günlük takibime git</a><a class="vurgu-baglanti" href="${K}hesaplayicilar/">Sağlık araçlarına git ${ikon('fa-arrow-right')}</a></div></div>
<div class="kart"><div class="kart-bas"><h3 class="kart-baslik">${ikon('fa-chart-simple')} Günün beslenme özeti</h3><span class="rozet pasif">Örnek gün</span></div><div class="kart-govde yigin sik">${makro('Protein', 96, 150)}${makro('Karbonhidrat', 140, 240)}${makro('Yağ', 38, 65)}<p class="durum-satir tamam">${ikon('fa-circle-check')}<span>Hedefine 540 kcal kaldı</span></p></div></div></div>`)}
${bolum(`${bolumBas({ etiket: 'Sağlık araçları', ikon: 'fa-toolbox', baslik: 'Vücudunu rakamlarla tanı', metin: `${s.hesaplayici} hesaplayıcı ve ${s.test} test tek merkezde. Sonucunu öğren, sana uygun program ve porsiyon önerilerine geç.`, arac: dugme('Tüm araçlar', 'hesaplayicilar/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c3">${veri.hesaplayicilar.hesaplayicilar.slice(0, 6).map(hesapKart).join('')}</div>`)}
${bolum(`${bolumBas({ etiket: 'Sağlık testleri', ikon: 'fa-clipboard-question', baslik: 'Birkaç soruda kendini keşfet', metin: 'Alışkanlıklarını ölç, sonucuna özel açıklamayı oku.', arac: dugme('Tüm testler', 'saglik-testleri/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c4 ray-dar">${veri.testler.testler.slice(0, 4).map(testKart).join('')}</div>`)}
${bolum(`<div class="vurgu-panel acik"><div><span class="ust-etiket">${ikon('fa-magnifying-glass')} Besin kütüphanesi</span><h2>${s.besin} besinin değerini öğren</h2><p>Kalori, protein, yağ, karbonhidrat: aradığın besini bul, hangi tariflerde kullanıldığını gör.</p><form class="durum-arama" action="${K}arama/" method="get" role="search"><label for="anaBesinAra" class="yalniz-okuyucu">Besin ara</label><input id="anaBesinAra" name="q" type="search" placeholder="Örn. yumurta, mercimek, avokado" autocomplete="off"><button class="dugme birincil" type="submit">${ikon('fa-magnifying-glass')} Ara</button></form></div>
<div class="satir-liste">${besinler.map((b) => `<a class="satir-baglanti" href="${K}${DETAY.besin}"><span class="ikon-kutu">${ikon('fa-leaf')}</span><span>${kac(b.ad)}<small>100 g</small></span><b>${b.kcal} kcal</b></a>`).join('')}</div></div>`)}
${bolum(`${bolumBas({ etiket: 'Besin rehberi', ikon: 'fa-book-open', baslik: 'Nereden başlamak istersin?', metin: 'Her rehber kısa, uygulanabilir ve genel bilgiye dayanır. Sırayla okumak zorunda değilsin.', arac: dugme('Besin Rehberi', 'besin-rehberi/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c4 ray-dar">${rehberler.map((r) => gorselKart({ href: 'besin-rehberi/dengeli-tabak/', gorsel: icerik(r.gorsel_dosya), baslik: kac(r.ad), metin: kac(r.ozet), not: 'Temel beslenme', git: 'Rehberi aç', sinif: 'buyuk' })).join('')}</div>`)}
${bolum(`${bolumBas({ etiket: 'Programlar', ikon: 'fa-list-check', baslik: 'Hedefe göre hazır programlar', metin: `${s.program} örnek menü yayında. Hedefini bilmiyorsan sihirbaz senin için eşleştirsin.`, arac: dugme('Tüm programlar', 'programlar/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c3 ray-dar">${programlar.map((p) => programKart(p)).join('')}</div><div class="bolum-eylem">${dugme('Programını Bul', 'programlar/program-bul/', 'birincil', 'fa-wand-magic-sparkles')}</div>`)}
${bolum(`${bolumBas({ etiket: 'Sağlıklı tarifler', ikon: 'fa-utensils', baslik: 'Besin değeri hesaplı tarifler', metin: 'Süre, porsiyon kalorisi ve besleme etkisi her kartta.', arac: dugme('Tümünü gör', 'tarifler/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c4 ray-dar">${tarifler.map((t) => gorselKart({ href: DETAY.tarif, gorsel: icerik(t.gorsel_dosya), rozet: kac(t.kategori), baslik: kac(t.ad), etiketler: `<span class="rozet pasif ikonlu">${ikon('fa-clock')} ${t.sure} dk</span><span class="rozet olumlu ikonlu">${ikon('fa-fire')} ${t.kcal} kcal</span>`, git: 'Tarife git', sinif: 'buyuk' })).join('')}</div>`)}
${bolum(`<div class="vurgu-panel acik"><div><span class="ust-etiket">${ikon('fa-user-doctor')} Diyetisyenler</span><h2>Bir uzmanla birebir çalış</h2><p>Hedefini ve görüşme tercihini söyle, sana uygun uzmanı eşleştirelim. Doğrulandı rozeti yalnızca diploması ve mesleki kaydı kontrol edilen uzmanlara verilir.</p><div class="eylem-satiri">${dugme('Sana Uygun Diyetisyeni Bul', 'diyetisyen-bul-sihirbazi/', 'birincil', 'fa-wand-magic-sparkles')}${dugme('Tüm diyetisyenler', 'diyetisyenler/', 'hayalet')}</div></div><div class="satir-liste">${uzmanlar.map((d) => `<a class="satir-baglanti" href="${K}${DETAY.diyetisyen}"><span class="kisi-avatar" aria-hidden="true">${d.harf}</span><span>${kac(d.ad)}<small>${kac(d.uzmanlik[0])} · ${d.deneyim_yil} yıl deneyim</small></span></a>`).join('')}</div></div>`)}
${bolum(`${bolumBas({ etiket: 'Dışarıda ne yesem', ikon: 'fa-location-dot', baslik: 'Dışarıda da programına uygun seç', metin: 'Dada Gourmet mekanlarında programına uyan örnek seçimleri ve tahmini kalorilerini gör.', arac: dugme('Tüm şehirler', 'disarida-ne-yesem/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c6">${SEHIRLER.map(([ad, n, dosya]) => `<a class="sonuc-kart" href="${K}disarida-ne-yesem/"><div class="sonuc-gorsel"><img src="${K}assets/img/sehir/sehir-${dosya}.webp" alt="" loading="lazy"></div><div class="sonuc-govde"><h3 class="kart-baslik">${ad}</h3><p>${n} mekan</p></div></a>`).join('')}</div>`)}
${bolum(`${bolumBas({ etiket: 'Nasıl çalışır', ikon: 'fa-route', baslik: 'Dört adımda Dada Diet', metin: 'Kendini tanımakla başla, uzman desteğiyle sürdür. Her adım kendi aracına bağlıdır.' })}<div class="kart-izgara c4 ray-dar">${ADIMLAR.map(([b, m, h], i) => `<a class="kart adim-kart" href="${K}${h}"><span class="adim-numara">${i + 1}</span><h3 class="kart-baslik">${b}</h3><p class="kart-metin">${m}</p></a>`).join('')}</div>`)}
${bolum(`${bolumBas({ etiket: 'Bilimsel bilgilendirme', ikon: 'fa-flask', baslik: 'Bu içerikler nereye dayanıyor?' })}${genelNot}<div class="bolum-eylem">${dugme('Bilimsel Kaynaklar', 'sayfa/bilimsel-kaynaklar/', 'hayalet', 'fa-arrow-right', true)}</div>`)}
</div>`;
  return [{ yol: '', meta: { baslik: 'Sağlığını mutfakta yönet', duzen: 'public', hero: true, js: [JS] }, govde }];
};
