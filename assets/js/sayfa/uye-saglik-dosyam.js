/* Sağlık Dosyam: ölçüm ve tahliller d1 kaydıdır; yeni kayıt panele yansır */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const dn = U.danisan(), b = U.bugun(), duyarli = U.yemeDuyarli();
  const pf = $('#sdProfilForm');
  /* #pageMain kendi katmanını kurduğu için içindeki pencere üst menünün altında kalıyor; pencereler gövdeye taşınır */
  document.querySelectorAll('#pageMain > .modal-ortu').forEach((m) => document.body.appendChild(m));
  const satir = (i, ba, m, sag) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ' + i + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.kac(ba) + '</b><span>' + U.kac(m) + '</span></div>' + (sag ? '<span class="as-eylem">' + sag + '</span>' : '') + '</div>';
  const olcumler = () => dn.olcumler || [];
  const bki = (k) => (dn.boy ? k / Math.pow(dn.boy / 100, 2) : 0);
  const belgeler = () => U.yerel('saglikBelge', []);
  /* Demonun örnek belgesi listeye bir kez girer; üye kaldırırsa geri gelmez */
  if (!U.bosKip && !U.yerel('saglikBelgeTohum', false)) { belgeler().push(...(dn.ornek_belgeler || [])); U.d().uyeYerel.saglikBelgeTohum = true; }
  /* Yüklenen dosya bu tarayıcının IndexedDB'sinde (belge-kasa.js) saklanır; yenilemeden sonra önizleme ve indirme çalışır.
     Depo açılamazsa dosya yalnız bu oturumda bellekte kalır. */
  const kasa = DD.belgeKasa, dosyalar = new Map(), dosyaAnahtar = kasa.anahtar;
  kasa.yukle(dosyalar);
  /* Referans ve durum üyenin cinsiyetine göre (varsayılan tablodaki hemoglobin eşiği) */
  const T = DD.tahlilDeger.kisi({ cinsiyet: dn.cinsiyet });
  const tahlilListe = () => (dn.tahliller || []).slice().reverse();
  /* Yeni yüklenen belgenin değerleri henüz okunmamış olabilir; özet değer taşıyan son tahlile bakar */
  const degerli = () => tahlilListe().filter((t) => (t.degerler || []).length);
  const tahlilSay = (t) => ({ disi: t.degerler.filter(T.disi).length, normal: t.degerler.filter((d) => T.durum(d) === 'normal').length });
  const kutu = ({ ikon, etiket, deger, alt, ek = '' }) => '<button class="veri-kutu" type="button"' + ek + '><span class="vk-bas"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i>' + etiket + '</span><b class="vk-deger">' + deger + '</b><span class="vk-alt">' + alt + '</span></button>';
  /* Ölçüm kutuları grafiğin seçicisidir; fark birimi yağ oranında yüzde değil puandır */
  const METRIK = {
    kilo: { ad: 'Kilo', ikon: 'fa-weight-scale', oku: (o) => o.kilo, yaz: (v) => U.sayi(v, 1) + ' kg', fark: ' kg' },
    bki: { ad: 'BKİ', ikon: 'fa-calculator', oku: (o) => (o.kilo ? bki(o.kilo) : null), yaz: (v) => U.sayi(v, 1), fark: '' },
    bel: { ad: 'Bel', ikon: 'fa-ruler-horizontal', oku: (o) => o.bel, yaz: (v) => U.sayi(v, 1) + ' cm', fark: ' cm' },
    yag: { ad: 'Yağ Oranı', ikon: 'fa-droplet', oku: (o) => o.yag_orani, yaz: (v) => '%' + U.sayi(v, 1), fark: ' puan' },
  };
  const ACIK_SATIR = 6;
  const kg = (v) => U.sayi(v, v % 1 ? 1 : 0) + ' kg';
  let metrik = 'kilo', donem = 0, hepsi = false;

  function ozet() {
    const l = olcumler(), s = l[l.length - 1], t = degerli()[0], say = t ? tahlilSay(t) : null, eksik = U.anamnezEksik().length, bn = belgeSay();
    U.bas('#sdOzetKutular', [
      kutu({ ikon: 'fa-weight-scale', etiket: duyarli ? 'Ölçümlerim' : 'Son Ölçüm', deger: !s ? 'Kayıt yok' : duyarli ? l.length + ' kayıt' : U.sayi(s.kilo, 1) + ' kg', alt: !s ? 'İlk ölçümünü ekle' : duyarli ? 'Dilediğinde açabilirsin' : U.tarih(s.tarih), ek: ' data-sekme-git="olcum"' }),
      kutu({ ikon: 'fa-flask-vial', etiket: 'Son Tahlil', deger: !t ? 'Kayıt yok' : say.disi ? say.disi + ' referans dışı' : 'Referans içinde', alt: t ? t.degerler.length + ' değer · ' + U.tarih(t.tarih) : 'Tahlil belgeni yükle', ek: ' data-sekme-git="tahlil"' }),
      kutu({ ikon: 'fa-file-prescription', etiket: 'Belgeler', deger: bn ? bn + ' belge' : 'Kayıt yok', alt: 'Reçete ve tahlil dosyaların', ek: ' data-sekme-git="recete"' }),
      kutu({ ikon: 'fa-notes-medical', etiket: 'Sağlık Öykün', deger: eksik ? eksik + ' alan eksik' : 'Tamamlandı', alt: eksik ? 'Kaldığın yerden devam et' : 'Profilim’de güncelleyebilirsin', ek: ' data-sekme-git="profil"' }),
    ].join(''));
    const disi = t ? t.degerler.filter(T.disi) : [];
    $('#sdTakipMetin').textContent = t ? 'Son tahlilin: ' + U.tarih(t.tarih) : 'Tahlil yüklediğinde burada görünür.';
    U.bas('#sdTakip', disi.length ? T.liste(disi, { onceki: (degerli()[1] || {}).degerler }) : U.bos(t ? { ikon: 'fa-circle-check', baslik: 'Takip edilecek değer yok', metin: 'Son tahlilinde bütün değerlerin referans aralığında.' } : { ikon: 'fa-flask-vial', baslik: 'Henüz tahlil yok', metin: 'Tahlil belgeni yüklediğinde referans dışı değerlerin burada görünür.' }));
    const iz = dn.izinler || {}, tur = [['olcum', 'Ölçümler'], ['tahlil', 'Tahliller'], ['gunluk', 'Günlük takip'], ['anamnez', 'Sağlık profili'], ['belge', 'Belgeler']];
    const acik = tur.filter((x) => iz[x[0]]).length;
    $('#sdIzinMetin').textContent = U.diyetisyen() ? tur.length + ' veri türünün ' + acik + ' tanesi paylaşılıyor.' : 'Bir diyetisyenle çalıştığında paylaştıkların burada görünür.';
    U.bas('#sdIzinler', tur.map((x) => U.durum(iz[x[0]] ? 'cozulen' : 'kapali', x[1], iz[x[0]] ? 'fa-eye' : 'fa-eye-slash')).join(''));
  }

  function profilForm() { ['boy', 'kilo', 'hedef_kilo', 'hedef'].forEach((k) => { pf.elements[k].value = dn[k] ?? ''; }); }

  function profil() {
    const an = dn.anamnez || {};
    const s = olcumler()[olcumler().length - 1];
    $('#sdSon').textContent = s ? 'Son güncelleme: ' + U.tarih(s.tarih) : 'Henüz ölçüm yok';
    /* Duyarlı üyede kilo ve hedef bu özette görünmez; kayıtlı değerler düzenleme penceresinde korunur */
    const temel = [['Boy', dn.boy ? dn.boy + ' cm' : '—'], ['Yaş', dn.yas || '—']].concat(duyarli ? [] : [['Güncel Kilo', dn.kilo ? U.sayi(dn.kilo, 1) + ' kg' : '—'], ['Hedef Kilo', dn.hedef_kilo ? kg(dn.hedef_kilo) : '—'], ['Hedefin', dn.hedef || 'Belirtilmedi']]);
    U.bas('#sdTemel', temel.map((x) => '<div><dt>' + x[0] + '</dt><dd>' + U.kac(x[1]) + '</dd></div>').join(''));
    const yok = 'Kayıtlı değil.';
    U.bas('#sdDikkat', [
      satir('fa-wheat-awn-circle-exclamation', 'Besin alerjileri ve hassasiyetler', (dn.hassasiyetler || []).map(U.basHarf).join(', ') || yok),
      satir('fa-pills', 'Düzenli kullanılan ilaç veya takviye', (an.ilaclar || []).join(', ') || yok),
      satir('fa-stethoscope', 'Bilinen kronik rahatsızlık', (dn.kronik || []).join(', ') || yok),
    ].join(''));
    const k = U.ANAMNEZ.map(([a, e]) => [e, an[a]]).filter((x) => x[1]);
    const eksik = U.anamnezEksik().length;
    $('#sdAnamnezOzet').textContent = eksik ? eksik + ' alan eksik. Yarıda bırakabilirsin, kaldığın yerden devam edersin.' : 'Diyetisyeninle paylaştığın anamnez özeti.';
    $('#sdAnamnezDugme').textContent = eksik ? 'Tamamla' : 'Düzenle';
    U.bas('#sdAnamnez', k.length ? k.map((x) => '<div><dt>' + x[0] + '</dt><dd>' + U.kac(x[1]) + '</dd></div>').join('') : '');
    U.gizle($('#sdAnamnez'), !k.length);
  }

  function grafik() {
    const m = METRIK[metrik], l = olcumler().filter((o) => m.oku(o) != null), g = donem ? l.slice(-donem) : l;
    const hedefli = metrik === 'kilo' && !duyarli && dn.hedef_kilo;
    $('#sdGrafikBaslik').textContent = m.ad + ' Seyri';
    $('#sdGrafikNot').textContent = hedefli ? g.length + ' ölçüm. Kesik çizgi hedef kilon.' : g.length + ' ölçüm';
    document.querySelectorAll('[data-metrik]').forEach((e) => e.setAttribute('aria-pressed', String(e.dataset.metrik === metrik)));
    if (!g.length) { U.bas('#sdGrafik', U.bos({ ikon: 'fa-chart-line', baslik: 'Henüz ölçüm yok', metin: 'İlk ölçümünü eklediğinde grafiğin burada oluşur.', eylem: '<button class="dugme birincil" type="button" data-ac="#sdOlcumModal">Ölçüm ekle</button>' })); return; }
    DD.grafik.cizgi($('#sdGrafik'), { baslik: m.ad + ' seyri', etiketler: g.map((o) => U.noktaliTarih(o.tarih).slice(0, 5)), seriler: [{ ad: m.ad, degerler: g.map(m.oku) }], hedef: hedefli ? dn.hedef_kilo : null, basamak: 1 });
  }

  /* Başlangıçtan hedefe yolculuk. Duyarlı üyede hedef kartı yok, grafik tek kolona yayılır */
  function yolculuk() {
    const l = olcumler(), i = l[0], s = l[l.length - 1], h = dn.hedef_kilo;
    const var_ = !duyarli && s && h && i.kilo !== h;
    U.gizle($('#sdHedefKart'), !var_);
    $('#sdOlcumGovde').classList.toggle('tek', !var_);
    if (!var_) return;
    const oran = Math.max(0, Math.min(100, Math.round(((i.kilo - s.kilo) / (i.kilo - h)) * 100)));
    const k = (e, d) => '<div><dt>' + e + '</dt><dd>' + d + '</dd></div>';
    $('#sdHedefMetin').textContent = oran >= 100 ? 'Hedefine ulaştın.' : 'İlk ölçümünden hedefine ilerleyişin.';
    U.bas('#sdHedef', '<div class="halka" data-oran="' + oran + '" role="img" aria-label="Hedefe ilerleme: yüzde ' + oran + '"><span>%' + oran + '</span></div><dl class="yolculuk-liste">' + k('Başlangıç', U.sayi(i.kilo, 1) + ' kg') + k('Şu an', U.sayi(s.kilo, 1) + ' kg') + k('Hedef', kg(h)) + k('Kalan', U.sayi(Math.abs(s.kilo - h), 1) + ' kg') + '</dl>');
  }

  function olcum() {
    const l = olcumler(), s = l[l.length - 1], o = l[l.length - 2];
    U.sayac('olcum', l.length);
    const fark = (m) => {
      if (duyarli) return U.tarih(s.tarih);
      const a = o && m.oku(o), z = m.oku(s);
      if (a == null || z == null) return 'İlk ölçüm';
      const f = Math.round((z - a) * 10) / 10;
      return (f > 0 ? '+' : f < 0 ? '−' : '') + U.sayi(Math.abs(f), 1) + m.fark + ' · önceki ölçüm';
    };
    U.bas('#sdOlcumKutular', s ? Object.keys(METRIK).map((k) => { const m = METRIK[k], v = m.oku(s); return kutu({ ikon: m.ikon, etiket: m.ad, deger: v == null ? '—' : m.yaz(v), alt: fark(m), ek: ' data-metrik="' + k + '" aria-pressed="false"' }); }).join('') : '');
    U.gizle($('#sdOlcumKutular'), !s);
    $('#sdOlcumTarih').textContent = s ? 'Son ölçüm: ' + U.tarih(s.tarih) : '';
    grafik(); yolculuk();
    const r = l.slice().reverse(), gorunen = hepsi ? r : r.slice(0, ACIK_SATIR), d = $('#sdOlcumHepsi');
    U.bas('#sdOlcumler', gorunen.map((x) => '<tr><td class="tarih">' + U.noktaliTarih(x.tarih) + '</td><td class="tutar sag">' + U.sayi(x.kilo, 1) + ' kg</td><td class="tutar sag">' + U.sayi(bki(x.kilo), 1) + '</td><td class="tutar sag">' + (x.bel ? U.sayi(x.bel, 1) + ' cm' : '—') + '</td><td class="tutar sag">' + (x.yag_orani ? '%' + U.sayi(x.yag_orani, 1) : '—') + '</td></tr>').join('') || '<tr><td colspan="5" class="bos-hucre">Henüz ölçüm yok.</td></tr>');
    U.gizle(d.parentElement, r.length <= ACIK_SATIR);
    d.textContent = hepsi ? 'Son ' + ACIK_SATIR + ' ölçümü göster' : 'Bütün ölçümleri göster (' + r.length + ')';
  }

  function tahlil() {
    const l = tahlilListe();
    U.sayac('tahlil', l.length);
    /* Tahlil yüklendiyse sıradaki adım izin: diyetisyen izinsiz göremez */
    const izin = !!(dn.izinler || {}).tahlil;
    const ist = dn.tahlil_istegi;
    U.bas('#sdTahlilIstek', ist ? '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-flask-vial" aria-hidden="true"></i> Diyetisyenin tahlil istedi</h3><p>' + U.tarih(ist.tarih) + (ist.not ? ' · ' + U.kac(ist.not) : '') + '</p></div><div class="as-eylem"><button class="dugme birincil" type="button" data-ac="#sdBelgeModal">Tahlil yükle</button></div></div></div>' : '');
    U.bas('#sdIzinNot', !l.length || !U.diyetisyen() ? '' : izin
      ? '<div class="bilgi-notu"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><p><b>Diyetisyenin tahlillerini görebiliyor.</b> Değerlendirmesi Özet sekmesindeki Diyetisyen Notları kartına düşer.</p></div>'
      : '<div class="uyari-kutu"><i class="fa-solid fa-user-shield" aria-hidden="true"></i><span><b>Tahlillerin paylaşılmıyor.</b> Diyetisyeninin görebilmesi için izin ver. <a href="' + DD.kok + 'hesabim/veri-izinlerim/">Veri İzinlerim</a></span></div>');
    /* En yeni tahlil açık kartta, önceki değerlerle karşılaştırmalı; eskiler akordeonda */
    const rozetler = (t) => { if (!(t.degerler || []).length) return ''; const y = tahlilSay(t); return (y.disi ? '<span class="rozet bekleme">' + y.disi + ' referans dışı</span>' : '') + (y.normal ? '<span class="rozet olumlu">' + y.normal + ' normal</span>' : ''); };
    const degerler = (t, i) => ((t.degerler || []).length ? T.liste(t.degerler, { onceki: (l.slice(i + 1).find((x) => (x.degerler || []).length) || {}).degerler }) : '<p class="alan-yardim"><span>Bu belgenin değerleri henüz okunmadı.</span></p>');
    /* e-Nabız örnek setiyle dolan tahlil: değerlerin PDF'ten okunmadığı açıkça yazar */
    const ornekNot = (t) => (t.ornek ? '<div class="belge-not"><span class="rozet bekleme">Prototip örneği</span><p>Bu değerler PDF’ten okunmadı. Prototipte PDF okuma yok: yüklediğin dosya saklanır ve açılır, tabloya örnek bir e-Nabız değer seti düşer.</p></div>' : '');
    const kaynakAlt = (t) => ((t.degerler || []).length ? '<div class="kart-alt">' + T.kaynakNotu(t.degerler) + '</div>' : '');
    const tahlilGor = (t) => gorDugme('data-onizle-tahlil="' + U.kac(t.dosya_adi) + '"');
    const alt = (t) => U.kac(t.dosya_adi) + ' · ' + U.tarih(t.tarih) + (t.kaynak ? ' · ' + U.kac(t.kaynak) : '');
    const [son, ...eski] = l;
    U.bas('#sdTahliller', !son ? '' : '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-file-waveform" aria-hidden="true"></i> Son Tahlilin</h3><p>' + alt(son) + '</p></div><div class="as-eylem">' + rozetler(son) + tahlilGor(son) + '</div></div>' + (son.ornek ? '<div class="kart-govde">' + ornekNot(son) + '</div>' : '') + '<div class="kart-govde' + ((son.degerler || []).length ? ' bosluksuz' : '') + '">' + degerler(son, 0) + '</div>' + kaynakAlt(son) + '</div>'
      + (eski.length ? '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> Önceki Tahlillerin</h3></div></div><div class="kart-govde"><div class="akordeon tam-genis">' + eski.map((t, i) => '<div class="akordeon-kalem"><button class="akordeon-bas" type="button" aria-expanded="false"><span class="akordeon-ikon"><i class="fa-solid fa-file-waveform" aria-hidden="true"></i></span> ' + U.tarih(t.tarih) + ' · ' + U.kac(t.dosya_adi) + ' <i class="fa-solid fa-chevron-down akordeon-ok" aria-hidden="true"></i></button><div class="akordeon-govde"><div class="tahlil-eski"><div class="as-eylem">' + rozetler(t) + tahlilGor(t) + '</div>' + ornekNot(t) + degerler(t, i + 1) + (t.degerler.length ? T.kaynakNotu(t.degerler) : '') + '</div></div></div>').join('') + '</div></div></div>' : ''));
    U.bas('#sdReferansTablo', DD.tahlilDeger.tablo());
  }

  function notlar() {
    const l = (dn.klinik_notlar || []).filter((x) => x.paylasildi).slice().reverse();
    U.bas('#sdNotlar', l.length ? '<div class="zaman-cizelgesi">' + l.map((x) => '<div class="zc-kalem"><div class="zc-zaman">' + U.tarih(x.tarih) + '</div><div class="zc-metin">' + U.kac(x.metin) + '</div></div>').join('') + '</div>' : U.bos({ ikon: 'fa-comment-medical', baslik: 'Paylaşılan not yok', metin: U.diyetisyen() ? 'Diyetisyenin seninle bir değerlendirme paylaştığında burada görünür.' : 'Bir diyetisyenle çalıştığında değerlendirmeleri burada görünür.', eylem: U.diyetisyen() ? U.bag('Diyetisyenim', 'hesabim/diyetisyenim/', 'hayalet') : U.bag('Diyetisyen bul', 'diyetisyen-bul-sihirbazi/') }));
  }

  const gorDugme = (ek) => '<button class="dugme hayalet kucuk" type="button" ' + ek + '><i class="fa-solid fa-eye" aria-hidden="true"></i> Görüntüle</button>';
  const belgeSay = () => belgeler().length + (dn.tahliller || []).length;
  const TUR_IKON = { Tahlil: 'fa-flask-vial', 'Reçete': 'fa-file-prescription', Epikriz: 'fa-file-medical' };

  function belge() {
    const an = dn.anamnez || {};
    U.bas('#sdIlaclar', (an.ilaclar || []).map((i) => satir('fa-pills', i, 'Sağlık öykünde kayıtlı')).join('') || U.bos({ ikon: 'fa-pills', baslik: 'Kayıt yok', metin: 'Düzenli kullandığın ilaç veya takviye kayıtlı değil.' }));
    U.sayac('belge', belgeSay());
    /* Tahlil dosyaları da listede; onlar tahlil kaydına bağlı olduğu için buradan silinmez */
    const l = belgeler().map((d, i) => ({ ...d, sira: i })).concat((dn.tahliller || []).map((t) => ({ ad: t.dosya_adi, tur: 'Tahlil', tarih: t.tarih }))).sort((a, z) => String(z.tarih).localeCompare(String(a.tarih)));
    U.bas('#sdBelgeler', l.map((d) => satir(TUR_IKON[d.tur] || 'fa-file-lines', d.ad, d.tur + ' · ' + U.tarih(d.tarih) + (d.ornek ? ' · Prototip örneği' : ''), (d.sira == null ? gorDugme('data-onizle-tahlil="' + U.kac(d.ad) + '"') + '<button class="dugme hayalet kucuk" type="button" data-sekme-git="tahlil">Değerleri gör</button>' : gorDugme('data-onizle-belge="' + d.sira + '"') + '<button class="dugme hayalet tehlike kucuk" type="button" data-belge-sil="' + d.sira + '">Kaldır</button>'))).join('') || U.bos({ ikon: 'fa-folder-open', baslik: 'Henüz belge yok', metin: 'Reçete ya da raporlarını buraya yükleyebilirsin.', eylem: '<button class="dugme birincil" type="button" data-ac="#sdBelgeModal">Belge yükle</button>' }));
  }

  /* Örnek belge: gerçek kayıttaki değerlerden kurulur, uydurma içerik eklenmez */
  function ornekIcerik(d) {
    if (d.tur === 'Tahlil') {
      const t = (dn.tahliller || []).find((x) => x.dosya_adi === d.ad) || {};
      const n = (v) => DD.bicim.sayi(v, 2);
      const ref = (x) => (x.ref_alt != null && x.ref_ust != null ? n(x.ref_alt) + '–' + n(x.ref_ust) : '—');
      return (t.degerler || []).length ? '<div class="tablo-kap gomulu"><table class="tablo panel"><caption class="yalniz-okuyucu">Tahlil değerleri</caption><thead><tr><th scope="col">Tetkik</th><th scope="col" class="sag">Sonuç</th><th scope="col" class="sag">Referans</th></tr></thead><tbody>' + t.degerler.map((x) => '<tr><td>' + U.kac(x.ad) + '</td><td class="tutar sag">' + n(x.sonuc) + (x.birim ? ' ' + U.kac(x.birim) : '') + '</td><td class="sag">' + ref(x) + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="kart-metin">Bu belgenin değerleri henüz okunmadı.</p>';
    }
    if (d.tur === 'Reçete') { const l = (dn.anamnez || {}).ilaclar || []; return l.length ? '<ul class="isaretli-liste">' + l.map((x) => '<li>' + U.kac(x) + '</li>').join('') + '</ul>' : '<p class="kart-metin">Düzenli kullanım kaydı yok.</p>'; }
    return '<p class="kart-metin">Yüklediğin belgenin sayfaları burada görünür.</p>';
  }
  const BELGE_AD = { Tahlil: 'Laboratuvar Sonuçları', 'Reçete': 'Reçete', Epikriz: 'Epikriz' };

  function onizle(d) {
    const f = dosyalar.get(dosyaAnahtar(d.ad, d.tarih)), ad = U.kac(d.ad);
    $('#sdOnizlemeBaslik').textContent = d.ad;
    U.bas('#sdOnizlemeIndir', f ? '<a class="dugme hayalet" href="' + f.url + '" download="' + ad + '"><i class="fa-solid fa-download" aria-hidden="true"></i> İndir</a>' : '');
    const gercek = f && (/^image\//.test(f.tip) ? '<img class="belge-gorsel" src="' + f.url + '" alt="' + ad + '">' : f.tip === 'application/pdf' ? '<iframe class="belge-cerceve" src="' + f.url + '" title="' + ad + '"></iframe>' : U.bos({ ikon: 'fa-file-lines', baslik: 'Bu dosya türü önizlenemiyor', metin: 'Dosyayı indirip açabilirsin.' }));
    U.bas('#sdOnizlemeGovde', gercek || '<div class="belge-not"><span class="rozet bekleme">Prototip örneği</span><p>Dosyanın kendisi bu oturumda yok; belgenin nasıl görüneceğini gösteren örnek önizleme.</p></div><article class="belge-sayfa"><header class="belge-sayfa-bas"><h3>' + (BELGE_AD[d.tur] || 'Belge') + '</h3><span>' + U.tarih(d.tarih) + '</span></header><dl class="belge-bilgi"><div><dt>Ad Soyad</dt><dd>' + U.kac(dn.ad) + '</dd></div><div><dt>Belge</dt><dd>' + ad + '</dd></div></dl>' + ornekIcerik(d) + '</article>');
    DD.ac('#sdOnizleme');
  }

  function hesaplar() {
    const s = olcumler()[olcumler().length - 1], t = (U.uye().tercihler || {});
    const l = (duyarli ? [] : U.uye().hesaplayici_sonuclari || []).slice().reverse().map((h) => satir('fa-fire', 'Günlük kalori', DD.bicim.kcal(h.hedef || h.kcal || h.tdee || 0) + (h.tarih ? ' · ' + U.tarih(h.tarih) : ''), '<a class="dugme hayalet kucuk" href="' + DD.kok + 'hesaplayicilar/">Yeniden hesapla</a>'));
    if (s) l.push(satir('fa-calculator', 'Beden Kitle İndeksi', U.sayi(bki(s.kilo), 1) + ' · ' + U.tarih(s.tarih), '<a class="dugme hayalet kucuk" href="' + DD.kok + 'hesaplayicilar/">Yeniden hesapla</a>'));
    if (t.kcal && !duyarli) l.push(satir('fa-fire', 'Günlük enerji hedefi', DD.bicim.kcal(t.kcal) + ' · ' + t.protein + ' g protein, ' + t.karb + ' g karbonhidrat, ' + t.yag + ' g yağ', '<a class="dugme hayalet kucuk" href="' + DD.kok + 'hesaplayicilar/">Yeniden hesapla</a>'));
    U.bas('#sdHesaplar', l.join('') || U.bos({ ikon: 'fa-calculator', baslik: 'Henüz hesap yok', metin: 'Hesaplayıcıları kullandığında sonuçların burada listelenir.', eylem: U.bag('Hesaplayıcılara git', 'hesaplayicilar/') }));
    const tl = (U.uye().test_sonuclari || []).slice().reverse();
    U.bas('#sdTestler', tl.map((t) => satir('fa-clipboard-check', t.sonuc || t.test, U.tarih(t.tarih) + ' · ' + t.puan + ' puan', '<a class="dugme hayalet kucuk" href="' + DD.kok + 'saglik-testleri/' + t.test + '/">Yeniden çöz</a>')).join('') || U.bos({ ikon: 'fa-clipboard-question', baslik: 'Henüz test çözmedin', metin: 'Bir sağlık testi çözdüğünde sonucun burada saklanır.', eylem: U.bag('Teste başla', 'saglik-testleri/') }));
  }

  function raporlar() {
    const l = U.yerel('gelisimRapor', []).slice().reverse();
    U.bas('#sdRaporlar', l.map((r) => satir('fa-file-lines', r.ad, U.tarih(r.bas) + ' – ' + U.tarih(r.bit) + ' · ' + (duyarli ? r.ozet.replace(/^.* kg değişim, /, '') : r.ozet), '<button class="dugme hayalet kucuk" type="button" data-yazdir>Yazdır</button>')).join('') || U.bos({ ikon: 'fa-chart-column', baslik: 'Henüz rapor yok', metin: 'Yukarıdan bir dönem seçip ilk raporunu oluştur.' }));
  }
  const ciz = () => { ozet(); profil(); olcum(); tahlil(); notlar(); belge(); hesaplar(); raporlar(); };

  /* Duyarlı üye: hedef alanları ve kilo farkı görünmez, kayıtlı değerler formda korunur.
     Özet varsayılan sekme olduğu için orada kilo ve BKİ yok; ölçümleri üye Ölçümlerim'den kendi açar */
  if (duyarli) {
    ['hedef_kilo', 'hedef'].forEach((a) => U.gizle(pf.elements[a].closest('.alan'), true));
    pf.querySelector('.alan-izgara').classList.replace('c3', 'c2');
    $('#sdTemel').classList.add('sade');
    $('#sdTemel').closest('.kart').insertAdjacentHTML('afterend', U.uzmanNot());
    U.bas('#sdOzetNot', U.uzmanNot());
    $('#sdHesaplar').closest('.iki-kolon').insertAdjacentHTML('beforebegin', U.uzmanNot());
  } else U.gizle($('#sdOzetNot'), true);

  pf.addEventListener('submit', (e) => {
    e.preventDefault();
    dn.boy = Number(pf.elements.boy.value) || dn.boy;
    dn.kilo = Number(pf.elements.kilo.value) || dn.kilo;
    dn.hedef_kilo = Number(pf.elements.hedef_kilo.value) || dn.hedef_kilo;
    dn.hedef = pf.elements.hedef.value.trim();
    U.kaydet(); DD.kapat($('#sdProfilModal')); ciz();
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
    U.kaydet(); DD.kapat($('#sdAnamnezModal')); ozet(); profil();
    DD.toast(U.anamnezEksik().length ? 'Kaydedildi; kalan alanlara sonra dönebilirsin.' : 'Sağlık öykün tamamlandı.');
  });
  $('#sdProfilDugme').addEventListener('click', () => { profilForm(); DD.ac('#sdProfilModal'); });
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
  /* e-Nabız PDF'i: prototipte içi okunmaz. Dosya kasaya girer, tabloya etiketli örnek değer seti düşer.
     Raporun kendi aralığı olan satırlar onu kullanır; aralığı olmayan iki satır (glukoz, HbA1c) varsayılan tabloya düşer. */
  const ENABIZ_ORNEK = [
    { ad: 'Ferritin', sonuc: 22, birim: 'ng/mL', ref_alt: 13, ref_ust: 150 },
    { ad: 'Hemoglobin', sonuc: 12.4, birim: 'g/dL', ref_alt: 12, ref_ust: 15.5 },
    { ad: '25-OH D vitamini', sonuc: 24, birim: 'ng/mL', ref_alt: 30, ref_ust: 100 },
    { ad: 'B12 vitamini', sonuc: 356, birim: 'pg/mL', ref_alt: 197, ref_ust: 771 },
    { ad: 'TSH', sonuc: 1.9, birim: 'mIU/L', ref_alt: 0.27, ref_ust: 4.2 },
    { ad: 'Açlık glukozu', sonuc: 94, birim: 'mg/dL' },
    { ad: 'HbA1c', sonuc: 5.4, birim: '%' },
  ];
  const pdfMi = (d) => d.type === 'application/pdf' || /\.pdf$/i.test(d.name);
  const SINIR = 10 * 1024 * 1024;
  /* Dosyayı kasaya koyar; kasa açılamazsa dosya bu oturumda kalır ve üye bunu duyar */
  function dosyaSakla(d) {
    const k = dosyaAnahtar(d.name, b);
    dosyalar.set(k, { url: URL.createObjectURL(d), tip: d.type });
    return kasa.koy(k, d).then((ok) => { if (!ok) DD.toast('Dosya bu tarayıcıya kaydedilemedi; sayfayı yenileyene kadar açılır.', 'uyari'); });
  }
  function tahlilYukle(d, kaynak) {
    dn.tahliller = dn.tahliller || [];
    if (dn.tahliller.some((t) => t.dosya_adi === d.name)) { DD.toast('Bu dosya zaten yüklü: ' + d.name, 'hata'); return false; }
    if (d.size > SINIR) { DD.toast('Dosya 10 MB’tan büyük olamaz.', 'hata'); return false; }
    dosyaSakla(d);
    const pdf = pdfMi(d), t = { tarih: b, dosya_adi: d.name, degerler: pdf ? ENABIZ_ORNEK.map((x) => ({ ...x })) : [], yukleyen: 'uye' };
    if (pdf) { t.ornek = true; if (kaynak) t.kaynak = kaynak; }
    dn.tahliller.push(t);
    delete dn.tahlil_istegi;
    U.kaydet(); ciz(); U.sekmeAc('tahlil');
    DD.toast((pdf ? 'Tahlilin yüklendi; ' + ENABIZ_ORNEK.length + ' değer tabloya eklendi (prototip örneği).' : 'Tahlilin yüklendi.') + (!(dn.izinler || {}).tahlil && U.diyetisyen() ? ' Diyetisyenin görebilmesi için izin ver.' : ''));
    return true;
  }
  const birak = $('#sdENabizAlan'), girdi = $('#sdENabizDosya');
  const enabizAl = (d) => { if (!d) return; if (!pdfMi(d)) { DD.toast('e-Nabız’dan indirdiğin PDF dosyasını seç.', 'hata'); return; } tahlilYukle(d, 'e-Nabız'); };
  girdi.addEventListener('change', () => { enabizAl(girdi.files[0]); girdi.value = ''; });
  ['dragenter', 'dragover'].forEach((t) => birak.addEventListener(t, (e) => { e.preventDefault(); birak.classList.add('uzerinde'); }));
  ['dragleave', 'drop'].forEach((t) => birak.addEventListener(t, (e) => { e.preventDefault(); birak.classList.remove('uzerinde'); }));
  birak.addEventListener('drop', (e) => enabizAl(e.dataTransfer.files[0]));
  $('#sdBelgeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = $('#bDosya').files[0], tur = e.target.elements.bTur.value;
    if (!d) return;
    if (tur === 'Tahlil') { if (tahlilYukle(d)) { e.target.reset(); DD.kapat($('#sdBelgeModal')); } return; }
    dosyaSakla(d);
    belgeler().push({ ad: d.name, tur, tarih: b });
    U.kaydet(); e.target.reset(); DD.kapat($('#sdBelgeModal')); ciz();
    DD.toast('Belgen yüklendi.');
  });
  document.addEventListener('click', (e) => {
    const ob = e.target.closest('[data-onizle-belge]');
    if (ob) { onizle(belgeler()[Number(ob.dataset.onizleBelge)]); return; }
    const ot = e.target.closest('[data-onizle-tahlil]');
    if (ot) { const t = (dn.tahliller || []).find((x) => x.dosya_adi === ot.dataset.onizleTahlil); if (t) onizle({ ad: t.dosya_adi, tur: 'Tahlil', tarih: t.tarih }); return; }
    const s = e.target.closest('[data-belge-sil]');
    if (s) { const x = belgeler().splice(Number(s.dataset.belgeSil), 1)[0]; if (x) { const k = dosyaAnahtar(x.ad, x.tarih); kasa.sil(k); dosyalar.delete(k); } U.kaydet(); belge(); ozet(); DD.toast('Belge kaldırıldı.', 'uyari'); return; }
    const yz = e.target.closest('[data-yazdir]');
    if (yz) { DD.yazdir(yz.closest('.ayar-satir'), 'Gelişim Raporu'); return; }
    const m = e.target.closest('[data-metrik]');
    if (m) { metrik = m.dataset.metrik; grafik(); return; }
    const dg = e.target.closest('[data-donem]');
    if (dg) { donem = Number(dg.dataset.donem); grafik(); return; }
    if (e.target.closest('#sdOlcumHepsi')) { hepsi = !hepsi; olcum(); }
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
  /* Kaldırılan sekmelerin adresleri (bildirim ve eski bağlantılar) yeni yerine gider */
  const TASINAN = { not: 'ozet', test: 'gelisim', hesap: 'gelisim' };
  const adresAc = () => { const k = TASINAN[location.hash.slice(1)]; if (k) U.sekmeAc(k); };
  adresAc();
  window.addEventListener('hashchange', adresAc);
})();
