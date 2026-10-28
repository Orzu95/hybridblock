/* Hybridblock – Konto, Cloud-Sync, Onboarding, Coaching (Admin) und Plan-Editor */
'use strict';

/* ======================= SUPABASE ======================= */
const SB = { url: 'https://eumwznaujhcradwvsblw.supabase.co', key: 'sb_publishable_uaIjHYNLAl3ksTBlPltCRQ_QZ6DQ-Zd', domain: 'hybridblock.app' };
const AUTH_KEY = 'hb_auth_v1';
let AUTH = null; try { AUTH = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch (e) {}
let VIEW = null; /* Admin schaut die Daten eines Kunden an (nur lesen) */
const ERR_TXT = { invalid_code: $t('Code ungültig, schon benutzt oder abgelaufen.'), bad_username: $t('Benutzername: 3–24 Zeichen, nur a–z, 0–9, Punkt, Strich oder Unterstrich.'), short_password: $t('Passwort: mindestens 8 Zeichen.'),
  username_taken: $t('Dieser Benutzername ist schon vergeben.'), 'Invalid login credentials': $t('Benutzername oder Passwort falsch.'), forbidden: $t('Keine Berechtigung.'), not_logged_in: $t('Nicht angemeldet.'), Failed_fetch: $t('Keine Verbindung zum Server.') };
const errTxt = e => { const m = (e && (e.body && e.body.error) || e && e.message) || String(e); if (/Failed to fetch|NetworkError|AbortError|Load failed/i.test(m) || (e && e.name === 'AbortError')) return ERR_TXT.Failed_fetch; return ERR_TXT[m] || m; };
function saveAuth() { try { if (AUTH) localStorage.setItem(AUTH_KEY, JSON.stringify(AUTH)); else localStorage.removeItem(AUTH_KEY); } catch (e) {} }
async function sbFetch(path, opt, ms) { opt = opt || {}; const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms || 15000);
  try { const r = await fetch(SB.url + path, Object.assign({}, opt, { signal: ac.signal, headers: Object.assign({ apikey: SB.key, 'Content-Type': 'application/json' }, opt.headers || {}) }));
    const txt = await r.text(); let j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
    if (!r.ok) { const err = new Error((j && (j.error_description || j.msg || j.message || j.error)) || ($t('HTTP ') + r.status)); err.status = r.status; err.body = j; throw err; }
    return j; } finally { clearTimeout(t); } }
function setAuth(j) { const keep = AUTH && AUTH.uid === j.user.id ? AUTH.profile : null; AUTH = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at || Math.floor(Date.now() / 1000 + (j.expires_in || 3600)), uid: j.user.id, profile: keep }; saveAuth(); }
let refreshing = null;
async function token() { if (!AUTH) throw new Error('not_logged_in');
  if (Date.now() / 1000 > AUTH.expires_at - 90) { if (!refreshing) refreshing = sbFetch('/auth/v1/token?grant_type=refresh_token', { method: $t('POST'), body: JSON.stringify({ refresh_token: AUTH.refresh_token }) })
      .then(setAuth).catch(e => { if (e.status === 400 || e.status === 401) { AUTH = null; saveAuth(); } throw e; }).finally(() => { refreshing = null; }); await refreshing; }
  return AUTH.access_token; }
async function api(path, opt) { opt = opt || {}; const tk = await token(); return sbFetch(path, Object.assign({}, opt, { headers: Object.assign({ Authorization: $t('Bearer ') + tk }, opt.headers || {}) })); }
async function fnCall(body, withAuth) { const h = withAuth ? { Authorization: $t('Bearer ') + await token() } : {}; return sbFetch('/functions/v1/hb-auth', { method: $t('POST'), body: JSON.stringify(body), headers: h }, 25000); }
const isAdmin = () => !!(AUTH && AUTH.profile && AUTH.profile.role === 'admin');
const hasCoach = () => !!(AUTH && AUTH.profile && AUTH.profile.coach_id);
/* Benutzername normalisieren: Lourenço → lourenco, Max Müller → max.mueller */
function normUser(u) { return String(u || '').trim().toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.').replace(/[^a-z0-9._-]/g, ''); }
function userHint(u) { const n = normUser(u); return u && n !== String(u).trim() ? $t('Anmeldename: ') + '<b>' + esc(n || '–') + '</b>' : ''; }
async function login(username, password) { const j = await sbFetch('/auth/v1/token?grant_type=password', { method: $t('POST'), body: JSON.stringify({ email: normUser(username) + '@' + SB.domain, password }) }); setAuth(j); await loadProfile(); }
async function loadProfile() { const r = await api('/rest/v1/profiles?id=eq.' + AUTH.uid + '&select=id,username,display_name,role,coach_id,lang'); AUTH.profile = r && r[0] || null; saveAuth(); return AUTH.profile; }
async function logout() { try { if (AUTH) await api('/auth/v1/logout', { method: $t('POST') }); } catch (e) {} AUTH = null; saveAuth(); S.meta.syncAt = null; S.meta.syncMod = null; S.meta.planAt = null; persist(); }

/* ======================= SYNC ======================= */
const SYNC = { t: null, busy: false, err: null, pulled: false };
function cloudDirty() { if (!AUTH || VIEW) return; clearTimeout(SYNC.t); SYNC.t = setTimeout(pushState, 4000); }
const hasLocalData = st => !!(st && (Object.keys(st.sessions || {}).length || Object.keys(st.days || {}).length || (st.activities || []).length));
function cloudCopy() { const c = JSON.parse(JSON.stringify(S)); return c; }
async function pushState() { if (!AUTH || VIEW) return; if (SYNC.busy) { cloudDirty(); return; } SYNC.busy = true; const mod = S.meta.modAt || Date.now();
  try { const now = new Date().toISOString(); S.meta.syncAt = now; S.meta.syncMod = mod;
    await api('/rest/v1/user_state?on_conflict=user_id', { method: $t('POST'), headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: AUTH.uid, state: cloudCopy(), summary: makeSummary(), updated_at: now }) });
    SYNC.err = null; persist(); } catch (e) { SYNC.err = errTxt(e); S.meta.syncMod = null; } finally { SYNC.busy = false; } }
async function pushPlan(uid, plan) { const now = new Date().toISOString();
  await api('/rest/v1/plans?on_conflict=user_id', { method: $t('POST'), headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: uid, plan, updated_at: now, updated_by: AUTH.uid }) }); return now; }
/* Plan übernehmen: Wochentage für neue Einheiten aus dem Plan, Ernährungsziele vom Coach als Check-in */
function setPlan(plan, fromCoach) { S.plan = JSON.parse(JSON.stringify(plan)); S.plan.sessions.forEach(x => { const cur = S.settings.dayMap[x.k]; if (cur === undefined || (fromCoach && !S.meta.daysSet)) S.settings.dayMap[x.k] = plan.dayMap && plan.dayMap[x.k] != null ? plan.dayMap[x.k] : (cur ?? ''); });
  const tg = plan.targets; if (tg && tg.at && tg.at !== S.meta.targetsAt) { S.meta.targetsAt = tg.at; const st = S.settings;
    ['protein', 'fat', 'goalRate', 'targetWeight'].forEach(k => { if (num(tg[k]) != null) st[k] = String(tg[k]); });
    if (num(tg.kcal) != null) { st.startKcal = String(tg.kcal); const p = num(st.protein) || 200, f = num(st.fat) || 70; const c = { date: today(), kcal: num(tg.kcal), p, f, c: Math.max(0, Math.round((num(tg.kcal) - 4 * p - 9 * f) / 4)), tdee: null, coach: true };
      S.checkins = S.checkins.filter(x => x.date !== c.date).concat([c]); } }
  applyPlan(); }
async function pullAll(opts) { opts = opts || {}; if (!AUTH || VIEW) return { changed: false }; let changed = false;
  try { await loadProfile();
    const pl = await api('/rest/v1/plans?user_id=eq.' + AUTH.uid + '&select=plan,updated_at,updated_by');
    const st = await api('/rest/v1/user_state?user_id=eq.' + AUTH.uid + '&select=state,updated_at');
    const remote = st && st[0];
    if (remote && remote.state) { const rAt = Date.parse(remote.updated_at), lAt = S.meta.syncAt ? Date.parse(S.meta.syncAt) : 0; const unsynced = (S.meta.modAt || 0) > (S.meta.syncMod || 0);
      if (opts.first && hasLocalData(S) && !S.meta.syncAt && hasLocalData(remote.state)) return { conflict: remote };
      if (rAt > lAt + 1000 && (!unsynced || rAt > (S.meta.modAt || 0))) { adoptRemote(remote); changed = true; } }
    const p = pl && pl[0];
    if (p && (!S.meta.planAt || Date.parse(p.updated_at) > Date.parse(S.meta.planAt))) { const fromCoach = p.updated_by && p.updated_by !== AUTH.uid; setPlan(p.plan, fromCoach); S.meta.planAt = p.updated_at; persist(); changed = true; if (fromCoach && !opts.quiet) { setTimeout(() => toast($t('Dein Coach hat deinen Plan aktualisiert.')), 400); localNotify(310, $t('Neuer Plan'), $t('Dein Coach hat deinen Plan aktualisiert.')); } }
    if (!remote || (S.meta.modAt || 0) > (S.meta.syncMod || 0)) await pushState();
    SYNC.err = null; SYNC.pulled = true; } catch (e) { SYNC.err = errTxt(e); }
  return { changed }; }
function adoptRemote(remote) { const keepAuthMeta = { planAt: S.meta.planAt }; S = loadState(JSON.stringify(remote.state)); S.meta.syncAt = remote.updated_at; S.meta.modAt = Date.parse(remote.updated_at); S.meta.syncMod = S.meta.modAt; if (keepAuthMeta.planAt && !S.meta.planAt) S.meta.planAt = keepAuthMeta.planAt; S.meta.onboarded = true; applyPlan(); persist(); }
async function syncNow(silent) { if (!AUTH) return; const r = await pullAll({}); if (r.changed) render(); if (!silent) toast(SYNC.err ? $t('Sync fehlgeschlagen: ') + SYNC.err : $t('Synchronisiert')); }
let lastPull = 0;
function autoPull() { if (!AUTH || VIEW || Date.now() - lastPull < 60 * 1000) return; lastPull = Date.now(); if (isAdmin()) loadClients().then(() => { if (route.name === 'heute' || route.name === 'admin') render(); }); pullAll({}).then(r => { if (r.changed && !document.querySelector('input:focus,select:focus,textarea:focus')) render(); }); }

