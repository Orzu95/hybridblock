/* Hybridblock – Reihenfolge der Übungen und Supersätze im eigenen Plan
   - Reihenfolge: dauerhaft in plan.sessions[].ord (alle Wochen, auch im Plan-Editor), nur heute in sess(w,k).ord.
     Supersätze wandern als Block. Unbekannte Übungen bleiben an ihrem Platz.
   - Supersatz dauerhaft gespeichert → Vorschlag, dieselbe Kombination in anderen Einheiten zu übernehmen.
   - Alles ändert nur den eigenen Plan (Kopie); die Bibliothek bleibt unverändert. „Original wiederherstellen“ pro Einheit. */
'use strict';
function applyOrd(list, ord) {
  if (!ord || !ord.length || !list.length) return list;
  const pos = new Map(ord.map((sl, i) => [sl, i]));
  const idx = [],
    known = [];
  list.forEach((x, i) => {
    if (pos.has(x.slot)) {
      idx.push(i);
      known.push(x);
    }
  });
  if (known.length < 2) return list;
  known.sort((a, b) => pos.get(a.slot) - pos.get(b.slot));
  const out = list.slice();
  idx.forEach((i, j) => {
    out[i] = known[j];
  });
  return out;
}
hbFilter('planForP', 'exorder', function (__v, plan, w, k) {
  const list = __v;
  const s = plan && plan.sessions && plan.sessions.find(x => x.k === k);
  if (!s || !s.ord) return list;
  if (plan.wkPlans && plan.wkPlans[w] && plan.wkPlans[w][k]) return list;
  return applyOrd(list, s.ord);
});
const _sessAdjustOrd = sessAdjust;
sessAdjust = function (w, k, list) {
  list = _sessAdjustOrd.apply(this, arguments);
  const s = peekSess(w, k);
  return s && s.ord ? applyOrd(list, s.ord) : list;
};
/* Blöcke: Supersatz-Mitglieder bleiben zusammen */
function ordBlocks(list) {
  const out = [];
  list.forEach(x => {
    const g = (x.ss && x.ss.gid) || '';
    const last = out[out.length - 1];
    if (g && last && last.g === g) last.items.push(x);
    else out.push({ g, items: [x] });
  });
  return out;
}
function ordMove(blocks, bi, d) {
  const j = bi + d;
  if (j < 0 || j >= blocks.length) return blocks;
  const b = blocks.slice();
  [b[bi], b[j]] = [b[j], b[bi]];
  return b;
}
const ORIG_NOTE = () =>
  '<p class="small muted" style="margin-top:10px">' + $t('Gilt nur für deinen Plan. Die Vorlage in der Bibliothek bleibt unverändert.') + '</p>';
function planOrig(k) {
  const id = S.plan && S.plan.tpl;
  if (!id || !PLAN_TPL[id] || id === 'blank') return null;
  try {
    return makePlan(id).sessions.find(x => x.k === k) || null;
  } catch (e) {
    return null;
  }
}
function pushOwn() {
  if (typeof AUTH !== 'undefined' && AUTH && typeof pushPlan === 'function' && !(typeof VIEW !== 'undefined' && VIEW))
    pushPlan(AUTH.uid, S.plan)
      .then(t2 => {
        S.meta.planAt = t2;
        persist();
      })
      .catch(() => {});
}

