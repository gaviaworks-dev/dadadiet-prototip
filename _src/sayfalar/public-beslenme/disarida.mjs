// Dışarıda Ne Yesem: kart ve sol filtre sütunu dadagourmet.com/mekanlar kalıbıyla kurulur. Sayılar Gourmet yayınından gelir.
import { K, kac, ikon, bant, bolum, DETAY, sayfa, dizi, bilgiNot } from '../../parcalar/public-beslenme/ortak.mjs';
import { bicim } from '../../parcalar/bicim.mjs';

const A = { aktif: 'Beslenme' };
const REHBER = ['Restoran menüsü nasıl okunur?', 'Paket siparişte neler değişir?', 'Hızlı servis restoranında seçim nasıl yapılır?', 'Seyahatte öğün düzeni nasıl kurulur?', 'Davet sofrasında porsiyon nasıl yönetilir?', 'Dışarıda kahvaltı nasıl seçilir?'];
const FIYAT_AD = { '₺₺₺': 'Üst Orta (₺₺₺)', '₺₺₺₺': 'Lüks (₺₺₺₺)' };
const BESLENME_AD = { vegan: 'Vegan', vejetaryen: 'Vejetaryen', glutensiz: 'Glutensiz Seçenek' };
/* Yemek adında görünmeyen alerjenler tercih denetimine bu sözcüklerle girer: pirinç pilavı tereyağlı pişer, vegan üyeye çıkmaz. */
const ALERJEN_METIN = { sut: 'süt', gluten: 'buğday', balik: 'balık', 'kabuklu-deniz': 'karides', yumurta: 'yumurta', susam: 'susam' };
const GRUPLAR = [['il', 'Şehir', 'fa-location-dot'], ['kategori', 'Kategori', 'fa-store'], ['konsept', 'Konsept', 'fa-gem'], ['mutfak', 'Mutfak', 'fa-utensils'], ['fiyat', 'Fiyat', 'fa-coins'], ['beslenme', 'Beslenme', 'fa-leaf']];

const filtreGrup = ([alan, baslik, i], sayilar) => `<div class="filtre-grup acik" data-filtre-grup="${alan}"><button class="filtre-grup-bas" type="button" aria-expanded="true">${ikon(i)} ${baslik} <span class="filtre-grup-sayi" hidden>0</span>${ikon('fa-chevron-down filtre-grup-ok')}</button><div class="filtre-grup-govde">${Object.entries(sayilar).map(([deger, sayi]) => `<label class="filtre-satir"><input type="checkbox" name="${alan}" value="${kac(deger)}"><span class="filtre-kutu"></span><span class="filtre-ad">${kac(FIYAT_AD[deger] ?? BESLENME_AD[deger] ?? deger)}</span><span class="filtre-sayi">${sayi}</span></label>`).join('')}</div></div>`;

