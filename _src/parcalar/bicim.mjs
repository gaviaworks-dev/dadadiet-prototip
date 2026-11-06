// Derleme zamanı biçimleyici: assets/js/ortak.js DD.bicim ile aynı kural.
// Binlik nokta, ondalık virgül, 320 kcal, ₺2.400, %49, 06.11.2026, 13.00
export const sayi = (v, basamak = 0, enAz = 0) => (v == null || v === '' || Number.isNaN(Number(v))) ? '—' : Number(v).toLocaleString('tr-TR', { minimumFractionDigits: enAz, maximumFractionDigits: basamak });
export const bicim = {
  sayi,
  kcal: (v) => (v == null ? '—' : sayi(Math.round(v)) + ' kcal'),
  gram: (v, basamak = 1) => (v == null ? '—' : sayi(v, basamak) + ' g'),
  kilo: (v) => (v == null ? '—' : sayi(v, 1) + ' kg'),
  yuzde: (v, basamak = 0) => (v == null ? '—' : '%' + sayi(v, basamak)),
  para: (v, basamak = 0) => (v == null ? '—' : '₺' + sayi(v, basamak, basamak)),
  tarih(d) { const m = String(d ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : (d ?? '—'); },
  saat: (s) => String(s ?? '—').replace(':', '.'),
};
