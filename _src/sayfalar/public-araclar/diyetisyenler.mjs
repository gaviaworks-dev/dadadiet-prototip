// Diyetisyenler landing + iki profil: canlı Elif Şahin (yalnız public bilgi) ve panel demosu Ece Tunalı.
import { K, sayfaJs, bant, bolum, bolumBas, dugme, ikon, uzmanKart, gorusme, genelNot, kirinti, kac, ikonKart } from '../../parcalar/public-araclar/ortak.mjs';

const ADIMLAR = [['Hedefini söyle', 'Sihirbaz hedef, uzmanlık, şehir ve bütçeni alır.', 'fa-bullseye'], ['Uzmanını seç', 'Profilleri incele, uzmanlık ve görüşme kipine bak.', 'fa-user-check'], ['Görüşmeye başla', 'Randevunu al, planın hesabına gelsin.', 'fa-calendar-check']];

const profilUst = (d, { eylem, sayaclar, giris }) => `<div class="zebra"><section class="bolum kabuk-alti kimlik-bant"><div class="kap">
${kirinti(['Diyetisyenler', 'diyetisyenler/'], [kac(d.ad)])}
<div class="kapak" data-arkaplan="${K}assets/img/diyetisyen/profil-banner.jpg"><span class="kapak-muhur">${ikon('fa-user-doctor')} Diyetisyen profili</span></div>
<div class="kimlik"><span class="kimlik-avatar harf" aria-hidden="true">${d.harf}</span><div class="kimlik-govde"><h1>${kac(d.ad)}</h1><span class="kimlik-kullanici">${d.unvan} · ${kac(d.uzmanlik[0])}</span>${giris ? `<p class="kimlik-giris">${giris}</p>` : ''}<div class="kimlik-meta"><span>${ikon('fa-location-dot')} ${d.sehir} · ${gorusme(d)}</span><span>${ikon('fa-briefcase')} ${d.deneyim_yil} yıl deneyim</span></div></div><div class="kimlik-eylem">${eylem}</div></div>
<div class="sayac-serit">${sayaclar.map(([i, e, v]) => `<div class="sayac">${ikon(i)}<div><span>${e}</span><b>${v}</b></div></div>`).join('')}</div>
</div></section></div>`;

const sekmeRay = (l) => `<div class="sekme-ray"><div class="kap"><div class="sekmeler ortali" role="tablist" aria-label="Profil bölümleri">${l.map(([id, a, i, n], k) => `<button class="sekme${k === 0 ? ' aktif' : ''}" type="button" role="tab" id="t-${id}" aria-controls="p-${id}" aria-selected="${k === 0}"${k ? ' tabindex="-1"' : ''}>${ikon(i)} ${a}${n != null ? ` <span class="sekme-sayi"${typeof n === 'string' ? ` id="${n}"` : ''}>${typeof n === 'string' ? '' : n}</span>` : ''}</button>`).join('')}</div></div></div>`;
const pano = (id, ilk, icerik) => `<div class="fit-pane" id="p-${id}" role="tabpanel" aria-labelledby="t-${id}" tabindex="-1"${ilk ? '' : ' hidden'}><div class="wrap kap yigin">${icerik}</div></div>`;
const satir = (i, b, m, sag = '') => `<div class="ayar-satir"><span class="as-ikon" aria-hidden="true">${ikon(i)}</span><div class="as-metin"><b>${b}</b><span>${m}</span></div>${sag}</div>`;

