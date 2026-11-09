// Programlar: ana liste, beş kırılım (her biri kendi başlığıyla), program detayı, Program Bul sihirbazı.
import { K, sayfaJs, bant, bolum, bolumBas, dugme, ikon, ikonKart, programKart, programIkon, genelNot, kac, sayi, DETAY, sihirbazBolum, adim, jsonGom, guven, enerjiBandi, gunlukOgun } from '../../parcalar/public-araclar/ortak.mjs';
import { akdenizGunler, akdenizAlternatif, akdenizMalzeme, MALZEME_GRUP } from '../../parcalar/public-araclar/akdeniz-gunler.mjs';
const MISAFIR_JS = 'assets/js/misafir.js';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';
const ustSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', kap: false })).join('');
const sonSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', konum: 'alt' })).join('');

const BOYUT = 12;
const TERCIH_JS = 'assets/js/tercih-uyum.js';
const programJs = (...ad) => { const [ortak, ...sayfa] = sayfaJs(...ad); return [ortak, TERCIH_JS, ...sayfa]; };
const HEDEF_IKON = { dengeli: 'fa-scale-balanced', detoks: 'fa-leaf', oruc: 'fa-hourglass-half', protein: 'fa-drumstick-bite', vegan: 'fa-seedling', seker: 'fa-cubes-stacked', kilo: 'fa-weight-scale', kas: 'fa-dumbbell' };

const kartlar = (P) => P.map((p, i) => programKart(p, { gizli: i >= BOYUT })).join('');
/* SH-9-3: zorluk, günlük enerji ve öğün süzgeci. Seçenekler verideki değerlerden; sayı her seçenekte yazar */
const secimAlani = (id, ad, alan, secenekler, P) => `<div class="alan"><label class="alan-etiket" for="${id}">${ad}</label><select class="alan-secim" id="${id}" data-alan="${alan}"><option value="">Tümü</option>${secenekler.map(([v, a]) => `<option value="${v}">${a} (${P.filter((p) => String(p[alan]) === v).length})</option>`).join('')}</select></div>`;
const ekSuzgec = (P) => {
  const Q = P.map((p) => ({ zorluk: p.zorluk, enerji: enerjiBandi(p), ogun: gunlukOgun(p) }));
  const zorluk = [...new Set(P.map((p) => p.zorluk))].filter((z) => z !== 'Belirtilmedi').sort((a, b) => a.localeCompare(b, 'tr'));
  const ogun = [...new Set(Q.map((q) => q.ogun))].sort((a, b) => a - b);
  return `<div class="alan-izgara c3 liste-suzgec" data-ek-suzgec role="group" aria-label="Program süzgeçleri">${secimAlani('psZorluk', 'Zorluk', 'zorluk', zorluk.map((z) => [z, z]), Q)}${secimAlani('psEnerji', 'Günlük enerji', 'enerji', [['alt', '1.500 kcal altı'], ['orta', '1.500–1.800 kcal'], ['ust', '1.800 kcal ve üstü']], Q)}${secimAlani('psOgun', 'Günlük öğün', 'ogun', ogun.map((n) => [String(n), n + ' öğün']), Q)}</div>`;
};
const liste = ({ P, alan, kume, etiket, suzgec = false }) => `<div data-liste${alan ? ` data-alan="${alan}" data-param="${alan}"` : ''} data-boyut="${BOYUT}" data-birim="program">
${suzgec ? ekSuzgec(P) : ''}
${kume ?`<div class="sekme-ray liste-ust tam-serit-kap"><div class="sekmeler suzgec tam-serit" role="tablist" aria-label="${etiket}"><button class="sekme aktif" type="button" role="tab" data-deger="" aria-selected="true">${ikon('fa-layer-group')} Tümü <span class="sekme-sayi">${P.length}</span></button>${kume.map((c) => `<button class="sekme" type="button" role="tab" data-deger="${c.slug}" aria-selected="false" tabindex="-1">${c.ikon ? ikon(c.ikon) + ' ' : ''}${c.ad} <span class="sekme-sayi">${c.sayi}</span></button>`).join('')}</div></div>` : ''}
<div data-uyum-bilgi="liste"></div>
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

  const altPanel = (x) => bolum(`<div class="vurgu-panel acik"><div><span class="ust-etiket">${ikon('fa-wand-magic-sparkles')} Program Bul</span><h2>Karar Veremedin mi?</h2><p>Beş soruda hedefini, süreni ve tercihini al; sana en yakın programları nedenleriyle gösterelim.</p><div class="eylem-satiri">${dugme('Programını Bul', 'programlar/program-bul/', 'birincil', 'fa-wand-magic-sparkles')}</div></div><div class="satir-liste">${KIRILIM.filter((y) => y !== x).slice(0, 3).map((y) => `<a class="satir-baglanti" href="${K}programlar/${y.yol}/"><span class="ikon-kutu">${ikon(y.ikon)}</span><span>${y.ad}<small>${y.kisa}</small></span></a>`).join('')}</div></div>`);

  const ana = `${bant({ yol: [['Programlar']], etiket: 'Beslenme programları', etiketIkon: 'fa-list-check', h1: 'Sana uygun <span class="vurgu">beslenme programı</span>', gorsel: 'hero/programlar-dl-top.jpg', alt: 'Beslenme rehberine dayalı örnek menüler ve günlük listeler. İncele, ister tek öğün olarak uygula ister adım adım takip et.', sayilar,
  eylem: `${dugme('Programını Bul', 'programlar/program-bul/', 'birincil', 'fa-wand-magic-sparkles')}${dugme('Bana Uygun Olanı Bul', 'bana-uygun-olani-bul/', 'koyu-zemin', 'fa-compass')}` })}
