/* =====================================================================
   DD-SHELL.JS — DADADİET PUBLIC KABUK (paylaşılan)
   37 public Diet sayfasının ortak kabuğunu çalışma anında üretir ve
   davranışlarını bağlar. assets/js/sa-shell.js'in public kardeşi.

   Sayfa kendini <body data-*> ile tanıtır:
     data-nav            aktif üst nav kalemi. İA revizyonundan sonra dört
                         başlık var: araclar | beslenme | programlar |
                         diyetisyenler   (boş = hiçbiri aktif değil)
                         37 mevcut sayfa hâlâ eski altı değeri yazıyor;
                         NAVMAP bunları çalışma anında yeni başlığa çevirir,
                         böylece 37 dosyaya dokunulmadı.
     data-hero="1"       header hero üstünde şeffaf başlar (heroMode)
     data-nav-mark="drawer"
                         GEÇİCİ SADAKAT BAYRAĞI — sayfa bugün drawer kalemini
                         de active işaretliyor ve aria-current basıyorsa.
                         37 sayfanın 6'sında var, 31'inde yok; bottom-nav'da
                         hiçbirinde yok. Bu tutarsızlık ayırma turunda BİREBİR
                         korunuyor. Normalleştirme ayrı commit, ayrı onay.

   Sayfa iskeleti:
     <div id="ddChromeTop"></div>
     <script src="assets/js/dd-shell.js"></script>
     <main class="page-main" id="pageMain"> … </main>
     <div id="ddChromeBottom"></div>   (= gate + footer + fab, kanonik sıra)
     <script> … SAYFA JS … </script>

   Yerleştirme yer tutucuyu DEĞİŞTİRİR (outerHTML), sarmalayıcı bırakmaz —
   DOM ayırma öncesiyle birebir aynı kalır.

   ÇALIŞMA SIRASI (bugünkü gömülü sıra korunur):
     A) hemen: üst krom markup'ı → giriş durumu → SS paramları → heroMode
        (giriş durumu SAYFA JS'inden ÖNCE çalışmalı: body.is-auth)
     B) DOMContentLoaded: alt krom markup'ı → kabuk davranışları →
        alt katman yöneticisi → DadaMentor/reveal/scroll-top
        (alt katman yöneticisi window.__bottomStrips'i SAYFA JS'inden SONRA
         okumalı — bugünkü sözleşme)
   ===================================================================== */
