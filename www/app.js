/* Hybridblock – App-Logik v2 */
'use strict';

/* ======================= STATE ======================= */
const KEY = 'hb_state_v1';
const DEFAULTS = () => ({
  v: 2,
  settings: { hfmax:186, rhrBase:'', puStart:8, goalRate:0.8, tdee0:3200, protein:200, fat:70, floor:2000, startWeight:115, targetWeight:103, startKcal:2400, stepGoal:9000, sleepNeedH:8, barKg:20, dayMap: Object.assign({}, DEFAULT_DAYMAP) },
  block: { week:1, startedOn:null },
  plan:null, meta:{}, sessions:{}, swaps:{}, days:{}, foods:{}, recent:[], checkins:[], body:{}, activities:[], health:{}, daily:{}, hrTraces:{}, exNotes:{}, mealTemplates:[], workouts:[], archive:[], healthMeta:{ lastSync:null, source:null, ignored:[] }
});
let S = DEFAULTS(); S.plan = makePlan('hybrid');
function loadState(raw) { const d = JSON.parse(raw); const def = DEFAULTS(); const s = Object.assign(DEFAULTS(), d);
  s.settings = Object.assign(def.settings, d.settings || {}); s.settings.dayMap = Object.assign({}, DEFAULT_DAYMAP, (d.settings && d.settings.dayMap) || {});
  s.block = Object.assign({ week:1, startedOn:null }, d.block || {}); s.healthMeta = Object.assign({ lastSync:null, source:null, ignored:[] }, d.healthMeta || {});
  ['activities','recent','checkins','mealTemplates','workouts','archive'].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });
  ['sessions','swaps','days','foods','body','health','daily','hrTraces','exNotes'].forEach(k => { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
  if (!d.v || d.v < 2) { delete s.settings.start; s.v = 2; }
  if (!s.meta || typeof s.meta !== 'object') s.meta = {}; if (!s.meta.onboarded && s.settings.vo2Start === undefined && Object.keys(s.sessions).length) s.settings.vo2Start = '39';
  if (!s.meta.onboarded && (Object.keys(s.sessions).length || Object.keys(s.days).length || s.activities.length)) s.meta.onboarded = true;
  if (!s.plan || !Array.isArray(s.plan.sessions) || (!s.plan.sessions.length && !s.plan.free && !s.plan.waiting)) s.plan = makePlan('hybrid'); if (!s.meta || typeof s.meta !== 'object') s.meta = {};
  s.plan.sessions.forEach(x => { if (!(x.k in s.settings.dayMap)) s.settings.dayMap[x.k] = s.plan.dayMap && s.plan.dayMap[x.k] != null ? s.plan.dayMap[x.k] : ''; });
  /* alte Slot-Namen aus v1 auf neue Slots mappen, damit der Verlauf bleibt */
  const ren = { calf_st:'calf_a', legext:'legext', calf_se:'calf_c', curl:'bi_b', crunch:'ab_b', hlr:'ab_a', hammer:'bi_c', lat_c:'lat_c' };
  for (const key in s.sessions) { const se = s.sessions[key]; se.check = se.check || {}; se.logs = se.logs || {}; se.swaps = se.swaps || {};
    for (const old in ren) if (se.logs[old] && !se.logs[ren[old]] && old !== ren[old]) { se.logs[ren[old]] = se.logs[old]; delete se.logs[old]; } }
  return s; }
try { const raw = localStorage.getItem(KEY); if (raw) S = loadState(raw); } catch (e) { console.warn(e); }
let saveT;
function persist() { if (typeof VIEW !== 'undefined' && VIEW) return; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast($t('Speichern fehlgeschlagen. Ist der Speicher voll?')); } }
function save() { if (typeof VIEW !== 'undefined' && VIEW) return; S.meta.modAt = Date.now(); clearTimeout(saveT); saveT = setTimeout(() => { persist(); if (typeof cloudDirty === 'function') cloudDirty(); }, 250); }
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

/* ======================= HELPERS ======================= */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const num = v => { if (v === null || v === undefined || v === '') return null; const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; };
const fmt = (n, d = 1) => n == null || isNaN(n) ? '–' : (Math.round(n * 10 ** d) / 10 ** d).toLocaleString(LOCALE);
const r25 = n => Math.round(n / 2.5) * 2.5;
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5);
const today = () => iso(new Date());
const WD = [$t('So'),$t('Mo'),$t('Di'),$t('Mi'),$t('Do'),$t('Fr'),$t('Sa')];
const WD_LONG = [$t('Sonntag'),$t('Montag'),$t('Dienstag'),$t('Mittwoch'),$t('Donnerstag'),$t('Freitag'),$t('Samstag')];
const MON = [$t('Januar'),$t('Februar'),$t('März'),$t('April'),$t('Mai'),$t('Juni'),$t('Juli'),$t('August'),$t('September'),$t('Oktober'),$t('November'),$t('Dezember')];
const fmtDay = s => { const d = parseISO(s); return WD[d.getDay()] + ', ' + d.getDate() + '.' + (d.getMonth() + 1) + '.'; };
const fmtMin = m => m == null ? '–' : Math.floor(m / 60) + ':' + pad(Math.round(m % 60)) + (LANG === 'ru' ? ' ч' : ' h');
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
let ORDER = [], SESS = {};
const TPL_SESS = Object.fromEntries(SESSIONS.map(s => [s.k, s]));
function sessDef(x) { return x.base ? TPL_SESS[x.base] : x.kind === 'hiit' ? TPL_SESS.H : x.kind === 'z2' ? TPL_SESS.Z : { title: $t('Einheit ') + x.k, sub: '' }; }
function resolveSessions(plan) { return Object.fromEntries(plan.sessions.map(x => { const d = sessDef(x) || {}; return [x.k, Object.assign({}, x, { title: $t(x.title || d.title), sub: $t(x.sub != null && x.sub !== '' ? x.sub : x.cardio ? '' : (d.sub || '')) })]; })); }
function applyPlan() { ORDER = S.plan.sessions.map(x => x.k); SESS = resolveSessions(S.plan); S.plan.sessions.forEach(x => { if (!(x.k in S.settings.dayMap)) S.settings.dayMap[x.k] = ''; }); }
const isLite = w => { const p = phase(w); return p === 'dl' || p === 'test'; };
function scaleItem(it, w) { const x = Object.assign({ note: '', sup: '', type: 'dp', rest: 90 }, it);
  if (it.wk && it.wk.length) { const e = it.wk[(w - 1) % it.wk.length]; if (e) { if (e.sets != null) x.sets = e.sets; if (e.reps != null) x.reps = e.reps; if (e.rpe !== undefined) x.rpe = e.rpe; if (e.note) x.note = e.note; } delete x.wk; return x; }
  if (isLite(w)) { x.sets = Math.max(1, Math.ceil(x.sets / 2)); if (x.rpe != null) x.rpe = Math.max(5, x.rpe - 2); } return x; }
function applyOv(x, o, w) { const y = Object.assign({}, x); ['ex', 'reps', 'note', 'sup', 'type'].forEach(f => { if (o[f] != null && o[f] !== '') y[f] = o[f]; }); if (o.rest != null) y.rest = o.rest;
  if (o.sets != null) y.sets = isLite(w) ? Math.min(o.sets, x.sets) : o.sets; if (o.rpe != null && !isLite(w)) y.rpe = o.rpe; return y; }
function planForP(plan, w, k) { const s = plan && plan.sessions.find(x => x.k === k); if (!s || s.kind !== 'gym') return []; const ov = s.ov || {};
  let list = s.base && BASE_FN[s.base] ? BASE_FN[s.base](w) : [];
  list = list.filter(x => !(ov[x.slot] && ov[x.slot].del)).map(x => ov[x.slot] ? applyOv(x, ov[x.slot], w) : x);
  return list.concat((s.add || []).filter(it => LIB[it.ex]).map(it => scaleItem(it, w))); }
const planFor = (w, k) => planForP(S.plan, w, k);
const isGym = k => !!SESS[k] && SESS[k].kind === 'gym';
const isCardio = k => !!SESS[k] && SESS[k].kind !== 'gym';
const isHiit = k => !!SESS[k] && SESS[k].kind === 'hiit';
const GYM = () => ORDER.filter(isGym);
const Z2K = () => ORDER.find(k => SESS[k].kind === 'z2');
/* beinlastige Einheit: Hauptübung oder mehrere Übungen für Quads/Hamstrings/Glutes */
function legDay(k, w) { if (!isGym(k)) return false; const l = planFor(w || curWeek(), k); return l.some(p => p.type === 'main' && LIB[p.ex] && ((LIB[p.ex].muscles.q || 0) >= 1 || (LIB[p.ex].muscles.g || 0) >= 1)) || l.filter(p => LIB[p.ex] && ((LIB[p.ex].muscles.q || 0) + (LIB[p.ex].muscles.h || 0) >= 1)).length >= 3; }
function cardioSpec(w, k) { return cardioSpecS(SESS[k], w); }
function cardioSpecS(s, w) { const c = s && s.cardio;
  if (c && c.weeks && c.weeks.length) { const i = c.clamp ? Math.min(w, c.weeks.length) - 1 : (w - 1) % c.weeks.length; let e = c.weeks[i]; if (typeof e === 'number') e = { mode: 'z2', min: e }; return Object.assign({ mode: s.kind === 'hiit' ? 'int' : 'z2' }, e); }
  if (s && s.kind === 'hiit') { const h = hiit(w); return { mode: h.mode, reps: h.reps, dur: h.dur, rest: 3, warm: 10, cool: 5, hi: true, min: h.min, title: h.title, sub: h.sub }; }
  return { mode: 'z2', min: Z2MIN[w - 1], std: true }; }
function cardioTitle(sp) { if (sp.title) return $t(sp.title); if (sp.mode === 'int') return sp.reps + ' × ' + fmt(sp.dur) + (sp.run ? $t(' min laufen') : $t(' min')); return sp.min + (sp.run ? $t(' min am Stück laufen') : $t(' min Z2')); }
function cardioSub(sp) { if (sp.sub) return $t(sp.sub); if (sp.mode === 'int') return sp.run ? fmt(sp.rest) + $t(' min gehen dazwischen, 5 min zügig gehen zum Auf- und Abwärmen') : fmt(sp.rest) + $t(' min locker zwischen den Intervallen'); return sp.run ? $t('Locker, du kannst dich dabei unterhalten.') : $t('Du kannst in ganzen Sätzen reden.'); }
function sessSub(w, k) { const s = SESS[k]; if (s.cardio) return cardioTitle(cardioSpec(w, k)); if (s.kind === 'hiit') return hiit(w).title; if (s.kind === 'z2') return Z2MIN[w - 1] + $t(' min · ') + s.sub; return s.sub; }
const RE_SESS = /^w(\d+)-([A-Z])$/;
applyPlan();
function sess(w, k) { const key = sKey(w, k); return S.sessions[key] || (S.sessions[key] = { check: {}, logs: {}, swaps: {} }); }
function peekSess(w, k) { return S.sessions[sKey(w, k)]; }
function chosenEx(w, k, spec) { const s = peekSess(w, k); return (s && s.swaps && s.swaps[spec.slot]) || S.swaps[spec.slot] || spec.ex; }
function actualEx(w, k, spec) { const c = chosenEx(w, k, spec); return exAvailable(c) ? c : (substituteEx(c) || c); }
/* Ersatz, wenn ein Gerät fehlt: Alternativen, dann leichtere Varianten, Breitensuche */
function substituteEx(id) { if (!LIB[id]) return null; const seen = new Set([id]); const q = [...(LIB[id].alts || []), ...((SCALE[id] || {}).e || []), ...((SCALE[id] || {}).h || [])];
  while (q.length) { const x = q.shift(); if (seen.has(x) || !LIB[x]) continue; seen.add(x); if (exAvailable(x)) return x; (LIB[x].alts || []).forEach(y => q.push(y)); } return null; }
function chronIndex(w, k) { return (w - 1) * ORDER.length + ORDER.indexOf(k); }
const curWeek = () => Math.max(1, Math.min(12, S.block.week || 1));
function markStarted(w, k) { const s = sess(w, k); if (!s.date) s.date = today(); if (!S.block.startedOn) S.block.startedOn = today(); }
const dayLabel = k => { const d = S.settings.dayMap[k]; return d === '' || d == null || d < 0 ? $t('freier Tag') : WD_LONG[d]; };
function sessionsOnDow(dow) { return ORDER.filter(k => +S.settings.dayMap[k] === dow && S.settings.dayMap[k] !== ''); }
function countsAsActivity(w, k) { return S.activities.find(a => a.countsAs === k && a.week === w); }
function sessProgress(w, k) { const s = peekSess(w, k);
  if (s && s.skipped) return { done: true, skipped: true, f: 0, t: 0 };
  if (isCardio(k)) { const d = (s && s.cardio && num(s.cardio.dur) != null) || !!countsAsActivity(w, k); return { done: d, f: d ? 1 : 0, t: 1 }; }
  let t = 0, f = 0; planFor(w, k).forEach(p => { t += p.sets; const lg = s && s.logs[p.slot]; if (lg) f += (lg.sets || []).filter(x => x && x.done).length; });
  return { done: t > 0 && f / t >= 0.8, f, t }; }
function weekDone(w) { return ORDER.length > 0 && ORDER.every(k => sessProgress(w, k).done); }
function lastDate(w) { let d = null; ORDER.forEach(k => { const s = peekSess(w, k); if (s && s.date && (!d || s.date > d)) d = s.date; const a = countsAsActivity(w, k); if (a && (!d || a.date > d)) d = a.date; }); return d; }
/* nächste Woche erst am Tag nach der letzten Einheit, damit „Heute“ am Trainingstag „erledigt“ zeigt */
function maybeAdvance() { const w = curWeek(); if (w >= 12 || !weekDone(w)) return; const ld = lastDate(w); if (ld && ld >= today()) return;
  S.block.week = w + 1; ui.week = null; save(); setTimeout(() => toast($t('Woche ') + w + $t(' geschafft. Weiter mit Woche ') + (w + 1) + '.'), 300); }
