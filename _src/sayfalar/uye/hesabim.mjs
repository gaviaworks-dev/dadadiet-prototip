import { uyeSayfa, kart, ayarSatir, anahtar, alan, secim, dugme, modal } from '../../parcalar/uye/ust.mjs';

const kanallar = [
  ['takip', 'Günlük takip hatırlatması', 'Öğün girmediğin günlerde akşam hatırlatması.', 1, 1],
  ['su', 'Su hatırlatması', 'Günlük su hedefine ulaşmadığında hatırlatma.', 0, 1],
  ['revizyon', 'Program revizyonu', 'Diyetisyenin programını güncellediğinde.', 1, 1],
  ['diyetisyen', 'Diyetisyen mesajı ve randevu', 'Mesaj geldiğinde, randevu onaylandığında ya da yaklaştığında.', 1, 1],
  ['rapor', 'Haftalık rapor', 'Pazar akşamı: aktif gün, öğün düzeni, su ve ölçüm özeti.', 1, 0],
  ['icerik', 'Yeni tarif, program ve rehber', 'Sana uygun yeni içerik eklendiğinde.', 0, 1],
  ['kampanya', 'Kampanya ve Dada Diet Pro fırsatları', 'Paket indirimleri ve özel dönem seçkileri.', 0, 0],
  ['tahlil', 'Tahlil sonuçları', 'Yüklediğin tahlilin değerleri okunup onayını beklediğinde.', 1, 1],
  ['menu', 'Haftalık menü', 'Haftalık menün hazırlandığında.', 0, 1],
  ['rozet', 'Rozet ve meydan okuma', 'Rozet kazandığında ya da seri yakaladığında.', 0, 1],
  ['grup', 'Destek grupları', 'Destek grubundaki gönderine yorum yazıldığında.', 0, 1],
];
const kanalSatir = ([k, b, m, e, u]) => `<div class="kanal-satir"><div class="kanal-metin"><b>${b}</b><span>${m}</span></div><span class="kanal-hucre">${anahtar(k + '_eposta', b + ', e-posta', e)}</span><span class="kanal-hucre">${anahtar(k + '_uygulama', b + ', uygulama', u)}</span></div>`;

const hk = (o) => kart({ ...o, kolon: true });
const kaydet = (metin = 'Tercihleri Kaydet') => dugme(metin, { sinif: 'birincil', tur: 'submit' });

const profil = `<div class="yigin">
${hk({ ikon: 'fa-user-pen', baslik: 'Profilini tamamla', metin: 'Birkaç kısa soruyla programları, tarifleri ve diyetisyenleri sana göre sıralayalım.', sag: dugme('Devam et', { sinif: 'birincil', href: 'hesabim/hos-geldin/' }), govde: '<div class="olcer hap" role="img" aria-label="Profil tamamlanma oranı"><span id="profilOran" data-oran="0"></span></div>' })}
${hk({
    ikon: 'fa-id-card', baslik: 'Profil Bilgilerim', metin: 'Adın ve fotoğrafın diyetisyenine ve profilinde görünür.', form: ' id="profilForm"',
    govde: `<div class="alan-izgara c2">${alan({ ad: 'ad', etiket: 'Ad', zorunlu: true })}${alan({ ad: 'soyad', etiket: 'Soyad' })}</div>
${alan({ ad: 'kullanici', etiket: 'Kullanıcı adı', zorunlu: true, yardim: 'Hesabında @ ile başlayan bu adla görünürsün.' })}
<div class="alan-izgara c2">${alan({ ad: 'eposta', etiket: 'E-posta', tur: 'email', yardim: 'E-posta adresini değiştirmek için destek talebi aç.', ek: ' readonly' })}${alan({ ad: 'telefon', etiket: 'Telefon', tur: 'tel', istege: true })}</div>`,
    alt: kaydet('Değişiklikleri Kaydet'), sinif: '',
  })}
${hk({
    ikon: 'fa-eye', baslik: 'Profil Görünürlüğü', metin: 'Profilinde neyin, kime görüneceğini seç.', form: ' data-ayar-form="gorunurluk" data-mesaj="Görünürlük tercihlerin kaydedildi."', bosluksuz: true,
    govde: `<div class="ayar-liste">
