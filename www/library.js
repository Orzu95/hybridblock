/* Hybridblock – Übungs-Erweiterung (Geräte, Leichter/Schwerer), Plan-Bibliothek aus freien Quellen, Plan-Generator */
'use strict';

/* ---------- weitere Übungen ---------- */
L('squat', $t('Kniebeuge (LH)'), { q: 1, g: .75, ab: .25 }, ['fs', 'hack', 'legpress', 'goblet']);
L('box_squat', $t('Box Squat (LH)'), { q: 1, g: .75 }, ['squat', 'goblet']);
L('bw_squat', $t('Kniebeuge (Körpergewicht)'), { q: 1, g: .5 }, ['goblet', 'split_squat']);
L('assist_squat', $t('Kniebeuge mit Halt'), { q: 1, g: .5 }, ['bw_squat'], $t('An Türrahmen oder Stange festhalten, so tief wie kontrolliert möglich.'));
L('split_squat', $t('Split Squat'), { q: 1, g: 1 }, ['bss', 'rev_lunge']);
L('shrimp', $t('Shrimp Squat'), { q: 1, g: 1 }, ['bss'], $t('Hinteres Bein mit der Hand halten, Knie sanft absetzen.'));
L('dl', $t('Kreuzheben (LH)'), { g: 1, h: .75, b: .5 }, ['trap', 'rdl']);
L('rdl', $t('Rumänisches Kreuzheben (LH)'), { h: 1, g: .5 }, ['rdl_db', 'hyper45']);
L('sl_rdl', $t('Einbeiniges Kreuzheben'), { h: 1, g: .75 }, ['rdl_db', 'rdl']);
L('ghr', $t('Glute Ham Raise'), { h: 1, g: .25 }, ['nordic', 'curl_lying']);
L('kb_swing', $t('Kettlebell Swing'), { g: 1, h: .5 }, ['hyper45', 'rdl_db'], $t('Explosiv aus der Hüfte, Rücken neutral, Arme locker.'));
L('ohp', $t('Schulterdrücken stehend (LH)'), { fd: 1, sd: .5, t: .5 }, ['db_ohp', 'machine_ohp']);
L('push_press', $t('Push Press'), { fd: 1, sd: .5, t: .5, q: .25 }, ['ohp', 'db_ohp']);
L('cg_bench', $t('Enges Bankdrücken'), { t: 1, ch: .5, fd: .25 }, ['dip', 'tri_pd']);
L('incl_bb', $t('Schrägbankdrücken (LH)'), { ch: 1, fd: .5, t: .5 }, ['incl', 'incl_machine']);
L('bb_row', $t('Langhantelrudern'), { b: 1, rd: .5, bi: .5 }, ['row', 'cable_row', 'db_row']);
L('inv_row', $t('Rudern im Hang (Inverted Row)'), { b: 1, rd: .5, bi: .5 }, ['row', 'cable_row'], $t('Körper gestreckt, Brust zur Stange.'));
L('ring_row', $t('Ringrudern schräg'), { b: 1, rd: .5, bi: .5 }, ['inv_row'], $t('Je aufrechter du stehst, desto leichter.'));
L('neg_pu', $t('Negative Klimmzüge'), { b: 1, bi: .5 }, ['assisted_pu', 'latpd'], $t('Oben starten, 3–5 s ablassen.'));
L('scap_pu', $t('Schulterblatt-Klimmzug'), { b: .5 }, ['neg_pu'], $t('Arme gestreckt, nur die Schulterblätter nach unten ziehen.'));
L('pushup', $t('Liegestütz'), { ch: 1, t: .5, fd: .5 }, ['db_bench', 'machine_press']);
L('incl_pushup', $t('Liegestütz erhöht'), { ch: 1, t: .5, fd: .5 }, ['pushup'], $t('Hände auf Bank oder Tisch. Je höher, desto leichter.'));
L('knee_pushup', $t('Liegestütz auf Knien'), { ch: 1, t: .5, fd: .5 }, ['incl_pushup']);
L('diamond', $t('Diamant-Liegestütz'), { t: 1, ch: .5 }, ['pushup', 'cg_bench']);
L('pp_pushup', $t('Pseudo-Planche-Liegestütz'), { ch: 1, fd: 1, t: .5 }, ['pushup']);
L('dip_neg', $t('Negative Dips'), { ch: 1, t: 1, fd: .5 }, ['dip_assist', 'dip'], $t('Oben starten, 3–5 s ablassen.'));
L('support_hold', $t('Stütz am Barren'), { t: .5, ch: .25 }, ['dip_neg'], $t('Arme gestreckt, Schultern tief. Zeit in Sekunden.'));
L('bench_dip', $t('Dips an der Bank'), { t: 1, ch: .25 }, ['dip_neg'], $t('Füße weiter vorne = schwerer.'));
L('skull', $t('SZ-Trizepsdrücken liegend'), { t: 1 }, ['tri_oh', 'db_oh_ext']);
L('pecdeck', $t('Butterfly-Maschine'), { ch: 1 }, ['cable_fly']);
L('cable_fly', $t('Kabel-Flys'), { ch: 1 }, ['pecdeck']);
L('plank', $t('Unterarmstütz'), { ab: 1 }, ['ab_wheel'], $t('Zeit in Sekunden. Becken leicht einrollen.'));
L('ab_wheel', $t('Ab-Wheel Rollout'), { ab: 1 }, ['plank', 'crunch']);
L('pallof', $t('Pallof Press'), { ab: .5 }, ['carry'], $t('Kabel oder Band seitlich, Arme strecken, nicht verdrehen lassen.'));
L('sled_push', $t('Schlitten schieben'), { q: 1, g: .5 }, ['farmer'], $t('Strecke in Metern.'));
L('row_erg', $t('Rudergerät-Intervall'), {}, ['bike_int'], $t('Strecke in Metern, gleichmäßig hart.'));
L('bike_int', $t('Rad- oder Seil-Intervall'), {}, ['row_erg'], $t('Zeit in Sekunden, etwa 80 % HFmax.'));
L('jump_rope', $t('Seilspringen'), { c: .5 }, ['bike_int'], $t('Zeit in Sekunden.'));
/* Gesäß und Beine */
L('ht_db', $t('Hip Thrust (Kurzhantel)'), { g: 1, h: .25 }, ['ht', 'glute_bridge'], $t('Schultern auf der Bank, oben 1 s halten, Becken leicht einrollen.'));
L('sl_ht', $t('Einbeiniger Hip Thrust'), { g: 1, h: .25 }, ['ht_db', 'ht'], $t('Pro Bein. Becken bleibt gerade.'));
L('bw_bridge', $t('Glute Bridge (Boden)'), { g: 1, h: .25 }, ['ht_db'], $t('Rücken am Boden, Fersen nah am Po, oben 2 s halten.'));
L('frog_pump', $t('Frog Pumps'), { g: 1 }, ['bw_bridge'], $t('Fußsohlen aneinander, Knie nach außen, kurze schnelle Wiederholungen.'));
L('abduct', $t('Abduktoren-Maschine'), { g: .75 }, ['cable_abd', 'band_abd'], $t('Oberkörper leicht nach vorn lehnen, das trifft den oberen Gesäßmuskel stärker.'));
L('cable_abd', $t('Abduktion am Kabel'), { g: .75 }, ['abduct', 'band_abd'], $t('Pro Bein. Seitlich anheben, nicht aus dem Rücken schwingen.'));
L('band_abd', $t('Abduktion mit Band (sitzend)'), { g: .75 }, ['abduct'], $t('Band über den Knien, Knie gegen den Widerstand öffnen.'));
L('cable_kick', $t('Kickback am Kabel'), { g: 1 }, ['sl_ht', 'hyper45'], $t('Pro Bein. Bein nach hinten oben, ohne ins Hohlkreuz zu gehen.'));
L('pull_through', $t('Cable Pull-Through'), { g: 1, h: .5 }, ['kb_swing', 'rdl_db'], $t('Hüfte nach hinten schieben, oben Po anspannen.'));
L('sumo_dl', $t('Sumo-Kreuzheben'), { g: 1, q: .5, h: .5, b: .25 }, ['trap', 'dl'], $t('Breiter Stand, Knie über den Füßen, Brust hoch.'));
L('db_rdl_b', $t('Rumänisches Kreuzheben B-Stance'), { h: 1, g: 1 }, ['sl_rdl', 'rdl_db'], $t('Hinterer Fuß nur zur Balance auf der Spitze, Last auf dem vorderen Bein.'));

Object.assign(REPDB, { squat: 'squat', box_squat: 'box-squat', bw_squat: 'bodyweight-squat', split_squat: 'split-squat', dl: 'deadlift', rdl: 'romanian-deadlift', sl_rdl: 'single-leg-romanian-deadlift', kb_swing: 'kettlebell-swing',
  ohp: 'seated-barbell-overhead-press', push_press: 'push-press', cg_bench: 'close-grip-bench-press', incl_bb: 'incline-bench-press', bb_row: 'barbell-row', inv_row: 'inverted-row', ring_row: 'ring-row', neg_pu: 'negative-pull-ups', scap_pu: 'scapular-pull-ups',
  pushup: 'push-up', incl_pushup: 'incline-push-ups', knee_pushup: 'knee-push-ups', diamond: 'diamond-push-ups', pp_pushup: 'pseudo-planche-push-ups', bench_dip: 'bench-dips', skull: 'skull-crusher', pecdeck: 'pec-deck', cable_fly: 'cable-fly',
  plank: 'plank', ab_wheel: 'ab-wheel-rollout', pallof: 'cable-pallof-press', sled_push: 'sled-push', jump_rope: 'jump-rope', farmer: 'dumbbell-farmers-walk' });

/* ---------- Geräte ---------- */
const EQUIP = { bb: $t('Langhantel'), rack: $t('Squat-Rack'), bench: $t('Hantelbank'), db: $t('Kurzhanteln'), ez: $t('SZ-Stange'), kb: $t('Kettlebell'), trapbar: $t('Trap Bar'), cable: $t('Kabelzug'), smith: $t('Multipresse'),
  legpress: $t('Beinpresse'), hack: $t('Hackenschmidt'), pendulum: $t('Pendulum-Squat'), legext: $t('Beinstrecker'), legcurl_s: $t('Beinbeuger sitzend'), legcurl_l: $t('Beinbeuger liegend'), calfm: $t('Wadenmaschine'), htm: $t('Hip-Thrust-Maschine'), abdm: $t('Abduktoren-Maschine'),
  chestpress: $t('Brustpresse'), inclm: $t('Schrägbank-Maschine'), shoulderm: $t('Schulterpresse'), latm: $t('Seitheben-Maschine'), latpd: $t('Latzug'), rowm: $t('Rudermaschine / T-Bar'), pecdeck: $t('Butterfly'), dipm: $t('Dip-Maschine'), assist: $t('Gravitron'),
  abm: $t('Bauchmaschine'), ghd: $t('Hyperextension-Bank'), preacher: $t('Scott-Bank'), pullbar: $t('Klimmzugstange'), dipbar: $t('Dip-Barren'), rings: $t('Ringe / TRX'), band: $t('Widerstandsband'), box: $t('Plyo-Box'), medball: $t('Medizinball'), abwheel: $t('Ab-Wheel'), sled: $t('Schlitten'), rower: $t('Rudergerät'), bike: $t('Rad / Air-Bike'), rope: $t('Springseil'), nordic: $t('Nordic-Halterung') };
const EQ_GROUP = [[$t('Freie Gewichte'), ['bb', 'rack', 'bench', 'db', 'ez', 'kb', 'trapbar']], [$t('Kabel und Maschinen'), ['cable', 'smith', 'legpress', 'hack', 'pendulum', 'legext', 'legcurl_s', 'legcurl_l', 'calfm', 'htm', 'abdm', 'chestpress', 'inclm', 'shoulderm', 'latm', 'latpd', 'rowm', 'pecdeck', 'dipm', 'assist', 'abm', 'ghd', 'preacher']],
  [$t('Körpergewicht und Zubehör'), ['pullbar', 'dipbar', 'rings', 'band', 'box', 'medball', 'abwheel', 'nordic', 'sled']], [$t('Cardio'), ['rower', 'bike', 'rope']]];
