// Diyetisyenler landing + profiller: listedeki her uzman için bir sayfa (örnek profil verisi _src/veri/diyetisyen-ornek.json)
// ve panel demosu Ece Tunalı (alanları demo durumundan okunur). Örnek içerik [data-ornek], aynı yerin boş durumu [data-bos] basılır (?bos=1).
import { K, sayfaJs, bant, bantSayilar, bolum, bolumBas, dugme, ikon, uzmanKart, gorusme, kirinti, kac, jsonGom } from '../../parcalar/public-araclar/ortak.mjs';
import { bicim } from '../../parcalar/bicim.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';
const ustSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', kap: false })).join('');
const sonSerit = (...k) => k.map((x) => rk(x, { tur: 'bant', konum: 'alt' })).join('');

/* İki hâlli değer: örnek kipte ilki, ?bos=1'de ikincisi görünür */
const iki = (ornek, bos) => `<span data-ornek>${ornek}</span><span data-bos>${bos}</span>`;
const ornekEtiket = '<span class="ornek-etiket" data-ornek>prototip örneği</span>';
const dogrulandiHap = `<span class="durum-hapi cozulen ikonlu" data-ornek>${ikon('fa-circle-check')} Doğrulanmış uzman</span>`;

/* Bant, durum şeridi ve gövde tek .zebra içinde durur: #pageMain'in ikinci çocuğu kabukta bant üstüne biner (-22px, köşe, gölge), profil bandında bu istenmez. */
const profilUst = (d, { eylem, sayaclar, giris, rozet = '' }) => `<section class="bolum kabuk-alti kimlik-bant"><div class="kap">
${kirinti(['Diyetisyenler', 'diyetisyenler/'], [kac(d.ad)])}
<div class="kapak" id="profilKapak" data-arkaplan="${K}assets/img/diyetisyen/profil-banner.jpg"><span class="kapak-muhur">${ikon('fa-user-doctor')} Diyetisyen profili</span></div>
<div class="kimlik"><span class="kimlik-avatar harf" id="profilAvatar" aria-hidden="true">${d.harf}</span><div class="kimlik-govde"><h1>${kac(d.ad)}${rozet}</h1><span class="kimlik-kullanici">${d.unvan} · <span data-alan="uzmanlik1">${kac(d.uzmanlik[0])}</span></span>${giris ? `<p class="kimlik-giris">${giris}</p>` : ''}<div class="kimlik-meta"><span>${ikon('fa-location-dot')}<span><span data-alan="sehir">${d.sehir}</span> · <span data-alan="gorusme">${gorusme(d)}</span></span></span><span>${ikon('fa-briefcase')}<span><span data-alan="deneyim">${d.deneyim_yil} yıl</span> deneyim</span></span></div></div><div class="kimlik-eylem" id="profilEylem">${eylem}</div></div>
<div class="sayac-serit dort-kolon">${sayaclar.map(([i, e, v, alan]) => `<div class="sayac">${ikon(i)}<div><span>${e}</span>${typeof v === 'object' ? `<b data-ornek>${v.ornek}</b><b data-bos>${v.bos}</b>` : `<b${alan ? ` data-alan="${alan}"` : ''}>${v}</b>`}</div></div>`).join('')}</div>
</div></section>`;