${ayarSatir({ ikon: 'fa-globe', baslik: 'Profilim herkese açık', metin: 'Kapalıyken profilini yalnız sen ve diyetisyenin görür.', sag: anahtar('acik', 'Profilim herkese açık') })}
${ayarSatir({ ikon: 'fa-clipboard-list', baslik: 'Günlük takip geçmişimi kimler görebilir?', metin: 'Tamamladığın öğün kayıtları, program günleri ve ölçümlerin.', sag: '<select class="alan-secim" name="takip" aria-label="Günlük takip geçmişimi kimler görebilir"><option>Sadece ben</option><option>Takipçilerim</option><option>Herkes</option></select>' })}
${ayarSatir({ ikon: 'fa-award', baslik: 'Rozetlerim profilimde görünsün', metin: 'Kapatırsan rozetleri yalnız sen görürsün.', sag: anahtar('rozet', 'Rozetlerim profilimde görünsün', true) })}
${ayarSatir({ ikon: 'fa-ranking-star', baslik: 'Liderlik tablosunda adım görünsün', metin: 'Sıralamayı Rozetlerim sayfasının Liderlik sekmesinde görürsün.', sag: anahtar('liderlik', 'Liderlik tablosunda adım görünsün', true) })}
</div>`,
    alt: kaydet(),
  })}
</div>`;

const bildirim = `${hk({
  ikon: 'fa-bell', baslik: 'Bildirim Tercihlerim', metin: 'Hangi bildirimi hangi kanaldan alacağını seç.', form: ' data-ayar-form="bildirim"',
  govde: `<div class="kanal-matris"><div class="kanal-satir bas"><span>Bildirim</span><span>E-posta</span><span>Uygulama</span></div>${kanallar.map(kanalSatir).join('')}<div class="kanal-satir"><div class="kanal-metin"><b>Güvenlik uyarıları</b><span>Şifre değişikliği ve hesap işlemleri her zaman e-posta ile bildirilir.</span></div><span class="kanal-hucre"><span class="durum-hapi cozulen">Her zaman</span></span><span class="kanal-hucre"></span></div></div>
<div class="alan-izgara c2"><div class="alan"><label class="alan-etiket" for="hatirlatma">Hatırlatma saati</label><input class="alan-girdi" id="hatirlatma" name="hatirlatma" type="time" value="20:00"><p class="alan-yardim"><span>Günlük takip hatırlatmasının saati.</span></p></div>${secim({ ad: 'sessiz', etiket: 'Sessiz saatler', secenekler: ['22:00 – 07:00', '23:00 – 08:00', '00:00 – 06:00', 'Kapalı'], yardim: 'Bu aralıkta uygulama bildirimi gönderilmez.' })}</div>`,
  alt: kaydet(),
})}`;

