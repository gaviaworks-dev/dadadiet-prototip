import { uyeKabuk } from '../../parcalar/uye/kabuk.mjs';
import { bolumBas, kart, ayarSatir, anahtar, alan, secim, dugme, modal, tablo } from '../../parcalar/uye/ust.mjs';
import { ikon, altNot, uyari, durumSatir, sonuc, bag, sekmeGit, json, kademeler } from './_ortak.mjs';

const say = (id, m = '') => `<span class="durum-hapi kapali" id="${id}">${m}</span>`;
const dizinBag = bag('Diyetisyen Dizini', 'diyetisyenler/');

const abonelik = `<div class="yigin">
${bolumBas({ etiket: 'Paket aboneliği', ikon: 'fa-crown', baslik: 'Aktif aboneliğin', metin: `Kademen, dönem tarihlerin, yenileme durumu ve iptal. Kademelerin içeriği ${bag('Paketlerim', 'hesabim/paketlerim/')}’de.` })}
<div id="odAbone"></div>
${kart({ ikon: 'fa-rotate', baslik: 'Yenileme ayarları', metin: 'Yenilemeyi kapatırsan üyeliğin dönem sonunda biter; o güne kadar erişimin sürer.', sinif: 'odeme', govde: `<div class="ayar-liste">
${ayarSatir({ ikon: 'fa-rotate', baslik: 'Otomatik yenileme', metin: '<span id="odYenileNot"></span>', sag: anahtar('odYenile', 'Otomatik yenileme', true, ' id="odYenile"') })}
${ayarSatir({ ikon: 'fa-credit-card', baslik: 'Yenilemede kullanılacak kart', metin: `Kartlarını ${sekmeGit('Kayıtlı Kartlar', 'kartlar')} sekmesinden yönetirsin.`, sag: '<select class="alan-secim" id="odKart" aria-label="Yenilemede kullanılacak kart"></select>' })}
</div>${sonuc('odYenileSonuc')}` })}
${kart({ ikon: 'fa-ticket', baslik: 'Kampanya kodu', metin: 'Kod bir sonraki tahsilata uygulanır; mevcut dönem için geriye dönük indirim yapılmaz.', sinif: 'odeme', govde: `<form id="odPromoForm" novalidate>${alan({ ad: 'odPromoKod', etiket: 'Kampanya kodu', istege: true, ek: ' placeholder="Örneğin: DENGE25" autocomplete="off"' })}${dugme('Kodu Doğrula', { sinif: 'birincil', ikon: 'fa-check', tur: 'submit' })}</form>${sonuc('odPromoSonuc')}
${altNot('fa-circle-info', 'Bir tahsilatta yalnız bir kod geçerlidir, kodlar birleştirilemez. Demoda üç örnek kod tanınıyor: <b>DENGE25</b> · <b>YENIBASLA</b> · <b>YIL2026</b>. Doğrulama çalışır, indirim hiçbir tahsilata gitmez.')}` })}
${kart({ ikon: 'fa-ban', baslik: 'Aboneliği dondur veya iptal et', metin: 'Tamamen bırakmak istemiyorsan bir süre dondurabilirsin: tahsilat durur, kayıtların olduğu gibi kalır.', sinif: 'odeme', id: 'odIptalKart', govde: `${uyari('fa-triangle-exclamation', '<span id="odIptalUyari"></span>')}
<div class="alan-izgara c2">${secim({ ad: 'odDondurSure', etiket: 'Dondurma süresi', secenekler: ['1 ay', '2 ay', '3 ay', '6 ay'] })}<div class="alan"><label class="alan-etiket" for="odIptalNeden">İptal nedenin <span class="istege-bagli">(isteğe bağlı)</span></label><select class="alan-secim" id="odIptalNeden">${['Belirtmek istemiyorum', 'Uygulamayı kullanmıyorum', 'Ücret bana uygun değil', 'Aradığım programı bulamadım', 'Başka bir uygulamaya geçtim', 'Bir süre ara vermek istiyorum', 'Teknik sorunlar yaşadım'].map((o) => `<option>${o}</option>`).join('')}</select></div></div>
<form class="onay-kapisi" id="odIptalForm" novalidate><label class="onay-kutusu" for="odIptalOnay"><input type="checkbox" id="odIptalOnay"><span>Dönem sonunda Pro erişimimin kapanacağını ve iptalin kalan dönem için kendiliğinden ücret iadesi doğurmadığını okudum, onaylıyorum.</span></label>
<div class="onay-eylemler">${dugme('Aboneliği Dondur', { ikon: 'fa-snowflake', ek: ' id="odDondurBtn"' })}${dugme('Aboneliği İptal Et', { sinif: 'uyari', ikon: 'fa-ban', tur: 'submit', ek: ' id="odIptalBtn" disabled' })}${durumSatir('fa-lock', 'Düğme kapalı: iptal için önce onay kutusunu işaretle.', ' id="odIptalDurum"')}</div></form>${sonuc('odIptalSonuc')}
${altNot('fa-circle-info', `İptal kuralları ve dönem sonu erişimi ${bag('Kullanım Koşulları', 'yasal/')}’nda. İptal yerine <b>paketi düşürmeyi</b> de seçebilirsin: ${bag('kademeleri karşılaştır', 'hesabim/paketlerim/#karsilastir')}.`)}` })}
</div>`;

