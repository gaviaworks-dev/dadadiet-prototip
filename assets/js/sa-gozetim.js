/* ============================================================
   sa-gozetim.js — Faz 3 impersonation banner (operatör panelleri)
   Mockup: gerçek auth YOK, salt görsel gözetim akışı.
   - Gözetim ekranındaki "Panelini Aç" linki ?gozetim=1&from=<sayfa>
     taşır. İlk yüklemede sessionStorage'a yazılır + URL temizlenir.
   - sessionStorage sayesinde panel İÇİNDE gezerken (Danışanlar→Reçeteler)
     banner kalıcı kalır; param her linke taşınmak zorunda değil.
   - "Gözetime Dön" → storage temizler + geldiği gözetim ekranına döner.
   Kanonik kabuğa dokunmaz; banner'ı body'ye JS ile enjekte eder.
   ============================================================ */
(function(){
  var KEY = 'dada_gozetim';

  // Aktif panelin rolü + varsayılan dönüş hedefi (dosya adı önekinden).
  function panelMeta(){
    var f = (location.pathname.split('/').pop() || '');
    if (f.indexOf('antrenor') === 0) return { role:'Antrenör', back:'sa-dadafit-antrenorler.html' };
    if (f.indexOf('dyt')      === 0) return { role:'Diyetisyen', back:'sa-saglik-diyetisyenler.html' };
    if (f.indexOf('mekan')    === 0) return { role:'İşletme', back:'sa-isletme-isletmeler.html' };
    return { role:'Operatör', back:'sa-admin-genel.html' };
  }

  function read(){
    try { var r = sessionStorage.getItem(KEY); return r ? JSON.parse(r) : null; }
    catch(e){ return null; }
  }
  function write(s){ try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch(e){} }
  function clear(){ try { sessionStorage.removeItem(KEY); } catch(e){} }

  var meta = panelMeta();
  var params = new URLSearchParams(location.search);
  var state;

  if (params.get('gozetim') === '1'){
    state = { role: meta.role, from: params.get('from') || meta.back };
    write(state);
    // ?gozetim=1&from=... URL'den temizle (refresh tekrar tetiklemesin; banner storage'dan gelir)
    try { history.replaceState(null, '', location.pathname); } catch(e){}
  } else {
    state = read();
  }

  if (!state) return;

  var bar = document.createElement('div');
  bar.className = 'sa-gz-bar';
  bar.setAttribute('role', 'status');
  bar.innerHTML =
    '<span class="sa-gz-pill"><i class="fa-solid fa-user-shield"></i> Gözetim</span>' +
    '<span class="sa-gz-txt"><strong>' + state.role + ' paneli</strong> · süper-admin gözetim modunda görüntülüyorsunuz</span>' +
    '<a class="sa-gz-back" href="' + state.from + '"><i class="fa-solid fa-arrow-left-long"></i> Gözetime Dön</a>';

  document.body.insertBefore(bar, document.body.firstChild);
  document.body.classList.add('has-gozetim');

  bar.querySelector('.sa-gz-back').addEventListener('click', function(){ clear(); });
})();
