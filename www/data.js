/* Hybridblock – Plan, Übungsbibliothek, Aktivitäten, Lebensmittel-Presets */
'use strict';

/* ---------- Muskeln ----------
   Schwerpunkt (mehr Volumen + näher am Versagen) wählt jede Person selbst (S.settings.prio), es gibt keine festen Defizit-Muskeln */
const MUSCLES = { c:$t('Waden'), h:$t('Hamstrings'), bi:$t('Bizeps'), ab:$t('Bauch'), q:$t('Quads'), g:$t('Glutes'), ch:$t('Brust'), t:$t('Trizeps'), fd:$t('Schulter vorn'), sd:$t('Schulter seitlich'), rd:$t('Schulter hinten'), b:$t('Rücken') };
const PRIORITY = [];
/* Schwerpunkt pro Person: eigene Wahl, sonst aus dem Fokus im Fragebogen (Unterkörper → Glutes, Quads, Hamstrings), sonst keiner */
function prioMuscles() { const st = (typeof S !== 'undefined' && S && S.settings) || {}; if (Array.isArray(st.prio)) return st.prio.filter(m => MUSCLES[m]).slice(0, 4);
  const fo = (st.q || {}).focus; return fo === 'lower' ? ['g', 'q', 'h'] : fo === 'upper' ? ['ch', 'b', 'sd'] : []; }
function prioSync() { const p = prioMuscles(); PRIORITY.splice(0, PRIORITY.length, ...p); return PRIORITY; }
/* Zielbereich direkte + anteilige Sätze pro Woche (im Defizit) */
const VOL_TARGET = { prio:[12,20], other:[6,14] };

const LIB = {};
function L(id, name, muscles, alts, note) { LIB[id] = { id, name, muscles, alts: alts || [], note: note || '' }; }

