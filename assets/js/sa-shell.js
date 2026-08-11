/* =====================================================================
   OMURGA JS — config-driven render (?role= + ?sec=)
   Bölüm geçişi rail anchor'larıyla TAM SAYFA reload üzerinden olur
   (?business/?pro deseninin kardeşi); rol localStorage'da kalıcı.
   ===================================================================== */
(function(){
  var GREET = '20 Haziran 2026, Cuma';

  /* ---- BÖLÜM config ---- */
  var SECTIONS = {
    genel: { eyebrow:'Süper Admin', title:'Genel Bakış', menu:[
      {ic:'fa-gauge-high', lbl:'Genel Bakış', sec:'genel', active:true},
      {seclbl:'Bölümler'},
      {ic:'fa-shield-halved',  lbl:'Admin',          href:'sa-admin.html'},
      {ic:'fa-heart-pulse',    lbl:'Sağlık & Diyet', href:'sa-saglik.html'},
      {ic:'fa-bag-shopping',   lbl:'DadaStore',      href:'sa-store.html'},
      {ic:'fa-dumbbell',       lbl:'DadaFit',        href:'sa-dadafit.html'},
      {ic:'fa-store',          lbl:'İşletmeler',     href:'sa-isletme.html'},
      {ic:'fa-graduation-cap', lbl:'Akademi',        soon:true}
    ]},
    admin: { eyebrow:'Yönetim', title:'Admin', menu:[
      {ic:'fa-gauge-high',     lbl:'Genel Bakış',          href:'sa-admin.html',                   screen:'genel', active:true},
      {ic:'fa-users-gear',     lbl:'Kullanıcılar & Yetki', href:'sa-admin-kullanicilar.html',      screen:'kullanicilar', cnt:'7'},
      {ic:'fa-award',          lbl:'Rozetler',             href:'admin-rozet-v1.html#rozet',       screen:'rozet'},
      {ic:'fa-crown',          lbl:'Abonelikler',          href:'admin-rozet-v1.html#abonelikler', screen:'abonelikler'},
      {ic:'fa-building-circle-check', lbl:'İşletme Başvuruları', href:'admin-rozet-v1.html#isletmeler', screen:'isletmeler'},
      {ic:'fa-book-open',      lbl:'Tarifler',         href:'sa-admin-tarifler.html',      screen:'tarifler'},
      {ic:'fa-user-tie',       lbl:'Şefler',           href:'sa-admin-sefler.html',        screen:'sefler'},
      {ic:'fa-ranking-star',   lbl:'Kademeler',        href:'sa-admin-kademeler.html',     screen:'kademeler'},
      {ic:'fa-tags',           lbl:'Fiyatlandırma',    href:'sa-admin-fiyatlandirma.html', screen:'fiyatlandirma'},
      {ic:'fa-images',         lbl:'Slider / Banner',  href:'sa-admin-slider.html',        screen:'slider'},
      {ic:'fa-file-lines',     lbl:'Sayfalar & SEO',   href:'sa-admin-sayfalar.html',      screen:'sayfalar'},
      {ic:'fa-feather',        lbl:'Blog & İçerik',    href:'sa-admin-icerik.html',        screen:'icerik'},
      {ic:'fa-spell-check',    lbl:'Sözlük',           href:'sa-admin-sozluk.html',        screen:'sozluk'},
      {ic:'fa-sitemap',        lbl:'Taksonomi',        href:'sa-admin-taksonomi.html',     screen:'taksonomi'},
      {ic:'fa-bars-staggered', lbl:'Menü / Navigasyon',href:'sa-admin-menu.html',          screen:'menu'},
      {ic:'fa-sliders',        lbl:'Ayarlar',          href:'sa-admin-ayarlar.html',       screen:'ayarlar'},
      {ic:'fa-chart-line',     lbl:'Raporlar',         href:'sa-admin-raporlar.html',      screen:'raporlar'}
    ]},
    saglik: { eyebrow:'Sağlık', title:'Sağlık & Diyet', menu:[
      {ic:'fa-gauge-high',     lbl:'Genel Bakış',  href:'sa-saglik.html',                screen:'genel', active:true},
      {ic:'fa-user-doctor',    lbl:'Diyetisyenler', href:'sa-saglik-diyetisyenler.html', screen:'diyetisyenler', cnt:'4'},
      {ic:'fa-calendar-check', lbl:'Randevular',     href:'sa-saglik-randevular.html',     screen:'randevular'},
      {ic:'fa-clipboard-list', lbl:'Reçeteler',      href:'sa-saglik-receteler.html',      screen:'receteler'},
      {ic:'fa-vial',           lbl:'Testler',        href:'sa-saglik-testler.html',        screen:'testler'},
      {ic:'fa-calculator',     lbl:'Hesaplayıcılar', href:'sa-saglik-hesaplayicilar.html', screen:'hesaplayicilar'}
    ]},
    store: { eyebrow:'E-Ticaret', title:'DadaStore', menu:[
      {ic:'fa-gauge-high',  lbl:'Genel Bakış', href:'sa-store.html',         screen:'genel', active:true},
      {ic:'fa-box',         lbl:'Ürünler',     href:'sa-store-urunler.html', screen:'urunler', cnt:'8'},
      {ic:'fa-layer-group', lbl:'Kategoriler',   href:'sa-store-kategoriler.html',  screen:'kategoriler'},
      {ic:'fa-receipt',     lbl:'Siparişler',    href:'sa-store-siparisler.html',   screen:'siparisler'},
      {ic:'fa-user-group',  lbl:'Müşteriler',    href:'sa-store-musteriler.html',   screen:'musteriler'},
      {ic:'fa-percent',     lbl:'Promosyonlar',  href:'sa-store-promosyonlar.html', screen:'promosyonlar'},
      {ic:'fa-truck',       lbl:'Kargo & Ödeme', href:'sa-store-kargo.html',        screen:'kargo'},
      {ic:'fa-chart-line',  lbl:'Raporlar',      href:'sa-store-raporlar.html',     screen:'raporlar'}
    ]},
    dadafit: { eyebrow:'Fitness', title:'DadaFit', menu:[
      {ic:'fa-gauge-high', lbl:'Genel Bakış',   href:'sa-dadafit.html',           screen:'genel', active:true},
      {ic:'fa-trophy',     lbl:"Challenge'lar", href:'sa-dadafit-challenge.html', screen:'challenge'},
      {ic:'fa-user-ninja', lbl:'Antrenörler', href:'sa-dadafit-antrenorler.html', screen:'antrenorler'},
      {ic:'fa-dumbbell',   lbl:'Egzersizler', href:'sa-dadafit-egzersizler.html', screen:'egzersizler'},
      {ic:'fa-list-check', lbl:'Programlar',  href:'sa-dadafit-programlar.html',  screen:'programlar'}
    ]},
    isletme: { eyebrow:'İşletme', title:'İşletmeler', menu:[
      {ic:'fa-gauge-high',    lbl:'Genel Bakış', href:'sa-isletme.html',            screen:'genel', active:true},
      {ic:'fa-store',         lbl:'İşletmeler',  href:'sa-isletme-isletmeler.html', screen:'isletmeler', cnt:'5'},
      {ic:'fa-calendar-day',  lbl:'Rezervasyonlar',    href:'sa-isletme-rezervasyonlar.html', screen:'rezervasyonlar'},
      {ic:'fa-utensils',      lbl:'Menüler',           href:'sa-isletme-menuler.html',        screen:'menuler'},
      {ic:'fa-circle-check',  lbl:'Onaylar',           href:'sa-isletme-onaylar.html',        screen:'onaylar'},
      {ic:'fa-rectangle-ad',  lbl:'Reklam Paketleri',  href:'sa-isletme-reklam.html',         screen:'reklam'}
    ]},
    akademi: { eyebrow:'İçerik', title:'DadaAkademi', locked:true, menu:[] }
  };

  /* ---- ROL config ---- */
  var ROLES = {
    'super':         {name:'Süper Admin',       role:'Tüm yetki',       secs:['genel','admin','saglik','store','dadafit','isletme','akademi'], land:'genel'},
    'saglik-admin':  {name:'Sağlık Yöneticisi', role:'Sağlık & Diyet',  secs:['saglik'],  land:'saglik'},
    'store-admin':   {name:'Store Yöneticisi',  role:'E-Ticaret',       secs:['store'],   land:'store'},
    'dadafit-admin': {name:'DadaFit Yöneticisi',role:'Fitness',         secs:['dadafit'], land:'dadafit'},
    'isletme-admin': {name:'İşletme Yöneticisi',role:'İşletmeler',      secs:['isletme'], land:'isletme'}
  };

  var q = new URLSearchParams(location.search);

  /* ---- rol çöz (param > localStorage > super) ---- */
  var role = q.get('role');
  if(role){ try{localStorage.setItem('dm_sa_role', role);}catch(e){} }
  else { try{role = localStorage.getItem('dm_sa_role');}catch(e){} }
  if(!ROLES[role]) role = 'super';
  var R = ROLES[role];

  /* ---- persona ---- */
  document.getElementById('pmName').textContent = R.name;
  document.getElementById('pmRole').textContent = R.role;

  /* ---- rail görünürlük (rol) ---- */
  document.querySelectorAll('.sa-rail-ico[data-sec]').forEach(function(el){
    el.hidden = R.secs.indexOf(el.getAttribute('data-sec')) === -1;
  });

  /* ---- bölüm + ekran çöz (param > body data > landing) + yetki guard ---- */
  var screen = document.body.dataset.screen || null;   // statik ekran dosyalarında aktif item
  var sec = q.get('sec') || document.body.dataset.sec || R.land;
  if(R.secs.indexOf(sec) === -1) sec = R.land;     // yetki dışına elle gidişi kendi bölümüne düşür
  document.body.dataset.sec = sec;

  /* ---- rail aktif ---- */
  document.querySelectorAll('.sa-rail-ico[data-sec]').forEach(function(el){
    el.classList.toggle('is-active', el.getAttribute('data-sec') === sec);
  });

  var S = SECTIONS[sec];

  /* ---- bölüm menüsü render ---- */
  function esc(s){return s;}
  var menuHTML = '<div class="sa-menu-head"><span class="smh-eyebrow">'+S.eyebrow+'</span><span class="smh-title">'+S.title+'</span></div><div class="sa-mnav">';
  if(S.locked){
    menuHTML += '<div class="sa-msec">İçerik Yönetimi</div>'
      + '<a class="sa-mlink is-locked"><i class="fa-solid fa-lock"></i> Yakında <span class="ml-soon">Soon</span></a>';
  } else {
    S.menu.forEach(function(m){
      if(m.seclbl){ menuHTML += '<div class="sa-msec">'+m.seclbl+'</div>'; return; }
      var href = m.href || (m.sec ? ('?sec='+m.sec) : '#');
      var isActive = screen ? (m.screen===screen) : !!m.active;
      var cls = 'sa-mlink' + (isActive?' is-active':'') + (m.soon?' is-locked':'');
      var tail = m.cnt ? '<span class="pl-cnt">'+m.cnt+'</span>' : (m.soon ? '<span class="ml-soon">Yakında</span>' : '');
      menuHTML += '<a class="'+cls+'" href="'+href+'" data-soon="'+(m.soon?1:0)+'"><i class="fa-solid '+m.ic+'"></i> '+m.lbl+tail+'</a>';
    });
  }
  menuHTML += '</div><div class="sa-menu-foot">'
    + '<a class="sa-mlink" href="sa-giris-v1.html"><i class="fa-solid fa-right-from-bracket"></i> Çıkış / Rol Değiştir</a>'
    + '</div>';
  document.getElementById('saMenu').innerHTML = menuHTML;

  /* ---- içerik render — YALNIZ boş #saMain için (statik ekran dosyaları kendi içeriğini taşır) ---- */
  var mainEl = document.getElementById('saMain');
  if(mainEl && mainEl.childElementCount === 0){
    var main;
    if(sec === 'akademi' || S.locked){ main = lockedView(S); }
    else if(sec === 'genel'){ main = globalDash(); }
    else { main = sectionPlaceholder(S); }
    mainEl.innerHTML = main;
  }

  /* ---- menü modül linkleri (href="#") tıklaması: aktif toggle, placeholder kalır ---- */
  document.getElementById('saMenu').addEventListener('click', function(e){
    var a = e.target.closest('.sa-mlink');
    if(!a) return;
    if(a.classList.contains('is-locked')){ e.preventDefault(); return; }
    if(a.getAttribute('href') === '#'){
      e.preventDefault();
      document.querySelectorAll('#saMenu .sa-mlink').forEach(function(x){x.classList.remove('is-active')});
      a.classList.add('is-active');
    }
  });

  /* ---- akademi rail kilidi: geçiş yok ---- */
  document.querySelectorAll('.sa-rail-ico.is-locked').forEach(function(el){
    el.addEventListener('click', function(e){ e.preventDefault(); });
  });

  /* =================== içerik şablonları =================== */
  function globalDash(){
    return ''
    + '<div class="pnl-page-head"><div>'
    +   '<h1>Genel Bakış</h1>'
    +   '<div class="ph-sub">'+GREET+' — platform genelinde 12 bekleyen onay ve 7 yeni sipariş var.</div>'
    + '</div><div class="ph-actions">'
    +   '<a class="btn btn-ghost btn-sm" href="#"><i class="fa-solid fa-arrow-down-to-line"></i> Rapor İndir</a>'
    + '</div></div>'
    + '<div class="kpi-grid">'
    +   kpi('warm','fa-clipboard-check','12','Bekleyen onay','down','fa-clock','4 diyetisyen · 5 işletme · 3 içerik')
    +   kpi('','fa-users','8.412','Aktif kullanıcı','up','fa-arrow-trend-up','+6% bu ay')
    +   kpi('','fa-bolt','1.337','Günlük aktivite','flat','fa-equals','son 24 saat')
    +   kpi('sun','fa-crown','₺142.500','Pro abonelik geliri','up','fa-arrow-trend-up','+18% bu ay')
    + '</div>'
    + '<div class="dash-row"><div class="pnl-card">'
    +   '<div class="pc-head"><div class="pc-title"><i class="fa-solid fa-wave-square"></i> Son Aktivite</div>'
    +     '<a class="pc-link" href="#">Tümü <i class="fa-solid fa-arrow-right"></i></a></div>'
    +   '<div class="act-list">'
    +     act('fa-user-doctor','t-saglik','Sağlık','Yeni diyetisyen başvurusu','Dyt. Ayça Yıldız — onay bekliyor','12 dk')
    +     act('fa-receipt','t-store','Store','Yeni sipariş #DS-2041','Selin K. · ₺640 · 3 ürün','28 dk')
    +     act('fa-store','t-isletme','İşletme','Yeni işletme kaydı','Köşe Mutfağı — belge doğrulaması bekliyor','1 sa')
    +     act('fa-trophy','t-dadafit','DadaFit','Challenge katılımı arttı','Haziran Challenge — 1.204 katılımcı','2 sa')
    +     act('fa-flag','t-admin','Admin','İçerik şikayeti bildirildi','“Mercimek Köftesi” yorumu — inceleme','3 sa')
    +   '</div>'
    + '</div></div>'
    + '<div class="dash-row"><div class="pnl-card">'
    +   '<div class="pc-head"><div class="pc-title"><i class="fa-solid fa-grip"></i> Bölümler</div></div>'
    +   '<div class="pc-body"><div class="sec-grid">'
    +     secCard('sa-admin.html','fa-shield-halved','t-admin','Admin','Kullanıcı, içerik, ayarlar')
    +     secCard('sa-saglik.html','fa-heart-pulse','t-saglik','Sağlık & Diyet','Diyetisyen, randevu, test')
    +     secCard('sa-store.html','fa-bag-shopping','t-store','DadaStore','Ürün, sipariş, kargo')
    +     secCard('sa-dadafit.html','fa-dumbbell','t-dadafit','DadaFit','Antrenör, program, challenge')
    +     secCard('sa-isletme.html','fa-store','t-isletme','İşletmeler','Mekan, rezervasyon, menü')
    +     secCardLocked('fa-graduation-cap','DadaAkademi','İçerik & bilgi bankası — yakında')
    +   '</div></div>'
    + '</div></div>';
  }

  function sectionPlaceholder(S){
    return ''
    + '<div class="pnl-page-head"><div>'
    +   '<h1>'+S.title+'</h1>'
    +   '<div class="ph-sub">'+S.eyebrow+' yönetimi — bu bölümün ekranları sonraki dalgada eklenecek.</div>'
    + '</div></div>'
    + '<div class="pnl-card"><div class="pnl-empty">'
    +   '<div class="pe-ico"><i class="fa-solid fa-screwdriver-wrench"></i></div>'
    +   '<h4>'+S.title+' modülleri yapım aşamında</h4>'
    +   '<p>Soldaki menüde bu bölümün modül başlıkları görünüyor. Yönetim ekranları (liste / form / detay) bir sonraki paralel dalgada bağlanacak.</p>'
    +   '<span class="pe-tag"><i class="fa-solid fa-layer-group"></i> Omurga · çift-sidebar aktif</span>'
    + '</div></div>';
  }

  function lockedView(S){
    return ''
    + '<div class="pnl-page-head"><div>'
    +   '<h1>'+S.title+'</h1>'
    +   '<div class="ph-sub">'+S.eyebrow+' yönetimi henüz açık değil.</div>'
    + '</div></div>'
    + '<div class="pnl-card"><div class="pnl-empty">'
    +   '<div class="pe-ico"><i class="fa-solid fa-lock"></i></div>'
    +   '<h4>DadaAkademi yakında</h4>'
    +   '<p>İçerik &amp; bilgi bankası yönetimi (tarif, sözlük, püf noktaları, mutfağa giriş, ramazan menüleri) bu sürümde kilitli.</p>'
    +   '<span class="pe-tag"><i class="fa-solid fa-clock"></i> Yakında</span>'
    + '</div></div>';
  }

  /* yardımcılar */
  function kpi(mod,ic,num,lbl,dir,dic,delta){
    return '<div class="kpi-card '+mod+'"><div class="kpi-ico"><i class="fa-solid '+ic+'"></i></div>'
      + '<div><div class="kpi-num">'+num+'</div><div class="kpi-lbl">'+lbl+'</div>'
      + '<div class="kpi-delta '+dir+'"><i class="fa-solid '+dic+'"></i> '+delta+'</div></div></div>';
  }
  function act(ic,tag,tagl,title,sub,time){
    return '<div class="act-row"><div class="act-ico '+tag+'"><i class="fa-solid '+ic+'"></i></div>'
      + '<div class="act-info"><b>'+title+'</b><span>'+sub+'</span></div>'
      + '<span class="act-tag '+tag+'">'+tagl+'</span><span class="act-time">'+time+'</span></div>';
  }
  function secCard(href,ic,tag,title,sub){
    return '<a class="sec-card" href="'+href+'"><div class="sc-ico '+tag+'"><i class="fa-solid '+ic+'"></i></div>'
      + '<div class="sc-tt"><b>'+title+'</b><span>'+sub+'</span></div></a>';
  }
  function secCardLocked(ic,title,sub){
    return '<div class="sec-card is-locked"><div class="sc-ico t-isletme" style="background:var(--bg);color:var(--muted)"><i class="fa-solid '+ic+'"></i></div>'
      + '<div class="sc-tt"><b>'+title+' <i class="fa-solid fa-lock" style="font-size:10px;color:var(--muted)"></i></b><span>'+sub+'</span></div></div>';
  }
})();

