/* Diyetisyen hesabının onay durumu ve kazanç senkronu. Yalnız DD'ye bağlıdır, her panel sayfasına eklenebilir.
   Durum demo.diyetisyen.onay_durumu alanındadır; ?durum= adresi demo geçişidir. */
(function () {
  'use strict';
  const PBD = (window.PBD = {});
  const d = () => DD.demo.al();
  const kok = DD.kok + 'diyetisyen-paneli/';
  const kaydet = () => { DD.demo.kaydet(); if (window.PA && PA.kabukTazele) PA.kabukTazele(); };
  PBD.DURUMLAR = {
    onayli: { ad: 'Onaylı', hap: 'cozulen', ikon: 'fa-circle-check', baslik: 'Profilin yayında', metin: 'Danışanlar profilini görüyor ve açık saatlerinden randevu alabiliyor.' },
    'onay-bekliyor': { ad: 'Onay bekliyor', hap: 'bekleyen', ikon: 'fa-hourglass-half', baslik: 'Profilin onay bekliyor', metin: 'Belgelerin inceleniyor. Onaya kadar public profilin yayında değil ve yeni danışandan randevu alamazsın; mevcut danışanlarınla çalışabilirsin.' },
    'eksik-belge': { ad: 'Eksik belge', hap: 'hata', ikon: 'fa-file-circle-exclamation', baslik: 'Başvurunda eksik belge var', metin: 'Mesleki sorumluluk belgen eksik. Belge tamamlanmadan public profilin açılmaz ve yeni danışandan randevu alamazsın.' },
  };
  PBD.durum = () => (d().diyetisyen && d().diyetisyen.onay_durumu) || 'onayli';
  PBD.tanim = () => PBD.DURUMLAR[PBD.durum()];
  PBD.onayli = () => PBD.durum() === 'onayli';
  PBD.yeniRandevuAcik = () => PBD.onayli() && d().diyetisyen.yeni_randevu !== false;
  PBD.durumYaz = (yeni) => {
    const y = d().diyetisyen;
    if (y.onay_durumu === yeni) return;
    /* Onaysız dönemde yeni randevu kapanır; kullanıcının tercihi onayda geri gelir */
    if (yeni === 'onayli') { y.yeni_randevu = y.yeni_randevu_tercih !== false; delete y.yeni_randevu_tercih; } else if (PBD.onayli()) { y.yeni_randevu_tercih = y.yeni_randevu !== false; y.yeni_randevu = false; }
    y.onay_durumu = yeni;
    y.yayin = yeni === 'onayli';
    kaydet();
  };

  /* Görüşme sonucu kazanca yansır: tamamlanan görüşmenin işlemi yoksa yazılır, olmayan görüşmenin bekleyen işlemi düşer */
  const yuvarla = (v) => Math.round(v * 100) / 100;
  function ayYaz(k, ay, seans, gelir, komisyon) {
    let a = k.aylik.find((x) => x.ay === ay);
    if (!a) { a = { ay, seans: 0, gelir: 0, komisyon: 0, net: 0 }; k.aylik.push(a); }
    a.seans += seans; a.gelir += gelir; a.komisyon += komisyon; a.net += gelir - komisyon;
    k.toplam.seans += seans; k.toplam.gelir += gelir; k.toplam.komisyon += komisyon; k.toplam.net += gelir - komisyon;
  }
  PBD.kazancSenkron = () => {
    const v = d(), k = v.kazanclar;
    if (!k || !v.randevular) return 0;
    let degisen = 0;
    v.randevular.forEach((r) => {
      const durum = window.PA && PA.rDurum ? PA.rDurum(r) : r.durum, islem = k.son_islemler.find((x) => x.randevu_id === r.id);
      if (durum === 'tamamlandi' && !islem) {
        const p = v.paketler.find((x) => x.id === r.paket_id);
        if (!p) return;
        const tutar = yuvarla(p.fiyat / p.seans), komisyon = yuvarla(tutar * k.komisyon_orani), net = yuvarla(tutar - komisyon);
        k.son_islemler.push({ id: 'i-' + r.id, randevu_id: r.id, tarih: r.tarih, danisan_id: r.danisan_id, paket_id: r.paket_id, aciklama: p.ad + ' seansı', tutar, komisyon, net, durum: 'beklemede' });
        ayYaz(k, r.tarih.slice(0, 7), 1, tutar, komisyon);
        k.bekleyen_odeme.tutar += net; k.bekleyen_odeme.islem_sayisi += 1;
        degisen++;
      } else if ((durum === 'gelmedi' || durum === 'iptal') && islem && islem.durum === 'beklemede') {
        islem.durum = 'iptal';
        ayYaz(k, islem.tarih.slice(0, 7), -1, -islem.tutar, -islem.komisyon);
        k.bekleyen_odeme.tutar -= islem.net; k.bekleyen_odeme.islem_sayisi -= 1;
        degisen++;
      }
    });
    if (degisen) { k.son_islemler.sort((a, b) => b.tarih.localeCompare(a.tarih)); kaydet(); }
    return degisen;
  };

  /* Adres geçişi, üst çubuk fotoğrafı, profil dışındaki sayfalarda banner */
  const adres = new URLSearchParams(location.search).get('durum');
  if (adres && PBD.DURUMLAR[adres]) {
    PBD.durumYaz(adres);
    /* Geçiş bir kez uygulanır; yenileme sonraki durumu ezmesin */
    const u = new URL(location.href); u.searchParams.delete('durum'); history.replaceState(null, '', u);
  }
  function kabuk() {
    const foto = d().diyetisyen && d().diyetisyen.profil && d().diyetisyen.profil.foto;
    const av = document.querySelector('.panel-ust-ben .kisi-avatar');
    if (av && foto) av.innerHTML = '<img src="' + foto + '" alt="">';
    if (PBD.onayli() || document.getElementById('durumSerit') || document.querySelector('.durum-bant')) return;
    const bas = document.querySelector('.panel-bas');
    if (!bas) return;
    const t = PBD.tanim(), e = document.createElement('div');
    e.className = 'uyari-kutu uyari durum-bant';
    e.innerHTML = '<i class="fa-solid ' + t.ikon + '" aria-hidden="true"></i><span><b>' + t.baslik + '.</b> ' + t.metin + '</span><a class="dugme hayalet kucuk" href="' + kok + 'profil/' + (PBD.durum() === 'eksik-belge' ? '?sekme=belgeler' : '') + '">' + (PBD.durum() === 'eksik-belge' ? 'Belgeyi yükle' : 'Durumu gör') + '</a>';
    bas.insertAdjacentElement('afterend', e);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kabuk); else kabuk();
})();
