// Rozetlerim: Dada Gastro profil rozet sayfasının yapısı (DadaGastro resources/views/turetilmis/uye/g-rozetlerim.blade.php).
// Kimlik bandı + ortalı sekme rayı (Koleksiyon, Kademem, Puan Defteri, Liderlik) ve her sekmede Gastro'nun bölüm sırası.
// Gastro'da karşılığı olmayan Meydan Okumalar aynı rayda beşinci sekme.
import { uyeSayfa, bolumBas, bilgi } from '../../parcalar/uye/ust.mjs';
import { aileler, kademeler } from '../../parcalar/uye/rozet-katalog.mjs';

const blok = (ic, ilk = false) => `<div class="yigin sik${ilk ? '' : ' ayrik'}">${ic}</div>`;

// Kademe ikonları: Gastro RozetServisi::KADEME_IKON karşılığı, Diet merdiveninin sekiz basamağı
const kademeIkon = { 'Başlangıç': 'fa-flag', Fidan: 'fa-seedling', Filiz: 'fa-leaf', Dengeli: 'fa-scale-balanced', 'Kararlı': 'fa-mountain', Usta: 'fa-medal', Rehber: 'fa-compass', 'Öncü': 'fa-crown' };

// Liderlik tablosunun diğer satırları: prototip örneği (Gastro: senin üstünde beş, altında iki sıra)
const liderlik = [['Selin A.', 'selina', 12, 640], ['Mert K.', 'mertk', 10, 455], ['Elif T.', 'eliftas', 8, 310], ['Burak Ö.', 'burako', 6, 205], ['Deniz Y.', 'denizy', 5, 150], ['Can B.', 'canb', 3, 50], ['Ece S.', 'eces', 2, 20]];

const sekmeler = [
  { id: 'koleksiyon', ad: 'Koleksiyon', ikon: 'fa-medal', govde: `<div class="yigin">
${blok(`${bolumBas({ etiket: 'Kazandıkların', ikon: 'fa-medal', baslik: 'Rozet Koleksiyonun', metin: 'Her rozet tek bir ölçülebilir kayıttan doğar: kaydettiğin ölçüm, kapattığın gün, ulaştığın hedef, bitirdiğin meydan okuma. Kazandığın rozet geri alınmaz.' })}
<div class="galeri-ozet" id="rzStat"></div>
<p class="galeri-not" id="rzNot"></p>`, true)}
${blok(`${bolumBas({ etiket: 'Süzgeç', ikon: 'fa-filter', baslik: 'Aileye Göre', metin: 'Bir aileyi seç; galeri ona süzülür. Karta dokunursan rozetin nasıl kazanıldığını görürsün.' })}
<div class="galeri-cipler" id="rzCips" role="group" aria-label="Aileye göre süz" data-suzgec></div>
<div class="galeri-suzgec" id="rzFiltre" role="status" aria-live="polite"></div>
<div id="rzGaleri"></div>`)}
</div>` },
  { id: 'kademe', ad: 'Kademem', ikon: 'fa-ranking-star', govde: `<div class="yigin">
${blok(`${bolumBas({ etiket: 'Kademen', ikon: 'fa-ranking-star', baslik: 'Merdivende Neredesin?', metin: 'Kademe üç ölçütle atlanır: <b>puan</b>, <b>takip günü</b> ve <b>ulaşılan hedef</b>. Puan hızlı toplanır, gün toplanmaz; kademe sürdürmekle yükselir. Kademe satın alınmaz, kazanılır; paketin ayrı bir şeydir.' })}
<div class="ozet-karti" id="rzRank"></div>`, true)}
${blok(`${bolumBas({ etiket: 'Sekiz kademe', ikon: 'fa-stairs', baslik: 'Başlangıç’tan Öncü’ye', metin: 'Her kademenin bir puan eşiği, bir takip günü barajı ve bir hedef sayısı var; üçünü birlikte geçtiğin en yüksek kademedesin.' })}
<div class="merdiven" id="rzLadder" role="list" aria-label="Kademe basamakları"></div>`)}
${blok(`${bolumBas({ etiket: 'Ölçüler', ikon: 'fa-ruler', baslik: 'Kademeyi Besleyen Sayılar', metin: 'Aşağıdaki her sayı takip kayıtlarından, ölçümlerinden ve hesabındaki kayıtlardan okundu.' })}
<div class="puan-izgara dort" id="rzOlcu"></div>`)}
</div>` },
  { id: 'puan', ad: 'Puan Defteri', ikon: 'fa-coins', govde: `<div class="yigin">
${blok(`${bolumBas({ etiket: 'Puan', ikon: 'fa-coins', baslik: 'Puanın Nereden Geliyor?', metin: 'Puan ayrı bir sayaç değil: kazandığın rozetlerin puanlarının toplamı. Bir rozeti kazandığın an puanın artar, başka hiçbir yoldan değişmez.' })}
<div class="ozet-karti" id="rzPuanKart"></div>`, true)}
${blok(`${bolumBas({ etiket: 'Ailelere göre', ikon: 'fa-layer-group', baslik: 'Hangi Aileden Ne Kadar', metin: '<span id="rzAileNot"></span>' })}
<div class="puan-izgara uc" id="rzPuanAile"></div>`)}
${blok(`${bolumBas({ etiket: 'Kazanım defteri', ikon: 'fa-clock-rotate-left', baslik: 'Ne Zaman Ne Kazandın', metin: '<span id="rzDefterNot"></span>' })}
<div id="rzDefter"></div>`)}
</div>` },
  { id: 'liderlik', ad: 'Liderlik', ikon: 'fa-ranking-star', govde: `<div class="yigin">
${blok(`${bolumBas({ etiket: 'Liderlik', ikon: 'fa-ranking-star', baslik: 'Tek Tablo, Herkes Aynı Yerde', metin: 'Sıralama rozet puanına göre kurulur. Adının tabloda görünüp görünmeyeceğine <a href="{{kok}}hesabim/ayarlar/">Hesap Ayarları</a>’ndan sen karar verirsin.' })}
${bilgi('fa-circle-info', '<b>Tablo topluluğun tamamını değil, çevreni gösterir:</b> senin üstünde beş, altında iki sıra. Diğer satırlar prototip örneğidir.')}`, true)}
${blok('<div class="kart tasma-kapali" id="rzLdTablo"></div>')}
</div>` },
  { id: 'meydan', ad: 'Meydan Okumalar', ikon: 'fa-trophy', govde: `<div class="yigin">
${blok(`${bolumBas({ etiket: 'Meydan okumalar', ikon: 'fa-trophy', baslik: 'Kendine Meydan Oku', metin: 'Her meydan okumanın tek bir günlük görevi var; sonuna kadar götürdüğünde rozetini kazanırsın.' })}
<div class="yigin" id="rzMeydan"></div>`, true)}
</div>` },
];

export default () => {
  const p = uyeSayfa({
    yol: 'hesabim/rozetlerim', ad: 'Rozetlerim',
    giris: 'Kazandığın rozetler, topladığın puan, merdivendeki kademen ve liderlik tablosundaki sıran.',
    grup: 'rozetlerim', sekmeler, js: ['assets/js/sayfa/uye-rozetlerim.js'],
    sonEk: `<script type="application/json" id="rzKatalog">${JSON.stringify({ aileler, kademeler, kademeIkon, liderlik }).replace(/</g, '\\u003c')}</script>`,
  });
  return [p];
};
