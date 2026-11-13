/* Hybridblock – 7.4 Gemeinsame Trainings (Termin an der Plan-Einheit) und Live-Eintragen durch den Coach,
   dazu „Plan gemeinsam erstellen“ im Gym: Coach trägt Übung für Übung mit Startgewichten ein,
   daraus wird eine Plan-Einheit, ein Eintrag im Verlauf des Athleten und/oder eine Vorlage. */
'use strict';
const APPT = { list: null, loading: false, seen: null };
const APPT_ST = { proposed: 'ausstehend', confirmed: 'bestätigt', declined: 'abgesagt', cancelled: 'abgesagt', done: 'erledigt' };
const apptMine = a => a.proposed_by === (AUTH && AUTH.uid);
const apptWhen = a => fmtDay(a.date) + ' ' + a.start_t + (a.end_t ? '–' + a.end_t : '');
const apptBadge = a => esc(apptWhen(a)) + (a.place ? ' · ' + esc(a.place) : '') + ' · <b class="ap-' + a.status + '">' + esc($t(APPT_ST[a.status] || a.status)) + '</b>';
/* Einmal laden, danach höchstens einmal neu zeichnen (verhindert eine Endlosschleife beim Laden) */
function apptEnsure(routes) { if (APPT.list != null || APPT.loading) return; apptLoad().then(() => { if (APPT.list != null && routes.includes(route.name)) render(); }); }
async function apptLoad() { if (!AUTH || VIEW || !(isAdmin() || hasCoach()) || APPT.loading) return APPT.list; APPT.loading = true;
  try { const col = isAdmin() ? 'coach_id' : 'athlete_id'; APPT.list = await api('/rest/v1/appointments?' + col + '=eq.' + AUTH.uid + '&date=gte.' + addDays(today(), -14) + '&select=*&order=date.asc,start_t.asc') || [];
    if (!isAdmin()) { apptPins(); apptNotifyNew(); } apptReminders(); } catch (e) { APPT.list = APPT.list || []; } finally { APPT.loading = false; } return APPT.list; }
async function apptPatch(a, f, hist) { f.updated_at = new Date().toISOString(); if (hist) f.history = (a.history || []).concat(Object.assign({ at: f.updated_at, by: AUTH.uid }, hist));
  await api('/rest/v1/appointments?id=eq.' + a.id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(f) }); Object.assign(a, f); if (!isAdmin()) apptPins(); apptReminders(); }
/* Athlet: bestätigter Termin legt die Einheit auf diesen Tag (nutzt das vorhandene Festlegen der Wochenplanung) */
function apptPins() { let ch = false; (APPT.list || []).forEach(a => { if (!a.w || !a.k || !SESS[a.k]) return; const s = peekSess(a.w, a.k); const done = sessProgress(a.w, a.k).done;
  if (a.status === 'confirmed' && !done) { const t = sess(a.w, a.k); if (t.pin !== a.date || t.apptId !== a.id) { t.pin = a.date; t.apptId = a.id; ch = true; } }
  else if (s && s.apptId === a.id && a.status !== 'confirmed' && a.status !== 'done') { delete s.pin; delete s.apptId; ch = true; } }); if (ch) save(); }
function apptNotifyNew() { const seen = S.meta.apptSeen || {}; (APPT.list || []).forEach(a => { const key = a.id + ':' + a.updated_at; if (seen[a.id] === key || apptMine(a)) return; seen[a.id] = key;
  if (typeof hbNotify === 'function' && a.status === 'proposed') hbNotify('own', 900 + (Object.keys(seen).length % 90), $t('Gemeinsames Training'), $tf('Dein Coach schlägt {d} vor.', { d: apptWhen(a) })); }); S.meta.apptSeen = seen; persist(); }
