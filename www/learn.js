/* ======================= LERNEN: SpoWi-Fakt des Tages und Lernkarten aus der geprüften Wissensbasis ======================= */
/* Fakt des Tages: ein Eintrag mit Grad A oder B, passend zum Ziel, jeden Tag ein anderer. Anzeige als Karte auf „Heute“, als Pop-up oder aus.
   Lernkarten: Vorderseite = Thema, Rückseite = Aussage mit Zahlen und Quelle. „Wusste ich“ schiebt die Karte eine Stufe weiter (Leitner, 5 Stufen). */
const LRN = () => (S.learn = S.learn || { seen: [], box: {}, day: null });
const factMode = () => { const m = S.settings.fact; return m || (LANG === 'de' ? 'card' : 'off'); };
const GOAL_CATS = { fat: ['FAT', 'ERN', 'NRG', 'REC'], muscle: ['HYP', 'KRA', 'PER', 'ERN'], strength: ['KRA', 'PER', 'HYP'], endurance: ['CAR', 'CON', 'REG'], hybrid: ['HYB', 'CON', 'CAR', 'HYP'], health: ['EIN', 'REG', 'ERN', 'WAR'], athletic: ['PLY', 'KRA', 'WAR', 'LOD'] };
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function factPool() { if (!EVID) return []; const goal = (S.settings.q || {}).goal; const pref = GOAL_CATS[goal] || []; const fem = S.settings.sex === 'w';
  return EVID.items.filter(x => (x.e === 'A' || x.e === 'B') && (x.c !== 'FRA' || fem)).map(x => ({ x, w: pref.includes(x.c) ? 3 : 1 })); }
function factPick(skip) { const L = LRN(); const pool = factPool().filter(o => !L.seen.includes(o.x.id) && o.x.id !== skip); const P = pool.length ? pool : factPool(); if (!P.length) return null;
  const tot = P.reduce((a, o) => a + o.w, 0); let r = hashStr(today() + (skip || '')) % tot; for (const o of P) { r -= o.w; if (r < 0) return o.x; } return P[0].x; }
function factToday() { const L = LRN(); if (L.day && L.day.d === today() && EVID && EVID.by[L.day.id]) return EVID.by[L.day.id];
  const x = factPick(); if (!x) return null; L.day = { d: today(), id: x.id, hide: false }; L.seen = [x.id, ...L.seen.filter(i => i !== x.id)].slice(0, 200); save(); return x; }
function factCard() { if (factMode() !== 'card' || VIEW) return ''; const L = LRN(); if (L.day && L.day.d === today() && L.day.hide) return '';
  if (!EVID) { loadEvid().then(() => { if (route.name === 'heute') render(); }).catch(() => {}); return ''; }
  const x = factToday(); if (!x) return '';
  return '<div class="card factc"><div class="row" style="align-items:center"><span class="tag">' + $t('SpoWi-Fakt des Tages') + '</span><span class="grow"></span><button class="iconbtn" style="width:32px;height:32px;flex:0 0 32px;background:var(--paper)" data-act="factHide" type="button" aria-label="' + $t('Für heute ausblenden') + '">✕</button></div>' +
    '<div class="row" style="margin-top:10px;flex-wrap:nowrap;align-items:flex-start">' + evG(x.e) + '<div class="grow"><p class="small muted" style="margin:0 0 2px">' + esc(evCat(x.c)) + ' · ' + esc(x.u) + '</p><p style="margin:0;font-weight:700" class="factt">' + esc(x.a) + '</p></div></div>' +
    '<div class="row" style="margin-top:10px;gap:8px"><button class="btn sm" data-act="evOpen" data-ids="' + x.id + '" type="button">' + $t('Mehr dazu') + '</button><button class="btn sm" data-act="factNext" type="button">' + $t('Anderer Fakt') + '</button><button class="btn sm" data-act="lcOpen" type="button">' + $t('Lernkarten') + '</button></div></div>'; }
