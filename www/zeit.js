/* Hybridblock – „Wenig Zeit heute“ (Einheit auf ein Zeitbudget kürzen) und Pausenstatus (krank, verletzt, Urlaub) mit Wiedereinstieg.
   Regeln (Stand 11/2026, wird mit der Gemini-Recherche ZEIT-/PAUSE-101 nachgeschärft):
   - Kürzen: Hauptübungen zuerst (mind. 2 Sätze), dann Schwerpunkt-Muskeln, dann der Rest; Intensität bleibt, nur Sätze fallen weg.
   - Erhalt gelingt schon mit etwa einem Drittel des Volumens bei gleicher Intensität (Spiering et al. 2021).
   - Wiedereinstieg: < 7 Tage normal; 7–13 Tage 2 leichtere Einheiten; 14–27 Tage 4; ab 28 Tagen 6 (ein Satz weniger, RPE −1). */
'use strict';
const Z_BUDGETS = [20, 30, 45, 60];
const zRest = x => num(x.rest) || (x.type === 'main' ? 150 : 90);
function zEst(list, alloc) { const on = list.filter(x => !x.om && (alloc ? alloc.get(x.slot) : x.sets) > 0); if (!on.length) return 0;
  let t = on.some(x => x.type === 'main') ? 6 : 3; on.forEach(x => { const n = alloc ? alloc.get(x.slot) : x.sets; t += 1 + n * (40 + zRest(x)) / 60; }); return t; }
function zCut(list, B, s) { const act = list.filter(x => !x.om && x.sets > 0); const keep = s.keep || {};
  const done = x => { const lg = s.logs && s.logs[x.slot]; return lg ? (lg.sets || []).filter(y => y && y.done).length : 0; };
  const pr = x => keep[x.slot] ? -1 : x.type === 'main' ? 0 : isPrio(x.ex) ? 1 : 2;
  const alloc = new Map(act.map(x => [x.slot, keep[x.slot] ? x.sets : Math.min(x.sets, done(x))]));
  const order = act.slice().sort((a, b) => pr(a) - pr(b) || list.indexOf(a) - list.indexOf(b)); const mx = Math.max(0, ...act.map(x => x.sets));
  for (let r = 1; r <= mx; r++) order.forEach(x => { const tgt = Math.min(x.sets, r === 1 && x.type === 'main' ? 2 : r);
    while (alloc.get(x.slot) < tgt) { alloc.set(x.slot, alloc.get(x.slot) + 1); if (zEst(list, alloc) > B) { alloc.set(x.slot, alloc.get(x.slot) - 1); break; } } });
  return list.map(x => { if (x.om || !(x.sets > 0)) return x; const n = alloc.get(x.slot); if (n === x.sets) return x;
    return n ? Object.assign({}, x, { sets: n, zFrom: x.sets }) : Object.assign({}, x, { om: 'time', sets: 0 }); }); }
/* Reihenfolge: zuerst alle anderen Anpassungen (Kurzversion, Auslassen, leichter), danach Zeitbudget und Wiedereinstieg */
const _sessAdjZ = sessAdjust;
sessAdjust = function (w, k, list) { list = _sessAdjZ(w, k, list); const s = peekSess(w, k); const R = reState();
  if (R && !(s && s.done)) list = list.map(x => x.sets && !x.om ? Object.assign({}, x, { sets: Math.max(1, Math.round(x.sets * R.sf)), rpe: x.rpe != null ? Math.max(5, x.rpe - R.ra) : x.rpe }) : x);
  if (s && s.budget) list = zCut(list, s.budget, s); return list; };

