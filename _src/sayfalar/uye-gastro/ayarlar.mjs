import { uyeKabuk } from '../../parcalar/uye/kabuk.mjs';
import { bolumBas, kart, ayarSatir, anahtar, alan, secim, dugme, modal } from '../../parcalar/uye/ust.mjs';
import { ikon, altNot, uyari, durumSatir, bag, sekmeGit, duzBolum, okumaBolum } from './_ortak.mjs';

const kaydedildi = `<span class="kaydedildi">${ikon('fa-circle-check')} Kaydedildi</span>`;
const kartAlt = (not, metin = 'Tercihleri Kaydet', dIkon = '') => `<span class="not">${not}</span>${kaydedildi}${dugme(metin, { sinif: 'birincil', ikon: dIkon, tur: 'submit' })}`;
const satirDugme = (metin, ek = '') => `<button class="satir-dugme" type="button"${ek}>${metin}</button>`;
const sifre = (ad, etiket, otomatik) => `<div class="alan"><label class="alan-etiket" for="${ad}">${etiket} <span class="zorunlu">*</span></label><div class="alan-sifre"><input class="alan-girdi" id="${ad}" name="${ad}" type="password" required autocomplete="${otomatik}"><button class="alan-goz" type="button" data-goz aria-label="Şifreyi göster">${ikon('fa-eye')}</button></div></div>`;
const secenek = (ad, etiket, l) => `<select class="alan-secim" name="${ad}" aria-label="${etiket}">${l.map((o) => `<option>${o}</option>`).join('')}</select>`;

const profil = `<div class="yigin">
${kart({ ikon: 'fa-id-card', baslik: 'Profil Bilgilerim', metin: 'Adın ve fotoğrafın diyetisyenine, destek gruplarında ve profilinde görünür.', form: ' id="profilForm" novalidate', govde: `<p class="alan-yardim"><span>Fotoğrafını kartın üstündeki kamera düğmelerinden değiştirebilirsin: JPG veya PNG, en çok 5 MB. Kapak görselini de aynı yerden seçersin.</span></p>
<div class="alan-izgara c2">${alan({ ad: 'hsAd', etiket: 'Ad', zorunlu: true })}${alan({ ad: 'hsSoyad', etiket: 'Soyad', zorunlu: true })}</div>
<div class="alan"><label class="alan-etiket" for="hsKullanici">Kullanıcı adı <span class="zorunlu">*</span></label><input class="alan-girdi" id="hsKullanici" required><p class="alan-yardim"><span>Destek gruplarında bu adla görünürsün: <b id="hsAdres"></b></span></p></div>
<div class="alan-izgara c2">${alan({ ad: 'hsEposta', etiket: 'E-posta', tur: 'email', zorunlu: true, yardim: 'Değiştirirsen yeni adrese doğrulama bağlantısı gönderilir.' })}
<div class="alan"><label class="alan-etiket" for="hsTel">Telefon <span class="istege-bagli">(isteğe bağlı)</span></label><div class="alan-telefon"><button class="alan-ulke" type="button" id="hsUlke" aria-haspopup="listbox" aria-expanded="false"><span class="alan-ulke-bayrak">TR</span><span class="alan-ulke-kod">+90</span>${ikon('fa-chevron-down')}</button><input class="alan-girdi" id="hsTel" type="tel" inputmode="tel"><div class="alan-ulke-katman" id="hsUlkeKatman" hidden><ul class="alan-ulke-liste" role="listbox" aria-label="Ülke kodu"></ul></div></div></div></div>
<div class="alan-izgara c2"><div class="alan"><label class="alan-etiket" for="hsDogum">Doğum tarihi <span class="istege-bagli">(isteğe bağlı)</span></label><input class="alan-girdi" id="hsDogum" type="date" min="1926-01-01" max="2013-11-06"><p class="alan-yardim"><span>Enerji ihtiyacı ve hesaplayıcı önerilerinde kullanılır.</span></p></div>${secim({ ad: 'hsHedef', etiket: 'Beslenme hedefim', secenekler: ['Kilo verme', 'Kilo koruma', 'Kilo alma', 'Sağlıklı beslenme', 'Sporcu beslenmesi'] })}</div>
<div class="alan"><label class="alan-etiket" for="hsBio">Hakkımda <span class="istege-bagli">(isteğe bağlı)</span> <span class="alan-sayac" id="hsBioSay">0 / 160</span></label><textarea class="alan-metin" id="hsBio" rows="3" maxlength="160"></textarea></div>`, alt: kartAlt('<span id="hsGuncel">Son güncelleme: 2 gün önce</span>', 'Değişiklikleri Kaydet') })}
${kart({ ikon: 'fa-eye', baslik: 'Profil Görünürlüğü', metin: `Profilinin ve takip geçmişinin kimlere göründüğünü buradan seç. Verinin dışa aktarımı, saklanması ve silinmesi ${sekmeGit('Veri ve Hesap Yönetimi', 'veri')} sekmesinde yönetilir.`, form: ' data-ayar-form="gorunurluk" data-mesaj="Görünürlük tercihlerin kaydedildi."', bosluksuz: true, govde: `<div class="ayar-liste">
${ayarSatir({ ikon: 'fa-id-badge', baslik: 'Profilim herkese açık', metin: 'Kapatırsan profilini yalnız sen ve diyetisyenin görürsün.', sag: anahtar('acik', 'Profilim herkese açık', true) })}
${ayarSatir({ ikon: 'fa-chart-line', baslik: 'Takip geçmişimi kimler görebilir?', metin: 'Tamamladığın öğün kayıtları, program günleri ve ölçümlerin.', sag: secenek('takip', 'Takip geçmişimi kimler görebilir?', ['Yalnız ben', 'Diyetisyenim', 'Destek grubum']) })}
${ayarSatir({ ikon: 'fa-medal', baslik: 'Rozetlerim ve puanım profilimde görünsün', metin: `Kapatırsan rozetleri yalnız sen görürsün; ${bag('Rozetlerim', 'hesabim/rozetlerim/')} sayfası etkilenmez.`, sag: anahtar('rozet', 'Rozetlerim ve puanım profilimde görünsün', true) })}
${ayarSatir({ ikon: 'fa-ranking-star', baslik: 'Liderlik tablosunda adım görünsün', metin: `Kapatırsan sıralamada “anonim üye” olarak yer alırsın. Sıralamayı ${bag('Rozetlerim › Liderlik', 'hesabim/rozetlerim/#liderlik')} sekmesinde görürsün.`, sag: anahtar('liderlik', 'Liderlik tablosunda adım görünsün', true) })}
${ayarSatir({ ikon: 'fa-magnifying-glass', baslik: 'Arama motorlarında görün', metin: 'Kapalıyken herkese açık profilin arama motorlarına dizinlenmez.', sag: anahtar('seo', 'Arama motorlarında görün') })}
</div>`, alt: kartAlt(sekmeGit('KVKK kapsamında verilerimi indir', 'veri')) })}
</div>`;

