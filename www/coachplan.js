/* Hybridblock – Coach-Vorgaben im Plan des Athleten:
   habits: Gewohnheiten und Aufgaben [{id, kind: steps|water|sleep|protein|log|task, n, t, days: [0–6]}], Haken in S.daily[Tag].hab
   cform:  eigener Check-in-Fragebogen {day: 0–6 (Mo = 0), q: [{id, t, ty: sc|num|yn|txt}]}, Antworten in S.daily[Tag].cf
   Beide bleiben erhalten, wenn der Coach einen neuen Plan oder eine Vorlage ohne diese Felder schickt. */
'use strict';
/* ---------- Gewohnheiten ---------- */
const HB_KINDS = () => [
  ['steps', $t('Schritte'), 8000],
  ['water', $t('Wasser (Liter)'), 2.5],
  ['sleep', $t('Schlaf (Stunden)'), 7],
  ['protein', $t('Proteinziel erreichen'), null],
  ['log', $t('Essen vollständig eintragen'), null],
  ['task', $t('Eigene Aufgabe'), null]
];
const habOf = () => (S.plan && Array.isArray(S.plan.habits) ? S.plan.habits : []);
function habLabel(h) {
  switch (h.kind) {
    case 'steps':
      return $tf('{n} Schritte', { n: fmt(h.n || 8000, 0) });
    case 'water':
      return $tf('{n} l Wasser', { n: fmt(h.n || 2.5, 1) });
    case 'sleep':
      return $tf('{n} h Schlaf', { n: fmt(h.n || 7, 1) });
    case 'protein':
      return $t('Proteinziel erreichen');
    case 'log':
      return $t('Essen vollständig eintragen');
    default:
      return h.t || $t('Aufgabe');
  }
}
const habDays = h => (Array.isArray(h.days) && h.days.length && h.days.length < 7 ? h.days.map(i => SH_WD()[i]).join(', ') : $t('täglich'));
const habDue = (h, d) => !Array.isArray(h.days) || !h.days.length || h.days.includes(dIdx(d));
function habAuto(h, d) {
  const H = S.health[d] || {},
    D = S.days[d] || {};
  switch (h.kind) {
    case 'steps': {
      const g = h.n || 8000;
      return H.steps != null ? { ok: H.steps >= g, f: H.steps / g, txt: fmt(H.steps, 0) + ' / ' + fmt(g, 0) } : null;
    }
    case 'water': {
      const ml = num(D.water) || 0,
        g = (h.n || 2.5) * 1000;
      return { ok: ml >= g, f: ml / g, txt: fmt(ml / 1000, 1) + ' / ' + fmt(g / 1000, 1) + ' l' };
    }
    case 'sleep':
      return H.sleepMin != null ? { ok: H.sleepMin >= (h.n || 7) * 60, txt: fmtMin(H.sleepMin) } : null;
    case 'protein': {
      const g = (currentTargets() || {}).p;
      if (!(D.entries && D.entries.length) || !g) return { ok: false, f: 0, txt: g ? '0 / ' + fmt(g, 0) + ' g' : '' };
      const p = dayTotals(d).p;
      return { ok: p >= 0.9 * g, f: p / g, txt: fmt(p, 0) + ' / ' + fmt(g, 0) + ' g' };
    }
    case 'log':
      return { ok: !!(D.entries && D.entries.length) && D.complete !== false, txt: '' };
  }
  return null;
}
const habTicked = (h, d) => !!((S.daily[d] || {}).hab || {})[h.id];
function habDone(h, d) {
  if (habTicked(h, d)) return true;
  const a = habAuto(h, d);
  return !!(a && a.ok);
}
function habQuota(h, from, n) {
  let a = 0,
    b = 0;
  for (let i = from; i < from + n; i++) {
    const d = addDays(today(), -i);
    if (!habDue(h, d)) continue;
    b++;
    if (habDone(h, d)) a++;
  }
  return { d: a, of: b };
}
function habCard() {
  const L = habOf();
  if (!L.length) return '';
  const d = today(),
    due = L.filter(h => habDue(h, d));
  if (!due.length) return '';
  const nOk = due.filter(h => habDone(h, d)).length;
  let a = 0,
    b = 0;
  L.forEach(h => {
    const q = habQuota(h, 0, 7);
    a += q.d;
    b += q.of;
  });
  const who = (typeof ccCoachName === 'function' && ccCoachName()) || '';
  const rows = due
    .map(h => {
      const au = habAuto(h, d),
        ok = habDone(h, d);
      return (
        '<div class="hb-li"><button class="hb-ck' +
        (ok ? ' on' : '') +
        '" data-act="habTick" data-id="' +
        esc(h.id) +
        '" type="button" aria-pressed="' +
        ok +
        '" aria-label="' +
        esc(habLabel(h)) +
        '"' +
        (VIEW ? ' disabled' : '') +
        '>' +
        (ok ? '✓' : '') +
        '</button><div class="grow"><b>' +
        esc(habLabel(h)) +
        '</b>' +
        (au && au.txt ? '<div class="small muted">' + esc(au.txt) + '</div>' : '') +
        (au && au.f != null && !ok ? '<div class="hb-bar"><i style="width:' + Math.min(100, Math.round(au.f * 100)) + '%"></i></div>' : '') +
        '</div></div>'
      );
    })
    .join('');
  return (
    '<div class="card" id="habcard"><div class="row" style="align-items:baseline"><h2 class="grow" style="margin:0">' +
    $t('Deine Gewohnheiten') +
    '</h2><span class="small muted">' +
    $tf('{a} von {n} heute', { a: nOk, n: due.length }) +
    '</span></div><p class="small muted" style="margin:4px 0 6px">' +
    (who ? $tf('Von {c}.', { c: esc(who) }) + ' ' : $t('Von deinem Coach.') + ' ') +
    $t('Was die App messen kann, hakt sie selbst ab.') +
    '</p>' +
    rows +
    (b ? '<p class="small muted" style="margin:8px 0 0">' + $tf('Letzte 7 Tage: {p} % erledigt', { p: Math.round((a / b) * 100) }) + '</p>' : '') +
    '</div>'
  );
}

