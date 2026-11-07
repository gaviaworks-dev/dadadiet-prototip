import { uyeSayfa, bolumBas, kart, dugme, modal, tablo, alan, secim } from '../../parcalar/uye/ust.mjs';

/* Sekme sırası genelden ayrıntıya: özet, kişisel kayıt, ölçüm, tahlil, belge, üretilen raporlar.
   Eski #not, #test, #hesap adresleri uye-saglik-dosyam.js içinde yeni yerine yönlenir. */
const donem = `<div class="segment" role="group" aria-label="Grafik dönemi" id="sdDonem"><button type="button" data-donem="4" aria-pressed="false">Son 4</button><button type="button" data-donem="8" aria-pressed="false">Son 8</button><button type="button" data-donem="0" aria-pressed="true">Tümü</button></div>`;

const sekmeler = [
  { id: 'ozet', ad: 'Özet', ikon: 'fa-heart-pulse', govde: `<div class="yigin">
${bolumBas({ etiket: 'Dosya özeti', ikon: 'fa-heart-pulse', baslik: 'Sağlık Dosyan Bir Bakışta', metin: 'Son kayıtların tek yerde. Ayrıntısını görmek için kutulardan birini seç.' })}
<div class="veri-kutular" id="sdOzetKutular"></div>
<div id="sdOzetNot"></div>
<div class="iki-kolon esit esit-boy">${kart({ ikon: 'fa-flag', baslik: 'Takip Edilecek Değerler', metin: '<span id="sdTakipMetin"></span>', sag: dugme('Bütün tahliller', { sinif: 'hayalet kucuk', ek: ' data-sekme-git="tahlil"' }), bosluksuz: true, govde: '<div id="sdTakip"></div>' })}${kart({ ikon: 'fa-comment-medical', baslik: 'Diyetisyen Notları', metin: 'Seninle paylaşılan değerlendirmeler.', id: 'sdNotKart', govde: '<div id="sdNotlar"></div>' })}</div>
${kart({ ikon: 'fa-user-shield', baslik: 'Diyetisyeninin Görebildikleri', metin: '<span id="sdIzinMetin"></span>', sag: dugme('Veri izinlerini yönet', { sinif: 'hayalet kucuk', href: 'hesabim/veri-izinlerim/' }), govde: '<div class="izin-sira" id="sdIzinler"></div>' })}
</div>` },
  { id: 'profil', ad: 'Profilim', ikon: 'fa-id-badge', govde: `<div class="yigin">
${bolumBas({ etiket: 'Temel bilgiler', ikon: 'fa-id-card', baslik: 'Sağlık Profilin', metin: 'Program önerileri ve hesaplayıcılar bu bilgileri kullanır. Diyetisyenin bunları ancak sen izin verirsen görür.' })}
${kart({ ikon: 'fa-ruler', baslik: 'Temel Ölçüler', metin: '<span id="sdSon"></span>', sag: '<div class="as-eylem"><button class="dugme hayalet kucuk" type="button" id="sdProfilDugme">Düzenle</button></div>', govde: '<dl class="kunye temel-kunye" id="sdTemel"></dl>' })}
<div class="iki-kolon esit-boy">${kart({ ikon: 'fa-notes-medical', baslik: 'Sağlık Öykün', metin: '<span id="sdAnamnezOzet"></span>', sag: '<div class="as-eylem"><button class="dugme hayalet kucuk" type="button" id="sdAnamnezDugme">Düzenle</button></div>', govde: '<dl class="kunye oyku-kunye" id="sdAnamnez"></dl>' })}${kart({ ikon: 'fa-triangle-exclamation', baslik: 'Dikkat Edilmesi Gerekenler', metin: 'Öneriler bu kayıtlara göre süzülür.', bosluksuz: true, govde: '<div class="ayar-liste" id="sdDikkat"></div>' })}</div>
</div>` },
  { id: 'olcum', ad: 'Ölçümlerim', ikon: 'fa-weight-scale', sayi: 'olcum', govde: `<div class="yigin">
${bolumBas({ etiket: 'Ölçümlerin', ikon: 'fa-weight-scale', baslik: 'Vücut Ölçümlerin', metin: 'Grafikte görmek istediğin ölçüyü kutulardan seç. Yeni ölçüm diyetisyen panelinde de görünür.', arac: dugme('Yeni ölçüm ekle', { sinif: 'birincil', ikon: 'fa-plus', ek: ' data-ac="#sdOlcumModal"' }) })}
<div class="veri-kutular" id="sdOlcumKutular"></div>
<div class="iki-kolon esit-boy" id="sdOlcumGovde">${kart({ ikon: 'fa-chart-line', baslik: '<span id="sdGrafikBaslik">Kilo Seyri</span>', metin: '<span id="sdGrafikNot"></span>', sag: donem, sinif: 'donemli', govde: '<div id="sdGrafik"></div>' })}${kart({ ikon: 'fa-bullseye', baslik: 'Hedefine Yolculuk', metin: '<span id="sdHedefMetin"></span>', id: 'sdHedefKart', govde: '<div class="yolculuk" id="sdHedef"></div>' })}</div>
${kart({ ikon: 'fa-table-list', baslik: 'Ölçüm Geçmişin', metin: '<span id="sdOlcumTarih"></span>', sag: dugme('Ölçümleri indir', { sinif: 'hayalet kucuk', ikon: 'fa-download', ek: ' id="sdOlcumIndir"' }), bosluksuz: true, govde: tablo({ id: 'sdOlcumler', etiket: 'Tarihe göre kilo, BKİ, bel ve yağ oranı', basliklar: ['Tarih', ['Kilo', 'sag'], ['BKİ', 'sag'], ['Bel', 'sag'], ['Yağ oranı', 'sag']] }), alt: dugme('Bütün ölçümleri göster', { ek: ' id="sdOlcumHepsi"' }) })}
</div>` },
  { id: 'tahlil', ad: 'Tahlillerim', ikon: 'fa-flask-vial', sayi: 'tahlil', govde: `<div class="yigin">
${bolumBas({ etiket: 'Tahlillerin', ikon: 'fa-flask-vial', baslik: 'Tahlil ve Raporların', metin: 'Yüklediğin tahlillerin değerleri referans aralığıyla karşılaştırılır. Yorum için diyetisyenine ya da hekimine danış.', arac: dugme('Yeni belge yükle', { sinif: 'birincil', ikon: 'fa-upload', ek: ' data-ac="#sdBelgeModal"' }) })}
<div id="sdTahlilIstek"></div>
<div id="sdIzinNot"></div>
<div class="yigin" id="sdTahliller"></div>
</div>` },
  { id: 'recete', ad: 'Belgelerim', ikon: 'fa-file-prescription', sayi: 'belge', govde: `<div class="yigin">
${bolumBas({ etiket: 'Belgelerin', ikon: 'fa-file-prescription', baslik: 'Reçete ve Belgelerin', metin: 'Yüklediğin belgeler ve düzenli kullandıkların.', arac: dugme('Yeni belge yükle', { sinif: 'birincil', ikon: 'fa-upload', ek: ' data-ac="#sdBelgeModal"' }) })}
<div class="iki-kolon">${kart({ ikon: 'fa-folder-open', baslik: 'Belge Listesi', bosluksuz: true, govde: '<div class="ayar-liste sarar" id="sdBelgeler"></div>' })}${kart({ ikon: 'fa-pills', baslik: 'Düzenli Kullandıkların', bosluksuz: true, govde: '<div class="ayar-liste" id="sdIlaclar"></div>' })}</div>
</div>` },
  { id: 'gelisim', ad: 'Raporlarım', ikon: 'fa-chart-column', govde: `<div class="yigin">
${bolumBas({ etiket: 'Raporların', ikon: 'fa-chart-column', baslik: 'Gelişim Raporların', metin: 'Seçtiğin dönemin özetini oluştur, yazdır ya da diyetisyeninle paylaş.' })}
${kart({
    ikon: 'fa-file-circle-plus', baslik: 'Yeni Gelişim Raporu Oluştur', form: ' id="sdRaporForm"',
    govde: `<div class="satir-form">${alan({ ad: 'rBas', etiket: 'Başlangıç', tur: 'date', zorunlu: true })}${alan({ ad: 'rBit', etiket: 'Bitiş', tur: 'date', zorunlu: true })}${alan({ ad: 'rAd', etiket: 'Rapor adı', zorunlu: true, deger: 'Gelişim raporum' })}${dugme('Raporu oluştur', { sinif: 'birincil', tur: 'submit' })}</div>`,
  })}
${kart({ ikon: 'fa-folder-open', baslik: 'Oluşturduğun Raporlar', bosluksuz: true, govde: '<div class="ayar-liste sarar" id="sdRaporlar"></div>' })}
<div class="iki-kolon esit esit-boy">${kart({ ikon: 'fa-clipboard-question', baslik: 'Çözdüğün Testler', sag: dugme('Bütün testler', { sinif: 'hayalet kucuk', href: 'saglik-testleri/' }), bosluksuz: true, govde: '<div class="ayar-liste sarar" id="sdTestler"></div>' })}${kart({ ikon: 'fa-calculator', baslik: 'Yaptığın Hesaplar', sag: dugme('Hesaplayıcılar', { sinif: 'hayalet kucuk', href: 'hesaplayicilar/' }), bosluksuz: true, govde: '<div class="ayar-liste sarar" id="sdHesaplar"></div>' })}</div>
</div>` },
];