function scheduleWarnings() { const m = S.settings.dayMap, out = []; const d = k => (m[k] === '' || m[k] == null) ? null : +m[k];
  ORDER.filter(isHiit).forEach(hk => ORDER.filter(g => legDay(g)).forEach(g => { if (d(hk) != null && d(g) != null && (d(hk) + 1) % 7 === d(g)) out.push(SESS[hk].title + $t(' liegt am Tag vor ') + SESS[g].title + $t('. Die Beine sind dann nicht frisch.')); }));
  const by = {}; ORDER.forEach(k => { if (d(k) == null) return; (by[d(k)] = by[d(k)] || []).push(k); });
  Object.values(by).forEach(ks => { if (ks.length > 1) out.push(ks.map(k => SESS[k].title).join($t(' und ')) + $t(' am selben Tag: mindestens 3–6 h Abstand, Kraft zuerst.')); });
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
function lastBack(w, k) { for (let j = chronIndex(w, k) - 1; j >= 0; j--) { const ww = Math.floor(j / ORDER.length) + 1, kk = ORDER[j % ORDER.length]; if (!isGym(kk)) continue; const s = peekSess(ww, kk); const v = s && num(s.check && s.check.back); if (v != null) return v; } return null; }
function readiness(w, k) {
  const s = peekSess(w, k) || { check: {} }, c = s.check || {}, d = s.date || today(), h = S.health[d] || {};
  const back = num(c.back), pb = lastBack(w, k);
  const rhr = num(c.rhr) ?? rhrOf(d), base = rhrBaseline();
  const sleep = c.sleep || sleepQuality(h.sleepMin);
  const backRed = back != null && (back >= 4 || (pb != null && back > pb && back >= 2));
  const backAmber = !backRed && back == null && pb != null && pb >= 4;
  const rhrHigh = rhr != null && base && rhr >= base.v + 5;
  const sleepBad = sleep === 'schlecht';
  const dr = dailyReadiness(d);
  const y = addDays(d, -1); const runPrev = legDay(k, w) ? S.activities.find(a => (a.date === y || a.date === d) && ACT_MAP[a.type] && ACT_MAP[a.type].run && (num(a.dur) || 0) >= 20) : null;
  return { backRed, backAmber, rhrHigh, sleepBad, rpeShift: (rhrHigh || sleepBad || (dr && dr.score < 50)) ? -1 : 0, dr, back, pb, rhr, base, sleep, sleepMin: h.sleepMin, runPrev, autoRhr: num(c.rhr) == null && rhr != null, autoSleep: !c.sleep && !!sleep }; }

/* ======================= VERLAUF & AUTOREGULATION ======================= */
const e1rm = (w, r, rpe) => w * (1 + (r + (10 - rpe)) / 30);
const loadFor = (est, reps, rpe) => est / (1 + (reps + (10 - rpe)) / 30);
function loggedSets(log) { return ((log && log.sets) || []).map(x => ({ w: num(x && x.w), r: num(x && x.r), rpe: num(x && x.rpe), done: !!(x && x.done) })).filter(x => x.w != null || x.r != null); }
function history(w, k, exId) {
  for (let j = chronIndex(w, k) - 1; j >= 0; j--) {
    const ww = Math.floor(j / ORDER.length) + 1, kk = ORDER[j % ORDER.length]; const s = peekSess(ww, kk); if (!s || !s.logs) continue;
    const found = [];
    for (const slot in s.logs) { const lg = s.logs[slot]; if (lg.ex !== exId) continue; const sets = loggedSets(lg); if (!sets.length) continue;
      const spec = planFor(ww, kk).find(p => p.slot === slot); found.push({ slot, sets, spec }); }
    if (found.length) return { w: ww, k: kk, items: found };
  }
  return null; }
function lastAny(exId) { for (let w = 12; w >= 1; w--) for (let i = ORDER.length - 1; i >= 0; i--) { const h = history(w, ORDER[i], exId); if (h) return h; } return null; }
function bestE1rm(h) { let best = null;
  h.items.forEach(it => it.sets.forEach(s => { if (!s.w || !s.r) return; const rpe = s.rpe ?? (it.spec && it.spec.rpe) ?? 8; const v = e1rm(s.w, s.r, Math.min(10, rpe)); if (!best || v > best) best = v; }));
  return best; }
function incFor(exId) { return /fs|pend|hack|legpress|trap|ht|glute|row|bss|rev_lunge|rdl|hyper|calf|tbar|goblet|stepup/.test(exId) ? 5 : 2.5; }
const isPrio = exId => { const m = LIB[exId] && LIB[exId].muscles; if (!m) return false; return PRIORITY.some(p => m[p] >= 1); };

function planSuggestion(w, k, spec, exId, rd) {
  const tgt = spec.rpe != null ? spec.rpe + (spec.type === 'main' ? rd.rpeShift : 0) : null;
  const h = history(w, k, exId) || archiveHistory(exId); const rng = repRange(spec.reps);
  if (spec.type === 'time') { const rr = repRange(spec.reps); return { txt: $t('Zeit pro Satz: ') + spec.reps + $t(' s. Gleichmäßig, Technik vor Tempo.'), cls: 'first', reps: rr && rr.lo }; }
  if (spec.type === 'power') return { txt: $t('Jede Wiederholung maximal schnell. Qualität vor Menge.'), cls: 'first' };
  if (spec.type === 'bo') {
    const top = (sess(w, k).logs.bench_top ? loggedSets(sess(w, k).logs.bench_top) : []).find(s => s.w);
    const pct = phase(w) === 'b3' ? .85 : .9;
    if (!top) return { txt: $t('Erst das Top-Set loggen, dann ') + Math.round(pct * 100) + $t(' % davon.'), cls: 'first' };
    return { load: r25(top.w * pct), reps: rng && rng.lo, txt: fmt(r25(top.w * pct)) + $t(' kg, ') + Math.round(pct * 100) + $t(' % vom Top-Set'), cls: '' }; }
  if (!h) return { txt: tgt != null ? $t('Erste Einheit: Gewicht für RPE ') + fmt(tgt) + $t(' wählen, eher vorsichtig.') : $t('Erste Einheit.'), cls: 'first', reps: rng && rng.lo };
  if (spec.type === 'main') {
    const est = bestE1rm(h); if (!est) return { txt: $t('Kein Gewicht im Verlauf. Nach RPE ') + fmt(tgt) + $t(' wählen.'), cls: 'first' };
    const reps = parseInt(spec.reps, 10) || 5; const load = r25(loadFor(est, reps, tgt));
    return { load, reps, est, txt: fmt(load) + $t(' kg × ') + reps + $t(' bei RPE ') + fmt(tgt) + (rd.rpeShift ? $t(' (Readiness −1)') : '') + $t(' · e1RM ') + fmt(est, 0), cls: '' }; }
  const sets = h.items.flatMap(it => it.sets); const lastSpec = h.items[0].spec || spec;
  if (spec.type === 'bw') {
    const tot = sets.reduce((a, s) => a + (s.r || 0), 0);
    if (spec.slot === 'pu_vol') { const per = sets.map(s => s.r || 0); if (per.length >= 5 && per.every(r => r >= 7)) return { txt: $t('5×7 geschafft. Ab jetzt 5×5 mit +2,5 kg.'), cls: '', reps: 5 };
      return { txt: $t('Zuletzt ') + tot + $t(' Reps gesamt. Heute ') + (tot + 1) + $t(' anpeilen.'), cls: '', reps: rng && rng.lo }; }
    if (spec.reps === 'AMRAP') return { txt: $t('Test: so viele saubere Wiederholungen wie möglich.'), cls: '' };
    return { txt: $t('Zuletzt ') + sets.map(s => s.r ?? '–').join('/') + $t('. Bewusst leicht halten.'), cls: 'hold', reps: rng && rng.lo }; }
  if (spec.type === 'carry') { const top = Math.max(0, ...sets.map(s => s.w || 0)); return top ? { load: top + 2, reps: 30, txt: $t('Zuletzt ') + fmt(top) + $t(' kg. Bei sauberer Haltung +2 kg.'), cls: '' } : { txt: $t('Gewicht eintragen'), cls: 'first' }; }
  const rOld = repRange(lastSpec.reps); const ws = sets.map(s => s.w).filter(x => x != null && x !== 0); const top = ws.length ? Math.max(...ws) : null;
  const rpes = sets.map(s => s.rpe).filter(x => x != null); const lastRpe = rpes.length ? Math.max(...rpes) : null;
  const hitTop = rOld && sets.length && sets.every(s => s.r != null && s.r >= rOld.hi); const inc = incFor(exId);
  if (lastRpe != null && tgt != null && lastRpe > tgt + 0.5 && tgt < 9.5) return { load: top, reps: rng && rng.lo, txt: top != null ? fmt(top) + $t(' kg halten. Letzte RPE ') + fmt(lastRpe) + $t(' lag über Ziel.') : $t('Halten. RPE lag über Ziel.'), cls: 'hold' };
  if (top == null) return { reps: rng && (hitTop ? rng.lo : rng.hi), txt: hitTop ? $t('Oberes Rep-Ziel erreicht: Zusatzgewicht oder schwerere Variante.') : $t('Ein Rep mehr pro Satz anpeilen.'), cls: hitTop ? '' : 'hold' };
  if (hitTop) return { load: top + inc, reps: rng && rng.lo, txt: fmt(top + inc) + $t(' kg (+') + fmt(inc) + $t('), zurück auf ') + (rng ? rng.lo : '') + $t(' Reps'), cls: '' };
  const minR = Math.min(...sets.map(s => s.r || 0));
  return { load: top, reps: Math.min(rng ? rng.hi : minR + 1, minR + 1), txt: fmt(top) + $t(' kg halten, ein Rep mehr pro Satz'), cls: 'hold' }; }

function setSuggestion(w, k, spec, exId, i, base, rd, rawSets) {
  const raw = rawSets || (((sess(w, k).logs[spec.slot]) || {}).sets) || [];
  let prev = null; for (let j = i - 1; j >= 0; j--) { const x = raw[j]; if (x && x.done && num(x.r) != null) { prev = { w: num(x.w), r: num(x.r), rpe: num(x.rpe) }; break; } }
  const rng = repRange(spec.reps); const tgt = spec.rpe != null ? spec.rpe + (spec.type === 'main' ? rd.rpeShift : 0) : null;
  if (!prev) return { load: base.load ?? null, reps: base.reps ?? (rng && rng.lo), why: '' };
  if (prev.w == null) return { load: null, reps: prev.r, why: '' };
  if (spec.type === 'main' && prev.rpe != null) {
    const reps = parseInt(spec.reps, 10) || prev.r; const load = r25(loadFor(e1rm(prev.w, prev.r, prev.rpe), reps, tgt));
    return { load, reps, why: load > prev.w ? $t('Letzter Satz leichter als Ziel, also mehr') : load < prev.w ? $t('Letzter Satz schwerer als Ziel, also weniger') : '' }; }
  if ((spec.type === 'bo' || spec.type === 'dp') && prev.rpe != null && tgt != null) {
    const inc = spec.type === 'bo' ? 2.5 : incFor(exId);
    if ((prev.rpe >= tgt + 1 && tgt < 9.5) || (rng && prev.r < rng.lo - 1)) return { load: Math.max(0, prev.w - inc), reps: rng && rng.lo, why: $t('Zu schwer, also −') + fmt(inc) + $t(' kg') };
    if (prev.rpe <= tgt - 1.5 && (!rng || prev.r >= rng.hi)) return { load: prev.w + inc, reps: rng && rng.lo, why: $t('Zu leicht, also +') + fmt(inc) + $t(' kg') };
    return { load: prev.w, reps: prev.r, why: '' }; }
  return { load: prev.w, reps: prev.r, why: '' }; }

/* ======================= VOLUMEN ======================= */
function addVol(v, exId, n) { const ex = LIB[exId]; if (!ex) return; for (const m in ex.muscles) v[m] += n * ex.muscles[m]; }
function weekVolume(w) { const v = {}; Object.keys(MUSCLES).forEach(m => v[m] = 0);
  GYM().forEach(k => { const s = peekSess(w, k); if (!s) return; for (const slot in s.logs) { const lg = s.logs[slot]; addVol(v, lg.ex, (lg.sets || []).filter(x => x && x.done).length); } });
  S.activities.filter(a => a.week === w && a.exercises).forEach(a => a.exercises.forEach(e => addVol(v, e.ex, (e.sets || []).filter(x => x && x.done).length)));
  return v; }
function plannedVolume(w) { const v = {}; Object.keys(MUSCLES).forEach(m => v[m] = 0); GYM().forEach(k => planFor(w, k).forEach(p => addVol(v, p.ex, p.sets))); return v; }

/* ======================= ERNÄHRUNG ======================= */
const PRESET_MAP = Object.fromEntries(PRESET_FOODS.map(f => [f.id, f]));
const getFood = id => S.foods[id] || PRESET_MAP[id];
const OFF_LANGS = [LANG, 'en', 'de'].filter((x, i, a) => a.indexOf(x) === i).join(',');
const foodName = f => (f.names && (f.names[LANG] || f.names.en || f.names.de || f.names.ru)) || f.name;
function entryName(e) { const f = getFood(e.food); return f && f.src !== 'quick' ? foodName(f) : e.name; }
function unitsFor(f) { const u = []; if (f.base === '100g') { u.push('g'); if (f.pieceG) u.push('Stk'); } else { u.push('Stk'); if (f.pieceG) u.push('g'); } return u; }
function macrosFor(f, qty, unit) { let factor;
  if (f.base === '100g') { const g = unit === 'g' ? qty : qty * (f.pieceG || 0); factor = g / 100; }
  else { factor = unit === 'Stk' ? qty : qty / (f.pieceG || 1); }
  const m = { kcal: f.kcal * factor, p: f.p * factor, f: f.f * factor, c: f.c * factor }; if (f.fib != null) m.fib = f.fib * factor; if (f.sug != null) m.sug = f.sug * factor; if (f.salt != null) m.salt = f.salt * factor; return m; }
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
  if (!S.meta.onboarded && route.name !== 'start' && route.name !== 'datenschutz' && !VIEW) { location.hash = '#start'; return; }
  document.body.classList.toggle('onb-mode', route.name === 'start');
  if (!VIEW) maybeAdvance();
  const tabName = route.name === 'frei' ? 'training' : ['mehr', 'admin', 'plan', 'start', 'datenschutz'].includes(route.name) ? '' : ['library', 'workout', 'track'].includes(route.name) ? 'training' : route.name;
  document.querySelectorAll('#tabbar a').forEach(a => a.classList.toggle('on', a.dataset.r === tabName));
  const v = $('#view'); const y = window.scrollY;
  const map = { training: () => route.arg ? viewSession(route.arg) : viewTraining(), frei: () => viewFree(route.arg), essen: viewEssen, verlauf: viewProgress, mehr: viewMehr, start: () => viewStart(route.arg), library: () => route.arg ? viewLibPlan(route.arg) : viewLibrary(), workout: () => viewWorkout(route.arg), admin: () => viewAdmin(route.arg), plan: () => viewPlan(route.arg), track: () => viewTrack(), datenschutz: () => viewPrivacy() };
  v.innerHTML = viewBar() + (map[route.name] || viewHeute)();
  if (route.name === 'training' && route.arg) keepAwake(); else if ($('#timer').hidden && wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
  if (route.name === 'verlauf') refreshPhotoCard();
  window.scrollTo(0, scrollTop ? 0 : y); }
function softPatch(id, html) { const el = document.getElementById(id); if (!el || !el.isConnected) return; const tmp = document.createElement('div'); tmp.innerHTML = html; const nu = tmp.firstElementChild; if (!nu) return;
  const oldSets = el.querySelector('.sets'), newSets = nu.querySelector('.sets');
  Array.from(el.children).forEach(c => { if (c !== oldSets && c.parentNode === el) { try { c.remove(); } catch (e) {} } });
  const anchor = oldSets && oldSets.parentNode === el ? oldSets : null; Array.from(nu.children).forEach(c => { if (c !== newSets) el.insertBefore(c, anchor); });
  if (oldSets && newSets) { const or = oldSets.querySelectorAll('.set'), nr = newSets.querySelectorAll('.set'); nr.forEach((n, i) => { const o = or[i]; if (!o) return; o.className = n.className;
      n.querySelectorAll('input').forEach(ni => { const oi = document.getElementById(ni.id); if (!oi) return; oi.placeholder = ni.placeholder; if (document.activeElement !== oi && oi.value !== ni.value) oi.value = ni.value; }); }); } }
const pageTop = (accent, rest, sub, extra) => '<div class="top"><div class="grow"><h1><span class="t-ember">' + accent + '</span>' + (rest ? ' ' + rest : '') + '</h1>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' + (extra || '') + $t('<a class="iconbtn" href="#mehr" aria-label="Einstellungen">') + ICON.gear + '</a></div>';
const note = (dot, html, btn) => '<div class="note-card"><span class="dot ' + dot + '"></span><div class="grow">' + html + '</div>' + (btn || '') + '</div>';
const badge = k => { const s = SESS[k]; return '<span class="badge ' + s.kind + '">' + (s.kind === 'z2' ? 'Z2' : s.kind === 'hiit' ? 'H' : k) + '</span>'; };

/* ======================= HEUTE ======================= */
function viewHeute() {
  const t = today(), d = new Date(), w = curWeek(), st = S.settings;
  const ser = series(), last = ser[ser.length - 1], rate = weeklyRate(ser), tg = currentTargets(), tot = dayTotals(t);
  const planned = S.settings.mode === 'rotation' ? ORDER.filter(k => !sessProgress(w, k).done).slice(0, 1) : sessionsOnDow(d.getDay());
  const open = ORDER.filter(k => !sessProgress(w, k).done);
  let train = '';
  planned.forEach(k => { const pr = sessProgress(w, k); const s = SESS[k];
    train += '<a class="li" href="#training/' + sKey(w, k) + '">' + badge(k) + '<div class="grow"><b>' + s.title + '</b><small>' + esc(sessSub(w, k)) + '</small></div><span class="tag"><span class="dot ' + (pr.done ? 'green' : pr.f ? 'amber' : 'mist') + '"></span>' + (pr.skipped ? $t('übersprungen') : pr.done ? $t('erledigt') : pr.f ? pr.f + '/' + pr.t : $t('offen')) + '</span></a>'; });
  const others = open.filter(k => !planned.includes(k));
  const trainCard = !ORDER.length ? noPlanCard() : $t('<div class="card flush"><div class="meal-h"><b>Training · Woche ') + w + '</b><span class="tag">' + PH_LABEL[phase(w)] + '</span></div>' +
    (train ? (S.settings.mode === 'rotation' ? $t('<div class="lbl" style="padding:0 20px">Als Nächstes</div>') : '') + '<div class="list">' + train + '</div>' : '<div style="padding:0 20px 14px" class="muted">' + (S.settings.mode === 'rotation' ? $t('Woche ') + w + $t(' ist komplett.') : $t('Heute ist kein Training eingeplant.')) + '</div>') +
    (others.length ? '<div style="padding:4px 20px 18px"><div class="lbl" style="margin-bottom:8px">' + (train ? $t('Diese Woche noch offen') : $t('Nachholen oder vorziehen')) + '</div><div class="row">' + others.map(k => '<a class="btn sm" href="#training/' + sKey(w, k) + '">' + SESS[k].title + (st.dayMap[k] === '' || st.dayMap[k] == null ? '' : ' <span class="muted">' + WD[st.dayMap[k]] + '</span>') + '</a>').join('') + '</div></div>' : '') + '</div>';
  const todaysActs = S.activities.filter(a => a.date === t);
  const acts = todaysActs.length ? $t('<div class="card flush"><div class="meal-h"><b>Aktivitäten heute</b></div><div class="list">') + todaysActs.map(actRow).join('') + '</div></div>' : '';
  const due = checkinDue();
  return pageTop(WD_LONG[d.getDay()] + ',', LANG === 'de' ? d.getDate() + '. ' + MON[d.getMonth()] : d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' }), S.block.startedOn ? $t('Block seit ') + fmtDay(S.block.startedOn) : $t('Dein Block startet mit der ersten Einheit.')) +
  '<div class="stack">' + updateNote() + heuteExtras() +
  (due ? note('ember', $t('<b>Wöchentlicher Check-in fällig.</b> Bedarf und Kalorienziel werden aus deinem Gewichtstrend neu berechnet.'), $t('<button class="btn brand sm" data-act="checkin" type="button">Check-in</button>')) : '') +
  readinessCard(t) + trainCard + healthStrip(t) +
  (w > 1 && !ORDER.some(k => sessProgress(w, k).done) && weekDone(w - 1) ? note('green', $t('<b>Woche ') + (w - 1) + $t(' geschafft.</b> Dein Wochenbericht ist fertig.'), '<button class="btn sm" data-act="showReport" data-w="' + (w - 1) + $t('" type="button">Ansehen</button>')) : '') +
  $t('<div class="card"><div class="row"><div class="field"><label for="wToday">Gewicht heute</label><input id="wToday" type="number" inputmode="decimal" step="0.1" data-day="') + t + '" data-f="weight" value="' + esc(S.days[t] && S.days[t].weight) + $t('" placeholder="kg"></div>') +
  $t('<div class="grow"></div><div style="text-align:right"><div class="lbl">Trend</div><div class="big num">') + (last ? fmt(last.trend) + $t(' kg') : '–') + '</div><div class="small ' + (rate != null && rate < 0 ? 't-green' : 'muted') + '" style="font-weight:700">' + (rate != null ? (rate <= 0 ? '−' : '+') + fmt(Math.abs(rate), 2) + $t(' kg pro Woche') : $t('Trend ab 8 Tagen')) + '</div></div></div></div>' +
  $t('<a class="card" href="#essen" style="text-decoration:none;color:inherit;display:block"><div class="row" style="margin-bottom:12px"><h2 class="grow">Ernährung</h2><span class="small muted">Ziel ') + fmt(tg.kcal, 0) + $t(' kcal</span></div>') + rings(tot, tg) + '</a>' +
  acts + '</div>'; }
function healthStrip(d) { const h = S.health[d] || {}, y = S.health[addDays(d, -1)] || {}; const base = rhrBaseline(); const rhr = rhrOf(d);
  const steps = h.steps, goal = num(S.settings.stepGoal) || 9000; const src = h.src || S.healthMeta.source;
  const conn = HEALTH.native ? $t('<button class="iconbtn" type="button" data-act="hcSync" aria-label="Gesundheitsdaten synchronisieren" style="background:var(--paper)">') + ICON.sync + '</button>' : '';
  const nodata = steps == null && rhr == null && h.sleepMin == null;
  return $t('<div class="card"><div class="row" style="margin-bottom:12px"><h2 class="grow">Gesundheit</h2>') + conn + '</div>' +
  (nodata ? $t('<p class="muted" style="margin-top:0">Noch keine Werte für heute. ') + (HEALTH.native ? $t('Tippe auf Synchronisieren, um die Daten deiner Uhr aus Health Connect zu holen.') : $t('In der Android-App kommen sie direkt von deiner Uhr. Hier kannst du sie unter „Einstellungen“ importieren.')) + '</p>' : '') +
  '<div class="health' + (h.hrv ? $t(' four') : '') + '">' +
  $t('<div class="stat" style="background:var(--paper)"><div class="k">Schritte</div><div class="v num">') + (steps != null ? fmt(steps, 0) : '–') + '</div><div class="meter" style="background:var(--fog)"><i style="width:' + Math.min(100, (steps || 0) / goal * 100) + '%"></i></div>' + deltaTag(steps, avgPrev('steps', d, 30), true, '') + '</div>' +
  $t('<div class="stat" style="background:var(--paper)"><div class="k">Ruhepuls</div><div class="v num">') + (rhr != null ? fmt(rhr, 0) : '–') + '</div><div class="s">' + (base ? $t('Basis ') + base.v : $t('Basis fehlt')) + '</div>' + deltaTag(rhr, avgPrev('rhr', d, 30), false, $t(' bpm')) + '</div>' +
  $t('<div class="stat" style="background:var(--paper)"><div class="k">Schlaf</div><div class="v num">') + (h.sleepMin != null ? fmtMin(h.sleepMin) : '–') + '</div><div class="s">' + (h.deep != null ? $t('Tief ') + fmt(h.deep, 0) + $t(' min') : '&nbsp;') + '</div>' + deltaTag(h.sleepMin, avgPrev('sleepMin', d, 30), true, $t(' min')) + '</div>' +
  (h.hrv ? $t('<div class="stat" style="background:var(--paper)"><div class="k">HRV</div><div class="v num">') + fmt(h.hrv, 0) + $t('</div><div class="s">ms</div>') + deltaTag(h.hrv, avgPrev('hrv', d, 30), true, $t(' ms')) + '</div>' : '') +
  '</div>' + (src && !nodata ? $t('<div class="src" style="margin-top:8px">Quelle: ') + esc({ hc: $t('Health Connect'), zepp: $t('Datei-Import'), manual: $t('manuell') }[src] || src) + (S.healthMeta.lastSync ? $t(' · Stand ') + new Date(S.healthMeta.lastSync).toLocaleString(LOCALE, { day: 'numeric', month: 'numeric', hour: $t('2-digit'), minute: $t('2-digit') }) : '') + '</div>' : '') + '</div>'; }
function rings(tot, tg) { const R = (v, t, color, lab, unit) => { const pct = t ? Math.min(1, v / t) : 0, over = t && v > t * 1.05, C = 2 * Math.PI * 28;
    return '<div class="ring"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="28" fill="none" stroke="var(--paper)" stroke-width="8"/>' + (pct > 0 ? '<circle cx="36" cy="36" r="28" fill="none" stroke="' + (over ? $t('var(--signal)') : color) + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (C * pct).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 36 36)"/>' : '') + '</svg><div class="v num">' + fmt(v, 0) + '</div><div class="t">' + lab + ' / ' + fmt(t, 0) + unit + '</div></div>'; };
  return '<div class="rings">' + R(tot.kcal, tg.kcal, $t('var(--signal)'), $t('kcal'), '') + R(tot.p, tg.p, $t('var(--plum)'), $t('Protein'), $t(' g')) + R(tot.c, tg.c, $t('var(--sky)'), $t('KH'), $t(' g')) + R(tot.f, tg.f, $t('var(--verdant)'), $t('Fett'), $t(' g')) + '</div>'; }
function actRow(a) { const t = ACT_MAP[a.type] || ACT_MAP.sonst; const bits = [];
  if (num(a.dur) != null) bits.push(fmt(num(a.dur), 0) + $t(' min')); if (num(a.dist) != null) bits.push(fmt(num(a.dist), 1) + $t(' km')); if (num(a.avgHr) != null) bits.push('Ø ' + fmt(num(a.avgHr), 0) + $t(' bpm'));
  if (a.exercises) bits.push(a.exercises.length + $t(' Übungen'));
  return '<a class="li" href="#frei/' + a.id + '"><span class="badge act sm">' + esc(t.short) + '</span><div class="grow"><b>' + esc(a.title || t.name) + '</b><small>' + esc(fmtDay(a.date) + (bits.length ? ' · ' + bits.join(' · ') : '')) + (a.countsAs ? $t(' · zählt als ') + SESS[a.countsAs].title : '') + (a.src && a.src !== 'manual' ? ' · ' + esc(srcLabel(a)) : '') + '</small></div><span class="chev">›</span></a>'; }

/* ======================= TRAINING ======================= */
function viewTraining() {
  if (!ORDER.length) return noPlanView();
  const cw = curWeek(); if (!ui.week) ui.week = cw; const w = ui.week;
  let n = 0; ORDER.forEach(k => { if (sessProgress(w, k).done) n++; });
  const weeks = Array.from({ length: 12 }, (_, i) => { const x = i + 1; return '<button class="wk' + (x === w ? $t(' on') : '') + (x === cw ? $t(' cur') : '') + (weekDone(x) ? $t(' done') : '') + '" data-act="week" data-w="' + x + '" type="button" aria-label="Woche ' + x + '"><b>' + x + '</b><i class="ph-' + phase(x) + '"></i></button>'; }).join('');
  const rows = ORDER.map(k => { const s = SESS[k], pr = sessProgress(w, k); const sub = sessSub(w, k);
    const se = peekSess(w, k); const when = se && se.date ? fmtDay(se.date) : dayLabel(k);
    return '<a class="li" href="#training/' + sKey(w, k) + '">' + badge(k) + '<div class="grow"><b>' + s.title + '</b><small>' + esc(when + (sub ? ' · ' + sub : '')) + '</small></div><span class="tag"><span class="dot ' + (pr.done ? 'green' : pr.f ? 'amber' : 'mist') + '"></span>' + (pr.skipped ? $t('übersprungen') : pr.done ? $t('erledigt') : pr.f ? pr.f + '/' + pr.t : $t('offen')) + '</span></a>'; }).join('');
  const frees = S.activities.filter(a => a.week === w && a.week);
  const warn = scheduleWarnings();
  const vol = weekVolume(w), pv = plannedVolume(w);
  const finishBtn = w === cw && !weekDone(w) && cw < 12 ? (ui.confirmFinish ? $t('<div class="row"><span class="grow small">Offene Einheiten werden als übersprungen markiert.</span><button class="btn sm" data-act="finishNo" type="button">Abbrechen</button><button class="btn dark sm" data-act="finishYes" type="button">Ja, abschließen</button></div>') : $t('<button class="btn block" data-act="finish" type="button">Woche ') + w + $t(' abschließen und weiter</button>')) : '';
  return pageTop($t('Woche ') + w, PH_LABEL[phase(w)], n + $t(' von ') + ORDER.length + $t(' Einheiten erledigt') + (w !== cw ? $t(' · aktuell Woche ') + cw : '')) +
  '<div class="stack"><div class="weeks">' + weeks + '</div>' +
  $t('<div class="legend"><span><i class="ph-b1"></i>Einstieg</span><span><i class="ph-b2"></i>Aufbau</span><span><i class="ph-b3"></i>Intensiv</span><span><i class="ph-dl"></i>Deload</span><span><i class="ph-test"></i>Test</span></div>') +
  warn.map(x => note('amber', esc(x), $t('<a class="btn sm" href="#mehr">Ändern</a>'))).join('') +
  '<div class="card flush"><div class="list">' + rows + '</div></div>' + finishBtn +
  planInfoCard() + workoutsSection() +
  $t('<div class="section-h"><h2>Freies Training</h2><button class="btn sm fog" data-act="newAct" type="button">+ Aktivität</button></div>') +
  (frees.length ? '<div class="card flush"><div class="list">' + frees.map(actRow).join('') + '</div></div>' : $t('<p class="muted small" style="margin:0 4px">Spontan joggen, schwimmen oder frei trainieren? Über das Plus unten rechts eintragen.</p>')) +
  (weekDone(w) || w < cw ? weekReport(w) : '') + bodyCard(w) +
  $t('<div class="card"><h2>Volumen Woche ') + w + $t('</h2><p class="small muted" style="margin-bottom:14px">Erledigte Sätze pro Muskel, Hilfsmuskeln anteilig. Lila = Schwerpunkt, grau hinterlegt = Zielbereich. In Klammern: geplant.</p>') + volBars(vol, pv) + '</div></div>'; }
function volBars(v, pv) { const max = 24; return '<div class="vol">' + Object.keys(MUSCLES).map(m => { const p = PRIORITY.includes(m), tr = p ? VOL_TARGET.prio : VOL_TARGET.other;
  return '<span>' + MUSCLES[m] + '</span><div class="b"><u style="left:' + (tr[0] / max * 100) + '%;width:' + ((tr[1] - tr[0]) / max * 100) + '%"></u><i class="' + (p ? 'p' : '') + '" style="width:' + Math.min(100, v[m] / max * 100) + '%"></i></div><span class="num small">' + fmt(v[m], 0) + ' <span class="muted">(' + fmt(pv[m], 0) + ')</span></span>'; }).join('') + '</div>'; }

function viewSession(key) {
  const m = key.match(RE_SESS); if (!m || !SESS[m[2]]) return $t('<p>Einheit nicht gefunden.</p>');
  const w = +m[1], k = m[2]; ui.week = w; const d = SESS[k]; const se = peekSess(w, k);
  const head = '<a href="#training" class="back">' + ICON.back + $t('Woche ') + w + '</a>' + pageTop(d.title, d.sub, PH_LABEL[phase(w)] + ' · ' + (se && se.date ? $t('gestartet ') + fmtDay(se.date) : $t('geplant ') + dayLabel(k)));
  if (isCardio(k)) return head + cardioView(w, k);
  const s = sess(w, k), c = s.check || {}, rd = readiness(w, k);
  const check = $t('<div class="card"><h2 style="margin-bottom:12px">Check-in nach dem Aufwärmen</h2><div class="fields">') +
    $t('<div class="field"><label for="sdate">Datum</label><input id="sdate" type="date" data-sdate="1" data-sw="') + w + '" data-sk="' + k + '" value="' + esc(s.date || today()) + '" style="width:170px"></div>' +
    $t('<div class="field"><label for="ckb">Rücken 0–10</label><input id="ckb" type="number" inputmode="numeric" min="0" max="10" data-sw="') + w + '" data-sk="' + k + '" data-ck="back" value="' + esc(c.back) + '" placeholder="–"></div>' +
    $t('<div class="field"><label for="ckr">Ruhepuls') + (rd.autoRhr ? $t(' (Uhr)') : '') + '</label><input id="ckr" type="number" inputmode="numeric" data-sw="' + w + '" data-sk="' + k + '" data-ck="rhr" value="' + esc(c.rhr) + '" placeholder="' + (rd.autoRhr ? fmt(rd.rhr, 0) : $t('bpm')) + '"></div>' +
    $t('<div class="field"><label for="cks">Schlaf') + (rd.autoSleep ? $t(' (Uhr: ') + fmtMin(rd.sleepMin) + ')' : '') + '</label><select id="cks" data-sw="' + w + '" data-sk="' + k + '" data-ck="sleep"><option value="">' + (rd.autoSleep ? $t('automatisch: ') + $t(rd.sleep) : '–') + '</option>' + ['gut', 'ok', 'schlecht'].map(o => '<option value="' + o + '"' + (c.sleep === o ? $t(' selected') : '') + '>' + $t(o) + '</option>').join('') + '</select></div></div></div>';
  const watch = s.watch ? note('sky', $t('Uhr: ') + fmt(s.watch.dur, 0) + $t(' min') + (s.watch.kcal ? ' · ' + fmt(s.watch.kcal, 0) + $t(' kcal') : '') + $t(' von der Uhr übernommen.')) : '';
  return head + '<div class="stack">' + check + flagsHTML(w, k) + watch + planFor(w, k).map(spec => exCard(w, k, spec)).join('') + endCard(w, k) + traceCard(sKey(w, k), gymWindow(s), false) +
    (s.skipped ? '<button class="btn block" data-act="unskip" data-w="' + w + '" data-k="' + k + $t('" type="button">Wieder öffnen</button>') : '<button class="btn block fog" data-act="skip" data-w="' + w + '" data-k="' + k + $t('" type="button" style="background:var(--fog)">Einheit überspringen</button>')) + '</div>'; }
function endCard(w, k) { const s = sess(w, k); const e = s.end || {}; const ad = autoDur(s) || (s.watch && Math.round(s.watch.dur)); const L = sessLoad(w, k);
  return $t('<div class="card" id="endcard"><h2>Einheit abschließen</h2><p class="small muted">Etwa 30 Minuten nach dem Training: Wie hart war die ganze Einheit? 0 = Ruhe, 10 = maximal.</p><div class="fields" style="margin-top:12px">') +
    $t('<div class="field"><label for="se-dur">Dauer (min)</label><input id="se-dur" type="number" inputmode="numeric" data-se="dur" data-sw="') + w + '" data-sk="' + k + '" value="' + esc(e.dur) + '" placeholder="' + (ad || 'min') + '"></div>' +
    $t('<div class="field"><label for="se-rpe">Session-RPE</label><input id="se-rpe" type="number" inputmode="decimal" step="0.5" min="0" max="10" data-se="rpe" data-sw="') + w + '" data-sk="' + k + '" value="' + esc(e.rpe) + '" placeholder="0–10"></div></div>' +
    (L && L.load ? $t('<p class="small" style="margin-top:10px">Belastung: <b>') + fmt(L.load, 0) + $t('</b> (Dauer × RPE)</p>') : ad ? $t('<p class="small muted" style="margin-top:10px">Dauer aus deinen Sätzen geschätzt: ') + ad + $t(' min.</p>') : '') + finBtn(w, k) + '</div>'; }
function flagsHTML(w, k) { const r = readiness(w, k); let h = '';
  const pl = planFor(w, k), hasFs = pl.some(p => p.slot === 'fs'), hasTrap = pl.some(p => p.slot === 'trap');
  if (r.backRed) { const s = peekSess(w, k); const swapped = s && s.swaps && (s.swaps.fs === 'pend' || s.swaps.trap === 'glute_bridge');
    h += note('red', $t('<b>Rücken-Ampel rot</b> (') + r.back + '/10' + (r.pb != null ? $t(', letztes Mal ') + r.pb : '') + '). ' + (hasFs ? $t('Front Squat → Pendulum Squat.') : hasTrap ? $t('Trap Bar → Glute Bridge.') : $t('Achte bei allen Übungen auf neutralen Rücken.')), !hasFs && !hasTrap ? '' : swapped ? $t('<span class="tag">getauscht</span>') : '<button class="btn sm brand" data-act="backswap" data-w="' + w + '" data-k="' + k + $t('" type="button">Tauschen</button>')); }
  if (r.backAmber) h += note('amber', $t('Letzte Einheit lag dein Rücken bei ') + r.pb + $t('/10. Nach dem Aufwärmen oben eintragen.'));
  if (r.rhrHigh) h += note('amber', $t('<b>Ruhepuls erhöht</b> (') + fmt(r.rhr, 0) + $t(' statt ') + r.base.v + $t('). Top-Sätze heute eine RPE-Stufe leichter. Die Vorschläge sind schon angepasst.'));
  else if (r.sleepBad) h += note('amber', $t('<b>Wenig Schlaf') + (r.sleepMin != null ? ' (' + fmtMin(r.sleepMin) + ')' : '') + $t('.</b> Top-Sätze eine RPE-Stufe leichter. Die Vorschläge sind schon angepasst.'));
  else if (r.dr && r.dr.score < 50) h += note(r.dr.level === 'red' ? 'red' : 'amber', $t('<b>Bereitschaft ') + r.dr.score + ' %.</b> ' + esc(r.dr.rec) + $t(' Die RPE-Vorschläge sind schon angepasst.'));
  if (r.runPrev) h += note('sky', '<b>' + esc(ACT_MAP[r.runPrev.type].name) + ' ' + (r.runPrev.date === today() ? $t('heute') : $t('gestern')) + $t('.</b> Laufen belastet die Beine stärker als Rad oder Rudern. Die Hauptübung nach RPE steuern, nicht nach der Plan-Last.'));
  return '<div id="flags" class="stack">' + h + '</div>'; }

function setRows(prefix, spec, raw, sugg, showRpe, tgt, isCarry, dataAttrs) { let rows = '';
  for (let i = 0; i < spec.sets; i++) { const v = raw[i] || {}; const sg = sugg(i);
    const wPh = sg.load != null ? fmt(sg.load) : $t('kg'), rPh = sg.reps != null ? String(sg.reps) : (isCarry === 'time' ? 's' : isCarry ? 'm' : $t('Reps'));
    rows += '<div class="set' + (v.done ? $t(' done') : '') + '"><span class="n">' + (i + 1) + '</span>' +
      '<input id="' + prefix + i + '-w" type="number" inputmode="decimal" step="any" ' + dataAttrs + ' data-i="' + i + '" data-f="w" value="' + esc(v.w) + '" placeholder="' + esc(wPh) + '" aria-label="Satz ' + (i + 1) + ' kg">' +
      '<input id="' + prefix + i + '-r" type="number" inputmode="numeric" ' + dataAttrs + ' data-i="' + i + '" data-f="r" value="' + esc(v.r) + '" placeholder="' + esc(rPh) + '" aria-label="Satz ' + (i + 1) + ' ' + (isCarry ? $t('Meter') : $t('Wiederholungen')) + '">' +
      (showRpe ? '<input id="' + prefix + i + '-rpe" type="number" inputmode="decimal" step="0.5" ' + dataAttrs + ' data-i="' + i + '" data-f="rpe" value="' + esc(v.rpe) + '" placeholder="' + (tgt != null ? fmt(tgt) : $t('RPE')) + '" aria-label="Satz ' + (i + 1) + ' RPE">' : '<span></span>') +
      '<button class="chk" type="button" data-act="done" ' + dataAttrs + ' data-i="' + i + '" aria-label="Satz ' + (i + 1) + ' erledigt">' + ICON.check + '</button></div>'; }
  return $t('<div class="sets"><div class="sethead"><span>#</span><span>kg</span><span>') + (isCarry === 'time' ? $t('Sek.') : isCarry ? $t('Meter') : $t('Reps')) + '</span><span>' + (showRpe ? $t('<button class="rpehelp" type="button" data-act="rpeHelp">RPE ?</button>') : '') + '</span><span></span></div>' + rows + '</div>'; }
function exCard(w, k, spec0) {
  const s = sess(w, k); const lg = s.logs[spec0.slot]; const raw = (lg && lg.sets) || []; const extra = (lg && lg.extra) || 0; const spec = extra ? Object.assign({}, spec0, { sets: spec0.sets + extra }) : spec0;
  const exId = actualEx(w, k, spec), ex = LIB[exId], rd = readiness(w, k);
  const base = planSuggestion(w, k, spec, exId, rd); const tgt = spec.rpe != null ? spec.rpe + (spec.type === 'main' ? rd.rpeShift : 0) : null;
  const h = history(w, k, exId);
  const histTxt = h ? $t('Zuletzt Woche ') + h.w + ': ' + h.items.flatMap(it => it.sets).map(x => (x.w != null ? fmt(x.w) + ' × ' : '') + (x.r ?? '–') + (x.rpe != null ? ' @' + fmt(x.rpe) : '')).join(', ') : '';
  const isCarry = spec.type === 'carry' ? true : spec.type === 'time' ? 'time' : false, showRpe = spec.rpe != null && spec.type !== 'power' && spec.type !== 'time';
  const sugg = i => setSuggestion(w, k, spec, exId, i, base, rd);
  const nextWhy = (() => { for (let i = 0; i < spec.sets; i++) { if (!(raw[i] && raw[i].done)) { const sg = sugg(i); return sg.why ? $t('Satz ') + (i + 1) + ': ' + sg.why + (sg.load != null ? ' (' + fmt(sg.load) + $t(' kg)') : '') : ''; } } return ''; })();
  const swapped = exId !== spec.ex; const stall = (spec.type === 'main' || spec.type === 'dp') ? stallInfo(exId, w) : null;
  return '<div class="ex" id="ex-' + spec.slot + '"><div class="ex-h">' + exThumb(exId) + '<div class="grow"><button class="nm exlink" type="button" data-act="exInfo" data-ex="' + exId + '">' + (spec.sup ? '<span class="sup">' + spec.sup + '</span>' : '') + esc(ex.name) + '</button>' + (isPrio(exId) ? $t('<span class="prio">Schwerpunkt</span>') : '') + '<button class="histbtn" type="button" data-act="exHist" data-ex="' + exId + '">' + ICON.chart + $t('Verlauf</button>') +
    (swapped ? $t('<div class="swapped">statt ') + esc(LIB[spec.ex].name) + (!exAvailable(chosenEx(w, k, spec)) ? $t(' · Gerät fehlt') : '') + '</div>' : '') +
    '<div class="spec"><b>' + spec.sets + ' × ' + esc(spec.reps) + (isCarry === 'time' ? ' s' : isCarry ? ' m' : '') + '</b>' + (tgt != null ? $t(' bei RPE ') + fmt(tgt) : '') + (spec.rest ? $t(' · Pause ') + (spec.rest >= 60 ? fmt(spec.rest / 60) + $t(' min') : spec.rest + ' s') : spec.slot === 'lat_a' ? $t(' · ohne eigene Pause') : '') + '</div>' +
    ((spec.note || ex.note) ? '<div class="note">' + esc([$t(spec.note), ex.note].filter(Boolean).join(' ')) + '</div>' : '') + '</div>' +
    '<button class="btn sm" data-act="swap" data-slot="' + spec.slot + $t('" type="button">Varianten</button></div>') +
    (histTxt ? '<div class="hint">' + esc(histTxt) + '</div>' : '') + '<div class="sugg ' + (base.cls || '') + '">' + esc(base.txt) + '</div>' +
    (nextWhy ? '<div class="next">' + esc(nextWhy) + '</div>' : '') + (stall ? $t('<div class="next" style="color:var(--signal-ink)">Stillstand seit ') + stall.n + $t(' Einheiten: nächstes Mal 10 % leichter und in 2–3 Wochen neu aufbauen.</div>') : '') +
    setRows('s-' + spec.slot + '-', spec, raw, sugg, showRpe, tgt, isCarry, 'data-slot="' + spec.slot + '"') + exActions(exId, spec.type === 'main' || spec.type === 'bo', base.load, spec.type === 'main', spec.slot, extra) + '</div>'; }
function exActions(exId, plates, load, isMain, slot, extra) { return '<div class="ex-actions">' + (slot ? '<button class="btn sm" data-act="addSet" data-slot="' + slot + $t('" type="button">+ Satz</button>') + (extra ? '<button class="btn sm" data-act="remSet" data-slot="' + slot + $t('" type="button">− Satz</button>') : '') : '') + (plates ? '<button class="btn sm" data-act="plates" data-load="' + (load || '') + '" data-main="' + (isMain ? 1 : '') + '" data-ex="' + exId + $t('" type="button">Scheiben') + (isMain ? $t(' & Aufwärmen') : '') + '</button>' : '') +
  '<input class="exnote grow" id="exn-' + exId + '-' + (plates ? 'p' : 'n') + '" type="text" data-exnote="' + exId + '" value="' + esc(S.exNotes[exId]) + $t('" placeholder="Notiz, z. B. Sitz auf Stufe 4" aria-label="Notiz zur Übung"></div>'); }

function cardioView(w, k) {
  const s = sess(w, k); const c = s.cardio || {}; const hf = num(S.settings.hfmax) || 186; const z2 = [Math.round(hf * .65), Math.round(hf * .75)], hi = Math.round(hf * .9);
  const rd = readiness(w, k); let title, sub, zones; const act = countsAsActivity(w, k);
  const hk = isHiit(k), sp = cardioSpec(w, k); if (SESS[k].cardio) { title = cardioTitle(sp); sub = cardioSub(sp);
    zones = sp.mode === 'int' && sp.hi ? '<span class="tag"><span class="dot red"></span>' + $t('Intervalle ab ') + hi + $t(' bpm</span><span class="tag"><span class="dot green"></span>') + $t('Pausen locker</span>') : sp.mode === 'int' ? '<span class="tag"><span class="dot green"></span>' + $t('Locker laufen, gehen zur Erholung</span>') : '<span class="tag"><span class="dot green"></span>Z2 ' + z2[0] + '–' + z2[1] + $t(' bpm</span>'); }
  else if (hk) { const h = hiit(w); title = h.title; sub = h.sub;
    zones = h.mode === 'int' ? $t('<span class="tag"><span class="dot red"></span>Letzte 2 min je Intervall ab ') + hi + $t(' bpm</span><span class="tag"><span class="dot green"></span>Pausen locker</span>') : h.mode === 'z2' ? '<span class="tag"><span class="dot green"></span>Z2 ' + z2[0] + '–' + z2[1] + $t(' bpm</span>') : $t('<span class="tag"><span class="dot red"></span>Zeit unter „Leistung“ eintragen</span>'); }
  else { title = Z2MIN[w - 1] + $t(' min Z2'); sub = $t('Du kannst in ganzen Sätzen reden.'); zones = '<span class="tag"><span class="dot green"></span>Z2 ' + z2[0] + '–' + z2[1] + $t(' bpm</span>'); }
  const devs = hk ? ['', $t('Air-Bike'), $t('Incline-Laufband'), $t('Ergometer'), $t('Rudergerät')] : ['', $t('Rudergerät'), $t('Rad / Ergometer'), $t('Schwimmen'), $t('Incline Walk'), $t('Stepper'), $t('Joggen')];
  const f = (id, lab, ph, type) => '<div class="field"><label for="c-' + id + '">' + lab + '</label><input id="c-' + id + '" ' + (type === 'text' ? 'type="text" style="width:170px"' : 'type="number" inputmode="decimal"') + ' data-cw="' + w + '" data-ck2="' + k + '" data-cf="' + id + '" value="' + esc(c[id]) + '" placeholder="' + ph + '"></div>';
  const z = zeppWorkoutFor(s.date || today(), k);
  return '<div class="stack">' + (act ? note('green', $t('Erledigt durch ') + esc(ACT_MAP[act.type].name) + $t(' am ') + fmtDay(act.date) + '.', '<a class="btn sm" href="#frei/' + act.id + $t('">Ansehen</a>')) : '') +
    (hk && rd.rhrHigh ? note('amber', $t('<b>Ruhepuls erhöht</b> (') + fmt(rd.rhr, 0) + $t(' statt ') + rd.base.v + $t('). Heute ') + Z2MIN[w - 1] + $t(' min Z2 statt Intervalle.')) : hk && rd.dr && rd.dr.score < 34 ? note('red', $t('<b>Bereitschaft ') + rd.dr.score + $t(' %.</b> Heute ') + Z2MIN[w - 1] + $t(' min Z2 statt Intervalle.')) : '') +
    (z && num(c.dur) == null ? note('sky', $t('Deine Uhr hat heute ') + esc(z.title || ACT_MAP[z.type].name) + $t(' mit ') + fmt(z.dur, 0) + $t(' min aufgezeichnet.'), '<button class="btn sm brand" data-act="useZepp" data-id="' + z.id + '" data-w="' + w + '" data-k="' + k + $t('" type="button">Übernehmen</button>')) : '') +
    '<div class="card"><div class="big">' + esc(title) + '</div><div class="muted">' + esc(sub) + '</div><div class="zones">' + zones + '</div>' +
    (sp.mode === 'int' ? '<button class="btn" data-act="intervals" data-w="' + w + '" data-k="' + k + $t('" type="button">Nur Intervall-Timer</button>') : '') + '<button class="btn brand" data-act="trOpen" data-w="' + w + '" data-k="' + k + $t('" type="button">Mit GPS und Puls aufzeichnen</button>') + '</div>' +
    '<div class="card"><div class="fields">' +
    $t('<div class="field"><label for="c-dev">Gerät</label><select id="c-dev" data-cw="') + w + '" data-ck2="' + k + '" data-cf="dev">' + devs.map(o => '<option' + (c.dev === o ? $t(' selected') : '') + '>' + o + '</option>').join('') + '</select></div>' +
    f('dur', $t('Dauer (min)'), 'min') + f('avg', $t('Ø Puls'), $t('bpm')) + f('max', $t('Max. Puls'), $t('bpm')) + f('perf', hk ? $t('Leistung') : $t('Distanz'), hk ? 'z. B. 280 W' : $t('z. B. 6 km'), 'text') + f('rpe', $t('RPE'), '1–10') +
    '</div>' + (num(c.dur) && num(c.rpe) ? $t('<p class="small" style="margin-top:10px">Belastung: <b>') + fmt(num(c.dur) * num(c.rpe), 0) + $t('</b> (Dauer × RPE)</p>') : $t('<p class="small muted" style="margin-top:10px">Mit Dauer und RPE berechnet die App deine Tagesbelastung.</p>')) + finBtn(w, k) + '</div>' +
    traceCard(act && S.hrTraces[act.id] ? act.id : sKey(w, k), act && act.start ? { start: act.start, end: act.end } : s.timerStart ? { start: s.timerStart, end: s.timerStart + (s.timerDur || 0) * 1000 } : null, sp.mode === 'int' && !!sp.hi) +
    (s.skipped ? '<button class="btn block" data-act="unskip" data-w="' + w + '" data-k="' + k + $t('" type="button">Wieder öffnen</button>') : '<button class="btn block" style="background:var(--fog)" data-act="skip" data-w="' + w + '" data-k="' + k + $t('" type="button">Einheit überspringen</button>')) + '</div>'; }
function zeppWorkoutFor(d, k) { return S.activities.find(a => a.date === d && a.src && a.src !== 'manual' && !a.countsAs && ACT_MAP[a.type] && ACT_MAP[a.type].cardio && isCardio(k)); }

/* ======================= FREIES TRAINING / AKTIVITÄT ======================= */
function viewFree(id) { const a = S.activities.find(x => x.id === id); if (!a) return '<a href="#training" class="back">' + ICON.back + $t('Training</a><p>Aktivität nicht gefunden.</p>');
  const t = ACT_MAP[a.type] || ACT_MAP.sonst;
  const f = (k, lab, ph, type) => '<div class="field"><label for="a-' + k + '">' + lab + '</label><input id="a-' + k + '" type="' + (type || 'number') + '" ' + (type ? '' : 'inputmode="decimal" step="any"') + ' data-aid="' + a.id + '" data-af="' + k + '" value="' + esc(a[k]) + '" placeholder="' + ph + '"' + (type === 'date' ? ' style="width:170px"' : '') + '></div>';
  const w = a.week || curWeek(); const zk = Z2K(); const zOpen = !!zk && (!sessProgress(w, zk).done || a.countsAs === zk);
  let ex = '';
  if (t.strength) { ex = (a.exercises || []).map((e, idx) => freeExCard(a, e, idx)).join('') + '<button class="btn block brand" data-act="freeAddEx" data-aid="' + a.id + $t('" type="button">+ Übung hinzufügen</button>') + ((a.exercises || []).length ? '<button class="btn block fog" data-act="woFromAct" data-aid="' + a.id + $t('" type="button">Als geplantes Training speichern</button>') : ''); }
  return '<a href="#training" class="back">' + ICON.back + $t('Training</a>') + pageTop(esc(a.title || t.name), '', fmtDay(a.date) + (a.src && a.src !== 'manual' ? ' · ' + esc(srcLabel(a)) : '')) +
  '<div class="stack"><div class="card"><div class="fields">' +
  $t('<div class="field"><label for="a-type">Art</label><select id="a-type" data-aid="') + a.id + '" data-af="type">' + ACT_TYPES.map(x => '<option value="' + x.id + '"' + (x.id === a.type ? $t(' selected') : '') + '>' + x.name + '</option>').join('') + '</select></div>' +
  f('date', $t('Datum'), '', 'date') + f('dur', $t('Dauer (min)'), 'min') + (t.dist ? f('dist', $t('Distanz (km)'), $t('km')) : '') + f('avgHr', $t('Ø Puls'), $t('bpm')) + f('kcal', $t('kcal (Uhr)'), 'kcal') + f('rpe', $t('RPE'), '1–10') +
  $t('<div class="field" style="flex:1 1 100%"><label for="a-note">Notiz</label><input id="a-note" type="text" data-aid="') + a.id + '" data-af="note" value="' + esc(a.note) + $t('" placeholder="optional"></div></div>') +
  (t.cardio && zOpen ? '<label class="row" style="margin-top:14px;gap:10px"><input type="checkbox" data-aid="' + a.id + '" data-af="countsZ"' + (a.countsAs && a.countsAs === zk ? $t(' checked') : '') + $t('> <span>Zählt als Z2-Einheit von Woche ') + w + $t('</span></label><p class="small muted">Nur wenn du locker in Zone 2 unterwegs warst und es mindestens ') + Math.min(30, Z2MIN[w - 1]) + $t(' Minuten waren.</p>') : '') + '</div>' +
  ex + (num(a.dur) && num(a.rpe) ? $t('<p class="small" style="margin:0 4px">Belastung: <b>') + fmt(num(a.dur) * num(a.rpe), 0) + $t('</b> (Dauer × RPE)</p>') : $t('<p class="small muted" style="margin:0 4px">Trag die RPE ein, dann zählt die Aktivität in deine Tagesbelastung.</p>')) + traceCard(a.id, a.start ? { start: a.start, end: a.end } : null, false) +
  $t('<p class="small muted" style="margin:0 4px">Freie Aktivitäten verändern dein Kalorienziel nicht. Der Bedarf wird aus deinem Gewichtstrend berechnet, Bewegung ist darin schon enthalten.</p>') +
  (ui.confirmDel === a.id ? $t('<div class="row"><span class="grow small">Wirklich löschen?</span><button class="btn sm" data-act="delActNo" type="button">Abbrechen</button><button class="btn sm dark" data-act="delActYes" data-aid="') + a.id + $t('" type="button">Löschen</button></div>') : '<button class="btn block danger" style="background:var(--fog)" data-act="delAct" data-aid="' + a.id + $t('" type="button">Aktivität löschen</button>')) + '</div>'; }
function freeExCard(a, e, idx) { const ex = LIB[e.ex]; const spec = { slot: 'f' + idx, sets: e.sets.length, reps: e.reps || '8–12', rpe: e.rpe ?? 8, type: 'dp' };
  const h = lastAny(e.ex); const histTxt = h ? $t('Zuletzt im Plan (Woche ') + h.w + '): ' + h.items.flatMap(it => it.sets).map(x => (x.w != null ? fmt(x.w) + ' × ' : '') + (x.r ?? '–')).join(', ') : '';
  const sugg = i => { const raw = e.sets; for (let j = i - 1; j >= 0; j--) { const x = raw[j]; if (x && x.done) return { load: num(x.w), reps: num(x.r) }; } const rr = repRange(e.reps || ''); return { load: null, reps: rr ? rr.lo : null }; };
  return '<div class="ex" id="fx-' + idx + '"><div class="ex-h">' + exThumb(e.ex) + '<div class="grow"><button class="nm exlink" type="button" data-act="exInfo" data-ex="' + e.ex + '">' + esc(ex.name) + '</button>' + (isPrio(e.ex) ? $t('<span class="prio">Schwerpunkt</span>') : '') + '<button class="histbtn" type="button" data-act="exHist" data-ex="' + e.ex + '">' + ICON.chart + $t('Verlauf</button></div><button class="btn sm" data-act="freeDelEx" data-aid="') + a.id + '" data-idx="' + idx + $t('" type="button">Entfernen</button></div>') +
    (histTxt ? '<div class="hint">' + esc(histTxt) + '</div>' : '') + setRows('f-' + idx + '-', spec, e.sets, sugg, true, null, false, 'data-aid="' + a.id + '" data-idx="' + idx + '"') +
    '<div class="ex-actions"><button class="btn sm" data-act="freeAddSet" data-aid="' + a.id + '" data-idx="' + idx + $t('" type="button">+ Satz</button>') + '<button class="btn sm" data-act="exEq" data-ex="' + e.ex + $t('" type="button">Gerät</button>') + $t('<input class="exnote grow" id="exn-') + e.ex + '-f' + idx + '" type="text" data-exnote="' + e.ex + '" value="' + esc(S.exNotes[e.ex]) + $t('" placeholder="Notiz zur Übung" aria-label="Notiz zur Übung"></div></div>'); }
function newActivity(type, dateStr) { const a = { id: uid(), type, date: dateStr || today(), week: curWeek(), src: 'manual' }; if (ACT_MAP[type].strength) a.exercises = []; S.activities.push(a); save(); return a; }

/* ======================= ESSEN ======================= */
function viewEssen() {
  const d = ui.day, o = S.days[d] || { entries: [] }, tot = dayTotals(d), tg = currentTargets(); const left = tg.kcal - tot.kcal;
  const meals = MEALS.map(m => { const es = (o.entries || []).filter(e => e.meal === m); const k = es.reduce((a, e) => a + e.kcal, 0);
    return '<div class="card flush"><div class="meal-h"><b>' + $t(m) + '</b><span class="small muted num">' + fmt(k, 0) + $t(' kcal</span>') + (es.length ? '<button class="btn sm" data-act="saveTpl" data-meal="' + m + '" type="button" aria-label="' + $t(m) + $t(' als Vorlage speichern" title="Als Vorlage speichern">☆</button>') : '') + '<button class="btn sm" data-act="add" data-meal="' + m + $t('" type="button">+ Hinzufügen</button></div>') +
      es.map(e => '<div class="entry" data-act="edit" data-uid="' + e.uid + '"><div class="grow" style="min-width:0"><div class="nm">' + esc(entryName(e)) + '</div><div class="small muted">' + fmt(e.qty) + ' ' + $t(e.unit) + '</div></div><div class="k num">' + fmt(e.kcal, 0) + $t(' kcal<small>') + fmt(e.p, 0) + $t(' g Protein</small></div></div>')).join('') + (es.length ? '<div style="height:8px"></div>' : '') + '</div>'; }).join('');
  const head = '<div class="top"><div class="grow"><h1>' + (left >= 0 ? '<span class="t-green">' + fmt(left, 0) + $t(' kcal</span> übrig') : '<span class="t-red">' + fmt(-left, 0) + $t(' kcal</span> über dem Ziel')) + '</h1><div class="sub">' + (d === today() ? $t('Heute') : fmtDay(d)) + $t(' · Ziel ') + fmt(tg.kcal, 0) + $t(' kcal</div></div><a class="iconbtn" href="#mehr" aria-label="Einstellungen">') + ICON.gear + '</a></div>';
  return head + '<div class="stack">' +
  $t('<div class="daynav"><button class="iconbtn" data-act="dprev" type="button" aria-label="Vortag">‹</button><div class="grow">') + (d === today() ? $t('Heute') : fmtDay(d)) + $t('</div><button class="iconbtn" data-act="dnext" type="button" aria-label="Nächster Tag"') + (d >= today() ? $t(' disabled') : '') + '>›</button></div>' +
  (checkinDue() ? note('ember', $t('<b>Check-in fällig:</b> neues Kalorienziel aus deinem Trend berechnen.'), $t('<button class="btn brand sm" data-act="checkin" type="button">Check-in</button>')) : '') +
  '<div class="card">' + rings(tot, tg) + microRow(d) + '</div>' + waterCard(d) +
  '<div class="scanbar"><button class="btn brand" data-act="scan" type="button">' + ICON.scan + $t('Barcode scannen</button><button class="btn" style="background:var(--fog)" data-act="add" data-meal="') + guessMeal() + '" type="button">' + ICON.search + $t('Suchen</button></div>') +
  ((o.entries || []).length ? '' : $t('<div class="scanbar"><button class="btn" style="background:var(--fog)" data-act="template" type="button">Meal-Prep-Tag</button>') + (((S.days[addDays(d, -1)] || {}).entries || []).length ? $t('<button class="btn" style="background:var(--fog)" data-act="copyYesterday" type="button">Gestern übernehmen</button>') : '') + '</div>') +
  meals +
  $t('<div class="card"><div class="row"><div class="field"><label for="wDay">Gewicht</label><input id="wDay" type="number" inputmode="decimal" step="0.1" data-day="') + d + '" data-f="weight" value="' + esc(o.weight) + $t('" placeholder="kg"></div><div class="grow"></div>') +
  '<label class="row" style="gap:10px"><input type="checkbox" id="complete" data-day="' + d + '" data-f="complete"' + (o.complete === false ? '' : $t(' checked')) + $t('> Tag vollständig geloggt</label></div>') +
  $t('<p class="small muted">Nur vollständig geloggte Tage fließen in die Bedarfsberechnung. Hast du etwas vergessen, nimm den Haken raus.</p></div></div>'); }
function guessMeal() { const h = new Date().getHours(); return h < 11 ? 'Frühstück' : h < 15 ? 'Mittag' : h < 18 ? 'Snack' : 'Abend'; }

/* ---------- Sheets ---------- */
let searchAbort = null;
function openSheet(html) { $('#sheetCard').innerHTML = '<div class="grab"></div>' + html; $('#sheet').hidden = false; }
function closeSheet() { $('#sheet').hidden = true; $('#sheetCard').innerHTML = ''; }
const sheetHead = t => '<div class="row"><h2 class="grow">' + t + $t('</h2><button class="btn sm" style="background:var(--fog)" data-act="closeSheet" type="button">Schließen</button></div>');
function foodRow(f) { const per = f.base === '100g' ? $t('100 g') : $t('Stück'); return '<div class="it" data-act="pick" data-id="' + esc(f.id) + '"><div class="grow"><b>' + esc(foodName(f)) + '</b><small>' + (f.brand ? esc(f.brand) + ' · ' : '') + (f.needsFetch ? $t('Nährwerte werden beim Antippen geladen') : fmt(f.kcal, 0) + $t(' kcal · ') + fmt(f.p, 1) + $t(' g Protein pro ') + per) + '</small></div><span class="chev">›</span></div>'; }
function addSheet() {
  const tabs = [['presets', $t('Meal-Prep')], ['rec', $t('Rezepte')], ['tpl', $t('Vorlagen')], ['recent', $t('Zuletzt')], ['search', $t('Suche')], ['quick', $t('Schnell')], ['new', $t('Neu')]];
  let body = '';
  if (ui.foodTab === 'presets') { const custom = Object.values(S.foods).filter(f => f.src === 'custom' || f.src === 'recipe'); body = '<div class="plist">' + PRESET_FOODS.map(f => foodRow(getFood(f.id))).join('') + custom.map(foodRow).join('') + '</div>'; }
  else if (ui.foodTab === 'quick') body = quickForm();
  else if (ui.foodTab === 'rec') body = recipesTab();
  else if (ui.foodTab === 'tpl') body = S.mealTemplates.length ? '<div class="plist">' + S.mealTemplates.map(t => '<div class="it"><div class="grow" data-act="useTpl" data-id="' + t.id + '"><b>' + esc(t.name) + '</b><small>' + esc($t(t.meal)) + ' · ' + t.entries.length + $t(' Lebensmittel · ') + fmt(t.kcal, 0) + $t(' kcal</small></div><button class="btn sm" data-act="delTpl" data-id="') + t.id + $t('" type="button" aria-label="Vorlage löschen">Löschen</button></div>')).join('') + '</div>' : $t('<p class="muted">Noch keine Vorlagen. Im Tagebuch beim Stern neben einer Mahlzeit speichern.</p>');
  else if (ui.foodTab === 'recent') body = S.recent.length ? '<div class="plist">' + S.recent.map(getFood).filter(Boolean).map(foodRow).join('') + '</div>' : $t('<p class="muted">Noch nichts geloggt.</p>');
  else if (ui.foodTab === 'search') body = $t('<div class="row on-white"><input id="q" type="search" placeholder="z. B. Skyr, Lachs, Haferflocken" class="grow" enterkeyhint="search"><button class="btn brand" data-act="search" type="button">Suchen</button></div><div id="results" class="plist" style="margin-top:8px"><p class="small muted">Daten von Open Food Facts, Werte pro 100 g.</p></div>');
  else body = foodForm(null);
  openSheet(sheetHead(esc($t(ui.meal))) + '<div class="row" style="margin-top:12px"><button class="btn brand block" data-act="scan" type="button">' + ICON.scan + $t('Barcode scannen</button></div><div class="seg">') + tabs.map(t => '<button class="' + (ui.foodTab === t[0] ? 'on' : '') + '" data-act="ftab" data-t="' + t[0] + '" type="button">' + t[1] + '</button>').join('') + '</div>' + body);
  if (ui.foodTab === 'search') setTimeout(() => { const q = $('#q'); if (q) q.focus(); }, 60); }
function qtySheet(id, entry) { const f = getFood(id); if (!f) return; const units = unitsFor(f); const unit = entry ? entry.unit : units[0]; const qty = entry ? entry.qty : (unit === 'g' ? (f.pieceG && f.src === 'off' ? f.pieceG : 100) : 1);
  openSheet(sheetHead(esc(foodName(f))) + (f.brand ? '<p class="small muted">' + esc(f.brand) + (f.code ? ' · ' + esc(f.code) : '') + '</p>' : '') +
    $t('<div class="fields on-white" style="margin:14px 0"><div class="field"><label for="qq">Menge</label><input id="qq" type="number" inputmode="decimal" step="any" value="') + qty + $t('"></div><div class="field"><label for="qu">Einheit</label><select id="qu">') + units.map(u => '<option value="' + u + '"' + (u === unit ? $t(' selected') : '') + '>' + $t(u) + '</option>').join('') + '</select></div>' +
    (entry ? '' : $t('<div class="field"><label for="qm">Mahlzeit</label><select id="qm">') + MEALS.map(m => '<option value="' + m + '"' + (m === ui.meal ? $t(' selected') : '') + '>' + $t(m) + '</option>').join('') + '</select></div>') + '</div>' +
    '<div id="qprev" class="card" style="padding:14px 18px"></div><div class="row" style="margin-top:14px">' + (entry ? '<button class="btn danger" style="background:var(--fog)" data-act="delEntry" data-uid="' + entry.uid + $t('" type="button">Löschen</button>') : '') + '<div class="grow"></div><button class="btn sm" style="background:var(--fog)" data-act="editFood" data-id="' + esc(id) + $t('" type="button">Nährwerte bearbeiten</button><button class="btn brand" data-act="') + (entry ? 'saveEntry' : 'confirmAdd') + '" data-id="' + esc(id) + '"' + (entry ? ' data-uid="' + entry.uid + '"' : '') + ' type="button">' + (entry ? $t('Speichern') : $t('Hinzufügen')) + '</button></div>');
  updatePrev(id); }
function updatePrev(id) { const f = getFood(id); const q = num($('#qq') && $('#qq').value) || 0, u = $('#qu') && $('#qu').value; const m = macrosFor(f, q, u); const el = $('#qprev');
  if (el) el.innerHTML = '<div class="row" style="justify-content:space-between"><span><b class="num">' + fmt(m.kcal, 0) + $t('</b> kcal</span><span><span class="dot plum"></span> ') + fmt(m.p, 1) + ' g P</span><span><span class="dot sky"></span> ' + fmt(m.c, 1) + $t(' g KH</span><span><span class="dot green"></span> ') + fmt(m.f, 1) + ' g F</span></div>'; }
function foodForm(f, code) { f = f || { base: '100g', code: code || '' }; const v = k => esc(f[k] ?? '');
  return (code && !f.id ? $t('<p class="muted" style="margin-top:12px">Barcode ') + esc(code) + $t(' ist nicht in Open Food Facts. Trag die Werte von der Packung ein. Beim nächsten Scan kennt die App das Produkt.</p>') : '') +
    $t('<div class="fields on-white" style="margin-top:12px"><div class="field" style="flex:1 1 100%"><label for="ff-name">Name</label><input id="ff-name" type="text" value="') + v('name') + '"></div>' +
    $t('<div class="field"><label for="ff-base">Werte pro</label><select id="ff-base"><option value="100g"') + (f.base === '100g' ? $t(' selected') : '') + '>100 g</option><option value="piece"' + (f.base === 'piece' ? $t(' selected') : '') + $t('>Stück</option></select></div>') +
    ['kcal', 'p', 'c', 'f'].map(k => '<div class="field"><label for="ff-' + k + '">' + { kcal: 'kcal', p: $t('Protein (g)'), f: $t('Fett (g)'), c: $t('Kohlenhydrate (g)') }[k] + '</label><input id="ff-' + k + '" type="number" inputmode="decimal" step="any" value="' + v(k) + '"></div>').join('') +
    $t('<div class="field"><label for="ff-pg">Gramm pro Stück/Portion</label><input id="ff-pg" type="number" inputmode="decimal" step="any" value="') + v('pieceG') + $t('" placeholder="optional"></div>') +
    '<input type="hidden" id="ff-code" value="' + v('code') + '"></div>' +
    '<div class="row" style="margin-top:16px"><div class="grow"></div><button class="btn brand" data-act="saveFood" data-id="' + esc(f.id || '') + $t('" type="button">Speichern</button></div>'); }
function offMap(p, partial) { const n = p.nutriments || {}; let kcal = num(n['energy-kcal_100g']); if (kcal == null && num(n.energy_100g) != null) kcal = num(n.energy_100g) / 4.184;
  const brand = Array.isArray(p.brands) ? (p.brands[0] || '') : String(p.brands || '').split(',')[0];
  const names = {}; ['de', 'en', 'ru'].forEach(l => { const v = p['product_name_' + l]; if (v && String(v).trim()) names[l] = String(v).trim(); }); const name = (names[LANG] || (p.product_name && String(p.product_name).trim()) || names.de || names.en || names.ru || '').toString().trim();
  if (kcal == null && !(partial && name && p.code)) return null;
  return { id: 'off_' + p.code, code: String(p.code), name: name || $t('Ohne Namen'), names, brand: brand.trim(), base: '100g', kcal, p: num(n.proteins_100g) || 0, f: num(n.fat_100g) || 0, c: num(n.carbohydrates_100g) || 0, pieceG: num(p.serving_quantity) || null, src: 'off', needsFetch: kcal == null, fib: num(n.fiber_100g), sug: num(n.sugars_100g), salt: num(n.salt_100g) }; }
const offCache = {};
async function fetchJson(url, ms) { const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms || 9000); try { const r = await fetch(url, { signal: ac.signal }); if (!r.ok && r.status !== 404) throw new Error($t('HTTP ') + r.status); return await r.json(); } finally { clearTimeout(t); } }
async function offSearch(q) { const res = $('#results'); if (!q || !res) return; const ql = q.toLowerCase();
  const mine = []; const seen = new Set(); [...PRESET_FOODS.map(f => getFood(f.id)), ...Object.values(S.foods)].forEach(f => { if (f && !seen.has(f.id) && foodName(f).toLowerCase().includes(ql)) { seen.add(f.id); mine.push(f); } });
  const mineHtml = mine.length ? $t('<div class="lbl" style="margin:10px 0 2px">Deine Lebensmittel</div>') + mine.map(foodRow).join('') : '';
  res.innerHTML = mineHtml + $t('<p class="small muted">Suche in Open Food Facts …</p>');
  const enc = encodeURIComponent(q), F = 'code,product_name,product_name_de,product_name_en,product_name_ru,brands,nutriments,serving_quantity';
  const sources = [
    { url: 'https://search.openfoodfacts.org/search?q=' + enc + '&langs=' + OFF_LANGS + '&page_size=40&fields=' + F, pick: j => j.hits },
    { url: 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + enc + '&search_simple=1&action=process&json=1&page_size=30&fields=' + F, pick: j => j.products } ];
  let items = null; const errs = [];
  for (const src of sources) { try { const j = await fetchJson(src.url, 10000); const list = (src.pick(j) || []).map(p => offMap(p, true)).filter(Boolean); if (list.length) { items = list; break; } if (items == null) items = []; }
    catch (e) { errs.push(e.name === 'AbortError' ? $t('Zeitüberschreitung') : e.message); } }
  if (!$('#results')) return;
  if (items && items.length) { items.sort((a, b) => (a.needsFetch ? 1 : 0) - (b.needsFetch ? 1 : 0)); items.forEach(f => offCache[f.id] = f);
    res.innerHTML = mineHtml + $t('<div class="lbl" style="margin:10px 0 2px">Open Food Facts</div>') + items.map(foodRow).join(''); return; }
  res.innerHTML = mineHtml + (items ? $t('<p class="small muted">In Open Food Facts nichts gefunden. Anders formulieren, Barcode scannen oder unter „Neu“ selbst anlegen.</p>')
    : $t('<p class="small muted">Open Food Facts ist gerade nicht erreichbar (') + esc(errs.join(', ')) + $t('). Barcode-Scan oder „Neu“ funktionieren trotzdem.</p>')); }
async function lookupBarcode(code) { code = String(code || '').replace(/\D/g, ''); if (!code) return;
  const known = Object.values(S.foods).find(f => f.code === code); if (known) { qtySheet(known.id); return; }
  openSheet(sheetHead($t('Barcode ') + esc(code)) + $t('<p class="muted">Suche in Open Food Facts …</p>'));
  try { const j = await fetchJson('https://world.openfoodfacts.org/api/v2/product/' + code + '.json?fields=code,product_name,product_name_de,product_name_en,product_name_ru,brands,nutriments,serving_quantity');
    const f = j && j.product ? offMap(Object.assign({ code }, j.product)) : null;
    if (!f) { openSheet(sheetHead($t('Neues Produkt')) + foodForm(null, code)); return; }
    S.foods[f.id] = f; save(); qtySheet(f.id);
  } catch (e) { openSheet(sheetHead($t('Barcode ') + esc(code)) + $t('<p class="muted">Open Food Facts ist gerade nicht erreichbar. Du kannst das Produkt selbst anlegen.</p>') + foodForm(null, code)); } }

/* ---------- Barcode-Scanner ---------- */
const SCAN = { stream: null, timer: null, reader: null, last: null, hits: 0, torch: false };
function validEan(c) { if (!/^\d{8}$|^\d{12,13}$/.test(c)) return false; const d = c.split('').map(Number); const chk = d.pop(); let s = 0; d.reverse().forEach((x, i) => s += x * (i % 2 === 0 ? 3 : 1)); return (10 - s % 10) % 10 === chk; }
function loadScript(src) { return new Promise((res, rej) => { if (document.querySelector('script[src="' + src + '"]')) return res(); const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Laden fehlgeschlagen')); document.head.appendChild(s); }); }
async function openScanner() { closeSheet(); const sc = $('#scanner'), v = $('#scanVideo'), msg = $('#scanMsg'); sc.hidden = false; $('#scanCode').value = ''; msg.textContent = $t('Kamera wird gestartet …'); SCAN.last = null; SCAN.hits = 0;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg.textContent = $t('Kamera ist hier nicht verfügbar. Gib die Nummer unter dem Strichcode ein.'); return; }
  try { SCAN.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }); }
  catch (e) { msg.textContent = e.name === 'NotAllowedError' ? $t('Kamerazugriff verweigert. Erlaube die Kamera in den App-Einstellungen oder tippe die Nummer ein.') : $t('Kamera nicht verfügbar (') + e.name + $t('). Nummer unten eingeben.'); return; }
  const track = SCAN.stream.getVideoTracks()[0]; try { const caps = track.getCapabilities ? track.getCapabilities() : {}; $('#torchBtn').hidden = !caps.torch; } catch (e) { $('#torchBtn').hidden = true; }
  msg.textContent = $t('Strichcode in den Rahmen halten');
  let native = false; if ('BarcodeDetector' in window) { try { const f = await BarcodeDetector.getSupportedFormats(); native = f.includes('ean_13'); } catch (e) { native = false; } }
  if (native) { v.srcObject = SCAN.stream; await v.play().catch(() => {}); const det = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
    SCAN.timer = setInterval(async () => { if (v.readyState < 2) return; try { const r = await det.detect(v); if (r.length) gotCode(r[0].rawValue); } catch (e) {} }, 180); }
  else { try { await loadScript('vendor/zxing.min.js'); const hints = new Map(); hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8, ZXing.BarcodeFormat.UPC_A, ZXing.BarcodeFormat.UPC_E]); hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
      SCAN.reader = new ZXing.BrowserMultiFormatReader(hints, 200); SCAN.reader.decodeFromStream(SCAN.stream, v, (res) => { if (res) gotCode(res.getText()); }); }
    catch (e) { msg.textContent = $t('Scanner konnte nicht starten (') + e.message + $t('). Nummer unten eingeben.'); } } }