function factPopup() { if (factMode() !== 'popup' || VIEW || route.name !== 'heute' || !S.meta.onboarded || document.getElementById('tour') || !$('#sheet').hidden) return; const L = LRN(); if (L.pop === today()) return;
  if (!EVID) { loadEvid().then(factPopup).catch(() => {}); return; } const x = factToday(); if (!x) return; L.pop = today(); save();
  openSheet(sheetHead($t('SpoWi-Fakt des Tages')) + '<div class="row" style="margin-top:10px;flex-wrap:nowrap;align-items:flex-start">' + evG(x.e) + '<div class="grow"><p class="small muted" style="margin:0 0 2px">' + esc(evCat(x.c)) + ' · ' + esc(x.u) + '</p><p style="margin:0;font-weight:700">' + esc(x.a) + '</p></div></div>' +
    (x.z && x.z !== 'nicht berichtet' ? '<p class="small" style="margin-top:10px">' + esc(x.z) + '</p>' : '') + '<p class="small muted" style="margin-top:8px">' + esc(x.q) + '</p>' +
    '<div class="row" style="margin-top:14px;gap:8px"><button class="btn brand" data-act="evOpen" data-ids="' + x.id + '" type="button">' + $t('Mehr dazu') + '</button><button class="btn fog" data-act="lcOpen" type="button">' + $t('Lernkarten') + '</button></div>' +
    '<p class="small muted" style="margin-top:12px">' + $t('Ausschalten oder als Karte statt Pop-up: Einstellungen → Fakt des Tages.') + '</p>'); }

/* Lernkarten */
let LC = { cat: null, id: null, back: false, n: 0 };
function lcNext() { const L = LRN(); let it = EVID.items; if (LC.cat) it = it.filter(x => x.c === LC.cat); if (S.settings.sex !== 'w' && !LC.cat) it = it.filter(x => x.c !== 'FRA');
  const lvl = x => L.box[x.id] == null ? -1 : L.box[x.id]; const minL = Math.min(...it.map(lvl)); const due = it.filter(x => lvl(x) === minL && x.id !== LC.id);
  const pool = due.length ? due : it; return pool[(hashStr(today() + LC.n + (LC.cat || '')) + LC.n * 7) % pool.length]; }
function lcSheet() { if (!EVID) { openSheet(sheetHead($t('Lernkarten')) + '<p class="muted">' + $t('Lade …') + '</p>'); loadEvid().then(lcSheet).catch(() => {}); return; }
  const L = LRN(); if (!LC.id) { LC.id = lcNext().id; LC.back = false; } const x = EVID.by[LC.id]; let it = EVID.items; if (LC.cat) it = it.filter(y => y.c === LC.cat);
  const known = it.filter(y => (L.box[y.id] || 0) >= 3).length;
  const cats = '<select id="lc-cat" aria-label="' + $t('Thema') + '" style="width:100%;margin-top:6px"><option value="">' + $t('Alle Themen') + '</option>' + Object.keys(EVID.cats).map(c => '<option value="' + c + '"' + (LC.cat === c ? ' selected' : '') + '>' + esc(evCat(c)) + '</option>').join('') + '</select>';
  const front = '<div class="lcard" data-act="lcFlip"><p class="small muted" style="margin:0">' + esc(evCat(x.c)) + '</p><h2 style="margin:8px 0">' + esc(x.u) + '</h2><p class="muted" style="margin:0">' + $t('Was sagt die Studienlage? Überleg kurz, dann umdrehen.') + '</p><p class="small" style="margin:14px 0 0;font-weight:700;color:var(--ember)">' + $t('Tippen zum Umdrehen') + '</p></div>';
  const back = '<div class="lcard"><div class="row" style="flex-wrap:nowrap;align-items:flex-start">' + evG(x.e) + '<p class="grow" style="margin:0;font-weight:700">' + esc(x.a) + '</p></div>' + (x.z && x.z !== 'nicht berichtet' ? '<p class="small" style="margin:10px 0 0">' + esc(x.z) + '</p>' : '') + '<p class="small muted" style="margin:10px 0 0">' + esc(x.q) + '</p></div>' +
    '<div class="row" style="margin-top:12px;gap:8px"><button class="btn fog" style="flex:1" data-act="lcRate" data-v="0" type="button">' + $t('Neu für mich') + '</button><button class="btn brand" style="flex:1" data-act="lcRate" data-v="1" type="button">' + $t('Wusste ich') + '</button></div>' +
    '<button class="linkbtn" style="margin-top:10px" data-act="evOpen" data-ids="' + x.id + '" type="button">' + $t('Ganzen Eintrag ansehen') + '</button>';
  openSheet(sheetHead($t('Lernkarten')) + '<div class="on-white">' + cats + '<p class="small muted" style="margin:8px 0 10px">' + known + $t(' von ') + it.length + $t(' Karten sitzen') + '</p>' + (LC.back ? back : front) + '</div>'); }
