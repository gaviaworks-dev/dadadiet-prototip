/* Sağlık Araçları: üyenin son kayıtlı sonuçları (site haritası 7.6). Kaynak demo hesap; bölüm misafirde görünmez (.oturum-acik) */
(function () {
  'use strict';
  const kap = document.querySelector('[data-son-sonuclar]');
  if (!kap) return;
  const ikon = (i) => '<i class="fa-solid ' + i + '" aria-hidden="true"></i>';
  const kac = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const TEST_AD = { beslenme: 'Beslenme testi' };
  function ciz() {
    const u = DD.demo.al().uye || {};
    const h = (u.hesaplayici_sonuclari || []).map((x) => ({ tarih: x.tarih, ikon: 'fa-fire', ad: 'Günlük kalori', deger: DD.bicim.kcal(x.hedef || x.tdee || x.kcal || 0) + ' / gün', yol: 'hesaplayici/gunluk-kalori/' }));
    const t = (u.test_sonuclari || []).map((x) => ({ tarih: x.tarih, ikon: 'fa-clipboard-question', ad: TEST_AD[x.test] || 'Sağlık testi', deger: x.puan + ' puan · ' + (x.sonuc || ''), yol: 'test/beslenme/' }));
    const l = h.concat(t).sort((a, b) => String(b.tarih || '').localeCompare(String(a.tarih || ''))).slice(0, 3);
    kap.innerHTML = l.length
      ? l.map((x) => '<a class="kart ikon-kart" href="' + DD.kok + x.yol + '"><span class="ikon-kutu">' + ikon(x.ikon) + '</span><span class="ikon-kart-metin"><span class="kart-baslik">' + kac(x.ad) + '</span><span class="kart-metin">' + kac(x.deger) + ' · ' + DD.bicim.tarih(x.tarih) + '</span></span>' + ikon('fa-arrow-right ikon-kart-ok') + '</a>').join('')
      : '<div class="bos-durum kart-ici tam-kolon"><span class="bos-ikon">' + ikon('fa-folder-open') + '</span><h3>Henüz kayıtlı sonucun yok</h3><p>Bir hesaplayıcı ya da test çöz, sonucunu Sağlık Dosyana kaydet.</p><a class="dugme birincil" href="' + DD.kok + 'hesaplayici/gunluk-kalori/">Günlük kaloriyi hesapla</a></div>';
  }
  ciz();
  document.addEventListener('dd:oturum', ciz);
})();
