/* =====================================================================
   sa-ui — DadaMutfak PAYLAŞILAN UI primitifleri (kabuk-bağımsız)
   Admin (sa-shell) + operatör panelleri (dyt-* / mekan-*) ORTAK kullanır.
   İçerik: saToast · saConfirm (+ delege SİL) · hesap dropdown.
   Kabuk/layout/render taşımaz — yalnız etkileşim primitifleri.
   ===================================================================== */

/* ---- saToast (köşe geri bildirim) + saConfirm (onay modalı) ---- */
(function(){
  if(window.saToast) return;   // çift yükleme koruması
  window.saToast=function(msg,opts){
    opts=opts||{};
    var wrap=document.querySelector('.sa-toast-wrap');
    if(!wrap){ wrap=document.createElement('div'); wrap.className='sa-toast-wrap'; document.body.appendChild(wrap); }
    var t=document.createElement('div'); t.className='sa-toast '+(opts.type||'ok'); t.setAttribute('role','status');
    var ic=document.createElement('i'); ic.className='fa-solid '+(opts.icon||(opts.type==='danger'?'fa-trash':opts.type==='info'?'fa-circle-info':'fa-circle-check'));
    var sp=document.createElement('span'); sp.textContent=msg;
    t.appendChild(ic); t.appendChild(sp); wrap.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); },260); }, opts.ms||2600);
  };
  window.saConfirm=function(opts){
    opts=opts||{};
    var danger=!!opts.danger;
    var ov=document.createElement('div'); ov.className='sa-modal-ov';
    var m=document.createElement('div'); m.className='sa-modal'+(danger?' danger':''); m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true');
    m.innerHTML='<div class="sa-modal-ico"><i class="fa-solid '+(opts.icon||(danger?'fa-trash':'fa-circle-question'))+'"></i></div>'
      +'<h3></h3><p></p>'
      +'<div class="sa-modal-acts">'
      +  '<button type="button" class="btn btn-ghost btn-sm sa-m-cancel"></button>'
      +  '<button type="button" class="btn btn-sm '+(danger?'btn-danger':'btn-acc')+' sa-m-ok"></button>'
      +'</div>';
    m.querySelector('h3').textContent=opts.title||'Emin misiniz?';
    m.querySelector('p').textContent=opts.message||'';
    m.querySelector('.sa-m-cancel').textContent=opts.cancel||'İptal';
    m.querySelector('.sa-m-ok').textContent=opts.ok||'Onayla';
    ov.appendChild(m); document.body.appendChild(ov);
    requestAnimationFrame(function(){ ov.classList.add('open'); });
    var okBtn=m.querySelector('.sa-m-ok'); okBtn.focus();
    function close(){ ov.classList.remove('open'); setTimeout(function(){ ov.remove(); },220); document.removeEventListener('keydown',onKey); }
    function onKey(e){ if(e.key==='Escape') close(); }
    document.addEventListener('keydown',onKey);
    ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
    m.querySelector('.sa-m-cancel').addEventListener('click',close);
    okBtn.addEventListener('click',function(){ close(); if(opts.onConfirm) opts.onConfirm(); });
  };

  /* delege YIKICI-AKSİYON onayı — tüm ekranlarda sil/iptal/reddet/kaldır/arşivle
     tetikleyicilerini yakalar (per-file edit YOK). data-no-confirm ile devre dışı.
     CAPTURE fazında çalışır + stopImmediatePropagation → inline onclick (ör.
     "İptal Et" → saToast) ÖNCE tetiklenmez; yalnız ONAY sonrası çalışır. */
  var DESTR={
    sil:    {ico:'fa-trash',        ok:'Sil',     q:'Silinsin mi?',      fut:'kalıcı olarak silinecek. Bu işlem geri alınamaz.', done:'silindi'},
    iptal:  {ico:'fa-xmark',        ok:'İptal Et',q:'İptal edilsin mi?', fut:'iptal edilecek.',     done:'iptal edildi'},
    reddet: {ico:'fa-xmark',        ok:'Reddet',  q:'Reddedilsin mi?',   fut:'reddedilecek.',       done:'reddedildi'},
    kaldir: {ico:'fa-circle-minus', ok:'Kaldır',  q:'Kaldırılsın mı?',   fut:'kaldırılacak.',       done:'kaldırıldı'},
    arsiv:  {ico:'fa-box-archive',  ok:'Arşivle', q:'Arşivlensin mi?',   fut:'arşivlenecek.',       done:'arşivlendi'}
  };
  function destrKind(el,txt){
    if(el.querySelector('.fa-trash, .fa-trash-can')) return 'sil';   // sil ikonu
    if(/(^|\s)İptal Et(\s|$)/.test(txt)) return 'iptal';             // "İptal Et" (≠ yalın "İptal")
    if(/(^|\s)Reddet(\s|$)/.test(txt))   return 'reddet';
    if(/(^|\s)Arşivle(\s|$)/.test(txt))  return 'arsiv';
    if(/(^|\s)(Kaldır|Çıkar)(\s|$)/.test(txt)) return 'kaldir';
    if(/(^|\s)Sil(\s|$)/.test(txt))      return 'sil';               // "...Sil" metinli buton
    return null;
  }
  document.addEventListener('click',function(e){
    var el=e.target.closest('button,a'); if(!el) return;
    if(el.closest('.sa-modal')) return;            // modalın kendi butonları
    if(el.hasAttribute('data-no-confirm')) return;
    var txt=(el.textContent||'').replace(/\s+/g,' ').trim();
    var kind=destrKind(el,txt); if(!kind) return;
    var V=DESTR[kind];
    e.preventDefault(); e.stopImmediatePropagation();   // inline onclick + nav ÖNCE çalışmasın
    var row=el.closest('tr,li,.pnl-card,.apt-row,.rz-row');
    var nameEl=row && row.querySelector('strong,b,.u-name,.prod-name,.isl-id strong,h4,.apt-name,td');
    var name=nameEl ? nameEl.textContent.trim().split('\n')[0].trim() : '';
    if(name.length>48 || name.length<2 || /^[\d.,₺%]+$/.test(name)) name='';  // sayaç/rozet ("3 ürün"→"3") elenir
    saConfirm({
      danger:true, icon:V.ico, ok:V.ok, cancel:'Vazgeç',
      title:V.q,
      message: name ? ('“'+name+'” '+V.fut) : ('Bu kayıt '+V.fut),
      onConfirm:function(){
        var oc=el.getAttribute('onclick');                 // orijinal aksiyonu ONAY sonrası çalıştır
        if(oc){ try{ (new Function(oc)).call(el); }catch(_){} }
        else { saToast(name ? (name+' '+V.done) : ('Kayıt '+V.done),{type:'danger'}); }
      }
    });
  }, true);   // CAPTURE
})();

