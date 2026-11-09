// Plan oluşturucu. Gövde `_src/parcalar/panel-b/planlar-olustur-sayfa.html`; bu modül ona yayındaki
// programların gün dökümünü gömer ("Programdan başla", eski panel ES-DP-18). Gün dökümü yalnız iki
// programda yayında: Akdeniz Tipi Beslenme (metin, değer yok) ve Sekiz Saatlik Pencere: İki Hafta (3 gün, besin ve gram).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { akdenizGunler } from '../../parcalar/public-araclar/akdeniz-gunler.mjs';

const KAYNAK = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../parcalar/panel-b/planlar-olustur-sayfa.html');
const OGUN = { 'Kahvaltı': 'kahvalti', 'Ara Öğün': 'ara1', 'Öğle Yemeği': 'ogle', 'İkindi': 'ara2', 'Akşam Yemeği': 'aksam' };
const bos = () => ({ kahvalti: [], ara1: [], ogle: [], ara2: [], aksam: [] });
/* "Zeytinyağlı taze fasulye 1 tabak" → ad + ölçü; değer yayımlanmadığı için serbest kalem, kcal 0 */
const metinKalem = (m) => {
  const x = m.trim().match(/^(.*?)\s+((?:\d|½|¼|yarım|bir\s)[\s\S]*)$/i);
  return { tur: 'serbest', ad: x ? x[1] : m.trim(), olcu: x ? x[2] : '1 porsiyon', miktar: 1, kcal: 0, protein: 0, yag: 0, karb: 0 };
};
const gom = (id, v) => `<script type="application/json" id="${id}">${JSON.stringify(v).replace(/</g, '\\u003c')}</script>`;

export default ({ veri }) => {
  const ham = fs.readFileSync(KAYNAK, 'utf8');
  const m = ham.match(/^<!--\s*(\{[\s\S]*?\})\s*-->\s*/);
  const meta = JSON.parse(m[1]);
  const P = veri.programlar.programlar, kart = (slug) => P.find((x) => x.slug === slug) || {};
  const akd = kart('akdeniz-tipi-beslenme'), go = veri.programlar.gun_ornegi;
  const programlar = [
    {
      slug: akd.slug, ad: akd.ad, aciklama: akd.aciklama, sure_gun: akd.sure_gun, enerji: akd.enerji, yol: 'program/' + akd.slug + '/',
      gosterilen: akdenizGunler.length, degerli: false,
      gunler: akdenizGunler.map((g) => { const o = bos(); g.ogunler.forEach(([ad, metin]) => { if (OGUN[ad]) o[OGUN[ad]] = metin.split(' + ').map(metinKalem); }); return o; }),
    },
    {
      slug: go.slug, ad: go.ad, aciklama: go.ozet, sure_gun: go.gun_sayisi, enerji: kart(go.slug).enerji || '', yol: fs.existsSync(path.join(path.dirname(KAYNAK), '../../../program', go.slug)) ? 'program/' + go.slug + '/' : '',
      gosterilen: go.gunler.length, degerli: true,
      gunler: go.gunler.map((g) => { const o = bos(); g.ogunler.forEach((og) => { if (OGUN[og.tur]) o[OGUN[og.tur]] = og.kalemler.map((k) => ({ slug: k.besin_slug, ad: k.ad, olcu: k.olcu, gram: k.gram, kcal: k.kcal })); }); return o; }),
    },
  ];
  return [{ yol: meta.yol, meta, govde: ham.slice(m[0].length) + gom('programGunleri', programlar) }];
};
