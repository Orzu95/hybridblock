/* Hybridblock – Desktop D5: Plan-Editor breit (ab 1200 px)
   Links Übungsbibliothek (Suche, Muskel-Filter, „+“ in die gewählte Einheit, Ziehen in eine Einheit),
   Mitte die Einheiten als Wochenraster nebeneinander (Übungen per Ziehen sortieren oder in eine andere Einheit verschieben),
   rechts die Plan-Prüfung live. Strg+Z / Cmd+Z nimmt die letzte Änderung zurück (Autosave-Entwurf gibt es schon in coach.js).
   Unter 1200 px bleibt der Editor einspaltig. Die Karten kommen unverändert aus viewPlan und werden nur umgestellt. */
'use strict';
const PW_MQ = window.matchMedia ? window.matchMedia('(min-width:1200px)') : { matches: false };
const pwOn = () => !!(PW_MQ.matches && route && route.name === 'plan' && PE.draft && PE.uid === planTarget(route.arg));
const PW = { q: '', m: '', sel: 0 };
function pwGymIdx() {
  return (PE.draft.sessions || []).map((s, i) => (s.kind === 'gym' ? i : -1)).filter(i => i >= 0);
}
function pwSel() {
  const g = pwGymIdx();
  return g.includes(PW.sel) ? PW.sel : g[0] ?? -1;
}
function pwLibList() {
  const q = PW.q.trim().toLowerCase(),
    m = PW.m;
  const L = Object.values(LIB)
    .filter(e => (!m || (e.muscles[m] || 0) >= 1) && (!q || e.name.toLowerCase().includes(q) || Object.keys(e.muscles).some(k => MUSCLES[k].toLowerCase().includes(q))))
    .sort((a, b) => (isPrio(b.id) ? 1 : 0) - (isPrio(a.id) ? 1 : 0) || a.name.localeCompare(b.name))
    .slice(0, 120);
  if (!L.length) return '<p class="small muted" style="margin:8px 4px">' + $t('Keine Übung gefunden.') + '</p>';
  return L.map(
    e =>
      '<div class="pw-ex" draggable="true" data-pwex="' +
      e.id +
      '"><div class="grow"><b>' +
      esc(e.name) +
      '</b><small>' +
      Object.keys(e.muscles)
        .filter(k => e.muscles[k] >= 1)
        .map(k => MUSCLES[k])
        .join(', ') +
      '</small></div><button class="pw-add" data-act="pwAdd" data-ex="' +
      e.id +
      '" type="button" aria-label="' +
      esc($tf('{n} hinzufügen', { n: e.name })) +
      '">+</button></div>'
  ).join('');
}
function pwLib() {
  const si = pwSel();
  const s = si >= 0 ? PE.draft.sessions[si] : null;
  return (
    '<aside class="pw-lib"><div class="card"><h2 style="margin:0 0 8px">' +
    $t('Übungen') +
    '</h2><input id="pw-q" type="search" placeholder="' +
    esc($t('Übung oder Muskel suchen')) +
    '" value="' +
    esc(PW.q) +
    '" style="width:100%"><div class="pw-mus">' +
    ['', ...Object.keys(MUSCLES)]
      .map(k => '<button class="chip-btn' + (PW.m === k ? ' on' : '') + '" data-act="pwMus" data-v="' + k + '" type="button">' + esc(k ? MUSCLES[k] : $t('Alle')) + '</button>')
      .join('') +
    '</div><p class="small muted" style="margin:8px 0 6px">' +
    (s
      ? esc($tf('„+“ fügt zu {s} hinzu. Oder in eine Einheit ziehen.', { s: (s.title || $t('Einheit ') + s.k).trim() }))
      : esc($t('Leg zuerst eine Kraft-Einheit an.'))) +
    '</p><div class="pw-list" id="pw-list">' +
    pwLibList() +
    '</div></div></aside>'
  );
}
/* Übung in Einheit i einfügen (wie „+ Übung“ im Editor), optional vor Slot */
function pwInsert(i, ex, before) {
  const s = peSess(i);
  if (!s || PE.draft.sessions[i].kind !== 'gym') return false;
  s.add = s.add || [];
  const slot = 'x_' + uid();
  s.add.push({ slot, ex, sets: 3, reps: '8–12', rpe: 8, rest: 90, type: 'dp', note: '', sup: '' });
  if (before) pwOrder(i, slot, before);
  PE.dirty = true;
  return slot;
}
/* Reihenfolge: slot vor `before` setzen (before = '' → ans Ende) */
function pwOrder(i, slot, before) {
  const s = PE.draft.sessions[i];
  const w = PE.wk || 0,
    wkp = w && PE.draft.wkPlans && PE.draft.wkPlans[w] && PE.draft.wkPlans[w][s.k];
  const slots = peItems(i)
    .map(x => x.slot)
    .filter(x => x !== slot);
  const at = before ? slots.indexOf(before) : -1;
  if (at < 0) slots.push(slot);
  else slots.splice(at, 0, slot);
  if (wkp) {
    const by = new Map((wkp.add || []).map(x => [x.slot, x]));
    wkp.add = slots
      .map(sl => by.get(sl))
      .filter(Boolean)
      .concat((wkp.add || []).filter(x => !slots.includes(x.slot)));
  } else s.ord = slots;
  PE.dirty = true;
}
/* Übung aus Einheit a in Einheit b verschieben (Werte bleiben, Supersatz wird gelöst) */
function pwMove(a, slot, b, before) {
  if (a === b) return pwOrder(a, slot, before);
  const it = peItems(a).find(x => x.slot === slot);
  if (!it) return;
  const nslot = pwInsert(b, it.ex, before);
  if (!nslot) return;
  const ns = (peSess(b).add || []).find(x => x.slot === nslot);
  ['sets', 'reps', 'rpe', 'rest', 'note'].forEach(f => {
    if (it[f] != null && it[f] !== '') ns[f] = it[f];
  });
  if (it.type === 'main' || it.type === 'bo') ns.type = 'main';
  const s = peSess(a);
  const add = peIsAdd(s, slot);
  if (add) s.add = s.add.filter(x => x.slot !== slot);
  else {
    s.ov = s.ov || {};
    s.ov[slot] = Object.assign(s.ov[slot] || {}, { del: true });
  }
  PE.dirty = true;
}

