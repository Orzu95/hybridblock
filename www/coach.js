/* Hybridblock – Coach-Bereich Teil 1:
   7.1 eigene Vorlagen (speichern, Liste, duplizieren, löschen, zuweisen mit Startdatum, auf Zugewiesene übertragen, für mich aktivieren),
       Autosave als lokaler Entwurf, Rückgängig, Entwurfs-Einheiten (Athlet sieht sie erst nach Freigabe)
   7.7 private Notizen pro Athlet
   7.8 Leistungsverlauf und Lastvorschlag direkt im Plan-Editor */
'use strict';
const clone = o => JSON.parse(JSON.stringify(o));
const isTplUid = u => typeof u === 'string' && u.startsWith('tpl:');
async function loadTpls() { ADMIN.tpls = await api('/rest/v1/coach_templates?coach_id=eq.' + AUTH.uid + '&select=id,name,descr,tags,plan,assigned,updated_at&order=updated_at.desc'); return ADMIN.tpls; }
function tplsNeed() { if (ADMIN.tpls == null && !ADMIN.tplLoading && AUTH) { ADMIN.tplLoading = true; loadTpls().catch(e => { ADMIN.tplErr = errTxt(e); ADMIN.tpls = []; }).finally(() => { ADMIN.tplLoading = false; if (!document.querySelector('input:focus,textarea:focus')) render(); }); } return ADMIN.tpls; }
const tplById = id => (ADMIN.tpls || []).find(t => t.id === id);
function tplClean(p) { const c = clone(p); delete c.assign; delete c.targets; delete c.note; delete c.waiting; delete c.free; delete c.chk; return c; }
const nextMonday = () => { let d = addDays(today(), 1); for (let i = 0; i < 7 && parseISO(d).getDay() !== 1; i++) d = addDays(d, 1); return d; };
const gymCount = p => (p.sessions || []).filter(s => s.kind === 'gym').length;

/* ---------- Vorlagen-Liste ---------- */
function tplTags(t) { const g = t.tags || {}; return [g.goal && GOALS[g.goal], g.level && LEVELS[g.level], g.days && $tf('{n} Tage', { n: g.days })].filter(Boolean).map(x => '<span class="chip">' + esc(x) + '</span>').join(''); }
function viewTemplates() { const L = tplsNeed();
  const card = t => { const n = (t.assigned || []).length; const conf = ui.confirmTpl === t.id;
    return '<div class="card"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div class="grow"><h2 style="margin:0">' + esc(t.name) + '</h2>' + (t.descr ? '<p class="small" style="margin:4px 0 0">' + esc(t.descr) + '</p>' : '') +
      '<p class="small muted" style="margin:4px 0 0">' + (t.plan.sessions || []).length + $t(' Einheiten pro Woche') + ' · ' + (n ? $tf('{n} Athleten zugewiesen', { n }) : $t('noch nicht zugewiesen')) + ' · ' + $t('geändert') + ' ' + esc(ago(t.updated_at)) + '</p>' +
      (tplTags(t) ? '<div class="chips small-chips" style="margin-top:6px">' + tplTags(t) + '</div>' : '') + '</div></div>' +
      '<div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap"><button class="btn sm brand" data-act="tplAssign" data-id="' + t.id + '" type="button">' + $t('Zuweisen') + '</button><a class="btn sm" href="#plan/tpl:' + t.id + '">' + $t('Bearbeiten') + '</a>' +
      '<button class="btn sm" data-act="tplDup" data-id="' + t.id + '" type="button">' + $t('Duplizieren') + '</button><button class="btn sm" data-act="tplMe" data-id="' + t.id + '" type="button">' + (ui.confirmTplMe === t.id ? $t('Wirklich? Ersetzt deinen Plan') : $t('Für mich aktivieren')) + '</button>' +
      '<button class="btn sm danger" data-act="tplDel" data-id="' + t.id + '" type="button">' + (conf ? $t('Wirklich löschen?') : $t('Löschen')) + '</button></div></div>'; };
  return '<a href="#admin" class="back">' + ICON.back + $t('Team') + '</a>' + pageTop($t('Vorlagen'), '', L ? (L.length === 1 ? $t('1 Vorlage') : $tf('{n} Vorlagen', { n: L.length })) : $t('Lade …')) + '<div class="stack">' +
    (ADMIN.tplErr ? note('red', esc(ADMIN.tplErr)) : '') +
    '<div class="row"><button class="btn brand" data-act="tplNew" type="button">' + $t('+ Neue Vorlage') + '</button></div>' +
    (L == null ? '' : L.length ? L.map(card).join('') : '<div class="card"><h2>' + $t('Noch keine Vorlagen') + '</h2><p>' + $t('Bau einen Plan einmal und weise ihn beliebig vielen Athleten zu, jeweils mit eigenem Startdatum. Im Plan-Editor eines Athleten geht das auch über „Als Vorlage speichern“.') + '</p></div>') +
    '<p class="small muted" style="margin:0 4px">' + $t('Was du bei einem einzelnen Athleten anpasst, ändert nie die Vorlage. Änderungen an der Vorlage gelten für neue Zuweisungen. Nur wenn du ausdrücklich „übertragen“ wählst, bekommen auch die zugewiesenen Athleten die neue Version.') + '</p></div>'; }