/* Beine */
L('fs',$t('Front Squat'),{q:1,g:.5,ab:.25},['pend','hack','goblet']);
L('pend',$t('Pendulum Squat'),{q:1,g:.5},['hack','legpress','fs']);
L('hack',$t('Hack Squat'),{q:1,g:.5},['pend','legpress']);
L('legpress',$t('Beinpresse'),{q:1,g:.5},['pend','hack']);
L('goblet',$t('Goblet Squat'),{q:1,g:.5},['pend','fs']);
L('trap',$t('Trap-Bar-Kreuzheben (hohe Griffe)'),{g:1,h:.5,q:.5},['rdl_db','hyper45','glute_bridge']);
L('rdl_db',$t('Romanian Deadlift (KH)'),{h:1,g:.5},['hyper45','trap']);
L('hyper45',$t('45°-Hyperextension'),{g:1,h:.5},['rdl_db','glute_bridge']);
L('glute_bridge',$t('Glute Bridge (Langhantel)'),{g:1},['ht','ht_machine']);
L('ht',$t('Hip Thrust'),{g:1,h:.25},['ht_machine','glute_bridge']);
L('ht_machine',$t('Hip-Thrust-Maschine'),{g:1},['ht','glute_bridge']);
L('legext',$t('Leg Extension'),{q:1},['sissy']);
L('sissy',$t('Sissy Squat'),{q:1},['legext']);
L('bss',$t('Bulgarian Split Squat'),{q:1,g:1},['rev_lunge','stepup']);
L('rev_lunge',$t('Reverse Lunge (KH)'),{q:1,g:1},['bss','stepup']);
L('stepup',$t('Step-up (KH)'),{q:1,g:.5},['bss','rev_lunge']);
L('curl_seated',$t('Leg Curl sitzend'),{h:1},['curl_lying','nordic'],$t('Sitzend schlägt liegend beim Muskelaufbau (Maeo 2021): Hüfte gebeugt = Hamstrings gedehnt.'));
L('curl_lying',$t('Leg Curl liegend'),{h:1},['curl_seated','nordic']);
L('nordic',$t('Nordic Curl (assistiert)'),{h:1},['curl_seated','curl_lying'],$t('Langsam ablassen, mit Band oder Händen abfangen.'));
L('calf_st',$t('Calf Raise stehend'),{c:1},['calf_lp','calf_smith']);
L('calf_lp',$t('Calf Raise an der Beinpresse'),{c:1},['calf_st','calf_smith']);
L('calf_smith',$t('Calf Raise Multipresse'),{c:1},['calf_st','calf_lp']);
L('calf_se',$t('Calf Raise sitzend'),{c:1},['calf_lp','calf_st']);
/* Druck */
L('bench',$t('Bankdrücken (LH)'),{ch:1,t:.5,fd:.5},['db_bench','smith_bench','machine_press']);
L('db_bench',$t('KH-Bankdrücken'),{ch:1,t:.5,fd:.5},['bench','machine_press']);
L('smith_bench',$t('Bankdrücken Multipresse'),{ch:1,t:.5,fd:.5},['bench','db_bench']);
L('machine_press',$t('Brustpresse Maschine'),{ch:1,t:.5,fd:.5},['db_bench','bench']);
L('dip_w',$t('Dips mit Zusatzgewicht'),{ch:1,t:1,fd:.5},['dip','dip_machine'],$t('Zusatzgewicht als kg. Ellbogen bis knapp unter Schulterhöhe.'));
L('dip',$t('Dips (Körpergewicht)'),{ch:1,t:1,fd:.5},['dip_w','dip_assist','dip_machine'],$t('Gewicht leer lassen. Oben am Rep-Ziel: Zusatzgewicht.'));
L('dip_assist',$t('Dips assistiert'),{ch:1,t:1,fd:.5},['dip','dip_machine'],$t('Unterstützung als negative kg, z. B. −20.'));
L('dip_machine',$t('Dip-Maschine'),{ch:1,t:1,fd:.5},['dip','dip_assist']);
L('incl',$t('Schrägbank-KH-Drücken'),{ch:1,fd:.5,t:.5},['incl_machine']);
L('incl_machine',$t('Schrägbank-Maschine'),{ch:1,fd:.5,t:.5},['incl']);
L('db_ohp',$t('KH-Schulterdrücken sitzend'),{fd:1,sd:.5,t:.5},['machine_ohp']);
L('machine_ohp',$t('Schulterpresse Maschine'),{fd:1,sd:.5,t:.5},['db_ohp']);
/* Zug */
L('pullup_w',$t('Weighted Pull-Up'),{b:1,bi:.5},['chinup_w','latpd_heavy'],$t('Zusatzgewicht als kg.'));
L('chinup_w',$t('Weighted Chin-Up'),{b:1,bi:.75},['pullup_w','latpd_heavy'],$t('Zusatzgewicht als kg.'));
L('latpd_heavy',$t('Latzug schwer'),{b:1,bi:.5},['pullup_w']);
L('pullup',$t('Pull-Up'),{b:1,bi:.5},['neutral_pu','chinup','latpd','assisted_pu']);
L('neutral_pu',$t('Pull-Up Neutralgriff'),{b:1,bi:.5},['pullup','latpd']);
L('chinup',$t('Chin-Up'),{b:1,bi:.75},['pullup','latpd']);
L('latpd',$t('Latzug'),{b:1,bi:.5},['pullup','assisted_pu']);
L('assisted_pu',$t('Pull-Up assistiert'),{b:1,bi:.5},['pullup','latpd'],$t('Unterstützung als negative kg, z. B. −20.'));
L('row',$t('Chest-Supported Row'),{b:1,rd:.5,bi:.5},['cable_row','db_row','tbar_cs']);
L('cable_row',$t('Kabelrudern sitzend'),{b:1,rd:.5,bi:.5},['row','db_row']);
L('db_row',$t('Einarmiges KH-Rudern'),{b:1,rd:.5,bi:.5},['row','cable_row']);
L('tbar_cs',$t('T-Bar-Rudern mit Brustauflage'),{b:1,rd:.5,bi:.5},['row','cable_row']);
L('face',$t('Face Pull'),{rd:1,b:.25},['rev_fly']);
L('rev_fly',$t('Reverse Flys (KH)'),{rd:1},['face']);
/* Arme & Schulter */
L('lat',$t('Seitheben (KH)'),{sd:1},['lat_cable','lat_machine']);
L('lat_cable',$t('Seitheben am Kabel'),{sd:1},['lat','lat_machine']);
L('lat_machine',$t('Seitheben Maschine'),{sd:1},['lat','lat_cable']);
L('bayes',$t('Bayesian Curl (Kabel)'),{bi:1},['incline_curl','cable_curl'],$t('Arm hinter dem Körper: Bizeps in der Dehnung belastet.'));
L('incline_curl',$t('Schrägbank-Curl (KH)'),{bi:1},['bayes','db_curl'],$t('Bank 45–60°, Arme hängen gestreckt.'));
L('curl',$t('EZ-Curl'),{bi:1},['db_curl','cable_curl','preacher']);
L('db_curl',$t('KH-Curl'),{bi:1},['curl','cable_curl']);
L('cable_curl',$t('Kabel-Curl'),{bi:1},['curl','bayes']);
L('preacher',$t('Preacher Curl'),{bi:1},['curl','db_curl']);
L('hammer',$t('Hammer Curl'),{bi:1},['curl']);
L('tri_oh',$t('Overhead-Kabel-Trizeps'),{t:1},['db_oh_ext']);
L('db_oh_ext',$t('KH-Trizeps über Kopf'),{t:1},['tri_oh']);
L('tri_pd',$t('Trizeps-Pressdown'),{t:1},['tri_oh']);
/* Rumpf */
L('crunch',$t('Cable Crunch'),{ab:1},['machine_crunch','decline_crunch']);
L('machine_crunch',$t('Bauchmaschine'),{ab:1},['crunch','decline_crunch']);
L('decline_crunch',$t('Negativ-Crunch mit Gewicht'),{ab:1},['crunch','machine_crunch']);
L('hlr',$t('Hanging Leg Raise'),{ab:1},['captain','rev_crunch']);
L('captain',$t('Knieheben am Dip-Stand'),{ab:1},['hlr','rev_crunch']);
L('rev_crunch',$t('Reverse Crunch'),{ab:1},['hlr','captain']);
L('carry',$t('Suitcase Carry'),{ab:.5},['farmer'],$t('Strecke in Metern pro Seite.'));
L('farmer',$t('Farmer Carry'),{ab:.25},['carry'],$t('Strecke in Metern.'));
/* Power */
L('box',$t('Box Jump (niedrig, runtersteigen)'),{},['squat_jump']);
L('squat_jump',$t('Squat Jump'),{},['box']);
L('mb_chest',$t('Medball-Brustpass'),{},['mb_wall']);
L('mb_wall',$t('Medball-Wurf gegen Wand'),{},['mb_chest']);
L('mb_toss',$t('Medball-Scoop-Toss'),{},['broad']);
L('broad',$t('Broad Jump'),{},['mb_toss']);

