/* Hybridblock – Plan, Übungsbibliothek, Aktivitäten, Lebensmittel-Presets */
'use strict';

/* ---------- Muskeln ----------
   Schwerpunkt (mehr Volumen + näher am Versagen): Waden, Hamstrings, Bizeps, Bauch */
const MUSCLES = { c:'Waden', h:'Hamstrings', bi:'Bizeps', ab:'Bauch', q:'Quads', g:'Glutes', ch:'Brust', t:'Trizeps', fd:'Schulter vorn', sd:'Schulter seitlich', rd:'Schulter hinten', b:'Rücken' };
const PRIORITY = ['c','h','bi','ab'];
/* Zielbereich direkte + anteilige Sätze pro Woche (im Defizit) */
const VOL_TARGET = { prio:[12,20], other:[6,14] };

const LIB = {};
function L(id, name, muscles, alts, note) { LIB[id] = { id, name, muscles, alts: alts || [], note: note || '' }; }

/* Beine */
L('fs','Front Squat',{q:1,g:.5,ab:.25},['pend','hack','goblet']);
L('pend','Pendulum Squat',{q:1,g:.5},['hack','legpress','fs']);
L('hack','Hack Squat',{q:1,g:.5},['pend','legpress']);
L('legpress','Beinpresse',{q:1,g:.5},['pend','hack']);
L('goblet','Goblet Squat',{q:1,g:.5},['pend','fs']);
L('trap','Trap-Bar-Kreuzheben (hohe Griffe)',{g:1,h:.5,q:.5},['rdl_db','hyper45','glute_bridge']);
L('rdl_db','Rumänisches Kreuzheben (KH)',{h:1,g:.5},['hyper45','trap']);
L('hyper45','45°-Hyperextension',{g:1,h:.5},['rdl_db','glute_bridge']);
L('glute_bridge','Glute Bridge (Langhantel)',{g:1},['ht','ht_machine']);
L('ht','Hip Thrust',{g:1,h:.25},['ht_machine','glute_bridge']);
L('ht_machine','Hip-Thrust-Maschine',{g:1},['ht','glute_bridge']);
L('legext','Leg Extension',{q:1},['sissy']);
L('sissy','Sissy Squat',{q:1},['legext']);
L('bss','Bulgarian Split Squat',{q:1,g:1},['rev_lunge','stepup']);
L('rev_lunge','Reverse Lunge (KH)',{q:1,g:1},['bss','stepup']);
L('stepup','Step-up (KH)',{q:1,g:.5},['bss','rev_lunge']);
L('curl_seated','Beinbeuger sitzend',{h:1},['curl_lying','nordic'],'Sitzend schlägt liegend beim Muskelaufbau (Maeo 2021): Hüfte gebeugt = Hamstrings gedehnt.');
L('curl_lying','Beinbeuger liegend',{h:1},['curl_seated','nordic']);
L('nordic','Nordic Curl (assistiert)',{h:1},['curl_seated','curl_lying'],'Langsam ablassen, mit Band oder Händen abfangen.');
L('calf_st','Wadenheben stehend',{c:1},['calf_lp','calf_smith']);
L('calf_lp','Wadenheben an der Beinpresse',{c:1},['calf_st','calf_smith']);
L('calf_smith','Wadenheben Multipresse',{c:1},['calf_st','calf_lp']);
L('calf_se','Wadenheben sitzend',{c:1},['calf_lp','calf_st']);
/* Druck */
L('bench','Bankdrücken (LH)',{ch:1,t:.5,fd:.5},['db_bench','smith_bench','machine_press']);
L('db_bench','KH-Bankdrücken',{ch:1,t:.5,fd:.5},['bench','machine_press']);
L('smith_bench','Bankdrücken Multipresse',{ch:1,t:.5,fd:.5},['bench','db_bench']);
L('machine_press','Brustpresse Maschine',{ch:1,t:.5,fd:.5},['db_bench','bench']);
L('dip_w','Dips mit Zusatzgewicht',{ch:1,t:1,fd:.5},['dip','dip_machine'],'Zusatzgewicht als kg. Ellbogen bis knapp unter Schulterhöhe.');
L('dip','Dips (Körpergewicht)',{ch:1,t:1,fd:.5},['dip_w','dip_assist','dip_machine'],'Gewicht leer lassen. Oben am Rep-Ziel: Zusatzgewicht.');
L('dip_assist','Dips assistiert',{ch:1,t:1,fd:.5},['dip','dip_machine'],'Unterstützung als negative kg, z. B. −20.');
L('dip_machine','Dip-Maschine',{ch:1,t:1,fd:.5},['dip','dip_assist']);
L('incl','Schrägbank-KH-Drücken',{ch:1,fd:.5,t:.5},['incl_machine']);
L('incl_machine','Schrägbank-Maschine',{ch:1,fd:.5,t:.5},['incl']);
L('db_ohp','KH-Schulterdrücken sitzend',{fd:1,sd:.5,t:.5},['machine_ohp']);
L('machine_ohp','Schulterpresse Maschine',{fd:1,sd:.5,t:.5},['db_ohp']);
/* Zug */
L('pullup_w','Weighted Pull-Up',{b:1,bi:.5},['chinup_w','latpd_heavy'],'Zusatzgewicht als kg.');
L('chinup_w','Weighted Chin-Up',{b:1,bi:.75},['pullup_w','latpd_heavy'],'Zusatzgewicht als kg.');
L('latpd_heavy','Latzug schwer',{b:1,bi:.5},['pullup_w']);
L('pullup','Pull-Up',{b:1,bi:.5},['neutral_pu','chinup','latpd','assisted_pu']);
L('neutral_pu','Pull-Up Neutralgriff',{b:1,bi:.5},['pullup','latpd']);
L('chinup','Chin-Up',{b:1,bi:.75},['pullup','latpd']);
L('latpd','Latzug',{b:1,bi:.5},['pullup','assisted_pu']);
L('assisted_pu','Pull-Up assistiert',{b:1,bi:.5},['pullup','latpd'],'Unterstützung als negative kg, z. B. −20.');
L('row','Chest-Supported Row',{b:1,rd:.5,bi:.5},['cable_row','db_row','tbar_cs']);
L('cable_row','Kabelrudern sitzend',{b:1,rd:.5,bi:.5},['row','db_row']);
L('db_row','Einarmiges KH-Rudern',{b:1,rd:.5,bi:.5},['row','cable_row']);
L('tbar_cs','T-Bar-Rudern mit Brustauflage',{b:1,rd:.5,bi:.5},['row','cable_row']);
L('face','Face Pull',{rd:1,b:.25},['rev_fly']);
L('rev_fly','Reverse Flys (KH)',{rd:1},['face']);
/* Arme & Schulter */
L('lat','Seitheben (KH)',{sd:1},['lat_cable','lat_machine']);
L('lat_cable','Seitheben am Kabel',{sd:1},['lat','lat_machine']);
L('lat_machine','Seitheben Maschine',{sd:1},['lat','lat_cable']);
L('bayes','Bayesian Curl (Kabel)',{bi:1},['incline_curl','cable_curl'],'Arm hinter dem Körper: Bizeps in der Dehnung belastet.');
L('incline_curl','Schrägbank-Curl (KH)',{bi:1},['bayes','db_curl'],'Bank 45–60°, Arme hängen gestreckt.');
L('curl','EZ-Curl',{bi:1},['db_curl','cable_curl','preacher']);
L('db_curl','KH-Curl',{bi:1},['curl','cable_curl']);
L('cable_curl','Kabel-Curl',{bi:1},['curl','bayes']);
L('preacher','Preacher Curl',{bi:1},['curl','db_curl']);
L('hammer','Hammer Curl',{bi:1},['curl']);
L('tri_oh','Overhead-Kabel-Trizeps',{t:1},['db_oh_ext']);
L('db_oh_ext','KH-Trizeps über Kopf',{t:1},['tri_oh']);
L('tri_pd','Trizeps-Pressdown',{t:1},['tri_oh']);
/* Rumpf */
L('crunch','Cable Crunch',{ab:1},['machine_crunch','decline_crunch']);
L('machine_crunch','Bauchmaschine',{ab:1},['crunch','decline_crunch']);
L('decline_crunch','Negativ-Crunch mit Gewicht',{ab:1},['crunch','machine_crunch']);
L('hlr','Hanging Leg Raise',{ab:1},['captain','rev_crunch']);
L('captain','Knieheben am Dip-Stand',{ab:1},['hlr','rev_crunch']);
L('rev_crunch','Reverse Crunch',{ab:1},['hlr','captain']);
L('carry','Suitcase Carry',{ab:.5},['farmer'],'Strecke in Metern pro Seite.');
L('farmer','Farmer Carry',{ab:.25},['carry'],'Strecke in Metern.');
/* Power */
L('box','Box Jump (niedrig, runtersteigen)',{},['squat_jump']);
L('squat_jump','Squat Jump',{},['box']);
L('mb_chest','Medball-Brustpass',{},['mb_wall']);
L('mb_wall','Medball-Wurf gegen Wand',{},['mb_chest']);
L('mb_toss','Medball-Scoop-Toss',{},['broad']);
L('broad','Standweitsprung',{},['mb_toss']);

