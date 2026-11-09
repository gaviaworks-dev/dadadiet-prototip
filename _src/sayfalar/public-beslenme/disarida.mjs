// Dışarıda Ne Yesem: kart ve sol süzgeç dadagourmet.com/mekanlar kalıbıyla kurulur (grup sırası MekanFiltrePaneliServisi). Puan, görüntülenme ve süzgeç üyelikleri Gourmet yayınından okunur.
import { K, kac, ikon, bant, bolum, DETAY, sayfa, dizi, bilgiNot } from '../../parcalar/public-beslenme/ortak.mjs';

const A = { aktif: 'Beslenme' };
const REHBER = ['Restoran menüsü nasıl okunur?', 'Paket siparişte neler değişir?', 'Hızlı servis restoranında seçim nasıl yapılır?', 'Seyahatte öğün düzeni nasıl kurulur?', 'Davet sofrasında porsiyon nasıl yönetilir?', 'Dışarıda kahvaltı nasıl seçilir?'];
const GOURMET = 'https://dadagourmet.com/mekan/';
/* Gourmet'in uzun grup kuralı: ilk 6 seçenek görünür, gerisi "N … daha" ile açılır. */
const GORUNUR = 6;
const DAHA_AZ = 'Daha az göster';

const satir = (alan, s, i, ek = '') => `<label class="filtre-satir${i >= GORUNUR ? ' fazla' : ''}"${ek}><input type="checkbox" name="${alan}" value="${kac(s.deger)}" data-etiket="${kac(s.etiket)}"><span class="filtre-kutu"></span><span class="filtre-ad">${s.yildiz ? ikon('fa-star filtre-yildiz') : ''}${kac(s.etiket)}${s.ek ? ` <span class="filtre-ek">(${s.ek})</span>` : ''}</span><span class="filtre-sayi"></span></label>`;
const dahaDugme = (metin, gizli = false) => `<button class="filtre-daha" type="button" data-daha="${kac(metin)}" data-az="${DAHA_AZ}"${gizli ? ' hidden' : ''}><span>${kac(metin)}</span> ${ikon('fa-chevron-down')}</button>`;
const grupBas = (baslik, i) => `<button class="filtre-grup-bas" type="button" aria-expanded="true">${i ? `${ikon(i)} ` : ''}${baslik} <span class="filtre-grup-sayi" hidden>0</span>${ikon('fa-chevron-down filtre-grup-ok')}</button>`;

const filtreGrup = (g) => `<div class="filtre-grup acik" data-filtre-grup="${g.anahtar}">${grupBas(g.baslik, g.ikon)}<div class="filtre-grup-govde">${g.secenekler.map((s, i) => satir(g.anahtar, s, i)).join('')}${g.daha ? dahaDugme(g.daha) : ''}</div></div>`;

/* Konumun Şehir, İlçe, Semt kırılımı: ilçe yalnız şehir, semt yalnız ilçe seçilince görünür; satırların sırasını ve görünürlüğünü sayfa betiği kurar. */
const altGrup = (alan, baslik, ara, satirlar) => `<div class="filtre-grup filtre-alt-grup acik" data-konum-grup="${alan}"${alan === 'il' ? '' : ' hidden'}>${grupBas(baslik)}<div class="filtre-grup-govde"><label class="filtre-ara" hidden><span class="sr-only">${ara}</span>${ikon('fa-magnifying-glass')}<input type="search" placeholder="${ara}" autocomplete="off"></label>${satirlar}<p class="filtre-bos" hidden>Eşleşen konum yok.</p>${dahaDugme('Tümünü gör', true)}</div></div>`;

function konumGrubu(s) {
  const adlar = Object.fromEntries(s.iller.map((il) => [il.deger, il.etiket]));
  const ilceler = Object.entries(s.ilceler).flatMap(([il, liste]) => liste.map((x) => satir('ilce', x, 0, ` data-ust="${il}" data-il-ad="${kac(adlar[il])}" hidden`)));
  const semtler = Object.entries(s.semtler).flatMap(([ilce, liste]) => liste.map((x) => satir('semt', x, 0, ` data-ust="${ilce}" hidden`)));
  return `<div class="filtre-grup acik" data-filtre-grup="konum">${grupBas('Konum', 'fa-location-dot')}<div class="filtre-grup-govde">
<label class="sr-only" for="dzUlke">Ülke</label><select class="alan-secim filtre-ulke" id="dzUlke">${s.ulkeler.map(([kod, ad]) => `<option value="${kod}"${kod === 'TR' ? ' selected' : ''}>${kac(ad)}</option>`).join('')}</select>
<label class="filtre-satir"><input type="checkbox" id="dzYakin"><span class="filtre-kutu"></span><span class="filtre-ad">Yakınımdakileri göster</span></label>
${altGrup('il', 'Şehir', 'Şehir ara', s.iller.map((x, i) => satir('il', x, i)).join(''))}${altGrup('ilce', 'İlçe', 'İlçe ara', ilceler.join(''))}${altGrup('semt', 'Semt', 'Semt ara', semtler.join(''))}
</div></div>`;
}

