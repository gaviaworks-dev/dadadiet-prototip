import { uyeSayfa, bolumBas, kart, dugme, modal, tablo, alan, secim } from '../../parcalar/uye/ust.mjs';

const sekmeler = [
  { id: 'profil', ad: 'Profilim', ikon: 'fa-id-card', govde: `<div class="yigin">
${bolumBas({ etiket: 'Temel bilgiler', ikon: 'fa-id-card', baslik: 'Sağlık profilin', metin: 'Program önerileri ve hesaplayıcılar bu bilgileri kullanır. Diyetisyenin bunları ancak sen izin verirsen görür.', arac: dugme('Veri izinlerini yönet', { ikon: 'fa-user-shield', href: 'hesabim/veri-izinlerim/' }) })}
${kart({
    ikon: 'fa-ruler', baslik: 'Temel ölçüler', metin: '<span id="sdSon"></span>', form: ' id="sdProfilForm"',
    govde: `<div class="alan-izgara c3">${alan({ ad: 'boy', etiket: 'Boy (cm)', tur: 'number', ek: ' min="100" max="250"' })}${alan({ ad: 'kilo', etiket: 'Güncel kilo (kg)', tur: 'number', ek: ' min="30" max="300" step="0.1"' })}${alan({ ad: 'hedef_kilo', etiket: 'Hedef kilo (kg)', tur: 'number', ek: ' min="30" max="300" step="0.1"' })}</div>${alan({ ad: 'hedef', etiket: 'Hedefin' })}`,
    alt: dugme('Değişiklikleri geri al', { ek: ' id="sdGeri"' }) + dugme('Profili güncelle', { sinif: 'birincil', tur: 'submit' }),
  })}
${kart({ ikon: 'fa-triangle-exclamation', baslik: 'Dikkat edilmesi gerekenler', metin: 'Program ve öğün önerileri bu kayıtlara göre süzülür.', bosluksuz: true, govde: '<div class="ayar-liste" id="sdDikkat"></div>' })}
${kart({ ikon: 'fa-notes-medical', baslik: 'Sağlık öykün', metin: 'Diyetisyeninle paylaştığın anamnez özeti.', govde: '<dl class="kunye" id="sdAnamnez"></dl>' })}
</div>` },
  { id: 'olcum', ad: 'Ölçümlerim', ikon: 'fa-weight-scale', sayi: 'olcum', govde: `<div class="yigin">
${bolumBas({ etiket: 'Ölçümlerin', ikon: 'fa-weight-scale', baslik: 'Vücut ölçümlerin', metin: 'Kilo, bel ve yağ oranı kayıtların. Yeni ölçüm diyetisyen panelinde de görünür.', arac: dugme('Yeni ölçüm ekle', { sinif: 'birincil', ikon: 'fa-plus', ek: ' data-ac="#sdOlcumModal"' }) })}
<div class="iki-kolon">${kart({ ikon: 'fa-chart-line', baslik: 'Kilo seyri', metin: 'Kesik çizgi hedef kilon.', govde: '<div id="sdGrafik"></div>' })}${kart({ ikon: 'fa-gauge-high', baslik: 'Son ölçümün', metin: '<span id="sdOlcumTarih"></span>', govde: '<div class="yigin sik" id="sdOlcumOzet"></div>' })}</div>
${kart({ ikon: 'fa-table-list', baslik: 'Ölçüm geçmişin', bosluksuz: true, govde: tablo({ id: 'sdOlcumler', etiket: 'Tarihe göre kilo, BKİ, bel ve yağ oranı', basliklar: ['Tarih', ['Kilo', 'sag'], ['BKİ', 'sag'], ['Bel', 'sag'], ['Yağ oranı', 'sag']] }), alt: dugme('Ölçümleri indir', { ikon: 'fa-download', ek: ' id="sdOlcumIndir"' }) })}
</div>` },
  { id: 'tahlil', ad: 'Tahlillerim', ikon: 'fa-flask-vial', sayi: 'tahlil', govde: `<div class="yigin">
${bolumBas({ etiket: 'Tahlillerin', ikon: 'fa-flask-vial', baslik: 'Tahlil ve raporların', metin: 'Yüklediğin tahlillerin değerleri referans aralığıyla karşılaştırılır. Yorum için diyetisyenine ya da hekimine danış.', arac: dugme('Yeni belge yükle', { sinif: 'birincil', ikon: 'fa-upload', ek: ' data-ac="#sdBelgeModal"' }) })}
<div class="yigin" id="sdTahliller"></div>
</div>` },
  { id: 'recete', ad: 'Belgelerim', ikon: 'fa-file-prescription', govde: `<div class="yigin">
${bolumBas({ etiket: 'Belgelerin', ikon: 'fa-file-prescription', baslik: 'Reçete ve belgelerin', metin: 'Düzenli kullandıkların ve yüklediğin belgeler.', arac: dugme('Yeni belge yükle', { sinif: 'birincil', ikon: 'fa-upload', ek: ' data-ac="#sdBelgeModal"' }) })}
${kart({ ikon: 'fa-pills', baslik: 'Düzenli kullandıkların', bosluksuz: true, govde: '<div class="ayar-liste" id="sdIlaclar"></div>' })}
${kart({ ikon: 'fa-folder-open', baslik: 'Belge listesi', bosluksuz: true, govde: '<div class="ayar-liste" id="sdBelgeler"></div>' })}
</div>` },
  { id: 'test', ad: 'Testlerim', ikon: 'fa-clipboard-question', govde: `<div class="yigin">
${bolumBas({ etiket: 'Testlerin', ikon: 'fa-clipboard-question', baslik: 'Test sonuçların', metin: 'Çözdüğün sağlık testleri ve sonuçların.', arac: dugme('Bütün testlere göz at', { href: 'saglik-testleri/' }) })}
${kart({ bosluksuz: true, govde: '<div id="sdTestler"></div>' })}
</div>` },
  { id: 'hesap', ad: 'Hesaplarım', ikon: 'fa-calculator', govde: `<div class="yigin">
${bolumBas({ etiket: 'Hesapların', ikon: 'fa-calculator', baslik: 'Hesaplama geçmişin', metin: 'Sağlık dosyandaki güncel değerlerle hesaplanan sonuçların.', arac: dugme('Hesaplayıcılara git', { href: 'hesaplayicilar/' }) })}
${kart({ ikon: 'fa-list', baslik: 'Yaptığın hesaplar', bosluksuz: true, govde: '<div class="ayar-liste" id="sdHesaplar"></div>' })}
</div>` },
  { id: 'gelisim', ad: 'Raporlarım', ikon: 'fa-chart-column', govde: `<div class="yigin">
${bolumBas({ etiket: 'Raporların', ikon: 'fa-chart-column', baslik: 'Gelişim raporların', metin: 'Seçtiğin dönemin özetini oluştur, yazdır ya da diyetisyeninle paylaş.' })}
${kart({
    ikon: 'fa-file-circle-plus', baslik: 'Yeni gelişim raporu oluştur', form: ' id="sdRaporForm"',
    govde: `<div class="alan-izgara c3">${alan({ ad: 'rBas', etiket: 'Başlangıç', tur: 'date', zorunlu: true })}${alan({ ad: 'rBit', etiket: 'Bitiş', tur: 'date', zorunlu: true })}${alan({ ad: 'rAd', etiket: 'Rapor adı', zorunlu: true, deger: 'Gelişim raporum' })}</div>`,
    alt: dugme('Raporu oluştur', { sinif: 'birincil', tur: 'submit' }),
  })}
${kart({ ikon: 'fa-folder-open', baslik: 'Oluşturduğun raporlar', bosluksuz: true, govde: '<div class="ayar-liste" id="sdRaporlar"></div>' })}
</div>` },
];

