(function(){if(window.omDeclutter)return;window.omShortGov=function(n){return String(n||'').replace(/^(Al|Ad|Ash|As)\s+/i,'').replace(/\s+North$/i,' N').replace(/\s+South$/i,' S');};function ov(a,b,p){p=p||2;return !(a.right+p<b.left||a.left-p>b.right||a.bottom+p<b.top||a.top-p>b.bottom);}window.omDeclutter=function(map){try{var host=map.getContainer();if(!host)return;var H=host.getBoundingClientRect();if(H.width<40)return;var els=[].slice.call(host.querySelectorAll('.om-glbl'));if(!els.length)return;var obst=[].slice.call(host.querySelectorAll('.leaflet-overlay-pane path')).map(function(p){var r=p.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}).filter(function(r){return (r.right-r.left)<90;});els.forEach(function(el){el.style.margin='0';el.style.transform='none';if(el.__ln){el.__ln.remove();el.__ln=null;}});var items=els.map(function(el){var p=el.parentNode.getBoundingClientRect();var s=el.getBoundingClientRect();return {el:el,ax:p.left,ay:p.top,w:s.width||el.offsetWidth||60,h:s.height||13};});var anchors=items.map(function(i){return {x:i.ax,y:i.ay};});items.sort(function(a,b){return a.ay-b.ay;});var placed=[];items.forEach(function(it){  var w=it.w,h=it.h,g=9;  var cand=[[g,-h/2],[-w-g,-h/2],[-w/2,-h-8],[-w/2,g+3],[g,-h-7],[-w-g,-h-7],[g,g+3],[-w-g,g+3],[g+10,-h-13],[-w-g-10,-h-13],[g+20,-h-24],[-w-g-20,-h-24],[g+20,g+18],[-w-g-20,g+18],[-w/2,-h-26],[-w/2,g+24],[g+26,-h/2],[-w-g-26,-h/2]];  var best=null,bestPen=1e9;  for(var i=0;i<cand.length;i++){    var dx=cand[i][0],dy=cand[i][1];    var box={left:it.ax+dx,right:it.ax+dx+w,top:it.ay+dy,bottom:it.ay+dy+h};    var cxp=box.left+w/2,cyp=box.top+h/2;    var own=Math.sqrt(Math.pow(cxp-it.ax,2)+Math.pow(cyp-it.ay,2));    var pen=i*0.5+own*0.45;    if(box.left<H.left+2||box.right>H.right-2||box.top<H.top+2||box.bottom>H.bottom-2)pen+=1000;    for(var j=0;j<placed.length;j++)if(ov(box,placed[j],3))pen+=100000;    for(var k=0;k<obst.length;k++)if(ov(box,obst[k],1))pen+=120;    /* never sit closer to somebody else's dot than to your own */    var nfd=1e9;for(var a=0;a<anchors.length;a++){var an=anchors[a];if(Math.abs(an.x-it.ax)<0.6&&Math.abs(an.y-it.ay)<0.6)continue;var d=Math.sqrt(Math.pow(cxp-an.x,2)+Math.pow(cyp-an.y,2));if(d<nfd)nfd=d;}if(nfd<own)pen+=300;else if(nfd<16)pen+=150;    var nf=1e9;for(var b=0;b<anchors.length;b++){var an2=anchors[b];if(Math.abs(an2.x-it.ax)<0.6&&Math.abs(an2.y-it.ay)<0.6)continue;var d2=Math.sqrt(Math.pow(cxp-an2.x,2)+Math.pow(cyp-an2.y,2));if(d2<nf)nf=d2;}if(pen<bestPen){bestPen=pen;best=[dx,dy,box,own,nf];}  }  it.el.style.transform='translate('+Math.round(best[0])+'px,'+Math.round(best[1])+'px)';  placed.push(best[2]);  /* connector when the label had to sit away from its dot */  if(best[3]>18||best[4]<best[3]*1.3){    var ex=best[0]+(best[0]<0?w:0),ey=best[1]+h/2;    var len=Math.sqrt(ex*ex+ey*ey)-4;var ang=Math.atan2(ey,ex)*180/Math.PI;    var ln=document.createElement('div');    ln.style.cssText='position:absolute;left:0;top:0;height:1px;width:'+Math.max(0,len)+'px;background:rgba(12,30,53,.45);transform-origin:0 50%;transform:rotate('+ang+'deg);pointer-events:none';    it.el.parentNode.appendChild(ln);it.el.__ln=ln;  }});}catch(e){}};window.omDeclutterBind=function(map){if(map.__omdc)return;map.__omdc=1;var f=function(){setTimeout(function(){window.omDeclutter(map);},40);};map.on('zoomend moveend resize load',f);map.whenReady(f);try{var host=map.getContainer();if(window.ResizeObserver&&host){var lw=0,lh=0;new ResizeObserver(function(){var r=host.getBoundingClientRect();if(Math.abs(r.width-lw)>1||Math.abs(r.height-lh)>1){lw=r.width;lh=r.height;f();}}).observe(host);}}catch(e){}};})();
(function(){if(!document.getElementById('__basemapGreyCSS')){var s=document.createElement('style');s.id='__basemapGreyCSS';s.textContent='.basemap-grey{filter:grayscale(1) brightness(1.06)}';document.head.appendChild(s);}})();
/* ══════════════════════════════════════════════════════════════════════
   NETWORK PERFORMANCE INDICATORS SUMMARY — self-contained tab module
   Lives inside #view-npi-summary in index.html but keeps its OWN data:
   it never reads or writes the dashboard's `D` object or its storage key.
   Data source: user-uploaded Excel → localStorage 'nedc_npi_report_data'.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
var STORE='nedc_npi_report_data',ARCH='nedc_npi_report_archive';
var R=JSON.parse(JSON.stringify(window.NPI_DEFAULT)),CH={},built=false,active=1,dirty={1:1,2:1,3:1,4:1,5:1,6:1},MAP=null,MRK=[];
/* Governorate centroids for the performance map — same geography the main
   Performance Map tab uses. side: which column the callout sits in. */
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
var C={cur:'#c0392b',prev:'#94a3b8',roll:'#2980b9',navy:'#0c1e35',green:'#27ae60',pl:'#2980b9',unpl:'#c0392b'};
var FF='Inter';

/* ── helpers ── */
function nf(v,d){if(v===null||v===undefined||isNaN(v))return'—';d=d||0;return Number(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});}
function auto(v){if(v===null||v===undefined)return'—';var a=Math.abs(v);return nf(v,a>=10?1:2);}
function K(v){return Math.abs(v)>=1000?(v/1000).toFixed(Math.abs(v)>=10000?0:1)+'K':nf(v,0);}
function el(id){return document.getElementById(id);}
function grid(){return{color:'#f1f3f6',drawTicks:false};}
function lastIdx(a){for(var i=a.length-1;i>=0;i--)if(a[i]!==null&&a[i]!==undefined)return i;return-1;}
function fin(cfg){var o=cfg.options=cfg.options||{};o.maintainAspectRatio=false;o.responsive=true;
  /* animation off: Chart.resize() defers into _resizeBeforeDraw while the animator
     has a running entry, and that is only flushed on the next draw() — which never
     comes for a static chart, leaving the canvas pinned at its creation width. */
  o.animation=false;
  var p=o.plugins=o.plugins||{};if(!p.legend)p.legend={display:false};if(!p.datalabels)p.datalabels={display:false};return cfg;}
function mk(id,cfg){if(CH[id]){CH[id].destroy();delete CH[id];}var c=el(id);if(!c)return;CH[id]=new Chart(c,fin(cfg));}
function lgd(size){return{display:true,labels:{boxWidth:9,boxHeight:9,font:{size:size||10,family:FF},padding:9,usePointStyle:true,pointStyle:'rectRounded'}};}

