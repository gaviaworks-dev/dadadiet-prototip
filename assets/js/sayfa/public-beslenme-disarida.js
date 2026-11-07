/* Dışarıda Ne Yesem: Gourmet mekan süzgeci. Grup içinde VEYA, gruplar arasında VE; il, ilçe ve semt hiyerarşiktir.
   Bir seçeneğin sayacı diğer grupların seçimi uygulanmış sonuç sayısıdır, grubun kendi seçimi kendi sayaçlarını daraltmaz. Dar ekranda panel alttan açılır. */
(function () {
  'use strict';
  const BOYUT = 12, GORUNUR = 6, ARAMA_ESIGI = 10, ULKE = 'TR';
  const al = (id) => document.getElementById(id);
  const panel = al('dzPanel'), perde = al('dzPerde'), ac = al('dzFiltreAc'), kap = al('dzKartlar'), bos = al('dzBos'), sayac = al('dzSayac');
  const sayfalama = al('dzSayfalama'), goster = al('dzGoster'), filtreSayi = al('dzFiltreSayi'), cipler = al('dzCipler'), ulke = al('dzUlke'), yakin = al('dzYakin');
  const alanlar = [...panel.querySelectorAll('[data-filtre-grup]')].map((g) => g.dataset.filtreGrup).filter((a) => a !== 'konum');
  const konumGrup = panel.querySelector('[data-filtre-grup="konum"]');
  const yiginlar = [panel.closest('.bolum-dizi'), panel.closest('main')];
  const harman = new Intl.Collator('tr');
  let sayfa = 1, nokta = null;

  /* Gourmet'in saat hesabı: gece yarısını aşan aralık ertesi güne sarkar. */
  function acikDurum(saatler) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    const gun = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday) + 1;
    const an = p.hour + ':' + p.minute;
    const bugun = saatler[gun] || [], dun = saatler[gun === 1 ? 7 : gun - 1] || [];
    return {
      bugun: bugun.length > 0,
      simdi: bugun.some(([a, k]) => a <= an && (k <= a || an < k)) || dun.some(([a, k]) => k <= a && an < k)
    };
  }

  const mekanlar = [...document.querySelectorAll('[data-mekan]')].map((k) => {
    const m = { k, il: k.dataset.il, ilce: k.dataset.ilce, semt: k.dataset.semt, enlem: +k.dataset.enlem, boylam: +k.dataset.boylam };
    alanlar.forEach((a) => { m[a] = k.dataset[a].split('|'); });
    const durum = acikDurum(JSON.parse(k.dataset.saatler));
    if (durum.simdi) m.acik.push('simdi');
    if (durum.bugun) m.acik.push('bugun');
    return m;
  });

  const kutular = (alan) => [...panel.querySelectorAll('input[name="' + alan + '"]')];
  const degerler = (alan) => kutular(alan).filter((c) => c.checked).map((c) => c.value);
  const uste = (d, n) => d.split('.').slice(0, n).join('.');
  const tekil = (l) => [...new Set(l)];

  function secimler() {
    const s = { ulke: ulke.value === ULKE ? null : ulke.value, il: degerler('il'), ilce: degerler('ilce'), semt: degerler('semt') };
    alanlar.forEach((a) => { s[a] = degerler(a); });
    s.iller = tekil([...s.il, ...s.ilce.map((d) => uste(d, 1)), ...s.semt.map((d) => uste(d, 1))]);
    s.ilceler = tekil([...s.ilce, ...s.semt.map((d) => uste(d, 2))]);
    return s;
  }

  function konumUyar(m, s) {
    if (s.ulke) return false;
    if (!s.iller.length) return true;
    if (!s.iller.includes(m.il)) return false;
    const ilinIlceleri = s.ilceler.filter((d) => uste(d, 1) === m.il);
    if (!ilinIlceleri.length) return true;
    if (!ilinIlceleri.includes(m.ilce)) return false;
    const semtler = s.semt.filter((d) => uste(d, 2) === m.ilce);
    return !semtler.length || semtler.includes(m.semt);
  }

  const uyar = (m, s, haric) => (haric === 'konum' || konumUyar(m, s)) && alanlar.every((a) => a === haric || !s[a].length || s[a].some((d) => m[a].includes(d)));

  function satirSay(c, sayi) {
    c.closest('.filtre-satir').querySelector('.filtre-sayi').textContent = sayi;
  }

  function fazlaKur(grup, satirlar) {
    satirlar.forEach((r, i) => r.classList.toggle('fazla', i >= GORUNUR));
    if (satirlar.some((r) => r.classList.contains('fazla') && r.querySelector('input').checked)) dahaAc(grup, true);
    const daha = grup.querySelector('.filtre-daha');
    if (daha) daha.hidden = satirlar.length <= GORUNUR;
  }

  function dahaAc(grup, acik) {
    grup.classList.toggle('daha-acik', acik);
    const d = grup.querySelector('.filtre-daha');
    if (d) d.querySelector('span').textContent = acik ? d.dataset.az : d.dataset.daha;
  }

  /* Konum satırları: mekanı olan üstte sayıya göre, olmayan altta alfabetik; mekanı olmayan satır soluk ve tıklanabilir. */
  function konumAltGrup(alan, ustler, sayimAl, gorunur) {
    const grup = panel.querySelector('[data-konum-grup="' + alan + '"]');
    const satirlar = [...grup.querySelectorAll('.filtre-satir')].map((r) => {
      const c = r.querySelector('input');
      const sayi = sayimAl(c.value);
      satirSay(c, sayi);
      r.classList.toggle('soluk', sayi === 0);
      r.hidden = Boolean(ustler) && !ustler.includes(r.dataset.ust);
      return { r, sayi, ad: c.dataset.etiket };
    });
    const acik = satirlar.filter((x) => !x.r.hidden).sort((a, b) => b.sayi - a.sayi || harman.compare(a.ad, b.ad));
    const son = grup.querySelector('.filtre-bos');
    acik.forEach((x) => son.before(x.r));
    grup.hidden = !gorunur || !acik.length;
    fazlaKur(grup, acik.map((x) => x.r));
    const ara = grup.querySelector('.filtre-ara');
    ara.hidden = acik.length <= ARAMA_ESIGI;
    if (ara.hidden && ara.querySelector('input').value) { ara.querySelector('input').value = ''; aramaSuz(grup); }
    const rozet = grup.querySelector('.filtre-grup-sayi');
    const secili = acik.filter((x) => x.r.querySelector('input').checked).length;
    rozet.textContent = secili;
    rozet.hidden = !secili;
    return secili;
  }

  function konumCiz(s) {
    const taban = mekanlar.filter((m) => uyar(m, s, 'konum'));
    const sayim = (alan) => (deger) => taban.filter((m) => m[alan] === deger).length;
    [...ulke.options].find((o) => o.value === ULKE).textContent = 'Türkiye (' + taban.length + ')';
    /* Birden çok şehir açıkken ilçenin hangi şehre ait olduğu adında yazar. */
    panel.querySelectorAll('[data-il-ad]').forEach((r) => {
      const ad = r.querySelector('input').dataset.etiket;
      r.querySelector('.filtre-ad').textContent = s.iller.length > 1 ? ad + ' (' + r.dataset.ilAd + ')' : ad;
    });
    const secili = konumAltGrup('il', null, sayim('il'), !s.ulke)
      + konumAltGrup('ilce', s.iller, sayim('ilce'), !s.ulke && s.iller.length > 0)
      + konumAltGrup('semt', s.ilceler, sayim('semt'), !s.ulke && s.ilceler.length > 0)
      + (s.ulke ? 1 : 0);
    grupRozet(konumGrup, secili);
  }

  function grupRozet(g, sayi) {
    const r = g.querySelector(':scope > .filtre-grup-bas .filtre-grup-sayi');
    r.textContent = sayi;
    r.hidden = !sayi;
  }

  function cipCiz(s) {
    const liste = [];
    if (s.ulke) liste.push({ ad: ulke.options[ulke.selectedIndex].textContent, sil: () => { ulke.value = ULKE; } });
    panel.querySelectorAll('input[name]:checked').forEach((c) => liste.push({ ad: c.dataset.etiket, sil: () => dusur(c) }));
    cipler.hidden = !liste.length;
    cipler.replaceChildren(...liste.map((x) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'filtre-cip';
      b.setAttribute('aria-label', 'Filtreyi kaldır: ' + x.ad);
      b.textContent = x.ad + ' ';
      b.insertAdjacentHTML('beforeend', '<i class="fa-solid fa-xmark" aria-hidden="true"></i>');
      b.addEventListener('click', () => { x.sil(); sayfa = 1; ciz(); });
      return b;
    }));
    if (liste.length) {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'filtre-cipler-temizle';
      t.textContent = 'Tümünü Temizle';
      t.addEventListener('click', temizle);
      cipler.append(t);
    }
    return liste.length;
  }

  /* Şehri düşürmek onun ilçe ve semtlerini de düşürür, yoksa alt seçim şehri geri getirirdi. */
  function dusur(c) {
    c.checked = false;
    if (c.name !== 'il' && c.name !== 'ilce') return;
    ['ilce', 'semt'].forEach((a) => kutular(a).forEach((x) => { if (x.value.startsWith(c.value + '.')) x.checked = false; }));
  }

  const mesafe = (m) => (m.enlem - nokta.enlem) ** 2 + ((m.boylam - nokta.boylam) * Math.cos(nokta.enlem * Math.PI / 180)) ** 2;

  function ciz(basaDon) {
    const s = secimler();
    const sirali = nokta ? [...mekanlar].sort((a, b) => mesafe(a) - mesafe(b)) : mekanlar;
    sirali.forEach((m) => kap.append(m.k));
    const uyan = sirali.filter((m) => uyar(m, s));
    const sayfaSayi = Math.max(1, Math.ceil(uyan.length / BOYUT));
    if (sayfa > sayfaSayi) sayfa = 1;
    const gorunen = uyan.slice((sayfa - 1) * BOYUT, sayfa * BOYUT);
    mekanlar.forEach((m) => { m.k.hidden = !gorunen.includes(m); });
    kap.hidden = !uyan.length;
    bos.hidden = Boolean(uyan.length);

    alanlar.forEach((a) => {
      const taban = mekanlar.filter((m) => uyar(m, s, a));
      kutular(a).forEach((c) => satirSay(c, taban.filter((m) => m[a].includes(c.value)).length));
      grupRozet(panel.querySelector('[data-filtre-grup="' + a + '"]'), s[a].length);
    });
    konumCiz(s);

    const secimSayi = cipCiz(s);
    filtreSayi.textContent = secimSayi;
    filtreSayi.hidden = !secimSayi;
    sayac.innerHTML = uyan.length ? '<b>' + uyan.length + ' örnek mekan</b> listeleniyor' : '<b>Sonuç yok</b>';
    goster.textContent = uyan.length + ' Mekanı Göster';

    sayfalama.hidden = sayfaSayi < 2;
    let h = '<button class="sayfa-dugme ok" type="button" data-sayfa="' + (sayfa - 1) + '" aria-label="Önceki sayfa"' + (sayfa === 1 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>';
    for (let i = 1; i <= sayfaSayi; i++) h += '<button class="sayfa-dugme' + (i === sayfa ? ' aktif' : '') + '" type="button" data-sayfa="' + i + '"' + (i === sayfa ? ' aria-current="page"' : '') + '>' + i + '</button>';
    h += '<button class="sayfa-dugme ok" type="button" data-sayfa="' + (sayfa + 1) + '" aria-label="Sonraki sayfa"' + (sayfa === sayfaSayi ? ' disabled' : '') + '><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>';
    sayfalama.innerHTML = h;
    if (basaDon) al('dzListe').scrollIntoView({ block: 'start' });
  }

  function temizle() {
    panel.querySelectorAll('input:checked').forEach((c) => { c.checked = false; });
    panel.querySelectorAll('.filtre-ara input').forEach((a) => { a.value = ''; aramaSuz(a.closest('.filtre-grup')); });
    ulke.value = ULKE;
    nokta = null;
    sayfa = 1;
    ciz();
  }

  function katla(d) {
    return (d || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* Grup içi arama yalnız basılı satırları süzer, eşleşen fazla satır da görünür. */
  function aramaSuz(grup) {
    const sorgu = katla(grup.querySelector('.filtre-ara input').value.trim());
    grup.toggleAttribute('data-arama', sorgu !== '');
    let eslesen = 0;
    grup.querySelectorAll('.filtre-satir:not([hidden])').forEach((r) => {
      const tuttu = !sorgu || katla(r.querySelector('.filtre-ad').textContent).includes(sorgu);
      r.toggleAttribute('data-gizli', !tuttu);
      if (tuttu) eslesen++;
    });
    grup.querySelector('.filtre-bos').hidden = !sorgu || eslesen > 0;
  }

  function paneliAc() {
    panel.classList.add('acik');
    perde.hidden = false;
    /* Panel, bölümün ve ana alanın z-index:2 yığınında kalıp üst çubuğun ve Mentör'ün altına düşüyordu; açıkken ikisi çekmece katına çıkar. */
    yiginlar.forEach((y) => y.style.setProperty('z-index', 'var(--kat-cekmece)'));
    ac.setAttribute('aria-expanded', 'true');
    document.documentElement.style.setProperty('overflow', 'hidden');
    panel.querySelector('.filtre-kapat').focus();
  }

  function paneliKapat() {
    if (!panel.classList.contains('acik')) return;
    panel.classList.remove('acik');
    perde.hidden = true;
    yiginlar.forEach((y) => y.style.removeProperty('z-index'));
    ac.setAttribute('aria-expanded', 'false');
    document.documentElement.style.removeProperty('overflow');
    ac.focus();
  }

  function yakinimdakiler() {
    if (!yakin.checked) { nokta = null; sayfa = 1; ciz(); return; }
    const olmadi = () => { yakin.checked = false; DD.toast('Konumuna ulaşılamadı, tarayıcı iznini kontrol et.', 'uyari'); };
    if (!navigator.geolocation) { olmadi(); return; }
    navigator.geolocation.getCurrentPosition((p) => {
      nokta = { enlem: p.coords.latitude, boylam: p.coords.longitude };
      sayfa = 1;
      ciz();
      DD.toast('Mekanlar sana yakınlığa göre sıralandı.');
    }, olmadi, { timeout: 8000 });
  }

  panel.addEventListener('change', function (e) {
    if (e.target === yakin) { yakinimdakiler(); return; }
    if (e.target === ulke) {
      ['il', 'ilce', 'semt'].forEach((a) => kutular(a).forEach((c) => { c.checked = false; }));
    } else if (!e.target.matches('input[name]')) return;
    sayfa = 1;
    ciz();
  });
  panel.addEventListener('click', function (e) {
    const b = e.target.closest('.filtre-grup-bas');
    if (b) { b.setAttribute('aria-expanded', String(b.parentElement.classList.toggle('acik'))); return; }
    const d = e.target.closest('.filtre-daha');
    if (d) { const g = d.closest('.filtre-grup'); dahaAc(g, !g.classList.contains('daha-acik')); }
  });
  panel.addEventListener('input', function (e) {
    if (e.target.matches('.filtre-ara input')) aramaSuz(e.target.closest('.filtre-grup'));
  });
  panel.addEventListener('keydown', function (e) {
    if (!e.target.matches('.filtre-ara input')) return;
    if (e.key === 'Enter') e.preventDefault();
    if (e.key === 'Escape' && e.target.value) { e.preventDefault(); e.stopPropagation(); e.target.value = ''; aramaSuz(e.target.closest('.filtre-grup')); }
  });
  document.addEventListener('click', function (e) { if (e.target.closest('[data-filtre-kapat]')) paneliKapat(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') paneliKapat(); });
  ac.addEventListener('click', paneliAc);
  sayfalama.addEventListener('click', function (e) {
    const d = e.target.closest('[data-sayfa]');
    if (!d || d.disabled) return;
    sayfa = +d.dataset.sayfa;
    ciz(true);
  });
  al('dzTemizle').addEventListener('click', temizle);
  al('dzBosTemizle').addEventListener('click', temizle);
  ciz();
})();
