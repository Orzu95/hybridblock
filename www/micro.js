/* Hybridblock – Mikronährstoffe mit Referenzbalken und Kalorienziel pro Mahlzeit
   Mikros: Kalium, Calcium, Magnesium, Eisen, Vitamin D, Vitamin B12 (Salz gibt es schon).
   Werte kommen aus Open Food Facts (pro 100 g, in g geliefert) und werden je Eintrag gespeichert.
   Referenzwerte: DGE/ÖGE/SGE-Referenzwerte für Erwachsene (Stand 2024/2025), als Orientierung, keine Diagnose. */
'use strict';
const MICRO = [
  { k: 'k', n: 'Kalium', u: 'mg', f: 1000, ref: () => 4000 },
  { k: 'ca', n: 'Calcium', u: 'mg', f: 1000, ref: () => 1000 },
  { k: 'mg', n: 'Magnesium', u: 'mg', f: 1000, ref: () => S.settings.sex === 'w' ? 300 : 350 },
  { k: 'fe', n: 'Eisen', u: 'mg', f: 1000, ref: () => S.settings.sex === 'w' && !(num(S.settings.age) >= 51) ? 16 : 11 },
  { k: 'vd', n: 'Vitamin D', u: 'µg', f: 1e6, ref: () => 20 },
  { k: 'b12', n: 'Vitamin B12', u: 'µg', f: 1e6, ref: () => 4 }];
const OFF_MICRO = { k: 'potassium_100g', ca: 'calcium_100g', mg: 'magnesium_100g', fe: 'iron_100g', vd: 'vitamin-d_100g', b12: 'vitamin-b12_100g' };
const _offMapMI = offMap;
offMap = function (p) { const r = _offMapMI.apply(this, arguments); if (!r) return r; const n = (p && p.nutriments) || {}; MICRO.forEach(m => { const v = num(n[OFF_MICRO[m.k]]); if (v != null && v >= 0) r[m.k] = Math.round(v * m.f * 100) / 100; }); return r; };
const _macrosForMI = macrosFor;
macrosFor = function (f, qty, unit) { const m = _macrosForMI.apply(this, arguments); if (!f || !f.kcal || !m.kcal) return m; const r = m.kcal / f.kcal; MICRO.forEach(x => { if (f[x.k] != null) m[x.k] = f[x.k] * r; }); return m; };
function microDay(d) { const o = S.days[d] || {}; const es = o.entries || []; const t = {}; MICRO.forEach(x => { t[x.k] = { v: 0, cov: 0 }; }); es.forEach(e => MICRO.forEach(x => { if (e[x.k] != null) { t[x.k].v += e[x.k]; t[x.k].cov++; } })); return { t, n: es.length }; }
function microPanel(d) { const m = microDay(d); if (!m.n) return ''; const any = MICRO.some(x => m.t[x.k].cov);
  const rows = MICRO.map(x => { const r = x.ref(), v = m.t[x.k].v, c = m.t[x.k].cov, p = Math.min(100, v / r * 100);
    return '<div class="mi-r"><div class="row small" style="justify-content:space-between"><b>' + esc($t(x.n)) + '</b><span class="num">' + (c ? fmt(v, v < 10 ? 1 : 0) : '–') + ' / ' + fmt(r) + ' ' + x.u + '</span></div><div class="meter" style="background:var(--paper);margin-top:4px"><i style="width:' + (c ? p : 0) + '%;background:' + (p >= 100 ? 'var(--verdant)' : 'var(--sky)') + '"></i></div>' +
      (c && c < m.n ? '<div class="src">' + $tf('aus {c} von {n} Einträgen', { c, n: m.n }) + '</div>' : '') + '</div>'; }).join('');
  return '<div class="mi"><h3 style="margin:14px 0 4px">' + $t('Vitamine und Mineralstoffe') + '</h3>' + (any ? rows : '<p class="small muted">' + $t('Für deine heutigen Lebensmittel liegen noch keine Angaben vor. Gescannte Produkte liefern sie oft mit.') + '</p>') +
    '<p class="src" style="margin-top:8px">' + $t('Referenzwerte für Erwachsene (DGE). Sie gelten als Durchschnitt über mehrere Tage, nicht pro Tag. Nur Lebensmittel mit Angaben zählen.') + '</p></div>'; }
const _microRowMI = microRow;
microRow = function (d) { const h = _microRowMI.apply(this, arguments); return h ? h + microPanel(d) : h; };