/* ---- mobil drawer (panel-shell deseni birebir) ---- */
(function(){
  var burger=document.getElementById('pnlBurger'), overlay=document.getElementById('pnlOverlay');
  if(burger) burger.addEventListener('click',function(){document.body.classList.toggle('nav-open')});
  if(overlay) overlay.addEventListener('click',function(){document.body.classList.remove('nav-open')});
  var q=new URLSearchParams(location.search);
  if(q.get('nav')==='1') document.body.classList.add('nav-open');
})();

/* ---- divider grip — 2. menüyü katla/aç (durum localStorage'da kalıcı, ayrı buton YOK) ---- */
(function(){
  var div=document.getElementById('saDivider');
  try{ if(localStorage.getItem('dm_sa_menu')==='collapsed') document.body.classList.add('sa-collapsed'); }catch(e){}
  function isC(){ return document.body.classList.contains('sa-collapsed'); }
  function set(c){
    document.body.classList.toggle('sa-collapsed', c);
    try{ localStorage.setItem('dm_sa_menu', c?'collapsed':'open'); }catch(e){}
  }
  if(!div)return;
  var dragging=false, startX=0, moved=false;
  div.addEventListener('pointerdown',function(e){
    dragging=true; moved=false; startX=e.clientX; div.classList.add('is-drag');
    try{ div.setPointerCapture(e.pointerId); }catch(_){}
  });
  div.addEventListener('pointermove',function(e){
    if(!dragging) return;
    var dx=e.clientX-startX;
    if(Math.abs(dx)>5) moved=true;
    if(dx<-26 && !isC()) set(true);
    else if(dx>26 && isC()) set(false);
  });
  function end(){ if(dragging && !moved) set(!isC()); dragging=false; div.classList.remove('is-drag'); }
  div.addEventListener('pointerup',end);
  div.addEventListener('pointercancel',end);
})();