const LP = 'Letzter Satz: bis zum Versagen, dann 4–6 Teilwiederholungen in der gedehnten Position.';

/* ---------- Plan ---------- */
function phase(w){ if(w<=3) return 'b1'; if(w===4||w===8) return 'dl'; if(w<=7) return 'b2'; if(w<=11) return 'b3'; return 'test'; }
const PH_LABEL = { b1:'Einstieg', b2:'Aufbau', b3:'Intensiv', dl:'Deload', test:'Testwoche' };
const BACK_NOTE = 'Rücken-Ampel rot → Pendulum Squat.';
/* slot · ex · sets · reps · rpe · rest (s) · type: main|bo|dp|bw|power|carry · note · superset */
const S_ = (slot, ex, sets, reps, rpe, rest, type, note, sup) => ({ slot, ex, sets, reps, rpe, rest, type, note: note || '', sup: sup || '' });

function gymA(w){ const p=phase(w), i=(w-1)%4, lite=p==='dl'||p==='test'; let fs;
  if(p==='b1') fs=S_('fs','fs',3,6,[6,6.5,7][i],180,'main',BACK_NOTE);
  else if(p==='b2') fs=S_('fs','fs',4,5,[7,7.5,8][i],180,'main',BACK_NOTE);
  else if(p==='b3') fs=S_('fs','fs',5,4,8,180,'main',BACK_NOTE);
  else if(p==='dl') fs=S_('fs','fs',2,5,6,180,'main','Deload: locker, Technik.');
  else fs=S_('fs','fs',1,3,9,240,'main','3RM: in 2,5–5-kg-Schritten hocharbeiten, Stopp bei RPE 9. Nur bei grüner Rücken-Ampel.');
  return [
    S_('box','box',lite?2:3,3,null,90,'power','Explosiv hoch, weich landen, runtersteigen.'),
    S_('calf_a','calf_st',lite?2:4,'8–12',lite?7:9.5,60,'dp',lite?'':'2 s Pause unten. '+LP),
    fs,
    S_('lat_a','lat',lite?2:3,'15–20',lite?7:9,0,'dp','Füllsatz in den Front-Squat-Pausen.'),
    S_('hc_a','curl_seated',lite?2:4,'8–12',lite?7:9.5,60,'dp',lite?'':LP,'S1'),
    S_('legext','legext',lite?2:3,'12–15',lite?7:9,60,'dp','','S1'),
    S_('ht','ht',lite?2:3,'8–12',lite?6:8,120,'dp','Kinn eingezogen, oben 1 s halten.'),
    S_('pu_light','pullup',lite?2:3,4,6,60,'bw','~4 Reps Reserve. Der schwere Zug kommt in Gym B.','S2'),
    S_('bi_a','bayes',lite?2:3,'10–15',lite?7:9.5,60,'dp',lite?'':LP,'S2'),
    S_('ab_a','hlr',lite?2:3,'10–15',lite?7:9,60,'dp','Becken einrollen, nicht schwingen. Ab 15 Reps: Gewicht zwischen die Füße.')
  ]; }
