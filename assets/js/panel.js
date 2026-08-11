/* =====================================================================
   PANEL.JS — DİYETİSYEN PANELİ KABUĞU (paylaşılan)
   Panelin sol menüsünü, üst ince barını ve mobil davranışını çalışma
   anında üretir. assets/js/sa-shell.js'in ve assets/js/dd-shell.js'in
   kardeşi — aynı desen: kabuk CSS'i linkli stylesheet (panel.css),
   değişen kısımlar JS'ten, sayfa kendini <body data-*> ile tanıtır.

   Markup ve davranış panel-shell.html'den BİREBİR alındı; tek fark sol
   menünün on bir modülü listelemesi. Yeni sınıf üretilmedi.

   Sayfa kendini tanıtır:
     <body data-brand="mutfak" data-nav="genel">
   Yerleştirme:
     <div class="pnl-app">
       <div id="pnlChrome"></div>          → sidebar + overlay + üst bar
       <script src="assets/js/panel.js"></script>
       <main class="pnl-main"> … </main>
     </div>
   Yer tutucu outerHTML ile DEĞİŞTİRİLİR; sarmalayıcı bırakmaz.
   ===================================================================== */
(function(){

/* =====================================================================
   MODÜL HARİTASI — belge sırası.
   Bugün var olan beş modül (randevular · danışanlar · beslenme planları ·
   mesajlar · profil ve ayarlar) ile bu turda açılan altı modül
   (genel bakış · takvim · değerlendirmeler · takip · ödeme ve kazanç ·
   raporlar) iş akışı sırasına göre iç içe geçer.
   ===================================================================== */
var NAV = [
  {k:'genel',    h:'panel-genel-bakis-v1.html',    ic:'fa-gauge-high',          lbl:'Genel Bakış'},
  {k:'takvim',   h:'panel-takvim-v1.html',         ic:'fa-calendar-days',       lbl:'Takvim'},
  {k:'randevular',h:'dyt-randevular-v1.html',      ic:'fa-regular fa-calendar-check', lbl:'Randevular', cnt:'5'},
  {k:'danisanlar',h:'dyt-danisanlar-v1.html',      ic:'fa-user-group',          lbl:'Danışanlar'},
  {k:'degerlendirme',h:'panel-degerlendirmeler-v1.html', ic:'fa-clipboard-check', lbl:'Değerlendirmeler'},
  {k:'takip',    h:'panel-takip-v1.html',          ic:'fa-chart-line',          lbl:'Takip'},
  {k:'receteler',h:'dyt-receteler-v1.html',        ic:'fa-utensils',            lbl:'Beslenme Planları'},
  {k:'mesajlar', h:'dyt-mesajlar-v1.html',         ic:'fa-regular fa-comment-dots', lbl:'Mesajlar', cnt:'3'},
  {sec:'İşletme'},
  {k:'odeme',    h:'panel-odeme-v1.html',          ic:'fa-wallet',              lbl:'Ödeme ve Kazanç'},
  {k:'raporlar', h:'panel-raporlar-v1.html',       ic:'fa-chart-pie',           lbl:'Raporlar'},
  {sec:'Hesap'},
  {k:'profil',   h:'dyt-profil-ayar-v1.html',      ic:'fa-regular fa-id-badge', lbl:'Profil ve Ayarlar'}
];
window.__panelNav = NAV;

var CUR = document.body.getAttribute('data-nav') || '';

function ico(x){ return x.indexOf('fa-regular')===0 ? x : 'fa-solid '+x; }

function chromeHTML(){
  var links = NAV.map(function(m){
    if(m.sec) return '<div class="pnl-sec-lbl">'+m.sec+'</div>';
    var on = m.k===CUR ? ' is-active' : '';
    return '<a class="pnl-link'+on+'" href="'+m.h+'" data-nav="'+m.k+'"'+(on?' aria-current="page"':'')+'>'
      + '<i class="'+ico(m.ic)+'"></i> '+m.lbl
      + (m.cnt ? ' <span class="pl-cnt">'+m.cnt+'</span>' : '')
      + '</a>';
  }).join('\n      ');

  return ''
  + '<!-- ============ SOL SIDEBAR ============ -->\n'
  + '  <aside class="pnl-side" id="pnlSide">\n'
  + '    <a class="pnl-logo" href="panel-genel-bakis-v1.html">\n'
  + '      <img src="assets/img/logo-official.png" alt="DadaMutfak" />\n'
  + '      <span class="pl-tag">Pro</span>\n'
  + '    </a>\n'
  + '    <nav class="pnl-nav">\n      ' + links + '\n    </nav>\n'
  + '    <div class="pnl-side-foot">\n'
  + '      <a class="pnl-link" href="diyetisyen-profil-v1.html"><i class="fa-regular fa-eye"></i> Public Profilim</a>\n'
  + '      <a class="sa-sig" href="https://gaviaworks.com" target="_blank" rel="noopener" data-tip="Gaviaworks" aria-label="Gaviaworks — gaviaworks.com"><img src="assets/img/gavia-mark.png" alt="Gaviaworks" /></a>\n'
  + '    </div>\n'
  + '  </aside>\n'
  + '  <div class="pnl-overlay" id="pnlOverlay"></div>\n\n'
  + '  <!-- ============ ÜST İNCE BAR ============ -->\n'
  + '  <header class="pnl-top">\n'
  + '    <button class="pnl-burger" id="pnlBurger" aria-label="Menü"><i class="fa-solid fa-bars"></i></button>\n'
  + '    <div class="pnl-search">\n'
  + '      <i class="fa-solid fa-magnifying-glass"></i>\n'
  + '      <input type="text" placeholder="Danışan, randevu veya beslenme planı ara…" aria-label="Panelde ara" />\n'
  + '    </div>\n'
  + '    <div class="pnl-top-tools">\n'
  + '      <a class="pnl-bell pnl-site" href="saglik-hub-v1.html" data-tip="Siteyi Görüntüle" aria-label="Siteyi Görüntüle"><i class="fa-solid fa-globe"></i></a>\n'
  + '      <button class="pnl-bell" aria-label="Bildirimler" data-tip="Bildirimler"><i class="fa-regular fa-bell"></i><span class="pb-dot"></span></button>\n'
  + '      <div class="pnl-me">\n'
  + '        <div class="pm-ava" style="background-image:url(\'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=240&q=80&auto=format&fit=crop&exp=7&gam=6&sat=-9&high=8&vib=5\')"></div>\n'
  + '        <div class="pm-id">\n'
  + '          <div class="pm-name">Dyt. Elif Şahin</div>\n'
  + '          <div class="pm-role">Diyetisyen · Onaylı</div>\n'
  + '        </div>\n'
  + '        <i class="fa-solid fa-chevron-down"></i>\n'
  + '      </div>\n'
  + '    </div>\n'
  + '  </header>';
}

var slot = document.getElementById('pnlChrome');
if(slot) slot.outerHTML = chromeHTML();

/* ============ PANEL ORTAK JS — panel-shell.html'den BİREBİR ============ */
(function(){
  var burger=document.getElementById('pnlBurger'),
      overlay=document.getElementById('pnlOverlay');
  if(burger) burger.addEventListener('click',function(){document.body.classList.toggle('nav-open')});
  if(overlay) overlay.addEventListener('click',function(){document.body.classList.remove('nav-open')});

  /* SS paramı: ?nav=1 mobil sidebar açık */
  var q=new URLSearchParams(location.search);
  if(q.get('nav')==='1') document.body.classList.add('nav-open');
})();

/* aktif modül görünür alana kaydırılsın (11 modül, sidebar kaydırmalı) */
(function(){
  var act=document.querySelector('.pnl-nav .pnl-link.is-active');
  if(act && act.scrollIntoView) act.scrollIntoView({block:'nearest'});
})();

})();
