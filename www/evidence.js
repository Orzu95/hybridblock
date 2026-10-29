/* ======================= WISSEN: geprüfte Evidenz-Wissensbasis (evidence.json) ======================= */
/* 321 Einträge aus 19 Themenblöcken. Quellen gegen Crossref/PubMed geprüft (docs/evidenz/KORREKTUREN.md). Inhalte derzeit nur auf Deutsch. */
let EVID = null, EVID_LOADING = null;
const EV_THEMES = [['Training', ['HYP', 'KRA', 'PER', 'WAR', 'PLY', 'CON', 'HYB', 'CAR']], ['Ernährung', ['ERN', 'FAT', 'REC', 'BLK', 'NRG', 'SUP']], ['Steuerung und Erholung', ['LOD', 'REG', 'BES']], ['Zielgruppen', ['FRA', 'EIN']]];
const EV_GRADE = { A: 'Meta-Analysen oder mehrere übereinstimmende Studien', B: 'Einzelne kontrollierte Studie oder systematisches Review', C: 'Beobachtungsstudie, kleine Studie oder Mechanismus', D: 'Expertenkonsens, Positionspapier oder Evidenzlücke' };
/* Begründungen im Wochen-Check-in → passende Einträge */
const EV_REV = { vol: ['HYP-101', 'HYP-102', 'HYP-115'], stall: ['PER-116', 'PER-115', 'HYP-110'], deload: ['PER-113', 'PER-112'], spike: ['LOD-109', 'LOD-110', 'LOD-111'], adhere: ['HYP-106', 'KRA-106', 'EIN-116'], dietbreak: ['FAT-111', 'FAT-110', 'BLK-115'], rpe: ['PER-106', 'PER-107', 'KRA-108'] };
(function () { const st = document.createElement('style'); st.textContent =
  '.evg{display:inline-grid;place-items:center;min-width:26px;height:26px;border-radius:50%;font-weight:800;font-size:13px;color:#fff;background:var(--mist);flex:0 0 26px}.evg.gA{background:var(--verdant)}.evg.gB{background:var(--sky)}.evg.gC{background:var(--sunset)}.evg.gD{background:var(--mist)}' +
  '.evrow{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;border:0;background:none;border-top:1px solid var(--line,#eee);padding:12px 2px;font:inherit;color:inherit;cursor:pointer}.evrow:first-child{border-top:0}.evrow .t{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
  '.evcat{display:flex;gap:10px;align-items:center;width:100%;text-align:left;border:0;background:var(--paper);border-radius:14px;padding:12px 14px;margin-top:8px;font:inherit;color:inherit;cursor:pointer}' +
  '.evbtn{border:0;background:var(--paper);color:var(--ink);font:inherit;font-size:13px;font-weight:700;border-radius:999px;padding:6px 12px;cursor:pointer;margin-top:8px}#sheetCard .evbtn,.on-white .evbtn{background:var(--fog);text-align:left}' +
  '.evsec{margin-top:14px}.evsec h3{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin:0 0 4px}.evtags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.evtags span{font-size:12px;font-weight:700;background:var(--fog);border-radius:8px;padding:2px 8px}';
  document.head.appendChild(st); })();
function loadEvid() { if (EVID) return Promise.resolve(EVID); if (!EVID_LOADING) EVID_LOADING = fetch('evidence.json').then(r => r.json()).then(j => { EVID = j; EVID.by = {}; j.items.forEach(x => EVID.by[x.id] = x); return EVID; }).catch(e => { EVID_LOADING = null; throw e; }); return EVID_LOADING; }
const evCat = c => EVID && EVID.cats[c] ? $t(EVID.cats[c]) : c;
const evG = g => '<span class="evg g' + g + '" title="' + esc($t(EV_GRADE[g] || '')) + '">' + g + '</span>';
/* Knopf, der einen oder mehrere Einträge öffnet; funktioniert auch, bevor die Daten geladen sind */
function evBtn(ids, label) { ids = [].concat(ids).filter(Boolean); if (!ids.length) return ''; return '<button class="evbtn" data-act="evOpen" data-ids="' + ids.join(',') + '" type="button">ⓘ ' + (label || (ids.length > 1 ? $t('Studienlage') + ' (' + ids.length + ')' : $t('Studienlage'))) + '</button>'; }
function evRow(x) { return '<button class="evrow" data-act="evOpen" data-ids="' + x.id + '" type="button">' + evG(x.e) + '<span class="grow"><span class="t">' + esc(x.a) + '</span><span class="small muted">' + esc(x.u) + ' · ' + x.id + '</span></span></button>'; }
function evMatch(x, q) { const s = (x.a + ' ' + x.u + ' ' + x.k.join(' ') + ' ' + x.q + ' ' + x.id + ' ' + x.p).toLowerCase(); return q.split(/\s+/).filter(Boolean).every(w => s.includes(w)); }
function evList(q, cat, g) { if (!EVID) return '<p class="muted">' + $t('Lade …') + '</p>'; let it = EVID.items; if (cat) it = it.filter(x => x.c === cat); if (g) it = it.filter(x => x.e === g); if (q) it = it.filter(x => evMatch(x, q.toLowerCase()));
  if (!it.length) return '<p class="muted">' + $t('Keine Einträge gefunden.') + '</p>'; const more = it.length > 80; return it.slice(0, 80).map(evRow).join('') + (more ? '<p class="small muted">' + $t('Die ersten 80 Treffer. Suche genauer für weniger.') + '</p>' : ''); }
