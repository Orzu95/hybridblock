/* Hybridblock – frei wählbare Plandauer und Planung pro Woche
   - Dauer in Wochen frei wählbar (Nutzer und Coach), Phasen passen sich an (3 Wochen Aufbau + 1 Deload, ab 6 Wochen letzte Woche Test)
   - danach Vorschlag: passenden Plan aus den Angaben erstellen oder selbst bauen
   - einzelne Wochen eigens planen: Standard übernehmen, andere Woche kopieren, leer anlegen, auf folgende Wochen übertragen, zurücksetzen
   - beim Speichern automatische Prüfung gegen die Wissensbank */
'use strict';
const WK_MAX = 52;
function defPhases(n) { const out = []; let blk = 0, run = 0; for (let w = 1; w <= n; w++) { if (n >= 6 && w === n) { out.push('test'); break; } if (n >= 5 && run === 3) { out.push('dl'); run = 0; blk = Math.min(2, blk + 1); continue; } out.push(['b1', 'b2', 'b3'][blk]); run++; } return out; }
function fitPhases(ph, n) { if (!ph || !ph.length) return defPhases(n); if (ph.length === n) return ph.slice(); if (ph.length > n) { const c = ph.slice(0, n); if (n >= 6) c[n - 1] = 'test'; return c; }
  const d = defPhases(n), c = ph.slice(); if (c[c.length - 1] === 'test') c[c.length - 1] = d[c.length - 1] === 'test' ? 'b3' : d[c.length - 1]; for (let i = c.length; i < n; i++) c.push(d[i]); return c; }
function planSetWeeks(p, n) { n = Math.max(1, Math.min(WK_MAX, Math.round(n))); p.phases = fitPhases(p.phases || (p.weeks === 12 || !p.weeks ? defPhases(12) : null), n); p.weeks = n;
  if (p.wkPlans) Object.keys(p.wkPlans).forEach(w => { if (+w > n) delete p.wkPlans[w]; }); return p; }
/* Phase für Wochen über 12 ohne eigene Phasenliste */
const z2Min = w => w <= 12 ? Z2MIN[w - 1] : (phase(w) === 'dl' ? 30 : phase(w) === 'test' ? 40 : 50);
function phaseTxt(p) { const n = p.weeks || 12, prev = S.plan; S.plan = p; let dl = []; try { for (let w = 1; w <= n; w++) if (phase(w) === 'dl') dl.push(w); } finally { S.plan = prev; }
  return n === 1 ? $t('1 Woche') : $tf('{n} Wochen', { n }) + (dl.length ? ' · ' + $tf('Deload in Woche {w}', { w: dl.join(', ') }) : ''); }

/* ---------- Woche eigens planen ---------- */
const wkItemCopy = it => { const o = {}; ['slot', 'ex', 'sets', 'reps', 'rpe', 'rest', 'type', 'note', 'sup', 'grp', 'gm', 'pct'].forEach(f => { if (it[f] != null && it[f] !== '') o[f] = it[f]; }); return o; };
function wkEntry(p, w, k, create) { p.wkPlans = p.wkPlans || {}; const W = p.wkPlans[w] = p.wkPlans[w] || {}; if (!W[k] && create) { W[k] = { k, add: planForP(p, w, k).map(wkItemCopy) }; } if (!Object.keys(W).length && !create) delete p.wkPlans[w]; return W[k] || null; }
const wkHasOwn = (p, w) => !!(p.wkPlans && p.wkPlans[w] && Object.keys(p.wkPlans[w]).length);
function wkCopyTo(p, from, to) { const gym = p.sessions.filter(s => s.kind === 'gym'); p.wkPlans = p.wkPlans || {}; p.wkPlans[to] = {}; gym.forEach(s => { p.wkPlans[to][s.k] = { k: s.k, add: planForP(p, from, s.k).map(wkItemCopy) }; }); }
function wkEmpty(p, w) { p.wkPlans = p.wkPlans || {}; p.wkPlans[w] = {}; p.sessions.filter(s => s.kind === 'gym').forEach(s => { p.wkPlans[w][s.k] = { k: s.k, add: [] }; }); }
function wkReset(p, w) { if (p.wkPlans) { delete p.wkPlans[w]; if (!Object.keys(p.wkPlans).length) delete p.wkPlans; } }
/* Lese-Zugriff (nichts anlegen) und Schreib-Zugriff (beim ersten Ändern wird der Standard dieser Woche übernommen) */
function peSessR(i) { const s = PE.draft.sessions[i]; if (PE.wk && s && s.kind === 'gym' && PE.draft.wkPlans && PE.draft.wkPlans[PE.wk] && PE.draft.wkPlans[PE.wk][s.k]) return PE.draft.wkPlans[PE.wk][s.k]; return s; }
peSess = function (i) { const s = PE.draft.sessions[i]; if (PE.wk && s && s.kind === 'gym') return wkEntry(PE.draft, PE.wk, s.k, true); return s; };
peItems = function (i) { const s = PE.draft.sessions[i]; return planForP(PE.draft, PE.wk || 1, s.k); };

