import { uyeSayfa, bolumBas, kart, dugme, modal, tablo, alan, secim, bilgi } from '../../parcalar/uye/ust.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';

// Hedef seçenekleri Tercihlerim ve Hoş geldin sorularıyla aynı (assets/js/sayfa/moduller-soru.js SECENEK.hedef); biri değişirse öteki de değişir
const HEDEFLER = [['kilo-vermek', 'Kilo vermek'], ['formu-korumak', 'Formumu korumak'], ['kas-kazanmak', 'Kas kazanmak'], ['sikilasmak', 'Sıkılaşmak'], ['oruc-aliskanligi', 'Aralıklı oruç alışkanlığı'], ['saglikli-yasam', 'Sağlıklı yaşam']];
// Dikkat edilecek hassasiyetler Haftalık Menüm kısıtlarıyla aynı anahtarlar (tercih-uyum.js bunları okur)
const HASSASIYET = [['laktoz', 'Laktoz'], ['gluten', 'Gluten'], ['yumurta', 'Yumurta'], ['kuruyemis', 'Kuruyemiş ve yer fıstığı'], ['balik', 'Balık ve deniz ürünleri'], ['soya', 'Soya'], ['susam', 'Susam']];

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
<div id="sdProfilRiza"></div>
<div class="iki-kolon esit-boy">${kart({ ikon: 'fa-notes-medical', baslik: 'Sağlık Öykün', metin: '<span id="sdAnamnezOzet"></span>', sag: '<div class="as-eylem"><button class="dugme hayalet kucuk" type="button" id="sdAnamnezDugme">Düzenle</button></div>', govde: '<dl class="kunye oyku-kunye" id="sdAnamnez"></dl>' })}${kart({ ikon: 'fa-triangle-exclamation', baslik: 'Dikkat Edilmesi Gerekenler', metin: 'Öneriler bu kayıtlara göre süzülür.', bosluksuz: true, govde: '<div class="ayar-liste" id="sdDikkat"></div>' })}</div>
${kart({ ikon: 'fa-clock-rotate-left', baslik: 'Profil Değişiklik Kaydı', metin: 'Sağlık profilinde yaptığın her değişiklik tarihiyle; en yenisi üstte.', bosluksuz: true, govde: tablo({ id: 'sdProfilKayit', etiket: 'Sağlık profili değişiklikleri', basliklar: [['Tarih', 'dar-kolon'], ['Alan', 'dar-kolon'], 'Değişiklik'] }) })}
</div>` },
  { id: 'olcum', ad: 'Ölçümlerim', ikon: 'fa-weight-scale', sayi: 'olcum', govde: `<div class="yigin">
${bolumBas({ etiket: 'Ölçümlerin', ikon: 'fa-weight-scale', baslik: 'Vücut Ölçümlerin', metin: 'Grafikte görmek istediğin ölçüyü kutulardan seç. Yeni ölçüm diyetisyen panelinde de görünür.', arac: dugme('Yeni ölçüm ekle', { sinif: 'birincil', ikon: 'fa-plus', ek: ' data-ac="#sdOlcumModal"' }) })}
<div class="veri-kutular" id="sdOlcumKutular"></div>
<div class="iki-kolon esit-boy" id="sdOlcumGovde">${kart({ ikon: 'fa-chart-line', baslik: '<span id="sdGrafikBaslik">Kilo Seyri</span>', metin: '<span id="sdGrafikNot"></span>', sag: donem, sinif: 'donemli', govde: '<div class="grafik-kaydir" id="sdGrafik" tabindex="0"></div>' })}${kart({ ikon: 'fa-bullseye', baslik: 'Hedefine Yolculuk', metin: '<span id="sdHedefMetin"></span>', id: 'sdHedefKart', govde: '<div class="yolculuk" id="sdHedef"></div>' })}</div>
${kart({ ikon: 'fa-table-list', sinif: 'sik-tablo', baslik: 'Ölçüm Geçmişin', metin: '<span id="sdOlcumTarih"></span>', sag: dugme('Ölçümleri indir', { sinif: 'hayalet kucuk', ikon: 'fa-download', ek: ' id="sdOlcumIndir"' }), bosluksuz: true, govde: tablo({ id: 'sdOlcumler', etiket: 'Tarihe göre kilo, BKİ, bel ve yağ oranı', basliklar: ['Tarih', ['Kilo', 'sag'], ['BKİ', 'sag'], ['Bel', 'sag'], ['Yağ oranı', 'sag']] }), alt: dugme('Bütün ölçümleri göster', { ek: ' id="sdOlcumHepsi"' }) })}
</div>` },
  { id: 'tahlil', ad: 'Tahlillerim', ikon: 'fa-flask-vial', sayi: 'tahlil', govde: `<div class="yigin">