const guvenlik = `<div class="yigin">
${hk({
    ikon: 'fa-key', baslik: 'Şifreni Değiştir', metin: 'Mevcut şifreni doğrulayıp yeni bir şifre belirle.', form: ' id="sifreForm"',
    govde: `${alan({ ad: 'sifre0', etiket: 'Mevcut şifren', tur: 'password', zorunlu: true, ek: ' autocomplete="current-password"' })}<div class="alan-izgara c2">${alan({ ad: 'sifre1', etiket: 'Yeni şifre', tur: 'password', zorunlu: true, ek: ' autocomplete="new-password" minlength="8"', yardim: 'En az 8 karakter. Başka sitede kullandığın şifreyi tekrar etme.' })}${alan({ ad: 'sifre2', etiket: 'Yeni şifre (tekrar)', tur: 'password', zorunlu: true, ek: ' autocomplete="new-password" minlength="8"' })}</div>`,
    alt: kaydet('Şifreyi Güncelle'),
  })}
${hk({
    ikon: 'fa-right-to-bracket', baslik: 'Giriş Yöntemleri', metin: 'Hesabına giriş yollarını yönet.', bosluksuz: true,
    govde: `<div class="ayar-liste">${ayarSatir({ ikon: 'fa-envelope', baslik: 'E-posta ile giriş', metin: 'Birincil giriş yöntemin.', sag: '<span class="as-eylem"><span class="durum-hapi cozulen">Aktif</span></span>' })}${ayarSatir({ ikon: 'fa-link', baslik: 'Google hesabı', metin: 'Bağlarsan Google ile tek dokunuşla girersin.', sag: `<span class="as-eylem">${dugme('Bağla', { sinif: 'hayalet kucuk', ek: ' data-bagla="Google"' })}</span>` })}${ayarSatir({ ikon: 'fa-link', baslik: 'Facebook hesabı', metin: 'Bağlarsan Facebook ile tek dokunuşla girersin.', sag: `<span class="as-eylem">${dugme('Bağla', { sinif: 'hayalet kucuk', ek: ' data-bagla="Facebook"' })}</span>` })}</div>`,
  })}
${hk({
    ikon: 'fa-laptop', baslik: 'Açık Oturumlarım', metin: 'Tanımadığın bir cihaz varsa oturumu kapat ve şifreni değiştir.', bosluksuz: true,
    govde: `<div class="ayar-liste" id="oturumlar"></div>`,
    alt: dugme('Diğer Tüm Oturumları Kapat', { sinif: 'hayalet', ikon: 'fa-right-from-bracket', ek: ' id="oturumKapat"' }),
  })}
</div>`;

const dil = `${hk({
  ikon: 'fa-globe', baslik: 'Dil ve Bölge', metin: 'Birim tercihin öğün kayıtlarında, ölçümlerinde ve grafiklerde geçerli olur.', form: ' data-ayar-form="bolge"',
  govde: `<div class="alan-izgara c2">
${secim({ ad: 'dil', etiket: 'Arayüz dili', secenekler: ['Türkçe', 'English'] })}${secim({ ad: 'bolge', etiket: 'Bölge', secenekler: ['Türkiye', 'Almanya', 'Birleşik Krallık', 'Amerika Birleşik Devletleri'] })}
${secim({ ad: 'saat', etiket: 'Saat dilimi', secenekler: ['(GMT+03:00) İstanbul', '(GMT+01:00) Berlin', '(GMT+00:00) Londra'] })}${secim({ ad: 'hafta', etiket: 'Haftanın ilk günü', secenekler: ['Pazartesi', 'Pazar'] })}
${secim({ ad: 'agirlik', etiket: 'Ağırlık birimi', secenekler: ['Kilogram (kg)', 'Pound (lb)'] })}${secim({ ad: 'mesafe', etiket: 'Mesafe birimi', secenekler: ['Kilometre (km)', 'Mil (mi)'] })}
${secim({ ad: 'boy', etiket: 'Boy birimi', secenekler: ['Santimetre (cm)', 'İnç (inç)'] })}${secim({ ad: 'enerji', etiket: 'Enerji birimi', secenekler: ['Kilokalori (kcal)', 'Kilojul (kJ)'] })}
${secim({ ad: 'tarih', etiket: 'Tarih biçimi', secenekler: ['14.03.2026 (gg.aa.yyyy)', '2026-03-14 (yyyy-aa-gg)'] })}
</div><div class="ayar-liste">${ayarSatir({ baslik: 'Enerji değerlerini gizle', metin: 'Açıkken sayısal enerji yerine öğün düzeni, aktif gün ve çeşitlilik gösterilir.', sag: anahtar('enerjiGizle', 'Enerji değerlerini gizle') })}</div>`,
  alt: kaydet(),
})}`;