const EX_EQ = { fs: ['bb', 'rack'], squat: ['bb', 'rack'], box_squat: ['bb', 'rack', 'box'], pend: ['pendulum'], hack: ['hack'], legpress: ['legpress'], goblet: ['db'], trap: ['trapbar'], dl: ['bb'], rdl: ['bb'], rdl_db: ['db'], sl_rdl: [],
  hyper45: ['ghd'], glute_bridge: ['bb'], ht: ['bb', 'bench'], ht_machine: ['htm'], legext: ['legext'], sissy: [], bss: ['bench'], split_squat: [], rev_lunge: ['db'], stepup: ['db', 'box'], bw_squat: [], assist_squat: [], shrimp: [],
  curl_seated: ['legcurl_s'], curl_lying: ['legcurl_l'], nordic: ['nordic'], ghr: ['ghd'], kb_swing: ['kb'], calf_st: ['calfm'], calf_lp: ['legpress'], calf_smith: ['smith'], calf_se: ['calfm'],
  bench: ['bb', 'bench', 'rack'], db_bench: ['db', 'bench'], smith_bench: ['smith', 'bench'], machine_press: ['chestpress'], cg_bench: ['bb', 'bench', 'rack'], incl_bb: ['bb', 'bench', 'rack'], dip_w: ['dipbar'], dip: ['dipbar'], dip_assist: ['assist'], dip_machine: ['dipm'],
  dip_neg: ['dipbar'], support_hold: ['dipbar'], bench_dip: ['bench'], incl: ['db', 'bench'], incl_machine: ['inclm'], db_ohp: ['db', 'bench'], machine_ohp: ['shoulderm'], ohp: ['bb', 'rack'], push_press: ['bb', 'rack'],
  pushup: [], incl_pushup: [], knee_pushup: [], diamond: [], pp_pushup: [], pecdeck: ['pecdeck'], cable_fly: ['cable'],
  pullup_w: ['pullbar'], chinup_w: ['pullbar'], latpd_heavy: ['latpd'], pullup: ['pullbar'], neutral_pu: ['pullbar'], chinup: ['pullbar'], latpd: ['latpd'], assisted_pu: ['assist'], neg_pu: ['pullbar'], scap_pu: ['pullbar'],
  row: ['db', 'bench'], cable_row: ['cable'], db_row: ['db', 'bench'], tbar_cs: ['rowm'], bb_row: ['bb'], inv_row: ['rack'], ring_row: ['rings'], face: ['cable'], rev_fly: ['db'],
  lat: ['db'], lat_cable: ['cable'], lat_machine: ['latm'], bayes: ['cable'], incline_curl: ['db', 'bench'], curl: ['ez'], db_curl: ['db'], cable_curl: ['cable'], preacher: ['preacher', 'ez'], hammer: ['db'],
  tri_oh: ['cable'], db_oh_ext: ['db'], tri_pd: ['cable'], skull: ['ez', 'bench'], crunch: ['cable'], machine_crunch: ['abm'], decline_crunch: ['bench'], hlr: ['pullbar'], captain: ['dipbar'], rev_crunch: [],
  plank: [], ab_wheel: ['abwheel'], pallof: ['cable'], carry: ['db'], farmer: ['db'], sled_push: ['sled'], box: ['box'], squat_jump: [], mb_chest: ['medball'], mb_wall: ['medball'], mb_toss: ['medball'], broad: [],
  row_erg: ['rower'], bike_int: ['bike'], jump_rope: ['rope'],
  ht_db: ['db', 'bench'], sl_ht: ['bench'], bw_bridge: [], frog_pump: [], abduct: ['abdm'], cable_abd: ['cable'], band_abd: ['band'], cable_kick: ['cable'], pull_through: ['cable'], sumo_dl: ['bb'], db_rdl_b: ['db'] };
/* Leichter / schwerer: Regression und Progression pro Übung */
const SCALE = {
  pullup: { e: ['neg_pu', 'assisted_pu', 'latpd'], h: ['pullup_w'] }, chinup: { e: ['neg_pu', 'assisted_pu', 'latpd'], h: ['chinup_w'] }, neutral_pu: { e: ['neg_pu', 'assisted_pu'], h: ['pullup_w'] },
  neg_pu: { e: ['scap_pu', 'assisted_pu', 'latpd'], h: ['pullup'] }, scap_pu: { e: ['latpd'], h: ['neg_pu'] }, assisted_pu: { e: ['latpd'], h: ['neg_pu', 'pullup'] }, latpd: { e: [], h: ['pullup', 'latpd_heavy'] }, pullup_w: { e: ['pullup'], h: [] },
  dip: { e: ['dip_neg', 'dip_assist', 'bench_dip'], h: ['dip_w'] }, dip_neg: { e: ['support_hold', 'dip_assist'], h: ['dip'] }, support_hold: { e: ['bench_dip'], h: ['dip_neg'] }, dip_assist: { e: ['dip_machine'], h: ['dip'] }, dip_w: { e: ['dip'], h: [] }, bench_dip: { e: [], h: ['dip_neg'] },
  pushup: { e: ['incl_pushup', 'knee_pushup'], h: ['diamond', 'pp_pushup'] }, incl_pushup: { e: ['knee_pushup'], h: ['pushup'] }, knee_pushup: { e: ['incl_pushup'], h: ['pushup'] }, diamond: { e: ['pushup'], h: ['pp_pushup'] }, pp_pushup: { e: ['pushup'], h: [] },
  inv_row: { e: ['ring_row'], h: ['bb_row'] }, ring_row: { e: [], h: ['inv_row'] },
  squat: { e: ['box_squat', 'goblet', 'legpress'], h: ['fs'] }, fs: { e: ['goblet', 'box_squat', 'hack'], h: [] }, goblet: { e: ['bw_squat', 'legpress'], h: ['fs', 'squat'] }, bw_squat: { e: ['assist_squat'], h: ['split_squat', 'goblet'] }, assist_squat: { e: [], h: ['bw_squat'] },
  split_squat: { e: ['bw_squat'], h: ['bss'] }, bss: { e: ['split_squat', 'rev_lunge'], h: ['shrimp'] }, shrimp: { e: ['bss'], h: [] }, legpress: { e: [], h: ['hack', 'squat'] },
  dl: { e: ['trap', 'rdl'], h: [] }, trap: { e: ['rdl_db', 'hyper45'], h: ['dl'] }, rdl: { e: ['rdl_db', 'hyper45'], h: ['dl'] }, rdl_db: { e: ['hyper45', 'glute_bridge'], h: ['rdl', 'sl_rdl'] }, sl_rdl: { e: ['rdl_db'], h: ['nordic'] },
  nordic: { e: ['curl_seated', 'sl_rdl'], h: ['ghr'] }, ghr: { e: ['nordic', 'curl_lying'], h: [] }, curl_seated: { e: [], h: ['nordic'] }, curl_lying: { e: [], h: ['nordic'] },
  bench: { e: ['db_bench', 'machine_press', 'pushup'], h: [] }, db_bench: { e: ['machine_press', 'pushup'], h: ['bench'] }, machine_press: { e: ['incl_pushup'], h: ['db_bench'] }, ohp: { e: ['db_ohp', 'machine_ohp'], h: ['push_press'] }, db_ohp: { e: ['machine_ohp'], h: ['ohp'] },
  hlr: { e: ['captain', 'rev_crunch'], h: [] }, captain: { e: ['rev_crunch'], h: ['hlr'] }, rev_crunch: { e: [], h: ['captain', 'hlr'] }, plank: { e: [], h: ['ab_wheel'] }, ab_wheel: { e: ['plank'], h: [] }, crunch: { e: ['machine_crunch'], h: ['decline_crunch'] },
  calf_st: { e: ['calf_lp'], h: [] }, ht: { e: ['ht_db', 'bw_bridge'], h: ['sl_ht'] }, ht_db: { e: ['bw_bridge'], h: ['ht', 'sl_ht'] }, bw_bridge: { e: ['frog_pump'], h: ['ht_db', 'sl_ht'] }, sl_ht: { e: ['ht_db', 'bw_bridge'], h: [] }, glute_bridge: { e: ['bw_bridge'], h: ['ht'] }, band_abd: { e: [], h: ['abduct', 'cable_abd'] }, box: { e: ['squat_jump'], h: ['broad'] }, incline_curl: { e: ['db_curl'], h: ['bayes'] }, bayes: { e: ['cable_curl'], h: [] } };
const SCALE_TXT = { e: $t('Leichter'), h: $t('Schwerer') };
const exEq = id => EX_EQ[id] || [];
function exAvailable(id, st) { st = st || (typeof S !== 'undefined' ? S.settings : {}); const miss = st.missingEq || [], no = st.noEx || []; if (no.includes(id)) return false; return !exEq(id).some(e => miss.includes(e)); }

/* ---------- Plan-Bibliothek ----------
   Struktur übernommen aus frei zugänglichen Quellen (verlinkt), Texte eigene Zusammenfassung. Prozent-Vorgaben sind als RPE umgesetzt:
   die App rechnet aus deinem geschätzten 1RM die Last für die Ziel-RPE, das entspricht der Prozent-Steuerung, passt sich aber an Tagesform an. */