/* Erinnerungen 24 h und 60 min vorher (nur in der Android-App) */
async function apptReminders() { const N = NOTIF.p; if (!N) return; const L = (APPT.list || []).filter(a => a.status === 'confirmed'); const ids = [];
  for (const a of L) { const at = new Date(a.date + 'T' + a.start_t + ':00'); const base = 5000 + (parseInt(a.id.replace(/-/g, '').slice(0, 6), 16) % 40000) * 2;
    [[24 * 3600e3, $t('Morgen: gemeinsames Training')], [3600e3, $t('In 1 Stunde: gemeinsames Training')]].forEach(([ms, t], i) => { const when = new Date(at.getTime() - ms); if (when > new Date()) ids.push({ id: base + i, title: t, body: apptWhen(a) + (a.place ? ' · ' + a.place : ''), channelId: isAdmin() ? 'coaching' : 'own', schedule: { at: when, allowWhileIdle: true } }); }); }
  try { if (typeof hbChannels === 'function') await hbChannels(); const st = await N.checkPermissions(); if (st.display !== 'granted') return; if (ids.length) await N.schedule({ notifications: ids }); } catch (e) {} }
function apptIcs(a, who) { const dt = (d, t) => d.replace(/-/g, '') + 'T' + (t || '00:00').replace(':', '') + '00'; const end = a.end_t || (() => { const [h, m] = a.start_t.split(':').map(Number); return String((h + 1) % 24).padStart(2, '0') + ':' + String(m).padStart(2, '0'); })();
  const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hybridblock//DE', 'BEGIN:VEVENT', 'UID:' + a.id + '@hybridblock', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', 'DTSTART:' + dt(a.date, a.start_t), 'DTEND:' + dt(a.date, end),
    'SUMMARY:' + $t('Gemeinsames Training') + (who ? ' – ' + who : '') + (a.title ? ' (' + $t(a.title) + ')' : ''), a.place ? 'LOCATION:' + a.place.replace(/[,;]/g, ' ') : '', a.note ? 'DESCRIPTION:' + a.note.replace(/\n/g, ' ') : '', 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
  const blob = new Blob([txt], { type: 'text/calendar' }); const f = new File([blob], 'training.ics', { type: 'text/calendar' });
  if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], title: $t('Gemeinsames Training') }).catch(() => {}); return; }
  const u = URL.createObjectURL(blob); const l = document.createElement('a'); l.href = u; l.download = 'training.ics'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); }

