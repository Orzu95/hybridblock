/* Hybridblock – Desktop D7 (Teil 2), ab 1200 px, nur eigene Athleten-Seiten:
   1) Training: Wochenplaner über 2–4 Wochen. Offene Einheiten lassen sich innerhalb ihrer Woche auf einen anderen Tag ziehen
      (setzt den festen Tag `pin`, den die Wochenplanung schon kennt); rechts Summen pro Woche.
   2) Essen: „Tag kopieren“ – Mahlzeiten dieses Tages auf einen anderen Tag kopieren oder von einem anderen Tag übernehmen.
   3) Verlauf: Gewicht, Bedarf, Kraft und Schlaf als 2×2-Raster, rechts die Studienlage zu diesen Werten. */
'use strict';
const d7bOk = () => !!(D7_MQ.matches && route && !(typeof VIEW !== 'undefined' && VIEW));

/* ---------- 1) Wochenplaner ---------- */
const d7pN = () => Math.max(2, Math.min(4, +(S.settings.d7wk || 2)));
function d7pWeek(w, prev) {
  const cw = curWeek();
  if (w <= cw || !prev) {
    const pl = wkPlan(w);
    return { w, A: pl.A, end: pl.end, last: pl.last, items: pl.items.filter(o => o.date) };
  }
  const P = wkPattern();
  const A = addDays(prev.last > prev.end ? prev.last : prev.end, 1);
  const items = P.seq.map(k => {
    const s = peekSess(w, k),
      pr = sessProgress(w, k),
      ideal = addDays(A, P.off[k]);
    const d = (s && s.pin) || ideal;
    return { k, ideal, date: d, moved: d !== ideal, st: pr.done ? (pr.skipped ? 'skipped' : 'done') : 'open' };
  });
  const ds = items.map(o => o.date),
    end = addDays(A, 6);
  const mx = ds.length ? ds.reduce((a, b) => (a > b ? a : b)) : end;
  return { w, A, end, last: mx > end ? mx : end, items };
}
function d7pSum(w, items) {
  let sets = 0,
    done = 0,
    cardio = 0,
    hard = 0;
  items.forEach(o => {
    if (o.st === 'done') done++;
    if (isCardio(o.k)) cardio++;
    else planFor(w, o.k).forEach(p => (sets += p.om ? 0 : p.sets || 0));
    if (isHiit(o.k) || wkLeg(w, o.k)) hard++;
  });
  return { n: items.length, done, sets, cardio, hard };
}
function d7pChip(w, o) {
  const free = (o.st === 'open' || o.st === 'part' || o.st === 'today') && w >= curWeek();
  const cls = o.st === 'done' ? ' ok' : o.st === 'skipped' || o.st === 'merged' ? ' off' : '';
  return (
    '<a class="d7p-u' +
    cls +
    (o.moved ? ' mv' : '') +
    '" href="#training/' +
    sKey(w, o.k) +
    '"' +
    (free ? ' draggable="true" data-d7w="' + w + '" data-d7k="' + esc(o.k) + '"' : '') +
    ' title="' +
    esc(SESS[o.k].title + (o.moved ? ' · ' + $t('verschoben') : '')) +
    '">' +
    badge(o.k) +
    '<span>' +
    esc(SESS[o.k].title) +
    '</span></a>'
  );
}
function d7Planner() {
  if (!ORDER.length) return '';
  const n = d7pN(),
    w0 = ui.week || curWeek(),
    t = today();
  const rows = [];
  let prev = null;
  for (let w = w0; w <= Math.min(NW(), w0 + n - 1); w++) {
    prev = d7pWeek(w, prev);
    rows.push(prev);
  }
  const html = rows
    .map(r => {
      const sm = d7pSum(r.w, r.items),
        cells = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(r.A, i);
        const its = r.items.filter(o => o.date === d || (i === 6 && o.date > d));
        const acts = S.activities.filter(a => a.date === d && !a.countsAs);
        const can = d >= t && r.w >= curWeek();
        cells.push(
          '<div class="d7p-c' +
            (d === t ? ' now' : '') +
            (can ? ' drop' : '') +
            '" data-d7d="' +
            d +
            '" data-d7w="' +
            r.w +
            '"><small>' +
            WD[parseISO(d).getDay()] +
            ' ' +
            fmtDay(d).replace(/^\D+/, '') +
            '</small>' +
            its.map(o => d7pChip(r.w, o)).join('') +
            acts
              .map(a => '<span class="d7p-a">' + esc(a.title || (ACT_MAP[a.type] || { name: a.type }).name) + '</span>')
              .join('') +
            '</div>'
        );
      }
      const pins = ORDER.some(k => {
        const s = peekSess(r.w, k);
        return s && s.pin && !s.apptId && !(s.logs && Object.keys(s.logs).length);
      });
      return (
        '<div class="d7p-row"><div class="d7p-h"><b>' +
        $t('Woche ') +
        r.w +
        '</b><small><i class="ph-' +
        phase(r.w) +
        '"></i>' +
        esc(PH_LABEL[phase(r.w)]) +
        '</small></div>' +
        cells.join('') +
        '<div class="d7p-s"><div>' +
        $tf('{n} erledigt', { n: '<b>' + sm.done + '/' + sm.n + '</b>' }) +
        '</div><div>' +
        $tf('{n} Sätze geplant', { n: '<b>' + sm.sets + '</b>' }) +
        '</div><div>' +
        $tf('{n} Ausdauer', { n: '<b>' + sm.cardio + '</b>' }) +
        '</div><div>' +
        $tf('{n} harte Tage', { n: '<b>' + sm.hard + '</b>' }) +
        '</div>' +
        (pins ? '<button class="btn sm fog" data-act="d7pReset" data-w="' + r.w + '" type="button">' + $t('Zurücksetzen') + '</button>' : '') +
        '</div></div>'
      );
    })
    .join('');
  return (
    '<div class="card d7p"><div class="row" style="margin-bottom:10px;gap:6px"><h2 class="grow" style="margin:0">' +
    $t('Wochenplaner') +
    '</h2>' +
    [2, 3, 4]
      .map(x => '<button class="btn sm ' + (x === n ? 'dark' : 'fog') + '" data-act="d7pN" data-v="' + x + '" type="button">' + $tf('{n} Wochen', { n: x }) + '</button>')
      .join('') +
    '</div><p class="small muted" style="margin:0 0 10px">' +
    $t('Offene Einheiten per Ziehen auf einen anderen Tag derselben Woche legen. Die Woche plant die übrigen Einheiten danach neu.') +
    '</p><div class="d7p-head"><span></span>' +
    [1, 2, 3, 4, 5, 6, 7].map(i => '<span>' + $t('Tag') + ' ' + i + '</span>').join('') +
    '<span>' +
    $t('Summe') +
    '</span></div>' +
    html +
    '</div>'
  );
}
let d7Drag = null;
document.addEventListener('dragstart', e => {
  const c = e.target.closest && e.target.closest('[data-d7k]');
  if (!c) return;
  d7Drag = { w: +c.dataset.d7w, k: c.dataset.d7k };
  try {
    e.dataTransfer.setData('text/plain', c.dataset.d7k);
    e.dataTransfer.effectAllowed = 'move';
  } catch (er) {}
  c.classList.add('d7p-drag');
});
document.addEventListener('dragend', () => {
  d7Drag = null;
  document.querySelectorAll('.d7p-drag,.d7p-over').forEach(x => x.classList.remove('d7p-drag', 'd7p-over'));
});
const d7pCell = e => {
  const c = e.target.closest && e.target.closest('.d7p-c.drop');
  return c && d7Drag && +c.dataset.d7w === d7Drag.w ? c : null;
};
document.addEventListener('dragover', e => {
  if (!d7Drag) return;
  document.querySelectorAll('.d7p-over').forEach(x => x.classList.remove('d7p-over'));
  const c = d7pCell(e);
  if (!c) return;
  e.preventDefault();
  c.classList.add('d7p-over');
});
function d7pMove(w, k, d) {
  const s = sess(w, k);
  if (s.pin === d) return false;
  s.pin = d;
  save();
  return true;
}
document.addEventListener('drop', e => {
  if (!d7Drag) return;
  const c = d7pCell(e),
    g = d7Drag;
  d7Drag = null;
  if (!c) return;
  e.preventDefault();
  if (d7pMove(g.w, g.k, c.dataset.d7d)) {
    toast($tf('{s} liegt jetzt auf {d}', { s: SESS[g.k].title, d: fmtDay(c.dataset.d7d) }));
    render();
  }
});