/* ── markup ── */
function markup(){return ''+
'<div class="nr-bar">'+
  '<div class="nr-bar-l"><div class="nr-mark">NPI</div><div>'+
    '<div class="nr-title">Network Performance Indicators Summary</div>'+
    '<div class="nr-src" id="nr-src">Report figures · July 2026 (sample)</div>'+
  '</div></div>'+
  '<div class="nr-bar-r">'+
    '<div class="nr-exp"><button class="nr-pill" id="nr-period"><span id="nr-plabel">JULY 2026</span><b>▾</b></button>'+
      '<div class="nr-menu nr-mper" id="nr-pmenu"></div></div>'+
    '<span class="nr-cloud" id="nr-cloud" title="">Syncing…</span>'+
    '<div class="nr-exp"><button class="nr-btn" id="nr-export"><svg viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg>Export<b>▾</b></button>'+
      '<div class="nr-menu" id="nr-menu">'+
        '<button data-x="pdf"><span>PDF</span>One page per sub-tab, print-ready</button>'+
        '<button data-x="pptx"><span>PowerPoint</span>Five editable slides (.pptx)</button>'+
      '</div></div>'+
    '<button class="nr-btn nr-go" id="nr-open"><svg viewBox="0 0 24 24"><path d="M3 17h18v2H3v-2zm2-7h3V4h8v6h3l-7 7-7-7z" style="display:none"/><path d="M20.7 7.04c.4-.4.4-1.04 0-1.43l-2.3-2.31a1.02 1.02 0 0 0-1.44 0l-1.83 1.83 3.75 3.75 1.82-1.84zM3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25z"/></svg>Data Update</button>'+
  '</div>'+
'</div>'+
'<div class="nr-rail">'+
  '<button class="nr-tab on" data-p="1"><i>1</i>Current Month Indicators</button>'+
  '<button class="nr-tab" data-p="2"><i>2</i>Classification</button>'+
  '<button class="nr-tab" data-p="3"><i>3</i>Governorates YTD</button>'+
  '<button class="nr-tab" data-p="4"><i>4</i>Zones · SAIDI</button>'+
  '<button class="nr-tab" data-p="5"><i>5</i>Zones · SAIFI</button>'+
  '<button class="nr-tab" data-p="6"><i>6</i>Data Update</button>'+
'</div>'+

/* PAGE 1 */
'<section class="nr-sheet on" id="nr-p1" data-screen-label="NPI 01">'+
  '<div class="nr-prt"><div><div class="nr-prt-t">Network Performance Indicators Summary</div><div class="nr-prt-s">Current Month Network Indicators</div></div><div class="nr-prt-m" data-month></div></div>'+
  '<div class="nr-shead"><div><h1>Current Month Network Indicators <span>(NEDC)</span></h1><p id="nr-p1sub">Month and year-to-date position against targets</p></div><div class="nr-pg">PAGE 1 / 5</div></div>'+
  '<div class="nr-row" style="grid-template-columns:295px minmax(0,1fr)">'+
    '<div class="nr-p"><div class="nr-ph"><h2>Month &amp; YTD Position</h2><span id="nr-mlabel">July 2026</span></div><div class="nr-pb" id="nr-tiles"></div></div>'+
    '<div class="nr-p"><div class="nr-ph"><h2>Monthly Comparison</h2><span>Records comparisons — YTD, rolling and target</span></div><div class="nr-pb">'+
      '<div class="nr-row" style="grid-template-columns:repeat(3,minmax(0,1fr));margin:0">'+
        '<div><div class="nr-ct">SAIDI</div><div class="nr-cw" style="height:205px"><canvas id="nr-c-saidi"></canvas></div></div>'+
        '<div><div class="nr-ct">SAIFI</div><div class="nr-cw" style="height:205px"><canvas id="nr-c-saifi"></canvas></div></div>'+
        '<div><div class="nr-ct">Number of MV Unplanned Outages</div><div class="nr-cw" style="height:205px"><canvas id="nr-c-out"></canvas></div></div>'+
      '</div><div class="nr-lg" id="nr-lg"></div>'+
    '</div></div>'+
  '</div>'+
  '<div class="nr-row" style="grid-template-columns:minmax(0,1.1fr) minmax(0,1.05fr) minmax(0,.85fr)">'+
    '<div class="nr-p"><div class="nr-ph"><h2>Monthly Indicators vs Target</h2><span id="nr-dccsub"></span></div><div class="nr-pb"><div class="nr-cw" style="height:190px"><canvas id="nr-c-dcc"></canvas></div></div></div>'+
    '<div class="nr-p"><div class="nr-ph"><h2>Monthly Indicators vs Target · Records</h2></div><div class="nr-pb nr-scroll"><table class="nr-dt" id="nr-dcctab" style="min-width:290px"></table></div></div>'+
    '<div class="nr-p"><div class="nr-ph"><h2>Unplanned Outages · YTD</h2><span id="nr-ovsub">Split by voltage level</span></div><div class="nr-pb"><div class="nr-cw" style="height:190px"><canvas id="nr-c-outvolt"></canvas></div></div></div>'+
  '</div>'+
  '<div class="nr-notes" id="nr-n1"></div>'+
'</section>'+

/* PAGE 2 */
'<section class="nr-sheet" id="nr-p2" data-screen-label="NPI 02">'+
  '<div class="nr-prt"><div><div class="nr-prt-t">Network Performance Indicators Summary</div><div class="nr-prt-s">Indicator Classification</div></div><div class="nr-prt-m" data-month></div></div>'+
  '<div class="nr-shead"><div><h1>Indicator Classification</h1><p>SAIDI and SAIFI by type of outage and voltage level, with MV unplanned outages by governorate</p></div><div class="nr-pg">PAGE 2 / 5</div></div>'+
  '<div class="nr-row" style="grid-template-columns:repeat(2,minmax(0,1fr))">'+
    '<div class="nr-p"><div class="nr-ph"><h2>SAIDI Classification (Type of Outage)</h2><span>Minutes · planned vs unplanned</span></div><div class="nr-pb"><div class="nr-cw" style="height:168px"><canvas id="nr-c-tsaidi"></canvas></div></div></div>'+
    '<div class="nr-p"><div class="nr-ph"><h2>SAIFI Classification (Type of Outage)</h2><span>Interruptions · planned vs unplanned</span></div><div class="nr-pb"><div class="nr-cw" style="height:168px"><canvas id="nr-c-tsaifi"></canvas></div></div></div>'+
  '</div>'+
  '<div class="nr-row" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,2fr)">'+
    '<div class="nr-p"><div class="nr-ph"><h2>SAIDI Classification (Voltage level)</h2><span>Share of total minutes</span></div><div class="nr-pb"><div class="nr-cw" style="height:180px"><canvas id="nr-c-vsaidi"></canvas></div></div></div>'+
    '<div class="nr-p"><div class="nr-ph"><h2>SAIFI Classification (Voltage level)</h2><span>Share of total interruptions</span></div><div class="nr-pb"><div class="nr-cw" style="height:180px"><canvas id="nr-c-vsaifi"></canvas></div></div></div>'+
    '<div class="nr-p"><div class="nr-ph"><h2>MV Unplanned Outages (Governorates Wise · YTD)</h2><span id="nr-govsub"></span></div><div class="nr-pb"><div class="nr-cw" style="height:180px"><canvas id="nr-c-govout"></canvas></div></div></div>'+
  '</div>'+
  '<div class="nr-notes" id="nr-n2"></div>'+
'</section>'+

/* PAGE 3 */
'<section class="nr-sheet" id="nr-p3" data-screen-label="NPI 03">'+
  '<div class="nr-prt"><div><div class="nr-prt-t">Network Performance Indicators Summary</div><div class="nr-prt-s">Governorates · Year to date</div></div><div class="nr-prt-m" data-month></div></div>'+
  '<div class="nr-shead"><div><h1>Network Performance Indicators YTD <span id="nr-p3y">2026</span> · Governorates</h1><p>Ranked best to worst — SAIDI, SAIFI and worst-performing feeders per governorate</p></div><div class="nr-pg">PAGE 3 / 5</div></div>'+
  '<div class="nr-row" style="grid-template-columns:minmax(0,1fr)"><div class="nr-p">'+
    '<div class="nr-ph"><h2>Performance Map · Governorates</h2><span id="nr-mapsub">SAIDI and SAIFI year to date — marker size scales with SAIDI</span></div>'+
    '<div class="nr-pb" style="padding:0">'+
      '<div class="nr-mstage" id="nr-mstage">'+
        '<div class="nr-mcol" id="nr-mL"></div>'+
        '<div class="nr-mmap" id="nr-mmap"></div>'+
        '<div class="nr-mcol" id="nr-mR"></div>'+
        '<svg class="nr-mlead" id="nr-mlead" xmlns="http://www.w3.org/2000/svg"></svg>'+
      '</div>'+
      '<div class="nr-mlg"><b>Rank tier</b>'+
        '<span><i style="background:#27ae60"></i>Best third</span>'+
        '<span><i style="background:#e67e22"></i>Middle third</span>'+
        '<span><i style="background:#c0392b"></i>Worst third</span>'+
        '<span><em>Worst FDRs</em> = feeders with 3 or more unplanned outages this year</span>'+
      '</div>'+
    '</div></div></div>'+
  '<div class="nr-row" style="grid-template-columns:minmax(0,1fr)"><div class="nr-p"><div class="nr-ph"><h2>SAIDI &amp; SAIFI by Governorate · YTD</h2><span>Minutes lost per customer (bars) against interruptions per customer (line)</span></div><div class="nr-pb"><div class="nr-cw" style="height:240px"><canvas id="nr-c-govnpi"></canvas></div></div></div></div>'+
  '<div class="nr-notes" id="nr-n3"></div>'+
'</section>'+

/* PAGES 4-5 */
'<section class="nr-sheet" id="nr-p4" data-screen-label="NPI 04">'+
  '<div class="nr-prt"><div><div class="nr-prt-t">Network Performance Indicators Summary</div><div class="nr-prt-s">Records Comparisons · Zones · SAIDI</div></div><div class="nr-prt-m" data-month></div></div>'+
  '<div class="nr-shead"><div><h1>Records Comparisons · Zones — <span style="color:#c0392b">SAIDI</span></h1><p>Rolling 12-month position against zonal targets and APSR compliance status</p></div><div class="nr-pg">PAGE 4 / 5</div></div>'+
  '<div class="nr-row" style="grid-template-columns:repeat(3,minmax(0,1fr))" id="nr-zsaidi"></div>'+
  '<div class="nr-row" style="grid-template-columns:minmax(0,1fr)"><div class="nr-p"><div class="nr-ph"><h2>Rolling vs Target · SAIDI</h2><span>All zones</span></div><div class="nr-pb"><div class="nr-cw" style="height:200px"><canvas id="nr-c-zsaidi"></canvas></div></div></div></div>'+
  '<div class="nr-notes" id="nr-n4"></div>'+
'</section>'+
'<section class="nr-sheet" id="nr-p5" data-screen-label="NPI 05">'+
  '<div class="nr-prt"><div><div class="nr-prt-t">Network Performance Indicators Summary</div><div class="nr-prt-s">Records Comparisons · Zones · SAIFI</div></div><div class="nr-prt-m" data-month></div></div>'+
  '<div class="nr-shead"><div><h1>Records Comparisons · Zones — <span style="color:#c0392b">SAIFI</span></h1><p>Rolling 12-month position against zonal targets and APSR compliance status</p></div><div class="nr-pg">PAGE 5 / 5</div></div>'+
  '<div class="nr-row" style="grid-template-columns:repeat(3,minmax(0,1fr))" id="nr-zsaifi"></div>'+
  '<div class="nr-row" style="grid-template-columns:minmax(0,1fr)"><div class="nr-p"><div class="nr-ph"><h2>Rolling vs Target · SAIFI</h2><span>All zones</span></div><div class="nr-pb"><div class="nr-cw" style="height:200px"><canvas id="nr-c-zsaifi"></canvas></div></div></div></div>'+
  '<div class="nr-notes" id="nr-n5"></div>'+
'</section>'+

/* PAGE 6 · DATA UPDATE */
'<section class="nr-sheet" id="nr-p6" data-screen-label="NPI 06">'+
  '<div class="nr-shead"><div><h1>Data Update</h1><p>Enter this month’s figures here — every page of the tab, the PDF report and the PowerPoint export are built from them</p></div><div class="nr-pg">ADMIN</div></div>'+
  '<div id="nr-edit"></div>'+
'</section>'+

/* UPLOAD MODAL */
'<div class="nr-ov" id="nr-ov"><div class="nr-oc">'+
  '<h3>Load Network Performance Indicators data</h3>'+
  '<p>This tab keeps its own workbook. Nothing you load here touches the main dashboard data, and the dashboard upload does not change this tab.</p>'+
  '<label class="nr-dz" id="nr-dz"><svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>'+
    '<b>Drop your Excel file here</b><span>or click to browse — .xlsx / .xls</span><input type="file" id="nr-fi" accept=".xlsx,.xls"></label>'+
  '<div id="nr-msg"></div>'+
  '<div class="nr-orow"><button class="nr-obtn" id="nr-tpl">Download template</button><button class="nr-obtn" id="nr-reset">Reset to sample</button><button class="nr-obtn nr-ogo" id="nr-close">Done</button></div>'+
  '<div class="nr-help">Expected sheets: <b>Summary</b>, <b>Monthly</b>, <b>Classification</b>, <b>Governorates</b>, <b>Zones</b>, <b>Notes</b>. Download the template for the exact column layout — it comes pre-filled with the July 2026 figures as a worked example. Any sheet you leave out keeps its current values.</div>'+
'</div></div>';}

