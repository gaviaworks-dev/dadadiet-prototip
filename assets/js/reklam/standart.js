/* kaynak: DadaDiet public/reklam/standart.js (DadaGastro@905288b7b2) · uyarlama (prototip, 9 Kasım): sunucu oturumundaki sıklık
   (StandartSiklik) ve gösterim sayımı yerine tarayıcı oturumu (sessionStorage; pop-up günde 1 için localStorage tarih damgası).
   Hiçbir istek gönderilmez. Alt menü olarak prototipin .alt-cubuk'u da sayılır; alt bant açılıp kapanınca yüzen düğmeler yeniden ölçülür.
   Tek alan önizlemesinde (?reklam=STD-POPUP) pop-up sıklık kuralını beklemeden 1 sn sonra açılır. Gerisi birebir. */
// Y5: pop-up, side and altbar frequency lives in the server session (StandartSiklik); nothing is written to browser storage.
/** Counters written by earlier versions are removed once; nothing replaces them. */
export function clearLegacyCounters(win){
 for(const store of [win.sessionStorage,win.localStorage]){try{Object.keys(store).filter(key=>key.startsWith('rk_std_')||key.startsWith('rk.std.')).forEach(key=>store.removeItem(key))}catch{}}
 for(const part of(win.document?.cookie||'').split('; ')){const key=part.split('=')[0];if(key.startsWith('rk_std_'))win.document.cookie=key+'=; Max-Age=0; Path=/; SameSite=Lax'}
}
/** A shown or user-closed standard format is reported to the server session; the page keeps no counter of its own. */
export function reportStandard(win,layer,node,event){
 const type=node?.dataset.rkBicim;if(!type)return;
 try{
  if(event==='goster'&&type==='popup'){win.sessionStorage.setItem('dd-rk-popup-oturum','1');win.localStorage.setItem('dd-rk-popup-gun',new Date().toISOString().slice(0,10))}
  if(event==='kapat'&&type!=='popup')win.sessionStorage.setItem('dd-rk-kapali-'+type,'1');
 }catch{}
}
export function popupState(win, layer, node) {
 const page=+layer.dataset.rkSayfa||0,range=+(node?.dataset.rkPopupAralik)||4,force=layer.hasAttribute('data-rk-popup-force');
 const seen=()=>{try{return win.sessionStorage.getItem('dd-rk-popup-oturum')==='1'||win.localStorage.getItem('dd-rk-popup-gun')===new Date().toISOString().slice(0,10)}catch{return false}};
 // Canlı kural: en az 2. sayfa, 4 sayfada bir, oturumda 1, günde 1.
 return{allowed:()=>!!node&&(force||(page>=2&&(page-2)%range===0&&!seen())),record:()=>reportStandard(win,layer,node,'goster'),page:force?Math.max(2,page):page,count:+layer.dataset.rkPopupSayac||0};
}
/** Pick from actual free rectangles, never change the content column. */
export function sideLayout({viewport,left,right,top,height=600,obstacles=[]}) {
 if(viewport<1280)return null;
 const width=120,inset=8,count=viewport>1366?2:1;
 const rightBox={left:viewport-inset-width,right:viewport-inset,top,bottom:top+height};
 const boxes=count===2?[{left:inset,right:inset+width,top,bottom:top+height},rightBox]:[rightBox];
 const gap=Math.min(viewport-inset-width-right,count===2?left-inset-width:Infinity);
 // Requested edge inset and fixed content width are preserved. Report actual
 // clearance, including constrained widths, instead of inventing an 8px gap.
 return {width,count,gap,inset,top,boxes,variant:count===2?`iki taraf ${width}×${height}`:`sağ 120×${height}`};
}
export function visibleFooterTop({top=Infinity,fixed=false,contentBottom=Infinity}) {
 return fixed?Math.max(top,contentBottom):top;
}
export function sideContentVisible({heroBottom=null,headerBottom=0,footerTop=Infinity,viewportHeight,scrollY}) {
 // A marked hero must never show side cards at the top, even during layout settling.
 if(heroBottom!==null && scrollY===0)return false;
 if(footerTop<viewportHeight)return false;
 return heroBottom===null || heroBottom<=headerBottom;
}
/** One visibility observer and the same hero/footer gate for every page. */
export function observeSideVisibility(doc,win,update) {
 if(!win.IntersectionObserver)return;
 const observer=new win.IntersectionObserver(update,{rootMargin:'0px',threshold:0});
 const hero=doc.querySelector('main [data-rk-hero]');
 const footer=doc.querySelector('footer.footer,body > footer');
 if(hero)observer.observe(hero);
 if(footer)observer.observe(footer);
 return observer;
}
export function sidePairGeometry(doc,win) {
 const pair=doc.querySelector('[data-rk-side-pair]');if(!pair)return false;
 const reject=reason=>{pair.dataset.rkSideReason=reason;pair.dataset.rkSideVariant='yok';return false};
 const style=n=>win.getComputedStyle(n);
 let header=0;doc.querySelectorAll('header,.header,.topbar').forEach(n=>{const r=n.getBoundingClientRect();if(r.height&&r.top<160)header=Math.max(header,r.bottom)});
 let left=win.innerWidth,right=0;
 doc.querySelectorAll('main .wrap,main .kap,main>.container,main>.panel-sayfa').forEach(n=>{const r=n.getBoundingClientRect(),s=style(n);if(r.width>600){left=Math.min(left,r.left+parseFloat(s.paddingLeft||0));right=Math.max(right,r.right-parseFloat(s.paddingRight||0))}});
 if(right===0)return reject('içerik kolonu ölçülemedi');
 const footer=doc.querySelector('footer.footer,body > footer'),fr=footer?.getBoundingClientRect();
 const footerTop=visibleFooterTop({top:fr?.top??Infinity,fixed:footer&&['fixed','sticky'].includes(style(footer).position),contentBottom:doc.querySelector('main')?.getBoundingClientRect().bottom??Infinity});
 const hero=doc.querySelector('main [data-rk-hero]');
 const gate=sideContentVisible({scrollY:win.scrollY,heroBottom:sideHeroBottom(hero),headerBottom:header,footerTop,viewportHeight:win.innerHeight});
 if(!gate)return reject(footerTop<win.innerHeight?'footer görünür':'hero header çizgisini geçmedi');
 const previousBottom=header+(win.innerHeight-header-600)/2+600;
 const top=header+24,height=Math.round(previousBottom-top);
 if(height<360)return reject('side için dikey alan yok');

 // Feedback may overlap by explicit preview acceptance; the content stays fixed.
 const obstacles=[];
 const layout=sideLayout({viewport:win.innerWidth,left,right,top,height,obstacles});
 if(!layout)return reject('120 px side için içerik dışında yeterli yan alan yok');
 if(pair.querySelectorAll('.rk-std-side').length===1){layout.count=1;layout.variant=`sağ 120×${height}`;}
 // Prototip uyarlaması: yan kart içerik kolonuna ve sağ kenardaki "Görüş Bildir" sekmesine binmez (canlı satış metni: ≥1600 px ekran).
 const sekme=doc.querySelector('.feedback-tab'),sekmeEn=sekme&&style(sekme).display!=='none'?sekme.getBoundingClientRect().width:0;
 if(win.innerWidth-right<layout.width+layout.inset*2+sekmeEn)return reject('yan kart içerik kolonuna biner');
 if(layout.count===2&&left<layout.width+layout.inset*2){layout.count=1;layout.variant=`sağ 120×${height}`;pair.dataset.rkSideTek='1'}else delete pair.dataset.rkSideTek;
 pair.style.setProperty('--rk-kenar-sekme',sekmeEn+'px');
 pair.style.setProperty('--rk-side-inset',layout.inset+'px');pair.style.setProperty('--rk-side-top',top+'px');pair.style.setProperty('--rk-side-width',layout.width+'px');pair.style.setProperty('--rk-side-height',height+'px');
 pair.dataset.rkSideCount=String(layout.count);pair.dataset.rkSideVariant=layout.variant;pair.dataset.rkSideReason=layout.variant;
 pair.dataset.rkSideGap=String(layout.gap);
 pair.dataset.rkSideHeight=String(height);
 return true;
}