/* ---------- 2) Tag kopieren ---------- */
function d7CopySheet() {
  const d = ui.day,
    es = (S.days[d] || {}).entries || [];
  const ms = MEALS.concat([...new Set(es.map(x => x.meal))].filter(m => m && !MEALS.includes(m))).filter(m => es.some(x => x.meal === m));
  openSheet(
    sheetHead($t('Tag kopieren')) +
      (es.length
        ? '<h3 style="margin:12px 0 6px">' +
          $tf('Mahlzeiten von {d} kopieren nach', { d: fmtDay(d) }) +
          '</h3><div class="fields on-white"><div class="field"><label for="d7c-to">' +
          $t('Zieltag') +
          '</label><input id="d7c-to" type="date" value="' +
          addDays(d, 1) +
          '"></div></div><div class="row" style="flex-wrap:wrap;gap:8px;margin-top:8px">' +
          ms
            .map(
              m =>
                '<label class="chip" style="text-decoration:none;color:var(--graphite)"><input type="checkbox" data-d7m="' +
                esc(m) +
                '" checked> ' +
                esc($t(m)) +
                ' (' +
                es.filter(x => x.meal === m).length +
                ')</label>'
            )
            .join('') +
          '</div><div class="row" style="margin-top:10px"><div class="grow"></div><button class="btn brand" data-act="d7cTo" type="button">' +
          $t('Kopieren') +
          '</button></div>'
        : '') +
      '<h3 style="margin:18px 0 6px">' +
      $tf('Einträge eines anderen Tages auf {d} übernehmen', { d: fmtDay(d) }) +
      '</h3><div class="fields on-white"><div class="field"><label for="d7c-from">' +
      $t('Quelltag') +
      '</label><input id="d7c-from" type="date" value="' +
      addDays(d, -1) +
      '"></div></div><div class="row" style="margin-top:10px"><div class="grow"></div><button class="btn fog" data-act="d7cFrom" type="button">' +
      $t('Übernehmen') +
      '</button></div><p class="small muted" style="margin-top:10px">' +
      $t('Kopierte Einträge kommen dazu, vorhandene bleiben stehen.') +
      '</p>'
  );
}
function d7Copy(from, to, meals) {
  const es = ((S.days[from] || {}).entries || []).filter(x => !meals || meals.includes(x.meal));
  es.forEach(x => {
    if (getFood(x.food)) addEntry(to, x.food, x.meal, x.qty, x.unit);
  });
  return es.length;
}

