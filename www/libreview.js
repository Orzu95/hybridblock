/* Hybridblock – Bibliothek Teil 2: Prüfen und Freigeben, Teilen per Code/Link/QR, Zielgruppe, Kopierschutz
   Prüfer (plan_reviewers): Reiter „Prüfen“, Freigeben (curated) oder Ablehnen mit Begründung (bleibt öffentlich).
   Teilen: shared_plan_share() erzeugt einen 8-stelligen Code; Link #library/code:XXXX; shared_plan_by_code() liest ihn (auch ohne Konto).
   Kopierschutz (nur Coaches): Plan nutzbar, aber nicht bearbeiten, speichern oder weitergeben. */
'use strict';
const SP_LEVEL = { beg: 'Einsteiger', int: 'Fortgeschritten', adv: 'Erfahren' }, SP_PLACE = { gym: 'Studio', home: 'Zuhause', min: 'Minimal' };
function spTargetFields(m) { m = m || {}; const sel = (id, map, v, lab) => '<div class="field"><label for="' + id + '">' + esc($t(lab)) + '</label><select id="' + id + '"><option value="">–</option>' + Object.keys(map).map(k => '<option value="' + k + '"' + (v === k ? ' selected' : '') + '>' + esc($t(map[k])) + '</option>').join('') + '</select></div>';
  return '<div class="on-white" style="margin-top:12px"><div class="lbl">' + $t('Für wen?') + '</div><div class="fields">' + sel('sp-level', SP_LEVEL, m.level, 'Erfahrung') + sel('sp-place', SP_PLACE, m.place, 'Ort und Geräte') + '</div></div>'; }
function spTargetVal() { const l = $('#sp-level'), p = $('#sp-place'); return { level: (l && l.value) || null, place: (p && p.value) || null }; }
function spLockVal() { const c = $('#sp-lock'); return !!(c && c.checked); }
/* Prüfer erkennen */
SP.rev = null;
function spRevNeed() { if (SP.rev != null || SP.revLoading || !myUid()) return !!SP.rev; SP.revLoading = true;
  api('/rest/v1/plan_reviewers?select=user_id').then(r => { SP.rev = !!(r && r.length); }).catch(() => { SP.rev = false; }).finally(() => { SP.revLoading = false; if (SP.rev && !LIB_TABS.some(t => t[0] === 'rev')) LIB_TABS.push(['rev', 'Prüfen']); if (SP.rev && route.name === 'library') render(); }); return false; }
const spRejected = sp => sp.status === 'public' && sp.review_state === 'rejected';
/* Karten: Zielgruppe, Kopierschutz, „Nicht freigegeben“ */
const _spCardRV = spCard;
spCard = function (sp) { let h = _spCardRV.apply(this, arguments); const m = sp.meta || {}; const tags = [m.level && SP_LEVEL[m.level] ? $t(SP_LEVEL[m.level]) : '', m.place && SP_PLACE[m.place] ? $t(SP_PLACE[m.place]) : '', sp.copy_lock ? '🔒 ' + $t('Kopierschutz') : ''].filter(Boolean).map(t => '<span class="tag">' + esc(t) + '</span>').join('');
  if (spMine(sp) && spRejected(sp)) h = h.replace('<span class="tag">' + esc($t(SP_ST.public)) + '</span>', '<span class="tag" style="background:var(--amber-soft,#fff1d6)">' + esc($t('Nicht freigegeben')) + '</span>'); return tags ? h.replace('<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">', '<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">' + tags) : h; };
/* Reiter „Prüfen“ (nur Prüfer) */
const _viewLibComRV = viewLibCom;
viewLibCom = function () { if (libTab() !== 'rev') return _viewLibComRV.apply(this, arguments); const L = spNeed().filter(x => x.status === 'submitted');
  return note('sky', $t('Eingereichte Pläne. Prüfe Aufbau und automatische Note, dann freigeben oder mit Begründung ablehnen.')) + (SP.list == null ? '<p class="muted">' + $t('Lade …') + '</p>' : L.length ? L.map(spCard).join('') : '<p class="small muted" style="margin:0 4px">' + $t('Nichts zu prüfen.') + '</p>'); };
