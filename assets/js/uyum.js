/* Öğün uyumu: TEK KAYNAK okuyucu. Panel danışan detayı bunu okur; üye tarafı (uye-ortak.js U.planIsaret, U.uyum) aynı veriyi
   aynı kuralla okur ve aynı "Programa uyum" rakamını gösterir. Saf fonksiyonlar, DOM yok, kayıt yazmaz.
   Veri: demo.planlar[i].ogun_isaret = { "YYYY-MM-DD": { kahvalti: true, ara2_atla: true } } (üyenin Uydum / Atladım işaretleri).
   Okuma sırası üye tarafıyla aynı: plan.ogun_isaret → eski durumda uyeYerel.ogunIsaret[plan.id] → DD_VERI.demo içindeki
   planın ogun_isaret kopyası → {}.
   İki ölçü:
   - program: plan başlangıcından bugüne (plan süresiyle sınırlı), bugünün bütün öğünleri dahil; üyenin "Programa uyum" kartı.
   - son: bugün dahil son N gün; geçmiş günün bütün öğünleri, bugünün yalnız işaretli öğünleri sayılır (bekleyen öğün oranı düşürmez). */
(function () {
  'use strict';
  const OGUN = [['kahvalti', 'Kahvaltı', '08:00'], ['ara1', 'Ara Öğün', '10:30'], ['ogle', 'Öğle Yemeği', '13:00'], ['ara2', 'İkindi', '16:00'], ['aksam', 'Akşam Yemeği', '19:30']];
  const gun = (t) => { const p = String(t).slice(0, 10).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  const ekle = (t, n) => { const g = gun(t); g.setDate(g.getDate() + n); return g.getFullYear() + '-' + String(g.getMonth() + 1).padStart(2, '0') + '-' + String(g.getDate()).padStart(2, '0'); };
  const fark = (a, b) => Math.round((gun(b) - gun(a)) / 86400000);
  const UY = (window.UYUM = {});

  UY.plan = (d, danisanId) => (d.planlar || []).filter((p) => p.danisan_id === danisanId && p.durum === 'gonderildi').sort((a, b) => String(b.tarih).localeCompare(String(a.tarih)))[0] || null;
  UY.planBas = (p) => p.baslangic || p.tarih;
  UY.planBit = (p) => ekle(UY.planBas(p), (p.gunler || []).length - 1);
  UY.gunOgunleri = (p, tarih) => {
    const g = (p.gunler || [])[fark(UY.planBas(p), tarih)];
    if (!g) return [];
    const duzen = p.ogun_duzeni || [];
    return OGUN.filter((o) => g.ogunler[o[0]]).map((o) => { const x = duzen.find((y) => y.id === o[0]) || {}; return { anahtar: o[0], ad: x.ad || o[1], saat: x.saat || o[2], kalemler: g.ogunler[o[0]] }; });
  };
  UY.isaretler = (d, p) => {
    if (p.ogun_isaret) return p.ogun_isaret;
    const eski = d.uyeYerel && d.uyeYerel.ogunIsaret && d.uyeYerel.ogunIsaret[p.id];
    if (eski) return eski;
    const tohum = ((((window.DD_VERI || {}).demo || {}).planlar) || []).find((x) => x.id === p.id);
    return (tohum && tohum.ogun_isaret) || {};
  };
  UY.durum = (i, anahtar) => (i && i[anahtar] ? 'uydu' : i && i[anahtar + '_atla'] ? 'atladi' : '');
  const oran = (a, b) => (b ? Math.round((a / b) * 100) : null);
  UY.ozet = (d, p, bugun, gunSayisi) => {
    const n = gunSayisi || 7, isa = UY.isaretler(d, p), bas = UY.planBas(p), bit = UY.planBit(p), son = bugun < bit ? bugun : bit;
    const s = { bas, bit, gunSayisi: n, bugun: [], gunler: [], program: { tamam: 0, toplam: 0, oran: null }, son: { tamam: 0, atla: 0, bos: 0, toplam: 0, oran: null } };
    for (let t = bas; t <= son; t = ekle(t, 1)) {
      const i = isa[t] || {}, l = UY.gunOgunleri(p, t), sonPencere = fark(t, bugun) < n;
      const g = { tarih: t, tamam: 0, atla: 0, toplam: 0 };
      s.program.toplam += l.length;
      l.forEach((o) => {
        const du = UY.durum(i, o.anahtar);
        if (du === 'uydu') s.program.tamam++;
        if (t === bugun) s.bugun.push({ anahtar: o.anahtar, ad: o.ad, saat: o.saat, durum: du, kalem: o.kalemler.length });
        if (!sonPencere) return;
        if (du === 'uydu') { s.son.tamam++; g.tamam++; } else if (du === 'atladi') { s.son.atla++; g.atla++; } else if (t < bugun) s.son.bos++; else return;
        g.toplam++;
      });
      if (sonPencere) s.gunler.push(g);
    }
    s.program.oran = oran(s.program.tamam, s.program.toplam);
    s.son.toplam = s.son.tamam + s.son.atla + s.son.bos;
    s.son.oran = oran(s.son.tamam, s.son.toplam);
    return s;
  };
})();
