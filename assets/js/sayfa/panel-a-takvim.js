/* Takvim & Randevular: hafta ve gün ızgarası, dönem listesi. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const $ = (id) => document.getElementById(id);
  const ADIM = 30;
  const dar = window.matchMedia('(max-width:760px)').matches;
  const v = { gorunum: dar ? 'gun' : 'hafta', tarih: DD.bugun };
  const izgara = $('takvimIzgara');

  const gunler = () => (v.gorunum === 'gun' ? [v.tarih] : Array.from({ length: 7 }, (_, i) => PA.ekle(PA.haftaBasi(v.tarih), i)));
  /* Izgara aralığı çalışma düzeninin en erken ve en geç saatidir */
  function aralik() {
    const l = PA.d().musaitlik.haftalik.filter((g) => g.acik);
    return { bas: Math.min(...l.map((g) => PA.dakika(g.baslangic))), bit: Math.max(...l.map((g) => PA.dakika(g.bitis))) };
  }
  const yerlestir = (el, sutun, satir, yukseklik) => {
    el.style.setProperty('grid-column', String(sutun));
    el.style.setProperty('grid-row', satir + ' / span ' + (yukseklik || 1));
    return el;
  };
  const dugum = (sinif, html) => { const e = document.createElement('div'); e.className = sinif; e.innerHTML = html || ''; return e; };

  function randevuSlot(r) {
    const dn = PA.danisan(r.danisan_id), durum = PA.rDurum(r);
    const sinif = (durum === 'dolu' ? 'dolu' : durum) + (r.talep ? ' talepli' : '');
    const isaret = r.talep ? `<span class="takvim-isaret"><i class="fa-solid ${r.talep.tur === 'iptal' ? 'fa-ban' : 'fa-arrow-right-arrow-left'}" aria-hidden="true"></i> ${PA.talepAdi(r)}</span>` : durum === 'onay-bekliyor' ? '<span class="takvim-isaret"><i class="fa-solid fa-circle-question" aria-hidden="true"></i> Onay</span>' : '';
    return `<button class="takvim-slot ${sinif}" type="button" data-randevu="${r.id}" aria-label="${h(dn.ad)}, ${DD.bicim.saat(r.saat)}, ${PA.rTur(r)}, ${r.sure} dakika, ${h(PA.rEtiket(r))}${r.talep ? ', ' + PA.talepAdi(r) : ''}"><b>${DD.bicim.saat(r.saat)}${isaret}</b><small><i class="fa-solid ${PA.rIkon(r)}" aria-hidden="true"></i> ${h(dn.ad)}</small>${v.gorunum === 'gun' ? `<small>${PA.rTur(r)} · ${r.sure} dk · ${h(PA.rEtiket(r))}${r.not ? ' · ' + h(r.not) : ''}</small>` : ''}</button>`;
  }
  function gunHucreleri(iso, sutun, a) {
    const g = PA.gunDuzeni(iso), parca = [];
    const bugun = iso === DD.bugun ? ' bugun' : '';
    const satirOf = (m) => 2 + (m - a.bas) / ADIM;
    const rs = PA.d().randevular.filter((r) => r.tarih === iso && PA.rAcik(r)).sort((x, y) => x.saat.localeCompare(y.saat));
    const kapaliBlok = (bas, bit, metin) => {
      if (bit <= bas) return;
      parca.push(yerlestir(dugum('takvim-hucre' + bugun, `<span class="takvim-slot kapali" role="img" aria-label="${h(metin)}, ${DD.bicim.saat(PA.saat(bas))}-${DD.bicim.saat(PA.saat(bit))}">${h(metin)}</span>`), sutun, satirOf(bas), (bit - bas) / ADIM));
    };
    if (!g.acik) { kapaliBlok(a.bas, a.bit, g.neden); return parca; }
    kapaliBlok(a.bas, g.bas, 'Kapalı');
    kapaliBlok(g.bit, a.bit, 'Kapalı');
    if (g.ara) kapaliBlok(Math.floor(g.ara[0] / ADIM) * ADIM, Math.ceil(g.ara[1] / ADIM) * ADIM, 'Öğle arası');
    const araBas = g.ara ? Math.floor(g.ara[0] / ADIM) * ADIM : -1, araBit = g.ara ? Math.ceil(g.ara[1] / ADIM) * ADIM : -1;
    for (let m = g.bas; m < g.bit;) {
      if (g.ara && m >= araBas && m < araBit) { m = araBit; continue; }
      const blok = PA.blokBul(iso, m, m + ADIM);
      if (blok) {
        const yuk = Math.max(1, Math.ceil((PA.dakika(blok.saat) + blok.sure - m) / ADIM));
        parca.push(yerlestir(dugum('takvim-hucre' + bugun, `<button class="takvim-slot kapali" type="button" data-blok="${blok.id}" aria-label="${h(blok.neden)}, ${DD.bicim.saat(blok.saat)}, kapatmayı kaldır">${h(blok.neden)}</button>`), sutun, satirOf(m), yuk));
        m += yuk * ADIM;
        continue;
      }
      const r = rs.find((x) => PA.dakika(x.saat) < m + ADIM && PA.rBitis(x) > m);
      if (r) {
        const yuk = Math.max(1, Math.ceil(r.sure / ADIM));
        parca.push(yerlestir(dugum('takvim-hucre' + bugun, randevuSlot(r)), sutun, satirOf(m), yuk));
        m += yuk * ADIM;
        continue;
      }
      const gecmis = iso + 'T' + PA.saat(m) <= PA.simdi;
      if (!gecmis && PA.d().musaitlik.tampon && !PA.slotUygun(iso, m, ADIM)) {
        parca.push(yerlestir(dugum('takvim-hucre' + bugun, '<span class="takvim-slot kapali" role="img" aria-label="Seanslar arası tampon">Tampon</span>'), sutun, satirOf(m), 1));
        m += ADIM;
        continue;
      }
      parca.push(yerlestir(dugum('takvim-hucre' + bugun, gecmis ? '' : `<button class="takvim-slot bos" type="button" data-tarih="${iso}" data-saat="${PA.saat(m)}" aria-label="${PA.tarih(iso)} ${DD.bicim.saat(PA.saat(m))}, boş, randevu oluştur"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>`), sutun, satirOf(m), 1));
      m += ADIM;
    }
    return parca;
  }
  function izgaraCiz() {
    const gl = gunler(), a = aralik();
    izgara.className = 'takvim-izgara saatli' + (v.gorunum === 'gun' ? ' gunluk' : '');
    izgara.innerHTML = '';
    izgara.appendChild(yerlestir(dugum('takvim-kose', 'Saat'), 1, 1));
    gl.forEach((iso, i) => izgara.appendChild(yerlestir(dugum('takvim-gun-bas' + (iso === DD.bugun ? ' bugun' : ''), `${PA.gunKisa(iso)}<b>${+iso.slice(8)}</b>`), i + 2, 1)));
    for (let m = a.bas, s = 2; m < a.bit; m += ADIM, s++) izgara.appendChild(yerlestir(dugum('takvim-saat', m % 60 ? '' : DD.bicim.saat(PA.saat(m))), 1, s));
    gl.forEach((iso, i) => gunHucreleri(iso, i + 2, a).forEach((e) => izgara.appendChild(e)));
    const bugunSira = gl.indexOf(DD.bugun), simdi = PA.dakika(PA.simdi.slice(11, 16));
    if (bugunSira > -1 && simdi >= a.bas && simdi < a.bit) izgara.appendChild(yerlestir(dugum('takvim-simdi'), bugunSira + 2, 2 + Math.floor((simdi - a.bas) / ADIM)));
    const bas = gl[0], son = gl[gl.length - 1];
    $('takvimBaslik').textContent = v.gorunum === 'gun' ? PA.uzunTarih(v.tarih) : PA.tarih(bas).slice(0, 5) + ' – ' + PA.tarih(son);
    $('takvimOnceki').setAttribute('aria-label', v.gorunum === 'gun' ? 'Önceki gün' : 'Önceki hafta');
    $('takvimSonraki').setAttribute('aria-label', v.gorunum === 'gun' ? 'Sonraki gün' : 'Sonraki hafta');
  }
  function listeCiz() {
    const gl = gunler();
    const l = PA.d().randevular.filter((r) => gl.includes(r.tarih)).sort((a, b) => (a.tarih + a.saat).localeCompare(b.tarih + b.saat));
    $('listeBaslik').textContent = (v.gorunum === 'gun' ? 'Bu günün' : 'Bu haftanın') + ' randevuları';
    $('randevuTablo').innerHTML = l.length ? l.map((r) => {
      const dn = PA.danisan(r.danisan_id);
      const eylem = PA.rDurum(r) === 'onay-bekliyor' || r.talep
        ? `<button class="dugme hayalet kucuk" type="button" data-randevu="${r.id}">İncele</button>`
        : PA.rDurum(r) === 'sonuc-bekliyor'
        ? `<button class="dugme hayalet kucuk" type="button" data-randevu="${r.id}">Sonuç gir</button>`
        : `<button class="ikon-dugme" type="button" data-randevu="${r.id}" aria-label="${h(dn.ad)} randevusunu aç"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>`;
      return `<tr><td data-etiket="Tarih"><b>${PA.tarih(r.tarih)}</b><small>${PA.gunAdi(r.tarih)} · ${DD.bicim.saat(r.saat)}</small></td><td data-etiket="Danışan"><a class="kisi-hucre" href="${PA.yol.danisan(dn.id)}">${PA.avatar(dn.ad)}<span class="kisi-bilgi"><span class="kisi-ad">${h(dn.ad)}</span></span></a></td><td data-etiket="Görüşme">${PA.rTur(r)}<small>${r.sure} dk${r.ozel_not || r.not ? ' · ' + h(r.ozel_not || r.not) : ''}</small></td><td data-etiket="Durum">${PA.rHap(r)}${PA.talepRozet(r)}</td><td class="eylem"><span class="satir-eylem">${eylem}</span></td></tr>`;
    }).join('') : '<tr><td colspan="5"><div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-calendar-xmark" aria-hidden="true"></i></span><h3>Bu dönemde randevu yok</h3><p>Boş bir saate tıklayarak randevu oluşturabilirsin.</p></div></td></tr>';
  }
  function ozetCiz() {
    const gl = gunler();
    const rs = PA.d().randevular.filter((r) => gl.includes(r.tarih) && PA.rAcik(r));
    const planli = rs.filter((r) => PA.rDurum(r) === 'dolu').length;
    const bos = gl.reduce((t, iso) => t + PA.gunSlotlari(iso, ADIM).filter((s) => s.uygun).length, 0);
    const bekleyen = PA.d().randevular.filter((r) => PA.rDurum(r) === 'sonuc-bekliyor');
    $('takvimOzet').textContent = (v.gorunum === 'hafta' ? 'Bu hafta ' : v.tarih === DD.bugun ? 'Bugün ' : PA.ayGun(v.tarih) + ' günü ') + planli + ' planlı görüşme, ' + bos + ' boş saat.';
    const u = $('sonucUyari');
    u.hidden = !bekleyen.length;
    if (bekleyen.length) u.innerHTML = `<i class="fa-solid fa-hourglass-half" aria-hidden="true"></i><p><b>${bekleyen.length} görüşmenin sonucu bekleniyor.</b> Saati geçmiş randevuyu açıp Tamamlandı ya da Gelmedi olarak işaretle.</p>`;
  }
  function kuyrukCiz() {
    const l = PA.bekleyenler();
    $('kuyrukKart').hidden = !l.length;
    $('kuyrukSayi').textContent = l.length + ' kayıt yanıtını bekliyor';
    $('kuyrukListe').innerHTML = (v.kuyrukTam ? l : l.slice(0, 3)).map(PA.bekleyenSatir).join('');
    $('kuyrukTum').hidden = l.length <= 3;
    $('kuyrukTum').textContent = v.kuyrukTam ? 'Daralt' : 'Tümünü göster (' + l.length + ')';
  }
  function ciz() { kuyrukCiz(); izgaraCiz(); listeCiz(); ozetCiz(); }

  $('takvimOnceki').addEventListener('click', () => { v.tarih = PA.ekle(v.tarih, v.gorunum === 'gun' ? -1 : -7); ciz(); });
  $('takvimSonraki').addEventListener('click', () => { v.tarih = PA.ekle(v.tarih, v.gorunum === 'gun' ? 1 : 7); ciz(); });
  $('kuyrukTum').addEventListener('click', () => { v.kuyrukTam = !v.kuyrukTam; kuyrukCiz(); });
  $('takvimBugun').addEventListener('click', () => { v.tarih = DD.bugun; ciz(); });
  $('takvimGorunum').addEventListener('dd:secim', (e) => { v.gorunum = e.detail.deger; ciz(); });
  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-randevu]');
    if (r) { PA.randevuDetay(r.dataset.randevu); return; }
    const b = e.target.closest('.takvim-slot.bos');
    if (b) { PA.randevuAc({ tarih: b.dataset.tarih, saat: b.dataset.saat }); return; }
    const k = e.target.closest('[data-blok]');
    if (k) window.DM_ONAY('Kapatma kaldırılsın mı?', 'Bu saat yeniden randevuya açılır.', 'Kaldır', (ok) => {
      if (!ok) return;
      const l = PA.bloklar();
      l.splice(l.findIndex((x) => x.id === k.dataset.blok), 1);
      PA.kaydet(); ciz(); DD.toast('Saat yeniden açıldı.');
    });
  });
  document.addEventListener('pa:degisti', (e) => {
    const r = PA.d().randevular.find((x) => x.id === e.detail.randevu);
    const tarih = e.detail.tarih || (r && r.tarih);
    if (tarih && !gunler().includes(tarih)) v.tarih = tarih;
    ciz();
  });

  $('takvimGorunum').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === v.gorunum)));
  const adresId = PA.parametre('randevu');
  const adresR = adresId && PA.d().randevular.find((x) => x.id === adresId);
  if (adresR) v.tarih = adresR.tarih;
  ciz();
  if (adresR) PA.randevuDetay(adresR.id);
  else if (PA.parametre('yeni')) PA.randevuAc({ danisan: PA.parametre('danisan') || undefined });
})();
