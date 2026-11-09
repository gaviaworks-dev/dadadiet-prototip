// Bildirimler: Gastro g-bildirimler iskeleti (bant + okunmamış rozeti, ortalı Tümü/kategori süzgeci, gün grupları, satır işlemleri, alt not). Zil açılır panel açmaz, bu sayfaya gelir. Satır ve veri assets/js/bildirim-zili.js.
const K = '{{kok}}';

const govde = `<section class="bant nt-top"><div class="wrap kap">
<nav class="kirinti" aria-label="Sayfa yolu"><a class="kirinti-ev" href="${K}"><i class="fa-solid fa-house" aria-hidden="true"></i><span class="yalniz-okuyucu">Dada Diet ana sayfa</span></a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><a href="${K}hesabim/">Hesabım</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><span class="kirinti-simdi">Bildirimler</span></nav>
<div class="bant-bas"><div><h1>Bildirimler <span class="rozet sayac" id="bnRozet" hidden></span></h1><p class="bant-alt">Randevu, mesaj, program ve sistem bildirimlerinin hepsi tek akışta.</p></div>
<div class="bant-araclar"><button class="dugme orta cam" type="button" id="bnHepsi"><i class="fa-solid fa-check-double" aria-hidden="true"></i> Tümünü Okundu İşaretle</button><a class="dugme orta cam ikon" href="${K}hesabim/ayarlar/#bildirim" aria-label="Bildirim ayarları" title="Bildirim ayarları"><i class="fa-solid fa-gear" aria-hidden="true"></i></a></div></div>
</div></section>
<section class="bolum bildirim-govde dikis bant-ustunde"><div class="wrap kap">
<div class="bildirim-kolonu bildirim-suzgec"><div class="cipler ortali tek-satir" id="bnSuzgec" role="group" aria-label="Bildirim türü" data-suzgec></div></div>
<div class="bildirim-kolonu">
<div class="geri-al" id="bnGeri" role="status" hidden><span id="bnGeriMetin"></span><button type="button" id="bnGeriDugme">Geri al</button></div>
<div id="bnListe"></div>
<div class="bos-durum buyuk" id="bnBos" hidden><span class="bos-ikon"><i class="fa-solid fa-bell-slash" aria-hidden="true"></i></span><h3></h3><p></p><a class="dugme birincil" id="bnBosEylem" href="${K}programlar/"><i class="fa-solid fa-clipboard-list" aria-hidden="true"></i> Programları Keşfet</a></div>
<div class="alt-not ortali"><i class="fa-solid fa-gear" aria-hidden="true"></i> Bildirim tercihlerini <a href="${K}hesabim/ayarlar/#bildirim">Hesap Ayarları › Bildirimler</a>'den yönetebilirsin.</div>
</div>
</div></section>`;

export default () => [{
  yol: 'hesabim/bildirimler',
  meta: { baslik: 'Bildirimler', duzen: 'uye', hero: true, js: ['assets/js/sayfa/uye-ortak.js', 'assets/js/sayfa/uye-bildirimler.js'] },
  govde,
}];
