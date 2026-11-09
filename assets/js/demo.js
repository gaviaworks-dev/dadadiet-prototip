/* Prototip demo durumu. Panelde yapılan işlem üye tarafına yansısın diye tarayıcıda tutulur.
   Yalnız prototip içindir; ürüne taşınmaz (üründe hesaba yazılır). Başlangıç verisi DD_VERI.demo. */
(function () {
  'use strict';
  const DD = (window.DD = window.DD || {});
  const ANAHTAR = 'dd-demo-durum-v11'; /* veri değişince sürüm artar, eski tarayıcı durumu okunmaz */
  const bas = () => JSON.parse(JSON.stringify((window.DD_VERI && window.DD_VERI.demo) || {}));
  let durum;
  try { durum = JSON.parse(localStorage.getItem(ANAHTAR)) || bas(); } catch (e) { durum = bas(); }
  /* Boş durum önizlemesi (?bos=1, kabukta html.bos-kip). Örnek veri iki yolla işaretlidir:
     dizideki kayıt "ornek": true taşır; nesneye eklenen alanlar "_ornek": ["alan", ...] listesinde durur.
     Bu kipte ikisi de bellekteki kopyadan çıkar, ekranlar kendi boş durumunu çizer; tarayıcıya yazılmaz.
     Derlemede basılan örnek içerik [data-ornek], karşılığı boş durum [data-bos] (ek-bilesenler.css). */
  DD.bosKip = document.documentElement.classList.contains('bos-kip');
  const ornekSuz = (x) => {
    if (Array.isArray(x)) return x.filter((o) => !(o && typeof o === 'object' && o.ornek === true)).map(ornekSuz);
    if (x && typeof x === 'object') {
      const y = {};
      Object.keys(x).forEach((k) => { if (!(Array.isArray(x._ornek) && x._ornek.includes(k))) y[k] = ornekSuz(x[k]); });
      return y;
    }
    return x;
  };
  if (DD.bosKip) durum = ornekSuz(durum);
  DD.bugun = (durum && durum.bugun) || '2026-11-06';
  DD.kok = document.documentElement.dataset.kok || './';
  DD.demo = {
    al: () => durum,
    kaydet() { if (DD.bosKip) return; try { localStorage.setItem(ANAHTAR, JSON.stringify(durum)); } catch (e) { /* gizli pencere: bellekte kalır */ } },
    sifirla() { durum = bas(); try { localStorage.removeItem(ANAHTAR); } catch (e) { /* yok say */ } },
  };
  DD.oturum = {
    acik: () => document.documentElement.dataset.oturum === '1',
    ac() { try { localStorage.setItem('dd-oturum', '1'); } catch (e) { /* yok say */ } document.documentElement.dataset.oturum = '1'; },
    kapat() { try { localStorage.removeItem('dd-oturum'); } catch (e) { /* yok say */ } delete document.documentElement.dataset.oturum; },
  };
  document.addEventListener('click', function (e) { if (e.target.closest('[data-cikis]')) DD.oturum.kapat(); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-demo-sifirla]')) return;
    try { Object.keys(localStorage).filter((k) => k.startsWith('dd-')).forEach((k) => localStorage.removeItem(k)); } catch (h) { /* yok say */ }
    DD.demo.sifirla();
    location.reload();
  });
  /* İçerik örnekleme: her tipte 1 detay üretildi. Öteki kayıtlara giden bağlantı o tipin örneğini açar. */
  const ORNEK = { besin: 'avokado', program: 'akdeniz-tipi-beslenme', hesaplayici: 'gunluk-kalori', test: 'beslenme', ipuclari: 'gunde-ne-kadar-su-icmek-gerekir', puflar: 'buzdolabinda-hangi-raf-neye-ait', 'kac-kalori': 'bir-avuc-badem-kac-kalori', 'besin-rehberi': 'dengeli-tabak', beslenme: 'dengeli-tabak' };
  const ORNEK_DISI = ['kategori'];
  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.origin !== location.origin) return;
    const kokYol = new URL(DD.kok, location.href).pathname;
    if (!a.pathname.startsWith(kokYol)) return;
    const p = a.pathname.slice(kokYol.length).split('/').filter(Boolean);
    if (p.length < 2 || !(p[0] in ORNEK) || p[1] === ORNEK[p[0]] || ORNEK_DISI.includes(p[1])) return;
    e.preventDefault();
    location.href = kokYol + (p[0] === 'beslenme' ? 'besin-rehberi' : p[0]) + '/' + ORNEK[p[0]] + '/';
  });
  /* Boş durum önizlemesi şeridi: reklam önizlemesiyle aynı bileşen; Kapat adresten ?bos=1'i siler */
  if (DD.bosKip) document.addEventListener('DOMContentLoaded', function () {
    const s = document.createElement('div');
    s.className = 'onizleme-serit';
    s.setAttribute('role', 'status');
    s.innerHTML = '<div class="kap"><i class="fa-solid fa-box-open" aria-hidden="true"></i><span>Boş durum önizlemesi açık</span><span class="onizleme-not">örnek veri gizli</span><button type="button" class="dugme hayalet kucuk">Kapat</button></div>';
    document.body.prepend(s);
    /* Panelde site başlığı yok: şerit içeriğin üstüne binmesin diye altta durur */
    const ust = document.querySelector('[data-site-header]');
    if (!ust) s.classList.add('alt');
    const konumla = () => { if (ust) document.documentElement.style.setProperty('--rk-serit-ust', Math.max(8, Math.round(ust.getBoundingClientRect().bottom + 8)) + 'px'); };
    konumla(); addEventListener('scroll', konumla, { passive: true }); addEventListener('resize', konumla);
    s.querySelector('button').addEventListener('click', () => { const u = new URL(location.href); u.searchParams.delete('bos'); location.replace(u.toString()); });
  });
  /* Satır içi stil yasağı: arka plan görselleri ve oranlar nitelikten uygulanır */
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-arkaplan]').forEach((e) => { e.style.backgroundImage = 'url("' + e.dataset.arkaplan + '")'; });
    document.querySelectorAll('[data-oran]').forEach((e) => { e.style.setProperty('--oran', e.dataset.oran); });
  });
})();