/* ---------- Kalorienziel pro Mahlzeit ---------- */
const MEAL_SPLITS = { std: ['Standard', { 'Frühstück': 25, 'Mittag': 35, 'Snack': 10, 'Abend': 30 }], even: ['Gleichmäßig', { 'Frühstück': 25, 'Mittag': 25, 'Snack': 25, 'Abend': 25 }], two: ['Zwei Hauptmahlzeiten', { 'Frühstück': 0, 'Mittag': 50, 'Snack': 0, 'Abend': 50 }], big: ['Großes Abendessen', { 'Frühstück': 20, 'Mittag': 30, 'Snack': 10, 'Abend': 40 }], off: ['Aus', null] };
function mealSplit() { const st = S.settings; const key = st.mealSplitKey || 'std'; if (key === 'off') return null; const sp = key === 'own' ? (st.mealSplit || MEAL_SPLITS.std[1]) : MEAL_SPLITS[key] ? MEAL_SPLITS[key][1] : MEAL_SPLITS.std[1];
  const hid = st.hiddenMeals || []; const vis = MEALS.filter(m => !hid.includes(m)); const sum = vis.reduce((a, m) => a + (sp[m] || 0), 0); if (!sum) return null; const out = {}; vis.forEach(m => { out[m] = (sp[m] || 0) / sum; }); return out; }
function mealTarget(m) { const sp = mealSplit(); if (!sp || sp[m] == null) return null; const tg = currentTargets(); return S.settings.trackMode === 'p' ? { p: tg.p * sp[m] } : { kcal: tg.kcal * sp[m], p: tg.p * sp[m] }; }
const _nrMealMI = nrMeal;
nrMeal = function (m, es) { const h = _nrMealMI.apply(this, arguments); const t = mealTarget(m); if (!t || ui.day !== today() && !es.length) return h;
  const k = es.reduce((a, e) => a + e.kcal, 0), p = es.reduce((a, e) => a + (e.p || 0), 0); const pOnly = S.settings.trackMode === 'p'; const v = pOnly ? p : k, g = pOnly ? t.p : t.kcal; if (!g) return h;
  const pct = Math.min(100, v / g * 100), over = v > g * 1.15;
  const line = '<div class="mt-line"><div class="meter" style="background:var(--paper)"><i style="width:' + pct + '%;background:' + (over ? 'var(--signal)' : 'var(--ember)') + '"></i></div><span class="small muted num">' + fmt(v, 0) + ' / ' + fmt(g, 0) + (pOnly ? ' g' : ' kcal') + '</span></div>';
  const j = h.indexOf('</button></div>', h.indexOf('nr-add')); return j < 0 ? h : h.slice(0, j + 15) + line + h.slice(j + 15); };
function splitSheet() { const st = S.settings, key = st.mealSplitKey || 'std', own = st.mealSplit || MEAL_SPLITS.std[1];
  openSheet(sheetHead($t('Kalorien pro Mahlzeit')) + '<p class="small muted" style="margin-top:6px">' + $t('Verteilt dein Tagesziel auf die Mahlzeiten. Das ist nur eine Orientierung; für das Ergebnis zählt der ganze Tag.') + '</p>' +
    '<div class="seg" style="flex-wrap:wrap">' + Object.keys(MEAL_SPLITS).concat('own').map(k => '<button class="' + (key === k ? 'on' : '') + '" data-act="splitKey" data-v="' + k + '" type="button">' + esc($t(k === 'own' ? 'Eigene' : MEAL_SPLITS[k][0])) + '</button>').join('') + '</div>' +
    (key === 'own' ? '<div class="fields on-white" style="margin-top:8px">' + MEALS.map(m => '<div class="field"><label for="sp-' + m + '">' + esc($t(m)) + ' (%)</label><input id="sp-' + m + '" type="number" inputmode="numeric" min="0" max="100" data-split="' + m + '" value="' + esc(own[m] ?? 0) + '"></div>').join('') + '</div><p class="small muted">' + $t('Die Prozente werden automatisch auf 100 % umgerechnet.') + '</p>' : '') +
    '<div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="splitDone" type="button">' + $t('Fertig') + '</button></div>'); }
const _mealMenuMI = mealMenu;
mealMenu = function (m) { const r = _mealMenuMI.apply(this, arguments); const menu = document.querySelector('#sheetCard .menu'); if (menu) menu.insertAdjacentHTML('beforeend', '<button class="act-pick" data-act="splitOpen" type="button"><span class="grow">' + $t('Kalorien pro Mahlzeit') + '<br><span class="small muted" style="font-weight:500">' + esc($t((MEAL_SPLITS[S.settings.mealSplitKey || 'std'] || ['Eigene'])[0])) + '</span></span></button>'); return r; };
document.addEventListener('input', e => { const m = e.target.dataset && e.target.dataset.split; if (!m) return; S.settings.mealSplit = Object.assign({}, S.settings.mealSplit || MEAL_SPLITS.std[1]); S.settings.mealSplit[m] = Math.max(0, num(e.target.value) || 0); save(); });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'splitOpen') splitSheet(); else if (a === 'splitKey') { S.settings.mealSplitKey = b.dataset.v; save(); splitSheet(); } else if (a === 'splitDone') { closeSheet(); render(); } });
