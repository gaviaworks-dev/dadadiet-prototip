import { uyeSayfa, dugme } from '../../parcalar/uye/ust.mjs';

const govde = `<div class="bildirim-kolonu">
<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid fa-bell" aria-hidden="true"></i> <span id="bnOzet"></span></span><h2>Bildirimlerin</h2><p class="giris-metni">Randevu, mesaj, program ve rozet hareketlerin tek akışta.</p><div class="bolum-araclar">${dugme('Bildirim ayarları', { ikon: 'fa-gear', href: 'hesabim/#bildirim' })}${dugme('Tümünü Okundu İşaretle', { sinif: 'birincil', ikon: 'fa-check-double', ek: ' id="bnHepsi"' })}</div></div></div>
<div class="bildirim-suzgec"><div class="cipler tek-satir" id="bnSuzgec" role="group" aria-label="Bildirim türü" data-suzgec></div></div>
<div id="bnListe"></div>
</div>`;

export default () => [uyeSayfa({
  yol: 'hesabim/bildirimler', ad: 'Bildirimler', muhur: 'Bildirimlerin · kişisel alanın', ikon: 'fa-bell',
  giris: 'Randevu, mesaj, program ve rozet hareketlerin; hepsi tek akışta.',
  govde, js: ['assets/js/sayfa/uye-bildirimler.js'],
})];