/* ── styles (all scoped under the view id) ── */
var CSS=''+
'#view-npi-summary .nr-bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 22px;background:linear-gradient(100deg,#0a1628,#0c1e35 55%,#16324f);color:#fff;border-bottom:3px solid #c0392b;border-radius:12px 12px 0 0;flex-wrap:wrap}'+
'#view-npi-summary .nr-bar-l{display:flex;align-items:center;gap:14px;min-width:0}'+
'#view-npi-summary .nr-mark{width:38px;height:38px;border-radius:10px;background:linear-gradient(140deg,#c0392b,#8e2a1e);display:grid;place-items:center;font-size:12px;font-weight:900;flex-shrink:0}'+
'#view-npi-summary .nr-title{font-size:16px;font-weight:800;letter-spacing:-.3px;line-height:1.15}'+
'#view-npi-summary .nr-src{font-size:11px;color:rgba(255,255,255,.5);margin-top:2px}'+
'#view-npi-summary .nr-bar-r{display:flex;align-items:center;gap:8px}'+
'#view-npi-summary .nr-pill{font-family:"JetBrains Mono",monospace;font-size:11px;font-weight:700;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);padding:6px 12px;border-radius:50px;letter-spacing:.4px}'+
'#view-npi-summary .nr-btn{display:inline-flex;align-items:center;gap:7px;font-family:Inter,sans-serif;font-size:12px;font-weight:700;padding:8px 15px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:rgba(255,255,255,.85);transition:.18s}'+
'#view-npi-summary .nr-btn:hover{background:rgba(255,255,255,.14);color:#fff}'+
'#view-npi-summary .nr-btn svg{width:14px;height:14px;fill:currentColor}'+
'#view-npi-summary .nr-go{background:linear-gradient(135deg,#c0392b,#e74c3c);border-color:transparent;color:#fff;box-shadow:0 4px 14px rgba(192,57,43,.35)}'+
'#view-npi-summary .nr-exp{position:relative}'+
'#view-npi-summary .nr-exp b{font-size:9px;opacity:.6;margin-left:1px}'+
'#view-npi-summary .nr-menu{display:none;position:absolute;right:0;top:calc(100% + 7px);background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 14px 36px rgba(8,18,32,.28);overflow:hidden;min-width:236px;z-index:12}'+
'#view-npi-summary .nr-menu.on{display:block}'+
'#view-npi-summary .nr-menu button{display:block;width:100%;text-align:left;background:none;border:none;border-bottom:1px solid #f1f3f6;padding:11px 14px;cursor:pointer;font-family:Inter,sans-serif;font-size:11px;color:#6b7280;line-height:1.35;transition:.14s}'+
'#view-npi-summary .nr-menu button:last-child{border-bottom:none}'+
'#view-npi-summary .nr-menu button:hover{background:#fdf1ef}'+
'#view-npi-summary .nr-menu button span{display:block;font-size:13px;font-weight:800;color:#0c1e35;margin-bottom:1px}'+
'#view-npi-summary .nr-mper{min-width:224px;max-height:330px;overflow:auto}'+
'#view-npi-summary .nr-cloud{font-size:9.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;padding:5px 9px;border-radius:20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:rgba(255,255,255,.6);white-space:nowrap;cursor:default}'+
'#view-npi-summary .nr-cloud.on{background:rgba(39,174,96,.18);border-color:rgba(39,174,96,.45);color:#8ce0b0}'+
'#view-npi-summary .nr-cloud.bad{background:rgba(230,126,34,.18);border-color:rgba(230,126,34,.45);color:#f6c58c}'+
'#view-npi-summary .nr-cloud.off{background:rgba(255,255,255,.06);color:rgba(255,255,255,.45)}'+
'#view-npi-summary .nr-mper button.on span{color:#c0392b}'+
'#view-npi-summary .nr-mper button.on span::after{content:" ●";font-size:9px;vertical-align:2px}'+
'#view-npi-summary .nr-mper .nr-mhd{padding:9px 14px;background:#f5f7f9;border-bottom:1px solid #eef1f5;font-size:9.5px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:#94a3b8}'+
'#view-npi-summary .nr-prt{display:none}'+
'#view-npi-summary .nr-rail{display:flex;gap:2px;padding:0 16px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;overflow-x:auto;margin-bottom:18px;box-shadow:0 2px 10px rgba(12,30,53,.05)}'+
'#view-npi-summary .nr-tab{flex-shrink:0;display:flex;align-items:center;gap:8px;background:none;border:none;font-family:Inter,sans-serif;font-size:12.5px;font-weight:600;color:#6b7280;padding:13px 14px;cursor:pointer;border-bottom:2.5px solid transparent;white-space:nowrap;transition:.15s}'+
'#view-npi-summary .nr-tab:hover{color:#0c1e35;background:#f6f8fa}'+
'#view-npi-summary .nr-tab.on{color:#c0392b;border-bottom-color:#c0392b}'+
'#view-npi-summary .nr-tab i{font-style:normal;font-family:"JetBrains Mono",monospace;font-size:10px;font-weight:700;width:17px;height:17px;border-radius:4px;background:#eef1f5;color:#9ca3af;display:grid;place-items:center}'+
'#view-npi-summary .nr-tab.on i{background:#c0392b;color:#fff}'+
'#view-npi-summary .nr-sheet{display:none}#view-npi-summary .nr-sheet.on{display:block}'+
'#view-npi-summary .nr-shead{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #0c1e35}'+
'#view-npi-summary .nr-shead h1{font-size:21px;font-weight:800;color:#0c1e35;letter-spacing:-.5px;line-height:1.2}'+
'#view-npi-summary .nr-shead h1 span{color:#9ca3af;font-weight:600}'+
'#view-npi-summary .nr-shead p{font-size:12px;color:#6b7280;margin-top:3px}'+
'#view-npi-summary .nr-pg{font-family:"JetBrains Mono",monospace;font-size:11px;font-weight:700;color:#9ca3af;white-space:nowrap}'+
'#view-npi-summary .nr-row{display:grid;gap:14px;margin-bottom:14px}#view-npi-summary .nr-row>*{min-width:0}'+
'#view-npi-summary .nr-p{background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;display:flex;flex-direction:column}'+
'#view-npi-summary .nr-ph{padding:11px 15px 9px;border-bottom:1px solid #e5e7eb;background:linear-gradient(180deg,#fbfcfd,#f5f7f9)}'+
'#view-npi-summary .nr-ph h2{font-size:12.5px;font-weight:800;color:#0c1e35}'+
'#view-npi-summary .nr-ph span{display:block;font-size:10.5px;color:#9ca3af;margin-top:1px;font-weight:500}'+
'#view-npi-summary .nr-pb{padding:14px 15px;flex:1}#view-npi-summary .nr-scroll{overflow-x:auto}'+
'#view-npi-summary .nr-cw{position:relative;width:100%;min-width:0}#view-npi-summary .nr-cw>canvas{display:block}'+
'#view-npi-summary .nr-ct{font-size:11px;font-weight:800;color:#0c1e35;margin-bottom:6px}'+
'#view-npi-summary .nr-tile{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:13px 14px;border:1px solid #e5e7eb;border-radius:9px;background:linear-gradient(180deg,#fff,#fafbfc)}'+
'#view-npi-summary .nr-tile+.nr-tile{margin-top:10px}'+
'#view-npi-summary .nr-tk{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:#9ca3af}'+
'#view-npi-summary .nr-tv{font-size:28px;font-weight:900;letter-spacing:-1.2px;color:#0c1e35;line-height:1;margin:3px 0 5px}'+
'#view-npi-summary .nr-td{font-size:11px;font-weight:600}'+
'#view-npi-summary .nr-up{color:#c0392b}#view-npi-summary .nr-down{color:#27ae60}'+
'#view-npi-summary .nr-gz{width:100px;height:62px;position:relative;flex-shrink:0}'+
'#view-npi-summary .nr-gzt{position:absolute;left:0;right:0;bottom:2px;text-align:center}'+
'#view-npi-summary .nr-gzt b{display:block;font-size:15px;font-weight:900;color:#0c1e35;line-height:1;letter-spacing:-.4px}'+
'#view-npi-summary .nr-gzt span{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#9ca3af}'+
'#view-npi-summary .nr-dt{width:100%;border-collapse:collapse;font-size:12px}'+
'#view-npi-summary .nr-dt th{text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#9ca3af;padding:0 8px 8px;border-bottom:1px solid #e5e7eb}'+
'#view-npi-summary .nr-dt th:first-child{text-align:left}'+
'#view-npi-summary .nr-dt td{padding:9px 8px;border-bottom:1px solid #f1f3f6;text-align:right;font-family:"JetBrains Mono",monospace;font-weight:600}'+
'#view-npi-summary .nr-dt td:first-child{text-align:left;font-family:Inter,sans-serif;font-weight:700;color:#0c1e35}'+
'#view-npi-summary .nr-dt tr:last-child td{border-bottom:none}'+
'#view-npi-summary .nr-lg{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px;justify-content:center}'+
'#view-npi-summary .nr-lg div{display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;color:#6b7280}'+
'#view-npi-summary .nr-lg i{width:10px;height:10px;border-radius:3px;display:block}'+
'#view-npi-summary .nr-notes{background:#fff;border-left:3px solid #c0392b;border-radius:0 8px 8px 0;padding:11px 14px;display:flex;flex-direction:column;gap:5px}'+
'#view-npi-summary .nr-notes p{font-size:11px;color:#6b7280;line-height:1.45;padding-left:12px;position:relative}'+
'#view-npi-summary .nr-notes p::before{content:"*";position:absolute;left:0;color:#c0392b;font-weight:800}'+
'#view-npi-summary .nr-gg{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}'+
'#view-npi-summary .nr-mstage{position:relative;display:flex;height:470px;background:#f3f6fa;overflow:hidden}'+
'#view-npi-summary .nr-mcol{flex:1 1 0;min-width:0;padding:11px 12px;display:flex;flex-direction:column;justify-content:center;gap:7px;background:#fff}'+
'#view-npi-summary .nr-mmap{width:340px;flex:0 0 340px;height:100%;position:relative;z-index:1;background:#f3f6fa}'+
'#view-npi-summary .nr-mlead{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:4}'+
'#view-npi-summary .nr-mc{position:relative;z-index:5;display:flex;flex-direction:column;gap:6px;border:1px solid #e5e7eb;border-radius:8px;padding:8px 10px;background:#fff}'+
'#view-npi-summary .nr-mc-t{display:flex;align-items:center;gap:8px;min-width:0}'+
'#view-npi-summary .nr-mc-r{flex-shrink:0;width:22px;height:22px;border-radius:6px;display:grid;place-items:center;font-family:"JetBrains Mono",monospace;font-size:10.5px;font-weight:700;color:#fff}'+
'#view-npi-summary .nr-mc-n{flex:1;min-width:0;font-size:12px;font-weight:800;color:#0c1e35;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'#view-npi-summary .nr-mc-m{display:flex;gap:6px}'+
'#view-npi-summary .nr-mc-m div{flex:1;min-width:0;background:#f7f9fb;border:1px solid #eef1f5;border-radius:6px;padding:3px 6px;text-align:center}'+
'#view-npi-summary .nr-mc-m span{display:block;font-size:8.5px;font-weight:800;letter-spacing:.7px;color:#9ca3af;white-space:nowrap}'+
'#view-npi-summary .nr-mc-m b{font-family:"JetBrains Mono",monospace;font-size:12.5px;font-weight:700;color:#111827}'+
'#view-npi-summary .nr-mc-m .nr-fd{background:#fdf1ef;border-color:#f0bdb4}'+
'#view-npi-summary .nr-mc-m .nr-fd span{color:#b4432f}'+
'#view-npi-summary .nr-mc-m .nr-fd b{color:#c0392b}'+
'#view-npi-summary .nr-mc-m .nr-fd.z{background:#f7f9fb;border-color:#eef1f5}'+
'#view-npi-summary .nr-mc-m .nr-fd.z span{color:#9ca3af}'+
'#view-npi-summary .nr-mc-m .nr-fd.z b{color:#9ca3af}'+
'#view-npi-summary .nr-mlg{display:flex;align-items:center;justify-content:center;gap:16px;padding:9px;border-top:1px solid #e5e7eb;font-size:10.5px;font-weight:600;color:#6b7280;flex-wrap:wrap}'+
'#view-npi-summary .nr-mlg b{font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:#0c1e35}'+
'#view-npi-summary .nr-mlg span{display:flex;align-items:center;gap:6px}'+
'#view-npi-summary .nr-mlg i{width:9px;height:9px;border-radius:50%;display:block}'+
'#view-npi-summary .nr-mlg em{font-style:normal;font-weight:700;color:#c0392b}'+
'#view-npi-summary .nr-mtt{background:#0c1e35!important;color:#fff!important;border:none!important;box-shadow:0 4px 14px rgba(8,18,32,.3)!important;font-family:Inter,sans-serif!important;font-size:10.5px!important;font-weight:600!important;padding:5px 9px!important;border-radius:6px!important}'+
'#view-npi-summary .nr-mtt::before{border-top-color:#0c1e35!important}'+
'#view-npi-summary .nr-mmap .leaflet-control-attribution{display:none}'+
'#view-npi-summary .nr-mmap,#view-npi-summary .nr-mmap .leaflet-container{cursor:default!important}'+
'#view-npi-summary .nr-mmap path.leaflet-interactive{cursor:pointer!important}'+
'@media(max-width:900px){#view-npi-summary .nr-mstage{flex-direction:column;height:auto}#view-npi-summary .nr-mmap{width:100%;flex:0 0 300px}#view-npi-summary .nr-mlead{display:none}}'+
'#view-npi-summary .nr-gc{border:1px solid #e5e7eb;border-radius:9px;padding:12px;background:#fff;position:relative;overflow:hidden}'+
'#view-npi-summary .nr-gc::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px}'+
'#view-npi-summary .nr-gc.t1::before{background:#27ae60}#view-npi-summary .nr-gc.t2::before{background:#e67e22}#view-npi-summary .nr-gc.t3::before{background:#c0392b}'+
'#view-npi-summary .nr-gch{display:flex;align-items:center;gap:7px;margin-bottom:9px}'+
'#view-npi-summary .nr-gcr{font-family:"JetBrains Mono",monospace;font-size:10px;font-weight:700;width:20px;height:20px;border-radius:5px;background:#0c1e35;color:#fff;display:grid;place-items:center;flex-shrink:0}'+
'#view-npi-summary .nr-gcn{font-size:11.5px;font-weight:800;color:#0c1e35;line-height:1.15}'+
'#view-npi-summary .nr-gm{display:flex;justify-content:space-between;align-items:baseline;padding:4px 0}'+
'#view-npi-summary .nr-gm b{font-family:"JetBrains Mono",monospace;font-size:13px;font-weight:700;color:#111827}'+
'#view-npi-summary .nr-gm i{font-style:normal;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px}'+
'#view-npi-summary .nr-fdr{margin-top:8px;padding-top:8px;border-top:1px dashed #e5e7eb;display:flex;justify-content:space-between;align-items:center;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px}'+
'#view-npi-summary .nr-fdr b{font-family:"JetBrains Mono",monospace;font-size:12px;color:#c0392b;letter-spacing:0}'+
'#view-npi-summary .nr-zc{background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}'+
'#view-npi-summary .nr-zch{padding:12px 16px;background:#0c1e35;color:#fff;display:flex;align-items:center;justify-content:space-between}'+
'#view-npi-summary .nr-zch b{font-size:14px;font-weight:800}'+
'#view-npi-summary .nr-zch span{font-family:"JetBrains Mono",monospace;font-size:10px;font-weight:700;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.8px}'+
'#view-npi-summary .nr-zcb{padding:16px}'+
'#view-npi-summary .nr-zr{display:flex;align-items:baseline;justify-content:space-between;padding:9px 0;border-bottom:1px dashed #e5e7eb}'+
'#view-npi-summary .nr-zr:last-of-type{border-bottom:none}'+
'#view-npi-summary .nr-zrk{font-size:11.5px;font-weight:600;color:#6b7280}'+
'#view-npi-summary .nr-zrv{font-size:20px;font-weight:900;color:#0c1e35;letter-spacing:-.6px;font-family:"JetBrains Mono",monospace}'+
'#view-npi-summary .nr-zbar{height:8px;border-radius:50px;background:#eef1f5;overflow:hidden;margin:12px 0 6px;position:relative}'+
'#view-npi-summary .nr-zbar i{position:absolute;top:0;bottom:0;left:0;border-radius:50px;display:block}'+
'#view-npi-summary .nr-zbl{display:flex;justify-content:space-between;font-size:10px;font-weight:600;color:#9ca3af;font-family:"JetBrains Mono",monospace}'+
'#view-npi-summary .nr-badge{display:flex;align-items:center;gap:8px;margin-top:14px;padding:11px 13px;border-radius:8px;font-size:12px;font-weight:700}'+
'#view-npi-summary .nr-badge span{font-size:10px;font-weight:600;opacity:.8;display:block;text-transform:uppercase;letter-spacing:.7px;margin-bottom:2px}'+
'#view-npi-summary .nr-badge.pen{background:#fdf1ef;border:1px solid #f3c4bc;color:#a8321f}'+
'#view-npi-summary .nr-badge.ok{background:#eefaf3;border:1px solid #b9e6cd;color:#1c7a48}'+
'#view-npi-summary .nr-ov{display:none;position:fixed;inset:0;background:rgba(8,18,32,.72);backdrop-filter:blur(5px);z-index:70;align-items:center;justify-content:center;padding:20px}'+
'#view-npi-summary .nr-ov.on{display:flex}'+
'#view-npi-summary .nr-oc{background:#0c1e35;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:30px;max-width:530px;width:100%;color:#fff}'+
'#view-npi-summary .nr-oc h3{font-size:19px;font-weight:800;letter-spacing:-.4px;margin-bottom:5px}'+
'#view-npi-summary .nr-oc>p{font-size:12.5px;color:rgba(255,255,255,.5);line-height:1.55;margin-bottom:20px}'+
'#view-npi-summary .nr-dz{display:block;border:2px dashed rgba(192,57,43,.45);border-radius:12px;padding:26px 20px;text-align:center;cursor:pointer;background:rgba(192,57,43,.05);transition:.2s}'+
'#view-npi-summary .nr-dz:hover,#view-npi-summary .nr-dz.over{border-color:#e74c3c;background:rgba(192,57,43,.12)}'+
'#view-npi-summary .nr-dz svg{width:30px;height:30px;fill:rgba(255,255,255,.35);margin-bottom:8px}'+
'#view-npi-summary .nr-dz b{display:block;font-size:13.5px;font-weight:700}'+
'#view-npi-summary .nr-dz span{font-size:11.5px;color:rgba(255,255,255,.45)}'+
'#view-npi-summary .nr-dz input{display:none}'+
'#view-npi-summary #nr-msg{display:none;font-size:12px;font-weight:600;padding:10px 13px;border-radius:8px;margin-top:14px;line-height:1.5}'+
'#view-npi-summary .nr-mok{background:rgba(39,174,96,.16);color:#7fe0a6;border:1px solid rgba(39,174,96,.3)}'+
'#view-npi-summary .nr-merr{background:rgba(192,57,43,.16);color:#f5a397;border:1px solid rgba(192,57,43,.35)}'+
'#view-npi-summary .nr-orow{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:16px}'+
'#view-npi-summary .nr-obtn{font-family:Inter,sans-serif;font-size:12px;font-weight:700;padding:11px 12px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.05);color:rgba(255,255,255,.8);transition:.18s}'+
'#view-npi-summary .nr-obtn:hover{background:rgba(255,255,255,.12);color:#fff}'+
'#view-npi-summary .nr-ogo{background:linear-gradient(135deg,#c0392b,#e74c3c);border-color:transparent;color:#fff}'+
'#view-npi-summary .nr-help{margin-top:16px;padding-top:15px;border-top:1px solid rgba(255,255,255,.1);font-size:11px;color:rgba(255,255,255,.4);line-height:1.6}'+
'#view-npi-summary .nr-help b{color:rgba(255,255,255,.7);font-family:"JetBrains Mono",monospace;font-size:10.5px}'+
'@media(max-width:1240px){#view-npi-summary .nr-gg{grid-template-columns:repeat(3,minmax(0,1fr))}}'+
'@media(max-width:1080px){#view-npi-summary .nr-row{grid-template-columns:minmax(0,1fr)!important}}'+
'@media(max-width:700px){#view-npi-summary .nr-gg{grid-template-columns:repeat(2,minmax(0,1fr))}#view-npi-summary .nr-orow{grid-template-columns:1fr}}'+
'@media print{#view-npi-summary .nr-ov{display:none!important}}';

