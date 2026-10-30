/* ======================= WOCHENPLANUNG: die Woche rechnet nach jeder Einheit neu ======================= */
/* Grundlage ist das Wochenmuster (feste Tage oder Reihenfolge). Die Woche beginnt mit der ersten Einheit.
   Offene Einheiten werden nach jeder Änderung neu auf die nächsten Tage gelegt. Harte Regeln, sobald etwas vom Muster abweicht:
   keine zwei Einheiten an einem Tag (Doppel-Tage werden nach einer Verschiebung getrennt), kein HIIT am Tag vor Beinen,
   keine Beintage hintereinander, nach zwei harten Tagen kein dritter.
   Wird die Woche zu knapp, entscheidet der Nutzer: kompakt abschließen (Hauptübungen und Schwerpunkt bleiben, Zubehör wird gekürzt)
   oder einfach weiterlaufen lassen (die Woche wird länger).
   Dazu: Ruhetage als „Pause“ mit Begründung, Einheit überspringen oder früher beenden mit Grund, einzelne Übung auslassen,
   Volumen-Ausgleich nur für Schwerpunkt-Muskeln und Muskeln unter dem Minimum, immer mit Bestätigung. */
const WK = w => { S.wk = S.wk || {}; return S.wk[w] || (S.wk[w] = {}); };
const wkPeek = w => (S.wk || {})[w] || {};
const dIdx = d => (parseISO(d).getDay() + 6) % 7;
const wkOpen = o => o.st === 'open' || o.st === 'part';
const wkLeg = (w, k) => isGym(k) && legDay(k, w);
const wkHard = (w, k) => { if (isHiit(k)) return true; const L = sessLoad(w, k); if (L && L.rpe != null) return L.rpe >= 7; return wkLeg(w, k); };
function sessDate(w, k) { const s = peekSess(w, k); if (s && s.date) return s.date; const a = countsAsActivity(w, k); return a ? a.date : null; }

/* Wochenmuster: Abstand jeder Einheit zum ersten Trainingstag (Mo = 0) */
function wkPattern() { const rot = S.settings.mode === 'rotation', dm = S.settings.dayMap, n = ORDER.length; let mi = ORDER.map(k => rot || dm[k] === '' || dm[k] == null ? null : (+dm[k] + 6) % 7);
  if (mi.every(v => v == null)) { const sp = SPREAD[Math.min(7, Math.max(1, n))] || [1]; mi = ORDER.map((k, i) => (sp[Math.min(i, sp.length - 1)] + 6) % 7); }
  else { for (let i = 0; i < n; i++) { if (mi[i] != null) continue; const used = new Set(mi.filter(x => x != null)); const prev = Math.max(-1, ...mi.slice(0, i).filter(x => x != null)); let d = prev + 1; while (d < 6 && used.has(d)) d++; mi[i] = Math.min(6, d); } }
  const seq = ORDER.map((k, i) => ({ k, i, m: mi[i] })).sort((a, b) => a.m - b.m || a.i - b.i); const first = seq.length ? seq[0].m : 0;
  const off = {}; seq.forEach(o => off[o.k] = o.m - first); return { seq: seq.map(o => o.k), off, first, rot }; }
/* Wochenanfang: erste Einheit dieser Woche; sonst der letzte Muster-Starttag, frühestens der Tag nach der Vorwoche */
function wkAnchor(w, P) { for (const k of P.seq) { const d = sessDate(w, k); if (d) return addDays(d, -P.off[k]); }
  if (w === 1 && !S.block.startedOn) return today();
  const pl = w > 1 ? lastDate(w - 1) : null, base = pl ? addDays(pl, 1) : today(); if (P.rot) return base > today() ? base : today();
  let lw = today(); for (let i = 0; i < 7 && dIdx(lw) !== P.first; i++) lw = addDays(lw, -1); return lw >= base ? lw : base; }
function wkOk(ev, d, it) { const at = x => ev[x] || [];
  if (at(d).some(o => o.k)) return false;
  const y = addDays(d, -1), y2 = addDays(d, -2), tm = addDays(d, 1);
  if (it.hiit && at(tm).some(o => o.leg)) return false;
  if (it.leg && (at(y).some(o => o.leg || o.hiit) || at(tm).some(o => o.leg))) return false;
  if ((it.hiit || it.leg) && at(y).some(o => o.hard) && at(y2).some(o => o.hard)) return false;
  return true; }