const hizmet = `<div class="yigin">
${bolumBas({ etiket: 'Diyetisyen', ikon: 'fa-user-doctor', baslik: 'Diyetisyene ödediklerin', metin: 'Abonelikten ayrı bir hesaptır. İki satın alma biçimi vardır ve ayrı ayrı listelenir: tek görüşme ve görüşme paketi.' })}
${uyari('fa-circle-info', `<b>Bu tutarlar Dada Diet Pro üyeliğine dâhil değildir.</b> Görüşme bedelini diyetisyenine ödersin; ayrı tahsil edilir, ayrı iade edilir. Paket kademelerini ${bag('Paketlerim', 'hesabim/paketlerim/')}’de görürsün.`)}
${kart({ ikon: 'fa-stopwatch', baslik: 'Tek görüşme ödemeleri', metin: 'Tek tek satın aldığın görüşmeler. Her satır bir görüşmeye karşılık gelir; paket hakkından düşmez.', sag: say('odTekSay'), sinif: 'odeme', bosluksuz: true, govde: `<div id="odTekKap">${tablo({ id: 'odTek', etiket: 'Tek görüşme ödemeleri', sabit: false, basliklar: ['Diyetisyen ve hizmet', 'Tarih', 'Tutar', 'Durum', 'Belge'] })}</div><div class="kart-govde">${altNot('fa-calendar-check', `Yeni görüşme almak için diyetisyeninin profilinden satın alırsın: ${dizinBag}. Çalıştığın diyetisyeni ${bag('Diyetisyenim', 'hesabim/diyetisyenim/')} sayfasında görürsün.`)}</div>` })}
${kart({ ikon: 'fa-layer-group', baslik: 'Görüşme paketleri', metin: 'Satın aldığın görüşme hakları. Kalan hakkın çubukta görünür.', sag: say('odPaketSay'), sinif: 'odeme', govde: '<div id="odPaketList"></div>' })}
${kart({ ikon: 'fa-clock-rotate-left', baslik: 'Sona eren paketler', metin: 'Hakkı biten görüşme paketleri. Kayıtları duruyor; aynı diyetisyenle yeniden çalışabilirsin.', sinif: 'odeme', govde: `<div id="odGecmisList"></div><div>${dugme('Diyetisyen Dizinine Bak', { ikon: 'fa-magnifying-glass', href: 'diyetisyenler/' })}</div>
${altNot('fa-circle-info', `Görüşme paketleri <b>Dada Diet Pro üyeliğine dâhil değildir</b> ve ayrı tahsil edilir. Belgeleri ${sekmeGit('Faturalar', 'faturalar')}, iade taleplerini ${sekmeGit('İade Talepleri', 'iade')} sekmesinde bulursun.`)}` })}
</div>`;

