/* ======================= SUPERSÄTZE, TRIPLE-SETS, FÜLLSÄTZE ======================= */
/* Gruppen-Kennung im Feld sup (Plan) bzw. grp (freies Training, geplante Trainings).
   Modus gm: 'ss' = im Wechsel ohne Pause, Pause nach der Runde; 'fill' = in der Pause einer anderen Übung; 'fa' = Anker eines Füllsatzes. */
(function () { const st = document.createElement('style'); st.textContent =
  '.ex.ss-m{box-shadow:inset 4px 0 0 var(--ember)}.ex.ss-m.ss-fill{box-shadow:inset 4px 0 0 var(--sky)}' +
  '.stack>.ex.ss-m:not(.ss-last){margin-bottom:-10px}.ss-h{padding:14px 20px 0;font-size:14px;line-height:1.4}.ss-h b{color:var(--ember)}.ss-fill .ss-h b{color:var(--sky-ink,var(--sky))}' +
  '.set.ss-next{outline:2px solid var(--ember);outline-offset:-2px;border-radius:12px}' +
  '.pe-row.ss-m{box-shadow:inset 3px 0 0 var(--ember);padding-left:10px}.pe-row.ss-m.ss-fill{box-shadow:inset 3px 0 0 var(--sky)}.ss-ph{font-size:13px;margin:10px 0 0}.ss-ph b{color:var(--ember)}' +
  '.ss-link{display:flex;gap:6px;justify-content:center;align-items:center;margin:2px 0;flex-wrap:wrap}.ss-lbtn{border:0;background:none;font:inherit;font-size:13px;font-weight:700;color:var(--muted);padding:6px 10px;border-radius:999px;cursor:pointer}.ss-lbtn.on{color:var(--ember);background:var(--paper)}' +
  '.ss-pick{display:flex;gap:10px;align-items:center;width:100%;text-align:left;border:0;background:var(--fog);border-radius:14px;padding:10px 12px;margin-top:6px;font:inherit;color:inherit;cursor:pointer}.ss-pick.on{background:var(--ember);color:#fff}.ss-pick .ck{width:20px;height:20px;border-radius:6px;border:2px solid currentColor;flex:0 0 20px;display:grid;place-items:center;font-size:13px}';
  document.head.appendChild(st); })();

const ssNewId = () => 'G' + Math.random().toString(36).slice(2, 6).toUpperCase();
const ssName = (n, mode) => mode === 'fill' ? $t('Füllsatz') : n === 2 ? $t('Supersatz') : n === 3 ? $t('Triple-Set') : $t('Riesensatz');
const ssRestTxt = sec => sec >= 60 ? fmt(sec / 60) + $t(' min') : sec + $t(' s');
const ssExName = id => (LIB[id] || { name: id }).name;

/* Gruppen bestimmen: liefert pro Index { gid, letter, pos, n, mode, label, names, rest } oder null */
function ssInfo(items, getG, getM, getRest) { const by = {}, order = [];
  items.forEach((x, j) => { const g = getG(x); if (!g) return; if (!by[g]) { by[g] = []; order.push(g); } by[g].push(j); });
  const out = items.map(() => null); let n = 0;
  order.forEach(g => { let mem = by[g]; if (mem.length < 2) return; const letter = String.fromCharCode(65 + n++);
    const modes = mem.map(j => getM(items[j]) || ''); const fill = modes.some(m => m === 'fill' || m === 'fa');
    if (fill) { const a = mem.find(j => getM(items[j]) === 'fa'); if (a != null) mem = [a].concat(mem.filter(j => j !== a)); }
    const rest = Math.max(0, ...mem.map(j => num(getRest ? getRest(items[j]) : items[j].rest) || 0)) || 90;
    mem.forEach((j, p) => { out[j] = { gid: g, letter, pos: p + 1, n: mem.length, mode: fill ? 'fill' : 'ss', label: letter + (p + 1), names: mem.map(q => ssExName(items[q].ex)), rest, idx: mem }; }); });
  return out; }
