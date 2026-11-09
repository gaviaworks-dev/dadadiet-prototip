/* Satış vitrini (Marka ve Sponsorluk İş Birlikleri). Canlı public/reklam/satis-vitrini.js davranışının prototip uyarlaması:
   sayfa sekmeleri, alan rayı ve çipleri, alan paneli (künye, Masaüstü/Mobil, Büyüt), teklif listesi (yüzen düğme + panel),
   paket kalemlerinde "Önizle", teklif formunda tür seçimi, seçilen alanlar, ekler ve ülke kodlu telefon.
   Canlı vitrin alanı manifest ekran görüntüsünden basar; prototipte aynı prototip sayfası ?reklam=KOD ile ölçekli iframe içinde
   açılır (yalnız o alan basılır). Seçim yalnız sayfa belleğinde tutulur; form gönderilmez (data-demo-form). */
(function () {
  'use strict';
  var kok = document.getElementById('alanlar');
  var veriEl = document.getElementById('vtVeri');
  if (!kok || !veriEl) return;
  var DD = window.DD || {};
  var K = document.documentElement.dataset.kok || './';
  var ALAN = {};
  JSON.parse(veriEl.textContent).alanlar.forEach(function (a) { ALAN[a.k] = a; });
  var $ = function (q, el) { return (el || document).querySelector(q); };
  var $$ = function (q, el) { return [].slice.call((el || document).querySelectorAll(q)); };
  var kac = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var ik = function (i) { return '<i class="fa-solid ' + i + '" aria-hidden="true"></i>'; };
  var SATIS = { payli: ['Paylı', 'Aynı konumda en çok :n marka, dönüşümlü'], munhasir: ['Münhasır', 'Alan yalnız senin; pay sorulmaz'], tek_marka: ['Tek marka', 'Aynı anda yalnız sen'], kanal: ['Kanal', 'Sipariş ve alışveriş kanalı; alan başına tek marka'] };
  var KADEME = { 1: 'vitrin alanı', 2: 'liste sayfası', 3: 'rehber sayfası' };
  var sinif = function (k) { return k === 'K' ? '<span class="vt-pclass">Kanal</span>' : '<span class="vt-pclass">' + '₺'.repeat(4 - k) + '<i>' + '₺'.repeat(k - 1) + '</i></span>'; };
  var st = { alan: $('.vt-panel', kok).dataset.vtPane, cihaz: 'd', liste: [] };

  /* ── Panel ─────────────────────────────────────────────── */
  function cihazlar(a) { return { d: !!a.d && a.d !== 'Yok', m: !!a.m && a.m !== 'Yok' }; }
  function sahne(a, c) {
    if (a.du !== 'yerlesik') return '<div class="bilgi-notu">' + ik('fa-circle-info') + '<p><b>Önizleme yok.</b> ' + kac(a.g) + '</p></div>';
    var yol = a.y ? a.y + '/' : '';
    var src = K + yol + '?reklam=' + encodeURIComponent(a.k);
    var cerceve = '<iframe class="vt-iframe" src="' + src + '" title="' + kac(a.ad) + ' alanı, prototip sayfasında örnek kreatifle" loading="lazy" tabindex="-1"></iframe>';
    if (c === 'd') return '<div class="vt-stage" data-vt-sahne data-vt-w="' + (a.b === 'Dikey sticky' ? 1680 : 1440) + '" data-vt-h="900"><div class="vt-chrome"><i></i><i></i><i></i><span>dadadiet.com/' + kac(yol) + '</span></div><div class="vt-vp">' + cerceve + '</div></div>';
    return '<div class="vt-stage is-mobil" data-vt-sahne data-vt-w="390" data-vt-h="797"><div class="vt-phone-wrap"><div class="vt-phone vt-iphone"><span class="vt-tus vt-tus-eylem"></span><span class="vt-tus vt-tus-ses1"></span><span class="vt-tus vt-tus-ses2"></span><span class="vt-tus vt-tus-guc"></span><div class="vt-ekran"><div class="vt-durum" aria-hidden="true"><span class="vt-saat">9:41</span><span class="vt-ada"></span></div><div class="vt-vp">' + cerceve + '</div><span class="vt-ev-cizgi" aria-hidden="true"></span></div></div></div></div>';
  }
  function olcekle() {
    $$('[data-vt-sahne]', kok).forEach(function (s) {
      var vp = $('.vt-vp', s), fr = $('iframe', s);
      if (!vp || !fr) return;
      var W = +s.dataset.vtW, H = +s.dataset.vtH, o = vp.clientWidth / W;
      fr.style.setProperty('width', W + 'px');
      fr.style.setProperty('height', H + 'px');
      fr.style.setProperty('transform', 'scale(' + o + ')');
      if (!s.classList.contains('is-mobil')) vp.style.setProperty('height', Math.round(H * o) + 'px');
    });
  }
  function panel() {
    var a = ALAN[st.alan], p = $('.vt-panel', kok);
    if (!a) return;
    var c = cihazlar(a);
    if (!c[st.cihaz]) st.cihaz = c.d ? 'd' : 'm';
    var listede = st.liste.indexOf(a.k) !== -1;
    var dosya = /(^|·\s)(M|Mob) \d/.test(a.f) ? 'Görsel: ' + kac(a.f.split(' · ölçüldü')[0].replace(/^ölçüldü.*$/, '')) + ' ve logo' : 'Logo ve bir görsel<small>Sitenin kendi bileşeni kullanılır; banner tasarımı gerekmez.</small>';
    var satis = SATIS[a.st] || ['', ''];
    p.dataset.vtPane = a.k;
    p.innerHTML = '<div class="vt-p-h"><div><h3>' + kac(a.ad) + '</h3>' + (a.ac ? '<div class="vt-sub">' + kac(a.ac) + '</div>' : '') +
      '<div class="vt-chips"><span class="vt-chip t">' + kac(a.k) + '</span>' + (a.b ? '<span class="vt-chip">' + kac(a.b) + '</span>' : '') + '<span class="vt-chip">' + satis[0] + '</span>' + (a.pk.length ? '<span class="vt-chip">' + a.pk.length + ' pakette</span>' : '') + '<span class="vt-chip g" data-vt-chip-listede' + (listede ? '' : ' hidden') + '>Teklif listende</span></div></div>' +
      '<button class="btn vt-btn-o vt-btn-sm vt-zoom" type="button" data-vt-buyut>' + ik('fa-up-right-and-down-left-from-center') + 'Büyüt</button><button class="btn vt-btn-o vt-btn-sm vt-zoom-close" type="button" data-vt-kapat>' + ik('fa-xmark') + 'Kapat</button></div>' +
      '<div class="vt-tools"><div class="vt-seg" role="group" aria-label="Cihaz"><button type="button" aria-pressed="' + (st.cihaz === 'd') + '" data-vt-cihaz="d"' + (c.d ? '' : ' disabled') + '>' + ik('fa-desktop') + 'Masaüstü</button><button type="button" aria-pressed="' + (st.cihaz === 'm') + '" data-vt-cihaz="m"' + (c.m ? '' : ' disabled') + '>' + ik('fa-mobile-screen-button') + 'Mobil</button></div>' +
      (a.du === 'yerlesik' && !c.m ? '<span class="vt-devnote">' + (/^(HD-|menu\.)/.test(a.k) ? 'Mobilde menü çekmecesinde aynı hücre' : 'Bu alan mobilde basılmaz') + '</span>' : '') + '</div>' +
      '<div class="vt-cihaz">' + sahne(a, st.cihaz) + '<p class="vt-cap">' + ik('fa-circle-info') + '<span>' + (a.du === 'yerlesik' ? 'Prototipin gerçek sayfası: yalnız bu alan sitenin kendi bileşeniyle basıldı, öbür reklam alanları basılmadı. Kreatif ve logo kurgu markadır, prototip örneğidir.' : 'Alan canlı katalogda satışta; prototipte basılacağı sayfa yok.') + '</span></p></div>' +
      '<dl class="vt-spec">' +
      (a.b ? '<div><dt>Biçim</dt><dd>' + kac(a.b) + (a.bo ? '<small>' + kac(a.bo) + '</small>' : '') + '</dd></div>' : '') +
      '<div><dt>Sayfadaki ölçü</dt><dd>' + (a.d ? 'Masaüstü <b>' + kac(a.d) + '</b>' : 'Masaüstünde basılmaz') + (a.m ? ' · Mobil <b>' + kac(a.m) + '</b>' : '') + '<small>Künye ölçüsü; kreatif dosyası değil.</small></dd></div>' +
      '<div><dt>Hazırlayacağın</dt><dd>' + dosya + '</dd></div>' +
      '<div><dt>Kim görür</dt><dd><span class="vt-uyler"><span class="vt-uy acik">Misafir</span><span class="vt-uy acik">Ücretsiz</span><span class="vt-uy kapali">Pro</span><span class="vt-uy kapali">Pro Max</span></span><small>Üye türüne göre; bugün Pro ve Pro Max üyelik reklamsızdır.</small></dd></div>' +
      '<div><dt>Satış türü</dt><dd>' + satis[0] + '<small>' + satis[1].replace(':n', a.az) + '</small></dd></div>' +
      '<div><dt>Fiyat sınıfı</dt><dd>' + sinif(a.kd === 'K' ? 'K' : +a.kd) + ' <small>' + (a.kd === 'K' ? 'Kanal tarifesi' : a.kd + '. kademe · ' + KADEME[a.kd]) + '. Fiyat teklifle.</small></dd></div>' +
      '<div><dt>Paketlerde</dt><dd>' + (a.pk.length ? '<span class="vt-pk-bag">' + a.pk.map(function (x) { return '<button type="button" data-vt-paket-git="' + kac(x) + '">' + kac(x) + '</button>'; }).join(' ') + '</span>' : '<small class="vt-sifir">Hiçbir hazır pakette yok; yalnız tek tek seçilir.</small>') + '</dd></div>' +
      '<div><dt>Müsaitlik</dt><dd><select class="alan-secim" data-vt-konum aria-label="Konum"><option>Global</option><option>Türkiye</option><option>İstanbul</option><option>Ankara</option><option>İzmir</option></select><span class="vt-avail b" data-vt-musait-metin>Kasım 2026 · Müsait</span><small>Prototip örneği: canlıda konuma göre rezervasyonlardan hesaplanır.</small></dd></div>' +
      '</dl><div class="vt-p-cta"><button class="btn vt-btn-p" type="button" data-vt-listeye="' + kac(a.k) + '">' + ik(listede ? 'fa-check' : 'fa-plus') + '<span>' + (listede ? 'Listeden çıkar' : 'Teklif listeme ekle') + '</span></button><a class="btn vt-btn-l" href="#teklif">Teklif iste</a><span class="vt-note">Fiyat yazmıyoruz; kapsam ve süre netleşince teklif hazırlanır.</span></div>';
    requestAnimationFrame(olcekle);
  }
  function sec(kod, kaydir) {
    if (!ALAN[kod]) return;
    st.alan = kod;
    $$('[data-vt-alan]', kok).forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.vtAlan === kod)); });
    panel();
    if (kaydir) $('.vt-paneller', kok).scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function sekme(kod, ilkAlan) {
    $$('.vt-ptab', kok).forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.vtSekme === kod)); });
    $$('[data-vt-ray]', kok).forEach(function (r) { r.hidden = r.dataset.vtRay !== kod; });
    $$('[data-vt-cipler]', kok).forEach(function (r) { r.hidden = r.dataset.vtCipler !== kod; });
    if (ilkAlan !== false) { var ilk = $('[data-vt-ray="' + kod + '"] [data-vt-alan]', kok); if (ilk) sec(ilk.dataset.vtAlan); }
  }
  function alanaGit(kod) {
    var a = ALAN[kod]; if (!a) return;
    sekme(a.sk, false); sec(kod);
    kok.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  /* ── Teklif listesi ────────────────────────────────────── */
  var LP = $('[data-vt-liste-panel]'), FAB = $('[data-vt-fab]'), SECIM = document.getElementById('tSecim');
  function gruplar() {
    var g = {};
    st.liste.forEach(function (k) { var s = ALAN[k].ad.split(' · ')[0]; (g[s] = g[s] || []).push(ALAN[k]); });
    return Object.keys(g).map(function (s) { return { sayfa: s, alanlar: g[s] }; });
  }
  function satir(a, sayfa) { return '<li class="vt-oz-satir"><span class="vt-oz-ad"><b>' + kac(a.ad.split(' · ').slice(1).join(' · ') || a.ad) + '</b><small>' + kac(a.k) + (sayfa ? ' · ' + kac(sayfa) : '') + '</small></span><button type="button" class="vt-oz-cikar" data-vt-cikar="' + kac(a.k) + '" aria-label="' + kac(a.ad) + ' (' + kac(a.k) + ') alanını listeden çıkar">' + ik('fa-xmark') + '</button></li>'; }
  function ozet() { var g = gruplar(); return g.length + ' sayfa · ' + st.liste.length + ' alan'; }
  function listeCiz() {
    $$('.vt-ri', kok).forEach(function (b) { b.classList.toggle('has', st.liste.indexOf(b.dataset.vtAlan) !== -1); });
    if (FAB) { FAB.hidden = !st.liste.length; $('[data-vt-fab-metin]', FAB).textContent = 'Teklif listen · ' + st.liste.length + ' alan'; }
    if (SECIM) {
      SECIM.classList.toggle('vt-oz', !!st.liste.length);
      SECIM.innerHTML = st.liste.length ? '<p class="alan-yardim"><span>' + ozet() + '</span></p><ul class="vt-oz-liste">' + gruplar().map(function (o) { return o.alanlar.map(function (a) { return satir(a, o.sayfa); }).join(''); }).join('') + '</ul>' : 'Henüz alan eklemedin; yukarıdaki önizlemeden ekleyebilirsin.';
    }
    if (LP && !LP.hidden) lpCiz();
    var p = $('.vt-panel', kok), b = p && $('[data-vt-listeye]', p);
    if (b) { var listede = st.liste.indexOf(b.dataset.vtListeye) !== -1; b.innerHTML = ik(listede ? 'fa-check' : 'fa-plus') + '<span>' + (listede ? 'Listeden çıkar' : 'Teklif listeme ekle') + '</span>'; var c = $('[data-vt-chip-listede]', p); if (c) c.hidden = !listede; }
  }
  function lpCiz() {
    var gov = $('[data-vt-lp-govde]', LP);
    $('[data-vt-lp-sayi]', LP).textContent = st.liste.length ? ozet() : '';
    $('[data-vt-lp-temizle]', LP).hidden = !st.liste.length;
    gov.innerHTML = st.liste.length ? gruplar().map(function (o) { return '<section class="vt-lp-grup"><h4>' + kac(o.sayfa) + ' · ' + o.alanlar.length + '</h4><ul class="vt-oz-liste">' + o.alanlar.map(function (a) { return satir(a, null); }).join('') + '</ul></section>'; }).join('') : '<p class="vt-lp-bos">Listen boş. Önizlemelerdeki "Teklif listeme ekle" ile alan ekle.</p>';
  }
  function lpAc(ac) { if (!LP) return; LP.hidden = !ac; if (FAB) FAB.setAttribute('aria-expanded', String(ac)); if (ac) lpCiz(); }
  function listeye(kod) {
    var i = st.liste.indexOf(kod);
    if (i === -1) { st.liste.push(kod); if (DD.toast) DD.toast(ALAN[kod].ad + ' teklif listene eklendi.'); } else st.liste.splice(i, 1);
    listeCiz();
  }

  /* ── Teklif formu ──────────────────────────────────────── */
  var tur = document.getElementById('tTur');
  function turSec(d) {
    $$('[data-tur-alani]').forEach(function (n) { n.hidden = n.dataset.turAlani !== d; });
    if (tur) $$('button', tur).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.deger === d)); });
  }
  if (tur) tur.addEventListener('dd:secim', function (e) { turSec(e.detail.deger); });
  var paket = document.getElementById('tPaket'), ekler = document.getElementById('tEkler'), ekNot = document.getElementById('tEkUyum');
  function ekGuncelle() {
    var o = paket && paket.selectedOptions[0], urun = o && o.dataset.set === 'urun';
    if (ekler) { ekler.hidden = !urun; if (!urun) $$('input', ekler).forEach(function (c) { c.checked = false; }); }
    if (ekNot) ekNot.hidden = urun;
  }
  if (paket) { paket.addEventListener('change', ekGuncelle); ekGuncelle(); }

  /* Ülke kodlu telefon: canlı UlkeKodlari (199 ülke, Türkiye başta) */
  var ULKE = 'TR|90|Türkiye,DE|49|Almanya,US|1|Amerika Birleşik Devletleri,GB|44|Birleşik Krallık,AZ|994|Azerbaycan,NL|31|Hollanda,FR|33|Fransa,AT|43|Avusturya,BE|32|Belçika,CH|41|İsviçre,SE|46|İsveç,NO|47|Norveç,DK|45|Danimarka,FI|358|Finlandiya,IT|39|İtalya,ES|34|İspanya,PT|351|Portekiz,GR|30|Yunanistan,BG|359|Bulgaristan,RO|40|Romanya,RS|381|Sırbistan,HR|385|Hırvatistan,SI|386|Slovenya,BA|387|Bosna-Hersek,MK|389|Kuzey Makedonya,AL|355|Arnavutluk,ME|382|Karadağ,XK|383|Kosova,HU|36|Macaristan,PL|48|Polonya,CZ|420|Çekya,SK|421|Slovakya,UA|380|Ukrayna,RU|7|Rusya,BY|375|Belarus,MD|373|Moldova,GE|995|Gürcistan,AM|374|Ermenistan,KZ|7|Kazakistan,UZ|998|Özbekistan,TM|993|Türkmenistan,KG|996|Kırgızistan,TJ|992|Tacikistan,CY|357|Kıbrıs,IE|353|İrlanda,IS|354|İzlanda,LU|352|Lüksemburg,MT|356|Malta,EE|372|Estonya,LV|371|Letonya,LT|370|Litvanya,QA|974|Katar,AE|971|Birleşik Arap Emirlikleri,SA|966|Suudi Arabistan,KW|965|Kuveyt,BH|973|Bahreyn,OM|968|Umman,JO|962|Ürdün,LB|961|Lübnan,SY|963|Suriye,IQ|964|Irak,IR|98|İran,IL|972|İsrail,PS|970|Filistin,YE|967|Yemen,EG|20|Mısır,LY|218|Libya,TN|216|Tunus,DZ|213|Cezayir,MA|212|Fas,SD|249|Sudan,SS|211|Güney Sudan,ET|251|Etiyopya,SO|252|Somali,KE|254|Kenya,TZ|255|Tanzanya,UG|256|Uganda,RW|250|Ruanda,NG|234|Nijerya,GH|233|Gana,CI|225|Fildişi Sahili,SN|221|Senegal,CM|237|Kamerun,ZA|27|Güney Afrika,ZW|263|Zimbabve,ZM|260|Zambiya,MZ|258|Mozambik,AO|244|Angola,NA|264|Namibya,BW|267|Botsvana,MG|261|Madagaskar,MU|230|Mauritius,CN|86|Çin,JP|81|Japonya,KR|82|Güney Kore,KP|850|Kuzey Kore,IN|91|Hindistan,PK|92|Pakistan,BD|880|Bangladeş,LK|94|Sri Lanka,NP|977|Nepal,AF|93|Afganistan,TH|66|Tayland,VN|84|Vietnam,MY|60|Malezya,SG|65|Singapur,ID|62|Endonezya,PH|63|Filipinler,MM|95|Myanmar,KH|855|Kamboçya,LA|856|Laos,MN|976|Moğolistan,HK|852|Hong Kong,TW|886|Tayvan,MO|853|Makao,AU|61|Avustralya,NZ|64|Yeni Zelanda,FJ|679|Fiji,PG|675|Papua Yeni Gine,CA|1|Kanada,MX|52|Meksika,BR|55|Brezilya,AR|54|Arjantin,CL|56|Şili,CO|57|Kolombiya,PE|51|Peru,VE|58|Venezuela,EC|593|Ekvador,BO|591|Bolivya,PY|595|Paraguay,UY|598|Uruguay,CR|506|Kosta Rika,PA|507|Panama,GT|502|Guatemala,HN|504|Honduras,SV|503|El Salvador,NI|505|Nikaragua,CU|53|Küba,DO|1|Dominik Cumhuriyeti,JM|1|Jamaika,TT|1|Trinidad ve Tobago,PR|1|Porto Riko,BS|1|Bahamalar,BB|1|Barbados,HT|509|Haiti,BZ|501|Belize,GY|592|Guyana,SR|597|Surinam,AD|376|Andorra,MC|377|Monako,SM|378|San Marino,VA|379|Vatikan,LI|423|Liechtenstein,FO|298|Faroe Adaları,GL|299|Grönland,GI|350|Cebelitarık,BN|673|Brunei,BT|975|Bhutan,MV|960|Maldivler,TL|670|Doğu Timor,NC|687|Yeni Kaledonya,PF|689|Fransız Polinezyası,VU|678|Vanuatu,SB|677|Solomon Adaları,TO|676|Tonga,WS|685|Samoa,KI|686|Kiribati,NR|674|Nauru,TV|688|Tuvalu,FM|691|Mikronezya,MH|692|Marshall Adaları,PW|680|Palau,CV|238|Yeşil Burun,GM|220|Gambiya,GN|224|Gine,GW|245|Gine-Bissau,SL|232|Sierra Leone,LR|231|Liberya,TG|228|Togo,BJ|229|Benin,NE|227|Nijer,BF|226|Burkina Faso,ML|223|Mali,MR|222|Moritanya,TD|235|Çad,CF|236|Orta Afrika Cumhuriyeti,CG|242|Kongo,CD|243|Demokratik Kongo,GA|241|Gabon,GQ|240|Ekvator Ginesi,ST|239|Sao Tome ve Principe,BI|257|Burundi,DJ|253|Cibuti,ER|291|Eritre,MW|265|Malavi,LS|266|Lesotho,SZ|268|Esvatini,KM|269|Komorlar,SC|248|Seyşeller'.split(',').map(function (x) { return x.split('|'); });
  var ulkeDugme = document.getElementById('tUlke'), katman = document.getElementById('tUlkeKatman');
  if (ulkeDugme && katman) {
    $('.alan-ulke-liste', katman).innerHTML = ULKE.map(function (u) { return '<li role="option" tabindex="0" data-ulke="' + u[0] + '"><span class="bayrak">' + u[0] + '</span><span class="ad">' + u[2] + '</span><span class="kod">+' + u[1] + '</span></li>'; }).join('');
    var ulkeYaz = function (iso) {
      var u = ULKE.find(function (x) { return x[0] === iso; }) || ULKE[0];
      $('.alan-ulke-bayrak', ulkeDugme).textContent = u[0]; $('.alan-ulke-kod', ulkeDugme).textContent = '+' + u[1];
      ulkeDugme.setAttribute('aria-label', 'Ülke kodu: ' + u[2] + ' +' + u[1]);
      document.getElementById('tTelefonUlke').value = u[0];
      document.getElementById('tTelefon').placeholder = u[0] === 'TR' ? '5__ ___ __ __' : 'Telefon numarası';
    };
    ulkeDugme.addEventListener('click', function () { katman.hidden = !katman.hidden; ulkeDugme.setAttribute('aria-expanded', String(!katman.hidden)); });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ulke]');
      if (b) ulkeYaz(b.dataset.ulke);
      if (!e.target.closest('[data-vt-telefon]') || b) { katman.hidden = true; ulkeDugme.setAttribute('aria-expanded', 'false'); }
    });
    katman.addEventListener('keydown', function (e) { var b = e.target.closest('[data-ulke]'); if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); b.click(); } });
  }

  /* ── Olaylar ───────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('.vt-ptab'))) return sekme(t.dataset.vtSekme);
    if ((t = e.target.closest('[data-vt-alan]'))) return sec(t.dataset.vtAlan, matchMedia('(max-width: 760px)').matches);
    if ((t = e.target.closest('[data-vt-cihaz]'))) { st.cihaz = t.dataset.vtCihaz; return panel(); }
    if ((t = e.target.closest('[data-vt-buyut]'))) { $('.vt-panel', kok).classList.add('is-zoom'); return requestAnimationFrame(olcekle); }
    if ((t = e.target.closest('[data-vt-kapat]'))) { $('.vt-panel', kok).classList.remove('is-zoom'); return requestAnimationFrame(olcekle); }
    if ((t = e.target.closest('[data-vt-listeye]'))) return listeye(t.dataset.vtListeye);
    if ((t = e.target.closest('[data-vt-cikar]'))) return listeye(t.dataset.vtCikar);
    if ((t = e.target.closest('[data-vt-onizle]'))) return alanaGit(t.dataset.vtOnizle);
    if ((t = e.target.closest('[data-vt-paket-git]'))) { var s = $('#paketler'); if (s) s.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
    if ((t = e.target.closest('[data-vt-fab]'))) { e.preventDefault(); return lpAc(LP.hidden); }
    if ((t = e.target.closest('[data-vt-lp-kapat]'))) return lpAc(false);
    if ((t = e.target.closest('[data-vt-lp-temizle]'))) { st.liste = []; return listeCiz(); }
    if ((t = e.target.closest('[data-vt-lp-forma]'))) { lpAc(false); turSec('ozel'); return; }
    if ((t = e.target.closest('[data-paket]'))) turSec('paket');
  });
  document.addEventListener('change', function (e) { if (e.target.matches('[data-vt-konum]')) { var m = $('[data-vt-musait-metin]', kok); if (m) m.textContent = 'Kasım 2026 · ' + e.target.value + ' · Müsait'; } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var p = $('.vt-panel.is-zoom', kok); if (p) { p.classList.remove('is-zoom'); olcekle(); } if (LP && !LP.hidden) lpAc(false); } });
  addEventListener('resize', olcekle);
  sec(st.alan);
  listeCiz();
})();