/* ---------- 3) Verlauf als 2×2-Raster mit Studienlage ---------- */
const D7V = [
  ['Gewicht', ['loss_rate', 'bf_err']],
  ['Bedarf und Aufnahme', ['tdee_adapt', 'watch_kcal']],
  ['Kraft (geschätztes 1RM)', ['e1rm_maxreps', 'stall']],
  ['Schlaf', ['sleep_tst', 'readiness']]
];
function d7Verlauf() {
  const st = document.querySelector('#view>.stack');
  if (!st || st.querySelector(':scope>.d7v')) return;
  const cards = [...st.children].filter(c => c.matches('.card') && c.querySelector(':scope>h2'));
  const found = D7V.map(([h, ids]) => ({ c: cards.find(c => c.querySelector(':scope>h2').textContent.trim() === $t(h)), h, ids })).filter(x => x.c);
  if (found.length < 3) return;
  const g = document.createElement('div');
  g.className = 'd7v';
  const grid = document.createElement('div');
  grid.className = 'd7v-g';
  found.forEach(x => grid.appendChild(x.c));
  const side = document.createElement('div');
  side.className = 'd7v-s card';
  const ids = [].concat(...found.map(x => x.ids)).filter(id => typeof RULES !== 'undefined' && RULES[id] && ruleFor(id));
  side.innerHTML =
    '<h2>' +
    esc($t('Studienlage zu diesen Werten')) +
    '</h2><p class="small muted">' +
    esc($t('Womit die App bei Gewicht, Bedarf, Kraft und Schlaf rechnet, mit Evidenzgrad und Einträgen der Wissensbank.')) +
    '</p>' +
    ids.map(ruleRow).join('') +
    '<div style="margin-top:12px"><button class="btn sm" data-act="rulesOpen" type="button">' +
    esc($t('Alle Regeln der App')) +
    '</button></div>';
  g.appendChild(grid);
  g.appendChild(side);
  const stats = st.querySelector(':scope>.stats');
  let ref = stats ? stats.nextElementSibling : st.firstChild;
  while (ref && ref.matches && ref.matches('.note,[class*="pace"]')) ref = ref.nextElementSibling;
  st.insertBefore(g, ref);
  document.body.classList.add('dk-v');
}

