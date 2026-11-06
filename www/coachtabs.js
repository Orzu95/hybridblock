/* Hybridblock – Coaching-Modus mit eigener Leiste unten: Team · Termine · Chats · Vorlagen · + (Coach-Aktionen).
   Eigenes Training (Training, Essen, Verlauf, Lernen) gibt es nur im Modus „Mein Training“. */
'use strict';
const TAB_SVG = {
  team: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.2c2.3.2 3.9 1.7 4.5 4.3"/></svg>',
  appt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  tpl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>' };
const coachTabsOn = () => typeof isAdmin === 'function' && isAdmin() && !(typeof VIEW !== 'undefined' && VIEW) && typeof cMode === 'function' && cMode() === 'coach';
let TAB_OWN = null, TAB_MODE = null;
function tabSync() { const el = document.querySelector('#tabbar .in'); if (!el) return; if (TAB_OWN == null) TAB_OWN = el.innerHTML; const want = coachTabsOn() ? 'coach' : 'own';
  if (TAB_MODE !== want) { TAB_MODE = want; el.innerHTML = want === 'own' ? TAB_OWN : [['#admin', 'cteam', 'team', 'Team'], ['#termine', 'ctermine', 'appt', 'Termine'], ['#chats', 'cchats', 'chat', 'Chats'], ['#admin/vorlagen', 'cvorlagen', 'tpl', 'Vorlagen']]
    .map(([h, r, ic, l]) => '<a href="' + h + '" data-r="' + r + '">' + TAB_SVG[ic] + '<span>' + esc($t(l)) + '</span>' + (r === 'cchats' ? '<i class="tabcnt" id="tabcnt"></i>' : '') + '</a>').join('') + '<button class="fab coachfab" type="button" data-act="coachPlus" aria-label="' + esc($t('Coach-Aktionen')) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>'; }
  if (want === 'coach') { const r = route.name === 'admin' ? (route.arg === 'vorlagen' ? 'cvorlagen' : 'cteam') : route.name === 'plan' && typeof isTplUid === 'function' && isTplUid(route.arg) ? 'cvorlagen' : route.name === 'termine' ? 'ctermine' : (route.name === 'chats' || route.name === 'chat') ? 'cchats' : route.name === 'heute' ? 'cteam' : '';
    el.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.dataset.r === r)); const n = Object.keys((typeof CHAT !== 'undefined' && CHAT.unread) || {}).reduce((s, k) => s + (k === 'coach' ? 0 : CHAT.unread[k]), 0); const c = document.getElementById('tabcnt'); if (c) { c.textContent = n || ''; c.hidden = !n; } } }
const _renderTabs = render;
render = function () { const r = _renderTabs.apply(this, arguments); try { tabSync(); } catch (e) {} return r; };

/* ---------- Termine ---------- */
function viewTermine() { if (!isAdmin()) return '<p>' + $t('Nur für Coach-Konten.') + '</p>'; if (APPT.list == null) apptEnsure(['termine']);
  if (ADMIN.clients == null && !ADMIN.loading) loadClients().then(() => { if (route.name === 'termine') render(); });
  const L = (APPT.list || []).filter(a => a.status !== 'cancelled' && a.status !== 'declined'); const up = L.filter(a => a.date >= today()), past = L.filter(a => a.date < today()).reverse();
  const group = arr => { let d = ''; return arr.map(a => { const h = a.date !== d ? '<div class="lbl" style="margin-top:12px">' + esc(a.date === today() ? $t('Heute') : fmtDay(a.date)) + '</div>' : ''; d = a.date; return h + '<div class="card" style="padding:4px 14px">' + apptRow(a, true) + '</div>'; }).join(''); };
  return pageTop($t('Termine'), '', up.length === 1 ? $t('1 anstehendes gemeinsames Training') : up.length ? $tf('{n} anstehende gemeinsame Trainings', { n: up.length }) : $t('Keine anstehenden gemeinsamen Trainings')) + '<div class="stack">' +
    '<div class="row"><button class="btn brand" data-act="coPick" data-v="appt" type="button">' + $t('+ Gemeinsames Training planen') + '</button></div>' +
    (APPT.list == null ? '<p class="muted">' + $t('Lade …') + '</p>' : (up.length ? group(up) : '<p class="muted">' + $t('Noch nichts geplant.') + '</p>') + (past.length ? '<div class="section-h"><h2>' + $t('Letzte 14 Tage') + '</h2></div>' + group(past) : '')) + '</div>'; }