function disarida(veri) {
  const d = veri.disarida;
  /* Kalorisi olmayan yemek kartta gösterilmez; görünen her satır kalorisini taşır. */
  const yemekler = (adlar) => adlar.map((ad) => d.yemekler.find((y) => y.ad === ad)).filter((y) => y?.kcal != null);
  const kart = (m) => `<article class="mekan-kart" data-mekan data-il="${kac(m.il)}" data-kategori="${kac(m.kategori)}" data-konsept="${kac(m.konsept)}" data-mutfak="${kac(m.mutfak)}" data-fiyat="${m.fiyat}" data-beslenme="${m.beslenme.join('|')}">
<div class="mekan-kart-gorsel"><img src="${K}${m.gorsel}" alt="${kac(m.ad)} mekanından fotoğraf" loading="lazy"><span class="mekan-kart-fiyat"><b>${m.fiyat}</b>${'₺'.repeat(4 - m.fiyat.length)}</span></div>
<span class="mekan-kart-tur">${kac(m.kategori)}</span>
<h3 class="kart-baslik">${kac(m.ad)}</h3>
<p>${kac(m.ozet)}</p>
<div class="mekan-kart-ornek kart-esnek-alan"><span class="mekan-kart-ornek-baslik">${ikon('fa-fire')} Tahmini kalori</span>${yemekler(m.ornek_yemekler).map((y) => `<span class="mekan-kart-ornek-satir metin-sarar" data-yemek data-tip="${y.diyet_etiketleri.join(' ')}" data-uyum="${kac([y.ad, ...y.alerjenler.map((a) => ALERJEN_METIN[a])].join(' '))}"><span>${kac(y.ad)}, <span>${kac(y.porsiyon.ad)}</span></span><b>≈ ${bicim.kcal(y.kcal)}</b></span>`).join('')}<span class="mekan-kart-ornek-satir metin-sarar" data-yemek-yok hidden><span>Seçimine uygun örnek yok, menüyü mekana sor.</span></span></div>
<div class="mekan-kart-alt"><span class="mekan-kart-konum">${ikon('fa-location-dot')} ${kac(m.ilce)} / ${kac(m.il)}</span></div>
<a class="dugme gourmet-birincil kucuk tam-en" href="https://dadagourmet.com/mekan/${m.slug}" target="_blank" rel="noopener">Dada Gourmet'te gör ${ikon('fa-arrow-up-right-from-square')}</a>
</article>`;
  const panel = `<aside class="filtre-panel" id="dzPanel" aria-label="Filtreler">
<div class="filtre-bas"><h2 class="kart-baslik">${ikon('fa-sliders')} Filtreler</h2><button class="filtre-temizle" type="button" id="dzTemizle">Tümünü Temizle</button><button class="filtre-kapat" type="button" data-filtre-kapat aria-label="Filtre panelini kapat">${ikon('fa-xmark')}</button></div>
<div class="filtre-govde">${GRUPLAR.map((g) => filtreGrup(g, d.gourmet_sayilari[g[0]])).join('')}</div>
<div class="filtre-ayak"><button class="dugme birincil tam-en" type="button" data-filtre-kapat id="dzGoster"></button></div>
</aside><div class="filtre-perde" id="dzPerde" data-filtre-kapat hidden></div>`;
  return sayfa('disarida-ne-yesem', 'Dışarıda Ne Yesem?',
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['Dışarıda Ne Yesem?']], etiket: 'RESTORAN VE MENÜ NAVİGATÖRÜ', etiketIkon: 'fa-location-dot', h1: 'Dışarıda ne yesem?', alt: 'Dada Gourmet mekanlarını gör; her mekanın mutfağında sık bulunan seçimlerin tahmini kalorisini incele.', gorsel: 'assets/img/program/olculu-porsiyon-programi.jpg', sayilar: [[d.sayaclar.mekan, 'Dada Gourmet mekanı'], [d.sayaclar.sehir, 'şehirde mekan'], [d.sayaclar.mutfak, 'mutfak türü']] })
    + dizi(bolum(`<div class="mekan-yerlesim">${panel}
<div class="yigin" id="dzListe"><div class="mekan-ust"><p class="mekan-ozet" id="dzSayac" role="status"></p><button class="dugme birincil kucuk filtre-ac" type="button" id="dzFiltreAc" aria-controls="dzPanel" aria-expanded="false">${ikon('fa-sliders')} Filtrele <span class="filtre-ac-sayi" id="dzFiltreSayi" hidden>0</span></button></div>
<div class="mekan-izgara izgara-esit-satir" id="dzKartlar" data-toplam="${d.sayaclar.mekan}">${d.mekan_ornekleri.map(kart).join('')}</div>
<div class="bos-durum kart-ici" id="dzBos" hidden><span class="bos-ikon">${ikon('fa-location-dot')}</span><h3>Bu süzgeçlere uyan mekan yok</h3><p>Bir süzgeci kaldır ya da başka bir şehir seç.</p><button class="dugme birincil" type="button" id="dzBosTemizle">Süzgeçleri temizle</button></div>
<nav class="sayfalama" aria-label="Sayfalar" id="dzSayfalama" hidden></nav>
<p class="alan-yardim"><span>Mekan bilgileri ve görseller Dada Gourmet'ten gelir. Menüler henüz yayımlanmadığı için kalori örnekleri o mutfakta sık bulunan yemeklerdir, değerleri tahminidir (kaynak: Dada Diet besin veritabanı). Sayılar Dada Gourmet'teki tüm mekanları gösterir, bu önizlemede örnek kartlar listelenir.</span></p>
<div class="yigin sik"><h2 class="kart-baslik">Dışarıda yemek rehberleri</h2><div class="cipler">${REHBER.map((r) => `<a class="cip" href="${K}${DETAY.rehber}">${r}</a>`).join('')}</div></div>
${bilgiNot('Bu sayfadaki değerler <b>tahminidir</b> ve genel bilgilendirme amaçlıdır; <b>tıbbi teşhis veya tedavi yerine geçmez</b>. Alerjin ya da klinik bir durumun varsa siparişten önce mekana danış.', false)}
</div></div>`, { ilk: true })), { ...A, onJs: ['assets/js/tercih-uyum.js'], js: ['disarida'] });
}

export default ({ veri }) => [disarida(veri)];