const kanallar = [
  ['diyetisyen', 'Diyetisyen mesajı ve randevu', 'Mesaj geldiğinde, randevu onaylandığında ya da yaklaştığında.', 1, 1],
  ['takip', 'Günlük takip hatırlatması', 'Öğün girmediğin günlerde akşam hatırlatması.', 1, 1],
  ['su', 'Su hatırlatması', 'Günlük su hedefine ulaşmadığında hatırlatma.', 0, 1],
  ['revizyon', 'Program revizyonu', 'Diyetisyenin programını güncellediğinde ya da yeni plan gönderdiğinde.', 1, 1],
  ['rapor', 'Haftalık özetim', 'Pazar akşamı: aktif gün, öğün düzeni, su ve ölçüm özeti.', 1, 0],
  ['icerik', 'Yeni tarif, program ve rehber', 'Sana uygun yeni içerik eklendiğinde.', 0, 1],
  ['kampanya', 'Kampanya ve Dada Diet Pro fırsatları', 'Paket indirimleri ve özel dönem seçkileri.', 0, 0],
  ['tahlil', 'Tahlil sonuçları', 'Yüklediğin tahlilin değerleri okunduğunda ya da diyetisyenin yorumladığında.', 1, 1],
  ['haftalikMenu', 'Haftalık menü', 'Yeni haftanın menüsü hazır olduğunda, pazartesi sabahı.', 0, 1],
  ['meydan', 'Rozet ve meydan okuma', 'Rozet kazandığında ve meydan okumanın günü işaretlenmeyi beklerken.', 0, 1],
  ['grup', 'Destek grupları', 'Gönderine yorum geldiğinde.', 0, 1],
];
const kanalSatir = ([k, b, m, e, u]) => `<div class="kanal-satir"><div class="kanal-metin"><b>${b}</b><span>${m}</span></div><span class="kanal-hucre">${anahtar(k + '_eposta', b + ', e-posta', e)}</span><span class="kanal-hucre">${anahtar(k + '_uygulama', b + ', uygulama', u)}</span></div>`;
const kategoriler = [['randevu', 'Görüşme ve randevu', 'Görüşmenden önce tek hatırlatma'], ['menu', 'Haftalık menü günü', 'Gün başında tek bildirim'], ['mesaj', 'Diyetisyen mesajı', 'Diyetisyenin yazdığında'], ['odeme', 'Ödeme ve fatura', 'Yalnız işlem gerektiğinde']];