/* Zeitbudget-Karte in der Einheit */
function zCard(w, k) { const s = peekSess(w, k) || {}; if (s.skipped || sessProgress(w, k).done) return '';
  const full = zEst(_sessAdjZ(w, k, planForP(S.plan, w, k))), now = zEst(planFor(w, k)); const b = s.budget;
  const chips = Z_BUDGETS.filter(m => m < full - 4).map(m => '<button class="wkch' + (b === m ? ' on' : '') + '" data-act="zBud" data-w="' + w + '" data-k="' + k + '" data-v="' + m + '" type="button">' + $tf('{m} min', { m }) + '</button>').join('');
  if (!chips && !b) return '';
  return '<div class="card" id="zcard"><div class="row" style="align-items:baseline"><h2 class="grow" style="margin:0">' + $t('Wenig Zeit heute?') + '</h2><span class="small muted num">' + $tf('ca. {m} min', { m: fmt(now, 0) }) + '</span></div>' +
    '<p class="small muted" style="margin:6px 0 10px">' + (b ? $tf('Auf {m} Minuten gekürzt: Hauptübungen bleiben, Gewicht und RIR bleiben gleich, nur Sätze fallen weg.', { m: b }) : $t('Wähle deine Zeit. Die App behält zuerst die Hauptübungen und deine Schwerpunkte und streicht hinten Sätze.')) + '</p>' +
    '<div class="wkchs">' + chips + (b ? '<button class="wkch" data-act="zBud" data-w="' + w + '" data-k="' + k + '" data-v="0" type="button">' + $t('Volle Einheit') + '</button>' : '') + '</div></div>'; }
function reNote(w, k) { const R = reState(); const s = peekSess(w, k); if (!R || (s && s.done)) return '';
  const head = '<b>' + $tf('Wiedereinstieg, Woche {a} von {b}', { a: Math.min(Math.ceil(R.wk), Math.floor(R.t / 7) + 1), b: Math.ceil(R.wk) }) + '</b> ';
  if (!isGym(k)) return note('sky', head + $tf('Laufumfang etwa {p} % deiner Wochen-km von vorher. {c}', { p: R.run, c: R.cap }));
  return note('sky', head + $tf('Starte mit etwa {l} % deiner Gewichte von vor der Pause. Die App hat die Sätze auf etwa {s} % gekürzt und hält {r} RIR mehr Abstand zum Versagen. Das steigert sich jede Woche bis zum normalen Plan.', { l: R.lp, s: Math.round(R.sf * 100), r: R.ra }) + (R.why === 'injury' ? ' ' + $t('Gilt vor allem für den betroffenen Bereich. Schmerz-Ampel beachten: 0–3 von 10 ist in Ordnung, 4–5 Steigerung anhalten, ab 6 abbrechen.') : '')); }
const _viewSessionZ = viewSession;
viewSession = function (key) { const h = _viewSessionZ.apply(this, arguments); const m = key && key.match(RE_SESS); if (!m) return h; const w = +m[1], k = m[2]; if (VIEW) return h;
  const i = h.indexOf('<div class="stack">'); if (!isGym(k)) return i < 0 ? h : h.slice(0, i + 19) + reNote(w, k) + h.slice(i + 19); return i < 0 ? h : h.slice(0, i + 19) + reNote(w, k) + zCard(w, k) + h.slice(i + 19); };
/* ---------- Pausenstatus (Master-Tabelle aus der Recherche „Pausen- und Wiedereinstiegslogik“, PAUSE-101 ff.) ----------
   l = Start-Last in % vom Stand vor der Pause, s = Anteil der Sätze, r = RIR mehr, run = Laufumfang in % der Wochen-km, wk = Wochen bis 100 %, doc = Freigabe nötig */