/* Sekme sayısı: sayı, JS'in dolduracağı id (metin) ya da { html } */
const sekmeSayi = (n) => (n == null ? '' : typeof n === 'string' ? ` <span class="sekme-sayi" id="${n}"></span>` : typeof n === 'object' ? ` <span class="sekme-sayi">${n.html}</span>` : ` <span class="sekme-sayi">${n}</span>`);
const sekmeRay = (l) => `<div class="sekme-ray"><div class="kap"><div class="sekmeler ortali" role="tablist" aria-label="Profil bölümleri">${l.map(([id, a, i, n], k) => `<button class="sekme${k === 0 ? ' aktif' : ''}" type="button" role="tab" id="t-${id}" aria-controls="p-${id}" aria-selected="${k === 0}"${k ? ' tabindex="-1"' : ''}>${ikon(i)} ${a}${sekmeSayi(n)}</button>`).join('')}</div></div></div>`;
const pano = (id, ilk, icerik) => `<div class="fit-pane" id="p-${id}" role="tabpanel" aria-labelledby="t-${id}" tabindex="-1"${ilk ? '' : ' hidden'}><div class="wrap kap yigin">${icerik}</div></div>`;
/* Canlı süzgeç: kapanır gruplar, yuvarlak onay kutusu, ilk altı alandan sonrası "Tüm alanları göster" ile açılır. */
const UZMANLIKLAR = ['Kilo Yönetimi', 'Sporcu Beslenmesi', 'Çocuk & Ergen Beslenmesi', 'Gebelik & Emzirme', 'Klinik / Hastalık Beslenmesi', 'Bağırsak Sağlığı', 'Hormonal Denge & PCOS', 'Vejetaryen & Vegan', 'İnsülin Direnci & Diyabet', 'Yeme Davranışı', 'Geriatri Beslenmesi', 'Onkoloji Beslenmesi'];
const SIRALAMA = [['onerilen', 'Önerilen', 'fa-wand-magic-sparkles'], ['puan', 'En Yüksek Puan', 'fa-star'], ['degerlendirme', 'En Çok Değerlendirme', 'fa-comment-dots'], ['fiyat', 'En Uygun Fiyat', 'fa-tag'], ['deneyim', 'En Deneyimli', 'fa-briefcase'], ['uygunluk', 'En Yakın Uygunluk', 'fa-calendar-check']];
/* Fiyat bandı: en düşük seans ücretine göre (₺) */
const FIYAT_BANT = [['ekonomik', 'Ekonomik', '₺750 altı', (n) => n < 750], ['orta', 'Orta', '₺750–999', (n) => n >= 750 && n < 1000], ['ust', 'Üst segment', '₺1.000 ve üstü', (n) => n >= 1000]];
const fiyatBant = (n) => (n == null ? '' : FIYAT_BANT.find((b) => b[3](n))[0]);
const DILLER = ['Türkçe', 'İngilizce', 'Almanca', 'Arapça'];
const suzmeSatir = (alan, v, a, sinif = '', onIkon = '') => `<label class="suzme-satir${sinif ? ' ' + sinif : ''}"><input type="checkbox" data-suz="${alan}" value="${kac(v)}" data-ad="${kac(a)}"><span class="suzme-onay"></span>${onIkon}<span class="suzme-ad">${kac(a)}</span></label>`;
const suzmeGrup = (ad, govde, sinif = '') => `<div class="suzme-grup acik${sinif ? ' ' + sinif : ''}"><button class="suzme-grup-bas" type="button" aria-expanded="true">${ad} <span class="suzme-rozet">0</span>${ikon('fa-chevron-down suzme-ok')}</button><div class="suzme-grup-govde">${govde}</div></div>`;
/* Veri olmayan süzgeç: canlıdaki cinsiyet kalıbı, pasif kutu + neden notu */
const pasifSatirlar = (l, not) => `${l.map((a) => `<label class="suzme-satir"><input type="checkbox" disabled><span class="suzme-onay"></span><span class="suzme-ad">${a}</span></label>`).join('')}<small class="suzme-not">${not}</small>`;
const suzmeSutun = (sehirler, diller, adet) => `<aside class="suzme-sutun" id="suzmeSutun" aria-label="Filtreler"><div class="suzme-kapak-bas"><h2>${ikon('fa-sliders')} Filtrele</h2><div class="suzme-kapak-sag"><button class="suzme-temizle" type="button" data-temizle>Temizle</button><button class="suzme-kapat" id="suzmeKapat" type="button" aria-label="Filtre panelini kapat">${ikon('fa-xmark')}</button></div></div>
<div class="suzme-kapak-govde"><div class="suzme-bas"><h2>${ikon('fa-sliders')} Filtreler</h2><button class="suzme-temizle" type="button" data-temizle>Tümünü Temizle</button></div>
${suzmeGrup('Uzmanlık Alanı', `${UZMANLIKLAR.map((u, i) => suzmeSatir('uzmanlik', u, u, i > 5 ? 'ek' : '')).join('')}<button class="suzme-daha" type="button" aria-expanded="false">${ikon('fa-chevron-down')} <span>Tüm alanları göster</span></button>`)}
${suzmeGrup('Görüşme Türü', suzmeSatir('gorusme', 'online', 'Online') + suzmeSatir('gorusme', 'yuz', 'Yüz Yüze'))}
${suzmeGrup('Şehir', sehirler.map((c) => suzmeSatir('sehir', c, c)).join(''))}
${suzmeGrup('Cinsiyet', pasifSatirlar(['Kadın', 'Erkek'], 'Doğrulanmış profil verisi eklendiğinde kullanılabilir.'), 'pasif')}
${suzmeGrup('Dil', DILLER.filter((x) => diller.includes(x)).map((x) => suzmeSatir('dil', x, x)).join(''))}
${suzmeGrup('Fiyat Aralığı', `${FIYAT_BANT.map(([v, a]) => suzmeSatir('fiyat', v, a)).join('')}<small class="suzme-not">En düşük seans ücretine göre: ${FIYAT_BANT.map(([, a, alt]) => `${a} ${alt}`).join(', ')}.</small>`)}
${suzmeGrup('Doğrulama', suzmeSatir('dogrulama', '1', 'Doğrulanmış Uzman', '', ikon('fa-circle-check dogrulama-ikon')))}
</div><div class="suzme-kapak-ayak"><button class="dugme birincil" id="suzmeUygula" type="button">${adet} uzmanı göster</button></div></aside><div class="suzme-ortu" id="suzmeOrtu"></div>`;
const siraKutu = `<div class="sira-kutu" id="siraKutu"><button class="sira-dugme" id="siraDugme" type="button" aria-haspopup="true" aria-expanded="false">${ikon('fa-arrow-down-wide-short')}<span class="sira-etiket">Sıralama:</span> <span id="siraSimdi">Önerilen</span> ${ikon('fa-chevron-down sira-ok')}</button><div class="sira-menu" role="menu">${SIRALAMA.map(([v, a, i], k) => `<button class="${k ? '' : 'aktif'}" type="button" role="menuitem" data-sira="${v}">${ikon(i)} ${a}</button>`).join('')}</div></div>`;
const satir = (i, b, m, sag = '') => `<div class="ayar-satir"><span class="as-ikon" aria-hidden="true">${ikon(i)}</span><div class="as-metin"><b>${b}</b><span>${m}</span></div>${sag}</div>`;
const ilkBuyuk = (s) => String(s).charAt(0).toLocaleUpperCase('tr') + String(s).slice(1);
const TUR_AD = { online: 'Online', 'yüz yüze': 'Yüz yüze', karma: 'Karma' };