(function(){

/* =====================================================================
   BAĞLANTI HARİTASI — kabuk hiçbir hedefi literal yazmaz.
   ✗ işaretliler bu repoda HENÜZ YOK; hedefleri değiştirmedik, yalnız tek
   yere topladık. Sayfa üretildiğinde / yolu değiştiğinde tek satır düzelir.
   ===================================================================== */
var L = {
  /* --- bu repoda VAR --- */
  saglikHub:        'saglik-hub-v1.html',       /* Diet ana sayfası — logo buraya döner */
  saglikAraclari:   'saglik-araclari-v1.html',  /* menü merkezi 1 */
  hesaplayicilar:   'hesaplayicilar-v1.html',   /* hesaplayıcı listesi — merkezden ayrı sayfa */
  beslenmeHub:      'beslenme-hub-v1.html',     /* menü merkezi 2 */
  banaUygun:        'bana-uygun-olani-bul-v1.html', /* ortak başlangıç — ana menüde DEĞİL */
  programBul:       'program-bul-v1.html',
  programSure:      'program-sure-v1.html',  /* Süreye Göre sihirbazı (11. tur) */
  hesaplayici:      'beden-kutle-endeksi-v1.html',
  besinKutuphanesi: 'besin-kutuphanesi-v1.html',
  besinDegerleri:   'besin-degerleri-v1.html',
  /* Beslenme Rehberi ayrı bir sayfa değil, merkez sayfanın rehber bölümüdür —
     iki kapı yerine tek yer (9. tur). Eski beslenme-rehberi-v1.html silindi. */
  beslenmeRehberi:  'beslenme-hub-v1.html',
  dengeliTabak:     'beslenme-dengeli-tabak-v1.html', /* Beslenme mega'sının öne çıkan rehberi */
  beslenmeIpuclari: 'beslenme-ipuclari-v1.html',  /* Beslenme'nin dördüncü modülü (9. tur) */
  kacKalori:        'kac-kalori-v1.html',         /* Beslenme'nin beşinci modülü — İpuçları'nın kardeşi (12. tur) */
  pufNoktalari:     'diyet-puf-noktalari-v1.html', /* Beslenme'nin altıncı modülü — düz blog yazısı (15. tur) */
  programlar:       'diyet-listeleri-v1.html',  /* menü merkezi 3 */
  programDetay:     'diyet-program-detay-v1.html',
  testler:          'saglik-testler-v1.html',
  diyetisyenler:    'diyetisyen-dizin-v1.html', /* menü merkezi 4 */
  diyetisyenBul:    'diyetisyen-bul-v1.html',
  diyetisyenOl:     'diyetisyen-ol-v1.html',
  arama:            'arama-diet-v1.html',
  /* --- kişisel alan (İA 3. faz) — tam harita assets/js/planim.js içinde --- */
  planim:           'planim-v1.html',
  planimGunluk:     'planim-gunluk-takip-v1.html',
  planimProgram:    'planim-programim-v1.html',
  planimIlerleme:   'planim-ilerlemem-v1.html',
  planimAlisveris:  'planim-alisveris-v1.html',
  planimRandevu:    'planim-randevularim-v1.html',
  planimMesaj:      'planim-mesajlarim-v1.html',
  planimKayit:      'planim-kaydettiklerim-v1.html',
  planimProfil:     'planim-saglik-profilim-v1.html',
  planimVeri:       'planim-veri-izinler-v1.html',

  /* --- bu repoda YOK (5 hedef) --- */
  portal:           'anasayfa-portal-v3a.html',   /* ✗ */
  yasal:            'yasal-v1.html',              /* ✗ */
  dadafit:          'dadafit-hub-v1.html',        /* ✗ */
  kesfet:           'kesfet-v1.html',             /* ✗ */
  akademi:          'akademi-v1.html'             /* ✗ */
};

/* =====================================================================
   data-nav EŞLEMESİ — altı başlık dörde indi, 37 sayfaya DOKUNULMADI.
   Sayfalar eski değeri yazmaya devam eder; kabuk burada yeni başlığa çevirir.
   Yeni sayfalar doğrudan yeni değeri yazabilir (eşleme kimlik olur).
   ===================================================================== */
var NAVMAP = {
  hesaplayicilar: 'araclar',       /* 10 hesaplayıcı sayfası */
  testler:        'araclar',       /* saglik-testler + test-detay */
  besin:          'beslenme',      /* besin-degerleri, kalori-cetveli, kütüphane */
  beslenme:       'beslenme',      /* beslenme-rehberi + 5 alt rehber */
  programlar:     'programlar',
  diyetisyenler:  'diyetisyenler'
};

/* ---- sayfa parametreleri ---- */
var B    = document.body;
var RAW  = B.getAttribute('data-nav') || '';
var NAV  = NAVMAP[RAW] || RAW;
var MARK = B.getAttribute('data-nav-mark') || '';

/* ============================================================================
   BANNER GRUPLARI — tek kaynak
   ----------------------------------------------------------------------------
   Banner taşıyan public sayfalar iki role ayrılır ve her rol KENDİ İÇİNDE tek
   bir banner yüksekliğinde durur. Ölçüler dd-shell.css'teki iki blokta; üyelik
   burada. Sayfalar kendi yüksekliğini taşımaz, bu listeye eklenir.

     liste  — modülün merkezi ya da listesi: arama, kütüphane, hub, dizin,
              araç/test listeleri, program listesi, besin ve makro tabloları.
     detay  — tek bir şeyin sayfası: hesaplayıcı, program, test, rehber yazısı,
              ipucu ve kalori yazısı.

   Gruba GİRMEYENLER ve nedeni:
     saglik-hub-v1        tam ekran hero (min-height:100vh) — onaylanmış istisna
     diyetisyen-profil-v1 banner'ı bölüm zemini değil .pf-banner kapak görseli —
                          onaylanmış istisna (HANDOFF §5.1)
     Planım ailesi (10)   banner YOK, olmayacak (HANDOFF §5.1)
     sihirbaz dörtlüsü    KENDİ grubu var (BG_SIHIRBAZ). 17. turda krem zemin
                          koyu görselli banner'a döndü; yine de liste/detay
                          ölçüsüne çekilmez, çünkü banner'ın hemen altındaki
                          sihirbaz kartı yukarıda durmalı. Kendi içinde eşit.
   ============================================================================ */
var BG_LISTE = ['arama-diet-v1','besin-kutuphanesi-v1','besin-degerleri-v1',
  'besin-kalori-cetveli-v1','protein-rehberi-v1','karbonhidrat-rehberi-v1',
  'yag-rehberi-v1','beslenme-hub-v1','beslenme-ipuclari-v1','kac-kalori-v1',
  'diyet-puf-noktalari-v1',
  'diyet-listeleri-v1','diyetisyen-dizin-v1','diyetisyen-ol-v1',
  'hesaplayicilar-v1','saglik-araclari-v1','saglik-testler-v1'];

var BG_DETAY = ['bazal-metabolizma-v1','beden-kutle-endeksi-v1','gunluk-kalori-v1',
  'gunluk-su-v1','hedef-kilo-suresi-v1','ideal-kilo-v1','makro-dagilim-v1',
  'porsiyon-hesaplama-v1','vucut-tipi-v1','vucut-yag-orani-v1','test-detay-v1',
  'diyet-program-aile-v1','diyet-program-detay-v1','diyet-program-detoks-v1',
  'diyet-program-ogrenci-v1','diyet-program-oruc-v1','diyet-program-protein-v1',
  'diyet-program-seker-v1','diyet-program-vegan-v1',
  'beslenme-alisveris-etiket-v1','beslenme-dengeli-tabak-v1',
  'beslenme-su-ve-icecek-v1','beslenme-disarida-yemek-v1','beslenme-atistirmalik-v1',
  'diyet-puf-noktasi-detay-v1',
  'beslenme-ogun-planlama-v1','beslenme-porsiyon-kontrolu-v1',
  'beslenme-saglikli-mutfak-v1','beslenme-ipucu-detay-v1','kac-kalori-detay-v1'];

var BG_SIHIRBAZ = ['bana-uygun-olani-bul-v1','program-bul-v1','program-sure-v1',
  'diyetisyen-bul-v1'];

var PAGE = (location.pathname.split('/').pop() || 'index').replace(/\.html$/,'');
var BGRP = BG_LISTE.indexOf(PAGE)    > -1 ? 'liste'
         : BG_DETAY.indexOf(PAGE)    > -1 ? 'detay'
         : BG_SIHIRBAZ.indexOf(PAGE) > -1 ? 'sihirbaz' : '';
if(BGRP) B.setAttribute('data-banner', BGRP);

/* Şeffaf header — KOYU banner taşıyan her sayfada. data-hero="1" elle yazılmış
   hâli korunur (saglik-hub-v1 gruplara girmiyor ama tam ekran koyu hero'su var);
   iki banner grubu ise otomatik açılır, sayfalara bayrak yazılmaz.
   17. turdan beri sihirbaz dörtlüsü de kapsamda: .wzp-top artık koyu görselli
   banner taşıyor. Dışarıda kalan tek banner sayfası diyetisyen-profil-v1;
   .pf-top zemini beyaz, beyaz metin okunmaz — onda header katı kalır. */
var HERO = B.getAttribute('data-hero') === '1' || BGRP === 'liste' || BGRP === 'detay' || BGRP === 'sihirbaz';

function AC(k){ return NAV === k ? ' class="active"' : ''; }          /* üst nav */
function AD(k){ return (NAV === k && MARK === 'drawer') ? ' active' : ''; }  /* drawer */
function ARIA(k){ return (NAV === k && MARK === 'drawer') ? ' aria-current="page"' : ''; }

/* Karşılığı henüz olmayan menü kalemi: href YOK (boş diyez de yok), görünür
   "Yakında" rozeti + sönük görünüm. Tıklanabilir görünmez, hiçbir yere gitmez. */
var SOON = ' style="opacity:.55;cursor:default;pointer-events:none"';
var SOONB = ' <span class="soon">Yakında</span>';

/* =====================================================================
   ÜST KROM — topbar + header + drawer + bottom-nav + görüş modalı + çerez
   ===================================================================== */
function topHTML(){ return `
<!-- ===== TOP UTILITY BAR ===== -->
<div class="topbar">
  <div class="wrap">
    <div class="tb-left">
      <a href="${L.besinDegerleri}"><i class="fa-solid fa-leaf" style="color:var(--tomato)"></i> 2.400+ besin değeri</a>
      <span class="tb-div"></span>
      <div class="tb-soc">
        <a><i class="fa-brands fa-instagram"></i></a>
        <a><i class="fa-brands fa-youtube"></i></a>
        <a><i class="fa-brands fa-pinterest"></i></a>
      </div>
    </div>
    <div class="tb-right">
      <nav class="brand-switch" aria-label="DadaMentor dünyaları">
        <a class="bs-item bs-gastro" href="${L.portal}" title="DadaGastro"><i class="fa-solid fa-utensils"></i><span class="bs-name"><span class="bd">Dada</span><span class="sf">Gastro</span></span></a>
        <a class="bs-item bs-diet is-active" href="${L.saglikHub}" aria-current="page"><i class="fa-solid fa-leaf"></i><span class="bs-name"><span class="bd">Dada</span><span class="sf">Diet</span></span></a>
        <a class="bs-item bs-fit" href="${L.dadafit}" title="DadaFit"><i class="fa-solid fa-dumbbell"></i><span class="bs-name"><span class="bd">Dada</span><span class="sf">Fit</span></span></a>
        <a class="bs-item bs-gourmet" href="${L.kesfet}" title="DadaGourmet"><i class="fa-solid fa-map-location-dot"></i><span class="bs-name"><span class="bd">Dada</span><span class="sf">Gourmet</span></span></a>
        <a class="bs-item bs-campus" href="${L.akademi}" title="DadaCampus"><i class="fa-solid fa-graduation-cap"></i><span class="bs-name"><span class="bd">Dada</span><span class="sf">Campus</span></span></a>
      </nav>

      <div class="tb-lang" id="tbLang">
        <button class="tb-lang-btn" id="tbLangBtn" type="button" aria-haspopup="true" aria-expanded="false">
          <i class="fa-solid fa-globe"></i><span>TR</span><i class="fa-solid fa-chevron-down tb-lang-caret"></i>
        </button>
        <div class="tb-lang-menu" id="tbLangMenu" role="menu">
          <a role="menuitem" class="active" data-lang="tr" style="cursor:pointer">TR <span>Türkçe</span></a>
          <a role="menuitem" data-lang="en" style="cursor:pointer">EN <span>English</span></a>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ===== HEADER ===== -->
<header class="header">
  <!-- TEK KAT: marka + ortalanmış nav + aksiyonlar (Revize T3 M2) -->
  <div class="h-top">
    <div class="wrap">
      <a class="brand dd-brand" href="${L.saglikHub}" aria-label="DadaDiet — Sağlıklı Yaşam">
        <svg class="dd-mark" viewBox="0 0 44 44" aria-hidden="true">
          <rect x="3" y="3" width="38" height="38" rx="11" fill="#3BB77E"/>
          <path d="M30 12 C20 12 14 18 14 27 C14 28.4 14.2 29.7 14.6 31 C24 31 31 25 31 14.2 C31 13.4 30.6 12.7 30 12 Z" fill="#fff" opacity=".96"/>
          <path d="M16 31 C18 24 22 18 29 14" stroke="#3BB77E" stroke-width="2.1" fill="none" stroke-linecap="round"/>
          <path d="M22 23 l2.4 0 1.5 -3 2 5.4 1.4 -2.4 2.1 0" stroke="#3BB77E" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>
        </svg>
        <span class="dd-word"><b>Dada</b><span class="dd-st">Diet</span></span>
      </a>
      <!-- DÖRT BAŞLIK — her biri kendi merkez sayfasına giden GERÇEK bağlantı;
           panel yalnız hover ile açılır, başlık tıklanınca merkeze gidilir.
           Dördü de aynı mega dilinde: .mega-cats üç kısa sütun + .mega-feat. -->
      <nav class="nav">
        <!-- SAĞLIK ARAÇLARI — dar dikey açılır liste (.dropdown; kabukta tanımlı,
             markup'ı 7. turdan beri boştu). İki kalem alt alta. Merkez sayfaya
             başlığın kendisi gidiyor, ikinci bir "Tüm Sağlık Araçları" kapısı yok. -->
        <div class="nav-item">
          <a href="${L.saglikAraclari}"${AC('araclar')}${ARIA('araclar')}>Sağlık Araçları<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></a>
          <div class="dropdown dd-col">
            <a href="${L.hesaplayicilar}"><i class="fa-solid fa-calculator"></i> <span>Hesaplayıcılar<small>BKİ, kalori, su, makro, porsiyon</small></span></a>
            <a href="${L.testler}"><i class="fa-solid fa-clipboard-question"></i> <span>Testler<small>Alışkanlığını birkaç soruda ölç</small></span></a>
          </div>
        </div>

        <div class="nav-item has-mega">
          <a href="${L.beslenmeHub}"${AC('beslenme')}${ARIA('beslenme')}>Beslenme<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></a>
          <div class="mega">
            <div class="wrap">
              <div class="mega-grid">
                <div class="mega-cats">
                  <a href="${L.beslenmeRehberi}"><i class="fa-solid fa-book-open"></i> <span>Beslenme Rehberi<small>Dengeli tabak, öğün, porsiyon</small></span></a>
                  <a href="${L.besinKutuphanesi}"><i class="fa-solid fa-magnifying-glass"></i> <span>Besin Kütüphanesi<small>2.400+ besinin değeri</small></span></a>
                  <a href="${L.beslenmeIpuclari}"><i class="fa-solid fa-lightbulb"></i> <span>Beslenme İpuçları<small>Kısa, uygulanabilir yazılar</small></span></a>
                  <a href="${L.kacKalori}"><i class="fa-solid fa-fire"></i> <span>Kaç Kalori?<small>Porsiyon karşılıkları ve alternatifler</small></span></a>
                  <a href="${L.pufNoktalari}"><i class="fa-solid fa-lightbulb"></i> <span>Diyetin Püf Noktaları<small>Mutfakta işe yarayan pratik bilgiler</small></span></a>
                  <a${SOON}><i class="fa-solid fa-utensils"></i> <span>Sağlıklı Tarifler${SOONB}<small>Sağlık odaklı tarif koleksiyonu</small></span></a>
                </div>
                <div class="mega-feat">
                  <a class="mf-fig" href="${L.dengeliTabak}" style="background-image:url('https://images.unsplash.com/photo-1467453678174-768ec283a940?w=700&q=80&auto=format&fit=crop&exp=7&gam=6&sat=-9&high=8&vib=5')">
                    <span class="r-chip">Rehber</span>
                    <h4>Dengeli bir tabak nasıl kurulur?</h4>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="nav-item has-mega">
          <a href="${L.programlar}"${AC('programlar')}${ARIA('programlar')}>Programlar<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></a>
          <div class="mega">
            <div class="wrap">
              <div class="mega-grid">
                <div class="mega-cats">
                  <a class="mega-cat-all" href="${L.programlar}"><i class="fa-solid fa-clipboard-list"></i> <span>Tüm Programlar<small>8 hazır beslenme programı</small></span><i class="fa-solid fa-arrow-right mca-arrow"></i></a>
                  <a href="${L.programlar}?hedef=tumu"><i class="fa-solid fa-bullseye"></i> <span>Hedefe Göre<small>Kilo ver, dengelen, kas yap</small></span></a>
                  <a href="${L.programlar}?yasam=tumu"><i class="fa-solid fa-people-roof"></i> <span>Yaşam Biçimine Göre<small>Aile, öğrenci, sporcu, bitkisel</small></span></a>
                  <a href="${L.programSure}"><i class="fa-regular fa-calendar"></i> <span>Süreye Göre<small>Kaç gün, günde ne kadar vakit</small></span></a>
                  <a href="${L.programBul}"><i class="fa-solid fa-wand-magic-sparkles"></i> <span>Programını Bul<small>Beş soruyla eşleştirme</small></span></a>
                </div>
                <div class="mega-feat">
                  <a class="mf-fig" href="${L.programDetay}" style="background-image:url('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&q=80&auto=format&fit=crop&exp=7&gam=6&sat=-9&high=8&vib=5')">
                    <span class="r-chip">Popüler</span>
                    <h4>Akdeniz Tipi Beslenme — 7 günlük</h4>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- DİYETİSYENLER — AÇILIR PANEL YOK. Ne mega ne dar dropdown: başlık
             doğrudan dizine giden tek bağlantıdır, bu yüzden ok da taşımaz.
             Altı kalem (Sana Uygun Diyetisyeni Bul · Tüm Diyetisyenler ·
             Uzmanlık Alanları · Online Görüşme · Randevularım · Diyetisyen Ol)
             menüden çıktı; girişleri sayfa gövdelerinde duruyor (dizin
             banner'ındaki ikili düğme, profil sayfası, Planım alt gezinmesi). -->
        <div class="nav-item">
          <a href="${L.diyetisyenler}"${AC('diyetisyenler')}${ARIA('diyetisyenler')}>Diyetisyenler</a>
        </div>
      </nav>
      <!-- SAĞ BLOK — arama · Planım · Giriş Yap / Hesabım (İA revizyonu, sabit sıra).
           Planım ana menüye girmez; kişisel buton olarak burada durur ve her iki
           giriş durumunda da görünür. Hedefi henüz yok → görünür Yakında. -->
      <div class="head-actions">
        <button class="icon-btn" aria-label="DadaDiet içeriğinde ara" onclick="location.href='${L.arama}'"><i class="fa-solid fa-magnifying-glass"></i></button>
        <a class="btn-login" href="${L.planim}"><i class="fa-solid fa-list-check"></i> Planım</a>
        <button class="btn-login" id="btnLogin" onclick="location.search='?auth=1'"><i class="fa-regular fa-user"></i> Giriş Yap</button>
        <!-- LOGIN-STATE: hesap avatarı ▾ (logged-in) — persona Elif Şahin -->
        <div class="acct-item acct-wrap">
          <button class="acct-btn" aria-label="Hesabım" aria-haspopup="true">
            <span class="acct-ava" style="background-image:url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&exp=7&gam=6&sat=-9&high=8&vib=5')"></span>
            <i class="fa-solid fa-chevron-down acct-caret"></i>
          </button>
          <div class="acct-menu">
            <div class="acct-id">
              <span class="acct-ava" style="background-image:url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&exp=7&gam=6&sat=-9&high=8&vib=5')"></span>
              <span class="acct-id-txt"><b>Elif Şahin</b><small>@elifsahin</small></span>
            </div>
            <div class="acct-div"></div>
            <!-- KİŞİSEL ALAN (İA 3. faz) — menü artık Dada Diet Planım alanıdır.
                 Önceki hâli DadaGastro dilindeydi (Mutfak Defterim, Tariflerim,
                 Menülerim, Pro Menü…) ve 11 hedefi bu repoda yoktu. -->
            <a href="${L.planim}"><i class="fa-solid fa-house"></i> <span>Planım<small>Bugünün özeti</small></span></a>
            <a href="${L.planimGunluk}"><i class="fa-solid fa-utensils"></i> <span>Günlük Takip</span></a>
            <a href="${L.planimProgram}"><i class="fa-solid fa-clipboard-list"></i> <span>Programım</span></a>
            <a href="${L.planimIlerleme}"><i class="fa-solid fa-chart-line"></i> <span>İlerlemem</span></a>
            <a href="${L.planimAlisveris}"><i class="fa-solid fa-basket-shopping"></i> <span>Alışveriş Listem</span></a>
            <a href="${L.planimRandevu}"><i class="fa-regular fa-calendar-check"></i> <span>Randevularım</span></a>
            <a href="${L.planimMesaj}"><i class="fa-solid fa-comment-dots"></i> <span>Mesajlarım</span></a>
            <a href="${L.planimKayit}"><i class="fa-solid fa-bookmark"></i> <span>Kaydettiklerim</span></a>
            <div class="acct-div"></div>
            <a href="${L.planimProfil}"><i class="fa-solid fa-heart-pulse"></i> <span>Sağlık Profilim</span></a>
            <a href="${L.planimVeri}"><i class="fa-solid fa-shield-halved"></i> <span>Veri ve İzinlerim</span></a>
            <div class="acct-div"></div>
            <a href="${L.saglikHub}?auth=0" class="acct-logout"><i class="fa-solid fa-right-from-bracket"></i> <span>Çıkış</span></a>
          </div>
        </div>
        <button class="icon-btn hamburger" id="hamburger" aria-label="Menü"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
  </div>
</header>

<!-- ===== MOBİL DRAWER (≤1024px) ===== -->
<div class="drawer-overlay" id="drawerOverlay"></div>
<aside class="drawer" id="drawer" aria-label="Mobil menü">
  <div class="drawer-head">
    <a class="drawer-brand" href="${L.saglikHub}" aria-label="DadaDiet — Sağlıklı Yaşam">
      <svg class="dd-mark" viewBox="0 0 44 44" aria-hidden="true">
        <rect x="3" y="3" width="38" height="38" rx="11" fill="#3BB77E"/>
        <path d="M30 12 C20 12 14 18 14 27 C14 28.4 14.2 29.7 14.6 31 C24 31 31 25 31 14.2 C31 13.4 30.6 12.7 30 12 Z" fill="#fff" opacity=".96"/>
        <path d="M16 31 C18 24 22 18 29 14" stroke="#3BB77E" stroke-width="2.1" fill="none" stroke-linecap="round"/>
      </svg>
      <span class="dd-word"><b>Dada</b><span class="dd-st">Diet</span></span>
    </a>
    <button class="drawer-close" id="drawerClose" aria-label="Menüyü kapat"><i class="fa-solid fa-xmark"></i></button>
  </div>
  <!-- AKORDEON — en fazla iki seviye. Başlığın kendisi merkez sayfaya gider;
       sağdaki ok YALNIZCA alt menüyü açar (JS ok tıklamasını kesip toggle eder). -->
  <nav class="drawer-nav">
    <div class="d-item d-has-sub">
      <a class="d-link${AD('araclar')}" href="${L.saglikAraclari}"${ARIA('araclar')}><span><i class="fa-solid fa-toolbox"></i> Sağlık Araçları</span><i class="fa-solid fa-chevron-down" style="padding:14px;margin:-14px" aria-hidden="true"></i></a>
      <div class="d-sub">
        <a href="${L.saglikAraclari}"><i class="fa-solid fa-toolbox"></i> Tüm Sağlık Araçları</a>
        <a href="${L.hesaplayicilar}"><i class="fa-solid fa-calculator"></i> Hesaplayıcılar</a>
        <a href="${L.testler}"><i class="fa-solid fa-clipboard-question"></i> Testler</a>
      </div>
    </div>
    <div class="d-item d-has-sub">
      <a class="d-link${AD('beslenme')}" href="${L.beslenmeHub}"${ARIA('beslenme')}><span><i class="fa-solid fa-seedling"></i> Beslenme</span><i class="fa-solid fa-chevron-down" style="padding:14px;margin:-14px" aria-hidden="true"></i></a>
      <div class="d-sub">
        <a href="${L.beslenmeRehberi}"><i class="fa-solid fa-book-open"></i> Beslenme Rehberi</a>
        <a href="${L.besinKutuphanesi}"><i class="fa-solid fa-magnifying-glass"></i> Besin Kütüphanesi</a>
        <a href="${L.beslenmeIpuclari}"><i class="fa-solid fa-lightbulb"></i> Beslenme İpuçları</a>
        <a href="${L.kacKalori}"><i class="fa-solid fa-fire"></i> Kaç Kalori?</a>
        <a href="${L.pufNoktalari}"><i class="fa-solid fa-lightbulb"></i> Diyetin Püf Noktaları</a>
        <a${SOON}><i class="fa-solid fa-utensils"></i> Sağlıklı Tarifler${SOONB}</a>
      </div>
    </div>
    <div class="d-item d-has-sub">
      <a class="d-link${AD('programlar')}" href="${L.programlar}"${ARIA('programlar')}><span><i class="fa-solid fa-clipboard-list"></i> Programlar</span><i class="fa-solid fa-chevron-down" style="padding:14px;margin:-14px" aria-hidden="true"></i></a>
      <div class="d-sub">
        <a href="${L.programlar}"><i class="fa-solid fa-clipboard-list"></i> Tüm Programlar</a>
        <a href="${L.programlar}?hedef=tumu"><i class="fa-solid fa-bullseye"></i> Hedefe Göre</a>
        <a href="${L.programlar}?yasam=tumu"><i class="fa-solid fa-people-roof"></i> Yaşam Biçimine Göre</a>
        <a href="${L.programSure}"><i class="fa-regular fa-calendar"></i> Süreye Göre</a>
        <a href="${L.programBul}"><i class="fa-solid fa-wand-magic-sparkles"></i> Programını Bul</a>
      </div>
    </div>
    <!-- Diyetisyenler drawer'da da akordeon DEĞİL: tek satırlık doğrudan
         bağlantı. .d-has-sub yok, ok yok, .d-sub yok — masaüstüyle aynı. -->
    <div class="d-item">
      <a class="d-link${AD('diyetisyenler')}" href="${L.diyetisyenler}"${ARIA('diyetisyenler')}><span><i class="fa-solid fa-user-doctor"></i> Diyetisyenler</span></a>
    </div>
  </nav>
  <div class="drawer-foot">
    <!-- LOGIN-STATE: logged-out giriş butonu -->
    <button class="btn btn-primary drawer-login" style="width:100%" onclick="location.search='?auth=1'"><i class="fa-regular fa-user"></i> Giriş Yap</button>
    <!-- LOGIN-STATE: logged-in kimlik satırı (persona Elif Şahin) -->
    <div class="drawer-acct">
      <span class="da-ava" style="background-image:url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop&exp=7&gam=6&sat=-9&high=8&vib=5')"></span>
      <div class="da-info">
        <b>Elif Şahin</b>
        <div class="da-links">
          <a href="${L.planim}">Planım</a>
          <a href="${L.planimGunluk}">Günlük Takip</a>
          <a href="${L.planimVeri}">Veri ve İzinler</a>
          <a href="${L.saglikHub}?auth=0">Çıkış</a>
        </div>
      </div>
    </div>
    <!-- Planım: mobilde header sağ bloğu daraldığı için kişisel buton buraya devreder -->
    <a href="${L.planim}" class="drawer-add"><i class="fa-solid fa-list-check"></i> Planım</a>
    <!-- KÖPRÜ: mobilde topbar gizli (≤640) → DadaMutfak'a dönüş buradan (akademi/dadafit pattern) -->
    <a href="${L.portal}" class="drawer-add"><i class="fa-solid fa-arrow-left-long"></i> DadaMutfak'a Dön</a>
    <div class="drawer-lang" id="drawerLang">
      <button class="drawer-lang-toggle" type="button" aria-haspopup="true" aria-expanded="false">
        <span class="drawer-lang-label"><i class="fa-solid fa-globe"></i> Dil</span>
        <span class="drawer-lang-cur"><span id="drawerLangCur">TR — Türkçe</span> <i class="fa-solid fa-chevron-down"></i></span>
      </button>
      <div class="drawer-lang-list" role="menu">
        <button type="button" class="active" data-lang="tr" data-name="Türkçe"><b>TR</b> Türkçe</button>
        <button type="button" data-lang="en" data-name="English"><b>EN</b> English</button>
      </div>
    </div>
  </div>
</aside>

<!-- ===== MOBİL BOTTOM NAV (≤640px) ===== -->
<nav class="bottom-nav" aria-label="Mobil alt navigasyon">
  <a href="${L.saglikAraclari}" class="bn-item"><i class="fa-solid fa-toolbox"></i><span>Sağlık Araçları</span></a>
  <a href="${L.beslenmeHub}" class="bn-item"><i class="fa-solid fa-seedling"></i><span>Beslenme</span></a>
  <a href="${L.diyetisyenler}" class="bn-item bn-center"><span class="bn-fab"><i class="fa-solid fa-user-doctor"></i></span><span>Diyetisyen</span></a>
  <a href="${L.programlar}" class="bn-item"><i class="fa-solid fa-clipboard-list"></i><span>Programlar</span></a>
  <a href="${L.portal}" class="bn-item"><i class="fa-solid fa-house"></i><span>Ana Site</span></a>
</nav>

<!-- ===== GÖRÜŞ BİLDİR (sağ kenar sabit etiket) ===== -->
<a class="feedback-tab" id="fbTab" style="cursor:pointer" aria-label="Görüş Bildir — öneri ve şikayet">
  <i class="fa-solid fa-comment-dots"></i> Görüş Bildir
</a>

<!-- ===== GÖRÜŞ BİLDİR MODAL ===== -->
<div class="fb-overlay" id="fbOverlay"></div>
<div class="fb-modal" id="fbModal" role="dialog" aria-modal="true" aria-label="Görüş Bildir">
  <div class="fb-panel">
    <div class="fb-head">
      <div>
        <h3>Görüş Bildir</h3>
        <p>Önerin, şikayetin veya sorun — hepsine kulak veriyoruz.</p>
      </div>
      <button class="fb-close" id="fbClose" type="button" aria-label="Kapat"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="fb-body">
      <form id="fbForm">
        <!-- M17: konu tipine göre alan seti değişir (Onedio referansı, mevcut dil korunarak) -->
        <div class="fb-topics" role="group" aria-label="Konu seç">
          <button class="fb-topic active" type="button" data-topic="oneri"><i class="fa-solid fa-lightbulb"></i> Önerim var</button>
          <button class="fb-topic" type="button" data-topic="soru"><i class="fa-solid fa-circle-question"></i> Bir sorum var</button>
          <button class="fb-topic" type="button" data-topic="sorun"><i class="fa-solid fa-bug"></i> Teknik sorun</button>
          <button class="fb-topic" type="button" data-topic="ihlal"><i class="fa-solid fa-shield-halved"></i> İhlal bildirimi</button>
          <button class="fb-topic" type="button" data-topic="puan"><i class="fa-solid fa-face-smile"></i> Puan ver</button>
        </div>

        <div class="fb-fields active" data-for="oneri">
          <div class="fb-chiprow" role="group" aria-label="İlgili alan">
            <button class="chip active" type="button">Tarifler</button>
            <button class="chip" type="button">Keşfet</button>
            <button class="chip" type="button">DadaStore</button>
            <button class="chip" type="button">Uygulama</button>
            <button class="chip" type="button">Diğer</button>
          </div>
          <div class="fb-field"><textarea required placeholder="Önerini anlat *"></textarea></div>
          <div class="fb-field"><input type="email" placeholder="E-posta adresin (opsiyonel)" /></div>
        </div>

        <div class="fb-fields" data-for="soru">
          <div class="fb-field">
            <select class="fb-select" required>
              <option value="" selected disabled>Sorunun konusu *</option>
              <option>Üyelik & Hesap</option>
              <option>Tarif ekleme</option>
              <option>Diyetisyen randevusu</option>
              <option>Sipariş & DadaStore</option>
              <option>Diğer</option>
            </select>
          </div>
          <div class="fb-field"><textarea required placeholder="Sorunu yaz *"></textarea></div>
          <div class="fb-field"><input type="email" required placeholder="E-posta adresin (cevap için) *" /></div>
        </div>

        <div class="fb-fields" data-for="sorun">
          <div class="fb-field">
            <select class="fb-select" required>
              <option value="" selected disabled>Sorunu nerede yaşadın? *</option>
              <option>Anasayfa</option>
              <option>Tarif sayfası</option>
              <option>Arama / Dolapta Ne Var?</option>
              <option>Üyelik & Giriş</option>
              <option>DadaStore</option>
              <option>Mobil uygulama</option>
            </select>
          </div>
          <div class="fb-field"><textarea required placeholder="Sorunu kısaca anlat — ne yaptın, ne oldu? *"></textarea></div>
          <button class="fb-shot" type="button"><i class="fa-solid fa-image"></i> Ekran görüntüsü ekle <small>(opsiyonel)</small></button>
          <div class="fb-field"><input type="email" placeholder="E-posta adresin (opsiyonel)" /></div>
        </div>

        <div class="fb-fields" data-for="ihlal">
          <div class="fb-field"><input type="url" required placeholder="İhlal içeren sayfanın linki *" /></div>
          <div class="fb-field">
            <select class="fb-select" required>
              <option value="" selected disabled>İhlal türü *</option>
              <option>Telif hakkı</option>
              <option>Uygunsuz içerik</option>
              <option>Spam / yanıltıcı içerik</option>
              <option>Diğer</option>
            </select>
          </div>
          <div class="fb-field"><textarea required placeholder="Açıklama *"></textarea></div>
          <div class="fb-field"><input type="email" required placeholder="E-posta adresin *" /></div>
        </div>

        <div class="fb-fields" data-for="puan">
          <p class="fb-q">DadaMutfak deneyimini nasıl puanlarsın?</p>
          <div class="fb-emoji" role="group" aria-label="Puan">
            <button type="button" data-val="1" aria-label="Çok kötü">😡</button>
            <button type="button" data-val="2" aria-label="Kötü">🙁</button>
            <button type="button" data-val="3" aria-label="İdare eder">😐</button>
            <button type="button" data-val="4" aria-label="İyi">🙂</button>
            <button type="button" data-val="5" aria-label="Harika">😍</button>
          </div>
          <div class="fb-field"><textarea placeholder="Eklemek istediğin bir şey var mı? (opsiyonel)"></textarea></div>
          <div class="fb-field"><input type="email" placeholder="E-posta adresin (opsiyonel)" /></div>
        </div>

        <label class="fb-kvkk">
          <input type="checkbox" required />
          <span><a href="${L.yasal}?metin=aydinlatma">Aydınlatma Metni</a>'ni ve <a href="${L.yasal}?metin=kvkk">KVKK Metni</a>'ni okudum, onaylıyorum.</span>
        </label>
        <button class="btn btn-primary fb-send" type="submit"><i class="fa-solid fa-paper-plane"></i> Gönder</button>
      </form>
      <div class="fb-success" id="fbSuccess" hidden>
        <span class="ok"><i class="fa-solid fa-check"></i></span>
        <h4>Görüşün bize ulaştı</h4>
        <p>Teşekkürler! Ekibimiz en kısa sürede inceleyip gerekirse e-posta ile dönüş yapacak.</p>
      </div>
    </div>
  </div>
</div>

<!-- ===== ÇEREZ ONAY BANNER ===== -->
<div class="cookie-banner" id="cookieBanner" role="dialog" aria-label="Çerez onayı" aria-live="polite">
  <div class="cookie-inner">
    <div class="cookie-text">
      <span class="cookie-ico"><i class="fa-solid fa-cookie-bite"></i></span>
      <p>Sana daha iyi bir deneyim sunmak için çerezler kullanıyoruz. Siteyi kullanmaya devam ederek çerez kullanımını kabul etmiş olursun. <a href="${L.yasal}?metin=cerez">Çerez Politikası</a> · <a href="${L.yasal}?metin=aydinlatma">KVKK Aydınlatma Metni</a></p>
    </div>
    <div class="cookie-actions">
      <button type="button" class="btn-cookie-reject" id="cookieReject">Reddet</button>
      <button type="button" class="btn-cookie-accept" id="cookieAccept">Tümünü Kabul Et</button>
    </div>
  </div>
</div>

<!-- ===== ANA İÇERİK (footer reveal perdesi) ===== -->
`; }

/* =====================================================================
   ALT KROM — lg-gate + footer + DadaMentor FAB + scroll-top

   ÜÇ PARÇA — ayrı ayrı yerleştirilebilir:
     #ddChromeGate    lg-gate (giriş kapısı)
     #ddChromeFooter  footer
     #ddChromeFab     DadaMentor + başa dön
     #ddChromeBottom  üçü birden, kanonik sırada (çoğu sayfa bunu kullanır)
   Sayfalar bu blokları farklı sıralarda taşıyor (bazısında FAB en üstte) ve
   aralarına kendi markup'ını koyuyor (tıbbi bilgilendirme şeridi). Ayrı yer
   tutucular sayesinde DOM sırası ayırma öncesiyle birebir aynı kalıyor.
   ===================================================================== */
function gateHTML(){ return `<!-- ===== LG-GATE (giriş kapısı) — logged-out mikro-aksiyon (yorum/kaydet/takip) =====
     Markup </main> SONRASINA (lessons: fixed overlay page-main stacking context'ine girmez).
     body.is-auth iken hiç açılmaz; data-lg-gate taşıyan öğeler tetikler. SS: ?lg=1 -->
<div class="lg-overlay" id="lgOverlay"></div>
<div class="lg-gate" id="lgGate" role="dialog" aria-modal="true" aria-label="Giriş gerekli">
  <div class="lg-panel">
    <button class="lg-close" id="lgClose" type="button" aria-label="Kapat"><i class="fa-solid fa-xmark"></i></button>
    <span class="lg-ico"><i class="fa-solid fa-lock"></i></span>
    <h4 id="lgTitle">Bu işlem için giriş yap</h4>
    <p id="lgDesc">Kaydetmek, yorum yapmak ve takip etmek için DadaMutfak hesabına giriş yapman gerekiyor.</p>
    <div class="lg-acts">
      <a class="btn btn-primary" href="?auth=1"><i class="fa-regular fa-user"></i> Giriş Yap</a>
      <a class="btn btn-ghost" href="${L.saglikHub}">Ana sayfaya dön</a>
    </div>
  </div>
</div>


`; }

function footHTML(){ return `<!-- ===== FOOTER ===== -->
<footer class="footer orange">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <div class="foot-lockup"><span class="fl-mark"><i class="fa-solid fa-leaf"></i></span><span class="fl-word"><span class="bd">Dada</span><span class="sf">Diet</span></span></div>
        <p class="foot-tag">Sağlıklı yaşamın günlük rehberi — dengeli beslen, takip et, iyi hisset.</p>
        <div class="foot-soc">
          <a aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          <a aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
          <a aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
        </div>
      </div>
      <div class="foot-col">
        <h5>Dada Diet</h5>
        <a${SOON}>Hakkımızda${SOONB}</a>
        <a href="${L.saglikHub}#nasil-calisir">Nasıl Çalışır</a>
        <a${SOON}>Bilimsel Kaynaklar${SOONB}</a>
      </div>
      <div class="foot-col">
        <h5>Beslenme</h5>
        <a href="${L.besinKutuphanesi}">Besin Kütüphanesi</a>
        <a href="${L.beslenmeRehberi}">Beslenme Rehberi</a>
        <a href="${L.programlar}">Programlar</a>
      </div>
      <div class="foot-col">
        <h5>Uzman Desteği</h5>
        <a href="${L.diyetisyenler}">Diyetisyenler</a>
        <a href="${L.diyetisyenBul}">Diyetisyen Bul</a>
        <a href="${L.diyetisyenOl}">Diyetisyen Ol</a>
      </div>
      <div class="foot-col">
        <h5>Destek</h5>
        <a${SOON}>Sıkça Sorulan Sorular${SOONB}</a>
        <a${SOON}>İletişim${SOONB}</a>
        <a style="cursor:pointer" onclick="document.getElementById('fbTab').click();return false;">Öneri ve Şikâyet</a>
      </div>
    </div>
    <!-- YASAL — beşinci grup. Kabuğun kendi .foot-legal satırı (tanımlı, bugüne
         kadar kullanılmamış). Beş hedefin beşi de yasal-v1.html'e bakıyordu ve
         o sayfa bu repoda yok → hepsi görünür Yakında, boş diyez yok. -->
    <div class="foot-legal" aria-label="Yasal">
      <a${SOON}>KVKK${SOONB}</a><span class="sep"></span>
      <a${SOON}>Gizlilik${SOONB}</a><span class="sep"></span>
      <a${SOON}>Çerez${SOONB}</a><span class="sep"></span>
      <a${SOON}>Kullanım Koşulları${SOONB}</a><span class="sep"></span>
      <a${SOON}>Sağlık Bilgilendirmesi${SOONB}</a>
    </div>
    <div class="foot-bottom">
      <span class="fb-left">© 2026 <b><span class="bd">Dada</span><span class="sf">Diet</span></b> · Tüm hakları saklıdır.</span>
      <a href="https://gaviaworks.com" target="_blank" rel="noopener"><span class="gw-code">&lt;/&gt;</span> GaviaWorks</a>
    </div>
  </div>
</footer>

`; }

function fabHTML(){ return `<!-- ===== ADIM 3 KABUK: DadaMentor FAB (sol-alt) + scroll-top (sağ-alt) — </main>/footer sonrası ===== -->
<aside class="mentor-panel floating mini" id="mentorPanel" data-state="mini" aria-label="DadaMentor asistan">
  <div class="mp-media">
    <div class="mp-atmos"></div>
    <video id="mentorVideo" autoplay muted loop playsinline preload="auto">
      <source src="assets/video/mentor-panel.mp4" type="video/mp4" />
    </video>
  </div>
  <div class="mp-fade"></div>
  <div class="mp-mini-overlay" id="mpMiniOv" aria-hidden="false">
    <span class="mav"><i class="fa-solid fa-compass"></i></span>
    <span class="mp-mini-lbl">Mentör</span>
  </div>
  <div class="mp-top">
    <span class="mp-tag"><i class="fa-solid fa-comment-dots"></i> Mentor</span>
    <button class="mp-toggle" type="button" id="mpToggle" aria-label="Paneli küçült">
      <i class="fa-solid fa-minus" id="mpToggleIco"></i>
    </button>
  </div>
  <div class="mp-chat">
    <div class="mp-id">
      <span class="mp-av"><i class="fa-solid fa-compass"></i></span>
      <span>
        <span class="nm"><span class="bd">Dada</span><span class="sf">Mentor</span></span><br>
        <span class="on"><span class="d"></span> çevrimiçi</span>
      </span>
    </div>
    <div class="mp-bubble" id="mpBubble">Bugün sana nasıl yardımcı olayım?</div>
    <div class="mp-row">
      <a class="mp-opt" href="${L.saglikAraclari}">Sağlık Araçları</a>
      <a class="mp-opt" href="${L.beslenmeHub}">Beslenme</a>
      <a class="mp-opt" href="${L.diyetisyenler}">Diyetisyenler</a>
      <a class="mp-opt w-gastro" href="${L.portal}"><span class="bd">Dada</span><span class="sf">Gastro</span></a>
      <a class="mp-opt w-fit" href="${L.dadafit}"><span class="bd">Dada</span><span class="sf">Fit</span></a>
    </div>
  </div>
</aside>
<button class="to-top" id="toTop" type="button" aria-label="Başa dön"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>

`; }

function place(id, fn){
  var el = document.getElementById(id);
  if(el) el.outerHTML = fn();      /* yer tutucu SİLİNİR — sarmalayıcı kalmaz */
}

/* ############ FAZ A — hemen (SAYFA JS'inden önce) ############ */
place('ddChromeTop', topHTML);

// SS paramları
// ===== Login-state simülasyonu (mockup) — İA §2.3 sözleşmesi =====
// ?auth=1 → localStorage dm_auth='1' + body.is-auth ; ?auth=0 → temizle (logout)
// param yoksa localStorage'a bakılır. Çıkış linkleri ?auth=0'a yönlendirir (M7).
(function(){
  /* C1 — tek auth/rol token dm_user{auth,roles[],verified,level}. Eski dm_auth/dm_business
     migrate+silinir. Kök kuralı: auth ⟹ roles "kullanici" ile başlar; isletme operatörü
     ["kullanici","isletme"]. Class additive (is-auth/has-business AYNEN) + body[data-roles]. */
  var KEY='dm_user', OK={kullanici:1,antrenor:1,diyetisyen:1,isletme:1};
  function rd(){ try{var r=localStorage.getItem(KEY);return r?JSON.parse(r):null;}catch(e){return null;} }
  function wr(u){ try{localStorage.setItem(KEY,JSON.stringify(u));}catch(e){} }
  var u=rd();
  if(!u){                                   // migrasyon: eski binary flag → dm_user (bir kez)
    var oa=false,ob=false;
    try{oa=localStorage.getItem('dm_auth')==='1';}catch(e){}
    try{ob=localStorage.getItem('dm_business')==='1';}catch(e){}
    if(oa||ob){ u={auth:true,roles:['kullanici'],verified:false,level:0}; if(ob)u.roles.push('isletme'); wr(u); }
  }
  try{localStorage.removeItem('dm_auth');localStorage.removeItem('dm_business');}catch(e){}  // eski anahtar temizliği
  var qs=location.search;                    // URL-param (demo/SS akışı korunur + yeni roller)
  function ens(){ if(!u)u={auth:false,roles:[],verified:false,level:0}; }
  function addR(r){ ens(); if(OK[r]&&u.roles.indexOf(r)<0)u.roles.push(r); }
  if(qs.indexOf('auth=1')>-1){ ens(); u.auth=true; }
  else if(qs.indexOf('auth=0')>-1){ u=null; try{localStorage.removeItem(KEY);}catch(e){} }
  if(qs.indexOf('business=1')>-1){ ens(); u.auth=true; addR('isletme'); }
  else if(qs.indexOf('business=0')>-1){ if(u){var bi=u.roles.indexOf('isletme'); if(bi>-1)u.roles.splice(bi,1);} }
  var rm=/[?&]role=(antrenor|diyetisyen|isletme)/.exec(qs); if(rm){ ens(); u.auth=true; addR(rm[1]); }
  if(u){
    if(qs.indexOf('verified=1')>-1)u.verified=true; else if(qs.indexOf('verified=0')>-1)u.verified=false;
    var lm=/[?&]level=(\d+)/.exec(qs); if(lm)u.level=parseInt(lm[1],10)||0;
    if(u.auth&&u.roles.indexOf('kullanici')<0)u.roles.unshift('kullanici');   // kök her zaman önde
    wr(u);
  }
  var b=document.body, authed=!!(u&&u.auth);   // DOM: eski class kanalı (additive) + data-roles
  if(authed){
    b.classList.add('is-auth');
    if(u.roles.indexOf('isletme')>-1)b.classList.add('has-business');   // C3 köprü sinyali — AYNEN
    b.setAttribute('data-roles',u.roles.join(' '));
    if(u.verified)b.setAttribute('data-verified','1');
    if(u.level)b.setAttribute('data-level',String(u.level));
  }
  /* --- DEMO VERİ ANAHTARI (İA 3. faz) — içeriği olan / olmayan üye ayrımı.
     ?veri=1 / ?veri=0 auth gibi KALICIDIR. Varsayılan: içerik YOK; bu
     durumda hiçbir yerde boş kart gösterilmez, yönlendirici başlangıç
     durumu gösterilir. Ana sayfa ve 10 Planım sayfası aynı bayrağı okur. */
  var VK='dm_veri', vd=null;
  try{ vd=localStorage.getItem(VK); }catch(e){}
  if(qs.indexOf('veri=1')>-1){ vd='1'; try{localStorage.setItem(VK,'1');}catch(e){} }
  else if(qs.indexOf('veri=0')>-1){ vd='0'; try{localStorage.setItem(VK,'0');}catch(e){} }
  if(authed && vd==='1') b.classList.add('has-data');

  /* --- GİRİŞ SONRASI DÖNÜŞ — kullanıcı başladığı sayfaya döner, portala
     düşmez. Sözleşme: <sayfa>?auth=1&donus=<hedef>.html
     Yalnız aynı klasördeki .html hedefleri kabul edilir (açık yönlendirme yok). */
  var dm=/[?&]donus=([a-z0-9-]+\.html)/i.exec(qs);
  if(authed && dm && qs.indexOf('auth=1')>-1){ location.replace(dm[1]); }
})();

if(location.search.indexOf('dd=1')>-1){document.querySelector('.nav-item').classList.add('open');var _l=document.getElementById('tbLang');if(_l)_l.classList.add('open');}
if(location.search.indexOf('drawer=1')>-1){window.addEventListener('DOMContentLoaded',function(){document.getElementById('drawer').classList.add('open');document.getElementById('drawerOverlay').classList.add('open');var _s=document.querySelector('.d-has-sub');if(_s)_s.classList.add('open');if(window.__hdrLock)window.__hdrLock(true);});}

// header: VARSAYILAN katı (banner'ı olmayan sayfa). heroMode=true → banner
// üstünde şeffaf, ~60px scroll sonrası katı (v3a davranışı; ?hdr=solid ile
// yine zorla katı). Yükseklik iki durumda da aynı: yalnız background,
// border-color ve box-shadow değişir, .header fixed olduğu için sayfa sıçramaz.
//
// window.__hdrLock(true|false) — drawer ile kabuk arasındaki arayüz. Drawer
// açıkken header KATI olur: açık drawer'ın kendi zemini var ve şeffaf header
// onun üstünde okunmaz kalıyordu. Kapanınca kaldığı yere göre yeniden karar
// verilir (kullanıcı drawer açıkken kaydırmış olabilir).
(function(){
  var header=document.querySelector('.header');
  var heroMode=HERO;
  var forceSolid=location.search.indexOf('hdr=solid')>-1;
  var locked=false;
  function onScroll(){
    if(!heroMode||forceSolid||locked){header.classList.remove('at-top');return;}
    if(window.scrollY<60){header.classList.add('at-top');}else{header.classList.remove('at-top');}
  }
  window.__hdrLock=function(on){locked=!!on;onScroll();};
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
})();

/* ############ FAZ B — DOMContentLoaded (SAYFA JS'inden sonra) ############ */
function boot(){
/* Sayfa kabuk parçalarını KENDİ SIRASINDA yerleştirir. Çoğu sayfa tek
   #ddChromeBottom koyar ve üçünü kanonik sırada alır; sırası farklı olan ya da
   aralarına kendi markup'ını koyan sayfalar üç yer tutucuyu ayrı ayrı koyar. */
place('ddChromeGate',   gateHTML);
place('ddChromeFooter', footHTML);
place('ddChromeFab',    fabHTML);
place('ddChromeBottom', function(){ return gateHTML() + footHTML() + fabHTML(); });

// save / favorite toggle (recipes + products) — sayfada varsa çalışır
document.querySelectorAll('.r-save, .p-fav, .feat-save').forEach(function(btn){
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    btn.classList.toggle('saved');
    var i=btn.querySelector('i');
    if(btn.classList.contains('saved')){i.classList.remove('fa-regular');i.classList.add('fa-solid');}
    else{i.classList.remove('fa-solid');i.classList.add('fa-regular');}
  });
});

// "tümünü gör" slider okları — data-track / data-dir ile genel
document.querySelectorAll('.row-nav button').forEach(function(b){
  b.addEventListener('click',function(){
    var t=document.getElementById(b.getAttribute('data-track'));
    if(t){t.scrollBy({left:b.getAttribute('data-dir')==='prev'?-620:620,behavior:'smooth'});if(t._pauseAuto)t._pauseAuto();}
  });
});

// Üst başlıklar GERÇEK bağlantıdır — tıklama merkez sayfaya gider, panel açma
// tetikleyicisi DEĞİLDİR (İA revizyonu). Panel yalnız hover ile açılır (CSS).
// .open sınıfı yalnız ?dd=1 ekran görüntüsü paramı için kalır.
document.addEventListener('click',function(e){
  if(!e.target.closest('.nav-item'))document.querySelectorAll('.nav-item.open').forEach(function(o){o.classList.remove('open')});
});

// ---- HESAP / EKLE dropdown (header sağ blok, login-state) tıkla-aç ----
document.querySelectorAll('.acct-item').forEach(function(it){
  var trigger=it.querySelector('.icon-btn,.acct-btn');
  if(!trigger||!it.querySelector('.acct-menu'))return;
  trigger.addEventListener('click',function(e){
    e.preventDefault();
    var wasOpen=it.classList.contains('open');
    document.querySelectorAll('.acct-item.open').forEach(function(o){o.classList.remove('open')});
    if(!wasOpen)it.classList.add('open');
  });
});
document.addEventListener('click',function(e){
  if(!e.target.closest('.acct-item'))document.querySelectorAll('.acct-item.open').forEach(function(o){o.classList.remove('open')});
});

// ---- LG-GATE (giriş kapısı) — logged-out mikro-aksiyon kapısı ----
(function(){
  var gate=document.getElementById('lgGate');
  var overlay=document.getElementById('lgOverlay');
  if(!gate)return;
  function open(title,desc){
    if(document.body.classList.contains('is-auth'))return false;   // logged-in: kapı yok
    if(title)document.getElementById('lgTitle').textContent=title;
    if(desc)document.getElementById('lgDesc').textContent=desc;
    gate.classList.add('show');overlay.classList.add('show');document.body.style.overflow='hidden';
    return true;
  }
  function close(){gate.classList.remove('show');overlay.classList.remove('show');document.body.style.overflow='';}
  window.__lgGate=open;window.__lgGateClose=close;
  document.getElementById('lgClose').addEventListener('click',close);
  overlay.addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&gate.classList.contains('show'))close();});
  // data-lg-gate taşıyan öğeler logged-out'ta kapıyı açar (capture: sayfa toggle'ından önce keser)
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-lg-gate]');
    if(!t)return;
    if(document.body.classList.contains('is-auth'))return;          // logged-in: normal davranış
    e.preventDefault();e.stopPropagation();
    open(t.getAttribute('data-lg-title'),t.getAttribute('data-lg-desc'));
  },true);
  if(location.search.indexOf('lg=1')>-1){open();}                    // SS paramı
})();

