/* Haftalık Menüm: kısıtlara uyan tariflerden yedi günlük menü kurar */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const f = $('#hmForm');
  const tarifler = () => { const t = window.DD_VERI.tarifler; return Array.isArray(t) ? t : t.tarifler; };
  const OGUN = [['kahvaltı', 'Kahvaltı'], ['ara', 'Ara Öğün'], ['öğle', 'Öğle'], ['akşam', 'Akşam']];
  const ESLEME = { laktoz: ['laktoz', 'sut'], gluten: ['gluten'], yumurta: ['yumurta'], kuruyemis: ['kuruyemis'], balik: ['balik', 'kabuklu-deniz'], susam: ['susam'] };
  const durum = () => U.yerel('haftalikMenu', null);
  const bas = U.gunEkle(U.bugun(), -((U.gun(U.bugun()).getDay() + 6) % 7));

  function kur(butce, kisitlar) {
    const yasak = kisitlar.flatMap((k) => ESLEME[k] || []);
    const uygun = tarifler().filter((t) => !t.hassasiyet.some((h) => yasak.includes(h)));
    /* Ekonomik seçimde enerjisi yüksek tarifler sona kalır, sıralama bütçeye göre değişir */
    const sira = butce === 'genis' ? 3 : butce === 'orta' ? 2 : 1;
    const gunler = [];
    for (let g = 0; g < 7; g++) {
      const o = {};
      OGUN.forEach(([tip], i) => {
        const l = uygun.filter((t) => t.ogun === tip);
        o[tip] = l.length ? l[(g * sira + i) % l.length].slug : null;
      });
      gunler.push(o);
    }
    return { butce, kisitlar, gunler, tarih: U.bugun() };
  }

  function ciz() {
    const m = durum();
    if (!m) return;
    const hucre = (s) => { const t = s && U.tarif(s); return t ? '<td><span class="no">' + U.kac(t.ad) + '<small>' + DD.bicim.kcal(t.kcal) + '</small></span></td>' : '<td>—</td>'; };
    const toplam = (g) => OGUN.reduce((a, [tip]) => a + ((g[tip] && (U.tarif(g[tip]) || {}).kcal) || 0), 0);
    U.bas('#hmSonuc', '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-calendar-week" aria-hidden="true"></i> Bu haftanın menüsü</h3><p>' + U.kisaTarih(bas) + ' – ' + U.kisaTarih(U.gunEkle(bas, 6)) + (m.kisitlar.length ? ' · ' + m.kisitlar.length + ' kısıt uygulandı' : '') + '</p></div></div><div class="kart-govde bosluksuz"><div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Haftalık menü"><table class="tablo panel"><caption class="yalniz-okuyucu">Gün gün menü ve enerji</caption><thead><tr><th scope="col">Gün</th>' + OGUN.map((o) => '<th scope="col">' + o[1] + '</th>').join('') + '<th scope="col">Enerji</th></tr></thead><tbody>' + m.gunler.map((g, i) => '<tr><td><span class="no">' + U.gunAdi(U.gunEkle(bas, i)) + '<small>' + U.kisaTarih(U.gunEkle(bas, i)) + '</small></span></td>' + OGUN.map(([tip]) => hucre(g[tip])).join('') + '<td class="tutar">' + DD.bicim.kcal(toplam(g)) + '</td></tr>').join('') + '</tbody></table></div></div><div class="kart-alt eylem"><button class="dugme hayalet" type="button" id="hmYazdir"><i class="fa-solid fa-print" aria-hidden="true"></i> Menüyü yazdır</button></div></div>');
  }

  /* Sağlık dosyasındaki hassasiyet ve kayıtlı seçim forma gelir */
  const m0 = durum();
  const baslangic = m0 ? m0.kisitlar : (U.danisan().hassasiyetler || []);
  baslangic.forEach((k) => { const c = document.getElementById('hmKisit-' + k); if (c) c.checked = true; });
  if (m0) { const r = document.getElementById('hmButce-' + m0.butce); if (r) r.checked = true; }

  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = [...f.querySelectorAll('[name=kisit]:checked')].map((c) => c.value);
    U.d().uyeYerel.haftalikMenu = kur(f.elements.butce.value, v);
    U.kaydet(); ciz();
    $('#hmSonuc').scrollIntoView({ behavior: 'smooth', block: 'start' });
    DD.toast('Haftalık menün hazır.');
  });
  document.addEventListener('click', (e) => { if (e.target.closest('#hmYazdir')) window.print(); });
  ciz();
})();