/* ---------- Check-in-Fragebogen ---------- */
const CF_TY = () => ({ sc: $t('Skala 1–10'), num: $t('Zahl'), yn: $t('Ja / Nein'), txt: $t('Freitext') });
const CF_STD = () => [
  [$t('Wie war dein Energielevel diese Woche?'), 'sc'],
  [$t('Wie gut hast du geschlafen?'), 'sc'],
  [$t('Wie hoch war dein Stress?'), 'sc'],
  [$t('Wie gut hast du deinen Ernährungsplan umgesetzt?'), 'sc'],
  [$t('Hattest du Schmerzen oder Beschwerden?'), 'yn'],
  [$t('Was lief diese Woche gut?'), 'txt'],
  [$t('Wobei brauchst du Hilfe?'), 'txt']
];
const cfOf = () => {
  const c = S.plan && S.plan.cform;
  return c && Array.isArray(c.q) && c.q.length ? c : null;
};
function cfDue(cf, d) {
  for (let i = 0; i < 7; i++) {
    const x = addDays(d, -i);
    if (dIdx(x) === +(cf.day ?? 6)) return x;
  }
  return d;
}
function cfAnswered(due) {
  for (let x = due, i = 0; x <= today() && i < 8; x = addDays(x, 1), i++) if ((S.daily[x] || {}).cf) return x;
  return null;
}
function cfCard() {
  const cf = cfOf();
  if (!cf || VIEW) return '';
  const due = cfDue(cf, today());
  if (cfAnswered(due)) return '';
  const late = daysBetween(due, today());
  const who = (typeof ccCoachName === 'function' && ccCoachName()) || $t('deinen Coach');
  return (
    '<div class="card"><h2 style="margin:0 0 4px">' +
    $tf('Check-in für {c}', { c: esc(who) }) +
    '</h2><p class="small muted" style="margin:0 0 10px">' +
    (late >= 2 ? $tf('Seit {n} Tagen offen.', { n: late }) + ' ' : '') +
    $tf('{n} Fragen, etwa 2 Minuten.', { n: cf.q.length }) +
    '</p><button class="btn brand" data-act="cfOpen" type="button">' +
    $t('Check-in ausfüllen') +
    '</button></div>'
  );
}
function cfSheet() {
  const cf = cfOf();
  if (!cf) return;
  ui.cfA = ui.cfA || {};
  const A = ui.cfA;
  const q = x => {
    const v = A[x.id];
    let inp = '';
    if (x.ty === 'sc')
      inp =
        '<div class="cf-sc">' +
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          .map(
            n =>
              '<button class="' + (v === n ? 'on' : '') + '" data-act="cfSet" data-id="' + esc(x.id) + '" data-v="' + n + '" type="button">' + n + '</button>'
          )
          .join('') +
        '</div>';
    else if (x.ty === 'yn')
      inp =
        '<div class="cf-sc">' +
        [
          ['ja', $t('Ja')],
          ['nein', $t('Nein')]
        ]
          .map(
            o =>
              '<button class="' +
              (v === o[0] ? 'on' : '') +
              '" data-act="cfSet" data-id="' +
              esc(x.id) +
              '" data-v="' +
              o[0] +
              '" type="button" style="min-width:70px">' +
              esc(o[1]) +
              '</button>'
          )
          .join('') +
        '</div>';
    else if (x.ty === 'num')
      inp = '<input type="number" inputmode="decimal" data-cf="' + esc(x.id) + '" value="' + esc(v == null ? '' : v) + '" style="width:120px">';
    else inp = '<textarea data-cf="' + esc(x.id) + '" rows="3" maxlength="500" style="width:100%">' + esc(v || '') + '</textarea>';
    return '<div class="cf-q"><label>' + esc(x.t) + '</label>' + inp + '</div>';
  };
  openSheet(
    sheetHead($t('Check-in')) +
      '<p class="small muted" style="margin-top:6px">' +
      $t('Deine Antworten sieht nur dein Coach.') +
      '</p>' +
      cf.q.map(q).join('') +
      '<button class="btn brand block" style="margin-top:16px" data-act="cfSave" type="button">' +
      $t('Absenden') +
      '</button>'
  );
}
function cfSave() {
  const cf = cfOf();
  if (!cf) return;
  const A = Object.assign({}, ui.cfA || {});
  document.querySelectorAll('#sheet [data-cf]').forEach(el => {
    const v = el.value.trim();
    if (v !== '') A[el.dataset.cf] = el.type === 'number' ? num(v) : v.slice(0, 500);
  });
  if (!Object.keys(A).length) {
    toast($t('Beantworte mindestens eine Frage.'));
    return;
  }
  const d = today();
  S.daily[d] = S.daily[d] || {};
  const Q = {};
  cf.q.forEach(x => {
    Q[x.id] = [x.t, x.ty];
  });
  S.daily[d].cf = { due: cfDue(cf, d), at: Date.now(), a: A, q: Q };
  ui.cfA = null;
  save();
  closeSheet();
  toast($t('Check-in gesendet'));
  render();
}

