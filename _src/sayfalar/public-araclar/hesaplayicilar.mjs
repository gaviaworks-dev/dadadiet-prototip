// Hesaplayıcılar listesi + günlük kalori detayı (sonuç istemcide hesaplanır, formül _src/veri/hesaplayicilar.json).
import { K, JS, sayfaJs, bant, bolum, bolumBas, dugme, ikon, ikonKart, hesapKart, genelNot, kirinti, kac } from '../../parcalar/public-araclar/ortak.mjs';
import { bicim } from '../../parcalar/bicim.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';
const ustSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', kap: false })).join('');
const sonSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', konum: 'alt' })).join('');

const AKTIVITE = [
  ['1.2', 'Hareketsiz', 'Masa başı, egzersiz yok'], ['1.375', 'Az aktif', 'Haftada 1-3 gün düşük yoğunluklu egzersiz'], ['1.55', 'Orta aktif', 'Haftada 3-5 gün egzersiz'],
  ['1.725', 'Çok aktif', 'Haftada 6-7 gün yoğun egzersiz'], ['1.9', 'Atlet', 'Günde çift antrenman ya da ağır fiziksel iş'],
];
/* Site haritası 7.2 "Ne öğrenmek istiyorsun?" + Sayfa Revizesi 1 H1: Gastro araç sayfasındaki sekme yapısı (dadagastro.com/olcu-birimleri .ob-tabs:
   ikon + etiket, aktif dolgu, dar ekranda yatay kayar) kanon sekme rayıyla kurulur. Sekme, aynı sayfadaki araç ızgarasını amaca göre süzer
   (public-araclar-liste.js, ?amac= ile ön seçilir). Beslenme alışkanlığı bir testtir: ızgarada test kartı olarak durur. */
const AMAC = [['enerji', 'Enerji ihtiyacım', 'fa-fire'], ['ideal', 'İdeal aralığım', 'fa-weight-scale'], ['su', 'Su ihtiyacım', 'fa-droplet'], ['aliskanlik', 'Beslenme alışkanlıklarım', 'fa-clipboard-question'], ['metabolizma', 'Metabolizma ritmim', 'fa-heart-pulse']];
const HESAP_AMAC = { 'gunluk-kalori': 'enerji metabolizma', 'bazal-metabolizma': 'enerji metabolizma', 'makro-dagilim': 'enerji', 'porsiyon-hesaplama': 'enerji', 'beden-kutle-endeksi': 'ideal', 'ideal-kilo': 'ideal', 'vucut-yag-orani': 'ideal', 'vucut-tipi': 'ideal', 'hedef-kilo-suresi': 'ideal', 'gunluk-su': 'su' };
const testKart = ikonKart({ href: 'test/beslenme/', ikon: 'fa-clipboard-question', baslik: 'Beslenme Alışkanlığı Testi', metin: 'Günlük tabağını analiz et, dengeni gör', ek: ' data-kart data-amac="aliskanlik"' });
const amacListe = (H) => {
  const kartlar = H.map((h) => hesapKart(h, ` data-kart data-amac="${HESAP_AMAC[h.slug] || ''}"`)).join('') + testKart;
  const sayi = (a) => H.filter((h) => (HESAP_AMAC[h.slug] || '').split(' ').includes(a)).length + (a === 'aliskanlik' ? 1 : 0);
  return `<div data-liste data-alan="amac" data-param="amac" data-boyut="24" data-birim="araç">
<div class="sekme-ray liste-ust tam-serit-kap"><div class="sekmeler suzgec tam-serit" role="tablist" aria-label="Ne öğrenmek istiyorsun?"><button class="sekme aktif" type="button" role="tab" data-deger="" aria-selected="true">${ikon('fa-layer-group')} Tümü <span class="sekme-sayi">${H.length + 1}</span></button>${AMAC.map(([d, a, i]) => `<button class="sekme" type="button" role="tab" data-deger="${d}" aria-selected="false" tabindex="-1">${ikon(i)} ${a} <span class="sekme-sayi">${sayi(d)}</span></button>`).join('')}</div></div>
<div class="kart-izgara c3" data-izgara>${kartlar}</div>
<nav class="sayfalama" data-sayfalama aria-label="Sayfalama" hidden></nav>
</div>`;
};
const girdi = (id, ad, birim, g) => `<div class="alan"><label class="alan-etiket" for="${id}">${ad} <span class="zorunlu" aria-hidden="true">*</span></label><div class="alan-birimli"><input class="alan-girdi" id="${id}" type="number" inputmode="decimal" min="${g.min}" max="${g.max}" required aria-describedby="${id}Hata"><span>${birim}</span></div><span class="alan-hata" id="${id}Hata">${ikon('fa-circle-exclamation')} ${ad} ${g.min} ile ${g.max} arasında olmalı.</span></div>`;

