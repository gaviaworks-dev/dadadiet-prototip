/* Süzgeçli liste: arama, çip ve seçim süzgeci, sıralama, sayfalama. Kartlar derlemede basılır; burada yalnız görünürlük değişir. */
(function () {
  'use strict';
  const kucuk = (s) => s.toLocaleLowerCase('tr').trim();

  document.querySelectorAll('[data-liste]').forEach(function (kok) {
    const kap = kok.querySelector('[data-liste-kap]');
    const kartlar = [...kap.querySelectorAll('[data-kart]')];
    const ilkSira = kartlar.slice();
    const boyut = +kok.dataset.boyut || 12;
    const sayac = kok.querySelector('[data-liste-sayac]');
    const bos = kok.querySelector('[data-liste-bos]');
    const sayfalama = kok.querySelector('[data-liste-sayfalama]');
    const ara = kok.querySelector('[data-liste-ara]');
    const satirlar = [...kok.querySelectorAll('.cipler[data-suzgec]')];
    const secimler = [...kok.querySelectorAll('select[data-liste-secim]')];
    let sayfa = 1;

    const secili = () => {
      const o = [];
      satirlar.forEach((s) => {
        const c = s.querySelector('.cip.aktif');
        if (c && c.dataset.deger) o.push({ alan: s.dataset.alan, deger: c.dataset.deger, sayi: c.dataset.sayi });
      });
      secimler.forEach((s) => {
        if (s.value) o.push({ alan: s.dataset.listeSecim, deger: s.value, sayi: s.selectedOptions[0].dataset.sayi });
      });
      return o;
    };

    /* Tür seçilince yalnız o türün kategorileri kalır */
    function bagliSuz() {
      const tur = satirlar.find((s) => s.dataset.alan === 'tur');
      if (!tur) return;
      const a = tur.querySelector('.cip.aktif');
      const deger = a ? a.dataset.deger : '';
      satirlar.filter((s) => s !== tur).forEach((s) => {
        s.querySelectorAll('.cip').forEach((c) => {
          const uyar = !c.dataset.tur || !deger || c.dataset.tur === deger;
          c.hidden = !uyar;
          if (!uyar && c.classList.contains('aktif')) {
            c.classList.remove('aktif');
            s.querySelector('.cip').classList.add('aktif');
          }
        });
        const tum = s.querySelector('.cip[data-deger=""] .cip-sayi');
        if (tum) tum.textContent = (a && a.dataset.sayi) || kok.dataset.toplam;
      });
    }

    function ciz(basaDon) {
      const q = ara ? kucuk(ara.value) : '';
      const sec = secili();
      const uyan = kartlar.filter((k) => (!q || (k.dataset.ara || '').includes(q)) && sec.every((s) => (k.dataset[s.alan] || '').split('|').includes(s.deger)));
      const sayfaSayi = Math.max(1, Math.ceil(uyan.length / boyut));
      if (sayfa > sayfaSayi) sayfa = 1;
      const bas = (sayfa - 1) * boyut;
      const gorunen = uyan.slice(bas, bas + boyut);
      kartlar.forEach((k) => { k.hidden = !gorunen.includes(k); });
      kap.hidden = !uyan.length;
      bos.hidden = Boolean(uyan.length);

      if (sayac) {
        const dar = sec.filter((s) => s.alan !== 'tur');
        const son = dar.length ? dar[dar.length - 1] : sec[0];
        const toplam = son && son.sayi ? son.sayi : kok.dataset.toplam;
        const tek = dar.length <= 1 && !q;
        sayac.textContent = !uyan.length ? 'Sonuç yok' : tek ? toplam + ' ' + kok.dataset.birim + ' ' + gorunen.length + ' tanesi gösteriliyor' : uyan.length + ' sonuç bulundu';
      }

      if (sayfalama) {
        sayfalama.hidden = sayfaSayi < 2;
        let h = '<button class="sayfa-dugme ok" type="button" data-sayfa="' + (sayfa - 1) + '" aria-label="Önceki sayfa"' + (sayfa === 1 ? ' disabled' : '') + '><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>';
        for (let i = 1; i <= sayfaSayi; i++) h += '<button class="sayfa-dugme' + (i === sayfa ? ' aktif' : '') + '" type="button" data-sayfa="' + i + '"' + (i === sayfa ? ' aria-current="page"' : '') + '>' + i + '</button>';
        h += '<button class="sayfa-dugme ok" type="button" data-sayfa="' + (sayfa + 1) + '" aria-label="Sonraki sayfa"' + (sayfa === sayfaSayi ? ' disabled' : '') + '><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>';
        sayfalama.innerHTML = h;
      }
      if (basaDon) kok.scrollIntoView({ block: 'start' });
    }

    const yenile = () => { sayfa = 1; bagliSuz(); ciz(false); };

    if (ara) ara.addEventListener('input', yenile);
    secimler.forEach((s) => s.addEventListener('change', yenile));
    kok.addEventListener('dd:suzgec', yenile);
    kok.addEventListener('dd:secim', function (e) {
      if (!e.target.matches('[data-liste-sirala]')) return;
      const sirali = e.detail.deger === 'okunma' ? kartlar.slice().sort((a, b) => (+b.dataset.okunma || 0) - (+a.dataset.okunma || 0)) : ilkSira;
      kartlar.length = 0; kartlar.push(...sirali);
      sirali.forEach((k) => kap.appendChild(k));
      yenile();
    });
    if (sayfalama) sayfalama.addEventListener('click', function (e) {
      const d = e.target.closest('[data-sayfa]');
      if (!d || d.disabled) return;
      sayfa = +d.dataset.sayfa;
      ciz(true);
    });
    const temizle = kok.querySelector('[data-liste-temizle]');
    if (temizle) temizle.addEventListener('click', function () {
      if (ara) ara.value = '';
      secimler.forEach((s) => { s.value = ''; });
      satirlar.forEach((s) => { s.querySelectorAll('.cip').forEach((c, i) => c.classList.toggle('aktif', i === 0)); });
      yenile();
    });

    /* Bağlantıyla gelen süzgeç: ?kategori=et */
    const sorgu = new URLSearchParams(location.search);
    satirlar.forEach((s) => {
      const d = sorgu.get(s.dataset.alan);
      const c = d && [...s.querySelectorAll('.cip')].find((x) => x.dataset.deger === d);
      if (c) s.querySelectorAll('.cip').forEach((x) => x.classList.toggle('aktif', x === c));
    });
    bagliSuz();
    ciz(false);
  });
})();