/* ---------- Als Vorlage speichern ---------- */
function tplSaveSheet() { const p = PE.draft; const tg = { goal: '', level: '', days: gymCount(p) };
  const sel = (id, obj, v) => '<select id="' + id + '"><option value="">–</option>' + Object.keys(obj).map(k => '<option value="' + k + '"' + (k === v ? ' selected' : '') + '>' + esc(obj[k]) + '</option>').join('') + '</select>';
  openSheet(sheetHead($t('Als Vorlage speichern')) + '<div class="fields" style="margin-top:12px"><div class="field" style="flex:1 1 100%"><label for="tpl-name">' + $t('Name') + '</label><input id="tpl-name" type="text" value="' + esc($t(p.name || '')) + '" style="width:100%"></div>' +
    '<div class="field" style="flex:1 1 100%"><label for="tpl-descr">' + $t('Kurze Beschreibung') + '</label><input id="tpl-descr" type="text" placeholder="' + esc($t('z. B. 3 Tage Ganzkörper für Einsteiger')) + '" style="width:100%"></div>' +
    '<div class="field"><label for="tpl-goal">' + $t('Ziel') + '</label>' + sel('tpl-goal', GOALS, tg.goal) + '</div><div class="field"><label for="tpl-level">' + $t('Niveau') + '</label>' + sel('tpl-level', LEVELS, tg.level) + '</div>' +
    '<div class="field"><label for="tpl-days">' + $t('Krafttage pro Woche') + '</label><input id="tpl-days" type="number" inputmode="numeric" value="' + tg.days + '" style="width:80px"></div></div>' +
    '<p class="small muted" style="margin-top:8px">' + $t('Ernährungsziele und die Nachricht an den Athleten werden nicht mitgespeichert.') + '</p>' +
    '<button class="btn brand block" style="margin-top:12px" data-act="tplCreate" type="button">' + $t('Vorlage speichern') + '</button>'); }
async function tplCreate(plan, meta) { const r = await api('/rest/v1/coach_templates', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ name: meta.name || $t('Vorlage'), descr: meta.descr || null, tags: meta.tags || {}, plan: tplClean(plan) }) });
  ADMIN.tpls = [r[0]].concat(ADMIN.tpls || []); return r[0]; }
async function tplPatch(t, fields) { fields.updated_at = new Date().toISOString(); await api('/rest/v1/coach_templates?id=eq.' + t.id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(fields) }); Object.assign(t, fields); }

