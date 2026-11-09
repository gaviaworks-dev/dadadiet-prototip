// Diyetisyenler landing + iki profil: canlı Elif Şahin (yalnız public bilgi) ve panel demosu Ece Tunalı.
import { K, sayfaJs, bant, bantSayilar, bolum, bolumBas, dugme, ikon, uzmanKart, gorusme, genelNot, kirinti, kac, ikonKart } from '../../parcalar/public-araclar/ortak.mjs';
import { bicim } from '../../parcalar/bicim.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';
const ustSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', kap: false })).join('');
const sonSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', konum: 'alt' })).join('');


/* Bant, durum şeridi ve gövde tek .zebra içinde durur: #pageMain'in ikinci çocuğu kabukta bant üstüne biner (-22px, köşe, gölge), profil bandında bu istenmez. */
const profilUst = (d, { eylem, sayaclar, giris }) => `<section class="bolum kabuk-alti kimlik-bant"><div class="kap">
${kirinti(['Diyetisyenler', 'diyetisyenler/'], [kac(d.ad)])}
<div class="kapak" id="profilKapak" data-arkaplan="${K}assets/img/diyetisyen/profil-banner.jpg"><span class="kapak-muhur">${ikon('fa-user-doctor')} Diyetisyen profili</span></div>
<div class="kimlik"><span class="kimlik-avatar harf" id="profilAvatar" aria-hidden="true">${d.harf}</span><div class="kimlik-govde"><h1>${kac(d.ad)}</h1><span class="kimlik-kullanici">${d.unvan} · <span data-alan="uzmanlik1">${kac(d.uzmanlik[0])}</span></span>${giris ? `<p class="kimlik-giris">${giris}</p>` : ''}<div class="kimlik-meta"><span>${ikon('fa-location-dot')}<span><span data-alan="sehir">${d.sehir}</span> · <span data-alan="gorusme">${gorusme(d)}</span></span></span><span>${ikon('fa-briefcase')}<span><span data-alan="deneyim">${d.deneyim_yil} yıl</span> deneyim</span></span></div></div><div class="kimlik-eylem" id="profilEylem">${eylem}</div></div>
<div class="sayac-serit dort-kolon">${sayaclar.map(([i, e, v, alan]) => `<div class="sayac">${ikon(i)}<div><span>${e}</span><b${alan ? ` data-alan="${alan}"` : ''}>${v}</b></div></div>`).join('')}</div>
</div></section>`;

