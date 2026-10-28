/* ======================= BETREIBER-KONSOLE (#ops): Konten verwalten, nur für Betreiber ======================= */
/* Zeigt bewusst nur Kontodaten (Name, Rolle, Coach, letzte Anmeldung), keine Trainings- oder Gesundheitsdaten. */
const OPS = { is: null, stats: null, users: null, coaches: [], q: '', busy: false, err: '' };
(function () { const st = document.createElement('style'); st.textContent = '.ops-kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ops-kpi div{background:var(--fog);border-radius:14px;padding:10px 8px;text-align:center}.ops-kpi b{display:block;font-size:22px}.ops-kpi span{font-size:12px;color:var(--muted)}.ops-row{display:flex;gap:10px;align-items:center;width:100%;text-align:left;background:none;border:0;border-top:1px solid var(--line,#eee);padding:10px 2px;font:inherit;color:inherit;cursor:pointer}.ops-row:first-child{border-top:0}.ops-tag{font-size:11px;font-weight:800;border-radius:8px;padding:2px 6px;background:var(--fog);margin-left:4px;white-space:nowrap}.ops-tag.red{background:#ffe3e0;color:#b42318}.ops-tag.brand{background:var(--ember);color:#fff}'; document.head.appendChild(st); })();
async function opsCall(body) { const r = await sbFetch('/functions/v1/hb-admin', { method: 'POST', body: JSON.stringify(body), headers: { Authorization: 'Bearer ' + await token() } }, 25000); return r; }
async function checkOperator() { if (!AUTH) { OPS.is = false; return; } try { const r = await api('/rest/v1/operators?user_id=eq.' + AUTH.uid + '&select=user_id'); OPS.is = !!(r && r.length); } catch (e) { OPS.is = false; } if (OPS.is && (route.name === 'mehr' || route.name === 'ops')) render(); }
async function opsLoad() { OPS.busy = true; OPS.err = '';
  try { const [s, u] = await Promise.all([opsCall({ action: 'stats' }), opsCall({ action: 'users', q: OPS.q })]); OPS.stats = s; OPS.users = u.users || []; OPS.coaches = u.coaches || []; }
  catch (e) { OPS.err = errTxt(e); if (!OPS.users) OPS.users = []; } OPS.busy = false; if (route.name === 'ops') render(); }
const opsDate = t => t ? new Date(t).toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit', year: '2-digit' }) : '–';
function viewOps() { const back = '<a href="#mehr" class="back">' + ICON.back + $t('Einstellungen') + '</a>';
  if (!AUTH) return back + '<p>' + $t('Bitte anmelden.') + '</p>';
  if (OPS.is === null) { checkOperator(); return back + '<p class="muted">' + $t('Lade …') + '</p>'; }
  if (!OPS.is) return back + '<p>' + $t('Nur für Betreiber-Konten.') + '</p>';
  if (OPS.users === null && !OPS.busy) opsLoad();
  const s = OPS.stats || {}; const k = (v, l) => '<div><b class="num">' + (v == null ? '–' : v) + '</b><span>' + l + '</span></div>';
  const rows = (OPS.users || []).map(u => '<button class="ops-row" data-act="opsUser" data-id="' + u.id + '" type="button"><div class="grow" style="min-width:0"><b>' + esc(u.display_name || u.username) + '</b> <span class="small muted">@' + esc(u.username) + '</span>' +
    (u.role === 'admin' ? '<span class="ops-tag brand">' + $t('Coach') + '</span>' : '') + (u.operator ? '<span class="ops-tag">' + $t('Betreiber') + '</span>' : '') + (u.banned ? '<span class="ops-tag red">' + $t('gesperrt') + '</span>' : '') +
    '<div class="small muted">' + (u.coach ? $t('Coach: @') + esc(u.coach) + ' · ' : '') + $t('seit ') + opsDate(u.created_at) + ' · ' + $t('zuletzt aktiv ') + opsDate(u.synced_at || u.last_sign_in) + '</div></div><span class="muted">›</span></button>').join('');
  return back + '<div class="top"><div class="grow"><h1><span class="t-ember">' + $t('Betreiber') + '</span> ' + $t('Konsole') + '</h1><div class="sub">' + $t('Konten verwalten. Trainings- und Gesundheitsdaten sind hier nicht sichtbar.') + '</div></div></div><div class="stack">' +
    '<div class="card"><div class="ops-kpi">' + k(s.users, $t('Konten')) + k(s.active7, $t('aktiv 7 Tage')) + k(s.new30, $t('neu 30 Tage')) + k(s.coaches, $t('Coaches')) + k(s.invOpen, $t('offene Einladungen')) + k(s.reqOpen, $t('offene Planwünsche')) + '</div>' +
    '<div class="row" style="margin-top:12px"><button class="btn brand" data-act="opsInvite" data-role="admin" type="button">' + $t('Coach einladen') + '</button><button class="btn" data-act="opsInvite" data-role="client" type="button">' + $t('Nutzer einladen') + '</button><div class="grow"></div><button class="btn sm" data-act="opsReload" type="button">' + ICON.sync + '</button></div></div>' +
    '<div class="card"><div class="row" style="flex-wrap:nowrap"><input id="ops-q" type="search" placeholder="' + $t('Name oder Benutzername') + '" value="' + esc(OPS.q) + '" style="flex:1;min-width:0"><button class="btn" data-act="opsSearch" type="button">' + $t('Suchen') + '</button></div>' +
    (OPS.err ? '<p class="small t-red" style="font-weight:700">' + esc(OPS.err) + '</p>' : '') +
    '<div style="margin-top:8px">' + (OPS.busy && !OPS.users ? '<p class="muted">' + $t('Lade …') + '</p>' : rows || '<p class="muted">' + $t('Keine Konten gefunden.') + '</p>') + '</div>' +
    (OPS.users && OPS.users.length >= 200 ? '<p class="small muted">' + $t('Die neuesten 200 Konten. Für ältere die Suche nutzen.') + '</p>' : '') + '</div></div>'; }
