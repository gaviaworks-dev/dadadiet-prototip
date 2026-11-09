import { uyeKabuk } from '../../parcalar/uye/kabuk.mjs';
import { kart, dugme } from '../../parcalar/uye/ust.mjs';

const kisayol = [['fa-calendar-week', 'Haftalık Menüm', 'hesabim/haftalik-menum/'], ['fa-bookmark', 'Kaydedilenler', 'hesabim/kaydedilenler/'], ['fa-people-group', 'Destek Grupları', 'hesabim/destek-gruplari/'], ['fa-bell', 'Bildirimler', 'hesabim/bildirimler/']];

const govde = `<div class="yigin baslik-belirgin">
<div id="gbSiradaki"></div>
<div id="gbIlk"></div>
<div id="gbOgunYeni"></div>
<div class="iki-kolon" id="gbKolon">
<div class="yigin">
<div id="gbOgun"></div>
<div id="gbGun"></div>
<div id="gbGrafik"></div>
${kart({ ikon: 'fa-bolt', baslik: 'Hızlı Kayıt', metin: 'Bugünün kaydını iki dokunuşta tamamla.', bosluksuz: true, govde: '<div class="ayar-liste" id="gbKayit"></div>' })}
</div>
<div class="yigin">
<div id="gbRandevu"></div>
<div id="gbMesaj"></div>
<div id="gbGorev"></div>
${kart({ ikon: 'fa-compass', baslik: 'Kısayollar', bosluksuz: true, govde: `<div class="ayar-liste">${kisayol.map(([i, a, h]) => `<a class="ayar-satir" href="{{kok}}${h}"><span class="as-ikon"><i class="fa-solid ${i}" aria-hidden="true"></i></span><span class="as-metin"><b>${a}</b></span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></a>`).join('')}</div>` })}
</div>
</div>
</div>`;

export default () => [uyeKabuk({
  yol: 'hesabim', aktif: 'hesabim/', baslik: 'Genel Bakış', aciklama: '<span id="gbSelam"></span>',
  eylem: dugme('Günlük takibe git', { sinif: 'hayalet', ikon: 'fa-utensils', href: 'hesabim/gunluk-takibim/' }),
  govde, js: ['assets/js/tercih-uyum.js', 'assets/js/sayfa/uye-genel.js'],
})];
