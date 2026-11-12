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
sessAdjust = function (w, k, list) { list = _sessAdjZ(w, k, list); const s = peekSess(w, k); const re = S.meta.reentry;
  if (re && re.left > 0 && !(s && s.done) && !(s && s.reDone)) list = list.map(x => x.sets && !x.om ? Object.assign({}, x, { sets: Math.max(1, x.sets - 1), rpe: x.rpe != null ? Math.max(5, x.rpe - 1) : x.rpe }) : x);
  if (s && s.budget) list = zCut(list, s.budget, s); return list; };

/* Zeitbudget-Karte in der Einheit */
function zCard(w, k) { const s = peekSess(w, k) || {}; if (s.skipped || sessProgress(w, k).done) return '';
  const full = zEst(_sessAdjZ(w, k, planForP(S.plan, w, k))), now = zEst(planFor(w, k)); const b = s.budget;
  const chips = Z_BUDGETS.filter(m => m < full - 4).map(m => '<button class="wkch' + (b === m ? ' on' : '') + '" data-act="zBud" data-w="' + w + '" data-k="' + k + '" data-v="' + m + '" type="button">' + m + ' min</button>').join('');
  if (!chips && !b) return '';
  return '<div class="card" id="zcard"><div class="row" style="align-items:baseline"><h2 class="grow" style="margin:0">' + $t('Wenig Zeit heute?') + '</h2><span class="small muted num">' + $tf('ca. {m} min', { m: fmt(b ? now : full, 0) }) + '</span></div>' +
    '<p class="small muted" style="margin:6px 0 10px">' + (b ? $tf('Auf {m} Minuten gekürzt: Hauptübungen bleiben, Gewicht und RIR bleiben gleich, nur Sätze fallen weg.', { m: b }) : $t('Wähle deine Zeit. Die App behält zuerst die Hauptübungen und deine Schwerpunkte und streicht hinten Sätze.')) + '</p>' +
    '<div class="wkchs">' + chips + (b ? '<button class="wkch" data-act="zBud" data-w="' + w + '" data-k="' + k + '" data-v="0" type="button">' + $t('Volle Einheit') + '</button>' : '') + '</div></div>'; }
function reNote(w, k) { const re = S.meta.reentry; const s = peekSess(w, k); if (!re || !(re.left > 0) || (s && (s.done || s.reDone))) return '';
  return note('sky', '<b>' + $t('Wiedereinstieg nach der Pause') + '</b> ' + $tf('Ein Satz weniger pro Übung, RPE eine Stufe niedriger. Starte mit etwa {p} % der Gewichte von vorher. Noch {n} Einheiten.', { p: re.pct, n: re.left })); }
const _viewSessionZ = viewSession;
viewSession = function (key) { const h = _viewSessionZ.apply(this, arguments); const m = key && key.match(RE_SESS); if (!m) return h; const w = +m[1], k = m[2]; if (!isGym(k) || VIEW) return h;
  const i = h.indexOf('<div class="stack">'); return i < 0 ? h : h.slice(0, i + 19) + reNote(w, k) + zCard(w, k) + h.slice(i + 19); };
const _finishSessionZ = finishSession;
finishSession = function (w, k) { const re = S.meta.reentry; const s = peekSess(w, k); if (re && re.left > 0 && isGym(k) && s && !s.reDone) { s.reDone = 1; re.left--; if (re.left <= 0) delete S.meta.reentry; }
  return _finishSessionZ.apply(this, arguments); };

/* ---------- Pausenstatus ---------- */
const P_WHY = () => ({ sick: $t('Krank'), injury: $t('Verletzt'), away: $t('Urlaub oder Pause') });
const P_TIP = () => ({
  sick: $t('Nur Symptome oberhalb des Halses (Schnupfen, Halskratzen): lockere Bewegung ist möglich. Fieber, Gliederschmerzen, Husten oder Durchfall: kein Training, bis du 24 Stunden fieberfrei bist. Nach Fieber mit Herzrasen, Brustschmerz oder Atemnot vor dem Training ärztlich abklären lassen.'),
  injury: $t('Trainiere, was nicht weh tut: andere Körperteile, Ausdauer ohne die betroffene Stelle. Schmerz bis etwa 3 von 10, der am nächsten Tag nicht schlimmer ist, gilt meist als vertretbar. Bei starken, neuen oder anhaltenden Schmerzen, Schwellung, Taubheit oder nach einem Unfall ärztlich abklären lassen.'),
  away: $t('Zum Erhalten reicht wenig: 2 kurze Einheiten pro Woche mit Liegestützen, Kniebeugen, Ausfallschritten und etwas Laufen oder Gehen. Kraft und Muskeln gehen in 2–3 Wochen kaum verloren.') });
