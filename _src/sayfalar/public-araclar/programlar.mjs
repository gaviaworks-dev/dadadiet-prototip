// Programlar: ana liste, beş kırılım (her biri kendi başlığıyla), program detayı, Program Bul sihirbazı.
import { K, sayfaJs, bant, bolum, bolumBas, dugme, ikon, ikonKart, programKart, programIkon, genelNot, kac, sayi, icerik, DETAY, sihirbazKabuk, adim, jsonGom } from '../../parcalar/public-araclar/ortak.mjs';
import { akdenizGunler } from '../../parcalar/public-araclar/akdeniz-gunler.mjs';

const BOYUT = 12;
const HEDEF_IKON = { dengeli: 'fa-scale-balanced', detoks: 'fa-leaf', oruc: 'fa-hourglass-half', protein: 'fa-drumstick-bite', vegan: 'fa-seedling', seker: 'fa-cubes-stacked', kilo: 'fa-weight-scale', kas: 'fa-dumbbell' };

const kartlar = (P) => P.map((p, i) => programKart(p, { gizli: i >= BOYUT })).join('');
const liste = ({ P, alan, kume, etiket }) => `<div data-liste${alan ? ` data-alan="${alan}" data-param="${alan}"` : ''} data-boyut="${BOYUT}" data-birim="program">
${kume ? `<div class="sekme-ray liste-ust"><div class="sekmeler suzgec" role="tablist" aria-label="${etiket}"><button class="sekme aktif" type="button" role="tab" data-deger="" aria-selected="true">${ikon('fa-layer-group')} Tümü <span class="sekme-sayi">${P.length}</span></button>${kume.map((c) => `<button class="sekme" type="button" role="tab" data-deger="${c.slug}" aria-selected="false" tabindex="-1">${c.ikon ? ikon(c.ikon) + ' ' : ''}${c.ad} <span class="sekme-sayi">${c.sayi}</span></button>`).join('')}</div></div>` : ''}
<div class="kart-izgara c3" data-izgara>${kartlar(P)}</div>
<nav class="sayfalama" data-sayfalama aria-label="Sayfalama"></nav><p class="sayfalama-not" data-not></p>
</div>`;