/* ---------- Heute ---------- */
hbFilter('viewHeute', 'coachplan', function (h) {
  const c = cfCard() + habCard();
  if (!c) return h;
  const m = h.indexOf('<!--ccb-->');
  if (m >= 0) return h.slice(0, m + 10) + c + h.slice(m + 10);
  const i = hbAt(h, '<div class="stack">', 'coachplan', true);
  return i < 0 ? h : h.slice(0, i + 19) + c + h.slice(i + 19);
});

/* ---------- Kurzfassung für den Coach ---------- */
hbFilter('makeSummary', 'coachplan', function (s) {
  try {
    const L = habOf();
    if (L.length) {
      let a = 0,
        b = 0;
      const list = L.map(h => {
        const q = habQuota(h, 1, 7);
        a += q.d;
        b += q.of;
        return { k: h.kind, n: h.n || null, t: h.kind === 'task' ? String(h.t || '').slice(0, 80) : '', d: q.d, of: q.of };
      });
      s.hab = { p: b ? Math.round((a / b) * 100) : null, of: b, list };
    }
    const cf = cfOf();
    const hist = Object.keys(S.daily)
      .filter(d => S.daily[d] && S.daily[d].cf)
      .sort()
      .slice(-4)
      .reverse()
      .map(d => {
        const c = S.daily[d].cf;
        return {
          d,
          a: Object.keys(c.q || {}).map(id => [
            String(c.q[id][0]).slice(0, 120),
            c.q[id][1],
            typeof c.a[id] === 'string' ? c.a[id].slice(0, 500) : (c.a[id] ?? null)
          ])
        };
      });
    if (cf || hist.length) {
      const due = cf ? cfDue(cf, today()) : null,
        ans = due ? cfAnswered(due) : null;
      s.cf = { due, open: !!(cf && !ans), over: !!(cf && !ans && daysBetween(due, today()) >= 2), hist };
      s.formLast = hist.length ? hist[0].d : null;
    }
  } catch (e) {
    logErr('coachplan:sum', e, 1);
  }
  return s;
});
hbFilter('dashFlags', 'coachplan', function (f, c) {
  const s = c.summary || {};
  const add = (k, t) => {
    f[k] = (f[k] ? f[k] + ', ' : '') + t;
  };
  if (s.cf) {
    const last = s.cf.hist && s.cf.hist[0] && s.cf.hist[0].d;
    if (s.cf.over) add('checkin', $t('Fragebogen überfällig'));
    else if (last && last !== (S.settings.seenCf || {})[c.id]) add('checkin', $t('Fragebogen beantwortet'));
  }
  if (s.hab && s.hab.p != null && s.hab.of >= 5 && s.hab.p < 50) add('warn', $tf('Gewohnheiten {p} %', { p: s.hab.p }));
  return f;
});