export default ({ veri }) => {
  const s = veri.sayaclar, D = veri.diyetisyenler.diyetisyenler, sehirler = [...new Set(D.map((d) => d.sehir))];
  const landing = `${bant({ yol: [['Diyetisyenler']], etiket: 'Uzman diyetisyenler', etiketIkon: 'fa-user-doctor', h1: 'Sana uygun <span class="vurgu">diyetisyeni bul</span>', gorsel: 'hero/giris-pano-diyetisyen.webp', alt: 'Alanında uzman diyetisyenlerle online ya da yüz yüze görüş. Hedefini söyle, sihirbaz sana uygun uzmanı eşleştirsin.',
    eylem: dugme('Diyetisyen Bul Sihirbazı', 'diyetisyen-bul-sihirbazi/', 'birincil', 'fa-wand-magic-sparkles') + dugme('Diyetisyen Ol', 'diyetisyen-ol/', 'koyu-zemin', 'fa-stethoscope'),
    sayilar: [[s.diyetisyen, 'Uzman profili'], [s.diyetisyen_il, 'İl'], [D.filter((d) => d.online).length, 'Online görüşme']] })}
<div class="bolum-dizi">
${bolum(`${bolumBas({ etiket: 'Uzman vitrini', ikon: 'fa-user-group', baslik: `${s.diyetisyen} uzman yayında`, metin: 'Şehre göre süz, profilini incele.' })}<div data-liste data-alan="sehir" data-param="sehir" data-boyut="12" data-birim="uzman">
<div class="sekme-ray liste-ust"><div class="sekmeler suzgec" role="tablist" aria-label="Şehir"><button class="sekme aktif" type="button" role="tab" data-deger="" aria-selected="true">${ikon('fa-layer-group')} Tümü <span class="sekme-sayi">${D.length}</span></button>${sehirler.map((c) => `<button class="sekme" type="button" role="tab" data-deger="${c}" aria-selected="false" tabindex="-1">${ikon('fa-location-dot')} ${c} <span class="sekme-sayi">${D.filter((d) => d.sehir === c).length}</span></button>`).join('')}</div></div>
<div class="kart-izgara c3" data-izgara>${D.map((d) => uzmanKart(d).replace(' data-kart>', ` data-kart data-sehir="${d.sehir}">`)).join('')}</div><nav class="sayfalama" data-sayfalama aria-label="Sayfalama"></nav>
</div>`, { ilk: true })}
${bolum(`${bolumBas({ etiket: 'Nasıl çalışır', ikon: 'fa-route', baslik: 'Üç adımda uzman desteği', metin: 'Doğrulandı rozeti yalnızca diploması ve mesleki kaydı kontrol edilen uzmanlara verilir.' })}<div class="kart-izgara c3">${ADIMLAR.map(([b, m], i) => `<div class="kart adim-kart"><div class="kart-govde"><span class="adim-numara">${i + 1}</span><h3 class="kart-baslik">${b}</h3><p class="kart-metin">${m}</p></div></div>`).join('')}</div>`)}
${bolum(`<div class="vurgu-panel"><div><span class="ust-etiket">${ikon('fa-stethoscope')} Uzman başvurusu</span><h2>Diyetisyen misin?</h2><p>Profilini oluştur, online ya da yüz yüze danışan kabul et, randevu ve planlarını tek panelden yönet. Başvurun ekibimizce incelenir.</p><div class="eylem-satiri">${dugme('Diyetisyen Ol', 'diyetisyen-ol/', 'birincil', 'fa-arrow-right', true)}<a class="vurgu-baglanti" href="${K}sayfa/uzmanla-calisma-rehberi/">Uzmanla Çalışma Rehberi ${ikon('fa-arrow-right')}</a></div></div><div class="satir-liste">${[['fa-calendar-check', 'Randevu ve takvim', 'Yerleşik randevu sistemi'], ['fa-clipboard-list', 'Plan oluşturucu', 'Haftalık planı besin veritabanıyla kur'], ['fa-comments', 'Danışan iletişimi', 'Mesaj, not ve dosya tek yerde']].map(([i, b, m]) => `<div class="satir-baglanti"><span class="ikon-kutu">${ikon(i)}</span><span>${b}<small>${m}</small></span></div>`).join('')}</div></div>`)}
${bolum(genelNot)}
</div>`;

  const e = D.find((d) => d.slug === 'dyt-elif-sahin');
  const elif = `${profilUst(e, {
    eylem: `<a class="dugme birincil" href="${K}giris/" data-randevu>${ikon('fa-calendar-check')} Randevu al</a><div><a class="dugme hayalet" href="${K}giris/" data-mesaj>${ikon('fa-comment')} Mesaj</a><button class="dugme hayalet" type="button" data-paylas aria-label="Profili paylaş">${ikon('fa-share-nodes')}</button></div>`,
    sayaclar: [['fa-briefcase', 'Deneyim', `${e.deneyim_yil} yıl`], ['fa-video', 'Görüşme kipi', gorusme(e)], ['fa-location-dot', 'Konum', e.sehir], ['fa-star', 'Danışan puanı', 'Henüz puan yok']],
  })}
<div class="modul-govde">${sekmeRay([['profil', 'Profil', 'fa-user'], ['hakkinda', 'Hakkında', 'fa-circle-info']])}
${pano('profil', true, `<div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-stethoscope')} Çalışma alanları</h2></div><div class="kart-govde"><div class="sonuc-etiketler">${e.uzmanlik.map((u) => `<span class="rozet olumlu">${kac(u)}</span>`).join('')}</div></div></div>
<div class="kart" id="randevu"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-list-check')} Profil durumu</h2><p>Bu profilde henüz yayınlanmış kayıt olmayan alanlar tek yerde.</p></div></div><div class="kart-govde ayar-liste">${satir('fa-calendar-days', 'Randevu uygunluğu', 'Önümüzdeki yedi gün için açık görüşme saati görünmüyor.', '<span class="durum-hapi">Açık saat yok</span>')}${satir('fa-box-open', 'Hizmet ve paketler', 'Hizmet kataloğu yayına girdiğinde burada görünür.', '<span class="durum-hapi">Yakında</span>')}${satir('fa-comment-dots', 'Danışan yorumları', 'Yorumlar yalnız görüşmesi tamamlanmış danışanlardan alınır.', '<span class="durum-hapi">0 yorum</span>')}</div><div class="kart-alt">${dugme('Doğrulama nasıl yapılıyor?', 'yasal/', 'hayalet')}${dugme('Bütün diyetisyenler', 'diyetisyenler/', 'birincil', 'fa-arrow-right', true)}</div></div>`)}
${pano('hakkinda', false, `${bolumBas({ etiket: 'Uzmanlık ve görüşme', ikon: 'fa-circle-info', baslik: `${kac(e.ad)} hakkında`, metin: 'Hangi alanlarda çalışıyor, görüşmeler hangi kipte yürüyor.' })}<div class="kart"><div class="kart-govde"><dl class="kunye"><div><dt>Unvan</dt><dd>${e.unvan}</dd></div><div><dt>Deneyim</dt><dd>${e.deneyim_yil} yıl</dd></div><div><dt>Görüşme</dt><dd>${gorusme(e)}</dd></div><div><dt>Konum</dt><dd>${e.sehir}</dd></div></dl></div></div>${genelNot}`)}
</div>`;

  const d = veri.demo.diyetisyen;
  const ece = `${profilUst(d, {
    giris: '<span id="eceKisa"></span>',
    eylem: `<a class="dugme birincil" href="#p-randevu" data-sekme-git="t-randevu">${ikon('fa-calendar-check')} Randevu al</a><div><a class="dugme hayalet" href="${K}hesabim/diyetisyenim/#mesaj">${ikon('fa-comment')} Mesaj</a><button class="dugme hayalet" type="button" data-paylas aria-label="Profili paylaş">${ikon('fa-share-nodes')}</button></div>`,
    sayaclar: [['fa-briefcase', 'Deneyim', `${d.deneyim_yil} yıl`], ['fa-star', 'Danışan puanı', `${String(d.puan).replace('.', ',')} / 5 (${d.degerlendirme_sayisi} değerlendirme)`], ['fa-tag', 'Seans ücreti', `₺${d.fiyat_araligi.min}–${d.fiyat_araligi.max}`], ['fa-video', 'Görüşme kipi', gorusme(d)]],
  })}
<div class="modul-govde">${sekmeRay([['hakkinda', 'Hakkında', 'fa-user'], ['paket', 'Hizmet Paketleri', 'fa-box-open', 'paketSayi'], ['randevu', 'Randevu', 'fa-calendar-check']])}
${pano('hakkinda', true, `<div class="iki-kolon"><div class="kart"><div class="kart-bas"><h2 class="kart-baslik" id="eceBaslik">${ikon('fa-user-doctor')} <span></span></h2></div><div class="kart-govde okuma" id="eceMetin"></div></div><div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-stethoscope')} Çalışma alanları</h2></div><div class="kart-govde"><div class="sonuc-etiketler" id="eceAlan">${d.uzmanlik.map((u) => `<span class="rozet olumlu">${kac(u)}</span>`).join('')}</div></div></div></div>${genelNot}`)}
${pano('paket', false, `${bolumBas({ etiket: 'Hizmetler', ikon: 'fa-box-open', baslik: 'Hizmet paketleri', metin: 'Paketler diyetisyenin panelinden yönetilir, buraya anında yansır.' })}<div class="kart-izgara c3" id="paketler"></div>`)}
${pano('randevu', false, `${bolumBas({ etiket: 'Uygunluk', ikon: 'fa-calendar-check', baslik: 'Önümüzdeki günler', metin: 'Bir saat seç, randevunu hesabından tamamla. Üstü çizili saatler dolu.' })}<div class="kart"><div class="kart-bas"><span class="kart-metin" id="turEtiket">Görüşme türü</span><div class="segment" id="slotTur" role="group" aria-labelledby="turEtiket"><button type="button" data-deger="online" aria-pressed="true">Online</button><button type="button" data-deger="yüz yüze" aria-pressed="false">Yüz yüze</button></div></div><div class="kart-govde" id="slotlar"></div><div class="kart-alt"><span class="not" id="slotNot">Bir saat seçilmedi.</span><a class="dugme birincil" id="slotDevam" href="${K}hesabim/diyetisyenim/#randevu">Randevuyu tamamla ${ikon('fa-arrow-right')}</a></div></div>`)}
</div>`;

  return [
    { yol: 'diyetisyenler', meta: { baslik: 'Diyetisyenler', duzen: 'public', aktif: 'Diyetisyenler', hero: true, js: sayfaJs('liste') }, govde: landing },
    { yol: 'diyetisyen/dyt-elif-sahin', meta: { baslik: e.ad, duzen: 'public', aktif: 'Diyetisyenler', js: sayfaJs('profil') }, govde: elif },
    { yol: 'diyetisyen/dyt-ece-tunali', meta: { baslik: d.ad, duzen: 'public', aktif: 'Diyetisyenler', js: sayfaJs('profil') }, govde: ece },
  ];
};
