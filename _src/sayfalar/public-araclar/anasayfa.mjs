// Anasayfa: canlı bölüm sırası, yeni bilgi mimarisine göre araç ve modül kartları, gerçek sayaçlar.
import { K, JS, bolum, bolumBas, dugme, ikon, ikonKart, hesapKart, testKart, programKart, gorselKart, icerik, kac, DETAY, genelNot, ray, adimYol } from '../../parcalar/public-araclar/ortak.mjs';
import { bicim } from '../../parcalar/bicim.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';

const SEHIRLER = [['İstanbul', 88, 'istanbul'], ['Muğla', 34, 'mugla'], ['Antalya', 25, 'antalya'], ['İzmir', 22, 'izmir'], ['Nevşehir', 16, 'nevsehir'], ['Ankara', 8, 'ankara']];
const MODULLER = [
  { href: 'akilli-tabak-ve-degisim/', ikon: 'fa-chart-pie', gorsel: 'css-photo-1547592180-85f173990554.jpg', baslik: 'Akıllı Tabak ve Değişim', metin: 'Tabağını kur, dengeni gör, bir besini muadiliyle değiştir.' },
  { href: 'aralikli-oruc-rehberi/', ikon: 'fa-clock', gorsel: 'mega-photo-1467453678174-768ec283a940.avif', baslik: 'Aralıklı Oruç Rehberi', metin: 'Protokolünü seç, yeme ve oruç saatlerini çarkta gör.' },
  { href: 'besin-karsilastir/', ikon: 'fa-scale-balanced', gorsel: 'puflar-reh-hero.jpg', baslik: 'Besin Karşılaştır', metin: 'İki besini yan yana koy, farkı tek tabloda oku.' },
];
/* Canlı ana sayfa rayındaki makro rehberi ve kalori cetveli kartları (eski site ES-A-4) */
const MAKRO_KART = [
  { href: 'makro-rehberi/protein-kaynaklari-hayvansal-bitkisel/', ikon: 'fa-drumstick-bite', baslik: 'Protein Rehberi', metin: 'Hayvansal ve bitkisel kaynaklar' },
  { href: 'makro-rehberi/', ikon: 'fa-droplet', baslik: 'Yağ Rehberi', metin: 'Yağ türleri ve günlük pay' },
  { href: 'makro-rehberi/', ikon: 'fa-wheat-awn', baslik: 'Karbonhidrat Rehberi', metin: 'Lif, şeker ve tam tahıl' },
  { href: 'besin-kutuphanesi/', ikon: 'fa-table-list', baslik: 'Besin Kalori Cetveli', metin: 'Besinlerin 100 g değerleri' },
];
const ADIMLAR = [
  ['Kendini tanı', 'Hesaplayıcılar ve testlerle başla.', 'hesaplayicilar/'],
  ['Programını seç', 'Hedefine uyan menüyü bul.', 'programlar/program-bul/'],
  ['Günlük takibini yap', 'Öğün, su ve porsiyon takibi.', 'hesabim/gunluk-takibim/'],
  ['Uzman desteği al', 'Diyetisyenle birebir ilerle.', 'diyetisyen-bul-sihirbazi/'],
];
const makro = (ad, deger, hedef, alan) => `<div class="olcum-satir" data-gun-makro="${alan}"><div class="olcum-bas"><span>${ad}</span><b><span data-gun-deger>${deger}</span> <small>/ <span data-gun-hedef>${bicim.gram(hedef)}</span></small></b></div><div class="olcer hap" role="img" aria-label="${ad}: ${deger} / ${bicim.gram(hedef)}"><span data-oran="${Math.round((deger / hedef) * 100)}"></span></div></div>`;

