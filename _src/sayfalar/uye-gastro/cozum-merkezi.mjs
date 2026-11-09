import { uyeKabuk } from '../../parcalar/uye/kabuk.mjs';
import { kart, alan, dugme } from '../../parcalar/uye/ust.mjs';
import { ikon, bag, okumaBolum } from './_ortak.mjs';

const K = '{{kok}}';
const filtreler = [['tumu', 'fa-layer-group', 'Tümü'], ['acik', 'fa-inbox', 'Açık talep'], ['yanit', 'fa-reply', 'Yanıt bekleyen'], ['cozulen', 'fa-circle-check', 'Çözülen'], ['kapali', 'fa-lock', 'Kapatılan']];

const taleplerim = `<div class="yigin">
<div class="sekme-ray"><div class="sekmeler suzgec" role="group" aria-label="Talep durumu" id="tkFiltre">${filtreler.map(([k, i, a], n) => `<button class="sekme${n ? '' : ' aktif'}" type="button" data-durum="${k}">${ikon(i)} ${a} <span class="sekme-sayi" data-tk-say="${k}"></span></button>`).join('')}</div></div>
${kart({ ikon: 'fa-bolt', baslik: 'Akışta Kalan Talepler', metin: 'Açık ve yanıt bekleyen taleplerin. Bu kart sayfalanmaz.', bosluksuz: true, id: 'tkOzet', govde: '<div class="ayar-liste" id="tkAkis"></div>' })}
${kart({ ikon: 'fa-inbox', baslik: 'Destek Taleplerim', metin: '<span id="tkSay"></span>', bosluksuz: true, govde: '<div class="ayar-liste" id="tkListe"></div><div id="tkBos" hidden></div>', alt: '<nav class="sayfalama" id="tkSayfa" aria-label="Sayfalar"></nav><p class="sayfalama-not" id="tkSayfaNot"></p>' })}
</div>`;

const konular = ['Hesap sorunu', 'Günlük takip', 'Program sorunu', 'Diyetisyen ve randevu', 'Mesajlaşma sorunu', 'Pro abonelik', 'Ödeme sorunu', 'Fatura talebi', 'İptal ve iade', 'Veri ve gizlilik', 'Teknik sorun', 'Sağlık içeriği bildirimi'];
const hizliCozum = [
  ['konu-uyelik', 'fa-crown', 'Üyelik, Dada Diet Pro ve ödeme', `Kademeni ve yenileme tarihini ${bag('Paketlerim', 'hesabim/paketlerim/')} ekranından görürsün; geçmiş tahsilatlar ${bag('Ödemelerim', 'hesabim/odemelerim/')} sayfasında tarih ve tutarla listelenir. Kademelerin neyi açtığını karşılaştırmak istersen ${bag('Dada Diet Pro', 'pro/')} sayfasına bakabilirsin.`, 'Paket ödemen geçtiği hâlde görüşme hakkın görünmüyorsa çıkış yapıp tekrar gir. Sorun sürüyorsa talebi <b>Ödeme sorunu</b> konusuyla aç, fatura numarasını yaz.'],
  ['konu-takip', 'fa-utensils', 'Günlük takip ve öğün kayıtları', `Öğün, su ve adım kayıtların ${bag('Günlük Takibim', 'hesabim/gunluk-takibim/')} ekranında durur; planın ${bag('Beslenme Planım', 'hesabim/beslenme-planim/')} sayfasından gelir.`, 'Bir kayıt görünmüyorsa önce günün doğru seçildiğine bak. Kayıt yine görünmüyorsa talebi <b>Günlük takip</b> konusuyla aç, tarihi yaz.'],
  ['konu-randevu', 'fa-calendar-check', 'Diyetisyen ve randevu', `Randevularını ve görüşme haklarını ${bag('Diyetisyenim', 'hesabim/diyetisyenim/#randevu')} ekranından yönetirsin. Saat değişikliği ya da iptal talebi diyetisyen onayına düşer.`, 'Randevun takvimde görünmüyorsa ya da hak düşmediyse talebi <b>Diyetisyen ve randevu</b> konusuyla aç.'],
  ['konu-hesap', 'fa-user', 'Hesap, giriş ve bildirimler', `Ad, e-posta ve şifre ${bag('Hesap Ayarları', 'hesabim/ayarlar/')}’da; hangi bildirimi hangi kanaldan alacağın ${bag('Bildirim Tercihleri', 'hesabim/ayarlar/#bildirim')} sekmesinde seçilir. Şifreni hatırlamıyorsan ${bag('sıfırlama sayfasını', 'sifremi-unuttum/')} kullan.`, 'Bildirim tercihlerin her girişte eski hâline dönüyorsa tarayıcının site verilerini temizlemesi sebep olabilir. Sorun sürerse talebi <b>Hesap sorunu</b> konusuyla aç.'],
  ['konu-veri', 'fa-shield-halved', 'Sağlık verisi ve izinler', `Diyetisyeninin hangi veriyi gördüğünü ${bag('Veri İzinlerim', 'hesabim/veri-izinlerim/')} ekranından yönetirsin. Kişisel verilerinin nasıl işlendiği ${bag('KVKK Aydınlatma Metni', 'yasal/kvkk/')}’nde yazılı.`, 'Verine izinsiz erişildiğini düşünüyorsan talebi <b>Veri ve gizlilik</b> konusuyla aç.'],
];
const akordeon = (l, onEk) => `<div class="akordeon">${l.map(([id, i, b, ...g], n) => `<div class="akordeon-kalem${n ? '' : ' acik'}" id="${id}"><button class="akordeon-bas" type="button" aria-expanded="${!n}"><span class="akordeon-ikon">${ikon(i)}</span> ${b} <i class="fa-solid fa-chevron-down akordeon-ok" aria-hidden="true"></i></button><div class="akordeon-govde"><div class="okuma">${g.map((x) => `<p>${x}</p>`).join('')}</div></div></div>`).join('')}</div>`;

