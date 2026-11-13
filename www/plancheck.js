/* Hybridblock – 8.4 Plan-Prüfung: jeder Plan (Generator, eigener Plan, Coach-Plan) wird gegen die Regel-Tabelle geprüft.
   Nur auf Abruf, nie blockierend. Ergebnis: berechneter Evidenzgrad und einzelne Hinweise mit Grund, Grad und Vorschlag. */
'use strict';
const CHK_MAJOR = ['q', 'h', 'g', 'ch', 'b'];
const CHK_HYP = ['muscle', 'strength', 'hybrid'];
const PLAN_GRADE_TXT = { A: 'Alle gut belegten Regeln erfüllt', B: 'Kleine Abweichungen oder bewusst so gewählt', C: 'Weicht bei einer gut belegten Regel deutlich ab' };
const chkHard = it => it.rpe == null || it.rpe >= 7;
const chkR = v => Math.round(v * 2) / 2;
function chkGoal(plan, ctx) { if (ctx.goal) return ctx.goal; if (plan.gen && plan.gen.goal) return plan.gen.goal; const L2 = typeof LIBRARY !== 'undefined' && LIBRARY[plan.tpl]; if (L2 && L2.goals) return L2.goals[0]; return (ctx.me && (S.settings.q || {}).goal) || 'muscle'; }
function chkSessTitle(s) { const d = sessDef(s) || {}; return $t(s.title || d.title || $t('Einheit')); }
/* Plan einmal durchrechnen: Wochenvolumen (Mittel der normalen Wochen), Volumen pro Einheit, Entlastungswochen, Beintage */
function chkScan(plan) { const prev = S.plan; S.plan = plan; const r = { vol: {}, sv: {}, weeks: [], lite: [], items: {}, leg: {}, pat: { push: 0, pull: 0, knee: 0, hip: 0 } };
  try { const nw = NW(); const wl = w => plan.sessions.reduce((a, s) => a + (s.kind === 'gym' ? planForP(plan, w, s.k).reduce((b, it) => b + (+it.sets || 0) * (it.rpe != null ? it.rpe : 8), 0) : 0), 0);
    let prevL = null; for (let w = 1; w <= nw; w++) { const l = isLite(w), L = wl(w); r.lite.push(l || (prevL != null && L <= prevL * 0.7)); if (!l) r.weeks.push(w); prevL = L; } if (!r.weeks.length) r.weeks = [1];
    Object.keys(MUSCLES).forEach(m => r.vol[m] = 0); const n = r.weeks.length;
    plan.sessions.forEach((s, si) => { if (s.kind !== 'gym') return; r.sv[s.k] = {}; Object.keys(MUSCLES).forEach(m => r.sv[s.k][m] = 0);
      r.weeks.forEach(w => planForP(plan, w, s.k).forEach(it => { const ex = LIB[it.ex]; if (!ex || !chkHard(it)) return; for (const m in ex.muscles) { const x = (+it.sets || 0) * ex.muscles[m] / n; r.vol[m] += x; r.sv[s.k][m] += x; }
        const u = ex.muscles, x = (+it.sets || 0) / n; if ((u.ch || 0) >= 1 || (u.fd || 0) >= 1) r.pat.push += x; if ((u.b || 0) >= 1 || (u.rd || 0) >= 1) r.pat.pull += x; if ((u.q || 0) >= 1) r.pat.knee += x; else if ((u.h || 0) >= 1 || (u.g || 0) >= 1) r.pat.hip += x; }));
      const l = planForP(plan, r.weeks[0], s.k); r.items[s.k] = l.map(it => ({ si, k: s.k, slot: it.slot, ex: it.ex, sets: +it.sets || 0, type: it.type, add: !!(s.add || []).find(a => a.slot === it.slot) }));
      r.leg[s.k] = l.some(p => p.type === 'main' && LIB[p.ex] && ((LIB[p.ex].muscles.q || 0) >= 1 || (LIB[p.ex].muscles.g || 0) >= 1)) || l.filter(p => LIB[p.ex] && ((LIB[p.ex].muscles.q || 0) + (LIB[p.ex].muscles.h || 0) >= 1)).length >= 3; });
    r.phases = []; for (let w = 1; w <= nw; w++) r.phases.push(phase(w));
  } finally { S.plan = prev; }
  return r; }