/* Zuordnung zu RepDB (repdb.co, Free Tier): Bilder und Anleitungen werden zur Laufzeit geladen, nicht mitgeliefert */
const REPDB = {"fs":"front-squat","hack":"hack-squat","legpress":"leg-press","goblet":"goblet-squat","rdl_db":"dumbbell-romanian-deadlift","hyper45":"back-extension","glute_bridge":"barbell-glute-bridge","ht":"hip-thrust","ht_machine":"hip-thrust","legext":"leg-extension","bss":"bulgarian-split-squat","rev_lunge":"reverse-lunge","stepup":"step-ups","curl_seated":"seated-leg-curl","curl_lying":"leg-curl","nordic":"nordic-hamstring-curl","calf_st":"standing-calf-raise","calf_smith":"smith-machine-calf-raise","calf_se":"seated-calf-raise","calf_lp":"machine-calf-raise","bench":"bench-press","db_bench":"db-bench-press","smith_bench":"smith-machine-bench-press","machine_press":"chest-press-machine","dip_w":"dips","dip":"dips","dip_assist":"assisted-dips","dip_machine":"plate-loaded-seated-dip-machine","incl":"incline-db-press","db_ohp":"seated-db-press","machine_ohp":"machine-shoulder-press","pullup_w":"weighted-pull-up","chinup_w":"chin-ups","latpd_heavy":"lat-pulldown","pullup":"pull-up","neutral_pu":"neutral-grip-pull-ups","chinup":"chin-ups","latpd":"lat-pulldown","assisted_pu":"assisted-pull-ups","row":"chest-supported-db-row","cable_row":"seated-cable-row","tbar_cs":"t-bar-row","face":"face-pull","rev_fly":"dumbbell-reverse-fly","lat":"lateral-raise","lat_cable":"cable-lateral-raise","incline_curl":"incline-db-curl","curl":"ez-bar-curl","db_curl":"seated-dumbbell-curl","cable_curl":"cable-curl","preacher":"preacher-curl","hammer":"hammer-curl","tri_oh":"cable-overhead-tricep-extension","db_oh_ext":"overhead-tricep-extension","tri_pd":"tricep-pushdown","crunch":"cable-crunch","machine_crunch":"machine-seated-crunch","decline_crunch":"decline-crunch","hlr":"hanging-leg-raise","captain":"captains-chair-knee-raise","rev_crunch":"reverse-crunches","carry":"suitcase-carry","farmer":"dumbbell-farmers-walk","box":"box-jump","squat_jump":"jump-squat"};

const LP = $t('Letzter Satz: bis zum Versagen, dann 4–6 Teilwiederholungen in der gedehnten Position.');

/* ---------- Plan ---------- */
function phase(w){ const P = typeof S !== 'undefined' && S && S.plan && S.plan.phases; if (P && P[w - 1]) return P[w - 1]; if(w<=3) return 'b1'; if(w===4||w===8) return 'dl'; if(w<=7) return 'b2'; if(w<=11) return 'b3'; return 'test'; }
const PH_LABEL = { b1:$t('Einstieg'), b2:$t('Aufbau'), b3:$t('Intensiv'), dl:$t('Deload'), test:$t('Testwoche') };
const BACK_NOTE = $t('Rücken-Ampel rot → Pendulum Squat.');
/* slot · ex · sets · reps · rpe · rest (s) · type: main|bo|dp|bw|power|carry · note · superset */
const S_ = (slot, ex, sets, reps, rpe, rest, type, note, sup) => ({ slot, ex, sets, reps, rpe, rest, type, note: note || '', sup: sup || '' });

function gymA(w){ const p=phase(w), i=(w-1)%4, lite=p==='dl'||p==='test'; let fs;
  if(p==='b1') fs=S_('fs','fs',3,6,[6,6.5,7][i],180,'main',BACK_NOTE);
  else if(p==='b2') fs=S_('fs','fs',4,5,[7,7.5,8][i],180,'main',BACK_NOTE);
  else if(p==='b3') fs=S_('fs','fs',5,4,8,180,'main',BACK_NOTE);
  else if(p==='dl') fs=S_('fs','fs',2,5,6,180,'main',$t('Deload: locker, Technik.'));
  else fs=S_('fs','fs',1,3,9,240,'main',$t('3RM: in 2,5–5-kg-Schritten hocharbeiten, Stopp bei RPE 9. Nur bei grüner Rücken-Ampel.'));
  fs.sup='F'; fs.gm='fa'; /* Seitheben als Füllsatz in den Front-Squat-Pausen */
  return [
    S_('box','box',lite?2:3,3,null,90,'power',$t('Explosiv hoch, weich landen, runtersteigen.')),
    S_('calf_a','calf_st',lite?2:4,'8–12',lite?7:9.5,60,'dp',lite?'':$t('2 s Pause unten. ')+LP),
    fs,
    Object.assign(S_('lat_a','lat',lite?2:3,'15–20',lite?7:9,0,'dp',$t('Füllsatz in den Front-Squat-Pausen.'),'F'),{gm:'fill'}),
    S_('hc_a','curl_seated',lite?2:4,'8–12',lite?7:9.5,60,'dp',lite?'':LP,'S1'),
    S_('legext','legext',lite?2:3,'12–15',lite?7:9,60,'dp','','S1'),
    S_('ht','ht',lite?2:3,'8–12',lite?6:8,120,'dp',$t('Kinn eingezogen, oben 1 s halten.')),
    S_('pu_light','pullup',lite?2:3,4,6,60,'bw',$t('~4 Reps Reserve. Der schwere Zug kommt in Gym B.'),'S2'),
    S_('bi_a','bayes',lite?2:3,'10–15',lite?7:9.5,60,'dp',lite?'':LP,'S2'),
    S_('ab_a','hlr',lite?2:3,'10–15',lite?7:9,60,'dp',$t('Becken einrollen, nicht schwingen. Ab 15 Reps: Gewicht zwischen die Füße.'))
  ]; }