/* ── Boş durumlar (?bos=1): canlıdaki boş profil, olduğu gibi korunur ── */
/* Danışan yorumları: yalnız görüşmesi tamamlanmış danışandan, onaydan sonra (K23.3) */
const yorumBas = bolumBas({ etiket: 'Danışan yorumları', ikon: 'fa-comment-dots', baslik: 'Danışanlar Ne Diyor?', metin: 'Yorumlar yalnız görüşmesi tamamlanmış danışanlardan alınır ve yayından önce incelenir.', arac: ornekEtiket });
const yorumBos = (ad, ek = ' data-bos') => `<div class="kart"${ek}><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-comment-dots')}</span><h3>Henüz onaylı danışan yorumu yok</h3><p>${kac(ad)} ile görüşmesi tamamlanan danışanların yorumları onaylandıkça burada listelenir.</p>${dugme('Yorum kuralları', 'yasal/kullanim-kosullari/', 'hayalet')}</div></div>`;
const icerikBas = bolumBas({ etiket: 'Uzman içerikleri', ikon: 'fa-newspaper', baslik: 'Uzmanın Yazıları ve Örnek Menüleri', metin: 'Uzmanın yayınladığı rehber yazıları ve örnek menüler burada toplanır. Karta dokununca tamamı açılır.', arac: ornekEtiket });
const icerikBos = (ad) => `<div class="kart" data-bos><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-newspaper')}</span><h3>Henüz yayınlanmış içerik yok</h3><p>${kac(ad)} bir yazı ya da örnek menü yayınladığında burada görünür. O zamana kadar genel rehberlere göz atabilirsin.</p>${dugme('Beslenme Rehberi', 'besin-rehberi/', 'hayalet', 'fa-arrow-right', true)}</div></div>`;
const bekliyor = '<span class="rozet bekleme">bekliyor</span>';
/* Kaydet: misafirde tarayıcıda tutulur ve kayıt daveti açılır, üyede kaydedilenlere yazılır (assets/js/misafir.js) */
const kaydetDugme = (d) => `<button class="dugme hayalet" type="button" data-kaydet="diyetisyenler" data-slug="${d.slug}" data-ad="${kac(d.ad)}" data-etiket="Kaydet" data-etiket-tamam="Kaydedildi" aria-pressed="false">${ikon('fa-bookmark')} Kaydet</button>`;

/* ── Örnek içerik parçaları ── */
const yildiz = (p) => `<span class="yildizlar" role="img" aria-label="5 üzerinden ${p} puan">${[1, 2, 3, 4, 5].map((i) => `<i class="fa-solid fa-star${i > p ? ' bos' : ''}" aria-hidden="true"></i>`).join('')}</span>`;
const yorumKart = (y) => `<article class="kart yorum-kart"><div class="kart-bas"><div><h3 class="kart-baslik">${kac(y.danisan_etiket)}</h3><p>${kac(y.konu)} · ${TUR_AD[y.tur] || kac(y.tur)} görüşme · ${y.sure_hafta} hafta</p></div>${yildiz(y.puan)}</div><div class="kart-govde"><p class="kart-metin">${kac(y.metin)}</p><p class="kart-metin">${ikon('fa-calendar')} ${bicim.tarih(y.tarih)}</p></div></article>`;
const ortalama = (l) => (l.length ? l.reduce((t, y) => t + y.puan, 0) / l.length : null);
const yorumOzet = (l) => { const o = ortalama(l); return `<div class="kart"><div class="kart-govde skor-yerlesim"><div class="skor-kisa"><b>${bicim.sayi(o, 1, 1)}</b><span>/ 5</span></div><div>${yildiz(Math.round(o))}<p class="kart-metin">${l.length} onaylı yorum · yalnız görüşmesi tamamlanmış danışanlardan</p></div></div></div>`; };

const paketKart = (p, href, ek = '') => `<div class="kart"><div class="kart-bas"><h3 class="kart-baslik">${ikon('fa-box-open')} ${kac(p.ad)}</h3><span class="rozet pasif">${kac(ilkBuyuk(p.tur))}</span></div><div class="kart-govde"><p class="sonuc-sayi kucuk">${bicim.para(p.fiyat)}</p><p class="kart-metin">${kac(p.aciklama)}</p><ul class="uzman-meta"><li>${ikon('fa-comments')} ${p.seans} seans</li><li>${ikon('fa-clock')} ${p.sure} dk görüşme</li><li>${ikon('fa-calendar')} ${p.sure_hafta} hafta</li></ul></div><div class="kart-alt"><a class="dugme birincil tam-en" href="${href}"${ek}>Paketi seç</a></div></div>`;

