import { uyeSayfa, bolumBas, kart, dugme, bilgi } from '../../parcalar/uye/ust.mjs';

const temel = ['Günlük temel takip', 'Temel programlar', 'Su takibi', 'Sağlık profili', 'Temel test ve hesaplayıcılar', 'Kaydetme özellikleri'];
const pro = ['Gelişmiş programlar', 'Kişisel beslenme planı ve PDF çıktısı', 'Gelişmiş menü planlama', 'Sınırsız kayıt geçmişi', 'Sağlık dosyası: belge, tahlil ve veri dışa aktarımı', 'Reklamsız kullanım', 'Öncelikli destek'];
const max = ['Diyetisyen görüşme hakkı', 'Sağlık dosyanı diyetisyeninle paylaşma (açık rızayla)'];
const madde = (l, ikon = 'fa-check', sinif = '') => l.map((m) => `<li${sinif ? ` class="${sinif}"` : ''}><i class="fa-solid ${ikon}" aria-hidden="true"></i> ${m}</li>`).join('');
const kapali = (l) => `<details class="kademe-kapali"><summary>${l.length} özellik bu kademede kapalı</summary><ul class="kademe-ozellikler">${madde(l, 'fa-xmark', 'yok')}</ul></details>`;

const mevcut = `<div class="yigin">
${bolumBas({ etiket: 'Abonelik özeti', ikon: 'fa-crown', baslik: 'Bugün hangi paketteysen', metin: 'Kademen ve yükseltme yolun. Diyetisyen paketin abonelikten ayrıdır.' })}
<div class="paket-karti"><div class="paket-bas"><span class="paket-rozet ucretsiz"><i class="fa-solid fa-user" aria-hidden="true"></i> Ücretsiz</span><div class="paket-bilgi"><b>Dada Diet Ücretsiz <span class="durum-hapi kucuk-ikonlu kapali"><i class="fa-solid fa-infinity" aria-hidden="true"></i> Süresiz</span></b><span class="paket-yenileme"><i class="fa-solid fa-infinity" aria-hidden="true"></i> Süresi dolmaz, tahsilat yapılmaz.</span></div><div class="paket-fiyat"><b>₺0</b><span>/ ay</span></div></div><div class="paket-govde"><p class="durum-satir"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span>Ücretsiz kademede abonelik kaydı tutulmaz: dönem tarihi, yenileme ve iptal yoktur.</span></p><div class="paket-ozellikler">${temel.map((m) => `<span><i class="fa-solid fa-check" aria-hidden="true"></i> ${m}</span>`).join('')}</div></div><div class="paket-eylemler">${dugme('Pro’ya Yükselt', { sinif: 'birincil', ikon: 'fa-bolt', href: 'pro/' })}${dugme('Kademeleri Karşılaştır', { ek: ' data-sekme-git="karsilastir"' })}</div></div>
${kart({ ikon: 'fa-user-doctor', baslik: 'Diyetisyen paketin', metin: '<span id="pkDiyetisyen"></span>', sag: dugme('Ödemelerim', { sinif: 'hayalet kucuk', href: 'hesabim/odemelerim/#hizmet' }) })}
${bilgi('fa-circle-info', '<b>Diyetisyen ücretleri abonelikten ayrıdır.</b> Görüşme paketi bedelini diyetisyene ayrı ödersin.')}
</div>`;

