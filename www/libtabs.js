/* Hybridblock – Bibliothek in vier Reitern: Meine Pläne · Kuratiert · Alle · Community
   Geteilte Pläne liegen in der Tabelle shared_plans (Stufen: private, clients, public, submitted, curated).
   Athleten ohne Coach dürfen höchstens 2 Pläne veröffentlichen (Datenbank prüft das ebenfalls). */
'use strict';
const SP = { list: null, loading: false, body: {}, bodyLoading: {}, uid: null };
const SP_PUB = ['public', 'submitted', 'curated'];
const SP_ST = { private: 'Privat', clients: 'Nur meine Athleten', public: 'Öffentlich, nicht geprüft', submitted: 'Zur Prüfung eingereicht', curated: 'Von uns geprüft' };
const LIB_TABS = [['mine', 'Meine Pläne'], ['cur', 'Kuratiert'], ['all', 'Alle'], ['com', 'Community']];
const myUid = () => (AUTH && AUTH.uid) || null;
function libTab() { return ui.libTab || 'cur'; }
function spNeed() { const u = myUid(); if (SP.uid !== u) { SP.uid = u; SP.list = null; SP.body = {}; }
  if (SP.list == null && !SP.loading) { if (!u) { SP.list = []; return SP.list; } SP.loading = true;
    api('/rest/v1/shared_plans?select=id,owner_id,name,descr,meta,status,published_at,updated_at,review_note,review_state,copy_lock,hidden,mod_note,mod_ground,mod_at&order=updated_at.desc&limit=300').then(r => { SP.list = r || []; }).catch(() => { SP.list = []; })
      .finally(() => { SP.loading = false; if (route.name === 'library' && !document.querySelector('input:focus,textarea:focus')) render(); }); }
  return SP.list || []; }
function spGet(id) { if (SP.body[id] || SP.bodyLoading[id] || !myUid()) return; SP.bodyLoading[id] = true;
  api('/rest/v1/shared_plans?id=eq.' + encodeURIComponent(id) + '&select=*').then(r => { SP.body[id] = (r && r[0]) || { missing: true }; }).catch(() => { SP.body[id] = { missing: true }; })
    .finally(() => { SP.bodyLoading[id] = false; if (route.name === 'library') render(); }); }
const spMine = sp => sp.owner_id === myUid();
const spPubCount = () => (SP.list || []).filter(x => spMine(x) && SP_PUB.includes(x.status)).length;
/* Note: Die Selbstangabe in meta.grade wird nicht blind geglaubt. Liegt der Plan selbst vor, rechnet die App die Note neu (Ergebnis gemerkt). */
const SP_GR = {};
function spGrade(sp) { const b = sp && SP.body && SP.body[sp.id]; const pl = b && b.plan; if (pl && typeof checkPlan === 'function') { const k = sp.id + '|' + (sp.updated_at || ''); if (!SP_GR[k]) { try { SP_GR[k] = checkPlan(typeof planSanitize === 'function' ? planSanitize(pl) : pl, {}).g; } catch (e) { SP_GR[k] = '–'; } } if (/^[A-D]$/.test(SP_GR[k])) return SP_GR[k]; }
  const g = sp.meta && sp.meta.grade; return /^[A-D]$/.test(g) ? g : '–'; }
