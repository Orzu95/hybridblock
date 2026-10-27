/* Hybridblock – App-Logik v2 */
'use strict';

/* ======================= STATE ======================= */
const KEY = 'hb_state_v1';
const DEFAULTS = () => ({
  v: 2,
  settings: { hfmax:186, rhrBase:'', puStart:8, goalRate:0.8, tdee0:3200, protein:200, fat:70, floor:2000, startWeight:115, targetWeight:103, startKcal:2400, stepGoal:9000, dayMap: Object.assign({}, DEFAULT_DAYMAP) },
  block: { week:1, startedOn:null },
  sessions:{}, swaps:{}, days:{}, foods:{}, recent:[], checkins:[], body:{}, activities:[], health:{}, healthMeta:{ lastSync:null, source:null, ignored:[] }
});
let S = DEFAULTS();
function loadState(raw) { const d = JSON.parse(raw); const def = DEFAULTS(); const s = Object.assign(DEFAULTS(), d);
  s.settings = Object.assign(def.settings, d.settings || {}); s.settings.dayMap = Object.assign({}, DEFAULT_DAYMAP, (d.settings && d.settings.dayMap) || {});
  s.block = Object.assign({ week:1, startedOn:null }, d.block || {}); s.healthMeta = Object.assign({ lastSync:null, source:null, ignored:[] }, d.healthMeta || {});
  ['activities','recent','checkins'].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });
  ['sessions','swaps','days','foods','body','health'].forEach(k => { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
  if (!d.v || d.v < 2) { delete s.settings.start; s.v = 2; }
  /* alte Slot-Namen aus v1 auf neue Slots mappen, damit der Verlauf bleibt */
  const ren = { calf_st:'calf_a', legext:'legext', calf_se:'calf_c', curl:'bi_b', crunch:'ab_b', hlr:'ab_a', hammer:'bi_c', lat_c:'lat_c' };
  for (const key in s.sessions) { const se = s.sessions[key]; se.check = se.check || {}; se.logs = se.logs || {}; se.swaps = se.swaps || {};
    for (const old in ren) if (se.logs[old] && !se.logs[ren[old]] && old !== ren[old]) { se.logs[ren[old]] = se.logs[old]; delete se.logs[old]; } }
  return s; }
try { const raw = localStorage.getItem(KEY); if (raw) S = loadState(raw); } catch (e) { console.warn(e); }
let saveT;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Speichern fehlgeschlagen. Ist der Speicher voll?'); } }, 250); }
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* ======================= HELPERS ======================= */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const num = v => { if (v === null || v === undefined || v === '') return null; const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
const fmt = (n, d = 1) => n == null || isNaN(n) ? '–' : (Math.round(n * 10 ** d) / 10 ** d).toLocaleString('de-DE');
const r25 = n => Math.round(n / 2.5) * 2.5;
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5);
const today = () => iso(new Date());
const WD = ['So','Mo','Di','Mi','Do','Fr','Sa'];
const WD_LONG = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const MON = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const fmtDay = s => { const d = parseISO(s); return WD[d.getDay()] + ', ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; };
const fmtMin = m => m == null ? '–' : Math.floor(m / 60) + ':' + pad(Math.round(m % 60)) + ' h';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2200); }
function repRange(r) { const m = String(r).match(/(\d+)\s*[–-]\s*(\d+)/); if (m) return { lo: +m[1], hi: +m[2] }; const n = parseInt(r, 10); return isNaN(n) ? null : { lo: n, hi: n }; }
const median = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const ICON = {
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h9M18 7h2M4 17h3M12 17h8"/><circle cx="15.5" cy="7" r="2.5"/><circle cx="9.5" cy="17" r="2.5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  scan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M8 9v6M11 9v6M14 9v6M17 9v6"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>',
  sync:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/></svg>',
  chart:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18l5-6 4 3 7-9"/></svg>',
  back:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>' };

/* ======================= PLAN / WOCHEN ======================= */
const sKey = (w, k) => 'w' + pad(w) + '-' + k;
const SESS = Object.fromEntries(SESSIONS.map(s => [s.k, s]));
function sess(w, k) { const key = sKey(w, k); return S.sessions[key] || (S.sessions[key] = { check: {}, logs: {}, swaps: {} }); }
function peekSess(w, k) { return S.sessions[sKey(w, k)]; }
function actualEx(w, k, spec) { const s = peekSess(w, k); return (s && s.swaps && s.swaps[spec.slot]) || S.swaps[spec.slot] || spec.ex; }
function chronIndex(w, k) { return (w - 1) * 5 + ORDER.indexOf(k); }
const curWeek = () => Math.max(1, Math.min(12, S.block.week || 1));
function markStarted(w, k) { const s = sess(w, k); if (!s.date) s.date = today(); if (!S.block.startedOn) S.block.startedOn = today(); }
const dayLabel = k => { const d = S.settings.dayMap[k]; return d === '' || d == null || d < 0 ? 'freier Tag' : WD_LONG[d]; };
function sessionsOnDow(dow) { return ORDER.filter(k => +S.settings.dayMap[k] === dow && S.settings.dayMap[k] !== ''); }
function countsAsActivity(w, k) { return S.activities.find(a => a.countsAs === k && a.week === w); }
function sessProgress(w, k) { const s = peekSess(w, k);
  if (s && s.skipped) return { done: true, skipped: true, f: 0, t: 0 };
  if (k === 'H' || k === 'Z') { const d = (s && s.cardio && num(s.cardio.dur) != null) || !!countsAsActivity(w, k); return { done: d, f: d ? 1 : 0, t: 1 }; }
  let t = 0, f = 0; planFor(w, k).forEach(p => { t += p.sets; const lg = s && s.logs[p.slot]; if (lg) f += (lg.sets || []).filter(x => x && x.done).length; });
  return { done: t > 0 && f / t >= 0.8, f, t }; }
function weekDone(w) { return ORDER.every(k => sessProgress(w, k).done); }
function lastDate(w) { let d = null; ORDER.forEach(k => { const s = peekSess(w, k); if (s && s.date && (!d || s.date > d)) d = s.date; const a = countsAsActivity(w, k); if (a && (!d || a.date > d)) d = a.date; }); return d; }
/* nächste Woche erst am Tag nach der letzten Einheit, damit „Heute“ am Trainingstag „erledigt“ zeigt */
function maybeAdvance() { const w = curWeek(); if (w >= 12 || !weekDone(w)) return; const ld = lastDate(w); if (ld && ld >= today()) return;
  S.block.week = w + 1; ui.week = null; save(); setTimeout(() => toast('Woche ' + w + ' geschafft. Weiter mit Woche ' + (w + 1) + '.'), 300); }
function scheduleWarnings() { const m = S.settings.dayMap, out = []; const d = k => (m[k] === '' || m[k] == null) ? null : +m[k];
  ['A', 'C'].forEach(g => { if (d('H') != null && d(g) != null && (d('H') + 1) % 7 === d(g)) out.push('HIIT liegt am Tag vor ' + SESS[g].title + '. Die Beine sind dann nicht frisch.'); });
  const by = {}; ORDER.forEach(k => { if (d(k) == null) return; (by[d(k)] = by[d(k)] || []).push(k); });
  Object.values(by).forEach(ks => { if (ks.length > 1) out.push(ks.map(k => SESS[k].title).join(' und ') + ' am selben Tag: mindestens 3–6 h Abstand, Kraft zuerst.'); });
  return out; }

/* ======================= GESUNDHEITSDATEN ======================= */
function hday(d) { return S.health[d] || (S.health[d] = {}); }
function setHealth(d, patch, src) { const h = hday(d); for (const k in patch) if (patch[k] != null && !isNaN(patch[k])) h[k] = patch[k]; h.src = src; }
const rhrOf = d => { const h = S.health[d]; return h ? (h.rhr ?? h.rhrEst ?? null) : null; };
function rhrBaseline() { const vals = []; for (let i = 1; i <= 21 && vals.length < 14; i++) { const v = rhrOf(addDays(today(), -i)); if (v != null) vals.push(v); }
  if (vals.length >= 5) return { v: Math.round(median(vals)), auto: true, n: vals.length };
  const m = num(S.settings.rhrBase); return m != null ? { v: m, auto: false } : null; }
function sleepQuality(min) { if (min == null) return null; return min < 360 ? 'schlecht' : min < 420 ? 'ok' : 'gut'; }

/* ======================= READINESS ======================= */
function lastBack(w, k) { for (let j = chronIndex(w, k) - 1; j >= 0; j--) { const ww = Math.floor(j / 5) + 1, kk = ORDER[j % 5]; if (!'ABC'.includes(kk)) continue; const s = peekSess(ww, kk); const v = s && num(s.check && s.check.back); if (v != null) return v; } return null; }
function readiness(w, k) {
  const s = peekSess(w, k) || { check: {} }, c = s.check || {}, d = s.date || today(), h = S.health[d] || {};
  const back = num(c.back), pb = lastBack(w, k);
  const rhr = num(c.rhr) ?? rhrOf(d), base = rhrBaseline();
  const sleep = c.sleep || sleepQuality(h.sleepMin);
  const backRed = back != null && (back >= 4 || (pb != null && back > pb && back >= 2));
  const backAmber = !backRed && back == null && pb != null && pb >= 4;
  const rhrHigh = rhr != null && base && rhr >= base.v + 5;
  const sleepBad = sleep === 'schlecht';
  const y = addDays(d, -1); const runPrev = (k === 'A' || k === 'C') ? S.activities.find(a => (a.date === y || a.date === d) && ACT_MAP[a.type] && ACT_MAP[a.type].run && (num(a.dur) || 0) >= 20) : null;
  return { backRed, backAmber, rhrHigh, sleepBad, rpeShift: (rhrHigh || sleepBad) ? -1 : 0, back, pb, rhr, base, sleep, sleepMin: h.sleepMin, runPrev, autoRhr: num(c.rhr) == null && rhr != null, autoSleep: !c.sleep && !!sleep }; }

/* ======================= VERLAUF & AUTOREGULATION ======================= */
const e1rm = (w, r, rpe) => w * (1 + (r + (10 - rpe)) / 30);
const loadFor = (est, reps, rpe) => est / (1 + (reps + (10 - rpe)) / 30);
function loggedSets(log) { return ((log && log.sets) || []).map(x => ({ w: num(x && x.w), r: num(x && x.r), rpe: num(x && x.rpe), done: !!(x && x.done) })).filter(x => x.w != null || x.r != null); }
function history(w, k, exId) {
  for (let j = chronIndex(w, k) - 1; j >= 0; j--) {
    const ww = Math.floor(j / 5) + 1, kk = ORDER[j % 5]; const s = peekSess(ww, kk); if (!s || !s.logs) continue;
    const found = [];
    for (const slot in s.logs) { const lg = s.logs[slot]; if (lg.ex !== exId) continue; const sets = loggedSets(lg); if (!sets.length) continue;
      const spec = planFor(ww, kk).find(p => p.slot === slot); found.push({ slot, sets, spec }); }
    if (found.length) return { w: ww, k: kk, items: found };
  }
  return null; }
function lastAny(exId) { for (let w = 12; w >= 1; w--) for (let i = 4; i >= 0; i--) { const h = history(w, ORDER[i], exId); if (h) return h; } return null; }
function bestE1rm(h) { let best = null;
  h.items.forEach(it => it.sets.forEach(s => { if (!s.w || !s.r) return; const rpe = s.rpe ?? (it.spec && it.spec.rpe) ?? 8; const v = e1rm(s.w, s.r, Math.min(10, rpe)); if (!best || v > best) best = v; }));
  return best; }
function incFor(exId) { return /fs|pend|hack|legpress|trap|ht|glute|row|bss|rev_lunge|rdl|hyper|calf|tbar|goblet|stepup/.test(exId) ? 5 : 2.5; }
const isPrio = exId => { const m = LIB[exId] && LIB[exId].muscles; if (!m) return false; return PRIORITY.some(p => m[p] >= 1); };

function planSuggestion(w, k, spec, exId, rd) {
  const tgt = spec.rpe != null ? spec.rpe + (spec.type === 'main' ? rd.rpeShift : 0) : null;
  const h = history(w, k, exId); const rng = repRange(spec.reps);
  if (spec.type === 'power') return { txt: 'Jede Wiederholung maximal schnell. Qualität vor Menge.', cls: 'first' };
  if (spec.type === 'bo') {
    const top = (sess(w, k).logs.bench_top ? loggedSets(sess(w, k).logs.bench_top) : []).find(s => s.w);
    const pct = phase(w) === 'b3' ? .85 : .9;
    if (!top) return { txt: 'Erst das Top-Set loggen, dann ' + Math.round(pct * 100) + ' % davon.', cls: 'first' };
    return { load: r25(top.w * pct), reps: rng && rng.lo, txt: fmt(r25(top.w * pct)) + ' kg, ' + Math.round(pct * 100) + ' % vom Top-Set', cls: '' }; }
  if (!h) return { txt: tgt != null ? 'Erste Einheit: Gewicht für RPE ' + fmt(tgt) + ' wählen, eher vorsichtig.' : 'Erste Einheit.', cls: 'first', reps: rng && rng.lo };
  if (spec.type === 'main') {
    const est = bestE1rm(h); if (!est) return { txt: 'Kein Gewicht im Verlauf. Nach RPE ' + fmt(tgt) + ' wählen.', cls: 'first' };
    const reps = parseInt(spec.reps, 10) || 5; const load = r25(loadFor(est, reps, tgt));
    return { load, reps, est, txt: fmt(load) + ' kg × ' + reps + ' bei RPE ' + fmt(tgt) + (rd.rpeShift ? ' (Readiness −1)' : '') + ' · e1RM ' + fmt(est, 0), cls: '' }; }
  const sets = h.items.flatMap(it => it.sets); const lastSpec = h.items[0].spec || spec;
  if (spec.type === 'bw') {
    const tot = sets.reduce((a, s) => a + (s.r || 0), 0);
    if (spec.slot === 'pu_vol') { const per = sets.map(s => s.r || 0); if (per.length >= 5 && per.every(r => r >= 7)) return { txt: '5×7 geschafft. Ab jetzt 5×5 mit +2,5 kg.', cls: '', reps: 5 };
      return { txt: 'Zuletzt ' + tot + ' Reps gesamt. Heute ' + (tot + 1) + ' anpeilen.', cls: '', reps: rng && rng.lo }; }
    if (spec.reps === 'AMRAP') return { txt: 'Test: so viele saubere Wiederholungen wie möglich.', cls: '' };
    return { txt: 'Zuletzt ' + sets.map(s => s.r ?? '–').join('/') + '. Bewusst leicht halten.', cls: 'hold', reps: rng && rng.lo }; }
  if (spec.type === 'carry') { const top = Math.max(0, ...sets.map(s => s.w || 0)); return top ? { load: top + 2, reps: 30, txt: 'Zuletzt ' + fmt(top) + ' kg. Bei sauberer Haltung +2 kg.', cls: '' } : { txt: 'Gewicht eintragen', cls: 'first' }; }
  const rOld = repRange(lastSpec.reps); const ws = sets.map(s => s.w).filter(x => x != null && x !== 0); const top = ws.length ? Math.max(...ws) : null;
  const rpes = sets.map(s => s.rpe).filter(x => x != null); const lastRpe = rpes.length ? Math.max(...rpes) : null;
  const hitTop = rOld && sets.length && sets.every(s => s.r != null && s.r >= rOld.hi); const inc = incFor(exId);
  if (lastRpe != null && tgt != null && lastRpe > tgt + 0.5 && tgt < 9.5) return { load: top, reps: rng && rng.lo, txt: top != null ? fmt(top) + ' kg halten. Letzte RPE ' + fmt(lastRpe) + ' lag über Ziel.' : 'Halten. RPE lag über Ziel.', cls: 'hold' };
  if (top == null) return { reps: rng && (hitTop ? rng.lo : rng.hi), txt: hitTop ? 'Oberes Rep-Ziel erreicht: Zusatzgewicht oder schwerere Variante.' : 'Ein Rep mehr pro Satz anpeilen.', cls: hitTop ? '' : 'hold' };
  if (hitTop) return { load: top + inc, reps: rng && rng.lo, txt: fmt(top + inc) + ' kg (+' + fmt(inc) + '), zurück auf ' + (rng ? rng.lo : '') + ' Reps', cls: '' };
  const minR = Math.min(...sets.map(s => s.r || 0));
  return { load: top, reps: Math.min(rng ? rng.hi : minR + 1, minR + 1), txt: fmt(top) + ' kg halten, ein Rep mehr pro Satz', cls: 'hold' }; }

function setSuggestion(w, k, spec, exId, i, base, rd, rawSets) {
  const raw = rawSets || (((sess(w, k).logs[spec.slot]) || {}).sets) || [];
  let prev = null; for (let j = i - 1; j >= 0; j--) { const x = raw[j]; if (x && x.done && num(x.r) != null) { prev = { w: num(x.w), r: num(x.r), rpe: num(x.rpe) }; break; } }
  const rng = repRange(spec.reps); const tgt = spec.rpe != null ? spec.rpe + (spec.type === 'main' ? rd.rpeShift : 0) : null;
  if (!prev) return { load: base.load ?? null, reps: base.reps ?? (rng && rng.lo), why: '' };
  if (prev.w == null) return { load: null, reps: prev.r, why: '' };
  if (spec.type === 'main' && prev.rpe != null) {
    const reps = parseInt(spec.reps, 10) || prev.r; const load = r25(loadFor(e1rm(prev.w, prev.r, prev.rpe), reps, tgt));
    return { load, reps, why: load > prev.w ? 'Letzter Satz leichter als Ziel, also mehr' : load < prev.w ? 'Letzter Satz schwerer als Ziel, also weniger' : '' }; }
  if ((spec.type === 'bo' || spec.type === 'dp') && prev.rpe != null && tgt != null) {
    const inc = spec.type === 'bo' ? 2.5 : incFor(exId);
    if ((prev.rpe >= tgt + 1 && tgt < 9.5) || (rng && prev.r < rng.lo - 1)) return { load: Math.max(0, prev.w - inc), reps: rng && rng.lo, why: 'Zu schwer, also −' + fmt(inc) + ' kg' };
    if (prev.rpe <= tgt - 1.5 && (!rng || prev.r >= rng.hi)) return { load: prev.w + inc, reps: rng && rng.lo, why: 'Zu leicht, also +' + fmt(inc) + ' kg' };
    return { load: prev.w, reps: prev.r, why: '' }; }
  return { load: prev.w, reps: prev.r, why: '' }; }

/* ======================= VOLUMEN ======================= */
function addVol(v, exId, n) { const ex = LIB[exId]; if (!ex) return; for (const m in ex.muscles) v[m] += n * ex.muscles[m]; }
function weekVolume(w) { const v = {}; Object.keys(MUSCLES).forEach(m => v[m] = 0);
  ['A','B','C'].forEach(k => { const s = peekSess(w, k); if (!s) return; for (const slot in s.logs) { const lg = s.logs[slot]; addVol(v, lg.ex, (lg.sets || []).filter(x => x && x.done).length); } });
  S.activities.filter(a => a.week === w && a.exercises).forEach(a => a.exercises.forEach(e => addVol(v, e.ex, (e.sets || []).filter(x => x && x.done).length)));
  return v; }
function plannedVolume(w) { const v = {}; Object.keys(MUSCLES).forEach(m => v[m] = 0); ['A','B','C'].forEach(k => planFor(w, k).forEach(p => addVol(v, p.ex, p.sets))); return v; }

/* ======================= ERNÄHRUNG ======================= */
const PRESET_MAP = Object.fromEntries(PRESET_FOODS.map(f => [f.id, f]));
const getFood = id => S.foods[id] || PRESET_MAP[id];
function unitsFor(f) { const u = []; if (f.base === '100g') { u.push('g'); if (f.pieceG) u.push('Stk'); } else { u.push('Stk'); if (f.pieceG) u.push('g'); } return u; }
function macrosFor(f, qty, unit) { let factor;
  if (f.base === '100g') { const g = unit === 'g' ? qty : qty * (f.pieceG || 0); factor = g / 100; }
  else { factor = unit === 'Stk' ? qty : qty / (f.pieceG || 1); }
  return { kcal: f.kcal * factor, p: f.p * factor, f: f.f * factor, c: f.c * factor }; }
function dayObj(d) { return S.days[d] || (S.days[d] = { entries: [] }); }
function dayTotals(d) { const o = S.days[d]; const t = { kcal: 0, p: 0, f: 0, c: 0 }; if (!o || !o.entries) return t; o.entries.forEach(e => { t.kcal += e.kcal; t.p += e.p; t.f += e.f; t.c += e.c; }); return t; }
function intakeFor(d) { const o = S.days[d]; if (!o || !o.entries || !o.entries.length || o.complete === false) return null; return dayTotals(d).kcal; }
function addEntry(d, foodId, meal, qty, unit) { const f = getFood(foodId); if (!f) return; const m = macrosFor(f, qty, unit); const o = dayObj(d); o.entries = o.entries || [];
  o.entries.push({ uid: uid(), food: foodId, name: f.name, meal, qty, unit, ...m });
  S.recent = [foodId, ...S.recent.filter(x => x !== foodId)].slice(0, 30); save(); }
function series() {
  const wDates = Object.keys(S.days).filter(d => num(S.days[d].weight) != null).sort();
  if (!wDates.length) return [];
  const out = []; let trend = null, est = num(S.settings.tdee0) || 3200; const end = today() > wDates[wDates.length - 1] ? today() : wDates[wDates.length - 1];
  for (let d = wDates[0]; d <= end; d = addDays(d, 1)) {
    const wt = num(S.days[d] && S.days[d].weight); if (wt != null) trend = trend == null ? wt : trend + 0.1 * (wt - trend);
    const i = out.length; const intake = intakeFor(d);
    if (i >= 13) { let sum = 0, n = 0; for (let j = i - 13; j <= i; j++) { const v = j === i ? intake : out[j].intake; if (v != null) { sum += v; n++; } }
      if (n >= 9) { const dW = trend - out[i - 13].trend; const obs = sum / n - dW * 7700 / 13; const c = Math.max(est - 600, Math.min(est + 600, obs)); est = est + 0.1 * (c - est); } }
    out.push({ d, weight: wt, trend, intake, est: Math.max(1800, Math.min(5200, est)) }); }
  return out; }
function currentTargets() { const cs = S.checkins.filter(c => c.date <= today()).sort((a, b) => a.date < b.date ? -1 : 1); if (cs.length) return cs[cs.length - 1];
  const kcal = num(S.settings.startKcal) || 2400, p = num(S.settings.protein) || 200, f = num(S.settings.fat) || 70; return { date: null, kcal, p, f, c: Math.round((kcal - 4 * p - 9 * f) / 4), tdee: null }; }
function checkinDue() { const ser = series(); if (ser.length < 7) return false; const last = S.checkins[S.checkins.length - 1]; return !last || daysBetween(last.date, today()) >= 7; }
function weeklyRate(ser) { if (ser.length < 8) return null; return ser[ser.length - 1].trend - ser[ser.length - 8].trend; }
function doCheckin() { const ser = series(); const last = ser[ser.length - 1]; const prev = currentTargets(); const st = S.settings;
  let kcal = Math.round((last.est - num(st.goalRate) * 7700 / 7) / 50) * 50;
  kcal = Math.max(num(st.floor) || 2000, kcal); kcal = Math.max(prev.kcal - 300, Math.min(prev.kcal + 300, kcal));
  const p = num(st.protein) || 200, f = num(st.fat) || 70;
  const c = { date: today(), tdee: Math.round(last.est), kcal, p, f, c: Math.max(0, Math.round((kcal - 4 * p - 9 * f) / 4)), rate: weeklyRate(ser), trend: last.trend };
  S.checkins = S.checkins.filter(x => x.date !== c.date).concat([c]); save(); return c; }

/* ======================= ROUTER ======================= */
let route = { name: 'heute', arg: null };
const ui = { week: null, day: today(), foodTab: 'presets', meal: 'Frühstück', swapScope: 'today' };
function parseHash() { const h = (location.hash || '#heute').slice(1).split('/'); route = { name: h[0] || 'heute', arg: h[1] || null }; }
window.addEventListener('hashchange', () => { parseHash(); render(true); });
function render(scrollTop) {
  maybeAdvance();
  const tabName = route.name === 'frei' ? 'training' : route.name === 'mehr' ? '' : route.name;
  document.querySelectorAll('#tabbar a').forEach(a => a.classList.toggle('on', a.dataset.r === tabName));
  const v = $('#view'); const y = window.scrollY;
  const map = { training: () => route.arg ? viewSession(route.arg) : viewTraining(), frei: () => viewFree(route.arg), essen: viewEssen, verlauf: viewProgress, mehr: viewMehr };
  v.innerHTML = (map[route.name] || viewHeute)();
  window.scrollTo(0, scrollTop ? 0 : y); }
function softPatch(id, html) { const el = document.getElementById(id); if (!el || !el.isConnected) return; const tmp = document.createElement('div'); tmp.innerHTML = html; const nu = tmp.firstElementChild; if (!nu) return;
  const oldSets = el.querySelector('.sets'), newSets = nu.querySelector('.sets');
  Array.from(el.children).forEach(c => { if (c !== oldSets) c.remove(); });
  Array.from(nu.children).forEach(c => { if (c !== newSets) el.insertBefore(c, oldSets || null); });
  if (oldSets && newSets) { const or = oldSets.querySelectorAll('.set'), nr = newSets.querySelectorAll('.set'); nr.forEach((n, i) => { const o = or[i]; if (!o) return; o.className = n.className;
      n.querySelectorAll('input').forEach(ni => { const oi = document.getElementById(ni.id); if (!oi) return; oi.placeholder = ni.placeholder; if (document.activeElement !== oi && oi.value !== ni.value) oi.value = ni.value; }); }); } }
const pageTop = (accent, rest, sub, extra) => '<div class="top"><div class="grow"><h1><span class="t-ember">' + accent + '</span>' + (rest ? ' ' + rest : '') + '</h1>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' + (extra || '') + '<a class="iconbtn" href="#mehr" aria-label="Einstellungen">' + ICON.gear + '</a></div>';
const note = (dot, html, btn) => '<div class="note-card"><span class="dot ' + dot + '"></span><div class="grow">' + html + '</div>' + (btn || '') + '</div>';
const badge = k => { const s = SESS[k]; return '<span class="badge ' + s.kind + '">' + (k === 'Z' ? 'Z2' : k) + '</span>'; };

/* ======================= HEUTE ======================= */
function viewHeute() {
  const t = today(), d = new Date(), w = curWeek(), st = S.settings;
  const ser = series(), last = ser[ser.length - 1], rate = weeklyRate(ser), tg = currentTargets(), tot = dayTotals(t);
  const planned = sessionsOnDow(d.getDay());
  const open = ORDER.filter(k => !sessProgress(w, k).done);
  let train = '';
  planned.forEach(k => { const pr = sessProgress(w, k); const s = SESS[k];
    train += '<a class="li" href="#training/' + sKey(w, k) + '">' + badge(k) + '<div class="grow"><b>' + s.title + '</b><small>' + esc(k === 'H' ? hiit(w).title : k === 'Z' ? Z2MIN[w - 1] + ' min · ' + s.sub : s.sub) + '</small></div><span class="tag"><span class="dot ' + (pr.done ? 'green' : pr.f ? 'amber' : 'mist') + '"></span>' + (pr.skipped ? 'übersprungen' : pr.done ? 'erledigt' : pr.f ? pr.f + '/' + pr.t : 'offen') + '</span></a>'; });
  const others = open.filter(k => !planned.includes(k));
  const trainCard = '<div class="card flush"><div class="meal-h"><b>Training · Woche ' + w + '</b><span class="tag">' + PH_LABEL[phase(w)] + '</span></div>' +
    (train ? '<div class="list">' + train + '</div>' : '<div style="padding:0 20px 14px" class="muted">Heute ist kein Training eingeplant.</div>') +
    (others.length ? '<div style="padding:4px 20px 18px"><div class="lbl" style="margin-bottom:8px">' + (train ? 'Diese Woche noch offen' : 'Nachholen oder vorziehen') + '</div><div class="row">' + others.map(k => '<a class="btn sm" href="#training/' + sKey(w, k) + '">' + SESS[k].title + (st.dayMap[k] === '' || st.dayMap[k] == null ? '' : ' <span class="muted">' + WD[st.dayMap[k]] + '</span>') + '</a>').join('') + '</div></div>' : '') + '</div>';
  const todaysActs = S.activities.filter(a => a.date === t);
  const acts = todaysActs.length ? '<div class="card flush"><div class="meal-h"><b>Aktivitäten heute</b></div><div class="list">' + todaysActs.map(actRow).join('') + '</div></div>' : '';
  const due = checkinDue();
  return pageTop(WD_LONG[d.getDay()] + ',', d.getDate() + '. ' + MON[d.getMonth()], S.block.startedOn ? 'Block seit ' + fmtDay(S.block.startedOn) : 'Dein Block startet mit der ersten Einheit.') +
  '<div class="stack">' + updateNote() +
  (due ? note('ember', '<b>Wöchentlicher Check-in fällig.</b> Bedarf und Kalorienziel werden aus deinem Gewichtstrend neu berechnet.', '<button class="btn brand sm" data-act="checkin" type="button">Check-in</button>') : '') +
  trainCard + healthStrip(t) +
  '<div class="card"><div class="row"><div class="field"><label for="wToday">Gewicht heute</label><input id="wToday" type="number" inputmode="decimal" step="0.1" data-day="' + t + '" data-f="weight" value="' + esc(S.days[t] && S.days[t].weight) + '" placeholder="kg"></div>' +
  '<div class="grow"></div><div style="text-align:right"><div class="lbl">Trend</div><div class="big num">' + (last ? fmt(last.trend) + ' kg' : '–') + '</div><div class="small ' + (rate != null && rate < 0 ? 't-green' : 'muted') + '" style="font-weight:700">' + (rate != null ? (rate <= 0 ? '−' : '+') + fmt(Math.abs(rate), 2) + ' kg pro Woche' : 'Trend ab 8 Tagen') + '</div></div></div></div>' +
  '<a class="card" href="#essen" style="text-decoration:none;color:inherit;display:block"><div class="row" style="margin-bottom:12px"><h2 class="grow">Ernährung</h2><span class="small muted">Ziel ' + fmt(tg.kcal, 0) + ' kcal</span></div>' + rings(tot, tg) + '</a>' +
  acts + '</div>'; }
function healthStrip(d) { const h = S.health[d] || {}, y = S.health[addDays(d, -1)] || {}; const base = rhrBaseline(); const rhr = rhrOf(d);
  const steps = h.steps, goal = num(S.settings.stepGoal) || 9000; const src = h.src || S.healthMeta.source;
  const conn = HEALTH.native ? '<button class="iconbtn" type="button" data-act="hcSync" aria-label="Gesundheitsdaten synchronisieren" style="background:var(--paper)">' + ICON.sync + '</button>' : '';
  const nodata = steps == null && rhr == null && h.sleepMin == null;
  return '<div class="card"><div class="row" style="margin-bottom:12px"><h2 class="grow">Gesundheit</h2>' + conn + '</div>' +
  (nodata ? '<p class="muted" style="margin-top:0">Noch keine Werte für heute. ' + (HEALTH.native ? 'Tippe auf Synchronisieren, um Zepp-Daten aus Health Connect zu holen.' : 'In der Android-App kommen sie direkt aus Zepp. Hier kannst du sie unter „Einstellungen“ importieren.') + '</p>' : '') +
  '<div class="health">' +
  '<div class="stat" style="background:var(--paper)"><div class="k">Schritte</div><div class="v num">' + (steps != null ? fmt(steps, 0) : '–') + '</div><div class="meter" style="background:var(--fog)"><i style="width:' + Math.min(100, (steps || 0) / goal * 100) + '%"></i></div></div>' +
  '<div class="stat" style="background:var(--paper)"><div class="k">Ruhepuls</div><div class="v num">' + (rhr != null ? fmt(rhr, 0) : '–') + '</div><div class="s">' + (base ? 'Basis ' + base.v : 'Basis fehlt') + '</div></div>' +
  '<div class="stat" style="background:var(--paper)"><div class="k">Schlaf</div><div class="v num">' + (h.sleepMin != null ? fmtMin(h.sleepMin) : '–') + '</div><div class="s">' + (h.deep != null ? 'Tief ' + fmt(h.deep, 0) + ' min' : '&nbsp;') + '</div></div>' +
  '</div>' + (src && !nodata ? '<div class="src" style="margin-top:8px">Quelle: ' + esc({ hc: 'Health Connect (Zepp)', zepp: 'Zepp-Export', manual: 'manuell' }[src] || src) + (S.healthMeta.lastSync ? ' · Stand ' + new Date(S.healthMeta.lastSync).toLocaleString('de-DE', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }) : '') + '</div>' : '') + '</div>'; }
