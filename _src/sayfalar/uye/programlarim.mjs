import { uyeSayfa, bolumBas, kart, dugme } from '../../parcalar/uye/ust.mjs';

const giris = 'Başlattığın ve tamamladığın programlar; her biri Beslenme Planım ve günlük takibine bağlı.';
const tablo = (id, etiket) => kart({
  bosluksuz: true,
  govde: `<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="${etiket}"><table class="tablo panel sabit"><caption class="yalniz-okuyucu">${etiket}: program, tarih, durum ve işlem</caption><thead><tr><th scope="col">Program</th><th scope="col" class="dar-kolon">Tarih aralığı</th><th scope="col" class="dar-kolon">Durum</th><th scope="col" class="eylem-kolon">İşlem</th></tr></thead><tbody id="${id}"></tbody></table></div>`,
});
const pano = (id, ikon, baslik, etiket) => `<div class="yigin">${bolumBas({ etiket: 'Başladıkların ve bitirdiklerin', ikon, baslik, metin: giris, arac: dugme('Program kütüphanesi', { sinif: 'hayalet', ikon: 'fa-arrow-right', href: 'programlar/' }) })}${tablo(id, etiket)}</div>`;

export default () => [uyeSayfa({
  yol: 'hesabim/programlarim', ad: 'Programlarım', muhur: 'Programların · kişisel alanın', ikon: 'fa-list-check',
  giris: 'Devam eden ve tamamladığın beslenme programların tek listede.',
  grup: 'pr',
  sekmeler: [
    { id: 'devam', ad: 'Devam eden', ikon: 'fa-clipboard-check', sayi: 'devam', govde: pano('prDevam', 'fa-clipboard-check', 'Devam eden programların', 'Devam eden programlar') },
    { id: 'tamamlanan', ad: 'Tamamlanan', ikon: 'fa-circle-check', sayi: 'tamamlanan', govde: pano('prTamam', 'fa-circle-check', 'Tamamladığın programlar', 'Tamamlanan programlar') },
    { id: 'tumu', ad: 'Tümü', ikon: 'fa-clock-rotate-left', sayi: 'tumu', govde: pano('prTumu', 'fa-clock-rotate-left', 'Bütün programların', 'Bütün programlar') },
  ],
  js: ['assets/js/sayfa/uye-programlarim.js'],
})];
