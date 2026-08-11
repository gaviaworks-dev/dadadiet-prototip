/* =====================================================================
   PLANIM.JS — DADADİET KİŞİSEL ALAN (paylaşılan)
   10 kişisel alan sayfasının ortak parçalarını çalışma anında üretir:
     · sayfa başlığı (.pnl-page-head)
     · alt gezinme (.pf-tabbar / .pf-tabs — public taraftan, panel kabuğu DEĞİL)
     · ziyaretçi kapısı (üyelik faydaları ekranı)
     · veri / başlangıç durumu anahtarı

   dd-shell.js'in kardeşi değil, TAMAMLAYICISI: sayfa önce public kabuğu
   yükler, sonra bu dosyayı. Panelin kendi kabuğu (pnl-top / pnl-side /
   pnl-nav / pnl-burger) hiç kullanılmaz.

   Sayfa kendini <body data-planim="anahtar"> ile tanıtır.
   Yerleşim: <div id="planimTop"></div>  → başlık + alt gezinme
             <div id="planimData">…</div> → içerik (veri varken)
             <div id="planimStart">…</div> → yönlendirici başlangıç durumu

   ÇALIŞMA SIRASI: dd-shell.js FAZ A'da body.is-auth ve body.has-data
   sınıflarını basar; bu dosya onları okur. Bu yüzden dd-shell.js'ten
   SONRA yüklenir.
   ===================================================================== */