function viewWissen(arg) { if (!EVID) { loadEvid().then(() => { if (route.name === 'wissen') render(); }).catch(() => {}); }
  const cat = arg && EVID && EVID.cats[arg] ? arg : null; const q = ui.wq || ''; const g = ui.wg || '';
  const back = cat ? '<a href="#wissen" class="back">' + ICON.back + $t('Wissen') + '</a>' : '<a href="#mehr" class="back">' + ICON.back + $t('Einstellungen') + '</a>';
  const seg = '<div class="seg" style="margin-top:10px">' + [['', $t('Alle')], ['A', 'A'], ['B', 'B'], ['C', 'C'], ['D', 'D']].map(o => '<button class="' + (g === o[0] ? 'on' : '') + '" data-act="evGrade" data-v="' + o[0] + '" type="button">' + o[1] + '</button>').join('') + '</div>';
  const search = '<div class="card"><input id="ev-q" type="search" value="' + esc(q) + '" placeholder="' + $t('Suchen, z. B. Protein, Deload, Kreatin') + '" style="width:100%">' + seg +
    '<p class="small muted" style="margin-top:8px">' + $t('Evidenzgrad: A = Meta-Analysen, B = einzelne Studien, C = schwache Daten, D = Konsens oder Lücke.') + '</p></div>';
  let body;
  if (!EVID) body = '<div class="card"><p class="muted">' + $t('Lade …') + '</p></div>';
  else if (cat || q || g) body = '<div class="card"><div id="ev-list">' + evList(q, cat, g) + '</div></div>';
  else body = EV_THEMES.map(t => '<div class="card"><h2>' + $t(t[0]) + '</h2>' + t[1].filter(c => EVID.cats[c]).map(c => { const n = EVID.items.filter(x => x.c === c); const a = n.filter(x => x.e === 'A').length;
      return '<a class="evcat" href="#wissen/' + c + '" style="text-decoration:none"><span class="grow"><b>' + esc(evCat(c)) + '</b><br><span class="small muted">' + n.length + $t(' Aussagen') + ' · ' + a + $t(' mit Grad A') + '</span></span><span class="muted">›</span></a>'; }).join('') + '</div>').join('');
  return back + pageTop(cat ? esc(evCat(cat)) : $t('Wissen'), '', cat ? '' : $t('Geprüfte Aussagen aus der Sportwissenschaft, jede mit Quelle')) + '<div class="stack">' +
    (LANG !== 'de' ? note('sky', $t('Die Studieninhalte gibt es bisher nur auf Deutsch.')) : '') + search + body +
    '<p class="small muted" style="margin:0 4px">' + $t('Stand: ') + (EVID ? EVID.at.split('-').reverse().join('.') : '–') + ' · ' + (EVID ? EVID.items.length : '–') + $t(' Einträge. Alle Quellen wurden gegen Crossref und PubMed geprüft. Kein Ersatz für ärztlichen Rat.') + '</p></div>'; }
function evSheet(ids) { if (!EVID) { openSheet(sheetHead($t('Studienlage')) + '<p class="muted">' + $t('Lade …') + '</p>'); loadEvid().then(() => evSheet(ids)).catch(() => openSheet(sheetHead($t('Studienlage')) + '<p>' + $t('Wissensbasis nicht erreichbar.') + '</p>')); return; }
  const xs = ids.map(i => EVID.by[i]).filter(Boolean); if (!xs.length) return;
  if (xs.length > 1) { openSheet(sheetHead($t('Studienlage')) + '<div style="margin-top:6px">' + xs.map(evRow).join('') + '</div>'); return; }
  const x = xs[0]; const sec = (h, t, cls) => t && t !== 'nicht berichtet' ? '<div class="evsec' + (cls ? ' ' + cls : '') + '"><h3>' + h + '</h3><p class="small">' + esc(t) + '</p></div>' : '';
  openSheet(sheetHead(esc(evCat(x.c))) +
    '<div class="row" style="margin-top:10px;flex-wrap:nowrap;align-items:flex-start">' + evG(x.e) + '<div class="grow"><p style="margin:0;font-weight:700">' + esc(x.a) + '</p><p class="small muted" style="margin:4px 0 0">' + esc(x.u) + ' · ' + $t('Grad ') + x.e + ': ' + esc($t(EV_GRADE[x.e])) + '</p></div></div>' +
    sec($t('Zahlen'), x.z) + sec($t('Einschränkungen'), x.n) +
    sec($t('So nutzt die App das'), x.p.replace(/^WENN /, 'Wenn ').replace(/ DANN /, ', dann '), 'sw-only') + sec($t('Studientyp und Effekt'), x.t + (x.f && x.f !== 'nicht berichtet' ? ' · ' + x.f : ''), 'sw-only') +
    '<div class="evtags">' + x.g.map(z => '<span>' + esc($t(z)) + '</span>').join('') + '</div>' +
    '<div class="evsec"><h3>' + $t('Quelle') + '</h3><p class="small">' + esc(x.q) + (x.l ? ' · <a href="' + esc(x.l) + '" target="_blank" rel="noopener">' + $t('Studie öffnen') + '</a>' : '') + '</p></div>' +
    (x.s.length ? '<div class="evsec"><h3>' + $t('Gleiche Quelle, andere Bereiche') + '</h3>' + x.s.map(i => EVID.by[i] ? '<button class="evbtn" data-act="evOpen" data-ids="' + i + '" type="button">' + esc(evCat(EVID.by[i].c)) + ' · ' + esc(EVID.by[i].u) + '</button> ' : '').join('') + '</div>' : '') +
    '<p class="small muted" style="margin-top:14px">' + x.id + '</p>'); }