const RE_TAB = {
  away: [[3, { l: 100, s: 1, r: 0, run: 95, wk: 0 }], [7, { l: 92, s: .78, r: 1, run: 85, wk: 1 }], [14, { l: 88, s: .65, r: 1, run: 75, wk: 1.5 }], [28, { l: 78, s: .55, r: 1, run: 58, wk: 2.5 }], [1e9, { l: 65, s: .45, r: 2, run: 42, wk: 4 }]],
  mild: [[7, { l: 88, s: .55, r: 2, run: 65, wk: 1.5 }], [14, { l: 75, s: .5, r: 2, run: 45, wk: 2.5 }], [28, { l: 65, s: .45, r: 3, run: 35, wk: 3.5, doc: 1 }], [1e9, { l: 48, s: .35, r: 3, run: 25, wk: 8, doc: 1 }]],
  fever: [[14, { l: 75, s: .5, r: 2, run: 45, wk: 2.5 }], [28, { l: 65, s: .45, r: 3, run: 35, wk: 3.5, doc: 1 }], [1e9, { l: 48, s: .35, r: 3, run: 25, wk: 8, doc: 1 }]],
  light: [[7, { l: 75, s: .5, r: 2, run: 55, wk: 2 }], [14, { l: 70, s: .5, r: 2, run: 45, wk: 3 }], [28, { l: 55, s: .45, r: 2, run: 30, wk: 5, doc: 1 }], [1e9, { l: 48, s: .35, r: 3, run: 25, wk: 8, doc: 1 }]],
  struct: [[28, { l: 55, s: .45, r: 2, run: 30, wk: 5, doc: 1 }], [1e9, { l: 48, s: .35, r: 3, run: 25, wk: 8, doc: 1 }]] };
const RE_CAP = () => ({ away: $t('Intensität: zuerst nur locker (Zone 1–2), Intervalle erst ab Woche 2.'), mild: $t('Intensität: nur locker (Zone 1–2, unter etwa 75 % HFmax), 15–30 Minuten.'), fever: $t('Intensität: nur locker (unter 70 % HFmax), 15–30 Minuten, nach jeder Stufe 24 Stunden beobachten.'), light: $t('Nur flach und locker laufen, keine Sprints, solange es nicht mehr weh tut als 3 von 10.'), struct: $t('Lockeres Laufen nur, wenn der Schmerz am nächsten Morgen nicht steigt.') });
function reLookup(key, d) { const t = RE_TAB[key] || RE_TAB.away; return (t.find(r => d <= r[0]) || t[t.length - 1])[1]; }
function reState() { const re = S.meta.reentry; if (!re || !re.from || !(re.wk > 0)) return null; const t = daysBetween(re.from, today()); const p = Math.min(1, Math.max(0, t / (re.wk * 7)));
  if (p >= 1) { delete S.meta.reentry; return null; }
  return { t, p, wk: re.wk, why: re.why, sf: re.s + (1 - re.s) * p, ra: Math.round(re.r * (1 - p)), lp: Math.round(re.l + (100 - re.l) * p), run: Math.round(re.run + (100 - re.run) * p), cap: RE_CAP()[re.key] || '' }; }
const P_WHY = () => ({ sick: $t('Krank'), injury: $t('Verletzt'), away: $t('Urlaub oder Pause') });
const P_TIP = () => ({
  sick: $t('Nur Symptome oberhalb des Halses (Schnupfen, Halskratzen): lockere Bewegung ist möglich. Fieber, Gliederschmerzen, Husten oder Durchfall: kein Training, bis du 24 Stunden fieberfrei bist. Nach Fieber mit Herzrasen, Brustschmerz oder Atemnot vor dem Training ärztlich abklären lassen.'),
  injury: $t('Trainiere, was nicht weh tut: andere Körperteile, Ausdauer ohne die betroffene Stelle. Wer die gesunde Seite trainiert, verliert auf der verletzten Seite weniger Kraft. Schmerz-Ampel: 0–3 von 10 ist in Ordnung, 4–5 nur, wenn es am nächsten Morgen nicht schlimmer ist, ab 6 abbrechen.'),
  away: $t('Zum Erhalten reichen 2 kurze Einheiten pro Woche, solange sie fordernd sind. Kraft: Bulgarian Split Squats, einbeinige Glute Bridges, Liegestütze und Rudern am Tisch oder mit Handtuch, je 2 Sätze bis kurz vors Versagen, langsam ablassen (ca. 18 min). Ausdauer: 5 min einlaufen, dann 12–15 min zügig oder 4 × 2 min schnell mit 1 min Gehpause.') });