/* ── page 1 ── */
function renderKpis(){
  var host=el('nr-tiles');if(!host)return;host.innerHTML='';
  R.summary.forEach(function(s,i){
    var dv=s.prev?((s.cur-s.prev)/s.prev*100):null;
    host.insertAdjacentHTML('beforeend','<div class="nr-tile"><div>'+
      '<div class="nr-tk">'+s.metric+' (M)</div><div class="nr-tv">'+nf(s.cur,s.dec)+'</div>'+
      '<div class="nr-td '+(dv===null?'':(dv>0?'nr-up':'nr-down'))+'">'+(dv===null?'—':(dv>0?'▲':'▼')+' '+Math.abs(dv).toFixed(1)+'% vs '+R.meta.prevYear)+'</div>'+
      '</div><div class="nr-gz"><canvas id="nr-g'+i+'"></canvas><div class="nr-gzt"><b>'+nf(s.ytd,s.dec)+'</b><span>YTD</span></div></div></div>');
  });
  R.summary.forEach(function(s,i){
    mk('nr-g'+i,{type:'doughnut',data:{datasets:[{data:[s.ytd,Math.max((s.gmax||0)-s.ytd,0)],backgroundColor:[s.ytd>s.target?C.cur:C.green,'#eef1f5'],borderWidth:0,circumference:180,rotation:270,cutout:'72%'}]},
      options:{layout:{padding:2},plugins:{tooltip:{enabled:false}}}});
  });
  if(el('nr-mlabel'))el('nr-mlabel').textContent=R.meta.period;
  if(el('nr-p1sub'))el('nr-p1sub').textContent='Month and year-to-date position against '+R.meta.year+' targets';
}
function lineChart(id,d,dec,tgt,tmax){
  var mm=R.months;
  mk(id,{type:'line',data:{labels:mm,datasets:[
    {label:'Rolling',data:d.roll,borderColor:C.roll,backgroundColor:C.roll,borderWidth:2,pointRadius:2.4,tension:.3},
    {label:'YTD '+R.meta.prevYear,data:d.ytdLy,borderColor:C.prev,backgroundColor:C.prev,borderWidth:1.8,pointRadius:0,borderDash:[3,3],tension:.3},
    {label:'YTD '+R.meta.year,data:d.ytd,borderColor:C.cur,backgroundColor:'rgba(192,57,43,.09)',borderWidth:2.6,pointRadius:2.8,fill:true,tension:.3},
    {label:'Target',data:mm.map(function(){return tgt;}),borderColor:C.navy,borderWidth:1.4,pointRadius:0,borderDash:[6,4]}
  ]},options:{scales:{
      x:{grid:{display:false},ticks:{font:{size:8.5,family:FF},color:'#94a3b8',maxRotation:0,autoSkip:false,callback:function(v,i){return i%2===0?mm[i]:'';}}},
      y:{beginAtZero:true,suggestedMax:tmax,grid:grid(),ticks:{font:{size:9,family:FF},color:'#94a3b8',callback:function(v){return dec===0?K(v):v;}}}},
    plugins:{tooltip:{callbacks:{label:function(c){return c.dataset.label+': '+(c.raw===null?'—':nf(c.raw,dec));}}},
      datalabels:{display:function(c){return c.datasetIndex===2&&c.dataIndex===lastIdx(d.ytd);},align:'top',offset:5,color:C.cur,font:{weight:800,size:10,family:FF},formatter:function(v){return nf(v,dec);}}}}});
}
function renderMonthly(){
  var s=R.summary,f=function(n){return (R.summary.find(function(x){return x.metric.toUpperCase().indexOf(n)>=0;})||{}).target;};
  lineChart('nr-c-saidi',R.monthly.saidi,1,f('SAIDI'),200);
  lineChart('nr-c-saifi',R.monthly.saifi,2,f('SAIFI'),2.25);
  lineChart('nr-c-out',R.monthly.outages,0,f('OUTAGE'),45000);
  if(el('nr-lg'))el('nr-lg').innerHTML=[['YTD '+R.meta.year,C.cur],['YTD '+R.meta.prevYear,C.prev],['Rolling ('+R.meta.year+')',C.roll],['Target',C.navy]]
    .map(function(x){return '<div><i style="background:'+x[1]+'"></i>'+x[0]+'</div>';}).join('');
}
function renderDcc(){
  var s=R.summary;
  mk('nr-c-dcc',{type:'bar',data:{labels:s.map(function(x){return x.metric;}),datasets:[
    {label:R.meta.monthLabel+' '+R.meta.year,data:s.map(function(x){return x.cur;}),backgroundColor:C.cur,borderRadius:3},
    {label:R.meta.monthLabel+' '+R.meta.prevYear,data:s.map(function(x){return x.prev;}),backgroundColor:C.prev,borderRadius:3},
    {label:R.meta.monthLabel+' Target',data:s.map(function(x){return x.mtarget;}),backgroundColor:C.navy,borderRadius:3}
  ]},options:{scales:{x:{grid:{display:false},ticks:{font:{size:10,weight:700,family:FF},color:'#0c1e35'}},
      y:{type:'logarithmic',grid:grid(),ticks:{font:{size:9,family:FF},color:'#94a3b8',callback:function(v){return [0.1,1,10,100,1000,10000].indexOf(v)>=0?K(v):'';}}}},
    plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:9,boxHeight:9,font:{size:10,family:FF},padding:10,usePointStyle:true,pointStyle:'rectRounded'}},
      datalabels:{display:true,anchor:'end',align:'top',offset:1,color:'#334155',font:{weight:700,size:9,family:FF},formatter:function(v,c){return nf(v,s[c.dataIndex].dec);}}}}});
  if(el('nr-dccsub'))el('nr-dccsub').textContent=R.meta.monthLabel+' '+R.meta.year+' vs '+R.meta.monthLabel+' '+R.meta.prevYear+' vs month target · log scale';
  if(el('nr-dcctab'))el('nr-dcctab').innerHTML='<thead><tr><th>Metric</th><th>'+R.meta.monthLabel+' '+R.meta.year+'</th><th>'+R.meta.monthLabel+' '+R.meta.prevYear+'</th><th>Target</th><th>vs LY</th></tr></thead><tbody>'+
    s.map(function(x){var dv=x.prev?(x.cur-x.prev)/x.prev*100:null;
      return '<tr><td>'+x.metric+'</td><td>'+nf(x.cur,x.dec)+'</td><td style="color:#6b7280">'+nf(x.prev,x.dec)+'</td><td style="color:#6b7280">'+nf(x.mtarget,x.dec)+'</td>'+
        '<td class="'+(dv>0?'nr-up':'nr-down')+'">'+(dv===null?'—':(dv>0?'+':'')+dv.toFixed(1)+'%')+'</td></tr>';}).join('')+'</tbody>';
}
function renderOutVolt(){
  var d=R.outageVoltage,tot=d.reduce(function(a,b){return a+(b.v||0);},0),cols=[C.navy,C.roll,C.cur];
  mk('nr-c-outvolt',{type:'doughnut',data:{labels:d.map(function(x){return x.k;}),datasets:[{data:d.map(function(x){return x.v;}),backgroundColor:d.map(function(x,i){return cols[i%3];}),borderWidth:2,borderColor:'#fff',cutout:'52%'}]},
    options:{plugins:{legend:{display:true,position:'right',labels:{boxWidth:9,boxHeight:9,font:{size:10.5,family:FF},padding:9,usePointStyle:true,pointStyle:'rectRounded',
        generateLabels:function(){return d.map(function(x,i){return{text:x.k+'  '+nf(x.v,0),fillStyle:cols[i%3],strokeStyle:'transparent',pointStyle:'rectRounded',index:i};});}}},
      datalabels:{display:function(c){return tot&&c.dataset.data[c.dataIndex]/tot>0.03;},color:'#fff',font:{weight:800,size:10,family:FF},formatter:function(v){return (v/tot*100).toFixed(1)+'%';}},
      tooltip:{callbacks:{label:function(c){return c.label+': '+nf(c.raw,0)+' ('+(c.raw/tot*100).toFixed(1)+'%)';}}}}}});
  if(el('nr-ovsub'))el('nr-ovsub').textContent='YTD '+R.meta.year+' · total '+nf(tot,0)+' outages by voltage level';
}