/* ---------- Coach: Termin anlegen / verschieben ---------- */
let apptAthPlan = {};
async function apptAthletePlan(uid2) { if (apptAthPlan[uid2]) return apptAthPlan[uid2]; try { const r = await api('/rest/v1/plans?user_id=eq.' + uid2 + '&select=plan'); apptAthPlan[uid2] = r && r[0] && r[0].plan || null; } catch (e) { apptAthPlan[uid2] = null; } return apptAthPlan[uid2]; }
async function apptSheet(uid2, existing) { const plan = await apptAthletePlan(uid2); const c = (ADMIN.clients || []).find(x => x.id === uid2); const s = (c && c.summary) || {}; const a = existing || {};
  const sess = plan ? plan.sessions.filter(x => x.kind === 'gym' || x.kind === 'hiit') : []; const def = d => (sessDef(d) || {}).title || '';
  openSheet(sheetHead(existing ? $t('Neue Zeit vorschlagen') : $t('Gemeinsames Training planen')) + '<div class="fields" style="margin-top:12px">' +
    (existing ? '' : '<div class="field" style="flex:1 1 100%"><label for="ap-k">' + $t('Einheit aus dem Plan') + '</label><select id="ap-k" style="width:100%"><option value="">' + $t('ohne feste Einheit') + '</option>' + sess.map(x => '<option value="' + x.k + '">' + esc(x.k + ' · ' + $t(x.title || def(x))) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="ap-w">' + $t('Planwoche') + '</label><input id="ap-w" type="number" inputmode="numeric" min="1" value="' + (s.week || 1) + '" style="width:80px"></div>') +
    '<div class="field"><label for="ap-d">' + $t('Datum') + '</label><input id="ap-d" type="date" value="' + (a.date || addDays(today(), 1)) + '"></div><div class="field"><label for="ap-s">' + $t('Beginn') + '</label><input id="ap-s" type="time" value="' + (a.start_t || '17:00') + '"></div><div class="field"><label for="ap-e">' + $t('Ende') + '</label><input id="ap-e" type="time" value="' + (a.end_t || '18:00') + '"></div>' +
    (existing ? '' : '<div class="field" style="flex:1 1 100%"><label for="ap-p">' + $t('Ort oder Online-Link') + '</label><input id="ap-p" type="text" value="' + esc(S.settings.lastPlace || '') + '" style="width:100%"></div><div class="field" style="flex:1 1 100%"><label for="ap-n">' + $t('Notiz (optional)') + '</label><input id="ap-n" type="text" style="width:100%"></div>') + '</div>' +
    '<div id="ap-warn"></div><div class="stack" style="margin-top:12px"><button class="btn brand block" data-act="apSave" data-uid="' + uid2 + '" data-id="' + (a.id || '') + '" data-v="proposed" type="button">' + (existing ? $t('Neue Zeit vorschlagen') : $t('Termin vorschlagen')) + '</button>' +
    '<button class="btn block" data-act="apSave" data-uid="' + uid2 + '" data-id="' + (a.id || '') + '" data-v="confirmed" type="button">' + $t('Direkt als bestätigt eintragen') + '</button></div>'); apptOverlap(); }
function apptOverlap() { const d = (document.getElementById('ap-d') || {}).value, s = (document.getElementById('ap-s') || {}).value, e = (document.getElementById('ap-e') || {}).value || s, box = document.getElementById('ap-warn'); if (!box) return;
  const hit = (APPT.list || []).filter(a => a.date === d && ['proposed', 'confirmed'].includes(a.status) && a.start_t < e && (a.end_t || a.start_t) > s);
  let own = false; try { own = typeof wkPlan === 'function' && wkPlan(curWeek()).items.some(o => o.date === d && o.st !== 'done'); } catch (e) {}
  box.innerHTML = (hit.length ? note('amber', $tf('Überschneidung mit {n} anderem gemeinsamen Training an diesem Tag.', { n: hit.length })) : '') + (own ? note('sky', $t('An diesem Tag steht auch ein eigenes Training von dir im Plan.')) : ''); }
async function apptSave(uid2, id, status) { const v = x => (document.getElementById(x) || {}).value || ''; const d = v('ap-d'), st = v('ap-s'), en = v('ap-e'); if (!d || !st) { toast($t('Datum und Beginn angeben.')); return; }
  if (id) { const a = APPT.list.find(x => x.id === id); await apptPatch(a, { date: d, start_t: st, end_t: en || null, status, proposed_by: AUTH.uid }, { t: 'move', date: d, start_t: st }); }
  else { const plan = apptAthPlan[uid2]; const k = v('ap-k'); const s0 = plan && plan.sessions.find(x => x.k === k); const place = v('ap-p').trim(); if (place) { S.settings.lastPlace = place; save(); }
    const row = { coach_id: AUTH.uid, athlete_id: uid2, w: k ? num(v('ap-w')) || 1 : null, k: k || null, title: s0 ? (s0.title || (sessDef(s0) || {}).title || null) : null, date: d, start_t: st, end_t: en || null, place: place || null, note: v('ap-n').trim() || null, status, history: [{ at: new Date().toISOString(), by: AUTH.uid, t: 'new' }] };
    const r = await api('/rest/v1/appointments', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) }); APPT.list = (APPT.list || []).concat(r[0]); apptReminders(); }
  closeSheet(); toast(status === 'confirmed' ? $t('Termin eingetragen') : $t('Termin vorgeschlagen')); render(); }

/* ---------- Absagen / Lösen (löscht nie die Einheit) ---------- */
function apptCancelSheet(id) { openSheet(sheetHead($t('Termin absagen')) + '<p class="small muted" style="margin-top:6px">' + $t('Die Einheit selbst bleibt im Plan. Nur der gemeinsame Termin entfällt.') + '</p>' +
  '<div class="field" style="margin-top:10px"><label for="ap-r">' + $t('Grund (optional, für beide sichtbar)') + '</label><input id="ap-r" type="text" style="width:100%"></div>' +
  '<div class="stack" style="margin-top:12px"><button class="btn brand block" data-act="apCancel" data-id="' + id + '" data-v="solo" type="button">' + $t('Absagen, Einheit allein machen') + '</button>' +
  '<button class="btn block" data-act="apCancel" data-id="' + id + '" data-v="skip" type="button">' + $t('Absagen und Einheit als ausgefallen markieren') + '</button></div>'); }

