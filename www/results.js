/* ======================= ERGEBNISSE: Felder je Cardio-Art, Ergebnisseite abgeschlossener Einheiten, Uhr-Import ======================= */
/* Abgeschlossene Einheiten (Plan oder frei) zeigen nur noch ihre Ergebnisseite. „Bearbeiten“ öffnet das Formular.
   Jede Sportart bekommt nur die Felder, die dort üblich sind (Geräteanzeige, Uhr, Wettkampfwerte). Werte liegen in a.m. */
const opt = (...xs) => xs.map(x => Array.isArray(x) ? x : [x, x]);
const AF = () => ({
  runType: { l: $t('Art des Laufs'), t: 'sel', o: [['locker', $t('Lockerer Dauerlauf')], ['long', $t('Langer Lauf')], ['tempo', $t('Tempo / Schwelle')], ['intervall', $t('Intervalle')], ['wk', $t('Wettkampf')]] },
  venue: { l: $t('Wo?'), t: 'sel', o: [['strecke', $t('Freie Strecke')], ['bahn', $t('Laufbahn (400 m)')], ['runde', $t('Eigene Runde, z. B. um den Platz')]] },
  lapLen: { l: $t('Rundenlänge (m)'), show: m => m.venue === 'runde' }, laps: { l: $t('Runden'), show: m => m.venue === 'bahn' || m.venue === 'runde' },
  cadence: { l: $t('Ø Schrittfrequenz (Schritte/min)') }, elevUp: { l: $t('Höhenmeter bergauf (m)') }, elevDown: { l: $t('Höhenmeter bergab (m)') },
  speed: { l: $t('Ø Geschwindigkeit (km/h)') }, incline: { l: $t('Steigung (%)') }, steps: { l: $t('Schritte') }, pack: { l: $t('Rucksack (kg)') },
  watts: { l: $t('Ø Leistung (Watt)') }, wattsMax: { l: $t('Max. Leistung (Watt)') }, rpm: { l: $t('Ø Trittfrequenz (U/min)') }, level: { l: $t('Widerstandsstufe') },
  assist: { l: $t('Unterstützung'), t: 'sel', o: [['eco', 'Eco'], ['tour', 'Tour'], ['sport', 'Sport'], ['turbo', 'Turbo']] },
  pool: { l: $t('Bahnlänge'), t: 'sel', o: [['25', '25 m'], ['50', '50 m'], ['x', $t('Andere')]] }, poolLen: { l: $t('Bahnlänge (m)'), show: m => m.pool === 'x' }, lengths: { l: $t('Bahnen') },
  stroke: { l: $t('Lage'), t: 'sel', o: [['kraul', $t('Kraul')], ['brust', $t('Brust')], ['ruecken', $t('Rücken')], ['delfin', $t('Delfin')], ['lagen', $t('Lagen')], ['mix', $t('Gemischt')]] },
  swolf: { l: $t('Ø SWOLF') }, strokesLen: { l: $t('Züge pro Bahn') }, gear: { l: $t('Hilfsmittel'), t: 'sel', o: [['', $t('Keine')], ['pull', $t('Pullbuoy')], ['paddles', $t('Paddles')], ['fins', $t('Flossen')], ['board', $t('Brett')]] },
  waterTemp: { l: $t('Wassertemperatur (°C)') }, wetsuit: { l: $t('Neoprenanzug'), t: 'sel', o: [['', $t('Nein')], ['ja', $t('Ja')]] },
  damper: { l: $t('Widerstand / Damper (1–10)') }, spm: { l: $t('Ø Schlagzahl (Züge/min)') }, spmMax: { l: $t('Max. Schlagzahl') }, strokes: { l: $t('Züge gesamt') },
  technique: { l: $t('Technik'), t: 'sel', o: [['klassisch', $t('Klassisch')], ['skating', $t('Skating')]] }, runs: { l: $t('Abfahrten') }, vmax: { l: $t('Höchstgeschwindigkeit (km/h)') },
  floors: { l: $t('Stockwerke') }, stepsMin: { l: $t('Ø Stufen pro Minute') }, jumps: { l: $t('Sprünge gesamt') }, rounds: { l: $t('Runden') }, work: { l: $t('Belastung pro Runde (s)') }, rest: { l: $t('Pause pro Runde (s)') },
  format: { l: $t('Format'), t: 'sel', o: [['int', $t('Intervalle')], ['44', '4 × 4 min'], ['3030', '30/30'], ['tabata', 'Tabata'], ['emom', 'EMOM'], ['amrap', 'AMRAP'], ['fortime', $t('Auf Zeit')]] },
  modality: { l: $t('Womit?'), t: 'sel', o: [['lauf', $t('Laufen')], ['rad', $t('Rad / Air-Bike')], ['ruder', $t('Rudern')], ['ski', 'SkiErg'], ['bw', $t('Körpergewicht')], ['mix', $t('Gemischt')]] },
  stations: { l: $t('Stationen') }, result: { l: $t('Ergebnis (Zeit oder Runden)'), t: 'txt' }, classType: { l: $t('Kurs'), t: 'txt', ph: $t('z. B. Spinning, Body Pump') }, style: { l: $t('Stil'), t: 'txt' },
  session: { l: $t('Art'), t: 'sel', o: [['training', $t('Training')], ['spiel', $t('Spiel / Match')], ['frei', $t('Freizeit')]] }, minutes: { l: $t('Spielminuten') }, position: { l: $t('Position'), t: 'txt' },
  surface: { l: $t('Untergrund'), t: 'sel', o: [['rasen', $t('Rasen')], ['kunst', $t('Kunstrasen')], ['halle', $t('Halle')], ['asche', $t('Asche')]] }, sprints: { l: $t('Sprints') },
  matchType: { l: $t('Einzel oder Doppel'), t: 'sel', o: [['einzel', $t('Einzel')], ['doppel', $t('Doppel')]] }, score: { l: $t('Ergebnis'), t: 'txt' },
  discipline: { l: $t('Disziplin'), t: 'txt', ph: $t('z. B. BJJ, MMA, Judo') }, roundsMin: { l: $t('Rundenlänge (min)') },
  sparring: { l: $t('Inhalt'), t: 'sel', o: [['technik', $t('Technik')], ['sparring', $t('Sparring')], ['sack', $t('Sandsack')], ['pratzen', $t('Pratzen')], ['mix', $t('Gemischt')]] },
  climbType: { l: $t('Art'), t: 'sel', o: [['boulder', $t('Bouldern')], ['seil', $t('Seilklettern')]] }, routes: { l: $t('Routen / Boulder') }, grade: { l: $t('Höchster Grad'), t: 'txt', ph: $t('z. B. 6a, Fb 5+') },
  yogaType: { l: $t('Art'), t: 'sel', o: [['yoga', 'Yoga'], ['mobility', 'Mobility'], ['dehnen', $t('Dehnen')], ['pilates', 'Pilates']] },
  maxHr: { l: $t('Max. Puls') }, start: { l: $t('Startzeit'), t: 'time' } });