/* Die Woche als Kalender: jede Einheit mit Datum, Status, ob verschoben; dazu freie Aktivitäten und optionale Z2-Tage */
function wkPlan(w) { const P = wkPattern(), A = wkAnchor(w, P), t = today(), W = wkPeek(w); const ev = {}, items = [];
  const put = (d, o) => (ev[d] = ev[d] || []).push(o);
  if (w > 1) ORDER.forEach(k => { const d = sessDate(w - 1, k); if (d && d >= addDays(A, -3) && d < A) put(d, { prev: true, leg: wkLeg(w - 1, k), hiit: isHiit(k), hard: wkHard(w - 1, k) }); });
  S.activities.filter(a => a.date >= addDays(A, -3) && a.date <= addDays(A, 21) && !a.countsAs).forEach(a => put(a.date, { act: a, hard: num(a.rpe) >= 7 }));
  let prev = null, prevOff = 0, track = true;
  P.seq.forEach(k => { const s = peekSess(w, k), pr = sessProgress(w, k), ideal = addDays(A, P.off[k]);
    const it = { k, ideal, off: P.off[k], leg: wkLeg(w, k), hiit: isHiit(k), cardio: isCardio(k) }; const d = sessDate(w, k);
    if (s && s.merged) { it.st = 'merged'; it.host = s.merged; items.push(it); track = false; return; }
    if (pr.skipped) { it.st = 'skipped'; it.why = s && s.skipWhy; it.date = d; items.push(it); track = false; return; }
    if (d && !pr.done && d < t) { it.partFrom = d; }
    else if (d) { it.date = d; it.st = pr.done ? 'done' : 'today'; it.hard = wkHard(w, k); it.moved = d !== ideal; put(d, it); items.push(it); if (d !== ideal) track = false; prev = d; prevOff = it.off; return; }
    if (pr.done) { it.st = 'done'; items.push(it); return; }
    it.st = it.partFrom ? 'part' : 'open'; let cand = ideal < t ? t : ideal; if (prev) { const g = addDays(prev, it.off - prevOff); if (g > cand) cand = g; }
    if (s && s.post && cand <= s.post) cand = addDays(s.post, 1);
    const pin = s && s.pin; if (pin) cand = pin < t ? t : pin;
    if (cand !== ideal) track = false; let dd = cand;
    if (!track && !pin) for (let i = 0; i < 10; i++) { const x = addDays(cand, i); if (wkOk(ev, x, it)) { dd = x; break; } }
    it.date = dd; it.moved = dd !== ideal; it.hard = it.hiit || it.leg; put(dd, it); items.push(it); prev = dd; prevOff = it.off; });
  (W.z2 || []).forEach(d => put(d, { z2opt: true }));
  const end = addDays(A, 6); const dates = items.filter(o => o.date).map(o => o.date); const last = dates.length ? dates.reduce((a, b) => a > b ? a : b) : end;
  const over = items.some(o => (o.st === 'open' || o.st === 'part') && o.date > end);
  return { P, A, end, last: last > end ? last : end, ev, items, over }; }

/* ---------- Entscheidung, wenn die Woche zu knapp wird ---------- */
function wkCompact(w, pl) { const t = today(); const free = [];
  for (let d = t; d <= pl.end; d = addDays(d, 1)) if (!(pl.ev[d] || []).some(o => o.k && !wkOpen(o))) free.push(d);
  const open = pl.items.filter(wkOpen); const G = open.filter(o => !o.cardio), C = open.filter(o => o.cardio);
  if (!free.length || !G.length) return null;
  const hosts = G.slice(0, free.length), merged = G.slice(free.length); const days = [];
  /* Gastgeber gleichmäßig auf die freien Tage verteilen */
  const slots = hosts.map((h, i) => free[Math.min(free.length - 1, Math.round(i * (free.length - 1) / Math.max(1, hosts.length - 1)))]);
  if (hosts.length === 1) slots[0] = free[0];
  hosts.forEach((h, i) => days.push({ d: slots[i], host: h.k, adds: [], cuts: [], cardio: [] }));
  const setsOf = x => x.own.reduce((a, p) => a + p.sets, 0) + x.adds.reduce((a, p) => a + p.sets, 0);
  days.forEach(x => { x.own = planFor(w, x.host).filter(p => !p.om); });
  merged.forEach(m => planFor(w, m.k).filter(p => !p.om && (p.type === 'main' || isPrio(actualEx(w, m.k, p)))).forEach(p => { const ex = actualEx(w, m.k, p);
    const cand = days.filter(x => !x.own.some(q => actualEx(w, x.host, q) === ex) && !x.adds.some(q => q.ex === ex)).sort((a, b) => setsOf(a) - setsOf(b))[0]; if (!cand) return;
    cand.adds.push({ slot: 'mx_' + m.k + '_' + p.slot, ex, sets: p.sets, reps: p.reps, rpe: p.rpe, rest: p.rest, type: p.type === 'main' ? 'main' : 'dp', note: '', from: m.k }); }));
  /* Zubehör kürzen, bis die Einheit in einen normalen Rahmen passt (etwa 24 Sätze) */
  days.forEach(x => { const acc = x.own.filter(p => p.type !== 'main' && !isPrio(actualEx(w, x.host, p))).reverse(); while (x.adds.length && setsOf(x) > 24 && acc.length) { const p = acc.shift(); x.cuts.push(p.slot); x.own = x.own.filter(q => q !== p); } });
  /* Ausdauer auf freie Resttage, sonst Z2 kurz nach einer Krafteinheit, HIIT entfällt */
  const rest = free.filter(d => !slots.includes(d)); const dropped = []; const legOn = d => days.some(x => x.d === d && wkLeg(w, x.host));
  C.forEach(c => { if (isHiit(c.k)) { const d = rest.find(d => !legOn(addDays(d, 1))); if (d) { rest.splice(rest.indexOf(d), 1); days.push({ d, cardioOnly: c.k }); } else dropped.push(c.k); return; }
    if (rest.length) { days.push({ d: rest.shift(), cardioOnly: c.k }); return; } const x = days.filter(y => y.host).slice(-1)[0]; if (x) x.cardio.push(c.k); else dropped.push(c.k); });
  days.sort((a, b) => a.d < b.d ? -1 : 1); return { days, merged: merged.map(m => m.k), dropped, free }; }
function wkApplyCompact(w) { const pl = wkPlan(w), c = wkCompact(w, pl); if (!c) return;
  c.days.forEach(x => { if (x.cardioOnly) { sess(w, x.cardioOnly).pin = x.d; return; } const s = sess(w, x.host); s.pin = x.d; s.extra = (s.extra || []).filter(e => !/^mx_/.test(e.slot)).concat(x.adds); s.cut = x.cuts; x.cardio.forEach(k => { sess(w, k).pin = x.d; }); });
  c.merged.forEach(k => { const s = sess(w, k); s.skipped = true; s.merged = c.days.find(x => x.adds && x.adds.some(a => a.from === k)) ? c.days.find(x => x.adds && x.adds.some(a => a.from === k)).host : null; s.skipWhy = 'merged'; });
  c.dropped.forEach(k => { const s = sess(w, k); s.skipped = true; s.skipWhy = 'compact'; });
  WK(w).mode = 'compact'; save(); }
