/* Hybridblock – Community: Sterne (nur nach Nutzung, nicht eigene), aktive Nutzer (ab 3), Suche und Filter,
   Meldungen nach DSA (Art. 16) mit Bestätigung „nach bestem Wissen“, Moderation durch Prüfer mit Begründung (Art. 17),
   Einspruch des Erstellers (Art. 20), Rückmeldung an Meldende. */
'use strict';
const CM = { stats: null, statsAt: 0, mine: null, used: null, reports: null, myReports: null, loading: {} };
const planKey = p => p && p.sharedId ? 'sp:' + p.sharedId : p && LIBRARY[p.tpl] && !LIBRARY[p.tpl].module ? 'lib:' + p.tpl : null;
const cmLoad = (k, fn) => { if (CM.loading[k]) return; CM.loading[k] = true; fn().catch(() => {}).finally(() => { CM.loading[k] = false; if (route.name === 'library') render(); }); };
function cmNeed() { if (!myUid()) return; const fresh = Date.now() - CM.statsAt < 120000;
  if (!fresh) { CM.statsAt = Date.now(); cmLoad('stats', async () => { const r = await api('/rest/v1/rpc/plan_stats', { method: 'POST', body: '{}' }); CM.stats = {}; (r || []).forEach(x => { CM.stats[x.plan_key] = x; }); }); }
  if (CM.mine == null) cmLoad('mine', async () => { const r = await api('/rest/v1/plan_ratings?select=plan_key,stars'); CM.mine = {}; (r || []).forEach(x => { CM.mine[x.plan_key] = x.stars; }); });
  if (CM.used == null) cmLoad('used', async () => { const r = await api('/rest/v1/plan_usage?select=plan_key'); CM.used = new Set((r || []).map(x => x.plan_key)); });
  if (SP.rev && CM.reports == null) cmLoad('rep', async () => { CM.reports = await api('/rest/v1/plan_reports?status=eq.open&select=id,plan_id,reason,details,created_at,shared_plans(name,status,hidden,owner_id)&order=created_at.asc&limit=200') || []; });
  if (CM.myReports == null) cmLoad('myrep', async () => { CM.myReports = await api('/rest/v1/plan_reports?reporter=eq.' + myUid() + '&select=id,plan_id,reason,status,decision_note,created_at,handled_at&order=created_at.desc&limit=20') || []; }); }
/* Nutzung einmal am Tag melden */
function usagePing() { if (!myUid() || (typeof VIEW !== 'undefined' && VIEW)) return; const k = planKey(S.plan); if (!k) return; const tag = k + '|' + today(); if (S.meta.usePing === tag) return; S.meta.usePing = tag; save();
  api('/rest/v1/plan_usage', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ plan_key: k, last_seen: today() }) }).then(() => { if (CM.used) CM.used.add(k); }).catch(() => { S.meta.usePing = null; }); }
const _renderCM = render;
render = function () { const r = _renderCM.apply(this, arguments); try { usagePing(); } catch (e) {} return r; };
/* Kennzahlen */
const statOf = k => (CM.stats || {})[k] || null;
function rankScore(k) { const s = statOf(k); const n = s ? s.n_ratings : 0, a = s && s.avg_stars ? +s.avg_stars : 0; return (5 * 3.5 + n * a) / (5 + n); }
function statLine(k) { const s = statOf(k); if (!s) return ''; const bits = []; if (s.n_ratings) bits.push('<span class="cm-star">★</span> ' + fmt(+s.avg_stars, 1) + ' (' + s.n_ratings + ')'); if (s.active) bits.push($tf('{n} aktiv', { n: s.active })); return bits.length ? '<div class="small cm-stat">' + bits.join(' · ') + '</div>' : ''; }
const _spCardCM = spCard;
spCard = function (sp) { let h = _spCardCM.apply(this, arguments); const st = statLine('sp:' + sp.id); if (spMine(sp) && sp.hidden) h = h.replace('<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">', '<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><span class="tag" style="background:var(--signal-soft,#fde3e1)">' + esc($t('Ausgeblendet')) + '</span>'); return st ? h.replace(/<\/a>$/, st + '</a>') : h; };
const _libCardCM = libCard;
libCard = function (p, why) { const h = _libCardCM.apply(this, arguments); const st = statLine('lib:' + p.id); return st ? h.replace(/<\/a>$/, st + '</a>') : h; };

