/* Hybridblock – Makros selbst einstellen (Athlet unter „Essen“ / Einstellungen, Coach im Plan-Editor)
   Drei Regler für Protein, Fett und Kohlenhydrate. Das Kalorienziel bleibt (Athlet: aus Check-in/Coach, Coach: frei).
   Ausgleich wählbar: ein Makro gleicht automatisch aus, oder „selbst“ – dann zeigt die App die Differenz
   und schlägt vor, wo gekürzt bzw. erhöht werden muss. Fett nie unter dem Mindestwert (fat_min, ERN-109). */
'use strict';
const MS = { o: null };
const M_COL = { p: 'var(--iris)', f: 'var(--sunset)', c: 'var(--verdant)' };
const M_KC = { p: 4, f: 9, c: 4 };
const M_LAB = () => ({ p: $t('Protein'), f: $t('Fett'), c: $t('Kohlenhydrate') });
function msKg() {
  const o = MS.o;
  if (o && o.kg) return o.kg;
  const ser = series();
  return ser.length ? ser[ser.length - 1].trend : num(S.settings.startWeight) || null;
}
const msSum = o => 4 * o.p + 9 * o.f + 4 * o.c;
function msRange(k) {
  const o = MS.o,
    kg = msKg();
  if (k === 'f') return [fatFloor(o.kcal), Math.max(fatFloor(o.kcal) + 10, Math.round((o.kcal * 0.6) / 9))];
  if (k === 'p') return [Math.max(30, Math.round((kg || 70) * 0.8)), Math.max(150, Math.round((kg || 70) * 3.3))];
  return [0, Math.max(50, Math.round(o.kcal / 4))];
}
/* Rest-Makro neu berechnen, wenn Ausgleich automatisch */
function msBalance(changed) {
  const o = MS.o;
  const r = o.rest;
  if (r === 'none' || r === changed) return;
  const others = ['p', 'f', 'c'].filter(k => k !== r);
  const left = o.kcal - others.reduce((a, k) => a + M_KC[k] * o[k], 0);
  const [lo, hi] = msRange(r);
  o[r] = Math.min(hi, Math.max(lo, Math.round(left / M_KC[r])));
}
function msRing(o) {
  const tot = Math.max(1, msSum(o));
  const R = 52,
    C = 2 * Math.PI * R;
  let off = 0;
  const seg = ['p', 'c', 'f']
    .map(k => {
      const len = ((M_KC[k] * o[k]) / tot) * C;
      const s =
        '<circle r="' +
        R +
        '" cx="64" cy="64" fill="none" stroke="' +
        M_COL[k] +
        '" stroke-width="12" stroke-dasharray="' +
        Math.max(0, len - 2).toFixed(1) +
        ' ' +
        C.toFixed(1) +
        '" stroke-dashoffset="' +
        (-off).toFixed(1) +
        '" transform="rotate(-90 64 64)"/>';
      off += len;
      return s;
    })
    .join('');
  const pct = Math.round((msSum(o) / o.kcal) * 100);
  return (
    '<div class="ms-ring"><svg viewBox="0 0 128 128" width="150" height="150" aria-hidden="true"><circle r="' +
    R +
    '" cx="64" cy="64" fill="none" stroke="var(--rule)" stroke-width="12"/>' +
    seg +
    '</svg><div class="ms-rc"><b class="num">' +
    fmt(msSum(o), 0) +
    '</b><span class="num">/ ' +
    fmt(o.kcal, 0) +
    ' ' +
    $t('kcal') +
    '</span><small class="' +
    (Math.abs(pct - 100) <= 1 ? 'ms-ok' : 'ms-off') +
    '">' +
    pct +
    ' %</small></div></div>'
  );
}
function msRow(k) {
  const o = MS.o,
    L = M_LAB(),
    [lo, hi] = msRange(k),
    kg = msKg();
  const auto = o.rest === k;
  const sug = o.sug && o.sug[k] != null ? o.sug[k] : null;
  const dv = sug != null ? o[k] - sug : 0;
  const pct = Math.round(((M_KC[k] * o[k]) / Math.max(1, msSum(o))) * 100);
  return (
    '<div class="ms-row' +
    (auto ? ' auto' : '') +
    '"><div class="row" style="align-items:center;gap:8px;flex-wrap:nowrap"><i class="ms-dot" style="background:' +
    M_COL[k] +
    '"></i><div class="grow"><b>' +
    esc(L[k]) +
    '</b><small class="muted">' +
    pct +
    ' %' +
    (kg ? ' · ' + fmt(o[k] / kg, 1) + ' ' + $t('g/kg') : '') +
    (sug != null ? ' · ' + esc($t('Vorschlag')) + ' ' + sug + ' ' + $t('g') + (dv ? ' (' + (dv > 0 ? '+' : '−') + Math.abs(dv) + ')' : '') : '') +
    (auto ? ' · ' + esc($t('gleicht aus')) : '') +
    '</small></div><button class="iconbtn sm" data-act="msStep" data-k="' +
    k +
    '" data-d="-5" type="button" aria-label="' +
    esc($tf('{m} weniger', { m: L[k] })) +
    '">−</button><input class="ms-in num" type="number" inputmode="numeric" data-msk="' +
    k +
    '" value="' +
    o[k] +
    '" aria-label="' +
    esc(L[k] + ' (g)') +
    '"><span class="small muted">' + $t('g') + '</span><button class="iconbtn sm" data-act="msStep" data-k="' +
    k +
    '" data-d="5" type="button" aria-label="' +
    esc($tf('{m} mehr', { m: L[k] })) +
    '">+</button></div><input class="ms-sl" type="range" min="' +
    lo +
    '" max="' +
    hi +
    '" step="1" value="' +
    Math.min(hi, Math.max(lo, o[k])) +
    '" data-msr="' +
    k +
    '" style="--c:' +
    M_COL[k] +
    '" aria-label="' +
    esc(L[k]) +
    '"></div>'
  );
}
/* Status und Vorschläge zum Ausgleich */
function msStatus() {
  const o = MS.o,
    L = M_LAB();
  const diff = msSum(o) - o.kcal;
  const notes = [];
  const kg = msKg();
  if (kg && o.p < 1.6 * kg) notes.push($tf('Protein unter 1,6 g/kg: für Muskelerhalt und -aufbau eher knapp.', {}));
  if ((o.f * 9) / o.kcal > 0.4) notes.push($t('Fett über 40 % der Kalorien: dann bleibt wenig Platz für Kohlenhydrate rund ums Training.'));
  if (o.f <= fatFloor(o.kcal)) notes.push($tf('Fett ist am Minimum ({g} g, 20 % der Kalorien). Weniger empfiehlt die Wissensbank nicht.', { g: fatFloor(o.kcal) }));
  let st;
  if (Math.abs(diff) <= 25) st = '<div class="ms-st ok">✓ ' + esc($t('Passt zum Kalorienziel')) + '</div>';
  else {
    const fix = ['c', 'f', 'p']
      .filter(k => k !== o.last)
      .map(k => {
        const g = Math.round(diff / M_KC[k]);
        const nv = o[k] - g;
        const [lo, hi] = msRange(k);
        if (nv < lo || nv > hi) return '';
        return (
          '<button class="chip-btn" data-act="msFix" data-k="' +
          k +
          '" data-g="' +
          -g +
          '" type="button">' +
          esc(L[k]) +
          ' ' +
          (g > 0 ? '−' : '+') +
          Math.abs(g) +
          ' ' +
          $t('g') +
          '</button>'
        );
      })
      .join('');
    st =
      '<div class="ms-st off">' +
      esc(diff > 0 ? $tf('{n} kcal über dem Ziel', { n: fmt(diff, 0) }) : $tf('{n} kcal unter dem Ziel', { n: fmt(-diff, 0) })) +
      '<small>' +
      esc(diff > 0 ? $t('Woanders kürzen, damit es passt:') : $t('Woanders erhöhen, damit es passt:')) +
      '</small>' +
      (fix ? '<div class="row" style="gap:6px;flex-wrap:wrap;justify-content:center;margin-top:6px">' + fix + '</div>' : '') +
      '</div>';
  }
  return st + (notes.length ? '<ul class="ms-notes">' + notes.map(n => '<li>' + esc(n) + '</li>').join('') + '</ul>' : '');
}
function msBody() {
  const o = MS.o,
    L = M_LAB();
  const kcalCtl =
    o.mode === 'pe'
      ? '<div class="row" style="justify-content:center;gap:8px;align-items:center"><button class="iconbtn" data-act="msKcal" data-d="-50" type="button" aria-label="' +
        esc($t('50 kcal weniger')) +
        '">−</button><input class="ms-in num" style="width:90px" type="number" inputmode="numeric" data-msk="kcal" value="' +
        o.kcal +
        '"><span class="small muted">' + $t('kcal') + '</span><button class="iconbtn" data-act="msKcal" data-d="50" type="button" aria-label="' +
        esc($t('50 kcal mehr')) +
        '">+</button></div>'
      : '<p class="small muted" style="text-align:center;margin:0">' +
        esc($tf('Kalorienziel {k} kcal bleibt. Es kommt aus deinem Check-in bzw. von deinem Coach.', { k: fmt(o.kcal, 0) })) +
        '</p>';
  const rest =
    '<div class="ms-rest"><span class="small muted">' +
    $t('Ausgleich über') +
    '</span>' +
    [
      ['c', L.c],
      ['f', L.f],
      ['p', L.p],
      ['none', $t('selbst')]
    ]
      .map(([k, l]) => '<button class="chip-btn' + (o.rest === k ? ' on' : '') + '" data-act="msRest" data-v="' + k + '" type="button">' + esc(l) + '</button>')
      .join('') +
    '</div>';
  const ok = Math.abs(msSum(o) - o.kcal) <= 25;
  return (
    kcalCtl +
    msRing(o) +
    '<div class="ms-leg">' +
    ['f', 'c', 'p'].map(k => '<span><i class="ms-dot" style="background:' + M_COL[k] + '"></i>' + esc(L[k]) + ' ' + Math.round(((M_KC[k] * o[k]) / Math.max(1, msSum(o))) * 100) + ' %</span>').join('') +
    '</div><div id="ms-st">' +
    msStatus() +
    '</div>' +
    rest +
    ['p', 'f', 'c'].map(msRow).join('') +
    '<div class="row" style="gap:8px;margin-top:14px">' +
    (o.sug ? '<button class="btn fog" data-act="msReset" type="button">' + $t('Vorschlag der App') + '</button>' : '') +
    '<div class="grow"></div><button class="btn brand" data-act="msSave" type="button"' +
    (ok ? '' : ' disabled') +
    '>' +
    $t('Übernehmen') +
    '</button></div>' +
    (ok ? '' : '<p class="small muted" style="text-align:right;margin:6px 0 0">' + esc($t('Erst übernehmen, wenn die Summe zum Kalorienziel passt.')) + '</p>')
  );
}
function msOpen(mode) {
  let o;
  if (mode === 'pe') {
    const tg = (PE.draft && PE.draft.targets) || {};
    const c = (ADMIN.clients || []).find(x => x.id === PE.uid);
    const s = (c && c.summary) || {};
    const kcal = num(tg.kcal) || num(s.kcalT) || 2400;
    const p = num(tg.protein) || num(s.protT) || 160;
    const f = Math.max(fatFloor(kcal), num(tg.fat) || Math.round((kcal * 0.28) / 9));
    o = { mode, kcal, p, f, c: Math.max(0, Math.round((kcal - 4 * p - 9 * f) / 4)), rest: (tg.macro && tg.macro.rest) || 'c', kg: s.trend || null };
    if (tg.macro) ['p', 'f', 'c'].forEach(k => num(tg.macro[k]) != null && (o[k] = num(tg.macro[k])));
  } else {
    const t = currentTargets();
    MACRO_RAW = 1;
    let sg;
    try {
      sg = currentTargets();
    } finally {
      MACRO_RAW = 0;
    }
    const m = S.settings.macro;
    o = { mode: 'me', kcal: t.kcal, p: t.p, f: t.f, c: t.c, rest: (m && m.rest) || 'c', sug: { p: sg.p, f: sg.f, c: sg.c } };
  }
  MS.o = o;
  msBalance(null);
  openSheet(sheetHead($t('Makros einstellen')) + '<div id="ms-body" class="ms">' + msBody() + '</div>');
}
function msRedraw(keepFocus) {
  const el = document.getElementById('ms-body');
  if (!el) return;
  const a = document.activeElement,
    k = a && a.dataset && (a.dataset.msk || a.dataset.msr),
    isR = a && a.dataset && a.dataset.msr;
  el.innerHTML = msBody();
  if (keepFocus && k) {
    const n = el.querySelector(isR ? '[data-msr="' + k + '"]' : '[data-msk="' + k + '"]');
    if (n) n.focus();
  }
}
function msSet(k, v, live) {
  const o = MS.o;
  if (!o) return;
  if (k === 'kcal') {
    o.kcal = Math.max(1200, Math.min(6000, Math.round(v)));
    msBalance(null);
  } else {
    const [lo, hi] = msRange(k);
    o[k] = Math.min(hi, Math.max(lo, Math.round(v)));
    o.last = k;
    msBalance(k);
  }
  if (live) {
    /* Regler ziehen: nur Zahlen, Ring und Status neu, damit der Regler greifbar bleibt */
    const el = document.getElementById('ms-body');
    if (!el) return;
    ['p', 'f', 'c'].forEach(x => {
      const i = el.querySelector('[data-msk="' + x + '"]');
      if (i && document.activeElement !== i) i.value = o[x];
      const r = el.querySelector('[data-msr="' + x + '"]');
      if (r && document.activeElement !== r) r.value = o[x];
    });
    const ring = el.querySelector('.ms-ring');
    if (ring) ring.outerHTML = msRing(o);
    const st = document.getElementById('ms-st');
    if (st) st.innerHTML = msStatus();
    const sv = el.querySelector('[data-act="msSave"]');
    if (sv) sv.disabled = Math.abs(msSum(o) - o.kcal) > 25;
  } else msRedraw(true);
}
function msSave() {
  const o = MS.o;
  if (!o || Math.abs(msSum(o) - o.kcal) > 25) return;
  const rest = o.rest === 'none' ? 'c' : o.rest;
  const m = { p: o.p, f: o.f, c: o.c, rest, at: new Date().toISOString() };
  if (o.mode === 'pe') {
    PE.draft.targets = Object.assign({}, PE.draft.targets || {}, { kcal: o.kcal, protein: o.p, fat: o.f, macro: m });
    PE.dirty = true;
    closeSheet();
    render();
    toast($t('Makros im Plan gesetzt. Speichern nicht vergessen.'));
    return;
  }
  S.settings.macro = m;
  save();
  closeSheet();
  render();
  toast($t('Deine Makros sind gespeichert'));
}
function msReset() {
  if (MS.o && MS.o.mode === 'me') {
    delete S.settings.macro;
    save();
    closeSheet();
    render();
    toast($t('Wieder der Vorschlag der App'));
  }
}