const pauseOn = () => !!(S.meta.pause && S.meta.pause.from);
function pauseStart(why) { S.meta.pause = { why, from: today() }; delete S.meta.reentry; save(); }
function pauseEnd() { const p = S.meta.pause; if (!p) return; const d = daysBetween(p.from, today()); delete S.meta.pause;
  const left = d >= 28 ? 6 : d >= 14 ? 4 : d >= 7 ? 2 : 0; const pct = d >= 28 ? 70 : d >= 14 ? 80 : 90;
  if (left) S.meta.reentry = { left, pct, days: d }; save(); return { d, left, pct }; }
function pauseSheet() { openSheet(sheetHead($t('Pause eintragen')) + '<p class="small muted" style="margin-top:6px">' + $t('Für mehrere Tage ohne Training. Die App blendet das Training auf „Heute“ aus, hält dein Kalorienziel bei Krankheit oder Verletzung auf Erhaltung und plant danach einen sanften Wiedereinstieg.') + '</p>' +
  '<div class="menu">' + Object.entries(P_WHY()).map(([k, v]) => '<button class="act-pick" data-act="pauseGo" data-v="' + k + '" type="button"><span class="grow">' + esc(v) + '</span></button>').join('') + '</div>'); }
function pauseCard() { const p = S.meta.pause; const d = daysBetween(p.from, today());
  return '<div class="card" style="box-shadow:inset 4px 0 0 var(--sky)"><div class="row" style="align-items:baseline"><h2 class="grow" style="margin:0">' + esc(P_WHY()[p.why] || '') + '</h2><span class="small muted">' + $tf('seit {d}', { d: fmtDay(p.from) }) + (d ? ' · ' + $tf('{n} Tage', { n: d }) : '') + '</span></div>' +
    '<p class="small" style="margin:8px 0 12px">' + esc(P_TIP()[p.why] || '') + '</p>' + (p.why !== 'away' ? '<p class="small muted" style="margin:0 0 12px">' + $t('Dein Kalorienziel steht während der Pause auf Erhaltung, Eiweiß bleibt hoch. Das hilft beim Gesundwerden und schützt die Muskeln.') + '</p>' : '') +
    '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn brand" data-act="pauseEnd" type="button">' + $t('Ich bin wieder da') + '</button><button class="btn" data-act="pauseCancel" type="button">' + $t('Aus Versehen eingetragen') + '</button></div>' +
    '<p class="src" style="margin-top:10px">' + $t('Allgemeine Hinweise, keine ärztliche Beratung.') + '</p></div>'; }
const _sessionsOnDowZ = sessionsOnDow; sessionsOnDow = function () { return pauseOn() ? [] : _sessionsOnDowZ.apply(this, arguments); };
const _currentTargetsZ = currentTargets;
currentTargets = function () { const t = _currentTargetsZ.apply(this, arguments); const p = S.meta.pause; if (!p || p.why === 'away' || !t || !(num(t.tdee) > t.kcal)) return t;
  const kcal = Math.round(num(t.tdee)); return Object.assign({}, t, { kcal, c: Math.max(0, Math.round((kcal - 4 * t.p - 9 * t.f) / 4)), pause: true }); };
const _heuteExtrasZ = heuteExtras;
heuteExtras = function () { const h = _heuteExtrasZ.apply(this, arguments); if (VIEW) return h; if (pauseOn()) return pauseCard() + h;
  return h + '<div class="row" style="justify-content:center;margin:2px 0 6px"><button class="btn sm" style="background:var(--fog)" data-act="pauseOpen" type="button">' + $t('Krank, verletzt oder im Urlaub?') + '</button></div>'; };
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'zBud') { const s = sess(+b.dataset.w, b.dataset.k); const v = +b.dataset.v; if (v) s.budget = v; else delete s.budget; save(); render(); toast(v ? $tf('Auf {m} Minuten gekürzt', { m: v }) : $t('Volle Einheit')); }
  else if (a === 'pauseOpen') pauseSheet();
  else if (a === 'pauseGo') { pauseStart(b.dataset.v); closeSheet(); render(); doneOverlay($t('Pause eingetragen'), $t('Gute Besserung und erhol dich gut.')); }
  else if (a === 'pauseCancel') { delete S.meta.pause; save(); render(); toast($t('Pause entfernt')); }
  else if (a === 'pauseEnd') { const r = pauseEnd(); render(); doneOverlay($t('Willkommen zurück'), r.left ? $tf('Die nächsten {n} Krafteinheiten sind etwas leichter.', { n: r.left }) : $t('Es geht normal weiter.')); } });
