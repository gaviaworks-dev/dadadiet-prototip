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
  U.kaydet = () => { if (!U.bosKip) DD.demo.kaydet(); U.ozet(); U.zil(); };
  /* ?bos=1: yeni üyenin ekranı. Kayda yazmadan yalnız bu sayfada veriyi boşaltır */
  U.bosKip = new URLSearchParams(location.search).has('bos');
  if (U.bosKip) {
    const d = U.d(), u = d.uye || {}, id = u.danisan_id;
    const dn = (d.danisanlar || []).find((x) => x.id === id) || {};
    Object.assign(dn, { olcumler: [], tahliller: [], klinik_notlar: [], izin_talepleri: {}, izinler: {}, hassasiyetler: [], kronik: [], anamnez: {}, paket_id: null, hedef_kilo: null });
    d.planlar = (d.planlar || []).filter((p) => p.danisan_id !== id);
    d.randevular = (d.randevular || []).filter((r) => r.danisan_id !== id);
    d.mesajlar = (d.mesajlar || []).filter((m) => m.danisan_id !== id);
    d.uzman_iliskileri = [];
    Object.assign(u, { rozetler: [], kaydedilenler: {}, tercihler: {}, diyetisyen_slug: null, okunmamis_mesaj: 0, su: { hedef_ml: 2000, bugun_ml: 0, hafta: [], ortalama_ml: 0 }, adim: { hedef: 8000, bugun: 0, hafta: [], ortalama: 0 } });
    d.uyeYerel = {};
  }
  /* Oturumdaki üye: demo.uye hesap tarafı, demo.danisanlar içindeki d1 panelin gördüğü kayıt */
  U.uye = () => U.d().uye || {};
  U.uyeId = () => U.uye().danisan_id || 'd1';
  /* Yeme bozukluğu öyküsü: kalori hedefi, kilo hedefi ve kalori sayacı üye alanında görünmez. Sayfalar yalnız buna bakar */
  U.yemeDuyarli = () => ((U.uye().tercihler || {}).hassasiyet || []).includes('yeme-bozuklugu');
  U.UZMAN_NOTU = 'Bir uzmanla birlikte ilerlemen önerilir.';
  U.uzmanNot = () => '<div class="bilgi-notu"><i class="fa-solid fa-user-doctor" aria-hidden="true"></i><p>' + U.UZMAN_NOTU + ' <a href="' + DD.kok + 'diyetisyenler/">Diyetisyenleri gör</a></p></div>';
  U.uzmanSatir = () => '<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid fa-user-doctor" aria-hidden="true"></i></span><div class="as-metin"><b>' + U.UZMAN_NOTU + '</b></div><div class="as-eylem"><a class="dugme hayalet kucuk" href="' + DD.kok + 'diyetisyenler/">Diyetisyenleri gör</a></div></div>';
  /* Program açıklamalarında enerji değeri geçebilir: duyarlı üyede o açıklama boş döner */
  U.enerjisiz = (m) => (U.yemeDuyarli() && /kcal|kalori/i.test(m) ? '' : m);
  /* Kanon bileşenlerinin display kuralı [hidden]'ı ezer: gizleme iki yoldan yazılır */
  U.gizle = (e, gizli) => { if (e) { e.hidden = gizli; e.style.display = gizli ? 'none' : ''; } };
  U.danisan = () => (U.d().danisanlar || []).find((x) => x.id === U.uyeId()) || {};
  U.diyetisyen = () => (U.uye().diyetisyen_slug ? U.d().diyetisyen || null : null);
  U.paket = () => (U.d().paketler || []).find((p) => p.id === U.danisan().paket_id) || null;
  U.randevular = () => (U.d().randevular || []).filter((r) => r.danisan_id === U.uyeId()).sort((a, b) => (a.tarih + a.saat).localeCompare(b.tarih + b.saat));
  /* Panel diyetisyeni dışındaki aktif ve geçmiş uzmanlar. Randevu ve mesajları kendi kaydında durur, panele karışmaz.
     Eski saklı durumda alan yoksa başlangıç verisinden kurulur. */
  U.uzmanlar = () => {
    const d = U.d();
    if (!d.uzman_iliskileri) d.uzman_iliskileri = JSON.parse(JSON.stringify(((window.DD_VERI || {}).demo || {}).uzman_iliskileri || []));
    return d.uzman_iliskileri;
  };
  U.aktifUzmanlar = () => U.uzmanlar().filter((k) => k.durum === 'aktif');
  U.tumRandevular = () => U.uzmanlar().reduce((l, k) => l.concat(k.randevular || []), U.randevular()).sort((a, b) => (a.tarih + a.saat).localeCompare(b.tarih + b.saat));
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
    if (t && t.durum === 'bekliyor') return t.tur === 'iptal' ? 'İptal talebin onay bekliyor' : 'Saat değişikliği talebin (' + U.kisaTarih(t.yeni_tarih) + ', ' + DD.bicim.saat(t.yeni_saat) + ') onay bekliyor';
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
  U.tarih = (t) => (t ? DD.bicim.tarih(String(t)) : '');
  U.kisaTarih = U.tarih;
  U.noktaliTarih = U.tarih;
  U.gunAdi = (t) => GUNLER[gun(t).getDay()];
  U.gunEkle = (t, n) => { const g = gun(t); g.setDate(g.getDate() + n); return g.getFullYear() + '-' + String(g.getMonth() + 1).padStart(2, '0') + '-' + String(g.getDate()).padStart(2, '0'); };
  U.gunFarki = (a, b) => Math.round((gun(b) - gun(a)) / 86400000);
  U.bugun = () => DD.bugun;
  U.sayi = (n, b = 0) => DD.bicim.sayi(n || 0, b, b);
  U.tl = (n) => DD.bicim.para(n || 0, Number.isInteger(Number(n || 0)) ? 0 : 2);

  /* Boş durum: dört parça zorunlu (kanon §7) */
  U.bos = ({ ikon = 'fa-inbox', baslik, metin, eylem = '' }) => '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i></span><h3>' + baslik + '</h3><p>' + metin + '</p>' + eylem + '</div>';
  U.bag = (metin, yol, sinif = 'birincil') => '<a class="dugme ' + sinif + '" href="' + DD.kok + yol + '">' + metin + '</a>';
  U.durum = (sinif, metin, ikon) => '<span class="durum-hapi ' + sinif + (ikon ? ' ikonlu' : '') + '">' + (ikon ? '<i class="fa-solid ' + ikon + '" aria-hidden="true"></i> ' : '') + metin + '</span>';
  U.bas = (kok, html) => { const e = typeof kok === 'string' ? document.querySelector(kok) : kok; if (e) { e.innerHTML = html; U.oranlar(e); } return e; };
  U.oranlar = (kok) => { kok.querySelectorAll('[data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran)); };
  /* Sayfanın bütün içeriği yerine tek boş durum: yeni üyede sekme ve boş kart görünmez */
  U.sayfaBos = (html) => {
    const k = document.querySelector('.modul-govde .zebra');
    k.querySelectorAll('.sekme-ray,.fit-pane').forEach((e) => { e.hidden = true; e.style.display = 'none'; });
    k.insertAdjacentHTML('beforeend', '<div class="fit-pane"><section class="bolum"><div class="wrap kap"><div class="kart panel tam-kolon">' + html + '</div></div></section></div>');
  };
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
    const p = k.program, no = U.gunFarki(p.baslangic, tarih), ol = U.olcek(p);
    /* Kaloriye göre porsiyon: kalemler üyenin enerji hedefine ölçeklenir, öğün ölçeği taşır */
    const kur = (a, ad, saat, ikon, l) => { const o = ogunKur(a, ad, saat, ikon, ol ? olcekle(l, ol.f) : l); if (ol) o.olcek = ol.f; return o; };
    if (p.ornekGunler && p.ornekGunler.length) {
      const g = p.ornekGunler[((no % p.ornekGunler.length) + p.ornekGunler.length) % p.ornekGunler.length];
      return g.ogunler.map((o, i) => { const t = OGUN.find((x) => x[1] === o.tur) || OGUN[i]; return kur(t[0], o.tur, o.saat, t[3], o.kalemler); });
    }
    return OGUN.map((o, i) => { const t = ogunTarifi(TARIF_OGUN[o[0]], karma(p.slug) + no + i); return kur(o[0], o[1], o[2], o[3], t ? [tarifKalem(t)] : []); });
  };
  /* Porsiyon ölçeği: üyenin günlük enerji hedefi (Tercihlerim) / programın enerji aralığının ortası.
     0,7–1,5 arasında, 0,1 adımla; ±%10 içinde ölçeklenmez. Diyetisyen planı ölçeklenmez (enerjisini diyetisyen belirler); yeme bozukluğu öyküsünde kaloriye dayalı ölçek yok */
  /* Kural tercih-uyum.js porsiyonOlcek ile aynı (public program kartları onu kullanır); üye kabuğu her sayfada tercih-uyum yüklemediği için burada da durur */
  U.olcek = function (p) {
    const hedef = Number((U.uye().tercihler || {}).kcal) || 0;
    const m = String((p && p.enerji) || '').replace(/\./g, '').match(/(\d{3,})(?:\D+(\d{3,}))?/);
    if (!hedef || !m || U.yemeDuyarli()) return null;
    const orta = m[2] ? (Number(m[1]) + Number(m[2])) / 2 : Number(m[1]), f = Math.round(Math.min(1.5, Math.max(0.7, hedef / orta)) * 10) / 10;
    return Math.abs(f - 1) < 0.1 ? null : { f, hedef, orta: Math.round(orta) };
  };
  const olcekle = (l, f) => l.map((x) => {
    const y = { ...x };
    ['miktar', 'gram', 'kcal', 'protein', 'yag', 'karb'].forEach((a) => { if (y[a] != null && y[a] !== '') y[a] = Number(y[a]) * f; });
    if (y.olcu) y.olcu += ' ×' + DD.bicim.sayi(f, 1, 1);
    return y;
  });
  U.olcekMetin = (p) => { const o = U.olcek(p); return o ? 'Porsiyonlar enerji hedefine (' + DD.bicim.kcal(o.hedef) + ') göre ×' + DD.bicim.sayi(o.f, 1, 1) + ' ölçeklendi; programın kendi düzeyi ~' + DD.bicim.kcal(o.orta) + '.' : ''; };
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
  /* Öğün işaretleri gün bazında. Biçim: { 'YYYY-MM-DD': { <öğün>: true (Plana uydum), '<öğün>_atla': true (Atladım) } }.
     Diyetisyenin gönderdiği plan: işaretler planın kendi kaydında, DD.demo planlar[].ogun_isaret; panel danışan detayında oradan okur (F7).
     Üyenin kendi başlattığı program: uyeYerel.ogunIsaret[<program slug>], yalnız üye tarafı. */
  U.isaretler = () => U.yerel('ogunIsaret', {});
  U.planIsaret = function (p) {
    if (!p.ogun_isaret) {
      /* Eski tarayıcı durumu üye alanında tutuyordu: plana taşınır. Yoksa başlangıç verisindeki işaretler gelir */
      const eski = U.isaretler(), ilk = (((window.DD_VERI || {}).demo || {}).planlar || []).find((x) => x.id === p.id);
      p.ogun_isaret = eski[p.id] || (ilk && ilk.ogun_isaret ? JSON.parse(JSON.stringify(ilk.ogun_isaret)) : {});
      delete eski[p.id];
    }
    return p.ogun_isaret;
  };
  U.isaret = (k, tarih) => {
    let i;
    if (k.tip === 'plan') i = U.planIsaret(k.plan);
    else { const a = U.isaretler(); i = a[k.anahtar] = a[k.anahtar] || {}; }
    i[tarih] = i[tarih] || {};
    return i[tarih];
  };
  /* Uyum: başlangıçtan bugüne planlanan öğünlerin tamamlanma oranı */
  U.uyum = function (k) {
    if (!k) return { tamam: 0, toplam: 0, oran: 0 };
    const bas = U.kaynakBas(k), sure = k.tip === 'plan' ? k.plan.gunler.length : k.program.sure_gun;
    const son = U.gunEkle(bas, sure - 1), bit = U.bugun() < son ? U.bugun() : son; /* biten programda süre sonrası sayılmaz */
    let tamam = 0, toplam = 0;
    for (let t = bas; t <= bit; t = U.gunEkle(t, 1)) {
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
  U.ogunDurum = (i, o) => (i[o.anahtar] ? 'uydu' : i[o.anahtar + '_atla'] ? 'atladi' : '');
  U.ogunSatir = (o, durum) => '<div class="kalem-satiri' + (durum === 'atladi' ? ' atlandi' : '') + '" data-ogun="' + o.anahtar + '"><span class="ks-ikon"><i class="fa-solid ' + (durum === 'uydu' ? 'fa-check' : durum === 'atladi' ? 'fa-xmark' : o.ikon) + '" aria-hidden="true"></i></span><div class="ks-metin"><b>' + U.kac(o.ad) + ' · ' + DD.bicim.saat(o.saat) + '</b><small>' + U.kac(o.metin) + (o.degisti ? ' (alternatif)' : '') + '</small>' + U.veyaSatir(o) + (o.olcek ? '<small>Porsiyon ×' + DD.bicim.sayi(o.olcek, 1, 1) + ', enerji hedefine göre</small>' : '') + '</div><div class="as-eylem"><div class="segment" role="group" aria-label="' + U.kac(o.ad) + ' durumu"><button class="olumsuz" type="button" data-ogun-durum="atladi" data-ogun-kalem="' + o.anahtar + '" aria-pressed="' + (durum === 'atladi') + '">Atladım</button><button type="button" data-ogun-durum="uydu" data-ogun-kalem="' + o.anahtar + '" aria-pressed="' + (durum === 'uydu') + '">Plana uydum</button></div></div></div>';
  /* Tek dokunuş: gram istemez; aynı seçime tekrar basmak geri alır */
  document.addEventListener('click', (e) => {
    const d = e.target.closest('[data-ogun-durum]');
    if (!d) return;
    const k = U.aktifKaynak(), i = U.isaret(k, U.bugun()), a = d.dataset.ogunKalem, uydu = d.dataset.ogunDurum === 'uydu';
    const onceki = uydu ? i[a] : i[a + '_atla'];
    /* Yalnız işaretli durum yazılır: kayıt panelde okunurken boş anahtar kalmaz */
    delete i[a]; delete i[a + '_atla'];
    if (!onceki) i[uydu ? a : a + '_atla'] = true;
    U.kaydet();
    document.dispatchEvent(new CustomEvent('dd:ogun'));
  });
  U.uyumGovde = function (k) {
    const u = U.uyum(k);
    const bas = U.kaynakBas(k);
    const sure = k.tip === 'plan' ? k.plan.gunler.length : k.program.sure_gun;
    const gun = Math.max(0, Math.min(sure, U.gunFarki(bas, U.bugun()) + 1));
    const s = (i, e, d) => '<div class="sayac"><i class="fa-solid ' + i + '" aria-hidden="true"></i><div><span>' + e + '</span><b>' + d + '</b></div></div>';
    return '<div class="olcer hap" role="img" aria-label="Programa uyum: yüzde ' + u.oran + '"><span data-oran="' + u.oran + '"></span></div><div class="sayac-izgara">' + s('fa-calendar-day', 'Bugün', gun ? gun + '. gün' : 'Başlamadı') + s('fa-utensils', 'Tamamlanan öğün', u.tamam + ' / ' + u.toplam) + s('fa-percent', 'Uyum', '%' + u.oran) + s('fa-flag-checkered', 'Kalan', (sure - gun) + ' gün') + '</div><p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span>Başlangıç <b>' + U.tarih(bas) + '</b>, bitiş <b>' + U.tarih(U.gunEkle(bas, sure - 1)) + '</b>. Uyum, tamamlanan öğünlerin planlanan öğünlere oranıdır; duraklatırsan kalan günler ileri kayar.</span></p>';
  };

  /* Bildirimler: demo kayıtlarından türer, okundu ve silme durumu üye tarafında tutulur */
  U.bildirimler = function () {
    const u = U.uye(), p = U.plan(), dy = U.diyetisyen(), b = U.bugun(), l = [];
    const dyAd = dy ? dy.ad : 'Diyetisyenin';
    if (p) l.push({ id: 'plan-' + p.id, tur: 'program', tarih: p.tarih, baslik: 'Beslenme planın hazır', metin: dyAd + ' senin için hazırladığı ' + p.ad + ' planını paylaştı.', yol: 'hesabim/beslenme-planim/' });
    const R_BASLIK = { dolu: 'Yaklaşan randevun', 'onay-bekliyor': 'Randevu talebin onay bekliyor', 'sonuc-bekliyor': 'Görüşme sonucu bekleniyor', tamamlandi: 'Görüşmen tamamlandı', gelmedi: 'Görüşmeye katılmadın' };
    U.randevular().forEach((r) => {
      const dr = U.rDurum(r), bas = dr === 'iptal' ? (r.iptal_eden === 'diyetisyen' ? 'Diyetisyenin randevuyu iptal etti' : '') : R_BASLIK[dr];
      if (bas) l.push({ id: 'rnd-' + r.id + '-' + dr, tur: 'randevu', tarih: r.tarih >= b ? b : r.tarih, baslik: bas, metin: dyAd + ' ile ' + U.tarih(r.tarih) + ', ' + DD.bicim.saat(r.saat) + ' görüşmen.', yol: 'hesabim/diyetisyenim/#randevu' });
    });
    const son = U.sohbet().mesajlar.filter((m) => m.kimden !== 'danisan').slice(-1)[0];
    if (son) l.push({ id: 'msj-' + son.zaman, tur: 'mesaj', tarih: son.zaman.slice(0, 10), baslik: 'Yeni bir mesajın var', metin: dyAd + ': ' + (son.metin || (son.ek ? son.ek.ad : '')), yol: 'hesabim/diyetisyenim/#mesaj' });
    const dn = U.danisan(), IZ = { olcum: 'ölçüm', tahlil: 'tahlil', gunluk: 'günlük takip', belge: 'belge', anamnez: 'sağlık profili' };
    Object.keys(dn.izin_talepleri || {}).filter((t) => !(dn.izinler || {})[t]).forEach((t) => l.push({ id: 'izn-' + t, tur: 'diyetisyen', tarih: dn.izin_talepleri[t], baslik: 'İzin isteği', metin: dyAd + ' ' + IZ[t] + ' verini görmek istiyor.', yol: 'hesabim/veri-izinlerim/' }));
    if (dn.tahlil_istegi) l.push({ id: 'thl-' + dn.tahlil_istegi.tarih, tur: 'diyetisyen', tarih: dn.tahlil_istegi.tarih, baslik: 'Tahlil isteği', metin: dn.tahlil_istegi.not || dyAd + ' güncel tahlilini istiyor.', yol: 'hesabim/saglik-dosyam/#tahlil' });
    (dn.klinik_notlar || []).filter((x) => x.paylasildi).forEach((x) => l.push({ id: 'not-' + x.tarih, tur: 'diyetisyen', tarih: x.tarih, baslik: 'Diyetisyeninden not', metin: x.metin, yol: 'hesabim/saglik-dosyam/#not' }));
    (u.rozetler || []).forEach((r) => l.push({ id: 'roz-' + r.slug, tur: 'rozet', tarih: r.tarih, baslik: 'Yeni rozet: ' + r.ad, metin: r.aciklama, yol: 'hesabim/rozetlerim/' }));
    const dur = U.yerel('bildirimDurum', { okundu: {}, silindi: {} });
    /* Son iki haftadan eskiler başlangıçta okunmuş sayılır */
    return l.filter((x) => !dur.silindi[x.id]).map((x) => ({ ...x, okundu: dur.okundu[x.id] != null ? dur.okundu[x.id] : U.gunFarki(x.tarih, b) > 14 })).sort((a, c) => c.tarih.localeCompare(a.tarih));
  };
  U.zil = () => { const n = U.bildirimler().filter((x) => !x.okundu).length; document.querySelectorAll('.hb-badge').forEach((e) => { e.textContent = n; e.hidden = !n; }); return n; };

  /* Bugünün toplamı: işaretlenen öğünler ve günlüğe eklenen kalemler */
  U.gunToplam = function () {
    const k = U.aktifKaynak(), b = U.bugun(), i = k ? U.isaret(k, b) : {};
    const ek = (U.yerel('gunlukEk', {})[b]) || [];
    const l = U.secilenOgunler(k, b).filter((o) => i[o.anahtar]).flatMap((o) => o.kalemler.map((x) => ({ ...x, ogun: o.anahtar }))).concat(ek);
    const top = (a) => l.reduce((s, x) => s + (Number(x[a]) || 0), 0);
    return { l, kcal: top('kcal'), protein: top('protein'), karb: top('karb'), yag: top('yag') };
  };

  /* Anamnez duvar değil görevdir: eksik alanlar sayılır, form yarıda bırakılabilir */
  U.ANAMNEZ = [['meslek', 'Meslek'], ['sikayet', 'Şikâyet'], ['uyku', 'Uyku'], ['su', 'Su'], ['hareket', 'Hareket'], ['aile_oykusu', 'Aile öyküsü'], ['aliskanliklar', 'Alışkanlıklar']];
  U.anamnezEksik = () => U.ANAMNEZ.filter(([k]) => !(U.danisan().anamnez || {})[k]);

  /* Sıradaki iş: liste değil öncelik. Üstteki satır önerilen sonraki adımdır */
  U.yapilacaklar = function () {
    const u = U.uye(), dn = U.danisan(), b = U.bugun(), k = U.aktifKaynak(), l = [];
    const ekle = (ikon, baslik, metin, etiket, yol) => l.push({ ikon, baslik, metin, etiket, yol });
    const IZ = { olcum: 'ölçüm', tahlil: 'tahlil', gunluk: 'günlük takip', belge: 'belge', anamnez: 'sağlık profili' };
    const ist = Object.keys(dn.izin_talepleri || {}).filter((t) => !(dn.izinler || {})[t]);
    if (ist.length) ekle('fa-user-shield', 'Diyetisyenin ' + IZ[ist[0]] + ' iznini istedi', 'Kararını Veri İzinlerim ekranından ver.', 'İzni incele', 'hesabim/veri-izinlerim/');
    if (dn.tahlil_istegi) ekle('fa-flask-vial', 'Diyetisyenin tahlil istedi', dn.tahlil_istegi.not || 'Güncel tahlilini yükle.', 'Tahlil yükle', 'hesabim/saglik-dosyam/#tahlil');
    const rs = U.randevular();
    const sonuc = rs.find((r) => r.talep_sonuc === 'red' && r.tarih >= b);
    if (sonuc) ekle('fa-calendar-xmark', 'Randevu talebin reddedildi', U.tarih(sonuc.tarih) + ', ' + DD.bicim.saat(sonuc.saat) + ' görüşmen geçerli.', 'Randevuları gör', 'hesabim/diyetisyenim/#randevu');
    if (u.okunmamis_mesaj) ekle('fa-comments', 'Diyetisyeninden Yeni Mesaj Var', u.okunmamis_mesaj + ' okunmamış mesajın bekliyor.', 'Mesajı aç', 'hesabim/diyetisyenim/#mesaj');
    if (!Object.keys(u.tercihler || {}).length) ekle('fa-user-pen', 'Seni biraz tanıyalım', 'Birkaç soruyla planını ve önerilerini sana göre kuralım.', 'Başla', 'hesabim/hos-geldin/');
    if (k) {
      const i = U.isaret(k, b), bekleyen = U.secilenOgunler(k, b).find((o) => !U.ogunDurum(i, o));
      if (bekleyen) ekle('fa-utensils', 'Sıradaki öğünün: ' + bekleyen.ad, DD.bicim.saat(bekleyen.saat) + ' · plana uydun mu?', 'Öğünü işaretle', 'hesabim/gunluk-takibim/');
    } else ekle('fa-list-check', 'Kendine bir program seç', 'Sana uygun programı bul, bugünün öğünleri hemen hazır olsun.', 'Program bul', 'programlar/program-bul/');
    if (U.anamnezEksik().length && (dn.anamnez_hatirlatma || U.diyetisyen())) ekle('fa-notes-medical', 'Sağlık öykünü tamamla', U.anamnezEksik().length + ' alan eksik; yarıda bırakabilirsin.', 'Devam et', 'hesabim/saglik-dosyam/#profil');
    const s = (dn.olcumler || []).slice(-1)[0];
    if (s && !U.yemeDuyarli() && U.gunFarki(s.tarih, b) >= 7) ekle('fa-weight-scale', 'Ölçüm zamanı', 'Son ölçümün ' + U.tarih(s.tarih) + ' tarihli.', 'Ölçüm Ekle', 'hesabim/saglik-dosyam/#olcum');
    return l;
  };

  /* Kabuk özet şeridi: bütün sekmelerde aynı beş hücre */
  U.ozet = function () {
    const u = U.uye(), dn = U.danisan(), ad = u.ad || dn.ad || '', k = U.aktifKaynak(), dy = U.diyetisyen();
    const s = (dn.olcumler || []).slice(-1)[0], kilo = s ? s.kilo : dn.kilo, hk = dn.hedef_kilo;
    const hedefKcal = (u.tercihler || {}).kcal || (k && k.tip === 'plan' ? k.plan.hedef_kcal : 0);
    const kalan = Math.round(hedefKcal - U.gunToplam().kcal);
    const yaz = (a, metin, yol) => document.querySelectorAll('[data-ozet="' + a + '"]').forEach((e) => { e.querySelector('b').textContent = metin; e.href = DD.kok + yol; });
    document.querySelectorAll('[data-uye]').forEach((e) => {
      const ilk = (dn.olcumler || [])[0], pk = U.paket();
      const v = { adSoyad: ad, harf: (ad[0] || 'A').toLocaleUpperCase('tr'), kullanici: '@' + U.kullaniciAdi(), kademe: 'Ücretsiz', paket: pk ? pk.ad : '', rozet: 'Rozet ' + (u.rozetler || []).length, uyelik: 'Üyelik: ' + (ilk ? U.tarih(ilk.tarih) : U.tarih(U.bugun())) }[e.dataset.uye];
      if (v != null) e.textContent = v;
    });
    document.querySelectorAll('[data-uye-paket]').forEach((e) => { e.hidden = !U.paket(); });
    const g = U.yerel('gorunum', {});
    /* Nitelik de yazılır: demo.js DOMContentLoaded'da data-arkaplan değerini uygular */
    if (g.kapak) document.querySelectorAll('[data-kapak]').forEach((e) => { e.dataset.arkaplan = DD.kok + g.kapak; e.style.backgroundImage = 'url("' + DD.kok + g.kapak + '")'; });
    document.querySelectorAll('[data-uye-avatar]').forEach((e) => {
      e.style.backgroundImage = g.avatar ? 'url("' + g.avatar + '")' : '';
      const h = e.querySelector('[data-uye="harf"]');
      if (h) h.hidden = !!g.avatar;
      e.classList.toggle('harf', !g.avatar);
    });
    /* Duyarlı üyede hedef hücresi uzman notuna döner, kalori hücresi kalkar; Tercihlerim'den geri alınınca eski haline gelir */
    const duyarli = U.yemeDuyarli();
    document.querySelectorAll('[data-ozet="hedef"]').forEach((e) => { e.querySelector('span').textContent = duyarli ? 'Öneri' : 'Hedef'; e.querySelector('i').className = 'fa-solid ' + (duyarli ? 'fa-user-doctor' : 'fa-bullseye'); });
    document.querySelectorAll('[data-ozet="kalori"]').forEach((e) => U.gizle(e, duyarli));
    if (duyarli) yaz('hedef', U.UZMAN_NOTU, 'diyetisyenler/');
    else {
      yaz('hedef', hk ? U.sayi(hk, hk % 1 ? 1 : 0) + ' kg · ' + U.sayi(Math.abs(kilo - hk), 1) + ' kg kaldı' : 'Hedefini belirle', hk ? 'hesabim/saglik-dosyam/#olcum' : 'hesabim/tercihlerim/');
      yaz('kalori', hedefKcal ? (kalan >= 0 ? DD.bicim.kcal(kalan) : DD.bicim.kcal(-kalan) + ' fazla') : 'Hedef yok', 'hesabim/gunluk-takibim/#makro');
    }
    const kisa = (x) => (x.length > 24 ? x.slice(0, 23).trimEnd() + '…' : x);
    yaz('program', k ? kisa(k.ad) : 'Program seç', k ? 'hesabim/beslenme-planim/' : 'programlar/');
    yaz('diyetisyen', dy ? dy.ad + (U.aktifUzmanlar().length ? ' +' + U.aktifUzmanlar().length : '') : 'Diyetisyen bul', dy ? 'hesabim/diyetisyenim/' : 'diyetisyen-bul-sihirbazi/');
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

  /* Kapak ve profil fotoğrafı: kabuk örtüleri, seçim yalnız bu tarayıcıda durur */
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-kapak-uygula]')) {
      const s = document.querySelector('[data-kapak-sec][aria-pressed="true"]');
      U.yerel('gorunum', {}).kapak = s.dataset.kapakSec;
      U.kaydet();
      DD.kapat(document.getElementById('kabukKapak'));
      DD.toast('Kapak görselin değişti.');
    }
    if (e.target.closest('[data-avatar-sil]')) {
      delete U.yerel('gorunum', {}).avatar;
      U.kaydet();
      DD.kapat(document.getElementById('kabukAvatar'));
      DD.toast('Baş harfin kullanılıyor.');
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id !== 'kabukAvatarDosya') return;
    const d = e.target.files[0];
    if (!d) return;
    if (d.size > 5 * 1024 * 1024) { DD.toast('Dosya 5 MB’tan büyük olamaz.', 'hata'); return; }
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'), n = 256, s = Math.min(img.width, img.height);
      c.width = c.height = n;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, n, n);
      U.yerel('gorunum', {}).avatar = c.toDataURL('image/jpeg', 0.8);
      U.kaydet(); URL.revokeObjectURL(img.src);
      DD.kapat(document.getElementById('kabukAvatar'));
      DD.toast('Profil fotoğrafın değişti.');
    };
    img.src = URL.createObjectURL(d);
  });

  /* Yalnız bilgi veren eylemler: [data-mesaj] düğmesi toast verir */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-mesaj],a[data-mesaj]');
    if (!b || b.type === 'submit') return;
    e.preventDefault();
    DD.toast(b.dataset.mesaj, b.dataset.mesajTip);
  });

  U.ozet();
  U.zil();
  if (U.bosKip) document.querySelectorAll('.acct-menu a[href*="hesabim/"]').forEach((a) => { a.href += '?bos=1'; });
  document.querySelectorAll('[data-ayar-form]').forEach(formDoldur);
  /* Sayfa betikleri çizdikten sonra sekmeye git */
  document.addEventListener('DOMContentLoaded', () => {
    const t = location.hash && sekmeBul(location.hash.slice(1));
    if (t) { t.click(); U.rayaGit(); }
  });
})();