const faturalar = `<div class="yigin">
${bolumBas({ etiket: 'Belgeler', ikon: 'fa-file-invoice', baslik: 'Faturaların', metin: 'Üyelik ve diyetisyen tahsilatlarının tamamı tek defterde. Süzgeç listeyi yerinde daraltır, sayfa yenilenmez.' })}
<div class="kart panel tam-kolon odeme" id="fatura-bilgilerim"><div class="kart-bas"><div><h3 class="kart-baslik">${ikon('fa-receipt')} Fatura defteri</h3><p>Fatura numarası, tarih, tutar, durum ve belge. Her satırın hangi kutuya ait olduğu numaranın altında yazar.</p></div>${dugme('Fatura Bilgilerim', { ikon: 'fa-building-columns', ek: ' data-ac="#ftModal"' })}</div>
<div class="kart-govde">${uyari('fa-circle-info', 'Defterde örnek satırların yanında bu tarayıcıda <b>gerçekten yaptığın</b> paket satın almaları da görünür; o satırlarda numaranın yanında <b>“senin kaydın”</b> yazar.')}</div>
<div class="kart-suzgec"><div class="cipler" role="group" aria-label="Fatura türü süzgeci" id="odFtCip"><span class="cipler-basligi">Tür</span>${[['tumu', 'fa-list', 'Tümü'], ['uyelik', 'fa-crown', 'Üyelik'], ['diyetisyen', 'fa-user-doctor', 'Diyetisyen'], ['iade', 'fa-rotate-left', 'İade']].map(([k, i, a], n) => `<button class="cip suzgec${n ? '' : ' aktif'}" type="button" data-tur="${k}">${ikon(i)} ${a}</button>`).join('')}</div></div>
<p class="kart-sayac" id="odFtSay"></p>
<div class="kart-govde bosluksuz"><div id="odFtTabloKap">${tablo({ id: 'odFt', etiket: 'Fatura listesi', sabit: false, basliklar: ['Fatura no', 'Tarih', 'Tutar', 'Durum', 'Belge'] })}</div><div id="odFtBos" hidden></div></div>
<div class="kart-govde">${altNot('fa-circle-info', '<b>Belge indirilebilir.</b> “Detay” faturanın dökümünü, vergi ayrımını ve tahsilat bilgisini gösterir; oradan belgeyi HTML dosyası olarak indirebilir ya da yazdırabilirsin. Faturalar aynı zamanda e-posta adresine gönderilir.')}</div></div>
</div>`;

const kartlar = `<div class="yigin">
${bolumBas({ etiket: 'Ödeme yöntemleri', ikon: 'fa-credit-card', baslik: 'Kayıtlı kartların', metin: 'Yenilemede kullanılacak kartı buradan seçer, demo kart ekler veya kaldırırsın.' })}
${kart({ ikon: 'fa-credit-card', baslik: 'Kartların', metin: 'Varsayılan kart yenilemede ve yeni satın almalarda ilk sırada denenir. Reddedilirse diğer kart denenir; ikisi de reddedilirse tahsilat başarısız olur ve sana bildirilir.', sag: say('odKartSay'), sinif: 'odeme', govde: `<div id="odKartListe"></div>${sonuc('odKartSonuc')}
${altNot('fa-lock', `<b>Tam kart numarası Dada Diet’te tutulmaz.</b> Kart kayıtları ödeme kuruluşunda saklanır; burada yalnız marka, son dört hane ve son kullanma tarihi görünür. Yenilemede hangi kartın kullanılacağını ${sekmeGit('Abonelik › Yenileme ayarları', 'abonelik')} bölümünden seçersin; görüşme ödemelerinde varsayılan kart kullanılır.`)}` })}
${kart({ ikon: 'fa-plus', baslik: 'Kart ekle', metin: 'Bu demoda kart bilgisi istenmez. Hazır demo kartlardan birini hesabına eklersin.', sinif: 'odeme', govde: `<form id="odKartForm" novalidate><div class="alan"><label class="alan-etiket" for="odDemoKart">Demo kart <span class="zorunlu">*</span></label><select class="alan-secim" id="odDemoKart"></select></div><div class="onay-eylemler">${dugme('Kartı Ekle', { sinif: 'birincil', ikon: 'fa-plus', tur: 'submit', ek: ' id="odKartEkle"' })}${durumSatir('fa-lock', 'Gerçek kart numarası, son kullanma tarihi ya da güvenlik kodu bu ekranda sorulmaz.')}</div></form>${sonuc('odKartEkleSonuc')}` })}
</div>`;