function rings(tot, tg) { const R = (v, t, color, lab, unit) => { const pct = t ? Math.min(1, v / t) : 0, over = t && v > t * 1.05, C = 2 * Math.PI * 28;
    return '<div class="ring"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="28" fill="none" stroke="var(--paper)" stroke-width="8"/><circle cx="36" cy="36" r="28" fill="none" stroke="' + (over ? 'var(--signal)' : color) + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (C * pct).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 36 36)"/></svg><div class="v num">' + fmt(v, 0) + '</div><div class="t">' + lab + ' / ' + fmt(t, 0) + unit + '</div></div>'; };
  return '<div class="rings">' + R(tot.kcal, tg.kcal, 'var(--signal)', 'kcal', '') + R(tot.p, tg.p, 'var(--plum)', 'Protein', ' g') + R(tot.c, tg.c, 'var(--sky)', 'KH', ' g') + R(tot.f, tg.f, 'var(--verdant)', 'Fett', ' g') + '</div>'; }
function actRow(a) { const t = ACT_MAP[a.type] || ACT_MAP.sonst; const bits = [];
  if (num(a.dur) != null) bits.push(fmt(num(a.dur), 0) + ' min'); if (num(a.dist) != null) bits.push(fmt(num(a.dist), 1) + ' km'); if (num(a.avgHr) != null) bits.push('Ø ' + fmt(num(a.avgHr), 0) + ' bpm');
  if (a.exercises) bits.push(a.exercises.length + ' Übungen');
  return '<a class="li" href="#frei/' + a.id + '"><span class="badge act sm">' + esc(t.short) + '</span><div class="grow"><b>' + esc(a.title || t.name) + '</b><small>' + esc(fmtDay(a.date) + (bits.length ? ' · ' + bits.join(' · ') : '')) + (a.countsAs ? ' · zählt als ' + SESS[a.countsAs].title : '') + (a.src && a.src !== 'manual' ? ' · Zepp' : '') + '</small></div><span class="chev">›</span></a>'; }

/* ======================= TRAINING ======================= */
function viewTraining() {
  const cw = curWeek(); if (!ui.week) ui.week = cw; const w = ui.week;
  let n = 0; ORDER.forEach(k => { if (sessProgress(w, k).done) n++; });
  const weeks = Array.from({ length: 12 }, (_, i) => { const x = i + 1; return '<button class="wk' + (x === w ? ' on' : '') + (x === cw ? ' cur' : '') + (weekDone(x) ? ' done' : '') + '" data-act="week" data-w="' + x + '" type="button" aria-label="Woche ' + x + '"><b>' + x + '</b><i class="ph-' + phase(x) + '"></i></button>'; }).join('');
  const rows = ORDER.map(k => { const s = SESS[k], pr = sessProgress(w, k); let sub = s.sub; if (k === 'H') sub = hiit(w).title; if (k === 'Z') sub = Z2MIN[w - 1] + ' min · ' + s.sub;
    const se = peekSess(w, k); const when = se && se.date ? fmtDay(se.date) : dayLabel(k);
    return '<a class="li" href="#training/' + sKey(w, k) + '">' + badge(k) + '<div class="grow"><b>' + s.title + '</b><small>' + esc(when + ' · ' + sub) + '</small></div><span class="tag"><span class="dot ' + (pr.done ? 'green' : pr.f ? 'amber' : 'mist') + '"></span>' + (pr.skipped ? 'übersprungen' : pr.done ? 'erledigt' : pr.f ? pr.f + '/' + pr.t : 'offen') + '</span></a>'; }).join('');
  const frees = S.activities.filter(a => a.week === w);
  const warn = scheduleWarnings();
  const vol = weekVolume(w), pv = plannedVolume(w);
  const finishBtn = w === cw && !weekDone(w) && cw < 12 ? (ui.confirmFinish ? '<div class="row"><span class="grow small">Offene Einheiten werden als übersprungen markiert.</span><button class="btn sm" data-act="finishNo" type="button">Abbrechen</button><button class="btn dark sm" data-act="finishYes" type="button">Ja, abschließen</button></div>' : '<button class="btn block" data-act="finish" type="button">Woche ' + w + ' abschließen und weiter</button>') : '';
  return pageTop('Woche ' + w, PH_LABEL[phase(w)], n + ' von 5 Einheiten erledigt' + (w !== cw ? ' · aktuell Woche ' + cw : '')) +
  '<div class="stack"><div class="weeks">' + weeks + '</div>' +
  '<div class="legend"><span><i class="ph-b1"></i>Einstieg</span><span><i class="ph-b2"></i>Aufbau</span><span><i class="ph-b3"></i>Intensiv</span><span><i class="ph-dl"></i>Deload</span><span><i class="ph-test"></i>Test</span></div>' +
  warn.map(x => note('amber', esc(x), '<a class="btn sm" href="#mehr">Ändern</a>')).join('') +
  '<div class="card flush"><div class="list">' + rows + '</div></div>' + finishBtn +
  '<div class="section-h"><h2>Freies Training</h2><button class="btn sm fog" data-act="newAct" type="button">+ Aktivität</button></div>' +
  (frees.length ? '<div class="card flush"><div class="list">' + frees.map(actRow).join('') + '</div></div>' : '<p class="muted small" style="margin:0 4px">Spontan joggen, schwimmen oder frei trainieren? Über das Plus unten rechts eintragen.</p>') +
  '<div class="card"><h2>Volumen Woche ' + w + '</h2><p class="small muted" style="margin-bottom:14px">Erledigte Sätze pro Muskel, Hilfsmuskeln anteilig. Lila = Schwerpunkt, grau hinterlegt = Zielbereich. In Klammern: geplant.</p>' + volBars(vol, pv) + '</div></div>'; }
