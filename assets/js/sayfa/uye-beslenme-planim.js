/* Beslenme Planım: panelde gönderilen plan ve başlatılan programlar burada yaşar */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const b = U.bugun(), TU = DD.tercihUyum;
  TU.uyeBagla(U);
  const kk = () => U.aktifKaynak();
  const bolumBas = (i, e, h, m, a) => '<div class="bolum-bas"><div><span class="ust-etiket"><i class="fa-solid ' + i + '" aria-hidden="true"></i> ' + e + '</span><h2>' + U.kac(h) + '</h2>' + (m ? '<p class="giris-metni">' + m + '</p>' : '') + (a ? '<div class="bolum-araclar">' + a + '</div>' : '') + '</div></div>';
  const tarihEtiket = U.tarih(b).replace(/ \d{4}$/, '') + ' ' + U.gunAdi(b);
  const hareketler = () => U.yerel('programHareket', []);
  const durakli = (k) => (k.tip === 'plan' ? !!U.yerel('planDurak', {})[k.anahtar] : k.program.durum === 'duraklatildi');

  function kaynakCiz() {
    const l = U.kaynaklar(), e = $('#bpKaynak'), a = kk();
    e.hidden = l.length < 2;
    e.innerHTML = l.map((k) => '<button class="cip' + (a && k.anahtar === a.anahtar ? ' aktif' : '') + '" type="button" data-deger="' + k.anahtar + '">' + U.kac(k.ad) + '</button>').join('');
  }

  function aktifCiz() {
    const k = kk();
    if (!k) {
      U.bas('#bpAktif', U.bos({ ikon: 'fa-clipboard-list', baslik: 'Aktif programın yok', metin: 'Bir program başlattığında ya da diyetisyenin plan gönderdiğinde burada görünür.', eylem: U.bag('Program kütüphanesine git', 'programlar/') }));
      return;
    }
    const dy = U.diyetisyen();
    const alt = k.tip === 'plan'
      ? '<i class="fa-solid fa-user-doctor" aria-hidden="true"></i> Diyetisyenin: ' + U.kac(dy ? dy.ad : '') + ' · Başlangıç ' + U.tarih(U.planBas(k.plan)) + ' · ' + DD.bicim.kcal(k.plan.hedef_kcal) + ' hedef'
      : U.kac(TU.aciklama(k.program.aciklama || '', k.program)) ;
    U.bas('#bpBas', bolumBas('fa-seedling', 'Aktif programın', k.ad, alt, U.bag('Program kütüphanesi', 'programlar/', 'hayalet')));
    U.bas('#bpNotKap', k.tip === 'plan' && k.plan.danisana_not
      ? '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-comment-medical" aria-hidden="true"></i> Diyetisyeninin notu</h3><p>' + U.kac(dy ? dy.ad : '') + ' · ' + U.tarih(k.plan.tarih) + '</p></div></div><div class="kart-govde okuma"><p>' + U.kac(k.plan.danisana_not) + '</p></div></div>'
      : '');
    U.bas('#bpUyum', U.uyumGovde(k));
    const d = $('#bpDuraklat');
    d.innerHTML = durakli(k) ? '<i class="fa-solid fa-play" aria-hidden="true"></i> Programa devam et' : '<i class="fa-solid fa-pause" aria-hidden="true"></i> Programı duraklat';
    dokumCiz();
    notlarCiz();
  }

  function dokumCiz() {
    const k = kk();
    if (!k) return;
    const bas = U.kaynakBas(k);
    let s = '';
    for (let t = bas; t <= b; t = U.gunEkle(t, 1)) {
      const l = U.gunOgunleri(k, t), i = U.isaret(k, t), n = l.filter((o) => i[o.anahtar]).length;
      const oran = l.length ? Math.round((n / l.length) * 100) : 0;
      s += '<tr><td class="tarih">' + U.kisaTarih(t) + ' · ' + U.gunAdi(t) + '</td><td class="sag">' + n + ' / ' + l.length + '</td><td class="sag">%' + oran + '</td></tr>';
    }
    U.bas('#bpDokum', '<div class="tablo-kap"><table class="tablo panel"><caption class="yalniz-okuyucu">Gün gün tamamlanan öğünler</caption><thead><tr><th scope="col">Gün</th><th scope="col" class="sag">Öğün</th><th scope="col" class="sag">Uyum</th></tr></thead><tbody>' + s + '</tbody></table></div>');
  }

  function notlarCiz() {
    const k = kk(), l = U.yerel('planNotlari', []).filter((n) => n.kaynak === (k && k.anahtar));
    U.bas('#bpNotlar', l.length
      ? '<div class="ayar-liste">' + l.slice().reverse().map((n) => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.tarih(n.tarih) + '</b><span>' + U.kac(n.metin) + '</span></div><span class="as-eylem">' + U.durum('bekleyen', 'İletildi') + '</span></div>').join('') + '</div>'
      : U.bos({ ikon: 'fa-comments', baslik: 'Henüz not göndermedin', metin: 'Planla ilgili sorun ya da değişiklik isteğin varsa buradan ilet.', eylem: '<button class="dugme hayalet" type="button" data-not-ac>Not yaz</button>' }));
  }

  function haftaCiz() {
    const k = kk();
    if (!k) { U.bas('#bpHaftaBas', ''); return; }
    /* Hafta, programın başladığı günden sayılır */
    const kb = U.kaynakBas(k), bas = U.gunEkle(kb, Math.max(0, Math.floor(U.gunFarki(kb, b) / 7)) * 7);
    U.bas('#bpHaftaBas', bolumBas('fa-calendar-week', U.kisaTarih(bas) + ' – ' + U.kisaTarih(U.gunEkle(bas, 6)), 'Haftalık menün', 'Gün gün öğünlerin. Değiştirmek için Öğün Alternatifleri sekmesini kullan.', ''));
    /* Kapatılan öğün o günün kaydında yer almaz; kolon haftanın herhangi bir gününde varsa görünür */
    const haftaGunleri = [0, 1, 2, 3, 4, 5, 6].map((i) => U.gunOgunleri(k, U.gunEkle(bas, i)));
    const tanim = U.ogunTanimi.filter((o) => haftaGunleri.some((g) => g.some((x) => x.anahtar === o[0])));
    $('#bpHaftaBaslik').innerHTML = '<tr><th scope="col">Gün</th>' + tanim.map((o) => '<th scope="col">' + o[1] + '</th>').join('') + '<th scope="col">Durum</th></tr>';
    let s = '';
    for (let i = 0; i < 7; i++) {
      const t = U.gunEkle(bas, i), l = U.secilenOgunler(k, t);
      const hap = t === b ? U.durum('acik', 'Bugün') : t < b ? U.durum('cozulen', 'Geçti') : U.durum('kapali', 'Planlandı');
      s += '<tr><td><span class="no">' + U.gunAdi(t) + '<small>' + U.kisaTarih(t) + '</small></span></td>' + tanim.map((o) => { const x = l.find((m) => m.anahtar === o[0]); return '<td>' + U.kac(x ? x.metin : '—') + (x ? U.veyaSatir(x) : '') + '</td>'; }).join('') + '<td>' + hap + '</td></tr>';
    }
    U.bas('#bpHafta', s);
    /* Alışveriş listesi: hafta boyunca kalem toplamı */
    const top = {};
    for (let i = 0; i < 7; i++) U.secilenOgunler(k, U.gunEkle(bas, i)).forEach((o) => o.kalemler.forEach((x) => { const a = U.kalemAd(x); top[a] = top[a] || { tarif: x.tur === 'tarif', m: 0 }; if (x.slug) top[a].m += Number(x.miktar || x.gram) || 0; top[a].olcu = x.olcu; }));
    U.bas('#bpAlisverisListe', Object.keys(top).sort((x, y) => x.localeCompare(y, 'tr')).map((a) => '<div class="kalem-satiri"><div class="ks-metin"><b>' + U.kac(a) + '</b></div><span class="ks-uc">' + (top[a].m ? U.sayi(top[a].m) + (top[a].tarif ? ' porsiyon' : ' g') : U.kac(top[a].olcu || '')) + '</span></div>').join(''));
  }

  function ogunCiz() {
    const k = kk();
    U.bas('#bpOgunBas', bolumBas('fa-calendar-day', tarihEtiket, 'Bugünün öğünleri', 'Plana uyduysan tek dokunuşla işaretle; toplamın ve uyumun buna göre güncellenir.', U.bag('Günlük Takibim', 'hesabim/gunluk-takibim/', 'hayalet')));
    const l = U.secilenOgunler(k, b);
    if (!k) { U.bas('#bpOgunler', U.bos({ ikon: 'fa-utensils', baslik: 'Bugün için öğün yok', metin: 'Aktif bir programın olduğunda öğünlerin burada listelenir.', eylem: U.bag('Program seç', 'programlar/') })); return; }
    const i = U.isaret(k, b);
    U.bas('#bpOgunler', l.map((o) => U.ogunSatir(o, U.ogunDurum(i, o))).join('') || U.bugunBos(k));
    const n = l.filter((o) => i[o.anahtar]).length;
    $('#bpOgunOzet').textContent = k.ad + ' · ' + l.length + ' öğün planlandı.';
    $('#bpOgunSayac').textContent = n + ' / ' + l.length + ' tamamlandı';
    $('#bpOgunSayac').className = 'durum-hapi ' + (n === l.length ? 'cozulen' : 'bekleyen');
    $('#bpHepsi').disabled = n === l.length;
    $('#bpOgunNot').textContent = n === l.length ? 'Bugünün bütün öğünleri tamam.' : '';
    /* Pasif düğmenin nedeni ekranda yazar */
    const dy = U.diyetisyen();
    document.querySelectorAll('[data-not-ac]').forEach((d) => { d.disabled = !dy; });
    if (!dy) $('#bpOgunNot').textContent = 'Not gönderebilmek için etkin bir diyetisyenin olmalı.';
    const say = (a) => l.filter((o) => i[o.anahtar]).reduce((t, o) => t + o[a], 0);
    const hed = (a) => l.reduce((t, o) => t + o[a], 0);
    const satir = (ad, a, birim, bs) => { const al = say(a), h = hed(a); return '<tr><td><b>' + ad + '</b></td><td class="tutar sag">' + U.sayi(al, bs) + ' ' + birim + '</td><td class="tutar sag">' + U.sayi(h, bs) + ' ' + birim + '</td><td class="tutar sag">' + U.sayi(Math.max(0, h - al), bs) + ' ' + birim + '</td></tr>'; };
    U.bas('#bpMakro', satir('Enerji', 'kcal', 'kcal', 0) + satir('Protein', 'protein', 'g', 1) + satir('Karbonhidrat', 'karb', 'g', 1) + satir('Yağ', 'yag', 'g', 1));
  }

  function alternatifCiz() {
    const k = kk();
    if (!k) { U.bas('#bpAlternatif', U.bos({ ikon: 'fa-right-left', baslik: 'Alternatif yok', metin: 'Aktif programın olduğunda her öğün için alternatifler burada görünür.', eylem: U.bag('Program seç', 'programlar/') })); return; }
    const sec = (U.yerel('alternatifler', {})[k.anahtar] || {})[b] || {};
    if (!U.gunOgunleri(k, b).length) { U.bas('#bpAlternatif', U.bugunBos(k)); return; }
    U.bas('#bpAlternatif', U.gunOgunleri(k, b).map((o) => {
      const cip = U.alternatif(o).map((t) => '<button class="cip' + (sec[o.anahtar] === t.slug ? ' aktif' : '') + '" type="button" data-alt-ogun="' + o.anahtar + '" data-alt="' + t.slug + '" aria-pressed="' + (sec[o.anahtar] === t.slug) + '">' + U.kac(t.ad) + ' · ' + DD.bicim.kcal(t.kcal) + '</button>').join('');
      return '<div class="kalem-satiri"><span class="ks-ikon"><i class="fa-solid ' + o.ikon + '" aria-hidden="true"></i></span><div class="ks-metin"><b>' + o.ad + ' · ' + DD.bicim.kcal(o.kcal) + '</b><small>' + U.kac(o.metin) + '</small>' + U.veyaSatir(o) + '</div><div class="as-eylem"><div class="cipler">' + cip + '</div></div></div>';
    }).join(''));
  }

  function arsivCiz() {
    const bitti = U.programlar().filter((x) => x.durum === 'tamamlandi');
    U.bas('#bpTamam', bitti.map((x) => '<tr><td><span class="no">' + U.kac(x.ad) + '</span></td><td>' + x.sure_gun + ' gün</td><td class="tarih">' + U.kisaTarih(x.baslangic) + ' – ' + U.kisaTarih(U.gunEkle(x.baslangic, x.sure_gun - 1)) + '</td><td>%' + U.uyum({ anahtar: x.slug, tip: 'program', program: x }).oran + '</td></tr>').join('') || '<tr><td colspan="4" class="bos-hucre">Henüz tamamlanmış bir programın yok.</td></tr>');
    const p = U.plan();
    const l = hareketler().slice().reverse();
    if (p) l.push({ tarih: p.tarih, ad: p.ad, hareket: 'Diyetisyen planı gönderdi' });
    U.bas('#bpGecmis', l.map((h) => '<tr><td class="tarih">' + U.kisaTarih(h.tarih) + '</td><td><span class="no">' + U.kac(h.ad) + '</span></td><td>' + U.kac(h.hareket) + '</td></tr>').join('') || '<tr><td colspan="3" class="bos-hucre">Henüz hareket yok.</td></tr>');
  }

  /* Program için uyarlama bilgisi, diyetisyen planı için aykırı kalem uyarısı */
  function tercihCiz() {
    const k = kk();
    const h = !k ? '' : k.tip === 'plan' ? TU.planUyariHtml(U, k.plan) : TU.bilgiHtml(TU.ogunOzeti(U.gunOgunleri(k, b)));
    document.querySelectorAll('[data-bp-tercih]').forEach((e) => U.bas(e, h));
  }

  function ciz() { kaynakCiz(); aktifCiz(); haftaCiz(); ogunCiz(); alternatifCiz(); arsivCiz(); tercihCiz(); }

  document.addEventListener('dd:suzgec', (e) => {
    if (e.target.id !== 'bpKaynak') return;
    U.yerel('gorunum', {}).kaynak = e.detail.deger; U.kaydet(); ciz();
  });
  document.addEventListener('dd:ogun', () => { ogunCiz(); aktifCiz(); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-alt]');
    if (a) {
      const k = kk(), s = U.yerel('alternatifler', {});
      s[k.anahtar] = s[k.anahtar] || {}; s[k.anahtar][b] = s[k.anahtar][b] || {};
      const o = a.dataset.altOgun, ayni = s[k.anahtar][b][o] === a.dataset.alt;
      if (ayni) delete s[k.anahtar][b][o]; else s[k.anahtar][b][o] = a.dataset.alt;
      U.kaydet(); ogunCiz(); alternatifCiz(); haftaCiz();
      DD.toast(ayni ? 'Öğün plana geri döndü.' : 'Alternatif bugünün planına yazıldı.');
      return;
    }
    if (e.target.closest('[data-not-ac]')) DD.ac('#bpNotModal');
  });
  $('#bpHepsi').addEventListener('click', () => {
    const k = kk(), i = U.isaret(k, b);
    U.gunOgunleri(k, b).forEach((o) => { i[o.anahtar] = true; });
    U.kaydet(); ogunCiz(); aktifCiz();
    DD.toast('Kalan öğünler işaretlendi.');
  });
  $('#bpDokumDugme').addEventListener('click', (e) => {
    const d = $('#bpDokum'), ac = d.hidden;
    d.hidden = !ac; e.currentTarget.setAttribute('aria-expanded', String(ac));
  });
  $('#bpDuraklat').addEventListener('click', () => {
    const k = kk(), yeni = !durakli(k);
    if (k.tip === 'plan') U.yerel('planDurak', {})[k.anahtar] = yeni;
    else k.program.durum = yeni ? 'duraklatildi' : 'devam';
    hareketler().push({ tarih: b, ad: k.ad, hareket: yeni ? 'Duraklatıldı' : 'Devam ettirildi' });
    U.kaydet(); ciz();
    DD.toast(yeni ? 'Program duraklatıldı.' : 'Programa devam ediyorsun.');
  });
  $('#bpYazdir').addEventListener('click', () => window.print());
  $('#bpNotForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const m = $('#bpNotMetin'), metin = m.value.trim(), k = kk();
    if (!metin) return;
    U.yerel('planNotlari', []).push({ kaynak: k.anahtar, tarih: b, metin });
    U.sohbet().mesajlar.push({ kimden: 'danisan', zaman: b + 'T' + new Date().toTimeString().slice(0, 5), metin: 'Plan notu: ' + metin });
    U.sohbet().okunmamis = (U.sohbet().okunmamis || 0) + 1; /* panelde okunmamış görünür */
    U.kaydet(); m.value = ''; DD.kapat($('#bpNotModal')); notlarCiz();
    DD.toast('Notun diyetisyenine iletildi.');
  });
  ciz();
})();
