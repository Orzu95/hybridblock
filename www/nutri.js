/* Hybridblock – Essen-Seite im neuen Aufbau (Ideen aus OpenNutriTracker, eigener Code):
   ein großer Ring „übrig“, Makro-Karten mit Balken, Wasser- und Gewicht-Chips, ruhige Mahlzeiten-Karten mit einem ＋. */
'use strict';
function bigRing(val, goal, label, sub, over) {
  const C = 2 * Math.PI * 78,
    pct = goal ? Math.max(0, Math.min(1, val / goal)) : 0;
  return (
    '<div class="nr-ring"><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="78" fill="none" stroke="var(--paper)" stroke-width="14"/><circle cx="90" cy="90" r="78" fill="none" stroke="' +
    (over ? 'var(--signal)' : 'var(--ember)') +
    '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' +
    (C * pct).toFixed(1) +
    ' ' +
    C.toFixed(1) +
    '" transform="rotate(-90 90 90)"/></svg>' +
    '<div class="nr-c"><b class="num' +
    (over ? ' t-red' : '') +
    '">' +
    label +
    '</b><span>' +
    sub +
    '</span></div></div>'
  );
}
function macroCard(lab, v, t, color) {
  const p = t ? Math.min(100, (v / t) * 100) : 0,
    over = t && v > t * 1.05;
  return (
    '<div class="nr-m"><div class="nr-ml"><i style="background:' +
    color +
    '"></i>' +
    esc(lab) +
    '</div><div class="meter" style="background:var(--paper)"><i style="width:' +
    p +
    '%;background:' +
    (over ? 'var(--signal)' : color) +
    '"></i></div><div class="nr-mv num">' +
    fmt(v, 0) +
    ' / ' +
    fmt(t, 0) +
    ' g</div></div>'
  );
}
function nrHero(d, tot, tg) {
  const md = S.settings.trackMode || 'full';
  let ring;
  if (md === 'p') {
    const l = tg.p - tot.p;
    ring = bigRing(tot.p, tg.p, l >= 0 ? fmt(l, 0) : '+' + fmt(-l, 0), l >= 0 ? $t('g Protein übrig') : $t('g Protein über dem Ziel'), false);
  } else {
    const l = tg.kcal - tot.kcal;
    ring = bigRing(tot.kcal, tg.kcal, l >= 0 ? fmt(l, 0) : fmt(-l, 0), l >= 0 ? $t('kcal übrig') : $t('kcal über dem Ziel'), l < 0);
  }
  const side =
    md === 'p'
      ? ''
      : '<div class="nr-side"><div><b class="num">' +
        fmt(tot.kcal, 0) +
        '</b><span>' +
        $t('gegessen') +
        '</span></div><div><b class="num">' +
        fmt(tg.kcal, 0) +
        '</b><span>' +
        $t('Ziel') +
        '</span></div></div>';
  const macros =
    md === 'p'
      ? ''
      : '<div class="nr-macros">' +
        macroCard($t('Protein'), tot.p, tg.p, 'var(--plum)') +
        (md === 'full' ? macroCard($t('KH'), tot.c, tg.c, 'var(--sky)') + macroCard($t('Fett'), tot.f, tg.f, 'var(--verdant)') : '') +
        '</div>';
  return '<div class="card nr-hero">' + side + ring + '</div>' + macros;
}
function nrChips(d) {
  const o = S.days[d] || {};
  const ml = num(o.water) || 0,
    goal = num(S.settings.waterGoal) || 3000;
  const w = num(o.weight);
  return (
    '<div class="nr-chips"><div class="nr-chip"><button class="nr-cb" data-act="nrWater" type="button">💧 <b class="num">' +
    fmt(ml / 1000, 1) +
    ' / ' +
    fmt(goal / 1000, 1) +
    ' l</b></button><button class="nr-plus" data-act="water" data-v="250" type="button" aria-label="' +
    esc($t('250 ml dazu')) +
    '">＋</button></div>' +
    '<button class="nr-chip nr-cb" data-act="nrWeight" type="button">⚖ <b class="num">' +
    (w ? fmt(w, 1) + ' kg' : $t('Gewicht')) +
    '</b> ✎</button>' +
    (o.complete === false ? '<button class="nr-chip nr-cb t-amber" data-act="nrWeight" type="button">' + $t('Tag unvollständig') + '</button>' : '') +
    '</div>'
  );
}
function nrMeal__base(m, es) {
  const k = es.reduce((a, e) => a + e.kcal, 0),
    p = es.reduce((a, e) => a + (e.p || 0), 0);
  return (
    '<div class="card nr-meal"><div class="nr-mh"><div class="grow"><b>' +
    esc($t(m)) +
    '</b><div class="small muted num">' +
    (es.length ? fmt(k, 0) + ' kcal · ' + fmt(p, 0) + ' g ' + $t('Protein') : $t('Noch nichts eingetragen')) +
    '</div></div>' +
    '<button class="nr-more" data-act="mealMenu" data-meal="' +
    m +
    '" type="button" aria-label="' +
    esc($t('Mahlzeit-Optionen')) +
    '">⋯</button><button class="nr-add" data-act="add" data-meal="' +
    m +
    '" type="button" aria-label="' +
    esc($tf('Zu {m} hinzufügen', { m: $t(m) })) +
    '">＋</button></div>' +
    es
      .map(
        e =>
          '<div class="entry" data-act="edit" data-uid="' +
          e.uid +
          '"><div class="grow" style="min-width:0"><div class="nm">' +
          esc(entryName(e)) +
          '</div><div class="small muted">' +
          fmt(e.qty) +
          ' ' +
          $t(e.unit) +
          '</div></div><div class="k num">' +
          fmt(e.kcal, 0) +
          ' kcal<small>' +
          fmt(e.p, 0) +
          ' g ' +
          $t('Protein') +
          '</small></div></div>'
      )
      .join('') +
    '</div>'
  );
}
function nrMeal() {
  return hbRun('nrMeal', this, arguments, nrMeal__base);
}
function viewEssen__base() {
  const d = ui.day,
    o = S.days[d] || { entries: [] },
    tot = dayTotals(d),
    tg = currentTargets();
  const hidM = S.settings.hiddenMeals || [];
  const meals = MEALS.filter(m => !hidM.includes(m) || (o.entries || []).some(e => e.meal === m))
    .map(m =>
      nrMeal(
        m,
        (o.entries || []).filter(e => e.meal === m)
      )
    )
    .join('');
  const head =
    '<div class="top"><div class="grow"><h1>' +
    $t('Essen') +
    '</h1><div class="sub">' +
    (d === today() ? $t('Heute') : fmtDay(d)) +
    '</div></div><a class="iconbtn" href="#mehr" aria-label="' +
    esc($t('Einstellungen')) +
    '">' +
    ICON.gear +
    '</a></div>';
  const empty = !(o.entries || []).length;
  return (
    head +
    '<div class="stack">' +
    '<div class="daynav"><button class="iconbtn" data-act="dprev" type="button" aria-label="' +
    esc($t('Vortag')) +
    '">‹</button><div class="grow">' +
    (d === today() ? $t('Heute') : fmtDay(d)) +
    '</div><button class="iconbtn" data-act="dnext" type="button" aria-label="' +
    esc($t('Nächster Tag')) +
    '"' +
    (d >= today() ? ' disabled' : '') +
    '>›</button></div>' +
    (checkinDue()
      ? note(
          'ember',
          $t('<b>Check-in fällig:</b> neues Kalorienziel aus deinem Trend berechnen.'),
          $t('<button class="btn brand sm" data-act="checkin" type="button">Check-in</button>')
        )
      : '') +
    nrHero(d, tot, tg) +
    nrChips(d) +
    '<div class="nr-search"><button class="nr-sf" data-act="add" data-meal="' +
    guessMeal() +
    '" type="button">' +
    ICON.search +
    '<span>' +
    $t('Lebensmittel suchen') +
    '</span></button><button class="nr-scan" data-act="scan" type="button" aria-label="' +
    esc($t('Barcode scannen')) +
    '">' +
    ICON.scan +
    '</button></div>' +
    (empty
      ? '<div class="nr-quick"><button class="chip-btn" data-act="template" type="button">' +
        $t('Meal-Prep-Tag') +
        '</button>' +
        (((S.days[addDays(d, -1)] || {}).entries || []).length
          ? '<button class="chip-btn" data-act="copyYesterday" type="button">' + $t('Gestern übernehmen') + '</button>'
          : '') +
        '</div>'
      : '') +
    (typeof foodUndoNote === 'function' ? foodUndoNote() : '') +
    meals +
    (typeof foodExtras === 'function' ? foodExtras(d) : '') +
    (microRow(d) ? '<details class="card nr-det"><summary><b>' + $t('Nährwerte des Tages') + '</b></summary>' + microRow(d) + '</details>' : '') +
    '</div>'
  );
}
function viewEssen() {
  return hbRun('viewEssen', this, arguments, viewEssen__base);
}
function nrWaterSheet() {
  openSheet(sheetHead($t('Wasser')) + '<div style="margin-top:8px">' + waterCard(ui.day) + '</div>');
}
function nrWeightSheet() {
  const d = ui.day,
    o = S.days[d] || {};
  openSheet(
    sheetHead($t('Gewicht und Tag')) +
      '<div class="on-white" style="margin-top:12px"><div class="field"><label for="wDay">' +
      $t('Gewicht') +
      '</label><input id="wDay" type="number" inputmode="decimal" step="0.1" data-day="' +
      d +
      '" data-f="weight" value="' +
      esc(o.weight) +
      '" placeholder="kg"></div></div>' +
      '<label class="row" style="gap:10px;margin-top:12px"><input type="checkbox" id="complete" data-day="' +
      d +
      '" data-f="complete"' +
      (o.complete === false ? '' : ' checked') +
      '> ' +
      $t('Tag vollständig geloggt') +
      '</label><p class="small muted">' +
      $t('Nur vollständig geloggte Tage fließen in die Bedarfsberechnung. Hast du etwas vergessen, nimm den Haken raus.') +
      '</p>' +
      '<div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="nrDone" type="button">' +
      $t('Fertig') +
      '</button></div>'
  );
}
/* „Als Vorlage speichern“ wandert ins ⋯-Menü der Mahlzeit */
hbFilter('mealMenu', 'nutri', function (__v, m) {
  const r = __v;
  const n = (dayObj(ui.day).entries || []).filter(e => e.meal === m).length;
  const menu = document.querySelector('#sheetCard .menu');
  if (n && menu)
    menu.insertAdjacentHTML(
      'afterbegin',
      '<button class="act-pick" data-act="saveTpl" data-meal="' +
        m +
        '" type="button"><span class="grow">☆ ' +
        $t('Als Vorlage speichern') +
        '<br><span class="small muted" style="font-weight:500">' +
        $t('Diese Mahlzeit später mit einem Tipp eintragen') +
        '</span></span></button>'
    );
  return r;
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'nrWater') nrWaterSheet();
  else if (a === 'nrWeight') nrWeightSheet();
  else if (a === 'nrDone') {
    closeSheet();
    render();
  }
});