function wkUndoCompact(w) { ORDER.forEach(k => { const s = peekSess(w, k); if (!s) return; delete s.pin; delete s.cut; if (s.extra) s.extra = s.extra.filter(e => !/^mx_/.test(e.slot)); if (s.skipWhy === 'merged' || s.skipWhy === 'compact') { s.skipped = false; delete s.merged; delete s.skipWhy; } }); delete WK(w).mode; save(); }
const wkDay = d => d === today() ? $t('heute') : d === addDays(today(), 1) ? $t('morgen') : fmtDay(d);
function wkDecisionCard(w) { if (w !== curWeek() || S.settings.mode === 'rotation') return ''; const W = wkPeek(w); const pl = wkPlan(w);
  if (W.mode === 'compact') return note('sky', '<b>' + $t('Woche kompakt geplant.') + '</b> ' + $t('Hauptübungen und Schwerpunkt bleiben, Zubehör ist gekürzt.'), '<button class="btn sm" data-act="wkUndo" type="button">' + $t('Rückgängig') + '</button>');
  if (!pl.over || W.mode) return ''; const open = pl.items.filter(wkOpen); const c = wkCompact(w, pl);
  const nDays = c ? c.free.length : 0; let prev = '';
  if (c) prev = '<ul class="wkprev">' + c.days.map(x => '<li><b>' + esc(wkDay(x.d)) + '</b> ' + (x.cardioOnly ? esc(SESS[x.cardioOnly].title) : esc(SESS[x.host].title) + (x.adds.length ? ' + ' + esc([...new Set(x.adds.map(a => SESS[a.from].title))].join(', ')) + ': ' + esc(x.adds.map(a => LIB[a.ex].name).join(', ')) : '') + (x.cardio.length ? ' · ' + $t('danach kurz ') + esc(x.cardio.map(k => SESS[k].title).join(', ')) : '') + (x.cuts.length ? ' · <span class="muted">' + $t('ohne ') + esc(x.cuts.map(sl => { const p = planFor(w, x.host).find(q => q.slot === sl); return p ? LIB[actualEx(w, x.host, p)].name : sl; }).join(', ')) + '</span>' : '')) + '</li>').join('') + (c.dropped.length ? '<li class="muted">' + $t('Entfällt: ') + esc(c.dropped.map(k => SESS[k].title).join(', ')) + '</li>' : '') + '</ul>';
  const lastD = open.reduce((a, o) => o.date > a ? o.date : a, pl.end);
  return '<div class="card wkdec"><h2>' + $t('Die Woche wird knapp') + '</h2><p class="small">' + $tf('Noch {n} Einheiten, aber bis zum Wochenende ({d}) bleiben {m} Tage.', { n: open.length, d: fmtDay(pl.end), m: nDays }) + '</p>' +
    (c ? '<div class="wkopt"><p class="wkoh">' + $t('Kompakt abschließen') + '</p><p class="small muted" style="margin:2px 0 6px">' + $t('Hauptübungen und Schwerpunkt-Übungen bleiben, gekürzt wird nur beim Zubehör.') + '</p>' + prev + '<button class="btn brand sm" data-act="wkCompact" type="button">' + $t('So machen') + '</button></div>' : '') +
    '<div class="wkopt"><p class="wkoh">' + $t('Einfach weitermachen') + '</p><p class="small muted" style="margin:2px 0 6px">' + $tf('Alle Einheiten wie geplant, die Woche dauert bis {d}. Die nächste beginnt danach.', { d: fmtDay(lastD) }) + '</p><button class="btn sm fog" data-act="wkFlow" type="button">' + $t('Weiterlaufen lassen') + '</button></div></div>'; }

/* ---------- Wochenübersicht mit Tagen, Pausen und freien Aktivitäten ---------- */
const WK_WHY = () => ({ sick: $t('krank'), time: $t('keine Zeit'), tired: $t('müde'), pain: $t('Schmerzen'), other: $t('übersprungen'), merged: $t('in andere Einheit integriert'), compact: $t('entfällt diese Woche') });
function wkUnitRow(w, o) { const k = o.k, s = SESS[k]; const pr = sessProgress(w, k);
  const st = o.st === 'done' ? '<span class="tag"><span class="dot green"></span>' + $t('erledigt') + '</span>' : o.st === 'skipped' || o.st === 'merged' ? '<span class="tag"><span class="dot mist"></span>' + esc(o.st === 'merged' && o.host ? $t('in ') + SESS[o.host].title : WK_WHY()[o.why] || $t('übersprungen')) + '</span>' : pr.f ? '<span class="tag"><span class="dot amber"></span>' + pr.f + '/' + pr.t + '</span>' : '<span class="tag"><span class="dot mist"></span>' + $t('offen') + '</span>';
  const sub = [sessSub(w, k)]; if (o.st === 'part') sub.push($t('angefangen am ') + WD[parseISO(o.partFrom).getDay()]); else if (o.moved && o.st === 'open') sub.push($t('verschoben von ') + WD[parseISO(o.ideal).getDay()]); const ps = peekSess(w, k);
  if (ps && ps.extra && ps.extra.some(e => /^mx_/.test(e.slot))) sub.push($t('plus Hauptübungen aus ') + [...new Set(ps.extra.filter(e => /^mx_/.test(e.slot)).map(e => SESS[e.from] ? SESS[e.from].title : ''))].join(', '));
  if (ps && (ps.short || ps.lite)) sub.push(ps.short ? $t('Kurzversion') : $t('leichter'));
  return '<a class="wku" href="#training/' + sKey(w, k) + '">' + badge(k) + '<span class="grow"><b>' + esc(s.title) + '</b><small>' + esc(sub.filter(Boolean).join(' · ')) + '</small></span>' + st + '</a>'; }
