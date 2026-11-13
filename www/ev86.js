/* Hybridblock – 8.6 Mehr Einträge der Wissensbank im Kontext („Studienlage“-Knöpfe an Aufwärmen, Übungsinfo,
   Ausdauer-Einheiten, Entlastungswochen, Ernährungszielen und Schlaf) */
'use strict';
const EV86 = { warm: ['WAR-104', 'WAR-101', 'WAR-102'], rom: ['HYP-107'], z2: ['CAR-101', 'CAR-102', 'CAR-105'], dl: ['PER-112', 'PER-113'], food: ['FAT-108', 'REC-111', 'ERN-107', 'BLK-108'], sleep: ['REG-101', 'REG-102', 'LOD-116'] };
const ev86Row = (ids, lab) => '<div style="margin-top:10px">' + evBtn(ids, $t(lab)) + '</div>';
hbFilter('plateBody', 'ev86', function (__v, load, isMain) { const h = __v; return isMain ? h + ev86Row(EV86.warm, 'Studienlage zum Aufwärmen') : h; });
const _exInfoSheetEV = exInfoSheet;
exInfoSheet = function () { const r = _exInfoSheetEV.apply(this, arguments); const ex = arguments[0]; Promise.resolve(r).then(() => ev86Info(ex)).catch(() => {}); ev86Info(ex); return r; };
function ev86Info(ex) { const c = document.querySelector('#sheetCard'), sh = document.querySelector('#sheet'); if (!c || !sh || sh.hidden || !c.querySelector('[data-ex="' + ex + '"]') || c.querySelector('[data-ev86]')) return; c.insertAdjacentHTML('beforeend', '<div data-ev86>' + ev86Row(EV86.rom, 'Studienlage zum Bewegungsumfang') + '</div>'); }
const _viewSessionEV = viewSession;
viewSession = function (key) { const h = _viewSessionEV.apply(this, arguments); const m = String(key || '').match(RE_SESS); if (!m) return h; const w = +m[1], k = m[2], s = SESS[k]; let add = '';
  if (s && (s.kind === 'z2' || s.cardio)) add += ev86Row(EV86.z2, 'Studienlage zu Grundlagenausdauer und Intensitätsverteilung');
  if (typeof phase === 'function' && phase(w) === 'dl') add += ev86Row(EV86.dl, 'Studienlage zur Entlastungswoche');
  if (!add) return h; const i = h.lastIndexOf('</div>'); return i < 0 ? h + add : h.slice(0, i) + '<div style="margin:4px 4px 12px">' + add + '</div>' + h.slice(i); };
hbFilter('viewEssen', 'ev86', function (__v) { const h = __v; const i = h.lastIndexOf('</div>'); const add = '<div style="margin:4px 4px 12px">' + ev86Row(EV86.food, 'Studienlage zu Protein und Kohlenhydraten') + '</div>'; return i < 0 ? h + add : h.slice(0, i) + add + h.slice(i); });
