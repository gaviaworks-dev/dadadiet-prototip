// Sayfa kabukları: public, uye, panel, tam (sihirbaz/giriş). Tek yazar: lead.
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { anaMenu, footerKolonlar, footerKurumsal, footerYasal, uyeMenu, panelMenu } from './menu.mjs';
import { dilMenusu, cekmeceDil, gorusBildir, cerezBandi } from './canli-ogeler.mjs';
import { reklamYeri, standartKatman } from '../parcalar/reklam.mjs';

const BU = path.dirname(fileURLToPath(import.meta.url));
/* Önizlemede dinamik yüklenen reklam CSS/JS'inin önbellek sürümü (build'in ?v= özeti gibi): klasörlerin içerik özeti */
const RK_SURUM = (() => {
  const h = crypto.createHash('md5');
  for (const d of ['assets/css/reklam', 'assets/js/reklam']) {
    const k = path.join(BU, '../..', d);
    for (const f of fs.readdirSync(k).filter((f) => /\.(css|js)$/.test(f)).sort()) h.update(f).update(fs.readFileSync(path.join(k, f)));
  }
  return h.digest('hex').slice(0, 8);
})();
const logo = fs.readFileSync(path.join(BU, 'logo.svg'), 'utf8');
const K = '{{kok}}';
const kacis = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const kalemHtml = (k) => k.sihirbaz
  ? `<a class="mega-cat-all" href="${K}${k.href}"><i class="fa-solid ${k.ikon}"></i><span>${k.ad}<small>${k.alt}</small></span><i class="fa-solid fa-arrow-right mca-arrow"></i></a>`
  : `<a href="${K}${k.href}"><i class="fa-solid ${k.ikon}"></i><span>${k.ad}<small>${k.alt}</small></span></a>`;

/* Reklam kancaları (canlı header_mega ailesi): tarif bağı olan mega menü prototipte yok (K13.2), canlı kural ilk mega menüye düşer.
   Varsayılan görünümde <template> olarak durur; assets/js/reklam/onizle.js önizlemede açar. */
const megaReklam = {
  hucre: reklamYeri('HD-MEGA'),
  vitrin: reklamYeri('HD-WEEK', { hedef: '.mf-fig', yon: 'yerine' }) + reklamYeri('HD-DOLAP-SPON'),
};

function nav(aktif) {
  let ilkMega = true;
  return anaMenu.map((m) => {
    const ak = aktif === m.ad ? ' class="active"' : '';
    if (!m.kalemler) return `<div class="nav-item"><a${ak} href="${K}${m.href}">${m.ad}</a></div>`;
    if (!m.vitrin) return `<div class="nav-item"><a${ak} href="${K}${m.href}" aria-haspopup="true" aria-expanded="false">${m.ad}<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></a><div class="dropdown dd-col">${m.kalemler.map(kalemHtml).join('')}</div></div>`;
    const rk = ilkMega ? megaReklam : { hucre: '', vitrin: '' };
    ilkMega = false;
    return `<div class="nav-item has-mega"><a${ak} href="${K}${m.href}" aria-haspopup="true" aria-expanded="false">${m.ad}<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></a><div class="mega"><div class="wrap"><div class="mega-grid"><div class="mega-cats">${m.kalemler.map(kalemHtml).join('')}${rk.hucre}</div><div class="mega-feat"><a class="mf-fig" href="${K}${m.vitrin.href}" data-arkaplan="${K}${m.vitrin.gorsel}"><span class="r-chip">${m.vitrin.etiket}</span><h4>${m.vitrin.baslik}</h4></a>${rk.vitrin}</div></div></div></div></div>`;
  }).join('');
}