function spCard(sp) { const m = sp.meta || {}, g = spGrade(sp);
  const st = sp.status === 'curated' ? '<span class="tag" style="background:var(--green-soft,#e3f4ea)">' + esc($t(SP_ST.curated)) + '</span>' : '<span class="tag">' + esc($t(SP_ST[sp.status] || '')) + '</span>';
  const facts = [m.sess ? $tf('{n} Einheiten pro Woche', { n: m.sess }) : '', m.weeks ? $tf('{n} Wochen', { n: m.weeks }) : '', m.goal && GOALS[m.goal] ? GOALS[m.goal] : ''].filter(Boolean).join(' · ');
  return '<a class="card libcard" href="#library/sp:' + sp.id + '"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div class="grow"><h2 style="margin:0">' + esc(sp.name) + '</h2><div class="small muted" style="margin-top:2px">' +
    esc(spMine(sp) ? $t('Von dir') : (m.by || $t('Unbekannt')) + ' · ' + (m.coach ? $t('Coach') : $t('Athlet'))) + '</div></div><span class="grade g' + g + '" title="' + esc($t('Automatische Prüfung gegen die Studienlage')) + '">' + g + '</span></div>' +
    (sp.descr ? '<p class="small" style="margin-top:8px">' + esc(sp.descr) + '</p>' : '') + '<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">' + st + '</div>' + (facts ? '<div class="small muted" style="margin-top:8px">' + esc(facts) + '</div>' : '') + '</a>'; }
function libTabsHTML(tab) { return '<div class="seg libtabs" style="margin-top:0">' + LIB_TABS.map(([k, l]) => '<button class="' + (tab === k ? 'on' : '') + '" data-act="libTab" data-v="' + k + '" type="button">' + esc($t(l)) + '</button>').join('') + '</div>'; }
function libHead() { return '<a href="' + (ui.libFor ? '#admin/' + ui.libFor : '#training') + '" class="back">' + ICON.back + (ui.libFor ? $t('Athlet') : $t('Training')) + '</a>' + pageTop($t('Trainingspläne'), '', $t('Eigene, geprüfte und geteilte Pläne')); }
function goalSeg() { const filt = ui.libGoal || ''; return '<div class="seg">' + [['', $t('Alle')], ...Object.keys(GOALS).map(g => [g, GOALS[g]])].map(g => '<button class="' + (filt === g[0] ? 'on' : '') + '" data-act="libGoal" data-v="' + g[0] + '" type="button">' + esc(g[1]) + '</button>').join('') + '</div>'; }
const exclusiveMine = () => Object.keys(LIB_OWNER).filter(id => LIBRARY[id] && (LIB_OWNER[id] || []).includes(myUid())).map(id => LIBRARY[id]);
const lsec = t => '<div class="section-h"><h2>' + esc($t(t)) + '</h2></div>';
const lempty = t => '<p class="small muted" style="margin:0 4px">' + esc($t(t)) + '</p>';

