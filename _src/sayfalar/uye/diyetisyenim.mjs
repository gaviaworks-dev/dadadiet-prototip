import { uyeSayfa, bolumBas, kart, dugme, modal, tablo, alan } from '../../parcalar/uye/ust.mjs';

const randevuForm = (id, baslik, onek, buton, ust = '') => modal({
  id, baslik, form: ` id="${id}Form"`,
  govde: `${ust}<div class="alan-izgara c2">${alan({ ad: onek + 'Tarih', etiket: 'Tarih', tur: 'date', zorunlu: true })}<div class="alan"><label class="alan-etiket" for="${onek}Saat">Saat <span class="zorunlu">*</span></label><select class="alan-secim" id="${onek}Saat" name="${onek}Saat" required></select></div></div><p class="alan-yardim" id="${onek}Yardim"><span>Diyetisyeninin açık olduğu saatler listelenir.</span></p>`,
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme(buton, { sinif: 'birincil', tur: 'submit' }),
});

const sekmeler = [
  { id: 'bilgi', ad: 'Diyetisyen Bilgileri', ikon: 'fa-user-doctor', govde: `<div class="yigin">
${bolumBas({ etiket: 'Diyetisyenlerin', ikon: 'fa-user-doctor', baslik: 'Kimlerle Çalışıyorsun', metin: 'Aktif diyetisyenlerin. Her biriyle ayrı mesajlaşır, ayrı randevu oluşturursun.' })}
<div class="yigin" id="dyAktifler"></div>
<div class="yigin ayrik" id="dyGecmisBolum">
${bolumBas({ etiket: 'Sona erenler', ikon: 'fa-clock-rotate-left', baslik: 'Geçmiş Diyetisyenlerim', metin: 'Çalışman sona eren uzmanlar. Eski mesajlarını okuyabilir, istersen tekrar randevu alabilirsin.' })}
<div class="iki-kolon esit" id="dyGecmisler"></div>
</div>
</div>` },
  { id: 'hizmet', ad: 'Aldığım Hizmetler', ikon: 'fa-box-open', govde: `<div class="yigin">
${bolumBas({ etiket: 'Paketin', ikon: 'fa-box-open', baslik: 'Aldığın Hizmetler', metin: 'Diyetisyenlerinle yürüttüğün paketler ve kapsamı.', arac: dugme('Ödemelerime git', { href: 'hesabim/odemelerim/#hizmet' }) })}
${kart({ ikon: 'fa-receipt', baslik: 'Hizmet Dökümü', metin: '<span id="dyHizmetOzet"></span>', bosluksuz: true, govde: tablo({ id: 'dyHizmet', etiket: 'Aldığın hizmetler', basliklar: ['Hizmet', ['Tür', 'dar-kolon'], ['Seans', 'dar-kolon sag'], ['Tutar', 'dar-kolon sag'], ['Durum', 'dar-kolon'], ['Belge', 'eylem-kolon']] }), alt: dugme('Yeni hizmet al', { sinif: 'birincil', ikon: 'fa-plus', href: 'diyetisyen/dyt-ece-tunali/#paket' }) })}
</div>` },
  { id: 'randevu', ad: 'Randevularım', ikon: 'fa-calendar-check', sayi: 'randevu', govde: `<div class="yigin">
${bolumBas({ etiket: 'Randevuların', ikon: 'fa-calendar-check', baslik: 'Randevuların', metin: 'Sıradaki görüşmen ve bütün randevuların. İptal ve saat değişikliği talepleri diyetisyen onayına gider.', arac: dugme('Randevu oluştur', { sinif: 'birincil', ikon: 'fa-calendar-plus', ek: ' data-ac="#dyRandevu"' }) })}
<div id="dySiradaki"></div>
${kart({ ikon: 'fa-list', baslik: 'Bütün Randevuların', metin: 'Yaklaşan, tamamlanan, ertelenen ve iptal edilenler.', bosluksuz: true, govde: tablo({ id: 'dyRandevular', etiket: 'Bütün randevular', basliklar: [['Tarih', 'dar-kolon'], ['Saat', 'dar-kolon'], 'Görüşme', ['Durum', 'dar-kolon'], ['İşlem', 'eylem-kolon']] }) })}
${kart({ ikon: 'fa-timeline', baslik: 'Randevu İstek ve Hareketlerin', metin: 'Oluşturduğun, değiştirmek ya da iptal etmek istediğin randevuların kaydı. Son 8 hareket.', bosluksuz: true, govde: '<div class="ayar-liste" id="dyRandevuHareket"></div>' })}
</div>` },
  { id: 'gorusme', ad: 'Görüşme Geçmişim', ikon: 'fa-clock-rotate-left', govde: `<div class="yigin">
${bolumBas({ etiket: 'Tamamlananlar', ikon: 'fa-clock-rotate-left', baslik: 'Görüşme Geçmişin', metin: 'Tamamlanan görüşmelerin ve diyetisyenlerinin kısa notu.' })}
<div class="iki-kolon esit esit-boy" id="dyGorusmeSon"></div>
${kart({ ikon: 'fa-clipboard-check', baslik: 'Tamamlanan Görüşmeler', bosluksuz: true, govde: tablo({ id: 'dyGorusme', etiket: 'Tamamlanan görüşmeler', basliklar: [['Tarih', 'dar-kolon'], ['Durum', 'dar-kolon'], ['Görüşme notu', 'sol']] }) })}
</div>` },
  { id: 'mesaj', ad: 'Mesajlarım', ikon: 'fa-comments', sayi: 'mesaj', govde: `<div class="yigin">
${bolumBas({ etiket: 'Yazışmaların', ikon: 'fa-comments', baslik: 'Mesajların', metin: 'Her diyetisyenle ayrı yazışman. Geçmiş diyetisyenlerinle olan mesajlar yalnız okunur.' })}
<div class="kart tasma-kapali sohbet-kart"><div class="sohbet-kisiler" id="dyKisiler" role="group" aria-label="Yazışma seç"></div><div class="msj-kart-bas sohbet-bas"><span class="sohbet-mono buyuk ok" id="dyMono"></span><div class="sohbet-bas-kimlik"><h2 id="dySohbetAd"></h2><p class="sohbet-bas-alt" id="dySohbetAlt"></p></div></div><div class="msj-akis sohbet-akis" id="dyAkis"></div><form class="msj-yaz sohbet-yaz" id="dyMesajForm"><div class="sohbet-kunye" id="dyEkOnizleme" hidden></div><div class="sohbet-yaz-satir"><input type="file" id="dyEkDosya" accept="image/*,application/pdf,.pdf,.doc,.docx,.txt" hidden aria-hidden="true" tabindex="-1"><button class="sohbet-dugme-kucuk" type="button" id="dyEkSec" aria-label="Dosya ya da görsel ekle"><i class="fa-solid fa-paperclip" aria-hidden="true"></i></button><label class="yalniz-okuyucu" for="dyMesaj">Mesajın</label><textarea id="dyMesaj" rows="1" placeholder="Mesajını yaz"></textarea><button class="sohbet-dugme-kucuk gonder" type="submit" aria-label="Gönder"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></button></div></form><div class="kart-alt" id="dyMesajKapali" hidden></div></div>
</div>` },
  { id: 'not', ad: 'Diyetisyen Notları', ikon: 'fa-note-sticky', govde: `<div class="yigin">
${bolumBas({ etiket: 'Sana bırakılanlar', ikon: 'fa-note-sticky', baslik: 'Diyetisyen Notları', metin: 'Planına ve görüşmelerine eklenen, seninle paylaşılan notlar.' })}
<div id="dyNotSabit"></div>
${kart({ ikon: 'fa-clock-rotate-left', baslik: 'Önceki Notlar', metin: '<span id="dyNotSayi"></span>', govde: '<div class="akordeon tam-genis" id="dyNotlar"></div>' })}
</div>` },
  { id: 'dosya', ad: 'Diyetisyenden Gelen Dosyalar', ikon: 'fa-folder-open', govde: `<div class="yigin">
${bolumBas({ etiket: 'Dosya kutusu', ikon: 'fa-folder-open', baslik: 'Dosyaların', metin: 'Diyetisyenlerinin gönderdikleri ve senin paylaştıkların.', arac: dugme('Dosya paylaş', { sinif: 'birincil', ikon: 'fa-upload', ek: ' data-ac="#dyDosya"' }) })}
${kart({ ikon: 'fa-inbox', baslik: 'Diyetisyenlerinden Gelen Dosyalar', bosluksuz: true, govde: '<div class="ayar-liste sarar" id="dyGelen"></div>' })}
${kart({ ikon: 'fa-paper-plane', baslik: 'Senin Paylaştıkların', bosluksuz: true, govde: '<div class="ayar-liste" id="dyGiden"></div>' })}
</div>` },
  { id: 'hak', ad: 'Kalan Görüşme Haklarım', ikon: 'fa-ticket', govde: `<div class="yigin">
${bolumBas({ etiket: 'Görüşme hakların', ikon: 'fa-ticket', baslik: 'Kalan Görüşme Hakların', metin: 'Aktif paketlerindeki seans hakların ve kullanım geçmişin.' })}
${kart({ ikon: 'fa-ticket', baslik: 'Görüşme Hakların', govde: '<div id="dyHak"></div>', alt: dugme('Hakkı kullan, randevu oluştur', { sinif: 'birincil', ek: ' data-ac="#dyRandevu"' }) })}
${kart({ ikon: 'fa-timeline', baslik: 'Hak Kullanım Geçmişi', bosluksuz: true, govde: tablo({ id: 'dyHakGecmis', etiket: 'Hak kullanım geçmişi', basliklar: [['Tarih', 'dar-kolon'], 'Görüşme', ['Hak', 'dar-kolon']] }) })}
</div>` },
];

