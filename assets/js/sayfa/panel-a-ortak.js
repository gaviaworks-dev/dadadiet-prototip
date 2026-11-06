/* Diyetisyen paneli A: ortak veri erişimi ve küçük arayüz yardımcıları.
   Veri tek kaynak DD.demo; her yazım DD.demo.kaydet() ile üye tarafına da geçer. */
(function () {
  'use strict';
  const DD = window.DD;
  if (!DD || !DD.demo) return; /* kabuk her panel sayfasına yükler; demo katmanı yoksa sessizce çekilir */
  const PA = (window.PA = {});
  const K = DD.kok + 'diyetisyen-paneli/';
  PA.yol = {
    panel: K, takvim: K + 'takvim/', danisanlar: K + 'danisanlar/', mesajlar: K + 'mesajlar/',
    bildirimler: K + 'bildirimler/', planlar: K + 'planlar/',
    danisan: (id, sekme) => K + 'danisanlar/' + id + '/' + (sekme ? '?sekme=' + sekme : ''),
    sohbet: (id) => K + 'mesajlar/?danisan=' + id, /* ?id= kitte kayıt anahtarıdır, başlığı değiştirir */
    plan: (id) => K + 'planlar/olustur/?plan=' + id,
    yeniPlan: (id) => K + 'planlar/olustur/' + (id ? '?danisan=' + id : ''),
  };

  /* ── Metin ve tarih ─────────────────────────────────────────────── */
  PA.h = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  PA.simdi = DD.bugun + 'T13:00';  /* demo günü sabit: saat bu andan önceyse geçmiştir */
  const GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const GUN_K = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const tarihe = (iso) => { const [y, a, g] = iso.slice(0, 10).split('-').map(Number); return new Date(y, a - 1, g); };
  const iki = (n) => String(n).padStart(2, '0');
  PA.iso = (d) => d.getFullYear() + '-' + iki(d.getMonth() + 1) + '-' + iki(d.getDate());
  PA.ekle = (iso, n) => { const d = tarihe(iso); d.setDate(d.getDate() + n); return PA.iso(d); };
  PA.haftaBasi = (iso) => { const d = tarihe(iso); return PA.ekle(iso, -((d.getDay() + 6) % 7)); };
  PA.tarih = (iso) => (iso ? iso.slice(8, 10) + '.' + iso.slice(5, 7) + '.' + iso.slice(0, 4) : '—');
  PA.gunAdi = (iso) => GUN[tarihe(iso).getDay()];
  PA.gunKisa = (iso) => GUN_K[tarihe(iso).getDay()];
  PA.ayAdi = (iso) => { const d = tarihe(iso); return AY[d.getMonth()] + ' ' + d.getFullYear(); };
  PA.uzunTarih = (iso) => { const d = tarihe(iso); return d.getDate() + ' ' + AY[d.getMonth()] + ' ' + GUN[d.getDay()]; };
  PA.ayGun = (iso) => { const d = tarihe(iso); return d.getDate() + ' ' + AY[d.getMonth()]; };
  PA.gunFarki = (a, b) => Math.round((tarihe(b) - tarihe(a)) / 864e5);
  PA.dakika = (s) => { const [a, b] = s.split(':').map(Number); return a * 60 + b; };
  PA.saat = (m) => iki(Math.floor(m / 60)) + ':' + iki(m % 60);
  PA.sayi = (n, b = 1) => (n == null ? '—' : Number(n).toLocaleString('tr-TR', { maximumFractionDigits: b }));
  PA.zaman = (z) => {
    const g = z.slice(0, 10), s = z.slice(11, 16);
    if (g === DD.bugun) return s;
    if (g === PA.ekle(DD.bugun, -1)) return 'Dün';
    return g.slice(8, 10) + '.' + g.slice(5, 7);
  };
  PA.ilkAd = (ad) => ad.split(/\s+/)[0];
  /* Özel ad + ilgi eki: Ayşe'nin, Cem'in, Selma'nın, Tolga'nın */
  PA.ilgi = (ad) => {
    const u = [...ad.toLocaleLowerCase('tr')].filter((c) => 'aıoueiöü'.includes(c)).pop() || 'e';
    const ek = { a: 'ın', ı: 'ın', e: 'in', i: 'in', o: 'un', u: 'un', ö: 'ün', ü: 'ün' }[u];
    return ad + "'" + ('aıoueiöü'.includes(ad.slice(-1).toLocaleLowerCase('tr')) ? 'n' : '') + ek;
  };
  PA.harf = (ad) => ad.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toLocaleUpperCase('tr')).join('');

  /* ── Durum erişimi ──────────────────────────────────────────────── */
  PA.d = () => DD.demo.al();
  PA.kaydet = () => { DD.demo.kaydet(); PA.kabukTazele(); };
  PA.danisanlar = () => PA.d().danisanlar || [];
  PA.danisan = (id) => PA.danisanlar().find((x) => x.id === id);
  PA.paket = (id) => (PA.d().paketler || []).find((x) => x.id === id);
  PA.para = (n) => Number(n).toLocaleString('tr-TR') + ' ₺';
  PA.davetler = () => PA.d().davetler || (PA.d().davetler = []);
  PA.durumlar = {
    aktif: ['Aktif', 'cozulen'], 'yanit-bekliyor': ['Yanıt bekliyor', 'bekleyen'],
    bitti: ['Bitti', 'kapali'], davet: ['Davet gönderildi', 'acik'],
  };
  PA.hap = (etiket, sinif) => '<span class="durum-hapi ' + sinif + '">' + PA.h(etiket) + '</span>';
  PA.danisanHap = (dn) => { const [e, s] = PA.durumlar[dn.durum] || [dn.durum, 'kapali']; return PA.hap(e, s); };
  PA.avatar = (ad) => '<span class="kisi-avatar" aria-hidden="true">' + PA.h(PA.harf(ad)) + '</span>';
  PA.olcer = (yuzde) => '<div class="olcer hap" role="img" aria-label="Yüzde ' + yuzde + '"><span data-oran="' + yuzde + '"></span></div>';
  /* Sonradan basılan [data-oran] öğelerine değer verir (demo.js yalnız açılışta çalışır) */
  PA.oranlar = (kok) => (kok || document).querySelectorAll('[data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran));

  /* İlerleme ölçümlerden okunur: izin kapalıysa ya da ölçüm yoksa sayı üretilmez */
  PA.ilerleme = (dn) => {
    const o = dn.olcumler || [];
    if (!(dn.izinler || {}).olcum || !o.length) return null;
    const bas = o[0].kilo, son = o[o.length - 1].kilo, hedef = dn.hedef_kilo;
    const yol = bas - hedef;
    const yuzde = yol ? Math.max(0, Math.min(100, Math.round(((bas - son) / yol) * 100))) : 100;
    return { bas, son, hedef, yuzde, degisim: Math.round((son - bas) * 10) / 10, hafta: o[o.length - 1].hafta };
  };
  PA.kgMetin = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + PA.sayi(Math.abs(n)) + ' kg';
  PA.gelecekRandevu = (id) => PA.d().randevular
    .filter((r) => r.danisan_id === id && ['dolu', 'onay-bekliyor'].includes(PA.rDurum(r)))
    .sort((a, b) => (a.tarih + a.saat).localeCompare(b.tarih + b.saat))[0];
  PA.takip = (dn) => {
    if (dn.durum === 'bitti') return 'Tamamlandı';
    const aralik = dn.kontrol_araligi || 14;
    if (!PA.gelecekRandevu(dn.id) && PA.gunFarki(dn.son_gorusme, DD.bugun) > aralik) return 'Kontrol gecikti';
    const i = PA.ilerleme(dn);
    if (i && (i.yuzde >= 80 || Math.abs(i.son - i.hedef) <= 1)) return 'Hedefe yakın';
    return 'Yolunda';
  };

  /* ── Randevu ────────────────────────────────────────────────────── */
  PA.rBitis = (r) => PA.dakika(r.saat) + r.sure;
  PA.rGecti = (r) => r.tarih + 'T' + PA.saat(PA.rBitis(r)) <= PA.simdi;
  const R_ETIKET = {
    dolu: ['Planlandı', 'acik'], 'sonuc-bekliyor': ['Sonuç bekliyor', 'bekleyen'], tamamlandi: ['Tamamlandı', 'cozulen'],
    gelmedi: ['Gelmedi', 'hata'], iptal: ['İptal', 'kapali'], 'onay-bekliyor': ['Onay bekliyor', 'bekleyen'],
  };
  /* Kayıtta `dolu` kalmış geçmiş randevu tamamlanmış sayılır; açıkça sonuç bekleyen ayrıdır */
  PA.rDurum = (r) => (r.durum === 'dolu' && PA.rGecti(r) ? 'tamamlandi' : r.durum);
  const rKalem = (r) => R_ETIKET[PA.rDurum(r)] || R_ETIKET.dolu;
  PA.rEtiket = (r) => rKalem(r)[0];
  PA.rHap = (r) => { const [e, s] = rKalem(r); return PA.hap(e, s); };
  PA.rTur = (r) => (r.tur === 'online' ? 'Online' : 'Yüz yüze');
  PA.rIkon = (r) => (r.tur === 'online' ? 'fa-video' : 'fa-location-dot');
  PA.rAcik = (r) => !['iptal'].includes(r.durum);
  /* Onay ve talep kuyruğu: yeni randevu onayı, danışanın iptal ve saat değişikliği talebi */
  PA.bekleyenler = () => (PA.d().randevular || []).filter((r) => r.durum === 'onay-bekliyor' || (r.talep && PA.rAcik(r))).sort((a, b) => (a.tarih + a.saat).localeCompare(b.tarih + b.saat));
  PA.talepAdi = (r) => (r.talep ? (r.talep.tur === 'iptal' ? 'İptal talebi' : 'Saat değişikliği') : '');
  PA.talepRozet = (r) => (r.talep ? `<span class="rozet ${r.talep.tur === 'iptal' ? 'durdu' : 'bekleme'}"><i class="fa-solid ${r.talep.tur === 'iptal' ? 'fa-ban' : 'fa-arrow-right-arrow-left'}" aria-hidden="true"></i> ${PA.talepAdi(r)}</span>` : '');
  PA.rBugun = () => (PA.d().randevular || []).filter((r) => r.tarih === DD.bugun && PA.rAcik(r)).sort((a, b) => a.saat.localeCompare(b.saat));
  PA.kalanSeans = (dn, paketId) => {
    const p = PA.paket(paketId || dn.paket_id);
    if (!p) return null;
    /* Üye ekranıyla aynı hesap: iptal dışındaki her randevu (gelmedi ve planlı dahil) haktan düşer */
    const kullanilan = PA.d().randevular.filter((r) => r.danisan_id === dn.id && r.paket_id === p.id && r.durum !== 'iptal').length;
    return Math.max(0, p.seans - kullanilan);
  };
  /* Üye ekranı "sıradaki görüşme"yi bu alandan okur; randevu değişince güncel kalsın */
  PA.uyeRandevuTazele = () => {
    const u = PA.d().uye;
    if (!u) return;
    const g = PA.gelecekRandevu(u.danisan_id);
    u.gelecek_randevu_id = g ? g.id : null;
  };

  /* Çalışma düzeni: gün aralıkları, ara ve kapalı tarih */
  PA.gunDuzeni = (iso) => {
    const m = PA.d().musaitlik;
    const g = m.haftalik.find((x) => x.gun === PA.gunAdi(iso));
    const kapali = (m.kapali_tarihler || []).find((x) => x.tarih === iso);
    if (kapali) return { acik: false, neden: kapali.neden };
    if (!g || !g.acik) return { acik: false, neden: 'Kapalı' };
    return { acik: true, bas: PA.dakika(g.baslangic), bit: PA.dakika(g.bitis), ara: g.ara ? g.ara.map(PA.dakika) : null };
  };
  /* Saat kapatma: tek seferlik blok, haftalık müsaitliği değiştirmez */
  PA.bloklar = () => PA.d().takvim_bloklari || (PA.d().takvim_bloklari = []);
  PA.blokBul = (iso, bas, bit) => PA.bloklar().find((b) => b.tarih === iso && PA.dakika(b.saat) < bit && PA.dakika(b.saat) + b.sure > bas);
  PA.dolulukVar = (iso, bas, bit, haric) => !!PA.blokBul(iso, bas, bit) || PA.d().randevular.some((r) => r.id !== haric && r.tarih === iso && PA.rAcik(r) && PA.dakika(r.saat) < bit && PA.rBitis(r) > bas);
  PA.slotUygun = (iso, bas, sure, haric) => {
    const g = PA.gunDuzeni(iso), bit = bas + sure;
    if (!g.acik || bas < g.bas || bit > g.bit) return false;
    if (g.ara && bas < g.ara[1] && bit > g.ara[0]) return false;
    if (iso + 'T' + PA.saat(bas) <= PA.simdi) return false;
    const tampon = PA.d().musaitlik.tampon || 0; /* seanslar arası boşluk her iki yöne uygulanır */
    return !PA.dolulukVar(iso, bas - tampon, bit + tampon, haric);
  };
  PA.gunSlotlari = (iso, sure, haric) => {
    const g = PA.gunDuzeni(iso), l = [];
    if (!g.acik) return l;
    for (let m = g.bas; m + sure <= g.bit; m += 30) {
      if (g.ara && m < g.ara[1] && m + sure > g.ara[0]) continue;
      if (iso + 'T' + PA.saat(m) <= PA.simdi) continue;
      l.push({ saat: PA.saat(m), uygun: PA.slotUygun(iso, m, sure, haric) });
    }
    return l;
  };

  /* ── Mesaj ──────────────────────────────────────────────────────── */
  PA.konusma = (id, olustur) => {
    const d = PA.d();
    let k = d.mesajlar.find((x) => x.danisan_id === id);
    if (!k && olustur) { k = { danisan_id: id, okunmamis: 0, mesajlar: [] }; d.mesajlar.push(k); }
    return k;
  };
  PA.okunmamis = () => (PA.d().mesajlar || []).reduce((t, k) => t + (k.okunmamis || 0), 0);
  let sira = 0;
  PA.mesajYaz = (id, metin, ek) => {
    const k = PA.konusma(id, true), d = PA.d();
    const son = k.mesajlar.length ? k.mesajlar[k.mesajlar.length - 1].zaman : '';
    let z = PA.simdi + ':' + iki(sira++ % 60);
    if (son > z) z = DD.bugun + 'T' + son.slice(11, 16) + ':' + iki(sira % 60);
    const m = { kimden: 'diyetisyen', zaman: z, metin: metin || (ek ? ek.ad : '') }; /* yalnız dosyalı mesajda da metin dolu kalır */
    if (ek) m.ek = ek;
    k.mesajlar.push(m);
    if (d.uye && d.uye.danisan_id === id) d.uye.okunmamis_mesaj = (d.uye.okunmamis_mesaj || 0) + 1;
    return m;
  };
  /* Elle yazılan yanıt danışanı bekleyenden çıkarır; otomatik bildirim mesajları çıkarmaz */
  PA.yanitlandi = (id) => { const dn = PA.danisan(id); if (dn && dn.durum === 'yanit-bekliyor') dn.durum = 'aktif'; };

  /* ── Bildirimler: durumdan türer, okundu bilgisi ayrı tutulur ───── */
  PA.okunanlar = () => PA.d().panel_okunan || (PA.d().panel_okunan = {});
  PA.olaylar = () => PA.d().panel_olaylar || (PA.d().panel_olaylar = []);
  PA.olayEkle = (o) => PA.olaylar().unshift(Object.assign({ id: 'o' + Date.now() + (sira++), zaman: PA.simdi }, o));
  PA.bildirimler = () => {
    const d = PA.d(), l = [], ok = PA.okunanlar();
    if (!d.mesajlar || !d.randevular) return l;
    const ad = (id) => { const x = PA.danisan(id); return x ? x.ad : 'Danışan'; };
    d.mesajlar.forEach((k) => {
      const m = k.mesajlar.filter((x) => x.kimden === 'danisan').pop();
      if (!m || PA.gunFarki(m.zaman, DD.bugun) > 7) return;
      l.push({ id: 'm-' + k.danisan_id + m.zaman, tur: 'Mesaj', ikon: 'fa-comments', baslik: ad(k.danisan_id) + ' mesaj gönderdi', metin: m.metin, zaman: m.zaman, git: PA.yol.sohbet(k.danisan_id), okundu: !k.okunmamis });
    });
    (d.danisanlar || []).filter((x) => x.durum === 'yanit-bekliyor').forEach((x) => l.push({ id: 'y-' + x.id, tur: 'Danışan', ikon: 'fa-user-clock', baslik: x.ad + ' yanıtını bekliyor', metin: x.mesaj_ozeti || 'Danışanın senden yanıt bekliyor.', zaman: x.son_gorusme + 'T09:00', git: PA.yol.danisan(x.id) }));
    d.randevular.forEach((r) => {
      if (r.durum === 'sonuc-bekliyor') l.push({ id: 's-' + r.id, tur: 'Randevu', ikon: 'fa-hourglass-half', baslik: ad(r.danisan_id) + ' görüşmesinin sonucu bekleniyor', metin: PA.tarih(r.tarih) + ' ' + r.saat + ' görüşmesini Tamamlandı ya da Gelmedi olarak işaretle.', zaman: r.tarih + 'T' + r.saat, git: PA.yol.takvim + '?randevu=' + r.id });
      if (r.durum === 'iptal' && PA.gunFarki(r.tarih, DD.bugun) < 7 && !r.iptal_eden) l.push({ id: 'i-' + r.id, tur: 'Randevu', ikon: 'fa-calendar-xmark', baslik: ad(r.danisan_id) + ' randevuyu iptal etti', metin: PA.tarih(r.tarih) + ' ' + r.saat + ' görüşmesi iptal edildi, saat yeniden açıldı.', zaman: (r.tarih > DD.bugun ? DD.bugun : r.tarih) + 'T08:00', git: PA.yol.takvim + '?randevu=' + r.id });
    });
    PA.bekleyenler().forEach((r) => {
      const talep = r.talep, kim = ad(r.danisan_id), saat = PA.tarih(r.tarih) + ' ' + r.saat;
      l.push({ id: 'k-' + r.id + (talep ? talep.tur : 'onay'), tur: 'Randevu', ikon: talep ? 'fa-arrow-right-arrow-left' : 'fa-circle-question', baslik: talep ? kim + ' ' + (talep.tur === 'iptal' ? 'iptal istiyor' : 'saat değişikliği istiyor') : kim + ' randevu onayı bekliyor', metin: saat + (talep && talep.neden ? ' · ' + talep.neden : ''), zaman: (talep && talep.zaman) || DD.bugun + 'T08:30', git: PA.yol.takvim + '?randevu=' + r.id, okundu: false });
    });
    (d.danisanlar || []).forEach((x) => {
      const t = (x.tahliller || []).slice(-1)[0];
      if (t && (x.izinler || {}).tahlil && PA.gunFarki(t.tarih, DD.bugun) <= 14) l.push({ id: 't-' + x.id + t.tarih, tur: 'Tahlil', ikon: 'fa-vial', baslik: x.ad + ' yeni tahlil paylaştı', metin: t.dosya_adi, zaman: t.tarih + 'T10:00', git: PA.yol.danisan(x.id, 'tahlil') });
    });
    PA.olaylar().forEach((o) => l.push(o));
    l.forEach((b) => { if (ok[b.id]) b.okundu = true; b.okundu = !!b.okundu; });
    return l.sort((a, b) => b.zaman.localeCompare(a.zaman));
  };

  /* ── Kabuk sayaçları: menü rozetleri ve zil durumdan okunur ─────── */
  const rozet = (bag, n) => {
    const a = document.querySelector('.panel-menu-link[href$="' + bag + '"]');
    if (!a) return;
    let s = a.querySelector('.sayac');
    if (!n) { if (s) s.remove(); return; }
    if (!s) { s = document.createElement('span'); s.className = 'sayac'; a.appendChild(s); }
    s.textContent = n;
  };
  PA.kabukTazele = () => {
    rozet('diyetisyen-paneli/takvim/', PA.rBugun().length);
    rozet('diyetisyen-paneli/mesajlar/', PA.okunmamis());
    rozet('diyetisyen-paneli/danisanlar/', PA.danisanlar().filter((x) => x.durum === 'yanit-bekliyor').length);
    const n = PA.bildirimler().filter((b) => !b.okundu).length;
    const zil = document.querySelector('.panel-ust-sag a.panel-ust-dugme');
    if (zil) {
      zil.setAttribute('aria-label', 'Bildirimler, ' + n + ' okunmamış');
      const b = zil.querySelector('.benek');
      if (b) b.hidden = !n;
    }
  };

  /* ── Üst arama: danışan, randevu, plan ──────────────────────────── */
  function ustArama() {
    const g = document.querySelector('.panel-ust .panel-arama-girdi');
    if (!g) return;
    const y = document.createElement('div');
    y.className = 'acilir-yuzey'; y.hidden = true; y.setAttribute('role', 'listbox'); y.setAttribute('aria-label', 'Arama sonuçları');
    g.parentElement.appendChild(y);
    const kalem = (href, ikon, ad, yan) => '<a class="acilir-kalem" role="option" href="' + href + '"><i class="fa-solid ' + ikon + '" aria-hidden="true"></i>' + PA.h(ad) + '<span class="yan">' + PA.h(yan) + '</span></a>';
    const ara = () => {
      const q = g.value.trim().toLocaleLowerCase('tr');
      if (!q) { y.hidden = true; return; }
      const uy = (s) => s.toLocaleLowerCase('tr').includes(q);
      const d = PA.d();
      const dn = d.danisanlar.filter((x) => uy(x.ad) || uy(x.hedef)).slice(0, 5).map((x) => kalem(PA.yol.danisan(x.id), 'fa-user', x.ad, 'Danışan'));
      const rn = d.randevular.filter((r) => PA.rAcik(r) && r.tarih >= DD.bugun && uy(PA.danisan(r.danisan_id).ad)).slice(0, 3).map((r) => kalem(PA.yol.takvim + '?randevu=' + r.id, 'fa-calendar-check', PA.danisan(r.danisan_id).ad, PA.tarih(r.tarih) + ' ' + r.saat));
      const pl = d.planlar.filter((p) => uy(p.ad)).slice(0, 3).map((p) => kalem(PA.yol.plan(p.id), 'fa-clipboard-list', p.ad, 'Plan'));
      const hepsi = [...dn, ...rn, ...pl];
      y.innerHTML = '<div class="acilir-bas">Sonuçlar</div>' + (hepsi.join('') || '<span class="acilir-kalem">Eşleşen kayıt yok</span>');
      y.hidden = false;
    };
    g.addEventListener('input', ara);
    g.addEventListener('focus', ara);
    g.addEventListener('keydown', (e) => { if (e.key === 'Escape') { y.hidden = true; g.blur(); } });
    document.addEventListener('click', (e) => { if (!g.parentElement.contains(e.target)) y.hidden = true; });
  }

  /* ── Arayüz yardımcıları ────────────────────────────────────────── */
  /* Aktif sekme kalınlaşınca şerit zıplamasın: her sekme kalın hâlinin genişliğini ayırır */
  PA.sekmeSabitle = (ray) => {
    if (!ray) return;
    ray.querySelectorAll('.sekme').forEach((s) => {
      const aktif = s.classList.contains('aktif');
      s.style.removeProperty('min-width');
      s.classList.add('aktif');
      const w = Math.ceil(s.getBoundingClientRect().width);
      if (!aktif) s.classList.remove('aktif');
      if (w) s.style.setProperty('min-width', w + 'px');
    });
  };
  PA.formGecerli = (form) => {
    let ilk = null;
    form.querySelectorAll('.alan-girdi,.alan-secim,.alan-metin').forEach((g) => {
      const ok = window.DM_ALAN_DENETLE ? window.DM_ALAN_DENETLE(g) : g.value.trim() !== '';
      if (!ok && !ilk) ilk = g;
    });
    if (ilk) ilk.focus();
    return !ilk;
  };
  PA.csvIndir = (ad, satirlar) => {
    const csv = satirlar.map((s) => s.map((h) => '"' + String(h == null ? '' : h).replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = ad;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  PA.parametre = (ad) => new URLSearchParams(location.search).get(ad);
  /* GG.AA.YYYY girdisini ISO'ya çevirir; geçersizse null */
  PA.tarihOku = (s) => {
    const m = String(s).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!m) return null;
    const iso = m[3] + '-' + iki(+m[2]) + '-' + iki(+m[1]);
    return PA.iso(tarihe(iso)) === iso ? iso : null;
  };
  PA.kilitGorunum = (etiket, tur, istendi, ad) => '<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid fa-lock" aria-hidden="true"></i></span><h3>' + PA.h(etiket) + ' paylaşılmıyor</h3><p>' + PA.h(ad || 'Danışan') + ' bu veri türü için izin vermedi. İzin verdiğinde içerik burada açılır.</p>' + (istendi ? '<span class="durum-hapi bekleyen">İzin istendi · ' + PA.tarih(istendi) + '</span>' : '<button class="dugme hayalet" type="button" data-izin-iste="' + tur + '"><i class="fa-solid fa-key" aria-hidden="true"></i> İzin iste</button>') + '</div>';

  /* Örnek onay ve talepler: demo.json'a dokunmadan bir kez işaretlenir, üye tarafı aynı durumu okur */
  function tohum() {
    const d = PA.d();
    if (d.demo_tohum_v2 || !d.randevular) return;
    d.demo_tohum_v2 = 1;
    if (d.panel_tohum) { /* önceki tohumu geri al */
      d.randevular = d.randevular.filter((r) => !/^rt\d$/.test(r.id));
      d.randevular.forEach((r) => { if (r.talep && !r.talep.durum) delete r.talep; });
      delete d.panel_tohum;
    }
    const bul = (id) => d.randevular.find((x) => x.id === id && x.durum === 'dolu' && x.danisan_id !== 'd1');
    ['r16', 'r18'].forEach((id) => { const r = bul(id); if (r) r.durum = 'onay-bekliyor'; });
    const talep = (id, t) => { const r = bul(id); if (r && !r.talep) r.talep = Object.assign({ durum: 'bekliyor', zaman: DD.bugun + 'T09:10' }, t); };
    talep('r17', { tur: 'iptal', neden: 'Antrenman saati değişti, bugün gelemiyorum.' });
    talep('r21', { tur: 'saat', yeni_tarih: PA.ekle(DD.bugun, 4), yeni_saat: '11:00', neden: 'Pazartesi öğleden sonra toplantım çıktı.' });
    DD.demo.kaydet();
  }
  /* Otomatik onay kuralı: üyenin yeni randevusu kuyruğa düşmeden kesinleşir */
  function onayKurali() {
    const d = PA.d();
    if (!d.musaitlik || d.musaitlik.onay !== 'otomatik' || !d.randevular) return;
    const l = d.randevular.filter((r) => r.durum === 'onay-bekliyor' && r.olusturan === 'uye');
    l.forEach((r) => { r.durum = 'dolu'; PA.mesajYaz(r.danisan_id, PA.ayGun(r.tarih) + ' ' + r.saat + ' randevunuz onaylandı.'); });
    if (l.length) DD.demo.kaydet();
  }
  try { tohum(); onayKurali(); PA.kabukTazele(); ustArama(); } catch (e) { /* panel-b ekranını sayaç hatası düşürmesin */ }
})();