function ssHeadText(g) { return g.mode === 'fill' ? '<b>' + $t('Füllsatz') + ' ' + g.letter + '</b> · ' + esc(g.names.slice(1).join(', ')) + $t(' in den Pausen von ') + esc(g.names[0])
  : '<b>' + ssName(g.n, 'ss') + ' ' + g.letter + '</b> · ' + $t('im Wechsel ohne Pause, Pause danach: ') + ssRestTxt(g.rest); }
function ssHeadHTML(g) { return '<p class="ss-ph">' + ssHeadText(g) + '</p>'; }

/* Plan-Einheit: heutige Zusatzübungen und Gruppen einrechnen, Gruppen zusammenrücken */
function sessAdjust(w, k, list) { const s = peekSess(w, k);
  if (s && s.extra && s.extra.length) list = list.concat(s.extra.filter(it => LIB[it.ex]).map(it => Object.assign({ note: '', sup: '', gm: '', type: 'dp', rest: 60 }, it, { xtra: true })));
  if (s && s.grp) list = list.map(x => s.grp[x.slot] ? Object.assign({}, x, { sup: s.grp[x.slot].g, gm: s.grp[x.slot].m || '' }) : x);
  return ssAnnotate(list); }
function ssAnnotate(list) { const info = ssInfo(list, x => x.sup, x => x.gm); const out = []; const seen = new Set();
  list.forEach((x, j) => { if (seen.has(j)) return; const g = info[j]; const idx = g ? g.idx : [j];
    idx.forEach(q => { seen.add(q); const gi = info[q]; out.push(Object.assign({}, list[q], { sup: gi ? gi.label : '', gid: gi ? gi.gid : '', ss: gi })); }); });
  return out; }

/* Pause nach einem Satz. true = erledigt (kein normaler Timer) */
function ssTimerOn() { return TM.end > Date.now() && !$('#timer').hidden; }
function ssFocus(id) { setTimeout(() => { const el = document.getElementById(id); if (!el) return; const row = el.closest('.set'); if (row) { row.classList.add('ss-next'); setTimeout(() => row.classList.remove('ss-next'), 3000); } try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} }, 60); }
function ssAfterSet(kind, o) {
  if (kind === 'plan') { const list = planFor(o.w, o.k); const me = list.find(x => x.slot === o.spec.slot); const g = me && me.ss; if (!g) return false;
    const mem = list.filter(x => x.ss && x.ss.gid === g.gid); const s = sess(o.w, o.k); const nSets = x => x.sets + (((s.logs[x.slot] || {}).extra) || 0); const done = (x, i) => { const l = s.logs[x.slot]; return !!(l && l.sets[i] && l.sets[i].done); };
    if (g.mode === 'fill') { if (g.pos === 1) return false; toast($t('Füllsatz erledigt') + (ssTimerOn() ? $t(', Pause läuft weiter') : '')); return true; }
    const nxt = mem.slice(g.pos).find(x => nSets(x) > o.i && !done(x, o.i));
    if (nxt) { toast($t('Weiter: ') + nxt.ss.label + ' ' + ssExName(actualEx(o.w, o.k, nxt))); ssFocus('s-' + nxt.slot + '-' + o.i + '-w'); return true; }
    startTimer(g.rest, ssName(g.n, 'ss') + ' ' + g.letter + $t(': Pause')); restNotify(g.rest, $t('Nächste Runde: ') + g.label.replace(/\d+$/, '1') + ' ' + ssExName(actualEx(o.w, o.k, mem[0])));
    const first = mem.find(x => nSets(x) > o.i + 1 && !done(x, o.i + 1)); if (first) ssFocus('s-' + first.slot + '-' + (o.i + 1) + '-w'); return true; }
  if (kind === 'free') { const ex = o.act.exercises; const info = ssInfo(ex, e => e.grp, e => e.gm); const g = info[o.idx]; if (!g) return false;
    if (g.mode === 'fill') { if (g.pos === 1) return false; toast($t('Füllsatz erledigt') + (ssTimerOn() ? $t(', Pause läuft weiter') : '')); return true; }
    const done = (j, i) => !!(ex[j].sets[i] && ex[j].sets[i].done); const nxt = g.idx.slice(g.pos).find(j => ex[j].sets.length > o.i && !done(j, o.i));
    if (nxt != null) { toast($t('Weiter: ') + info[nxt].label + ' ' + ssExName(ex[nxt].ex)); ssFocus('f-' + nxt + '-' + o.i + '-w'); return true; }
    startTimer(g.rest, ssName(g.n, 'ss') + ' ' + g.letter + $t(': Pause')); const first = g.idx.find(j => ex[j].sets.length > o.i + 1 && !done(j, o.i + 1)); if (first != null) ssFocus('f-' + first + '-' + (o.i + 1) + '-w'); return true; }
  return false; }

