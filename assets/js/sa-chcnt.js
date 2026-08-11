/* sa-chcnt.js — Filtre chip sayaç (.ch-cnt) kompakt format katmanı.
   Tek formatlayıcı: 10 yeni + 14 mevcut TÜM gözetim listelerinde aynı kaynak.
   <1000 → tam (7, 32, 999) · >=1000 → tr-TR compact ("1,2 B", "12 B", "500 B", "1,2 Mn").
   Tam değer .ch-cnt[title] hover'da. Mockup statik sayıları yerinde kalır, sadece render formattan geçer.
   NOT: "gerçek toplam vs görünen satır" doğruluğu prod/Laravel işi — bu katman SADECE sunum. */
(function () {
  var compact = new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 });
  var grouped = new Intl.NumberFormat('tr-TR');

  function fmt(n) {
    if (!isFinite(n)) return '';
    return n < 1000 ? String(n) : compact.format(n);
  }
  function full(n) {
    return isFinite(n) ? grouped.format(n) : '';
  }
  function parseRaw(txt) {
    var digits = String(txt).replace(/[^\d]/g, ''); // "1.248" / "1 248" → 1248
    return digits ? parseInt(digits, 10) : NaN;
  }
  function apply(span) {
    if (!span) return;
    // Ham değeri bir kez yakala (formatlı çıktıyı yeniden parse etme — idempotent).
    if (span.dataset.cntRaw === undefined || span.dataset.cntRaw === '') {
      var n0 = parseRaw(span.textContent);
      if (isNaN(n0)) return;
      span.dataset.cntRaw = String(n0);
    }
    var n = parseInt(span.dataset.cntRaw, 10);
    span.textContent = fmt(n);
    span.title = full(n);
  }
  function run(root) {
    (root || document).querySelectorAll('.ch-cnt').forEach(apply);
  }
  // Stres testi / runtime güncelleme için: ham değeri set edip yeniden formatla.
  function set(span, val) {
    span.dataset.cntRaw = String(val);
    apply(span);
  }

  window.saChCnt = { fmt: fmt, full: full, apply: apply, run: run, set: set };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { run(); });
  } else {
    run();
  }
})();