function opsUserSheet(id) { const u = (OPS.users || []).find(x => x.id === id); if (!u) return; const self = AUTH && id === AUTH.uid;
  const coachSel = '<select id="ops-coach" style="flex:1;min-width:0"><option value="">' + $t('kein Coach') + '</option>' + OPS.coaches.filter(c => c.id !== id).map(c => '<option value="' + c.id + '"' + (c.id === u.coach_id ? ' selected' : '') + '>@' + esc(c.username) + (c.display_name ? ' · ' + esc(c.display_name) : '') + '</option>').join('') + '</select>';
  openSheet(sheetHead(esc(u.display_name || u.username)) + '<p class="small muted" style="margin-top:6px">@' + esc(u.username) + ' · ' + esc((u.lang || 'de').toUpperCase()) + ' · ' + $t('erstellt ') + opsDate(u.created_at) + ' · ' + $t('letzte Anmeldung ') + opsDate(u.last_sign_in) + ' · ' + $t('letzter Sync ') + opsDate(u.synced_at) + '</p>' +
    '<div class="stack on-white" style="margin-top:12px">' +
    '<div class="field"><label for="ops-coach">' + $t('Coach') + '</label><div class="row" style="flex-wrap:nowrap">' + coachSel + '<button class="btn sm" data-act="opsCoach" data-id="' + id + '" type="button">' + $t('Speichern') + '</button></div></div>' +
    '<div class="row"><button class="btn" data-act="opsRole" data-id="' + id + '" data-role="' + (u.role === 'admin' ? 'client' : 'admin') + '" type="button">' + (u.role === 'admin' ? $t('Coach-Rechte entziehen') : $t('Zum Coach machen')) + '</button>' +
    '<button class="btn" data-act="opsPw" data-id="' + id + '" type="button">' + $t('Neues Passwort') + '</button>' +
    (self ? '' : '<button class="btn' + (u.banned ? '' : ' danger') + '" data-act="opsBan" data-id="' + id + '" data-v="' + (u.banned ? 'unblock' : 'block') + '" type="button">' + (u.banned ? $t('Entsperren') : $t('Sperren')) + '</button>') + '</div>' +
    '<div id="ops-out"></div>' +
    (self ? '' : '<details><summary class="small t-red" style="font-weight:700">' + $t('Konto löschen') + '</summary><p class="small">' + $t('Löscht das Konto mit allen Cloud-Daten endgültig. Zum Bestätigen den Benutzernamen eintippen.') + '</p><div class="row" style="flex-wrap:nowrap"><input id="ops-del" type="text" autocapitalize="off" placeholder="' + esc(u.username) + '" style="flex:1;min-width:0"><button class="btn danger" data-act="opsDel" data-id="' + id + '" type="button">' + $t('Löschen') + '</button></div></details>') +
    '</div>'); }
