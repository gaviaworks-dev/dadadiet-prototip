/* Danışan ilerleme raporu: istemcide gerçek PDF üretir (jsPDF, assets/js/kutuphane altında).
   Kütüphane ve yazı dosyaları yalnız rapor istendiğinde yüklenir. Veri demo durumundaki ölçümlerdir.
   Yeme bozukluğu öyküsünde kilo, hedef ve ölçüm rapora girmez (K21.7, K21.10). */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA;
  if (!PA) return;
  const SAYFA = { en: 210, boy: 297, kenar: 15 };
  const ICERIK = SAYFA.en - SAYFA.kenar * 2;

  /* Tercihler üyenin hesabında, hassasiyet listesi danışan kaydında tutulur: ikisi de sayılır */
  PA.yemeDuyarli = (dn) => {
    const u = PA.d().uye || {}, t = u.danisan_id === dn.id ? (u.tercihler || {}).hassasiyet || [] : [];
    return t.concat(dn.hassasiyetler || []).includes('yeme-bozuklugu');
  };

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

  /* Renkler token'dan okunur; PDF'e RGB olarak geçer */
  const renk = (ad) => {
    const e = document.createElement('span');
    e.style.color = 'var(' + ad + ')';
    document.body.appendChild(e);
    const m = getComputedStyle(e).color.match(/[\d.]+/g).slice(0, 3).map(Number);
    e.remove();
    return m;
  };
  /* Yazı alt kümesinde olmayan işaretler (emoji gibi) metinden çıkar */
  const temiz = (s) => String(s == null ? '' : s).replace(/₺/g, 'TL').replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, '').replace(/[ \t]+/g, ' ').trim();
  const dosyaAdi = (ad) => 'dada-diet-ilerleme-raporu-' + ad.toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + DD.bugun + '.pdf';

  function raporKur(dn, secenek) {
    const V = window.DD_RAPOR_VARLIK, doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const R = { aksan: renk('--aksan'), koyu: renk('--aksan-koyu'), yikama: renk('--aksan-yikama'), murekkep: renk('--murekkep'), ikincil: renk('--metin-ikincil'), cizgi: renk('--cizgi'), zemin: renk('--zemin') };
    doc.addFileToVFS('gilroy-normal.ttf', V.yazi.normal); doc.addFont('gilroy-normal.ttf', 'Gilroy', 'normal');
    doc.addFileToVFS('gilroy-kalin.ttf', V.yazi.kalin); doc.addFont('gilroy-kalin.ttf', 'Gilroy', 'bold');
    doc.setProperties({ title: dn.ad + ' İlerleme Raporu', subject: 'Prototip örneği', author: PA.d().diyetisyen.ad, creator: 'Dada Diet' });
    doc.setLanguage('tr-TR');
    const K = SAYFA.kenar, sagX = SAYFA.en - K;
    const yaz = (metin, x, y, o = {}) => {
      doc.setFont('Gilroy', o.kalin ? 'bold' : 'normal'); doc.setFontSize(o.boy || 9.5); doc.setTextColor(...(o.renk || R.murekkep));
      doc.text(temiz(metin), x, y, { align: o.hiza || 'left', baseline: o.taban || 'alphabetic' });
    };
    const cizgi = (x1, y1, x2, y2, c = R.cizgi, k = 0.2) => { doc.setDrawColor(...c); doc.setLineWidth(k); doc.line(x1, y1, x2, y2); };

    /* Kelime logosu vektör olarak çizilir */
    function logo(x, y, en) {
      const [vx, vy, vw, vh] = V.logo.kutu, o = en / vw, p = (a, b) => [x + (a - vx) * o, y + (b - vy) * o];
      const ops = [], t = V.logo.yol.match(/[MCLZ]|-?[\d.]+/g);
      for (let i = 0; i < t.length;) {
        const c = t[i++];
        if (c === 'Z') { ops.push({ op: 'h', c: [] }); continue; }
        const n = c === 'C' ? 6 : 2, s = t.slice(i, i + n).map(Number); i += n;
        const q = []; for (let j = 0; j < n; j += 2) q.push(...p(s[j], s[j + 1]));
        ops.push({ op: c === 'M' ? 'm' : c === 'L' ? 'l' : 'c', c: q });
      }
      doc.setFillColor(...R.aksan);
      doc.path(ops).fill();
      return vh * o;
    }
    function ust() {
      logo(K, K - 2, 42);
      yaz('İlerleme Raporu', sagX, K + 2, { hiza: 'right', kalin: true, boy: 14 });
      yaz('Rapor tarihi ' + PA.tarih(DD.bugun), sagX, K + 7.5, { hiza: 'right', boy: 8.5, renk: R.ikincil });
      const et = 'Prototip örneği', w = (doc.setFont('Gilroy', 'bold'), doc.setFontSize(7.5), doc.getTextWidth(et)) + 5;
      doc.setFillColor(...R.yikama); doc.roundedRect(K, K + 8.2, w, 5, 1.2, 1.2, 'F');
      yaz(et, K + 2.5, K + 11.7, { boy: 7.5, kalin: true, renk: R.koyu });
      cizgi(K, K + 16, sagX, K + 16, R.aksan, 0.5);
      return K + 23;
    }
    const baslik = (metin, y) => { yaz(metin, K, y, { kalin: true, boy: 11.5 }); return y + 5; };

    let y = ust();
    const sigmaz = (h) => { if (y + h <= SAYFA.boy - 20) return; doc.addPage(); y = ust(); };

    /* Danışan bilgisi ve hedef */
    const duyarli = secenek.duyarli, dy = PA.d().diyetisyen;
    y = baslik('Danışan Bilgileri', y);
    doc.setFillColor(...R.zemin); doc.roundedRect(K, y, ICERIK, 21, 2, 2, 'F');
    yaz(dn.ad, K + 5, y + 7.5, { kalin: true, boy: 12 });
    yaz([dn.yas ? dn.yas + ' yaş' : '', dn.cinsiyet, dn.boy ? dn.boy + ' cm' : ''].filter(Boolean).join(' · '), K + 5, y + 13, { boy: 9, renk: R.ikincil });
    yaz('Diyetisyen: ' + dy.ad, K + 5, y + 17.5, { boy: 9, renk: R.ikincil });
    const hedefX = K + ICERIK / 2;
    yaz(duyarli ? 'Odak' : 'Hedef', hedefX, y + 7.5, { kalin: true, boy: 9 });
    doc.setFont('Gilroy', 'normal'); doc.setFontSize(9);
    const hedefMetin = duyarli ? 'Düzenli beslenme ve iyi oluş, uzman eşliğinde' : dn.hedef;
    doc.setTextColor(...R.murekkep); doc.text(doc.splitTextToSize(temiz(hedefMetin), ICERIK / 2 - 6).slice(0, 2), hedefX, y + 12.5);
    y += 27;

    if (duyarli) {
      doc.setFillColor(...R.yikama); doc.roundedRect(K, y, ICERIK, 15, 2, 2, 'F');
      doc.setFont('Gilroy', 'normal'); doc.setFontSize(9); doc.setTextColor(...R.murekkep);
      doc.text(doc.splitTextToSize('Bu rapor kilo, hedef ve vücut ölçüsü bilgisi içermez. Ölçüm kayıtları Sağlık Dosyam ekranındadır; yalnız kendi isteğinle açılır. Sorunda diyetisyenine Dada Diet hesabındaki Diyetisyenim ekranından ulaşabilirsin.', ICERIK - 10), K + 5, y + 6);
      y += 21;
    } else {
      /* Dört gösterge: program başından bu yana */
      const i = PA.ilerleme(dn), en = (ICERIK - 9) / 4;
      [['Başlangıç', PA.sayi(i.bas) + ' kg', PA.tarih(dn.olcumler[0].tarih)], ['Güncel', PA.sayi(i.son) + ' kg', PA.tarih(dn.olcumler[dn.olcumler.length - 1].tarih)], ['Değişim', PA.kgMetin(i.degisim), i.hafta + '. hafta'], ['Hedef', PA.sayi(i.hedef) + ' kg', '%' + i.yuzde + ' ilerleme']].forEach(([a, b, c], n) => {
        const x = K + n * (en + 3);
        doc.setDrawColor(...R.cizgi); doc.setLineWidth(0.2); doc.roundedRect(x, y, en, 17, 2, 2, 'S');
        yaz(a, x + 4, y + 5, { boy: 8, renk: R.ikincil });
        yaz(b, x + 4, y + 10.8, { kalin: true, boy: 12 });
        yaz(c, x + 4, y + 14.8, { boy: 7.5, renk: R.ikincil });
      });
      y += 24;

      /* İlerleme grafiği: üç ölçü ayrı ölçekte, yan yana */
      const l = secenek.olcumler, tumu = dn.olcumler;
      y = baslik('İlerleme Grafiği', y);
      const gEn = (ICERIK - 8) / 3, gBoy = 42;
      [['Kilo', 'kilo', 'kg', dn.hedef_kilo], ['Bel', 'bel', 'cm'], ['Yağ Oranı', 'yag_orani', '%']].forEach(([ad, alan, birim, hedef], n) => {
        grafik(K + n * (gEn + 4), y, gEn, gBoy, ad + ' (' + birim + ')', l.filter((m) => m[alan] != null).map((m) => ({ t: m.tarih, v: m[alan] })), hedef);
      });
      y += gBoy + 12;

      /* Haftalık tablo */
      y = baslik('Haftalık Ölçümler', y);
      const SUTUN = [['Hafta', 18, 'left'], ['Tarih', 38, 'left'], ['Kilo (kg)', 34, 'right'], ['Değişim (kg)', 34, 'right'], ['Bel (cm)', 28, 'right'], ['Yağ (%)', 28, 'right']];
      const tabloBas = () => {
        doc.setFillColor(...R.zemin); doc.rect(K, y - 1, ICERIK, 6.2, 'F');
        let x = K;
        SUTUN.forEach(([a, w, h]) => { yaz(a, h === 'right' ? x + w - 2 : x + 2, y + 3.2, { boy: 8, kalin: true, hiza: h, renk: R.ikincil }); x += w; });
        y += 6.2;
      };
      tabloBas();
      l.forEach((m) => {
        if (y + 5.6 > SAYFA.boy - 20) { doc.addPage(); y = ust(); y = baslik('Haftalık Ölçümler (devam)', y); tabloBas(); }
        const k = tumu.indexOf(m), o = tumu[k - 1], fark = o && m.kilo != null && o.kilo != null ? Math.round((m.kilo - o.kilo) * 10) / 10 : null;
        const bir = (n) => (n == null ? '—' : n.toFixed(1).replace('.', ','));
        const hucre = [m.hafta + '.', PA.tarih(m.tarih), bir(m.kilo), fark == null ? '—' : (fark > 0 ? '+' : fark < 0 ? '−' : '') + bir(Math.abs(fark)), bir(m.bel), bir(m.yag_orani)];
        let x = K;
        SUTUN.forEach(([, w, h], c) => { yaz(hucre[c], h === 'right' ? x + w - 2 : x + 2, y + 3, { boy: 8.5, hiza: h }); x += w; });
        y += 5.6;
        cizgi(K, y - 1.1, sagX, y - 1.1);
      });
      y += 6;
    }

    /* Diyetisyen notu */
    doc.setFont('Gilroy', 'normal'); doc.setFontSize(9.5);
    const satirlar = doc.splitTextToSize(temiz(secenek.not), ICERIK - 10), notBoy = satirlar.length * 4.6 + 15;
    sigmaz(notBoy + 7);
    y = baslik('Diyetisyen Notu', y);
    doc.setDrawColor(...R.cizgi); doc.setLineWidth(0.2); doc.roundedRect(K, y, ICERIK, notBoy, 2, 2, 'S');
    doc.setFont('Gilroy', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...R.murekkep);
    doc.text(satirlar, K + 5, y + 6.5, { lineHeightFactor: 1.4 });
    yaz(dy.ad + ' · ' + PA.tarih(DD.bugun), sagX - 5, y + notBoy - 3.5, { hiza: 'right', boy: 8.5, kalin: true, renk: R.ikincil });

    /* Her sayfanın ayağı */
    const n = doc.getNumberOfPages();
    for (let s = 1; s <= n; s++) {
      doc.setPage(s);
      cizgi(K, SAYFA.boy - 14, sagX, SAYFA.boy - 14);
      yaz('Prototip örneği: kişi, ölçüm ve not bilgileri kurgudur, gerçek danışan verisi değildir.', K, SAYFA.boy - 10, { boy: 7.5, renk: R.ikincil });
      yaz('Sayfa ' + s + ' / ' + n, sagX, SAYFA.boy - 10, { boy: 7.5, hiza: 'right', renk: R.ikincil });
    }
    return doc;

    /* Tek ölçü, tek ölçek. İlk ve son değer doğrudan etiketli; hedef kesikli çizgi */
    function grafik(x, y0, en, boy, ad, l, hedef) {
      yaz(ad, x, y0 + 2.5, { kalin: true, boy: 8.5 });
      const ust_ = y0 + 8, alt = y0 + boy - 5, sol = x + 7, sag = x + en - 7;
      if (!l.length) { yaz('Kayıt yok', x, y0 + 12, { boy: 8.5, renk: R.ikincil }); return; }
      const d = l.map((m) => m.v).concat(hedef != null ? [hedef] : []), min = Math.min(...d), max = Math.max(...d), pay = (max - min || 1) * 0.12;
      const lo = min - pay, hi = max + pay;
      const py = (v) => alt - ((v - lo) / (hi - lo)) * (alt - ust_);
      const px = (i) => (l.length === 1 ? (sol + sag) / 2 : sol + (i / (l.length - 1)) * (sag - sol));
      cizgi(x, alt, x + en, alt, R.cizgi, 0.25);
      [0.5, 1].forEach((k) => cizgi(x, alt - (alt - ust_) * k, x + en, alt - (alt - ust_) * k, R.cizgi, 0.1));
      if (hedef != null) {
        doc.setLineDashPattern([1.2, 1.2], 0); cizgi(x, py(hedef), x + en, py(hedef), R.ikincil, 0.3); doc.setLineDashPattern([], 0);
        yaz('Hedef ' + PA.sayi(hedef), x + en, py(hedef) - 1, { boy: 7, hiza: 'right', renk: R.ikincil });
      }
      doc.setDrawColor(...R.koyu); doc.setLineWidth(0.55); doc.setLineCap('round'); doc.setLineJoin('round');
      for (let i = 1; i < l.length; i++) doc.line(px(i - 1), py(l[i - 1].v), px(i), py(l[i].v));
      doc.setLineCap('butt'); doc.setLineJoin('miter');
      const nokta = (i) => { doc.setFillColor(255, 255, 255); doc.circle(px(i), py(l[i].v), 1.25, 'F'); doc.setFillColor(...R.koyu); doc.circle(px(i), py(l[i].v), 0.9, 'F'); };
      const son = l.length - 1;
      nokta(0); yaz(PA.sayi(l[0].v), px(0), py(l[0].v) - 2, { boy: 7.5, kalin: true, hiza: 'center' });
      if (son) { nokta(son); yaz(PA.sayi(l[son].v), px(son), py(l[son].v) - 2, { boy: 7.5, kalin: true, hiza: 'center' }); }
      const tarih = (t) => t.slice(8, 10) + '.' + t.slice(5, 7);
      yaz(tarih(l[0].t), px(0), alt + 3.6, { boy: 7, hiza: 'center', renk: R.ikincil });
      if (son) yaz(tarih(l[son].t), px(son), alt + 3.6, { boy: 7, hiza: 'center', renk: R.ikincil });
    }
  }

  /* secenek: { not, adet } · adet 0 bütün ölçümler */
  PA.raporIndir = (dn, secenek) => yukle().then(() => {
    const duyarli = PA.yemeDuyarli(dn);
    const olcumler = secenek.adet ? dn.olcumler.slice(-secenek.adet) : dn.olcumler;
    raporKur(dn, { not: secenek.not, duyarli, olcumler }).save(dosyaAdi(dn.ad));
  });
})();