const yeni = `<div class="yigin">
${kart({ ikon: 'fa-pen', baslik: 'Yeni Destek Talebi', metin: 'Yıldız (*) ile işaretli alanlar zorunludur. Gönderdiğinde satır <b>Destek Taleplerim</b> sekmesinin en üstüne, <b>Açık talep</b> durumuyla düşer.', form: ' id="tkForm" novalidate', govde: `
<div class="alan"><label class="alan-etiket" for="tkKonu">Talebin konusu <span class="zorunlu">*</span></label><select class="alan-secim" id="tkKonu"><option value="">Konu seç</option>${konular.map((k) => `<option>${k}</option>`).join('')}</select><p class="alan-yardim"><span>Konu seçimi talebi yönlendirir; yanlış seçersen destek ekibi taşır. Bazı konular aşağıda ek bir alan açar.</span></p><span class="alan-hata" id="tkKonuHata">${ikon('fa-circle-exclamation')} Bir konu seç.</span></div>
<div class="alan"><label class="alan-etiket" for="tkBaslik">Başlık <span class="zorunlu">*</span></label><input class="alan-girdi" id="tkBaslik" maxlength="120"><span class="alan-hata" id="tkBaslikHata">${ikon('fa-circle-exclamation')} En az 3 karakter yaz.</span></div>
<div class="alan"><label class="alan-etiket" for="tkMesaj">Talebin <span class="zorunlu">*</span> <span class="alan-sayac" id="tkMesajSay">0/5000</span></label><textarea class="alan-metin uzun" id="tkMesaj" rows="5" maxlength="5000"></textarea><p class="alan-yardim"><span>Hangi ekranı, hangi tarihi ve hangi cihazı kullandığını yazarsan talep daha hızlı çözülür.</span></p><span class="alan-hata" id="tkMesajHata">${ikon('fa-circle-exclamation')} En az 10 karakter yaz.</span></div>
<div class="alan-izgara c2" id="tkBaglam" hidden><div class="alan" id="tkRandevuAlan" hidden><label class="alan-etiket" for="tkRandevu">İlgili randevu <span class="istege-bagli">(isteğe bağlı)</span></label><select class="alan-secim" id="tkRandevu"></select></div><div class="alan" id="tkOdemeAlan" hidden><label class="alan-etiket" for="tkOdeme">İlgili ödeme referansı <span class="istege-bagli">(isteğe bağlı)</span></label><select class="alan-secim" id="tkOdeme"></select></div></div>
<div class="alan"><label class="alan-etiket" for="tkEk">Ek dosya <span class="istege-bagli">(isteğe bağlı)</span></label><div class="alan-dosya"><label class="alan-dosya-dugme" for="tkEk">${ikon('fa-paperclip')} Dosya seç</label><input class="yalniz-okuyucu" id="tkEk" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"><span class="alan-dosya-ad" id="tkEkAd">Dosya seçilmedi</span><button class="alan-dosya-sil" id="tkEkSil" type="button" hidden>Kaldır</button></div><p class="alan-yardim"><span>Ekran görüntüsü ya da belge: JPG, PNG, WebP veya PDF · en çok 5 MB · mesaj başına tek dosya.</span></p></div>
<div class="alan-gonder"><span class="not">Talebini gönderdikten sonra yazışmayı talebin detay sayfasından sürdürebilir, çözüldüyse talebi kapatabilirsin.</span>${dugme('Talebi Gönder', { sinif: 'birincil', ikon: 'fa-paper-plane', tur: 'submit' })}</div>` })}
<p class="okuma-notu"><b>Konuya göre hızlı çözümler</b>: bir konuya dokun, adımlar açılsın. Her konu, sorun sürerse formu hangi konuyla dolduracağını da söylüyor.</p>
${akordeon(hizliCozum)}
<aside class="ipucu-kap"><div class="kart ipucu"><h2 class="ipucu-bas">${ikon('fa-lightbulb')} Yanıt Buralarda da Olabilir</h2><p class="ipucu-metin">Aynı konuda açık bir talebin varsa yenisini açma; yazışmayı oradan sürdür. Destek ekibi hafta içi 09.00–18.00 arasında bakıyor.</p><div class="ipucu-baglantilar"><a class="ipucu-baglanti" href="#sss" data-sekme-git="sss">${ikon('fa-circle-question')} Sık Sorulan Sorular ${ikon('fa-arrow-right')}</a><a class="ipucu-baglanti" href="${K}hesabim/odemelerim/#faturalar">${ikon('fa-receipt')} Ödeme ve fatura kayıtların ${ikon('fa-arrow-right')}</a><a class="ipucu-baglanti" href="${K}sayfa/iletisim/">${ikon('fa-envelope')} İletişim kanalları ${ikon('fa-arrow-right')}</a></div></div></aside>
<div class="bilgi-notu">${ikon('fa-circle-info')}<p>Destek ekibi uygulamayla ilgili konularda yardımcı olur; <b>tıbbi teşhis, beslenme tedavisi ya da diyet önerisi vermez.</b> Alerji, gıda intoleransı, gebelik ya da süregelen bir sağlık durumuyla ilgili sorularını diyetisyenine ya da hekimine ilet.</p></div>
</div>`;