/* Kandidaten für eine Muskelgruppe: zuerst eigene Übungen, keine Hauptübung, höchster Anteil */
function chkCands(sc, m, k) { const out = []; Object.keys(sc.items).forEach(kk => { if (k && kk !== k) return; sc.items[kk].forEach(it => { const wgt = (LIB[it.ex].muscles || {})[m] || 0; if (wgt >= .5) out.push(Object.assign({ wgt }, it)); }); });
  return out.sort((a, b) => b.wgt - a.wgt || (a.type === 'main') - (b.type === 'main') || b.add - a.add); }
function chkAddSets(sc, m, need, k) { const c = chkCands(sc, m, k), ch = {}; if (!c.length) return null; let got = 0;
  for (let round = 0; round < 2 && got < need; round++) for (const it of c.slice(0, 3)) { if (got >= need) break; const id = it.si + ':' + it.slot; ch[id] = ch[id] || { si: it.si, slot: it.slot, ex: it.ex, from: it.sets, to: it.sets }; ch[id].to++; got += it.wgt; }
  return Object.values(ch); }
function chkCutSets(sc, m, excess, k) { const c = chkCands(sc, m, k), ch = {}; if (!c.length) return null; let cut = 0;
  for (let round = 0; round < 4 && cut < excess; round++) for (const it of c) { if (cut >= excess) break; const id = it.si + ':' + it.slot; ch[id] = ch[id] || { si: it.si, slot: it.slot, ex: it.ex, from: it.sets, to: it.sets }; if (ch[id].to <= 2) continue; ch[id].to--; cut += it.wgt; }
  const out = Object.values(ch).filter(x => x.to !== x.from); return out.length ? out : null; }
function chkSetSets(plan, ch) { const s = plan.sessions[ch.si]; if (!s) return; const a = (s.add || []).find(x => x.slot === ch.slot); const d = ch.to - ch.from;
  if (a) { if (a.wk) a.wk.forEach(e => { if (e && e.sets != null) e.sets = Math.max(1, e.sets + d); }); a.sets = Math.max(1, (+a.sets || ch.from) + d); }
  else { s.ov = s.ov || {}; s.ov[ch.slot] = Object.assign(s.ov[ch.slot] || {}, { sets: ch.to }); } }
const chkChTxt = l => l.map(c => esc(LIB[c.ex] ? LIB[c.ex].name : c.ex) + ': ' + $tf('{a} → {b} Sätze', { a: c.from, b: c.to })).join(' · ');