const sonEk = modal({
  id: 'sdProfilModal', baslik: 'Temel Ölçüler', form: ' id="sdProfilForm"',
  govde: `<div class="alan-izgara c3">${alan({ ad: 'boy', etiket: 'Boy (cm)', tur: 'number', ek: ' min="100" max="250"' })}${alan({ ad: 'kilo', etiket: 'Güncel kilo (kg)', tur: 'number', ek: ' min="30" max="300" step="0.1"' })}${alan({ ad: 'hedef_kilo', etiket: 'Hedef kilo (kg)', tur: 'number', ek: ' min="30" max="300" step="0.1"' })}</div>${alan({ ad: 'hedef', etiket: 'Hedefin' })}`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Profili güncelle', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'sdAnamnezModal', baslik: 'Sağlık Öykün', form: ' id="sdAnamnezForm"',
  govde: `<p class="kart-metin">Hepsini şimdi doldurman gerekmez; yazdıkların kaydedilir, kalanına sonra dönersin.</p>${[['meslek', 'Meslek'], ['sikayet', 'Şikâyetin'], ['uyku', 'Uyku düzenin'], ['su', 'Günlük su'], ['hareket', 'Hareket düzenin'], ['aile_oykusu', 'Aile öykün'], ['aliskanliklar', 'Alışkanlıkların']].map(([a, e]) => alan({ ad: a, etiket: e })).join('')}`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Kaydet', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'sdOlcumModal', baslik: 'Yeni ölçüm ekle', form: ' id="sdOlcumForm"',
  govde: `<div class="alan-izgara c2">${alan({ ad: 'oKilo', etiket: 'Kilo (kg)', tur: 'number', zorunlu: true, ek: ' min="30" max="300" step="0.1"' })}${alan({ ad: 'oBel', etiket: 'Bel (cm)', tur: 'number', ek: ' min="40" max="200" step="0.1"' })}${alan({ ad: 'oYag', etiket: 'Yağ oranı (%)', tur: 'number', ek: ' min="3" max="70" step="0.1"' })}</div>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Ölçümü kaydet', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'sdBelgeModal', baslik: 'Yeni belge yükle', form: ' id="sdBelgeForm"',
  govde: `${secim({ ad: 'bTur', etiket: 'Belge türü', secenekler: ['Tahlil', 'Reçete', 'Epikriz', 'Diğer'] })}<div class="alan"><label class="alan-etiket" for="bDosya">Dosya <span class="zorunlu">*</span></label><input class="alan-girdi" id="bDosya" type="file" required><p class="alan-yardim"><span>Belge yalnız sende durur; diyetisyenin Veri İzinlerim’den açtığın izinle görür.</span></p></div>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Yükle', { sinif: 'birincil', tur: 'submit' }),
});

export default () => [uyeSayfa({
  yol: 'hesabim/saglik-dosyam', ad: 'Sağlık Dosyam',
  giris: 'Sağlık profilin, ölçümlerin, tahlillerin, belgelerin ve raporların tek ve güvenli alanda.',
  grup: 'sd', sekmeler, sonEk, js: ['assets/js/tahlil-deger.js', 'assets/js/sayfa/uye-saglik-dosyam.js'],
})];
