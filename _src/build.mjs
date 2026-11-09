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
/* Ekran haritasında "Reklam alanları": canlı reklam kataloğunun (146 alan) prototip yerleşimi, sayfa başına. Her yerleşik alan
   kendi sayfasında ?reklam=KOD ile tek başına açılır; yüzeyi olmayanlar gerekçesiyle, bağsız listelenir. Kaynak _src/parcalar/reklam.mjs. */
async function reklamBolumu(liste) {
  const { ALANLAR, reklamOzet, onizlemeYolu } = await import(pathToFileURL(path.join(SRC, 'parcalar', 'reklam.mjs')).href + '?t=' + Date.now());
  const o = reklamOzet();
  const baslik = new Map(liste.map((u) => [u.yol, u.yol ? u.baslik : "Ana sayfa"]));
  const ik = (i) => `<i class="fa-solid ${i}" aria-hidden="true"></i>`;
  const olcu = (a) => [a.masaustu && `Masaüstü: ${a.masaustu}`, a.mobil && `Mobil: ${a.mobil}`].filter(Boolean).join('<br>') || '<span class="veri-yok">künye yok</span>';
  const satir = (a, bag) => `<tr><td><code>${a.kod}</code></td><td>${a.ad}${a.canliAd ? `<br><small>canlı adı: ${a.canliAd}</small>` : ''}</td><td>${a.bicim || a.format}</td><td>${olcu(a)}</td><td>${bag}</td></tr>`;
  const tablo = (l, bag) => `<div class="tablo-kap"><table class="tablo"><thead><tr><th>Kod</th><th>Satış adı</th><th>Biçim</th><th>Ölçü</th><th>${bag === 'bag' ? 'Önizle' : 'Durum'}</th></tr></thead><tbody>${l.map((a) => satir(a, bag === 'bag' ? `<a class="baglanti-metin" href="{{kok}}${onizlemeYolu(a) ? onizlemeYolu(a) + '/' : ''}?reklam=${encodeURIComponent(a.kod)}">/${onizlemeYolu(a)}${onizlemeYolu(a) ? '/' : ''}?reklam=${a.kod}</a>` : `<small>${a.durum === 'uye' ? `Üye sayfası: ${a.bolum}. Kanca lead birleştirince eklenir.` : a.gerekce}</small>`)).join('')}</tbody></table></div>`;
  const kalem = (ad, alt, l, bag, ikon) => `<div class="akordeon-kalem"><button class="akordeon-bas" type="button" aria-expanded="false"><span class="akordeon-ikon">${ik(ikon)}</span>${ad} <span class="sekme-sayi">${l.length}</span>${alt ? `<small>&nbsp;${alt}</small>` : ''}${ik('fa-chevron-down akordeon-ok')}</button><div class="akordeon-govde">${tablo(l, bag)}</div></div>`;
  const yerlesik = ALANLAR.filter((a) => a.durum === 'yerlesik');
  const yollar = [...new Set(yerlesik.map((a) => a.yol))].sort((x, y) => (x === 'kabuk' ? -1 : y === 'kabuk' ? 1 : x.localeCompare(y, 'tr')));
  const sayfalar = yollar.map((y) => kalem(y === 'kabuk' ? 'Tüm sayfalar (kabuk: menü ve standart katman)' : baslik.get(y) ?? y, y === 'kabuk' ? '' : `/${y}`, yerlesik.filter((a) => a.yol === y), 'bag', y === 'kabuk' ? 'fa-window-maximize' : 'fa-file-lines')).join('');
  const uye = ALANLAR.filter((a) => a.durum === 'uye'), yok = ALANLAR.filter((a) => a.durum === 'yok');
  const sayi = [[o.alan, 'alan (canlı katalog)'], [o.format, 'biçim (format_type)'], [o.yerlesik, `yerleşen alan · ${o.sayfa} yüzey`], [o.uye, 'üye sayfasında bekleyen'], [o.yok, 'prototipte yüzeyi olmayan']];
  return `<div class="kart" id="reklam-alanlari"><div class="kart-bas"><div><h3 class="kart-baslik">${ik('fa-rectangle-ad')} Reklam Alanları <span class="sekme-sayi">${o.alan}</span></h3><p>Canlı dadadiet.com reklam modülü: alanlar, biçimler, sponsorlu içerik ve yapışkan alt bant. Canlıda misafire reklam basılmaz; prototipte de alanlar varsayılan görünümde kapalıdır. Kreatifler kurgu markalardır, prototip örneğidir.</p></div><label class="anahtar"><input type="checkbox" id="reklamAnahtar" aria-label="Reklamlı görünüm: site genelinde bütün reklam alanlarını aç"><span class="anahtar-ray"></span></label></div>
<div class="kart-govde yigin"><p class="kart-metin"><b>Reklamlı görünüm</b> anahtarı açıkken her sayfada bütün alanlar basılır ve üstte kapatılabilir bir önizleme şeridi durur. Tek bir alanı görmek için satırdaki bağı aç; bağ o alana kaydırır.</p><dl class="kunye c5">${sayi.map(([s, e]) => `<div><dt>${e}</dt><dd>${s}</dd></div>`).join('')}</dl><div class="eylem-satiri"><a class="dugme birincil" href="{{kok}}marka-is-birlikleri/#alanlar">${ik('fa-handshake')} Satış vitrinine git</a><a class="dugme hayalet" href="{{kok}}?reklam=hepsi">${ik('fa-eye')} Ana sayfayı reklamlı aç</a></div>
<div class="akordeon tablolu">${sayfalar}${kalem('Üye sayfaları', 'kanca bekliyor', uye, 'durum', 'fa-user')}${kalem('Prototipte yüzeyi olmayan alanlar', 'gerekçeli', yok, 'durum', 'fa-ban')}</div></div></div>`;
}

