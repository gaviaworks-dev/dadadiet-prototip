// Akdeniz Tipi Beslenme: canlı program sayfasının 7 günlük öğün dökümü (_src/veri yalnız kart alanlarını taşıyor).
export const akdenizGunler = [
{
"kisa": "Pzt",
"gun": "1. Gün",
"ogunler": [
[
"Kahvaltı",
"Zeytinyağlı domates-biber 1 kâse + Haşlanmış yumurta 1 adet + Tam buğday ekmeği 2 dilim"
],
[
"Ara Öğün",
"Badem 1 avuç"
],
[
"Öğle Yemeği",
"Zeytinyağlı taze fasulye 1 tabak + Bulgur pilavı 1 kâse + Cacık 1 kâse"
],
[
"İkindi",
"Elma 1 orta boy"
],
[
"Akşam Yemeği",
"Izgara çipura 1 porsiyon + Yeşil salata 1 tabak + Zeytinyağlı közlenmiş patlıcan 1 kâse"
]
]
},
{
"kisa": "Sal",
"gun": "2. Gün",
"ogunler": [
[
"Kahvaltı",
"Menemen 1 porsiyon + Beyaz peynir 2 dilim + Zeytin 1 avuç"
],
[
"Ara Öğün",
"Ceviz 1 avuç"
],
[
"Öğle Yemeği",
"Mercimek çorbası 1 kâse + Kısır 1 tabak + Yoğurt 1 kâse"
],
[
"İkindi",
"Portakal 1 orta boy"
],
[
"Akşam Yemeği",
"Fırında somon 1 porsiyon + Buharda sebze 1 tabak + Bulgur pilavı 1 kâse"
]
]
},
{
"kisa": "Çar",
"gun": "3. Gün",
"ogunler": [
[
"Kahvaltı",
"Yulaf ezmesi 1 kâse + Kuru üzüm 1 tutam + Ceviz 1 avuç"
],
[
"Ara Öğün",
"Kuru kayısı 1 avuç"
],
[
"Öğle Yemeği",
"Zeytinyağlı barbunya 1 kâse + Tam buğday ekmeği 2 dilim + Cacık 1 kâse"
],
[
"İkindi",
"Armut 1 orta boy"
],
[
"Akşam Yemeği",
"Izgara köfte 3-4 adet + Zeytinyağlı türlü 1 tabak + Yeşil salata 1 tabak"
]
]
},
{
"kisa": "Per",
"gun": "4. Gün",
"ogunler": [
[
"Kahvaltı",
"Simit 1 adet + Beyaz peynir 2 dilim + Domates-salatalık 1 tabak"
],
[
"Ara Öğün",
"Fındık 1 avuç"
],
[
"Öğle Yemeği",
"Nohut yemeği 1 kâse + Pirinç pilavı 1 kâse + Ayran 1 bardak"
],
[
"İkindi",
"Muz 1 adet"
],
[
"Akşam Yemeği",
"Izgara tavuk 1 porsiyon + Zeytinyağlı kabak 1 kâse + Bulgur pilavı 1 kâse"
]
]
},
{
"kisa": "Cum",
"gun": "5. Gün",
"ogunler": [
[
"Kahvaltı",
"Peynirli omlet 1 porsiyon + Zeytin 1 avuç + Tam buğday ekmeği 2 dilim"
],
[
"Ara Öğün",
"Yeşil elma 1 orta boy"
],
[
"Öğle Yemeği",
"Ezogelin çorbası 1 kâse + Humus 2 yemek kaşığı + Sebzeli salata 1 tabak"
],
[
"İkindi",
"Kuru kayısı 1 avuç"
],
[
"Akşam Yemeği",
"Izgara levrek 1 porsiyon + Rokalı salata 1 tabak + Közlenmiş biber 1 kâse"
]
]
},
{
"kisa": "Cmt",
"gun": "6. Gün",
"ogunler": [
[
"Kahvaltı",
"Yoğurt 1 kâse + Granola 3-4 yemek kaşığı + Taze meyve 1 tabak"
],
[
"Ara Öğün",
"Ceviz-badem karışımı 1 avuç"
],
[
"Öğle Yemeği",
"Zeytinyağlı enginar 1 kâse + Bulgur pilavı 1 kâse + Cacık 1 kâse"
],
[
"İkindi",
"Greyfurt yarım adet"
],
[
"Akşam Yemeği",
"Mercimek köftesi 1 tabak + Yeşil salata 1 tabak + Tam buğday lavaş 1 adet"
]
]
},
{
"kisa": "Paz",
"gun": "7. Gün",
"ogunler": [
[
"Kahvaltı",
"Kaşarlı omlet 1 porsiyon + Domates 1 orta boy + Zeytin 1 avuç"
],
[
"Ara Öğün",
"Yaş üzüm 1 salkım"
],
[
"Öğle Yemeği",
"Zeytinyağlı pırasa 1 kâse + Bulgur pilavı 1 kâse + Yoğurt 1 kâse"
],
[
"İkindi",
"Nar yarım adet"
],
[
"Akşam Yemeği",
"Izgara hamsi 1 porsiyon + Zeytinyağlı roka salatası 1 tabak + Bulgur pilavı 1 kâse"
]
]
}
];