/* ---------- Einhängen ---------- */
hbWrap('render', 'd7b', function (__next) {
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  queueMicrotask(() => {
    try {
      document.body.classList.remove('dk-v');
      if (!d7bOk()) return;
      if (route.name === 'training' && !route.arg) {
        const st = document.querySelector('#view>.stack');
        if (st && !st.querySelector('.d7p')) {
          const x = document.createElement('div');
          x.innerHTML = d7Planner();
          if (x.firstElementChild) st.insertBefore(x.firstElementChild, st.firstChild);
        }
      } else if (route.name === 'essen') {
        const L = document.querySelector('.d7-essen>.d7-l');
        const nav = L && L.querySelector('.daynav');
        if (nav && !L.querySelector('[data-act="d7cOpen"]')) {
          const b = document.createElement('div');
          b.className = 'row d7c-bar';
          b.innerHTML = '<button class="btn sm fog" data-act="d7cOpen" type="button">' + esc($t('Tag kopieren')) + '</button>';
          nav.insertAdjacentElement('afterend', b);
        }
      } else if (route.name === 'verlauf') d7Verlauf();
    } catch (e) {
      logErr('d7b', e);
    }
  });
  return r;
});
if (D7_MQ.addEventListener)
  D7_MQ.addEventListener('change', () => {
    if (route && route.name === 'verlauf') render();
  });
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-act^="d7"]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'd7pN') {
    S.settings.d7wk = +b.dataset.v;
    save();
    render();
  } else if (a === 'd7pReset') {
    const w = +b.dataset.w;
    ORDER.forEach(k => {
      const s = peekSess(w, k);
      if (s && s.pin && !s.apptId && !(s.logs && Object.keys(s.logs).length)) delete s.pin;
    });
    save();
    toast($t('Woche wieder nach Muster geplant'));
    render();
  } else if (a === 'd7cOpen') d7CopySheet();
  else if (a === 'd7cTo') {
    const to = ($('#d7c-to') || {}).value;
    const ms = [...document.querySelectorAll('[data-d7m]')].filter(x => x.checked).map(x => x.dataset.d7m);
    if (!to || !ms.length) return toast($t('Zieltag und mindestens eine Mahlzeit wählen'), 'soft');
    if (to === ui.day) return toast($t('Wähle einen anderen Tag'), 'soft');
    const n = d7Copy(ui.day, to, ms);
    closeSheet();
    render();
    toast($tf('{n} Einträge nach {d} kopiert', { n, d: fmtDay(to) }));
  } else if (a === 'd7cFrom') {
    const fr = ($('#d7c-from') || {}).value;
    if (!fr || fr === ui.day) return toast($t('Wähle einen anderen Tag'), 'soft');
    const n = d7Copy(fr, ui.day, null);
    closeSheet();
    render();
    toast(n ? $tf('{n} Einträge übernommen', { n }) : $t('An diesem Tag ist nichts eingetragen'), n ? undefined : 'soft');
  }
});