const P_FLAGS = () => [$t('Brustschmerz, Druck oder Enge in der Brust'), $t('Ungewöhnliche Atemnot'), $t('Herzrasen, Herzstolpern oder über Tage deutlich erhöhter Ruhepuls'), $t('Schwindel oder Ohnmacht bei Belastung'), $t('Fieber ab 38 °C, starke Gliederschmerzen oder geschwollene Lymphknoten'), $t('Husten seit mindestens 3 Tagen oder starke Erschöpfung nach kleiner Belastung'), $t('Gelenk blockiert, knickt weg oder ist geschwollen'), $t('Schmerz ab 6 von 10, oder Schmerz, der am nächsten Morgen oder von Woche zu Woche zunimmt')];
const flagsBox = () => '<details style="margin-top:10px"><summary class="small" style="font-weight:700">' + $t('Warnzeichen: dann erst ärztlich abklären') + '</summary><ul class="small" style="margin:8px 0 0;padding-left:18px">' + P_FLAGS().map(f => '<li>' + esc(f) + '</li>').join('') + '</ul></details>';
const pauseOn = () => !!(S.meta.pause && S.meta.pause.from);
function pauseStart(why) { S.meta.pause = { why, from: today() }; delete S.meta.reentry; save(); }
function pauseEnd(sev) { const p = S.meta.pause; if (!p) return; const d = Math.max(1, daysBetween(p.from, today())); delete S.meta.pause;
  const key = p.why === 'away' ? 'away' : sev || (p.why === 'sick' ? 'mild' : 'light'); const r = reLookup(key, d);
  if (r.wk > 0) S.meta.reentry = Object.assign({ from: today(), days: d, why: p.why, key }, r); else delete S.meta.reentry; save(); return Object.assign({ d }, r); }
function gateText(why, sev, d) { const r = reLookup(why === 'away' ? 'away' : sev, d); const g = [];
  if (why === 'sick') g.push(sev === 'fever' ? $t('Mindestens 3–7 Tage ohne Symptome und Ruhepuls wieder im normalen Bereich.') : $t('Mindestens 3 Tage ohne Symptome.'));
  if (why === 'injury') g.push($t('Im Alltag schmerzfrei, bei Belastung höchstens 3 von 10.'));
  if (r.doc) g.push(why === 'injury' ? $t('Nach so langer Pause: Freigabe durch Arzt oder Physiotherapie.') : $t('Nach so langer oder schwerer Krankheit: ärztliche Freigabe.'));
  return g; }