/* Kurzfassung für die Kundenliste des Coaches */
function makeSummary() { const w = curWeek(), ser = series(), last = ser[ser.length - 1], tg = currentTargets(); let kc = 0, pr = 0, kn = 0;
  for (let i = 0; i < 7; i++) { const d = addDays(today(), -i); const o = S.days[d]; if (o && o.entries && o.entries.length && o.complete !== false) { const t = dayTotals(d); kc += t.kcal; pr += t.p; kn++; } }
  let lastTrain = null; Object.values(S.sessions).forEach(s => { if (s.date && (s.logs && Object.keys(s.logs).length || s.cardio) && (!lastTrain || s.date > lastTrain)) lastTrain = s.date; }); S.activities.forEach(a => { if (!lastTrain || a.date > lastTrain) lastTrain = a.date; });
  const avgH = f => { const v = []; for (let i = 0; i < 7; i++) { const h = S.health[addDays(today(), -i)]; const x = h && (f === 'rhr' ? (h.rhr ?? h.rhrEst) : h[f]); if (x != null) v.push(x); } return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; };
  const wd = Object.keys(S.days).filter(d => num(S.days[d].weight) != null).sort(); const dr = dailyReadiness(today());
  return { name: S.settings.name || '', week: w, done: ORDER.filter(k => { const p = sessProgress(w, k); return p.done && !p.skipped; }).length, total: ORDER.length, lastTrain,
    trend: last ? Math.round(last.trend * 10) / 10 : null, rate: weeklyRate(ser), weight: wd.length ? num(S.days[wd[wd.length - 1]].weight) : null, start: num(S.settings.startWeight), target: num(S.settings.targetWeight),
    kcal7: kn ? Math.round(kc / kn) : null, prot7: kn ? Math.round(pr / kn) : null, logged7: kn, kcalT: tg.kcal, protT: tg.p, steps7: avgH('steps'), sleep7: avgH('sleepMin'), rhr7: avgH('rhr'), ready: dr ? dr.score : null, plan: S.plan.name, at: new Date().toISOString() }; }

/* ======================= ANSICHT ALS KUNDE ======================= */
function enterView(uid, name, state, to) { VIEW = { uid, name, own: S, back: '#admin/' + uid }; S = loadState(JSON.stringify(state)); applyPlan(); document.body.classList.add('viewing'); ui.week = null; location.hash = to || '#verlauf'; }
function exitView() { if (!VIEW) return; const back = VIEW.back; S = VIEW.own; VIEW = null; applyPlan(); document.body.classList.remove('viewing'); ui.week = null; location.hash = back; }
const viewBar = () => VIEW ? $t('<div class="viewbar"><span class="grow">Ansicht: <b>') + esc(VIEW.name) + $t('</b> · nur lesen</span><a class="btn sm" href="#training">Training</a><a class="btn sm" href="#verlauf">Verlauf</a><a class="btn sm" href="#essen">Essen</a><button class="btn sm dark" data-act="viewExit" type="button">Zurück</button></div>') : '';

/* ======================= ONBOARDING ======================= */
const ONB = { step: 'welcome', inv: null, data: {}, busy: false, err: '' };
const ACT_LEVELS = [['1.3', $t('Sitzend (Büro, wenig Bewegung)')], ['1.45', $t('Leicht aktiv (viel gehen, stehen)')], ['1.6', $t('Aktiv (körperliche Arbeit)')], ['1.75', $t('Sehr aktiv (Sport plus aktiver Alltag)')]];
const r50 = n => Math.round(n / 50) * 50, r5 = n => Math.round(n / 5) * 5;
function onbCalc(d) { const wt = num(d.weight), h = num(d.height), age = num(d.age), tw = num(d.target) || wt; if (!wt || !h || !age) return null;
  const bmr = 10 * wt + 6.25 * h - 5 * age + (d.sex === 'w' ? -161 : 5); const tdee = r50(bmr * (num(d.act) || 1.45));
  const rate = tw < wt - 0.5 ? Math.min(1, Math.round(wt * 0.006 * 10) / 10) : 0; const floor = d.sex === 'w' ? 1400 : 1800;
  const kcal = Math.max(floor, r50(tdee - rate * 1100)); const base = Math.min(wt, tw); const protein = r5(2 * base), fat = r5(0.7 * base);
  return { tdee, rate, floor, kcal, protein, fat, hfmax: Math.round(208 - 0.7 * age) }; }
