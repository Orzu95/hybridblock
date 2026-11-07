/* Hybridblock – Satztypen pro Satz: Drop-Set, Myo-Reps, Teilwiederholungen in der Dehnung, links/rechts getrennt.
   Tippen auf die Satznummer öffnet die Auswahl. Gespeichert am Satz: st, drops [{w,r}], myo [r], lp, rl/rr. */
'use strict';
const ST_TYPES = { '': ['Normal', ''], drop: ['Drop-Set', 'D'], myo: ['Myo-Reps', 'M'], lp: ['Teilwiederholungen in der Dehnung', 'T'], lr: ['Links und rechts getrennt', 'L/R'] };
function stSummary(v) { if (!v || !v.st) return ''; const f = x => x == null || x === '' ? '–' : fmt(num(x));
  if (v.st === 'drop') { const d = (v.drops || []).filter(x => x && (x.w || x.r)); return $t('Drop-Set') + (d.length ? ': ' + d.map(x => f(x.w) + ' × ' + f(x.r)).join(' → ') : ''); }
  if (v.st === 'myo') { const m = (v.myo || []).filter(x => x !== '' && x != null); return $t('Myo-Reps') + (m.length ? ': ' + m.map(f).join(' + ') : ''); }
  if (v.st === 'lp') return v.lp ? $tf('+{n} Teilwiederholungen in der Dehnung', { n: f(v.lp) }) : $t('Teilwiederholungen in der Dehnung');
  if (v.st === 'lr') return $t('L') + ' ' + f(v.rl) + ' / ' + $t('R') + ' ' + f(v.rr); return ''; }
const _setRowsST = setRows;
setRows = function (prefix, spec, raw, sugg, showRpe, tgt, isCarry, dataAttrs) { const h = _setRowsST.apply(this, arguments); const parts = h.split(/(?=<div class="set(?: done)?">)/); let i = -1;
  return parts.map(p => { if (!/^<div class="set(?: done)?">/.test(p)) return p; i++; const v = raw[i] || {}, T = ST_TYPES[v.st || ''] || ST_TYPES[''];
    p = p.replace('<span class="n">' + (i + 1) + '</span>', '<button class="n stbtn' + (v.st ? ' on' : '') + '" type="button" data-act="setType" ' + dataAttrs + ' data-i="' + i + '" aria-label="' + esc($tf('Satz {n}: Art wählen', { n: i + 1 })) + '">' + (i + 1) + (T[1] ? '<small>' + T[1] + '</small>' : '') + '</button>');
    const sum = stSummary(v); if (!sum) return p; const k = p.indexOf('</button></div>', p.indexOf('data-act="done"')); if (k < 0) return p; const e = k + 15; return p.slice(0, e) + '<div class="setx small">' + esc(sum) + '</div>' + p.slice(e); }).join(''); };
/* Satz-Objekt zum Knopf finden */
function stSet(c, create) { if (c.aid) { const a = findAct(c.aid); const ex = a && a.exercises && a.exercises[c.idx]; if (!ex) return null; if (create) ex.sets[c.i] = ex.sets[c.i] || {}; return ex.sets[c.i]; }
  const s = sess(c.w, c.k); const spec = planFor(c.w, c.k).find(p => p.slot === c.slot); const lg = s.logs[c.slot] || (create ? (s.logs[c.slot] = { ex: spec ? actualEx(c.w, c.k, spec) : '', sets: [] }) : null); if (!lg) return null;
  if (create) for (let j = 0; j <= c.i; j++) lg.sets[j] = lg.sets[j] || {}; return lg.sets[c.i] || null; }