/* ---------- Suche und Filter (Alle, Community) ---------- */
const GR = { A: 4, B: 3, C: 2, D: 1 };
function lfItems(scope) { const filt = ui.libGoal || '', L = spNeed(); const out = [];
  if (scope === 'all') Object.values(LIBRARY).filter(p => !p.module && libVisible(p) && (!filt || p.goals.includes(filt))).forEach(p => out.push({ k: 'lib:' + p.id, html: () => libCard(p), name: $t(p.name) + ' ' + $t(p.desc || '') + ' ' + $t(p.tag || ''), rev: true, g: (p.ev || {}).g || 'D', date: '' }));
  L.filter(x => scope === 'com' ? (x.status === 'public' || x.status === 'submitted') : (SP_PUB.includes(x.status) || spMine(x))).filter(x => !filt || (x.meta || {}).goal === filt)
    .forEach(x => out.push({ k: 'sp:' + x.id, html: () => spCard(x), name: x.name + ' ' + (x.descr || '') + ' ' + ((x.meta || {}).by || ''), rev: x.status === 'curated', g: (x.meta || {}).grade || 'D', date: x.published_at || x.updated_at || '' }));
  return out; }
function lfList(scope) { const f = ui.lf || {}; const q = (f.q || '').trim().toLowerCase(); let L = lfItems(scope).filter(x => (!q || x.name.toLowerCase().includes(q)) && (!f.rev || x.rev) && (!f.ev || (GR[x.g] || 0) >= GR[f.ev]));
  const act = x => (statOf(x.k) || {}).active || 0; const so = f.sort || 'rank';
  L.sort((a, b) => so === 'act' ? act(b) - act(a) || rankScore(b.k) - rankScore(a.k) : so === 'new' ? (b.date > a.date ? 1 : b.date < a.date ? -1 : 0) : so === 'ev' ? (GR[b.g] || 0) - (GR[a.g] || 0) || rankScore(b.k) - rankScore(a.k) : rankScore(b.k) - rankScore(a.k) || act(b) - act(a));
  return L.length ? L.map(x => x.html()).join('') : '<p class="small muted" style="margin:0 4px">' + $t('Keine Pläne passen zu diesen Filtern.') + '</p>'; }
function lfBar(scope) { const f = ui.lf || {}; const sel = (id, opts, v) => '<select id="' + id + '" class="lf-sel">' + opts.map(([k, l]) => '<option value="' + k + '"' + ((v || '') === k ? ' selected' : '') + '>' + esc(l) + '</option>').join('') + '</select>';
  return '<div class="lf"><input id="lf-q" type="search" placeholder="' + esc($t('Pläne durchsuchen')) + '" value="' + esc(f.q || '') + '">' +
    '<div class="lf-row">' + (scope === 'all' ? '<button class="chip-btn' + (f.rev ? ' on' : '') + '" data-act="lfRev" type="button">✓ ' + $t('Von uns geprüft') + '</button>' : '') +
    sel('lf-ev', [['', $t('Evidenz: alle')], ['A', $t('Evidenz A')], ['B', $t('Evidenz ab B')], ['C', $t('Evidenz ab C')]], f.ev) +
    sel('lf-sort', [['rank', $t('Ranking')], ['act', $t('Aktive Nutzer')], ['new', $t('Neueste')], ['ev', $t('Evidenz')]], f.sort) + '</div></div>'; }
viewLibAll = function () { cmNeed(); return goalSeg() + lfBar('all') + '<div id="lib-list" class="stack">' + lfList('all') + '</div>'; };
const _viewLibComCM = viewLibCom;
viewLibCom = function () { cmNeed(); if (libTab() === 'rev') return modView() + _viewLibComCM.apply(this, arguments);
  return note('sky', $t('Pläne aus der Community, noch nicht von uns geprüft. Die Note kommt aus der automatischen Prüfung gegen die Studienlage.')) + lfBar('com') + '<div id="lib-list" class="stack">' + (SP.list == null ? '<p class="muted">' + $t('Lade …') + '</p>' : lfList('com')) + '</div>'; };