function gymB(w){ const p=phase(w), i=(w-1)%4, lite=p==='dl'||p==='test';
  const out=[S_('mb_chest','mb_chest',lite?2:3,5,null,60,'power','Maximal explosiv.')];
  if(p==='b1'){ out.push(S_('bench_top','bench',1,6,[7,7.5,8][i],180,'main')); out.push(S_('bench_bo','bench',3,6,7,120,'bo','≈ 90 % vom heutigen Top-Set.')); }
  else if(p==='b2'){ out.push(S_('bench_top','bench',1,5,8,180,'main')); out.push(S_('bench_bo','bench',3,5,7,120,'bo','≈ 90 % vom heutigen Top-Set.')); }
  else if(p==='b3'){ out.push(S_('bench_top','bench',1,3,8.5,240,'main')); out.push(S_('bench_bo','bench',3,5,7,120,'bo','≈ 85 % vom heutigen Top-Set.')); }
  else if(p==='dl') out.push(S_('bench_top','bench',2,6,6,120,'main','Deload: locker.'));
  else out.push(S_('bench_top','bench',1,3,9,240,'main','3RM: hocharbeiten, Stopp bei RPE 9. Spotter oder Safeties.'));
  if(p==='test') out.push(S_('pu_max','pullup',1,'AMRAP',10,120,'bw','Max-Test ohne Zusatzgewicht: tot hängen, Kinn über die Stange.','S1'));
  else if(p==='dl') out.push(S_('wpu','pullup',2,5,6,90,'bw','Deload, ohne Zusatzgewicht.','S1'));
  else out.push(S_('wpu','pullup_w',4,'3–5',p==='b1'?7:8,120,'dp','Zusatzgewicht am Gürtel als kg.','S1'));
  out.push(
    S_('calf_b','calf_se',lite?2:3,'12–15',lite?7:9.5,60,'dp',lite?'':LP,'S1'),
    S_('dip_b',p==='dl'?'dip':'dip_w',lite?2:3,'6–10',lite?6:8,120,'dp','','S2'),
    S_('row','row',lite?2:3,'10–12',lite?6:8,90,'dp','','S2'),
    S_('lat_b','lat',lite?2:3,'15–20',lite?7:9,45,'dp','','S3'),
    S_('bi_b','curl',lite?2:3,'8–12',lite?7:9.5,45,'dp',lite?'':'Letzter Satz bis zum Versagen.','S3'),
    S_('ab_b','crunch',lite?2:4,'10–15',lite?7:9,60,'dp','Rücken rund einrollen, Hüfte bleibt stehen. Gewicht steigern wie bei jeder Übung.'),
    S_('hc_b','nordic',2,'4–8',lite?6:8,90,'dp','Langsam ablassen (3–5 s). Schützt nachweislich vor Hamstring-Verletzungen.'));
  return out; }