/** The next content panel can overlap the dark hero by its rounded top edge. */
export function sideHeroBottom(hero) {
 if(!hero)return null;
 const bottom=hero.getBoundingClientRect().bottom;
 const next=hero.nextElementSibling;
 return next&&next.tagName==='SECTION'?Math.min(bottom,next.getBoundingClientRect().top):bottom;
}
const standardMotion=new WeakMap();
export function setStandardVisible(node,show,win,immediate=false){
 const old=standardMotion.get(node);
 if(old?.show===show&&!immediate)return;
 old?.animation?.cancel();
 const state={show,animation:null};standardMotion.set(node,state);
 if(immediate||win.matchMedia('(prefers-reduced-motion: reduce)').matches||!node.animate){node.hidden=!show;haberVer(node,win);return;}
 if(!show&&node.hidden)return;
 node.hidden=false;
 const frames=show?[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}]:[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}];
 state.animation=node.animate(frames,{duration:show?200:120,easing:'ease-out',fill:'both'});
 haberVer(node,win);state.animation.finished.then(()=>{if(standardMotion.get(node)!==state)return;node.hidden=!show;haberVer(node,win);state.animation.cancel();state.animation=null;},()=>{});
}
// Prototip: alt bant açılıp kapanınca yüzen düğmeler (kenar-dugmeler.js, mentor.js) yeniden ölçülür.
function haberVer(node,win){if(node.dataset.rkBicim!=='altbar')return;win.document.body.classList.toggle('rk-altbar-acik',!node.hidden);win.requestAnimationFrame(()=>win.dispatchEvent(new Event('scroll')));}
function hideStandard(node,win){setStandardVisible(node,false,win,node.dataset.rkBicim==='popup');}
function alignAltbar(doc,win){
 const wrap=doc.querySelector('header .h-top .wrap')||[...doc.querySelectorAll('main .wrap')].filter(n=>n.getBoundingClientRect().width>250).sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];if(!wrap)return;
 const r=wrap.getBoundingClientRect(),s=getComputedStyle(wrap),left=r.left+parseFloat(s.paddingLeft),width=r.width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight);
 const nav=doc.querySelector('.bottom-nav,.alt-cubuk');
 const navRects=nav&&win.getComputedStyle(nav).display!=='none'?[nav,...nav.querySelectorAll('*')].map(n=>n.getBoundingClientRect()).filter(r=>r.width&&r.height):[];
 let clearance=navRects.length?Math.max(12,win.innerHeight-Math.min(...navRects.map(r=>r.top))+12):12;
 // Admin preview remains visible above consent and recipe controls, without covering them.
 if(doc.querySelector('[data-rk-cookie-exempt="1"]'))for(const n of doc.querySelectorAll('#cookieBanner,.cookie-banner,.rd-actbar')){
  const r=n.getBoundingClientRect(),s=win.getComputedStyle(n);
  if(!n.hidden&&s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0&&r.width&&r.height&&r.top<win.innerHeight&&r.bottom>0)clearance=Math.max(clearance,win.innerHeight-r.top+12);
 }
 doc.querySelectorAll('.rk-std-altbar').forEach(n=>{n.style.setProperty('--rk-alt-left',left+'px');n.style.setProperty('--rk-alt-width',width+'px');n.style.bottom=clearance+'px'});
}

