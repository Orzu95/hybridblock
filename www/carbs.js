/* Hybridblock – Kohlenhydrate nach Tagesbelastung („Fuel for the work required“, CARB-101 ff.)
   Jeder Tag bekommt aus dem Plan eine Belastungsstufe (Ruhetag, leicht, moderat, hoch, sehr hoch).
   Kalorien schwanken um den Wochenmittelwert (Ruhetag −15 %, hoch +15 %, …) und werden so normiert, dass der Wochenschnitt gleich bleibt.
   Eiweiß bleibt jeden Tag gleich; Kohlenhydrate folgen der Stufe (g/kg je Profil), Fett füllt den Rest. Untergrenze: max(130 g, 2 g/kg). Opt-in. */
'use strict';
const CB_LV = ['rest', 'light', 'mod', 'high', 'vhigh'];
const CB_NAME = () => ({ rest: $t('Ruhetag'), light: $t('Leichter Tag'), mod: $t('Moderater Tag'), high: $t('Harter Tag'), vhigh: $t('Sehr harter Tag') });
const CB_GKG = { std: [3, 4, 6, 8, 10], str: [2.5, 3.5, 5, 6.2, 7.5], hyb: [3, 4.2, 6, 8, 10], def: [2.3, 3, 4.2, 5.5, 7] };
const CB_KCAL = [-0.15, -0.06, 0.01, 0.15, 0.21];
const CB_C = { k: null, r: null };
const cbOn = () => !!(S.settings && S.settings.carbCycle);
function cbKg() { const ser = series(); return ser.length ? ser[ser.length - 1].trend : num(S.settings.startWeight) || null; }
function cbProfile() { if (num(S.settings.goalRate) > 0 && !(S.plan && S.plan.maint)) return 'def'; const ks = (S.plan && S.plan.sessions || []).map(s => s.kind); const g = ks.includes('gym'), c = ks.some(k => k !== 'gym'); return g && c ? 'hyb' : g ? 'str' : 'std'; }
/* Einheiten an einem Datum: geplant (Wochenplan) oder erledigt, plus freie Aktivitäten */
function cbUnits(d) { const out = []; const seen = new Set();
  Object.keys(S.sessions || {}).forEach(key => { const s = S.sessions[key]; const m = key.match(RE_SESS); if (!m || !s || s.skipped || s.date !== d) return; seen.add(m[2] + '@' + d); out.push({ w: +m[1], k: m[2] }); });
  try { const w = curWeek(); wkPlan(w).items.forEach(o => { if (o.date === d && o.st !== 'skipped' && o.st !== 'merged' && !seen.has(o.k + '@' + d)) out.push({ w, k: o.k }); }); }
  catch (e) { const dow = new Date(d + 'T12:00').getDay(); ORDER.forEach(k => { if (+S.settings.dayMap[k] === dow) out.push({ w: curWeek(), k }); }); }
  return out; }
function cbScore(u) { /* Punkte: leicht 1, moderat 2, hoch 3; Minuten für „sehr hoch“ */
  if (isGym(u.k)) { const pl = planFor(u.w, u.k); const sets = pl.reduce((a, x) => a + (x.om ? 0 : x.sets || 0), 0); const min = typeof zEst === 'function' ? zEst(pl) : sets * 2.5; return { p: sets > 20 ? 3 : sets >= 10 ? 2 : 1, min }; }
  const sp = cardioSpec(u.w, u.k); const hard = sp.mode === 'int' || sp.mode === 'test' || isHiit(u.k); const min = num(sp.min) || (sp.reps ? sp.reps * ((num(sp.dur) || 0) + (num(sp.rest) || 0)) + (sp.warm || 10) + (sp.cool || 5) : 40);
  return { p: hard ? (min > 60 ? 3 : 2) : (min > 90 ? 3 : min > 45 ? 2 : 1), min }; }
function cbLevel(d) { const sc = cbUnits(d).map(cbScore); (S.activities || []).filter(a => a.date === d).forEach(a => { const at = ACT_MAP[a.type]; const min = num(a.dur) || 0; if (!at || min < 15) return; sc.push({ p: min > 90 ? 3 : min > 45 ? 2 : 1, min }); });
  if (!sc.length) return 0; const min = sc.reduce((a, x) => a + x.min, 0); if (min >= 240) return 4; const mx = Math.max(...sc.map(x => x.p)); const sum = sc.reduce((a, x) => a + x.p, 0);
  return sc.length >= 2 && sum >= 3 ? Math.max(3, mx) : mx; }
function cbWeekDays(d) { const dt = new Date(d + 'T12:00'); const off = (dt.getDay() + 6) % 7; const mon = addDays(d, -off); return Array.from({ length: 7 }, (_, i) => addDays(mon, i)); }
/* Tageskalorien der Woche: Undulation um den Wochenschnitt; greifen Untergrenzen (Kohlenhydrate, Fett), wird der Überschuss
   an den anderen Tagen wieder abgezogen, damit der Wochenschnitt wirklich gleich bleibt (Prüfbericht 12.11.). */
function cbKcalWeek(days, lv, base, kg) { const f = lv.map(l => 1 + CB_KCAL[l]); const mean = f.reduce((a, b) => a + b, 0) / 7; const p = base.p, fatMin = Math.round(0.6 * kg), floorC = Math.round(Math.max(130, 2 * kg));
  const floorK = 4 * p + 4 * floorC + 9 * fatMin; let k = f.map(x => Math.max(floorK, base.kcal * x / mean)); let ex = k.reduce((a, b) => a + b, 0) - 7 * base.kcal;
  for (let it = 0; it < 5 && ex > 1; it++) { const slack = k.map(x => Math.max(0, x - floorK)); const tot = slack.reduce((a, b) => a + b, 0); if (tot <= 0) break; const cut = Math.min(ex, tot); k = k.map((x, i) => x - cut * slack[i] / tot); ex -= cut; }
  return { k: k.map(Math.round), floorK, fatMin, floorC }; }
