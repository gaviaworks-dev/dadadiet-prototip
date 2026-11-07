/* Öğün fotoğrafı (web): dosya seç ya da sürükle-bırak, telefonla ekle, önizle, değiştir, sil. Web'de canlı kamera yok.
   Görsel en çok 480 px'e küçültülür, JPEG dataURL olarak üye yerel durumuna "tarih|öğün" anahtarıyla yazılır.
   Satır çizen sayfa DD.ogunFoto.satir() kullanır, değişiklikte dd:ogun-foto olayını dinler. */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const EN_BUYUK = 480, DOSYA_SINIRI = 10 * 1024 * 1024;
  const TELEFON_ORNEK = 'assets/img/ogun/ornek-telefon.webp';
  const b = U.bugun();
  /* Tohum yalnız ilk açılışta: silinen örnek geri gelmez, ?bos=1 yeni üyede hiç gelmez */
  const fotolar = () => U.yerel('ogunFoto', U.bosKip ? {} : { [b + '|ogle']: { src: 'assets/img/ogun/ornek-ogle.webp', kaynak: 'ornek' } });
  const anahtar = (ogun) => b + '|' + ogun;
  const al = (ogun) => fotolar()[anahtar(ogun)] || null;
  const adres = (f) => (f.src.startsWith('data:') ? f.src : DD.kok + f.src);
  const i = (ikon) => '<i class="fa-solid ' + ikon + '" aria-hidden="true"></i>';
  const dugme = (sinif, ek, metin) => '<button class="dugme ' + sinif + '" type="button" ' + ek + '>' + metin + '</button>';
  const KAYNAK_NOTU = { ornek: ['fa-image', 'Örnek görsel'], telefon: ['fa-mobile-screen', 'Telefondan eklendi'] };

  document.body.insertAdjacentHTML('beforeend', '<div class="modal-ortu" id="ogunFotoModal" hidden><div class="modal-kutu" role="dialog" aria-modal="true" aria-labelledby="ogunFotoBaslik"><div class="modal-bas"><h2 id="ogunFotoBaslik">Öğün fotoğrafı</h2><button class="kapat-dugme" type="button" data-kapat aria-label="Kapat">' + i('fa-xmark') + '</button></div><div class="modal-govde" data-foto-govde></div><div class="modal-ayak-cubuk" data-foto-ayak></div></div></div>');
  const modal = document.getElementById('ogunFotoModal');
  const govde = modal.querySelector('[data-foto-govde]'), ayak = modal.querySelector('[data-foto-ayak]');

  let secili = null; /* açık öğün: { ogun, ad } */
  let taslak = null; /* seçilmiş, henüz kaydedilmemiş fotoğraf */
  let degisiyor = false; /* kayıtlı fotoğrafın yerine yenisi seçiliyor */
  let telefon = false; /* QR ekranı açık */

  /* QR deseni yerelde çizilir: konum gözleri, zamanlama çizgileri ve öğüne göre sabit bir doku */
  function qr(tohum) {
    const N = 25, m = Array.from({ length: N }, () => Array(N).fill(null));
    const kare = (x, y, n, renk) => { for (let a = 0; a < n; a++) for (let c = 0; c < n; c++) if (m[y + a] && x + c < N && x + c >= 0 && y + a >= 0) m[y + a][x + c] = renk(c, a); };
    const halka = (n) => (c, a) => { const d = Math.min(c, a, n - 1 - c, n - 1 - a); return d !== 1; };
    [[0, 0], [N - 7, 0], [0, N - 7]].forEach(([x, y]) => { kare(x - 1, y - 1, 9, () => false); kare(x, y, 7, halka(7)); });
    kare(N - 9, N - 9, 5, halka(5));
    for (let n = 8; n < N - 8; n++) { m[6][n] = n % 2 === 0; m[n][6] = n % 2 === 0; }
    let s = [...String(tohum)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7);
    let yol = '';
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      s = (s * 48271) % 2147483647;
      if (m[y][x] === null ? s % 2 === 0 : m[y][x]) yol += 'M' + x + ' ' + y + 'h1v1h-1z';
    }
    return '<svg class="qr-kod" viewBox="-2 -2 29 29" role="img" aria-label="' + U.kac(secili.ad) + ' için QR kod" shape-rendering="crispEdges"><path fill="currentColor" d="' + yol + '"/></svg>';
  }

  function ciz() {
    const kayitli = al(secili.ogun), f = taslak || (degisiyor || telefon ? null : kayitli);
    document.getElementById('ogunFotoBaslik').textContent = secili.ad + ' fotoğrafı';
    if (telefon) {
      govde.innerHTML = '<div class="qr-kutu">' + qr(anahtar(secili.ogun)) + '<p class="kart-metin">Telefonunun kamerasıyla okut. Açılan ekranda çektiğin fotoğraf bu öğüne düşer.</p><div role="status">' + U.durum('bekleyen', 'Telefonda fotoğraf bekleniyor') + '</div>' + dugme('birincil', 'data-foto-telefon-gonder', 'Örnek fotoğrafı gönder') + '</div>';
      ayak.innerHTML = dugme('hayalet', 'data-foto-geri', 'Vazgeç');
    } else if (!f) {
      govde.innerHTML = '<div class="yigin sik"><label class="birak-alani" for="ogunFotoDosya"><input class="dosya-sec yalniz-okuyucu" id="ogunFotoDosya" type="file" accept="image/*"><span class="birak-ikon">' + i('fa-cloud-arrow-up') + '</span><b>Fotoğrafı buraya sürükle ya da seç</b><span>JPG, PNG veya WebP, en çok 10 MB. Fotoğrafın yalnız bu tarayıcıda durur.</span><span class="eylem-satiri"><span class="dugme hayalet kucuk">' + i('fa-upload') + ' Dosya yükle</span></span></label>' + dugme('hayalet', 'data-foto-telefon', i('fa-mobile-screen') + ' Telefonla ekle') + '</div>';
      ayak.innerHTML = kayitli ? dugme('hayalet', 'data-foto-geri', 'Vazgeç') : dugme('hayalet', 'data-kapat', 'Vazgeç');
    } else {
      const not = KAYNAK_NOTU[f.kaynak];
      govde.innerHTML = '<img class="foto-onizleme" src="' + U.kac(adres(f)) + '" alt="' + U.kac(secili.ad) + ' fotoğrafı">' + (not ? '<p class="alan-yardim">' + i(not[0]) + ' <span>' + not[1] + '</span></p>' : '');
      ayak.innerHTML = dugme('hayalet tehlike', 'data-foto-sil', i('fa-trash') + ' Sil') + dugme('hayalet', 'data-foto-degistir', 'Değiştir') + (taslak ? dugme('birincil', 'data-foto-kaydet', 'Kaydet') : dugme('birincil', 'data-kapat', 'Tamam'));
    }
    /* Ekran değişince odak kaybolmasın: açılışta odağı DD.ac verir */
    if (!modal.hidden) (govde.querySelector('input,button') || ayak.querySelector('.dugme:last-child')).focus();
  }

  /* Dosya canvas'tan geçer: boyut küçülür, şeffaf zemin beyaza döner, bozuk dosya burada yakalanır */
  const kucult = (d) => new Promise((tamam, hata) => {
    const url = URL.createObjectURL(d), img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) { hata(); return; }
      const o = Math.min(1, EN_BUYUK / Math.max(w, h)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * o));
      c.height = Math.max(1, Math.round(h * o));
      const x = c.getContext('2d');
      x.fillStyle = 'white';
      x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0, c.width, c.height);
      tamam(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); hata(); };
    img.src = url;
  });

  /* DD.demo.kaydet() kota hatasını yutar: yazılan kayıt depoda mı diye geri okunur */
  function kalici(src) {
    if (U.bosKip) return true;
    try {
      const k = Object.keys(localStorage).find((x) => x.startsWith('dd-demo-durum'));
      return !k || localStorage.getItem(k).includes(src.slice(-48));
    } catch (e) { return true; }
  }

  const haberVer = () => document.dispatchEvent(new CustomEvent('dd:ogun-foto', { detail: { ogun: secili.ogun } }));

  /* Yazılamayan fotoğraf geri alınır, eski kayıt korunur */
  function yaz(f) {
    const l = fotolar(), a = anahtar(secili.ogun), eski = l[a];
    l[a] = f;
    U.kaydet();
    if (kalici(f.src)) return true;
    if (eski) l[a] = eski; else delete l[a];
    U.kaydet();
    DD.toast('Tarayıcı depolaması dolu. Eski bir fotoğrafı silip yeniden dene.', 'hata');
    return false;
  }

  function bitir(mesaj, tip) {
    const ogun = secili.ogun;
    DD.kapat(modal);
    haberVer();
    const d = document.querySelector('[data-foto-ac="' + ogun + '"]');
    if (d) d.focus();
    DD.toast(mesaj, tip);
  }

  function dosyaAl(d) {
    if (!d) return;
    if (!d.type.startsWith('image/')) { DD.toast('Bu dosya bir görsel değil.', 'hata'); return; }
    if (d.size > DOSYA_SINIRI) { DD.toast('Fotoğraf 10 MB’tan büyük olamaz.', 'hata'); return; }
    kucult(d).then((src) => {
      if (modal.hidden) return;
      taslak = { src, kaynak: 'yukleme' };
      ciz();
    }, () => DD.toast('Bu fotoğraf açılamadı. JPG ya da PNG dene.', 'hata'));
  }

  /* Telefon akışının demo karşılığı: örnek görsel aynı küçültme ve kayıt yolundan öğüne düşer */
  function telefondanAl(d) {
    d.disabled = true;
    fetch(DD.kok + TELEFON_ORNEK).then((r) => r.blob()).then(kucult).then((src) => {
      if (modal.hidden) return;
      if (!yaz({ src, kaynak: 'telefon' })) { d.disabled = false; return; }
      telefon = false; degisiyor = false;
      ciz();
      haberVer();
      DD.toast('Fotoğraf telefondan eklendi.');
    }, () => { d.disabled = false; DD.toast('Örnek fotoğraf alınamadı. Yeniden dene.', 'hata'); });
  }

  modal.addEventListener('change', (e) => {
    if (e.target.id !== 'ogunFotoDosya') return;
    const d = e.target.files[0];
    e.target.value = '';
    dosyaAl(d);
  });

  /* Sürükle-bırak: alan üstündeyken belirginleşir; alan dışına bırakılan dosya sayfayı terk ettirmez */
  const alan = () => govde.querySelector('.birak-alani');
  const alanda = (e) => { const a = alan(); return !!a && a.contains(e.target); };
  modal.addEventListener('dragover', (e) => {
    e.preventDefault();
    const ic = alanda(e);
    e.dataTransfer.dropEffect = ic ? 'copy' : 'none';
    if (alan()) alan().classList.toggle('uzerinde', ic);
  });
  modal.addEventListener('dragleave', (e) => { const a = alan(); if (a && !a.contains(e.relatedTarget)) a.classList.remove('uzerinde'); });
  modal.addEventListener('drop', (e) => {
    e.preventDefault();
    const ic = alanda(e);
    if (alan()) alan().classList.remove('uzerinde');
    if (ic) dosyaAl(e.dataTransfer.files[0]);
  });

  document.addEventListener('click', (e) => {
    const ac = e.target.closest('[data-foto-ac]');
    if (ac) {
      secili = { ogun: ac.dataset.fotoAc, ad: ac.dataset.fotoAd };
      taslak = null; degisiyor = false; telefon = false;
      ciz();
      DD.ac(modal);
      return;
    }
    if (!modal.contains(e.target)) return;
    if (e.target.closest('[data-foto-telefon]')) { telefon = true; ciz(); return; }
    const g = e.target.closest('[data-foto-telefon-gonder]');
    if (g) { telefondanAl(g); return; }
    if (e.target.closest('[data-foto-geri]')) {
      if (telefon) telefon = false; else degisiyor = false;
      ciz();
      return;
    }
    if (e.target.closest('[data-foto-degistir]')) { taslak = null; degisiyor = true; ciz(); return; }
    if (e.target.closest('[data-foto-kaydet]')) { if (yaz(taslak)) bitir('Fotoğrafın eklendi.'); return; }
    if (e.target.closest('[data-foto-sil]')) {
      if (taslak) { taslak = null; degisiyor = false; ciz(); return; }
      delete fotolar()[anahtar(secili.ogun)];
      U.kaydet();
      bitir('Fotoğraf silindi.', 'uyari');
    }
  });

  DD.ogunFoto = {
    al,
    /* Öğün satırına fotoğrafı işler: ikon yerine küçük görsel, sağda düğme. Atlanan öğünde fotoğraf gösterilmez */
    satir(html, o, durum) {
      if (durum === 'atladi') return html;
      const f = al(o.anahtar), ek = 'data-foto-ac="' + o.anahtar + '" data-foto-ad="' + U.kac(o.ad) + '"';
      const kucuk = f ? '<button class="ks-foto" type="button" ' + ek + ' aria-label="' + U.kac(o.ad) + ' fotoğrafını aç"><img src="' + U.kac(adres(f)) + '" alt=""></button>' : '';
      const d = '<button class="dugme hayalet kucuk" type="button" ' + ek + '>' + i('fa-image') + ' ' + (f ? 'Fotoğrafı gör' : 'Fotoğraf ekle') + '</button>';
      return (f ? html.replace(/<span class="ks-ikon">.*?<\/span>/, () => kucuk) : html).replace('<div class="as-eylem">', '<div class="as-eylem">' + d);
    },
  };
})();
