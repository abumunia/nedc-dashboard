(function(){if(window.omDeclutter)return;window.omShortGov=function(n){return String(n||'').replace(/^(Al|Ad|Ash|As)\s+/i,'').replace(/\s+North$/i,' N').replace(/\s+South$/i,' S');};function ov(a,b,p){p=p||2;return !(a.right+p<b.left||a.left-p>b.right||a.bottom+p<b.top||a.top-p>b.bottom);}window.omDeclutter=function(map){try{var host=map.getContainer();if(!host)return;var H=host.getBoundingClientRect();if(H.width<40)return;var els=[].slice.call(host.querySelectorAll('.om-glbl'));if(!els.length)return;var obst=[].slice.call(host.querySelectorAll('.leaflet-overlay-pane path')).map(function(p){var r=p.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}).filter(function(r){return (r.right-r.left)<90;});els.forEach(function(el){el.style.margin='0';el.style.transform='none';if(el.__ln){el.__ln.remove();el.__ln=null;}});var items=els.map(function(el){var p=el.parentNode.getBoundingClientRect();var s=el.getBoundingClientRect();return {el:el,ax:p.left,ay:p.top,w:s.width||el.offsetWidth||60,h:s.height||13};});var anchors=items.map(function(i){return {x:i.ax,y:i.ay};});items.sort(function(a,b){return a.ay-b.ay;});var placed=[];items.forEach(function(it){  var w=it.w,h=it.h,g=9;  var cand=[[g,-h/2],[-w-g,-h/2],[-w/2,-h-8],[-w/2,g+3],[g,-h-7],[-w-g,-h-7],[g,g+3],[-w-g,g+3],[g+10,-h-13],[-w-g-10,-h-13],[g+20,-h-24],[-w-g-20,-h-24],[g+20,g+18],[-w-g-20,g+18],[-w/2,-h-26],[-w/2,g+24],[g+26,-h/2],[-w-g-26,-h/2]];  var best=null,bestPen=1e9;  for(var i=0;i<cand.length;i++){    var dx=cand[i][0],dy=cand[i][1];    var box={left:it.ax+dx,right:it.ax+dx+w,top:it.ay+dy,bottom:it.ay+dy+h};    var cxp=box.left+w/2,cyp=box.top+h/2;    var own=Math.sqrt(Math.pow(cxp-it.ax,2)+Math.pow(cyp-it.ay,2));    var pen=i*0.5+own*0.45;    if(box.left<H.left+2||box.right>H.right-2||box.top<H.top+2||box.bottom>H.bottom-2)pen+=1000;    for(var j=0;j<placed.length;j++)if(ov(box,placed[j],3))pen+=100000;    for(var k=0;k<obst.length;k++)if(ov(box,obst[k],1))pen+=120;    /* never sit closer to somebody else's dot than to your own */    var nfd=1e9;for(var a=0;a<anchors.length;a++){var an=anchors[a];if(Math.abs(an.x-it.ax)<0.6&&Math.abs(an.y-it.ay)<0.6)continue;var d=Math.sqrt(Math.pow(cxp-an.x,2)+Math.pow(cyp-an.y,2));if(d<nfd)nfd=d;}if(nfd<own)pen+=300;else if(nfd<16)pen+=150;    var nf=1e9;for(var b=0;b<anchors.length;b++){var an2=anchors[b];if(Math.abs(an2.x-it.ax)<0.6&&Math.abs(an2.y-it.ay)<0.6)continue;var d2=Math.sqrt(Math.pow(cxp-an2.x,2)+Math.pow(cyp-an2.y,2));if(d2<nf)nf=d2;}if(pen<bestPen){bestPen=pen;best=[dx,dy,box,own,nf];}  }  it.el.style.transform='translate('+Math.round(best[0])+'px,'+Math.round(best[1])+'px)';  placed.push(best[2]);  /* connector when the label had to sit away from its dot */  if(best[3]>18||best[4]<best[3]*1.3){    var ex=best[0]+(best[0]<0?w:0),ey=best[1]+h/2;    var len=Math.sqrt(ex*ex+ey*ey)-4;var ang=Math.atan2(ey,ex)*180/Math.PI;    var ln=document.createElement('div');    ln.style.cssText='position:absolute;left:0;top:0;height:1px;width:'+Math.max(0,len)+'px;background:rgba(12,30,53,.45);transform-origin:0 50%;transform:rotate('+ang+'deg);pointer-events:none';    it.el.parentNode.appendChild(ln);it.el.__ln=ln;  }});}catch(e){}};window.omDeclutterBind=function(map){if(map.__omdc)return;map.__omdc=1;var f=function(){setTimeout(function(){window.omDeclutter(map);},40);};map.on('zoomend moveend resize load',f);map.whenReady(f);try{var host=map.getContainer();if(window.ResizeObserver&&host){var lw=0,lh=0;new ResizeObserver(function(){var r=host.getBoundingClientRect();if(Math.abs(r.width-lw)>1||Math.abs(r.height-lh)>1){lw=r.width;lh=r.height;f();}}).observe(host);}}catch(e){}};})();
(function(){if(!document.getElementById('__basemapGreyCSS')){var s=document.createElement('style');s.id='__basemapGreyCSS';s.textContent='.basemap-grey{filter:grayscale(1) brightness(1.06)}';document.head.appendChild(s);}})();
/* ══════════════════════════════════════════════════════════════════════
   NPI Summary — PDF report template.
   Builds its own paginated document from the loaded data (native text,
   tables, charts and a live map — never a screenshot of the screen):
     page 1  title page
     page 2  current month indicators (chart + records table)
     page 3  monthly trends
     page 4  indicator classification (type and voltage)
     page 5  MV unplanned outages by governorate
     page 6  governorates · performance map
     page 7  zones · rolling compliance
   Called as window.NPI_PRINT_DOC(data) by npi-tab.js.

   Table alignment rule: every table is emitted by tbl() from a column
   spec, so a column's header and its cells ALWAYS carry the same
   alignment class. No :first-child rules, no inline text-align.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
var ID='nr-pdoc',CH=[],MAPI=null,R=null,OLDTITLE=null;
var NAVY='#0c1e35',RED='#c0392b',GREY='#94a3b8',BLUE='#2980b9',GREEN='#27ae60',AMBER='#e67e22',INK='#111827',MUTE='#5b6674';
/* A4 landscape at 96dpi less 9mm margins */
var PW=1010,PH=722,PAGES=7;

