/* ======================= WOCHEN-CHECK-IN: Rückblick und Vorschläge für die nächste Woche =======================
   Wertet Leistung (e1RM der Hauptübungen), Ermüdung (RPE über Ziel, Bereitschaft, Ruhepuls), Belastung (Dauer × RPE),
   Umsetzung und Gewicht aus und schlägt feste, begründete Änderungen vor. Nichts ändert sich ohne Bestätigung.
   Schwellenwerte vorläufig aus der Literatur; sie werden durch die geprüften Wissens-Snippets ersetzt (REV_EV.id = Snippet-ID). */
const pm = t => 'https://pubmed.ncbi.nlm.nih.gov/?term=' + encodeURIComponent(t);
const REV_EV = {
  vol: { g: 'A', txt: $t('Mehr Sätze pro Muskel und Woche bringen mehr Muskelzuwachs, mit abnehmendem Zusatznutzen. 10–20 harte Sätze gelten als guter Bereich.'), src: [['Schoenfeld et al. 2017, J Sports Sci', 'https://pubmed.ncbi.nlm.nih.gov/27433992/']] },
  stall: { g: 'C', txt: $t('Wechselnde Übungen oder Wiederholungsbereiche können Stillstand lösen; zu häufiges Wechseln bremst dagegen den Kraftzuwachs.'), src: [['Kassiano et al. 2022, J Strength Cond Res', pm('Kassiano 2022 varying resistance exercises hypertrophy strength')]] },
  deload: { g: 'C', txt: $t('Ein Deload senkt Volumen und Intensität für etwa eine Woche, um Ermüdung abzubauen. Fällt die Leistung bei hoher Ermüdung, wird er vorgezogen.'), src: [['Bell et al. 2023, Delphi-Konsens zum Deload', pm('Bell 2023 deloading Delphi consensus strength physique')]] },
  spike: { g: 'C', txt: $t('Starke Sprünge in der Wochenbelastung gehen mit mehr Überlastungsbeschwerden einher. Die genaue Grenze (Verhältnis akut zu chronisch) ist umstritten.'), src: [['Gabbett 2016, Br J Sports Med', pm('Gabbett 2016 training-injury prevention paradox')], ['Impellizzeri et al. 2020, Kritik am ACWR', pm('Impellizzeri 2020 acute chronic workload ratio conceptual issues')]] },
  adhere: { g: 'B', txt: $t('Wichtiger als der perfekte Plan ist einer, den man durchhält. Bei gleichem Wochenvolumen ist die Verteilung auf 2 oder mehr Tage ähnlich wirksam.'), src: [['Schoenfeld et al. 2019, Frequenz-Meta-Analyse', pm('Schoenfeld 2019 resistance training frequency hypertrophy meta-analysis')]] },
  dietbreak: { g: 'C', txt: $t('Geplante Wochen auf Erhaltungskalorien während einer Diät können Leistung und Durchhalten verbessern. Für den Fettabbau insgesamt ist die Datenlage gemischt.'), src: [['Byrne et al. 2018, MATADOR-Studie', pm('Byrne 2018 intermittent energy restriction MATADOR')], ['Peos et al. 2021, ICECAP-Studie', pm('Peos 2021 intermittent dieting ICECAP')]] },
  rpe: { g: 'B', txt: $t('RPE-Steuerung passt die Last an die Tagesform an. Liegen die Sätze regelmäßig deutlich über dem Ziel, ist die Last zu hoch gewählt.'), src: [['Helms et al. 2018, RPE-basierte Steuerung', pm('Helms 2018 RPE autoregulation powerlifters')]] } };