/* Menü değerleri besin kütüphanesinden (100 g başına) hesaplanır; uydurma değer yazılmaz */
const MAKRO = [['kcal', 'Enerji', 'kcal', 'fa-fire'], ['protein', 'Protein', 'g', 'fa-drumstick-bite'], ['karb', 'Karbonhidrat', 'g', 'fa-wheat-awn'], ['yag', 'Yağ', 'g', 'fa-droplet']];
const OGUN_IKON = { 'Kahvaltı': 'fa-mug-hot', 'Ara Öğün': 'fa-apple-whole', 'Öğle Yemeği': 'fa-bowl-food', 'İkindi': 'fa-cookie-bite', 'Akşam Yemeği': 'fa-utensils', 'Gece': 'fa-moon' };
const menuHesap = (m, B) => {
  const top = { kcal: 0, protein: 0, karb: 0, yag: 0 };
  const ogunler = m.ogunler.map((o) => {
    const ot = { kcal: 0, protein: 0, karb: 0, yag: 0 };
    const kalemler = o.kalemler.map(([slug, g, olcu]) => {
      const b = B[slug];
      if (!b || b.kcal == null) throw new Error(`diyetisyen-ornek: menü ${m.id} besin yok ya da değersiz: ${slug}`);
      const v = Object.fromEntries(MAKRO.map(([k]) => [k, (b[k] * g) / 100]));
      MAKRO.forEach(([k]) => { ot[k] += v[k]; top[k] += v[k]; });
      return { ad: b.ad, g, olcu, v };
    });
    return { ad: o.ad, kalemler, t: ot };
  });
  return { ogunler, top };
};
const deger = (k, v) => (k === 'kcal' ? bicim.sayi(Math.round(v)) : bicim.sayi(v, 1));
const menuTablo = (h) => `<div class="tablo-kap"><table class="tablo sabit-ilk"><thead><tr><th scope="col">Besin</th><th scope="col">Miktar</th>${MAKRO.map(([, a, b]) => `<th class="sag" scope="col">${a === 'Karbonhidrat' ? 'Karb.' : a} (${b})</th>`).join('')}</tr></thead><tbody>${h.ogunler.map((o) => `<tr class="tablo-grup"><th colspan="6" scope="colgroup"><span>${ikon(OGUN_IKON[o.ad] || 'fa-utensils')} ${kac(o.ad)} · ${deger('kcal', o.t.kcal)} kcal</span></th></tr>${o.kalemler.map((x) => `<tr><th scope="row">${kac(x.ad)}</th><td>${kac(x.olcu)} <small>${x.g} g</small></td>${MAKRO.map(([k]) => `<td class="sag">${deger(k, x.v[k])}</td>`).join('')}</tr>`).join('')}`).join('')}</tbody><tfoot><tr><th scope="row">Günlük toplam</th><td></td>${MAKRO.map(([k]) => `<td class="sag"><b>${deger(k, h.top[k])}</b></td>`).join('')}</tr></tfoot></table></div>`;
const menuOzet = (h) => { const e = h.top.protein * 4 + h.top.karb * 4 + h.top.yag * 9; return `<div class="sayac-serit kucuk">${MAKRO.map(([k, a, b, i]) => `<div class="sayac">${ikon(i)}<div><span>${a}${k === 'kcal' ? '' : ` · %${Math.round(((k === 'yag' ? 9 : 4) * h.top[k] * 100) / e)}`}</span><b>${deger(k, h.top[k])} ${b}</b></div></div>`).join('')}</div>`; };

const modal = (id, baslik, govde, uzman) => `<div class="modal-ortu" id="${id}" hidden><div class="modal-kutu genis" role="dialog" aria-modal="true" aria-labelledby="${id}-b"><div class="modal-bas"><h2 id="${id}-b">${kac(baslik)}</h2><button class="kapat-dugme" type="button" data-kapat aria-label="Kapat">${ikon('fa-xmark')}</button></div><div class="modal-govde"><div class="yigin">${govde}</div></div><div class="modal-ayak-cubuk"><button class="dugme hayalet" type="button" data-kapat>Kapat</button><button class="dugme birincil" type="button" data-kapat data-sekme-git="t-randevu">${ikon('fa-calendar-check')} Randevu al</button></div></div></div>`;
const icerikKart = (id, i, baslik, metin) => `<a class="kart ikon-kart" href="#${id}" data-ac="#${id}"><span class="ikon-kutu">${ikon(i)}</span><span class="ikon-kart-metin"><span class="kart-baslik">${kac(baslik)}</span><span class="kart-metin">${metin}</span></span>${ikon('fa-arrow-right ikon-kart-ok')}</a>`;
/* İçerikler: 3 yazı + 2 örnek menü; tam metin ve menü dökümü modalda */
const icerikler = (u, o, B) => {
  const yazilar = o.yazilar.map((w) => ({ id: `icerik-${w.id}`, w }));
  const menuler = o.menuler.map((m) => ({ id: `icerik-${m.id}`, m, h: menuHesap(m, B) }));
  const ust = (tarih, ek) => `<p class="kart-metin">${kac(u.ad)} · ${bicim.tarih(tarih)} · ${ek} <span class="ornek-etiket satir-ici">prototip örneği</span></p>`;
  const kartlar = `<div data-ornek class="yigin"><h3 class="kart-baslik">${ikon('fa-newspaper')} Yazılar</h3><div class="kart-izgara c3">${yazilar.map(({ id, w }) => icerikKart(id, 'fa-newspaper', w.baslik, `${kac(w.ozet)} · ${w.okuma_dk} dk okuma`)).join('')}</div>
<h3 class="kart-baslik">${ikon('fa-utensils')} Örnek Menüler</h3><div class="kart-izgara c2">${menuler.map(({ id, m, h }) => icerikKart(id, 'fa-utensils', m.baslik, `${kac(m.ozet)} · ${deger('kcal', h.top.kcal)} kcal · ${m.ogunler.length} öğün`)).join('')}</div></div>`;
  const modallar = yazilar.map(({ id, w }) => modal(id, w.baslik, `${ust(w.tarih, `${w.okuma_dk} dk okuma`)}<div class="okuma">${w.paragraflar.map((p) => `<p>${kac(p)}</p>`).join('')}</div>`, u.ad)).join('')
    + menuler.map(({ id, m, h }) => modal(id, m.baslik, `${ust(m.tarih, `${m.ogunler.length} öğün`)}<p class="kart-metin">${kac(m.ozet)}</p>${menuOzet(h)}${menuTablo(h)}<div class="bilgi-notu">${ikon('fa-circle-info')}<p>Değerler Dada Diet besin kütüphanesindeki 100 g değerlerinden (USDA FoodData Central) gram üzerinden hesaplanır.</p></div>`, u.ad)).join('');
  return { kartlar, modallar, adet: yazilar.length + menuler.length };
};