const X = (slot, ex, sets, reps, rpe, rest, type, note, sup, wk) => { const o = S_(slot, ex, sets, reps, rpe, rest, type, note, sup); if (wk) o.wk = wk; return o; };
const W = (sets, reps, rpe, note) => ({ sets, reps, rpe, note });
const GOALS = { fat: $t('Fettabbau'), muscle: $t('Muskelaufbau'), strength: $t('Kraft'), endurance: $t('Ausdauer'), hybrid: $t('Hybrid (Kraft + Ausdauer)'), health: $t('Gesundheit und Fitness'), athletic: $t('Athletik und Sport') };
const LEVELS = { beginner: $t('Einsteiger'), intermediate: $t('Fortgeschritten'), advanced: $t('Erfahren') };
const PLACES = { gym: $t('Fitnessstudio'), home: $t('Zuhause mit Hanteln'), minimal: $t('Ohne Geräte') };
const CARDIO_RUN = { mode: 'int', walk: true };
const c25 = (reps, dur, rest, extra) => Object.assign({ mode: 'int', reps, dur, rest, warm: 5, cool: 5, run: true }, extra || {});
const crun = min => ({ mode: 'z2', min, run: true });
const LIBRARY = {
  hybrid: { goals: ['hybrid', 'fat', 'endurance'], level: ['intermediate'], days: 5, minutes: 65, place: 'gym', weeks: 12, author: 'Hybridblock (eigener Plan)',
    src: [{ t: 'Schoenfeld et al. 2017, Dosis-Wirkung Volumen', u: 'https://pubmed.ncbi.nlm.nih.gov/27433992/' }, { t: 'Helgerud et al. 2007, 4×4-Intervalle', u: 'https://pubmed.ncbi.nlm.nih.gov/17414804/' }],
    who: 'Für Leute mit Krafterfahrung, die gleichzeitig abnehmen, VO₂max steigern und Kraft halten wollen.',
    prereq: 'Sicherer Umgang mit Kniebeuge, Kreuzheben und Bankdrücken. Fitnessstudio.',
    struct: '3 Krafteinheiten (Unterkörper + Zug, Oberkörper, Ganzkörper), 1× HIIT 4×4, 1× Z2. Deine Schwerpunkt-Muskeln bekommen 12–20 Sätze pro Woche. RPE-Autoregulation, Deload in Woche 4 und 8, Testwoche 12.',
    ev: { g: 'A', pros: ['Volumen und Nähe zum Versagen nach aktueller Meta-Forschung', '4×4-Intervalle steigern die VO₂max stärker als moderates Dauertraining', 'Kraft und Cardio an getrennten Tagen begrenzt den Interferenzeffekt'], cons: ['5 Einheiten pro Woche brauchen Zeit und Erholung', 'Im Defizit nur moderat Kraftzuwachs'] } },
  gk3: { goals: ['muscle', 'fat', 'health'], level: ['beginner'], days: 4, minutes: 55, place: 'gym', weeks: 12, author: 'Hybridblock (eigener Plan)',
    src: [{ t: 'ACSM Position Stand Progression Models 2009', u: 'https://pubmed.ncbi.nlm.nih.gov/19204579/' }],
    who: 'Für Einsteiger und Wiedereinsteiger im Studio.', prereq: 'Keine. Maschinen und Kurzhanteln, technisch einfach.',
    struct: '3 Ganzkörper-Einheiten mit je 6 Übungen, 1× Z2. Jede Muskelgruppe 2–3× pro Woche, doppelte Progression (erst Wiederholungen, dann Gewicht).',
    ev: { g: 'A', pros: ['Ganzkörper 2–3× pro Woche ist für Einsteiger gut belegt', 'Maschinen senken die technische Hürde und das Verletzungsrisiko'], cons: ['Wenig Spezialisierung für Fortgeschrittene'] } },
  fatloss: { name: 'Fettabbau Basis', desc: 'Krafttraining für den Muskelerhalt, Z2 und Schritte für den Verbrauch, Fokus auf das Kaloriendefizit.',
    goals: ['fat', 'health'], level: ['beginner', 'intermediate'], days: 5, minutes: 45, place: 'gym', weeks: 12, author: 'Hybridblock nach Alwyn Cosgroves „Hierarchy of Fat Loss“ (T Nation)',
    src: [{ t: 'The Hierarchy of Fat Loss (T Nation)', u: 'https://www.t-nation.com/training/the-hierarchy-of-fat-loss/' }, { t: 'Sardeli et al. 2018: Krafttraining erhält Muskelmasse im Defizit', u: 'https://pubmed.ncbi.nlm.nih.gov/29641439/' }, { t: 'Morton et al. 2018: Protein und Krafttraining', u: 'https://pubmed.ncbi.nlm.nih.gov/28698222/' }],
    who: 'Für alle, deren Hauptziel Abnehmen ist, vom Einsteiger bis zum Fortgeschrittenen.', prereq: 'Keine. Täglich 8.000–10.000 Schritte als Zusatz.',
    struct: '3 Ganzkörper-Einheiten (Kraft erhalten, 3×8–12 bei RPE 8), 2× Z2 30–45 min. Priorität laut Cosgrove: Ernährung, dann Alltagsbewegung, dann Krafttraining, dann Intervalle, zuletzt Dauerausdauer.',
    ev: { g: 'A', pros: ['Defizit ist der Haupthebel, Training bestimmt, ob Muskeln oder Fett verloren gehen', 'Krafttraining im Defizit erhält Muskelmasse deutlich', 'Z2 und Schritte erhöhen den Verbrauch mit wenig Ermüdung'], cons: ['Kraftzuwachs bleibt im Defizit begrenzt'] },
    sessions: () => [
      { k: 'A', kind: 'gym', title: 'Ganzkörper A', sub: 'Beine, Druck, Zug', add: [X('f_a1', 'goblet', 3, '8–12', 8, 90, 'dp'), X('f_a2', 'db_bench', 3, '8–12', 8, 90, 'dp'), X('f_a3', 'latpd', 3, '10–12', 8, 90, 'dp'), X('f_a4', 'curl_seated', 3, '10–15', 8.5, 60, 'dp', '', 'S1'), X('f_a5', 'plank', 3, '30–45', null, 60, 'time', '', 'S1')] },
      { k: 'Z', kind: 'z2', title: 'Z2 Grundlage', cardio: { mode: 'z2', weeks: [30, 35, 35, 25, 40, 40, 45, 30, 45, 45, 45, 35].map(m => ({ mode: 'z2', min: m })) } },
      { k: 'B', kind: 'gym', title: 'Ganzkörper B', sub: 'Hüfte, Schulter, Rücken', add: [X('f_b1', 'rdl_db', 3, '8–10', 7.5, 120, 'dp'), X('f_b2', 'db_ohp', 3, '8–12', 8, 90, 'dp'), X('f_b3', 'row', 3, '10–12', 8, 90, 'dp'), X('f_b4', 'split_squat', 2, '10–12', 8, 60, 'dp', 'Wiederholungen pro Bein.', 'S1'), X('f_b5', 'crunch', 3, '10–15', 8.5, 60, 'dp', '', 'S1')] },
      { k: 'Y', kind: 'z2', title: 'Z2 Grundlage', cardio: { mode: 'z2', weeks: [30, 35, 35, 25, 40, 40, 45, 30, 45, 45, 45, 35].map(m => ({ mode: 'z2', min: m })) } },
      { k: 'C', kind: 'gym', title: 'Ganzkörper C', sub: 'Beine, Dips, Klimmzüge', add: [X('f_c1', 'legpress', 3, '10–12', 8, 90, 'dp'), X('f_c2', 'dip_assist', 3, '6–10', 8, 90, 'dp'), X('f_c3', 'assisted_pu', 3, '6–10', 8, 90, 'dp'), X('f_c4', 'ht', 3, '8–12', 8, 90, 'dp'), X('f_c5', 'farmer', 3, 30, 8, 60, 'carry')] }] },
  gzclp: { name: 'GZCLP', desc: 'Lineare Progression auf drei Ebenen: schwere Grundübung, mittlere Zweitübung, leichte Zusatzübung.',
    goals: ['strength', 'muscle'], level: ['beginner', 'intermediate'], days: 3, minutes: 60, place: 'gym', weeks: 12, author: 'Cody Lefever (GZCL)',
    src: [{ t: 'GZCLP auf Boostcamp', u: 'https://www.boostcamp.app/coaches/cody-lefever/gzcl-program-gzclp' }, { t: 'GZCLP Spreadsheets (Lift Vault)', u: 'https://liftvault.com/programs/strength/gzclp-program-spreadsheets/' }],
    who: 'Für Einsteiger und frühe Fortgeschrittene, die mit Langhantel stärker werden wollen.', prereq: 'Technik in Kniebeuge, Bankdrücken, Kreuzheben und Schulterdrücken. Studio mit Rack.',
    struct: '4 Einheiten im Wechsel an 3 Tagen pro Woche. T1: 3×5, letzter Satz so viele wie möglich. T2: 3×10. T3: 3×15, letzter Satz bis 25. Klappt T1 nicht mehr, wechselt das Schema auf 6×2, dann 10×1.',
    ev: { g: 'A', pros: ['Lineare Progression ist für Einsteiger die schnellste Kraftsteigerung', 'Jede Grundübung 2× pro Woche (einmal schwer, einmal mittel)', 'Klare Regeln bei Stillstand'], cons: ['Wenig Arm- und Wadenvolumen', 'Ohne Defizit-Anpassung: im Defizit stagniert es früher'] },
    sessions: () => [
      { k: 'A', kind: 'gym', title: 'GZCLP A1', sub: 'Kniebeuge schwer, Bank mittel', add: [X('g_a1', 'squat', 3, '5', 8.5, 180, 'main', 'Letzter Satz: so viele saubere Wiederholungen wie möglich.'), X('g_a2', 'bench', 3, '10', 8, 120, 'dp'), X('g_a3', 'latpd', 3, '15', 8, 60, 'dp', 'Letzter Satz bis 25. Schaffst du 25, mehr Gewicht.')] },
      { k: 'B', kind: 'gym', title: 'GZCLP B1', sub: 'Schulterdrücken schwer, Kreuzheben mittel', add: [X('g_b1', 'ohp', 3, '5', 8.5, 180, 'main', 'Letzter Satz: so viele saubere Wiederholungen wie möglich.'), X('g_b2', 'dl', 3, '10', 7.5, 150, 'dp'), X('g_b3', 'db_row', 3, '15', 8, 60, 'dp', 'Letzter Satz bis 25.')] },
      { k: 'C', kind: 'gym', title: 'GZCLP A2', sub: 'Bank schwer, Kniebeuge mittel', add: [X('g_c1', 'bench', 3, '5', 8.5, 180, 'main', 'Letzter Satz: so viele saubere Wiederholungen wie möglich.'), X('g_c2', 'squat', 3, '10', 7.5, 150, 'dp'), X('g_c3', 'latpd', 3, '15', 8, 60, 'dp', 'Letzter Satz bis 25.')] },
      { k: 'D', kind: 'gym', title: 'GZCLP B2', sub: 'Kreuzheben schwer, Schulter mittel', add: [X('g_d1', 'dl', 3, '5', 8.5, 210, 'main', 'Letzter Satz: so viele saubere Wiederholungen wie möglich.'), X('g_d2', 'ohp', 3, '10', 8, 120, 'dp'), X('g_d3', 'db_row', 3, '15', 8, 60, 'dp', 'Letzter Satz bis 25.')] }] },
  ppl: { name: 'Push Pull Legs (Reddit)', desc: 'Sechs Tage pro Woche, jede Muskelgruppe zweimal, lineare Progression bei den Grundübungen.',
    goals: ['muscle', 'strength'], level: ['beginner', 'intermediate'], days: 6, minutes: 70, place: 'gym', weeks: 12, author: 'Metallicadpa (r/Fitness)',
    src: [{ t: 'Metallicadpa PPL (Liftosaur)', u: 'https://www.liftosaur.com/programs/metallicadpappl' }],
    who: 'Für Einsteiger mit Grundtechnik, die viel Zeit haben und Muskeln aufbauen wollen.', prereq: '6 Trainingstage pro Woche, Studio.',
    struct: 'Pull, Push, Beine, zweimal pro Woche. Grundübung zuerst mit 4×5 und letztem Satz so viele wie möglich, danach Zubehör mit doppelter Progression (8–12 bzw. 15–20).',
    ev: { g: 'B', pros: ['Frequenz 2× pro Muskel und hohes Wochenvolumen fördern Hypertrophie', 'Einfache, klare Progression'], cons: ['6 Tage sind schwer mit Alltag und Cardio zu vereinbaren', 'Hohe Gesamtermüdung, im Defizit oft zu viel'] },
    sessions: () => {
      const pull = (s, main) => ({ k: s, kind: 'gym', title: s === 'A' ? 'Pull A' : 'Pull B', sub: main === 'dl' ? 'Kreuzheben, Rücken, Bizeps' : 'Rudern, Rücken, Bizeps', add: [
        main === 'dl' ? X('p' + s + '1', 'dl', 1, '5', 8.5, 210, 'main', 'Ein Satz, so viele saubere Wiederholungen wie möglich.') : X('p' + s + '1', 'bb_row', 5, '5', 8.5, 150, 'main', 'Letzter Satz: so viele wie möglich.'),
        X('p' + s + '2', 'latpd', 3, '8–12', 8.5, 90, 'dp'), X('p' + s + '3', 'cable_row', 3, '8–12', 8.5, 90, 'dp'), X('p' + s + '4', 'face', 5, '15–20', 8.5, 45, 'dp'), X('p' + s + '5', 'hammer', 4, '8–12', 9, 60, 'dp', '', 'S1'), X('p' + s + '6', 'db_curl', 4, '8–12', 9, 60, 'dp', '', 'S1')] });
      const push = (s, main) => ({ k: s, kind: 'gym', title: s === 'C' ? 'Push A' : 'Push B', sub: main === 'bench' ? 'Bankdrücken, Schulter, Trizeps' : 'Schulterdrücken, Brust, Trizeps', add: [
        X('p' + s + '1', main, 5, '5', 8.5, 180, 'main', 'Letzter Satz: so viele wie möglich.'), X('p' + s + '2', main === 'bench' ? 'ohp' : 'bench', 3, '8–12', 8, 120, 'dp'), X('p' + s + '3', 'incl', 3, '8–12', 8.5, 90, 'dp'),
        X('p' + s + '4', 'tri_pd', 3, '8–12', 9, 60, 'dp', '', 'S1'), X('p' + s + '5', 'tri_oh', 3, '8–12', 9, 60, 'dp', '', 'S1'), X('p' + s + '6', 'lat', 6, '15–20', 9, 45, 'dp')] });
      const legs = s => ({ k: s, kind: 'gym', title: s === 'E' ? 'Beine A' : 'Beine B', sub: 'Kniebeuge, Hamstrings, Waden', add: [X('l' + s + '1', 'squat', 3, '5', 8.5, 180, 'main', 'Letzter Satz: so viele wie möglich.'), X('l' + s + '2', 'rdl', 3, '8–12', 8, 120, 'dp'), X('l' + s + '3', 'legpress', 3, '8–12', 8.5, 90, 'dp'), X('l' + s + '4', 'curl_seated', 3, '8–12', 9, 60, 'dp'), X('l' + s + '5', 'calf_st', 5, '8–12', 9, 60, 'dp')] });
      return [pull('A', 'dl'), push('C', 'bench'), legs('E'), pull('B', 'row'), push('D', 'ohp'), legs('F')]; } },
  bbb: { name: '5/3/1 Boring But Big', desc: 'Langsame, stetige Kraftsteigerung in vier Grundübungen, dazu 5×10 für Masse.',
    goals: ['strength', 'muscle'], level: ['intermediate', 'advanced'], days: 4, minutes: 60, place: 'gym', weeks: 12, author: 'Jim Wendler (T Nation, jimwendler.com)',
    src: [{ t: '5/3/1: How to Build Pure Strength (T Nation)', u: 'https://www.t-nation.com/workouts/5-3-1-how-to-build-pure-strength/' }, { t: 'Boring But Big (jimwendler.com)', u: 'https://www.jimwendler.com/blogs/jimwendler-com/101077382-boring-but-big' }],
    who: 'Für Fortgeschrittene, bei denen lineare Progression nicht mehr klappt.', prereq: 'Saubere Technik in den vier Grundübungen, 1–2 Jahre Training.',
    struct: '4-Wochen-Welle pro Hauptübung: Woche 1 Fünfer, Woche 2 Dreier, Woche 3 5/3/1, Woche 4 Deload. Letzter Hauptsatz so viele wie möglich. Danach 5×10 derselben Übung leicht (Original 50–60 % vom Trainingsmax), dazu Zug- und Rumpfarbeit.',
    phases: ['b1', 'b2', 'b3', 'dl', 'b1', 'b2', 'b3', 'dl', 'b1', 'b2', 'b3', 'dl'],
    ev: { g: 'B', pros: ['Wellenförmige Periodisierung mit eingebauter Erholung', 'Viel Volumen in den Grundübungen für Masse'], cons: ['5×10 Kniebeuge und Kreuzheben sind sehr ermüdend, im Defizit oft zu viel', 'Langsame Steigerung, für Einsteiger unnötig'] },
    sessions: () => { const main = (slot, ex) => X(slot, ex, 3, '5', 8.5, 180, 'main', 'Letzter Satz: so viele wie möglich.', '', [W(3, '5', 8.5, 'Fünfer-Woche: letzter Satz so viele wie möglich.'), W(3, '3', 9, 'Dreier-Woche: letzter Satz so viele wie möglich.'), W(3, '1', 9.5, '5/3/1-Woche: aufsteigend 5, 3, dann 1+ so viele wie möglich.'), W(3, '5', 6, 'Deload: locker.')]);
      const bbb = (slot, ex) => X(slot, ex, 5, '10', 6.5, 90, 'dp', 'Boring But Big: 5×10 leicht, Fokus auf saubere Wiederholungen.', '', [W(5, '10', 6.5), W(5, '10', 7), W(5, '10', 7), W(3, '10', 5.5, 'Deload: 3×10.')]);
      return [{ k: 'A', kind: 'gym', title: '5/3/1 Schulter', sub: 'Schulterdrücken', add: [main('w_a1', 'ohp'), bbb('w_a2', 'ohp'), X('w_a3', 'pullup', 5, '5–10', 8, 60, 'bw'), X('w_a4', 'hlr', 3, '10–15', 8, 60, 'dp')] },
        { k: 'B', kind: 'gym', title: '5/3/1 Kreuzheben', sub: 'Kreuzheben', add: [main('w_b1', 'dl'), bbb('w_b2', 'dl'), X('w_b3', 'hlr', 5, '10–15', 8, 60, 'dp')] },
        { k: 'C', kind: 'gym', title: '5/3/1 Bank', sub: 'Bankdrücken', add: [main('w_c1', 'bench'), bbb('w_c2', 'bench'), X('w_c3', 'db_row', 5, '10', 8, 60, 'dp')] },
        { k: 'D', kind: 'gym', title: '5/3/1 Kniebeuge', sub: 'Kniebeuge', add: [main('w_d1', 'squat'), bbb('w_d2', 'squat'), X('w_d3', 'crunch', 5, '10–15', 8, 60, 'dp')] }]; } },
  henriques: { name: '8-Wochen-Kraftplan', desc: 'Klassischer Kraftblock: erst Achter, dann Fünfer, jede Woche schwerer, am Ende ein Test.',
    goals: ['strength'], level: ['intermediate'], days: 3, minutes: 90, place: 'gym', weeks: 8, author: 'Tim Henriques (T Nation)',
    src: [{ t: '8-Week Basic Strength Plan (T Nation)', u: 'https://archive.t-nation.com/workouts/8-week-basic-strength-plan/' }],
    who: 'Für Fortgeschrittene, die Bank, Kniebeuge und Kreuzheben in 8 Wochen deutlich steigern wollen.', prereq: 'Bekanntes 1RM in den Grundübungen, 90 Minuten pro Einheit.',
    struct: '3 Tage: Brust/Rücken, Beine/unterer Rücken, Schulter/Arme. Woche 1–4: Achter mit sinkendem Volumen und steigender Last, Woche 5–8: Fünfer und schwere Einzelwiederholungen. Danach beginnt die Welle neu.',
    phases: ['b1', 'b1', 'b2', 'b2', 'b2', 'b3', 'b3', 'b3', 'b1', 'b1', 'b2', 'b2'],
    ev: { g: 'B', pros: ['Klare lineare Periodisierung, gut für Kraftspitzen', 'Hohes Volumen für Zug und Rücken'], cons: ['90 Minuten pro Einheit', 'Kein Deload innerhalb der 8 Wochen, im Defizit riskant'] },
    sessions: () => { const big = [W(5, '8', 6), W(4, '8', 7), W(3, '8', 8), W(2, '8', 9), W(5, '5', 6.5), W(4, '5', 7.5), W(3, '5', 8), W(2, '5', 8.5)];
      const heavy = [W(1, '3', 6), W(1, '3', 7), W(1, '3', 8), W(1, '3', 9), W(1, '1', 6.5), W(1, '1', 7.5), W(1, '1', 8.5), W(1, '1', 9.5)];
      const sec = [W(5, '8', 7.5), W(4, '8', 8), W(3, '8', 8.5), W(2, '8', 9), W(5, '5', 7.5), W(4, '5', 8), W(3, '5', 8.5), W(2, '5', 9)];
      return [{ k: 'A', kind: 'gym', title: 'Brust und Rücken', sub: 'Bankdrücken, Klimmzüge, Rudern', add: [X('h_a1', 'bench', 5, '8', 6, 180, 'main', 'Volumensätze.', '', big), X('h_a2', 'bench', 1, '3', 6, 180, 'main', 'Schwerer Satz nach den Volumensätzen.', '', heavy), X('h_a3', 'incl_bb', 5, '8', 7.5, 120, 'dp', '', '', sec), X('h_a4', 'cg_bench', 5, '5', 7.5, 120, 'dp', 'Original: 3-Board-Press.', '', [W(5, '5', 7.5), W(4, '5', 8), W(3, '5', 8.5), W(2, '5', 9), W(5, '3', 7.5), W(4, '3', 8), W(3, '3', 8.5), W(2, '3', 9)]), X('h_a5', 'pullup', 4, '8', 8, 90, 'bw', '32 Wiederholungen gesamt, ab Woche 5: 40.'), X('h_a6', 'bb_row', 3, '8', 8, 90, 'dp', 'Aufsteigend, ca. 10 % pro Satz.'), X('h_a7', 'db_row', 3, '12', 8.5, 60, 'dp', '1 s Pause am Boden.', '', [W(3, '12', 8.5), W(3, '12', 8.5), W(3, '10', 8.5), W(3, '10', 8.5), W(3, '8', 8.5), W(3, '8', 8.5), W(3, '6', 8.5), W(3, '6', 8.5)])] },
        { k: 'B', kind: 'gym', title: 'Beine und unterer Rücken', sub: 'Kniebeuge, Kreuzheben', add: [X('h_b1', 'squat', 5, '8', 6, 180, 'main', 'Volumensätze.', '', big), X('h_b2', 'squat', 1, '3', 6, 180, 'main', 'Schwerer Satz.', '', heavy), X('h_b3', 'dl', 3, '8', 7, 180, 'main', '', '', [W(3, '8', 7), W(3, '8', 7.5), W(2, '8', 8), W(2, '8', 8.5), W(3, '5', 8), W(3, '5', 8.5), W(2, '5', 9), W(2, '5', 9.5)]), X('h_b4', 'legpress', 3, '12/10/8', 8, 120, 'dp', 'Aufsteigend.'), X('h_b5', 'fs', 5, '8', 7.5, 120, 'dp', '', '', sec), X('h_b6', 'ghr', 2, '5–8', 8, 90, 'dp', 'Original: 10 Wiederholungen gesamt, jede Woche +2.')] },
        { k: 'C', kind: 'gym', title: 'Schulter und Arme', sub: 'Schulterdrücken, Trizeps, Bizeps', add: [X('h_c1', 'ohp', 5, '8', 7.5, 150, 'main', '', '', sec), X('h_c2', 'lat', 2, '12', 8.5, 60, 'dp', '', 'S1', [W(2, '12', 8.5), W(3, '12', 8.5), W(4, '12', 8.5), W(5, '12', 8.5), W(2, '8', 8.5), W(3, '8', 8.5), W(4, '8', 8.5), W(5, '8', 8.5)]), X('h_c3', 'rev_fly', 2, '12', 8.5, 60, 'dp', '', 'S1', [W(2, '12', 8.5), W(3, '12', 8.5), W(4, '12', 8.5), W(5, '12', 8.5), W(2, '8', 8.5), W(3, '8', 8.5), W(4, '8', 8.5), W(5, '8', 8.5)]),
          X('h_c4', 'cg_bench', 5, '8', 7.5, 120, 'dp', '', '', sec), X('h_c5', 'skull', 3, '12/10/8', 8.5, 90, 'dp', 'Aufsteigend.'), X('h_c6', 'tri_pd', 3, '12', 8.5, 60, 'dp'), X('h_c7', 'curl', 3, '10/8/6', 8.5, 90, 'dp', 'Aufsteigend.'), X('h_c8', 'hammer', 3, '8', 8.5, 90, 'dp', 'Direkt nach Kurzhantel-Curls mit Drehung.')] }]; } },
  strongbb: { name: 'Strong Bodybuilder', desc: 'Schwere Grundübung plus Riesensätze für Pump. Viel Volumen, 4 Tage.',
    goals: ['muscle', 'strength'], level: ['advanced'], days: 4, minutes: 80, place: 'gym', weeks: 8, author: 'Amit Sapir (T Nation)',
    src: [{ t: 'The Strong Bodybuilder Program (T Nation)', u: 'https://archive.t-nation.com/workouts/the-strong-bodybuilder-program/' }],
    who: 'Für Erfahrene, die nach Jahren Training Masse und Kraft zusammen aufbauen wollen.', prereq: 'Mehrjährige Erfahrung, gute Erholung, kein starkes Defizit.',
    struct: 'Beine, Brust, Rücken/Bizeps, Schulter/Trizeps im Rhythmus 2 Tage an, 1 Tag frei. Erste Übung wellenförmig 8×8, 7×6, 10×4, 3×10, letzter Satz so viele wie möglich, dann Riesensätze aus 4 Übungen ohne Pause.',
    phases: ['b1', 'b2', 'b3', 'b1', 'b1', 'b2', 'b3', 'b1', 'b1', 'b2', 'b3', 'dl'],
    ev: { g: 'C', pros: ['Hohes Volumen und Nähe zum Versagen fördern Hypertrophie', 'Abwechslung von schwer und Pump'], cons: ['Sehr hohes Volumen, ohne Deload', 'Riesensätze schwer im vollen Studio', 'Für Einsteiger und im Defizit ungeeignet'] },
    sessions: () => { const A = [W(8, '8', 8), W(7, '6', 8), W(10, '4', 8), W(3, '10', 8)], B = [W(3, '10', 8), W(3, '8', 8), W(3, '6', 8), W(3, '12', 8)];
      const g = (p, items) => items.map((it, i) => X(p + i, it[0], 3, it[1], 9, i === items.length - 1 ? 150 : 0, 'dp', it[2] || '', 'G'));
      return [{ k: 'A', kind: 'gym', title: 'Beine', sub: 'Kniebeuge, Frontkniebeuge, Riesensatz', add: [X('s_a1', 'squat', 8, '8', 8, 180, 'main', 'Letzter Satz so viele wie möglich.', '', A), X('s_a2', 'fs', 3, '10', 8, 150, 'dp', '', '', B), ...g('s_ag', [['curl_lying', '10', '2 s halten oben'], ['hack', '10', '5 s ablassen'], ['legext', '10', '2 s halten oben'], ['legpress', '8+8+8', 'eng, weit, mittel']])] },
        { k: 'B', kind: 'gym', title: 'Brust', sub: 'Schrägbank, Dips, Riesensatz', add: [X('s_b1', 'incl_bb', 8, '8', 8, 180, 'main', 'Letzter Satz so viele wie möglich.', '', A), X('s_b2', 'bench', 3, '10', 8, 150, 'dp', 'Original: Negativbank.', '', B), ...g('s_bg', [['pecdeck', '10+10', 'Drop-Satz'], ['incl', '8+8', 'neutral, dann normal'], ['dip', '8+8', '5 s ablassen'], ['cable_fly', '8+8', '2 s halten, dann schnell']])] },
        { k: 'C', kind: 'gym', title: 'Rücken und Bizeps', sub: 'Kreuzheben, Klimmzüge, Riesensatz', add: [X('s_c1', 'dl', 8, '8', 8, 210, 'main', 'Letzter Satz so viele wie möglich.', '', A), X('s_c2', 'pullup_w', 3, '10', 8, 150, 'dp', 'Neutraler Griff.', '', B), ...g('s_cg', [['latpd', '8+8+8', 'langsam, Pause unten, Dehnung oben'], ['cable_row', '8+8+8', ''], ['db_row', '8+8+8', ''], ['curl', '8+8+8', 'voll, halb, unten']])] },
        { k: 'D', kind: 'gym', title: 'Schulter und Trizeps', sub: 'Push Press, Riesensätze', add: [X('s_d1', 'push_press', 8, '8', 8, 180, 'main', 'Letzter Satz so viele wie möglich.', '', A), X('s_d2', 'ohp', 3, '10', 8, 150, 'dp', 'Original: Nackendrücken.', '', B), ...g('s_dg', [['lat', '8+8', 'voll, dann Teilwiederholungen'], ['rev_fly', '10+10', ''], ['db_ohp', '8+8', '']]), X('s_d3', 'cg_bench', 8, '8', 8, 150, 'dp', '', '', A), ...g('s_dh', [['tri_pd', '8+8', ''], ['tri_oh', '8+8', ''], ['skull', '8+8', '']])] }]; } },
  fl4: { name: 'Fat-Loss 4', desc: 'Kurzes Krafttraining plus Zirkel aus Druck/Zug, Bein, Rumpf und Cardio.',
    goals: ['fat', 'health'], level: ['intermediate'], days: 3, minutes: 45, place: 'gym', weeks: 12, author: 'Nick Tumminello (T Nation)',
    src: [{ t: 'The Fat-Loss 4 Workout Protocol (T Nation)', u: 'https://archive.t-nation.com/workouts/the-fat-loss-4-workout-protocol/' }],
    who: 'Für Fortgeschrittene mit wenig Zeit, die im Defizit Kraft halten wollen.', prereq: 'Grundtechnik, Cardio-Gerät oder Springseil.',
    struct: '3 Tage (Push, Beine/Hüfte, Pull). Erst 2 Kraftübungen mit 4–5×6–8, dann 6–8 Runden FL4-Zirkel: 30 s Ober-, 30 s Unterkörper, 30 s Rumpf, je 15 s Pause, 90 s Cardio bei 80 % HFmax, 1 min Pause.',
    ev: { g: 'B', pros: ['Schwere Sätze erhalten Kraft im Defizit', 'Zeiteffizient, hoher Verbrauch'], cons: ['Zirkel bringen für Muskelaufbau wenig', 'Kalorienverbrauch durch Training ist klein gegenüber der Ernährung'] },
    sessions: () => { const fl = (p, a, b, c) => [X(p + '1', a, 6, '30', 7.5, 15, 'time', 'FL4-Zirkel: 30 s, 15 s Pause.', 'K'), X(p + '2', b, 6, '30', 7.5, 15, 'time', '', 'K'), X(p + '3', c, 6, '30', 7.5, 15, 'time', '', 'K'), X(p + '4', 'bike_int', 6, '90', null, 60, 'time', '90 s bei etwa 80 % HFmax. Danach musst du einen ganzen Satz sprechen können.', 'K')];
      return [{ k: 'A', kind: 'gym', title: 'Push + FL4', sub: 'Drücken, dann Zirkel', add: [X('t_a1', 'db_bench', 4, '6–8', 8, 120, 'dp'), X('t_a2', 'db_ohp', 4, '6–8', 8, 120, 'dp'), ...fl('t_ak', 'pushup', 'goblet', 'plank')] },
        { k: 'B', kind: 'gym', title: 'Beine + FL4', sub: 'Kreuzheben, dann Zirkel', add: [X('t_b1', 'trap', 5, '4–6', 8, 150, 'main'), X('t_b2', 'bss', 3, '6–8', 8, 90, 'dp', 'Pro Bein.'), ...fl('t_bk', 'row', 'stepup', 'rev_crunch')] },
        { k: 'C', kind: 'gym', title: 'Pull + FL4', sub: 'Klimmzüge, dann Zirkel', add: [X('t_c1', 'chinup', 4, '6–8', 8, 120, 'dp'), X('t_c2', 'db_row', 3, '6–8', 8, 90, 'dp', 'Pro Arm.'), ...fl('t_ck', 'db_ohp', 'rdl_db', 'pallof')] }]; } },
  bwrr: { name: 'Bodyweight Recommended Routine', desc: 'Ganzkörper mit Körpergewicht, Progression über schwerere Varianten statt Gewicht.',
    goals: ['muscle', 'strength', 'health'], level: ['beginner', 'intermediate'], days: 3, minutes: 50, place: 'minimal', weeks: 12, author: 'r/bodyweightfitness',
    src: [{ t: 'Recommended Routine (r/bodyweightfitness Wiki)', u: 'https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/' }, { t: 'Recommended Routine (Liftosaur)', u: 'https://www.liftosaur.com/programs/recommended-routine' }],
    who: 'Für Einsteiger bis frühe Fortgeschrittene, die zuhause oder im Park trainieren.', prereq: 'Stange für Klimmzüge und Rudern, idealerweise Barren oder Ringe.',
    struct: '3× pro Woche dasselbe Ganzkörper-Training: drei Supersatz-Paare (Klimmzug + Kniebeuge, Dips + Hüftstreckung, Rudern + Liegestütz), dann Rumpf. 3×5–8, bei 3×8 die nächste schwerere Variante. Varianten findest du bei jeder Übung unter „Varianten“.',
    ev: { g: 'A', pros: ['Ganzkörper 3× pro Woche, ausgewogene Zug-Druck-Balance', 'Varianten-Progression funktioniert für Muskelaufbau ähnlich wie Gewicht, solange nah am Versagen trainiert wird'], cons: ['Beine bekommen auf Dauer zu wenig Reiz', 'Für maximale Kraft weniger geeignet als Langhantel'] },
    sessions: () => { const rr = s => ({ k: s, kind: 'gym', title: 'Ganzkörper ' + s, sub: 'Paare, dann Rumpf', add: [X(s + '_r1', 'neg_pu', 3, '5–8', 8.5, 90, 'bw', 'Leichter oder schwerer unter „Varianten“.', 'P1'), X(s + '_r2', 'bw_squat', 3, '5–8', 8.5, 90, 'bw', '', 'P1'), X(s + '_r3', 'dip_neg', 3, '5–8', 8.5, 90, 'bw', '', 'P2'), X(s + '_r4', 'sl_rdl', 3, '5–8', 8.5, 90, 'bw', 'Pro Bein.', 'P2'), X(s + '_r5', 'inv_row', 3, '5–8', 8.5, 90, 'bw', '', 'P3'), X(s + '_r6', 'pushup', 3, '5–8', 8.5, 90, 'bw', '', 'P3'), X(s + '_r7', 'plank', 3, '20–30', null, 60, 'time', 'Jede Einheit +5 s, ab 30 s: Ab-Wheel.', 'R'), X(s + '_r8', 'pallof', 3, '8–12', 8, 60, 'dp', '', 'R'), X(s + '_r9', 'hyper45', 3, '8–12', 8, 60, 'dp', 'Ohne Bank: Rückenstrecken am Boden.', 'R')] });
      return [rr('A'), rr('B'), rr('C')]; } },
  c25k: { name: 'Couch to 5K', desc: 'In 9 Wochen von null auf 30 Minuten Laufen, mit Geh-Pausen.',
    goals: ['endurance', 'fat', 'health'], level: ['beginner'], days: 3, minutes: 35, place: 'minimal', weeks: 12, author: 'NHS (britischer Gesundheitsdienst)',
    src: [{ t: 'NHS Couch to 5K', u: 'https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/' }, { t: 'Couch to 5K 9-Wochen-Plan (PDF)', u: 'https://cdn.greatrun.org/wp-content/uploads/2021/04/Couchto5k9weekplan.pdf' }],
    who: 'Für alle, die mit dem Laufen anfangen wollen, auch bei Übergewicht.', prereq: 'Laufschuhe. Bei starkem Übergewicht oder Gelenkbeschwerden vorher ärztlich abklären oder mit Walking starten.',
    struct: '3 Läufe pro Woche mit Ruhetag dazwischen. Woche 1: 8×1 min laufen, 1,5 min gehen. Die Laufabschnitte werden jede Woche länger, ab Woche 9 läufst du 30 Minuten am Stück. Woche 10–12 festigen das.',
    phases: ['b1', 'b1', 'b1', 'b2', 'b2', 'b2', 'b3', 'b3', 'test', 'b3', 'b3', 'b3'],
    ev: { g: 'A', pros: ['Behutsame Steigerung senkt das Verletzungsrisiko für Einsteiger', 'Millionenfach genutzt, hohe Durchhaltequote'], cons: ['Kein Krafttraining, im Defizit ergänzen', 'Für Trainierte zu leicht'] },
    sessions: () => { const wk = run => [c25(8, 1, 1.5), c25(6, 1.5, 2), c25(2, 3, 1.5, { title: '2 × (1,5 + 3 min laufen)', sub: '1,5 und 3 min laufen, dazwischen 1,5 bzw. 3 min gehen', seq: [[1.5, 1.5], [3, 3], [1.5, 1.5], [3, 0]] }), c25(2, 4, 2.5, { title: '3 + 5 + 3 + 5 min laufen', sub: '1,5 bzw. 2,5 min gehen dazwischen', seq: [[3, 1.5], [5, 2.5], [3, 1.5], [5, 0]] }),
        run === 1 ? c25(3, 5, 3, { seq: [[5, 3], [5, 3], [5, 0]] }) : run === 2 ? c25(2, 8, 5) : crun(20), run === 1 ? c25(2, 6.5, 3, { title: '5 + 8 + 5 min laufen', sub: '3 min gehen dazwischen', seq: [[5, 3], [8, 3], [5, 0]] }) : run === 2 ? c25(2, 10, 3) : crun(25), crun(25), crun(28), crun(30), crun(30), crun(30), crun(30)];
      return [1, 2, 3].map(r => ({ k: 'LMN'[r - 1], kind: 'z2', title: 'Lauf ' + r, cardio: { clamp: true, weeks: wk(r) } })); } },
  vo2: { name: 'VO₂max-Block 4×4', desc: 'Norwegische 4×4-Intervalle zweimal pro Woche plus ein langer lockerer Lauf.',
    goals: ['endurance', 'hybrid', 'health'], level: ['beginner', 'intermediate', 'advanced'], days: 4, minutes: 45, place: 'gym', weeks: 12, author: 'Nach Helgerud et al. 2007 (NTNU Trondheim)',
    src: [{ t: 'Helgerud et al. 2007, Med Sci Sports Exerc', u: 'https://pubmed.ncbi.nlm.nih.gov/17414804/' }],
    who: 'Für alle, die ihre VO₂max gezielt steigern wollen. Mit Krafterhalt-Einheit auch für Hybrid-Athleten.', prereq: 'Einigermaßen fit, keine Herzbeschwerden. Laufband, Rad, Rudergerät oder bergauf laufen.',
    struct: '2× pro Woche 4×4 min bei 90–95 % HFmax mit 3 min locker dazwischen, 1× Z2 40–60 min, 1× Ganzkörper-Kraft zum Erhalt. Deload in Woche 4 und 8 mit 3×4.',
    ev: { g: 'A', pros: ['In der Studie stieg die VO₂max mit 4×4 um 7 % mehr als mit Dauerlauf bei gleicher Arbeit', 'Nur 2 harte Einheiten pro Woche'], cons: ['Sehr anstrengend, gute Erholung nötig', 'Allein kein Muskelaufbau'] },
    sessions: () => { const int = w => ({ mode: 'int', reps: w === 4 || w === 8 ? 3 : 4, dur: 4, rest: 3, warm: 10, cool: 5, hi: true, sub: '90–95 % HFmax, 3 min locker dazwischen' });
      const ws = Array.from({ length: 12 }, (_, i) => int(i + 1)); const z = [40, 45, 45, 35, 50, 50, 55, 40, 55, 60, 60, 45].map(m => ({ mode: 'z2', min: m }));
      return [{ k: 'H', kind: 'hiit', title: '4×4 Intervalle', cardio: { weeks: ws } }, { k: 'A', kind: 'gym', title: 'Kraft erhalten', sub: 'Ganzkörper, 2–3 Sätze', add: [X('v_a1', 'goblet', 3, '6–10', 8, 120, 'dp'), X('v_a2', 'db_bench', 3, '6–10', 8, 90, 'dp'), X('v_a3', 'latpd', 3, '8–12', 8, 90, 'dp'), X('v_a4', 'rdl_db', 2, '8–10', 8, 90, 'dp'), X('v_a5', 'calf_st', 2, '10–15', 9, 60, 'dp')] },
        { k: 'I', kind: 'hiit', title: '4×4 Intervalle', cardio: { weeks: ws } }, { k: 'Z', kind: 'z2', title: 'Langer Z2-Lauf', cardio: { weeks: z } }]; } },
  easy: { name: 'Easy Strength', desc: 'Fünf Übungen, jeden Tag leicht, nie bis ans Limit. Für Sportler neben ihrem Sport.',
    goals: ['strength', 'athletic'], level: ['intermediate', 'advanced'], days: 5, minutes: 30, place: 'gym', weeks: 8, author: 'Dan John und Pavel Tsatsouline',
    src: [{ t: 'Easy Strength (Liftosaur)', u: 'https://www.liftosaur.com/programs/easy-strength' }, { t: 'The Easy Strength Workout (Experience Life)', u: 'https://experiencelife.lifetime.life/article/the-easy-strength-workout/' }],
    who: 'Für Sportler (z. B. Fußball), die neben Training und Spielen stärker werden wollen, ohne müde zu sein.', prereq: 'Saubere Technik, Kenntnis der eigenen Maximalkraft.',
    struct: '5 Tage pro Woche dieselben 5 Übungen mit 2×5 (Kreuzheben, Drücken, Ziehen, Rumpf, Tragen). Gewicht so wählen, dass jede Wiederholung schnell bleibt. Wird es leicht, ein kleines Stück mehr.',
    ev: { g: 'B', pros: ['Hohe Frequenz bei niedriger Ermüdung, ideal neben Sport', 'Kurze Einheiten'], cons: ['Wenig Volumen für Muskelaufbau', 'Weniger Studien, vor allem Praxiserfahrung'] },
    sessions: () => ['A', 'B', 'C', 'D', 'E'].map(s => ({ k: s, kind: 'gym', title: 'Easy Strength ' + s, sub: '5 Übungen, 2×5', add: [X(s + '_e1', 'trap', 2, '5', 6.5, 120, 'main', 'Nie bis ans Limit, Tempo bleibt schnell.'), X(s + '_e2', 'db_ohp', 2, '5', 6.5, 90, 'dp'), X(s + '_e3', 'pullup', 2, '5', 7, 90, 'bw'), X(s + '_e4', 'ab_wheel', 2, '5', 7, 60, 'dp'), X(s + '_e5', 'farmer', 2, 30, 7, 60, 'carry')] })) },
  over35: { name: 'Plan 35+', desc: 'Gelenkschonender Muskelaufbau für erfahrene Lifter mit Vorbelastungen.',
    goals: ['muscle', 'health'], level: ['intermediate', 'advanced'], days: 5, minutes: 70, place: 'gym', weeks: 12, author: 'Lee Boyce (T Nation)',
    src: [{ t: 'The 35+ Workout Plan (T Nation)', u: 'https://t-nation.com/t/the-35-workout-plan/281925' }],
    who: 'Für Erfahrene ab Mitte 30, auch mit alten Verletzungen oder Gelenkproblemen.', prereq: 'Mehrjährige Erfahrung. Trap Bar, Kabel, Klimmzugstange, ideal auch Schlitten und Rudergerät.',
    struct: '5 Tage: Zug, Druck, Beine, Schulter, Fortbewegung (Tragen, Schlitten, Rudern). Gelenkfreundliche Varianten wie Trap Bar und Boden- oder Pin-Drücken, 5 min Mobilität vor jeder Einheit.',
    ev: { g: 'B', pros: ['Gelenkschonende Übungsauswahl bei gleichem Reiz', 'Ausgewogen mit Rumpf und Konditionierung'], cons: ['5 Tage und viel Spezialgerät', 'Keine genaue Progressionsregel im Original, die App nutzt RPE'] },
    sessions: () => [{ k: 'A', kind: 'gym', title: 'Zug', sub: 'Trap Bar, Klimmzüge, Rudern', add: [X('o_a1', 'trap', 6, '3', 8, 180, 'main', 'Wöchentlich im Wechsel 6×3 und 3×6.', '', [W(6, '3', 8), W(3, '6', 8)]), X('o_a2', 'pullup_w', 5, '6–8', 8, 120, 'dp'), X('o_a3', 'db_row', 4, '12', 8.5, 90, 'dp', 'Pro Arm, unten dehnen.'), X('o_a4', 'inv_row', 3, 'AMRAP', 9, 0, 'bw', '', 'S1'), X('o_a5', 'face', 3, '12', 8.5, 120, 'dp', '', 'S1')] },
      { k: 'B', kind: 'gym', title: 'Druck', sub: 'Bank, Schrägbank, Dips', add: [X('o_b1', 'bench', 5, '5', 8, 150, 'main', 'Original: Pin- oder Bodendrücken.'), X('o_b2', 'incl', 4, '8–10', 8.5, 120, 'dp'), X('o_b3', 'dip_w', 4, '6–8', 8, 120, 'dp'), X('o_b4', 'pushup', 3, '10–12', 8.5, 0, 'bw', '', 'S1'), X('o_b5', 'pecdeck', 3, '15', 9, 120, 'dp', '', 'S1')] },
      { k: 'C', kind: 'gym', title: 'Beine', sub: 'Kniebeuge mit Pause, Split Squat', add: [X('o_c1', 'fs', 4, '3', 8, 180, 'main', 'Mit Pause unten.'), X('o_c2', 'bss', 4, '8–10', 8.5, 120, 'dp'), X('o_c3', 'rdl_db', 3, '10', 8, 0, 'dp', '', 'S1'), X('o_c4', 'kb_swing', 3, '15', 7, 90, 'dp', '', 'S1'), X('o_c5', 'ht', 3, '12–15', 7.5, 90, 'dp')] },
      { k: 'D', kind: 'gym', title: 'Schulter', sub: 'Schulterdrücken, Seitheben', add: [X('o_d1', 'db_ohp', 5, '5–8', 8, 120, 'main', 'Original: sitzend mit Langhantel.'), X('o_d2', 'lat', 4, '12', 9, 60, 'dp'), X('o_d3', 'face', 3, '15', 8.5, 60, 'dp')] },
      { k: 'E', kind: 'gym', title: 'Fortbewegung', sub: 'Tragen, Schlitten, Rudern', add: [X('o_e1', 'farmer', 5, 50, 8, 90, 'carry', 'Mindestens Körpergewicht gesamt.'), X('o_e2', 'sled_push', 5, 50, 8, 90, 'carry'), X('o_e3', 'hlr', 3, '10', 8, 90, 'dp'), X('o_e4', 'row_erg', 6, 500, 9, 120, 'carry', 'Jede Woche schneller. Im Wechsel: 3000 m am Stück.')] }] } };