const kademeler = `<div class="yigin">
${bolumBas({ etiket: 'Üç kademe', ikon: 'fa-layer-group', baslik: 'Ücretsiz, Pro ve Pro Max', metin: 'Ücretsiz kademenin süresi dolmaz. Pro ve Pro Max aylık ya da yıllık yenilenen aboneliktir.' })}
<div class="kademe-izgara">
<div class="kademe-karti aktif notr"><span class="kademe-bayrak simdi"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Mevcut paketin</span><div class="kademe-bas"><i class="fa-solid fa-user" aria-hidden="true"></i><b>Ücretsiz</b></div><p class="kademe-ozet">Beslenmeni izlemeye bugün başlamak için yeterli. Süresi dolmaz, tahsilat alınmaz.</p><div class="kademe-fiyat"><b>₺0</b><span>/ ay</span></div><ul class="kademe-ozellikler">${madde(temel)}</ul>${kapali([...pro, ...max])}</div>
<div class="kademe-karti one-cikan"><span class="kademe-bayrak"><i class="fa-solid fa-star" aria-hidden="true"></i> En popüler</span><div class="kademe-bas"><i class="fa-solid fa-bolt" aria-hidden="true"></i><b>Dada Diet Pro</b></div><p class="kademe-ozet">Program, plan ve araç katmanının tamamı; düzenli takip eden biri için.</p><div class="kademe-fiyat"><b>—</b><span>Fiyat yakında</span></div><ul class="kademe-ozellikler">${madde(pro)}</ul>${kapali(max)}${dugme('Bana haber ver', { sinif: 'birincil tam-en', ek: ' data-haber="Dada Diet Pro"' })}</div>
<div class="kademe-karti"><div class="kademe-bas"><i class="fa-solid fa-gem" aria-hidden="true"></i><b>Dada Diet Pro Max</b></div><p class="kademe-ozet">Pro’nun tamamı, üstüne diyetisyen görüşme hakkı ve sağlık dosyanı paylaşma.</p><div class="kademe-fiyat"><b>—</b><span>Fiyat yakında</span></div><ul class="kademe-ozellikler">${madde([...pro, ...max])}</ul>${dugme('Bana haber ver', { sinif: 'hayalet tam-en', ek: ' data-haber="Dada Diet Pro Max"' })}</div>
</div>
</div>`;

const satir = (ad, a, b, c) => `<tr><th scope="row">${ad}</th>${[a, b, c].map((v) => `<td><i class="fa-solid ${v ? 'fa-check var' : 'fa-minus yok'}" aria-hidden="true"></i><span class="yalniz-okuyucu">${v ? 'var' : 'yok'}</span></td>`).join('')}</tr>`;
const karsilastir = `<div class="yigin">
${bolumBas({ etiket: 'Satır satır', ikon: 'fa-table-list', baslik: 'Hangi kalem hangi kademede', metin: 'Tablo kademe kartlarıyla aynı kayıttan üretilir.' })}
<div class="kart"><div class="kart-govde bosluksuz"><div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Kademe karşılaştırması"><table class="tablo karsilastirma"><caption class="yalniz-okuyucu">Ücretsiz, Pro ve Pro Max kademelerinin kalem karşılaştırması</caption><thead><tr><th scope="col">Kademe kalemi</th><th scope="col"><span class="kademe-ad"><i class="fa-solid fa-user" aria-hidden="true"></i> Ücretsiz</span><span class="kademe-fiyat-not">₺0 / ay</span></th><th scope="col" class="one-cikan"><span class="kademe-ad"><i class="fa-solid fa-bolt" aria-hidden="true"></i> Dada Diet Pro</span><span class="kademe-fiyat-not">Fiyat yakında</span></th><th scope="col"><span class="kademe-ad"><i class="fa-solid fa-gem" aria-hidden="true"></i> Dada Diet Pro Max</span><span class="kademe-fiyat-not">Fiyat yakında</span></th></tr></thead><tbody>
<tr class="tablo-grup"><th colspan="4" scope="colgroup"><i class="fa-solid fa-utensils" aria-hidden="true"></i> Her kademede</th></tr>${temel.map((m) => satir(m, 1, 1, 1)).join('')}
<tr class="tablo-grup"><th colspan="4" scope="colgroup"><i class="fa-solid fa-bolt" aria-hidden="true"></i> Pro ve Pro Max kalemleri</th></tr>${pro.map((m) => satir(m, 0, 1, 1)).join('')}
<tr class="tablo-grup"><th colspan="4" scope="colgroup"><i class="fa-solid fa-gem" aria-hidden="true"></i> Yalnız Pro Max</th></tr>${max.map((m) => satir(m, 0, 0, 1)).join('')}
</tbody></table></div></div></div>
</div>`;

export default () => [uyeSayfa({
  yol: 'hesabim/paketler', ad: 'Paketlerim', muhur: 'Paketin · kişisel alanın', ikon: 'fa-crown',
  giris: 'Hangi kademedesin, üç kademe neyi açıyor ve nasıl geçersin.',
  grup: 'pk',
  sekmeler: [
    { id: 'mevcut', ad: 'Mevcut Paketim', ikon: 'fa-crown', govde: mevcut },
    { id: 'kademeler', ad: 'Paket Kademeleri', ikon: 'fa-layer-group', govde: kademeler },
    { id: 'karsilastir', ad: 'Paket Karşılaştırma', ikon: 'fa-table-list', govde: karsilastir },
  ],
  js: ['assets/js/sayfa/uye-paketler.js'],
})];