function lfUpdate() { const el = document.getElementById('lib-list'); if (el) el.innerHTML = lfList(libTab() === 'com' ? 'com' : 'all'); }
document.addEventListener('input', e => { if (e.target.id === 'lf-q') { ui.lf = Object.assign({}, ui.lf, { q: e.target.value }); lfUpdate(); } });
document.addEventListener('change', e => { if (e.target.id === 'lf-ev') { ui.lf = Object.assign({}, ui.lf, { ev: e.target.value }); lfUpdate(); } else if (e.target.id === 'lf-sort') { ui.lf = Object.assign({}, ui.lf, { sort: e.target.value }); lfUpdate(); } });

/* ---------- Bewerten ---------- */
function rateBox(k, own) { if (!k || !myUid() || own) return ''; cmNeed(); const s = statOf(k), my = (CM.mine || {})[k] || 0, used = CM.used && CM.used.has(k);
  return '<div class="card cm-rate"><div class="row" style="align-items:center;flex-wrap:wrap;gap:8px"><div class="grow"><b>' + $t('Bewertung') + '</b><div class="small muted">' + (s && s.n_ratings ? $tf('Ø {a} aus {n} Bewertungen', { a: fmt(+s.avg_stars, 1), n: s.n_ratings }) : $t('Noch keine Bewertungen')) + (s && s.active ? ' · ' + $tf('{n} aktiv', { n: s.active }) : '') + '</div></div>' +
    '<div class="cm-stars" role="group" aria-label="' + esc($t('Deine Bewertung')) + '">' + [1, 2, 3, 4, 5].map(i => '<button type="button" data-act="rate" data-key="' + k + '" data-v="' + i + '" class="' + (i <= my ? 'on' : '') + '"' + (used ? '' : ' disabled') + ' aria-label="' + esc($tf('{n} Sterne', { n: i })) + '">★</button>').join('') + '</div></div>' +
    (used ? (my ? '<div class="small muted" style="margin-top:4px">' + $t('Deine Bewertung. Tippen zum Ändern.') + '</div>' : '') : '<div class="small muted" style="margin-top:4px">' + $t('Bewerten kannst du, sobald du mit dem Plan trainierst.') + '</div>') + '</div>'; }
async function rate(k, v) { try { await api('/rest/v1/plan_ratings', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ plan_key: k, stars: v }) }); CM.mine = Object.assign({}, CM.mine, { [k]: v }); CM.statsAt = 0; toast($t('Danke für deine Bewertung')); render(); }
  catch (e) { const t = errTxt(e) || ''; toast(/Nutzung/.test(t) ? $t('Bewerten kannst du, sobald du mit dem Plan trainierst.') : /Eigene/.test(t) ? $t('Eigene Pläne kannst du nicht bewerten.') : t); } }
const insTop = (h, add) => { const m = h.indexOf('<div class="stack"'); if (m < 0) return h + add; const e = h.indexOf('>', m) + 1; return h.slice(0, e) + add + h.slice(e); };

/* ---------- Melden, Moderation, Einspruch ---------- */
const REP_R = { illegal: 'Rechtswidriger Inhalt', dangerous: 'Gesundheitlich gefährlich', copyright: 'Urheberrecht verletzt', spam: 'Spam oder Werbung', other: 'Sonstiges', appeal: 'Einspruch' };
function repSheet(planId, appeal) { ui.repFor = planId; ui.repAppeal = !!appeal;
  openSheet(sheetHead(appeal ? $t('Einspruch einlegen') : $t('Plan melden')) + '<p class="small muted" style="margin-top:6px">' + (appeal ? $t('Begründe, warum der Plan wieder sichtbar sein sollte. Wir prüfen den Einspruch und melden uns hier.') : $t('Meldungen gehen an unser Prüfteam. Der Ersteller erfährt nicht, wer gemeldet hat. Du siehst die Entscheidung unter „Meine Pläne“.')) + '</p>' +
    (appeal ? '' : '<div class="menu" style="margin-top:10px">' + Object.keys(REP_R).filter(k => k !== 'appeal').map((k, i) => '<label class="act-pick"><input type="radio" name="rep-r" value="' + k + '"' + (i === 0 ? ' checked' : '') + '> <span class="grow">' + esc($t(REP_R[k])) + '</span></label>').join('') + '</div>') +
    '<div class="on-white" style="margin-top:10px"><div class="field"><label for="rep-d">' + (appeal ? $t('Begründung') : $t('Was genau ist das Problem?')) + '</label><textarea id="rep-d" rows="4" maxlength="1000"></textarea></div></div>' +
    '<label class="row" style="gap:10px;margin-top:10px;align-items:flex-start"><input type="checkbox" id="rep-gf"> <span class="small">' + $t('Ich bestätige, dass meine Angaben nach bestem Wissen richtig und vollständig sind.') + '</span></label>' +
    '<div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="repGo" type="button">' + $t('Absenden') + '</button></div>'); }