function gotCode(c) { c = String(c).replace(/\D/g, ''); if (c.length === 12) c = '0' + c; if (!validEan(c)) return;
  if (SCAN.last === c) SCAN.hits++; else { SCAN.last = c; SCAN.hits = 1; } if (SCAN.hits < 2) return;
  if (navigator.vibrate) navigator.vibrate(60); closeScanner(); if (ui.scanTarget === 'recipe') { ui.scanTarget = null; recipeBarcode(c); } else lookupBarcode(c); }
async function recipeBarcode(c) { ui.recipe = ui.recipeKeep || ui.recipe; recipeSheet(); const known = Object.values(S.foods).find(f => f.code === c); if (known) { recipeQty(known.id); return; }
  try { const j = await fetchJson('https://world.openfoodfacts.org/api/v2/product/' + c + '.json?fields=code,product_name,product_name_de,product_name_en,product_name_ru,brands,nutriments,serving_quantity'); const f = j && j.product ? offMap(Object.assign({ code: c }, j.product)) : null; if (!f) { toast($t('Produkt ') + c + $t(' unbekannt. Erst unter „Neu“ anlegen.')); return; } S.foods[f.id] = f; save(); recipeQty(f.id); } catch (e) { toast($t('Open Food Facts nicht erreichbar.')); } }