/* je Sportart: Distanz-Einheit, Kennzahl (pace/speed/p500/p100) und Felder */
const AT = { joggen: { d: 'km', k: 'pace', f: ['runType', 'venue', 'lapLen', 'laps', 'cadence', 'elevUp'] }, trail: { d: 'km', k: 'pace', f: ['runType', 'elevUp', 'elevDown', 'cadence'] },
  laufband: { d: 'km', k: 'pace', f: ['runType', 'speed', 'incline', 'cadence'] }, gehen: { d: 'km', k: 'pace', f: ['steps', 'elevUp', 'pack'] }, nordic: { d: 'km', k: 'pace', f: ['steps', 'elevUp'] },
  wandern: { d: 'km', k: 'pace', f: ['elevUp', 'elevDown', 'pack'] }, rad: { d: 'km', k: 'speed', f: ['elevUp', 'watts', 'rpm'] }, mtb: { d: 'km', k: 'speed', f: ['elevUp', 'elevDown', 'watts'] },
  ebike: { d: 'km', k: 'speed', f: ['assist', 'elevUp'] }, indoorrad: { d: 'km', k: 'speed', f: ['level', 'watts', 'wattsMax', 'rpm'] }, airbike: { d: 'km', k: 'speed', f: ['format', 'rounds', 'watts', 'wattsMax', 'rpm'] },
  schwimmen: { d: 'm', k: 'p100', f: ['pool', 'poolLen', 'lengths', 'stroke', 'swolf', 'strokesLen', 'gear'] }, freiwasser: { d: 'm', k: 'p100', f: ['stroke', 'waterTemp', 'wetsuit'] },
  rudern: { d: 'm', k: 'p500', f: ['damper', 'spm', 'spmMax', 'strokes', 'watts'] }, skierg: { d: 'm', k: 'p500', f: ['damper', 'spm', 'strokes', 'watts'] }, rudernboot: { d: 'km', k: 'p500', f: ['spm'] },
  kajak: { d: 'km', k: 'speed', f: ['spm'] }, langlauf: { d: 'km', k: 'speed', f: ['technique', 'elevUp'] }, ski: { d: 'km', k: 'speed', f: ['runs', 'elevDown', 'vmax'] }, snowboard: { d: 'km', k: 'speed', f: ['runs', 'elevDown', 'vmax'] },
  schneeschuh: { d: 'km', k: 'pace', f: ['elevUp', 'pack'] }, inline: { d: 'km', k: 'speed', f: ['vmax'] }, eislauf: { f: ['session'] }, crosstrainer: { d: 'km', f: ['level', 'incline', 'cadence', 'watts'] },
  stepper: { f: ['level', 'stepsMin', 'floors'] }, treppen: { f: ['floors', 'elevUp'] }, seil: { f: ['jumps', 'rounds', 'work', 'rest'] }, hiit: { f: ['format', 'modality', 'rounds', 'work', 'rest'] },
  zirkel: { f: ['format', 'rounds', 'stations', 'result'] }, hyrox: { d: 'km', f: ['format', 'stations', 'result'] }, kurs: { f: ['classType'] }, tanzen: { f: ['style'] },
  fussball: { d: 'km', f: ['session', 'minutes', 'position', 'surface', 'sprints', 'vmax'] }, basketball: { f: ['session', 'minutes'] }, handball: { f: ['session', 'minutes'] }, volleyball: { f: ['session', 'minutes'] },
  tennis: { f: ['session', 'matchType', 'score'] }, padel: { f: ['session', 'matchType', 'score'] }, badminton: { f: ['session', 'matchType', 'score'] }, tischtennis: { f: ['session', 'matchType', 'score'] }, squash: { f: ['session', 'score'] },
  kampfsport: { f: ['discipline', 'rounds', 'roundsMin', 'sparring'] }, boxen: { f: ['rounds', 'roundsMin', 'sparring'] }, klettern: { f: ['climbType', 'routes', 'grade'] }, mobility: { f: ['yogaType'] }, sonst: { d: 'km', f: [] }, kraft: { f: [] } };