export default ({ veri }) => {
  const s = veri.sayaclar, H = veri.hesaplayicilar.hesaplayicilar;
  const h = H.find((x) => x.slug === 'gunluk-kalori'), g = h.girdiler;
  const liste = `${bant({ yol: [['Hesaplayıcılar']], etiket: 'Sağlık araçları', etiketIkon: 'fa-calculator', h1: 'Vücudunu <span class="vurgu">rakamlarla</span> tanı', gorsel: 'hero/hesaplayicilar-tst-top.webp', alt: 'Kalori, makro, su ve kilo hesaplarını birkaç saniyede yap; sonucuna göre program ve porsiyon önerilerine geç.', eylem: dugme('Bana Uygun Olanı Bul', 'bana-uygun-olani-bul/', 'koyu-zemin', 'fa-compass'), sayilar: [[s.hesaplayici, 'Hesaplayıcı'], [s.test, 'Sağlık testi'], [s.besin, 'Besin değeri']] })}
<div class="bolum-dizi">
${bolum(`${ustSerit('OB-B1')}${bolumBas({ etiket: 'Hesaplayıcılar', ikon: 'fa-calculator', baslik: 'Hangi Değerini Öğrenmek İstiyorsun?', metin: 'Her araç referans denklemlere dayanır; sonuçlar tahminidir.' })}${amacListe(H)}${rk('OB-B1-SIDE', { tur: 'yan' })}`, { ilk: true })}
${bolum(`${bolumBas({ etiket: 'Kayıtlı sonuçlar', ikon: 'fa-folder-open', baslik: 'Son Sonuçların', metin: 'Kaydettiğin son hesap ve test sonuçları. Tamamı Sağlık Dosyam’da.', arac: dugme('Sağlık Dosyam', 'hesabim/saglik-dosyam/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c3" data-son-sonuclar></div>`, { sinif: 'oturum-acik' })}
${bolum(`${bolumBas({ etiket: 'Sonucu kullan', ikon: 'fa-arrow-right-long', baslik: 'Rakamdan Tabağa Geç', metin: 'Hesapladığın değeri günlük seçimlerine taşı.' })}<div class="kart-izgara c3">${ikonKart({ href: 'akilli-tabak-ve-degisim/', ikon: 'fa-chart-pie', baslik: 'Akıllı Tabak ve Değişim', metin: 'Tabağını kur, muadilini bul' })}${ikonKart({ href: 'saglik-testleri/', ikon: 'fa-clipboard-question', baslik: 'Sağlık Testleri', metin: `${s.test} test ile alışkanlığını ölç` })}${ikonKart({ href: 'programlar/program-bul/', ikon: 'fa-wand-magic-sparkles', baslik: 'Program Bul', metin: 'Beş adımda eşleştirme' })}</div>`)}
${bolum(genelNot)}
${sonSerit('OB-B1-END')}
</div>`;

  const detay = `${bant({ yol: [['Hesaplayıcılar', 'hesaplayicilar/'], [h.ad]], etiket: 'Hesaplayıcı', etiketIkon: 'fa-utensils', h1: kac(h.ad), gorsel: 'hero/hesaplayicilar-tst-top.webp', alt: kac(h.aciklama) })}
<div class="bolum-dizi">
${bolum(`<div class="sekme-ray liste-ust"><nav class="sekmeler" aria-label="Hesaplayıcılar">${H.map((x) => `<a class="sekme${x.slug === h.slug ? ' aktif' : ''}" href="${K}hesaplayici/gunluk-kalori/"${x.slug === h.slug ? ' aria-current="page"' : ` data-toast="Prototipte Günlük Kalori aracı örneklendi." data-toast-tip="uyari"`}>${ikon(x.ikon)} ${kac(x.kisa_ad)}</a>`).join('')}</nav></div>
<div class="iki-kolon esit">
<form class="kart" id="kaloriForm" novalidate data-ek-erkek="${h.formul_ayarlari.cinsiyet_ekleri.erkek}" data-ek-kadin="${h.formul_ayarlari.cinsiyet_ekleri.kadin}" data-bant="${h.formul_ayarlari.band_farki_kcal}">
<div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-pen')} Bilgilerini Gir</h2><p>Sonucun bu sayfada hesaplanır, hiçbir yere gönderilmez.</p></div></div>
<div class="kart-govde">
<div class="alan-izgara c2">${girdi('boy', 'Boy', 'cm', g.boy_cm)}${girdi('kilo', 'Kilo', 'kg', g.kilo_kg)}${girdi('yas', 'Yaş', 'yaş', g.yas)}
<div class="alan"><span class="alan-etiket" id="cinsiyetEtiket">Cinsiyet <span class="zorunlu" aria-hidden="true">*</span></span><div class="segment" id="cinsiyet" role="group" aria-labelledby="cinsiyetEtiket"><button type="button" data-deger="kadin" aria-pressed="false">Kadın</button><button type="button" data-deger="erkek" aria-pressed="false">Erkek</button></div><span class="alan-hata" id="cinsiyetHata">${ikon('fa-circle-exclamation')} Cinsiyet seç.</span></div></div>
<div class="alan"><span class="alan-etiket" id="aktiviteEtiket">Aktivite düzeyi <span class="zorunlu" aria-hidden="true">*</span></span><div class="alan-secenek-izgara" id="aktivite" data-tek-secim role="group" aria-labelledby="aktiviteEtiket">${AKTIVITE.map(([v, a, y]) => `<button class="secenek" type="button" data-deger="${v}" aria-pressed="false"><span>${a}<small>${y}</small></span><span class="secenek-ek">×${bicim.sayi(v, 3)}</span></button>`).join('')}</div><span class="alan-hata" id="aktiviteHata">${ikon('fa-circle-exclamation')} Aktivite düzeyini seç.</span><p class="alan-yardim"><span>Günlük ihtiyaç = BMH (Mifflin-St Jeor) × aktivite katsayısı. Bu araç yetişkinler içindir.</span></p></div>
</div>
<div class="kart-alt"><button class="dugme hayalet" id="sifirla" type="button">Sıfırla</button><button class="dugme birincil" type="submit">${ikon('fa-calculator')} Hesapla</button></div>
</form>
<div class="yapiskan" aria-live="polite">
<div class="kart" id="sonucBos"><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-calculator')}</span><h3>Sonucun burada görünecek</h3><p>Bilgilerini girip Hesapla'ya bas ya da örnek bir profille dene.</p><button class="dugme hayalet" id="ornek" type="button">Örnekle dene</button></div></div>
<div class="kart sonuc-yuzeyi" id="sonuc" hidden><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-chart-simple')} Sonucun</h2><span class="rozet olumlu" id="sonucAktivite"></span></div><div class="kart-govde"><p class="sonuc-sayi"><span id="tdee"></span> <small>kcal / gün</small></p><p class="kart-metin">Kilonu korumak için yaklaşık enerji ihtiyacın. Bazal metabolizman <b id="bmh"></b> kcal.</p>
<div class="sayac-serit"><div class="sayac">${ikon('fa-arrow-trend-down')}<div><span>Kilo vermek için</span><b id="kiloVer"></b></div></div><div class="sayac">${ikon('fa-arrow-trend-up')}<div><span>Kilo almak için</span><b id="kiloAl"></b></div></div></div>
<p class="alan-yardim" id="altSinir" hidden><span>Yetişkin için en düşük enerji düzeyi 1.400 kcal olarak gösterildi (TÜBER 2022, Ek 3.1.1).</span></p>
<div class="alan"><span class="alan-etiket" id="hedefEtiket">Hedefin ne?</span><div class="segment tam-segment" id="hedefSec" role="group" aria-labelledby="hedefEtiket"><button type="button" data-deger="ver" aria-pressed="false">${ikon('fa-arrow-trend-down')} Kilo vermek</button><button type="button" data-deger="koru" aria-pressed="true">${ikon('fa-equals')} Korumak</button><button type="button" data-deger="al" aria-pressed="false">${ikon('fa-arrow-trend-up')} Kilo almak</button></div><p class="alan-yardim"><span>Günlük kalori hedefin: <b id="hedefKcal"></b></span></p></div>
<p class="sonuc-kayit misafir oturum-kapali">${ikon('fa-triangle-exclamation')}<span><b>Kapatırsan verilerin silinecek;</b> profiline kaydedip gelişimini takip etmek için kaydol.</span></p><p class="sonuc-kayit" id="hedefDurum" role="status" hidden></p></div>
<div class="kart-alt yigilir"><button class="dugme hayalet" id="kaydet" type="button">${ikon('fa-folder-plus')} Sonucumu Sağlık Dosyama kaydet</button><button class="dugme birincil" id="hedefBelirle" type="button">${ikon('fa-bullseye')} Hedefimi belirle</button></div>
<div class="kart-govde ust-cizgili"><a class="baglanti-metin" href="${K}programlar/program-bul/">Hedefine uygun programları gör ${ikon('fa-arrow-right')}</a></div></div>
${rk('OB-DONUSTURUCU')}
<p class="alt-not">${ikon('fa-book')} <span>Kaynak: TÜBER 2022, Türkiye Beslenme Rehberi. Mifflin-St Jeor denklemi, hesaplama sürümü 2 (canlı sitedeki sürüm), prototip verisi ${bicim.tarih(veri.hesaplayicilar.uretim)}. Sonuç tahminidir, tıbbi tavsiye değildir.</span></p>
</div></div>`, { ilk: true })}
${bolum(`${bolumBas({ etiket: 'Diğer araçlar', ikon: 'fa-calculator', baslik: 'Hesaplamaya Devam Et', arac: dugme('Tüm hesaplayıcılar', 'hesaplayicilar/', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c3">${ikonKart({ href: 'akilli-tabak-ve-degisim/', ikon: 'fa-chart-pie', baslik: 'Akıllı Tabak ve Değişim', metin: 'Bu kaloriyi tabağa dök' })}${ikonKart({ href: 'kac-kalori/', ikon: 'fa-fire', baslik: 'Kaç Kalori?', metin: 'Porsiyon karşılıklarını gör' })}${ikonKart({ href: 'diyetisyen-bul-sihirbazi/', ikon: 'fa-user-doctor', baslik: 'Diyetisyene Danış', metin: 'Sonucunu uzmanla yorumla' })}</div>`)}
${bolum(genelNot)}
</div>`;

  return [
    { yol: 'hesaplayicilar', meta: { baslik: 'Hesaplayıcılar', duzen: 'public', aktif: 'Sağlık Araçları', hero: true, js: [...sayfaJs('liste', 'sonuclar'), 'assets/js/misafir.js'] }, govde: liste },
    { yol: 'hesaplayici/gunluk-kalori', meta: { baslik: h.ad, duzen: 'public', aktif: 'Sağlık Araçları', hero: true, js: [...sayfaJs('kalori'), 'assets/js/misafir.js'] }, govde: detay },
  ];
};