function volBars(v, pv) { const max = 24; return '<div class="vol">' + Object.keys(MUSCLES).map(m => { const p = PRIORITY.includes(m), tr = p ? VOL_TARGET.prio : VOL_TARGET.other;
  return '<span>' + MUSCLES[m] + '</span><div class="b"><u style="left:' + (tr[0] / max * 100) + '%;width:' + ((tr[1] - tr[0]) / max * 100) + '%"></u><i class="' + (p ? 'p' : '') + '" style="width:' + Math.min(100, v[m] / max * 100) + '%"></i></div><span class="num small">' + fmt(v[m], 0) + ' <span class="muted">(' + fmt(pv[m], 0) + ')</span></span>'; }).join('') + '</div>'; }

function viewSession(key) {
  const m = key.match(/^w(\d+)-([ABCHZ])$/); if (!m) return '<p>Einheit nicht gefunden.</p>';
  const w = +m[1], k = m[2]; ui.week = w; const d = SESS[k]; const se = peekSess(w, k);
  const head = '<a href="#training" class="back">' + ICON.back + 'Woche ' + w + '</a>' + pageTop(d.title, d.sub, PH_LABEL[phase(w)] + ' · ' + (se && se.date ? 'gestartet ' + fmtDay(se.date) : 'geplant ' + dayLabel(k)));
  if (k === 'H' || k === 'Z') return head + cardioView(w, k);
  const s = sess(w, k), c = s.check || {}, rd = readiness(w, k);
  const check = '<div class="card"><h2 style="margin-bottom:12px">Check-in nach dem Aufwärmen</h2><div class="fields">' +
    '<div class="field"><label for="ckb">Rücken 0–10</label><input id="ckb" type="number" inputmode="numeric" min="0" max="10" data-sw="' + w + '" data-sk="' + k + '" data-ck="back" value="' + esc(c.back) + '" placeholder="–"></div>' +
    '<div class="field"><label for="ckr">Ruhepuls' + (rd.autoRhr ? ' (Zepp)' : '') + '</label><input id="ckr" type="number" inputmode="numeric" data-sw="' + w + '" data-sk="' + k + '" data-ck="rhr" value="' + esc(c.rhr) + '" placeholder="' + (rd.autoRhr ? fmt(rd.rhr, 0) : 'bpm') + '"></div>' +
    '<div class="field"><label for="cks">Schlaf' + (rd.autoSleep ? ' (Zepp: ' + fmtMin(rd.sleepMin) + ')' : '') + '</label><select id="cks" data-sw="' + w + '" data-sk="' + k + '" data-ck="sleep"><option value="">' + (rd.autoSleep ? 'automatisch: ' + rd.sleep : '–') + '</option>' + ['gut', 'ok', 'schlecht'].map(o => '<option' + (c.sleep === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div></div></div>';
  const watch = s.watch ? note('sky', 'Uhr: ' + fmt(s.watch.dur, 0) + ' min' + (s.watch.kcal ? ' · ' + fmt(s.watch.kcal, 0) + ' kcal' : '') + ' aus Zepp übernommen.') : '';
  return head + '<div class="stack">' + check + flagsHTML(w, k) + watch + planFor(w, k).map(spec => exCard(w, k, spec)).join('') +
    (s.skipped ? '<button class="btn block" data-act="unskip" data-w="' + w + '" data-k="' + k + '" type="button">Wieder öffnen</button>' : '<button class="btn block fog" data-act="skip" data-w="' + w + '" data-k="' + k + '" type="button" style="background:var(--fog)">Einheit überspringen</button>') + '</div>'; }
function flagsHTML(w, k) { const r = readiness(w, k); let h = '';
  if (r.backRed) { const s = peekSess(w, k); const swapped = s && s.swaps && (s.swaps.fs === 'pend' || s.swaps.trap === 'glute_bridge');
    h += note('red', '<b>Rücken-Ampel rot</b> (' + r.back + '/10' + (r.pb != null ? ', letztes Mal ' + r.pb : '') + '). ' + (k === 'A' ? 'Front Squat → Pendulum Squat.' : k === 'C' ? 'Trap Bar → Glute Bridge.' : 'Achte bei allen Übungen auf neutralen Rücken.'), k === 'B' ? '' : swapped ? '<span class="tag">getauscht</span>' : '<button class="btn sm brand" data-act="backswap" data-w="' + w + '" data-k="' + k + '" type="button">Tauschen</button>'); }
  if (r.backAmber) h += note('amber', 'Letzte Einheit lag dein Rücken bei ' + r.pb + '/10. Nach dem Aufwärmen oben eintragen.');
  if (r.rhrHigh) h += note('amber', '<b>Ruhepuls erhöht</b> (' + fmt(r.rhr, 0) + ' statt ' + r.base.v + '). Top-Sätze heute eine RPE-Stufe leichter. Die Vorschläge sind schon angepasst.');
  else if (r.sleepBad) h += note('amber', '<b>Wenig Schlaf' + (r.sleepMin != null ? ' (' + fmtMin(r.sleepMin) + ')' : '') + '.</b> Top-Sätze eine RPE-Stufe leichter. Die Vorschläge sind schon angepasst.');
  if (r.runPrev) h += note('sky', '<b>' + esc(ACT_MAP[r.runPrev.type].name) + ' ' + (r.runPrev.date === today() ? 'heute' : 'gestern') + '.</b> Laufen belastet die Beine stärker als Rad oder Rudern. Die Hauptübung nach RPE steuern, nicht nach der Plan-Last.');
  return '<div id="flags" class="stack">' + h + '</div>'; }

function setRows(prefix, spec, raw, sugg, showRpe, tgt, isCarry, dataAttrs) { let rows = '';
  for (let i = 0; i < spec.sets; i++) { const v = raw[i] || {}; const sg = sugg(i);
    const wPh = sg.load != null ? fmt(sg.load) : 'kg', rPh = sg.reps != null ? String(sg.reps) : (isCarry ? 'm' : 'Reps');
    rows += '<div class="set' + (v.done ? ' done' : '') + '"><span class="n">' + (i + 1) + '</span>' +
      '<input id="' + prefix + i + '-w" type="number" inputmode="decimal" step="any" ' + dataAttrs + ' data-i="' + i + '" data-f="w" value="' + esc(v.w) + '" placeholder="' + esc(wPh) + '" aria-label="Satz ' + (i + 1) + ' kg">' +
      '<input id="' + prefix + i + '-r" type="number" inputmode="numeric" ' + dataAttrs + ' data-i="' + i + '" data-f="r" value="' + esc(v.r) + '" placeholder="' + esc(rPh) + '" aria-label="Satz ' + (i + 1) + ' ' + (isCarry ? 'Meter' : 'Wiederholungen') + '">' +
      (showRpe ? '<input id="' + prefix + i + '-rpe" type="number" inputmode="decimal" step="0.5" ' + dataAttrs + ' data-i="' + i + '" data-f="rpe" value="' + esc(v.rpe) + '" placeholder="' + (tgt != null ? fmt(tgt) : 'RPE') + '" aria-label="Satz ' + (i + 1) + ' RPE">' : '<span></span>') +
      '<button class="chk" type="button" data-act="done" ' + dataAttrs + ' data-i="' + i + '" aria-label="Satz ' + (i + 1) + ' erledigt">' + ICON.check + '</button></div>'; }
  return '<div class="sets"><div class="sethead"><span>#</span><span>kg</span><span>' + (isCarry ? 'Meter' : 'Reps') + '</span><span>' + (showRpe ? 'RPE' : '') + '</span><span></span></div>' + rows + '</div>'; }
function exCard(w, k, spec) {
  const exId = actualEx(w, k, spec), ex = LIB[exId], rd = readiness(w, k);
  const s = sess(w, k); const lg = s.logs[spec.slot]; const raw = (lg && lg.sets) || [];
  const base = planSuggestion(w, k, spec, exId, rd); const tgt = spec.rpe != null ? spec.rpe + (spec.type === 'main' ? rd.rpeShift : 0) : null;
  const h = history(w, k, exId);
  const histTxt = h ? 'Zuletzt Woche ' + h.w + ': ' + h.items.flatMap(it => it.sets).map(x => (x.w != null ? fmt(x.w) + ' × ' : '') + (x.r ?? '–') + (x.rpe != null ? ' @' + fmt(x.rpe) : '')).join(', ') : '';
  const isCarry = spec.type === 'carry', showRpe = spec.rpe != null && spec.type !== 'power';
  const sugg = i => setSuggestion(w, k, spec, exId, i, base, rd);
  const nextWhy = (() => { for (let i = 0; i < spec.sets; i++) { if (!(raw[i] && raw[i].done)) { const sg = sugg(i); return sg.why ? 'Satz ' + (i + 1) + ': ' + sg.why + (sg.load != null ? ' (' + fmt(sg.load) + ' kg)' : '') : ''; } } return ''; })();
  const swapped = exId !== spec.ex;
  return '<div class="ex" id="ex-' + spec.slot + '"><div class="ex-h"><div class="grow"><button class="nm exlink" type="button" data-act="exHist" data-ex="' + exId + '">' + (spec.sup ? '<span class="sup">' + spec.sup + '</span>' : '') + esc(ex.name) + (isPrio(exId) ? '<span class="prio">Schwerpunkt</span>' : '') + '<span class="histbtn">' + ICON.chart + 'Verlauf</span></button>' +
    (swapped ? '<div class="swapped">statt ' + esc(LIB[spec.ex].name) + '</div>' : '') +
    '<div class="spec"><b>' + spec.sets + ' × ' + esc(spec.reps) + (isCarry ? ' m' : '') + '</b>' + (tgt != null ? ' bei RPE ' + fmt(tgt) : '') + (spec.rest ? ' · Pause ' + (spec.rest >= 60 ? fmt(spec.rest / 60) + ' min' : spec.rest + ' s') : spec.slot === 'lat_a' ? ' · ohne eigene Pause' : '') + '</div>' +
    ((spec.note || ex.note) ? '<div class="note">' + esc([spec.note, ex.note].filter(Boolean).join(' ')) + '</div>' : '') + '</div>' +
    '<button class="btn sm" data-act="swap" data-slot="' + spec.slot + '" type="button">Tauschen</button></div>' +
    (histTxt ? '<div class="hint">' + esc(histTxt) + '</div>' : '') + '<div class="sugg ' + (base.cls || '') + '">' + esc(base.txt) + '</div>' +
    (nextWhy ? '<div class="next">' + esc(nextWhy) + '</div>' : '') +
    setRows('s-' + spec.slot + '-', spec, raw, sugg, showRpe, tgt, isCarry, 'data-slot="' + spec.slot + '"') + '</div>'; }

function cardioView(w, k) {
  const s = sess(w, k); const c = s.cardio || {}; const hf = num(S.settings.hfmax) || 186; const z2 = [Math.round(hf * .65), Math.round(hf * .75)], hi = Math.round(hf * .9);
  const rd = readiness(w, k); let title, sub, zones; const act = countsAsActivity(w, k);
  if (k === 'H') { const h = hiit(w); title = h.title; sub = h.sub;
    zones = h.mode === 'int' ? '<span class="tag"><span class="dot red"></span>Letzte 2 min je Intervall ab ' + hi + ' bpm</span><span class="tag"><span class="dot green"></span>Pausen locker</span>' : h.mode === 'z2' ? '<span class="tag"><span class="dot green"></span>Z2 ' + z2[0] + '–' + z2[1] + ' bpm</span>' : '<span class="tag"><span class="dot red"></span>Zeit unter „Leistung“ eintragen</span>'; }
  else { title = Z2MIN[w - 1] + ' min Z2'; sub = 'Du kannst in ganzen Sätzen reden.'; zones = '<span class="tag"><span class="dot green"></span>Z2 ' + z2[0] + '–' + z2[1] + ' bpm</span>'; }
  const devs = k === 'H' ? ['', 'Air-Bike', 'Incline-Laufband', 'Ergometer', 'Rudergerät'] : ['', 'Rudergerät', 'Rad / Ergometer', 'Schwimmen', 'Incline Walk', 'Stepper', 'Joggen'];
  const f = (id, lab, ph, type) => '<div class="field"><label for="c-' + id + '">' + lab + '</label><input id="c-' + id + '" ' + (type === 'text' ? 'type="text" style="width:170px"' : 'type="number" inputmode="decimal"') + ' data-cw="' + w + '" data-ck2="' + k + '" data-cf="' + id + '" value="' + esc(c[id]) + '" placeholder="' + ph + '"></div>';
  const z = zeppWorkoutFor(s.date || today(), k);
  return '<div class="stack">' + (act ? note('green', 'Erledigt durch ' + esc(ACT_MAP[act.type].name) + ' am ' + fmtDay(act.date) + '.', '<a class="btn sm" href="#frei/' + act.id + '">Ansehen</a>') : '') +
    (k === 'H' && rd.rhrHigh ? note('amber', '<b>Ruhepuls erhöht</b> (' + fmt(rd.rhr, 0) + ' statt ' + rd.base.v + '). Heute ' + Z2MIN[w - 1] + ' min Z2 statt Intervalle.') : '') +
    (z && num(c.dur) == null ? note('sky', 'Zepp hat heute ' + esc(z.title || ACT_MAP[z.type].name) + ' mit ' + fmt(z.dur, 0) + ' min aufgezeichnet.', '<button class="btn sm brand" data-act="useZepp" data-id="' + z.id + '" data-w="' + w + '" data-k="' + k + '" type="button">Übernehmen</button>') : '') +
    '<div class="card"><div class="big">' + esc(title) + '</div><div class="muted">' + esc(sub) + '</div><div class="zones">' + zones + '</div>' +
    (k === 'H' && hiit(w).mode === 'int' ? '<button class="btn brand" data-act="intervals" data-w="' + w + '" type="button">Intervall-Timer starten</button>' : '') + '</div>' +
    '<div class="card"><div class="fields">' +
    '<div class="field"><label for="c-dev">Gerät</label><select id="c-dev" data-cw="' + w + '" data-ck2="' + k + '" data-cf="dev">' + devs.map(o => '<option' + (c.dev === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select></div>' +
    f('dur', 'Dauer (min)', 'min') + f('avg', 'Ø Puls', 'bpm') + f('max', 'Max. Puls', 'bpm') + f('perf', k === 'H' ? 'Leistung' : 'Distanz', k === 'H' ? 'z. B. 280 W' : 'z. B. 6 km', 'text') + f('rpe', 'RPE', '1–10') +
    '</div></div>' + (s.skipped ? '<button class="btn block" data-act="unskip" data-w="' + w + '" data-k="' + k + '" type="button">Wieder öffnen</button>' : '<button class="btn block" style="background:var(--fog)" data-act="skip" data-w="' + w + '" data-k="' + k + '" type="button">Einheit überspringen</button>') + '</div>'; }
function zeppWorkoutFor(d, k) { return S.activities.find(a => a.date === d && a.src && a.src !== 'manual' && !a.countsAs && ACT_MAP[a.type] && ACT_MAP[a.type].cardio && (k === 'Z' || k === 'H')); }

/* ======================= FREIES TRAINING / AKTIVITÄT ======================= */
function viewFree(id) { const a = S.activities.find(x => x.id === id); if (!a) return '<a href="#training" class="back">' + ICON.back + 'Training</a><p>Aktivität nicht gefunden.</p>';
  const t = ACT_MAP[a.type] || ACT_MAP.sonst;
  const f = (k, lab, ph, type) => '<div class="field"><label for="a-' + k + '">' + lab + '</label><input id="a-' + k + '" type="' + (type || 'number') + '" ' + (type ? '' : 'inputmode="decimal" step="any"') + ' data-aid="' + a.id + '" data-af="' + k + '" value="' + esc(a[k]) + '" placeholder="' + ph + '"' + (type === 'date' ? ' style="width:170px"' : '') + '></div>';
  const w = a.week || curWeek(); const zOpen = !sessProgress(w, 'Z').done || a.countsAs === 'Z';
  let ex = '';
  if (t.strength) { ex = (a.exercises || []).map((e, idx) => freeExCard(a, e, idx)).join('') + '<button class="btn block brand" data-act="freeAddEx" data-aid="' + a.id + '" type="button">+ Übung hinzufügen</button>'; }
  return '<a href="#training" class="back">' + ICON.back + 'Training</a>' + pageTop(t.name, '', fmtDay(a.date) + (a.src && a.src !== 'manual' ? ' · aus Zepp' : '')) +
  '<div class="stack"><div class="card"><div class="fields">' +
  '<div class="field"><label for="a-type">Art</label><select id="a-type" data-aid="' + a.id + '" data-af="type">' + ACT_TYPES.map(x => '<option value="' + x.id + '"' + (x.id === a.type ? ' selected' : '') + '>' + x.name + '</option>').join('') + '</select></div>' +
  f('date', 'Datum', '', 'date') + f('dur', 'Dauer (min)', 'min') + (t.dist ? f('dist', 'Distanz (km)', 'km') : '') + f('avgHr', 'Ø Puls', 'bpm') + f('kcal', 'kcal (Uhr)', 'kcal') + f('rpe', 'RPE', '1–10') +
  '<div class="field" style="flex:1 1 100%"><label for="a-note">Notiz</label><input id="a-note" type="text" data-aid="' + a.id + '" data-af="note" value="' + esc(a.note) + '" placeholder="optional"></div></div>' +
  (t.cardio && zOpen ? '<label class="row" style="margin-top:14px;gap:10px"><input type="checkbox" data-aid="' + a.id + '" data-af="countsZ"' + (a.countsAs === 'Z' ? ' checked' : '') + '> <span>Zählt als Z2-Einheit von Woche ' + w + '</span></label><p class="small muted">Nur wenn du locker in Zone 2 unterwegs warst und es mindestens ' + Math.min(30, Z2MIN[w - 1]) + ' Minuten waren.</p>' : '') + '</div>' +
  ex + '<p class="small muted" style="margin:0 4px">Freie Aktivitäten verändern dein Kalorienziel nicht. Der Bedarf wird aus deinem Gewichtstrend berechnet, Bewegung ist darin schon enthalten.</p>' +
  (ui.confirmDel === a.id ? '<div class="row"><span class="grow small">Wirklich löschen?</span><button class="btn sm" data-act="delActNo" type="button">Abbrechen</button><button class="btn sm dark" data-act="delActYes" data-aid="' + a.id + '" type="button">Löschen</button></div>' : '<button class="btn block danger" style="background:var(--fog)" data-act="delAct" data-aid="' + a.id + '" type="button">Aktivität löschen</button>') + '</div>'; }
function freeExCard(a, e, idx) { const ex = LIB[e.ex]; const spec = { slot: 'f' + idx, sets: e.sets.length, reps: e.reps || '8–12', rpe: 8, type: 'dp' };
  const h = lastAny(e.ex); const histTxt = h ? 'Zuletzt im Plan (Woche ' + h.w + '): ' + h.items.flatMap(it => it.sets).map(x => (x.w != null ? fmt(x.w) + ' × ' : '') + (x.r ?? '–')).join(', ') : '';
  const sugg = i => { const raw = e.sets; for (let j = i - 1; j >= 0; j--) { const x = raw[j]; if (x && x.done) return { load: num(x.w), reps: num(x.r) }; } return { load: null, reps: null }; };
  return '<div class="ex" id="fx-' + idx + '"><div class="ex-h"><div class="grow"><button class="nm exlink" type="button" data-act="exHist" data-ex="' + e.ex + '">' + esc(ex.name) + (isPrio(e.ex) ? '<span class="prio">Schwerpunkt</span>' : '') + '<span class="histbtn">' + ICON.chart + 'Verlauf</span></button></div><button class="btn sm" data-act="freeDelEx" data-aid="' + a.id + '" data-idx="' + idx + '" type="button">Entfernen</button></div>' +
    (histTxt ? '<div class="hint">' + esc(histTxt) + '</div>' : '') + setRows('f-' + idx + '-', spec, e.sets, sugg, true, null, false, 'data-aid="' + a.id + '" data-idx="' + idx + '"') +
    '<div class="ex-actions"><button class="btn sm" data-act="freeAddSet" data-aid="' + a.id + '" data-idx="' + idx + '" type="button">+ Satz</button></div></div>'; }
function newActivity(type, dateStr) { const a = { id: uid(), type, date: dateStr || today(), week: curWeek(), src: 'manual' }; if (ACT_MAP[type].strength) a.exercises = []; S.activities.push(a); save(); return a; }

/* ======================= ESSEN ======================= */
function viewEssen() {
  const d = ui.day, o = S.days[d] || { entries: [] }, tot = dayTotals(d), tg = currentTargets(); const left = tg.kcal - tot.kcal;
  const meals = MEALS.map(m => { const es = (o.entries || []).filter(e => e.meal === m); const k = es.reduce((a, e) => a + e.kcal, 0);
    return '<div class="card flush"><div class="meal-h"><b>' + m + '</b><span class="small muted num">' + fmt(k, 0) + ' kcal</span><button class="btn sm" data-act="add" data-meal="' + m + '" type="button">+ Hinzufügen</button></div>' +
      es.map(e => '<div class="entry" data-act="edit" data-uid="' + e.uid + '"><div class="grow" style="min-width:0"><div class="nm">' + esc(e.name) + '</div><div class="small muted">' + fmt(e.qty) + ' ' + e.unit + '</div></div><div class="k num">' + fmt(e.kcal, 0) + ' kcal<small>' + fmt(e.p, 0) + ' g Protein</small></div></div>').join('') + (es.length ? '<div style="height:8px"></div>' : '') + '</div>'; }).join('');
  const head = '<div class="top"><div class="grow"><h1>' + (left >= 0 ? '<span class="t-green">' + fmt(left, 0) + ' kcal</span> übrig' : '<span class="t-red">' + fmt(-left, 0) + ' kcal</span> über dem Ziel') + '</h1><div class="sub">' + (d === today() ? 'Heute' : fmtDay(d)) + ' · Ziel ' + fmt(tg.kcal, 0) + ' kcal</div></div><a class="iconbtn" href="#mehr" aria-label="Einstellungen">' + ICON.gear + '</a></div>';
  return head + '<div class="stack">' +
  '<div class="daynav"><button class="iconbtn" data-act="dprev" type="button" aria-label="Vortag">‹</button><div class="grow">' + (d === today() ? 'Heute' : fmtDay(d)) + '</div><button class="iconbtn" data-act="dnext" type="button" aria-label="Nächster Tag"' + (d >= today() ? ' disabled' : '') + '>›</button></div>' +
  (checkinDue() ? note('ember', '<b>Check-in fällig:</b> neues Kalorienziel aus deinem Trend berechnen.', '<button class="btn brand sm" data-act="checkin" type="button">Check-in</button>') : '') +
  '<div class="card">' + rings(tot, tg) + '</div>' +
  '<div class="scanbar"><button class="btn brand" data-act="scan" type="button">' + ICON.scan + 'Barcode scannen</button><button class="btn" style="background:var(--fog)" data-act="add" data-meal="' + guessMeal() + '" type="button">' + ICON.search + 'Suchen</button></div>' +
  ((o.entries || []).length ? '' : '<button class="btn block" style="background:var(--fog)" data-act="template" type="button">Meal-Prep-Tag einfügen</button>') +
  meals +
  '<div class="card"><div class="row"><div class="field"><label for="wDay">Gewicht</label><input id="wDay" type="number" inputmode="decimal" step="0.1" data-day="' + d + '" data-f="weight" value="' + esc(o.weight) + '" placeholder="kg"></div><div class="grow"></div>' +
  '<label class="row" style="gap:10px"><input type="checkbox" id="complete" data-day="' + d + '" data-f="complete"' + (o.complete === false ? '' : ' checked') + '> Tag vollständig geloggt</label></div>' +
  '<p class="small muted">Nur vollständig geloggte Tage fließen in die Bedarfsberechnung. Hast du etwas vergessen, nimm den Haken raus.</p></div></div>'; }
function guessMeal() { const h = new Date().getHours(); return h < 11 ? 'Frühstück' : h < 15 ? 'Mittag' : h < 18 ? 'Snack' : 'Abend'; }

/* ---------- Sheets ---------- */
let searchAbort = null;
function openSheet(html) { $('#sheetCard').innerHTML = '<div class="grab"></div>' + html; $('#sheet').hidden = false; }
function closeSheet() { $('#sheet').hidden = true; $('#sheetCard').innerHTML = ''; }
const sheetHead = t => '<div class="row"><h2 class="grow">' + t + '</h2><button class="btn sm" style="background:var(--fog)" data-act="closeSheet" type="button">Schließen</button></div>';
function foodRow(f) { const per = f.base === '100g' ? '100 g' : 'Stück'; return '<div class="it" data-act="pick" data-id="' + esc(f.id) + '"><div class="grow"><b>' + esc(f.name) + '</b><small>' + (f.brand ? esc(f.brand) + ' · ' : '') + (f.needsFetch ? 'Nährwerte werden beim Antippen geladen' : fmt(f.kcal, 0) + ' kcal · ' + fmt(f.p, 1) + ' g Protein pro ' + per) + '</small></div><span class="chev">›</span></div>'; }
function addSheet() {
  const tabs = [['presets', 'Meal-Prep'], ['recent', 'Zuletzt'], ['search', 'Suche'], ['new', 'Neu']];
  let body = '';
  if (ui.foodTab === 'presets') { const custom = Object.values(S.foods).filter(f => f.src === 'custom'); body = '<div class="plist">' + PRESET_FOODS.map(f => foodRow(getFood(f.id))).join('') + custom.map(foodRow).join('') + '</div>'; }
  else if (ui.foodTab === 'recent') body = S.recent.length ? '<div class="plist">' + S.recent.map(getFood).filter(Boolean).map(foodRow).join('') + '</div>' : '<p class="muted">Noch nichts geloggt.</p>';
  else if (ui.foodTab === 'search') body = '<div class="row on-white"><input id="q" type="search" placeholder="z. B. Skyr, Lachs, Haferflocken" class="grow" enterkeyhint="search"><button class="btn brand" data-act="search" type="button">Suchen</button></div><div id="results" class="plist" style="margin-top:8px"><p class="small muted">Daten von Open Food Facts, Werte pro 100 g.</p></div>';
  else body = foodForm(null);
  openSheet(sheetHead(esc(ui.meal)) + '<div class="row" style="margin-top:12px"><button class="btn brand block" data-act="scan" type="button">' + ICON.scan + 'Barcode scannen</button></div><div class="seg">' + tabs.map(t => '<button class="' + (ui.foodTab === t[0] ? 'on' : '') + '" data-act="ftab" data-t="' + t[0] + '" type="button">' + t[1] + '</button>').join('') + '</div>' + body);
  if (ui.foodTab === 'search') setTimeout(() => { const q = $('#q'); if (q) q.focus(); }, 60); }
function qtySheet(id, entry) { const f = getFood(id); if (!f) return; const units = unitsFor(f); const unit = entry ? entry.unit : units[0]; const qty = entry ? entry.qty : (unit === 'g' ? (f.pieceG && f.src === 'off' ? f.pieceG : 100) : 1);
  openSheet(sheetHead(esc(f.name)) + (f.brand ? '<p class="small muted">' + esc(f.brand) + (f.code ? ' · ' + esc(f.code) : '') + '</p>' : '') +
    '<div class="fields on-white" style="margin:14px 0"><div class="field"><label for="qq">Menge</label><input id="qq" type="number" inputmode="decimal" step="any" value="' + qty + '"></div><div class="field"><label for="qu">Einheit</label><select id="qu">' + units.map(u => '<option' + (u === unit ? ' selected' : '') + '>' + u + '</option>').join('') + '</select></div>' +
    (entry ? '' : '<div class="field"><label for="qm">Mahlzeit</label><select id="qm">' + MEALS.map(m => '<option' + (m === ui.meal ? ' selected' : '') + '>' + m + '</option>').join('') + '</select></div>') + '</div>' +
    '<div id="qprev" class="card" style="padding:14px 18px"></div><div class="row" style="margin-top:14px">' + (entry ? '<button class="btn danger" style="background:var(--fog)" data-act="delEntry" data-uid="' + entry.uid + '" type="button">Löschen</button>' : '') + '<div class="grow"></div><button class="btn sm" style="background:var(--fog)" data-act="editFood" data-id="' + esc(id) + '" type="button">Nährwerte bearbeiten</button><button class="btn brand" data-act="' + (entry ? 'saveEntry' : 'confirmAdd') + '" data-id="' + esc(id) + '"' + (entry ? ' data-uid="' + entry.uid + '"' : '') + ' type="button">' + (entry ? 'Speichern' : 'Hinzufügen') + '</button></div>');
  updatePrev(id); }
function updatePrev(id) { const f = getFood(id); const q = num($('#qq') && $('#qq').value) || 0, u = $('#qu') && $('#qu').value; const m = macrosFor(f, q, u); const el = $('#qprev');
  if (el) el.innerHTML = '<div class="row" style="justify-content:space-between"><span><b class="num">' + fmt(m.kcal, 0) + '</b> kcal</span><span><span class="dot plum"></span> ' + fmt(m.p, 1) + ' g P</span><span><span class="dot sky"></span> ' + fmt(m.c, 1) + ' g KH</span><span><span class="dot green"></span> ' + fmt(m.f, 1) + ' g F</span></div>'; }
function foodForm(f, code) { f = f || { base: '100g', code: code || '' }; const v = k => esc(f[k] ?? '');
  return (code && !f.id ? '<p class="muted" style="margin-top:12px">Barcode ' + esc(code) + ' ist nicht in Open Food Facts. Trag die Werte von der Packung ein. Beim nächsten Scan kennt die App das Produkt.</p>' : '') +
    '<div class="fields on-white" style="margin-top:12px"><div class="field" style="flex:1 1 100%"><label for="ff-name">Name</label><input id="ff-name" type="text" value="' + v('name') + '"></div>' +
    '<div class="field"><label for="ff-base">Werte pro</label><select id="ff-base"><option value="100g"' + (f.base === '100g' ? ' selected' : '') + '>100 g</option><option value="piece"' + (f.base === 'piece' ? ' selected' : '') + '>Stück</option></select></div>' +
    ['kcal', 'p', 'c', 'f'].map(k => '<div class="field"><label for="ff-' + k + '">' + { kcal: 'kcal', p: 'Protein (g)', f: 'Fett (g)', c: 'Kohlenhydrate (g)' }[k] + '</label><input id="ff-' + k + '" type="number" inputmode="decimal" step="any" value="' + v(k) + '"></div>').join('') +
    '<div class="field"><label for="ff-pg">Gramm pro Stück/Portion</label><input id="ff-pg" type="number" inputmode="decimal" step="any" value="' + v('pieceG') + '" placeholder="optional"></div>' +
    '<input type="hidden" id="ff-code" value="' + v('code') + '"></div>' +
    '<div class="row" style="margin-top:16px"><div class="grow"></div><button class="btn brand" data-act="saveFood" data-id="' + esc(f.id || '') + '" type="button">Speichern</button></div>'; }
function offMap(p, partial) { const n = p.nutriments || {}; let kcal = num(n['energy-kcal_100g']); if (kcal == null && num(n.energy_100g) != null) kcal = num(n.energy_100g) / 4.184;
  const brand = Array.isArray(p.brands) ? (p.brands[0] || '') : String(p.brands || '').split(',')[0];
  const name = (p.product_name_de || p.product_name || '').toString().trim();
  if (kcal == null && !(partial && name && p.code)) return null;
  return { id: 'off_' + p.code, code: String(p.code), name: name || 'Ohne Namen', brand: brand.trim(), base: '100g', kcal, p: num(n.proteins_100g) || 0, f: num(n.fat_100g) || 0, c: num(n.carbohydrates_100g) || 0, pieceG: num(p.serving_quantity) || null, src: 'off', needsFetch: kcal == null }; }
const offCache = {};
async function fetchJson(url, ms) { const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms || 9000); try { const r = await fetch(url, { signal: ac.signal }); if (!r.ok && r.status !== 404) throw new Error('HTTP ' + r.status); return await r.json(); } finally { clearTimeout(t); } }
async function offSearch(q) { const res = $('#results'); if (!q || !res) return; const ql = q.toLowerCase();
  const mine = []; const seen = new Set(); [...PRESET_FOODS.map(f => getFood(f.id)), ...Object.values(S.foods)].forEach(f => { if (f && !seen.has(f.id) && f.name.toLowerCase().includes(ql)) { seen.add(f.id); mine.push(f); } });
  const mineHtml = mine.length ? '<div class="lbl" style="margin:10px 0 2px">Deine Lebensmittel</div>' + mine.map(foodRow).join('') : '';
  res.innerHTML = mineHtml + '<p class="small muted">Suche in Open Food Facts …</p>';
  const enc = encodeURIComponent(q), F = 'code,product_name,product_name_de,brands,nutriments,serving_quantity';
  const sources = [
    { url: 'https://search.openfoodfacts.org/search?q=' + enc + '&langs=de,en&page_size=40&fields=' + F, pick: j => j.hits },
    { url: 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + enc + '&search_simple=1&action=process&json=1&page_size=30&fields=' + F, pick: j => j.products } ];
  let items = null; const errs = [];
  for (const src of sources) { try { const j = await fetchJson(src.url, 10000); const list = (src.pick(j) || []).map(p => offMap(p, true)).filter(Boolean); if (list.length) { items = list; break; } if (items == null) items = []; }
    catch (e) { errs.push(e.name === 'AbortError' ? 'Zeitüberschreitung' : e.message); } }
  if (!$('#results')) return;
  if (items && items.length) { items.sort((a, b) => (a.needsFetch ? 1 : 0) - (b.needsFetch ? 1 : 0)); items.forEach(f => offCache[f.id] = f);
    res.innerHTML = mineHtml + '<div class="lbl" style="margin:10px 0 2px">Open Food Facts</div>' + items.map(foodRow).join(''); return; }
  res.innerHTML = mineHtml + (items ? '<p class="small muted">In Open Food Facts nichts gefunden. Anders formulieren, Barcode scannen oder unter „Neu“ selbst anlegen.</p>'
    : '<p class="small muted">Open Food Facts ist gerade nicht erreichbar (' + esc(errs.join(', ')) + '). Barcode-Scan oder „Neu“ funktionieren trotzdem.</p>'); }
async function lookupBarcode(code) { code = String(code || '').replace(/\D/g, ''); if (!code) return;
  const known = Object.values(S.foods).find(f => f.code === code); if (known) { qtySheet(known.id); return; }
  openSheet(sheetHead('Barcode ' + esc(code)) + '<p class="muted">Suche in Open Food Facts …</p>');
  try { const j = await fetchJson('https://world.openfoodfacts.org/api/v2/product/' + code + '.json?fields=code,product_name,product_name_de,brands,nutriments,serving_quantity');
    const f = j && j.product ? offMap(Object.assign({ code }, j.product)) : null;
    if (!f) { openSheet(sheetHead('Neues Produkt') + foodForm(null, code)); return; }
    S.foods[f.id] = f; save(); qtySheet(f.id);
  } catch (e) { openSheet(sheetHead('Barcode ' + esc(code)) + '<p class="muted">Open Food Facts ist gerade nicht erreichbar. Du kannst das Produkt selbst anlegen.</p>' + foodForm(null, code)); } }

/* ---------- Barcode-Scanner ---------- */
const SCAN = { stream: null, timer: null, reader: null, last: null, hits: 0, torch: false };
function validEan(c) { if (!/^\d{8}$|^\d{12,13}$/.test(c)) return false; const d = c.split('').map(Number); const chk = d.pop(); let s = 0; d.reverse().forEach((x, i) => s += x * (i % 2 === 0 ? 3 : 1)); return (10 - s % 10) % 10 === chk; }
function loadScript(src) { return new Promise((res, rej) => { if (document.querySelector('script[src="' + src + '"]')) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Laden fehlgeschlagen')); document.head.appendChild(s); }); }
async function openScanner() { closeSheet(); const sc = $('#scanner'), v = $('#scanVideo'), msg = $('#scanMsg'); sc.hidden = false; $('#scanCode').value = ''; msg.textContent = 'Kamera wird gestartet …'; SCAN.last = null; SCAN.hits = 0;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg.textContent = 'Kamera ist hier nicht verfügbar. Gib die Nummer unter dem Strichcode ein.'; return; }
  try { SCAN.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }); }
  catch (e) { msg.textContent = e.name === 'NotAllowedError' ? 'Kamerazugriff verweigert. Erlaube die Kamera in den App-Einstellungen oder tippe die Nummer ein.' : 'Kamera nicht verfügbar (' + e.name + '). Nummer unten eingeben.'; return; }
  const track = SCAN.stream.getVideoTracks()[0]; try { const caps = track.getCapabilities ? track.getCapabilities() : {}; $('#torchBtn').hidden = !caps.torch; } catch (e) { $('#torchBtn').hidden = true; }
  msg.textContent = 'Strichcode in den Rahmen halten';
  let native = false; if ('BarcodeDetector' in window) { try { const f = await BarcodeDetector.getSupportedFormats(); native = f.includes('ean_13'); } catch (e) { native = false; } }
  if (native) { v.srcObject = SCAN.stream; await v.play().catch(() => {}); const det = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
    SCAN.timer = setInterval(async () => { if (v.readyState < 2) return; try { const r = await det.detect(v); if (r.length) gotCode(r[0].rawValue); } catch (e) {} }, 180); }
  else { try { await loadScript('vendor/zxing.min.js'); const hints = new Map(); hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8, ZXing.BarcodeFormat.UPC_A, ZXing.BarcodeFormat.UPC_E]); hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
      SCAN.reader = new ZXing.BrowserMultiFormatReader(hints, 200); SCAN.reader.decodeFromStream(SCAN.stream, v, (res) => { if (res) gotCode(res.getText()); }); }
    catch (e) { msg.textContent = 'Scanner konnte nicht starten (' + e.message + '). Nummer unten eingeben.'; } } }
function gotCode(c) { c = String(c).replace(/\D/g, ''); if (c.length === 12) c = '0' + c; if (!validEan(c)) return;
  if (SCAN.last === c) SCAN.hits++; else { SCAN.last = c; SCAN.hits = 1; } if (SCAN.hits < 2) return;
  if (navigator.vibrate) navigator.vibrate(60); closeScanner(); lookupBarcode(c); }
function closeScanner() { clearInterval(SCAN.timer); SCAN.timer = null; if (SCAN.reader) { try { SCAN.reader.reset(); } catch (e) {} SCAN.reader = null; }
  if (SCAN.stream) { SCAN.stream.getTracks().forEach(t => t.stop()); SCAN.stream = null; } const v = $('#scanVideo'); v.srcObject = null; SCAN.torch = false; $('#torchBtn').classList.remove('on'); $('#scanner').hidden = true; }
async function toggleTorch() { if (!SCAN.stream) return; const t = SCAN.stream.getVideoTracks()[0]; SCAN.torch = !SCAN.torch; try { await t.applyConstraints({ advanced: [{ torch: SCAN.torch }] }); $('#torchBtn').classList.toggle('on', SCAN.torch); } catch (e) { SCAN.torch = false; } }

/* ======================= GESUNDHEIT: HEALTH CONNECT & ZEPP ======================= */
const HEALTH = { get plugin() { const C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.Health; }, get native() { return !!this.plugin; }, busy: false };
const HC_READ = ['steps', 'heartRate', 'restingHeartRate', 'sleep', 'workouts', 'weight', 'calories', 'vo2Max'];
async function hcConnect() { const H = HEALTH.plugin; if (!H) return;
  try { const av = await H.isAvailable(); if (!av.available) { toast('Health Connect fehlt: ' + (av.reason || 'bitte installieren')); try { await H.openHealthConnectSettings(); } catch (e) {} return; }
    const st = await H.requestAuthorization({ read: HC_READ, requestHistoryAccess: true }); S.healthMeta.granted = st.readAuthorized || []; S.healthMeta.denied = st.readDenied || []; S.healthMeta.source = 'hc'; save();
    if (!(st.readAuthorized || []).length) { toast('Keine Berechtigung erteilt.'); render(); return; }
    await hcSync(true); } catch (e) { toast('Verbinden fehlgeschlagen: ' + (e.message || e)); } }
async function hcSync(full) { const H = HEALTH.plugin; if (!H || HEALTH.busy) return; HEALTH.busy = true; const t0 = Date.now();
  const days = full || !S.healthMeta.lastSync ? 60 : 10; const end = new Date(); const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1);
  const range = { startDate: start.toISOString(), endDate: end.toISOString() }; const errs = []; const grant = S.healthMeta.granted && S.healthMeta.granted.length ? S.healthMeta.granted : HC_READ; const ok = t => grant.includes(t);
  const loc = s => iso(new Date(s));
  const safe = async (name, fn) => { try { await fn(); } catch (e) { errs.push(name); console.warn(name, e); } };
  await safe('Schritte', async () => { if (!ok('steps')) return; const r = await H.queryAggregated({ dataType: 'steps', bucket: 'day', aggregation: 'sum', ...range }); (r.samples || []).forEach(x => setHealth(loc(x.startDate), { steps: Math.round(x.value) }, 'hc')); });
  await safe('Kalorien', async () => { if (!ok('calories')) return; const r = await H.queryAggregated({ dataType: 'calories', bucket: 'day', aggregation: 'sum', ...range }); (r.samples || []).forEach(x => setHealth(loc(x.startDate), { kcal: Math.round(x.value) }, 'hc')); });
  await safe('Puls', async () => { if (!ok('heartRate')) return; const r = await H.queryAggregated({ dataType: 'heartRate', bucket: 'day', aggregation: ['average', 'min', 'max'], ...range });
    (r.samples || []).forEach(x => { const v = x.values || {}; const d = loc(x.startDate); setHealth(d, { hrAvg: v.average != null ? Math.round(v.average) : null, hrMin: v.min != null ? Math.round(v.min) : null, hrMax: v.max != null ? Math.round(v.max) : null }, 'hc'); }); });
  await safe('Ruhepuls', async () => { if (!ok('restingHeartRate')) return; const r = await H.readSamples({ dataType: 'restingHeartRate', limit: 500, ascending: true, ...range }); (r.samples || []).forEach(x => setHealth(loc(x.startDate), { rhr: Math.round(x.value) }, 'hc')); });
  /* ohne Ruhepuls-Records: Tagesminimum als Schätzung (gleiche Methode jeden Tag, darum als Vergleich brauchbar) */
  Object.keys(S.health).forEach(d => { const h = S.health[d]; if (h.rhr == null && h.hrMin != null) h.rhrEst = h.hrMin; });
  await safe('Schlaf', async () => { if (!ok('sleep')) return; const r = await H.readSamples({ dataType: 'sleep', limit: 300, ascending: true, ...range }); const agg = {};
    (r.samples || []).forEach(x => { const d = loc(x.endDate); const a = agg[d] || (agg[d] = { sleepMin: 0, deep: 0, rem: 0, light: 0, awake: 0, main: 0 });
      let asleep = x.value; if (x.stages && x.stages.length) { asleep = 0; x.stages.forEach(st => { const m = st.durationMinutes || 0; if (st.stage === 'deep') a.deep += m; else if (st.stage === 'rem') a.rem += m; else if (st.stage === 'light') a.light += m; else if (st.stage === 'awake') a.awake += m; if (st.stage !== 'awake' && st.stage !== 'inBed') asleep += m; }); }
      a.sleepMin += asleep; a.main = Math.max(a.main, asleep); });
    Object.keys(agg).forEach(d => { const a = agg[d]; setHealth(d, { sleepMin: Math.round(a.sleepMin), deep: Math.round(a.deep) || null, rem: Math.round(a.rem) || null, light: Math.round(a.light) || null, awake: Math.round(a.awake) || null }, 'hc'); }); });
  await safe('Gewicht', async () => { if (!ok('weight')) return; const r = await H.readSamples({ dataType: 'weight', limit: 200, ascending: true, ...range }); (r.samples || []).forEach(x => { const d = loc(x.startDate); const o = dayObj(d); if (num(o.weight) == null) { o.weight = String(Math.round(x.value * 10) / 10); o.weightSrc = 'hc'; } }); });
  await safe('VO2max', async () => { if (!ok('vo2Max')) return; const r = await H.readSamples({ dataType: 'vo2Max', limit: 100, ascending: true, ...range }); (r.samples || []).forEach(x => setHealth(loc(x.startDate), { vo2: Math.round(x.value * 10) / 10 }, 'hc')); });
  let nw = 0; await safe('Workouts', async () => { if (!ok('workouts')) return; const r = await H.queryWorkouts({ limit: 200, ascending: true, ...range });
    (r.workouts || []).forEach(x => { if (importWorkout({ key: 'hc:' + (x.platformId || x.startDate), date: loc(x.startDate), type: HC_TYPE[x.workoutType] || 'sonst', title: null, dur: x.duration / 60, dist: x.totalDistance ? x.totalDistance / 1000 : null, kcal: x.totalEnergyBurned || null, src: 'hc' })) nw++; }); });
  S.healthMeta.lastSync = new Date().toISOString(); S.healthMeta.source = 'hc'; save(); HEALTH.busy = false;
  toast(errs.length ? 'Teilweise synchronisiert. Fehlt: ' + errs.join(', ') : 'Zepp-Daten aktualisiert' + (nw ? ' · ' + nw + ' neue Workouts' : '')); render(); }
