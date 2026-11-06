// Besin Karşılaştır: ana sayfa + dört hazır karşılaştırma. Sonuç bloğu istemci motoruyla derlemede üretilir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const JS = ['assets/js/sayfa/moduller-ortak.js', 'assets/js/sayfa/moduller-karsilastir.js'];

function motor(veri) {
  const w = { DD_VERI: { besinler: veri.besinler } };
  new Function('window', fs.readFileSync(path.join(KOK, 'assets/js/sayfa/moduller-ortak.js'), 'utf8').replace('typeof window !== \'undefined\' ? window : globalThis', 'window'))(w);
  return w.DDM;
}

const kirinti = (h) => `<nav class="kirinti acik-zemin" aria-label="Sayfa yolu"><a class="kirinti-ev" href="{{kok}}"><i class="fa-solid fa-house" aria-hidden="true"></i><span class="yalniz-okuyucu">Dada Diet</span></a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><a href="{{kok}}besin-kutuphanesi/">Besin Kütüphanesi</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>${h ? `<a href="{{kok}}besin-karsilastir/">Besin Karşılaştır</a><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><span class="kirinti-simdi">${h.baslik}</span>` : '<span class="kirinti-simdi">Besin Karşılaştır</span>'}</nav>`;

function govde(M, h) {
  const v = h || M.HAZIR[0];
  const a = M.besin(v.a), b = M.besin(v.b);
  const hazir = M.HAZIR.map((x) => `<a class="kart baglanti-kart" href="{{kok}}besin-karsilastir/${x.yol}/"${h && h.yol === x.yol ? ' aria-current="page"' : ''}><div class="kart-govde"><h3 class="kart-baslik"><i class="fa-solid fa-scale-balanced" aria-hidden="true"></i> ${x.baslik}</h3><p class="kart-metin">${x.ozet}</p></div></a>`).join('');
  return `<div class="modul-govde"><section class="bolum sik"><div class="kap">
${kirinti(h)}
<div class="sayfa-bas"><div><h1 id="karsilastirBaslik">${h ? h.baslik : 'Besin Karşılaştır'}</h1><p>İki besini yan yana koy; kalori, makro ve mikro değerleri tek tabloda gör, hangisini ne zaman seçeceğini öğren.</p></div></div>
<div class="yigin">
<div class="kart" id="karsilastir" data-a="${a.slug}" data-b="${b.slug}"><div class="kart-govde">
<div class="secici-satir">
<div class="alan"><label class="alan-etiket" for="besinA">Birinci besin</label><div class="oneri-kap"><input class="alan-girdi" id="besinA" type="search" placeholder="Besin ara" value="${M.kac(M.kisaAd(a))}"></div></div>
<button class="kapat-dugme yer-degistir" id="yerDegistir" type="button" aria-label="Besinlerin yerini değiştir"><i class="fa-solid fa-right-left" aria-hidden="true"></i></button>
<div class="alan"><label class="alan-etiket" for="besinB">İkinci besin</label><div class="oneri-kap"><input class="alan-girdi" id="besinB" type="search" placeholder="Besin ara" value="${M.kac(M.kisaAd(b))}"></div></div>
<div class="alan"><span class="alan-etiket" id="olcuEtiket">Ölçü</span><div class="segment" role="group" aria-labelledby="olcuEtiket"><button type="button" data-deger="100" aria-pressed="true">100 g</button><button type="button" data-deger="porsiyon" aria-pressed="false">1 porsiyon</button><button type="button" data-deger="100kcal" aria-pressed="false">100 kcal</button></div></div>
</div>
</div></div>
<div class="yigin" id="karsilastirSonuc" aria-live="polite">${M.karsilastirHtml(a, b, '100', '{{kok}}')}</div>
<div class="bolum-bas sik-bas"><div><h2>Hazır karşılaştırmalar</h2><p class="giris-metni">En çok merak edilen ikililer.</p></div></div>
<div class="kart-izgara c4">${hazir}</div>
</div>
</div></section></div>`;
}

export default ({ veri }) => {
  const M = motor(veri);
  return [
    { yol: 'besin-karsilastir', meta: { baslik: 'Besin Karşılaştır', duzen: 'public', aktif: 'Beslenme', js: JS }, govde: govde(M, null) },
    ...M.HAZIR.map((h) => ({ yol: `besin-karsilastir/${h.yol}`, meta: { baslik: h.baslik, duzen: 'public', aktif: 'Beslenme', js: JS }, govde: govde(M, h) })),
  ];
};