/* ---------- Coach: Athletenansicht ---------- */
function cfAnsHTML(cf) {
  const H = cf.hist || [];
  if (!H.length) return '<p class="small muted">' + $t('Noch keine Antworten.') + '</p>';
  const last = H[0];
  const prev = (t, ty) =>
    ty === 'sc' || ty === 'num'
      ? H.slice(1)
          .map(x => (x.a.find(y => y[0] === t) || [])[2])
          .filter(v => v != null && v !== '')
      : [];
  return (
    '<p class="small muted" style="margin:0 0 6px">' +
    $tf('Beantwortet {d}', { d: fmtDay(last.d) }) +
    '</p>' +
    last.a
      .map(([t, ty, v]) => {
        const p = prev(t, ty);
        const val = v == null || v === '' ? '–' : ty === 'yn' ? (v === 'ja' ? $t('Ja') : $t('Nein')) : String(v);
        return (
          '<div class="hb-li" style="align-items:flex-start"><div class="grow"><div class="small muted">' +
          esc(t) +
          '</div><b>' +
          esc(val) +
          '</b>' +
          (p.length ? ' <span class="small muted">· ' + $t('vorher') + ' ' + esc(p.join(', ')) + '</span>' : '') +
          '</div></div>'
        );
      })
      .join('')
  );
}
hbFilter('viewClient', 'coachplan', function (h, uid2) {
  const c = (ADMIN.clients || []).find(x => x.id === uid2);
  const s = (c && c.summary) || {};
  let card = '';
  if (s.cf) {
    const last = s.cf.hist && s.cf.hist[0] && s.cf.hist[0].d;
    const seen = (S.settings.seenCf = S.settings.seenCf || {});
    if (last && seen[uid2] !== last) {
      seen[uid2] = last;
      setTimeout(save, 0);
    }
    card +=
      '<div class="card"><h2>' +
      $t('Check-in-Fragebogen') +
      '</h2>' +
      (s.cf.over ? note('amber', $tf('Fällig seit {d}, noch nicht beantwortet.', { d: fmtDay(s.cf.due) })) : '') +
      cfAnsHTML(s.cf) +
      '</div>';
  }
  if (s.hab && s.hab.list && s.hab.list.length)
    card +=
      '<div class="card"><h2>' +
      $t('Gewohnheiten') +
      '</h2><p class="small muted" style="margin:0 0 6px">' +
      (s.hab.p != null ? $tf('Letzte 7 Tage: {p} % erledigt', { p: s.hab.p }) : $t('Noch keine abgeschlossenen Tage.')) +
      '</p>' +
      s.hab.list
        .map(
          x =>
            '<div class="hb-li"><div class="grow"><b>' +
            esc(habLabel({ kind: x.k, n: x.n, t: x.t })) +
            '</b><div class="hb-bar"><i style="width:' +
            (x.of ? Math.round((x.d / x.of) * 100) : 0) +
            '%"></i></div></div><span class="small">' +
            x.d +
            ' / ' +
            x.of +
            '</span></div>'
        )
        .join('') +
      '</div>';
  if (!card) return h;
  const i = hbAt(h, '<div class="stats">', 'coachplan', true);
  return i < 0 ? h + card : h.slice(0, i) + card + h.slice(i);
});

