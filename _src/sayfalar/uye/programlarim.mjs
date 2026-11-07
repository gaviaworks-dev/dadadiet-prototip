import { uyeSayfa, dugme } from '../../parcalar/uye/ust.mjs';

export default () => [uyeSayfa({
  yol: 'hesabim/programlarim', ad: 'Programlarım',
  giris: 'Başlattığın programlar, gün gün ilerlemen ve tamamladıkların.',
  eylem: dugme('Kaydedilenler', { sinif: 'hayalet', ikon: 'fa-bookmark', href: 'hesabim/kaydedilenler/' }) + dugme('Program bul', { sinif: 'birincil', ikon: 'fa-wand-magic-sparkles', href: 'programlar/program-bul/' }),
  grup: 'pr',
  sekmeler: [
    { id: 'devam', ad: 'Devam eden', ikon: 'fa-clipboard-check', sayi: 'devam', govde: '<div class="yigin"><div id="prHis"></div><div class="yigin" id="prDevam"></div></div>' },
    { id: 'tamamlanan', ad: 'Tamamlanan', ikon: 'fa-circle-check', sayi: 'tamamlanan', govde: '<div class="yigin" id="prTamam"></div>' },
  ],
  js: ['assets/js/tercih-uyum.js', 'assets/js/his-kaydi.js', 'assets/js/sayfa/uye-programlarim.js'],
})];
