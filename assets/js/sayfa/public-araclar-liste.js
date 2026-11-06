/* Süzgeçli kart listesi: [data-liste] içinde sekme ile süz, sayfala; ?<param>=deger ve ?sayfa=n ön seçer.
   data-toplam varsa listede örnek kartlar vardır: sayfalama gerçek toplamı gösterir, öteki sayfalar toast verir. */
(function () {
  'use strict';
  document.querySelectorAll('[data-liste]').forEach(kur);

  function kur(kok) {
    const kartlar = [...kok.querySelectorAll('[data-izgara] > [data-kart]')];
    const boyut = +kok.dataset.boyut || 12, alan = kok.dataset.alan, param = kok.dataset.param, birim = kok.dataset.birim || 'kayıt';
    const toplam = kok.dataset.toplam ? +kok.dataset.toplam : null;
    const sayfalama = kok.querySelector('[data-sayfalama]'), not = kok.querySelector('[data-not]');
    const ray = kok.querySelector('.sekmeler');
    const q = new URLSearchParams(location.search);
    let deger = '', sayfa = Math.max(1, +q.get('sayfa') || 1);

    const uyan = () => kartlar.filter((k) => !deger || (k.dataset[alan] || '').split(' ').includes(deger));

    function adresYaz() {
      const u = new URLSearchParams(location.search);
      if (param) { if (deger) u.set(param, deger); else u.delete(param); }
      if (sayfa > 1) u.set('sayfa', sayfa); else u.delete('sayfa');
      const s = u.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
    }

    function dugme(n, etiket, ek) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'sayfa-dugme' + (ek || ''); b.dataset.sayfa = n;
      b.innerHTML = etiket;
      if (ek === ' aktif') b.setAttribute('aria-current', 'page');
      return b;
    }

    function sayfalamaCiz(adet) {
      const son = Math.max(1, Math.ceil(adet / boyut));
      sayfalama.innerHTML = '';
      sayfalama.hidden = son < 2;
      if (son < 2) return;
      const ok = (n, i, ad, kapali) => { const b = dugme(n, '<i class="fa-solid ' + i + '" aria-hidden="true"></i>', ' ok'); b.setAttribute('aria-label', ad); b.disabled = kapali; return b; };
      sayfalama.append(ok(1, 'fa-angles-left', 'İlk sayfa', sayfa === 1), ok(sayfa - 1, 'fa-chevron-left', 'Önceki sayfa', sayfa === 1));
      const gosterilen = [...new Set([1, sayfa - 1, sayfa, sayfa + 1, son])].filter((n) => n >= 1 && n <= son).sort((a, b) => a - b);
      let onceki = 0;
      gosterilen.forEach((n) => {
        if (n - onceki > 1) { const s = document.createElement('span'); s.className = 'sayfa-nokta'; s.textContent = '…'; sayfalama.append(s); }
        sayfalama.append(dugme(n, String(n), n === sayfa ? ' aktif' : ''));
        onceki = n;
      });
      sayfalama.append(ok(sayfa + 1, 'fa-chevron-right', 'Sonraki sayfa', sayfa === son), ok(son, 'fa-angles-right', 'Son sayfa', sayfa === son));
    }

    function ciz() {
      const l = uyan();
      if (toplam != null) {
        kartlar.forEach((k) => { k.hidden = !l.includes(k); });
        const aktifSayi = ray && ray.querySelector('.sekme.aktif .sekme-sayi');
        const adet = aktifSayi ? +aktifSayi.textContent : toplam;
        sayfalamaCiz(adet);
        not.textContent = adet + ' ' + birim + 'ten ' + l.length + ' tanesi gösteriliyor';
        return;
      }
      const son = Math.max(1, Math.ceil(l.length / boyut));
      if (sayfa > son) sayfa = son;
      const bas = (sayfa - 1) * boyut, dilim = l.slice(bas, bas + boyut);
      kartlar.forEach((k) => { k.hidden = !dilim.includes(k); });
      sayfalamaCiz(l.length);
      if (not) not.textContent = l.length ? l.length + ' ' + birim + 'dan ' + (bas + 1) + '–' + (bas + dilim.length) + ' arası gösteriliyor' : 'Bu seçimde ' + birim + ' yok';
    }

    if (ray) ray.addEventListener('dd:sekme', () => {
      deger = ray.querySelector('.sekme.aktif').dataset.deger || '';
      sayfa = 1; ciz(); adresYaz();
    });
    if (sayfalama) sayfalama.addEventListener('click', (e) => {
      const b = e.target.closest('.sayfa-dugme');
      if (!b || b.disabled || b.classList.contains('aktif')) return;
      if (toplam != null) { DD.toast('Prototipte bu listenin ilk sayfası örneklendi.', 'uyari'); return; }
      sayfa = +b.dataset.sayfa; ciz(); adresYaz();
      kok.scrollIntoView({ block: 'start' });
    });

    const ilk = param && q.get(param);
    const tab = ilk && ray && [...ray.querySelectorAll('.sekme')].find((s) => s.dataset.deger === ilk);
    if (tab) {
      deger = ilk;
      ray.querySelectorAll('.sekme').forEach((s) => { const a = s === tab; s.classList.toggle('aktif', a); s.setAttribute('aria-selected', String(a)); s.tabIndex = a ? 0 : -1; });
      ray.scrollLeft = tab.offsetLeft - (ray.clientWidth - tab.offsetWidth) / 2;
    }
    ciz();
  }
})();