/* Pläne mit Schwerpunkt Gesäß und Beine (Ganzkörper, Arme ohne eigene Sätze) */
LIBRARY.curves = { name: 'Strong Curves Einstieg', desc: 'Ganzkörper 3× pro Woche mit Hip Thrust oder Glute Bridge in jeder Einheit. Einfacher Einstieg mit doppelter Progression.', focus: 'lower',
  goals: ['muscle', 'health', 'fat'], level: ['beginner'], days: 3, minutes: 50, place: 'gym', weeks: 12, author: 'Bret Contreras und Kellie Davis (Buch „Strong Curves“, 2013)',
  src: [{ t: 'Strong Curves: Bootyful Beginnings (Liftosaur)', u: 'https://www.liftosaur.com/programs/strongcurves' }, { t: 'Strong Curves auf Boostcamp', u: 'https://www.boostcamp.app/bret-contreras/strong-curves-bootyful-beginnings' }, { t: 'Plotkin et al. 2023: Hip Thrust vs. Kniebeuge', u: 'https://pubmed.ncbi.nlm.nih.gov/37877099/' }],
  who: 'Für Einsteigerinnen und Wiedereinsteigerinnen, die vor allem Po und Beine aufbauen wollen.', prereq: 'Keine. Fitnessstudio, im ersten Monat reichen Kurzhanteln und Kabelzug.',
  struct: '3 Ganzkörper-Einheiten A, B, C. Jede beginnt mit einer Hüftstreckung (Hip Thrust, einbeinig oder Glute Bridge), dann Beine, Rudern, Drücken und Rumpf. 3×8–12, doppelte Progression. Das Original steigert über drei Phasen von Körpergewicht zu Langhantel; hier wählst du die passende Stufe unter „Varianten“.',
  ev: { g: 'B', pros: ['Hip Thrust und Kniebeuge bauen den Po ähnlich stark auf, die Kniebeuge zusätzlich die Oberschenkel', 'Ganzkörper 3× pro Woche ist für Einsteiger gut belegt', 'Frauen legen bei gleichem Training relativ genauso viel Muskel zu wie Männer'], cons: ['Viel Zeit für Gesäß-Isolation, wenig für den Oberkörper', 'Original nur als Buch, hier nach öffentlicher Zusammenfassung umgesetzt'] },
  sessions: () => [
    { k: 'A', kind: 'gym', title: 'Ganzkörper A', sub: 'Hip Thrust, Box Squat, Rudern', add: [X('sc_a1', 'ht', 3, '8–12', 8, 90, 'dp', 'Woche 1–4: leichtere Stufe unter „Varianten“ (Glute Bridge).'), X('sc_a2', 'db_row', 3, '8–12', 8, 75, 'dp', 'Pro Arm.'), X('sc_a3', 'box_squat', 3, '8–12', 8, 90, 'dp'), X('sc_a4', 'db_bench', 3, '8–12', 8, 75, 'dp'), X('sc_a5', 'rdl_db', 3, '10–12', 8, 90, 'dp'), X('sc_a6', 'abduct', 2, '15–20', 9, 45, 'dp', '', 'S1'), X('sc_a7', 'plank', 2, '30–45', null, 45, 'time', '', 'S1')] },
    { k: 'B', kind: 'gym', title: 'Ganzkörper B', sub: 'Einbeinig, Latzug, Split Squat', add: [X('sc_b1', 'sl_ht', 3, '8–12', 8, 75, 'dp'), X('sc_b2', 'latpd', 3, '8–12', 8, 75, 'dp'), X('sc_b3', 'bss', 3, '8–12', 8, 90, 'dp', 'Wiederholungen pro Bein.'), X('sc_b4', 'db_ohp', 3, '8–12', 8, 75, 'dp'), X('sc_b5', 'hyper45', 3, '10–15', 8, 75, 'dp', 'Rücken rund, Becken auf dem Polster: so arbeitet vor allem der Po.'), X('sc_b6', 'band_abd', 2, '15–20', 9, 45, 'dp', '', 'S1'), X('sc_b7', 'crunch', 2, '10–15', 8.5, 45, 'dp', '', 'S1')] },
    { k: 'C', kind: 'gym', title: 'Ganzkörper C', sub: 'Hip Thrust, Kniebeuge, Swing', add: [X('sc_c1', 'ht', 3, '6–10', 8, 120, 'dp'), X('sc_c2', 'cable_row', 3, '8–12', 8, 75, 'dp'), X('sc_c3', 'goblet', 3, '10–12', 8, 90, 'dp'), X('sc_c4', 'incl', 3, '8–12', 8, 75, 'dp'), X('sc_c5', 'kb_swing', 3, '12–15', 7.5, 75, 'dp'), X('sc_c6', 'frog_pump', 2, '20–30', 9, 45, 'dp', '', 'S1'), X('sc_c7', 'pallof', 2, '10–12', 8, 45, 'dp', 'Pro Seite.', 'S1')] }] };