// Ekran haritası: onay turu için tüm sayfaların gezilebilir listesi
if (!alan) {
  const gruplar = [['Public', (u) => !u.yol.startsWith('hesabim') && !u.yol.startsWith('diyetisyen-paneli')], ['Üye hesabı', (u) => u.yol.startsWith('hesabim')], ['Diyetisyen paneli', (u) => u.yol.startsWith('diyetisyen-paneli')]];
  const liste = [...uretilen].sort((a, b) => a.yol.localeCompare(b.yol, 'tr'));
  const { akislar } = await import(pathToFileURL(path.join(SRC, 'kabuk', 'akislar.mjs')).href);
  const reklamHtml = await reklamBolumu(liste);
  const akisHtml = akislar.map((g) => `<div class="kart"><div class="kart-bas"><h3 class="kart-baslik">${g.grup}</h3></div><div class="kart-govde">${g.liste.map((a) => `<div class="akis"><b>${a.ad}</b><ol class="akis-adimlar">${a.adimlar.map(([ad, h], i) => `<li><a href="{{kok}}${h}"><span>${i + 1}</span>${ad}</a></li>`).join('')}</ol></div>`).join('')}</div></div>`).join('');
  const govde = `<div class="modul-govde"><section class="bolum"><div class="kap"><div class="sayfa-bas"><div><h1>Ekran haritası</h1><p>Prototipteki ${liste.length} ekranın tamamı ve tıklanarak gezilen akışlar.</p></div><div class="eylem-satiri"><button class="dugme hayalet" type="button" data-demo-sifirla><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Demoyu sıfırla</button></div></div><div class="yigin">${akisHtml}${gruplar.map(([ad, f]) => { const l = liste.filter(f); return `<div class="kart"><div class="kart-bas"><h3 class="kart-baslik">${ad} <span class="sekme-sayi">${l.length}</span></h3></div><div class="kart-govde"><ul class="ekran-liste">${l.map((u) => `<li><a href="{{kok}}${u.yol ? u.yol + '/' : ''}"><b>${u.baslik || 'Ana sayfa'}</b><small>/${u.yol}</small></a></li>`).join('')}</ul></div></div>`; }).join('')}${reklamHtml}</div></div></section></div>`;
  const s = { yol: 'ekranlar', meta: { baslik: 'Ekran haritası', js: ['assets/js/reklam/ekranlar.js'] }, govde };
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
