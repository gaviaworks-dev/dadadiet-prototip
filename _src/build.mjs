// Prototip derleyici. Bağımlılık yok: `node _src/build.mjs`
// _src/sayfalar/**/*.html  -> <yol>/index.html  (front matter: ilk satır <!--{json}-->)
// _src/sayfalar/**/*.mjs   -> default export ({veri}) => [{yol, meta, govde}]
// Yer tutucular: {{kok}} kök yolu, <!-- @parca ad --> _src/parcalar/ad.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
import crypto from 'node:crypto';
/* Önbellek sürümü (9 Kasım T7): Pages eski CSS/JS'i yeni HTML'le birleştirmesin diye her assets/*.css|js bağlantısına içerik özeti eklenir.
   Özet derlemenin sonunda, veri.js de yazıldıktan sonra basılır. */
const yazilanHtml = [];
const htmlYaz = (yol, html) => { fs.writeFileSync(yol, html); yazilanHtml.push(yol); };
const ozetler = new Map();
const ozet = (goreli) => {
  if (!ozetler.has(goreli)) { const f = path.join(KOK, goreli); ozetler.set(goreli, fs.existsSync(f) ? crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0, 8) : ''); }
  return ozetler.get(goreli);
};
const surumle = (html) => html.replace(/(href|src)="((?:\.\.\/)*|\.\/|\/dadadiet-prototip\/)(assets\/[^"?#]+\.(?:css|js))"/g, (t, a, onek, goreli) => { const v = ozet(goreli); return v ? `${a}="${onek}${goreli}?v=${v}"` : t; });
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
  htmlYaz(hedef, html);
  // GitHub Pages her eksik yolda kök 404.html'i sunar: bağlantılar mutlak kökle yazılır
  if (s.yol === '404') htmlYaz(path.join(KOK, '404.html'), parcalariAc(kabukla(s, { veri, istekler: fs.readdirSync(path.join(SRC, 'istek')).filter((x) => x.endsWith('.css')) })).replaceAll('{{kok}}', '/dadadiet-prototip/'));
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
  const sayi = [[o.alan, 'alan (canlı katalog)'], [o.format, 'biçim (format_type)'], [`${o.yerlesik}/${o.alan}`, `yerleşen alan · ${o.sayfa} yüzey`], [o.uye, 'üye sayfasında bekleyen'], [o.yok, 'prototipte yüzeyi olmayan']];
  return `<div class="kart" id="reklam-alanlari"><div class="kart-bas"><div><h3 class="kart-baslik">${ik('fa-rectangle-ad')} Reklam Alanları <span class="sekme-sayi">${o.alan}</span></h3><p>Canlı dadadiet.com reklam modülü: alanlar, biçimler, sponsorlu içerik ve yapışkan alt bant. Canlıda misafire reklam basılmaz; prototipte de alanlar varsayılan görünümde kapalıdır. Kreatifler kurgu markalardır, prototip örneğidir.</p></div><label class="anahtar"><input type="checkbox" id="reklamAnahtar" aria-label="Reklamlı görünüm: site genelinde bütün reklam alanlarını aç"><span class="anahtar-ray"></span></label></div>
<div class="kart-govde yigin"><p class="kart-metin"><b>Reklamlı görünüm</b> anahtarı açıkken bu sekmede gezdiğin her sayfada bütün alanlar basılır ve üstte kapatılabilir bir önizleme şeridi durur; <code>?reklam=hepsi</code> ya da <code>?reklam=KOD</code> ile açılan kip de sekme kapanana ya da <code>?reklam=kapali</code> açılana kadar korunur. Tek bir alanı görmek için satırdaki bağı aç; bağ o alana kaydırır.</p><dl class="kunye c5">${sayi.map(([s, e]) => `<div><dt>${e}</dt><dd>${s}</dd></div>`).join('')}</dl><div class="eylem-satiri"><a class="dugme birincil" href="{{kok}}marka-is-birlikleri/#alanlar">${ik('fa-handshake')} Satış vitrinine git</a><a class="dugme hayalet" href="{{kok}}?reklam=hepsi">${ik('fa-eye')} Ana sayfayı reklamlı aç</a></div>
<div class="akordeon tablolu">${sayfalar}${uye.length ? kalem('Üye sayfaları', 'kanca bekliyor', uye, 'durum', 'fa-user') : ''}${yok.length ? kalem('Prototipte yüzeyi olmayan alanlar', 'gerekçeli', yok, 'durum', 'fa-ban') : ''}</div></div></div>`;
}

// Eski canlı adresleri (K1.7 slug değişiklikleri; doküman kıyası a-40, d-1): statik sitede 301 yerine meta yenileme + canonical.
// Yeni sayfa zaten bu yolda üretildiyse yönlendirme yazılmaz. Laravel karşılığı tasks/yonlendirme.md.
const YONLENDIRME = [['testler', 'saglik-testleri/'], ['beslenme', 'besin-rehberi/'], ['programini-bul', 'programlar/program-bul/'], ['diyetisyen-bul', 'diyetisyen-bul-sihirbazi/'], ['sayfa/diyetisyen-ol', 'diyetisyen-ol/'], ['sureye-gore', 'programlar/sureye-gore/'], ['ipuclari', 'ipuclari-ve-puf-noktalari/?tur=ipucu'], ['puflar', 'ipuclari-ve-puf-noktalari/?tur=puf']];
if (!alan) for (const [eski, yeni] of YONLENDIRME) {
  if (gorulen.has(eski)) continue;
  const kok = '../'.repeat(eski.split('/').length);
  fs.mkdirSync(path.join(KOK, eski), { recursive: true });
  fs.writeFileSync(path.join(KOK, eski, 'index.html'), `<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex">\n<title>Sayfa taşındı · Dada Diet</title>\n<link rel="canonical" href="${kok}${yeni}">\n<meta http-equiv="refresh" content="0; url=${kok}${yeni}">\n</head>\n<body>\n<p>Bu sayfa taşındı: <a href="${kok}${yeni}">yeni adrese git</a>.</p>\n<script>location.replace(${JSON.stringify(kok + yeni)} + location.hash)</script>\n</body>\n</html>\n`);
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
  htmlYaz(path.join(KOK, 'ekranlar/index.html'), parcalariAc(kabukla(s, { veri, istekler: fs.readdirSync(path.join(SRC, 'istek')).filter((x) => x.endsWith('.css')) })).replaceAll('{{kok}}', '../'));
}

// İstemci verisi: modüllerin okuduğu katalog + ortak demo (tek kaynak _src/veri)
const istemci = {};
for (const a of ['besinler', 'tarifler', 'demo', 'bayraklar', 'ogun-sablonu']) if (veri[a]) istemci[a] = veri[a];
fs.mkdirSync(path.join(KOK, 'assets/js'), { recursive: true });
fs.writeFileSync(path.join(KOK, 'assets/js/veri.js'), 'window.DD_VERI=' + JSON.stringify(istemci) + ';\n');
for (const y of yazilanHtml) fs.writeFileSync(y, surumle(fs.readFileSync(y, 'utf8')));
if (!alan) fs.writeFileSync(path.join(SRC, 'sayfa-listesi.json'), JSON.stringify(uretilen.sort((a, b) => a.yol.localeCompare(b.yol, 'tr')), null, 1));
console.log(uretilen.length + ' sayfa üretildi');
if (hatalar.length) { console.error('HATALAR:\n' + hatalar.join('\n')); process.exitCode = 1; }