function viewStart(arg) { if (arg && ONB.step === 'welcome' && ['code', 'login', 'profile', 'forgot'].includes(arg)) ONB.step = arg;
  const lang = '<div class="seg langseg">' + [['de', $t('Deutsch')], ['en', $t('English')], ['ru', $t('Русский')]].map(l => '<button class="' + (LANG === l[0] ? 'on' : '') + '" data-act="setLang" data-v="' + l[0] + '" type="button">' + l[1] + '</button>').join('') + '</div>';
  const err = ONB.err ? '<p class="small t-red" style="font-weight:700;margin-top:10px">' + esc(ONB.err) + '</p>' : '';
  const busy = ONB.busy ? $t(' disabled') : ''; const d = ONB.data; const f = (k, lab, type, ph, extra) => '<div class="field"><label for="ob-' + k + '">' + lab + '</label><input id="ob-' + k + '" data-ob="' + k + '" type="' + (type || 'number') + '"' + (type ? '' : ' inputmode="decimal" step="any"') + ' value="' + esc(d[k]) + '" placeholder="' + (ph || '') + '"' + (extra || '') + '></div>';
  const head = (a, b, sub) => '<div class="onb-top"><div class="logo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M3 10v4M6.5 7v10M17.5 7v10M21 10v4M6.5 12h11"/></svg></div><h1><span class="t-ember">' + a + '</span> ' + b + '</h1>' + (sub ? '<p class="muted">' + sub + '</p>' : '') + '</div>';
  const back = to => '<button class="back" data-act="onbGo" data-v="' + to + '" type="button" style="background:none;border:0;padding:0;cursor:pointer">' + ICON.back + $t('Zurück</button>');
  let body = '';
  if (ONB.step === 'welcome') body = head($t('Hybridblock'), $t('Training und Ernährung'), $t('Kraft mit Autoregulation, Cardio nach Puls und Ernährung mit adaptivem Kalorienbedarf.')) + lang +
    $t('<div class="stack" style="margin-top:20px"><button class="btn brand block" data-act="onbGo" data-v="code" type="button">Ich habe einen Einladungscode</button><button class="btn block fog" data-act="onbGo" data-v="login" type="button">Ich habe schon ein Konto</button><button class="btn block" data-act="onbGo" data-v="noacc" type="button" style="background:none">Ohne Konto starten</button></div>') +
    $t('<p class="small muted" style="margin-top:14px">Mit Konto werden deine Daten gesichert und auf mehreren Geräten synchronisiert. Hast du einen Coach, sieht er deinen Fortschritt und schickt dir deinen Plan.</p>');
  else if (ONB.step === 'code') body = back('welcome') + head($t('Einladung einlösen'), '', ONB.inv ? (ONB.inv.name ? $t('Einladung für <b>') + esc(ONB.inv.name) + '</b>' + (ONB.inv.role === 'admin' ? $t(' · Coach-Konto') : '') + $t('. Wähle jetzt deinen Benutzernamen und ein Passwort.') : (ONB.inv.role === 'admin' ? $t('Einladung für ein Coach-Konto. ') : $t('Dein Coach hat dich eingeladen. ')) + $t('Wähle jetzt deinen Benutzernamen und ein Passwort.')) : $t('Den Code bekommst du von deinem Coach.')) +
    '<div class="card"><div class="fields">' + (ONB.inv ? f('user', $t('Benutzername'), 'text', $t('z. B. max.mueller'), ' autocomplete="username" autocapitalize="off" style="width:100%"') + '<p class="small muted" id="ob-userhint" style="margin:-4px 0 0">' + userHint(d.user) + '</p>' + f('pw', $t('Passwort'), 'password', $t('mind. 8 Zeichen'), ' autocomplete="new-password" style="width:100%"') + f('pw2', $t('Passwort wiederholen'), 'password', '', ' autocomplete="new-password" style="width:100%"')
      : f('code', $t('Einladungscode'), 'text', $t('HB-XXXXXX'), ' autocapitalize="characters" autocomplete="off" style="width:100%;text-transform:uppercase;letter-spacing:.08em"')) + '</div>' + err +
    '<button class="btn brand block" style="margin-top:16px" data-act="' + (ONB.inv ? 'onbRedeem' : 'onbCheck') + '" type="button"' + busy + '>' + (ONB.busy ? $t('Einen Moment …') : ONB.inv ? $t('Konto erstellen') : $t('Weiter')) + '</button></div>';
  else if (ONB.step === 'login') body = back('welcome') + head($t('Anmelden'), '', $t('Mit deinem Benutzernamen und Passwort.')) +
    '<div class="card"><div class="fields">' + f('user', $t('Benutzername'), 'text', '', ' autocomplete="username" autocapitalize="off" style="width:100%"') + '<p class="small muted" id="ob-userhint" style="margin:-4px 0 0">' + userHint(d.user) + '</p>' + f('pw', $t('Passwort'), 'password', '', ' autocomplete="current-password" style="width:100%"') + '</div>' + err +
    '<button class="btn brand block" style="margin-top:16px" data-act="onbLogin" type="button"' + busy + '>' + (ONB.busy ? $t('Einen Moment …') : $t('Anmelden')) + '</button><!--forgot--></div>';
  else if (ONB.step === 'conflict') body = head($t('Zwei'), $t('Datenstände'), $t('Auf diesem Gerät und in deinem Konto liegen unterschiedliche Daten. Welche sollen gelten?')) +
    $t('<div class="stack"><button class="btn brand block" data-act="onbConflict" data-v="remote" type="button">Daten aus dem Konto laden</button><button class="btn block fog" data-act="onbConflict" data-v="local" type="button">Daten von diesem Gerät hochladen</button></div><p class="small muted" style="margin-top:12px">Die andere Variante wird überschrieben. Im Zweifel vorher unter Einstellungen eine Sicherung exportieren.</p>');
  else if (ONB.step === 'profile') { const tg = S.plan.targets; body = (AUTH ? '' : back('welcome')) + head($t('Über'), $t('dich'), $t('Daraus berechnet die App Startkalorien, Protein und deine Pulszonen. Alles lässt sich später ändern.')) +
    '<div class="card"><div class="fields">' + f('name', $t('Vorname'), 'text', '', ' style="width:100%" autocomplete="given-name"') +
    $t('<div class="field"><label for="ob-sex">Geschlecht</label><select id="ob-sex" data-ob="sex"><option value="m"') + (d.sex !== 'w' ? $t(' selected') : '') + $t('>männlich</option><option value="w"') + (d.sex === 'w' ? $t(' selected') : '') + $t('>weiblich</option></select></div>') +
    f('age', $t('Alter'), '', $t('Jahre')) + f('height', $t('Größe (cm)'), '', $t('cm')) + f('weight', $t('Gewicht (kg)'), '', $t('kg')) + f('target', $t('Zielgewicht (kg)'), '', $t('kg')) +
    $t('<div class="field" style="flex:1 1 100%"><label for="ob-act">Alltag (ohne Training)</label><select id="ob-act" data-ob="act">') + ACT_LEVELS.map(a => '<option value="' + a[0] + '"' + (String(d.act || '1.45') === a[0] ? $t(' selected') : '') + '>' + a[1] + '</option>').join('') + '</select></div>' +
    f('rhr', $t('Ruhepuls (optional)'), '', $t('bpm')) + f('vo2', $t('VO₂max (optional)'), '', '') + '</div>' + err +
    (tg ? $t('<p class="small" style="margin-top:12px"><b>Dein Coach</b> hat Ernährungsziele vorgegeben. Sie werden übernommen.</p>') : '') +
    $t('<button class="btn brand block" style="margin-top:16px" data-act="onbProfile" type="button">Weiter</button></div>'); }
  else if (ONB.step === 'days') { const sel = k => '<div class="field"><label for="od-' + k + '">' + esc($t(SESS[k].title)) + '</label><select id="od-' + k + '" data-od="' + k + $t('"><option value="">ohne festen Tag</option>') + [1, 2, 3, 4, 5, 6, 0].map(x => '<option value="' + x + '"' + (String(S.settings.dayMap[k]) === String(x) ? $t(' selected') : '') + '>' + WD_LONG[x] + '</option>').join('') + '</select></div>';
    body = back('profile') + head($t('Deine'), $t('Trainingstage'), $t('Dein Plan: <b>') + esc($t(S.plan.name)) + $t('</b> mit ') + ORDER.length + $t(' Einheiten pro Woche. Wann machst du was? Du kannst auch ohne feste Tage einfach der Reihe nach trainieren.')) +
      '<div class="card"><div class="fields">' + ORDER.map(sel).join('') + $t('</div><div class="field" style="margin-top:14px"><label for="od-mode">Modus</label><select id="od-mode" data-od="mode"><option value="days"') + (S.settings.mode !== 'rotation' ? $t(' selected') : '') + $t('>Feste Wochentage</option><option value="rotation"') + (S.settings.mode === 'rotation' ? $t(' selected') : '') + $t('>Der Reihe nach, egal welcher Tag</option></select></div>') +
      $t('<button class="btn brand block" style="margin-top:16px" data-act="onbGo" data-v="summary" type="button">Weiter</button></div>'); }
  else if (ONB.step === 'summary') { const st = S.settings;
    const g = (k, lab) => '<div class="field"><label for="os-' + k + '">' + lab + '</label><input id="os-' + k + '" type="number" inputmode="decimal" step="any" data-st="' + k + '" value="' + esc(st[k]) + '"></div>';
    body = back('days') + head($t('Deine'), $t('Startwerte'), $t('Die App passt den Bedarf wöchentlich an deinen echten Gewichtsverlauf an. Das hier ist nur der Anfang.')) +
      '<div class="card"><div class="fields">' + g('startKcal', $t('Kalorien pro Tag')) + g('protein', $t('Protein (g)')) + g('fat', $t('Fett (g)')) + g('goalRate', $t('Ziel kg pro Woche')) + g('tdee0', $t('Geschätzter Bedarf')) + g('hfmax', $t('Maximalpuls')) + '</div>' +
      $t('<p class="small muted" style="margin-top:12px">Bedarf nach Mifflin-St Jeor × Alltagsfaktor. Abnehmen mit etwa 0,6 % des Körpergewichts pro Woche, Protein 2 g pro kg Zielgewicht. Maximalpuls nach Tanaka (208 − 0,7 × Alter): hat deine Uhr einen höheren Wert gemessen, nimm den.</p>') +
      $t('<button class="btn brand block" style="margin-top:16px" data-act="onbFinish" type="button">Los geht’s</button></div>'); }
  else if (ONB.step === 'goals') body = back('profile') + head($t('Dein'), $t('Ziel'), $t('Damit passt der Plan zu dir: Ziel, Erfahrung, Zeit und wo du trainierst.')) +
    '<div class="card">' + goalsFields(S.settings.q || {}) + $t('<button class="btn fog block" style="margin-top:14px" data-act="onbStudio" type="button">Geräte in meinem Studio festlegen (optional)</button>') + err +
    $t('<button class="btn brand block" style="margin-top:12px" data-act="onbGoals" type="button">Weiter</button></div>');
  else if (ONB.step === 'path') body = back('goals') + head($t('Wie willst du'), $t('trainieren?'), $t('Du kannst das später jederzeit ändern.')) + '<div class="stack">' +
    [['library', $t('Fertigen Plan wählen'), $t('Bewährte Pläne aus freien Quellen, passend zu deinem Ziel empfohlen.')], ['gen', $t('Plan aus meinen Angaben'), $t('Die App stellt dir einen Plan aus Ziel, Zeit, Geräten und Erfahrung zusammen.')], ['self', $t('Selbst planen'), $t('Du baust deinen Plan selbst, Einheit für Einheit.')], ['none', $t('Ohne festen Plan'), $t('Einzelne Trainings planen und frei trainieren, wann du willst.')]]
      .map(o => '<button class="card pathcard" data-act="onbPath" data-v="' + o[0] + '" type="button"><b>' + o[1] + '</b><span class="small muted">' + o[2] + '</span></button>').join('') + '</div>';
  else if (ONB.step === 'library') { const rec = recommendPlans(libQuery()); const top = rec.slice(0, 3), rest = rec.slice(3);
    body = back(ONB.mode === 'library' ? 'goals' : 'path') + head($t('Dein'), $t('Plan'), $t('Die ersten drei passen am besten zu deinen Angaben. Tippe auf einen Plan für Details.')) + '<div class="stack">' + top.map(r => onbLibCard(r.p, r.why)).join('') +
      $t('<details class="card"><summary><b>Alle Pläne</b></summary><div class="stack" style="margin-top:12px">') + rest.map(r => onbLibCard(r.p, [])).join('') + '</div></details></div>'; }
  else if (ONB.step === 'genprev') { ui.genPlan = ui.genPlan || generatePlan(libQuery()); body = back('path') + head($t('Dein'), $t('Planvorschlag'), $t('Aus deinen Angaben erstellt. Du kannst ihn danach Übung für Übung anpassen.')) +
      '<div class="card">' + planSessionsHTML(ui.genPlan) + $t('</div><div class="row" style="margin-top:12px"><button class="btn" data-act="onbGenAgain" type="button">Andere Übungen</button><div class="grow"></div><button class="btn brand" data-act="onbPick" data-id="gen" type="button">Übernehmen</button></div>'); }
  else if (ONB.step === 'intake') { const q = S.settings.q || {}; const pain = q.pain || {}; const regs = Object.keys(pain);
    body = back('goals') + head($t('Angaben für'), $t('deinen Coach'), $t('Damit dein Coach den Plan genau auf dich zuschneiden kann. Alles ist freiwillig.')) + '<div class="stack">' +
      $t('<div class="card"><h2>Beschwerden</h2><p class="small muted">Tippe auf die Stelle am Körper, die Probleme macht. Nochmal tippen entfernt sie.</p>') + painMapHTML(pain, true) +
      (regs.length ? regs.map(r => painFields(r, pain[r])).join('') : $t('<p class="small muted">Keine Beschwerden markiert.</p>')) + '</div>' +
      $t('<div class="card"><div class="fields"><div class="field" style="flex:1 1 100%"><label for="ik-sport">Sport nebenher</label><input id="ik-sport" type="text" data-ik="sport" value="') + esc(q.sport || '') + $t('" placeholder="z. B. Fußball 2× pro Woche" style="width:100%"></div>') +
      $t('<div class="field" style="flex:1 1 100%"><label for="ik-likes">Was magst du, was nicht?</label><input id="ik-likes" type="text" data-ik="likes" value="') + esc(q.likes || '') + $t('" placeholder="z. B. liebe Kniebeugen, hasse Laufen" style="width:100%"></div>') +
      $t('<div class="field" style="flex:1 1 100%"><label for="ik-notes">Nachricht an deinen Coach</label><textarea id="ik-notes" data-ik="notes" placeholder="Wünsche, Termine, alles was wichtig ist" style="font-family:var(--f);font-size:15px">') + esc(q.notes || '') + '</textarea></div></div></div>' + err +
      '<button class="btn brand block" data-act="onbIntake" type="button"' + busy + '>' + (ONB.busy ? $t('Einen Moment …') : $t('An meinen Coach senden')) + '</button></div>'; }
  return '<div class="onb">' + body + '</div>'; }
function onbLibCard(p, why) { return '<button class="card libcard" data-act="onbLibOpen" data-id="' + p.id + '" type="button" style="text-align:left;border:0;width:100%;cursor:pointer;font:inherit;color:inherit"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div class="grow"><h2 style="margin:0">' + esc($t(p.name)) + '</h2><div class="small muted">' + esc($t(p.author)) + '</div></div><span class="grade sw-only g' + p.ev.g + '">' + p.ev.g + '</span></div><p class="small" style="margin-top:8px">' + esc($t(p.desc)) + '</p><div class="small muted">' + esc(factsOf(p)) + '</div>' + (why && why.length ? '<div class="small t-green" style="font-weight:700;margin-top:6px">' + esc(why.join(' · ')) + '</div>' : '') + '</button>'; }
/* Beschwerden: anklickbare Körperkarte */
function painMapHTML(pain, editable) { const sel = new Set(Object.keys(pain || {}));
  const side = key => { const s = BODY[key]; let g = ''; for (const slug in s.parts) { const reg = SLUG_REGION[slug]; const on = reg && sel.has(reg); const fill = !reg ? '#efefef' : on ? $t('var(--signal)') : '#e3e3e3';
      s.parts[slug].forEach(d => { g += '<path d="' + d + '" fill="' + fill + '" stroke="#ffffff" stroke-width="2"' + (reg && editable ? ' data-act="painToggle" data-r="' + reg + '" style="cursor:pointer"' : '') + '/>'; }); }
    return '<svg viewBox="' + s.vb + $t('" role="img" aria-label="Körperkarte">') + g + '</svg>'; };
  return '<div class="bodymap">' + side('front') + side('back') + '</div>' + (sel.size ? '<div class="chips" style="margin-top:8px">' + [...sel].map(r => '<span class="chip on">' + esc(REGION_TXT[r] || r) + '</span>').join('') + '</div>' : ''); }
const SINCE = [['acute', $t('seit weniger als 2 Wochen')], ['sub', $t('2 bis 6 Wochen')], ['long', $t('6 Wochen bis 6 Monate')], ['chronic', $t('länger als 6 Monate')], ['old', $t('alte Verletzung, aktuell ruhig')]];
function painFields(r, v) { v = v || {}; const sel = (f, lab, opts) => '<div class="field"><label>' + lab + '</label><select data-pain="' + r + '" data-pf="' + f + '"><option value="">–</option>' + opts.map(o => '<option value="' + o[0] + '"' + (v[f] === o[0] ? $t(' selected') : '') + '>' + o[1] + '</option>').join('') + '</select></div>';
  const txt = (f, lab, ph) => '<div class="field" style="flex:1 1 100%"><label>' + lab + '</label><input type="text" data-pain="' + r + '" data-pf="' + f + '" value="' + esc(v[f] || '') + '" placeholder="' + ph + '" style="width:100%"></div>';
  return '<div class="painbox"><b>' + esc(REGION_TXT[r] || r) + '</b><div class="fields" style="margin-top:8px">' + sel('since', $t('Seit wann'), SINCE) + $t('<div class="field"><label>Stärke 0–10</label><input type="number" inputmode="numeric" min="0" max="10" data-pain="') + r + '" data-pf="level" value="' + esc(v.level ?? '') + '" style="width:90px"></div>' +
    sel('doc', $t('Ärztlich abgeklärt'), [['yes', 'ja'], ['no', 'nein'], ['running', $t('läuft gerade')]]) + txt('bad', $t('Was tut weh oder geht nicht?'), $t('z. B. tiefe Kniebeuge, Treppen runter')) + txt('good', $t('Was geht gut?'), $t('z. B. Beinpresse, Radfahren')) + '</div></div>'; }
