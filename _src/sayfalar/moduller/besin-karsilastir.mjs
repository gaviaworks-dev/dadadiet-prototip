// Besin Karşılaştır: ana sayfa + dört hazır karşılaştırma. Sonuç bloğu istemci motoruyla derlemede üretilir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JS as ORTAK_JS, bant, bolum } from '../../parcalar/public-araclar/ortak.mjs';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const JS = [ORTAK_JS, 'assets/js/sayfa/moduller-ortak.js', 'assets/js/sayfa/moduller-karsilastir.js'];
const ad = (h) => h.baslik.replace(' vs ', ' ve ');

function motor(veri) {
  const w = { DD_VERI: { besinler: veri.besinler } };
  new Function('window', fs.readFileSync(path.join(KOK, 'assets/js/sayfa/moduller-ortak.js'), 'utf8').replace('typeof window !== \'undefined\' ? window : globalThis', 'window'))(w);
  return w.DDM;
}

function govde(M, h, sayaclar) {
  const v = h || M.HAZIR[0];
  const a = M.besin(v.a), b = M.besin(v.b);
  const hazir = M.HAZIR.map((x) => `<a class="kart baglanti-kart" href="{{kok}}besin-karsilastir/${x.yol}/"${h && h.yol === x.yol ? ' aria-current="page"' : ''}><div class="kart-govde"><h3 class="kart-baslik"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> ${x.baslik}</h3><p class="kart-metin">${x.ozet}</p></div></a>`).join('');
  const secici = `<div class="kart" id="karsilastir" data-a="${a.slug}" data-b="${b.slug}"><div class="kart-govde">
<div class="secici-satir">
<div class="alan"><label class="alan-etiket" for="besinA">Birinci besin</label><div class="oneri-kap"><input class="alan-girdi" id="besinA" type="search" placeholder="Besin ara" value="${M.kac(M.kisaAd(a))}"></div></div>
<button class="kapat-dugme yer-degistir" id="yerDegistir" type="button" aria-label="Besinlerin yerini değiştir"><i class="fa-solid fa-right-left" aria-hidden="true"></i></button>
<div class="alan"><label class="alan-etiket" for="besinB">İkinci besin</label><div class="oneri-kap"><input class="alan-girdi" id="besinB" type="search" placeholder="Besin ara" value="${M.kac(M.kisaAd(b))}"></div></div>
<div class="alan"><span class="alan-etiket" id="olcuEtiket">Ölçü</span><div class="segment" role="group" aria-labelledby="olcuEtiket"><button type="button" data-deger="100" aria-pressed="true">100 g</button><button type="button" data-deger="porsiyon" aria-pressed="false">1 porsiyon</button><button type="button" data-deger="100kcal" aria-pressed="false">100 kcal</button></div></div>
</div>
</div></div>`;
  const yol = h ? [['Besin Kütüphanesi', 'besin-kutuphanesi/'], ['Besin Karşılaştır', 'besin-karsilastir/'], [ad(h)]] : [['Besin Kütüphanesi', 'besin-kutuphanesi/'], ['Besin Karşılaştır']];
  return `${bant({
    yol, etiket: 'Beslenme', etiketIkon: 'fa-scale-balanced', gorsel: 'hero/besin-kutuphanesi-nb-top.webp',
    h1: `<span id="karsilastirBaslik">${h ? ad(h) : 'Besin <span class="vurgu">Karşılaştır</span>'}</span>`,
    alt: 'İki besini yan yana koy; kalori, makro ve mikro değerleri tek tabloda gör, hangisini ne zaman seçeceğini öğren.',
    sayilar: [[sayaclar.besin, 'besin kütüphanede'], [M.HAZIR.length, 'hazır karşılaştırma']],
  })}
<div class="bolum-dizi">
${bolum(secici, { ilk: true })}
${bolum(`<div class="yigin" id="karsilastirSonuc" aria-live="polite">${M.karsilastirHtml(a, b, '100', '{{kok}}')}</div>`)}
${bolum(`<div class="bolum-bas"><div><h2>Hazır karşılaştırmalar</h2><p class="giris-metni">En çok merak edilen ikililer.</p></div></div>
<div class="kart-izgara c4">${hazir}</div>`)}
</div>`;
}

export default ({ veri }) => {
  const M = motor(veri);
  return [
    { yol: 'besin-karsilastir', meta: { baslik: 'Besin Karşılaştır', duzen: 'public', aktif: 'Beslenme', hero: true, js: JS }, govde: govde(M, null, veri.sayaclar) },
    ...M.HAZIR.map((h) => ({ yol: `besin-karsilastir/${h.yol}`, meta: { baslik: ad(h), duzen: 'public', aktif: 'Beslenme', hero: true, js: JS }, govde: govde(M, h, veri.sayaclar) })),
  ];
};
