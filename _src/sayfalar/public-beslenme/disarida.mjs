// Dışarıda Ne Yesem.
import { K, kac, ikon, bant, bolum, DETAY, sayfa, dizi, bilgiNot, cipler, akordeon } from '../../parcalar/public-beslenme/ortak.mjs';
import { bicim } from '../../parcalar/bicim.mjs';

const A = { aktif: 'Beslenme' };

const HEDEF_ETIKET = (n) => `≤ ${n} kcal`;
const TIP = [['Vejetaryen', 'vejetaryen'], ['Vegan ve Bitkisel', 'bitkisel'], ['Glütensiz', 'glutensiz'], ['Protein Ağırlıklı', 'yuksek-protein'], ['Düşük Karbonhidrat', 'dusuk-karbonhidrat']];
const ALERJEN = [['Gluten', 'gluten'], ['Kabuklu deniz ürünleri', 'kabuklu-deniz'], ['Yumurta', 'yumurta'], ['Balık', 'balik'], ['Süt', 'sut'], ['Susam', 'susam']];
const SEHIR = [['İstanbul', 88], ['Muğla', 34], ['Antalya', 25], ['İzmir', 22], ['Nevşehir', 16], ['Ankara', 8]];
const REHBER = ['Restoran menüsü nasıl okunur?', 'Paket siparişte neler değişir?', 'Hızlı servis restoranında seçim nasıl yapılır?', 'Seyahatte öğün düzeni nasıl kurulur?', 'Davet sofrasında porsiyon nasıl yönetilir?', 'Dışarıda kahvaltı nasıl seçilir?'];

function disarida(veri) {
  const d = veri.disarida;
  const yemek = (ad) => d.yemekler.find((y) => y.ad === ad);
  const mutfaklar = [...new Set(d.mekan_ornekleri.map((m) => m.mutfak))];
  const grup = (b, html) => `<div class="suzgec-grup"><h3 class="alan-etiket">${b}</h3>${html}</div>`;
  const filtre = `<div class="suzgec-yigin">
${grup('Şehir', `<label class="yalniz-okuyucu" for="dzSehir">Şehir seç</label><select class="alan-secim" id="dzSehir">${SEHIR.map(([a, s]) => `<option value="${a}" data-sayi="${s}">${a} (${s})</option>`).join('')}</select>`)}
${grup('Öğün hedefi', cipler('hedef', 'Öğün hedefi', [{ ad: 'Tümü', deger: '' }, ...d.kalori_hedefleri.map((n) => ({ ad: HEDEF_ETIKET(n), deger: String(n) }))], { sinif: '' }))}
${grup('Beslenme tipi', cipler('tip', 'Beslenme tipi', [{ ad: 'Tümü', deger: '' }, ...TIP.map(([a, v]) => ({ ad: a, deger: v }))], { sinif: '' }))}
${grup('Alerjiler', `<div class="cipler" data-coklu-secim id="dzAlerji" role="group" aria-label="Alerjiler">${ALERJEN.map(([a, v]) => `<button class="cip" type="button" data-deger="${v}" aria-pressed="false">${a}</button>`).join('')}</div>`)}
${grup('Mutfak', cipler('mutfak', 'Mutfak', [{ ad: 'Tümü', deger: '' }, ...mutfaklar.map((m) => ({ ad: m, deger: m }))], { sinif: '' }))}
<button class="dugme hayalet kucuk tam-en" type="button" id="dzTemizle">Tümünü Temizle</button>
</div>`;
  const kart = (m) => `<article class="kart" data-mekan data-mutfak="${kac(m.mutfak)}">
<div class="kart-bas"><div class="kart-bas-sol"><span class="ikon-kutu">${ikon('fa-utensils')}</span><div><h3 class="kart-baslik">${kac(m.ad)}</h3><p>${kac(m.etiket)}</p></div></div><span class="rozet olumlu">${kac(m.mutfak)}</span></div>
<div class="kart-govde yigin sik"><h4 class="alan-etiket">Programına uygun örnekler</h4><ul class="ozellik-liste">${m.ornek_yemekler.map(yemek).map((y) => `<li data-yemek data-kcal="${y.kcal}" data-tip="${y.diyet_etiketleri.join(' ')}" data-alerjen="${y.alerjenler.join(' ')}">${ikon('fa-check')}<span>${kac(y.ad)} · ${kac(y.porsiyon.ad)}</span><span>≈ ${bicim.kcal(y.kcal)}</span></li>`).join('')}</ul></div>
<div class="kart-alt"><span class="not">Fiyat ${m.fiyat}</span><a class="dugme hayalet kucuk" href="https://dadagourmet.com" target="_blank" rel="noopener">Dada Gourmet'te gör ${ikon('fa-arrow-up-right-from-square')}</a></div></article>`;
  return sayfa('disarida-ne-yesem', 'Dışarıda Ne Yesem?',
    bant({ yol: [['Beslenme', 'besin-rehberi/'], ['Dışarıda Ne Yesem?']], etiket: 'RESTORAN VE MENÜ NAVİGATÖRÜ', etiketIkon: 'fa-location-dot', h1: 'Dışarıda ne yesem?', alt: 'Dada Gourmet mekanlarını gör; her mekanın mutfağında programına uyan örnek seçimleri ve tahmini kalorilerini incele.', gorsel: 'assets/img/program/olculu-porsiyon-programi.jpg', sayilar: [[d.sayaclar.mekan, 'Dada Gourmet mekanı'], [d.sayaclar.sehir, 'şehirde mekan'], [d.sayaclar.mutfak, 'mutfak türü']] })
    + dizi(bolum(`<div class="iki-kolon sol-yan">
<aside class="yapiskan" aria-label="Filtreler">${akordeon([{ soru: 'Filtreler', ikon: 'fa-sliders', acik: 'genis', govde: filtre }])}</aside>
<div class="yigin" id="dzListe"><p class="sonuc-not-kisa" id="dzSayac" role="status"></p><p class="alan-yardim"><span>Bu mekanların menüsü Dada Gourmet'te yayımlanmadı; örnekler bu mutfakta sık bulunan yemeklerdir ve değerleri tahminidir (kaynak: Dada Diet besin veritabanı).</span></p>
<div class="kart-izgara c2" id="dzKartlar">${d.mekan_ornekleri.map(kart).join('')}</div>
<div class="bos-durum kart-ici" id="dzBos" hidden><span class="bos-ikon">${ikon('fa-location-dot')}</span><h3 id="dzBosBaslik">Bu süzgeçlere uyan mekan yok</h3><p id="dzBosMetin">Öğün hedefini yükselt ya da bir süzgeci kaldır.</p><button class="dugme birincil" type="button" id="dzBosTemizle">Süzgeçleri temizle</button></div>
<div class="yigin sik"><h2 class="kart-baslik">Dışarıda yemek rehberleri</h2><div class="cipler">${REHBER.map((r) => `<a class="cip" href="${K}${DETAY.rehber}">${r}</a>`).join('')}</div></div>
${bilgiNot('Bu sayfadaki değerler <b>tahminidir</b> ve genel bilgilendirme amaçlıdır; <b>tıbbi teşhis veya tedavi yerine geçmez</b>. Alerjin ya da klinik bir durumun varsa siparişten önce mekana danış.', false)}
</div></div>`, { ilk: true })), { ...A, js: ['disarida'] });
}

export default ({ veri }) => [disarida(veri)];