// ---- DİL SEÇİCİ (üst bant dropdown) ----
(function(){
  var lang=document.getElementById('tbLang');
  if(!lang)return;
  var btn=document.getElementById('tbLangBtn');
  btn.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    var open=lang.classList.toggle('open');
    btn.setAttribute('aria-expanded',open?'true':'false');
  });
  lang.querySelectorAll('.tb-lang-menu a').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();
      lang.querySelectorAll('.tb-lang-menu a').forEach(function(x){x.classList.remove('active')});
      a.classList.add('active');
      btn.querySelector('span').textContent=a.getAttribute('data-lang').toUpperCase();
      lang.classList.remove('open');btn.setAttribute('aria-expanded','false');
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('#tbLang')){lang.classList.remove('open');btn.setAttribute('aria-expanded','false');}
  });
})();

// ---- MOBİL DRAWER aç/kapa ----
(function(){
  var drawer=document.getElementById('drawer');
  var overlay=document.getElementById('drawerOverlay');
  var burger=document.getElementById('hamburger');
  var closeBtn=document.getElementById('drawerClose');
  /* Drawer açılırken header katıya kilitlenir, kapanırken kilit kalkar —
     şeffaf header açık drawer'ın üstünde okunmuyordu. */
  function open(){drawer.classList.add('open');overlay.classList.add('open');document.body.style.overflow='hidden';if(window.__hdrLock)window.__hdrLock(true);}
  function close(){drawer.classList.remove('open');overlay.classList.remove('open');document.body.style.overflow='';if(window.__hdrLock)window.__hdrLock(false);}
  burger.addEventListener('click',open);
  closeBtn.addEventListener('click',close);
  overlay.addEventListener('click',close);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  // AKORDEON — başlığın kendisi merkez sayfaya gider; YALNIZ sağdaki ok
  // alt menüyü açar/kapatır. Ok tıklaması navigasyonu keser (İA revizyonu).
  drawer.querySelectorAll('.d-has-sub > .d-link').forEach(function(lnk){
    lnk.addEventListener('click',function(e){
      if(!e.target.closest('.fa-chevron-down'))return;   // başlığa tıklandı → git
      e.preventDefault(); e.stopPropagation();
      var item=lnk.parentElement;
      var wasOpen=item.classList.contains('open');
      drawer.querySelectorAll('.d-item.open').forEach(function(o){o.classList.remove('open')});
      if(!wasOpen)item.classList.add('open');
    });
  });
  // alt link veya alt menüsüz başlığa tıklayınca drawer kapansın.
  // .d-has-sub başlıkları listede YOK: ok tıklaması kapatmamalı, başlık zaten gider.
  drawer.querySelectorAll('.d-sub a[href], .d-item:not(.d-has-sub) > a.d-link, .drawer-foot a, .drawer-foot > button').forEach(function(a){
    a.addEventListener('click',close);
  });
  // drawer dil seçici — aç/kapa liste + seçim (drawer kapanmaz, N dile ölçeklenir)
  var dl=document.getElementById('drawerLang');
  if(dl){
    var dlToggle=dl.querySelector('.drawer-lang-toggle');
    dlToggle.addEventListener('click',function(){
      var open=dl.classList.toggle('open');
      dlToggle.setAttribute('aria-expanded',open?'true':'false');
    });
    dl.querySelectorAll('.drawer-lang-list button').forEach(function(b){
      b.addEventListener('click',function(){
        dl.querySelectorAll('.drawer-lang-list button').forEach(function(x){x.classList.remove('active')});
        b.classList.add('active');
        document.getElementById('drawerLangCur').textContent=b.getAttribute('data-lang').toUpperCase()+' — '+b.getAttribute('data-name');
        dl.classList.remove('open');dlToggle.setAttribute('aria-expanded','false');
      });
    });
  }
})();