/* ---------- Zuweisen ---------- */
function tplAssignSheet(id, only) { const t = tplById(id); if (!t) return; const cl = ADMIN.clients || []; const def = nextMonday();
  const row = c => { const on = only ? c.id === only : false; return '<label class="li" style="cursor:default;gap:10px"><input type="checkbox" data-tplu="' + c.id + '"' + (on ? ' checked' : '') + '><div class="grow"><b>' + esc(cname(c)) + '</b><small>' + esc((c.summary && c.summary.plan) ? $t('aktuell: ') + $t(c.summary.plan) : $t('noch kein Plan')) + '</small></div><input type="date" data-tpld="' + c.id + '" value="' + def + '" style="width:150px"></label>'; };
  openSheet(sheetHead($t('Vorlage zuweisen')) + '<p class="muted" style="margin-top:6px"><b>' + esc(t.name) + '</b></p>' +
    (cl.length ? '<div class="card flush" style="margin-top:10px"><div class="list">' + cl.map(row).join('') + '</div></div>' : '<p>' + $t('Noch keine Athleten im Team.') + '</p>') +
    '<p class="small muted" style="margin-top:8px">' + $t('Der neue Plan ersetzt den aktuellen Plan des Athleten und beginnt am gewählten Tag mit Woche 1. Bisherige Einheiten bleiben im Verlauf.') + '</p>' +
    (cl.length ? '<button class="btn brand block" style="margin-top:12px" data-act="tplAssignGo" data-id="' + id + '" type="button">' + $t('Zuweisen') + '</button>' : '')); }
async function tplAssignGo(id) { const t = tplById(id); if (!t) return; const picks = Array.from(document.querySelectorAll('#sheet [data-tplu]:checked')).map(x => ({ uid: x.dataset.tplu, startAt: (document.querySelector('#sheet [data-tpld="' + x.dataset.tplu + '"]') || {}).value || today() }));
  if (!picks.length) { toast($t('Wähle mindestens einen Athleten.')); return; } const at = new Date().toISOString(); let ok = 0;
  for (const p of picks) { const plan = clone(t.plan); plan.assign = { tpl: t.id, at, startAt: p.startAt }; plan.by = 'coach';
    try { await pushPlan(p.uid, plan); ok++; const rq = openReq(p.uid); if (rq) { try { await api('/rest/v1/plan_requests?id=eq.' + rq.id, { method: 'PATCH', body: JSON.stringify({ status: 'done', done_at: at }) }); rq.status = 'done'; } catch (e2) { logErr('coach:55', e2, 1); } }
      t.assigned = (t.assigned || []).filter(a => a.uid !== p.uid).concat({ uid: p.uid, at, startAt: p.startAt }); } catch (e) { toast(errTxt(e)); } }
  try { await tplPatch(t, { assigned: t.assigned }); } catch (e) { logErr('coach:57', e, 1); } closeSheet(); toast($tf('{n} Athleten zugewiesen', { n: ok })); render(); }
/* Vorlage geändert → auf Zugewiesene übertragen (ohne Neustart, Fortschritt bleibt) */
function tplPropagateSheet(t) { const n = (t.assigned || []).length; if (!n) return;
  openSheet(sheetHead($t('Vorlage gespeichert')) + '<p style="margin-top:8px">' + $t('Die Änderung gilt für neue Zuweisungen.') + ' ' + $tf('Willst du sie auch an die {n} zugewiesenen Athleten senden?', { n }) + '</p><p class="small muted">' + $t('Ihr Fortschritt und die Planwoche bleiben erhalten. Was du bei einzelnen Athleten angepasst hast, wird dabei überschrieben.') + '</p>' +
    '<button class="btn brand block" style="margin-top:12px" data-act="tplProp" data-id="' + t.id + '" type="button">' + $t('An alle zugewiesenen senden') + '</button><button class="btn block fog" style="margin-top:8px" data-act="closeSheet" type="button">' + $t('Nur für neue Zuweisungen') + '</button>'); }