/* ---------- Bausteine im Plan-Editor ---------- */
function peWeeksCard() { if (PE.wkFor !== PE.uid) { PE.wk = 0; PE.wkFor = PE.uid; ui.peWeeksAsk = false; } const p = PE.draft; const n = p.weeks || 12; const w = PE.wk || 0;
  const chips = ['<button class="' + (w ? '' : 'on') + '" data-act="peWk" data-v="0" type="button">' + $t('Alle Wochen') + '</button>'].concat(Array.from({ length: n }, (_, i) => { const ww = i + 1, own = wkHasOwn(p, ww);
    const prev = S.plan; S.plan = p; let ph; try { ph = phase(ww); } finally { S.plan = prev; }
    return '<button class="' + (w === ww ? 'on' : '') + (own ? ' own' : '') + '" data-act="peWk" data-v="' + ww + '" type="button" title="' + esc(PH_LABEL[ph] || '') + '">' + ww + (ph === 'dl' ? ' ↓' : ph === 'test' ? ' ✓' : '') + '</button>'; })).join('');
  const others = Array.from({ length: n }, (_, i) => i + 1).filter(x => x !== w);
  const wkTools = !w ? '<p class="small muted" style="margin-top:8px">' + $t('„Alle Wochen“ ist der Standard. Die App steigert Sätze und Lasten über die Phasen und halbiert in Deload-Wochen automatisch. Tippe auf eine Woche, um sie eigens zu planen.') + '</p>'
    : '<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:10px">' + (wkHasOwn(p, w) ? '<span class="tag">' + $tf('Woche {w} eigens geplant', { w }) + '</span>' : '<span class="small muted">' + $tf('Woche {w} folgt dem Standard. Sobald du etwas änderst, wird sie eigens geplant.', { w }) + '</span>') + '</div>' +
      '<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px"><select id="pe-wkfrom" aria-label="' + esc($t('Woche kopieren aus')) + '">' + others.map(x => '<option value="' + x + '">' + $tf('aus Woche {w}', { w: x }) + '</option>').join('') + '</select><button class="btn sm" data-act="peWkCopy" type="button">' + $t('Übernehmen') + '</button>' +
      '<button class="btn sm" data-act="peWkEmpty" type="button">' + $t('Leer anlegen') + '</button>' + (wkHasOwn(p, w) ? '<button class="btn sm" data-act="peWkReset" type="button">' + $t('Auf Standard zurücksetzen') + '</button>' : '') +
      (w < n ? '<button class="btn sm" data-act="peWkFwd" type="button">' + $tf('Auf Woche {a}–{b} übertragen', { a: w + 1, b: n }) + '</button>' : '') + '</div>';
  const ask = ui.peWeeksAsk ? '<div class="note-card" style="margin-top:10px"><span class="dot sky"></span><div class="grow"><b>' + $tf('{n} Wochen festgelegt.', { n }) + '</b> ' + $t('Soll die App passend zu den Angaben einen Plan für diese Dauer erstellen, oder baust du selbst?') + '<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm brand" data-act="peGenWeeks" type="button">' + $t('Plan erstellen lassen') + '</button><button class="btn sm" data-act="peSelfWeeks" type="button">' + $t('Selbst bauen') + '</button></div></div>' : '';
  return '<div class="card"><div class="row" style="gap:10px;align-items:flex-end"><div class="field" style="margin:0"><label for="pe-weeks">' + $t('Dauer in Wochen') + '</label><input id="pe-weeks" type="number" inputmode="numeric" min="1" max="' + WK_MAX + '" value="' + n + '" style="width:90px"></div><div class="small muted grow" style="padding-bottom:10px">' + esc(phaseTxt(p)) + '</div></div>' + ask +
    '<div class="lbl" style="margin-top:12px">' + $t('Woche planen') + '</div><div class="seg wkseg">' + chips + '</div>' + wkTools + '</div>'; }