/* ---------- Training: Reihenfolge ändern ---------- */
function ordSheet() {
  const o = ui.ord;
  const L = o.blocks;
  const name = it => esc(LIB[actualEx(o.w, o.k, it)] ? LIB[actualEx(o.w, o.k, it)].name : it.ex);
  const rows = L.map(
    (b, i) =>
      '<div class="ord-row' +
      (b.g ? ' ss' : '') +
      '"><span class="ord-n">' +
      (i + 1) +
      '</span><div class="grow">' +
      b.items.map(name).join('<br>') +
      (b.g ? '<div class="small t-ember">' + esc(ssName(b.items.length, b.items[0].ss.mode)) + '</div>' : '') +
      '</div>' +
      '<button class="btn sm" data-act="ordMv" data-i="' +
      i +
      '" data-v="-1" type="button"' +
      (i ? '' : ' disabled') +
      ' aria-label="' +
      esc($t('Nach oben')) +
      '">↑</button><button class="btn sm" data-act="ordMv" data-i="' +
      i +
      '" data-v="1" type="button"' +
      (i < L.length - 1 ? '' : ' disabled') +
      ' aria-label="' +
      esc($t('Nach unten')) +
      '">↓</button></div>'
  ).join('');
  const seg =
    '<div class="seg" style="margin:12px 0 0">' +
    [
      ['today', $t('Nur heute')],
      ['always', $t('Dauerhaft im Plan')]
    ]
      .map(([v, l]) => '<button class="' + (o.scope === v ? 'on' : '') + '" data-act="ordScope" data-v="' + v + '" type="button">' + esc(l) + '</button>')
      .join('') +
    '</div>';
  const orig = planOrig(o.k);
  openSheet(
    sheetHead($t('Reihenfolge')) +
      '<div class="ord-list">' +
      rows +
      '</div>' +
      seg +
      (o.scope === 'always' ? ORIG_NOTE() : '') +
      '<div class="row" style="margin-top:14px;gap:8px;flex-wrap:wrap">' +
      (orig
        ? ui.ordRestore
          ? '<button class="btn sm dark" data-act="ordRestoreYes" type="button">' + $t('Ja, Original für diese Einheit') + '</button>'
          : '<button class="btn sm" data-act="ordRestore" type="button">' + $t('Original wiederherstellen') + '</button>'
        : '') +
      '<div class="grow"></div><button class="btn brand" data-act="ordSave" type="button">' +
      $t('Übernehmen') +
      '</button></div>' +
      (ui.ordRestore
        ? '<p class="small muted" style="margin-top:6px">' +
          $t('Setzt Reihenfolge, Supersätze und Übungsänderungen dieser Einheit auf die Vorlage zurück. Deine eingetragenen Sätze bleiben.') +
          '</p>'
        : '')
  );
}
function ordOpen(w, k) {
  ui.ordRestore = false;
  ui.ord = { w, k, scope: 'today', blocks: ordBlocks(planFor(w, k)) };
  ordSheet();
}
function ordSave() {
  const o = ui.ord;
  const slots = o.blocks.flatMap(b => b.items.map(x => x.slot));
  const s = sess(o.w, o.k);
  if (o.scope === 'always') {
    const ps = S.plan.sessions.find(x => x.k === o.k);
    if (!ps) return;
    ps.ord = slots;
    delete s.ord;
    pushOwn();
    toast($t('Reihenfolge im Plan gespeichert'));
  } else {
    s.ord = slots;
    toast($t('Reihenfolge für heute geändert'));
  }
  save();
  closeSheet();
  render();
}
function ordRestore() {
  const o = ui.ord;
  const orig = planOrig(o.k);
  const ps = S.plan.sessions.find(x => x.k === o.k);
  if (!orig || !ps) return;
  ['ov', 'add', 'ord'].forEach(f => {
    if (orig[f] != null) ps[f] = JSON.parse(JSON.stringify(orig[f]));
    else delete ps[f];
  });
  const s = sess(o.w, o.k);
  delete s.ord;
  delete s.grp;
  pushOwn();
  save();
  ui.ordRestore = false;
  closeSheet();
  toast($t('Einheit auf die Vorlage zurückgesetzt'));
  render();
}
hbWrap('viewSession', 'exorder', function (__next, key) {
  const h = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  const m = String(key || '').match(RE_SESS);
  if (!m || !SESS[m[2]] || !isGym(m[2]) || (typeof VIEW !== 'undefined' && VIEW)) return h;
  const btn =
    '<div class="row" style="justify-content:flex-end;margin:-4px 0 8px"><button class="btn sm" data-act="ordOpen" data-w="' +
    m[1] +
    '" data-k="' +
    m[2] +
    '" type="button">⇅ ' +
    $t('Reihenfolge') +
    '</button></div>';
  const i = hbAt(h, '<div class="ex', 'exorder');
  return i < 0 ? h : h.slice(0, i) + btn + h.slice(i);
});