/* ---------- Hinzufügen: ＋ für einen Tipp, Tageszeile, Mengen-Chips, Tagesvorschau, Einträge verschieben ---------- */
function lastUse(id) {
  const ds = Object.keys(S.days).sort().reverse();
  for (const d of ds) {
    const e = (S.days[d].entries || [])
      .slice()
      .reverse()
      .find(x => x.food === id);
    if (e) return { q: e.qty, u: e.unit };
  }
  return null;
}
function defaultUse(id) {
  const f = getFood(id);
  if (!f) return null;
  const lu = lastUse(id);
  if (lu) return lu;
  const u = unitsFor(f)[0];
  return { q: u === 'g' ? (f.pieceG && f.src === 'off' ? f.pieceG : 100) : 1, u };
}
function nrDayLine(extra) {
  const tg = currentTargets(),
    t = dayTotals(ui.day);
  const p = S.settings.trackMode === 'p';
  return p
    ? $tf('Tag: {a} / {b} g Protein', { a: fmt(t.p + (extra ? extra.p : 0), 0), b: fmt(tg.p, 0) })
    : $tf('Tag: {a} / {b} kcal', { a: fmt(t.kcal + (extra ? extra.kcal : 0), 0), b: fmt(tg.kcal, 0) }) +
        (extra && extra.kcal ? ' <span class="muted">(' + (extra.kcal >= 0 ? '+' : '') + fmt(extra.kcal, 0) + ')</span>' : '');
}
hbFilter('foodRow', 'nutri', function (__v, f) {
  const h = __v;
  if (!f || f.needsFetch) return h;
  const u = defaultUse(f.id);
  return h.replace(
    '<span class="chev">›</span>',
    '<button class="nr-qadd" data-act="nrQuick" data-id="' +
      esc(f.id) +
      '" type="button" aria-label="' +
      esc($tf('{q} {u} eintragen', { q: fmt(u.q), u: $t(u.u) })) +
      '"><small>' +
      fmt(u.q) +
      ' ' +
      esc($t(u.u)) +
      '</small>＋</button>'
  );
});
hbFilter('addSheet', 'nutri', function (__v) {
  const r = __v;
  const c = document.getElementById('sheetCard');
  const h = c && c.querySelector('.scanbar');
  if (h && !c.querySelector('#nrDay')) h.insertAdjacentHTML('beforebegin', '<div class="nr-dayline" id="nrDay">' + nrDayLine() + '</div>');
  return r;
});
/* Reihenfolge der Reiter: „Zuletzt“ zuerst und Standard, wenn es schon Einträge gibt */
document.addEventListener(
  'click',
  e => {
    const b = e.target.closest('[data-act="add"]');
    if (b && !ui.nrTabSet && (S.recent || []).length) {
      ui.foodTab = 'recent';
      ui.nrTabSet = true;
    }
  },
  true
);
hbWrap('qtySheet', 'nutri', function (__next, id, entry) {
  ui.nrEdit = entry ? entry.uid : null;
  ui.nrId = id;
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  const c = document.getElementById('sheetCard');
  if (!c) return r;
  const f = getFood(id);
  const fields = c.querySelector('.fields');
  if (fields) fields.insertAdjacentHTML('afterend', '<div class="nr-qchips" id="nrChips"></div>');
  nrChipsFill(id);
  if (entry && fields && !c.querySelector('#qm'))
    fields.insertAdjacentHTML(
      'beforeend',
      '<div class="field"><label for="qm">' +
        $t('Mahlzeit') +
        '</label><select id="qm">' +
        MEALS.map(m => '<option value="' + m + '"' + (m === entry.meal ? ' selected' : '') + '>' + esc($t(m)) + '</option>').join('') +
        '</select></div>'
    );
  updatePrev(id);
  return r;
});
function nrChipsFill(id) {
  const el = document.getElementById('nrChips'),
    f = getFood(id);
  if (!el || !f) return;
  const u = ($('#qu') || {}).value || unitsFor(f)[0];
  const lu = lastUse(id);
  const base = u === 'g' || u === 'ml' ? [50, 100, 150, 200, 250] : [0.5, 1, 2, 3];
  const L = lu && lu.u === u && !base.includes(num(lu.q)) ? [num(lu.q)].concat(base) : base;
  el.innerHTML = L.map(
    q =>
      '<button class="chip-btn' +
      (num(($('#qq') || {}).value) === q ? ' on' : '') +
      '" data-act="nrQty" data-v="' +
      q +
      '" type="button">' +
      fmt(q) +
      (lu && lu.u === u && num(lu.q) === q ? ' ↺' : '') +
      '</button>'
  ).join('');
}
hbFilter('updatePrev', 'nutri', function (__v, id) {
  const r = __v;
  const el = $('#qprev'),
    f = getFood(id);
  if (!el || !f) return r;
  const q = num($('#qq') && $('#qq').value) || 0,
    u = $('#qu') && $('#qu').value;
  const m = macrosFor(f, q, u);
  const old = ui.nrEdit ? (dayObj(ui.day).entries || []).find(x => x.uid === ui.nrEdit) || {} : {};
  const ex = { kcal: m.kcal - (old.kcal || 0), p: m.p - (old.p || 0) };
  el.insertAdjacentHTML('beforeend', '<div class="nr-prevday">' + nrDayLine(ex) + '</div>');
  nrChipsFill(id);
  return r;
});
document.addEventListener('input', e => {
  if ((e.target.id === 'qq' || e.target.id === 'qu') && ui.nrId) updatePrev(ui.nrId);
});
document.addEventListener('change', e => {
  if (e.target.id === 'qu' && ui.nrId) updatePrev(ui.nrId);
});
/* Mahlzeit beim Bearbeiten ändern: Wert vor dem Speichern merken, danach setzen */
let NR_MOVE = null;
document.addEventListener(
  'click',
  e => {
    const b = e.target.closest('[data-act="saveEntry"]');
    if (b) {
      const s = $('#qm');
      NR_MOVE = s ? { uid: b.dataset.uid, meal: s.value } : null;
    }
  },
  true
);
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'saveEntry' && NR_MOVE) {
    const en = (dayObj(ui.day).entries || []).find(x => x.uid === NR_MOVE.uid);
    if (en && en.meal !== NR_MOVE.meal) {
      en.meal = NR_MOVE.meal;
      save();
      render();
      toast($tf('Verschoben nach {m}', { m: $t(en.meal) }));
    }
    NR_MOVE = null;
  } else if (a === 'nrQty') {
    const q = $('#qq');
    if (q) {
      q.value = b.dataset.v;
      updatePrev(ui.nrId);
    }
  } else if (a === 'nrQuick') {
    const id = b.dataset.id,
      u = defaultUse(id);
    if (!u) return;
    addEntry(ui.day, id, ui.meal, u.q, u.u);
    const f = getFood(id);
    toast($tf('{n}: {q} {u} → {m}', { n: foodName(f), q: fmt(u.q), u: $t(u.u), m: $t(ui.meal) }));
    b.classList.add('done');
    const d = document.getElementById('nrDay');
    if (d) d.innerHTML = nrDayLine();
    if (route.name === 'essen') {
      const st = window.scrollY;
      render();
      window.scrollTo(0, st);
    }
  }
});

