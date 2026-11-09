/* Beslenme Planları listesi: sekme ve arama süzer; kopyala, arşivle, sil demo durumuna yazar. */
(function () {
  'use strict';
  const { $, $$, esc, sayi } = PB;
  let sekme = PB.parametre('sekme') || 'aktif', q = '';
  const planlar = () => PB.liste('planlar');
  const uyar = (p) => sekme === 'tumu' || PB.planDurum(p.durum).sekme === sekme;

  /* Durumdan türeyen sıradaki aksiyon */
  function sonraki(p, d, duzenle) {
    const k = DD.kok + 'diyetisyen-paneli/', ok = '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    if (p.durum === 'arsiv') return '<button class="sonraki-bag" type="button" data-liste="kopyala">Taslak olarak yeniden kullan ' + ok + '</button>';
    if (p.durum !== 'gonderildi') return d ? '<a class="sonraki-bag" href="' + duzenle + '&gonder=1">Danışana gönder ' + ok + '</a>' : '<a class="sonraki-bag" href="' + duzenle + '">Danışan ata ' + ok + '</a>';
    if (p.taslak) return '<a class="sonraki-bag" href="' + duzenle + '&gonder=1">Değişikliği gönder ' + ok + '</a>';
    return d ? '<a class="sonraki-bag" href="' + k + 'takvim/?yeni=1&danisan=' + d.id + '">Kontrol randevusu ' + ok + '</a>' : '';
  }
  function satir(p) {
    const d = PB.danisan(p.danisan_id), dr = PB.planDurum(p.durum), o = PB.planOzet(p), ad = esc(p.ad);
    const cakisma = d ? (p.gunler || []).flatMap((g) => Object.values(g.ogunler).flat()).filter((k) => PB.kalemUyariK(k, d).length).length : 0;
    const duzenle = DD.kok + 'diyetisyen-paneli/planlar/olustur/?plan=' + encodeURIComponent(p.id);
    return '<tr data-id="' + esc(p.id) + '">' +
      '<td><a href="' + duzenle + '"><b>' + ad + '</b></a><small>Hedef ' + sayi(p.hedef_kcal) + ' kcal · ort. ' + sayi(o.ort) + ' kcal</small><small>' + PB.gunSerit(o.durumlar) + ' ' + o.hedefte + '/' + o.durumlar.length + ' gün hedefte</small></td>' +
      '<td data-etiket="Danışan">' + (d ? '<a class="kisi-hucre" href="' + DD.kok + 'diyetisyen-paneli/danisanlar/' + d.id + '/"><span class="kisi-avatar" aria-hidden="true">' + esc(PB.basHarf(d.ad)) + '</span><span class="kisi-bilgi"><span class="kisi-ad">' + esc(d.ad) + '</span></span></a>' : '<span class="rozet pasif">Atanmadı</span>') + '</td>' +
      '<td data-etiket="Son güncelleme">' + PB.sira(p.guncelleme || p.tarih) + PB.tarihSaat(p.guncelleme || p.tarih) + '</td>' +
      '<td data-etiket="Durum"><span class="durum-hapi ' + dr.hap + '">' + dr.ad + '</span>' + (p.taslak ? ' <span class="rozet bekleme">Gönderilmemiş değişiklik</span>' : '') + (cakisma ? ' <span class="rozet durdu" title="Danışanın hassasiyetiyle çakışan kalem">' + cakisma + ' çakışma</span>' : '') + sonraki(p, d, duzenle) + '</td>' +
      '<td class="eylem"><span class="satir-eylem">' +
      '<a class="ikon-dugme" href="' + duzenle + '" aria-label="' + ad + ' düzenle"><i class="fa-solid fa-pen" aria-hidden="true"></i></a>' +
      '<button class="ikon-dugme" type="button" data-liste="kopyala" aria-label="' + ad + ' kopyala"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>' +
      '<a class="ikon-dugme" href="' + duzenle + '&yazdir=1" aria-label="' + ad + ' PDF indir"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i></a>' +
      (p.durum === 'arsiv' ? '<button class="ikon-dugme" type="button" data-liste="geri-al" aria-label="' + ad + ' arşivden çıkar"><i class="fa-solid fa-box-open" aria-hidden="true"></i></button>'
        : '<button class="ikon-dugme" type="button" data-liste="arsivle" aria-label="' + ad + ' arşivle"><i class="fa-solid fa-box-archive" aria-hidden="true"></i></button>') +
      (p.durum === 'taslak' ? '<button class="ikon-dugme yikici" type="button" data-liste="sil" aria-label="' + ad + ' sil"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>' : '') +
      '</span></td></tr>';
  }
  function sablonKart(s) {
    const g = PB.sablonGorsel(s);
    return '<article class="secenek-kart">' + (g ? '<img class="kapak" src="' + g + '" alt="" loading="lazy">' : '') + '<h3>' + esc(s.ad) + '</h3><p>' + esc(s.aciklama || '') + '</p>' +
      '<p><span class="rozet olumlu">' + sayi(s.kcal) + ' kcal/gün</span> <span class="rozet pasif">' + (s.gunler || []).length + ' gün</span>' + (s.kendi || s.ozel ? ' <span class="rozet bekleme">Kendi şablonun</span>' : '') + '</p>' +
      '<div class="alt-satir"><a class="dugme hayalet kucuk" href="' + DD.kok + 'diyetisyen-paneli/planlar/olustur/?sablon=' + encodeURIComponent(s.id) + '">Şablondan başlat</a>' +
      (s.kendi || s.ozel ? '<button class="ikon-dugme yikici" type="button" data-liste="sablon-sil" data-id="' + esc(s.id) + '" aria-label="' + esc(s.ad) + ' şablonunu sil"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>' : '') + '</div></article>';
  }
  /* Reçete kartı: değerler bir porsiyon, öğünler ve kaynak rozeti; kullanım plan kalemlerinin tarif_id'sinden */
  function receteKart(t) {
    const n = PB.receteKullanim(t.id), ad = esc(t.ad);
    return '<article class="secenek-kart" data-id="' + esc(t.id) + '"><h3>' + ad + '</h3>' +
      '<p>' + sayi(t.kcal) + ' kcal · P ' + sayi(t.protein) + ' · K ' + sayi(t.karb) + ' · Y ' + sayi(t.yag) + ' g <span class="istege-bagli">1 porsiyon</span></p>' +
      '<div class="rozet-sira">' + PB.ogunleri('recete', t).map((o) => '<span class="rozet pasif">' + PB.ogunAd(o) + '</span>').join('') +
      (t.kaynak && t.kaynak.tur === 'gastro' ? '<span class="rozet olumlu"><i class="fa-solid fa-utensils" aria-hidden="true"></i> ' + esc(t.kaynak.ad) + ' uyarlaması</span>' : '') +
      (t.ornek ? '<span class="rozet pasif">Prototip örneği</span>' : '') + '</div>' +
      ((t.malzemeler || []).length ? '<small class="kart-not">' + esc(t.malzemeler.slice(0, 4).join(', ')) + (t.malzemeler.length > 4 ? '…' : '') + '</small>' : '') +
      '<div class="alt-satir"><small class="kart-not">' + (n ? n + ' planda kullanılıyor' : 'Henüz planda yok') + '</small>' +
      '<button class="ikon-dugme yikici" type="button" data-liste="recete-sil" data-id="' + esc(t.id) + '" aria-label="' + ad + ' reçetesini sil"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button></div></article>';
  }
  function ciz() {
    const sb = sekme === 'sablon', rc = sekme === 'recete', kart = sb || rc, ql = PB.kucuk(q);
    const eslesir = (metin) => PB.kucuk(metin).includes(ql);
    const liste = sb ? PB.liste('sablonlar').filter((s) => eslesir(s.ad)).sort((a, b) => (b.kendi || b.ozel ? 1 : 0) - (a.kendi || a.ozel ? 1 : 0))
      : rc ? PB.tariflerim().filter((t) => eslesir(t.ad))
      : planlar().filter(uyar).filter((p) => { const d = PB.danisan(p.danisan_id); return eslesir(p.ad) || (d && eslesir(d.ad)); });
    $('#tabloGovde').hidden = kart || !liste.length;
    $('#sablonGovde').hidden = !sb || !liste.length;
    $('#receteGovde').hidden = !rc || !liste.length;
    $('#planBos').hidden = liste.length > 0;
    if (sb) $('#sablonKartlar').innerHTML = liste.map(sablonKart).join('');
    else if (rc) $('#receteKartlar').innerHTML = liste.map(receteKart).join('');
    else $('#planSatirlar').innerHTML = liste.map(satir).join('');
    $('#planSayac').textContent = liste.length;
    $('#planBosBaslik').textContent = q ? 'Aramayla eşleşen kayıt yok' : sb ? 'Henüz şablon yok' : rc ? 'Henüz reçeten yok' : 'Bu sekmede plan yok';
    $('#planBosMetin').textContent = q ? 'Aramayı değiştir ya da başka bir sekmeye bak.' : rc ? 'Plan oluşturucuda bir öğüne eklerken Yeni Tarif ile reçete yazabilir ya da Dada Gastro tarifinden uyarlayabilirsin.' : 'Yeni plan oluşturabilir, plan oluşturucudan şablon kaydedebilirsin.';
    $('#planAra').placeholder = rc ? 'Reçete adı ara' : 'Plan ya da danışan adı ara';
    const say = { tumu: planlar().length, sablon: PB.liste('sablonlar').length, recete: PB.tariflerim().length };
    ['aktif', 'taslak', 'arsiv'].forEach((k) => { say[k] = planlar().filter((p) => PB.planDurum(p.durum).sekme === k).length; });
    $$('[data-say]').forEach((e) => { e.textContent = say[e.dataset.say]; });
  }
  function kopyala(p) {
    const y = JSON.parse(JSON.stringify(p));
    Object.assign(y, p.taslak ? JSON.parse(JSON.stringify(p.taslak)) : {}, { id: PB.yeniId('pl'), ad: p.ad + ' (kopya)', durum: 'taslak', tarih: DD.bugun, guncelleme: PB.simdi(), surum: 0, gonderim: null });
    delete y.taslak;
    planlar().unshift(y);
    PB.kaydet();
    DD.toast('“' + y.ad + '” taslaklara eklendi.');
    ciz();
  }
  document.addEventListener('click', function (e) {
    const s = e.target.closest('#planSekmeler [data-sekme]');
    if (s) { sekme = s.dataset.sekme; history.replaceState(null, '', '?sekme=' + sekme); ciz(); return; }
    const d = e.target.closest('[data-liste]');
    if (!d) return;
    const tr = d.closest('tr'), p = tr && planlar().find((x) => x.id === tr.dataset.id);
    switch (d.dataset.liste) {
      case 'kopyala': kopyala(p); break;
      case 'arsivle':
        window.DM_ONAY('Plan arşivlensin mi?', '“' + p.ad + '” arşive taşınır, danışan artık görmez.', 'Arşivle', (ok) => {
          if (!ok) return; p.durum = 'arsiv'; p.guncelleme = PB.simdi(); PB.kaydet(); DD.toast('Plan arşive taşındı.'); ciz();
        });
        break;
      case 'geri-al': p.durum = 'taslak'; p.guncelleme = PB.simdi(); PB.kaydet(); DD.toast('Plan taslaklara döndü.'); ciz(); break;
      case 'sil':
        window.DM_ONAY('Taslak silinsin mi?', '“' + p.ad + '” kalıcı olarak silinir.', 'Sil', (ok) => {
          if (!ok) return; planlar().splice(planlar().indexOf(p), 1); PB.kaydet(); DD.toast('Taslak silindi.'); ciz();
        });
        break;
      case 'recete-sil': {
        const l = PB.tariflerim(), i = l.findIndex((x) => x.id === d.dataset.id);
        window.DM_ONAY('Reçete silinsin mi?', '“' + l[i].ad + '” Reçetelerim listenden kalkar. Planlara eklenmiş kopyalar yerinde kalır.', 'Sil', (ok) => {
          if (!ok) return; l.splice(i, 1); PB.kaydet(); DD.toast('Reçete silindi.'); ciz();
        });
        break;
      }
      case 'sablon-sil': {
        const l = PB.liste('sablonlar'), i = l.findIndex((x) => x.id === d.dataset.id);
        window.DM_ONAY('Şablon silinsin mi?', '“' + l[i].ad + '” şablonlardan kalkar.', 'Sil', (ok) => {
          if (!ok) return; l.splice(i, 1); PB.kaydet(); DD.toast('Şablon silindi.'); ciz();
        });
        break;
      }
    }
  });
  $('#planAra').addEventListener('input', function () { q = this.value.trim(); ciz(); });
  const t = document.getElementById('t-' + sekme);
  if (t) t.click(); else sekme = 'aktif';
  ciz();
})();