function gymB(w){ const p=phase(w), i=(w-1)%4, lite=p==='dl'||p==='test';
  const out=[S_('mb_chest','mb_chest',lite?2:3,5,null,60,'power',$t('Maximal explosiv.'))];
  if(p==='b1'){ out.push(S_('bench_top','bench',1,6,[7,7.5,8][i],180,'main')); out.push(S_('bench_bo','bench',3,6,7,120,'bo',$t('≈ 90 % vom heutigen Top-Set.'))); }
  else if(p==='b2'){ out.push(S_('bench_top','bench',1,5,8,180,'main')); out.push(S_('bench_bo','bench',3,5,7,120,'bo',$t('≈ 90 % vom heutigen Top-Set.'))); }
  else if(p==='b3'){ out.push(S_('bench_top','bench',1,3,8.5,240,'main')); out.push(S_('bench_bo','bench',3,5,7,120,'bo',$t('≈ 85 % vom heutigen Top-Set.'))); }
  else if(p==='dl') out.push(S_('bench_top','bench',2,6,6,120,'main',$t('Deload: locker.')));
  else out.push(S_('bench_top','bench',1,3,9,240,'main',$t('3RM: hocharbeiten, Stopp bei RPE 9. Spotter oder Safeties.')));
  if(p==='test') out.push(S_('pu_max','pullup',1,$t('AMRAP'),10,120,'bw',$t('Max-Test ohne Zusatzgewicht: tot hängen, Kinn über die Stange.'),'S1'));
  else if(p==='dl') out.push(S_('wpu','pullup',2,5,6,90,'bw',$t('Deload, ohne Zusatzgewicht.'),'S1'));
  else out.push(S_('wpu','pullup_w',4,'3–5',p==='b1'?7:8,120,'dp',$t('Zusatzgewicht am Gürtel als kg.'),'S1'));
  out.push(
    S_('calf_b','calf_se',lite?2:3,'12–15',lite?7:9.5,60,'dp',lite?'':LP,'S1'),
    S_('dip_b',p==='dl'?'dip':'dip_w',lite?2:3,'6–10',lite?6:8,120,'dp','','S2'),
    S_('row','row',lite?2:3,'10–12',lite?6:8,90,'dp','','S2'),
    S_('lat_b','lat',lite?2:3,'15–20',lite?7:9,45,'dp','','S3'),
    S_('bi_b','curl',lite?2:3,'8–12',lite?7:9.5,45,'dp',lite?'':$t('Letzter Satz bis zum Versagen.'),'S3'),
    S_('ab_b','crunch',lite?2:4,'10–15',lite?7:9,60,'dp',$t('Rücken rund einrollen, Hüfte bleibt stehen. Gewicht steigern wie bei jeder Übung.')),
    S_('hc_b','nordic',2,'4–8',lite?6:8,90,'dp',$t('Langsam ablassen (3–5 s). Schützt nachweislich vor Hamstring-Verletzungen.')));
  return out; }
function gymC(w){ const p=phase(w), i=(w-1)%4, lite=p==='dl'||p==='test';
  const trpe = p==='b1' ? [6,6.5,7][i] : p==='dl' ? 5 : 7;
  return [
    S_('mb_toss','mb_toss',lite?2:3,3,null,60,'power',$t('Explosive Hüftstreckung, Rücken neutral.')),
    S_('calf_c','calf_lp',lite?2:4,'10–15',lite?7:9.5,60,'dp',lite?'':LP),
    S_('trap','trap',lite?2:3,5,trpe,180,'main',$t('Bleibt im ganzen Block bei maximal RPE 7.')),
    S_('pu_vol','pullup',lite?3:5,5,8,60,'bw',$t('Pro Woche +1 Rep gesamt, bis 5×7.'),'S1'),
    p==='test' ? S_('dip_c','dip',1,$t('AMRAP'),10,60,'bw',$t('Dip-Test: Körpergewicht, saubere Tiefe.'),'S1') : S_('dip_c','dip',lite?2:3,'8–12',lite?6:8,60,'dp','','S1'),
    S_('bss','bss',lite?2:3,'8–10',lite?6:8,90,'dp',$t('Reps pro Bein, schwaches Bein zuerst.')),
    S_('hc_c','curl_seated',lite?2:4,'10–15',lite?7:9.5,60,'dp',lite?'':LP,'S2'),
    S_('bi_c','incline_curl',lite?2:3,'10–12',lite?7:9.5,60,'dp',lite?'':LP,'S2'),
    S_('lat_c','lat',lite?2:3,'15–20',lite?7:9,30,'dp','','S3'),
    S_('face','face',lite?2:3,'15–20',lite?7:9,30,'dp','','S3'),
    S_('ab_c','crunch',lite?2:3,'10–15',lite?7:9,45,'dp','','S3'),
    S_('carry','carry',2,30,8,60,'carry',$t('Eine KH, Rumpf aufrecht, nicht zur Seite kippen.'))
  ]; }