function closeScanner() { clearInterval(SCAN.timer); SCAN.timer = null; if (SCAN.reader) { try { SCAN.reader.reset(); } catch (e) {} SCAN.reader = null; }
  if (SCAN.stream) { SCAN.stream.getTracks().forEach(t => t.stop()); SCAN.stream = null; } const v = $('#scanVideo'); v.srcObject = null; SCAN.torch = false; $('#torchBtn').classList.remove('on'); $('#scanner').hidden = true; }
async function toggleTorch() { if (!SCAN.stream) return; const t = SCAN.stream.getVideoTracks()[0]; SCAN.torch = !SCAN.torch; try { await t.applyConstraints({ advanced: [{ torch: SCAN.torch }] }); $('#torchBtn').classList.toggle('on', SCAN.torch); } catch (e) { SCAN.torch = false; } }

/* ======================= GESUNDHEIT: HEALTH CONNECT & ZEPP ======================= */
const HEALTH = { get plugin() { const C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.Health; }, get native() { return !!this.plugin; }, busy: false };
const HC_READ = ['steps', 'heartRate', 'restingHeartRate', 'heartRateVariability', 'sleep', 'workouts', 'weight', 'calories', 'vo2Max'];
async function hcConnect() { const H = HEALTH.plugin; if (!H) return;
  try { const av = await H.isAvailable(); if (!av.available) { toast($t('Health Connect fehlt: ') + (av.reason || $t('bitte installieren'))); try { await H.openHealthConnectSettings(); } catch (e) {} return; }
    const st = await H.requestAuthorization({ read: HC_READ, requestHistoryAccess: true }); S.healthMeta.granted = st.readAuthorized || []; S.healthMeta.denied = st.readDenied || []; S.healthMeta.source = 'hc'; save();
    if (!(st.readAuthorized || []).length) { toast($t('Keine Berechtigung erteilt.')); render(); return; }
    await hcSync(true); } catch (e) { toast($t('Verbinden fehlgeschlagen: ') + (e.message || e)); } }
async function hcSync(full) { const H = HEALTH.plugin; if (!H || HEALTH.busy) return; HEALTH.busy = true; const t0 = Date.now();
  const days = full || !S.healthMeta.lastSync ? 60 : 10; const end = new Date(); const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1);
  const range = { startDate: start.toISOString(), endDate: end.toISOString() }; const errs = []; const grant = S.healthMeta.granted && S.healthMeta.granted.length ? S.healthMeta.granted : HC_READ; const ok = t => grant.includes(t);
  const loc = s => iso(new Date(s));
  const safe = async (name, fn) => { try { await fn(); } catch (e) { errs.push(name); console.warn(name, e); } };
  await safe($t('Schritte'), async () => { if (!ok('steps')) return; const r = await H.queryAggregated({ dataType: 'steps', bucket: 'day', aggregation: 'sum', ...range }); (r.samples || []).forEach(x => setHealth(loc(x.startDate), { steps: Math.round(x.value) }, 'hc')); });
  await safe($t('Kalorien'), async () => { if (!ok('calories')) return; const r = await H.queryAggregated({ dataType: 'calories', bucket: 'day', aggregation: 'sum', ...range }); (r.samples || []).forEach(x => setHealth(loc(x.startDate), { kcal: Math.round(x.value) }, 'hc')); });
  await safe($t('Puls'), async () => { if (!ok('heartRate')) return; const r = await H.queryAggregated({ dataType: 'heartRate', bucket: 'day', aggregation: ['average', 'min', 'max'], ...range });
    (r.samples || []).forEach(x => { const v = x.values || {}; const d = loc(x.startDate); setHealth(d, { hrAvg: v.average != null ? Math.round(v.average) : null, hrMin: v.min != null ? Math.round(v.min) : null, hrMax: v.max != null ? Math.round(v.max) : null }, 'hc'); }); });
  await safe($t('Ruhepuls'), async () => { if (!ok('restingHeartRate')) return; const r = await H.readSamples({ dataType: 'restingHeartRate', limit: 500, ascending: true, ...range }); (r.samples || []).forEach(x => setHealth(loc(x.startDate), { rhr: Math.round(x.value) }, 'hc')); });
  await safe($t('HRV'), async () => { if (!ok('heartRateVariability')) return; const r = await H.readSamples({ dataType: 'heartRateVariability', limit: 2000, ascending: true, ...range }); const by = {};
    (r.samples || []).forEach(x => { if (x.value > 0) (by[loc(x.startDate)] = by[loc(x.startDate)] || []).push(x.value); }); Object.keys(by).forEach(d => setHealth(d, { hrv: Math.round(median(by[d])) }, 'hc')); });
  /* ohne Ruhepuls-Records: Tagesminimum als Schätzung (gleiche Methode jeden Tag, darum als Vergleich brauchbar) */
  Object.keys(S.health).forEach(d => { const h = S.health[d]; if (h.rhr == null && h.hrMin != null) h.rhrEst = h.hrMin; });
  await safe($t('Schlaf'), async () => { if (!ok('sleep')) return; const r = await H.readSamples({ dataType: 'sleep', limit: 300, ascending: true, ...range }); const agg = {};
    (r.samples || []).forEach(x => { const d = loc(x.endDate); const a = agg[d] || (agg[d] = { sleepMin: 0, deep: 0, rem: 0, light: 0, awake: 0, main: 0, bed: null, wake: null });
      let asleep = x.value; if (x.stages && x.stages.length) { asleep = 0; x.stages.forEach(st => { const m = st.durationMinutes || 0; if (st.stage === 'deep') a.deep += m; else if (st.stage === 'rem') a.rem += m; else if (st.stage === 'light') a.light += m; else if (st.stage === 'awake') a.awake += m; if (st.stage !== 'awake' && st.stage !== 'inBed') asleep += m; }); }
      a.sleepMin += asleep; if (asleep > a.main) { a.main = asleep; a.bed = Date.parse(x.startDate); a.wake = Date.parse(x.endDate); } });
    Object.keys(agg).forEach(d => { const a = agg[d]; setHealth(d, { sleepMin: Math.round(a.sleepMin), deep: Math.round(a.deep) || null, rem: Math.round(a.rem) || null, light: Math.round(a.light) || null, awake: Math.round(a.awake) || null, bed: a.bed, wake: a.wake }, 'hc'); }); });
  await safe($t('Gewicht'), async () => { if (!ok('weight')) return; const r = await H.readSamples({ dataType: 'weight', limit: 200, ascending: true, ...range }); (r.samples || []).forEach(x => { const d = loc(x.startDate); const o = dayObj(d); if (num(o.weight) == null) { o.weight = String(Math.round(x.value * 10) / 10); o.weightSrc = 'hc'; } }); });
  await safe($t('VO2max'), async () => { if (!ok('vo2Max')) return; const r = await H.readSamples({ dataType: 'vo2Max', limit: 100, ascending: true, ...range }); (r.samples || []).forEach(x => setHealth(loc(x.startDate), { vo2: Math.round(x.value * 10) / 10 }, 'hc')); });
  let nw = 0; const toFetch = []; await safe($t('Workouts'), async () => { if (!ok('workouts')) return; const r = await H.queryWorkouts({ limit: 200, ascending: true, ...range });
    (r.workouts || []).forEach(x => { const res = importWorkout({ key: 'hc:' + (x.platformId || x.startDate), date: loc(x.startDate), type: HC_TYPE[x.workoutType] || 'sonst', title: null, dur: x.duration / 60, dist: x.totalDistance ? x.totalDistance / 1000 : null, kcal: x.totalEnergyBurned || null, src: 'hc', start: Date.parse(x.startDate), end: Date.parse(x.endDate) });
      if (res && res.created) nw++; if (res && res.start && Date.now() - res.start < 4 * 864e5 && !S.hrTraces[res.tkey]) toFetch.push(res); }); });
  if (ok('heartRate')) for (const res of toFetch.slice(0, 6)) await safe($t('Pulskurve'), () => fetchTrace(res.tkey, res.start, res.end));
  S.healthMeta.lastSync = new Date().toISOString(); S.healthMeta.source = 'hc'; save(); HEALTH.busy = false;
  toast(errs.length ? $t('Teilweise synchronisiert. Fehlt: ') + errs.join(', ') : $t('Daten aktualisiert') + (nw ? ' · ' + nw + $t(' neue Workouts') : '')); render(); }
/* Workout aus Uhr: an Plan-Einheit hängen oder als freie Aktivität anlegen */
function importWorkout(x) { if (S.healthMeta.ignored.includes(x.key) || S.activities.some(a => a.key === x.key)) return null; if (!x.dur || x.dur < 5) return null;
  for (let w = 1; w <= 12; w++) for (const k of GYM()) { const s = peekSess(w, k); if (s && s.date === x.date && x.type === 'kraft' && !s.watch) { s.watch = { dur: x.dur, kcal: x.kcal, key: x.key, start: x.start || null, end: x.end || null }; S.healthMeta.ignored.push(x.key); return { created: false, tkey: sKey(w, k), start: x.start, end: x.end }; } }
  const a = { id: uid(), key: x.key, type: x.type, title: x.title, date: x.date, week: curWeek(), dur: Math.round(x.dur), dist: x.dist != null ? Math.round(x.dist * 100) / 100 : null, kcal: x.kcal != null ? Math.round(x.kcal) : null, avgHr: x.avgHr || null, src: x.src, srcId: x.srcId || null, start: x.start || null, end: x.end || null };
  S.activities.push(a); return { created: true, tkey: a.id, start: x.start, end: x.end }; }

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
      const tot = deep + light + rem; const st0 = parseTs(get(r, 'start')); if (d && tot > 0) { setHealth(d, { sleepMin: tot, deep, light, rem: rem || null, awake: awake || null, bed: st0 ? st0.getTime() : null, wake: stop ? stop.getTime() : null }, 'zepp'); stat.sleep++; } }); return; }
  if (has('heartRate') && has('time') && has('date')) { const by = {}; rows.forEach(r => { const v = num(get(r, 'heartRate')); if (v == null || v < 30 || v > 220) return; (by[get(r, 'date')] = by[get(r, 'date')] || []).push(v); });
    Object.keys(by).forEach(d => { const a = by[d].sort((x, y) => x - y); const low = a.slice(0, Math.min(5, a.length)); setHealth(d, { rhrEst: Math.round(low.reduce((s, x) => s + x, 0) / low.length), hrAvg: Math.round(a.reduce((s, x) => s + x, 0) / a.length), hrMin: a[0], hrMax: a[a.length - 1] }, 'zepp'); stat.hr++; }); return; }
  if (cols.some(c => c.includes('resting'))) { rows.forEach(r => { const k = Object.keys(r).find(x => x.toLowerCase().includes('resting')); const d = get(r, 'date') || (parseTs(get(r, 'time') || get(r, 'timestamp')) && iso(parseTs(get(r, 'time') || get(r, 'timestamp')))); const v = num(r[k]); if (d && v) { setHealth(d, { rhr: Math.round(v) }, 'zepp'); stat.hr++; } }); return; }
  if (has('steps') && has('date') && !has('time')) { rows.forEach(r => { const v = num(get(r, 'steps')); if (v != null && get(r, 'date')) { setHealth(get(r, 'date'), { steps: Math.round(v), kcal: num(get(r, 'calories')) }, 'zepp'); stat.steps++; } }); return; }
  if (has('steps') && has('date') && has('time')) { const by = {}; rows.forEach(r => { by[get(r, 'date')] = (by[get(r, 'date')] || 0) + (num(get(r, 'steps')) || 0); }); Object.keys(by).forEach(d => { if (!S.health[d] || S.health[d].steps == null) { setHealth(d, { steps: by[d] }, 'zepp'); stat.steps++; } }); return; }
  if (has('sportTime') || (has('type') && has('startTime'))) { rows.forEach(r => { const st = parseTs(get(r, 'startTime')); if (!st) return; const type = ZEPP_TYPE[num(get(r, 'type'))] || 'sonst';
      const secs = num(get(r, 'sportTime')) || 0; const res = importWorkout({ key: 'zepp:' + st.getTime(), date: iso(st), type, title: null, dur: secs / 60, dist: num(get(r, 'distance')) ? num(get(r, 'distance')) / 1000 : null, kcal: num(get(r, 'calories')), src: 'zepp', start: st.getTime(), end: st.getTime() + secs * 1000 });
      if (res && res.created) stat.workouts++; attachZeppTrace(res); }); return; }
  if (has('weight')) { rows.forEach(r => { const t = parseTs(get(r, 'time') || get(r, 'timestamp') || get(r, 'date')); const v = num(get(r, 'weight')); if (t && v && v > 30) { const o = dayObj(iso(t)); if (num(o.weight) == null) { o.weight = String(Math.round(v * 10) / 10); o.weightSrc = 'zepp'; stat.weight++; } } }); return; } }
async function importZeppFiles(files) { const stat = { steps: 0, sleep: 0, hr: 0, workouts: 0, weight: 0 }; const texts = []; const dec = new TextDecoder();
  for (const file of files) { const buf = new Uint8Array(await file.arrayBuffer());
    if (/\.zip$/i.test(file.name) || (buf[0] === 0x50 && buf[1] === 0x4b)) { if (buf[6] & 1) { toast($t('Die ZIP ist passwortgeschützt. Erst mit dem Passwort aus der Zepp-App entpacken, dann die CSV-Dateien wählen.')); return; }
      try { const files2 = fflate.unzipSync(buf); for (const n in files2) if (/\.csv$/i.test(n)) texts.push(dec.decode(files2[n])); } catch (e) { toast($t('ZIP lässt sich nicht öffnen. Bitte entpacken und die CSV-Dateien wählen.')); return; } }
    else texts.push(dec.decode(buf)); }
  const parsed = texts.map(t => { try { return parseCSV(t); } catch (e) { return []; } }); ZHR = [];
  parsed.forEach(rows => { if (!rows.length) return; const ks = Object.keys(rows[0]); const kd = ks.find(k => k.toLowerCase() === 'date'), kt = ks.find(k => k.toLowerCase() === 'time'), kh = ks.find(k => k.toLowerCase() === 'heartrate');
    if (kd && kt && kh) rows.forEach(r => { const ts = parseTs(r[kd] + ' ' + r[kt]); const v = num(r[kh]); if (ts && v && v > 30 && v < 230) ZHR.push([ts.getTime(), v]); }); });
  ZHR.sort((a, b) => a[0] - b[0]);
  parsed.forEach(rows => { try { importZeppRows(rows, stat); } catch (e) { console.warn(e); } });
  S.healthMeta.lastSync = new Date().toISOString(); if (!HEALTH.native) S.healthMeta.source = 'zepp'; save(); render();
  const parts = []; if (stat.steps) parts.push(stat.steps + $t(' Tage Schritte')); if (stat.sleep) parts.push(stat.sleep + $t(' Nächte')); if (stat.hr) parts.push(stat.hr + $t(' Tage Puls')); if (stat.workouts) parts.push(stat.workouts + $t(' Workouts')); if (stat.weight) parts.push(stat.weight + $t(' Gewichte'));
  toast(parts.length ? $t('Importiert: ') + parts.join(', ') : $t('In den Dateien wurden keine bekannten Zepp-Daten gefunden.')); }

/* ======================= VERLAUF ======================= */
function viewProgress() {
  const ser = series(), st = S.settings; const last = ser[ser.length - 1];
  const cur = last ? last.trend : num(st.startWeight); const lost = num(st.startWeight) - cur; const pct = Math.max(0, Math.min(1, lost / (num(st.startWeight) - num(st.targetWeight))));
  const vos = Object.keys(S.health).sort().map(d => S.health[d].vo2).filter(x => x != null).concat(Object.keys(S.body).sort().map(k => num(S.body[k].vo2)).filter(x => x != null)); const v0 = num(st.vo2Start); const v2 = vos.length ? vos[vos.length - 1] : v0;
  const tg = currentTargets(); const rate = weeklyRate(ser); const eta = goalEta();
  const stats = '<div class="stats">' +
    $t('<div class="stat"><div class="k">Trendgewicht</div><div class="v">') + fmt(cur) + $t(' kg</div><div class="s">Ziel ') + fmt(num(st.targetWeight), 0) + $t(' kg') + (eta ? (eta.done ? $t(' · erreicht') : $t(' · ca. ') + fmtDay(eta.date)) : '') + '</div><div class="meter"><i style="width:' + Math.round(pct * 100) + '%"></i></div></div>' +
    $t('<div class="stat"><div class="k">Tempo</div><div class="v ') + (rate != null && rate < 0 ? 't-green' : '') + '">' + (rate != null ? (rate <= 0 ? '−' : '+') + fmt(Math.abs(rate), 2) : '–') + $t('</div><div class="s">kg pro Woche · Ziel −') + fmt(num(st.goalRate), 1) + '</div></div>' +
    $t('<div class="stat"><div class="k">Bedarf</div><div class="v">') + (last ? fmt(last.est, 0) : '–') + $t('</div><div class="s">kcal pro Tag · Ziel ') + fmt(tg.kcal, 0) + '</div></div>' +
    $t('<div class="stat"><div class="k">VO₂max</div><div class="v">') + fmt(v2) + '</div><div class="s">' + (v0 != null ? $t('Start ') + fmt(v0) : $t('von der Uhr oder Messwerten')) + '</div></div></div>';
  const wPts = ser.map((s, i) => ({ x: i, d: s.d, trend: s.trend, weight: s.weight }));
  const eSer = ser.map((s, i) => ({ x: i, d: s.d, est: s.est, intake: s.intake }));
  const hDays = []; for (let i = 27; i >= 0; i--) { const d = addDays(today(), -i); const h = S.health[d] || {}; hDays.push({ d, steps: h.steps ?? null, rhr: h.rhr ?? h.rhrEst ?? null, sleep: h.sleepMin != null ? h.sleepMin / 60 : null }); }
  const hasH = k => hDays.filter(p => p[k] != null).length > 1;
  const lifts = keyLifts().map(id => ({ id, name: LIB[id].name, pts: liftSeries(id) }));
  const headline = lost > 0.05 ? '<span class="t-green">−' + fmt(lost) + $t(' kg</span> seit Start') : $t('<span class="t-ember">Dein</span> Verlauf');
  return '<div class="top"><div class="grow"><h1>' + headline + $t('</h1><div class="sub">Trendgewicht, Bedarf, Gesundheit und Kraft</div></div><a class="iconbtn" href="#mehr" aria-label="Einstellungen">') + ICON.gear + '</a></div><div class="stack">' + stats +
    $t('<div class="card"><h2>Gewicht</h2>') + (wPts.length > 1 ? lineChart('cw', wPts, [{ key: 'weight', label: $t('Waage'), dots: true, color: $t('var(--mist)') }, { key: 'trend', label: $t('Trend'), color: $t('var(--ember)') }], { ref: num(st.targetWeight), refLabel: $t('Ziel'), unit: $t('kg'), dec: 1 }) : empty($t('Täglich morgens wiegen. Ab zwei Messungen erscheint die Kurve.'))) + '</div>' +
    $t('<div class="card"><h2>Bedarf und Aufnahme</h2>') + (eSer.length > 1 ? lineChart('ce', eSer, [{ key: 'intake', label: $t('Aufnahme'), bars: true, color: $t('var(--mist)') }, { key: 'est', label: $t('Bedarf'), color: $t('var(--amber)') }], { unit: 'kcal', dec: 0 }) : empty($t('Der Bedarf wird ab 14 Tagen mit Gewicht und vollständigem Essens-Log geschätzt. Bis dahin gilt dein Startwert.'))) +
    $t('<p class="small muted">Bedarf = Ø Aufnahme minus Änderung des Trendgewichts × 7.700 kcal/kg, über 14 Tage, langsam geglättet.</p></div>') +
    readinessHistCard() + loadCard() + heatmapCard() + '<div id="photocard"></div>' +
    $t('<div class="card"><h2>Schritte</h2>') + (hasH('steps') ? lineChart('cs', hDays, [{ key: 'steps', label: $t('Schritte'), bars: true, color: $t('var(--verdant)') }], { unit: '', dec: 0, ref: num(st.stepGoal), refLabel: $t('Ziel'), zero: true, noLegend: true }) : empty($t('Noch keine Schrittdaten. Verbinde deine Uhr unter „Einstellungen“ → Verbindungen.'))) + '</div>' +
    $t('<div class="card"><h2>Ruhepuls</h2>') + (hasH('rhr') ? lineChart('cr', hDays, [{ key: 'rhr', label: $t('Ruhepuls'), color: $t('var(--plum)') }], { unit: $t('bpm'), dec: 0, noLegend: true }) : empty($t('Noch keine Pulsdaten.'))) + '</div>' +
    sleepCard() +
    $t('<div class="card"><h2>Kraft (geschätztes 1RM)</h2>') + lifts.map(l => '<div style="margin-top:12px"><div class="lbl">' + l.name + '</div>' + (l.pts.length > 1 ? lineChart('cl-' + l.id, l.pts, [{ key: 'v', label: 'e1RM', color: $t('var(--iris)') }], { unit: $t('kg'), dec: 0, height: 130, noLegend: true }) : empty(l.pts.length ? $t('Ab der zweiten Einheit gibt es eine Kurve. Aktuell ') + fmt(l.pts[0].v, 0) + $t(' kg.') : $t('Noch keine Sätze mit RPE geloggt.'))) + '</div>').join('') + '</div>' +
    exListCard() +
    $t('<div class="card"><h2>Check-ins</h2>') + (S.checkins.length ? $t('<div class="tbl"><table><thead><tr><th>Datum</th><th>Trend</th><th>kg/Woche</th><th>Bedarf</th><th>Ziel</th></tr></thead><tbody>') + S.checkins.slice().reverse().map(c => '<tr><td>' + fmtDay(c.date) + '</td><td class="num">' + fmt(c.trend) + '</td><td class="num">' + (c.rate != null ? fmt(c.rate, 2) : '–') + '</td><td class="num">' + fmt(c.tdee, 0) + '</td><td class="num">' + fmt(c.kcal, 0) + '</td></tr>').join('') + '</tbody></table></div>' : empty($t('Der erste Check-in ist nach 7 Tagen mit Gewicht möglich.'))) + '</div></div>'; }
const empty = t => '<p class="small muted">' + esc(t) + '</p>';
function readinessHistCard() { const pts = []; for (let i = 27; i >= 0; i--) { const d = addDays(today(), -i); const r = dailyReadiness(d); pts.push({ d, score: r ? r.score : null }); }
  return $t('<div class="card"><h2>Bereitschaft</h2>') + (pts.filter(p => p.score != null).length > 1 ? lineChart('crd', pts, [{ key: 'score', label: $t('Bereitschaft'), color: $t('var(--iris)'), dotsToo: true }], { unit: '%', dec: 0, ref: 67, refLabel: $t('grün ab 67'), noLegend: true, zero: true }) : empty($t('Ab zwei Tagen mit Schlaf, Ruhepuls oder deinem Energie-Eintrag erscheint die Kurve.'))) +
    $t('<p class="small muted">Gewichtet aus Schlaf gegen deinen Bedarf (30 %), Ruhepuls gegen deine Basis (25 %), HRV gegen dein 7-Tage-Mittel (20 %) und deinem Gefühl (25 %). Fehlt ein Wert, zählen die anderen anteilig.</p></div>'); }
function loadCard() { const pts = []; for (let i = 27; i >= 0; i--) { const d = addDays(today(), -i); pts.push({ d, load: dailyLoad(d).load || null }); }
  const wk = weekLoad(today()), prev = weekLoad(addDays(today(), -7));
  return $t('<div class="card"><h2>Belastung</h2>') + (pts.filter(p => p.load).length ? lineChart('cld', pts, [{ key: 'load', label: $t('Belastung'), bars: true, color: $t('var(--sky)') }], { unit: '', dec: 0, zero: true, noLegend: true }) : empty($t('Trag nach jeder Einheit Dauer und Session-RPE ein. Daraus entsteht deine Tagesbelastung.'))) +
    $t('<div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:12px"><div class="stat" style="background:var(--paper)"><div class="k">Letzte 7 Tage</div><div class="v" style="font-size:22px">') + fmt(wk.tot, 0) + '</div><div class="s">' + (prev.tot ? (wk.tot >= prev.tot ? '+' : '−') + fmt(Math.abs((wk.tot - prev.tot) / prev.tot * 100), 0) + $t(' % zur Vorwoche') : $t('Vorwoche ') + fmt(prev.tot, 0)) + '</div></div>' +
    $t('<div class="stat" style="background:var(--paper)"><div class="k">Monotonie</div><div class="v" style="font-size:22px">') + (wk.mono != null ? fmt(wk.mono, 1) : '–') + '</div><div class="s">' + (wk.mono != null && wk.mono > 2 ? $t('hoch: Tage abwechslungsreicher gestalten') : $t('unter 2 ist gut')) + '</div></div></div>' +
    (wk.miss ? '<p class="small t-amber" style="font-weight:700">' + wk.miss + $t(' Einheit(en) der letzten 7 Tage ohne RPE.</p>') : '') +
    $t('<p class="small muted">Belastung = Minuten × Session-RPE (Foster). Monotonie = Mittelwert ÷ Streuung der Tageswerte. Über 2 steigt laut Foster das Risiko für Überlastung.</p></div>'); }
function sleepCard() { const pts = []; for (let i = 13; i >= 0; i--) { const d = addDays(today(), -i); const h = S.health[d] || {}; const staged = h.deep != null || h.rem != null || h.light != null;
    pts.push({ d, deep: staged ? (h.deep || 0) / 60 : null, rem: staged ? (h.rem || 0) / 60 : null, light: staged ? (h.light || 0) / 60 : (h.sleepMin != null ? h.sleepMin / 60 : null), awake: (h.awake || 0) / 60 || null }); }
  const has = pts.some(p => p.light != null || p.deep != null); const debt = sleepDebt(today()), cons = sleepConsistency(today());
  return $t('<div class="card"><h2>Schlaf</h2>') + (has ? stackChart('csl', pts, [{ key: 'deep', label: $t('Tief'), color: $t('var(--iris)') }, { key: 'rem', label: $t('REM'), color: $t('var(--plum)') }, { key: 'light', label: $t('Leicht'), color: $t('var(--sky)') }, { key: 'awake', label: $t('Wach'), color: $t('var(--rule-strong)') }], { unit: 'h', dec: 1, ref: sleepNeed() / 60, refLabel: $t('Bedarf ') + fmt(sleepNeed() / 60, 1) + ' h' }) : empty($t('Noch keine Schlafdaten.'))) +
    $t('<div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:12px"><div class="stat" style="background:var(--paper)"><div class="k">Schlafschuld 7 Tage</div><div class="v" style="font-size:22px">') + (debt ? fmtMin(debt.debt) : '–') + $t('</div><div class="s">bei ') + fmt(sleepNeed() / 60, 1) + $t(' h Bedarf</div></div>') +
    $t('<div class="stat" style="background:var(--paper)"><div class="k">Regelmäßigkeit</div><div class="v" style="font-size:22px">') + (cons ? '±' + fmt((cons.sdBed + cons.sdWake) / 2, 0) + $t(' min') : '–') + '</div><div class="s">' + (cons ? $t('Ø ins Bett ') + hm(cons.bed) + $t(', auf ') + hm(cons.wake) : $t('braucht Zubett- und Aufstehzeiten')) + '</div></div></div>' +
    $t('<p class="small muted">Regelmäßige Schlafzeiten hängen mit besserer Erholung zusammen. Weniger als ±30 min Schwankung ist ein gutes Ziel.</p></div>'); }