<div class="bolum-dizi">
${bolum(`${ustSerit('SF-B1')}${bolumBas({ etiket: 'Nasıl aramak istersin?', ikon: 'fa-compass', baslik: 'Programını Seçmenin Altı Yolu', metin: 'Beş kırılımdan birini aç ya da sihirbaz senin için eşleştirsin.' })}<div class="kart-izgara c3">${ikonKart({ href: 'programlar/program-bul/', ikon: 'fa-wand-magic-sparkles', baslik: 'Program Bul', metin: 'Beş adımda eşleştirme' })}${KIRILIM.map((x) => ikonKart({ href: `programlar/${x.yol}/`, ikon: x.ikon, baslik: x.ad, metin: x.kisa })).join('')}</div>`, { ilk: true })}
${bolum(`${bolumBas({ etiket: 'Tüm programlar', ikon: 'fa-list-check', baslik: `${s.program} Program Yayında`, metin: 'Tüm menüler genel örnektir, kişiye özel plan değildir.' })}${liste({ P })}${rk('SF-N1', { tur: 'sonuc', hedef: '#programListe [data-izgara]', sira: 4 })}${rk('SF-B1-SIDE', { tur: 'yan', suzgec: true })}`, { id: 'programListe' })}
${bolum(genelNot)}
</div>`;

  const kirilimSayfa = (x) => ({
    yol: `programlar/${x.yol}`, meta: { baslik: `Programlar: ${x.ad}`, duzen: 'public', aktif: 'Programlar', hero: true, js: programJs('liste') },
    govde: `${bant({ yol: [['Programlar', 'programlar/'], [x.ad]], etiket: x.ad, etiketIkon: x.ikon, h1: x.h1, gorsel: x.gorsel, alt: x.alt, sayilar })}
