/* Hybridblock – Community: Sterne (nur nach Nutzung, nicht eigene), aktive Nutzer (ab 3), Suche und Filter,
   Meldungen nach DSA (Art. 16) mit Bestätigung „nach bestem Wissen“, Moderation durch Prüfer mit Begründung (Art. 17),
   Einspruch des Erstellers (Art. 20), Rückmeldung an Meldende. */
'use strict';
const CM = { stats: null, statsAt: 0, mine: null, used: null, reports: null, myReports: null, loading: {} };
const planKey = p => (p && p.sharedId ? 'sp:' + p.sharedId : p && LIBRARY[p.tpl] && !LIBRARY[p.tpl].module ? 'lib:' + p.tpl : null);
const cmLoad = (k, fn) => {
  if (CM.loading[k]) return;
  CM.loading[k] = true;
  fn()
    .catch(() => {})
    .finally(() => {
      CM.loading[k] = false;
      if (route.name === 'library') render();
    });
};
function cmNeed() {
  if (!myUid()) return;
  const fresh = Date.now() - CM.statsAt < 120000;
  if (!fresh) {
    CM.statsAt = Date.now();
    cmLoad('stats', async () => {
      const r = await api('/rest/v1/rpc/plan_stats', { method: 'POST', body: '{}' });
      CM.stats = {};
      (r || []).forEach(x => {
        CM.stats[x.plan_key] = x;
      });
    });
  }
  if (CM.mine == null)
    cmLoad('mine', async () => {
      const r = await api('/rest/v1/plan_ratings?select=plan_key,stars');
      CM.mine = {};
      (r || []).forEach(x => {
        CM.mine[x.plan_key] = x.stars;
      });
    });
  if (CM.used == null)
    cmLoad('used', async () => {
      const r = await api('/rest/v1/plan_usage?select=plan_key,started_at');
      CM.used = new Map((r || []).map(x => [x.plan_key, x.started_at]));
    });
  if (SP.rev && CM.reports == null)
    cmLoad('rep', async () => {
      CM.reports =
        (await api(
          '/rest/v1/plan_reports?status=eq.open&select=id,plan_id,plan_name,reason,details,created_at,shared_plans(name,status,hidden,owner_id)&order=created_at.asc&limit=200'
        )) || [];
    });
  if (CM.myReports == null)
    cmLoad('myrep', async () => {
      CM.myReports =
        (await api(
          '/rest/v1/plan_reports?reporter=eq.' + myUid() + '&select=id,plan_id,reason,status,decision_note,created_at,handled_at&order=created_at.desc&limit=20'
        )) || [];
    });
}
/* Nutzung einmal am Tag melden */
function usagePing() {
  if (!myUid() || (typeof VIEW !== 'undefined' && VIEW) || S.settings.noUsage) return;
  const k = planKey(S.plan);
  if (!k) return;
  const tag = k + '|' + today();
  if (S.meta.usePing === tag) return;
  S.meta.usePing = tag;
  save();
  api('/rest/v1/rpc/plan_usage_ping', { method: 'POST', body: JSON.stringify({ p_key: k }) })
    .then(() => {
      if (CM.used && !CM.used.has(k)) CM.used.set(k, new Date().toISOString());
    })
    .catch(() => {
      S.meta.usePing = null;
    });
}
const _renderCM = render;
render = function () {
  const r = _renderCM.apply(this, arguments);
  try {
    usagePing();
  } catch (e) {}
  return r;
};
/* Kennzahlen */
const statOf = k => (CM.stats || {})[k] || null;
function rankScore(k) {
  const s = statOf(k);
  const n = s ? s.n_ratings : 0,
    a = s && s.avg_stars ? +s.avg_stars : 0;
  return (5 * 3.5 + n * a) / (5 + n);
}
function statLine(k) {
  const s = statOf(k);
  if (!s) return '';
  const bits = [];
  if (s.n_ratings) bits.push('<span class="cm-star">★</span> ' + fmt(+s.avg_stars, 1) + ' (' + s.n_ratings + ')');
  if (s.active) bits.push($tf('{n} aktiv', { n: s.active }));
  return bits.length ? '<div class="small cm-stat">' + bits.join(' · ') + '</div>' : '';
}
hbFilter('spCard', 'community', function (__v, sp) {
  let h = __v;
  const st = statLine('sp:' + sp.id);
  if (spMine(sp) && sp.hidden)
    h = h.replace(
      '<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap">',
      '<div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><span class="tag" style="background:var(--signal-soft,#fde3e1)">' +
        esc($t('Ausgeblendet')) +
        '</span>'
    );
  return st ? h.replace(/<\/a>$/, st + '</a>') : h;
});
hbFilter('libCard', 'community', function (__v, p, why) {
  const h = __v;
  const st = statLine('lib:' + p.id);
  return st ? h.replace(/<\/a>$/, st + '</a>') : h;
});

