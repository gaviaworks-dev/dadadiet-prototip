/* Test akışı. İlerleme tek hesaptan gelir: yanıtlanan / toplam; metin ve çubuk aynı değeri gösterir. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const T = JSON.parse($('testVeri').textContent), S = T.sorular, n = S.length;
  const enCok = T.sonuclar.reduce((m, s) => Math.max(m, s.max_puan), 0);
  let cevap = [], i = 0, zaman = null;

  const oranYaz = (el, v) => el.style.setProperty('--oran', v);
  function ilerleme() {
    const y = cevap.filter((c) => c != null).length, oran = Math.round((y / n) * 100);
    oranYaz($('testCubuk'), oran);
    $('testCubuk').parentElement.setAttribute('aria-valuenow', oran);
    $('testMetin').textContent = 'Soru ' + (i + 1) + ' / ' + n + ' · %' + oran;
  }
  function soruCiz() {
    const s = S[i];
    $('soruMetin').textContent = s.soru;
    const kap = $('soruSecenek'); kap.innerHTML = '';
    s.secenekler.forEach((o, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'secenek'; b.dataset.deger = k;
      b.setAttribute('aria-pressed', String(cevap[i] === k));
      const sp = document.createElement('span'); sp.textContent = o.metin; b.append(sp);
      kap.append(b);
    });
    $('soruGeri').disabled = i === 0;
    ilerleme();
    $('soruMetin').focus({ preventScroll: true });
  }
  function bitir() {
    const puan = cevap.reduce((t, c, k) => t + S[k].secenekler[c].puan, 0);
    const s = T.sonuclar.find((x) => puan >= x.min_puan && puan <= x.max_puan) || T.sonuclar[0];
    $('testOyun').hidden = true; $('testSonuc').hidden = false;
    $('sonucPuan').textContent = puan + ' / ' + enCok + ' puan';
    $('sonucBaslik').textContent = s.baslik; $('sonucMetin').textContent = s.aciklama;
    oranYaz($('sonucOlcer'), Math.round((puan / enCok) * 100));
    $('sonucOlcerKap').setAttribute('aria-label', 'Puanın: ' + puan + ' / ' + enCok);
    $('sonucBaslik').focus({ preventScroll: true });
    if (DD.oturum.acik()) {
      const d = DD.demo.al(); d.uye = d.uye || {};
      (d.uye.test_sonuclari = d.uye.test_sonuclari || []).push({ test: T.slug, puan, sonuc: s.baslik, tarih: DD.bugun });
      DD.demo.kaydet(); DD.toast('Sonucun hesabına kaydedildi.');
    }
  }
  function basla() { cevap = Array(n).fill(null); i = 0; $('testKapak').hidden = true; $('testSonuc').hidden = true; $('testOyun').hidden = false; soruCiz(); }
  $('testBasla').addEventListener('click', basla);
  $('testTekrar').addEventListener('click', basla);
  $('soruGeri').addEventListener('click', () => { clearTimeout(zaman); if (i > 0) { i--; soruCiz(); } });
  $('soruSecenek').addEventListener('dd:secim', (e) => {
    cevap[i] = +e.detail.deger; ilerleme();
    clearTimeout(zaman);
    zaman = setTimeout(() => { if (i < n - 1) { i++; soruCiz(); } else bitir(); }, 280);
  });
})();