(function(){

/* ---- kişisel alan haritası — hedefler tek yerde ---- */
var P = [
  {k:'ozet',      h:'planim-v1.html',                   ico:'fa-house',            lbl:'Planım',
   t:'Planım',            s:'Bugünün özeti, aktif programın ve yaklaşan randevun tek ekranda.'},
  {k:'gunluk',    h:'planim-gunluk-takip-v1.html',      ico:'fa-utensils',         lbl:'Günlük Takip',
   t:'Günlük Takip',      s:'Öğünlerini, besinlerini ve suyunu gir; günlük hedefine ne kadar kaldığını gör.'},
  {k:'program',   h:'planim-programim-v1.html',         ico:'fa-clipboard-list',   lbl:'Programım',
   t:'Programım',         s:'Aktif programın, günleri, öğün alternatifleri ve tamamlama durumun.'},
  {k:'ilerleme',  h:'planim-ilerlemem-v1.html',         ico:'fa-chart-line',       lbl:'İlerlemem',
   t:'İlerlemem',         s:'Takip etmeyi seçtiğin ölçümler ve zaman içindeki değişimleri.'},
  {k:'alisveris', h:'planim-alisveris-v1.html',         ico:'fa-basket-shopping',  lbl:'Alışveriş Listem',
   t:'Alışveriş Listem',  s:'Programından ve tariflerinden otomatik gelen, düzenleyebildiğin liste.'},
  {k:'randevu',   h:'planim-randevularim-v1.html',      ico:'fa-calendar-check',   lbl:'Randevularım',
   t:'Randevularım',      s:'Yaklaşan ve geçmiş görüşmelerin; yeniden planlama ve iptal.'},
  {k:'mesaj',     h:'planim-mesajlarim-v1.html',        ico:'fa-comment-dots',     lbl:'Mesajlarım',
   t:'Mesajlarım',        s:'Diyetisyeninle yazış, plan dosyalarını buradan al.'},
  {k:'kayit',     h:'planim-kaydettiklerim-v1.html',    ico:'fa-bookmark',         lbl:'Kaydettiklerim',
   t:'Kaydettiklerim',    s:'Besin, rehber, program, test sonucu ve hesaplayıcı sonuçların.'},
  {k:'profil',    h:'planim-saglik-profilim-v1.html',   ico:'fa-heart-pulse',      lbl:'Sağlık Profilim',
   t:'Sağlık Profilim',   s:'Hedefin, ölçülerin ve beslenme tercihlerin — önerileri bunlar besler.'},
  {k:'veri',      h:'planim-veri-izinler-v1.html',      ico:'fa-shield-halved',    lbl:'Veri ve İzinlerim',
   t:'Veri ve İzinlerim', s:'İzinlerin, gizlilik tercihlerin, veri indirme ve silme talepleri.'}
];
window.__planimMap = P;   /* dd-shell.js hesap menüsü aynı haritadan beslenir */

var B     = document.body;
var KEY   = B.getAttribute('data-planim') || 'ozet';
var CUR   = P.filter(function(x){return x.k===KEY;})[0] || P[0];
var AUTH  = B.classList.contains('is-auth');
var DATA  = B.classList.contains('has-data');

/* =====================================================================
   ZİYARETÇİ KAPISI — Planım'a tıklayan ziyaretçi panele girmez, önce
   üyelik faydalarını görür. Giriş sonrası AYNI sayfaya döner (portala
   düşmez): buton mevcut sayfanın adresine ?auth=1 ekler.
   ===================================================================== */
function gateHTML(){
  var fayda = [
    {i:'fa-utensils',        b:'Günlük takibin kayıtlı kalsın',   s:'Öğün, su ve porsiyon girişlerin her gün birikir; ilerlemeni geriye dönük görürsün.'},
    {i:'fa-clipboard-list',  b:'Programın seninle yürüsün',       s:'Seçtiğin programın kaçıncı gününde olduğunu ve neyi tamamladığını takip eder.'},
    {i:'fa-chart-line',      b:'Değişimini ölç',                  s:'Kilo, bel ve BKİ gibi seçtiğin ölçümlerin zaman içindeki eğrisini çıkarır.'},
    {i:'fa-user-doctor',     b:'Diyetisyeninle tek yerden ilerle',s:'Randevuların, mesajların ve plan revizyonların Planım içinde toplanır.'},
    {i:'fa-bookmark',        b:'Beğendiklerin kaybolmasın',       s:'Besin, rehber, program ve test sonuçlarını kaydeder, istediğinde açarsın.'}
  ];
  var rows = fayda.map(function(f){
    return '<div class="set-row">'
      + '<span class="sr-ico"><i class="fa-solid '+f.i+'"></i></span>'
      + '<span class="sr-txt"><b>'+f.b+'</b><span>'+f.s+'</span></span>'
      + '</div>';
  }).join('');

  /* giriş sonrası dönüş: mevcut sayfa + ?auth=1 → kullanıcı buraya döner */
  var geri = location.pathname.split('/').pop() || 'planim-v1.html';

  /* YERLEŞİM: kart sabit genişlikle sola yapışmasın — kişisel alanın kendi
     iki kolonlu kabı .dash-cols kullanılıyor (soldaki geniş kolon faydalar,
     sağdaki dar kolon giriş ve bilgilendirme). Sayfa genişliği kullanılır. */
  return ''
  + '<div class="pnl-page-head">'
  +   '<div><h1>Planım üyelere özel</h1>'
  +   '<div class="ph-sub">Kişisel alanına girmek için önce giriş yapman gerekiyor. Girişten sonra tam olarak bu sayfaya döneceksin.</div></div>'
  + '</div>'
  + '<div class="dash-cols">'
  +   '<div class="pnl-card">'
  +     '<div class="pc-head"><span class="pc-title"><i class="fa-solid fa-circle-check"></i> Üye olunca ne kazanırsın?</span></div>'
  +     '<div class="pc-body"><div class="set-list">'+rows+'</div></div>'
  +   '</div>'
  +   '<div>'
  +     '<div class="pnl-card">'
  +       '<div class="pc-head"><span class="pc-title"><i class="fa-regular fa-user"></i> Giriş yap</span></div>'
  +       '<div class="pc-body">'
  +         '<a class="btn btn-primary" style="width:100%;justify-content:center" href="'+geri+'?auth=1"><i class="fa-regular fa-user"></i> Giriş Yap</a>'
  +         '<a class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:10px" href="saglik-hub-v1.html"><i class="fa-solid fa-arrow-left"></i> Ana sayfaya dön</a>'
  +         '<div class="fk-help"><i class="fa-solid fa-circle-info"></i><span>Hesabın yok mu? Üye kaydı yakında açılıyor.</span></div>'
  +       '</div>'
  +     '</div>'
  +     '<div class="pnl-card">'
  +       '<div class="pc-body"><div class="fk-help" style="margin-top:0">'
  +         '<i class="fa-solid fa-shield-halved"></i>'
  +         '<span>Planım kişisel verilerini işler. Neyin saklandığını, nasıl indireceğini ve nasıl sildireceğini üye olduktan sonra <b>Veri ve İzinlerim</b> sayfasından yönetirsin.</span>'
  +       '</div></div>'
  +     '</div>'
  +   '</div>'
  + '</div>';
}

/* =====================================================================
   BAŞLIK + ALT GEZİNME — .pnl-page-head (panel bileşeni) ve
   .pf-tabbar/.pf-tabs (public sekme çubuğu; saglik-testler-v1 ve
   diyetisyen-profil-v1 aynı bileşeni kullanıyor)
   ===================================================================== */
function navHTML(){
  var tabs = P.map(function(x){
    var on = x.k===KEY ? ' active' : '';
    return '<a class="dt'+on+'" href="'+x.h+'"'+(on?' aria-current="page"':'')+'>'
      + '<i class="fa-solid '+x.ico+'"></i> '+x.lbl+'</a>';
  }).join('');

  return ''
  + '<div class="pnl-page-head">'
  +   '<div><h1>'+CUR.t+'</h1><div class="ph-sub">'+CUR.s+'</div></div>'
  +   '<div class="ph-actions">'
  +     '<a class="btn btn-ghost btn-sm" href="planim-gunluk-takip-v1.html"><i class="fa-solid fa-plus"></i> Öğün Ekle</a>'
  +     '<a class="btn btn-green btn-sm" href="planim-programim-v1.html"><i class="fa-solid fa-clipboard-list"></i> Programa Dön</a>'
  +   '</div>'
  + '</div>'
  + '<div class="pf-tabbar"><nav class="pf-tabs" aria-label="Planım bölümleri">'+tabs+'</nav></div>';
}

/* =====================================================================
   YERLEŞTİRME
   ===================================================================== */
var top = document.getElementById('planimTop');

if(!AUTH){
  /* ziyaretçi: panel içeriği HİÇ basılmaz */
  var main = document.getElementById('pageMain');
  var wrap = main ? main.querySelector('.wrap') : null;
  if(wrap) wrap.innerHTML = gateHTML();
  B.setAttribute('data-planim-gate','1');
}else{
  if(top) top.outerHTML = navHTML();
  /* veri var / yok — boş kart göstermek yerine yönlendirici başlangıç durumu */
  var d = document.getElementById('planimData');
  var s = document.getElementById('planimStart');
  if(d) d.hidden = !DATA;
  if(s) s.hidden = !!DATA;
  /* aktif sekmeyi görünür alana kaydır (10 sekme, yatay scroll) */
  var act = document.querySelector('.pf-tabs .dt.active');
  if(act && act.scrollIntoView) act.scrollIntoView({block:'nearest',inline:'center'});
}

})();
