/* Ödemelerim: abonelik, diyetisyen ödemeleri, faturalar, kartlar, iade */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU, G = window.DDG;
  const $ = (s) => document.querySelector(s);
  const katalog = G.katalog('gKademe');
  const bosHucre = (n, m) => '<tr><td colspan="' + n + '" class="bos-hucre">' + m + '</td></tr>';
  const ucretli = () => G.kademeAl().kademe !== 'ucretsiz';

  /* Abonelik */
  function abonelik() {
    const a = G.kademeAl(), k = katalog.find((x) => x.kod === a.kademe) || katalog[0], kart = G.kartlar();
    U.bas('#odAbone', G.paketKarti(katalog, 'odeme'));
    const ac = ucretli();
    $('#odYenile').disabled = !ac;
    $('#odYenile').checked = ac && a.yenileme && !a.iptal;
    $('#odYenileNot').textContent = !ac ? 'Ücretsiz kademede yenilenecek bir abonelik yok.' : 'Kapatırsan ' + k.ad + ' üyeliğin ' + U.tarih(G.DONEM.bit) + ' tarihinde sona erer.';
    const sec = $('#odKart');
    sec.innerHTML = kart.length ? kart.map((x) => '<option value="' + x.id + '"' + (x.id === a.kart ? ' selected' : '') + '>' + U.kac(G.kartAd(x)) + '</option>').join('') : '<option>Kayıtlı kart yok</option>';
    sec.disabled = !ac || !kart.length;
    $('#odIptalUyari').innerHTML = ac ? '<b>Uyarı:</b> iptal edersen gelişmiş programlar ve kişisel beslenme planı <b>' + U.tarih(G.DONEM.bit) + '</b> tarihinde kapanır ve hesabın Ücretsiz kademeye döner. Günlük kayıtların, ölçümlerin ve rozetlerin <b>silinmez</b>.' : '<b>Ücretsiz kademede</b> dondurulacak ya da iptal edilecek bir abonelik yok. Bu kutu ücretli kademede açılır.';
    $('#odDondurSure').disabled = $('#odIptalNeden').disabled = $('#odIptalOnay').disabled = !ac;
    $('#odDondurBtn').disabled = !ac;
    $('#odDondurBtn').lastChild.textContent = a.dondurma ? ' Dondurmayı Kaldır' : ' Aboneliği Dondur';
    iptalDurum();
  }
  function iptalDurum() {
    const a = G.kademeAl(), onay = $('#odIptalOnay').checked, ac = ucretli();
    $('#odIptalBtn').disabled = !onay || !ac || a.iptal;
    $('#odIptalDurum').hidden = onay && ac && !a.iptal;
    $('#odIptalDurum span').textContent = !ac ? 'Düğme kapalı: ücretsiz kademede iptal yok.' : a.iptal ? 'Aboneliğin dönem sonunda bitecek.' : 'Düğme kapalı: iptal için önce onay kutusunu işaretle.';
  }
  $('#odYenile').addEventListener('change', (e) => {
    const a = G.kademeAl();
    a.yenileme = e.target.checked;
    if (e.target.checked) a.iptal = false;
    U.kaydet(); abonelik();
    G.sonuc('odYenileSonuc', e.target.checked ? 'Otomatik yenileme açıldı.' : 'Otomatik yenileme kapandı; üyeliğin dönem sonunda biter.');
  });
  $('#odKart').addEventListener('change', (e) => {
    G.kademeAl().kart = e.target.value;
    U.kaydet();
    G.sonuc('odYenileSonuc', 'Yenilemede kullanılacak kart: ' + e.target.selectedOptions[0].textContent + '.');
  });
  const KODLAR = { DENGE25: '%25 indirim · 3 ay', YENIBASLA: 'İlk ay ücretsiz', YIL2026: 'Yıllık geçişte 2 ay bedava' };
  $('#odPromoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const k = $('#odPromoKod').value.trim().toLocaleUpperCase('tr').replace(/İ/g, 'I');
    if (!k) { G.sonuc('odPromoSonuc', 'Doğrulamak için bir kod yaz.', 'fa-circle-exclamation'); return; }
    if (!KODLAR[k]) { G.sonuc('odPromoSonuc', k + ' kodu tanınmadı.', 'fa-circle-xmark'); return; }
    G.kademeAl().kod = k; U.kaydet();
    G.sonuc('odPromoSonuc', k + ' geçerli: ' + KODLAR[k] + '. Kod bir sonraki tahsilata uygulanır.');
  });
  $('#odIptalOnay').addEventListener('change', iptalDurum);
  $('#odDondurBtn').addEventListener('click', () => {
    const a = G.kademeAl();
    a.dondurma = a.dondurma ? '' : $('#odDondurSure').value;
    U.kaydet(); abonelik();
    G.sonuc('odIptalSonuc', a.dondurma ? 'Aboneliğin ' + a.dondurma + ' süreyle donduruldu.' : 'Dondurma kaldırıldı, aboneliğin yeniden etkin.');
  });
  $('#odIptalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$('#odIptalOnay').checked || !ucretli()) return;
    const a = G.kademeAl();
    a.iptal = true; a.yenileme = false;
    U.kaydet();
    $('#odIptalOnay').checked = false;
    abonelik();
    G.sonuc('odIptalSonuc', 'İptal talebin alındı. Erişimin ' + U.tarih(G.DONEM.bit) + ' tarihine kadar sürer.');
  });

  /* Diyetisyen ödemeleri */
  const belge = (no) => '<button class="dugme satir" type="button" data-fatura="' + U.kac(no) + '">' + G.i('fa-file-invoice') + ' Detay</button>';
  const uzmanHucre = (x) => '<span class="no">' + U.kac(G.diyetisyenAd()) + '<small>' + U.kac(x.ad) + '</small></span>';
  function paketSatir(x, hak) {
    const dy = U.diyetisyen() || {}, gecmis = x.bitti || hak.kalan === 0;
    const oran = x.seans ? Math.round((hak.kullanilan / x.seans) * 100) : 0;
    const profil = DD.kok + 'diyetisyen/' + (dy.slug || U.uye().diyetisyen_slug) + '/';
    return '<div class="paket-satiri"><span class="avatar harf" aria-hidden="true">' + U.kac(dy.harf || 'D') + '</span><div class="bilgi"><b>' + U.kac(G.diyetisyenAd()) + ' ' + (gecmis ? U.durum('kapali', 'Tamamlandı') : U.durum('cozulen', 'Aktif', 'fa-circle-check')) + '</b><span class="plan">' + U.kac(x.ad) + ' · ' + x.seans + ' görüşmelik paket</span><span class="not">' + G.i('fa-video') + ' ' + x.seans + ' görüşmeden ' + hak.kullanilan + ' tanesi kullanıldı · ' + (hak.kalan ? hak.kalan + ' görüşme hakkın duruyor' : 'hak kalmadı') + '</span><div class="olcer hap" role="img" aria-label="' + x.seans + ' görüşmeden ' + hak.kullanilan + ' tanesi kullanıldı"><span data-oran="' + oran + '"></span></div><span class="not">' + G.i('fa-circle-info') + ' ' + (gecmis ? U.tarih(x.tarih) + ' – ' + U.tarih(x.bitis || x.tarih) + ' · fatura ' + U.kac(x.no) : U.tarih(x.tarih) + ' tarihinde satın alındı · hak bitince paket kapanır') + '</span></div><div class="fiyat"><b>' + U.tl(x.tutar) + '</b><span>' + x.seans + ' görüşme</span></div><div class="eylemler">' + (gecmis ? '<a class="satir-dugme" href="' + profil + '">' + G.i('fa-rotate-right') + ' Tekrar Çalış</a>' : '<a class="satir-dugme" href="' + DD.kok + 'hesabim/diyetisyenim/#randevu">' + G.i('fa-calendar-check') + ' Randevu Al</a><a class="satir-dugme" href="' + profil + '">' + G.i('fa-arrow-right') + ' Profil</a>') + '</div></div>';
  }
  function hizmet() {
    const l = G.hizmetler(), hak = G.haklar();
    const tek = l.filter((x) => x.tip === 'tek');
    $('#odTekSay').textContent = tek.length + ' görüşme';
    U.bas('#odTek', tek.map((x) => '<tr><td>' + uzmanHucre(x) + '</td><td class="tarih">' + U.noktaliTarih(x.tarih) + '</td><td class="tutar">' + U.tl(x.tutar) + '</td><td>' + G.hap(x.durum) + '</td><td>' + belge(x.no) + '</td></tr>').join('') || bosHucre(5, 'Henüz tek görüşme ödemen yok.'));
    const paket = l.filter((x) => x.tip === 'paket'), biten = (x) => x.bitti || hak[x.id].kalan === 0;
    const aktif = paket.filter((x) => !biten(x)), gecmis = paket.filter(biten);
    $('#odPaketSay').textContent = aktif.length + ' paket';
    const yeni = '<a class="dugme birincil" href="' + DD.kok + 'hesabim/odeme/">Paket Seç</a>';
    U.bas('#odPaketList', aktif.map((x) => paketSatir(x, hak[x.id])).join('') || U.bos({ ikon: 'fa-layer-group', baslik: 'Aktif görüşme paketin yok', metin: 'Bir diyetisyenle çalışmaya başladığında görüşme hakların burada görünür.', eylem: yeni }));
    U.bas('#odGecmisList', gecmis.map((x) => paketSatir(x, hak[x.id])).join('') || U.bos({ ikon: 'fa-clock-rotate-left', baslik: 'Sona eren paketin yok', metin: 'Hakkı biten paketlerin kayıtları burada durur.' }));
  }

  /* Faturalar */
  let tur = 'tumu';
  function faturalar() {
    const tum = G.faturalar(), l = tum.filter((x) => tur === 'tumu' || x.tur === tur);
    $('#odFtSay').innerHTML = tum.length + ' faturadan <b>' + l.length + '</b> tanesi gösteriliyor.';
    U.bas('#odFt', l.map((x) => '<tr><td><span class="no">' + U.kac(x.no) + (x.senin ? ' · senin kaydın' : '') + '<small>' + U.kac(x.baslik) + '</small></span></td><td class="tarih">' + U.noktaliTarih(x.tarih) + '</td><td class="tutar">' + G.tutar(x.tutar) + '</td><td>' + G.hap(x.durum) + '</td><td>' + belge(x.no) + '</td></tr>').join(''));
    $('#odFtTabloKap').hidden = !l.length;
    $('#odFtBos').hidden = !!l.length;
    if (!l.length) U.bas('#odFtBos', U.bos({ ikon: 'fa-file-circle-question', baslik: tum.length ? 'Bu türde fatura yok' : 'Henüz faturan yok', metin: tum.length ? 'Seçtiğin türde henüz bir belge kesilmemiş. Süzgeci “Tümü”ne alırsan defterin tamamını görürsün.' : 'İlk ödemenden sonra faturaların burada listelenir.', eylem: tum.length ? '<button class="dugme birincil" type="button" id="odFtSifirla">Süzgeci temizle</button>' : '' }));
  }
  function turSec(t) {
    tur = t;
    document.querySelectorAll('#odFtCip .cip').forEach((c) => c.classList.toggle('aktif', c.dataset.tur === t));
    faturalar();
  }

  let acikFatura = null;
  const para = (n) => G.tutar(n);
  function faturaGovde(f) {
    const b = G.faturaBilgi(), brut = Math.abs(f.tutar), net = brut / 1.2, kdv = brut - net;
    const alici = b.tip === 'kurumsal' && b.unvan ? b.unvan + (b.vkn ? ' · VKN ' + b.vkn : '') : b.ad;
    return '<div class="uyari-kutu">' + G.i('fa-circle-info') + '<span>Bu ekran örnektir: gerçek bir fatura kesilmez. Alıcı bilgileri Fatura Bilgilerim formunda kaydettiklerinden okunur.</span></div><dl class="kunye"><div><dt>Fatura no</dt><dd>' + U.kac(f.no) + '</dd></div><div><dt>Tarih</dt><dd>' + U.tarih(f.tarih) + '</dd></div><div><dt>Satıcı</dt><dd>Dada Diet</dd></div><div><dt>Alıcı</dt><dd>' + U.kac(alici) + '</dd></div></dl><div class="tablo-kap gomulu"><table class="tablo panel"><thead><tr><th scope="col">Açıklama</th><th scope="col">Miktar</th><th scope="col">Birim fiyat</th><th scope="col">KDV</th><th scope="col" class="sag">Tutar</th></tr></thead><tbody><tr><td>' + U.kac(f.baslik) + '</td><td>1</td><td class="tutar">' + para(net) + '</td><td class="tutar">' + para(kdv) + '</td><td class="tutar sag">' + para(f.tutar) + '</td></tr></tbody></table></div><p class="alan-yardim"><span>Fatura, tahsilat onaylandığında e-posta adresine de gönderilir. Kesilmiş belgeler geriye dönük düzenlenmez.</span></p>';
  }
  function faturaAc(no) {
    acikFatura = G.faturalar().find((x) => x.no === no);
    if (!acikFatura) return;
    U.bas('#fdGovde', faturaGovde(acikFatura));
    DD.ac('#fdModal');
  }
  $('#fdYazdir').addEventListener('click', () => DD.yazdir('#fdGovde', 'Fatura Belgesi', acikFatura ? acikFatura.no : ''));
  $('#fdIndir').addEventListener('click', () => {
    const a = document.createElement('a');
    const html = '<!doctype html><meta charset="utf-8"><title>' + U.kac(acikFatura.no) + '</title><h1>Dada Diet faturası</h1>' + document.getElementById('fdGovde').innerHTML;
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = acikFatura.no + '.html';
    a.click();
    URL.revokeObjectURL(a.href);
    DD.toast('Belge indirildi.');
  });

  /* Fatura bilgileri */
  const ftAlan = { ftAd: 'ad', ftUnvan: 'unvan', ftDaire: 'daire', ftVkn: 'vkn', ftTel: 'tel', ftEposta: 'eposta', ftIl: 'il', ftIlce: 'ilce', ftAdres: 'adres' };
  function ftTip(t) {
    document.querySelectorAll('#ftTip button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tip === t));
    $('#ftKurumsal').hidden = t !== 'kurumsal';
    ['ftUnvan', 'ftDaire', 'ftVkn'].forEach((i) => { document.getElementById(i).required = t === 'kurumsal'; });
  }
  function ftDoldur() {
    const b = G.faturaBilgi();
    Object.keys(ftAlan).forEach((i) => { document.getElementById(i).value = b[ftAlan[i]] || ''; });
    $('#ftVarsayilan').checked = b.varsayilan !== false;
    ftTip(b.tip);
  }
  $('#ftModal').addEventListener('dd:acildi', ftDoldur);
  $('#ftTip').addEventListener('click', (e) => { const b = e.target.closest('[data-tip]'); if (b) ftTip(b.dataset.tip); });
  $('#ftForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const eksik = ['ftAd', 'ftTel', 'ftEposta', 'ftIlce', 'ftUnvan', 'ftDaire', 'ftVkn'].filter((i) => { const a = document.getElementById(i); const hata = a.required && !a.value.trim(); a.classList.toggle('hatali', hata); return hata; });
    const adres = $('#ftAdres'), kisa = adres.value.trim().length < 10;
    adres.classList.toggle('hatali', kisa);
    if (eksik.length || kisa) { DD.toast('Zorunlu alanları doldur; adres en az 10 karakter olmalı.', 'hata'); return; }
    const b = G.faturaBilgi();
    Object.keys(ftAlan).forEach((i) => { b[ftAlan[i]] = document.getElementById(i).value.trim(); });
    b.tip = $('#ftTip [aria-pressed="true"]').dataset.tip;
    b.varsayilan = $('#ftVarsayilan').checked;
    U.kaydet();
    DD.kapat($('#ftModal'));
    DD.toast('Fatura bilgilerin kaydedildi.');
  });

  /* Kartlar */
  function kartlar() {
    const l = G.kartlar();
    $('#odKartSay').textContent = l.length + ' kart';
    U.bas('#odKartListe', l.map((k) => '<div class="odeme-satiri"><span class="odeme-marka' + k.sinif + '"><i class="' + k.ikon + '" aria-hidden="true"></i></span><div class="bilgi"><b>' + U.kac(G.kartAd(k)) + '</b><span class="skt">Son kullanma: ' + k.skt + '</span></div>' + (k.varsayilan ? U.durum('cozulen', 'Varsayılan', 'fa-circle-check') : '') + '<div class="eylemler">' + (k.varsayilan ? '' : '<button class="satir-dugme" type="button" data-kart-varsayilan="' + k.id + '">' + G.i('fa-circle-check') + ' Varsayılan Yap</button>') + '<button class="satir-dugme" type="button" data-kart-sil="' + k.id + '">' + G.i('fa-trash-can') + ' Kaldır</button></div></div>').join('') || U.bos({ ikon: 'fa-credit-card', baslik: 'Kayıtlı kartın yok', metin: 'Aşağıdan bir demo kart eklersen ödeme adımında seçebilirsin.' }));
    const kalan = G.DEMO_KART.filter((d) => !l.some((k) => k.id === d.id));
    $('#odDemoKart').innerHTML = kalan.map((d) => '<option value="' + d.id + '">' + U.kac(G.kartAd(d)) + ' · ' + d.skt + '</option>').join('') || '<option>Eklenecek demo kart kalmadı</option>';
    $('#odDemoKart').disabled = $('#odKartEkle').disabled = !kalan.length;
    abonelik();
  }
  $('#odKartForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const d = G.DEMO_KART.find((x) => x.id === $('#odDemoKart').value);
    if (!d) return;
    const l = U.yerel('kartlar', G.kartlar());
    l.push({ ...d, varsayilan: !l.length });
    U.kaydet(); kartlar();
    G.sonuc('odKartEkleSonuc', G.kartAd(d) + ' eklendi.');
  });

  /* İade */
  function iade() {
    const l = G.iadeler();
    $('#odIadeSay').textContent = l.length + ' talep';
    U.bas('#odIade', l.map((i) => '<tr><td><span class="no">' + U.kac(i.no) + '<small>' + U.kac(i.ad) + '</small></span></td><td class="tarih">' + U.noktaliTarih(i.tarih) + '</td><td class="tutar">' + U.tl(i.tutar) + '</td><td>' + G.hap(i.durum) + '</td><td><button class="dugme satir" type="button" data-tahsilat="' + U.kac(i.tahsilat) + '">' + G.i('fa-file-invoice') + ' Tahsilat</button></td></tr>').join('') || bosHucre(5, 'Henüz iade talebin yok.'));
    const h = G.hizmetler(), acik = l.filter((i) => i.durum === 'inceleniyor').map((i) => i.tahsilat);
    const secilebilir = h.filter((x) => x.durum === 'odendi' && !acik.includes(x.id));
    $('#odIadeTahsilat').innerHTML = '<option value="">Bir tahsilat seç</option>' + secilebilir.map((x) => '<option value="' + x.id + '">' + U.kac(x.no) + ' · ' + U.kac(x.ad) + ' · ' + U.tl(x.tutar) + '</option>').join('');
  }
  const hata = (id, var_) => document.getElementById(id).classList.toggle('goster', var_);
  $('#odIadeTahsilat').addEventListener('change', (e) => {
    const x = G.hizmetler().find((y) => y.id === e.target.value);
    $('#odIadeTutar span').textContent = x ? 'İade tutarı: ' + U.tl(x.tutar) + '.' : 'İade tutarı seçtiğin tahsilattan okunur.';
  });
  $('#odIadeAciklama').addEventListener('input', (e) => { $('#odIadeSayac').textContent = e.target.value.length + ' / 600'; });
  $('#odIadeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = $('#odIadeTahsilat').value, n = $('#odIadeNeden').value, a = $('#odIadeAciklama').value.trim();
    hata('odIadeTahsilatHata', !t); hata('odIadeNedenHata', !n); hata('odIadeAciklamaHata', a.length < 20);
    if (!t || !n || a.length < 20) return;
    const x = G.hizmetler().find((y) => y.id === t), l = U.yerel('iadeTalepleri', G.iadeler());
    const no = 'IAD-2026-' + String(100 + l.length).padStart(4, '0');
    l.unshift({ no, tahsilat: t, ad: x.ad + ' · ' + n.toLocaleLowerCase('tr'), tarih: U.bugun(), tutar: x.tutar, durum: 'inceleniyor', aciklama: a });
    x.durum = 'iade-surecinde';
    U.kaydet();
    e.target.reset();
    $('#odIadeSayac').textContent = '0 / 600';
    iade(); hizmet(); faturalar();
    G.sonuc('odIadeSonuc', no + ' numaralı talebin alındı. Durumu bu listeden izlersin.');
    DD.toast('İade talebin alındı.');
  });

  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-fatura]');
    if (f) { faturaAc(f.dataset.fatura); return; }
    const th = e.target.closest('[data-tahsilat]');
    if (th) { const x = G.hizmetler().find((y) => y.id === th.dataset.tahsilat); if (x) faturaAc(x.no); return; }
    const c = e.target.closest('#odFtCip .cip');
    if (c) { turSec(c.dataset.tur); return; }
    if (e.target.closest('#odFtSifirla')) { turSec('tumu'); return; }
    const v = e.target.closest('[data-kart-varsayilan]');
    if (v) {
      G.kartlar().forEach((k) => { k.varsayilan = k.id === v.dataset.kartVarsayilan; });
      U.kaydet(); kartlar();
      G.sonuc('odKartSonuc', 'Varsayılan kartın değişti.');
      return;
    }
    const s = e.target.closest('[data-kart-sil]');
    if (s) {
      const l = U.yerel('kartlar', G.kartlar()), n = l.findIndex((k) => k.id === s.dataset.kartSil);
      const silinen = l.splice(n, 1)[0];
      if (silinen.varsayilan && l[0]) l[0].varsayilan = true;
      U.kaydet(); kartlar();
      G.sonuc('odKartSonuc', G.kartAd(silinen) + ' kaldırıldı.');
    }
  });

  abonelik(); hizmet(); faturalar(); kartlar(); iade();
})();