const sss = [
  ['fa-user', 'Üyelik & Hesap', [
    ['fa-user', 'Dada Diet’e üye olmak ücretli mi?', `Hayır, üyelik ücretsiz. Besin kütüphanesi, hesaplayıcılar, testler, temel programlar ve günlük takibi ücretsiz kullanırsın. Yalnız ${bag('Dada Diet Pro', 'pro/')} kademeleri ve diyetisyen görüşmeleri ücretlidir.`],
    ['fa-key', 'Şifremi unuttum, ne yapmalıyım?', `${bag('Şifremi Unuttum', 'sifremi-unuttum/')} sayfasında kayıtlı e-posta adresini gir. Sıfırlama bağlantısı birkaç dakika içinde gelir; gelmezse spam klasörünü kontrol et. Giriş yaptıktan sonra şifreni ${bag('Hesap Ayarları › Güvenlik', 'hesabim/ayarlar/#guvenlik')} sekmesinden de değiştirebilirsin.`],
    ['fa-id-card', 'Profil bilgilerimi nasıl değiştiririm?', `${bag('Hesap Ayarları', 'hesabim/ayarlar/')} sayfasından ad, kullanıcı adı, telefon ve fotoğrafını güncelleyebilirsin.`],
    ['fa-user-slash', 'Hesabımı nasıl silebilirim, verilerime ne olur?', `${bag('Hesabı Dondurma / Silme', 'hesabim/ayarlar/#dondurma')} sekmesinden silme talebi açarsın. 30 gün içinde giriş yaparsan silme iptal edilir; süre dolunca planların, ölçümlerin ve kayıtların kalıcı olarak silinir.`],
    ['fa-circle-pause', 'Hesabımı silmeden ara verebilir miyim?', 'Evet. Hesabını bir hafta ile üç ay arasında dondurabilirsin; verilerin silinmez, giriş yaptığında hesabın kendiliğinden açılır.'],
    ['fa-envelope', 'E-posta adresimi nasıl değiştiririm?', 'Hesap Ayarları › Profil sekmesinden yeni adresini yaz. Yeni adrese doğrulama bağlantısı gönderilir; onaylayana kadar eski adres geçerli kalır.'],
    ['fa-shield-halved', 'İki adımlı doğrulamayı nasıl açarım?', `${bag('Güvenlik', 'hesabim/ayarlar/#guvenlik')} sekmesinde kurulumu aç. Yöntem seç, kodu doğrula, kurtarma kodlarını güvenli bir yere kaydet.`],
    ['fa-bell', 'Hatırlatmaları nasıl kapatırım?', `${bag('Bildirim Tercihleri', 'hesabim/ayarlar/#bildirim')} sekmesinden her bildirimi kanal kanal kapatabilirsin. Güvenlik uyarıları kapatılamaz.`],
    ['fa-medal', 'Rozet ve kademe sistemi nasıl çalışır?', `Takip, program ve ölçüm adımlarında puan toplarsın; rozetlerini ${bag('Rozetlerim', 'hesabim/rozetlerim/')} sayfasında görürsün. Rozetler tıbbi bir başarı ölçüsü değildir.`],
    ['fa-eye', 'Profilimi kimler görebilir?', `Görünürlüğü ${bag('Profil', 'hesabim/ayarlar/#profil')} sekmesinden seçersin. Sağlık verilerin profilinde gösterilmez.`],
    ['fa-child', '18 yaşından küçükler üye olabilir mi?', '18 yaş altı üyelerde veli onayı istenir; kalori hedefi ve diyetisyen görüşmesi veli onayına bağlıdır.'],
  ]],
  ['fa-utensils', 'Beslenme & Program', [
    ['fa-clipboard-list', 'Beslenme planım nereden geliyor?', `Planını diyetisyenin hazırlar ya da bir program başlatırsın. Öğünlerin ${bag('Beslenme Planım', 'hesabim/beslenme-planim/')} sayfasına düşer.`],
    ['fa-list-check', 'Bir programı nasıl başlatırım?', `${bag('Programlar', 'programlar/')} sayfasından birini seçip başlatırsın. Başlattığın program günlük öğünlerine ve haftalık menüne bağlanır.`],
    ['fa-repeat', 'Öğünümü değiştirebilir miyim?', 'Evet. Günlük öğünlerinde alternatifleri görürsün; diyetisyen planında kahvaltıları kendi arasında değiştirmek gibi kararları diyetisyeninle konuş.'],
    ['fa-fire', 'Günlük kalori hedefim nasıl belirleniyor?', `Hedefin, boyun, kilon ve hareket düzeninden hesaplanır; diyetisyenin varsa onun belirlediği hedef geçerlidir. Bu değer genel bilgi amaçlıdır, tıbbi öneri değildir.`],
    ['fa-droplet', 'Su ve adım takibi nasıl çalışır?', `${bag('Günlük Takibim', 'hesabim/gunluk-takibim/')} ekranından elle girersin ya da Bağlı Uygulamalar’dan cihazını bağlarsın.`],
  ]],
  ['fa-calculator', 'Araçlar & Sağlık Dosyası', [
    ['fa-calculator', 'Hesaplayıcı sonuçlarım kaydediliyor mu?', `Giriş yaptıysan sonuçların ${bag('Sağlık Dosyam', 'hesabim/saglik-dosyam/')} sayfasındaki hesaplama geçmişine düşer.`],
    ['fa-weight-scale', 'Ölçümlerimi nereye girerim?', 'Kilo, bel ve yağ oranını Sağlık Dosyam’dan elle girersin ya da akıllı tartını bağlarsın.'],
    ['fa-file-medical', 'Tahlil sonuçlarımı yükleyebilir miyim?', 'Evet. Belgeler sekmesinden yüklersin; okunan değerleri onaylamadan kayda geçmez. Sonuçların yorumu için hekimine ya da diyetisyenine başvur.'],
    ['fa-carrot', 'Besin değerleri nereden geliyor?', `Değerler güncel beslenme kaynaklarına dayanır; kaynaklar ${bag('Bilimsel Kaynaklar', 'sayfa/bilimsel-kaynaklar/')} sayfasında yazılı.`],
  ]],
  ['fa-user-doctor', 'Diyetisyen & Randevu', [
    ['fa-user-doctor', 'Diyetisyenimi nasıl seçerim?', `${bag('Diyetisyen Dizini', 'diyetisyenler/')} sayfasından uzmanlık, şehir ve görüşme biçimine göre süzersin. Diploma ve belgeler doğrulanır.`],
    ['fa-box-open', 'Görüşme paketi nasıl alınır?', 'Diyetisyen profilinden paketi seçersin, ödeme adımında kayıtlı kartını onaylarsın. Görüşme hakların Diyetisyenim sayfasında görünür.'],
    ['fa-calendar-xmark', 'Randevumu erteleyebilir ya da iptal edebilir miyim?', `Evet, ${bag('Randevularım', 'hesabim/diyetisyenim/#randevu')} sekmesinden talep açarsın. Talep diyetisyen onayına düşer; görüşmeye yakın iptallerde hak düşebilir.`],
    ['fa-user-shield', 'Diyetisyenim verilerimi görüyor mu?', `Yalnız izin verdiğin veriyi görür. İzinleri ${bag('Veri İzinlerim', 'hesabim/veri-izinlerim/')} ekranından istediğin an kapatırsın.`],
  ]],
  ['fa-crown', 'Pro & Ödeme', [
    ['fa-layer-group', 'Tek üyelikle her şey mi açılıyor?', `Dada Diet Pro site geneli tek üyeliktir; Pro Max buna diyetisyen görüşme hakkını ekler. Ücretsiz ve Pro’da diyetisyen görüşmesinin ücreti üyeliğe dâhil değildir. Kademeleri ${bag('Paket Karşılaştırma', 'hesabim/paketlerim/#karsilastir')} sekmesinde yan yana görürsün.`],
    ['fa-credit-card', 'Kart bilgilerim güvende mi?', 'Pro planları için bugün ödeme alınmıyor. Tam kart numarası Dada Diet’te tutulmaz; yalnız marka, son dört hane ve son kullanma tarihi görünür.'],
    ['fa-ban', 'Pro üyeliğimi istediğim zaman iptal edebilir miyim?', 'Pro planları henüz satışa açılmadı; bugün iptal edilecek bir Pro aboneliği yok. Üyelik ve iptal koşulları Kullanım Koşulları’nda yazar.'],
  ]],
  ['fa-shield-halved', 'Topluluk, Veri & Diğer', [
    ['fa-people-group', 'Destek grupları nedir?', `${bag('Destek Grupları', 'hesabim/destek-gruplari/')} benzer hedefteki üyelerin paylaşım alanıdır. Gruplarda sağlık verin paylaşılmaz; yalnız yazdıkların görünür.`],
    ['fa-database', 'Verilerimi nasıl indiririm?', `${bag('Veri ve Hesap Yönetimi', 'hesabim/ayarlar/#veri')} sekmesinden indirme paketi hazırlatırsın; bağlantı e-postana gelir.`],
    ['fa-triangle-exclamation', 'Yanlış bir bilgi gördüm, nasıl bildiririm?', 'Yeni Destek Talebi sekmesinde <b>Sağlık içeriği bildirimi</b> konusunu seç, sayfanın adresini yaz.'],
    ['fa-stethoscope', 'Dada Diet tıbbi tavsiye verir mi?', 'Hayır. Araçlar ve içerikler genel bilgi amaçlıdır; tanı ve tedavi için hekimine başvur.'],
  ]],
];
const sssKalem = ([i, s, c], n) => `<div class="akordeon-kalem" data-soru><button class="akordeon-bas" type="button" aria-expanded="false"><span class="akordeon-ikon">${ikon(i)}</span> ${s} <i class="fa-solid fa-chevron-down akordeon-ok" aria-hidden="true"></i></button><div class="akordeon-govde"><div class="okuma"><p>${c}</p></div></div></div>`;
const sssPano = `<div class="yigin">
<form class="arama faq-search" id="sssArama" role="search">${ikon('fa-magnifying-glass')}<input id="faqAra" type="search" placeholder="Soru ara: örn. randevu, plan, Pro…" aria-label="Soru ara" autocomplete="off"><button class="sx" type="button" id="faqTemizle" aria-label="Aramayı temizle" hidden>${ikon('fa-xmark')}</button></form>
<div class="sekme-ray"><div class="sekmeler suzgec" role="group" aria-label="Soru konuları" id="faqSekme">${sss.map(([i, a, l], n) => `<button class="sekme${n ? '' : ' aktif'}" type="button" data-kat="${n}">${ikon(i)} ${a} <span class="sekme-sayi">${l.length}</span></button>`).join('')}</div></div>
<p class="okuma-notu" id="faqNot" role="status"></p>
${sss.map(([, a, l], n) => `<div class="akordeon" data-kat-liste="${n}" data-ad="${a}"${n ? ' hidden' : ''}>${l.map(sssKalem).join('')}</div>`).join('')}
<div id="faqBos" hidden></div>
<div class="kapanis"><span class="kapanis-ikon">${ikon('fa-headset')}</span><h3>Cevap Bulamadın mı?</h3><p>Ekibimiz hafta içi 09.00–18.00 arasında yanında. Soru, öneri ya da sorun: hangisi olursa olsun bize yaz.</p><div class="cc-btns"><a class="dugme birincil" href="${K}sayfa/iletisim/">${ikon('fa-envelope')} İletişime Geç</a><a class="dugme hayalet" href="#oneri" data-sekme-git="oneri">${ikon('fa-comment-dots')} Görüş Bildir</a></div></div>
</div>`;