function checkPlan(plan, ctx) { ctx = ctx || {}; const sc = chkScan(plan), F = [], goal = chkGoal(plan, ctx), hyp = CHK_HYP.includes(goal);
  const gymKs = Object.keys(sc.sv), mus = m => MUSCLES[m], prio = ctx.me ? (S.settings.prio || []) : [];
  const sessOf = k => plan.sessions.find(s => s.k === k);
  const mod = !!(LIBRARY[plan.tpl] && LIBRARY[plan.tpl].module);
  if (gymKs.length && !mod) {
    /* 1. Wochenvolumen pro Muskel */
    CHK_MAJOR.concat(prio.filter(m => !CHK_MAJOR.includes(m))).forEach(m => { const v = sc.vol[m], isP = prio.includes(m) && hyp, lo = isP ? RV('vol_prio')[0] : RV('vol_other')[0];
      if (v >= lo || (!hyp && v >= 1)) return; const need = lo - v;
      F.push({ key: 'vol_low:' + m, rule: isP ? 'vol_prio' : 'vol_other', sev: goal === 'muscle' && v < lo / 2 ? 'bad' : 'warn', title: v < 1 ? $tf('{m} wird nicht trainiert', { m: mus(m) }) : $tf('{m}: wenig Volumen', { m: mus(m) }),
        txt: v < 1 ? $t('Kein harter Satz pro Woche für diese Muskelgruppe.') : $tf('Etwa {v} harte Sätze pro Woche. Belegt sind mindestens {lo}.', { v: fmt(chkR(v)), lo }), ch: chkAddSets(sc, m, need) }); });
    Object.keys(MUSCLES).forEach(m => { const v = sc.vol[m], hi = RV('vol_prio')[1]; if (v <= hi + .5) return;
      F.push({ key: 'vol_high:' + m, rule: 'vol_prio', sev: 'tip', title: $tf('{m}: sehr viel Volumen', { m: mus(m) }), txt: $tf('Etwa {v} harte Sätze pro Woche. Mehr als {hi} lohnen sich laut Studienlage nur in kurzen Spezialisierungsphasen.', { v: fmt(chkR(v)), hi }), ch: chkCutSets(sc, m, v - hi) }); });
    /* 2. Sätze pro Muskel und Einheit */
    const cap = RV('sess_cap');
    gymKs.forEach(k => Object.keys(MUSCLES).forEach(m => { const v = sc.sv[k][m]; if (v <= cap + .5) return; const s = sessOf(k);
      let ch = chkCutSets(sc, m, v - cap, k), other = gymKs.filter(x => x !== k && sc.sv[x][m] + (v - cap) <= cap).sort((a, b) => sc.sv[a][m] - sc.sv[b][m])[0];
      const add = ch && other ? chkAddSets(sc, m, v - cap, other) : null; if (add) ch = ch.concat(add); else other = null;
      F.push({ key: 'sess_cap:' + k + ':' + m, rule: 'sess_cap', sev: v >= cap * 1.5 ? 'bad' : 'warn', title: $tf('{m} in „{s}“: {v} Sätze', { m: mus(m), s: chkSessTitle(s), v: fmt(chkR(v)) }),
        txt: other ? $tf('Ab etwa {c} harten Sätzen pro Einheit bringt jeder weitere Satz weniger. Ein Teil passt besser in „{o}“.', { c: cap, o: chkSessTitle(sessOf(other)) }) : $tf('Ab etwa {c} harten Sätzen pro Einheit bringt jeder weitere Satz weniger. Verteile den Rest auf eine zweite Einheit.', { c: cap }), ch }); }));
    /* 3. Gleichgewicht (App-Setzung, nur Information) */
    const bal = RV('balance'), pair = (a, b, key, t1, t2) => { if (a < 3 && b < 3) return; const q = b ? a / b : 9; if (q >= bal[0] && q <= bal[1]) return;
      F.push({ key: 'balance:' + key, rule: 'balance', sev: 'warn', title: t1, txt: $tf(t2, { a: fmt(chkR(a)), b: fmt(chkR(b)) }) }); };
    pair(sc.pat.push, sc.pat.pull, 'pp', $t('Druck und Zug ungleich verteilt'), 'Druckübungen etwa {a}, Zugübungen etwa {b} harte Sätze pro Woche.');
    if (!(LIBRARY[plan.tpl] && LIBRARY[plan.tpl].focus === 'lower') && !(plan.gen && plan.gen.focus === 'lower')) pair(sc.pat.knee, sc.pat.hip, 'kh', $t('Knie und Hüfte ungleich verteilt'), 'Kniedominante Übungen etwa {a}, hüftdominante etwa {b} harte Sätze pro Woche.');
  }
  /* 4. Entlastung */
  let run = 0, maxRun = 0; sc.lite.forEach(l => { run = l ? 0 : run + 1; maxRun = Math.max(maxRun, run); });
  if (gymKs.length && maxRun > RV('deload_freq')) F.push({ key: 'deload', rule: 'deload_freq', sev: 'warn', title: $t('Lange ohne Entlastung'), txt: $tf('{n} Wochen am Stück ohne Deload. Üblich ist eine leichtere Woche alle 4–8 Wochen.', { n: maxRun }), dl: true });
  /* 5. Kraft und Ausdauer im selben Plan */
  const dm = ctx.dayMap || plan.dayMap || {}, on = d => plan.sessions.filter(s => dm[s.k] !== '' && dm[s.k] != null && +dm[s.k] === d);
  const same = [], adj = [];
  for (let d = 0; d < 7; d++) { const L2 = on(d); if (L2.some(s => s.kind === 'gym') && L2.some(s => s.kind !== 'gym')) same.push(WD_LONG[d]);
    const nx = on((d + 1) % 7); const legA = L2.find(s => s.kind === 'gym' && sc.leg[s.k]), hA = L2.find(s => s.kind === 'hiit'), legB = nx.find(s => s.kind === 'gym' && sc.leg[s.k]), hB = nx.find(s => s.kind === 'hiit');
    if (legA && hB) adj.push([legA, hB, d]); if (hA && legB) adj.push([hA, legB, d]); }
  if (same.length) F.push({ key: 'conc_gap', rule: 'conc_gap', sev: 'tip', title: $t('Kraft und Ausdauer am selben Tag'), txt: $tf('{d}: Lass mindestens {h} Stunden Abstand. Wenn beides direkt hintereinander kommt, mach Kraft zuerst.', { d: same.join(', '), h: RV('conc_gap') }) });
  adj.forEach(([a, b, d]) => F.push({ key: 'conc_legs:' + a.k + b.k, rule: 'conc_legs', sev: 'warn', title: $t('Beintag und harte Intervalle direkt hintereinander'),
    txt: $tf('„{a}“ ({da}) und „{b}“ ({db}) liegen an aufeinanderfolgenden Tagen. Zwischen schwerem Beintraining und harten Intervallen sind {h} Stunden Abstand besser. Verschieb eine der beiden Einheiten.', { a: chkSessTitle(a), b: chkSessTitle(b), da: WD_LONG[d], db: WD_LONG[(d + 1) % 7], h: RV('conc_legs') }) }));
  /* 6. Zielgruppe ab 65 */
  if (ctx.me && myGroups().includes('Ältere') && gymKs.length) { const fr = RV('older_freq'); if (gymKs.length < fr[0] || gymKs.length > fr[1])
    F.push({ key: 'older_freq', rule: 'older_freq', sev: 'warn', title: $tf('{n} Krafteinheiten pro Woche', { n: gymKs.length }), txt: $tf('Ab 65 sind {a}–{b} Krafteinheiten pro Woche am besten belegt.', { a: fr[0], b: fr[1] }) }); }
  /* Grad: D und Tipps zählen nie; A-Regel deutlich verletzt → C; sonst jede Abweichung → B; bewusst gewählte Abweichungen höchstens B */
  const ign = (plan.chk && plan.chk.ign) || []; let g = 'A';
  F.forEach(f => { f.g = RULES[f.rule].g; f.ign = ign.includes(f.key); if (f.g === 'D' || f.sev === 'tip') return; if (f.sev === 'bad' && f.g === 'A' && !f.ign) g = 'C'; else if (g === 'A') g = 'B'; });
  const ord = { bad: 0, warn: 1, tip: 2 }; F.sort((a, b) => a.ign - b.ign || ord[a.sev] - ord[b.sev] || 'ABCD'.indexOf(a.g) - 'ABCD'.indexOf(b.g));
  return { g, items: F, vol: sc.vol, gym: gymKs.length, goal }; }