const atOf = a => AT[a.type] || AT.sonst;
const actM = a => (a.m = a.m || {});
/* Dauer: „45“, „20:36“ (min:s) oder „1:05:00“ (h:min:s) → Minuten */
function parseDur(v) { v = String(v || '').trim().replace(',', '.'); if (!v) return null; const p = v.split(':').map(Number); if (p.some(isNaN)) return null; if (p.length === 1) return p[0]; if (p.length === 2) return p[0] + p[1] / 60; return p[0] * 60 + p[1] + p[2] / 60; }
function fmtDur(min) { if (min == null || isNaN(min)) return '–'; const s = Math.round(min * 60); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? h + ':' + pad(m) + ':' + pad(x) : m + ':' + pad(x); }
const fmtPc = secPerUnit => secPerUnit == null || !isFinite(secPerUnit) ? '–' : Math.floor(secPerUnit / 60) + ':' + pad(Math.round(secPerUnit % 60));
/* Distanz in km: eingetragen oder aus Runden/Bahnen/Laufband abgeleitet */
function actDistKm(a) { const m = actM(a); if (num(a.dist) != null) return num(a.dist);
  if ((m.venue === 'bahn' || m.venue === 'runde') && num(m.laps)) return num(m.laps) * (m.venue === 'bahn' ? 400 : num(m.lapLen) || 0) / 1000 || null;
  if (a.type === 'schwimmen' && num(m.lengths)) return num(m.lengths) * (m.pool === 'x' ? num(m.poolLen) || 0 : num(m.pool) || 25) / 1000;
  if (a.type === 'laufband' && num(m.speed) && num(a.dur)) return num(m.speed) * num(a.dur) / 60; return null; }
function actKey(a) { const km = actDistKm(a), d = num(a.dur); const k = atOf(a).k; if (!km || !d) return null;
  if (k === 'pace') return { l: $t('Ø Pace'), v: fmtPc(d * 60 / km), u: $t('/km') }; if (k === 'speed') return { l: $t('Ø Tempo'), v: fmt(km / (d / 60), 1), u: 'km/h' };
  if (k === 'p500') return { l: $t('Ø pro 500 m'), v: fmtPc(d * 60 / (km * 2)), u: '' }; if (k === 'p100') return { l: $t('Ø pro 100 m'), v: fmtPc(d * 60 / (km * 10)), u: '' }; return null; }
const fmtDist = (a, km) => km == null ? '–' : atOf(a).d === 'm' ? fmt(Math.round(km * 1000), 0) + ' m' : fmt(km, 2) + ' km';

