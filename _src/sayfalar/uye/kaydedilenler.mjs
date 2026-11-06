import { uyeSayfa, kart, tablo } from '../../parcalar/uye/ust.mjs';

export default ({ veri }) => {
  const katalog = {
    programlar: Object.fromEntries(veri.programlar.programlar.map((p) => [p.slug, p.ad])),
    rehberler: Object.fromEntries(veri.rehberler.rehberler.map((r) => [r.slug, r.ad ?? r.baslik])),
  };
  const govde = `<div class="yigin">
<div class="cipler" id="kdSuzgec" role="group" aria-label="İçerik türü" data-suzgec></div>
${kart({ bosluksuz: true, govde: tablo({ id: 'kdListe', etiket: 'Kaydedilen içerikler', basliklar: ['İçerik', ['Tür', 'dar-kolon'], ['İşlem', 'eylem-kolon']] }) })}
</div>
<script type="application/json" id="kdKatalog">${JSON.stringify(katalog).replace(/</g, '\\u003c')}</script>`;
  return [uyeSayfa({
    yol: 'hesabim/kaydedilenler', ad: 'Kaydedilenler', aktif: 'hesabim/programlarim/', ust: [['Programlarım', 'hesabim/programlarim/']],
    giris: 'Kaydettiğin besinler, programlar ve rehberler tek listede.',
    govde, js: ['assets/js/sayfa/uye-kaydedilenler.js'],
  })];
};
