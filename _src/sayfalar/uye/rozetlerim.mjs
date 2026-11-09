import { uyeSayfa, bolumBas, kart } from '../../parcalar/uye/ust.mjs';
import { aileler, kademeler } from '../../parcalar/uye/rozet-katalog.mjs';

const sekmeler = [
  { id: 'koleksiyon', ad: 'Koleksiyon', ikon: 'fa-medal', govde: `<div class="yigin">
${bolumBas({ etiket: 'Kazandıkların', ikon: 'fa-medal', baslik: 'Rozet Koleksiyonun', metin: 'Her rozet tek bir ölçülebilir kayıttan doğar. Kazandığın rozet geri alınmaz.' })}
<div class="puan-izgara" id="rzOzet"></div>
<div class="cipler tek-satir" id="rzSuzgec" role="group" aria-label="Rozet ailesi" data-suzgec></div>
<div id="rzAileler"></div>
</div>` },
  { id: 'kademe', ad: 'Kademem', ikon: 'fa-stairs', govde: `<div class="yigin">
${bolumBas({ etiket: 'Kademen', ikon: 'fa-stairs', baslik: 'Merdivende Neredesin?', metin: 'Kademe puan, kapatılan gün ve ulaşılan hedefle atlanır; üçünü birlikte geçtiğin en yüksek basamaktasın.' })}
${kart({ ikon: 'fa-seedling', baslik: '<span id="rzKademe"></span>', metin: '<span id="rzSonraki"></span>', govde: '<div id="rzKademeOlcer"></div>' })}
${kart({ ikon: 'fa-list-ol', baslik: 'Nereden Nereye', bosluksuz: true, govde: '<div class="ayar-liste" id="rzMerdiven"></div>' })}
</div>` },
  { id: 'puan', ad: 'Puan Defteri', ikon: 'fa-star', govde: `<div class="yigin">
${bolumBas({ etiket: 'Puan', ikon: 'fa-star', baslik: 'Puanın Nereden Geliyor?', metin: 'Puan ayrı bir sayaç değil: kazandığın rozetlerin puanlarının toplamı.' })}
${kart({ ikon: 'fa-layer-group', baslik: 'Hangi Aileden Ne Kadar', govde: '<div class="puan-izgara uc" id="rzPuanAile"></div>' })}
${kart({ ikon: 'fa-timeline', baslik: 'Ne Zaman Ne Kazandın', govde: '<div class="puan-izgara dort" id="rzPuanGecmis"></div>' })}
</div>` },
  { id: 'liderlik', ad: 'Liderlik', ikon: 'fa-ranking-star', govde: `<div class="yigin">
${bolumBas({ etiket: 'Liderlik', ikon: 'fa-ranking-star', baslik: 'Tek Tablo, Herkes Aynı Yerde', metin: 'Tabloda yalnız adını göstermeyi seçenler var. Görünürlüğünü Hesap Ayarları’ndan yönetirsin.' })}
${kart({ ikon: 'fa-trophy', baslik: 'Sıralama', bosluksuz: true, govde: '<div id="rzLiderlik"></div>' })}
</div>` },
  { id: 'meydan', ad: 'Meydan Okumalar', ikon: 'fa-trophy', govde: `<div class="yigin">
${bolumBas({ etiket: 'Meydan okumalar', ikon: 'fa-trophy', baslik: 'Kendine Meydan Oku', metin: 'Her meydan okumanın tek bir günlük görevi var; sonuna kadar götürdüğünde rozetini kazanırsın.' })}
<div class="yigin" id="rzMeydan"></div>
</div>` },
];

export default () => {
  const p = uyeSayfa({
    yol: 'hesabim/rozetlerim', ad: 'Rozetlerim',
    giris: 'Kazandığın rozetler, topladığın puan, merdivendeki kademen ve sıran.',
    grup: 'rz', sekmeler, js: ['assets/js/yatay-kaydir.js', 'assets/js/sayfa/uye-rozetlerim.js'],
    sonEk: `<script type="application/json" id="rzKatalog">${JSON.stringify({ aileler, kademeler }).replace(/</g, '\\u003c')}</script>`,
  });
  return [p];
};
