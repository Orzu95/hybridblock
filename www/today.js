/* Hybridblock – „Vorschlag für heute“ ganz oben auf der Startseite.
   Ein Satz mit Begründung aus Tagesform (Bereitschaft, Schlaf, Ruhepuls), Belastung der letzten 7 Tage und dem Wochenplan.
   Schlägt die App eine Anpassung vor, gibt es „Übernehmen“ und „Beibehalten“; nichts ändert sich ohne Bestätigung.
   Anpassungen: Kraft → auf ein Zeitbudget kürzen (Hauptübungen und Schwerpunkt bleiben, s.budget aus zeit.js); harte Ausdauer → locker in Zone 2 mit 80 % der Dauer (s.easy).
   „Warum?“ öffnet die Regeln (Bereitschaft, Belastungssprung). Darunter: Belastung der letzten 6 Wochen als Balken. */
'use strict';
const TS_EASY = 0.8;
function tsLoads() {
  const t = today();
  const out = [];
  for (let i = 5; i >= 0; i--) out.push(Math.round(weekLoad(addDays(t, -7 * i)).tot));
  return out;
}
function tsCardioMin(sp) {
  return sp.mode === 'z2' ? num(sp.min) || 30 : (num(sp.warm) || 10) + (num(sp.reps) || 0) * ((num(sp.dur) || 0) + (num(sp.rest) || 0)) + (num(sp.cool) || 5);
}
hbFilter('cardioSpec', 'today', function (sp, w, k) {
  const s = peekSess(w, k);
  if (!sp || !s || !s.easy || s.done || sp.mode === 'z2') return sp;
  const min = Math.max(20, Math.round((tsCardioMin(sp) * TS_EASY) / 5) * 5);
  return Object.assign({}, sp, { mode: 'z2', min, reps: null, dur: null, rest: null, hi: false, title: $tf('{m} min locker', { m: min }) });
});
function tsSuggest() {
  if ((typeof VIEW !== 'undefined' && VIEW) || !ORDER.length || pauseOn() || reState()) return null;
  const t = today(),
    w = curWeek(),
    loads = tsLoads();
  let planned = [];
  try {
    planned =
      S.settings.mode === 'rotation'
        ? ORDER.filter(k => !sessProgress(w, k).done).slice(0, 1)
        : wkPlan(w)
            .items.filter(o => o.date === t && wkOpen(o))
            .map(o => o.k);
  } catch (e) {
    planned = sessionsOnDow(new Date().getDay()).filter(k => !sessProgress(w, k).done);
  }
  const doneToday = ORDER.some(k => {
    const p = sessProgress(w, k);
    return p.done && sessDoneDate(w, k) === t;
  });
  if (!planned.length) return { kind: doneToday ? 'done' : 'rest', loads };
  const k = planned[0],
    s = peekSess(w, k) || {},
    r = readiness(w, k),
    dr = r.dr,
    gym = isGym(k);
  const sp = gym ? null : cardioSpec__base(w, k);
  const hard = gym || (sp && sp.mode !== 'z2');
  const why = [];
  if (dr && dr.score < 50) why.push($tf('Bereitschaft {n} von 100', { n: Math.round(dr.score) }));
  if (r.sleepBad) why.push($t('schlechter Schlaf'));
  if (r.rhrHigh) why.push($tf('Ruhepuls {n} über deinem Schnitt', { n: Math.round(r.rhr - r.base.v) }));
  const prev = loads.slice(2, 5).filter(x => x > 0);
  const avg = prev.length >= 2 ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;
  const spike = avg > 0 && loads[5] > avg * RV('load_spike');
  if (spike) why.push($tf('Belastung der letzten 7 Tage {p} % über deinem Schnitt', { p: Math.round((loads[5] / avg - 1) * 100) }));
  const o = { k, w, title: SESS[k].title, loads, why, score: dr ? Math.round(dr.score) : null, gym, rules: ['readiness'].concat(spike ? ['load_spike'] : []) };
  if (s.easy || s.budget) return Object.assign(o, { kind: 'applied', min: s.budget || null });
  if (why.length && hard) {
    if (gym) {
      const full = zEst(planFor(w, k));
      const B =
        Z_BUDGETS.slice()
          .reverse()
          .find(m => m < full - 4 && m >= 30) || null;
      if (B) return Object.assign(o, { kind: 'cut', min: B, kept: S.meta.tsKeep === t });
    } else return Object.assign(o, { kind: 'easy', min: Math.max(20, Math.round((tsCardioMin(sp) * TS_EASY) / 5) * 5), kept: S.meta.tsKeep === t });
  }
  return Object.assign(o, { kind: 'go' });
}
function tsBars(loads) {
  const mx = Math.max(1, ...loads);
  if (!loads.some(x => x > 0)) return '';
  return (
    '<div class="ts-load" aria-label="' +
    esc($t('Belastung der letzten 6 Wochen')) +
    '">' +
    loads
      .map((v, i) => '<i class="' + (i === 5 ? 'now' : '') + '" style="height:' + Math.max(6, Math.round((v / mx) * 100)) + '%" title="' + v + '"></i>')
      .join('') +
    '</div><div class="ts-cap small muted"><span>' +
    $t('Belastung, je 7 Tage') +
    '</span><span>' +
    $t('jetzt') +
    '</span></div>'
  );
}
function tsCard() {
  let x;
  try {
    x = tsSuggest();
  } catch (e) {
    logErr('today', e);
    return '';
  }
  if (!x) return '';
  const whyTxt = x.why && x.why.length ? x.why.join(', ') : '';
  let head,
    txt,
    btn = '';
  if (x.kind === 'rest') {
    head = $t('Heute frei');
    txt = $t('Kein Training geplant. Erholung gehört zum Plan.');
  } else if (x.kind === 'done') {
    head = $t('Für heute erledigt');
    txt = $t('Dein Training für heute ist eingetragen.');
  } else if (x.kind === 'applied') {
    head = $t('Angepasst');
    txt = x.gym
      ? $tf('{t}: auf etwa {m} Minuten gekürzt. Hauptübungen und Schwerpunkt bleiben.', { t: esc(x.title), m: x.min })
      : $tf('{t}: heute locker statt hart.', { t: esc(x.title) });
    btn =
      '<button class="btn sm" style="background:var(--fog)" data-act="tsUndo" data-w="' +
      x.w +
      '" data-k="' +
      esc(x.k) +
      '" type="button">' +
      $t('Zurück zum Plan') +
      '</button>';
  } else if ((x.kind === 'cut' || x.kind === 'easy') && !x.kept) {
    head = $t('Heute etwas weniger');
    txt =
      (x.kind === 'cut'
        ? $tf('{t} auf etwa {m} Minuten kürzen: Hauptübungen und Schwerpunkt bleiben, Gewichte bleiben.', { t: esc(x.title), m: x.min })
        : $tf('{t} heute locker, etwa {m} Minuten, statt der harten Einheit.', { t: esc(x.title), m: x.min })) +
      ' ' +
      $tf('Grund: {w}.', { w: whyTxt });
    btn =
      '<button class="btn sm" style="background:var(--fog)" data-act="tsKeep" type="button">' +
      $t('Beibehalten') +
      '</button><button class="btn brand sm" data-act="tsApply" data-kind="' +
      x.kind +
      '" data-min="' +
      x.min +
      '" data-w="' +
      x.w +
      '" data-k="' +
      esc(x.k) +
      '" type="button">' +
      $t('Übernehmen') +
      '</button>';
  } else {
    head = $t('Wie geplant');
    txt =
      $tf('{t} steht an.', { t: esc(x.title) }) +
      ' ' +
      (whyTxt
        ? $tf('Beachte: {w}. Die App senkt das Ziel-RPE um 1, wenn nötig.', { w: whyTxt })
        : x.score != null
          ? $tf('Bereitschaft {n} von 100, keine Warnzeichen.', { n: x.score })
          : $t('Keine Warnzeichen aus Schlaf, Ruhepuls und Belastung.'));
  }
  const go = x.k && x.kind !== 'done' ? '<a class="btn sm" href="#training/' + sKey(x.w, x.k) + '">' + $t('Zur Einheit') + '</a>' : '';
  return (
    '<div class="card ts-card" id="tscard"><div class="row" style="align-items:baseline;gap:8px"><div class="lbl grow">' +
    $t('Vorschlag für heute') +
    '</div>' +
    (x.rules ? ruleBtn(x.rules, $t('Warum?')) : '') +
    '</div><h2 style="margin:4px 0 4px">' +
    head +
    '</h2><p class="small" style="margin:0">' +
    txt +
    '</p>' +
    (btn || go ? '<div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><div class="grow"></div>' + (btn || go) + '</div>' : '') +
    tsBars(x.loads) +
    '</div>'
  );
}
hbFilter('viewHeute', 'today', function (h) {
  const c = tsCard();
  if (!c) return h;
  const i = h.indexOf('<div class="stack">');
  return i < 0 ? h : h.slice(0, i + 19) + c + h.slice(i + 19);
});
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'tsKeep') {
    S.meta.tsKeep = today();
    save();
    render();
  } else if (a === 'tsApply') {
    const s = sess(+b.dataset.w, b.dataset.k);
    if (b.dataset.kind === 'cut') s.budget = +b.dataset.min;
    else s.easy = true;
    save();
    render();
    toast($t('Für heute angepasst'));
  } else if (a === 'tsUndo') {
    const s = sess(+b.dataset.w, b.dataset.k);
    delete s.budget;
    delete s.easy;
    S.meta.tsKeep = today();
    save();
    render();
    toast($t('Zurück zum Plan'));
  }
});