/* Workout aus Uhr: an Plan-Einheit hängen oder als freie Aktivität anlegen */
function importWorkout(x) { if (S.healthMeta.ignored.includes(x.key) || S.activities.some(a => a.key === x.key)) return false; if (!x.dur || x.dur < 5) return false;
  for (let w = 1; w <= 12; w++) for (const k of ['A', 'B', 'C']) { const s = peekSess(w, k); if (s && s.date === x.date && x.type === 'kraft' && !s.watch) { s.watch = { dur: x.dur, kcal: x.kcal, key: x.key }; S.healthMeta.ignored.push(x.key); return false; } }
  S.activities.push({ id: uid(), key: x.key, type: x.type, title: x.title, date: x.date, week: curWeek(), dur: Math.round(x.dur), dist: x.dist != null ? Math.round(x.dist * 100) / 100 : null, kcal: x.kcal != null ? Math.round(x.kcal) : null, avgHr: x.avgHr || null, src: x.src }); return true; }

/* Zepp-Export (CSV oder unverschlüsselte ZIP) */
function parseCSV(text) { const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) { const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { row.push(cur); cur = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; } else cur += ch; }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const head = (rows.shift() || []).map(h => h.trim().replace(/^﻿/, '')); return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()]))); }
function parseTs(v) { if (v == null || v === '') return null; if (/^\d{13}$/.test(v)) return new Date(+v); if (/^\d{10}$/.test(v)) return new Date(+v * 1000);
  const d = new Date(String(v).replace(' ', 'T').replace(/\+0000$/, 'Z').replace(/([+-]\d\d)(\d\d)$/, '$1:$2')); return isNaN(d) ? null : d; }