<div class="bolum-dizi">
${bolum(liste({ P, alan: x.alan, kume: x.kume, etiket: x.ad }), { ilk: true, id: 'programListe' })}
${altPanel(x)}
${bolum(genelNot)}
</div>`,
  });

  const p = P.find((x) => x.slug === 'akdeniz-tipi-beslenme');
  const benzer = P.filter((x) => x.slug !== p.slug && x.tercih.includes('akdeniz')).slice(0, 4);
  const OGUN_IKON = { 'Kahvaltı': 'fa-mug-saucer', 'Ara Öğün': 'fa-apple-whole', 'Öğle Yemeği': 'fa-bowl-food', 'İkindi': 'fa-apple-whole', 'Akşam Yemeği': 'fa-utensils' };
  /* WKA-4-3: 1. gün herkese açık; 2. günden sonrası misafirde kilitli, gövdede davet şeridi. Üyede öğün listesi açılır.
     SH-9-17: öğle ve akşamda "veya" satırı (akdenizAlternatif). */
  const ogunSatir = (g, i) => g.ogunler.map(([o, m]) => { const alt = (akdenizAlternatif[i] || {})[o]; return `<div class="ogun-satir"><span class="ogun-etiket"><span class="rozet dolu ikonlu">${ikon(OGUN_IKON[o])} ${o}</span></span><span class="ogun-icerik"><span data-uyum-ogun="${kac(m)}">${kac(m)}</span>${alt ? `<span class="ogun-veya">veya <span data-uyum-ogun="${kac(alt)}">${kac(alt)}</span></span>` : ''}</span></div>`; }).join('');
  const kilitDavet = `<div class="akordeon-davet oturum-kapali"><div class="bilgi-notu ortali davet-serit">${ikon('fa-lock')}<p><b>Kalan günler için ücretsiz üye ol.</b> Programın 1. günü herkese açık; 2. günden sonrasını üye olunca görür, öğünlerini işaretleyerek takip edersin.</p><button class="dugme birincil kucuk" type="button" data-davet="Kalan günler için ücretsiz üye ol" data-davet-metin="${kac(p.ad)} programının 7 gününü de görmek ve öğünlerini işaretleyerek takip etmek için ücretsiz hesabını oluştur.">${ikon('fa-user-plus')} Ücretsiz üye ol</button></div></div>`;
  const gunler = akdenizGunler.map((g, i) => `<div class="akordeon-kalem${i === 0 ? ' acik' : ''}"><button class="akordeon-bas gun-bas" type="button" aria-expanded="${i === 0}"><span class="akordeon-ikon gun-cip">${g.kisa}</span><span class="gun-ad">${g.gun}${i === 0 ? '<span class="rozet olumlu gun-durum oturum-kapali">Herkese açık</span>' : `<span class="rozet pasif ikonlu gun-durum oturum-kapali">${ikon('fa-lock')} Üyelere açık</span>`}</span><i class="fa-solid fa-chevron-down akordeon-ok" aria-hidden="true"></i></button><div class="akordeon-govde">${i === 0 ? `<div class="ogun-liste hizali">${ogunSatir(g, i)}</div>` : `${kilitDavet}<div class="ogun-liste hizali oturum-acik">${ogunSatir(g, i)}</div>`}</div></div>`).join('');
  /* SH-9-18: menüden türeyen alışveriş listesi, grup grup; misafirde 1. gün, üyede bütün hafta */
  const malzemeler = (gunNo) => {
    const m = new Map();
    akdenizGunler.forEach((g, i) => { if (!gunNo.includes(i)) return; g.ogunler.forEach(([, metin]) => metin.split(' + ').forEach((x) => { const ad = x.replace(/\s+(?:\d[\d\-,½]*|yarım)\s.*$/, ''); (akdenizMalzeme[ad] || []).forEach(([a, gr]) => { const v = m.get(a) || { gr, gun: new Set() }; v.gun.add(i + 1); m.set(a, v); }); })); });
    return MALZEME_GRUP.map(([gr, ad, ik]) => { const l = [...m].filter(([, v]) => v.gr === gr).sort((a, b) => a[0].localeCompare(b[0], 'tr')); return l.length ? `<div class="alisveris-grup"><h3 class="kart-baslik">${ikon(ik)} ${ad}</h3><ul class="isaretli-liste">${l.map(([a, v]) => `<li>${ikon('fa-square-check')}<span>${a}${gunNo.length > 1 ? ` <small>${v.gun.size} gün</small>` : ''}</span></li>`).join('')}</ul></div>` : ''; }).join('');
  };
  const tumGun = akdenizGunler.map((_, i) => i);
  const alisveris = `<div class="kart" id="alisverisListe"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-basket-shopping')} Alışveriş Listesi</h2><p class="oturum-kapali">1. günün ana malzemeleri. Bütün haftanın listesi üyelere açık.</p><p class="oturum-acik">7 günün ana malzemeleri ve kaç günde geçtikleri.</p></div><button class="dugme hayalet kucuk" type="button" data-liste-yazdir>${ikon('fa-print')} Listeyi yazdır</button></div>