function pauseEndSheet(sev) { const p = S.meta.pause; if (!p) return; const d = Math.max(1, daysBetween(p.from, today())); const opts = p.why === 'sick' ? [['mild', $t('Leicht, ohne Fieber')], ['fever', $t('Mit Fieber oder Grippe-Gefühl')]] : p.why === 'injury' ? [['light', $t('Leicht, Überlastung')], ['struct', $t('Schwerer, ruhiggestellt oder operiert')]] : [];
  if (opts.length && !sev) { openSheet(sheetHead($t('Wie war es?')) + '<div class="menu" style="margin-top:8px">' + opts.map(o => '<button class="act-pick" data-act="pauseSev" data-v="' + o[0] + '" type="button"><span class="grow">' + esc(o[1]) + '</span></button>').join('') + '</div>'); return; }
  const g = gateText(p.why, sev, d); const r = reLookup(p.why === 'away' ? 'away' : sev, d);
  openSheet(sheetHead($t('Willkommen zurück')) + (g.length ? '<p class="small" style="margin-top:8px"><b>' + $t('Bevor es losgeht:') + '</b></p><ul class="small" style="margin:4px 0;padding-left:18px">' + g.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
    '<p class="small" style="margin-top:8px">' + (r.wk > 0 ? $tf('Plan für den Wiedereinstieg: Start mit etwa {l} % der Gewichte und {s} % der Sätze, Laufen mit etwa {run} % der Kilometer. In etwa {w} Wochen bist du wieder beim vollen Plan.', { l: r.l, s: Math.round(r.s * 100), run: r.run, w: r.wk }) : $t('Nach so einer kurzen Pause geht es direkt normal weiter.')) + '</p>' + (p.why !== 'away' ? flagsBox() : '') +
    '<div class="row" style="margin-top:14px;gap:8px;flex-wrap:wrap"><button class="btn brand" data-act="pauseEndGo" data-v="' + (sev || '') + '" type="button">' + (g.length ? $t('Passt, los geht’s') : $t('Los geht’s')) + '</button><button class="btn" data-act="closeSheet" type="button">' + $t('Noch nicht') + '</button></div>'); }
function pauseSheet() { openSheet(sheetHead($t('Pause eintragen')) + '<p class="small muted" style="margin-top:6px">' + $t('Für mehrere Tage ohne Training. Die App blendet das Training auf „Heute“ aus, hält dein Kalorienziel bei Krankheit oder Verletzung auf Erhaltung und plant danach einen sanften Wiedereinstieg.') + '</p>' +
  '<div class="menu">' + Object.entries(P_WHY()).map(([k, v]) => '<button class="act-pick" data-act="pauseGo" data-v="' + k + '" type="button"><span class="grow">' + esc(v) + '</span></button>').join('') + '</div>'); }
function pauseCard() { const p = S.meta.pause; const d = daysBetween(p.from, today());
  const food = p.why === 'injury' ? $t('Dein Kalorienziel steht während der Pause auf Erhaltung. Eiweiß ist auf mindestens 2 g pro kg Körpergewicht angehoben, verteilt auf 4–5 Mahlzeiten. Das bremst den Muskelabbau.') : p.why === 'sick' ? $t('Dein Kalorienziel steht während der Pause auf Erhaltung, Eiweiß bleibt hoch. Das hilft beim Gesundwerden und schützt die Muskeln.') : '';
  return '<div class="card" style="box-shadow:inset 4px 0 0 var(--sky)"><div class="row" style="align-items:baseline"><h2 class="grow" style="margin:0">' + esc(P_WHY()[p.why] || '') + '</h2><span class="small muted">' + $tf('seit {d}', { d: fmtDay(p.from) }) + (d ? ' · ' + $tf('{n} Tage', { n: d }) : '') + '</span></div>' +
    '<p class="small" style="margin:8px 0 12px">' + esc(P_TIP()[p.why] || '') + '</p>' + (food ? '<p class="small muted" style="margin:0 0 12px">' + food + '</p>' : '') + (p.why !== 'away' ? flagsBox() : '') +
    '<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn brand" data-act="pauseEnd" type="button">' + $t('Ich bin wieder da') + '</button><button class="btn" data-act="pauseCancel" type="button">' + $t('Aus Versehen eingetragen') + '</button></div>' +
    '<p class="src" style="margin-top:10px">' + $t('Allgemeine Hinweise, keine ärztliche Beratung.') + '</p></div>'; }
const _sessionsOnDowZ = sessionsOnDow; sessionsOnDow = function () { return pauseOn() ? [] : _sessionsOnDowZ.apply(this, arguments); };
hbFilter('currentTargets', 'zeit', function (__v) { let t = __v; const p = S.meta.pause; if (!p || p.why === 'away' || !t) return t; t = Object.assign({}, t, { pause: true });
  if (num(t.tdee) > t.kcal) t.kcal = Math.round(num(t.tdee));
  if (p.why === 'injury') { const ser = series(); const kg = ser.length ? ser[ser.length - 1].trend : num(S.settings.startWeight); if (kg && t.p < 2 * kg) t.p = Math.round(2 * kg); }
  t.c = Math.max(0, Math.round((t.kcal - 4 * t.p - 9 * t.f) / 4)); return t; });
hbFilter('heuteExtras', 'zeit', function (__v) { const h = __v; if (VIEW) return h; if (pauseOn()) return pauseCard() + h;
  return h + '<div class="row" style="justify-content:center;margin:2px 0 6px"><button class="btn sm" style="background:var(--fog)" data-act="pauseOpen" type="button">' + $t('Krank, verletzt oder im Urlaub?') + '</button></div>'; });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'zBud') { const s = sess(+b.dataset.w, b.dataset.k); const v = +b.dataset.v; if (v) s.budget = v; else delete s.budget; save(); render(); toast(v ? $tf('Auf {m} Minuten gekürzt', { m: v }) : $t('Volle Einheit')); }
  else if (a === 'pauseOpen') pauseSheet();
  else if (a === 'pauseGo') { pauseStart(b.dataset.v); closeSheet(); render(); doneOverlay($t('Pause eingetragen'), b.dataset.v === 'away' ? $t('Genieß die freie Zeit.') : $t('Gute Besserung und erhol dich gut.')); }
  else if (a === 'pauseCancel') { delete S.meta.pause; save(); render(); toast($t('Pause entfernt')); }
  else if (a === 'pauseEnd') pauseEndSheet();
  else if (a === 'pauseSev') pauseEndSheet(b.dataset.v);
  else if (a === 'pauseEndGo') { const r = pauseEnd(b.dataset.v || null); closeSheet(); render(); doneOverlay($t('Willkommen zurück'), r && r.wk > 0 ? $tf('Wiedereinstieg über etwa {w} Wochen.', { w: r.wk }) : $t('Es geht normal weiter.')); } });
