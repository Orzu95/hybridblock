/* ======================= PLAN-ABSCHLUSS =======================
   Bilanz des beendeten Plans, kurzer Zielabgleich und drei Wege weiter:
   Empfehlung aus der Bibliothek, neuer Plan aus den Ergebnissen, frei gestalten. */
const NEXT_PLANS = { squatlab: ['bedrock', 'dualdrive'], hightide: ['dualdrive', 'broadside'], bedrock: ['broadside', 'hightide'], broadside: ['bedrock', 'hightide'],
  dualdrive: ['hightide', 'squatlab'], springloaded: ['tripleplay', 'bedrock'], tripleplay: ['bedrock', 'springloaded'], temposhift: ['razor', 'hightide'],
  razor: ['temposhift', 'hybrid'], longhaul: ['hybrid', 'tripleplay'], gk3: ['bedrock', 'tripleplay'], fatloss: ['razor', 'gk3'], hybrid: ['temposhift', 'hightide'],
  c25k: ['vo2', 'hybrid'], vo2: ['hybrid', 'longhaul'], bwrr: ['gk3', 'tripleplay'], lowerfb: ['hightide', 'gk3'] };

function planEndStats() { const W = NW(), cw = curWeek(); let tot = 0, done = 0;
  for (let w = 1; w <= Math.min(W, cw); w++) ORDER.forEach(k => { const p = sessProgress(w, k); if (p.off) return; tot++; if (p.done && !p.skipped) done++; });
  const mains = new Set(), allS = new Set(); for (let w = 1; w <= Math.min(W, cw); w++) GYM().forEach(k => planFor(w, k).forEach(it => { if (!LIB[it.ex]) return; allS.add(it.ex); if (it.type === 'main') mains.add(it.ex); }));
  const lifts = [...mains].map(id => { const ser = liftSeries(id); if (ser.length < 2) return null; const a = ser[0].v, b = Math.max(...ser.map(x => x.v)); return { id, a, b, d: b - a, pct: (b - a) / a * 100 }; }).filter(Boolean).sort((x, y) => y.pct - x.pct);
  const allEx = [...allS];
  const stalls = allEx.filter(id => { try { return !!stallInfo(id, cw); } catch (e) { return false; } });
  const vol = {}; Object.keys(MUSCLES).forEach(m => vol[m] = 0); let nw = 0;
  for (let w = 1; w <= Math.min(W, cw); w++) { if (isLite(w)) continue; const v = weekVolume(w); if (!Object.values(v).some(x => x > 0)) continue; nw++; Object.keys(vol).forEach(m => vol[m] += v[m] || 0); }
  const low = nw ? Object.keys(vol).filter(m => { const min = PRIORITY.includes(m) ? VOL_TARGET.prio[0] : VOL_TARGET.other[0]; return vol[m] / nw < min; }).map(m => ({ m, v: vol[m] / nw })) : [];
  let bw = null; try { const d0 = ORDER.map(k => (peekSess(1, k) || {}).date).filter(Boolean).sort()[0]; const ser = series(); if (d0 && ser.length > 7) { const a = ser.find(x => x.date >= d0), b = ser[ser.length - 1]; if (a && b && a !== b) bw = b.trend - a.trend; } } catch (e) {}
  const avgGain = lifts.length ? lifts.reduce((s, x) => s + x.pct, 0) / lifts.length : 0;
  return { tot, done, rate: tot ? done / tot : 0, lifts, stalls, low, bw, avgGain }; }

function planEndLevelUp(st) { const q = S.settings.q || {}; return q.level === 'beginner' && st.rate >= .75 && st.avgGain >= 5 ? 'intermediate' : null; }

function recommendAfter(q, tpl) { const nxt = NEXT_PLANS[tpl] || [];
  return Object.values(LIBRARY).filter(p => !p.module).map(p => { const r = scorePlan(p, q); let s = r.s; const why = r.why.slice();
    if (nxt.includes(p.id)) { s += 25; why.unshift($t('Passt als nächster Schritt')); } if (q.place === 'gym' && p.place !== 'gym') s -= 15; if (p.id === tpl) { s -= 30; why.push($t('Gleicher Plan wie zuletzt')); }
    return { p, s, why }; }).sort((a, b) => b.s - a.s); }

/* Neuer Plan aus Zielen + Ergebnissen: Stillstand-Übungen tauschen, Muskeln unter Soll bekommen einen Satz mehr. */
function genFromResults(q, st) { const g = generatePlan(q); const stall = new Set(st.stalls), low = new Set(st.low.map(x => x.m)); let swapped = 0, added = 0;
  const per = {}; g.sessions.forEach(s => (s.add || []).forEach(it => { if (stall.has(it.ex)) { const alt = (LIB[it.ex].alts || []).find(a => LIB[a] && exAvailable(a) && !stall.has(a)); if (alt) { it.ex = alt; swapped++; } }
    const mu = (LIB[it.ex] || {}).muscles || {}; const m = Object.keys(mu).find(x => mu[x] >= 1 && low.has(x) && (per[x] || 0) < 2); if (m && it.sets < 5) { it.sets += 1; per[m] = (per[m] || 0) + 1; added++; } }));
  g.fromResults = { swapped, added }; return g; }

