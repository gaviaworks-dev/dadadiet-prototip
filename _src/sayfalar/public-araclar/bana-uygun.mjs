// Bana Uygun Olanı Bul: dört adımlı yönlendirme sihirbazı, tümü istemci tarafı.
import { K, sayfaJs, bant, sihirbazBolum, adim, jsonGom, ikon, guven } from '../../parcalar/public-araclar/ortak.mjs';

const ROTALAR = {
  bilgi: { metin: 'Önce mantığı öğrenmek istiyorsun. Rehber içerikleri kısa, genel ve uygulanabilir; hesaplama ve programa oradan geçmek daha kolay olur.',
    birincil: { ad: 'Besin Rehberi', metin: 'Dengeli tabak, öğün planı, porsiyon: mantığı önce anla.', href: 'besin-rehberi/', ikon: 'fa-book-open' },
    ikinci: [{ ad: 'Besin Kütüphanesi', metin: '541 besinin kalori ve makro değeri.', href: 'besin-kutuphanesi/', ikon: 'fa-magnifying-glass' }, { ad: 'Besin Karşılaştır', metin: 'İki besini yan yana gör.', href: 'besin-karsilastir/', ikon: 'fa-scale-balanced' }, { ad: 'Sağlık Testleri', metin: 'Birkaç soruda alışkanlığını ölç.', href: 'saglik-testleri/', ikon: 'fa-clipboard-question' }] },
  hesap: { metin: 'Önce rakamları görmek istiyorsun. Günlük kalori ihtiyacını hesapla, sonra sonucu tabağına taşı.',
    birincil: { ad: 'Günlük Kalori İhtiyacı', metin: 'Hedefine göre günlük enerji ihtiyacın.', href: 'hesaplayici/gunluk-kalori/', ikon: 'fa-utensils' },
    ikinci: [{ ad: 'Tüm Hesaplayıcılar', metin: 'BKİ, su, makro ve daha fazlası.', href: 'hesaplayicilar/', ikon: 'fa-calculator' }, { ad: 'Akıllı Tabak ve Değişim', metin: 'Tabağını kur, muadilini bul.', href: 'akilli-tabak-ve-degisim/', ikon: 'fa-chart-pie' }, { ad: 'Kaç Kalori?', metin: 'Porsiyon karşılıkları.', href: 'kac-kalori/', ikon: 'fa-fire' }] },
  program: { metin: 'Hazır bir düzen arıyorsun. Program Bul beş adımda hedefine ve süresine uyan menüleri eşleştirir.',
    birincil: { ad: 'Program Bul', metin: 'Beş adımda sana uygun programı eşleştir.', href: 'programlar/program-bul/', ikon: 'fa-wand-magic-sparkles' },
    ikinci: [{ ad: 'Hedefe Göre Programlar', metin: 'Kilo ver, dengelen, kas yap.', href: 'programlar/hedefe-gore/', ikon: 'fa-bullseye' }, { ad: 'Aralıklı Oruç Rehberi', metin: 'Protokolünü ve saatlerini seç.', href: 'aralikli-oruc-rehberi/', ikon: 'fa-clock' }, { ad: 'Akıllı Tabak ve Değişim', metin: 'Tabağını kur, muadilini bul.', href: 'akilli-tabak-ve-degisim/', ikon: 'fa-chart-pie' }] },
  uzman: { metin: 'Birebir destek istiyorsun. Hedefini ve görüşme tercihini söyle, sana uygun uzmanı eşleştirelim.',
    birincil: { ad: 'Diyetisyen Bul', metin: 'Hedef, uzmanlık, şehir ve bütçeye göre eşleştir.', href: 'diyetisyen-bul-sihirbazi/', ikon: 'fa-user-doctor' },
    ikinci: [{ ad: 'Diyetisyenler', metin: 'Uzman profillerini incele.', href: 'diyetisyenler/', ikon: 'fa-user-group' }, { ad: 'Uzmanla Çalışma Rehberi', metin: 'Süreç nasıl işler?', href: 'sayfa/uzmanla-calisma-rehberi/', ikon: 'fa-book-open' }, { ad: 'Program Bul', metin: 'Beklerken bir programa göz at.', href: 'programlar/program-bul/', ikon: 'fa-wand-magic-sparkles' }] },
};
const A = {
  amac: [['bilgi', 'Bilgi edinmek', 'Beslenmenin mantığını öğren', 'fa-book-open'], ['hesap', 'Hesaplama yapmak', 'Kalori, BKİ, makro, su', 'fa-calculator'], ['program', 'Program bulmak', 'Hazır bir beslenme planı', 'fa-list-check'], ['uzman', 'Uzman desteği almak', 'Diyetisyenle birebir çalış', 'fa-user-doctor']],
  hedef: [['dengeli', 'Dengeli beslenme', 'Düzeni oturt, sürdürülebilir kıl', 'fa-scale-balanced'], ['kilo', 'Kilo kontrolü', 'Sağlıklı kiloya ulaş, koru', 'fa-weight-scale'], ['sporcu', 'Sporcu beslenmesi', 'Performans ve toparlanma', 'fa-dumbbell'], ['bitkisel', 'Bitkisel beslenme', 'Vejetaryen veya vegan düzen', 'fa-seedling'], ['kesif', 'Genel keşif', 'Henüz net bir hedefim yok', 'fa-compass']],
  duzen: [['az', "Günde 15 dk'dan az", 'Yoğun tempo, pratik çözüm', 'fa-bolt'], ['orta', '15–30 dk', 'Dengeli bir düzen kurabilirim', 'fa-clock'], ['cok', '30 dk ve üzeri', 'Mutfakta vakit geçirebilirim', 'fa-kitchen-set']],
  tercih: [['standart', 'Standart', 'Özel bir kısıtım yok'], ['vejetaryen', 'Vejetaryen', 'Et yok, süt ve yumurta var'], ['vegan', 'Vegan', 'Tamamen bitkisel'], ['diger', 'Diğer', 'Glutensiz, laktozsuz, başka']],
  ozel: [['yok', 'Yok', 'Bildiğim bir durum yok'], ['alerji', 'Besin alerjim var', 'Alerji veya intolerans'], ['saglik', 'Sağlık durumum var', 'Gebelik, kronik hastalık, ilaç']],
};
const sec = (l) => l.map(([deger, baslik, alt, i]) => ({ deger, baslik, alt, ikon: i }));
const etiket = (alan) => ({ 0: alan, ...Object.fromEntries(A[alan].map(([d, b]) => [d, b])) });

