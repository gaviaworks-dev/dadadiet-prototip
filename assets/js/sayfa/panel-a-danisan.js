/* Danışan kartı: yedi sekme. Veri izni kapalı türler kilit görünümüne düşer. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const $ = (id) => document.getElementById(id);
  const id = $('danisanBas').dataset.danisan;
  const dn = PA.danisan(id);
  const IZIN = {
    olcum: ['Ölçümler', 'fa-weight-scale', 'Kilo, bel ve yağ oranı geçmişi', 'olcum'],
    tahlil: ['Kan tahlilleri', 'fa-vial', 'Yüklediği tahlil dosyaları ve değerleri', 'tahlil'],
    anamnez: ['Anamnez', 'fa-notes-medical', 'Sağlık öyküsü, ilaçlar ve alışkanlıklar', 'not'],
    gunluk: ['Günlük takip', 'fa-list-check', 'Öğün, su ve adım kayıtları', null],
    belge: ['Belgeler', 'fa-file-medical', 'Paylaştığı diğer sağlık belgeleri', null],
  };
  const v = { metrik: 'kilo', tahlil: null, olcumDuzelt: null, randevu: 'yaklasan' };
  const talepler = () => dn.izin_talepleri || (dn.izin_talepleri = {});
  const ilk = PA.ilkAd(dn.ad), ilgi = PA.ilgi(ilk);
  const kilit = (tur) => `<div class="kart panel"><div class="kart-govde">${PA.kilitGorunum(IZIN[tur][0], tur, talepler()[tur], ilk)}</div></div>`;
  const bos = (ikon, baslik, metin, eylem) => `<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><h3>${baslik}</h3><p>${metin}</p>${eylem || ''}</div>`;
  const kartBas = (ikon, baslik, sag, alt) => `<div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${baslik}</h2>${alt ? `<p>${alt}</p>` : ''}</div>${sag || ''}</div>`;
  const kunye = (l) => `<dl class="kunye belge">${l.filter((x) => x[1] != null && x[1] !== '').map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>`;

  /* ── Başlık ve kalıcı künye ──────────────────────────────────────── */
  const satir = (ikon, etiket, deger, ek) => `<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><span class="as-metin"><span>${etiket}</span><b>${deger}</b></span>${ek || ''}</div>`;
  function kunyeCiz() {
    const p = PA.paket(dn.paket_id), i = PA.ilerleme(dn), g = PA.gelecekRandevu(id);
    const randevu = g
      ? `<button class="ayar-satir" type="button" data-randevu="${g.id}"><span class="as-ikon"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i></span><span class="as-metin"><span>Sonraki randevu</span><b>${h(PA.ayGun(g.tarih))} · ${g.saat}</b></span><i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i></button>`
      : satir('fa-calendar-xmark', 'Sonraki randevu', `${h(ilgi)} yaklaşan randevusu yok`);
    $('kunyeKart').innerHTML = `<div class="kart panel"><div class="kart-govde"><div class="kunye-kimlik">${PA.avatar(dn.ad)}<div><h2>${h(dn.ad)}</h2>${PA.danisanHap(dn)}</div></div>
<div class="kunye-kisayol"><button class="ikon-dugme" type="button" data-sekme-git="mesaj" aria-label="Mesaj gönder"><i class="fa-solid fa-comment" aria-hidden="true"></i></button>${dn.durum === 'bitti' ? '' : `<button class="ikon-dugme" type="button" data-randevu-ac data-danisan="${id}" aria-label="Randevu oluştur"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i></button>`}<button class="ikon-dugme" type="button" data-is="not-ekle" aria-label="Klinik not ekle"><i class="fa-solid fa-note-sticky" aria-hidden="true"></i></button><a class="ikon-dugme" href="${PA.yol.yeniPlan(id)}" aria-label="Yeni plan"><i class="fa-solid fa-clipboard-list" aria-hidden="true"></i></a></div>
<div class="ayar-liste">${satir('fa-weight-scale', 'Güncel kilo', i ? PA.sayi(i.son) + ' kg <small>' + PA.tarih(dn.olcumler[dn.olcumler.length - 1].tarih) + '</small>' : 'İzin yok')}${satir('fa-bullseye', 'Hedef', PA.sayi(dn.hedef_kilo) + ' kg' + (i ? ' · %' + i.yuzde : ''))}${randevu}${satir('fa-box-open', 'Paket', p ? h(p.ad) + ' · ' + PA.kalanSeans(dn) + '/' + p.seans : '—')}${satir('fa-id-badge', 'Kişi', dn.yas + ' yaş · ' + h(dn.cinsiyet) + ' · ' + dn.boy + ' cm')}</div>
<div class="kunye-eylem"><button class="dugme hayalet kucuk tam-en" type="button" data-is="hedef">Hedefi güncelle</button>${dn.durum === 'bitti' ? '<button class="dugme hayalet kucuk tam-en" type="button" data-is="baslat">Takibi yeniden başlat</button>' : '<button class="dugme hayalet kucuk tehlike tam-en" type="button" data-is="bitir">Takibi bitir</button>'}</div></div></div>`;
  }
  function basCiz() {
    $('danisanAlt').textContent = dn.hedef;
    document.querySelector('#danisanBas [data-randevu-ac]').hidden = dn.durum === 'bitti';
    Object.keys(IZIN).forEach((t) => {
      const sekme = IZIN[t][3];
      if (!sekme) return;
      $('t-' + sekme).querySelector('[data-sekme-ek]').innerHTML = dn.izinler[t] ? '' : '<i class="fa-solid fa-lock kilit-ikon" aria-label="İzin yok"></i>';
    });
    const b = $('talepBand');
    if (dn.durum === 'yanit-bekliyor') {
      const k = PA.konusma(id), m = k && k.mesajlar.filter((x) => x.kimden === 'danisan').pop();
      b.innerHTML = `<div class="uyari-kutu uyari"><i class="fa-solid fa-user-clock" aria-hidden="true"></i><p><b>Yanıtını bekliyor.</b> ${h(m ? m.metin : dn.mesaj_ozeti)}</p><div class="eylem-satiri"><button class="dugme hayalet kucuk" type="button" data-is="yanitla">Yanıtla</button><button class="dugme hayalet kucuk" type="button" data-is="yanitlandi">Yanıtlandı işaretle</button></div></div>`;
    } else if (dn.durum === 'bitti') {
      b.innerHTML = `<div class="bilgi-notu"><i class="fa-solid fa-flag-checkered" aria-hidden="true"></i><p><b>Takip bitti.</b> Son görüşme ${PA.tarih(dn.son_gorusme)}. Geçmiş kayıtlar burada kalır.</p></div>`;
    } else b.innerHTML = '';
    kunyeCiz();
  }

  /* ── Özet ───────────────────────────────────────────────────────── */
  const kpi = (ikon, e, s, alt) => `<div class="kart kpi"><span class="ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><div class="govde"><span class="etiket">${e}</span><span class="sayi">${s}</span><span class="kpi-degisim">${alt}</span></div></div>`;
  /* Randevular üç küme: yaklaşan, geçmiş, gerçekleşmeyen */
  const R_KUME = { yaklasan: ['dolu', 'onay-bekliyor'], gecmis: ['tamamlandi', 'sonuc-bekliyor'], olmadi: ['gelmedi', 'iptal'] };
  const R_BOS = { yaklasan: 'yaklaşan randevusu yok', gecmis: 'geçmiş görüşmesi yok', olmadi: 'gerçekleşmeyen randevusu yok' };
  function randevuKart(rs) {
    const l = rs.filter((r) => R_KUME[v.randevu].includes(PA.rDurum(r)));
    if (v.randevu === 'yaklasan') l.reverse();
    const satirlar = l.map((r) => `<button class="ayar-satir" type="button" data-randevu="${r.id}"><span class="as-saat${v.randevu === 'yaklasan' ? '' : ' gecti'}">${+r.tarih.slice(8)}.${r.tarih.slice(5, 7)}<small>${r.saat}</small></span><span class="as-metin"><b>${PA.rTur(r)} · ${r.sure} dk</b><span>${h(r.ozet || r.not || PA.gunAdi(r.tarih))}</span></span><span class="as-eylem">${PA.talepRozet(r) || PA.rHap(r)}</span></button>`).join('');
    const sekme = [['yaklasan', 'Yaklaşan'], ['gecmis', 'Geçmiş'], ['olmadi', 'Gerçekleşmedi']].map(([k, a]) => `<button type="button" data-deger="${k}" aria-pressed="${k === v.randevu}">${a} ${rs.filter((r) => R_KUME[k].includes(PA.rDurum(r))).length}</button>`).join('');
    const eylem = dn.durum === 'bitti' ? '' : `<button class="dugme hayalet" type="button" data-randevu-ac data-danisan="${id}">Randevu oluştur</button>`;
    return `<div class="kart panel">${kartBas('fa-calendar-days', 'Randevular')}<div class="kart-govde"><div class="segment" id="randevuKume" role="group" aria-label="Randevu kümesi">${sekme}</div>${l.length ? `<div class="ayar-liste kart-ic-liste">${satirlar}</div>` : bos('fa-calendar-xmark', `${h(ilgi)} ${R_BOS[v.randevu]}`, 'Takvimden yeni bir görüşme planlayabilirsin.', v.randevu === 'yaklasan' ? eylem : '')}</div></div>`;
  }
  function paketKart() {
    const p = PA.paket(dn.paket_id);
    if (!p) return `<div class="kart panel">${kartBas('fa-box-open', 'Paket')}<div class="kart-govde">${bos('fa-box-open', `${h(ilgi)} paketi yok`, 'Paket atandığında seans hakkı burada görünür.')}</div></div>`;
    const kalan = PA.kalanSeans(dn), kullanilan = p.seans - kalan, yuzde = Math.round((kullanilan / p.seans) * 100);
    return `<div class="kart panel">${kartBas('fa-box-open', 'Paket')}<div class="kart-govde"><div class="ayar-liste"><div class="ayar-satir"><span class="as-metin"><b>${h(p.ad)}</b><span>${h(p.aciklama)}</span>${PA.olcer(yuzde)}<span>${kullanilan} seans kullanıldı ya da planlandı, ${kalan} seans kaldı</span></span></div>${satir('fa-tag', 'Paket tutarı', PA.para(p.fiyat))}</div></div></div>`;
  }
  function odemeKart() {
    const l = (PA.d().kazanclar ? PA.d().kazanclar.son_islemler : []).filter((x) => x.danisan_id === id).slice(0, 3);
    const bekleyen = l.filter((x) => x.durum === 'beklemede').reduce((t, x) => t + x.tutar, 0);
    const git = `<a class="dugme hayalet kucuk" href="${DD.kok}diyetisyen-paneli/kazanclar/">Kazançlarım</a>`;
    return `<div class="kart panel">${kartBas('fa-wallet', 'Ödemeler', l.length ? git : '', l.length ? (bekleyen ? PA.para(bekleyen) + ' beklemede' : 'Bekleyen ödeme yok') : '')}<div class="kart-govde">${l.length ? `<div class="ayar-liste">${l.map((x) => `<div class="ayar-satir"><span class="as-metin"><b>${PA.para(x.tutar)}</b><span>${h(x.aciklama)} · ${PA.tarih(x.tarih)}</span></span><span class="as-eylem">${x.durum === 'odendi' ? PA.hap('Ödendi', 'cozulen') : PA.hap('Beklemede', 'bekleyen')}</span></div>`).join('')}</div>` : bos('fa-wallet', `${h(ilgi)} son ödeme kaydı yok`, 'Tamamlanan seanslar burada listelenir.', git)}</div></div>`;
  }
  function ozetCiz() {
    const i = PA.ilerleme(dn), rs = PA.d().randevular.filter((r) => r.danisan_id === id).sort((a, b) => (b.tarih + b.saat).localeCompare(a.tarih + a.saat));
    const say = (d) => rs.filter((r) => PA.rDurum(r) === d).length;
    const plan = PA.d().planlar.filter((x) => x.danisan_id === id && x.durum === 'gonderildi').sort((a, b) => b.tarih.localeCompare(a.tarih))[0];
    const notlar = notSirali().slice(0, 2);
    const acik = dn.izinler.anamnez;
    $('p-ozet').innerHTML = `<div class="yigin">
<div class="kart-izgara c4">${i
    ? kpi('fa-flag', 'Başlangıç', PA.sayi(i.bas) + ' kg', PA.tarih(dn.olcumler[0].tarih)) + kpi('fa-arrow-trend-down', 'Değişim', PA.kgMetin(i.degisim), i.hafta + '. hafta') + kpi('fa-chart-line', 'İlerleme', '%' + i.yuzde, h(PA.takip(dn))) + kpi('fa-calendar-check', 'Tamamlanan', say('tamamlandi'), 'görüşme')
    : kpi('fa-lock', 'Ölçüm', '—', 'İzin yok') + kpi('fa-bullseye', 'Hedef', PA.sayi(dn.hedef_kilo) + ' kg', h(PA.takip(dn))) + kpi('fa-calendar-check', 'Tamamlanan', say('tamamlandi'), 'görüşme') + kpi('fa-ticket', 'Kalan seans', PA.kalanSeans(dn) ?? '—', 'paket hakkı')}</div>
${randevuKart(rs)}
<div class="kart-izgara c2">${paketKart()}${odemeKart()}</div>
<div class="kart panel">${kartBas('fa-heart-pulse', 'Sağlık özeti')}<div class="kart-govde">${kunye([['Hedef', h(dn.hedef)], ['Hassasiyet', acik ? (dn.hassasiyetler.length ? h(dn.hassasiyetler.join(', ')) : 'Yok') : 'İzin yok'], ['Kronik durum', acik ? (dn.kronik.length ? h(dn.kronik.join(', ')) : 'Yok') : 'İzin yok']])}</div></div>
<div class="kart-izgara c2">
  <div class="kart panel">${kartBas('fa-clipboard-list', 'Atanmış plan')}<div class="kart-govde">${plan ? `<div class="ayar-liste"><a class="ayar-satir" href="${PA.yol.plan(plan.id)}"><span class="as-metin"><b>${h(plan.ad)}</b><span>${plan.hedef_kcal} kcal · ${PA.tarih(plan.tarih)}</span></span><i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i></a></div>` : bos('fa-clipboard', `${h(ilgi)} atanmış planı yok`, 'Plan oluşturup gönderdiğinde burada görünür.', `<a class="dugme hayalet" href="${PA.yol.yeniPlan(id)}">Yeni plan</a>`)}</div></div>
  <div class="kart panel">${kartBas('fa-note-sticky', 'Son notlar', notlar.length ? `<button class="dugme hayalet kucuk" type="button" data-sekme-git="not">Tümü</button>` : '')}<div class="kart-govde">${notlar.length ? `<div class="ayar-liste">${notlar.map((n) => `<div class="ayar-satir"><span class="as-metin"><b>${PA.tarih(n.tarih)}</b><span>${h(n.metin)}</span></span></div>`).join('')}</div>` : bos('fa-note-sticky', `${h(ilgi)} klinik notu yok`, 'İlk görüşme notunu ekle.', '<button class="dugme hayalet" type="button" data-is="not-ekle">Not ekle</button>')}</div></div>
</div>
</div>`;
    PA.oranlar($('p-ozet'));
    $('randevuKume').addEventListener('dd:secim', (e) => { v.randevu = e.detail.deger; ozetCiz(); });
  }

  /* ── Ölçümler ───────────────────────────────────────────────────── */
  const METRIK = { kilo: ['Kilo', 'kg', 'kilo'], bel: ['Bel', 'cm', 'bel'], yag: ['Yağ oranı', '%', 'yag_orani'] };
  function olcumCiz() {
    if (!dn.izinler.olcum) { $('p-olcum').innerHTML = kilit('olcum'); return; }
    const o = dn.olcumler, ters = [...o].reverse();
    if (!o.length) { $('p-olcum').innerHTML = `<div class="kart panel"><div class="kart-govde">${bos('fa-weight-scale', `${h(ilgi)} ölçümü yok`, 'İlk ölçüm kaydıyla grafik burada başlar.', '<button class="dugme hayalet" type="button" data-is="olcum-ekle">Ölçüm ekle</button>')}</div></div>`; return; }
    const fark = (i) => { const k = ters[i], e = ters[i + 1]; return e && k.kilo != null && e.kilo != null ? Math.round((k.kilo - e.kilo) * 10) / 10 : null; };
    $('p-olcum').innerHTML = `<div class="yigin"><div class="kart panel">${kartBas('fa-chart-line', 'Gelişim', `<div class="segment" id="metrikSec" role="group" aria-label="Ölçüm türü">${Object.keys(METRIK).map((k) => `<button type="button" data-deger="${k}" aria-pressed="${k === v.metrik}">${METRIK[k][0]}</button>`).join('')}</div>`)}<div class="kart-govde"><div class="grafik-kap" id="olcumGrafik"></div><div class="grafik-lejant" id="olcumLejant"></div></div></div>
<div class="kart panel">${kartBas('fa-table-list', 'Ölçüm geçmişi', `<button class="dugme hayalet kucuk" type="button" data-is="olcum-ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i> Ölçüm ekle</button>`, o.length + ' kayıt')}<div class="kart-govde bosluksuz"><div class="tablo-kap gomulu"><table class="tablo panel sabit-sutun tek-eylem etiketli-yigin"><caption class="yalniz-okuyucu">Ölçüm geçmişi</caption><thead><tr><th scope="col" data-oran="22">Tarih</th><th class="num" scope="col" data-oran="16">Kilo</th><th class="num" scope="col" data-oran="16">Değişim</th><th class="num" scope="col" data-oran="16">Bel</th><th class="num" scope="col" data-oran="16">Yağ</th><th class="eylem" scope="col">İşlem</th></tr></thead><tbody>${ters.map((m, i) => { const f = fark(i); return `<tr><td data-etiket="Tarih"><b>${PA.tarih(m.tarih)}</b><small>${m.hafta}. hafta${m.not ? ' · ' + h(m.not) : ''}</small></td><td class="num" data-etiket="Kilo">${PA.sayi(m.kilo)} kg</td><td class="num" data-etiket="Değişim">${f == null ? '—' : PA.kgMetin(f)}</td><td class="num" data-etiket="Bel">${m.bel == null ? '—' : PA.sayi(m.bel) + ' cm'}</td><td class="num" data-etiket="Yağ">${m.yag_orani == null ? '—' : '%' + PA.sayi(m.yag_orani)}</td><td class="eylem"><span class="satir-eylem"><button class="ikon-dugme" type="button" data-olcum="${o.indexOf(m)}" aria-label="${PA.tarih(m.tarih)} ölçümünü düzelt"><i class="fa-solid fa-pen" aria-hidden="true"></i></button></span></td></tr>`; }).join('')}</tbody></table></div></div></div></div>`;
    PA.oranTablo($('p-olcum'));
    grafikCiz();
    $('metrikSec').addEventListener('dd:secim', (e) => { v.metrik = e.detail.deger; grafikCiz(); });
  }
  function grafikCiz() {
    const [ad, birim, alan] = METRIK[v.metrik];
    const l = dn.olcumler.filter((m) => m[alan] != null);
    const hedef = v.metrik === 'kilo' ? dn.hedef_kilo : undefined;
    DD.grafik.cizgi($('olcumGrafik'), { baslik: ad + ' gelişimi', etiketler: l.map((m) => m.tarih.slice(8, 10) + '.' + m.tarih.slice(5, 7)), seriler: [{ ad, degerler: l.map((m) => m[alan]) }], hedef, basamak: 1 });
    $('olcumLejant').innerHTML = `<span class="lejant-kalem dolu">${ad} (${birim})</span>${hedef != null ? `<span class="lejant-kalem kapali">Hedef ${PA.sayi(hedef)} kg</span>` : ''}`;
  }
  function olcumAc(i) {
    const m = i == null ? null : dn.olcumler[i];
    v.olcumDuzelt = i;
    $('olcumPanelB').textContent = m ? 'Ölçümü düzelt' : 'Ölçüm ekle';
    $('oTarih').value = PA.tarih(m ? m.tarih : DD.bugun);
    $('oKilo').value = m ? m.kilo ?? '' : '';
    $('oBel').value = m ? m.bel ?? '' : '';
    $('oKalca').value = m ? m.kalca ?? '' : '';
    $('oYag').value = m ? m.yag_orani ?? '' : '';
    $('oNot').value = m ? m.not || '' : '';
    DD.ac('#olcumPanel');
  }
  const sayiOku = (el) => (el.value === '' ? null : Number(el.value));
  $('olcumPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const tarih = PA.tarihOku($('oTarih').value), alan = $('oTarih').closest('.alan');
    if (!tarih) { window.DM_HATA_YAZ(alan, 'Tarihi GG.AA.YYYY biçiminde yaz.'); $('oTarih').focus(); return; }
    window.DM_HATA_SIL(alan);
    const kilo = sayiOku($('oKilo'));
    if (kilo == null) { window.DM_HATA_YAZ($('oKilo').closest('.alan'), 'Kilo zorunlu.'); $('oKilo').focus(); return; }
    window.DM_HATA_SIL($('oKilo').closest('.alan'));
    const k = { tarih, kilo, bel: sayiOku($('oBel')), kalca: sayiOku($('oKalca')), yag_orani: sayiOku($('oYag')), not: $('oNot').value.trim() };
    if (v.olcumDuzelt != null) Object.assign(dn.olcumler[v.olcumDuzelt], k);
    else dn.olcumler.push(Object.assign({ hafta: dn.olcumler.length ? dn.olcumler[dn.olcumler.length - 1].hafta + 1 : 1 }, k));
    dn.olcumler.sort((a, b) => a.tarih.localeCompare(b.tarih));
    dn.kilo = dn.olcumler[dn.olcumler.length - 1].kilo;
    PA.kaydet(); DD.kapat($('olcumPanel'));
    DD.toast(v.olcumDuzelt != null ? 'Ölçüm düzeltildi.' : 'Ölçüm eklendi.');
    basCiz(); olcumCiz(); ozetCiz();
  });

  /* ── Kan tahlilleri ─────────────────────────────────────────────── */
  const refDisi = (d) => (d.ref_alt != null && d.sonuc < d.ref_alt ? 'dusuk' : d.ref_ust != null && d.sonuc > d.ref_ust ? 'yuksek' : null);
  function tahlilCiz() {
    if (!dn.izinler.tahlil) { $('p-tahlil').innerHTML = kilit('tahlil'); return; }
    const l = [...dn.tahliller].sort((a, b) => b.tarih.localeCompare(a.tarih));
    const dugmeler = `<div class="eylem-satiri"><button class="dugme hayalet kucuk" type="button" data-is="tahlil-iste">Tahlil iste</button><button class="dugme hayalet kucuk" type="button" data-is="tahlil-yukle"><i class="fa-solid fa-upload" aria-hidden="true"></i> Tahlil yükle</button></div><input type="file" id="tahlilDosya" accept=".pdf,image/*" hidden aria-hidden="true" tabindex="-1">`;
    if (!l.length) { $('p-tahlil').innerHTML = `<div class="kart panel">${kartBas('fa-vial', 'Kan tahlilleri', dugmeler)}<div class="kart-govde">${bos('fa-vial', `${h(ilgi)} tahlili yok`, 'Danışan yüklediğinde ya da sen eklediğinde burada görünür.')}</div></div>`; return; }
    const t = l.find((x) => x.dosya_adi === v.tahlil) || l[0];
    v.tahlil = t.dosya_adi;
    const onceki = l[l.indexOf(t) + 1];
    const satir = (d) => {
      const r = refDisi(d), e = onceki && onceki.degerler.find((x) => x.ad === d.ad);
      const ref = d.ref_alt != null || d.ref_ust != null ? `${d.ref_alt ?? '—'} – ${d.ref_ust ?? '—'}` : '—';
      return `<tr${r ? ' class="referans-disi"' : ''}><td data-etiket="Parametre"><b>${h(d.ad)}</b></td><td class="num" data-etiket="Sonuç"><span>${r ? `<span class="deger-yon"><i class="fa-solid fa-arrow-${r === 'dusuk' ? 'down' : 'up'}" aria-hidden="true"></i> ${PA.sayi(d.sonuc, 2)}</span>` : PA.sayi(d.sonuc, 2)} ${h(d.birim || '')}</span></td><td class="num" data-etiket="Referans">${ref}</td><td class="num" data-etiket="Önceki">${e ? PA.sayi(e.sonuc, 2) : '—'}</td><td data-etiket="Durum">${r ? PA.hap(r === 'dusuk' ? 'Düşük' : 'Yüksek', 'bekleyen') : PA.hap('Normal', 'cozulen')}</td></tr>`;
    };
    const disi = t.degerler.filter(refDisi).length;
    $('p-tahlil').innerHTML = `<div class="yigin"><div class="kart panel">${kartBas('fa-table-list', PA.tarih(t.tarih) + ' sonuçları', `<button class="dugme hayalet kucuk" type="button" data-is="deger-ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i> Değer ekle</button>`, t.degerler.length ? t.degerler.length + ' değer, ' + disi + ' tanesi referans dışında' : h(t.dosya_adi))}<div class="kart-govde bosluksuz">${t.degerler.length ? `<div class="tablo-kap gomulu"><table class="tablo panel sabit-sutun etiketli-yigin"><caption class="yalniz-okuyucu">Tahlil değerleri</caption><thead><tr><th scope="col" data-oran="30">Parametre</th><th class="num" scope="col" data-oran="22">Sonuç</th><th class="num" scope="col" data-oran="18">Referans</th><th class="num" scope="col" data-oran="14">Önceki</th><th scope="col" data-oran="16">Durum</th></tr></thead><tbody>${t.degerler.map(satir).join('')}</tbody></table></div>` : `<div class="kart-govde">${bos('fa-keyboard', 'Değer girilmedi', 'Dosya listede. Değerleri elle ekleyerek tabloya işleyebilirsin.')}</div>`}</div></div>
<div class="kart panel">${kartBas('fa-file-medical', 'Yüklenen tahliller', dugmeler)}<div class="kart-govde"><div class="ayar-liste">${l.map((x) => `<button class="ayar-satir" type="button" data-tahlil="${h(x.dosya_adi)}"><span class="as-ikon"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i></span><span class="as-metin"><b>${PA.tarih(x.tarih)}</b><span>${h(x.dosya_adi)}</span></span>${x === t ? '<span class="rozet olumlu">Açık</span>' : '<i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i>'}</button>`).join('')}</div></div></div></div>`;
    PA.oranTablo($('p-tahlil'));
  }
  $('degerPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$('vAd').value.trim() || $('vSonuc').value === '') { PA.formGecerli(e.target); return; }
    const t = dn.tahliller.find((x) => x.dosya_adi === v.tahlil);
    t.degerler.push({ ad: $('vAd').value.trim(), sonuc: Number($('vSonuc').value), birim: $('vBirim').value.trim(), ref_alt: sayiOku($('vAlt')), ref_ust: sayiOku($('vUst')) });
    PA.kaydet(); e.target.reset(); DD.kapat($('degerPanel')); DD.toast('Değer eklendi.'); tahlilCiz();
  });

  /* ── Anamnez ve notlar ──────────────────────────────────────────── */
  function notSirali() { return [...dn.klinik_notlar].sort((a, b) => (b.sabit ? 1 : 0) - (a.sabit ? 1 : 0) || b.tarih.localeCompare(a.tarih)); }
  function notCiz() {
    const a = dn.anamnez;
    const hs = dn.hassasiyetler.concat(dn.kronik);
    const anamnez = !dn.izinler.anamnez ? kilit('anamnez')
      : a ? `<div class="kart panel">${kartBas('fa-notes-medical', 'Anamnez', '<button class="dugme hayalet kucuk" type="button" data-is="hassasiyet"><i class="fa-solid fa-plus" aria-hidden="true"></i> Alerji ekle</button>')}<div class="kart-govde">${kunye([['Meslek', h(a.meslek)], ['Şikâyet', h(a.sikayet)], ['Uyku', h(a.uyku)], ['Su', h(a.su)], ['Hareket', h(a.hareket)], ['İlaç ve takviye', a.ilaclar.length ? h(a.ilaclar.join(', ')) : 'Yok'], ['Aile öyküsü', h(a.aile_oykusu)], ['Alışkanlıklar', h(a.aliskanliklar)], ['Hassasiyet ve kronik durum', hs.length ? h(hs.join(', ')) : 'Yok']])}</div></div>`
        : `<div class="kart panel"><div class="kart-govde">${bos('fa-notes-medical', `${h(ilgi)} anamnezi boş`, 'İzin açık, danışan henüz formu doldurmadı.')}</div></div>`;
    const l = notSirali();
    $('p-not').innerHTML = `<div class="yigin">${anamnez}<div class="kart panel">${kartBas('fa-clock-rotate-left', 'Klinik notlar', '<button class="dugme hayalet kucuk" type="button" data-is="not-ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i> Not ekle</button>', l.length + ' not')}<div class="kart-govde">${l.length ? `<div class="zaman-cizelgesi">${l.map((n) => `<div class="zc-kalem gecti"><div class="zc-zaman">${PA.tarih(n.tarih)}</div><div class="zc-metin">${h(n.metin)}</div>${n.sabit || n.paylasildi ? `<div class="eylem-satiri">${n.sabit ? '<span class="rozet olumlu">Sabit</span>' : ''}${n.paylasildi ? '<span class="rozet pasif">Danışanla paylaşıldı</span>' : ''}</div>` : ''}</div>`).join('')}</div>` : bos('fa-note-sticky', `${h(ilgi)} klinik notu yok`, 'İlk görüşme notunu ekle.')}</div></div></div>`;
  }
  $('notPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!PA.formGecerli(e.target)) return;
    dn.klinik_notlar.push({ tarih: DD.bugun, metin: $('notMetin').value.trim(), paylasildi: $('notPaylas').checked, sabit: $('notSabit').checked });
    PA.kaydet(); e.target.reset(); DD.kapat($('notPanel')); DD.toast('Not kaydedildi.'); notCiz(); ozetCiz();
  });
  $('hassasiyetPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!PA.formGecerli(e.target)) return;
    dn.hassasiyetler.push($('hsMetin').value.trim());
    PA.kaydet(); e.target.reset(); DD.kapat($('hassasiyetPanel')); DD.toast('Hassasiyet eklendi.'); notCiz(); ozetCiz();
  });

  /* ── Plan geçmişi ───────────────────────────────────────────────── */
  const PLAN_DURUM = { gonderildi: ['Gönderildi', 'cozulen'], taslak: ['Taslak', 'acik'], arsiv: ['Arşiv', 'kapali'] };
  function planCiz() {
    const l = PA.d().planlar.filter((p) => p.danisan_id === id).sort((a, b) => b.tarih.localeCompare(a.tarih));
    const yeni = `<a class="dugme hayalet kucuk" href="${PA.yol.yeniPlan(id)}"><i class="fa-solid fa-plus" aria-hidden="true"></i> Yeni plan</a>`;
    $('p-plan').innerHTML = `<div class="kart panel">${kartBas('fa-clipboard-list', 'Plan geçmişi', yeni, l.length + ' plan')}<div class="kart-govde bosluksuz">${l.length ? `<div class="tablo-kap gomulu"><table class="tablo panel sabit-sutun tek-eylem etiketli-yigin"><caption class="yalniz-okuyucu">Plan geçmişi</caption><thead><tr><th scope="col" data-oran="40">Plan</th><th class="num" scope="col" data-oran="16">Hedef</th><th scope="col" data-oran="18">Tarih</th><th scope="col" data-oran="14">Durum</th><th class="eylem" scope="col">İşlem</th></tr></thead><tbody>${l.map((p) => { const [e, s] = PLAN_DURUM[p.durum] || [p.durum, 'kapali']; const ogun = p.gunler && p.gunler[0] ? Object.keys(p.gunler[0].ogunler).length : 0; return `<tr><td data-etiket="Plan"><a href="${PA.yol.plan(p.id)}"><b>${h(p.ad)}</b></a><small>${p.gunler ? p.gunler.length : 0} gün · ${ogun} öğün</small></td><td class="num" data-etiket="Hedef">${p.hedef_kcal} kcal</td><td data-etiket="Tarih">${PA.tarih(p.tarih)}</td><td data-etiket="Durum">${PA.hap(e, s)}</td><td class="eylem"><span class="satir-eylem"><a class="ikon-dugme" href="${PA.yol.plan(p.id)}" aria-label="${h(p.ad)} planını aç"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></span></td></tr>`; }).join('')}</tbody></table></div>` : `<div class="kart-govde">${bos('fa-clipboard', `${h(ilgi)} planı yok`, 'İlk planı oluşturduğunda burada görünür.', yeni)}</div>`}</div></div>`;
    PA.oranTablo($('p-plan'));
  }

  /* ── Mesajlar: sekme açılınca okunmuş sayılır ───────────────────── */
  let sohbetKurulu = false;
  const sohbetKur = () => PA.sohbet($('detaySohbet'), id, { kisayol: false, gonderildi: () => { basCiz(); ozetCiz(); } });
  function mesajAc() {
    if (sohbetKurulu) return;
    sohbetKurulu = true;
    $('p-mesaj').innerHTML = '<div class="sohbet-gomulu"><section class="sohbet-sutun alan" aria-label="Sohbet" id="detaySohbet"></section></div>';
    sohbetKur();
    basCiz();
  }

  /* ── Veri izinleri ──────────────────────────────────────────────── */
  function izinCiz() {
    const t = talepler();
    $('p-izin').innerHTML = `<div class="yigin"><div class="bilgi-notu"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><p>Veri paylaşımını danışan kendi hesabından yönetir. Kapalı türleri göremezsin, izin isteyebilirsin. <b>Her görüntüleme kayda geçer.</b></p></div>
<div class="kart panel">${kartBas('fa-key', 'Paylaşılan veri türleri')}<div class="kart-govde"><div class="ayar-liste">${Object.keys(IZIN).map((k) => { const [ad, ikon, acik] = IZIN[k], var_ = dn.izinler[k]; return `<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ${var_ ? ikon : 'fa-lock'}" aria-hidden="true"></i></span><span class="as-metin"><b>${ad}</b><span>${acik}</span></span><span class="as-eylem">${var_ ? PA.hap('İzin var', 'cozulen') : t[k] ? PA.hap('İstendi · ' + PA.tarih(t[k]), 'bekleyen') : PA.hap('İzin yok', 'kapali') + `<button class="dugme hayalet kucuk" type="button" data-izin-iste="${k}">İzin iste</button>`}</span></div>`; }).join('')}</div></div></div></div>`;
  }
  function izinIste(tur) {
    talepler()[tur] = DD.bugun;
    PA.mesajYaz(id, IZIN[tur][0] + ' verinizi görebilmem için paylaşım izni vermenizi rica ederim. İzni hesabınızdaki veri izinlerinden açabilirsiniz.');
    PA.kaydet();
    DD.toast(dn.ad + ' için izin isteği gönderildi.');
    izinCiz();
    const s = IZIN[tur][3];
    if (s === 'olcum') olcumCiz(); else if (s === 'tahlil') tahlilCiz(); else if (s === 'not') notCiz();
  }

  /* ── Olaylar ────────────────────────────────────────────────────── */
  function hedefAc() {
    $('hTur').value = dn.hedef_turu || 'Kilo dengesi';
    $('hBaslangic').value = dn.olcumler[0] ? dn.olcumler[0].kilo : dn.kilo;
    $('hKilo').value = dn.hedef_kilo;
    $('hAralik').value = dn.kontrol_araligi || 14;
    DD.ac('#hedefPanel');
  }
  $('hedefPanelForm').addEventListener('submit', (e) => {
    e.preventDefault();
    dn.hedef_turu = $('hTur').value;
    if ($('hKilo').value !== '') dn.hedef_kilo = Number($('hKilo').value);
    if ($('hBaslangic').value !== '' && dn.olcumler[0]) dn.olcumler[0].kilo = Number($('hBaslangic').value);
    dn.kontrol_araligi = Number($('hAralik').value) || 14;
    PA.kaydet(); DD.kapat($('hedefPanel')); DD.toast('Hedef güncellendi.');
    basCiz(); ozetCiz(); olcumCiz();
  });
  const sekmeAc = (s) => { const t = $('t-' + s); if (t) { t.click(); t.scrollIntoView({ block: 'nearest', inline: 'center' }); } };
  $('mesajGit').addEventListener('click', () => { sekmeAc('mesaj'); });
  $('detaySekme').addEventListener('click', (e) => {
    const t = e.target.closest('.sekme');
    if (!t) return;
    const s = t.id.slice(2), u = new URL(location.href);
    if (s === 'ozet') u.searchParams.delete('sekme'); else u.searchParams.set('sekme', s);
    history.replaceState(null, '', u);
    if (s === 'mesaj') mesajAc();
  });
  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-randevu]');
    if (r) { PA.randevuDetay(r.dataset.randevu); return; }
    const iz = e.target.closest('[data-izin-iste]');
    if (iz) { izinIste(iz.dataset.izinIste); return; }
    const o = e.target.closest('[data-olcum]');
    if (o) { olcumAc(+o.dataset.olcum); return; }
    const th = e.target.closest('[data-tahlil]');
    if (th) { v.tahlil = th.dataset.tahlil; tahlilCiz(); return; }
    const sg = e.target.closest('[data-sekme-git]');
    if (sg) { sekmeAc(sg.dataset.sekmeGit); return; }
    const b = e.target.closest('[data-is]');
    if (!b) return;
    const is = b.dataset.is;
    if (is === 'olcum-ekle') olcumAc(null);
    else if (is === 'hedef') hedefAc();
    else if (is === 'yanitla') sekmeAc('mesaj');
    else if (is === 'yanitlandi') { PA.yanitlandi(id); PA.kaydet(); basCiz(); ozetCiz(); DD.toast('Danışan aktif listesine alındı.'); }
    else if (is === 'deger-ekle') DD.ac('#degerPanel');
    else if (is === 'not-ekle') DD.ac('#notPanel');
    else if (is === 'hassasiyet') DD.ac('#hassasiyetPanel');
    else if (is === 'tahlil-yukle') $('tahlilDosya').click();
    else if (is === 'tahlil-iste') { PA.mesajYaz(id, 'Güncel kan tahlilinizi hesabınıza yükleyebilir misiniz? Görüşmede birlikte değerlendirelim.'); PA.kaydet(); DD.toast('Tahlil isteği mesaj olarak gönderildi.'); }
    else if (is === 'baslat') { dn.durum = 'aktif'; PA.kaydet(); basCiz(); ozetCiz(); DD.toast('Takip yeniden başladı.'); }
    else if (is === 'bitir') window.DM_ONAY('Takip bitirilsin mi?', dn.ad + ' Bitti sekmesine geçer. Geçmiş kayıtlar silinmez.', 'Takibi bitir', (ok) => { if (!ok) return; dn.durum = 'bitti'; PA.kaydet(); basCiz(); ozetCiz(); DD.toast('Takip bitirildi.'); });
  });
  document.addEventListener('change', (e) => {
    if (e.target.id !== 'tahlilDosya' || !e.target.files[0]) return;
    const f = e.target.files[0];
    dn.tahliller.push({ tarih: DD.bugun, dosya_adi: f.name, degerler: [], yukleyen: 'diyetisyen' });
    v.tahlil = f.name;
    PA.kaydet(); DD.toast('Dosya eklendi. Prototipte yalnız adı kaydedilir.'); tahlilCiz();
  });
  document.addEventListener('pa:degisti', () => { basCiz(); ozetCiz(); if (sohbetKurulu) sohbetKur(); });

  /* Sabit sütunlu tabloların yüzde genişlikleri: basıldıktan sonra uygulanır */
  PA.oranTablo = PA.oranlar;
  basCiz(); ozetCiz(); olcumCiz(); tahlilCiz(); notCiz(); planCiz(); izinCiz();
  PA.sekmeSabitle($('detaySekme'));
  const ilkSekme = PA.parametre('sekme');
  if (ilkSekme) sekmeAc(ilkSekme);
})();
