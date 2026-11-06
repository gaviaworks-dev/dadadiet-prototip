// Diyetisyen Bul sihirbazı. Desen: tasks/referanslar.md §6 (3 adım, cevap çipleri, neden satırları, boş sonuç).
import { K, sayfaJs, sihirbazKabuk, adim, jsonGom, ikon, DETAY } from '../../parcalar/public-araclar/ortak.mjs';

const HEDEF = [['Kilo Yönetimi', 'Sağlıklı kiloya ulaş, koru', 'fa-weight-scale'], ['Sporcu Beslenmesi', 'Performans ve toparlanma', 'fa-dumbbell'], ['Çocuk & Aile', 'Çocuk ve ergen beslenmesi', 'fa-children'], ['Gebelik & Emzirme', 'Anne ve bebek sağlığı', 'fa-person-pregnant'], ['Klinik & Hastalık', 'Diyabet, kalp, tansiyon', 'fa-notes-medical'], ['Bağırsak Sağlığı', 'Sindirim, FODMAP, şişkinlik', 'fa-bacteria'], ['Hormonal Denge & PCOS', 'Hormonal dengeyi destekle', 'fa-venus'], ['Vejetaryen & Vegan', 'Bitkisel beslenme düzeni', 'fa-seedling']];
const GORUSME = [['online', 'Online', 'Görüntülü, her yerden', 'fa-video'], ['yuz', 'Yüz yüze', 'Uzmanın ofisinde', 'fa-house-medical'], ['farketmez', 'Fark etmez', 'İkisi de olur', 'fa-arrows-left-right']];
const BUTCE = [['ekonomik', 'Ekonomik', 'Uygun fiyatlı paket isterim', 'fa-wallet'], ['orta', 'Orta', 'Görüşme başına dengeli ücret', 'fa-scale-balanced'], ['farketmez', 'Fark etmez', 'Uzman uyumu önce gelir', 'fa-star']];
const sec = (l) => l.map(([deger, baslik, alt, i]) => ({ deger, baslik, alt, ikon: i }));

export default ({ veri }) => {
  const D = veri.diyetisyenler.diyetisyenler, sehirler = [...new Set(D.map((d) => d.sehir))];
  const SEHIR = [...sehirler.map((s) => [s, s, '', 'fa-location-dot']), ['farketmez', 'Fark etmez', '', 'fa-map']];
  const harita = (l) => Object.fromEntries(l.map(([d, b]) => [d, b]));
  const govde = `${adim({ id: 'hedef', baslik: 'Hangi konuda destek arıyorsun?', alt: 'Uzmanlık alanını eşleştirelim. Üç soru, 30 saniyeden kısa.', gorsel: 'hero/giris-pano-diyetisyen.webp', alanlar: [{ ad: 'hedef', secenekler: HEDEF.map(([b, a, i]) => ({ deger: b, baslik: b, alt: a, ikon: i })) }] })}
${adim({ id: 'gorusme', baslik: 'Nasıl görüşmek istersin?', alt: 'Yüz yüze seçersen şehrini de soralım.', gorselIkon: 'fa-video', alanlar: [{ ad: 'gorusme', sinif: 'c3', secenekler: sec(GORUSME) }, { ad: 'sehir', etiket: 'Hangi şehirde?', sinif: 'c3', kosul: 'gorusme=yuz', secenekler: sec(SEHIR) }] })}
${adim({ id: 'butce', baslik: 'Bütçe beklentin nedir?', alt: 'Ücret bilgisi profillerde yayına girdiğinde eşleştirmeye katılacak.', gorselIkon: 'fa-wallet', alanlar: [{ ad: 'butce', sinif: 'c3', secenekler: sec(BUTCE) }] })}
<section class="sihirbaz-adim" data-sonuc hidden><h1 tabindex="-1" id="sonucBaslik"></h1><p id="sonucGiris"></p><div class="cipler sonuc-cipler" id="sonucCipler" role="group" aria-label="Cevapların"></div>
<div class="kart-izgara c3" id="sonucKartlar"></div>
<div class="kart" id="sonucBos" hidden><div class="bos-durum kart-ici"><span class="bos-ikon">${ikon('fa-user-doctor')}</span><h3 id="sonucBosBaslik"></h3><p id="sonucBosMetin"></p><a class="dugme birincil" href="${K}diyetisyenler/">Tüm diyetisyenleri gör</a></div></div>
<h2 class="kart-baslik sihirbaz-alt-baslik" id="sonucYakinBaslik" hidden>${ikon('fa-compass')} Sana yakın seçenekler</h2><div class="kart-izgara c3" id="sonucYakin" hidden></div>
<div class="bolum-eylem"><a class="dugme hayalet" href="${K}diyetisyenler/">Tüm diyetisyenler</a><button class="dugme birincil" type="button" data-bastan>${ikon('fa-rotate-left')} Baştan başla</button></div>
<p class="alt-not">${ikon('fa-circle-info')}<span>Bu sihirbaz bir yönlendirmedir; tıbbi teşhis ya da tedavi sağlamaz. Uzmanların ücret bilgisi henüz yayında olmadığı için bütçen sıralamayı etkilemedi. Gebelik, kronik hastalık veya düzenli ilaç kullanımı varsa plana başlamadan önce diyetisyenine ve hekimine danış.</span></p></section>
<div class="sihirbaz-gorsel" id="sihirbazGorsel" aria-hidden="true"></div>`;
  const cipler = [['hedef', 'hedef', Object.fromEntries(HEDEF.map(([b]) => [b, b]))], ['gorusme', 'gorusme', harita(GORUSME)], ['gorusme', 'sehir', harita(SEHIR)], ['butce', 'butce', harita(BUTCE)]];
  return [{ yol: 'diyetisyen-bul-sihirbazi', meta: { baslik: 'Diyetisyen Bul', duzen: 'tam', js: sayfaJs('sihirbaz') }, govde: sihirbazKabuk({ id: 'diyetisyen', cikis: 'diyetisyenler/', govde, ek: jsonGom('sihirbazVeri', { diyetisyenler: D.map(({ slug, ad, unvan, uzmanlik, sehir, online, yuz_yuze, deneyim_yil, harf }) => ({ slug, ad, unvan, uzmanlik, sehir, online, yuz_yuze, deneyim_yil, harf })), detay: DETAY.diyetisyen, cipler }) }) }];
};