function importZeppRows(rows, stat) { if (!rows.length) return; const cols = Object.keys(rows[0]).map(c => c.toLowerCase()); const has = c => cols.includes(c.toLowerCase()); const get = (r, c) => { const k = Object.keys(r).find(x => x.toLowerCase() === c.toLowerCase()); return k ? r[k] : undefined; };
  if (has('deepSleepTime')) { rows.forEach(r => { const stop = parseTs(get(r, 'stop')); const d = stop ? iso(stop) : get(r, 'date'); const deep = num(get(r, 'deepSleepTime')) || 0, light = num(get(r, 'shallowSleepTime')) || 0, rem = num(get(r, 'REMTime')) || 0, awake = num(get(r, 'wakeTime')) || 0;
      const tot = deep + light + rem; if (d && tot > 0) { setHealth(d, { sleepMin: tot, deep, light, rem: rem || null, awake: awake || null }, 'zepp'); stat.sleep++; } }); return; }
  if (has('heartRate') && has('time') && has('date')) { const by = {}; rows.forEach(r => { const v = num(get(r, 'heartRate')); if (v == null || v < 30 || v > 220) return; (by[get(r, 'date')] = by[get(r, 'date')] || []).push(v); });
    Object.keys(by).forEach(d => { const a = by[d].sort((x, y) => x - y); const low = a.slice(0, Math.min(5, a.length)); setHealth(d, { rhrEst: Math.round(low.reduce((s, x) => s + x, 0) / low.length), hrAvg: Math.round(a.reduce((s, x) => s + x, 0) / a.length), hrMin: a[0], hrMax: a[a.length - 1] }, 'zepp'); stat.hr++; }); return; }
  if (cols.some(c => c.includes('resting'))) { rows.forEach(r => { const k = Object.keys(r).find(x => x.toLowerCase().includes('resting')); const d = get(r, 'date') || (parseTs(get(r, 'time') || get(r, 'timestamp')) && iso(parseTs(get(r, 'time') || get(r, 'timestamp')))); const v = num(r[k]); if (d && v) { setHealth(d, { rhr: Math.round(v) }, 'zepp'); stat.hr++; } }); return; }
  if (has('steps') && has('date') && !has('time')) { rows.forEach(r => { const v = num(get(r, 'steps')); if (v != null && get(r, 'date')) { setHealth(get(r, 'date'), { steps: Math.round(v), kcal: num(get(r, 'calories')) }, 'zepp'); stat.steps++; } }); return; }
  if (has('steps') && has('date') && has('time')) { const by = {}; rows.forEach(r => { by[get(r, 'date')] = (by[get(r, 'date')] || 0) + (num(get(r, 'steps')) || 0); }); Object.keys(by).forEach(d => { if (!S.health[d] || S.health[d].steps == null) { setHealth(d, { steps: by[d] }, 'zepp'); stat.steps++; } }); return; }
  if (has('sportTime') || (has('type') && has('startTime'))) { rows.forEach(r => { const st = parseTs(get(r, 'startTime')); if (!st) return; const type = ZEPP_TYPE[num(get(r, 'type'))] || 'sonst';
      if (importWorkout({ key: 'zepp:' + st.getTime(), date: iso(st), type, title: null, dur: (num(get(r, 'sportTime')) || 0) / 60, dist: num(get(r, 'distance')) ? num(get(r, 'distance')) / 1000 : null, kcal: num(get(r, 'calories')), src: 'zepp' })) stat.workouts++; }); return; }
  if (has('weight')) { rows.forEach(r => { const t = parseTs(get(r, 'time') || get(r, 'timestamp') || get(r, 'date')); const v = num(get(r, 'weight')); if (t && v && v > 30) { const o = dayObj(iso(t)); if (num(o.weight) == null) { o.weight = String(Math.round(v * 10) / 10); o.weightSrc = 'zepp'; stat.weight++; } } }); return; } }
async function importZeppFiles(files) { const stat = { steps: 0, sleep: 0, hr: 0, workouts: 0, weight: 0 }; const texts = []; const dec = new TextDecoder();
  for (const file of files) { const buf = new Uint8Array(await file.arrayBuffer());
    if (/\.zip$/i.test(file.name) || (buf[0] === 0x50 && buf[1] === 0x4b)) { if (buf[6] & 1) { toast('Die ZIP ist passwortgeschützt. Erst mit dem Passwort aus der Zepp-App entpacken, dann die CSV-Dateien wählen.'); return; }
      try { const files2 = fflate.unzipSync(buf); for (const n in files2) if (/\.csv$/i.test(n)) texts.push(dec.decode(files2[n])); } catch (e) { toast('ZIP lässt sich nicht öffnen. Bitte entpacken und die CSV-Dateien wählen.'); return; } }
    else texts.push(dec.decode(buf)); }
  texts.forEach(t => { try { importZeppRows(parseCSV(t), stat); } catch (e) { console.warn(e); } });
  S.healthMeta.lastSync = new Date().toISOString(); if (!HEALTH.native) S.healthMeta.source = 'zepp'; save(); render();
  const parts = []; if (stat.steps) parts.push(stat.steps + ' Tage Schritte'); if (stat.sleep) parts.push(stat.sleep + ' Nächte'); if (stat.hr) parts.push(stat.hr + ' Tage Puls'); if (stat.workouts) parts.push(stat.workouts + ' Workouts'); if (stat.weight) parts.push(stat.weight + ' Gewichte');
  toast(parts.length ? 'Importiert: ' + parts.join(', ') : 'In den Dateien wurden keine bekannten Zepp-Daten gefunden.'); }