LIBRARY.lowerfb = { name: 'Ganzkörper Beine & Po', desc: 'Ganzkörper 4× pro Woche. Gesäß und Beine bekommen das meiste Volumen, der Oberkörper genug für Kraft und Form, Arme keine eigenen Sätze.', focus: 'lower',
  goals: ['muscle', 'fat', 'health'], level: ['beginner', 'intermediate'], days: 4, minutes: 60, place: 'gym', weeks: 12, author: 'Hybridblock (eigener Plan)',
  src: [{ t: 'Schoenfeld et al. 2017, Dosis-Wirkung Volumen', u: 'https://pubmed.ncbi.nlm.nih.gov/27433992/' }, { t: 'Plotkin et al. 2023: Hip Thrust vs. Kniebeuge', u: 'https://pubmed.ncbi.nlm.nih.gov/37877099/' }, { t: 'Roberts et al. 2020: Krafttraining bei Frauen und Männern', u: 'https://pubmed.ncbi.nlm.nih.gov/32218059/' }],
  who: 'Für Frauen, die Po und Beine gezielt aufbauen und trotzdem ganzkörperlich trainieren wollen.', prereq: 'Saubere Technik in Kniebeuge, Hip Thrust und Rumänischem Kreuzheben, Fitnessstudio.',
  struct: '4 Ganzkörper-Einheiten. Pro Woche etwa 18–22 Sätze für das Gesäß (Hip Thrust, Kreuzheben-Varianten, Ausfallschritte, Abduktion, Kickback), 10–12 für Oberschenkel vorne und hinten, 9–12 für Rücken, 6–9 für Brust und Schultern. Arme arbeiten bei Zug und Druck mit. RPE-Steuerung, Deload in Woche 4 und 8.',
  ev: { g: 'B', pros: ['10–20 harte Sätze pro Muskel und Woche sind für Muskelaufbau gut belegt', 'Hip Thrust und Kniebeuge zusammen treffen Po und Oberschenkel', 'Jeder Muskel 2× pro Woche, Einheiten bleiben kurz'], cons: ['Oberkörper nur auf mittlerem Volumen', 'Hohes Bein-Volumen braucht gute Erholung, im starken Defizit eher auf 3 Einheiten reduzieren'] },
  sessions: () => [
    { k: 'A', kind: 'gym', title: 'Ganzkörper A', sub: 'Hip Thrust schwer, Kniebeuge, Latzug', add: [X('lf_a1', 'ht', 4, '6–10', 8, 120, 'dp'), X('lf_a2', 'squat', 3, '6–10', 7.5, 150, 'dp', 'So tief wie sauber möglich, tiefe Kniebeugen fordern den Po stärker.'), X('lf_a3', 'latpd', 3, '8–12', 8, 90, 'dp'), X('lf_a4', 'db_bench', 3, '8–12', 8, 90, 'dp'), X('lf_a5', 'curl_seated', 3, '10–15', 8.5, 60, 'dp', '', 'S1'), X('lf_a6', 'abduct', 3, '15–20', 9, 60, 'dp', '', 'S1')] },
    { k: 'B', kind: 'gym', title: 'Ganzkörper B', sub: 'Kreuzheben, Ausfallschritte, Rudern', add: [X('lf_b1', 'rdl', 3, '8–10', 8, 150, 'dp'), X('lf_b2', 'bss', 3, '8–12', 8, 90, 'dp', 'Oberkörper leicht nach vorn: mehr Po.'), X('lf_b3', 'cable_row', 3, '10–12', 8, 90, 'dp'), X('lf_b4', 'db_ohp', 2, '8–12', 8, 90, 'dp'), X('lf_b5', 'cable_kick', 3, '12–15', 9, 45, 'dp', '', 'S1'), X('lf_b6', 'calf_st', 2, '10–15', 9, 45, 'dp', '', 'S1'), X('lf_b7', 'plank', 2, '30–45', null, 45, 'time')] },
    { k: 'C', kind: 'gym', title: 'Ganzkörper C', sub: 'Hip Thrust leicht, Beinpresse, Klimmzug', add: [X('lf_c1', 'ht', 3, '12–15', 8.5, 90, 'dp', 'Oben 2 s halten.'), X('lf_c2', 'legpress', 3, '10–15', 8, 120, 'dp', 'Füße hoch und breit: mehr Po.'), X('lf_c3', 'assisted_pu', 3, '6–10', 8, 90, 'dp'), X('lf_c4', 'incl', 3, '8–12', 8, 90, 'dp'), X('lf_c5', 'db_rdl_b', 3, '10–12', 8, 75, 'dp', 'Pro Bein.'), X('lf_c6', 'abduct', 2, '15–20', 9, 60, 'dp')] },
    { k: 'D', kind: 'gym', title: 'Ganzkörper D', sub: 'Sumo, Step-up, Rudern', add: [X('lf_d1', 'sumo_dl', 3, '6–10', 7.5, 150, 'dp'), X('lf_d2', 'stepup', 3, '10–12', 8, 90, 'dp', 'Pro Bein, Box auf Kniehöhe.'), X('lf_d3', 'row', 3, '10–12', 8, 90, 'dp'), X('lf_d4', 'machine_press', 2, '10–12', 8, 90, 'dp'), X('lf_d5', 'pull_through', 3, '12–15', 8.5, 60, 'dp', '', 'S1'), X('lf_d6', 'hyper45', 2, '12–15', 8.5, 60, 'dp', 'Po-betont: Rücken rund, Füße nach außen.', 'S1'), X('lf_d7', 'crunch', 2, '10–15', 8.5, 45, 'dp')] }] };
