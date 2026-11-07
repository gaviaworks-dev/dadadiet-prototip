/* Sağlık Dosyam: ölçüm ve tahliller d1 kaydıdır; yeni kayıt panele yansır */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const dn = U.danisan(), b = U.bugun();
  const pf = $('#sdProfilForm');
  const satir = (i, ba, m, sag) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + i + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(ba) + '</b><span>' + U.kac(m) + '</span></div>' + (sag ? '<span class="as-eylem">' + sag + '</span>' : '') + '</div>';
  const olcumler = () => dn.olcumler || [];
  const bki = (k) => (dn.boy ? k / Math.pow(dn.boy / 100, 2) : 0);
  const belgeler = () => U.yerel('saglikBelge', []);

  function profil() {
    const an = dn.anamnez || {};
    ['boy', 'kilo', 'hedef_kilo', 'hedef'].forEach((k) => { pf.elements[k].value = dn[k] ?? ''; });
    const s = olcumler()[olcumler().length - 1];
    $('#sdSon').textContent = s ? 'Son güncelleme: ' + U.tarih(s.tarih) : 'Henüz ölçüm yok';
    const yok = 'Kayıtlı değil.';
    U.bas('#sdDikkat', [
      satir('fa-wheat-awn-circle-exclamation', 'Besin alerjileri ve hassasiyetler', (dn.hassasiyetler || []).map(U.basHarf).join(', ') || yok),
      satir('fa-pills', 'Düzenli kullanılan ilaç veya takviye', (an.ilaclar || []).join(', ') || yok),
      satir('fa-stethoscope', 'Bilinen kronik rahatsızlık', (dn.kronik || []).join(', ') || yok),
    ].join(''));
    const k = [['Yaş', dn.yas]].concat(U.ANAMNEZ.map(([a, e]) => [e, an[a]])).filter((x) => x[1]);
    const eksik = U.anamnezEksik().length;
    $('#sdAnamnezOzet').textContent = eksik ? eksik + ' alan eksik. Yarıda bırakabilirsin, kaldığın yerden devam edersin.' : 'Diyetisyeninle paylaştığın anamnez özeti.';
    $('#sdAnamnezDugme').textContent = eksik ? 'Tamamla' : 'Düzenle';
    U.bas('#sdAnamnez', k.length ? k.map((x) => '<div><dt>' + x[0] + '</dt><dd>' + U.kac(x[1]) + '</dd></div>').join('') : '');
  }

  function olcum() {
    const l = olcumler(), s = l[l.length - 1];
    U.sayac('olcum', l.length);
    if (!s) return;
    const i = l[0], k1 = (ic, e, d) => '<div class="sayac"><i class="fa-solid ' + ic + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + d + '</b></div></div>';
    $('#sdOlcumTarih').textContent = U.tarih(s.tarih);
    U.bas('#sdOlcumOzet', k1('fa-weight-scale', 'Kilo', U.sayi(s.kilo, 1) + ' kg') + k1('fa-calculator', 'BKİ', U.sayi(bki(s.kilo), 1)) + k1('fa-ruler-horizontal', 'Bel', U.sayi(s.bel, 1) + ' cm') + k1('fa-arrow-trend-down', 'Başlangıçtan fark', U.sayi(s.kilo - i.kilo, 1) + ' kg'));
    DD.grafik.cizgi($('#sdGrafik'), { baslik: 'Kilo seyri', etiketler: l.map((o) => U.noktaliTarih(o.tarih).slice(0, 5)), seriler: [{ ad: 'Kilo', degerler: l.map((o) => o.kilo) }], hedef: dn.hedef_kilo, basamak: 1 });
    U.bas('#sdOlcumler', l.slice().reverse().map((o) => '<tr><td class="tarih">' + U.noktaliTarih(o.tarih) + '</td><td class="tutar sag">' + U.sayi(o.kilo, 1) + ' kg</td><td class="tutar sag">' + U.sayi(bki(o.kilo), 1) + '</td><td class="tutar sag">' + (o.bel ? U.sayi(o.bel, 1) + ' cm' : '—') + '</td><td class="tutar sag">' + (o.yag_orani ? '%' + U.sayi(o.yag_orani, 1) : '—') + '</td></tr>').join(''));
  }

  function tahlil() {
    const l = (dn.tahliller || []).slice().reverse();
    U.sayac('tahlil', l.length);
    /* Tahlil yüklendiyse sıradaki adım izin: diyetisyen izinsiz göremez */
    const izin = !!(dn.izinler || {}).tahlil;
    const ist = dn.tahlil_istegi;
    U.bas('#sdTahlilIstek', ist ? '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-flask-vial" aria-hidden="true"></i> Diyetisyenin tahlil istedi</h3><p>' + U.tarih(ist.tarih) + (ist.not ? ' · ' + U.kac(ist.not) : '') + '</p></div><div class="as-eylem"><button class="dugme birincil" type="button" data-ac="#sdBelgeModal">Tahlil yükle</button></div></div></div>' : '');
    U.bas('#sdIzinNot', !l.length || !U.diyetisyen() ? '' : izin
      ? '<div class="bilgi-notu"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><p><b>Diyetisyenin tahlillerini görebiliyor.</b> Değerlendirmesi Diyetisyen Notları sekmesine düşer.</p></div>'
      : '<div class="uyari-kutu"><i class="fa-solid fa-user-shield" aria-hidden="true"></i><span><b>Tahlillerin paylaşılmıyor.</b> Diyetisyeninin görebilmesi için izin ver. <a href="' + DD.kok + 'hesabim/veri-izinlerim/">Veri İzinlerim</a></span></div>');
    U.bas('#sdTahliller', l.map((t) => '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i> ' + U.kac(t.dosya_adi) + '</h3><p>' + U.tarih(t.tarih) + ' · ' + (t.degerler || []).length + ' değer</p></div></div>' + ((t.degerler || []).length ? '<div class="kart-govde bosluksuz">' + DD.tahlilDeger.liste(t.degerler) + '</div>' : '<div class="kart-govde"><p class="alan-yardim"><span>Bu belgenin değerleri henüz okunmadı.</span></p></div>') + '</div>').join('') || U.bos({ ikon: 'fa-flask-vial', baslik: 'Henüz tahlil yok', metin: 'Tahlil belgeni yüklediğinde değerlerin burada görünür.', eylem: '<button class="dugme birincil" type="button" data-ac="#sdBelgeModal">Belge yükle</button>' }));
  }

  function notlar() {
    const l = (dn.klinik_notlar || []).filter((x) => x.paylasildi).slice().reverse();
    U.sayac('not', l.length);
    U.bas('#sdNotlar', l.map((x) => satir('fa-comment-medical', U.tarih(x.tarih), x.metin)).join('') || U.bos({ ikon: 'fa-comment-medical', baslik: 'Paylaşılan not yok', metin: U.diyetisyen() ? 'Diyetisyenin seninle bir değerlendirme paylaştığında burada görünür.' : 'Bir diyetisyenle çalıştığında değerlendirmeleri burada görünür.', eylem: U.diyetisyen() ? U.bag('Diyetisyenim', 'hesabim/diyetisyenim/', 'hayalet') : U.bag('Diyetisyen bul', 'diyetisyen-bul-sihirbazi/') }));
  }

  function belge() {
    const an = dn.anamnez || {};
    U.bas('#sdIlaclar', (an.ilaclar || []).map((i) => satir('fa-pills', i, 'Sağlık öykünde kayıtlı')).join('') || U.bos({ ikon: 'fa-pills', baslik: 'Kayıt yok', metin: 'Düzenli kullandığın ilaç veya takviye kayıtlı değil.' }));
    const l = belgeler().slice().reverse();
    U.bas('#sdBelgeler', l.map((d, i) => satir('fa-file-lines', d.ad, d.tur + ' · ' + U.tarih(d.tarih), '<button class="dugme hayalet tehlike kucuk" type="button" data-belge-sil="' + (belgeler().length - 1 - i) + '">Kaldır</button>')).join('') || U.bos({ ikon: 'fa-folder-open', baslik: 'Henüz belge yok', metin: 'Reçete ya da raporlarını buraya yükleyebilirsin.', eylem: '<button class="dugme birincil" type="button" data-ac="#sdBelgeModal">Belge yükle</button>' }));
  }

  function hesaplar() {
    const s = olcumler()[olcumler().length - 1], t = (U.uye().tercihler || {});
    const l = (U.uye().hesaplayici_sonuclari || []).slice().reverse().map((h) => satir('fa-fire', 'Günlük kalori', DD.bicim.kcal(h.hedef || h.kcal || h.tdee || 0) + (h.tarih ? ' · ' + U.tarih(h.tarih) : ''), '<a class="dugme hayalet kucuk" href="' + DD.kok + 'hesaplayicilar/">Yeniden hesapla</a>'));
    if (s) l.push(satir('fa-calculator', 'Beden Kitle İndeksi', U.sayi(bki(s.kilo), 1) + ' · ' + U.tarih(s.tarih), '<a class="dugme hayalet kucuk" href="' + DD.kok + 'hesaplayicilar/">Yeniden hesapla</a>'));
    if (t.kcal) l.push(satir('fa-fire', 'Günlük enerji hedefi', DD.bicim.kcal(t.kcal) + ' · ' + t.protein + ' g protein, ' + t.karb + ' g karbonhidrat, ' + t.yag + ' g yağ', '<a class="dugme hayalet kucuk" href="' + DD.kok + 'hesaplayicilar/">Yeniden hesapla</a>'));
    U.bas('#sdHesaplar', l.join('') || U.bos({ ikon: 'fa-calculator', baslik: 'Henüz hesap yok', metin: 'Hesaplayıcıları kullandığında sonuçların burada listelenir.', eylem: U.bag('Hesaplayıcılara git', 'hesaplayicilar/') }));
    const tl = (U.uye().test_sonuclari || []).slice().reverse();
    U.bas('#sdTestler', tl.map((t) => satir('fa-clipboard-check', t.sonuc || t.test, U.tarih(t.tarih) + ' · ' + t.puan + ' puan', '<a class="dugme hayalet kucuk" href="' + DD.kok + 'saglik-testleri/' + t.test + '/">Yeniden çöz</a>')).join('') || U.bos({ ikon: 'fa-clipboard-question', baslik: 'Henüz test çözmedin', metin: 'Bir sağlık testi çözdüğünde sonucun burada saklanır.', eylem: U.bag('Teste başla', 'saglik-testleri/') }));
  }

  function raporlar() {
    const l = U.yerel('gelisimRapor', []).slice().reverse();
    U.bas('#sdRaporlar', l.map((r) => satir('fa-file-lines', r.ad, U.tarih(r.bas) + ' – ' + U.tarih(r.bit) + ' · ' + r.ozet, '<button class="dugme hayalet kucuk" type="button" data-yazdir>Yazdır</button>')).join('') || U.bos({ ikon: 'fa-chart-column', baslik: 'Henüz rapor yok', metin: 'Yukarıdan bir dönem seçip ilk raporunu oluştur.' }));
  }
  const ciz = () => { profil(); olcum(); tahlil(); notlar(); belge(); hesaplar(); raporlar(); };

  pf.addEventListener('submit', (e) => {
    e.preventDefault();
    dn.boy = Number(pf.elements.boy.value) || dn.boy;
    dn.kilo = Number(pf.elements.kilo.value) || dn.kilo;
    dn.hedef_kilo = Number(pf.elements.hedef_kilo.value) || dn.hedef_kilo;
    dn.hedef = pf.elements.hedef.value.trim();
    U.kaydet(); ciz();
    DD.toast('Sağlık profilin güncellendi.');
  });
  /* Anamnez: dolu alanlar yazılır, boşlar eksik kalır; panel aynı kaydı okur */
  const af = $('#sdAnamnezForm');
  $('#sdAnamnezDugme').addEventListener('click', () => { U.ANAMNEZ.forEach(([a]) => { af.elements[a].value = (dn.anamnez || {})[a] || ''; }); DD.ac('#sdAnamnezModal'); });
  af.addEventListener('submit', (e) => {
    e.preventDefault();
    dn.anamnez = dn.anamnez || {};
    U.ANAMNEZ.forEach(([a]) => { const v = af.elements[a].value.trim(); if (v) dn.anamnez[a] = v; else delete dn.anamnez[a]; });
    if (!U.anamnezEksik().length) delete dn.anamnez_hatirlatma;
    U.kaydet(); DD.kapat($('#sdAnamnezModal')); profil();
    DD.toast(U.anamnezEksik().length ? 'Kaydedildi; kalan alanlara sonra dönebilirsin.' : 'Sağlık öykün tamamlandı.');
  });
  $('#sdGeri').addEventListener('click', () => { profil(); DD.toast('Değişiklikler geri alındı.'); });
  $('#sdOlcumForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target.elements, s = olcumler()[olcumler().length - 1] || {};
    const kilo = Number(f.oKilo.value);
    olcumler().push({ hafta: (s.hafta || 0) + 1, tarih: b, kilo, bel: Number(f.oBel.value) || s.bel, yag_orani: Number(f.oYag.value) || s.yag_orani });
    dn.kilo = kilo;
    U.kaydet(); e.target.reset(); DD.kapat($('#sdOlcumModal')); ciz();
    DD.toast('Ölçümün kaydedildi.');
  });
  $('#sdOlcumIndir').addEventListener('click', () => {
    const csv = 'tarih;kilo;bel;yag_orani\n' + olcumler().map((o) => [o.tarih, o.kilo, o.bel, o.yag_orani].join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'olcumlerim.csv';
    a.click();
    DD.toast('Ölçümlerin indirildi.');
  });
  $('#sdBelgeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = $('#bDosya').files[0], tur = e.target.elements.bTur.value;
    if (!d) return;
    if (tur === 'Tahlil') { dn.tahliller = dn.tahliller || []; dn.tahliller.push({ tarih: b, dosya_adi: d.name, degerler: [], yukleyen: 'uye' }); delete dn.tahlil_istegi; } else belgeler().push({ ad: d.name, tur, tarih: b });
    U.kaydet(); e.target.reset(); DD.kapat($('#sdBelgeModal')); ciz();
    DD.toast(tur === 'Tahlil' && !(dn.izinler || {}).tahlil ? 'Tahlilin yüklendi. Diyetisyenin görebilmesi için izin ver.' : 'Belgen yüklendi.');
    if (tur === 'Tahlil') U.sekmeAc('tahlil');
  });
  document.addEventListener('click', (e) => {
    const s = e.target.closest('[data-belge-sil]');
    if (s) { belgeler().splice(Number(s.dataset.belgeSil), 1); U.kaydet(); belge(); DD.toast('Belge kaldırıldı.', 'uyari'); return; }
    if (e.target.closest('[data-yazdir]')) window.print();
  });
  const rf = $('#sdRaporForm');
  rf.elements.rBas.value = (olcumler()[0] || {}).tarih || b;
  rf.elements.rBit.value = b;
  rf.addEventListener('submit', (e) => {
    e.preventDefault();
    const a = rf.elements.rBas.value, z = rf.elements.rBit.value;
    if (a > z) { DD.toast('Başlangıç bitişten sonra olamaz.', 'hata'); return; }
    const l = olcumler().filter((o) => o.tarih >= a && o.tarih <= z);
    const ozet = l.length > 1 ? U.sayi(l[l.length - 1].kilo - l[0].kilo, 1) + ' kg değişim, ' + l.length + ' ölçüm' : l.length + ' ölçüm';
    U.yerel('gelisimRapor', []).push({ ad: rf.elements.rAd.value.trim(), bas: a, bit: z, ozet });
    U.kaydet(); raporlar();
    DD.toast('Gelişim raporun oluşturuldu.');
  });
  ciz();
})();
