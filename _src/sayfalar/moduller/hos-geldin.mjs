// Onboarding sihirbazı: kayıttan hemen sonra tam ekran. Program kataloğu DD_VERI'de olmadığı için sayfaya gömülür.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const logo = fs.readFileSync(path.join(KOK, '_src/kabuk/logo.svg'), 'utf8');

function gorselBul(p, manifest) {
  for (const uz of ['webp', 'jpg', 'avif']) if (fs.existsSync(path.join(KOK, `assets/img/program/${p.slug}.${uz}`))) return `program/${p.slug}.${uz}`;
  const m = manifest.find((e) => e.yerel.startsWith('program/') && e.kaynak.endsWith(p.gorsel_dosya));
  return m ? m.yerel : null;
}

export default ({ veri }) => {
  const manifest = JSON.parse(fs.readFileSync(path.join(KOK, 'assets/img/manifest.json'), 'utf8'));
  const programlar = veri.programlar.programlar.map((p) => ({
    slug: p.slug, ad: p.ad, sure: p.sure, sure_gun: p.sure_gun, enerji: p.enerji, hedef: p.hedef, tercih: p.tercih, yol: p.yol, gorsel: gorselBul(p, manifest),
  }));
  const govde = `<div class="sihirbaz" id="sihirbaz">
<header class="sihirbaz-ust"><a href="{{kok}}" aria-label="Dada Diet ana sayfa">${logo}</a>
<div class="sihirbaz-ilerleme"><div class="olcer hap" id="ilerlemeKap" role="progressbar" aria-label="Sihirbaz ilerlemesi" aria-valuemin="0" aria-valuemax="100"><span id="ilerleme" data-oran="0"></span></div><span class="sihirbaz-sayac" id="sayac"></span></div></header>
<main class="sihirbaz-govde" id="sihirbazGovde"></main>
<footer class="sihirbaz-ayak"><button class="dugme hayalet" id="geri" type="button"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Geri</button>
<div class="sag"><button class="dugme hayalet" id="atla" type="button">Atla</button><button class="dugme birincil" id="ileri" type="button">Devam et <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button><a class="dugme birincil" id="bitir" href="{{kok}}hesabim/" hidden>Hesabıma git</a></div></footer>
</div>
<script type="application/json" id="programVeri">${JSON.stringify(programlar).replace(/</g, '\\u003c')}</script>`;
  return [{ yol: 'hesabim/hos-geldin', meta: { baslik: 'Hoş geldin', duzen: 'tam', js: ['assets/js/sayfa/moduller-ortak.js', 'assets/js/sayfa/moduller-soru.js', 'assets/js/sayfa/moduller-sihirbaz.js'] }, govde }];
};
