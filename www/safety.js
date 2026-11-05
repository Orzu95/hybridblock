/* Hybridblock – Schutz vor Verwechslung von Coaching und eigenem Training
   Fehler vom 06.11.: In „Ansicht als Athlet“ hat ein Planwechsel den Plan an das Konto des Coaches geschickt.
   1. Planwechsel in der Athletenansicht geht immer an den Athleten (Plan-Editor des Athleten), nie an den Coach.
   2. pushPlan an das eigene Konto ist in der Athletenansicht gesperrt.
   3. Im Coaching-Modus zeigt jede eigene Seite deutlich, dass es das eigene Training ist.
   4. Jeder Planwechsel lässt sich 7 Tage lang rückgängig machen (inkl. Wochentagen). */
'use strict';
/* 2. Schreibsperre */
const _pushPlanSafe = pushPlan;
pushPlan = async function (uid2, plan) { if (typeof VIEW !== 'undefined' && VIEW && AUTH && uid2 === AUTH.uid) { toast($t('In der Athletenansicht kannst du deinen eigenen Plan nicht ändern.')); throw new Error($t('In der Athletenansicht kannst du deinen eigenen Plan nicht ändern.')); } return _pushPlanSafe(uid2, plan); };
/* 1. Planwechsel in der Athletenansicht → Plan-Editor des Athleten */
function planForAthlete(plan) { const uid2 = VIEW.uid, name = VIEW.name; exitView(); PE.uid = uid2; PE.draft = JSON.parse(JSON.stringify(plan)); PE.name = name; PE.dirty = true; PE.confirm = null; ui.libFor = null;
  setTimeout(() => { location.hash = '#plan/' + uid2; toast($tf('Plan für {n} vorbereitet. Prüfen und „Speichern und senden“.', { n: name })); }, 30); }
const _switchPlanSafe = switchPlan;
switchPlan = function (plan) { if (typeof VIEW !== 'undefined' && VIEW) { planForAthlete(plan); return; }
  const dm = JSON.parse(JSON.stringify(S.settings.dayMap || {})), ds = S.meta.daysSet, n0 = S.archive.length, old = S.plan;
  _switchPlanSafe(plan); const ar = S.archive[S.archive.length - 1]; if (S.archive.length > n0 && ar && ar.plan === old) { ar.dayMap = dm; ar.daysSet = ds; ar.at = Date.now(); save(); } };
/* Bibliothek in der Athletenansicht: Auswahl gilt für den Athleten */
const _viewLibrarySafe = viewLibrary;
viewLibrary = function () { if (typeof VIEW !== 'undefined' && VIEW) ui.libFor = VIEW.uid; return _viewLibrarySafe(); };
const _viewLibPlanSafe = viewLibPlan;
viewLibPlan = function (id) { if (typeof VIEW !== 'undefined' && VIEW) ui.libFor = VIEW.uid; return _viewLibPlanSafe(id); };
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || typeof VIEW === 'undefined' || !VIEW) return; const a = b.dataset.act;
  if (a === 'libUseFor' || a === 'blankPlan') { const uid2 = VIEW.uid; exitView(); ui.libFor = uid2; return; }
  }, true);
/* Plan-Editor „Mein Plan“ in der Athletenansicht verhindern */
const _viewPlanSafe = viewPlan;
viewPlan = function (arg) { if (typeof VIEW !== 'undefined' && VIEW && planTarget(arg) === 'me') { const uid2 = VIEW.uid; exitView(); setTimeout(() => { location.hash = '#plan/' + uid2; }, 20); return '<p class="muted">' + $t('Lade …') + '</p>'; } return _viewPlanSafe(arg); };

/* 3. Coaching-Modus: eigene Seiten deutlich kennzeichnen */
const OWN_ROUTES = ['training', 'essen', 'verlauf', 'frei', 'track', 'planend', 'workout', 'lernen'];
const _viewBarSafe = viewBar;
viewBar = function () { const h = _viewBarSafe(); if (typeof VIEW !== 'undefined' && VIEW) return h; if (!isAdmin() || typeof cMode !== 'function' || cMode() !== 'coach') return h;
  const own = OWN_ROUTES.includes(route.name) || (route.name === 'plan' && planTarget(route.arg) === 'me') || (route.name === 'library' && !ui.libFor);
  if (route.name === 'frei' && route.arg) { const a = findAct(route.arg); if (a && a.coachFor) return h; }
  return own ? h + '<div class="ownbar"><span class="grow">' + $t('Das ist dein eigenes Training, nicht das eines Athleten.') + '</span><button class="btn sm" data-act="cmode" data-v="own" type="button">' + $t('Zu „Mein Training“') + '</button></div>' : h; };
/* Bibliothek ohne Athlet im Coaching-Modus: Hinweis, für wen gewählt wird */
const _libCtxLineSafe = libCtxLine;
libCtxLine = function () { const h = _libCtxLineSafe(); if (ui.libFor || !isAdmin()) return h; return note('amber', '<b>' + $t('Du wählst einen Plan für dich selbst.') + '</b> ' + $t('Für einen Athleten gehst du über Team → Athlet → „Aus Bibliothek“.')) + h; };

/* 4. Planwechsel rückgängig machen (7 Tage) */
function undoSwitchCard() { if (typeof VIEW !== 'undefined' && VIEW) return ''; const ar = S.archive[S.archive.length - 1]; if (!ar || !ar.plan || !ar.until || ar.undoHidden) return ''; if (daysBetween(ar.until, today()) > 7) return '';
  if (!Object.keys(ar.sessions || {}).length) return '';
  return note('amber', $tf('Plan am {d} von „{a}“ auf „{b}“ gewechselt.', { d: fmtDay(ar.until), a: $t(ar.plan.name || ''), b: $t(S.plan.name || '') }), '<div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn sm brand" data-act="undoSwitch" type="button">' + $t('Rückgängig') + '</button><button class="btn sm" data-act="undoSwitchHide" type="button">' + $t('Passt so') + '</button></div>'); }
function undoSwitch() { const ar = S.archive.pop(); if (!ar) return; S.plan = ar.plan; S.sessions = ar.sessions || {}; S.block = ar.block || { week: 1, startedOn: null }; if (ar.dayMap) S.settings.dayMap = ar.dayMap; S.meta.daysSet = ar.daysSet != null ? ar.daysSet : true;
  applyPlan(); ui.week = null; save(); if (AUTH) pushPlan(AUTH.uid, S.plan).then(t => { S.meta.planAt = t; persist(); }).catch(() => {}); toast($tf('„{p}“ ist wieder dein Plan, mit deinem Fortschritt.', { p: $t(S.plan.name || '') })); render(); }
const _heuteExtrasSafe = heuteExtras;
heuteExtras = function () { return undoSwitchCard() + _heuteExtrasSafe(); };
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'undoSwitch') undoSwitch();
  else if (b.dataset.act === 'undoSwitchHide') { const ar = S.archive[S.archive.length - 1]; if (ar) { ar.undoHidden = true; save(); render(); } } });