function cekmece() {
  const satir = anaMenu.map((m) => m.kalemler
    ? `<div class="d-item d-has-sub"><div class="d-row"><a class="d-link" href="${K}${m.href}"><i class="fa-solid ${m.ikon}"></i> ${m.ad}</a><button class="d-toggle" type="button" aria-expanded="false" aria-label="${m.ad} alt menüsü"><i class="fa-solid fa-chevron-down"></i></button></div><div class="d-sub">${m.kalemler.map((k) => `<a href="${K}${k.href}"><i class="fa-solid ${k.ikon}"></i>${k.ad}</a>`).join('')}</div></div>`
    : `<div class="d-item"><div class="d-row"><a class="d-link" href="${K}${m.href}"><i class="fa-solid ${m.ikon}"></i> ${m.ad}</a></div></div>`).join('');
  return `<div class="drawer-overlay" id="drawerOverlay"></div><aside class="drawer" id="drawer" aria-label="Menü" aria-hidden="true" inert><div class="drawer-head"><a class="drawer-brand" href="${K}">${logo}</a><button class="drawer-close" id="drawerClose" type="button" aria-label="Menüyü kapat"><i class="fa-solid fa-xmark"></i></button></div><nav class="drawer-nav">${satir}</nav><div class="drawer-foot"><a class="btn btn-primary drawer-login oturum-kapali" href="${K}giris/"><i class="fa-solid fa-user"></i> Giriş Yap</a>${cekmeceDil}</div></aside>`;
}

function hesapMenu() {
  const gruplar = uyeMenu.map((g) => g.map(([i, a, h]) => `<a href="${K}${h}"><i class="fa-solid ${i}" aria-hidden="true"></i> <span>${a}</span></a>`).join('')).join('<div class="acct-div"></div>');
  return `<div class="acct-item acct-wrap oturum-acik"><button class="acct-btn" type="button" aria-label="Hesabım" aria-haspopup="true" aria-expanded="false"><span class="acct-ava">A</span><i class="fa-solid fa-chevron-down acct-caret"></i></button><div class="acct-menu"><div class="acct-id"><span class="acct-ava">A</span><span class="acct-id-txt"><b>Ayşe Demir</b><small>@aysedemir</small></span></div><div class="acct-div"></div>${gruplar}<div class="acct-div"></div><a href="${K}" data-cikis class="acct-logout"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> <span>Çıkış Yap</span></a></div></div>`;
}

/* Giriş sonrası dönüş: misafir giriş yapınca bulunduğu sayfaya döner (public-araclar-kimlik.js ?donus=). Kimlik sayfalarında eklenmez. */
const donusEki = (yol) => (!yol || /^(giris|kayit|sifremi-unuttum|eposta-dogrula)$/.test(yol) ? '' : `?donus=${encodeURIComponent(yol + '/')}`);

/* Canlı mobil alt sekme çubuğu (bottom-nav, ≤640 px; stil kabuk.css + alt-cubuk.css). Misafirde Günlük Takibim ve Profil girişe, dönüşle. */
function altCubuk(meta, yol = '') {
  const uye = (h, ad, i, aktif) => ({ h, ad, i, aktif });
  const etkin = (k) => {
    if (k === 'ana') return yol === '';
    if (k === 'beslenme') return meta.aktif === 'Beslenme';
    if (k === 'diyetisyen') return meta.aktif === 'Diyetisyenler' || /^diyetisyen(ler|\/|-bul|-ol)/.test(yol);
    if (k === 'gunluk') return yol.startsWith('hesabim/gunluk-takibim');
    if (k === 'profil') return yol.startsWith('hesabim') && !yol.startsWith('hesabim/gunluk-takibim');
    return false;
  };
  const a = (k, href, ikon, ad, ek = '') => `<a href="${K}${href}" class="bn-item ac-kalem${etkin(k) ? ' active' : ''}${ek}"${etkin(k) ? ' aria-current="page"' : ''}><i class="fa-solid ${ikon}"></i><span>${ad}</span></a>`;
  const cift = (k, hedef, ikon, ad) => a(k, hedef, ikon, ad, ' oturum-acik') + a(k, `giris/?donus=${encodeURIComponent(hedef)}`, ikon, ad, ' oturum-kapali');
  return `<nav class="bottom-nav alt-cubuk" aria-label="Mobil alt navigasyon">${a('ana', '', 'fa-house', 'Ana Sayfa')}${a('beslenme', 'besin-rehberi/', 'fa-seedling', 'Beslenme')}<a href="${K}diyetisyenler/" class="bn-item ac-kalem bn-center ac-orta${etkin('diyetisyen') ? ' active' : ''}"><span class="bn-fab ac-fab"><i class="fa-solid fa-user-doctor"></i></span><span>Diyetisyen</span></a>${cift('gunluk', 'hesabim/gunluk-takibim/', 'fa-utensils', 'Günlük Takibim')}${cift('profil', 'hesabim/', 'fa-user', 'Profil')}</nav>`;
}

