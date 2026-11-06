// 404: kanon .bant + .durum-* (lead kök 404.html olarak kopyalar).
import { K, JS, ikon, kirinti } from '../../parcalar/public-araclar/ortak.mjs';

const CIKIS = [['', 'fa-house', 'Ana sayfa', 'Hesaplayıcılar, besinler ve programlar için başlangıç noktası.'], ['besin-kutuphanesi/', 'fa-carrot', 'Besin Kütüphanesi', 'Kalori, makro ve porsiyon bilgisi tek yerde.'], ['sayfa/cozum-merkezi/', 'fa-headset', 'Çözüm Merkezi', 'Sık sorulanlar ve destek talebi. Kırık bağlantıyı buradan bildirebilirsin.']];
const SIK = [['programlar/', 'fa-list-check', 'Programlar'], ['hesaplayicilar/', 'fa-calculator', 'Hesaplayıcılar'], ['diyetisyen-bul-sihirbazi/', 'fa-user-check', 'Diyetisyen Bul'], ['besin-rehberi/', 'fa-book-open', 'Besin Rehberi'], ['saglik-testleri/', 'fa-clipboard-question', 'Sağlık Testleri'], ['tarifler/', 'fa-utensils', 'Sağlıklı Tarifler']];

export default () => [{
  yol: '404', meta: { baslik: 'Sayfa bulunamadı', duzen: 'public', hero: true, js: [JS] },
  govde: `<section class="bant"><div class="kap">${kirinti(['Sayfa bulunamadı'])}<span class="ust-etiket">${ikon('fa-magnifying-glass')} 404</span><h1>Bu sayfayı bulamadık</h1><p class="bant-alt">Aradığın sayfa taşınmış, adı değişmiş ya da hiç eklenmemiş olabilir. Keşfedilecek başka içerik var.</p></div></section>
<section class="bolum dikis bant-ustunde"><div class="kap durum-kolon">
<div class="durum-giris"><div class="durum-ikon">${ikon('fa-compass')}</div><div><h2>Ne aradığını yaz, oradan devam edelim</h2><p>Hesaplayıcılar, besinler, programlar, rehberler ve diyetisyenler aranabilir. Aklındaki kelimeyi yazman yeterli.</p></div></div>
<form class="durum-arama" action="${K}arama/" method="get" role="search"><label for="durumAra" class="yalniz-okuyucu">Site içinde ara</label><input id="durumAra" name="q" type="search" placeholder="Ne arıyordun? Örn. yulaf ezmesi" autocomplete="off"><button class="dugme birincil" type="submit">${ikon('fa-magnifying-glass')} Ara</button></form>
<div class="durum-blok"><h3>Ya da buralardan birine geç</h3><ul class="durum-cikis">${CIKIS.map(([h, i, a, m]) => `<li><a href="${K}${h}">${ikon(i)} <span><b>${a}</b><small>${m}</small></span></a></li>`).join('')}</ul></div>
<div class="durum-blok"><h3>Sık gidilen sayfalar</h3><ul class="durum-sik">${SIK.map(([h, i, a]) => `<li><a href="${K}${h}">${ikon(i)} ${a}</a></li>`).join('')}</ul></div>
</div></section>`,
}];