/* ---------- Suche und Filter (Alle, Community) ---------- */
const GR = { A: 4, B: 3, C: 2, D: 1 };
function lfItems(scope) {
  const filt = ui.libGoal || '',
    L = spNeed();
  const out = [];
  if (scope === 'all')
    Object.values(LIBRARY)
      .filter(p => !p.module && libVisible(p) && (!filt || p.goals.includes(filt)))
      .forEach(p =>
        out.push({
          k: 'lib:' + p.id,
          html: () => libCard(p),
          name: $t(p.name) + ' ' + $t(p.desc || '') + ' ' + $t(p.tag || ''),
          rev: true,
          g: (p.ev || {}).g || 'D',
          date: ''
        })
      );
  L.filter(x => (scope === 'com' ? (x.status === 'public' || x.status === 'submitted') && !x.hidden : (SP_PUB.includes(x.status) && !x.hidden) || spMine(x)))
    .filter(x => !filt || (x.meta || {}).goal === filt)
    .forEach(x =>
      out.push({
        k: 'sp:' + x.id,
        html: () => spCard(x),
        name: x.name + ' ' + (x.descr || '') + ' ' + ((x.meta || {}).by || ''),
        rev: x.status === 'curated',
        g: (x.meta || {}).grade || 'D',
        date: x.published_at || x.updated_at || ''
      })
    );
  return out;
}
function lfList(scope) {
  const f = ui.lf || {};
  const q = (f.q || '').trim().toLowerCase();
  let L = lfItems(scope).filter(x => (!q || x.name.toLowerCase().includes(q)) && (!f.rev || x.rev) && (!f.ev || (GR[x.g] || 0) >= GR[f.ev]));
  const act = x => (statOf(x.k) || {}).active || 0;
  const so = f.sort || 'rank';
  L.sort((a, b) =>
    so === 'act'
      ? act(b) - act(a) || rankScore(b.k) - rankScore(a.k)
      : so === 'new'
        ? b.date > a.date
          ? 1
          : b.date < a.date
            ? -1
            : 0
        : so === 'ev'
          ? (GR[b.g] || 0) - (GR[a.g] || 0) || rankScore(b.k) - rankScore(a.k)
          : rankScore(b.k) - rankScore(a.k) || act(b) - act(a)
  );
  return L.length ? L.map(x => x.html()).join('') : '<p class="small muted" style="margin:0 4px">' + $t('Keine Pläne passen zu diesen Filtern.') + '</p>';
}
function lfBar(scope) {
  const f = ui.lf || {};
  const sel = (id, opts, v) =>
    '<select id="' +
    id +
    '" class="lf-sel">' +
    opts.map(([k, l]) => '<option value="' + k + '"' + ((v || '') === k ? ' selected' : '') + '>' + esc(l) + '</option>').join('') +
    '</select>';
  return (
    '<div class="lf"><input id="lf-q" type="search" placeholder="' +
    esc($t('Pläne durchsuchen')) +
    '" value="' +
    esc(f.q || '') +
    '">' +
    '<div class="lf-row">' +
    (scope === 'all' ? '<button class="chip-btn' + (f.rev ? ' on' : '') + '" data-act="lfRev" type="button">✓ ' + $t('Von uns geprüft') + '</button>' : '') +
    sel(
      'lf-ev',
      [
        ['', $t('Evidenz: alle')],
        ['A', $t('Evidenz A')],
        ['B', $t('Evidenz ab B')],
        ['C', $t('Evidenz ab C')]
      ],
      f.ev
    ) +
    sel(
      'lf-sort',
      [
        ['rank', $t('Ranking')],
        ['act', $t('Aktive Nutzer')],
        ['new', $t('Neueste')],
        ['ev', $t('Evidenz')]
      ],
      f.sort
    ) +
    '</div></div>'
  );
}
function viewLibAll() {
  cmNeed();
  return goalSeg() + lfBar('all') + '<div id="lib-list" class="stack">' + lfList('all') + '</div>';
}
const _viewLibComCM = viewLibCom;
viewLibCom = function () {
  cmNeed();
  if (libTab() === 'rev') return modView() + _viewLibComCM.apply(this, arguments);
  return (
    note('sky', $t('Pläne aus der Community, noch nicht von uns geprüft. Die Note kommt aus der automatischen Prüfung gegen die Studienlage.')) +
    lfBar('com') +
    '<div id="lib-list" class="stack">' +
    (SP.list == null ? '<p class="muted">' + $t('Lade …') + '</p>' : lfList('com')) +
    '</div>'
  );
};
function lfUpdate() {
  const el = document.getElementById('lib-list');
  if (el) el.innerHTML = lfList(libTab() === 'com' ? 'com' : 'all');
}
document.addEventListener('input', e => {
  if (e.target.id === 'lf-q') {
    ui.lf = Object.assign({}, ui.lf, { q: e.target.value });
    lfUpdate();
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'lf-ev') {
    ui.lf = Object.assign({}, ui.lf, { ev: e.target.value });
    lfUpdate();
  } else if (e.target.id === 'lf-sort') {
    ui.lf = Object.assign({}, ui.lf, { sort: e.target.value });
    lfUpdate();
  }
});

