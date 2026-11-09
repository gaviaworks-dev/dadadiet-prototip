// Akıllı Tabak ve Değişim: public kalıbı, görselli bant + bolum-dizi. Üst bant ve bölüm işaretlemesi public-araclar/ortak.mjs'ten gelir.
import { JS, bant, bolum } from '../../parcalar/public-araclar/ortak.mjs';

const bolumler = [
`<div class="iki-kolon genis-yan">
  <div class="yigin">
    <div class="kart">
      <div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid fa-plus" aria-hidden="true"></i> Tabağına Yemek Ekle</h2><p>Yemeğini ve porsiyonunu seç, tabak bölmelere kendisi dağıtır.</p></div></div>
      <div class="kart-govde">
        <div class="segment ortali-segment" id="eklemeKipi" role="group" aria-label="Ne ekleyeceksin?"><button type="button" data-deger="yemek" aria-pressed="true"><i class="fa-solid fa-utensils" aria-hidden="true"></i> Yemek</button><button type="button" data-deger="besin" aria-pressed="false"><i class="fa-solid fa-carrot" aria-hidden="true"></i> Tek besin</button><button type="button" data-deger="foto" aria-pressed="false"><i class="fa-solid fa-camera" aria-hidden="true"></i> Fotoğraf</button></div>
        <div id="tabakAramaAlani">
        <div class="alan"><label class="alan-etiket" for="tabakArama" id="tabakAramaEtiket">Yemek ara</label><div class="oneri-kap"><input class="alan-girdi" id="tabakArama" type="search" placeholder="Örneğin karnıyarık, mercimek köftesi, somon ızgara"></div><button class="cip aktif bolme-suzgec" id="bolmeSuzgec" type="button" hidden></button></div>
        <div class="cipler" id="hazirTabaklar" role="group" aria-label="Hazır tabaklar"></div>
        <p class="alan-yardim">Bölme dağılımları ve el/kap ölçüleri tahminidir.</p>
        </div>
        <div class="foto-gomulu" id="tabakFoto" hidden>
          <p class="alan-yardim"><span class="rozet bekleme">Örnek akış</span> <span>Fotoğraftan yemek tanınmaz. Fotoğraf bu tabağın kaydı olarak saklanır, tabağı yemek seçerek kurarsın.</span></p>
          <div data-foto-govde></div>
          <div class="eylem-satiri" data-foto-ayak></div>
        </div>
      </div>
      <div class="kart-govde bosluksuz" id="tabakKalemler"></div>
      <div class="kart-alt"><span class="not" id="tabakSayac"></span><button class="dugme hayalet tehlike kucuk" id="tabakTemizle" type="button"><i class="fa-solid fa-trash" aria-hidden="true"></i> Tabağı boşalt</button></div>
    </div>

  </div>

  <div class="yapiskan">
    <div class="kart">
      <div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid fa-chart-pie" aria-hidden="true"></i> Tabağın</h2></div><div class="skor-kisa"><b id="skorKisa">0</b><span>/ 100</span></div></div>
      <div class="kart-govde">
        <div class="skor-oneri" id="skorOneri" role="status"></div>
        <div id="tabakCizim"></div>
        <p class="alan-yardim tabak-ipucu"><span>Bir dilime dokun, kuralını gör ve aramayı o bölmeye süz.</span></p>
        <div class="yigin sik" id="bolmeListe"></div>
        <p class="alan-yardim referans-not"><span><b>İdeal tabak:</b> Akdeniz tipi dengeli öğün hedefi. Sebze %40–50, protein %20–25, karbonhidrat %20–25, yağ %5–10.</span></p>
      </div>
      <div class="kart-govde ogun-kaydet">
        <div class="alan"><label class="alan-etiket" for="tabakOgun">Hangi öğünün?</label><select class="alan-secim" id="tabakOgun"><option value="kahvalti">Kahvaltı</option><option value="ara1">Ara Öğün</option><option value="ogle" selected>Öğle Yemeği</option><option value="ara2">İkindi</option><option value="aksam">Akşam Yemeği</option></select></div>
        <button class="dugme birincil tam-en" id="tabakKaydet" type="button"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i> Bu tabağı bugünkü öğünlerime ekle</button>
        <p class="alan-yardim oturum-kapali"><span>Kayıt olmadan da kullanırsın. Tabağın bu tarayıcıda tutulur; kaydolunca bugünkü öğünlerine aktarılır ve takibe başlarsın.</span></p>
        <p class="sonuc-kayit" id="tabakKayitDurum" role="status" hidden></p>
      </div>
    </div>
  </div>
</div>`,
`<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid fa-calculator" aria-hidden="true"></i> Özet</span><h2>Tabağın Ne Kadar Dengeli?</h2><p class="giris-metni">Eklediğin miktarların toplamı ve denge skorun.</p></div></div>
<div class="iki-kolon esit">
    <div class="kart">
      <div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid fa-calculator" aria-hidden="true"></i> Tabağının Toplamı</h2><p>Eklediğin miktarların toplam besin değeri.</p></div></div>
      <div class="kart-govde"><dl class="kunye c5" id="tabakToplam"></dl><p class="kart-metin" id="tabakToplamBos" hidden>Besin ekleyince kalori ve makro toplamın burada görünür.</p><p class="alan-yardim" id="tabakEksik" hidden></p>
        <div class="makro-blok">
          <span class="alan-etiket" id="makroEtiket">Enerjinin makro dağılımı</span>
          <div class="yigma-cubuk" id="makroCubuk" role="img" aria-labelledby="makroEtiket"></div>
          <div class="grafik-lejant" id="makroLejant"></div>
        </div></div>
    </div>

    <div class="kart">
      <div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid fa-gauge-high" aria-hidden="true"></i> Tabak Denge Skoru</h2><p>100 üzerinden; bölmelerin ideal tabağa yakınlığı.</p></div></div>
      <div class="kart-govde">
        <div class="skor-yerlesim">
          <div class="halka" id="skorHalka" data-oran="0"><span id="skorDeger">0</span></div>
          <ul class="isaretli-liste" id="skorParcalar"></ul>
        </div>
      </div>
    </div>
</div>`,
`<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid fa-right-left" aria-hidden="true"></i> Muadil bulucu</span><h2>Bunun Yerine Ne Yiyebilirim?</h2><p class="giris-metni">Seçtiğin besinin eşdeğerini bul; neyi kazanıp neyi kaybettiğini sayıyla gör.</p></div></div>
<div class="kart" id="muadil">
  <div class="kart-govde">
    <div class="alan-izgara c2">
      <div class="alan"><label class="alan-etiket" for="muadilArama">Değiştirmek istediğin besin</label><div class="oneri-kap"><input class="alan-girdi" id="muadilArama" type="search" placeholder="Besin ara"></div></div>
      <div class="alan"><label class="alan-etiket" for="muadilAdet">Miktar</label><div class="saat-satir"><div class="adet"><button type="button" data-yon="azalt" aria-label="Azalt"><i class="fa-solid fa-minus" aria-hidden="true"></i></button><input id="muadilAdet" type="number" min="0.5" step="0.5" value="1"><button type="button" data-yon="artir" aria-label="Artır"><i class="fa-solid fa-plus" aria-hidden="true"></i></button></div><span class="adet-birim" id="muadilBirim"></span></div></div>
    </div>
    <div class="temel-satir"><div class="cipler" id="muadilHizli" role="group" aria-label="Sık değiştirilen besinler"></div></div>
    <div class="muadil-ozet" id="muadilOzet" aria-live="polite"></div>
  </div>
  <div class="kart-govde" id="muadilSonuc"></div>
  <div class="kart-alt"><span class="not" id="muadilNot"></span></div>
</div>`,
`<div class="bilgi-notu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><div><p><b>Skor nasıl hesaplanır?</b> Eklediğin yemek ve besinlerin bölme oranları Akdeniz tipi ideal tabakla karşılaştırılır: sebze %40–50, protein %20–25, karbonhidrat %20–25, yağ %5–10. Aralık dışındaki her puan skoru düşürür. Skor genel bir yönlendirmedir, kişiye özel beslenme önerisi değildir.</p></div></div>`,
];

