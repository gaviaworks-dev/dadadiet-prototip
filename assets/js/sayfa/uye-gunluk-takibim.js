/* Günlük Takibim: öğün işaretleri Beslenme Planım ile ortak; su ve adım demo.uye alanına yazar */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU, TU = DD.tercihUyum;
  TU.uyeBagla(U);
  const $ = (s) => document.querySelector(s);
  const u = U.uye(), dn = U.danisan(), b = U.bugun(), t = u.tercihler || {};
  const k = U.aktifKaynak();
  const ekler = () => { const e = U.yerel('gunlukEk', {}); e[b] = e[b] || []; return e[b]; };
  const ogunler = () => U.secilenOgunler(k, b);
  const ogunAd = (a) => (U.ogunTanimi.find((o) => o[0] === a) || [])[1] || a;

  const toplam = () => U.gunToplam();

  function ogunCiz() {
    U.bas('#gtBas', '<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i> ' + U.kisaTarih(b) + ' ' + U.gunAdi(b) + '</span><h2>Bugün ne yedin</h2><p class="giris-metni">Plandan farklı yediysen artıya basıp besin ekle.</p><div class="bolum-araclar"><a class="dugme hayalet" href="' + DD.kok + 'besin-kutuphanesi/">Besin kütüphanesinde ara</a></div></div></div>');
    if (!k) { U.bas('#gtOgunler', U.bos({ ikon: 'fa-utensils', baslik: 'Bugün için planın yok', metin: 'Program seçtiğinde öğünlerin burada açılır; besinlerini yine de ekleyebilirsin.', eylem: '<a class="dugme birincil" href="' + DD.kok + 'programlar/program-bul/">Program bul</a><button class="dugme hayalet" type="button" data-besin-ekle="kahvalti">Besin ekle</button>' })); $('#gtOzet').textContent = ekler().length + ' kalem kayıtlı.'; $('#gtKcal').textContent = DD.bicim.kcal(toplam().kcal); $('#gtPaylas').hidden = true; return; }
    const i = U.isaret(k, b), e = ekler();
    U.bas('#gtTercih', k.tip === 'plan' ? TU.planUyariHtml(U, k.plan) : TU.bilgiHtml(TU.ogunOzeti(ogunler())));
    if (!ogunler().length) U.bas('#gtOgunler', U.bugunBos(k));
    else U.bas('#gtOgunler', ogunler().map((o) => {
      const ek = e.filter((x) => x.ogun === o.anahtar);
      const ekMetin = ek.length ? ' Eklediğin: ' + ek.map((x) => U.kalemMetin(x)).join(', ') + '.' : '';
      const satir = U.ogunSatir({ ...o, metin: 'Planlanan: ' + o.metin + '.' + ekMetin }, U.ogunDurum(i, o));
      return satir.replace('<div class="segment"', '<button class="dugme hayalet kucuk" type="button" data-besin-ekle="' + o.anahtar + '" aria-label="' + U.kac(o.ad) + ' için besin ekle"><i class="fa-solid fa-plus" aria-hidden="true"></i></button><div class="segment"');
    }).join(''));
    const tm = toplam();
    $('#gtOzet').textContent = ogunler().filter((o) => i[o.anahtar]).length + ' / ' + ogunler().length + ' öğün tamamlandı, ' + e.length + ' ek kalem kayıtlı.';
    $('#gtKcal').textContent = DD.bicim.kcal(tm.kcal);
    /* Paylaşım izne bağlı: nedeni ekranda yazar */
    const izin = !!(dn.izinler && dn.izinler.gunluk) && !!U.diyetisyen();
    $('#gtPaylas').disabled = !izin;
    $('#gtPaylasNot').innerHTML = izin ? '' : 'Paylaşmak için <a href="' + DD.kok + 'hesabim/veri-izinlerim/">günlük takip iznini</a> aç.';
  }

  const olcer = (oran, etiket) => '<div class="olcer hap" role="img" aria-label="' + etiket + ': yüzde ' + oran + '"><span data-oran="' + Math.min(100, oran) + '"></span></div>';
  const kisaGun = (x) => U.gunAdi(x).slice(0, 3);

  function suCiz() {
    const s = u.su, oran = Math.round((s.bugun_ml / s.hedef_ml) * 100);
    $('#gtSuMetin').textContent = U.sayi(s.bugun_ml) + ' ml / ' + U.sayi(s.hedef_ml) + ' ml hedef';
    U.bas('#gtSu', olcer(oran, 'Su hedefi'));
    if (s.hafta.length) DD.grafik.cizgi($('#gtSuGrafik'), { baslik: 'Son yedi günün su alımı', etiketler: s.hafta.map((x) => kisaGun(x.tarih)), seriler: [{ ad: 'Su', degerler: s.hafta.map((x) => x.tarih === b ? s.bugun_ml : x.ml) }], hedef: s.hedef_ml });
  }
  function adimCiz() {
    const a = u.adim, oran = Math.round((a.bugun / a.hedef) * 100);
    $('#gtAdimMetin').textContent = U.sayi(a.bugun) + ' adım / ' + U.sayi(a.hedef) + ' adım hedef';
    U.bas('#gtAdim', olcer(oran, 'Adım hedefi'));
    if (a.hafta.length) DD.grafik.cizgi($('#gtAdimGrafik'), { baslik: 'Son yedi günün adımları', etiketler: a.hafta.map((x) => kisaGun(x.tarih)), seriler: [{ ad: 'Adım', degerler: a.hafta.map((x) => x.tarih === b ? a.bugun : x.adim) }], hedef: a.hedef });
  }
  function makroCiz() {
    const tm = toplam();
    const m = [['Enerji', 'kcal', t.kcal, 'kcal', 0], ['Protein', 'protein', t.protein, 'g', 0], ['Karbonhidrat', 'karb', t.karb, 'g', 0], ['Yağ', 'yag', t.yag, 'g', 0]];
    U.bas('#gtMakro', m.map((x) => { const v = tm[x[1]], o = x[2] ? Math.round((v / x[2]) * 100) : 0; return '<div><p class="alan-yardim"><span><b>' + x[0] + '</b> · ' + U.sayi(v) + ' / ' + U.sayi(x[2]) + ' ' + x[3] + ' (%' + o + ')</span></p>' + olcer(o, x[0]) + '</div>'; }).join(''));
    U.bas('#gtKalemler', tm.l.map((x) => '<tr><td><span class="no">' + U.kac(U.kalemMetin(x)) + '</span></td><td>' + ogunAd(x.ogun) + '</td><td class="tutar sag">' + DD.bicim.kcal(x.kcal) + '</td></tr>').join('') || '<tr><td colspan="3" class="bos-hucre">Bugün henüz kalem kaydedilmedi.</td></tr>');
  }
  function notCiz() {
    const l = U.yerel('gunlukNot', []).slice().reverse();
    U.bas('#gtNotlar', l.length
      ? '' + l.map((n) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-note-sticky" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.tarih(n.tarih) + ' · ' + U.kac(n.etiket) + '</b><span>' + U.kac(n.metin) + '</span></div>' + (n.paylasildi ? '<span class="as-eylem">' + U.durum('cozulen', 'Paylaşıldı') + '</span>' : '') + '</div>').join('')
      : U.bos({ ikon: 'fa-note-sticky', baslik: 'Henüz not yok', metin: 'Bugüne ilk notunu yukarıdan ekle.' }));
  }
  function ozetCiz() {
    const s = u.su, a = u.adim;
    const k1 = (i, e, d) => '<div class="sayac"><i class="fa-solid ' + i + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + d + '</b></div></div>';
    const hedefGun = s.hafta.filter((x) => x.ml >= s.hedef_ml).length;
    U.bas('#gtOrtalama', k1('fa-droplet', 'Su ortalaması', U.sayi(s.ortalama_ml) + ' ml') + k1('fa-shoe-prints', 'Adım ortalaması', U.sayi(a.ortalama)) + k1('fa-bullseye', 'Su hedefi tutan gün', hedefGun + ' / 7') + k1('fa-percent', 'Program uyumu', '%' + U.uyum(k).oran));
    U.bas('#gtHafta', s.hafta.slice().reverse().map((x, i) => {
      const y = a.hafta.slice().reverse()[i] || {}, ok = x.ml >= s.hedef_ml;
      return '<tr><td><span class="no">' + U.gunAdi(x.tarih) + '<small>' + U.kisaTarih(x.tarih) + '</small></span></td><td class="tutar sag">' + U.sayi(x.ml) + ' ml</td><td class="tutar sag">' + U.sayi(y.adim) + '</td><td>' + (ok ? U.durum('cozulen', 'Tuttu') : U.durum('bekleyen', 'Altında')) + '</td></tr>';
    }).join(''));
  }
  const ciz = () => { ogunCiz(); suCiz(); adimCiz(); makroCiz(); notCiz(); ozetCiz(); };

  /* Öğün işareti */
  document.addEventListener('dd:ogun', () => { ogunCiz(); makroCiz(); ozetCiz(); });
  /* Su */
  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-su]');
    if (s) {
      u.su.bugun_ml = Math.max(0, u.su.bugun_ml + Number(s.dataset.su));
      U.kaydet(); suCiz(); ozetCiz();
      return;
    }
    const a = e.target.closest('[data-besin-ekle]');
    if (a) { $('#gtOgunSec').value = a.dataset.besinEkle; DD.ac('#gtBesinModal'); return; }
    const o = e.target.closest('[data-besin-sec]');
    if (o) { secilen = o.dataset.besinSec; $('#gtBesin').value = o.dataset.ad; $('#gtOneri').hidden = true; }
  });
  $('#gtOgunSec').innerHTML = U.ogunTanimi.map((o) => '<option value="' + o[0] + '">' + o[1] + '</option>').join('');

  /* Besin arama: kütüphane verisinden */
  const liste = (Array.isArray(window.DD_VERI.besinler) ? window.DD_VERI.besinler : window.DD_VERI.besinler.besinler) || [];
  let secilen = '';
  $('#gtBesin').addEventListener('input', (e) => {
    secilen = '';
    const q = e.target.value.toLocaleLowerCase('tr').trim(), o = $('#gtOneri');
    const l = q ? liste.filter((x) => x.ad.toLocaleLowerCase('tr').includes(q)).slice(0, 6) : [];
    o.hidden = !l.length;
    o.innerHTML = l.map((x) => '<button class="oneri-kalem" type="button" data-besin-sec="' + x.slug + '" data-ad="' + U.kac(x.ad) + '">' + U.kac(x.ad) + '</button>').join('');
  });
  $('#gtBesinForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const x = liste.find((y) => y.slug === secilen) || liste.find((y) => y.ad.toLocaleLowerCase('tr') === $('#gtBesin').value.toLocaleLowerCase('tr').trim());
    if (!x) { DD.toast('Listeden bir besin seç.', 'hata'); return; }
    const g = Number($('#gtGram').value) || 100, oran = g / 100;
    const v = (a) => (Number(x[a]) || 0) * oran;
    ekler().push({ tur: 'besin', slug: x.slug, ad: x.ad, miktar: g, ogun: $('#gtOgunSec').value, kcal: v('kcal'), protein: v('protein'), yag: v('yag'), karb: v('karb') });
    U.kaydet(); e.target.reset(); secilen = ''; DD.kapat($('#gtBesinModal')); ciz();
    DD.toast(x.ad + ' günlüğüne eklendi.');
  });
  $('#gtAdimForm').addEventListener('submit', (e) => {
    e.preventDefault();
    u.adim.bugun += Number($('#gtAdimSayi').value) || 0;
    U.kaydet(); DD.kapat($('#gtAdimModal')); adimCiz();
    DD.toast('Adımların eklendi.');
  });
  $('#gtNotForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = $('#gtNot'), metin = n.value.trim(), p = $('#gtNotPaylas').checked;
    if (!metin) return;
    U.yerel('gunlukNot', []).push({ tarih: b, etiket: $('#gtEtiket').value, metin, paylasildi: p });
    if (p) { const s = U.sohbet(); s.mesajlar.push({ kimden: 'danisan', zaman: b + 'T' + new Date().toTimeString().slice(0, 5), metin: 'Günlük not: ' + metin }); s.okunmamis = (s.okunmamis || 0) + 1; }
    U.kaydet(); e.target.reset(); notCiz();
    DD.toast(p ? 'Notun kaydedildi ve paylaşıldı.' : 'Notun kaydedildi.');
  });
  $('#gtPaylas').addEventListener('click', () => {
    const tm = toplam(), s = U.sohbet();
    s.mesajlar.push({ kimden: 'danisan', zaman: b + 'T' + new Date().toTimeString().slice(0, 5), metin: 'Günlük özetim: ' + DD.bicim.kcal(tm.kcal) + ', ' + U.sayi(u.su.bugun_ml) + ' ml su, ' + U.sayi(u.adim.bugun) + ' adım.' });
    s.okunmamis = (s.okunmamis || 0) + 1;
    U.kaydet();
    DD.toast('Günün özeti diyetisyenine gönderildi.');
  });
  ciz();
})();
