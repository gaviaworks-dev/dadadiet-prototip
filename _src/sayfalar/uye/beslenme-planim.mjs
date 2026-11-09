import { uyeSayfa, kart, dugme, bilgi, modal } from '../../parcalar/uye/ust.mjs';
import { reklamYeri as rk } from '../../parcalar/reklam.mjs';

const aktif = `<div class="yigin" id="bpAktif">
<div class="cipler" id="bpKaynak" role="group" aria-label="Aktif program seçimi" data-suzgec hidden></div>
<div id="bpBas"></div>
<div id="bpBitis"></div>
<div id="bpNotKap"></div>
${kart({
    ikon: 'fa-chart-line', baslik: 'Programa Uyum Durumun', metin: '<span id="bpUyumMetin"></span>',
    sag: `<div class="as-eylem"><span id="bpDurumHap"></span>${dugme('Uyum dökümünü görüntüle', { sinif: 'hayalet kucuk', ikon: 'fa-table-list', ek: ' id="bpDokumDugme" aria-expanded="false" aria-controls="bpDokum"' })}</div>`,
    govde: '<div id="bpUyum"></div><div id="bpDokum" hidden></div>',
    alt: `${dugme('Programı duraklat', { ikon: 'fa-pause', ek: ' id="bpDuraklat"' })}${dugme('Diyetisyene not gönder', { ikon: 'fa-pen', ek: ' data-not-ac' })}${dugme('Bugünün öğünleri', { sinif: 'birincil', ikon: 'fa-utensils', ek: ' data-sekme-git="ogun"' })}`,
    id: 'bpUyumKart',
  })}
${kart({ ikon: 'fa-comments', baslik: 'Bu Programda Gönderdiğin Notlar', metin: 'Diyetisyenine ilettiğin notlar mesajlarına da düşer.', bosluksuz: true, govde: '<div id="bpNotlar"></div>' })}
${bilgi('fa-user-doctor', 'Bu plan sana özel hazırlandı; gebelik, kronik hastalık ya da düzenli ilaç kullanımında değişiklik yapmadan önce diyetisyenine danış.')}
</div>`;

const hafta = `<div class="yigin">
<div id="bpHaftaBas"></div>
<div class="uyum-yer" data-bp-tercih></div>
${kart({
    ikon: 'fa-calendar-week', baslik: '7 Günlük Öğün Dökümü', metin: 'Bugünün satırı işaretli. Porsiyonlar plan kalemlerinin ölçüsüyle verilir.', bosluksuz: true,
    govde: '<ol class="hafta-plan" id="bpHafta" aria-label="Haftanın günlük öğünleri"></ol>',
    alt: `${dugme('Menüyü yazdır', { ikon: 'fa-print', ek: ' id="bpYazdir"' })}${dugme('PDF indir', { ikon: 'fa-file-pdf', ek: ' id="bpPdf"' })}${dugme('Alışveriş listesi oluştur', { sinif: 'birincil', ikon: 'fa-basket-shopping', ek: ' data-ac="#bpAlisveris"' })}${rk('TD-LISTE-PARTNER')}`,
  })}
</div>`;

const ogun = `<div class="yigin">
<div id="bpOgunBas"></div>
<div class="uyum-yer" data-bp-tercih></div>
${kart({
    ikon: 'fa-utensils', baslik: 'Öğün Listesi', metin: '<span id="bpOgunOzet"></span>', bosluksuz: true,
    sag: '<div class="as-eylem"><span class="durum-hapi bekleyen" id="bpOgunSayac"></span></div>',
    govde: '<div class="kalem-liste" id="bpOgunler"></div>',
    alt: `<span class="eylem-notu" id="bpOgunNot"></span>${dugme('Diyetisyene not gönder', { ikon: 'fa-pen', ek: ' data-not-ac' })}${dugme('Alternatife geç', { ikon: 'fa-right-left', ek: ' data-sekme-git="alternatif"' })}${dugme('Kalan öğünleri işaretle', { sinif: 'birincil', ikon: 'fa-check-double', ek: ' id="bpHepsi"' })}`,
  })}
${kart({
    ikon: 'fa-chart-pie', baslik: 'Günün Makro Toplamı', metin: 'İşaretlenen öğünlerden hesaplanır. Hedef, günün plan toplamıdır.', bosluksuz: true, id: 'bpMakroKart',
    govde: '<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Günün makro toplamı"><table class="tablo panel"><caption class="yalniz-okuyucu">Alınan ve hedeflenen enerji ile makro besin ögeleri</caption><thead><tr><th scope="col">Besin ögesi</th><th scope="col" class="sag">Alınan</th><th scope="col" class="sag">Hedef</th><th scope="col" class="sag">Kalan</th></tr></thead><tbody id="bpMakro"></tbody></table></div>',
  })}
</div>`;