/* ---------- Karten ---------- */
function apptRow(a, coachSide) { const c = coachSide && (ADMIN.clients || []).find(x => x.id === a.athlete_id); const who = coachSide ? (c ? cname(c) : '') : $t('mit deinem Coach');
  const act = []; const B = (k, l, cls) => act.push('<button class="btn sm' + (cls ? ' ' + cls : '') + '" data-act="' + k + '" data-id="' + a.id + '" type="button">' + l + '</button>');
  if (a.status === 'proposed' && !apptMine(a)) { B('apYes', $t('Zusagen'), 'brand'); B('apMove', $t('Andere Zeit')); B('apNo', $t('Absagen')); }
  else if (a.status === 'proposed') act.push('<span class="small muted">' + (coachSide ? $t('wartet auf Zusage') : $t('wartet auf deinen Coach')) + '</span>');
  if (a.status === 'confirmed') { if (coachSide && a.date === today()) B('apStart', $t('Starten'), 'brand'); B('apIcs', $t('In Kalender')); B('apMove', $t('Verschieben')); B('apNo', $t('Absagen')); }
  return '<div class="appt"><div><b>' + esc(who) + '</b>' + (a.title ? ' · ' + esc($t(a.title)) + (a.w ? ' · ' + $t('Woche ') + a.w : '') : '') + '</div><div class="small">' + apptBadge(a) + '</div>' + (a.note ? '<div class="small muted">' + esc(a.note) + '</div>' : '') + (a.reason ? '<div class="small muted">' + $t('Grund: ') + esc(a.reason) + '</div>' : '') +
    (act.length ? '<div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap">' + act.join('') + '</div>' : '') + '</div>'; }
const apptUpcoming = (pred) => (APPT.list || []).filter(a => a.date >= today() && ['proposed', 'confirmed'].includes(a.status) && (!pred || pred(a)));
function apptHeuteCard() { if (VIEW || isAdmin() || !hasCoach()) return ''; if (APPT.list == null) { apptEnsure(['heute']); return ''; }
  const L = apptUpcoming(a => a.date <= addDays(today(), 7)); if (!L.length) return '';
  return '<div class="card"><h2>' + $t('Gemeinsames Training') + '</h2>' + L.map(a => apptRow(a, false)).join('') + '</div>'; }
function apptCoachCard() { if (!isAdmin()) return ''; if (APPT.list == null) { apptEnsure(['admin', 'heute']); return ''; }
  const L = apptUpcoming(a => a.date <= addDays(today(), 6)); return '<div class="section-h"><h2>' + $t('Gemeinsame Trainings') + '</h2></div>' + (L.length ? '<div class="card">' + L.map(a => apptRow(a, true)).join('') + '</div>' : '<p class="small muted" style="margin:0 4px">' + $t('Diese Woche keine gemeinsamen Trainings. Planen kannst du sie in der Athletenansicht.') + '</p>'); }
function apptClientCard(uid2) { const L = (APPT.list || []).filter(a => a.athlete_id === uid2 && a.date >= today() && ['proposed', 'confirmed'].includes(a.status));
  if (APPT.list == null) apptEnsure(['admin']);
  return '<div class="card"><h2>' + $t('Gemeinsam trainieren') + '</h2>' + (L.length ? L.map(a => apptRow(a, true)).join('') : '<p class="small muted">' + $t('Noch kein Termin geplant.') + '</p>') +
    '<div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap"><button class="btn brand sm" data-act="apNew" data-uid="' + uid2 + '" type="button">' + $t('+ Gemeinsames Training planen') + '</button><button class="btn sm" data-act="coBuild" data-uid="' + uid2 + '" type="button">' + $t('Plan gemeinsam erstellen') + '</button></div>' +
    '<p class="small muted" style="margin-top:8px">' + $t('„Plan gemeinsam erstellen“: Ihr geht im Gym Übung für Übung durch, du trägst Sätze und auf Wunsch Startgewichte ein. Daraus wird eine Einheit im Plan, ein Eintrag im Verlauf deines Athleten oder eine Vorlage.') + '</p></div>'; }
function apptSessBadge(w, k) { const a = (APPT.list || []).find(x => x.w === w && x.k === k && ['proposed', 'confirmed'].includes(x.status)); return a ? note(a.status === 'confirmed' ? 'sky' : 'amber', '<b>' + $t('Gemeinsames Training') + ':</b> ' + apptBadge(a)) : ''; }