/* ---------- Bewerten ---------- */
function rateBox(k, own) {
  if (!k || !myUid() || own) return '';
  cmNeed();
  const s = statOf(k),
    my = (CM.mine || {})[k] || 0,
    used = !!(CM.used && CM.used.has(k) && Date.parse(CM.used.get(k)) < Date.now() - 3 * 864e5);
  return (
    '<div class="card cm-rate"><div class="row" style="align-items:center;flex-wrap:wrap;gap:8px"><div class="grow"><b>' +
    $t('Bewertung') +
    '</b><div class="small muted">' +
    (s && s.n_ratings
      ? $tf('Ø {a} aus {n} Bewertungen', { a: fmt(+s.avg_stars, 1), n: s.n_ratings })
      : $t('Noch zu wenige Bewertungen für einen Durchschnitt')) +
    (s && s.active ? ' · ' + $tf('{n} aktiv', { n: s.active }) : '') +
    '</div></div>' +
    '<div class="cm-stars" role="group" aria-label="' +
    esc($t('Deine Bewertung')) +
    '">' +
    [1, 2, 3, 4, 5]
      .map(
        i =>
          '<button type="button" data-act="rate" data-key="' +
          k +
          '" data-v="' +
          i +
          '" class="' +
          (i <= my ? 'on' : '') +
          '"' +
          (used ? '' : ' disabled') +
          ' aria-label="' +
          esc($tf('{n} Sterne', { n: i })) +
          '">★</button>'
      )
      .join('') +
    '</div></div>' +
    (used
      ? my
        ? '<div class="small muted" style="margin-top:4px">' + $t('Deine Bewertung. Tippen zum Ändern.') + '</div>'
        : ''
      : '<div class="small muted" style="margin-top:4px">' + $t('Bewerten kannst du, wenn du seit mindestens 3 Tagen mit dem Plan trainierst.') + '</div>') +
    '</div>'
  );
}
async function rate(k, v) {
  try {
    await api('/rest/v1/plan_ratings', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ plan_key: k, stars: v })
    });
    CM.mine = Object.assign({}, CM.mine, { [k]: v });
    CM.statsAt = 0;
    toast($t('Danke für deine Bewertung'));
    render();
  } catch (e) {
    const t = errTxt(e) || '';
    toast(
      /Nutzung/.test(t)
        ? $t('Bewerten kannst du, wenn du seit mindestens 3 Tagen mit dem Plan trainierst.')
        : /Eigene/.test(t)
          ? $t('Eigene Pläne kannst du nicht bewerten.')
          : t
    );
  }
}
const insTop = (h, add) => {
  const m = hbAt(h, '<div class="stack"', 'community');
  if (m < 0) return h + add;
  const e = h.indexOf('>', m) + 1;
  return h.slice(0, e) + add + h.slice(e);
};