function wkOverview(w) { const pl = wkPlan(w), t = today(); let rows = '';
  const skipped = pl.items.filter(o => o.st === 'skipped' || o.st === 'merged' || (o.st === 'done' && !o.date));
  for (let d = pl.A; d <= pl.last; d = addDays(d, 1)) { const evs = pl.ev[d] || []; const units = evs.filter(o => o.k), acts = evs.filter(o => o.act), z2 = evs.some(o => o.z2opt);
    const body = units.map(o => wkUnitRow(w, o)).join('') + acts.map(o => { const a = o.act, at = ACT_MAP[a.type] || { short: '', name: a.type }; return '<a class="wku" href="#frei/' + a.id + '"><span class="badge act sm">' + esc(at.short) + '</span><span class="grow"><b>' + esc(a.title || at.name) + '</b><small>' + (num(a.dur) ? fmt(num(a.dur), 0) + $t(' min') : '') + (num(a.rpe) ? ' · RPE ' + fmt(num(a.rpe)) : '') + ' · ' + $t('freie Aktivität') + '</small></span></a>'; }).join('') +
      (z2 ? '<div class="wku"><span class="badge z2 sm">Z2</span><span class="grow"><b>' + $t('Z2 locker (optional)') + '</b><small>' + $t('30–40 min, du kannst dich unterhalten') + '</small></span><button class="btn sm fog" data-act="wkZ2Rm" data-d="' + d + '" type="button">✕</button></div>' : '');
    const pause = !units.length && !acts.length;
    rows += '<div class="wkd' + (d === t ? ' tod' : '') + (d < t ? ' past' : '') + '"><div class="wkdl"><b>' + WD[parseISO(d).getDay()] + '</b><span>' + parseISO(d).getDate() + '.' + (parseISO(d).getMonth() + 1) + '.</span></div><div class="grow">' +
      (pause ? '<button class="wkpause" data-act="wkPause" data-w="' + w + '" data-d="' + d + '" type="button"><b>' + $t('Pause') + '</b>' + (z2 ? '' : '<span class="small muted">' + (d < t ? '' : $t('warum?')) + '</span>') + '</button>' + (z2 ? body : '') : body) + '</div></div>'; }
  const sk = skipped.length ? '<div class="wkd"><div class="wkdl"><b>–</b></div><div class="grow">' + skipped.map(o => wkUnitRow(w, o)).join('') + '</div></div>' : '';
  return '<div class="card flush wkcard"><div class="meal-h"><b>' + $t('Deine Woche') + '</b><span class="small muted">' + fmtDay(pl.A) + ' – ' + fmtDay(pl.last) + '</span></div>' + rows + sk + '</div>'; }

/* ---------- Pause: Begründung aus der eigenen Woche + Studienlage, optional Z2 ---------- */
function wkPauseSheet(w, d) { const pl = wkPlan(w), at = x => pl.ev[x] || []; const y = addDays(d, -1), y2 = addDays(d, -2), tm = addDays(d, 1); const why = [];
  const nm = o => o.k ? SESS[o.k].title : o.act ? (o.act.title || (ACT_MAP[o.act.type] || {}).name) : ''; const yl = at(y).find(o => o.leg), yh = at(y).find(o => o.hiit), tl = at(tm).find(o => o.leg), th = at(tm).find(o => o.hiit);
  if (yl) why.push($tf('Gestern Beine ({s}): Die Beinmuskeln brauchen etwa 48 Stunden, bis sie wieder voll belastbar sind.', { s: nm(yl) }));
  else if (yh) why.push($t('Gestern HIIT: Nach harten Intervallen tut ein lockerer Tag gut.'));
  if (at(y).some(o => o.hard) && at(y2).some(o => o.hard)) why.push($t('Nach zwei harten Tagen hintereinander ist ein freier Tag die beste Investition.'));
  if (tl) why.push($tf('Morgen Beintag ({s}): Mit frischen Beinen schaffst du mehr Gewicht und Wiederholungen.', { s: nm(tl) }));
  else if (th) why.push($t('Morgen HIIT: Ausgeruht holst du mehr aus den Intervallen.'));
  if (!why.length) why.push($t('Ein geplanter Ruhetag: Die Anpassung an das Training passiert in der Erholung, nicht während der Einheit.'));
  const W = wkPeek(w), has = (W.z2 || []).includes(d), past = d < today();
  openPop(sheetHead($t('Pause') + ' · ' + esc(wkDay(d))) + '<div class="stack" style="margin-top:8px">' + why.map(x => '<p style="margin:0">' + esc(x) + '</p>').join('') +
    (past ? '' : '<div class="wkz2"><p style="margin:0"><b>' + $t('Lust auf Bewegung?') + '</b> ' + $t('Dann eine lockere') + ' <button class="gl" data-act="wkZ2Add" data-w="' + w + '" data-d="' + d + '" type="button">' + $t('Z2-Einheit') + '</button> ' + $t('(30–40 min, du kannst dich dabei unterhalten). Lockeres Ausdauertraining stört die Erholung kaum.') + '</p>' +
      (has ? '<p class="small t-green" style="margin:8px 0 0;font-weight:700">✓ ' + $t('Eingeplant') + '</p>' : '<button class="btn brand sm" style="margin-top:10px" data-act="wkZ2Add" data-w="' + w + '" data-d="' + d + '" type="button">' + $t('Z2-Einheit einplanen') + '</button>') + '</div>') +
    '<div>' + evBtn(['LOD-108', 'CON-106', 'HYB-107'], $t('Studienlage zu Ruhetagen')) + '</div></div>'); }