async function tplPropagate(id) { const t = tplById(id); if (!t) return; let ok = 0;
  for (const a of t.assigned || []) { const plan = clone(t.plan); plan.assign = { tpl: t.id, at: a.at, startAt: a.startAt }; plan.by = 'coach'; try { await pushPlan(a.uid, plan); ok++; } catch (e) { logErr('coach:63', e, 1); } }
  closeSheet(); toast($tf('An {n} Athleten gesendet', { n: ok })); }

/* ---------- Plan-Editor im Vorlagen-Modus ---------- */
async function openTplEditor(who) { PE.uid = who; PE.dirty = false; PE.confirm = null; PE.draft = null; if (!ADMIN.tpls) { try { await loadTpls(); } catch (e) { toast(errTxt(e)); } }
  const t = tplById(who.slice(4)); if (!t) { PE.draft = makePlan('blank'); PE.name = $t('Neue Vorlage'); PE.tplNew = true; return; } PE.tplNew = false; PE.draft = clone(t.plan); PE.name = t.name; }
async function tplEditorSave() { const p = PE.draft; const id = PE.uid.slice(4); let t = tplById(id);
  try { if (!t) { t = await tplCreate(p, { name: PE.name || p.name, tags: { days: gymCount(p) } }); PE.uid = 'tpl:' + t.id; PE.tplNew = false; history.replaceState(null, '', '#plan/tpl:' + t.id); }
    else await tplPatch(t, { plan: tplClean(p), name: (PE.name || '').trim() || t.name }); PE.dirty = false; peDraftClear(); toast($t('Vorlage gespeichert')); render(); if ((t.assigned || []).length) tplPropagateSheet(t); } catch (e) { toast($t('Speichern fehlgeschlagen: ') + errTxt(e)); } }

/* ---------- Bibliothek für den Coach: eigene Vorlagen oben, unsere Pläne optional ausblenden ---------- */
function coachLibOwn() { if (!ui.libFor || !isAdmin()) return ''; const L = tplsNeed() || []; const own = !!S.settings.coachOwnOnly;
  return '<div class="section-h"><h2>' + $t('Deine Vorlagen') + '</h2></div>' + (L.length ? L.map(t => '<div class="card"><div class="row" style="flex-wrap:nowrap"><div class="grow"><b>' + esc(t.name) + '</b><div class="small muted">' + (t.plan.sessions || []).length + $t(' Einheiten pro Woche') + (t.descr ? ' · ' + esc(t.descr) : '') + '</div></div><button class="btn sm brand" data-act="tplAssign" data-id="' + t.id + '" data-only="' + ui.libFor + '" type="button">' + $t('Zuweisen') + '</button></div></div>').join('')
    : '<p class="small muted" style="margin:0 4px">' + $t('Noch keine eigenen Vorlagen. Unter Team → Vorlagen legst du welche an.') + '</p>') +
    '<label class="row" style="gap:10px;margin:4px"><input type="checkbox" data-act="coachOwnOnly"' + (own ? ' checked' : '') + '> <span>' + $t('Nur eigene Vorlagen anzeigen') + '</span></label>'; }

/* ---------- Autosave als lokaler Entwurf und Rückgängig ---------- */
const PE_KEY = 'hb_pe_draft';
function peDraftClear() { try { localStorage.removeItem(PE_KEY); } catch (e) {} }
function peTrack() { if (route.name !== 'plan' || !PE.draft) return; const j = JSON.stringify(PE.draft); if (j === PE.lastJ) return;
  if (PE.lastJ && PE.lastFor === PE.uid) PE.hist = (PE.hist || []).concat(PE.lastJ).slice(-30); PE.lastJ = j; PE.lastFor = PE.uid;
  if (PE.dirty) { try { localStorage.setItem(PE_KEY, JSON.stringify({ uid: PE.uid, name: PE.name || '', j, at: Date.now() })); } catch (e) {} }
  const u = document.querySelector('[data-act=peUndo]'); if (u) u.disabled = !(PE.hist || []).length; }