<div class="kart-govde"><div class="alisveris-izgara oturum-kapali" data-alisveris="gun1">${malzemeler([0])}</div><div class="alisveris-izgara oturum-acik" data-alisveris="hafta">${malzemeler(tumGun)}</div><p class="alan-yardim"><span>Menüdeki yemeklerin ana malzemeleridir, tarif ölçüsü değildir. Miktarı kişi sayına ve porsiyonuna göre belirle.</span></p></div></div>`;
  /* SH-9-15, ES-PR-7: kimler için uygun, kimler başlamadan önce danışmalı. Veri programlar.json (genel bilgi) */
  const uygunluk = `<div class="iki-kolon esit"><div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-circle-check')} Kimler İçin Uygun?</h2><span class="rozet pasif">Genel bilgi</span></div><div class="kart-govde"><ul class="isaretli-liste">${(p.uygun_olanlar || []).map((x) => `<li>${ikon('fa-check')}<span>${kac(x)}</span></li>`).join('')}</ul></div></div>
<div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-triangle-exclamation')} Başlamadan Önce Danış</h2><span class="rozet pasif">Genel bilgi</span></div><div class="kart-govde"><ul class="isaretli-liste olumsuz">${(p.uygun_olmayanlar || []).map((x) => `<li>${ikon('fa-circle-exclamation')}<span>${kac(x)}</span></li>`).join('')}</ul></div></div></div>`;
  /* SH-9-20: hazırlayan, inceleyen, kaynak, güncelleme. Uzman kaydı yok: "bekliyor" rozeti (K21.8) */
  const bekliyor = '<span class="rozet bekleme">Bekliyor</span>';
  const kunye = `<div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-id-card')} Program Künyesi</h2></div><div class="kart-govde"><dl class="kunye c4"><div><dt>Hazırlayan uzman</dt><dd>${bekliyor}</dd></div><div><dt>İnceleyen uzman</dt><dd>${bekliyor}</dd></div><div><dt>Menü kaynağı</dt><dd>dadadiet.com yayındaki program sayfası</dd></div><div><dt>Son güncelleme</dt><dd>${V.uretim.split('-').reverse().join('.')}</dd></div></dl><p class="alan-yardim"><span>Öğün alternatifleri ve alışveriş listesi prototipte menüden türetildi; uzman onayı bekliyor.</span></p></div></div>`;
  /* EK-4-1, EK-4-2: bağlamsal ekosistem geçişi. Dış bağlantı, yeni sekmede açılır */
  const disKart = (href, i, baslik, metin) => `<a class="kart ikon-kart" href="${href}" target="_blank" rel="external noopener"><span class="ikon-kutu">${ikon(i)}</span><span class="ikon-kart-metin"><span class="kart-baslik">${baslik}</span><span class="kart-metin">${metin}</span></span>${ikon('fa-arrow-up-right-from-square ikon-kart-ok')}</a>`;
  const ekosistem = [
    p.tercih.includes('akdeniz') || p.tercih.includes('ev-yemekleri') ? disKart('https://dadagastro.com', 'fa-utensils', 'Dada Gastro’da Tarif Bul', 'Zeytinyağlılar, balık ve baklagil yemekleri için tarifleri Dada Mentor’un mutfak platformunda ara.') : '',
    disKart('https://dadafit.com.tr', 'fa-dumbbell', p.hedef.some((h) => h === 'protein' || h === 'kas') ? 'Dada Fit ile Antrenmanını Planla' : 'Dada Fit ile Hareketi Ekle', p.hedef.some((h) => h === 'protein' || h === 'kas') ? 'Protein odaklı beslenmeyi antrenman planıyla birlikte yürüt.' : 'Beslenme düzenini haftalık hareketle destekle; egzersiz içerikleri Dada Fit’te.'),
  ].filter(Boolean).join('');
  /* SH-9-19, SH-9-21, ES-PR-8, ES-PR-11: misafir "Programa başla"da önce hızlı kayda gelir, kayıttan sonra programa döner */
  const programEylem = `<a class="dugme birincil" href="${K}hesabim/program-baslat/?program=${p.slug}" data-davet="Programa başla" data-davet-metin="${kac(p.ad)} programını başlatmak, öğünlerini günlük takibine almak ve 7 günün hepsini görmek için ücretsiz hesabını oluştur. Kayıttan sonra programın açılır." data-davet-sonra="hesabim/program-baslat/?program=${p.slug}">${ikon('fa-play')} Programa başla</a><button class="dugme hayalet" type="button" data-kaydet="programlar" data-slug="${p.slug}" data-ad="${kac(p.ad)}" data-etiket="Programı kaydet" data-etiket-tamam="Kaydedildi">${ikon('fa-bookmark')} Programı kaydet</button>${dugme('Diyetisyene danış', 'diyetisyen-bul-sihirbazi/', 'hayalet', 'fa-user-doctor')}`;
  const detay = `${bant({ yol: [['Programlar', 'programlar/'], [p.ad]], etiket: p.kategori, etiketIkon: programIkon(p), h1: p.ad, gorsel: 'hero/mega-photo-1540420773420-3366772f4999.jpg', alt: `<span data-uyum-cumle data-tercih="${p.tercih.join(' ')}" data-hedef="${p.hedef.join(' ')}" data-sure="${p.sure_gun}">${kac(p.aciklama)}</span>`, eylem: `<span class="rozet olumlu ikonlu">${ikon('fa-fire')} ${p.enerji}</span><span class="rozet olumlu ikonlu">${ikon('fa-calendar')} ${p.sure}</span>${rk('KT-HERO')}`, sayilar: [[p.ogun_sayisi, 'Öğün'], [p.zorluk, 'Zorluk']] })}
<div class="bolum-dizi">
${bolum(`${ustSerit('SD-B1')}<div class="sayac-serit ust-bosluksuz"><div class="sayac">${ikon('fa-fire')}<div><span>Günlük enerji</span><b>${p.enerji}</b></div></div><div class="sayac">${ikon('fa-calendar')}<div><span>Süre</span><b>${p.sure}</b></div></div><div class="sayac">${ikon('fa-utensils')}<div><span>Öğün planı</span><b>${p.ogun_sayisi} öğün</b></div></div><div class="sayac">${ikon('fa-signal')}<div><span>Zorluk</span><b>${p.zorluk}</b></div></div></div>
<div class="bolum-eylem">${programEylem}</div>`, { ilk: true })}
${bolum(`${bolumBas({ etiket: 'Uygunluk', ikon: 'fa-user-check', baslik: 'Bu Program Kimler İçin?', metin: 'Genel bilgi; kişisel durumun için bir diyetisyene ve hekimine danış.' })}${uygunluk}`)}
${bolum(`${bolumBas({ etiket: 'Örnek akış', ikon: 'fa-calendar-week', baslik: '7 Günlük Öğün Dökümü', metin: 'Gün gün kahvaltı, ara öğün, öğle, ikindi ve akşam yemeği için genel öneriler. Öğle ve akşamda bir alternatif var. Örnek niteliğindedir, uyarlanabilir.' })}<div data-uyum-bilgi="ogun"></div><div class="akordeon">${gunler}</div>`)}
${bolum(`${bolumBas({ etiket: 'Alışveriş', ikon: 'fa-basket-shopping', baslik: 'Programın Alışveriş Listesi', metin: 'Menüdeki yemeklerin ana malzemeleri, reyon reyon.' })}${alisveris}`)}
${bolum(`${bolumBas({ etiket: 'Dada Mentor ekosistemi', ikon: 'fa-compass', baslik: 'Programını Tamamlayan Adımlar' })}<div class="kart-izgara c2">${ekosistem}</div>`)}
${bolum(kunye)}
${bolum(`${bolumBas({ etiket: 'Benzer programlar', ikon: 'fa-list-check', baslik: 'Akdeniz Tipi Başka Menüler', arac: dugme('Tümünü gör', 'programlar/beslenme-tercihine-gore/?tercih=akdeniz', 'hayalet orta', 'fa-arrow-right', true) })}<div class="kart-izgara c3" data-uyum-yedekli="3">${benzer.map((x, i) => programKart(x, { gizli: i >= 3 })).join('')}</div>${rk('KT-M1', { tur: 'sonuc', hedef: '[data-uyum-yedekli]', sira: 1 })}`)}
${rk('KL-PROGRAM', { tur: 'sar' })}
${bolum(`${genelNot}<div class="bolum-eylem sayfa-sonu">${dugme('Programlara dön', 'programlar/', 'hayalet', 'fa-arrow-left')}</div>`)}
${sonSerit('SD-B1-END')}
</div>`;

  const slim = P.map((x) => ({ slug: x.slug, ad: x.ad, aciklama: x.aciklama, kategori: x.kategori, sure: x.sure, sure_gun: x.sure_gun, enerji: x.enerji, zorluk: x.zorluk, ogun_sayisi: x.ogun_sayisi, hedef: x.hedef, yasam: x.yasam, tercih: x.tercih, ihtiyac: x.ihtiyac, gorsel: x.gorsel_dosya }));
  const sonucHtml = (ek = '') => `<section class="sihirbaz-adim" data-sonuc hidden><div class="bolum-bas"><div><h2 tabindex="-1" id="sonucBaslik"></h2><p class="giris-metni">Seçimlerinle eşleşme nedenleri her kartın içinde yazılı.</p></div></div>${ek}<div data-uyum-bilgi="liste"></div><div class="kart-izgara c3" id="sonucKartlar"></div><div class="bolum-eylem"><a class="dugme hayalet" href="${K}programlar/">Tüm programları gör</a><button class="dugme birincil" type="button" data-bastan>${ikon('fa-rotate-left')} Baştan başla</button></div></section>`;
  const NOT = 'Bu sihirbaz bir <b>yönlendirmedir</b>; <b>sağlık teşhisi koymaz, kişiye özel tıbbi ya da beslenme önerisi üretmez.</b> Programlar genel örnek menülerdir. Gebelik, kronik hastalık, düzenli ilaç kullanımı, besin alerjisi veya klinik bir durum varsa plana başlamadan önce bir diyetisyene ve hekimine danış.';
  const veriGom = jsonGom('sihirbazVeri', { programlar: slim, detay: DETAY.program });
  const bul = `${bant({ yol: [['Programlar', 'programlar/'], ['Program Bul']], etiket: 'Program eşleştirme', etiketIkon: 'fa-wand-magic-sparkles', h1: 'Sana uygun programı <span class="vurgu">birlikte seçelim</span>', gorsel: 'hero/programlar-dl-top.jpg', alt: 'Hedefini, süreni, beslenme tercihini ve günlük düzenini al; yayındaki programlar içinden en uygun üçünü nedenleriyle gösterelim.', alttaki: guven([['fa-list-check', `${s.program} program yayında`], ['fa-utensils', `${sayi(s.ornek_ogun)} örnek öğün`], ['fa-stopwatch', '1 dakikadan kısa'], ['fa-shield-halved', 'Tıbbi teşhis üretmez']]) })}
<div class="bolum-dizi">${sihirbazBolum({ id: 'program', not: NOT, ek: veriGom,
    adimlar: [['Hedef', 'Ne için?'], ['Süre', 'Kaç gün?'], ['Tercih', 'Beslenme türü'], ['Düzen', 'Öğün ve hazırlık'], ['Özel Durum', 'Alerji, sağlık']],
    sonuc: sonucHtml(`<div class="uyari-kutu" id="sonucUyari" role="note" hidden>${ikon('fa-triangle-exclamation')}<span></span></div>`),
    govde: `${adim({ id: 'hedef', baslik: 'Programdan Ne Bekliyorsun?', alt: 'Eşleştirmenin en belirleyici adımı bu.', alanlar: [{ ad: 'hedef', secenekler: [
      { deger: 'dengeli', baslik: 'Dengeli beslenme', alt: 'Sürdürülebilir bir düzen kur', ikon: 'fa-scale-balanced' }, { deger: 'kilo', baslik: 'Kilo kontrolü', alt: 'Kalori dengesini yönet', ikon: 'fa-weight-scale' },
      { deger: 'sporcu', baslik: 'Sporcu beslenmesi', alt: 'Protein ve toparlanma odaklı', ikon: 'fa-dumbbell' }, { deger: 'bitkisel', baslik: 'Bitkisel beslenme', alt: 'Vejetaryen veya vegan düzen', ikon: 'fa-seedling' }] }] })}