const _viewLibraryRV = viewLibrary;
viewLibrary = function () { spRevNeed(); if (libTab() === 'rev' && !SP.rev) ui.libTab = 'cur'; let h = _viewLibraryRV.apply(this, arguments); const n = (SP.list || []).filter(x => x.status === 'submitted').length;
  if (SP.rev && n) h = h.replace('data-v="rev" type="button">' + esc($t('Prüfen')), 'data-v="rev" type="button">' + esc($t('Prüfen')) + ' (' + n + ')'); return h; };
/* Meine Pläne: Code eingeben */
const _viewLibMineRV = viewLibMine;
viewLibMine = function () { return '<div class="card"><div class="lbl">' + $t('Plan per Code öffnen') + '</div><div class="row on-white" style="margin-top:6px;gap:8px"><input id="code-in" class="grow" maxlength="8" autocapitalize="characters" placeholder="' + esc($t('z. B. Q8BFEX3B')) + '" style="text-transform:uppercase;letter-spacing:.08em"><button class="btn" data-act="codeGo" type="button">' + $t('Öffnen') + '</button></div></div>' + _viewLibMineRV.apply(this, arguments); };

/* Detailansicht: Prüfung, Ablehnung, Teilen, Kopierschutz */
const _viewSharedPlanRV = viewSharedPlan;
viewSharedPlan = function (id) { let h = _viewSharedPlanRV.apply(this, arguments); const b = SP.body[id]; if (!b || b.missing) return h; const own = spMine(b); spRevNeed();
  let top = '';
  if (own && spRejected(b)) top += note('amber', '<b>' + $t('Nicht freigegeben.') + '</b> ' + esc(b.review_note || ''), '<button class="btn sm" data-act="spResubmit" data-id="' + id + '" type="button">' + $t('Überarbeitet, erneut einreichen') + '</button>');
  if (own && b.status === 'submitted') top += note('sky', $t('Zur Prüfung eingereicht. Du bekommst das Ergebnis hier angezeigt.'));
  if (own) top += '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" data-act="spShare" data-id="' + id + '" type="button">↗ ' + $t('Teilen per Link oder QR') + '</button>' + (b.share_code ? '<span class="small muted">' + $tf('Code aktiv: {c}', { c: b.share_code }) + '</span>' : '') + '</div>';
  if (SP.rev && !own && b.status === 'submitted') top += '<div class="card" style="box-shadow:inset 4px 0 0 var(--sky)"><b>' + $t('Prüfung') + '</b><p class="small muted" style="margin:4px 0 10px">' + $t('Prüfe Aufbau, Volumen und die automatische Note unten.') + '</p><div class="row" style="gap:8px"><button class="btn brand" data-act="rvOpen" data-v="ok" data-id="' + id + '" type="button">' + $t('Freigeben') + '</button><button class="btn" data-act="rvOpen" data-v="no" data-id="' + id + '" type="button">' + $t('Ablehnen') + '</button></div></div>';
  if (b.copy_lock && !own) { h = h.replace(/<button[^>]*data-act="libEdit"[^>]*>[\s\S]*?<\/button>/g, ''); top += note('sky', '🔒 ' + $t('Kopierschutz: Du kannst den Plan nutzen, aber nicht bearbeiten, speichern oder weitergeben.')); }
  const m = '<div class="stack" style="margin-bottom:12px">'; return top ? h.replace(m, m + top) : h; };
const _planFromIdRV = planFromId;
planFromId = function (id) { id = String(id); if (id.startsWith('code:')) { const b = (SP.code || {})[id.slice(5)]; const p = clone(b.plan); p.name = b.name; p.sharedId = b.id; if (b.copy_lock) p.lock = { by: b.owner || 'other' }; return p; }
  const p = _planFromIdRV.apply(this, arguments); if (id.startsWith('sp:')) { const b = SP.body[id.slice(3)]; if (b && b.copy_lock && !spMine(b)) p.lock = { by: b.owner_id }; } return p; };
/* Plan über Code laden (auch ohne Konto) */
SP.code = {}; SP.codeLoading = {};
async function codeFetch(c) { const h = { apikey: SB.key, 'Content-Type': 'application/json' }; if (AUTH && AUTH.access_token) h.Authorization = 'Bearer ' + (await token());
  const r = await fetch(SB.url + '/rest/v1/rpc/shared_plan_by_code', { method: 'POST', headers: h, body: JSON.stringify({ p_code: c }) }); if (!r.ok) throw new Error('HTTP ' + r.status); const j = await r.json(); return j && j[0]; }
