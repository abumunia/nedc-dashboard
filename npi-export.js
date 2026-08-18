/* ══════════════════════════════════════════════════════════════════════
   NPI Summary — PowerPoint export. One slide per sub-tab, native
   PowerPoint text / tables / charts (editable, not screenshots).
   Loaded by index.html; called as window.NPI_PPTX(data) by npi-tab.js.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
var LIB='https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js',loading=null;
var NAVY='0C1E35',RED='C0392B',GREY='94A3B8',BLUE='2980B9',GREEN='27AE60',INK='111827',MUTE='6B7280',F='Segoe UI';

function load(){
  if(window.PptxGenJS)return Promise.resolve();
  if(loading)return loading;
  loading=new Promise(function(res,rej){
    var s=document.createElement('script');s.src=LIB;s.onload=res;
    s.onerror=function(){rej(new Error('Could not load the PowerPoint library — check your connection.'));};
    document.head.appendChild(s);
  });
  return loading;
}
function toast(msg,bad){
  var t=document.getElementById('nr-toast');
  if(!t){t=document.createElement('div');t.id='nr-toast';
    t.style.cssText='position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:200;padding:12px 20px;border-radius:10px;font:600 13px Inter,sans-serif;box-shadow:0 12px 30px rgba(8,18,32,.3)';
    document.body.appendChild(t);}
  t.style.background=bad?'#c0392b':'#0c1e35';t.style.color='#fff';t.textContent=msg;t.style.display='block';
  clearTimeout(t._h);t._h=setTimeout(function(){t.style.display='none';},bad?5000:2600);
}
function nn(a){return (a||[]).map(function(v){return v===undefined?null:v;});}
function nf(v,d){if(v===null||v===undefined||isNaN(v))return'—';return Number(v).toLocaleString('en-US',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});}
function find(R,key){return R.summary.find(function(x){return x.metric.toUpperCase().indexOf(key)>=0;})||{};}

window.NPI_PPTX=function(R){
  toast('Building PowerPoint…');
  load().then(function(){
    var pptx=new PptxGenJS();
    pptx.layout='LAYOUT_WIDE';pptx.author='NEDC';pptx.title='Network Performance Indicators Summary';
    var W=13.33,PER=String(R.meta.period).toUpperCase(),YR=R.meta.year,PY=R.meta.prevYear;

    function head(s,sub,pg){
      s.addShape(pptx.ShapeType.rect,{x:0,y:0,w:W,h:0.88,fill:{color:NAVY}});
      s.addShape(pptx.ShapeType.rect,{x:0,y:0.88,w:W,h:0.05,fill:{color:RED}});
      s.addText('Network Performance Indicators Summary',{x:0.45,y:0.11,w:8.6,h:0.36,fontSize:19,bold:true,color:'FFFFFF',fontFace:F});
      s.addText(sub,{x:0.45,y:0.48,w:8.6,h:0.28,fontSize:11,color:'9FB0C4',fontFace:F});
      s.addShape(pptx.ShapeType.roundRect,{x:10.35,y:0.21,w:2.05,h:0.46,fill:{color:RED},rectRadius:0.09});
      s.addText(PER,{x:10.35,y:0.21,w:2.05,h:0.46,fontSize:13,bold:true,color:'FFFFFF',align:'center',valign:'middle',fontFace:F});
      s.addText('PAGE '+pg+' / 5',{x:12.45,y:0.33,w:0.65,h:0.24,fontSize:8,color:'7A8CA0',align:'right',fontFace:F});
    }
    function panel(s,x,y,w,h,title){
      s.addShape(pptx.ShapeType.roundRect,{x:x,y:y,w:w,h:h,fill:{color:'FFFFFF'},line:{color:'E5E7EB',width:1},rectRadius:0.05});
      s.addText(title,{x:x+0.14,y:y+0.08,w:w-0.28,h:0.26,fontSize:10.5,bold:true,color:NAVY,fontFace:F});
    }
    function notes(s,arr){
      if(!arr||!arr.length)return;
      s.addText(arr.map(function(t){return{text:'* '+t,options:{breakLine:true}};}),{x:0.45,y:6.72,w:12.45,h:0.6,fontSize:7.5,color:MUTE,fontFace:F,lineSpacingMultiple:1.2});
    }
    var TBL={fontFace:F,fontSize:9.5,color:INK,border:{type:'solid',color:'F1F3F6',pt:0.5},autoPage:false};
    function hdr(a){return a.map(function(t){return{text:t,options:{bold:true,color:'FFFFFF',fill:{color:NAVY},fontSize:9,align:'center'}};});}

    /* ── 1 · Current month ── */
    var s1=pptx.addSlide();head(s1,'Current Month Network Indicators (NEDC)',1);
    R.summary.forEach(function(m,i){
      var x=0.45+i*4.16;
      s1.addShape(pptx.ShapeType.roundRect,{x:x,y:1.12,w:3.96,h:1.16,fill:{color:'F7F9FB'},line:{color:'E5E7EB',width:1},rectRadius:0.05});
      s1.addText(m.metric.toUpperCase()+' (M)',{x:x+0.16,y:1.2,w:3.6,h:0.24,fontSize:9,bold:true,color:GREY,charSpacing:1,fontFace:F});
      s1.addText(nf(m.cur,m.dec),{x:x+0.16,y:1.42,w:2.2,h:0.6,fontSize:30,bold:true,color:NAVY,fontFace:F});
      s1.addText([{text:'YTD\n',options:{fontSize:8,color:GREY,bold:true}},{text:nf(m.ytd,m.dec),options:{fontSize:16,bold:true,color:m.ytd>m.target?RED:GREEN}}],
        {x:x+2.3,y:1.44,w:1.5,h:0.62,align:'right',fontFace:F});
    });
    function line(s,x,y,w,h,title,d,tgt){
      panel(s,x,y,w,h,title);
      s.addChart(pptx.ChartType.line,[
        {name:'YTD '+YR,labels:R.months,values:nn(d.ytd)},
        {name:'YTD '+PY,labels:R.months,values:nn(d.ytdLy)},
        {name:'Rolling',labels:R.months,values:nn(d.roll)},
        {name:'Target',labels:R.months,values:R.months.map(function(){return tgt;})}
      ],{x:x+0.08,y:y+0.34,w:w-0.16,h:h-0.44,chartColors:[RED,GREY,BLUE,NAVY],lineDataSymbol:'none',lineSize:2,
        showLegend:true,legendPos:'b',legendFontSize:8,catAxisLabelFontSize:7,valAxisLabelFontSize:7,
        valGridLine:{style:'solid',color:'F1F3F6'},catGridLine:{style:'none'},dataLabelFormatCode:'#,##0.0'});
    }
    line(s1,0.45,2.42,4.1,2.62,'SAIDI · monthly comparison',R.monthly.saidi,find(R,'SAIDI').target);
    line(s1,4.72,2.42,4.1,2.62,'SAIFI · monthly comparison',R.monthly.saifi,find(R,'SAIFI').target);
    line(s1,8.99,2.42,3.89,2.62,'MV unplanned outages',R.monthly.outages,find(R,'OUTAGE').target);
    s1.addText('Monthly Indicators vs Target — '+R.meta.monthLabel+' '+YR+' vs '+R.meta.monthLabel+' '+PY+' vs month target',
      {x:0.45,y:5.14,w:12.45,h:0.24,fontSize:10.5,bold:true,color:NAVY,fontFace:F});
    s1.addTable([hdr(['Metric',R.meta.monthLabel+' '+YR,R.meta.monthLabel+' '+PY,'Month target','vs '+PY])].concat(
      R.summary.map(function(m){var dv=m.prev?(m.cur-m.prev)/m.prev*100:null;
        return [{text:m.metric,options:{bold:true,color:NAVY}},{text:nf(m.cur,m.dec),options:{align:'center'}},
          {text:nf(m.prev,m.dec),options:{align:'center',color:MUTE}},{text:nf(m.mtarget,m.dec),options:{align:'center',color:MUTE}},
          {text:dv===null?'—':(dv>0?'+':'')+dv.toFixed(1)+'%',options:{align:'center',bold:true,color:dv>0?RED:GREEN}}];})),
      Object.assign({},TBL,{x:0.45,y:5.42,w:6.2,rowH:0.26}));
    var ov=R.outageVoltage,tot=ov.reduce(function(a,b){return a+(b.v||0);},0);
    s1.addText('Unplanned outages YTD by voltage level — total '+nf(tot,0),{x:7,y:5.14,w:5.9,h:0.24,fontSize:10.5,bold:true,color:NAVY,fontFace:F});
    s1.addChart(pptx.ChartType.doughnut,[{name:'Outages',labels:ov.map(function(x){return x.k;}),values:ov.map(function(x){return x.v;})}],
      {x:7,y:5.36,w:5.9,h:1.3,chartColors:[NAVY,BLUE,RED],holeSize:52,showLegend:true,legendPos:'r',legendFontSize:8,
       showPercent:true,dataLabelColor:'FFFFFF',dataLabelFontSize:8,dataLabelFontBold:true});
    notes(s1,(R.notes||{}).p1);

    /* ── 2 · Classification ── */
    var s2=pptx.addSlide();head(s2,'Indicator Classification',2);
    [['SAIDI',0.45],['SAIFI',4.72]].forEach(function(p){
      var k=p[0],d=R.classType[k];
      panel(s2,p[1],1.12,4.1,2.3,k+' classification (type of outage)');
      s2.addChart(pptx.ChartType.bar,[
        {name:'Planned',labels:[String(YR),String(PY)],values:[d.cur.planned,d.prev.planned]},
        {name:'Unplanned',labels:[String(YR),String(PY)],values:[d.cur.unplanned,d.prev.unplanned]}
      ],{x:p[1]+0.08,y:1.44,w:4.0-0.02,h:1.9,barDir:'bar',barGrouping:'stacked',chartColors:[BLUE,RED],
        showLegend:true,legendPos:'b',legendFontSize:8,showValue:true,dataLabelFontSize:8,dataLabelColor:'FFFFFF',dataLabelFontBold:true,
        catAxisLabelFontSize:9,valAxisLabelFontSize:7,valGridLine:{style:'solid',color:'F1F3F6'}});
    });
    panel(s2,8.99,1.12,3.89,2.3,'Voltage level share (%)');
    s2.addChart(pptx.ChartType.bar,[
      {name:'SAIDI',labels:R.classVoltage.SAIDI.map(function(x){return x.k;}),values:R.classVoltage.SAIDI.map(function(x){return x.v;})},
      {name:'SAIFI',labels:R.classVoltage.SAIFI.map(function(x){return x.k;}),values:R.classVoltage.SAIFI.map(function(x){return x.v;})}
    ],{x:9.07,y:1.44,w:3.73,h:1.9,barDir:'col',chartColors:[RED,NAVY],showLegend:true,legendPos:'b',legendFontSize:8,
      showValue:true,dataLabelFontSize:8,dataLabelPosition:'outEnd',catAxisLabelFontSize:8,valAxisLabelFontSize:7,
      valGridLine:{style:'solid',color:'F1F3F6'}});
    var gv=R.governorates.slice().sort(function(a,b){return b.mv26-a.mv26;});
    panel(s2,0.45,3.58,12.43,3.0,'MV unplanned outages (governorates wise · YTD)');
    s2.addChart(pptx.ChartType.bar,[
      {name:String(YR),labels:gv.map(function(x){return x.gov;}),values:gv.map(function(x){return x.mv26;})},
      {name:String(PY),labels:gv.map(function(x){return x.gov;}),values:gv.map(function(x){return x.mv25;})}
    ],{x:0.53,y:3.9,w:12.27,h:2.6,barDir:'col',chartColors:[RED,GREY],showLegend:true,legendPos:'t',legendFontSize:8,
      showValue:true,dataLabelFontSize:7.5,dataLabelPosition:'outEnd',catAxisLabelFontSize:8,catAxisLabelRotate:315,
      valAxisLabelFontSize:7,valGridLine:{style:'solid',color:'F1F3F6'}});
    notes(s2,(R.notes||{}).p2);

    /* ── 3 · Governorates ── */
    var s3=pptx.addSlide();head(s3,'Network Performance Indicators YTD '+YR+' · Governorates',3);
    var gr=R.governorates.slice().sort(function(a,b){return a.rank-b.rank;});
    s3.addTable([hdr(['Rank','Governorate','SAIDI','SAIFI','Worst FDRs'])].concat(
      gr.map(function(g){return [{text:String(g.rank),options:{align:'center',bold:true,color:'FFFFFF',fill:{color:NAVY}}},
        {text:g.gov,options:{bold:true,color:NAVY}},{text:nf(g.saidi,1),options:{align:'center'}},
        {text:nf(g.saifi,2),options:{align:'center'}},{text:String(g.fdr),options:{align:'center',bold:true,color:g.fdr?RED:MUTE}}];})),
      Object.assign({},TBL,{x:0.45,y:1.12,w:5.5,rowH:0.28,colW:[0.6,2.3,0.9,0.85,0.85]}));
    var gs=R.governorates.slice().sort(function(a,b){return b.saidi-a.saidi;});
    panel(s3,6.2,1.12,6.68,5.4,'SAIDI and SAIFI by governorate · YTD');
    s3.addChart([
      {type:pptx.ChartType.bar,data:[{name:'SAIDI',labels:gs.map(function(x){return x.gov;}),values:gs.map(function(x){return x.saidi;})}],options:{chartColors:[RED],barDir:'col'}},
      {type:pptx.ChartType.line,data:[{name:'SAIFI',labels:gs.map(function(x){return x.gov;}),values:gs.map(function(x){return x.saifi;})}],options:{chartColors:[NAVY],secondaryValAxis:true,secondaryCatAxis:true,lineSize:2,lineDataSymbol:'circle',lineDataSymbolSize:6}}
    ],{x:6.28,y:1.46,w:6.52,h:4.98,showLegend:true,legendPos:'t',legendFontSize:8,catAxisLabelFontSize:8,catAxisLabelRotate:315,
      valAxisLabelFontSize:7,valAxisTitle:'SAIDI (minutes)',showValAxisTitle:true,valAxisTitleFontSize:8,
      secondaryValAxis:true,catAxes:[{catAxisLabelFontSize:8},{catAxisHidden:true}],
      valAxes:[{valAxisLabelFontSize:7,valGridLine:{style:'solid',color:'F1F3F6'}},{valAxisLabelFontSize:7,valAxisTitle:'SAIFI',showValAxisTitle:true,valAxisTitleFontSize:8,valGridLine:{style:'none'}}]});
    notes(s3,(R.notes||{}).p3);

    /* ── 4 & 5 · Zones ── */
    ['SAIDI','SAIFI'].forEach(function(k,i){
      var s=pptx.addSlide();head(s,'Records Comparisons · Zones — '+k,4+i);
      var z=R.zones[k]||[],dec=k==='SAIDI'?0:2;
      s.addTable([hdr(['Zone','Rolling','Target '+YR,'Improvement %','APSR compliance status'])].concat(
        z.map(function(x){var over=x.rolling>x.target;
          return [{text:x.zone,options:{bold:true,color:NAVY}},{text:nf(x.rolling,dec),options:{align:'center',bold:true}},
            {text:nf(x.target,dec),options:{align:'center',color:MUTE}},
            {text:(x.imp>0?'+':'')+nf(x.imp,1),options:{align:'center',bold:true,color:x.imp<0?GREEN:RED}},
            {text:over?'Penalty':'Less than target',options:{align:'center',bold:true,color:'FFFFFF',fill:{color:over?RED:GREEN}}}];})),
        Object.assign({},TBL,{x:0.45,y:1.12,w:6.4,rowH:0.34,fontSize:10.5,colW:[1.0,1.15,1.15,1.35,1.75]}));
      panel(s,0.45,3.0,12.43,3.5,'Rolling vs target '+YR+' · '+k);
      s.addChart(pptx.ChartType.bar,[
        {name:'Rolling',labels:z.map(function(x){return x.zone;}),values:z.map(function(x){return x.rolling;})},
        {name:'Target '+YR,labels:z.map(function(x){return x.zone;}),values:z.map(function(x){return x.target;})}
      ],{x:0.53,y:3.34,w:12.27,h:3.06,barDir:'col',chartColors:[RED,NAVY],showLegend:true,legendPos:'t',legendFontSize:9,
        showValue:true,dataLabelFontSize:9,dataLabelPosition:'outEnd',catAxisLabelFontSize:11,valAxisLabelFontSize:8,
        valGridLine:{style:'solid',color:'F1F3F6'},barGapWidthPct:120});
      notes(s,(R.notes||{}).p4);
    });

    var name='NPI_Summary_'+String(R.meta.period).replace(/[^A-Za-z0-9]+/g,'_');
    return pptx.writeFile({fileName:name+'.pptx'});
  }).then(function(){toast('PowerPoint downloaded.');})
    .catch(function(e){toast(e.message||'PowerPoint export failed.',true);console.error('NPI PPTX export:',e);});
};
})();
