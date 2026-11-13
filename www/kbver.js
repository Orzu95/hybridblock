/* Hybridblock – 8.5 Versionierung der Wissensbank
   KB_VER = Stand der Wissensbank und Regeln. Pläne, geteilte Pläne und Check-ins merken sich, gegen welchen Stand sie geprüft wurden.
   Neue oder geänderte Regeln tragen „chg“ (Datum) und werden 60 Tage lang markiert. */
'use strict';
const KB_LOG = [
  { d: '2026-11-07', t: ['HRV zählt nach einem Beintag nur halb, Gefühl und Muskelkater mehr', 'Schlaf zählt nur mit der Dauer, nicht mit den Schlafphasen der Uhr', 'VO₂max der Uhr nur als Trend (±7 %)', 'Körperfett als Spanne (±4 Prozentpunkte)', 'Mindest-Energie nach dem Training: Frauen 30, Männer 25 kcal pro kg fettfreie Masse'] },
  { d: '2026-11-05', t: ['Abnehmtempo nach BMI und Alter, Erhaltung bei erreichtem Ziel', '1RM als Mittel aus drei Formeln, Belastungsquote nur noch als Information', 'Dieselben Muskeln frühestens nach 48 Stunden wieder', 'Plan-Prüfung gegen die Wissensbank'] }];
const KB_VER = KB_LOG[0].d;
const kbNewer = since => KB_LOG.filter(x => !since || x.d > since);
/* Stempel setzen */
const _switchPlanKB = switchPlan; switchPlan = function (plan) { if (plan) plan.kb = KB_VER; return _switchPlanKB.apply(this, arguments); };
const _peSaveKB = peSave; peSave = function () { if (PE && PE.draft) PE.draft.kb = KB_VER; return _peSaveKB.apply(this, arguments); };
hbFilter('doCheckin', 'kbver', function (__v) { const c = __v; if (c && typeof c === 'object') { c.kb = KB_VER; save(); } return c; });
if (typeof spMeta === 'function') { const _spMetaKB = spMeta; spMeta = function (plan) { return Object.assign(_spMetaKB(plan), { kb: KB_VER }); }; }
/* Plan-Prüfung: Wissensstand anzeigen, bei älterem Stempel die Neuerungen nennen */
hbFilter('chkCard', 'kbver', function (__v, plan, where) { const h = __v; if (!h || !plan) return h; const old = plan.kb && plan.kb < KB_VER ? kbNewer(plan.kb) : [];
  return h + (old.length ? note('sky', '<b>' + $tf('Seit diesem Plan ({d}) neu in der Wissensbank:', { d: fmtDay(plan.kb) }) + '</b><ul class="rules small" style="margin:6px 0 0">' + old.flatMap(x => x.t).map(t => '<li>' + esc($t(t)) + '</li>').join('') + '</ul><div class="small muted" style="margin-top:4px">' + $t('Die Prüfung oben nutzt schon den neuen Stand.') + '</div>')
    : '<p class="small muted" style="margin:4px 4px 0">' + $tf('Geprüft gegen den Wissensstand vom {d}', { d: fmtDay(KB_VER) }) + '</p>'); });
/* Regeln: neu/geändert markieren, Änderungsliste oben */
hbFilter('ruleRow', 'kbver', function (__v, id) { const r = RULES[id], h = __v; if (!r || !r.chg || daysBetween(r.chg, today()) > 60) return h; return h.replace('<b>', '<span class="tag" style="margin-right:6px;background:var(--sky-soft,#e4f1fb)">' + esc(r.isNew === false ? $t('Geändert') : $t('Neu')) + ' ' + esc(fmtDay(r.chg)) + '</span><b>'); });
const _rulesSheetKB = rulesSheet;
rulesSheet = function () { _rulesSheetKB(); const el = document.querySelector('#sheet .small.muted'); if (!el) return;
  el.insertAdjacentHTML('afterend', '<details style="margin-top:10px"><summary class="small" style="font-weight:700;cursor:pointer">' + esc($tf('Wissensstand {d}: Was sich geändert hat', { d: fmtDay(KB_VER) })) + '</summary>' + KB_LOG.map(x => '<div class="lbl" style="margin-top:8px">' + esc(fmtDay(x.d)) + '</div><ul class="rules small" style="margin:4px 0 0">' + x.t.map(t => '<li>' + esc($t(t)) + '</li>').join('') + '</ul>').join('') + '</details>'); };