/* ---------- Einstiege ---------- */
hbFilter('viewEssen', 'macro', function (h) {
  if (VIEW || S.settings.trackMode === 'p') return h;
  const own = S.settings.macro;
  const b =
    '<div class="row ms-entry"><button class="linkbtn" data-act="msOpen" type="button">' +
    $t('Makros anpassen') +
    '</button>' +
    (own ? '<span class="small muted">' + esc(own.by === 'coach' ? $t('Aufteilung von deinem Coach') : $t('eigene Aufteilung aktiv')) + '</span>' : '') +
    '</div>';
  const i = h.indexOf('<div class="nr-chips">');
  return i < 0 ? h : h.slice(0, i) + b + h.slice(i);
});
hbFilter('viewPlan', 'macro', function (h) {
  if (!PE.draft || !PE.draft.targets) return h;
  const m = PE.draft.targets.macro;
  const card =
    '<div class="card"><div class="row" style="align-items:center;gap:10px"><div class="grow"><b>' +
    $t('Makro-Aufteilung') +
    '</b><div class="small muted">' +
    (m
      ? esc($tf('Protein {p} g · Fett {f} g · Kohlenhydrate {c} g, Ausgleich über {r}', { p: m.p, f: m.f, c: m.c, r: M_LAB()[m.rest] }))
      : esc($t('Mit Reglern Protein, Fett und Kohlenhydrate verteilen. Die App zeigt, ob die Summe zum Kalorienziel passt.'))) +
    '</div></div><button class="btn sm" data-act="msOpenPe" type="button">' +
    $t('Regler öffnen') +
    '</button></div></div>';
  const i = h.indexOf('<div class="row pe-save">');
  return i < 0 ? h : h.slice(0, i) + card + h.slice(i);
});
/* Einstellungen: Hinweis unter dem Ernährungsblock */
hbFilter('makeSummary', 'macro', function (s) {
  if (S.settings.macro) s.macroOwn = S.settings.macro.by === 'coach' ? 'coach' : 'own';
  return s;
});
/* Coach sieht, wenn der Athlet selbst umverteilt hat */
hbFilter('viewClient', 'macro', function (h, uid2) {
  const c = (ADMIN.clients || []).find(x => x.id === uid2);
  const s = (c && c.summary) || {};
  if (s.macroOwn !== 'own') return h;
  const n = note('sky', esc($t('Hat die Makros selbst angepasst (gleiches Kalorienziel). Neue Vorgabe im Plan setzt sie zurück.')));
  const i = h.indexOf('<div class="stats">');
  return i < 0 ? h : h.slice(0, i) + n + h.slice(i);
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'msOpen') msOpen('me');
  else if (a === 'msOpenPe') msOpen('pe');
  else if (a === 'msStep') msSet(b.dataset.k, MS.o[b.dataset.k] + num(b.dataset.d));
  else if (a === 'msKcal') msSet('kcal', MS.o.kcal + num(b.dataset.d));
  else if (a === 'msRest') {
    MS.o.rest = b.dataset.v;
    msBalance(null);
    msRedraw();
  } else if (a === 'msFix') {
    const k = b.dataset.k;
    const prev = MS.o.rest;
    MS.o.rest = 'none';
    msSet(k, MS.o[k] + num(b.dataset.g));
    MS.o.rest = prev;
    msRedraw();
  } else if (a === 'msSave') msSave();
  else if (a === 'msReset') msReset();
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset && t.dataset.msr) msSet(t.dataset.msr, num(t.value), true);
  else if (t.dataset && t.dataset.pt && PE.draft && PE.draft.targets && PE.draft.targets.macro && (t.dataset.pt === 'protein' || t.dataset.pt === 'fat' || t.dataset.pt === 'kcal'))
    delete PE.draft.targets.macro;
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset && t.dataset.msk && num(t.value) != null) msSet(t.dataset.msk, num(t.value));
  else if (t.dataset && t.dataset.msr) msRedraw();
});
