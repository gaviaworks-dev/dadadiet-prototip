/* Gelişim raporu PDF'i (ES-HS-42): Sağlık Dosyam › Raporlarım. uye-menu-pdf.js ile aynı kütüphane ve yazı, dikey A4.
   Girdi: { ad, uye, aralik, bolumler: [{ baslik, satirlar: [[etiket, deger]] , not }] }. Bölümler raporu oluştururken seçilenlerdir. */
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
    if (window.jspdf && window.DD_RAPOR_VARLIK) return Promise.resolve();
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

  DD.raporPdf = (v) => yukle().then(() => {
    const V = window.DD_RAPOR_VARLIK, doc = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const R = { aksan: renk('--aksan'), koyu: renk('--aksan-koyu'), yikama: renk('--aksan-yikama'), murekkep: renk('--murekkep'), ikincil: renk('--metin-ikincil'), cizgi: renk('--cizgi'), zemin: renk('--zemin') };
    doc.addFileToVFS('gilroy-normal.ttf', V.yazi.normal); doc.addFont('gilroy-normal.ttf', 'Gilroy', 'normal');
    doc.addFileToVFS('gilroy-kalin.ttf', V.yazi.kalin); doc.addFont('gilroy-kalin.ttf', 'Gilroy', 'bold');
    doc.setProperties({ title: v.ad + ' · Gelişim Raporu', subject: 'Prototip örneği', creator: 'Dada Diet' });
    doc.setLanguage('tr-TR');
    const EN = 210, BOY = 297, K = 14, IC = EN - K * 2, SAT = 5.2;
    const yaz = (m, x, y, o = {}) => {
      doc.setFont('Gilroy', o.kalin ? 'bold' : 'normal'); doc.setFontSize(o.boy || 9.5); doc.setTextColor(...(o.renk || R.murekkep));
      doc.text(m, x, y, { align: o.hiza || 'left' });
    };
    function ust() {
      yaz('Dada Diet', K, K + 3, { kalin: true, boy: 14, renk: R.aksan });
      yaz('Gelişim Raporu', EN - K, K + 2, { hiza: 'right', kalin: true, boy: 13 });
      yaz(temiz(v.ad + ' · ' + v.aralik), EN - K, K + 7, { hiza: 'right', boy: 8.5, renk: R.ikincil });
      yaz(temiz((v.uye ? v.uye + ' · ' : '') + 'Oluşturma tarihi ' + DD.bicim.tarih(DD.bugun)), EN - K, K + 11, { hiza: 'right', boy: 8, renk: R.ikincil });
      const et = 'Prototip örneği', w = (doc.setFont('Gilroy', 'bold'), doc.setFontSize(7.5), doc.getTextWidth(et)) + 5;
      doc.setFillColor(...R.yikama); doc.roundedRect(K, K + 6, w, 5, 1.2, 1.2, 'F');
      yaz(et, K + 2.5, K + 9.5, { boy: 7.5, kalin: true, renk: R.koyu });
      doc.setDrawColor(...R.aksan); doc.setLineWidth(0.5); doc.line(K, K + 14, EN - K, K + 14);
      return K + 22;
    }
    let y = ust();
    const yer = (h) => { if (y + h > BOY - K - 8) { doc.addPage(); y = ust(); } };
    v.bolumler.forEach((b) => {
      yer(16);
      doc.setFillColor(...R.zemin); doc.rect(K, y - 5, IC, 8, 'F');
      yaz(temiz(b.baslik), K + 2, y, { kalin: true, boy: 11 });
      y += 8;
      (b.satirlar || []).forEach(([e, d]) => {
        doc.setFont('Gilroy', 'normal'); doc.setFontSize(9.5);
        const l = doc.splitTextToSize(temiz(d), IC * 0.62);
        yer(l.length * SAT + 2);
        yaz(temiz(e), K + 2, y, { boy: 9.5, renk: R.ikincil });
        l.forEach((m, i) => yaz(m, K + IC * 0.36, y + i * SAT, { boy: 9.5 }));
        y += l.length * SAT + 1.5;
        doc.setDrawColor(...R.cizgi); doc.setLineWidth(0.15); doc.line(K, y - 3.2, EN - K, y - 3.2);
      });
      if (b.not) {
        doc.setFont('Gilroy', 'normal'); doc.setFontSize(8);
        const l = doc.splitTextToSize(temiz(b.not), IC - 4);
        yer(l.length * 4 + 2);
        l.forEach((m, i) => yaz(m, K + 2, y + i * 4, { boy: 8, renk: R.ikincil }));
        y += l.length * 4 + 2;
      }
      y += 6;
    });
    const son = doc.splitTextToSize('Bu rapor işaretlediğin kayıtlardan ve yüklediğin belgelerden çıkarıldı; bir sağlık değerlendirmesi değildir. Yorum için diyetisyenine ya da hekimine danış.', IC);
    son.forEach((m, i) => yaz(m, K, BOY - K - 4 + i * 4, { boy: 7.5, renk: R.ikincil }));
    doc.save('dada-diet-gelisim-raporu-' + slug(v.ad) + '-' + DD.bugun + '.pdf');
  });
})();
