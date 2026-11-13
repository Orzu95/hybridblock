/* Hybridblock – Körperfett mit Fehlerbereich (ALG-124) und Energieverfügbarkeit (FAT-127, FAT-128)
   EA = (Kalorien − Trainingsverbrauch) / fettfreie Masse. Ohne Körperfettwert keine EA-Berechnung.
   Standardmodus: Das Kalorienziel fällt nicht unter die Mindest-EA (Frauen 30, Männer 25 kcal/kg FFM). */
'use strict';
const BF_METH = { bia: ['Körperfettwaage', 4], navy: ['Umfänge (Navy-Formel)', 4], caliper: ['Hautfaltenzange', 3.5], dxa: ['DXA-Messung', 1.5], est: ['Schätzung', 5] };
function bfLast() { const L = (S.settings.bfLog || []).slice().sort((a, b) => a.d < b.d ? -1 : 1); return L.length ? L[L.length - 1] : null; }
function curWeight() { const ser = series(); const l = ser[ser.length - 1]; return l ? l.trend : num(S.settings.startWeight); }
function ffmKg() { const b = bfLast(), w = curWeight(); if (!b || !w) return null; return w * (1 - b.v / 100); }
const eaMin = () => RV(S.settings.sex === 'w' ? 'ea_min_w' : 'ea_min_m');
/* Trainingsverbrauch eines Tages (netto, über dem Ruheumsatz) */
function exKcal(d) { const kg = curWeight() || 75; let sum = 0, kraftAct = false;
  S.activities.filter(a => a.date === d && !a.coachFor).forEach(a => { const T = ACT_MAP[a.type] || {}; if (T.g === 'kraft' || a.type === 'kraft') kraftAct = true; const k = num(a.kcal); sum += k != null && k > 0 ? k * 0.85 : (num(a.dur) || 0) / 60 * kg * (T.cardio ? 6 : 4); });
  if (!kraftAct) for (let w = 1; w <= NW(); w++) for (const k of GYM()) { const s = peekSess(w, k); if (s && s.date === d && Object.keys(s.logs || {}).length) sum += s.watch && num(s.watch.kcal) ? num(s.watch.kcal) * 0.85 : (num(s.watch && s.watch.dur) || 60) / 60 * kg * 4; }
  return Math.round(sum); }
function exAvg7() { let s = 0; for (let i = 1; i <= 7; i++) s += exKcal(addDays(today(), -i)); return Math.round(s / 7); }
/* EA aus dem Gegessenen der letzten 7 Tage (nur vollständige Tage) */
function eaEaten() { const ffm = ffmKg(); if (!ffm) return null; const v = []; for (let i = 1; i <= 7; i++) { const d = addDays(today(), -i), k = intakeFor(d); if (k != null) v.push((k - exKcal(d)) / ffm); } if (v.length < 3) return null; return { v: v.reduce((a, b) => a + b, 0) / v.length, n: v.length }; }
function eaFloorKcal() { const ffm = ffmKg(); if (!ffm || S.settings.eaGuard === false) return null; return Math.round(eaMin() * ffm + exAvg7()); }
const eaLvl = v => v >= 30 ? 'green' : v >= (S.settings.sex === 'w' ? 30 : 20) ? 'amber' : 'red';

hbFilter('currentTargets', 'energy', function (__v) { const t = __v; const fl = eaFloorKcal(); if (fl == null || !t || t.kcal >= fl) return t;
  return Object.assign({}, t, { kcal: fl, c: Math.max(0, Math.round((fl - 4 * (t.p || 0) - 9 * (t.f || 0)) / 4)), eaRaised: fl - t.kcal }); });

