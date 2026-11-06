/* Public beslenme ortak davranış: bant görseli, ilk açık akordeon, bağlantı kopyalama, demo formu. */
(function () {
  'use strict';
  document.querySelectorAll('[data-bant-gorsel]').forEach((b) => b.style.setProperty('--bant-gorsel', 'url("' + new URL(b.dataset.bantGorsel, document.baseURI).href + '")'));
  document.querySelectorAll('[data-oran]').forEach((e) => e.style.setProperty('--oran', e.dataset.oran));
  document.querySelectorAll('.akordeon-bas[data-ilk-acik]').forEach((b) => { if (b.dataset.ilkAcik !== 'genis' || innerWidth > 1024) b.click(); });

  document.addEventListener('click', function (e) {
    const p = e.target.closest('[data-paylas]');
    if (!p) return;
    const bitti = () => DD.toast('Bağlantı kopyalandı.');
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(bitti, () => DD.toast('Bağlantı kopyalanamadı.', 'hata'));
    else DD.toast('Bağlantı kopyalanamadı.', 'hata');
  });

  /* Demo formu: zorunlu alan denetimi, başarıda toast ve sıfırlama. Veri ağa gitmez. */
  document.querySelectorAll('form[data-demo-form]').forEach((f) => {
    f.noValidate = true;
    const alan = (g) => g.closest('.alan') || g.closest('.onay-kutusu');
    const isaretle = (g, hata) => {
      g.classList.toggle('hatali', hata);
      const h = alan(g) && alan(g).querySelector('.alan-hata');
      if (h) h.classList.toggle('goster', hata);
      if (g.type !== 'checkbox') g.setAttribute('aria-invalid', String(hata));
    };
    const gecerli = (g) => (g.type === 'checkbox' ? g.checked : g.value.trim() !== '' && (g.type !== 'email' || /^\S+@\S+\.\S+$/.test(g.value.trim())));
    f.addEventListener('input', (e) => { if (e.target.required && e.target.classList.contains('hatali')) isaretle(e.target, !gecerli(e.target)); });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const zorunlu = [...f.querySelectorAll('[required]')];
      let ilk = null;
      zorunlu.forEach((g) => { const h = !gecerli(g); isaretle(g, h); if (h && !ilk) ilk = g; });
      const ozet = f.querySelector('.alan-ozet');
      if (ozet) ozet.classList.toggle('goster', Boolean(ilk));
      if (ilk) { ilk.focus(); if (ilk.type === 'checkbox') DD.toast('Devam etmek için onay kutusunu işaretle.', 'uyari'); return; }
      DD.toast(f.dataset.demoForm);
      f.reset();
      f.dispatchEvent(new CustomEvent('dd:form-sifir', { bubbles: true }));
    });
  });

  /* Karakter sayacı */
  document.querySelectorAll('textarea[data-sayac]').forEach((t) => {
    const s = document.getElementById(t.dataset.sayac);
    const yaz = () => { s.textContent = t.value.length + '/' + t.maxLength; };
    t.addEventListener('input', yaz);
    t.form && t.form.addEventListener('dd:form-sifir', yaz);
  });
})();