/* ---------- Bearbeiten-Formular: Felder je Sportart ---------- */
function afField(a, key) { const F = AF()[key]; if (!F) return ''; const m = actM(a); if (F.show && !F.show(m)) return ''; const v = m[key] ?? (key === 'maxHr' ? a.maxHr ?? '' : '');
  const id = 'am-' + key; const lab = '<label for="' + id + '">' + F.l + '</label>';
  if (F.t === 'sel') return '<div class="field">' + lab + '<select id="' + id + '" data-aid="' + a.id + '" data-am="' + key + '"><option value="">–</option>' + F.o.map(o => '<option value="' + o[0] + '"' + (String(v) === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select></div>';
  if (F.t === 'txt') return '<div class="field">' + lab + '<input id="' + id + '" type="text" data-aid="' + a.id + '" data-am="' + key + '" value="' + esc(v) + '" placeholder="' + esc(F.ph || '') + '"></div>';
  if (F.t === 'time') return '<div class="field">' + lab + '<input id="' + id + '" type="time" data-aid="' + a.id + '" data-am="' + key + '" value="' + esc(v) + '"></div>';
  return '<div class="field">' + lab + '<input id="' + id + '" type="number" inputmode="decimal" step="any" data-aid="' + a.id + '" data-am="' + key + '" value="' + esc(v) + '"></div>'; }
function detailCard(a) { const t = ACT_MAP[a.type] || {}; if (t.strength || a.type === 'mobility' && false) return ''; const keys = ['start', ...atOf(a).f, 'maxHr'];
  const derived = actKey(a), km = actDistKm(a);
  return '<div class="card"><h2>' + $t('Details') + '</h2><div class="fields" style="margin-top:8px">' + keys.map(k => afField(a, k)).join('') + '</div>' +
    '<p class="small muted" id="am-derived" style="margin-top:10px">' + derivedTxt(a) + '</p>' +
    (a.type === 'schwimmen' || a.type === 'freiwasser' ? '<p class="small muted" style="margin-top:8px">' + $t('Tipp: Schwimmen zeichnest du am besten mit der Uhr auf. Nach dem Synchronisieren erscheint die Einheit hier automatisch mit Puls und Distanz.') + '</p>' : '') + '</div>'; }
/* Dauer als min:s, Distanz in der passenden Einheit */
function patchBaseFields(h, a) { const at = atOf(a);
  h = h.replace(/<div class="field"><label for="a-dur">[\s\S]*?<\/div>/, '<div class="field"><label for="a-durtxt">' + $t('Dauer (min:s oder h:min:s)') + '</label><input id="a-durtxt" type="text" inputmode="numeric" data-aid="' + a.id + '" data-am="durTxt" value="' + esc(actM(a).durTxt || (num(a.dur) ? fmtDur(num(a.dur)) : '')) + '" placeholder="' + $t('z. B. 20:36') + '" style="width:150px"></div>');
  h = h.replace(/<div class="field"><label for="a-dist">[\s\S]*?<\/div>/, at.d === 'm' ? '<div class="field"><label for="a-distm">' + $t('Distanz (m)') + '</label><input id="a-distm" type="number" inputmode="numeric" step="1" data-aid="' + a.id + '" data-am="distM" value="' + (num(a.dist) != null ? Math.round(num(a.dist) * 1000) : '') + '" placeholder="m"></div>' : at.d === 'km' ? '$&' : '');
  return h; }

/* ---------- Ergebnisseite ---------- */
const kpi = (v, l, u) => '<div class="rk"><b>' + v + (u ? '<small> ' + u + '</small>' : '') + '</b><span>' + l + '</span></div>';
(function () { const st = document.createElement('style'); st.textContent =
  '.rhead{background:linear-gradient(135deg,var(--charcoal),#3a3a3a);color:#fff;border-radius:var(--r);padding:18px}.rhead .t{font-size:13px;opacity:.75}.rhead h1{color:#fff;margin:4px 0 2px;font-size:26px}.rhead .big{font-size:40px;font-weight:800;line-height:1;margin-top:12px}.rhead .big small{font-size:18px;font-weight:700;opacity:.8}' +
  '.rk-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.rk{background:var(--fog);border-radius:14px;padding:12px}.rk b{display:block;font-size:20px;line-height:1.1}.rk b small{font-size:12px;color:var(--muted)}.rk span{display:block;font-size:12px;color:var(--muted);margin-top:4px}' +
  '.rpec{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.rpec button{width:36px;height:36px;border-radius:50%;border:0;background:var(--fog);font:inherit;font-weight:800;cursor:pointer}.rpec button.on{background:var(--ember);color:#fff}' +
  '.rset{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.rset span{background:var(--fog);border-radius:8px;padding:3px 8px;font-size:13px;font-weight:700}';
  document.head.appendChild(st); })();
function rpeChips(cur, act, extra) { return '<div class="rpec">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => '<button class="' + (num(cur) === r ? 'on' : '') + '" data-act="' + act + '" data-v="' + r + '" ' + extra + ' type="button">' + r + '</button>').join('') + '</div>'; }
function effectCard(tkey, rpe, dur) { const tr = S.hrTraces[tkey]; let z = null; if (tr) { const zt = zoneTimes(tr); const tot = zt.reduce((x, y) => x + y, 0); if (tot > 60) z = zt.map(x => x / tot); }
  let lab, txt; if (z) { const low = z[0] + z[1], mid = z[2], hi = z[3] + z[4]; if (hi > .2) { lab = $t('Hoher Reiz (Schwelle / VO₂max)'); txt = $t('Mehr als ein Fünftel der Zeit über 85 % HFmax. Danach 1–2 lockere Tage einplanen.'); } else if (mid > .35) { lab = $t('Mittlerer Reiz (Tempo)'); txt = $t('Viel Zeit in Zone 3. Gut für Tempohärte, ermüdet aber mehr als Zone 2.'); } else { lab = $t('Grundlage (Zone 1–2)'); txt = $t('Überwiegend locker. Baut die Ausdauerbasis auf und ermüdet kaum.'); } }
  else if (rpe) { if (rpe >= 8) { lab = $t('Harte Einheit'); txt = $t('Hohe Anstrengung. Der nächste Tag sollte locker sein.'); } else if (rpe >= 6) { lab = $t('Mittlere Einheit'); txt = $t('Fordernd, aber gut wegzustecken.'); } else { lab = $t('Lockere Einheit'); txt = $t('Erholsam, zählt kaum als Ermüdung.'); } }
  if (!lab) return ''; return '<div class="card"><h2>' + $t('Trainingsreiz') + '</h2><p style="margin:6px 0 0"><b>' + lab + '</b></p><p class="small muted" style="margin:4px 0 0">' + txt + '</p></div>'; }
function viewActResult(a) { const t = ACT_MAP[a.type] || ACT_MAP.sonst; const m = actM(a);
  const tr = S.hrTraces[a.id]; if (tr && tr.pts && tr.pts.length > 5 && (!num(a.avgHr) || !num(a.maxHr))) { const b = tr.pts.map(p => p[1]); if (!num(a.avgHr)) a.avgHr = Math.round(b.reduce((x, y) => x + y, 0) / b.length); if (!num(a.maxHr)) a.maxHr = Math.max(...b); save(); } const km = actDistKm(a); const key = actKey(a); const L = actLoad(a);
  const big = km ? fmtDist(a, km).split(' ') : [fmtDur(num(a.dur)), num(a.dur) >= 60 ? 'h' : 'min'];
  const tiles = [km ? kpi(fmtDur(num(a.dur)), $t('Dauer')) : '', key ? kpi(key.v, key.l, key.u) : '', num(a.avgHr) ? kpi(fmt(num(a.avgHr), 0), $t('Ø Puls'), 'bpm') : '', num(a.maxHr ?? m.maxHr) ? kpi(fmt(num(a.maxHr ?? m.maxHr), 0), $t('Max. Puls'), 'bpm') : '',
    num(a.kcal) ? kpi(fmt(num(a.kcal), 0), $t('kcal')) : '', L && L.load ? kpi(fmt(L.load, 0), $t('Belastung')) : '', num(a.rpe) ? kpi(fmt(num(a.rpe)), 'RPE') : '',
    ...atOf(a).f.filter(k => m[k] != null && m[k] !== '' && !(AF()[k].show && !AF()[k].show(m))).map(k => { const F = AF()[k]; const v = F.t === 'sel' ? ((F.o.find(o => o[0] === String(m[k])) || [])[1] || m[k]) : m[k]; return kpi(esc(String(v)), F.l.replace(/ \([^)]*\)$/, '')); })].filter(Boolean).join('');
  const strength = t.strength && (a.exercises || []).length ? '<div class="card"><h2>' + $t('Übungen') + '</h2>' + a.exercises.map(e => { const ds = (e.sets || []).filter(x => x.done || x.r); return '<div style="margin-top:10px"><b>' + esc((LIB[e.ex] || {}).name || e.ex) + '</b><div class="rset">' + (ds.length ? ds.map(x => '<span>' + (num(x.w) ? fmt(num(x.w)) + ' × ' : '') + (x.r ?? '–') + (x.rpe ? ' @' + x.rpe : '') + '</span>').join('') : '<span class="muted">' + $t('keine Sätze') + '</span>') + '</div></div>'; }).join('') + '</div>' : '';
  const src = a.src && a.src !== 'manual' ? ' · ' + esc(srcLabel(a)) : '';
  return '<a href="#training" class="back">' + ICON.back + $t('Training') + '</a>' +
    '<div class="stack" style="margin-top:8px"><div class="rhead"><div class="t">' + esc(fmtDay(a.date)) + (m.start ? ' · ' + esc(m.start) : '') + src + '</div><h1>' + esc(a.title || t.name) + '</h1><div class="big">' + big[0] + ' <small>' + (big[1] || '') + '</small></div></div>' +
    (tiles ? '<div class="rk-grid">' + tiles + '</div>' : '') +
    (!num(a.rpe) ? '<div class="card"><h2>' + $t('Wie anstrengend war es?') + '</h2><p class="small muted">' + $t('RPE 1 = sehr locker, 10 = maximal. Erst damit zählt die Einheit in deine Belastung.') + '</p>' + rpeChips(a.rpe, 'resRpeA', 'data-aid="' + a.id + '"') + '</div>' : '') +
    effectCard(a.id, num(a.rpe), num(a.dur)) + strength +
    (typeof routeCard === 'function' ? routeCard(a) : '') + (typeof splitsCard === 'function' ? splitsCard(a) : '') + traceCard(a.id, a.start ? { start: a.start, end: a.end } : null, a.type === 'hiit') +
    (a.note ? '<div class="card"><h2>' + $t('Notiz') + '</h2><p style="margin:6px 0 0">' + esc(a.note) + '</p></div>' : '') +
    '<div class="row" style="gap:8px"><button class="btn grow fog" data-act="resEditA" data-aid="' + a.id + '" type="button">' + $t('Bearbeiten') + '</button></div></div>'; }
function sessDone(w, k) { const s = peekSess(w, k); if (!s || s.skipped) return false; if (s.end && s.end.fin) return true; return s.date && s.date < today() && sessProgress(w, k).done; }
function viewSessResult(w, k) { const s = peekSess(w, k); const d = SESS[k]; const st = sessStats(w, k); const L = st.load || {}; const cardio = isCardio(k); const c = s.cardio || {};
  const tiles = [L.dur ? kpi(fmtDur(L.dur), $t('Dauer')) : '', !cardio ? kpi(st.sets + '<small>/' + st.total + '</small>', $t('Sätze')) : '', !cardio && st.vol ? kpi(st.vol >= 10000 ? fmt(st.vol / 1000, 1) : fmt(st.vol, 0), $t('Volumen'), st.vol >= 10000 ? 't' : 'kg') : '',
    cardio && num(c.avg) ? kpi(c.avg, $t('Ø Puls'), 'bpm') : '', cardio && num(c.max) ? kpi(c.max, $t('Max. Puls'), 'bpm') : '', cardio && c.perf ? kpi(esc(c.perf), $t('Leistung')) : '',
    L.rpe ? kpi(fmt(L.rpe), $t('Session-RPE')) : '', L.load ? kpi(fmt(L.load, 0), $t('Belastung')) : ''].filter(Boolean).join('');
  const exs = cardio ? '' : '<div class="card"><h2>' + $t('Übungen') + '</h2>' + planFor(w, k).map(spec => { const lg = (s.logs || {})[spec.slot]; const ds = lg ? loggedSets(lg).filter(x => x.done) : []; const ex = LIB[lg ? lg.ex : spec.ex] || {};
      const best = ds.reduce((mx, x) => x.w > 0 && x.r ? Math.max(mx, e1rm(x.w, x.r, Math.min(10, x.rpe ?? spec.rpe ?? 8))) : mx, 0);
      return '<div style="margin-top:12px"><div class="row"><b class="grow">' + esc(ex.name || spec.ex) + '</b>' + (best ? '<span class="small muted">e1RM ' + fmt(best, 0) + ' kg</span>' : '') + '</div><div class="rset">' + (ds.length ? ds.map(x => '<span>' + (x.w > 0 ? fmt(x.w) + ' × ' : '') + (x.r ?? '–') + (x.rpe != null ? ' @' + fmt(x.rpe) : '') + '</span>').join('') : '<span class="muted">' + $t('nicht gemacht') + '</span>') + '</div></div>'; }).join('') + '</div>';
  const prs = st.prs.length ? '<div class="card"><h2>' + $t('Neue PRs') + '</h2>' + st.prs.map(p => '<div class="row" style="margin-top:6px"><span class="grow">🏆 ' + esc(p.name) + '</span><b>' + fmt(p.v, 0) + ' kg e1RM</b></div>').join('') + '</div>' : '';
  return '<a href="#training" class="back">' + ICON.back + $t('Woche ') + w + '</a>' +
    '<div class="stack" style="margin-top:8px"><div class="rhead"><div class="t">' + esc(s.date ? fmtDay(s.date) : '') + ' · ' + $t('Woche ') + w + ' · ' + esc(PH_LABEL[phase(w)]) + '</div><h1>' + esc(d.title) + '</h1><div class="small" style="opacity:.8">' + esc(d.sub || '') + '</div><div class="big">✓ <small>' + $t('abgeschlossen') + '</small></div></div>' +
    (tiles ? '<div class="rk-grid">' + tiles + '</div>' : '') +
    (!L.rpe ? '<div class="card"><h2>' + $t('Wie anstrengend war es?') + '</h2><p class="small muted">' + $t('Session-RPE etwa 30 Minuten nach dem Training: 1 = sehr locker, 10 = maximal.') + '</p>' + rpeChips(null, 'resRpeS', 'data-w="' + w + '" data-k="' + k + '"') + '</div>' : '') +
    effectCard(sKey(w, k), L.rpe, L.dur) + prs + exs + traceCard(sKey(w, k), cardio ? null : gymWindow(s), SESS[k].kind === 'hiit') +
    '<div class="row" style="gap:8px"><button class="btn grow fog" data-act="resEditS" data-w="' + w + '" data-k="' + k + '" type="button">' + $t('Bearbeiten') + '</button><button class="btn grow fog" data-act="finReopen" data-w="' + w + '" data-k="' + k + '" type="button">' + $t('Weiter trainieren') + '</button></div></div>'; }
function resultHref(u) { return u.type === 'plan' ? '#training/' + sKey(u.w, u.k) : '#frei/' + u.id; }

/* ---------- Einbindung ---------- */
const _viewFreeRes = viewFree; viewFree = function (id) { const a = S.activities.find(x => x.id === id); if (!a) return _viewFreeRes(id);
  const imported = a.src && a.src !== 'manual' && num(a.dur); if ((a.done || imported) && ui.editAct !== id) return viewActResult(a);
  let h = _viewFreeRes(id); h = patchBaseFields(h, a); const t = ACT_MAP[a.type] || {}; if (!t.strength) { const m0 = /<p class="small(?: muted)?" style="margin:0 4px">/.exec(h); if (m0) h = h.slice(0, m0.index) + detailCard(a) + h.slice(m0.index); }
  if (ui.editAct === id) h = h.replace(/data-act="actDone"([^>]*)>[^<]*</, 'data-act="actDone"$1>' + $t('Änderungen speichern') + '<');
  return h; };
const _viewSessionRes = viewSession; viewSession = function (arg) { const m = /^w(\d+)-(.+)$/.exec(arg || ''); if (m) { const w = +m[1], k = m[2]; if (SESS[k] && sessDone(w, k) && ui.editSess !== arg) return viewSessResult(w, k); } return _viewSessionRes(arg); };
window.addEventListener('hashchange', () => { if (route.name !== 'frei') ui.editAct = null; if (route.name !== 'training' || !route.arg || route.arg !== ui.editSess) ui.editSess = null; });
const actFromEl = t => S.activities.find(x => x.id === t.dataset.aid);
document.addEventListener('input', e => { const t = e.target; if (!t.dataset || !t.dataset.am) return; const a = actFromEl(t); if (!a) return; const m = actM(a); const k = t.dataset.am;
  if (k === 'durTxt') { m.durTxt = t.value; const d = parseDur(t.value); a.dur = d != null ? String(Math.round(d * 100) / 100) : ''; }
  else if (k === 'distM') { a.dist = t.value === '' ? null : Math.round(num(t.value)) / 1000; }
  else if (k === 'maxHr') { a.maxHr = t.value === '' ? null : num(t.value); m.maxHr = t.value; }
  else m[k] = t.value; save(); });
function derivedTxt(a) { const derived = actKey(a), km = actDistKm(a); return [km && num(a.dist) == null ? $t('Distanz berechnet: ') + fmtDist(a, km) : '', derived ? derived.l + ': ' + derived.v + ' ' + derived.u : ''].filter(Boolean).join(' · '); }
document.addEventListener('input', e => { const t = e.target; if (!t.dataset || !(t.dataset.am || t.dataset.af)) return; const a = actFromEl(t); if (!a) return; const el = document.getElementById('am-derived'); if (el) el.textContent = derivedTxt(a); });
document.addEventListener('change', e => { const t = e.target; if (!t.dataset || !t.dataset.am) return; if (t.tagName === 'SELECT') { const y = window.scrollY; render(); window.scrollTo(0, y); } });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'resEditA') { ui.editAct = b.dataset.aid; render(); window.scrollTo(0, 0); }
  else if (a === 'finReopen') { const k0 = sKey(+b.dataset.w, b.dataset.k); if (ui.editSess !== k0) { ui.editSess = k0; setTimeout(render, 0); } }
  else if (a === 'resEditS') { ui.editSess = sKey(+b.dataset.w, b.dataset.k); render(); window.scrollTo(0, 0); }
  else if (a === 'resRpeA') { const x = S.activities.find(y => y.id === b.dataset.aid); if (x) { x.rpe = b.dataset.v; save(); render(); toast($t('RPE gespeichert')); } }
  else if (a === 'resRpeS') { const s = sess(+b.dataset.w, b.dataset.k); if (isCardio(b.dataset.k)) { s.cardio = s.cardio || {}; s.cardio.rpe = b.dataset.v; } else { s.end = s.end || {}; s.end.rpe = b.dataset.v; } save(); render(); toast($t('RPE gespeichert')); } });

