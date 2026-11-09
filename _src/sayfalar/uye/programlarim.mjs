import { uyeSayfa, dugme } from '../../parcalar/uye/ust.mjs';

export default () => [uyeSayfa({
  yol: 'hesabim/programlarim', ad: 'Programlarım',
  giris: 'Başlattığın, sürdürdüğün ve tamamladığın beslenme programları; her biri Beslenme Planım’a ve günlük takibine bağlı.',
  eylem: dugme('Kaydedilenler', { sinif: 'hayalet', ikon: 'fa-bookmark', href: 'hesabim/kaydedilenler/' }) + dugme('Program bul', { sinif: 'birincil', ikon: 'fa-wand-magic-sparkles', href: 'programlar/program-bul/' }),
  grup: 'pr',
  sekmeler: [
    { id: 'devam', ad: 'Devam eden', ikon: 'fa-clipboard-check', sayi: 'devam', govde: '<div class="yigin"><div id="prHis"></div><div class="yigin" id="prDevam"></div></div>' },
    { id: 'tamamlanan', ad: 'Tamamlanan', ikon: 'fa-circle-check', sayi: 'tamamlanan', govde: '<div class="yigin" id="prTamam"></div>' },
    { id: 'tumu', ad: 'Tümü', ikon: 'fa-layer-group', sayi: 'tumu', govde: '<div class="yigin" id="prTumu"></div>' },
  ],
  js: ['assets/js/tercih-uyum.js', 'assets/js/yatay-kaydir.js', 'assets/js/his-kaydi.js', 'assets/js/sayfa/uye-programlarim.js'],
})];