export function popupVariantIndex(types, order='video,gorsel', count=0) {
 const priority=order.split(',');
 const indices=types.map((type,index)=>({type,index})).sort((a,b)=>priority.indexOf(a.type)-priority.indexOf(b.type));
 return indices.length?indices[Math.max(0,count)%indices.length].index:-1;
}
export function cookieBannerVisible(doc=document,win=window){
 return [...doc.querySelectorAll('#cookieBanner,.cookie-banner')].some(n=>{
  const r=n.getBoundingClientRect(),style=win.getComputedStyle(n);
  return !n.hidden&&style.display!=='none'&&style.visibility!=='hidden'&&+style.opacity>0&&r.width>0&&r.height>0&&r.bottom>0&&r.top<win.innerHeight;
 });
}
// The exemption is rendered only after the server has verified the administrator.
// Consent still governs counting; this changes visibility only.
export function cookieBlocksStandard(layer, doc=document, win=window) {
 return layer?.dataset.rkCookieExempt !== '1' && cookieBannerVisible(doc,win);
}
export function reviewBlockReason(type, state) {
 if(state.cookie) return 'çerez bandı';
 if(state.cookieDelay) return 'çerez sonrası 300 ms';
 if(state.cooking) return 'pişirme modu';
 if(state.background) return 'arka plandaki sekme';
 if(!state.enabled) return 'anahtar kapalı';
 if(state.dismissed) return 'bu sayfada kapatıldı';
 if(type !== 'popup' && state.popup) return 'pop-up açık';
 if(type === 'altbar' && state.actionbar) return 'tarif eylem çubuğu';
 if(type === 'side' && !state.geometry) return state.sideReason || 'yan alan ölçülemedi';
 if(type === 'popup' && !state.ready) return 'açılış gecikmesi';
 if(type === 'popup' && !state.allowed) return 'kampanya sıklığı';
 return 'görünür';
}
export function initReview(layer, doc=document, win=window) {
 const settings=JSON.parse(layer.dataset.rkInceleme), nodes=[...layer.querySelectorAll('[data-rk-bicim]')];
 const key='rk.review.formats'; const enabled=new Set(settings.formats); let flags=Object.fromEntries(['side','popup','altbar','video'].map(type=>[type,enabled.has(type)]));
 try{Object.assign(flags,JSON.parse(win.sessionStorage.getItem(key)||'{}'))}catch{}
 for(const type of Object.keys(flags))flags[type]=flags[type]&&enabled.has(type);
 const dismissed=new Set();let ready=false,focusBefore=null,inertBefore=[],overflowBefore='',cookieBlocked=false,cookieTimer=null;
 const popup=nodes.find(n=>n.dataset.rkBicim==='popup'), frequency=popupState(win,layer,popup);let popupCounted=false;
 const forcePopup=layer.hasAttribute('data-rk-popup-force');if(forcePopup)flags.popup=true;
 function restore(){inertBefore.forEach(([n,v])=>n.inert=v);inertBefore=[];doc.body.style.overflow=overflowBefore;focusBefore?.focus({preventScroll:true})}
 function close(type){
  if(type==='popup')popup?.querySelectorAll('video').forEach(v=>v.pause());
  dismissed.add(type);nodes.filter(n=>n.dataset.rkBicim===type).forEach(n=>hideStandard(n,win));
  if(type==='popup'){restore();update()}
 }
 function update(){
   alignAltbar(doc,win);
   const cookie=cookieBlocksStandard(layer,doc,win);
   if(cookie){cookieBlocked=true;win.clearTimeout(cookieTimer);cookieTimer=null}
   else if(cookieBlocked&&!cookieTimer)cookieTimer=win.setTimeout(()=>{cookieBlocked=false;cookieTimer=null;update()},300);
   const cook=doc.querySelector('#cookmode:not([hidden])');
   const cooking=!!cook&&cook.getBoundingClientRect().height>0&&getComputedStyle(cook).display!=='none';
   const blocked=cookie||cookieBlocked||cooking||doc.visibilityState!=='visible';
   // Decide the modal first, so DOM order cannot reveal another standard format beneath it.
   const modalOpen=!!popup&&flags.popup&&!dismissed.has('popup')&&!blocked&&ready&&(forcePopup||popupCounted||frequency.allowed());
   nodes.forEach(n=>{
     const type=n.dataset.rkBicim;
     const geometry=type==='side'?sidePairGeometry(doc,win):true;
     const reason=reviewBlockReason(type,{cookie,cookieDelay:cookieBlocked,cooking,background:doc.visibilityState!=='visible',enabled:flags[type],dismissed:dismissed.has(type),popup:modalOpen,actionbar:!!doc.querySelector('.rd-actbar'),geometry,sideReason:doc.querySelector('[data-rk-side-pair]')?.dataset.rkSideReason,ready,allowed:forcePopup||popupCounted||frequency.allowed()});
     n.dataset.rkVisibilityReason=reason;
     const show=reason==='görünür';
     if(type==='popup'&&show&&n.hidden){
       focusBefore=doc.activeElement;overflowBefore=doc.body.style.overflow;doc.body.style.overflow='hidden';
       let branch=layer;while(branch&&branch!==doc.body){for(const sibling of branch.parentElement.children)if(sibling!==branch&&!sibling.contains(doc.getElementById('rk-preview-status'))&&!['SCRIPT','LINK','STYLE'].includes(sibling.tagName)){inertBefore.push([sibling,sibling.inert]);sibling.inert=true}branch=branch.parentElement}
       n.hidden=false;n.querySelector('[role=dialog]')?.focus();if(!popupCounted){frequency.record();popupCounted=true;}
     }else if(type==='popup'&&!show&&!n.hidden){n.querySelectorAll('video').forEach(v=>v.pause());n.hidden=true;restore()}
     else if(type!=='popup')setStandardVisible(n,show,win,modalOpen||blocked);
     // Exclusion takes effect immediately, even during a bar dismissal animation.
     if(type!=='popup'&&(modalOpen||blocked))setStandardVisible(n,false,win,true);
   });
   doc.querySelectorAll('[data-rk-video]').forEach(v=>{if(v.closest('.rk-std-popup'))return;const slot=v.closest('[data-rk-review-video]')||v.closest('[data-rk-bicim="video"]')||v;slot.hidden=!flags.video;if(!flags.video)v.querySelector('video')?.pause()});
   doc.querySelectorAll('[data-rk-review-static]').forEach(n=>n.hidden=flags.video);
   layer.dataset.rkPopupReason=!popup?'kampanya boş':!flags.popup?'anahtar kapalı':cookie||cookieBlocked?'çerez bandı':cooking?'pişirme modu':!ready?'2 sn bekleniyor':dismissed.has('popup')?'bu sayfada kapatıldı':modalOpen?'görünür':`sayfa ${frequency.page}; sıklık dolu (sunucu)`;
   win.dispatchEvent(new CustomEvent('rk:review-state',{detail:flags}));
 }
 nodes.forEach(n=>{n.querySelector('.rk-std-kapat')?.addEventListener('click',()=>close(n.dataset.rkBicim));if(n===popup)n.addEventListener('click',e=>{if(e.target===n)close('popup')})});
 doc.addEventListener('keydown',e=>{if(!popup||popup.hidden)return;if(e.key==='Escape'){e.preventDefault();close('popup')}if(e.key==='Tab'){const a=[...popup.querySelectorAll('button,a[href]')],first=a[0],last=a.at(-1);if(e.shiftKey&&(doc.activeElement===first||doc.activeElement===popup.querySelector('[role=dialog]'))){e.preventDefault();last.focus()}else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus()}}});
 win.addEventListener('rk:review-toggle',e=>{flags[e.detail.type]=e.detail.enabled&&enabled.has(e.detail.type);dismissed.delete(e.detail.type);try{win.sessionStorage.setItem(key,JSON.stringify(flags))}catch{}update()});
 for(const n of doc.querySelectorAll('#cookmode,#cookieBanner,.cookie-banner'))new MutationObserver(update).observe(n,{attributes:true,attributeFilter:['class','hidden','style','aria-hidden']});
 doc.addEventListener('transitionend',update);doc.addEventListener('visibilitychange',update);
 win.addEventListener('resize',update);win.addEventListener('scroll',update,{passive:true});win.setTimeout(()=>{ready=true;update()},settings.popup_delay_ms);observeSideVisibility(doc,win,update);update();
 return {close,update};
}