const veri = `<div class="yigin">
${hk({
    ikon: 'fa-database', baslik: 'Verini gör, indir, sil', metin: 'Dada Diet’te tutulan verinin tamamı. Paylaşım izinlerin Veri İzinlerim’de yönetilir.', sag: dugme('Veri İzinlerim', { sinif: 'hayalet kucuk', href: 'hesabim/veri-izinlerim/' }), bosluksuz: true,
    govde: `<div class="ayar-liste">
${ayarSatir({ ikon: 'fa-list', baslik: 'Hangi verilerim tutuluyor?', metin: 'Hesap bilgilerin, planların, öğün ve su kayıtların, ölçümlerin, belgelerin, izin geçmişin ve destek yazışmaların.', sag: `<span class="as-eylem">${dugme('Listele', { sinif: 'hayalet kucuk', ek: ' data-ac="#veriListe"' })}</span>` })}
${ayarSatir({ ikon: 'fa-download', baslik: 'Verilerimi indir', metin: 'Makine okunur tek arşiv: hesap, plan, günlük, destek, sağlık.', sag: `<span class="as-eylem">${dugme('Arşiv oluştur', { sinif: 'hayalet kucuk', ek: ' id="arsivOlustur"' })}</span>` })}
${ayarSatir({ ikon: 'fa-eraser', baslik: 'Belirli verilerimin silinmesini iste', metin: 'Hesabını kapatmadan tek bir veri türünü sildirmek için talep aç.', sag: `<span class="as-eylem">${dugme('Destek talebi aç', { sinif: 'hayalet kucuk', href: 'sayfa/cozum-merkezi/' })}</span>` })}
</div>`,
  })}
${hk({
    ikon: 'fa-shield-halved', baslik: 'Saklama ve erişim', metin: 'Verinin ne kadar süre tutulduğu ve kimin eriştiği.',
    govde: `<div class="okuma"><p>Öğün ve takip kayıtların hesabın açık kaldığı sürece tutulur. Sağlık belgelerin yalnız sende durur; diyetisyenin ancak <b>Veri İzinlerim</b> üzerinden açtığın izinle görür. Verilerine yapılan her erişim kaydedilir. Ödeme ve fatura kayıtları yasal saklama süresi boyunca tutulur.</p></div>`,
  })}
</div>`;

const dondurma = `<div class="yigin">
${hk({
    ikon: 'fa-snowflake', baslik: 'Hesabı Dondurma', metin: 'Bir süre ara vermek istersen hesabını kapatmadan dondurabilirsin.', form: ' id="dondurForm"',
    govde: `<div class="uyari-kutu"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><div><b>Dondurma süresince</b> profilin ve diyetisyen paylaşımın gizlenir, randevuların iptal edilir. Verilerin silinmez; seçtiğin süre dolunca hesabın sonraki girişinde açılır.</div></div>
${secim({ ad: 'sure', etiket: 'Dondurma süresi', secenekler: ['1 hafta', '2 hafta', '1 ay', '3 ay', 'Ben tekrar giriş yapana kadar'] })}
<label class="onay-kutusu"><input type="checkbox" id="dondurOnay"><span>Profilimin gizleneceğini, randevularımın iptal edileceğini ve Pro tahsilatının kendiliğinden durmayacağını anladım.</span></label>`,
    alt: dugme('Hesabı Dondur', { sinif: 'uyari', ikon: 'fa-snowflake', tur: 'submit', ek: ' id="dondurDugme" disabled' }) + '<span class="not">Dondurmak için önce onay kutusunu işaretle.</span>',
  })}
${hk({
    ikon: 'fa-user-xmark', baslik: 'Hesabımı Sil', metin: 'Kalıcı silme talebi oluşturur. Ara vermek istiyorsan dondurma geri alınabilir.', sinif: 'tehlike-kart', form: ' id="silForm"',
    govde: `${secim({ ad: 'neden', etiket: 'Ayrılma nedenin', secenekler: ['Belirtmek istemiyorum', 'Artık kullanmıyorum', 'Başka bir platforma geçtim', 'Çok fazla bildirim alıyorum', 'Gizlilik kaygım var', 'Ücretli paket bana uygun değil'] })}
