/* Hesap Ayarlarım (fotoğraf ve kapak örtüleri kabukta): profil, güvenlik, bağlı uygulamalar, veri, dondurma ve silme */
(function () {
  'use strict';
  const DD = window.DD, U = window.DDU, G = window.DDG;
  const $ = (s) => document.querySelector(s);
  const u = U.uye(), dn = U.danisan();

  /* Kaydedildi işareti: uye-ortak formu kaydeder, kart ayağı işaretlenir */
  document.addEventListener('submit', (e) => {
    const k = e.target.querySelector('.kaydedildi');
    if (!k || !e.target.matches('[data-ayar-form]')) return;
    k.classList.add('gorunur');
    setTimeout(() => k.classList.remove('gorunur'), 2400);
  });

  /* Şifre gözü */
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-goz]');
    if (!g) return;
    const a = g.parentElement.querySelector('input'), ac = a.type === 'password';
    a.type = ac ? 'text' : 'password';
    g.querySelector('i').className = 'fa-solid ' + (ac ? 'fa-eye-slash' : 'fa-eye');
    g.setAttribute('aria-label', ac ? 'Şifreyi gizle' : 'Şifreyi göster');
  });

  /* Profil */
  const profil = U.yerel('profilEk', { bio: '', dogum: '', ulke: '+90', hedef: '' });
  const parca = (u.ad || '').split(' ');
  $('#hsAd').value = parca.slice(0, -1).join(' ') || parca[0] || '';
  $('#hsSoyad').value = parca.length > 1 ? parca[parca.length - 1] : '';
  $('#hsKullanici').value = U.kullaniciAdi();
  $('#hsEposta').value = G.eposta();
  $('#hsTel').value = u.telefon || '';
  $('#hsDogum').value = profil.dogum;
  $('#hsBio').value = profil.bio;
  if (profil.hedef) $('#hsHedef').value = profil.hedef;
  /* Duyarlı üye: beslenme hedefi ve enerji birimi satırları görünmez */
  if (U.yemeDuyarli()) {
    U.gizle($('#hsHedef').closest('.alan'), true);
    $('#hsDogum').closest('.alan').querySelector('.alan-yardim span').textContent = 'Hesaplayıcı önerilerinde kullanılır.';
    ['enerji', 'enerjiGizle'].forEach((a) => U.gizle(document.querySelector('[name="' + a + '"]').closest('.ayar-satir'), true));
  }
  const bioSay = () => { $('#hsBioSay').textContent = $('#hsBio').value.length + ' / 160'; };
  const adres = () => { $('#hsAdres').textContent = '@' + $('#hsKullanici').value.trim().replace(/^@/, ''); };
  bioSay(); adres();
  $('#hsBio').addEventListener('input', bioSay);
  $('#hsKullanici').addEventListener('input', adres);
  $('#profilForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const eksik = ['hsAd', 'hsSoyad', 'hsKullanici', 'hsEposta'].filter((i) => { const a = document.getElementById(i), h = !a.value.trim(); a.classList.toggle('hatali', h); return h; });
    if (eksik.length) { DD.toast('Zorunlu alanları doldur.', 'hata'); return; }
    u.ad = ($('#hsAd').value.trim() + ' ' + $('#hsSoyad').value.trim()).trim();
    dn.ad = u.ad; /* panelde de aynı ad görünür */
    u.kullanici = $('#hsKullanici').value.trim().replace(/^@/, '');
    u.eposta = $('#hsEposta').value.trim();
    u.telefon = $('#hsTel').value.trim();
    Object.assign(profil, { bio: $('#hsBio').value.trim(), dogum: $('#hsDogum').value, hedef: $('#hsHedef').value });
    U.kaydet();
    $('#hsGuncel').textContent = 'Son güncelleme: az önce';
    const k = e.target.querySelector('.kaydedildi');
    k.classList.add('gorunur'); setTimeout(() => k.classList.remove('gorunur'), 2400);
    DD.toast('Profil bilgilerin kaydedildi.');
  });

  /* Ülke kodu */
  const ULKE = [['TR', 'Türkiye', '+90'], ['DE', 'Almanya', '+49'], ['GB', 'Birleşik Krallık', '+44'], ['NL', 'Hollanda', '+31'], ['FR', 'Fransa', '+33'], ['US', 'Amerika Birleşik Devletleri', '+1'], ['AZ', 'Azerbaycan', '+994']];
  const katman = $('#hsUlkeKatman'), ulkeDugme = $('#hsUlke');
  katman.querySelector('.alan-ulke-liste').innerHTML = ULKE.map((x) => '<li role="option" tabindex="0" data-ulke="' + x[2] + '"><span class="bayrak">' + x[0] + '</span><span class="ad">' + x[1] + '</span><span class="kod">' + x[2] + '</span></li>').join('');
  const ulkeYaz = (kod) => { const x = ULKE.find((y) => y[2] === kod) || ULKE[0]; ulkeDugme.querySelector('.alan-ulke-bayrak').textContent = x[0]; ulkeDugme.querySelector('.alan-ulke-kod').textContent = x[2]; };
  ulkeYaz(profil.ulke);
  ulkeDugme.addEventListener('click', () => { katman.hidden = !katman.hidden; ulkeDugme.setAttribute('aria-expanded', !katman.hidden); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ulke]');
    if (b) { profil.ulke = b.dataset.ulke; ulkeYaz(b.dataset.ulke); U.kaydet(); }
    if (!e.target.closest('.alan-telefon') || b) { katman.hidden = true; ulkeDugme.setAttribute('aria-expanded', 'false'); }
  });

  /* Şifre */
  const GUCLU = /^(?=.*[a-zçğıöşü])(?=.*[A-ZÇĞİÖŞÜ])(?=.*\d)(?=.*[^\wçğıöşüÇĞİÖŞÜ]).{8,}$/;
  $('#sifreForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, y = f.elements.pwNew.value;
    if (!f.elements.pwCur.value) { DD.toast('Mevcut şifreni yaz.', 'hata'); return; }
    if (!GUCLU.test(y)) { DD.toast('Yeni şifre kurallara uymuyor.', 'hata'); return; }
    if (y !== f.elements.pwNew2.value) { DD.toast('Yeni şifreler birbiriyle aynı değil.', 'hata'); return; }
    f.reset();
    $('#pwGuncel').textContent = 'Son şifre değişikliği: az önce';
    DD.toast('Şifren güncellendi.');
  });

  /* İki adımlı doğrulama ve kurtarma kodları */
  const guv = U.yerel('guvenlik', { tfa: true, yontem: 'sms', kodlar: null, kalan: 8 });
  const yeniKodlar = () => Array.from({ length: 10 }, (_, i) => { const r = (9176 * (i + 3) + Date.now()) % 1000000; return String(r).padStart(6, '0').replace(/(\d{3})(\d{3})/, '$1-$2'); });
  if (!guv.kodlar) guv.kodlar = yeniKodlar();
  const YONTEM = { sms: 'telefonuna gelen 6 haneli kod', uygulama: 'doğrulayıcı uygulamanın ürettiği kod' };
  function guvCiz() {
    U.bas('#gv2faDurum', guv.tfa ? 'Açık: girişte ' + YONTEM[guv.yontem] + ' isteniyor. Yöntemi değiştirmek için kurulumu yeniden çalıştır.' : 'Kapalı: hesabına yalnız şifreyle girilir.');
    $('#gv2fa').checked = guv.tfa;
    U.bas('#gvKodDurum', 'Telefonuna erişemezsen bu tek kullanımlık kodlarla giriş yaparsın. 10 koddan ' + guv.kalan + ' tanesi kullanılmadan duruyor.');
    $('#gvEposta').textContent = G.eposta();
  }
  guvCiz();
  $('#gv2fa').addEventListener('change', (e) => {
    guv.tfa = e.target.checked; U.kaydet(); guvCiz();
    DD.toast(guv.tfa ? 'İki adımlı doğrulama açıldı.' : 'İki adımlı doğrulama kapatıldı.', guv.tfa ? '' : 'uyari');
  });
  const kodCip = (l) => l.map((k) => '<span class="cip">' + k + '</span>').join('');
  $('#gvKodGoster').addEventListener('click', () => { U.bas('#kodListe', kodCip(guv.kodlar)); DD.ac('#kodModal'); });
  $('#gvKodYenile').addEventListener('click', () => { guv.kodlar = yeniKodlar(); guv.kalan = 10; U.kaydet(); guvCiz(); DD.toast('Kurtarma kodların yenilendi; eskiler geçersiz.'); });
  $('#kodKopyala').addEventListener('click', () => { const m = guv.kodlar.join('\n'); if (navigator.clipboard) navigator.clipboard.writeText(m).catch(() => {}); DD.toast('Kodlar kopyalandı.'); });
  let adim = 1;
  function tfaAdim(n) {
    adim = n;
    document.querySelectorAll('[data-tfa-adim]').forEach((p) => { p.hidden = Number(p.dataset.tfaAdim) !== n; });
    document.querySelectorAll('#tfaSerit li').forEach((l, i) => { l.className = i + 1 === n ? 'acik' : i + 1 < n ? 'bitti' : ''; });
    $('#tfaGeri').hidden = n === 1;
    $('#tfaIleri').textContent = n === 3 ? 'Kurulumu Bitir' : 'Devam';
    if (n === 3) U.bas('#tfaKodlar', kodCip(guv.kodlar));
  }
  $('#tfaModal').addEventListener('dd:acildi', () => { $('#tfaKod').value = ''; $('#tfaOnay').checked = false; tfaAdim(1); });
  $('#tfaGeri').addEventListener('click', () => tfaAdim(adim - 1));
  $('#tfaIleri').addEventListener('click', () => {
    if (adim === 2 && !/^\d{6}$/.test($('#tfaKod').value)) { DD.toast('Altı haneli kodu yaz.', 'hata'); return; }
    if (adim < 3) { tfaAdim(adim + 1); return; }
    if (!$('#tfaOnay').checked) { DD.toast('Kodları kaydettiğini işaretle.', 'uyari'); return; }
    guv.tfa = true;
    guv.yontem = document.querySelector('[name="tfaYontem"]:checked').value;
    U.kaydet(); guvCiz();
    DD.kapat($('#tfaModal'));
    DD.toast('İki adımlı doğrulama kuruldu.');
  });

  /* Giriş yöntemi bağlama */
  const bagli = U.yerel('bagli', {});
  const baglaCiz = () => {
    document.querySelectorAll('[data-bagla]').forEach((b) => { b.textContent = bagli[b.dataset.bagla] ? 'Bağlantıyı Kes' : 'Bağla'; });
    document.querySelectorAll('[data-bag-metin]').forEach((e) => { e.textContent = bagli[e.dataset.bagMetin] ? 'Bağlı: tek dokunuşla giriş açık.' : 'Bağlı değil: tek dokunuşla giriş için bağlayabilirsin.'; });
  };
  baglaCiz();
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bagla]');
    if (!b) return;
    const ad = b.dataset.bagla;
    bagli[ad] = !bagli[ad];
    U.kaydet(); baglaCiz();
    DD.toast(ad + (bagli[ad] ? ' hesabın bağlandı.' : ' bağlantısı kaldırıldı.'));
  });

  /* Oturumlar */
  const oturumlar = G.bos ? [] : U.yerel('oturumlar', [
    { ad: 'Bu tarayıcı', ikon: 'fa-laptop', metin: 'İstanbul · şu anda aktif', bu: true },
    { ad: 'Dada Diet mobil uygulaması', ikon: 'fa-mobile-screen', metin: 'İstanbul · son görülme dün' },
    { ad: 'iPad, Safari', ikon: 'fa-tablet-screen-button', metin: 'Ankara · son görülme 12 gün önce' },
  ]);
  const oturumCiz = () => U.bas('#oturumlar', oturumlar.map((o, i) => '<div class="ayar-satir"><span class="as-ikon">' + G.i(o.ikon) + '</span><div class="as-metin"><b>' + U.kac(o.ad) + '</b><span>' + U.kac(o.metin) + '</span></div>' + (o.bu ? '<span class="as-acik">' + G.i('fa-circle-check') + ' Bu cihaz</span>' : '<span class="as-eylem"><button class="satir-dugme" type="button" data-oturum-kapat="' + i + '">Oturumu Kapat</button></span>') + '</div>').join('') || U.bos({ ikon: 'fa-desktop', baslik: 'Açık oturum yok', metin: 'Hesabına giriş yapılmış başka cihaz görünmüyor.' }));
  oturumCiz();
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-oturum-kapat]');
    if (!b) return;
    oturumlar.splice(Number(b.dataset.oturumKapat), 1);
    U.kaydet(); oturumCiz();
    DD.toast('Oturum kapatıldı.');
  });
  $('#oturumKapat').addEventListener('click', () => {
    const kalan = oturumlar.filter((o) => o.bu);
    if (kalan.length === oturumlar.length) { DD.toast('Bu cihaz dışında açık oturum yok.', 'uyari'); return; }
    oturumlar.length = 0; oturumlar.push(...kalan);
    U.kaydet(); oturumCiz();
    DD.toast('Diğer oturumlar kapatıldı.');
  });

  /* Bağlı uygulamalar */
  const AKIS = { gelen: ['olumlu', 'fa-arrow-right', 'Cihazdan Dada Diet’e'], giden: ['bekleme', 'fa-arrow-right', 'Dada Diet’ten cihaza'], elle: ['pasif', 'fa-pen', 'Senden Dada Diet’e'], kapali: ['pasif', 'fa-minus', 'Aktarılmıyor'], yok: ['pasif', 'fa-ban', 'Dış sisteme gönderilmez'] };
  const BAGLANTI = [
    { id: 'apple', ad: 'Apple Sağlık', ikon: 'fa-brands fa-apple', detay: 'iPhone · Apple Sağlık · 04.09.2026’dan beri bağlı. Adım ve uyku verin ' , detayBag: ['Günlük Takibim', 'hesabim/gunluk-takibim/'], sure: 'Bugün 13.05', sureNot: 'Otomatik · arka planda, uygulamayı açmana gerek yok', ipucu: 'Her biri ayrı ayrı kapatılabilir', akisNot: 'Yön rozeti izne göre değişir', kes: 'Bağlantıyı Kes', kesNot: 'Kesersen izinler kapanır ve okuma durur. Dada Diet’e daha önce gelen kayıtlar silinmez; silmek istersen Veri ve Hesap Yönetimi sekmesinden silersin.', izinler: [['adim', 'Adım ve hareket', 'Günlük adım ve aktif dakika okunur; hareket hedefine işlenir.', 1, 'gelen'], ['uyku', 'Uyku süresi', 'Gece toplamı okunur; haftalık özetinde görünür.', 1, 'gelen'], ['kilo', 'Kilo ölçümü', 'Telefonuna giren kilo kaydı Sağlık Dosyam’a düşer.', 1, 'gelen'], ['nabiz', 'Nabız özeti', 'İsteğe bağlıdır. Kapalıyken nabız hiç okunmaz.', 0, 'gelen'], ['enerji', 'Aktif enerji', 'İsteğe bağlıdır. Kapalıyken hedef yalnız adıma bakar.', 0, 'gelen'], ['yaz', 'Su ve enerji toplamımı Sağlık’a yaz', 'Tek çıkış izni budur. Günlük su ve enerji toplamın Apple Sağlık’a eklenir. Kapatırsan Dada Diet hiçbir veri göndermez.', 1, 'giden']], bagli: true },
    { id: 'health', ad: 'Android Health Connect', ikon: 'fa-brands fa-android', detay: 'Android telefonundaki adım ve ölçüm verisi için bağlanır. Bağlanınca izinleri tek tek seçersin; ', detayBag: ['Günlük Takibim', 'hesabim/gunluk-takibim/'], sure: 'Hiç senkronize edilmedi', sureNot: 'Bağlantı kurulunca burada görünür', ipucu: 'Bağlantı kurulunca seçilir', akisNot: 'Şu an hiçbiri — bağlantı kurulmadı', kes: 'Health Connect’e Bağlan', kesNot: 'Şu an bağlı değil, kesilecek bir şey yok. Bağlandıktan sonra hangi verinin okunacağını izinlerden seçersin.', izinler: [['adim', 'Adım ve hareket', 'Günlük adım ve aktif dakika.', 0, 'gelen'], ['uyku', 'Uyku süresi', 'Gece toplamı.', 0, 'gelen'], ['kilo', 'Kilo ölçümü', 'Telefonuna giren kilo kaydı.', 0, 'gelen'], ['nabiz', 'Nabız özeti', 'İsteğe bağlıdır.', 0, 'gelen'], ['yaz', 'Su ve enerji toplamımı yaz', 'Tek çıkış izni budur. Kapalıyken hiçbir veri gönderilmez.', 0, 'giden']], bagli: false },
    { id: 'tarti', ad: 'Akıllı tartı', ikon: 'fa-solid fa-weight-scale', detay: 'Bluetooth tartı · 22.09.2026’dan beri bağlı. Ölçümlerin ', detayBag: ['Sağlık Dosyam', 'hesabim/saglik-dosyam/'], sure: 'Bugün 07.12', sureNot: 'Tartıya çıktığında bir kez okunur', ipucu: 'Her biri ayrı ayrı kapatılabilir', akisNot: 'Tek yönlü: tartı hiçbir veri almaz', kes: 'Bağlantıyı Kes', kesNot: 'Kesersen tartıdan yeni ölçüm gelmez. Eski ölçümlerin Sağlık Dosyam’da kalır; tek tek düzenleyebilirsin.', izinler: [['kilo', 'Kilo', 'Tartıdan gelen kilo kaydı.', 1, 'gelen'], ['yag', 'Yağ oranı', 'Tartının hesapladığı yağ oranı; tıbbi ölçüm değildir.', 1, 'gelen'], ['kas', 'Kas kütlesi', 'İsteğe bağlıdır.', 1, 'gelen'], ['su', 'Vücut suyu', 'İsteğe bağlıdır.', 1, 'gelen']], bagli: true, sabit: { baslik: 'Dada Diet tartına veri göndermez', metin: 'Tartı yalnız okunur; ayarları değiştirilmez.' } },
    { id: 'elle', ad: 'Elle kayıt', ikon: 'fa-solid fa-pen', detay: 'Dış bağlantı gerektirmez: bağlantı kurmadan elle girersin. Kayıtların ', detayBag: ['Günlük Takibim', 'hesabim/gunluk-takibim/'], sure: 'Senkronizasyon yok', sureNot: 'Kayıt anında kendi hesabına yazılır', ipucu: 'Hangi alanlar elle girilsin', akisNot: 'Dış sisteme çıkış yok', kes: 'Elle Kaydı Kapat', kesNot: 'Kesilecek bir <b>dış</b> bağlantı yok; elle kayıt Dada Diet’in kendi içindedir. Karşılığı, elle kaydı kapatmaktır: alanlar kalkar, yazdıkların durur.', izinler: [['ogun', 'Öğünümü elle işaretle', 'Planındaki öğünü tamamladın olarak işaretlersin.', 1, 'elle'], ['su', 'Suyumu elle gir', 'Bardak bardak su eklersin.', 1, 'elle'], ['olcum', 'Ölçümümü elle gir', 'Kilo ve bel ölçümünü sen yazarsın.', 1, 'elle'], ['not', 'Günlük notu ekle', 'Günlüğüne kısa not düşersin.', 0, 'elle']], bagli: true, etiket: 'Açık', sabit: { baslik: 'Elle yazdıkların hiçbir dış sisteme gönderilmez', metin: 'Bağlı uygulamalara aktarılmaz.' } },
  ];
  const durum = U.yerel('baglantilar', Object.fromEntries(BAGLANTI.map((b) => [b.id, { bagli: b.bagli, izin: Object.fromEntries(b.izinler.map((i) => [i[0], !!i[3]])) }])));
  let baSuz = 'tumu';
  const satir = (k) => { const a = AKIS[k]; return '<span class="rozet ' + a[0] + '">' + G.i(a[1]) + ' ' + a[2] + '</span>'; };
  function baKart(b) {
    const d = durum[b.id], acik = d.bagli, etiket = acik ? (b.etiket || 'Bağlı') : 'Bağlı değil';
    const izinAcik = b.izinler.filter((i) => d.izin[i[0]]).length;
    const izinler = b.izinler.map((i) => '<div class="ayar-satir"><div class="as-metin"><b>' + U.kac(i[1]) + '</b><span>' + i[2] + '</span></div><label class="anahtar"><input type="checkbox" data-izin="' + b.id + ':' + i[0] + '"' + (d.izin[i[0]] ? ' checked' : '') + (acik ? '' : ' disabled') + ' aria-label="' + U.kac(i[1]) + '"><span class="anahtar-ray"></span></label></div>').join('');
    const akis = b.izinler.map((i) => { const on = acik && d.izin[i[0]]; return '<div class="akis-satir' + (on ? '' : ' kapali') + '">' + satir(on ? i[4] : 'kapali') + '<div><b>' + U.kac(i[1]) + '</b><small>' + (on ? 'Açık izinle aktarılıyor' : 'İzin kapalı ya da bağlantı yok') + '</small></div></div>'; }).join('') + (b.sabit ? '<div class="akis-satir">' + satir('yok') + '<div><b>' + b.sabit.baslik + '</b><small>' + b.sabit.metin + '</small></div></div>' : '');
    return '<article class="kart panel tam-kolon" id="baglanti-' + b.id + '" data-durum="' + (acik ? 'acik' : 'kapali') + '"><div class="kart-bas"><div><h3 class="kart-baslik"><i class="' + b.ikon + '" aria-hidden="true"></i> ' + U.kac(b.ad) + '</h3></div><span class="rozet ' + (acik ? 'olumlu' : 'pasif') + '">' + G.i(acik ? 'fa-check' : 'fa-xmark') + ' ' + etiket + '</span></div><div class="kart-govde"><div class="kutu-izgara"><div class="bilgi-kutu"><h4>' + G.i('fa-plug') + ' Bağlantı durumu</h4><b>' + etiket + '</b><small>' + b.detay + '<a href="' + DD.kok + b.detayBag[1] + '">' + b.detayBag[0] + '</a> sayfasına düşer.</small></div><div class="bilgi-kutu"><h4>' + G.i('fa-rotate') + ' Son senkronizasyon</h4><b data-ba-sure="' + b.id + '">' + (acik ? (d.sure || b.sure) : 'Hiç senkronize edilmedi') + '</b><small>' + b.sureNot + '</small></div></div><div class="ara-baslik"><h4>' + G.i('fa-sliders') + ' Verilen izinler</h4><small>' + b.ipucu + '</small></div><div class="ayar-liste">' + izinler + '</div>' + (acik && !izinAcik ? '<div class="uyari-kutu">' + G.i('fa-triangle-exclamation') + '<span>Bağlantı duruyor ama açık izin kalmadı; şu an hiçbir veri aktarılmıyor.</span></div>' : '') + '<div class="ara-baslik"><h4>' + G.i('fa-arrows-left-right') + ' Hangi veriler aktarılıyor</h4><small>' + b.akisNot + '</small></div><div class="akis-liste">' + akis + '</div><div class="ara-baslik"><h4>' + G.i('fa-link-slash') + ' Bağlantıyı kesme</h4></div><div class="kesme-satir"><p>' + b.kesNot + '</p><button class="dugme ' + (acik ? 'hayalet tehlike' : 'birincil') + '" type="button" data-ba-kes="' + b.id + '">' + G.i(acik ? 'fa-link-slash' : 'fa-link') + ' ' + (acik ? U.kac(b.kes) : (b.id === 'elle' ? 'Elle Kaydı Aç' : U.kac(b.ad) + ' Bağla')) + '</button></div></div></article>';
  }
  function baCiz() {
    const l = BAGLANTI.filter((b) => baSuz === 'tumu' || (baSuz === 'acik') === durum[b.id].bagli);
    U.bas('#baListe', l.map(baKart).join(''));
    $('#baSay').textContent = l.length;
    const bos = $('#baBos');
    bos.hidden = !!l.length;
    if (!l.length) U.bas(bos, U.bos({ ikon: 'fa-plug-circle-xmark', baslik: 'Bu durumda bağlantı yok', metin: 'Seçtiğin duruma uyan bağlantı bulunmadı. Süzgeci sıfırlayıp dördünü de görebilirsin.', eylem: '<button class="dugme birincil" type="button" id="baSifirla">' + G.i('fa-rotate-left') + ' Süzgeci sıfırla</button>' }));
    document.querySelectorAll('#baSuzgec .cip').forEach((c) => c.classList.toggle('aktif', c.dataset.durum === baSuz));
  }
  baCiz();
  document.addEventListener('click', (e) => {
    const c = e.target.closest('#baSuzgec .cip');
    if (c) { baSuz = c.dataset.durum; baCiz(); return; }
    if (e.target.closest('#baSifirla')) { baSuz = 'tumu'; baCiz(); return; }
    const k = e.target.closest('[data-ba-kes]');
    if (k) {
      const d = durum[k.dataset.baKes], b = BAGLANTI.find((x) => x.id === k.dataset.baKes);
      d.bagli = !d.bagli;
      if (d.bagli) d.sure = 'Az önce';
      U.kaydet(); baCiz();
      DD.toast(b.ad + (d.bagli ? ' bağlandı.' : ' bağlantısı kesildi.'), d.bagli ? '' : 'uyari');
    }
  });
  document.addEventListener('change', (e) => {
    const z = e.target.closest('[data-izin]');
    if (!z) return;
    const p = z.dataset.izin.split(':');
    durum[p[0]].izin[p[1]] = z.checked;
    U.kaydet(); baCiz();
  });
  $('#baSimdi').addEventListener('click', () => {
    const l = BAGLANTI.filter((b) => durum[b.id].bagli && b.id !== 'elle');
    const c = $('#baCanli');
    if (!l.length) { c.querySelector('span').textContent = 'Etkin bağlantı yok; senkronize edilecek bir şey bulunamadı.'; c.hidden = false; return; }
    l.forEach((b) => { durum[b.id].sure = 'Az önce'; });
    U.kaydet(); baCiz();
    c.querySelector('span').textContent = l.map((b) => b.ad).join(', ') + ' güncellendi.';
    c.hidden = false;
  });
  const siklik = U.yerel('baglantiSiklik', { deger: '' });
  if (siklik.deger) $('#baSiklik').value = siklik.deger;
  $('#baSiklik').addEventListener('change', (e) => { siklik.deger = e.target.value; U.kaydet(); DD.toast('Senkronizasyon sıklığın kaydedildi.'); });

  /* Veri listesi: sayılar demo kayıtlarından */
  const ilk = (dn.olcumler || [])[0], iKayit = ilk ? U.noktaliTarih(ilk.tarih) : '—';
  const sayim = [['Profil ve hesap bilgileri', 1, iKayit, 'Hesap açık kaldıkça'], ['Beslenme planları', (U.d().planlar || []).filter((p) => p.danisan_id === U.uyeId()).length, iKayit, 'Hesap açık kaldıkça'], ['Ölçümler', (dn.olcumler || []).length, iKayit, 'Hesap açık kaldıkça'], ['Tahlil ve belgeler', (dn.tahliller || []).length, (dn.tahliller || [])[0] ? U.noktaliTarih(dn.tahliller[0].tarih) : '—', 'Hesap açık kaldıkça'], ['Su ve adım kayıtları', ((u.su || {}).hafta || []).length + ((u.adim || {}).hafta || []).length, iKayit, 'Hesap açık kaldıkça'], ['Diyetisyen mesajları', (U.sohbet().mesajlar || []).length, '03.11.2026', 'Hesap açık kaldıkça'], ['Bağlı uygulama senkron kaydı', 42, '04.09.2026', '90 gün'], ['Destek talepleri ve yazışma', G.talepler().length, '12.09.2026', 'Yasal saklama süresi']];
  U.bas('#vzTablo', sayim.map((r) => '<tr><td>' + U.kac(r[0]) + '</td><td>' + r[1] + '</td><td class="tarih">' + r[2] + '</td><td>' + r[3] + '</td></tr>').join(''));
  $('#vzListele').addEventListener('click', (e) => {
    const l = $('#vzListe');
    l.hidden = !l.hidden;
    e.currentTarget.textContent = l.hidden ? 'Listele' : 'Gizle';
    e.currentTarget.setAttribute('aria-expanded', !l.hidden);
  });
  const ADIM = ['Paket hazırlanıyor', 'Dosya oluşturuluyor', 'Bağlantı e-postana gönderiliyor'];
  $('#vzIndir').addEventListener('click', (e) => {
    const b = e.currentTarget, k = $('#vzIndirDurum');
    b.disabled = true; k.hidden = false;
    const ciz = (n) => {
      U.bas('#vzAdimlar', ADIM.map((a, i) => '<p class="durum-satir">' + G.i(i < n ? 'fa-circle-check' : i === n ? 'fa-circle-notch fa-spin' : 'fa-circle') + ' <span>' + a + '</span></p>').join('') + (n >= ADIM.length ? '<p class="durum-satir">' + G.i('fa-circle-info') + ' <span>Hazır. <b>' + U.kac(G.eposta()) + '</b> adresine indirme bağlantısı gönderildi; bağlantı 48 saat geçerlidir.</span></p>' : ''));
      if (n < ADIM.length) setTimeout(() => ciz(n + 1), 600); else { b.disabled = false; DD.toast('Veri paketin hazır.'); }
    };
    ciz(0);
  });

  /* Dondurma ve silme */
  const hesap = U.yerel('hesap', {});
  function hesapCiz() {
    const d = hesap.dondurma, s = hesap.silmeTalebi;
    $('#dondurBtn').lastChild.textContent = d ? ' Dondurmayı Kaldır' : ' Hesabı Dondur';
    $('#dondurBtn').disabled = !d && !$('#dondurOnay').checked;
    $('#dondurDurum').hidden = !d && $('#dondurOnay').checked;
    $('#dondurDurum span').textContent = d ? 'Hesabın ' + d + ' süreyle dondurulmuş durumda.' : 'Düğme kapalı: dondurmak için önce onay kutusunu işaretle.';
    const tamam = $('#silOnay').checked && $('#silIfade').value.trim() === 'HESABIMI SİL';
    $('#silBtn').lastChild.textContent = s ? ' Silme Talebini Geri Al' : ' Hesabımı Kalıcı Olarak Sil';
    $('#silBtn').disabled = !s && !tamam;
    $('#silDurum').hidden = !s && tamam;
    $('#silDurum span').textContent = s ? 'Silme talebin ' + U.tarih(s) + ' tarihinde alındı; 30 gün içinde geri alabilirsin.' : 'Düğme kapalı: silme için onay kutusunu işaretle ve HESABIMI SİL ifadesini birebir yaz.';
  }
  hesapCiz();
  ['#dondurOnay', '#silOnay'].forEach((s) => $(s).addEventListener('change', hesapCiz));
  $('#silIfade').addEventListener('input', hesapCiz);
  $('#dondurForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (hesap.dondurma) { delete hesap.dondurma; DD.toast('Hesabın yeniden açıldı.'); }
    else { hesap.dondurma = $('#dondurSure').value; DD.toast('Hesabın ' + hesap.dondurma + ' süreyle donduruldu.', 'uyari'); }
    $('#dondurOnay').checked = false;
    U.kaydet(); hesapCiz();
  });
  $('#silForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (hesap.silmeTalebi) { delete hesap.silmeTalebi; DD.toast('Silme talebin geri alındı.'); }
    else { hesap.silmeTalebi = U.bugun(); DD.toast('Silme talebin alındı. 30 gün içinde geri alabilirsin.', 'uyari'); }
    $('#silOnay').checked = false; $('#silIfade').value = '';
    U.kaydet(); hesapCiz();
  });
})();