function gymC(w){ const p=phase(w), i=(w-1)%4, lite=p==='dl'||p==='test';
  const trpe = p==='b1' ? [6,6.5,7][i] : p==='dl' ? 5 : 7;
  return [
    S_('mb_toss','mb_toss',lite?2:3,3,null,60,'power','Explosive Hüftstreckung, Rücken neutral.'),
    S_('calf_c','calf_lp',lite?2:4,'10–15',lite?7:9.5,60,'dp',lite?'':LP),
    S_('trap','trap',lite?2:3,5,trpe,180,'main','Bleibt im ganzen Block bei maximal RPE 7.'),
    S_('pu_vol','pullup',lite?3:5,5,8,60,'bw','Pro Woche +1 Rep gesamt, bis 5×7.','S1'),
    p==='test' ? S_('dip_c','dip',1,'AMRAP',10,60,'bw','Dip-Test: Körpergewicht, saubere Tiefe.','S1') : S_('dip_c','dip',lite?2:3,'8–12',lite?6:8,60,'dp','','S1'),
    S_('bss','bss',lite?2:3,'8–10',lite?6:8,90,'dp','Reps pro Bein, schwaches Bein zuerst.'),
    S_('hc_c','curl_seated',lite?2:4,'10–15',lite?7:9.5,60,'dp',lite?'':LP,'S2'),
    S_('bi_c','incline_curl',lite?2:3,'10–12',lite?7:9.5,60,'dp',lite?'':LP,'S2'),
    S_('lat_c','lat',lite?2:3,'15–20',lite?7:9,30,'dp','','S3'),
    S_('face','face',lite?2:3,'15–20',lite?7:9,30,'dp','','S3'),
    S_('ab_c','crunch',lite?2:3,'10–15',lite?7:9,45,'dp','','S3'),
    S_('carry','carry',2,30,8,60,'carry','Eine KH, Rumpf aufrecht, nicht zur Seite kippen.')
  ]; }
