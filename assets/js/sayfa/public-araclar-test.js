/* Test akışı: kapak, soru ve sonuç canlı /test/<ad> ile aynı sırada. Sonuç kırılımı cevaplardan kurulur. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const T = JSON.parse($('testVeri').textContent), S = T.sorular, n = S.length;
  const bantlar = T.sonuclar.slice().sort((a, b) => a.min_puan - b.min_puan);
  const enAz = bantlar[0].min_puan, enCok = bantlar[bantlar.length - 1].max_puan;
  const SINIR = 3, GUCLU_ORAN = 0.5;
  const HEDEFLER = [['besin-rehberi/', 'fa-book-open', 'Beslenme rehberlerine göz at'], ['programlar/', 'fa-clipboard-list', 'Örnek programlara göz at'], ['saglik-testleri/', 'fa-clipboard-question', 'Başka bir test çöz']];
  const kac = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const ikon = (i) => '<i class="' + (i.startsWith('fa-brands') ? i : 'fa-solid ' + i) + '" aria-hidden="true"></i>';
  let cevap = [], i = 0, zaman = null;

  function ilerleme() {
    const oran = Math.round(((i + 1) / n) * 100);
    $('testCubuk').style.setProperty('--oran', oran);
    $('testCubuk').parentElement.setAttribute('aria-valuenow', oran);
    $('testMetin').textContent = 'Soru ' + (i + 1) + ' / ' + n;
    $('testYuzde').textContent = '%' + Math.round((i / n) * 100) + ' tamamlandı';
  }
  function soruCiz() {
    const s = S[i], kap = $('soruSecenek'), sahne = $('soruSahne');
    $('soruMetin').textContent = s.soru;
    kap.classList.remove('kilitli');
    kap.innerHTML = s.secenekler.map((o, k) => '<button class="sik-kart" type="button" data-deger="' + k + '" aria-pressed="' + (cevap[i] === k) + '"><span class="sik-ikon">' + ikon('fa-circle-dot') + '</span><span class="sik-metin">' + kac(o.metin) + '</span><span class="sik-tik">' + ikon('fa-check') + '</span></button>').join('');
    $('soruGeri').disabled = i === 0;
    ilerleme();
    sahne.classList.remove('oynat'); void sahne.offsetWidth; sahne.classList.add('oynat');
    $('soruMetin').focus({ preventScroll: true });
  }

  /* Her cevap sorunun puan aralığına oranlanır: yarısı ve üstü güçlü, altı gelişime açık. */
  function kirilim() {
    const guclu = [], gelisim = [];
    S.forEach((s, k) => {
      const puanlar = s.secenekler.map((o) => o.puan), az = Math.min(...puanlar), cok = Math.max(...puanlar), sec = s.secenekler[cevap[k]];
      if (az === cok) return;
      const ust = s.secenekler.filter((o) => o.puan > sec.puan).sort((a, b) => a.puan - b.puan)[0];
      const satir = { soru: s.soru, cevap: sec.metin, oran: (sec.puan - az) / (cok - az), sira: k, ust: ust ? ust.metin : null };
      (satir.oran >= GUCLU_ORAN ? guclu : gelisim).push(satir);
    });
    guclu.sort((a, b) => b.oran - a.oran || a.sira - b.sira);
    gelisim.sort((a, b) => a.oran - b.oran || a.sira - b.sira);
    return { guclu, gelisim };
  }
  const yorum = (g, e) => (!e ? 'Bütün sorularda güçlü bir tablo çıktı.' : !g ? 'Bütün sorularda gelişim payın var; aşağıdaki adımlarla başlayabilirsin.' : g + ' soruda güçlüsün, ' + e + ' soruda gelişim payın var.');
  const satirlar = (l, sinif) => l.slice(0, SINIR).map((s) => '<div class="kirilim-satir ' + sinif + '"><b>' + kac(s.soru) + '</b><span>' + kac(s.cevap) + '</span></div>').join('');
  function oneriler(guclu, gelisim) {
    const kaynak = gelisim.length ? gelisim : guclu;
    return kaynak.slice(0, SINIR).map((s, k) => {
      const [yol, simge, bag] = HEDEFLER[k];
      const metin = gelisim.length && s.ust ? 'Bir adım yukarısı: “' + s.ust + '”' : 'Bu düzeni sürdür: “' + s.cevap + '”';
      return '<div class="oneri-kart"><b>' + kac(s.soru) + '</b><p>' + kac(metin) + '</p><a href="' + DD.kok + yol + '">' + ikon(simge) + ' ' + bag + '</a></div>';
    }).join('');
  }
  /* Web Kullanıcı Akışı: misafir sonucu tarayıcıda tutulur, davet ile Sağlık Dosyası'na aktarılır; üye sonucu uzmana iletebilir */
  const uzmanaIlet = () => {
    const d = DD.demo.al(), u = d.uye || {};
    if (!u.diyetisyen_slug) return '<a class="dugme hayalet kucuk" href="' + DD.kok + 'diyetisyen-bul-sihirbazi/">' + ikon('fa-user-doctor') + ' Uzmana danış</a>';
    return '<button class="dugme hayalet kucuk" type="button" id="uzmanaIlet">' + ikon('fa-paper-plane') + ' Uzmana ilet</button>';
  };
  function uyeSatiri(puan, onceki) {
    const fark = onceki ? puan - onceki.puan : 0;
    return '<p class="sonuc-kayit">' + ikon('fa-circle-check') + '<span>Sonucun Sağlık Dosyana kaydedildi · <a href="' + DD.kok + 'hesabim/saglik-dosyam/">Test geçmişini gör</a></span></p><p class="sonuc-kiyas">' + (onceki ? 'Önceki denemen: ' + onceki.puan + ' / ' + enCok + ' <b>' + (fark > 0 ? '+' : fark < 0 ? '−' : '±') + Math.abs(fark) + '</b>' : 'Bu testteki ilk denemen.') + '</p><div class="sonuc-eylem">' + uzmanaIlet() + '</div>';
  }
  let son = null;
  function kayitSatiri(puan, sonuc) {
    son = { test: T.slug, ad: T.ad, puan, sonuc, tarih: DD.bugun };
    if (!DD.oturum.acik()) {
      DD.misafir.ekle('test', { test: T.slug, puan, sonuc, tarih: DD.bugun }, 'test-' + T.slug);
      return '<div id="sonucKayit">' + DD.davet.serit({ ikon: 'fa-triangle-exclamation', metin: '<b>Kapatırsan verilerin silinecek;</b> profiline kaydedip gelişimini takip etmek için kaydol.', dugme: 'Sonucumu Sağlık Dosyama kaydet', dugmeIkon: 'fa-folder-plus', davet: 'Sonucun bu tarayıcıda tutuluyor. Kaydolunca Sağlık Dosyana işlenir; uzmanına iletir, zaman içindeki değişimini görürsün.' }) + '</div>';
    }
    const d = DD.demo.al(); d.uye = d.uye || {};
    const gecmis = d.uye.test_sonuclari = d.uye.test_sonuclari || [];
    const onceki = gecmis.filter((x) => x.test === T.slug).pop();
    gecmis.push({ test: T.slug, puan, sonuc, tarih: DD.bugun });
    DD.demo.kaydet();
    return '<div id="sonucKayit">' + uyeSatiri(puan, onceki) + '</div>';
  }
  /* Davetten kayıt olunca sonuç aktarılmıştır: satır üye görünümüne döner */
  document.addEventListener('dd:oturum', () => {
    const k = $('sonucKayit');
    if (!k || !son) return;
    const l = (DD.demo.al().uye || {}).test_sonuclari || [];
    const onceki = l.filter((x) => x.test === T.slug).slice(-2, -1)[0];
    k.innerHTML = uyeSatiri(son.puan, onceki);
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('#uzmanaIlet');
    if (!b || !son) return;
    const d = DD.demo.al(), id = (d.uye || {}).danisan_id || 'd1';
    d.mesajlar = d.mesajlar || [];
    let s = d.mesajlar.find((m) => m.danisan_id === id);
    if (!s) { s = { danisan_id: id, okunmamis: 0, mesajlar: [] }; d.mesajlar.push(s); }
    s.mesajlar.push({ kimden: 'danisan', zaman: DD.bugun + 'T' + new Date().toTimeString().slice(0, 5), metin: 'Test sonucum: ' + son.ad + ', ' + son.puan + ' / ' + enCok + ' (' + son.sonuc + ').' });
    s.okunmamis = (s.okunmamis || 0) + 1;
    DD.demo.kaydet();
    b.disabled = true; b.innerHTML = ikon('fa-circle-check') + ' Uzmana iletildi';
    DD.toast('Sonucun diyetisyenine mesaj olarak iletildi.');
  });
  function paylasim(baslik) {
    const adres = location.origin + location.pathname, metin = 'Sonucum: ' + baslik + ' · ' + T.ad;
    const e = encodeURIComponent, dis = (href, ad, simge) => '<a class="paylas-dugme" href="' + href + '" target="_blank" rel="noopener" aria-label="' + ad + '">' + ikon(simge) + '</a>';
    return '<div class="paylas-kutu" id="paylasKutu"><button class="dugme hayalet notr" id="paylasAc" type="button" aria-haspopup="true" aria-expanded="false">' + ikon('fa-share-nodes') + ' Sonucu Paylaş</button><div class="paylas-pencere" role="group" aria-label="Paylaşım seçenekleri"><span class="paylas-etiket">Paylaş</span>' +
      dis('https://wa.me/?text=' + e(metin + ' ' + adres), 'WhatsApp\'ta paylaş', 'fa-brands fa-whatsapp') + dis('https://twitter.com/intent/tweet?url=' + e(adres) + '&text=' + e(metin), 'X\'te paylaş', 'fa-brands fa-x-twitter') + dis('https://www.facebook.com/sharer/sharer.php?u=' + e(adres), 'Facebook\'ta paylaş', 'fa-brands fa-facebook-f') +
      '<button class="paylas-dugme" id="paylasKopya" type="button" data-adres="' + kac(adres) + '" aria-label="Bağlantıyı kopyala">' + ikon('fa-link') + '</button></div></div>';
  }
  function bitir() {
    const puan = cevap.reduce((t, c, k) => t + S[k].secenekler[c].puan, 0);
    const s = bantlar.find((x) => puan >= x.min_puan && puan <= x.max_puan) || bantlar[0];
    const { guclu, gelisim } = kirilim(), konum = enCok > enAz ? ((puan - enAz) / (enCok - enAz)) * 100 : 100;
    const pay = (b) => b.max_puan - b.min_puan + 1;
    const kutu = $('testSonuc');
    kutu.innerHTML = '<div class="sonuc-ozet"><span class="sonuc-ust-etiket">Sonucun</span><div class="sonuc-puan"><b>' + puan + ' <i>/ ' + enCok + '</i></b><small>Puan · ' + enAz + '–' + enCok + ' aralığında</small></div>' +
      '<div class="puan-bant" role="img" aria-label="Puan bantları: ' + kac(bantlar.map((b) => b.baslik + ' ' + b.min_puan + '–' + b.max_puan).join(', ')) + '"><div class="puan-bant-cubuk">' + bantlar.map((b) => '<span class="puan-bant-dilim' + (b === s ? ' aktif' : '') + '" data-pay="' + pay(b) + '"></span>').join('') + '<i class="puan-bant-isaret" id="puanIsaret"></i></div><div class="puan-bant-adlar">' + bantlar.map((b) => '<span class="' + (b === s ? 'aktif' : '') + '" data-pay="' + pay(b) + '"><b>' + kac(b.baslik) + '</b> ' + b.min_puan + '–' + b.max_puan + '</span>').join('') + '</div></div>' +
      '<p class="sonuc-hukum" id="sonucBaslik" tabindex="-1">' + kac(s.baslik) + '</p><p class="sonuc-yorum">' + yorum(guclu.length, gelisim.length) + '</p>' + kayitSatiri(puan, s.baslik) +
      '<div class="sonuc-eylem"><a class="dugme birincil" href="' + DD.kok + 'bana-uygun-olani-bul/">' + ikon('fa-wand-magic-sparkles') + ' Sana uygun programı gör</a><button class="dugme hayalet notr" id="testTekrar" type="button">' + ikon('fa-rotate-right') + ' Testi Tekrarla</button>' + paylasim(s.baslik) + '</div></div>' +
      (guclu.length || gelisim.length ? '<div class="sonuc-kirilim">' + (guclu.length ? '<h3>Güçlü yanların</h3>' + satirlar(guclu, 'guclu') : '') + (gelisim.length ? '<h3>Gelişime açık alanların</h3>' + satirlar(gelisim, 'gelisim') : '') + '</div><div class="sonuc-oneriler"><h3>Sana önerilerimiz</h3>' + oneriler(guclu, gelisim) + '</div>' : '');
    kutu.querySelectorAll('[data-pay]').forEach((e) => e.style.setProperty('--pay', e.dataset.pay));
    $('puanIsaret').style.setProperty('--konum', konum);
    $('testOyun').hidden = true; kutu.hidden = false;
    $('testKok').scrollIntoView({ block: 'start' });
    $('sonucBaslik').focus({ preventScroll: true });
  }
  function basla() { cevap = Array(n).fill(null); i = 0; $('testKapak').hidden = true; $('testSonuc').hidden = true; $('testOyun').hidden = false; soruCiz(); $('testKok').scrollIntoView({ block: 'start' }); }

  $('testBasla').addEventListener('click', basla);
  $('soruGeri').addEventListener('click', () => { clearTimeout(zaman); if (i > 0) { i--; soruCiz(); } });
  $('soruSecenek').addEventListener('dd:secim', (e) => {
    cevap[i] = +e.detail.deger;
    $('soruSecenek').classList.add('kilitli');
    clearTimeout(zaman);
    zaman = setTimeout(() => { if (i < n - 1) { i++; soruCiz(); } else bitir(); }, 280);
  });
  $('testSonuc').addEventListener('click', (e) => {
    if (e.target.closest('#testTekrar')) { basla(); return; }
    if (e.target.closest('#paylasAc')) {
      const acik = $('paylasKutu').classList.toggle('acik');
      $('paylasAc').setAttribute('aria-expanded', String(acik));
      return;
    }
    const kopya = e.target.closest('#paylasKopya');
    if (kopya) navigator.clipboard.writeText(kopya.dataset.adres).then(() => DD.toast('Bağlantı kopyalandı.'), () => DD.toast('Bağlantı kopyalanamadı.', 'hata'));
  });
})();
