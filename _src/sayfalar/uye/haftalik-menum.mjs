import { uyeSayfa, kart, dugme, bilgi } from '../../parcalar/uye/ust.mjs';

const butce = [['ekonomik', 'fa-coins', 'Ekonomik', 'Baklagil, sebze ve yumurta ağırlıklı.'], ['orta', 'fa-wallet', 'Orta', 'Temel ürünler ve taze ürün.'], ['genis', 'fa-gem', 'Geniş', 'Fiyat sınıfı sınırı yok.']];
const kisit = [['laktoz', 'Laktoz (süt ve süt ürünleri)'], ['gluten', 'Gluten (buğday, arpa, çavdar, yulaf)'], ['yumurta', 'Yumurta'], ['kuruyemis', 'Kuruyemiş ve yer fıstığı'], ['balik', 'Balık ve deniz ürünleri'], ['susam', 'Susam']];

const govde = `<div class="yigin">
${kart({
    ikon: 'fa-sliders', baslik: 'Bütçe ve kısıtlar', metin: 'Menü bu seçimlere göre kurulur. Değiştirdikten sonra menünü yeniden üret.', form: ' id="hmForm"',
    govde: `<div class="ayar-liste" role="radiogroup" aria-label="Bütçe seviyesi">${butce.map(([d, i, a, m]) => `<label class="ayar-satir secim-satir" for="hmButce-${d}"><span class="as-ikon" aria-hidden="true"><i class="fa-solid ${i}"></i></span><div class="as-metin"><b>${a}</b><span>${m}</span></div><input class="secim-radyo" type="radio" name="butce" id="hmButce-${d}" value="${d}"${d === 'orta' ? ' checked' : ''}></label>`).join('')}</div>
<div class="alan"><span class="alan-etiket">Kısıtların</span><div class="alan-izgara c2">${kisit.map(([d, a]) => `<label class="onay-kutusu" for="hmKisit-${d}"><input type="checkbox" id="hmKisit-${d}" name="kisit" value="${d}"><span>${a}</span></label>`).join('')}</div><p class="alan-yardim"><span>Seçtiğin kısıtlara giren tarifler menüne girmez. Sağlık Dosyam’daki hassasiyetlerin işaretli gelir.</span></p></div>`,
    alt: dugme('Menümü üret', { sinif: 'birincil', ikon: 'fa-wand-magic-sparkles', tur: 'submit' }),
  })}
<div id="hmSonuc"></div>
${bilgi('fa-user-doctor', 'Bu menü yapay zekâ yardımıyla hazırlanmış örnek bir düzendir; kişiye özel plan yalnızca yetkili bir diyetisyen tarafından hazırlanır.')}
</div>`;

export default () => [uyeSayfa({
  yol: 'hesabim/haftalik-menum', ad: 'Haftalık Menüm', aktif: 'hesabim/beslenme-planim/', ust: [['Beslenme Planım', 'hesabim/beslenme-planim/']],
  eylem: dugme('Beslenme Planım', { sinif: 'hayalet', href: 'hesabim/beslenme-planim/#hafta' }),
  giris: 'Bütçene ve kısıtlarına göre bir haftalık menü üret; her kalem tarif verisine bağlıdır.',
  govde, js: ['assets/js/sayfa/uye-haftalik-menum.js'],
})];