const alternatif = `<div class="yigin">
<div id="bpAltBas"></div>
${kart({ ikon: 'fa-shuffle', baslik: 'Bugünün Öğünleri', metin: '<span id="bpAltMetin">Enerjisi en yakın tarifler. Seçtiğin alternatif bugünün planına yazılır; aynı düğmeye basmak geri alır.</span>', sag: `<div class="as-eylem">${dugme('Besin kütüphanesi', { sinif: 'hayalet kucuk', ikon: 'fa-magnifying-glass', href: 'besin-kutuphanesi/' })}</div>`, bosluksuz: true, govde: '<div class="kalem-liste" id="bpAlternatif"></div>' })}
</div>`;

const tamamlanan = `<div class="yigin">
<div id="bpTamamBas"></div>
${kart({ ikon: 'fa-box-archive', baslik: 'Program Arşivi', metin: 'Süre, tarih aralığı ve uyum oranı; dökümü satırdan açarsın.', bosluksuz: true, govde: '<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Tamamlanan programlar"><table class="tablo panel"><caption class="yalniz-okuyucu">Tamamlanan programlar, süreleri ve uyum oranları</caption><thead><tr><th scope="col">Program</th><th scope="col">Tarih aralığı</th><th scope="col">Uyum</th><th scope="col" class="eylem-kolon"><span class="yalniz-okuyucu">İşlem</span></th></tr></thead><tbody id="bpTamam"></tbody></table></div>' })}
</div>`;

const gecmis = `<div class="yigin">
<div id="bpGecmisBas"></div>
${kart({ ikon: 'fa-timeline', baslik: 'Hareket Kaydı', metin: 'En yeni hareket üstte.', sag: '<div class="as-eylem"><span class="durum-hapi kapali" id="bpGecmisSayi"></span></div>', bosluksuz: true, govde: '<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Hareket kaydı"><table class="tablo panel sabit"><caption class="yalniz-okuyucu">Program hareketleri</caption><thead><tr><th scope="col" class="dar-kolon">Tarih</th><th scope="col">Program</th><th scope="col" class="dar-kolon">Hareket</th><th scope="col" class="dar-kolon">Not</th></tr></thead><tbody id="bpGecmis"></tbody></table></div>' })}
</div>`;