// ---- SÜRÜKLE-KAYDIR (mouse ile yatay slider'lar) ----
// Sayfa kendi track selector'larını alttaki listeye ekler (.row-track hazır gelir)
(function(){
  function enableDrag(el){
    el.classList.add('drag-scroll');
    var down=false,startX=0,startScroll=0,moved=false;
    el.addEventListener('pointerdown',function(e){
      if(e.pointerType==='touch')return;           // touch zaten native kayar
      down=true;moved=false;startX=e.clientX;startScroll=el.scrollLeft;
    });
    el.addEventListener('pointermove',function(e){
      if(!down)return;
      var dx=e.clientX-startX;
      if(Math.abs(dx)>4){moved=true;el.classList.add('dragging');}
      el.scrollLeft=startScroll-dx;
    });
    function up(){down=false;setTimeout(function(){el.classList.remove('dragging');},0);}
    el.addEventListener('pointerup',up);
    el.addEventListener('pointercancel',up);
    el.addEventListener('pointerleave',up);
    // sürükleme sonrası yanlışlıkla tıklamayı engelle
    el.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
    // dikey wheel'i yatay scroll'a çevir (trackpad/mouse)
    el.addEventListener('wheel',function(e){
      if(el.scrollWidth<=el.clientWidth)return;
      if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      e.preventDefault();el.scrollLeft+=e.deltaY;
    },{passive:false});
  }
  ['.row-track','.cat-track','.grid-4','.vid-grid','.chips','.chef-row','.disc-grid'].forEach(function(sel){
    document.querySelectorAll(sel).forEach(enableDrag);
  });
})();

