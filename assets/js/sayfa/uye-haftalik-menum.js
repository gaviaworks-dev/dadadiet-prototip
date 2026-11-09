/* Haftalık Menüm: kısıtlara uyan tariflerden yedi günlük menü kurar */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const f = $('#hmForm');
  /* HM1: bütçe segmentten, kısıtlar basılı çiplerden okunur */
  const butceAl = () => ($('#hmButce [aria-pressed="true"]') || {}).dataset.deger || 'orta';
  const kisitAl = () => [...document.querySelectorAll('#hmKisit [aria-pressed="true"]')].filter((c) => !c.hidden).map((c) => c.dataset.kisit);
  const kisitCip = (k) => document.querySelector('#hmKisit [data-kisit="' + k + '"]');
  function butceKur(d) {
    document.querySelectorAll('#hmButce button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.deger === d)));
    $('#hmButceMetin').textContent = ($('#hmButce [aria-pressed="true"]') || {}).dataset.aciklama || '';
  }
  const tarifler = () => { const t = window.DD_VERI.tarifler; return Array.isArray(t) ? t : t.tarifler; };
  const OGUN = [['kahvaltı', 'Kahvaltı'], ['ara', 'Ara Öğün'], ['öğle', 'Öğle'], ['akşam', 'Akşam']];
  const ESLEME = { laktoz: ['laktoz', 'sut'], gluten: ['gluten'], yumurta: ['yumurta'], kuruyemis: ['kuruyemis'], balik: ['balik', 'kabuklu-deniz'], susam: ['susam'], soya: ['soya'] };
  const durum = () => U.yerel('haftalikMenu', null);
  const TU = DD.tercihUyum, tk = TU.kisitlar(), duyarli = U.yemeDuyarli();
  /* Tarzın zaten kapsadığı kısıt ayrıca sorulmaz */
  const KISIT_ETIKET = { laktoz: 'laktoz', gluten: 'gluten', yumurta: 'yumurta', kuruyemis: 'kuruyemis', balik: 'balik', susam: 'susam', soya: 'soya' };
  const tarzKapsar = (k) => !!tk.tarzYasak && tk.tarzYasak.has(KISIT_ETIKET[k]);
  /* Kayıtlı menüdeki tarif tercih sonradan değiştiyse uyan bir tarifle değişir */
  function gecerli(s, tip, g) {
    const t = s && U.tarif(s), u = t && TU.tarifUyarla(t);
    if (u) return u;
    const h = TU.tarifHavuzu(tip);
    return s && h.length ? h[g % h.length] : null;
  }
  const bas = U.gunEkle(U.bugun(), -((U.gun(U.bugun()).getDay() + 6) % 7));

  /* Kan tahlilinden menüne (EG-5-3, EG-6-1): son tahlildeki referans dışı değer, kural tablosundaki tarifleri menüde öne alır.
     Durum tahlil-deger.js ile okunur (raporun aralığı, yoksa varsayılan tablo; ferritinde ASH 2026 alt sınırı).
     Öneriler genel beslenme önerisidir; ilaç ya da takviye kararı hekim ve diyetisyendedir. Kural tablosu uzman onayı bekliyor */
  const TUBER = 'Türkiye Beslenme Rehberi (TÜBER) 2022, T.C. Sağlık Bakanlığı';
  const KURAL = [
    { id: 'demir', adlar: ['ferritin', 'hemoglobin'], yon: 'dusuk', baslik: 'Demir depoların düşük', metin: 'Baklagil, yeşil yapraklı sebze ve kırmızı et öğünlerini artır; bitkisel demiri C vitaminli besinlerle (limon, biber, domates) birlikte ye, çayı ve kahveyi öğünden uzak tut.', tarifler: ['mercimek-corbasi', 'yesil-mercimek-yemegi', 'nohut-salatasi', 'ispanakli-omlet', 'izgara-sebzeli-dana-bonfile'] },
    { id: 'dvit', adlar: ['25-oh d vitamini', 'd vitamini', '25(oh)d'], yon: 'dusuk', baslik: 'D vitaminin düşük', metin: 'Haftada en az iki kez balık ye, yumurtayı düzenli tüket. D vitaminini yalnız besinle karşılamak zordur; takviye kararını hekimin ya da diyetisyenin verir.', tarifler: ['sebzeli-levrek-bugulama', 'ton-balikli-salata', 'menemen'] },
    { id: 'b12', adlar: ['b12 vitamini', 'b12'], yon: 'dusuk', baslik: 'B12 vitaminin düşük', metin: 'B12 hayvansal besinlerde bulunur: yumurta, süt ürünleri, et ve balık öğünlerini artır.', tarifler: ['menemen', 'yogurtlu-tavuk-sis', 'izgara-sebzeli-dana-bonfile'] },
    { id: 'seker', adlar: ['açlık glukozu', 'hba1c'], yon: 'yuksek', baslik: 'Kan şekerin yüksek', metin: 'Lifli tahıl, baklagil ve sebzeyi öne al; şekerli içecek ve beyaz unlu ürünleri azalt.', tarifler: ['yesil-mercimek-yemegi', 'nohut-salatasi', 'mevsim-salatasi'] },
  ];
  const sonTahlil = () => (U.danisan().tahliller || []).slice().sort((a, c) => String(c.tarih).localeCompare(String(a.tarih)))[0] || null;
  function tahlilKurallari() {
    const t = sonTahlil(), TD = DD.tahlilDeger;
    if (!t || !TD) return [];
    return KURAL.map((r) => {
      const d = (t.degerler || []).filter((x) => r.adlar.includes(String(x.ad).toLocaleLowerCase('tr').trim()) && TD.durum(x) === r.yon);
      return d.length ? { ...r, degerler: d } : null;
    }).filter(Boolean);
  }
  function tahlilCiz() {
    const t = sonTahlil(), l = tahlilKurallari(), m = durum(), acik = !!(m && m.tahlil);
    if (!t) { U.bas('#hmTahlil', ''); return; }
    const TD = DD.tahlilDeger, n = (v) => DD.bicim.sayi(v, 2);
    const kural = (r) => {
      const tl = r.tarifler.map(U.tarif).filter((x) => x && TU.tarifUyarla(x));
      return '<div class="ayar-satir sarmali"><span class="as-ikon"><i class="fa-solid ' + (r.yon === 'dusuk' ? 'fa-arrow-down' : 'fa-arrow-up') + '" aria-hidden="true"></i></span><div class="as-metin"><b>' + r.baslik + '</b><span>' + r.degerler.map((d) => U.kac(d.ad) + ' ' + n(d.sonuc) + ' ' + U.kac(d.birim || '')).join(', ') + '. ' + r.metin + (tl.length ? ' Menüne girecek tarifler: ' + tl.map((x) => U.kac(x.ad)).join(', ') + '.' : '') + '</span></div></div>';
    };
    U.bas('#hmTahlil', '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-flask-vial" aria-hidden="true"></i> Kan Tahlilinden Menüne</h3><p>' + U.tarih(t.tarih) + ' tarihli tahlilin. ' + (l.length ? l.length + ' değer referans dışında; menün bunlara göre ayarlanabilir.' : 'Menüyü değiştirecek referans dışı değer yok.') + '</p></div>' + (l.length ? '<div class="as-eylem">' + U.durum(acik ? 'cozulen' : 'bekleyen', acik ? 'Menüne uygulandı' : 'Uygulanmadı') + '</div>' : '') + '</div>'
      + (l.length ? '<div class="kart-govde bosluksuz"><div class="ayar-liste">' + l.map(kural).join('') + '</div></div>' : '')
      + '<div class="kart-govde"><p class="alan-yardim"><i class="fa-solid fa-book-medical" aria-hidden="true"></i> <span>Referans dışı karar, raporun kendi aralığından ya da varsayılan tablodan (ferritinde ' + TD.KAYNAK.ash.kisa + ', ' + TD.KAYNAK.ash.tarih + '). Besin önerileri: ' + TUBER + '. Kural tablosu ' + TD.DERLEME + ' tarihinde derlendi, ' + TD.ONAY.toLocaleLowerCase('tr') + '. İlaç ya da takviye yerine geçmez; diyetisyeninle konuş.</span></p></div>'
      + (l.length ? '<div class="kart-alt eylem"><a class="dugme hayalet" href="' + DD.kok + 'hesabim/saglik-dosyam/#tahlil">Tahlilimi aç</a><button class="dugme ' + (acik ? 'hayalet' : 'birincil') + '" type="button" id="hmTahlilUygula">' + (acik ? 'Menüden çıkar' : '<i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Menüme uygula') + '</button></div>' : '') + '</div>');
  }

  function kur(butce, kisitlar, tahlil) {
    const yasak = kisitlar.flatMap((k) => ESLEME[k] || []);
    const uygun = tarifler().filter((t) => !t.hassasiyet.some((h) => yasak.includes(h))).map(TU.tarifUyarla).filter(Boolean);
    /* Tahlil kuralları açıksa: kuralın tarifleri gün aşırı kendi öğününe yerleşir */
    const once = tahlil ? [...new Set(tahlilKurallari().flatMap((r) => r.tarifler))].map((s) => uygun.find((t) => t.slug === s)).filter(Boolean) : [];
    /* Ekonomik seçimde enerjisi yüksek tarifler sona kalır, sıralama bütçeye göre değişir */
    const sira = butce === 'genis' ? 3 : butce === 'orta' ? 2 : 1;
    const gunler = [];
    for (let g = 0; g < 7; g++) {
      const o = {};
      OGUN.forEach(([tip], i) => {
        const l = uygun.filter((t) => t.ogun === tip);
        o[tip] = l.length ? l[(g * sira + i) % l.length].slug : null;
        const ol = once.filter((t) => t.ogun === tip);
        if (ol.length && (g + i) % 2 === 0) o[tip] = ol[Math.floor((g + i) / 2) % ol.length].slug;
      });
      gunler.push(o);
    }
    return { butce, kisitlar, gunler, tarih: U.bugun(), tahlil: !!(tahlil && once.length) };
  }

  function ciz() {
    const m = durum();
    if (!m) return;
    const hucre = (s, tip, i) => { const t = gecerli(s, tip, i); return t ? '<td><span class="no">' + U.kac(t.ad) + (duyarli ? '' : '<small>' + DD.bicim.kcal(t.kcal) + '</small>') + '</span></td>' : '<td>—</td>'; };
    const toplam = (g, i) => OGUN.reduce((a, [tip]) => a + ((gecerli(g[tip], tip, i) || {}).kcal || 0), 0);
    U.bas('#hmSonuc', (duyarli ? '<div class="yigin">' + U.uzmanNot() : '') + '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-calendar-week" aria-hidden="true"></i> Bu haftanın menüsü</h3><p>' + U.kisaTarih(bas) + ' – ' + U.kisaTarih(U.gunEkle(bas, 6)) + (m.kisitlar.length ? ' · ' + m.kisitlar.length + ' kısıt uygulandı' : '') + '</p></div></div><div class="kart-govde bosluksuz"><div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Haftalık menü"><table class="tablo panel"><caption class="yalniz-okuyucu">Gün gün menü' + (duyarli ? '' : ' ve enerji') + '</caption><thead><tr><th scope="col">Gün</th>' + OGUN.map((o) => '<th scope="col">' + o[1] + '</th>').join('') + (duyarli ? '' : '<th scope="col">Enerji</th>') + '</tr></thead><tbody>' + m.gunler.map((g, i) => '<tr><td><span class="no">' + U.gunAdi(U.gunEkle(bas, i)) + '<small>' + U.kisaTarih(U.gunEkle(bas, i)) + '</small></span></td>' + OGUN.map(([tip]) => hucre(g[tip], tip, i)).join('') + (duyarli ? '' : '<td class="tutar">' + DD.bicim.kcal(toplam(g, i)) + '</td>') + '</tr>').join('') + '</tbody></table></div></div><div class="kart-alt eylem"><button class="dugme hayalet" type="button" id="hmYazdir"><i class="fa-solid fa-print" aria-hidden="true"></i> Menüyü yazdır</button></div></div>' + (duyarli ? '</div>' : ''));
    /* Haftalık makro özeti: menüdeki tariflerin günlük ortalaması; enerji hedefi Kalan kalori sayacıyla aynı kaynaktan */
    if (duyarli) return;
    const ort = (a) => m.gunler.reduce((t, g, i) => t + OGUN.reduce((x, [tip]) => x + (Number((gecerli(g[tip], tip, i) || {})[a]) || 0), 0), 0) / m.gunler.length;
    const k = U.aktifKaynak(), hedef = (U.uye().tercihler || {}).kcal || (k && k.tip === 'plan' ? k.plan.hedef_kcal : 0);
    const satir = (ad, a, birim, h) => { const o = ort(a); return '<tr><td><b>' + ad + '</b></td><td class="tutar sag">' + U.sayi(o, birim === 'g' ? 1 : 0) + ' ' + birim + '</td><td class="tutar sag">' + (h ? U.sayi(h) + ' ' + birim : '—') + '</td><td class="tutar sag">' + (h ? (o - h >= 0 ? '+' : '−') + U.sayi(Math.abs(o - h)) + ' ' + birim : '—') + '</td></tr>'; };
    $('#hmSonuc').insertAdjacentHTML('beforeend', '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-chart-pie" aria-hidden="true"></i> Haftalık Makro Özeti</h3><p>Günlük ortalama, menüdeki tariflerin besin değerlerinden hesaplandı.' + (hedef ? '' : ' Enerji hedefin kayıtlı değil.') + '</p></div></div><div class="kart-govde bosluksuz"><div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Haftalık makro özeti"><table class="tablo panel"><caption class="yalniz-okuyucu">Günlük ortalama enerji ve makrolar</caption><thead><tr><th scope="col">Besin ögesi</th><th scope="col" class="sag">Günlük ortalama</th><th scope="col" class="sag">Hedef</th><th scope="col" class="sag">Fark</th></tr></thead><tbody>' + satir('Enerji', 'kcal', 'kcal', hedef) + satir('Protein', 'protein', 'g') + satir('Karbonhidrat', 'karb', 'g') + satir('Yağ', 'yag', 'g') + '</tbody></table></div></div></div>');
  }

  /* Sağlık dosyasındaki hassasiyet ve kayıtlı seçim forma gelir */
  const m0 = durum();
  const baslangic = m0 ? m0.kisitlar : (U.danisan().hassasiyetler || []);
  baslangic.forEach((k) => { const c = kisitCip(k); if (c) c.setAttribute('aria-pressed', 'true'); });
  Object.keys(KISIT_ETIKET).filter(tarzKapsar).forEach((k) => { const c = kisitCip(k); if (c) { c.setAttribute('aria-pressed', 'false'); c.hidden = true; } });
  /* Ekonomik seçeneğin açıklaması tercihe aykırı kalmasın */
  const ekonomik = $('#hmButce [data-deger="ekonomik"]');
  if (ekonomik && !TU.uygunMu(ekonomik.dataset.aciklama)) ekonomik.dataset.aciklama = 'Baklagil, sebze ve tahıl ağırlıklı.';
  U.bas('#hmTercih', TU.bilgiHtml({ tur: 'liste' }));
  butceKur(m0 ? m0.butce : 'orta');
  $('#hmButce').addEventListener('dd:secim', (e) => butceKur(e.detail.deger));
  /* Gn1: menüsü olmayan üyede sayfa boş kalmaz; kayıtlı seçimlerle bir menü kurulur, üye istediğinde yeniden üretir */
  if (!m0 && !U.bosKip) { U.d().uyeYerel.haftalikMenu = kur(butceAl(), kisitAl(), false); U.kaydet(); }

  f.addEventListener('submit', (e) => {
    e.preventDefault();
    U.d().uyeYerel.haftalikMenu = kur(butceAl(), kisitAl(), !!(durum() || {}).tahlil);
    U.kaydet(); ciz(); tahlilCiz();
    $('#hmSonuc').scrollIntoView({ behavior: 'smooth', block: 'start' });
    DD.toast('Haftalık menün hazır.');
  });
  document.addEventListener('click', (e) => {
    const y = e.target.closest('#hmYazdir');
    if (y) DD.yazdir(y.closest('.kart'), 'Haftalık Menüm');
    if (e.target.closest('#hmTahlilUygula')) {
      const acik = !(durum() || {}).tahlil;
      U.d().uyeYerel.haftalikMenu = kur(butceAl(), kisitAl(), acik);
      U.kaydet(); ciz(); tahlilCiz();
      DD.toast(acik ? 'Tahlil önerileri menüne uygulandı.' : 'Menün tahlil önerileri olmadan yeniden kuruldu.');
    }
  });
  ciz();
  tahlilCiz();
})();