const rkey = w => (S.block.startedOn || '0') + ':' + w;
const reviews = () => (S.reviews = S.reviews || {});
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
function weekWindow(w) { const ld = lastDate(w); if (!ld) return null; const ds = []; for (let i = 6; i >= 0; i--) ds.push(addDays(ld, -i)); return ds; }
/* bestes e1RM pro Woche für eine Übung (ohne Deload- und Testwochen) */
function e1Week(exId, w) { if (isLite(w)) return null; let best = null; ORDER.forEach(k => { const s = peekSess(w, k); if (!s || !s.logs) return;
  for (const slot in s.logs) { const lg = s.logs[slot]; if (lg.ex !== exId) continue; const spec = planFor(w, k).find(p => p.slot === slot);
    loggedSets(lg).filter(x => x.done && x.w > 0 && x.r).forEach(x => { const v = e1rm(x.w, x.r, Math.min(10, x.rpe ?? (spec && spec.rpe) ?? 8)); if (!best || v > best) best = v; }); } }); return best; }
function prevValid(exId, w, n) { const out = []; for (let x = w - 1; x >= 1 && out.length < n; x--) { const v = e1Week(exId, x); if (v) out.push(v); } return out; }
function blockWeekLoad(w) { let L = 0, n = 0; ORDER.forEach(k => { const l = sessLoad(w, k); if (l && l.load) { L += l.load; n++; } }); S.activities.filter(a => a.week === w).forEach(a => { const l = actLoad(a); if (l && l.load) { L += l.load; n++; } }); return n ? L : null; }
function slotOf(exId, w) { for (const k of GYM()) { const p = planFor(w, k).find(x => x.ex === exId || actualEx(w, k, x) === exId); if (p) return { k, slot: p.slot, ex: p.ex }; } return null; }
function focusMuscles() { const q = S.settings.q || {}; if (S.plan.tpl === 'hybrid') return ['c', 'h', 'bi', 'ab']; const fo = q.focus || (S.settings.sex === 'w' ? 'lower' : 'balanced'); if (fo === 'lower') return ['g', 'q', 'h']; return Object.keys(MUSCLES); }
const goalOf = () => (S.settings.q && S.settings.q.goal) || (S.plan.tpl === 'hybrid' ? 'hybrid' : 'muscle');