/* S5-4: Gourmet /mekanlar "Mekân konseptine göre keşfet" şeridi ve "Yakınımdaki mekanlar" çubuğunun Diet karşılığı.
   Konsept kartı çoklu seçimdir (aria-pressed), Tümü seçimi temizler; sayılar sol süzgeçlerle kesişimden sayfa betiğinde yenilenir. */
const konseptKart = (deger, etiket, i, sayi, secili = false) => `<button class="konsept-kart" type="button" data-konsept="${deger}" aria-pressed="${secili}"><span class="konsept-ikon">${ikon(i)}</span><span class="konsept-metin"><b>${kac(etiket)}</b><span data-konsept-sayi>${sayi} mekan</span></span></button>`;

function konseptSerit(d) {
  const l = d.mekan_ornekleri;
  const kartlar = konseptKart('', 'Tümü', 'fa-border-all', l.length, true)
    + d.diet_konseptler.map((k) => konseptKart(k.deger, k.etiket, k.ikon, l.filter((m) => m.diet_konsept.includes(k.deger)).length)).join('');
  return `<div class="konsept-serit"><div class="konsept-serit-bas"><h2 class="kart-baslik" id="dzKonseptBaslik">Beslenme Konseptine Göre Keşfet</h2><span class="konsept-serit-not">Seçim soldaki filtrelerle birlikte çalışır</span></div>
<div class="ray-kap" data-ray><button class="ray-ok geri" type="button" aria-label="Geri kaydır" hidden>${ikon('fa-chevron-left')}</button><div class="kart-ray konsept-ray" id="dzKonseptler" role="group" aria-labelledby="dzKonseptBaslik" data-surukle>${kartlar}</div><button class="ray-ok ileri" type="button" aria-label="İleri kaydır">${ikon('fa-chevron-right')}</button></div></div>`;
}

/* Mesafe kurgu bir konuma göre örnektir; konum izni istenmez. Varsayılan en üst değerdir, bütün mekanlar listede kalır. */
const mesafeCubuk = ({ min, max, adim }) => `<div class="mesafe-cubuk"><label class="mesafe-etiket" for="dzMesafe">${ikon('fa-location-crosshairs')} Yakınımdaki mekanlar · <b id="dzMesafeDeger">${max} km</b></label>
<div class="mesafe-ray"><div class="mesafe-iz"><div class="mesafe-dolgu"></div></div><input type="range" id="dzMesafe" min="${min}" max="${max}" step="${adim}" value="${max}" aria-valuetext="En fazla ${max} km"></div>
<span class="mesafe-uc">en fazla ${max} km</span><span class="mesafe-not">Prototip örneği: konseptler ve mesafeler örnek veridir, konum izni istenmez.</span></div>`;

/* Puanı olmayan mekanda Gourmet'in boş hâli: soluk yıldız ve tire, sahte 0.0 yazılmaz. */
/* Puanı olmayan mekanda yıldız da çıkmaz; yalnız görüntülenme kalır. */
const puan = (p) => (p == null ? '' : `<span class="mekan-kart-puan">${ikon('fa-star')} ${p.toFixed(1)}</span>`);