/* ---------- Einheit überspringen oder früher beenden: mit Grund ---------- */
function wkSkipSheet(w, k, early) { const gym = isGym(k), hi = isHiit(k); const B = (act, lab, sub, cls) => '<button class="wkr' + (cls ? ' ' + cls : '') + '" data-act="' + act + '" data-w="' + w + '" data-k="' + k + '" type="button"><b>' + lab + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</button>';
  const reasons = early ? [['time', $t('Keine Zeit mehr')], ['tired', $t('Müde, platt')], ['pain', $t('Schmerzen')], ['other', $t('Etwas anderes')]] : [['sick', $t('Krank')], ['time', $t('Keine Zeit')], ['tired', $t('Müde, schlecht geschlafen')], ['pain', $t('Schmerzen')], ['other', $t('Etwas anderes')]];
  const R = ui.wkWhy || null;
  let opts = '';
  if (R && !early) { if (R === 'sick') opts = '<p class="small">' + $t('Gute Besserung. Die Einheit muss nicht nachgeholt werden. Zurück ins Training: Nur Symptome oberhalb des Halses (Schnupfen) → locker möglich. Fieber, Gliederschmerzen oder Husten → Pause, bis du 24 Stunden fieberfrei bist.') + '</p>' + B('wkDoSkip', $t('Einheit auslassen'), '', 'on');
    else if (R === 'time') opts = B('wkPost', $t('Auf den nächsten passenden Tag verschieben'), $t('Die App legt die restliche Woche neu.')) + (gym ? B('wkShort', $t('Kurzversion heute'), $t('Nur Hauptübungen und Schwerpunkt, etwa 30 Minuten.')) : '') + B('wkDoSkip', $t('Ganz auslassen'), '');
    else if (R === 'tired') opts = (gym ? B('wkLite', $t('Leichtere Version'), $t('Ein Satz weniger pro Übung, RPE eine Stufe niedriger.')) : '') + (hi ? B('wkHiitZ2', $t('Z2 statt HIIT'), $t('Heute locker statt hart, HIIT entfällt diese Woche.')) : '') + B('wkPost', $t('Verschieben'), $t('Auf den nächsten passenden Tag.')) + B('wkDoSkip', $t('Ganz auslassen'), '');
    else if (R === 'pain') opts = '<p class="small">' + $t('Schmerz bis 5 von 10, der am nächsten Morgen nicht schlimmer ist, ist bei vielen Beschwerden in Ordnung. Stärker oder stechend: die Übung auslassen und beobachten.') + ' ' + evBtn(['BES-110', 'BES-111'], $t('Studienlage')) + '</p>' + (gym ? B('wkPainGo', $t('Trotzdem trainieren'), $t('Einzelne Übungen kannst du über „Auslassen“ weglassen.')) : '') + B('wkPost', $t('Verschieben'), '') + B('wkDoSkip', $t('Ganz auslassen'), '');
    else opts = B('wkDoSkip', $t('Einheit auslassen'), ''); }
  openPop(sheetHead(early ? $t('Früher beenden?') : $t('Einheit auslassen')) + '<p class="small muted" style="margin:6px 0 10px">' + (early ? $t('Noch nicht alle Sätze erledigt. Was ist los? Die App plant den Rest der Woche danach.') : $t('Was ist los? Je nach Grund gibt es eine passende Lösung.')) + '</p><div class="chips">' + reasons.map(r => '<button class="chip' + (R === r[0] ? ' on' : '') + '" data-act="' + (early ? 'wkEarly' : 'wkWhy') + '" data-v="' + r[0] + '" data-w="' + w + '" data-k="' + k + '" type="button">' + r[1] + '</button>').join('') + '</div>' + (opts ? '<div class="stack" style="margin-top:12px">' + opts + '</div>' : '')); }
function wkSetSkip(w, k, why) { const s = sess(w, k); s.skipped = true; s.skipWhy = why || 'other'; save(); }

/* ---------- Einzelne Übung auslassen ---------- */
const OMIT_WHY = () => ({ eq: $t('Gerät belegt oder fehlt'), pain: $t('Schmerz'), time: $t('Keine Zeit'), tired: $t('Zu müde'), short: $t('Kurzversion'), early: $t('früher beendet') });
function wkOmitSheet(w, k, slot) { const p = planFor(w, k).find(x => x.slot === slot); if (!p) return; const nm = LIB[actualEx(w, k, p)].name;
  openPop(sheetHead($t('Übung auslassen')) + '<p style="margin:6px 0 12px"><b>' + esc(nm) + '</b></p><div class="stack">' +
    [['eq', $t('Gerät belegt oder fehlt'), $t('Zeigt dir gleichwertige Alternativen.')], ['pain', $t('Schmerz'), $t('Auslassen und beobachten. Bei Bedarf schonende Variante wählen.')], ['time', $t('Keine Zeit'), $t('Wenn dadurch Volumen fehlt, schlägt die App einen Ausgleich vor.')], ['tired', $t('Zu müde'), $t('Zählt nicht als Lücke, solange die Woche sonst reicht.')]].map(r => '<button class="wkr" data-act="wkOmit" data-v="' + r[0] + '" data-w="' + w + '" data-k="' + k + '" data-slot="' + slot + '" type="button"><b>' + r[1] + '</b><span>' + r[2] + '</span></button>').join('') + '</div>'); }