const iade = `<div class="yigin">
${bolumBas({ etiket: 'İade', ikon: 'fa-rotate-left', baslik: 'İade talepleri', metin: 'Yanlış tahsilat, kullanılmayan görüşme hakkı veya cayma hakkı için talep açarsın. Açtığın talepler burada durumuyla listelenir.' })}
${kart({ ikon: 'fa-clock-rotate-left', baslik: 'Taleplerin', metin: 'Her talep bir tahsilata bağlıdır. Durum değiştiğinde e-posta ve bildirim alırsın.', sag: say('odIadeSay'), sinif: 'odeme', bosluksuz: true, govde: tablo({ id: 'odIade', etiket: 'İade talepleri', sabit: false, basliklar: ['Talep ve tahsilat', 'Tarih', 'Tutar', 'Durum', 'Belge'] }) })}
${kart({ ikon: 'fa-file-circle-plus', baslik: 'Yeni iade talebi', metin: 'Hangi tahsilat için, neden. Tutar seçtiğin tahsilattan gelir; elle girilmez.', sinif: 'odeme', govde: `<form id="odIadeForm" novalidate>
<div class="alan"><label class="alan-etiket" for="odIadeTahsilat">İade istediğin tahsilat <span class="zorunlu">*</span></label><select class="alan-secim" id="odIadeTahsilat"></select><span class="alan-hata" id="odIadeTahsilatHata">${ikon('fa-circle-exclamation')} İade istediğin tahsilatı seç.</span><p class="alan-yardim" id="odIadeTutar"><span>İade tutarı seçtiğin tahsilattan okunur.</span></p></div>
<div class="alan"><label class="alan-etiket" for="odIadeNeden">İade nedeni <span class="zorunlu">*</span></label><select class="alan-secim" id="odIadeNeden">${['Bir neden seç', 'Yanlış veya mükerrer tahsilat', 'Kullanılmayan görüşme hakkı', 'Cayma hakkı (14 gün)', 'Görüşme gerçekleşmedi', 'Başka bir neden'].map((o, n) => `<option${n ? '' : ' value=""'}>${o}</option>`).join('')}</select><span class="alan-hata" id="odIadeNedenHata">${ikon('fa-circle-exclamation')} Bir neden seç.</span></div>
<div class="alan"><label class="alan-etiket" for="odIadeAciklama">Açıklama <span class="zorunlu">*</span> <span class="alan-sayac" id="odIadeSayac">0 / 600</span></label><textarea class="alan-metin" id="odIadeAciklama" rows="4" maxlength="600"></textarea><span class="alan-hata" id="odIadeAciklamaHata">${ikon('fa-circle-exclamation')} En az 20 karakter yaz; ne olduğunu anlatmadan talep değerlendirilemez.</span></div>
<div class="onay-eylemler">${dugme('Talebi Gönder', { sinif: 'birincil', ikon: 'fa-paper-plane', tur: 'submit' })}${durumSatir('fa-scale-balanced', `Cayma ve iade koşulları ${bag('yasal metinde', 'yasal/')} yazılı.`)}</div></form>${sonuc('odIadeSonuc')}
${altNot('fa-headset', `Görüşme ve paket iadeleri kullanılan hakka göre hesaplanır; anlaşmazlık olursa ${bag('destek talebi', 'hesabim/cozum-merkezi/#yeni')} açarsın.`)}` })}
</div>`;