/* ---------- Anzeige ---------- */
function chkPlanOf(where) { return where === 'gen' ? ui.genPlan : where === 'pe' ? (PE && PE.draft) : null; }
function chkCtxOf(where) { if (where === 'lib') return { goal: ui.chkLibGoal }; if (where === 'pe') { const me = PE.uid === 'me'; return { me, dayMap: me ? S.settings.dayMap : null }; } return { me: !ui.libFor }; }
function chkFindingHTML(f, where) { const gm = gradeMode(f.g), hide = where + '|' + f.key;
  const btns = where === 'lib' ? '' : f.ign ? '<span class="tag">' + $t('bewusst so gewählt') + '</span><button class="btn sm" data-act="chkUnign" data-w="' + where + '" data-key="' + esc(f.key) + '" type="button">' + $t('Doch berücksichtigen') + '</button>'
    : gm === 'info' ? '' : (f.ch || f.dl ? '<button class="btn sm brand" data-act="chkFix" data-w="' + where + '" data-key="' + esc(f.key) + '" type="button">' + $t('Übernehmen') + '</button>' : '') +
      (f.sev === 'tip' ? '' : '<button class="btn sm" data-act="chkIgn" data-w="' + where + '" data-key="' + esc(f.key) + '" type="button">' + $t('Ignorieren') + '</button>') +
      '<button class="btn sm" data-act="chkLater" data-v="' + esc(hide) + '" type="button">' + $t('Später') + '</button>';
  return '<div class="chk-f chk-' + f.sev + (f.ign ? ' chk-ign' : '') + '"><b>' + esc(f.title) + '</b><div style="margin-top:4px">' + gradeTag(f.g) + '</div>' +
    '<p class="small" style="margin:4px 0 0">' + esc(f.txt) + '</p>' + (gm === 'weak' && !f.ign ? '<p class="small muted" style="margin:4px 0 0">' + $t('Erste Hinweise aus der Forschung, noch nicht sicher belegt.') + '</p>' : '') +
    (gm === 'info' ? '<p class="small muted" style="margin:4px 0 0">' + $t('Nur zur Information: eine Setzung der App, keine Studienlage.') + '</p>' : '') +
    (f.ch && !f.ign && gm !== 'info' ? '<p class="small muted" style="margin:4px 0 0">' + $t('Vorschlag: ') + chkChTxt(f.ch) + '</p>' : '') +
    (f.dl && !f.ign ? '<p class="small muted" style="margin:4px 0 0">' + $t('Vorschlag: nach spätestens 8 harten Wochen eine Deload-Woche einbauen.') + '</p>' : '') +
    '<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">' + btns + ruleBtn([f.rule], $t('Warum?')) + (f.ign || where === 'lib' ? '' : '<button class="linkbtn small" data-act="chkHide" data-rule="' + f.rule + '" type="button">' + $t('Diese Art Hinweis nicht mehr zeigen') + '</button>') + '</div></div>'; }