function viewLibMine() { const L = spNeed(), mine = L.filter(spMine), fromCoach = L.filter(x => !spMine(x) && x.status === 'clients'); let h = '';
  if (!myUid()) return h + note('sky', $t('Melde dich an, um Pläne zu speichern und zu veröffentlichen.')) + exclusiveMine().map(p => libCard(p)).join('');
  if (!ui.libFor && !(typeof VIEW !== 'undefined' && VIEW)) { const g = typeof checkPlan === 'function' ? checkPlan(S.plan, { me: true }).g : '–';
    h += '<div class="card"><div class="row" style="flex-wrap:nowrap"><div class="grow"><div class="lbl">' + $t('Dein aktueller Plan') + '</div><h2 style="margin:2px 0 0">' + esc($t(S.plan.name || '')) + '</h2></div><span class="grade g' + g + '">' + g + '</span></div>' +
      '<button class="btn sm" style="margin-top:10px" data-act="spSave" data-src="cur" type="button">' + $t('Speichern oder veröffentlichen') + '</button></div>'; }
  const ex = exclusiveMine(); if (ex.length) h += lsec('Nur für dich') + ex.map(p => libCard(p)).join('');
  if (isAdmin()) { if (ui.libFor) h += _coachLibOwnLT().replace(/<label class="row"[\s\S]*<\/label>$/, '');
    else { const T = tplsNeed() || []; h += lsec('Deine Vorlagen') + (T.length ? T.map(t => '<a class="card libcard" href="#plan/tpl:' + t.id + '"><b>' + esc(t.name) + '</b><div class="small muted">' + (t.plan.sessions || []).length + $t(' Einheiten pro Woche') + ((t.assigned || []).length ? ' · ' + $tf('{n} Athleten', { n: t.assigned.length }) : '') + '</div></a>').join('') : lempty('Noch keine eigenen Vorlagen. Unter Vorlagen legst du welche an.')); } }
  h += lsec('Gespeichert und geteilt') + (SP.list == null ? lempty('Lade …') : mine.length ? mine.map(spCard).join('') : lempty('Noch nichts gespeichert. Speichere deinen aktuellen Plan oder einen früheren.'));
  if (!isAdmin() && mine.length) h += '<p class="small muted" style="margin:0 4px">' + esc($tf('{n} von 2 Veröffentlichungen genutzt', { n: spPubCount() })) + '</p>';
  if (fromCoach.length) h += lsec('Von deinem Coach') + fromCoach.map(spCard).join('');
  if (!ui.libFor) { const ar = S.archive.map((a, i) => ({ a, i })).filter(x => x.a.plan && x.a.plan.sessions).reverse().slice(0, 6);
    if (ar.length) h += lsec('Frühere Pläne') + ar.map(({ a, i }) => '<a class="card libcard" href="#library/ar:' + i + '"><b>' + esc($t(a.plan.name || '')) + '</b><div class="small muted">' + (a.until ? $tf('bis {d}', { d: fmtDay(a.until) }) + ' · ' : '') + $tf('{n} Einheiten erledigt', { n: Object.keys(a.sessions || {}).length }) + '</div></a>').join(''); }
  return h + $t('<div class="card"><div class="row"><div class="grow"><h2 style="margin:0">Plan erstellen lassen</h2><p class="small">Aus Ziel, Erfahrung, Tagen, Zeit, Geräten und Einschränkungen.</p></div><button class="btn brand sm" data-act="genPlan" type="button">Erstellen</button></div></div>'); }
function viewLibAll() { const filt = ui.libGoal || ''; const L = spNeed().filter(x => SP_PUB.includes(x.status) || spMine(x)).filter(x => !filt || (x.meta || {}).goal === filt);
  const lib = Object.values(LIBRARY).filter(p => !p.module && libVisible(p) && (!filt || p.goals.includes(filt)));
  return goalSeg() + lib.map(p => libCard(p)).join('') + (L.length ? lsec('Geteilte Pläne') + L.map(spCard).join('') : ''); }
function viewLibCom() { const L = spNeed().filter(x => x.status === 'public' || x.status === 'submitted').sort((a, b) => (b.published_at || '') > (a.published_at || '') ? 1 : -1);
  return note('sky', $t('Pläne aus der Community, noch nicht von uns geprüft. Die Note kommt aus der automatischen Prüfung gegen die Studienlage.')) +
    (SP.list == null ? lempty('Lade …') : L.length ? L.map(spCard).join('') : lempty('Noch keine Pläne veröffentlicht. Unter „Meine Pläne“ kannst du deinen teilen.')); }

const _coachLibOwnLT = coachLibOwn;
coachLibOwn = function () { return ''; };
const _viewLibraryLT = viewLibrary;
viewLibrary = function () { const tab = libTab();
  if (tab === 'cur') { const own = S.settings.coachOwnOnly; S.settings.coachOwnOnly = false; ui.libNoExcl = true; let h; try { h = _viewLibraryLT(); } finally { ui.libNoExcl = false; S.settings.coachOwnOnly = own; }
    const cur = spNeed().filter(x => x.status === 'curated'); const add = cur.length ? lsec('Von Coaches, von uns geprüft') + cur.map(spCard).join('') : '';
    h = h.replace('<div class="stack">', '<div class="stack">' + libTabsHTML(tab)); const m = '<button class="btn block" data-act="blankPlan"'; return h.includes(m) ? h.replace(m, add + m) : h + add; }
  if (typeof VIEW !== 'undefined' && VIEW) ui.libFor = VIEW.uid;
  const body = tab === 'mine' ? viewLibMine() : tab === 'all' ? viewLibAll() : viewLibCom();
  return libHead() + '<div class="stack">' + libTabsHTML(tab) + libCtxLine() + body + $t('<button class="btn block" data-act="blankPlan" type="button">Leeren Plan selbst bauen</button>') + '</div>'; };