TPL_DAYMAP.curves = { A: 1, B: 3, C: 5 }; TPL_DAYMAP.lowerfb = { A: 1, B: 2, C: 4, D: 5 };
/* Metadaten der eigenen Vorlagen nachtragen und Bibliothek als Vorlagen registrieren */
Object.keys(LIBRARY).forEach(id => { const L2 = LIBRARY[id]; L2.id = id; if (PLAN_TPL[id]) { L2.name = L2.name || PLAN_TPL[id].name; L2.desc = L2.desc || PLAN_TPL[id].desc; L2.sessions = L2.sessions || PLAN_TPL[id].sessions; }
  PLAN_TPL[id] = { name: L2.name, desc: L2.desc, sessions: L2.sessions, phases: L2.phases }; });
TPL_DAYMAP.fatloss = { A: 1, Z: 2, B: 3, Y: 4, C: 5 }; TPL_DAYMAP.gzclp = { A: 1, B: 3, C: 5, D: '' }; TPL_DAYMAP.ppl = { A: 1, C: 2, E: 3, B: 4, D: 5, F: 6 }; TPL_DAYMAP.bbb = { A: 1, B: 2, C: 4, D: 5 };
TPL_DAYMAP.henriques = { A: 1, B: 3, C: 5 }; TPL_DAYMAP.strongbb = { A: 1, B: 2, C: 4, D: 5 }; TPL_DAYMAP.fl4 = { A: 1, B: 3, C: 5 }; TPL_DAYMAP.bwrr = { A: 1, B: 3, C: 5 }; TPL_DAYMAP.c25k = { L: 1, M: 3, N: 6 };
TPL_DAYMAP.vo2 = { H: 1, A: 2, I: 4, Z: 6 }; TPL_DAYMAP.easy = { A: 1, B: 2, C: 3, D: 4, E: 5 }; TPL_DAYMAP.over35 = { A: 1, B: 2, C: 3, D: 5, E: 6 };