function cbDay(d, base) { const days = cbWeekDays(d); const lv = days.map(cbLevel); const i = days.indexOf(d); const L = lv[i];
  const prevHigh = i > 0 ? lv[i - 1] >= 3 : cbLevel(addDays(d, -1)) >= 3; const kg = cbKg(); const prof = cbProfile(); if (!kg) return null;
  const W = cbKcalWeek(days, lv, base, kg); let kcal = W.k[i]; const p = base.p;
  const gkg = CB_GKG[prof][L] + (L === 0 && prevHigh ? 0.75 : 0); let c = Math.round(gkg * kg);
  const room = Math.floor((kcal - 4 * p - 9 * W.fatMin) / 4); if (c > room) c = room; if (c < W.floorC) c = W.floorC;
  let fat = Math.round((kcal - 4 * p - 4 * c) / 9); if (fat < W.fatMin) { fat = W.fatMin; kcal = 4 * p + 4 * c + 9 * fat; }
  const weekMean = Math.round(W.k.reduce((a, b) => a + b, 0) / 7);
  return { lv: L, name: CB_LV[L], kcal, p, c, f: fat, gkg: Math.round(c / kg * 10) / 10, prevHigh, prof, units: cbUnits(d), weekMean }; }
let CB_RAW = 0;
hbFilter('currentTargets', 'carbs', function (__v) { const t = __v; if (CB_RAW || !cbOn() || !t || t.pause || S.settings.trackMode === 'p') return t;
  const d = (typeof route !== 'undefined' && route.name === 'essen' && ui.day) || today(); try { const ck = d + '|' + t.kcal + '|' + t.p + '|' + (S.meta.modAt || 0); const r = CB_C.k === ck ? CB_C.r : (CB_C.k = ck, CB_C.r = cbDay(d, t)); if (!r) return t; return Object.assign({}, t, { kcal: r.kcal, p: r.p, c: r.c, f: r.f, cb: r, kcalWeek: t.kcal }); } catch (e) { console.warn('carbs', e); return t; } });
function cbCard() { const t = currentTargets(); const r = t.cb;
  if (!r) return '<div class="card" id="cbcard"><div class="row" style="align-items:center;gap:10px"><div class="grow"><b>' + $t('Kohlenhydrate nach Training') + '</b><div class="small muted">' + $t('Mehr Kohlenhydrate an harten Tagen, weniger an Ruhetagen. Die Wochenkalorien bleiben gleich.') + '</div></div><button class="btn sm" data-act="cbOn" type="button">' + $t('Einschalten') + '</button></div></div>';
  const tip = r.lv >= 2 ? '<p class="small" style="margin:8px 0 0">' + $t('Vor dem Training: 1–4 Stunden vorher eine kohlenhydratreiche Mahlzeit. Einheiten über 60–90 Minuten: 30–60 g Kohlenhydrate pro Stunde. Danach eine Mahlzeit mit Eiweiß und Kohlenhydraten, bei zwei Einheiten am Tag möglichst bald.') + '</p>' : r.prevHigh ? '<p class="small" style="margin:8px 0 0">' + $t('Nach dem harten Tag gestern etwas mehr Kohlenhydrate, damit die Speicher wieder voll werden.') + '</p>' : '';
  return '<div class="card" id="cbcard"><div class="row" style="align-items:baseline"><h2 class="grow" style="margin:0">' + esc(CB_NAME()[r.name]) + '</h2><span class="small muted num">' + fmt(r.gkg, 1) + ' ' + $t('g/kg') + '</span></div>' +
    '<p class="small muted" style="margin:6px 0 0">' + $tf('Heute {c} g Kohlenhydrate, {f} g Fett, {p} g Eiweiß, {k} kcal. Dein Wochenschnitt bleibt bei {w} kcal.', { c: fmt(r.c, 0), f: fmt(r.f, 0), p: fmt(r.p, 0), k: fmt(r.kcal, 0), w: fmt(r.weekMean, 0) }) + '</p>' + tip +
    '<div class="row" style="margin-top:10px"><div class="grow"></div><button class="btn sm" style="background:var(--fog)" data-act="cbOff" type="button">' + $t('Ausschalten') + '</button></div></div>'; }
hbFilter('viewEssen', 'carbs', function (__v) { const h = __v; if (S.settings.trackMode === 'p' || (typeof VIEW !== 'undefined' && VIEW) || (S.meta.pause && S.meta.pause.why !== 'away')) return h;
  const m = h.indexOf('<div class="nr-search">'); const card = cbCard(); return m < 0 ? h + card : h.slice(0, m) + card + h.slice(m); });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'cbOn') { S.settings.carbCycle = true; save(); render(); toast($t('Kohlenhydrate richten sich jetzt nach deinem Training.')); }
  else if (a === 'cbOff') { S.settings.carbCycle = false; save(); render(); toast($t('Wieder gleiche Ziele an allen Tagen.')); } });
/* Wochenbezogene Rechnungen (Check-in, Coach-Übersicht, Energieverfügbarkeit, Wochenanalyse) nutzen den Wochenschnitt, nicht das Tagesziel */
['doCheckin', 'makeSummary', 'energyCard', 'analyzeWeek'].forEach(n => { const f = window[n]; if (typeof f !== 'function') return; window[n] = function () { CB_RAW++; try { return f.apply(this, arguments); } finally { CB_RAW--; } }; });