const turSecim = '<div class="alan"><label class="alan-etiket" for="yeniUzman">Diyetisyen</label><select class="alan-secim" id="yeniUzman"></select></div><div class="alan"><label class="alan-etiket" for="yeniTur">Görüşme türü</label><select class="alan-secim" id="yeniTur"><option value="online">Online</option><option value="yüz yüze">Yüz yüze</option></select></div>';
const sonEk = randevuForm('dyRandevu', 'Randevu Oluştur', 'yeni', 'Talebi gönder', turSecim) + randevuForm('dyErtele', 'Saat Değişikliği Talebi', 'ert', 'Talebi gönder') + modal({
  id: 'dyDosya', baslik: 'Dosya Paylaş', form: ' id="dyDosyaForm"',
  govde: '<div class="alan"><label class="alan-etiket" for="dyDosyaTur">Belge türü</label><select class="alan-secim" id="dyDosyaTur"><option>Tahlil sonucu</option><option>Rapor</option><option>Reçete</option><option>Vücut analizi çıktısı</option><option>Haftalık özet</option><option>Diğer</option></select></div><div class="alan"><label class="alan-etiket" for="dyDosyaGirdi">Dosya <span class="zorunlu">*</span></label><input class="alan-girdi" id="dyDosyaGirdi" type="file" required><p class="alan-yardim"><span>Dosya diyetisyeninle paylaşılır. En çok 10 MB.</span></p></div>',
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Paylaş', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'dyBildir', baslik: 'Mesajı Bildir', form: ' id="dyBildirForm"',
  govde: '<div class="not-kutu" id="dyBildirAlinti"></div><div class="alan"><label class="alan-etiket" for="dyBildirGerekce">Gerekçe <span class="zorunlu">*</span></label><select class="alan-secim" id="dyBildirGerekce" required><option value="">Gerekçe seç</option><option>Hakaret ya da taciz</option><option>Spam ya da reklam</option><option>Uygunsuz içerik</option><option>Kişisel veri isteği</option><option>Platform dışı ödeme isteği</option><option>Diğer</option></select></div><div class="alan"><label class="alan-etiket" for="dyBildirAciklama">Açıklama <span class="istege-bagli">(isteğe bağlı)</span></label><textarea class="alan-metin" id="dyBildirAciklama" rows="3" maxlength="1000"></textarea></div><div class="bilgi-notu"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><p>Bildirim Dada Diet moderasyon ekibine gider, diyetisyenine haber verilmez. Yazışman açık kalır.</p></div>',
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('Bildir', { sinif: 'birincil', tur: 'submit' }),
}) + modal({
  id: 'dyDosyaGor', baslik: '<span id="dyDosyaGorBaslik">Dosya</span>', govde: '<div id="dyDosyaGorGovde"></div>',
  ayak: dugme('Kapat', { sinif: 'birincil', ek: ' data-kapat' }),
}).replace('class="modal-kutu"', 'class="modal-kutu belge-modal"') + modal({
  id: 'dyIptal', baslik: 'Randevu İptal Talebi',
  govde: '<div class="okuma"><p id="dyIptalMetin"></p></div><label class="onay-kutusu" for="dyIptalKutu"><input type="checkbox" id="dyIptalKutu"><span>Randevunun iptal edileceğini ve diyetisyenime bildirileceğini anladım.</span></label><p class="durum-satir kapali" id="dyIptalKilit"><i class="fa-solid fa-lock" aria-hidden="true"></i> <span>Kutuyu işaretlemeden iptal talebi gönderilemez.</span></p>',
  ayak: dugme('Vazgeç', { ek: ' data-kapat' }) + dugme('İptal talebi gönder', { sinif: 'tehlike', ek: ' id="dyIptalOnay" disabled' }),
});

export default () => [uyeSayfa({
  yol: 'hesabim/diyetisyenim', ad: 'Diyetisyenim',
  giris: 'Diyetisyenlerinle olan her şey tek sayfada: hizmetlerin, randevuların, mesajların, notların ve dosyaların.',
  grup: 'dy', sekmeler, sonEk, js: ['assets/js/belge-kasa.js', 'assets/js/tercih-uyum.js', 'assets/js/sayfa/uye-menu-pdf.js', 'assets/js/sayfa/uye-diyetisyenim.js'],
})];