/* ---- RAIL POLISH — anında ipucu (native title→data-tip), Siteye Dön netleştir, Gavia imzası ---- */
(function(){
  var rail=document.getElementById('saRail'); if(!rail)return;
  rail.querySelectorAll('.sa-rail-ico[title]').forEach(function(a){
    var t=a.getAttribute('title'); if(!t)return;
    a.setAttribute('data-tip',t); a.setAttribute('aria-label',t); a.removeAttribute('title');
  });
  var siteHref='anasayfa-portal-v3a.html';
  var foot=rail.querySelector('.sa-rail-foot');
  if(foot){
    /* sol alt "Siteye Git" external-link okunu SİL — işlev sağ üste taşındı; hedefi al */
    var back=foot.querySelector('.sa-rail-ico');
    if(back){ siteHref=back.getAttribute('href')||siteHref; back.remove(); }
    /* Gavia "g" imzası YERİNDE kalır */
    if(!foot.querySelector('.sa-sig')){
      var sig=document.createElement('a'); sig.className='sa-sig';
      sig.href='https://gaviaworks.com'; sig.target='_blank'; sig.rel='noopener';
      sig.innerHTML='<img src="assets/img/gavia-mark.png" alt="Gaviaworks" />';
      sig.setAttribute('data-tip','Gaviaworks'); sig.setAttribute('aria-label','Gaviaworks — gaviaworks.com');
      foot.appendChild(sig);
    }
  }
  /* SAĞ ÜST — "Siteyi Görüntüle" (zilin SOLUNA, zil ile aynı dil/boyut) */
  var tools=document.querySelector('.pnl-top-tools');
  var bell=tools && tools.querySelector('.pnl-bell');
  if(tools && bell){
    if(!bell.getAttribute('data-tip')) bell.setAttribute('data-tip','Bildirimler');
    if(!tools.querySelector('.pnl-site')){
      var site=document.createElement('a');
      site.className='pnl-bell pnl-site'; site.href=siteHref;
      site.setAttribute('data-tip','Siteyi Görüntüle'); site.setAttribute('aria-label','Siteyi Görüntüle');
      site.innerHTML='<i class="fa-solid fa-globe"></i>';
      tools.insertBefore(site, bell);
    }
  }
})();

