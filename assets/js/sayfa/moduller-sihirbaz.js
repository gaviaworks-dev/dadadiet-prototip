/* Onboarding sihirbazı. Akış mobille aynı; koşullu adımlar sayaca girmez. */
(function () {
  'use strict';
  const M = window.DDM, S = M.soru, kac = M.kac;
  const $ = (id) => document.getElementById(id);
  const govde = $('sihirbazGovde');
  const programlar = JSON.parse($('programVeri').textContent);
  const c = { beslenme_tarzi: [], hassasiyet: [], ogun_sayisi: 3, oruc_protokol: 'yok', ilk_ogun_saati: '12:00', kvkk_riza: false };

  const tekHata = (kap, alan, mesaj) => { const v = S.secimOku(kap, alan); return v == null ? mesaj : null; };
  const sayiAdim = (alan) => ({
    ciz: () => S.sayiCiz(alan, c[alan]),
    oku(k) {
      const v = S.sayiOku(k, alan), gecerli = S.sayiGecerli(alan, v);
      S.hataGoster(k, alan, gecerli ? null : S.SAYI[alan].hata());
      if (gecerli) c[alan] = v;
      return gecerli ? null : false;
    },
  });
  const ADIMLAR = [
    { id: 'hedef', bolum: 'Hedef', baslik: (() => { const ad = (S.uye().ad || '').split(' ')[0]; return ad ? 'Merhaba ' + kac(ad) + ', hedefin ne?' : 'Hedefin ne?'; })(), alt: 'Sana göre bir plan kurmak için buradan başlayalım. Yaklaşık 2 dakika sürer.', gorsel: 'fa-bullseye',
      ciz: () => S.secenekCiz('hedef', c.hedef, { etiket: 'Hedef' }),
      oku(k) { const h = tekHata(k, 'hedef', 'Devam etmek için bir hedef seç.'); if (!h) c.hedef = S.secimOku(k, 'hedef'); return h; } },
    { id: 'cinsiyet', bolum: 'Vücut', baslik: 'Cinsiyetin', alt: 'Enerji ihtiyacını hesaplarken kullanılır.',
      ciz: () => S.secenekCiz('cinsiyet', c.cinsiyet, { etiket: 'Cinsiyet' }),
      oku(k) { const h = tekHata(k, 'cinsiyet', 'Devam etmek için bir seçim yap.'); if (!h) c.cinsiyet = S.secimOku(k, 'cinsiyet'); return h; } },
    { id: 'yas', bolum: 'Vücut', baslik: 'Kaç yaşındasın?', alt: 'Enerji ihtiyacı yaşa göre değişir. Doğum yılını yaz.', ...sayiAdim('dogum_yili') },
    { id: 'boy', bolum: 'Vücut', baslik: 'Boyun kaç?', alt: 'Vücut kitle indeksini ve enerji ihtiyacını hesaplarız.', ...sayiAdim('boy_cm') },
    { id: 'kilo', bolum: 'Vücut', guvenVer: true, baslik: 'Kilon kaç?', alt: 'Bu değer yalnız senin planın için kullanılır.',
      ciz() {
        const h = S.kiloHedefli(c), a = S.saglikliAralik(c.boy_cm || 165);
        return '<div class="alan-izgara' + (h ? ' c2' : '') + '">' + S.sayiCiz('kilo_kg', c.kilo_kg) + (h ? S.sayiCiz('hedef_kilo_kg', c.hedef_kilo_kg) : '') + '</div>'
          + (h ? '<p class="alan-yardim"><span>Boyuna göre sağlıklı aralık: ' + a[0] + '-' + a[1] + ' kg.</span></p>' : '');
      },
      oku(k) {
        const v = S.sayiOku(k, 'kilo_kg'), iyi = S.sayiGecerli('kilo_kg', v);
        S.hataGoster(k, 'kilo_kg', iyi ? null : S.SAYI.kilo_kg.hata());
        if (!iyi) return false;
        c.kilo_kg = v;
        if (!S.kiloHedefli(c)) { c.hedef_kilo_kg = null; return null; }
        const hk = S.sayiOku(k, 'hedef_kilo_kg'), hata = S.hedefKiloHatasi(c, hk);
        S.hataGoster(k, 'hedef_kilo_kg', hata);
        if (hata) return false;
        c.hedef_kilo_kg = hk;
        return null;
      } },
    { id: 'tempo', bolum: 'Vücut', kosul: () => S.kiloHedefli(c), baslik: 'Hangi tempoda ilerleyelim?', alt: 'Yavaş tempo sürdürmesi daha kolaydır.',
      ciz: () => S.secenekCiz('tempo', c.tempo || 'dengeli', { etiket: 'Tempo', sinif: 'c3' }),
      oku(k) { c.tempo = S.secimOku(k, 'tempo'); return c.tempo ? null : 'Bir tempo seç.'; } },
    { id: 'aktivite', bolum: 'Yaşam', baslik: 'Günün ne kadar hareketli?', alt: 'Spor dahil, sıradan bir gününü düşün.',
      ciz: () => S.secenekCiz('aktivite', c.aktivite, { etiket: 'Aktivite' }),
      oku(k) { const h = tekHata(k, 'aktivite', 'Devam etmek için bir seçim yap.'); if (!h) c.aktivite = S.secimOku(k, 'aktivite'); return h; } },
    { id: 'beslenme', bolum: 'Tercihler', baslik: 'Beslenme tarzın nasıl?', alt: 'Birden fazla seçebilirsin.',
      ciz: () => S.secenekCiz('beslenme_tarzi', c.beslenme_tarzi, { etiket: 'Beslenme tarzı', coklu: true }),
      oku(k) { const v = S.secimOku(k, 'beslenme_tarzi'); if (!v.length) return 'En az bir seçenek işaretle.'; c.beslenme_tarzi = v; return null; } },
    { id: 'kvkk', bolum: 'Tercihler', baslik: 'Sağlık verilerin sana ait', alt: 'Planını kişiselleştirmek için iznin gerekiyor.', atlanir: true,
      ciz: () => '<label class="onay-kutusu"><input type="checkbox" id="riza"' + (c.kvkk_riza ? ' checked' : '') + '><span>' + kac(S.RIZA) + '</span></label>'
        + '<p class="alan-yardim riza-detay"><span>' + kac(S.RIZA_DETAY) + ' <a href="' + DD.kok + 'yasal/kvkk/" target="_blank" rel="noopener">Aydınlatma Metni</a></span></p>'
        + '<h2 class="kart-baslik adim-ara-baslik">Hassasiyet ya da kronik bir durumun var mı?</h2><p class="kart-metin">Opsiyonel. Varsa önerilerini bunlara göre süzeriz.</p>'
        + S.secenekCiz('hassasiyet', c.hassasiyet, { etiket: 'Hassasiyet ve kronik durum', coklu: true, sinif: 'c3', kapali: !c.kvkk_riza })
        + '<p class="alan-yardim" id="rizaYok"' + (c.kvkk_riza ? ' hidden' : '') + '><span>Bu seçimler açık rıza vermeden kapalıdır.</span></p>'
        + '<div class="uyari-kutu adim-not"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>' + kac(S.HASSASIYET_UYARI) + '</span></div>',
      kur(k) {
        $('riza').addEventListener('change', (e) => {
          const ac = e.target.checked;
          k.querySelectorAll('[data-alan="hassasiyet"] button').forEach((b) => { b.disabled = !ac; if (!ac) b.setAttribute('aria-pressed', 'false'); });
          $('rizaYok').hidden = ac;
        });
      },
      oku(k) { c.kvkk_riza = $('riza').checked; c.hassasiyet = c.kvkk_riza ? S.secimOku(k, 'hassasiyet') : []; return null; },
      atla() { c.kvkk_riza = false; c.hassasiyet = []; } },
    { id: 'ritim', bolum: 'Tercihler', baslik: 'Öğün ritmini seç', alt: 'Opsiyonel. Aralıklı oruç uygulamak istemiyorsan bu adımı geçebilirsin.', atlanir: true,
      ciz() {
        const gebe = S.riskli(c);
        if (gebe) c.oruc_protokol = 'yok';
        else if (c.hedef === 'oruc-aliskanligi' && c.oruc_protokol === 'yok') c.oruc_protokol = '16-8';
        return '<span class="alan-etiket">Günlük öğün sayın</span>' + S.secenekCiz('ogun_sayisi', c.ogun_sayisi, { etiket: 'Günlük öğün sayısı', sinif: 'c4 sade' })
          + '<span class="alan-etiket adim-ara-etiket">Aralıklı oruç</span>' + S.secenekCiz('oruc_protokol', c.oruc_protokol, { etiket: 'Aralıklı oruç protokolü', sinif: 'c3', kapali: gebe ? (x) => x.id !== 'yok' : null })
          + (gebe ? '<div class="uyari-kutu adim-not"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>Bu dönemde aralıklı oruç önerilmez. Öğün planını diyetisyeninle kur.</span></div>' : '')
          + '<div id="saatKap"' + (c.oruc_protokol === 'yok' ? ' hidden' : '') + '>' + S.saatCiz(c.ilk_ogun_saati) + '</div>';
      },
      kur(k) { k.querySelector('[data-alan="oruc_protokol"]').addEventListener('dd:secim', (e) => { $('saatKap').hidden = e.detail.deger === 'yok'; }); },
      oku(k) {
        c.ogun_sayisi = S.secimOku(k, 'ogun_sayisi'); c.oruc_protokol = S.secimOku(k, 'oruc_protokol') || 'yok';
        const g = k.querySelector('[data-alan="ilk_ogun_saati"]'); if (g && g.value) c.ilk_ogun_saati = g.value;
        return null;
      },
      atla() { c.ogun_sayisi = 3; c.oruc_protokol = 'yok'; } },
    { id: 'sonuc', bolum: 'Sonuç', sonuc: true, gorsel: 'fa-clipboard-check' },
  ];

  /* ?adim=tempo doğrudan açılışı örnek cevaplarla gösterir, hesaba yazmaz */
  const baslangic = new URLSearchParams(location.search).get('adim'), onizleme = Boolean(baslangic);
  const gorunen = () => ADIMLAR.filter((a) => !a.kosul || a.kosul());
  let etkin = ADIMLAR[0], guven = false;

  function sonucHtml() {
    const r = S.hesapla(c), oneri = S.programOner(c, programlar);
    const u = S.uye(), ad = (u.ad || '').split(' ')[0];
    if (!onizleme) {
      S.yaz({ ...c, kcal: r.riskli ? null : r.hedefKcal, protein: r.riskli ? null : r.protein, karb: r.riskli ? null : r.karb, yag: r.riskli ? null : r.yag, lif: r.lif, su_ml: r.suMl, onerilen_programlar: oneri.map((p) => p.slug), onboarding_tamam: true });
      if (u.su) { u.su.hedef_ml = r.suMl; DD.demo.kaydet(); }
      DD.oturum.ac();
    }
    const makro = [['Protein', r.protein, r.oran[0], 'var(--makro-protein)', 'm-protein'], ['Karbonhidrat', r.karb, r.oran[1], 'var(--makro-karb)', 'm-karb'], ['Yağ', r.yag, r.oran[2], 'var(--makro-yag)', 'm-yag']];
    /* Cevaplar geri okunur: plan neden böyle */
    const tempo = S.kiloHedefli(c) ? S.bul('tempo', c.tempo) : null, tarz = (c.beslenme_tarzi || []).map((x) => S.etiket('beslenme_tarzi', x)).join(', ');
    const madde = ['Hedefin: ' + S.etiket('hedef', c.hedef).toLocaleLowerCase('tr-TR')];
    if (tempo) madde.push(tempo.ad + ' tempo, ' + tempo.alt.toLocaleLowerCase('tr-TR'));
    if (tarz) madde.push('Beslenme tarzın: ' + tarz.toLocaleLowerCase('tr-TR'));
    madde.push('Günde ' + c.ogun_sayisi + ' öğün' + (c.oruc_protokol !== 'yok' ? ', ' + S.etiket('oruc_protokol', c.oruc_protokol) + ' penceresi' : ''));
    const notlar = [];
    if (r.altSinir) notlar.push('Hesap güvenli alt sınırın altında kaldığı için hedefin 1.200 kcal olarak tutuldu.');
    const uzmanYolu = '<div class="kart"><div class="kart-govde"><div class="uyari-kutu adim-not"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>Bu durumda enerji ihtiyacı kişiye özeldir, bu yüzden sana bir kalori hedefi çıkarmadık. Planını bir uzmanla kurmanı öneririz.</span></div></div></div>';
    const sayilar = '<div class="kart"><div class="kart-govde"><span class="alan-etiket">Günlük kalori hedefin</span><div class="sayi-vurgu"><b>' + M.sayi(r.hedefKcal, 0) + '</b> kcal</div>'
      + '<div class="yigma-cubuk" role="img" aria-label="' + makro.map((m) => m[0] + ' yüzde ' + m[2]).join(', ') + '">' + makro.map((m) => '<span data-oran="' + m[2] + '" data-renk="' + m[3] + '"></span>').join('') + '</div>'
      + '<div class="grafik-lejant">' + makro.map((m) => '<span class="lejant-kalem ' + m[4] + '">' + m[0] + ' ' + m[1] + ' g</span>').join('') + '</div>'
      + '<dl class="kunye iki-sutun sonuc-kunye"><div><dt>Lif</dt><dd>' + r.lif + ' g</dd></div><div><dt>Su</dt><dd>' + M.sayi(r.suMl / 1000, 1) + ' L</dd></div><div><dt>Öğün</dt><dd>' + c.ogun_sayisi + ' öğün</dd></div><div><dt>' + (r.hedefTarihi ? 'Hedef tarihi' : 'Yöntem') + '</dt><dd>' + (r.hedefTarihi ? kac(r.hedefTarihi) : 'Mifflin-St Jeor') + '</dd></div></dl>'
      + notlar.map((n) => '<div class="uyari-kutu adim-not"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>' + kac(n) + '</span></div>').join('') + '</div></div>';
    const yol = r.hafta ? '<div class="kart"><div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid fa-chart-line" aria-hidden="true"></i> Hedefe giden yol</h2><p>Bugünden hedef kilona, yaklaşık ' + r.hafta + ' hafta. Bu süre tahmindir, kesin değildir.</p></div></div><div class="kart-govde"><div id="yolGrafik"></div></div></div>' : '';
    const uzman = '<div class="kart"><div class="kart-govde durum-serit"><div class="durum-serit-metin"><h2 class="kart-baslik">Bir uzmanla ilerlemek ister misin?</h2><p class="kart-metin">Diyetisyenin planını senin için uyarlar, ilerlemeni birlikte izlersiniz.</p></div><a class="dugme birincil" href="' + DD.kok + 'diyetisyen-bul-sihirbazi/"><i class="fa-solid fa-user-doctor" aria-hidden="true"></i> Diyetisyenle eşleş</a></div></div>';
    return '<h1 id="adimBaslik" tabindex="-1">Planın hazır' + (ad ? ', ' + kac(ad) : '') + '</h1><p>' + (r.riskli ? 'Cevaplarına göre ilk adımını bir uzmanla atmanı öneriyoruz.' : 'Hedefini ve günlük ritmini bu değerlerle kurduk.') + '</p>'
      + '<div class="yigin">' + (r.riskli ? uzmanYolu + uzman : sayilar)
      + '<div class="kart"><div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid fa-clipboard-check" aria-hidden="true"></i> Bunlara göre hazırladık</h2></div></div><div class="kart-govde"><ul class="isaretli-liste">' + madde.map((m) => '<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>' + kac(m) + '</span></li>').join('') + '</ul></div></div>'
      + yol
      + '<div class="kart"><div class="kart-bas"><div><h2 class="kart-baslik"><i class="fa-solid fa-list-check" aria-hidden="true"></i> Sana önerilen programlar</h2><p>Hedefin ve beslenme tarzına göre seçildi.</p></div></div><div class="kart-govde bosluksuz"><div class="ayar-liste">'
      + oneri.map((p) => '<a class="ayar-satir" href="' + DD.kok + p.yol.replace(/^\//, '') + '/">' + (p.gorsel ? '<img class="as-gorsel" src="' + DD.kok + 'assets/img/' + p.gorsel + '" alt="" loading="lazy">' : '<span class="as-ikon" aria-hidden="true"><i class="fa-solid fa-utensils"></i></span>') + '<div class="as-metin"><b>' + kac(p.ad) + '</b><span>' + kac(p.neden) + ' · ' + kac(p.sure) + ' · ' + kac(p.enerji) + '</span></div><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a>').join('')
      + '</div></div></div>'
      + (r.riskli ? '' : uzman)
      + '<p class="alan-yardim"><span>Bu hesap tahminidir; tıbbi teşhis ya da tedavi yerine geçmez.</span></p></div>';
  }
  function yolCiz() {
    const el = $('yolGrafik'); if (!el) return;
    const r = S.hesapla(c), bas = c.kilo_kg, son = c.hedef_kilo_kg, N = 4;
    const degerler = Array.from({ length: N + 1 }, (_, i) => +(bas + ((son - bas) * i) / N).toFixed(1));
    const etiketler = degerler.map((_, i) => (i === 0 ? 'Bugün' : i === N ? 'Hedef' : Math.round((r.hafta * i) / N) + '. hafta'));
    DD.grafik.cizgi(el, { baslik: 'Bugünden hedef kilona tahmini seyir', etiketler, seriler: [{ ad: 'Kilo', degerler }], hedef: son, basamak: 1 });
  }

  function ciz(odak) {
    const l = gorunen(), i = l.indexOf(etkin), a = etkin;
    const gorsel = a.gorsel ? '<div class="sihirbaz-gorsel" aria-hidden="true"><i class="fa-solid ' + a.gorsel + '"></i></div>' : '';
    govde.classList.toggle('dar', !a.gorsel);
    govde.innerHTML = '<section class="sihirbaz-adim" id="adim" aria-labelledby="adimBaslik">' + (a.sonuc ? sonucHtml() : (guven ? '<p class="durum-satir tamam guven-satir"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>Teşekkürler, bu bilgi yalnız senin planın için kullanılır.</span></p>' : '') + '<h1 id="adimBaslik" tabindex="-1">' + a.baslik + '</h1><p>' + a.alt + '</p>' + a.ciz() + '<span class="alan-hata" id="adimHata"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> <span></span></span>') + '</section>' + gorsel;
    const kap = $('adim');
    kap.querySelectorAll('.yigma-cubuk [data-oran]').forEach((e) => { e.style.setProperty('--oran', e.dataset.oran); e.style.setProperty('--renk', e.dataset.renk); });
    if (a.kur) a.kur(kap);
    if (a.sonuc) yolCiz();
    const oran = Math.round(((i + 1) / l.length) * 100);
    $('ilerleme').dataset.oran = oran; $('ilerleme').style.setProperty('--oran', oran); $('ilerlemeKap').setAttribute('aria-valuenow', oran);
    sayacYaz();
    $('geri').hidden = i === 0; $('atla').hidden = !a.atlanir; $('ileri').hidden = Boolean(a.sonuc); $('bitir').hidden = !a.sonuc;
    window.scrollTo(0, 0);
    if (odak) { const h = kap.querySelector('h1'); if (h) h.focus({ preventScroll: true }); }
    const g = kap.querySelector('.olcu-girdi input'); if (g && odak) g.focus({ preventScroll: true });
  }
  /* Sayaç ve bölüm taşları: koşullu adım değişince toplam hemen doğru görünür */
  function sayacYaz() {
    const l = gorunen();
    $('sayac').textContent = etkin.bolum + ' · ' + (l.indexOf(etkin) + 1) + '/' + l.length;
    const kap = $('ilerlemeKap');
    kap.querySelectorAll('.ilerleme-tas').forEach((e) => e.remove());
    l.forEach((a, i) => {
      if (!i || l[i - 1].bolum === a.bolum) return;
      const t = document.createElement('i');
      t.className = 'ilerleme-tas'; t.style.setProperty('--konum', (i / l.length) * 100);
      kap.appendChild(t);
    });
  }
  /* Geri giderken bu adımın cevabı doğrulanmadan saklanır */
  function sakla(k) {
    k.querySelectorAll('[data-alan]').forEach((e) => {
      const a = e.dataset.alan;
      if (e.matches('input[type=number]')) { if (e.value !== '') c[a] = Number(e.value); return; }
      if (e.matches('input')) { if (e.value) c[a] = e.value; return; }
      const v = S.secimOku(k, a);
      if (v != null) c[a] = v;
    });
    const r = $('riza'); if (r) c.kvkk_riza = r.checked;
  }
  const git = (y) => { const l = gorunen(), i = l.indexOf(etkin) + y; if (l[i]) { guven = y > 0 && Boolean(etkin.guvenVer); etkin = l[i]; ciz(true); } };
  function ileri() {
    const k = $('adim'), h = etkin.oku(k), e = $('adimHata');
    if (h === false) { const x = k.querySelector('.olcu-girdi.hatali input'); if (x) x.focus(); return; }
    if (h) { e.classList.add('goster'); e.querySelector('span').textContent = h; return; }
    git(1);
  }
  $('ileri').addEventListener('click', ileri);
  $('geri').addEventListener('click', () => { if (!etkin.sonuc) sakla($('adim')); git(-1); });
  $('atla').addEventListener('click', () => { if (etkin.atla) etkin.atla(); git(1); });
  document.addEventListener('dd:secim', () => { const e = $('adimHata'); if (e) e.classList.remove('goster'); if (etkin.id === 'hedef') { sakla($('adim')); sayacYaz(); } });
  govde.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input[type=number],input[type=time]')) { e.preventDefault(); ileri(); } });

  if (baslangic) {
    Object.assign(c, { hedef: 'kilo-vermek', cinsiyet: 'kadin', dogum_yili: 1992, boy_cm: 165, kilo_kg: 72.4, hedef_kilo_kg: 66, tempo: 'dengeli', aktivite: 'orta', beslenme_tarzi: ['akdeniz'] });
    const b = ADIMLAR.find((a) => a.id === baslangic); if (b) etkin = b;
  }
  ciz(false);
})();