/* ======================= VERLAUF ======================= */
function viewProgress() {
  const ser = series(), st = S.settings; const last = ser[ser.length - 1];
  const cur = last ? last.trend : num(st.startWeight); const lost = num(st.startWeight) - cur; const pct = Math.max(0, Math.min(1, lost / (num(st.startWeight) - num(st.targetWeight))));
  const vos = Object.keys(S.health).sort().map(d => S.health[d].vo2).filter(x => x != null).concat(Object.keys(S.body).sort().map(k => num(S.body[k].vo2)).filter(x => x != null)); const v2 = vos.length ? vos[vos.length - 1] : 39;
  const tg = currentTargets(); const rate = weeklyRate(ser);
  const stats = '<div class="stats">' +
    '<div class="stat"><div class="k">Trendgewicht</div><div class="v">' + fmt(cur) + ' kg</div><div class="s">Ziel ' + fmt(num(st.targetWeight), 0) + ' kg</div><div class="meter"><i style="width:' + Math.round(pct * 100) + '%"></i></div></div>' +
    '<div class="stat"><div class="k">Tempo</div><div class="v ' + (rate != null && rate < 0 ? 't-green' : '') + '">' + (rate != null ? (rate <= 0 ? '−' : '+') + fmt(Math.abs(rate), 2) : '–') + '</div><div class="s">kg pro Woche · Ziel −' + fmt(num(st.goalRate), 1) + '</div></div>' +
    '<div class="stat"><div class="k">Bedarf</div><div class="v">' + (last ? fmt(last.est, 0) : '–') + '</div><div class="s">kcal pro Tag · Ziel ' + fmt(tg.kcal, 0) + '</div></div>' +
    '<div class="stat"><div class="k">VO₂max</div><div class="v">' + fmt(v2) + '</div><div class="s">Start 39</div></div></div>';
  const wPts = ser.map((s, i) => ({ x: i, d: s.d, trend: s.trend, weight: s.weight }));
  const eSer = ser.map((s, i) => ({ x: i, d: s.d, est: s.est, intake: s.intake }));
  const hDays = []; for (let i = 27; i >= 0; i--) { const d = addDays(today(), -i); const h = S.health[d] || {}; hDays.push({ d, steps: h.steps ?? null, rhr: h.rhr ?? h.rhrEst ?? null, sleep: h.sleepMin != null ? h.sleepMin / 60 : null }); }
  const hasH = k => hDays.filter(p => p[k] != null).length > 1;
  const lifts = [['fs', 'Front Squat'], ['bench', 'Bankdrücken'], ['dip_w', 'Dips mit Zusatzgewicht'], ['trap', 'Trap Bar']].map(([id, name]) => ({ id, name, pts: liftSeries(id) }));
  const headline = lost > 0.05 ? '<span class="t-green">−' + fmt(lost) + ' kg</span> seit Start' : '<span class="t-ember">Dein</span> Verlauf';
  return '<div class="top"><div class="grow"><h1>' + headline + '</h1><div class="sub">Trendgewicht, Bedarf, Gesundheit und Kraft</div></div><a class="iconbtn" href="#mehr" aria-label="Einstellungen">' + ICON.gear + '</a></div><div class="stack">' + stats +
    '<div class="card"><h2>Gewicht</h2>' + (wPts.length > 1 ? lineChart('cw', wPts, [{ key: 'weight', label: 'Waage', dots: true, color: 'var(--mist)' }, { key: 'trend', label: 'Trend', color: 'var(--ember)' }], { ref: num(st.targetWeight), refLabel: 'Ziel', unit: 'kg', dec: 1 }) : empty('Täglich morgens wiegen. Ab zwei Messungen erscheint die Kurve.')) + '</div>' +
    '<div class="card"><h2>Bedarf und Aufnahme</h2>' + (eSer.length > 1 ? lineChart('ce', eSer, [{ key: 'intake', label: 'Aufnahme', bars: true, color: 'var(--mist)' }, { key: 'est', label: 'Bedarf', color: 'var(--amber)' }], { unit: 'kcal', dec: 0 }) : empty('Der Bedarf wird ab 14 Tagen mit Gewicht und vollständigem Essens-Log geschätzt. Bis dahin gilt dein Startwert.')) +
    '<p class="small muted">Bedarf = Ø Aufnahme minus Änderung des Trendgewichts × 7.700 kcal/kg, über 14 Tage, langsam geglättet.</p></div>' +
    '<div class="card"><h2>Schritte</h2>' + (hasH('steps') ? lineChart('cs', hDays, [{ key: 'steps', label: 'Schritte', bars: true, color: 'var(--verdant)' }], { unit: '', dec: 0, ref: num(st.stepGoal), refLabel: 'Ziel', zero: true, noLegend: true }) : empty('Noch keine Schrittdaten. Verbinde Zepp unter „Einstellungen“.')) + '</div>' +
    '<div class="card"><h2>Ruhepuls</h2>' + (hasH('rhr') ? lineChart('cr', hDays, [{ key: 'rhr', label: 'Ruhepuls', color: 'var(--plum)' }], { unit: 'bpm', dec: 0, noLegend: true }) : empty('Noch keine Pulsdaten.')) + '</div>' +
    '<div class="card"><h2>Schlaf</h2>' + (hasH('sleep') ? lineChart('csl', hDays, [{ key: 'sleep', label: 'Schlaf', bars: true, color: 'var(--iris)' }], { unit: 'h', dec: 1, ref: 7, refLabel: '7 h', zero: true, noLegend: true }) : empty('Noch keine Schlafdaten.')) + '</div>' +
    '<div class="card"><h2>Kraft (geschätztes 1RM)</h2>' + lifts.map(l => '<div style="margin-top:12px"><div class="lbl">' + l.name + '</div>' + (l.pts.length > 1 ? lineChart('cl-' + l.id, l.pts, [{ key: 'v', label: 'e1RM', color: 'var(--iris)' }], { unit: 'kg', dec: 0, height: 130, noLegend: true }) : empty(l.pts.length ? 'Ab der zweiten Einheit gibt es eine Kurve. Aktuell ' + fmt(l.pts[0].v, 0) + ' kg.' : 'Noch keine Sätze mit RPE geloggt.')) + '</div>').join('') + '</div>' +
    exListCard() +
    '<div class="card"><h2>Check-ins</h2>' + (S.checkins.length ? '<div class="tbl"><table><thead><tr><th>Datum</th><th>Trend</th><th>kg/Woche</th><th>Bedarf</th><th>Ziel</th></tr></thead><tbody>' + S.checkins.slice().reverse().map(c => '<tr><td>' + fmtDay(c.date) + '</td><td class="num">' + fmt(c.trend) + '</td><td class="num">' + (c.rate != null ? fmt(c.rate, 2) : '–') + '</td><td class="num">' + fmt(c.tdee, 0) + '</td><td class="num">' + fmt(c.kcal, 0) + '</td></tr>').join('') + '</tbody></table></div>' : empty('Der erste Check-in ist nach 7 Tagen mit Gewicht möglich.')) + '</div></div>'; }
const empty = t => '<p class="small muted">' + esc(t) + '</p>';
function exListCard() { const ids = new Set(); for (let w = 1; w <= 12; w++) ORDER.forEach(k => { const s = peekSess(w, k); if (s && s.logs) Object.values(s.logs).forEach(lg => { if (loggedSets(lg).length) ids.add(lg.ex); }); });
  S.activities.forEach(a => (a.exercises || []).forEach(e => { if (loggedSets(e).length) ids.add(e.ex); }));
  const list = [...ids].filter(id => LIB[id]).map(id => { const h = exHistory(id); const last = h[h.length - 1]; const m = h.some(o => o.e1) ? 'e1' : 'reps'; const v = h.map(o => o[m]).filter(x => x != null);
    return { id, n: h.length, last, m, chg: v.length > 1 && v[0] ? (v[v.length - 1] - v[0]) / Math.abs(v[0]) * 100 : null, cur: v[v.length - 1] }; }).sort((a, b) => (b.last && b.last.ord || '') < (a.last && a.last.ord || '') ? -1 : 1);
  return '<div class="card flush"><div class="meal-h"><b>Alle Übungen</b><span class="small muted">' + list.length + '</span></div>' + (list.length ? '<div class="list">' + list.map(x => '<button class="li" data-act="exHist" data-ex="' + x.id + '" type="button"><div class="grow"><b>' + esc(LIB[x.id].name) + '</b><small>' + x.n + ' Einheiten · ' + (x.m === 'e1' ? 'e1RM ' + fmt(x.cur, 0) + ' kg' : fmt(x.cur, 0) + ' Wdh.') + '</small></div>' + (x.chg != null ? '<span class="tag"><span class="dot ' + (x.chg >= 0 ? 'green' : 'red') + '"></span>' + (x.chg > 0 ? '+' : '') + fmt(x.chg, 0) + ' %</span>' : '') + '<span class="chev">›</span></button>').join('') + '</div>' : '<p class="small muted" style="padding:0 20px 18px">Sobald du Sätze loggst, erscheint hier jede Übung mit ihrem Verlauf.</p>') + '</div>'; }
/* ---------- Verlauf pro Übung ---------- */
function exHistory(exId) { const out = [];
  for (let w = 1; w <= 12; w++) ORDER.forEach(k => { const s = peekSess(w, k); if (!s || !s.logs) return; const sets = [];
    for (const slot in s.logs) { const lg = s.logs[slot]; if (lg.ex !== exId) continue; const spec = planFor(w, k).find(p => p.slot === slot);
      loggedSets(lg).filter(x => x.done || x.r != null).forEach(x => sets.push({ ...x, rpe: x.rpe ?? (spec && spec.rpe) ?? null })); }
    if (sets.length) out.push({ d: s.date || null, wk: w, label: SESS[k].title + ' · Woche ' + w, sets, ord: s.date || ('0000-' + pad(chronIndex(w, k))) }); });
  S.activities.forEach(a => (a.exercises || []).forEach(e => { if (e.ex !== exId) return; const sets = loggedSets(e).filter(x => x.done || x.r != null); if (sets.length) out.push({ d: a.date, wk: a.week, label: 'Freies Training', sets, ord: a.date }); }));
  out.sort((x, y) => x.ord < y.ord ? -1 : 1);
  out.forEach((o, i) => { o.x = i; const ws = o.sets.filter(x => x.w != null && x.r);
    o.e1 = ws.filter(x => x.w > 0).reduce((m, x) => Math.max(m, e1rm(x.w, x.r, Math.min(10, x.rpe ?? 8))), 0) || null;
    o.top = ws.length ? Math.max(...ws.map(x => x.w)) : null;
    o.vol = o.sets.reduce((a, x) => a + (x.w > 0 && x.r ? x.w * x.r : 0), 0) || null;
    o.reps = o.sets.reduce((a, x) => a + (x.r || 0), 0) || null; });
  return out; }
const EX_METRICS = { e1: ['Geschätztes 1RM', 'kg', 1], top: ['Schwerster Satz', 'kg', 1], vol: ['Volumen (kg × Wdh.)', 'kg', 0], reps: ['Wiederholungen gesamt', 'Wdh.', 0] };
function exHistSheet(exId, metric, period) { const ex = LIB[exId]; let all = exHistory(exId);
  const avail = Object.keys(EX_METRICS).filter(m => all.filter(o => o[m] != null).length);
  if (!metric || !avail.includes(metric)) metric = avail.includes('e1') ? 'e1' : avail[0] || 'reps';
  ui.exHist = { exId, metric, period: period || ui.exHist && ui.exHist.period || 'all' }; period = ui.exHist.period;
  const cut = period === '1m' ? addDays(today(), -30) : period === '3m' ? addDays(today(), -91) : null;
  const pts = all.filter(o => !cut || !o.d || o.d >= cut).map((o, i) => ({ ...o, x: i }));
  const [mLab, mUnit, mDec] = EX_METRICS[metric];
  const vals = pts.map(o => o[metric]).filter(v => v != null);
  const best = vals.length ? Math.max(...vals) : null, first = vals[0], last = vals[vals.length - 1];
  const chg = vals.length > 1 && first ? (last - first) / Math.abs(first) * 100 : null;
  const seg = (k, l, cur, act) => '<button class="' + (k === cur ? 'on' : '') + '" data-act="' + act + '" data-v="' + k + '" type="button">' + l + '</button>';
  const chart = pts.filter(o => o[metric] != null).length > 1 ? lineChart('exh', pts, [{ key: metric, label: mLab, color: 'var(--ember)' }], { unit: mUnit, dec: mDec, noLegend: true, height: 210 })
    : '<p class="muted">' + (pts.length ? 'Ab der zweiten Einheit erscheint hier die Kurve.' : 'Für diese Übung ist noch nichts geloggt.') + '</p>';
  const rows = pts.slice().reverse().map(o => '<div class="it" style="cursor:default"><div class="grow"><b>' + (o.d ? fmtDay(o.d) : 'Woche ' + o.wk) + '</b><small>' + esc(o.label) + '</small><small>' + esc(o.sets.map(x => (x.w != null ? fmt(x.w) + ' × ' : '') + (x.r ?? '–') + (x.rpe != null ? ' @' + fmt(x.rpe) : '')).join(', ')) + '</small></div><div class="end"><b class="num" style="color:var(--graphite)">' + (o[metric] != null ? fmt(o[metric], mDec) : '–') + '</b><br>' + mUnit + '</div></div>').join('');
  openSheet(sheetHead(esc(ex.name)) +
    '<div class="seg">' + avail.map(m => seg(m, EX_METRICS[m][0], metric, 'exMetric')).join('') + '</div>' +
    '<div class="seg" style="margin-top:-6px">' + [['all', 'Alles'], ['3m', '3 Monate'], ['1m', '1 Monat']].map(p => seg(p[0], p[1], period, 'exPeriod')).join('') + '</div>' +
    '<div class="stats" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="stat"><div class="k">Bestwert</div><div class="v" style="font-size:22px">' + (best != null ? fmt(best, mDec) : '–') + '</div><div class="s">' + mUnit + '</div></div>' +
    '<div class="stat"><div class="k">Zuletzt</div><div class="v" style="font-size:22px">' + (last != null ? fmt(last, mDec) : '–') + '</div><div class="s">' + mUnit + '</div></div>' +
    '<div class="stat"><div class="k">Veränderung</div><div class="v ' + (chg > 0 ? 't-green' : chg < 0 ? 't-red' : '') + '" style="font-size:22px">' + (chg != null ? (chg > 0 ? '+' : '') + fmt(chg, 0) + ' %' : '–') + '</div><div class="s">seit ' + (period === 'all' ? 'Start' : 'Beginn') + '</div></div></div>' +
    '<div class="card" style="margin-top:12px;padding:16px">' + chart + '</div>' +
    (metric === 'e1' ? '<p class="small muted">e1RM = Gewicht × (1 + (Wdh. + Wdh. in Reserve) / 30). Ohne RPE-Eintrag wird die Plan-RPE angenommen.</p>' : '') +
    (rows ? '<h3 style="margin:16px 0 4px">Alle Einheiten</h3><div class="plist">' + rows + '</div>' : '')); }
function prCheck(exId, w, k, set) { const x = { w: num(set.w), r: num(set.r), rpe: num(set.rpe) }; if (!x.w || x.w <= 0 || !x.r) return;
  const key = sKey(w, k); const before = exHistory(exId).filter(o => !(o.label.startsWith(SESS[k].title) && o.wk === w)).reduce((m, o) => Math.max(m, o.e1 || 0), 0);
  const spec = planFor(w, k).find(p => (sess(w, k).logs[p.slot] || {}).ex === exId); const v = e1rm(x.w, x.r, Math.min(10, x.rpe ?? (spec && spec.rpe) ?? 8));
  if (before > 0 && v > before * 1.005) setTimeout(() => toast('Neuer Rekord: e1RM ' + fmt(v, 0) + ' kg (vorher ' + fmt(before, 0) + ')'), 400); }
function liftSeries(exId) { const out = []; for (let w = 1; w <= 12; w++) ORDER.forEach(k => { const s = peekSess(w, k); if (!s) return; let best = null;
  for (const slot in s.logs) { const lg = s.logs[slot]; if (lg.ex !== exId) continue; const spec = planFor(w, k).find(p => p.slot === slot);
    loggedSets(lg).forEach(x => { if (!x.w || !x.r) return; const v = e1rm(x.w, x.r, Math.min(10, x.rpe ?? (spec && spec.rpe) ?? 8)); if (!best || v > best) best = v; }); }
  if (best) out.push({ x: out.length, d: s.date || null, v: best, wk: w }); }); return out; }
const CHARTS = {};
function lineChart(id, pts, ser, o) {
  const W = 640, H = o.height || 200, L = 46, R = 14, T = 14, B = 26; const vals = [];
  ser.forEach(s => pts.forEach(p => { if (p[s.key] != null) vals.push(p[s.key]); })); if (o.ref != null) vals.push(o.ref);
  let lo = Math.min(...vals), hi = Math.max(...vals); if (o.zero) lo = 0; else { const padv = (hi - lo) * 0.1 || Math.abs(hi) * 0.05 || 1; lo -= padv; }
  hi += (hi - lo) * 0.06 || 1; const raw = (hi - lo) / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), nr = raw / mag; const step = (nr <= 1 ? 1 : nr <= 2 ? 2 : nr <= 2.5 ? 2.5 : nr <= 5 ? 5 : 10) * mag; lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step; const nt = Math.round((hi - lo) / step);
  const n = pts.length; const X = i => L + (n === 1 ? 0 : i / (n - 1) * (W - L - R)); const Y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  let g = ''; for (let i = 0; i <= nt; i++) { const v = lo + step * i; g += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="ax" x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + fmt(v, step < 1 ? 1 : 0) + '</text>'; }
  const lab = i => { const d = pts[i].d; return d ? parseISO(d).getDate() + '.' + (parseISO(d).getMonth() + 1) + '.' : pts[i].wk ? 'W' + pts[i].wk : ''; };
  g += '<text class="ax" x="' + L + '" y="' + (H - 6) + '">' + lab(0) + '</text><text class="ax" x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">' + lab(n - 1) + '</text>';
  if (o.ref != null) g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(o.ref) + '" y2="' + Y(o.ref) + '" stroke="var(--graphite)" stroke-dasharray="5 5" stroke-width="1.5" opacity=".55"/><text class="ax" x="' + (W - R) + '" y="' + (Y(o.ref) - 6) + '" text-anchor="end">' + (o.refLabel || '') + ' ' + fmt(o.ref, o.dec) + '</text>';
  ser.forEach(s => {
    if (s.bars) { const bw = Math.max(3, (W - L - R) / n - 3); pts.forEach((p, i) => { if (p[s.key] == null) return; const y = Y(p[s.key]), y0 = Y(Math.max(lo, 0)); g += '<rect x="' + (X(i) - bw / 2) + '" y="' + Math.min(y, y0) + '" width="' + bw + '" height="' + Math.max(1, Math.abs(y0 - y)) + '" rx="3" fill="' + s.color + '"/>'; }); }
    else if (s.dots) pts.forEach((p, i) => { if (p[s.key] != null) g += '<circle cx="' + X(i) + '" cy="' + Y(p[s.key]) + '" r="4" fill="' + s.color + '" stroke="var(--fog)" stroke-width="2"/>'; });
    else { let dp = '', st = false; pts.forEach((p, i) => { if (p[s.key] == null) return; dp += (st ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p[s.key]).toFixed(1); st = true; });
      g += '<path d="' + dp + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
      let li = -1; pts.forEach((p, i) => { if (p[s.key] != null) li = i; }); if (li >= 0) g += '<circle cx="' + X(li) + '" cy="' + Y(pts[li][s.key]) + '" r="5" fill="' + s.color + '" stroke="var(--fog)" stroke-width="2"/>'; } });
  g += '<line id="' + id + '-x" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--graphite)" stroke-width="1" visibility="hidden"/>';
  CHARTS[id] = { pts, ser, X, L, R, W, o };
  const legend = o.noLegend ? '' : '<div class="clegend">' + ser.map(s => '<span><i class="' + (s.dots ? 'dot' : '') + '" style="background:' + s.color + '"></i>' + s.label + '</span>').join('') + '</div>';
  return '<div class="chart" data-chart="' + id + '"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Diagramm">' + g + '<rect x="' + L + '" y="0" width="' + (W - L - R) + '" height="' + H + '" fill="transparent"/></svg><div class="tip"></div></div>' + legend; }