/* ---------- Chats ---------- */
let CHATS_LAST = null, CHATS_LOADING = false;
async function chatsLoad() { if (CHATS_LOADING) return; CHATS_LOADING = true; try { const r = await api('/rest/v1/messages?coach_id=eq.' + AUTH.uid + '&select=athlete_id,sender,body,photo,created_at&order=created_at.desc&limit=300'); const by = {}; (r || []).forEach(m => { if (!by[m.athlete_id]) by[m.athlete_id] = m; }); CHATS_LAST = by; } catch (e) { CHATS_LAST = {}; } finally { CHATS_LOADING = false; } }
function viewChats() { if (!isAdmin()) return '<p>' + $t('Nur für Coach-Konten.') + '</p>'; if (CHATS_LAST == null && !CHATS_LOADING) chatsLoad().then(() => { if (CHATS_LAST != null && route.name === 'chats') render(); });
  if (ADMIN.clients == null && !ADMIN.loading) loadClients().then(() => { if (route.name === 'chats') render(); });
  const cl = (ADMIN.clients || []).slice().sort((a, b) => { const x = (CHATS_LAST || {})[a.id], y = (CHATS_LAST || {})[b.id]; return (y ? y.created_at : '') > (x ? x.created_at : '') ? 1 : -1; });
  return pageTop($t('Chats'), '', $t('Nachrichten mit deinen Athleten')) + '<div class="stack">' + (cl.length ? '<div class="card flush"><div class="list">' + cl.map(c => { const m = (CHATS_LAST || {})[c.id], n = chatUnreadFor(c.id);
    return '<a class="li" href="#chat/' + c.id + '"><span class="badge gym">' + esc(cname(c).slice(0, 1).toUpperCase()) + '</span><div class="grow" style="min-width:0"><b>' + esc(cname(c)) + '</b><small style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block">' + (m ? (m.sender === AUTH.uid ? $t('Du: ') : '') + esc(m.body || $t('Foto')) : $t('Noch keine Nachrichten')) + '</small></div>' + (n ? '<span class="cnt">' + n + '</span>' : (m ? '<span class="small muted">' + esc(ago(m.created_at)) + '</span>' : '')) + '</a>'; }).join('') + '</div></div>'
    : '<p class="muted">' + (ADMIN.clients == null ? $t('Lade …') : $t('Noch keine Athleten im Team.')) + '</p>') + '</div>'; }

/* ---------- Coach-Aktionen (+) ---------- */
function coachPlusSheet() { const t = (act, label, sub, extra) => '<button class="act-pick" data-act="' + act + '"' + (extra || '') + ' type="button"><span class="badge gym sm">' + esc($t(label).slice(0, 1)) + '</span><span class="grow">' + esc($t(label)) + '<br><span class="small muted" style="font-weight:500">' + esc($t(sub)) + '</span></span></button>';
  openSheet(sheetHead($t('Coaching')) + '<div class="menu" style="margin-top:14px">' + t('inviteNew', 'Athlet einladen', 'Einladungscode erstellen und teilen') + t('coPick', 'Gemeinsames Training planen', 'Termin an einer Einheit des Athleten', ' data-v="appt"') +
    t('coPick', 'Plan gemeinsam erstellen', 'Im Gym Übung für Übung mit Startgewichten', ' data-v="build"') + t('tplNew', 'Neue Vorlage', 'Plan einmal bauen, vielen zuweisen') + '</div>'); }
function coPickSheet(v) { const cl = ADMIN.clients || []; openSheet(sheetHead(v === 'build' ? $t('Plan gemeinsam erstellen') : $t('Gemeinsames Training planen')) + '<p class="muted" style="margin-top:6px">' + $t('Für welchen Athleten?') + '</p>' +
  (cl.length ? '<div class="card flush" style="margin-top:8px"><div class="list">' + cl.map(c => '<button class="li" data-act="coPickGo" data-v="' + v + '" data-uid="' + c.id + '" type="button"><span class="badge gym">' + esc(cname(c).slice(0, 1).toUpperCase()) + '</span><div class="grow"><b>' + esc(cname(c)) + '</b></div></button>').join('') + '</div></div>' : '<p>' + $t('Noch keine Athleten im Team.') + '</p>')); }
document.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'coachPlus') coachPlusSheet();
  else if (a === 'coPick') { if (ADMIN.clients == null) await loadClients(); coPickSheet(b.dataset.v); }
  else if (a === 'coPickGo') { closeSheet(); if (b.dataset.v === 'build') coLogStart(b.dataset.uid, { build: true, title: $t('Gemeinsam erstellt') }); else setTimeout(() => apptSheet(b.dataset.uid), 120); }
  else if (a === 'cmode') { TAB_MODE = null; setTimeout(tabSync, 0); } });
window.addEventListener('hashchange', () => setTimeout(tabSync, 0));
setInterval(() => { try { tabSync(); } catch (e) {} }, 15000);