function viewPlanEnd() { const st = planEndStats(); const q = S.settings.q || {}; const up = planEndLevelUp(st); const meta = LIBRARY[S.plan.tpl];
  const pct = x => (x >= 0 ? '+' : '') + fmt(x, 1) + ' %';
  const lifts = st.lifts.slice(0, 6).map(x => '<li><b>' + esc(LIB[x.id].name) + ':</b> ' + fmt(x.a, 0) + ' → ' + fmt(x.b, 0) + $t(' kg e1RM') + ' (' + pct(x.pct) + ')</li>').join('');
  const rec = q.goal ? recommendAfter(q, S.plan.tpl).slice(0, 3) : [];
  return '<a href="#training" class="back">' + ICON.back + $t('Training</a>') + pageTop(...$tp('Plan', 'geschafft'), esc($t(S.plan.name))) + '<div class="stack">' +
    $t('<div class="card"><h2>Deine Bilanz</h2><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><div class="k">Einheiten erledigt</div><div class="v">') + Math.round(st.rate * 100) + ' %</div><div class="s">' + st.done + $t(' von ') + st.tot + '</div></div>' +
    $t('<div class="stat"><div class="k">Kraft im Schnitt</div><div class="v">') + (st.lifts.length ? pct(st.avgGain) : '–') + $t('</div><div class="s">e1RM der Hauptübungen</div></div></div>') +
    (lifts ? $t('<h3 style="margin-top:14px">Hauptübungen</h3><ul class="rules small">') + lifts + '</ul>' : $t('<p class="small muted" style="margin-top:12px">Für einen Kraftvergleich fehlen geloggte Sätze.</p>')) +
    (st.bw != null ? '<p class="small" style="margin-top:8px"><b>' + $t('Körpergewicht (Trend):') + '</b> ' + (st.bw >= 0 ? '+' : '') + fmt(st.bw, 1) + $t(' kg') + '</p>' : '') +
    (st.stalls.length ? '<p class="small" style="margin-top:8px"><b>' + $t('Stillstand:') + '</b> ' + esc(st.stalls.map(id => LIB[id].name).join(', ')) + '</p>' : '') +
    (st.low.length ? '<p class="small" style="margin-top:8px"><b>' + $t('Unter dem Wochen-Soll:') + '</b> ' + esc(st.low.map(x => MUSCLES[x.m] + ' (' + fmt(x.v, 0) + ')').join(', ')) + '</p>' : '') + '</div>' +
    $t('<div class="card"><h2>Kurzer Zielabgleich</h2><p class="small muted">Stimmen Ziel, Tage, Zeit und Beschwerden noch? Die Empfehlungen und der neue Plan richten sich danach.</p><p class="small">') +
    (q.goal ? esc([GOALS[q.goal], LEVELS[q.level] || '', q.days ? q.days + $t(' Tage') : '', q.minutes ? q.minutes + $t(' min') : ''].filter(Boolean).join(' · ')) : $t('Noch keine Angaben.')) + '</p>' +
    (up ? note('green', $t('Deine Ergebnisse sprechen für die Stufe „Fortgeschritten“.'), $t('<button class="btn sm" data-act="peLevelUp" type="button">Übernehmen</button>')) : '') +
    $t('<button class="btn block" data-act="peGoals" type="button">Angaben prüfen</button></div>') +
    $t('<div class="section-h"><h2>Wie geht es weiter?</h2></div>') +
    $t('<div class="card"><h3>1. Empfehlung aus der Bibliothek</h3>') + (rec.length ? '<div class="stack" style="margin-top:8px">' + rec.map(r => libCard(r.p, r.why)).join('') + '</div>' : $t('<p class="small muted">Erst Angaben machen, dann kommen Empfehlungen.</p>')) + '</div>' +
    $t('<div class="card"><h3>2. Neuen Plan aus deinen Ergebnissen</h3><p class="small">Aus deinen Angaben erstellt. Übungen mit Stillstand werden getauscht, Muskeln unter dem Soll bekommen mehr Sätze, Startgewichte kommen aus deinen letzten Leistungen.</p><button class="btn brand block" data-act="peGen" type="button">Plan erstellen</button></div>') +
    $t('<div class="card"><h3>3. Frei gestalten</h3><div class="row" style="margin-top:8px"><button class="btn" data-act="peCopy" type="button">Aktuellen Plan wiederholen und anpassen</button><button class="btn" data-act="blankPlan" type="button">Leer starten</button></div></div>') +
    (meta && !(S.plan.phases || []).includes('test') && !isLite(NW()) ? $t('<div class="card"><h3>Erst eine Woche locker?</h3><p class="small">Dein Plan endet ohne Deload. Eine lockere Übergangswoche mit halben Sätzen baut Ermüdung ab, bevor der nächste Plan startet.</p><button class="btn block" data-act="peDeload" type="button">Übergangswoche anhängen</button></div>') : '') +
    '</div>'; }

document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  switch (b.dataset.act) {
    case 'peGoals': goalsSheet(); break;
    case 'peLevelUp': { S.settings.q = Object.assign({}, S.settings.q || {}, { level: 'intermediate' }); save(); toast($t('Stufe angepasst: Fortgeschritten')); render(); break; }
    case 'peGen': { const q = libQuery(); if (!q.goal) { goalsSheet(); break; } ui.genPlan = genFromResults(q, planEndStats()); location.hash = '#library/gen'; break; }
    case 'peCopy': { PE.uid = 'me'; PE.draft = JSON.parse(JSON.stringify(Object.assign({}, S.plan, { mods: S.plan.mods }))); PE.dirty = true; PE.confirm = null; PE.switching = true; location.hash = '#plan/me'; break; }
    case 'peDeload': { const W = NW(); const P = Array.from({ length: W }, (_, i) => phase(i + 1)); P.push('dl'); S.plan.phases = P; S.plan.weeks = W + 1; S.block.week = W + 1; save(); toast($t('Übergangswoche angehängt')); location.hash = '#training'; break; }
  } });
