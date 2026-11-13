/* Hybridblock – Gym ohne Plan: Übung für Übung eintragen (live oder nachträglich),
   danach als Vorlage speichern und einen Vorschlag für die nächste Einheit bekommen (wann und mit welchen Gewichten). */
'use strict';
function gymFreeStart() {
  const a = newActivity('kraft');
  a.t0 = Date.now();
  save();
  closeSheet();
  location.hash = '#frei/' + a.id;
  setTimeout(() => exPickSheet(a.id), 120);
}
/* Harte Sätze pro Muskel in dieser Einheit */
function gymMuscles(a) {
  const v = {};
  (a.exercises || []).forEach(e => {
    const ex = LIB[e.ex];
    if (!ex) return;
    const n = (e.sets || []).filter(x => x && (x.done || x.r != null)).length;
    for (const m in ex.muscles) if (ex.muscles[m] >= 0.5) v[m] = (v[m] || 0) + n * ex.muscles[m];
  });
  return v;
}
/* Nächstes Ziel pro Übung: alle Sätze am oberen Ende der Wdh.-Spanne oder leicht (RPE ≤ 7) → mehr Gewicht, sonst gleiches Gewicht und eine Wdh. mehr */
function gymNextFor(e) {
  const done = (e.sets || []).filter(x => x && (x.done || x.r != null) && num(x.r) != null);
  if (!done.length) return null;
  const top = done.reduce((b, x) => ((num(x.w) || 0) > (num(b.w) || 0) ? x : b), done[0]);
  const w = num(top.w),
    r = num(top.r);
  const rr = repRange(e.reps || '') || { lo: Math.max(1, r - 2), hi: r + 2 };
  const allTop = done.every(x => num(x.r) >= rr.hi),
    easy = done.every(x => num(x.rpe) != null && num(x.rpe) <= 7);
  if (w && (allTop || easy)) return { load: Math.round((w + incFor(e.ex)) * 4) / 4, reps: rr.lo, up: true };
  return { load: w, reps: Math.min(rr.hi, r + 1), up: false };
}
function gymNext(a) {
  const v = gymMuscles(a),
    hard = Object.keys(v).filter(m => v[m] >= 2);
  const gap = RV('next_gap');
  const d0 = a.date || today();
  const same = addDays(d0, Math.ceil(gap / 24));
  const free = ['q', 'h', 'g', 'ch', 'b', 'fd', 'sd'].filter(m => !hard.includes(m) && !(m === 'sd' && hard.includes('fd')));
  return { hard, same, tomorrow: addDays(d0, 1), free, ex: (a.exercises || []).map(e => ({ ex: e.ex, n: gymNextFor(e) })).filter(x => x.n) };
}
function gymSaveTemplate(a, nx, when) {
  let x = a.wo && (S.workouts || []).find(o => o.id === a.wo);
  if (!x) {
    x = saveActAsWorkout(a);
    a.wo = x.id;
  } else
    x.items = (a.exercises || []).map(e => ({
      ex: e.ex,
      sets: (e.sets || []).length || 3,
      reps: e.reps || '8–12',
      rpe: e.rpe ?? 8,
      rest: e.rest || 90,
      grp: e.grp || '',
      gm: e.gm || ''
    }));
  x.items.forEach(it => {
    const n = nx.ex.find(o => o.ex === it.ex);
    if (n && n.n.load) it.load = n.n.load;
    if (n && n.n.reps) it.repT = n.n.reps;
  });
  if (when) x.next = when;
  x.last = a.date || today();
  save();
  return x;
}
function gymFinishSheet(a) {
  const nx = gymNext(a),
    sets = (a.exercises || []).reduce((s, e) => s + (e.sets || []).filter(x => x && (x.done || x.r != null)).length, 0);
  const wd = d => fmtDay(d);
  const exl = nx.ex
    .map(
      o =>
        '<li><b>' +
        esc(LIB[o.ex] ? LIB[o.ex].name : o.ex) +
        ':</b> ' +
        (o.n.load ? fmt(o.n.load) + ' kg × ' : '') +
        o.n.reps +
        $t(' Wdh.') +
        (o.n.up ? ' <span class="t-green">↑</span>' : '') +
        '</li>'
    )
    .join('');
  const tpl = a.wo && (S.workouts || []).find(o => o.id === a.wo);
  openSheet(
    sheetHead($t('Training gespeichert')) +
      '<p class="muted" style="margin-top:6px">' +
      $tf('{e} Übungen · {s} Sätze', { e: (a.exercises || []).length, s: sets }) +
      (num(a.dur) ? ' · ' + fmt(num(a.dur), 0) + $t(' min') : '') +
      '</p>' +
      '<div class="card" style="margin-top:12px"><h3 style="margin:0">' +
      $t('Nächste Einheit') +
      '</h3>' +
      (nx.hard.length
        ? '<p style="margin:8px 0 0">' +
          $tf('Dieselben Muskeln wieder ab {d}', { d: '<b>' + wd(nx.same) + '</b>' }) +
          ' ' +
          $tf('Gib ihnen etwa {h} Stunden Pause.', { h: RV('next_gap') }) +
          '</p>'
        : '') +
      (nx.free.length && nx.hard.length
        ? '<p class="small muted" style="margin:6px 0 0">' + $tf('Schon morgen ginge: {m}.', { m: nx.free.map(m => MUSCLES[m]).join(', ') }) + '</p>'
        : '') +
      (exl
        ? '<div class="lbl" style="margin-top:10px">' +
          $t('Ziele fürs nächste Mal') +
          '</div><ul class="rules" style="margin-top:4px">' +
          exl +
          '</ul><p class="small muted">' +
          $t('↑ Alle Sätze am oberen Ende oder leicht: etwas mehr Gewicht. Sonst gleiches Gewicht und eine Wiederholung mehr.') +
          '</p>'
        : '') +
      '<div style="margin-top:6px">' +
      ruleBtn(['next_gap', 'autoreg'], $t('Warum?')) +
      '</div></div>' +
      '<div class="stack" style="margin-top:12px">' +
      (nx.hard.length
        ? '<button class="btn brand block" data-act="gymPlanNext" data-aid="' +
          a.id +
          '" type="button">' +
          $tf('Als Vorlage speichern und für {d} einplanen', { d: fmtDay(nx.same) }) +
          '</button>'
        : '') +
      '<button class="btn block" data-act="gymSaveTpl" data-aid="' +
      a.id +
      '" type="button">' +
      (tpl ? $t('Vorlage aktualisieren') : $t('Nur als Vorlage speichern')) +
      '</button>' +
      '<button class="btn block fog" data-act="closeSheet" type="button">' +
      $t('Fertig') +
      '</button></div>'
  );
}
function gymFinish(a) {
  a.fin = true;
  if (!num(a.dur) && a.t0 && a.date === today()) {
    const m = Math.round((Date.now() - a.t0) / 60000);
    if (m >= 5 && m <= 240) a.dur = String(m);
  }
  save();
  render();
  gymFinishSheet(a);
}
/* Heute: eingeplante Vorlagen */
function gymDueCard() {
  const due = (S.workouts || []).filter(x => x.next && x.next <= today() && !(x.last && x.last >= x.next));
  if (!due.length) return '';
  return due
    .map(x =>
      note(
        'ember',
        '<b>' + esc(x.name || $t('Training')) + '</b> ' + (x.next < today() ? $tf('war für {d} eingeplant.', { d: fmtDay(x.next) }) : $t('ist heute dran.')),
        '<button class="btn sm brand" data-act="woStart" data-id="' + x.id + '" type="button">' + $t('Starten') + '</button>'
      )
    )
    .join('');
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (!act.startsWith('gym')) return;
  const a = b.dataset.aid && findAct(b.dataset.aid);
  switch (act) {
    case 'gymFree':
      gymFreeStart();
      break;
    case 'gymFinish':
      if (a) gymFinish(a);
      break;
    case 'gymSaveTpl':
      if (a) {
        const x = gymSaveTemplate(a, gymNext(a));
        closeSheet();
        toast($t('Als Vorlage gespeichert: ') + (x.name || ''));
        render();
      }
      break;
    case 'gymPlanNext':
      if (a) {
        const nx = gymNext(a);
        const x = gymSaveTemplate(a, nx, nx.same);
        closeSheet();
        toast($tf('Eingeplant für {d}', { d: fmtDay(nx.same) }));
        render();
      }
      break;
  }
});