/* Wochen-Check-in: „Warum?“ zeigt jetzt die geprüften Einträge */
const _whySheetEv = whySheet;
whySheet = function (ev) { const ids = EV_REV[ev]; if (!ids) return _whySheetEv(ev); const e = REV_EV[ev];
  const show = () => { const xs = ids.map(i => EVID.by[i]).filter(Boolean); const top = xs[0];
    openSheet(sheetHead($t('Warum?')) + (e ? '<p>' + esc(e.txt) + '</p>' : '') + (top ? '<p class="small" style="margin-top:10px"><b>' + $t('Evidenzgrad ') + top.e + '</b> · ' + esc($t(EV_GRADE[top.e])) + '</p>' : '') +
      '<div style="margin-top:8px">' + xs.map(evRow).join('') + '</div>'); };
  if (EVID) show(); else { _whySheetEv(ev); loadEvid().then(show).catch(() => {}); } };

/* Wissen-Karte in den Einstellungen, Studienlage im SpoWi-Verlauf */
const _viewMehrEv = viewMehr;
viewMehr = function () { const h = _viewMehrEv(); if (VIEW) return h; const card = '<a class="card" href="#wissen" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit"><div class="grow"><h2 style="margin:0">' + $t('Wissen') + '</h2><p class="small muted" style="margin:2px 0 0">' + $t('Was die Studienlage zu Training, Ernährung und Erholung sagt, mit Quellen.') + '</p></div><span class="muted">›</span></a>';
  return h.replace('<div class="stack">', '<div class="stack">' + card); };
if (typeof spowiProgressCard === 'function') { const _spc = spowiProgressCard; spowiProgressCard = function () { const h = _spc(); return h ? h.replace(/<\/div>\s*$/, '<div>' + evBtn(['LOD-107', 'LOD-109', 'LOD-110', 'LOD-108', 'LOD-105'], $t('Studienlage zu den Kennzahlen')) + '</div></div>') : h; }; }
if (typeof cycleFlags === 'function') { const _cf = cycleFlags; cycleFlags = function (w, k) { const h = _cf(w, k); return h ? h + '<div style="margin:-4px 4px 0">' + evBtn(['FRA-103', 'FRA-105', 'FRA-104'], $t('Studienlage zu Zyklus und Training')) + '</div>' : h; }; }

document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'evOpen') { evSheet(b.dataset.ids.split(',')); }
  else if (b.dataset.act === 'evGrade') { ui.wg = b.dataset.v; render(); } });
document.addEventListener('input', e => { if (e.target.id !== 'ev-q') return; ui.wq = e.target.value; const l = document.getElementById('ev-list');
  if (l) l.innerHTML = evList(ui.wq, route.arg && EVID && EVID.cats[route.arg] ? route.arg : null, ui.wg || ''); else if (ui.wq) { const pos = e.target.selectionStart; render(); const i = document.getElementById('ev-q'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (er) {} } } });
window.addEventListener('hashchange', () => { if (route.name !== 'wissen') { ui.wq = ''; ui.wg = ''; } });
if (route.name === 'wissen') render();
/* Supersatz-Dialog: Studienlage zu Supersätzen und Satzpausen */
if (typeof ssSheet === 'function') { const _sss = ssSheet; ssSheet = function () { _sss.apply(this, arguments); const s = document.querySelector('#sheetCard .on-white'); if (s && !s.querySelector('.evbtn')) s.insertAdjacentHTML('beforeend', '<div>' + evBtn(['HYP-114', 'HYP-109', 'HYP-113'], $t('Studienlage zu Supersätzen')) + '</div>'); }; }
