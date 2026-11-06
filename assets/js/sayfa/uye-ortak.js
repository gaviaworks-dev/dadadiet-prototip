/* Üye ekranlarının ortak davranışı: kimlik doldurma, sekme bağlantısı, ayar formları.
   Bütün veri DD.demo.al() üzerinden okunur; değişiklik DD.demo.kaydet() ile panele yansır. */
(function () {
  'use strict';
  const DD = window.DD;
  const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const U = (window.DDU = {});

  U.kac = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  U.basHarf = (s) => { const m = String(s || ''); return m.charAt(0).toLocaleUpperCase('tr') + m.slice(1); };
  U.d = () => DD.demo.al();
  U.kaydet = () => DD.demo.kaydet();
  /* Oturumdaki üye: demo.uye hesap tarafı, demo.danisanlar içindeki d1 panelin gördüğü kayıt */
  U.uye = () => U.d().uye || {};
  U.uyeId = () => U.uye().danisan_id || 'd1';
  U.danisan = () => (U.d().danisanlar || []).find((x) => x.id === U.uyeId()) || {};
  U.diyetisyen = () => U.d().diyetisyen || null;
  U.paket = () => (U.d().paketler || []).find((p) => p.id === U.danisan().paket_id) || null;
  U.randevular = () => (U.d().randevular || []).filter((r) => r.danisan_id === U.uyeId()).sort((a, b) => (a.tarih + a.saat).localeCompare(b.tarih + b.saat));
  /* Randevu durumu: panelle aynı kural, kayıtta dolu kalmış geçmiş randevu tamamlanmış sayılır */
  U.rDurum = (r) => (r.durum === 'dolu' && r.tarih < U.bugun() ? 'tamamlandi' : r.durum);
  U.rAcik = (r) => ['dolu', 'onay-bekliyor'].includes(U.rDurum(r));
  const R_ETIKET = { dolu: ['Onaylı', 'acik'], 'onay-bekliyor': ['Onay bekliyor', 'bekleyen'], 'sonuc-bekliyor': ['Sonuç bekliyor', 'bekleyen'], tamamlandi: ['Tamamlandı', 'cozulen'], gelmedi: ['Gelmedi', 'hata'], iptal: ['İptal', 'kapali'] };
  U.rHap = (r) => {
    const e = R_ETIKET[U.rDurum(r)] || R_ETIKET.dolu;
    return U.durum(e[1], r.durum === 'iptal' && r.iptal_eden === 'diyetisyen' ? 'Diyetisyen iptal etti' : e[0]);
  };
  U.rTalepMetin = (r) => {
    const t = r.talep;
    if (t && t.durum === 'bekliyor') return t.tur === 'iptal' ? 'İptal talebin onay bekliyor' : 'Saat değişikliği talebin (' + U.kisaTarih(t.yeni_tarih) + ', ' + t.yeni_saat + ') onay bekliyor';
    if (r.talep_sonuc === 'kabul') return 'Talebin kabul edildi';
    if (r.talep_sonuc === 'red') return 'Talebin reddedildi, randevun geçerli';
    return '';
  };
  U.sohbet = () => {
    const d = U.d();
    d.mesajlar = d.mesajlar || [];
    let s = d.mesajlar.find((m) => m.danisan_id === U.uyeId());
    if (!s) { s = { danisan_id: U.uyeId(), okunmamis: 0, mesajlar: [] }; d.mesajlar.push(s); }
    return s;
  };
  /* Üyeye görünen plan: panelde gönderilmiş olan */
  U.plan = () => (U.d().planlar || []).filter((p) => p.danisan_id === U.uyeId() && p.durum === 'gonderildi').sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)))[0] || null;
  /* Şemada karşılığı olmayan üye tarafı durumu tek anahtarda toplanır */
  U.yerel = (ad, varsayilan) => {
    const d = U.d();
    d.uyeYerel = d.uyeYerel || {};
    if (d.uyeYerel[ad] === undefined) d.uyeYerel[ad] = varsayilan;
    return d.uyeYerel[ad];
  };
  const gun = (t) => { const p = String(t).slice(0, 10).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  U.gun = gun;
  U.tarih = (t) => { if (!t) return ''; const g = gun(t); return g.getDate() + ' ' + AYLAR[g.getMonth()] + ' ' + g.getFullYear(); };
  U.kisaTarih = (t) => { if (!t) return ''; const g = gun(t); return g.getDate() + ' ' + AYLAR[g.getMonth()]; };
  U.noktaliTarih = (t) => { if (!t) return ''; const g = gun(t); return String(g.getDate()).padStart(2, '0') + '.' + String(g.getMonth() + 1).padStart(2, '0') + '.' + g.getFullYear(); };
  U.gunAdi = (t) => GUNLER[gun(t).getDay()];
  U.gunEkle = (t, n) => { const g = gun(t); g.setDate(g.getDate() + n); return g.getFullYear() + '-' + String(g.getMonth() + 1).padStart(2, '0') + '-' + String(g.getDate()).padStart(2, '0'); };
  U.gunFarki = (a, b) => Math.round((gun(b) - gun(a)) / 86400000);
  U.bugun = () => DD.bugun;
  U.sayi = (n, b = 0) => Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: b, maximumFractionDigits: b });
  U.tl = (n) => '₺' + Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* Boş durum: dört parça zorunlu (kanon §7) */
  U.bos = ({ ikon = 'fa-inbox', baslik, metin, eylem = '' }) => '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i></span><h3>' + baslik + '</h3><p>' + metin + '</p>' + eylem + '</div>';
  U.bag = (metin, yol, sinif = 'birincil') => '<a class="dugme ' + sinif + '" href="' + DD.kok + yol + '">' + metin + '</a>';
  U.durum = (sinif, metin, ikon) => '<span class="durum-hapi ' + sinif + (ikon ? ' ikonlu' : '') + '">' + (ikon ? '<i class="fa-solid ' + ikon + '" aria-hidden="true"></i> ' : '') + metin + '</span>';
  U.bas = (kok, html) => { const e = typeof kok === 'string' ? document.querySelector(kok) : kok; if (e) { e.innerHTML = html; U.oranlar(e); } return e; };
  U.oranlar = (kok) => { kok.querySelectorAll('[data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran)); };
  U.sayac = (ad, n) => { document.querySelectorAll('.sekme-sayi[data-sayi="' + ad + '"]').forEach((e) => { e.textContent = n; e.hidden = !n; }); };

  U.kullaniciAdi = () => {
    const u = U.uye();
    if (u.kullanici) return u.kullanici;
    return (u.ad || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]/g, '');
  };

  /* Öğün modeli: plan ve başlatılan program aynı şekle iner */
  const OGUN = [['kahvalti', 'Kahvaltı', '08:00', 'fa-mug-saucer'], ['ara1', 'Ara Öğün', '10:30', 'fa-apple-whole'], ['ogle', 'Öğle Yemeği', '13:00', 'fa-utensils'], ['ara2', 'İkindi', '16:00', 'fa-seedling'], ['aksam', 'Akşam Yemeği', '19:30', 'fa-bowl-food']];
  const veri = () => window.DD_VERI || {};
  const dizi = (x, k) => (Array.isArray(x) ? x : (x && x[k]) || []);
  U.besin = (slug) => dizi(veri().besinler, 'besinler').find((b) => b.slug === slug);
  U.tarif = (slug) => dizi(veri().tarifler, 'tarifler').find((t) => t.slug === slug);
  const sluggAd = (s) => String(s).split('-').map((w) => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1)).join(' ');
  U.kalemAd = (k) => {
    if (k.ad) return k.ad;
    if (!k.slug) return 'Plan kalemi';
    const b = k.tur === 'tarif' ? U.tarif(k.slug) : U.besin(k.slug);
    return b ? b.ad : sluggAd(k.slug);
  };
  U.kalemMetin = (k) => {
    const ad = U.kalemAd(k);
    if (k.olcu) return ad + ' ' + k.olcu;
    if (k.tur === 'serbest' || !k.slug || k.miktar == null) return ad; /* panelin serbest metin kalemi */
    return k.tur === 'tarif' ? ad + ' ' + U.sayi(k.miktar, k.miktar % 1 ? 1 : 0) + ' porsiyon' : ad + ' ' + U.sayi(k.miktar) + ' g';
  };
  const topla = (l, a) => l.reduce((t, k) => t + (Number(k[a]) || 0), 0);
  const ogunKur = (anahtar, ad, saat, ikon, kalemler) => ({ anahtar, ad, saat, ikon, kalemler, metin: kalemler.map(U.kalemMetin).join(' + '), veya: kalemler.filter((k) => k.alternatif).map((k) => U.kalemAd(k) + ' yerine ' + U.kalemMetin(k.alternatif)), kcal: topla(kalemler, 'kcal'), protein: topla(kalemler, 'protein'), yag: topla(kalemler, 'yag'), karb: topla(kalemler, 'karb') });
  U.ogunTanimi = OGUN;

  /* Planın başlangıcı panelde seçilir; eski kayıtta gönderim tarihi geçerlidir */
  U.planBas = (p) => p.baslangic || p.tarih;
  U.kaynakBas = (k) => (k.tip === 'plan' ? U.planBas(k.plan) : k.program.baslangic);
  /* Başlatılan programların kaydı */
  U.programlar = () => U.yerel('programlar', []);
  U.kaynaklar = () => {
    const p = U.plan();
    const l = p ? [{ anahtar: p.id, tip: 'plan', ad: p.ad, plan: p }] : [];
    U.programlar().filter((x) => x.durum !== 'tamamlandi').forEach((x) => l.push({ anahtar: x.slug, tip: 'program', ad: x.ad, program: x }));
    return l;
  };
  U.aktifKaynak = () => {
    const l = U.kaynaklar(), a = U.yerel('gorunum', {}).kaynak;
    return l.find((k) => k.anahtar === a) || l[0] || null;
  };
  /* Tarifler öğüne göre ayrılır, program slug'ından sabit bir sıra çıkar */
  const karma = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7);
  const tarifKalem = (t) => ({ tur: 'tarif', slug: t.slug, ad: t.ad, miktar: 1, kcal: t.kcal, protein: t.protein, yag: t.yag, karb: t.karb });
  const ogunTarifi = (tip, sira) => { const l = dizi(veri().tarifler, 'tarifler').filter((t) => t.ogun === tip); return l.length ? l[sira % l.length] : null; };
  const TARIF_OGUN = { kahvalti: 'kahvaltı', ara1: 'ara', ogle: 'öğle', ara2: 'ara', aksam: 'akşam' };
  U.gunOgunleri = function (k, tarih) {
    if (!k) return [];
    if (k.tip === 'plan') {
      /* Gün tarihten bulunur: 1. gün başlangıç tarihidir, gün adı kaydı etiket değildir */
      const g = k.plan.gunler[U.gunFarki(U.planBas(k.plan), tarih)];
      if (!g) return [];
      const duzen = k.plan.ogun_duzeni || [];
      return OGUN.filter((o) => g.ogunler[o[0]]).map((o) => { const d = duzen.find((x) => x.id === o[0]) || {}; return ogunKur(o[0], d.ad || o[1], d.saat || o[2], o[3], g.ogunler[o[0]]); });
    }
    const p = k.program, no = U.gunFarki(p.baslangic, tarih);
    if (p.ornekGunler && p.ornekGunler.length) {
      const g = p.ornekGunler[((no % p.ornekGunler.length) + p.ornekGunler.length) % p.ornekGunler.length];
      return g.ogunler.map((o, i) => { const t = OGUN.find((x) => x[1] === o.tur) || OGUN[i]; return ogunKur(t[0], o.tur, o.saat, t[3], o.kalemler); });
    }
    return OGUN.map((o, i) => { const t = ogunTarifi(TARIF_OGUN[o[0]], karma(p.slug) + no + i); return ogunKur(o[0], o[1], o[2], o[3], t ? [tarifKalem(t)] : []); });
  };
  /* Alternatif: aynı öğün tipinden, enerjisi en yakın tarif */
  U.alternatif = function (o) {
    const adaylar = dizi(veri().tarifler, 'tarifler').filter((t) => t.ogun === TARIF_OGUN[o.anahtar] && !o.kalemler.some((k) => k.slug === t.slug));
    return adaylar.sort((a, b) => Math.abs(a.kcal - o.kcal) - Math.abs(b.kcal - o.kcal)).slice(0, 2);
  };
  /* Seçilen alternatif o günün öğününün yerine geçer */
  U.secilenOgunler = function (k, tarih) {
    const sec = (U.yerel('alternatifler', {})[k ? k.anahtar : ''] || {})[tarih] || {};
    return U.gunOgunleri(k, tarih).map((o) => {
      const t = sec[o.anahtar] && U.tarif(sec[o.anahtar]);
      return t ? Object.assign(ogunKur(o.anahtar, o.ad, o.saat, o.ikon, [tarifKalem(t)]), { degisti: true }) : o;
    });
  };
  /* Öğün işaretleri: gün bazında; plan için son üç gün başlangıç durumu olarak dolu gelir */
  U.isaretler = function () {
    const b = U.bugun(), p = U.plan();
    const tohum = {};
    if (p) {
      const tam = { kahvalti: true, ara1: true, ogle: true, ara2: true, aksam: true };
      tohum[p.id] = { [U.gunEkle(b, -3)]: { ...tam }, [U.gunEkle(b, -2)]: { ...tam, ara2: false }, [U.gunEkle(b, -1)]: { ...tam }, [b]: { kahvalti: true } };
    }
    return U.yerel('ogunIsaret', tohum);
  };
  U.isaret = (k, tarih) => { const i = U.isaretler(); i[k.anahtar] = i[k.anahtar] || {}; i[k.anahtar][tarih] = i[k.anahtar][tarih] || {}; return i[k.anahtar][tarih]; };
  /* Uyum: başlangıçtan bugüne planlanan öğünlerin tamamlanma oranı */
  U.uyum = function (k) {
    if (!k) return { tamam: 0, toplam: 0, oran: 0 };
    const bas = U.kaynakBas(k);
    let tamam = 0, toplam = 0;
    for (let t = bas; t <= U.bugun(); t = U.gunEkle(t, 1)) {
      const l = U.gunOgunleri(k, t), i = U.isaret(k, t);
      toplam += l.length;
      tamam += l.filter((o) => i[o.anahtar]).length;
    }
    return { tamam, toplam, oran: toplam ? Math.round((tamam / toplam) * 100) : 0 };
  };

  /* Plan bugün yoksa neden yok yazar: başlangıç gelecekte ya da süre bitti */
  U.bugunBos = (k) => {
    const bas = U.kaynakBas(k), gelecek = U.bugun() < bas;
    return U.bos({ ikon: 'fa-calendar-day', baslik: gelecek ? 'Planın ' + U.tarih(bas) + ' günü başlıyor' : 'Bu planın süresi doldu', metin: gelecek ? 'Haftalık menünden planını şimdiden inceleyebilirsin.' : 'Diyetisyenin yeni plan gönderdiğinde öğünlerin burada görünür.', eylem: '<a class="dugme hayalet" href="' + DD.kok + 'hesabim/beslenme-planim/#hafta">Haftalık menü</a>' });
  };
  /* Diyetisyenin kaleme eklediği alternatif: veya satırı */
  U.veyaSatir = (o) => (o.veya || []).map((v) => '<small>veya ' + U.kac(v) + '</small>').join('');
  /* Öğün satırı: çip ve anahtar .as-eylem içinde aynı eksende */
  U.ogunSatir = (o, tamam) => '<div class="kalem-satiri" data-ogun="' + o.anahtar + '"><span class="ks-ikon"><i class="fa-solid ' + o.ikon + '" aria-hidden="true"></i></span><div class="ks-metin"><b>' + o.ad + ' · ' + o.saat + '</b><small>' + U.kac(o.metin) + (o.degisti ? ' (alternatif)' : '') + '</small>' + U.veyaSatir(o) + '</div><div class="as-eylem">' + (tamam ? U.durum('cozulen', 'Tamamlandı') : U.durum('bekleyen', 'Bekliyor')) + '<label class="anahtar"><input type="checkbox" data-ogun-isaret="' + o.anahtar + '"' + (tamam ? ' checked' : '') + ' aria-label="' + o.ad + ' tamamlandı"><span class="anahtar-ray"></span></label></div></div>';
  U.uyumGovde = function (k) {
    const u = U.uyum(k);
    const bas = U.kaynakBas(k);
    const sure = k.tip === 'plan' ? k.plan.gunler.length : k.program.sure_gun;
    const gun = Math.max(0, Math.min(sure, U.gunFarki(bas, U.bugun()) + 1));
    const s = (i, e, d) => '<div class="sayac"><i class="fa-solid ' + i + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + d + '</b></div></div>';
    return '<div class="olcer hap" role="img" aria-label="Programa uyum: yüzde ' + u.oran + '"><span data-oran="' + u.oran + '"></span></div><div class="sayac-izgara">' + s('fa-calendar-day', 'Bugün', gun ? gun + '. gün' : 'Başlamadı') + s('fa-utensils', 'Tamamlanan öğün', u.tamam + ' / ' + u.toplam) + s('fa-percent', 'Uyum', '%' + u.oran) + s('fa-flag-checkered', 'Kalan', (sure - gun) + ' gün') + '</div><p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span>Başlangıç <b>' + U.tarih(bas) + '</b>, bitiş <b>' + U.tarih(U.gunEkle(bas, sure - 1)) + '</b>. Uyum, tamamlanan öğünlerin planlanan öğünlere oranıdır.</span></p>';
  };

  /* Bildirimler: demo kayıtlarından türer, okundu ve silme durumu üye tarafında tutulur */
  U.bildirimler = function () {
    const u = U.uye(), p = U.plan(), dy = U.diyetisyen(), b = U.bugun(), l = [];
    const dyAd = dy ? dy.ad : 'Diyetisyenin';
    if (p) l.push({ id: 'plan-' + p.id, tur: 'program', tarih: p.tarih, baslik: 'Beslenme planın hazır', metin: dyAd + ' senin için hazırladığı ' + p.ad + ' planını paylaştı.', yol: 'hesabim/beslenme-planim/' });
    const R_BASLIK = { dolu: 'Yaklaşan randevun', 'onay-bekliyor': 'Randevu talebin onay bekliyor', 'sonuc-bekliyor': 'Görüşme sonucu bekleniyor', tamamlandi: 'Görüşmen tamamlandı', gelmedi: 'Görüşmeye katılmadın' };
    U.randevular().forEach((r) => {
      const dr = U.rDurum(r), bas = dr === 'iptal' ? (r.iptal_eden === 'diyetisyen' ? 'Diyetisyenin randevuyu iptal etti' : '') : R_BASLIK[dr];
      if (bas) l.push({ id: 'rnd-' + r.id + '-' + dr, tur: 'randevu', tarih: r.tarih >= b ? b : r.tarih, baslik: bas, metin: dyAd + ' ile ' + U.tarih(r.tarih) + ', ' + r.saat + ' görüşmen.', yol: 'hesabim/diyetisyenim/#randevu' });
    });
    const son = U.sohbet().mesajlar.filter((m) => m.kimden !== 'danisan').slice(-1)[0];
    if (son) l.push({ id: 'msj-' + son.zaman, tur: 'mesaj', tarih: son.zaman.slice(0, 10), baslik: 'Yeni bir mesajın var', metin: dyAd + ': ' + (son.metin || (son.ek ? son.ek.ad : '')), yol: 'hesabim/diyetisyenim/#mesaj' });
    (u.rozetler || []).forEach((r) => l.push({ id: 'roz-' + r.slug, tur: 'rozet', tarih: r.tarih, baslik: 'Yeni rozet: ' + r.ad, metin: r.aciklama, yol: 'hesabim/rozetlerim/' }));
    const dur = U.yerel('bildirimDurum', { okundu: {}, silindi: {} });
    /* Son iki haftadan eskiler başlangıçta okunmuş sayılır */
    return l.filter((x) => !dur.silindi[x.id]).map((x) => ({ ...x, okundu: dur.okundu[x.id] != null ? dur.okundu[x.id] : U.gunFarki(x.tarih, b) > 14 })).sort((a, c) => c.tarih.localeCompare(a.tarih));
  };
  U.zil = () => { const n = U.bildirimler().filter((x) => !x.okundu).length; document.querySelectorAll('.hb-badge').forEach((e) => { e.textContent = n; e.hidden = !n; }); return n; };

  /* Kimlik bandı */
  U.kimlik = function () {
    const u = U.uye(), dn = U.danisan(), pk = U.paket();
    const ad = u.ad || dn.ad || '';
    const ilk = (dn.olcumler || [])[0];
    const alan = {
      adSoyad: ad,
      harf: (ad[0] || 'A').toLocaleUpperCase('tr'),
      kullanici: '@' + U.kullaniciAdi(),
      paket: pk ? pk.ad : 'Paket yok',
      rozet: (u.rozetler || []).length + ' rozet',
      uyelik: ilk ? 'Üyelik: ' + U.tarih(ilk.tarih) : '',
    };
    document.querySelectorAll('[data-uye]').forEach((e) => { if (alan[e.dataset.uye] != null) e.textContent = alan[e.dataset.uye]; });
    const k = U.yerel('gorunum', {});
    if (k.kapak) document.querySelectorAll('[data-kapak]').forEach((e) => { e.style.backgroundImage = 'url("' + DD.kok + k.kapak + '")'; });
  };

  /* Sekme: adres parçası ile açılır, [data-sekme-git] aynı sayfada sekme değiştirir */
  const sekmeBul = (id) => document.querySelector('.sekmeler[role=tablist] [id$="-tab-' + id + '"]');
  U.sekmeAc = function (id) {
    const t = sekmeBul(id);
    if (!t) return false;
    t.click();
    U.rayaGit('smooth');
    return true;
  };
  /* Sabit üst kabuğun altında kalmasın diye ray kabuk yüksekliği kadar aşağıda durur */
  U.rayaGit = function (davranis) {
    const r = document.querySelector('.sekme-ray'), h = document.querySelector('[data-site-header]');
    if (r) window.scrollTo({ top: r.getBoundingClientRect().top + window.scrollY - (h ? h.offsetHeight : 0) - 16, behavior: davranis || 'auto' });
  };
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-sekme-git]');
    if (g && U.sekmeAc(g.dataset.sekmeGit)) e.preventDefault();
  });
  document.addEventListener('dd:sekme', (e) => {
    const parca = e.detail.id.split('-tab-')[1];
    if (parca) history.replaceState(null, '', '#' + parca);
    const t = document.getElementById(e.detail.id);
    if (t) t.scrollIntoView({ block: 'nearest', inline: 'center' });
  });

  /* Ayar formu: [data-ayar-form="bildirim"] alanları üye durumuna yazılır */
  function formDoldur(f) {
    const v = U.yerel('ayarlar', {})[f.dataset.ayarForm];
    if (!v) return;
    [...f.elements].forEach((a) => {
      if (!a.name || !(a.name in v)) return;
      if (a.type === 'checkbox') a.checked = !!v[a.name];
      else if (a.type === 'radio') a.checked = a.value === v[a.name];
      else a.value = v[a.name];
    });
  }
  U.formVeri = function (f) {
    const v = {};
    [...f.elements].forEach((a) => {
      if (!a.name || a.type === 'password') return;
      if (a.type === 'checkbox') v[a.name] = a.checked;
      else if (a.type === 'radio') { if (a.checked) v[a.name] = a.value; } else v[a.name] = a.value;
    });
    return v;
  };
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-ayar-form]');
    if (!f) return;
    e.preventDefault();
    U.yerel('ayarlar', {})[f.dataset.ayarForm] = U.formVeri(f);
    U.kaydet();
    DD.toast(f.dataset.mesaj || 'Tercihlerin kaydedildi.');
  });

  /* Yalnız bilgi veren eylemler: [data-mesaj] düğmesi toast verir */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-mesaj],a[data-mesaj]');
    if (!b || b.type === 'submit') return;
    e.preventDefault();
    DD.toast(b.dataset.mesaj, b.dataset.mesajTip);
  });

  U.kimlik();
  U.zil();
  document.querySelectorAll('[data-ayar-form]').forEach(formDoldur);
  /* Sayfa betikleri çizdikten sonra sekmeye git */
  document.addEventListener('DOMContentLoaded', () => {
    const t = location.hash && sekmeBul(location.hash.slice(1));
    if (t) { t.click(); U.rayaGit(); }
  });
})();
