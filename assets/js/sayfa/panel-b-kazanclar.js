/* Kazançlar: sayaçlar, 12 aylık grafik, bekleyen ödeme ve işlem listesi demo.kazanclar üzerinden çalışır. */
(function () {
  'use strict';
  const { $, $$, esc, sayi, tl } = PB;
  const k = PB.nesne('kazanclar');
  const AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const DURUM = { beklemede: ['Beklemede', 'bekleyen'], odendi: ['Ödendi', 'cozulen'], 'talep-edildi': ['Talep edildi', 'acik'], iptal: ['Gerçekleşmedi', 'kapali'] };
  const ASAMA = [['inceleniyor', 'Talep alındı', 'Ödeme ekibi inceliyor.'], ['onaylandi', 'Onaylandı', 'Hesabına aktarılmak üzere sıraya alındı.'], ['odendi', 'Ödendi', 'Tutar hesabına geçti.']];
  let suzgec = 'hepsi', q = '', seri = 'net';
  const ayAdi = (a) => AY[+a.ay.slice(5) - 1];

  function kpiCiz() {
    const son = k.aylik[k.aylik.length - 1], once = k.aylik[k.aylik.length - 2];
    const ort = k.aylik.slice(0, -1).reduce((a, x) => a + x.net, 0) / (k.aylik.length - 1);
    const kpi = [
      ['fa-sack-dollar', 'Bu ay net', tl(son.net), 'Kasım devam ediyor', ''],
      ['fa-calendar-check', 'Geçen ay net', tl(once.net), (once.net >= ort ? '+%' : '−%') + Math.abs(Math.round(((once.net - ort) / ort) * 100)) + ' 11 ay ortalamasına göre', once.net >= ort ? 'iyi' : 'kotu'],
      ['fa-wallet', 'Toplam net', tl(k.toplam.net), sayi(k.toplam.seans) + ' seans', ''],
      ['fa-percent', 'Komisyon', tl(k.toplam.komisyon), '%' + Math.round(k.komisyon_orani * 100) + ' oran', ''],
    ];
    $('#kazancKpi').innerHTML = kpi.map(([i, e, s, a, c]) => '<div class="kart kpi"><span class="ikon"><i class="fa-solid ' + i + '" aria-hidden="true"></i></span><div class="govde"><span class="etiket">' + e + '</span><span class="sayi">' + s + '</span><span class="kpi-degisim ' + c + '"><i class="fa-solid ' + (c === 'iyi' ? 'fa-arrow-trend-up' : c === 'kotu' ? 'fa-arrow-trend-down' : 'fa-minus') + '" aria-hidden="true"></i> ' + a + '</span></div></div>').join('');
  }
  function grafikCiz() {
    const ad = { net: 'Net kazanç', gelir: 'Brüt gelir', seans: 'Seans' }[seri];
    DD.grafik.cizgi($('#kazancGrafik'), { baslik: 'Son 12 Ay ' + ad, etiketler: k.aylik.map(ayAdi), seriler: [{ ad, degerler: k.aylik.map((a) => a[seri]) }] });
    $('#grafikNot').textContent = ad + (seri === 'seans' ? ' adedi' : ', ₺') + '. Son ay ' + DD.bicim.tarih(DD.bugun) + ' tarihine kadar sayıldı.';
  }
  const talepler = () => { if (!k.odeme_talepleri) k.odeme_talepleri = []; return k.odeme_talepleri; };
  function bekleyenCiz() {
    const b = k.bekleyen_odeme, son = talepler()[0], sira = son ? ASAMA.findIndex((a) => a[0] === son.durum) : -1, acikTalep = son && son.durum !== 'odendi';
    const sonucsuz = PB.liste('randevular').filter((r) => r.durum === 'sonuc-bekliyor').length;
    $('#bekleyenGovde').innerHTML = '<div class="yigin sik"><div class="deger-liste">' +
      '<div class="deger-satir"><span>Bekleyen net</span><b>' + tl(b.tutar) + '</b></div>' +
      '<div class="deger-satir"><span>İşlem sayısı</span><b>' + b.islem_sayisi + '</b></div>' +
      '<div class="deger-satir"><span>Sıradaki hakediş</span><b>' + PB.tarih(b.odeme_tarihi) + '</b></div></div>' +
      (son ? '<div class="zaman-cizelgesi" aria-label="' + tl(son.tutar) + ' talebinin durumu">' + ASAMA.map((a, i) => '<div class="zc-kalem' + (i <= sira ? ' gecti' : '') + '"><div class="zc-baslik">' + a[1] + (i === 0 ? ' · ' + tl(son.tutar) : '') + '</div>' + (i === sira ? '<div class="zc-metin">' + a[2] + '</div>' : '') + '</div>').join('') + '</div>' +
        (acikTalep ? '<button class="sonraki-bag" type="button" data-kazanc="ilerlet">Ödeme ekibi işlemini ilerlet (demo)</button>' : '') : '') +
      '<button class="dugme birincil tam-en" type="button" data-kazanc="talep-ac"' + (b.tutar > 0 && !acikTalep ? '' : ' disabled') + '><i class="fa-solid fa-money-bill-transfer" aria-hidden="true"></i> Ödeme talep et</button>' +
      (sonucsuz ? '<a class="sonraki-bag" href="' + DD.kok + 'diyetisyen-paneli/takvim/">' + sonucsuz + ' görüşmenin sonucu girilmedi <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' : '') +
      '<p class="alan-yardim"><i class="fa-solid fa-building-columns" aria-hidden="true"></i><span>Talep edilmezse bekleyen tutar hakediş tarihinde otomatik aktarılır.</span></p></div>';
  }
  function tabloCiz() {
    const ql = PB.kucuk(q);
    const l = k.son_islemler.filter((x) => {
      const d = PB.danisan(x.danisan_id);
      return (suzgec === 'hepsi' || x.durum === suzgec) && (PB.kucuk(x.aciklama).includes(ql) || (d && PB.kucuk(d.ad).includes(ql)));
    });
    $('#islemSatirlar').innerHTML = l.map((x) => {
      const d = PB.danisan(x.danisan_id), s = DURUM[x.durum] || DURUM.beklemede;
      return '<tr><td>' + PB.sira(x.tarih) + PB.tarih(x.tarih) + '</td><td data-etiket="Danışan">' + (d ? '<a href="' + DD.kok + 'diyetisyen-paneli/danisanlar/' + d.id + '/">' + esc(d.ad) + '</a>' : '—') + '</td><td data-etiket="Açıklama">' + esc(x.aciklama) + '</td><td class="num" data-etiket="Tutar">' + tl(x.tutar) + '</td><td class="num" data-etiket="Komisyon">' + tl(x.komisyon) + '</td><td class="num" data-etiket="Net"><b>' + tl(x.net) + '</b></td><td data-etiket="Durum"><span class="durum-hapi ' + s[1] + '">' + s[0] + '</span></td></tr>';
    }).join('');
    $('#islemSayac').textContent = l.length;
    $('#islemTablo').hidden = !l.length; $('#islemBos').hidden = l.length > 0;
    return l;
  }
  function csv() {
    const satir = [['Tarih', 'Danışan', 'Açıklama', 'Tutar', 'Komisyon', 'Net', 'Durum']].concat(tabloCiz().map((x) => {
      const d = PB.danisan(x.danisan_id);
      return [x.tarih, d ? d.ad : '', x.aciklama, x.tutar, x.komisyon, x.net, (DURUM[x.durum] || [x.durum])[0]];
    }));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + satir.map((r) => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'kazanc-islemleri.csv'; a.click(); URL.revokeObjectURL(a.href);
    DD.toast((satir.length - 1) + ' işlem dışa aktarıldı.');
  }
  document.addEventListener('click', function (e) {
    const d = e.target.closest('[data-kazanc]');
    if (!d) return;
    if (d.dataset.kazanc === 'csv') csv();
    if (d.dataset.kazanc === 'ilerlet') {
      const t = talepler()[0], i = ASAMA.findIndex((a) => a[0] === t.durum);
      t.durum = ASAMA[i + 1][0];
      if (t.durum === 'odendi') k.son_islemler.forEach((x) => { if ((t.islemler || []).includes(x.id)) x.durum = 'odendi'; });
      PB.kaydet();
      DD.toast(t.durum === 'odendi' ? tl(t.tutar) + ' hesabına geçti, işlemler Ödendi oldu.' : 'Talep onaylandı.');
      bekleyenCiz(); tabloCiz();
    }
    if (d.dataset.kazanc === 'talep-ac') {
      const b = k.bekleyen_odeme;
      $('#talepGovde').innerHTML = '<div class="deger-liste"><div class="deger-satir"><span>Tutar</span><b>' + tl(b.tutar) + '</b></div><div class="deger-satir"><span>İşlem</span><b>' + b.islem_sayisi + ' seans</b></div><div class="deger-satir"><span>Hesap</span><b>TR•• •••• •••• •••• 4821</b></div></div><div class="bilgi-notu"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><p>Talep bekleyen tutarın tamamı için açılır. Ödeme ekibi inceledikten sonra iki iş günü içinde aktarılır.</p></div>';
      DD.ac('#talepModal');
    }
    if (d.dataset.kazanc === 'talep') {
      const b = k.bekleyen_odeme;
      const idler = k.son_islemler.filter((x) => x.durum === 'beklemede').map((x) => x.id);
      talepler().unshift({ id: PB.yeniId('ot'), tarih: DD.bugun, tutar: b.tutar, islem_sayisi: b.islem_sayisi, durum: 'inceleniyor', islemler: idler });
      k.son_islemler.forEach((x) => { if (idler.includes(x.id)) x.durum = 'talep-edildi'; });
      b.tutar = 0; b.islem_sayisi = 0;
      PB.kaydet();
      DD.kapat($('#talepModal'));
      DD.toast('Ödeme talebin alındı.');
      bekleyenCiz(); tabloCiz();
    }
  });
  document.addEventListener('dd:secim', function (e) {
    if (e.target.id === 'grafikSeri') { seri = e.detail.deger; grafikCiz(); }
    if (e.target.id === 'islemSuzgec') { suzgec = e.detail.deger; tabloCiz(); }
  });
  $('#islemAra').addEventListener('input', function () { q = this.value.trim(); tabloCiz(); });
  const yeni = PBD.kazancSenkron();
  kpiCiz(); grafikCiz(); bekleyenCiz(); tabloCiz();
  if (yeni) DD.toast(yeni + ' görüşme sonucu kazanca işlendi.');
})();
