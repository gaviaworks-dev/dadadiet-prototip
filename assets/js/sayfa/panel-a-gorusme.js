/* Görüşme: ilk görüşmede anamnez, her görüşmede ölçüm ve özet. Bitince danışan kartı dolar. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const $ = (id) => document.getElementById(id);
  const r = PA.d().randevular.find((x) => x.id === PA.parametre('randevu'));
  const dn = r && PA.danisan(r.danisan_id);
  const uygun = r && dn && PA.rDurum(r) === 'dolu';

  const alan = (id, etiket, deger, tip) => `<div class="alan"><label class="alan-etiket" for="${id}">${etiket}</label>${tip === 'uzun' ? `<textarea class="alan-metin" id="${id}" rows="3">${h(deger || '')}</textarea>` : `<input class="alan-girdi" id="${id}" type="text" value="${h(deger || '')}" autocomplete="off">`}</div>`;
  const sayiAlan = (id, etiket) => `<div class="alan"><label class="alan-etiket" for="${id}">${etiket}</label><input class="alan-girdi" id="${id}" type="number" step="0.1" inputmode="decimal" autocomplete="off"></div>`;
  const satir = (ikon, e, d) => `<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><span class="as-metin"><span>${e}</span><b>${d}</b></span></div>`;

  function yanKart() {
    const p = PA.paket(r.paket_id), i = PA.ilerleme(dn);
    const notlar = [...(dn.klinik_notlar || [])].sort((a, b) => b.tarih.localeCompare(a.tarih)).slice(0, 2);
    return `<aside class="form-yan"><div class="kart panel"><div class="kart-govde"><div class="kunye-kimlik">${PA.avatar(dn.ad)}<div><h2>${h(dn.ad)}</h2>${PA.danisanHap(dn)}</div></div><div class="ayar-liste">${satir(PA.rIkon(r), 'Görüşme', DD.bicim.saat(r.saat) + ' · ' + PA.rTur(r) + ' · ' + r.sure + ' dk')}${satir('fa-bullseye', 'Hedef', h(dn.hedef))}${satir('fa-weight-scale', 'Güncel kilo', i ? PA.sayi(i.son) + ' kg' : 'İzin yok')}${satir('fa-box-open', 'Paket', p ? h(p.ad) + ' · ' + PA.kalanSeans(dn) + '/' + p.seans : '—')}</div>${r.baglanti ? `<div class="kunye-eylem"><a class="dugme hayalet kucuk tam-en" href="${h(r.baglanti)}" target="_blank" rel="noopener"><i class="fa-solid fa-video" aria-hidden="true"></i> Görüşme bağını aç</a></div>` : ''}</div></div>${notlar.length ? `<div class="kart panel"><div class="kart-bas"><h2 class="kart-baslik"><i class="fa-solid fa-note-sticky" aria-hidden="true"></i> Son notlar</h2></div><div class="kart-govde"><div class="ayar-liste">${notlar.map((n) => `<div class="ayar-satir"><span class="as-metin"><b>${PA.tarih(n.tarih)}</b><span>${h(n.metin)}</span></span></div>`).join('')}</div></div></div>` : ''}</aside>`;
  }
  function formCiz() {
    const ilk = !PA.d().randevular.some((x) => x.danisan_id === dn.id && PA.rDurum(x) === 'tamamlandi');
    const eksik = PA.anamnezEksik(dn).length > 0, a = dn.anamnez || {};
    $('gBaslik').textContent = (ilk ? 'İlk görüşme: ' : 'Kontrol görüşmesi: ') + dn.ad;
    $('gAlt').textContent = PA.uzunTarih(r.tarih) + ' · ' + DD.bicim.saat(r.saat) + ' · ' + PA.rTur(r);
    $('gUst').innerHTML = `<a class="dugme hayalet" href="${PA.yol.danisan(dn.id)}"><i class="fa-solid fa-id-card" aria-hidden="true"></i> Danışan kartı</a>`;
    const anamnez = eksik ? `<div class="form-bolum"><h3 class="form-bolum-bas"><i class="fa-solid fa-notes-medical" aria-hidden="true"></i> Anamnez</h3><div class="alan-izgara c2">${alan('aMeslek', 'Meslek', a.meslek)}${alan('aUyku', 'Uyku', a.uyku)}${alan('aSu', 'Su tüketimi', a.su)}${alan('aHareket', 'Hareket', a.hareket)}</div>${alan('aSikayet', 'Şikâyet', a.sikayet, 'uzun')}<div class="alan-izgara c2">${alan('aIlac', 'İlaç ve takviye (virgülle)', (a.ilaclar || []).join(', '))}${alan('aAile', 'Aile öyküsü', a.aile_oykusu)}</div>${alan('aAliskanlik', 'Alışkanlıklar', a.aliskanliklar, 'uzun')}</div>` : '';
    const olcum = dn.izinler.olcum
      ? `<div class="form-bolum"><h3 class="form-bolum-bas"><i class="fa-solid fa-weight-scale" aria-hidden="true"></i> Ölçüm</h3><div class="alan-izgara c3">${sayiAlan('oKilo', 'Kilo (kg)')}${sayiAlan('oBel', 'Bel (cm)')}${sayiAlan('oYag', 'Yağ oranı (%)')}</div></div>`
      : `<div class="form-bolum"><h3 class="form-bolum-bas"><i class="fa-solid fa-lock" aria-hidden="true"></i> Ölçüm</h3><div class="bilgi-notu"><i class="fa-solid fa-key" aria-hidden="true"></i><p>${h(PA.ilkAd(dn.ad))} ölçüm verisini paylaşmıyor. ${(dn.izin_talepleri || {}).olcum ? 'İzin isteği gönderildi.' : 'Görüşmeden sonra izin isteyebilirsin.'}</p></div></div>`;
    $('gGovde').innerHTML = `<form class="form-duzen" id="gForm" novalidate><div class="kart panel">${anamnez}${olcum}<div class="form-bolum"><h3 class="form-bolum-bas"><i class="fa-solid fa-pen" aria-hidden="true"></i> Görüşme özeti</h3><div class="alan"><label class="alan-etiket" for="gOzet">Özet <span class="zorunlu" aria-hidden="true">*</span></label><textarea class="alan-metin" id="gOzet" rows="5" required></textarea></div><div class="ayar-liste"><label class="ayar-satir"><span class="as-metin"><b>Danışanla paylaş</b><span>Özet üyenin Sağlık Dosyam ekranında görünür.</span></span><span class="as-eylem"><span class="anahtar"><input type="checkbox" id="gPaylas" aria-label="Danışanla paylaş"><span class="anahtar-ray"></span></span></span></label></div></div><div class="kart-alt form-eylem"><span class="not">Görüşme <b>${DD.bicim.saat(r.saat)}</b> randevusuna yazılır.</span><div class="eylem-satiri"><button class="dugme hayalet" type="button" id="gGelmedi">Gelmedi</button><button class="dugme birincil" type="submit"><i class="fa-solid fa-check" aria-hidden="true"></i> Görüşmeyi bitir</button></div></div></div>${yanKart()}</form>`;
    if (window.DM_EYLEM_CUBUGU) window.DM_EYLEM_CUBUGU();
    $('gForm').addEventListener('submit', bitir);
    $('gGelmedi').addEventListener('click', () => { r.durum = 'gelmedi'; PA.kazancTazele(); PA.uyeRandevuTazele(); PA.kaydet(); DD.toast('Gelmedi olarak işaretlendi.'); bitti(false); });
  }
  const deger = (id) => { const e = $(id); return e ? e.value.trim() : ''; };
  function bitir(e) {
    e.preventDefault();
    if (!PA.formGecerli($('gForm'))) return;
    if ($('aMeslek')) {
      /* Üyenin doldurduğu alanlar forma gelir; görüşmede tamamlanan hâl kayda geçer */
      dn.anamnez = Object.assign(dn.anamnez || {}, { meslek: deger('aMeslek'), sikayet: deger('aSikayet'), uyku: deger('aUyku'), su: deger('aSu'), hareket: deger('aHareket'), ilaclar: deger('aIlac').split(',').map((x) => x.trim()).filter(Boolean), aile_oykusu: deger('aAile'), aliskanliklar: deger('aAliskanlik') });
      dn.anamnez_kaynak = 'gorusme';
      if (!PA.anamnezEksik(dn).length) delete dn.anamnez_hatirlatma;
    }
    if ($('oKilo') && deger('oKilo')) {
      const son = dn.olcumler[dn.olcumler.length - 1], n = (id) => (deger(id) === '' ? null : Number(deger(id)));
      dn.olcumler.push({ hafta: son ? son.hafta + 1 : 1, tarih: DD.bugun, kilo: n('oKilo'), bel: n('oBel'), yag_orani: n('oYag') });
      dn.kilo = n('oKilo');
    }
    const ozet = deger('gOzet');
    if (r.tarih > DD.bugun) { (r.gecmis = r.gecmis || []).push({ tarih: r.tarih, saat: r.saat }); r.tarih = DD.bugun; }
    r.durum = 'tamamlandi'; r.ozet = ozet;
    dn.son_gorusme = DD.bugun; dn.yeni = false;
    dn.klinik_notlar.push({ tarih: DD.bugun, metin: ozet, paylasildi: $('gPaylas').checked });
    PA.kazancTazele();
    PA.uyeRandevuTazele();
    PA.kaydet();
    DD.toast('Görüşme kaydedildi.');
    bitti(true);
  }
  function bitti(tamam) {
    $('gBaslik').textContent = tamam ? 'Görüşme tamamlandı' : 'Görüşme gerçekleşmedi';
    $('gAlt').textContent = dn.ad + ' · ' + PA.uzunTarih(r.tarih);
    $('gGovde').innerHTML = `<div class="kart panel"><div class="kart-govde">${tamam ? PA.siradaBlok(dn) : `<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-user-slash" aria-hidden="true"></i></span><h3>${h(PA.ilkAd(dn.ad))} gelmedi</h3><p>Seans hakkından düştü. Yeni bir görüşme planlayabilirsin.</p><button class="dugme hayalet" type="button" data-randevu-ac data-danisan="${dn.id}">Yeni randevu oluştur</button></div>`}</div></div>`;
  }

  if (uygun) formCiz();
  else {
    $('gBaslik').textContent = 'Görüşme açılamadı';
    $('gGovde').innerHTML = `<div class="kart panel"><div class="kart-govde"><div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-calendar-xmark" aria-hidden="true"></i></span><h3>Bu randevu görüşmeye uygun değil</h3><p>Görüşme planlı randevulardan başlatılır.</p><a class="dugme hayalet" href="${PA.yol.takvim}">Takvime dön</a></div></div></div>`;
  }
})();