function ust(meta, yol = '') {
  const hero = meta.hero ? ' at-top tepede' : '';
  return `<div class="topbar ust-bant"><div class="wrap kap"><div class="tb-left"><a href="${K}besin-kutuphanesi/"><i class="fa-solid fa-leaf"></i> 541 besin değeri</a></div><div class="tb-right"><nav class="brand-switch" aria-label="DadaMentor dünyaları"><a class="bs-item bs-gastro" href="https://dadagastro.com" title="DadaGastro" rel="external"><i class="fa-solid fa-utensils"></i><span class="bs-name"><span class="bd">dada</span><span class="sf">gastro</span></span></a><a class="bs-item bs-fit" href="https://dadafit.com.tr" title="DadaFit" rel="external"><i class="fa-solid fa-dumbbell"></i><span class="bs-name"><span class="bd">dada</span><span class="sf">fit</span></span></a><a class="bs-item bs-diet is-active" href="${K}" aria-current="page"><i class="fa-solid fa-heart-pulse"></i><span class="bs-name"><span class="bd">dada</span><span class="sf">diet</span></span></a><a class="bs-item bs-gourmet" href="https://dadagourmet.com" title="DadaGourmet" rel="external"><i class="fa-solid fa-map-location-dot"></i><span class="bs-name"><span class="bd">dada</span><span class="sf">gourmet</span></span></a></nav>${dilMenusu}</div></div></div>
<header class="header${hero}" data-site-header${meta.hero ? ' data-hero="1"' : ''}><div class="h-top"><div class="wrap kap"><a class="brand dd-brand" href="${K}" aria-label="Dada Diet">${logo}</a><nav class="nav ana-menu" aria-label="Menü">${nav(meta.aktif)}</nav><div class="head-actions"><a class="icon-btn ikon-dugme" href="${K}arama/" aria-label="Ara"><i class="fa-solid fa-magnifying-glass"></i></a><a class="icon-btn ikon-dugme head-bell oturum-acik" href="${K}hesabim/bildirimler/" aria-label="Bildirimler"><i class="fa-solid fa-bell"></i><span class="hb-badge">3</span></a><a class="btn-login oturum-kapali" id="btnLogin" href="${K}giris/${donusEki(yol)}"><i class="fa-solid fa-user"></i> Giriş Yap</a>${hesapMenu()}<button class="icon-btn ikon-dugme hamburger" id="hamburger" type="button" aria-controls="drawer" aria-expanded="false" aria-label="Menü"><i class="fa-solid fa-bars"></i></button></div></div></div></header>${cekmece()}`;
}

/* Tıbbi bilgilendirme şeridi (S5): canlı dadadiet.com/diyetisyenler `section.pf-disclaimer`, footer'ın hemen üstünde, main'in son bölümü.
   Metin ve ölçü birebir (diyetisyenler-v1.css). Yalnız public düzende; panel, üye ve tam ekran düzende yok. */
const tibbiSerit = `<section class="tibbi-serit" aria-label="Tıbbi bilgilendirme"><div class="wrap"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><p>Bu sayfadaki içerik genel bilgilendirme amaçlıdır; <b>tıbbi teşhis veya tedavi yerine geçmez.</b> Kişiye özel beslenme planı yalnızca <b>yetkili bir diyetisyen</b> tarafından hazırlanır. Gebelik, kronik hastalık, düzenli ilaç kullanımı, çocuk beslenmesi veya klinik bir durum varsa plana başlamadan önce <b>hekim ve diyetisyen kontrolü zorunludur.</b></p></div></section>`;

/* Canlıdaki genel bilgi uyarısı: footer başında; tam ekran düzende tek başına basılır */
const uyariBandi = `<div class="foot-med"><div class="wrap"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><p>Bu sitedeki hesaplayıcı, test, rehber ve program içerikleri genel bilgi amaçlıdır; kişiye özel tıbbi ya da beslenme önerisi değildir, teşhis veya tedavi yerine geçmez. Gebelik, kronik hastalık, düzenli ilaç kullanımı veya çocuk beslenmesi durumunda hekim ve diyetisyen kontrolü zorunludur.</p><a class="fm-link" href="${K}sayfa/bilimsel-kaynaklar/">Bilimsel Kaynaklar →</a></div></div>`;