/* ---------- Layout nach dem Rendern ---------- */
function pwArrange() {
  if (document.querySelector('.pw-grid')) return;
  const first = document.querySelector('.pe-sess');
  const app = first && first.parentNode;
  if (!app) return;
  const cards = Array.from(app.querySelectorAll(':scope > .pe-sess'));
  const week = document.createElement('div');
  week.className = 'pw-week';
  app.insertBefore(week, cards[0]);
  const sel = pwSel();
  cards.forEach((c, i) => {
    c.dataset.pwi = i;
    if (PE.draft.sessions[i] && PE.draft.sessions[i].kind === 'gym') c.classList.add('pw-drop');
    if (i === sel) c.classList.add('pw-on');
    week.appendChild(c);
    /* Übungszeilen ziehbar (nicht in Supersätzen) */
    const its = PE.draft.sessions[i] && PE.draft.sessions[i].kind === 'gym' ? peItems(i) : [];
    c.querySelectorAll('.pe-row').forEach((r, j) => {
      const it = its[j];
      if (!it) return;
      r.dataset.slot = it.slot;
      if (it.ss) return;
      r.draggable = true;
      r.classList.add('pw-drag');
    });
  });
  const add = app.querySelector(':scope > .row [data-act="peAddSess"]');
  if (add) week.appendChild(add.closest('.row')).classList.add('pw-addcol');
  const grid = document.createElement('div');
  grid.className = 'pw-grid';
  app.parentNode.insertBefore(grid, app);
  grid.insertAdjacentHTML('beforeend', pwLib());
  const main = document.createElement('section');
  main.className = 'pw-main';
  main.appendChild(app);
  grid.appendChild(main);
  const side = document.createElement('aside');
  side.className = 'pw-side';
  const chk = app.querySelector('.chk-card');
  if (chk) side.appendChild(chk);
  /* Name, Vorlage, Nachricht an den Athleten rechts, damit das Wochenraster oben steht */
  const nm = document.getElementById('pe-name');
  const nc = nm && nm.closest('.card');
  if (nc && nc.parentNode === app) side.appendChild(nc);
  side.insertAdjacentHTML(
    'beforeend',
    '<p class="small muted" style="margin:4px">' + $t('Strg+Z nimmt die letzte Änderung zurück. Ungespeicherte Änderungen bleiben als Entwurf auf diesem Gerät.') + '</p>'
  );
  grid.appendChild(side);
}
hbWrap('render', 'planwide', function (__next) {
  const q = document.getElementById('pw-q');
  const foc = q && document.activeElement === q;
  const lst = document.getElementById('pw-list'),
    sc = lst ? lst.scrollTop : 0;
  const wk = document.querySelector('.pw-week'),
    wsc = wk ? wk.scrollLeft : 0;
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  queueMicrotask(() => {
    const on = pwOn();
    if (document.body) document.body.classList.toggle('dk-pe', on);
    if (!on) return;
    try {
      pwArrange();
      const l2 = document.getElementById('pw-list');
      if (l2) l2.scrollTop = sc;
      const w2 = document.querySelector('.pw-week');
      if (w2) w2.scrollLeft = wsc;
      if (foc) {
        const q2 = document.getElementById('pw-q');
        q2.focus();
        q2.setSelectionRange(q2.value.length, q2.value.length);
      }
    } catch (e) {
      logErr('planwide:arrange', e);
    }
  });
  return r;
});
if (PW_MQ.addEventListener)
  PW_MQ.addEventListener('change', () => {
    if (route && route.name === 'plan') render();
  });