/* ---------- Empfehlung ---------- */
function scorePlan(p, q) { let s = 0; const why = [];
  if (q.goal && p.goals.includes(q.goal)) { s += p.goals[0] === q.goal ? 45 : 20; why.push($t('passt zu deinem Ziel')); } else if (q.goal) s -= 15;
  if (q.level && p.level.includes(q.level)) { s += 25; why.push($t('passt zu deiner Erfahrung')); } else if (q.level) s -= q.level === 'beginner' ? (p.level.includes('advanced') ? 45 : 25) : 10;
  const hasGym = (p.sessions ? p.sessions() : []).some(x => x.kind === 'gym'); if (q.goal === 'fat' && hasGym) s += 15;
  const d = num(q.days); if (d) { const diff = Math.abs(p.days - d); s += diff === 0 ? 20 : diff === 1 ? 8 : -12 * diff; if (diff === 0) why.push(d + ' ' + $t('Tage pro Woche')); }
  const m = num(q.minutes); if (m) { if (p.minutes <= m + 5) { s += 10; } else s -= Math.min(25, (p.minutes - m) / 2); }
  if (q.place === 'minimal' && p.place !== 'minimal') s -= 50; if (q.place === 'home' && p.place === 'gym') s -= 25; if (q.place === 'gym' && p.place === 'minimal') s -= 5;
  const fo = q.focus || ((q.sex || (typeof S !== 'undefined' && S.settings.sex)) === 'w' ? 'lower' : 'balanced'); if (p.focus === 'lower') { if (fo === 'lower') { s += 22; why.push($t('Schwerpunkt Beine und Po')); } else s -= 20; }
  if (p.ev.g === 'A') s += 6; return { s, why }; }
function recommendPlans(q) { return Object.values(LIBRARY).map(p => Object.assign({ p }, scorePlan(p, q))).sort((a, b) => b.s - a.s); }