function exListCard() { const ids = new Set(); for (let w = 1; w <= 12; w++) ORDER.forEach(k => { const s = peekSess(w, k); if (s && s.logs) Object.values(s.logs).forEach(lg => { if (loggedSets(lg).length) ids.add(lg.ex); }); });
  S.activities.forEach(a => (a.exercises || []).forEach(e => { if (loggedSets(e).length) ids.add(e.ex); }));
  S.archive.forEach(ar => Object.values(ar.sessions || {}).forEach(s => Object.values(s.logs || {}).forEach(lg => { if (loggedSets(lg).length) ids.add(lg.ex); })));
  const list = [...ids].filter(id => LIB[id]).map(id => { const h = exHistory(id); const last = h[h.length - 1]; const m = h.some(o => o.e1) ? 'e1' : 'reps'; const v = h.map(o => o[m]).filter(x => x != null);
    return { id, n: h.length, last, m, chg: v.length > 1 && v[0] ? (v[v.length - 1] - v[0]) / Math.abs(v[0]) * 100 : null, cur: v[v.length - 1] }; }).sort((a, b) => (b.last && b.last.ord || '') < (a.last && a.last.ord || '') ? -1 : 1);
  return $t('<div class="card flush"><div class="meal-h"><b>Alle Übungen</b><span class="small muted">') + list.length + '</span></div>' + (list.length ? '<div class="list">' + list.map(x => '<button class="li" data-act="exHist" data-ex="' + x.id + '" type="button"><div class="grow"><b>' + esc(LIB[x.id].name) + '</b><small>' + x.n + $t(' Einheiten · ') + (x.m === 'e1' ? $t('e1RM ') + fmt(x.cur, 0) + $t(' kg') : fmt(x.cur, 0) + $t(' Wdh.')) + '</small></div>' + (x.chg != null ? '<span class="tag"><span class="dot ' + (x.chg >= 0 ? 'green' : 'red') + '"></span>' + (x.chg > 0 ? '+' : '') + fmt(x.chg, 0) + ' %</span>' : '') + '<span class="chev">›</span></button>').join('') + '</div>' : $t('<p class="small muted" style="padding:0 20px 18px">Sobald du Sätze loggst, erscheint hier jede Übung mit ihrem Verlauf.</p>')) + '</div>'; }
/* ---------- Verlauf pro Übung ---------- */
function exHistory(exId) { const out = [];
  for (let w = 1; w <= 12; w++) ORDER.forEach(k => { const s = peekSess(w, k); if (!s || !s.logs) return; const sets = [];
    for (const slot in s.logs) { const lg = s.logs[slot]; if (lg.ex !== exId) continue; const spec = planFor(w, k).find(p => p.slot === slot);
      loggedSets(lg).filter(x => x.done || x.r != null).forEach(x => sets.push({ ...x, rpe: x.rpe ?? (spec && spec.rpe) ?? null })); }
    if (sets.length) out.push({ d: s.date || null, wk: w, label: SESS[k].title + $t(' · Woche ') + w, sets, ord: s.date || ('0000-' + pad(chronIndex(w, k))) }); });
  S.activities.forEach(a => (a.exercises || []).forEach(e => { if (e.ex !== exId) return; const sets = loggedSets(e).filter(x => x.done || x.r != null); if (sets.length) out.push({ d: a.date, wk: a.week, label: $t('Freies Training'), sets, ord: a.date }); }));
  S.archive.forEach(ar => { for (const key in ar.sessions || {}) { const m = key.match(RE_SESS); if (!m) continue; const s = ar.sessions[key]; const sets = [];
    for (const slot in s.logs || {}) { const lg = s.logs[slot]; if (lg.ex !== exId) continue; const spec = planForP(ar.plan, +m[1], m[2]).find(p => p.slot === slot); loggedSets(lg).filter(x => x.done || x.r != null).forEach(x => sets.push({ ...x, rpe: x.rpe ?? (spec && spec.rpe) ?? null })); }
    if (sets.length) out.push({ d: s.date || null, wk: +m[1], label: $t(ar.plan.name || $t('Früherer Plan')) + $t(' · Woche ') + m[1], sets, ord: s.date || (ar.until || '0000') }); } });
  out.sort((x, y) => x.ord < y.ord ? -1 : 1);
  out.forEach((o, i) => { o.x = i; const ws = o.sets.filter(x => x.w != null && x.r);
    o.e1 = ws.filter(x => x.w > 0).reduce((m, x) => Math.max(m, e1rm(x.w, x.r, Math.min(10, x.rpe ?? 8))), 0) || null;
    o.top = ws.length ? Math.max(...ws.map(x => x.w)) : null;
    o.vol = o.sets.reduce((a, x) => a + (x.w > 0 && x.r ? x.w * x.r : 0), 0) || null;
    o.reps = o.sets.reduce((a, x) => a + (x.r || 0), 0) || null; });
  return out; }
const EX_METRICS = { e1: [$t('Geschätztes 1RM'), $t('kg'), 1], top: [$t('Schwerster Satz'), $t('kg'), 1], vol: [$t('Volumen (kg × Wdh.)'), $t('kg'), 0], reps: [$t('Wiederholungen gesamt'), $t('Wdh.'), 0] };
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
  const chart = pts.filter(o => o[metric] != null).length > 1 ? lineChart('exh', pts, [{ key: metric, label: mLab, color: $t('var(--ember)') }], { unit: mUnit, dec: mDec, noLegend: true, height: 210 })
    : '<p class="muted">' + (pts.length ? $t('Ab der zweiten Einheit erscheint hier die Kurve.') : $t('Für diese Übung ist noch nichts geloggt.')) + '</p>';
  const rows = pts.slice().reverse().map(o => '<div class="it" style="cursor:default"><div class="grow"><b>' + (o.d ? fmtDay(o.d) : $t('Woche ') + o.wk) + '</b><small>' + esc(o.label) + '</small><small>' + esc(o.sets.map(x => (x.w != null ? fmt(x.w) + ' × ' : '') + (x.r ?? '–') + (x.rpe != null ? ' @' + fmt(x.rpe) : '')).join(', ')) + '</small></div><div class="end"><b class="num" style="color:var(--graphite)">' + (o[metric] != null ? fmt(o[metric], mDec) : '–') + '</b><br>' + mUnit + '</div></div>').join('');
  openSheet(sheetHead(esc(ex.name)) + (S.exNotes[exId] ? $t('<p class="small" style="margin-top:6px"><b>Notiz:</b> ') + esc(S.exNotes[exId]) + '</p>' : '') +
    '<div class="seg">' + avail.map(m => seg(m, EX_METRICS[m][0], metric, 'exMetric')).join('') + '</div>' +
    '<div class="seg" style="margin-top:-6px">' + [['all', $t('Alles')], ['3m', $t('3 Monate')], ['1m', $t('1 Monat')]].map(p => seg(p[0], p[1], period, 'exPeriod')).join('') + '</div>' +
    $t('<div class="stats" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="stat"><div class="k">Bestwert</div><div class="v" style="font-size:22px">') + (best != null ? fmt(best, mDec) : '–') + '</div><div class="s">' + mUnit + '</div></div>' +
    $t('<div class="stat"><div class="k">Zuletzt</div><div class="v" style="font-size:22px">') + (last != null ? fmt(last, mDec) : '–') + '</div><div class="s">' + mUnit + '</div></div>' +
    $t('<div class="stat"><div class="k">Veränderung</div><div class="v ') + (chg > 0 ? 't-green' : chg < 0 ? 't-red' : '') + '" style="font-size:22px">' + (chg != null ? (chg > 0 ? '+' : '') + fmt(chg, 0) + ' %' : '–') + $t('</div><div class="s">seit ') + (period === 'all' ? $t('Start') : $t('Beginn')) + '</div></div></div>' +
    '<div class="card" style="margin-top:12px;padding:16px">' + chart + '</div>' +
    (metric === 'e1' ? $t('<p class="small muted">e1RM = Gewicht × (1 + (Wdh. + Wdh. in Reserve) / 30). Ohne RPE-Eintrag wird die Plan-RPE angenommen.</p>') : '') +
    (rows ? $t('<h3 style="margin:16px 0 4px">Alle Einheiten</h3><div class="plist">') + rows + '</div>' : '')); }
function prCheck(exId, w, k, set) { const x = { w: num(set.w), r: num(set.r), rpe: num(set.rpe) }; if (!x.w || x.w <= 0 || !x.r) return;
  const key = sKey(w, k); const before = exHistory(exId).filter(o => !(o.label.startsWith(SESS[k].title) && o.wk === w)).reduce((m, o) => Math.max(m, o.e1 || 0), 0);
  const spec = planFor(w, k).find(p => (sess(w, k).logs[p.slot] || {}).ex === exId); const v = e1rm(x.w, x.r, Math.min(10, x.rpe ?? (spec && spec.rpe) ?? 8));
  if (before > 0 && v > before * 1.005) setTimeout(() => toast($t('Neuer Rekord: e1RM ') + fmt(v, 0) + $t(' kg (vorher ') + fmt(before, 0) + ')'), 400); }
/* Kraftkurven: Hauptübungen des Plans, sonst die am häufigsten geloggten Übungen mit Gewicht */
function keyLifts() { const ids = []; GYM().forEach(k => planFor(1, k).forEach(p => { if (p.type === 'main' && LIB[p.ex] && !ids.includes(p.ex)) ids.push(p.ex); }));
  if (S.plan.tpl === 'hybrid') ['dip_w', 'trap'].forEach(id => { if (ids.length < 4 && !ids.includes(id)) ids.push(id); });
  if (ids.length < 4) { const cnt = {}; Object.values(S.sessions).forEach(s => Object.values(s.logs || {}).forEach(lg => { if (loggedSets(lg).some(x => x.w > 0)) cnt[lg.ex] = (cnt[lg.ex] || 0) + 1; }));
    Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).forEach(id => { if (ids.length < 4 && LIB[id] && !ids.includes(id)) ids.push(id); }); }
  return ids.slice(0, 4); }
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
  const lab = i => { if (pts[i].lab) return pts[i].lab; const d = pts[i].d; return d ? parseISO(d).getDate() + '.' + (parseISO(d).getMonth() + 1) + '.' : pts[i].wk ? 'W' + pts[i].wk : ''; };
  g += '<text class="ax" x="' + L + '" y="' + (H - 6) + '">' + lab(0) + '</text><text class="ax" x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">' + lab(n - 1) + '</text>';
  if (o.ref != null) g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(o.ref) + '" y2="' + Y(o.ref) + '" stroke="var(--graphite)" stroke-dasharray="5 5" stroke-width="1.5" opacity=".55"/><text class="ax" x="' + (W - R) + '" y="' + (Y(o.ref) - 6) + '" text-anchor="end">' + (o.refLabel || '') + ' ' + fmt(o.ref, o.dec) + '</text>';
  ser.forEach(s => {
    if (s.bars) { const bw = Math.max(3, (W - L - R) / n - 3); pts.forEach((p, i) => { if (p[s.key] == null) return; const y = Y(p[s.key]), y0 = Y(Math.max(lo, 0)); g += '<rect x="' + (X(i) - bw / 2) + '" y="' + Math.min(y, y0) + '" width="' + bw + '" height="' + Math.max(1, Math.abs(y0 - y)) + '" rx="3" fill="' + s.color + '"/>'; }); }
    else if (s.dots) pts.forEach((p, i) => { if (p[s.key] != null) g += '<circle cx="' + X(i) + '" cy="' + Y(p[s.key]) + '" r="4" fill="' + s.color + '" stroke="var(--fog)" stroke-width="2"/>'; });
    else { let dp = '', st = false; pts.forEach((p, i) => { if (p[s.key] == null) return; dp += (st ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p[s.key]).toFixed(1); st = true; });
      g += '<path d="' + dp + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
      if (s.dotsToo) pts.forEach((p, i) => { if (p[s.key] != null) g += '<circle cx="' + X(i) + '" cy="' + Y(p[s.key]) + '" r="3" fill="' + s.color + '"/>'; });
      let li = -1; pts.forEach((p, i) => { if (p[s.key] != null) li = i; }); if (li >= 0) g += '<circle cx="' + X(li) + '" cy="' + Y(pts[li][s.key]) + '" r="5" fill="' + s.color + '" stroke="var(--fog)" stroke-width="2"/>'; } });
  g += '<line id="' + id + '-x" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--graphite)" stroke-width="1" visibility="hidden"/>';
  CHARTS[id] = { pts, ser, X, L, R, W, o };
  const legend = o.noLegend ? '' : '<div class="clegend">' + ser.map(s => '<span><i class="' + (s.dots ? 'dot' : '') + '" style="background:' + s.color + '"></i>' + s.label + '</span>').join('') + '</div>';
  return '<div class="chart" data-chart="' + id + '"><svg viewBox="0 0 ' + W + ' ' + H + $t('" role="img" aria-label="Diagramm">') + g + '<rect x="' + L + '" y="0" width="' + (W - L - R) + '" height="' + H + '" fill="transparent"/></svg><div class="tip"></div></div>' + legend; }
function chartHover(e) { const box = e.target.closest('.chart'); if (!box) return; const c = CHARTS[box.dataset.chart]; if (!c) return; const svg = box.querySelector('svg'); const r = svg.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width * c.W; const n = c.pts.length; let i = c.band ? Math.floor((px - c.L) / (c.W - c.L - c.R) * n) : Math.round((px - c.L) / (c.W - c.L - c.R) * (n - 1)); i = Math.max(0, Math.min(n - 1, i));
  const p = c.pts[i]; const xl = svg.querySelector('#' + CSS.escape(box.dataset.chart) + '-x'); xl.setAttribute('x1', c.X(i)); xl.setAttribute('x2', c.X(i)); xl.setAttribute('visibility', 'visible');
  const tip = box.querySelector('.tip'); tip.innerHTML = (p.lab ? p.lab : p.d ? fmtDay(p.d) : p.wk ? $t('Woche ') + p.wk : '') + '<br>' + c.ser.map(s => s.label + ': ' + (p[s.key] != null ? fmt(p[s.key], c.o.dec) + (c.o.unit ? ' ' + c.o.unit : '') : '–')).join('<br>');
  tip.style.display = 'block'; const x = c.X(i) / c.W * r.width; tip.style.left = Math.max(60, Math.min(r.width - 60, x)) + 'px'; tip.style.top = $t('24px'); }
function chartLeave(box) { box.querySelector('.tip').style.display = 'none'; const xl = box.querySelector('line[id$="-x"]'); if (xl) xl.setAttribute('visibility', 'hidden'); }

/* ======================= EINSTELLUNGEN ======================= */
function viewMehr() { const st = S.settings; const f = (k, lab, type, extra) => '<div class="field"><label for="st-' + k + '">' + lab + '</label><input id="st-' + k + '" type="' + (type || 'number') + '" inputmode="decimal" step="any" data-st="' + k + '" value="' + esc(st[k]) + '"' + (extra || '') + '></div>';
  const sel = k => '<div class="field"><label for="dm-' + k + '">' + SESS[k].title + '</label><select id="dm-' + k + '" data-dm="' + k + $t('"><option value="">ohne festen Tag</option>') + [1, 2, 3, 4, 5, 6, 0].map(d => '<option value="' + d + '"' + (String(st.dayMap[k]) === String(d) ? $t(' selected') : '') + '>' + WD_LONG[d] + '</option>').join('') + '</select></div>';
  let rows = ''; for (let w = 1; w <= 12; w++) { const b = S.body['w' + pad(w)] || {}; const c = (k, ph) => '<td><input id="b-' + w + k + '" type="number" inputmode="decimal" step="any" data-bw="' + w + '" data-bf="' + k + '" value="' + esc(b[k]) + '" placeholder="' + ph + '"></td>'; rows += $t('<tr><td>Woche ') + w + '</td>' + c('waist', $t('cm')) + c('arm', $t('cm')) + c('thigh', $t('cm')) + c('calf', $t('cm')) + c('vo2', '') + '</tr>'; }
  const warn = scheduleWarnings(); const base = rhrBaseline(); const hm = S.healthMeta;
  const healthCard = connectCard();
  return '<a href="#heute" class="back">' + ICON.back + $t('Heute</a><div class="top"><div class="grow"><h1><span class="t-ember">Einstellungen</span> und Daten</h1></div></div><div class="stack">') + accountCard() + studioCard() +
  $t('<div class="card"><h2>Wochentage</h2><p style="margin-bottom:14px">Leg fest, an welchem Tag du welche Einheit machst. Der Block startet mit deiner ersten Einheit, egal an welchem Tag. Eine Woche ist geschafft, wenn alle Einheiten deines Plans erledigt sind.</p><div class="fields">') + ORDER.map(sel).join('') + '</div>' +
  warn.map(x => '<p class="small t-amber" style="font-weight:700">' + esc(x) + '</p>').join('') + $t('<p class="small muted">Faustregel: kein HIIT am Tag vor Gym A oder Gym C, und zwischen zwei Gym-Tagen möglichst ein anderer Tag.</p>') +
  $t('<div class="field" style="margin-top:12px"><label for="st-mode">Modus</label><select id="st-mode" data-st="mode"><option value="days"') + (st.mode !== 'rotation' ? $t(' selected') : '') + $t('>Feste Wochentage</option><option value="rotation"') + (st.mode === 'rotation' ? $t(' selected') : '') + $t('>Reihenfolge (') + ORDER.map(k => SESS[k].title).join(', ') + $t(', egal welcher Tag)</option></select></div>') +
  $t('<div class="row" style="margin-top:10px"><span class="grow small">Aktuelle Trainingswoche: <b>') + curWeek() + '</b></span><button class="btn sm" data-act="wkMinus" type="button">−</button><button class="btn sm" data-act="wkPlus" type="button">+</button></div></div>' +
  healthCard + hrmCard() +
  $t('<div class="card"><h2>Training</h2><div class="fields">') + f('hfmax', $t('Maximalpuls')) + f('rhrBase', $t('Ruhepuls-Basis (manuell)')) + f('puStart', $t('Klimmzüge Start')) + f('stepGoal', $t('Schrittziel')) + f('sleepNeedH', $t('Schlafbedarf (h)')) + f('barKg', $t('Langhantel (kg)')) + f('trapBarKg', $t('Trap Bar (kg)')) + f('waterGoal', $t('Wasserziel (ml)')) + $t('<div class="field" style="flex:1 1 100%"><label for="st-plates">Deine Scheiben (kg, mit Komma)</label><input id="st-plates" type="text" data-st="plates" value="') + esc(st.plates || '25, 20, 15, 10, 5, 2.5, 1.25') + '"></div></div><p class="small muted">' + (base && base.auto ? $t('Ruhepuls-Basis automatisch von der Uhr: ') + base.v + $t(' bpm (Median der letzten ') + base.n + $t(' Tage). Der manuelle Wert gilt nur, wenn Daten fehlen.') : $t('Mit Daten deiner Uhr berechnet die App die Basis selbst.')) + $t(' Maximalpuls geschätzt (208 − 0,7 × Alter). Hat deine Uhr einen höheren Wert gemessen, nimm den.</p></div>') +
  $t('<div class="card"><h2>Ernährung</h2><div class="fields">') + f('startKcal', $t('Start-Kalorien')) + f('tdee0', $t('Start-Bedarf')) + f('goalRate', $t('Ziel kg pro Woche')) + f('protein', $t('Protein (g)')) + f('fat', $t('Fett (g)')) + f('floor', $t('Kalorien-Minimum')) + f('startWeight', $t('Startgewicht')) + f('targetWeight', $t('Zielgewicht')) + '</div>' +
  $t('<p class="small muted">Der Start-Bedarf ist nur der Anfangswert. Die App ersetzt ihn Schritt für Schritt durch deinen echten Bedarf. Beim Check-in ändert sich das Ziel höchstens um 300 kcal und fällt nie unter das Minimum.</p></div>') +
  $t('<div class="card"><h2>Wöchentliche Messwerte</h2><div class="tbl"><table><thead><tr><th>Woche</th><th>Bauch</th><th>Oberarm</th><th>Oberschenkel</th><th>Wade</th><th>VO₂max</th></tr></thead><tbody>') + rows + '</tbody></table></div></div>' +
  $t('<div class="card"><h2>Sicherung</h2><p>Alle Daten liegen nur auf diesem Gerät. Sichere regelmäßig, vor allem vor einem Handywechsel oder dem Umstieg von der Web-App auf die Android-App.</p><div class="row" style="margin-top:14px"><button class="btn" data-act="export" type="button">Sicherung exportieren</button><button class="btn" data-act="import" type="button">Sicherung laden</button><button class="btn" data-act="pasteImport" type="button">Aus Text laden</button></div><div id="backupBox"></div></div>') +
  $t('<div class="card"><h2>App-Version</h2><p>') + (HEALTH.native ? $t('Android-App') : $t('Web-App')) + $t(' · Build ') + (BUILD.local != null ? BUILD.local : '–') + '</p>' + (HEALTH.native ? '<div class="row" style="margin-top:12px">' + (updateAvailable() ? '<a class="btn brand" href="' + APK_URL + $t('">Build ') + BUILD.remote + $t(' laden</a>') : $t('<button class="btn" data-act="checkUpdate" type="button">Nach Updates suchen</button>')) + '</div>' : $t('<p class="small muted">Die Web-App aktualisiert sich beim Öffnen von selbst.</p>')) + '</div>' +
  (NOTIF.p ? $t('<div class="card"><h2>Erinnerungen</h2><p>Pausen-Timer als Benachrichtigung, auch bei gesperrtem Bildschirm. Dazu optionale tägliche Erinnerungen. Leer lassen = aus.</p>') +
    (st.notif ? '<div class="fields" style="margin-top:12px">' + f('remWeigh', $t('Wiegen um'), 'time', ' style="width:140px"') + f('remTrain', $t('Training um'), 'time', ' style="width:140px"') + f('remMeal', $t('Essen nachtragen um'), 'time', ' style="width:140px"') + $t('</div><p class="small muted">Trainings-Erinnerungen kommen an deinen festen Wochentagen.</p>') : $t('<button class="btn brand" style="margin-top:12px" data-act="notifSetup" type="button">Benachrichtigungen einrichten</button>')) + '</div>' : '') +
  $t('<div class="card"><h2>Quellen und Lizenzen</h2><ul class="rules small"><li>Übungsdaten von <a href="https://repdb.co" target="_blank" rel="noopener">RepDB (repdb.co)</a>, Free Tier, zur Laufzeit geladen.</li><li>Körperkarte: <a href="https://github.com/melihcolpan/MuscleMap" target="_blank" rel="noopener">MuscleMap</a> von Melih Colpan, MIT-Lizenz.</li><li>Lebensmittel: <a href="https://openfoodfacts.org" target="_blank" rel="noopener">Open Food Facts</a>, Daten unter ODbL.</li><li>Barcode: ZXing (Apache 2.0) · ZIP-Import: fflate (MIT) · Health Connect: @capgo/capacitor-health (MPL 2.0).</li></ul></div>') +
  (S.plan.tpl !== 'hybrid' ? '</div>' : '') + (S.plan.tpl !== 'hybrid' ? '' : $t('<div class="card"><h2>Regeln und Evidenz</h2><ul class="rules">') +
  $t('<li><b>Schwerpunkt Waden, Hamstrings, Bizeps, Bauch:</b> 12–20 Sätze pro Woche, auf 2–3 Tage verteilt. Mehr Volumen bringt mehr Wachstum, aber mit abnehmendem Ertrag (Schoenfeld 2017, Pelland 2024).</li>') +
  $t('<li><b>Intensität:</b> Isolationsübungen bis RPE 9–10. Je näher am Versagen, desto mehr Hypertrophie, für Kraft spielt es kaum eine Rolle (Robinson 2024). Hauptübungen bleiben bei RPE 6–8.</li>') +
  $t('<li><b>Gedehnte Position:</b> Beinbeuger sitzend statt liegend (Maeo 2021), Curls mit gestrecktem Arm, Teilwiederholungen in der Dehnung bei den Waden (Kassiano 2023).</li>') +
  $t('<li><b>Nordic Curls:</b> zweimal 4–8 langsame Wiederholungen in Gym B. Exzentrisches Hamstring-Training senkt das Risiko für Zerrungen deutlich (van Dyk 2019).</li><li><b>Dips:</b> zweimal pro Woche. In Gym B schwer mit Zusatzgewicht, in Gym C mit Körpergewicht und mehr Wiederholungen.</li>') +
  $t('<li><b>Im Defizit:</b> Ziel ist Muskeln halten und leicht aufbauen. Die Rest-Muskulatur läuft bewusst auf Erhaltungsvolumen.</li>') +
  $t('<li><b>Cardio und Kraft:</b> getrennte Tage oder mindestens 3–6 h Abstand. Laufen stört den Beinaufbau stärker als Rad oder Rudern (Schumann 2022).</li>') +
  $t('<li><b>Rücken-Ampel:</b> ab 4/10 oder schlechter als beim letzten Mal: Pendulum statt Front Squat, Glute Bridge statt Trap Bar.</li>') +
  $t('<li><b>Ruhepuls +5 über Basis oder wenig Schlaf (unter 6 h):</b> Top-Sätze RPE −1, HIIT wird zu Z2.</li></ul></div></div>')); }