function viewCodePlan(c) { c = String(c || '').toUpperCase(); const back = '<a href="#library" class="back">' + ICON.back + $t('Bibliothek</a>'); const b = SP.code[c];
  if (!b) { if (!SP.codeLoading[c]) { SP.codeLoading[c] = true; codeFetch(c).then(x => { SP.code[c] = x || { missing: true }; }).catch(() => { SP.code[c] = { missing: true, err: true }; }).finally(() => { SP.codeLoading[c] = false; if (route.name === 'library') render(); }); } return back + '<p class="muted">' + $t('Lade …') + '</p>'; }
  if (b.missing) { delete SP.code[c]; return back + '<p>' + (b.err ? $t('Keine Verbindung. Versuch es gleich noch einmal.') : $t('Zu diesem Code gibt es keinen Plan. Vielleicht wurde der Link deaktiviert.')) + '</p>'; }
  const pl = planFromId('code:' + c), m = b.meta || {}; let acts = libActions('code:' + c); if (b.copy_lock) acts = acts.replace(/<button[^>]*data-act="libEdit"[^>]*>[\s\S]*?<\/button>/g, '');
  return back + pageTop(esc(b.name), '', esc((m.by || '') + (m.by ? ' · ' : '') + (m.coach ? $t('Coach') : $t('Athlet')))) + '<div class="stack" style="margin-bottom:12px">' + note('sky', esc($tf('Geteilter Plan (Code {c}).', { c }))) + (b.copy_lock ? note('sky', '🔒 ' + $t('Kopierschutz: Du kannst den Plan nutzen, aber nicht bearbeiten, speichern oder weitergeben.')) : '') +
    '<div class="card"><p style="margin:0">' + esc(b.descr || $t('Ohne Beschreibung.')) + '</p></div></div>' + (typeof chkCard === 'function' ? chkCard(pl, 'lib') : '') + libPreviewHTML({}, pl, acts); }
const _viewLibPlanRV = viewLibPlan;
viewLibPlan = function (id) { id = String(id || ''); if (id.startsWith('code:')) return viewCodePlan(id.slice(5)); return _viewLibPlanRV.apply(this, arguments); };
/* Teilen-Fenster */
async function spShare(id) { let code; try { code = await api('/rest/v1/rpc/shared_plan_share', { method: 'POST', body: JSON.stringify({ p_id: id }) }); } catch (e) { toast(errTxt(e)); return; }
  if (SP.body[id]) SP.body[id].share_code = code; const link = PAGES + '#library/code:' + code; let qr = '';
  try { if (typeof qrcode === 'undefined') await loadScript('vendor/qrcode.js'); const q = qrcode(0, 'M'); q.addData(link); q.make(); qr = q.createSvgTag({ cellSize: 5, margin: 2, scalable: true }); } catch (e) {}
  openSheet(sheetHead($t('Plan teilen')) + '<p class="small muted" style="margin-top:6px">' + $t('Wer den Link oder Code hat, kann den Plan ansehen und nutzen, auch ohne Konto. Persönliche Daten sind nicht enthalten.') + '</p>' +
    '<div class="sh-code num">' + esc(code) + '</div><div class="sh-qr">' + qr + '</div><p class="small" style="word-break:break-all;text-align:center">' + esc(link) + '</p>' +
    '<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn brand" data-act="shSend" data-link="' + esc(link) + '" data-code="' + esc(code) + '" type="button">' + $t('Teilen') + '</button><button class="btn" data-act="shCopy" data-link="' + esc(link) + '" type="button">' + $t('Link kopieren') + '</button><div class="grow"></div><button class="btn" data-act="shOff" data-id="' + id + '" type="button">' + $t('Link deaktivieren') + '</button></div>'); }
/* Prüfen-Fenster */
function rvSheet(id, ok) { openSheet(sheetHead(ok ? $t('Plan freigeben') : $t('Plan ablehnen')) + '<div class="on-white" style="margin-top:12px"><div class="field"><label for="rv-note">' + (ok ? $t('Hinweis für alle (optional)') : $t('Begründung für den Ersteller')) + '</label><textarea id="rv-note" rows="4" maxlength="600" placeholder="' + esc(ok ? $t('z. B. Gut für Einsteiger mit 3 Tagen') : $t('z. B. Zu wenig Volumen für den Rücken, Deload fehlt')) + '"></textarea></div></div>' +
  '<div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="rvGo" data-v="' + (ok ? 'ok' : 'no') + '" data-id="' + id + '" type="button">' + (ok ? $t('Freigeben') : $t('Ablehnen')) + '</button></div>'); }