/* ---------- Auswertung ---------- */
function analyzeWeek(w) { const facts = [], sugs = []; const lifts = keyLifts().filter(id => LIB[id]); const ph = phase(w);
  /* Leistung */
  const perf = lifts.map(id => { const cur = e1Week(id, w); const prev = prevValid(id, w, 2); if (!cur || !prev.length) return null; const ref = Math.max(...prev); const ch = (cur - ref) / ref;
    const stall = prev.length >= 2 && cur <= Math.max(...prev) * 1.005 && prev[0] <= prev[1] * 1.005; return { id, cur, ref, ch, stall }; }).filter(Boolean);
  perf.forEach(p => facts.push({ t: (p.ch >= 0.005 ? '▲ ' : p.ch <= -0.03 ? '▼ ' : '● ') + LIB[p.id].name + ': e1RM ' + fmt(p.cur, 0) + $t(' kg') + ' (' + (p.ch >= 0 ? '+' : '−') + fmt(Math.abs(p.ch * 100), 1) + ' %)' + (p.stall ? $t(' · stagniert seit 2 Wochen') : '') }));
  /* Ermüdung */
  const over = []; ORDER.forEach(k => { const s = peekSess(w, k); if (!s || !s.logs) return; planFor(w, k).forEach(spec => { const lg = s.logs[spec.slot]; if (!lg || spec.rpe == null) return; loggedSets(lg).filter(x => x.done && x.rpe != null).forEach(x => over.push(x.rpe - spec.rpe)); }); });
  const ovr = mean(over); const win = weekWindow(w) || []; const rd = win.map(d => dailyReadiness(d)).filter(Boolean).map(r => r.score); const rdm = mean(rd);
  const base = rhrBaseline(); const rhrHi = base ? win.filter(d => { const r = rhrOf(d); return r != null && r >= base.v + 5; }).length : 0;
  const fatigue = (ovr != null && ovr >= 1) || (rdm != null && rdm < 50) || rhrHi >= 3;
  facts.push({ t: $t('Ermüdung: ') + (fatigue ? $t('erhöht') : $t('im Rahmen')) + [ovr != null ? $t('RPE im Schnitt ') + (ovr >= 0 ? '+' : '−') + fmt(Math.abs(ovr), 1) + $t(' zum Ziel') : '', rdm != null ? $t('Bereitschaft Ø ') + Math.round(rdm) + ' %' : '', rhrHi ? rhrHi + $t(' Tage Ruhepuls erhöht') : ''].filter(Boolean).map(x => ' · ' + x).join('') });
  /* Umsetzung */
  const done = ORDER.filter(k => { const p = sessProgress(w, k); return p.done && !p.skipped; }).length; const adh = ORDER.length ? done / ORDER.length : 1;
  facts.push({ t: $t('Umsetzung: ') + done + ' / ' + ORDER.length + $t(' Einheiten') });
  /* Belastung */
  const L = blockWeekLoad(w); const prevL = [w - 1, w - 2, w - 3].filter(x => x >= 1).map(blockWeekLoad).filter(x => x); const Lref = mean(prevL);
  if (L) facts.push({ t: $t('Belastung: ') + fmt(L, 0) + (Lref ? ' (' + (L >= Lref ? '+' : '−') + Math.round(Math.abs(L / Lref - 1) * 100) + $t(' % zu den Vorwochen)') : '') });
  /* Gewicht */
  const ser = series(); const rate = weeklyRate(ser); const tg = currentTargets(); const deficit = tg && tg.tdee && tg.kcal < tg.tdee - 150;
  if (rate != null && ser.length) facts.push({ t: $t('Gewicht: ') + (rate <= 0 ? '−' : '+') + fmt(Math.abs(rate), 2) + $t(' kg pro Woche') + $t(' · Trend ') + fmt(ser[ser.length - 1].trend, 1) + $t(' kg') });

  /* ---------- Regeln ---------- */
  const drops = perf.filter(p => p.ch <= -0.03);
  if (drops.length >= Math.min(2, perf.length) && drops.length && fatigue && ph !== 'dl') {
    const nx = w + 1; if (nx <= 12 && phase(nx) !== 'dl') sugs.push({ id: 'deload', kind: 'deload', w: nx, ev: 'deload', t: $t('Deload in Woche ') + nx + $t(' vorziehen'), why: $t('Leistung gefallen bei ') + drops.map(p => LIB[p.id].name).join(', ') + $t(' und Ermüdung erhöht. Eine leichtere Woche baut Ermüdung ab, danach geht es weiter.') });
    else sugs.push({ id: 'vol', kind: 'vol', w: nx, f: 0.7, ev: 'deload', t: $t('Volumen nächste Woche um 30 % senken'), why: $t('Leistung gefallen und Ermüdung erhöht.') }); }
  else if (drops.length && deficit && rate != null && rate < 0) {
    sugs.push({ id: 'diet', kind: 'dietbreak', weeks: 1, ev: 'dietbreak', t: $t('Eine Woche auf Erhaltungskalorien'), why: $t('Im Kaloriendefizit fällt die Kraft bei ') + drops.map(p => LIB[p.id].name).join(', ') + $t('. Eine Woche ohne Defizit gibt Leistung und Erholung Luft.') }); }
  perf.filter(p => p.stall && !fatigue).slice(0, 2).forEach(p => { const so = slotOf(p.id, w + 1 <= 12 ? w + 1 : w); if (!so) return; const used = new Set(); GYM().forEach(k => planFor(w, k).forEach(x => used.add(x.ex)));
    const alt = (LIB[p.id].alts || []).concat((SCALE[p.id] || {}).e || []).find(a => LIB[a] && !used.has(a) && exAvailable(a)); if (!alt) return;
    sugs.push({ id: 'swap_' + so.slot, kind: 'swap', k: so.k, slot: so.slot, old: p.id, to: alt, ev: 'stall', t: LIB[p.id].name + ' → ' + LIB[alt].name, why: $t('Seit 2 Wochen kein Fortschritt bei normaler Ermüdung. Ein Übungswechsel setzt einen neuen Reiz, die alte Übung kann später zurückkommen.') }); });
  if (L && Lref && L > Lref * 1.3 && prevL.length >= 2) sugs.push({ id: 'spike', kind: 'info', ev: 'spike', t: $t('Belastung nächste Woche nicht weiter steigern'), why: $t('Die Wochenbelastung lag ') + Math.round((L / Lref - 1) * 100) + $t(' % über den Vorwochen. Zusätzliche Cardio-Einheiten oder Spiele lieber locker halten.') });
  const prevAdh = w > 1 ? ORDER.filter(k => { const p = sessProgress(w - 1, k); return p.done && !p.skipped; }).length / Math.max(1, ORDER.length) : 1;
  if (adh < 0.6 && prevAdh < 0.6 && ORDER.length >= 4) sugs.push({ id: 'days', kind: 'days', ev: 'adhere', t: $t('Plan mit weniger Trainingstagen'), why: $t('Zwei Wochen in Folge wurden weniger als 60 % der Einheiten geschafft. Ein Plan mit weniger Tagen und gleichem Wochenvolumen passt vermutlich besser.') });
  if (ovr != null && ovr >= 1.5 && !drops.length) sugs.push({ id: 'rpe', kind: 'info', ev: 'rpe', t: $t('Lasten etwas vorsichtiger wählen'), why: $t('Die Sätze lagen im Schnitt ') + fmt(ovr, 1) + $t(' RPE über dem Ziel. Die App schlägt nächste Woche schon leichtere Gewichte vor; nimm die Vorschläge ernst.') });
  /* Fortschritt bei normaler Ermüdung: Schwerpunkt-Muskeln +1 Satz */
  const goal = goalOf(); const progressing = perf.length && perf.every(p => p.ch > -0.01) && !fatigue && adh >= 0.8;
  if (progressing && ['muscle', 'hybrid', 'fat'].includes(goal) && w < 12 && !isLite(w + 1)) { const pv = plannedVolume(w + 1); const adj = S.plan.setAdj || {}; const cap = goal === 'fat' ? 14 : 18;
    focusMuscles().filter(m => pv[m] < cap).sort((a, b) => pv[a] - pv[b]).slice(0, 2).forEach(m => { let hit = null;
      GYM().forEach(k => planFor(w + 1, k).forEach(p => { if (!hit && LIB[p.ex] && (LIB[p.ex].muscles[m] || 0) >= 1 && p.type !== 'main' && p.sets < 5 && !adj[p.slot]) hit = { k, slot: p.slot, ex: p.ex, sets: p.sets }; }));
      if (hit) sugs.push({ id: 'set_' + hit.slot, kind: 'set', k: hit.k, slot: hit.slot, n: 1, m, from: w + 1, ev: 'vol', t: LIB[hit.ex].name + ': ' + hit.sets + ' → ' + (hit.sets + 1) + $t(' Sätze'), why: MUSCLES[m] + $t(' liegt bei ') + fmt(pv[m], 0) + $t(' Sätzen pro Woche. Du machst Fortschritte bei normaler Ermüdung, ein Satz mehr ist gut verkraftbar.') }); }); }
  if (!sugs.length) sugs.push({ id: 'keep', kind: 'keep', ev: perf.length ? 'vol' : 'adhere', t: $t('Plan unverändert weiterführen'), why: perf.length ? $t('Fortschritt und Ermüdung passen zusammen.') : $t('Noch zu wenig Daten für Änderungen. Logge Gewicht, Wiederholungen und RPE, dann werden die Vorschläge genauer.') });
  return { w, at: Date.now(), facts, sugs: sugs.map(s => Object.assign({ st: s.kind === 'keep' || s.kind === 'info' ? 'info' : 'open' }, s)) }; }