/* ---------- Coach trägt live ein (gemeinsames Training oder Plan gemeinsam erstellen) ---------- */
function coLogStart(uid2, opts) { const c = (ADMIN.clients || []).find(x => x.id === uid2); const a = newActivity('kraft'); a.coachFor = uid2; a.coachName = c ? cname(c) : ''; a.t0 = Date.now(); a.title = opts.title || null; a.withLoads = opts.build ? true : true;
  if (opts.appt) { a.appt = opts.appt.id; a.w = opts.appt.w; a.k = opts.appt.k; }
  a.build = !!opts.build; a.exercises = (opts.items || []).map(it => ({ ex: it.ex, slot: it.slot, sets: Array.from({ length: Math.max(1, num(it.sets) || 3) }, () => ({})), reps: it.reps || '8–12', rpe: it.rpe, rest: it.rest || 90 }));
  save(); location.hash = '#frei/' + a.id; if (!a.exercises.length) setTimeout(() => exPickSheet(a.id), 150); }
function coBanner(a) { if (!a.coachFor) return ''; return note('sky', '<b>' + $tf('Für {n}', { n: a.coachName || $t('deinen Athleten') }) + '</b> · ' + (a.build ? $t('Plan gemeinsam erstellen. Trag Übungen, Sätze und Startgewichte ein.') : $t('Gemeinsames Training. Was du einträgst, landet im Verlauf deines Athleten.')) +
  (a.build ? '<label class="row small" style="gap:8px;margin-top:6px;flex-wrap:nowrap"><input type="checkbox" data-act="coLoads" data-aid="' + a.id + '"' + (a.withLoads ? ' checked' : '') + '> <span>' + $t('Gewichte als Startgewichte beim Athleten verbuchen') + '</span></label>' : '')); }
function coFinishSheet(a) { const sets = (a.exercises || []).reduce((s, e) => s + (e.sets || []).filter(x => x && (x.done || x.r != null)).length, 0);
  openSheet(sheetHead($t('Fertig')) + '<p class="muted" style="margin-top:6px">' + esc(a.coachName || '') + ' · ' + $tf('{e} Übungen · {s} Sätze', { e: (a.exercises || []).length, s: sets }) + '</p><div class="stack" style="margin-top:12px">' +
    (a.build ? '<button class="btn brand block" data-act="coToPlan" data-aid="' + a.id + '" type="button">' + $t('Als Einheit in den Plan übernehmen') + '</button>' : '') +
    ((!a.build || a.withLoads) && sets ? '<button class="btn ' + (a.build ? '' : 'brand ') + 'block" data-act="coSend" data-aid="' + a.id + '" type="button">' + (a.build ? $t('Startgewichte beim Athleten verbuchen') : $t('Ins Konto des Athleten übertragen')) + '</button>' : '') +
    '<button class="btn block" data-act="coTpl" data-aid="' + a.id + '" type="button">' + $t('Als Vorlage speichern') + '</button>' +
    '<button class="btn block fog" data-act="coDone" data-aid="' + a.id + '" type="button">' + $t('Abschließen') + '</button></div><p class="small muted" style="margin-top:8px">' + $t('„Abschließen“ entfernt die Einträge von deinem Gerät. Was du übertragen oder gespeichert hast, bleibt erhalten.') + '</p>'); }
async function coSend(a) { const ex = (a.exercises || []).map(e => ({ ex: e.ex, slot: e.slot || null, reps: e.reps, rpe: e.rpe ?? null, sets: (e.sets || []).filter(x => x && (x.done || x.r != null)).map(x => ({ w: x.w ?? null, r: x.r ?? null, rpe: x.rpe ?? null, done: true })) })).filter(e => e.sets.length);
  const kind = a.appt && a.k ? 'sess' : 'act'; const payload = { date: a.date, dur: num(a.dur) || (a.t0 ? Math.round((Date.now() - a.t0) / 60000) : null), w: a.w || null, k: a.k || null, title: a.title || null, note: a.note || null, ex };
  await api('/rest/v1/coach_inbox', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ athlete_id: a.coachFor, kind, payload }) });
  if (a.appt) { const ap = (APPT.list || []).find(x => x.id === a.appt); if (ap) try { await apptPatch(ap, { status: 'done' }, { t: 'done' }); } catch (e) { logErr('appt:101', e, 1); } } a.sent = true; save(); }