function nf(v,d){if(v===null||v===undefined||isNaN(v))return'—';d=d||0;return Number(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});}
function auto(v){if(v===null||v===undefined)return'—';return nf(v,Math.abs(v)>=10?1:2);}
function sdec(m){return m&&m.dec!==undefined?m.dec:1;}
function pct(a,b){return b?((a-b)/b*100):null;}
function dstr(v){return v===null?'—':(v>0?'+':'')+v.toFixed(1)+'%';}
function get(key){return (R.summary||[]).find(function(x){return String(x.metric).toUpperCase().indexOf(key)>=0;})||{};}
function esc(s){return String(s===null||s===undefined?'':s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
function lastIdx(a){for(var i=(a||[]).length-1;i>=0;i--)if(a[i]!==null&&a[i]!==undefined)return i;return-1;}
function tierCol(rank,n){return rank<=Math.ceil(n/3)?GREEN:rank<=Math.ceil(n*2/3)?AMBER:RED;}

/* governorate centroids — same geography as the Performance Map tab */
var GEO=[
 ['Musandam',26.18,56.32,'L'],['Al Buraimi',24.15,55.88,'L'],['Ad Dhahirah',23.18,55.90,'L'],
 ['Ad Dakhiliyah',22.85,57.10,'L'],['Al Wusta',20.50,56.50,'L'],
 ['Al Batinah North',24.10,57.20,'R'],['Al Batinah South',23.50,57.50,'R'],['Muscat',23.42,58.90,'R'],
 ['Ash Sharqiyah North',22.62,59.10,'R'],['Ash Sharqiyah South',21.20,59.40,'R']
];
function gkey(s){return String(s||'').toLowerCase().replace(/[^a-z]/g,'')
  .replace(/^(al|ad|ash|as)/,'').replace(/sharqyia|sharqiyah/g,'sharqiya')
  .replace(/dakhiliyah|dakilyah|dakhliyah|dhakhliya/g,'dakilya')
  .replace(/(.+)(north|south)$/,'$2$1');}

var CSS=''+
'#'+ID+'{position:fixed;left:0;top:0;z-index:-1;visibility:hidden;background:#fff;font-family:Inter,"Segoe UI",sans-serif;color:'+INK+'}'+
/* The page box fills whatever printable area the print dialog ends up with:
   100% wide, 99.6vh tall (in print, vh resolves against the page box), so no
   white band can appear down the right or bottom edge whatever margin the
   user picks. Fixed row heights stay modest and one row per page flexes. */
'#'+ID+' .pd-pg{width:100%;height:99.6vh;max-height:99.6vh;overflow:hidden;background:#fff;position:relative;display:flex;flex-direction:column}'+
'#'+ID+' *{box-sizing:border-box;margin:0;padding:0}'+
'#'+ID+' .pd-h{display:flex;align-items:center;justify-content:space-between;gap:18px;height:62px;padding:0 16px;background:'+NAVY+';border-bottom:3px solid '+RED+';border-radius:7px 7px 0 0;flex-shrink:0}'+
'#'+ID+' .pd-h-t{font-size:17px;font-weight:800;color:#fff;letter-spacing:-.3px;line-height:1.1}'+
'#'+ID+' .pd-h-s{font-size:11px;font-weight:500;color:rgba(255,255,255,.6);margin-top:3px}'+
'#'+ID+' .pd-h-r{display:flex;align-items:center;gap:12px;flex-shrink:0}'+
'#'+ID+' .pd-h-m{font-size:14px;font-weight:900;letter-spacing:.5px;color:#fff;background:'+RED+';padding:7px 15px;border-radius:6px;white-space:nowrap}'+
'#'+ID+' .pd-h-p{font-size:10px;font-weight:700;color:rgba(255,255,255,.45);letter-spacing:.6px;white-space:nowrap}'+
'#'+ID+' .pd-b{flex:1;padding:10px 0 0;display:flex;flex-direction:column;gap:8px;min-height:0}'+
'#'+ID+' .pd-f{flex-shrink:0;height:24px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e5e7eb;font-size:9.5px;color:'+GREY+';font-weight:600}'+
'#'+ID+' .pd-row{display:flex;gap:8px;min-height:0}'+
'#'+ID+' .pd-p{border:1px solid #e5e7eb;border-radius:7px;overflow:hidden;display:flex;flex-direction:column;min-width:0;background:#fff}'+
'#'+ID+' .pd-p-h{flex-shrink:0;padding:6px 11px;background:#f5f7f9;border-bottom:1px solid #e5e7eb;display:flex;align-items:baseline;justify-content:space-between;gap:10px}'+
'#'+ID+' .pd-p-h b{font-size:11.5px;font-weight:800;color:'+NAVY+'}'+
'#'+ID+' .pd-p-h i{font-style:normal;font-size:9.5px;font-weight:600;color:'+GREY+'}'+
'#'+ID+' .pd-lg{display:flex;align-items:center;gap:4px;font-size:9px;font-weight:700;color:'+MUTE+'}'+
'#'+ID+' .pd-lg .sw{display:block;width:8px;height:8px;border-radius:2px;margin-left:11px}'+
'#'+ID+' .pd-lg .sw.tg{width:14px;height:0;border-radius:0;border-top:2px dashed '+NAVY+'}'+
'#'+ID+' .pd-lg .u{color:'+GREY+';font-weight:600;margin-right:2px}'+
'#'+ID+' .pd-p-b{flex:1;padding:8px 10px;min-height:0;display:flex;flex-direction:column;justify-content:center}'+
'#'+ID+' .pd-p.top .pd-p-b{justify-content:flex-start}'+
'#'+ID+' .pd-p.flush .pd-p-b{padding:0}'+
/* tables — alignment comes only from .al/.ar/.ac, applied to th and td alike */
'#'+ID+' .pd-t{width:100%;border-collapse:collapse;table-layout:auto}'+
'#'+ID+' .pd-t th{background:'+NAVY+';color:#fff;font-size:9.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:7px 8px;white-space:nowrap;vertical-align:bottom}'+
'#'+ID+' .pd-t th:first-child{border-radius:4px 0 0 0}#'+ID+' .pd-t th:last-child{border-radius:0 4px 0 0}'+
'#'+ID+' .pd-t td{font-size:12px;font-weight:600;padding:6px 8px;border-bottom:1px solid #eef1f5;white-space:nowrap;vertical-align:middle}'+
'#'+ID+' .pd-t.cmp th{font-size:9px;padding:6px 5px}#'+ID+' .pd-t.cmp td{font-size:11.5px;padding:5px 5px}'+
'#'+ID+' .pd-t.big th{font-size:10px;padding:10px 9px}#'+ID+' .pd-t.big td{font-size:13.5px;padding:12px 9px}'+
'#'+ID+' .pd-t .al{text-align:left}#'+ID+' .pd-t .ar{text-align:right}#'+ID+' .pd-t .ac{text-align:center}'+
'#'+ID+' .pd-t td.kk{font-weight:700;color:'+NAVY+'}'+
'#'+ID+' .pd-t tr:nth-child(even) td{background:#fafbfc}'+
'#'+ID+' .pd-t tr:last-child td{border-bottom:none}'+
'#'+ID+' .pd-mut{color:'+MUTE+'}#'+ID+' .pd-up{color:'+RED+'}#'+ID+' .pd-dn{color:'+GREEN+'}'+
'#'+ID+' .pd-rk{display:inline-block;min-width:19px;text-align:center;font-size:10px;font-weight:800;color:#fff;background:'+NAVY+';border-radius:4px;padding:2px 5px}'+
'#'+ID+' .pd-chip{display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.3px;padding:3px 9px;border-radius:20px;text-transform:uppercase}'+
'#'+ID+' .pd-chip.ok{background:#eafaf1;color:#1c7a48;border:1px solid #b9e6cd}'+
'#'+ID+' .pd-chip.bad{background:#fdf1ef;color:#a8321f;border:1px solid #f3c4bc}'+
/* kpi cards */
'#'+ID+' .pd-k{flex:1;border:1px solid #e5e7eb;border-top:3px solid '+RED+';border-radius:7px;padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between;min-width:0}'+
'#'+ID+' .pd-k-l{font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:'+GREY+'}'+
'#'+ID+' .pd-k-v{font-size:38px;font-weight:900;letter-spacing:-1.4px;color:'+NAVY+';line-height:1;margin:4px 0 2px}'+
'#'+ID+' .pd-k-d{font-size:11px;font-weight:700}'+
'#'+ID+' .pd-k-d span{font-weight:600;color:'+GREY+'}'+
'#'+ID+' .pd-k-r .pd-k-s{margin-left:auto;text-transform:none}'+
'#'+ID+' .pd-k-r{display:flex;align-items:center;gap:16px;margin-top:8px;padding-top:7px;border-top:1px dashed #e5e7eb}'+
'#'+ID+' .pd-k-r div{font-size:9.5px;font-weight:700;color:'+GREY+';text-transform:uppercase;letter-spacing:.5px}'+
'#'+ID+' .pd-k-r b{display:block;font-size:14px;font-weight:800;color:'+INK+';letter-spacing:-.3px;margin-top:1px;text-transform:none}'+
/* zone cards */
'#'+ID+' .pd-z{flex:1;border:1px solid #e5e7eb;border-radius:7px;overflow:hidden;display:flex;flex-direction:column;min-width:0}'+
'#'+ID+' .pd-z-h{background:'+NAVY+';color:#fff;padding:7px 12px;display:flex;align-items:center;justify-content:space-between}'+
'#'+ID+' .pd-z-h b{font-size:13px;font-weight:800}#'+ID+' .pd-z-h span{font-size:9.5px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.8px}'+
'#'+ID+' .pd-z-b{flex:1;padding:9px 12px;display:flex;flex-direction:column;justify-content:flex-start;gap:4px}'+
'#'+ID+' .pd-z-r{display:flex;align-items:baseline;justify-content:space-between;gap:8px}'+
'#'+ID+' .pd-z-r span{font-size:11px;font-weight:600;color:'+MUTE+'}'+
'#'+ID+' .pd-z-r b{font-size:19px;font-weight:900;letter-spacing:-.6px;color:'+NAVY+'}'+
'#'+ID+' .pd-z-r b.sm{font-size:14px;color:'+MUTE+'}'+
'#'+ID+' .pd-bar{height:7px;border-radius:20px;background:#eef1f5;overflow:hidden;margin:6px 0 3px}'+
'#'+ID+' .pd-bar i{display:block;height:100%;border-radius:20px}'+
'#'+ID+' .pd-bar-l{display:flex;justify-content:space-between;font-size:9px;font-weight:700;color:'+GREY+'}'+
/* map page */
/* The stage is a FIXED pixel block (and sits inside a page that is otherwise
   fluid): the leader-line endpoints are measured geometry, so the map and the
   callouts must land in exactly the same place on paper as on screen. 1010px
   fits the narrowest A4-landscape printable width. */
'#'+ID+' .pd-mstage{position:relative;width:960px;height:534px;margin:0 auto;flex-shrink:0;display:flex;background:#f3f6fa}'+
'#'+ID+' .pd-mcol{flex:1 1 0;min-width:0;padding:10px 11px;display:flex;flex-direction:column;justify-content:space-around;gap:6px;background:#fff}'+
'#'+ID+' .pd-mmap{width:376px;flex:0 0 376px;height:100%;position:relative;z-index:1;background:#f3f6fa}'+
'#'+ID+' .pd-mlead{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:4}'+
'#'+ID+' .pd-mc{position:relative;z-index:5;border:1px solid #e5e7eb;border-radius:7px;padding:7px 9px;background:#fff;display:flex;flex-direction:column;gap:5px}'+
'#'+ID+' .pd-mc-t{display:flex;align-items:center;gap:8px;min-width:0}'+
'#'+ID+' .pd-mc-r{flex-shrink:0;width:21px;height:21px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:800;color:#fff}'+
'#'+ID+' .pd-mc-n{flex:1;min-width:0;font-size:12px;font-weight:800;color:'+NAVY+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'#'+ID+' .pd-mc-m{display:flex;gap:5px}'+
'#'+ID+' .pd-mc-m div{flex:1;min-width:0;background:#f7f9fb;border:1px solid #eef1f5;border-radius:5px;padding:2px 5px;text-align:center}'+
'#'+ID+' .pd-mc-m span{display:block;font-size:8px;font-weight:800;letter-spacing:.6px;color:'+GREY+';white-space:nowrap}'+
'#'+ID+' .pd-mc-m b{font-size:12px;font-weight:800;color:'+INK+'}'+
'#'+ID+' .pd-mc-m .pd-fd{background:#fdf1ef;border-color:#f0bdb4}'+
'#'+ID+' .pd-mc-m .pd-fd span{color:#b4432f}'+
'#'+ID+' .pd-mc-m .pd-fd b{color:'+RED+'}'+
'#'+ID+' .pd-mc-m .pd-fd.z{background:#f7f9fb;border-color:#eef1f5}'+
'#'+ID+' .pd-mc-m .pd-fd.z span,#'+ID+' .pd-mc-m .pd-fd.z b{color:'+GREY+'}'+
'#'+ID+' .pd-mlg{flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:16px;padding:6px;font-size:9.5px;font-weight:600;color:'+MUTE+'}'+
'#'+ID+' .pd-mlg b{font-size:9px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:'+NAVY+'}'+
'#'+ID+' .pd-mlg span{display:flex;align-items:center;gap:5px}'+
'#'+ID+' .pd-mlg i{width:8px;height:8px;border-radius:50%;display:block}'+
'#'+ID+' .leaflet-control-container,#'+ID+' .leaflet-control-attribution{display:none}'+
/* notes */
'#'+ID+' .pd-n{flex-shrink:0;border:1px solid #e5e7eb;border-left:3px solid '+RED+';border-radius:0 6px 6px 0;padding:6px 10px}'+
'#'+ID+' .pd-n p{font-size:9.5px;color:'+MUTE+';line-height:1.45;padding-left:10px;position:relative}'+
'#'+ID+' .pd-n p::before{content:"*";position:absolute;left:0;color:'+RED+';font-weight:800}'+
/* title page */
'#'+ID+' .pd-cv{background:'+NAVY+';color:#fff;display:flex;flex-direction:column}'+
'#'+ID+' .pd-cv-t{flex:1;padding:40px 58px 0;display:flex;flex-direction:column}'+
'#'+ID+' .pd-top{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}'+
'#'+ID+' .pd-logo{height:58px;width:auto;display:block;flex-shrink:0}'+
'#'+ID+' .pd-eb{display:flex;align-items:center;gap:11px;font-size:11px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:rgba(255,255,255,.55);padding-top:14px}'+
'#'+ID+' .pd-eb i{display:block;width:34px;height:3px;background:'+RED+'}'+
'#'+ID+' .pd-cv-h1{font-size:46px;font-weight:900;letter-spacing:-2.2px;line-height:1.04;margin-top:18px;max-width:680px}'+
'#'+ID+' .pd-cv-h1 em{font-style:normal;display:block;color:#e8737f}'+
'#'+ID+' .pd-cv-sub{font-size:14px;font-weight:500;color:rgba(255,255,255,.62);margin-top:16px;max-width:560px;line-height:1.55}'+
'#'+ID+' .pd-cv-m{display:inline-flex;align-items:center;gap:12px;margin-top:26px;background:'+RED+';padding:11px 22px;border-radius:8px;align-self:flex-start}'+
'#'+ID+' .pd-cv-m span{font-size:10px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,.72)}'+
'#'+ID+' .pd-cv-m b{font-size:24px;font-weight:900;letter-spacing:.6px}'+
'#'+ID+' .pd-cv-lbl{display:flex;align-items:center;gap:10px;margin-top:auto;font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:rgba(255,255,255,.45);padding-bottom:9px}'+
'#'+ID+' .pd-cv-lbl i{flex:1;height:1px;background:rgba(255,255,255,.16)}'+
'#'+ID+' .pd-cv-g{display:flex;gap:11px;padding-bottom:18px}'+
'#'+ID+' .pd-g{flex:1;min-width:0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:11px 14px 10px;display:flex;flex-direction:column;align-items:center;gap:7px}'+
'#'+ID+' .pd-g-h{display:flex;align-items:baseline;gap:7px;font-size:9.5px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:rgba(255,255,255,.5)}'+
'#'+ID+' .pd-g-h b{font-size:12px;letter-spacing:.7px;color:#fff}'+
'#'+ID+' .pd-g svg{width:100%;max-width:238px;height:auto;display:block}'+
'#'+ID+' .pd-g-r{display:flex;width:100%;gap:8px;border-top:1px solid rgba(255,255,255,.13);padding-top:7px}'+
'#'+ID+' .pd-g-r div{flex:1;min-width:0;text-align:center;font-size:8px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:rgba(255,255,255,.45)}'+
'#'+ID+' .pd-g-r b{display:block;margin-top:2px;font-size:13px;font-weight:800;letter-spacing:-.2px;color:#fff;text-transform:none}'+
'#'+ID+' .pd-g-r b.up{color:#e8737f}#'+ID+' .pd-g-r b.dn{color:#6fd39b}'+
'#'+ID+' .pd-gchip{font-size:8.5px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;padding:3px 11px;border-radius:20px}'+
'#'+ID+' .pd-scale{display:flex;align-items:center;gap:7px;font-size:8px;font-weight:800;letter-spacing:.9px;color:rgba(255,255,255,.5);text-transform:uppercase;white-space:nowrap}'+
'#'+ID+' .pd-scale i{width:104px;height:6px;border-radius:20px;background:linear-gradient(90deg,hsl(140 62% 58%),hsl(88 62% 56%),hsl(48 70% 56%),hsl(20 68% 56%),hsl(0 62% 58%))}'+
'#'+ID+' .pd-gchip.ok{background:rgba(39,174,96,.18);color:#7fe0a6;border:1px solid rgba(39,174,96,.38)}'+
'#'+ID+' .pd-gchip.bad{background:rgba(192,57,43,.22);color:#f5a397;border:1px solid rgba(192,57,43,.45)}'+
'#'+ID+' .pd-gchip.warn{background:rgba(230,126,34,.22);color:#f7c98d;border:1px solid rgba(230,126,34,.48)}'+
'#'+ID+' .pd-cv-b{flex-shrink:0;border-top:1px solid rgba(255,255,255,.14);padding:14px 58px 18px;display:flex;align-items:flex-end;justify-content:space-between;gap:30px}'+
'#'+ID+' .pd-toc{display:flex;gap:22px;flex-wrap:wrap}'+
'#'+ID+' .pd-toc div{font-size:10.5px;font-weight:600;color:rgba(255,255,255,.72)}'+
'#'+ID+' .pd-toc div b{display:block;font-size:9px;font-weight:800;color:'+RED+';letter-spacing:1px;margin-bottom:3px}'+
'#'+ID+' .pd-cv-src{font-size:10px;color:rgba(255,255,255,.42);text-align:right;line-height:1.6;white-space:nowrap}'+
/* shown on screen when the report runs in its own export window —
   screen only, so the print page box (100% × 99.6vh) is never overridden */
'@media screen{'+
'body.nr-live{background:#5a616b;padding:14px}'+
'body.nr-live #'+ID+'{position:static;visibility:visible;z-index:auto;display:flex;flex-direction:column;align-items:center;gap:14px;padding-top:42px}'+
'body.nr-live #'+ID+' .pd-pg{width:1054px;height:726px;max-height:726px;box-shadow:0 6px 22px rgba(0,0,0,.35)}'+
'body.nr-live .nr-live-bar{position:fixed;left:0;right:0;top:0;z-index:9;display:flex;align-items:center;justify-content:center;gap:14px;padding:9px;background:#0c1e35;color:#fff;font:600 12px Inter,sans-serif}'+
'body.nr-live .nr-live-bar button{font:700 12px Inter,sans-serif;padding:7px 15px;border-radius:7px;border:none;cursor:pointer;background:'+RED+';color:#fff}'+
'}'+
/* print */
'@media print{'+
'body.nr-pdf>*{display:none!important}'+
'body.nr-pdf>#'+ID+'{display:block!important;position:static!important;visibility:visible!important;z-index:auto!important}'+
'body.nr-pdf{background:#fff!important;margin:0!important;padding:0!important}'+
'body.nr-pdf *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}'+
'#'+ID+' .pd-pg{break-inside:avoid;page-break-inside:avoid;break-after:page;page-break-after:always}'+
'#'+ID+' .pd-pg:last-child{break-after:auto;page-break-after:auto}'+
'}';
/* @page cannot be scoped to a body class, so the landscape rule is injected only
   for the duration of the export and removed in cleanup(). */
var PAGE_RULE='@media print{@page{size:A4 landscape;margin:9mm}}';

/* ── builders ── */
function page(sub,n,body){
  return '<section class="pd-pg">'+
    '<div class="pd-h"><div><div class="pd-h-t">Network Performance Indicators Summary</div><div class="pd-h-s">'+esc(sub)+'</div></div>'+
    '<div class="pd-h-r"><div class="pd-h-m">'+esc(String(R.meta.period).toUpperCase())+'</div><div class="pd-h-p">PAGE '+n+' / '+PAGES+'</div></div></div>'+
    '<div class="pd-b">'+body+'</div>'+
    '<div class="pd-f"><span>NEDC · Network Operations — '+esc(sub)+'</span><span>Source: '+esc(R.meta.source)+'</span></div>'+
  '</section>';
}
function panel(title,sub,inner,style,cls){
  var st=sub?(String(sub).charAt(0)==='<'?sub:esc(sub)):'';
  return '<div class="pd-p'+(cls?' '+cls:'')+'" style="'+(style||'')+'"><div class="pd-p-h"><b>'+esc(title)+'</b>'+(st?'<i>'+st+'</i>':'')+'</div><div class="pd-p-b">'+inner+'</div></div>';
}
/* cols: [{h,a:'l'|'r'|'c',k:bold-first,w}] · rows: [[val|{t,c}]] */
function tbl(cols,rows,cls){
  var th=cols.map(function(c){return '<th class="a'+c.a+'"'+(c.w?' style="width:'+c.w+'"':'')+'>'+c.h+'</th>';}).join('');
  var tb=rows.map(function(r){
    return '<tr>'+r.map(function(v,i){
      var c=cols[i]||{a:'r'},o=(v&&typeof v==='object')?v:{t:v};
      return '<td class="a'+c.a+(c.k?' kk':'')+(o.c?' '+o.c:'')+'">'+o.t+'</td>';
    }).join('')+'</tr>';
  }).join('');
  return '<table class="pd-t'+(cls?' '+cls:'')+'"><thead><tr>'+th+'</tr></thead><tbody>'+tb+'</tbody></table>';
}
/* ── voltage-level breakdown ───────────────────────────────────────────
   A true-proportion band for all levels, plus a magnifier panel that
   rescales the small high-voltage levels against EACH OTHER — at 1.6% of
   the total a 33KV slice is a hairline on the band, so the detail rows
   carry it. Inline SVG so the screen card and the print page share one
   drawing with no canvas timing. */
window.npiPyramidSVG=function(rows,W,H,cols,fmt){
  var tot=rows.reduce(function(a,b){return a+(b.v||0);},0);
  if(!tot)return '';
  /* biggest level first so the band reads left-to-right by size */
  var d=rows.map(function(r,i){return {k:r.k,v:r.v||0,c:cols[i%cols.length]};})
            .sort(function(a,b){return b.v-a.v;});
  var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');};
  var P=14,bw=W-P*2,by=16,bh=W<340?40:46;
  var svg='@@VB@@'+
    '<defs><clipPath id="npiBandClip"><rect x="'+P+'" y="'+by+'" width="'+bw+'" height="'+bh+'" rx="5"/></clipPath></defs>'+
    '<g clip-path="url(#npiBandClip)">';
  var x=P;
  d.forEach(function(s){
    var w=bw*s.v/tot,pc=s.v/tot*100;
    svg+='<rect x="'+x.toFixed(1)+'" y="'+by+'" width="'+Math.max(w,0.6).toFixed(1)+'" height="'+bh+'" fill="'+s.c+'"/>';
    if(w>=64){
      var cx=(x+w/2).toFixed(1);
      svg+='<text x="'+cx+'" y="'+(by+bh/2-2).toFixed(1)+'" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="12.5" font-weight="700" fill="#fff">'+pc.toFixed(1)+'%</text>'+
           '<text x="'+cx+'" y="'+(by+bh/2+11).toFixed(1)+'" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="9" font-weight="500" fill="#fff" opacity=".82">'+fmt(s.v)+'</text>';
    }
    x+=w;
  });
  svg+='</g><rect x="'+P+'" y="'+by+'" width="'+bw+'" height="'+bh+'" rx="5" fill="none" stroke="#fff" stroke-width="1"/>';
  /* band axis + the label for the dominant level, named above the band */
  svg+='<text x="'+P+'" y="10" font-size="10.5" font-weight="800" fill="#0c1e35">'+esc(d[0].k)+'</text>'+
       '<text x="'+(W-P)+'" y="10" text-anchor="end" font-family="JetBrains Mono,monospace" font-size="9" font-weight="700" fill="#6b7280">TOTAL '+fmt(tot)+'</text>';
  var ay=by+bh+6;
  /* magnifier: every level except the dominant one, scaled to each other */
  var sub=d.slice(1),rest=sub.reduce(function(a,b){return a+b.v;},0);
  var vb=function(h){return svg.replace('@@VB@@','<svg viewBox="0 0 '+W+' '+Math.round(h)+'" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" font-family="Inter,sans-serif">')+'</svg>';};
  if(!sub.length)return vb(ay+8);
  /* the panel is sized from its rows, not from whatever height is left over,
     so it never prints as a half-empty grey box */
  var py=ay+12,mx=Math.max.apply(null,sub.map(function(s){return s.v;}))||1;
  var rowH=26,ph=28+sub.length*rowH+8;
  svg+='<rect x="'+P+'" y="'+py+'" width="'+bw+'" height="'+Math.max(ph,0).toFixed(1)+'" rx="6" fill="#f7f9fb" stroke="#e3e7ee"/>'+
       '<text x="'+(P+11)+'" y="'+(py+17)+'" font-size="9" font-weight="800" letter-spacing=".5" fill="#6b7280">THE REMAINING '+(rest/tot*100).toFixed(1)+'% \u00b7 HIGH VOLTAGE DETAIL</text>';
  var ry=py+28,lx=P+11,tw=bw-22,kw=44,vw=78,trw=tw-kw-vw-16;
  sub.forEach(function(s,i){
    var cy=ry+i*rowH,bY=cy+rowH/2-6.5,w=Math.max(2,trw*s.v/mx);
    svg+='<text x="'+lx+'" y="'+(cy+rowH/2+3.5).toFixed(1)+'" font-size="10.5" font-weight="800" fill="#0c1e35">'+esc(s.k)+'</text>'+
         '<rect x="'+(lx+kw)+'" y="'+bY.toFixed(1)+'" width="'+trw.toFixed(1)+'" height="13" rx="3" fill="#e8ecf2"/>'+
         '<rect x="'+(lx+kw)+'" y="'+bY.toFixed(1)+'" width="'+w.toFixed(1)+'" height="13" rx="3" fill="'+s.c+'"/>'+
         '<text x="'+(lx+tw-11)+'" y="'+(cy+rowH/2-1).toFixed(1)+'" text-anchor="end" font-family="JetBrains Mono,monospace" font-size="10.5" font-weight="700" fill="#0c1e35">'+fmt(s.v)+'</text>'+
         '<text x="'+(lx+tw-11)+'" y="'+(cy+rowH/2+9).toFixed(1)+'" text-anchor="end" font-family="JetBrains Mono,monospace" font-size="8.5" font-weight="600" fill="#6b7280">'+(s.v/tot*100).toFixed(1)+'%</text>';
  });
  return vb(py+ph+4);
};

function cv(id,w,h){return '<canvas id="'+id+'" width="'+w+'" height="'+h+'" style="width:'+w+'px;height:'+h+'px"></canvas>';}
function notes(k){
  var a=(R.notes||{})[k]||[];
  return a.length?'<div class="pd-n">'+a.map(function(t){return '<p>'+esc(t)+'</p>';}).join('')+'</div>':'';
}

/* ── conditional formatting ──────────────────────────────────────────
   Every indicator is lower-is-better, so the signal is the gap to the
   annual target: YTD as a share of it, mapped onto a continuous green →
   amber → red scale (nothing left at 100%). Arc, value and chip all take
   the same colour, and the chip carries the % and the remaining gap. */
function band(m){
  var t=m.target,r=t?(m.ytd/t):null;
  if(r===null)return{r:null,h:140,col:'hsl(140 62% 58%)',gap:null};
  var k=Math.pow(Math.max(0,Math.min(1,r/1.02)),1.7),h=140-140*k;
  return{r:r*100,h:h,col:'hsl('+h.toFixed(0)+' 64% 58%)',gap:t-m.ytd};
}
function chip(m){
  var b=band(m),dec=sdec(m);
  if(b.r===null)return'<span class="pd-gchip" style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.6)">No target</span>';
  var g=b.gap,txt=b.r.toFixed(0)+'% of '+R.meta.year+' target · '+nf(Math.abs(g),dec)+(g<0?' over':' left');
  return '<span class="pd-gchip" style="background:hsl('+b.h.toFixed(0)+' 64% 58% / .17);border:1px solid hsl('+b.h.toFixed(0)+' 64% 58% / .45);color:hsl('+b.h.toFixed(0)+' 74% 74%)">'+esc(txt)+'</span>';
}

/* ── page 1 · title ── */
/* YTD gauge, drawn as SVG so it prints exactly: arc fills to YTD against the
   annual scale, with a tick at the annual target and the scale ends labelled. */
function gauge(m){
  var dec=sdec(m),ytd=m.ytd||0,tgt=m.target||0;
  var max=m.gmax||Math.max(ytd,tgt)*1.3||1;
  var big=Math.abs(max)>=1000;
  var f=Math.max(0,Math.min(1,ytd/max)),tf=Math.max(0,Math.min(1,tgt/max));
  var cx=119,cy=110,r=88,col=band(m).col;
  function pt(t,rad){var a=Math.PI*(1-t);return[(cx+rad*Math.cos(a)).toFixed(1),(cy-rad*Math.sin(a)).toFixed(1)];}
  var p0=pt(0,r),pe=pt(1,r),pv=pt(f,r),ta=pt(tf,r-13),tb=pt(tf,r+13),tl=pt(tf,r+25);
  var maxLbl=big?Math.round(max/1000)+'K':nf(max,0);
  return '<svg viewBox="0 0 238 140" role="img">'+
    '<path d="M'+p0[0]+' '+p0[1]+' A'+r+' '+r+' 0 0 1 '+pe[0]+' '+pe[1]+'" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="15" stroke-linecap="round"></path>'+
    (f>0.004?'<path d="M'+p0[0]+' '+p0[1]+' A'+r+' '+r+' 0 0 1 '+pv[0]+' '+pv[1]+'" fill="none" stroke="'+col+'" stroke-width="15" stroke-linecap="round"></path>':'')+
    '<line x1="'+ta[0]+'" y1="'+ta[1]+'" x2="'+tb[0]+'" y2="'+tb[1]+'" stroke="#fff" stroke-width="2.4" stroke-linecap="round"></line>'+
    '<text x="'+tl[0]+'" y="'+tl[1]+'" fill="rgba(255,255,255,.8)" font-family="Inter" font-size="10.5" font-weight="800" text-anchor="middle">'+nf(tgt,dec)+'</text>'+
    '<text x="'+cx+'" y="'+(cy-20)+'" fill="'+col+'" font-family="Inter" font-size="33" font-weight="900" letter-spacing="-1.2" text-anchor="middle">'+nf(ytd,dec)+'</text>'+
    '<text x="'+cx+'" y="'+(cy-4)+'" fill="rgba(255,255,255,.45)" font-family="Inter" font-size="8.5" font-weight="800" letter-spacing="1.2" text-anchor="middle">YEAR TO DATE</text>'+
    '<text x="'+(cx-r)+'" y="'+(cy+20)+'" fill="rgba(255,255,255,.4)" font-family="Inter" font-size="9" font-weight="700" text-anchor="middle">0</text>'+
    '<text x="'+(cx+r)+'" y="'+(cy+20)+'" fill="rgba(255,255,255,.4)" font-family="Inter" font-size="9" font-weight="700" text-anchor="middle">'+maxLbl+'</text>'+
  '</svg>';
}
function cover(){
  var k=R.summary.map(function(m){
    var dec=sdec(m),d=pct(m.cur,m.prev);
    return '<div class="pd-g">'+
      '<div class="pd-g-h"><b>'+esc(m.metric)+'</b>vs '+R.meta.year+' target</div>'+
      gauge(m)+
      '<div class="pd-g-r">'+
        '<div>'+R.meta.monthLabel+' '+R.meta.year+'<b>'+nf(m.cur,dec)+'</b></div>'+
        '<div>vs '+R.meta.prevYear+'<b class="'+(d>0?'up':'dn')+'">'+dstr(d)+'</b></div>'+
        '<div>Month target<b>'+nf(m.mtarget,dec)+'</b></div>'+
        '<div>'+R.meta.year+' target<b>'+nf(m.target,dec)+'</b></div>'+
      '</div>'+
      chip(m)+
    '</div>';
  }).join('');
  var toc=[['01','Current Month Position'],['02','Monthly Trends'],['03','Indicator Classification'],['04','Governorate Outages'],['05','Performance Map'],['06','Zonal Compliance']]
    .map(function(t){return '<div><b>'+t[0]+'</b>'+t[1]+'</div>';}).join('');
  var when=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
  /* the sidebar / welcome mark is the white-on-dark variant — the one that reads
     on this navy cover; the topbar mark is full colour for light backgrounds */
  var lg=window.__NPI_LOGO||((document.querySelector('#sidebar .slogo img')||document.querySelector('#welcome img')||document.querySelector('.topbar-left img')||{}).src)||'';
  var logo=lg?'<img class="pd-logo" src="'+lg+'" alt="NEDC">':'';
  return '<section class="pd-pg pd-cv"><div class="pd-cv-t">'+
    '<div class="pd-top"><div class="pd-eb"><i></i>NEDC · Network Operations</div>'+logo+'</div>'+
    '<div class="pd-cv-h1">Network Performance<em>Indicators Summary</em></div>'+
    '<div class="pd-cv-m"><span>Reporting period</span><b>'+esc(String(R.meta.period).toUpperCase())+'</b></div>'+
    '<div class="pd-cv-lbl">Year-to-date position · '+esc(String(R.meta.period))+'<i></i>'+
    '<div class="pd-scale">% of '+R.meta.year+' target<span>0</span><i></i><span>100+</span></div></div>'+
    '<div class="pd-cv-g">'+k+'</div></div>'+
    '<div class="pd-cv-b"><div class="pd-toc">'+toc+'</div>'+
    '<div class="pd-cv-src">By Distribution Control Center<br>Issued '+when+' · '+PAGES+' pages</div></div>'+
  '</section>';
}

/* ── page 2 · current month indicators (chart + records table) ── */
function kcards(){
  return R.summary.map(function(m){
    var dec=sdec(m),d=pct(m.cur,m.prev);
    return '<div class="pd-k"><div><div class="pd-k-l">'+esc(m.metric)+' · '+R.meta.monthLabel+'</div>'+
      '<div class="pd-k-v">'+nf(m.cur,dec)+'</div>'+
      '<div class="pd-k-d '+(d>0?'pd-up':'pd-dn')+'">'+dstr(d)+' <span>vs '+R.meta.monthLabel+' '+R.meta.prevYear+'</span></div></div>'+
      '<div class="pd-k-r"><div>Month target<b>'+nf(m.mtarget,dec)+'</b></div>'+
      '<div>Year to date<b>'+nf(m.ytd,dec)+'</b></div>'+
      '<div>'+R.meta.year+' target<b>'+nf(m.target,dec)+'</b></div></div></div>';
  }).join('');
}
function pmonth(){
  var ml=R.meta.monthLabel,cols=[{h:'Metric',a:'l',k:1},{h:ml+' '+R.meta.year,a:'r'},{h:ml+' '+R.meta.prevYear,a:'r'},{h:'Month target',a:'r'},{h:'vs '+R.meta.prevYear,a:'r'}];
  var rows=R.summary.map(function(m){
    var dec=sdec(m),d=pct(m.cur,m.prev);
    return [esc(m.metric),nf(m.cur,dec),{t:nf(m.prev,dec),c:'pd-mut'},{t:nf(m.mtarget,dec),c:'pd-mut'},{t:dstr(d),c:d>0?'pd-up':'pd-dn'}];
  });
  return page('Current Month Position',2,
    '<div class="pd-row" style="height:132px;gap:9px">'+kcards()+'</div>'+
    '<div class="pd-row" style="flex:1;min-height:0">'+
      panel('Monthly Indicators vs Target',ml+' '+R.meta.year+' vs '+ml+' '+R.meta.prevYear+' vs month target · log scale',cv('pdc-dcc',520,336),'flex:1.08')+
      panel('Monthly Indicators vs Target · Records','',tbl(cols,rows,'big'),'flex:.92')+
    '</div>'+notes('p1'));
}

/* ── page 3 · monthly trends ── */
function p1(){
  function lg(unit,m){
    return '<span class="pd-lg"><span class="u">'+esc(unit)+'</span>'+
      '<span class="sw" style="background:'+RED+'"></span>YTD '+R.meta.year+
      '<span class="sw" style="background:'+GREY+'"></span>YTD '+R.meta.prevYear+
      '<span class="sw" style="background:'+BLUE+'"></span>Rolling 12 months'+
      '<span class="sw tg"></span>Target '+nf(m.target,sdec(m))+'</span>';
  }
  var sa=get('SAIDI'),sf=get('SAIFI'),ou=get('OUTAGE');
  return page('Monthly Trends · Cumulative, Rolling and Target',3,
    '<div class="pd-row" style="height:184px">'+
      panel('SAIDI',lg('minutes lost per customer',sa),cv('pdc-saidi',1000,154),'flex:1')+
    '</div>'+
    '<div class="pd-row" style="height:184px">'+
      panel('SAIFI',lg('interruptions per customer',sf),cv('pdc-saifi',1000,154),'flex:1')+
    '</div>'+
    '<div class="pd-row" style="flex:1;min-height:0">'+
      panel('MV unplanned outages',lg('number of outages',ou),cv('pdc-out',1000,154),'flex:1')+
    '</div>'+notes('p1'));
}

/* ── page 4 · classification (type and voltage) ── */
function p2(){
  var tot=R.outageVoltage.reduce(function(a,b){return a+(b.v||0);},0);
  return page('Indicator Classification · Type and Voltage Level',4,
    '<div class="pd-row" style="height:238px">'+
      panel('SAIDI · planned vs unplanned','minutes',cv('pdc-tsaidi',484,196),'flex:1')+
      panel('SAIFI · planned vs unplanned','interruptions',cv('pdc-tsaifi',484,196),'flex:1')+
    '</div>'+
    '<div class="pd-row" style="flex:1;min-height:0">'+
      panel('SAIDI by voltage level','share of minutes',cv('pdc-vsaidi',302,248),'flex:1')+
      panel('SAIFI by voltage level','share of interruptions',cv('pdc-vsaifi',302,248),'flex:1')+
      panel('Unplanned outages by voltage','total '+nf(tot,0)+' YTD','<div style="width:302px">'+window.npiPyramidSVG(R.outageVoltage,302,0,[NAVY,BLUE,RED],function(v){return nf(v,0);})+'</div>','flex:1')+
    '</div>'+notes('p2'));
}

/* ── page 5 · MV unplanned outages by governorate ── */
function pgov(){
  var go=R.governorates.slice().sort(function(a,b){return b.mv26-a.mv26;});
  var t26=go.reduce(function(a,b){return a+(b.mv26||0);},0),t25=go.reduce(function(a,b){return a+(b.mv25||0);},0);
  var cols=[{h:'Governorate',a:'l',k:1},{h:String(R.meta.year),a:'r'},{h:String(R.meta.prevYear),a:'r'},{h:'Change',a:'r'}];
  var rows=go.map(function(x){
    var d=pct(x.mv26,x.mv25);
    return [esc(x.gov),nf(x.mv26,0),{t:nf(x.mv25,0),c:'pd-mut'},{t:dstr(d),c:d>0?'pd-up':'pd-dn'}];
  });
  rows.push([{t:'<b>All governorates</b>'},{t:'<b>'+nf(t26,0)+'</b>'},{t:'<b>'+nf(t25,0)+'</b>',c:'pd-mut'},{t:'<b>'+dstr(pct(t26,t25))+'</b>',c:pct(t26,t25)>0?'pd-up':'pd-dn'}]);
  return page('MV Unplanned Outages · Governorates',5,
    '<div class="pd-row" style="flex:1;min-height:0">'+
      panel('MV unplanned outages by governorate','year to date · '+R.meta.year+' vs '+R.meta.prevYear+' · % = change vs '+R.meta.prevYear,cv('pdc-govout',628,516),'flex:1.62')+
      panel('Ranked records','year to date count and change',tbl(cols,rows,'big'),'flex:.86','top')+
    '</div>'+notes('p2'));
}

/* ── page 6 · performance map ── */
function mapEntries(){
  var g=R.governorates.slice().sort(function(a,b){return a.rank-b.rank;}),n=g.length||1,idx={},out=[];
  g.forEach(function(x){idx[gkey(x.gov)]=x;});
  GEO.forEach(function(p){
    var d=idx[gkey(p[0])];if(!d)return;
    out.push({d:d,ll:[p[1],p[2]],side:p[3],col:tierCol(d.rank,n)});
  });
  return out;
}
function p3map(){
  var ent=mapEntries();
  function card(e){
    var x=e.d;
    return '<div class="pd-mc" data-k="'+gkey(x.gov)+'">'+
      '<div class="pd-mc-t"><div class="pd-mc-r" style="background:'+e.col+'">'+x.rank+'</div>'+
      '<div class="pd-mc-n">'+esc(x.gov)+'</div></div>'+
      '<div class="pd-mc-m"><div><span>SAIDI</span><b>'+auto(x.saidi)+'</b></div>'+
      '<div><span>SAIFI</span><b>'+auto(x.saifi)+'</b></div>'+
      '<div class="pd-fd'+(x.fdr?'':' z')+'"><span>WORST FDRS</span><b>'+x.fdr+'</b></div></div></div>';
  }
  var byLat=function(a,b){return b.ll[0]-a.ll[0];};
  var body=ent.length
    ? '<div class="pd-p flush" style="flex:1;min-height:0">'+
        '<div class="pd-p-h"><b>Governorates · year to date '+R.meta.year+'</b><i>ranked best to worst · marker size scales with SAIDI</i></div>'+
        '<div class="pd-p-b" style="padding:0">'+
          '<div class="pd-mstage" id="pdm-stage">'+
            '<div class="pd-mcol" id="pdm-L">'+ent.filter(function(e){return e.side==='L';}).sort(byLat).map(card).join('')+'</div>'+
            '<div class="pd-mmap" id="pdm-map"></div>'+
            '<div class="pd-mcol" id="pdm-R">'+ent.filter(function(e){return e.side==='R';}).sort(byLat).map(card).join('')+'</div>'+
            '<svg class="pd-mlead" id="pdm-lead" xmlns="http://www.w3.org/2000/svg"></svg>'+
          '</div>'+
          '<div class="pd-mlg"><b>Rank tier</b><span><i style="background:'+GREEN+'"></i>Best third</span>'+
          '<span><i style="background:'+AMBER+'"></i>Middle third</span><span><i style="background:'+RED+'"></i>Worst third</span>'+
          '<span style="color:'+MUTE+'"><b style="color:'+RED+'">Worst FDRs</b> = feeders with 3 or more unplanned outages</span></div>'+
        '</div></div>'
    : '<div class="pd-p" style="flex:1"><div class="pd-p-b" style="text-align:center;font-size:12px;color:'+MUTE+'">No governorate rows recognised in the loaded workbook.</div></div>';
  return page('Governorates · Performance Map',6,body+notes('p3'));
}

/* ── page 7 · zonal compliance ── */
function zcards(k){
  var z=R.zones[k]||[],dec=k==='SAIDI'?0:2;
  return z.map(function(x){
    var over=x.rolling>x.target,w=x.target?Math.min(x.rolling/x.target*100,100):0;
    return '<div class="pd-z"><div class="pd-z-h"><b>'+esc(x.zone)+'</b><span>'+k+'</span></div><div class="pd-z-b">'+
      '<div class="pd-z-r"><span>'+((R.meta.year||2026)-1)+' year end</span><b class="sm">'+nf(x.prev,dec)+'</b></div>'+
      '<div class="pd-z-r"><span>'+R.meta.year+' rolling 12 month</span><b>'+nf(x.rolling,dec)+'</b></div>'+
      '<div class="pd-z-r"><span>Target '+R.meta.year+'</span><b class="sm">'+nf(x.target,dec)+'</b></div>'+
      '<div class="pd-bar"><i style="width:'+w+'%;background:'+(over?RED:GREEN)+'"></i></div>'+
      '<div style="margin-top:4px;display:flex;align-items:center;flex-wrap:wrap;gap:7px"><span class="pd-chip '+(over?'bad':'ok')+'">'+(over?'APSR penalty':'Within target')+'</span>'+(x.imp===null||x.imp===undefined?'':'<span style="font-size:8px;font-weight:700;color:'+(x.imp<=0?GREEN:RED)+'">'+(x.imp>0?'+':'')+nf(x.imp,1)+'% vs '+((R.meta.year||2026)-1)+'</span>')+'</div>'+
    '</div></div>';
  }).join('');
}
function pzones(){
  return page('Zonal Compliance · Rolling 12 Months',7,
    '<div class="pd-row" style="gap:9px;flex:0 0 auto">'+zcards('SAIDI')+'</div>'+
    '<div class="pd-row" style="gap:9px;flex:0 0 auto">'+zcards('SAIFI')+'</div>'+
    '<div class="pd-row" style="flex:1;min-height:0">'+
      panel('SAIDI · rolling vs target '+R.meta.year,'all zones',cv('pdc-zSAIDI',490,200),'flex:1')+
      panel('SAIFI · rolling vs target '+R.meta.year,'all zones',cv('pdc-zSAIFI',490,200),'flex:1')+
    '</div>'+notes('p4'));
}

/* ── charts ── */
function base(){return{responsive:false,maintainAspectRatio:false,animation:false,devicePixelRatio:2,
  plugins:{legend:{display:false},datalabels:{display:false},tooltip:{enabled:false}}};}
function add(id,cfg){var c=document.getElementById(id);if(!c)return;CH.push(new Chart(c,cfg));}
function fnt(s,w){return{size:s,weight:w||400,family:'Inter'};}
function ax(){return{color:'#f1f3f6',drawTicks:false};}
function legend(size){return{display:true,position:'bottom',labels:{boxWidth:8,boxHeight:8,font:fnt(size||9),padding:7,usePointStyle:true,pointStyle:'rectRounded',color:MUTE}};}

function drawCharts(){
  var mm=R.months;
  /* current month · three indicators on one log axis (4,530 outages next to
     0.17 SAIFI only reads on a log scale), every bar labelled */
  (function(){
    var s=R.summary,o=base();
    o.layout={padding:{top:20,right:6,left:2,bottom:0}};
    o.scales={x:{grid:{display:false},border:{color:'#dfe4ea'},ticks:{font:fnt(9.5,800),color:NAVY,autoSkip:false}},
      y:{type:'logarithmic',min:.1,grid:ax(),border:{display:false},ticks:{font:fnt(8),color:GREY,callback:function(v){
        var l=Math.log10(v);if(Math.abs(l-Math.round(l))>.001)return'';return v>=1000?(v/1000)+'K':String(v);}}}};
    o.plugins.legend=legend(9.5);
    o.plugins.datalabels={display:true,anchor:'end',align:'top',offset:1,color:'#334155',font:fnt(9,800),
      formatter:function(v,c){return nf(v,sdec(s[c.dataIndex]));}};
    add('pdc-dcc',{type:'bar',data:{labels:s.map(function(x){return x.metric;}),datasets:[
      {label:R.meta.monthLabel+' '+R.meta.year,data:s.map(function(x){return x.cur;}),backgroundColor:RED,borderRadius:3},
      {label:R.meta.monthLabel+' '+R.meta.prevYear,data:s.map(function(x){return x.prev;}),backgroundColor:GREY,borderRadius:3},
      {label:R.meta.monthLabel+' target',data:s.map(function(x){return x.mtarget;}),backgroundColor:NAVY,borderRadius:3}
    ]},options:o});
  })();

  /* Cumulative YTD this year and last year run within a few units of each other,
     so labelling every point of both puts two numbers in the same 3-5px band.
     The current year — the subject — carries a label on every point; the prior
     year is labelled at the latest elapsed month and at December (its outturn);
     rolling at the latest month only. The target value lives in the legend. */
  [['pdc-saidi',R.monthly.saidi,1,get('SAIDI').target],['pdc-saifi',R.monthly.saifi,2,get('SAIFI').target],['pdc-out',R.monthly.outages,0,get('OUTAGE').target]]
  .forEach(function(t){
    var d=t[1],dec=t[2],tgt=t[3],last=lastIdx(d.ytd),lastLy=lastIdx(d.ytdLy),lastRoll=lastIdx(d.roll);
    var fmt=function(v){if(v===null||v===undefined)return'';return dec===0&&Math.abs(v)>=1000?(v/1000).toFixed(1)+'K':nf(v,dec);};
    var o=base();
    o.layout={padding:{top:34,right:24,left:24,bottom:0}};
    o.scales={
      /* offset:true insets JAN and DEC from the axis ends, so the first and last
         value labels sit inside the plot instead of over the y-axis ticks */
      x:{offset:true,grid:{display:false},border:{color:'#dfe4ea'},ticks:{font:fnt(8.5,700),color:MUTE,padding:3,autoSkip:false}},
      y:{beginAtZero:true,grace:'8%',grid:ax(),border:{display:false},ticks:{font:fnt(8),color:GREY,maxTicksLimit:5,callback:function(v){return dec===0&&Math.abs(v)>=1000?(v/1000)+'K':v;}}}
    };
    add(t[0],{type:'line',data:{labels:mm,datasets:[
      {label:'Target',data:mm.map(function(){return tgt;}),borderColor:NAVY,borderWidth:1.3,borderDash:[7,4],pointRadius:0},
      {label:'Rolling',data:d.roll,borderColor:BLUE,backgroundColor:BLUE,borderWidth:1.7,pointRadius:1.8,tension:.3,
       datalabels:{display:function(c){return c.dataIndex===lastRoll;},align:'top',offset:5,clamp:true,backgroundColor:'#fff',borderRadius:2,padding:{top:1,bottom:1,left:3,right:3},color:BLUE,font:fnt(8.5,800),formatter:fmt}},
      {label:'YTD '+R.meta.prevYear,data:d.ytdLy,borderColor:GREY,backgroundColor:GREY,borderWidth:1.5,borderDash:[4,3],pointRadius:1.5,tension:.3,
       /* only the prior-year outturn is labelled: at the current month the two
          cumulative lines sit within a pixel of each other, so a second label
          there always lands in the same band as this year's */
       datalabels:{display:function(c){return c.dataIndex===lastLy&&lastLy>last;},align:'left',offset:7,clamp:true,backgroundColor:'#fff',borderRadius:2,padding:{top:1,bottom:1,left:3,right:3},color:GREY,font:fnt(8.5,800),formatter:fmt}},
      {label:'YTD '+R.meta.year,data:d.ytd,borderColor:RED,backgroundColor:'rgba(192,57,43,.10)',borderWidth:2.6,fill:true,tension:.3,
       pointRadius:3,pointBackgroundColor:'#fff',pointBorderColor:RED,pointBorderWidth:1.8,
       /* every point of the current year is labelled, all with the same placement:
          x:{offset:true} already insets JAN well clear of the y-axis ticks, so no
          per-index override is needed (one centred on its point got struck by the line) */
       datalabels:{display:function(c){var v=c.dataset.data[c.dataIndex];return v!==null&&v!==undefined;},
         align:'top',offset:7,clamp:true,backgroundColor:'#fff',borderRadius:2,padding:{top:1,bottom:1,left:3,right:3},color:RED,font:fnt(9,800),formatter:fmt}}
    ]},options:o});
  });


  [['pdc-tsaidi','SAIDI',1],['pdc-tsaifi','SAIFI',2]].forEach(function(t){
    var d=R.classType[t[1]],o=base();
    o.indexAxis='y';
    o.scales={x:{stacked:true,beginAtZero:true,grid:ax(),ticks:{font:fnt(8.5),color:GREY}},y:{stacked:true,grid:{display:false},ticks:{font:fnt(11.5,800),color:NAVY}}};
    o.plugins.legend={display:true,position:'right',labels:{boxWidth:9,boxHeight:9,font:fnt(10),padding:8,usePointStyle:true,pointStyle:'rectRounded',color:MUTE}};
    o.plugins.datalabels={display:true,color:'#fff',font:fnt(11,800),formatter:function(v){return nf(v,t[2]);}};
    add(t[0],{type:'bar',data:{labels:[String(R.meta.year),String(R.meta.prevYear)],datasets:[
      {label:'Planned',data:[d.cur.planned,d.prev.planned],backgroundColor:BLUE,borderRadius:2,barPercentage:.7},
      {label:'Unplanned',data:[d.cur.unplanned,d.prev.unplanned],backgroundColor:RED,borderRadius:2,barPercentage:.7}
    ]},options:o});
  });

  [['pdc-vsaidi','SAIDI'],['pdc-vsaifi','SAIFI']].forEach(function(t){
    var d=R.classVoltage[t[1]],o=base();
    o.plugins.datalabels={display:true,color:'#fff',font:fnt(10.5,800),formatter:function(v){return nf(v,1)+'%';}};
    o.plugins.legend=legend(10);
    add(t[0],{type:'doughnut',data:{labels:d.map(function(x){return x.k;}),datasets:[{data:d.map(function(x){return x.v;}),backgroundColor:[BLUE,NAVY,RED],borderColor:'#fff',borderWidth:2}]},options:Object.assign(o,{cutout:'48%'})});
  });

  var go=R.governorates.slice().sort(function(a,b){return b.mv26-a.mv26;}),o1=base();
  o1.layout={padding:{top:26,right:6,left:2,bottom:0}};
  o1.scales={x:{grid:{display:false},ticks:{font:fnt(9.5,600),color:MUTE,maxRotation:32,minRotation:32,autoSkip:false}},y:{beginAtZero:true,grace:'6%',grid:ax(),ticks:{font:fnt(9),color:GREY}}};
  o1.plugins.legend={display:true,position:'top',align:'end',labels:{boxWidth:9,boxHeight:9,font:fnt(10),padding:8,usePointStyle:true,pointStyle:'rectRounded',color:MUTE}};
  /* two stacked labels on the current-year bar: the count, and above it the
     change against last year (up = worse, so red) */
  o1.plugins.datalabels={labels:{
    value:{display:true,anchor:'end',align:'top',offset:1,color:function(c){return c.datasetIndex?GREY:RED;},font:fnt(10,700),formatter:function(v){return nf(v,0);}},
    delta:{display:function(c){return c.datasetIndex===0&&pct(go[c.dataIndex].mv26,go[c.dataIndex].mv25)!==null;},
      anchor:'end',align:'top',offset:15,clamp:true,backgroundColor:'#fff',borderRadius:2,padding:{top:0,bottom:0,left:3,right:3},
      color:function(c){return pct(go[c.dataIndex].mv26,go[c.dataIndex].mv25)>0?RED:GREEN;},font:fnt(10,800),
      formatter:function(v,c){var d=pct(go[c.dataIndex].mv26,go[c.dataIndex].mv25);return d===null?'':(d>0?'+':'')+d.toFixed(0)+'%';}}
  }};
  add('pdc-govout',{type:'bar',data:{labels:go.map(function(x){return x.gov;}),datasets:[
    {label:String(R.meta.year),data:go.map(function(x){return x.mv26;}),backgroundColor:RED,borderRadius:2},
    {label:String(R.meta.prevYear),data:go.map(function(x){return x.mv25;}),backgroundColor:GREY,borderRadius:2}
  ]},options:o1});

  ['SAIDI','SAIFI'].forEach(function(k){
    var z=R.zones[k]||[],dec=k==='SAIDI'?0:2,o=base();
    o.scales={x:{grid:{display:false},ticks:{font:fnt(11,800),color:NAVY}},y:{beginAtZero:true,grid:ax(),ticks:{font:fnt(8),color:GREY}}};
    o.plugins.legend={display:true,position:'top',align:'end',labels:{boxWidth:8,boxHeight:8,font:fnt(9),padding:6,usePointStyle:true,pointStyle:'rectRounded',color:MUTE}};
    o.plugins.datalabels={display:true,anchor:'end',align:'top',offset:1,color:'#334155',font:fnt(9.5,800),formatter:function(v){return nf(v,dec);}};
    add('pdc-z'+k,{type:'bar',data:{labels:z.map(function(x){return x.zone;}),datasets:[
      {label:'Rolling',data:z.map(function(x){return x.rolling;}),backgroundColor:z.map(function(x){return x.rolling>x.target?RED:GREEN;}),borderRadius:3,barPercentage:.5},
      {label:'Target '+R.meta.year,data:z.map(function(x){return x.target;}),backgroundColor:NAVY,borderRadius:3,barPercentage:.5}
    ]},options:o});
  });
}

/* ── map (resolves once tiles have painted, so the print is not blank) ── */
function drawMap(){
  return new Promise(function(res){
    var host=document.getElementById('pdm-map'),stage=document.getElementById('pdm-stage'),svg=document.getElementById('pdm-lead');
    if(!host||!stage||typeof L==='undefined')return res();
    var ent=mapEntries();if(!ent.length)return res();
    MAPI=L.map(host,{center:[21.6,56.6],zoom:5,zoomControl:false,attributionControl:false,
      dragging:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,touchZoom:false,tap:false,fadeAnimation:false,zoomAnimation:false});
    var tl=L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',{className:'basemap-grey',maxZoom:12,opacity:.6,crossOrigin:true});
    var vals=ent.map(function(e){return e.d.saidi||0;}),mx=Math.max.apply(null,vals)||1;
    ent.forEach(function(e){
      e.m=L.circleMarker(e.ll,{radius:5+Math.sqrt((e.d.saidi||0)/mx)*8,color:'#fff',weight:1.6,fillColor:e.col,fillOpacity:.95}).addTo(MAPI);
      L.marker(e.ll,{interactive:false,keyboard:false,zIndexOffset:500,icon:L.divIcon({className:'',iconSize:[0,0],html:'<div class="om-glbl" style="font-size:9px;font-weight:700;color:#0c1e35;display:inline-block;width:max-content;line-height:13px;white-space:nowrap;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff,0 0 3px #fff;">'+window.omShortGov(e.d.gov)+'</div>'})}).addTo(MAPI);
    });
    function leaders(){
      if(!MAPI||!svg)return;
      var sr=stage.getBoundingClientRect(),mr=host.getBoundingClientRect();
      svg.setAttribute('viewBox','0 0 '+sr.width+' '+sr.height);
      svg.innerHTML=ent.map(function(e){
        var c=stage.querySelector('.pd-mc[data-k="'+gkey(e.d.gov)+'"]');if(!c)return'';
        var p=MAPI.latLngToContainerPoint(e.m.getLatLng()),cr=c.getBoundingClientRect();
        var px=(mr.left-sr.left)+p.x,py=(mr.top-sr.top)+p.y;
        var cx=(e.side==='L'?cr.right:cr.left)-sr.left,cy=cr.top-sr.top+cr.height/2,mid=(cx+px)/2;
        return '<path d="M'+cx+' '+cy+' C'+mid+' '+cy+' '+mid+' '+py+' '+px+' '+py+'" fill="none" stroke="'+e.col+'" stroke-width="1.1" stroke-dasharray="3 3" opacity=".6"></path>'+
          '<circle cx="'+cx+'" cy="'+cy+'" r="2.2" fill="'+e.col+'"></circle>';
      }).join('');
    }
    var done=false,finish=function(){if(done)return;done=true;try{leaders();}catch(e){}res();};
    tl.on('load',function(){setTimeout(finish,150);});
    tl.addTo(MAPI);
    try{MAPI.invalidateSize();MAPI.fitBounds(L.latLngBounds(ent.map(function(e){return e.ll;})).pad(0.18),{animate:false});}catch(e){}
    window.omDeclutterBind(MAPI);setTimeout(function(){window.omDeclutter(MAPI);},60);
    setTimeout(finish,3500);
  });
}

/* ── run ── */
function cleanup(){
  CH.forEach(function(c){try{c.destroy();}catch(e){}});CH=[];
  if(MAPI){try{MAPI.remove();}catch(e){}MAPI=null;}
  if(OLDTITLE!==null){document.title=OLDTITLE;OLDTITLE=null;}
  var d=document.getElementById(ID);if(d)d.remove();
  var pr=document.getElementById('nr-pdoc-page');if(pr)pr.remove();
  document.body.classList.remove('nr-pdf');
}
window.NPI_PRINT_DOC=function(data){
  R=data;cleanup();
  if(!document.getElementById('nr-pdoc-css')){var st=document.createElement('style');st.id='nr-pdoc-css';st.textContent=CSS;document.head.appendChild(st);}
  var pr=document.createElement('style');pr.id='nr-pdoc-page';pr.textContent=PAGE_RULE;document.head.appendChild(pr);
  var d=document.createElement('div');d.id=ID;
  d.innerHTML=cover()+pmonth()+p1()+p2()+pgov()+p3map()+pzones();
  document.body.appendChild(d);
  drawCharts();
  drawMap().then(function(){
    document.body.classList.add('nr-pdf');
    /* the print dialog seeds the saved-PDF filename from document.title */
    OLDTITLE=document.title;
    if(!window.__NPI_WIN)document.title='NPI Summary Report - '+String(R.meta.period).replace(/[\\/:*?"<>|]/g,' ').trim();
    setTimeout(function(){window.print();setTimeout(function(){if(!window.__NPI_WIN)cleanup();},900);},350);
  });
};
window.addEventListener('afterprint',function(){if(!window.__NPI_WIN)setTimeout(cleanup,150);});

/* ── export window ────────────────────────────────────────────────────
   The dashboard runs inside a frame, so the browser seeds the saved-PDF
   filename from the HOST page's title, which we cannot reach. Printing
   from a window we own lets its <title> — the report month — become the
   filename. Same template, same data, no screenshots. */
function srcOf(name,fallback){
  var s=document.querySelector('script[src*="'+name+'"]');
  return s?s.src:fallback;
}
function hrefOf(name,fallback){
  var l=document.querySelector('link[href*="'+name+'"]');
  return l?l.href:fallback;
}
window.NPI_PRINT_REPORT=function(data){
  var period=String((data.meta||{}).period||'').replace(/[\\/:*?"<>|]/g,' ').trim();
  var title='NPI Summary Report - '+period;
  var logo=((document.querySelector('#sidebar .slogo img')||document.querySelector('#welcome img')||document.querySelector('.topbar-left img')||{}).src)||'';
  var w;
  try{w=window.open('','_blank');}catch(e){w=null;}
  if(!w){window.NPI_PRINT_DOC(data);return;}
  var d=w.document;
  d.open();
  d.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+title.replace(/[<>&]/g,'')+'</title>'+
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap">'+
    '<link rel="stylesheet" href="'+hrefOf('leaflet.css','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css')+'">'+
    '<style>html,body{margin:0}</style></head><body>'+
    '<div class="nr-live-bar">Report ready — use your browser\u2019s Save as PDF. File name: <b>'+title+'.pdf</b>'+
    '<button onclick="window.print()">Print again</button><button onclick="window.close()" style="background:rgba(255,255,255,.14)">Close</button></div>'+
    '<scr'+'ipt src="'+srcOf('leaflet.js','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js')+'"><\/scr'+'ipt>'+
    '<scr'+'ipt src="'+srcOf('chart.umd','https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js')+'"><\/scr'+'ipt>'+
    '<scr'+'ipt src="'+srcOf('chartjs-plugin-datalabels','https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js')+'"><\/scr'+'ipt>'+
    '<scr'+'ipt src="'+srcOf('npi-print.js','npi-print.js')+'"><\/scr'+'ipt>'+
    '<scr'+'ipt>window.__NPI_LOGO='+JSON.stringify(logo)+';window.__NPI_DATA='+JSON.stringify(data)+';window.__NPI_WIN=1;'+
    'document.body.classList.add("nr-live");'+
    '(function go(n){if(window.Chart&&window.L&&window.NPI_PRINT_DOC){try{Chart.register(ChartDataLabels);}catch(e){}'+
    'window.NPI_PRINT_DOC(window.__NPI_DATA);return;}if(n>150)return;setTimeout(function(){go(n+1);},80);})(0);<\/scr'+'ipt>'+
    '</body></html>');
  d.close();
  try{w.focus();}catch(e){}
};
})();