function hiit(w){ const p=phase(w);
  if(w===4) return { mode:'z2', min:25, title:'Z2 statt Intervalle', sub:'Deload: 25 min locker' };
  if(w===8) return { mode:'z2', min:30, title:'Z2 statt Intervalle', sub:'Deload: 30 min locker' };
  if(p==='b1') return { mode:'int', reps:4, dur:3, title:'4 × 3 min', sub:'3 min locker zwischen den Intervallen' };
  if(p==='b2') return { mode:'int', reps:4, dur:4, title:'4 × 4 min', sub:'3 min locker zwischen den Intervallen' };
  if(p==='b3') return { mode:'int', reps:4, dur:4, title:'4 × 4 min, mehr Watt', sub:'Umfang bleibt, Leistung pro Intervall steigt' };
  return { mode:'test', title:'2000 m Rudern', sub:'Test: gleichmäßig pacen, letzte 500 m alles' }; }
const Z2MIN = [40,40,40,30,50,50,50,35,50,50,50,40];
/* Einheiten ohne festes Datum – Wochentag wählst du in den Einstellungen */
const SESSIONS = [
  { k:'A', kind:'gym', title:'Gym A', sub:'Unterkörper + Zug' },
  { k:'B', kind:'gym', title:'Gym B', sub:'Oberkörper' },
  { k:'H', kind:'hiit', title:'HIIT', sub:'Air-Bike oder Incline-Laufband' },
  { k:'C', kind:'gym', title:'Gym C', sub:'Ganzkörper' },
  { k:'Z', kind:'z2', title:'Z2 Grundlage', sub:'Rudern, Rad, Schwimmen, Incline Walk' } ];
const ORDER = ['A','B','H','C','Z'];
const DEFAULT_DAYMAP = { A:1, B:2, H:3, C:5, Z:6 }; /* 0 = Sonntag */
function planFor(w,k){ return k==='A'?gymA(w):k==='B'?gymB(w):k==='C'?gymC(w):[]; }

/* ---------- Freie Aktivitäten ---------- */
const ACT_TYPES = [
  { id:'joggen', name:'Joggen', short:'Lauf', cardio:true, dist:true, run:true },
  { id:'schwimmen', name:'Schwimmen', short:'Swim', cardio:true, dist:true },
  { id:'rad', name:'Radfahren', short:'Rad', cardio:true, dist:true },
  { id:'gehen', name:'Gehen', short:'Geh', cardio:true, dist:true },
  { id:'wandern', name:'Wandern', short:'Berg', cardio:true, dist:true },
  { id:'rudern', name:'Rudern', short:'Ruder', cardio:true, dist:true },
  { id:'fussball', name:'Fußball', short:'Ball', cardio:true, dist:false, run:true },
  { id:'kampfsport', name:'Kampfsport', short:'Kampf', cardio:true, dist:false },
  { id:'kraft', name:'Krafttraining frei', short:'Kraft', cardio:false, dist:false, strength:true },
  { id:'mobility', name:'Mobility / Yoga', short:'Mobil', cardio:false, dist:false },
  { id:'sonst', name:'Sonstiges', short:'Akt', cardio:true, dist:false } ];
