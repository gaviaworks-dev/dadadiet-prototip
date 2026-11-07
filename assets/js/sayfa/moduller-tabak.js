/* Akıllı Tabak ve Değişim */
(function () {
  'use strict';
  const M = window.DDM, kac = M.kac;
  const $ = (id) => document.getElementById(id);

  /* Referans tabak: gram oranı 50/25/25, sosluk ayrı */
  const BOLME = {
    sebze: { ad: 'Sebze', kisa: 'Sebze', hedefOran: 50, ref: 200, renk: 'var(--makro-sebze)', ikon: 'fa-carrot', kural: 'Tabağın yarısı. Meyve de burada sayılır, patates sayılmaz.' },
    protein: { ad: 'Yağsız protein', kisa: 'Protein', hedefOran: 25, ref: 100, renk: 'var(--makro-protein)', ikon: 'fa-drumstick-bite', kural: 'Tabağın çeyreği. Balık, tavuk, yumurta, baklagil ya da yoğurt.' },
    karb: { ad: 'Kompleks karbonhidrat', kisa: 'Karbonhidrat', hedefOran: 25, ref: 100, renk: 'var(--makro-karb)', ikon: 'fa-wheat-awn', kural: 'Tabağın çeyreği. Tam tahıl, bulgur ve patates burada.' },
    yag: { ad: 'Sağlıklı yağ', kisa: 'Sağlıklı yağ', ref: 10, renk: 'var(--makro-yag)', ikon: 'fa-droplet', kural: 'Küçük bir sosluk kadar: 5–15 g zeytinyağı ya da kuruyemiş.' },
  };
  const bolmesi = (b) => {
    if (b.slug === 'avokado') return 'yag';
    return { sebze: 'sebze', meyve: 'sebze', protein: 'protein', sut: 'protein', karb: 'karb', diger: 'karb', yag: 'yag' }[b.tabak_grubu] || 'karb';
  };
  /* Gramı olmayan tarif kaydı porsiyonla girilir; bölme doluluğunda 1 porsiyon 250 g sayılır */
  const TARIF_GRAM = 250;
  const olcusu = (b) => {
    if (M.porsiyonGram(b) == null && b.kcal == null) return { birim: 'porsiyon', adim: 0.5, ilk: 1 };
    const g = M.porsiyonGram(b) || 100;
    const yag = bolmesi(b) === 'yag';
    return { birim: 'g', adim: yag ? 5 : 10, ilk: yag ? Math.max(5, g) : Math.max(50, M.yuvarla(g, 10)) };
  };

  const HAZIR = [
    { ad: 'Dengeli tabak', kalem: [['brokoli-haslanmis', 120], ['domates', 60], ['tavuk-gogsu-izgara', 100], ['bulgur-pismis', 120], ['zeytinyagi', 10]] },
    { ad: 'Akdeniz tabağı', kalem: [['patlican-haslanmis', 120], ['roka', 40], ['domates', 60], ['levrek-izgara', 110], ['esmer-pirinc-pismis', 90], ['zeytinyagi', 10]] },
    { ad: 'Vejetaryen tabak', kalem: [['ispanak-haslanmis', 120], ['havuc', 80], ['nohut-haslanmis', 100], ['kinoa-pismis', 100], ['ceviz-ic', 10]] },
  ];
  let kalemler = [], hazirNo = 0, seciliBolme = null;
  const yukle = (i) => { hazirNo = i; kalemler = HAZIR[i].kalem.filter((k) => M.besin(k[0])).map((k) => ({ slug: k[0], miktar: k[1], birim: 'g' })); };

  /* Çizim: yarım daire sebze, iki çeyrek, dışarıda sosluk */
  const CX = 190, CY = 200, R = 158, ARA = 3;
  const dilim = {
    sebze: `M${CX - ARA} ${CY - R} A${R} ${R} 0 0 0 ${CX - ARA} ${CY + R} Z`,
    protein: `M${CX + ARA} ${CY - ARA} L${CX + ARA} ${CY - R} A${R} ${R} 0 0 1 ${CX + R} ${CY - ARA} Z`,
    karb: `M${CX + ARA} ${CY + ARA} L${CX + R} ${CY + ARA} A${R} ${R} 0 0 1 ${CX + ARA} ${CY + R} Z`,
  };
  const SOS = { x: 344, y: 54, r: 38 };
  const SINIR = { sebze: [CY - R, 2 * R], protein: [CY - R, R], karb: [CY, R], yag: [SOS.y - SOS.r, 2 * SOS.r] };
  function cizimKur() {
    const clip = (id, d) => `<clipPath id="kirp-${id}">${d}</clipPath>`;
    const taban = (id, sekil) => `<g clip-path="url(#kirp-${id})"><rect class="tabak-zemin" x="0" y="0" width="400" height="400" fill="${BOLME[id].renk}" fill-opacity=".14"/><rect class="tabak-dolgu" data-bolme="${id}" x="0" y="${SINIR[id][0]}" width="400" height="${SINIR[id][1]}" fill="${BOLME[id].renk}" fill-opacity=".62"/></g>${sekil}`;
    const kenar = (id) => `<path d="${dilim[id]}" fill="none" stroke="${BOLME[id].renk}" stroke-width="1.5"/>`;
    const yazi = (x, y, sat1, id) => `<text class="tabak-yazi" x="${x}" y="${y}" text-anchor="middle">${sat1}</text><text class="tabak-yazi kucuk" data-etiket="${id}" x="${x}" y="${y + 18}" text-anchor="middle"></text>`;
    $('tabakCizim').innerHTML = `<svg class="cizim" viewBox="0 0 392 372" role="img" aria-label="Dört bölmeli tabak: yarısı sebze, çeyreği yağsız protein, çeyreği kompleks karbonhidrat, küçük soslukta sağlıklı yağ">
      <defs>${clip('sebze', `<path d="${dilim.sebze}"/>`)}${clip('protein', `<path d="${dilim.protein}"/>`)}${clip('karb', `<path d="${dilim.karb}"/>`)}${clip('yag', `<circle cx="${SOS.x}" cy="${SOS.y}" r="${SOS.r}"/>`)}</defs>
      <circle cx="${CX}" cy="${CY}" r="${R + 12}" fill="var(--kagit)" stroke="var(--cizgi)" stroke-width="2"/>
      ${taban('sebze', kenar('sebze'))}${taban('protein', kenar('protein'))}${taban('karb', kenar('karb'))}
      <circle cx="${SOS.x}" cy="${SOS.y}" r="${SOS.r + 6}" fill="var(--kagit)" stroke="var(--cizgi)" stroke-width="2"/>
      ${taban('yag', `<circle cx="${SOS.x}" cy="${SOS.y}" r="${SOS.r}" fill="none" stroke="${BOLME.yag.renk}" stroke-width="1.5"/>`)}
      ${['sebze', 'protein', 'karb'].map((id) => `<path class="tabak-dilim" d="${dilim[id]}" data-bolme-sec="${id}" role="button" tabindex="0" aria-pressed="false" aria-label="${BOLME[id].ad} bölmesi: ${BOLME[id].kural}"/>`).join('')}
      <circle class="tabak-dilim" cx="${SOS.x}" cy="${SOS.y}" r="${SOS.r}" data-bolme-sec="yag" role="button" tabindex="0" aria-pressed="false" aria-label="${BOLME.yag.ad} bölmesi: ${BOLME.yag.kural}"/>
      ${yazi(CX - R / 2 - 4, CY - 6, 'Sebze', 'sebze')}${yazi(CX + R / 2 - 4, CY - R / 2 + 12, 'Protein', 'protein')}${yazi(CX + R / 2 - 4, CY + R / 2 - 4, 'Karb', 'karb')}${yazi(SOS.x, SOS.y - 4, 'Yağ', 'yag')}
    </svg>`;
  }

  function hesap() {
    const gram = { sebze: 0, protein: 0, karb: 0, yag: 0 };
    const top = { kcal: 0, protein: 0, yag: 0, karb: 0, lif: 0 }, eksik = new Set();
    kalemler.forEach((k) => {
      const b = M.besin(k.slug);
      gram[bolmesi(b)] += k.birim === 'g' ? k.miktar : k.miktar * TARIF_GRAM;
      Object.keys(top).forEach((a) => {
        const v = M.miktarDeger(b, a, k.miktar, k.birim);
        if (v == null) eksik.add(a); else top[a] += v;
      });
    });
    const T = gram.sebze + gram.protein + gram.karb;
    const oran = { sebze: T ? (gram.sebze / T) * 100 : 0, protein: T ? (gram.protein / T) * 100 : 0, karb: T ? (gram.karb / T) * 100 : 0 };
    const sapma = Math.abs(oran.sebze - 50) + Math.abs(oran.protein - 25) + Math.abs(oran.karb - 25);
    const bolmeP = T ? 65 * Math.max(0, 1 - sapma / 100) : 0;
    const y = gram.yag, yagP = y === 0 ? 0 : y < 5 ? (y / 5) * 10 : y <= 15 ? 10 : Math.max(0, 10 * (1 - (y - 15) / 15));
    const lifP = 25 * Math.min(1, top.lif / 8);
    return { gram, top, eksik, oran, bolmeP, yagP, lifP, skor: Math.round(bolmeP + yagP + lifP) };
  }

  function kalemCiz() {
    const kap = $('tabakKalemler');
    if (!kalemler.length) {
      kap.innerHTML = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-utensils" aria-hidden="true"></i></span><h3>Tabağın boş</h3><p>Yukarıdan besin ara ya da hazır bir tabak seç.</p><button class="dugme birincil" type="button" data-hazir="0">Dengeli tabakla başla</button></div>';
      return;
    }
    kap.innerHTML = '<div class="ayar-liste">' + kalemler.map((k, i) => {
      const b = M.besin(k.slug), bo = BOLME[bolmesi(b)], o = olcusu(b);
      const kcal = M.miktarDeger(b, 'kcal', k.miktar, k.birim);
      const adim = k.birim === 'g' ? o.adim : 0.5;
      return '<div class="ayar-satir sarmali" data-sira="' + i + '"><span class="as-ikon" aria-hidden="true"><i class="fa-solid ' + bo.ikon + '"></i></span>'
        + '<div class="as-metin"><b>' + kac(b.ad) + '</b><span data-kalem-alt="' + i + '">' + kac(altMetin(b, k, bo, kcal)) + '</span></div>'
        + '<div class="as-eylem"><div class="adet"><button type="button" data-yon="azalt" aria-label="' + kac(M.kisaAd(b)) + ' miktarını azalt"><i class="fa-solid fa-minus" aria-hidden="true"></i></button><input type="number" min="' + adim + '" step="' + adim + '" value="' + k.miktar + '" aria-label="' + kac(M.kisaAd(b)) + ' miktarı, ' + (k.birim === 'g' ? 'gram' : 'porsiyon') + '"><button type="button" data-yon="artir" aria-label="' + kac(M.kisaAd(b)) + ' miktarını artır"><i class="fa-solid fa-plus" aria-hidden="true"></i></button></div>'
        + '<span class="adet-birim">' + (k.birim === 'g' ? 'g' : 'porsiyon') + '</span>'
        + '<button class="kapat-dugme" type="button" data-sil="' + i + '" aria-label="' + kac(M.kisaAd(b)) + ' kalemini sil"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div></div>';
    }).join('') + '</div>';
  }
  const altMetin = (b, k, bo, kcal) => bo.ad + ' bölmesi · ' + M.goster(kcal, 'kcal', 0);

  function ozetCiz() {
    const h = hesap(), t = h.top;
    /* Bölme dolgusu */
    Object.keys(BOLME).forEach((id) => {
      const dol = Math.min(1, h.gram[id] / BOLME[id].ref);
      const r = document.querySelector('.tabak-dolgu[data-bolme="' + id + '"]');
      if (r) r.style.transform = 'translateY(' + SINIR[id][1] * (1 - dol) + 'px)';
      const e = document.querySelector('[data-etiket="' + id + '"]');
      if (e) e.textContent = kalemler.length ? M.sayi(h.gram[id], 0) + ' g' : BOLME[id].hedefOran ? 'hedef %' + BOLME[id].hedefOran : '5–15 g';
    });
    /* Bölme listesi */
    const kalemVar = kalemler.length > 0;
    $('bolmeListe').innerHTML = Object.keys(BOLME).map((id) => {
      const bo = BOLME[id], g = h.gram[id], oran = (g / bo.ref) * 100;
      const sag = !kalemVar ? 'hedef ' + (bo.hedefOran ? '%' + bo.hedefOran : '5–15 g') : bo.hedefOran ? '%' + M.sayi(h.oran[id], 0) + ' <small>hedef %' + bo.hedefOran + '</small>' : M.sayi(g, 0) + ' g <small>hedef 5–15 g</small>';
      return '<div class="olcum-satir secilir" data-bolme-sec="' + id + '" role="button" tabindex="0" aria-pressed="false"><div class="olcum-bas"><span>' + bo.ad + '</span><b>' + sag + '</b></div><div class="olcer hap renkli" data-bolme="' + id + '"><span data-oran="' + Math.min(100, oran) + '"></span></div><small class="olcum-kural">' + bo.kural + '</small></div>';
    }).join('');
    document.querySelectorAll('#bolmeListe [data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
    bolmeIsaretle();
    /* Makro */
    const pk = t.protein * 4, kk = t.karb * 4, yk = t.yag * 9, tk = pk + kk + yk;
    const dil = [['Protein', pk, 'var(--makro-protein)', t.protein], ['Karbonhidrat', kk, 'var(--makro-karb)', t.karb], ['Yağ', yk, 'var(--makro-yag)', t.yag]];
    const yuzde = dil.map((d) => (tk ? Math.round((d[1] / tk) * 100) : 0));
    $('makroCubuk').innerHTML = tk ? dil.map((d, i) => '<span data-oran="' + yuzde[i] + '" data-renk="' + d[2] + '" title="' + d[0] + ' %' + yuzde[i] + '"></span>').join('') : '';
    $('makroCubuk').setAttribute('aria-label', tk ? dil.map((d, i) => d[0] + ' yüzde ' + yuzde[i]).join(', ') : 'Tabak boş');
    $('makroCubuk').querySelectorAll('span').forEach((e) => { e.style.setProperty('--oran', e.dataset.oran); e.style.setProperty('--renk', e.dataset.renk); });
    $('makroLejant').innerHTML = tk ? dil.map((d, i) => '<span class="lejant-kalem m-' + ['protein', 'karb', 'yag'][i] + '">' + d[0] + ' %' + yuzde[i] + '</span>').join('') : '<span>Besin ekleyince makro dağılımın görünür.</span>';
    /* Toplam */
    const hucre = (ad, v, birim, a) => '<div><dt>' + ad + '</dt><dd>' + (h.eksik.has(a) ? 'en az ' : '') + M.sayi(v, birim === 'kcal' ? 0 : 1) + ' ' + birim + '</dd></div>';
    $('tabakToplam').hidden = !kalemVar; $('tabakToplamBos').hidden = kalemVar;
    $('tabakToplam').innerHTML = hucre('Kalori', t.kcal, 'kcal', 'kcal') + hucre('Protein', t.protein, 'g', 'protein') + hucre('Yağ', t.yag, 'g', 'yag') + hucre('Karb', t.karb, 'g', 'karb') + hucre('Lif', t.lif, 'g', 'lif');
    const ek = $('tabakEksik'), adlar = { kcal: 'kalori', protein: 'protein', yag: 'yağ', karb: 'karbonhidrat', lif: 'lif' };
    ek.hidden = !h.eksik.size;
    ek.textContent = h.eksik.size ? 'Bazı kalemlerde ' + [...h.eksik].map((a) => adlar[a]).join(', ') + ' verisi yok; toplam bu kalemleri içermiyor.' : '';
    $('tabakSayac').textContent = kalemVar ? kalemler.length + ' kalem' : 'Kalem yok';
    $('tabakTemizle').hidden = !kalemVar;
    /* Skor: sayı tek başına durmaz, cümle ve tek eylemle gelir */
    const skorMetin = kalemVar ? String(h.skor) : '–';
    $('skorDeger').textContent = skorMetin; $('skorKisa').textContent = skorMetin;
    const hal = $('skorHalka'); hal.dataset.oran = kalemVar ? h.skor : 0; hal.style.setProperty('--oran', kalemVar ? h.skor : 0);
    const c = skorCumleleri(h);
    $('skorParcalar').innerHTML = kalemVar ? c.satirlar.map((x) => '<li class="' + (x.iyi ? '' : 'eksi') + '"><i class="fa-solid ' + (x.iyi ? 'fa-plus' : 'fa-minus') + '" aria-hidden="true"></i><span>' + x.metin + '</span></li>').join('') : '<li class="eksi"><i class="fa-solid fa-utensils" aria-hidden="true"></i><span>Besin eklediğinde skorun burada cümleyle açıklanır.</span></li>';
    $('skorOneri').innerHTML = !kalemVar ? '' : c.oneri ? '<p class="kart-metin">' + c.oneri.metin + '</p><button class="dugme hayalet kucuk" type="button" data-oner="' + c.oneri.bolme + '"><i class="fa-solid fa-plus" aria-hidden="true"></i> ' + c.oneri.dugme + '</button>' : '<p class="kart-metin">Tabağın dengede. Porsiyonunu öğün hedefine göre ayarlayabilirsin.</p>';
  }

  function skorCumleleri(h) {
    const satirlar = [], eksikler = [];
    ['sebze', 'protein', 'karb'].forEach((id) => {
      const bo = BOLME[id], fark = Math.round(h.oran[id] - bo.hedefOran);
      if (Math.abs(fark) <= 5) satirlar.push({ iyi: true, metin: bo.kisa + ' payın iyi' });
      else satirlar.push({ iyi: false, metin: bo.kisa + ' ' + Math.abs(fark) + ' puan ' + (fark < 0 ? 'eksik' : 'fazla') });
      if (fark < -5) eksikler.push({ id, fark: -fark });
    });
    const y = h.gram.yag, yagIyi = y >= 5 && y <= 15;
    satirlar.push({ iyi: yagIyi, metin: yagIyi ? 'Sağlıklı yağ yeterli' : y === 0 ? 'Sağlıklı yağ yok' : y < 5 ? 'Sağlıklı yağ az' : 'Sağlıklı yağ fazla' });
    const lif = h.top.lif, lifIyi = lif >= 8;
    satirlar.push({ iyi: lifIyi, metin: lifIyi ? 'Lif hedefe ulaştı' : 'Lif ' + M.sayi(8 - lif, 0) + ' g eksik' });
    eksikler.sort((a, b) => b.fark - a.fark);
    let oneri = null;
    if (eksikler.length) { const b = BOLME[eksikler[0].id]; oneri = { bolme: eksikler[0].id, metin: 'En büyük kazanç ' + b.kisa.toLocaleLowerCase('tr-TR') + ' bölmesinde.', dugme: b.kisa + ' ekle' }; }
    else if (y < 5) oneri = { bolme: 'yag', metin: 'Bir tatlı kaşığı zeytinyağı ya da az kuruyemiş skorunu yükseltir.', dugme: 'Sağlıklı yağ ekle' };
    else if (!lifIyi) oneri = { bolme: 'sebze', metin: 'Lifli bir sebze ya da baklagil skorunu yükseltir.', dugme: 'Sebze ekle' };
    return { satirlar, oneri };
  }

  function bolmeIsaretle() {
    document.querySelectorAll('[data-bolme-sec]').forEach((e) => {
      const s = e.dataset.bolmeSec === seciliBolme;
      e.classList.toggle('secili', s); e.setAttribute('aria-pressed', String(s));
    });
    const c = $('bolmeSuzgec'), g = $('tabakArama');
    c.hidden = !seciliBolme;
    if (seciliBolme) c.innerHTML = kac(BOLME[seciliBolme].kisa) + ' bölmesine ekliyorsun <i class="fa-solid fa-xmark" aria-hidden="true"></i><span class="yalniz-okuyucu"> Süzgeci kaldır</span>';
    g.placeholder = seciliBolme ? BOLME[seciliBolme].kisa + ' ara' : 'Örneğin brokoli, tavuk, bulgur';
  }
  const bolmeSec = (id) => { seciliBolme = seciliBolme === id ? null : id; bolmeIsaretle(); };

  function hazirCiz() {
    $('hazirTabaklar').innerHTML = HAZIR.map((t, i) => '<button class="cip' + (i === hazirNo ? ' aktif' : '') + '" type="button" data-hazir="' + i + '" aria-pressed="' + (i === hazirNo) + '">' + t.ad + '</button>').join('');
  }
  const yenile = () => { kalemCiz(); ozetCiz(); hazirCiz(); muadilCiz(); };

  function ekle(b, miktar, birim) {
    const o = olcusu(b), bir = birim || o.birim, var_ = kalemler.find((k) => k.slug === b.slug);
    hazirNo = -1;
    if (var_ && var_.birim === bir) var_.miktar += miktar || o.ilk;
    else kalemler.push({ slug: b.slug, miktar: miktar || o.ilk, birim: bir });
    yenile();
    DD.toast(M.kisaAd(b) + ' tabağına eklendi');
  }

  document.addEventListener('click', (e) => {
    const hz = e.target.closest('[data-hazir]');
    if (hz) { yukle(+hz.dataset.hazir); yenile(); return; }
    const sil = e.target.closest('[data-sil]');
    if (sil) { const b = M.besin(kalemler[+sil.dataset.sil].slug); kalemler.splice(+sil.dataset.sil, 1); hazirNo = -1; yenile(); DD.toast(M.kisaAd(b) + ' tabaktan çıkarıldı'); return; }
    if (e.target.closest('#tabakTemizle')) { kalemler = []; hazirNo = -1; yenile(); return; }
    const bs = e.target.closest('[data-bolme-sec]');
    if (bs) { bolmeSec(bs.dataset.bolmeSec); return; }
    if (e.target.closest('#bolmeSuzgec')) { seciliBolme = null; bolmeIsaretle(); return; }
    const on = e.target.closest('[data-oner]');
    if (on) { seciliBolme = on.dataset.oner; bolmeIsaretle(); $('tabakArama').focus(); }
  });
  document.addEventListener('keydown', (e) => {
    const bs = e.target.closest && e.target.closest('[data-bolme-sec]');
    if (bs && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); bolmeSec(bs.dataset.bolmeSec); }
  });
  $('tabakKalemler').addEventListener('input', (e) => {
    const satir = e.target.closest('[data-sira]');
    if (!satir || e.target.tagName !== 'INPUT') return;
    const i = +satir.dataset.sira, v = parseFloat(e.target.value);
    if (!(v > 0)) return;
    kalemler[i].miktar = v; hazirNo = -1;
    const k = kalemler[i], b = M.besin(k.slug);
    satir.querySelector('[data-kalem-alt]').textContent = altMetin(b, k, BOLME[bolmesi(b)], M.miktarDeger(b, 'kcal', k.miktar, k.birim));
    ozetCiz(); hazirCiz();
  });
  const arama = $('tabakArama');
  M.oneri(arama, { kaynak: M.tumKayitlar, suz: (b) => !seciliBolme || bolmesi(b) === seciliBolme, secildi(b) { arama.value = ''; ekle(b); } });

  /* ── Muadil bulucu: temel seçilir, temelde eşit, ötekilerde nötr fark ─────── */
  const KEPCE = 0.75; /* 1 kepçe = 3/4 tarif porsiyonu */
  const muadil = { b: M.besin('tam-bugday-ekmegi'), adet: 1, temel: 'karb' };
  const TEMEL = {
    karb: { ad: 'karbonhidrat', birim: 'g', esik: 5, baslik: 'Bu besinin karbonhidratı çok az', metin: 'Bir tahıl, baklagil ya da meyve seç, ya da kalori temeline geç.' },
    kcal: { ad: 'kalori', birim: 'kcal', esik: 10, baslik: 'Bu besinin kalorisi çok az', metin: 'Bir ana öğün besini seç.' },
    protein: { ad: 'protein', birim: 'g', esik: 3, baslik: 'Bu besinin proteini çok az', metin: 'Et, balık, yumurta, baklagil ya da süt ürünü seç, ya da karbonhidrat temeline geç.' },
  };
  const DEGER = [['karb', 'Karb', 'g'], ['kcal', 'Kalori', 'kcal'], ['protein', 'Protein', 'g']];
  const HIZLI = ['tam-bugday-ekmegi', 'bulgur-pismis', 'makarna-haslanmis', 'tavuk-gogsu-izgara', 'muz-anamur'];
  const porsiyonAdi = (b) => (M.tarifMi(b) ? 'porsiyon' : b.porsiyon && M.porsiyonGram(b) ? b.porsiyon.ad.replace(/^1\s+/, '') : '100 g');
  const kaynakGram = () => (M.porsiyonGram(muadil.b) || 100) * muadil.adet;
  const tarifMi = M.tarifMi;
  const kaynakDeger = (a) => (tarifMi(muadil.b) ? M.miktarDeger(muadil.b, a, muadil.adet, 'porsiyon') : M.miktarDeger(muadil.b, a, kaynakGram(), 'g'));
  function ozelMuadil(kat) {
    return [
      { slug: 'bulgur-pismis', etiket: M.sayi(3 * kat) + ' yemek kaşığı bulgur pilavı', alt: 'yaklaşık ' + M.sayi(75 * kat, 0) + ' g', miktar: 75 * kat, birim: 'g' },
      { slug: 'patates-haslanmis', etiket: M.sayi(kat) + ' küçük haşlanmış patates', alt: M.sayi(90 * kat, 0) + ' g', miktar: 90 * kat, birim: 'g' },
      { slug: 'mercimek-corbasi', etiket: M.sayi(kat) + ' kepçe mercimek çorbası', alt: 'yaklaşık ¾ porsiyon', miktar: KEPCE * kat, birim: 'porsiyon' },
    ];
  }
  /* Aday havuzu temele göre: besin 100 g, tarif porsiyon değeriyle değerlendirilir */
  const TATLI = ['Meyve Tarifleri', 'Tatlı', 'İçecek', 'Dondurma ve Soğuk Tatlılar'];
  const birimDeger = (b, a) => M.deger(b, a, tarifMi(b) ? 'porsiyon' : '100');
  const adayMi = (b) => {
    if (b.slug === muadil.b.slug || birimDeger(b, 'kcal') == null || b.tabak_grubu === 'diger') return false;
    const t = tarifMi(b), karb = birimDeger(b, 'karb'), kcal = birimDeger(b, 'kcal'), meyveKaynak = muadil.b.tabak_grubu === 'meyve';
    /* Tatlı ve meyve, ana öğün besinine muadil gösterilmez */
    if (t && TATLI.includes(b.tarif_turu) && !meyveKaynak) return false;
    if (b.tabak_grubu === 'meyve' && !meyveKaynak) return false;
    if (muadil.temel === 'karb') return t ? karb >= 15 && (karb * 4) / kcal >= 0.4 : (b.tabak_grubu === 'karb' || b.kategori_kodu === 'baklagil' || meyveKaynak) && karb >= 10;
    if (muadil.temel === 'protein') return birimDeger(b, 'protein') >= 10;
    return bolmesi(b) === bolmesi(muadil.b);
  };
  function adayHesap(b, hedef, ikincil, kaynakIkincil) {
    const v = birimDeger(b, muadil.temel);
    if (!v) return null;
    const t = tarifMi(b), miktar = t ? M.yuvarla(hedef / v, 0.25) : M.yuvarla((hedef / v) * 100, 5), birim = t ? 'porsiyon' : 'g';
    if (t ? miktar < 0.5 || miktar > 2 : miktar < 5 || miktar > 400) return null;
    if (t && Math.abs(v * miktar - hedef) / hedef > 0.2) return null;
    const fark = Math.abs((M.miktarDeger(b, ikincil, miktar, birim) || 0) - kaynakIkincil);
    return { b, miktar, birim, puan: fark - (M.miktarDeger(b, 'lif', miktar, birim) || 0) * 4 };
  }
  /* İki besin + uygunsa bir tarif: hazır yemek de seçenek olsun */
  function hesapliMuadil(hedef) {
    const ikincil = muadil.temel === 'kcal' ? 'protein' : 'kcal', kaynakIkincil = kaynakDeger(ikincil) || 0;
    const aday = M.tumKayitlar().filter(adayMi).map((b) => adayHesap(b, hedef, ikincil, kaynakIkincil)).filter(Boolean).sort((x, y) => x.puan - y.puan);
    const tarif = aday.find((a) => tarifMi(a.b)), besinler = aday.filter((a) => !tarifMi(a.b));
    const secilen = [], tur = new Set(), kota = tarif ? 2 : 3;
    for (const a of besinler) { if (secilen.length === kota) break; if (tur.has(a.b.kategori_kodu)) continue; tur.add(a.b.kategori_kodu); secilen.push(a); }
    for (const a of besinler) { if (secilen.length === kota) break; if (!secilen.includes(a)) secilen.push(a); }
    if (tarif) secilen.push(tarif);
    return secilen.map((a) => {
      const ad = M.kisaAd(a.b).toLocaleLowerCase('tr-TR'), pg = M.porsiyonGram(a.b);
      if (a.birim === 'porsiyon') return { slug: a.b.slug, etiket: M.kesir(a.miktar) + ' porsiyon ' + ad, alt: 'Tarif', tarif: true, miktar: a.miktar, birim: a.birim };
      return { slug: a.b.slug, etiket: M.sayi(a.miktar, 0) + ' g ' + ad, alt: pg ? 'yaklaşık ' + M.sayi(a.miktar / pg, 1) + ' ' + porsiyonAdi(a.b) : '', miktar: a.miktar, birim: a.birim };
    });
  }
  /* Fark hapı nötr: yön iyi ya da kötü diye boyanmaz */
  function farkHapi(alan, v, k, birim) {
    if (v == null || k == null) return '';
    const fark = v - k, yakinlik = k ? Math.abs(fark) / k : 1;
    if (alan === muadil.temel) return '<span class="rozet olumlu">' + (yakinlik <= 0.05 ? 'eşit' : 'yakın') + '</span>';
    if (Math.abs(fark) < (birim === 'kcal' ? 5 : 1)) return '<span class="rozet pasif">aynı</span>';
    return '<span class="rozet pasif"><i class="fa-solid ' + (fark > 0 ? 'fa-arrow-up' : 'fa-arrow-down') + '" aria-hidden="true"></i> ' + M.sayi(Math.abs(fark), 0) + ' ' + birim + '<span class="yalniz-okuyucu"> ' + (fark > 0 ? 'daha fazla' : 'daha az') + '</span></span>';
  }
  const tabaktaki = () => (muadil.b ? kalemler.find((k) => k.slug === muadil.b.slug) : null);
  function muadilCiz() {
    const b = muadil.b, tm = TEMEL[muadil.temel];
    if (document.activeElement !== $('muadilArama')) $('muadilArama').value = b ? b.ad : '';
    $('muadilBirim').textContent = b ? '× ' + porsiyonAdi(b) + (M.porsiyonGram(b) ? ' (' + M.porsiyonGram(b) + ' g)' : '') : '';
    document.querySelectorAll('#muadilHizli .cip').forEach((c) => c.classList.toggle('aktif', Boolean(b) && c.dataset.slug === b.slug));
    $('muadilNot').textContent = 'Eşdeğerler ' + tm.ad + ' miktarına göre hesaplanır. Fark okları artı ya da eksi değer yargısı taşımaz.';
    const oz = $('muadilOzet'), son = $('muadilSonuc');
    if (!b) { oz.innerHTML = ''; son.innerHTML = ''; return; }
    const kay = { karb: kaynakDeger('karb'), kcal: kaynakDeger('kcal'), protein: kaynakDeger('protein') };
    oz.innerHTML = '<div class="muadil-ad"><span class="ust-etiket">Referans</span><b>' + M.sayi(muadil.adet) + ' ' + kac(porsiyonAdi(b)) + ' ' + kac(M.kisaAd(b).toLocaleLowerCase('tr-TR')) + '</b>' + (M.porsiyonGram(b) ? '<span>' + M.sayi(kaynakGram(), 0) + ' g</span>' : '') + '</div><dl class="deger-satir">'
      + DEGER.map(([a, ad, br]) => '<div' + (a === muadil.temel ? ' class="temel"' : '') + '><dt>' + ad + '</dt><dd>' + M.goster(kay[a], br, 0) + '</dd></div>').join('') + '</dl>';
    const hedef = kay[muadil.temel];
    if (hedef == null || hedef < tm.esik) {
      son.innerHTML = '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-scale-unbalanced" aria-hidden="true"></i></span><h3>' + tm.baslik + '</h3><p>' + tm.metin + '</p><button class="dugme birincil" type="button" data-muadil-sec="tam-bugday-ekmegi">Tam buğday ekmeğiyle dene</button></div>';
      son._liste = []; return;
    }
    const l = b.slug === 'tam-bugday-ekmegi' && muadil.temel === 'karb' ? ozelMuadil(muadil.adet) : hesapliMuadil(hedef);
    const varMi = tabaktaki();
    son.innerHTML = '<div class="kart-izgara c3">' + l.map((m, i) => {
      const x = M.besin(m.slug);
      return '<div class="kart dolgulu muadil-kart"><h3 class="kart-baslik">' + kac(m.etiket) + '</h3><p class="kart-metin">' + kac(m.alt) + '</p><dl class="deger-tablo">'
        + DEGER.map(([a, ad, br]) => { const v = M.miktarDeger(x, a, m.miktar, m.birim); return '<div' + (a === muadil.temel ? ' class="temel"' : '') + '><dt>' + ad + '</dt><dd>' + M.goster(v, br, 0) + '</dd>' + farkHapi(a, v, kay[a], br) + '</div>'; }).join('')
        + '</dl><div class="eylem-satiri">' + (varMi ? '<button class="dugme birincil kucuk" type="button" data-muadil-degistir="' + i + '"><i class="fa-solid fa-right-left" aria-hidden="true"></i> Tabağımda değiştir</button>' : '')
        + '<button class="dugme hayalet kucuk" type="button" data-muadil-ekle="' + i + '"><i class="fa-solid fa-plus" aria-hidden="true"></i> Tabağa ekle</button></div></div>';
    }).join('') + '</div>';
    son._liste = l;
  }
  $('muadilHizli').innerHTML = HIZLI.map((s) => { const b = M.besin(s); return b ? '<button class="cip" type="button" data-slug="' + s + '">' + kac(M.kisaAd(b)) + '</button>' : ''; }).join('');
  const muadilSec = (b) => { muadil.b = b; muadil.adet = 1; $('muadilAdet').value = 1; muadilCiz(); };
  M.oneri($('muadilArama'), { kaynak: M.tumKayitlar, secildi(b) { $('muadilArama').blur(); muadilSec(b); } });
  $('muadilArama').addEventListener('blur', () => setTimeout(() => { if (muadil.b) $('muadilArama').value = muadil.b.ad; }, 140));
  $('muadilHizli').addEventListener('click', (e) => { const c = e.target.closest('[data-slug]'); if (c) muadilSec(M.besin(c.dataset.slug)); });
  $('muadilAdet').addEventListener('input', (e) => { const v = parseFloat(e.target.value); if (v > 0) { muadil.adet = v; muadilCiz(); } });
  $('muadilTemel').addEventListener('dd:secim', (e) => { muadil.temel = e.detail.deger; muadilCiz(); });
  $('muadil').addEventListener('click', (e) => {
    const s = e.target.closest('[data-muadil-sec]');
    if (s) { const yeni = M.besin(s.dataset.muadilSec); muadil.temel = 'karb'; document.querySelectorAll('#muadilTemel button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.deger === 'karb'))); muadilSec(yeni); return; }
    const liste = $('muadilSonuc')._liste;
    const a = e.target.closest('[data-muadil-ekle]');
    if (a) { const m = liste[+a.dataset.muadilEkle]; ekle(M.besin(m.slug), m.miktar, m.birim); return; }
    const d = e.target.closest('[data-muadil-degistir]');
    if (d) {
      /* Tabaktaki miktar kaynak miktarından farklıysa eşdeğer aynı oranda ölçeklenir */
      const m = liste[+d.dataset.muadilDegistir], k = tabaktaki(), x = M.besin(m.slug), eski = M.kisaAd(muadil.b);
      const oran = tarifMi(muadil.b) ? k.miktar / muadil.adet : k.miktar / kaynakGram();
      const miktar = m.birim === 'g' ? Math.max(5, M.yuvarla(m.miktar * oran, 5)) : Math.max(0.5, M.yuvarla(m.miktar * oran, 0.25));
      kalemler[kalemler.indexOf(k)] = { slug: m.slug, miktar, birim: m.birim };
      hazirNo = -1; yenile();
      DD.toast(eski + ' yerine ' + M.kisaAd(x) + ' geldi');
    }
  });

  /* Besin Karşılaştır'dan gelen besin: aynı bölmedeki ilk kalemin yerine geçer */
  function disaridan() {
    const b = M.besin(new URLSearchParams(location.search).get('besin'));
    if (!b) return;
    const o = olcusu(b), i = kalemler.findIndex((k) => bolmesi(M.besin(k.slug)) === bolmesi(b));
    const kalem = { slug: b.slug, miktar: o.ilk, birim: o.birim };
    if (i >= 0) kalemler[i] = kalem; else kalemler.push(kalem);
    hazirNo = -1; muadil.b = b;
    DD.toast(M.kisaAd(b) + ' tabağına eklendi');
  }
  cizimKur(); yukle(0); disaridan(); yenile();
})();
