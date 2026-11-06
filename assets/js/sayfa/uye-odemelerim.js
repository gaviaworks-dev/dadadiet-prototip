/* Ödemelerim: tahsilatlar demo.kazanclar içindeki üye işlemlerinden okunur */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU;
  const $ = (s) => document.querySelector(s);
  const islemler = () => ((U.d().kazanclar || {}).son_islemler || []).filter((x) => x.danisan_id === U.uyeId());
  const iadeler = () => U.yerel('iadeler', []);
  const bosSatir = (n, m) => '<tr><td colspan="' + n + '" class="bos-hucre">' + m + '</td></tr>';
  const hap = (d) => (d === 'odendi' ? U.durum('cozulen', 'Ödendi') : U.durum('bekleyen', 'Beklemede'));
  const faturaNo = (x) => 'DD-' + x.tarih.replace(/-/g, '') + '-' + x.id.toUpperCase();

  function ciz() {
    const l = islemler();
    U.bas('#odHizmet', l.map((x) => '<tr><td class="tarih">' + U.noktaliTarih(x.tarih) + '</td><td><span class="no">' + U.kac(x.aciklama) + '</span></td><td class="tutar sag">' + U.tl(x.tutar) + '</td><td>' + hap(x.durum) + '</td></tr>').join('') || bosSatir(4, 'Henüz diyetisyen tahsilatın yok.'));
    U.bas('#odFatura', l.map((x) => '<tr><td class="no">' + faturaNo(x) + '</td><td class="tarih">' + U.noktaliTarih(x.tarih) + '</td><td>' + U.kac(x.aciklama) + '</td><td class="tutar sag">' + U.tl(x.tutar) + '</td><td><button class="dugme hayalet kucuk" type="button" data-fatura="' + x.id + '">Detay</button></td></tr>').join('') || bosSatir(5, 'Henüz faturan yok.'));
    U.bas('#odKartlar', U.bos({ ikon: 'fa-credit-card', baslik: 'Kayıtlı kartın yok', metin: 'Ödeme sırasında kartını kaydedersen burada görünür.', eylem: U.bag('Paketlerime git', 'hesabim/paketler/', 'hayalet') }));
    U.bas('#odIadeler', iadeler().slice().reverse().map((i) => '<tr><td class="tarih">' + U.noktaliTarih(i.tarih) + '</td><td>' + U.kac(i.tahsilat) + '</td><td>' + U.kac(i.neden) + '</td><td>' + U.durum('bekleyen', 'İnceleniyor') + '</td></tr>').join('') || bosSatir(4, 'Henüz iade talebin yok.'));
    $('#odTahsilat').innerHTML = l.map((x) => '<option>' + U.kac(x.aciklama) + ' · ' + U.tl(x.tutar) + '</option>').join('');
    $('#odTahsilat').disabled = !l.length;
  }
  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-fatura]');
    if (f) {
      const x = islemler().find((y) => y.id === f.dataset.fatura);
      U.bas('#odDetayGovde', [['Fatura no', faturaNo(x)], ['Tarih', U.tarih(x.tarih)], ['Açıklama', x.aciklama], ['Tutar', U.tl(x.tutar)]].map((k) => '<div><dt>' + k[0] + '</dt><dd>' + U.kac(k[1]) + '</dd></div>').join(''));
      DD.ac('#odDetay');
    }
    if (e.target.closest('#odYazdir')) window.print();
  });
  $('#odIadeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#odTahsilat').disabled) { DD.toast('İade edilecek tahsilatın yok.', 'hata'); return; }
    iadeler().push({ tarih: U.bugun(), tahsilat: $('#odTahsilat').value, neden: $('#odNeden').value, aciklama: $('#odAciklama').value.trim() });
    U.kaydet(); e.target.reset(); ciz();
    DD.toast('İade talebin alındı.');
  });
  ciz();
})();