async function repGo(b) { const d = ($('#rep-d').value || '').trim(), gf = $('#rep-gf').checked, r = ui.repAppeal ? 'appeal' : ((document.querySelector('input[name="rep-r"]:checked') || {}).value || 'other');
  if (!gf) { toast($t('Bitte bestätige deine Angaben.')); return; } if ((r === 'other' || r === 'appeal') && d.length < 10) { toast($t('Bitte beschreibe das Problem kurz.')); return; } b.disabled = true;
  try { await api('/rest/v1/plan_reports', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ plan_id: ui.repFor, reason: r, details: d || null, good_faith: true }) }); CM.myReports = null; closeSheet(); toast(ui.repAppeal ? $t('Einspruch eingereicht') : $t('Danke. Wir prüfen die Meldung.')); render(); }
  catch (e) { b.disabled = false; const t = errTxt(e) || ''; toast(/bereits offen/.test(t) ? $t('Du hast diesen Plan schon gemeldet. Die Prüfung läuft.') : /Zu viele/.test(t) ? $t('Zu viele Meldungen heute. Versuch es morgen wieder.') : t); } }
function modView() { const L = CM.reports; if (!SP.rev) return ''; if (L == null) return '<p class="muted">' + $t('Lade …') + '</p>';
  return '<div class="section-h"><h2>' + esc($tf('Meldungen ({n})', { n: L.length })) + '</h2></div>' + (L.length ? L.map(r => { const p = r.shared_plans || {}; return '<div class="card" style="box-shadow:inset 4px 0 0 ' + (r.reason === 'appeal' ? 'var(--sky)' : 'var(--signal)') + '"><div class="row" style="flex-wrap:nowrap"><div class="grow"><b>' + esc($t(REP_R[r.reason] || r.reason)) + '</b><div class="small muted">' + esc(fmtDay(r.created_at.slice(0, 10))) + ' · <a href="#library/sp:' + r.plan_id + '">' + esc(p.name || $t('Plan')) + '</a>' + (p.hidden ? ' · ' + $t('Ausgeblendet') : '') + '</div></div></div>' +
    (r.details ? '<p class="small" style="margin:8px 0 0;white-space:pre-wrap">' + esc(r.details) + '</p>' : '') + '<div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">' +
    (r.reason === 'appeal' ? '<button class="btn sm brand" data-act="modGo" data-v="unhide" data-id="' + r.id + '" data-plan="' + r.plan_id + '" type="button">' + $t('Wieder einblenden') + '</button><button class="btn sm" data-act="modGo" data-v="dismiss" data-id="' + r.id + '" type="button">' + $t('Einspruch zurückweisen') + '</button>'
      : '<button class="btn sm dark" data-act="modGo" data-v="hide" data-id="' + r.id + '" data-plan="' + r.plan_id + '" type="button">' + $t('Plan ausblenden') + '</button><button class="btn sm" data-act="modGo" data-v="dismiss" data-id="' + r.id + '" type="button">' + $t('Meldung zurückweisen') + '</button>') + '</div></div>'; }).join('') : '<p class="small muted" style="margin:0 4px">' + $t('Keine offenen Meldungen.') + '</p>') + '<div class="section-h"><h2>' + $t('Eingereichte Pläne') + '</h2></div>'; }
function modSheet(b) { const v = b.dataset.v; ui.mod = { v, id: b.dataset.id, plan: b.dataset.plan };
  const t = { hide: ['Plan ausblenden', 'Begründung für den Ersteller (Pflicht)'], unhide: ['Wieder einblenden', 'Hinweis für Ersteller und Meldende (optional)'], dismiss: ['Zurückweisen', 'Begründung für die meldende Person (Pflicht)'] }[v];
  openSheet(sheetHead($t(t[0])) + '<div class="on-white" style="margin-top:12px"><div class="field"><label for="mod-n">' + esc($t(t[1])) + '</label><textarea id="mod-n" rows="4" maxlength="1000"></textarea></div></div>' +
    '<p class="small muted">' + $t('Die Begründung wird gespeichert und den Betroffenen angezeigt.') + '</p><div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="modDo" type="button">' + $t('Bestätigen') + '</button></div>'); }