/* ---------- Coach: Karten im Plan-Editor ---------- */
function habEdCard(p) {
  const L = p.habits || [];
  const days = ui.habDays || [];
  const kinds = HB_KINDS();
  const k = ui.habKind || 'steps';
  const def = (kinds.find(x => x[0] === k) || [])[2];
  return (
    '<div class="card" id="habedit"><h2 style="margin:0 0 4px">' +
    $t('Gewohnheiten und Aufgaben') +
    '</h2><p class="small muted" style="margin:0 0 8px">' +
    $t('Dein Athlet sieht sie täglich auf „Heute“. Schritte, Wasser, Schlaf, Protein und Essen hakt die App selbst ab, wenn Daten da sind.') +
    '</p>' +
    L.map(
      (h, i) =>
        '<div class="hb-li"><div class="grow"><b>' +
        esc(habLabel(h)) +
        '</b><div class="small muted">' +
        esc(habDays(h)) +
        '</div></div><button class="btn sm" data-act="habDel" data-i="' +
        i +
        '" type="button" aria-label="' +
        esc($t('Entfernen')) +
        '">✕</button></div>'
    ).join('') +
    '<div class="fields" style="margin-top:10px"><div class="field"><label for="hab-kind">' +
    $t('Art') +
    '</label><select id="hab-kind" data-act="habKind">' +
    kinds.map(x => '<option value="' + x[0] + '"' + (x[0] === k ? ' selected' : '') + '>' + esc(x[1]) + '</option>').join('') +
    '</select></div>' +
    (def != null
      ? '<div class="field"><label for="hab-n">' +
        $t('Ziel') +
        '</label><input id="hab-n" type="number" inputmode="decimal" step="any" value="' +
        def +
        '" style="width:100px"></div>'
      : '') +
    (k === 'task'
      ? '<div class="field" style="flex:1 1 100%"><label for="hab-t">' +
        $t('Aufgabe') +
        '</label><input id="hab-t" type="text" maxlength="80" placeholder="' +
        esc($t('z. B. 10 Minuten Mobility')) +
        '" style="width:100%"></div>'
      : '') +
    '</div><div class="row" style="gap:4px;margin-top:8px;flex-wrap:wrap">' +
    SH_WD()
      .map((w, i) => '<button class="chip' + (days.includes(i) ? ' on' : '') + '" data-act="habDay" data-v="' + i + '" type="button">' + esc(w) + '</button>')
      .join('') +
    '<span class="small muted" style="align-self:center;margin-left:6px">' +
    (days.length ? '' : $t('keine Auswahl = täglich')) +
    '</span></div><button class="btn sm brand" style="margin-top:10px" data-act="habAdd" type="button">' +
    $t('+ Hinzufügen') +
    '</button></div>'
  );
}
function cfEdCard(p) {
  const cf = p.cform || { day: 6, q: [] };
  const ty = CF_TY();
  return (
    '<div class="card" id="cfedit"><h2 style="margin:0 0 4px">' +
    $t('Check-in-Fragebogen') +
    '</h2><p class="small muted" style="margin:0 0 8px">' +
    $t('Eigene Fragen, die dein Athlet einmal pro Woche beantwortet. Die Antworten siehst du in seiner Ansicht und im Team-Überblick.') +
    '</p><div class="row" style="gap:8px;align-items:center"><span class="small">' +
    $t('Fällig am') +
    '</span><select data-act="cfDay">' +
    SH_WD()
      .map((w, i) => '<option value="' + i + '"' + (+(cf.day ?? 6) === i ? ' selected' : '') + '>' + esc(w) + '</option>')
      .join('') +
    '</select></div>' +
    (cf.q || [])
      .map(
        (x, i) =>
          '<div class="hb-li"><div class="grow"><b>' +
          esc(x.t) +
          '</b><div class="small muted">' +
          esc(ty[x.ty] || '') +
          '</div></div><button class="btn sm" data-act="cfDel" data-i="' +
          i +
          '" type="button" aria-label="' +
          esc($t('Entfernen')) +
          '">✕</button></div>'
      )
      .join('') +
    '<div class="fields" style="margin-top:10px"><div class="field" style="flex:1 1 100%"><label for="cf-t">' +
    $t('Neue Frage') +
    '</label><input id="cf-t" type="text" maxlength="120" style="width:100%"></div><div class="field"><label for="cf-ty">' +
    $t('Antwort') +
    '</label><select id="cf-ty">' +
    Object.keys(ty)
      .map(k => '<option value="' + k + '">' + esc(ty[k]) + '</option>')
      .join('') +
    '</select></div></div><div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn sm brand" data-act="cfAdd" type="button">' +
    $t('+ Frage') +
    '</button>' +
    (cf.q && cf.q.length ? '' : '<button class="btn sm" data-act="cfStd" type="button">' + $t('Standardfragen einfügen') + '</button>') +
    '</div></div>'
  );
}
hbWrap('viewPlan', 'coachplan', function (__next, arg) {
  const h = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  const who = planTarget(arg);
  if (!PE.draft || PE.uid !== who || who === 'me') return h;
  const i = hbAt(h, '<div class="card pe-sess">', 'coachplan', true);
  const c = habEdCard(PE.draft) + cfEdCard(PE.draft);
  return i < 0 ? h : h.slice(0, i) + c + h.slice(i);
});
function cpDirty() {
  PE.dirty = true;
  if (typeof markPeDirty === 'function') markPeDirty();
  render();
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  const D = PE.draft;
  if (a === 'habTick') {
    if (VIEW) return;
    const d = today();
    S.daily[d] = S.daily[d] || {};
    const hb = (S.daily[d].hab = Object.assign({}, S.daily[d].hab || {}));
    if (hb[b.dataset.id]) delete hb[b.dataset.id];
    else hb[b.dataset.id] = 1;
    save();
    render();
  } else if (a === 'cfOpen') cfSheet();
  else if (a === 'cfSet') {
    ui.cfA = ui.cfA || {};
    const v = /^\d+$/.test(b.dataset.v) ? +b.dataset.v : b.dataset.v;
    ui.cfA[b.dataset.id] = v;
    b.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  } else if (a === 'cfSave') cfSave();
  else if (!D) return;
  else if (a === 'habDay') {
    const i = +b.dataset.v;
    ui.habDays = ui.habDays || [];
    ui.habDays = ui.habDays.includes(i) ? ui.habDays.filter(x => x !== i) : ui.habDays.concat(i).sort();
    render();
  } else if (a === 'habAdd') {
    const k = (document.getElementById('hab-kind') || {}).value || 'steps';
    const n = num((document.getElementById('hab-n') || {}).value);
    const t = String((document.getElementById('hab-t') || {}).value || '').trim();
    if (k === 'task' && !t) {
      toast($t('Beschreib die Aufgabe kurz.'));
      return;
    }
    D.habits = (D.habits || []).concat({ id: uid(), kind: k, n: n || null, t: k === 'task' ? t : '', days: (ui.habDays || []).slice() });
    ui.habDays = [];
    cpDirty();
  } else if (a === 'habDel') {
    D.habits = (D.habits || []).filter((x, i) => i !== +b.dataset.i);
    cpDirty();
  } else if (a === 'cfAdd') {
    const t = String((document.getElementById('cf-t') || {}).value || '').trim();
    if (!t) {
      toast($t('Schreib zuerst die Frage.'));
      return;
    }
    const cf = (D.cform = D.cform || { day: 6, q: [] });
    cf.q = (cf.q || []).concat({ id: uid(), t: t.slice(0, 120), ty: (document.getElementById('cf-ty') || {}).value || 'sc' });
    cpDirty();
  } else if (a === 'cfStd') {
    const cf = (D.cform = D.cform || { day: 6, q: [] });
    cf.q = (cf.q || []).concat(CF_STD().map(([t, ty]) => ({ id: uid(), t, ty })));
    cpDirty();
  } else if (a === 'cfDel') {
    const cf = D.cform || { day: 6, q: [] };
    cf.q = (cf.q || []).filter((x, i) => i !== +b.dataset.i);
    D.cform = cf;
    cpDirty();
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (!t || !t.dataset || !PE.draft) return;
  if (t.dataset.act === 'habKind') {
    ui.habKind = t.value;
    render();
  } else if (t.dataset.act === 'cfDay') {
    PE.draft.cform = Object.assign({ q: [] }, PE.draft.cform || {}, { day: +t.value });
    PE.dirty = true;
    if (typeof markPeDirty === 'function') markPeDirty();
  }
});

/* ---------- Vorgaben behalten ---------- */
hbWrap('pushPlan', 'coachplan', async function (__next, uid2, plan) {
  if (plan && typeof uid2 === 'string' && !isTplUid(uid2) && (!plan.habits || !plan.cform)) {
    try {
      const r = await api('/rest/v1/plans?user_id=eq.' + uid2 + '&select=plan');
      const old = r && r[0] && r[0].plan;
      if (old) {
        plan = Object.assign({}, plan);
        if (!plan.habits && old.habits) plan.habits = old.habits;
        if (!plan.cform && old.cform) plan.cform = old.cform;
      }
    } catch (e) {
      logErr('coachplan:keep', e, 1);
    }
  }
  return __next.call(this, uid2, plan);
});
hbWrap('setPlan', 'coachplan', function (__next, plan, fromCoach) {
  const keep = !fromCoach && S.plan ? { habits: S.plan.habits, cform: S.plan.cform } : null;
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  if (keep && S.plan) {
    if (keep.habits && !S.plan.habits) S.plan.habits = keep.habits;
    if (keep.cform && !S.plan.cform) S.plan.cform = keep.cform;
  }
  return r;
});
