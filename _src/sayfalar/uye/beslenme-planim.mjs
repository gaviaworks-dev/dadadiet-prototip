import { uyeSayfa, bolumBas, kart, dugme, bilgi, modal } from '../../parcalar/uye/ust.mjs';

const aktif = `<div class="yigin" id="bpAktif">
<div class="cipler" id="bpKaynak" role="group" aria-label="Aktif program seçimi" data-suzgec hidden></div>
<div id="bpBas"></div>
<div id="bpNotKap"></div>
${kart({
    ikon: 'fa-chart-line', baslik: 'Programa uyum durumun', metin: 'Uyum, tamamlanan öğünlerin planlanan öğünlere oranıdır.',
    sag: `<div class="as-eylem">${dugme('Uyum dökümü', { sinif: 'hayalet kucuk', ikon: 'fa-table-list', ek: ' id="bpDokumDugme" aria-expanded="false" aria-controls="bpDokum"' })}</div>`,
    govde: '<div id="bpUyum"></div><div id="bpDokum" hidden></div>',
    alt: `${dugme('Programı duraklat', { ikon: 'fa-pause', ek: ' id="bpDuraklat"' })}${dugme('Diyetisyene not gönder', { ikon: 'fa-pen-to-square', ek: ' data-not-ac' })}${dugme('Bugünün öğünleri', { sinif: 'birincil', ikon: 'fa-utensils', ek: ' data-sekme-git="ogun"' })}`,
    id: 'bpUyumKart',
  })}
${kart({ ikon: 'fa-comments', baslik: 'Bu programda gönderdiğin notlar', metin: 'Diyetisyenine ilettiğin notlar mesajlarına da düşer.', bosluksuz: true, govde: '<div id="bpNotlar"></div>' })}
${bilgi('fa-user-doctor', 'Bu plan sana özel hazırlandı; gebelik, kronik hastalık ya da düzenli ilaç kullanımında değişiklik yapmadan önce diyetisyenine danış.')}
</div>`;

const hafta = `<div class="yigin">
<div id="bpHaftaBas"></div>
${kart({
    ikon: 'fa-calendar-week', baslik: '7 günlük öğün dökümü', metin: 'Bugünün satırı işaretli. Porsiyonlar plan kalemlerinin ölçüsüyle verilir.', bosluksuz: true,
    govde: '<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Haftalık menü"><table class="tablo panel"><caption class="yalniz-okuyucu">Haftanın günlük öğünleri</caption><thead id="bpHaftaBaslik"></thead><tbody id="bpHafta"></tbody></table></div>',
    alt: `${dugme('Menüyü yazdır', { ikon: 'fa-print', ek: ' id="bpYazdir"' })}${dugme('Alışveriş listesi', { sinif: 'birincil', ikon: 'fa-basket-shopping', ek: ' data-ac="#bpAlisveris"' })}`,
  })}
</div>`;

const ogun = `<div class="yigin">
<div id="bpOgunBas"></div>
${kart({
    ikon: 'fa-utensils', baslik: 'Öğün listesi', metin: '<span id="bpOgunOzet"></span>', bosluksuz: true,
    sag: '<div class="as-eylem"><span class="durum-hapi bekleyen" id="bpOgunSayac"></span></div>',
    govde: '<div class="kalem-liste" id="bpOgunler"></div>',
    alt: `<span class="eylem-notu" id="bpOgunNot"></span>${dugme('Diyetisyene not gönder', { ikon: 'fa-pen-to-square', ek: ' data-not-ac' })}${dugme('Alternatife geç', { ikon: 'fa-right-left', ek: ' data-sekme-git="alternatif"' })}${dugme('Kalan öğünleri işaretle', { sinif: 'birincil', ikon: 'fa-check-double', ek: ' id="bpHepsi"' })}`,
  })}
${kart({
    ikon: 'fa-chart-pie', baslik: 'Günün makro toplamı', metin: 'İşaretlenen öğünlerden hesaplanır. Hedef, günün plan toplamıdır.', bosluksuz: true,
    govde: '<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Günün makro toplamı"><table class="tablo panel"><caption class="yalniz-okuyucu">Alınan ve hedeflenen enerji ile makro besin ögeleri</caption><thead><tr><th scope="col">Besin ögesi</th><th scope="col" class="sag">Alınan</th><th scope="col" class="sag">Hedef</th><th scope="col" class="sag">Kalan</th></tr></thead><tbody id="bpMakro"></tbody></table></div>',
  })}
</div>`;