function painSummary(pain) { return Object.keys(pain || {}).map(r => { const v = pain[r] || {}; const since = (SINCE.find(o => o[0] === v.since) || [])[1];
  return '<li><b>' + esc(REGION_TXT[r] || r) + '</b>' + (v.level != null && v.level !== '' ? $t(' · Stärke ') + esc(v.level) + '/10' : '') + (since ? ' · ' + esc(since) : '') + (v.doc ? $t(' · ärztlich: ') + esc({ yes: 'ja', no: 'nein', running: $t('läuft') }[v.doc]) : '') + (v.bad ? $t('<br><span class="muted">Geht nicht:</span> ') + esc(v.bad) : '') + (v.good ? $t('<br><span class="muted">Geht gut:</span> ') + esc(v.good) : '') + '</li>'; }).join(''); }
function onbRoute() { const m = ONB.mode || 'free'; if (m === 'plan') return S.plan.sessions.length ? 'days' : 'path'; if (m === 'coach') return 'intake'; if (m === 'library') return 'library'; return 'path'; }
function onbAfterPlan() { ONB.step = ORDER.length ? 'days' : 'summary'; render(true); }
function onbApplyProfile() { const d = ONB.data, st = S.settings; const c = onbCalc(d); if (!c) { ONB.err = $t('Bitte Alter, Größe und Gewicht eintragen.'); return false; } ONB.err = '';
  st.name = (d.name || '').trim(); st.sex = d.sex || 'm'; st.age = d.age; st.height = d.height; st.startWeight = String(num(d.weight)); st.targetWeight = String(num(d.target) || num(d.weight));
  st.tdee0 = String(c.tdee); st.goalRate = String(c.rate); st.floor = String(c.floor); st.startKcal = String(c.kcal); st.protein = String(c.protein); st.fat = String(c.fat); st.hfmax = String(c.hfmax);
  if (num(d.rhr)) st.rhrBase = String(num(d.rhr)); if (num(d.vo2)) { st.vo2Start = String(num(d.vo2)); setHealth(today(), { vo2: num(d.vo2) }, 'manual'); }
  const o = dayObj(today()); if (num(o.weight) == null) { o.weight = String(num(d.weight)); o.weightSrc = 'manual'; }
  const tg = S.plan.targets; if (tg) { ['protein', 'fat', 'goalRate', 'targetWeight'].forEach(k => { if (num(tg[k]) != null) st[k] = String(tg[k]); }); if (num(tg.kcal) != null) st.startKcal = String(tg.kcal); }
  if (AUTH && st.name) api('/rest/v1/profiles?id=eq.' + AUTH.uid, { method: $t('PATCH'), body: JSON.stringify({ display_name: st.name }) }).catch(() => {});
  save(); return true; }
function prefillOnb() { const st = S.settings, d = ONB.data; if (d._filled) return; d._filled = true; d.name = d.name || st.name || (AUTH && AUTH.profile && AUTH.profile.display_name) || ''; d.sex = d.sex || st.sex || 'm'; d.age = d.age || st.age || ''; d.height = d.height || st.height || ''; d.weight = d.weight || ''; d.target = d.target || ''; d.act = d.act || '1.45'; }
async function afterAuth() { const r = await pullAll({ first: true, quiet: true }); if (r.conflict) { ONB.conflict = r.conflict; ONB.step = 'conflict'; render(); return; } finishAuth(); }
function finishAuth() { ONB.busy = false; if (S.meta.onboarded || hasLocalData(S)) { S.meta.onboarded = true; persist(); location.hash = '#heute'; toast($t('Angemeldet') + (AUTH && AUTH.profile ? $t(' als ') + AUTH.profile.username : '')); render(); return; } ONB.step = 'profile'; prefillOnb(); render(); }

/* ======================= COACHING (ADMIN) ======================= */
const ADMIN = { clients: null, states: {}, invites: [], loading: false, err: null };
async function loadClients() { if (!isAdmin()) return; ADMIN.loading = true;
  try { const cl = await api('/rest/v1/profiles?coach_id=eq.' + AUTH.uid + '&select=id,username,display_name,lang,created_at&order=created_at.asc');
    const ids = cl.map(c => c.id); const sums = ids.length ? await api('/rest/v1/user_state?user_id=in.(' + ids.join(',') + ')&select=user_id,summary,updated_at') : [];
    const by = Object.fromEntries(sums.map(x => [x.user_id, x])); ADMIN.clients = cl.map(c => Object.assign(c, { summary: by[c.id] && by[c.id].summary, updated_at: by[c.id] && by[c.id].updated_at }));
    ADMIN.invites = await api('/rest/v1/invites?coach_id=eq.' + AUTH.uid + '&used_by=is.null&select=code,name,created_at,expires_at,mode&order=created_at.desc');
    const reqs = await api('/rest/v1/plan_requests?coach_id=eq.' + AUTH.uid + '&select=id,user_id,intake,status,created_at&order=created_at.desc'); ADMIN.reqs = {}; reqs.forEach(r => { if (!ADMIN.reqs[r.user_id]) ADMIN.reqs[r.user_id] = r; });
    notifyRequests(reqs.filter(r => r.status === 'open')); ADMIN.err = null; }
  catch (e) { ADMIN.err = errTxt(e); } ADMIN.loading = false; }