function hiit(w){ const p=phase(w);
  if(w===4) return { mode:'z2', min:25, title:$t('Z2 statt Intervalle'), sub:$t('Deload: 25 min locker') };
  if(w===8) return { mode:'z2', min:30, title:$t('Z2 statt Intervalle'), sub:$t('Deload: 30 min locker') };
  if(p==='b1') return { mode:'int', reps:4, dur:3, title:$t('4 × 3 min'), sub:$t('3 min locker zwischen den Intervallen') };
  if(p==='b2') return { mode:'int', reps:4, dur:4, title:$t('4 × 4 min'), sub:$t('3 min locker zwischen den Intervallen') };
  if(p==='b3') return { mode:'int', reps:4, dur:4, title:$t('4 × 4 min, mehr Watt'), sub:$t('Umfang bleibt, Leistung pro Intervall steigt') };
  return { mode:'test', title:$t('2000 m Rudern'), sub:$t('Test: gleichmäßig pacen, letzte 500 m alles') }; }
const Z2MIN = [40,40,40,30,50,50,50,35,50,50,50,40];
/* Einheiten des Hybridblock-Templates */
const SESSIONS = [
  { k:'A', kind:'gym', title:'Gym A', sub:'Unterkörper + Zug' },
  { k:'B', kind:'gym', title:'Gym B', sub:'Oberkörper' },
  { k:'H', kind:'hiit', title:'HIIT', sub:'Air-Bike oder Incline-Laufband' },
  { k:'C', kind:'gym', title:'Gym C', sub:'Ganzkörper' },
  { k:'Z', kind:'z2', title:'Z2 Grundlage', sub:'Rudern, Rad, Schwimmen, Incline Walk' } ];
const DEFAULT_DAYMAP = { A:1, B:2, H:3, C:5, Z:6 }; /* 0 = Sonntag */
const BASE_FN = { A: w => gymA(w), B: w => gymB(w), C: w => gymC(w) };
const KIND_LABEL = { gym:'Kraft', hiit:'HIIT', z2:'Z2 Grundlage' };

/* ---------- Plan-Vorlagen ----------
   Ein Plan ist reine Daten: Einheiten mit Basis-Template (base) und/oder eigenen Übungen (add),
   Anpassungen pro Slot in ov. Deload- und Testwochen werden für eigene Übungen automatisch leichter. */
const PLAN_TPL = {
  hybrid: { name:'Hybridblock', desc:'3× Kraft, 1× HIIT, 1× Z2. Schwerpunkt-Muskeln wählst du selbst.',
    sessions: () => [ { k:'A', kind:'gym', base:'A' }, { k:'B', kind:'gym', base:'B' }, { k:'H', kind:'hiit' }, { k:'C', kind:'gym', base:'C' }, { k:'Z', kind:'z2' } ] },
  gk3: { name:'Ganzkörper 3×', desc:'Einsteigerfreundlich: drei Ganzkörper-Einheiten mit Maschinen und Kurzhanteln, dazu Z2.',
    sessions: () => [
      { k:'A', kind:'gym', title:'Ganzkörper A', sub:'Beine, Druck, Zug', add:[
        S_('x_a1','legpress',3,'8–12',8,120,'dp'), S_('x_a2','db_bench',3,'8–12',8,120,'dp'), S_('x_a3','latpd',3,'10–12',8,90,'dp'),
        S_('x_a4','curl_seated',3,'10–15',9,60,'dp'), S_('x_a5','calf_st',3,'10–15',9,60,'dp'), S_('x_a6','crunch',3,'10–15',9,60,'dp') ] },
      { k:'B', kind:'gym', title:'Ganzkörper B', sub:'Hüfte, Schulter, Rücken', add:[
        S_('x_b1','rdl_db',3,'8–10',7,120,'dp'), S_('x_b2','incl',3,'8–12',8,90,'dp'), S_('x_b3','row',3,'10–12',8,90,'dp'),
        S_('x_b4','legext',2,'12–15',9,60,'dp'), S_('x_b5','lat',3,'15–20',9,45,'dp'), S_('x_b6','bayes',3,'10–15',9,60,'dp') ] },
      { k:'Z', kind:'z2' },
      { k:'C', kind:'gym', title:'Ganzkörper C', sub:'Beine, Dips, Klimmzüge', add:[
        S_('x_c1','hack',3,'8–12',8,120,'dp'), S_('x_c2','dip_assist',3,'6–10',8,90,'dp'), S_('x_c3','assisted_pu',3,'6–10',8,90,'dp'),
        S_('x_c4','ht',3,'8–12',8,90,'dp'), S_('x_c5','tri_pd',2,'12–15',9,60,'dp'), S_('x_c6','hlr',3,'10–15',9,60,'dp') ] } ] },
  blank: { name:'Leerer Plan', desc:'Zwei leere Kraft-Einheiten, du baust alles selbst.',
    sessions: () => [ { k:'A', kind:'gym', title:'Einheit A', sub:'', add:[] }, { k:'B', kind:'gym', title:'Einheit B', sub:'', add:[] } ] } };