async function coToPlan(a) { const uid2 = a.coachFor; const r = await api('/rest/v1/plans?user_id=eq.' + uid2 + '&select=plan'); const plan = r && r[0] && r[0].plan ? r[0].plan : makePlan('blank');
  const k = nextKey(plan); const add = (a.exercises || []).map(e => { const done = (e.sets || []).filter(x => x && (x.done || x.r != null)); const reps = done.length ? (Math.min(...done.map(x => num(x.r) || 0)) + '–' + Math.max(...done.map(x => num(x.r) || 0))).replace(/^(\d+)–\1$/, '$1') : e.reps;
    return { slot: 'g_' + uid(), ex: e.ex, sets: Math.max(1, done.length || (e.sets || []).length), reps: reps || '8–12', rpe: num(e.rpe) || 8, rest: e.rest || 90, type: 'dp' }; });
  plan.sessions.push({ k, kind: 'gym', title: a.title || $tf('Einheit {k}', { k }), add }); PE.uid = uid2; PE.draft = plan; PE.name = a.coachName || ''; PE.dirty = true; PE.confirm = null; a.planned = true; save(); closeSheet(); location.hash = '#plan/' + uid2; toast($t('Einheit hinzugefügt. Speichern nicht vergessen.')); }
/* ---------- Athlet: Einträge des Coaches übernehmen ---------- */
async function inboxPull() { if (!AUTH || VIEW || isAdmin() || !hasCoach()) return; let r; try { r = await api('/rest/v1/coach_inbox?athlete_id=eq.' + AUTH.uid + '&applied_at=is.null&select=id,kind,payload,created_at&order=created_at.asc'); } catch (e) { return; } if (!r || !r.length) return;
  for (const m of r) { const p = m.payload || {}; try {
    if (m.kind === 'sess' && p.w && p.k && SESS[p.k]) { const s = sess(p.w, p.k); const spec = planFor(p.w, p.k); s.logs = s.logs || {};
      (p.ex || []).forEach(e => { const slot = (e.slot && spec.some(x => x.slot === e.slot)) ? e.slot : ((spec.find(x => x.ex === e.ex) || {}).slot || ('c_' + uid())); s.logs[slot] = { ex: e.ex, sets: e.sets }; });
      s.date = p.date; s.coach = true; if (p.dur) { s.end = s.end || {}; s.end.dur = String(p.dur); } }
    else { const a = { id: uid(), type: 'kraft', date: p.date || today(), week: curWeek(), src: 'coach', title: p.title || $t('Mit Coach'), dur: p.dur ? String(p.dur) : '', note: p.note || '', exercises: (p.ex || []).map(e => ({ ex: e.ex, reps: e.reps, rpe: e.rpe, sets: e.sets })) }; S.activities.push(a); }
    await api('/rest/v1/coach_inbox?id=eq.' + m.id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ applied_at: new Date().toISOString() }) }); } catch (e) { logErr('appt:108', e, 1); } }
  save(); toast($t('Dein Coach hat Training für dich eingetragen.')); render(); }

/* ---------- Abruf ---------- */
setTimeout(() => { apptLoad(); inboxPull(); }, 3500);
setInterval(() => { if (document.visibilityState === 'visible') { apptLoad().then(() => { if (['heute', 'admin', 'training'].includes(route.name) && !document.querySelector('input:focus,textarea:focus,select:focus') && !document.querySelector('#sheet:not([hidden]) input')) render(); }); inboxPull(); } }, 90000);