const sekmeRay = (l) => `<div class="sekme-ray"><div class="kap"><div class="sekmeler ortali" role="tablist" aria-label="Profil bölümleri">${l.map(([id, a, i, n], k) => `<button class="sekme${k === 0 ? ' aktif' : ''}" type="button" role="tab" id="t-${id}" aria-controls="p-${id}" aria-selected="${k === 0}"${k ? ' tabindex="-1"' : ''}>${ikon(i)} ${a}${n != null ? ` <span class="sekme-sayi"${typeof n === 'string' ? ` id="${n}"` : ''}>${typeof n === 'string' ? '' : n}</span>` : ''}</button>`).join('')}</div></div></div>`;
const pano = (id, ilk, icerik) => `<div class="fit-pane" id="p-${id}" role="tabpanel" aria-labelledby="t-${id}" tabindex="-1"${ilk ? '' : ' hidden'}><div class="wrap kap yigin">${icerik}</div></div>`;
/* Canlı süzgeç: kapanır gruplar, yuvarlak onay kutusu, ilk altı alandan sonrası "Tüm alanları göster" ile açılır. */
const UZMANLIKLAR = ['Kilo Yönetimi', 'Sporcu Beslenmesi', 'Çocuk & Ergen Beslenmesi', 'Gebelik & Emzirme', 'Klinik / Hastalık Beslenmesi', 'Bağırsak Sağlığı', 'Hormonal Denge & PCOS', 'Vejetaryen & Vegan', 'İnsülin Direnci & Diyabet', 'Yeme Davranışı', 'Geriatri Beslenmesi', 'Onkoloji Beslenmesi'];
const SIRALAMA = [['onerilen', 'Önerilen', 'fa-wand-magic-sparkles'], ['puan', 'En Yüksek Puan', 'fa-star'], ['degerlendirme', 'En Çok Değerlendirme', 'fa-comment-dots'], ['fiyat', 'En Uygun Fiyat', 'fa-tag'], ['deneyim', 'En Deneyimli', 'fa-briefcase'], ['uygunluk', 'En Yakın Uygunluk', 'fa-calendar-check']];
const suzmeSatir = (alan, v, a, sinif = '', onIkon = '') => `<label class="suzme-satir${sinif ? ' ' + sinif : ''}"><input type="checkbox" data-suz="${alan}" value="${kac(v)}" data-ad="${kac(a)}"><span class="suzme-onay"></span>${onIkon}<span class="suzme-ad">${kac(a)}</span></label>`;
const suzmeGrup = (ad, govde, sinif = '') => `<div class="suzme-grup acik${sinif ? ' ' + sinif : ''}"><button class="suzme-grup-bas" type="button" aria-expanded="true">${ad} <span class="suzme-rozet">0</span>${ikon('fa-chevron-down suzme-ok')}</button><div class="suzme-grup-govde">${govde}</div></div>`;
/* Veri olmayan süzgeç: canlıdaki cinsiyet kalıbı, pasif kutu + neden notu */
const pasifSatirlar = (l, not) => `${l.map((a) => `<label class="suzme-satir"><input type="checkbox" disabled><span class="suzme-onay"></span><span class="suzme-ad">${a}</span></label>`).join('')}<small class="suzme-not">${not}</small>`;
const fiyatNotu = 'Seans ücretleri profillerde yayına girdiğinde kullanılabilir.';
const suzmeSutun = (sehirler, adet) => `<aside class="suzme-sutun" id="suzmeSutun" aria-label="Filtreler"><div class="suzme-kapak-bas"><h2>${ikon('fa-sliders')} Filtrele</h2><div class="suzme-kapak-sag"><button class="suzme-temizle" type="button" data-temizle>Temizle</button><button class="suzme-kapat" id="suzmeKapat" type="button" aria-label="Filtre panelini kapat">${ikon('fa-xmark')}</button></div></div>
<div class="suzme-kapak-govde"><div class="suzme-bas"><h2>${ikon('fa-sliders')} Filtreler</h2><button class="suzme-temizle" type="button" data-temizle>Tümünü Temizle</button></div>
${suzmeGrup('Uzmanlık Alanı', `${UZMANLIKLAR.map((u, i) => suzmeSatir('uzmanlik', u, u, i > 5 ? 'ek' : '')).join('')}<button class="suzme-daha" type="button" aria-expanded="false">${ikon('fa-chevron-down')} <span>Tüm alanları göster</span></button>`)}
${suzmeGrup('Görüşme Türü', suzmeSatir('gorusme', 'online', 'Online') + suzmeSatir('gorusme', 'yuz', 'Yüz Yüze'))}
${suzmeGrup('Şehir', sehirler.map((c) => suzmeSatir('sehir', c, c)).join(''))}
${suzmeGrup('Cinsiyet', pasifSatirlar(['Kadın', 'Erkek'], 'Doğrulanmış profil verisi eklendiğinde kullanılabilir.'), 'pasif')}
${suzmeGrup('Dil', pasifSatirlar(['Türkçe', 'İngilizce', 'Almanca', 'Arapça'], 'Uzmanlar görüşme dillerini profillerinde yayınladığında kullanılabilir.'), 'pasif')}
${suzmeGrup('Fiyat Aralığı', pasifSatirlar(['Ekonomik', 'Orta', 'Üst segment'], fiyatNotu), 'pasif')}
${suzmeGrup('Doğrulama', suzmeSatir('dogrulama', '1', 'Doğrulanmış Uzman', '', ikon('fa-circle-check dogrulama-ikon')))}
</div><div class="suzme-kapak-ayak"><button class="dugme birincil" id="suzmeUygula" type="button">${adet} uzmanı göster</button></div></aside><div class="suzme-ortu" id="suzmeOrtu"></div>`;
const siraKutu = `<div class="sira-kutu" id="siraKutu"><button class="sira-dugme" id="siraDugme" type="button" aria-haspopup="true" aria-expanded="false">${ikon('fa-arrow-down-wide-short')}<span class="sira-etiket">Sıralama:</span> <span id="siraSimdi">Önerilen</span> ${ikon('fa-chevron-down sira-ok')}</button><div class="sira-menu" role="menu">${SIRALAMA.map(([v, a, i], k) => `<button class="${k ? '' : 'aktif'}" type="button" role="menuitem" data-sira="${v}">${ikon(i)} ${a}</button>`).join('')}</div></div>`;
const satir = (i, b, m, sag = '') => `<div class="ayar-satir"><span class="as-ikon" aria-hidden="true">${ikon(i)}</span><div class="as-metin"><b>${b}</b><span>${m}</span></div>${sag}</div>`;