/* ---------- Anwenden (direkt am Plan, damit es für Athlet und Coach gleich funktioniert) ---------- */
function applySug(plan, s) { plan = plan || S.plan; const sess = plan.sessions.find(x => x.k === s.k);
  if (s.kind === 'set' && sess) { plan.setAdj = plan.setAdj || {}; const o = plan.setAdj[s.slot] || { n: 0, from: s.from || 1 }; plan.setAdj[s.slot] = { n: o.n + (s.n || 1), from: Math.min(o.from, s.from || 1) }; }
  if (s.kind === 'swap' && sess) { const it = (sess.add || []).find(x => x.slot === s.slot); if (it) it.ex = s.to; else { sess.ov = sess.ov || {}; sess.ov[s.slot] = Object.assign({}, sess.ov[s.slot] || {}, { ex: s.to }); } }
  if (s.kind === 'deload') { const P = Array.from({ length: 12 }, (_, i) => phaseOf(plan, i + 1)); P[s.w - 1] = 'dl'; plan.phases = P; }
  if (s.kind === 'vol') { plan.volAdj = plan.volAdj || {}; plan.volAdj[s.w] = s.f; }
  if (s.kind === 'dietbreak') plan.dietBreak = { from: today(), until: addDays(today(), 7 * (s.weeks || 1)) };
  return plan; }