let peT = null; document.addEventListener('input', () => { clearTimeout(peT); peT = setTimeout(peTrack, 700); });
['click', 'change'].forEach(ev => document.addEventListener(ev, () => setTimeout(peTrack, 0)));
function peBar() { if (PE.lastFor !== PE.uid) { PE.lastJ = JSON.stringify(PE.draft); PE.lastFor = PE.uid; PE.hist = []; }
  let d = null; try { d = JSON.parse(localStorage.getItem(PE_KEY) || 'null'); } catch (e) {}
  const rest = d && d.uid === PE.uid && !PE.dirty && d.j !== JSON.stringify(PE.draft) && Date.now() - d.at < 14 * 864e5 ? note('amber', $tf('Ungespeicherter Entwurf von {t} gefunden.', { t: ago(new Date(d.at).toISOString()) }), '<button class="btn sm brand" data-act="peRestoreDraft" type="button">' + $t('Wiederherstellen') + '</button><button class="btn sm" data-act="peDropDraft" type="button">' + $t('Verwerfen') + '</button>') : '';
  const tpl = isTplUid(PE.uid);
  return rest + '<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="peUndo" type="button"' + ((PE.hist || []).length ? '' : ' disabled') + '>↶ ' + $t('Rückgängig') + '</button>' +
    (isAdmin() && !tpl ? '<button class="btn sm" data-act="tplFromPe" type="button">' + $t('Als Vorlage speichern') + '</button>' : '') +
    (tpl ? '<div class="field" style="flex:1 1 200px;margin:0"><input type="text" data-act="tplName" value="' + esc(PE.name || '') + '" placeholder="' + esc($t('Name der Vorlage')) + '" aria-label="' + esc($t('Name der Vorlage')) + '" style="width:100%"></div>' : '') +
    '<span class="small muted grow" style="text-align:right">' + (PE.dirty ? $t('Entwurf wird auf diesem Gerät gesichert') : '') + '</span></div>'; }

/* ---------- Entwurfs-Einheiten ---------- */
function peDraftToggle(i) { const s = PE.draft.sessions[i]; if (!s || PE.uid === 'me') return ''; return '<label class="row small" style="gap:8px;margin-top:6px"><input type="checkbox" data-act="peSessDraft" data-si="' + i + '"' + (s.draft ? ' checked' : '') + '> <span>' + $t('Entwurf: Athlet sieht diese Einheit erst nach Freigabe') + '</span></label>'; }

/* ---------- 7.8 Leistungsverlauf im Plan-Editor ---------- */
function peHistState() { const uid = PE.uid; if (uid === 'me') return S; if (!uid || isTplUid(uid)) return null; ADMIN.stObj = ADMIN.stObj || {};
  if (!(uid in ADMIN.stObj)) { if (!ADMIN.stLoading) { ADMIN.stLoading = true; (ADMIN.states[uid] ? Promise.resolve(ADMIN.states[uid]) : loadClientState(uid)).then(r => { ADMIN.stObj[uid] = r && r.state ? loadState(JSON.stringify(r.state)) : null; }).catch(() => { ADMIN.stObj[uid] = null; }).finally(() => { ADMIN.stLoading = false; if (route.name === 'plan') render(); }); } return null; }
  return ADMIN.stObj[uid]; }
