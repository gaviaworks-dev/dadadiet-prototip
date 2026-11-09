import { uyeSayfa, kart, dugme, bilgi } from '../../parcalar/uye/ust.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';

const butce = [['ekonomik', 'fa-coins', 'Ekonomik', 'Baklagil, sebze ve yumurta ağırlıklı.'], ['orta', 'fa-wallet', 'Orta', 'Temel ürünler ve taze ürün.'], ['genis', 'fa-gem', 'Geniş', 'Fiyat sınıfı sınırı yok.']];
const kisit = [['laktoz', 'Laktoz', 'Süt ve süt ürünleri'], ['gluten', 'Gluten', 'Buğday, arpa, çavdar, yulaf'], ['yumurta', 'Yumurta'], ['kuruyemis', 'Kuruyemiş', 'Kuruyemiş ve yer fıstığı'], ['balik', 'Balık', 'Balık ve deniz ürünleri'], ['soya', 'Soya'], ['susam', 'Susam']];

const govde = `<div class="yigin">${rk('MN-B1', { tur: 'bant', konum: 'alt' })}
${kart({
    ikon: 'fa-sliders', baslik: 'Bütçe ve Kısıtlar', metin: 'Menü bu seçimlere göre kurulur. Değiştirdikten sonra menünü yeniden üret.', form: ' id="hmForm"',
    /* HM1: bütçe segment, kısıtlar çoklu seçim çipi (ortak.js aria-pressed'i çevirir) */
    govde: `<div class="alan"><span class="alan-etiket" id="hmButceEt">Bütçe</span><div class="segment" role="group" aria-labelledby="hmButceEt" id="hmButce">${butce.map(([d, i, a, m]) => `<button type="button" data-deger="${d}" data-aciklama="${m}" aria-pressed="${d === 'orta'}"><i class="fa-solid ${i}" aria-hidden="true"></i> ${a}</button>`).join('')}</div><p class="alan-yardim" aria-live="polite"><span id="hmButceMetin">${butce[1][3]}</span></p></div>
<div class="alan"><span class="alan-etiket" id="hmKisitEt">Kısıtların</span><div class="cipler" role="group" aria-labelledby="hmKisitEt" id="hmKisit" data-coklu-secim>${kisit.map(([d, a, t]) => `<button class="cip" type="button" data-kisit="${d}" aria-pressed="false"${t ? ` title="${t}"` : ''}><i class="fa-solid fa-ban" aria-hidden="true"></i> ${a}</button>`).join('')}</div><p class="alan-yardim"><span>Seçtiğin kısıtlara giren tarifler menüne girmez. Sağlık Dosyam’daki hassasiyetlerin seçili gelir.</span></p></div>`,
    alt: dugme('Menümü üret', { sinif: 'birincil', ikon: 'fa-wand-magic-sparkles', tur: 'submit' }),
  })}
<div class="uyum-yer" id="hmTercih"></div>
<div id="hmTahlil"></div>
<div id="hmSonuc"></div>
${bilgi('fa-user-doctor', 'Bu menü yapay zekâ yardımıyla hazırlanmış örnek bir düzendir; kişiye özel plan yalnızca yetkili bir diyetisyen tarafından hazırlanır.')}
</div>`;

export default () => [uyeSayfa({
  yol: 'hesabim/haftalik-menum', ad: 'Haftalık Menüm', aktif: 'hesabim/beslenme-planim/', ust: [['Beslenme Planım', 'hesabim/beslenme-planim/']],
  eylem: dugme('Beslenme Planım', { sinif: 'hayalet', href: 'hesabim/beslenme-planim/#hafta' }),
  giris: 'Bütçene ve kısıtlarına göre bir haftalık menü üret; her kalem tarif verisine bağlıdır.',
  govde, js: ['assets/js/tercih-uyum.js', 'assets/js/tahlil-deger.js', 'assets/js/sayfa/uye-haftalik-menum.js'],
})];