/* Panel müsaitlik ızgarası: 08.00'den 30 dakikalık 26 hücre; karma gün 13.00 öncesi yüz yüze, sonrası online */
const dk = (x) => { const [a, b] = x.split(':'); return +a * 60 + +b; };
const izgaraKur = (haftalik) => haftalik.map((g) => Array.from({ length: 26 }, (_, i) => {
  const t = 8 * 60 + i * 30;
  if (!g.acik || t < dk(g.baslangic) || t >= dk(g.bitis) || (g.ara && t >= dk(g.ara[0]) && t < dk(g.ara[1]))) return '';
  return g.tur === 'karma' ? (t < 13 * 60 ? 'yuzyuze' : 'online') : g.tur;
}));
const ucretAralik = (m) => { const l = Object.values(m.ucret); return { min: Math.min(...l), max: Math.max(...l) }; };
const ucretMetin = (f) => (f.min === f.max ? bicim.para(f.min) : `${bicim.para(f.min)}–${bicim.sayi(f.max)}`);

/* Randevu seçici: Ece ve örnek profillerde aynı iskelet (assets/js/sayfa/public-araclar-profil.js) */
const randevuSecici = (devamHref, ek = '') => `<div class="iki-kolon randevu-sec"${ek}>
<div class="kart" id="randevuSecim">
<div class="kart-govde"><p class="alan-etiket" id="turEtiket">Görüşme türü</p><div class="secenek-izgara dolu-secim" id="slotTur" role="radiogroup" aria-labelledby="turEtiket"></div></div>
<div class="kart-govde"><div class="gun-secici-bas"><p class="alan-etiket" id="gunEtiket">Gün <span class="kart-metin" id="haftaAralik"></span></p><div class="eylem-satiri"><button class="ikon-dugme" type="button" id="haftaGeri" aria-label="Önceki hafta">${ikon('fa-chevron-left')}</button><button class="ikon-dugme" type="button" id="haftaIleri" aria-label="Sonraki hafta">${ikon('fa-chevron-right')}</button></div></div><div class="gun-serit-liste secilir" id="gunSerit" role="radiogroup" aria-labelledby="gunEtiket"></div></div>
<div class="kart-govde" id="slotlar"></div>
</div>
<aside class="yapiskan alt-yapiskan" aria-label="Randevu özeti"><div class="kart secim-ozet"><div class="kart-bas"><h3 class="kart-baslik">${ikon('fa-clipboard-check')} Randevu Özeti</h3></div><div class="kart-govde"><div class="secim-ozet-liste" id="ozetListe"></div><p class="secim-ozet-satir" id="ozetSatir"></p><div class="yigin sik"><a class="dugme birincil tam-en" id="slotDevam" href="${devamHref}" aria-disabled="true">Randevuyu tamamla ${ikon('fa-arrow-right')}</a><p class="kart-metin" id="slotNot" aria-live="polite">Saat seçince randevunu hesabından onaylarsın.</p></div></div></div></aside>
</div>`;
const randevuBas = (ek = '') => bolumBas({ etiket: 'Uygunluk', ikon: 'fa-calendar-check', baslik: 'Önümüzdeki Günler', metin: 'Görüşme türünü ve günü seç, sonra uygun bir saate dokun. Üstü çizili saatler alınmış.', arac: ek });

/* Liste kartı ve profil başlığı aynı veriden: puan ve değerlendirme yorumlardan, fiyat seans ücretinden */
const ozetAl = (o) => ({ puan: ortalama(o.yorumlar), degerlendirme_sayisi: o.yorumlar.length, fiyat_araligi: ucretAralik(o.musaitlik), dogrulandi: true, diller: o.diller });