/* Angaben für den Generator: eigener Plan, Athlet oder Vorlage */
function peGenQuery() { const u = PE.uid; if (u === 'me') return libQuery();
  if (isTplUid(u)) { const t = tplById(u.slice(4)); const g = (t && t.tags) || {}; return { goal: g.goal || 'muscle', level: g.level || 'intermediate', days: g.days || 3, minutes: 60, place: 'gym', pain: {} }; }
  const r = ADMIN.reqs && ADMIN.reqs[u]; if (r && r.intake) return r.intake; const st = ADMIN.states[u] && ADMIN.states[u].state; const q = (st && st.settings && st.settings.q) || {}; return Object.assign({ goal: 'muscle', level: 'intermediate', days: 3, minutes: 60, place: 'gym', pain: {} }, q); }

/* ---------- Automatische Prüfung beim Speichern ---------- */
const _peSaveWk = peSave;
peSave = async function () { if (typeof checkPlan !== 'function') return _peSaveWk(); const j = JSON.stringify(PE.draft); if (PE.chkOkJ === j) return _peSaveWk();
  const r = checkPlan(PE.draft, chkCtxOf('pe')); const open = r.items.filter(f => !f.ign && f.sev !== 'tip' && f.g !== 'D');
  if (!open.length) { PE.chkOkJ = j; toast($tf('Geprüft: Note {g}', { g: r.g })); return _peSaveWk(); }
  openSheet(sheetHead($t('Plan geprüft')) + '<div class="row" style="margin-top:10px;gap:10px;flex-wrap:nowrap"><span class="grade g' + r.g + '">' + r.g + '</span><p style="margin:0">' + esc($t(PLAN_GRADE_TXT[r.g])) + '</p></div><ul class="rules small" style="margin-top:10px">' + open.map(f => '<li><b>' + esc(f.title) + '</b> ' + gradeTag(f.g) + '</li>').join('') + '</ul>' +
    '<p class="small muted">' + $t('Das sind Hinweise, keine Fehler. Du kannst sie ansehen und übernehmen oder den Plan so speichern.') + '</p><button class="btn brand block" style="margin-top:12px" data-act="peChkShow" type="button">' + $t('Hinweise ansehen') + '</button><button class="btn block" style="margin-top:8px" data-act="peChkSave" type="button">' + $t('So speichern') + '</button>'); };

/* ---------- Ereignisse ---------- */
document.addEventListener('change', e => { const t = e.target;
  if (t.id === 'pe-weeks' && PE.draft) { const n = num(t.value); if (!n) return; planSetWeeks(PE.draft, n); if (PE.wk > PE.draft.weeks) PE.wk = 0; PE.dirty = true; ui.peWeeksAsk = true; render(); }
  if (t.id === 'gen-weeks' && ui.genPlan) { const n = num(t.value); if (!n) return; planSetWeeks(ui.genPlan, n); render(); } });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || !PE.draft && !['peChkShow', 'peChkSave'].includes(b.dataset.act)) return; const p = PE.draft;
  switch (b.dataset.act) {
    case 'peWk': PE.wk = +b.dataset.v || 0; render(); break;
    case 'peWkCopy': { const from = num((document.getElementById('pe-wkfrom') || {}).value); if (!from || !PE.wk) break; wkCopyTo(p, from, PE.wk); PE.dirty = true; toast($tf('Woche {a} in Woche {b} übernommen', { a: from, b: PE.wk })); render(); break; }
    case 'peWkEmpty': if (PE.wk) { wkEmpty(p, PE.wk); PE.dirty = true; render(); } break;
    case 'peWkReset': if (PE.wk) { wkReset(p, PE.wk); PE.dirty = true; render(); } break;
    case 'peWkFwd': { const w = PE.wk, n = p.weeks || 12; if (!w) break; if (!wkHasOwn(p, w)) wkCopyTo(p, w, w); for (let x = w + 1; x <= n; x++) { p.wkPlans[x] = JSON.parse(JSON.stringify(p.wkPlans[w])); } PE.dirty = true; toast($tf('Auf Woche {a}–{b} übertragen', { a: w + 1, b: n })); render(); break; }
    case 'peGenWeeks': { const n = p.weeks || 12; const g = generatePlan(peGenQuery()); planSetWeeks(g, n); g.note = p.note || ''; g.targets = p.targets || null; if (p.name && !/^Plan$/.test(p.name)) g.name = g.name || p.name; PE.draft = g; PE.wk = 0; PE.dirty = true; ui.peWeeksAsk = false; ui.chkOpen = 'pe'; render(); toast($t('Plan erstellt und geprüft')); break; }
    case 'peSelfWeeks': ui.peWeeksAsk = false; render(); break;
    case 'peChkShow': closeSheet(); ui.chkOpen = 'pe'; render(); setTimeout(() => { const c = document.querySelector('.chk-card'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60); break;
    case 'peChkSave': closeSheet(); PE.chkOkJ = JSON.stringify(PE.draft); peSave(); break;
  } });