/* ── page 2 ── */
function typeChart(id,k,dec){
  var d=R.classType[k];
  mk(id,{type:'bar',data:{labels:[String(R.meta.year),String(R.meta.prevYear)],datasets:[
    {label:'Planned',data:[d.cur.planned,d.prev.planned],backgroundColor:C.pl,borderRadius:3,barPercentage:.62},
    {label:'Unplanned',data:[d.cur.unplanned,d.prev.unplanned],backgroundColor:C.unpl,borderRadius:3,barPercentage:.62}
  ]},options:{indexAxis:'y',scales:{x:{stacked:true,beginAtZero:true,grid:grid(),ticks:{font:{size:9,family:FF},color:'#94a3b8'}},
      y:{stacked:true,grid:{display:false},ticks:{font:{size:11,weight:800,family:FF},color:'#0c1e35'}}},
    plugins:{legend:{display:true,position:'bottom',labels:{boxWidth:9,boxHeight:9,font:{size:10,family:FF},padding:12,usePointStyle:true,pointStyle:'rectRounded'}},
      datalabels:{display:true,color:'#fff',font:{weight:800,size:10.5,family:FF},formatter:function(v){return nf(v,dec);}}}}});
}
function voltChart(id,k){
  var d=R.classVoltage[k],cols=[C.roll,C.navy,C.cur];
  mk(id,{type:'doughnut',data:{labels:d.map(function(x){return x.k;}),datasets:[{data:d.map(function(x){return x.v;}),backgroundColor:d.map(function(x,i){return cols[i%3];}),borderWidth:2,borderColor:'#fff',cutout:'50%'}]},
    options:{plugins:{legend:lgd(10),datalabels:{display:true,color:'#fff',font:{weight:800,size:11,family:FF},formatter:function(v){return v+'%';}}}}});
  if(CH[id])CH[id].options.plugins.legend.position='bottom';
}
function renderGovOut(){
  var g=R.governorates.slice().sort(function(a,b){return b.mv26-a.mv26;});
  mk('nr-c-govout',{type:'bar',data:{labels:g.map(function(x){return x.gov;}),datasets:[
    {label:String(R.meta.year),data:g.map(function(x){return x.mv26;}),backgroundColor:C.cur,borderRadius:3},
    {label:String(R.meta.prevYear),data:g.map(function(x){return x.mv25;}),backgroundColor:C.prev,borderRadius:3}
  ]},options:{scales:{x:{grid:{display:false},ticks:{font:{size:8.5,family:FF},color:'#94a3b8',maxRotation:38,minRotation:38,autoSkip:false}},
      y:{beginAtZero:true,grid:grid(),ticks:{font:{size:9,family:FF},color:'#94a3b8'}}},
    plugins:{legend:{display:true,position:'top',align:'end',labels:{boxWidth:9,boxHeight:9,font:{size:10,family:FF},usePointStyle:true,pointStyle:'rectRounded'}},
      datalabels:{display:function(c){return c.datasetIndex===0;},anchor:'end',align:'top',offset:2,color:C.cur,font:{weight:800,size:9,family:FF},
        formatter:function(v,c){var p=g[c.dataIndex].mv25;return p?(v>=p?'+':'')+Math.round((v-p)/p*100)+'%':nf(v,0);}}}}});
  if(el('nr-govsub'))el('nr-govsub').textContent='Count of outages — '+R.meta.year+' vs '+R.meta.prevYear+' · labels show year-on-year change';
}

/* ── page 3 ── */
function tier(rank,n){return rank<=Math.ceil(n/3)?'#27ae60':rank<=Math.ceil(n*2/3)?'#e67e22':'#c0392b';}
function renderGovMap(){
  var stage=el('nr-mstage'),cL=el('nr-mL'),cR=el('nr-mR'),svg=el('nr-mlead');
  if(!stage||!cL||!cR)return;
  if(el('nr-p3y'))el('nr-p3y').textContent=R.meta.year;
  if(typeof L==='undefined'){stage.innerHTML='<div style="padding:40px;text-align:center;font-size:12px;color:#6b7280">Map library unavailable — check your connection and refresh.</div>';return;}
  if(MAP){try{MAP.remove();}catch(e){}MAP=null;}
  MRK=[];
  var g=R.governorates.slice().sort(function(a,b){return a.rank-b.rank;}),n=g.length||1,idx={};
  g.forEach(function(x){idx[gkey(x.gov)]=x;});
  var ent=[];
  GEO.forEach(function(p){
    var d=idx[gkey(p[0])];if(!d)return;
    ent.push({d:d,ll:[p[1],p[2]],side:p[3],col:tier(d.rank,n)});
  });
  if(!ent.length){stage.innerHTML='<div style="padding:40px;text-align:center;font-size:12px;color:#6b7280">No governorate rows recognised in the loaded workbook.</div>';return;}
  function card(e){
    var x=e.d;
    return '<div class="nr-mc" data-k="'+gkey(x.gov)+'">'+
      '<div class="nr-mc-t"><div class="nr-mc-r" style="background:'+e.col+'">'+x.rank+'</div>'+
      '<div class="nr-mc-n" title="'+x.gov+'">'+x.gov+'</div></div>'+
      '<div class="nr-mc-m"><div><span>SAIDI</span><b>'+auto(x.saidi)+'</b></div>'+
      '<div><span>SAIFI</span><b>'+auto(x.saifi)+'</b></div>'+
      '<div class="nr-fd'+(x.fdr?'':' z')+'" title="Feeders with 3 or more unplanned outages"><span>WORST FDRS</span><b>'+x.fdr+'</b></div></div></div>';
  }
  var byLat=function(a,b){return b.ll[0]-a.ll[0];};
  cL.innerHTML=ent.filter(function(e){return e.side==='L';}).sort(byLat).map(card).join('');
  cR.innerHTML=ent.filter(function(e){return e.side==='R';}).sort(byLat).map(card).join('');

  MAP=L.map('nr-mmap',{center:[21.6,56.6],zoom:5,zoomControl:false,attributionControl:false,
    dragging:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,touchZoom:false,tap:false});
  L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',{className:'basemap-grey',maxZoom:12,opacity:.55}).addTo(MAP);
  var vals=ent.map(function(e){return e.d.saidi||0;}),mx=Math.max.apply(null,vals)||1;
  ent.forEach(function(e){
    var m=L.circleMarker(e.ll,{radius:5+Math.sqrt((e.d.saidi||0)/mx)*8,color:'#fff',weight:1.6,fillColor:e.col,fillOpacity:.92});
    m.bindTooltip(e.d.gov+' — SAIDI '+auto(e.d.saidi)+' · SAIFI '+auto(e.d.saifi),{direction:'top',className:'nr-mtt',offset:[0,-6]});
    L.marker(e.ll,{interactive:false,keyboard:false,zIndexOffset:500,icon:L.divIcon({className:'',iconSize:[0,0],html:'<div class="om-glbl" style="font-size:9.5px;font-weight:700;color:#0c1e35;display:inline-block;width:max-content;line-height:13px;white-space:nowrap;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff,0 0 3px #fff;">'+window.omShortGov(e.d.gov)+'</div>'})}).addTo(MAP);
    m.addTo(MAP);e.m=m;MRK.push(e);
  });
  try{MAP.fitBounds(L.latLngBounds(ent.map(function(e){return e.ll;})).pad(0.18));}catch(e){}
  window.omDeclutterBind(MAP);setTimeout(function(){window.omDeclutter(MAP);},60);

  function leaders(){
    if(!MAP||!svg)return;
    var sr=stage.getBoundingClientRect(),mr=el('nr-mmap').getBoundingClientRect();
    svg.setAttribute('viewBox','0 0 '+sr.width+' '+sr.height);
    svg.innerHTML=MRK.map(function(e){
      var c=stage.querySelector('.nr-mc[data-k="'+gkey(e.d.gov)+'"]');if(!c)return'';
      var p=MAP.latLngToContainerPoint(e.m.getLatLng()),cr=c.getBoundingClientRect();
      var mx2=(mr.left-sr.left)+p.x,my2=(mr.top-sr.top)+p.y;
      var cx=(e.side==='L'?cr.right:cr.left)-sr.left,cy=cr.top-sr.top+cr.height/2;
      var mid=(cx+mx2)/2;
      return '<path d="M'+cx+' '+cy+' C'+mid+' '+cy+' '+mid+' '+my2+' '+mx2+' '+my2+'" fill="none" stroke="'+e.col+'" stroke-width="1.2" stroke-dasharray="3 3" opacity=".55"></path>'+
        '<circle cx="'+cx+'" cy="'+cy+'" r="2.4" fill="'+e.col+'"></circle>';
    }).join('');
  }
  setTimeout(function(){try{MAP.invalidateSize();}catch(e){}leaders();},220);
  MAP.on('zoomend moveend',leaders);
}
function renderGovNpi(){
  var g=R.governorates.slice().sort(function(a,b){return b.saidi-a.saidi;});
  mk('nr-c-govnpi',{type:'bar',data:{labels:g.map(function(x){return x.gov;}),datasets:[
    {label:'SAIDI',data:g.map(function(x){return x.saidi;}),backgroundColor:C.cur,borderRadius:3,order:2},
    {type:'line',label:'SAIFI',data:g.map(function(x){return x.saifi;}),borderColor:C.navy,backgroundColor:C.navy,borderWidth:2,pointRadius:3.5,yAxisID:'y2',order:1,tension:.25}
  ]},options:{scales:{x:{grid:{display:false},ticks:{font:{size:9.5,family:FF},color:'#94a3b8',maxRotation:26,minRotation:26}},
      y:{beginAtZero:true,grid:grid(),title:{display:true,text:'SAIDI (minutes)',font:{size:9.5,weight:700,family:FF},color:'#6b7280'},ticks:{font:{size:9,family:FF},color:'#94a3b8'}},
      y2:{position:'right',beginAtZero:true,grid:{display:false},title:{display:true,text:'SAIFI',font:{size:9.5,weight:700,family:FF},color:'#6b7280'},ticks:{font:{size:9,family:FF},color:'#94a3b8'}}},
    plugins:{legend:{display:true,position:'top',align:'end',labels:{boxWidth:9,boxHeight:9,font:{size:10,family:FF},usePointStyle:true,pointStyle:'rectRounded'}},
      datalabels:{display:function(c){return c.datasetIndex===0;},anchor:'end',align:'top',offset:2,color:'#334155',font:{weight:700,size:9,family:FF},formatter:function(v){return auto(v);}}}}});
}