const sonEk = modal({
  id: 'sdOlcumModal', baslik: 'Yeni ölçüm ekle', form: ' id="sdOlcumForm"',
  govde: `<div class="alan-izgara c2">${alan({ ad: 'oKilo', etiket: 'Kilo (kg)', tur: 'number', zorunlu: true, ek: ' min="30" max="300" step="0.1"' })}${alan({ ad: 'oBel', etiket: 'Bel (cm)', tur: 'number', ek: ' min="40" max="200" step="0.1"' })}${alan({ ad: 'oYag', etiket: 'Yağ oranı (%)', tur: 'number', ek: ' min="3" max="70" step="0.1"' })}</div>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Ölçümü kaydet', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'sdBelgeModal', baslik: 'Yeni belge yükle', form: ' id="sdBelgeForm"',
  govde: `${secim({ ad: 'bTur', etiket: 'Belge türü', secenekler: ['Tahlil', 'Reçete', 'Epikriz', 'Diğer'] })}<div class="alan"><label class="alan-etiket" for="bDosya">Dosya <span class="zorunlu">*</span></label><input class="alan-girdi" id="bDosya" type="file" required><p class="alan-yardim"><span>Belge yalnız sende durur; diyetisyenin Veri İzinlerim’den açtığın izinle görür.</span></p></div>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Yükle', { sinif: 'birincil', tur: 'submit' }),
});

export default () => [uyeSayfa({
  yol: 'hesabim/saglik-dosyam', ad: 'Sağlık Dosyam', muhur: 'Sağlık dosyan · kişisel alanın', ikon: 'fa-notes-medical',
  giris: 'Sağlık profilin, ölçümlerin, tahlillerin, belgelerin ve gelişim raporların tek ve güvenli alanda.',
  grup: 'sd', sekmeler, sonEk, js: ['assets/js/sayfa/uye-saglik-dosyam.js'],
})];