(function () { const st = document.createElement('style'); st.textContent = '.lcard{background:var(--fog);border-radius:18px;padding:18px;min-height:180px;cursor:pointer}.factc .factt{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}'; document.head.appendChild(st); })();

/* Einbindung: Heute, Einstellungen, Wissen */
const _viewHeuteLrn = viewHeute; viewHeute = function () { const h = _viewHeuteLrn.apply(this, arguments); const c = factCard(); if (!c) return h; const i = h.lastIndexOf('</div>'); return i < 0 ? h + c : h.slice(0, i) + c + h.slice(i); };
const _viewMehrLrn = viewMehr; viewMehr = function () { const h = _viewMehrLrn(); if (VIEW) return h; const m = factMode();
  const card = '<div class="card"><h2>' + $t('Fakt des Tages') + '</h2><p class="small muted">' + $t('Jeden Tag eine kurze, geprüfte Aussage aus der Wissensbasis, passend zu deinem Ziel.') + (LANG !== 'de' ? ' ' + $t('Die Inhalte gibt es bisher nur auf Deutsch.') : '') + '</p><div class="seg" style="margin-top:10px">' +
    [['card', $t('Karte auf Heute')], ['popup', $t('Pop-up')], ['off', $t('Aus')]].map(o => '<button class="' + (m === o[0] ? 'on' : '') + '" data-act="factMode" data-v="' + o[0] + '" type="button">' + o[1] + '</button>').join('') + '</div></div>';
  const i = h.indexOf('<a class="card" href="#wissen"'); if (i < 0) return h; const j = h.indexOf('</a>', i) + 4; return h.slice(0, j) + card + h.slice(j); };
const _viewWissenLrn = viewWissen; viewWissen = function (arg) { const h = _viewWissenLrn(arg); const btn = '<div class="card" style="display:flex;align-items:center;gap:10px"><div class="grow"><h2 style="margin:0">' + $t('Lernkarten') + '</h2><p class="small muted" style="margin:2px 0 0">' + $t('Thema sehen, überlegen, umdrehen. Was du schon weißt, kommt seltener.') + '</p></div><button class="btn brand sm" data-act="lcOpen" data-cat="' + (arg && EVID && EVID.cats[arg] ? arg : '') + '" type="button">' + $t('Start') + '</button></div>';
  const i = h.indexOf('<div class="card"><input id="ev-q"'); return i < 0 ? h : h.slice(0, i) + btn + h.slice(i); };
const _renderLrn = render; render = function () { const r = _renderLrn.apply(this, arguments); setTimeout(factPopup, 700); return r; };
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; const L = LRN();
  if (a === 'factHide') { if (L.day) L.day.hide = true; save(); render(); }
  else if (a === 'factNext') { const cur = L.day && L.day.id; const x = factPick(cur); if (x) { L.day = { d: today(), id: x.id }; L.seen = [x.id, ...L.seen.filter(i => i !== x.id)].slice(0, 200); save(); render(); } }
  else if (a === 'factMode') { S.settings.fact = b.dataset.v; save(); render(); }
  else if (a === 'lcOpen') { if (b.dataset.cat !== undefined) LC.cat = b.dataset.cat || null; LC.id = null; lcSheet(); }
  else if (a === 'lcFlip') { LC.back = true; lcSheet(); }
  else if (a === 'lcRate') { const cur = L.box[LC.id] || 0; L.box[LC.id] = b.dataset.v === '1' ? Math.min(4, cur + 1) : 0; save(); LC.n++; LC.id = lcNext().id; LC.back = false; lcSheet(); } });
document.addEventListener('change', e => { if (e.target.id === 'lc-cat') { LC.cat = e.target.value || null; LC.id = null; LC.n++; lcSheet(); } });
if (route.name === 'heute' || route.name === 'mehr' || route.name === 'wissen') render();