const sonEk = modal({
  id: 'bpNotModal', baslik: 'Diyetisyene Not Gönder', form: ' id="bpNotForm"',
  govde: '<p class="alan-yardim" id="bpNotBaglam"></p><div class="alan"><label class="alan-etiket" for="bpNotKonu">Konu</label><select class="alan-secim" id="bpNotKonu"><option>Öğün porsiyonu ağır geliyor</option><option>Bir öğünü uygulayamadım</option><option>Alternatif öğün talebi</option><option>Programı bir hafta duraklatmak istiyorum</option><option>Diğer</option></select></div><div class="alan"><label class="alan-etiket" for="bpNotMetin">Notun <span class="zorunlu">*</span></label><textarea class="alan-metin" id="bpNotMetin" rows="4" maxlength="4000" required placeholder="Akşam öğünündeki bulgur pilavı porsiyonu bana ağır geliyor."></textarea><p class="alan-yardim"><span>Not, diyetisyeninle mesajlarına da düşer.</span></p></div>',
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Gönder', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'bpAlisveris', baslik: 'Haftalık Alışveriş Listen',
  govde: '<p class="alan-yardim"><span id="bpAlisverisMetin"></span> <span class="durum-hapi bekleyen" id="bpAlisverisSayac"></span></p><div class="kalem-liste" id="bpAlisverisListe"></div><div class="bilgi-notu"><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i><p><b>Dada Market (prototip örneği):</b> sepet simgesine bastığın malzemeler anlaşmalı market sepetine gider. Bu prototipte gerçek mağaza, fiyat ya da ödeme yok; sepetin yalnız bu tarayıcıda tutulur. <span id="bpSepetSayi"></span> <button class="dugme hayalet kucuk" type="button" id="bpSepetGor"><i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> Sepeti gör</button></p></div>' + rk(['AL-P1', 'AL-P2', 'AL-P3', 'AL-P4']) + rk('TD-SHOP', { tur: 'pano' }) + rk('TD-SIPARIS-YS') + rk('TD-SIPARIS-A101'),
  ayak: dugme('Kapat', { ek: ' data-kapat' }) + dugme('Hepsini alındı işaretle', { sinif: 'birincil', ikon: 'fa-check-double', ek: ' id="bpAlisverisHepsi"' }),
}) + modal({
  id: 'bpSepet', baslik: 'Dada Market Sepetin',
  govde: '<div class="bilgi-notu"><i class="fa-solid fa-flask" aria-hidden="true"></i><p><b>Prototip örneği.</b> Dada Market henüz yayında değil; ürün, fiyat ve mağaza gösterilmez. Canlıda sepetteki malzemeler anlaşmalı marketin ödeme sayfasına aktarılır.</p></div><div class="kalem-liste" id="bpSepetListe"></div>',
  ayak: dugme('Sepeti boşalt', { ek: ' id="bpSepetBosalt"' }) + dugme('Kapat', { sinif: 'birincil', ek: ' data-kapat' }),
}) + modal({
  id: 'bpDurakModal', baslik: '<span id="bpDurakBaslik">Programı duraklatmak üzeresin</span>', form: ' id="bpDurakForm"',
  govde: '<p class="alan-yardim"><span id="bpDurakOzet"></span></p><label class="onay-kutusu" for="bpDurakOnay"><input type="checkbox" id="bpDurakOnay"><span id="bpDurakOnayMetin"></span></label><p class="durum-satir kapali" id="bpDurakKilit"><i class="fa-solid fa-lock" aria-hidden="true"></i> <span>Kutuyu işaretlemeden işlem yapılamaz.</span></p>',
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Programı duraklat', { sinif: 'birincil', tur: 'submit', ek: ' id="bpDurakUygula" disabled' }),
});

export default ({ veri }) => [uyeSayfa({
  yol: 'hesabim/beslenme-planim', ad: 'Beslenme Planım',
  giris: 'Aktif programın, haftalık menün ve günlük öğünlerin burada. Öğünü işaretle, alternatifini seç, programa uyumunu izle; geçmiş programların da bu sayfada arşivlenir.',
  eylem: dugme('Haftalık Menüm', { sinif: 'hayalet', ikon: 'fa-calendar-week', href: 'hesabim/haftalik-menum/' }),
  grup: 'bp',
  sekmeler: [
    { id: 'aktif', ad: 'Aktif Programım', ikon: 'fa-clipboard-check', govde: aktif },
    { id: 'hafta', ad: 'Haftalık Menüm', ikon: 'fa-calendar-week', govde: hafta },
    { id: 'ogun', ad: 'Günlük Öğünlerim', ikon: 'fa-utensils', govde: ogun },
    { id: 'alternatif', ad: 'Öğün Alternatifleri', ikon: 'fa-right-left', govde: alternatif },
    { id: 'tamamlanan', ad: 'Tamamlanan Programlar', ikon: 'fa-box-archive', sayi: 'tamamlanan', govde: tamamlanan },
    { id: 'gecmis', ad: 'Program Geçmişim', ikon: 'fa-clock-rotate-left', govde: gecmis },
  ],
  sonEk: sonEk + `<script type="application/json" id="bpKatalog">${JSON.stringify(veri.programlar.programlar.map(({ slug, ad, hedef, tercih, sure_gun }) => ({ slug, ad, hedef, tercih, sure_gun }))).replace(/</g, '\\u003c')}</script>`,
  js: ['assets/js/tercih-uyum.js', 'assets/js/sayfa/uye-menu-pdf.js', 'assets/js/sayfa/uye-beslenme-planim.js'],
})];