${adim({ id: 'sure', baslik: 'Ne Kadar Sürelik Bir Plan İstiyorsun?', alt: 'Programların gerçek sürelerinden seç.', alanlar: [{ ad: 'sure', secenekler: [
      { deger: '3', baslik: '3 gün', alt: 'Kısa deneme', ikon: 'fa-calendar-day' }, { deger: '7', baslik: '7 gün', alt: 'Bir haftalık düzen', ikon: 'fa-calendar-week' }, { deger: '14', baslik: '14 gün', alt: 'İki hafta', ikon: 'fa-calendar' }, { deger: '28', baslik: '28 gün', alt: 'Dört hafta', ikon: 'fa-calendar-check' }] }] })}
${adim({ id: 'tercih', baslik: 'Beslenme Tercihin Nedir?', alt: 'Uyumsuz programları listeden çıkaralım.', alanlar: [{ ad: 'tercih', secenekler: [
      { deger: 'standart', baslik: 'Standart', alt: 'Kısıt yok', ikon: 'fa-utensils' }, { deger: 'vejetaryen', baslik: 'Vejetaryen', alt: 'Et yok', ikon: 'fa-carrot' }, { deger: 'vegan', baslik: 'Vegan', alt: 'Tamamen bitkisel', ikon: 'fa-seedling' }, { deger: 'glutensiz', baslik: 'Glütensiz', alt: 'Gluten içermez', ikon: 'fa-wheat-awn-circle-exclamation' }] }] })}