function dip() {
  const bag = ([a, h]) => (h.startsWith('http') ? `<a href="${h}" rel="external">${a}</a>` : `<a href="${K}${h}">${a}</a>`);
  const kol = footerKolonlar.map((c) => `<div class="foot-col"><h5>${c.ad}</h5>${c.kalemler.map(bag).join('')}</div>`).join('');
  const sira = (l) => l.map(bag).join('<span class="sep"></span>');
  return `<footer class="footer orange">${uyariBandi}<div class="wrap"><div class="foot-grid"><div class="foot-brand"><div class="foot-lockup">${logo}</div><p class="foot-tag">Bilimsel beslenme bilgisini, akıllı araçları ve diyetisyenleri buluşturan sağlık platformu.</p></div>${kol}<div class="foot-app"><h5><span class="bd">Dada</span><span class="sf">Diet</span>’i İndir</h5><p class="foot-app-lead">Beslenme planını yanında taşı. Günlük takibin, programların ve uzman desteğin tek uygulamada.</p><div class="foot-app-stores"><span class="foot-app-store" role="link" aria-disabled="true"><i class="fa-brands fa-apple"></i><span>İndir<b>App Store</b></span></span><span class="foot-app-store" role="link" aria-disabled="true"><i class="fa-brands fa-google-play"></i><span>İndir<b>Google Play</b></span></span></div></div></div><nav class="foot-corp" aria-label="Kurumsal">${sira(footerKurumsal)}</nav><nav class="foot-legal" aria-label="Yasal">${sira(footerYasal)}</nav><div class="foot-bottom"><span class="fb-left">© 2026 <b><span class="bd">Dada</span><span class="sf">Diet</span></b> · Dada İst Ajans Hizmetleri Ticaret Limited Şirketi · Tüm hakları saklıdır.</span><a class="foot-sign" href="https://gaviaworks.com" target="_blank" rel="noopener external"><span class="gw-code">&lt;/&gt;</span> GaviaWorks</a></div></div></footer>`;
}

function panelKabuk(meta, govde) {
  const eko = [['fit', 'fa-dumbbell', 'DadaFit'], ['gastro', 'fa-utensils', 'DadaGastro'], ['diet', 'fa-heart-pulse', 'DadaDiet'], ['gourmet', 'fa-map-location-dot', 'DadaGourmet']];
  const ray = eko.map(([e, i, a]) => `<a class="panel-ray-ikon" href="#" data-eko="${e}" title="${a}" aria-label="${a}"><i class="fa-solid ${i}"></i></a>`).join('');
  const menu = panelMenu.map((g) => `<div class="panel-menu-bolum">${g.bolum}</div>` + g.kalemler.map(([id, i, a, h, s]) => `<a class="panel-menu-link${meta.aktif === id ? ' aktif' : ''}"${meta.aktif === id ? ' aria-current="page"' : ''} href="${K}${h}"><i class="fa-solid ${i}"></i>${a}${s ? `<span class="sayac">${s}</span>` : ''}</a>`).join('')).join('');
  return `<aside class="panel-ray" aria-label="Marka rayı">${ray}<div class="panel-ray-alt"></div></aside>
<nav class="panel-menu" id="panelMenu" aria-label="Modüller"><div class="panel-menu-bas"><a class="panel-marka" href="${K}diyetisyen-paneli/" aria-label="DadaDiet diyetisyen paneli"><span class="yalniz-okuyucu">DadaDiet · Diyetisyen paneli</span></a></div><button type="button" class="panel-katla" aria-pressed="false" aria-label="Menüyü daralt"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button><div class="panel-menu-govde">${menu}</div><div class="panel-menu-alt"><a class="panel-menu-link" href="${K}diyetisyen/dyt-ece-tunali/"><i class="fa-solid fa-eye"></i>Profilimi görüntüle</a><a class="panel-menu-link" href="${K}"><i class="fa-solid fa-arrow-up-right-from-square"></i>Siteyi gör</a></div></nav>
<header class="panel-ust"><button class="panel-ust-dugme panel-ac" type="button" aria-expanded="false" aria-controls="panelMenu" aria-label="Modül menüsünü aç"><i class="fa-solid fa-bars" aria-hidden="true"></i></button><div class="panel-arama"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><input type="search" class="panel-arama-girdi" placeholder="Danışan, randevu veya plan ara" autocomplete="off" aria-label="Panelde ara"></div><div class="panel-ust-sag"><a class="panel-ust-dugme" href="${K}diyetisyen-paneli/bildirimler/" aria-label="Bildirimler, 2 okunmamış"><i class="fa-solid fa-bell"></i><span class="benek" aria-hidden="true"></span></a><div class="acilir-kap"><button class="panel-ust-ben" type="button" aria-expanded="false" aria-controls="hesapAcilir"><span class="kisi-avatar" aria-hidden="true">ET</span><span><span class="ad">Dyt. Ece Tunalı</span><span class="rol">Diyetisyen</span></span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button><div class="acilir-yuzey saga" id="hesapAcilir" role="menu" aria-label="Hesap" hidden><div class="acilir-bas">Dyt. Ece Tunalı</div><a class="acilir-kalem" href="${K}diyetisyen-paneli/profil/" role="menuitem"><i class="fa-solid fa-id-badge"></i>Profilim</a><a class="acilir-kalem" href="${K}diyetisyen-paneli/hesap-ayarlari/" role="menuitem"><i class="fa-solid fa-sliders"></i>Hesap ayarları</a><a class="acilir-kalem" href="${K}" role="menuitem"><i class="fa-solid fa-right-from-bracket"></i>Çıkış yap</a></div></div></div></header>
<main class="panel-govde"><div class="panel-sayfa">${govde}</div></main>`;
}