/* ── pages 4-5 ── */
function renderZones(k,hostId,chartId){
  var z=R.zones[k]||[],dec=k==='SAIDI'?0:2;
  if(el(hostId))el(hostId).innerHTML=z.map(function(x){
    var over=x.rolling>x.target,pct=x.target?Math.min(x.rolling/x.target*100,100):0;
    return '<div class="nr-zc"><div class="nr-zch"><b>'+x.zone+'</b><span>'+k+'</span></div><div class="nr-zcb">'+
      '<div class="nr-zr"><div class="nr-zrk">Rolling</div><div class="nr-zrv">'+nf(x.rolling,dec)+'</div></div>'+
      '<div class="nr-zr"><div class="nr-zrk">Target '+R.meta.year+'</div><div class="nr-zrv" style="color:#6b7280">'+nf(x.target,dec)+'</div></div>'+
      '<div class="nr-zr"><div class="nr-zrk">Improvement %</div><div class="nr-zrv" style="color:'+(x.imp<0?'#27ae60':'#c0392b')+'">'+(x.imp>0?'+':'')+nf(x.imp,1)+'</div></div>'+
      '<div class="nr-zbar"><i style="width:'+pct+'%;background:'+(over?'linear-gradient(90deg,#c0392b,#e74c3c)':'linear-gradient(90deg,#1e8449,#27ae60)')+'"></i></div>'+
      '<div class="nr-zbl"><span>0</span><span>Target '+nf(x.target,dec)+'</span></div>'+
      '<div class="nr-badge '+(over?'pen':'ok')+'"><div><span>APSR target compliance status</span>'+(over?'Penalty':'Less than target')+'</div></div>'+
    '</div></div>';
  }).join('');
  mk(chartId,{type:'bar',data:{labels:z.map(function(x){return x.zone;}),datasets:[
    {label:'Rolling',data:z.map(function(x){return x.rolling;}),backgroundColor:z.map(function(x){return x.rolling>x.target?C.cur:C.green;}),borderRadius:4,barPercentage:.55},
    {label:'Target '+R.meta.year,data:z.map(function(x){return x.target;}),backgroundColor:C.navy,borderRadius:4,barPercentage:.55}
  ]},options:{scales:{x:{grid:{display:false},ticks:{font:{size:11,weight:700,family:FF},color:'#0c1e35'}},y:{beginAtZero:true,grid:grid(),ticks:{font:{size:9,family:FF},color:'#94a3b8'}}},
    plugins:{legend:{display:true,position:'top',align:'end',labels:{boxWidth:9,boxHeight:9,font:{size:10,family:FF},usePointStyle:true,pointStyle:'rectRounded'}},
      datalabels:{display:true,anchor:'end',align:'top',offset:2,color:'#334155',font:{weight:800,size:10,family:FF},formatter:function(v){return nf(v,dec);}}}}});
}
function renderNotes(){
  var map={'nr-n1':'p1','nr-n2':'p2','nr-n3':'p3','nr-n4':'p4','nr-n5':'p4'};
  Object.keys(map).forEach(function(id){var e=el(id);if(!e)return;
    e.innerHTML=((R.notes||{})[map[id]]||[]).map(function(t){return '<p>'+t+'</p>';}).join('');});
}

function renderAll(){
  if(el('nr-plabel'))el('nr-plabel').textContent=String(R.meta.period).toUpperCase();
  if(el('nr-src'))el('nr-src').textContent=R.meta.source;
  var host=document.getElementById('view-npi-summary');
  if(host)host.querySelectorAll('[data-month]').forEach(function(e){e.textContent=String(R.meta.period).toUpperCase();});
  Object.keys(CH).forEach(function(k){try{CH[k].destroy();}catch(e){}});CH={};
  if(MAP){try{MAP.remove();}catch(e){}MAP=null;}
  dirty={1:1,2:1,3:1,4:1,5:1,6:1};
  renderNotes();
  renderPage(active);
}

/* ── monthly archive · Cloudflare Worker KV + local cache ───────────────
   Months are published to the same Worker the main dashboard uses, under
   its own /npi routes, so a month entered on one device shows on every
   other. localStorage stays as an offline cache and as the fallback when
   the Worker is unreachable (or the /npi routes are not deployed yet). */
function loadArch(){try{return JSON.parse(localStorage.getItem(ARCH))||{};}catch(e){return{};}}
function putArch(a){try{localStorage.setItem(ARCH,JSON.stringify(a));}catch(e){}}
function pkey(meta){
  var y=+(meta&&meta.year)||0,i=(meta&&meta.monthIndex!==undefined&&meta.monthIndex!==null)?+meta.monthIndex+1:1;
  return y+':'+(i<10?'0'+i:''+i);
}
var CLOUD={on:false,idx:[],ok:null};
function wurl(){return window.WORKER_URL||'';}
function wenv(){return window.WORKER_ENV||'prod';}
function wsec(){
  if(window.WORKER_SECRET)return window.WORKER_SECRET;
  try{return localStorage.getItem('nedc_worker_secret')||'';}catch(e){return '';}
}
function cloudGet(path){
  if(!CLOUD.on)return Promise.reject(new Error('no worker'));
  return fetch(wurl()+path+(path.indexOf('?')<0?'?':'&')+'env='+wenv()+'&t='+Date.now())
    .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});
}
function cloudIndex(){
  return cloudGet('/npi/index').then(function(a){
    CLOUD.idx=Array.isArray(a)?a:[];CLOUD.ok=true;cloudChip();return CLOUD.idx;
  },function(e){CLOUD.ok=false;cloudChip(e);throw e;});
}
function cloudMonth(k){
  var p=String(k).split(':');
  return cloudGet('/npi/archive/'+p[0]+'/'+p[1]).then(function(d){return (d&&d.npi_data)?d.npi_data:d;});
}
function cloudSave(data){
  if(!CLOUD.on)return Promise.reject(new Error('no worker'));
  return fetch(wurl()+'/npi/save?env='+wenv(),{method:'POST',
    headers:{'Content-Type':'application/json','X-Admin-Secret':wsec(),'X-Dashboard-Env':wenv()},
    body:JSON.stringify({npi_data:data,key:pkey(data.meta),period:data.meta.period,updatedAt:new Date().toISOString()})
  }).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);CLOUD.ok=true;return true;});
}
function cloudChip(err){
  var c=el('nr-cloud');if(!c)return;
  if(!CLOUD.on){c.className='nr-cloud off';c.textContent='This device only';c.title='No Worker configured — months are kept in this browser';return;}
  if(CLOUD.ok===true){c.className='nr-cloud on';c.textContent='Cloud';c.title='Months are published to the Worker KV — available on every device';return;}
  if(CLOUD.ok===false){
    var missing=err&&/404/.test(String(err.message));
    c.className='nr-cloud bad';c.textContent=missing?'Cloud route missing':'Cloud offline';
    c.title=missing?'The Worker has no /npi routes yet — deploy worker-npi-routes.js. Months are kept in this browser meanwhile.'
      :'The Worker could not be reached — months are kept in this browser and republished on the next save.';
    return;
  }
  c.className='nr-cloud';c.textContent='Syncing…';c.title='';
}
function archive(data){
  var a=loadArch(),k=pkey(data.meta);
  a[k]=JSON.parse(JSON.stringify(data));
  a[k].meta.savedAt=new Date().toISOString();
  putArch(a);
  /* only the newest month becomes the tab's landing dataset */
  var keys=Object.keys(a).sort();
  if(keys[keys.length-1]===k){try{localStorage.setItem(STORE,JSON.stringify(data));}catch(e){}}
  if(CLOUD.on)cloudSave(a[k]).then(function(){cloudChip();cloudIndex().then(periodMenu,function(){});},
    function(e){CLOUD.ok=false;cloudChip(e);periodMenu();});
  return k;
}
function monthList(){
  var a=loadArch(),seen={},out=[];
  CLOUD.idx.forEach(function(e){
    if(!e||!e.key||seen[e.key])return;seen[e.key]=1;
    out.push({k:e.key,period:e.period||(a[e.key]&&a[e.key].meta.period)||e.key,when:e.updatedAt,cloud:true});
  });
  Object.keys(a).forEach(function(k){
    if(seen[k])return;seen[k]=1;
    out.push({k:k,period:a[k].meta.period,when:a[k].meta.savedAt,cloud:false});
  });
  return out.sort(function(x,y){return x.k<y.k?1:x.k>y.k?-1:0;});
}
function periodMenu(){
  var m=el('nr-pmenu');if(!m)return;
  var list=monthList(),cur=pkey(R.meta);
  if(!list.length){m.innerHTML='<div class="nr-mhd">Reporting period</div><button data-k="" class="on"><span>'+String(R.meta.period).toUpperCase()+'</span>Not yet saved — save in Data Update to keep it</button>';return;}
  m.innerHTML='<div class="nr-mhd">Reporting period · '+list.length+' saved</div>'+list.map(function(x,i){
    var when=x.when?new Date(x.when).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'';
    return '<button data-k="'+x.k+'"'+(x.k===cur?' class="on"':'')+'><span>'+String(x.period).toUpperCase()+'</span>'+
      (i===0?'Latest':'Archived')+(when?' · '+when:'')+' · '+(x.cloud?'cloud':'this device')+'</button>';
  }).join('');
}
function showMonth(k){
  var a=loadArch();
  if(a[k]){R=JSON.parse(JSON.stringify(a[k]));renderAll();}
  cloudMonth(k).then(function(d){
    if(!d||!d.summary||!d.meta)return;
    var b=loadArch();b[k]=d;putArch(b);
    if(pkey(R.meta)===k||!a[k]){R=JSON.parse(JSON.stringify(d));renderAll();}
  },function(){});
}
/* first open: whichever month is newest wins, cloud or local */
function cloudBoot(){
  if(!CLOUD.on)return;
  cloudIndex().then(function(idx){
    if(!idx.length){periodMenu();return;}
    var newest=idx.slice().sort(function(a,b){return a.key<b.key?1:a.key>b.key?-1:0;})[0];
    var localKeys=Object.keys(loadArch()).sort(),localTop=localKeys[localKeys.length-1]||'';
    periodMenu();
    if(newest.key>=localTop)showMonth(newest.key);
  },function(){periodMenu();});
}