/* ======================= TIMER ======================= */
const TM = { end: 0, total: 0, iv: null, ctx: null, queue: [] };
let wakeLock = null;
async function keepAwake() { try { if ('wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => wakeLock = null); } } catch (e) {} }
function beep() { try { TM.ctx = TM.ctx || new (window.AudioContext || window.webkitAudioContext)(); const o = TM.ctx.createOscillator(), g = TM.ctx.createGain(); o.frequency.value = 880; g.gain.value = .15; o.connect(g); g.connect(TM.ctx.destination); o.start(); o.stop(TM.ctx.currentTime + .25); } catch (e) {} }
function showTimer(on) { $('#timer').hidden = !on; document.body.classList.toggle('timing', on); }
function startTimer(sec, label, queue) { if (!sec) return; TM.total = sec; TM.end = Date.now() + sec * 1000; TM.queue = queue || []; $('#tmLabel').textContent = label || $t('Pause'); showTimer(true); $('#timer').classList.remove('end'); clearInterval(TM.iv); TM.iv = setInterval(tick, 250); tick(); keepAwake(); }
function tick() { const left = Math.max(0, Math.round((TM.end - Date.now()) / 1000)); $('#tmTime').textContent = Math.floor(left / 60) + ':' + pad(left % 60); $('#tmBar').style.width = Math.max(0, 100 - left / TM.total * 100) + '%';
  if (left <= 0) { clearInterval(TM.iv); if (navigator.vibrate) navigator.vibrate([300, 150, 300]); beep();
    if (TM.queue.length) { const nx = TM.queue.shift(); startTimer(nx.sec, nx.label, TM.queue); } else { $('#timer').classList.add('end'); $('#tmLabel').textContent = $t('Weiter geht’s'); setTimeout(() => { if (Date.now() >= TM.end) showTimer(false); }, 6000); } } }
function intervalQueue(w, k) { const sp = k ? cardioSpec(w, k) : hiit(w);
  if (sp.seq || sp.run) { const q = [{ sec: (sp.warm || 5) * 60, label: $t('Zügig gehen zum Aufwärmen') }]; const seq = sp.seq || Array.from({ length: sp.reps }, (_, i) => [sp.dur, i < sp.reps - 1 ? sp.rest : 0]);
    seq.forEach((x, i) => { q.push({ sec: Math.round(x[0] * 60), label: $t('Laufen ') + (i + 1) + $t(' von ') + seq.length }); if (x[1]) q.push({ sec: Math.round(x[1] * 60), label: $t('Gehen') }); }); q.push({ sec: (sp.cool || 5) * 60, label: $t('Gehen zum Abwärmen') }); return q; }
  const h = sp; const q = [{ sec: (sp.warm || 10) * 60, label: $t('Aufwärmen, locker') }]; for (let i = 1; i <= h.reps; i++) { q.push({ sec: h.dur * 60, label: $t('Intervall ') + i + $t(' von ') + h.reps + $t(': hart') }); if (i < h.reps) q.push({ sec: (h.rest || 3) * 60, label: $t('Pause, locker') }); } q.push({ sec: (h.cool || 5) * 60, label: $t('Auslaufen') }); return q; }

/* ======================= EVENTS ======================= */
function sessFromRoute() { const m = route.name === 'training' && route.arg && route.arg.match(RE_SESS); return m && SESS[m[2]] ? { w: +m[1], k: m[2] } : null; }
const findAct = id => S.activities.find(a => a.id === id);
function plusMenu() { const t = (act, label, sub, cls, extra) => (label = $t(label), sub = $t(sub), '<button class="act-pick" data-act="' + act + '"' + (extra || '') + ' type="button"><span class="badge ' + cls + ' sm">' + label.slice(0, 1) + '</span><span class="grow">' + label + '<br><span class="small muted" style="font-weight:500">' + sub + '</span></span></button>');
  openSheet(sheetHead($t('Hinzufügen')) + '<div class="menu" style="margin-top:14px">' + t('scan', 'Barcode scannen', 'Lebensmittel per Kamera', 'gym') + t('add', 'Lebensmittel', 'Suche, Meal-Prep, Zuletzt', 'z2', ' data-meal="' + guessMeal() + '"') + t('trOpen', 'Live aufzeichnen', 'Laufen, Rad, Schwimmen mit GPS und Puls', 'z2') + t('newAct', 'Aktivität oder freies Training', 'Nachtragen: Fußball, Kraft, Yoga …', 'act') + t('weighIn', 'Gewicht', 'Heutiges Gewicht eintragen', 'hiit') + '</div>'); }
function actSheet() { openSheet(sheetHead($t('Aktivität')) + $t('<button class="btn brand block" data-act="trOpen" type="button" style="margin-top:10px">Live aufzeichnen mit GPS und Puls</button><p class="muted" style="margin-top:14px">Oder nachtragen: Was hast du gemacht?</p>') +
  ACT_GROUPS.map(([g, lab]) => '<div class="lbl" style="margin-top:14px">' + esc(lab) + '</div><div class="grid-acts" style="margin-top:6px">' + ACT_TYPES.filter(a => a.g === g).map(a => '<button class="act-pick" data-act="pickAct" data-type="' + a.id + '" type="button"><span class="badge act sm">' + esc(a.short) + '</span>' + esc(a.name) + '</button>').join('') + '</div>').join('')); }
function exPickSheet(aid, q) { q = (q || '').toLowerCase(); const items = Object.values(LIB).filter(e => !q || e.name.toLowerCase().includes(q));
  openSheet(sheetHead($t('Übung wählen')) + $t('<div class="on-white" style="margin-top:12px"><input id="exq" type="search" placeholder="Übung suchen" style="width:100%" value="') + esc(q) + '" data-aid="' + aid + '"></div><div class="plist" id="exlist" style="margin-top:8px">' + exItems(items, aid) + '</div>'); }
const exItems = (items, aid) => items.slice().sort((a, b) => (exAvailable(a.id) ? 0 : 1) - (exAvailable(b.id) ? 0 : 1)).map(e => '<div class="it' + (exAvailable(e.id) ? '' : $t(' off')) + '" data-act="freePickEx" data-aid="' + aid + '" data-ex="' + e.id + '"><div class="grow"><b>' + esc(e.name) + '</b><small>' + Object.keys(e.muscles).filter(m => e.muscles[m] >= 1).map(m => MUSCLES[m]).join(', ') + '</small></div>' + (isPrio(e.id) ? $t('<span class="prio">Schwerpunkt</span>') : '') + (exAvailable(e.id) ? '' : $t('<span class="small t-red">Gerät fehlt</span>')) + '</div>').join('');

document.addEventListener('input', e => { const t = e.target;
  if (t.dataset.day) { const o = dayObj(t.dataset.day); if (t.dataset.f === 'complete') o.complete = t.checked; else { o.weight = t.value; o.weightSrc = 'manual'; } save(); return; }
  if (t.dataset.st) { S.settings[t.dataset.st] = t.value; save(); if (/^rem/.test(t.dataset.st)) rescheduleReminders(); return; }
  if (t.dataset.bw) { const k = 'w' + pad(+t.dataset.bw); S.body[k] = S.body[k] || {}; S.body[k][t.dataset.bf] = t.value; save(); return; }
  if (t.dataset.se) { const s = sess(+t.dataset.sw, t.dataset.sk); s.end = s.end || {}; s.end[t.dataset.se] = t.value; markStarted(+t.dataset.sw, t.dataset.sk); save(); return; }
  if (t.dataset.daily) { const d = t.dataset.d; S.daily[d] = S.daily[d] || {}; S.daily[d][t.dataset.daily] = t.value; save(); return; }
  if (t.dataset.exnote) { S.exNotes[t.dataset.exnote] = t.value; save(); return; }
  if (t.id === 'pl-kg' || t.id === 'pl-bar') { if (t.id === 'pl-bar') { if (ui.plate && ui.plate.exId === 'trap') S.settings.trapBarKg = t.value; else S.settings.barKg = t.value; save(); } const el = $('#plBody'); if (el) el.innerHTML = plateBody(num($('#pl-kg').value), ui.plate && ui.plate.isMain, num($('#pl-bar').value)); return; }
  if (t.id === 'baRange') { const top2 = document.querySelector('#ba .ba-b'); if (top2) top2.style.clipPath = $t('inset(0 ') + (100 - t.value) + '% 0 0)'; return; }
  if (t.dataset.sdate) { if (t.value) { sess(+t.dataset.sw, t.dataset.sk).date = t.value; save(); } return; }
  if (t.id === 'rc-name' || t.id === 'rc-por') { if (ui.recipe) { ui.recipe[t.id === 'rc-name' ? 'name' : 'portions'] = t.value; } return; }
  if (t.dataset.ck) { const s = sess(+t.dataset.sw, t.dataset.sk); s.check[t.dataset.ck] = t.value; save(); return; }
  if (t.dataset.cf) { const w = +t.dataset.cw, k = t.dataset.ck2; const s = sess(w, k); s.cardio = s.cardio || {}; s.cardio[t.dataset.cf] = t.value; if (t.dataset.cf === 'dur' && t.value) markStarted(w, k); save(); return; }
  if (t.id === 'exq') { const q = t.value.toLowerCase(); $('#exlist').innerHTML = exItems(Object.values(LIB).filter(x => x.name.toLowerCase().includes(q)), t.dataset.aid); return; }
  if (t.dataset.aid && t.dataset.idx != null && t.dataset.f) { const a = findAct(t.dataset.aid); const ex = a.exercises[+t.dataset.idx]; const i = +t.dataset.i; ex.sets[i] = ex.sets[i] || {}; ex.sets[i][t.dataset.f] = t.value; save(); return; }
  if (t.dataset.aid && t.dataset.af) { const a = findAct(t.dataset.aid); if (!a) return; const f = t.dataset.af;
    if (f === 'countsZ') { a.countsAs = t.checked ? Z2K() : undefined; if (t.checked) a.week = a.week || curWeek(); }
    else { a[f] = t.value; if (f === 'type' && ACT_MAP[t.value].strength && !a.exercises) a.exercises = []; } save(); return; }
  if (t.dataset.slot) { const r = sessFromRoute(); if (!r) return; const spec = planFor(r.w, r.k).find(p => p.slot === t.dataset.slot); const s = sess(r.w, r.k);
    const lg = s.logs[spec.slot] || (s.logs[spec.slot] = { ex: actualEx(r.w, r.k, spec), sets: [] }); const i = +t.dataset.i; for (let j = 0; j <= i; j++) lg.sets[j] = lg.sets[j] || {}; lg.sets[i][t.dataset.f] = t.value; save(); return; }
  if (t.id === 'qq' || t.id === 'qu') { const b = document.querySelector('[data-act=confirmAdd],[data-act=saveEntry]'); if (b) updatePrev(b.dataset.id); }
});
document.addEventListener('change', async e => { const t = e.target;
  if (t.dataset.dm) { S.settings.dayMap[t.dataset.dm] = t.value === '' ? '' : +t.value; save(); render(); return; }
  if (t.dataset.daily) { render(); return; }
  if (t.dataset.se) { const r = sessFromRoute(); if (r) softPatch('endcard', endCard(r.w, r.k)); return; }
  if (t.dataset.ck) { const r = sessFromRoute(); if (r) { const fl = $('#flags'); if (fl) fl.outerHTML = flagsHTML(r.w, r.k); planFor(r.w, r.k).forEach(spec => softPatch('ex-' + spec.slot, exCard(r.w, r.k, spec))); } }
  if (t.dataset.slot && t.dataset.f) { const r = sessFromRoute(); if (r) { const spec = planFor(r.w, r.k).find(p => p.slot === t.dataset.slot); softPatch('ex-' + spec.slot, exCard(r.w, r.k, spec)); if (spec.slot === 'bench_top') { const bo = planFor(r.w, r.k).find(p => p.slot === 'bench_bo'); if (bo) softPatch('ex-bench_bo', exCard(r.w, r.k, bo)); } } }
  if (t.dataset.aid && (t.dataset.af === 'type' || t.dataset.af === 'date' || t.dataset.af === 'countsZ')) render();
  if (t.dataset.day && (route.name === 'heute' || t.dataset.f === 'complete')) render();
  if (t.id === 'fileImport' && t.files[0]) { const rd = new FileReader(); rd.onload = () => importBackup(rd.result); rd.readAsText(t.files[0]); t.value = ''; }
  if (t.dataset.st === 'mode') render();
  if (t.id === 'filePhoto' && t.files[0]) { const file = t.files[0]; t.value = ''; try { const blob = await compressImage(file, 1280); await PHOTOS.put({ id: uid(), date: today(), ts: Date.now(), view: ui.photoView || 'vorne', blob }); toast($t('Foto gespeichert')); await refreshPhotoCard(); } catch (err) { toast($t('Foto konnte nicht gespeichert werden.')); } }
  if (t.id === 'fileZepp' && t.files.length) { await importZeppFiles(Array.from(t.files)); t.value = ''; }
});
function importBackup(txt) { try { const d = JSON.parse(txt); if (!d.settings || !d.sessions) throw new Error('Format'); S = loadState(txt); applyPlan(); save(); render(true); toast($t('Sicherung geladen')); } catch (err) { toast($t('Das ist keine Hybridblock-Sicherung.')); } }
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'rc-q') recSearch(e.target.value.trim()); if (e.key === 'Enter' && e.target.id === 'q') offSearch(e.target.value.trim()); if (e.key === 'Enter' && e.target.id === 'scanCode') { const c = e.target.value; closeScanner(); lookupBarcode(c); }
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
    case 'finishYes': { const w = curWeek(); ORDER.forEach(k => { if (!sessProgress(w, k).done) sess(w, k).skipped = true; }); S.block.week = Math.min(12, w + 1); ui.week = S.block.week; ui.confirmFinish = false; save(); render(); toast($t('Weiter mit Woche ') + S.block.week); break; }
    case 'skip': sess(+b.dataset.w, b.dataset.k).skipped = true; save(); location.hash = '#training'; break;
    case 'unskip': delete sess(+b.dataset.w, b.dataset.k).skipped; save(); render(); break;
    case 'wkMinus': S.block.week = Math.max(1, curWeek() - 1); ui.week = null; save(); render(); break;
    case 'wkPlus': S.block.week = Math.min(12, curWeek() + 1); ui.week = null; save(); render(); break;
    case 'done': {
      if (b.dataset.aid) { const act = findAct(b.dataset.aid); const ex = act.exercises[+b.dataset.idx]; const i = +b.dataset.i; ex.sets[i] = ex.sets[i] || {}; const set = ex.sets[i];
        if (set.done) set.done = false; else { set.t = Date.now(); for (let j = i - 1; j >= 0; j--) { const p = ex.sets[j]; if (p && p.done) { if (!set.w) set.w = p.w; if (!set.r) set.r = p.r; break; } } set.done = true; startTimer(ex.rest || 90, LIB[ex.ex].name + $t(': Pause')); }
        save(); softPatch('fx-' + b.dataset.idx, freeExCard(act, ex, +b.dataset.idx)); break; }
      const spec = planFor(r.w, r.k).find(p => p.slot === b.dataset.slot); const exId = actualEx(r.w, r.k, spec); const s = sess(r.w, r.k);
      const lg = s.logs[spec.slot] || (s.logs[spec.slot] = { ex: exId, sets: [] }); const i = +b.dataset.i; for (let j = 0; j <= i; j++) lg.sets[j] = lg.sets[j] || {}; const set = lg.sets[i];
      if (set.done) { set.done = false; } else { const rd = readiness(r.w, r.k); const sg = setSuggestion(r.w, r.k, spec, exId, i, planSuggestion(r.w, r.k, spec, exId, rd), rd);
        if ((set.w === undefined || set.w === '') && sg.load != null) set.w = String(sg.load); if ((set.r === undefined || set.r === '') && sg.reps != null) set.r = String(sg.reps);
        set.done = true; set.t = Date.now(); lg.ex = exId; markStarted(r.w, r.k); prCheck(exId, r.w, r.k, set); if (spec.rest) { startTimer(spec.rest, LIB[exId].name + $t(': Pause')); restNotify(spec.rest, $t('Nächster Satz: ') + LIB[exId].name); } }
      save(); softPatch('ex-' + spec.slot, exCard(r.w, r.k, spec)); if (spec.slot === 'bench_top') { const bo = planFor(r.w, r.k).find(p => p.slot === 'bench_bo'); if (bo) softPatch('ex-bench_bo', exCard(r.w, r.k, bo)); } break; }
    case 'swap': ui.swapScope = 'today'; ui.swapTab = 'alt'; variantsSheet(r.w, r.k, b.dataset.slot); break;
    case 'swapscope': ui.swapScope = b.dataset.s; b.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); break;
    case 'doswap': { const spec = planFor(r.w, r.k).find(p => p.slot === b.dataset.slot); const s = sess(r.w, r.k); const ex = b.dataset.ex;
      if (ui.swapScope === 'always') { if (ex === spec.ex) delete S.swaps[spec.slot]; else S.swaps[spec.slot] = ex; delete s.swaps[spec.slot]; } else { if (ex === spec.ex && !S.swaps[spec.slot]) delete s.swaps[spec.slot]; else s.swaps[spec.slot] = ex; }
      if (s.logs[spec.slot]) s.logs[spec.slot].ex = actualEx(r.w, r.k, spec); save(); closeSheet(); softPatch('ex-' + spec.slot, exCard(r.w, r.k, spec)); toast(LIB[ex].name + (ui.swapScope === 'always' ? $t(', dauerhaft') : $t(', nur heute'))); break; }
    case 'backswap': { const w = +b.dataset.w, k = b.dataset.k; const s = sess(w, k); if (planFor(w, k).some(p => p.slot === 'fs')) s.swaps.fs = 'pend'; if (planFor(w, k).some(p => p.slot === 'trap')) s.swaps.trap = 'glute_bridge';
      ['fs', 'trap'].forEach(sl => { if (s.logs[sl]) s.logs[sl].ex = s.swaps[sl]; }); save(); render(); toast($t('Für heute getauscht')); break; }
    case 'intervals': { const q = intervalQueue(+b.dataset.w, b.dataset.k); const s = sess(+b.dataset.w, b.dataset.k); s.timerStart = Date.now(); s.timerDur = q.reduce((a, x) => a + x.sec, 0); markStarted(+b.dataset.w, b.dataset.k); save(); startTimer(1, $t('Los'), q); break; }
    case 'useZepp': { const act = findAct(b.dataset.id); const w = +b.dataset.w, k = b.dataset.k; act.countsAs = k; act.week = w; markStarted(w, k); const s = sess(w, k); s.cardio = Object.assign(s.cardio || {}, { dur: String(act.dur), avg: act.avgHr ? String(act.avgHr) : (s.cardio && s.cardio.avg) || '' }); save(); render(); toast($t('Von der Uhr übernommen')); break; }
    case 'checkin': { if (!checkinDue()) break; const c = doCheckin(); toast($t('Neues Ziel: ') + fmt(c.kcal, 0) + $t(' kcal')); render(); break; }
    case 'dprev': ui.day = addDays(ui.day, -1); render(); break;
    case 'dnext': if (ui.day < today()) { ui.day = addDays(ui.day, 1); render(); } break;
    case 'template': DAY_TEMPLATE.forEach(t => addEntry(ui.day, t.food, t.meal, t.qty, t.unit)); render(); toast($t('Meal-Prep-Tag eingefügt')); break;
    case 'add': ui.meal = b.dataset.meal || guessMeal(); if (route.name !== 'essen') { ui.day = today(); } addSheet(); break;
    case 'ftab': ui.foodTab = b.dataset.t; addSheet(); break;
    case 'search': offSearch(($('#q') || {}).value.trim()); break;
    case 'scan': if (route.name !== 'essen') ui.day = today(); if (!ui.meal) ui.meal = guessMeal(); openScanner(); break;
    case 'scanClose': closeScanner(); if (ui.scanTarget === 'recipe') { ui.scanTarget = null; ui.recipe = ui.recipeKeep; recipeSheet(); } break;
    case 'scanManual': { const c = $('#scanCode').value; closeScanner(); lookupBarcode(c); break; }
    case 'torch': toggleTorch(); break;
    case 'pick': { const id = b.dataset.id; const c = offCache[id];
      if (c && c.needsFetch && !S.foods[id]) { try { const j = await fetchJson('https://world.openfoodfacts.org/api/v2/product/' + c.code + '.json?fields=code,product_name,product_name_de,product_name_en,product_name_ru,brands,nutriments,serving_quantity'); const f = j && j.product ? offMap(Object.assign({ code: c.code }, j.product)) : null;
          if (f) { S.foods[id] = f; save(); qtySheet(id); } else openSheet(sheetHead($t('Nährwerte fehlen')) + foodForm({ base: '100g', name: c.name, code: c.code }, c.code)); } catch (e) { openSheet(sheetHead($t('Nährwerte fehlen')) + foodForm({ base: '100g', name: c.name, code: c.code }, c.code)); } break; }
      if (c && !S.foods[id]) { S.foods[id] = c; save(); } qtySheet(id); break; }
    case 'confirmAdd': { const q = num($('#qq').value); if (!q) { toast($t('Menge eingeben')); break; } ui.meal = $('#qm').value; addEntry(ui.day, b.dataset.id, ui.meal, q, $('#qu').value); closeSheet(); if (route.name !== 'essen') location.hash = '#essen'; else render(); toast($t('Hinzugefügt')); break; }
    case 'edit': { const en = (dayObj(ui.day).entries || []).find(x => x.uid === b.dataset.uid); if (en && getFood(en.food)) qtySheet(en.food, en); break; }
    case 'saveEntry': { const o = dayObj(ui.day), en = o.entries.find(x => x.uid === b.dataset.uid); const q = num($('#qq').value); if (!en || !q) break; en.qty = q; en.unit = $('#qu').value; Object.assign(en, macrosFor(getFood(en.food), q, en.unit)); save(); closeSheet(); render(); break; }
    case 'delEntry': { const o = dayObj(ui.day); o.entries = o.entries.filter(x => x.uid !== b.dataset.uid); save(); closeSheet(); render(); toast($t('Gelöscht')); break; }
    case 'editFood': openSheet(sheetHead($t('Nährwerte')) + foodForm(getFood(b.dataset.id))); break;
    case 'saveFood': { const code = ($('#ff-code') || {}).value || ''; const id = b.dataset.id || (code ? 'bc_' + code : 'c_' + uid()); const old = getFood(id) || {};
      const f = { ...old, id, name: $('#ff-name').value.trim() || $t('Ohne Namen'), base: $('#ff-base').value, kcal: num($('#ff-kcal').value) || 0, p: num($('#ff-p').value) || 0, f: num($('#ff-f').value) || 0, c: num($('#ff-c').value) || 0, pieceG: num($('#ff-pg').value), code: code || old.code || '', src: old.src || 'custom' };
      S.foods[id] = f; save(); qtySheet(id); toast($t('Gespeichert')); break; }
    case 'closeSheet': closeSheet(); break;
    case 'exInfo': exInfoSheet(b.dataset.ex); break;
    case 'exEq': exEqSheet(b.dataset.ex); break;
    case 'bodyMode': ui.bodyMode = b.dataset.v; { const el = $('#bodycard'); if (el) el.outerHTML = bodyCard(ui.week || curWeek()); } break;
    case 'addSet': case 'remSet': { const spec = planFor(r.w, r.k).find(p => p.slot === b.dataset.slot); const s2 = sess(r.w, r.k); const lg2 = s2.logs[spec.slot] || (s2.logs[spec.slot] = { ex: actualEx(r.w, r.k, spec), sets: [] }); lg2.extra = Math.max(0, (lg2.extra || 0) + (a === 'addSet' ? 1 : -1)); if (a === 'remSet') lg2.sets.length = Math.min(lg2.sets.length, spec.sets + lg2.extra); save(); const el = document.getElementById('ex-' + spec.slot); if (el) el.outerHTML = exCard(r.w, r.k, spec); break; }
    case 'rpeHelp': openSheet(sheetHead($t('RPE-Skala')) + '<div class="plist" style="margin-top:8px">' + [['10', $t('Maximal, keine Wiederholung mehr möglich')], ['9,5', $t('Vielleicht noch eine, eher nicht')], ['9', $t('Noch 1 Wiederholung im Tank')], ['8,5', $t('Sicher 1, vielleicht 2')], ['8', $t('Noch 2 Wiederholungen')], ['7', $t('Noch 3 Wiederholungen, Tempo bleibt schnell')], ['6', $t('Noch 4 oder mehr, gutes Aufwärmgewicht')]].map(x => '<div class="it" style="cursor:default"><b style="width:48px">' + x[0] + '</b><div class="grow">' + x[1] + '</div></div>').join('') + $t('</div><p class="small muted">RPE = wie anstrengend der Satz war. Die App rechnet daraus den nächsten Satz.</p>')); break;
    case 'notifSetup': notifSetup(); break;
    case 'photoAdd': $('#filePhoto').click(); break;
    case 'photoView': ui.photoView = b.dataset.v; ui.photoA = ui.photoB = null; refreshPhotoCard(); break;
    case 'photoPick': if (!ui.photoA || (ui.photoA && ui.photoB)) { ui.photoA = b.dataset.id; ui.photoB = null; } else ui.photoB = b.dataset.id; refreshPhotoCard(); break;
    case 'photoDel': { const list = (await PHOTOS.all()).filter(p => p.view === (ui.photoView || 'vorne')); const id = ui.photoB || (list[list.length - 1] && list[list.length - 1].id); if (id) { await PHOTOS.del(id); ui.photoB = null; toast($t('Foto gelöscht')); refreshPhotoCard(); } break; }
    case 'water': { const o = dayObj(ui.day); o.water = Math.max(0, (num(o.water) || 0) + (+b.dataset.v)); save(); render(); break; }
    case 'quickAdd': { const kcal = num($('#qa-kcal').value); if (!kcal) { toast($t('kcal eingeben')); break; } const id = 'qa_' + uid(); S.foods[id] = { id, name: ($('#qa-name').value || '').trim() || $t('Schnell-Eintrag'), base: 'piece', kcal, p: num($('#qa-p').value) || 0, c: num($('#qa-c').value) || 0, f: num($('#qa-f').value) || 0, src: 'quick' }; addEntry(ui.day, id, ui.meal, 1, 'Stk'); closeSheet(); if (route.name !== 'essen') location.hash = '#essen'; else render(); toast($t('Eingetragen')); break; }
    case 'recNew': ui.recipe = { id: null, name: '', portions: '', items: [] }; recipeSheet(); break;
    case 'recEdit': { const f2 = S.foods[b.dataset.id]; ui.recipe = { id: f2.id, name: f2.name, portions: f2.portions, items: (f2.items || []).slice() }; recipeSheet(); break; }
    case 'recSearch': recSearch(($('#rc-q') || {}).value.trim()); break;
    case 'recPick': { const id = b.dataset.id; const c2 = offCache[id]; if (c2 && !S.foods[id]) { if (c2.needsFetch) { try { const j = await fetchJson('https://world.openfoodfacts.org/api/v2/product/' + c2.code + '.json?fields=code,product_name,product_name_de,product_name_en,product_name_ru,brands,nutriments,serving_quantity'); const f3 = j && j.product ? offMap(Object.assign({ code: c2.code }, j.product)) : null; if (!f3) { toast($t('Keine Nährwerte. Lege das Produkt unter „Neu“ an.')); break; } S.foods[id] = f3; } catch (err) { toast($t('Nicht erreichbar.')); break; } } else S.foods[id] = c2; save(); } recipeQty(id); break; }
    case 'recAddItem': { const q = num($('#rq-q').value); if (!q) break; ui.recipe.items.push({ food: b.dataset.id, qty: q, unit: $('#rq-u').value }); recipeSheet(); break; }
    case 'recDelItem': ui.recipe.items.splice(+b.dataset.i, 1); recipeSheet(); break;
    case 'recSave': { if (!ui.recipe.items.length) { toast($t('Erst Zutaten hinzufügen')); break; } const id = saveRecipe(); toast($t('Rezept gespeichert')); qtySheet(id); break; }
    case 'recDel': if (ui.recipe.id) { delete S.foods[ui.recipe.id]; save(); } ui.foodTab = 'rec'; addSheet(); break;
    case 'recScan': ui.scanTarget = 'recipe'; ui.recipeKeep = ui.recipe; openScanner(); break;
    case 'plates': plateSheet(num(b.dataset.load), !!b.dataset.main, b.dataset.ex); break;
    case 'showReport': ui.week = +b.dataset.w; location.hash = '#training'; break;
    case 'loadTrace': { toast($t('Lade Pulskurve …')); let ok2 = false; try { ok2 = await fetchTrace(b.dataset.tkey, +b.dataset.s, +b.dataset.e); } catch (err) {} toast(ok2 ? $t('Pulskurve geladen') : $t('Keine Pulsdaten für diesen Zeitraum gefunden.')); render(); break; }
    case 'copyYesterday': { const y = addDays(ui.day, -1); ((S.days[y] || {}).entries || []).forEach(e => addEntry(ui.day, e.food, e.meal, e.qty, e.unit)); render(); toast($t('Von gestern übernommen')); break; }
    case 'saveTpl': { const t2 = saveMealTemplate(ui.day, b.dataset.meal); if (t2) toast($t('Vorlage gespeichert: ') + t2.name); break; }
    case 'useTpl': { const t2 = S.mealTemplates.find(x => x.id === b.dataset.id); if (!t2) break; t2.entries.forEach(e => { if (getFood(e.food)) addEntry(ui.day, e.food, ui.meal, e.qty, e.unit); }); closeSheet(); if (route.name !== 'essen') location.hash = '#essen'; else render(); toast($t('Vorlage eingefügt')); break; }
    case 'delTpl': S.mealTemplates = S.mealTemplates.filter(x => x.id !== b.dataset.id); save(); addSheet(); break;
    case 'exHist': exHistSheet(b.dataset.ex); break;
    case 'exMetric': exHistSheet(ui.exHist.exId, b.dataset.v, ui.exHist.period); break;
    case 'exPeriod': exHistSheet(ui.exHist.exId, ui.exHist.metric, b.dataset.v); break;
    case 'newAct': actSheet(); break;
    case 'pickAct': { const act = newActivity(b.dataset.type); closeSheet(); location.hash = '#frei/' + act.id; if (ACT_MAP[act.type].strength) setTimeout(() => exPickSheet(act.id), 120); break; }
    case 'freeAddEx': exPickSheet(b.dataset.aid); break;
    case 'freePickEx': { if (b.dataset.aid.startsWith('wo:')) { const wo = S.workouts.find(o => o.id === b.dataset.aid.slice(3)); if (wo) wo.items.push({ ex: b.dataset.ex, sets: 3, reps: '8–12', rpe: 8, rest: 90 }); save(); closeSheet(); render(); break; } const act = findAct(b.dataset.aid); act.exercises.push({ ex: b.dataset.ex, sets: [{}, {}, {}] }); save(); closeSheet(); render(); break; }
    case 'freeAddSet': { const act = findAct(b.dataset.aid); act.exercises[+b.dataset.idx].sets.push({}); save(); softPatch('fx-' + b.dataset.idx, freeExCard(act, act.exercises[+b.dataset.idx], +b.dataset.idx)); render(); break; }
    case 'freeDelEx': { const act = findAct(b.dataset.aid); act.exercises.splice(+b.dataset.idx, 1); save(); render(); break; }
    case 'delAct': ui.confirmDel = b.dataset.aid; render(); break;
    case 'delActNo': ui.confirmDel = null; render(); break;
    case 'delActYes': { const act = findAct(b.dataset.aid); if (act && act.key) S.healthMeta.ignored.push(act.key); S.activities = S.activities.filter(x => x.id !== b.dataset.aid); ui.confirmDel = null; save(); location.hash = '#training'; toast($t('Gelöscht')); break; }
    case 'weighIn': closeSheet(); location.hash = '#heute'; setTimeout(() => { const i = $('#wToday'); if (i) i.focus(); }, 150); break;
    case 'hcConnect': hcConnect(); break;
    case 'hcSync': if (!HEALTH.native) { location.hash = '#mehr'; break; } toast($t('Synchronisiere …')); hcSync(false); break;
    case 'hcSettings': try { await HEALTH.plugin.openHealthConnectSettings(); } catch (err) { toast($t('Health Connect lässt sich nicht öffnen.')); } break;
    case 'zepp': $('#fileZepp').click(); break;
    case 'checkUpdate': await checkUpdate(true); render(); if (!updateAvailable()) toast(BUILD.remote != null ? $t('Du hast die neueste Version.') : $t('Update-Server nicht erreichbar.')); break;
    case 'export': exportBackup(); break;
    case 'import': $('#fileImport').click(); break;
    case 'pasteImport': $('#backupBox').innerHTML = $t('<div class="on-white" style="margin-top:12px"><textarea id="pasteBox" placeholder="Sicherungs-Text hier einfügen" style="background:var(--paper)"></textarea></div><button class="btn brand" style="margin-top:10px" data-act="pasteGo" type="button">Laden</button>'); break;
    case 'pasteGo': importBackup($('#pasteBox').value); break;
  } });
async function exportBackup() { const txt = JSON.stringify(S); const name = 'hybridblock-' + today() + $t('.json');
  try { const file = new File([txt], name, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: $t('Hybridblock-Sicherung') }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  if (!HEALTH.native) { const u = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); const l = document.createElement('a'); l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000); return; }
  try { await navigator.clipboard.writeText(txt); toast($t('Sicherung in die Zwischenablage kopiert')); } catch (e) { $('#backupBox').innerHTML = $t('<p class="small muted">Text markieren und kopieren:</p><textarea readonly style="background:var(--paper)">') + esc(txt) + '</textarea>'; } }
$('#tmMinus').addEventListener('click', () => { TM.end -= 15000; tick(); });
$('#tmPlus').addEventListener('click', () => { TM.end += 30000; TM.total += 30; tick(); });
$('#tmStop').addEventListener('click', () => { clearInterval(TM.iv); TM.queue = []; showTimer(false); restCancel(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (!$('#timer').hidden) keepAwake(); autoSync(); checkUpdate(false); autoPull(); } });
function autoSync() { if (VIEW || !HEALTH.native || S.healthMeta.source !== 'hc') return; const ls = S.healthMeta.lastSync ? Date.parse(S.healthMeta.lastSync) : 0; if (Date.now() - ls > 30 * 60 * 1000) hcSync(false); }

