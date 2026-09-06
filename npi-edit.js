/* ══════════════════════════════════════════════════════════════════════
   NPI Summary — Data Update sub-tab.
   The admin edits every figure the report is built from, in place. Values
   live in a working copy; Save commits through api.save() (which persists
   to the tab's own storage key and re-renders the report pages).
   Mounted by npi-tab.js as: window.NPI_EDIT.mount(host, api)
   api = {get(), save(data), reset(), excel(), template()}
   ══════════════════════════════════════════════════════════════════════ */
(function(){
var NAVY='#0c1e35',RED='#c0392b',GREY='#94a3b8',INK='#111827',MUTE='#5b6674';
var CSS=''+
'#view-npi-summary .ne{display:flex;flex-direction:column;gap:12px}'+
'#view-npi-summary .ne-bar{position:sticky;top:0;z-index:6;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:11px 14px;background:#fff;border:1px solid #e5e7eb;border-top:3px solid '+RED+';border-radius:10px;box-shadow:0 2px 10px rgba(12,30,53,.06)}'+
'#view-npi-summary .ne-bar h2{font-size:14px;font-weight:800;color:'+NAVY+';letter-spacing:-.2px}'+
'#view-npi-summary .ne-bar .ne-sp{flex:1}'+
'#view-npi-summary .ne-per{display:flex;align-items:center;gap:8px;padding-left:14px;border-left:1px solid #e5e7eb}'+
'#view-npi-summary .ne-per label{font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:'+GREY+'}'+
'#view-npi-summary .ne-per input{width:150px;font:700 13px Inter,sans-serif;color:'+NAVY+';padding:7px 10px;border:1px solid #d7dce3;border-radius:7px;background:#fff}'+
'#view-npi-summary .ne-b{font:700 12px Inter,sans-serif;padding:8px 14px;border-radius:7px;border:1px solid #d7dce3;background:#fff;color:'+NAVY+';cursor:pointer;white-space:nowrap}'+
'#view-npi-summary .ne-b:hover{border-color:'+NAVY+'}'+
'#view-npi-summary .ne-b.go{background:'+RED+';border-color:'+RED+';color:#fff}'+
'#view-npi-summary .ne-b.go:disabled{background:#e5e7eb;border-color:#e5e7eb;color:#9ca3af;cursor:default}'+
'#view-npi-summary .ne-b.gh{color:'+MUTE+'}'+
'#view-npi-summary .ne-st{font-size:11px;font-weight:700;color:'+GREY+'}'+
'#view-npi-summary .ne-st.dirty{color:'+RED+'}'+
'#view-npi-summary .ne-st.ok{color:#1c7a48}'+
'#view-npi-summary .ne-grid{display:grid;gap:12px;grid-template-columns:repeat(2,minmax(0,1fr))}'+
'#view-npi-summary .ne-p{border:1px solid #e5e7eb;border-radius:10px;background:#fff;overflow:hidden;min-width:0;display:flex;flex-direction:column}'+
'#view-npi-summary .ne-p.wide{grid-column:1 / -1}'+
'#view-npi-summary .ne-ph{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:9px 13px;background:#f5f7f9;border-bottom:1px solid #e5e7eb}'+
'#view-npi-summary .ne-ph b{font-size:12.5px;font-weight:800;color:'+NAVY+'}'+
'#view-npi-summary .ne-ph span{font-size:10.5px;font-weight:600;color:'+GREY+'}'+
'#view-npi-summary .ne-pb{padding:11px 13px;overflow-x:auto}'+
'#view-npi-summary table.ne-t{width:100%;border-collapse:collapse}'+
'#view-npi-summary table.ne-t th{font-size:9.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:'+GREY+';text-align:right;padding:0 6px 7px;white-space:nowrap}'+
'#view-npi-summary table.ne-t th:first-child{text-align:left}'+
'#view-npi-summary table.ne-t td{padding:3px 6px;vertical-align:middle}'+
'#view-npi-summary table.ne-t td:first-child{font-size:12px;font-weight:700;color:'+NAVY+';white-space:nowrap}'+
'#view-npi-summary table.ne-t tr+tr td{border-top:1px solid #f1f3f6}'+
'#view-npi-summary .ne-in{width:100%;min-width:62px;font:600 12.5px "JetBrains Mono",monospace;color:'+INK+';text-align:right;padding:6px 8px;border:1px solid #e2e6ec;border-radius:6px;background:#fbfcfd}'+
'#view-npi-summary .ne-in:focus{outline:none;border-color:'+RED+';background:#fff;box-shadow:0 0 0 3px rgba(192,57,43,.08)}'+
'#view-npi-summary .ne-in.txt{font:600 12.5px Inter,sans-serif;text-align:left;min-width:120px}'+
'#view-npi-summary .ne-in.sm{min-width:52px}'+
'#view-npi-summary .ne-in.lk{background:#f1f3f6;border-style:dashed;color:#8b95a3;cursor:not-allowed}'+
'#view-npi-summary .ne-rk{display:inline-block;min-width:28px;text-align:center;font:800 12px Inter,sans-serif;color:#fff;background:'+NAVY+';border-radius:6px;padding:5px 6px}'+
'#view-npi-summary textarea.ne-in{text-align:left;font:500 12px Inter,sans-serif;line-height:1.5;resize:vertical;min-height:64px}'+
'#view-npi-summary .ne-hint{font-size:10.5px;color:'+GREY+';padding:0 13px 10px;line-height:1.5}'+
'#view-npi-summary .ne-row-b{display:flex;gap:8px;padding:0 13px 11px;margin-top:auto}'+
'#view-npi-summary .ne-x{font:800 12px Inter,sans-serif;width:24px;height:24px;border-radius:6px;border:1px solid #e2e6ec;background:#fff;color:'+GREY+';cursor:pointer}'+
'#view-npi-summary .ne-x:hover{border-color:'+RED+';color:'+RED+'}'+
'@media(max-width:1100px){#view-npi-summary .ne-grid{grid-template-columns:minmax(0,1fr)}}';

function esc(s){return String(s===null||s===undefined?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function num(v){if(v===null||v===undefined||String(v).trim()==='')return null;var n=parseFloat(String(v).replace(/,/g,''));return isNaN(n)?null:n;}
function clone(o){return JSON.parse(JSON.stringify(o));}
/* path-addressed input: data-k is a dotted path into the working copy */
function inp(path,v,cls){
  return '<input class="ne-in'+(cls?' '+cls:'')+'" data-k="'+path+'" value="'+esc(v===null||v===undefined?'':v)+'"'+(cls&&cls.indexOf('txt')>=0?'':' inputmode="decimal"')+'>';
}
function setPath(o,path,val){
  var p=path.split('.'),t=o;
  for(var i=0;i<p.length-1;i++){var k=p[i];if(/^\d+$/.test(k))k=+k;t=t[k];if(!t)return;}
  var last=p[p.length-1];t[/^\d+$/.test(last)?+last:last]=val;
}

var HOST=null,API=null,W=null,DIRTY=false;

function panel(title,sub,inner,cls,hint,foot){
  return '<div class="ne-p'+(cls?' '+cls:'')+'"><div class="ne-ph"><b>'+esc(title)+'</b>'+(sub?'<span>'+esc(sub)+'</span>':'')+'</div>'+
    '<div class="ne-pb">'+inner+'</div>'+(hint?'<div class="ne-hint">'+esc(hint)+'</div>':'')+(foot||'')+'</div>';
}
function tbl(head,rows){
  return '<table class="ne-t"><thead><tr>'+head.map(function(h){return '<th>'+esc(h)+'</th>';}).join('')+'</tr></thead>'+
    '<tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';
}

function summaryPanel(){
  var rows=W.summary.map(function(m,i){
    return ['<span>'+esc(m.metric)+'</span>',
      inp('summary.'+i+'.cur',m.cur),inp('summary.'+i+'.prev',m.prev),inp('summary.'+i+'.mtarget',m.mtarget),
      inp('summary.'+i+'.ytd',m.ytd),inp('summary.'+i+'.target',m.target),
      inp('summary.'+i+'.gmax',m.gmax)];
  });
  return panel('Indicators','title page gauges · month chart · records table',
    tbl(['Indicator','Current month','Same month last year','Month target','Year to date','Annual target','Dial max'],rows),'wide',
    'The dial colour on the title page comes from year to date against the annual target. Dial max sets the top of the dial scale — change it only if an indicator outgrows its current scale.');
}
function monthlyPanel(){
  var mm=W.months,g=W.monthly;
  var rows=mm.map(function(mn,i){
    return ['<span>'+esc(mn)+'</span>',
      inp('monthly.saidi.ytd.'+i,g.saidi.ytd[i],'sm'),inp('monthly.saidi.ytdLy.'+i,g.saidi.ytdLy[i],'sm'),inp('monthly.saidi.roll.'+i,g.saidi.roll[i],'sm'),
      inp('monthly.saifi.ytd.'+i,g.saifi.ytd[i],'sm'),inp('monthly.saifi.ytdLy.'+i,g.saifi.ytdLy[i],'sm'),inp('monthly.saifi.roll.'+i,g.saifi.roll[i],'sm'),
      inp('monthly.outages.ytd.'+i,g.outages.ytd[i],'sm'),inp('monthly.outages.ytdLy.'+i,g.outages.ytdLy[i],'sm'),inp('monthly.outages.roll.'+i,g.outages.roll[i],'sm')];
  });
  return panel('Monthly trends','cumulative and rolling 12 months',
    tbl(['Month','SAIDI YTD','SAIDI LY','SAIDI roll','SAIFI YTD','SAIFI LY','SAIFI roll','Outages YTD','Outages LY','Outages roll'],rows),'wide',
    'Leave a month blank until it is reported — the trend lines stop at the last filled month. Keep all twelve last-year months so the prior-year outturn prints.');
}
function typePanel(){
  var rows=[];
  ['SAIDI','SAIFI'].forEach(function(k){
    ['planned','unplanned'].forEach(function(t){
      rows.push(['<span>'+k+' · '+t.charAt(0).toUpperCase()+t.slice(1)+'</span>',
        inp('classType.'+k+'.cur.'+t,W.classType[k].cur[t]),inp('classType.'+k+'.prev.'+t,W.classType[k].prev[t])]);
    });
  });
  return panel('Planned vs unplanned','page 4 · '+W.meta.year+' vs '+W.meta.prevYear,
    tbl(['Split',String(W.meta.year),String(W.meta.prevYear)],rows));
}
function voltPanel(){
  var rows=[];
  ['SAIDI','SAIFI'].forEach(function(k){
    W.classVoltage[k].forEach(function(x,i){
      rows.push([inp('classVoltage.'+k+'.'+i+'.k',x.k,'txt sm'),'<span style="font-size:11px;font-weight:700;color:'+GREY+'">'+k+' share %</span>',inp('classVoltage.'+k+'.'+i+'.v',x.v)]);
    });
  });
  W.outageVoltage.forEach(function(x,i){
    rows.push([inp('outageVoltage.'+i+'.k',x.k,'txt sm'),'<span style="font-size:11px;font-weight:700;color:'+GREY+'">Unplanned outages</span>',inp('outageVoltage.'+i+'.v',x.v)]);
  });
  return panel('Voltage level','page 4 donuts',tbl(['Level','Measure','Value'],rows),null,
    'SAIDI and SAIFI rows are percentage shares. Unplanned outage rows are counts year to date.');
}
/* Rank is derived, never typed: each governorate is placed on SAIDI YTD, SAIFI
   YTD and MV unplanned outages separately (lower is better, ties share the
   average place), and the three places are averaged with equal weight. Rank 1
   is the best combined position; a missing figure sorts last for that metric,
   and SAIDI breaks a tie on the average. */
function reRank(){
  var g=W.governorates||[],n=g.length;if(!n)return;
  function places(key){
    var arr=g.map(function(x,i){var v=x[key];return{i:i,v:(v===null||v===undefined||isNaN(v))?Infinity:+v};})
      .sort(function(a,b){return a.v-b.v;});
    var p=new Array(n),k=0;
    while(k<arr.length){
      var j=k;while(j+1<arr.length&&arr[j+1].v===arr[k].v)j++;
      var avg=(k+j)/2+1;
      for(var q=k;q<=j;q++)p[arr[q].i]=avg;
      k=j+1;
    }
    return p;
  }
  var ps=places('saidi'),pf=places('saifi'),po=places('mv26');
  g.map(function(x,i){return{i:i,s:(ps[i]+pf[i]+po[i])/3,t:(x.saidi===null||x.saidi===undefined)?Infinity:+x.saidi};})
   .sort(function(a,b){return a.s-b.s||a.t-b.t||a.i-b.i;})
   .forEach(function(o,k){g[o.i].rank=k+1;});
}
function paintRanks(){
  if(!HOST)return;
  HOST.querySelectorAll('[data-rank]').forEach(function(e){
    var x=W.governorates[+e.dataset.rank];if(x)e.textContent=x.rank;
  });
}

function govPanel(){
  var rows=W.governorates.map(function(x,i){
    return [inp('governorates.'+i+'.gov',x.gov,'txt'),'<span class="ne-rk" data-rank="'+i+'">'+x.rank+'</span>',
      inp('governorates.'+i+'.mv26',x.mv26,'sm'),inp('governorates.'+i+'.mv25',x.mv25,'sm'),
      inp('governorates.'+i+'.saidi',x.saidi,'sm'),inp('governorates.'+i+'.saifi',x.saifi,'sm'),
      inp('governorates.'+i+'.fdr',x.fdr,'sm'),'<button class="ne-x" data-del="governorates.'+i+'" title="Remove row">&times;</button>'];
  });
  return panel('Governorates','page 5 chart and table · page 6 map',
    tbl(['Governorate','Rank (auto)','MV '+W.meta.year,'MV '+W.meta.prevYear,'SAIDI YTD','SAIFI YTD','Worst FDRs',''],rows),'wide',
    'Rank is calculated from SAIDI, SAIFI and MV unplanned outages — each governorate’s place on the three is averaged, and the best combined position is rank 1. It updates as you type. Worst FDRs counts feeders with three or more unplanned outages. Keep the spelling so the map can place the governorate.',
    '<div class="ne-row-b"><button class="ne-b" data-add="gov">Add governorate</button></div>');
}
function zonePanel(){
  var rows=[];
  ['SAIDI','SAIFI'].forEach(function(k){
    (W.zones[k]||[]).forEach(function(x,i){
      rows.push([inp('zones.'+k+'.'+i+'.zone',x.zone,'txt sm'),'<span style="font-size:11px;font-weight:700;color:'+GREY+'">'+k+'</span>',
        inp('zones.'+k+'.'+i+'.rolling',x.rolling,'sm'),inp('zones.'+k+'.'+i+'.target',x.target,'sm'),inp('zones.'+k+'.'+i+'.imp',x.imp,'sm'),
        '<button class="ne-x" data-del="zones.'+k+'.'+i+'" title="Remove row">&times;</button>']);
    });
  });
  return panel('Zones','page 7 compliance',tbl(['Zone','Indicator','Rolling 12m','Target','Improvement %',''],rows),null,
    'A zone whose rolling value is above its target is flagged as an APSR penalty.',
    '<div class="ne-row-b"><button class="ne-b" data-add="zSAIDI">Add SAIDI zone</button><button class="ne-b" data-add="zSAIFI">Add SAIFI zone</button></div>');
}
function notesPanel(){
  var map=[['p1','Current month & trends (pages 2–3)'],['p2','Classification & governorates (pages 4–5)'],['p3','Performance map (page 6)'],['p4','Zones (page 7)']];
  var body=map.map(function(p){
    var v=((W.notes||{})[p[0]]||[]);
    return '<div style="margin-bottom:9px"><div style="font-size:10px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:'+GREY+';margin-bottom:4px">'+esc(p[1])+'</div>'+
      '<textarea class="ne-in" data-notes="'+p[0]+'" rows="3">'+esc(v.join('\n'))+'</textarea></div>';
  }).join('');
  return panel('Footnotes','printed at the foot of each page',body,null,'One footnote per line. Leave a box empty for no footnote on that page.');
}

function bar(){
  return '<div class="ne-bar">'+
    '<h2>Data Update</h2>'+
    '<div class="ne-per"><label for="ne-period">Reporting period</label><input id="ne-period" value="'+esc(W.meta.period)+'"></div>'+
    '<div class="ne-sp"></div>'+
    '<span class="ne-st" id="ne-st">All changes saved</span>'+
    '<button class="ne-b go" id="ne-save" disabled>Save changes</button>'+
    '<button class="ne-b" id="ne-undo">Discard</button>'+
    '<button class="ne-b gh" id="ne-xls">Import Excel</button>'+
    '<button class="ne-b gh" id="ne-tpl">Download workbook</button>'+
    '<button class="ne-b gh" id="ne-rst">Reset to sample</button>'+
  '</div>';
}
function status(kind,txt){
  var s=document.getElementById('ne-st');if(!s)return;
  s.className='ne-st'+(kind?' '+kind:'');s.textContent=txt;
  var b=document.getElementById('ne-save');if(b)b.disabled=!DIRTY;
}
function mark(){DIRTY=true;status('dirty','Unsaved changes');}

function paint(){
  HOST.innerHTML='<div class="ne">'+bar()+
    '<div class="ne-grid">'+summaryPanel()+monthlyPanel()+typePanel()+voltPanel()+govPanel()+zonePanel()+notesPanel()+'</div></div>';
  status(DIRTY?'dirty':'ok',DIRTY?'Unsaved changes':'All changes saved');
}
/* listeners are bound to the host once — paint() only swaps innerHTML */
function wire(){
  HOST.addEventListener('input',function(e){
    var t=e.target;
    if(t.id==='ne-period'){W.meta.period=t.value;syncMeta();mark();return;}
    if(t.dataset.notes){W.notes=W.notes||{};W.notes[t.dataset.notes]=t.value.split('\n').map(function(s){return s.trim();}).filter(Boolean);mark();return;}
    if(t.dataset.k){
      var path=t.dataset.k,isTxt=t.classList.contains('txt');
      setPath(W,path,isTxt?t.value:num(t.value));
      if(path.indexOf('governorates.')===0&&/\.(saidi|saifi|mv26)$/.test(path)){reRank();paintRanks();}
      mark();
    }
  });
  HOST.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    if(b.id==='ne-save'){commit();return;}
    if(b.id==='ne-undo'){W=clone(API.get());DIRTY=false;paint();status('ok','Changes discarded');return;}
    if(b.id==='ne-xls'){API.excel();return;}
    if(b.id==='ne-tpl'){API.template();return;}
    if(b.id==='ne-rst'){
      if(!window.confirm('Reset every figure to the built-in July 2026 sample?'))return;
      API.reset();W=clone(API.get());DIRTY=false;paint();status('ok','Reset to the sample figures');return;
    }
    if(b.dataset.add){
      var a=b.dataset.add;
      if(a==='gov')W.governorates.push({gov:'New governorate',rank:W.governorates.length+1,mv26:0,mv25:0,saidi:0,saifi:0,fdr:0});
      else W.zones[a.slice(1)].push({zone:'New zone',rolling:null,target:null,imp:0});
      reRank();mark();paint();return;
    }
    if(b.dataset.del){
      var p=b.dataset.del.split('.');
      if(p[0]==='governorates')W.governorates.splice(+p[1],1);
      else W.zones[p[1]].splice(+p[2],1);
      reRank();mark();paint();return;
    }
  });
}
/* period drives every month label, the year and the prior year */
function syncMeta(){
  var s=String(W.meta.period||''),y=s.match(/(\d{4})/),m=s.match(/^\s*([A-Za-z]+)/);
  if(y){W.meta.year=+y[1];W.meta.prevYear=+y[1]-1;}
  if(m){
    var mn=m[1].slice(0,3).toUpperCase(),i=(W.months||[]).indexOf(mn);
    W.meta.monthLabel=mn;if(i>=0)W.meta.monthIndex=i;
  }
}
function commit(){
  syncMeta();reRank();
  W.meta.source='Entered in dashboard · '+W.meta.period;
  API.save(clone(W));
  DIRTY=false;status('ok','Saved — report pages and exports updated');
}

window.NPI_EDIT={
  mount:function(host,api){
    if(!document.getElementById('ne-style')){var st=document.createElement('style');st.id='ne-style';st.textContent=CSS;document.head.appendChild(st);}
    var remount=HOST!==host;
    HOST=host;API=api;
    if(!host.dataset.neWired){host.dataset.neWired='1';wire();}
    if(remount||!W||!DIRTY)W=clone(api.get());
    reRank();
    paint();
  }
};
})();