${bolumBas({ etiket: 'Tahlillerin', ikon: 'fa-flask-vial', baslik: 'Tahlil ve Raporların', metin: 'Yüklediğin tahlillerin değerleri referans aralığıyla karşılaştırılır. Yorum için diyetisyenine ya da hekimine danış.', arac: dugme('Yeni belge yükle', { sinif: 'birincil', ikon: 'fa-upload', ek: ' data-ac="#sdBelgeModal"' }) })}
${rk('KL-TAHLIL', { tur: 'sar', kap: false })}
<div id="sdTahlilIstek"></div>
<div id="sdTahlilRiza"></div>
<div id="sdIzinNot"></div>
${kart({
    ikon: 'fa-file-arrow-up', baslik: 'e-Nabız Tahlilini Yükle', metin: 'e-Nabız’dan indirdiğin tahlil PDF’ini bırak; değerler aşağıdaki tabloya düşer, PDF’in kendisi de saklanır ve açılır.',
    govde: `<div class="yigin sik"><label class="birak-alani" for="sdENabizDosya" id="sdENabizAlan"><input class="dosya-sec yalniz-okuyucu" id="sdENabizDosya" type="file" accept="application/pdf,.pdf"><span class="birak-ikon"><i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i></span><b>PDF’i buraya sürükle ya da seç</b><span>e-Nabız’da Tahlillerim ekranından indirdiğin PDF. En çok 10 MB; dosya yalnız bu tarayıcıda durur.</span><span class="eylem-satiri"><span class="dugme hayalet kucuk"><i class="fa-solid fa-upload" aria-hidden="true"></i> Dosya seç</span></span></label>${bilgi('fa-circle-info', '<b>Prototip:</b> PDF’in içi okunmaz. Yüklediğin dosya saklanır ve açılır; tabloya “Prototip örneği” etiketli bir e-Nabız değer seti düşer.')}</div>`,
  })}
<div class="yigin" id="sdTahliller"></div>
${kart({ ikon: 'fa-book-medical', baslik: 'Varsayılan Referans Tablosu', metin: 'Rapor kendi laboratuvar aralığını vermediğinde ya da güncel kılavuz daha sıkıysa kullanılır. Tablo 9 Kasım 2026’da derlendi.', sag: '<span class="rozet bekleme">Uzman onayı bekliyor</span>', bosluksuz: true, govde: '<div id="sdReferansTablo"></div>' })}
</div>` },
  { id: 'recete', ad: 'Belgelerim', ikon: 'fa-file-prescription', sayi: 'belge', govde: `<div class="yigin">
${bolumBas({ etiket: 'Belgelerin', ikon: 'fa-file-prescription', baslik: 'Reçete ve Belgelerin', metin: 'Yüklediğin belgeler ve düzenli kullandıkların.', arac: dugme('Yeni belge yükle', { sinif: 'birincil', ikon: 'fa-upload', ek: ' data-ac="#sdBelgeModal"' }) })}
<div class="iki-kolon">${kart({ ikon: 'fa-folder-open', baslik: 'Belge Listesi', bosluksuz: true, govde: '<div class="ayar-liste sarar" id="sdBelgeler"></div>' })}${kart({ ikon: 'fa-pills', baslik: 'Düzenli Kullandıkların', bosluksuz: true, govde: '<div class="ayar-liste" id="sdIlaclar"></div>' })}</div>
</div>` },
  { id: 'gelisim', ad: 'Raporlarım', ikon: 'fa-chart-column', govde: `<div class="yigin">