async function modDo(b) { const m = ui.mod, n = ($('#mod-n').value || '').trim(); if (m.v !== 'unhide' && n.length < 5) { toast($t('Bitte eine Begründung eingeben.')); return; } b.disabled = true;
  try { if (m.v === 'hide' || m.v === 'unhide') { await api('/rest/v1/shared_plans?id=eq.' + m.plan, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ hidden: m.v === 'hide', mod_note: m.v === 'hide' ? n : null, mod_at: new Date().toISOString() }) });
      await api('/rest/v1/plan_reports?plan_id=eq.' + m.plan + '&status=eq.open', { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'actioned', decision_note: n || null }) }); }
    else await api('/rest/v1/plan_reports?id=eq.' + m.id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status: 'dismissed', decision_note: n }) });
    CM.reports = null; SP.list = null; SP.body = {}; closeSheet(); toast($t('Erledigt')); render(); } catch (e) { b.disabled = false; toast(errTxt(e)); } }
/* Meine Meldungen (Rückmeldung an Meldende) */
const _viewLibMineCM = viewLibMine;
viewLibMine = function () { cmNeed(); const h = _viewLibMineCM.apply(this, arguments); const L = (CM.myReports || []).filter(r => r.reason !== 'appeal'); if (!L.length) return h;
  const st = r => r.status === 'open' ? $t('in Prüfung') : r.status === 'actioned' ? $t('Plan ausgeblendet') : $t('zurückgewiesen');
  return h + '<div class="section-h"><h2>' + $t('Meine Meldungen') + '</h2></div><div class="card flush"><div class="list">' + L.map(r => '<div class="li"><div class="grow"><b>' + esc($t(REP_R[r.reason] || r.reason)) + '</b><small>' + esc(fmtDay(r.created_at.slice(0, 10))) + ' · ' + esc(st(r)) + (r.decision_note ? ' · ' + esc(r.decision_note) : '') + '</small></div></div>').join('') + '</div></div>'; };
/* Detailansichten: Bewertung, Melden, Ausgeblendet */
const _viewSharedPlanCM = viewSharedPlan;
viewSharedPlan = function (id) { let h = _viewSharedPlanCM.apply(this, arguments); const b = SP.body[id]; if (!b || b.missing) return h; const own = spMine(b); let add = '';
  if (own && b.hidden) add += note('red', '<b>' + $t('Von der Moderation ausgeblendet.') + '</b> ' + esc(b.mod_note || ''), '<button class="btn sm" data-act="repOpen" data-appeal="1" data-id="' + id + '" type="button">' + $t('Einspruch einlegen') + '</button>');
  if (SP_PUB.includes(b.status) && !b.hidden) add += rateBox('sp:' + id, own);
  if (!own && myUid()) add += '<div class="row" style="justify-content:flex-end"><button class="btn sm" data-act="repOpen" data-id="' + id + '" type="button">⚑ ' + $t('Melden') + '</button></div>';
  return insTop(h, add); };
const _viewLibPlanCM = viewLibPlan;
viewLibPlan = function (id) { const h = _viewLibPlanCM.apply(this, arguments); id = String(id || ''); if (!LIBRARY[id] || LIBRARY[id].module || id === 'gen') return h; const box = rateBox('lib:' + id, false); return box ? insTop(h, box) : h; };
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'rate') rate(b.dataset.key, +b.dataset.v);
  else if (a === 'lfRev') { ui.lf = Object.assign({}, ui.lf, { rev: !(ui.lf || {}).rev }); b.classList.toggle('on'); lfUpdate(); }
  else if (a === 'repOpen') repSheet(b.dataset.id, b.dataset.appeal === '1');
  else if (a === 'repGo') repGo(b);
  else if (a === 'modGo') modSheet(b);
  else if (a === 'modDo') modDo(b); });
/* Prüfen-Reiter zählt offene Meldungen mit */
const _viewLibraryCM = viewLibrary;
viewLibrary = function () { const h = _viewLibraryCM.apply(this, arguments); const n = (CM.reports || []).length; if (!SP.rev || !n) return h;
  return h.replace(/(data-v="rev" type="button">[^<(]*)(\((\d+)\))?/, (m0, a, b2, c) => a.trim() + ' (' + ((+c || 0) + n) + ')'); };