/* ── Örnek profil (Ece dışındaki uzmanlar) ── */
function ornekProfil(u, o, B) {
  const oz = ozetAl(o), ic = icerikler(u, o, B), m = o.musaitlik;
  const puanMetin = `${bicim.sayi(oz.puan, 1, 1)} · ${oz.degerlendirme_sayisi} yorum`;
  const veri = { slug: u.slug, ad: u.ad, online: u.online, yuz_yuze: u.yuz_yuze, sehir: u.sehir, fiyat_araligi: oz.fiyat_araligi,
    musaitlik: { haftalik: m.haftalik.map(({ gun, acik, baslangic, bitis, ara }) => ({ gun, acik, baslangic, bitis, ara })), izgara: izgaraKur(m.haftalik), slot: m.slot, ucret: m.ucret, onay: m.onay, tampon: 0 }, dolu: m.dolu };
  const belgeTarih = bicim.tarih(o.dogrulama_tarih);
  const egitimListe = o.egitim.map((x) => satir('fa-graduation-cap', kac(x.ad), kac(x.program))).join('')
    + o.sertifikalar.map((x) => satir('fa-certificate', kac(x), 'Sertifika')).join('')
    + satir('fa-file-shield', 'Lisans diploması', `Diploma · ${belgeTarih}`, '<span class="durum-hapi cozulen">Doğrulandı</span>')
    + satir('fa-id-card', 'Meslek kaydı', `Mesleki kayıt · ${belgeTarih}`, '<span class="durum-hapi cozulen">Doğrulandı</span>')
    + satir('fa-language', 'Görüşme dili', kac(o.diller.join(', ')))
    + satir('fa-utensils', 'Örnek menüler', `${o.menuler.length} örnek menü İçerikler sekmesinde`, '<span class="durum-hapi cozulen">Yayında</span>');
  const govde = `<div class="zebra">${profilUst(u, {
    rozet: dogrulandiHap,
    giris: `<span data-ornek>${kac(o.kisa)} <span class="ornek-etiket satir-ici">prototip örneği</span></span>`,
    eylem: `<a class="dugme birincil" href="#p-randevu" data-sekme-git="t-randevu">${ikon('fa-calendar-check')} Randevu al</a><div><a class="dugme hayalet" href="${K}giris/" data-mesaj>${ikon('fa-paper-plane')} Mesaj</a>${kaydetDugme(u)}<button class="dugme hayalet" type="button" data-paylas aria-label="Profili paylaş">${ikon('fa-share-nodes')}</button></div>`,
    sayaclar: [['fa-briefcase', 'Deneyim', `${u.deneyim_yil} yıl`], ['fa-star', 'Danışan puanı', { ornek: puanMetin, bos: 'Henüz puan yok' }], ['fa-tag', 'Seans ücreti', { ornek: ucretMetin(oz.fiyat_araligi), bos: 'Henüz yok' }], ['fa-video', 'Görüşme kipi', gorusme(u)]],
  })}
<div class="modul-govde">${rk('SF-P1', { tur: 'bant' })}${sekmeRay([['hakkinda', 'Hakkında', 'fa-user'], ['paket', 'Hizmet Paketleri', 'fa-box-open', { html: iki(o.paketler.length, 0) }], ['randevu', 'Randevu', 'fa-calendar-check'], ['yorumlar', 'Yorumlar', 'fa-comment-dots', { html: iki(o.yorumlar.length, 0) }], ['icerikler', 'İçerikler', 'fa-newspaper', { html: iki(ic.adet, 0) }]])}
${pano('hakkinda', true, `<div class="iki-kolon"><div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-user-doctor')} ${iki(kac(o.hakkinda.baslik), `${kac(u.ad)} Hakkında`)}</h2>${ornekEtiket}</div><div class="kart-govde duz-metin"><div data-ornek>${o.hakkinda.metin.map((p) => `<p>${kac(p)}</p>`).join('')}</div><p class="kart-metin" data-bos>Uzman tanıtım yazısını profiline eklediğinde burada görünür.</p></div></div><div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-stethoscope')} Çalışma Alanları</h2></div><div class="kart-govde"><div class="sonuc-etiketler">${u.uzmanlik.map((x) => `<span class="rozet olumlu">${kac(x)}</span>`).join('')}</div></div></div></div>
<div class="kart"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-graduation-cap')} Eğitim ve Doğrulama</h2><p>Uzmanın panelindeki profil kaydından okunur; belgeler yalnız yönetim tarafından açılır.</p></div>${ornekEtiket}</div><div class="kart-govde ayar-liste" data-ornek>${egitimListe}</div><div class="kart-govde ayar-liste" data-bos>${satir('fa-graduation-cap', 'Eğitim', 'Uzman eğitim bilgisini profiline eklediğinde görünür.', bekliyor)}${satir('fa-file-shield', 'Diploma ve mesleki kayıt', 'Doğrulama tamamlandığında "Doğrulandı" rozetiyle görünür.', bekliyor)}${satir('fa-language', 'Görüşme dili', 'Türkçe')}${satir('fa-utensils', 'Örnek menüler', 'Uzman örnek menü yayınladığında İçerikler sekmesinde listelenir.', bekliyor)}</div></div>`)}
${pano('paket', false, `${bolumBas({ etiket: 'Hizmetler', ikon: 'fa-box-open', baslik: 'Hizmet Paketleri', metin: 'Paketler diyetisyenin panelinden yönetilir, buraya anında yansır.', arac: ornekEtiket })}<div class="kart-izgara c3" data-ornek>${o.paketler.map((p) => paketKart(p, `${K}giris/`, ` data-paket-talep="${kac(p.ad)}"`)).join('')}</div><div class="kart" data-bos><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-box-open')}</span><h3>Henüz yayında paket yok</h3><p>Hizmet kataloğu yayına girdiğinde paketler, seans sayısı ve ücretleriyle burada görünür.</p>${dugme('Bütün diyetisyenler', 'diyetisyenler/', 'hayalet', 'fa-arrow-right', true)}</div></div>`)}
${pano('randevu', false, `${randevuBas(ornekEtiket)}${randevuSecici(`${K}giris/`, ' data-ornek')}<div class="kart" data-bos><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-calendar-xmark')}</span><h3>Açık görüşme saati yok</h3><p>Önümüzdeki dört hafta için yayınlanmış görüşme saati görünmüyor. Uzmanın takvimi açıldığında saatler burada listelenir.</p>${dugme('Bütün diyetisyenler', 'diyetisyenler/', 'hayalet', 'fa-arrow-right', true)}</div></div>`)}
${pano('yorumlar', false, `${yorumBas}<div class="yigin" data-ornek>${yorumOzet(o.yorumlar)}<div class="kart-izgara c2">${o.yorumlar.map(yorumKart).join('')}</div></div>${yorumBos(u.ad)}`)}
${pano('icerikler', false, `${icerikBas}${ic.kartlar}${icerikBos(u.ad)}`)}
</div>${sonSerit('SF-P1-END')}</div>${ic.modallar}${jsonGom('profilVeri', veri)}`;
  return govde;
}

export default ({ veri }) => {
  const s = veri.sayaclar, O = veri['diyetisyen-ornek'].uzmanlar, B = Object.fromEntries(veri.besinler.besinler.map((b) => [b.slug, b]));
  /* Liste verisi örnek profilden zenginleşir: puan, değerlendirme, fiyat, doğrulama, dil */
  const D = veri.diyetisyenler.diyetisyenler.map((d) => (O[d.slug] ? { ...d, ...ozetAl(O[d.slug]) } : d));
  const sehirler = [...new Set(D.map((d) => d.sehir))].sort((a, b) => a.localeCompare(b, 'tr'));
  const diller = [...new Set(D.flatMap((d) => d.diller || []))];
  const kart = (d, i) => uzmanKart({ ...d, fiyat_bant: fiyatBant(d.fiyat_araligi?.min) }, i, `diyetisyen/${d.slug}/`);
  const landing = `${bant({ yol: [['Diyetisyenler']], etiket: 'Uzman Diyetisyenler', etiketIkon: 'fa-stethoscope', h1: 'Sana uygun <span class="vurgu">diyetisyeni</span> bul, randevunu al', gorsel: 'hero/mega-photo-1467453678174-768ec283a940.avif', alt: 'Alanında uzman diyetisyenlerle online ya da yüz yüze görüş. Uzmanlık alanına, şehrine ve bütçene göre filtrele; danışan yorumlarını oku.',
    eylem: dugme('Sana Uygun Diyetisyeni Bul', 'diyetisyen-bul-sihirbazi/', 'birincil', 'fa-wand-magic-sparkles') + dugme('Bana Uygun Olanı Bul', 'bana-uygun-olani-bul/', 'koyu-zemin notr', 'fa-compass') + dugme('Diyetisyen Ol', 'diyetisyen-ol/', 'koyu-zemin notr', 'fa-id-badge'),
    alttaki: bantSayilar([[s.diyetisyen, 'Uzman profili'], [`${s.diyetisyen_il} il`, '+ online Türkiye geneli']]).replace('bant-sayilar', 'bant-sayilar alt-hiza yuksek') })}