function peHistPrep(p) { const st = peHistState(); if (!st || !st.plan) return {}; const ids = new Set(), repsOf = {}; p.sessions.forEach((s, i) => { if (s.kind === 'gym') planForP(p, 1, s.k).forEach(it => { ids.add(it.ex); if (!repsOf[it.ex]) repsOf[it.ex] = it.reps; }); });
  const out = {}; const keep = S, swap = st !== S; try { if (swap) { S = st; applyPlan(); } ids.forEach(id => { const h = exHistory(id); if (h.length) out[id] = h.slice(-3).reverse(); }); } catch (e) { logErr('coach:105', e, 1); } finally { if (swap) { S = keep; applyPlan(); } }
  const html = {}; for (const id in out) { const L = out[id]; const top = o => { const ws = o.sets.filter(x => x.w != null && x.r); const t = ws.length ? ws.reduce((b, x) => (+x.w > +b.w ? x : b), ws[0]) : o.sets[0]; return t ? (t.w != null ? fmt(+t.w) + '×' : '') + (t.r ?? '–') + (t.rpe != null ? ' @' + fmt(+t.rpe) : '') : '–'; };
    const nx = typeof gymNextFor === 'function' ? gymNextFor({ ex: id, reps: repsOf[id] || '', sets: L[0].sets }) : null;
    html[id] = '<div class="pe-hist small"><span class="muted">' + $t('Zuletzt:') + '</span> ' + L.map(o => '<b>' + top(o) + '</b>' + (o.d ? ' <span class="muted">' + fmtDay(o.d) + '</span>' : '')).join(' · ') + (L[0].e1 ? ' · e1RM ' + fmt(Math.round(L[0].e1 * 2) / 2) + ' kg' : '') + (nx && nx.load ? ' · <span class="t-green">' + $tf('nächstes Mal etwa {w} kg', { w: fmt(nx.load) }) + '</span>' : '') + '</div>'; }
  return html; }

/* ---------- 7.7 Notizen pro Athlet ---------- */
function notesCard(uid) { ADMIN.notes = ADMIN.notes || {}; const L = ADMIN.notes[uid];
  if (L === undefined) { ADMIN.notes[uid] = null; api('/rest/v1/athlete_notes?athlete_id=eq.' + uid + '&coach_id=eq.' + AUTH.uid + '&select=id,body,created_at&order=created_at.desc').then(r => { ADMIN.notes[uid] = r || []; }).catch(e => { ADMIN.notes[uid] = []; ADMIN.noteErr = errTxt(e); }).finally(() => { if (route.name === 'admin') render(); }); }
  return '<div class="card"><h2>' + $t('Notizen') + '</h2><p class="small muted">' + $t('Nur für dich sichtbar, dein Athlet sieht sie nie.') + '</p>' +
    '<textarea id="note-new" rows="2" placeholder="' + esc($t('z. B. Knie links empfindlich bei tiefen Kniebeugen')) + '" style="width:100%;margin-top:8px;font-family:var(--f);font-size:15px"></textarea><div class="row" style="margin-top:6px"><div class="grow"></div><button class="btn sm brand" data-act="noteAdd" data-uid="' + uid + '" type="button">' + $t('Notiz speichern') + '</button></div>' +
    (L == null ? '<p class="small muted">' + $t('Lade …') + '</p>' : L.map(n => '<div class="note-i" style="border-top:1px solid var(--rule);padding-top:8px;margin-top:8px"><div class="row"><span class="small muted grow">' + esc(fmtDay(n.created_at.slice(0, 10))) + '</span><button class="linkbtn small" data-act="noteDel" data-id="' + n.id + '" data-uid="' + uid + '" type="button">' + $t('Löschen') + '</button></div><div style="white-space:pre-wrap">' + esc(n.body) + '</div></div>').join('')) + '</div>'; }

/* ---------- Athlet: Startdatum eines zugewiesenen Plans ---------- */
function coachStartNote() { const sa = S.block && S.block.startAt; if (!sa || sa <= today() || S.block.startedOn) return '';
  return note('sky', $tf('Dein neuer Plan „{p}“ startet am {d}. Bis dahin kannst du frei trainieren.', { p: $t(S.plan.name || ''), d: fmtDay(sa) })); }