/* ---- PAYLAŞILAN UI primitifleri artık assets/js/sa-ui.js içinde (saToast /
   saConfirm / delege SİL / hesap dropdown). Admin kabuğu onları BURADAN yükler;
   admin'e özgü hesap menüsü içeriğini sa-ui'ye config olarak geçirir. ---- */
(function(){
  /* admin hesap menüsü içeriği — operatör varsayılanından farklı (Bildirim Tercihleri + Rol Değiştir) */
  window.SA_ACCOUNT_ITEMS=[
    {ic:'fa-regular fa-user',  lbl:'Profil',               soon:true},
    {ic:'fa-solid fa-sliders', lbl:'Hesap Ayarları',       soon:true},
    {ic:'fa-regular fa-bell',  lbl:'Bildirim Tercihleri',  soon:true},
    {div:true},
    {ic:'fa-solid fa-right-from-bracket', lbl:'Çıkış / Rol Değiştir', href:'sa-giris-v1.html', danger:true}
  ];
  /* paylaşılan primitif dosyasını yükle (inline kopya YOK) */
  if(!document.querySelector('script[data-sa-ui]')){
    var s=document.createElement('script');
    s.src='assets/js/sa-ui.js'; s.setAttribute('data-sa-ui','1');
    document.body.appendChild(s);
  }
})();