/* Öğün alternatifleri (SH-9-17): aynı öğünün yerine geçebilecek, aynı besin grubundan örnek. Canlı sayfada yoktu;
   prototip örneği, porsiyon ölçüleri ana öğünle aynı tutuldu. Sıra gün sırasıdır, anahtar öğün adıdır. */
export const akdenizAlternatif = [
  { 'Öğle Yemeği': 'Zeytinyağlı barbunya 1 kâse + Bulgur pilavı 1 kâse + Cacık 1 kâse', 'Akşam Yemeği': 'Izgara levrek 1 porsiyon + Yeşil salata 1 tabak + Zeytinyağlı közlenmiş patlıcan 1 kâse' },
  { 'Öğle Yemeği': 'Ezogelin çorbası 1 kâse + Kısır 1 tabak + Yoğurt 1 kâse', 'Akşam Yemeği': 'Izgara çipura 1 porsiyon + Buharda sebze 1 tabak + Bulgur pilavı 1 kâse' },
  { 'Öğle Yemeği': 'Nohut yemeği 1 kâse + Tam buğday ekmeği 2 dilim + Cacık 1 kâse', 'Akşam Yemeği': 'Izgara tavuk 1 porsiyon + Zeytinyağlı türlü 1 tabak + Yeşil salata 1 tabak' },
  { 'Öğle Yemeği': 'Kuru fasulye 1 kâse + Bulgur pilavı 1 kâse + Ayran 1 bardak', 'Akşam Yemeği': 'Izgara hindi 1 porsiyon + Zeytinyağlı kabak 1 kâse + Bulgur pilavı 1 kâse' },
  { 'Öğle Yemeği': 'Mercimek çorbası 1 kâse + Humus 2 yemek kaşığı + Sebzeli salata 1 tabak', 'Akşam Yemeği': 'Fırında somon 1 porsiyon + Rokalı salata 1 tabak + Közlenmiş biber 1 kâse' },
  { 'Öğle Yemeği': 'Zeytinyağlı bamya 1 kâse + Bulgur pilavı 1 kâse + Cacık 1 kâse', 'Akşam Yemeği': 'Nohutlu ıspanak 1 kâse + Yeşil salata 1 tabak + Tam buğday lavaş 1 adet' },
  { 'Öğle Yemeği': 'Zeytinyağlı taze fasulye 1 kâse + Bulgur pilavı 1 kâse + Yoğurt 1 kâse', 'Akşam Yemeği': 'Izgara sardalya 1 porsiyon + Zeytinyağlı roka salatası 1 tabak + Bulgur pilavı 1 kâse' },
];

/* Alışveriş listesi (SH-9-18): menüdeki her yemeğin ana malzemeleri. Tarif ölçüsü değildir; miktar yazılmaz.
   Grup: sebze (sebze ve meyve), protein (balık, et, yumurta), sut, tahil (tahıl ve baklagil), kuru (kuruyemiş, kuru meyve), yag (yağ, zeytin, diğer) */
