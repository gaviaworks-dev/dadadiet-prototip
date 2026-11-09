/* Talep detayı: yazışma, yanıt, talebi kapatma */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU, G = window.DDG;
  /* Adreste numara yoksa listenin başındaki (son hareketi en yeni) talep açılır; ?bos=1'de liste boştur, boş durum görünür */
  const no = new URLSearchParams(location.search).get('no') || (G.talepler().slice().sort((a, b) => G.tkSon(b).localeCompare(G.tkSon(a)))[0] || {}).no;
  const bul = () => G.talepler().find((x) => x.no === no);
  const balon = (m) => '<div class="ayar-satir"><span class="as-ikon">' + G.i(m.kimden === 'uye' ? 'fa-user' : 'fa-headset') + '</span><div class="as-metin"><b>' + (m.kimden === 'uye' ? U.kac(U.uye().ad) : 'Dada Diet Destek') + '</b><span>' + U.kac(m.metin).replace(/\n/g, '<br>') + '</span></div><span class="as-acik">' + U.kisaTarih(m.tarih) + '</span></div>';
  function ciz() {
    const x = bul();
    if (!x) {
      U.bas('#tdGovde', U.bos({ ikon: 'fa-inbox', baslik: 'Talep bulunamadı', metin: 'Bu talep silinmiş ya da numarası yanlış olabilir.', eylem: U.bag('Taleplerime Dön', 'hesabim/cozum-merkezi/#taleplerim') }));
      return;
    }
    const kapali = x.durum === 'kapali' || x.durum === 'cozulen';
    document.title = x.baslik + ' · Dada Diet';
    document.querySelector('.kirinti-simdi').textContent = x.no;
    U.bas('#tdGovde', '<div class="yigin"><div class="kart panel tam-kolon"><div class="kart-bas"><div><h3 class="kart-baslik">' + G.i('fa-inbox') + ' ' + U.kac(x.baslik) + '</h3><p>' + U.kac(x.no) + ' · ' + U.kac(x.konu) + ' · açılış ' + U.tarih(x.tarih) + '</p></div>' + G.tkHap(x.durum) + '</div><div class="kart-govde bosluksuz"><div class="ayar-liste">' + x.mesajlar.map(balon).join('') + '</div></div></div>' +
      (kapali ? '<div class="alt-not">' + G.i('fa-lock') + '<span>Bu talep kapandı. Sorun sürüyorsa yeniden açabilir ya da <a href="' + DD.kok + 'hesabim/cozum-merkezi/#yeni">yeni talep</a> oluşturabilirsin.</span></div><div><button class="dugme hayalet" type="button" id="tdAc">' + G.i('fa-rotate-left') + ' Talebi Yeniden Aç</button></div>'
        : '<form class="kart panel tam-kolon" id="tdForm" novalidate><div class="kart-bas"><div><h3 class="kart-baslik">' + G.i('fa-reply') + ' Yanıt yaz</h3><p>Yanıtın talebe eklenir, destek ekibi sırayla döner.</p></div></div><div class="kart-govde"><div class="alan"><label class="alan-etiket" for="tdMesaj">Mesajın <span class="zorunlu">*</span></label><textarea class="alan-metin" id="tdMesaj" rows="4" maxlength="5000"></textarea><span class="alan-hata" id="tdHata">' + G.i('fa-circle-exclamation') + ' En az 3 karakter yaz.</span></div></div><div class="kart-alt eylem"><button class="dugme hayalet" type="button" id="tdKapat">' + G.i('fa-circle-check') + ' Sorunum Çözüldü</button><button class="dugme birincil" type="submit">' + G.i('fa-paper-plane') + ' Yanıtı Gönder</button></div></form>') + '</div>');
  }
  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'tdForm') return;
    e.preventDefault();
    const m = document.getElementById('tdMesaj').value.trim();
    document.getElementById('tdHata').classList.toggle('goster', m.length < 3);
    if (m.length < 3) return;
    const x = bul();
    x.mesajlar.push({ kimden: 'uye', tarih: U.bugun(), metin: m });
    x.durum = 'acik';
    U.kaydet(); ciz();
    DD.toast('Yanıtın talebe eklendi.');
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('#tdKapat')) { bul().durum = 'cozulen'; U.kaydet(); ciz(); DD.toast('Talep çözüldü olarak kapatıldı.'); }
    if (e.target.closest('#tdAc')) { bul().durum = 'acik'; U.kaydet(); ciz(); DD.toast('Talep yeniden açıldı.'); }
  });
  ciz();
})();
