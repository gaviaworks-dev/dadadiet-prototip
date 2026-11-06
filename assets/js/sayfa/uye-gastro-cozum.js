/* Çözüm Merkezi: talep listesi ve süzgeç, yeni talep, sık sorulanlar, öneri formu */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU, G = window.DDG;
  const $ = (s) => document.querySelector(s);
  const BOY = 10;
  let suz = 'tumu', sayfa = 1;
  const satir = (x) => '<a class="ayar-satir" href="' + DD.kok + 'hesabim/cozum-merkezi/talep/?no=' + encodeURIComponent(x.no) + '"><span class="as-ikon">' + G.i(G.TK[x.durum][2]) + '</span><div class="as-metin"><b>' + U.kac(x.baslik) + '</b><span>' + G.i('fa-hashtag') + ' ' + U.kac(x.no) + ' · ' + U.kac(x.konu) + ' · son hareket ' + U.tarih(G.tkSon(x)) + ' · ' + x.mesajlar.length + ' mesaj</span></div><span class="as-eylem">' + G.tkHap(x.durum) + G.i('fa-chevron-right') + '</span></a>';
  function sayfaCiz(n, toplam) {
    const kap = $('#tkSayfa'), s = Math.ceil(toplam / BOY) || 1;
    kap.hidden = $('#tkSayfaNot').hidden = toplam <= BOY;
    if (toplam <= BOY) return;
    const dgm = (ic, h, ek, ok) => '<button class="sayfa-dugme' + (ok ? ' ok' : '') + ek + '" type="button" data-sayfa="' + h + '"' + (h < 1 || h > s ? ' disabled' : '') + '>' + ic + '</button>';
    let h = dgm(G.i('fa-chevron-left'), n - 1, '', true);
    for (let i = 1; i <= s; i++) h += dgm(i, i, i === n ? ' aktif' : '');
    kap.innerHTML = h + dgm(G.i('fa-chevron-right'), n + 1, '', true);
    $('#tkSayfaNot').textContent = toplam + ' talepten ' + ((n - 1) * BOY + 1) + '–' + Math.min(n * BOY, toplam) + ' arası gösteriliyor';
  }
  function liste() {
    const tum = G.talepler().slice().sort((a, b) => G.tkSon(b).localeCompare(G.tkSon(a)));
    const l = tum.filter((x) => suz === 'tumu' || x.durum === suz);
    document.querySelectorAll('[data-tk-say]').forEach((e) => { const k = e.dataset.tkSay; e.textContent = k === 'tumu' ? tum.length : tum.filter((x) => x.durum === k).length; });
    document.querySelectorAll('#tkFiltre .sekme').forEach((e) => e.classList.toggle('aktif', e.dataset.durum === suz));
    const akis = tum.filter((x) => x.durum === 'acik' || x.durum === 'yanit');
    $('#tkOzet').hidden = !akis.length;
    U.bas('#tkAkis', akis.map(satir).join(''));
    U.bas('#tkSay', '<b>' + l.length + '</b> talep gösteriliyor. Süzgeç: ' + (suz === 'tumu' ? 'tümü' : G.TK[suz][0].toLocaleLowerCase('tr')) + '.');
    const s = Math.max(1, Math.min(sayfa, Math.ceil(l.length / BOY) || 1));
    sayfa = s;
    U.bas('#tkListe', l.slice((s - 1) * BOY, s * BOY).map(satir).join(''));
    const bos = $('#tkBos');
    bos.hidden = !!l.length;
    if (!l.length) U.bas(bos, tum.length
      ? U.bos({ ikon: 'fa-filter-circle-xmark', baslik: 'Bu durumda talebin yok', metin: 'Seçtiğin durumda görüntülenecek bir talep bulunmuyor. Başka bir duruma bakabilirsin.', eylem: '<button class="dugme birincil kucuk" type="button" data-durum-sifirla>' + G.i('fa-layer-group') + ' Tüm talepleri göster</button>' })
      : U.bos({ ikon: 'fa-inbox', baslik: 'Henüz destek talebin yok', metin: 'Bir sorun yaşarsan ya da bir şey sormak istersen ilk talebini buradan açabilirsin.', eylem: '<a class="dugme birincil kucuk" href="#yeni" data-sekme-git="yeni">' + G.i('fa-plus') + ' Yeni destek talebi</a>' }));
    sayfaCiz(s, l.length);
  }
  document.addEventListener('click', (e) => {
    const f = e.target.closest('#tkFiltre .sekme');
    if (f) { suz = f.dataset.durum; sayfa = 1; liste(); return; }
    if (e.target.closest('[data-durum-sifirla]')) { suz = 'tumu'; sayfa = 1; liste(); return; }
    const p = e.target.closest('[data-sayfa]');
    if (p && !p.disabled) { sayfa = Number(p.dataset.sayfa); liste(); }
  });

  /* Yeni talep: konu bağlam alanı açar */
  const RANDEVU = ['Diyetisyen ve randevu'], ODEME = ['Ödeme sorunu', 'Fatura talebi', 'İptal ve iade', 'Pro abonelik'];
  $('#tkRandevu').innerHTML = '<option value="">Seçme</option>' + U.randevular().map((r) => '<option>' + U.noktaliTarih(r.tarih) + ' · ' + r.saat + ' · ' + U.kac(U.basHarf(r.tur)) + '</option>').join('');
  $('#tkOdeme').innerHTML = '<option value="">Seçme</option>' + G.faturalar().map((x) => '<option>' + U.kac(x.no) + '</option>').join('');
  $('#tkKonu').addEventListener('change', (e) => {
    const r = RANDEVU.includes(e.target.value), o = ODEME.includes(e.target.value);
    $('#tkRandevuAlan').hidden = !r; $('#tkOdemeAlan').hidden = !o; $('#tkBaglam').hidden = !r && !o;
  });
  $('#tkMesaj').addEventListener('input', (e) => { $('#tkMesajSay').textContent = e.target.value.length + '/5000'; });
  $('#tkEk').addEventListener('change', (e) => {
    const d = e.target.files[0];
    if (d && d.size > 5 * 1024 * 1024) { e.target.value = ''; DD.toast('Dosya 5 MB’tan büyük olamaz.', 'hata'); }
    const v = e.target.files[0];
    $('#tkEkAd').textContent = v ? v.name : 'Dosya seçilmedi';
    $('#tkEkSil').hidden = !v;
  });
  $('#tkEkSil').addEventListener('click', () => { $('#tkEk').value = ''; $('#tkEkAd').textContent = 'Dosya seçilmedi'; $('#tkEkSil').hidden = true; });
  const hata = (id, v) => document.getElementById(id).classList.toggle('goster', v);
  $('#tkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const k = $('#tkKonu').value, b = $('#tkBaslik').value.trim(), m = $('#tkMesaj').value.trim();
    hata('tkKonuHata', !k); hata('tkBaslikHata', b.length < 3); hata('tkMesajHata', m.length < 10);
    if (!k || b.length < 3 || m.length < 10) return;
    const l = U.yerel('destekTalepleri', G.talepler());
    const no = 'DD-2026-' + Date.now().toString(36).slice(-6).toUpperCase();
    const baglam = [$('#tkRandevu').value, $('#tkOdeme').value].filter((x, i) => x && !(i ? $('#tkOdemeAlan').hidden : $('#tkRandevuAlan').hidden)).join(' · ');
    l.unshift({ no, baslik: b, konu: k, durum: 'acik', tarih: U.bugun(), mesajlar: [{ kimden: 'uye', tarih: U.bugun(), metin: m + (baglam ? '\n\nİlgili kayıt: ' + baglam : '') }] });
    U.kaydet();
    e.target.reset();
    $('#tkEkAd').textContent = 'Dosya seçilmedi'; $('#tkEkSil').hidden = true;
    $('#tkMesajSay').textContent = '0/5000';
    $('#tkBaglam').hidden = true;
    suz = 'tumu'; sayfa = 1; liste();
    document.getElementById('destek-tab-taleplerim').click();
    DD.toast(no + ' numaralı talebin açıldı.');
  });

  /* Sık sorulanlar */
  let kat = 0;
  const kume = () => [...document.querySelectorAll('[data-kat-liste]')];
  const nt = (s) => s.toLocaleLowerCase('tr');
  function faq() {
    const a = nt($('#faqAra').value.trim());
    $('#faqTemizle').hidden = !a;
    let toplam = 0;
    kume().forEach((k, n) => {
      const kalem = [...k.querySelectorAll('[data-soru]')];
      if (a) { let v = 0; kalem.forEach((x) => { const u = nt(x.textContent).includes(a); x.hidden = !u; if (u) v++; }); k.hidden = !v; toplam += v; }
      else { kalem.forEach((x) => { x.hidden = false; }); k.hidden = n !== kat; if (n === kat) toplam = kalem.length; }
    });
    document.querySelectorAll('#faqSekme .sekme').forEach((b) => b.classList.toggle('aktif', !a && Number(b.dataset.kat) === kat));
    U.bas('#faqNot', a ? '<b>“' + U.kac($('#faqAra').value.trim()) + '”</b> için ' + toplam + ' soru' : '<b>' + U.kac(kume()[kat].dataset.ad) + '</b>: ' + toplam + ' soru');
    const bos = $('#faqBos');
    bos.hidden = !!toplam;
    if (!toplam) U.bas(bos, U.bos({ ikon: 'fa-magnifying-glass', baslik: 'Aramana uyan soru yok', metin: 'Farklı bir kelime dene ya da sorunu bize yaz.', eylem: '<a class="dugme birincil kucuk" href="#yeni" data-sekme-git="yeni">' + G.i('fa-plus') + ' Yeni Destek Talebi</a>' }));
  }
  $('#faqAra').addEventListener('input', faq);
  $('#sssArama').addEventListener('submit', (e) => e.preventDefault());
  $('#faqTemizle').addEventListener('click', () => { $('#faqAra').value = ''; faq(); });
  document.addEventListener('click', (e) => { const b = e.target.closest('#faqSekme .sekme'); if (b) { kat = Number(b.dataset.kat); $('#faqAra').value = ''; faq(); } });

  /* Öneri ve şikâyet */
  const u = U.uye(), p = (u.ad || '').split(' ');
  $('#conAd').value = p.slice(0, -1).join(' ') || p[0] || '';
  $('#conSoyad').value = p.length > 1 ? p[p.length - 1] : '';
  $('#conEposta').value = G.eposta();
  $('#conTel').value = u.telefon || '';
  $('#conMesaj').addEventListener('input', (e) => { $('#conSay').textContent = e.target.value.length + '/1000'; });
  $('#conForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const eksik = ['conAd', 'conSoyad', 'conEposta', 'conTur', 'conAlan'].filter((i) => { const a = document.getElementById(i), h = !a.value.trim(); a.classList.toggle('hatali', h); return h; });
    const m = $('#conMesaj').value.trim();
    hata('conMesajHata', m.length < 10);
    if (eksik.length || m.length < 10) { DD.toast('Zorunlu alanları doldur.', 'hata'); return; }
    if (!$('#conKvkk').checked) { DD.toast('KVKK metnini onayla.', 'uyari'); return; }
    U.yerel('oneriKutusu', []).unshift({ tarih: U.bugun(), tur: $('#conTur').value, alan: $('#conAlan').value, mesaj: m });
    U.kaydet();
    const tur = $('#conTur').value;
    $('#conTur').value = ''; $('#conAlan').value = ''; $('#conMesaj').value = ''; $('#conKvkk').checked = false; $('#conSay').textContent = '0/1000';
    const s = $('#conSonuc');
    s.querySelector('span').textContent = tur + ' mesajın alındı. Cevabımız ' + $('#conEposta').value + ' adresine gelir.';
    s.hidden = false;
    DD.toast('Mesajın alındı.');
  });
  liste(); faq();
})();