function chartHover(e) { const box = e.target.closest('.chart'); if (!box) return; const c = CHARTS[box.dataset.chart]; if (!c) return; const svg = box.querySelector('svg'); const r = svg.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width * c.W; const n = c.pts.length; let i = Math.round((px - c.L) / (c.W - c.L - c.R) * (n - 1)); i = Math.max(0, Math.min(n - 1, i));
  const p = c.pts[i]; const xl = svg.querySelector('#' + CSS.escape(box.dataset.chart) + '-x'); xl.setAttribute('x1', c.X(i)); xl.setAttribute('x2', c.X(i)); xl.setAttribute('visibility', 'visible');
  const tip = box.querySelector('.tip'); tip.innerHTML = (p.d ? fmtDay(p.d) : p.wk ? 'Woche ' + p.wk : '') + '<br>' + c.ser.map(s => s.label + ': ' + (p[s.key] != null ? fmt(p[s.key], c.o.dec) + (c.o.unit ? ' ' + c.o.unit : '') : '–')).join('<br>');
  tip.style.display = 'block'; const x = c.X(i) / c.W * r.width; tip.style.left = Math.max(60, Math.min(r.width - 60, x)) + 'px'; tip.style.top = '24px'; }
function chartLeave(box) { box.querySelector('.tip').style.display = 'none'; const xl = box.querySelector('line[id$="-x"]'); if (xl) xl.setAttribute('visibility', 'hidden'); }

/* ======================= EINSTELLUNGEN ======================= */
function viewMehr() { const st = S.settings; const f = (k, lab, type, extra) => '<div class="field"><label for="st-' + k + '">' + lab + '</label><input id="st-' + k + '" type="' + (type || 'number') + '" inputmode="decimal" step="any" data-st="' + k + '" value="' + esc(st[k]) + '"' + (extra || '') + '></div>';
  const sel = k => '<div class="field"><label for="dm-' + k + '">' + SESS[k].title + '</label><select id="dm-' + k + '" data-dm="' + k + '"><option value="">ohne festen Tag</option>' + [1, 2, 3, 4, 5, 6, 0].map(d => '<option value="' + d + '"' + (String(st.dayMap[k]) === String(d) ? ' selected' : '') + '>' + WD_LONG[d] + '</option>').join('') + '</select></div>';
  let rows = ''; for (let w = 1; w <= 12; w++) { const b = S.body['w' + pad(w)] || {}; const c = (k, ph) => '<td><input id="b-' + w + k + '" type="number" inputmode="decimal" step="any" data-bw="' + w + '" data-bf="' + k + '" value="' + esc(b[k]) + '" placeholder="' + ph + '"></td>'; rows += '<tr><td>Woche ' + w + '</td>' + c('waist', 'cm') + c('vo2', '') + '</tr>'; }
  const warn = scheduleWarnings(); const base = rhrBaseline(); const hm = S.healthMeta;
  const healthCard = HEALTH.native ?
    '<div class="card"><h2>Zepp über Health Connect</h2><p>Zepp schreibt Schritte, Puls, Ruhepuls, Schlaf, Gewicht und Workouts in Health Connect. Die App liest sie von dort.</p>' +
    '<ol class="rules small"><li>In der Zepp-App: Profil → Mit Drittanbietern verbinden → Health Connect einschalten.</li><li>Hier auf „Verbinden“ tippen und alle Lese-Rechte erlauben.</li></ol>' +
    '<div class="row" style="margin-top:14px"><button class="btn brand" data-act="hcConnect" type="button">' + (hm.source === 'hc' ? 'Berechtigungen prüfen' : 'Verbinden') + '</button><button class="btn" data-act="hcSync" type="button">' + ICON.sync + 'Jetzt synchronisieren</button><button class="btn" data-act="hcSettings" type="button">Health Connect öffnen</button></div>' +
    (hm.lastSync ? '<p class="small muted">Zuletzt: ' + new Date(hm.lastSync).toLocaleString('de-DE') + (hm.denied && hm.denied.length ? ' · nicht erlaubt: ' + hm.denied.join(', ') : '') + '</p>' : '') + '</div>'
    : '<div class="card"><h2>Zepp verbinden</h2><p>Die direkte Verbindung läuft über Health Connect und funktioniert nur in der Android-App. Im Browser kannst du deinen Zepp-Datenexport importieren.</p>' +
    '<ol class="rules small"><li>Zepp-App: Profil → Einstellungen → Konto → Daten exportieren. Du bekommst einen Link und ein Passwort.</li><li>ZIP mit dem Passwort entpacken (am Handy z. B. mit ZArchiver).</li><li>Hier die CSV-Dateien auswählen (ACTIVITY, SLEEP, HEARTRATE_AUTO, SPORT, BODY).</li></ol>' +
    '<div class="row" style="margin-top:14px"><button class="btn brand" data-act="zepp" type="button">Zepp-Dateien importieren</button></div>' + (hm.lastSync ? '<p class="small muted">Letzter Import: ' + new Date(hm.lastSync).toLocaleString('de-DE') + '</p>' : '') + '</div>';
  return '<a href="#heute" class="back">' + ICON.back + 'Heute</a><div class="top"><div class="grow"><h1><span class="t-ember">Einstellungen</span> und Daten</h1></div></div><div class="stack">' +
  '<div class="card"><h2>Wochentage</h2><p style="margin-bottom:14px">Leg fest, an welchem Tag du welche Einheit machst. Der Block startet mit deiner ersten Einheit, egal an welchem Tag. Eine Woche ist geschafft, wenn alle fünf Einheiten erledigt sind.</p><div class="fields">' + ORDER.map(sel).join('') + '</div>' +
  warn.map(x => '<p class="small t-amber" style="font-weight:700">' + esc(x) + '</p>').join('') + '<p class="small muted">Faustregel: kein HIIT am Tag vor Gym A oder Gym C, und zwischen zwei Gym-Tagen möglichst ein anderer Tag.</p>' +
  '<div class="row" style="margin-top:10px"><span class="grow small">Aktuelle Trainingswoche: <b>' + curWeek() + '</b></span><button class="btn sm" data-act="wkMinus" type="button">−</button><button class="btn sm" data-act="wkPlus" type="button">+</button></div></div>' +
  healthCard +
  '<div class="card"><h2>Training</h2><div class="fields">' + f('hfmax', 'Maximalpuls') + f('rhrBase', 'Ruhepuls-Basis (manuell)') + f('puStart', 'Klimmzüge Start') + f('stepGoal', 'Schrittziel') + '</div><p class="small muted">' + (base && base.auto ? 'Ruhepuls-Basis automatisch aus Zepp: ' + base.v + ' bpm (Median der letzten ' + base.n + ' Tage). Der manuelle Wert gilt nur, wenn Daten fehlen.' : 'Mit Zepp-Daten berechnet die App die Basis selbst.') + ' Maximalpuls geschätzt (208 − 0,7 × Alter). Hat deine Uhr einen höheren Wert gemessen, nimm den.</p></div>' +
  '<div class="card"><h2>Ernährung</h2><div class="fields">' + f('startKcal', 'Start-Kalorien') + f('tdee0', 'Start-Bedarf') + f('goalRate', 'Ziel kg pro Woche') + f('protein', 'Protein (g)') + f('fat', 'Fett (g)') + f('floor', 'Kalorien-Minimum') + f('startWeight', 'Startgewicht') + f('targetWeight', 'Zielgewicht') + '</div>' +
  '<p class="small muted">Der Start-Bedarf ist nur der Anfangswert. Die App ersetzt ihn Schritt für Schritt durch deinen echten Bedarf. Beim Check-in ändert sich das Ziel höchstens um 300 kcal und fällt nie unter das Minimum.</p></div>' +
  '<div class="card"><h2>Wöchentliche Messwerte</h2><div class="tbl"><table><thead><tr><th>Woche</th><th>Bauch</th><th>VO₂max</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
  '<div class="card"><h2>Sicherung</h2><p>Alle Daten liegen nur auf diesem Gerät. Sichere regelmäßig, vor allem vor einem Handywechsel oder dem Umstieg von der Web-App auf die Android-App.</p><div class="row" style="margin-top:14px"><button class="btn" data-act="export" type="button">Sicherung exportieren</button><button class="btn" data-act="import" type="button">Sicherung laden</button><button class="btn" data-act="pasteImport" type="button">Aus Text laden</button></div><div id="backupBox"></div></div>' +
  '<div class="card"><h2>App-Version</h2><p>' + (HEALTH.native ? 'Android-App' : 'Web-App') + ' · Build ' + (BUILD.local != null ? BUILD.local : '–') + '</p>' + (HEALTH.native ? '<div class="row" style="margin-top:12px">' + (updateAvailable() ? '<a class="btn brand" href="' + APK_URL + '">Build ' + BUILD.remote + ' laden</a>' : '<button class="btn" data-act="checkUpdate" type="button">Nach Updates suchen</button>') + '</div>' : '<p class="small muted">Die Web-App aktualisiert sich beim Öffnen von selbst.</p>') + '</div>' +
  '<div class="card"><h2>Regeln und Evidenz</h2><ul class="rules">' +
  '<li><b>Schwerpunkt Waden, Hamstrings, Bizeps, Bauch:</b> 12–20 Sätze pro Woche, auf 2–3 Tage verteilt. Mehr Volumen bringt mehr Wachstum, aber mit abnehmendem Ertrag (Schoenfeld 2017, Pelland 2024).</li>' +
  '<li><b>Intensität:</b> Isolationsübungen bis RPE 9–10. Je näher am Versagen, desto mehr Hypertrophie, für Kraft spielt es kaum eine Rolle (Robinson 2024). Hauptübungen bleiben bei RPE 6–8.</li>' +
  '<li><b>Gedehnte Position:</b> Beinbeuger sitzend statt liegend (Maeo 2021), Curls mit gestrecktem Arm, Teilwiederholungen in der Dehnung bei den Waden (Kassiano 2023).</li>' +
  '<li><b>Nordic Curls:</b> zweimal 4–8 langsame Wiederholungen in Gym B. Exzentrisches Hamstring-Training senkt das Risiko für Zerrungen deutlich (van Dyk 2019).</li><li><b>Dips:</b> zweimal pro Woche. In Gym B schwer mit Zusatzgewicht, in Gym C mit Körpergewicht und mehr Wiederholungen.</li>' +
  '<li><b>Im Defizit:</b> Ziel ist Muskeln halten und leicht aufbauen. Die Rest-Muskulatur läuft bewusst auf Erhaltungsvolumen.</li>' +
  '<li><b>Cardio und Kraft:</b> getrennte Tage oder mindestens 3–6 h Abstand. Laufen stört den Beinaufbau stärker als Rad oder Rudern (Schumann 2022).</li>' +
  '<li><b>Rücken-Ampel:</b> ab 4/10 oder schlechter als beim letzten Mal: Pendulum statt Front Squat, Glute Bridge statt Trap Bar.</li>' +
  '<li><b>Ruhepuls +5 über Basis oder wenig Schlaf (unter 6 h):</b> Top-Sätze RPE −1, HIIT wird zu Z2.</li></ul></div></div>'; }

/* ======================= TIMER ======================= */
const TM = { end: 0, total: 0, iv: null, ctx: null, queue: [] };
let wakeLock = null;
async function keepAwake() { try { if ('wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => wakeLock = null); } } catch (e) {} }
function beep() { try { TM.ctx = TM.ctx || new (window.AudioContext || window.webkitAudioContext)(); const o = TM.ctx.createOscillator(), g = TM.ctx.createGain(); o.frequency.value = 880; g.gain.value = .15; o.connect(g); g.connect(TM.ctx.destination); o.start(); o.stop(TM.ctx.currentTime + .25); } catch (e) {} }
function showTimer(on) { $('#timer').hidden = !on; document.body.classList.toggle('timing', on); }
function startTimer(sec, label, queue) { if (!sec) return; TM.total = sec; TM.end = Date.now() + sec * 1000; TM.queue = queue || []; $('#tmLabel').textContent = label || 'Pause'; showTimer(true); $('#timer').classList.remove('end'); clearInterval(TM.iv); TM.iv = setInterval(tick, 250); tick(); keepAwake(); }
function tick() { const left = Math.max(0, Math.round((TM.end - Date.now()) / 1000)); $('#tmTime').textContent = Math.floor(left / 60) + ':' + pad(left % 60); $('#tmBar').style.width = Math.max(0, 100 - left / TM.total * 100) + '%';
  if (left <= 0) { clearInterval(TM.iv); if (navigator.vibrate) navigator.vibrate([300, 150, 300]); beep();
    if (TM.queue.length) { const nx = TM.queue.shift(); startTimer(nx.sec, nx.label, TM.queue); } else { $('#timer').classList.add('end'); $('#tmLabel').textContent = 'Weiter geht’s'; setTimeout(() => { if (Date.now() >= TM.end) showTimer(false); }, 6000); } } }
function intervalQueue(w) { const h = hiit(w); const q = [{ sec: 600, label: 'Aufwärmen, locker' }]; for (let i = 1; i <= h.reps; i++) { q.push({ sec: h.dur * 60, label: 'Intervall ' + i + ' von ' + h.reps + ': hart' }); if (i < h.reps) q.push({ sec: 180, label: 'Pause, locker' }); } q.push({ sec: 300, label: 'Auslaufen' }); return q; }

/* ======================= EVENTS ======================= */
function sessFromRoute() { const m = route.name === 'training' && route.arg && route.arg.match(/^w(\d+)-([ABCHZ])$/); return m ? { w: +m[1], k: m[2] } : null; }
const findAct = id => S.activities.find(a => a.id === id);
function plusMenu() { const t = (act, label, sub, cls, extra) => '<button class="act-pick" data-act="' + act + '"' + (extra || '') + ' type="button"><span class="badge ' + cls + ' sm">' + label.slice(0, 1) + '</span><span class="grow">' + label + '<br><span class="small muted" style="font-weight:500">' + sub + '</span></span></button>';
  openSheet(sheetHead('Hinzufügen') + '<div class="menu" style="margin-top:14px">' + t('scan', 'Barcode scannen', 'Lebensmittel per Kamera', 'gym') + t('add', 'Lebensmittel', 'Suche, Meal-Prep, Zuletzt', 'z2', ' data-meal="' + guessMeal() + '"') + t('newAct', 'Aktivität oder freies Training', 'Joggen, Schwimmen, Kraft …', 'act') + t('weighIn', 'Gewicht', 'Heutiges Gewicht eintragen', 'hiit') + '</div>'); }
function actSheet() { openSheet(sheetHead('Aktivität') + '<p class="muted">Was hast du gemacht?</p><div class="grid-acts" style="margin-top:12px">' + ACT_TYPES.map(a => '<button class="act-pick" data-act="pickAct" data-type="' + a.id + '" type="button"><span class="badge act sm">' + esc(a.short) + '</span>' + esc(a.name) + '</button>').join('') + '</div>'); }
function exPickSheet(aid, q) { q = (q || '').toLowerCase(); const items = Object.values(LIB).filter(e => !q || e.name.toLowerCase().includes(q));
  openSheet(sheetHead('Übung wählen') + '<div class="on-white" style="margin-top:12px"><input id="exq" type="search" placeholder="Übung suchen" style="width:100%" value="' + esc(q) + '" data-aid="' + aid + '"></div><div class="plist" id="exlist" style="margin-top:8px">' + exItems(items, aid) + '</div>'); }
const exItems = (items, aid) => items.map(e => '<div class="it" data-act="freePickEx" data-aid="' + aid + '" data-ex="' + e.id + '"><div class="grow"><b>' + esc(e.name) + '</b><small>' + Object.keys(e.muscles).filter(m => e.muscles[m] >= 1).map(m => MUSCLES[m]).join(', ') + '</small></div>' + (isPrio(e.id) ? '<span class="prio">Schwerpunkt</span>' : '') + '</div>').join('');

document.addEventListener('input', e => { const t = e.target;
  if (t.dataset.day) { const o = dayObj(t.dataset.day); if (t.dataset.f === 'complete') o.complete = t.checked; else { o.weight = t.value; o.weightSrc = 'manual'; } save(); return; }
  if (t.dataset.st) { S.settings[t.dataset.st] = t.value; save(); return; }
  if (t.dataset.bw) { const k = 'w' + pad(+t.dataset.bw); S.body[k] = S.body[k] || {}; S.body[k][t.dataset.bf] = t.value; save(); return; }
  if (t.dataset.ck) { const s = sess(+t.dataset.sw, t.dataset.sk); s.check[t.dataset.ck] = t.value; save(); return; }
  if (t.dataset.cf) { const w = +t.dataset.cw, k = t.dataset.ck2; const s = sess(w, k); s.cardio = s.cardio || {}; s.cardio[t.dataset.cf] = t.value; if (t.dataset.cf === 'dur' && t.value) markStarted(w, k); save(); return; }
  if (t.id === 'exq') { const q = t.value.toLowerCase(); $('#exlist').innerHTML = exItems(Object.values(LIB).filter(x => x.name.toLowerCase().includes(q)), t.dataset.aid); return; }
  if (t.dataset.aid && t.dataset.idx != null && t.dataset.f) { const a = findAct(t.dataset.aid); const ex = a.exercises[+t.dataset.idx]; const i = +t.dataset.i; ex.sets[i] = ex.sets[i] || {}; ex.sets[i][t.dataset.f] = t.value; save(); return; }
  if (t.dataset.aid && t.dataset.af) { const a = findAct(t.dataset.aid); if (!a) return; const f = t.dataset.af;
    if (f === 'countsZ') { a.countsAs = t.checked ? 'Z' : undefined; if (t.checked) a.week = a.week || curWeek(); }
    else { a[f] = t.value; if (f === 'type' && ACT_MAP[t.value].strength && !a.exercises) a.exercises = []; } save(); return; }
  if (t.dataset.slot) { const r = sessFromRoute(); if (!r) return; const spec = planFor(r.w, r.k).find(p => p.slot === t.dataset.slot); const s = sess(r.w, r.k);
    const lg = s.logs[spec.slot] || (s.logs[spec.slot] = { ex: actualEx(r.w, r.k, spec), sets: [] }); const i = +t.dataset.i; for (let j = 0; j <= i; j++) lg.sets[j] = lg.sets[j] || {}; lg.sets[i][t.dataset.f] = t.value; save(); return; }
  if (t.id === 'qq' || t.id === 'qu') { const b = document.querySelector('[data-act=confirmAdd],[data-act=saveEntry]'); if (b) updatePrev(b.dataset.id); }
});
document.addEventListener('change', async e => { const t = e.target;
  if (t.dataset.dm) { S.settings.dayMap[t.dataset.dm] = t.value === '' ? '' : +t.value; save(); render(); return; }
  if (t.dataset.ck) { const r = sessFromRoute(); if (r) { const fl = $('#flags'); if (fl) fl.outerHTML = flagsHTML(r.w, r.k); planFor(r.w, r.k).forEach(spec => softPatch('ex-' + spec.slot, exCard(r.w, r.k, spec))); } }
  if (t.dataset.slot && t.dataset.f) { const r = sessFromRoute(); if (r) { const spec = planFor(r.w, r.k).find(p => p.slot === t.dataset.slot); softPatch('ex-' + spec.slot, exCard(r.w, r.k, spec)); if (spec.slot === 'bench_top') { const bo = planFor(r.w, r.k).find(p => p.slot === 'bench_bo'); if (bo) softPatch('ex-bench_bo', exCard(r.w, r.k, bo)); } } }
  if (t.dataset.aid && (t.dataset.af === 'type' || t.dataset.af === 'date' || t.dataset.af === 'countsZ')) render();
  if (t.dataset.day && (route.name === 'heute' || t.dataset.f === 'complete')) render();
  if (t.id === 'fileImport' && t.files[0]) { const rd = new FileReader(); rd.onload = () => importBackup(rd.result); rd.readAsText(t.files[0]); t.value = ''; }
  if (t.id === 'fileZepp' && t.files.length) { await importZeppFiles(Array.from(t.files)); t.value = ''; }
});
function importBackup(txt) { try { const d = JSON.parse(txt); if (!d.settings || !d.sessions) throw new Error('Format'); S = loadState(txt); save(); render(true); toast('Sicherung geladen'); } catch (err) { toast('Das ist keine Hybridblock-Sicherung.'); } }
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'q') offSearch(e.target.value.trim()); if (e.key === 'Enter' && e.target.id === 'scanCode') { const c = e.target.value; closeScanner(); lookupBarcode(c); }
  if (e.key === 'Escape') { if (!$('#scanner').hidden) closeScanner(); else if (!$('#sheet').hidden) closeSheet(); } });