function phaseOf(plan, w) { const keep = S.plan; S.plan = plan; const r = phase(w); S.plan = keep; return r; }
/* Satz-Anpassung und Volumenfaktor in die Planberechnung einhängen */
const _planForPRev = planForP;
planForP = function (plan, w, k) { const list = _planForPRev(plan, w, k); if (!plan) return list; const adj = plan.setAdj || {}, f = plan.volAdj && plan.volAdj[w];
  return list.map(p => { let sets = p.sets; const a = adj[p.slot]; if (a && !isLite(w) && w >= (a.from || 1)) sets += a.n || 0; if (f) sets = Math.max(1, Math.round(sets * f)); return sets !== p.sets ? Object.assign({}, p, { sets }) : p; }); };
const _doCheckinRev = doCheckin;
doCheckin = function () { const c = _doCheckinRev(); const db = S.plan && S.plan.dietBreak; if (db && today() >= db.from && today() <= db.until && c.kcal < c.tdee) { c.kcal = Math.round(c.tdee / 50) * 50; c.c = Math.max(0, Math.round((c.kcal - 4 * c.p - 9 * c.f) / 4)); c.hold = 'dietbreak'; save(); } return c; };
async function decide(key, id, yes) { const r = reviews()[key]; if (!r) return; const s = r.sugs.find(x => x.id === id); if (!s) return;
  if (yes && s.kind === 'days') { s.st = 'yes'; save(); location.hash = '#library'; return; }
  if (yes) { applySug(S.plan, s); applyPlan(); } s.st = yes ? 'yes' : 'no'; s.by = 'me'; save();
  if (yes && typeof AUTH !== 'undefined' && AUTH && typeof pushPlan === 'function') { try { S.meta.planAt = await pushPlan(AUTH.uid, S.plan); persist(); } catch (e) {} }
  toast(yes ? $t('Übernommen') : $t('Abgelehnt')); render(); }

/* ---------- Wann eine Woche ausgewertet wird ---------- */
function reviewTarget() { if (!ORDER.length || (S.plan && (S.plan.free || S.plan.waiting))) return null; const w = curWeek();
  if (weekDone(w)) return w; if (w > 1 && lastDate(w - 1)) return w - 1; return null; }
function ensureReview() { const w = reviewTarget(); if (!w) return null; const key = rkey(w); const R = reviews(); if (!R[key]) { R[key] = analyzeWeek(w); save(); } return key; }

