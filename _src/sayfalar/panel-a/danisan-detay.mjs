// Her danışan için ayrı kart sayfası. İçerik demo durumundan panel-a-danisan.js ile dolar.
const a = (ad) => `assets/js/sayfa/panel-a-${ad}.js`;
const JS = [a('ortak'), 'assets/js/sayfa/panel-b-durum.js', a('randevu'), a('sohbet'), 'assets/js/tahlil-deger.js', a('rapor'), a('danisan')];
const SEKME = [['ozet', 'Özet'], ['olcum', 'Ölçümler'], ['tahlil', 'Tahliller'], ['not', 'Anamnez'], ['plan', 'Planlar'], ['mesaj', 'Mesajlar'], ['izin', 'İzinler']];
const sekmeler = SEKME.map(([id, ad], i) => `<button class="sekme${i ? '' : ' aktif'}" type="button" role="tab" id="t-${id}" aria-controls="p-${id}" aria-selected="${i ? 'false' : 'true'}">${ad}<span data-sekme-ek="${id}"></span></button>`).join('');
const panolar = SEKME.map(([id], i) => `<section id="p-${id}" role="tabpanel" aria-labelledby="t-${id}"${i ? ' hidden' : ''}></section>`).join('');

const drawer = (id, baslik, form, dugme) => `<div class="yan-panel-ortu" id="${id}" hidden><aside class="yan-panel" role="dialog" aria-modal="true" aria-labelledby="${id}B"><div class="yan-panel-bas"><h2 id="${id}B">${baslik}</h2><button class="ikon-dugme" type="button" aria-label="Kapat" data-kapat><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div><form class="yan-panel-govde" id="${id}Form" novalidate>${form}</form><div class="yan-panel-ayak"><button class="dugme hayalet" type="button" data-kapat>Vazgeç</button><button class="dugme birincil" type="submit" form="${id}Form">${dugme}</button></div></aside></div>`;
const alan = (id, etiket, tip = 'number', ek = '') => `<div class="alan"><label class="alan-etiket" for="${id}">${etiket}</label><input class="alan-girdi" id="${id}" type="${tip}" step="0.1" inputmode="decimal" autocomplete="off"${ek}></div>`;

const olcumForm = `<div class="alan"><label class="alan-etiket" for="oTarih">Tarih <span class="zorunlu" aria-hidden="true">*</span></label><input class="alan-girdi" id="oTarih" type="text" required placeholder="GG.AA.YYYY" autocomplete="off"></div>
<div class="alan-izgara c2">${alan('oKilo', 'Kilo (kg)')}${alan('oBel', 'Bel (cm)')}${alan('oKalca', 'Kalça (cm)')}${alan('oYag', 'Yağ oranı (%)')}</div>
<div class="alan"><label class="alan-etiket" for="oNot">Not <span class="istege-bagli">(isteğe bağlı)</span></label><textarea class="alan-metin" id="oNot" rows="3"></textarea></div>
<p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>Kayıtlı ölçüm silinmez, düzeltilir.</span></p>`;
const hedefForm = `<div class="alan"><label class="alan-etiket" for="hTur">Hedef türü</label><select class="alan-secim" id="hTur"><option>Kilo dengesi</option><option>Kiloyu korumak</option><option>Kilo almak</option><option>Kas kütlesini artırmak</option><option>Daha sağlıklı beslenmek</option></select></div>
<div class="alan-izgara c2">${alan('hBaslangic', 'Başlangıç kilosu (kg)')}${alan('hKilo', 'Hedef kilo (kg)')}</div>
<div class="alan"><label class="alan-etiket" for="hAralik">Kontrol aralığı (gün)</label><input class="alan-girdi" id="hAralik" type="number" min="1" step="1" autocomplete="off"></div>
<p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>Son görüşmeden bu yana kontrol aralığı geçen ve planlı randevusu olmayan danışan "Kontrol gecikti" sayılır.</span></p>`;

