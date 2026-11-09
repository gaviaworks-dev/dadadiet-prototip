/* Hesap Ayarları › Öğün Saatlerim (PLAN §3.3). Hesap DDOgun motorunda; bu dosya taslağı tutar, satırları ve canlı önizlemeyi çizer.
   Hatırlatıcı anahtarı ve "kaç dakika önce" anında kaydedilir; saat düzeni taslaktır, Kaydet ile yazılır.
   Oruç açıkken kahvaltı = Tercihlerim'deki ilk öğün saati (uye.tercihler.ilk_ogun_saati, tek kayıt). */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU, OG = window.DDOgun;
  const $ = (s) => document.querySelector(s);
  if (!OG || !$('#ohForm')) return;
  const sablon = U.ogunSablonu(), enCok = sablon.ara_en_cok || 2;
  const ARA = sablon.kurallar.filter((k) => k.pencere_bit_dk != null).map((k) => k.tur);
  const kopya = (x) => JSON.parse(JSON.stringify(x));
  const KURAL = OG.hesapla({ sablon, uye: { ara_sayisi: enCok } }).ogunler; /* şablonun kural metinleri */
  const ikon = (i) => '<i class="fa-solid ' + i + '" aria-hidden="true"></i>';
  const saat = DD.bicim.saat;
  const protokolAd = (p) => (p === 'sirkadiyen' ? 'Sirkadiyen' : String(p).replace('-', ':'));
  let taslak;
  const yukle = () => { const a = U.ogunAyar(), o = U.oruc(); taslak = { ara: a.ara_sayisi, saatler: kopya(U.ogunUyeSaatleri()), ilk: o ? o.ilk_ogun_saati : null }; };
  const satir = (tur) => taslak.saatler.find((x) => x.tur === tur);
  const satirYaz = (tur, alan) => {
    let x = satir(tur);
    if (!x) { x = { tur, saat: null, aktif: true, kaynak: 'uye' }; taslak.saatler.push(x); }
    Object.assign(x, alan);
    if (x.saat == null && x.aktif !== false) taslak.saatler.splice(taslak.saatler.indexOf(x), 1); /* şablondaki hâline döndü: satır gerekmez */
  };
  const oruc = () => { const o = U.oruc(); return o ? { ...o, ilk_ogun_saati: taslak.ilk || o.ilk_ogun_saati } : null; };
  /* Form üyenin kendi düzenini gösterir: plan kümesi ve bugünkü işaretler olmadan */
  const hesap = () => U.ogunHesap({ kaynak: null, isaretsiz: true, ayar: { ...U.ogunAyar(), ara_sayisi: taslak.ara }, saatler: taslak.saatler, oruc: oruc() });
  const planSaati = () => { const l = {}; (U.ogunKumesi(U.aktifKaynak(), U.bugun()) || []).forEach((x) => { if (x.saat) l[x.tur] = x.saat; }); return l; };

  function ustCiz() {
    const a = U.ogunAyar(), h = U.ogunHesap(), od = h.ogunler.find((o) => o.tur === h.odak);
    $('#ohAcik').checked = !!a.acik;
    $('#ohDurumMetin').textContent = a.acik ? 'Açık' + (od ? ' · sıradaki: ' + od.ad + ' ' + saat(od.planlanan) : ' · bugünün öğünleri tamam') : 'Kapalı. Genel Bakış’ta yalnız açma satırı görünür.';
    $('#ohOnce').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.deger) === Number(a.once_dk || 0))));
    $('#ohSessiz').textContent = U.sessizSaat() ? U.sessizMetin() + ' arası. Bu aralığa düşen hatırlatma gönderilmez; Genel Bakış kartı yine görünür.' : 'Kapalı. Hatırlatmalar günün her saatinde gönderilir.';
  }

  function ciz() {
    const h = hesap(), o = oruc(), ps = planSaati(), k = U.aktifKaynak();
    const not = [];
    if (h.oruc) not.push(U.kac(protokolAd(h.oruc.protokol)) + ' aralıklı oruç açık. Yeme penceren <b>' + saat(h.oruc.bas) + '–' + saat(h.oruc.bit) + '</b>; pencere dışına düşen öğün pencere sonuna çekilir ve Genel Bakış kartında not düşülür. Orucu <a href="' + DD.kok + 'hesabim/tercihlerim/">Tercihlerim</a>’den değiştirebilirsin.');
    if (k && k.tip === 'plan') not.push('Diyetisyen planın etkin. ' + (Object.keys(ps).length ? 'Planda saati olan öğünlerde plan saati önce gelir; ' : 'Planında öğün saati yok; ') + 'bu saatler planın öğünlerine uygulanır.');
    U.bas('#ohNotlar', not.map((m, i) => '<div class="bilgi-notu">' + ikon(i === 0 && h.oruc ? 'fa-hourglass-half' : 'fa-user-doctor') + '<p>' + m + '</p></div>').join(''));
    U.gizle($('#ohNotlar'), !not.length);

    const kh = h.ogunler.find((x) => x.tur === 'kahvalti') || { planlanan: h.kahvalti, aktif: true };
    const kg = $('#ohKahvalti');
    if (document.activeElement !== kg) kg.value = o ? o.ilk_ogun_saati : kh.planlanan;
    $('#ohKahvaltiAktif').checked = kh.aktif !== false;
    $('#ohKahvaltiEtiket').textContent = o ? 'İlk öğün saatin (kahvaltı)' : 'Kahvaltı saatin';
    const zincir = KURAL.filter((x) => x.tur !== 'kahvalti' && x.tur !== ARA[1]).map((x) => (ARA.includes(x.tur) ? 'ara öğün' : x.ad.toLocaleLowerCase('tr')) + ' = ' + x.kural).join('; ');
    $('#ohKahvaltiYardim').innerHTML = (o ? 'Bu saat Tercihlerim’deki ilk öğün saatinle aynı kayıttır; burada değiştirirsen orada da değişir. ' : '') + 'Zincir: ' + U.kac(zincir) + '.' + (ps.kahvalti ? ' Planında kahvaltı ' + saat(ps.kahvalti) + '; plan saati önce gelir.' : '') + (kh.aktif === false ? ' Kahvaltı hatırlatması kapalı; zincir yine bu saatten kurulur.' : '');

    const araSay = h.ogunler.filter((x) => ARA.includes(x.tur)).length;
    U.bas('#ohListe', h.ogunler.filter((x) => x.tur !== 'kahvalti').map((x) => {
      const elle = x.kaynak === 'elle', ara = ARA.includes(x.tur);
      const acik = [elle ? 'Elle girdin; kahvaltı kayınca bu saat değişmez.' : 'Şablon: ' + x.kural + '.'];
      if (x.pencere && !elle) acik.push('Pencere ' + saat(x.pencere.bas) + '–' + saat(x.pencere.bit) + ', hatırlatma ' + saat(x.planlanan) + '.');
      x.notlar.filter((n) => n.kod !== 'sessiz').forEach((n) => acik.push(n.metin));
      if (ps[x.tur]) acik.push('Planında ' + saat(ps[x.tur]) + '; plan saati önce gelir.');
      if (x.aktif === false) acik.push('Hatırlatma kapalı.');
      return '<div class="ayar-satir sarmali" data-oh-tur="' + x.tur + '"><span class="as-ikon">' + ikon(x.ikon) + '</span><div class="as-metin"><b>' + U.kac(x.ad) + (elle ? ' <span class="rozet pasif">Elle</span>' : '') + '</b><span>' + U.kac(acik.join(' ')) + '</span></div><div class="as-eylem">'
        + (elle ? U.ikonDugme('fa-rotate-left', x.ad + ' saatini şablona döndür', 'data-oh-coz="' + x.tur + '"') : '')
        + (ara ? U.ikonDugme('fa-trash', x.ad + ' öğününü kaldır', 'data-oh-kaldir="' + x.tur + '"') : '')
        + '<input class="alan-girdi saat-girdi" type="time" step="300" value="' + x.planlanan + '" data-oh-saat="' + x.tur + '" aria-label="' + U.kac(x.ad) + ' saati">'
        + '<label class="anahtar"><input type="checkbox" data-oh-aktif="' + x.tur + '"' + (x.aktif === false ? '' : ' checked') + ' aria-label="' + U.kac(x.ad) + ' hatırlatması"><span class="anahtar-ray"></span></label></div></div>';
    }).join(''));
    const ekle = $('#ohAraEkle');
    ekle.disabled = araSay >= enCok;
    ekle.title = ekle.disabled ? 'En çok ' + enCok + ' ara öğün eklenebilir' : '';
    $('#ohOnizleme span').textContent = 'Bugün: ' + U.ogunOzet(h);
  }

  /* Hatırlatıcı ve süre anında yazılır */
  $('#ohAcik').addEventListener('change', (e) => {
    U.ogunAyar().acik = e.target.checked; U.kaydet(); ustCiz();
    DD.toast(e.target.checked ? 'Öğün hatırlatıcın açıldı. Prototipte bildirim yalnız Bildirimler akışına düşer.' : 'Öğün hatırlatıcın kapatıldı.');
  });
  $('#ohOnce').addEventListener('dd:secim', (e) => {
    const d = Number(e.detail.deger) || 0;
    U.ogunAyar().once_dk = d; U.kaydet(); ustCiz(); ciz();
    DD.toast(d ? 'Hatırlatma öğünden ' + d + ' dk önce gelecek.' : 'Hatırlatma öğün saatinde gelecek.');
  });

  /* Taslak: kahvaltı kayınca sabitlenmemiş öğünler anında değişir */
  $('#ohKahvalti').addEventListener('input', (e) => {
    const v = e.target.value;
    if (!v) return;
    if (U.oruc()) taslak.ilk = v; else satirYaz('kahvalti', { saat: v === (sablon.kurallar[0] || {}).varsayilan_saat ? null : v });
    ciz();
  });
  const form = $('#ohForm');
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.ohSaat && t.value) { satirYaz(t.dataset.ohSaat, { saat: t.value, kaynak: 'uye' }); ciz(); }
    else if (t.dataset.ohAktif) { satirYaz(t.dataset.ohAktif, { aktif: t.checked }); ciz(); }
  });
  /* Ara öğünler sırayla ara1, ara2: ortadakini kaldırınca arkadaki öne geçer */
  const araKaldir = (tur) => {
    const l = ARA.slice(0, taslak.ara).map((t) => satir(t) || null), i = ARA.indexOf(tur);
    l.splice(i, 1);
    taslak.saatler = taslak.saatler.filter((x) => !ARA.includes(x.tur));
    l.forEach((x, n) => { if (x) taslak.saatler.push({ ...x, tur: ARA[n] }); });
    taslak.ara = Math.max(0, taslak.ara - 1);
  };
  form.addEventListener('click', (e) => {
    const c = e.target.closest('[data-oh-coz]'), s = e.target.closest('[data-oh-kaldir]');
    if (c) { satirYaz(c.dataset.ohCoz, { saat: null }); ciz(); DD.toast('Saat şablona döndü; artık kahvaltıyla birlikte kayar.'); }
    if (s) { const ad = (sablon.kurallar.find((k) => k.tur === s.dataset.ohKaldir) || {}).ad; araKaldir(s.dataset.ohKaldir); ciz(); DD.toast((ad || 'Ara öğün') + ' kaldırıldı. Kaydetmeyi unutma.'); }
    if (e.target.closest('#ohAraEkle')) { if (taslak.ara < enCok) { taslak.ara += 1; ciz(); DD.toast('Ara öğün eklendi; öğleden sonraki pencereye yerleşti.'); } }
    if (e.target.closest('#ohSablon')) {
      taslak.saatler = []; taslak.ara = sablon.varsayilan_ara_sayisi == null ? 1 : sablon.varsayilan_ara_sayisi;
      ciz();
      DD.toast('Şablon saatleri yüklendi' + (U.oruc() ? '; ilk öğün saatin Tercihlerim’deki gibi kaldı' : '') + '. Kaydetmeyi unutma.');
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = U.d();
    d.uyeYerel.ogunSaatleri = taslak.saatler;
    U.ogunAyar().ara_sayisi = taslak.ara;
    if (U.oruc() && taslak.ilk) U.uye().tercihler.ilk_ogun_saati = taslak.ilk;
    U.kaydet(); yukle(); ustCiz(); ciz();
    const k = form.querySelector('.kaydedildi');
    if (k) { k.classList.add('gorunur'); setTimeout(() => k.classList.remove('gorunur'), 2400); }
    DD.toast('Öğün saatlerin kaydedildi.');
  });
  /* Sessiz saat Bildirim Tercihleri'nde kaydedilince bilgi satırı yenilenir */
  document.addEventListener('submit', (e) => { if (e.target.matches('[data-ayar-form="bildirim"]')) setTimeout(() => { ustCiz(); ciz(); }, 0); });

  yukle(); ustCiz(); ciz();
})();