${bolumBas({ etiket: 'Raporların', ikon: 'fa-chart-column', baslik: 'Gelişim Raporların', metin: 'Seçtiğin dönemin özetini oluştur, yazdır ya da diyetisyeninle paylaş.' })}
${kart({
    ikon: 'fa-file-circle-plus', baslik: 'Yeni Gelişim Raporu Oluştur', form: ' id="sdRaporForm"',
    govde: `<div class="yigin sik"><div class="alan"><span class="alan-etiket">Rapora girecek bölümler</span><div class="alan-izgara c2">${[['olcum', 'Vücut ölçümleri'], ['gunluk', 'Günlük takip özetleri'], ['uyum', 'Program uyumu'], ['tahlil', 'Tahlil ve raporlar']].map(([d, a]) => `<label class="onay-kutusu" for="rBol-${d}"><input type="checkbox" id="rBol-${d}" name="rBolum" value="${d}" checked><span>${a}</span></label>`).join('')}</div></div><div class="satir-form">${alan({ ad: 'rBas', etiket: 'Başlangıç', tur: 'date', zorunlu: true })}${alan({ ad: 'rBit', etiket: 'Bitiş', tur: 'date', zorunlu: true })}${alan({ ad: 'rAd', etiket: 'Rapor adı', zorunlu: true, deger: 'Gelişim raporum' })}${dugme('Raporu oluştur', { sinif: 'birincil', tur: 'submit' })}</div></div>`,
    alt: dugme('Varsayılana dön', { tur: 'reset' }),
  })}