/* Plan-Quellen: geteilte Pläne (sp:id) und frühere Pläne (ar:Index) */
const _planFromIdLT = planFromId;
planFromId = function (id) { id = String(id);
  if (id.startsWith('sp:')) { const b = SP.body[id.slice(3)]; const p = clone(b.plan); p.name = b.name; p.sharedId = b.id; return p; }
  if (id.startsWith('ar:')) { const a = S.archive[+id.slice(3)]; const p = clone(a.plan); delete p.assign; return p; }
  return _planFromIdLT(id); };
function viewSharedPlan(id) { const back = '<a href="#library" class="back">' + ICON.back + $t('Bibliothek</a>'); const b = SP.body[id]; if (!b) { spGet(id); return back + '<p class="muted">' + $t('Lade …') + '</p>'; }
  if (b.missing) return back + '<p>' + $t('Plan nicht gefunden.') + '</p>'; const pl = planFromId('sp:' + id), m = b.meta || {}, own = spMine(b); ui.chkLibGoal = m.goal;
  const st = b.status === 'curated' ? note('green', '<b>' + $t('Von uns geprüft.') + '</b>' + (b.review_note ? ' ' + esc(b.review_note) : '')) : SP_PUB.includes(b.status) ? note('amber', $t('Noch nicht von uns geprüft. Die Note kommt aus der automatischen Prüfung.')) : '';
  const ownActs = own ? '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" data-act="spEdit" data-id="' + id + '" type="button">' + $t('Sichtbarkeit und Name') + '</button><div class="grow"></div>' +
    (ui.spDel === id ? '<button class="btn dark" data-act="spDelYes" data-id="' + id + '" type="button">' + $t('Ja, löschen') + '</button>' : '<button class="btn" data-act="spDel" data-id="' + id + '" type="button">' + $t('Löschen') + '</button>') + '</div>' : '';
  return back + pageTop(esc(b.name), '', esc(own ? $t('Von dir') : (m.by || '') + ' · ' + (m.coach ? $t('Coach') : $t('Athlet')))) + '<div class="stack" style="margin-bottom:12px">' + st + '<div class="card"><div class="row" style="flex-wrap:nowrap;gap:10px;align-items:flex-start"><p class="grow" style="margin:0;min-width:0">' + esc(b.descr || $t('Ohne Beschreibung.')) + '</p><span class="tag" style="flex:0 0 auto;white-space:nowrap">' + esc($t(SP_ST[b.status] || '')) + '</span></div></div></div>' +
    (typeof chkCard === 'function' ? chkCard(pl, 'lib') : '') + libPreviewHTML({}, pl, ownActs + libActions('sp:' + id)); }
function viewArPlan(i) { const a = S.archive[i]; const back = '<a href="#library" class="back">' + ICON.back + $t('Bibliothek</a>'); if (!a || !a.plan) return back + '<p>' + $t('Plan nicht gefunden.') + '</p>'; const pl = planFromId('ar:' + i);
  return back + pageTop(esc($t(a.plan.name || '')), '', a.until ? $tf('Bis {d}', { d: fmtDay(a.until) }) : '') + (typeof chkCard === 'function' ? chkCard(pl, 'lib') : '') +
    libPreviewHTML({}, pl, (myUid() ? '<button class="btn block" style="margin-bottom:8px" data-act="spSave" data-src="ar:' + i + '" type="button">' + $t('Speichern oder veröffentlichen') + '</button>' : '') + libActions('ar:' + i)); }
