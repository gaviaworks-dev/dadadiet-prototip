import { uyeSayfa, bolumBas, kart, dugme, modal, tablo, alan, secim, anahtar } from '../../parcalar/uye/ust.mjs';

// Sessiz saat seçicisi Tercihlerim'deki ile aynı: tam saatler, değer 23:00, görünen 23.00
const saatSecim = (id, etiket) => `<select class="alan-secim" id="${id}" aria-label="${etiket}">${Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((x) => `<option value="${x}:00">${x}.00</option>`).join('')}</select>`;

const sekmeler = [
  { id: 'ogun', ad: 'Öğün Kayıtlarım', ikon: 'fa-utensils', govde: `<div class="yigin">
<div id="gtHis"></div>
<div id="gtBas"></div>
<div class="uyum-yer" id="gtTercih"></div>
${kart({ ikon: 'fa-clipboard-list', baslik: 'Günün Kaydı', metin: '<span id="gtOzet"></span>', sag: '<div class="as-eylem"><span class="durum-hapi cozulen" id="gtKcal"></span></div>', bosluksuz: true, govde: '<div class="kalem-liste" id="gtOgunler"></div>', alt: `<span class="eylem-notu" id="gtPaylasNot"></span>${dugme('Günü diyetisyenimle paylaş', { ikon: 'fa-share-nodes', ek: ' id="gtPaylas"' })}` })}
${kart({ ikon: 'fa-list-check', baslik: 'Eklediğin Kalemler', metin: 'Plandan ayrı eklediklerin. Miktarı düzeltebilir ya da silebilirsin.', id: 'gtEkKart', bosluksuz: true, govde: '<div class="ayar-liste" id="gtEkler"></div>', alt: dugme('Öğüne ekle', { sinif: 'birincil', ikon: 'fa-plus', ek: ' data-besin-ekle="ogle"' }) })}
</div>` },
  { id: 'su', ad: 'Su Takibim', ikon: 'fa-droplet', govde: `<div class="yigin">
${bolumBas({ etiket: 'Bugün', ikon: 'fa-droplet', baslik: 'Su Takibin', metin: 'Her bardağı ekle; haftalık grafiğin buna göre güncellenir.', arac: dugme('Su ihtiyacını hesapla', { href: 'hesaplayicilar/' }) })}
<div class="iki-kolon esit">${kart({ ikon: 'fa-droplet', baslik: 'Bugünkü Su Alımın', sag: `<div class="as-eylem">${dugme('Kayıtlar', { sinif: 'hayalet kucuk', ek: ' data-sekme-git="ozet"' })}</div>`, govde: '<div class="su-kart"><div class="su-sayi"><b id="gtSuDeger"></b><small id="gtSuOlcu"></small></div><p class="su-kalan" id="gtSuKalan" aria-live="polite"></p><div class="su-bardaklar" id="gtSuBardaklar" role="group"></div></div>', alt: dugme('Geri al', { ek: ' id="gtSuGeri" data-su="geri" disabled' }) + dugme('+500 ml', { ek: ' data-su="500"' }) + dugme('1 su bardağı (200 ml)', { sinif: 'birincil', ek: ' id="gtSuBardak" data-su="bardak"' }) })}${kart({ ikon: 'fa-chart-line', baslik: 'Son 7 Gün', metin: 'Kesik çizgi günlük hedefin: <span id="gtSuHedef"></span>.', govde: '<div id="gtSuGrafik"></div>' })}</div>
${kart({ ikon: 'fa-bell', baslik: 'Su Hatırlatması', metin: 'Aynı ayar Tercihlerim’de de durur; birini değiştirince öteki de değişir.', bosluksuz: true, govde: `<div class="ayar-satir sarmali"><span class="as-ikon"><i class="fa-solid fa-clock" aria-hidden="true"></i></span><div class="as-metin"><b>Saat başı hatırlat</b><span id="gtHatirlatMetin" aria-live="polite"></span></div><div class="as-eylem"><div class="saat-aralik">${saatSecim('gtSessizBas', 'Sessiz saatlerin başlangıcı')}<span aria-hidden="true">–</span>${saatSecim('gtSessizBit', 'Sessiz saatlerin bitişi')}</div>${anahtar('gt_su_hatirlatma', 'Saat başı su hatırlatması', false, ' id="gtHatirlatma"')}</div></div><p class="ayar-aciklama"><b>Prototip:</b> bu sayfa bildirim göndermez; ayarın bu tarayıcıda kaydedilir. Uygulamada sessiz saatler dışında, günlük hedefine ulaşana kadar saat başı bildirim gelir.</p>` })}
</div>` },
  { id: 'makro', ad: 'Enerji ve Makro Takibim', ikon: 'fa-chart-pie', govde: `<div class="yigin">
${bolumBas({ etiket: 'Bugün', ikon: 'fa-chart-pie', baslik: 'Enerji ve Makro Dengen', metin: 'İşaretlediğin öğünler ve eklediğin besinler günlük hedefinle karşılaştırılır.' })}
${kart({ ikon: 'fa-chart-pie', baslik: 'Enerji ve Makro Dengesi', metin: 'Halka bugünkü enerjinin makrolara dağılımını gösterir; çubuklar hedefe göre ilerlemendir.', govde: '<div class="skor-yerlesim makro-denge" id="gtMakro"></div>' })}
<div id="gtProtein"></div>
${kart({ ikon: 'fa-list', baslik: 'Kalem Kalem Döküm', bosluksuz: true, govde: tablo({ id: 'gtKalemler', etiket: 'Bugünkü kalemler', basliklar: ['Kalem', ['Öğün', 'dar-kolon'], ['Enerji', 'kisa-kolon sag'], ['Protein', 'kisa-kolon sag'], ['Yağ', 'kisa-kolon sag'], ['Karb.', 'kisa-kolon sag']] }) })}
</div>` },
  { id: 'adim', ad: 'Adım ve Hareket Bilgilerim', ikon: 'fa-person-walking', govde: `<div class="yigin">
${bolumBas({ etiket: 'Bugün', ikon: 'fa-person-walking', baslik: 'Adım ve Hareketin', metin: 'Günlük adım hedefin ve son 7 günün.' })}
<div class="iki-kolon esit">${kart({ ikon: 'fa-shoe-prints', baslik: 'Bugünkü Adımların', metin: '<span id="gtAdimMetin"></span>', govde: '<div id="gtAdim"></div>', alt: dugme('Adım ekle', { sinif: 'birincil', ikon: 'fa-plus', ek: ' data-ac="#gtAdimModal"' }) })}${kart({ ikon: 'fa-chart-line', baslik: 'Son 7 Gün', metin: 'Kesik çizgi günlük hedefin.', govde: '<div id="gtAdimGrafik"></div>' })}</div>
</div>` },
  { id: 'not', ad: 'Günlük Notlarım', ikon: 'fa-note-sticky', govde: `<div class="yigin">
${bolumBas({ etiket: 'Kendine not', ikon: 'fa-note-sticky', baslik: 'Notların', metin: 'Gününe dair kısa notlar. İstersen diyetisyeninle paylaşırsın.' })}
${kart({
    ikon: 'fa-pen', baslik: 'Bugüne Not Ekle', form: ' id="gtNotForm"',
    govde: `<div class="alan"><label class="alan-etiket" for="gtNot">Notun <span class="zorunlu">*</span></label><textarea class="alan-metin" id="gtNot" rows="3" required></textarea></div>${secim({ ad: 'gtEtiket', etiket: 'Etiket', secenekler: ['Açlık ve tokluk', 'Uyku', 'Ruh hâli', 'Sindirim', 'Egzersiz', 'Öğün', 'Su', 'Diğer'] })}<label class="onay-kutusu"><input type="checkbox" id="gtNotPaylas"><span>Diyetisyenimle paylaş</span></label>`,
    alt: dugme('Notu kaydet', { sinif: 'birincil', tur: 'submit' }),
  })}
${kart({ ikon: 'fa-clock-rotate-left', baslik: 'Önceki Notların', bosluksuz: true, govde: '<div class="ayar-liste" id="gtNotlar"></div>' })}
</div>` },
  { id: 'ozet', ad: 'Haftalık Özetim', ikon: 'fa-calendar-week', govde: `<div class="yigin">
${bolumBas({ etiket: 'Son 7 gün', ikon: 'fa-calendar-week', baslik: 'Haftalık Özetin', metin: 'Enerji, öğün, su ve adım ortalamaların; gün gün kayıtların ve hissin.' })}
${kart({ ikon: 'fa-gauge-high', baslik: 'Haftanın Ortalamaları', govde: '<div class="sayac-izgara" id="gtOrtalama"></div>' })}
${kart({ ikon: 'fa-table-list', baslik: 'Gün Gün Döküm', bosluksuz: true, govde: tablo({ id: 'gtHafta', etiket: 'Son yedi günün enerji, öğün, su, adım ve his kayıtları', basliklar: ['Gün', ['Enerji', 'kisa-kolon sag'], ['Öğün ve uyum', 'dar-kolon'], ['His', 'dar-kolon'], ['Su', 'kisa-kolon sag'], ['Adım', 'kisa-kolon sag'], ['Hedef', 'kisa-kolon']] }) })}
</div>` },
];