/* ---------- Rückblick Ernährung: Kalender mit Tagesstatus, Trends 7/30/90 Tage ---------- */
function targetOn(d) {
  const cs = S.checkins.filter(c => c.date <= d).sort((a, b) => (a.date < b.date ? -1 : 1));
  const l = cs[cs.length - 1];
  if (l) return { kcal: l.kcal, p: l.p, c: l.c, f: l.f };
  const t = currentTargets();
  return { kcal: t.kcal, p: t.p, c: t.c, f: t.f };
}
function dayStatus(d) {
  const o = S.days[d];
  if (!o || !(o.entries || []).length) return '';
  if (o.complete === false) return 'part';
  const t = dayTotals(d),
    g = targetOn(d);
  if (S.settings.trackMode === 'p') return t.p >= g.p * 0.9 ? 'ok' : 'low';
  const r = t.kcal / Math.max(1, g.kcal);
  return r > 1.1 ? 'high' : r < 0.85 ? 'low' : 'ok';
}
const NH_TXT = { ok: 'im Ziel', low: 'deutlich darunter', high: 'deutlich darüber', part: 'nicht vollständig' };
function nhCalendar() {
  const m = ui.nhMonth || today().slice(0, 7);
  const [y, mo] = m.split('-').map(Number);
  const first = new Date(y, mo - 1, 1),
    days = new Date(y, mo, 0).getDate();
  const off = (first.getDay() + 6) % 7;
  let cells = '';
  for (let i = 0; i < off; i++) cells += '<span></span>';
  for (let i = 1; i <= days; i++) {
    const d = m + '-' + pad(i),
      st = dayStatus(d),
      fut = d > today();
    cells +=
      '<button class="nh-d' +
      (d === today() ? ' today' : '') +
      (fut ? ' fut' : '') +
      '" data-act="nhDay" data-d="' +
      d +
      '" type="button"' +
      (fut ? ' disabled' : '') +
      '>' +
      i +
      '<i class="nh-dot ' +
      st +
      '"></i></button>';
  }
  const prev = new Date(y, mo - 2, 1),
    next = new Date(y, mo, 1);
  const ym = x => x.getFullYear() + '-' + pad(x.getMonth() + 1);
  return (
    '<div class="card"><div class="row" style="align-items:center"><button class="iconbtn" data-act="nhMon" data-v="' +
    ym(prev) +
    '" type="button" aria-label="' +
    esc($t('Voriger Monat')) +
    '">‹</button><h2 class="grow" style="margin:0;text-align:center">' +
    esc(first.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })) +
    '</h2><button class="iconbtn" data-act="nhMon" data-v="' +
    ym(next) +
    '" type="button"' +
    (ym(next) > today().slice(0, 7) ? ' disabled' : '') +
    ' aria-label="' +
    esc($t('Nächster Monat')) +
    '">›</button></div>' +
    '<div class="nh-cal">' +
    WD_SHORT_MO()
      .map(w => '<b>' + esc(w) + '</b>')
      .join('') +
    cells +
    '</div>' +
    '<div class="nh-leg small">' +
    ['ok', 'low', 'high', 'part'].map(k => '<span><i class="nh-dot ' + k + '"></i>' + esc($t(NH_TXT[k])) + '</span>').join('') +
    '</div></div>'
  );
}
function nhTrends() {
  const n = ui.nhWin || 7;
  const pts = [];
  let sum = { kcal: 0, p: 0, c: 0, f: 0, tk: 0, tp: 0, tc: 0, tf: 0, w: 0, wn: 0 },
    k = 0;
  for (let i = n - 1; i >= 0; i--) {
    const d = addDays(today(), -i),
      o = S.days[d] || {},
      ok = (o.entries || []).length && o.complete !== false,
      t = ok ? dayTotals(d) : null,
      g = targetOn(d);
    pts.push({ d, kcal: t ? Math.round(t.kcal) : null, tg: g.kcal });
    if (t) {
      k++;
      sum.kcal += t.kcal;
      sum.p += t.p;
      sum.c += t.c;
      sum.f += t.f;
      sum.tk += g.kcal;
      sum.tp += g.p;
      sum.tc += g.c;
      sum.tf += g.f;
    }
    if (num(o.water)) {
      sum.w += num(o.water);
      sum.wn++;
    }
  }
  const av = x => (k ? x / k : 0);
  const md = S.settings.trackMode || 'full';
  const bar = (lab, v, t, color) =>
    '<div style="margin-top:10px"><div class="row small" style="justify-content:space-between"><b>' +
    esc(lab) +
    '</b><span class="num">' +
    fmt(v, 0) +
    ' / ' +
    fmt(t, 0) +
    (lab === 'kcal' ? '' : ' g') +
    '</span></div><div class="meter" style="background:var(--paper);margin-top:4px"><i style="width:' +
    Math.min(100, t ? (v / t) * 100 : 0) +
    '%;background:' +
    color +
    '"></i></div></div>';
  return (
    '<div class="card"><div class="row" style="align-items:center"><h2 class="grow" style="margin:0">' +
    $t('Trends') +
    '</h2></div><div class="seg" style="margin:10px 0 0">' +
    [7, 30, 90]
      .map(x => '<button class="' + (n === x ? 'on' : '') + '" data-act="nhWin" data-v="' + x + '" type="button">' + $tf('{n} Tage', { n: x }) + '</button>')
      .join('') +
    '</div>' +
    '<p class="small muted" style="margin-top:8px">' +
    $tf('{k} von {n} Tagen vollständig geloggt', { k, n }) +
    '</p>' +
    (md !== 'p' && pts.some(p => p.kcal != null)
      ? lineChart(
          'nh-k',
          pts,
          [
            { key: 'kcal', label: $t('kcal'), color: 'var(--ember)', bars: true },
            { key: 'tg', label: $t('Ziel'), color: 'var(--graphite)' }
          ],
          { unit: 'kcal', dec: 0, zero: true, height: 180 }
        )
      : '') +
    (k
      ? '<h3 style="margin-top:14px">' +
        $t('Ø pro Tag') +
        '</h3>' +
        (md !== 'p' ? bar('kcal', av(sum.kcal), av(sum.tk), 'var(--ember)') : '') +
        bar($t('Protein'), av(sum.p), av(sum.tp), 'var(--plum)') +
        (md === 'full' ? bar($t('KH'), av(sum.c), av(sum.tc), 'var(--sky)') + bar($t('Fett'), av(sum.f), av(sum.tf), 'var(--verdant)') : '')
      : '') +
    (sum.wn
      ? '<p class="small" style="margin-top:12px">💧 ' + $tf('Ø {l} l Wasser an {n} Tagen', { l: fmt(sum.w / sum.wn / 1000, 1), n: sum.wn }) + '</p>'
      : '') +
    '</div>'
  );
}
function viewNutriHist() {
  return (
    '<a href="#essen" class="back">' +
    ICON.back +
    $t('Essen') +
    '</a>' +
    pageTop($t('Rückblick'), '', $t('Kalender und Trends deiner Ernährung')) +
    '<div class="stack">' +
    nhCalendar() +
    nhTrends() +
    '</div>'
  );
}
hbFilter('viewEssen', 'nutri', function (__v) {
  const h = __v;
  return h.replace(
    '<a class="iconbtn" href="#mehr"',
    '<a class="iconbtn" href="#ernaehrung" aria-label="' + esc($t('Rückblick')) + '">' + NH_ICON + '</a><a class="iconbtn" href="#mehr"'
  );
});
const NH_ICON =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'nhMon') {
    ui.nhMonth = b.dataset.v;
    render();
  } else if (a === 'nhWin') {
    ui.nhWin = +b.dataset.v;
    render();
  } else if (a === 'nhDay') {
    ui.day = b.dataset.d;
    location.hash = '#essen';
  }
});
