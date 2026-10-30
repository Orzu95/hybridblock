/* ======================= WISSEN: geprüfte Evidenz-Wissensbasis (evidence.json) ======================= */
/* 384 Einträge aus 23 Themenblöcken. Quellen gegen Crossref/PubMed geprüft (docs/evidenz/KORREKTUREN.md). Folien-Inhalte auf EN/RU über evidence-en.json / evidence-ru.json, Studiendetails nur Deutsch. */
let EVID = null, EVID_LOADING = null;
const EV_THEMES = [['Training', ['HYP', 'KRA', 'PER', 'WAR', 'PLY', 'SPD', 'CON', 'HYB', 'CAR']], ['Ernährung', ['ERN', 'FAT', 'REC', 'BLK', 'NRG', 'SUP']], ['Steuerung und Erholung', ['LOD', 'TST', 'REG', 'BES']], ['Gesundheit und Kopf', ['GES', 'PSY']], ['Zielgruppen', ['FRA', 'EIN']]];
const EV_GRADE = { A: 'Meta-Analysen oder mehrere übereinstimmende Studien', B: 'Einzelne kontrollierte Studie oder systematisches Review', C: 'Beobachtungsstudie, kleine Studie oder Mechanismus', D: 'Expertenkonsens, Positionspapier oder Evidenzlücke' };
const EV_WORD = { A: 'Stark belegt', B: 'Gut belegt', C: 'Erste Hinweise', D: 'Expertenmeinung' };
/* Farbe und Symbol je Themenblock (eigene Zeichnungen, 24er Raster, Strichstärke 2) */
const EVC = { HYP: ['#ff5406', 'M5 19c-1.5-4 0-9 3-12l2-3 3 1.5-1.5 3.5c3.5-.5 7 1.5 7.5 5 .4 3-2 5-5 5H5zM10 14c1.5 1 3.5 1 5 0'], KRA: ['#d42c00', 'M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12'], PER: ['#5856de', 'M4 19h4v-4h4v-4h4V7h4M15 4h5v5'],
  WAR: ['#ff8a00', 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .5 2 1.5 3 2.5 3 0-3-1-5 0-8z'], PLY: ['#e0a100', 'M13 2L4 14h7l-1 8 9-12h-7l1-8z'], CON: ['#8b5cf6', 'M14 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0zM20 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0z'],
  HYB: ['#ff3d71', 'M7 9c-3 0-4 2-4 3s1 3 4 3c4 0 6-6 10-6 3 0 4 2 4 3s-1 3-4 3c-4 0-6-6-10-6z'], CAR: ['#e5484d', 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10zM7.5 12h2.5l1.5-2 2 4 1.5-2h1.5'],
  ERN: ['#00b33f', 'M12 7c-2-1.5-6-1-7 2.5S5 17 8 19.5c1.5 1 2.5.5 4 0 1.5.5 2.5 1 4 0 3-2.5 4-7 3-10S14 5.5 12 7zM12 7c0-2 1-3.5 3-4'], FAT: ['#00a39a', 'M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14'],
  REC: ['#2f9e44', 'M19.5 12A7.5 7.5 0 0 1 6 16.5M4.5 12A7.5 7.5 0 0 1 18 7.5M18 3.5v4h-4M6 20.5v-4h4'], BLK: ['#6aa500', 'M12 20V8M7 13l5-5 5 5M5 4h14'],
  NRG: ['#0ea5e9', 'M5 7h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM21 10.5v3M7 10v4M10.5 10v4'], SUP: ['#bd4be5', 'M10.5 4.5a4.95 4.95 0 0 1 7 7l-6 6a4.95 4.95 0 0 1-7-7zM8 8l6 6'],
  LOD: ['#00a9dd', 'M4 17a8 8 0 1 1 16 0M12 17l4-5M12 17h0'], REG: ['#3b5bdb', 'M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z'], BES: ['#72a2c5', 'M12 7.5v9M7.5 12h9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'],
  FRA: ['#d6336c', 'M17 9a5 5 0 1 1-10 0 5 5 0 0 1 10 0zM12 14v7M9 18h6'], SPD: ['#f76707', 'M13 4l-2 6h6l-8 10 2-7H5zM3 8h4M2 12h3'], TST: ['#1c7ed6', 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M8 15h8'],
  GES: ['#e03131', 'M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6zM9 12h6M12 9v6'], PSY: ['#ae3ec9', 'M9 4a4 4 0 0 0-4 4c-1.5.5-2 2-2 3s.5 2.5 2 3a4 4 0 0 0 4 4h1V4zM15 4a4 4 0 0 1 4 4c1.5.5 2 2 2 3s-.5 2.5-2 3a4 4 0 0 1-4 4h-1V4z'],
  EIN: ['#0b7285', 'M12 21v-8M12 13c0-4-3-6-7-6 0 4 3 6 7 6zM12 11c0-3 2-5 6-5 0 3-2 5-6 5z'] };
const evCol = c => (EVC[c] || ['#6b6b6b'])[0];
const evRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
/* CSS-Variablen je Thema: Grundfarbe, zarte Fläche, dunkle Variante (ohne color-mix, damit ältere WebViews mitspielen) */
const evVars = c => { const h = evCol(c), r = evRgb(h); return '--cc:' + h + ';--ct:rgba(' + r.join(',') + ',.09);--cd:rgb(' + r.map(v => Math.round(v * .68)).join(',') + ')'; };
const evIcSvg = (c, s) => '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (EVC[c] || ['', 'M12 8v5M12 16h0'])[1] + '"/></svg>';
const evIc = (c, s) => '<span class="evic" style="--cc:' + evCol(c) + ';width:' + s + 'px;height:' + s + 'px;flex:0 0 ' + s + 'px">' + evIcSvg(c, Math.round(s * .58)) + '</span>';
const ICON_BULB = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>';
/* Begründungen im Wochen-Check-in → passende Einträge */
const EV_REV = { vol: ['HYP-101', 'HYP-102', 'HYP-115'], stall: ['PER-116', 'PER-115', 'HYP-110'], deload: ['PER-113', 'PER-112'], spike: ['LOD-109', 'LOD-110', 'LOD-111'], adhere: ['HYP-106', 'KRA-106', 'EIN-116'], dietbreak: ['FAT-111', 'FAT-110', 'BLK-115'], rpe: ['PER-106', 'PER-107', 'KRA-108'] };
(function () { const st = document.createElement('style'); st.textContent =
  '.evg{display:inline-grid;place-items:center;min-width:26px;height:26px;border-radius:50%;font-weight:800;font-size:13px;color:#fff;background:var(--mist);flex:0 0 26px}.evg.gA{background:var(--verdant)}.evg.gB{background:var(--sky)}.evg.gC{background:var(--sunset)}.evg.gD{background:var(--mist)}' +
  '.evrow{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;border:0;background:none;border-top:1px solid var(--rule);padding:12px 2px;font:inherit;color:inherit;cursor:pointer}.evrow:first-child{border-top:0}.evrow .t{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
  '.evcat{display:flex;gap:10px;align-items:center;width:100%;text-align:left;border:0;background:var(--paper);border-radius:14px;padding:12px 14px;margin-top:8px;font:inherit;color:inherit;cursor:pointer}' +
  '.evbtn{border:0;background:var(--paper);color:var(--charcoal);font:inherit;font-size:13px;font-weight:700;border-radius:999px;padding:6px 12px;cursor:pointer;margin-top:8px}#sheetCard .evbtn,.on-white .evbtn{background:var(--fog);text-align:left}' +
  '.evic{display:inline-grid;place-items:center;border-radius:30%;background:var(--cc);color:#fff}' +
  '.evtiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.evtile{display:flex;flex-direction:column;gap:6px;align-items:flex-start;padding:12px;border-radius:16px;background:var(--ct);text-decoration:none;color:inherit;min-width:0}.evtile b{font-size:15px;line-height:1.2}' +
  '.evslh{display:flex;justify-content:flex-end;margin:-6px -6px 6px}.sld{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;border-radius:20px;gap:0}.sld::-webkit-scrollbar{display:none}' +
  '.sl{flex:0 0 100%;scroll-snap-align:start;min-height:340px;padding:22px;border-radius:20px;box-sizing:border-box}.s1{background:linear-gradient(150deg,var(--cc),var(--cd));color:#fff;display:flex;flex-direction:column}' +
  '.s1ic{width:62px;height:62px;border-radius:30%;background:rgba(255,255,255,.2);display:grid;place-items:center}.s1cat{margin:14px 0 4px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;opacity:.85}.s1 h2{font-size:24px;color:#fff}' +
  '.s1kn{margin-top:auto;padding-top:18px}.s1kn b{display:block;font-size:44px;line-height:1;font-weight:800;letter-spacing:-.01em}.s1kn span{display:block;margin-top:4px;font-weight:700;opacity:.9}.s1sw{margin:14px 0 0;font-size:12px;font-weight:700;opacity:.75}' +
  '.s2,.s3{background:var(--ct)}.slk{margin:0 0 12px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--cc)}' +
  '.slb{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:14px}.slb li{display:flex;gap:12px;align-items:flex-start;font-size:17px;font-weight:600;line-height:1.35}.slb .no{flex:0 0 28px;height:28px;border-radius:50%;background:var(--cc);color:#fff;display:grid;place-items:center;font-size:14px;font-weight:800}' +
  '.slfd{display:flex;gap:10px;align-items:flex-start;background:#fff;border-radius:16px;padding:14px;color:var(--cc)}.slfd p{margin:0;color:var(--graphite);font-weight:700;font-size:16px}.slfd svg{flex:0 0 22px}' +
  '.slgr{display:flex;gap:10px;align-items:center;margin-top:14px}.sldots{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:10px}#sldots{display:flex;gap:6px}#sldots i{width:8px;height:8px;border-radius:50%;background:var(--rule)}#sldots i.on{background:var(--charcoal);width:20px;border-radius:4px}' +
  '.sln{width:36px;height:36px;border-radius:50%;border:0;background:var(--fog);font-size:20px;font-weight:800;cursor:pointer}' +
  '.evsec{margin-top:14px}.evsec h3{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin:0 0 4px}.evtags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.evtags span{font-size:12px;font-weight:700;background:var(--fog);border-radius:8px;padding:2px 8px}';
  document.head.appendChild(st); })();
/* Übersetzte Folien (Titel, Kernzahl, Stichpunkte, Quizfrage) kommen als Overlay pro Sprache; Studiendetails bleiben Deutsch */
function evOverlay(j, o) { if (!o) return; Object.keys(o.cats || {}).forEach(c => { if (j.cats[c]) j.cats[c] = o.cats[c]; });
  j.items.forEach(x => { const t = o.items && o.items[x.id]; if (!t) return; if (t.u) x.u = t.u; if (t.sl && x.sl) { const d = x.sl.q.d; x.sl = Object.assign({}, x.sl, t.sl); x.sl.q = Object.assign({}, t.sl.q, { d }); } }); j.lang = LANG; }
function loadEvid() { if (EVID) return Promise.resolve(EVID); if (!EVID_LOADING) { const ov = LANG !== 'de' ? fetch('evidence-' + LANG + '.json').then(r => r.ok ? r.json() : null).catch(() => null) : Promise.resolve(null);
  EVID_LOADING = Promise.all([fetch('evidence.json').then(r => r.json()), ov]).then(([j, o]) => { evOverlay(j, o); EVID = j; EVID.by = {}; j.items.forEach(x => EVID.by[x.id] = x); return EVID; }).catch(e => { EVID_LOADING = null; throw e; }); } return EVID_LOADING; }
const evCat = c => EVID && EVID.cats[c] ? $t(EVID.cats[c]) : c;
const evG = g => '<span class="evg g' + g + '" title="' + esc($t(EV_GRADE[g] || '')) + '">' + g + '</span>';
/* Knopf, der einen oder mehrere Einträge öffnet; funktioniert auch, bevor die Daten geladen sind */
function evBtn(ids, label) { ids = [].concat(ids).filter(Boolean); if (!ids.length) return ''; return '<button class="evbtn" data-act="evOpen" data-ids="' + ids.join(',') + '" type="button">ⓘ ' + (label || (ids.length > 1 ? $t('Studienlage') + ' (' + ids.length + ')' : $t('Studienlage'))) + '</button>'; }
function evRow(x) { const t = x.sl ? x.sl.h : x.a; return '<button class="evrow" data-act="evOpen" data-ids="' + x.id + '" type="button">' + evIc(x.c, 34) + '<span class="grow"><span class="t">' + esc(t) + '</span><span class="small muted">' + esc(evCat(x.c)) + ' · ' + $t('Grad ') + x.e + '</span></span></button>'; }
function evMatch(x, q) { const s = (x.a + ' ' + x.u + ' ' + x.k.join(' ') + ' ' + x.q + ' ' + x.id + ' ' + x.p + (x.sl ? ' ' + x.sl.h + ' ' + x.sl.fd + ' ' + x.sl.b.join(' ') : '')).toLowerCase(); return q.split(/\s+/).filter(Boolean).every(w => s.includes(w)); }
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
  else body = EV_THEMES.map(t => '<div class="card"><h2>' + $t(t[0]) + '</h2><div class="evtiles">' + t[1].filter(c => EVID.cats[c]).map(c => { const n = EVID.items.filter(x => x.c === c); const a = n.filter(x => x.e === 'A').length;
      return '<a class="evtile" href="#wissen/' + c + '" style="' + evVars(c) + '">' + evIc(c, 40) + '<b>' + esc(evCat(c)) + '</b><span class="small muted">' + n.length + $t(' Aussagen') + ' · ' + a + $t(' mit Grad A') + '</span></a>'; }).join('') + '</div></div>').join('');
  return back + pageTop(cat ? esc(evCat(cat)) : $t('Wissen'), '', cat ? '' : $t('Geprüfte Aussagen aus der Sportwissenschaft, jede mit Quelle')) + '<div class="stack">' +
    search + body +
    '<p class="small muted" style="margin:0 4px">' + $t('Stand: ') + (EVID ? EVID.at.split('-').reverse().join('.') : '–') + ' · ' + (EVID ? EVID.items.length : '–') + $t(' Einträge. Alle Quellen wurden gegen Crossref und PubMed geprüft. Kein Ersatz für ärztlichen Rat.') + '</p></div>'; }
function evSheet(ids) { if (!EVID) { openSheet(sheetHead($t('Studienlage')) + '<p class="muted">' + $t('Lade …') + '</p>'); loadEvid().then(() => evSheet(ids)).catch(() => openSheet(sheetHead($t('Studienlage')) + '<p>' + $t('Wissensbasis nicht erreichbar.') + '</p>')); return; }
  const xs = ids.map(i => EVID.by[i]).filter(Boolean); if (!xs.length) return;
  if (xs.length > 1) { openSheet(sheetHead($t('Studienlage')) + '<div style="margin-top:6px">' + xs.map(evRow).join('') + '</div>'); return; }
  const x = xs[0]; if (!x.sl) return evDetails(x);
  openSheet('<div class="evslh"><button class="iconbtn" data-act="closeSheet" type="button" aria-label="' + $t('Schließen') + '">✕</button></div>' + evSlides(x)); evDotsInit(); }
/* Eintrag als kleine Präsentation: 1 Titel mit Schlüsselzahl · 2 Das Wichtigste · 3 Für dich + Quelle */
function evSlides(x) { const s = x.sl, c = x.c, col = evVars(c);
  const s1 = '<section class="sl s1" style="' + col + '"><div class="s1ic">' + evIcSvg(c, 34) + '</div><p class="s1cat">' + esc(evCat(c)) + '</p><h2>' + esc(s.h) + '</h2><div class="s1kn"><b>' + esc(s.kn[0]) + '</b><span>' + esc(s.kn[1]) + '</span></div><p class="s1sw">' + $t('Wischen für mehr') + ' →</p></section>';
  const s2 = '<section class="sl s2" style="' + col + '"><p class="slk">' + $t('Das Wichtigste') + '</p><ol class="slb">' + s.b.map((t, i) => '<li><span class="no">' + (i + 1) + '</span><span>' + esc(t) + '</span></li>').join('') + '</ol></section>';
  const s3 = '<section class="sl s3" style="' + col + '"><p class="slk">' + $t('Für dich') + '</p><div class="slfd">' + ICON_BULB + '<p>' + esc(s.fd) + '</p></div>' +
    '<div class="slgr">' + evG(x.e) + '<span><b>' + esc($t(EV_WORD[x.e])) + '</b><br><span class="small muted">' + esc($t(EV_GRADE[x.e])) + '</span></span></div>' +
    '<p class="small muted" style="margin:10px 0 0">' + esc(x.q.split(';')[0]) + '</p>' +
    '<div class="row" style="gap:8px;margin-top:12px"><button class="btn sm fog" data-act="evDet" data-id="' + x.id + '" type="button">' + $t('Studiendetails') + '</button><button class="btn sm fog" data-act="lcOne" data-id="' + x.id + '" type="button">' + $t('Als Lernkarte üben') + '</button></div></section>';
  return '<div class="sld" id="sld">' + s1 + s2 + s3 + '</div><div class="sldots"><button class="sln" data-act="slGo" data-d="-1" type="button" aria-label="' + $t('Zurück') + '">‹</button><span id="sldots"><i class="on"></i><i></i><i></i></span><button class="sln" data-act="slGo" data-d="1" type="button" aria-label="' + $t('Weiter') + '">›</button></div>'; }
function evDotsInit() { const el = document.getElementById('sld'); if (!el) return; el.addEventListener('scroll', () => { const i = Math.round(el.scrollLeft / el.clientWidth); document.querySelectorAll('#sldots i').forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true }); }
/* Studiendetails: je nach Ansicht mehr oder weniger Tiefe (Basis: Aussage + Quelle, Plus: + Zahlen und Grenzen, Labor: alles) */
function evDetails(x) { const lv = typeof viewLv === 'function' ? viewLv() : 3; const sec = (h, t) => t && t !== 'nicht berichtet' ? '<div class="evsec"><h3>' + h + '</h3><p class="small">' + esc(t) + '</p></div>' : '';
  openSheet(sheetHead(esc(evCat(x.c))) +
    '<div class="row" style="margin-top:10px;flex-wrap:nowrap;align-items:flex-start">' + evG(x.e) + '<div class="grow"><p style="margin:0;font-weight:700">' + esc(LANG !== 'de' && x.sl ? x.sl.h : x.a) + '</p><p class="small muted" style="margin:4px 0 0">' + esc(x.u) + ' · ' + $t('Grad ') + x.e + ': ' + esc($t(EV_GRADE[x.e])) + '</p></div></div>' +
    (LANG !== 'de' ? '<p class="small muted" style="margin:10px 0 0">' + $t('Die Studiendetails darunter (Zahlen, Methodik, Quelle) gibt es bisher nur auf Deutsch.') + '</p>' : '') +
    (lv >= 2 ? sec($t('Zahlen'), x.z) + sec($t('Einschränkungen'), x.n) : '') +
    (lv >= 3 ? sec($t('So nutzt die App das'), x.p.replace(/^WENN /, 'Wenn ').replace(/ DANN /, ', dann ')) + sec($t('Studientyp und Effekt'), x.t + (x.f && x.f !== 'nicht berichtet' ? ' · ' + x.f : '')) : '') +
    '<div class="evtags">' + x.g.map(z => '<span>' + esc($t(z)) + '</span>').join('') + '</div>' +
    '<div class="evsec"><h3>' + $t('Quelle') + '</h3><p class="small">' + esc(x.q) + (x.l ? ' · <a href="' + esc(x.l) + '" target="_blank" rel="noopener">' + $t('Studie öffnen') + '</a>' : '') + '</p></div>' +
    (lv >= 3 && x.s.length ? '<div class="evsec"><h3>' + $t('Gleiche Quelle, andere Bereiche') + '</h3>' + x.s.map(i => EVID.by[i] ? '<button class="evbtn" data-act="evOpen" data-ids="' + i + '" type="button">' + esc(evCat(EVID.by[i].c)) + ' · ' + esc(EVID.by[i].u) + '</button> ' : '').join('') + '</div>' : '') +
    (x.sl ? '<button class="linkbtn" style="margin-top:12px" data-act="evOpen" data-ids="' + x.id + '" type="button">‹ ' + $t('Zurück zur Übersicht') + '</button>' : '') +
    (lv < 3 ? '<p class="small muted" style="margin-top:12px">' + $t('Mehr Tiefe (Methoden, Effektgrößen) in der Ansicht Labor.') + '</p>' : '') + '<p class="small muted" style="margin-top:8px">' + x.id + '</p>'); }

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
  else if (b.dataset.act === 'evDet') { const x = EVID && EVID.by[b.dataset.id]; if (x) { evDetails(x); const sh = document.getElementById('sheet'); if (sh) sh.classList.add('center'); } }
  else if (b.dataset.act === 'slGo') { const el = document.getElementById('sld'); if (el) el.scrollBy({ left: +b.dataset.d * el.clientWidth, behavior: 'smooth' }); }
  else if (b.dataset.act === 'evGrade') { ui.wg = b.dataset.v; render(); } });
document.addEventListener('input', e => { if (e.target.id !== 'ev-q') return; ui.wq = e.target.value; const l = document.getElementById('ev-list');
  if (l) l.innerHTML = evList(ui.wq, route.arg && EVID && EVID.cats[route.arg] ? route.arg : null, ui.wg || ''); else if (ui.wq) { const pos = e.target.selectionStart; render(); const i = document.getElementById('ev-q'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (er) {} } } });
window.addEventListener('hashchange', () => { if (route.name !== 'wissen') { ui.wq = ''; ui.wg = ''; } });
if (route.name === 'wissen') render();
/* Superset-Dialog: Studienlage zu Supersets und Satzpausen */
if (typeof ssSheet === 'function') { const _sss = ssSheet; ssSheet = function () { _sss.apply(this, arguments); const s = document.querySelector('#sheetCard .on-white'); if (s && !s.querySelector('.evbtn')) s.insertAdjacentHTML('beforeend', '<div>' + evBtn(['HYP-114', 'HYP-109', 'HYP-113'], $t('Studienlage zu Supersets')) + '</div>'); }; }