export default ({ veri }) => {
  const s = veri.sayaclar;
  const hizli = [
    ikonKart({ href: DETAY.hesaplayici, ikon: 'fa-utensils', baslik: 'Kalori Hesapla', metin: 'Günlük kalori ihtiyacın' }),
    ikonKart({ href: DETAY.hesaplayici, ikon: 'fa-weight-scale', baslik: 'BKİ', metin: 'Boy ve kilona göre endeks' }),
    ikonKart({ href: 'besin-kutuphanesi/', ikon: 'fa-magnifying-glass', baslik: 'Besin Ara', metin: `${s.besin} besinin değeri` }),
    ikonKart({ href: 'saglik-testleri/', ikon: 'fa-clipboard-question', baslik: 'Teste Başla', metin: 'Alışkanlığını ölç' }),
    ikonKart({ href: 'diyetisyen-bul-sihirbazi/', ikon: 'fa-user-doctor', baslik: 'Diyetisyen Bul', metin: 'Sana uygun uzmanı eşleştir' }),
  ].join('');
  const besinler = ['avokado', 'tavuk-gogsu-izgara', 'somon-atlantik-ciftlik'].map((sl) => veri.besinler.besinler.find((b) => b.slug === sl));
  const rehberler = ['dengeli-tabak', 'ogun-planlama', 'porsiyon-kontrolu', 'alisveris-ve-etiket-okuma', 'saglikli-mutfak-aliskanliklari', 'su-ve-icecekler'].map((sl) => veri.rehberler.rehberler.find((r) => r.slug === sl));
  const uzmanlar = veri.diyetisyenler.diyetisyenler.slice(0, 3);
  const P = veri.programlar.programlar;
  const programlar = P.slice(0, 8);

  const govde = `<section class="hero-video"><div class="hero-video-medya" data-arkaplan="${K}assets/img/hero/diet-hero-poster.jpg" aria-hidden="true"><video muted loop playsinline preload="none" poster="${K}assets/img/hero/anasayfa-sh-hero-vid.webp"><source type="video/webm" data-src="${K}assets/video/diet-hero.webm"><source type="video/mp4" data-src="${K}assets/video/diet-hero.mp4"></video></div><div class="kap"><div class="hero-video-icerik"><span class="ust-etiket">${ikon('fa-heart-pulse')} Sağlıklı Mutfak</span><h1>Sağlığını <span class="vurgu">mutfakta</span> yönet</h1><p>Hesaplayıcılar, sağlık testleri, beslenme programları ve besin kütüphanesi: vücudunu tanı, hedefine uygun programı keşfet.</p><div class="hero-video-eylem">${dugme('Bana Uygun Olanı Bul', 'bana-uygun-olani-bul/', 'birincil', 'fa-compass')}${dugme('Programları İncele', 'programlar/', 'koyu-zemin', 'fa-clipboard-list')}</div><div class="hero-video-guven"><span>${ikon('fa-circle-check')} <b>${s.hesaplayici}</b> hesaplayıcı</span><span>${ikon('fa-circle-check')} <b>${s.test}</b> sağlık testi</span><span>${ikon('fa-circle-check')} <b>${s.besin}</b> besin değeri</span></div></div></div><div class="hero-video-kesfet" aria-hidden="true"><span>Keşfet</span><i class="fa-solid fa-chevron-down"></i></div></section>
<div class="bolum-dizi">
${bolum(`${bolumBas({ etiket: 'Hızlı başlangıç', ikon: 'fa-bolt', baslik: 'En Çok Kullanılan Beş Giriş', metin: 'Ne arayacağını biliyorsan doğrudan buradan başla.' })}${ray(hizli, 'c3', 'Hızlı başlangıç')}${rk('AS-HERO', { tur: 'sar', kap: false, sira: 1 })}`, { ilk: true })}
${bolum(`${bolumBas({ etiket: 'Yeni araçlar', ikon: 'fa-wand-magic-sparkles', baslik: 'Tabağın, Saatin, Seçimin', metin: 'Üç yeni araçla kararını veriye dayandır.' })}<div class="kart-izgara c3 ray-dar">${MODULLER.map((m) => `<a class="sonuc-kart" href="${K}${m.href}"><div class="sonuc-yuzey gorselli"><img src="${K}assets/img/hero/${m.gorsel}" alt="" loading="lazy"><span class="sonuc-rozet">Yeni</span><span class="sonuc-ikon">${ikon(m.ikon)}</span></div><div class="sonuc-govde"><h3 class="kart-baslik">${m.baslik}</h3><p>${m.metin}</p><div class="sonuc-alt"><span></span><span class="sonuc-git">Aracı aç ${ikon('fa-arrow-right')}</span></div></div></a>`).join('')}</div>`)}
${bolum(`<div class="vurgu-panel"><div><span class="ust-etiket">${ikon('fa-sun')} Günün özeti</span>${rk('AS-DAY')}<h2>Bugünü Tek Bakışta Gör</h2><p class="oturum-kapali">Giriş yaptığında protein, karbonhidrat ve yağ dengen burada görünür. Şimdilik örnek bir gün gösteriyoruz.</p><p class="oturum-acik">Öğünlerini işledikçe protein, karbonhidrat ve yağ dengen günlük takibinde güncellenir.</p><div class="eylem-satiri"><button class="dugme birincil oturum-kapali" type="button" data-davet="Kendi günümü takip etmeye başla" data-davet-metin="Kaydolunca bu kart senin günün olur: kalan kalori, su ve makro yüzdelerin öğün işledikçe güncellenir." data-davet-sonra="hesabim/gunluk-takibim/">${ikon('fa-calendar-check')} Kendi günümü takip etmeye başla</button><a class="dugme birincil oturum-acik" href="${K}hesabim/gunluk-takibim/">${ikon('fa-utensils')} Günlük takibime git</a><a class="vurgu-baglanti" href="${K}hesaplayicilar/">Sağlık araçlarına git ${ikon('fa-arrow-right')}</a></div></div>
<div class="kart"><div class="kart-bas"><h3 class="kart-baslik">${ikon('fa-chart-simple')} Günün Beslenme Özeti</h3><span class="rozet pasif" data-gun-rozet>Örnek gün</span></div><div class="kart-govde yigin sik" data-gun-ozet>${makro('Protein', 96, 150, 'protein')}${makro('Karbonhidrat', 140, 240, 'karb')}${makro('Yağ', 38, 65, 'yag')}<p class="durum-satir tamam" data-gun-kalan>${ikon('fa-circle-check')}<span>Hedefine 540 kcal kaldı</span></p></div></div></div>`)}
${rk('AS-T1', { tur: 'sar' })}
${bolum(`${bolumBas({ etiket: 'Sağlık araçları', ikon: 'fa-toolbox', baslik: 'Vücudunu Rakamlarla Tanı', metin: `${s.hesaplayici} hesaplayıcı ve ${s.test} test tek merkezde. Sonucunu öğren, sana uygun program ve porsiyon önerilerine geç.`, arac: dugme('Tüm araçlar', 'hesaplayicilar/', 'hayalet orta', 'fa-arrow-right', true) })}${ray(veri.hesaplayicilar.hesaplayicilar.map(hesapKart).join('') + rk('AS-CAT', { tur: 'ikon', sira: 1 }) + MAKRO_KART.map((m) => ikonKart(m)).join(''), 'c3', 'Hesaplayıcılar')}`)}
${rk('AS-FIND', { tur: 'sar' })}
${bolum(`${bolumBas({ etiket: 'Sağlık testleri', ikon: 'fa-clipboard-question', baslik: 'Birkaç Soruda Kendini Keşfet', metin: 'Alışkanlıklarını ölç, sonucuna özel açıklamayı oku.', arac: dugme('Tüm testler', 'saglik-testleri/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c4 ray-dar">${veri.testler.testler.slice(0, 4).map(testKart).join('')}</div>`)}
${bolum(`<div class="vurgu-panel acik"><div><span class="ust-etiket">${ikon('fa-magnifying-glass')} Besin Kütüphanesi</span><h2>${s.besin} Besinin Değerini Öğren</h2><p>Kalori, protein, yağ, karbonhidrat: aradığın besini bul, porsiyon karşılığını gör.</p><form class="durum-arama" action="${K}arama/" method="get" role="search"><label for="anaBesinAra" class="yalniz-okuyucu">Besin ara</label><input id="anaBesinAra" name="q" type="search" placeholder="Örn. yumurta, mercimek, avokado" autocomplete="off"><button class="dugme birincil" type="submit">${ikon('fa-magnifying-glass')} Ara</button></form></div>
<div class="satir-liste">${besinler.map((b) => `<a class="satir-baglanti" href="${K}${DETAY.besin}"><span class="ikon-kutu">${ikon('fa-leaf')}</span><span>${kac(b.ad)}<small>100 g</small></span><b>${bicim.kcal(b.kcal)}</b></a>`).join('')}</div></div>`)}
${bolum(`${bolumBas({ etiket: 'Beslenme rehberi', ikon: 'fa-book-open', baslik: 'Nereden Başlamak İstersin?', metin: 'Her rehber kısa, uygulanabilir ve genel bilgiye dayanır. Sırayla okumak zorunda değilsin.', arac: dugme('Beslenme Rehberi', 'besin-rehberi/', 'hayalet orta', 'fa-arrow-right', true) })}${ray(rehberler.map((r) => gorselKart({ href: 'besin-rehberi/dengeli-tabak/', gorsel: icerik(r.gorsel_dosya), baslik: kac(r.ad), metin: kac(r.ozet), not: 'Temel beslenme', git: 'Rehberi aç', sinif: 'buyuk' })).join('') + rk('AS-VID'), 'c4', 'Rehberler')}${rk('AS-GUIDE', { tur: 'sar', kap: false })}`)}
${rk('AS-HUB', { tur: 'sar' })}
${bolum(`${bolumBas({ etiket: 'Programlar', ikon: 'fa-list-check', baslik: 'Hedefe Göre Hazır Programlar', metin: `${s.program} örnek menü yayında. Hedefini bilmiyorsan sihirbaz senin için eşleştirsin.`, arac: dugme('Tüm programlar', 'programlar/', 'hayalet orta', 'fa-arrow-right', true) })}${ray(programlar.map((p) => programKart(p)).join('') + rk('AS-FEAT', { tur: 'sonuc' }), 'c3', 'Programlar')}<div class="bolum-eylem">${dugme('Programını Bul', 'programlar/program-bul/', 'birincil', 'fa-wand-magic-sparkles')}${dugme('Tüm programları gör', 'programlar/', 'hayalet', 'fa-list-check')}</div>`)}
${rk('AS-M1', { tur: 'sar' })}
${rk('KL-ANASAYFA', { tur: 'sar' })}
${bolum(`<div class="vurgu-panel acik"><div><span class="ust-etiket">${ikon('fa-user-doctor')} Diyetisyenler</span><h2>Bir Uzmanla Birebir Çalış</h2><p>Hedefini ve görüşme tercihini söyle, sana uygun uzmanı eşleştirelim. Doğrulandı rozeti yalnızca diploması ve mesleki kaydı kontrol edilen uzmanlara verilir.</p><div class="eylem-satiri">${dugme('Sana Uygun Diyetisyeni Bul', 'diyetisyen-bul-sihirbazi/', 'birincil', 'fa-wand-magic-sparkles')}${dugme('Tüm diyetisyenler', 'diyetisyenler/', 'hayalet')}</div></div><div class="satir-liste">${uzmanlar.map((d) => `<a class="satir-baglanti" href="${K}${DETAY.diyetisyen}"><span class="kisi-avatar" aria-hidden="true">${d.harf}</span><span>${kac(d.ad)}<small>${kac(d.uzmanlik[0])} · ${d.deneyim_yil} yıl deneyim</small></span></a>`).join('')}${rk('AS-SEF-1', { sira: 1 })}${rk('ana-sayfa.marka-sef-karti', { sira: 2 })}${rk('AS-SEF-2', { sira: 4 })}${rk('AS-CHEF')}</div></div>`)}
${rk('Y7', { tur: 'sar' })}
${bolum(`${bolumBas({ etiket: 'Dışarıda ne yesem', ikon: 'fa-location-dot', baslik: 'Dışarıda da Programına Uygun Seç', metin: 'Dada Gourmet mekanlarını şehrine, mutfağına ve beslenme tercihine göre süz.', arac: dugme('Tüm şehirler', 'disarida-ne-yesem/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c6">${SEHIRLER.map(([ad, n, dosya]) => `<a class="sonuc-kart" href="${K}disarida-ne-yesem/"><div class="sonuc-gorsel"><img src="${K}assets/img/sehir/sehir-${dosya}.webp" alt="" loading="lazy"></div><div class="sonuc-govde"><h3 class="kart-baslik">${ad}</h3><p>${n} mekan</p></div></a>`).join('')}</div>`)}
${rk('AS-COUPON', { tur: 'sar' })}
<section class="bolum foto-bolum kendi-zemini" data-bant-gorsel="${K}assets/img/hero/css-nasil-calisir-1.jpg"><div class="kap">${bolumBas({ etiket: 'Nasıl çalışır', ikon: 'fa-route', baslik: 'Dört Adımda Dada Diet', metin: 'Kendini tanımakla başla, uzman desteğiyle sürdür. Her adım kendi aracına bağlıdır.' })}<div class="okuma-kolon"><div class="kart tasma-kapali" id="adimPanel">${adimYol(ADIMLAR, 'nasilYol')}<div class="kart-alt ortali-alt"><button class="dugme hayalet" id="sonrakiAdim" type="button">Sonraki adım ${ikon('fa-arrow-right')}</button></div></div><div class="eylem-satiri yayik foto-eylem">${dugme('Sağlık Araçları', 'hesaplayicilar/', 'cizgili', 'fa-toolbox')}${dugme('Bana Uygun Olanı Bul', 'bana-uygun-olani-bul/', 'birincil', 'fa-arrow-right', true)}</div></div></div></section>
${rk('AS-SHOP', { tur: 'sar' })}
${bolum(`${bolumBas({ etiket: 'Bilimsel bilgilendirme', ikon: 'fa-flask', baslik: 'Bu İçerikler Nereye Dayanıyor?' })}${genelNot}<div class="bolum-eylem">${dugme('Bilimsel Kaynaklar', 'sayfa/bilimsel-kaynaklar/', 'hayalet', 'fa-arrow-right', true)}</div>`)}
${rk('AS-B1', { tur: 'sar' })}
</div>`;
  return [{ yol: '', meta: { baslik: 'Sağlığını mutfakta yönet', duzen: 'public', hero: true, js: [JS, 'assets/js/tercih-uyum.js', 'assets/js/sayfa/public-araclar-ray.js', 'assets/js/misafir.js', 'assets/js/sayfa/public-araclar-gunozet.js'] }, govde }];
};