document.addEventListener('pointermove', e => { if (e.target.closest && e.target.closest('.chart')) chartHover(e); });
document.addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('.chart')) chartHover(e); });
document.addEventListener('pointerout', e => { const b = e.target.closest && e.target.closest('.chart'); if (b && !b.contains(e.relatedTarget)) chartLeave(b); });

document.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; const r = sessFromRoute();
  switch (a) {
    case 'plus': plusMenu(); break;
    case 'week': ui.week = +b.dataset.w; ui.confirmFinish = false; render(); break;
    case 'finish': ui.confirmFinish = true; render(); break;
    case 'finishNo': ui.confirmFinish = false; render(); break;
    case 'finishYes': { const w = curWeek(); ORDER.forEach(k => { if (!sessProgress(w, k).done) sess(w, k).skipped = true; }); S.block.week = Math.min(12, w + 1); ui.week = S.block.week; ui.confirmFinish = false; save(); render(); toast('Weiter mit Woche ' + S.block.week); break; }
    case 'skip': sess(+b.dataset.w, b.dataset.k).skipped = true; save(); location.hash = '#training'; break;
    case 'unskip': delete sess(+b.dataset.w, b.dataset.k).skipped; save(); render(); break;
    case 'wkMinus': S.block.week = Math.max(1, curWeek() - 1); ui.week = null; save(); render(); break;
    case 'wkPlus': S.block.week = Math.min(12, curWeek() + 1); ui.week = null; save(); render(); break;
    case 'done': {
      if (b.dataset.aid) { const act = findAct(b.dataset.aid); const ex = act.exercises[+b.dataset.idx]; const i = +b.dataset.i; ex.sets[i] = ex.sets[i] || {}; const set = ex.sets[i];
        if (set.done) set.done = false; else { for (let j = i - 1; j >= 0; j--) { const p = ex.sets[j]; if (p && p.done) { if (!set.w) set.w = p.w; if (!set.r) set.r = p.r; break; } } set.done = true; startTimer(90, LIB[ex.ex].name + ': Pause'); }
        save(); softPatch('fx-' + b.dataset.idx, freeExCard(act, ex, +b.dataset.idx)); break; }
      const spec = planFor(r.w, r.k).find(p => p.slot === b.dataset.slot); const exId = actualEx(r.w, r.k, spec); const s = sess(r.w, r.k);
      const lg = s.logs[spec.slot] || (s.logs[spec.slot] = { ex: exId, sets: [] }); const i = +b.dataset.i; for (let j = 0; j <= i; j++) lg.sets[j] = lg.sets[j] || {}; const set = lg.sets[i];
      if (set.done) { set.done = false; } else { const rd = readiness(r.w, r.k); const sg = setSuggestion(r.w, r.k, spec, exId, i, planSuggestion(r.w, r.k, spec, exId, rd), rd);
        if ((set.w === undefined || set.w === '') && sg.load != null) set.w = String(sg.load); if ((set.r === undefined || set.r === '') && sg.reps != null) set.r = String(sg.reps);
        set.done = true; lg.ex = exId; markStarted(r.w, r.k); prCheck(exId, r.w, r.k, set); if (spec.rest) startTimer(spec.rest, LIB[exId].name + ': Pause'); }
      save(); softPatch('ex-' + spec.slot, exCard(r.w, r.k, spec)); if (spec.slot === 'bench_top') { const bo = planFor(r.w, r.k).find(p => p.slot === 'bench_bo'); if (bo) softPatch('ex-bench_bo', exCard(r.w, r.k, bo)); } break; }
    case 'swap': { const spec = planFor(r.w, r.k).find(p => p.slot === b.dataset.slot); const cur = actualEx(r.w, r.k, spec); const opts = [spec.ex, ...LIB[spec.ex].alts.filter(x => x !== spec.ex)];
      LIB[cur].alts.forEach(x => { if (!opts.includes(x)) opts.push(x); }); ui.swapScope = 'today';
      openSheet(sheetHead('Übung tauschen') + '<p class="muted">Gleiches Bewegungsmuster, gleiche Sätze und RPE. Der Verlauf läuft pro Übung weiter.</p>' +
        '<div class="seg"><button class="on" data-act="swapscope" data-s="today" type="button">Nur heute</button><button data-act="swapscope" data-s="always" type="button">Dauerhaft</button></div>' +
        '<div class="plist">' + opts.map(x => '<div class="it" data-act="doswap" data-slot="' + spec.slot + '" data-ex="' + x + '"><div class="grow"><b>' + esc(LIB[x].name) + '</b>' + (x === spec.ex ? '<small>Plan-Standard</small>' : '') + '</div>' + (x === cur ? '<span class="tag on-white" style="background:var(--fog)"><span class="dot green"></span>aktiv</span>' : '') + '</div>').join('') + '</div>'); break; }
    case 'swapscope': ui.swapScope = b.dataset.s; b.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); break;
    case 'doswap': { const spec = planFor(r.w, r.k).find(p => p.slot === b.dataset.slot); const s = sess(r.w, r.k); const ex = b.dataset.ex;
      if (ui.swapScope === 'always') { if (ex === spec.ex) delete S.swaps[spec.slot]; else S.swaps[spec.slot] = ex; delete s.swaps[spec.slot]; } else { if (ex === spec.ex && !S.swaps[spec.slot]) delete s.swaps[spec.slot]; else s.swaps[spec.slot] = ex; }
      if (s.logs[spec.slot]) s.logs[spec.slot].ex = actualEx(r.w, r.k, spec); save(); closeSheet(); softPatch('ex-' + spec.slot, exCard(r.w, r.k, spec)); toast(LIB[ex].name + (ui.swapScope === 'always' ? ', dauerhaft' : ', nur heute')); break; }
    case 'backswap': { const w = +b.dataset.w, k = b.dataset.k; const s = sess(w, k); if (planFor(w, k).some(p => p.slot === 'fs')) s.swaps.fs = 'pend'; if (planFor(w, k).some(p => p.slot === 'trap')) s.swaps.trap = 'glute_bridge';
      ['fs', 'trap'].forEach(sl => { if (s.logs[sl]) s.logs[sl].ex = s.swaps[sl]; }); save(); render(); toast('Für heute getauscht'); break; }
    case 'intervals': startTimer(1, 'Los', intervalQueue(+b.dataset.w)); break;
    case 'useZepp': { const act = findAct(b.dataset.id); const w = +b.dataset.w, k = b.dataset.k; act.countsAs = k; act.week = w; markStarted(w, k); const s = sess(w, k); s.cardio = Object.assign(s.cardio || {}, { dur: String(act.dur), avg: act.avgHr ? String(act.avgHr) : (s.cardio && s.cardio.avg) || '' }); save(); render(); toast('Aus Zepp übernommen'); break; }
    case 'checkin': { if (!checkinDue()) break; const c = doCheckin(); toast('Neues Ziel: ' + fmt(c.kcal, 0) + ' kcal'); render(); break; }
    case 'dprev': ui.day = addDays(ui.day, -1); render(); break;
    case 'dnext': if (ui.day < today()) { ui.day = addDays(ui.day, 1); render(); } break;
    case 'template': DAY_TEMPLATE.forEach(t => addEntry(ui.day, t.food, t.meal, t.qty, t.unit)); render(); toast('Meal-Prep-Tag eingefügt'); break;
    case 'add': ui.meal = b.dataset.meal || guessMeal(); if (route.name !== 'essen') { ui.day = today(); } addSheet(); break;
    case 'ftab': ui.foodTab = b.dataset.t; addSheet(); break;
    case 'search': offSearch(($('#q') || {}).value.trim()); break;
    case 'scan': if (route.name !== 'essen') ui.day = today(); if (!ui.meal) ui.meal = guessMeal(); openScanner(); break;
    case 'scanClose': closeScanner(); break;
    case 'scanManual': { const c = $('#scanCode').value; closeScanner(); lookupBarcode(c); break; }
    case 'torch': toggleTorch(); break;
    case 'pick': { const id = b.dataset.id; const c = offCache[id];
      if (c && c.needsFetch && !S.foods[id]) { try { const j = await fetchJson('https://world.openfoodfacts.org/api/v2/product/' + c.code + '.json?fields=code,product_name,product_name_de,brands,nutriments,serving_quantity'); const f = j && j.product ? offMap(Object.assign({ code: c.code }, j.product)) : null;
          if (f) { S.foods[id] = f; save(); qtySheet(id); } else openSheet(sheetHead('Nährwerte fehlen') + foodForm({ base: '100g', name: c.name, code: c.code }, c.code)); } catch (e) { openSheet(sheetHead('Nährwerte fehlen') + foodForm({ base: '100g', name: c.name, code: c.code }, c.code)); } break; }
      if (c && !S.foods[id]) { S.foods[id] = c; save(); } qtySheet(id); break; }
    case 'confirmAdd': { const q = num($('#qq').value); if (!q) { toast('Menge eingeben'); break; } ui.meal = $('#qm').value; addEntry(ui.day, b.dataset.id, ui.meal, q, $('#qu').value); closeSheet(); if (route.name !== 'essen') location.hash = '#essen'; else render(); toast('Hinzugefügt'); break; }
    case 'edit': { const en = (dayObj(ui.day).entries || []).find(x => x.uid === b.dataset.uid); if (en && getFood(en.food)) qtySheet(en.food, en); break; }
    case 'saveEntry': { const o = dayObj(ui.day), en = o.entries.find(x => x.uid === b.dataset.uid); const q = num($('#qq').value); if (!en || !q) break; en.qty = q; en.unit = $('#qu').value; Object.assign(en, macrosFor(getFood(en.food), q, en.unit)); save(); closeSheet(); render(); break; }
    case 'delEntry': { const o = dayObj(ui.day); o.entries = o.entries.filter(x => x.uid !== b.dataset.uid); save(); closeSheet(); render(); toast('Gelöscht'); break; }
    case 'editFood': openSheet(sheetHead('Nährwerte') + foodForm(getFood(b.dataset.id))); break;
    case 'saveFood': { const code = ($('#ff-code') || {}).value || ''; const id = b.dataset.id || (code ? 'bc_' + code : 'c_' + uid()); const old = getFood(id) || {};
      const f = { ...old, id, name: $('#ff-name').value.trim() || 'Ohne Namen', base: $('#ff-base').value, kcal: num($('#ff-kcal').value) || 0, p: num($('#ff-p').value) || 0, f: num($('#ff-f').value) || 0, c: num($('#ff-c').value) || 0, pieceG: num($('#ff-pg').value), code: code || old.code || '', src: old.src || 'custom' };
      S.foods[id] = f; save(); qtySheet(id); toast('Gespeichert'); break; }
    case 'closeSheet': closeSheet(); break;
    case 'exHist': exHistSheet(b.dataset.ex); break;
    case 'exMetric': exHistSheet(ui.exHist.exId, b.dataset.v, ui.exHist.period); break;
    case 'exPeriod': exHistSheet(ui.exHist.exId, ui.exHist.metric, b.dataset.v); break;
    case 'newAct': actSheet(); break;
    case 'pickAct': { const act = newActivity(b.dataset.type); closeSheet(); location.hash = '#frei/' + act.id; if (ACT_MAP[act.type].strength) setTimeout(() => exPickSheet(act.id), 120); break; }
    case 'freeAddEx': exPickSheet(b.dataset.aid); break;
    case 'freePickEx': { const act = findAct(b.dataset.aid); act.exercises.push({ ex: b.dataset.ex, sets: [{}, {}, {}] }); save(); closeSheet(); render(); break; }
    case 'freeAddSet': { const act = findAct(b.dataset.aid); act.exercises[+b.dataset.idx].sets.push({}); save(); softPatch('fx-' + b.dataset.idx, freeExCard(act, act.exercises[+b.dataset.idx], +b.dataset.idx)); render(); break; }
    case 'freeDelEx': { const act = findAct(b.dataset.aid); act.exercises.splice(+b.dataset.idx, 1); save(); render(); break; }
    case 'delAct': ui.confirmDel = b.dataset.aid; render(); break;
    case 'delActNo': ui.confirmDel = null; render(); break;
    case 'delActYes': { const act = findAct(b.dataset.aid); if (act && act.key) S.healthMeta.ignored.push(act.key); S.activities = S.activities.filter(x => x.id !== b.dataset.aid); ui.confirmDel = null; save(); location.hash = '#training'; toast('Gelöscht'); break; }
    case 'weighIn': closeSheet(); location.hash = '#heute'; setTimeout(() => { const i = $('#wToday'); if (i) i.focus(); }, 150); break;
    case 'hcConnect': hcConnect(); break;
    case 'hcSync': if (!HEALTH.native) { location.hash = '#mehr'; break; } toast('Synchronisiere …'); hcSync(false); break;
    case 'hcSettings': try { await HEALTH.plugin.openHealthConnectSettings(); } catch (err) { toast('Health Connect lässt sich nicht öffnen.'); } break;
    case 'zepp': $('#fileZepp').click(); break;
    case 'checkUpdate': await checkUpdate(true); render(); if (!updateAvailable()) toast(BUILD.remote != null ? 'Du hast die neueste Version.' : 'Update-Server nicht erreichbar.'); break;
    case 'export': exportBackup(); break;
    case 'import': $('#fileImport').click(); break;
    case 'pasteImport': $('#backupBox').innerHTML = '<div class="on-white" style="margin-top:12px"><textarea id="pasteBox" placeholder="Sicherungs-Text hier einfügen" style="background:var(--paper)"></textarea></div><button class="btn brand" style="margin-top:10px" data-act="pasteGo" type="button">Laden</button>'; break;
    case 'pasteGo': importBackup($('#pasteBox').value); break;
  } });
async function exportBackup() { const txt = JSON.stringify(S); const name = 'hybridblock-' + today() + '.json';
  try { const file = new File([txt], name, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Hybridblock-Sicherung' }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  if (!HEALTH.native) { const u = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); const l = document.createElement('a'); l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000); return; }
  try { await navigator.clipboard.writeText(txt); toast('Sicherung in die Zwischenablage kopiert'); } catch (e) { $('#backupBox').innerHTML = '<p class="small muted">Text markieren und kopieren:</p><textarea readonly style="background:var(--paper)">' + esc(txt) + '</textarea>'; } }
$('#tmMinus').addEventListener('click', () => { TM.end -= 15000; tick(); });
$('#tmPlus').addEventListener('click', () => { TM.end += 30000; TM.total += 30; tick(); });
$('#tmStop').addEventListener('click', () => { clearInterval(TM.iv); TM.queue = []; showTimer(false); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (!$('#timer').hidden) keepAwake(); autoSync(); checkUpdate(false); } });
function autoSync() { if (!HEALTH.native || S.healthMeta.source !== 'hc') return; const ls = S.healthMeta.lastSync ? Date.parse(S.healthMeta.lastSync) : 0; if (Date.now() - ls > 30 * 60 * 1000) hcSync(false); }

/* ======================= UPDATES ======================= */
const REPO = 'Orzu95/hybridblock', PAGES = 'https://orzu95.github.io/hybridblock/', APK_URL = 'https://github.com/' + REPO + '/releases/latest/download/Hybridblock.apk';
const BUILD = { local: null, remote: null, checked: 0 };
async function checkUpdate(force) { if (!force && Date.now() - BUILD.checked < 60 * 60 * 1000) return; BUILD.checked = Date.now();
  try { BUILD.local = (await fetchJson('build.json?t=' + Date.now(), 4000)).build; } catch (e) {}
  if (!HEALTH.native) return;
  try { const r = await fetchJson(PAGES + 'build.json?t=' + Date.now(), 7000); const had = updateAvailable(); BUILD.remote = r.build; if (updateAvailable() !== had) render(); } catch (e) {} }
const updateAvailable = () => HEALTH.native && BUILD.remote != null && BUILD.local != null && BUILD.remote > BUILD.local;
const updateNote = () => updateAvailable() ? note('ember', '<b>Update verfügbar</b> (Build ' + BUILD.remote + '). Herunterladen und über die alte Version installieren. Deine Daten bleiben erhalten.', '<a class="btn brand sm" href="' + APK_URL + '">Laden</a>') : '';

/* ======================= INIT ======================= */
parseHash(); render(true); setTimeout(autoSync, 800); setTimeout(() => checkUpdate(true), 1500);
if ('serviceWorker' in navigator && location.protocol === 'https:' && !HEALTH.native && !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) navigator.serviceWorker.register('sw.js').catch(() => {});
