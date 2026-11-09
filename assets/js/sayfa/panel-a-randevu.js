/* Randevu oluşturma, yeniden planlama ve detay drawer'ları.
   Takvim, genel bakış, danışan kartı ve mesajlar aynı yüzeyi açar. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const kapatDugme = '<button class="ikon-dugme" type="button" aria-label="Kapat" data-kapat><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>';
  document.body.insertAdjacentHTML('beforeend', `
<div class="yan-panel-ortu" id="randevuPanel" hidden><aside class="yan-panel" role="dialog" aria-modal="true" aria-labelledby="rpBaslik">
  <div class="yan-panel-bas"><h2 id="rpBaslik">Randevu Oluştur</h2>${kapatDugme}</div>
  <form class="yan-panel-govde" id="rpForm" novalidate>
    <div class="alan" id="rpKipAlan"><div class="segment" id="rpKip" role="group" aria-label="İşlem türü"><button type="button" data-deger="randevu" aria-pressed="true">Randevu</button><button type="button" data-deger="blok" aria-pressed="false">Saat kapat</button><button type="button" data-deger="seans" aria-pressed="false">Açık seans</button></div></div>
    <div class="bilgi-notu" data-kip="seans" hidden><i class="fa-solid fa-circle-info" aria-hidden="true"></i><p>Müsaitlik dışındaki bir gün ya da saati yalnız bir kez randevuya açar. Danışanlar bu saati randevu ekranında görür; haftalık düzenin değişmez.</p></div>
    <div class="alan oneri-kap" data-kip="randevu"><label class="alan-etiket" for="rpDanisan">Danışan <span class="zorunlu" aria-hidden="true">*</span></label><input class="alan-girdi" id="rpDanisan" type="text" autocomplete="off" placeholder="Ad yaz ya da listeden seç"><div class="oneri-liste" id="rpOneri" role="group" aria-label="Danışan önerileri" hidden></div></div>
    <div class="alan" data-kip="randevu"><label class="alan-etiket" for="rpPaket">Paket</label><select class="alan-secim" id="rpPaket"></select><p class="alan-yardim" id="rpPaketNot"></p></div>
    <div class="alan-izgara c2">
      <div class="alan" data-kip="randevu seans"><span class="alan-etiket" id="rpTurE">Görüşme biçimi</span><div class="segment" id="rpTur" role="group" aria-labelledby="rpTurE"><button type="button" data-deger="online" aria-pressed="true">Online</button><button type="button" data-deger="yüz yüze" aria-pressed="false">Yüz yüze</button></div></div>
      <div class="alan"><label class="alan-etiket" for="rpSure">Süre</label><select class="alan-secim" id="rpSure"></select></div>
    </div>
    <div class="alan"><span class="alan-etiket">Tarih <span class="zorunlu" aria-hidden="true">*</span></span><div class="ay-secim" id="rpGunler"></div></div>
    <div class="alan"><span class="alan-etiket" id="rpSaatE">Saat <span class="zorunlu" aria-hidden="true">*</span></span><div class="saat-cipleri" id="rpSaatler" role="group" aria-labelledby="rpSaatE"></div><p class="alan-yardim" id="rpSaatNot"></p></div>
    <div class="alan" data-kip="blok" hidden><label class="alan-etiket" for="rpNeden">Neden <span class="istege-bagli">(isteğe bağlı)</span></label><input class="alan-girdi" id="rpNeden" type="text" autocomplete="off" placeholder="Klinik toplantısı"></div>
    <div class="alan" data-kip="randevu"><label class="alan-etiket" for="rpNot">Özel not <span class="istege-bagli">(isteğe bağlı)</span></label><textarea class="alan-metin" id="rpNot" rows="3"></textarea><p class="alan-yardim"><i class="fa-solid fa-eye-slash" aria-hidden="true"></i><span>Yalnız sen görürsün, danışan görmez.</span></p></div>
    <div class="alan" data-kip="yeni"${PA.bayrakOz('takvim-haftalik-tekrar')}><label class="onay-kutusu"><input type="checkbox" id="rpTekrar"><span>Haftalık tekrarla</span></label><select class="alan-secim" id="rpHafta" aria-label="Kaç hafta tekrarlansın" hidden><option value="2">2 hafta</option><option value="3">3 hafta</option><option value="4" selected>4 hafta</option><option value="8">8 hafta</option></select></div>
    <div class="alan" data-kip="seans" hidden><span class="alan-etiket">Açtığın seanslar</span><div class="ayar-liste" id="rpEkListe"></div></div>
    <div class="ayar-liste" data-kip="randevu"><label class="ayar-satir"><span class="as-metin"><b>Danışana mesajla bildir</b><span>Tarih ve saat sohbete düşer.</span></span><span class="as-eylem"><span class="anahtar"><input type="checkbox" id="rpBildir" checked aria-label="Danışana mesajla bildir"><span class="anahtar-ray"></span></span></span></label></div>
  </form>
  <div class="yan-panel-ozet" id="rpOzet" aria-live="polite"></div>
  <div class="yan-panel-ayak"><button class="dugme hayalet" type="button" data-kapat>Vazgeç</button><button class="dugme birincil" type="submit" form="rpForm" id="rpGonder">Randevuyu oluştur</button></div>
</aside></div>
<div class="yan-panel-ortu" id="randevuDetay" hidden><aside class="yan-panel" role="dialog" aria-modal="true" aria-labelledby="rdBaslik">
  <div class="yan-panel-bas"><h2 id="rdBaslik">Randevu Detayı</h2>${kapatDugme}</div>
  <div class="yan-panel-govde" id="rdGovde"></div>
  <div class="yan-panel-ayak yayilan" id="rdAyak"></div>
</aside></div>`);

  const $ = (id) => document.getElementById(id);
  const form = $('rpForm');
  let s = {}; /* açık form durumu: danisan, paket, tur, tarih, saat, sure, haric, sayfaBas */

  const secilebilir = () => PA.danisanlar().filter(PA.takipte);
  const sureOf = () => s.sure;
  const varsayilanSure = () => PA.d().musaitlik.slot[s.tur] || 30;
  function paketDoldur() {
    $('rpPaket').innerHTML = PA.d().paketler.filter((p) => p.aktif).map((p) => `<option value="${p.id}">${h(p.ad)} · ${p.seans} seans</option>`).join('');
  }
  function sureDoldur() {
    const l = s.kip === 'blok' ? [30, 60, 90, 120, 180] : s.kip === 'seans' ? [30, 45, 60, 90, 120] : [30, 45, 60];
    $('rpSure').innerHTML = l.map((n) => `<option value="${n}">${n} dk</option>`).join('');
    $('rpSure').value = String(s.sure);
  }
  function kipGoster() {
    const blok = s.kip === 'blok', seans = s.kip === 'seans', duzen = !!s.duzenlenen;
    $('rpBaslik').textContent = duzen ? 'Yeniden planla' : blok ? 'Saat kapat' : seans ? 'Açık Seans Ekle' : 'Randevu Oluştur';
    $('rpGonder').textContent = duzen ? 'Yeni saate al' : blok ? 'Saati kapat' : seans ? 'Seansı aç' : 'Randevuyu oluştur';
    $('rpKipAlan').hidden = duzen;
    form.querySelectorAll('[data-kip]').forEach((e) => { e.hidden = e.dataset.kip === 'yeni' ? blok || seans || duzen : !e.dataset.kip.split(' ').includes(s.kip); });
    if (seans) ekListeCiz();
    $('rpKip').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === s.kip)));
  }
  function turAyarla() {
    const p = s.kip === 'seans' ? null : PA.paket(s.paket);
    const sabit = p && p.tur !== 'karma' ? p.tur : null;
    if (sabit && s.tur !== sabit) { s.tur = sabit; s.sure = varsayilanSure(); }
    $('rpTur').querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.deger === s.tur));
      b.disabled = !!sabit && b.dataset.deger !== sabit;
    });
    sureDoldur();
    const dn = PA.danisan(s.danisan);
    const kalan = dn && p ? PA.kalanSeans(dn, p.id) : null;
    $('rpPaketNot').textContent = p ? (kalan != null ? kalan + ' seans hakkı kaldı' : p.seans + ' seanslık paket') : '';
  }
  /* Seçilebilir saatler: açık seans kipinde yalnız şu an randevuya kapalı ve boş saatler (07.00–22.00) */
  function adaylar(iso) {
    if (s.kip !== 'seans') return PA.gunSlotlari(iso, sureOf(), s.haric).filter((x) => x.uygun);
    const l = [];
    for (let m = 7 * 60; m + sureOf() <= 22 * 60; m += 30) {
      if (iso + 'T' + PA.saat(m) <= PA.simdi || PA.dolulukVar(iso, m, m + sureOf()) || PA.slotUygun(iso, m, sureOf())) continue;
      l.push({ saat: PA.saat(m), uygun: true });
    }
    return l;
  }
  function ekListeCiz() {
    const l = PA.ekSeanslar().filter((e) => e.tarih >= DD.bugun).sort((a, b) => (a.tarih + a.saat).localeCompare(b.tarih + b.saat));
    $('rpEkListe').innerHTML = l.length ? l.map((e) => `<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ${e.tur === 'online' ? 'fa-video' : 'fa-location-dot'}" aria-hidden="true"></i></span><span class="as-metin"><b>${h(PA.uzunTarih(e.tarih))} · ${DD.bicim.saat(e.saat)}</b><span>${e.sure} dk · ${e.tur === 'online' ? 'Online' : 'Yüz yüze'}</span></span><span class="as-eylem"><button class="ikon-dugme yikici" type="button" data-ek-sil="${e.id}" aria-label="${h(PA.tarih(e.tarih))} ${e.saat} açık seansını kaldır"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></span></div>`).join('') : '<p class="alan-yardim"><span>Henüz açık seans yok.</span></p>';
  }
  /* Ay görünümü: müsait gün dolgulu, öteki gün soluk; seçilen günün saatleri altında */
  function gunleriCiz() {
    const ay = s.ay, ayNo = ay.slice(0, 7), bas = PA.haftaBasi(ay);
    let hucre = '';
    for (let i = 0; i < 42; i++) {
      const iso = PA.ekle(bas, i);
      if (i % 7 === 0 && i && iso.slice(0, 7) !== ayNo) break;
      if (iso.slice(0, 7) !== ayNo) { hucre += '<span class="ay-gun bosluk" aria-hidden="true"></span>'; continue; }
      const n = iso < DD.bugun ? 0 : adaylar(iso).length;
      hucre += `<button class="ay-gun${n ? ' uygun' : ''}${iso === DD.bugun ? ' bugun' : ''}" type="button" data-tarih="${iso}" aria-pressed="${iso === s.tarih}" aria-label="${h(PA.uzunTarih(iso))}, ${n ? n + ' boş saat' : 'boş saat yok'}"${n ? '' : ' disabled'}>${+iso.slice(8)}</button>`;
    }
    $('rpGunler').innerHTML = `<div class="ay-bas"><button class="ikon-dugme" type="button" data-kay="-1" aria-label="Önceki ay"${ayNo <= DD.bugun.slice(0, 7) ? ' disabled' : ''}><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button><b>${h(PA.ayAdi(ay))}</b><button class="ikon-dugme" type="button" data-kay="1" aria-label="Sonraki ay"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button></div><div class="ay-izgara">${['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((g) => `<span class="ay-etiket">${g}</span>`).join('')}${hucre}</div>`;
  }
  function saatleriCiz() {
    const kap = $('rpSaatler');
    if (!s.tarih) { kap.innerHTML = ''; $('rpSaatNot').textContent = 'Önce bir gün seç.'; ozetCiz(); return; }
    const l = adaylar(s.tarih);
    const onceki = s.saat;
    if (s.saat && !l.some((x) => x.saat === s.saat)) s.saat = null;
    kap.innerHTML = l.map((x) => `<button class="cip${x.saat === s.saat ? ' aktif' : ''}" type="button" data-saat="${x.saat}" aria-pressed="${x.saat === s.saat}">${DD.bicim.saat(x.saat)}</button>`).join('');
    $('rpSaatNot').textContent = onceki && !s.saat ? onceki + ' saatine ' + sureOf() + ' dk sığmıyor, başka saat seç.' : l.length ? PA.uzunTarih(s.tarih) : PA.uzunTarih(s.tarih) + ' için boş saat yok.';
    ozetCiz();
  }
  /* Onay özeti: kaydetmeden önce kim, ne zaman, nasıl tek satırda okunur */
  function ozetCiz() {
    const dn = PA.danisan(s.danisan), p = PA.paket(s.paket);
    const zaman = s.tarih && s.saat ? h(PA.uzunTarih(s.tarih)) + ' · ' + DD.bicim.saat(s.saat) + '–' + DD.bicim.saat(PA.saat(PA.dakika(s.saat) + sureOf())) : '';
    if (s.kip === 'blok') { $('rpOzet').innerHTML = zaman ? `<b>Kapanacak saat</b><span>${zaman}</span>` : '<span>Gün ve saat seç.</span>'; return; }
    if (s.kip === 'seans') { $('rpOzet').innerHTML = zaman ? `<b>Açılacak seans</b><span>${zaman}</span><span>${s.tur === 'online' ? 'Online' : 'Yüz yüze'} · ${sureOf()} dk</span>` : '<span>Gün ve saat seç.</span>'; return; }
    if (!dn || !zaman) { $('rpOzet').innerHTML = `<span>${!dn && !zaman ? 'Danışan ve saat seç.' : !dn ? zaman + ' · danışan seç.' : h(dn.ad) + ' için gün ve saat seç.'}</span>`; return; }
    const kalan = p ? PA.kalanSeans(dn, p.id) : null;
    $('rpOzet').innerHTML = `<b>${h(dn.ad)}</b><span>${zaman}</span><span>${s.tur === 'online' ? 'Online' : 'Yüz yüze'} · ${sureOf()} dk${p ? ' · ' + h(p.ad) + (kalan != null ? ', ' + kalan + ' seans hakkı' : '') : ''}</span>`;
  }
  const tazele = () => { kipGoster(); turAyarla(); gunleriCiz(); saatleriCiz(); };

  /* Danışan önerisi */
  const girdi = $('rpDanisan'), oneri = $('rpOneri');
  /* Düz düğme listesi: kit `role=listbox` kaplarını kendi seçicisi sanıp toast basıyor. Oklar odağı taşır. */
  function oneriAc() {
    const q = girdi.value.trim().toLocaleLowerCase('tr');
    const l = secilebilir().filter((x) => x.ad.toLocaleLowerCase('tr').includes(q)).slice(0, 8);
    oneri.innerHTML = l.length ? l.map((x) => { const p = PA.paket(x.paket_id); return `<button class="oneri-kalem" type="button" data-id="${x.id}">${h(x.ad)}<small>${p ? h(p.ad) : ''}</small></button>`; }).join('') : '<span class="oneri-kalem">Eşleşen danışan yok</span>';
    oneri.hidden = false;
  }
  function oneriKapat() { oneri.hidden = true; }
  function danisanSec(id) {
    const dn = PA.danisan(id);
    s.danisan = id;
    girdi.value = dn.ad;
    oneriKapat();
    window.DM_HATA_SIL(girdi.closest('.alan'));
    const p = PA.paket(dn.paket_id);
    if (p && p.aktif) { s.paket = dn.paket_id; $('rpPaket').value = s.paket; s.tur = p.tur === 'yüz yüze' ? 'yüz yüze' : s.tur; s.sure = varsayilanSure(); }
    tazele();
  }
  girdi.addEventListener('focus', oneriAc);
  girdi.addEventListener('input', () => { s.danisan = ''; oneriAc(); });
  girdi.addEventListener('keydown', (e) => {
    if (oneri.hidden) return;
    const l = [...oneri.querySelectorAll('[data-id]')];
    if (e.key === 'ArrowDown' && l[0]) { e.preventDefault(); l[0].focus(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (l[0]) danisanSec(l[0].dataset.id); }
    else if (e.key === 'Escape') { e.stopPropagation(); oneriKapat(); }
  });
  oneri.addEventListener('keydown', (e) => {
    const l = [...oneri.querySelectorAll('[data-id]')], i = l.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const y = i + (e.key === 'ArrowDown' ? 1 : -1);
      (y < 0 ? girdi : l[Math.min(y, l.length - 1)]).focus();
    } else if (e.key === 'Escape') { e.stopPropagation(); oneriKapat(); girdi.focus(); }
  });
  /* Fareyle seçim mousedown'da: odak kayınca liste kımıldıyor, click düğme yerine kaba düşüyordu */
  oneri.addEventListener('mousedown', (e) => { const b = e.target.closest('[data-id]'); if (b) { e.preventDefault(); danisanSec(b.dataset.id); } });
  oneri.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) danisanSec(b.dataset.id); });
  $('randevuPanel').addEventListener('click', (e) => { if (!e.target.closest('.oneri-kap')) oneriKapat(); });

  /* o: {danisan, tarih, saat, randevu(yeniden planlama)} */
  PA.randevuAc = function (o = {}) {
    paketDoldur();
    const r = o.randevu;
    const dn = PA.danisan(o.danisan || (r && r.danisan_id));
    const paket = r ? r.paket_id : dn && (PA.paket(dn.paket_id) || {}).aktif ? dn.paket_id : PA.d().paketler.find((p) => p.aktif).id;
    const ilkGun = o.tarih || DD.bugun;
    s = { kip: 'randevu', danisan: dn ? dn.id : '', paket, tur: r ? r.tur : (PA.paket(paket) || {}).tur === 'yüz yüze' ? 'yüz yüze' : 'online', tarih: o.tarih || null, saat: o.saat || null, haric: r ? r.id : null, duzenlenen: r || null, ay: (ilkGun < DD.bugun ? DD.bugun : ilkGun).slice(0, 7) + '-01' };
    s.sure = r ? r.sure : varsayilanSure();
    girdi.value = dn ? dn.ad : '';
    girdi.disabled = !!r;
    if (!$('rpPaket').querySelector(`option[value="${paket}"]`)) {
      const p = PA.paket(paket);
      if (p) $('rpPaket').insertAdjacentHTML('beforeend', `<option value="${p.id}">${h(p.ad)}</option>`);
    }
    $('rpPaket').value = paket;
    $('rpPaket').disabled = !!r;
    $('rpNot').value = r ? r.ozel_not || '' : '';
    $('rpNeden').value = '';
    $('rpBildir').checked = true;
    $('rpTekrar').checked = false;
    $('rpHafta').hidden = true;
    oneriKapat();
    form.querySelectorAll('.alan').forEach((a) => window.DM_HATA_SIL && window.DM_HATA_SIL(a));
    tazele();
    DD.ac('#randevuPanel');
  };

  $('rpKip').addEventListener('dd:secim', (e) => {
    s.kip = e.detail.deger;
    s.sure = s.kip === 'blok' ? 60 : varsayilanSure();
    s.saat = null;
    tazele();
  });
  $('rpEkListe').addEventListener('click', (e) => {
    const b = e.target.closest('[data-ek-sil]');
    if (!b) return;
    const l = PA.ekSeanslar(), i = l.findIndex((x) => x.id === b.dataset.ekSil), es = l[i];
    if (!es) return;
    const dolu = PA.d().randevular.some((r) => r.tarih === es.tarih && PA.rAcik(r) && PA.dakika(r.saat) < PA.dakika(es.saat) + es.sure && PA.rBitis(r) > PA.dakika(es.saat));
    window.DM_ONAY('Açık seans kaldırılsın mı?', dolu ? 'Bu seansa alınmış randevu yerinde kalır; yalnız boş kalan saat kapanır.' : 'Saat yeniden müsaitlik dışına döner.', 'Kaldır', (ok) => {
      if (!ok) return;
      l.splice(i, 1); PA.kaydet(); ekListeCiz(); gunleriCiz(); saatleriCiz();
      DD.toast('Açık seans kaldırıldı.');
      document.dispatchEvent(new CustomEvent('pa:degisti', { detail: { tarih: es.tarih } }));
    });
  });
  $('rpPaket').addEventListener('change', (e) => { s.paket = e.target.value; s.sure = varsayilanSure(); tazele(); });
  $('rpTur').addEventListener('dd:secim', (e) => { s.tur = e.detail.deger; s.sure = varsayilanSure(); tazele(); });
  $('rpSure').addEventListener('change', (e) => { s.sure = +e.target.value; gunleriCiz(); saatleriCiz(); });
  $('rpTekrar').addEventListener('change', (e) => { $('rpHafta').hidden = !e.target.checked; });
  $('rpGunler').addEventListener('click', (e) => {
    const k = e.target.closest('[data-kay]');
    if (k) { const [y, a] = s.ay.split('-').map(Number), d = new Date(y, a - 1 + +k.dataset.kay, 1); s.ay = PA.iso(d); gunleriCiz(); return; }
    const g = e.target.closest('[data-tarih]');
    if (g && !g.disabled) { s.tarih = g.dataset.tarih; s.saat = null; gunleriCiz(); saatleriCiz(); }
  });
  $('rpSaatler').addEventListener('click', (e) => {
    const c = e.target.closest('[data-saat]');
    if (c) { s.saat = c.dataset.saat; saatleriCiz(); }
  });
  const yeniId = () => 'r' + String(PA.d().randevular.reduce((m, x) => Math.max(m, parseInt(x.id.slice(1), 10) || 0), 0) + 1).padStart(2, '0');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dnAlan = girdi.closest('.alan'), saatAlan = $('rpSaatler').closest('.alan');
    if (s.kip === 'randevu' && !s.danisan) { window.DM_HATA_YAZ(dnAlan, 'Listeden bir danışan seç.'); girdi.focus(); return; }
    window.DM_HATA_SIL(dnAlan);
    if (!s.tarih || !s.saat) { window.DM_HATA_YAZ(saatAlan, 'Tarih ve saat seç.'); return; }
    window.DM_HATA_SIL(saatAlan);
    if (s.kip === 'seans') {
      PA.ekSeanslar().push({ id: 'es' + Date.now(), tarih: s.tarih, saat: s.saat, sure: s.sure, tur: s.tur });
      PA.kaydet();
      DD.kapat($('randevuPanel'));
      DD.toast('Açık seans eklendi: ' + PA.tarih(s.tarih) + ' ' + DD.bicim.saat(s.saat) + '. Danışanlar bu saati randevu ekranında görür.');
      document.dispatchEvent(new CustomEvent('pa:degisti', { detail: { tarih: s.tarih } }));
      return;
    }
    if (s.kip === 'blok') {
      PA.bloklar().push({ id: 'b' + Date.now(), tarih: s.tarih, saat: s.saat, sure: s.sure, neden: $('rpNeden').value.trim() || 'Kapalı' });
      PA.kaydet();
      DD.kapat($('randevuPanel'));
      DD.toast('Saat kapatıldı: ' + PA.tarih(s.tarih) + ' ' + DD.bicim.saat(s.saat));
      document.dispatchEvent(new CustomEvent('pa:degisti', { detail: { tarih: s.tarih } }));
      return;
    }
    const sure = sureOf(), not = $('rpNot').value.trim(), d = PA.d(), dn = PA.danisan(s.danisan);
    let r = s.duzenlenen, metin, atlanan = 0, adet = 1;
    if (r) {
      (r.gecmis = r.gecmis || []).push({ tarih: r.tarih, saat: r.saat });
      Object.assign(r, { tarih: s.tarih, saat: s.saat, sure, tur: s.tur, ozel_not: not, durum: 'dolu' });
      delete r.iptal_eden;
      if (r.talep) { r.talep_sonuc = 'kabul'; delete r.talep; } /* talep başka saate alınarak karşılandı */
      metin = 'Randevunuzu ' + PA.ayGun(s.tarih) + ' ' + DD.bicim.saat(s.saat) + ' saatine aldım. ' + PA.rTur(r) + ' görüşeceğiz.';
    } else {
      const hafta = PA.bayrak('takvim-haftalik-tekrar') && $('rpTekrar').checked ? +$('rpHafta').value : 1;
      adet = 0;
      for (let i = 0; i < hafta; i++) {
        const tarih = PA.ekle(s.tarih, i * 7);
        if (i && !PA.slotUygun(tarih, PA.dakika(s.saat), sure)) { atlanan++; continue; }
        const y = { id: yeniId(), danisan_id: s.danisan, paket_id: s.paket, tarih, saat: s.saat, sure, tur: s.tur, durum: 'dolu', not: '', ozel_not: not, olusturan: 'diyetisyen' };
        d.randevular.push(y);
        if (!r) r = y;
        adet++;
      }
      metin = PA.ayGun(s.tarih) + ' ' + DD.bicim.saat(s.saat) + ' için ' + PA.rTur(r).toLocaleLowerCase('tr') + ' randevunuzu oluşturdum.' + (adet > 1 ? ' Aynı gün ve saatte ' + adet + ' hafta devam edeceğiz.' : '');
    }
    if ($('rpBildir').checked) PA.mesajYaz(s.danisan, metin);
    PA.uyeRandevuTazele();
    PA.kaydet();
    DD.kapat($('randevuPanel'));
    DD.toast(s.duzenlenen ? 'Randevu yeni saate alındı: ' + dn.ad + ', ' + PA.tarih(r.tarih) + ' ' + DD.bicim.saat(r.saat) : (adet > 1 ? adet + ' randevu oluşturuldu: ' : 'Randevu oluşturuldu: ') + dn.ad + ', ' + PA.tarih(r.tarih) + ' ' + DD.bicim.saat(r.saat));
    if (atlanan) DD.toast(atlanan + ' hafta o saat uygun olmadığı için atlandı.', 'uyari');
    document.dispatchEvent(new CustomEvent('pa:degisti', { detail: { randevu: r.id } }));
  });

  /* ── Detay ──────────────────────────────────────────────────────── */
  let acik = null;
  const talepMetin = (r) => (r.talep.tur === 'iptal' ? 'Görüşmeyi iptal etmek istiyor.' : h(PA.ayGun(r.tarih)) + ' ' + DD.bicim.saat(r.saat) + ' yerine ' + h(PA.ayGun(r.talep.yeni_tarih)) + ' ' + DD.bicim.saat(r.talep.yeni_saat) + ' istiyor.');
  const talepKutu = (r) => (r.talep ? `<div class="uyari-kutu ${r.talep.tur === 'iptal' ? 'tehlike' : 'uyari'}"><i class="fa-solid ${r.talep.tur === 'iptal' ? 'fa-ban' : 'fa-arrow-right-arrow-left'}" aria-hidden="true"></i><p><b>${PA.talepAdi(r)}.</b> ${talepMetin(r)}${r.talep.neden ? ' ' + h(r.talep.neden) : ''}</p></div>` : '');
  /* Görüşme bitince doğal devam: not, plan, kontrol */
  PA.siradaBlok = (dn) => `<div class="sirada-blok"><b>Sırada ne var?</b><div class="ayar-liste"><a class="ayar-satir" href="${PA.yol.danisan(dn.id, 'not')}&eylem=not-ekle"><span class="as-ikon"><i class="fa-solid fa-note-sticky" aria-hidden="true"></i></span><span class="as-metin"><b>Not ekle</b><span>İlerleme notunu danışanla paylaşabilirsin</span></span><i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i></a><a class="ayar-satir" href="${PA.yol.yeniPlan(dn.id)}"><span class="as-ikon"><i class="fa-solid fa-clipboard-list" aria-hidden="true"></i></span><span class="as-metin"><b>Plan oluştur</b><span>Haftalık planı kur ve gönder</span></span><i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i></a><button class="ayar-satir" type="button" data-randevu-ac data-danisan="${dn.id}"><span class="as-ikon"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i></span><span class="as-metin"><b>Kontrol randevusu</b><span>Bir sonraki görüşmeyi planla</span></span><i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i></button></div></div>`;
  const siradaBlok = PA.siradaBlok;
  const satir = (ikon, etiket, deger) => `<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><span class="as-metin"><span>${etiket}</span><b>${deger}</b></span></div>`;
  /* Ödeme durumu: danışanın ödemesi paket satın alımında tahsil edilir; seans kazanca görüşme sonrası işlenir */
  const HAKEDIS = { beklemede: 'hakediş bekliyor', odendi: 'hakediş ödendi', 'talep-edildi': 'hakediş talep edildi', iptal: 'kazanca işlenmedi', iade: 'danışana iade edildi' };
  PA.rOdeme = (r) => {
    const p = PA.paket(r.paket_id), durum = PA.rDurum(r);
    const islem = ((PA.d().kazanclar || {}).son_islemler || []).find((x) => x.randevu_id === r.id);
    if (islem && islem.durum === 'iade') return { etiket: 'İade edildi', sinif: 'kapali', alt: 'Seans ücreti danışana iade edildi' };
    if (durum === 'iptal') return { etiket: 'Tahsil edilmedi', sinif: 'kapali', alt: p ? 'Seans hakkı pakete geri döndü' : 'İptal edilen görüşmeden ücret alınmaz' };
    if (!p) return { etiket: 'Ödeme bekliyor', sinif: 'bekleyen', alt: 'Bağlı paket yok, danışan seans ücretini ödemedi' };
    const hak = islem ? HAKEDIS[islem.durum] || '' : ['tamamlandi', 'sonuc-bekliyor'].includes(durum) ? 'sonuç girilince kazanca işlenir' : 'görüşmeden sonra kazanca işlenir';
    return { etiket: 'Paketten ödendi', sinif: 'cozulen', alt: 'Paket alımında tahsil edildi, ' + hak };
  };
  const odemeSatir = (r) => { const o = PA.rOdeme(r); return `<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-credit-card" aria-hidden="true"></i></span><span class="as-metin"><span>Ödeme durumu</span><b>${o.alt}</b></span><span class="as-eylem">${PA.hap(o.etiket, o.sinif)}</span></div>`; };
  function detayCiz() {
    const r = acik, dn = PA.danisan(r.danisan_id), p = PA.paket(r.paket_id), durum = PA.rDurum(r);
    const sonucGirilir = ['sonuc-bekliyor', 'tamamlandi', 'gelmedi'].includes(durum);
    const gelecek = durum === 'dolu', talepsiz = gelecek && !r.talep;
    const i = PA.ilerleme(dn);
    $('rdGovde').innerHTML = `<div class="ozet-bas"><a class="kisi-hucre" href="${PA.yol.danisan(dn.id)}">${PA.avatar(dn.ad)}<span class="kisi-bilgi"><span class="kisi-ad">${h(dn.ad)}</span><span class="kisi-alt">${h(dn.hedef)}${i ? ' · ' + i.hafta + '. hafta' : ''}</span></span></a>${PA.rHap(r)}</div>
<div class="ayar-liste">${satir('fa-calendar-day', 'Tarih ve saat', h(PA.uzunTarih(r.tarih)) + ' · ' + DD.bicim.saat(r.saat))}${satir(PA.rIkon(r), 'Görüşme', PA.rTur(r) + ' · ' + r.sure + ' dk')}${satir('fa-box-open', 'Paket', p ? h(p.ad) + ' · ' + PA.kalanSeans(dn, p.id) + ' seans kaldı' : '—')}${odemeSatir(r)}</div>
${talepKutu(r)}
${r.not ? `<div class="not-kutu"><b>Görüşme notu</b>${h(r.not)}</div>` : ''}
${r.ozel_not ? `<div class="not-kutu"><b>Özel not</b>${h(r.ozel_not)}</div>` : ''}
${r.tur === 'online' && talepsiz ? `<div class="alan"><label class="alan-etiket" for="rdBag">Görüşme bağı <span class="istege-bagli">(isteğe bağlı)</span></label><input class="alan-girdi" id="rdBag" type="url" placeholder="https://" value="${h(r.baglanti || '')}" autocomplete="off"></div><div class="eylem-satiri"><button class="dugme hayalet kucuk" type="button" data-rd="bag">Bağı kaydet</button>${r.baglanti ? `<a class="dugme hayalet kucuk" href="${h(r.baglanti)}" target="_blank" rel="noopener"><i class="fa-solid fa-video" aria-hidden="true"></i> Görüşmeye katıl</a>` : ''}</div>` : ''}
${sonucGirilir ? `<form id="rdSonuc" novalidate><h3 class="form-bolum-bas"><i class="fa-solid fa-clipboard-check" aria-hidden="true"></i> Görüşme sonucu</h3>
<div class="alan"><div class="segment" id="rdSonucSec" role="group" aria-label="Görüşme sonucu"><button type="button" data-deger="tamamlandi" aria-pressed="${durum !== 'gelmedi'}">Tamamlandı</button><button type="button" data-deger="gelmedi" aria-pressed="${durum === 'gelmedi'}">Gelmedi</button></div></div>
<div class="alan"><label class="alan-etiket" for="rdOzet">Görüşme özeti <span class="istege-bagli">(isteğe bağlı)</span></label><textarea class="alan-metin" id="rdOzet" rows="4">${h(r.ozet || '')}</textarea></div></form>` : ''}
${r.gecmis && r.gecmis.length ? `<p class="alan-yardim"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i><span>Önceki saat: ${r.gecmis.map((g) => PA.tarih(g.tarih) + ' ' + DD.bicim.saat(g.saat)).join(', ')}</span></p>` : ''}
${durum === 'tamamlandi' ? siradaBlok(dn) : durum === 'gelmedi' ? '<div class="alan-yardim"><span>Görüşme gerçekleşmedi. Yeni saat için Yeniden planla.</span></div>' : ''}
<div class="eylem-satiri">${talepsiz ? `<button class="dugme hayalet kucuk" type="button" data-rd="planla"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> Yeniden planla</button>` : ''}<a class="dugme hayalet kucuk" href="${PA.yol.danisan(dn.id)}"><i class="fa-solid fa-id-card" aria-hidden="true"></i> Danışana git</a></div>`;
    let ayak = '<button class="dugme hayalet" type="button" data-kapat>Kapat</button>';
    if (durum === 'onay-bekliyor') ayak = `<button class="dugme hayalet tehlike" type="button" data-kuyruk-red="${r.id}">Reddet</button><button class="dugme birincil" type="button" data-kuyruk-kabul="${r.id}">Onayla</button>`;
    else if (r.talep) ayak = `<button class="dugme hayalet tehlike" type="button" data-kuyruk-red="${r.id}">Reddet</button><button class="dugme birincil" type="button" data-kuyruk-kabul="${r.id}">Kabul et</button>`;
    else if (gelecek) ayak = `<button class="dugme hayalet tehlike" type="button" data-rd="iptal">İptal et</button><a class="dugme birincil" href="${PA.yol.gorusme(r.id)}"><i class="fa-solid fa-play" aria-hidden="true"></i> Görüşmeyi başlat</a>`;
    else if (sonucGirilir) ayak += `<button class="dugme birincil" type="button" data-rd="sonuc">Sonucu kaydet</button>`;
    else if (durum === 'iptal') ayak += `<button class="dugme birincil" type="button" data-rd="planla">Yeniden planla</button>`;
    $('rdAyak').innerHTML = ayak;
  }
  PA.randevuDetay = function (id) {
    acik = PA.d().randevular.find((x) => x.id === id);
    if (!acik) return;
    detayCiz();
    DD.ac('#randevuDetay');
  };
  const degisti = () => { PA.kazancTazele(); PA.uyeRandevuTazele(); PA.kaydet(); document.dispatchEvent(new CustomEvent('pa:degisti', { detail: { randevu: acik.id } })); };
  $('randevuDetay').addEventListener('click', (e) => {
    const b = e.target.closest('[data-rd]');
    if (!b) return;
    const r = acik, dn = PA.danisan(r.danisan_id), is = b.dataset.rd;
    if (is === 'bag') {
      const v = $('rdBag').value.trim();
      if (v && !/^https?:\/\/\S+\.\S+/.test(v)) { window.DM_HATA_YAZ($('rdBag').closest('.alan'), 'Geçerli bir bağ yaz.'); return; }
      r.baglanti = v; degisti(); detayCiz(); DD.toast('Görüşme bağı kaydedildi.');
    } else if (is === 'planla') {
      DD.kapat($('randevuDetay')); PA.randevuAc({ randevu: r, danisan: r.danisan_id });
    } else if (is === 'iptal') {
      window.DM_ONAY('Randevu iptal edilsin mi?', dn.ad + ', ' + PA.tarih(r.tarih) + ' ' + DD.bicim.saat(r.saat) + ' görüşmesi iptal edilir, saat boşa çıkar ve danışana mesaj gider.', 'İptal et', (ok) => {
        if (!ok) return;
        r.durum = 'iptal'; r.iptal_eden = 'diyetisyen';
        PA.mesajYaz(r.danisan_id, PA.ayGun(r.tarih) + ' ' + DD.bicim.saat(r.saat) + ' randevunuzu iptal etmek zorunda kaldım. Size uygun yeni bir saat planlayalım.');
        degisti(); DD.kapat($('randevuDetay')); DD.toast('Randevu iptal edildi, saat yeniden boş.');
      });
    } else if (is === 'sonuc') {
      const sec = $('rdSonucSec').querySelector('[aria-pressed="true"]').dataset.deger;
      r.durum = sec; r.ozet = $('rdOzet').value.trim();
      if (sec === 'tamamlandi') { if (!dn.son_gorusme || r.tarih > dn.son_gorusme) dn.son_gorusme = r.tarih; dn.yeni = false; }
      degisti(); detayCiz(); DD.toast('Görüşme sonucu kaydedildi: ' + (sec === 'gelmedi' ? 'Gelmedi' : 'Tamamlandı'));
    }
  });

  /* ── Onay ve talep kuyruğu: takvim, genel bakış ve detay aynı işlemi kullanır ── */
  PA.bekleyenSatir = (r) => {
    const dn = PA.danisan(r.danisan_id);
    const metin = r.talep ? talepMetin(r) + (r.talep.neden ? ' ' + h(r.talep.neden) : '') : h(PA.uzunTarih(r.tarih)) + ' · ' + DD.bicim.saat(r.saat) + ' · ' + PA.rTur(r) + (r.not ? ' · ' + h(r.not) : '');
    return `<div class="ayar-satir">${PA.avatar(dn.ad)}<span class="as-metin"><b><button class="bag-dugme" type="button" data-randevu="${r.id}">${h(dn.ad)}</button></b><span>${metin}</span></span><span class="as-eylem">${r.talep ? PA.talepRozet(r) : PA.rHap(r)}<button class="dugme hayalet kucuk tehlike" type="button" data-kuyruk-red="${r.id}">Reddet</button><button class="dugme birincil kucuk" type="button" data-kuyruk-kabul="${r.id}">${r.talep ? 'Kabul et' : 'Onayla'}</button></span></div>`;
  };
  function kuyrukBitti(r, mesaj, metin, tip) {
    if (mesaj) PA.mesajYaz(r.danisan_id, mesaj);
    PA.kazancTazele();
    PA.uyeRandevuTazele();
    PA.kaydet();
    const o = $('randevuDetay');
    if (!o.hidden) DD.kapat(o);
    DD.toast(metin, tip);
    document.dispatchEvent(new CustomEvent('pa:degisti', { detail: { randevu: r.id } }));
  }
  function kuyrukKabul(r) {
    const t = r.talep, dn = PA.danisan(r.danisan_id), ilk = PA.ilkAd(dn.ad);
    if (!t) { r.durum = 'dolu'; kuyrukBitti(r, PA.ayGun(r.tarih) + ' ' + DD.bicim.saat(r.saat) + ' randevunuzu onayladım.', ilk + ' için randevu onaylandı.'); return; }
    if (t.tur === 'iptal') {
      r.durum = 'iptal'; r.iptal_eden = 'danisan'; r.talep_sonuc = 'kabul'; delete r.talep;
      kuyrukBitti(r, 'İptal talebinizi aldım, ' + PA.ayGun(r.tarih) + ' ' + DD.bicim.saat(r.saat) + ' randevunuz iptal edildi.', 'İptal talebi kabul edildi, saat yeniden boş.');
      return;
    }
    if (!PA.slotUygun(t.yeni_tarih, PA.dakika(t.yeni_saat), r.sure, r.id)) { DD.toast('İstenen saat artık uygun değil, yeni saat seç.', 'uyari'); const o = $('randevuDetay'); if (!o.hidden) DD.kapat(o); PA.randevuAc({ randevu: r, danisan: r.danisan_id, tarih: t.yeni_tarih }); return; }
    (r.gecmis = r.gecmis || []).push({ tarih: r.tarih, saat: r.saat });
    r.tarih = t.yeni_tarih; r.saat = t.yeni_saat; r.talep_sonuc = 'kabul'; delete r.talep;
    kuyrukBitti(r, 'Saat değişikliği talebinizi kabul ettim. Yeni randevunuz ' + PA.ayGun(r.tarih) + ' ' + DD.bicim.saat(r.saat) + '.', 'Randevu yeni saate alındı: ' + PA.tarih(r.tarih) + ' ' + DD.bicim.saat(r.saat));
  }
  function kuyrukRed(r) {
    const t = r.talep;
    if (!t) { r.durum = 'iptal'; r.iptal_eden = 'diyetisyen'; kuyrukBitti(r, PA.ayGun(r.tarih) + ' ' + DD.bicim.saat(r.saat) + ' için randevu talebinizi karşılayamıyorum. Size uygun başka bir saat planlayalım.', 'Randevu talebi reddedildi.'); return; }
    r.talep_sonuc = 'red'; delete r.talep;
    kuyrukBitti(r, (t.tur === 'iptal' ? 'İptal talebinizi' : 'Saat değişikliği talebinizi') + ' karşılayamadım. ' + PA.ayGun(r.tarih) + ' ' + DD.bicim.saat(r.saat) + ' randevunuz geçerli.', 'Talep reddedildi, randevu yerinde kaldı.');
  }
  document.addEventListener('click', (e) => {
    const k = e.target.closest('[data-kuyruk-kabul]'), d = e.target.closest('[data-kuyruk-red]');
    if (!k && !d) return;
    const r = PA.d().randevular.find((x) => x.id === (k ? k.dataset.kuyrukKabul : d.dataset.kuyrukRed));
    if (r) (k ? kuyrukKabul : kuyrukRed)(r);
  });

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-randevu-ac]');
    if (b) {
      e.preventDefault();
      const o = $('randevuDetay');
      if (!o.hidden) DD.kapat(o);
      PA.randevuAc({ danisan: b.dataset.danisan });
    }
  });
})();
