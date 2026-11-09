// Derleme anı bayrak yardımcısı. Tek kaynak _src/veri/bayraklar.json; istemci tarafı assets/js/bayrak.js.
// bayrak('ad', html): bayrak açıksa html olduğu gibi; kapalıysa ilk etikete data-bayrak="ad" eklenir (silinmez, genel CSS kuralı basmaz,
// ?bayrak=ad ile incelemede açılır). Bilinmeyen ad derlemeyi durdurur.
import fs from 'node:fs';

const LISTE = JSON.parse(fs.readFileSync(new URL('../veri/bayraklar.json', import.meta.url), 'utf8')).bayraklar;
const BAYRAK = Object.fromEntries(LISTE.map((b) => [b.ad, b]));

export const BAYRAK_JS = 'assets/js/bayrak.js';
export const bayrakAcik = (ad) => {
  if (!BAYRAK[ad]) throw new Error('Bilinmeyen bayrak: ' + ad);
  return !!BAYRAK[ad].acik;
};
export const bayrak = (ad, html) => (bayrakAcik(ad) ? html : html.replace(/^(\s*<[a-zA-Z][\w-]*)/, `$1 data-bayrak="${ad}"`));