/** Standard formats are optional. No globals or existing page controls are overwritten. */
export function chooseFormat(candidates, {width,sideRoom,pages,cookie,cooking,video,actionbar}) {
  if(cookie || cooking) return null;
  return candidates.find(type => type==='side' ? sideRoom : type==='popup' ? pages>=2 && !video : type==='altbar' ? !actionbar : false) || null;
}
export function initStandards(doc=document, win=window) {
 const layer=doc.querySelector('[data-rk-standart]');
 const review=layer?.hasAttribute('data-rk-inceleme');
 if(layer){
   const variants=[...layer.querySelectorAll('[data-rk-bicim=popup]')];
   const count=+layer.dataset.rkPopupSayac||0;
   const selected=popupVariantIndex(variants.map(n=>n.dataset.rkPopupVaryant),variants[0]?.dataset.rkPopupSira,count);
   variants.forEach((n,i)=>{if(i!==selected)n.remove()});
 }
 if(review)initReview(layer,doc,win);
 const videos=[...doc.querySelectorAll('[data-rk-video]')];
 clearLegacyCounters(win);
 const previewUrl=new URL(win.location.href);
 // The server clears its frequency trace on reset; the page only drops the query.
 if(layer?.hasAttribute('data-rk-yerel-onizleme')&&previewUrl.searchParams.get('reklam-sifirla')==='1'){
   win.__rkPreviewReset=true;previewUrl.searchParams.delete('reklam-sifirla');win.history.replaceState(null,'',previewUrl);
 }
 const visible=n=>!!n&&!n.hidden&&n.getBoundingClientRect().width>0&&n.getBoundingClientRect().height>0&&getComputedStyle(n).visibility!=='hidden'&&+getComputedStyle(n).opacity>0;
 const cooking=()=>visible(doc.querySelector('#cookmode:not([hidden])'));
 const navigationClearance=()=>{
   const nav=doc.querySelector('.bottom-nav,.alt-cubuk');
   if(!nav||getComputedStyle(nav).display==='none')return 0;
   const top=Math.min(...[nav,...nav.querySelectorAll('*')].filter(visible).map(n=>n.getBoundingClientRect().top));
   return Math.max(0,win.innerHeight-top+12);
 };
 const cookie=()=>cookieBannerVisible(doc,win);
 const impression=(node)=>{
   let timer;
   // Prototip: gösterim sayılmaz (canlıda '/reklam/g' ucuna POST); işlev yerini korur.
   void timer;void node;
 };
 let active=null,selected=null,closed=false,previousFocus=null,priorInert=[],priorOverflow='',shown=false,ready=false,settled=false;
 const nodes=layer?[...layer.querySelectorAll('[data-rk-bicim]')]:[];
 nodes.forEach(impression); // Every visible side has its own signed impression token.
 let pages=0;
 const popupFrequency=layer?popupState(win,layer,nodes.find(n=>n.dataset.rkBicim==='popup')):null;
 if(layer)pages=popupFrequency.page;
 // Only what the server frequency allows is in the page (StandartSiklik); the page reports what it showed.
 function permitted(n){return n.dataset.rkBicim!=='popup'||popupFrequency.allowed()}
 function record(n){reportStandard(win,layer,n,'goster')}
 function sideGeometry(){return sidePairGeometry(doc,win)}
 function restoreFocus(){
   priorInert.forEach(([n,value])=>n.inert=value);priorInert=[];
   doc.body.style.overflow=priorOverflow;
   if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
 }
 function close(persist=true,byUser=false){
   if(!active)return;
   const n=active; n.querySelectorAll('video').forEach(v=>v.pause());hideStandard(n,win);if(n.dataset.rkBicim==='side')nodes.filter(x=>x.dataset.rkBicim==='side').forEach(x=>setStandardVisible(x,false,win));active=null;
   if(n.dataset.rkBicim==='popup')restoreFocus();
   if(persist)closed=true;
   if(byUser)reportStandard(win,layer,n,'kapat');
 }
 function show(n){
   if(n.dataset.rkBicim==='altbar')n.style.bottom=Math.max(12,navigationClearance())+'px';
   setStandardVisible(n,true,win,n.dataset.rkBicim==='popup');if(n.dataset.rkBicim==='side')nodes.filter(x=>x.dataset.rkBicim==='side').forEach(x=>setStandardVisible(x,true,win));active=n;
   if(!shown){(n.dataset.rkBicim==='side'?nodes.filter(x=>x.dataset.rkBicim==='side'&&visible(x)):[n]).forEach(record);shown=true;}
   if(n.dataset.rkBicim==='popup'){
     previousFocus=doc.activeElement;priorOverflow=doc.body.style.overflow;doc.body.style.overflow='hidden';
     // Inert every sibling branch, but never inert the ancestor containing the dialog.
     let branch=n;while(branch&&branch!==doc.body){for(const sibling of branch.parentElement.children){if(sibling!==branch&&!['SCRIPT','LINK','STYLE'].includes(sibling.tagName)){priorInert.push([sibling,sibling.inert]);sibling.inert=true}}branch=branch.parentElement}
     n.querySelector('[role=dialog]').focus();
   }
 }
 // Decision 149.2: two or more stickies from the server (edge pair, bottom bar) are shown at once, each by its own rule:
 // the edge pair by geometry and the hero, the bottom bar by the recipe action bar. The pop-up stays single and hides them
 // while open. The count is the server's; one sticky keeps the single-format path. The bottom bar keeps alignAltbar's place.
 const stickies=nodes.filter(n=>n.dataset.rkBicim==='side'||n.dataset.rkBicim==='altbar');
 const independent=!review&&stickies.length>1,dismissed=new Set(),reported=new Set();
 try{for(const t of ['side','altbar'])if(win.sessionStorage.getItem('dd-rk-kapali-'+t)==='1'){dismissed.add(t);if(!independent&&stickies.length===1&&stickies[0].dataset.rkBicim===t)closed=true}}catch{}
 function dismiss(type,byUser=false,source=null){
   dismissed.add(type);
   if(type==='popup'){if(!active)return;const n=active;n.querySelectorAll('video').forEach(v=>v.pause());hideStandard(n,win);active=null;restoreFocus();if(byUser)reportStandard(win,layer,n,'kapat')}
   else{stickies.filter(n=>n.dataset.rkBicim===type).forEach(n=>setStandardVisible(n,false,win));if(byUser&&source)reportStandard(win,layer,source,'kapat')}
   update();
 }
 function updateStickies(blocked){
   const popup=nodes.find(n=>n.dataset.rkBicim==='popup');
   // The modal is decided first, so no sticky shows beneath it; a blocked pop-up does not come back on this page.
   if(active&&blocked){dismiss('popup');return}
   if(!active&&!blocked&&ready&&popup&&!dismissed.has('popup')&&permitted(popup)&&chooseFormat(['popup'],{pages,video:videos.some(v=>!v.closest('.rk-std-popup'))})){stickies.forEach(n=>setStandardVisible(n,false,win,true));selected='popup';show(popup);return}
   if(active)return;
   const open={side:()=>sideGeometry(),altbar:()=>chooseFormat(['altbar'],{actionbar:!!doc.querySelector('.rd-actbar')})==='altbar'};
   for(const type of ['side','altbar']){
     const group=stickies.filter(n=>n.dataset.rkBicim===type);if(!group.length)continue;
     const on=!blocked&&!dismissed.has(type)&&open[type]();
     group.forEach(n=>setStandardVisible(n,on,win,blocked));
     // Reported once per format, with the single-format path's own expression.
     if(on&&!reported.has(type)){reported.add(type);(type==='side'?group.filter(visible):group).forEach(record)}
   }
 }
 function update(){
   alignAltbar(doc,win);
   if(review||!layer||closed||!settled)return;
   if(active?.dataset.rkBicim==='altbar')active.style.bottom=Math.max(12,navigationClearance())+'px';
   const blocked=cookieBlocksStandard(layer,doc,win)||cooking()||doc.visibilityState!=='visible';
   // Stickies are limited only by the panel's sticky count (decision 152.2): a page ad slot in view no longer hides them.
   if(independent)return updateStickies(blocked);
   if(active&&(blocked||(selected==='side'&&!sideGeometry()))){close(selected==='popup');return}
   if(blocked||active)return;
   if(selected){if(selected!=='popup'&&(selected!=='side'||sideGeometry()))show(nodes.find(n=>n.dataset.rkBicim===selected));return}
   const candidates=nodes.filter(permitted).map(n=>n.dataset.rkBicim);
   // A page video excludes the pop-up; the pop-up's own video variant does not (same rule as the review layer).
   const type=chooseFormat(candidates,{width:win.innerWidth,sideRoom:sideGeometry(),pages,cookie:false,cooking:false,video:videos.some(v=>!v.closest('.rk-std-popup')),actionbar:!!doc.querySelector('.rd-actbar')});
   if(!type||type==='popup'&&!ready)return;
   selected=type;show(nodes.find(n=>n.dataset.rkBicim===type));
 }
 if(!review) nodes.forEach(n=>{n.querySelector('.rk-std-kapat')?.addEventListener('click',()=>independent?dismiss(n.dataset.rkBicim,true,n):close(true,true));if(n.dataset.rkBicim==='popup')n.addEventListener('click',e=>{if(e.target===n)independent?dismiss('popup',true):close(true,true)})});
 doc.addEventListener('keydown',e=>{
   if(!active||selected!=='popup')return;
   if(e.key==='Escape'){e.preventDefault();independent?dismiss('popup',true):close(true,true)}
   if(e.key==='Tab'){const focusable=[...active.querySelectorAll('a[href],button,[tabindex="0"]')].filter(visible);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&doc.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();first.focus()}}
 });
 if(layer&&!review){
   observeSideVisibility(doc,win,update);
   Promise.resolve(doc.fonts?.ready).then(()=>setTimeout(()=>{settled=true;update()},1500));
   setTimeout(()=>{ready=true;update()},layer.hasAttribute('data-rk-popup-force')?1000:Math.max(8,Math.min(10,+layer.dataset.rkGecikme||9))*1000);
   win.addEventListener('scroll',()=>{if(win.scrollY/Math.max(1,doc.documentElement.scrollHeight-win.innerHeight)>=.5)ready=true;update()},{passive:true});
   doc.addEventListener('transitionend',e=>{if(e.target.matches('#cookieBanner,.cookie-banner'))update()});
   win.addEventListener('resize',update);doc.addEventListener('visibilitychange',update);
   for(const n of doc.querySelectorAll('#cookieBanner,#cookmode'))new MutationObserver(()=>{update();setTimeout(update,600)}).observe(n,{attributes:true,attributeFilter:['class','hidden','style','aria-hidden']});
   update();
 }
 // A modal owns playback while open; background observers cannot pause its video.
 let playing=null;
 videos.forEach((wrapper,index)=>{
   if(index>0&&!wrapper.closest('.rk-std-popup')&&!doc.querySelector('[data-rk-vitrin]'))return;
   const video=wrapper.querySelector('video'),play=wrapper.querySelector('.rk-std-oynat'),sound=wrapper.querySelector('.rk-std-ses'),fallback=wrapper.querySelector('.rk-video-baslat');
   const reduced=win.matchMedia('(prefers-reduced-motion: reduce)'),modal=wrapper.closest('.rk-std-popup');
   let inView=false,userPaused=false,explicitPlay=false,pending=false;
   video.muted=true;video.defaultMuted=true;video.playsInline=true;video.loop=true;
   const eligible=()=>!wrapper.closest('[hidden]')&&!wrapper.closest('[inert]')&&doc.visibilityState==='visible'&&!cooking()&&(!doc.querySelector('.rk-std-popup:not([hidden])')||!!modal);
   const start=async(manual=false)=>{
     if(!eligible()||pending||!video.paused)return;
     if(!manual&&(userPaused||(reduced.matches&&!explicitPlay)))return;
     if(manual){userPaused=false;explicitPlay=true;}
     if(playing&&playing!==video)playing.pause();
     if(!video.getAttribute('src'))video.src=video.dataset.rkSrc;
     playing=video;pending=true;
     try{await video.play();wrapper.dataset.rkVideoBlocked='0';if(fallback)fallback.hidden=true;}
     catch(error){if(error.name!=='AbortError'){wrapper.dataset.rkVideoBlocked='1';if(fallback)fallback.hidden=false;}}
     finally{pending=false;}
   };
   const sync=()=>{if(!eligible()||(!modal&&!inView)){video.pause();return;}start();};
   play.addEventListener('click',()=>{if(video.paused)start(true);else{userPaused=true;video.pause()}});
   fallback?.addEventListener('click',()=>start(true));
   video.addEventListener('play',()=>{play.innerHTML='<i class="fa-solid fa-pause" aria-hidden="true"></i>';play.setAttribute('aria-label','Videoyu duraklat');if(fallback)fallback.hidden=true;});
   video.addEventListener('pause',()=>{play.innerHTML='<i class="fa-solid fa-play" aria-hidden="true"></i>';play.setAttribute('aria-label','Videoyu oynat');});
   sound.addEventListener('click',()=>{video.muted=!video.muted;sound.innerHTML='<i class="fa-solid '+(video.muted?'fa-volume-xmark':'fa-volume-high')+'" aria-hidden="true"></i>';sound.setAttribute('aria-label',video.muted?'Sesi aç':'Sesi kapat');sound.setAttribute('aria-pressed',String(!video.muted))});
   new IntersectionObserver(entries=>{for(const e of entries){inView=e.isIntersecting&&e.intersectionRatio>=.5;sync()}},{threshold:[0,.5]}).observe(wrapper);
   const watched=new Set([modal,wrapper.closest('[data-rk-review-video]'),doc.querySelector('#cookmode'),doc.querySelector('[data-rk-standart]')].filter(Boolean));
   watched.forEach(node=>new MutationObserver(sync).observe(node,{subtree:node.hasAttribute('data-rk-standart'),attributes:true,attributeFilter:['hidden','inert']}));
   reduced.addEventListener('change',()=>{if(reduced.matches){explicitPlay=false;video.pause()}else sync()});
   doc.addEventListener('visibilitychange',sync);
   const slot=wrapper.closest('[data-rk-standard-token]');if(slot)impression(slot);
 });

 return {close,update};
}
if(typeof document!=='undefined')initStandards();
