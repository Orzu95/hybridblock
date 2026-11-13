/* Hybridblock – Coach steuert das Verschieben (Plan-Felder shift und fix).
   shift: 'auto' (App verschiebt still, Standard), 'inform' (App verschiebt, Coach sieht es im Dashboard), 'coach' (App verschiebt nicht, Coach entscheidet).
   fix: { Einheit: Wochentag 0–6 (Mo = 0) } – feste Tage, z. B. für Präsenztraining; die App legt die Einheit dort hin und verschiebt sie nicht. */
'use strict';
const shMode = () => (S.plan && S.plan.shift) || 'auto';
const shHold = () => !!(typeof hasCoach === 'function' && hasCoach() && shMode() === 'coach');
function shFix(k, A, w) {
  const mv = S.plan && S.plan.move && S.plan.move[sKey(w, k)];
  if (mv) return mv;
  const f = S.plan && S.plan.fix;
  if (!f || f[k] == null || f[k] === '') return null;
  for (let i = 0; i < 7; i++) {
    const d = addDays(A, i);
    if (dIdx(d) === +f[k]) return d;
  }
  return null;
}
const SH_MODES = () => [
  ['auto', $t('App entscheidet'), $t('Die App verschiebt offene Einheiten nach den Regeln, ohne Meldung.')],
  ['inform', $t('App entscheidet, du wirst informiert'), $t('Die App verschiebt wie gewohnt, du siehst im Team-Überblick, was verschoben wurde.')],
  ['coach', $t('Du entscheidest'), $t('Die App verschiebt nichts. Offene Einheiten bleiben stehen, du siehst sie im Team-Überblick und planst selbst um.')]
];
const SH_WD = () => [$t('Mo'), $t('Di'), $t('Mi'), $t('Do'), $t('Fr'), $t('Sa'), $t('So')];

/* Athlet: Hinweis statt „Woche wird knapp“, wenn der Coach entscheidet */
const _wkDecisionCardSH = wkDecisionCard;
wkDecisionCard = function (w) {
  if (!shHold()) return _wkDecisionCardSH.apply(this, arguments);
  if (w !== curWeek()) return '';
  const pl = wkPlan(w);
  const late = pl.items.filter(o => wkOpen(o) && (o.date < today() || o.date > pl.end)).length;
  return note(
    'sky',
    '<b>' +
      $t('Dein Coach plant Verschiebungen.') +
      '</b> ' +
      (late
        ? late === 1
          ? $t('1 Einheit ist offen geblieben. Dein Coach sieht das und plant sie neu ein.')
          : $tf('{n} Einheiten sind offen geblieben. Dein Coach sieht das und plant sie neu ein.', { n: late })
        : $t('Die App verschiebt deine Einheiten nicht selbst. Fällt eine aus, sag deinem Coach Bescheid.'))
  );
};

/* Kurzfassung für den Coach: verschobene und überfällige Einheiten dieser Woche */
hbFilter('makeSummary', 'shift', function (__v) {
  const s = __v;
  try {
    if (ORDER.length && shMode() !== 'auto') {
      const w = curWeek(),
        pl = wkPlan(w);
      s.moved = pl.items.filter(o => o.moved && wkOpen(o)).length;
      const late = pl.items.filter(o => wkOpen(o) && (o.date < today() || o.date > pl.end));
      s.late = late.length;
      s.lateList = late.map(o => ({ key: sKey(w, o.k), k: o.k, d: o.date }));
      s.shift = shMode();
    }
  } catch (e) {
    console.warn('shift', e);
  }
  return s;
});
hbFilter('dashFlags', 'shift', function (__v, c) {
  const f = __v;
  const s = c.summary || {};
  if (s.shift === 'inform' && s.moved)
    f.warn = (f.warn ? f.warn + ', ' : '') + (s.moved === 1 ? $t('1 Einheit verschoben') : $tf('{n} Einheiten verschoben', { n: s.moved }));
  if (s.shift === 'coach' && s.late) f.plan = s.late === 1 ? $t('1 Einheit zum Umplanen') : $tf('{n} Einheiten zum Umplanen', { n: s.late });
  return f;
});

