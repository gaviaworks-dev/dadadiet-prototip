// Prototip derleyici. Bağımlılık yok: `node _src/build.mjs`
// _src/sayfalar/**/*.html  -> <yol>/index.html  (front matter: ilk satır <!--{json}-->)
// _src/sayfalar/**/*.mjs   -> default export ({veri}) => [{yol, meta, govde}]
// Yer tutucular: {{kok}} kök yolu, <!-- @parca ad --> _src/parcalar/ad.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(KOK, '_src');
const oku = (p) => fs.readFileSync(p, 'utf8');

const veri = {};
for (const f of fs.existsSync(path.join(SRC, 'veri')) ? fs.readdirSync(path.join(SRC, 'veri')) : []) {
  if (f.endsWith('.json')) veri[f.replace('.json', '')] = JSON.parse(oku(path.join(SRC, 'veri', f)));
}

function dosyalar(d, cikti = []) {
  if (!fs.existsSync(d)) return cikti;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) dosyalar(p, cikti);
    else if (!e.name.startsWith('_')) cikti.push(p);
  }
  return cikti;
}

const { kabukla } = await import(pathToFileURL(path.join(SRC, 'kabuk', 'kabuk.mjs')).href + '?t=' + Date.now());

function parcalariAc(html, derinlik = 0) {
  if (derinlik > 6) return html;
  return html.replace(/<!--\s*@parca\s+([\w\/-]+)\s*-->/g, (_, ad) => {
    const p = path.join(SRC, 'parcalar', ad + '.html');
    if (!fs.existsSync(p)) throw new Error('Parça yok: ' + ad);
    return parcalariAc(oku(p), derinlik + 1);
  });
}

// `node _src/build.mjs <alan>` yalnız _src/sayfalar/<alan>/ altını derler (ekipler birbirini beklemesin).
const alan = process.argv[2] ?? '';
const hatalar = [];
const sayfalar = [];
for (const f of dosyalar(path.join(SRC, 'sayfalar', alan))) {
  const goreli = path.relative(path.join(SRC, 'sayfalar'), f);
  try {
  if (f.endsWith('.html')) {
    const ham = oku(f);
    const m = ham.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
    if (!m) throw new Error('Front matter yok: ' + goreli);
    const meta = JSON.parse(m[1]);
    const yol = meta.yol ?? goreli.replace(/\.html$/, '').replace(/(^|\/)index$/, '');
    sayfalar.push({ yol, meta, govde: ham.slice(m[0].length), kaynak: goreli });
  } else if (f.endsWith('.mjs')) {
    const mod = await import(pathToFileURL(f).href + '?t=' + Date.now());
    for (const s of await mod.default({ veri })) sayfalar.push({ ...s, kaynak: goreli });
  }
  } catch (e) { hatalar.push(goreli + ': ' + e.message); }
}

const gorulen = new Map();
const uretilen = [];
for (const s of sayfalar) {
  if (gorulen.has(s.yol)) throw new Error(`Çakışan yol ${s.yol}: ${gorulen.get(s.yol)} ve ${s.kaynak}`);
  gorulen.set(s.yol, s.kaynak);
  const derinlik = s.yol ? s.yol.split('/').length : 0;
  const kok = '../'.repeat(derinlik) || './';
  const html = parcalariAc(kabukla(s, { veri, istekler: fs.readdirSync(path.join(SRC, 'istek')).filter((x) => x.endsWith('.css')) })).replaceAll('{{kok}}', kok);
  const hedef = path.join(KOK, s.yol, 'index.html');
  fs.mkdirSync(path.dirname(hedef), { recursive: true });
  fs.writeFileSync(hedef, html);
  // GitHub Pages her eksik yolda kök 404.html'i sunar: bağlantılar mutlak kökle yazılır
  if (s.yol === '404') fs.writeFileSync(path.join(KOK, '404.html'), parcalariAc(kabukla(s, { veri, istekler: fs.readdirSync(path.join(SRC, 'istek')).filter((x) => x.endsWith('.css')) })).replaceAll('{{kok}}', '/dadadiet-prototip/'));
  uretilen.push({ yol: s.yol, baslik: s.meta?.baslik ?? '', duzen: s.meta?.duzen ?? 'public' });
}
// Ekran haritası: onay turu için tüm sayfaların gezilebilir listesi
if (!alan) {
  const gruplar = [['Public', (u) => !u.yol.startsWith('hesabim') && !u.yol.startsWith('diyetisyen-paneli')], ['Üye hesabı', (u) => u.yol.startsWith('hesabim')], ['Diyetisyen paneli', (u) => u.yol.startsWith('diyetisyen-paneli')]];
  const liste = [...uretilen].sort((a, b) => a.yol.localeCompare(b.yol, 'tr'));
  const govde = `<div class="modul-govde"><section class="bolum"><div class="kap"><div class="sayfa-bas"><div><h1>Ekran haritası</h1><p>Prototipteki ${liste.length} ekranın tamamı.</p></div></div><div class="yigin">${gruplar.map(([ad, f]) => { const l = liste.filter(f); return `<div class="kart"><div class="kart-bas"><h3 class="kart-baslik">${ad} <span class="sekme-sayi">${l.length}</span></h3></div><div class="kart-govde"><ul class="ekran-liste">${l.map((u) => `<li><a href="{{kok}}${u.yol ? u.yol + '/' : ''}"><b>${u.baslik || 'Ana sayfa'}</b><small>/${u.yol}</small></a></li>`).join('')}</ul></div></div>`; }).join('')}</div></div></section></div>`;
  const s = { yol: 'ekranlar', meta: { baslik: 'Ekran haritası' }, govde };
  fs.mkdirSync(path.join(KOK, 'ekranlar'), { recursive: true });
  fs.writeFileSync(path.join(KOK, 'ekranlar/index.html'), parcalariAc(kabukla(s, { veri, istekler: fs.readdirSync(path.join(SRC, 'istek')).filter((x) => x.endsWith('.css')) })).replaceAll('{{kok}}', '../'));
}

// İstemci verisi: modüllerin okuduğu katalog + ortak demo (tek kaynak _src/veri)
const istemci = {};
for (const a of ['besinler', 'tarifler', 'demo']) if (veri[a]) istemci[a] = veri[a];
fs.mkdirSync(path.join(KOK, 'assets/js'), { recursive: true });
fs.writeFileSync(path.join(KOK, 'assets/js/veri.js'), 'window.DD_VERI=' + JSON.stringify(istemci) + ';\n');
if (!alan) fs.writeFileSync(path.join(SRC, 'sayfa-listesi.json'), JSON.stringify(uretilen.sort((a, b) => a.yol.localeCompare(b.yol, 'tr')), null, 1));
console.log(uretilen.length + ' sayfa üretildi');
if (hatalar.length) { console.error('HATALAR:\n' + hatalar.join('\n')); process.exitCode = 1; }
