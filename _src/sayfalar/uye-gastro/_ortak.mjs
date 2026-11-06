// uye-gastro ortak parçaları: Gastro donörünün tekrar eden blokları ve kademe kataloğu.
export const ikon = (i) => `<i class="fa-solid ${i}" aria-hidden="true"></i>`;
export const altNot = (i, html) => `<div class="alt-not">${ikon(i)}<span>${html}</span></div>`;
export const uyari = (i, html) => `<div class="uyari-kutu">${ikon(i)}<span>${html}</span></div>`;
export const ayrim = (i, baslik, ...p) => `<div class="ayrim-kutusu">${ikon(i)}<div><b>${baslik}</b>${p.map((x, n) => `<p${n ? ' class="ikinci"' : ''}>${x}</p>`).join('')}</div></div>`;
export const durumSatir = (i, html, ek = '') => `<p class="durum-satir"${ek}>${ikon(i)} <span>${html}</span></p>`;
export const sonuc = (id) => `<p class="durum-satir" id="${id}" role="status" hidden>${ikon('fa-circle-half-stroke')} <span></span></p>`;
export const bag = (metin, yol) => `<a href="{{kok}}${yol}">${metin}</a>`;
export const sekmeGit = (metin, id) => `<a href="#${id}" data-sekme-git="${id}">${metin}</a>`;
export const json = (id, veri) => `<script type="application/json" id="${id}">${JSON.stringify(veri).replace(/</g, '\\u003c')}</script>`;

const temel = ['Günlük temel takip', 'Temel programlar', 'Su takibi', 'Sağlık profili', 'Temel test ve hesaplayıcılar', 'Kaydetme özellikleri'];
const pro = ['Gelişmiş programlar', 'Kişisel beslenme planı ve PDF çıktısı', 'Gelişmiş menü planlama', 'Sınırsız kayıt geçmişi', 'Sağlık dosyası: belge, tahlil ve veri dışa aktarımı', 'Reklamsız kullanım', 'Öncelikli destek'];
const max = ['Diyetisyen görüşme hakkı', 'Sağlık dosyanı diyetisyeninle paylaşma (açık rızayla)'];

export const kademeler = [
  { kod: 'ucretsiz', ad: 'Ücretsiz', tamAd: 'Dada Diet Ücretsiz', ikon: 'fa-user', ozet: 'Beslenmeni izlemeye bugün başlamak için yeterli. Süresi dolmaz, tahsilat alınmaz.', ozellik: temel, kapali: [...pro, ...max], bayrak: 'Herkese açık' },
  { kod: 'pro', ad: 'Pro', tamAd: 'Dada Diet Pro', ikon: 'fa-bolt', ozet: 'Program, plan ve araç katmanının tamamı: düzenli takip eden biri için. Satışa açılmadı.', ozellik: pro, kapali: max, miras: 'Ücretsiz’in tamamı', one: true },
  { kod: 'promax', ad: 'Pro Max', tamAd: 'Dada Diet Pro Max', ikon: 'fa-gem', ozet: 'Pro’nun tamamı, üstüne diyetisyen görüşme hakkı ve sağlık dosyanı paylaşma. Satışa açılmadı.', ozellik: max, kapali: [], miras: 'Pro’nun tamamı' },
];
export const matris = [
  ['Her kademede', 'fa-utensils', temel.map((m) => [m, 1, 1, 1])],
  ['Pro ve Pro Max kalemleri', 'fa-bolt', pro.map((m) => [m, 0, 1, 1])],
  ['Yalnız Pro Max', 'fa-gem', max.map((m) => [m, 0, 0, 1])],
];