function disarida(veri) {
  const d = veri.disarida;
  const s = d.gourmet_suzgec;
  const alanlar = s.gruplar.map((g) => g.anahtar);
  /* Sayfa Revizesi 1, D1-D2: kartta tahmini kalori kutusu ve "prototip örneği" etiketi yok. Örnek yemek verisi (disarida.yemekler) yerinde kalır. */
  const kart = (m) => `<article class="mekan-kart" data-mekan data-il="${m.suzgec.il}" data-ilce="${m.suzgec.ilce}" data-semt="${m.suzgec.semt}" ${alanlar.map((a) => `data-${a}="${m.suzgec[a].join('|')}"`).join(' ')} data-diet-konsept="${m.diet_konsept.join('|')}" data-mesafe="${m.mesafe_km}" data-enlem="${m.enlem}" data-boylam="${m.boylam}" data-saatler="${kac(JSON.stringify(m.saatler))}">
<div class="mekan-kart-gorsel"><img src="${K}${m.gorsel}" alt="${kac(m.ad)} mekanından fotoğraf" loading="lazy"><span class="mekan-kart-fiyat"><b>${m.fiyat}</b>${'₺'.repeat(4 - m.fiyat.length)}</span></div>
<span class="mekan-kart-tur">${kac(m.kategori)}</span>
<h3 class="kart-baslik"><a class="kart-tam-baglanti" href="${GOURMET}${m.slug}" target="_blank" rel="noopener">${kac(m.ad)}<span class="sr-only"> (Dada Gourmet'te yeni sekmede açılır)</span></a></h3>
<p>${kac(m.ozet)}</p>
<div class="mekan-kart-alt"><span class="mekan-kart-konum">${ikon('fa-location-dot')} ${kac(m.ilce)} / ${kac(m.il)}</span><span class="mekan-kart-olcum">${puan(m.puan)}<span class="mekan-kart-goruntulenme" role="img" aria-label="${m.goruntulenme} görüntülenme">${ikon('fa-eye')} <span aria-hidden="true">${m.goruntulenme}</span></span></span></div>
</article>`;
  const panel = `<aside class="filtre-panel" id="dzPanel" aria-label="Filtreler">
<div class="filtre-bas"><h2 class="kart-baslik">${ikon('fa-sliders')} <span class="yalniz-genis">Filtreler</span><span class="yalniz-dar">Filtrele</span></h2><button class="filtre-temizle" type="button" id="dzTemizle"><span class="yalniz-genis">Tümünü Temizle</span><span class="yalniz-dar">Temizle</span></button><button class="filtre-kapat" type="button" data-filtre-kapat aria-label="Filtre panelini kapat">${ikon('fa-xmark')}</button></div>
<div class="filtre-govde">${konumGrubu(s)}${s.gruplar.map(filtreGrup).join('')}</div>
<div class="filtre-ayak"><button class="dugme birincil tam-en" type="button" data-filtre-kapat id="dzGoster"></button></div>
</aside><div class="filtre-perde" id="dzPerde" data-filtre-kapat hidden></div>`;
  return sayfa('disarida-ne-yesem', 'Dışarıda Ne Yesem?',
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['Dışarıda Ne Yesem?']], etiket: 'RESTORAN VE MENÜ NAVİGATÖRÜ', etiketIkon: 'fa-location-dot', h1: 'Dışarıda ne yesem?', alt: 'Dada Gourmet mekanlarını şehre, mutfağa ve beslenme seçeneklerine göre süz; seçtiğin mekanın detayını Dada Gourmet\'te aç.', gorsel: 'assets/img/program/olculu-porsiyon-programi.jpg', sayilar: [[d.sayaclar.mekan, 'Dada Gourmet mekanı'], [d.sayaclar.sehir, 'şehirde mekan'], [d.sayaclar.mutfak, 'mutfak türü']] })
    + dizi(bolum(`${konseptSerit(d)}
${mesafeCubuk(d.mesafe)}
<div class="mekan-yerlesim">${panel}
<div class="yigin" id="dzListe"><div class="mekan-ust"><p class="mekan-ozet" id="dzSayac" role="status"></p><button class="dugme birincil kucuk filtre-ac" type="button" id="dzFiltreAc" aria-controls="dzPanel" aria-expanded="false">${ikon('fa-sliders')} Filtrele <span class="filtre-ac-sayi" id="dzFiltreSayi" hidden>0</span></button></div>
<div class="filtre-cipler" id="dzCipler" aria-label="Aktif filtreler" hidden></div>
<div data-kisisel></div>
<div class="mekan-izgara izgara-esit-satir" id="dzKartlar">${d.mekan_ornekleri.map(kart).join('')}</div>
<div class="bos-durum kart-ici" id="dzBos" hidden><span class="bos-ikon">${ikon('fa-location-dot')}</span><h3>Bu filtreyle henüz mekan yok</h3><p>Seçimlerini azaltmayı dene ya da seçili filtreleri temizle.</p><button class="dugme birincil" type="button" id="dzBosTemizle">Seçili Filtreleri Temizle</button></div>
<nav class="sayfalama" aria-label="Sayfalar" id="dzSayfalama" hidden></nav>
<p class="alan-yardim"><span>Mekan bilgileri ve görseller Dada Gourmet'ten gelir. Görüntülenme sayısı prototip örneğidir: Dada Gourmet'te 7 Kasım 2026'da görünen değerdir. Henüz değerlendirme almamış mekanda puan gösterilmez. Bu önizlemede Dada Gourmet'teki ${d.sayaclar.mekan} mekandan ${d.mekan_ornekleri.length} tanesi listelenir, süzgeç sayıları bu kartları sayar.</span></p>
<div class="yigin sik"><h2 class="kart-baslik">Dışarıda Yemek Rehberleri</h2><div class="cipler">${REHBER.map((r) => `<a class="cip" href="${K}${DETAY.rehber}">${r}</a>`).join('')}</div></div>
${bilgiNot('Bu sayfa genel bilgilendirme amaçlıdır; <b>tıbbi teşhis veya tedavi yerine geçmez</b>. Alerjin ya da klinik bir durumun varsa siparişten önce mekana danış.', false)}
</div></div>`, { ilk: true })), { ...A, onJs: ['assets/js/misafir.js', 'assets/js/yatay-kaydir.js', 'assets/js/sayfa/public-araclar-ray.js'], js: ['disarida', 'kisisel'] });
}

export default ({ veri }) => [disarida(veri)];