/* ---------- Anzeige ---------- */
const ST_TXT = () => ({ yes: $t('übernommen'), no: $t('abgelehnt'), coach: $t('dein Coach entscheidet') });
function sugHTML(key, s, coachMode, uid) { const done = s.st === 'yes' || s.st === 'no';
  const btns = s.st === 'info' ? '' : done ? '<span class="tag">' + (ST_TXT()[s.st] || '') + (s.by === 'coach' ? $t(' · vom Coach') : '') + '</span>'
    : coachMode ? '<button class="btn sm brand" data-act="revCoach" data-uid="' + uid + '" data-key="' + esc(key) + '" data-id="' + s.id + '" data-v="1" type="button">' + $t('Übernehmen') + '</button><button class="btn sm" data-act="revCoach" data-uid="' + uid + '" data-key="' + esc(key) + '" data-id="' + s.id + '" data-v="0" type="button">' + $t('Ablehnen') + '</button>'
    : '<button class="btn sm brand" data-act="revYes" data-key="' + esc(key) + '" data-id="' + s.id + '" type="button">' + (s.kind === 'days' ? $t('Pläne ansehen') : $t('Übernehmen')) + '</button><button class="btn sm" data-act="revNo" data-key="' + esc(key) + '" data-id="' + s.id + '" type="button">' + $t('Ablehnen') + '</button>';
  return '<div class="rev-sug"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><b class="grow">' + esc(s.t) + '</b><button class="btn sm" data-act="revWhy" data-ev="' + s.ev + '" type="button" aria-label="Warum?">' + $t('Warum?') + '</button></div><p class="small" style="margin:4px 0 8px">' + esc(s.why) + '</p><div class="row" style="gap:8px">' + btns + '</div></div>'; }
function reviewCard(key, opts) { opts = opts || {}; const r = (opts.R || reviews())[key]; if (!r) return '';
  const open = r.sugs.filter(s => s.st === 'open').length;
  return '<div class="card rev" id="rev-' + esc(key) + '"><div class="row"><div class="grow"><div class="lbl">' + $t('Wochen-Check-in') + '</div><h2 style="margin:2px 0 6px">' + $t('Deine Woche ') + r.w + '</h2></div>' + (open && !opts.coach ? '<span class="tag"><span class="dot red"></span>' + open + $t(' offen') + '</span>' : '') + '</div>' +
    '<ul class="rev-facts">' + r.facts.map(f => '<li>' + esc(f.t) + '</li>').join('') + '</ul>' +
    '<div class="lbl" style="margin-top:12px">' + $t('Vorschläge für Woche ') + Math.min(12, r.w + 1) + '</div>' + r.sugs.map(s => sugHTML(key, s, opts.coach, opts.uid)).join('') +
    (!opts.coach && typeof hasCoach === 'function' && hasCoach() ? '<p class="small muted" style="margin-top:8px">' + $t('Dein Coach sieht diese Vorschläge auch und kann sie für dich übernehmen.') + '</p>' : '') +
    (!opts.coach && !opts.full ? '<button class="btn sm" data-act="revHide" data-key="' + esc(key) + '" type="button" style="margin-top:10px">' + $t('Ausblenden') + '</button>' : '') + '</div>'; }
function whySheet(ev) { const e = REV_EV[ev]; if (!e) return; openSheet(sheetHead($t('Warum?')) + '<p>' + esc(e.txt) + '</p><p class="small" style="margin-top:10px"><b>' + $t('Evidenzgrad ') + e.g + '</b> · ' + $t('vorläufig, wird mit der geprüften Wissensbank aktualisiert') + '</p><ul class="small" style="margin-top:8px">' + e.src.map(s => '<li><a href="' + s[1] + '" target="_blank" rel="noopener">' + esc(s[0]) + '</a></li>').join('') + '</ul>'); }
/* auf „Heute“ oben, solange offen und nicht ausgeblendet */
const _heuteExtrasRev = heuteExtras;
heuteExtras = function () { let h = _heuteExtrasRev(); if (VIEW) return h; try { const key = ensureReview(); const r = key && reviews()[key]; if (r && !r.hidden && r.sugs.some(s => s.st === 'open')) h = reviewCard(key) + h; } catch (e) { console.warn('review', e); } return h; };
/* im Verlauf: letzter Check-in immer erreichbar */
const _viewProgressRev = viewProgress;
viewProgress = function () { const html = _viewProgressRev(); let key = null; try { key = VIEW ? null : ensureReview(); } catch (e) {} if (!key) return html; const i = html.indexOf('<div class="stack">'); return i < 0 ? html : html.slice(0, i + 19) + reviewCard(key, { full: true }) + html.slice(i + 19); };