function energyCard() { const b = bfLast(), ffm = ffmKg(), w = curWeight();
  const head = '<div class="row" style="flex-wrap:nowrap"><h2 class="grow" style="margin:0">' + $t('Körperfett und Energie') + '</h2><button class="btn sm" data-act="bfSheet" type="button">' + (b ? $t('Neuer Wert') : $t('Eintragen')) + '</button></div>';
  if (!b) return '<div class="card">' + head + '<p class="small muted" style="margin-top:8px">' + $t('Mit deinem Körperfettanteil berechnet die App deine fettfreie Masse und prüft, ob nach dem Training genug Energie übrig bleibt.') + '</p></div>';
  const err = (BF_METH[b.m] || BF_METH.est)[1], lo = Math.max(3, b.v - err), hi = b.v + err;
  const tg = currentTargets(), ex = exAvg7(), eaT = ffm ? (tg.kcal - ex) / ffm : null, eaE = eaEaten();
  const stat = (k, v, s, lvl) => '<div class="stat" style="background:var(--paper)"><div class="k">' + k + '</div><div class="v' + (lvl ? ' t-' + (lvl === 'green' ? 'green' : lvl === 'amber' ? 'amber' : 'red') : '') + '" style="font-size:22px">' + v + '</div><div class="s">' + s + '</div></div>';
  const low = (eaE && eaE.v < eaMin()) || (eaT != null && eaT < eaMin());
  return '<div class="card">' + head + '<div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:12px">' +
    stat($t('Körperfett'), fmt(lo, 0) + '–' + fmt(hi, 0) + ' %', esc($t((BF_METH[b.m] || BF_METH.est)[0])) + ' · ' + fmtDay(b.d)) +
    stat($t('Fettfreie Masse'), ffm ? fmt(ffm, 1) + ' kg' : '–', $tf('bei {w} kg Trendgewicht', { w: fmt(w, 1) })) +
    stat($t('Energie mit deinem Ziel'), eaT != null ? fmt(eaT, 0) : '–', $t('kcal pro kg fettfreie Masse'), eaT != null ? eaLvl(eaT) : '') +
    stat($t('Energie gegessen, 7 Tage'), eaE ? fmt(eaE.v, 0) : '–', eaE ? $tf('aus {n} vollständigen Tagen', { n: eaE.n }) : $t('braucht 3 vollständige Tage'), eaE ? eaLvl(eaE.v) : '') + '</div>' +
    '<p class="small muted" style="margin-top:10px">' + $tf('Ø Trainingsverbrauch {k} kcal pro Tag (Schätzung). Empfohlen sind mindestens {m} kcal pro kg fettfreie Masse.', { k: ex, m: eaMin() }) + ' ' + ruleBtn([S.settings.sex === 'w' ? 'ea_min_w' : 'ea_min_m', 'bf_err']) + '</p>' +
    (tg.eaRaised ? note('amber', $tf('Dein Kalorienziel ist um {k} kcal angehoben, damit nach dem Training genug Energie bleibt. Der Zuschlag kommt aus Kohlenhydraten.', { k: tg.eaRaised })) : low ? note('amber', $t('Nach dem Training bleibt wenig Energie. Das kann Hormone, Erholung und Leistung bremsen. Iss an Trainingstagen mehr oder plane langsamer ab.')) : '') +
    '<label class="row" style="gap:10px;margin-top:10px"><input type="checkbox" data-act="eaGuard"' + (S.settings.eaGuard === false ? '' : ' checked') + '> <span class="small">' + $t('Kalorienziel nie unter die Mindest-Energie fallen lassen') + '</span></label></div>'; }
function bfSheet() { const b = bfLast() || {}; openSheet(sheetHead($t('Körperfett eintragen')) + '<div class="on-white" style="margin-top:12px"><div class="fields"><div class="field"><label for="bf-v">' + $t('Körperfett (%)') + '</label><input id="bf-v" type="number" inputmode="decimal" step="0.1" min="3" max="60" value="' + esc(b.v || '') + '"></div>' +
  '<div class="field"><label for="bf-m">' + $t('Gemessen mit') + '</label><select id="bf-m">' + Object.keys(BF_METH).map(k => '<option value="' + k + '"' + ((b.m || 'bia') === k ? ' selected' : '') + '>' + esc($t(BF_METH[k][0])) + ' (±' + fmt(BF_METH[k][1], 1) + ' %)</option>').join('') + '</select></div>' +
  '<div class="field"><label for="bf-d">' + $t('Datum') + '</label><input id="bf-d" type="date" value="' + today() + '"></div></div></div>' +
  '<p class="small muted">' + $t('Waagen und Umfang-Formeln liegen oft einige Prozentpunkte daneben. Die App zeigt deshalb eine Spanne und achtet beim Fortschritt vor allem auf Bauchumfang und Gewichtstrend.') + '</p>' +
  '<div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="bfSave" type="button">' + $t('Speichern') + '</button></div>'); }
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'bfSheet') bfSheet();
  else if (a === 'bfSave') { const v = num($('#bf-v').value); if (v == null || v < 3 || v > 60) { toast($t('Bitte einen Wert zwischen 3 und 60 % eintragen.')); return; } const d = $('#bf-d').value || today();
    S.settings.bfLog = (S.settings.bfLog || []).filter(x => x.d !== d).concat({ d, v, m: $('#bf-m').value }); save(); closeSheet(); render(); }
  else if (a === 'eaGuard') { S.settings.eaGuard = b.checked; save(); render(); } });
hbFilter('viewProgress', 'energy', function (__v) { const h = __v; const m = '<div class="stack">'; const i = h.indexOf(m); if (i < 0) return h + energyCard(); const j = h.indexOf('<div class="card', h.indexOf('<div class="stats">', i)); return j < 0 ? h.replace(m, m + energyCard()) : h.slice(0, j) + energyCard() + h.slice(j); });
