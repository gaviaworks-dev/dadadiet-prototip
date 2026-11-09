import { uyeSayfa, kart, tablo } from '../../parcalar/uye/ust.mjs';

export default ({ veri }) => {
  const katalog = {
    programlar: Object.fromEntries(veri.programlar.programlar.map((p) => [p.slug, p.ad])),
    rehberler: Object.fromEntries(veri.rehberler.rehberler.map((r) => [r.slug, r.ad ?? r.baslik])),
    diyetisyenler: Object.fromEntries((Array.isArray(veri.diyetisyenler) ? veri.diyetisyenler : veri.diyetisyenler.diyetisyenler || []).map((d) => [d.slug, d.ad])),
    // Bana Uygun Olanı Bul önerisi: slug sihirbazdaki amaç; ad ve yol sihirbazın birincil rotasıyla aynı
    yonlendirmeler: { bilgi: ['Besin Rehberi önerisi', 'besin-rehberi/'], hesap: ['Günlük Kalori İhtiyacı önerisi', 'hesaplayici/gunluk-kalori/'], program: ['Program Bul önerisi', 'programlar/program-bul/'], uzman: ['Diyetisyen Bul önerisi', 'diyetisyen-bul-sihirbazi/'] },
  };
  const govde = `<div class="yigin">
<div class="cipler" id="kdSuzgec" role="group" aria-label="İçerik türü" data-suzgec></div>
${kart({ ikon: 'fa-bookmark', baslik: 'Kaydettiklerin', bosluksuz: true, govde: tablo({ id: 'kdListe', etiket: 'Kaydedilen içerikler', basliklar: ['İçerik', ['Tür', 'dar-kolon'], ['Kaydedildi', 'dar-kolon'], ['İşlem', 'eylem-kolon']] }) })}
</div>
<script type="application/json" id="kdKatalog">${JSON.stringify(katalog).replace(/</g, '\\u003c')}</script>`;
  return [uyeSayfa({
    yol: 'hesabim/kaydedilenler', ad: 'Kaydedilenler', aktif: 'hesabim/programlarim/', ust: [['Programlarım', 'hesabim/programlarim/']],
    giris: 'Kaydettiğin besinler, programlar, rehberler, diyetisyenler ve önerilerin tek listede.',
    govde, js: ['assets/js/sayfa/uye-kaydedilenler.js'],
  })];
};