// ---- FOOTER REVEAL — footer yüksekliğini ölç, içerik sonuna boşluk aç ----
(function(){
  var main=document.getElementById('pageMain');
  var foot=document.querySelector('.footer');
  if(!main||!foot)return;
  function fit(){
    if(window.matchMedia('(min-width:641px)').matches){
      main.style.marginBottom=foot.offsetHeight+'px';
    }else{
      main.style.marginBottom='';
    }
  }
  fit();
  window.addEventListener('resize',fit);
  window.addEventListener('load',fit);          // logo/font yüklenince yükseklik oturur
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
})();

// ---- GÖRÜŞ BİLDİR (kenar etiketi → modal) ----
(function(){
  var tab=document.getElementById('fbTab');
  var modal=document.getElementById('fbModal');
  var overlay=document.getElementById('fbOverlay');
  if(!tab||!modal)return;
  var form=document.getElementById('fbForm');
  var success=document.getElementById('fbSuccess');
  function open(){modal.classList.add('show');overlay.classList.add('show');document.body.style.overflow='hidden';}
  function close(){
    modal.classList.remove('show');overlay.classList.remove('show');document.body.style.overflow='';
    setTimeout(function(){form.hidden=false;success.hidden=true;form.reset();},300);
  }
  tab.addEventListener('click',function(e){e.preventDefault();open();});
  document.getElementById('fbClose').addEventListener('click',close);
  overlay.addEventListener('click',close);
  modal.addEventListener('click',function(e){if(e.target===modal)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  // M17 — konu tipine göre alan seti: aktif pane görünür, pasif pane'lerin
  // input'ları disable edilir (gizli required alanlar submit'i bloklamasın)
  function syncPanes(){
    var cur=modal.querySelector('.fb-topic.active').getAttribute('data-topic');
    modal.querySelectorAll('.fb-fields').forEach(function(p){
      var on=p.getAttribute('data-for')===cur;
      p.classList.toggle('active',on);
      p.querySelectorAll('input,textarea,select,button').forEach(function(el){el.disabled=!on});
    });
  }
  modal.querySelectorAll('.fb-topic').forEach(function(t){
    t.addEventListener('click',function(){
      modal.querySelectorAll('.fb-topic').forEach(function(x){x.classList.remove('active')});
      t.classList.add('active');
      syncPanes();
    });
  });
  syncPanes();
  // emoji + chip seçimleri (tek seçim)
  modal.querySelectorAll('.fb-emoji button').forEach(function(b){
    b.addEventListener('click',function(){
      modal.querySelectorAll('.fb-emoji button').forEach(function(x){x.classList.remove('active')});
      b.classList.add('active');
    });
  });
  modal.querySelectorAll('.fb-chiprow .chip').forEach(function(c){
    c.addEventListener('click',function(){
      modal.querySelectorAll('.fb-chiprow .chip').forEach(function(x){x.classList.remove('active')});
      c.classList.add('active');
    });
  });
  form.addEventListener('submit',function(e){
    e.preventDefault();
    form.hidden=true;success.hidden=false;
  });
  if(location.search.indexOf('fb=1')>-1){open();}
})();

// ---- ÇEREZ ONAY BANNER ----
(function(){
  var banner=document.getElementById('cookieBanner');
  if(!banner)return;
  var KEY='dm-cookie-consent';
  var force=location.search.indexOf('cc=1')>-1;   // SS/test için zorla göster
  function stored(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
  function dismiss(val){
    try{localStorage.setItem(KEY,val);}catch(e){}
    banner.classList.remove('show');if(window.__bnUpdate)window.__bnUpdate();
  }
  if(force || !stored()){
    setTimeout(function(){banner.classList.add('show');if(window.__bnUpdate)window.__bnUpdate();},700);
  }
  document.getElementById('cookieAccept').addEventListener('click',function(){dismiss('accepted');});
  document.getElementById('cookieReject').addEventListener('click',function(){dismiss('rejected');});
})();

/* ===== MOBİL ALT KATMAN YÖNETİCİSİ (revize2/mobil1 — kanonik) ===== */
/* ===== MOBİL ALT KATMAN YÖNETİCİSİ (revize2/mobil1 — kanonik) =====
   Kural: ekranda en fazla 1 sabit alt şerit. Çerez onayı (geçici, öncelikli)
   ya da sayfanın kendi aksiyon şeridi (window.__bottomStrips) açıkken global
   bottom-nav gizlenir; şerit olan sayfalarda nav ayrıca aşağı kaydırınca gizlenir. */
window.__bottomStrips=window.__bottomStrips||[];
(function(){
  var nav=document.querySelector('.bottom-nav');
  if(!nav)return;
  var cookie=document.getElementById('cookieBanner');
  var strips=window.__bottomStrips.map(function(s){return document.querySelector(s);}).filter(Boolean);
  var lastY=window.scrollY||0;
  function stripShown(){for(var i=0;i<strips.length;i++){if(strips[i]&&strips[i].classList.contains('show'))return true;}return false;}
  function update(){
    var y=window.scrollY||0;
    if((cookie&&cookie.classList.contains('show'))||stripShown()){nav.classList.add('bn-hidden');lastY=y;return;}
    if(strips.length===0||y<80){nav.classList.remove('bn-hidden');lastY=y;return;}
    if(y-lastY>12){nav.classList.add('bn-hidden');lastY=y;}
    else if(lastY-y>12){nav.classList.remove('bn-hidden');lastY=y;}
  }
  window.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update,{passive:true});
  document.addEventListener('click',function(){setTimeout(update,60);},true);
  window.__bnUpdate=update;update();
})();

/* ===== HESAPLAYICI GEÇİŞ RAYI — aktif kalemi görünür kıl =====
   Ray tek satır olduğu için (dd-shell.css .calc-switch) on kalem çoğu
   genişlikte sığmaz ve yatay kaydırır. Aktif hesaplayıcı rayın sonunda
   kalırsa açılışta görünmez; sayfa yüklenince onu yatayda ortalıyoruz.
   scrollLeft doğrudan yazılır — scrollIntoView sayfayı DİKEYDE de kaydırır
   ve ray katlamanın altında olduğu için sayfa aşağı sıçrardı. */
(function(){
  var rail=document.querySelector('.calc-switch');
  if(!rail)return;
  var act=rail.querySelector('a.active');
  if(!act)return;
  function center(){
    if(rail.scrollWidth<=rail.clientWidth){rail.scrollLeft=0;return;}
    rail.scrollLeft=act.offsetLeft-(rail.clientWidth-act.offsetWidth)/2;
  }
  center();
  if(window.addEventListener)window.addEventListener('resize',center);
})();

/* ===== DadaMentor FAB + scroll-reveal + scroll-top ===== */
/* ===== ADIM 3 KABUK JS — DadaMentor + Reveal + Scroll-top (Diet hesaplayıcı; ayrı IIFE, sayfa JS ile çakışmaz) ===== */
// ---- DADAMENTOR ASİSTAN PANELİ (floating collapse/expand morph + footer-hide) ----
(function(){
  var panel=document.getElementById('mentorPanel');
  if(!panel)return;
  var mpToggle=document.getElementById('mpToggle');
  var mpToggleIco=document.getElementById('mpToggleIco');
  var mpMiniOv=document.getElementById('mpMiniOv');
  var panelState='mini';
  function collapse(){
    panelState='mini';panel.setAttribute('data-state','mini');panel.classList.add('mini');
    if(mpToggleIco)mpToggleIco.className='fa-solid fa-plus';
    if(mpToggle)mpToggle.setAttribute('aria-label','Paneli büyüt');
    if(mpMiniOv)mpMiniOv.setAttribute('aria-hidden','false');
  }
  function expand(){
    panelState='full';panel.setAttribute('data-state','full');panel.classList.remove('mini');
    if(mpToggleIco)mpToggleIco.className='fa-solid fa-minus';
    if(mpToggle)mpToggle.setAttribute('aria-label','Paneli küçült');
    if(mpMiniOv)mpMiniOv.setAttribute('aria-hidden','true');
  }
  if(mpToggle)mpToggle.addEventListener('click',function(e){e.stopPropagation();panelState==='full'?collapse():expand();});
  if(mpMiniOv)mpMiniOv.addEventListener('click',expand);
  function onFootScroll(){
    var y=window.scrollY||document.documentElement.scrollTop;
    var max=document.documentElement.scrollHeight-window.innerHeight;
    panel.classList.toggle('foot-hide',(max-y)<260);
  }
  window.addEventListener('scroll',onFootScroll,{passive:true});
  window.addEventListener('resize',onFootScroll);
  onFootScroll();
})();
// ---- ÖLÇÜLÜ SCROLL-REVEAL (FOUC-güvenli; .reveal hedefi yoksa no-op; class 'in') ----
(function(){
  var els=document.querySelectorAll('.reveal');
  if(!els.length)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(!('IntersectionObserver' in window))return;
  document.documentElement.classList.add('reveal-ready');
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
  els.forEach(function(el){io.observe(el);});
})();
// ---- SCROLL-TO-TOP (sağ-alt; scrollY eşiği, dipte gizle) ----
(function(){
  var btn=document.getElementById('toTop');
  if(!btn)return;
  var smooth=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function upd(){
    var y=window.scrollY||document.documentElement.scrollTop;
    var max=document.documentElement.scrollHeight-window.innerHeight;
    btn.classList.toggle('show', y>620 && (max-y)>120);
  }
  btn.addEventListener('click',function(){window.scrollTo({top:0,behavior:smooth?'smooth':'auto'});});
  window.addEventListener('scroll',upd,{passive:true});
  window.addEventListener('resize',upd);
  upd();
})();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
