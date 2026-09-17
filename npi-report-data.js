// Default dataset — figures from "Network Performance Indicators (July 2026)" report
window.NPI_DEFAULT={
meta:{period:'July 2026',monthLabel:'JUL',monthIndex:6,year:2026,prevYear:2025,source:'Report figures · July 2026'},
months:['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
summary:[
 {metric:'Unplanned Outage',cur:4530,prev:4766,mtarget:1730,ytd:27261,target:32575,gmax:40000,dec:0},
 {metric:'SAIDI',cur:11.6,prev:20.3,mtarget:11,ytd:93.9,target:157,gmax:200,dec:1},
 {metric:'SAIFI',cur:0.17,prev:0.23,mtarget:0.15,ytd:1.28,target:1.83,gmax:2,dec:2}
],
monthly:{
 saidi:{ytd:[14.7,29.2,49.5,60.2,72.3,82.6,93.9,null,null,null,null,null],ytdLy:[17.7,33.8,40.3,54.3,64.4,74.4,94.5,114.2,130.76,142.3,154.2,168.7],roll:[169.8,166.7,165.3,179,176,177,178,null,null,null,null,null]},
 saifi:{ytd:[0.14,0.28,0.59,0.73,0.92,1.10,1.28,null,null,null,null,null],ytdLy:[0.15,0.29,0.39,0.57,0.74,0.92,1.14,1.38,1.58,1.70,1.81,1.97],roll:[1.98,1.96,1.97,2.18,2.13,2.16,2.12,null,null,null,null,null]},
 outages:{ytd:[2312,4156,9837,13871,17936,22731,27261,null,null,null,null,null],ytdLy:[2128,4321,6402,8870,12708,17297,21153,24219,27270,30205,32323,34289],roll:[35699,35265,38784,40255,40335,40364,40893,null,null,null,null,null]}
},
classType:{
 SAIDI:{cur:{planned:27.1,unplanned:66.8},prev:{planned:34.6,unplanned:59.9}},
 SAIFI:{cur:{planned:0.17,unplanned:1.11},prev:{planned:0.21,unplanned:0.93}}
},
classVoltage:{
 SAIDI:[{k:'11 Kv',v:23.8},{k:'33 Kv',v:5.4},{k:'LV',v:70.8}],
 SAIFI:[{k:'11 Kv',v:32},{k:'33 Kv',v:8.6},{k:'LV',v:59.4}]
},
outageVoltage:[{k:'33KV',v:425},{k:'11KV',v:1862},{k:'LV',v:24974}],
governorates:[
 {gov:'Muscat',rank:7,mv26:434,mv25:331,saidi:58.7,saifi:0.9,fdr:5},
 {gov:'Al Batinah North',rank:5,mv26:422,mv25:318,saidi:82.8,saifi:1.5,fdr:2},
 {gov:'Ad Dakhiliyah',rank:4,mv26:331,mv25:269,saidi:114.4,saifi:1.5,fdr:3},
 {gov:'Al Batinah South',rank:6,mv26:247,mv25:165,saidi:110.5,saifi:1.5,fdr:0},
 {gov:'Ash Sharqiyah North',rank:9,mv26:238,mv25:195,saidi:154.3,saifi:1.7,fdr:5},
 {gov:'Ash Sharqiyah South',rank:8,mv26:185,mv25:118,saidi:132.3,saifi:1.4,fdr:4},
 {gov:'Al Wusta',rank:10,mv26:150,mv25:115,saidi:480.2,saifi:3.2,fdr:6},
 {gov:'Ad Dhahirah',rank:3,mv26:149,mv25:82,saidi:88.3,saifi:1.6,fdr:1},
 {gov:'Al Buraimi',rank:2,mv26:70,mv25:58,saidi:32.6,saifi:0.7,fdr:0},
 {gov:'Musandam',rank:1,mv26:61,mv25:37,saidi:48.5,saifi:0.9,fdr:0}
],
zones:{
 SAIDI:[{zone:'Zone 1',prev:96.8,rolling:91,target:72,imp:-6},{zone:'Zone 2',prev:241.2,rolling:234,target:238,imp:-3},{zone:'Zone 3',prev:153.4,rolling:201,target:133,imp:31}],
 SAIFI:[{zone:'Zone 1',prev:1.09,rolling:1.2,target:1.03,imp:10},{zone:'Zone 2',prev:2.49,rolling:2.5,target:2.2,imp:0.4},{zone:'Zone 3',prev:2.39,rolling:2.6,target:2.2,imp:8.7}]
},
notes:{
 p1:['Unplanned Outages 2026 Target 5 % from 2025 Outturn','SAIFI and SAIDI 2026 Target 7.5 % from 2025 Outturn records','2026 Records without AL Massart Outages (exceed 3 hours interruption) impacts'],
 p2:['2026 Records without AL Massart Outages (exceed 3 hours interruption) impacts'],
 p3:['Worst FDRs based on accumulative number of unplanned outages for 3 times & above in 2026','2026 Records without AL Massart Outages (exceed 3 hours interruption) impacts'],
 p4:['2026 Records including AL Massart Outages impacts']
}};