/* ---------- Klicks ---------- */
document.addEventListener('input', e => { if (['ap-d', 'ap-s', 'ap-e'].includes(e.target.id)) apptOverlap(); });
document.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const act = b.dataset.act; if (!/^(ap|co)[A-Z]/.test(act)) return;
  const a = b.dataset.id && (APPT.list || []).find(x => x.id === b.dataset.id); const fa = b.dataset.aid && findAct(b.dataset.aid);
  try { switch (act) {
    case 'apNew': await apptSheet(b.dataset.uid); break;
    case 'apSave': b.disabled = true; await apptSave(b.dataset.uid, b.dataset.id || null, b.dataset.v); break;
    case 'apYes': await apptPatch(a, { status: 'confirmed', reason: null }, { t: 'yes' }); toast($t('Zugesagt')); render(); break;
    case 'apMove': if (isAdmin()) await apptSheet(a.athlete_id, a); else { openSheet(sheetHead($t('Andere Zeit vorschlagen')) + '<div class="fields" style="margin-top:12px"><div class="field"><label for="ap-d">' + $t('Datum') + '</label><input id="ap-d" type="date" value="' + a.date + '"></div><div class="field"><label for="ap-s">' + $t('Beginn') + '</label><input id="ap-s" type="time" value="' + a.start_t + '"></div><div class="field"><label for="ap-e">' + $t('Ende') + '</label><input id="ap-e" type="time" value="' + (a.end_t || '') + '"></div></div><button class="btn brand block" style="margin-top:12px" data-act="apCounter" data-id="' + a.id + '" type="button">' + $t('Vorschlagen') + '</button>'); } break;
    case 'apCounter': { const v = x => (document.getElementById(x) || {}).value || ''; await apptPatch(a, { date: v('ap-d'), start_t: v('ap-s'), end_t: v('ap-e') || null, status: 'proposed', proposed_by: AUTH.uid }, { t: 'move', date: v('ap-d'), start_t: v('ap-s') }); closeSheet(); toast($t('Neue Zeit vorgeschlagen')); render(); break; }
    case 'apNo': apptCancelSheet(a.id); break;
    case 'apCancel': { const reason = ((document.getElementById('ap-r') || {}).value || '').trim() || null; await apptPatch(a, { status: isAdmin() ? 'cancelled' : 'declined', reason }, { t: 'cancel', reason });
      if (!isAdmin() && b.dataset.v === 'skip' && a.w && a.k && SESS[a.k]) { const s = sess(a.w, a.k); s.skipped = true; s.skipWhy = 'other'; delete s.pin; save(); }
      closeSheet(); toast(b.dataset.v === 'skip' ? $t('Abgesagt, Einheit als ausgefallen markiert') : $t('Abgesagt. Die Einheit bleibt in deinem Plan.')); render(); break; }
    case 'apIcs': { const c = isAdmin() && (ADMIN.clients || []).find(x => x.id === a.athlete_id); apptIcs(a, c ? cname(c) : $t('Coach')); break; }
    case 'apStart': { const plan = await apptAthletePlan(a.athlete_id); let items = []; if (plan && a.k) { const prev = S.plan; S.plan = plan; try { items = planForP(plan, a.w || 1, a.k); } finally { S.plan = prev; } }
      coLogStart(a.athlete_id, { appt: a, items, title: a.title }); break; }
    case 'coBuild': coLogStart(b.dataset.uid, { build: true, title: $t('Gemeinsam erstellt') }); break;
    case 'coLoads': if (fa) { fa.withLoads = b.checked; save(); } break;
    case 'coToPlan': if (fa) await coToPlan(fa); break;
    case 'coSend': if (fa) { b.disabled = true; await coSend(fa); toast($tf('An {n} übertragen', { n: fa.coachName || '' })); coFinishSheet(fa); } break;
    case 'coTpl': if (fa && typeof tplCreate === 'function') { const p = makePlan('blank'); p.sessions = [{ k: 'A', kind: 'gym', title: fa.title || 'A', add: (fa.exercises || []).map(e => ({ slot: 'g_' + uid(), ex: e.ex, sets: Math.max(1, (e.sets || []).length), reps: e.reps || '8–12', rpe: num(e.rpe) || 8, rest: e.rest || 90, type: 'dp' })) }];
      const t = await tplCreate(p, { name: (fa.title || $t('Vorlage')) + ' · ' + fmtDay(fa.date), tags: { days: 1 } }); toast($t('Als Vorlage gespeichert: ') + t.name); } break;
    case 'coDone': if (fa) { S.activities = S.activities.filter(x => x.id !== fa.id); save(); closeSheet(); location.hash = '#admin/' + fa.coachFor; } break;
  } } catch (er) { b.disabled = false; toast(errTxt(er)); } });

/* „Training beenden“ bei Coach-Einträgen: eigenes Abschluss-Fenster */
if (typeof gymFinish === 'function') { const _gymFinishCo = gymFinish; gymFinish = function (a) { if (!a.coachFor) return _gymFinishCo(a); a.fin = true; if (!num(a.dur) && a.t0 && a.date === today()) { const m = Math.round((Date.now() - a.t0) / 60000); if (m >= 5 && m <= 240) a.dur = String(m); } save(); render(); coFinishSheet(a); }; }