function chkCard__base(plan, where) { if (!plan || !plan.sessions) return ''; const r = checkPlan(plan, chkCtxOf(where)); const open = ui.chkOpen === where;
  const hidR = S.settings.chkHide || {}, later = ui.chkLater || [];
  const vis = r.items.filter(f => !hidR[f.rule] && !later.includes(where + '|' + f.key) && !(evStrict() && (f.g === 'C' || f.g === 'D')));
  const nHid = r.items.length - vis.length, nOpen = r.items.filter(f => !f.ign && f.sev !== 'tip' && f.g !== 'D').length;
  const sum = !r.gym ? $t('Kein Krafttraining im Plan, geprüft werden nur Entlastung und Tagesverteilung.') + ' ' : '';
  const head = '<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div class="grow"><h2 style="margin:0">' + $t('Plan-Prüfung') + '</h2><div class="small muted" style="margin-top:2px">' + esc($t(PLAN_GRADE_TXT[r.g])) +
    (nOpen ? ' · ' + (nOpen === 1 ? $t('1 Hinweis') : $tf('{n} Hinweise', { n: nOpen })) : '') + '</div></div><span class="grade g' + r.g + '" title="' + esc($t(PLAN_GRADE_TXT[r.g])) + '">' + r.g + '</span></div>';
  if (!open) return '<div class="card chk-card">' + head + '<button class="btn sm" style="margin-top:10px" data-act="chkOpen" data-v="' + where + '" type="button">' + $t('Plan prüfen') + '</button></div>';
  return '<div class="card chk-card">' + head + '<p class="small muted" style="margin-top:8px">' + sum + (where === 'lib' ? $t('Diese Note berechnet die App aus den Regeln der Wissensbank. Anpassen kannst du den Plan mit „Vorher anpassen“.') : $t('Geprüft gegen die Regeln aus der Wissensbank. Du entscheidest, was du übernimmst. Nichts wird automatisch geändert.')) + '</p>' + (r.gym ? planHeatmap(r.vol) : '') +
    (vis.length ? vis.map(f => chkFindingHTML(f, where)).join('') : '<p style="margin-top:8px">' + $t('Keine Hinweise. Der Plan hält alle Regeln ein.') + '</p>') +
    (nHid ? '<p class="small muted" style="margin-top:8px">' + $tf('{n} Hinweise ausgeblendet.', { n: nHid }) + ' <button class="linkbtn" data-act="chkShowAll" type="button">' + $t('Wieder zeigen') + '</button></p>' : '') +
    '<div class="row" style="margin-top:10px">' + ruleBtn(['vol_prio', 'vol_other', 'sess_cap', 'conc_gap', 'conc_legs', 'deload_freq', 'balance'], $t('Alle Prüfregeln')) + '<div class="grow"></div><button class="btn sm" data-act="chkOpen" data-v="" type="button">' + $t('Schließen') + '</button></div></div>'; }
function chkCard() { return hbRun('chkCard', this, arguments, chkCard__base); }

document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; if (!a.startsWith('chk')) return;
  const where = b.dataset.w, plan = where ? chkPlanOf(where) : null; const dirty = () => { if (where === 'pe') PE.dirty = true; };
  const find = () => plan && checkPlan(plan, chkCtxOf(where)).items.find(f => f.key === b.dataset.key);
  switch (a) {
    case 'chkOpen': ui.chkOpen = b.dataset.v || null; render(); break;
    case 'chkFix': { const f = find(); if (!f || !(f.ch || f.dl)) break; if (f.dl) chkDeloadFix(plan); else f.ch.forEach(c => chkSetSets(plan, c)); dirty(); toast($t('Übernommen')); render(); break; }
    case 'chkIgn': if (!plan) break; plan.chk = plan.chk || {}; plan.chk.ign = (plan.chk.ign || []).filter(x => x !== b.dataset.key).concat(b.dataset.key); dirty(); render(); break;
    case 'chkUnign': if (!plan || !plan.chk) break; plan.chk.ign = (plan.chk.ign || []).filter(x => x !== b.dataset.key); dirty(); render(); break;
    case 'chkLater': ui.chkLater = (ui.chkLater || []).concat(b.dataset.v); render(); break;
    case 'chkHide': S.settings.chkHide = Object.assign({}, S.settings.chkHide, { [b.dataset.rule]: true }); save(); toast($t('Ausgeblendet. Unter „Wieder zeigen“ holst du es zurück.')); render(); break;
    case 'chkShowAll': S.settings.chkHide = {}; ui.chkLater = []; save(); render(); break;
  } });
