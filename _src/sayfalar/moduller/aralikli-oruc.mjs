// Aralıklı Oruç Rehberi: public kalıbı, görselli bant + bolum-dizi. Üst bant ve bölüm işaretlemesi public-araclar/ortak.mjs'ten gelir.
import { JS, bant, bolum } from '../../parcalar/public-araclar/ortak.mjs';

const bolumler = [
`<div class="uyari-kutu tehlike" role="note"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span><b>Herkese uygun değildir.</b> Gebelik ya da emzirme, diyabet, yeme bozukluğu öyküsü ya da düzenli ilaç kullanımı varsa başlamadan önce hekimine ve diyetisyenine danış. 18 yaşından küçükler için önerilmez.</span></div>

<div class="iki-kolon esit">
  <div class="kart kart-dikey">
    <div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid fa-sliders" aria-hidden="true"></i> <span id="duzenBaslik">Protokolünü seç</span></h2><p id="duzenAlt">Yeni başlıyorsan dar pencereye birden geçme, en üstteki düzenle başla.</p></div><button class="dugme hayalet kucuk" id="duzenDegistir" type="button" aria-expanded="false" aria-controls="protokolSecim" hidden>Değiştir</button></div>
    <div class="kart-govde" id="bilinenDuzen" hidden><div class="secili-ozet"><span class="secili-ozet-ikon"><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i></span><p><b></b><small></small></p></div></div>
    <div class="kart-govde" id="protokolSecim">
      <div class="secenek-izgara" id="protokoller" data-tek-secim role="group" aria-label="Oruç protokolü"></div>
      <div class="alan saat-alani">
        <label class="alan-etiket" for="ilkLokma">İlk lokmayı saat kaçta yemek istersin?</label>
        <div class="saat-satir"><input class="alan-girdi" id="ilkLokma" type="time" step="900" value="12:00">
          <div class="cipler" id="saatCipler" role="group" aria-label="Sık seçilen saatler"></div></div>
      </div>
    </div>
    <div class="kart-govde bosluksuz-ust yigin sik kart-buyur"><div class="uyari-kutu" id="saatNotu" hidden><i class="fa-solid fa-moon" aria-hidden="true"></i><span></span></div><dl class="kunye iki-sutun" id="pencereOzet"></dl></div>
    <div class="kart-govde durum-serit ust-cizgili">
      <div class="oturum-acik durum-serit-metin"><p class="durum-satir tamam" id="kayitDurum"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span></span></p></div>
      <div class="oturum-kapali durum-serit-metin"><p class="durum-satir"><i class="fa-solid fa-user" aria-hidden="true"></i><span>Saatlerini profiline kaydetmek ve günlük hatırlatma almak için <a href="{{kok}}giris/">giriş yap</a>.</span></p></div>
    </div>
  </div>

  <div class="kart kart-dikey">
    <div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid fa-clock" aria-hidden="true"></i> Zaman çarkın</h2><p>Yeşil yayı sürükleyerek ilk lokma saatini ayarla.</p></div></div>
    <div class="kart-govde kart-buyur">
      <div class="cark-kap" id="cark"></div>
      <div class="grafik-lejant ortali-lejant"><span class="lejant-kalem dolu">Yeme penceresi</span><span class="lejant-kalem cark-oruc">Oruç</span><span class="lejant-kalem nokta">Şu an</span><span class="lejant-kalem centik">Evre başlangıcı</span></div>
    </div>
    <div class="kart-govde ust-cizgili"><p class="durum-satir su-an" id="suAn"><i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i><span></span></p></div>
  </div>
</div>`,
`<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid fa-dna" aria-hidden="true"></i> Biyolojik zaman çizelgesi</span><h2>Oruçta vücudunda neler olur?</h2><p class="giris-metni">Saatler son lokmandan itibaren sayılır. Süreler kişiye, öğüne ve hareketine göre değişir, yaklaşık bir çerçeve olarak oku. Evre saatleri uzman onayı bekliyor.</p></div></div>
<div class="iki-kolon esit">
  <div class="kart"><div class="kart-govde"><div class="zaman-cizelgesi" id="cizelge"></div></div></div>
  <div class="yigin sik esit-yigin">
    <div class="kart"><div class="kart-bas"><h3 class="kart-baslik"><i class="fa-solid fa-droplet" aria-hidden="true"></i> Oruçta serbest olanlar</h3></div><div class="kart-govde"><ul class="isaretli-liste"><li><i class="fa-solid fa-check" aria-hidden="true"></i><span>Su ve sade maden suyu</span></li><li><i class="fa-solid fa-check" aria-hidden="true"></i><span>Sütsüz, şekersiz çay ve kahve</span></li><li><i class="fa-solid fa-check" aria-hidden="true"></i><span>Şekersiz bitki çayları</span></li></ul></div></div>
    <div class="kart"><div class="kart-bas"><h3 class="kart-baslik"><i class="fa-solid fa-mug-saucer" aria-hidden="true"></i> Orucu bozanlar</h3></div><div class="kart-govde yigin sik"><ul class="isaretli-liste olumsuz"><li><i class="fa-solid fa-xmark" aria-hidden="true"></i><span>Süt, krema ya da şeker eklenmiş kahve ve çay</span></li><li><i class="fa-solid fa-xmark" aria-hidden="true"></i><span>Meyve suyu, gazlı içecek ve enerji içeceği</span></li><li><i class="fa-solid fa-xmark" aria-hidden="true"></i><span>Kalori içeren her yiyecek, küçük atıştırmalıklar dahil</span></li><li><i class="fa-solid fa-xmark" aria-hidden="true"></i><span>Alkol</span></li></ul><p class="kart-metin">Düzenli ilaçlarını oruç nedeniyle kendi başına atlama ya da saatini değiştirme, hekimine sor.</p></div></div>
  </div>
</div>`,
`<div class="bilgi-notu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><div><p><b>Bu rehber genel bilgi amaçlıdır.</b> Evre saatleri kaynaklar arasında farklılık gösterir ve uzman onayı bekliyor. Aralıklı oruç tıbbi bir tedavi değildir; kişisel durumun için hekimine ve diyetisyenine danış.</p></div></div>`,
];

export default () => [{
  yol: 'aralikli-oruc-rehberi',
  meta: { baslik: 'Aralıklı Oruç Rehberi', duzen: 'public', aktif: 'Sağlık Araçları', hero: true, js: [JS, 'assets/js/sayfa/moduller-ortak.js', 'assets/js/sayfa/moduller-soru.js', 'assets/js/sayfa/moduller-oruc.js'] },
  govde: `${bant({
    yol: [['Sağlık Araçları', 'hesaplayicilar/'], ['Aralıklı Oruç Rehberi']], etiket: 'Sağlık araçları', etiketIkon: 'fa-clock',
    h1: 'Aralıklı Oruç <span class="vurgu">Rehberi</span>', gorsel: 'hero/css-photo-1490818387583-1baba5e638af.avif',
    alt: 'Protokolünü ve ilk lokma saatini seç; yeme ve oruç pencereni, oruç sırasında vücudunda neler olduğunu saat saat gör.',
    sayilar: [[4, 'protokol']],
  })}
<div class="bolum-dizi">
${bolumler.map((h, i) => bolum(h, { ilk: i === 0 })).join('\n')}
</div>`,
}];