/* ---------- Volumen-Ausgleich: nur Schwerpunkt-Muskeln und Muskeln unter dem Minimum ---------- */
function wkIsoFor(m, w) { const used = new Set(); GYM().forEach(k => planFor(w, k).forEach(p => used.add(actualEx(w, k, p))));
  const c = Object.values(LIB).filter(e => e.muscles && e.muscles[m] >= 1 && Object.values(e.muscles).reduce((a, b) => a + b, 0) <= 1.25 && exAvailable(e.id) && !e.cardio);
  return (c.find(e => used.has(e.id)) || c[0] || {}).id; }
function wkVolGaps(w) { const W = wkPeek(w); const done = weekVolume(w), rest = {}, orig = {}; Object.keys(MUSCLES).forEach(m => { rest[m] = 0; orig[m] = 0; });
  GYM().forEach(k => { planForP(S.plan, w, k).forEach(p => addVol(orig, p.ex, p.sets)); const pr = sessProgress(w, k); if (pr.done) return; const s = peekSess(w, k);
    planFor(w, k).forEach(p => { const lg = s && s.logs[p.slot]; const dn = lg ? (lg.sets || []).filter(x => x && x.done).length : 0; addVol(rest, actualEx(w, k, p), Math.max(0, p.sets - dn)); }); });
  const out = []; Object.keys(MUSCLES).forEach(m => { if (W.vb && W.vb[m]) return; const min = PRIORITY.includes(m) ? VOL_TARGET.prio[0] : VOL_TARGET.other[0]; const proj = done[m] + rest[m], miss = orig[m] - proj;
    if (proj >= min || miss < 1) return; const n = Math.min(3, Math.ceil(Math.min(min - proj, miss))); if (n < 1) return; out.push({ m, n, proj, min, prio: PRIORITY.includes(m) }); });
  return out.sort((a, b) => (b.prio - a.prio) || (a.proj / a.min - b.proj / b.min)); }
function wkVolHost(w, m) { const pl = wkPlan(w), t = today(); const legM = ['q', 'h', 'g', 'c'].includes(m);
  const cands = pl.items.filter(o => wkOpen(o) && !o.cardio && o.date >= t).filter(o => { const s = peekSess(w, o.k); const vbSets = ((s && s.extra) || []).filter(e => /^vb_/.test(e.slot)).reduce((a, e) => a + e.sets, 0); if (vbSets >= 3) return false;
    if (legM && (pl.ev[addDays(o.date, 1)] || []).some(x => x.leg || x.hiit)) return false; return true; });
  const tot = o => planFor(w, o.k).reduce((a, p) => a + p.sets, 0); return cands.sort((a, b) => tot(a) - tot(b))[0]; }
function wkVolCard(w) { if (w !== curWeek()) return ''; const gaps = wkVolGaps(w).map(g => ({ g, host: wkVolHost(w, g.m), ex: wkIsoFor(g.m, w) })).filter(x => x.host && x.ex).slice(0, 2); if (!gaps.length) return '';
  return '<div class="card"><h2>' + $t('Volumen-Ausgleich') + '</h2><p class="small muted">' + $t('Durch ausgelassene Übungen fehlen dir diese Woche Sätze. Vorschlag, ohne schwere Grundübung und ohne Beine vor einem Bein- oder HIIT-Tag:') + '</p>' +
    gaps.map(x => '<div class="wkvb"><div class="grow"><b>' + esc(MUSCLES[x.g.m]) + '</b> <span class="small muted">' + fmt(x.g.proj, 0) + $t(' von mindestens ') + x.g.min + $t(' Sätzen') + (x.g.prio ? ' · ' + $t('Schwerpunkt') : '') + '</span><br><span class="small">' + $tf('{n} Sätze {ex} an {s} ({d}) anhängen', { n: x.g.n, ex: LIB[x.ex].name, s: SESS[x.host.k].title, d: wkDay(x.host.date) }) + '</span></div><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn sm fog" data-act="wkVbNo" data-m="' + x.g.m + '" type="button">' + $t('Nein') + '</button><button class="btn sm brand" data-act="wkVbOk" data-m="' + x.g.m + '" data-k="' + x.host.k + '" data-ex="' + x.ex + '" data-n="' + x.g.n + '" type="button">' + $t('Übernehmen') + '</button></div></div>').join('') +
    '<div>' + evBtn(['HYP-101', 'HYP-102'], $t('Studienlage zum Volumen')) + '</div></div>'; }

/* ---------- Einbindung ---------- */
(function () { const st = document.createElement('style'); st.textContent =
  '.wkcard .meal-h{display:flex;justify-content:space-between;align-items:center}.wkd{display:flex;gap:12px;padding:8px 16px;border-top:1px solid var(--rule);align-items:flex-start}.wkd.tod{background:#fff4ee}.wkd.past{opacity:.75}' +
  '.wkdl{flex:0 0 40px;text-align:center;padding-top:6px}.wkdl b{display:block;font-size:15px}.wkdl span{font-size:12px;color:var(--muted)}.wkd.tod .wkdl b{color:var(--ember)}' +
  '.wku{display:flex;gap:12px;align-items:center;padding:6px 0;text-decoration:none;color:var(--graphite);min-width:0}.wku .grow{min-width:0}.wku small{display:block;color:var(--muted);font-size:13px;margin-top:1px}' +
  '.wkpause{display:flex;gap:10px;align-items:center;width:100%;border:0;background:none;font:inherit;color:var(--graphite);padding:10px 0;cursor:pointer;text-align:left}.wkpause b{font-size:16px;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px;text-decoration-color:var(--verdant)}' +
  '.wkdec{border:2px solid var(--ember)}.wkopt{background:var(--fog);border-radius:16px;padding:12px 14px;margin-top:10px}.wkoh{margin:0;font-weight:800}.wkprev{margin:4px 0 8px;padding-left:18px;font-size:14px}.wkprev li{margin:3px 0}' +
  '.wkr{display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;text-align:left;border:2px solid transparent;background:var(--fog);border-radius:16px;padding:12px 14px;font:inherit;color:inherit;cursor:pointer}.wkr span{font-size:14px;color:var(--muted)}.wkr.on{border-color:var(--ember)}' +
  '.wkz2{background:#e9f7ee;border-radius:16px;padding:12px 14px}.wkvb{display:flex;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--rule)}.wkvb:first-of-type{border-top:0}' +
  '.wkchs{display:flex;flex-wrap:wrap;gap:6px}.wkch{border:0;border-radius:999px;background:var(--fog);padding:8px 14px;font:inherit;font-size:14px;font-weight:700;cursor:pointer;color:var(--graphite)}.wkch.on{background:var(--charcoal);color:#fff}' +
  '.wku .badge.act{font-size:10px;overflow:hidden}.ex.exom{opacity:.75}.ex.exom .row{align-items:center}';
  document.head.appendChild(st); })();
