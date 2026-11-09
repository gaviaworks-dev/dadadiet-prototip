/* Haftalık menü PDF'i: istemcide gerçek PDF üretir (jsPDF, assets/js/kutuphane altında; panel raporuyla aynı kütüphane).
   Kütüphane ve yazı yalnız düğmeye basıldığında yüklenir. Girdi: { program, aralik, uye, gunler: [{ gun, tarih, durum, ogunler: [{ ad, saat, metin }] }] } */
(function () {
  'use strict';
  const DD = window.DD;
  let hazir = null;
  const betik = (yol) => new Promise((tamam, hata) => {
    const s = document.createElement('script');
    s.src = DD.kok + yol; s.onload = tamam; s.onerror = () => hata(new Error(yol));
    document.head.appendChild(s);
  });
  const yukle = () => {
    hazir = hazir || Promise.all([betik('assets/js/kutuphane/jspdf.umd.min.js'), betik('assets/js/kutuphane/rapor-varlik.js')]).catch((e) => { hazir = null; throw e; });
    return hazir;
  };
  const renk = (ad) => {
    const e = document.createElement('span');
    e.style.color = 'var(' + ad + ')';
    document.body.appendChild(e);
    const m = getComputedStyle(e).color.match(/[\d.]+/g).slice(0, 3).map(Number);
    e.remove();
    return m;
  };
  const temiz = (s) => String(s == null ? '' : s).replace(/₺/g, 'TL').replace(/\p{Extended_Pictographic}|️|‍/gu, '').replace(/[ \t]+/g, ' ').trim();
  const slug = (s) => s.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  DD.menuPdf = (v) => yukle().then(() => {
    const V = window.DD_RAPOR_VARLIK, doc = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    const R = { aksan: renk('--aksan'), koyu: renk('--aksan-koyu'), yikama: renk('--aksan-yikama'), murekkep: renk('--murekkep'), ikincil: renk('--metin-ikincil'), cizgi: renk('--cizgi'), zemin: renk('--zemin') };
    doc.addFileToVFS('gilroy-normal.ttf', V.yazi.normal); doc.addFont('gilroy-normal.ttf', 'Gilroy', 'normal');
    doc.addFileToVFS('gilroy-kalin.ttf', V.yazi.kalin); doc.addFont('gilroy-kalin.ttf', 'Gilroy', 'bold');
    doc.setProperties({ title: v.program + ' · Haftalık Menü', subject: 'Prototip örneği', creator: 'Dada Diet' });
    doc.setLanguage('tr-TR');
    const EN = 297, BOY = 210, K = 12, IC = EN - K * 2;
    const yaz = (m, x, y, o = {}) => {
      doc.setFont('Gilroy', o.kalin ? 'bold' : 'normal'); doc.setFontSize(o.boy || 9); doc.setTextColor(...(o.renk || R.murekkep));
      doc.text(m, x, y, { align: o.hiza || 'left' });
    };
    function ust() {
      yaz('Dada Diet', K, K + 3, { kalin: true, boy: 14, renk: R.aksan });
      yaz('Haftalık Menü', EN - K, K + 2, { hiza: 'right', kalin: true, boy: 13 });
      yaz(temiz(v.program + ' · ' + v.aralik), EN - K, K + 7, { hiza: 'right', boy: 8.5, renk: R.ikincil });
      yaz(temiz((v.uye ? v.uye + ' · ' : '') + 'Yazdırma tarihi ' + DD.bicim.tarih(DD.bugun)), EN - K, K + 11, { hiza: 'right', boy: 8, renk: R.ikincil });
      const et = 'Prototip örneği', w = (doc.setFont('Gilroy', 'bold'), doc.setFontSize(7.5), doc.getTextWidth(et)) + 5;
      doc.setFillColor(...R.yikama); doc.roundedRect(K, K + 6, w, 5, 1.2, 1.2, 'F');
      yaz(et, K + 2.5, K + 9.5, { boy: 7.5, kalin: true, renk: R.koyu });
      doc.setDrawColor(...R.aksan); doc.setLineWidth(0.5); doc.line(K, K + 14, EN - K, K + 14);
      return K + 19;
    }
    /* Sütunlar: haftanın herhangi bir gününde geçen öğünler, ilk görüldüğü sırayla */
    const ogunAd = [];
    v.gunler.forEach((g) => g.ogunler.forEach((o) => { if (!ogunAd.includes(o.ad)) ogunAd.push(o.ad); }));
    const gunEn = 30, enler = ogunAd.map(() => (IC - gunEn) / Math.max(1, ogunAd.length)), sat = 3.3, pay = 1.8;
    let y = ust();
    const baslikSatir = () => {
      doc.setFillColor(...R.zemin); doc.rect(K, y, IC, 8, 'F');
      yaz('Gün', K + pay, y + 5.3, { kalin: true, boy: 8.5 });
      let x = K + gunEn;
      ogunAd.forEach((a, i) => { yaz(temiz(a), x + pay, y + 5.3, { kalin: true, boy: 8.5 }); x += enler[i]; });
      y += 8;
    };
    baslikSatir();
    v.gunler.forEach((g) => {
      doc.setFont('Gilroy', 'normal'); doc.setFontSize(8);
      const hucre = ogunAd.map((a, i) => {
        const o = g.ogunler.find((x) => x.ad === a);
        if (!o) return ['—'];
        return [o.saat].concat(...String(o.metin).split(' + ').map((m) => doc.splitTextToSize(temiz('• ' + m), enler[i] - pay * 2)));
      });
      const satir = Math.max(3, ...hucre.map((h) => h.length)), h = satir * sat + pay * 2;
      if (y + h > BOY - K) { doc.addPage(); y = ust(); baslikSatir(); }
      if (g.durum === 'Bugün') { doc.setFillColor(...R.yikama); doc.rect(K, y, IC, h, 'F'); }
      yaz(temiz(g.gun), K + pay, y + pay + 3, { kalin: true, boy: 9 });
      yaz(temiz(g.tarih), K + pay, y + pay + 3 + sat, { boy: 8, renk: R.ikincil });
      yaz(temiz(g.durum), K + pay, y + pay + 3 + sat * 2, { boy: 7.5, renk: R.koyu });
      let x = K + gunEn;
      hucre.forEach((l, i) => {
        l.forEach((m, j) => yaz(m, x + pay, y + pay + 3 + j * sat, { boy: 8, kalin: j === 0 && l.length > 1, renk: j === 0 && l.length > 1 ? R.ikincil : R.murekkep }));
        x += enler[i];
      });
      y += h;
      doc.setDrawColor(...R.cizgi); doc.setLineWidth(0.2); doc.line(K, y, EN - K, y);
    });
    yaz('Bu menü sana özel plandan çıkarıldı; değişiklik için diyetisyenine danış. Prototip örneğidir, tıbbi öneri yerine geçmez.', K, BOY - K + 4, { boy: 7.5, renk: R.ikincil });
    doc.save('dada-diet-haftalik-menu-' + slug(v.program) + '-' + DD.bugun + '.pdf');
  });
})();