export const MALZEME_GRUP = [['sebze', 'Sebze ve Meyve', 'fa-carrot'], ['protein', 'Balık, Et ve Yumurta', 'fa-fish'], ['sut', 'Süt Ürünleri', 'fa-cheese'], ['tahil', 'Tahıl ve Baklagil', 'fa-wheat-awn'], ['kuru', 'Kuruyemiş ve Kuru Meyve', 'fa-seedling'], ['yag', 'Yağ, Zeytin ve Diğer', 'fa-bottle-droplet']];
const s = (a) => [a, 'sebze'], pr = (a) => [a, 'protein'], su = (a) => [a, 'sut'], t = (a) => [a, 'tahil'], k = (a) => [a, 'kuru'], y = (a) => [a, 'yag'];
const ZY = y('Zeytinyağı');
export const akdenizMalzeme = {
  'Zeytinyağlı domates-biber': [s('Domates'), s('Yeşil biber'), ZY], 'Haşlanmış yumurta': [pr('Yumurta')], 'Tam buğday ekmeği': [t('Tam buğday ekmeği')], 'Badem': [k('Badem')],
  'Zeytinyağlı taze fasulye': [s('Taze fasulye'), s('Domates'), s('Kuru soğan'), ZY], 'Bulgur pilavı': [t('Pilavlık bulgur'), ZY], 'Cacık': [su('Yoğurt'), s('Salatalık')], 'Elma': [s('Elma')],
  'Izgara çipura': [pr('Çipura')], 'Yeşil salata': [s('Marul'), s('Maydanoz'), s('Limon'), ZY], 'Zeytinyağlı közlenmiş patlıcan': [s('Patlıcan'), s('Sarımsak'), ZY], 'Menemen': [pr('Yumurta'), s('Domates'), s('Yeşil biber'), ZY],
  'Beyaz peynir': [su('Beyaz peynir')], 'Zeytin': [y('Zeytin')], 'Ceviz': [k('Ceviz')], 'Mercimek çorbası': [t('Kırmızı mercimek'), s('Havuç'), s('Kuru soğan'), ZY], 'Kısır': [t('İnce bulgur'), s('Domates'), s('Maydanoz'), s('Taze soğan'), ZY],
  'Yoğurt': [su('Yoğurt')], 'Portakal': [s('Portakal')], 'Fırında somon': [pr('Somon'), s('Limon')], 'Buharda sebze': [s('Brokoli'), s('Havuç'), s('Kabak')], 'Yulaf ezmesi': [t('Yulaf ezmesi'), su('Süt')], 'Kuru üzüm': [k('Kuru üzüm')],
  'Kuru kayısı': [k('Kuru kayısı')], 'Zeytinyağlı barbunya': [t('Barbunya'), s('Havuç'), s('Kuru soğan'), ZY], 'Armut': [s('Armut')], 'Izgara köfte': [pr('Dana kıyma'), s('Kuru soğan')], 'Zeytinyağlı türlü': [s('Patlıcan'), s('Kabak'), s('Domates'), s('Yeşil biber'), ZY],
  'Simit': [t('Simit')], 'Domates-salatalık': [s('Domates'), s('Salatalık')], 'Fındık': [k('Fındık')], 'Nohut yemeği': [t('Nohut'), s('Kuru soğan'), s('Domates'), ZY], 'Pirinç pilavı': [t('Pirinç'), ZY], 'Ayran': [su('Ayran')], 'Muz': [s('Muz')],
  'Izgara tavuk': [pr('Tavuk göğsü')], 'Zeytinyağlı kabak': [s('Kabak'), s('Kuru soğan'), ZY], 'Peynirli omlet': [pr('Yumurta'), su('Beyaz peynir')], 'Yeşil elma': [s('Yeşil elma')], 'Ezogelin çorbası': [t('Kırmızı mercimek'), t('İnce bulgur'), t('Pirinç'), s('Kuru soğan')],
  'Humus': [t('Nohut'), y('Tahin'), s('Limon'), ZY], 'Sebzeli salata': [s('Marul'), s('Domates'), s('Salatalık'), ZY], 'Izgara levrek': [pr('Levrek')], 'Rokalı salata': [s('Roka'), s('Limon'), ZY], 'Közlenmiş biber': [s('Kırmızı biber'), ZY],
  'Granola': [t('Granola')], 'Taze meyve': [s('Mevsim meyvesi')], 'Ceviz-badem karışımı': [k('Ceviz'), k('Badem')], 'Zeytinyağlı enginar': [s('Enginar'), s('Havuç'), s('Bezelye'), ZY], 'Greyfurt': [s('Greyfurt')],
  'Mercimek köftesi': [t('Kırmızı mercimek'), t('İnce bulgur'), s('Taze soğan'), s('Maydanoz'), ZY], 'Tam buğday lavaş': [t('Tam buğday lavaş')], 'Kaşarlı omlet': [pr('Yumurta'), su('Kaşar peyniri')], 'Domates': [s('Domates')], 'Yaş üzüm': [s('Üzüm')],
  'Zeytinyağlı pırasa': [s('Pırasa'), s('Havuç'), t('Pirinç'), ZY], 'Nar': [s('Nar')], 'Izgara hamsi': [pr('Hamsi')], 'Zeytinyağlı roka salatası': [s('Roka'), s('Limon'), ZY],
};