function opsInviteSheet(role) { openSheet(sheetHead(role === 'admin' ? $t('Coach einladen') : $t('Nutzer einladen')) + '<div class="stack on-white" style="margin-top:12px"><div class="field"><label for="ops-iname">' + $t('Name (optional)') + '</label><input id="ops-iname" type="text" style="width:100%"></div>' +
  (role === 'client' && OPS.coaches.length ? '<div class="field"><label for="ops-icoach">' + $t('Coach') + '</label><select id="ops-icoach"><option value="">' + $t('ohne Coach') + '</option>' + OPS.coaches.map(c => '<option value="' + c.id + '">@' + esc(c.username) + '</option>').join('') + '</select></div>' : '') +
  '<p class="small muted">' + (role === 'admin' ? $t('Der Code erstellt ein Coach-Konto. Der Coach kann danach selbst Athleten einladen.') : $t('Ohne Coach trainiert die Person selbstständig.')) + '</p>' +
  '<button class="btn brand block" data-act="opsInviteGo" data-role="' + role + '" type="button">' + $t('Code erstellen') + '</button></div>'); }
const _viewMehrOps = viewMehr;
viewMehr = function () { const h = _viewMehrOps(); if (!AUTH || VIEW) return h; if (OPS.is === null) { OPS.is = false; checkOperator(); }
  if (!OPS.is) return h; const card = '<a class="card" href="#ops" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit"><div class="grow"><h2 style="margin:0">' + $t('Betreiber-Konsole') + '</h2><p class="small muted" style="margin:2px 0 0">' + $t('Alle Konten, Coaches, Einladungen und Sperren verwalten.') + '</p></div><span class="muted">›</span></a>';
  return h.replace('<div class="stack">', '<div class="stack">' + card); };
document.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; if (!a.startsWith('ops')) return;
  const done = async msg => { toast(msg); closeSheet(); await opsLoad(); };
  try { switch (a) {
    case 'opsReload': OPS.users = null; opsLoad(); render(); break;
    case 'opsSearch': OPS.q = ($('#ops-q') || {}).value || ''; OPS.users = null; opsLoad(); render(); break;
    case 'opsUser': opsUserSheet(b.dataset.id); break;
    case 'opsInvite': opsInviteSheet(b.dataset.role); break;
    case 'opsInviteGo': { const name = (($('#ops-iname') || {}).value || '').trim(); const r = await opsCall({ action: 'invite', role: b.dataset.role, name, coach_id: ($('#ops-icoach') || {}).value || null });
      openSheet(sheetHead($t('Einladung erstellt')) + '<div class="codebox num">' + esc(r.code) + '</div><p class="muted">' + esc(inviteText(r.code, name)) + '</p><div class="row" style="margin-top:14px"><div class="grow"></div><button class="btn brand" data-act="inviteShare" data-code="' + esc(r.code) + '" data-name="' + esc(name) + '" type="button">' + $t('Teilen') + '</button></div>'); opsLoad(); break; }
    case 'opsCoach': await opsCall({ action: 'assign_coach', user_id: b.dataset.id, coach_id: ($('#ops-coach') || {}).value || null }); await done($t('Coach gespeichert')); break;
    case 'opsRole': await opsCall({ action: 'set_role', user_id: b.dataset.id, role: b.dataset.role }); await done($t('Rolle geändert')); break;
    case 'opsBan': await opsCall({ action: b.dataset.v, user_id: b.dataset.id }); await done(b.dataset.v === 'block' ? $t('Konto gesperrt') : $t('Konto entsperrt')); break;
    case 'opsPw': { if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = $t('Wirklich neues Passwort?'); break; } const r = await opsCall({ action: 'reset_pw', user_id: b.dataset.id });
      const out = $('#ops-out'); if (out) out.innerHTML = '<div class="codebox num" style="font-size:22px">' + esc(r.password) + '</div><p class="small muted">' + $t('Gib das Passwort der Person weiter. Sie kann es danach unter Einstellungen ändern.') + '</p>'; break; }
    case 'opsDel': await opsCall({ action: 'delete_user', user_id: b.dataset.id, confirm: ($('#ops-del') || {}).value || '' }); await done($t('Konto gelöscht')); break;
  } } catch (err) { toast(OPS_ERR[err && err.body && err.body.error] || errTxt(err)); } });
const OPS_ERR = { has_clients: $t('Dieser Coach hat noch Athleten. Erst die Athleten einem anderen Coach zuweisen.'), not_coach: $t('Das gewählte Konto ist kein Coach.'), self: $t('Das geht nicht beim eigenen Konto.'), confirm_mismatch: $t('Der Benutzername stimmt nicht.') };
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'ops-q') { e.preventDefault(); const bb = document.querySelector('[data-act=opsSearch]'); if (bb) bb.click(); } });
if (route.name === 'start' || route.name === 'ops' || route.name === 'mehr') render();