${kart({ ikon: 'fa-folder-open', baslik: 'Oluşturduğun Raporlar', metin: 'Raporu PDF olarak indir, yazdır ya da diyetisyeninle paylaş. Bütün verilerinin dökümü Veri İzinlerim’de.', sag: dugme('Verilerimi indir', { sinif: 'hayalet kucuk', ikon: 'fa-download', href: 'hesabim/veri-izinlerim/#gecmis' }), bosluksuz: true, govde: '<div class="ayar-liste sarar" id="sdRaporlar"></div>' })}
<div id="sdTestGelisim"></div>
<div class="iki-kolon esit esit-boy">${kart({ ikon: 'fa-clipboard-question', baslik: 'Çözdüğün Testler', sag: dugme('Bütün testler', { sinif: 'hayalet kucuk', href: 'saglik-testleri/' }), bosluksuz: true, govde: '<div class="ayar-liste sarar" id="sdTestler"></div>' })}${kart({ ikon: 'fa-calculator', baslik: 'Yaptığın Hesaplar', sag: dugme('Hesaplayıcılar', { sinif: 'hayalet kucuk', href: 'hesaplayicilar/' }), bosluksuz: true, govde: '<div class="ayar-liste sarar" id="sdHesaplar"></div>' })}</div>
</div>` },
];

const sonEk = modal({
  id: 'sdProfilModal', baslik: 'Temel Ölçüler', form: ' id="sdProfilForm"',
  govde: `<div class="alan-izgara c3">${alan({ ad: 'boy', etiket: 'Boy (cm)', tur: 'number', ek: ' min="100" max="250"' })}${alan({ ad: 'kilo', etiket: 'Güncel kilo (kg)', tur: 'number', ek: ' min="30" max="300" step="0.1"' })}${alan({ ad: 'hedef_kilo', etiket: 'Hedef kilo (kg)', tur: 'number', ek: ' min="30" max="300" step="0.1"' })}</div><div class="alan-izgara c2">${alan({ ad: 'dogum_yili', etiket: 'Doğum yılı', tur: 'number', ek: ' min="1920" max="2010"' })}<div class="alan"><label class="alan-etiket" for="hareket_duzeyi">Hareket düzeyi</label><select class="alan-secim" id="hareket_duzeyi" name="hareket_duzeyi"><option value="">Kayıtlı değil</option><option>Hareketsiz</option><option>Az hareketli</option><option>Orta düzeyde hareketli</option><option>Çok hareketli</option><option>Sporcu</option></select></div></div><div class="alan"><label class="alan-etiket" for="hedef">Hedefin</label><select class="alan-secim" id="hedef" name="hedef"><option value="">Seçilmedi</option>${HEDEFLER.map(([d, a]) => `<option value="${d}">${a}</option>`).join('')}</select><p class="alan-yardim"><span>Tercihlerim’deki hedefinle aynı kayıt; birini değiştirince öteki de değişir.</span></p></div>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Profili güncelle', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'sdAnamnezModal', baslik: 'Sağlık Öykün', form: ' id="sdAnamnezForm"',
  govde: `<p class="kart-metin">Hepsini şimdi doldurman gerekmez; yazdıkların kaydedilir, kalanına sonra dönersin.</p>${[['meslek', 'Meslek'], ['sikayet', 'Şikâyetin'], ['uyku', 'Uyku düzenin'], ['su', 'Günlük su'], ['hareket', 'Hareket düzenin'], ['aile_oykusu', 'Aile öykün'], ['aliskanliklar', 'Alışkanlıkların']].map(([a, e]) => alan({ ad: a, etiket: e })).join('')}`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Kaydet', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'sdOlcumModal', baslik: 'Yeni Ölçüm Ekle', form: ' id="sdOlcumForm"',
  govde: `<div class="alan-izgara c2">${alan({ ad: 'oKilo', etiket: 'Kilo (kg)', tur: 'number', zorunlu: true, ek: ' min="30" max="300" step="0.1"' })}${alan({ ad: 'oBel', etiket: 'Bel (cm)', tur: 'number', ek: ' min="40" max="200" step="0.1"' })}${alan({ ad: 'oYag', etiket: 'Yağ oranı (%)', tur: 'number', ek: ' min="3" max="70" step="0.1"' })}${alan({ ad: 'oKalca', etiket: 'Kalça (cm)', tur: 'number', ek: ' min="50" max="200" step="0.1"' })}${alan({ ad: 'oKas', etiket: 'Kas kütlesi (kg)', tur: 'number', ek: ' min="10" max="120" step="0.1"' })}</div><p class="alan-yardim"><span>Kilo zorunlu; ötekileri ölçtüysen yaz.</span></p>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Ölçümü kaydet', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'sdBelgeModal', baslik: 'Yeni Belge Yükle', form: ' id="sdBelgeForm"',
  govde: `${secim({ ad: 'bTur', etiket: 'Belge türü', secenekler: ['Tahlil', 'Reçete', 'Epikriz', 'Diğer'] })}<div class="alan"><label class="alan-etiket" for="bDosya">Dosya <span class="zorunlu">*</span></label><input class="alan-girdi" id="bDosya" type="file" accept="application/pdf,image/*" required><p class="alan-yardim"><span>Belge yalnız sende durur; diyetisyenin Veri İzinlerim’den açtığın izinle görür. Tahlil PDF’inde tabloya prototip örneği değerler düşer.</span></p></div>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Yükle', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'sdDikkatModal', baslik: '<span id="sdDikkatBaslik">Dikkat Edilmesi Gerekenler</span>', form: ' id="sdDikkatForm"',
  govde: `<div id="sdDikkatHassasiyet"><div class="alan"><span class="alan-etiket">Alerji ve hassasiyetlerin</span><div class="alan-izgara c2">${HASSASIYET.map(([d, a]) => `<label class="onay-kutusu" for="dHas-${d}"><input type="checkbox" id="dHas-${d}" name="dHas" value="${d}"><span>${a}</span></label>`).join('')}</div><p class="alan-yardim"><span>Programlar, Haftalık Menüm ve öneriler bu seçimlere göre süzülür.</span></p></div></div>
<div id="sdDikkatMetinAlan"><div class="alan"><label class="alan-etiket" for="sdDikkatMetin" id="sdDikkatEtiket">Kayıtlar</label><textarea class="alan-metin" id="sdDikkatMetin" rows="3"></textarea><p class="alan-yardim"><span>Her birini virgülle ayır. Boş bırakırsan “Kayıtlı değil” görünür.</span></p></div></div>
<div id="sdDikkatRiza"></div>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Kaydet', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'sdOnizleme', baslik: '<span id="sdOnizlemeBaslik">Belge</span>', govde: '<div id="sdOnizlemeGovde"></div>',
  ayak: `<span id="sdOnizlemeIndir"></span>${dugme('Kapat', { sinif: 'birincil', ek: ' data-kapat' })}`,
}).replace('class="modal-kutu"', 'class="modal-kutu belge-modal"');

export default ({ veri }) => [uyeSayfa({
  yol: 'hesabim/saglik-dosyam', ad: 'Sağlık Dosyam',
  giris: 'Sağlık profilin, ölçümlerin, tahlillerin, belgelerin ve raporların tek ve güvenli alanda.',
  grup: 'sd', sekmeler,
  sonEk: sonEk + `<script type="application/json" id="sdTestKatalog">${JSON.stringify(Object.fromEntries(veri.testler.testler.map((t) => [t.slug, t.ad]))).replace(/</g, '\\u003c')}</script>`,
  js: ['assets/js/tahlil-deger.js', 'assets/js/belge-kasa.js', 'assets/js/sayfa/uye-rapor-pdf.js', 'assets/js/sayfa/uye-saglik-dosyam.js'],
})];