/* ---------- Von der Uhr: neue Einheiten auf „Heute“ mit RPE-Abfrage ---------- */
function watchInbox() { if (VIEW) return ''; const since = addDays(today(), -3); const xs = S.activities.filter(a => a.src && a.src !== 'manual' && a.date >= since && !num(a.rpe) && !a.inboxDone).slice(-3); if (!xs.length) return '';
  return '<div class="card"><div class="row"><h2 class="grow">' + $t('Neu von deiner Uhr') + '</h2><span class="tag">' + xs.length + '</span></div>' + xs.map(a => { const t = ACT_MAP[a.type] || {}; const km = actDistKm(a);
    return '<div style="margin-top:12px;background:var(--paper);border-radius:14px;padding:12px"><a href="#frei/' + a.id + '" style="text-decoration:none;color:inherit"><b>' + esc(a.title || t.name) + '</b><br><span class="small muted">' + esc(fmtDay(a.date)) + ' · ' + fmtDur(num(a.dur)) + (km ? ' · ' + fmtDist(a, km) : '') + (num(a.avgHr) ? ' · Ø ' + fmt(num(a.avgHr), 0) + ' bpm' : '') + '</span></a>' +
      '<p class="small" style="margin:8px 0 0">' + $t('Wie anstrengend war es?') + '</p>' + rpeChips(null, 'resRpeA', 'data-aid="' + a.id + '"') + '</div>'; }).join('') + '</div>'; }