const oneri = `<div class="yigin">
${kart({ ikon: 'fa-comment-dots', baslik: 'Öneri ve Şikâyet', metin: 'Yıldız (*) ile işaretli alanlar zorunludur. Cevabımız e-posta adresine gelir.', form: ' id="conForm" novalidate', govde: `
<div class="alan-izgara c2">${alan({ ad: 'conAd', etiket: 'Ad', zorunlu: true })}${alan({ ad: 'conSoyad', etiket: 'Soyad', zorunlu: true })}</div>
<div class="alan-izgara c2">${alan({ ad: 'conEposta', etiket: 'E-posta', tur: 'email', zorunlu: true })}${alan({ ad: 'conTel', etiket: 'Telefon', tur: 'tel', istege: true })}</div>
<div class="alan-izgara c2"><div class="alan"><label class="alan-etiket" for="conTur">Türü <span class="zorunlu">*</span></label><select class="alan-secim" id="conTur"><option value="">Seç</option><option>Öneri</option><option>Şikâyet</option></select></div><div class="alan"><label class="alan-etiket" for="conAlan">İlgili alan <span class="zorunlu">*</span></label><select class="alan-secim" id="conAlan"><option value="">Seç</option>${['Besinler', 'Programlar', 'Hesaplayıcılar', 'Diyetisyenler', 'Beslenme Planım', 'Diğer'].map((o) => `<option>${o}</option>`).join('')}</select><p class="alan-yardim"><span>Alan seçimi mesajı ilgili ekibe yönlendirir.</span></p></div></div>
<div class="alan"><label class="alan-etiket" for="conMesaj">Mesajın <span class="zorunlu">*</span> <span class="alan-sayac" id="conSay">0/1000</span></label><textarea class="alan-metin uzun" id="conMesaj" rows="5" maxlength="1000"></textarea><span class="alan-hata" id="conMesajHata">${ikon('fa-circle-exclamation')} En az 10 karakter yaz.</span></div>
<label class="onay-kutusu" for="conKvkk"><input type="checkbox" id="conKvkk"><span>${bag('KVKK Metni', 'yasal/kvkk/')}’ni ve ${bag('Aydınlatma Metni', 'yasal/kvkk/')}’ni okudum, onaylıyorum.</span></label>
<div class="alan-gonder"><span class="not">Mesajlara genellikle <b>1 iş günü</b> içinde dönüyoruz.</span>${dugme('Gönder', { sinif: 'birincil', ikon: 'fa-paper-plane', tur: 'submit' })}</div>` })}
<p class="durum-satir" id="conSonuc" role="status" hidden>${ikon('fa-circle-check')} <span></span></p>
<div class="yonlendirme"><a class="yonlendirme-kalem" href="${K}sayfa/iletisim/"><i class="yonlendirme-ikon fa-solid fa-envelope-open-text" aria-hidden="true"></i><span class="yonlendirme-metin"><b>Genel iletişim konuları ${ikon('fa-arrow-right')}</b> Basın, iş birliği ve reklam, üyelik, ödeme ve genel sorular için iletişim formu.</span></a><a class="yonlendirme-kalem" href="#yeni" data-sekme-git="yeni"><i class="yonlendirme-ikon fa-solid fa-comment-dots" aria-hidden="true"></i><span class="yonlendirme-metin"><b>Hesabınla ilgili bir sorun ${ikon('fa-arrow-right')}</b> Hesabına bağlı bir sorun için destek talebi açarsın; yazışmayı buradan izlersin.</span></a></div>
</div>`;