const bildirim = `<div class="yigin">
${kart({ ikon: 'fa-bell', baslik: 'Bildirim Tercihlerim', metin: 'Hangi bildirimi hangi kanaldan alacağını seç. Öğün hatırlatmaları planındaki saate göre gönderilir.', form: ' data-ayar-form="bildirim" data-mesaj="Bildirim tercihlerin kaydedildi."', govde: `<div class="kanal-matris"><div class="kanal-satir bas"><span>Bildirim</span><span>E-posta</span><span>Uygulama</span></div>${kanallar.map(kanalSatir).join('')}</div>
<div class="ayar-liste">
${ayarSatir({ ikon: 'fa-shield-halved', baslik: 'Güvenlik uyarıları', metin: 'Yeni cihazdan giriş, şifre değişikliği ve iki adımlı doğrulama işlemleri her zaman e-posta ile bildirilir. Bu bildirim kapatılamaz.', sag: `<span class="as-acik">${ikon('fa-lock')} Her zaman açık</span>` })}
${ayarSatir({ ikon: 'fa-clock', baslik: 'Hatırlatma saati', metin: 'Günlük takip hatırlatmasının varsayılan saati.', sag: '<input class="alan-girdi" name="saat" type="time" value="20:00" aria-label="Hatırlatma saati">' })}
${ayarSatir({ ikon: 'fa-moon', baslik: 'Sessiz saatler', metin: 'Bu aralıkta uygulama bildirimi gönderilmez; e-posta etkilenmez.', sag: secenek('sessiz', 'Sessiz saatler', ['22.00–08.00', '23.00–07.00', '00.00–06.00', 'Kapalı']) })}
</div>${altNot('fa-bell', `Gelen bildirimlerini görmek için ${bag('bildirim akışına git', 'hesabim/bildirimler/')}. Öğün hatırlatmalarının hangi günlere düştüğü ${bag('Beslenme Planım', 'hesabim/beslenme-planim/')} sayfasından gelir.`)}`, alt: kartAlt('Bu tercihler yalnız Dada Diet bildirimlerini kapsar.') })}
${kart({ ikon: 'fa-bell', baslik: 'Bildirim Kategorileri', metin: 'Her kategori ayrı kapatılabilir; sıklığı da kanal ayarlarından belirlersin.', sag: `<a class="dugme hayalet kucuk" href="#bildirim">Kanal ayarları ${ikon('fa-arrow-right')}</a>`, form: ' data-ayar-form="bildirimKategori" data-mesaj="Kategori tercihlerin kaydedildi."', bosluksuz: true, govde: `<div class="ayar-liste">${kategoriler.map(([k, b, m]) => ayarSatir({ baslik: b, metin: m, sag: anahtar(k, b, true) })).join('')}</div>`, alt: kartAlt('Kapattığın kategori yalnız bu hesapta geçerlidir.') })}
</div>`;

