/* Hizmet paketleri listesi: durum süzgeci, yayın anahtarı, satışı olmayan paketi silme. */
(function () {
  'use strict';
  const { $, esc, sayi } = PB;
  let suzgec = 'hepsi', q = '';
  const paketler = () => PB.liste('paketler');
  const durum = (p) => (p.onay === 'bekliyor' ? { k: 'onay', ad: 'Onay bekliyor', hap: 'bekleyen' } : p.aktif ? { k: 'yayinda', ad: 'Yayında', hap: 'cozulen' } : { k: 'kapali', ad: 'Yayında değil', hap: 'kapali' });
  const TUR = { online: 'Online', 'yüz yüze': 'Yüz yüze', karma: 'Online ve yüz yüze' };

  function kpiCiz() {
    const l = paketler(), yayin = l.filter((p) => p.aktif), onay = l.filter((p) => p.onay === 'bekliyor').length;
    const satis = l.reduce((a, p) => a + (p.satis_sayisi || 0), 0), enDusuk = Math.min(...yayin.map((p) => p.fiyat));
    const k = [['fa-box-open', 'Paket', l.length, yayin.length + ' yayında'], ['fa-hourglass-half', 'Onay bekleyen', onay, 'Yeni paket ya da fiyat değişikliği'], ['fa-receipt', 'Satış', sayi(satis), 'Bütün paketlerde'], ['fa-tag', 'En düşük fiyat', yayin.length ? PB.tl(enDusuk) : '—', 'Profil kartında görünen fiyat']];
    $('#paketKpi').innerHTML = k.map(([i, e, s, a]) => '<div class="kart kpi"><span class="ikon"><i class="fa-solid ' + i + '" aria-hidden="true"></i></span><div class="govde"><span class="etiket">' + e + '</span><span class="sayi">' + s + '</span><span class="kpi-degisim"><i class="fa-solid fa-minus" aria-hidden="true"></i> ' + a + '</span></div></div>').join('');
  }
  const aktifDanisan = (p) => PB.danisanlar().filter((x) => x.paket_id === p.id && x.durum !== 'bitti').length;
  function satir(p) {
    const d = durum(p), ad = esc(p.ad), satis = p.satis_sayisi || 0;
    const duzenle = DD.kok + 'diyetisyen-paneli/hizmet-paketleri/yeni/?id=' + encodeURIComponent(p.id);
    return '<tr data-id="' + esc(p.id) + '"><td><a href="' + duzenle + '"><b>' + ad + '</b></a><small>' + TUR[p.tur] + '</small></td>' +
      '<td data-etiket="Süre">' + p.seans + ' seans · ' + p.sure + ' dk</td>' +
      '<td class="num" data-etiket="Fiyat">' + PB.sira(p.fiyat) + PB.tl(p.fiyat) + (p.bekleyen_fiyat ? '<small>Onayda: ' + PB.tl(p.bekleyen_fiyat) + '</small>' : '') + '</td>' +
      '<td class="num" data-etiket="Satış">' + sayi(satis) + '<small>' + aktifDanisan(p) + ' aktif danışan</small></td>' +
      '<td data-etiket="Durum"><span class="durum-hapi ' + d.hap + '">' + d.ad + '</span>' + (d.k === 'onay' ? '<button class="sonraki-bag" type="button" data-paket="onayla">Yönetim onayını işle (demo)</button>' : d.k === 'kapali' ? '<button class="sonraki-bag" type="button" data-paket="anahtar">Yeniden yayına al</button>' : '') + '</td>' +
      '<td class="eylem"><span class="satir-eylem"><a class="ikon-dugme" href="' + duzenle + '" aria-label="' + ad + ' düzenle"><i class="fa-solid fa-pen" aria-hidden="true"></i></a>' +
      '<button class="ikon-dugme" type="button" data-paket="anahtar" aria-label="' + ad + (p.aktif ? ' yayından kaldır' : ' yayına al') + '"><i class="fa-solid ' + (p.aktif ? 'fa-eye-slash' : 'fa-eye') + '" aria-hidden="true"></i></button>' +
      '<button class="ikon-dugme yikici" type="button" data-paket="sil" aria-label="' + ad + ' sil"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></span></td></tr>';
  }
  function ciz() {
    const ql = PB.kucuk(q), l = paketler().filter((p) => (suzgec === 'hepsi' || durum(p).k === suzgec) && PB.kucuk(p.ad).includes(ql));
    $('#paketSatirlar').innerHTML = l.map(satir).join('');
    $('#paketSayac').textContent = l.length;
    $('#paketTablo').hidden = !l.length;
    $('#paketBos').hidden = l.length > 0;
    kpiCiz();
  }
  document.addEventListener('dd:secim', (e) => { if (e.target.id === 'paketSuzgec') { suzgec = e.detail.deger; ciz(); } });
  $('#paketAra').addEventListener('input', function () { q = this.value.trim(); ciz(); });
  document.addEventListener('click', function (e) {
    const d = e.target.closest('[data-paket]');
    if (!d) return;
    const p = paketler().find((x) => x.id === d.closest('tr').dataset.id);
    if (d.dataset.paket === 'onayla') {
      if (p.bekleyen_fiyat) { p.fiyat = p.bekleyen_fiyat; delete p.bekleyen_fiyat; }
      p.onay = null; p.aktif = true;
      PB.kaydet(); DD.toast('“' + p.ad + '” yayında. Üye paketlerde bu fiyatı görüyor.'); ciz();
      return;
    }
    if (d.dataset.paket === 'anahtar') {
      if (p.aktif) {
        window.DM_ONAY('Paket yayından kalksın mı?', '“' + p.ad + '” profilinde görünmez. Mevcut danışanların seansları etkilenmez.', 'Yayından kaldır', (ok) => {
          if (!ok) return; p.aktif = false; PB.kaydet(); DD.toast('Paket yayından kaldırıldı.'); ciz();
        });
      } else if (p.onay === 'bekliyor') DD.toast('Paket yönetim onayında, onaydan sonra yayına girer.', 'uyari');
      else { p.aktif = true; PB.kaydet(); DD.toast('Paket yeniden yayında.'); ciz(); }
      return;
    }
    if (p.satis_sayisi || aktifDanisan(p)) { DD.toast('Bu paketi kullanan danışan ya da satış var; silinemez, yayından kaldırılır.', 'uyari'); return; }
    window.DM_ONAY('Paket silinsin mi?', '“' + p.ad + '” kalıcı olarak silinir.', 'Sil', (ok) => {
      if (!ok) return; paketler().splice(paketler().indexOf(p), 1); PB.kaydet(); DD.toast('Paket silindi.'); ciz();
    });
  });
  ciz();
  if (PB.parametre('kayit')) DD.toast('Paket yönetim onayına gönderildi.');
})();
