/* Genel Bakış: sayaçlar, bugünün randevuları, yanıt bekleyenler, son mesajlar, ilerleme. */
(function () {
  'use strict';
  const DD = window.DD, PA = window.PA, h = PA.h;
  const $ = (id) => document.getElementById(id);
  const PRO = [
    ['icerik', 'fa-folder-open', 'Pro içerik kütüphanesi', 'Hazır diyet şablonları, makro hesaplı menü taslakları ve danışan eğitim PDF\'leri.'],
    ['indirim', 'fa-tags', 'Danışan indirimi', 'Paket ve kampanya indirimi tanımla, danışanlarına özel kod paylaş.'],
    ['profil', 'fa-arrow-trend-up', 'Öne çıkan profil', 'Diyetisyen listelerinde öncelikli sıralama ve profilinde Pro rozeti.'],
  ];
  const kpi = (ikon, etiket, sayi, sinif, ikon2, alt) => `<div class="kart kpi"><span class="ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><div class="govde"><span class="etiket">${etiket}</span><span class="sayi">${sayi}</span><span class="kpi-degisim ${sinif}"><i class="fa-solid ${ikon2}" aria-hidden="true"></i> ${alt}</span></div></div>`;
  const bos = (ikon, baslik, metin) => `<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><h3>${baslik}</h3><p>${metin}</p></div>`;

  /* İş listesi: talep kararı, onay ve talepler, ardından danışanların sıradaki adımı */
  let isTam = false;
  const isSatir = ({ dn, adim }) => `<div class="ayar-satir"><span class="as-ikon"><i class="fa-solid ${adim.ikon}" aria-hidden="true"></i></span><span class="as-metin"><b><a href="${PA.yol.danisan(dn.id)}">${h(dn.ad)}</a> · ${h(adim.baslik)}</b><span>${h(adim.metin)}</span></span><span class="as-eylem">${adim.ikincil ? `<button class="dugme hayalet kucuk tehlike" type="button" data-adim="${adim.ikincilIs}" data-danisan="${dn.id}">${adim.ikincil}</button>` : ''}${PA.adimEylem(adim, dn, adim.oncelik === 1 ? 'dugme birincil kucuk' : 'dugme hayalet kucuk')}</span></div>`;
  function isCiz() {
    const liste = PA.isListesi(), talep = liste.filter((x) => x.adim.oncelik === 1), kuyruk = PA.bekleyenler(), diger = liste.filter((x) => x.adim.oncelik > 2);
    const satirlar = [...talep.map(isSatir), ...kuyruk.map(PA.bekleyenSatir), ...diger.map(isSatir)];
    $('isListe').innerHTML = (isTam ? satirlar : satirlar.slice(0, 6)).join('') || bos('fa-circle-check', 'Bugünlük iş kalmadı', 'Yeni bir gelişme olduğunda burada görünür.');
    $('isOzet').textContent = satirlar.length ? satirlar.length + ' iş bekliyor, en acil olan üstte.' : 'Bekleyen iş yok.';
    $('isTum').hidden = satirlar.length <= 6;
    $('isTum').textContent = isTam ? 'Daralt' : 'Tümünü göster (' + satirlar.length + ')';
  }
  function ciz() {
    const d = PA.d(), bugun = PA.rBugun();
    const aktif = d.danisanlar.filter((x) => x.durum === 'aktif');
    const bekleyen = d.danisanlar.filter((x) => x.durum === 'yanit-bekliyor');
    const sonuc = d.randevular.filter((r) => PA.rDurum(r) === 'sonuc-bekliyor');
    const kalan = bugun.filter((r) => PA.rDurum(r) === 'dolu').length;
    const okunmamis = PA.okunmamis();
    const onay = bugun.filter((r) => PA.rDurum(r) === 'onay-bekliyor').length;
    isCiz();
    const eskiMesaj = d.mesajlar.filter((k) => k.okunmamis).map((k) => k.mesajlar[k.mesajlar.length - 1].zaman).sort()[0];
    $('gunOzeti').textContent = 'Günaydın ' + d.diyetisyen.ad.replace(/^Dyt\.\s*/, '').split(' ')[0] + '. ' + PA.gunAdi(DD.bugun) + ', ' + PA.tarih(DD.bugun) + '. Bugün ' + kalan + ' görüşmen kaldı, ' + okunmamis + ' okunmamış mesajın var.';
    $('sayaclar').innerHTML =
      kpi('fa-calendar-check', 'Bugünkü randevu', bugun.length, '', 'fa-hourglass-half', kalan + ' görüşme kaldı' + (onay ? ', ' + onay + ' onay' : '')) +
      kpi('fa-user-check', 'Aktif danışan', aktif.length, 'iyi', 'fa-users', d.danisanlar.length + ' kayıtlı danışan') +
      kpi('fa-comments', 'Okunmamış mesaj', okunmamis, okunmamis ? 'kotu' : '', 'fa-clock', eskiMesaj ? 'En eskisi ' + PA.tarih(eskiMesaj) + ' ' + eskiMesaj.slice(11, 16) : 'Hepsi okundu') +
      kpi('fa-star', 'Profil puanı', PA.sayi(d.diyetisyen.puan), 'iyi', 'fa-comment-dots', d.diyetisyen.degerlendirme_sayisi + ' değerlendirme (örnek)');

    $('bugunListe').innerHTML = bugun.length ? bugun.map((r) => {
      const dn = PA.danisan(r.danisan_id), durum = PA.rDurum(r);
      const sinif = durum === 'dolu' ? '' : ['sonuc-bekliyor', 'onay-bekliyor'].includes(durum) ? ' bekleyen' : ' gecti';
      const eylem = durum === 'onay-bekliyor' ? `<button class="dugme birincil kucuk" type="button" data-kuyruk-kabul="${r.id}">Onayla</button>` : durum === 'dolu' ? (r.talep ? `<button class="dugme hayalet kucuk" type="button" data-randevu="${r.id}">İncele</button>` : `<a class="dugme hayalet kucuk" href="${PA.yol.gorusme(r.id)}">Görüşmeyi başlat</a>`) : durum === 'sonuc-bekliyor' ? `<button class="dugme hayalet kucuk" type="button" data-randevu="${r.id}">Sonuç gir</button>` : `<button class="ikon-dugme" type="button" data-randevu="${r.id}" aria-label="${h(dn.ad)} randevusunu aç"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>`;
      return `<div class="ayar-satir"><span class="as-saat${sinif}">${r.saat}<small>${r.sure} dk</small></span><span class="as-metin"><b><a href="${PA.yol.danisan(dn.id)}">${h(dn.ad)}</a></b><span>${PA.rTur(r)}${r.not ? ' · ' + h(r.not) : ''}</span></span><span class="as-eylem">${PA.talepRozet(r) || PA.rHap(r)}${eylem}</span></div>`;
    }).join('') : bos('fa-calendar-xmark', 'Bugün randevu yok', 'Takvimden yeni bir görüşme oluşturabilirsin.');

    const konusmalar = d.mesajlar.filter((k) => k.mesajlar.length).sort((a, b) => (b.okunmamis ? 1 : 0) - (a.okunmamis ? 1 : 0) || b.mesajlar[b.mesajlar.length - 1].zaman.localeCompare(a.mesajlar[a.mesajlar.length - 1].zaman)).slice(0, 4);
    $('mesajListe').innerHTML = konusmalar.map((k) => {
      const dn = PA.danisan(k.danisan_id), m = k.mesajlar[k.mesajlar.length - 1];
      return `<a class="ayar-satir" href="${PA.yol.sohbet(dn.id)}">${PA.avatar(dn.ad)}<span class="as-metin"><b>${h(dn.ad)}</b><span>${m.kimden === 'diyetisyen' ? 'Sen: ' : ''}${h(m.metin)}</span></span><span class="as-eylem">${k.okunmamis ? `<span class="rozet bekleme">${k.okunmamis} okunmamış</span>` : ''}<span class="sohbet-liste-yan">${PA.zaman(m.zaman)}</span></span></a>`;
    }).join('');

    const sira = { 'Kontrol gecikti': 0, 'Hedefe yakın': 1, Yolunda: 2 };
    const ilerleyen = aktif.filter((x) => PA.ilerleme(x)).sort((a, b) => sira[PA.takip(a)] - sira[PA.takip(b)] || PA.ilerleme(b).yuzde - PA.ilerleme(a).yuzde).slice(0, 4);
    $('ilerlemeListe').innerHTML = ilerleyen.map((x) => {
      const i = PA.ilerleme(x), t = PA.takip(x);
      const rozet = t === 'Kontrol gecikti' ? '<span class="rozet bekleme">Kontrol gecikti</span>' : t === 'Hedefe yakın' ? '<span class="rozet olumlu">Hedefe yakın</span>' : `<span class="rozet pasif">%${i.yuzde}</span>`;
      return `<a class="ayar-satir" href="${PA.yol.danisan(x.id, 'olcum')}">${PA.avatar(x.ad)}<span class="as-metin"><b>${h(x.ad)}</b><span>${i.hafta}. hafta · ${PA.kgMetin(i.degisim)} · hedef ${PA.sayi(i.hedef)} kg</span>${PA.olcer(i.yuzde)}</span><span class="as-eylem">${rozet}</span></a>`;
    }).join('');
    PA.oranlar($('ilerlemeListe'));

    const hak = aktif.reduce((t, x) => t + (PA.kalanSeans(x) || 0), 0);
    const gecikti = aktif.filter((x) => PA.takip(x) === 'Kontrol gecikti').length;
    const yakin = aktif.filter((x) => PA.takip(x) === 'Hedefe yakın').length;
    const kalem = (ikon, b, s, href) => `<a class="ayar-satir" href="${href}"><span class="as-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><span class="as-metin"><b>${b}</b><span>${s}</span></span><i class="fa-solid fa-chevron-right as-ok" aria-hidden="true"></i></a>`;
    const haftaBas = PA.haftaBasi(DD.bugun), haftaSon = PA.ekle(haftaBas, 6);
    const hafta = d.randevular.filter((r) => PA.rAcik(r) && r.tarih >= haftaBas && r.tarih <= haftaSon).length;
    $('ozetListe').innerHTML =
      kalem('fa-ticket', hak + ' kalan görüşme hakkı', 'Aktif danışanların kullanmadığı seanslar', PA.yol.danisanlar + '?sekme=aktif') +
      kalem('fa-calendar-week', hafta + ' görüşme bu hafta', 'Tamamlanan ve planlı görüşmeler', PA.yol.takvim) +
      (sonuc.length ? kalem('fa-hourglass-half', sonuc.length + ' görüşmenin sonucu bekleniyor', 'Tamamlandı ya da Gelmedi olarak işaretle', PA.yol.takvim) : '') +
      (gecikti ? kalem('fa-clock-rotate-left', gecikti + ' kontrolü geciken danışan', 'Planlı randevusu yok, kontrol aralığı geçti', PA.yol.danisanlar + '?sekme=aktif') : '') +
      (yakin ? kalem('fa-flag-checkered', yakin + ' hedefe yakın danışan', 'İlerlemesi yüzde 80 ya da hedefe 1 kg içinde', PA.yol.danisanlar + '?sekme=aktif') : '');

    const talep = d.pro_talebi;
    $('proListe').innerHTML = PRO.map(([id, ikon, ad]) => `<button class="ayar-satir" type="button" data-pro="${id}"><span class="as-ikon"><i class="fa-solid ${ikon}" aria-hidden="true"></i></span><span class="as-metin"><b>${ad}</b><span>${talep ? 'Geçiş talebin alındı' : 'Pro ile açılır'}</span></span><i class="fa-solid fa-lock as-ok" aria-hidden="true"></i></button>`).join('');
  }

  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-randevu]');
    if (r) { PA.randevuDetay(r.dataset.randevu); return; }
    const p = e.target.closest('[data-pro]');
    if (p) {
      const k = PRO.find((x) => x[0] === p.dataset.pro);
      $('proBaslik').textContent = k[2];
      $('proGovde').innerHTML = `<div class="bos-durum kart-ici"><span class="bos-ikon"><i class="fa-solid ${k[1]}" aria-hidden="true"></i></span><h3>${k[2]}</h3><p>${h(k[3])}</p><span class="rozet bekleme"><i class="fa-solid fa-lock" aria-hidden="true"></i> Dada Diet Pro</span></div>`;
      const talep = PA.d().pro_talebi;
      $('proTalep').disabled = !!talep;
      $('proTalep').textContent = talep ? 'Talebin alındı' : "Pro'ya geçiş iste";
      DD.ac('#proPanel');
    }
  });
  $('proTalep').addEventListener('click', () => {
    PA.d().pro_talebi = DD.bugun;
    PA.olayEkle({ tur: 'Hesap', ikon: 'fa-crown', baslik: 'Pro geçiş talebin alındı', metin: 'Dada Diet ekibi seninle iletişime geçecek.', git: PA.yol.panel });
    PA.kaydet();
    DD.kapat($('proPanel'));
    DD.toast('Pro geçiş talebin alındı.');
    ciz();
  });
  $('isTum').addEventListener('click', () => { isTam = !isTam; isCiz(); });
  document.addEventListener('pa:degisti', ciz);
  ciz();
})();
