import { uyeSayfa, kart, ayarSatir, anahtar, dugme, bilgi, modal } from '../../parcalar/uye/ust.mjs';

const gruplar = [
  { slug: 'pcos-ile-savasanlar', ad: 'PCOS ile Savaşanlar', mono: 'PI', saglik: true, aciklama: 'Polikistik over sendromu (PCOS) ile yaşayanların deneyim paylaştığı ve birbirine destek olduğu grup.' },
  { slug: 'veganliga-adim-atanlar', ad: 'Veganlığa Adım Atanlar', mono: 'VA', saglik: false, aciklama: 'Bitkisel beslenmeye geçiş sürecindekilerin tarif ve deneyim paylaştığı grup.' },
];
const kurallar = ['Saygılı ol; kimseyi yargılama.', 'Tanı ya da ilaç önerisi verme; tıbbi kararlar hekiminle verilir.', 'Kişisel bilgilerini (telefon, adres, tahlil belgesi) paylaşma.', 'Reklam ve ürün tanıtımı yapma.', 'Kurala aykırı içeriği şikâyet et; Dada Diet moderasyonu inceler.'];

// Şikâyet nedenleri grup kurallarıyla eşleşir; şikâyet Dada Diet moderasyonuna gider (prototipte gönderilmez)
const nedenler = ['Hakaret, zorbalık ya da yargılama', 'Tanı, ilaç ya da tedavi önerisi', 'Kişisel bilgi paylaşımı', 'Reklam ya da ürün tanıtımı', 'Yanlış ya da zararlı sağlık bilgisi', 'Diğer'];
const sonEk = modal({
  id: 'dgSikayet', baslik: 'Gönderiyi Şikâyet Et', form: ' id="dgSikayetForm"',
  govde: `<p class="kart-metin" id="dgSikayetOzet"></p><div class="alan"><span class="alan-etiket" id="dgNedenEt">Şikâyet nedeni <span class="zorunlu">*</span></span><div class="yigin sik" role="radiogroup" aria-labelledby="dgNedenEt">${nedenler.map((n, i) => `<label class="onay-kutusu" for="dgNeden${i}"><input type="radio" name="neden" id="dgNeden${i}" value="${n}"${i ? '' : ' required'}><span>${n}</span></label>`).join('')}</div></div><div class="alan"><label class="alan-etiket" for="dgSikayetNot">Açıklama <span class="istege-bagli">(isteğe bağlı)</span></label><textarea class="alan-metin" id="dgSikayetNot" rows="3" maxlength="500"></textarea></div><p class="alan-yardim"><span>Şikâyetin moderasyon ekibine kimliğin gizli tutularak iletilir. Prototipte gönderilmez, bu tarayıcıda işaretlenir.</span></p>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Şikâyet et', { sinif: 'tehlike', tur: 'submit' }),
});

const govde = `<div class="yigin">
${bilgi('fa-circle-info', 'Destek grupları tıbbi tavsiye yeri değildir. Tanı ve tedavi kararlarını hekiminle ver.')}
<div class="msj-sayfa">
<div class="msj-panel-kart kart"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-people-group" aria-hidden="true"></i> Gruplar</h3><p id="dgSayi"></p></div></div><div class="kart-govde bosluksuz"><div class="sohbet-kisiler" id="dgListe"></div></div></div>
<div class="msj-panel-kart kart" id="dgDetay"></div>
</div>
${kart({ ikon: 'fa-bell', baslik: 'Grup Bildirimleri', form: ' data-ayar-form="grup" data-mesaj="Grup bildirimi tercihin kaydedildi."', bosluksuz: true, govde: `<div class="ayar-liste">${ayarSatir({ baslik: 'Gönderime yorum gelince bildir', metin: 'Uygulama içi bildirim gönderilir; e-posta gönderilmez.', sag: anahtar('yorum', 'Gönderime yorum gelince bildir', true) })}</div>`, alt: dugme('Kaydet', { sinif: 'birincil', tur: 'submit' }) })}
</div>
<script type="application/json" id="dgKatalog">${JSON.stringify({ gruplar, kurallar }).replace(/</g, '\\u003c')}</script>`;

export default () => [uyeSayfa({
  yol: 'hesabim/destek-gruplari', ad: 'Destek Grupları', aktif: 'hesabim/',
  giris: 'Benzer yoldan geçenlerle deneyim paylaş; gerçek adınla ya da takma adla katılabilirsin.',
  govde, sonEk, js: ['assets/js/sayfa/uye-destek-gruplari.js'],
})];
