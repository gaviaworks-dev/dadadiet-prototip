/* Belge kasası: yüklenen sağlık belgeleri bu tarayıcının IndexedDB'sinde (dd-saglik-belgeleri) saklanır.
   Sağlık Dosyam yazar; diyetisyen paneli aynı tarayıcıdaki demoda tahlil PDF'ini buradan açar.
   Depo açılamazsa (gizli pencere, engelli site verisi) işlemler sessiz değil, false / null döner; çağıran ekran söyler. */
(function () {
  'use strict';
  const DD = window.DD;
  let db;
  const ac = () => db || (db = new Promise((ok, red) => {
    try { const r = indexedDB.open('dd-saglik-belgeleri', 1); r.onupgradeneeded = () => r.result.createObjectStore('dosya'); r.onsuccess = () => ok(r.result); r.onerror = () => red(r.error); } catch (h) { red(h); }
  }));
  const is = (kip, f) => ac().then((v) => new Promise((ok, red) => { const t = v.transaction('dosya', kip); const s = f(t.objectStore('dosya')); t.oncomplete = () => ok(s && s.result); t.onerror = () => red(t.error); }));
  const adres = (v) => (v ? { url: URL.createObjectURL(v.dosya), tip: v.tip } : null);

  DD.belgeKasa = {
    /* Kayıt anahtarı: dosya adı ve yükleme tarihi */
    anahtar: (ad, tarih) => ad + '|' + tarih,
    koy: (k, d) => is('readwrite', (s) => s.put({ dosya: d, tip: d.type }, k)).then(() => true, () => false),
    sil: (k) => is('readwrite', (s) => s.delete(k)).then(() => true, () => false),
    al: (k) => is('readonly', (s) => s.get(k)).then(adres, () => null),
    /* Bütün kayıtları haritaya doldurur; harita zaten bilinen anahtarı ezmez */
    yukle: (harita) => ac().then((v) => new Promise((ok) => {
      const r = v.transaction('dosya').objectStore('dosya').openCursor();
      r.onsuccess = () => { const c = r.result; if (!c) { ok(); return; } if (!harita.has(c.key)) harita.set(c.key, adres(c.value)); c.continue(); };
      r.onerror = () => ok();
    })).catch(() => {}),
  };
})();
