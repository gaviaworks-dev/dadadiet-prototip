/* Paket formu: ?id= ile düzenler. Yeni paket ve yayındaki fiyat değişikliği onaya gider. */
(function () {
  'use strict';
  const { $, esc } = PB;
  const liste = PB.liste('paketler'), p = liste.find((x) => x.id === PB.parametre('id')) || null;
  const TUR = { online: 'Online', 'yüz yüze': 'Yüz yüze', karma: 'Online ve yüz yüze' };
  const oku = () => ({ ad: $('#pAd').value.trim(), aciklama: $('#pAciklama').value.trim(), seans: +$('#pSeans').value, sure: +$('#pSure').value, tur: $('#pTur').value, fiyat: +$('#pFiyat').value });

  function ciz() {
    const v = oku();
    $('#pFiyatNot').textContent = v.fiyat && v.seans ? 'Paketin tamamının fiyatı. Seans başına ' + PB.tl(v.fiyat / v.seans) + '.' : 'Paketin tamamının fiyatı.';
    $('#pOnizleme').innerHTML = '<h3>' + esc(v.ad || 'Paket adı') + '</h3><p>' + esc(v.aciklama || 'Paket içeriği burada görünür.') + '</p>' +
      '<p><span class="rozet olumlu">' + TUR[v.tur] + '</span> <span class="rozet pasif">' + (v.seans || 0) + ' seans · ' + v.sure + ' dk</span></p><div class="alt-satir"><b>' + PB.tl(v.fiyat) + '</b></div>';
    const durum = !p ? 'Kaydedilmedi' : p.onay === 'bekliyor' ? 'Onay bekliyor' : p.aktif ? 'Yayında' : 'Yayında değil';
    $('#pDurum').innerHTML = '<div class="deger-satir"><span>Onay durumu</span><b>' + durum + '</b></div>' +
      (p ? '<div class="deger-satir"><span>Satış</span><b>' + PB.sayi(p.satis_sayisi || 0) + '</b></div>' : '') +
      (p && p.bekleyen_fiyat ? '<div class="deger-satir"><span>Onaydaki fiyat</span><b>' + PB.tl(p.bekleyen_fiyat) + '</b></div>' : '');
  }
  function kaydet() {
    if (!PB.formGecerli($('#paketForm'))) return;
    const v = oku();
    if (!p) {
      liste.push(Object.assign(v, { id: PB.yeniId('p'), sure_hafta: v.seans, aktif: false, onay: 'bekliyor', satis_sayisi: 0 }));
      PB.kaydet();
      location.href = DD.kok + 'diyetisyen-paneli/hizmet-paketleri/?kayit=1';
      return;
    }
    const fiyatDegisti = p.aktif && v.fiyat !== p.fiyat;
    Object.assign(p, v, { sure_hafta: v.seans, fiyat: fiyatDegisti ? p.fiyat : v.fiyat });
    if (fiyatDegisti) { p.bekleyen_fiyat = v.fiyat; p.onay = 'bekliyor'; }
    PB.kaydet();
    DD.toast(fiyatDegisti ? 'Fiyat değişikliği onaya gönderildi; onaya kadar üye bugünkü fiyatı görür.' : 'Paket kaydedildi.');
    $('#pFiyat').value = v.fiyat;
    ciz();
  }
  document.addEventListener('click', function (e) {
    const d = e.target.closest('[data-paket]');
    if (!d) return;
    if (d.dataset.paket === 'kaydet') kaydet();
    if (d.dataset.paket === 'kaldir') {
      window.DM_ONAY('Paket yayından kalksın mı?', '“' + p.ad + '” profilinde görünmez. Mevcut danışanların seansları etkilenmez.', 'Yayından kaldır', (ok) => {
        if (!ok) return; p.aktif = false; PB.kaydet(); $('#pKaldir').hidden = true; DD.toast('Paket yayından kaldırıldı.'); ciz();
      });
    }
  });
  $('#paketForm').addEventListener('input', ciz);
  $('#paketForm').addEventListener('submit', (e) => e.preventDefault());
  if (p) {
    $('#paketBaslik').textContent = p.ad;
    $('#pAd').value = p.ad; $('#pAciklama').value = p.aciklama || ''; $('#pSeans').value = p.seans; $('#pSure').value = p.sure; $('#pTur').value = p.tur; $('#pFiyat').value = p.bekleyen_fiyat || p.fiyat;
    $('#pKaydet').textContent = 'Paketi kaydet';
    $('#pNot').textContent = 'Yayındaki fiyat değişikliği onaya gider';
    $('#pKaldir').hidden = !p.aktif;
  } else { $('#pSeans').value = 4; $('#pSure').value = 45; $('#pFiyat').value = 2400; }
  ciz();
})();