/* ======================= INSIGHTS: Bereitschaft, Belastung, Schlaf, Puls ======================= */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sleepNeed = () => (num(S.settings.sleepNeedH) || 8) * 60;
function avgPrev(field, d, n) { const v = []; for (let i = 1; i <= n; i++) { const h = S.health[addDays(d, -i)]; const x = h && (field === 'rhr' ? (h.rhr ?? h.rhrEst) : h[field]); if (x != null) v.push(x); } return v.length >= 3 ? v.reduce((a, b) => a + b, 0) / v.length : null; }
function deltaTag(cur, avg, goodUp, unit) { if (cur == null || avg == null) return ''; const dl = cur - avg; if (Math.abs(dl) < 0.5) return $t('<span class="delta">wie Ø 30 Tage</span>');
  const good = goodUp ? dl > 0 : dl < 0; return '<span class="delta ' + (good ? 'good' : 'bad') + '">' + (dl > 0 ? '↑ ' : '↓ ') + fmt(Math.abs(dl), 0) + (unit || '') + $t(' vs. Ø</span>'); }
/* HRV: ln(RMSSD) gegen 7-Tage-Mittel, Streuung aus 30 Tagen (Plews et al.) */
function hrvBaseline(d) { const l7 = [], l30 = []; for (let i = 1; i <= 30; i++) { const h = S.health[addDays(d, -i)]; if (h && h.hrv > 0) { const v = Math.log(h.hrv); if (i <= 7) l7.push(v); l30.push(v); } }
  if (l7.length < 3 || l30.length < 7) return null; const m7 = l7.reduce((a, b) => a + b, 0) / l7.length, m30 = l30.reduce((a, b) => a + b, 0) / l30.length;
  const sd = Math.sqrt(l30.reduce((a, b) => a + (b - m30) ** 2, 0) / (l30.length - 1)) || 0.05; return { m7, sd }; }
function dailyReadiness(d) { const h = S.health[d] || {}, dl = S.daily[d] || {}, comps = []; const need = sleepNeed();
  if (h.sleepMin != null) comps.push({ k: $t('Schlaf'), v: clamp(h.sleepMin / need * 100, 0, 100), w: .3, txt: fmtMin(h.sleepMin) + $t(' von ') + fmtMin(need) });
  const r = rhrOf(d), base = rhrBaseline(); if (r != null && base) comps.push({ k: $t('Ruhepuls'), v: clamp(85 - (r - base.v) * 7, 0, 100), w: .25, txt: fmt(r, 0) + $t(' bpm, Basis ') + base.v });
  const hb = h.hrv > 0 ? hrvBaseline(d) : null; if (hb) { const z = (Math.log(h.hrv) - hb.m7) / hb.sd; comps.push({ k: $t('HRV'), v: clamp(70 + 20 * z, 0, 100), w: .2, txt: fmt(h.hrv, 0) + $t(' ms, Ø 7 Tage ') + fmt(Math.exp(hb.m7), 0) }); }
  const feel = num(dl.feel), sore = num(dl.sore); if (feel != null || sore != null) { const p = []; if (feel != null) p.push((feel - 1) / 4 * 100); if (sore != null) p.push((5 - sore) / 4 * 100);
    comps.push({ k: $t('Gefühl'), v: p.reduce((a, b) => a + b, 0) / p.length, w: .25, txt: [feel != null ? $t('Energie ') + feel + '/5' : '', sore != null ? $t('Muskelkater ') + sore + '/5' : ''].filter(Boolean).join(', ') }); }
  if (!comps.length) return null; const W = comps.reduce((a, c) => a + c.w, 0); const score = Math.round(comps.reduce((a, c) => a + c.v * c.w, 0) / W);
  const level = score >= 67 ? 'green' : score >= 34 ? 'amber' : 'red';
  const rec = score >= 67 ? $t('Plan wie vorgegeben.') : score >= 50 ? $t('Normal trainieren, die RPE-Ziele ernst nehmen.') : score >= 34 ? $t('Top-Sätze eine RPE-Stufe leichter.') : $t('Hauptübungen eine RPE-Stufe leichter, Zubehör einen Satz weniger, HIIT als lockere Z2-Einheit.');
  return { score, level, comps, rec }; }
const LVL_COLOR = { green: 'var(--verdant)', amber: 'var(--sunset)', red: 'var(--signal)' };
function scoreRing(score, level, size) { const C = 2 * Math.PI * 40, pct = score / 100; return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="var(--paper)" stroke-width="12"/><circle cx="50" cy="50" r="40" fill="none" stroke="' + LVL_COLOR[level] + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (C * pct).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 50 50)"/><text x="50" y="57" text-anchor="middle" font-size="24" font-weight="800" fill="var(--graphite)" font-family="Nunito Sans, sans-serif">' + score + '</text></svg>'; }
function readinessCard(d) { const r = dailyReadiness(d); const dl = S.daily[d] || {};
  const sel = (f, lab, opts) => '<div class="field"><label for="dl-' + f + '">' + lab + '</label><select id="dl-' + f + '" data-daily="' + f + '" data-d="' + d + '"><option value="">–</option>' + opts.map(o => '<option value="' + o[0] + '"' + (String(dl[f]) === String(o[0]) ? $t(' selected') : '') + '>' + o[1] + '</option>').join('') + '</select></div>';
  const lvlTxt = { green: $t('Bereit'), amber: $t('Eingeschränkt'), red: $t('Erholung zuerst') };
  return '<div class="card"><div class="row" style="align-items:center;gap:16px">' + (r ? scoreRing(r.score, r.level, 92) : '<div class="badge mute" style="width:92px;height:92px;flex-basis:92px;font-size:14px">–</div>') +
    $t('<div class="grow"><div class="lbl">Bereitschaft heute</div><h2 style="margin:2px 0 4px">') + (r ? lvlTxt[r.level] : $t('Noch keine Daten')) + '</h2><div class="small">' + (r ? esc(r.rec) : $t('Trag unten ein, wie du dich fühlst. Mit den Daten deiner Uhr kommen Schlaf, Ruhepuls und HRV dazu.')) + '</div></div></div>' +
    (r ? '<div class="comps">' + r.comps.map(c => '<div class="comp"><span class="dot" style="background:' + LVL_COLOR[c.v >= 67 ? 'green' : c.v >= 34 ? 'amber' : 'red'] + '"></span><b>' + c.k + '</b><span class="num">' + Math.round(c.v) + '</span><small>' + esc(c.txt) + '</small></div>').join('') + '</div>' : '') +
    '<div class="fields" style="margin-top:14px">' + sel('feel', $t('Energie'), [[5, $t('sehr gut')], [4, 'gut'], [3, $t('normal')], [2, $t('müde')], [1, $t('erschöpft')]]) + sel('sore', $t('Muskelkater'), [[1, $t('keiner')], [2, $t('leicht')], [3, $t('mittel')], [4, $t('stark')], [5, $t('sehr stark')]]) + '</div></div>'; }

/* Belastung = Dauer (min) × Session-RPE (Foster 2001) */
function autoDur(s) { const ts = []; Object.values(s.logs || {}).forEach(lg => (lg.sets || []).forEach(x => { if (x && x.t) ts.push(x.t); })); if (ts.length < 2) return null; return Math.round((Math.max(...ts) - Math.min(...ts)) / 60000) + 5; }
function sessLoad(w, k) { const s = peekSess(w, k); if (!s || s.skipped) return null;
  if (isCardio(k)) { const c = s.cardio || {}; const d = num(c.dur), r = num(c.rpe); return d ? { load: r ? d * r : null, dur: d, rpe: r, missing: !r } : null; }
  const e = s.end || {}; const d = num(e.dur) ?? (s.watch && num(s.watch.dur) ? Math.round(s.watch.dur) : null) ?? autoDur(s); const r = num(e.rpe); if (!d) return null; return { load: r ? d * r : null, dur: d, rpe: r, missing: !r }; }
function actLoad(a) { const d = num(a.dur), r = num(a.rpe); if (!d) return null; if (a.countsAs) { const s = peekSess(a.week, a.countsAs); if (s && s.cardio && num(s.cardio.dur)) return null; } return { load: r ? d * r : null, dur: d, rpe: r, missing: !r }; }
function dailyLoad(d) { let load = 0, missing = 0, n = 0; for (let w = 1; w <= 12; w++) ORDER.forEach(k => { const s = peekSess(w, k); if (!s || s.date !== d) return; const L = sessLoad(w, k); if (!L) return; n++; if (L.load != null) load += L.load; else missing++; });
  S.activities.filter(a => a.date === d).forEach(a => { const L = actLoad(a); if (!L) return; n++; if (L.load != null) load += L.load; else missing++; }); return { load, missing, n }; }
function weekLoad(endD) { const arr = []; let miss = 0; for (let i = 6; i >= 0; i--) { const x = dailyLoad(addDays(endD, -i)); arr.push(x.load); miss += x.missing; } const tot = arr.reduce((a, b) => a + b, 0), m = tot / 7; const sd = Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / 7); return { tot, mono: sd > 0 && tot > 0 ? m / sd : null, miss }; }

/* Schlaf */
function sleepDebt(d) { const need = sleepNeed(); let debt = 0, n = 0; for (let i = 0; i < 7; i++) { const h = S.health[addDays(d, -i)]; if (h && h.sleepMin != null) { debt += Math.max(0, need - h.sleepMin); n++; } } return n ? { debt, n } : null; }
function sleepConsistency(d) { const bed = [], wake = []; for (let i = 0; i < 7; i++) { const h = S.health[addDays(d, -i)]; if (h && h.bed && h.wake) { const b = new Date(h.bed), w = new Date(h.wake); let bm = b.getHours() * 60 + b.getMinutes(); if (bm < 720) bm += 1440; bed.push(bm); wake.push(w.getHours() * 60 + w.getMinutes()); } }
  if (bed.length < 3) return null; const mean = a => a.reduce((x, y) => x + y, 0) / a.length; const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
  return { sdBed: sd(bed), sdWake: sd(wake), bed: mean(bed) % 1440, wake: mean(wake), n: bed.length }; }
const hm = m => { const t = Math.round(m); return pad(Math.floor(t / 60) % 24) + ':' + pad(t % 60); };
function stackChart(id, pts, keys, o) { const W = 640, H = o.height || 200, L = 46, R = 14, T = 14, B = 26; const tot = p => keys.reduce((a, k) => a + (p[k.key] || 0), 0);
  const maxv = Math.max(1, o.ref || 0, ...pts.map(tot)); const step = maxv > 10 ? 2 : 1; const hi = Math.ceil(maxv / step) * step; const n = pts.length; const bwid = (W - L - R) / n; const bw = Math.max(4, bwid - 5);
  const X = i => L + (i + .5) * bwid; const Y = v => T + (1 - v / hi) * (H - T - B);
  let g = ''; for (let v = 0; v <= hi; v += step) g += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="ax" x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>';
  pts.forEach((p, i) => { let acc = 0; keys.forEach(k => { const v = p[k.key] || 0; if (!v) return; const y1 = Y(acc + v), y0 = Y(acc); g += '<rect x="' + (X(i) - bw / 2).toFixed(1) + '" y="' + y1.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0, y0 - y1 - 2).toFixed(1) + '" rx="2" fill="' + k.color + '"/>'; acc += v; }); });
  const lab = i => { const d = parseISO(pts[i].d); return d.getDate() + '.' + (d.getMonth() + 1) + '.'; };
  g += '<text class="ax" x="' + X(0) + '" y="' + (H - 6) + '" text-anchor="middle">' + lab(0) + '</text><text class="ax" x="' + X(n - 1) + '" y="' + (H - 6) + '" text-anchor="middle">' + lab(n - 1) + '</text>';
  if (o.ref != null) g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(o.ref) + '" y2="' + Y(o.ref) + '" stroke="var(--graphite)" stroke-dasharray="5 5" stroke-width="1.5" opacity=".55"/><text class="ax" x="' + (W - R) + '" y="' + (Y(o.ref) - 6) + '" text-anchor="end">' + (o.refLabel || '') + '</text>';
  g += '<line id="' + id + '-x" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" stroke="var(--graphite)" stroke-width="1" visibility="hidden"/>';
  CHARTS[id] = { pts, ser: keys.map(k => ({ key: k.key, label: k.label })), X, L, R, W, o, band: n };
  return '<div class="chart" data-chart="' + id + '"><svg viewBox="0 0 ' + W + ' ' + H + $t('" role="img" aria-label="Diagramm">') + g + '<rect x="' + L + '" y="0" width="' + (W - L - R) + '" height="' + H + '" fill="transparent"/></svg><div class="tip"></div></div><div class="clegend">' + keys.map(k => '<span><i style="background:' + k.color + '"></i>' + k.label + '</span>').join('') + '</div>'; }

/* Pulskurve und Zonen (Zonen passend zu den Vorgaben im Plan) */
const ZONES = [{ k: 'Z1', lo: 0, hi: .65, c: $t('var(--mist)'), n: $t('locker') }, { k: 'Z2', lo: .65, hi: .75, c: $t('var(--verdant)'), n: $t('Grundlage') }, { k: 'Z3', lo: .75, hi: .85, c: $t('var(--sky)'), n: $t('Tempo') }, { k: 'Z4', lo: .85, hi: .9, c: $t('var(--sunset)'), n: $t('Schwelle') }, { k: 'Z5', lo: .9, hi: 9, c: $t('var(--signal)'), n: $t('VO₂max') }];
function zoneTimes(tr) { const hf = num(S.settings.hfmax) || 186; const t = ZONES.map(() => 0); const p = tr.pts; for (let i = 1; i < p.length; i++) { const dt = Math.min(180, p[i][0] - p[i - 1][0]); const f = p[i - 1][1] / hf; const zi = ZONES.findIndex(z => f >= z.lo && f < z.hi); if (zi >= 0 && dt > 0) t[zi] += dt; } return t; }
function downsample(raw, max) { max = max || 360; if (raw.length <= max) return raw.map(p => [Math.round(p[0]), Math.round(p[1])]); const t0 = raw[0][0], span = raw[raw.length - 1][0] - t0 || 1, b = span / max; const out = []; let cur = null;
  raw.forEach(p => { const i = Math.floor((p[0] - t0) / b); if (!cur || cur.i !== i) { if (cur) out.push([Math.round(cur.t / cur.n), Math.round(cur.v / cur.n)]); cur = { i, t: 0, v: 0, n: 0 }; } cur.t += p[0]; cur.v += p[1]; cur.n++; }); if (cur) out.push([Math.round(cur.t / cur.n), Math.round(cur.v / cur.n)]); return out; }
async function fetchTrace(tkey, startMs, endMs) { const H = HEALTH.plugin; if (!H || !startMs || !endMs) return false;
  const r = await H.readSamples({ dataType: 'heartRate', startDate: new Date(startMs).toISOString(), endDate: new Date(endMs).toISOString(), limit: 10000, ascending: true });
  const raw = (r.samples || []).map(x => [(Date.parse(x.startDate) - startMs) / 1000, x.value]).filter(p => p[0] >= 0 && p[1] > 30).sort((a, b) => a[0] - b[0]); if (raw.length < 5) return false;
  S.hrTraces[tkey] = { start: startMs, end: endMs, pts: downsample(raw), src: 'hc' }; fillAvgHr(tkey, raw); save(); return true; }
function fillAvgHr(tkey, raw) { const a = S.activities.find(x => x.id === tkey); if (a && !num(a.avgHr) && raw.length) a.avgHr = Math.round(raw.reduce((m, p) => m + p[1], 0) / raw.length); }
let ZHR = [];
function attachZeppTrace(res) { if (!res || !res.start || !res.end || !ZHR.length) return; const raw = ZHR.filter(p => p[0] >= res.start && p[0] <= res.end).map(p => [(p[0] - res.start) / 1000, p[1]]); if (raw.length >= 5) { S.hrTraces[res.tkey] = { start: res.start, end: res.end, pts: downsample(raw), src: 'zepp' }; fillAvgHr(res.tkey, raw); } }
function gymWindow(s) { if (s.watch && s.watch.start) return { start: s.watch.start, end: s.watch.end }; const ts = []; Object.values(s.logs || {}).forEach(lg => (lg.sets || []).forEach(x => { if (x && x.t) ts.push(x.t); })); return ts.length >= 2 ? { start: Math.min(...ts) - 5 * 60000, end: Math.max(...ts) + 3 * 60000 } : null; }
function traceCard(tkey, win, isHiit) { const tr = S.hrTraces[tkey]; const hf = num(S.settings.hfmax) || 186;
  if (!tr) return win && HEALTH.native ? note('sky', $t('Pulskurve für dieses Training aus Health Connect laden.'), '<button class="btn sm brand" data-act="loadTrace" data-tkey="' + tkey + '" data-s="' + win.start + '" data-e="' + win.end + $t('" type="button">Laden</button>')) : '';
  const pts = tr.pts.map(p => ({ lab: Math.round(p[0] / 60) + $t(' min'), bpm: p[1] })); const zt = zoneTimes(tr); const tot = zt.reduce((a, b) => a + b, 0) || 1;
  const bpms = tr.pts.map(p => p[1]); const avg = bpms.reduce((a, b) => a + b, 0) / bpms.length, mx = Math.max(...bpms);
  return $t('<div class="card"><div class="row"><h2 class="grow">Puls</h2><span class="tag">Ø ') + fmt(avg, 0) + $t(' · max ') + fmt(mx, 0) + $t(' bpm</span></div>') +
    lineChart('tr-' + tkey, pts, [{ key: $t('bpm'), label: $t('Puls'), color: $t('var(--signal)') }], { unit: $t('bpm'), dec: 0, noLegend: true, ref: Math.round(hf * .9), refLabel: $t('90 % HFmax'), height: 180 }) +
    (isHiit ? '<p style="margin:10px 0 0"><b>' + fmt(zt[4] / 60, 1) + $t(' min</b> über 90 % HFmax. Ziel bei 4×4: etwa 2 min pro Intervall.</p>') : '') +
    '<div class="vol" style="margin-top:12px">' + ZONES.map((z, i) => '<span>' + z.k + ' ' + z.n + '</span><div class="b"><i style="width:' + (zt[i] / tot * 100) + '%;background:' + z.c + '"></i></div><span class="num small">' + fmt(zt[i] / 60, 0) + $t(' min</span>')).join('') + '</div>' +
    $t('<p class="src" style="margin-top:8px">Zonen in % von HFmax ') + hf + $t(': Z1 unter 65, Z2 65–75, Z3 75–85, Z4 85–90, Z5 ab 90. Quelle: ') + (tr.src === 'zepp' ? $t('Zepp-Export') : $t('Health Connect')) + '</p></div>'; }

/* Wochenbericht */
function weekReport(w) { const days = []; ORDER.forEach(k => { const s = peekSess(w, k); if (s && s.date) days.push(s.date); }); S.activities.filter(a => a.week === w).forEach(a => days.push(a.date)); if (!days.length) return '';
  days.sort(); const from = days[0], to = days[days.length - 1]; const done = ORDER.filter(k => { const p = sessProgress(w, k); return p.done && !p.skipped; }).length;
  const vol = weekVolume(w); const prs = []; const ids = new Set(); GYM().forEach(k => { const s = peekSess(w, k); if (s && s.logs) Object.values(s.logs).forEach(lg => ids.add(lg.ex)); });
  ids.forEach(id => { const h = exHistory(id); const inW = h.filter(o => o.wk === w && o.e1), before = h.filter(o => o.wk < w && o.e1); if (inW.length && before.length) { const a = Math.max(...inW.map(o => o.e1)), b = Math.max(...before.map(o => o.e1)); if (a > b * 1.005) prs.push(LIB[id].name); } });
  const ser = series(); const tAt = d => { const x = ser.filter(p => p.d <= d).pop(); return x ? x.trend : null; }; const t1 = tAt(addDays(from, -1)) ?? tAt(from), t2 = tAt(to);
  const avgH = f => { const v = []; for (let d = from; d <= to; d = addDays(d, 1)) { const h = S.health[d]; const x = h && (f === 'rhr' ? (h.rhr ?? h.rhrEst) : h[f]); if (x != null) v.push(x); } return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  let load = 0; for (let d = from; d <= to; d = addDays(d, 1)) load += dailyLoad(d).load;
  const st = (k, v, s) => '<div class="stat" style="background:var(--paper)"><div class="k">' + k + '</div><div class="v" style="font-size:22px">' + v + '</div>' + (s ? '<div class="s">' + s + '</div>' : '') + '</div>';
  return $t('<div class="card"><h2>Wochenbericht Woche ') + w + '</h2><p class="small muted" style="margin-bottom:12px">' + fmtDay(from) + $t(' bis ') + fmtDay(to) + '</p><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))">' +
    st($t('Einheiten'), done + $t(' von ') + ORDER.length) + st($t('Gewicht (Trend)'), t1 != null && t2 != null ? (t2 - t1 <= 0 ? '−' : '+') + fmt(Math.abs(t2 - t1), 1) + $t(' kg') : '–') +
    $t('<div class="stat" style="background:var(--paper)"><div class="k">Schwerpunkt-Sätze</div><div class="small" style="font-weight:700;line-height:1.5;margin-top:4px">') + PRIORITY.map(m => MUSCLES[m] + ' ' + fmt(vol[m], 0)).join('<br>') + '</div></div>' + st($t('Belastung'), load ? fmt(load, 0) : '–', $t('Dauer × RPE')) +
    st($t('Ø Schritte'), avgH('steps') != null ? fmt(avgH('steps'), 0) : '–') + st($t('Ø Schlaf'), avgH('sleepMin') != null ? fmtMin(avgH('sleepMin')) : '–') + '</div>' +
    (prs.length ? $t('<p style="margin-top:12px"><b>Neue Rekorde:</b> ') + esc(prs.join(', ')) + '</p>' : '') + '</div>'; }

/* Scheibenrechner und Aufwärmsätze */
function ownedPlates() { const l = String(S.settings.plates || '25,20,15,10,5,2.5,1.25').split(/[,; ]+/).map(num).filter(x => x > 0).sort((a, b) => b - a); return l.length ? l : [25, 20, 15, 10, 5, 2.5, 1.25]; }
function platesFor(total, bar) { let per = (total - bar) / 2; if (per <= 0) return { plates: [], rest: 0 }; const P = ownedPlates(); const out = []; P.forEach(p => { while (per >= p - 1e-6) { out.push(p); per -= p; } }); return { plates: out, rest: Math.round(per * 100) / 100 }; }
function barFor(exId) { return exId === 'trap' ? (num(S.settings.trapBarKg) || 25) : (num(S.settings.barKg) || 20); }
function plateBody(load, isMain, barOverride) { const bar = barOverride || num(S.settings.barKg) || 20; const pl = platesFor(load || 0, bar);
  const row = (lab, kg, reps) => { const p = platesFor(kg, bar); return '<div class="it" style="cursor:default"><div class="grow"><b>' + lab + '</b><small>' + (p.plates.length ? $t('pro Seite: ') + p.plates.map(x => fmt(x, 2)).join(' + ') : $t('nur Stange')) + '</small></div><div class="end"><b class="num" style="color:var(--graphite)">' + fmt(kg, 1) + $t(' kg</b>') + (reps ? '<br>× ' + reps : '') + '</div></div>'; };
  let warm = ''; if (isMain && load > bar) { const steps = [[0, 10], [.4, 5], [.6, 3], [.75, 2], [.85, 1]]; const seen = new Set(); warm = $t('<h3 style="margin:16px 0 4px">Aufwärmen</h3><div class="plist">') + steps.map(([f, r]) => { const kg = f ? Math.max(bar, r25(load * f)) : bar; if (seen.has(kg)) return ''; seen.add(kg); return row(f ? Math.round(f * 100) + ' %' : $t('Leere Stange'), kg, r); }).join('') + $t('</div><p class="small muted">Pausen beim Aufwärmen kurz halten, ab 75 % etwa 1–2 min.</p>'); }
  return '<div class="big num" style="margin-top:8px">' + (load ? fmt(load, 1) + $t(' kg') : '–') + '</div><p class="muted" style="margin-top:4px">' + (pl.plates.length ? $t('Pro Seite: <b>') + pl.plates.map(x => fmt(x, 2)).join(' + ') + '</b>' : $t('Nur Stange')) + (pl.rest ? $t(' · Rest ') + fmt(pl.rest, 2) + $t(' kg nicht steckbar') : '') + '</p>' + warm; }
function plateSheet(load, isMain, exId) { const bar = barFor(exId); ui.plate = { isMain, exId };
  openSheet(sheetHead($t('Scheiben') + (isMain ? $t(' und Aufwärmen') : '')) + $t('<div class="fields on-white" style="margin-top:12px"><div class="field"><label for="pl-kg">Zielgewicht (kg)</label><input id="pl-kg" type="number" inputmode="decimal" step="0.5" value="') + (load || '') + $t('"></div><div class="field"><label for="pl-bar">Stange (kg)</label><input id="pl-bar" type="number" inputmode="decimal" step="0.5" value="') + bar + '"></div></div><div id="plBody">' + plateBody(load, isMain, bar) + $t('</div><p class="src">Scheiben, die du hast, unter Einstellungen → Training festlegen.</p>')); }

/* Mahlzeit-Vorlagen */
function saveMealTemplate(d, meal) { const es = ((S.days[d] || {}).entries || []).filter(e => e.meal === meal); if (!es.length) return null;
  const t = { id: uid(), meal, name: es.slice(0, 3).map(e => e.name.replace(/\s*\(.*\)/, '')).join(', ') + (es.length > 3 ? ' …' : ''), entries: es.map(e => ({ food: e.food, qty: e.qty, unit: e.unit })), kcal: es.reduce((a, e) => a + e.kcal, 0) }; S.mealTemplates.push(t); save(); return t; }

/* ======================= ÜBUNGSANLEITUNGEN (RepDB) ======================= */
const REPDB_BASE = 'https://exercise-dataset.com/';
const REPDB_L = LANG === 'en' ? 'en' : 'de', REPDB_KEY = 'hb_repdb_v2_' + REPDB_L; try { localStorage.removeItem('hb_repdb_v1'); } catch (e) {}
let REPDB_CACHE = null; try { REPDB_CACHE = JSON.parse(localStorage.getItem(REPDB_KEY) || 'null'); } catch (e) {}
let repdbLoading = null;
function loadRepdb() { if (REPDB_CACHE) return Promise.resolve(REPDB_CACHE); if (repdbLoading) return repdbLoading;
  repdbLoading = fetchJson(REPDB_BASE + $t('exercises.json'), 25000).then(j => { const want = new Set(Object.values(REPDB)); const sub = {};
    (j.exercises || []).forEach(x => { if (want.has(x.id)) sub[x.id] = { name: x['name_' + REPDB_L], desc: x['description_' + REPDB_L], steps: x['instructions_' + REPDB_L] || [], tips: x['tips_' + REPDB_L] || [], prim: x.primary_muscles || [], sec: x.secondary_muscles || [], img: (x.images && x.images.flat) || {} }; });
    REPDB_CACHE = sub; try { localStorage.setItem(REPDB_KEY, JSON.stringify(sub)); } catch (e) {} repdbLoading = null; return sub; }).catch(e => { repdbLoading = null; throw e; });
  return repdbLoading; }
const RM_DE = { quadriceps: $t('Quadrizeps'), gluteus_maximus: $t('Großer Gesäßmuskel'), gluteus_medius: $t('Mittlerer Gesäßmuskel'), hamstrings: $t('Beinbeuger'), erector_spinae: $t('Rückenstrecker'), calves: $t('Waden'), gastrocnemius: $t('Zwillingswadenmuskel'), soleus: $t('Schollenmuskel'), adductors: $t('Adduktoren'), abductors: $t('Abduktoren'), hip_flexors: $t('Hüftbeuger'), pectoralis_major: $t('Großer Brustmuskel'), upper_chest: $t('Obere Brust'), chest: $t('Brust'), anterior_deltoid: $t('Vordere Schulter'), lateral_deltoid: $t('Seitliche Schulter'), posterior_deltoid: $t('Hintere Schulter'), deltoids: $t('Schultern'), triceps: $t('Trizeps'), biceps: $t('Bizeps'), brachialis: $t('Oberarmmuskel'), brachioradialis: $t('Oberarm-Speichenmuskel'), forearms: $t('Unterarme'), latissimus_dorsi: $t('Latissimus'), lats: $t('Latissimus'), rhomboids: $t('Rautenmuskeln'), trapezius: $t('Trapezmuskel'), upper_back: $t('Oberer Rücken'), lower_back: $t('Unterer Rücken'), rectus_abdominis: $t('Gerader Bauchmuskel'), abs: $t('Bauch'), obliques: $t('Schräge Bauchmuskeln'), core: $t('Rumpf'), serratus_anterior: $t('Sägemuskel'), rotator_cuff: $t('Rotatorenmanschette'), teres_major: $t('Großer Rundmuskel') };
const rmName = k => RM_DE[k] || k.replace(/_/g, ' ');
function repdbImg(rid) { const r = REPDB_CACHE && REPDB_CACHE[rid]; if (!r) return null; const i = r.img; return { a: i.start || i.main, b: i.peak || null }; }
function exThumb(exId) { const rid = REPDB[exId]; const im = rid && repdbImg(rid); if (!im || !im.a) return ''; return '<button class="thumb" type="button" data-act="exInfo" data-ex="' + exId + $t('" aria-label="Anleitung"><img src="') + REPDB_BASE + im.a + '" alt="" loading="lazy" decoding="async"></button>'; }
function demoHTML(im) { return '<div class="demo' + (im.b ? $t(' two') : '') + '"><img src="' + REPDB_BASE + im.a + $t('" alt="Startposition">') + (im.b ? '<img class="b" src="' + REPDB_BASE + im.b + $t('" alt="Endposition">') : '') + '</div>'; }
async function exInfoSheet(exId) { const ex = LIB[exId]; const rid = REPDB[exId]; const mus = Object.keys(ex.muscles).filter(m => ex.muscles[m] >= 1).map(m => MUSCLES[m]);
  const head = sheetHead(esc(ex.name)) + '<div class="row" style="margin-top:8px">' + mus.map(m => '<span class="tag on-white" style="background:var(--fog)">' + m + '</span>').join('') + '<button class="btn sm" data-act="exHist" data-ex="' + exId + '" type="button">' + ICON.chart + $t('Verlauf</button></div>');
  const local = (ex.note ? '<p style="margin-top:12px">' + esc(ex.note) + '</p>' : '') + (S.exNotes[exId] ? $t('<p class="small"><b>Deine Notiz:</b> ') + esc(S.exNotes[exId]) + '</p>' : '');
  const cues = LANG === 'ru' && typeof CUES_RU !== 'undefined' && CUES_RU[exId] ? $t('<h3 style="margin:16px 0 6px">Ausführung</h3><ol class="rules">') + CUES_RU[exId].map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>' : '';
  if (!rid) { openSheet(head + local + cues + $t('<p class="small muted" style="margin-top:12px">Für diese Übung gibt es in der Übungsdatenbank keine Bilder.</p>')); return; }
  openSheet(head + $t('<div id="exinfo"><p class="muted" style="margin-top:12px">Lade Anleitung …</p></div>'));
  try { const db = await loadRepdb(); let r = db[rid]; const box = $('#exinfo'); if (!box) return; if (!r) { box.innerHTML = local + cues; return; }
    const im = repdbImg(rid);
    if (LANG === 'ru') r = Object.assign({}, r, { desc: '', steps: (typeof CUES_RU !== 'undefined' && CUES_RU[exId]) || [], tips: [] });
    box.innerHTML = (im && im.a ? demoHTML(im) : '') + local + (r.desc ? '<p style="margin-top:12px">' + esc(r.desc) + '</p>' : '') +
      (r.steps.length ? $t('<h3 style="margin:16px 0 6px">Ausführung</h3><ol class="rules">') + r.steps.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol>' : '') +
      (r.tips.length ? $t('<h3 style="margin:16px 0 6px">Tipps</h3><ul class="rules">') + r.tips.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
      $t('<p class="small muted" style="margin-top:10px">Hauptmuskeln: ') + esc(r.prim.map(rmName).join(', ')) + (r.sec.length ? $t(' · Mitbeteiligt: ') + esc(r.sec.map(rmName).join(', ')) : '') + '</p>' +
      $t('<p class="src">Übungsdaten von <a href="https://repdb.co" target="_blank" rel="noopener">RepDB (repdb.co)</a></p>');
  } catch (e) { const box = $('#exinfo'); if (box) box.innerHTML = local + (cues || $t('<p class="small muted" style="margin-top:12px">Anleitung gerade nicht erreichbar. Beim nächsten Öffnen mit Internet wird sie geladen und offline gespeichert.</p>')); } }

/* ======================= KÖRPERKARTE (MuscleMap, MIT) ======================= */
const SLUG_OF = { c: ['calves'], h: ['hamstring'], bi: ['biceps'], ab: ['abs', 'obliques'], q: ['quadriceps'], g: ['gluteal'], ch: ['chest'], t: ['triceps'], b: ['upperBack', 'trapezius'] };
const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, p) => { const A = hex2rgb(a), B = hex2rgb(b); return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * p).toString(16).padStart(2, '0')).join(''); };
function slugValues(mode, w) { const out = {}; const set = (slug, v) => { out[slug] = Math.max(out[slug] || 0, v); };
  if (mode === 'vol') { const v = weekVolume(w); for (const m in SLUG_OF) { const hi = PRIORITY.includes(m) ? VOL_TARGET.prio[0] : VOL_TARGET.other[1]; SLUG_OF[m].forEach(s => set(s, clamp(v[m] / hi, 0, 1))); } set('deltoids', clamp(Math.max(v.fd, v.sd, v.rd) / VOL_TARGET.other[1], 0, 1)); return { vals: out, raw: v }; }
  const last = {}; const note = (d, exId, n) => { if (!d || n < 2) return; const ex = LIB[exId]; if (!ex) return; for (const m in ex.muscles) if (ex.muscles[m] >= .5 && (!last[m] || d > last[m])) last[m] = d; };
  for (let ww = 1; ww <= 12; ww++) GYM().forEach(k => { const s = peekSess(ww, k); if (s && s.logs) Object.values(s.logs).forEach(lg => note(s.date, lg.ex, (lg.sets || []).filter(x => x && x.done).length)); });
  S.activities.forEach(a => (a.exercises || []).forEach(e => note(a.date, e.ex, (e.sets || []).filter(x => x && x.done).length)));
  const days = m => last[m] ? daysBetween(last[m], today()) : null;
  const byM = {}; Object.keys(MUSCLES).forEach(m => byM[m] = days(m));
  const lvl = d => d == null ? null : d <= 1 ? 3 : d <= 3 ? 2 : d <= 7 ? 1 : 0;
  for (const m in SLUG_OF) SLUG_OF[m].forEach(s => { const l = lvl(byM[m]); if (l != null) out[s] = Math.max(out[s] ?? -1, l); });
  const dl = ['fd', 'sd', 'rd'].map(m => lvl(byM[m])).filter(x => x != null); if (dl.length) out.deltoids = Math.max(...dl);
  return { vals: out, days: byM }; }