/* ---------- Melden, Moderation, Einspruch ---------- */
const REP_R = {
  illegal: 'Rechtswidriger Inhalt',
  dangerous: 'Gesundheitlich gefährlich',
  copyright: 'Urheberrecht verletzt',
  spam: 'Spam oder Werbung',
  other: 'Sonstiges',
  appeal: 'Einspruch'
};
function repSheet(planId, appeal) {
  ui.repFor = planId;
  ui.repAppeal = !!appeal;
  openSheet(
    sheetHead(appeal ? $t('Einspruch einlegen') : $t('Plan melden')) +
      '<p class="small muted" style="margin-top:6px">' +
      (appeal === 2
        ? $t('Begründe, warum deine Meldung nicht hätte zurückgewiesen werden sollen. Wir prüfen den Einspruch erneut, durch einen Menschen.')
        : appeal
          ? $t('Begründe, warum der Plan wieder sichtbar sein sollte. Wir prüfen den Einspruch und melden uns hier.')
          : $t('Meldungen gehen an unser Prüfteam. Der Ersteller erfährt nicht, wer gemeldet hat. Du siehst die Entscheidung unter „Meine Pläne“.')) +
      '</p>' +
      (appeal
        ? ''
        : '<div class="menu" style="margin-top:10px">' +
          Object.keys(REP_R)
            .filter(k => k !== 'appeal')
            .map(
              (k, i) =>
                '<label class="act-pick"><input type="radio" name="rep-r" value="' +
                k +
                '"' +
                (i === 0 ? ' checked' : '') +
                '> <span class="grow">' +
                esc($t(REP_R[k])) +
                '</span></label>'
            )
            .join('') +
          '</div>') +
      '<div class="on-white" style="margin-top:10px"><div class="field"><label for="rep-d">' +
      (appeal ? $t('Begründung') : $t('Was genau ist das Problem? Bei rechtswidrigen Inhalten bitte auch, warum.')) +
      '</label><textarea id="rep-d" rows="4" maxlength="1000"></textarea></div></div>' +
      '<label class="row" style="gap:10px;margin-top:10px;align-items:flex-start"><input type="checkbox" id="rep-gf"> <span class="small">' +
      $t('Ich bestätige, dass meine Angaben nach bestem Wissen richtig und vollständig sind.') +
      '</span></label>' +
      '<div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="repGo" type="button">' +
      $t('Absenden') +
      '</button></div>'
  );
}
async function repGo(b) {
  const d = ($('#rep-d').value || '').trim(),
    gf = $('#rep-gf').checked,
    r = ui.repAppeal ? 'appeal' : (document.querySelector('input[name="rep-r"]:checked') || {}).value || 'other';
  if (!gf) {
    toast($t('Bitte bestätige deine Angaben.'));
    return;
  }
  if (d.length < 10) {
    toast($t('Bitte beschreibe das Problem kurz (mindestens 10 Zeichen).'));
    return;
  }
  b.disabled = true;
  try {
    await api('/rest/v1/plan_reports', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ plan_id: ui.repFor, reason: r, details: d || null, good_faith: true })
    });
    CM.myReports = null;
    closeSheet();
    toast(ui.repAppeal ? $t('Einspruch eingereicht') : $t('Danke. Wir prüfen die Meldung.'));
    render();
  } catch (e) {
    b.disabled = false;
    const t = errTxt(e) || '';
    toast(
      /bereits offen/.test(t)
        ? $t('Du hast diesen Plan schon gemeldet. Die Prüfung läuft.')
        : /Zu viele/.test(t)
          ? $t('Zu viele Meldungen heute. Versuch es morgen wieder.')
          : t
    );
  }
}
function modView() {
  const L = CM.reports;
  if (!SP.rev) return '';
  if (L == null) return '<p class="muted">' + $t('Lade …') + '</p>';
  return (
    '<div class="section-h"><h2>' +
    esc($tf('Meldungen ({n})', { n: L.length })) +
    '</h2></div>' +
    (L.length
      ? L.map(r => {
          const p = r.shared_plans || {};
          return (
            '<div class="card"' +
            (r.reason === 'appeal' ? ' data-appealcard' : '') +
            ' style="box-shadow:inset 4px 0 0 ' +
            (r.reason === 'appeal' ? 'var(--sky)' : 'var(--signal)') +
            '"><div class="row" style="flex-wrap:nowrap"><div class="grow"><b>' +
            esc($t(REP_R[r.reason] || r.reason)) +
            '</b><div class="small muted">' +
            esc(fmtDay(r.created_at.slice(0, 10))) +
            ' · <a href="#library/sp:' +
            esc(r.plan_id) +
            '">' +
            esc(p.name || r.plan_name || $t('Plan')) +
            '</a>' +
            (p.hidden ? ' · ' + $t('Ausgeblendet') : '') +
            '</div></div></div>' +
            (r.details ? '<p class="small" style="margin:8px 0 0;white-space:pre-wrap">' + esc(r.details) + '</p>' : '') +
            '<div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">' +
            (r.reason === 'appeal' && p.hidden
              ? '<button class="btn sm brand" data-act="modGo" data-v="unhide" data-id="' +
                esc(r.id) +
                '" data-plan="' +
                esc(r.plan_id) +
                '" type="button">' +
                $t('Wieder einblenden') +
                '</button><button class="btn sm" data-act="modGo" data-v="dismiss" data-id="' +
                esc(r.id) +
                '" type="button">' +
                $t('Einspruch zurückweisen') +
                '</button>'
              : '<button class="btn sm dark" data-act="modGo" data-v="hide" data-id="' +
                esc(r.id) +
                '" data-plan="' +
                esc(r.plan_id) +
                '" type="button">' +
                $t('Plan ausblenden') +
                '</button><button class="btn sm" data-act="modGo" data-v="dismiss" data-id="' +
                esc(r.id) +
                '" type="button">' +
                $t('Meldung zurückweisen') +
                '</button>') +
            '</div></div>'
          );
        }).join('')
      : '<p class="small muted" style="margin:0 4px">' + $t('Keine offenen Meldungen.') + '</p>') +
    '<div class="section-h"><h2>' +
    $t('Eingereichte Pläne') +
    '</h2></div>'
  );
}
function modSheet(b) {
  const v = b.dataset.v;
  ui.mod = { v, id: b.dataset.id, plan: b.dataset.plan };
  ui.modAppeal = !!b.closest('[data-appealcard]');
  const t = {
    hide: ['Plan ausblenden', 'Begründung für den Ersteller (Pflicht)'],
    unhide: ['Wieder einblenden', 'Hinweis für Ersteller und Meldende (optional)'],
    dismiss: ['Zurückweisen', 'Begründung für die meldende Person (Pflicht)']
  }[v];
  openSheet(
    sheetHead($t(t[0])) +
      (v === 'hide'
        ? '<div class="menu" style="margin-top:12px"><label class="act-pick"><input type="radio" name="mod-g" value="terms" checked> <span class="grow">' +
          $t('Verstoß gegen die Nutzungsbedingungen') +
          '</span></label><label class="act-pick"><input type="radio" name="mod-g" value="illegal"> <span class="grow">' +
          $t('Rechtswidriger Inhalt') +
          '</span></label></div>'
        : '') +
      '<div class="on-white" style="margin-top:12px"><div class="field"><label for="mod-n">' +
      esc($t(t[1])) +
      '</label><textarea id="mod-n" rows="4" maxlength="1000"></textarea></div></div>' +
      '<p class="small muted">' +
      $t('Die Begründung wird gespeichert und den Betroffenen angezeigt.') +
      '</p><div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="modDo" type="button">' +
      $t('Bestätigen') +
      '</button></div>'
  );
}
async function modDo(b) {
  const m = ui.mod,
    n = ($('#mod-n').value || '').trim();
  if (m.v !== 'unhide' && n.length < 5) {
    toast($t('Bitte eine Begründung eingeben.'));
    return;
  }
  b.disabled = true;
  try {
    if (m.v === 'hide' || m.v === 'unhide') {
      await api('/rest/v1/shared_plans?id=eq.' + m.plan, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          hidden: m.v === 'hide',
          mod_note: m.v === 'hide' ? n : null,
          mod_ground: m.v === 'hide' ? (document.querySelector('input[name="mod-g"]:checked') || {}).value || 'terms' : null
        })
      });
      await api('/rest/v1/plan_reports?plan_id=eq.' + m.plan + '&status=eq.open', {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: m.v === 'unhide' ? 'reversed' : 'actioned', decision_note: n || null })
      });
    } else
      await api('/rest/v1/plan_reports?id=eq.' + m.id, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: m.v === 'dismiss' && ui.modAppeal ? 'upheld' : 'dismissed', decision_note: n })
      });
    CM.reports = null;
    SP.list = null;
    SP.body = {};
    closeSheet();
    toast($t('Erledigt'));
    render();
  } catch (e) {
    b.disabled = false;
    toast(errTxt(e));
  }
}
/* Meine Meldungen (Rückmeldung an Meldende) */
const _viewLibMineCM = viewLibMine;
function usageToggle() {
  return (
    '<label class="row small" style="gap:10px;margin:4px 4px 0;align-items:flex-start"><input type="checkbox" data-act="usageTog"' +
    (S.settings.noUsage ? '' : ' checked') +
    '> <span>' +
    $t('Meine Nutzung für „aktive Nutzer“ mitzählen (anonym, ab 5 Personen sichtbar). Ohne Zählung kannst du Pläne nicht bewerten.') +
    '</span></label>'
  );
}
viewLibMine = function () {
  cmNeed();
  const h0 = _viewLibMineCM.apply(this, arguments) + (myUid() ? usageToggle() : '');
  const h = h0;
  const L = CM.myReports || [];
  if (!L.length) return h;
  const st = r =>
    r.status === 'open'
      ? $t('in Prüfung')
      : r.status === 'actioned'
        ? $t('Plan ausgeblendet')
        : r.status === 'reversed'
          ? $t('wieder eingeblendet')
          : $t('zurückgewiesen');
  return (
    h +
    '<div class="section-h"><h2>' +
    $t('Meine Meldungen') +
    '</h2></div><div class="card flush"><div class="list">' +
    L.map(
      r =>
        '<div class="li"><div class="grow"><b>' +
        esc($t(REP_R[r.reason] || r.reason)) +
        '</b><small>' +
        esc(fmtDay(r.created_at.slice(0, 10))) +
        ' · ' +
        esc(st(r)) +
        (r.decision_note ? ' · ' + esc(r.decision_note) : '') +
        '</small></div>' +
        (r.status === 'dismissed' && r.plan_id
          ? '<button class="btn sm" data-act="repOpen" data-appeal="2" data-id="' + r.plan_id + '" type="button">' + $t('Einspruch') + '</button>'
          : '') +
        '</div>'
    ).join('') +
    '</div></div>'
  );
};
/* Detailansichten: Bewertung, Melden, Ausgeblendet */
hbFilter('viewSharedPlan', 'community', function (__v, id) {
  let h = __v;
  const b = SP.body[id];
  if (!b || b.missing) return h;
  const own = spMine(b);
  let add = '';
  if (own && b.hidden)
    add += note(
      'red',
      '<b>' +
        $t('Von der Moderation ausgeblendet.') +
        '</b> ' +
        (b.mod_ground ? esc($t(b.mod_ground === 'illegal' ? 'Grund: rechtswidriger Inhalt.' : 'Grund: Verstoß gegen die Nutzungsbedingungen.')) + ' ' : '') +
        esc(b.mod_note || '') +
        (b.mod_at ? ' (' + esc(fmtDay(String(b.mod_at).slice(0, 10))) + ')' : '') +
        '<br><span class="small">' +
        $t(
          'Du kannst innerhalb von 6 Monaten kostenlos Einspruch einlegen. Außerdem stehen dir eine außergerichtliche Streitbeilegung (Art. 21 DSA) und der Rechtsweg offen. Die Entscheidung wurde von einem Menschen getroffen.'
        ) +
        '</span>',
      '<button class="btn sm" data-act="repOpen" data-appeal="1" data-id="' + id + '" type="button">' + $t('Einspruch einlegen') + '</button>'
    );
  if (SP_PUB.includes(b.status) && !b.hidden) add += rateBox('sp:' + id, own);
  if (!own && myUid())
    add +=
      '<div class="row" style="justify-content:flex-end"><button class="btn sm" data-act="repOpen" data-id="' +
      id +
      '" type="button">⚑ ' +
      $t('Melden') +
      '</button></div>';
  return insTop(h, add);
});
const _viewLibPlanCM = viewLibPlan;
viewLibPlan = function (id) {
  const h = _viewLibPlanCM.apply(this, arguments);
  id = String(id || '');
  if (!LIBRARY[id] || LIBRARY[id].module || id === 'gen') return h;
  const box = rateBox('lib:' + id, false);
  return box ? insTop(h, box) : h;
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'usageTog') {
    S.settings.noUsage = !b.checked;
    S.meta.usePing = null;
    save();
    if (S.settings.noUsage)
      api('/rest/v1/plan_usage?user_id=eq.' + myUid(), { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
        .then(() => {
          CM.used = new Map();
          toast($t('Nutzungsdaten gelöscht'));
        })
        .catch(() => {});
    else usagePing();
  } else if (a === 'rate') rate(b.dataset.key, +b.dataset.v);
  else if (a === 'lfRev') {
    ui.lf = Object.assign({}, ui.lf, { rev: !(ui.lf || {}).rev });
    b.classList.toggle('on');
    lfUpdate();
  } else if (a === 'repOpen') repSheet(b.dataset.id, b.dataset.appeal === '1' ? 1 : b.dataset.appeal === '2' ? 2 : 0);
  else if (a === 'repGo') repGo(b);
  else if (a === 'modGo') modSheet(b);
  else if (a === 'modDo') modDo(b);
});
/* Prüfen-Reiter zählt offene Meldungen mit */
const _viewLibraryCM = viewLibrary;
viewLibrary = function () {
  const h = _viewLibraryCM.apply(this, arguments);
  const n = (CM.reports || []).length;
  if (!SP.rev || !n) return h;
  return h.replace(/(data-v="rev" type="button">[^<(]*)(\((\d+)\))?/, (m0, a, b2, c) => a.trim() + ' (' + ((+c || 0) + n) + ')');
};

/* Datenbank-Fehlermeldungen übersetzen */
const DB_ERR = [
  [/Einspruchsfrist abgelaufen/, 'Die Frist für einen Einspruch (6 Monate) ist abgelaufen.'],
  [/Einspruch nicht möglich/, 'Ein Einspruch ist hier nicht möglich.'],
  [/Begründung zu kurz/, 'Bitte beschreibe das Problem kurz (mindestens 10 Zeichen).'],
  [/Plan nicht gefunden/, 'Plan nicht gefunden.'],
  [/bereits offen/, 'Du hast diesen Plan schon gemeldet. Die Prüfung läuft.'],
  [/Zu viele Meldungen/, 'Zu viele Meldungen heute. Versuch es morgen wieder.'],
  [/Nur Prüfer/, 'Das darf nur das Prüfteam.'],
  [/Nur Coaches/, 'Das geht nur mit einem Coach-Konto.'],
  [/Höchstens 2/, 'Du kannst höchstens 2 Pläne veröffentlichen.'],
  [/Bewerten erst nach Nutzung/, 'Bewerten kannst du, wenn du seit mindestens 3 Tagen mit dem Plan trainierst.'],
  [/Eigene Pläne/, 'Eigene Pläne kannst du nicht bewerten.']
];
function dbErr(t) {
  t = String(t || '');
  const m = DB_ERR.find(x => x[0].test(t));
  return m ? $t(m[1]) : t;
}
const _errTxtCM = errTxt;
errTxt = function () {
  return dbErr(_errTxtCM.apply(this, arguments));
};