${bolum(`${rk(['DN-FRIDGE', 'DN-P1', 'DN-P2', 'DN-P3', 'DN-P4', 'DN-P5'], { hedef: '.bant', yon: 'yerine', ust: kirinti(['Diyetisyenler']) })}${ustSerit('SF-L1')}<div class="suzme-yerlesim" id="uzmanListe">${suzmeSutun(sehirler, diller, D.length)}
<div class="suzme-ana"><div class="liste-cubuk"><p class="liste-ozet"><b id="uzmanSayi">${D.length} uzman</b> bulundu</p><div class="liste-arac"><button class="suzme-ac" id="suzmeAc" type="button">${ikon('fa-sliders')} Filtrele <span class="suzme-ac-sayi" id="suzmeSayi" hidden>0</span></button>${siraKutu}</div></div>
<div class="suzme-cipler" id="suzmeCipler" aria-label="Aktif filtreler" hidden></div>
<p class="dogrulama-notu">${ikon('fa-shield-halved')}<span>Doğrulama: "Doğrulandı" rozeti, diploması ve mesleki kaydı kontrol edilen uzmanları gösterir; kontrol tamamlanmadan rozet verilmez. Puan, yorum ve ücretler <span class="ornek-etiket satir-ici">prototip örneği</span></span></p>
<div class="vitrin-izgara" id="uzmanKartlar">${D.map(kart).join('')}</div>${rk('SF-N2', { tur: 'uzman', hedef: '#uzmanKartlar', sira: 4 })}
<div class="kart suzme-bos" id="uzmanBos" hidden><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-user-doctor')}</span><h3>Uzman bulunamadı</h3><p>Daha fazla uzman görmek için bir filtreyi temizle.</p></div></div></div></div>`, { ilk: true, sinif: 'suzme-bolum' })}
<div class="bolum-dizi">
${sonSerit('SF-L1-END')}
</div>`;

  const profiller = D.filter((u) => O[u.slug]).map((u) => ({ yol: `diyetisyen/${u.slug}`, meta: { baslik: u.ad, duzen: 'public', aktif: 'Diyetisyenler', js: [...sayfaJs('profil'), 'assets/js/misafir.js'] }, govde: ornekProfil(u, O[u.slug], B) }));

  /* Ece Tunalı: panel demosu. Alanlar, paketler, randevu ve yorumlar demo durumundan (JS); yazı ve menüler örnek dosyadan */
  const d = veri.demo.diyetisyen, eo = O[d.slug] || { yazilar: [], menuler: [] }, ic = icerikler(d, eo, B);
  const eceYorum = d.yorumlar || [], eceOrt = ortalama(eceYorum);
  const ece = `<div class="zebra"><div class="uyari-serit" id="onizlemeSerit" hidden><div class="kap">${ikon('fa-eye')}<p>Önizleme, ziyaretçiler bu sayfayı görmüyor. <a class="baglanti-metin" href="${K}diyetisyen-paneli/profil/">Panele dön</a></p></div></div>${profilUst(d, {
    rozet: dogrulandiHap,
    giris: '<span id="eceKisa"></span> <span class="ornek-etiket satir-ici">prototip örneği</span>',
    eylem: `<a class="dugme birincil" href="#p-randevu" data-sekme-git="t-randevu">${ikon('fa-calendar-check')} Randevu al</a><div><a class="dugme hayalet" href="${K}hesabim/diyetisyenim/#mesaj">${ikon('fa-paper-plane')} Mesaj</a>${kaydetDugme(d)}<button class="dugme hayalet" type="button" data-paylas aria-label="Profili paylaş">${ikon('fa-share-nodes')}</button></div>`,
    sayaclar: [['fa-briefcase', 'Deneyim', `${d.deneyim_yil} yıl`, 'deneyim'], ['fa-star', 'Danışan puanı', eceOrt ? `${bicim.sayi(eceOrt, 1, 1)} · ${eceYorum.length} yorum` : 'Henüz puan yok', 'puan'], ['fa-tag', 'Seans ücreti', `${bicim.para(d.fiyat_araligi.min)}–${bicim.sayi(d.fiyat_araligi.max)}`, 'ucret'], ['fa-video', 'Görüşme kipi', gorusme(d), 'gorusme']],
  })}
