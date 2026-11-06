import { uyeSayfa, kart, dugme } from '../../parcalar/uye/ust.mjs';

export default ({ veri }) => {
  const ornek = veri.programlar.gun_ornegi;
  const katalog = veri.programlar.programlar.map(({ slug, ad, aciklama, sure_gun, enerji, zorluk }) => ({ slug, ad, aciklama, sure_gun, enerji, zorluk, ...(slug === ornek.slug ? { ornekGunler: ornek.gunler } : {}) }));
  const govde = `<div class="yigin" id="pbKap">
<div class="bilgi-notu" id="pbBildirim" hidden><i class="fa-solid fa-circle-check" aria-hidden="true"></i><p id="pbBildirimMetin"></p></div>
<div id="pbBas"></div>
${kart({ ikon: 'fa-chart-line', baslik: 'Programa uyum durumun', metin: 'Uyum, tamamlanan öğünlerin planlanan öğünlere oranıdır.', govde: '<div id="pbUyum"></div>' })}
${kart({
    ikon: 'fa-utensils', baslik: 'Bugünün öğünleri', metin: '<span id="pbOzet"></span>', bosluksuz: true,
    govde: '<div class="kalem-liste" id="pbOgunler"></div>',
    alt: `${dugme('Programlarım', { href: 'hesabim/programlarim/' })}${dugme('Günlük takip', { ikon: 'fa-clipboard-list', href: 'hesabim/gunluk-takibim/' })}${dugme('Planıma git', { sinif: 'birincil', ikon: 'fa-arrow-right', href: 'hesabim/beslenme-planim/#ogun' })}`,
  })}
</div>
<script type="application/json" id="programKatalog">${JSON.stringify(katalog).replace(/</g, '\\u003c')}</script>`;
  return [uyeSayfa({
    yol: 'hesabim/program-baslat', ad: 'Program Başlat', aktif: 'hesabim/programlarim/', ust: [['Programlarım', 'hesabim/programlarim/']],
    giris: 'Seçtiğin program beslenme planına eklenir; bugünün öğünleri hemen hazır olur.',
    govde, js: ['assets/js/sayfa/uye-program-baslat.js'],
  })];
};
