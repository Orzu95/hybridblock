/* Hybridblock – Umstellung 09.11.: Der Hybridblock-Plan ist exklusiv (LIB_OWNER).
   Angemeldete Nutzer, die ihn trotzdem noch haben (alter Standardplan), bekommen einen leeren Plan
   und auf „Heute“ die Bitte, sich einen Plan zu suchen oder erstellen zu lassen. Fortschritt wandert ins Archiv. */
'use strict';
function planMigrate() { if (typeof AUTH === 'undefined' || !AUTH || !AUTH.uid || (typeof VIEW !== 'undefined' && VIEW)) return false; const p = S.plan;
  if (!p || p.tpl !== 'hybrid' || libVisible('hybrid')) return false;
  const done = Object.keys(S.sessions || {}).length; if (done) S.archive.push({ plan: p, sessions: S.sessions, block: S.block, until: today(), reason: 'exclusive' });
  S.plan = Object.assign(makePlan('blank'), { name: 'Noch kein Plan', noPlan: true }); S.sessions = {}; S.block = { week: 1, startedOn: null }; S.meta.needPlan = true;
  try { applyPlan(); } catch (e) { logErr('planmig:9', e, 1); } ui.week = null; save(); return true; }
let PM_DONE = false;
const _renderPM = render;
render = function () { if (!PM_DONE && typeof AUTH !== 'undefined' && AUTH && AUTH.uid) { PM_DONE = true; try { planMigrate(); } catch (e) { console.warn(e); } } return _renderPM.apply(this, arguments); };
const _switchPlanPM = switchPlan;
switchPlan = function () { S.meta.needPlan = false; return _switchPlanPM.apply(this, arguments); };
hbFilter('setPlan', 'planmig', function (__v) { const r = __v; if (S.plan && !S.plan.noPlan) { S.meta.needPlan = false; save(); } return r; });
hbFilter('heuteExtras', 'planmig', function (__v) { const h = __v; if (!S.meta.needPlan || (typeof VIEW !== 'undefined' && VIEW)) return h;
  return '<div class="card" style="box-shadow:inset 4px 0 0 var(--ember)"><h2 style="margin:0">' + $t('Such dir einen Trainingsplan aus') + '</h2><p class="small" style="margin:6px 0 12px">' + $t('Du hast noch keinen eigenen Plan. Wähle einen aus der Bibliothek oder lass dir einen passenden erstellen.') + '</p>' +
    '<div class="row" style="gap:8px;flex-wrap:wrap"><a class="btn brand" href="#library">' + $t('Zur Bibliothek') + '</a><button class="btn" data-act="genPlan" type="button">' + $t('Plan erstellen lassen') + '</button></div></div>' + h; });
