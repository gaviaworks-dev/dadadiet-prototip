// Bana Uygun Olanı Bul: dört adımlı yönlendirme sihirbazı, tümü istemci tarafı.
import { K, sayfaJs, sihirbazKabuk, adim, jsonGom, ikon } from '../../parcalar/public-araclar/ortak.mjs';

const ROTALAR = {
  bilgi: { metin: 'Önce mantığı öğrenmek istiyorsun. Rehber içerikleri kısa, genel ve uygulanabilir; hesaplama ve programa oradan geçmek daha kolay olur.',
    birincil: { ad: 'Besin Rehberi', metin: 'Dengeli tabak, öğün planı, porsiyon: mantığı önce anla.', href: 'besin-rehberi/', ikon: 'fa-book-open' },
    ikinci: [{ ad: 'Besin Kütüphanesi', metin: '541 besinin kalori ve makro değeri.', href: 'besin-kutuphanesi/', ikon: 'fa-magnifying-glass' }, { ad: 'Besin Karşılaştır', metin: 'İki besini yan yana gör.', href: 'besin-karsilastir/', ikon: 'fa-scale-balanced' }, { ad: 'Sağlık Testleri', metin: 'Birkaç soruda alışkanlığını ölç.', href: 'saglik-testleri/', ikon: 'fa-clipboard-question' }] },
  hesap: { metin: 'Önce rakamları görmek istiyorsun. Günlük kalori ihtiyacını hesapla, sonra sonucu tabağına taşı.',
    birincil: { ad: 'Günlük Kalori İhtiyacı', metin: 'Hedefine göre günlük enerji ihtiyacın.', href: 'hesaplayici/gunluk-kalori/', ikon: 'fa-utensils' },
    ikinci: [{ ad: 'Tüm Hesaplayıcılar', metin: 'BKİ, su, makro ve daha fazlası.', href: 'hesaplayicilar/', ikon: 'fa-calculator' }, { ad: 'Akıllı Tabak ve Değişim', metin: 'Tabağını kur, muadilini bul.', href: 'akilli-tabak-ve-degisim/', ikon: 'fa-chart-pie' }, { ad: 'Kaç Kalori?', metin: 'Porsiyon karşılıkları.', href: 'kac-kalori/', ikon: 'fa-fire' }] },
  program: { metin: 'Hazır bir düzen arıyorsun. Program Bul beş adımda hedefine ve süresine uyan menüleri eşleştirir.',
    birincil: { ad: 'Program Bul', metin: 'Beş adımda sana uygun programı eşleştir.', href: 'programlar/program-bul/', ikon: 'fa-wand-magic-sparkles' },
    ikinci: [{ ad: 'Hedefe Göre Programlar', metin: 'Kilo ver, dengelen, kas yap.', href: 'programlar/hedefe-gore/', ikon: 'fa-bullseye' }, { ad: 'Aralıklı Oruç Rehberi', metin: 'Protokolünü ve saatlerini seç.', href: 'aralikli-oruc-rehberi/', ikon: 'fa-clock' }, { ad: 'Sağlıklı Tarifler', metin: 'Sağlık odaklı tarif koleksiyonu.', href: 'tarifler/', ikon: 'fa-utensils' }] },
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
  const govde = `${adim({ id: 'amac', baslik: 'Bugün burada ne yapmak istiyorsun?', alt: 'Dört soruda sana en uygun başlangıç adımını gösterelim.', gorsel: 'hero/diet-hero-poster.jpg', alanlar: [{ ad: 'amac', secenekler: sec(A.amac) }] })}
${adim({ id: 'hedef', baslik: 'Neyi hedefliyorsun?', alt: 'Hedefin önerinin yönünü belirler.', gorsel: 'hero/programlar-dl-top.jpg', alanlar: [{ ad: 'hedef', secenekler: sec(A.hedef) }] })}
${adim({ id: 'duzen', baslik: 'Gününde beslenmeye ne kadar yer var?', alt: 'Sürdürebileceğin süre, ideal süreden daha değerli.', gorsel: 'hero/css-photo-1494859802809-d069c3b71a8a.jpg', alanlar: [{ ad: 'duzen', secenekler: sec(A.duzen) }] })}
${adim({ id: 'tercih', baslik: 'Beslenme tercihin ve özel bir durumun var mı?', alt: 'Öneriyi buna göre yorumlayalım.', gorselIkon: 'fa-notes-medical', alanlar: [{ ad: 'tercih', etiket: 'Beslenme tercihin', secenekler: sec(A.tercih) }, { ad: 'ozel', etiket: 'Özel durum', sinif: 'c3', secenekler: sec(A.ozel) }] })}
<section class="sihirbaz-adim" data-sonuc hidden><h1 tabindex="-1">Önerilen başlangıç adımın</h1><p id="sonucMetin"></p><div class="cipler sonuc-cipler" id="sonucCipler"></div><div class="uyari-kutu" id="sonucUyari" role="note" hidden>${ikon('fa-triangle-exclamation')}<span></span></div>
<h2 class="kart-baslik sihirbaz-alt-baslik">${ikon('fa-star')} Birincil öneri</h2><div id="sonucBirincil"></div><h2 class="kart-baslik sihirbaz-alt-baslik">${ikon('fa-compass')} İkinci seçenekler</h2><div class="kart-izgara c3" id="sonucIkinci"></div>
<div class="bolum-eylem"><a class="dugme hayalet" href="${K}programlar/">Programlar</a><button class="dugme birincil" type="button" data-bastan>${ikon('fa-rotate-left')} Baştan başla</button></div><p class="alt-not">${ikon('fa-circle-info')}<span>Bu sihirbaz bir yönlendirmedir; sağlık teşhisi koymaz, kişiye özel tıbbi ya da beslenme önerisi üretmez.</span></p></section>
<div class="sihirbaz-gorsel" id="sihirbazGorsel" aria-hidden="true"></div>`;
  return [{ yol: 'bana-uygun-olani-bul', meta: { baslik: 'Bana Uygun Olanı Bul', duzen: 'tam', js: sayfaJs('sihirbaz') }, govde: sihirbazKabuk({ id: 'uygun', cikis: '', govde, ek: jsonGom('sihirbazVeri', { rotalar: ROTALAR, etiketler: ['amac', 'hedef', 'duzen', 'tercih'].map(etiket) }) }) }];
};