const notForm = `<div class="alan"><label class="alan-etiket" for="notMetin">Not <span class="zorunlu" aria-hidden="true">*</span></label><textarea class="alan-metin" id="notMetin" rows="6" required></textarea></div>
<div class="ayar-liste"><label class="ayar-satir"><span class="as-metin"><b>Danışanla paylaş</b><span>Not üye ekranında görünür.</span></span><span class="as-eylem"><span class="anahtar"><input type="checkbox" id="notPaylas" aria-label="Danışanla paylaş"><span class="anahtar-ray"></span></span></span></label><label class="ayar-satir"><span class="as-metin"><b>Sabitle</b><span>Listenin başında kalır.</span></span><span class="as-eylem"><span class="anahtar"><input type="checkbox" id="notSabit" aria-label="Sabitle"><span class="anahtar-ray"></span></span></span></label></div>`;
const hassasiyetForm = `<div class="alan"><label class="alan-etiket" for="hsMetin">Alerji ya da hassasiyet <span class="zorunlu" aria-hidden="true">*</span></label><input class="alan-girdi" id="hsMetin" type="text" required autocomplete="off"></div>`;
const degerForm = `<div class="alan"><label class="alan-etiket" for="vAd">Parametre <span class="zorunlu" aria-hidden="true">*</span></label><input class="alan-girdi" id="vAd" type="text" required autocomplete="off"></div>
<div class="alan-izgara c2">${alan('vSonuc', 'Sonuç', 'number', ' required')}<div class="alan"><label class="alan-etiket" for="vBirim">Birim</label><input class="alan-girdi" id="vBirim" type="text" autocomplete="off"></div>${alan('vAlt', 'Referans alt')}${alan('vUst', 'Referans üst')}</div>`;

const raporForm = `<div class="bilgi-notu" id="raporBilgi"></div>
<div class="alan" id="raporDonemAlan"><label class="alan-etiket" for="raporDonem">Ölçüm aralığı</label><select class="alan-secim" id="raporDonem"><option value="0">Bütün ölçümler</option><option value="12">Son 12 ölçüm</option><option value="8">Son 8 ölçüm</option><option value="4">Son 4 ölçüm</option></select></div>
<div class="alan"><label class="alan-etiket" for="raporNot">Diyetisyen notu <span class="zorunlu" aria-hidden="true">*</span></label><textarea class="alan-metin" id="raporNot" rows="7" maxlength="900" required></textarea><p class="alan-yardim"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span id="raporNotYardim"></span></p></div>`;

const govde = (d) => `<a class="geri-bag" href="{{kok}}diyetisyen-paneli/danisanlar/"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Danışanlarım</a>
<div class="panel-bas" id="danisanBas" data-danisan="${d.id}">
  <div><h1 id="danisanAd">${d.ad ?? 'Danışan'}</h1><p id="danisanAlt"></p></div>
  <div class="eylem-satiri">
    <button class="dugme hayalet" type="button" id="mesajGit"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Mesaj gönder</button>
    <button class="dugme hayalet" type="button" data-randevu-ac data-danisan="${d.id}"><i class="fa-solid fa-calendar-plus" aria-hidden="true"></i> Randevu oluştur</button>
    <a class="dugme birincil" href="{{kok}}diyetisyen-paneli/planlar/olustur/?danisan=${d.id}"><i class="fa-solid fa-plus" aria-hidden="true"></i> Yeni plan</a>
  </div>
</div>
<div id="kunyeKart" class="kunye-yer"></div>
<div class="detay-govde">
  <div class="sekmeler" role="tablist" aria-label="Danışan bölümleri" id="detaySekme">${sekmeler}</div>
  ${panolar}
</div>
${drawer('olcumPanel', 'Ölçüm ekle', olcumForm, 'Ölçümü kaydet')}
${drawer('hedefPanel', 'Hedefi güncelle', hedefForm, 'Hedefi kaydet')}
${drawer('degerPanel', 'Değer ekle', degerForm, 'Değeri ekle')}
${drawer('notPanel', 'Klinik not ekle', notForm, 'Notu kaydet')}
${drawer('hassasiyetPanel', 'Alerji ya da hassasiyet ekle', hassasiyetForm, 'Ekle')}
${drawer('raporPanel', 'PDF Rapor', raporForm, '<i class="fa-solid fa-download" aria-hidden="true"></i> PDF indir')}`;

export default ({ veri }) => {
  const liste = [...(veri.demo?.danisanlar ?? [])];
  /* Yeni talep danışanları tohumdan gelir; demo.json'a alınınca aynı kayıt tekrar üretilmez */
  ['d13', 'd14'].forEach((id) => { if (!liste.some((d) => d.id === id)) liste.push({ id }); });
  return liste.map((d) => ({
    yol: `diyetisyen-paneli/danisanlar/${d.id}`,
    meta: { baslik: d.ad ?? 'Danışan', duzen: 'panel', aktif: 'danisanlar', js: JS },
    govde: govde(d),
  }));
};