/* Deload-Vorschlag: „Übernehmen“ setzt nach spätestens 8 harten Wochen eine Deload-Woche */
function chkDeloadFix(plan) { const prev = S.plan; S.plan = plan; let ph; try { ph = Array.from({ length: NW() }, (_, i) => phase(i + 1)); } finally { S.plan = prev; }
  let run = 0; const lim = RV('deload_freq'); ph = ph.map(p => { const lite = p === 'dl' || p === 'test'; if (lite) { run = 0; return p; } if (++run > lim) { run = 0; return 'dl'; } return p; }); plan.phases = ph; }

/* ---------- 8.4b: Muskel-Heatmap des Plans (harte Sätze pro Woche) ---------- */
const PH_SLUG = { c: ['calves'], h: ['hamstring'], bi: ['biceps'], ab: ['abs', 'obliques'], q: ['quadriceps'], g: ['gluteal'], ch: ['chest'], t: ['triceps'], b: ['upperBack', 'trapezius'] };
const PH_COL = v => v <= 0.05 ? null : v < RV('vol_other')[0] ? '#ffd2bb' : v < RV('vol_prio')[0] ? '#ff9a66' : v <= RV('vol_prio')[1] + .5 ? '#ff5406' : '#a83200';
function planHeatmap(vol) { if (typeof BODY === 'undefined') return ''; const vals = {}; for (const m in PH_SLUG) PH_SLUG[m].forEach(s => vals[s] = Math.max(vals[s] || 0, vol[m] || 0)); vals.deltoids = Math.max(vol.fd || 0, vol.sd || 0, vol.rd || 0);
  const base = '#e3e3e3', skin = '#efefef', MS = new Set(Object.keys(vals));
  const side = key => { const s = BODY[key]; let g = ''; for (const slug in s.parts) { const fill = MS.has(slug) ? (PH_COL(vals[slug]) || base) : skin; s.parts[slug].forEach(d => { g += '<path d="' + d + '" fill="' + fill + '" stroke="#ffffff" stroke-width="2"/>'; }); }
    return '<svg viewBox="' + s.vb + '" role="img" aria-label="' + esc($t('Muskelkarte')) + '">' + g + '</svg>'; };
  const lo = RV('vol_other')[0], p = RV('vol_prio');
  const leg = '<div class="clegend"><span><i style="background:#ffd2bb"></i>' + $tf('unter {n}', { n: lo }) + '</span><span><i style="background:#ff9a66"></i>' + lo + '–' + p[0] + '</span><span><i style="background:#ff5406"></i>' + p[0] + '–' + p[1] + '</span><span><i style="background:#a83200"></i>' + $tf('über {n}', { n: p[1] }) + '</span></div>';
  const list = Object.keys(MUSCLES).filter(m => vol[m] > 0.05).sort((a, b) => vol[b] - vol[a]).map(m => '<span class="chip">' + esc(MUSCLES[m]) + ' ' + fmt(chkR(vol[m])) + '</span>').join('');
  return '<div class="lbl" style="margin-top:10px">' + $t('Harte Sätze pro Muskel und Woche') + '</div><div class="bodymap">' + side('front') + side('back') + '</div>' + leg + (list ? '<div class="chips small-chips" style="margin-top:8px">' + list + '</div>' : ''); }

/* ---------- 8.4b: Grade der Bibliothek berechnen statt von Hand vergeben (Handwert bleibt als ev.hand) ---------- */
function libRegrade() { Object.keys(LIBRARY).forEach(id => { const p = LIBRARY[id]; if (!p.ev) return; try { if (p.ev.hand == null) p.ev.hand = p.ev.g; p.ev.g = checkPlan(makePlan(id), { goal: p.goals[0] }).g; } catch (e) {} }); }
try { libRegrade(); } catch (e) {}