const detay = `<div class="yigin"><div id="tdGovde"></div></div>`;

export default () => [uyeKabuk({
  yol: 'hesabim/cozum-merkezi', baslik: 'Çözüm Merkezi',
  aciklama: 'Taleplerin, yeni talep açma, sık sorulanlar ve öneri kutusu tek adreste. Sekme değişir, kimlik kartın yerinde kalır.',
  muhur: 'Dada Diet · kişisel alanın', ikon: 'fa-seedling',
  grup: 'destek',
  sekmeler: [
    { id: 'taleplerim', ad: 'Destek Taleplerim', ikon: 'fa-inbox', govde: okumaBolum(taleplerim) },
    { id: 'yeni', ad: 'Yeni Destek Talebi', ikon: 'fa-plus', govde: okumaBolum(yeni) },
    { id: 'sss', ad: 'Sıkça Sorulan Sorular', ikon: 'fa-circle-question', govde: okumaBolum(sssPano) },
    { id: 'oneri', ad: 'Öneri ve Şikâyet', ikon: 'fa-comment-dots', govde: okumaBolum(oneri) },
  ],
  js: ['assets/js/sayfa/uye-gastro-ortak.js', 'assets/js/sayfa/uye-gastro-destek.js', 'assets/js/sayfa/uye-gastro-cozum.js'],
}), uyeKabuk({
  yol: 'hesabim/cozum-merkezi/talep', baslik: 'Destek talebi', aciklama: 'Yazışmanı buradan sürdürür, çözüldüyse talebi kapatırsın.',
  aktif: 'hesabim/cozum-merkezi/', ust: [['Çözüm Merkezi', 'hesabim/cozum-merkezi/']],
  eylem: `<a class="dugme hayalet" href="${K}hesabim/cozum-merkezi/#taleplerim">${ikon('fa-arrow-left')} Taleplerime Dön</a>`,
  muhur: 'Dada Diet · kişisel alanın', ikon: 'fa-seedling',
  govde: `<div class="okuma-kolonu">${detay}</div>`,
  js: ['assets/js/sayfa/uye-gastro-ortak.js', 'assets/js/sayfa/uye-gastro-destek.js', 'assets/js/sayfa/uye-gastro-talep.js'],
})];