const alternatif = `<div class="yigin">
${bolumBas({ etiket: 'Bugün', ikon: 'fa-right-left', baslik: 'Öğün alternatifleri', metin: 'Her öğün için enerjisi en yakın tarifler. Seçtiğin alternatif bugünün planına yazılır.' })}
${kart({ ikon: 'fa-shuffle', baslik: 'Bugünün öğünleri', metin: 'Seçimini geri almak için öğünün yanındaki düğmeyi kullan.', bosluksuz: true, govde: '<div class="kalem-liste" id="bpAlternatif"></div>' })}
</div>`;

const tamamlanan = `<div class="yigin">
${bolumBas({ etiket: 'Arşiv', ikon: 'fa-box-archive', baslik: 'Tamamladığın programlar', metin: 'Sonuna kadar uyguladığın programlar ve uyum oranların.' })}
${kart({ bosluksuz: true, govde: '<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Tamamlanan programlar"><table class="tablo panel sabit"><caption class="yalniz-okuyucu">Tamamlanan programlar, süreleri ve uyum oranları</caption><thead><tr><th scope="col">Program</th><th scope="col" class="dar-kolon">Süre</th><th scope="col" class="dar-kolon">Tarih aralığı</th><th scope="col" class="dar-kolon">Uyum</th></tr></thead><tbody id="bpTamam"></tbody></table></div>' })}
</div>`;

const gecmis = `<div class="yigin">
${bolumBas({ etiket: 'Bütün hareketler', ikon: 'fa-clock-rotate-left', baslik: 'Program geçmişin', metin: 'Başlattığın, duraklattığın ve devam ettirdiğin programların tam kaydı.' })}
${kart({ ikon: 'fa-timeline', baslik: 'Hareket kaydı', metin: 'En yeni hareket üstte.', bosluksuz: true, govde: '<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Hareket kaydı"><table class="tablo panel sabit"><caption class="yalniz-okuyucu">Program hareketleri</caption><thead><tr><th scope="col" class="dar-kolon">Tarih</th><th scope="col">Program</th><th scope="col" class="dar-kolon">Hareket</th></tr></thead><tbody id="bpGecmis"></tbody></table></div>' })}
</div>`;

const sonEk = modal({
  id: 'bpNotModal', baslik: 'Diyetisyene not gönder', form: ' id="bpNotForm"',
  govde: '<div class="alan"><label class="alan-etiket" for="bpNotMetin">Notun <span class="zorunlu">*</span></label><textarea class="alan-metin" id="bpNotMetin" rows="4" required></textarea><p class="alan-yardim"><span>Not, diyetisyeninle mesajlarına da düşer.</span></p></div>',
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Gönder', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'bpAlisveris', baslik: 'Haftanın alışveriş listesi',
  govde: '<div class="kalem-liste" id="bpAlisverisListe"></div>',
  ayak: dugme('Kapat', { sinif: 'birincil', ek: ' data-kapat' }),
});

export default () => [uyeSayfa({
  yol: 'hesabim/beslenme-planim', ad: 'Beslenme Planım', muhur: 'Beslenme planın · kişisel alanın', ikon: 'fa-seedling',
  giris: 'Aktif programın, haftalık menün ve günlük öğünlerin burada; öğünlerini işaretle, uyumunu izle.',
  grup: 'bp',
  sekmeler: [
    { id: 'aktif', ad: 'Aktif Programım', ikon: 'fa-clipboard-check', govde: aktif },
    { id: 'hafta', ad: 'Haftalık Menüm', ikon: 'fa-calendar-week', govde: hafta },
    { id: 'ogun', ad: 'Günlük Öğünlerim', ikon: 'fa-utensils', govde: ogun },
    { id: 'alternatif', ad: 'Öğün Alternatifleri', ikon: 'fa-right-left', govde: alternatif },
    { id: 'tamamlanan', ad: 'Tamamlanan Programlar', ikon: 'fa-circle-check', govde: tamamlanan },
    { id: 'gecmis', ad: 'Program Geçmişim', ikon: 'fa-clock-rotate-left', govde: gecmis },
  ],
  sonEk, js: ['assets/js/sayfa/uye-beslenme-planim.js'],
})];
