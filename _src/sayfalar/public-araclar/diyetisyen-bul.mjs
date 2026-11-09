// Diyetisyen Bul sihirbazı. Desen: tasks/referanslar.md §6 (3 adım, cevap çipleri, neden satırları, boş sonuç).
import { K, sayfaJs, bant, sihirbazBolum, adim, jsonGom, ikon, DETAY, guven } from '../../parcalar/public-araclar/ortak.mjs';

const HEDEF = [['Kilo Yönetimi', 'Sağlıklı kiloya ulaş, koru', 'fa-weight-scale'], ['Sporcu Beslenmesi', 'Performans ve toparlanma', 'fa-dumbbell'], ['Çocuk & Aile', 'Çocuk ve ergen beslenmesi', 'fa-children'], ['Gebelik & Emzirme', 'Anne ve bebek sağlığı', 'fa-person-pregnant'], ['Klinik & Hastalık', 'Diyabet, kalp, tansiyon', 'fa-notes-medical'], ['Bağırsak Sağlığı', 'Sindirim, FODMAP, şişkinlik', 'fa-bacteria'], ['Hormonal Denge & PCOS', 'Hormonal dengeyi destekle', 'fa-venus'], ['Vejetaryen & Vegan', 'Bitkisel beslenme düzeni', 'fa-seedling']];
const GORUSME = [['online', 'Online', 'Görüntülü, her yerden', 'fa-video'], ['yuz', 'Yüz yüze', 'Uzmanın ofisinde', 'fa-house-medical'], ['farketmez', 'Fark etmez', 'İkisi de olur', 'fa-arrows-left-right']];
/* Görüşme dili isteğe bağlı: profillerde dil verisi yayına girdiğinde eşleştirmeye katılır */
const DIL = [['turkce', 'Türkçe', 'Görüşme Türkçe olsun', 'fa-language'], ['ingilizce', 'İngilizce', 'Görüşme İngilizce olsun', 'fa-globe'], ['farketmez', 'Fark etmez', 'Dil önemli değil', 'fa-comments']];
const BUTCE = [['ekonomik', 'Ekonomik', 'Uygun fiyatlı paket isterim', 'fa-wallet'], ['orta', 'Orta', 'Görüşme başına dengeli ücret', 'fa-scale-balanced'], ['farketmez', 'Fark etmez', 'Uzman uyumu önce gelir', 'fa-star']];
const sec = (l) => l.map(([deger, baslik, alt, i]) => ({ deger, baslik, alt, ikon: i }));