const _viewHeuteRes = viewHeute; viewHeute = function () { const h = _viewHeuteRes.apply(this, arguments); const box = watchInbox(); if (!box) return h; const i = h.indexOf('<div class="stack">'); return i < 0 ? h + box : h.slice(0, i + 19) + box + h.slice(i + 19); };

/* ---------- Aufzeichnen: Schwimmen läuft über die Uhr ---------- */
if (typeof viewTrack === 'function') { const _vtRes = viewTrack; viewTrack = function () { const h = _vtRes.apply(this, arguments); const ty = (typeof TR !== 'undefined' && TR.active) ? TR.type : (ui.trType || S.settings.trLast || 'joggen'); if (!['schwimmen', 'freiwasser'].includes(ty) || (typeof TR !== 'undefined' && TR.active)) return h;
  const card = note('sky', '<b>' + $t('Schwimmen zeichnest du mit der Uhr auf.') + '</b> ' + $t('Das Handy kommt nicht mit ins Wasser, und Pulsgurte senden unter Wasser kein Bluetooth. Starte das Training auf deiner Uhr. Nach dem Synchronisieren erscheint es hier automatisch mit Distanz, Dauer und Puls.'), '<button class="btn sm brand" data-act="trManual" type="button">' + $t('Selbst eintragen') + '</button>');
  return h.replace(/<button class="btn brand block[^"]*" data-act="trStart"[\s\S]*?<\/button>/, card); }; }
document.addEventListener('click', e => { const b = e.target.closest('[data-act=trManual]'); if (!b) return; const a = newActivity(ui.trType || S.settings.trLast || 'schwimmen'); save(); location.hash = '#frei/' + a.id; });
if (route.name === 'frei' || route.name === 'training' || route.name === 'heute') render();
