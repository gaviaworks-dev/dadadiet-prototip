// Akıllı Tabak onay özeti: Yasin Bey'in oranları, yeni yemekleri ve puan formülünü tek sayfada onaylaması için. Menüde yer almaz.
import { bolum, bolumBas } from '../../parcalar/public-araclar/ortak.mjs';

const tablo = (basliklar, satirlar) => `<div class="tablo-kap"><table class="tablo"><thead><tr>${basliklar.map((b) => `<th scope="col">${b}</th>`).join('')}</tr></thead><tbody>${satirlar.map((s) => `<tr>${s.map((h, i) => (i ? `<td>${h}</td>` : `<th scope="row">${h}</th>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
const hesap = '<span class="rozet olumlu">Hesaplanan</span>';
const tahmini = '<span class="rozet bekleme">Tahmini</span>';
const bag = (ad, url) => `<a class="metin-bag" href="${url}" target="_blank" rel="noopener">${ad}</a>`;
const HARVARD = 'https://nutritionsource.hsph.harvard.edu/healthy-eating-plate/';
const TUBER = 'https://hsgm.saglik.gov.tr/media/attachments/2025/05/12/turkiye-beslenme-rehberi-2022.pdf';
const MYPLATE = 'https://www.center4research.org/my-plate-dietary-guidelines/';
const USDA = 'https://fdc.nal.usda.gov/';

const kararlar = `<div class="uyari-kutu" role="note"><i class="fa-solid fa-signature" aria-hidden="true"></i><div class="yigin sik"><b>Onayınız gereken 4 konu</b><ol class="isaretli-liste">
<li><span><b>1.</b> Beş yemek grubunun oranları (Bölüm 1).</span></li>
<li><span><b>2.</b> Karnıyarık ve Somon Izgara değerleri (Bölüm 2).</span></li>
<li><span><b>3.</b> Puan formülü ve 0,47 katsayısı (Bölüm 3).</span></li>
<li><span><b>4.</b> Spesifikasyondaki yağ oranları ağırlık mı, enerji mi? Zeytinyağlı grubunda yağ %20 yazıyor, İmambayıldı tarifinde yağ ağırlıkça %3. Ağırlıksa grup oranları düşmeli.</span></li>
</ol></div></div>`;

const oranlar = `${bolumBas({ etiket: 'Bölüm 1', ikon: 'fa-chart-pie', baslik: 'Eksik grupların tabak oranları', metin: 'Yemeğin tabağa hangi oranda dağıldığı.' })}
<div class="bilgi-notu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><p><b>Kaynaklar yemek bazında oran vermez.</b> TÜBER, Harvard ve MyPlate besin gruplarını ve tabak ilkesini verir. Bu yüzden her malzemeyi bu kaynaklara göre bir bölmeye koyduk, oranı sitedeki tariflerin çiğ malzeme gramlarından hesapladık ve 5'e yuvarladık.</p></div>
${tablo(['Grup', 'Sebze', 'Protein', 'Karb', 'Yağ', 'Gerekçe', 'Kaynak', 'Durum'], [
  ['Salata', '%95', '%0', '%0', '%5', 'Mevsim Salatası: %98,5 sebze, %1,5 yağ. Tek tarife dayanıyor.', `Sebze bölmesi: ${bag('Harvard', HARVARD)}`, hesap],
  ['Yumurtalı yemek', '%45', '%50', '%0', '%5', '6 tarif ortalaması: %44,5 sebze, %53,1 protein, %0,8 karb, %1,6 yağ. Menemen %78 sebze, çılbır %95 protein; gruptaki fark büyük.', `Yumurta protein grubunda: ${bag('TÜBER 2022', TUBER)}, ${bag('MyPlate özeti', MYPLATE)}`, hesap],
  ['Meze', '%25', '%65', '%0', '%10', '3 tarif ortalaması: %23,8 sebze, %68,6 protein, %7,6 yağ. Süzme yoğurt, peynir ve nohut protein bölmesine yazıldı.', `Baklagil protein: ${bag('Harvard', HARVARD)}. Süt ayrı grup: ${bag('TÜBER 2022', TUBER)}, tabağımızda süt bölmesi yok`, hesap],
  ['Meyve', '%70', '%30', '%0', '%0', '2 tarif ortalaması: %70,8 meyve, %29,1 süt ürünü. Meyve salatası tek başına %100 meyve, smoothie %42.', `Meyve sebze yarısında: ${bag('Harvard', HARVARD)}`, hesap],
  ['Tatlı', '%75', '%20', '%0', '%5', '3 tarif ortalaması: %73,8 meyve, %19,7 yoğurt, %3,1 tatlandırıcı, %3,4 yağ. Yalnız meyveli hafif tatlılar; hamurlu ve şerbetli tatlıya uygulanamaz.', 'Kaynakta tatlı için bölme yok, malzemeler aynı kuralla ayrıldı', hesap],
])}
<p class="alan-yardim">Orta porsiyon gramları (ör. yumurtalı yemek 150 g) ve el/kap ölçüleri kaynaksızdır: ${tahmini}</p>`;

const yemekler = `${bolumBas({ etiket: 'Bölüm 2', ikon: 'fa-bowl-food', baslik: 'Karnıyarık ve Somon Izgara', metin: 'Bir porsiyonun değeri ve varsayımları.' })}
<div class="bilgi-notu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><p><b>Kaynak USDA FoodData Central.</b> TÜRKOMP sitesine bu ortamdan erişilemedi, arama sonuçlarında da karnıyarık kaydı bulunamadı. Malzeme değerleri ABD verisidir. TÜRKOMP'tan kontrol edilmesi önerilir.</p></div>
${tablo(['Yemek', 'Kalori', 'Protein', 'Yağ', 'Karb', 'Lif', 'Tabak oranı (sebze / protein / karb / yağ)'], [
  ['Karnıyarık, 1 patlıcan', '298 kcal', '14,4 g', '19,6 g', '18,8 g', '7,8 g', '%80 / %15 / %0 / %5'],
  ['Somon Izgara, 1 dilim', '353 kcal', '33,1 g', '23,5 g', '0 g', '0 g', '%0 / %95 / %0 / %5'],
])}
<div class="iki-kolon esit">
<div class="kart"><div class="kart-bas"><h3 class="kart-baslik">Karnıyarık varsayımı ${tahmini}</h3></div><div class="kart-govde yigin sik">
${tablo(['Malzeme', 'Çiğ gram', 'USDA FDC'], [['Patlıcan', '200 g', '169228'], ['Dana kıyma, %85 yağsız', '60 g', '171796'], ['Soğan', '30 g', '170000'], ['Domates', '60 g', '170457'], ['Yeşil biber', '20 g', '170427'], ['Domates salçası', '5 g', '170459'], ['Zeytinyağı', '10 g', '171413']])}
<p class="kart-metin">Fırında pişirme, patlıcan kızartılmıyor. Kızartılırsa yağ ve kalori artar. Toplam 385 g çiğ malzeme; pişmiş 300 g tahminidir. Hesaplanan oran %82 sebze, %16 protein, %3 yağ.</p></div></div>
<div class="kart"><div class="kart-bas"><h3 class="kart-baslik">Somon Izgara varsayımı ${tahmini}</h3></div><div class="kart-govde yigin sik">
${tablo(['Malzeme', 'Gram', 'USDA FDC'], [['Somon, Atlantik çiftlik, pişmiş', '150 g', '175168'], ['Zeytinyağı', '5 g', '171413']])}
<p class="kart-metin">150 g besin kütüphanemizdeki porsiyondur. Garnitür yok. Hesaplanan oran %97 protein, %3 yağ. Et grubu oranı (%15 sebze, %60 protein, %25 yağ) kullanılmadı, çünkü sade balıkta sebze yok. Bu yüzden tek başına 39 puan alır, yanına salata ve bulgur eklenince 96 olur.</p></div></div>
</div>`;

const puan = `${bolumBas({ etiket: 'Bölüm 3', ikon: 'fa-calculator', baslik: 'Puan formülü', metin: 'Puanın nasıl hesaplandığı.' })}
<div class="uyari-kutu" role="note"><i class="fa-solid fa-square-root-variable" aria-hidden="true"></i><span><b>Puan = 100 − 0,47 × toplam sapma</b>. Sonuç tam sayıya yuvarlanır, 0'ın altına düşmez.</span></div>
${tablo(['Bileşen', 'Etki', 'Değer'], [
  ['Başlangıç', '100 puan', 'Boş olmayan her tabak'],
  ['Sebze %40–50', 'Aralık dışındaki her yüzde puan −0,47', 'Aralık: spesifikasyon v1.2'],
  ['Protein %20–25', 'Aralık dışındaki her yüzde puan −0,47', 'Aralık: spesifikasyon v1.2'],
  ['Karbonhidrat %20–25', 'Aralık dışındaki her yüzde puan −0,47', 'Aralık: spesifikasyon v1.2'],
  ['Yağ %5–10', 'Aralık dışındaki her yüzde puan −0,47', 'Aralık: spesifikasyon v1.2'],
  ['Bonus', 'Yok', 'Lif, kalori, şeker ve yağ kalitesi puana girmez'],
])}
<p class="alan-yardim">Aralık içindeki bölmeye ceza yoktur. 0,47 katsayısı ${tahmini}: spesifikasyon formül vermediği için Mercimek Köftesi ~72 örneğine göre ayarlandı.</p>
${tablo(['Örnek tabak', 'Sebze', 'Protein', 'Karb', 'Yağ', 'Toplam sapma', 'Hesap', 'Puan'], [
  ['Mercimek Köftesi, orta', '%10', '%30', '%50', '%10', '30 + 5 + 25 + 0 = 60', '100 − 0,47 × 60 = 71,8', '<b>72</b>'],
  ['Köfte + 1 porsiyon roka', '%40', '%20', '%33,3', '%6,7', '0 + 0 + 8,3 + 0 = 8,3', '100 − 0,47 × 8,3 = 96,1', '<b>96</b>'],
  ['Fırında tavuk + bulgur + mevsim salatası, üçü orta', '%40', '%24,5', '%19,1', '%16,4', '0 + 0 + 0,9 + 6,4 = 7,3', '100 − 0,47 × 7,3 = 96,6', '<b>97</b>'],
])}`;

const kaynaklar = `${bolumBas({ etiket: 'Kaynaklar', ikon: 'fa-book-open', baslik: 'Kaynaklar ve sınırlar' })}
<ul class="isaretli-liste">
<li><i class="fa-solid fa-link" aria-hidden="true"></i><span>${bag('Harvard Healthy Eating Plate', HARVARD)}: sebze ve meyve ½, tam tahıl ¼, protein ¼; patates sebze sayılmaz. Sayfadan doğrulandı.</span></li>
<li><i class="fa-solid fa-link" aria-hidden="true"></i><span>${bag('Türkiye Beslenme Rehberi 2022, Sağlık Bakanlığı sunumu', TUBER)}: et, yumurta ve kurubaklagil aynı grup; süt ayrı grup. Tam rehber metni değil, sunum okundu.</span></li>
<li><i class="fa-solid fa-link" aria-hidden="true"></i><span>${bag('MyPlate özeti', MYPLATE)}: yumurta ve baklagil protein, süt tabağın yanında. myplate.gov'a erişilemedi, ikincil kaynaktır.</span></li>
<li><i class="fa-solid fa-link" aria-hidden="true"></i><span>${bag('USDA FoodData Central', USDA)}: tablodaki FDC numaralı SR Legacy kayıtları, API'den okundu.</span></li>
<li><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>TÜRKOMP'a erişilemedi. Salata ve meyve oranları bir ya da iki tarife dayanıyor. Değerler prototip içindir, uzman onayı olmadan kesinleşmez.</span></li>
</ul>`;

export default () => [{
  yol: 'onay/akilli-tabak',
  meta: { baslik: 'Akıllı Tabak Onay Özeti', duzen: 'public', aktif: 'Sağlık Araçları' },
  govde: `<div class="bolum-dizi">
${bolum(`<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid fa-clipboard-check" aria-hidden="true"></i> Yasin Bey için · 07.11.2026</span><h1>Akıllı Tabak onay özeti</h1><p class="giris-metni">Karar verildi: Mercimek Köftesi %50 karb, %30 protein, %10 sebze, %10 yağ kalıyor; adres /akilli-tabak-ve-degisim kalıyor.</p></div></div>${kararlar}`, { sinif: 'kabuk-alti' })}
${bolum(oranlar)}
${bolum(yemekler)}
${bolum(puan)}
${bolum(kaynaklar)}
</div>`,
}];
