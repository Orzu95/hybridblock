/* ======================= QUIZ & LERNEN: Fakt des Tages, Lernkarten und Quiz aus der geprüften Wissensbasis ======================= */
/* Fakt des Tages (Heute): ein Eintrag mit Grad A oder B, passend zum Ziel. Karte, Pop-up oder aus. Bewusst getrennt von den Lernkarten.
   Lernkarten (Tab „Lernen“): Vorderseite = Frage, Rückseite = Antwort, Schlüsselzahl, Praxis. „Wusste ich“ schiebt die Karte eine Stufe weiter (Leitner, 5 Stufen).
   Quiz: 2–5 geschlossene Fragen (Auswahl oder Stimmt/Stimmt nicht), 60 % aus gelernten Karten, 40 % zufällig, um Lücken zu finden.
   Schwierigkeit und Tiefe der Erklärung folgen der Ansicht (Basis · Plus · Labor). Falsche Antwort → Erklärung → passende Lernkarte. */
const LRN = () => { const L = (S.learn = S.learn || { seen: [], box: {}, day: null }); L.qs = L.qs || {}; L.qa = L.qa || {}; L.qn = L.qn || 0; return L; };
const factMode = () => { const m = S.settings.fact; return m || (LANG === 'de' ? 'card' : 'off'); };
const GOAL_CATS = { fat: ['FAT', 'ERN', 'NRG', 'REC'], muscle: ['HYP', 'KRA', 'PER', 'ERN'], strength: ['KRA', 'PER', 'HYP'], endurance: ['CAR', 'CON', 'REG'], hybrid: ['HYB', 'CON', 'CAR', 'HYP'], health: ['EIN', 'REG', 'ERN', 'WAR'], athletic: ['PLY', 'KRA', 'WAR', 'LOD'] };
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const lrnLv = () => typeof viewLv === 'function' ? viewLv() : 2;
const lrnDiff = () => ({ 1: [1], 2: [1, 2], 3: [2, 3] })[lrnLv()];
const lrnForMe = x => x.c !== 'FRA' || S.settings.sex === 'w';
const shuffle = (a, seed) => { a = a.slice(); let r = seed || (Math.random() * 1e9) | 0; for (let i = a.length - 1; i > 0; i--) { r = (Math.imul(r, 1103515245) + 12345) >>> 0; const j = r % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------- Fakt des Tages ---------- */
function factPool() { if (!EVID) return []; const goal = (S.settings.q || {}).goal; const pref = GOAL_CATS[goal] || [];
  return EVID.items.filter(x => (x.e === 'A' || x.e === 'B') && lrnForMe(x)).map(x => ({ x, w: pref.includes(x.c) ? 3 : 1 })); }
function factPick(skip) { const L = LRN(); const pool = factPool().filter(o => !L.seen.includes(o.x.id) && o.x.id !== skip); const P = pool.length ? pool : factPool(); if (!P.length) return null;
  const tot = P.reduce((a, o) => a + o.w, 0); let r = hashStr(today() + (skip || '')) % tot; for (const o of P) { r -= o.w; if (r < 0) return o.x; } return P[0].x; }
function factToday() { const L = LRN(); if (L.day && L.day.d === today() && EVID && EVID.by[L.day.id]) return EVID.by[L.day.id];
  const x = factPick(); if (!x) return null; L.day = { d: today(), id: x.id, hide: false }; L.seen = [x.id, ...L.seen.filter(i => i !== x.id)].slice(0, 200); save(); return x; }
function factBody(x) { const s = x.sl || { h: x.a, kn: ['', ''], fd: '' };
  return '<div class="fct-h">' + evIc(x.c, 44) + '<div class="grow"><p class="small muted" style="margin:0 0 2px">' + esc(evCat(x.c)) + '</p><p class="fct-t">' + esc(s.h) + '</p></div></div>' +
    (s.kn[0] ? '<div class="fct-kn"><b>' + esc(s.kn[0]) + '</b><span>' + esc(s.kn[1]) + '</span></div>' : '') + (s.fd ? '<p class="fct-fd">' + esc(s.fd) + '</p>' : ''); }
function factCard() { if (factMode() !== 'card' || VIEW) return ''; const L = LRN(); if (L.day && L.day.d === today() && L.day.hide) return '';
  if (!EVID) { loadEvid().then(() => { if (route.name === 'heute') render(); }).catch(() => {}); return ''; }
  const x = factToday(); if (!x) return '';
  return '<div class="card fct" style="' + evVars(x.c) + '"><div class="row" style="align-items:center"><span class="fct-tag">' + $t('Fakt des Tages') + '</span><span class="grow"></span>' + evG(x.e) +
    '<button class="iconbtn" style="width:32px;height:32px;flex:0 0 32px;background:#fff;margin-left:6px" data-act="factHide" type="button" aria-label="' + $t('Für heute ausblenden') + '">✕</button></div>' + factBody(x) +
    '<div class="row" style="margin-top:12px;gap:8px"><button class="btn sm brand" data-act="evOpen" data-ids="' + x.id + '" type="button">' + $t('Mehr dazu') + '</button><button class="btn sm" style="background:#fff" data-act="factNext" type="button">' + $t('Anderer Fakt') + '</button></div></div>'; }
function factPopup() { if (factMode() !== 'popup' || VIEW || route.name !== 'heute' || !S.meta.onboarded || document.getElementById('tour') || !$('#sheet').hidden) return; const L = LRN(); if (L.pop === today()) return;
  if (!EVID) { loadEvid().then(factPopup).catch(() => {}); return; } const x = factToday(); if (!x) return; L.pop = today(); save();
  openSheet(sheetHead($t('Fakt des Tages')) + '<div class="fct" style="' + evVars(x.c) + ';margin-top:10px;border-radius:20px;padding:16px">' + factBody(x) + '</div>' +
    '<div class="row" style="margin-top:14px;gap:8px"><button class="btn brand" data-act="evOpen" data-ids="' + x.id + '" type="button">' + $t('Mehr dazu') + '</button></div>' +
    '<p class="small muted" style="margin-top:12px">' + $t('Ausschalten oder als Karte statt Pop-up: Einstellungen → Fakt des Tages.') + '</p>'); }

/* ---------- Lernkarten ---------- */
let LC = { cat: null, id: null, back: false, n: 0, queue: null, quiz: false };
function lcPool(cat) { let it = EVID.items.filter(x => x.sl); if (cat) return it.filter(x => x.c === cat); it = it.filter(lrnForMe); const d = lrnDiff(); const f = it.filter(x => d.includes(x.sl.q.d)); return f.length ? f : it; }
function lcNext() { const L = LRN(); if (LC.queue && LC.queue.length) return EVID.by[LC.queue.shift()]; const it = lcPool(LC.cat);
  const lvl = x => L.box[x.id] == null ? -1 : L.box[x.id]; const minL = Math.min(...it.map(lvl)); const due = it.filter(x => lvl(x) === minL && x.id !== LC.id);
  const pool = due.length ? due : it; return pool[(hashStr(today() + LC.n + (LC.cat || '')) + LC.n * 7) % pool.length]; }
function lcKnown(cat) { const L = LRN(); const it = EVID.items.filter(x => x.c === cat); return [it.filter(y => (L.box[y.id] || 0) >= 3).length, it.length]; }
function lcSheet() { if (!EVID) { openPop(sheetHead($t('Lernkarten')) + '<p class="muted">' + $t('Lade …') + '</p>'); loadEvid().then(lcSheet).catch(() => {}); return; }
  if (!LC.id) { const nx = lcNext(); if (!nx) return; LC.id = nx.id; LC.back = false; } const x = EVID.by[LC.id]; const s = x.sl; const L = LRN();
  const it = LC.cat ? EVID.items.filter(y => y.c === LC.cat) : lcPool(null); const known = it.filter(y => (L.box[y.id] || 0) >= 3).length;
  const chips = LC.quiz ? '' : '<div class="lcchips">' + ['', ...Object.keys(EVID.cats)].map(c => '<button class="lcchip' + ((LC.cat || '') === c ? ' on' : '') + '" data-act="lcCat" data-cat="' + c + '" type="button"' + (c ? ' style="' + evVars(c) + '"' : '') + '>' + (c ? evIcSvg(c, 16) + esc(evCat(c)) : $t('Alle Themen')) + '</button>').join('') + '</div>';
  const card = '<div class="lcflip' + (LC.back ? ' back' : '') + '" style="' + evVars(x.c) + '"><div class="lcin">' +
    '<div class="lcf lcfront" data-act="lcFlip"><div class="row" style="align-items:center;gap:10px"><span class="lcic">' + evIcSvg(x.c, 22) + '</span><span class="lccat">' + esc(evCat(x.c)) + '</span></div><p class="lcq">' + esc(s.q.q) + '</p><p class="lchint">' + $t('Überleg kurz, dann tippen zum Umdrehen') + '</p></div>' +
    '<div class="lcf lcback"><p class="slk" style="margin-bottom:6px">' + $t('Antwort') + '</p><p class="lca">' + esc(s.q.r) + '</p><div class="lckn"><b>' + esc(s.kn[0]) + '</b> <span>' + esc(s.kn[1]) + '</span></div><p class="lcfd">' + esc(s.fd) + '</p><div class="row" style="align-items:center;gap:8px;margin-top:auto">' + evG(x.e) + '<span class="small muted">' + esc($t(EV_WORD[x.e])) + '</span></div></div>' +
    '</div></div>';
  const btns = LC.back ? '<div class="row" style="margin-top:12px;gap:8px"><button class="btn fog" style="flex:1" data-act="lcRate" data-v="0" type="button">' + $t('Neu für mich') + '</button><button class="btn brand" style="flex:1" data-act="lcRate" data-v="1" type="button">' + $t('Wusste ich') + '</button></div>' : '<button class="btn brand" style="width:100%;margin-top:12px" data-act="lcFlip" type="button">' + $t('Umdrehen') + '</button>';
  const foot = LC.quiz ? '<button class="btn fog" style="width:100%;margin-top:8px" data-act="qzBack" type="button">' + $t('Zurück zum Quiz') + '</button>' : '<button class="linkbtn" style="margin-top:10px" data-act="evOpen" data-ids="' + x.id + '" type="button">' + $t('Ganzen Eintrag ansehen') + '</button>';
  openPop(sheetHead($t('Lernkarten')) + '<div data-noglos>' + chips + '<p class="small muted" style="margin:8px 0 10px">' + known + $t(' von ') + it.length + $t(' Karten sitzen') + '</p>' + card + btns + foot + '</div>');
  const ch = document.querySelector('.lcchip.on'); if (ch) ch.scrollIntoView({ block: 'nearest', inline: 'center' }); }

/* ---------- Quiz ---------- */
let QZ = null;
function qzBuild(n) { const L = LRN(); const d = lrnDiff(); let all = EVID.items.filter(x => x.sl && lrnForMe(x)); const byD = all.filter(x => d.includes(x.sl.q.d)); if (byD.length >= 10) all = byD;
  const learned = all.filter(x => L.box[x.id] != null || L.qa[x.id] != null || L.seen.includes(x.id)); const fresh = all.filter(x => !learned.includes(x));
  const nL = Math.min(learned.length, Math.round(n * .6)); const seed = (Date.now() / 1000) | 0;
  /* gelernte: was zuletzt falsch oder noch wackelig war zuerst; neue: möglichst aus verschiedenen Themen */
  const lr = shuffle(learned, seed).sort((a, b) => ((L.qa[a.id] === 0 ? -2 : 0) + (L.box[a.id] || 0)) - ((L.qa[b.id] === 0 ? -2 : 0) + (L.box[b.id] || 0))).slice(0, nL);
  const used = new Set(lr.map(x => x.c)); const fr = []; shuffle(fresh.length ? fresh : all, seed + 1).forEach(x => { if (fr.length >= n - lr.length || lr.includes(x) || fr.includes(x)) return; if (!used.has(x.c) || fr.length + lr.length >= 19) { fr.push(x); used.add(x.c); } });
  shuffle(fresh.length ? fresh : all, seed + 2).forEach(x => { if (fr.length < n - lr.length && !lr.includes(x) && !fr.includes(x)) fr.push(x); });
  const items = shuffle([...lr, ...fr], seed + 3).map((x, i) => { const q = x.sl.q; const tf = (hashStr(x.id + seed) % 4) === 0;
    if (tf) { const truth = hashStr(x.id + 'tf' + seed) % 2 === 0; return { id: x.id, tf: true, claim: truth ? q.r : q.w[hashStr(x.id) % 3], opts: [$t('Stimmt'), $t('Stimmt nicht')], ok: truth ? 0 : 1, learned: lr.includes(x) }; }
    const opts = shuffle([q.r, ...q.w], seed + i); return { id: x.id, opts, ok: opts.indexOf(q.r), learned: lr.includes(x) }; });
  return { items, i: 0, ans: [], n }; }
function qzStart(n) { if (!EVID) { loadEvid().then(() => qzStart(n)).catch(() => {}); return; } QZ = qzBuild(n || +S.settings.qzN || ({ 1: 3, 2: 4, 3: 5 })[lrnLv()]); if (route.name === 'lernen' && route.arg === 'quiz') render(true); else location.hash = '#lernen/quiz'; }
function qzExplain(x, right) { const s = x.sl, lv = lrnLv();
  return '<div class="qzx ' + (right ? 'ok' : 'no') + '"><p class="qzv">' + (right ? '✓ ' + $t('Richtig!') : '✕ ' + $t('Nicht ganz.')) + '</p>' + (right ? '' : '<p style="margin:4px 0 0"><span class="muted">' + $t('Richtig ist: ') + '</span><b>' + esc(s.q.r) + '</b></p>') +
    '<p style="margin:8px 0 0">' + esc(s.fd) + '</p>' + (lv >= 2 ? '<p class="small" style="margin:8px 0 0"><b>' + esc(s.kn[0]) + '</b> ' + esc(s.kn[1]) + '</p>' : '') +
    (lv >= 3 ? '<p class="small muted" style="margin:6px 0 0">' + $t('Grad ') + x.e + ' · ' + esc(x.q.split(';')[0]) + '</p>' : '') + '</div>'; }
function viewQuiz() { if (!EVID) { loadEvid().then(() => { if (route.name === 'lernen') render(); }).catch(() => {}); return '<p class="muted">' + $t('Lade …') + '</p>'; }
  if (!QZ) QZ = qzBuild(+S.settings.qzN || ({ 1: 3, 2: 4, 3: 5 })[lrnLv()]);
  const back = '<a href="#lernen" class="back">' + ICON.back + $t('Quiz und Lernen') + '</a>';
  const bar = '<div class="qzbar">' + QZ.items.map((q, k) => '<i class="' + (k < QZ.ans.length ? (QZ.ans[k] === q.ok ? 'ok' : 'no') : k === QZ.i ? 'cur' : '') + '"></i>').join('') + '</div>';
  if (QZ.i >= QZ.items.length) return back + viewQuizEnd();
  const q = QZ.items[QZ.i], x = EVID.by[q.id], done = QZ.ans.length > QZ.i, a = QZ.ans[QZ.i];
  const opts = q.opts.map((o, k) => '<button class="qzo' + (done ? (k === q.ok ? ' ok' : k === a ? ' no' : ' dim') : '') + '" data-act="qzAns" data-k="' + k + '" type="button"' + (done ? ' disabled' : '') + '><span class="qzl">' + (q.tf ? (k ? '✕' : '✓') : 'ABCD'[k]) + '</span><span>' + esc(o) + '</span></button>').join('');
  const after = done ? qzExplain(x, a === q.ok) + '<div class="row" style="gap:8px;margin-top:12px">' + (a !== q.ok ? '<button class="btn brand" style="flex:1" data-act="qzCard" type="button">' + $t('Zur Lernkarte') + '</button><button class="btn fog" style="flex:1" data-act="qzNext" type="button">' + $t('Weiter') + '</button>' : '<button class="btn brand" style="flex:1" data-act="qzNext" type="button">' + (QZ.i + 1 < QZ.items.length ? $t('Weiter') : $t('Ergebnis')) + '</button>') + '</div>' : '';
  return back + '<div class="stack" data-noglos>' + bar + '<div class="card qzc" style="' + evVars(x.c) + '"><div class="row" style="align-items:center;gap:10px">' + evIc(x.c, 34) + '<span class="small muted grow">' + esc(evCat(x.c)) + '</span><span class="small muted">' + (QZ.i + 1) + ' / ' + QZ.items.length + '</span></div>' +
    (q.tf ? '<p class="qzk">' + $t('Stimmt das?') + '</p><p class="qzq">' + esc(x.sl.q.q) + '</p><p class="qzclaim">→ ' + esc(q.claim) + '</p>' : '<p class="qzq">' + esc(x.sl.q.q) + '</p>') +
    '<div class="qzos' + (q.tf ? ' tf' : '') + '">' + opts + '</div>' + after + '</div></div>'; }
function viewQuizEnd() { const r = QZ.ans.filter((a, k) => a === QZ.items[k].ok).length, n = QZ.items.length, f = r / n;
  const msg = f === 1 ? $t('Alles richtig. Stark!') : f >= .6 ? $t('Gut gemacht. Die Lücken findest du unten.') : $t('Da geht noch was. Die Lernkarten helfen dir.');
  const wrong = QZ.items.filter((q, k) => QZ.ans[k] !== q.ok).map(q => q.id);
  return '<div class="stack" data-noglos><div class="card" style="text-align:center"><div class="qzflask">' + qzFlask(f) + '</div><h1 style="margin-top:6px">' + r + $t(' von ') + n + '</h1><p class="muted" style="margin:4px 0 0">' + msg + '</p>' +
    '<div class="row" style="gap:8px;margin-top:14px"><button class="btn brand" style="flex:1" data-act="qzStart" type="button">' + $t('Neues Quiz') + '</button>' + (wrong.length ? '<button class="btn fog" style="flex:1" data-act="lcQueue" data-ids="' + wrong.join(',') + '" type="button">' + $t('Falsche üben') + '</button>' : '') + '</div></div>' +
    '<div class="card">' + QZ.items.map((q, k) => { const x = EVID.by[q.id], ok = QZ.ans[k] === q.ok; return '<button class="evrow" data-act="evOpen" data-ids="' + q.id + '" type="button"><span class="qzres ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓' : '✕') + '</span><span class="grow"><span class="t">' + esc(x.sl.q.q) + '</span><span class="small muted">' + esc(evCat(x.c)) + '</span></span></button>'; }).join('') + '</div></div>'; }
function qzFlask(f) { const top = 107 - 61 * f;
  return '<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true"><defs><clipPath id="qzfk"><path d="M48 14v32L22 94a9 9 0 0 0 8 13h60a9 9 0 0 0 8-13L72 46V14z"/></clipPath></defs><rect class="qzfill" x="0" y="' + top + '" width="120" height="120" fill="var(--ember)" clip-path="url(#qzfk)"/><path d="M44 14h32M48 14v32L22 94a9 9 0 0 0 8 13h60a9 9 0 0 0 8-13L72 46V14" fill="none" stroke="var(--charcoal)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
function qzAnswer(k) { const q = QZ.items[QZ.i]; if (QZ.ans.length > QZ.i) return; QZ.ans.push(k); const L = LRN(), x = EVID.by[q.id], ok = k === q.ok;
  const st = L.qs[x.c] || [0, 0]; L.qs[x.c] = [st[0] + (ok ? 1 : 0), st[1] + 1]; L.qa[q.id] = ok ? 1 : 0; if (!ok) L.box[q.id] = 0; else if (L.box[q.id] != null) L.box[q.id] = Math.min(4, L.box[q.id] + 1);
  if (QZ.ans.length === QZ.items.length) L.qn++; save(); render(); setTimeout(() => { const e = document.querySelector('.qzx'); if (e) e.parentNode.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 60); }

/* ---------- Seite „Quiz und Lernen“ ---------- */
function lrnGaps() { const L = LRN(); return Object.keys(L.qs).map(c => ({ c, r: L.qs[c][0], n: L.qs[c][1] })).filter(o => o.n >= 2 && o.r / o.n < .7 && EVID.cats[o.c]).sort((a, b) => a.r / a.n - b.r / b.n).slice(0, 3); }
function viewLernen(arg) { if (arg === 'quiz') return viewQuiz();
  if (!EVID) { loadEvid().then(() => { if (route.name === 'lernen') render(); }).catch(() => {}); return pageTop($t('Quiz und Lernen'), '', '') + '<div class="card"><p class="muted">' + $t('Lade …') + '</p></div>'; }
  const L = LRN(), lv = lrnLv(), LVN = typeof LV_NAMES === 'function' ? LV_NAMES()[lv] : { n: '' }; const fks = typeof flaskSvg === 'function' ? flaskSvg(lv, 16) : ''; const nDef = +S.settings.qzN || ({ 1: 3, 2: 4, 3: 5 })[lv];
  const tot = Object.values(L.qs).reduce((a, v) => [a[0] + v[0], a[1] + v[1]], [0, 0]); const known = Object.values(L.box).filter(v => v >= 3).length;
  const hero = '<div class="card qzhero"><div class="row" style="align-items:center;gap:14px;flex-wrap:nowrap"><div class="qzhf">' + qzFlask(lv === 1 ? .25 : lv === 2 ? .55 : 1) + '</div><div class="grow"><h2 style="margin:0">' + $t('Quiz') + '</h2><p class="small muted" style="margin:4px 0 0">' + $t('Kurze Runde mit Auswahlfragen. Mehr als die Hälfte aus deinen Karten, der Rest findet neue Lücken.') + '</p></div></div>' +
    '<p class="small" style="margin:12px 0 6px;font-weight:700">' + $t('Fragen') + '</p><div class="seg">' + [2, 3, 4, 5].map(k => '<button class="' + (k === nDef ? 'on' : '') + '" data-act="qzN" data-v="' + k + '" type="button">' + k + '</button>').join('') + '</div>' +
    '<button class="btn brand" style="width:100%;margin-top:12px" data-act="qzStart" type="button">' + $t('Quiz starten') + '</button>' +
    '<button class="linkbtn" style="margin-top:10px" data-act="lvOpen" type="button">' + fks + ' ' + $t('Schwierigkeit: ') + esc(LVN.n) + ' · ' + $t('ändern') + '</button></div>';
  const stats = '<div class="lrnst"><div><b>' + known + '</b><span>' + $t('Karten sitzen') + '</span></div><div><b>' + (tot[1] ? Math.round(tot[0] / tot[1] * 100) + ' %' : '–') + '</b><span>' + $t('richtig im Quiz') + '</span></div><div><b>' + L.qn + '</b><span>' + $t('Quizze') + '</span></div></div>';
  const gaps = lrnGaps(); const gapC = gaps.length ? '<div class="card"><h2>' + $t('Deine Lücken') + '</h2>' + gaps.map(g => '<div class="row" style="align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--rule);flex-wrap:nowrap">' + evIc(g.c, 34) + '<span class="grow"><b>' + esc(evCat(g.c)) + '</b><br><span class="small muted">' + g.r + $t(' von ') + g.n + $t(' richtig') + '</span></span><button class="btn sm brand" data-act="lcOpen" data-cat="' + g.c + '" type="button">' + $t('Üben') + '</button></div>').join('') + '</div>' : '';
  const tiles = EV_THEMES.map(t => t[1].filter(c => EVID.cats[c])).flat().map(c => { const [k, n] = lcKnown(c); return '<button class="evtile" data-act="lcOpen" data-cat="' + c + '" type="button" style="' + evVars(c) + ';border:0;font:inherit;text-align:left;cursor:pointer">' + evIc(c, 36) + '<b>' + esc(evCat(c)) + '</b><span class="lrnbar"><i style="width:' + Math.round(k / n * 100) + '%"></i></span><span class="small muted">' + k + ' / ' + n + '</span></button>'; }).join('');
  const cards = '<div class="card"><div class="row" style="align-items:center"><h2 class="grow" style="margin:0">' + $t('Lernkarten') + '</h2><button class="btn sm fog" data-act="lcOpen" data-cat="" type="button">' + $t('Alle mischen') + '</button></div><p class="small muted" style="margin:4px 0 0">' + $t('Frage lesen, überlegen, umdrehen. Was du schon weißt, kommt seltener.') + '</p><div class="evtiles">' + tiles + '</div></div>';
  const more = '<a class="card" href="#wissen" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit"><div class="grow"><h2 style="margin:0">' + $t('Wissen') + '</h2><p class="small muted" style="margin:2px 0 0">' + $t('Alle 321 Einträge mit Quellen durchsuchen.') + '</p></div><span class="muted">›</span></a>';
  return pageTop($t('Quiz und Lernen'), '', $t('Kurz üben, was die Studienlage sagt.')) + '<div class="stack">' + (LANG !== 'de' ? note('sky', $t('Die Inhalte gibt es bisher nur auf Deutsch.')) : '') + hero + stats + gapC + cards + more + '</div>'; }

(function () { const st = document.createElement('style'); st.textContent =
  '.fct{background:var(--ct)}.fct-tag{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--cc)}.fct-h{display:flex;gap:12px;align-items:flex-start;margin-top:12px}.fct-t{margin:0;font-weight:800;font-size:19px;line-height:1.25}' +
  '.fct-kn{margin-top:12px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.fct-kn b{font-size:30px;font-weight:800;color:var(--cc);line-height:1}.fct-kn span{font-weight:700;color:var(--graphite)}.fct-fd{margin:10px 0 0;color:var(--graphite)}' +
  '.lcchips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0 4px;margin-top:6px}.lcchips::-webkit-scrollbar{display:none}.lcchip{flex:0 0 auto;display:inline-flex;gap:5px;align-items:center;border:0;border-radius:999px;padding:7px 12px;background:var(--fog);font:inherit;font-size:13px;font-weight:700;cursor:pointer;color:var(--graphite)}.lcchip svg{color:var(--cc)}.lcchip.on{background:var(--charcoal);color:#fff}.lcchip.on svg{color:#fff}' +
  '.lcin{position:relative;min-height:300px;display:flex}.lcf{flex:1;border-radius:22px;padding:20px;display:flex;flex-direction:column;box-sizing:border-box;min-height:300px}.lcback{display:none}.lcflip.back .lcfront{display:none}.lcflip.back .lcback{display:flex;animation:lcturn .35s ease-out}@keyframes lcturn{from{transform:perspective(900px) rotateY(80deg);opacity:.4}}' +
  '.lcfront{background:linear-gradient(150deg,var(--cc),var(--cd));color:#fff;cursor:pointer}.lcic{width:40px;height:40px;border-radius:30%;background:rgba(255,255,255,.2);display:grid;place-items:center}.lccat{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;opacity:.9}' +
  '.lcq{font-size:22px;font-weight:800;line-height:1.3;margin:18px 0 0}.lchint{margin:auto 0 0;font-size:13px;font-weight:700;opacity:.8}' +
  '.lcback{background:var(--ct);border:2px solid var(--cc)}.lca{margin:0;color:var(--charcoal);font-size:20px;font-weight:800;line-height:1.3}.lckn{margin-top:12px}.lckn b{font-size:26px;color:var(--cc);font-weight:800}.lckn span{font-weight:700}.lcfd{margin:10px 0 14px}' +
  '.qzbar{display:flex;gap:6px}.qzbar i{flex:1;height:6px;border-radius:3px;background:var(--rule)}.qzbar i.cur{background:var(--charcoal)}.qzbar i.ok{background:var(--verdant)}.qzbar i.no{background:var(--signal)}' +
  '.qzc{background:var(--ct)}.qzk{margin:16px 0 0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--cc)}.qzq{font-size:21px;font-weight:800;line-height:1.3;margin:10px 0 0}.qzclaim{margin:10px 0 0;font-size:18px;font-weight:700;background:#fff;border-radius:14px;padding:12px}' +
  '.qzos{display:flex;flex-direction:column;gap:8px;margin-top:16px}.qzos.tf{flex-direction:row}.qzos.tf .qzo{flex:1;justify-content:center}.qzo{display:flex;gap:12px;align-items:center;text-align:left;border:2px solid transparent;background:#fff;border-radius:16px;padding:13px 14px;font:inherit;font-weight:700;cursor:pointer;color:var(--graphite)}' +
  '.qzl{flex:0 0 28px;height:28px;border-radius:50%;background:var(--fog);display:grid;place-items:center;font-size:13px;font-weight:800}.qzo.ok{border-color:var(--verdant);background:#e3f6ea}.qzo.ok .qzl{background:var(--verdant);color:#fff}.qzo.no{border-color:var(--signal);background:#ffe9e3}.qzo.no .qzl{background:var(--signal);color:#fff}.qzo.dim{opacity:.55}.qzo:disabled{cursor:default}' +
  '.qzx{margin-top:14px;border-radius:16px;padding:14px;background:#fff;border-left:5px solid var(--verdant)}.qzx.no{border-left-color:var(--signal)}.qzv{margin:0;font-weight:800;font-size:17px}.qzx.ok .qzv{color:var(--verdant-ink)}.qzx.no .qzv{color:var(--signal-ink)}' +
  '.qzres{flex:0 0 26px;height:26px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;font-size:13px}.qzres.ok{background:var(--verdant)}.qzres.no{background:var(--signal)}' +
  '.qzflask .qzfill{animation:qzup 1s ease-out}@keyframes qzup{from{transform:translateY(80px)}}.qzhf{flex:0 0 76px}.qzhf svg{width:76px;height:76px}' +
  '.lrnst{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.lrnst div{background:var(--fog);border-radius:16px;padding:12px;text-align:center}.lrnst b{display:block;font-size:24px;font-weight:800}.lrnst span{font-size:12px;color:var(--muted);font-weight:700}' +
  '.lrnbar{display:block;width:100%;height:5px;border-radius:3px;background:rgba(0,0,0,.08);overflow:hidden}.lrnbar i{display:block;height:100%;background:var(--cc)}';
  document.head.appendChild(st); })();

/* Einbindung: Heute (Fakt), Einstellungen (Fakt-Modus), Wissen (Verweis), Routing */
const _viewHeuteLrn = viewHeute; viewHeute = function () { const h = _viewHeuteLrn.apply(this, arguments); const c = factCard(); if (!c) return h; const i = h.lastIndexOf('</div>'); return i < 0 ? h + c : h.slice(0, i) + c + h.slice(i); };
const _viewMehrLrn = viewMehr; viewMehr = function () { const h = _viewMehrLrn(); if (VIEW) return h; const m = factMode();
  const card = '<div class="card"><h2>' + $t('Fakt des Tages') + '</h2><p class="small muted">' + $t('Jeden Tag eine kurze, geprüfte Aussage aus der Wissensbasis, passend zu deinem Ziel.') + (LANG !== 'de' ? ' ' + $t('Die Inhalte gibt es bisher nur auf Deutsch.') : '') + '</p><div class="seg" style="margin-top:10px">' +
    [['card', $t('Karte auf Heute')], ['popup', $t('Pop-up')], ['off', $t('Aus')]].map(o => '<button class="' + (m === o[0] ? 'on' : '') + '" data-act="factMode" data-v="' + o[0] + '" type="button">' + o[1] + '</button>').join('') + '</div></div>';
  const i = h.indexOf('<a class="card" href="#wissen"'); if (i < 0) return h; const j = h.indexOf('</a>', i) + 4; return h.slice(0, j) + card + h.slice(j); };
const _viewWissenLrn = viewWissen; viewWissen = function (arg) { const h = _viewWissenLrn(arg); const btn = '<a class="card" href="#lernen" style="display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit"><span class="qzhf" style="flex:0 0 44px">' + qzFlask(.55).replace(/width="120" height="120"/, 'width="44" height="44"') + '</span><div class="grow"><h2 style="margin:0">' + $t('Quiz und Lernen') + '</h2><p class="small muted" style="margin:2px 0 0">' + $t('Lernkarten und kurze Quizze zu diesen Themen.') + '</p></div><span class="muted">›</span></a>';
  const i = h.indexOf('<div class="card"><input id="ev-q"'); return i < 0 ? h : h.slice(0, i) + btn + h.slice(i); };
const _renderLrn = render; render = function () { const r = _renderLrn.apply(this, arguments); setTimeout(factPopup, 700); return r; };
window.addEventListener('hashchange', () => { if (route.name !== 'lernen' || route.arg !== 'quiz') { if (QZ && QZ.i >= QZ.items.length) QZ = null; } });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; const L = LRN();
  if (a === 'factHide') { if (L.day) L.day.hide = true; save(); render(); }
  else if (a === 'factNext') { const cur = L.day && L.day.id; const x = factPick(cur); if (x) { L.day = { d: today(), id: x.id }; L.seen = [x.id, ...L.seen.filter(i => i !== x.id)].slice(0, 200); save(); render(); } }
  else if (a === 'factMode') { S.settings.fact = b.dataset.v; save(); render(); }
  else if (a === 'lcOpen') { if (b.dataset.cat !== undefined) LC.cat = b.dataset.cat || null; LC.id = null; LC.queue = null; LC.quiz = false; lcSheet(); }
  else if (a === 'lcCat') { LC.cat = b.dataset.cat || null; LC.id = null; LC.queue = null; LC.n++; lcSheet(); }
  else if (a === 'lcOne') { LC.cat = null; LC.queue = null; LC.quiz = false; LC.id = b.dataset.id; LC.back = false; lcSheet(); }
  else if (a === 'lcQueue') { const ids = b.dataset.ids.split(','); LC.cat = null; LC.quiz = false; LC.id = ids.shift(); LC.queue = ids; LC.back = false; lcSheet(); }
  else if (a === 'lcFlip') { LC.back = !LC.back; lcSheet(); }
  else if (a === 'lcRate') { const cur = L.box[LC.id] || 0; L.box[LC.id] = b.dataset.v === '1' ? Math.min(4, cur + 1) : 0; save(); LC.n++; if (LC.quiz) { closeSheet(); qzNextQ(); return; } const nx = lcNext(); if (!nx) { closeSheet(); return; } LC.id = nx.id; LC.back = false; lcSheet(); if (route.name === 'lernen') { const v = $('#view'); const y = window.scrollY; v.innerHTML = viewBar() + viewLernen(route.arg); window.scrollTo(0, y); } }
  else if (a === 'qzN') { S.settings.qzN = +b.dataset.v; save(); render(); }
  else if (a === 'qzStart') { qzStart(+S.settings.qzN || 0); }
  else if (a === 'qzAns') { qzAnswer(+b.dataset.k); }
  else if (a === 'qzNext') { qzNextQ(); }
  else if (a === 'qzCard') { const q = QZ.items[QZ.i]; LC.cat = null; LC.queue = null; LC.quiz = true; LC.id = q.id; LC.back = true; lcSheet(); }
  else if (a === 'qzBack') { closeSheet(); qzNextQ(); } });
function qzNextQ() { if (!QZ) return; if (QZ.ans.length > QZ.i) QZ.i++; LC.quiz = false; render(true); }
if (['heute', 'mehr', 'wissen', 'lernen'].includes(route.name)) render();
