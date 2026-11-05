/* Hybridblock – Coach Teil 3 (7.5): Dashboard „Braucht heute Aufmerksamkeit“
   Kacheln als Filter, Suche nach Athleten und Vorlagen, Filter nach Betreuungsmodus, Sortierung,
   Team-Liste mit Modus, Umsetzungsquote, Farbpunkten pro Einheit und Schnellaktionen. */
'use strict';
/* ---------- Athlet: Zusatzfelder in der Kurzfassung ---------- */
const _makeSummaryDash = makeSummary;
makeSummary = function () { const s = _makeSummaryDash(); try {
  const w = curWeek(), nw = NW(); s.weeksLeft = nw - w; s.nw = nw;
  const q = [];
  for (let ww = Math.max(1, w - 3); ww <= w; ww++) { const tot = ORDER.length; const done = ORDER.filter(k => { const p = sessProgress(ww, k); return p.done && !p.skipped; }).length; q.push({ w: ww, done, total: tot }); }
  s.quota = q;
  const wp = typeof wkPlan === 'function' && S.settings.mode !== 'rotation' ? wkPlan(w) : null; const byK = {}; if (wp) wp.items.forEach(o => { byK[o.k] = o; });
  s.dots = ORDER.map(k => { const o = byK[k]; if (o) { if (o.st === 'done') return 'g'; if (o.st === 'skipped') return 'r'; if (o.st === 'part' || o.moved) return 'y'; if (o.st === 'merged') return 'g'; return 'o'; } const p = sessProgress(w, k); const d = typeof sessDate === 'function' ? sessDate(w, k) : null; if (p.done && !p.skipped) return 'g'; if (p.skipped) return 'r'; if (d && d < today()) return 'r'; if (p.f > 0) return 'y'; return 'o'; });
  const avgD = (f, from, n) => { const v = []; for (let i = from; i < from + n; i++) { const h = S.health[addDays(today(), -i)]; const x = h && (f === 'rhr' ? (h.rhr ?? h.rhrEst) : h[f]); if (x != null) v.push(x); } return v.length >= 3 ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const r7 = avgD('rhr', 0, 7), r28 = avgD('rhr', 7, 28); s.rhrUp = r7 != null && r28 != null && r7 - r28 >= 5;
  s.sleepLow = s.sleep7 != null && s.sleep7 < 360; s.readyLow = s.ready != null && s.ready < 50;
  s.rpeHigh = !!(s.review && s.review.sugs.some(x => x.kind === 'rpe' && x.st === 'open'));
  s.revOpen = s.review ? s.review.sugs.filter(x => x.st === 'open' && x.kind !== 'keep').length : 0;
  s.pain = Object.keys((S.settings.q || {}).pain || {}).sort().join(',');
} catch (e) {} return s; };

/* ---------- Coach: Bewertung pro Athlet ---------- */
const ATH_MODE = { online: 'Online', praesenz: 'Präsenz', hybrid: 'Hybrid' };
const athMode = uid => (S.settings.athMode || {})[uid] || '';
function dashFlags(c) { const s = c.summary || {}, f = {}; const days = x => x ? daysBetween(x.slice(0, 10), today()) : 999;
  if (openReq(c.id) || (s.weeksLeft != null && s.weeksLeft <= 0)) f.plan = s.weeksLeft != null && s.weeksLeft <= 0 && !openReq(c.id) ? $t('Plan endet diese Woche') : $t('wartet auf Plan');
  if (s.revOpen) f.checkin = $tf('{n} Vorschläge zur Freigabe', { n: s.revOpen });
  const w = []; if (s.rpeHigh) w.push($t('RPE über Ziel')); if (s.readyLow) w.push($t('Bereitschaft niedrig')); if (s.sleepLow) w.push($t('wenig Schlaf')); if (s.rhrUp) w.push($t('Ruhepuls erhöht'));
  const seen = (S.settings.seenPain || {})[c.id]; if (s.pain && seen !== undefined && seen !== s.pain) w.push($t('neue Angabe auf der Körperkarte')); if (w.length) f.warn = w.join(', ');
  if (typeof chatUnreadFor === 'function' && chatUnreadFor(c.id)) { const n = chatUnreadFor(c.id); f.msg = n === 1 ? $t('1 neue Nachricht') : $tf('{n} neue Nachrichten', { n }); }
  if (days(c.updated_at) >= 7 || (s.lastTrain && days(s.lastTrain) >= 7) || (!s.lastTrain && c.updated_at && days(c.created_at) >= 7)) f.inactive = $t('7 Tage inaktiv');
  return f; }
const DASH_TILES = [['plan', 'Plan nötig'], ['checkin', 'Check-in offen'], ['warn', 'Warnungen'], ['msg', 'Nachrichten'], ['inactive', '7 Tage inaktiv'], ['ok', 'Auf Kurs']];
function quotaOf(s) { const q = (s.quota || []).filter(x => x.total); const last = q.length > 1 ? q.slice(0, -1) : q; const t = last.reduce((a, x) => a + x.total, 0); return t ? Math.round(last.reduce((a, x) => a + x.done, 0) / t * 100) : null; }
function dashRow(c) { const s = c.summary || {}, f = dashFlags(c), m = athMode(c.id), qp = quotaOf(s);
  const dot = !c.updated_at ? 'mist' : Date.now() - Date.parse(c.updated_at) > 3 * 864e5 ? 'amber' : 'green';
  const dots = (s.dots || []).map(d => '<i class="sd sd-' + d + '"></i>').join('');
  const chips = Object.keys(f).map(k => '<span class="fchip f-' + k + '">' + esc(f[k]) + '</span>').join('');
  return '<div class="li dash-li"><span class="badge gym">' + esc(cname(c).slice(0, 1).toUpperCase()) + '</span><div class="grow" style="min-width:0"><a href="#admin/' + c.id + '" style="color:inherit;text-decoration:none"><b>' + esc(cname(c)) + '</b></a>' + (m ? ' <span class="tag">' + esc($t(ATH_MODE[m])) + '</span>' : '') +
    '<small>' + (s.week ? $t('Woche ') + s.week + (s.nw ? '/' + s.nw : '') : $t('noch nicht gestartet')) + (qp != null ? ' · ' + $tf('Umsetzung {p} %', { p: qp }) : '') + ' · <span class="dot ' + dot + '"></span>' + esc(ago(c.updated_at)) + '</small>' +
    (dots ? '<div class="sdots" aria-label="' + esc($t('Einheiten dieser Woche')) + '">' + dots + '</div>' : '') + (chips ? '<div class="fchips">' + chips + '</div>' : '') +
    '<div class="row qa"><a class="btn sm" href="#admin/' + c.id + '">' + $t('Check-in') + '</a><a class="btn sm" href="#chat/' + c.id + '">' + $t('Chat') + '</a><a class="btn sm" href="#plan/' + c.id + '">' + $t('Plan') + '</a></div></div></div>'; }
const _viewAdminDash = viewAdmin;
viewAdmin = function (arg) { if (arg || !isAdmin()) return _viewAdminDash(arg); _viewAdminDash(); /* lädt Liste, Einladungen */
  const all = ADMIN.clients || [], inv = ADMIN.invites || []; const F = all.map(c => ({ c, f: dashFlags(c) }));
  const cnt = k => F.filter(x => k === 'ok' ? !Object.keys(x.f).length : x.f[k]).length;
  const fil = ui.dashF || '', md = ui.dashMode || '', q = (ui.dashQ || '').trim().toLowerCase(), sort = ui.dashSort || 'urg';
  let L = F.filter(x => (!fil || (fil === 'ok' ? !Object.keys(x.f).length : x.f[fil])) && (!md || athMode(x.c.id) === md) && (!q || cname(x.c).toLowerCase().includes(q) || (x.c.username || '').toLowerCase().includes(q)));
  const urg = x => (x.f.plan ? 5 : 0) + (x.f.warn ? 4 : 0) + (x.f.checkin ? 3 : 0) + (x.f.msg ? 2 : 0) + (x.f.inactive ? 1 : 0);
  L.sort((a, b) => sort === 'name' ? cname(a.c).localeCompare(cname(b.c)) : sort === 'last' ? (a.c.summary && a.c.summary.lastTrain || '') < (b.c.summary && b.c.summary.lastTrain || '') ? -1 : 1 : sort === 'end' ? ((a.c.summary || {}).weeksLeft ?? 99) - ((b.c.summary || {}).weeksLeft ?? 99) : urg(b) - urg(a));
  const tpl = q && typeof tplsNeed === 'function' ? (tplsNeed() || []).filter(t => t.name.toLowerCase().includes(q)) : [];
  const tiles = '<div class="dash-tiles">' + DASH_TILES.map(([k, lab]) => { const n = cnt(k); return '<button class="dtile' + (fil === k ? ' on' : '') + (n && k !== 'ok' ? ' hot' : '') + '" data-act="dashF" data-v="' + k + '" type="button"><b>' + n + '</b><span>' + esc($t(lab)) + '</span></button>'; }).join('') + '</div>';
  const seg = (key, opts, cur) => '<div class="seg">' + opts.map(o => '<button class="' + (cur === o[0] ? 'on' : '') + '" data-act="' + key + '" data-v="' + o[0] + '" type="button">' + esc($t(o[1])) + '</button>').join('') + '</div>';
  return '<a href="#heute" class="back">' + ICON.back + $t('Heute') + '</a>' + pageTop($t('Team'), '', all.length ? $tf('{n} Athleten · {a} brauchen Aufmerksamkeit', { n: all.length, a: all.length - cnt('ok') }) : $t('Lade deine Athleten und schick Einladungen.')) + '<div class="stack">' +
    (ADMIN.err ? note('red', esc(ADMIN.err), '<button class="btn sm" data-act="adminReload" type="button">' + $t('Neu laden') + '</button>') : '') +
    '<div class="row"><button class="btn brand" data-act="inviteNew" type="button">' + $t('+ Athlet einladen') + '</button><a class="btn fog" href="#admin/vorlagen">' + $t('Vorlagen') + '</a><a class="btn fog" href="#plan/me">' + $t('Mein Plan') + '</a><div class="grow"></div><button class="iconbtn" data-act="adminReload" type="button" aria-label="' + esc($t('Neu laden')) + '">' + ICON.sync + '</button></div>' +
    '<div class="on-white"><input id="dash-q" type="search" placeholder="' + esc($t('Athleten oder Vorlagen suchen')) + '" value="' + esc(ui.dashQ || '') + '" style="width:100%"></div>' + '<div id="dash-body" class="stack">' +
    (all.length ? '<div class="section-h"><h2>' + $t('Braucht Aufmerksamkeit') + '</h2>' + (fil ? '<button class="btn sm fog" data-act="dashF" data-v="" type="button">' + $t('Alle zeigen') + '</button>' : '') + '</div>' + tiles : '') +
    (tpl.length ? '<div class="card flush"><div class="list">' + tpl.map(t => '<a class="li" href="#plan/tpl:' + t.id + '"><div class="grow"><b>' + esc(t.name) + '</b><small>' + $t('Vorlage') + '</small></div></a>').join('') + '</div></div>' : '') +
    (all.length ? seg('dashMode', [['', 'Alle'], ['online', 'Online'], ['praesenz', 'Präsenz'], ['hybrid', 'Hybrid']], md) + '<div class="row" style="gap:8px"><span class="small muted">' + $t('Sortieren:') + '</span><select data-act="dashSort" style="flex:1">' + [['urg', 'Dringlichkeit'], ['last', 'Letzte Aktivität'], ['end', 'Planende'], ['name', 'Name']].map(o => '<option value="' + o[0] + '"' + (sort === o[0] ? ' selected' : '') + '>' + esc($t(o[1])) + '</option>').join('') + '</select></div>' : '') +
    (ADMIN.clients == null ? '<p class="muted">' + $t('Lade …') + '</p>' : all.length ? (L.length ? '<div class="card flush"><div class="list">' + L.map(x => dashRow(x.c)).join('') + '</div></div>' : '<p class="muted">' + $t('Niemand in diesem Filter.') + '</p>') + '<p class="small muted" style="margin:0 4px">' + $t('Punkte pro Einheit dieser Woche: grün erledigt, gelb angefangen oder verschoben, rot ausgelassen, grau offen. Umsetzung = erledigte Einheiten der letzten Wochen.') + '</p>'
      : '<div class="card"><h2>' + $t('Noch keine Athleten') + '</h2><p>' + $t('Erstell eine Einladung. Dein Athlet installiert die App, wählt „Einladungscode“ und gibt den Code ein. Danach siehst du ihn hier.') + '</p></div>') +
    (inv.length ? '<div class="section-h"><h2>' + $t('Offene Einladungen') + '</h2></div><div class="card flush"><div class="list">' + inv.map(i => '<div class="li" style="cursor:default"><div class="grow"><b class="num" style="letter-spacing:.06em">' + esc(i.code) + '</b><small>' + esc((i.name || '') + $t(' · gültig bis ') + fmtDay(i.expires_at.slice(0, 10))) + '</small></div><button class="btn sm" data-act="inviteShare" data-code="' + esc(i.code) + '" data-name="' + esc(i.name || '') + '" type="button">' + $t('Teilen') + '</button><button class="btn sm danger" data-act="inviteDel" data-code="' + esc(i.code) + '" type="button">' + $t('Löschen') + '</button></div>').join('') + '</div></div>' : '') +
    (typeof coachNotifCard === 'function' ? coachNotifCard() : '') + '</div></div>'; };
/* Athletenansicht: Betreuungsmodus wählen, Körperkarte als gesehen markieren */
const _viewClientDash = viewClient;
viewClient = function (uid) { const html = _viewClientDash(uid); const c = (ADMIN.clients || []).find(x => x.id === uid); if (!c) return html;
  const p = (c.summary || {}).pain; if (p !== undefined) { const sp = S.settings.seenPain = S.settings.seenPain || {}; if (sp[uid] !== p) { sp[uid] = p; setTimeout(save, 0); } }
  const m = athMode(uid); const sel = '<div class="card"><div class="row" style="gap:10px"><b class="grow">' + $t('Betreuung') + '</b><select data-act="athMode" data-uid="' + uid + '"><option value="">–</option>' + Object.keys(ATH_MODE).map(k => '<option value="' + k + '"' + (m === k ? ' selected' : '') + '>' + esc($t(ATH_MODE[k])) + '</option>').join('') + '</select></div></div>';
  const i = html.indexOf('<div class="stats">'); return i < 0 ? html + sel : html.slice(0, i) + sel + html.slice(i); };
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'dashF') { ui.dashF = ui.dashF === b.dataset.v ? '' : b.dataset.v; render(); }
  else if (b.dataset.act === 'dashMode') { ui.dashMode = b.dataset.v; render(); } });
document.addEventListener('change', e => { const t = e.target; if (!t.dataset) return;
  if (t.dataset.act === 'dashSort') { ui.dashSort = t.value; render(); }
  else if (t.dataset.act === 'athMode') { S.settings.athMode = Object.assign({}, S.settings.athMode, { [t.dataset.uid]: t.value }); if (!t.value) delete S.settings.athMode[t.dataset.uid]; save(); } });
let dashT = null; document.addEventListener('input', e => { if (e.target.id !== 'dash-q') return; ui.dashQ = e.target.value; clearTimeout(dashT); dashT = setTimeout(() => { const tmp = document.createElement('div'); tmp.innerHTML = viewAdmin(); const nb = tmp.querySelector('#dash-body'), ob = document.getElementById('dash-body'); if (nb && ob) ob.innerHTML = nb.innerHTML; else render(); }, 200); });