const ACT_MAP = Object.fromEntries(ACT_TYPES.map(a => [a.id, a]));
/* Health-Connect-Workouttyp → Aktivität */
const HC_TYPE = { running:'joggen', runningTreadmill:'joggen', trackAndField:'joggen', swimming:'schwimmen', swimmingPool:'schwimmen', swimmingOpenWater:'schwimmen',
  cycling:'rad', bikingStationary:'rad', distanceCycling:'rad', walking:'gehen', hiking:'wandern', rowing:'rudern', rowingMachine:'rudern', soccer:'fussball',
  boxing:'kampfsport', martialArts:'kampfsport', kickboxing:'kampfsport', wrestling:'kampfsport',
  strengthTraining:'kraft', traditionalStrengthTraining:'kraft', functionalStrengthTraining:'kraft', weightlifting:'kraft', calisthenics:'kraft',
  yoga:'mobility', stretching:'mobility', flexibility:'mobility', pilates:'mobility', highIntensityIntervalTraining:'sonst' };
/* Zepp-Export SPORT.type (Schätzung, im Zweifel „Sonstiges“) */
const ZEPP_TYPE = { 1:'joggen', 6:'gehen', 8:'joggen', 9:'rad', 10:'rad', 14:'schwimmen', 15:'schwimmen', 16:'kraft' };

/* ---------- Lebensmittel-Presets (Schätzwerte, editierbar) ---------- */
const PRESET_FOODS = [
  { id:'p_koefte', name:'Hähnchen-Köfte (eigenes Rezept)', base:'piece', kcal:100, p:19.6, f:1.1, c:3.0, pieceG:95 },
  { id:'p_syrniki', name:'Syrniki (eigenes Rezept)', base:'piece', kcal:116, p:10.4, f:2.3, c:12.7, pieceG:70 },
  { id:'p_skyr', name:'Skyr natur', base:'100g', kcal:63, p:11, f:0.2, c:4 },
  { id:'p_reis', name:'Reis, gekocht', base:'100g', kcal:130, p:2.7, f:0.3, c:28 },
  { id:'p_kartoffel', name:'Kartoffeln, gekocht', base:'100g', kcal:77, p:2, f:0.1, c:17 },
  { id:'p_gemuese', name:'Gemüse gemischt', base:'100g', kcal:30, p:2, f:0.3, c:5 },
  { id:'p_beeren', name:'Beeren (TK)', base:'100g', kcal:45, p:0.8, f:0.3, c:9 },
  { id:'p_banane', name:'Banane', base:'piece', kcal:105, p:1.3, f:0.4, c:27, pieceG:120 },
  { id:'p_whey', name:'Whey (30 g Scoop)', base:'piece', kcal:120, p:24, f:1.5, c:2, pieceG:30 },
  { id:'p_ei', name:'Ei (M)', base:'piece', kcal:78, p:6.5, f:5.3, c:0.5, pieceG:55 },
  { id:'p_oel', name:'Olivenöl', base:'100g', kcal:884, p:0, f:100, c:0 },
  { id:'p_haehnchen', name:'Hähnchenbrust, roh', base:'100g', kcal:105, p:23, f:1.2, c:0 },
  { id:'p_quark', name:'Magerquark', base:'100g', kcal:67, p:12, f:0.3, c:4 },
  { id:'p_hafer', name:'Haferflocken', base:'100g', kcal:370, p:13, f:7, c:59 } ];
const DAY_TEMPLATE = [
  { meal:'Frühstück', food:'p_syrniki', qty:3, unit:'Stk' }, { meal:'Frühstück', food:'p_skyr', qty:250, unit:'g' }, { meal:'Frühstück', food:'p_beeren', qty:100, unit:'g' },
  { meal:'Mittag', food:'p_koefte', qty:4, unit:'Stk' }, { meal:'Mittag', food:'p_reis', qty:250, unit:'g' }, { meal:'Mittag', food:'p_gemuese', qty:300, unit:'g' }, { meal:'Mittag', food:'p_oel', qty:10, unit:'g' },
  { meal:'Snack', food:'p_banane', qty:1, unit:'Stk' }, { meal:'Snack', food:'p_whey', qty:1, unit:'Stk' } ];
const MEALS = ['Frühstück','Mittag','Snack','Abend'];
