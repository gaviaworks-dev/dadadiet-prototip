import { uyeKabuk } from '../../parcalar/uye/kabuk.mjs';
import { bolumBas } from '../../parcalar/uye/ust.mjs';
import { ikon, altNot, ayrim, bag, sekmeGit, json, kademeler, matris } from './_ortak.mjs';
import { bicim } from '../../parcalar/bicim.mjs';

const ayriMetin = 'Diyetisyen görüşmeleri ve görüşme paketi ücretleri Pro üyeliğe dâhil değildir; bedeli diyetisyene ayrı ödersin. Diyetisyeni takip etmek ya da profilini kaydetmek görüşme hakkı açmaz. Pro ise sitenin gelişmiş program ve plan katmanını açar. İki katman karıştırılmaz.';

const mevcut = `<div class="yigin">
${bolumBas({ etiket: 'Aktif kademe', ikon: 'fa-crown', baslik: 'Bugün hangi paketteysen', metin: 'Kademen, dönem tarihlerin ve yenileme durumun. Yükseltme, düşürme ve iptal buradan başlar.' })}
<div id="pkAktif"></div>
${ayrim('fa-user-doctor', 'Diyetisyen paketleri bu kademeye dâhil değildir', ayriMetin, `<span id="pkDiyetisyen"></span> Diyetisyene ödediklerini ${bag('Ödemelerim › Hizmet / Uzman Ödemeleri', 'hesabim/odemelerim/#hizmet')} bölümünde görürsün.`)}
${altNot('fa-circle-info', `Tahsilatların, faturaların ve kayıtlı kartların ${bag('Ödemelerim', 'hesabim/odemelerim/')} sayfasında. Üyelik ve iptal koşullarının tamamı ${bag('Kullanım Koşulları', 'yasal/')}’nda; bir sorun için ${bag('destek talebi', 'hesabim/cozum-merkezi/#yeni')} açabilirsin.`)}
<div class="cipler" role="group" aria-label="Kademe görünümü" id="pkGorunum"><span class="cipler-basligi">Kademe görünümü</span>${kademeler.map((k) => `<button class="cip" type="button" data-kademe="${k.kod}">${k.ad}</button>`).join('')}</div>
</div>`;

const kademeKart = (k) => `<div class="kademe-karti${k.one ? ' one-cikan' : ''}" data-kademe-kart="${k.kod}"><span class="kademe-bayrak" data-bayrak${k.bayrak ? '' : ' hidden'}>${k.bayrak ?? ''}</span><div class="kademe-bas">${ikon(k.ikon)}<b>${k.ad}</b></div><p class="kademe-ozet">${k.ozet}</p><div class="kademe-fiyat">${k.kod === 'ucretsiz' ? `<b>${bicim.para(0)}</b><span>/ her zaman</span>` : '<b>—</b><span>Fiyat henüz belirlenmedi</span>'}</div><ul class="kademe-ozellikler">${k.miras ? `<li>${ikon('fa-check')} <b>${k.miras}</b></li>` : ''}${k.ozellik.map((m) => `<li>${ikon('fa-check')} ${m}</li>`).join('')}</ul>${k.kapali.length ? `<details class="kademe-kapali"><summary>${k.kapali.length} özellik bu kademede kapalı</summary><ul class="kademe-ozellikler">${k.kapali.map((m) => `<li class="no">${ikon('fa-xmark')} ${m}</li>`).join('')}</ul></details>` : ''}<div data-kademe-eylem></div></div>`;

const kademe = `<div class="yigin">
${bolumBas({ etiket: 'Üç kademe', ikon: 'fa-layer-group', baslik: 'Ücretsiz, Pro ve Pro Max', metin: 'Ücretsiz kalıcıdır, süresi dolmaz. Pro ve Pro Max henüz satışa açılmadı; açıldığında haber almak için kademeyi işaretleyebilirsin.' })}
<div class="kademe-izgara">${kademeler.map(kademeKart).join('')}</div>
${ayrim('fa-user-doctor', 'Diyetisyen paketleri kademelerden ayrıdır', ayriMetin)}
${altNot('fa-credit-card', '<b>Pro ve Pro Max için tutar henüz belirlenmedi</b>, o yüzden sayı yerine durumu yazıyor. Bugün Pro için ödeme alınmıyor. Kart bilgilerin Dada Diet sunucularında tutulmaz, ödeme kuruluşunda saklanır.')}
</div>`;

const hucre = (v) => `<td${''}>${ikon(v ? 'fa-check var' : 'fa-xmark yok')}<span class="yalniz-okuyucu">${v ? 'var' : 'yok'}</span></td>`;
const kolon = (k) => `<th scope="col"${k.one ? ' class="one-cikan"' : ''}><span class="kademe-ad">${ikon(k.ikon)} ${k.ad}</span><span class="kademe-fiyat-not">${k.kod === 'ucretsiz' ? `${bicim.para(0)} / her zaman` : 'Fiyat belirlenmedi'}</span></th>`;
const satirSay = matris.reduce((t, g) => t + g[2].length, 0);
const karsilastir = `<div class="yigin">
${bolumBas({ etiket: 'Satır satır', ikon: 'fa-table-list', baslik: 'Hangi kalem hangi kademede açık', metin: `Tablo, kademe kartlarıyla aynı kayıttan üretilir; iki yerde iki farklı liste olmaz. ${satirSay} satır, ${matris.length} başlık.` })}
<div class="tablo-kap cerceveli" role="region" aria-label="Paket karşılaştırma tablosu" tabindex="0"><table class="tablo karsilastirma"><caption class="yalniz-okuyucu">Ücretsiz, Pro ve Pro Max kademelerinin özellik karşılaştırması</caption><thead><tr><th scope="col">Özellik</th>${kademeler.map(kolon).join('')}</tr></thead><tbody>${matris.map(([g, i, l]) => `<tr class="tablo-grup"><th colspan="4" scope="colgroup">${ikon(i)} ${g}</th></tr>${l.map(([ad, ...h]) => `<tr><th scope="row">${ad}</th>${h.map(hucre).join('')}</tr>`).join('')}`).join('')}</tbody></table></div>
<p class="tablo-ipucu">${ikon('fa-arrows-left-right')} Dar ekranda tabloyu yana kaydırarak üç kademeyi karşılaştırabilirsin.</p>
${altNot('fa-user-doctor', ayriMetin)}
</div>`;

export default () => [uyeKabuk({
  yol: 'hesabim/paketlerim', baslik: 'Paketlerim',
  aciklama: 'Hangi kademedesin, üç kademe neyi açıyor, nasıl yükseltir ya da düşürürsün.',
  grup: 'pk',
  sekmeler: [
    { id: 'paketim', ad: 'Mevcut Paketim', ikon: 'fa-crown', govde: mevcut },
    { id: 'kademeler', ad: 'Paket Kademeleri', ikon: 'fa-layer-group', govde: kademe },
    { id: 'karsilastir', ad: 'Paket Karşılaştırma', ikon: 'fa-table-list', govde: karsilastir },
  ],
  sonEk: json('gKademe', kademeler),
  js: ['assets/js/sayfa/uye-gastro-ortak.js', 'assets/js/sayfa/uye-gastro-paketlerim.js'],
})];
