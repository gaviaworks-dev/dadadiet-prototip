import { uyeSayfa, bolumBas, kart, dugme, modal, tablo, alan, secim } from '../../parcalar/uye/ust.mjs';

const sekmeler = [
  { id: 'ogun', ad: 'Bugün', ikon: 'fa-utensils', govde: `<div class="yigin">
<div id="gtBas"></div>
${kart({ ikon: 'fa-clipboard-list', baslik: 'Günün kaydı', metin: '<span id="gtOzet"></span>', sag: '<div class="as-eylem"><span class="durum-hapi cozulen" id="gtKcal"></span></div>', bosluksuz: true, govde: '<div class="kalem-liste" id="gtOgunler"></div>', alt: `<span class="eylem-notu" id="gtPaylasNot"></span>${dugme('Günü diyetisyenimle paylaş', { ikon: 'fa-share-nodes', ek: ' id="gtPaylas"' })}` })}
</div>` },
  { id: 'su', ad: 'Su', ikon: 'fa-droplet', govde: `<div class="yigin">
${bolumBas({ etiket: 'Bugün', ikon: 'fa-droplet', baslik: 'Su takibin', metin: 'Her bardağı işaretle; haftalık grafiğin buna göre güncellenir.', arac: dugme('Su ihtiyacını hesapla', { href: 'hesaplayicilar/' }) })}
<div class="iki-kolon esit">${kart({ ikon: 'fa-glass-water', baslik: 'Bugünkü su alımın', metin: '<span id="gtSuMetin"></span>', govde: '<div id="gtSu"></div>', alt: dugme('Geri al', { ek: ' data-su="-250"' }) + dugme('200 ml', { ek: ' data-su="200"' }) + dugme('250 ml', { ek: ' data-su="250"' }) + dugme('500 ml', { sinif: 'birincil', ek: ' data-su="500"' }) })}${kart({ ikon: 'fa-chart-line', baslik: 'Son 7 gün', metin: 'Kesik çizgi günlük hedefin.', govde: '<div id="gtSuGrafik"></div>' })}</div>
</div>` },
  { id: 'makro', ad: 'Enerji ve Makro', ikon: 'fa-chart-pie', govde: `<div class="yigin">
${bolumBas({ etiket: 'Bugün', ikon: 'fa-chart-pie', baslik: 'Enerji ve makro dengen', metin: 'İşaretlediğin öğünler ve eklediğin besinler günlük hedefinle karşılaştırılır.' })}
${kart({ ikon: 'fa-fire', baslik: 'Günün enerjisi', govde: '<div class="yigin sik" id="gtMakro"></div>' })}
${kart({ ikon: 'fa-list', baslik: 'Kalem kalem döküm', bosluksuz: true, govde: tablo({ id: 'gtKalemler', etiket: 'Bugünkü kalemler', basliklar: ['Kalem', ['Öğün', 'dar-kolon'], ['Enerji', 'dar-kolon sag']] }) })}
</div>` },
  { id: 'adim', ad: 'Adım', ikon: 'fa-person-walking', govde: `<div class="yigin">
${bolumBas({ etiket: 'Bugün', ikon: 'fa-person-walking', baslik: 'Adım ve hareketin', metin: 'Günlük adım hedefin ve son 7 günün.' })}
<div class="iki-kolon esit">${kart({ ikon: 'fa-shoe-prints', baslik: 'Bugünkü adımların', metin: '<span id="gtAdimMetin"></span>', govde: '<div id="gtAdim"></div>', alt: dugme('Adım ekle', { sinif: 'birincil', ikon: 'fa-plus', ek: ' data-ac="#gtAdimModal"' }) })}${kart({ ikon: 'fa-chart-line', baslik: 'Son 7 gün', metin: 'Kesik çizgi günlük hedefin.', govde: '<div id="gtAdimGrafik"></div>' })}</div>
</div>` },
  { id: 'not', ad: 'Notlar', ikon: 'fa-note-sticky', govde: `<div class="yigin">
${bolumBas({ etiket: 'Kendine not', ikon: 'fa-note-sticky', baslik: 'Notların', metin: 'Gününe dair kısa notlar. İstersen diyetisyeninle paylaşırsın.' })}
${kart({
    ikon: 'fa-pen-to-square', baslik: 'Bugüne not ekle', form: ' id="gtNotForm"',
    govde: `<div class="alan"><label class="alan-etiket" for="gtNot">Notun <span class="zorunlu">*</span></label><textarea class="alan-metin" id="gtNot" rows="3" required></textarea></div>${secim({ ad: 'gtEtiket', etiket: 'Etiket', secenekler: ['Genel', 'Öğün', 'Su', 'Hareket', 'Uyku', 'Duygu durumu'] })}<label class="onay-kutusu"><input type="checkbox" id="gtNotPaylas"><span>Diyetisyenimle paylaş</span></label>`,
    alt: dugme('Notu kaydet', { sinif: 'birincil', tur: 'submit' }),
  })}
${kart({ ikon: 'fa-clock-rotate-left', baslik: 'Önceki notların', bosluksuz: true, govde: '<div class="ayar-liste" id="gtNotlar"></div>' })}
</div>` },
  { id: 'ozet', ad: 'Hafta', ikon: 'fa-calendar-week', govde: `<div class="yigin">
${bolumBas({ etiket: 'Son 7 gün', ikon: 'fa-calendar-week', baslik: 'Haftalık özetin', metin: 'Su ve adım ortalamaların, gün gün kayıtların.' })}
${kart({ ikon: 'fa-gauge-high', baslik: 'Haftanın ortalamaları', govde: '<div class="sayac-izgara" id="gtOrtalama"></div>' })}
${kart({ ikon: 'fa-table-list', baslik: 'Gün gün döküm', bosluksuz: true, govde: tablo({ id: 'gtHafta', etiket: 'Son yedi günün su ve adım kayıtları', basliklar: ['Gün', ['Su', 'dar-kolon sag'], ['Adım', 'dar-kolon sag'], ['Hedef', 'dar-kolon']] }) })}
</div>` },
];

const sonEk = modal({
  id: 'gtBesinModal', baslik: 'Besin ekle', form: ' id="gtBesinForm"',
  govde: `<div class="alan oneri-kap"><label class="alan-etiket" for="gtBesin">Besin <span class="zorunlu">*</span></label><input class="alan-girdi" id="gtBesin" autocomplete="off" required placeholder="Besin adı yaz"><div class="oneri-liste" id="gtOneri" hidden></div></div>
<div class="alan-izgara c2"><div class="alan"><label class="alan-etiket" for="gtOgunSec">Öğün</label><select class="alan-secim" id="gtOgunSec"></select></div>${alan({ ad: 'gtGram', etiket: 'Miktar (g)', tur: 'number', deger: '100', ek: ' min="1" max="2000"', zorunlu: true })}</div>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Ekle', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'gtAdimModal', baslik: 'Adım ekle', form: ' id="gtAdimForm"',
  govde: alan({ ad: 'gtAdimSayi', etiket: 'Adım sayısı', tur: 'number', deger: '1000', ek: ' min="1" max="50000"', zorunlu: true }),
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Ekle', { sinif: 'birincil', tur: 'submit' }),
});

export default () => [uyeSayfa({
  yol: 'hesabim/gunluk-takibim', ad: 'Günlük Takibim',
  giris: 'Öğün, su ve adım kayıtların tek yerde; plana uyduysan tek dokunuş yeter.',
  grup: 'gt', sekmeler, sonEk, js: ['assets/js/sayfa/uye-gunluk-takibim.js'],
})];