<label class="onay-kutusu"><input type="checkbox" id="silOnay"><span>Bu işlemin geri alınamaz olduğunu ve aktif üyeliğimin gözden geçirileceğini anladım.</span></label>
${alan({ ad: 'silMetin', etiket: 'Onaylamak için HESABIMI SİL yaz', zorunlu: true, ek: ' autocomplete="off"' })}`,
    alt: dugme('Silme Talebi Oluştur', { sinif: 'tehlike', ikon: 'fa-trash-can', tur: 'submit', ek: ' id="silDugme" disabled' }) + '<span class="not">Onay kutusunu işaretle ve ifadeyi birebir yaz.</span>',
  })}
</div>`;

const kapakSecenekleri = ['beslenme-reh-hero.jpg', 'css-8.jpg', 'css-nasil-calisir-1.jpg', 'diet-hero-poster.jpg'];
const sonEk = modal({
  id: 'kapakSec', baslik: 'Kapak görselini seç',
  govde: `<div class="secenek-izgara" data-tek-secim>${kapakSecenekleri.map((k, i) => `<button class="secenek" type="button" data-kapak-sec="assets/img/hero/${k}" aria-pressed="${i === 0}"><i class="fa-solid fa-image" aria-hidden="true"></i><span>Kapak ${i + 1}</span></button>`).join('')}</div>`,
  ayak: dugme('Vazgeç', { sinif: 'hayalet', ek: ' data-kapat' }) + dugme('Kapağı Kullan', { sinif: 'birincil', ek: ' id="kapakUygula"' }),
}) + modal({
  id: 'avatarSec', baslik: 'Profil fotoğrafı',
  govde: `<div class="okuma"><p>JPG, PNG veya WebP, en çok 5 MB. Fotoğrafın yalnız bu tarayıcıda görünür.</p></div><div class="alan"><label class="alan-etiket" for="avatarDosya">Dosya seç</label><input class="alan-girdi" id="avatarDosya" type="file" accept="image/*"></div>`,
  ayak: dugme('Harfi Kullan', { sinif: 'hayalet', ek: ' id="avatarSil"' }) + dugme('Vazgeç', { sinif: 'birincil', ek: ' data-kapat' }),
}) + modal({
  id: 'veriListe', baslik: 'Tutulan veriler',
  govde: `<div class="ayar-liste" id="veriListeGovde"></div>`,
  ayak: dugme('Kapat', { sinif: 'birincil', ek: ' data-kapat' }),
});

export default () => [uyeSayfa({
  yol: 'hesabim', ad: 'Hesap Ayarları', muhur: 'Hesabın · kişisel alanın', ikon: 'fa-sliders', kok: true, duzenle: true,
  giris: 'Profilin, bildirimlerin, güvenliğin ve birim tercihlerin burada; hesabını dondurma ve silme de.',
  grup: 'ha',
  sekmeler: [
    { id: 'profil', ad: 'Profil', ikon: 'fa-user', govde: profil },
    { id: 'bildirim', ad: 'Bildirim Tercihleri', ikon: 'fa-bell', govde: bildirim },
    { id: 'guvenlik', ad: 'Güvenlik', ikon: 'fa-shield-halved', govde: guvenlik },
    { id: 'dil', ad: 'Dil ve Bölge', ikon: 'fa-globe', govde: dil },
    { id: 'veri', ad: 'Veri ve Hesap Yönetimi', ikon: 'fa-database', govde: veri },
    { id: 'dondurma', ad: 'Hesabı Dondurma / Silme', ikon: 'fa-user-xmark', govde: dondurma },
  ],
  sonEk, js: ['assets/js/sayfa/uye-hesabim.js'],
})];
