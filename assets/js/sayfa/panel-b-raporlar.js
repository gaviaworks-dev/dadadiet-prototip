/* Raporlar (SH-13-12): randevu, danışan, plan, gelir ve memnuniyet. Hepsi demo durumundan anlık hesaplanır;
   rakam üretilmez. Memnuniyet örnek değerlendirmelerden hesaplanır; kayıt yoksa (?bos=1) sayfadaki boş durum kalır. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, UY = window.UYUM, h = PA.h;
  const $ = (id) => document.getElementById(id);
  const d = PA.d();
  const yuzde = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const kpi = (ikon, etiket, sayi, alt) => `<div class="kart kpi"><span class="ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><div class="govde"><span class="etiket">${etiket}</span><span class="sayi">${sayi}</span><span class="kpi-degisim"><i class="fa-solid fa-minus" aria-hidden="true"></i> ${alt}</span></div></div>`;
  const kart = (ikon, baslik, alt, govde, sag) => `<div class="kart panel"><div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${baslik}</h2>${alt ? `<p>${alt}</p>` : ''}</div>${sag || ''}</div><div class="kart-govde">${govde}</div></div>`;
  const dagilim = (l, toplam) => `<div class="ayar-liste">${l.map(([etiket, n, hap]) => `<div class="ayar-satir"><span class="as-metin"><b>${etiket}</b>${PA.olcer(yuzde(n, toplam))}</span><span class="as-eylem">${hap || ''}<b>${n}</b><span class="rozet pasif">%${yuzde(n, toplam)}</span></span></div>`).join('')}</div>`;
  const tablo = (baslik, kolonlar, satirlar) => `<div class="tablo-kap gomulu"><table class="tablo panel dar-yigin"><caption class="yalniz-okuyucu">${baslik}</caption><thead><tr>${kolonlar.map((k, i) => `<th scope="col"${i ? ' class="num" data-kolon-tut' : ''}>${k}</th>`).join('')}</tr></thead><tbody>${satirlar.map((s) => `<tr>${s.map((x, i) => `<td${i ? ` class="num" data-etiket="${kolonlar[i]}"` : ''}>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const csv = {};

  /* ── Randevu ── */
  function randevu() {
    const l = d.randevular || [], durum = (r) => PA.rDurum(r);
    const say = (k) => l.filter((r) => durum(r) === k).length;
    const tamam = say('tamamlandi'), gelmedi = say('gelmedi'), iptal = say('iptal'), sonuc = say('sonuc-bekliyor'), planli = say('dolu'), onay = say('onay-bekliyor');
    const online = l.filter((r) => r.tur === 'online' && r.durum !== 'iptal').length, yuz = l.filter((r) => r.tur !== 'online' && r.durum !== 'iptal').length;
    const ilk = l.map((r) => r.tarih).sort()[0], son = l.map((r) => r.tarih).sort().pop();
    const GUN = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const gunler = GUN.map((g) => [g, l.filter((r) => r.durum !== 'iptal' && PA.gunAdi(r.tarih) === g).length]);
    const acik = l.filter((r) => r.durum !== 'iptal').length;
    $('p-randevu').innerHTML = `<div class="iki-kolon">
${kart('fa-chart-simple', 'Durum Dağılımı', ilk ? PA.tarih(ilk) + ' – ' + PA.tarih(son) + ' arası ' + l.length + ' randevu' : '', dagilim([['Tamamlandı', tamam, ''], ['Planlandı', planli, ''], ['Onay bekliyor', onay, ''], ...(PA.bayrak('randevu-sonuc-bekliyor') ? [['Sonuç bekliyor', sonuc, '']] : []), ['Gelmedi', gelmedi, ''], ['İptal', iptal, '']], l.length))}
<div class="yigin">
${kart('fa-video', 'Görüşme Biçimi', 'İptal edilenler hariç', dagilim([['Online', online], ['Yüz yüze', yuz]], online + yuz))}
${kart('fa-calendar-week', 'Günlere Göre', 'İptal edilenler hariç', dagilim(gunler.filter((g) => g[1]), acik))}
</div></div>`;
    csv.randevu = [['Tarih', 'Saat', 'Danışan', 'Biçim', 'Süre (dk)', 'Durum', 'Ödeme']].concat(l.map((r) => [r.tarih, r.saat, (PA.danisan(r.danisan_id) || {}).ad, PA.rTur(r), r.sure, PA.rEtiket(r), PA.rOdeme ? PA.rOdeme(r).etiket : '']));
    return [kpi('fa-calendar-check', 'Randevu', l.length, (planli + onay) + ' yaklaşan'), kpi('fa-circle-check', 'Tamamlanan', tamam, sonuc + ' sonuç bekliyor'), kpi('fa-user-xmark', 'Gelmedi oranı', '%' + yuzde(gelmedi, tamam + gelmedi), gelmedi + ' / ' + (tamam + gelmedi) + ' sonuçlanan'), kpi('fa-ban', 'İptal oranı', '%' + yuzde(iptal, l.length), iptal + ' iptal')];
  }

  /* ── Danışan ── */
  function danisan() {
    const l = d.danisanlar || [], takipte = l.filter(PA.takipte);
    const durumlar = Object.entries(PA.durumlar).map(([k, [e, s]]) => [e, l.filter((x) => x.durum === k).length, '']).filter((x) => x[1]);
    const takip = ['Kontrol gecikti', 'Hedefe yakın', 'Yolunda'].map((t) => [t, takipte.filter((x) => PA.takip(x) === t).length]);
    const il = takipte.map((x) => ({ x, i: PA.ilerleme(x) })).filter((y) => y.i);
    const ort = il.length ? Math.round(il.reduce((t, y) => t + y.i.yuzde, 0) / il.length) : 0;
    const satir = takipte.map((x) => { const i = PA.ilerleme(x), g = PA.gelecekRandevu(x.id); return [`<a href="${PA.yol.danisan(x.id)}">${h(x.ad)}</a>`, PA.danisanHap(x), h(PA.takip(x)), i ? '%' + i.yuzde : 'İzin ya da ölçüm yok', x.son_gorusme ? PA.tarih(x.son_gorusme) : '—', g ? PA.tarih(g.tarih) : '—']; });
    $('p-danisan').innerHTML = `<div class="yigin"><div class="iki-kolon">
${kart('fa-users', 'Durum', l.length + ' kayıtlı danışan', dagilim(durumlar, l.length))}
${kart('fa-route', 'Takip', 'Takipteki ' + takipte.length + ' danışan', dagilim(takip, takipte.length))}
</div>
${kart('fa-table-list', 'Takipteki Danışanlar', 'İlerleme ölçüm izni olan danışanda hesaplanır', tablo('Takipteki danışanlar', ['Danışan', 'Durum', 'Takip', 'İlerleme', 'Son görüşme', 'Sıradaki'], satir))}</div>`;
    csv.danisan = [['Danışan', 'Durum', 'Takip', 'İlerleme', 'Son görüşme', 'Sıradaki randevu']].concat(takipte.map((x) => { const i = PA.ilerleme(x), g = PA.gelecekRandevu(x.id); return [x.ad, (PA.durumlar[x.durum] || [x.durum])[0], PA.takip(x), i ? i.yuzde : '', x.son_gorusme || '', g ? g.tarih : '']; }));
    return [kpi('fa-users', 'Danışan', l.length, takipte.length + ' takipte'), kpi('fa-user-plus', 'Yeni talep', l.filter((x) => x.durum === 'talep').length, 'yanıt bekliyor'), kpi('fa-clock-rotate-left', 'Kontrol gecikti', takip[0][1], 'planlı randevusu yok'), kpi('fa-chart-line', 'Ortalama ilerleme', il.length ? '%' + ort : '—', il.length + ' danışanda ölçüldü')];
  }

  /* ── Plan ── */
  function plan() {
    const l = d.planlar || [], DUR = { gonderildi: 'Gönderildi', taslak: 'Taslak', arsiv: 'Arşiv' };
    const durumlar = Object.entries(DUR).map(([k, e]) => [e, l.filter((p) => p.durum === k).length]);
    const gonderilen = l.filter((p) => p.durum === 'gonderildi');
    const uyum = gonderilen.map((p) => { const dn = PA.danisan(p.danisan_id); const acik = dn && (dn.izinler || {}).gunluk; const s = acik && UY ? UY.ozet(d, p, DD.bugun) : null; return { p, dn, oran: s && DD.bugun >= s.bas ? s.program.oran : null, acik }; });
    const olculen = uyum.filter((u) => u.oran != null), ort = olculen.length ? Math.round(olculen.reduce((t, u) => t + u.oran, 0) / olculen.length) : null;
    const revize = l.filter((p) => (p.surum || 1) > 1).length;
    const satir = l.slice().sort((a, b) => String(b.tarih).localeCompare(String(a.tarih))).map((p) => { const u = uyum.find((x) => x.p === p), dn = PA.danisan(p.danisan_id); return [`<a href="${PA.yol.plan(p.id)}">${h(p.ad)}</a>`, dn ? h(dn.ad) : '—', DUR[p.durum] || p.durum, String((p.gunler || []).length) + ' gün', 'Sürüm ' + (p.surum || 1), u ? (u.oran != null ? '%' + u.oran : u.acik ? 'Henüz işaret yok' : 'Günlük izni yok') : '—']; });
    $('p-plan').innerHTML = `<div class="yigin"><div class="iki-kolon">
${kart('fa-clipboard-list', 'Plan Durumu', l.length + ' plan', dagilim(durumlar, l.length))}
${kart('fa-list-check', 'Programa Uyum', 'Gönderilen planlarda üyenin Uydum / Atladım işaretleri; günlük izni olan danışanlarda', olculen.length ? `<div class="ayar-liste">${olculen.map((u) => `<div class="ayar-satir"><span class="as-metin"><b>${h(u.dn.ad)}</b>${PA.olcer(u.oran)}</span><span class="as-eylem"><span class="rozet pasif">%${u.oran}</span></span></div>`).join('')}</div>` : '<p class="alan-yardim"><span>Ölçülebilen plan yok.</span></p>')}
</div>
${kart('fa-table-list', 'Planlar', 'Sürüm, planın kaç kez yeniden gönderildiğini gösterir', tablo('Planlar', ['Plan', 'Danışan', 'Durum', 'Süre', 'Sürüm', 'Uyum'], satir))}</div>`;
    csv.plan = [['Plan', 'Danışan', 'Durum', 'Gün', 'Sürüm', 'Uyum (%)']].concat(l.map((p) => { const u = uyum.find((x) => x.p === p); return [p.ad, (PA.danisan(p.danisan_id) || {}).ad || '', DUR[p.durum] || p.durum, (p.gunler || []).length, p.surum || 1, u && u.oran != null ? u.oran : '']; }));
    return [kpi('fa-clipboard-list', 'Plan', l.length, gonderilen.length + ' gönderildi'), kpi('fa-file-pen', 'Taslak', durumlar[1][1], 'gönderilmeyi bekliyor'), kpi('fa-rotate', 'Revize edilen', revize, 'sürümü 1\'den büyük'), kpi('fa-list-check', 'Ortalama uyum', ort != null ? '%' + ort : '—', olculen.length + ' planda ölçüldü')];
  }

  /* ── Gelir ── */
  function gelir() {
    const k = d.kazanclar || { aylik: [], son_islemler: [], toplam: {} }, AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const islem = k.son_islemler || [], iade = islem.filter((x) => x.durum === 'iade'), iadeNet = iade.reduce((t, x) => t + x.net, 0);
    const paketler = (d.paketler || []).map((p) => { const l = islem.filter((x) => x.paket_id === p.id && x.durum !== 'iptal' && x.durum !== 'iade'); return [h(p.ad), String(l.length), PA.para(l.reduce((t, x) => t + x.tutar, 0)), PA.para(l.reduce((t, x) => t + x.net, 0)), String(p.satis_sayisi || 0)]; });
    $('p-gelir').innerHTML = `<div class="yigin">
${kart('fa-chart-line', 'Son 12 Ay Net Kazanç', 'Aylık net, ₺. Son ay ' + PA.tarih(DD.bugun) + ' tarihine kadar.', '<div class="grafik-kap" id="raporGrafik"></div>', `<a class="dugme hayalet kucuk" href="${DD.kok}diyetisyen-paneli/kazanclar/">Kazançlarım</a>`)}
${kart('fa-box-open', 'Paketlere Göre', 'Son işlemler listesindeki seanslar; satış sayısı paketin toplam satışıdır', tablo('Paketlere göre gelir', ['Paket', 'Seans', 'Brüt', 'Net', 'Satış'], paketler))}
</div>`;
    DD.grafik.cizgi($('raporGrafik'), { baslik: 'Son 12 ay net kazanç', etiketler: k.aylik.map((a) => AY[+a.ay.slice(5) - 1]), seriler: [{ ad: 'Net kazanç', degerler: k.aylik.map((a) => a.net) }] });
    csv.gelir = [['Ay', 'Seans', 'Brüt', 'Komisyon', 'Net']].concat(k.aylik.map((a) => [a.ay, a.seans, a.gelir, a.komisyon, a.net]));
    const son = k.aylik[k.aylik.length - 1] || {};
    return [kpi('fa-sack-dollar', 'Toplam net', PA.para((k.toplam || {}).net || 0), PA.sayi((k.toplam || {}).seans || 0, 0) + ' seans'), kpi('fa-calendar', 'Bu ay net', PA.para(son.net || 0), (son.seans || 0) + ' seans'), kpi('fa-percent', 'Komisyon', PA.para((k.toplam || {}).komisyon || 0), '%' + Math.round((k.komisyon_orani || 0) * 100) + ' oran'), kpi('fa-rotate-left', 'İade', PA.para(Math.abs(iadeNet)), iade.length + ' işlem')];
  }

  /* ── Memnuniyet: danışan değerlendirmeleri (demo.diyetisyen.yorumlar, profil sayfasıyla aynı kayıt).
     Kayıtlar prototip örneğidir; ?bos=1'de süzülür, sayfadaki boş durum görünür. */
  function memnuniyet() {
    const l = ((d.diyetisyen || {}).yorumlar || []).slice().sort((a, b) => b.tarih.localeCompare(a.tarih));
    const tamam = (d.randevular || []).filter((r) => PA.rDurum(r) === 'tamamlandi').length, gonderilen = (d.planlar || []).filter((p) => p.durum === 'gonderildi').length;
    const sonKpi = [kpi('fa-circle-check', 'Tamamlanan görüşme', tamam, 'değerlendirilebilecek'), kpi('fa-clipboard-check', 'Gönderilen plan', gonderilen, 'değerlendirilebilecek')];
    if (!l.length) return [kpi('fa-star', 'Ortalama puan', 'Henüz yok', 'puanlama yayında değil'), kpi('fa-comment', 'Değerlendirme', '0', 'kayıt yok')].concat(sonKpi);
    const ort = l.reduce((t, y) => t + y.puan, 0) / l.length, ornek = l.some((y) => y.ornek) ? '<span class="ornek-etiket satir-ici">prototip örneği</span>' : '';
    const yildiz = (n) => `<span class="yildizlar" role="img" aria-label="5 üzerinden ${n}">${[1, 2, 3, 4, 5].map((i) => `<i class="fa-solid fa-star${i > n ? ' bos' : ''}" aria-hidden="true"></i>`).join('')}</span>`;
    const bicim = (y) => (y.tur === 'online' ? 'Online' : 'Yüz yüze');
    const konular = [...new Set(l.map((y) => y.konu))].map((k) => [h(k), l.filter((y) => y.konu === k).length]).sort((a, b) => b[1] - a[1]);
    const tur = [['Online', l.filter((y) => y.tur === 'online').length], ['Yüz yüze', l.filter((y) => y.tur !== 'online').length]];
    const yorum = (y) => `<div class="ayar-satir"><span class="as-metin"><b>${h(y.konu)} · ${bicim(y)} · ${y.sure_hafta} hafta</b><span>${h(y.metin)}</span><span>${h(y.danisan_etiket)} · ${PA.tarih(y.tarih)}</span></span><span class="as-eylem">${yildiz(y.puan)}</span></div>`;
    $('p-memnuniyet').innerHTML = `<div class="yigin"><div class="iki-kolon">
${kart('fa-star', 'Puan Dağılımı', l.length + ' değerlendirme · ortalama ' + PA.sayi(ort, 1), dagilim([5, 4, 3, 2, 1].map((n) => [n + ' yıldız', l.filter((y) => y.puan === n).length]), l.length), ornek)}
<div class="yigin">
${kart('fa-tags', 'Konulara Göre', 'Değerlendirilen takibin konusu', dagilim(konular, l.length))}
${kart('fa-video', 'Görüşme Biçimi', 'Değerlendirilen takiplerin biçimi', dagilim(tur, l.length))}
</div></div>
${kart('fa-comment-dots', 'Son Değerlendirmeler', 'Danışan adı gösterilmez; yaş aralığı, konu ve takip süresi görünür', `<div class="ayar-liste">${l.map(yorum).join('')}</div>`, `<a class="dugme hayalet kucuk" href="${DD.kok}diyetisyen/${h(d.diyetisyen.slug)}/#yorumlar">Profilde gör</a>`)}</div>`;
    csv.memnuniyet = [['Tarih', 'Puan', 'Konu', 'Biçim', 'Süre (hafta)', 'Danışan', 'Yorum']].concat(l.map((y) => [y.tarih, y.puan, y.konu, bicim(y), y.sure_hafta, y.danisan_etiket, y.metin]));
    return [kpi('fa-star', 'Ortalama puan', PA.sayi(ort, 1), '5 üzerinden · prototip örneği'), kpi('fa-comment', 'Değerlendirme', l.length, 'son ' + PA.tarih(l[0].tarih))].concat(sonKpi);
  }

  const RAPOR = { randevu, danisan, plan, gelir, memnuniyet };
  const kpiler = {};
  Object.keys(RAPOR).forEach((r) => { kpiler[r] = RAPOR[r](); });
  PA.oranlar();
  let secili = 'randevu';
  const goster = (r) => { secili = r; $('raporKpi').innerHTML = kpiler[r].join(''); };
  $('raporSekme').addEventListener('click', (e) => {
    const t = e.target.closest('.sekme');
    if (!t) return;
    const r = t.id.slice(2), u = new URL(location.href);
    if (r === 'randevu') u.searchParams.delete('sekme'); else u.searchParams.set('sekme', r);
    history.replaceState(null, '', u);
    goster(r);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-rapor="csv"]')) return;
    if (!csv[secili]) { DD.toast('Memnuniyet raporunda indirilecek kayıt yok.', 'uyari'); return; }
    PA.csvIndir('rapor-' + secili + '-' + DD.bugun + '.csv', csv[secili]);
    DD.toast((csv[secili].length - 1) + ' satır indirildi.');
  });
  goster('randevu');
  const ilk = PA.parametre('sekme');
  if (ilk && $('t-' + ilk)) $('t-' + ilk).click();
})();