export default () => [{
  yol: 'akilli-tabak-ve-degisim',
  meta: { baslik: 'Akıllı Tabak ve Değişim', duzen: 'public', aktif: 'Sağlık Araçları', hero: true, js: [JS, 'assets/js/misafir.js', 'assets/js/ogun-foto.js', 'assets/js/sayfa/moduller-ortak.js', 'assets/js/sayfa/moduller-tabak.js'] },
  govde: `${bant({
    yol: [['Sağlık Araçları', 'hesaplayicilar/'], ['Akıllı Tabak ve Değişim']], etiket: 'Sağlık araçları', etiketIkon: 'fa-chart-pie',
    h1: 'Akıllı Tabak ve <span class="vurgu">Değişim</span>', gorsel: 'hero/beslenme-reh-hero.jpg',
    alt: 'Yemeğini ara, porsiyonunu Küçük, Orta ya da Büyük seç. Tabak dört bölmeye kendisi dağılır; 100 üzerinden skorun ve eksik kalan bölme hemen görünür.',
    sayilar: [['<span data-arama-sayi="yemek"></span>', 'aranabilir yemek ve tarif'], ['<span data-arama-sayi="besin"></span>', 'aranabilir tek besin']],
  })}
<div class="bolum-dizi">
${bolumler.map((h, i) => bolum(h, { ilk: i === 0 })).join('\n')}
</div>`,
}];