const ftForm = `<div class="yigin sik">${uyari('fa-circle-info', 'Girdiğin bilgiler yalnız bu tarayıcıda kalır; hiçbir sunucuya gönderilmez. Demo faturalar bu kayıttan okunur.')}
<div class="segment" role="group" aria-label="Fatura tipi" id="ftTip"><button type="button" data-tip="bireysel" aria-pressed="true">Bireysel</button><button type="button" data-tip="kurumsal" aria-pressed="false">Kurumsal</button></div>
${alan({ ad: 'ftAd', etiket: 'Ad soyad', zorunlu: true })}
<div id="ftKurumsal" hidden>${alan({ ad: 'ftUnvan', etiket: 'Firma unvanı', zorunlu: true })}<div class="alan-izgara c2">${alan({ ad: 'ftDaire', etiket: 'Vergi dairesi', zorunlu: true })}${alan({ ad: 'ftVkn', etiket: 'Vergi no (VKN)', zorunlu: true, ek: ' inputmode="numeric" maxlength="10"' })}</div></div>
<div class="alan-izgara c2">${alan({ ad: 'ftTel', etiket: 'Telefon', tur: 'tel', zorunlu: true })}${alan({ ad: 'ftEposta', etiket: 'E-posta', tur: 'email', zorunlu: true, yardim: 'Fatura bu adrese gönderilir.' })}</div>
<div class="alan-izgara c2">${secim({ ad: 'ftIl', etiket: 'İl', secenekler: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Diğer'] })}${alan({ ad: 'ftIlce', etiket: 'İlçe', zorunlu: true })}</div>
<div class="alan"><label class="alan-etiket" for="ftAdres">Adres <span class="zorunlu">*</span></label><textarea class="alan-metin" id="ftAdres" rows="2" maxlength="240"></textarea></div>
<label class="onay-kutusu"><input type="checkbox" id="ftVarsayilan" checked><span>Bu bilgileri varsayılan fatura adresim yap</span></label></div>`;

const sonEk = modal({ id: 'fdModal', baslik: 'Fatura belgesi', govde: '<div class="yigin sik" id="fdGovde"></div>', ayak: dugme('Yazdır', { ikon: 'fa-print', ek: ' id="fdYazdir"' }) + dugme('Belgeyi İndir', { sinif: 'birincil', ikon: 'fa-download', ek: ' id="fdIndir"' }) })
  + modal({ id: 'ftModal', baslik: 'Fatura Bilgilerim', form: ' id="ftForm" novalidate', govde: ftForm, ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Bilgileri Kaydet', { sinif: 'birincil', ikon: 'fa-floppy-disk', tur: 'submit' }) })
  + json('gKademe', kademeler);

export default () => [uyeKabuk({
  yol: 'hesabim/odemelerim', baslik: 'Ödemelerim',
  aciklama: 'Abonelik, diyetisyen ödemeleri, faturalar, kayıtlı kartlar ve iade talepleri tek adreste.',
  grup: 'od',
  sekmeler: [
    { id: 'abonelik', ad: 'Abonelik Ödemeleri', ikon: 'fa-crown', govde: abonelik },
    { id: 'hizmet', ad: 'Hizmet / Uzman Ödemeleri', ikon: 'fa-user-doctor', govde: hizmet },
    { id: 'faturalar', ad: 'Faturalar', ikon: 'fa-file-invoice', govde: faturalar },
    { id: 'kartlar', ad: 'Kayıtlı Kartlar', ikon: 'fa-credit-card', govde: kartlar },
    { id: 'iade', ad: 'İade Talepleri', ikon: 'fa-rotate-left', govde: iade },
  ],
  sonEk,
  js: ['assets/js/sayfa/uye-gastro-ortak.js', 'assets/js/sayfa/uye-gastro-odemelerim.js'],
})];
