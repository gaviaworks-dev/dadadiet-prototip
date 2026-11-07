/* Danışanlarım: sekme, süzgeç, tablo/kart, toplu işlem.
   Sekme, arama ve süzgeçler tek süzme fonksiyonundan geçer; kitin satır gizlemesi burada ezilir. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const $ = (id) => document.getElementById(id);
  const v = { sekme: 'tumu', gorunum: 'tablo', kolon: {}, sayfa: Math.max(1, Number(PA.parametre('sayfa')) || 1), boyut: 8 };
  const BOYUTLAR = [8, 12, 24];
  const SEKME_SUZ = { tumu: () => true, talep: (x) => x.durum === 'talep', aktif: (x) => x.durum === 'aktif', yanit: (x) => x.durum === 'yanit-bekliyor', bitti: (x) => ['bitti', 'reddedildi'].includes(x.durum) };
  const ARA_YER = { tumu: 'Ad, e-posta ya da hedef ara', talep: 'Talep eden kişiyi ara', aktif: 'Aktif danışan ara', yanit: 'Yanıt bekleyen danışan ara', bitti: 'Biten danışan ara' };

  const eposta = PA.eposta;
  /* Davetler kart açılana kadar ayrı tutulur; listede aynı satır biçiminde görünür */
  const kayitlar = () => PA.danisanlar().concat(PA.davetler().map((x) => Object.assign({ davet: true, durum: 'davet', izinler: {}, olcumler: [], son_gorusme: null }, x)));
  const suzgecDeger = (id) => { const t = document.querySelector('[aria-controls="' + id + '"]'); const d = t && t.getAttribute('data-deger'); return d && d !== 'hepsi' ? d : ''; };
  const paketAdi = (x) => { const p = PA.paket(x.paket_id); return p ? p.ad : ''; };
  const takipAdi = (x) => (x.davet || !PA.takipte(x) ? '' : PA.takip(x));

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
    const ac = `<a class="ikon-dugme" href="${PA.yol.danisan(x.id)}" aria-label="${h(x.ad)} kartını aç"><i class="fa-solid fa-eye" aria-hidden="true"></i></a>`;
    if (x.durum === 'talep') return `<button class="ikon-dugme" type="button" data-adim="talep-kabul" data-danisan="${x.id}" aria-label="${h(x.ad)} talebini kabul et"><i class="fa-solid fa-check" aria-hidden="true"></i></button><button class="ikon-dugme yikici" type="button" data-adim="talep-red" data-danisan="${x.id}" aria-label="${h(x.ad)} talebini reddet"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>` + ac;
    const mesaj = `<a class="ikon-dugme" href="${PA.yol.sohbet(x.id)}" aria-label="${h(x.ad)} ile mesajlaş"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></a>`;
    const randevu = PA.takipte(x) ? `<button class="ikon-dugme" type="button" data-randevu-ac data-danisan="${x.id}" aria-label="${h(x.ad)} için randevu oluştur"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i></button>` : '';
    return ac + mesaj + randevu;
  }
  /* Sıradaki adım: üst satır bağ, alt satır nedeni. Bekleme durumunda bağ yok */
  function adimHucre(x) {
    if (x.davet) return '<b>Davet gönderildi</b><small>Kabul bekleniyor</small>';
    const a = PA.siradaki(x);
    const ust = a.etiket && a.oncelik !== 1 ? PA.adimEylem(a, x, 'adim-bag', a.baslik) : `<b>${h(a.baslik)}</b>`;
    return `${ust}<small class="adim-neden">${h(a.metin)}</small>`;
  }
  const kisi = (x) => {
    const ic = `${PA.avatar(x.ad)}<span class="kisi-bilgi"><span class="kisi-ad">${h(x.ad)}${x.yeni ? ' <span class="rozet olumlu">Yeni</span>' : ''}</span><span class="kisi-alt">${h(eposta(x))}</span></span>`;
    return x.davet ? `<span class="kisi-hucre">${ic}</span>` : `<a class="kisi-hucre" href="${PA.yol.danisan(x.id)}">${ic}</a>`;
  };
  const sonGorusme = (x) => (x.son_gorusme ? `<b>${PA.tarih(x.son_gorusme)}</b><small>${PA.gunFarki(x.son_gorusme, DD.bugun)} gün önce</small>` : '<b>—</b><small>Henüz yok</small>');

  /* Sıralama tüm süzülmüş liste üstünde yapılır: sayfalar arası sıra kopmaz */
  const SIRA_ANAHTAR = { Danışan: (x) => x.ad, Durum: (x) => (PA.durumlar[x.durum] || [x.durum])[0], 'Son görüşme': (x) => x.son_gorusme || '' };
  function sirala(l) {
    const th = document.querySelector('#tabloKap th[aria-sort]');
    const anahtar = th && SIRA_ANAHTAR[th.textContent.trim()];
    if (!anahtar) return l;
    const yon = th.getAttribute('aria-sort') === 'ascending' ? 1 : -1;
    return [...l].sort((a, b) => anahtar(a).localeCompare(anahtar(b), 'tr') * yon);
  }
  /* Uzun listede uçlar ve etkin sayfanın komşuları kalır, aradakiler üç noktaya iner */
  function sayfaNolari(toplam, aktif) {
    const n = [...new Set([1, aktif - 1, aktif, aktif + 1, toplam])].filter((x) => x >= 1 && x <= toplam).sort((a, b) => a - b);
    return n.flatMap((x, i) => (i && x - n[i - 1] > 1 ? ['…', x] : [x]));
  }
  function sayfalamaCiz(toplam, ilk, son) {
    const kap = $('danisanSayfa'), sayfaSay = Math.ceil(toplam / v.boyut);
    kap.hidden = toplam <= BOYUTLAR[0];
    if (kap.hidden) return;
    const ok = (yon, ikon, ad, kapali) => `<button class="sayfa-dugme sade ok" type="button" data-sayfa="${yon}" aria-label="${ad}"${kapali ? ' disabled' : ''}><i class="fa-solid ${ikon}" aria-hidden="true"></i></button>`;
    $('sayfaBilgi').innerHTML = `<b>${toplam}</b> danışandan <b>${ilk}–${son}</b> arası`;
    $('sayfaDugmeler').innerHTML = ok(v.sayfa - 1, 'fa-chevron-left', 'Önceki sayfa', v.sayfa === 1) +
      sayfaNolari(sayfaSay, v.sayfa).map((n) => (n === '…' ? '<span class="sayfa-nokta" aria-hidden="true">…</span>' : `<button class="sayfa-dugme sade${n === v.sayfa ? ' aktif' : ''}" type="button" data-sayfa="${n}" aria-label="Sayfa ${n}"${n === v.sayfa ? ' aria-current="page"' : ''}>${n}</button>`)).join('') +
      ok(v.sayfa + 1, 'fa-chevron-right', 'Sonraki sayfa', v.sayfa === sayfaSay);
  }
  function sayfaGit(n) {
    v.sayfa = n;
    const u = new URL(location.href);
    if (n === 1) u.searchParams.delete('sayfa'); else u.searchParams.set('sayfa', n);
    history.replaceState(null, '', u);
    ciz();
    const ust = $('liste').getBoundingClientRect().top;
    if (ust < 0) window.scrollBy({ top: ust - 80, behavior: 'smooth' });
  }
  /* Süzgeç, arama ya da sekme değişince liste ilk sayfadan başlar */
  const basaDon = () => { if (v.sayfa !== 1) sayfaGit(1); else ciz(); };

  function ciz() {
    const tum = sirala(suzulmus()), hepsi = kayitlar();
    v.sayfa = Math.min(v.sayfa, Math.max(1, Math.ceil(tum.length / v.boyut)));
    const ilk = (v.sayfa - 1) * v.boyut, l = tum.slice(ilk, ilk + v.boyut);
    const sayilar = { tumu: hepsi.length, talep: hepsi.filter(SEKME_SUZ.talep).length, aktif: hepsi.filter(SEKME_SUZ.aktif).length, yanit: hepsi.filter(SEKME_SUZ.yanit).length, bitti: hepsi.filter(SEKME_SUZ.bitti).length };
    Object.keys(sayilar).forEach((k) => { document.querySelector('[data-sayi="' + k + '"]').textContent = sayilar[k]; });
    $('gorunenSayi').textContent = tum.length;
    $('toplamSayi').textContent = sayilar[v.sekme];
    $('baslikSayi').textContent = sayilar.tumu;
    $('ara').placeholder = ARA_YER[v.sekme];
    $('danisanTablo').innerHTML = l.map((x) => `<tr data-id="${x.id}"><td class="sec"><label><input type="checkbox" data-sec="" aria-label="${h(x.ad)} satırını seç"></label></td><td>${kisi(x)}</td><td data-etiket="Sıradaki Adım">${adimHucre(x)}</td>${v.kolon.hedef ? `<td data-etiket="Hedef">${ilerlemeHucre(x)}</td>` : ''}${v.kolon.paket ? `<td data-etiket="Paket">${h(paketAdi(x) || '—')}</td>` : ''}<td data-etiket="Durum">${PA.danisanHap(x)}</td><td data-etiket="Son görüşme">${sonGorusme(x)}</td><td class="eylem"><span class="satir-eylem">${islemler(x)}</span></td></tr>`).join('');
    $('danisanKartlar').innerHTML = l.map((x) => {
      const i = PA.ilerleme(x);
      return `<article class="kisi-kart"><div class="kisi-kart-bas">${kisi(x)}${PA.danisanHap(x)}</div><div>${adimHucre(x)}</div>${i ? PA.olcer(i.yuzde) + `<div class="kisi-kart-alt"><span>${PA.kgMetin(i.degisim)} · ${i.hafta}. hafta</span><span>%${i.yuzde}</span></div>` : ''}<div class="kisi-kart-alt"><span>${x.son_gorusme ? 'Son görüşme ' + PA.tarih(x.son_gorusme) : 'Görüşme yok'}</span><span class="satir-eylem">${islemler(x)}</span></div></article>`;
    }).join('');
    PA.oranlar($('liste'));
    const bos = !l.length;
    sayfalamaCiz(tum.length, ilk + 1, ilk + l.length);
    $('listeBos').hidden = !bos;
    $('tabloKap').hidden = bos || v.gorunum !== 'tablo';
    $('danisanKartlar').hidden = bos || v.gorunum !== 'kart';
    /* Kit tabloyu gizlemiş olabilir: boş durum dışında geri açılır */
    const tablo = $('danisanTablo').closest('table');
    if (tablo) tablo.hidden = false;
    if (window.DM_SECIM_TAZELE) window.DM_SECIM_TAZELE(tablo);
    if (bos || v.gorunum !== 'tablo') $('toplu').hidden = true;
    PA.sekmeSabitle($('danisanSekme'));
  }
  function sekmeSec(ad) {
    v.sekme = ad;
    const u = new URL(location.href);
    if (ad === 'tumu') u.searchParams.delete('sekme'); else u.searchParams.set('sekme', ad);
    history.replaceState(null, '', u);
    $('liste').setAttribute('aria-labelledby', 's-' + ad);
    basaDon();
  }
  const seciliIdler = () => [...document.querySelectorAll('#danisanTablo tr')].filter((tr) => tr.querySelector('input:checked')).map((tr) => tr.dataset.id);
  const seciliDanisanlar = () => seciliIdler().map(PA.danisan).filter(Boolean);
  const csvSatirlari = (l) => [['Ad soyad', 'E-posta', 'Hedef', 'Paket', 'Son görüşme', 'İlerleme', 'Durum']].concat(l.map((x) => { const i = x.davet ? null : PA.ilerleme(x); return [x.ad, eposta(x), x.hedef || '', paketAdi(x), x.son_gorusme ? PA.tarih(x.son_gorusme) : '', i ? '%' + i.yuzde : '', (PA.durumlar[x.durum] || [x.durum])[0]]; }));

  /* Paket süzgeci veriden kurulur */
  $('sPaket').innerHTML = '<div class="acilir-bas">Paket</div><button class="cip suzgec aktif" type="button" aria-pressed="true" data-deger="hepsi">Tümü</button>' + PA.d().paketler.map((p) => `<button class="cip suzgec" type="button" aria-pressed="false" data-deger="${h(p.ad)}">${h(p.ad)}</button>`).join('');
  $('dePaket').innerHTML = PA.d().paketler.filter((p) => p.aktif).map((p) => `<option value="${p.id}">${h(p.ad)}</option>`).join('');

  /* Kit süzgeç çubuğundaki label'ları ekran okuyucuya indirir; kolon seçimi bu yüzden düğmedir */
  /* Ek kolon tek seçimlidir: dört veri kolonuna en çok biri eklenir, tablo sıkışmaz */
  const kolonlar = [...document.querySelectorAll('[data-kolon-sec]')];
  kolonlar.forEach((k) => k.addEventListener('click', () => {
    const acilacak = k.getAttribute('aria-pressed') !== 'true';
    kolonlar.forEach((x) => {
      const acik = x === k && acilacak, th = document.querySelector('[data-kolon-opsiyon="' + x.dataset.kolonSec + '"]');
      x.setAttribute('aria-pressed', String(acik));
      x.querySelector('i').className = acik ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
      v.kolon[x.dataset.kolonSec] = acik;
      th.hidden = !acik;
      th.classList.toggle('gizli', !acik); /* kit fazla kolonu gizli işaretler */
    });
    ciz();
  }));
  $('danisanSekme').addEventListener('click', (e) => { const t = e.target.closest('[data-sekme]'); if (t) sekmeSec(t.dataset.sekme); });
  $('danisanSekme').addEventListener('keydown', (e) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) setTimeout(() => sekmeSec(document.activeElement.dataset.sekme), 0); });
  $('ara').addEventListener('input', basaDon);
  $('sayfaBoyut').addEventListener('change', (e) => { v.boyut = Number(e.target.value); basaDon(); });
  $('danisanSayfa').addEventListener('click', (e) => { const b = e.target.closest('[data-sayfa]'); if (b && !b.disabled) sayfaGit(Number(b.dataset.sayfa)); });
  /* Kit başlığın durumunu değiştirdikten sonra liste baştan dizilir */
  document.querySelector('#tabloKap thead').addEventListener('click', (e) => { if (e.target.closest('th.sirali')) setTimeout(ciz, 0); });
  $('listeGorunum').addEventListener('dd:secim', (e) => { v.gorunum = e.detail.deger; ciz(); });
  document.addEventListener('click', (e) => {
    if (e.target.closest('.suzgec-cubuk .acilir-yuzey [data-deger]') || e.target.closest('[data-eylem="suzgec-temizle"]')) setTimeout(basaDon, 0);
    const rd = e.target.closest('[data-randevu]');
    if (rd) { PA.randevuDetay(rd.dataset.randevu); return; }
    const sil = e.target.closest('[data-davet-sil]');
    if (sil) {
      const l = PA.davetler(), i = l.findIndex((x) => x.id === sil.dataset.davetSil);
      window.DM_ONAY('Davet geri alınsın mı?', l[i].ad + ' için gönderilen davet iptal edilir.', 'Geri al', (ok) => {
        if (!ok) return;
        l.splice(i, 1); PA.kaydet(); ciz(); DD.toast('Davet geri alındı.');
      });
    }
  });
  $('disaAktar').addEventListener('click', () => { const l = sirala(suzulmus()); PA.csvIndir('danisanlar.csv', csvSatirlari(l)); DD.toast(l.length + ' danışan dışa aktarıldı.'); });
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