/* Coach: Karte im Plan-Editor des Athleten */
function shLate() {
  const c = (ADMIN.clients || []).find(x => x.id === PE.uid);
  const s = (c && c.summary) || {};
  return s.shift === 'coach' ? s.lateList || [] : [];
}
function shCard(p) {
  const m = p.shift || 'auto',
    fx = p.fix || {},
    mv = p.move || {};
  const late = shLate();
  const lateH = late.length
    ? '<p class="small" style="margin:12px 0 0"><b>' +
      $t('Zum Umplanen') +
      '</b></p>' +
      late
        .map(o => {
          const s = (p.sessions || []).find(x => x.k === o.k) || {};
          return (
            '<div class="row" style="align-items:center;gap:8px;margin-top:6px"><span class="badge ' +
            (s.kind || 'gym') +
            ' sm">' +
            esc(o.k) +
            '</span><span class="grow small">' +
            esc(s.title || $t('Einheit')) +
            '<br><span class="muted">' +
            $tf('geplant {d}', { d: fmtDay(o.d) }) +
            '</span></span><input type="date" data-shmove="' +
            esc(o.key) +
            '" value="' +
            esc(mv[o.key] || '') +
            '" min="' +
            today() +
            '" style="width:150px;flex:none" aria-label="' +
            esc($t('Neuer Tag')) +
            '"></div>'
          );
        })
        .join('')
    : '';
  const opts = SH_MODES()
    .map(
      ([v, l, d]) =>
        '<label class="sh-opt' +
        (m === v ? ' on' : '') +
        '"><input type="radio" name="sh-mode" data-act="shMode" data-v="' +
        v +
        '"' +
        (m === v ? ' checked' : '') +
        '><span><b>' +
        esc(l) +
        '</b><small class="muted">' +
        esc(d) +
        '</small></span></label>'
    )
    .join('');
  const rows = (p.sessions || [])
    .map(
      s =>
        '<div class="row" style="align-items:center;gap:8px;margin-top:6px"><span class="badge ' +
        s.kind +
        ' sm">' +
        esc(s.k) +
        '</span><span class="grow small">' +
        esc(s.title || $t('Einheit')) +
        '</span><select data-shfix="' +
        esc(s.k) +
        '" aria-label="' +
        esc($t('Fester Tag')) +
        '"><option value="">' +
        $t('flexibel') +
        '</option>' +
        SH_WD()
          .map(
            (d, i) => '<option value="' + i + '"' + (fx[s.k] !== undefined && fx[s.k] !== '' && +fx[s.k] === i ? ' selected' : '') + '>' + esc(d) + '</option>'
          )
          .join('') +
        '</select></div>'
    )
    .join('');
  return (
    '<div class="card" id="shcard"><h2 style="margin:0 0 4px">' +
    $t('Verschieben') +
    '</h2><p class="small muted" style="margin:0 0 8px">' +
    $t('Was passiert, wenn eine Einheit ausfällt?') +
    '</p><div class="sh-opts">' +
    opts +
    '</div>' +
    lateH +
    '<p class="small" style="margin:12px 0 0"><b>' +
    $t('Feste Tage') +
    '</b></p><p class="small muted" style="margin:2px 0 0">' +
    $t('Einheiten mit festem Tag bleiben dort, z. B. für gemeinsames Training.') +
    '</p>' +
    rows +
    '</div>'
  );
}
const _viewPlanSH = viewPlan;
viewPlan = function (arg) {
  const h = _viewPlanSH.apply(this, arguments);
  const who = planTarget(arg);
  if (!PE.draft || PE.uid !== who || who === 'me' || (typeof isTplUid === 'function' && isTplUid(who))) return h;
  const i = h.indexOf('<div class="card pe-sess">');
  return i < 0 ? h : h.slice(0, i) + shCard(PE.draft) + h.slice(i);
};
function shDirty() {
  PE.dirty = true;
  if (typeof markPeDirty === 'function') markPeDirty();
}
document.addEventListener('change', e => {
  const t = e.target;
  if (!PE.draft) return;
  if (t.dataset && t.dataset.act === 'shMode') {
    PE.draft.shift = t.dataset.v;
    shDirty();
    document.querySelectorAll('#shcard .sh-opt').forEach(l => l.classList.toggle('on', l.contains(t)));
  } else if (t.dataset && t.dataset.shmove) {
    const mv = (PE.draft.move = PE.draft.move || {});
    if (t.value) mv[t.dataset.shmove] = t.value;
    else delete mv[t.dataset.shmove];
    shDirty();
  } else if (t.dataset && t.dataset.shfix) {
    const f = (PE.draft.fix = PE.draft.fix || {});
    if (t.value === '') delete f[t.dataset.shfix];
    else f[t.dataset.shfix] = +t.value;
    shDirty();
  }
});
