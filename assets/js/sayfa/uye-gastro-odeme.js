/* Ödeme adımı: ?paket=<id>. Gerçek kart formu yok, yalnız demo kayıtlı kart seçilir.
   Tamamlanınca satın alma Ödemelerim'e yazılır; Diyetisyenim ?paket= ile paketi bağlar, toast verir, randevu formunu açar. */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU, G = window.DDG;
  const id = new URLSearchParams(location.search).get('paket');
  const paketler = () => (U.d().paketler || []).filter((p) => p.aktif);
  const paket = paketler().find((p) => p.id === id);
  const bilgi = (p) => p.seans + ' görüşme · ' + p.sure + ' dk · ' + U.basHarf(p.tur);
  function secim() {
    const l = paketler();
    U.bas('#odemeGovde', '<div class="yigin"><div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik">' + G.i('fa-box-open') + ' Hangi paketi alacaksın?</h3><p>' + U.kac(G.diyetisyenAd()) + ' görüşme paketleri. Seçtiğin paket ödeme adımına geçer.</p></div></div><div class="kart-govde bosluksuz"><div class="ayar-liste">' + (l.map((p) => '<a class="ayar-satir" href="?paket=' + p.id + '"><span class="as-ikon">' + G.i('fa-box-open') + '</span><div class="as-metin"><b>' + U.kac(p.ad) + '</b><span>' + bilgi(p) + '</span></div><span class="as-eylem"><b>' + U.tl(p.fiyat) + '</b>' + G.i('fa-chevron-right') + '</span></a>').join('')) + '</div>' + (l.length ? '' : U.bos({ ikon: 'fa-box-open', baslik: 'Satışta paket yok', metin: 'Diyetisyenin yeni paket eklediğinde burada görünür.', eylem: U.bag('Diyetisyen Dizini', 'diyetisyenler/', 'hayalet') })) + '</div></div>' + (id ? '<div class="uyari-kutu">' + G.i('fa-triangle-exclamation') + '<span>Bu paket şu an satışta değil. Aşağıdan başka bir paket seçebilirsin.</span></div>' : '') + '</div>');
  }
  function odeme() {
    const kartlar = G.kartlar(), fb = G.faturaBilgi();
    const kartHtml = kartlar.length ? kartlar.map((k) => '<label class="secim-satir"><input class="secim-radyo" type="radio" name="odemeKart" value="' + k.id + '"' + (k.varsayilan ? ' checked' : '') + '><span><b>' + U.kac(G.kartAd(k)) + '</b> Son kullanma: ' + k.skt + (k.varsayilan ? ' · varsayılan' : '') + '</span></label>').join('')
      : U.bos({ ikon: 'fa-credit-card', baslik: 'Kayıtlı kartın yok', metin: 'Ödeme için önce Kayıtlı Kartlar’dan bir demo kart ekle.', eylem: U.bag('Demo Kart Ekle', 'hesabim/odemelerim/#kartlar') });
    U.bas('#odemeGovde', '<form class="siparis-duzen" id="odemeForm" novalidate><div class="yigin"><div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik">' + G.i('fa-box-open') + ' ' + U.kac(paket.ad) + '</h3><p>' + U.kac(paket.aciklama || '') + '</p></div><a class="dugme hayalet kucuk" href="?">Değiştir</a></div><div class="kart-govde"><div class="kutu-izgara"><div class="bilgi-kutu"><h4>' + G.i('fa-user-doctor') + ' Diyetisyen</h4><b>' + U.kac(G.diyetisyenAd()) + '</b><small>' + U.kac(((U.diyetisyen() || {}).uzmanlik || []).join(', ')) + '</small></div><div class="bilgi-kutu"><h4>' + G.i('fa-calendar-check') + ' Paket</h4><b>' + paket.seans + ' görüşme</b><small>' + paket.sure + ' dakika · ' + U.kac(U.basHarf(paket.tur)) + ' · ' + paket.sure_hafta + ' hafta</small></div></div></div></div>' +
      '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik">' + G.i('fa-credit-card') + ' Ödeme kartı</h3><p>Bu demoda kart bilgisi istenmez; kayıtlı demo kartlarından birini seçersin.</p></div><a class="dugme hayalet kucuk" href="' + DD.kok + 'hesabim/odemelerim/#kartlar">Kartlarım</a></div><div class="kart-govde"><div class="yigin sik">' + kartHtml + '</div></div></div>' +
      '<div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik">' + G.i('fa-receipt') + ' Fatura bilgisi</h3><p>' + U.kac(fb.ad) + ' · ' + U.kac(fb.eposta) + '</p></div><a class="dugme hayalet kucuk" href="' + DD.kok + 'hesabim/odemelerim/#faturalar">Düzenle</a></div></div></div>' +
      '<aside class="siparis-ozet"><div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik">' + G.i('fa-basket-shopping') + ' Sipariş özeti</h3></div></div><div class="kart-govde"><div class="ozet-satir"><span>' + U.kac(paket.ad) + '</span><span>' + U.tl(paket.fiyat) + '</span></div><div class="ozet-satir toplam"><span>Toplam</span><span>' + U.tl(paket.fiyat) + '</span></div><div class="yigin sik"><label class="onay-kutusu" for="odemeOnay"><input type="checkbox" id="odemeOnay"><span>Paket içeriğini ve <a href="' + DD.kok + 'yasal/">iade koşullarını</a> okudum, onaylıyorum.</span></label><button class="dugme birincil tam-en" type="submit" id="odemeBtn" disabled>' + G.i('fa-lock') + ' Ödemeyi Tamamla</button><p class="alan-yardim"><span>Görüşme ücreti Pro üyeliğe dâhil değildir. Bu demoda gerçek tahsilat yapılmaz.</span></p></div></div></div></aside></form>');
    const durum = () => { document.getElementById('odemeBtn').disabled = !document.getElementById('odemeOnay').checked || !kartlar.length; };
    document.getElementById('odemeOnay').addEventListener('change', durum);
    document.getElementById('odemeForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const s = document.querySelector('[name="odemeKart"]:checked');
      if (!s) { DD.toast('Bir kart seç.', 'hata'); return; }
      const k = kartlar.find((x) => x.id === s.value);
      G.satinAl(paket, k);
      document.getElementById('odemeBtn').disabled = true;
      location.href = DD.kok + 'hesabim/diyetisyenim/?paket=' + encodeURIComponent(paket.id) + '#randevu';
    });
  }
  if (paket) odeme(); else secim();
})();