/* Wiedereinstieg: Gewichte wirklich absenken (nicht nur im Text) und Versagens-Hinweise ausblenden */
hbFilter('planSuggestion', 'zeit', function (__v, w, k, spec, exId) { const r = __v; const R = reState(); const s = peekSess(w, k); if (!R || (s && s.done) || !r || !(num(r.load) > 0) || R.lp >= 100) return r;
  const inc = incFor(exId); const load = Math.max(inc, Math.round(r.load * R.lp / 100 / inc) * inc);
  return Object.assign({}, r, { load, txt: $tf('Wiedereinstieg: {l} kg (etwa {p} % von {o} kg)', { l: fmt(load), p: R.lp, o: fmt(r.load) }), cls: 'hold' }); });
const RE_FAIL = /Versagen|failure|отказ/i;
const _sessAdjRE2 = sessAdjust;
sessAdjust = function (w, k, list) { list = _sessAdjRE2.apply(this, arguments); const R = reState(); const s = peekSess(w, k); if (!R || (s && s.done)) return list;
  return list.map(x => x.note && RE_FAIL.test(x.note) ? Object.assign({}, x, { note: '' }) : x); };
/* Wiedereinstieg im Ausdauertraining: Intervalle und Tests werden zu lockeren Z2-Einheiten, Umfang nach Tabelle (R.run %) */
hbFilter('cardioSpec', 'zeit', function (__v, w, k) { const sp = __v; const R = reState(); const s = peekSess(w, k); if (!R || !sp || (s && s.done)) return sp;
  const tot = sp.mode === 'z2' ? num(sp.min) || 30 : (num(sp.warm) || 10) + (num(sp.reps) || 0) * ((num(sp.dur) || 0) + (num(sp.rest) || 0)) + (num(sp.cool) || 5);
  const min = Math.max(15, Math.round(tot * R.run / 100 / 5) * 5); return Object.assign({}, sp, { mode: 'z2', min, reps: null, dur: null, rest: null, hi: false, re: true, title: $tf('{m} min locker (Wiedereinstieg)', { m: min }) }); });