/* ---------- Coach ---------- */
const _makeSummaryRev = makeSummary;
makeSummary = function () { const s = _makeSummaryRev(); try { const key = ensureReview(); const r = key && reviews()[key]; if (r) s.review = { key, w: r.w, facts: r.facts, sugs: r.sugs }; } catch (e) {} return s; };
const _viewClientRev = viewClient;
viewClient = function (uid) { const html = _viewClientRev(uid); const c = (ADMIN.clients || []).find(x => x.id === uid); const rv = c && c.summary && c.summary.review; if (!rv) return html;
  const dec = (ADMIN.decided || {})[uid] || {}; rv.sugs.forEach(s => { if (dec[rv.key + ':' + s.id]) { s.st = dec[rv.key + ':' + s.id]; s.by = 'coach'; } });
  const card = reviewCard(rv.key, { coach: true, uid, R: { [rv.key]: rv } }); const i = html.indexOf('<div class="stats">'); return i < 0 ? html + card : html.slice(0, i) + card + html.slice(i); };
async function coachDecide(uid, key, id, yes) { const c = (ADMIN.clients || []).find(x => x.id === uid); const rv = c && c.summary && c.summary.review; const s = rv && rv.sugs.find(x => x.id === id); if (!s) return;
  try { const r = await api('/rest/v1/plans?user_id=eq.' + uid + '&select=plan'); const plan = r && r[0] && r[0].plan; if (!plan) { toast($t('Plan des Athleten nicht gefunden.')); return; }
    if (yes && s.kind !== 'days') applySug(plan, s); plan.revDecisions = Object.assign({}, plan.revDecisions || {}, { [key + ':' + id]: yes ? 'yes' : 'no' }); await pushPlan(uid, plan);
    ADMIN.decided = ADMIN.decided || {}; ADMIN.decided[uid] = Object.assign({}, ADMIN.decided[uid] || {}, { [key + ':' + id]: yes ? 'yes' : 'no' }); toast(yes ? $t('Übernommen, dein Athlet bekommt es beim nächsten Öffnen.') : $t('Abgelehnt')); render(); }
  catch (e) { toast($t('Fehlgeschlagen: ') + ((e && e.message) || e)); } }
/* Athlet: Entscheidungen des Coaches aus dem Plan in den eigenen Check-in übernehmen */
function syncCoachDecisions() { const d = S.plan && S.plan.revDecisions; if (!d) return; const R = reviews(); let ch = false;
  Object.keys(d).forEach(k2 => { const i = k2.lastIndexOf(':'); const key = k2.slice(0, i), id = k2.slice(i + 1); const r = R[key]; const s = r && r.sugs.find(x => x.id === id); if (s && s.st === 'open') { s.st = d[k2]; s.by = 'coach'; ch = true; } }); if (ch) persist(); }
const _applyPlanRev = applyPlan;
applyPlan = function () { _applyPlanRev(); try { syncCoachDecisions(); } catch (e) {} };

/* ---------- Ereignisse ---------- */
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  switch (b.dataset.act) {
    case 'revYes': decide(b.dataset.key, b.dataset.id, true); break;
    case 'revNo': decide(b.dataset.key, b.dataset.id, false); break;
    case 'revWhy': whySheet(b.dataset.ev); break;
    case 'revHide': { const r = reviews()[b.dataset.key]; if (r) { r.hidden = true; save(); render(); } break; }
    case 'revCoach': coachDecide(b.dataset.uid, b.dataset.key, b.dataset.id, b.dataset.v === '1'); break;
  } });