${adim({ id: 'duzen', baslik: 'Günlük Düzenin Nasıl?', alt: 'Öğün sayısı ve hazırlama süresi beklentin.', alanlar: [
      { ad: 'ogun', etiket: 'Öğün Sayısı', sinif: 'c3', secenekler: [{ deger: '3', baslik: '3 öğün', alt: 'Ara öğün yok' }, { deger: '4', baslik: '3 + 1 ara', alt: 'Tek ara öğün' }, { deger: '5', baslik: '5 öğün', alt: 'Sık ve küçük' }] },
      { ad: 'hazirlik', etiket: 'Hazırlama Süresi', sinif: 'c3', secenekler: [{ deger: 'hizli', baslik: "15 dk'dan az", alt: 'Hızlı olsun' }, { deger: 'orta', baslik: '15–30 dk', alt: 'Dengeli' }, { deger: 'uzun', baslik: '30 dk üzeri', alt: 'Vaktim var' }] }] })}
${adim({ id: 'ozel', baslik: 'Alerji ya da Özel Bir Sağlık Durumun Var mı?', alt: 'Varsa program önerisini uzman desteğiyle birlikte veriyoruz.', alanlar: [{ ad: 'ozel', sinif: 'c3', secenekler: [
      { deger: 'yok', baslik: 'Yok', alt: 'Bildiğim bir durum yok', ikon: 'fa-circle-check' }, { deger: 'alerji', baslik: 'Besin alerjim var', alt: 'Alerji veya intolerans', ikon: 'fa-triangle-exclamation' }, { deger: 'saglik', baslik: 'Sağlık durumum var', alt: 'Gebelik, kronik hastalık, ilaç', ikon: 'fa-notes-medical' }] }] })}` })}
${rk('NP-B1', { tur: 'bant', kap: false, hedef: '#sihirbaz', yon: 'once' })}${rk('NP-B1-SIDE', { tur: 'yan', hedef: '#sihirbaz', yon: 'sonra' })}
${sonSerit('NP-B1-END')}
</div>`;

  /* Süreye Göre: canlıdaki dört adımlı sihirbaz üstte, süre sekmeli liste altta */
  const sx = KIRILIM.find((x) => x.yol === 'sureye-gore');
  const sure = `${bant({ yol: [['Programlar', 'programlar/'], [sx.ad]], etiket: sx.ad, etiketIkon: sx.ikon, h1: sx.h1, gorsel: sx.gorsel, alt: 'Kaç günlük bir plan istediğini, günde mutfağa ne kadar vakit ayırabildiğini ve hazırlığı nasıl yapmak istediğini al; sana en uygun üç programı nedenleriyle gösterelim.', alttaki: guven([['fa-list-check', `${s.program} program yayında`], ['fa-utensils', `${sayi(s.ornek_ogun)} örnek öğün`], ['fa-stopwatch', '4 adım, 1 dakikadan kısa'], ['fa-shield-halved', 'Tıbbi teşhis üretmez']]) })}
<div class="bolum-dizi">${sihirbazBolum({ id: 'sure', not: NOT, ek: veriGom, adimlar: [['Süre', 'Kaç gün?'], ['Günlük Vakit', 'Mutfakta kaç dk?'], ['Hazırlık', 'Toplu mu, günlük mü?'], ['Tempo', 'Ne kadar sıkı?']], sonuc: sonucHtml(),
    govde: `${adim({ id: 'sure', baslik: 'Kaç Günlük Bir Plan İstiyorsun?', alt: 'Bu sihirbazın çıkış noktası: ne kadar süre için plan yapıyorsun?', alanlar: [{ ad: 'sure', secenekler: [{ deger: '3', baslik: '3 günlük', alt: 'Kısa bir başlangıç denemesi', ikon: 'fa-calendar-day' }, { deger: '7', baslik: '7 günlük', alt: 'Bir haftalık tam döngü', ikon: 'fa-calendar-week' }, { deger: '14', baslik: '14 günlük', alt: 'İki hafta, alışkanlık kurma', ikon: 'fa-calendar' }, { deger: '28', baslik: '28 gün ve üzeri', alt: 'Uzun soluklu bir düzen', ikon: 'fa-calendar-check' }] }] })}