/* ---------- Klicks ---------- */
document.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  switch (a) {
    case 'tplNew': PE.uid = null; location.hash = '#plan/tpl:new'; break;
    case 'tplAssign': tplsNeed(); if (!ADMIN.clients && isAdmin()) await loadClients(); tplAssignSheet(b.dataset.id, b.dataset.only); break;
    case 'tplAssignGo': b.disabled = true; await tplAssignGo(b.dataset.id); break;
    case 'tplProp': b.disabled = true; await tplPropagate(b.dataset.id); break;
    case 'tplDup': { const t = tplById(b.dataset.id); if (!t) break; try { await tplCreate(t.plan, { name: t.name + $t(' (Kopie)'), descr: t.descr, tags: t.tags }); toast($t('Dupliziert')); render(); } catch (er) { toast(errTxt(er)); } break; }
    case 'tplDel': { const t = tplById(b.dataset.id); if (!t) break; if (ui.confirmTpl !== t.id) { ui.confirmTpl = t.id; render(); break; } try { await api('/rest/v1/coach_templates?id=eq.' + t.id, { method: 'DELETE' }); ADMIN.tpls = ADMIN.tpls.filter(x => x.id !== t.id); ui.confirmTpl = null; toast($t('Vorlage gelöscht')); render(); } catch (er) { toast(errTxt(er)); } break; }
    case 'tplMe': { const t = tplById(b.dataset.id); if (!t) break; if (ui.confirmTplMe !== t.id) { ui.confirmTplMe = t.id; render(); break; } ui.confirmTplMe = null; const p = clone(t.plan); p.name = t.name; switchPlan(p); toast($t('Plan aktiviert')); location.hash = '#training'; break; }
    case 'tplFromPe': tplSaveSheet(); break;
    case 'tplCreate': { const v = id => (document.getElementById(id) || {}).value || ''; b.disabled = true;
      try { const t = await tplCreate(PE.draft, { name: v('tpl-name').trim(), descr: v('tpl-descr').trim(), tags: { goal: v('tpl-goal') || undefined, level: v('tpl-level') || undefined, days: num(v('tpl-days')) || undefined } }); closeSheet(); toast($t('Als Vorlage gespeichert: ') + t.name); } catch (er) { b.disabled = false; toast(errTxt(er)); } break; }
    case 'coachOwnOnly': S.settings.coachOwnOnly = b.checked; save(); render(); break;
    case 'peUndo': { const h = PE.hist || []; if (!h.length) break; PE.draft = JSON.parse(h.pop()); PE.lastJ = JSON.stringify(PE.draft); PE.dirty = true; render(); break; }
    case 'peRestoreDraft': { try { const d = JSON.parse(localStorage.getItem(PE_KEY)); PE.draft = JSON.parse(d.j); PE.dirty = true; PE.lastJ = d.j; render(); } catch (er) { logErr('coach:137', er, 1); } break; }
    case 'peDropDraft': peDraftClear(); render(); break;
    case 'peSessDraft': { const s = PE.draft.sessions[+b.dataset.si]; if (s) { if (b.checked) s.draft = true; else delete s.draft; PE.dirty = true; markPeDirty(); } break; }
    case 'noteAdd': { const ta = document.getElementById('note-new'); const body = ta && ta.value.trim(); if (!body) break; b.disabled = true;
      try { const r = await api('/rest/v1/athlete_notes', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ athlete_id: b.dataset.uid, body }) }); ADMIN.notes[b.dataset.uid] = [r[0]].concat(ADMIN.notes[b.dataset.uid] || []); render(); } catch (er) { b.disabled = false; toast(errTxt(er)); } break; }
    case 'noteDel': try { await api('/rest/v1/athlete_notes?id=eq.' + b.dataset.id, { method: 'DELETE' }); ADMIN.notes[b.dataset.uid] = (ADMIN.notes[b.dataset.uid] || []).filter(n => n.id !== b.dataset.id); render(); } catch (er) { toast(errTxt(er)); } break;
    case 'peDiscard': peDraftClear(); break;
  } });
document.addEventListener('input', e => { const t = e.target; if (t.dataset && t.dataset.act === 'tplName') { PE.name = t.value; PE.dirty = true; markPeDirty(); } });
