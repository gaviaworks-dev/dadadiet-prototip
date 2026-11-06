/* Danışanlarım: sekme, süzgeç, tablo/kart, toplu işlem.
   Sekme, arama ve süzgeçler tek süzme fonksiyonundan geçer; kitin satır gizlemesi burada ezilir. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const $ = (id) => document.getElementById(id);
  const v = { sekme: 'tumu', gorunum: 'tablo' };
  const SEKME_SUZ = { tumu: () => true, aktif: (x) => x.durum === 'aktif', yanit: (x) => x.durum === 'yanit-bekliyor', bitti: (x) => x.durum === 'bitti' };
  const ARA_YER = { tumu: 'Ad, e-posta ya da hedef ara', aktif: 'Aktif danışan ara', yanit: 'Yanıt bekleyen danışan ara', bitti: 'Biten danışan ara' };

  const eposta = (x) => x.eposta || x.ad.toLocaleLowerCase('tr').replace(/\s+/g, '.').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c') + '@ornek.test';
  /* Davetler kart açılana kadar ayrı tutulur; listede aynı satır biçiminde görünür */
  const kayitlar = () => PA.danisanlar().concat(PA.davetler().map((x) => Object.assign({ davet: true, durum: 'davet', izinler: {}, olcumler: [], son_gorusme: null }, x)));
  const suzgecDeger = (id) => { const t = document.querySelector('[aria-controls="' + id + '"]'); const d = t && t.getAttribute('data-deger'); return d && d !== 'hepsi' ? d : ''; };
  const paketAdi = (x) => { const p = PA.paket(x.paket_id); return p ? p.ad : ''; };
  const takipAdi = (x) => (x.davet ? '' : PA.takip(x));

  function suzulmus() {
    const q = $('ara').value.trim().toLocaleLowerCase('tr');
    const paket = suzgecDeger('sPaket'), takip = suzgecDeger('sTakip');
    return kayitlar().filter((x) => {
      if (x.davet ? v.sekme !== 'tumu' : !SEKME_SUZ[v.sekme](x)) return false;
      if (q && !(x.ad + ' ' + eposta(x) + ' ' + (x.hedef || '')).toLocaleLowerCase('tr').includes(q)) return false;
      if (paket && paketAdi(x) !== paket) return false;
      if (takip && takipAdi(x) !== takip) return false;
      return true;
    });
  }
  function ilerlemeHucre(x) {
    if (x.davet) return `<span class="kisi-alt">${h(x.hedef || 'Hedef kabulden sonra netleşir')}</span>`;
    const i = PA.ilerleme(x);
    if (!i) return `<div class="tablo-ilerleme"><b>${h(x.hedef)}</b><small><i class="fa-solid fa-lock" aria-hidden="true"></i> Ölçüm izni yok</small></div>`;
    return `<div class="tablo-ilerleme"><b>${h(x.hedef)}</b><small>${PA.kgMetin(i.degisim)} · ${i.hafta}. hafta · %${i.yuzde}</small>${PA.olcer(i.yuzde)}</div>`;
  }
  function islemler(x) {
    if (x.davet) return `<button class="ikon-dugme yikici" type="button" data-davet-sil="${x.id}" aria-label="${h(x.ad)} davetini geri al"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;
    const mesaj = `<a class="ikon-dugme" href="${PA.yol.sohbet(x.id)}" aria-label="${h(x.ad)} ile mesajlaş"><i class="fa-solid fa-comment" aria-hidden="true"></i></a>`;
    const randevu = x.durum === 'bitti' ? '' : `<button class="ikon-dugme" type="button" data-randevu-ac data-danisan="${x.id}" aria-label="${h(x.ad)} için randevu oluştur"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i></button>`;
    const ac = `<a class="ikon-dugme" href="${PA.yol.danisan(x.id)}" aria-label="${h(x.ad)} kartını aç"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`;
    return mesaj + randevu + ac;
  }
  const kisi = (x) => {
    const ic = `${PA.avatar(x.ad)}<span class="kisi-bilgi"><span class="kisi-ad">${h(x.ad)}</span><span class="kisi-alt">${h(eposta(x))}</span></span>`;
    return x.davet ? `<span class="kisi-hucre">${ic}</span>` : `<a class="kisi-hucre" href="${PA.yol.danisan(x.id)}">${ic}</a>`;
  };
  const sonGorusme = (x) => (x.son_gorusme ? `<b>${PA.tarih(x.son_gorusme)}</b><small>${PA.gunFarki(x.son_gorusme, DD.bugun)} gün önce</small>` : '<b>—</b><small>Henüz yok</small>');
  const takipRozet = (x) => { const t = takipAdi(x); return t === 'Kontrol gecikti' ? '<small class="rozet bekleme">Kontrol gecikti</small>' : ''; };

  function ciz() {
    const l = suzulmus(), hepsi = kayitlar();
    const sayilar = { tumu: hepsi.length, aktif: hepsi.filter(SEKME_SUZ.aktif).length, yanit: hepsi.filter(SEKME_SUZ.yanit).length, bitti: hepsi.filter(SEKME_SUZ.bitti).length };
    Object.keys(sayilar).forEach((k) => { document.querySelector('[data-sayi="' + k + '"]').textContent = sayilar[k]; });
    $('gorunenSayi').textContent = l.length;
    $('toplamSayi').textContent = sayilar[v.sekme];
    $('ara').placeholder = ARA_YER[v.sekme];
    $('danisanTablo').innerHTML = l.map((x) => `<tr data-id="${x.id}"><td class="sec"><label><input type="checkbox" data-sec="" aria-label="${h(x.ad)} satırını seç"></label></td><td>${kisi(x)}</td><td data-etiket="Hedef ve ilerleme">${ilerlemeHucre(x)}</td><td data-etiket="Son görüşme">${sonGorusme(x)}</td><td data-etiket="Durum">${PA.danisanHap(x)}${takipRozet(x)}</td><td class="eylem"><span class="satir-eylem">${islemler(x)}</span></td></tr>`).join('');
    $('danisanKartlar').innerHTML = l.map((x) => {
      const i = PA.ilerleme(x);
      return `<article class="kisi-kart"><div class="kisi-kart-bas">${kisi(x)}${PA.danisanHap(x)}</div>${x.hedef ? `<span class="kisi-alt">${h(x.hedef)}</span>` : ''}${i ? PA.olcer(i.yuzde) + `<div class="kisi-kart-alt"><span>${PA.kgMetin(i.degisim)} · ${i.hafta}. hafta</span><span>%${i.yuzde}</span></div>` : ''}<div class="kisi-kart-alt"><span>${x.son_gorusme ? 'Son görüşme ' + PA.tarih(x.son_gorusme) : 'Görüşme yok'}</span><span class="satir-eylem">${islemler(x)}</span></div></article>`;
    }).join('');
    PA.oranlar($('liste'));
    const bos = !l.length;
    $('listeBos').hidden = !bos;
    $('tabloKap').hidden = bos || v.gorunum !== 'tablo';
    $('danisanKartlar').hidden = bos || v.gorunum !== 'kart';
    /* Kit tabloyu gizlemiş olabilir: boş durum dışında geri açılır */
    const tablo = $('danisanTablo').closest('table');
    if (tablo) tablo.hidden = false;
    const secili = document.querySelector('th[aria-sort]');
    if (secili) siralamayiKoru(secili);
    if (window.DM_SECIM_TAZELE) window.DM_SECIM_TAZELE(tablo);
    if (bos || v.gorunum !== 'tablo') $('toplu').hidden = true;
    PA.sekmeSabitle($('danisanSekme'));
  }
  function siralamayiKoru(th) {
    const i = [...th.parentElement.children].indexOf(th), yon = th.getAttribute('aria-sort') === 'ascending' ? 1 : -1;
    const g = $('danisanTablo');
    [...g.rows].sort((a, b) => a.children[i].textContent.trim().localeCompare(b.children[i].textContent.trim(), 'tr', { numeric: true }) * yon).forEach((tr) => g.appendChild(tr));
  }
  function sekmeSec(ad) {
    v.sekme = ad;
    const u = new URL(location.href);
    if (ad === 'tumu') u.searchParams.delete('sekme'); else u.searchParams.set('sekme', ad);
    history.replaceState(null, '', u);
    $('liste').setAttribute('aria-labelledby', 's-' + ad);
    ciz();
  }
  const seciliIdler = () => [...document.querySelectorAll('#danisanTablo tr')].filter((tr) => tr.querySelector('input:checked')).map((tr) => tr.dataset.id);
  const seciliDanisanlar = () => seciliIdler().map(PA.danisan).filter(Boolean);
  const csvSatirlari = (l) => [['Ad soyad', 'E-posta', 'Hedef', 'Paket', 'Son görüşme', 'İlerleme', 'Durum']].concat(l.map((x) => { const i = x.davet ? null : PA.ilerleme(x); return [x.ad, eposta(x), x.hedef || '', paketAdi(x), x.son_gorusme ? PA.tarih(x.son_gorusme) : '', i ? '%' + i.yuzde : '', (PA.durumlar[x.durum] || [x.durum])[0]]; }));

  /* Paket süzgeci veriden kurulur */
  $('sPaket').innerHTML = '<div class="acilir-bas">Paket</div><button class="cip suzgec aktif" type="button" aria-pressed="true" data-deger="hepsi">Tümü</button>' + PA.d().paketler.map((p) => `<button class="cip suzgec" type="button" aria-pressed="false" data-deger="${h(p.ad)}">${h(p.ad)}</button>`).join('');
  $('dePaket').innerHTML = PA.d().paketler.filter((p) => p.aktif).map((p) => `<option value="${p.id}">${h(p.ad)}</option>`).join('');

  $('danisanSekme').addEventListener('click', (e) => { const t = e.target.closest('[data-sekme]'); if (t) sekmeSec(t.dataset.sekme); });
  $('danisanSekme').addEventListener('keydown', (e) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) setTimeout(() => sekmeSec(document.activeElement.dataset.sekme), 0); });
  $('ara').addEventListener('input', ciz);
  $('listeGorunum').addEventListener('dd:secim', (e) => { v.gorunum = e.detail.deger; ciz(); });
  document.addEventListener('click', (e) => {
    if (e.target.closest('.suzgec-cubuk .acilir-yuzey [data-deger]') || e.target.closest('[data-eylem="suzgec-temizle"]')) setTimeout(ciz, 0);
    const sil = e.target.closest('[data-davet-sil]');
    if (sil) {
      const l = PA.davetler(), i = l.findIndex((x) => x.id === sil.dataset.davetSil);
      window.DM_ONAY('Davet geri alınsın mı?', l[i].ad + ' için gönderilen davet iptal edilir.', 'Geri al', (ok) => {
        if (!ok) return;
        l.splice(i, 1); PA.kaydet(); ciz(); DD.toast('Davet geri alındı.');
      });
    }
  });
  $('disaAktar').addEventListener('click', () => { const l = suzulmus(); PA.csvIndir('danisanlar.csv', csvSatirlari(l)); DD.toast(l.length + ' danışan dışa aktarıldı.'); });
  $('topluAktar').addEventListener('click', () => { const l = seciliIdler().map((id) => kayitlar().find((x) => x.id === id)); PA.csvIndir('secili-danisanlar.csv', csvSatirlari(l)); DD.toast(l.length + ' danışan dışa aktarıldı.'); });
  $('topluMesaj').addEventListener('click', () => {
    const l = seciliDanisanlar();
    if (!l.length) { DD.toast('Seçilenlerde mesaj gönderilebilecek danışan yok.', 'uyari'); return; }
    $('tmKime').textContent = l.map((x) => x.ad).join(', ');
    $('tmMetin').value = '';
    DD.ac('#topluMesajPanel');
  });
  $('topluMesajForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!PA.formGecerli(e.target)) return;
    const l = seciliDanisanlar(), metin = $('tmMetin').value.trim();
    l.forEach((x) => { PA.mesajYaz(x.id, metin); PA.yanitlandi(x.id); });
    PA.kaydet(); DD.kapat($('topluMesajPanel')); ciz();
    DD.toast(l.length + ' danışana mesaj gönderildi.');
  });
  $('topluHatirlat').addEventListener('click', () => {
    const l = seciliDanisanlar();
    if (!l.length) { DD.toast('Seçilenlerde hatırlatma gidecek danışan yok.', 'uyari'); return; }
    l.forEach((x) => PA.mesajYaz(x.id, 'Merhaba, kontrol zamanınız geldi. Size uygun bir saatte görüşelim.'));
    PA.kaydet(); ciz();
    DD.toast(l.length + ' danışana kontrol hatırlatması gönderildi.');
  });
  $('danisanEkleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!PA.formGecerli(e.target)) return;
    const ad = $('deAd').value.trim();
    PA.davetler().push({ id: 'davet' + Date.now(), ad, eposta: $('deEposta').value.trim(), paket_id: $('dePaket').value, hedef: $('deHedef').value.trim() });
    PA.kaydet(); e.target.reset(); DD.kapat($('danisanEkle'));
    sekmeSecDisaridan('tumu');
    DD.toast(ad + ' için davet gönderildi.');
  });
  function sekmeSecDisaridan(ad) { const t = $('s-' + ad); if (t) t.click(); }
  document.addEventListener('pa:degisti', ciz);

  const ilk = PA.parametre('sekme');
  if (ilk && SEKME_SUZ[ilk]) sekmeSecDisaridan(ilk); else ciz();
})();