const TPL_DAYMAP = { hybrid: DEFAULT_DAYMAP, gk3: { A:1, B:3, Z:4, C:5 }, blank: { A:1, B:4 } };
const NW = () => (typeof S !== 'undefined' && S && S.plan && S.plan.weeks) || 12;
function makePlan(tpl) { const T = PLAN_TPL[tpl] || PLAN_TPL.hybrid; return { tpl: PLAN_TPL[tpl] ? tpl : 'hybrid', name: T.name, phases: T.phases || null, weeks: T.weeks || 12, sessions: JSON.parse(JSON.stringify(T.sessions())), dayMap: Object.assign({}, TPL_DAYMAP[tpl] || DEFAULT_DAYMAP), note:'', targets:null, v:1 }; }
const SESSION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/* ---------- Freie Aktivitäten ---------- */
/* g = Gruppe, gps = draußen mit GPS aufzeichnen, m = Anzeige (pace min/km, speed km/h, p100 min/100 m, p500 min/500 m, none),
   hc = Workout-Name für Health Connect, met = MET-Wert für die Kalorienschätzung (Ainsworth Compendium, gerundet) */
const ACT_GROUPS = [['lauf', $t('Laufen und Gehen')], ['rad', $t('Rad')], ['wasser', $t('Wasser')], ['winter', $t('Winter und Rollen')], ['indoor', $t('Fitness und Geräte')], ['ball', $t('Ballsport')], ['kampf', $t('Kampfsport')], ['sonst', $t('Sonstiges')]];
const ACT_TYPES = [
  { id:'joggen', name:$t('Laufen'), short:$t('Lauf'), cardio:true, dist:true, run:true, g:'lauf', gps:true, m:'pace', hc:'running', met:9.8 },
  { id:'trail', name:$t('Trailrunning'), short:$t('Trail'), cardio:true, dist:true, run:true, g:'lauf', gps:true, m:'pace', hc:'running', met:9 },
  { id:'laufband', name:$t('Laufband'), short:$t('Band'), cardio:true, dist:true, run:true, g:'lauf', gps:false, m:'pace', hc:'runningTreadmill', met:9 },
  { id:'gehen', name:$t('Gehen'), short:$t('Geh'), cardio:true, dist:true, g:'lauf', gps:true, m:'pace', hc:'walking', met:3.5 },
  { id:'nordic', name:$t('Nordic Walking'), short:$t('NW'), cardio:true, dist:true, g:'lauf', gps:true, m:'pace', hc:'walking', met:4.8 },
  { id:'wandern', name:$t('Wandern'), short:$t('Berg'), cardio:true, dist:true, g:'lauf', gps:true, m:'pace', hc:'hiking', met:6 },
  { id:'rad', name:$t('Radfahren'), short:$t('Rad'), cardio:true, dist:true, g:'rad', gps:true, m:'speed', hc:'cycling', met:7.5 },
  { id:'mtb', name:$t('Mountainbike'), short:$t('MTB'), cardio:true, dist:true, g:'rad', gps:true, m:'speed', hc:'cycling', met:8.5 },
  { id:'ebike', name:$t('E-Bike'), short:$t('E-B'), cardio:true, dist:true, g:'rad', gps:true, m:'speed', hc:'cycling', met:4 },
  { id:'indoorrad', name:$t('Indoor-Rad / Spinning'), short:$t('Spin'), cardio:true, dist:true, g:'rad', gps:false, m:'speed', hc:'bikingStationary', met:7 },
  { id:'schwimmen', name:$t('Schwimmen (Becken)'), short:$t('Swim'), cardio:true, dist:true, g:'wasser', gps:false, m:'p100', hc:'swimmingPool', met:7 },
  { id:'freiwasser', name:$t('Freiwasserschwimmen'), short:$t('OW'), cardio:true, dist:true, g:'wasser', gps:true, m:'p100', hc:'swimmingOpenWater', met:8 },
  { id:'rudern', name:$t('Rudergerät'), short:$t('Ruder'), cardio:true, dist:true, g:'indoor', gps:false, m:'p500', hc:'rowingMachine', met:7 },
  { id:'rudernboot', name:$t('Rudern (Boot)'), short:$t('Boot'), cardio:true, dist:true, g:'wasser', gps:true, m:'p500', hc:'rowing', met:6 },
  { id:'kajak', name:$t('Kajak, Kanu, SUP'), short:$t('SUP'), cardio:true, dist:true, g:'wasser', gps:true, m:'speed', hc:'paddling', met:5 },
  { id:'langlauf', name:$t('Skilanglauf'), short:$t('Loipe'), cardio:true, dist:true, g:'winter', gps:true, m:'speed', hc:'crossCountrySkiing', met:9 },
  { id:'ski', name:$t('Ski alpin'), short:$t('Ski'), cardio:true, dist:true, g:'winter', gps:true, m:'speed', hc:'skiing', met:5.3 },
  { id:'snowboard', name:$t('Snowboard'), short:$t('Board'), cardio:true, dist:true, g:'winter', gps:true, m:'speed', hc:'snowboarding', met:5.3 },
  { id:'schneeschuh', name:$t('Schneeschuhwandern'), short:$t('Schn'), cardio:true, dist:true, g:'winter', gps:true, m:'pace', hc:'snowshoeing', met:7 },
  { id:'inline', name:$t('Inlineskaten'), short:$t('Inl'), cardio:true, dist:true, g:'winter', gps:true, m:'speed', hc:'skating', met:7.5 },
  { id:'eislauf', name:$t('Eislaufen'), short:$t('Eis'), cardio:true, dist:false, g:'winter', gps:false, m:'none', hc:'iceSkating', met:7 },
  { id:'airbike', name:$t('Air-Bike / Assault Bike'), short:$t('Air'), cardio:true, dist:true, g:'indoor', gps:false, m:'none', hc:'bikingStationary', met:8.5 },
  { id:'skierg', name:$t('SkiErg'), short:$t('Ski-E'), cardio:true, dist:true, g:'indoor', gps:false, m:'p500', hc:'other', met:7.5 },
  { id:'hyrox', name:$t('Hyrox / Fitness-Wettkampf'), short:$t('Hyrox'), cardio:true, dist:true, g:'indoor', gps:false, m:'none', hc:'crossTraining', met:9 },
  { id:'crosstrainer', name:$t('Crosstrainer'), short:$t('Cross'), cardio:true, dist:false, g:'indoor', gps:false, m:'none', hc:'elliptical', met:5 },
  { id:'stepper', name:$t('Stepper / Treppenmaschine'), short:$t('Step'), cardio:true, dist:false, g:'indoor', gps:false, m:'none', hc:'stairClimbingMachine', met:9 },
  { id:'treppen', name:$t('Treppen steigen'), short:$t('Trep'), cardio:true, dist:false, g:'indoor', gps:false, m:'none', hc:'stairClimbing', met:8 },
  { id:'seil', name:$t('Seilspringen'), short:$t('Seil'), cardio:true, dist:false, g:'indoor', gps:false, m:'none', hc:'jumpRope', met:11 },
  { id:'hiit', name:$t('HIIT'), short:$t('HIIT'), cardio:true, dist:false, g:'indoor', gps:false, m:'none', hc:'highIntensityIntervalTraining', met:8 },
  { id:'zirkel', name:$t('Circuit / Functional'), short:$t('Circ'), cardio:true, dist:false, g:'indoor', gps:false, m:'none', hc:'crossTraining', met:8 },
  { id:'kurs', name:$t('Fitnesskurs'), short:$t('Kurs'), cardio:true, dist:false, g:'indoor', gps:false, m:'none', hc:'exerciseClass', met:6 },
  { id:'tanzen', name:$t('Tanzen'), short:$t('Tanz'), cardio:true, dist:false, g:'indoor', gps:false, m:'none', hc:'dance', met:5.5 },
  { id:'fussball', name:$t('Fußball'), short:$t('Ball'), cardio:true, dist:true, run:true, g:'ball', gps:true, m:'none', hc:'soccer', met:7 },
  { id:'basketball', name:$t('Basketball'), short:$t('Korb'), cardio:true, dist:false, g:'ball', gps:false, m:'none', hc:'basketball', met:6.5 },
  { id:'handball', name:$t('Handball'), short:$t('Hand'), cardio:true, dist:false, g:'ball', gps:false, m:'none', hc:'handball', met:8 },
  { id:'volleyball', name:$t('Volleyball'), short:$t('Vol'), cardio:true, dist:false, g:'ball', gps:false, m:'none', hc:'volleyball', met:4 },
  { id:'tennis', name:$t('Tennis'), short:$t('Tennis'), cardio:true, dist:false, g:'ball', gps:false, m:'none', hc:'tennis', met:7.3 },
  { id:'padel', name:$t('Padel'), short:$t('Padel'), cardio:true, dist:false, g:'ball', gps:false, m:'none', hc:'racquetball', met:6 },
  { id:'badminton', name:$t('Badminton'), short:$t('Bad'), cardio:true, dist:false, g:'ball', gps:false, m:'none', hc:'badminton', met:5.5 },
  { id:'tischtennis', name:$t('Tischtennis'), short:$t('TT'), cardio:true, dist:false, g:'ball', gps:false, m:'none', hc:'tableTennis', met:4 },
  { id:'squash', name:$t('Squash'), short:$t('Sq'), cardio:true, dist:false, g:'ball', gps:false, m:'none', hc:'squash', met:7.3 },
  { id:'kampfsport', name:$t('Kampfsport'), short:$t('Kampf'), cardio:true, dist:false, g:'kampf', gps:false, m:'none', hc:'martialArts', met:10 },
  { id:'boxen', name:$t('Boxen'), short:$t('Box'), cardio:true, dist:false, g:'kampf', gps:false, m:'none', hc:'boxing', met:7.8 },
  { id:'klettern', name:$t('Klettern / Bouldern'), short:$t('Klet'), cardio:true, dist:false, g:'sonst', gps:false, m:'none', hc:'climbing', met:7.5 },
  { id:'kraft', name:$t('Krafttraining frei'), short:$t('Kraft'), cardio:false, dist:false, strength:true, g:'sonst', gps:false, m:'none', hc:'strengthTraining', met:5 },
  { id:'mobility', name:$t('Mobility / Yoga'), short:$t('Mobil'), cardio:false, dist:false, g:'sonst', gps:false, m:'none', hc:'yoga', met:2.5 },
  { id:'sonst', name:$t('Sonstiges'), short:$t('Akt'), cardio:true, dist:false, g:'sonst', gps:false, m:'none', hc:'other', met:5 } ];