async function rvGo(b) { const id = b.dataset.id, ok = b.dataset.v === 'ok', note2 = ($('#rv-note').value || '').trim(); if (!ok && !note2) { toast($t('Bitte eine Begründung eingeben.')); return; } b.disabled = true;
  try { await api('/rest/v1/shared_plans?id=eq.' + id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: ok ? 'curated' : 'public', review_state: ok ? 'approved' : 'rejected', review_note: note2 || null, reviewed_by: myUid(), reviewed_at: new Date().toISOString() }) });
    delete SP.body[id]; SP.list = null; closeSheet(); toast(ok ? $t('Freigegeben') : $t('Abgelehnt')); render(); } catch (e) { b.disabled = false; toast(errTxt(e)); } }
document.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'spShare') spShare(b.dataset.id);
  else if (a === 'shSend') { const txt = $tf('Trainingsplan in Hybridblock: {l} (Code {c})', { l: b.dataset.link, c: b.dataset.code }); try { if (navigator.share) { await navigator.share({ text: txt }); return; } } catch (er) { if (er.name === 'AbortError') return; } try { await navigator.clipboard.writeText(txt); toast($t('Kopiert')); } catch (er) {} }
  else if (a === 'shCopy') { try { await navigator.clipboard.writeText(b.dataset.link); toast($t('Link kopiert')); } catch (er) { toast(b.dataset.link); } }
  else if (a === 'shOff') { try { await api('/rest/v1/rpc/shared_plan_unshare', { method: 'POST', body: JSON.stringify({ p_id: b.dataset.id }) }); if (SP.body[b.dataset.id]) SP.body[b.dataset.id].share_code = null; closeSheet(); toast($t('Link deaktiviert')); render(); } catch (er) { toast(errTxt(er)); } }
  else if (a === 'rvOpen') rvSheet(b.dataset.id, b.dataset.v === 'ok');
  else if (a === 'rvGo') rvGo(b);
  else if (a === 'spResubmit') { try { await api('/rest/v1/shared_plans?id=eq.' + b.dataset.id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'submitted' }) }); delete SP.body[b.dataset.id]; SP.list = null; toast($t('Erneut eingereicht')); render(); } catch (er) { toast(spErr(er)); } }
  else if (a === 'codeGo') { const v = ($('#code-in').value || '').trim().toUpperCase(); if (v.length !== 8) { toast($t('Der Code hat 8 Zeichen.')); return; } location.hash = '#library/code:' + v; } });
/* Sicherheit: fremde Pläne (geteilt/Code) vor der Nutzung bereinigen – nur bekannte Arten, Schlüssel und Zahlen */
const SAFE_KIND = new Set(['gym', 'z2', 'hiit', 'run', 'bike', 'row', 'swim', 'mob', 'rest', 'sport', 'walk', 'cardio', 'free']);
function planSanitize(p) { if (!p || typeof p !== 'object') return p; const n = v => { const x = num(v); return x == null ? null : x; }; const s = v => v == null ? v : String(v).slice(0, 120);
  p.name = s(p.name); p.weeks = Math.max(1, Math.min(52, n(p.weeks) || 12));
  p.sessions = (Array.isArray(p.sessions) ? p.sessions : []).slice(0, 14).filter(x => x && typeof x === 'object').map(x => { x.k = /^[A-Z][A-Z0-9]{0,2}$/.test(x.k) ? x.k : 'X'; if (!SAFE_KIND.has(x.kind)) x.kind = 'gym'; x.title = s(x.title);
    if (Array.isArray(x.add)) x.add = x.add.slice(0, 30).filter(i => i && typeof i === 'object').map(i => Object.assign(i, { slot: s(i.slot), ex: s(i.ex), sets: n(i.sets) || 1, reps: s(i.reps), rpe: i.rpe == null ? i.rpe : n(i.rpe), sup: i.sup == null ? i.sup : s(i.sup) }));
    return x; });
  if (p.wkPlans && typeof p.wkPlans === 'object') Object.keys(p.wkPlans).forEach(w => { if (!/^\d{1,2}$/.test(w)) delete p.wkPlans[w]; });
  return p; }
const _planFromIdSafe = planFromId;
planFromId = function (id) { const p = _planFromIdSafe.apply(this, arguments); id = String(id); return id.startsWith('sp:') || id.startsWith('code:') ? planSanitize(p) : p; };