export function kabukla(s, { istekler }) {
  const m = s.meta ?? {};
  const duzen = m.duzen ?? 'public';
  const panel = duzen === 'panel';
  const css = ['taban', ...(panel ? [] : ['kabuk']), 'tokenlar', 'diet', 'bilesenler', ...(panel ? ['admin'] : []), 'ek-bilesenler'];
  const link = css.map((c) => `<link rel="stylesheet" href="${K}assets/css/${c}.css">`).join('\n');
  const fa = `<link rel="stylesheet" href="${K}assets/fontawesome/css/all.min.css">`;
  const js = [
    ...(panel ? ['assets/js/panel/panel.js', 'assets/js/panel/admin-kit.js'] : []),
    'assets/js/veri.js', 'assets/js/demo.js', 'assets/js/ortak.js', 'assets/js/bildirim-zili.js', 'assets/js/mentor.js', 'assets/js/kenar-dugmeler.js', 'assets/js/bayrak.js',
    ...(panel ? ['assets/js/sayfa/panel-a-ortak.js'] : []),
    /* Reklam önizleme kipi bütün düzenlerde okunur (panel ve tam ekranda yalnız oturum kipi; yüzey yok) */
    'assets/js/reklam/onizle.js',
    ...(panel || duzen === 'tam' ? [] : ['assets/js/misafir.js']),
    ...(m.js ?? []).filter((j) => !(panel && j.endsWith('panel-a-ortak.js'))),
  ].filter((j, i, l) => l.indexOf(j) === i).map((j) => `<script src="${K}${j}"${j.endsWith('reklam/onizle.js') ? ` data-rk-surum="${RK_SURUM}"` : ''} defer></script>`).join('\n');
  const govde = duzen === 'panel' ? panelKabuk(m, s.govde)
    : duzen === 'tam' ? `${s.govde}<footer class="footer orange tam-uyari">${uyariBandi}</footer>`
    : `${ust(m, s.yol)}${altCubuk(m, s.yol)}<main class="page-main" id="pageMain" tabindex="-1">${s.govde}${duzen === 'public' ? tibbiSerit : ''}</main>${dip()}${gorusBildir}${cerezBandi}${standartKatman()}`;
  const bodySinif = panel ? ' class="yetkili" data-marka="diet"' : ` data-brand="diet"${duzen === 'uye' ? ' class="is-auth"' : ''}`;
  const oturum = (duzen === 'uye' ? `document.documentElement.dataset.oturum='1'` : `try{if(localStorage.getItem('dd-oturum')==='1')document.documentElement.dataset.oturum='1'}catch(e){}`)
    /* Boş durum önizlemesi (S3): ?bos=1 örnek veriyi gizler, boş durum tasarımını açar; ilk boyamadan önce */
    + `;if(/[?&]bos=1(&|$)/.test(location.search))document.documentElement.classList.add('bos-kip')`;
  return `<!doctype html>
<html lang="tr" data-kok="${K}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${kacis(m.baslik ?? 'Dada Diet')} · Dada Diet</title>
<meta name="robots" content="noindex">
<link rel="icon" href="${K}assets/img/marka/favicon.ico">
${fa}
${link}
<script>${oturum}</script>
${js}
</head>
<body${bodySinif}>
${govde}
</body>
</html>
`;
}