export default () => {
  const govde = `${adim({ id: 'amac', baslik: 'Bugün Burada Ne Yapmak İstiyorsun?', alt: 'Seni doğru araca yönlendirelim.', alanlar: [{ ad: 'amac', secenekler: sec(A.amac) }] })}
${adim({ id: 'hedef', baslik: 'Neyi Hedefliyorsun?', alt: 'Hedefin önerinin yönünü belirler.', alanlar: [{ ad: 'hedef', secenekler: sec(A.hedef) }] })}
${adim({ id: 'duzen', baslik: 'Gününde Beslenmeye Ne Kadar Yer Var?', alt: 'Sürdürebileceğin süre, ideal süreden daha değerli.', alanlar: [{ ad: 'duzen', sinif: 'c3', secenekler: sec(A.duzen) }] })}
${adim({ id: 'tercih', baslik: 'Beslenme Tercihin ve Özel Bir Durumun Var mı?', alt: 'Öneriyi buna göre yorumlayalım.', alanlar: [{ ad: 'tercih', etiket: 'Beslenme Tercihin', secenekler: sec(A.tercih) }, { ad: 'ozel', etiket: 'Özel Durum', sinif: 'c3', secenekler: sec(A.ozel) }] })}`;
  const sonuc = `<section class="sihirbaz-adim" data-sonuc hidden><div class="bolum-bas"><div><h2 tabindex="-1">Önerilen Başlangıç Adımın</h2><p class="giris-metni" id="sonucMetin"></p></div></div><div class="cipler sonuc-cipler" id="sonucCipler"></div><div class="uyari-kutu" id="sonucUyari" role="note" hidden>${ikon('fa-triangle-exclamation')}<span></span></div>
<h3 class="kart-baslik sihirbaz-alt-baslik">${ikon('fa-star')} Birincil Öneri</h3><div id="sonucBirincil"></div><h3 class="kart-baslik sihirbaz-alt-baslik">${ikon('fa-compass')} İkinci Seçenekler</h3><div class="kart-izgara c3" id="sonucIkinci"></div>
<div class="bolum-eylem"><span class="kaydet-yeri" id="sonucKaydet"></span><a class="dugme hayalet" href="${K}programlar/">Programlar</a><button class="dugme birincil" type="button" data-bastan>${ikon('fa-rotate-left')} Baştan başla</button></div></section>`;
  const sayfa = `${bant({ yol: [['Bana Uygun Olanı Bul']], etiket: 'Başlangıç rehberi', etiketIkon: 'fa-compass', h1: 'Nereden başlayacağını <span class="vurgu">birlikte bulalım</span>', gorsel: 'hero/anasayfa-sh-hero-vid.webp', alt: 'Dört kısa soru: neyi amaçladığın, neyi hedeflediğin, gününde ne kadar yer olduğu ve beslenme tercihin. Sonunda sana uygun ilk adımı ve alternatiflerini gösteriyoruz.', alttaki: guven([['fa-stopwatch', '1 dakikadan kısa'], ['fa-shuffle', 'Araç, program ve uzman önerisi'], ['fa-shield-halved', 'Tıbbi teşhis üretmez']]) })}
<div class="bolum-dizi">${sihirbazBolum({ id: 'uygun', adimlar: [['Amacın', 'Ne yapmak istiyorsun?'], ['Hedefin', 'Neye ulaşmak istiyorsun?'], ['Günlük Düzen', 'Ne kadar vaktin var?'], ['Tercih', 'Beslenme ve özel durum']], govde, sonuc, not: 'Bu sihirbaz bir <b>yönlendirmedir</b>; <b>sağlık teşhisi koymaz, kişiye özel tıbbi ya da beslenme önerisi üretmez.</b> Verdiği sonuç genel bilgi ve seçimlerine dayanan bir başlangıç önerisidir. Gebelik, kronik hastalık, düzenli ilaç kullanımı, besin alerjisi veya klinik bir durum varsa plana başlamadan önce bir diyetisyene ve hekimine danış.', ek: jsonGom('sihirbazVeri', { rotalar: ROTALAR, etiketler: ['amac', 'hedef', 'duzen', 'tercih'].map(etiket) }) })}</div>`;
  return [{ yol: 'bana-uygun-olani-bul', meta: { baslik: 'Bana Uygun Olanı Bul', duzen: 'public', hero: true, js: [...sayfaJs('sihirbaz'), 'assets/js/misafir.js'] }, govde: sayfa }];
};