export default ({ veri }) => {
  const s = veri.sayaclar, V = veri.programlar, P = V.programlar, k = V.kirilimlar;
  const sayilar = [[s.program, 'Program'], [sayi(s.ornek_ogun), 'Örnek öğün'], [s.diyetisyen, 'Diyetisyen']];
  const KIRILIM = [
    { yol: 'hedefe-gore', ad: 'Hedefe Göre', alan: 'hedef', kume: k.hedef.map((c) => ({ ...c, ikon: HEDEF_IKON[c.slug] })), ikon: 'fa-bullseye', h1: 'Hedefine göre <span class="vurgu">hazır programlar</span>', alt: 'Dengelenmek, kilo yönetmek ya da kas yapmak: hedefini seç, ona uygun örnek menüleri gör.', gorsel: 'hero/programlar-dl-top.jpg', kisa: 'Kilo ver, dengelen, kas yap' },
    { yol: 'yasam-bicimine-gore', ad: 'Yaşam Biçimine Göre', alan: 'yasam', kume: k.yasam, ikon: 'fa-people-roof', h1: 'Yaşam biçimine <span class="vurgu">uyan programlar</span>', alt: 'Öğrenci, ofis çalışanı, sporcu ya da aile: gününün ritmine oturan menüleri seç.', gorsel: 'hero/programlar-yasam-dl-top.avif', kisa: 'Aile, öğrenci, sporcu, ofis' },
    { yol: 'beslenme-tercihine-gore', ad: 'Beslenme Tercihine Göre', alan: 'tercih', kume: k.beslenme_tercihi, ikon: 'fa-seedling', h1: 'Beslenme tercihine <span class="vurgu">göre programlar</span>', alt: 'Akdeniz tipi, bitkisel, glütensiz ya da aralıklı oruç: beslenme tarzına uyan menüleri listele.', gorsel: 'hero/programlar-tercih-dl-top.jpg', kisa: 'Akdeniz, bitkisel, aralıklı oruç' },
    { yol: 'ihtiyacina-gore', ad: 'İhtiyacına Göre', alan: 'ihtiyac', kume: k.ihtiyac, ikon: 'fa-list-check', h1: 'İhtiyacına göre <span class="vurgu">pratik programlar</span>', alt: 'Ekonomik, tok tutan, işe götürülebilir: gündelik ihtiyacını karşılayan menüleri bul.', gorsel: 'hero/css-photo-1547592180-85f173990554.jpg', kisa: 'Ekonomik, pratik, tok tutan' },
    { yol: 'sureye-gore', ad: 'Süreye Göre', alan: 'sure', kume: k.sure.map((c) => ({ ...c, slug: String(c.gun) })), ikon: 'fa-calendar', h1: 'Ne kadar vaktin varsa <span class="vurgu">ona göre seç</span>', alt: 'Üç günlük denemeden dört haftalık düzene: planlamak istediğin süreye uyan programları gör.', gorsel: 'hero/css-photo-1512852939750-1305098529bf.jpg', kisa: 'Kaç gün, ne kadar süre' },
  ];

  const ana = `${bant({ yol: [['Programlar']], etiket: 'Beslenme programları', etiketIkon: 'fa-list-check', h1: 'Sana uygun <span class="vurgu">beslenme programı</span>', gorsel: 'hero/programlar-dl-top.jpg', alt: 'Beslenme rehberine dayalı örnek menüler ve günlük listeler. İncele, ister tek tarif olarak uygula ister adım adım takip et.', sayilar })}
<div class="bolum-dizi">
${bolum(`${bolumBas({ etiket: 'Nasıl aramak istersin?', ikon: 'fa-compass', baslik: 'Programını seçmenin altı yolu', metin: 'Beş kırılımdan birini aç ya da sihirbaz senin için eşleştirsin.' })}<div class="kart-izgara c3">${ikonKart({ href: 'programlar/program-bul/', ikon: 'fa-wand-magic-sparkles', baslik: 'Program Bul', metin: 'Beş adımda eşleştirme' })}${KIRILIM.map((x) => ikonKart({ href: `programlar/${x.yol}/`, ikon: x.ikon, baslik: x.ad, metin: x.kisa })).join('')}</div>`, { ilk: true })}
${bolum(`${bolumBas({ etiket: 'Tüm programlar', ikon: 'fa-list-check', baslik: `${s.program} program yayında`, metin: 'Tüm menüler genel örnektir, kişiye özel plan değildir.' })}${liste({ P })}`, { id: 'programListe' })}
${bolum(genelNot)}
</div>`;

  const kirilimSayfa = (x) => ({
    yol: `programlar/${x.yol}`, meta: { baslik: `Programlar: ${x.ad}`, duzen: 'public', aktif: 'Programlar', hero: true, js: sayfaJs('liste') },
    govde: `${bant({ yol: [['Programlar', 'programlar/'], [x.ad]], etiket: x.ad, etiketIkon: x.ikon, h1: x.h1, gorsel: x.gorsel, alt: x.alt, sayilar })}
<div class="bolum-dizi">
${bolum(liste({ P, alan: x.alan, kume: x.kume, etiket: x.ad }), { ilk: true, id: 'programListe' })}
${bolum(`<div class="vurgu-panel acik"><div><span class="ust-etiket">${ikon('fa-wand-magic-sparkles')} Program Bul</span><h2>Karar veremedin mi?</h2><p>Beş soruda hedefini, süreni ve tercihini al; sana en yakın programları nedenleriyle gösterelim.</p><div class="eylem-satiri">${dugme('Programını Bul', 'programlar/program-bul/', 'birincil', 'fa-wand-magic-sparkles')}</div></div><div class="satir-liste">${KIRILIM.filter((y) => y !== x).slice(0, 3).map((y) => `<a class="satir-baglanti" href="${K}programlar/${y.yol}/"><span class="ikon-kutu">${ikon(y.ikon)}</span><span>${y.ad}<small>${y.kisa}</small></span></a>`).join('')}</div></div>`)}
${bolum(genelNot)}
</div>`,
  });

  const p = P.find((x) => x.slug === 'akdeniz-tipi-beslenme');
  const benzer = P.filter((x) => x.slug !== p.slug && x.tercih.includes('akdeniz')).slice(0, 3);
  const gunler = akdenizGunler.map((g, i) => `<div class="akordeon-kalem${i === 0 ? ' acik' : ''}"><button class="akordeon-bas" type="button" aria-expanded="${i === 0}"><span class="akordeon-ikon">${ikon('fa-calendar-day')}</span>${g.gun}<i class="fa-solid fa-chevron-down akordeon-ok" aria-hidden="true"></i></button><div class="akordeon-govde"><div class="ogun-liste">${g.ogunler.map(([o, m]) => `<div class="ogun-satir"><b>${o}</b><span>${kac(m)}</span></div>`).join('')}</div></div></div>`).join('');
  const detay = `${bant({ yol: [['Programlar', 'programlar/'], [p.ad]], etiket: p.kategori, etiketIkon: programIkon(p), h1: p.ad, gorsel: 'hero/mega-photo-1540420773420-3366772f4999.jpg', alt: kac(p.aciklama), sayilar: [[p.sure_gun, 'Gün'], [p.ogun_sayisi, 'Öğün'], [p.zorluk, 'Zorluk']] })}
<div class="bolum-dizi">
${bolum(`<div class="sayac-serit ust-bosluksuz"><div class="sayac">${ikon('fa-fire')}<div><span>Günlük enerji</span><b>${p.enerji}</b></div></div><div class="sayac">${ikon('fa-calendar')}<div><span>Süre</span><b>${p.sure}</b></div></div><div class="sayac">${ikon('fa-utensils')}<div><span>Öğün planı</span><b>${p.ogun_sayisi} öğün</b></div></div><div class="sayac">${ikon('fa-signal')}<div><span>Zorluk</span><b>${p.zorluk}</b></div></div></div>
<div class="bolum-eylem">${dugme('Programa başla', `hesabim/program-baslat/?program=${p.slug}`, 'birincil', 'fa-play')}${dugme('Programlara dön', 'programlar/', 'hayalet')}</div>`, { ilk: true })}
${bolum(`${bolumBas({ etiket: 'Örnek akış', ikon: 'fa-calendar-week', baslik: '7 günlük öğün dökümü', metin: 'Gün gün kahvaltı, ara öğün, öğle, ikindi ve akşam yemeği için genel öneriler. Örnek niteliğindedir, uyarlanabilir.' })}<div class="akordeon">${gunler}</div>`)}
${bolum(`${bolumBas({ etiket: 'Benzer programlar', ikon: 'fa-list-check', baslik: 'Akdeniz tipi başka menüler', arac: dugme('Tümünü gör', 'programlar/beslenme-tercihine-gore/?tercih=akdeniz', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c3">${benzer.map((x) => programKart(x)).join('')}</div>`)}
${bolum(genelNot)}
</div>`;

  const slim = P.map((x) => ({ slug: x.slug, ad: x.ad, aciklama: x.aciklama, kategori: x.kategori, sure: x.sure, sure_gun: x.sure_gun, enerji: x.enerji, zorluk: x.zorluk, ogun_sayisi: x.ogun_sayisi, hedef: x.hedef, yasam: x.yasam, tercih: x.tercih, ihtiyac: x.ihtiyac, gorsel: x.gorsel_dosya }));
  const bul = sihirbazKabuk({
    id: 'program', cikis: 'programlar/',
    govde: `${adim({ id: 'hedef', baslik: 'Programdan ne bekliyorsun?', alt: 'Eşleştirmenin en belirleyici adımı bu.', gorsel: 'hero/programlar-dl-top.jpg', alanlar: [{ ad: 'hedef', secenekler: [
      { deger: 'dengeli', baslik: 'Dengeli beslenme', alt: 'Sürdürülebilir bir düzen kur', ikon: 'fa-scale-balanced' }, { deger: 'kilo', baslik: 'Kilo kontrolü', alt: 'Kalori dengesini yönet', ikon: 'fa-weight-scale' },
      { deger: 'sporcu', baslik: 'Sporcu beslenmesi', alt: 'Protein ve toparlanma odaklı', ikon: 'fa-dumbbell' }, { deger: 'bitkisel', baslik: 'Bitkisel beslenme', alt: 'Vejetaryen veya vegan düzen', ikon: 'fa-seedling' }] }] })}
${adim({ id: 'sure', baslik: 'Ne kadar sürelik bir plan istiyorsun?', alt: 'Programların gerçek sürelerinden seç.', gorsel: 'hero/css-photo-1512852939750-1305098529bf.jpg', alanlar: [{ ad: 'sure', secenekler: [
      { deger: '3', baslik: '3 gün', alt: 'Kısa deneme', ikon: 'fa-calendar-day' }, { deger: '7', baslik: '7 gün', alt: 'Bir haftalık düzen', ikon: 'fa-calendar-week' }, { deger: '14', baslik: '14 gün', alt: 'İki hafta', ikon: 'fa-calendar' }, { deger: '28', baslik: '28 gün', alt: 'Dört hafta', ikon: 'fa-calendar-check' }] }] })}
${adim({ id: 'tercih', baslik: 'Beslenme tercihin nedir?', alt: 'Uyumsuz programları listeden çıkaralım.', gorsel: 'hero/programlar-tercih-dl-top.jpg', alanlar: [{ ad: 'tercih', secenekler: [
      { deger: 'standart', baslik: 'Standart', alt: 'Kısıt yok', ikon: 'fa-utensils' }, { deger: 'vejetaryen', baslik: 'Vejetaryen', alt: 'Et yok', ikon: 'fa-carrot' }, { deger: 'vegan', baslik: 'Vegan', alt: 'Tamamen bitkisel', ikon: 'fa-seedling' }, { deger: 'glutensiz', baslik: 'Glütensiz', alt: 'Gluten içermez', ikon: 'fa-wheat-awn-circle-exclamation' }] }] })}
${adim({ id: 'duzen', baslik: 'Günlük düzenin nasıl?', alt: 'Öğün sayısı ve hazırlama süresi beklentin.', gorsel: 'hero/css-photo-1494859802809-d069c3b71a8a.jpg', alanlar: [
      { ad: 'ogun', etiket: 'Öğün sayısı', sinif: 'c3', secenekler: [{ deger: '3', baslik: '3 öğün', alt: 'Ara öğün yok' }, { deger: '4', baslik: '3 + 1 ara', alt: 'Tek ara öğün' }, { deger: '5', baslik: '5 öğün', alt: 'Sık ve küçük' }] },
      { ad: 'hazirlik', etiket: 'Hazırlama süresi', sinif: 'c3', secenekler: [{ deger: 'hizli', baslik: "15 dk'dan az", alt: 'Hızlı olsun' }, { deger: 'orta', baslik: '15–30 dk', alt: 'Dengeli' }, { deger: 'uzun', baslik: '30 dk üzeri', alt: 'Vaktim var' }] }] })}
${adim({ id: 'ozel', baslik: 'Alerji ya da özel bir sağlık durumun var mı?', alt: 'Varsa program önerisini uzman desteğiyle birlikte veriyoruz.', gorselIkon: 'fa-notes-medical', alanlar: [{ ad: 'ozel', secenekler: [
      { deger: 'yok', baslik: 'Yok', alt: 'Bildiğim bir durum yok', ikon: 'fa-circle-check' }, { deger: 'alerji', baslik: 'Besin alerjim var', alt: 'Alerji veya intolerans', ikon: 'fa-triangle-exclamation' }, { deger: 'saglik', baslik: 'Sağlık durumum var', alt: 'Gebelik, kronik hastalık, ilaç', ikon: 'fa-notes-medical' }] }] })}
<section class="sihirbaz-adim" data-sonuc hidden><h1 tabindex="-1" id="sonucBaslik"></h1><p>Seçimlerinle eşleşme nedenleri her kartın içinde yazılı.</p><div class="uyari-kutu" id="sonucUyari" role="note" hidden>${ikon('fa-triangle-exclamation')}<span></span></div><div class="kart-izgara c3" id="sonucKartlar"></div><div class="bolum-eylem"><a class="dugme hayalet" href="${K}programlar/">Tüm programları gör</a><button class="dugme birincil" type="button" data-bastan>${ikon('fa-rotate-left')} Baştan başla</button></div><p class="alt-not">${ikon('fa-circle-info')}<span>Bu sihirbaz bir yönlendirmedir; sağlık teşhisi koymaz, kişiye özel tıbbi ya da beslenme önerisi üretmez. Programlar genel örnek menülerdir.</span></p></section>
<div class="sihirbaz-gorsel" id="sihirbazGorsel" aria-hidden="true"></div>`,
    ek: jsonGom('sihirbazVeri', { programlar: slim, detay: DETAY.program }),
  });

  return [
    { yol: 'programlar', meta: { baslik: 'Programlar', duzen: 'public', aktif: 'Programlar', hero: true, js: sayfaJs('liste') }, govde: ana },
    ...KIRILIM.map(kirilimSayfa),
    { yol: 'program/akdeniz-tipi-beslenme', meta: { baslik: p.ad, duzen: 'public', aktif: 'Programlar', hero: true, js: sayfaJs() }, govde: detay },
    { yol: 'programlar/program-bul', meta: { baslik: 'Program Bul', duzen: 'tam', js: sayfaJs('sihirbaz') }, govde: bul },
  ];
};