/* Karten markieren */
function ssMark(h, g, extraBtns) { if (g) { h = h.replace('<div class="ex" ', '<div class="ex ss-m ss-' + g.mode + (g.pos === 1 ? ' ss-first' : '') + (g.pos === g.n ? ' ss-last' : '') + '" ');
    if (g.pos === 1) h = h.replace(/(<div class="ex [^"]*" [^>]*>)/, '$1<div class="ss-h">' + ssHeadText(g) + '</div>'); }
  return extraBtns ? h.replace('<div class="ex-actions">', '<div class="ex-actions">' + extraBtns) : h; }
const _exCardSS = exCard;
exCard = function (w, k, spec) { const g = spec.ss;
  const btns = '<button class="btn sm" data-act="ssOpen" data-w="' + w + '" data-k="' + k + '" data-slot="' + spec.slot + '" type="button">' + (g ? $t('Supersatz ändern') : $t('Supersatz')) + '</button>' +
    (spec.xtra ? '<button class="btn sm" data-act="ssDelExtra" data-w="' + w + '" data-k="' + k + '" data-slot="' + spec.slot + '" type="button">' + $t('Entfernen') + '</button>' : '');
  return ssMark(_exCardSS(w, k, spec), g, btns); };
const _viewSessionSS = viewSession;
viewSession = function (key) { const h = _viewSessionSS(key); const m = key.match(RE_SESS); if (!m || !SESS[m[2]] || isCardio(m[2])) return h;
  return h.replace('<div class="card" id="endcard">', '<button class="btn block" data-act="ssAddToday" data-w="' + m[1] + '" data-k="' + m[2] + '" type="button">' + $t('+ Übung hinzufügen (nur heute)') + '</button><div class="card" id="endcard">'); };
const _freeExCardSS = freeExCard;
freeExCard = function (a, e, idx) { const g = ssInfo(a.exercises, x => x.grp, x => x.gm)[idx]; let h = _freeExCardSS(a, e, idx);
  if (g) h = h.replace('data-act="exInfo" data-ex="' + e.ex + '">', 'data-act="exInfo" data-ex="' + e.ex + '"><span class="sup">' + g.label + '</span>');
  h = ssMark(h, g, '');
  return h + ssLinkBar('fr', a.id, idx, a.exercises, x => x.grp, x => x.gm); };

/* Verbinden-Leiste zwischen zwei Zeilen (Plan-Editor, geplantes Training, freies Training) */
function ssLinkBar(kind, a, idx, items, getG, getM) { if (idx < 0 || idx >= items.length - 1) return '';
  getG = getG || (x => x.gid); getM = getM || (x => x.ss ? (x.ss.mode === 'fill' ? 'fill' : 'ss') : '');
  const info = kind === 'pe' ? items.map(x => x.ss || null) : ssInfo(items, getG, getM); const g = info[idx], g2 = info[idx + 1]; const on = !!(g && g2 && g.gid === g2.gid);
  const d = ' data-kind="' + kind + '" data-a="' + a + '" data-idx="' + idx + '"';
  let h = '<div class="ss-link"><button class="ss-lbtn' + (on ? ' on' : '') + '" data-act="ssLink"' + d + ' type="button">' + (on ? '⛓ ' + $t('verbunden · lösen') : '+ ' + $t('als Supersatz verbinden')) + '</button>';
  if (on && g.pos === 1) h += '<button class="ss-lbtn" data-act="ssLinkMode"' + d + ' type="button">' + (g.mode === 'fill' ? $t('Modus: in der Pause') : $t('Modus: im Wechsel')) + '</button>';
  return h + '</div>'; }
function ssLinkCompute(gs, idx) { const out = gs.slice(); const a = out[idx], b = out[idx + 1];
  if (a && a === b) { const left = [], right = []; out.forEach((g, j) => { if (g === a) (j <= idx ? left : right).push(j); }); const nid = ssNewId();
    if (left.length < 2) left.forEach(j => out[j] = ''); if (right.length < 2) right.forEach(j => out[j] = ''); else right.forEach(j => out[j] = nid); }
  else { const id = a || b || ssNewId(); out.forEach((g, j) => { if (b && g === b) out[j] = id; }); out[idx] = id; out[idx + 1] = id; }
  return out; }
/* Plan-Editor: Übungen nach Gruppen ordnen und beschriften */
const _peItemsSS = peItems;
peItems = function (i) { return ssAnnotate(_peItemsSS(i)); };
function peSetGroup(si, it, g, m) { const s = peSess(si); const add = peIsAdd(s, it.slot);
  if (add) { add.sup = g; add.gm = g ? m : ''; } else { s.ov = s.ov || {}; const o = s.ov[it.slot] = s.ov[it.slot] || {}; o.sup = g || '-'; if (g && m) o.gm = m; else delete o.gm; } PE.dirty = true; }
function ssApplyLink(kind, a, idx, modeToggle) {
  if (kind === 'pe') { const items = peItems(+a); const eff = items.map(x => x.ss ? x.gid : '');
    if (modeToggle) { const g = items[idx].ss; const nm = g.mode === 'fill' ? 'ss' : 'fill'; items.filter(x => x.ss && x.gid === g.gid).forEach((x, p) => peSetGroup(+a, x, x.gid, nm === 'fill' ? (p === 0 ? 'fa' : 'fill') : 'ss')); return; }
    const nx = ssLinkCompute(eff, idx); const modeOf = id => { const x = items.find(y => y.ss && y.gid === id); return x ? x.ss.mode : 'ss'; };
    const keep = eff[idx] ? modeOf(eff[idx]) : eff[idx + 1] ? modeOf(eff[idx + 1]) : 'ss';
    items.forEach((x, j) => { if (nx[j] === eff[j]) return; peSetGroup(+a, x, nx[j], nx[j] ? (keep === 'fill' ? (nx.indexOf(nx[j]) === j ? 'fa' : 'fill') : 'ss') : ''); }); return; }
  const list = kind === 'wo' ? ((S.workouts || []).find(o => o.id === a) || {}).items : (findAct(a) || {}).exercises; if (!list) return;
  const info = ssInfo(list, x => x.grp, x => x.gm); const eff = list.map((x, j) => info[j] ? x.grp : '');
  if (modeToggle) { const g = info[idx]; const nm = g.mode === 'fill' ? 'ss' : 'fill'; g.idx.forEach((j, p) => list[j].gm = nm === 'fill' ? (p === 0 ? 'fa' : 'fill') : 'ss'); return; }
  const nx = ssLinkCompute(eff, idx); const keepMode = eff[idx] && info[idx] ? info[idx].mode : eff[idx + 1] && info[idx + 1] ? info[idx + 1].mode : 'ss';
  list.forEach((x, j) => { if (nx[j] === eff[j]) return; x.grp = nx[j]; x.gm = nx[j] ? (keepMode === 'fill' ? (nx.indexOf(nx[j]) === j ? 'fa' : 'fill') : 'ss') : ''; }); }

/* Sheet in der laufenden Einheit */
function ssSheet() { const o = ui.ss; const list = planFor(o.w, o.k); const me = list.find(x => x.slot === o.slot); if (!me) return closeSheet();
  const others = list.filter(x => x.slot !== o.slot); const xtraSel = [...o.sel].some(sl => (list.find(x => x.slot === sl) || {}).xtra) || me.xtra;
  const seg = (act, cur, opts) => '<div class="seg">' + opts.map(p => '<button class="' + (cur === p[0] ? 'on' : '') + '" data-act="' + act + '" data-v="' + p[0] + '" type="button">' + p[1] + '</button>').join('') + '</div>';
  openSheet(sheetHead($t('Supersatz')) + '<div class="on-white" style="margin-top:8px"><p class="small"><b>' + esc(ssExName(actualEx(o.w, o.k, me))) + '</b> ' + $t('verbinden mit:') + '</p>' +
    others.map(x => { const on = o.sel.has(x.slot); return '<button class="ss-pick' + (on ? ' on' : '') + '" data-act="ssTog" data-slot="' + x.slot + '" type="button"><span class="ck">' + (on ? '✓' : '') + '</span><span class="grow"><b>' + esc(ssExName(actualEx(o.w, o.k, x))) + '</b><br><span class="small" style="opacity:.8">' + x.sets + ' × ' + esc(x.reps) + (x.ss && x.slot !== o.slot && !on ? ' · ' + $t('schon in ') + x.ss.label.replace(/\d+$/, '') : '') + (x.xtra ? ' · ' + $t('nur heute') : '') + '</span></span></button>'; }).join('') +
    '<button class="btn block" style="margin-top:8px" data-act="ssAddNew" type="button">' + $t('+ Neue Übung dazunehmen') + '</button>' +
    '<p class="small" style="margin:14px 0 6px;font-weight:700">' + $t('Ablauf') + '</p>' + seg('ssMode', o.mode, [['ss', $t('Im Wechsel')], ['fill', $t('In der Pause')]]) +
    '<p class="small muted" style="margin-top:6px">' + (o.mode === 'fill' ? $t('Füllsatz: Die anderen Übungen machst du in der Pause von ') + '<b>' + esc(ssExName(actualEx(o.w, o.k, me))) + '</b>' + $t('. Der Pausen-Timer läuft dabei weiter.') : $t('Supersatz (2), Triple-Set (3) oder Riesensatz (4+): alle Übungen direkt nacheinander, Pause erst nach der Runde. Die App springt zum nächsten Satz.')) + '</p>' +
    '<p class="small" style="margin:14px 0 6px;font-weight:700">' + $t('Gilt für') + '</p>' + seg('ssScope', o.scope, [['today', $t('Nur heute')], ['always', $t('Dauerhaft im Plan')]]) +
    (o.scope === 'always' && xtraSel ? '<p class="small muted" style="margin-top:6px">' + $t('Neu dazugenommene Übungen kommen dann fest in diese Einheit.') + '</p>' : '') +
    '<div class="row" style="margin-top:16px">' + (me.ss ? '<button class="btn" data-act="ssUnlink" type="button">' + $t('Verbindung lösen') + '</button>' : '') + '<div class="grow"></div><button class="btn brand" data-act="ssSave" type="button"' + (o.sel.size ? '' : ' disabled') + '>' + $t('Speichern') + '</button></div></div>'); }
function ssOpen(w, k, slot) { const list = planFor(w, k); const me = list.find(x => x.slot === slot); const mem = me && me.ss ? list.filter(x => x.ss && x.ss.gid === me.ss.gid) : [];
  ui.ss = { w, k, slot, sel: new Set(mem.map(x => x.slot).filter(sl => sl !== slot)), mode: me && me.ss ? me.ss.mode : 'ss', scope: 'today' }; ssSheet(); }
function ssStore(members, mode) { const o = ui.ss; const list = planFor(o.w, o.k); const s = sess(o.w, o.k); const me = list.find(x => x.slot === o.slot);
  const old = me && me.ss ? list.filter(x => x.ss && x.ss.gid === me.ss.gid).map(x => x.slot) : [];
  const gid = members.length >= 2 ? ssNewId() : ''; const modeFor = sl => !gid ? '' : mode === 'fill' ? (sl === o.slot ? 'fa' : 'fill') : 'ss';
  const touched = [...new Set(old.concat(members))];
  if (o.scope === 'always') { const ps = S.plan.sessions.find(x => x.k === o.k); if (!ps) return;
    touched.forEach(sl => { const g = members.includes(sl) ? gid : ''; const m = members.includes(sl) ? modeFor(sl) : '';
      const ex = (s.extra || []).find(x => x.slot === sl);
      if (ex) { if (!g) return; ps.add = ps.add || []; ps.add.push(Object.assign({}, ex, { sup: g, gm: m })); s.extra = s.extra.filter(x => x.slot !== sl); }
      else { const add = (ps.add || []).find(x => x.slot === sl); if (add) { add.sup = g; add.gm = m; } else { ps.ov = ps.ov || {}; const ov = ps.ov[sl] = ps.ov[sl] || {}; ov.sup = g || '-'; if (m) ov.gm = m; else delete ov.gm; } }
      if (s.grp) delete s.grp[sl]; });
    if (typeof AUTH !== 'undefined' && AUTH && typeof pushPlan === 'function') pushPlan(AUTH.uid, S.plan).then(t2 => { S.meta.planAt = t2; persist(); }).catch(() => {}); }
  else { s.grp = s.grp || {}; touched.forEach(sl => { s.grp[sl] = members.includes(sl) ? { g: gid, m: modeFor(sl) } : { g: '' }; }); }
  save(); closeSheet(); render(); }

/* Klicks. Capture-Phase, damit die Übungsauswahl mit eigenem Ziel nicht im freien Training landet */
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'freePickEx' && /^(ss|sx):/.test(b.dataset.aid || '')) { e.stopPropagation(); e.preventDefault(); const [kind, w, k] = b.dataset.aid.split(':'); const s = sess(+w, k); s.extra = s.extra || [];
    const it = { slot: 't_' + uid(), ex: b.dataset.ex, sets: 3, reps: '10–15', rpe: 8, rest: 60, type: 'dp', note: '' }; s.extra.push(it); markStarted(+w, k); save();
    if (kind === 'ss' && ui.ss) { ui.ss.sel.add(it.slot); ssSheet(); } else { closeSheet(); render(); toast($t('Übung für heute hinzugefügt')); } return; } }, true);
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; if (!a.startsWith('ss')) return;
  switch (a) {
    case 'ssOpen': ssOpen(+b.dataset.w, b.dataset.k, b.dataset.slot); break;
    case 'ssTog': { const sl = b.dataset.slot; if (ui.ss.sel.has(sl)) ui.ss.sel.delete(sl); else ui.ss.sel.add(sl); ssSheet(); break; }
    case 'ssMode': ui.ss.mode = b.dataset.v; ssSheet(); break;
    case 'ssScope': ui.ss.scope = b.dataset.v; ssSheet(); break;
    case 'ssAddNew': exPickSheet('ss:' + ui.ss.w + ':' + ui.ss.k); break;
    case 'ssAddToday': exPickSheet('sx:' + b.dataset.w + ':' + b.dataset.k); break;
    case 'ssSave': { const list = planFor(ui.ss.w, ui.ss.k); const members = list.map(x => x.slot).filter(sl => sl === ui.ss.slot || ui.ss.sel.has(sl)); ssStore(members, ui.ss.mode);
      toast(members.length >= 2 ? ssName(members.length, ui.ss.mode) + (ui.ss.scope === 'always' ? $t(' im Plan gespeichert') : $t(' für heute')) : $t('Verbindung gelöst')); break; }
    case 'ssUnlink': ssStore([], 'ss'); toast($t('Verbindung gelöst')); break;
    case 'ssDelExtra': { const w = +b.dataset.w, k = b.dataset.k, sl = b.dataset.slot; const s = sess(w, k); const lg = s.logs[sl];
      if (lg && (lg.sets || []).some(x => x && x.done) && !b.dataset.sure) { b.dataset.sure = '1'; b.textContent = $t('Mit Sätzen löschen?'); b.classList.add('danger'); break; }
      s.extra = (s.extra || []).filter(x => x.slot !== sl); delete s.logs[sl]; if (s.grp) delete s.grp[sl]; save(); render(); break; }
    case 'ssLink': case 'ssLinkMode': { const kind = b.dataset.kind; ssApplyLink(kind, b.dataset.a, +b.dataset.idx, a === 'ssLinkMode');
      if (kind === 'pe') { if (typeof markPeDirty === 'function') markPeDirty(); } else save(); render(); break; }
  } });
if (['training', 'frei', 'workout', 'plan'].includes(route.name)) render();