async function loadClientState(uid) { const r = await api('/rest/v1/user_state?user_id=eq.' + uid + '&select=state,summary,updated_at'); ADMIN.states[uid] = r && r[0] || null; return ADMIN.states[uid]; }
const ago = iso2 => { if (!iso2) return $t('noch nie'); const m = Math.round((Date.now() - Date.parse(iso2)) / 60000); if (m < 2) return $t('gerade eben');
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' }); if (m < 60) return rtf.format(-m, 'minute'); const h = Math.round(m / 60); if (h < 24) return rtf.format(-h, 'hour'); return rtf.format(-Math.round(h / 24), 'day'); };
const cname = c => c.display_name || (c.summary && c.summary.name) || c.username;
const openReq = uid2 => ADMIN.reqs && ADMIN.reqs[uid2] && ADMIN.reqs[uid2].status === 'open' ? ADMIN.reqs[uid2] : null;
async function localNotify(id, title, body) { const N = NOTIF.p; if (!N) return; try { const st = await N.checkPermissions(); if (st.display !== 'granted') return; await N.schedule({ notifications: [{ id, title, body, schedule: { at: new Date(Date.now() + 1500), allowWhileIdle: true } }] }); } catch (e) {} }
function notifyRequests(open) { const seen = S.meta.seenReq || []; const fresh = open.filter(r => !seen.includes(r.id)); if (!fresh.length) return;
  fresh.forEach((r, i) => localNotify(300 + (i % 50), $t('Plan-Anfrage'), (r.intake && r.intake.name || $t('Ein Athlet')) + $t(' wartet auf seinen Plan.'))); S.meta.seenReq = seen.concat(fresh.map(r => r.id)).slice(-200); persist(); }
function hasPlanFromCoach() { return !!(S.meta.planAt && S.plan.sessions.length && !S.plan.waiting); }
function clientRow(c) { const s = c.summary || {}; const dot = !c.updated_at ? 'mist' : Date.now() - Date.parse(c.updated_at) > 3 * 864e5 ? 'amber' : 'green';
  const bits = [s.week ? $t('Woche ') + s.week + ' · ' + s.done + '/' + s.total : $t('noch nicht gestartet')]; if (s.trend != null) bits.push(fmt(s.trend) + $t(' kg') + (s.rate != null ? ' (' + (s.rate <= 0 ? '−' : '+') + fmt(Math.abs(s.rate), 1) + '/Wo)' : ''));
  if (s.kcal7 != null) bits.push('Ø ' + fmt(s.kcal7, 0) + $t(' kcal'));
  return '<a class="li" href="#admin/' + c.id + '"><span class="badge gym">' + esc(cname(c).slice(0, 1).toUpperCase()) + '</span><div class="grow"><b>' + esc(cname(c)) + '</b>' + (openReq(c.id) ? $t('<span class="prio req">wartet auf Plan</span>') : '') + '<small>' + esc(bits.join(' · ')) + '</small></div><span class="tag"><span class="dot ' + dot + '"></span>' + esc(ago(c.updated_at)) + '</span></a>'; }
function viewAdmin(arg) { if (!isAdmin()) return '<a href="#mehr" class="back">' + ICON.back + $t('Einstellungen</a><p>Nur für Coach-Konten.</p>');
  if (ADMIN.clients == null && !ADMIN.loading) loadClients().then(() => { if (route.name === 'admin') render(); });
  if (arg) return viewClient(arg);
  const list = ADMIN.clients || []; const inv = ADMIN.invites || [];
  return '<a href="#heute" class="back">' + ICON.back + $t('Heute</a>') + pageTop($t('Team'), '', list.length ? list.length + (list.length === 1 ? $t(' Athlet') : $t(' Athleten')) : $t('Lade deine Athleten und schick Einladungen.')) + '<div class="stack">' +
    (ADMIN.err ? note('red', esc(ADMIN.err), $t('<button class="btn sm" data-act="adminReload" type="button">Neu laden</button>')) : '') +
    $t('<div class="row"><button class="btn brand" data-act="inviteNew" type="button">+ Athlet einladen</button><a class="btn fog" href="#plan/me">Mein Plan</a><div class="grow"></div><button class="iconbtn" data-act="adminReload" type="button" aria-label="Neu laden">') + ICON.sync + '</button></div>' +
    (ADMIN.clients == null ? $t('<p class="muted">Lade …</p>') : list.length ? '<div class="card flush"><div class="list">' + list.map(clientRow).join('') + '</div></div>' : $t('<div class="card"><h2>Noch keine Athleten</h2><p>Erstell eine Einladung. Dein Athlet installiert die App, wählt „Einladungscode“ und gibt den Code ein. Danach siehst du ihn hier.</p></div>')) +
    (inv.length ? $t('<div class="section-h"><h2>Offene Einladungen</h2></div><div class="card flush"><div class="list">') + inv.map(i => '<div class="li" style="cursor:default"><div class="grow"><b class="num" style="letter-spacing:.06em">' + esc(i.code) + '</b><small>' + esc((i.name || '') + $t(' · gültig bis ') + fmtDay(i.expires_at.slice(0, 10))) + '</small></div><button class="btn sm" data-act="inviteShare" data-code="' + esc(i.code) + '" data-name="' + esc(i.name || '') + $t('" type="button">Teilen</button><button class="btn sm danger" data-act="inviteDel" data-code="') + esc(i.code) + $t('" type="button">Löschen</button></div>')).join('') + '</div></div>' : '') +
    '</div>'; }
function viewClient(uid) { const c = (ADMIN.clients || []).find(x => x.id === uid); if (!c) return '<a href="#admin" class="back">' + ICON.back + $t('Team</a><p class="muted">') + (ADMIN.loading || ADMIN.clients == null ? $t('Lade …') : $t('Athlet nicht gefunden.')) + '</p>';
  const s = c.summary || {}; const st = (k, v, sub) => '<div class="stat"><div class="k">' + k + '</div><div class="v" style="font-size:22px">' + v + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>';
  const lost0 = s.start != null && s.trend != null ? s.start - s.trend : null; const lost = lost0 != null && Math.abs(lost0) < 0.05 ? 0 : lost0;
  return '<a href="#admin" class="back">' + ICON.back + $t('Team</a>') + pageTop(esc(cname(c)), '', '@' + esc(c.username) + $t(' · Plan: ') + esc($t(s.plan || '–')) + $t(' · Sync ') + esc(ago(c.updated_at))) + '<div class="stack">' +
    (c.updated_at ? '' : note('amber', $t('Noch keine Daten hochgeladen. Sobald dein Athlet die App öffnet und online ist, erscheinen sie hier.'))) +
    (openReq(uid) ? reqCard(uid) : '') + '<div class="stats">' + st($t('Woche'), s.week ? s.week + ' · ' + s.done + '/' + s.total : '–', s.lastTrain ? $t('zuletzt ') + fmtDay(s.lastTrain) : $t('noch kein Training')) +
    st($t('Trendgewicht'), s.trend != null ? fmt(s.trend) + $t(' kg') : '–', (lost != null ? (lost > 0 ? '−' : lost < 0 ? '+' : '±') + fmt(Math.abs(lost)) + $t(' kg seit Start · ') : '') + $t('Ziel ') + (s.target != null ? fmt(s.target, 0) : '–')) +
    st($t('Ø Kalorien 7 Tage'), s.kcal7 != null ? fmt(s.kcal7, 0) : '–', $t('Ziel ') + (s.kcalT != null ? fmt(s.kcalT, 0) : '–') + ' · ' + (s.logged7 || 0) + $t(' Tage geloggt')) +
    st($t('Ø Protein'), s.prot7 != null ? fmt(s.prot7, 0) + $t(' g') : '–', $t('Ziel ') + (s.protT != null ? fmt(s.protT, 0) + $t(' g') : '–')) +
    st($t('Ø Schritte'), s.steps7 != null ? fmt(s.steps7, 0) : '–', s.sleep7 != null ? $t('Schlaf ') + fmtMin(s.sleep7) : '') + st($t('Bereitschaft'), s.ready != null ? s.ready + ' %' : '–', s.rhr7 != null ? $t('Ruhepuls Ø ') + s.rhr7 : '') + '</div>' +
    $t('<div class="card"><h2>Fortschritt ansehen</h2><p>Öffnet Training, Verlauf und Ernährung deines Athleten so, wie er sie sieht. Nur lesen.</p><div class="row" style="margin-top:12px"><button class="btn brand" data-act="viewAs" data-uid="') + uid + $t('" data-to="#verlauf" type="button">Verlauf</button><button class="btn" data-act="viewAs" data-uid="') + uid + $t('" data-to="#training" type="button">Training</button><button class="btn" data-act="viewAs" data-uid="') + uid + $t('" data-to="#essen" type="button">Ernährung</button></div></div>') +
    (openReq(uid) ? '' : reqCard(uid)) +
    $t('<div class="card"><h2>Plan</h2><p>Übungen, Sätze, Wiederholungen, RPE, Einheiten und Ernährungsziele festlegen. Dein Athlet bekommt die Änderung beim nächsten Öffnen der App.</p><div class="row" style="margin-top:12px"><a class="btn brand" href="#plan/') + uid + $t('">Plan bearbeiten</a><button class="btn" data-act="coachLib" data-uid="') + uid + $t('" type="button">Aus Bibliothek</button>') + (ADMIN.reqs && ADMIN.reqs[uid] ? '<button class="btn" data-act="coachGen" data-uid="' + uid + $t('" type="button">Aus Fragebogen erstellen</button>') : '') + '</div></div>' +
    $t('<div class="card"><h2>Konto</h2><div class="row" style="margin-top:8px"><button class="btn" data-act="resetPw" data-uid="') + uid + $t('" type="button">Passwort zurücksetzen</button><button class="btn danger" data-act="removeClient" data-uid="') + uid + $t('" type="button">Aus dem Team entfernen</button></div></div></div>'); }
const INV_MODES = [['free', $t('Frei dem Athleten überlassen'), $t('Er entscheidet selbst: fertigen Plan wählen, Plan aus seinen Angaben erstellen lassen, selbst planen oder ohne festen Plan trainieren.')],
  ['library', $t('Nach einem fertigen Plan'), $t('Er wählt aus der Plan-Bibliothek, mit Empfehlung passend zu Ziel, Erfahrung und Zeit.')],
  ['coach', $t('Plan vom Coach'), $t('Er beantwortet Fragen zu Ziel, Erfahrung, Tagen und Beschwerden. Du bekommst eine Benachrichtigung und erstellst den Plan.')]];
function reqCard(uid) { const r = ADMIN.reqs && ADMIN.reqs[uid]; if (!r) return ''; const q = r.intake || {}; const pain = q.pain || {};
  const row = (k, v) => v ? '<tr><td class="muted">' + k + '</td><td>' + esc(v) + '</td></tr>' : '';
  return '<div class="card' + (r.status === 'open' ? $t(' reqopen') : '') + $t('"><div class="row"><h2 class="grow">Fragebogen</h2><span class="tag"><span class="dot ') + (r.status === 'open' ? 'red' : 'green') + '"></span>' + (r.status === 'open' ? $t('wartet auf Plan') : $t('erledigt')) + '</span></div><p class="small muted">' + fmtDay(r.created_at.slice(0, 10)) + '</p>' +
    '<div class="tbl"><table><tbody>' + row($t('Ziel'), GOALS[q.goal]) + row($t('Erfahrung'), LEVELS[q.level]) + row($t('Tage pro Woche'), q.days) + row($t('Zeit pro Einheit'), q.minutes ? q.minutes + $t(' min') : '') + row($t('Ort'), PLACES[q.place]) +
    row($t('Alter, Größe'), [q.age && q.age + $t(' Jahre'), q.height && q.height + $t(' cm')].filter(Boolean).join(', ')) + row($t('Gewicht → Ziel'), q.weight ? q.weight + ' → ' + (q.target || '–') + $t(' kg') : '') + row($t('Sport nebenher'), q.sport) + row($t('Mag / mag nicht'), q.likes) + row($t('Fehlende Geräte'), (q.missingEq || []).map(e => EQUIP[e]).join(', ')) + '</tbody></table></div>' +
    (q.notes ? $t('<p style="margin-top:10px"><b>Nachricht:</b> ') + esc(q.notes) + '</p>' : '') +
    (Object.keys(pain).length ? $t('<h3 style="margin-top:14px">Beschwerden</h3>') + painMapHTML(pain, false) + '<ul class="rules small">' + painSummary(pain) + $t('</ul><p class="small muted">Der Plan-Generator meidet bei diesen Stellen belastende Übungen. Prüfe trotzdem jede Übung selbst.</p>') : $t('<p class="small muted" style="margin-top:8px">Keine Beschwerden angegeben.</p>')) + '</div>'; }
function inviteSheet() { const mode = ui.invMode || 'free';
  openSheet(sheetHead($t('Athlet einladen')) + $t('<div class="fields on-white" style="margin-top:12px"><div class="field" style="flex:1 1 100%"><label for="iv-name">Name</label><input id="iv-name" type="text" placeholder="z. B. Max" style="width:100%" value="') + esc(ui.invName || '') + '"></div></div>' +
    $t('<h3 style="margin:16px 0 8px">Wie soll er trainieren?</h3><div class="stack">') + INV_MODES.map(m => '<button class="card pathcard' + (mode === m[0] ? $t(' sel') : '') + '" data-act="invMode" data-v="' + m[0] + '" type="button"><b>' + m[1] + '</b><span class="small muted">' + m[2] + '</span></button>').join('') + '</div>' +
    (mode === 'coach' ? $t('<div class="fields on-white" style="margin-top:12px"><div class="field" style="flex:1 1 100%"><label for="iv-tpl">Plan bis deiner fertig ist (optional)</label><select id="iv-tpl" style="width:100%"><option value="">Keiner, nur freies Training</option>') + Object.keys(PLAN_TPL).filter(k => k !== 'blank').map(k => '<option value="' + k + '">' + esc($t(PLAN_TPL[k].name)) + '</option>').join('') + $t('<option value="mine">Kopie meines Plans</option></select></div></div>') : '') +
    $t('<p class="small muted" style="margin-top:12px">Der Code ist 30 Tage gültig und funktioniert einmal. Den Plan kannst du später jederzeit ändern.</p><div class="row" style="margin-top:14px"><div class="grow"></div><button class="btn brand" data-act="inviteCreate" type="button">Code erstellen</button></div>')); }
function genCode() { const A = $t('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'); const b = new Uint8Array(6); crypto.getRandomValues(b); return $t('HB-') + Array.from(b, x => A[x % A.length]).join(''); }
const inviteText = (code, name) => (name ? $t('Hallo ') + name + '! ' : '') + $t('Installiere Hybridblock. Android: ') + APK_URL + $t(' · Browser: ') + PAGES + $t(' · Beim Start „Ich habe einen Einladungscode“ wählen und ') + code + $t(' eingeben.');
async function shareInvite(code, name) { const txt = inviteText(code, name); try { if (navigator.share) { await navigator.share({ text: txt }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(txt); toast($t('Einladung kopiert')); } catch (e) { openSheet(sheetHead($t('Einladung')) + '<textarea readonly style="margin-top:12px">' + esc(txt) + '</textarea>'); } }

/* ======================= PLAN-EDITOR ======================= */
const PE = { uid: null, draft: null, name: '', loading: false, dirty: false, confirm: null };
function planTarget(arg) { return arg === 'me' || !arg || (AUTH && arg === AUTH.uid) ? 'me' : arg; }
async function openPlanEditor(arg) { const who = planTarget(arg); if (PE.uid === who && PE.draft) return;
  PE.uid = who; PE.dirty = false; PE.confirm = null; PE.draft = null;
  if (who === 'me') { PE.draft = JSON.parse(JSON.stringify(S.plan)); PE.name = ''; return; }
  PE.loading = true; try { const r = await api('/rest/v1/plans?user_id=eq.' + who + '&select=plan'); let plan = r && r[0] && r[0].plan;
    if (!plan) { const stt = ADMIN.states[who] || await loadClientState(who); plan = stt && stt.state && stt.state.plan; }
    PE.draft = plan ? JSON.parse(JSON.stringify(plan)) : makePlan('hybrid'); const c = (ADMIN.clients || []).find(x => x.id === who); PE.name = c ? cname(c) : ''; }
  catch (e) { toast(errTxt(e)); PE.uid = null; } PE.loading = false; if (route.name === 'plan') render(); }
function peSess(i) { return PE.draft.sessions[i]; }
function peItems(i) { const s = peSess(i); return planForP(PE.draft, 1, s.k); }
function peIsAdd(s, slot) { return (s.add || []).find(a => a.slot === slot); }
const TYPE_TXT = { main: 'Hauptübung', bo: 'Back-off', dp: 'Übung', bw: 'Körpergewicht', power: 'Power', carry: 'Carry' };
function viewPlan(arg) { const who = planTarget(arg); if (PE.uid !== who || !PE.draft) { openPlanEditor(arg).then(() => { if (route.name === 'plan') render(); }); return $t('<p class="muted">Lade Plan …</p>'); }
  const p = PE.draft; const forClient = who !== 'me'; const backHref = forClient ? '#admin/' + who : isAdmin() ? '#admin' : '#mehr';
  const tg = p.targets || {}; const tgOn = !!p.targets;
  const tgf = (k, lab) => '<div class="field"><label for="pt-' + k + '">' + lab + '</label><input id="pt-' + k + '" type="number" inputmode="decimal" step="any" data-pt="' + k + '" value="' + esc(tg[k]) + '"' + (tgOn ? '' : $t(' disabled')) + '></div>';
  const sessCards = p.sessions.map((s, i) => { const def = sessDef(s) || {}; const items = s.kind === 'gym' ? peItems(i) : [];
    const hidden = s.base && s.ov ? Object.keys(s.ov).filter(sl => s.ov[sl].del) : [];
    const rows = items.map(it => { const added = !!peIsAdd(s, it.slot); const ov = (s.ov || {})[it.slot] || {}; const ex = LIB[it.ex];
      const inp = (f, w, ph, mode) => '<input class="pe-in" type="' + (mode || 'number') + '"' + (mode ? '' : ' inputmode="decimal" step="any"') + ' data-pe="' + f + '" data-si="' + i + '" data-slot="' + it.slot + '" value="' + esc(it[f] ?? '') + '" placeholder="' + ph + '" style="width:' + w + 'px" aria-label="' + f + '">';
      return '<div class="pe-row"><div class="pe-h"><button class="nm exlink" type="button" data-act="pePickEx" data-si="' + i + '" data-slot="' + it.slot + '">' + (it.sup ? '<span class="sup">' + esc(it.sup) + '</span>' : '') + esc(ex ? ex.name : it.ex) + '</button>' +
        '<span class="small muted">' + esc($t(TYPE_TXT[it.type] || $t('Übung'))) + (!added && (it.type === 'main' || it.type === 'bo') ? $t(' · periodisiert') : '') + (!added && Object.keys(ov).some(k => k !== 'del') ? $t(' · angepasst') : '') + '</span>' +
        '<button class="btn sm" data-act="peDel" data-si="' + i + '" data-slot="' + it.slot + $t('" type="button" aria-label="Übung entfernen">✕</button></div>') +
        $t('<div class="pe-f"><label>Sätze') + inp('sets', 64, '3') + $t('</label><label>Wdh.') + inp('reps', 86, '8–12', 'text') + $t('</label><label>RPE') + inp('rpe', 64, '8') + $t('</label><label>Pause s') + inp('rest', 76, '90') + '</label>' +
        '<label class="pe-chk"><input type="checkbox" data-pe="main" data-si="' + i + '" data-slot="' + it.slot + '"' + (it.type === 'main' ? $t(' checked') : '') + $t('> Haupt</label></div>') +
        '<input class="pe-note" type="text" data-pe="note" data-si="' + i + '" data-slot="' + it.slot + '" value="' + esc(it.note || '') + $t('" placeholder="Hinweis für den Athleten (optional)"></div>'); }).join('');
    return '<div class="card pe-sess"><div class="row pe-tr"><span class="badge ' + s.kind + ' sm">' + (s.kind === 'z2' ? 'Z2' : s.kind === 'hiit' ? 'H' : s.k) + '</span><input class="grow pe-title" type="text" data-pes="title" data-si="' + i + '" value="' + esc(s.title || '') + '" placeholder="' + esc($t(def.title || $t('Einheit'))) + $t('" aria-label="Name der Einheit"></div>') +
      '<div class="row pe-ctl"><span class="small muted grow">' + esc($t(KIND_LABEL[s.kind] || '')) + (s.base ? ' · ' + esc($t('Vorlage')) + ' ' + esc($t(TPL_SESS[s.base].title)) : '') + '</span><button class="btn sm" data-act="peMove" data-si="' + i + $t('" data-v="-1" type="button" aria-label="Nach oben"') + (i === 0 ? $t(' disabled') : '') + '>↑</button><button class="btn sm" data-act="peMove" data-si="' + i + $t('" data-v="1" type="button" aria-label="Nach unten"') + (i === p.sessions.length - 1 ? $t(' disabled') : '') + '>↓</button>' +
      (PE.confirm === 'del' + i ? '<button class="btn sm dark" data-act="peSessDelYes" data-si="' + i + $t('" type="button">Wirklich?</button>') : '<button class="btn sm danger" data-act="peSessDel" data-si="' + i + $t('" type="button">Löschen</button>')) + '</div>' +
      '<input class="pe-sub" type="text" data-pes="sub" data-si="' + i + '" value="' + esc(s.sub || '') + '" placeholder="' + esc($t(def.sub || $t('Kurzbeschreibung'))) + $t('" aria-label="Untertitel">') +
      (s.kind === 'gym' ? '<div class="pe-list">' + (rows || $t('<p class="small muted">Noch keine Übungen.</p>')) + '</div>' +
        (hidden.length ? '<p class="small muted" style="margin-top:8px">' + hidden.length + $t(' Übung(en) aus der Vorlage ausgeblendet. <button class="linkbtn" data-act="peRestore" data-si="') + i + $t('" type="button">Wiederherstellen</button></p>') : '') +
        '<button class="btn block" style="margin-top:10px" data-act="pePickEx" data-si="' + i + $t('" data-slot="" type="button">+ Übung</button>')
        : '<p class="small muted" style="margin-top:8px">' + (s.kind === 'hiit' ? $t('Intervalle nach Phase: 4×3 min, dann 4×4 min, Deload als Z2, am Ende 2000-m-Test.') : $t('Zone-2-Dauer nach Woche: 40–50 min, in Deload-Wochen kürzer.')) + '</p>') + '</div>'; }).join('');
  return '<a href="' + backHref + '" class="back">' + ICON.back + (forClient ? esc(PE.name || $t('Athlet')) : isAdmin() ? $t('Team') : $t('Einstellungen')) + '</a>' +
    pageTop(forClient ? $t('Plan') : $t('Mein'), forClient ? $t('für ') + esc(PE.name) : $t('Plan'), esc($t(p.name)) + ' · ' + p.sessions.length + $t(' Einheiten pro Woche · 12 Wochen mit Deload in Woche 4 und 8')) + '<div class="stack">' +
    (!forClient && hasCoach() ? note('sky', $t('Du hast einen Coach. Er kann deinen Plan jederzeit überschreiben.')) : '') +
    $t('<div class="card"><div class="fields"><div class="field" style="flex:1 1 100%"><label for="pe-name">Name des Plans</label><input id="pe-name" type="text" data-pep="name" value="') + esc($t(p.name)) + '" style="width:100%"></div>' +
    $t('<div class="field" style="flex:1 1 100%"><label for="pe-tpl">Vorlage</label><div class="row"><select id="pe-tpl" class="grow">') + Object.keys(PLAN_TPL).map(k => '<option value="' + k + '"' + (p.tpl === k ? $t(' selected') : '') + '>' + esc($t(PLAN_TPL[k].name)) + '</option>').join('') + '<option value="gen"' + (p.tpl === 'gen' ? $t(' selected') : '') + $t('>Aus Angaben erstellen</option></select>') +
    (PE.confirm === 'tpl' ? $t('<button class="btn sm dark" data-act="peTplYes" type="button">Ersetzen</button><button class="btn sm" data-act="peTplNo" type="button">Abbrechen</button>') : $t('<button class="btn sm" data-act="peTpl" type="button">Übernehmen</button>')) + '</div></div>' +
    (forClient ? $t('<div class="field" style="flex:1 1 100%"><label for="pe-note">Nachricht an deinen Athleten</label><textarea id="pe-note" data-pep="note" placeholder="Erscheint auf seiner Startseite" style="font-family:var(--f);font-size:15px">') + esc(p.note || '') + '</textarea></div>' : '') + '</div>' +
    $t('<p class="small muted" style="margin-top:10px">Eingaben gelten für normale Wochen. In Deload- und Testwochen halbiert die App Sätze und senkt die RPE automatisch. Hauptübungen aus der Hybridblock-Vorlage sind über die Phasen periodisiert.</p></div>') +
    sessCards +
    $t('<div class="row"><button class="btn fog" data-act="peAddSess" data-v="gym" type="button">+ Kraft-Einheit</button><button class="btn fog" data-act="peAddSess" data-v="hiit" type="button">+ HIIT</button><button class="btn fog" data-act="peAddSess" data-v="z2" type="button">+ Z2</button></div>') +
    '<div class="card"><label class="row" style="gap:10px"><input type="checkbox" data-pep="targetsOn"' + (tgOn ? $t(' checked') : '') + $t('> <h2 style="margin:0">Ernährungsziele vorgeben</h2></label><p class="small muted">Leer gelassene Felder bleiben beim Athleten wie sie sind. Die adaptive Anpassung beim wöchentlichen Check-in läuft danach weiter.</p>') +
    '<div class="fields" style="margin-top:12px">' + tgf('kcal', $t('Kalorien')) + tgf('protein', $t('Protein (g)')) + tgf('fat', $t('Fett (g)')) + tgf('goalRate', $t('kg pro Woche')) + tgf('targetWeight', $t('Zielgewicht')) + '</div></div>' +
    $t('<div class="row pe-save"><button class="btn" data-act="peDiscard" type="button">Verwerfen</button><div class="grow"></div><button class="btn brand" data-act="peSave" type="button"') + (PE.dirty ? '' : $t(' disabled')) + '>' + (forClient ? $t('Speichern und senden') : $t('Speichern')) + '</button></div></div>'; }
function peSetField(i, slot, f, val) { const s = peSess(i); const add = peIsAdd(s, slot);
  const parsed = f === 'sets' || f === 'rest' ? (num(val) != null ? Math.max(f === 'sets' ? 1 : 0, Math.round(num(val))) : null) : f === 'rpe' ? (num(val) != null ? Math.max(5, Math.min(10, num(val))) : null) : val;
  if (add && add.wk && ['sets', 'reps', 'rpe'].includes(f)) delete add.wk;
  if (add) { if (parsed == null || parsed === '') { if (f === 'note') add.note = ''; else if (f === 'rpe') add.rpe = null; } else add[f] = parsed; }
  else { s.ov = s.ov || {}; const o = s.ov[slot] = s.ov[slot] || {}; if (parsed == null || parsed === '') delete o[f]; else o[f] = parsed; if (!Object.keys(o).length) delete s.ov[slot]; }
  PE.dirty = true; }
function nextKey(p) { return SESSION_LETTERS.split('').find(l => !p.sessions.some(s => s.k === l)); }
function pePickSheet(i, slot, q) { q = (q || '').toLowerCase(); const items = Object.values(LIB).filter(e => !q || e.name.toLowerCase().includes(q) || Object.keys(e.muscles).some(m => MUSCLES[m].toLowerCase().includes(q)));
  ui.pePick = { i, slot };
  openSheet(sheetHead(slot ? $t('Übung ersetzen') : $t('Übung hinzufügen')) + $t('<div class="on-white" style="margin-top:12px"><input id="peq" type="search" placeholder="Übung oder Muskel suchen" style="width:100%" value="') + esc(q) + '"></div><div class="plist" id="pelist" style="margin-top:8px">' + peExItems(items) + '</div>'); }
const peExItems = items => items.map(e => '<div class="it" data-act="pePick" data-ex="' + e.id + '"><div class="grow"><b>' + esc(e.name) + '</b><small>' + Object.keys(e.muscles).filter(m => e.muscles[m] >= 1).map(m => MUSCLES[m]).join(', ') + '</small></div>' + (isPrio(e.id) ? $t('<span class="prio">Schwerpunkt</span>') : '') + '</div>').join('');
async function peSave() { const p = PE.draft; if (p.targets) { p.targets.at = new Date().toISOString(); } p.v = (p.v || 1) + 1; delete p.waiting; delete p.free;
  try { if (PE.uid === 'me') { if (PE.switching || !S.plan.sessions.length) { switchPlan(p); PE.switching = false; } else setPlan(p, false); S.meta.daysSet = true; if (AUTH) { S.meta.planAt = await pushPlan(AUTH.uid, S.plan); } save(); toast($t('Plan gespeichert')); }
    else { await pushPlan(PE.uid, p); const rq = openReq(PE.uid); if (rq) { try { await api('/rest/v1/plan_requests?id=eq.' + rq.id, { method: $t('PATCH'), body: JSON.stringify({ status: 'done', done_at: new Date().toISOString() }) }); rq.status = 'done'; } catch (e2) {} } toast($t('Plan gespeichert. ') + (PE.name || $t('Dein Athlet')) + $t(' bekommt ihn beim nächsten Öffnen.')); }
    PE.dirty = false; render(); } catch (e) { toast($t('Speichern fehlgeschlagen: ') + errTxt(e)); } }

/* ======================= EINSTELLUNGEN: KONTO & SPRACHE ======================= */
function accountCard() { if (VIEW) return '';
  const lang = $t('<div class="card"><h2>Sprache</h2><div class="seg langseg">') + [['de', $t('Deutsch')], ['en', $t('English')], ['ru', $t('Русский')]].map(l => '<button class="' + (LANG === l[0] ? 'on' : '') + '" data-act="setLang" data-v="' + l[0] + '" type="button">' + l[1] + '</button>').join('') + $t('</div><p class="small muted">Übungen, Lebensmittel-Vorlagen und alle Texte wechseln sofort. Deine Daten bleiben unverändert.</p></div>');
  if (!AUTH) return lang + $t('<div class="card"><h2>Konto und Coaching</h2><p>Mit Konto werden deine Daten in der Cloud gesichert und zwischen Geräten synchronisiert. Ein Coach kann dir Pläne schicken und deinen Fortschritt sehen.</p><div class="row" style="margin-top:14px"><a class="btn brand" href="#start/code">Einladungscode einlösen</a><a class="btn" href="#start/login">Anmelden</a></div></div>');
  const pr = AUTH.profile || {};
  return lang + $t('<div class="card"><h2>Konto</h2><p>Angemeldet als <b>@') + esc(pr.username || '') + '</b>' + (pr.role === 'admin' ? $t(' · Coach') : hasCoach() ? $t(' · mit Coach') : '') + '</p>' +
    '<p class="small ' + (SYNC.err ? 't-red' : 'muted') + '" style="font-weight:' + (SYNC.err ? 700 : 500) + '">' + (SYNC.err ? $t('Sync-Fehler: ') + esc(SYNC.err) : $t('Zuletzt synchronisiert: ') + esc(S.meta.syncAt ? new Date(S.meta.syncAt).toLocaleString(LOCALE) : $t('noch nie'))) + '</p>' +
    '<div class="row" style="margin-top:12px"><button class="btn" data-act="syncNow" type="button">' + ICON.sync + $t('Jetzt synchronisieren</button>') + (pr.role === 'admin' ? $t('<a class="btn brand" href="#admin">Team öffnen</a>') : '') + $t('<a class="btn" href="#plan/me">Plan bearbeiten</a>') +
    (ui.confirmLogout ? $t('<button class="btn dark" data-act="logoutYes" type="button">Wirklich abmelden</button>') : $t('<button class="btn danger" data-act="logout" type="button">Abmelden</button>')) + '</div>' +
    (ui.confirmLogout ? $t('<p class="small muted">Deine Daten bleiben auf diesem Gerät. Synchronisiert wird erst wieder nach der Anmeldung.</p>') : '') + '</div>'; }
function heuteExtras() { if (VIEW) return ''; let h = '';
  if (isAdmin() && ADMIN.reqs) { const open = Object.values(ADMIN.reqs).filter(r => r.status === 'open'); if (open.length) h += note('ember', '<b>' + open.length + (open.length === 1 ? $t(' Athlet wartet') : $t(' Athleten warten')) + $t(' auf einen Plan.</b> ') + esc(open.map(r => (ADMIN.clients || []).find(c => c.id === r.user_id)).filter(Boolean).map(cname).join(', ')), '<a class="btn brand sm" href="#admin/' + open[0].user_id + $t('">Ansehen</a>')); }
  if (S.plan.note && hasCoach()) h += note('sky', $t('<b>Von deinem Coach:</b> ') + esc(S.plan.note));
  if (isAdmin()) { const n = ADMIN.clients ? ADMIN.clients.length : null; h += $t('<a class="card" href="#admin" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:14px"><span class="badge gym"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .6 3.2 2.4 3.5 5.2"/></svg></span><div class="grow"><b>Team</b><div class="small muted">') + (n == null ? $t('Athleten, Pläne, Einladungen') : n + (n === 1 ? $t(' Athlet') : $t(' Athleten'))) + '</div></div><span class="chev">›</span></a>'; }
  if (SYNC.err && AUTH) h += note('amber', $t('Sync gerade nicht möglich (') + esc(SYNC.err) + $t('). Deine Daten sind lokal gespeichert.'), $t('<button class="btn sm" data-act="syncNow" type="button">Erneut</button>'));
  return h; }

/* ======================= EVENTS ======================= */
document.addEventListener('input', e => { const tt = e.target;
  if (tt.dataset.ik) { S.settings.q = Object.assign({}, S.settings.q || {}); S.settings.q[tt.dataset.ik] = tt.value; save(); return; }
  if (tt.dataset.pain) { const q = S.settings.q = Object.assign({}, S.settings.q || {}); q.pain = Object.assign({}, q.pain || {}); const r = tt.dataset.pain; q.pain[r] = Object.assign({}, q.pain[r] || {}); q.pain[r][tt.dataset.pf] = tt.value; save(); return; }
  if (tt.dataset.ob) { ONB.data[tt.dataset.ob] = tt.value; if (tt.dataset.ob === 'user') { const h = document.getElementById('ob-userhint'); if (h) h.innerHTML = userHint(tt.value); } return; }
  if (tt.dataset.od) { if (tt.dataset.od === 'mode') S.settings.mode = tt.value; else S.settings.dayMap[tt.dataset.od] = tt.value === '' ? '' : +tt.value; S.meta.daysSet = true; save(); return; }
  if (tt.dataset.pe && PE.draft) { const i = +tt.dataset.si; if (tt.dataset.pe === 'main') { peSetField(i, tt.dataset.slot, 'type', tt.checked ? 'main' : 'dp'); } else peSetField(i, tt.dataset.slot, tt.dataset.pe, tt.value); markPeDirty(); return; }
  if (tt.dataset.pes && PE.draft) { peSess(+tt.dataset.si)[tt.dataset.pes] = tt.value; PE.dirty = true; markPeDirty(); return; }
  if (tt.dataset.pep && PE.draft) { const k = tt.dataset.pep; if (k === 'targetsOn') { PE.draft.targets = tt.checked ? (PE.draft.targets || {}) : null; PE.dirty = true; render(); return; } PE.draft[k] = tt.value; PE.dirty = true; markPeDirty(); return; }
  if (tt.dataset.pt && PE.draft) { PE.draft.targets = PE.draft.targets || {}; const v = num(tt.value); if (v == null) delete PE.draft.targets[tt.dataset.pt]; else PE.draft.targets[tt.dataset.pt] = v; PE.dirty = true; markPeDirty(); return; }
  if (tt.id === 'peq') { const q = tt.value.toLowerCase(); const el = $('#pelist'); if (el) el.innerHTML = peExItems(Object.values(LIB).filter(x => x.name.toLowerCase().includes(q) || Object.keys(x.muscles).some(m => MUSCLES[m].toLowerCase().includes(q)))); return; }
});
function markPeDirty() { const b = document.querySelector('[data-act=peSave]'); if (b) b.disabled = !PE.dirty; }
document.addEventListener('change', e => { const tt = e.target; if (tt.dataset.pe === 'main' || tt.dataset.pe === 'sets' || tt.dataset.pe === 'rpe') { if (route.name === 'plan') render(); } });
document.addEventListener('keydown', e => { if (e.key !== 'Enter') return; const id = e.target.id;
  if (id === 'ob-code') { e.preventDefault(); document.querySelector('[data-act=onbCheck]') && document.querySelector('[data-act=onbCheck]').click(); }
  if (id === 'ob-pw' && ONB.step === 'login') { e.preventDefault(); document.querySelector('[data-act=onbLogin]').click(); } });
document.addEventListener('click', async e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  switch (a) {
    case 'setLang': setLang(b.dataset.v); break;
    case 'onbGo': ONB.err = ''; if (b.dataset.v === 'noacc') { ONB.mode = 'free'; ONB.step = 'profile'; prefillOnb(); render(true); break; } ONB.step = b.dataset.v; if (b.dataset.v === 'profile') prefillOnb(); if (b.dataset.v === 'summary') { S.meta.daysSet = true; save(); } if (b.dataset.v === 'welcome') ONB.inv = null; render(true); break;
    case 'onbCheck': { const code = (($('#ob-code') || {}).value || ONB.data.code || '').trim().toUpperCase(); if (!code) break; ONB.busy = true; ONB.err = ''; render();
      try { const r = await fnCall({ action: 'check', code }); ONB.inv = { code, name: r.name, role: r.role, mode: r.mode || 'plan', hasPlan: r.hasPlan !== false }; } catch (err) { ONB.err = errTxt(err); } ONB.busy = false; render(); break; }
    case 'onbRedeem': { const d = ONB.data; if ((d.pw || '') !== (d.pw2 || '')) { ONB.err = $t('Die Passwörter stimmen nicht überein.'); render(); break; } ONB.busy = true; ONB.err = ''; render();
      try { const user = normUser(d.user); const rr = await fnCall({ action: 'redeem', code: ONB.inv.code, username: user, password: d.pw, name: ONB.inv.name || String(d.user || '').trim(), lang: LANG }); ONB.mode = ONB.inv.mode === 'plan' && !ONB.inv.hasPlan ? 'free' : ONB.inv.mode; S.meta.mode = ONB.mode; await login(user, d.pw); ONB.data.pw = ONB.data.pw2 = ''; await afterAuth(); if (rr && rr.recovery && typeof recoverySheet === 'function') recoverySheet(rr.recovery, true); }
      catch (err) { ONB.err = errTxt(err); ONB.busy = false; render(); } break; }
    case 'onbLogin': { const d = ONB.data; ONB.busy = true; ONB.err = ''; render(); try { await login(d.user || '', d.pw || ''); ONB.data.pw = ''; await afterAuth(); } catch (err) { ONB.err = errTxt(err); ONB.busy = false; render(); } break; }
    case 'onbConflict': { if (b.dataset.v === 'remote') adoptRemote(ONB.conflict); else { S.meta.syncAt = null; S.meta.modAt = Date.now(); await pushState(); } ONB.conflict = null; S.meta.onboarded = true; persist(); finishAuth(); break; }
    case 'onbProfile': if (onbApplyProfile()) { ONB.step = 'goals'; } render(true); break;
    case 'onbFinish': S.meta.onboarded = true; S.meta.daysSet = true; save(); ONB.step = 'welcome'; location.hash = ONB.after === 'editor' ? '#plan/me' : '#heute'; ONB.after = null; toast($t('Viel Erfolg!')); break;
    case 'onbStudio': openSheet(sheetHead($t('Mein Studio')) + studioCard().replace('class="card"', 'class="card on-white" style="background:var(--paper);padding:0"')); break;
    case 'onbGoals': { const q = S.settings.q || {}; if (!q.goal || !q.level || !q.days) { ONB.err = $t('Bitte Ziel, Erfahrung und Tage pro Woche wählen.'); render(); break; } ONB.err = ''; ONB.step = onbRoute(); ui.genPlan = null; render(true); break; }
    case 'onbPath': { const v = b.dataset.v; if (v === 'library') ONB.step = 'library'; else if (v === 'gen') { ui.genPlan = null; ONB.step = 'genprev'; }
      else if (v === 'self') { switchPlan(Object.assign(makePlan('blank'), { name: 'Mein Plan' })); ONB.after = 'editor'; onbAfterPlan(); break; }
      else { switchPlan({ tpl: 'none', name: 'Freies Training', sessions: [], free: true, dayMap: {}, note: '', targets: null, v: 1 }); ONB.step = 'summary'; } render(true); break; }
    case 'onbLibOpen': { const p = LIBRARY[b.dataset.id]; openSheet(sheetHead(esc($t(p.name))) + libPreviewHTML(p, makePlan(p.id), '<button class="btn brand block" data-act="onbPick" data-id="' + p.id + $t('" type="button">Diesen Plan wählen</button>'))); break; }
    case 'onbGenAgain': { const g = generatePlan(libQuery()); g.sessions.forEach(s2 => (s2.add || []).forEach(it => { const alts = (LIB[it.ex].alts || []).filter(x => exAvailable(x)); if (alts.length && Math.random() < .6) it.ex = alts[Math.floor(Math.random() * alts.length)]; })); ui.genPlan = g; render(); break; }
    case 'onbPick': { closeSheet(); switchPlan(planFromId(b.dataset.id)); onbAfterPlan(); break; }
    case 'painToggle': { const q = S.settings.q = Object.assign({}, S.settings.q || {}); q.pain = Object.assign({}, q.pain || {}); if (q.pain[b.dataset.r]) delete q.pain[b.dataset.r]; else q.pain[b.dataset.r] = {}; save(); render(); break; }
    case 'onbIntake': { ONB.busy = true; render(); const q = S.settings.q || {}; const st = S.settings;
      const intake = Object.assign({}, q, { name: st.name, sex: st.sex, age: st.age, height: st.height, weight: st.startWeight, target: st.targetWeight, kcal: st.startKcal, at: new Date().toISOString(), lang: LANG, missingEq: st.missingEq || [] });
      try { if (AUTH) await api('/rest/v1/plan_requests', { method: $t('POST'), headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ user_id: AUTH.uid, coach_id: AUTH.profile && AUTH.profile.coach_id, intake }) });
        S.meta.requested = intake.at; if (!S.plan.sessions.length || !hasPlanFromCoach()) switchPlan({ tpl: 'none', name: 'Plan in Arbeit', sessions: [], waiting: true, dayMap: {}, note: '', targets: null, v: 1 });
        ONB.busy = false; toast($t('An deinen Coach gesendet')); onbAfterPlan(); } catch (err) { ONB.busy = false; ONB.err = errTxt(err); render(); } break; }
    case 'syncNow': toast($t('Synchronisiere …')); await syncNow(false); render(); break;
    case 'logout': ui.confirmLogout = true; render(); break;
    case 'logoutYes': ui.confirmLogout = false; await logout(); ADMIN.clients = null; render(); toast($t('Abgemeldet')); break;
    case 'viewExit': exitView(); break;
    case 'viewAs': { toast($t('Lade Daten …')); try { const stt = await loadClientState(b.dataset.uid); if (!stt || !stt.state) { toast($t('Noch keine Daten vorhanden.')); break; } const c = (ADMIN.clients || []).find(x => x.id === b.dataset.uid); enterView(b.dataset.uid, c ? cname(c) : '', stt.state, b.dataset.to); } catch (err) { toast(errTxt(err)); } break; }
    case 'coachLib': ui.libFor = b.dataset.uid; location.hash = '#library'; break;
    case 'coachGen': { const r = ADMIN.reqs[b.dataset.uid]; const q = r && r.intake || {}; const g = generatePlan(q); const c = (ADMIN.clients || []).find(x => x.id === b.dataset.uid); PE.uid = b.dataset.uid; PE.draft = g; PE.name = c ? cname(c) : ''; PE.dirty = true; PE.confirm = null; location.hash = '#plan/' + b.dataset.uid; break; }
    case 'adminReload': ADMIN.clients = null; await loadClients(); render(); break;
    case 'inviteNew': inviteSheet(); break;
    case 'invMode': ui.invMode = b.dataset.v; ui.invName = ($('#iv-name') || {}).value || ''; inviteSheet(); break;
    case 'inviteCreate': { const name = ($('#iv-name').value || '').trim(); const mode = ui.invMode || 'free'; const tpl = mode === 'coach' ? (($('#iv-tpl') || {}).value || '') : ''; const plan = !tpl ? null : tpl === 'mine' ? JSON.parse(JSON.stringify(S.plan)) : makePlan(tpl); if (tpl === 'mine') { plan.note = ''; plan.targets = null; } ui.invName = ''; ui.invMode = null;
      const code = genCode(); try { await api('/rest/v1/invites', { method: $t('POST'), headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ code, coach_id: AUTH.uid, role: 'client', name, plan, mode }) });
        await loadClients(); openSheet(sheetHead($t('Einladung erstellt')) + '<div class="codebox num">' + esc(code) + '</div><p class="muted">' + esc(inviteText(code, name)) + '</p><div class="row" style="margin-top:14px"><div class="grow"></div><button class="btn brand" data-act="inviteShare" data-code="' + esc(code) + '" data-name="' + esc(name) + $t('" type="button">Teilen</button></div>')); render(); }
      catch (err) { toast($t('Fehler: ') + errTxt(err)); } break; }
    case 'inviteShare': shareInvite(b.dataset.code, b.dataset.name); break;
    case 'inviteDel': try { await api('/rest/v1/invites?code=eq.' + encodeURIComponent(b.dataset.code), { method: $t('DELETE') }); await loadClients(); render(); toast($t('Einladung gelöscht')); } catch (err) { toast(errTxt(err)); } break;
    case 'resetPw': openSheet(sheetHead($t('Passwort zurücksetzen')) + $t('<p class="muted">Neues Passwort für deinen Athleten. Gib es ihm danach weiter.</p><div class="on-white" style="margin-top:12px"><input id="rp-pw" type="text" value="') + genCode().slice(3).toLowerCase() + genCode().slice(3, 6).toLowerCase() + '" style="width:100%"></div><div class="row" style="margin-top:14px"><div class="grow"></div><button class="btn brand" data-act="resetPwGo" data-uid="' + b.dataset.uid + $t('" type="button">Setzen</button></div>')); break;
    case 'resetPwGo': try { await fnCall({ action: 'reset', user_id: b.dataset.uid, password: $('#rp-pw').value }, true); closeSheet(); toast($t('Passwort geändert')); } catch (err) { toast(errTxt(err)); } break;
    case 'removeClient': if (ui.confirmRemove !== b.dataset.uid) { ui.confirmRemove = b.dataset.uid; b.textContent = $t('Wirklich entfernen?'); break; } try { await fnCall({ action: 'remove', user_id: b.dataset.uid }, true); ui.confirmRemove = null; await loadClients(); location.hash = '#admin'; toast($t('Entfernt')); } catch (err) { toast(errTxt(err)); } break;
    case 'pePickEx': pePickSheet(+b.dataset.si, b.dataset.slot || ''); break;
    case 'pePick': { const { i, slot } = ui.pePick || {}; const s = peSess(i); if (!s) break; if (slot) peSetField(i, slot, 'ex', b.dataset.ex); else { s.add = s.add || []; s.add.push({ slot: 'x_' + uid(), ex: b.dataset.ex, sets: 3, reps: '8–12', rpe: 8, rest: 90, type: 'dp', note: '', sup: '' }); PE.dirty = true; } closeSheet(); render(); break; }
    case 'peDel': { const i = +b.dataset.si, slot = b.dataset.slot; const s = peSess(i); const add = peIsAdd(s, slot); if (add) s.add = s.add.filter(x => x.slot !== slot); else { s.ov = s.ov || {}; s.ov[slot] = Object.assign(s.ov[slot] || {}, { del: true }); } PE.dirty = true; render(); break; }
    case 'peRestore': { const s = peSess(+b.dataset.si); Object.keys(s.ov || {}).forEach(sl => { if (s.ov[sl].del) { delete s.ov[sl].del; if (!Object.keys(s.ov[sl]).length) delete s.ov[sl]; } }); PE.dirty = true; render(); break; }
    case 'peMove': { const i = +b.dataset.si, j = i + (+b.dataset.v); const L2 = PE.draft.sessions; if (j < 0 || j >= L2.length) break; [L2[i], L2[j]] = [L2[j], L2[i]]; PE.dirty = true; render(); break; }
    case 'peSessDel': PE.confirm = 'del' + b.dataset.si; render(); break;
    case 'peSessDelYes': PE.draft.sessions.splice(+b.dataset.si, 1); PE.confirm = null; PE.dirty = true; render(); break;
    case 'peAddSess': { const k = nextKey(PE.draft); if (!k) break; const kind = b.dataset.v; PE.draft.sessions.push(kind === 'gym' ? { k, kind, title: $t('Einheit ') + k, sub: '', add: [] } : { k, kind }); PE.dirty = true; render(); break; }
    case 'peTpl': PE.confirm = 'tpl'; render(); break;
    case 'peTplNo': PE.confirm = null; render(); break;
    case 'peTplYes': { const tpl = $('#pe-tpl').value; const np = tpl === 'gen' ? generatePlan(PE.uid === 'me' ? libQuery() : ((ADMIN.reqs && ADMIN.reqs[PE.uid] || {}).intake || libQuery())) : makePlan(tpl); PE.draft.phases = np.phases || null; PE.draft.sessions = np.sessions; PE.draft.tpl = tpl; PE.draft.name = np.name; PE.draft.dayMap = np.dayMap; PE.confirm = null; PE.dirty = true; render(); break; }
    case 'peDiscard': PE.uid = null; PE.draft = null; history.back(); break;
    case 'peSave': peSave(); break;
  } });
translateStatic(); boot();