/* Data Update sub-tab: the editor owns its own working copy and calls back
   through this bridge, so the report pages rebuild from the saved figures. */
var EDIT_API={
  get:function(){return R;},
  save:function(d){R=d;archive(R);refresh();},
  reset:function(){
    /* sample figures are not filed as a month — the archive keeps real months only */
    R=JSON.parse(JSON.stringify(window.NPI_DEFAULT));
    try{localStorage.removeItem(STORE);}catch(e){}
    refresh();
  },
  excel:function(){el('nr-ov').classList.add('on');},
  template:template
};
/* repaint the shell and mark the report pages for a rebuild, without touching
   the editor's own page (6) so an open editor keeps its scroll and focus */
function refresh(){
  if(el('nr-plabel'))el('nr-plabel').textContent=String(R.meta.period).toUpperCase();
  if(el('nr-src'))el('nr-src').textContent=R.meta.source;
  var host=document.getElementById('view-npi-summary');
  if(host)host.querySelectorAll('[data-month]').forEach(function(e){e.textContent=String(R.meta.period).toUpperCase();});
  Object.keys(CH).forEach(function(k){try{CH[k].destroy();}catch(e){}});CH={};
  if(MAP){try{MAP.remove();}catch(e){}MAP=null;}
  dirty={1:1,2:1,3:1,4:1,5:1,6:0};
  renderNotes();periodMenu();
}

/* Charts are built page by page, only while their sheet is visible — a chart
   created inside a display:none subtree measures 0x0 and never recovers. */
function renderPage(n){
  if(!dirty[n])return;dirty[n]=0;
  if(n===1){renderKpis();renderMonthly();renderDcc();renderOutVolt();}
  else if(n===2){typeChart('nr-c-tsaidi','SAIDI',1);typeChart('nr-c-tsaifi','SAIFI',2);voltChart('nr-c-vsaidi','SAIDI');voltChart('nr-c-vsaifi','SAIFI');renderGovOut();}
  else if(n===3){renderGovMap();renderGovNpi();}
  else if(n===4){renderZones('SAIDI','nr-zsaidi','nr-c-zsaidi');}
  else if(n===5){renderZones('SAIFI','nr-zsaifi','nr-c-zsaifi');}
  else if(n===6){if(window.NPI_EDIT)window.NPI_EDIT.mount(el('nr-edit'),EDIT_API);}
}
function activate(n,render){
  var host=document.getElementById('view-npi-summary');if(!host)return;
  host.querySelectorAll('.nr-tab').forEach(function(x){x.classList.toggle('on',x.dataset.p===String(n));});
  host.querySelectorAll('.nr-sheet').forEach(function(x){x.classList.toggle('on',x.id==='nr-p'+n);});
  active=n;try{sessionStorage.setItem('nr_page',String(n));}catch(e){}
  if(render){dirty[n]=1;renderPage(n);}
}
var rzT=null;
window.addEventListener('resize',function(){
  if(!built)return;clearTimeout(rzT);
  rzT=setTimeout(function(){dirty[active]=1;renderPage(active);},220);
});

/* ── excel ── */
function say(t,ok){var m=el('nr-msg');if(!m)return;m.style.display='block';m.className=ok?'nr-mok':'nr-merr';m.textContent=t;}
function norm(v){return String(v===null||v===undefined?'':v).toLowerCase().replace(/[^a-z0-9]/g,'');}
function num(v){if(v===null||v===undefined||v==='')return null;var n=parseFloat(String(v).replace(/,/g,''));return isNaN(n)?null:n;}
function txt(v){return v===null||v===undefined?'':String(v).replace(/\s+/g,' ').trim();}
function sheetOf(wb,hint){var n=wb.SheetNames.find(function(s){return norm(s).indexOf(norm(hint))>=0;});return n?XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,defval:null}):null;}
function headerRow(rows,key){for(var i=0;i<Math.min(rows.length,12);i++){var r=rows[i];if(!r)continue;for(var j=0;j<r.length;j++)if(norm(r[j])===norm(key))return{i:i,r:r,c:j};}return null;}
function colMap(hdr,dict){var m={};hdr.forEach(function(h,i){var n=norm(h);Object.keys(dict).forEach(function(k){if(dict[k].indexOf(n)>=0&&m[k]===undefined)m[k]=i;});});return m;}

function parseWb(wb){
  var found=[],skipped=[];
  var s=sheetOf(wb,'Summary');
  if(s){
    for(var i=0;i<Math.min(s.length,6);i++){if(s[i]&&norm(s[i][0])==='period'&&s[i][1]){R.meta.period=txt(s[i][1]);
      var my=txt(s[i][1]).match(/(\d{4})/);if(my){R.meta.year=+my[1];R.meta.prevYear=+my[1]-1;}
      var ml=txt(s[i][1]).match(/^([A-Za-z]+)/);if(ml)R.meta.monthLabel=ml[1].slice(0,3).toUpperCase();}}
    var h=headerRow(s,'Metric');
    if(h){
      var cm=colMap(h.r,{cur:['currentmonth','current'],prev:['prevyearmonth','prioryearmonth','lastyearmonth','previousyearmonth'],mtarget:['monthtarget'],ytd:['ytd'],target:['annualtarget','yeartarget'],gmax:['gaugemax','scalemax','max']});
      var out=[];
      for(var r=h.i+1;r<s.length;r++){
        var row=s[r];if(!row||!txt(row[h.c]))continue;
        var name=txt(row[h.c]),v=num(row[cm.cur]);if(v===null)continue;
        var base=window.NPI_DEFAULT.summary.find(function(x){return norm(x.metric)===norm(name);});
        var ytd=num(row[cm.ytd]),tg=num(row[cm.target]);
        out.push({metric:name,cur:v,prev:num(row[cm.prev]),mtarget:num(row[cm.mtarget]),ytd:ytd,target:tg,
          gmax:num(row[cm.gmax])||Math.max(ytd||0,tg||0)*1.3||1,dec:base?base.dec:(Math.abs(v)<3?2:Math.abs(v)<100?1:0)});
      }
      if(out.length){R.summary=out;found.push('Summary');}else skipped.push('Summary');
    }else skipped.push('Summary');
  }else skipped.push('Summary');

  var m=sheetOf(wb,'Monthly');
  if(m){
    var mh=headerRow(m,'Month');
    if(mh){
      var mc=colMap(mh.r,{saidiYtd:['saidiytd'],saidiLy:['saidiytdly','saidiytdlastyear','saidiytdprior'],saidiRoll:['saidirolling','saidiroll'],
        saifiYtd:['saifiytd'],saifiLy:['saifiytdly','saifiytdlastyear','saifiytdprior'],saifiRoll:['saifirolling','saifiroll'],
        outYtd:['outagesytd','outageytd'],outLy:['outagesytdly','outageytdly','outagesytdlastyear'],outRoll:['outagesrolling','outagerolling']});
      var bl=function(){return R.months.map(function(){return null;});};
      var d={saidi:{ytd:bl(),ytdLy:bl(),roll:bl()},saifi:{ytd:bl(),ytdLy:bl(),roll:bl()},outages:{ytd:bl(),ytdLy:bl(),roll:bl()}},any=false;
      for(var r2=mh.i+1;r2<m.length;r2++){
        var row2=m[r2];if(!row2)continue;
        var mi=R.months.indexOf(txt(row2[mh.c]).slice(0,3).toUpperCase());if(mi<0)continue;any=true;
        d.saidi.ytd[mi]=num(row2[mc.saidiYtd]);d.saidi.ytdLy[mi]=num(row2[mc.saidiLy]);d.saidi.roll[mi]=num(row2[mc.saidiRoll]);
        d.saifi.ytd[mi]=num(row2[mc.saifiYtd]);d.saifi.ytdLy[mi]=num(row2[mc.saifiLy]);d.saifi.roll[mi]=num(row2[mc.saifiRoll]);
        d.outages.ytd[mi]=num(row2[mc.outYtd]);d.outages.ytdLy[mi]=num(row2[mc.outLy]);d.outages.roll[mi]=num(row2[mc.outRoll]);
      }
      if(any){R.monthly=d;found.push('Monthly');}else skipped.push('Monthly');
    }else skipped.push('Monthly');
  }else skipped.push('Monthly');

  var cs=sheetOf(wb,'Classification');
  if(cs){
    var ch=headerRow(cs,'Section');
    if(ch){
      var cc=colMap(ch.r,{key:['key','item'],cur:['currentyear','current','value'],prev:['prioryear','previousyear','lastyear']});
      var ct={SAIDI:{cur:{},prev:{}},SAIFI:{cur:{},prev:{}}},cv={SAIDI:[],SAIFI:[]},ovv=[],hit=false;
      for(var r3=ch.i+1;r3<cs.length;r3++){
        var row3=cs[r3];if(!row3)continue;
        var sec=norm(row3[ch.c]),key=txt(row3[cc.key]),v1=num(row3[cc.cur]),v2=num(row3[cc.prev]);
        if(!sec||!key)continue;hit=true;
        var nk=norm(key),kind=nk.indexOf('unplan')>=0?'unplanned':(nk.indexOf('plan')>=0?'planned':null);
        if(sec.indexOf('type')>=0&&kind){var ind=sec.indexOf('saifi')>=0?'SAIFI':'SAIDI';ct[ind].cur[kind]=v1;ct[ind].prev[kind]=v2;}
        else if(sec.indexOf('voltage')>=0&&(sec.indexOf('saidi')>=0||sec.indexOf('saifi')>=0))cv[sec.indexOf('saifi')>=0?'SAIFI':'SAIDI'].push({k:key,v:v1});
        else if(sec.indexOf('outage')>=0)ovv.push({k:key,v:v1});
      }
      if(hit){
        if(ct.SAIDI.cur.planned!==undefined||ct.SAIFI.cur.planned!==undefined)R.classType=ct;
        if(cv.SAIDI.length)R.classVoltage.SAIDI=cv.SAIDI;
        if(cv.SAIFI.length)R.classVoltage.SAIFI=cv.SAIFI;
        if(ovv.length)R.outageVoltage=ovv;
        found.push('Classification');
      }else skipped.push('Classification');
    }else skipped.push('Classification');
  }else skipped.push('Classification');

  var gs=sheetOf(wb,'Governorate');
  if(gs){
    var gh=headerRow(gs,'Governorate');
    if(gh){
      var gc=colMap(gh.r,{rank:['rank'],mv26:['mvunplannedcurrent','mvunplannedcurrentyear'],mv25:['mvunplannedprior','mvunplannedprioryear'],saidi:['saidiytd','saidi'],saifi:['saifiytd','saifi'],fdr:['worstfdrs','worstfdr','fdrs']});
      var gl=[];
      for(var r4=gh.i+1;r4<gs.length;r4++){
        var row4=gs[r4];if(!row4||!txt(row4[gh.c]))continue;
        gl.push({gov:txt(row4[gh.c]),rank:num(row4[gc.rank])||gl.length+1,mv26:num(row4[gc.mv26])||0,mv25:num(row4[gc.mv25])||0,
          saidi:num(row4[gc.saidi])||0,saifi:num(row4[gc.saifi])||0,fdr:num(row4[gc.fdr])||0});
      }
      if(gl.length){R.governorates=gl;found.push('Governorates');}else skipped.push('Governorates');
    }else skipped.push('Governorates');
  }else skipped.push('Governorates');

  var zs=sheetOf(wb,'Zone');
  if(zs){
    var zh=headerRow(zs,'Zone');
    if(zh){
      var zc=colMap(zh.r,{ind:['indicator'],rolling:['rolling'],target:['target','target2026'],imp:['improvement','improvementpct']});
      var zd={SAIDI:[],SAIFI:[]};
      for(var r5=zh.i+1;r5<zs.length;r5++){
        var row5=zs[r5];if(!row5||!txt(row5[zh.c]))continue;
        zd[norm(row5[zc.ind]).indexOf('saifi')>=0?'SAIFI':'SAIDI'].push({zone:txt(row5[zh.c]),rolling:num(row5[zc.rolling]),target:num(row5[zc.target]),imp:num(row5[zc.imp])||0});
      }
      if(zd.SAIDI.length||zd.SAIFI.length){
        if(zd.SAIDI.length)R.zones.SAIDI=zd.SAIDI;
        if(zd.SAIFI.length)R.zones.SAIFI=zd.SAIFI;
        found.push('Zones');
      }else skipped.push('Zones');
    }else skipped.push('Zones');
  }else skipped.push('Zones');
  var ns=sheetOf(wb,'Notes');
  if(ns){
    var nh=headerRow(ns,'Section');
    if(nh){
      var nc=colMap(nh.r,{note:['note','text','footnote']});
      var nn={p1:[],p2:[],p3:[],p4:[]},nhit=false;
      for(var r6=nh.i+1;r6<ns.length;r6++){
        var row6=ns[r6];if(!row6)continue;
        var nsec=norm(row6[nh.c]),ntx=txt(row6[nc.note]);if(!nsec||!ntx)continue;
        var nk=nsec.indexOf('zone')>=0?'p4':(nsec.indexOf('map')>=0?'p3':(nsec.indexOf('class')>=0?'p2':'p1'));
        nn[nk].push(ntx);nhit=true;
      }
      if(nhit){R.notes=nn;found.push('Notes');}else skipped.push('Notes');
    }else skipped.push('Notes');
  }else skipped.push('Notes');
  return{found:found,skipped:skipped};
}
function readFile(f){
  var rd=new FileReader();
  rd.onload=function(e){
    try{
      var res=parseWb(XLSX.read(e.target.result,{type:'array'}));
      if(!res.found.length){say('No recognised sheets found. Expected Summary, Monthly, Classification, Governorates or Zones — download the template to check the layout.',false);return;}
      R.meta.source=f.name;archive(R);renderAll();periodMenu();
      say('Loaded '+f.name+' — filed as '+R.meta.period+' · updated: '+res.found.join(', ')+(res.skipped.length?'  ·  unchanged: '+res.skipped.join(', '):''),true);
    }catch(err){say('Could not read that file: '+err.message,false);}
  };
  rd.readAsArrayBuffer(f);
}
/* The workbook is generated in the browser from whatever data is loaded, so no
   .xlsx file has to be deployed with the dashboard. It is only an import /
   handover format — the monthly figures themselves live in the tab's own
   storage archive, exactly like the main dashboard's months. */
