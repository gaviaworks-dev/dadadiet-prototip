import { uyeKabuk } from '../../parcalar/uye/kabuk.mjs';
import { ikon } from './_ortak.mjs';

export default () => [uyeKabuk({
  yol: 'hesabim/odeme', baslik: 'Ödeme',
  aciklama: 'Paketini gözden geçir, kayıtlı kartını seç, görüşme hakların hesabına işlensin.',
  aktif: 'hesabim/odemelerim/', ust: [['Ödemelerim', 'hesabim/odemelerim/']],
  govde: `<div id="odemeGovde"></div>`,
  js: ['assets/js/sayfa/uye-gastro-ortak.js', 'assets/js/sayfa/uye-gastro-odeme.js'],
})];
