import { uyeSayfa, bolumBas, kart, tablo } from '../../parcalar/uye/ust.mjs';

export default ({ veri }) => {
  const katalog = {
    programlar: Object.fromEntries(veri.programlar.programlar.map((p) => [p.slug, p.ad])),
    rehberler: Object.fromEntries(veri.rehberler.rehberler.map((r) => [r.slug, r.ad ?? r.baslik])),
  };
  const govde = `<div class="yigin">
${bolumBas({ etiket: 'Sonra dönmek için', ikon: 'fa-bookmark', baslik: 'Kaydettiğin içerikler', metin: 'Kartlardaki Kaydet düğmesiyle eklediklerin burada; buradan çıkarabilirsin.' })}
<div class="cipler" id="kdSuzgec" role="group" aria-label="İçerik türü" data-suzgec></div>
${kart({ bosluksuz: true, govde: tablo({ id: 'kdListe', etiket: 'Kaydedilen içerikler', basliklar: ['İçerik', ['Tür', 'dar-kolon'], ['İşlem', 'eylem-kolon']] }) })}
</div>
<script type="application/json" id="kdKatalog">${JSON.stringify(katalog).replace(/</g, '\\u003c')}</script>`;
  return [uyeSayfa({
    yol: 'hesabim/kaydedilenler', ad: 'Kaydedilenler', muhur: 'Kaydettiklerin · kişisel alanın', ikon: 'fa-bookmark',
    giris: 'Kaydettiğin tarifler, besinler, programlar ve rehberler tek listede.',
    govde, js: ['assets/js/sayfa/uye-kaydedilenler.js'],
  })];
};