function template(){buildTemplate();}
function buildTemplate(){
  var wb=XLSX.utils.book_new(),D=R,S=XLSX.utils;
  function sh(rows,nm,cols){var s=S.aoa_to_sheet(rows);if(cols)s['!cols']=cols.map(function(w){return{wch:w};});S.book_append_sheet(wb,s,nm);}
  sh([['Network Performance Indicators Summary — monthly data workbook'],
    ['Update this workbook each month, then load it here: NPI Summary tab, Load data, drop the file in.'],[],
    ['Sheet','What it feeds in the report'],
    ['Summary','Title page gauges; page 2 chart and records table'],
    ['Monthly','Page 3 trend charts — leave future months blank'],
    ['Classification','Page 4 charts'],
    ['Governorates','Page 5 chart and table; page 6 performance map'],
    ['Zones','Page 7 compliance cards and charts'],
    ['Notes','Footnotes printed at the foot of each page'],[],
    ['Keep the sheet names and header wording exactly as they are — the dashboard matches on them.']],'How to use',[18,58]);
  var sm=[['Period',D.meta.period],[],['Metric','Current Month','Prev Year Month','Month Target','YTD','Annual Target','Gauge Max']];
  D.summary.forEach(function(x){sm.push([x.metric,x.cur,x.prev,x.mtarget,x.ytd,x.target,x.gmax]);});
  sh(sm,'Summary',[22,15,17,14,12,14,12]);
  var mo=[['Month','SAIDI YTD','SAIDI YTD LY','SAIDI Rolling','SAIFI YTD','SAIFI YTD LY','SAIFI Rolling','Outages YTD','Outages YTD LY','Outages Rolling']];
  D.months.forEach(function(mn,i){mo.push([mn,D.monthly.saidi.ytd[i],D.monthly.saidi.ytdLy[i],D.monthly.saidi.roll[i],
    D.monthly.saifi.ytd[i],D.monthly.saifi.ytdLy[i],D.monthly.saifi.roll[i],D.monthly.outages.ytd[i],D.monthly.outages.ytdLy[i],D.monthly.outages.roll[i]]);});
  sh(mo,'Monthly',[9,11,13,13,11,13,13,12,14,14]);
  var cl=[['Section','Key','Current Year','Prior Year']];
  ['SAIDI','SAIFI'].forEach(function(k){cl.push(['Type '+k,'Planned',D.classType[k].cur.planned,D.classType[k].prev.planned]);
    cl.push(['Type '+k,'Unplanned',D.classType[k].cur.unplanned,D.classType[k].prev.unplanned]);});
  ['SAIDI','SAIFI'].forEach(function(k){D.classVoltage[k].forEach(function(x){cl.push(['Voltage '+k,x.k,x.v,null]);});});
  D.outageVoltage.forEach(function(x){cl.push(['Outages Voltage',x.k,x.v,null]);});
  sh(cl,'Classification',[20,14,14,12]);
  var gv=[['Governorate','Rank','MV Unplanned Current','MV Unplanned Prior','SAIDI YTD','SAIFI YTD','Worst FDRs']];
  D.governorates.forEach(function(x){gv.push([x.gov,x.rank,x.mv26,x.mv25,x.saidi,x.saifi,x.fdr]);});
  sh(gv,'Governorates',[24,7,22,20,11,11,12]);
  var zn=[['Zone','Indicator','Rolling','Target','Improvement %']];
  ['SAIDI','SAIFI'].forEach(function(k){D.zones[k].forEach(function(x){zn.push([x.zone,k,x.rolling,x.target,x.imp]);});});
  sh(zn,'Zones',[12,12,11,11,15]);
  var nt=[['Section','Note']];
  [['Current Month & Trends','p1'],['Classification','p2'],['Governorates Map','p3'],['Zones','p4']].forEach(function(p){
    ((D.notes||{})[p[1]]||[]).forEach(function(t){nt.push([p[0],t]);});});
  sh(nt,'Notes',[26,96]);
  XLSX.writeFile(wb,'NPI Summary Data Template.xlsx');
  say('Template downloaded — fill in the new month and drop it back here.',true);
}

/* ── build & wire ── */
function build(){
  if(built)return;
  var host=document.getElementById('view-npi-summary');if(!host)return;
  if(!document.getElementById('nr-style')){var st=document.createElement('style');st.id='nr-style';st.textContent=CSS;document.head.appendChild(st);}
  host.innerHTML=markup();built=true;
  host.querySelectorAll('.nr-tab').forEach(function(b){
    b.addEventListener('click',function(){activate(+b.dataset.p,true);});
  });
  el('nr-open').addEventListener('click',function(){activate(6,true);});
  el('nr-close').addEventListener('click',function(){el('nr-ov').classList.remove('on');});
  el('nr-ov').addEventListener('click',function(e){if(e.target===this)this.classList.remove('on');});
  el('nr-print')&&el('nr-print').addEventListener('click',function(){window.print();});
  var xb=el('nr-export'),xm=el('nr-menu');
  var pb=el('nr-period'),pm=el('nr-pmenu');
  pb.addEventListener('click',function(e){e.stopPropagation();periodMenu();pm.classList.toggle('on');xm.classList.remove('on');});
  pm.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;pm.classList.remove('on');
    if(b.dataset.k)showMonth(b.dataset.k);
  });
  xb.addEventListener('click',function(e){e.stopPropagation();xm.classList.toggle('on');});
  document.addEventListener('click',function(){xm.classList.remove('on');pm.classList.remove('on');});
  xm.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;xm.classList.remove('on');
    if(b.dataset.x==='pdf')exportPdf();
    else if(window.NPI_PPTX)window.NPI_PPTX(R);
  });
  el('nr-tpl').addEventListener('click',template);
  el('nr-reset').addEventListener('click',function(){
    R=JSON.parse(JSON.stringify(window.NPI_DEFAULT));
    try{localStorage.removeItem(STORE);}catch(e){}
    renderAll();say('Reset to the July 2026 sample figures.',true);
  });
  var dz=el('nr-dz');
  ['dragover','dragenter'].forEach(function(ev){dz.addEventListener(ev,function(e){e.preventDefault();dz.classList.add('over');});});
  ['dragleave','drop'].forEach(function(ev){dz.addEventListener(ev,function(e){e.preventDefault();dz.classList.remove('over');});});
  dz.addEventListener('drop',function(e){if(e.dataTransfer&&e.dataTransfer.files[0])readFile(e.dataTransfer.files[0]);});
  el('nr-fi').addEventListener('change',function(e){if(e.target.files[0])readFile(e.target.files[0]);});
  /* the sidebar toggle changes #main's margin without firing a window resize,
     so watch the view box itself and rebuild the visible page on width change */
  if(window.ResizeObserver){var lastW=0;
    new ResizeObserver(function(en){var w=Math.round(en[0].contentRect.width);
      if(!w||w===lastW)return;lastW=w;clearTimeout(rzT);
      rzT=setTimeout(function(){dirty[active]=1;renderPage(active);},180);}).observe(host);}
  try{var saved=localStorage.getItem(STORE);if(saved){var p=JSON.parse(saved);if(p&&p.summary&&p.meta)R=p;}}catch(e){}
  /* a workbook loaded before the archive existed still deserves a slot */
  try{var ar=loadArch();if(!Object.keys(ar).length&&localStorage.getItem(STORE))archive(R);}catch(e){}
  CLOUD.on=!!wurl()&&(window.USE_WORKER!==false);
  cloudChip();periodMenu();cloudBoot();
  try{var sp=+sessionStorage.getItem('nr_page');if(sp>=1&&sp<=6)activate(sp,false);}catch(e){}
}

/* ── PDF export: every sub-tab on its own landscape page ── */
function exportPdf(){
  if(window.NPI_PRINT_REPORT){window.NPI_PRINT_REPORT(R);return;}
  if(window.NPI_PRINT_DOC){window.NPI_PRINT_DOC(R);return;}
  alert('The PDF report template failed to load. Please refresh and try again.');
}

/* Called by goView('npi-summary') in index.html */
window.renderNpiSummary=function(){build();renderAll();};
})();
