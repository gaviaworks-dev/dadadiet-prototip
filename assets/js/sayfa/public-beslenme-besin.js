/* Besin detayı: porsiyon değiştirici (gram) ve "Bugünkü öğünüme ekle".
   Değerler 100 g kaydından orantılanır. Üyede günlüğe yazılır; misafirde misafir deposunda tutulur, kayıtta aktarılır. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const kart = $('besinPorsiyon');
  if (!kart) return;
  const OGUN_AD = { kahvalti: 'Kahvaltı', ara1: 'Ara Öğün', ogle: 'Öğle Yemeği', ara2: 'İkindi', aksam: 'Akşam Yemeği' };
  const besin = () => { const l = (window.DD_VERI && window.DD_VERI.besinler) || []; return (Array.isArray(l) ? l : l.besinler || []).find((b) => b.slug === kart.dataset.slug) || {}; };
  const gram = () => { const v = parseFloat($('porsiyonGram').value); return v > 0 ? Math.min(v, 2000) : 100; };
  function ciz() {
    const g = gram();
    $('porsiyonBaslik').textContent = DD.bicim.sayi(g) + ' g';
    kart.querySelectorAll('[data-porsiyon][data-deger]').forEach((td) => {
      td.textContent = DD.bicim.sayi((+td.dataset.deger * g) / 100, +td.dataset.basamak) + ' ' + td.dataset.birim;
    });
    $('porsiyonHizli').querySelectorAll('[data-gram]').forEach((c) => c.classList.toggle('aktif', +c.dataset.gram === g));
  }
  $('porsiyonGram').addEventListener('input', ciz);
  $('porsiyonHizli').addEventListener('click', (e) => { const c = e.target.closest('[data-gram]'); if (c) { $('porsiyonGram').value = c.dataset.gram; ciz(); } });

  const kalem = () => {
    const b = besin(), g = gram(), v = (a) => (b[a] == null ? 0 : (b[a] * g) / 100);
    return { tur: 'besin', slug: kart.dataset.slug, ad: kart.dataset.ad, miktar: g, olcu: DD.bicim.sayi(g) + ' g', kcal: v('kcal'), protein: v('protein'), yag: v('yag'), karb: v('karb') };
  };
  const durum = (ogun) => { const d = $('besinOgunDurum'); d.hidden = false; d.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>' + kart.dataset.ad + ' ' + OGUN_AD[ogun] + ' öğününe eklendi · <a href="' + DD.kok + 'hesabim/gunluk-takibim/">Günlük takibimde gör</a></span>'; };
  let bekleyen = null;
  $('besinOgunEkle').addEventListener('click', () => {
    const ogun = $('besinOgun').value, k = kalem();
    if (DD.oturum.acik()) {
      const d = DD.demo.al();
      d.uyeYerel = d.uyeYerel || {};
      const ek = (d.uyeYerel.gunlukEk = d.uyeYerel.gunlukEk || {});
      ek[DD.bugun] = (ek[DD.bugun] || []).concat(Object.assign(k, { ogun, kaynak: 'besin-detay' }));
      DD.demo.kaydet();
      durum(ogun);
      DD.toast(kart.dataset.ad + ' ' + OGUN_AD[ogun] + ' öğününe eklendi.');
      return;
    }
    DD.misafir.ekle('tabak', { ogun, kalemler: [k] }, 'besin-' + k.slug + '-' + ogun);
    bekleyen = ogun;
    DD.davet.ac({ baslik: 'Bugünkü öğünüme ekle', metin: kart.dataset.ad + ' (' + k.olcu + ') bu tarayıcıda tutuluyor. Kaydolunca bugünkü ' + OGUN_AD[ogun] + ' öğününe eklenir ve takibe başlarsın.' });
  });
  document.addEventListener('dd:oturum', () => { if (bekleyen) { durum(bekleyen); bekleyen = null; } });
  ciz();
})();