/* Früher beendet zählt als erledigt */
const _sessProgressWk = sessProgress; sessProgress = function (w, k) { const r = _sessProgressWk(w, k); if (r.done) return r; const s = peekSess(w, k); return s && !s.skipped && s.end && s.end.fin ? Object.assign({}, r, { done: true, early: true }) : r; };
/* Heute: was heute laut Wochenplan dran ist */
const _sessionsOnDowWk = sessionsOnDow; sessionsOnDow = function (dow) { if (!ORDER.length || dow !== new Date().getDay()) return _sessionsOnDowWk(dow); const w = curWeek(); const t = today(); return wkPlan(w).items.filter(o => o.date === t && o.st !== 'skipped' && o.st !== 'merged').map(o => o.k); };
const _dayLabelWk = dayLabel; dayLabel = function (k) { try { const w = curWeek(); const it = wkPlan(w).items.find(o => o.k === k); if (it && it.date && (wkOpen(it) || it.st === 'today')) return wkDay(it.date); } catch (e) {} return _dayLabelWk(k); };
const _sessAdjWk = sessAdjust; sessAdjust = function (w, k, list) { list = _sessAdjWk(w, k, list); const s = peekSess(w, k); if (!s) return list;
  if (s.cut && s.cut.length) list = list.filter(x => !s.cut.includes(x.slot));
  const keep = s.keep || {}; if (s.short) list = list.map(x => x.type === 'main' || isPrio(x.ex) || keep[x.slot] || (s.omit && s.omit[x.slot]) ? x : Object.assign({}, x, { om: 'short', sets: 0 }));
  if (s.omit) list = list.map(x => s.omit[x.slot] ? Object.assign({}, x, { om: s.omit[x.slot], sets: 0 }) : x);
  if (s.lite) list = list.map(x => x.sets && !x.om ? Object.assign({}, x, { sets: Math.max(1, x.sets - 1), rpe: x.rpe != null ? Math.max(5, x.rpe - 1) : x.rpe }) : x);
  return list; };
const _exCardWk = exCard; exCard = function (w, k, spec) { if (spec.om) { const nm = LIB[actualEx(w, k, spec)] ? LIB[actualEx(w, k, spec)].name : spec.ex;
    return '<div class="ex exom" id="ex-' + spec.slot + '"><div class="row" style="flex-wrap:nowrap;gap:10px"><div class="grow"><b>' + esc(nm) + '</b><div class="small muted">' + $t('Ausgelassen') + ' · ' + esc(OMIT_WHY()[spec.om] || '') + '</div></div><button class="btn sm" data-act="wkUnomit" data-w="' + w + '" data-k="' + k + '" data-slot="' + spec.slot + '" type="button">' + $t('Doch machen') + '</button></div></div>'; }
  const h = _exCardWk(w, k, spec); return h.replace('<div class="ex-actions">', '<div class="ex-actions"><button class="btn sm" data-act="wkOmitOpen" data-w="' + w + '" data-k="' + k + '" data-slot="' + spec.slot + '" type="button">' + $t('Auslassen') + '</button>'); };
const _viewTrainingWk = viewTraining; viewTraining = function () { let h = _viewTrainingWk(); if (!ORDER.length) return h; const w = ui.week || curWeek(); if (w !== curWeek()) return h;
  const i = h.indexOf('<div class="card flush"><div class="list">'); if (i < 0) return h; const j = h.indexOf('</a></div></div>', i); if (j < 0) return h;
  return h.slice(0, i) + wkDecisionCard(w) + wkOverview(w) + wkVolCard(w) + h.slice(j + 16); };
const _viewHeuteWk = viewHeute; viewHeute = function () { const h = _viewHeuteWk.apply(this, arguments); if (!ORDER.length) return h; const w = curWeek(); const W = wkPeek(w); let add = '';
  const pl = wkPlan(w); if (pl.over && !W.mode && S.settings.mode !== 'rotation') add = note('ember', '<b>' + $t('Die Woche wird knapp.') + '</b> ' + $t('Kompakt abschließen oder weiterlaufen lassen?'), '<a class="btn sm brand" href="#training">' + $t('Entscheiden') + '</a>');
  const z = (W.z2 || []).includes(today()) ? note('green', '<b>' + $t('Heute optional: Z2 locker') + '</b> ' + $t('30–40 min, du kannst dich dabei unterhalten.'), '<button class="btn sm" data-act="pickActZ2" type="button">' + $t('Eintragen') + '</button>') : '';
  if (!add && !z) return h; const m = h.indexOf('<div class="card flush"><div class="meal-h"><b>'); return m < 0 ? h : h.slice(0, m) + add + z + h.slice(m); };