const ACT_MAP = Object.fromEntries(ACT_TYPES.map(a => [a.id, a]));
/* Health-Connect-Workouttyp → Aktivität */
const HC_TYPE = { running:'joggen', trackAndField:'joggen', runningTreadmill:'laufband', swimming:'schwimmen', swimmingPool:'schwimmen', swimmingOpenWater:'freiwasser',
  cycling:'rad', distanceCycling:'rad', bikingStationary:'indoorrad', walking:'gehen', hiking:'wandern', rowing:'rudernboot', rowingMachine:'rudern', paddling:'kajak', paddleSports:'kajak',
  crossCountrySkiing:'langlauf', skiing:'ski', downhillSkiing:'ski', snowboarding:'snowboard', snowshoeing:'schneeschuh', skating:'inline', skatingSports:'inline', iceSkating:'eislauf',
  elliptical:'crosstrainer', stairClimbingMachine:'stepper', stairClimbing:'treppen', stairs:'treppen', jumpRope:'seil', crossTraining:'zirkel', bootCamp:'zirkel', mixedCardio:'zirkel',
  exerciseClass:'kurs', dance:'tanzen', dancing:'tanzen', cardioDance:'tanzen', socialDance:'tanzen',
  soccer:'fussball', basketball:'basketball', handball:'handball', volleyball:'volleyball', tennis:'tennis', racquetball:'padel', pickleball:'padel', badminton:'badminton', tableTennis:'tischtennis', squash:'squash',
  boxing:'boxen', martialArts:'kampfsport', kickboxing:'kampfsport', wrestling:'kampfsport', climbing:'klettern', rockClimbing:'klettern',
  strengthTraining:'kraft', traditionalStrengthTraining:'kraft', functionalStrengthTraining:'kraft', weightlifting:'kraft', calisthenics:'kraft',
  yoga:'mobility', stretching:'mobility', flexibility:'mobility', pilates:'mobility', highIntensityIntervalTraining:'hiit' };