/* ---- HESAP DROPDOWN — üst bar persona çipi (profil/ayarlar/çıkış) ----
   İçerik config: window.SA_ACCOUNT_ITEMS (kabuk/operatör kendi setini verir).
   Verilmezse operatör-uygun varsayılan kullanılır. Çağrı: otomatik (DOM hazırsa)
   veya manuel window.saAccountMenu(). */
(function(){
  var DEFAULT_ITEMS=[
    {ic:'fa-regular fa-user',  lbl:'Profil',         soon:true},
    {ic:'fa-solid fa-sliders', lbl:'Hesap Ayarları', soon:true},
    {div:true},
    {ic:'fa-solid fa-right-from-bracket', lbl:'Çıkış', href:'sa-giris-v1.html', danger:true}
  ];
  window.saAccountMenu=function(){
    var me=document.querySelector('.pnl-me'); if(!me || me.querySelector('.pnl-menu')) return;
    var nmEl=document.getElementById('pmName')||me.querySelector('.pm-name');
    var rlEl=document.getElementById('pmRole')||me.querySelector('.pm-role');
    var nm=(nmEl&&nmEl.textContent)||'Hesabım';
    var rl=(rlEl&&rlEl.textContent)||'';
    me.setAttribute('role','button'); me.setAttribute('tabindex','0');
    me.setAttribute('aria-haspopup','true'); me.setAttribute('aria-expanded','false');
    var items=window.SA_ACCOUNT_ITEMS||DEFAULT_ITEMS;
    var menu=document.createElement('div'); menu.className='pnl-menu';
    var html='<div class="pmenu-head"><b></b><span></span></div>';
    items.forEach(function(it){
      if(it.div){ html+='<div class="pmenu-div"></div>'; return; }
      var cls=it.danger?' class="danger"':'';
      /* hedefi olmayan kalem BOŞ DİYEZ taşımaz; JS zaten preventDefault edip
         "yakında" bildirimi gösteriyordu — href kaldırıldı, davranış aynı. */
      var soon=(!it.href && it.soon!==false)?' data-soon="1" style="cursor:pointer"':'';
      var href=it.href?(' href="'+it.href+'"'):'';
      html+='<a'+cls+href+soon+'><i class="fa-solid '+(it.ic||'fa-circle')+'"></i> '+it.lbl+'</a>';
    });
    menu.innerHTML=html;
    menu.querySelector('b').textContent=nm; menu.querySelector('span').textContent=rl;
    me.appendChild(menu);
    function setOpen(o){ menu.classList.toggle('open',o); me.setAttribute('aria-expanded', o?'true':'false'); }
    me.addEventListener('click',function(e){ if(e.target.closest('.pnl-menu')) return; e.stopPropagation(); setOpen(!menu.classList.contains('open')); });
    me.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); setOpen(!menu.classList.contains('open')); } else if(e.key==='Escape'){ setOpen(false); } });
    document.addEventListener('click',function(e){ if(!me.contains(e.target)) setOpen(false); });
    menu.querySelectorAll('a[data-soon]').forEach(function(a){
      a.addEventListener('click',function(e){ e.preventDefault(); setOpen(false); if(window.saToast) saToast(a.textContent.trim()+' — yakında',{type:'info'}); });
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',window.saAccountMenu);
  else window.saAccountMenu();
})();