const guvenlik = `<div class="yigin">
${kart({ ikon: 'fa-lock', baslik: 'Güvenlik', metin: 'Şifreni değiştir, iki adımlı doğrulamayı yönet, açık oturumlarını gör.', form: ' id="sifreForm" novalidate', govde: `${sifre('pwCur', 'Mevcut şifren', 'current-password')}<div class="alan-izgara c2">${sifre('pwNew', 'Yeni şifre', 'new-password')}${sifre('pwNew2', 'Yeni şifre (tekrar)', 'new-password')}</div><p class="alan-yardim"><span>En az 8 karakter; büyük harf, küçük harf, rakam ve özel karakter (!, @, #, $ vb.) içermeli. Başka sitede kullandığın şifreyi tekrar etme.</span></p>`, alt: kartAlt('<span id="pwGuncel">Son şifre değişikliği: 4 ay önce</span>', 'Şifreyi Güncelle', 'fa-key') })}
${kart({ ikon: 'fa-mobile-screen-button', baslik: 'İki Adımlı Doğrulama ve Giriş Yöntemleri', metin: 'Hesabına giriş yollarını ve ek doğrulama katmanını yönet.', bosluksuz: true, govde: `<div class="ayar-liste">
${ayarSatir({ ikon: 'fa-shield-halved', baslik: 'İki adımlı doğrulama', metin: '<span id="gv2faDurum"></span>', sag: `<span class="as-eylem">${satirDugme(`${ikon('fa-sliders')} Kurulumu Aç`, ' data-ac="#tfaModal"')}${anahtar('gv2fa', 'İki adımlı doğrulama', true, ' id="gv2fa"')}</span>` })}
${ayarSatir({ ikon: 'fa-key', baslik: 'Kurtarma Kodların', metin: '<span id="gvKodDurum"></span>', sag: `<span class="as-eylem">${satirDugme('Kodları Göster', ' id="gvKodGoster"')}${satirDugme('Yenile', ' id="gvKodYenile"')}</span>` })}
${ayarSatir({ ikon: 'fa-envelope', baslik: 'E-posta ile giriş', metin: '<span id="gvEposta"></span> · birincil giriş yöntemin.', sag: `<span class="as-acik">${ikon('fa-circle-check')} Aktif</span>` })}
${ayarSatir({ ikon: 'fa-brands fa-google', baslik: 'Google hesabı', metin: '<span data-bag-metin="Google"></span>', sag: `<span class="as-eylem">${satirDugme('Bağla', ' data-bagla="Google"')}</span>` })}
${ayarSatir({ ikon: 'fa-brands fa-apple', baslik: 'Apple hesabı', metin: '<span data-bag-metin="Apple"></span>', sag: `<span class="as-eylem">${satirDugme('Bağla', ' data-bagla="Apple"')}</span>` })}
${ayarSatir({ ikon: 'fa-brands fa-facebook', baslik: 'Facebook hesabı', metin: '<span data-bag-metin="Facebook"></span>', sag: `<span class="as-eylem">${satirDugme('Bağla', ' data-bagla="Facebook"')}</span>` })}
</div>` })}
${kart({ ikon: 'fa-desktop', baslik: 'Açık Oturumlarım', metin: 'Hesabına giriş yapılmış cihazlar. Tanımadığın bir cihaz varsa oturumu kapat ve şifreni değiştir.', bosluksuz: true, govde: '<div class="ayar-liste" id="oturumlar"></div>', alt: `<span class="not">Bu cihaz dışındaki tüm oturumlar kapatılır; yeniden giriş yapman gerekir.</span>${dugme('Diğer Tüm Oturumları Kapat', { ikon: 'fa-right-from-bracket', ek: ' id="oturumKapat"' })}` })}
</div>`;

const dil = kart({ ikon: 'fa-globe', baslik: 'Dil ve Bölge', metin: 'Arayüz dili, bölge ve ölçü birimleri. Birim tercihin öğün kayıtlarında, ölçümlerinde ve grafiklerde geçerli olur.', form: ' data-ayar-form="bolge" data-mesaj="Dil ve bölge tercihlerin kaydedildi."', govde: `<div class="alan-izgara c2">${secim({ ad: 'dil', etiket: 'Arayüz dili', secenekler: ['Türkçe', 'English'] })}${secim({ ad: 'bolge', etiket: 'Bölge', secenekler: ['Türkiye', 'Almanya', 'Birleşik Krallık', 'Amerika Birleşik Devletleri'] })}</div>
<div class="alan-izgara c2">${secim({ ad: 'saat', etiket: 'Saat dilimi', secenekler: ['(GMT+03:00) İstanbul', '(GMT+01:00) Berlin', '(GMT+00:00) Londra'] })}${secim({ ad: 'hafta', etiket: 'Haftanın ilk günü', secenekler: ['Pazartesi', 'Pazar'] })}</div>
<div class="alan-izgara c3">${secim({ ad: 'agirlik', etiket: 'Ağırlık birimi', secenekler: ['Kilogram (kg)', 'Pound (lb)'] })}${secim({ ad: 'sivi', etiket: 'Sıvı ölçüsü', secenekler: ['Mililitre (ml)', 'Bardak', 'Ons (fl oz)'] })}${secim({ ad: 'boy', etiket: 'Boy birimi', secenekler: ['Santimetre (cm)', 'İnç (inç)'] })}</div>
${secim({ ad: 'mesafe', etiket: 'Mesafe birimi', secenekler: ['Kilometre (km)', 'Mil (mi)'] })}
<div class="ayar-liste">
${ayarSatir({ ikon: 'fa-bolt', baslik: 'Enerji birimi', metin: 'Öğün kartlarındaki enerji değerinin gösterim birimi.', sag: secenek('enerji', 'Enerji birimi', ['Kilokalori (kcal)', 'Kilojul (kJ)']) })}
${ayarSatir({ ikon: 'fa-eye-slash', baslik: 'Enerji değerlerini gizle', metin: 'Açıkken sayısal enerji yerine öğün düzeni, aktif gün ve çeşitlilik gösterilir.', sag: anahtar('enerjiGizle', 'Enerji değerlerini gizle') })}
${ayarSatir({ ikon: 'fa-calendar-day', baslik: 'Tarih biçimi', metin: 'Plan takvimi, ölçüm ve kayıt listelerinde kullanılır.', sag: secenek('tarih', 'Tarih biçimi', ['14.03.2026 (gg.aa.yyyy)', '2026-03-14 (yyyy-aa-gg)']) })}
</div>`, alt: kartAlt('Birim değişikliği geçmiş kayıtlarını silmez, yalnız gösterimi çevirir.') });

const yonKart = (sinif, i, baslik, metin, l, m) => `<div class="yon-kart${sinif}"><span class="yon-ikon">${ikon(i)}</span><h3 class="kart-baslik">${baslik}</h3><p>${metin}</p><ul>${l.map((x) => `<li>${ikon(m)} ${x}</li>`).join('')}</ul></div>`;
const baglanti = `<div class="yigin">
${bolumBas({ etiket: 'Veri akışının yönü', ikon: 'fa-arrows-left-right', baslik: 'Bu Sekmede Ne Oluyor?', metin: 'Bir bağlantı iki yönlü olabilir: bir kısmı Dada Diet’e <b>gelir</b>, bir kısmı Dada Diet’ten dış sisteme <b>gider</b>. Aşağıdaki üç kutu hangisinin hangi yönde aktığını açıkça söyler.', arac: `<a class="dugme hayalet kucuk" href="#veri" data-sekme-git="veri">Veri ve Hesap Yönetimi ${ikon('fa-arrow-right')}</a>` })}
<div class="yon-izgara">
${yonKart('', 'fa-right-to-bracket', 'Dada Diet’e Gelen', 'Bağlı sistemden okunan takip verisi. Yalnız açtığın izin kadarı okunur.', ['Adım ve hareket süren', 'Kilo, yağ oranı ve bel ölçümün', 'Uyku süren', 'Nabız özetin: yalnız sen açarsan'], 'fa-check')}
${yonKart(' giden', 'fa-arrow-right-from-bracket', 'Dada Diet’ten Giden', 'Her bağlantıdan yalnız tek bir şey çıkar ve o da ayrı bir izne bağlıdır. Kapatırsan hiçbir veri gönderilmez.', ['Günlük su ve enerji toplamın sağlık uygulamasına yazılır', 'Bağlantı başına ayrı yazma izni: Apple Sağlık ve Health Connect için tek tek'], 'fa-arrow-up-right-from-square')}
${yonKart(' kapali', 'fa-ban', 'Hiçbir Koşulda Gitmeyen', 'Bu sekmedeki hiçbir anahtar aşağıdakileri dış bir sisteme açmaz.', ['Tahlil sonuçların ve sağlık belgelerin', 'Diyetisyeninle yazışman ve notlar', 'Ödeme ve fatura bilgin', 'Beslenme planın ve özel notların'], 'fa-xmark')}
</div>
${`<div class="bilgi-notu">${ikon('fa-circle-info')}<p><b>Bağlantılardan gelen veri tanı koymaz ve beslenme önerisi üretmez.</b> Cihazdan gelen adım, kilo ve nabız değeri o cihazın bildirimidir; Dada Diet bunu doğrulamaz. Bu demoda bağlantılar örnek kayıtlarla çalışır. Diyetisyeninin bu veriyi görüp göremeyeceği ayrı bir karardır ve ${bag('Veri İzinlerim', 'hesabim/veri-izinlerim/')}’den yönetilir. Yasal metin: ${bag('Aydınlatma Metni', 'yasal/kvkk/')}.</p></div>`}
${bolumBas({ etiket: 'Dört seçenek', ikon: 'fa-list-check', baslik: 'Bağlantıların', metin: 'Her kartta beş şey yazılı: bağlantı durumu, verdiğin izinler, son senkronizasyon, hangi verinin hangi yöne aktarıldığı ve bağlantıyı kesme.' })}
<div class="suzgec-satir"><div class="cipler" role="group" aria-label="Bağlantı durumu süzgeci" id="baSuzgec"><span class="cipler-basligi">Durum</span>${[['tumu', '', 'Tümü'], ['acik', 'fa-circle-check', 'Etkin'], ['kapali', 'fa-circle-minus', 'Etkin değil']].map(([k, i, a], n) => `<button class="cip suzgec${n ? '' : ' aktif'}" type="button" data-durum="${k}">${i ? ikon(i) + ' ' : ''}${a}</button>`).join('')}</div><span class="kart-sayac"><b id="baSay">4</b> bağlantı gösteriliyor</span></div>
<div class="yigin" id="baListe"></div><div id="baBos" hidden></div>
${bolumBas({ etiket: 'Senkronizasyon', ikon: 'fa-rotate', baslik: 'Ne Sıklıkla Güncellensin?', metin: 'Bu tercih tüm etkin bağlantılar için geçerlidir. Bağlantı başına izinler yukarıda ayrı ayrı duruyor; burası yalnız <b>ne zaman</b> okunacağını belirler.' })}
<div class="iki-kolon esit">${kart({ kolon: true, ikon: 'fa-clock-rotate-left', baslik: 'Sıklık ve Elle Yenileme', govde: `<div class="alan"><label class="alan-etiket" for="baSiklik">Senkronizasyon sıklığı</label><select class="alan-secim" id="baSiklik">${['Otomatik: cihaz uygun olduğunda', 'Saatte bir', 'Günde bir', 'Yalnız elle yenilediğimde'].map((o) => `<option>${o}</option>`).join('')}</select><p class="alan-yardim"><span>Otomatikte ölçüm geldiğinde ve uygulamayı açtığında okunur.</span></p></div>${dugme('Şimdi Senkronize Et', { sinif: 'birincil', ikon: 'fa-rotate', ek: ' id="baSimdi"' })}<p class="durum-satir" id="baCanli" role="status" hidden>${ikon('fa-circle-check')} <span></span></p>` })}
${kart({ kolon: true, ikon: 'fa-list-check', baslik: 'Senkronlanan Veri Nereye Düşer', bosluksuz: true, govde: `<div class="ayar-liste">${[['fa-utensils', 'Günlük Takibim', 'Adım, hareket ve su kayıtların burada birikir', 'hesabim/gunluk-takibim/'], ['fa-notes-medical', 'Sağlık Dosyam', 'Tartıdan gelen kilo, yağ oranı ve bel ölçümün', 'hesabim/saglik-dosyam/'], ['fa-user-shield', 'Veri İzinlerim', 'Diyetisyeninin bu veriyi görüp görmeyeceği', 'hesabim/veri-izinlerim/'], ['fa-shield-halved', 'Veri ve Hesap Yönetimi', 'Tuttuğumuz veri grupları, dışa aktarım, saklama süresi ve veri silme', 'hesabim/ayarlar/#veri']].map(([i, b, m, h]) => ayarSatir({ ikon: i, baslik: b, metin: m, sag: `<a class="satir-dugme" href="{{kok}}${h}">Aç</a>` })).join('')}</div>` })}</div>
<div class="bilgi-notu">${ikon('fa-shield-halved')}<p><b>Bu sekme yalnız cihaz ve uygulama bağlantılarını yönetir.</b> Verinin hangi amaçla tutulduğu, saklama süresi ve verini indirme ya da silme işlemleri ${sekmeGit('Veri ve Hesap Yönetimi', 'veri')} sekmesindedir. Bağlı Uygulamalar’daki hiçbir anahtar oradaki izinleri otomatik açmaz. Paketin ve ödemelerinle ilgili işlemler için ${bag('Paketlerim', 'hesabim/paketlerim/')}, yasal metinler için ${bag('Gizlilik (KVKK)', 'yasal/kvkk/')}.</p></div>
</div>`;

const kalem = (i, b, m, uc) => `<div class="kalem-satiri"><span class="ks-ikon">${ikon(i)}</span><div class="ks-metin"><b>${b}</b><small>${m}</small></div><span class="ks-uc">${uc}</span></div>`;
const eylem = (m, ek = '') => `<button class="satir-dugme" type="button"${ek}>${m}</button>`;
const bagUc = (m, y) => `<a class="satir-dugme" href="{{kok}}${y}">${m}</a>`;
const veri = `<div class="iki-kolon esit">
${kart({ kolon: true, ikon: 'fa-database', baslik: 'Verini Gör, İndir, Sil', id: 'indir', govde: `<div class="fp-list">
${kalem('fa-list', 'Tuttuğumuz veriler', 'Profil, planlar, öğün ve su kayıtları, ölçümler, belgeler ve mesajlar', eylem('Listele', ' id="vzListele" aria-expanded="false" aria-controls="vzListe"'))}
<div id="vzListe" hidden><div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Hesabında tutulan veri grupları"><table class="tablo panel"><caption class="yalniz-okuyucu">Hesabında tutulan veri grupları</caption><thead><tr><th scope="col">Veri grubu</th><th scope="col">Kayıt</th><th scope="col">İlk kayıt</th><th scope="col">Saklama</th></tr></thead><tbody id="vzTablo"></tbody></table></div><p class="alan-yardim"><span>Hesabını silersen bu grupların tamamı 30 gün içinde silinir; faturalar yasal saklama süresince muhasebe kaydında kalır.</span></p></div>
${kalem('fa-download', 'Veriyi indir', 'Planların, kayıtların ve ölçümlerin makine okunur dosya olarak, tek seferde', eylem('İndir', ' id="vzIndir"'))}
<div id="vzIndirDurum" hidden><div class="yigin sik" id="vzAdimlar"></div></div>
${kalem('fa-pen', 'Kaydı düzelt', 'Yanlış girdiğin öğün, ölçüm ya da su kaydını düzeltebilirsin', bagUc('Günlüğe git', 'hesabim/gunluk-takibim/'))}
${kalem('fa-trash-can', 'Veriyi sil', 'Yalnız takip verisi ya da tüm hesap: ikisi ayrı seçenektir', `<a class="satir-dugme" href="#dondurma" data-sekme-git="dondurma">Sil</a>`)}
</div>` })}
${kart({ kolon: true, ikon: 'fa-hourglass-half', baslik: 'Saklama ve Erişim', govde: `<div class="fp-list">
${kalem('fa-calendar', 'Öğün, takip ve ölçüm kaydı', 'Hesabın açık kaldığı sürece; hesap silinince 30 gün içinde silinir', 'Aktif')}
${kalem('fa-user-shield', 'Rol bazlı erişim', 'Diyetisyen yalnız izin verdiğin veriyi görür; yönetim erişimi işlem kaydına yazılır', 'Açık')}
${kalem('fa-clipboard-list', 'İşlem kaydı', 'Verine kimin ne zaman eriştiği tutulur', bagUc(`Görüntüle ${ikon('fa-arrow-right')}`, 'hesabim/veri-izinlerim/'))}
${kalem('fa-child', 'Yaş ve veli onayı', '18 yaş altı üyede veli onayı istenir; kalori hedefi ve diyetisyen görüşmesi veli onayına bağlıdır', 'Uygulanıyor')}
</div>` })}
</div>`;

const madde = (l) => `<ul class="madde-liste">${l.map((x) => `<li>${ikon('fa-circle')} <span>${x}</span></li>`).join('')}</ul>`;
const dondurma = `<div class="yigin">
${kart({ ikon: 'fa-circle-pause', baslik: 'Hesabı Dondurma', metin: 'Bir süre ara vermek istersen hesabını kapatmadan dondurabilirsin.', sinif: 'uyari-kart', id: 'dondur', govde: `${uyari('fa-triangle-exclamation', '<b>Uyarı:</b> dondurma süresince profilin ve diyetisyen paylaşımın gizlenir, yaklaşan randevuların iptal edilir. Verilerin silinmez.')}
${madde(['Planların, ölçümlerin, kayıtların ve rozetlerin korunur; geri döndüğünde yerinde durur.', 'Bildirimler ve hatırlatmalar durur.', `<b>Görüşme haklarının süresi işlemeye devam eder.</b> Satın aldığın paket ${bag('Ödemelerim', 'hesabim/odemelerim/#hizmet')} sayfasında kalır.`, 'Giriş yaptığın anda hesabın kendiliğinden aktifleşir.'])}
<form class="onay-kapisi" id="dondurForm" novalidate>${secim({ ad: 'dondurSure', etiket: 'Dondurma süresi', secenekler: ['1 hafta', '2 hafta', '1 ay', '3 ay', 'Ben tekrar giriş yapana kadar'] })}<label class="onay-kutusu" for="dondurOnay"><input type="checkbox" id="dondurOnay"><span>Dondurma sırasında profilimin gizleneceğini, yaklaşan randevularımın iptal edileceğini ve görüşme hakkı süremin işlemeye devam edeceğini anladım.</span></label><div class="onay-eylemler">${dugme('Hesabı Dondur', { sinif: 'uyari', ikon: 'fa-circle-pause', tur: 'submit', ek: ' id="dondurBtn" disabled' })}${durumSatir('fa-lock', 'Düğme kapalı: dondurmak için önce onay kutusunu işaretle.', ' id="dondurDurum"')}</div></form>` })}
${kart({ ikon: 'fa-user-xmark', baslik: 'Hesabımı Sil', metin: `Hesabını kalıcı olarak kapatır. Ara vermek istiyorsan <a href="#dondur">dondurma</a> geri alınabilir bir seçenektir.`, sinif: 'tehlike-kart', id: 'sil', govde: `${uyari('fa-triangle-exclamation', '<b>Uyarı: bu işlem geri alınamaz.</b> 30 gün sonunda planların, ölçümlerin, öğün kayıtların, belgelerin ve rozetlerin kalıcı olarak silinir.')}
${madde(['İlk 30 gün içinde giriş yaparsan silme iptal edilir ve hesabın geri gelir.', 'Kalan görüşme hakların silme talebiyle birlikte kapanır; kalan hak için iade talebini silmeden önce açabilirsin.', 'Faturaların yasal saklama süresi boyunca muhasebe kaydında kalır (silinemez), fakat profiline bağlı kalmaz.', `Silmeden önce <a href="#veri" data-sekme-git="veri">verilerinin bir kopyasını indirebilirsin</a>.`])}
<form class="onay-kapisi" id="silForm" novalidate>${secim({ ad: 'silNeden', etiket: 'Ayrılma nedenin', secenekler: ['Belirtmek istemiyorum', 'Siteyi kullanmıyorum', 'Başka bir uygulamaya geçtim', 'Çok fazla bildirim alıyorum', 'Gizlilik kaygısı', 'Ücretli paket bana uygun değil'] })}<label class="onay-kutusu" for="silOnay"><input type="checkbox" id="silOnay"><span>Hesabımın ve tüm takip verilerimin 30 gün sonunda geri alınamaz şekilde silineceğini, kalan görüşme haklarımın kapanacağını ve ücret iadesi yapılmayacağını anladım.</span></label>${alan({ ad: 'silIfade', etiket: 'Onaylamak için <b>HESABIMI SİL</b> yaz', zorunlu: true, ek: ' autocomplete="off"' })}<div class="onay-eylemler">${dugme('Hesabımı Kalıcı Olarak Sil', { sinif: 'tehlike', ikon: 'fa-trash-can', tur: 'submit', ek: ' id="silBtn" disabled' })}${durumSatir('fa-lock', 'Düğme kapalı: silme için onay kutusunu işaretle ve HESABIMI SİL ifadesini birebir yaz.', ' id="silDurum"')}</div></form>
${altNot('fa-circle-question', `Kararsızsan silmek yerine <a href="#bildirim" data-sekme-git="bildirim">bildirimleri kapatabilir</a>, <a href="#dondur">hesabını dondurabilir</a> ya da ${bag('bize yazabilirsin', 'hesabim/cozum-merkezi/#yeni')}.`)}` })}
</div>`;

const tfa = `<ol class="adim-serit" id="tfaSerit"><li class="acik">1 Yöntem</li><li>2 Doğrulama</li><li>3 Kurtarma</li></ol>
<div data-tfa-adim="1"><div class="yigin sik"><label class="secim-satir"><input class="secim-radyo" type="radio" name="tfaYontem" value="sms" checked><span><b>SMS ile kod</b> Kayıtlı telefonuna 6 haneli kod gönderilir.</span></label><label class="secim-satir"><input class="secim-radyo" type="radio" name="tfaYontem" value="uygulama"><span><b>Doğrulayıcı uygulama</b> Telefonundaki uygulama 30 saniyede bir yeni kod üretir; şebeke gerekmez.</span></label></div></div>
<div data-tfa-adim="2" hidden>${alan({ ad: 'tfaKod', etiket: 'Doğrulama kodu', zorunlu: true, yardim: 'Bu demoda gerçek bir kod gönderilmez; altı haneyi doldurman yeterli.', ek: ' inputmode="numeric" maxlength="6" autocomplete="one-time-code"' })}</div>
<div data-tfa-adim="3" hidden><div class="yigin sik"><p class="alan-yardim"><span>Bu kodları güvenli bir yere kaydet. Telefonuna erişemezsen hesabına yalnız bunlarla girebilirsin; her kod bir kez kullanılır.</span></p><div class="cipler" id="tfaKodlar"></div><label class="onay-kutusu"><input type="checkbox" id="tfaOnay"><span>Kurtarma kodlarımı güvenli bir yere kaydettim.</span></label></div></div>`;

const sonEk = ''
  + modal({ id: 'tfaModal', baslik: 'İki Adımlı Doğrulama', govde: tfa, ayak: dugme('Geri', { ek: ' id="tfaGeri" hidden' }) + dugme('Devam', { sinif: 'birincil', ek: ' id="tfaIleri"' }) })
  + modal({ id: 'kodModal', baslik: 'Kurtarma Kodların', govde: '<div class="cipler" id="kodListe"></div>', ayak: dugme('Kopyala', { ikon: 'fa-copy', ek: ' id="kodKopyala"' }) + dugme('Kapat', { sinif: 'birincil', ek: ' data-kapat' }) });

export default () => [uyeKabuk({
  yol: 'hesabim/ayarlar', baslik: 'Hesap Ayarlarım',
  aciklama: 'Profilin, bildirimlerin, güvenliğin, birim tercihlerin ve bağlı uygulamaların burada; hesabını dondurma ve silme de. Paketin ve kademelerin Paketlerim’de, tahsilat ve kartların Ödemelerim’de.',
  muhur: 'Hesabın · kişisel alanın', ikon: 'fa-sliders', duzenle: true,
  grup: 'hs',
  sekmeler: [
    { id: 'profil', ad: 'Profil', ikon: 'fa-id-card', govde: okumaBolum(profil) },
    { id: 'bildirim', ad: 'Bildirim Tercihleri', ikon: 'fa-bell', govde: okumaBolum(bildirim) },
    { id: 'guvenlik', ad: 'Güvenlik', ikon: 'fa-lock', govde: okumaBolum(guvenlik) },
    { id: 'dil', ad: 'Dil ve Bölge', ikon: 'fa-globe', govde: okumaBolum(dil) },
    { id: 'baglanti', ad: 'Bağlı Uygulamalar', ikon: 'fa-plug-circle-check', govde: duzBolum(baglanti) },
    { id: 'veri', ad: 'Veri ve Hesap Yönetimi', ikon: 'fa-database', govde: duzBolum(veri) },
    { id: 'dondurma', ad: 'Hesabı Dondurma / Silme', ikon: 'fa-circle-pause', govde: okumaBolum(dondurma) },
  ],
  sonEk,
  js: ['assets/js/sayfa/uye-gastro-ortak.js', 'assets/js/sayfa/uye-gastro-destek.js', 'assets/js/sayfa/uye-gastro-ayarlar.js'],
})];