/* ---------- Plan-Generator aus Fragebogen ---------- */
const PATTERNS = { squat: ['squat', 'fs', 'hack', 'pend', 'legpress', 'goblet', 'bss', 'bw_squat'], hinge: ['rdl', 'trap', 'rdl_db', 'hyper45', 'ht', 'sl_rdl', 'kb_swing'], hpush: ['bench', 'db_bench', 'machine_press', 'smith_bench', 'pushup', 'incl_pushup'],
  vpush: ['db_ohp', 'ohp', 'machine_ohp', 'pushup'], ipush: ['incl', 'incl_machine', 'incl_bb', 'pushup'], hpull: ['row', 'cable_row', 'tbar_cs', 'db_row', 'bb_row', 'inv_row', 'ring_row'], vpull: ['pullup', 'latpd', 'assisted_pu', 'neg_pu', 'chinup'],
  dip: ['dip', 'dip_assist', 'dip_machine', 'dip_neg', 'bench_dip'], ham: ['curl_seated', 'curl_lying', 'nordic', 'sl_rdl', 'rdl_db'], lunge: ['bss', 'rev_lunge', 'split_squat', 'stepup'], calf: ['calf_st', 'calf_lp', 'calf_se', 'calf_smith'],
  core: ['crunch', 'hlr', 'captain', 'machine_crunch', 'ab_wheel', 'plank', 'rev_crunch'], bi: ['incline_curl', 'bayes', 'db_curl', 'curl', 'hammer'], tri: ['tri_oh', 'tri_pd', 'db_oh_ext', 'skull', 'diamond'], side: ['lat', 'lat_cable', 'lat_machine'], rear: ['face', 'rev_fly'],
  glute: ['ht', 'ht_machine', 'ht_db', 'glute_bridge', 'sl_ht', 'bw_bridge'], abd: ['abduct', 'cable_abd', 'band_abd'], kick: ['cable_kick', 'pull_through', 'hyper45', 'frog_pump'], ghinge: ['rdl', 'sumo_dl', 'db_rdl_b', 'rdl_db', 'sl_rdl', 'hyper45'] };
/* Beschwerden: Körperregion → Übungen meiden */
const REGION_AVOID = { knee: ['squat', 'fs', 'pend', 'hack', 'bss', 'rev_lunge', 'split_squat', 'stepup', 'shrimp', 'sissy', 'legext', 'box', 'squat_jump', 'broad'], lowback: ['dl', 'squat', 'fs', 'rdl', 'bb_row', 'trap', 'good_morning', 'kb_swing', 'sl_rdl', 'push_press', 'ohp'],
  shoulder: ['ohp', 'push_press', 'dip', 'dip_w', 'bench', 'incl_bb', 'pp_pushup', 'db_ohp', 'skull', 'hlr'], elbow: ['skull', 'cg_bench', 'diamond', 'chinup', 'curl', 'dip_w'], wrist: ['fs', 'pushup', 'diamond', 'pp_pushup', 'curl', 'bench_dip'],
  hip: ['squat', 'dl', 'bss', 'sl_rdl', 'kb_swing', 'ht', 'sumo_dl', 'sl_ht', 'db_rdl_b'], ankle: ['box', 'squat_jump', 'broad', 'calf_st', 'jump_rope'], neck: ['ohp', 'push_press', 'farmer'], upperback: ['bb_row', 'dl'], chest: ['bench', 'dip', 'dip_w', 'pecdeck', 'cable_fly'], hamstring: ['nordic', 'rdl', 'dl', 'sl_rdl', 'ghr'], calf: ['calf_st', 'box', 'jump_rope'], quad: ['sissy', 'legext', 'fs', 'squat', 'bss'] };
const REGION_TXT = { neck: $t('Nacken'), shoulder: $t('Schulter'), chest: $t('Brust'), upperback: $t('Oberer Rücken'), lowback: $t('Unterer Rücken'), elbow: $t('Ellbogen'), wrist: $t('Handgelenk'), hip: $t('Hüfte'), knee: $t('Knie'), hamstring: $t('Oberschenkel hinten'), quad: $t('Oberschenkel vorne'), calf: $t('Wade'), ankle: $t('Sprunggelenk / Fuß'), abs: $t('Bauch') };
const SLUG_REGION = { trapezius: 'neck', neck: 'neck', deltoids: 'shoulder', chest: 'chest', upperBack: 'upperback', lowerBack: 'lowback', forearm: 'wrist', hands: 'wrist', triceps: 'elbow', biceps: 'elbow', gluteal: 'hip', adductors: 'hip', obliques: 'abs', abs: 'abs', quadriceps: 'quad', knees: 'knee', hamstring: 'hamstring', calves: 'calf', tibialis: 'ankle', ankles: 'ankle', feet: 'ankle' };
function avoidSet(q) { const out = new Set(); Object.keys(q.pain || {}).forEach(r => (REGION_AVOID[r] || []).forEach(x => out.add(x))); return out; }
function pickEx(pattern, q, used) { const avoid = avoidSet(q); const st = { missingEq: q.missingEq || (typeof S !== 'undefined' ? S.settings.missingEq : []) || [], noEx: (typeof S !== 'undefined' && S.settings.noEx) || [] };
  let list = PATTERNS[pattern].filter(x => LIB[x] && !used.has(x));
  if (q.place === 'minimal') list = list.filter(x => exEq(x).every(e => ['pullbar', 'dipbar', 'rings', 'band', 'rack', 'box'].includes(e)));
  if (q.place === 'home') list = list.filter(x => exEq(x).every(e => ['db', 'bench', 'pullbar', 'dipbar', 'band', 'kb', 'rings', 'abwheel', 'box'].includes(e)));
  if (q.level === 'beginner') list.sort((a, b) => (['squat', 'fs', 'dl', 'ohp', 'bb_row', 'pullup', 'dip', 'nordic', 'hlr'].includes(a) ? 1 : 0) - (['squat', 'fs', 'dl', 'ohp', 'bb_row', 'pullup', 'dip', 'nordic', 'hlr'].includes(b) ? 1 : 0));
  const ok = list.filter(x => !avoid.has(x) && exAvailable(x, st)); const x = ok[0] || (avoid.size ? null : list.find(y => exAvailable(y, st))); if (x) used.add(x); return x; }
function generatePlan(q) { const days = Math.max(2, Math.min(6, num(q.days) || 3)); const goal = q.goal || 'health'; const lvl = q.level || 'beginner'; const mins = num(q.minutes) || 60;
  const cardioDays = goal === 'endurance' ? Math.min(3, days - 1) : goal === 'hybrid' ? 2 : goal === 'fat' && days >= 4 ? 1 + (days >= 5 ? 1 : 0) : 0;
  const gymDays = Math.max(1, days - cardioDays); const nEx = mins < 40 ? 4 : mins < 55 ? 5 : mins < 70 ? 6 : 7;
  const scheme = { strength: { m: [4, '4–6', 8], a: [3, '6–10', 8] }, muscle: { m: [3, '6–10', 8], a: [3, '10–15', 9] }, fat: { m: [3, '6–10', 8], a: [3, '10–15', 8.5] }, endurance: { m: [2, '8–12', 7.5], a: [2, '12–15', 8] }, hybrid: { m: [3, '5–8', 7.5], a: [3, '10–15', 9] }, health: { m: [3, '8–12', 7.5], a: [2, '10–15', 8] }, athletic: { m: [4, '3–5', 7.5], a: [3, '6–10', 8] } }[goal] || { m: [3, '8–12', 8], a: [3, '10–15', 8] };
  const splits = { 1: [['squat', 'hpush', 'vpull', 'hinge', 'hpull', 'vpush', 'core']], 2: [['squat', 'hpush', 'vpull', 'ham', 'side', 'core', 'bi'], ['hinge', 'vpush', 'hpull', 'lunge', 'calf', 'tri', 'core']],
    3: [['squat', 'hpush', 'vpull', 'ham', 'side', 'core', 'bi'], ['hinge', 'vpush', 'hpull', 'lunge', 'calf', 'tri', 'rear'], ['squat', 'ipush', 'vpull', 'ham', 'dip', 'core', 'bi']],
    4: [['squat', 'hinge', 'lunge', 'ham', 'calf', 'core', 'core'], ['hpush', 'vpull', 'vpush', 'hpull', 'side', 'tri', 'bi'], ['hinge', 'squat', 'ham', 'lunge', 'calf', 'core', 'core'], ['ipush', 'hpull', 'dip', 'vpull', 'side', 'bi', 'rear']],
    5: [['squat', 'hinge', 'lunge', 'ham', 'calf', 'core', 'core'], ['hpush', 'vpull', 'vpush', 'hpull', 'side', 'tri', 'bi'], ['hinge', 'squat', 'ham', 'lunge', 'calf', 'core', 'core'], ['ipush', 'hpull', 'dip', 'vpull', 'side', 'bi', 'rear'], ['squat', 'hpush', 'vpull', 'hinge', 'side', 'core', 'bi']],
    6: [['vpull', 'hpull', 'rear', 'bi', 'bi', 'hpull', 'rear'], ['hpush', 'vpush', 'ipush', 'tri', 'side', 'dip', 'side'], ['squat', 'hinge', 'lunge', 'ham', 'calf', 'core', 'core'], ['hpull', 'vpull', 'rear', 'bi', 'bi', 'vpull', 'rear'], ['vpush', 'hpush', 'dip', 'tri', 'side', 'ipush', 'side'], ['hinge', 'squat', 'ham', 'lunge', 'calf', 'core', 'core']] };
  /* Schwerpunkt Beine und Po: bleibt Ganzkörper, Gesäß in jeder Einheit zuerst, Arme ohne eigene Sätze (arbeiten bei Zug und Druck mit) */
  const focus = q.focus || ((q.sex || (typeof S !== 'undefined' && S.settings.sex)) === 'w' ? 'lower' : 'balanced');
  if (focus === 'lower') { const T = [['glute', 'squat', 'vpull', 'hpush', 'ham', 'abd', 'core'], ['ghinge', 'lunge', 'hpull', 'vpush', 'glute', 'calf', 'core'], ['glute', 'squat', 'vpull', 'ipush', 'kick', 'abd', 'core'], ['ghinge', 'lunge', 'hpull', 'hpush', 'glute', 'abd', 'core']];
    for (let n = 1; n <= 6; n++) splits[n] = Array.from({ length: n }, (_, i) => T[i % 4]); }
  const NAMES = { 1: ['Ganzkörper'], 2: ['Ganzkörper A', 'Ganzkörper B'], 3: ['Ganzkörper A', 'Ganzkörper B', 'Ganzkörper C'], 4: ['Unterkörper A', 'Oberkörper A', 'Unterkörper B', 'Oberkörper B'], 5: ['Unterkörper A', 'Oberkörper A', 'Unterkörper B', 'Oberkörper B', 'Ganzkörper'], 6: ['Pull A', 'Push A', 'Beine A', 'Pull B', 'Push B', 'Beine B'] };
  if (focus === 'lower') for (let n = 1; n <= 6; n++) NAMES[n] = Array.from({ length: n }, (_, i) => 'Ganzkörper ' + 'ABCDEF'[i]);
  const sessions = []; const letters = 'ABCDEF';
  for (let i = 0; i < gymDays; i++) { const used = new Set(); const pats = splits[gymDays][i].slice(0, nEx); const add = [];
    pats.forEach((pt, j) => { const ex = pickEx(pt, q, used); if (!ex) return; const main = j === 0 || (j === 1 && ['squat', 'hinge', 'ghinge', 'glute', 'hpush', 'vpush', 'vpull'].includes(pt));
      const [sets, reps, rpe] = main ? scheme.m : scheme.a; const timed = ['plank', 'support_hold'].includes(ex);
      add.push({ slot: 'gen_' + letters[i] + j, ex, sets, reps: timed ? '30–45' : reps, rpe: timed ? null : (q.level === 'beginner' ? Math.min(rpe, 8) : rpe), rest: main ? 150 : 75, type: timed ? 'time' : main && lvl !== 'beginner' ? 'main' : 'dp', note: '', sup: '' }); });
    sessions.push({ k: letters[i], kind: 'gym', title: NAMES[gymDays][i], sub: '', add }); }
  const ck = ['Z', 'H', 'Y']; for (let i = 0; i < cardioDays; i++) { const hi = (goal === 'endurance' || goal === 'hybrid') && i === 0; sessions.push(hi ? { k: ck[i], kind: 'hiit' } : { k: ck[i], kind: 'z2' }); }
  const dm = {}; const spread = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 5, 6], 6: [1, 2, 3, 4, 5, 6] }[days] || [1, 3, 5]; sessions.forEach((s, i) => { dm[s.k] = spread[i] != null ? spread[i] : ''; });
  return { tpl: 'gen', name: 'Eigener Plan', sessions, dayMap: dm, note: '', targets: null, v: 1, gen: { goal, level: lvl, days, minutes: mins, focus } }; }