const _viewLibPlanLT = viewLibPlan;
viewLibPlan = function (id) { id = String(id || ''); if (typeof VIEW !== 'undefined' && VIEW) ui.libFor = VIEW.uid;
  if (id.startsWith('sp:')) return viewSharedPlan(id.slice(3)); if (id.startsWith('ar:')) return viewArPlan(+id.slice(3)); return _viewLibPlanLT(id); };

/* Speichern, Sichtbarkeit, Löschen */
function spMeta(plan) { const r = typeof checkPlan === 'function' ? checkPlan(plan, {}) : { g: '–' }; const p = AUTH.profile || {};
  return { by: p.display_name || '', coach: isAdmin(), grade: r.g, goal: r.goal, gym: r.gym, sess: (plan.sessions || []).length, weeks: plan.weeks || null, tpl: plan.tpl || null }; }
function spSheet(o) { const pubN = spPubCount() - (o.sp && SP_PUB.includes(o.sp.status) ? 1 : 0), full = !isAdmin() && pubN >= 2, cur = o.sp ? o.sp.status : 'private';
  const opt = (v, l, sub, dis) => '<label class="act-pick" style="' + (dis ? 'opacity:.5' : '') + '"><input type="radio" name="sp-st" value="' + v + '"' + (cur === v ? ' checked' : '') + (dis ? ' disabled' : '') + '> <span class="grow">' + esc($t(l)) + '<br><span class="small muted" style="font-weight:500">' + esc(sub) + '</span></span></label>';
  openSheet(sheetHead(o.sp ? $t('Sichtbarkeit und Name') : $t('Plan speichern')) + '<div class="on-white" style="margin-top:12px"><div class="fields sp-full"><div class="field"><label for="sp-name">' + $t('Name') + '</label><input id="sp-name" maxlength="80" value="' + esc(o.name) + '"></div>' +
    '<div class="field"><label for="sp-descr">' + $t('Beschreibung') + '</label><textarea id="sp-descr" maxlength="600" rows="3" placeholder="' + esc($t('Für wen, Ziel, Aufbau')) + '">' + esc(o.descr || '') + '</textarea></div></div></div>' +
    '<div class="menu" style="margin-top:12px">' + (cur === 'curated' ? opt('curated', 'Geprüft beibehalten', $t('Änderst du Name oder Beschreibung, prüfen wir ihn erneut.')) : '') + opt('private', 'Privat', $t('Nur du siehst ihn unter „Meine Pläne“.')) + (isAdmin() ? opt('clients', 'Nur meine Athleten', $t('Deine Athleten sehen ihn unter „Meine Pläne“.')) : '') +
    opt('public', 'Öffentlich', full ? $t('Du hast schon 2 Pläne veröffentlicht.') : $t('Alle sehen ihn unter „Community“ und „Alle“.'), full && !SP_PUB.includes(cur)) +
    opt('submitted', 'Öffentlich und zur Prüfung einreichen', full ? $t('Du hast schon 2 Pläne veröffentlicht.') : $t('Wir prüfen ihn. Nach der Freigabe steht er unter „Kuratiert“ mit dem Abzeichen „Geprüft“.'), full && !SP_PUB.includes(cur)) + '</div>' +
    spTargetFields(o.sp ? o.sp.meta : null) + (isAdmin() ? '<label class="row" style="gap:10px;margin-top:12px"><input type="checkbox" id="sp-lock"' + (o.sp && o.sp.copy_lock ? ' checked' : '') + '> <span class="small"><b>' + $t('Kopierschutz') + '</b><br>' + $t('Andere können den Plan in der App nutzen, aber dort nicht bearbeiten, speichern oder weitergeben. Vollständig verhindern lässt sich Kopieren nicht.') + '</span></label>' : '') +
    '<p class="small muted" style="margin-top:10px">' + esc($tf('Automatische Prüfung: {g}', { g: o.grade })) + ' · ' + $t('Persönliche Notizen, Ziele und Startdatum werden nicht mitgeschickt.') + (isAdmin() ? '' : ' ' + $t('Du kannst höchstens 2 Pläne veröffentlichen.')) + '</p>' +
    '<div class="row" style="margin-top:14px"><div class="grow"></div><button class="btn brand" data-act="spSaveGo" data-src="' + esc(o.src || '') + '" data-id="' + esc(o.sp ? o.sp.id : '') + '" type="button">' + $t('Speichern') + '</button></div>'); }