/* ---------- Bedienung ---------- */
document.addEventListener('click', e => {
  if (!pwOn()) return;
  const b = e.target.closest('[data-act]');
  if (b && b.dataset.act === 'pwAdd') {
    const si = pwSel();
    if (si < 0) return toast($t('Leg zuerst eine Kraft-Einheit an.'));
    pwInsert(si, b.dataset.ex);
    render();
    toast($tf('{n} hinzugefügt', { n: (LIB[b.dataset.ex] || {}).name || '' }));
    return;
  }
  if (b && b.dataset.act === 'pwMus') {
    PW.m = b.dataset.v;
    render();
    return;
  }
  /* Klick in eine Kraft-Einheit wählt sie als Ziel für „+“ */
  const card = e.target.closest('.pe-sess.pw-drop');
  if (card && +card.dataset.pwi !== pwSel()) {
    PW.sel = +card.dataset.pwi;
    document.querySelectorAll('.pe-sess.pw-on').forEach(x => x.classList.remove('pw-on'));
    card.classList.add('pw-on');
    const p = document.querySelector('.pw-lib p.small');
    const s = PE.draft.sessions[PW.sel];
    if (p && s) p.textContent = $tf('„+“ fügt zu {s} hinzu. Oder in eine Einheit ziehen.', { s: (s.title || $t('Einheit ') + s.k).trim() });
  }
});
let pwT = null;
document.addEventListener('input', e => {
  if (e.target.id !== 'pw-q') return;
  PW.q = e.target.value;
  clearTimeout(pwT);
  pwT = setTimeout(() => {
    const l = document.getElementById('pw-list');
    if (l) l.innerHTML = pwLibList();
  }, 120);
});
/* Ziehen und Ablegen */
let pwDrag = null;
document.addEventListener('dragstart', e => {
  const ex = e.target.closest && e.target.closest('[data-pwex]');
  const row = e.target.closest && e.target.closest('.pe-row.pw-drag');
  if (!ex && !row) return;
  if (row && /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '') && row.contains(document.activeElement)) {
    e.preventDefault();
    return;
  }
  pwDrag = ex ? { ex: ex.dataset.pwex } : { from: +row.closest('.pe-sess').dataset.pwi, slot: row.dataset.slot };
  try {
    e.dataTransfer.setData('text/plain', ex ? ex.dataset.pwex : row.dataset.slot);
    e.dataTransfer.effectAllowed = ex ? 'copy' : 'move';
  } catch (er) {}
  (row || ex).classList.add('pw-dragging');
});
document.addEventListener('dragend', () => {
  pwDrag = null;
  document.querySelectorAll('.pw-dragging,.pw-over,.pw-before').forEach(x => x.classList.remove('pw-dragging', 'pw-over', 'pw-before'));
});
function pwTarget(e) {
  const card = e.target.closest && e.target.closest('.pe-sess.pw-drop');
  if (!card) return null;
  const rows = Array.from(card.querySelectorAll('.pe-row[data-slot]'));
  const before = rows.find(r => {
    const b = r.getBoundingClientRect();
    return e.clientY < b.top + b.height / 2;
  });
  return { card, i: +card.dataset.pwi, before: before ? before.dataset.slot : '', el: before };
}
document.addEventListener('dragover', e => {
  if (!pwDrag) return;
  const t = pwTarget(e);
  document.querySelectorAll('.pw-over,.pw-before').forEach(x => x.classList.remove('pw-over', 'pw-before'));
  if (!t) return;
  e.preventDefault();
  t.card.classList.add('pw-over');
  if (t.el) t.el.classList.add('pw-before');
});
document.addEventListener('drop', e => {
  if (!pwDrag) return;
  const t = pwTarget(e);
  const d = pwDrag;
  pwDrag = null;
  if (!t) return;
  e.preventDefault();
  if (d.ex) pwInsert(t.i, d.ex, t.before);
  else if (d.slot !== t.before) pwMove(d.from, d.slot, t.i, t.before);
  PW.sel = t.i;
  render();
  if (typeof peTrack === 'function') setTimeout(peTrack, 0);
});
/* Strg+Z / Cmd+Z: letzte Änderung zurück (nutzt den vorhandenen Verlauf des Editors) */
document.addEventListener('keydown', e => {
  if (route.name !== 'plan' || !(e.ctrlKey || e.metaKey) || e.shiftKey || e.key.toLowerCase() !== 'z') return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && t.value) return;
  const u = document.querySelector('[data-act=peUndo]');
  if (u && !u.disabled) {
    e.preventDefault();
    u.click();
  }
});