const FRESH_COL = ['#e3e3e3', 'var(--verdant)', 'var(--sunset)', 'var(--signal)'];
function bodyMapHTML(mode, w) { const { vals } = slugValues(mode, w); const base = '#e3e3e3', skin = '#efefef';
  const MUSCLE_SLUGS = new Set(['calves', 'hamstring', 'biceps', 'abs', 'obliques', 'quadriceps', 'gluteal', 'chest', 'triceps', 'upperBack', 'trapezius', 'deltoids']);
  const side = key => { const s = BODY[key]; let g = ''; for (const slug in s.parts) { const isM = MUSCLE_SLUGS.has(slug); let fill = isM ? base : skin;
      if (isM && vals[slug] != null) fill = mode === 'vol' ? (vals[slug] > 0 ? mix(base, '#ff5406', .18 + .82 * vals[slug]) : base) : (vals[slug] >= 0 ? FRESH_COL[vals[slug]] : base);
      s.parts[slug].forEach(d => { g += '<path d="' + d + '" fill="' + fill + '" stroke="#ffffff" stroke-width="2"/>'; }); }
    return '<svg viewBox="' + s.vb + '" role="img" aria-label="Körperkarte ' + (key === 'front' ? 'vorne' : 'hinten') + '">' + g + '</svg>'; };
  const legend = mode === 'vol' ? '<div class="clegend"><span><i style="background:' + mix(base, '#ff5406', .25) + $t('"></i>wenig</span><span><i style="background:') + mix(base, '#ff5406', .6) + $t('"></i>mittel</span><span><i style="background:#ff5406"></i>Ziel erreicht</span></div>')
    : $t('<div class="clegend"><span><i style="background:var(--signal)"></i>0–1 Tage</span><span><i style="background:var(--sunset)"></i>2–3 Tage</span><span><i style="background:var(--verdant)"></i>4–7 Tage</span><span><i style="background:#e3e3e3"></i>länger oder nie</span></div>');
  return '<div class="bodymap">' + side('front') + side('back') + '</div>' + legend; }
function bodyCard(w) { const mode = ui.bodyMode || 'vol';
  return $t('<div class="card" id="bodycard"><div class="row"><h2 class="grow">Muskelkarte</h2></div><div class="seg"><button class="') + (mode === 'vol' ? 'on' : '') + $t('" data-act="bodyMode" data-v="vol" type="button">Volumen Woche ') + w + '</button><button class="' + (mode === 'fresh' ? 'on' : '') + $t('" data-act="bodyMode" data-v="fresh" type="button">Zuletzt trainiert</button></div>') + bodyMapHTML(mode, w) +
    $t('<p class="src" style="margin-top:8px">Körperkarte: MuscleMap von Melih Colpan (MIT)</p></div>'); }

/* ======================= FORTSCHRITTSFOTOS (IndexedDB, nur auf dem Gerät) ======================= */
const PHOTOS = { db: null,
  open() { if (this.db) return Promise.resolve(this.db); return new Promise((res, rej) => { const r = indexedDB.open('hb_photos', 1); r.onupgradeneeded = () => r.result.createObjectStore('p', { keyPath: 'id' }); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); }); },
  async tx(mode, fn) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('p', mode); const st = t.objectStore('p'); const out = fn(st); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); }); },
  put(rec) { return this.tx('readwrite', st => st.put(rec)); }, del(id) { return this.tx('readwrite', st => st.delete(id)); },
  async all() { const db = await this.open(); return new Promise((res, rej) => { const r = db.transaction('p').objectStore('p').getAll(); r.onsuccess = () => res(r.result.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.ts - b.ts)); r.onerror = () => rej(r.error); }); } };
const photoUrls = {};
function photoUrl(p) { return photoUrls[p.id] || (photoUrls[p.id] = URL.createObjectURL(p.blob)); }
async function compressImage(file, max) { const bmp = await createImageBitmap(file).catch(() => null); let w, h, src = bmp;
  if (!bmp) { const img = new Image(); img.src = URL.createObjectURL(file); await img.decode(); src = img; }
  w = src.width; h = src.height; const sc = Math.min(1, (max || 1280) / Math.max(w, h)); const c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(b => res(b), 'image/jpeg', .82)); }
async function photoCard() { let list = []; try { list = await PHOTOS.all(); } catch (e) { return $t('<div class="card"><h2>Fortschrittsfotos</h2><p class="small muted">Fotos lassen sich in diesem Browser nicht speichern.</p></div>'); }
  const view = ui.photoView || 'vorne'; const mine = list.filter(p => p.view === view);
  const seg = '<div class="seg">' + ['vorne', 'seitlich', 'hinten'].map(v => '<button class="' + (v === view ? 'on' : '') + '" data-act="photoView" data-v="' + v + '" type="button">' + $t(v[0].toUpperCase() + v.slice(1)) + '</button>').join('') + '</div>';
  let cmp = ''; if (mine.length >= 2) { const a = mine.find(p => p.id === ui.photoA) || mine[0], b = mine.find(p => p.id === ui.photoB) || mine[mine.length - 1];
    cmp = '<div class="ba" id="ba"><img src="' + photoUrl(a) + '" alt="Vorher ' + fmtDay(a.date) + '"><img class="ba-b" style="clip-path:inset(0 50% 0 0)" src="' + photoUrl(b) + '" alt="Nachher ' + fmtDay(b.date) + '"><span class="ba-l">' + fmtDay(a.date) + '</span><span class="ba-r">' + fmtDay(b.date) + $t('</span></div><input type="range" id="baRange" min="0" max="100" value="50" aria-label="Vorher-Nachher-Regler" style="width:100%;margin-top:8px;min-height:0;padding:0">') +
      $t('<p class="small muted">Links ') + fmtDay(b.date) + $t(', rechts ') + fmtDay(a.date) + $t('. Regler schieben zum Vergleichen. Tippe unten auf ein Foto, um es als Vorher (1. Tipp) oder Nachher (2. Tipp) zu wählen.</p>'); }
  const grid = mine.length ? '<div class="pgrid">' + mine.map(p => '<button class="pth' + (p.id === ui.photoA || p.id === ui.photoB ? $t(' sel') : '') + '" data-act="photoPick" data-id="' + p.id + '" type="button"><img src="' + photoUrl(p) + '" alt=""><span>' + fmtDay(p.date) + '</span></button>').join('') + '</div>' : $t('<p class="small muted">Noch keine Fotos. Immer gleiches Licht, gleiche Pose, morgens nüchtern: so sind sie vergleichbar.</p>');
  return $t('<div class="card" id="photocard"><div class="row"><h2 class="grow">Fortschrittsfotos</h2><button class="btn brand sm" data-act="photoAdd" type="button">+ Foto</button></div>') + seg + cmp + grid +
    (mine.length ? $t('<div class="row" style="margin-top:10px"><button class="btn sm danger" data-act="photoDel" type="button">Ausgewähltes Nachher-Foto löschen</button></div>') : '') + $t('<p class="src" style="margin-top:8px">Fotos bleiben nur auf diesem Gerät und sind nicht in der Sicherung enthalten.</p></div>'); }
async function refreshPhotoCard() { const el = $('#photocard'); if (el) el.outerHTML = await photoCard(); }

/* ======================= ERINNERUNGEN (Android) ======================= */
const NOTIF = { get p() { const C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.LocalNotifications; } };
async function notifSetup() { const N = NOTIF.p; if (!N) return; try { const st = await N.requestPermissions(); if (st.display !== 'granted') { toast($t('Benachrichtigungen nicht erlaubt.')); return; }
    try { const ex = await N.checkExactNotificationSetting(); if (ex.exact_alarm !== 'granted') await N.changeExactNotificationSetting(); } catch (e) {}
    S.settings.notif = true; save(); await rescheduleReminders(); toast($t('Erinnerungen aktiv')); render(); } catch (e) { toast($t('Einrichten fehlgeschlagen: ') + (e.message || e)); } }
async function restNotify(sec, label) { const N = NOTIF.p; if (!N || !S.settings.notif) return; try { await N.cancel({ notifications: [{ id: 9001 }] }); await N.schedule({ notifications: [{ id: 9001, title: $t('Pause vorbei'), body: label || $t('Weiter geht’s'), schedule: { at: new Date(Date.now() + sec * 1000), allowWhileIdle: true } }] }); } catch (e) {} }
async function restCancel() { const N = NOTIF.p; if (!N) return; try { await N.cancel({ notifications: [{ id: 9001 }] }); } catch (e) {} }
async function rescheduleReminders() { const N = NOTIF.p; if (!N || !S.settings.notif) return; const st = S.settings;
  try { const pend = await N.getPending(); const ids = (pend.notifications || []).map(n => ({ id: n.id })).filter(n => n.id >= 100 && n.id < 200); if (ids.length) await N.cancel({ notifications: ids }); } catch (e) {}
  const list = []; const hm2 = v => { const m = String(v || '').match(/^(\d{1,2}):(\d{2})$/); return m ? { hour: +m[1], minute: +m[2] } : null; };
  const wt = hm2(st.remWeigh); if (wt) list.push({ id: 100, title: $t('Wiegen'), body: $t('Morgens nüchtern wiegen und in Hybridblock eintragen.'), schedule: { on: wt, allowWhileIdle: true } });
  const tt = hm2(st.remTrain); if (tt) ORDER.forEach((k, i) => { const d = st.dayMap[k]; if (d === '' || d == null) return; list.push({ id: 110 + i, title: SESS[k].title + $t(' heute'), body: SESS[k].sub, schedule: { on: { weekday: (+d) + 1, hour: tt.hour, minute: tt.minute }, allowWhileIdle: true } }); });
  const mt = hm2(st.remMeal); if (mt) list.push({ id: 120, title: $t('Essen eintragen'), body: $t('Noch nicht alles geloggt? Kurz nachtragen.'), schedule: { on: mt, allowWhileIdle: true } });
  if (list.length) { try { await N.schedule({ notifications: list }); } catch (e) { toast($t('Erinnerungen konnten nicht geplant werden.')); } } }

/* ======================= TRAININGSKALENDER ======================= */
function heatmapCard() { const weeks = 18; const end = today(); const endD = parseISO(end); const startMon = addDays(end, -((endD.getDay() + 6) % 7) - (weeks - 1) * 7);
  let max = 1; const cells = []; for (let i = 0; i < weeks * 7; i++) { const d = addDays(startMon, i); if (d > end) { cells.push(null); continue; } const L = dailyLoad(d); const v = L.load || (L.n ? 1 : 0); max = Math.max(max, v); cells.push({ d, v, n: L.n }); }
  let g = ''; const cs = 16, gap = 3; cells.forEach((c, i) => { const x = Math.floor(i / 7) * (cs + gap), y = (i % 7) * (cs + gap); if (!c) return; const fill = c.n ? mix('#e9e9e9', '#ff5406', .25 + .75 * Math.min(1, c.v / max)) : '#ececec'; g += '<rect x="' + x + '" y="' + y + '" width="' + cs + '" height="' + cs + '" rx="4" fill="' + fill + '"><title>' + fmtDay(c.d) + (c.n ? ': ' + c.n + $t(' Einheit(en)') + (c.v > 1 ? $t(', Belastung ') + fmt(c.v, 0) : '') : $t(': frei')) + '</title></rect>'; });
  const W = weeks * (cs + gap), H = 7 * (cs + gap); const n = cells.filter(c => c && c.n).length;
  return $t('<div class="card"><div class="row"><h2 class="grow">Trainingstage</h2><span class="tag">') + n + $t(' in ') + weeks + $t(' Wochen</span></div><div style="overflow-x:auto;margin-top:8px"><svg viewBox="0 0 ') + W + ' ' + H + $t('" style="width:100%;min-width:300px;display:block" role="img" aria-label="Kalender der Trainingstage">') + g + $t('</svg></div><div class="clegend"><span>Zeilen: Mo bis So · dunkler = höhere Belastung</span></div></div>'); }

/* ======================= STILLSTAND ======================= */
function stallInfo(exId, w) { if (phase(w) === 'dl' || phase(w) === 'test') return null; const h = exHistory(exId).filter(o => o.e1); if (h.length < 4) return null;
  const last3 = h.slice(-3), before = h[h.length - 4]; const best3 = Math.max(...last3.map(o => o.e1)); if (best3 <= before.e1 * 1.01) return { e1: before.e1, n: 3 }; return null; }

/* ======================= ERNÄHRUNG: Rezepte, Schnell-Eintrag, Wasser, Mikros ======================= */
function microTotals(d) { const o = S.days[d]; const t = { fib: 0, sug: 0, salt: 0, cov: 0, n: 0 }; if (!o || !o.entries) return t;
  o.entries.forEach(e => { t.n++; if (e.fib != null || e.sug != null || e.salt != null) { t.cov++; t.fib += e.fib || 0; t.sug += e.sug || 0; t.salt += e.salt || 0; } }); return t; }
function microRow(d) { const m = microTotals(d); if (!m.n) return ''; const bar = (v, goal, good) => { const p = Math.min(100, v / goal * 100); return '<div class="meter" style="background:var(--paper)"><i style="width:' + p + '%;background:' + (good ? $t('var(--verdant)') : v > goal ? $t('var(--signal)') : $t('var(--sunset)')) + '"></i></div>'; };
  return $t('<div class="micro"><div><div class="k">Ballaststoffe</div><b class="num">') + fmt(m.fib, 0) + '</b> / 30 g' + bar(m.fib, 30, true) + $t('</div><div><div class="k">Zucker</div><b class="num">') + fmt(m.sug, 0) + '</b> g' + bar(m.sug, 50, false) + $t('</div><div><div class="k">Salz</div><b class="num">') + fmt(m.salt, 1) + '</b> / 6 g' + bar(m.salt, 6, false) + '</div></div>' +
    (m.cov < m.n ? '<p class="src" style="margin-top:6px">' + (m.n - m.cov) + $t(' von ') + m.n + $t(' Einträgen ohne diese Angaben.</p>') : ''); }
function waterCard(d) { const o = S.days[d] || {}; const ml = num(o.water) || 0, goal = num(S.settings.waterGoal) || 3000; const p = Math.min(100, ml / goal * 100);
  return $t('<div class="card"><div class="row"><h2 class="grow">Wasser</h2><span class="num" style="font-weight:800">') + fmt(ml / 1000, 2) + ' / ' + fmt(goal / 1000, 1) + ' l</span></div><div class="meter" style="background:var(--paper);height:10px"><i style="width:' + p + '%;background:var(--sky)"></i></div>' +
    $t('<div class="row" style="margin-top:12px"><button class="btn sm" data-act="water" data-v="250" type="button">+ 250 ml</button><button class="btn sm" data-act="water" data-v="500" type="button">+ 500 ml</button><button class="btn sm" data-act="water" data-v="-250" type="button" aria-label="250 ml abziehen">− 250</button></div></div>'); }
function quickForm() { return $t('<p class="muted" style="margin-top:4px">Für Restaurant, Kantine oder wenn du die Werte schon kennst.</p><div class="fields on-white" style="margin-top:12px"><div class="field" style="flex:1 1 100%"><label for="qa-name">Bezeichnung</label><input id="qa-name" type="text" placeholder="z. B. Döner"></div>') +
  [['kcal', 'kcal'], ['p', $t('Protein (g)')], ['c', $t('Kohlenhydrate (g)')], ['f', $t('Fett (g)')]].map(([k, l]) => '<div class="field"><label for="qa-' + k + '">' + l + '</label><input id="qa-' + k + '" type="number" inputmode="decimal" step="any"></div>').join('') + $t('</div><div class="row" style="margin-top:16px"><div class="grow"></div><button class="btn brand" data-act="quickAdd" type="button">Eintragen</button></div>'); }
/* Rezept-Baukasten */
function recipeTotals(r) { const t = { kcal: 0, p: 0, f: 0, c: 0, fib: 0, sug: 0, salt: 0, g: 0 }; (r.items || []).forEach(it => { const f = getFood(it.food); if (!f) return; const m = macrosFor(f, it.qty, it.unit); for (const k in m) t[k] += m[k] || 0;
    t.g += it.unit === 'g' ? it.qty : it.qty * (f.pieceG || 0); }); return t; }
function recipeSheet() { const r = ui.recipe; const t = recipeTotals(r); const por = num(r.portions) || 1;
  const items = (r.items || []).map((it, i) => { const f = getFood(it.food); const m = f ? macrosFor(f, it.qty, it.unit) : { kcal: 0, p: 0 }; return '<div class="it" style="cursor:default"><div class="grow"><b>' + esc(f ? foodName(f) : '?') + '</b><small>' + fmt(it.qty) + ' ' + $t(it.unit) + ' · ' + fmt(m.kcal, 0) + $t(' kcal · ') + fmt(m.p, 0) + ' g P</small></div><button class="btn sm" data-act="recDelItem" data-i="' + i + $t('" type="button">Entfernen</button></div>'); }).join('');
  openSheet(sheetHead(r.id && S.foods[r.id] ? $t('Rezept bearbeiten') : $t('Neues Rezept')) + $t('<div class="fields on-white" style="margin-top:12px"><div class="field" style="flex:1 1 100%"><label for="rc-name">Name</label><input id="rc-name" type="text" value="') + esc(r.name) + $t('" placeholder="z. B. Hähnchen-Köfte"></div>') +
    $t('<div class="field"><label for="rc-por">Ergibt Portionen/Stück</label><input id="rc-por" type="number" inputmode="numeric" value="') + esc(r.portions) + '" placeholder="z. B. 36"></div></div>' +
    $t('<h3 style="margin:16px 0 4px">Zutaten</h3><div class="plist">') + (items || $t('<p class="small muted">Noch keine Zutaten.</p>')) + '</div>' +
    $t('<div class="row on-white" style="margin-top:10px"><input id="rc-q" type="search" placeholder="Zutat suchen (deine + Open Food Facts)" class="grow"><button class="btn" data-act="recSearch" type="button">Suchen</button><button class="btn" data-act="recScan" type="button" aria-label="Zutat scannen">') + ICON.scan + '</button></div><div id="rc-res" class="plist"></div>' +
    $t('<div class="card" style="margin-top:14px;padding:14px 18px"><b>Gesamt:</b> ') + fmt(t.kcal, 0) + $t(' kcal · ') + fmt(t.p, 0) + $t(' g P<br><b>Pro Portion (') + por + '):</b> ' + fmt(t.kcal / por, 0) + $t(' kcal · ') + fmt(t.p / por, 1) + ' g P · ' + fmt(t.c / por, 1) + $t(' g KH · ') + fmt(t.f / por, 1) + ' g F' + (t.g ? $t('<br><span class="small muted">Portion ≈ ') + fmt(t.g / por, 0) + $t(' g roh</span>') : '') + '</div>' +
    '<div class="row" style="margin-top:14px">' + (r.id && S.foods[r.id] ? $t('<button class="btn danger" style="background:var(--fog)" data-act="recDel" type="button">Löschen</button>') : '') + $t('<div class="grow"></div><button class="btn brand" data-act="recSave" type="button">Rezept speichern</button></div>')); }
async function recSearch(q) { const box = $('#rc-res'); if (!box || !q) return; const ql = q.toLowerCase(); const mine = [...PRESET_FOODS.map(f => getFood(f.id)), ...Object.values(S.foods).filter(f => f.src !== 'quick' && f.src !== 'recipe')].filter(f => f && foodName(f).toLowerCase().includes(ql));
  const row = f => '<div class="it" data-act="recPick" data-id="' + esc(f.id) + '"><div class="grow"><b>' + esc(foodName(f)) + '</b><small>' + (f.needsFetch ? $t('Nährwerte werden beim Antippen geladen') : fmt(f.kcal, 0) + $t(' kcal pro ') + (f.base === '100g' ? $t('100 g') : $t('Stück'))) + '</small></div><span class="chev">›</span></div>';
  box.innerHTML = mine.map(row).join('') + $t('<p class="small muted">Suche in Open Food Facts …</p>');
  try { const enc = encodeURIComponent(q), F = 'code,product_name,product_name_de,product_name_en,product_name_ru,brands,nutriments,serving_quantity'; let list = [];
    for (const u of ['https://search.openfoodfacts.org/search?q=' + enc + '&langs=' + OFF_LANGS + '&page_size=20&fields=' + F, 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + enc + '&search_simple=1&action=process&json=1&page_size=20&fields=' + F]) { try { const j = await fetchJson(u, 9000); list = ((j.hits || j.products) || []).map(p => offMap(p, false)).filter(Boolean); if (list.length) break; } catch (e) {} }
    list.forEach(f => offCache[f.id] = f); if ($('#rc-res')) $('#rc-res').innerHTML = mine.map(row).join('') + list.map(row).join('') + (list.length || mine.length ? '' : $t('<p class="small muted">Nichts gefunden.</p>')); } catch (e) {} }
function recipeQty(id) { const f = getFood(id); const units = unitsFor(f); const box = $('#rc-res'); if (!box) return;
  box.innerHTML = '<div class="card" style="padding:14px 18px"><b>' + esc(foodName(f)) + $t('</b><div class="fields on-white" style="margin-top:10px"><div class="field"><label for="rq-q">Menge</label><input id="rq-q" type="number" inputmode="decimal" step="any" value="') + (units[0] === 'g' ? 100 : 1) + $t('"></div><div class="field"><label for="rq-u">Einheit</label><select id="rq-u">') + units.map(u => '<option value="' + u + '">' + $t(u) + '</option>').join('') + '</select></div></div><div class="row" style="margin-top:10px"><div class="grow"></div><button class="btn brand sm" data-act="recAddItem" data-id="' + esc(id) + $t('" type="button">Hinzufügen</button></div></div>'); }
function saveRecipe() { const r = ui.recipe; r.name = ($('#rc-name').value || '').trim() || $t('Rezept'); r.portions = num($('#rc-por').value) || 1; const t = recipeTotals(r); const por = r.portions; const id = r.id || ('rc_' + uid());
  S.foods[id] = { id, name: r.name, base: 'piece', kcal: t.kcal / por, p: t.p / por, f: t.f / por, c: t.c / por, fib: t.fib / por, sug: t.sug / por, salt: t.salt / por, pieceG: t.g ? Math.round(t.g / por) : null, src: 'recipe', items: r.items, portions: por }; save(); return id; }
function recipesTab() { const rs = Object.values(S.foods).filter(f => f.src === 'recipe');
  return $t('<button class="btn block brand" data-act="recNew" type="button" style="margin-bottom:8px">+ Neues Rezept</button>') + (rs.length ? '<div class="plist">' + rs.map(f => '<div class="it"><div class="grow" data-act="pick" data-id="' + f.id + '"><b>' + esc(foodName(f)) + '</b><small>' + fmt(f.kcal, 0) + $t(' kcal · ') + fmt(f.p, 1) + $t(' g P pro Portion · ') + (f.items || []).length + $t(' Zutaten</small></div><button class="btn sm" data-act="recEdit" data-id="') + f.id + $t('" type="button">Bearbeiten</button></div>')).join('') + '</div>' : $t('<p class="small muted">Bau deine Meal-Prep-Rezepte aus echten Produkten nach. Dann stimmen die Werte genauer als die Schätzungen.</p>')); }
function goalEta() { const ser = series(); const rate = weeklyRate(ser); if (!ser.length || rate == null || rate >= -0.05) return null; const cur = ser[ser.length - 1].trend, tgt = num(S.settings.targetWeight); if (cur <= tgt) return { done: true };
  const weeks = (cur - tgt) / -rate; return { weeks, date: addDays(today(), Math.round(weeks * 7)) }; }

/* ======================= UPDATES ======================= */
const REPO = 'Orzu95/hybridblock', PAGES = 'https://orzu95.github.io/hybridblock/', APK_URL = 'https://github.com/' + REPO + '/releases/latest/download/Hybridblock.apk';
const BUILD = { local: null, remote: null, checked: 0 };
async function checkUpdate(force) { if (!force && Date.now() - BUILD.checked < 60 * 60 * 1000) return; BUILD.checked = Date.now();
  try { BUILD.local = (await fetchJson('build.json?t=' + Date.now(), 4000)).build; } catch (e) {}
  if (!HEALTH.native) return;
  try { const r = await fetchJson(PAGES + 'build.json?t=' + Date.now(), 7000); const had = updateAvailable(); BUILD.remote = r.build; if (updateAvailable() !== had) render(); } catch (e) {} }
const updateAvailable = () => HEALTH.native && BUILD.remote != null && BUILD.local != null && BUILD.remote > BUILD.local;
const updateNote = () => updateAvailable() ? note('ember', $t('<b>Update verfügbar</b> (Build ') + BUILD.remote + $t('). Herunterladen und über die alte Version installieren. Deine Daten bleiben erhalten.'), '<a class="btn brand sm" href="' + APK_URL + $t('">Laden</a>')) : '';

/* ======================= INIT (aufgerufen am Ende von cloud.js) ======================= */
function boot() {
parseHash(); render(true); setTimeout(autoSync, 800); setTimeout(autoPull, 400);
setTimeout(() => { if (!REPDB_CACHE && navigator.onLine !== false) loadRepdb().then(() => { if (route.name === 'training' || route.name === 'frei') render(); }).catch(() => {}); }, 2500);
setTimeout(rescheduleReminders, 3000); setTimeout(() => checkUpdate(true), 1500);
if ('serviceWorker' in navigator && location.protocol === 'https:' && !HEALTH.native && !(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())) navigator.serviceWorker.register('sw.js').catch(() => {}); }