function spClean(plan) { const c = tplClean(plan); ['startAt', 'maint', 'lock', 'sharedId', 'noPlan', 'paceChanged'].forEach(k => delete c[k]); return c; }
function spSrcPlan(src) { if (src === 'cur') return S.plan; if (src.startsWith('ar:')) { const a = S.archive[+src.slice(3)]; return a && a.plan; } return null; }
function spErr(e) { const t = errTxt(e) || ''; if (typeof dbErr === 'function' && dbErr(t) !== t) return dbErr(t); if (/Höchstens 2/.test(t)) return $t('Du kannst höchstens 2 Pläne veröffentlichen.'); if (/Zu viele/.test(t)) return $t('Zu viele gespeicherte Pläne. Lösche zuerst einen.'); return $t('Speichern fehlgeschlagen: ') + t; }
async function spSaveGo(b) { const name = ($('#sp-name').value || '').trim(), descr = ($('#sp-descr').value || '').trim() || null, r = document.querySelector('input[name="sp-st"]:checked'), status = r ? r.value : ((SP.body[b.dataset.id] || {}).status || 'private');
  if (!name) { toast($t('Bitte einen Namen eingeben.')); return; } b.disabled = true;
  try { if (b.dataset.id) { const id = b.dataset.id; const old = SP.body[id] || {}; await api('/rest/v1/shared_plans?id=eq.' + id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ name, descr, status, copy_lock: spLockVal(), meta: Object.assign({}, old.meta || {}, spTargetVal()) }) }); delete SP.body[id]; SP.list = null; closeSheet(); toast($t('Gespeichert')); render(); return; }
    const plan = spSrcPlan(b.dataset.src); if (!plan) throw new Error($t('Plan nicht gefunden.'));
    const row = await api('/rest/v1/shared_plans', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ name, descr, status, copy_lock: spLockVal(), plan: spClean(plan), meta: Object.assign(spMeta(plan), spTargetVal()) }) });
    SP.list = null; closeSheet(); toast(status === 'private' ? $t('Gespeichert') : $t('Veröffentlicht')); ui.libTab = 'mine'; const nr = row && row[0]; location.hash = nr ? '#library/sp:' + nr.id : '#library';
  } catch (e) { b.disabled = false; toast(spErr(e)); } }
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'libTab') { ui.libTab = b.dataset.v; render(); }
  else if (a === 'spSave') { const plan = spSrcPlan(b.dataset.src); if (!plan) return; if ((LIB_OWNER[plan.tpl] && !(LIB_OWNER[plan.tpl] || []).includes(myUid())) || (plan.lock && plan.lock.by !== myUid())) { toast($t('Dieser Plan kann nicht geteilt werden.')); return; }
    spSheet({ src: b.dataset.src, name: $t(plan.name || ''), grade: typeof checkPlan === 'function' ? checkPlan(plan, {}).g : '–' }); }
  else if (a === 'spEdit') { const sp = SP.body[b.dataset.id]; if (sp) spSheet({ sp, name: sp.name, descr: sp.descr, grade: spGrade(sp) }); }
  else if (a === 'spSaveGo') spSaveGo(b);
  else if (a === 'spDel') { ui.spDel = b.dataset.id; render(); }
  else if (a === 'spDelYes') { const id = b.dataset.id; api('/rest/v1/shared_plans?id=eq.' + id, { method: 'DELETE' }).then(() => { delete SP.body[id]; SP.list = null; ui.spDel = null; toast($t('Gelöscht')); location.hash = '#library'; }).catch(err => toast(errTxt(err))); } });