${adim({ id: 'vakit', baslik: 'Günde Mutfağa Ne Kadar Vakit Ayırabiliyorsun?', alt: 'Sürdürebileceğin süre, ideal süreden daha değerli.', alanlar: [{ ad: 'vakit', sinif: 'c3', secenekler: [{ deger: 'az', baslik: '15 dakikadan az', alt: 'Hızlı ve az adımlı öğünler', ikon: 'fa-bolt' }, { deger: 'orta', baslik: '15–30 dakika', alt: 'Ortalama bir mutfak temposu', ikon: 'fa-clock' }, { deger: 'cok', baslik: '30 dakikadan fazla', alt: 'Pişirmeye vaktim var', ikon: 'fa-kitchen-set' }] }] })}
${adim({ id: 'hazirlik', baslik: 'Hazırlığı Nasıl Yapmak İstersin?', alt: 'Haftayı tek seferde mi kuruyorsun, gün gün mü ilerliyorsun?', alanlar: [{ ad: 'hazirlik', sinif: 'c3', secenekler: [{ deger: 'toplu', baslik: 'Toplu hazırlık', alt: 'Bir günde hazırlayıp haftaya yayarım', ikon: 'fa-boxes-stacked' }, { deger: 'karma', baslik: 'Karma', alt: 'Bir kısmı önceden, bir kısmı günlük', ikon: 'fa-shuffle' }, { deger: 'gunluk', baslik: 'Günlük taze', alt: 'Her öğünü o gün hazırlarım', ikon: 'fa-seedling' }] }] })}
${adim({ id: 'tempo', baslik: 'Programı Ne Kadar Sıkı Sürdürmek İstiyorsun?', alt: 'Zorluk beklentin, önerilen programın seviyesini belirliyor.', alanlar: [{ ad: 'tempo', sinif: 'c3', secenekler: [{ deger: 'rahat', baslik: 'Rahat', alt: 'Esnek, kolay uygulanır', ikon: 'fa-leaf' }, { deger: 'dengeli', baslik: 'Dengeli', alt: 'Yeni başlayana uygun tempo', ikon: 'fa-scale-balanced' }, { deger: 'siki', baslik: 'Sıkı', alt: 'Kurallara bağlı kalabilirim', ikon: 'fa-bullseye' }] }] })}` })}
${bolum(`${bolumBas({ etiket: 'Süreye göre liste', ikon: 'fa-calendar', baslik: 'Tüm Süreler', metin: 'Sihirbaza girmeden süreye göre göz at.' })}${liste({ P, alan: sx.alan, kume: sx.kume, etiket: sx.ad })}`, { id: 'programListe' })}
${altPanel(sx)}
</div>`;

  return [
    { yol: 'programlar', meta: { baslik: 'Programlar', duzen: 'public', aktif: 'Programlar', hero: true, js: programJs('liste') }, govde: ana },
    ...KIRILIM.filter((x) => x !== sx).map(kirilimSayfa),
    { yol: 'programlar/sureye-gore', meta: { baslik: 'Programlar: Süreye Göre', duzen: 'public', aktif: 'Programlar', hero: true, js: [...programJs('liste', 'sihirbaz'), MISAFIR_JS] }, govde: sure },
    { yol: 'program/akdeniz-tipi-beslenme', meta: { baslik: p.ad, duzen: 'public', aktif: 'Programlar', hero: true, js: [...programJs('program'), MISAFIR_JS] }, govde: detay },
    { yol: 'programlar/program-bul', meta: { baslik: 'Program Bul', duzen: 'public', aktif: 'Programlar', hero: true, js: [...programJs('sihirbaz'), MISAFIR_JS] }, govde: bul },
  ];
};
