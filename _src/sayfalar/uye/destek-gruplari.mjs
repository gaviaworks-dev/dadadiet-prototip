import { uyeSayfa, bolumBas, kart, ayarSatir, anahtar, dugme, bilgi } from '../../parcalar/uye/ust.mjs';

const gruplar = [
  { slug: 'pcos-ile-savasanlar', ad: 'PCOS ile Savaşanlar', mono: 'PI', saglik: true, aciklama: 'Polikistik over sendromu (PCOS) ile yaşayanların deneyim paylaştığı ve birbirine destek olduğu grup.' },
  { slug: 'veganliga-adim-atanlar', ad: 'Veganlığa Adım Atanlar', mono: 'VA', saglik: false, aciklama: 'Bitkisel beslenmeye geçiş sürecindekilerin tarif ve deneyim paylaştığı grup.' },
];
const kurallar = ['Saygılı ol; kimseyi yargılama.', 'Tanı ya da ilaç önerisi verme; tıbbi kararlar hekiminle verilir.', 'Kişisel bilgilerini (telefon, adres, tahlil belgesi) paylaşma.', 'Reklam ve ürün tanıtımı yapma.', 'Kurala aykırı içeriği şikâyet et; Dada Diet moderasyonu inceler.'];

const govde = `<div class="yigin">
${bolumBas({ etiket: 'Topluluk', ikon: 'fa-people-group', baslik: 'Grupların', metin: 'Bir grup seç: üyesiysen akışı okur ve paylaşırsın, değilsen kurallarını okuyup katılırsın.' })}
${bilgi('fa-circle-info', 'Destek grupları tıbbi tavsiye yeri değildir. Tanı ve tedavi kararlarını hekiminle ver.')}
<div class="msj-sayfa">
<div class="msj-panel-kart kart"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-people-group" aria-hidden="true"></i> Gruplar</h3><p id="dgSayi"></p></div></div><div class="kart-govde bosluksuz"><div class="sohbet-kisiler" id="dgListe"></div></div></div>
<div class="msj-panel-kart kart" id="dgDetay"></div>
</div>
${kart({ ikon: 'fa-bell', baslik: 'Grup bildirimleri', form: ' data-ayar-form="grup" data-mesaj="Grup bildirimi tercihin kaydedildi."', bosluksuz: true, govde: `<div class="ayar-liste">${ayarSatir({ baslik: 'Gönderime yorum gelince bildir', metin: 'Uygulama içi bildirim gönderilir; e-posta gönderilmez.', sag: anahtar('yorum', 'Gönderime yorum gelince bildir', true) })}</div>`, alt: dugme('Kaydet', { sinif: 'birincil', tur: 'submit' }) })}
</div>
<script type="application/json" id="dgKatalog">${JSON.stringify({ gruplar, kurallar }).replace(/</g, '\\u003c')}</script>`;

export default () => [uyeSayfa({
  yol: 'hesabim/destek-gruplari', ad: 'Destek Grupları', muhur: 'Destek grupları · topluluk', ikon: 'fa-people-group',
  giris: 'Benzer yoldan geçenlerle deneyim paylaş; gerçek adınla ya da takma adla katılabilirsin.',
  govde, js: ['assets/js/sayfa/uye-destek-gruplari.js'],
})];