/* Danışan yorumları: yalnız görüşmesi tamamlanmış danışandan, onaydan sonra. Sahte yorum ve puan yazılmaz (K23.3) */
const yorumPano = (ad) => `${bolumBas({ etiket: 'Danışan yorumları', ikon: 'fa-comment-dots', baslik: 'Danışanlar Ne Diyor?', metin: 'Yorumlar yalnız görüşmesi tamamlanmış danışanlardan alınır ve yayından önce incelenir.' })}<div class="kart"><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-comment-dots')}</span><h3>Henüz onaylı danışan yorumu yok</h3><p>${kac(ad)} ile görüşmesi tamamlanan danışanların yorumları onaylandıkça burada listelenir.</p>${dugme('Yorum kuralları', 'yasal/kullanim-kosullari/', 'hayalet')}</div></div>`;
/* Uzman içerikleri: canlıda profil altında yazılar ve örnek menüler; prototipte yayınlanmış içerik yok */
const icerikPano = (ad) => `${bolumBas({ etiket: 'Uzman içerikleri', ikon: 'fa-newspaper', baslik: 'Uzmanın Yazıları ve Örnek Menüleri', metin: 'Uzmanın yayınladığı rehber yazıları ve örnek menüler burada toplanır.' })}<div class="kart"><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-newspaper')}</span><h3>Henüz yayınlanmış içerik yok</h3><p>${kac(ad)} bir yazı ya da örnek menü yayınladığında burada görünür. O zamana kadar genel rehberlere göz atabilirsin.</p>${dugme('Beslenme Rehberi', 'besin-rehberi/', 'hayalet', 'fa-arrow-right', true)}</div></div>`;
const bekliyor = '<span class="rozet bekleme">bekliyor</span>';
/* Kaydet: misafirde tarayıcıda tutulur ve kayıt daveti açılır, üyede kaydedilenlere yazılır (assets/js/misafir.js) */
const kaydetDugme = (d) => `<button class="dugme hayalet" type="button" data-kaydet="diyetisyenler" data-slug="${d.slug}" data-ad="${kac(d.ad)}" data-etiket="Kaydet" data-etiket-tamam="Kaydedildi" aria-pressed="false">${ikon('fa-bookmark')} Kaydet</button>`;