/* ---------- Plan-Editor: ↑ ↓ pro Übung ---------- */
function peOrdMove(si, slot, d) {
  const s = PE.draft.sessions[si];
  if (!s) return;
  const w = PE.wk || 0,
    wkp = w && PE.draft.wkPlans && PE.draft.wkPlans[w] && PE.draft.wkPlans[w][s.k];
  const items = peItems(si);
  const prev = ordBlocks(items.map(x => x));
  const bi = prev.findIndex(b => b.items.some(x => x.slot === slot));
  if (bi < 0) return;
  const nb = ordMove(prev, bi, d);
  if (nb === prev) return;
  const slots = nb.flatMap(b => b.items.map(x => x.slot));
  if (wkp) {
    const by = new Map((wkp.add || []).map(x => [x.slot, x]));
    wkp.add = slots
      .map(sl => by.get(sl))
      .filter(Boolean)
      .concat((wkp.add || []).filter(x => !slots.includes(x.slot)));
  } else s.ord = slots;
  PE.dirty = true;
  render();
}

/* ---------- Supersatz dauerhaft → in andere Einheiten übernehmen ---------- */
function ssSetAlways(k2, pairs, mode) {
  const ps = S.plan.sessions.find(x => x.k === k2);
  if (!ps) return;
  const gid = ssNewId();
  pairs.forEach((it, j) => {
    const m = mode === 'fill' ? (j === 0 ? 'fa' : 'fill') : 'ss';
    const add = (ps.add || []).find(x => x.slot === it.slot);
    if (add) {
      add.sup = gid;
      add.gm = m;
    } else {
      ps.ov = ps.ov || {};
      const ov = (ps.ov[it.slot] = ps.ov[it.slot] || {});
      ov.sup = gid;
      ov.gm = m;
    }
  });
  const mem = pairs.map(x => x.slot),
    cur = planForP(S.plan, curWeek(), k2)
      .map(x => x.slot)
      .filter(sl => !mem.includes(sl));
  const at = planForP(S.plan, curWeek(), k2).findIndex(x => x.slot === mem[0]);
  const before = planForP(S.plan, curWeek(), k2)
    .slice(0, Math.max(0, at))
    .map(x => x.slot)
    .filter(sl => !mem.includes(sl)).length;
  cur.splice(before, 0, ...mem);
  ps.ord = cur;
}
function ssTransferCands(w, k, exIds, anchorEx) {
  const out = [];
  ORDER.filter(isGym).forEach(k2 => {
    if (k2 === k) return;
    const L = planForP(S.plan, w, k2);
    const its = exIds.map(e => L.find(x => x.ex === e)).filter(Boolean);
    if (its.length !== exIds.length) return;
    const g = its[0].sup;
    if (g && its.every(x => x.sup === g)) return;
    const anchor = its.find(x => x.ex === anchorEx) || its[0];
    out.push({ k: k2, items: [anchor].concat(its.filter(x => x !== anchor)) });
  });
  return out;
}
hbWrap('ssStore', 'exorder', function (__next, members, mode) {
  const o = ui.ss ? Object.assign({}, ui.ss) : null;
  let info = null;
  if (o && o.scope === 'always' && members.length >= 2) {
    const L = planFor(o.w, o.k);
    const exIds = members.map(sl => (L.find(x => x.slot === sl) || {}).ex).filter(Boolean);
    const anchorEx = (L.find(x => x.slot === o.slot) || {}).ex;
    info = { w: o.w, k: o.k, exIds, anchorEx, mode };
  }
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  if (info && info.exIds.length >= 2) {
    const c = ssTransferCands(info.w, info.k, info.exIds, info.anchorEx);
    if (c.length) {
      ui.ssx = Object.assign(info, { cands: c, sel: new Set(c.map(x => x.k)) });
      setTimeout(ssxSheet, 150);
    }
  }
  return r;
});
function ssxSheet() {
  const o = ui.ssx;
  if (!o) return;
  const names = o.exIds.map(e => (LIB[e] ? LIB[e].name : e)).join(' + ');
  openSheet(
    sheetHead($t('Auch in anderen Einheiten?')) +
      '<p class="small" style="margin-top:6px">' +
      $tf('{x} kommt auch in diesen Einheiten deines Plans vor. Soll der {s} dort ebenfalls gelten?', {
        x: esc(names),
        s: esc(ssName(o.exIds.length, o.mode))
      }) +
      '</p>' +
      o.cands
        .map(
          c =>
            '<button class="ss-pick' +
            (o.sel.has(c.k) ? ' on' : '') +
            '" data-act="ssxPick" data-k="' +
            c.k +
            '" type="button"><span class="ck">' +
            (o.sel.has(c.k) ? '✓' : '') +
            '</span><span class="grow"><b>' +
            esc(sessTitleOf(c.k)) +
            '</b></span></button>'
        )
        .join('') +
      ORIG_NOTE() +
      '<div class="row" style="margin-top:14px"><button class="btn" data-act="ssxNo" type="button">' +
      $t('Nur hier') +
      '</button><div class="grow"></div><button class="btn brand" data-act="ssxGo" type="button">' +
      $t('Übernehmen') +
      '</button></div>'
  );
}
function sessTitleOf(k) {
  const s = SESS[k] || {};
  return $t('Einheit') + ' ' + k + (s.title ? ' · ' + $t(s.title) : '');
}
/* Hinweis im Supersatz-Fenster bei „Dauerhaft im Plan“ */
hbFilter('ssSheet', 'exorder', function (__v) {
  const r = __v;
  if (ui.ss && ui.ss.scope === 'always') {
    const c = document.getElementById('sheetCard');
    if (c && !c.querySelector('[data-orignote]')) c.insertAdjacentHTML('beforeend', '<div data-orignote>' + ORIG_NOTE() + '</div>');
  }
  return r;
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'ordOpen') ordOpen(+b.dataset.w, b.dataset.k);
  else if (a === 'ordMv' && ui.ord) {
    ui.ord.blocks = ordMove(ui.ord.blocks, +b.dataset.i, +b.dataset.v);
    ordSheet();
  } else if (a === 'ordScope' && ui.ord) {
    ui.ord.scope = b.dataset.v;
    ordSheet();
  } else if (a === 'ordSave') ordSave();
  else if (a === 'ordRestore') {
    ui.ordRestore = true;
    ordSheet();
  } else if (a === 'ordRestoreYes') ordRestore();
  else if (a === 'peOrd') peOrdMove(+b.dataset.si, b.dataset.slot, +b.dataset.v);
  else if (a === 'ssxPick' && ui.ssx) {
    const k = b.dataset.k;
    if (ui.ssx.sel.has(k)) ui.ssx.sel.delete(k);
    else ui.ssx.sel.add(k);
    ssxSheet();
  } else if (a === 'ssxNo') {
    ui.ssx = null;
    closeSheet();
  } else if (a === 'ssxGo' && ui.ssx) {
    const o = ui.ssx;
    o.cands.filter(c => o.sel.has(c.k)).forEach(c => ssSetAlways(c.k, c.items, o.mode));
    const n = o.sel.size;
    ui.ssx = null;
    pushOwn();
    save();
    closeSheet();
    if (n) toast($tf('In {n} weiteren Einheiten übernommen', { n }));
    render();
  }
});