<section class="bolum" id="profilKapali" hidden><div class="kap"><div class="kart"><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-user-clock')}</span><h3>Bu profil henüz yayında değil</h3><p>Uzmanın başvurusu inceleniyor. Yayına girdiğinde hizmetleri ve randevu saatleri burada görünür.</p><a class="dugme birincil" href="${K}diyetisyenler/">Tüm diyetisyenleri gör</a></div></div></div></section>
<div class="modul-govde" id="profilGovde">${rk('SF-P1', { tur: 'bant' })}${sekmeRay([['hakkinda', 'Hakkında', 'fa-user'], ['paket', 'Hizmet Paketleri', 'fa-box-open', 'paketSayi'], ['randevu', 'Randevu', 'fa-calendar-check'], ['yorumlar', 'Yorumlar', 'fa-comment-dots', 'yorumSayi'], ['icerikler', 'İçerikler', 'fa-newspaper', { html: iki(ic.adet, 0) }]])}
${pano('hakkinda', true, `<div class="iki-kolon"><div class="kart"><div class="kart-bas"><h2 class="kart-baslik" id="eceBaslik">${ikon('fa-user-doctor')} <span></span></h2></div><div class="kart-govde duz-metin" id="eceMetin"></div></div><div class="kart"><div class="kart-bas"><h2 class="kart-baslik">${ikon('fa-stethoscope')} Çalışma Alanları</h2></div><div class="kart-govde"><div class="sonuc-etiketler" id="eceAlan">${d.uzmanlik.map((u) => `<span class="rozet olumlu">${kac(u)}</span>`).join('')}</div></div></div></div>
<div class="kart" id="eceEgitim"><div class="kart-bas"><div><h2 class="kart-baslik">${ikon('fa-graduation-cap')} Eğitim ve Doğrulama</h2><p>Uzmanın panelindeki profil kaydından okunur; belgeler yalnız yönetim tarafından açılır.</p></div><span class="ornek-etiket">prototip örneği</span></div><div class="kart-govde ayar-liste" id="eceEgitimListe"></div></div>`)}
${pano('paket', false, `${bolumBas({ etiket: 'Hizmetler', ikon: 'fa-box-open', baslik: 'Hizmet Paketleri', metin: 'Paketler diyetisyenin panelinden yönetilir, buraya anında yansır.' })}<div class="kart-izgara c3" id="paketler"></div>`)}
${pano('randevu', false, `${randevuBas()}${randevuSecici(`${K}hesabim/diyetisyenim/#randevu`)}`)}
${pano('yorumlar', false, `${yorumBas}<div class="yigin" id="yorumDolu"><div id="yorumOzet"></div><div class="kart-izgara c2" id="yorumListe"></div></div>${yorumBos(d.ad, ' id="yorumBos" hidden')}`)}
${pano('icerikler', false, `${icerikBas}${ic.kartlar}${icerikBos(d.ad)}`)}
</div>${sonSerit('SF-P1-END')}</div>${ic.modallar}`;

  return [
    { yol: 'diyetisyenler', meta: { baslik: 'Diyetisyenler', duzen: 'public', aktif: 'Diyetisyenler', hero: true, js: sayfaJs('uzman') }, govde: landing },
    ...profiller,
    { yol: 'diyetisyen/dyt-ece-tunali', meta: { baslik: d.ad, duzen: 'public', aktif: 'Diyetisyenler', js: [...sayfaJs('profil'), 'assets/js/misafir.js'] }, govde: ece },
  ];
};