const sonEk = modal({
  id: 'gtBesinModal', baslik: 'Öğüne Ekle', form: ' id="gtBesinForm"',
  govde: `<div class="alan"><label class="alan-etiket" for="gtOgunSec">Öğün</label><select class="alan-secim" id="gtOgunSec"></select></div>
<div id="gtKisayol"></div>
<div class="alan"><span class="alan-etiket" id="gtKipEt">Nasıl ekleyeceksin</span><div class="segment" role="group" aria-labelledby="gtKipEt" id="gtKip"><button type="button" data-deger="liste" aria-pressed="true">Besin ara</button><button type="button" data-deger="hizli" aria-pressed="false">Hızlı ekle</button></div></div>
<div id="gtListeAlan"><div class="alan oneri-kap"><label class="alan-etiket" for="gtBesin">Besin <span class="zorunlu">*</span></label><input class="alan-girdi" id="gtBesin" autocomplete="off" required placeholder="Besin adı yaz"><div class="oneri-liste" id="gtOneri" hidden></div></div>
${alan({ ad: 'gtGram', etiket: 'Miktar', tur: 'number', deger: '100', ek: ' min="1" max="2000"', zorunlu: true })}
<div class="alan"><label class="onay-kutusu" for="gtElle"><input type="checkbox" id="gtElle"><span>Listede yok, değerleri elle gireceğim</span></label></div>
<div id="gtElleAlan" hidden>${secim({ ad: 'gtBirim', etiket: 'Birim', secenekler: ['gram (g)', 'porsiyon', 'adet', 'mililitre (ml)', 'kâse'] })}<div class="alan-izgara c2">${alan({ ad: 'gtElleKcal', etiket: 'Enerji (kcal)', tur: 'number', ek: ' min="0" max="5000"', istege: true })}${alan({ ad: 'gtElleProtein', etiket: 'Protein (g)', tur: 'number', ek: ' min="0" max="500" step="0.1"', istege: true })}${alan({ ad: 'gtElleYag', etiket: 'Yağ (g)', tur: 'number', ek: ' min="0" max="500" step="0.1"', istege: true })}${alan({ ad: 'gtElleKarb', etiket: 'Karbonhidrat (g)', tur: 'number', ek: ' min="0" max="500" step="0.1"', istege: true })}</div><p class="alan-yardim"><span>Enerji ve makro değerlerini girmezsen kalem günlüğe yazılır ama toplama eklenmez.</span></p></div></div>
<div id="gtHizliAlan" hidden>${alan({ ad: 'gtHizliKcal', etiket: 'Enerji (kcal)', tur: 'number', ek: ' min="1" max="5000" inputmode="numeric"', zorunlu: true })}${alan({ ad: 'gtHizliAd', etiket: 'Ne yedin', istege: true, ek: ' placeholder="Örneğin iş yerinde öğle yemeği"' })}<p class="alan-yardim"><span>Yalnız enerji toplama eklenir; protein, yağ ve karbonhidrat boş kalır.</span></p></div>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Ekle', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'gtDuzeltModal', baslik: 'Kalemi Düzelt', form: ' id="gtDuzeltForm"',
  govde: `<p class="alan-yardim"><span id="gtDuzeltAd"></span></p>
<div id="gtDuzeltMiktarAlan">${alan({ ad: 'gtDuzeltMiktar', etiket: 'Miktar', tur: 'number', ek: ' min="0.1" max="2000" step="0.1"', zorunlu: true })}</div>
<div id="gtDuzeltSerbestAlan">${alan({ ad: 'gtDuzeltAdGir', etiket: 'Ad ve miktar' })}${alan({ ad: 'gtDuzeltKcal', etiket: 'Enerji (kcal)', tur: 'number', ek: ' min="0" max="5000"' })}</div>
${secim({ ad: 'gtDuzeltOgun', etiket: 'Öğün', secenekler: [] })}`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Kaydet', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'gtAdimModal', baslik: 'Adım Ekle', form: ' id="gtAdimForm"',
  govde: alan({ ad: 'gtAdimSayi', etiket: 'Adım sayısı', tur: 'number', deger: '1000', ek: ' min="1" max="50000"', zorunlu: true }),
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Ekle', { sinif: 'birincil', tur: 'submit' }),
});

export default () => [uyeSayfa({
  yol: 'hesabim/gunluk-takibim', ad: 'Günlük Takibim',
  giris: 'Öğün, su ve adım kayıtların tek yerde; plana uyduysan tek dokunuş yeter.',
  grup: 'gt', sekmeler, sonEk, js: ['assets/js/tercih-uyum.js', 'assets/js/yatay-kaydir.js', 'assets/js/his-kaydi.js', 'assets/js/ogun-foto.js', 'assets/js/sayfa/uye-gunluk-takibim.js'],
})];
