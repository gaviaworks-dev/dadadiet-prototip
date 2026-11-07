import { uyeSayfa, kart, dugme, bilgi, modal } from '../../parcalar/uye/ust.mjs';

const aktif = `<div class="yigin" id="bpAktif">
<div class="cipler" id="bpKaynak" role="group" aria-label="Aktif program seçimi" data-suzgec hidden></div>
<div id="bpBas"></div>
<div id="bpNotKap"></div>
${kart({
    ikon: 'fa-chart-line', baslik: 'Programa uyum durumun', metin: 'Uyum, tamamlanan öğünlerin planlanan öğünlere oranıdır.',
    sag: `<div class="as-eylem">${dugme('Uyum dökümü', { sinif: 'hayalet kucuk', ikon: 'fa-table-list', ek: ' id="bpDokumDugme" aria-expanded="false" aria-controls="bpDokum"' })}</div>`,
    govde: '<div id="bpUyum"></div><div id="bpDokum" hidden></div>',
    alt: `${dugme('Programı duraklat', { ikon: 'fa-pause', ek: ' id="bpDuraklat"' })}${dugme('Diyetisyene not gönder', { ikon: 'fa-pen', ek: ' data-not-ac' })}${dugme('Bugünün öğünleri', { sinif: 'birincil', ikon: 'fa-utensils', ek: ' data-sekme-git="ogun"' })}`,
    id: 'bpUyumKart',
  })}
${kart({ ikon: 'fa-comments', baslik: 'Bu programda gönderdiğin notlar', metin: 'Diyetisyenine ilettiğin notlar mesajlarına da düşer.', bosluksuz: true, govde: '<div id="bpNotlar"></div>' })}
${bilgi('fa-user-doctor', 'Bu plan sana özel hazırlandı; gebelik, kronik hastalık ya da düzenli ilaç kullanımında değişiklik yapmadan önce diyetisyenine danış.')}
</div>`;

const hafta = `<div class="yigin">
<div id="bpHaftaBas"></div>
<div class="uyum-yer" data-bp-tercih></div>
${kart({
    ikon: 'fa-calendar-week', baslik: '7 Günlük Öğün Dökümü', metin: 'Bugünün satırı işaretli. Porsiyonlar plan kalemlerinin ölçüsüyle verilir.', bosluksuz: true,
    govde: '<ol class="hafta-plan" id="bpHafta" aria-label="Haftanın günlük öğünleri"></ol>',
    alt: `${dugme('Menüyü yazdır', { ikon: 'fa-print', ek: ' id="bpYazdir"' })}${dugme('Alışveriş listesi', { sinif: 'birincil', ikon: 'fa-basket-shopping', ek: ' data-ac="#bpAlisveris"' })}`,
  })}
</div>`;

const ogun = `<div class="yigin">
<div id="bpOgunBas"></div>
<div class="uyum-yer" data-bp-tercih></div>
${kart({
    ikon: 'fa-utensils', baslik: 'Öğün listesi', metin: '<span id="bpOgunOzet"></span>', bosluksuz: true,
    sag: '<div class="as-eylem"><span class="durum-hapi bekleyen" id="bpOgunSayac"></span></div>',
    govde: '<div class="kalem-liste" id="bpOgunler"></div>',
    alt: `<span class="eylem-notu" id="bpOgunNot"></span>${dugme('Diyetisyene not gönder', { ikon: 'fa-pen', ek: ' data-not-ac' })}${dugme('Alternatifler', { ikon: 'fa-right-left', ek: ' data-sekme-git="alternatif"' })}${dugme('Kalan öğünleri işaretle', { sinif: 'birincil', ikon: 'fa-check-double', ek: ' id="bpHepsi"' })}`,
  })}
${kart({
    ikon: 'fa-chart-pie', baslik: 'Günün makro toplamı', metin: 'İşaretlenen öğünlerden hesaplanır. Hedef, günün plan toplamıdır.', bosluksuz: true, id: 'bpMakroKart',
    govde: '<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Günün makro toplamı"><table class="tablo panel"><caption class="yalniz-okuyucu">Alınan ve hedeflenen enerji ile makro besin ögeleri</caption><thead><tr><th scope="col">Besin ögesi</th><th scope="col" class="sag">Alınan</th><th scope="col" class="sag">Hedef</th><th scope="col" class="sag">Kalan</th></tr></thead><tbody id="bpMakro"></tbody></table></div>',
  })}
</div>`;

const alternatif = `<div class="yigin">
${kart({ ikon: 'fa-shuffle', baslik: 'Bugünün öğünleri', metin: '<span id="bpAltMetin">Enerjisi en yakın tarifler. Seçtiğin alternatif bugünün planına yazılır; aynı düğmeye basmak geri alır.</span>', bosluksuz: true, govde: '<div class="kalem-liste" id="bpAlternatif"></div>' })}
</div>`;

const gecmis = `<div class="yigin">
${kart({ ikon: 'fa-box-archive', baslik: 'Tamamladığın programlar', bosluksuz: true, govde: '<div class="tablo-kap gomulu" tabindex="0" role="region" aria-label="Tamamlanan programlar"><table class="tablo panel sabit"><caption class="yalniz-okuyucu">Tamamlanan programlar, süreleri ve uyum oranları</caption><thead><tr><th scope="col">Program</th><th scope="col" class="dar-kolon">Süre</th><th scope="col" class="dar-kolon">Tarih aralığı</th><th scope="col" class="dar-kolon">Uyum</th></tr></thead><tbody id="bpTamam"></tbody></table></div>' })}
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
  yol: 'hesabim/beslenme-planim', ad: 'Beslenme Planım',
  giris: 'Bugünün öğünleri, haftalık menün ve diyetisyeninin planı.',
  eylem: dugme('Haftalık Menüm', { sinif: 'hayalet', ikon: 'fa-calendar-week', href: 'hesabim/haftalik-menum/' }),
  grup: 'bp',
  sekmeler: [
    { id: 'ogun', ad: 'Bugün', ikon: 'fa-utensils', govde: ogun },
    { id: 'hafta', ad: 'Hafta', ikon: 'fa-calendar-week', govde: hafta },
    { id: 'aktif', ad: 'Plan Özeti', ikon: 'fa-clipboard-check', govde: aktif },
    { id: 'alternatif', ad: 'Alternatifler', ikon: 'fa-right-left', govde: alternatif },
    { id: 'gecmis', ad: 'Geçmiş', ikon: 'fa-clock-rotate-left', govde: gecmis },
  ],
  sonEk, js: ['assets/js/tercih-uyum.js', 'assets/js/sayfa/uye-beslenme-planim.js'],
})];