/* Zepp-Export SPORT.type (Schätzung, im Zweifel „Sonstiges“) */
const ZEPP_TYPE = { 1:'joggen', 6:'gehen', 8:'joggen', 9:'rad', 10:'rad', 14:'schwimmen', 15:'schwimmen', 16:'kraft' };

/* ---------- Lebensmittel-Presets (Schätzwerte, editierbar) ---------- */
const PRESET_FOODS = [
  { id:'p_koefte', name:$t('Hähnchen-Köfte (eigenes Rezept)'), base:'piece', kcal:100, p:19.6, f:1.1, c:3.0, pieceG:95, fib:0.6, sug:0.6, salt:0.4 },
  { id:'p_syrniki', name:$t('Syrniki (eigenes Rezept)'), base:'piece', kcal:116, p:10.4, f:2.3, c:12.7, pieceG:70, fib:0.3, sug:4, salt:0.1 },
  { id:'p_skyr', name:$t('Skyr natur'), base:'100g', kcal:63, p:11, f:0.2, c:4, fib:0, sug:4, salt:0.1 },
  { id:'p_reis', name:$t('Reis, gekocht'), base:'100g', kcal:130, p:2.7, f:0.3, c:28, fib:0.4, sug:0.1, salt:0 },
  { id:'p_kartoffel', name:$t('Kartoffeln, gekocht'), base:'100g', kcal:77, p:2, f:0.1, c:17, fib:1.8, sug:0.8, salt:0 },
  { id:'p_gemuese', name:$t('Gemüse gemischt'), base:'100g', kcal:30, p:2, f:0.3, c:5, fib:2.5, sug:2.5, salt:0.05 },
  { id:'p_beeren', name:$t('Beeren (TK)'), base:'100g', kcal:45, p:0.8, f:0.3, c:9, fib:4, sug:6, salt:0 },
  { id:'p_banane', name:$t('Banane'), base:'piece', kcal:105, p:1.3, f:0.4, c:27, pieceG:120, fib:3.1, sug:14, salt:0 },
  { id:'p_whey', name:$t('Whey (30 g Scoop)'), base:'piece', kcal:120, p:24, f:1.5, c:2, pieceG:30, fib:0.3, sug:1.5, salt:0.15 },
  { id:'p_ei', name:$t('Ei (M)'), base:'piece', kcal:78, p:6.5, f:5.3, c:0.5, pieceG:55, fib:0, sug:0.2, salt:0.2 },
  { id:'p_oel', name:$t('Olivenöl'), base:'100g', kcal:884, p:0, f:100, c:0, fib:0, sug:0, salt:0 },
  { id:'p_haehnchen', name:$t('Hähnchenbrust, roh'), base:'100g', kcal:105, p:23, f:1.2, c:0, fib:0, sug:0, salt:0.15 },
  { id:'p_quark', name:$t('Magerquark'), base:'100g', kcal:67, p:12, f:0.3, c:4, fib:0, sug:4, salt:0.1 },
  { id:'p_hafer', name:$t('Haferflocken'), base:'100g', kcal:370, p:13, f:7, c:59, fib:10, sug:1, salt:0 } ];
const DAY_TEMPLATE = [
  { meal:'Frühstück', food:'p_syrniki', qty:3, unit:'Stk' }, { meal:'Frühstück', food:'p_skyr', qty:250, unit:'g' }, { meal:'Frühstück', food:'p_beeren', qty:100, unit:'g' },
  { meal:'Mittag', food:'p_koefte', qty:4, unit:'Stk' }, { meal:'Mittag', food:'p_reis', qty:250, unit:'g' }, { meal:'Mittag', food:'p_gemuese', qty:300, unit:'g' }, { meal:'Mittag', food:'p_oel', qty:10, unit:'g' },
  { meal:'Snack', food:'p_banane', qty:1, unit:'Stk' }, { meal:'Snack', food:'p_whey', qty:1, unit:'Stk' } ];
const MEALS = ['Frühstück','Mittag','Snack','Abend'];
