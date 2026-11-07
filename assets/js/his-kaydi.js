/* Günlük his kaydı: Programlarım ve Günlük Takibim aynı kartı basar.
   Kayıt oturumdaki danışanın his_kayitlari dizisine yazılır; panel aynı diziyi okur. Gün başına tek kayıt. */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const SECENEK = [['iyi', 'İyi'], ['normal', 'Normal'], ['yorgun', 'Yorgun'], ['bitkin', 'Bitkin'], ['halsiz', 'Halsiz'], ['bas-donmesi', 'Baş dönmesi'], ['carpinti', 'Çarpıntı']];
  const UYARI = {
    sakin: { sinif: 'uyari-kutu', rol: 'status', ikon: 'fa-circle-info', metin: 'Bu belirtiler sürüyorsa diyete ara ver ve bir diyetisyen ya da hekime danış.' },
    net: { sinif: 'uyari-kutu hata', rol: 'alert', ikon: 'fa-triangle-exclamation', metin: 'Diyete devam etme, bir hekime başvur.' },
  };
  const DUZEY = { yorgun: 'sakin', bitkin: 'sakin', halsiz: 'sakin', 'bas-donmesi': 'net', carpinti: 'net' };
  const HAP = { iyi: 'cozulen', normal: 'acik', sakin: 'bekleyen', net: 'hata' };

  /* ?bos=1 yeni üye ekranıdır: tohum kayıtlar görünmez, kayda da yazılmaz */
  if (U.bosKip) U.danisan().his_kayitlari = [];

  const liste = () => { const dn = U.danisan(); dn.his_kayitlari = dn.his_kayitlari || []; return dn.his_kayitlari; };
  const kayit = (tarih) => (liste().find((x) => x.tarih === tarih) || {}).his || null;
  const etiket = (his) => (SECENEK.find((x) => x[0] === his) || [])[1] || '';
  const kapananlar = () => U.yerel('hisUyariKapali', {});

  function uyariCiz(kok) {
    const yer = kok.querySelector('[data-his-uyari]'), b = U.bugun(), his = kayit(b), u = UYARI[DUZEY[his]];
    const goster = u && kapananlar()[b] !== his;
    yer.hidden = !goster;
    U.bas(yer, goster ? '<div class="' + u.sinif + '" role="' + u.rol + '"><i class="fa-solid ' + u.ikon + '" aria-hidden="true"></i><div class="yigin sik"><span>' + u.metin + '</span><div><button class="dugme hayalet kucuk" type="button" data-his-anladim>Anladım</button></div></div></div>' : '');
  }

  function bas(hedef) {
    const his = kayit(U.bugun());
    const kok = U.bas(hedef, '<div class="kart panel tam-kolon" data-his-kart><div class="kart-bas"><div><h3 class="kart-baslik"><i class="fa-solid fa-heart-pulse" aria-hidden="true"></i> Kendini nasıl hissediyorsun?</h3><p>Bugün için tek dokunuş yeter; gün içinde değişirse yeniden seçebilirsin.</p></div></div><div class="kart-govde"><div class="yigin sik"><div class="cipler" data-tek-secim data-his-secim role="group" aria-label="Bugün kendini nasıl hissediyorsun">'
      + SECENEK.map((x) => '<button class="cip" type="button" data-deger="' + x[0] + '" aria-pressed="' + (x[0] === his) + '">' + x[1] + '</button>').join('')
      + '</div><div data-his-uyari hidden></div></div></div></div>');
    if (kok) uyariCiz(kok);
  }

  document.addEventListener('dd:secim', (e) => {
    if (!e.target.closest || !e.target.closest('[data-his-secim]')) return;
    const b = U.bugun(), his = e.detail.deger, l = liste(), k = l.find((x) => x.tarih === b);
    if (k) k.his = his; else l.push({ tarih: b, his });
    delete kapananlar()[b];
    U.kaydet();
    uyariCiz(e.target.closest('[data-his-kart]'));
    if (!DUZEY[his]) DD.toast('Bugünkü kaydın alındı.');
    document.dispatchEvent(new CustomEvent('dd:his', { detail: { tarih: b, his } }));
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-his-anladim]')) return;
    const kok = e.target.closest('[data-his-kart]'), b = U.bugun();
    kapananlar()[b] = kayit(b);
    U.kaydet();
    uyariCiz(kok);
    kok.querySelector('[data-his-secim] [aria-pressed="true"]').focus();
  });

  DD.hisKaydi = {
    bas, kayit, etiket,
    /* Geçmiş tablosu için: kayıt yoksa boş döner */
    hap: (his) => (his ? U.durum(HAP[his] || HAP[DUZEY[his]], etiket(his)) : ''),
  };
})();
