import { uyeSayfa, dugme } from '../../parcalar/uye/ust.mjs';

const govde = `<div class="yigin">
<div class="bildirim-suzgec"><div class="cipler tek-satir" id="bnSuzgec" role="group" aria-label="Bildirim türü" data-suzgec></div></div>
<div id="bnListe"></div>
</div>`;

export default () => [uyeSayfa({
  yol: 'hesabim/bildirimler', ad: 'Bildirimler', aktif: 'hesabim/',
  giris: '<span id="bnOzet"></span>',
  eylem: dugme('Bildirim ayarları', { ikon: 'fa-sliders', href: 'hesabim/ayarlar/#bildirim' }) + dugme('Tümünü okundu işaretle', { sinif: 'birincil', ikon: 'fa-check-double', ek: ' id="bnHepsi"' }),
  govde, js: ['assets/js/sayfa/uye-bildirimler.js'],
})];