export default ({ veri }) => {
  const D = veri.diyetisyenler.diyetisyenler, sehirler = [...new Set(D.map((d) => d.sehir))];
  const SEHIR = [...sehirler.map((s) => [s, s, '', 'fa-location-dot']), ['farketmez', 'Fark etmez', '', 'fa-map']];
  const harita = (l) => Object.fromEntries(l.map(([d, b]) => [d, b]));
  const govde = `${adim({ id: 'hedef', baslik: 'Hangi Konuda Destek Arıyorsun?', alt: 'Sana en uygun uzmanlık alanını eşleştirelim.', alanlar: [{ ad: 'hedef', secenekler: HEDEF.map(([b, a, i]) => ({ deger: b, baslik: b, alt: a, ikon: i })) }] })}
${adim({ id: 'gorusme', baslik: 'Nasıl Görüşmek İstersin?', alt: 'Yüz yüze seçersen şehrini de soralım. Görüşme dili isteğe bağlı.', alanlar: [{ ad: 'gorusme', sinif: 'c3', secenekler: sec(GORUSME) }, { ad: 'sehir', etiket: 'Hangi Şehirde?', sinif: 'c3', kosul: 'gorusme=yuz', secenekler: sec(SEHIR) }, { ad: 'dil', etiket: 'Görüşme Dili (İsteğe Bağlı)', sinif: 'c3', istege: true, secenekler: sec(DIL) }] })}
${adim({ id: 'butce', baslik: 'Bütçe Beklentin Nedir?', alt: 'Ücret bilgisi profillerde yayına girdiğinde eşleştirmeye katılacak.', alanlar: [{ ad: 'butce', sinif: 'c3', secenekler: sec(BUTCE) }] })}`;
  const sonuc = `<section class="sihirbaz-adim" data-sonuc hidden><div class="bolum-bas"><div><h2 tabindex="-1" id="sonucBaslik"></h2><p class="giris-metni" id="sonucGiris"></p></div></div><div class="cipler sonuc-cipler" id="sonucCipler" role="group" aria-label="Cevapların"></div>
<div class="kart-izgara c3" id="sonucKartlar"></div>
<div class="kart" id="sonucBos" hidden><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-user-doctor')}</span><h3 id="sonucBosBaslik"></h3><p id="sonucBosMetin"></p><a class="dugme birincil" href="${K}diyetisyenler/">Tüm diyetisyenleri gör</a></div></div>
<h3 class="kart-baslik sihirbaz-alt-baslik" id="sonucYakinBaslik" hidden>${ikon('fa-compass')} Sana Yakın Seçenekler</h3><div class="kart-izgara c3" id="sonucYakin" hidden></div>
<div class="bolum-eylem"><a class="dugme hayalet" href="${K}diyetisyenler/">Tüm diyetisyenler</a><button class="dugme birincil" type="button" data-bastan>${ikon('fa-rotate-left')} Baştan başla</button></div>
<p class="alt-not">${ikon('fa-circle-info')}<span>Uzmanların ücret ve görüşme dili bilgisi henüz yayında olmadığı için bütçen ve dil tercihin sıralamayı etkilemedi.</span></p></section>`;
  const cipler = [['hedef', 'hedef', Object.fromEntries(HEDEF.map(([b]) => [b, b]))], ['gorusme', 'gorusme', harita(GORUSME)], ['gorusme', 'sehir', harita(SEHIR)], ['gorusme', 'dil', harita(DIL)], ['butce', 'butce', harita(BUTCE)]];
  const sayfa = `${bant({ yol: [['Diyetisyenler', 'diyetisyenler/'], ['Diyetisyen Bul']], etiket: 'Sana uygun uzmanı bul', etiketIkon: 'fa-user-doctor', h1: 'Birkaç soruyla <span class="vurgu">doğru diyetisyene</span> ulaş', gorsel: 'hero/mega-photo-1467453678174-768ec283a940.avif', alt: 'Hedefini ve görüşme tercihini seç; uzmanlar arasından sana uygun olanları listeleyelim.', alttaki: guven([['fa-video', 'Online veya yüz yüze'], ['fa-stopwatch', '30 saniyeden kısa']]) })}
<div class="bolum-dizi">${sihirbazBolum({ id: 'diyetisyen', adimlar: [['Hedefin', 'Ne için destek?'], ['Görüşme', 'Nasıl görüşürsün?'], ['Bütçe', 'Beklentin ne?']], govde, sonuc, not: 'Bu sihirbaz seni uygun uzmanla buluşturmak için bir <b>yönlendirmedir</b>; <b>tıbbi teşhis ya da tedavi sağlamaz.</b> Gebelik, kronik hastalık veya düzenli ilaç kullanımı varsa bir plana başlamadan önce diyetisyenine ve hekimine danış.', ek: jsonGom('sihirbazVeri', { diyetisyenler: D.map(({ slug, ad, unvan, uzmanlik, sehir, online, yuz_yuze, deneyim_yil, harf }) => ({ slug, ad, unvan, uzmanlik, sehir, online, yuz_yuze, deneyim_yil, harf })), detay: DETAY.diyetisyen, cipler }) })}</div>`;
  return [{ yol: 'diyetisyen-bul-sihirbazi', meta: { baslik: 'Diyetisyen Bul', duzen: 'public', aktif: 'Diyetisyenler', hero: true, js: sayfaJs('sihirbaz') }, govde: sayfa }];
};