document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  /* „Einheit überspringen“ und „Einheit beenden“ mit Grund abfangen */
  if (a === 'skip') { e.stopImmediatePropagation(); e.preventDefault(); ui.wkWhy = null; wkSkipSheet(+b.dataset.w, b.dataset.k, false); return; }
  if (a === 'finSess') { const w = +b.dataset.w, k = b.dataset.k; if (!isGym(k)) return; const s = peekSess(w, k), pr = sessProgress(w, k); if (s && s.endWhy) return; if (pr.t && pr.f / pr.t < .8) { e.stopImmediatePropagation(); e.preventDefault(); wkSkipSheet(w, k, true); } return; }
}, true);
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; const w = +b.dataset.w, k = b.dataset.k;
  if (a === 'wkCompact') { wkApplyCompact(curWeek()); render(); doneOverlay($t('Woche kompakt geplant')); }
  else if (a === 'wkFlow') { WK(curWeek()).mode = 'flow'; save(); render(); toast($t('Alles klar, die Woche läuft einfach weiter.')); }
  else if (a === 'wkUndo') { wkUndoCompact(curWeek()); render(); toast($t('Kompakte Planung zurückgenommen')); }
  else if (a === 'wkPause') wkPauseSheet(w, b.dataset.d);
  else if (a === 'wkZ2Add') { const W = WK(w); W.z2 = W.z2 || []; if (!W.z2.includes(b.dataset.d)) W.z2.push(b.dataset.d); save(); closeSheet(); render(); doneOverlay($t('Z2-Einheit eingeplant'), wkDay(b.dataset.d)); }
  else if (a === 'wkZ2Rm') { const W = WK(curWeek()); W.z2 = (W.z2 || []).filter(d => d !== b.dataset.d); save(); render(); toast($t('Z2-Einheit entfernt')); }
  else if (a === 'pickActZ2') { actSheet(); }
  else if (a === 'wkWhy') { ui.wkWhy = b.dataset.v; wkSkipSheet(w, k, false); }
  else if (a === 'wkDoSkip') { wkSetSkip(w, k, ui.wkWhy); closeSheet(); location.hash = '#training'; doneOverlay($t('Einheit ausgelassen'), $t('Die restliche Woche ist neu geplant.')); }
  else if (a === 'wkPost') { const s = sess(w, k); s.post = today(); save(); closeSheet(); location.hash = '#training'; doneOverlay($t('Verschoben'), $t('Neuer Tag: ') + dayLabel(k)); }
  else if (a === 'wkShort') { const s = sess(w, k); s.short = true; save(); closeSheet(); render(); doneOverlay($t('Kurzversion'), $t('Nur Hauptübungen und Schwerpunkt.')); }
  else if (a === 'wkLite') { const s = sess(w, k); s.lite = true; save(); closeSheet(); render(); doneOverlay($t('Leichtere Version'), $t('Ein Satz weniger, RPE eine Stufe niedriger.')); }
  else if (a === 'wkHiitZ2') { wkSetSkip(w, k, 'tired'); const W = WK(w); W.z2 = W.z2 || []; if (!W.z2.includes(today())) W.z2.push(today()); save(); closeSheet(); location.hash = '#heute'; doneOverlay($t('Heute Z2 statt HIIT')); }
  else if (a === 'wkPainGo') { const s = sess(w, k); s.pain = true; save(); closeSheet(); render(); }
  else if (a === 'wkEarly') { const s = sess(w, k); s.endWhy = b.dataset.v; s.omit = s.omit || {}; const why = b.dataset.v === 'time' ? 'time' : b.dataset.v === 'tired' ? 'tired' : b.dataset.v === 'pain' ? 'pain' : 'early';
    planFor(w, k).forEach(p => { if (p.om) return; const lg = s.logs[p.slot]; const dn = lg ? (lg.sets || []).filter(x => x && x.done).length : 0; if (!dn) s.omit[p.slot] = why; }); save(); closeSheet(); finishSession(w, k); }
  else if (a === 'wkOmitOpen') wkOmitSheet(w, k, b.dataset.slot);
  else if (a === 'wkOmit') { const v = b.dataset.v, slot = b.dataset.slot; if (v === 'eq') { closeSheet(); ui.swapScope = 'today'; ui.swapTab = 'alt'; variantsSheet(w, k, slot); return; }
    const s = sess(w, k); s.omit = s.omit || {}; s.omit[slot] = v; markStarted(w, k); save(); closeSheet(); render(); const gaps = wkVolGaps(w); toast(gaps.length && v !== 'tired' ? $t('Ausgelassen. Ein Volumen-Ausgleich steht in der Wochenübersicht.') : $t('Übung ausgelassen')); }
  else if (a === 'wkUnomit') { const s = sess(w, k), slot = b.dataset.slot; if (s.omit && s.omit[slot]) delete s.omit[slot]; else { s.keep = s.keep || {}; s.keep[slot] = 1; } save(); render(); }
  else if (a === 'wkVbOk') { const ww = curWeek(), m = b.dataset.m, s = sess(ww, b.dataset.k); s.extra = s.extra || []; s.extra.push({ slot: 'vb_' + m + '_' + uid(), ex: b.dataset.ex, sets: +b.dataset.n, reps: '10–15', rpe: 8, rest: 60, type: 'dp', note: $t('Volumen-Ausgleich') }); const W = WK(ww); W.vb = W.vb || {}; W.vb[m] = 'ok'; save(); render(); doneOverlay($t('Angehängt'), SESS[b.dataset.k].title); }
  else if (a === 'wkVbNo') { const W = WK(curWeek()); W.vb = W.vb || {}; W.vb[b.dataset.m] = 'no'; save(); render(); }
});
if (route.name === 'training' || route.name === 'heute') render();