function stCtxFrom(b) { const i = +b.dataset.i; if (b.dataset.aid) return { aid: b.dataset.aid, idx: +b.dataset.idx, i }; const m = String(route.arg || '').match(RE_SESS); if (!m) return null; return { w: +m[1], k: m[2], slot: b.dataset.slot, i }; }
function stSheet(c, type) { const v = stSet(c, false) || {}; type = type != null ? type : (v.st || ''); ui.stCtx = c; ui.stType = type;
  const inp = (id, val, ph, mode) => '<input id="' + id + '" type="number" inputmode="' + (mode || 'decimal') + '" step="any" value="' + esc(val == null ? '' : val) + '" placeholder="' + esc(ph) + '">';
  let f = '';
  if (type === 'drop') f = '<p class="small muted">' + $t('Direkt nach dem Satz Gewicht reduzieren und ohne Pause weitermachen.') + '</p>' + [0, 1, 2].map(j => { const d = (v.drops || [])[j] || {}; return '<div class="row" style="gap:8px;margin-top:8px"><span class="small" style="width:70px">' + $tf('Drop {n}', { n: j + 1 }) + '</span>' + inp('st-d' + j + 'w', d.w, $t('kg')) + inp('st-d' + j + 'r', d.r, $t('Reps'), 'numeric') + '</div>'; }).join('');
  else if (type === 'myo') f = '<p class="small muted">' + $t('Nach dem Aktivierungssatz kurze Mini-Sätze mit 3–5 Atemzügen Pause, gleiches Gewicht.') + '</p><div class="row" style="gap:8px;margin-top:8px">' + [0, 1, 2, 3].map(j => inp('st-m' + j, (v.myo || [])[j], '+' + (j + 1), 'numeric')).join('') + '</div>';
  else if (type === 'lp') f = '<p class="small muted">' + $t('Nach dem letzten vollen Wiederholung noch Teilwiederholungen in der gedehnten Position.') + '</p><div class="field" style="margin-top:8px"><label for="st-lp">' + $t('Teilwiederholungen') + '</label>' + inp('st-lp', v.lp, '4–6', 'numeric') + '</div>';
  else if (type === 'lr') f = '<p class="small muted">' + $t('Wiederholungen pro Seite. Für Fortschritt und Verlauf zählt die schwächere Seite.') + '</p><div class="row" style="gap:8px;margin-top:8px"><div class="field grow"><label for="st-l">' + $t('Links') + '</label>' + inp('st-l', v.rl, $t('Reps'), 'numeric') + '</div><div class="field grow"><label for="st-rr">' + $t('Rechts') + '</label>' + inp('st-rr', v.rr, $t('Reps'), 'numeric') + '</div></div>';
  openSheet(sheetHead($tf('Satz {n}: Art', { n: c.i + 1 })) + '<div class="seg" style="flex-wrap:wrap">' + Object.keys(ST_TYPES).map(k => '<button class="' + (k === type ? 'on' : '') + '" data-act="stType" data-v="' + k + '" type="button">' + esc($t(ST_TYPES[k][0])) + '</button>').join('') + '</div>' +
    '<div class="on-white">' + f + '</div><div class="row" style="margin-top:14px"><div class="grow"></div><button class="btn brand" data-act="stSave" type="button">' + $t('Übernehmen') + '</button></div>'); }
function stSave() { const c = ui.stCtx; if (!c) return; const v = stSet(c, true); if (!v) return; const t = ui.stType || '', val = id => { const e = document.getElementById(id); return e && e.value !== '' ? e.value : null; };
  ['drops', 'myo', 'lp', 'rl', 'rr'].forEach(k => delete v[k]); if (t) v.st = t; else delete v.st;
  if (t === 'drop') v.drops = [0, 1, 2].map(j => ({ w: val('st-d' + j + 'w'), r: val('st-d' + j + 'r') })).filter(x => x.w || x.r);
  if (t === 'myo') v.myo = [0, 1, 2, 3].map(j => val('st-m' + j)).filter(x => x != null);
  if (t === 'lp') v.lp = val('st-lp');
  if (t === 'lr') { v.rl = val('st-l'); v.rr = val('st-rr'); const a = num(v.rl), b = num(v.rr); if (a != null || b != null) v.r = String(Math.min(a != null ? a : b, b != null ? b : a)); }
  save(); closeSheet(); render(); }
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'setType') { const c = stCtxFrom(b); if (c) stSheet(c); }
  else if (a === 'stType' && ui.stCtx) stSheet(ui.stCtx, b.dataset.v);
  else if (a === 'stSave') stSave(); });
