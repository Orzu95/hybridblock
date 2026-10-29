/* ======================= TRAININGSTAGE: Wunschanzahl ↔ Einheiten des Plans ↔ feste oder freie Tage ======================= */
/* Verteilung der Tage über die Woche (1 = Mo … 6 = Sa, 0 = So), möglichst mit Pausen zwischen den Einheiten. */
const SPREAD = { 1: [1], 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 5, 6], 6: [1, 2, 3, 4, 5, 6], 7: [1, 2, 3, 4, 5, 6, 0] };
const wishDays = () => { const q = S.settings.q || {}; const n = parseInt(q.days, 10); return n >= 1 && n <= 7 ? n : null; };
/* Leerer Plan: so viele Einheiten wie gewünscht (statt fest zwei) */
const _makePlanPd = makePlan; makePlan = function (tpl) { const p = _makePlanPd(tpl); if (tpl !== 'blank') return p; const n = wishDays() || 2;
  p.sessions = Array.from({ length: n }, (_, i) => ({ k: SESSION_LETTERS[i], kind: 'gym', title: $t('Einheit ') + SESSION_LETTERS[i], sub: '', add: [] }));
  p.dayMap = {}; p.sessions.forEach((s, i) => p.dayMap[s.k] = SPREAD[n][i]); return p; };
/* Feste Tage automatisch verteilen, wenn noch keiner gesetzt ist */
function autoSpreadDays() { const ks = ORDER, dm = S.settings.dayMap; if (ks.some(k => dm[k] !== '' && dm[k] != null)) return; const sp = SPREAD[Math.min(7, ks.length)] || []; ks.forEach((k, i) => dm[k] = sp[i] ?? ''); }
/* Hinweis im Schritt „Trainingstage“: passt die Anzahl? */
function daysFitHint() { const want = wishDays(); if (!want || !S.plan || S.plan.free) return ''; const have = ORDER.length; const cardio = ORDER.filter(k => isCardio(k)).length;
  if (have < want) { const extra = want - have; const kind = cardio ? $t('lockere Z2-Einheit') : $t('Z2-Einheit (30–45 min locker)');
    return note('sky', '<b>' + $tf('Du möchtest {n}× pro Woche trainieren, der Plan hat {m} Einheiten.', { n: want, m: have }) + '</b> ' + $t('Für die übrigen Tage empfehlen wir: ') + (extra > 1 ? extra + ' × ' : '') + '<b>' + kind + '</b>. ' + $t('Lockeres Ausdauertraining stört den Kraftaufbau kaum, wenn es nicht direkt vor Beintagen liegt.') +
      '<div style="margin-top:8px"><button class="btn sm brand" data-act="pdAddZ2" data-n="' + extra + '" type="button">' + (extra > 1 ? $t('Z2-Einheiten hinzufügen') : $t('Z2-Einheit hinzufügen')) + '</button>' + (typeof evBtn === 'function' ? ' ' + evBtn(['CON-105', 'CON-101'], $t('Studienlage')) : '') + '</div>'); }
  if (have > want) return note('amber', '<b>' + $tf('Der Plan hat {m} Einheiten, du möchtest {n}× pro Woche trainieren.', { n: want, m: have }) + '</b> ' + $t('Stell auf „Der Reihe nach“: Du machst einfach die nächste Einheit, wenn du trainierst. Eine Planwoche dauert dann etwas länger als 7 Tage.') +
    '<div style="margin-top:8px"><button class="btn sm brand" data-act="pdRotation" type="button">' + $t('Der Reihe nach trainieren') + '</button></div>');
  return ''; }
const _viewStartPd = viewStart; viewStart = function (arg) { const h = _viewStartPd(arg); if (ONB.step !== 'days') return h; const hint = daysFitHint(); if (!hint) return h;
  const i = h.indexOf('<div class="card"><div class="fields">'); return i < 0 ? h : h.slice(0, i) + hint + h.slice(i); };
/* Auch in den Einstellungen bei „Wochentage“ */
const _viewMehrPd = viewMehr; viewMehr = function () { const h = _viewMehrPd(); if (VIEW) return h; const hint = daysFitHint(); if (!hint) return h; const m = h.indexOf('data-dm='); if (m < 0) return h; const i = h.lastIndexOf('<div class="card"', m); return i < 0 ? h : h.slice(0, i) + hint + h.slice(i); };
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'pdAddZ2') { const n = +b.dataset.n || 1; const used = new Set(ORDER); const letters = ['Z', 'Y', 'X', 'W'].filter(l => !used.has(l));
    for (let i = 0; i < n && letters[i]; i++) S.plan.sessions.push({ k: letters[i], kind: 'z2', title: $t('Z2 Grundlage'), sub: $t('Rudern, Rad, Schwimmen, Incline Walk') });
    applyPlan(); const free = [1, 2, 3, 4, 5, 6, 0].filter(d => !ORDER.some(k => String(S.settings.dayMap[k]) === String(d))); ORDER.forEach(k => { if (S.settings.dayMap[k] === '' && free.length) { const pick = free.find(d => d === 6 || d === 3) ?? free[0]; S.settings.dayMap[k] = pick; free.splice(free.indexOf(pick), 1); } });
    save(); render(); doneOverlay(n > 1 ? $t('Z2-Einheiten hinzugefügt') : $t('Z2-Einheit hinzugefügt')); }
  else if (b.dataset.act === 'pdRotation') { S.settings.mode = 'rotation'; save(); render(); toast($t('Der Reihe nach, egal welcher Tag')); } });
/* Beim Wechsel in den Schritt „Trainingstage“ einmal sinnvoll vorbelegen */
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; if (['onbPick', 'onbPath', 'onbGenAgain', 'libUseYes'].includes(b.dataset.act)) setTimeout(() => { try { autoSpreadDays(); save(); if (route.name === 'start') render(); } catch (er) {} }, 60); });