export default ({ veri }) => {
  const s = veri.sayaclar, D = veri.diyetisyenler.diyetisyenler, sehirler = [...new Set(D.map((d) => d.sehir))].sort((a, b) => a.localeCompare(b, 'tr'));
  const landing = `${bant({ yol: [['Diyetisyenler']], etiket: 'Uzman Diyetisyenler', etiketIkon: 'fa-stethoscope', h1: 'Sana uygun <span class="vurgu">diyetisyeni</span> bul, randevunu al', gorsel: 'hero/mega-photo-1467453678174-768ec283a940.avif', alt: 'Alanında uzman diyetisyenlerle online ya da yüz yüze görüş. Uzmanlık alanına, şehrine ve bütçene göre filtrele; danışan yorumlarını oku.',
    eylem: dugme('Sana Uygun Diyetisyeni Bul', 'diyetisyen-bul-sihirbazi/', 'birincil', 'fa-wand-magic-sparkles') + dugme('Bana Uygun Olanı Bul', 'bana-uygun-olani-bul/', 'koyu-zemin notr', 'fa-compass') + dugme('Diyetisyen Ol', 'diyetisyen-ol/', 'koyu-zemin notr', 'fa-id-badge'),
    alttaki: bantSayilar([[s.diyetisyen, 'Uzman profili'], [`${s.diyetisyen_il} il`, '+ online Türkiye geneli']]).replace('bant-sayilar', 'bant-sayilar alt-hiza yuksek') })}
${bolum(`${rk(['DN-FRIDGE', 'DN-P1', 'DN-P2', 'DN-P3', 'DN-P4', 'DN-P5'], { hedef: '.bant', yon: 'yerine', ust: kirinti(['Diyetisyenler']) })}${ustSerit('SF-L1')}<div class="suzme-yerlesim" id="uzmanListe">${suzmeSutun(sehirler, D.length)}
<div class="suzme-ana"><div class="liste-cubuk"><p class="liste-ozet"><b id="uzmanSayi">${D.length} uzman</b> bulundu</p><div class="liste-arac"><button class="suzme-ac" id="suzmeAc" type="button">${ikon('fa-sliders')} Filtrele <span class="suzme-ac-sayi" id="suzmeSayi" hidden>0</span></button>${siraKutu}</div></div>
<div class="suzme-cipler" id="suzmeCipler" aria-label="Aktif filtreler" hidden></div>
<p class="dogrulama-notu">${ikon('fa-shield-halved')}<span>Doğrulama: "Doğrulandı" rozeti, diploması ve mesleki kaydı kontrol edilen uzmanları gösterir; kontrol tamamlanmadan rozet verilmez.</span></p>
<div class="vitrin-izgara" id="uzmanKartlar">${D.map((d, i) => uzmanKart(d, i)).join('')}</div>${rk('SF-N2', { tur: 'uzman', hedef: '#uzmanKartlar', sira: 4 })}
<div class="kart suzme-bos" id="uzmanBos" hidden><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-user-doctor')}</span><h3>Uzman bulunamadı</h3><p>Daha fazla uzman görmek için bir filtreyi temizle.</p></div></div></div></div>`, { ilk: true, sinif: 'suzme-bolum' })}
<div class="bolum-dizi">
${bolum(genelNot)}
${sonSerit('SF-L1-END')}
</div>`;

  const e = D.find((d) => d.slug === 'dyt-elif-sahin');
  const elif = `<div class="zebra">${profilUst(e, {
    eylem: `<a class="dugme birincil" href="${K}giris/" data-randevu>${ikon('fa-calendar-check')} Randevu al</a><div><a class="dugme hayalet" href="${K}giris/" data-mesaj>${ikon('fa-paper-plane')} Mesaj</a>${kaydetDugme(e)}<button class="dugme hayalet" type="button" data-paylas aria-label="Profili paylaş">${ikon('fa-share-nodes')}</button></div>`,
    sayaclar: [['fa-briefcase', 'Deneyim', `${e.deneyim_yil} yıl`], ['fa-video', 'Görüşme kipi', gorusme(e)], ['fa-location-dot', 'Konum', e.sehir], ['fa-star', 'Danışan puanı', 'Henüz puan yok']],
  })}
<div class="modul-govde">${rk('SF-P1', { tur: 'bant' })}${sekmeRay([['profil', 'Profil', 'fa-user'], ['hakkinda', 'Hakkında', 'fa-circle-info'], ['yorumlar', 'Yorumlar', 'fa-comment-dots', 0], ['icerikler', 'İçerikler', 'fa-newspaper']])}
${pano('profil', true, `<div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-stethoscope')} Çalışma Alanları</h2></div><div class="kart-govde"><div class="sonuc-etiketler">${e.uzmanlik.map((u) => `<span class="rozet olumlu">${kac(u)}</span>`).join('')}</div></div></div>
<div class="kart" id="randevu"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-list-check')} Profil Durumu</h2><p>Bu profilde henüz yayınlanmış kayıt olmayan alanlar tek yerde.</p></div></div><div class="kart-govde ayar-liste">${satir('fa-calendar-check', 'Randevu uygunluğu', 'Önümüzdeki yedi gün için açık görüşme saati görünmüyor.', '<span class="durum-hapi">Açık saat yok</span>')}${satir('fa-box-open', 'Hizmet ve paketler', 'Hizmet kataloğu yayına girdiğinde burada görünür.', '<span class="durum-hapi">Yakında</span>')}${satir('fa-comment-dots', 'Danışan yorumları', 'Yorumlar yalnız görüşmesi tamamlanmış danışanlardan alınır.', '<span class="durum-hapi">0 yorum</span>')}</div><div class="kart-alt">${dugme('Doğrulama nasıl yapılıyor?', 'yasal/', 'hayalet')}${dugme('Bütün diyetisyenler', 'diyetisyenler/', 'birincil', 'fa-arrow-right', true)}</div></div>`)}
${pano('hakkinda', false, `${bolumBas({ etiket: 'Uzmanlık ve görüşme', ikon: 'fa-circle-info', baslik: `${kac(e.ad)} Hakkında`, metin: 'Hangi alanlarda çalışıyor, görüşmeler hangi kipte yürüyor.' })}<div class="kart"><div class="kart-govde"><dl class="kunye"><div><dt>Unvan</dt><dd>${e.unvan}</dd></div><div><dt>Deneyim</dt><dd>${e.deneyim_yil} yıl</dd></div><div><dt>Görüşme</dt><dd>${gorusme(e)}</dd></div><div><dt>Konum</dt><dd>${e.sehir}</dd></div></dl></div></div>
<div class="kart"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-graduation-cap')} Eğitim ve Belgeler</h2><p>Canlı profilde yayınlanan bilgi; eğitim ve belge kaydı henüz paylaşılmadı.</p></div></div><div class="kart-govde ayar-liste">${satir('fa-graduation-cap', 'Eğitim', 'Uzman eğitim bilgisini profiline eklediğinde görünür.', bekliyor)}${satir('fa-file-shield', 'Diploma ve mesleki kayıt', 'Doğrulama tamamlandığında "Doğrulandı" rozetiyle görünür.', bekliyor)}${satir('fa-utensils', 'Örnek menüler', 'Uzman örnek menü yayınladığında İçerikler sekmesinde listelenir.', bekliyor)}</div></div>${genelNot}`)}
${pano('yorumlar', false, yorumPano(e.ad))}
${pano('icerikler', false, icerikPano(e.ad))}
</div>${sonSerit('SF-P1-END')}</div>`;

  const d = veri.demo.diyetisyen;
  const ece = `<div class="zebra"><div class="uyari-serit" id="onizlemeSerit" hidden><div class="kap">${ikon('fa-eye')}<p>Önizleme, ziyaretçiler bu sayfayı görmüyor. <a class="baglanti-metin" href="${K}diyetisyen-paneli/profil/">Panele dön</a></p></div></div>${profilUst(d, {
    giris: '<span id="eceKisa"></span> <span class="ornek-etiket satir-ici">prototip örneği</span>',
    eylem: `<a class="dugme birincil" href="#p-randevu" data-sekme-git="t-randevu">${ikon('fa-calendar-check')} Randevu al</a><div><a class="dugme hayalet" href="${K}hesabim/diyetisyenim/#mesaj">${ikon('fa-paper-plane')} Mesaj</a>${kaydetDugme(d)}<button class="dugme hayalet" type="button" data-paylas aria-label="Profili paylaş">${ikon('fa-share-nodes')}</button></div>`,
    sayaclar: [['fa-briefcase', 'Deneyim', `${d.deneyim_yil} yıl`, 'deneyim'], ['fa-star', 'Danışan puanı', 'Henüz puan yok'], ['fa-tag', 'Seans ücreti', `${bicim.para(d.fiyat_araligi.min)}–${bicim.sayi(d.fiyat_araligi.max)}`], ['fa-video', 'Görüşme kipi', gorusme(d), 'gorusme']],
  })}
<section class="bolum" id="profilKapali" hidden><div class="kap"><div class="kart"><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-user-clock')}</span><h3>Bu profil henüz yayında değil</h3><p>Uzmanın başvurusu inceleniyor. Yayına girdiğinde hizmetleri ve randevu saatleri burada görünür.</p><a class="dugme birincil" href="${K}diyetisyenler/">Tüm diyetisyenleri gör</a></div></div></div></section>
<div class="modul-govde" id="profilGovde">${rk('SF-P1', { tur: 'bant' })}${sekmeRay([['hakkinda', 'Hakkında', 'fa-user'], ['paket', 'Hizmet Paketleri', 'fa-box-open', 'paketSayi'], ['randevu', 'Randevu', 'fa-calendar-check'], ['yorumlar', 'Yorumlar', 'fa-comment-dots', 0], ['icerikler', 'İçerikler', 'fa-newspaper']])}
${pano('hakkinda', true, `<div class="iki-kolon"><div class="kart"><div class="kart-bas"><h2 class="kart-baslik" id="eceBaslik">${ikon('fa-user-doctor')} <span></span></h2></div><div class="kart-govde duz-metin" id="eceMetin"></div></div><div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-stethoscope')} Çalışma Alanları</h2></div><div class="kart-govde"><div class="sonuc-etiketler" id="eceAlan">${d.uzmanlik.map((u) => `<span class="rozet olumlu">${kac(u)}</span>`).join('')}</div></div></div></div>
<div class="kart" id="eceEgitim"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-graduation-cap')} Eğitim ve Doğrulama</h2><p>Uzmanın panelindeki profil kaydından okunur; belgeler yalnız yönetim tarafından açılır.</p></div><span class="ornek-etiket">prototip örneği</span></div><div class="kart-govde ayar-liste" id="eceEgitimListe"></div></div>${genelNot}`)}
${pano('paket', false, `${bolumBas({ etiket: 'Hizmetler', ikon: 'fa-box-open', baslik: 'Hizmet Paketleri', metin: 'Paketler diyetisyenin panelinden yönetilir, buraya anında yansır.' })}<div class="kart-izgara c3" id="paketler"></div>`)}
${pano('randevu', false, `${bolumBas({ etiket: 'Uygunluk', ikon: 'fa-calendar-check', baslik: 'Önümüzdeki Günler', metin: 'Bir saat seç, randevunu hesabından tamamla. Üstü çizili saatler dolu.' })}<div class="kart"><div class="kart-bas"><span class="kart-metin" id="turEtiket">Görüşme türü</span><div class="segment" id="slotTur" role="group" aria-labelledby="turEtiket"><button type="button" data-deger="online" aria-pressed="true">Online</button><button type="button" data-deger="yüz yüze" aria-pressed="false">Yüz yüze</button></div></div><div class="kart-govde" id="slotlar"></div><div class="kart-alt"><span class="not" id="slotNot">Bir saat seçilmedi.</span><a class="dugme birincil" id="slotDevam" href="${K}hesabim/diyetisyenim/#randevu">Randevuyu tamamla ${ikon('fa-arrow-right')}</a></div></div>`)}
${pano('yorumlar', false, yorumPano(d.ad))}
${pano('icerikler', false, icerikPano(d.ad))}
</div>${sonSerit('SF-P1-END')}</div>`;

  return [
    { yol: 'diyetisyenler', meta: { baslik: 'Diyetisyenler', duzen: 'public', aktif: 'Diyetisyenler', hero: true, js: sayfaJs('uzman') }, govde: landing },
    { yol: 'diyetisyen/dyt-elif-sahin', meta: { baslik: e.ad, duzen: 'public', aktif: 'Diyetisyenler', js: [...sayfaJs('profil'), 'assets/js/misafir.js'] }, govde: elif },
    { yol: 'diyetisyen/dyt-ece-tunali', meta: { baslik: d.ad, duzen: 'public', aktif: 'Diyetisyenler', js: [...sayfaJs('profil'), 'assets/js/misafir.js'] }, govde: ece },
  ];
};
