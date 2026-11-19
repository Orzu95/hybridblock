/* Hybridblock – Desktop D2: Team als Triage-Tabelle (ab 1024 px, nur Coach)
   Zeile pro Athlet: Ursachen, Training 7 Tage, Ernährung, Gewohnheiten, Fragebogen, letzte Aktivität, Schnellaktionen
   (Nachricht, Plan, Pausieren 3 Tage, Erledigt bis sich etwas ändert). Filter-Kacheln oben, Mehrfachauswahl mit Aktionsleiste
   (Vorlage zuweisen, Gewohnheit zuweisen, Sammelnachricht mit {name}), rechts Kurzpanel mit Werten und Notizen.
   Unter 1024 px bleibt die Karten-Liste aus dashboard.js. */
'use strict';
const TT_MQ = window.matchMedia ? window.matchMedia('(min-width:1024px)') : { matches: false };
const ttOn = () => !!(TT_MQ.matches && typeof isAdmin === 'function' && isAdmin() && !VIEW);
const ttPick = new Set();
function ttSnoozed(id) {
  const u = (S.settings.ttSnooze || {})[id];
  return u && u > today() ? u : null;
}
const ttSig = f =>
  Object.keys(f)
    .sort()
    .map(k => k + ':' + f[k])
    .join('|');
/* wirksame Flags: pausiert oder „erledigt“ (gleiche Lage wie beim Abhaken) zählt als auf Kurs */
function ttFlags(c) {
  const f = dashFlags(c);
  if (ttSnoozed(c.id)) return { f: {}, raw: f, st: 'snooze' };
  const d = (S.settings.ttDone || {})[c.id];
  if (d && Object.keys(f).length && d === ttSig(f)) return { f: {}, raw: f, st: 'done' };
  return { f, raw: f, st: '' };
}
const TT_URG = f => (f.plan ? 5 : 0) + (f.warn ? 4 : 0) + (f.checkin ? 3 : 0) + (f.form ? 3 : 0) + (f.msg ? 2 : 0) + (f.inactive ? 1 : 0);

function ttCellTrain(s) {
  const dots = (s.dots || []).map(d => '<i class="sd sd-' + d + '"></i>').join('');
  const q = quotaOf(s);
  return (dots ? '<div class="sdots" style="margin:0">' + dots + '</div>' : '<span class="muted">–</span>') + (q != null ? '<small>' + q + ' %</small>' : '');
}
function ttCellFood(s) {
  if (s.logged7 == null) return '<span class="muted">–</span>';
  const p = s.kcal7 && s.kcalT ? Math.round((s.kcal7 / s.kcalT) * 100) : null;
  return '<b>' + s.logged7 + '/7</b><small>' + (p != null ? $tf('{p} % kcal', { p }) : $t('Tage erfasst')) + '</small>';
}
function ttCellHab(s) {
  if (!s.hab || s.hab.p == null) return '<span class="muted">–</span>';
  return '<b class="' + (s.hab.p < 50 ? 'tt-bad' : s.hab.p >= 80 ? 'tt-good' : '') + '">' + s.hab.p + ' %</b>';
}
function ttCellCf(s) {
  if (!s.cf) return '<span class="muted">–</span>';
  if (s.cf.over) return '<span class="fchip f-checkin">' + esc($t('überfällig')) + '</span>';
  if (s.cf.open) return '<span class="muted">' + esc($t('offen')) + '</span>';
  return s.formLast ? '<span>' + esc(fmtDay(s.formLast)) + '</span>' : '<span class="muted">–</span>';
}
function ttAgo(d) {
  if (!d) return $t('noch nie');
  const n = daysBetween(d.slice(0, 10), today());
  if (n <= 0) return $t('heute');
  return new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' }).format(-n, 'day');
}
function ttRow(x) {
  const c = x.c,
    s = c.summary || {},
    m = athMode(c.id),
    sel = ui.ttSel === c.id;
  const chips = Object.keys(x.raw)
    .map(k => '<span class="fchip f-' + k + '">' + esc(x.raw[k]) + '</span>')
    .join('');
  const state =
    x.st === 'snooze'
      ? '<span class="tag">' + esc($tf('pausiert bis {d}', { d: fmtDay(ttSnoozed(c.id)) })) + '</span>'
      : x.st === 'done'
        ? '<span class="tag">' + esc($t('erledigt')) + '</span>'
        : '';
  const last = s.lastTrain || (c.updated_at || '').slice(0, 10);
  const ib = (act, icon, lab, extra) =>
    '<button class="tt-ib" data-act="' + act + '" data-uid="' + c.id + '" type="button" title="' + esc(lab) + '" aria-label="' + esc(lab) + '"' + (extra || '') + '>' + icon + '</button>';
  return (
    '<tr class="tt-r' +
    (sel ? ' on' : '') +
    (x.st ? ' tt-quiet' : '') +
    '" data-act="ttSel" data-uid="' +
    c.id +
    '"><td class="tt-ck"><input type="checkbox" data-ttpick="' +
    c.id +
    '"' +
    (ttPick.has(c.id) ? ' checked' : '') +
    ' aria-label="' +
    esc($tf('{n} auswählen', { n: cname(c) })) +
    '"></td><td class="tt-name"><a href="#admin/' +
    c.id +
    '"><b>' +
    esc(cname(c)) +
    '</b></a>' +
    (m ? ' <span class="tag">' + esc($t(ATH_MODE[m])) + '</span>' : '') +
    '<small>' +
    (s.week ? $t('Woche ') + esc(s.week) + (s.nw ? '/' + esc(s.nw) : '') : $t('noch nicht gestartet')) +
    '</small></td><td class="tt-why">' +
    (chips || state ? '<div class="fchips" style="margin:0">' + state + chips + '</div>' : '<span class="tt-good">' + esc($t('Auf Kurs')) + '</span>') +
    '</td><td>' +
    ttCellTrain(s) +
    '</td><td>' +
    ttCellFood(s) +
    '</td><td>' +
    ttCellHab(s) +
    '</td><td>' +
    ttCellCf(s) +
    '</td><td><span title="' +
    esc(last || '') +
    '">' +
    esc(ttAgo(last)) +
    '</span></td><td class="tt-act">' +
    '<a class="tt-ib" href="#chat/' +
    c.id +
    '" title="' +
    esc($t('Nachricht')) +
    '" aria-label="' +
    esc($t('Nachricht')) +
    '">' +
    ICON.chat +
    (typeof chatUnreadFor === 'function' && chatUnreadFor(c.id) ? '<i class="tt-dot"></i>' : '') +
    '</a><a class="tt-ib" href="#plan/' +
    c.id +
    '" title="' +
    esc($t('Plan')) +
    '" aria-label="' +
    esc($t('Plan')) +
    '">' +
    ICON.chart +
    '</a>' +
    (x.st === 'snooze'
      ? ib('ttWake', ICON.sync, $t('Pause beenden'))
      : ib('ttSnooze', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>', $t('3 Tage pausieren'))) +
    (Object.keys(x.raw).length && x.st !== 'snooze'
      ? ib('ttDone', ICON.check, x.st === 'done' ? $t('Wieder anzeigen') : $t('Erledigt'), x.st === 'done' ? ' data-on="1"' : '')
      : '') +
    '</td></tr>'
  );
}
function ttExtra() {
  const w = h => (h ? '<div class="stack">' + h + '</div>' : '');
  const x = w(typeof apptCoachCard === 'function' ? apptCoachCard() : '') + ttInvites() + w(typeof coachNotifCard === 'function' ? coachNotifCard() : '');
  return x ? '<div class="tt-extra">' + x + '</div>' : '';
}
function ttPanel(all) {
  const c = all.find(x => x.id === ui.ttSel);
  if (!c) return '';
  const s = c.summary || {};
  const kv = (lab, v) => (v == null || v === '' ? '' : '<div class="tt-kv"><span>' + esc(lab) + '</span><b>' + v + '</b></div>');
  const hab = s.hab && s.hab.list && s.hab.list.length ? s.hab.list.map(h => esc(h.t || (HB_KINDS().find(x => x[0] === h.k) || [])[1] || h.k) + ' ' + h.d + '/' + h.of).join(' · ') : '';
  return (
    '<aside class="tt-side"><div class="card"><div class="row" style="align-items:center"><h2 class="grow" style="margin:0">' +
    esc(cname(c)) +
    '</h2><button class="iconbtn" data-act="ttSel" data-uid="" type="button" aria-label="' +
    esc($t('Schließen')) +
    '">✕</button></div><p class="small muted" style="margin:2px 0 10px">' +
    esc(s.plan ? $t(s.plan) : $t('noch kein Plan')) +
    (s.week ? ' · ' + $t('Woche ') + esc(s.week) + (s.nw ? '/' + esc(s.nw) : '') : '') +
    '</p>' +
    kv($t('Gewicht (Trend)'), s.trend != null ? esc(fmt(s.trend, 1)) + ' kg' + (s.rate != null ? ' · ' + esc((s.rate > 0 ? '+' : '') + fmt(s.rate, 2)) + ' kg/' + $t('Wo.') : '') : null) +
    kv($t('Bereitschaft'), s.ready != null ? esc(s.ready) : null) +
    kv($t('Schlaf Ø 7 Tage'), s.sleep7 != null ? esc(Math.floor(s.sleep7 / 60) + ' h ' + String(s.sleep7 % 60).padStart(2, '0')) : null) +
    kv($t('Ruhepuls Ø 7 Tage'), s.rhr7 != null ? esc(s.rhr7) : null) +
    kv($t('Schritte Ø 7 Tage'), s.steps7 != null ? esc(fmt(s.steps7, 0)) : null) +
    kv($t('Kalorien Ø 7 Tage'), s.kcal7 != null ? esc(fmt(s.kcal7, 0)) + (s.kcalT ? ' / ' + esc(fmt(s.kcalT, 0)) : '') : null) +
    kv($t('Protein Ø 7 Tage'), s.prot7 != null ? esc(s.prot7) + ' g' + (s.protT ? ' / ' + esc(s.protT) + ' g' : '') : null) +
    (hab ? '<p class="small muted" style="margin:8px 0 0">' + hab + '</p>' : '') +
    '<div class="row" style="gap:6px;margin-top:12px;flex-wrap:wrap"><a class="btn sm brand" href="#admin/' +
    c.id +
    '">' +
    $t('Öffnen') +
    '</a><a class="btn sm" href="#chat/' +
    c.id +
    '">' +
    $t('Nachricht') +
    '</a><a class="btn sm" href="#plan/' +
    c.id +
    '">' +
    $t('Plan') +
    '</a></div></div>' +
    (typeof notesCard === 'function' ? notesCard(c.id) : '') +
    '</aside>'
  );
}
function ttInvites() {
  const inv = ADMIN.invites || [];
  if (!inv.length) return '';
  return (
    '<div class="card flush"><div class="section-h" style="padding:14px 16px 0"><h2>' +
    $t('Offene Einladungen') +
    '</h2></div><div class="list">' +
    inv
      .map(
        i =>
          '<div class="li" style="cursor:default"><div class="grow"><b class="num" style="letter-spacing:.06em">' +
          esc(i.code) +
          '</b><small>' +
          esc((i.name || '') + $t(' · gültig bis ') + fmtDay(i.expires_at.slice(0, 10))) +
          '</small></div><button class="btn sm" data-act="inviteShare" data-code="' +
          esc(i.code) +
          '" data-name="' +
          esc(i.name || '') +
          '" type="button">' +
          $t('Teilen') +
          '</button><button class="btn sm danger" data-act="inviteDel" data-code="' +
          esc(i.code) +
          '" type="button">' +
          $t('Löschen') +
          '</button></div>'
      )
      .join('') +
    '</div></div>'
  );
}
function ttBar() {
  const n = ttPick.size;
  if (!n) return '';
  return (
    '<div class="tt-bar"><b>' +
    esc(n === 1 ? $t('1 ausgewählt') : $tf('{n} ausgewählt', { n })) +
    '</b><button class="btn sm" data-act="ttTpl" type="button">' +
    $t('Vorlage zuweisen') +
    '</button><button class="btn sm" data-act="ttHab" type="button">' +
    $t('Gewohnheit zuweisen') +
    '</button><button class="btn sm" data-act="ttMsg" type="button">' +
    $t('Sammelnachricht') +
    '</button><div class="grow"></div><button class="linkbtn" data-act="ttNone" type="button">' +
    $t('Auswahl aufheben') +
    '</button></div>'
  );
}
function viewTeamTable() {
  const all = ADMIN.clients || [];
  [...ttPick].forEach(id => {
    if (!all.some(c => c.id === id)) ttPick.delete(id);
  });
  const F = all.map(c => Object.assign({ c }, ttFlags(c)));
  const cnt = k => F.filter(x => (k === 'ok' ? !Object.keys(x.f).length : x.f[k])).length;
  const fil = ui.dashF || '',
    md = ui.dashMode || '',
    q = (ui.dashQ || '').trim().toLowerCase(),
    sort = ui.dashSort || 'urg';
  let L = F.filter(
    x =>
      (!fil || (fil === 'ok' ? !Object.keys(x.f).length : x.f[fil])) &&
      (!md || athMode(x.c.id) === md) &&
      (!q || cname(x.c).toLowerCase().includes(q) || (x.c.username || '').toLowerCase().includes(q))
  );
  const lt = x => (x.c.summary && x.c.summary.lastTrain) || '';
  L.sort((a, b) => {
    if (!!a.st !== !!b.st) return a.st ? 1 : -1;
    if (sort === 'name') return cname(a.c).localeCompare(cname(b.c));
    if (sort === 'last') return lt(a) < lt(b) ? -1 : lt(a) > lt(b) ? 1 : 0;
    if (sort === 'end') return ((a.c.summary || {}).weeksLeft ?? 99) - ((b.c.summary || {}).weeksLeft ?? 99);
    return TT_URG(b.f) - TT_URG(a.f) || cname(a.c).localeCompare(cname(b.c));
  });
  const tiles =
    '<div class="dash-tiles tt-tiles">' +
    DASH_TILES.map(([k, lab]) => {
      const n = cnt(k);
      return (
        '<button class="dtile' + (fil === k ? ' on' : '') + (n && k !== 'ok' ? ' hot' : '') + '" data-act="dashF" data-v="' + k + '" type="button"><b>' + n + '</b><span>' + esc($t(lab)) + '</span></button>'
      );
    }).join('') +
    '</div>';
  const seg =
    '<div class="seg">' +
    [
      ['', 'Alle'],
      ['online', 'Online'],
      ['praesenz', 'Präsenz'],
      ['hybrid', 'Hybrid']
    ]
      .map(o => '<button class="' + (md === o[0] ? 'on' : '') + '" data-act="dashMode" data-v="' + o[0] + '" type="button">' + esc($t(o[1])) + '</button>')
      .join('') +
    '</div>';
  const th = (k, lab) =>
    '<th' + (k ? ' class="tt-sort' + (sort === k ? ' on' : '') + '" data-act="ttSort" data-v="' + k + '"' : '') + '>' + esc($t(lab)) + '</th>';
  const allOn = L.length && L.every(x => ttPick.has(x.c.id));
  const tpl = q && typeof tplsNeed === 'function' ? (tplsNeed() || []).filter(t => t.name.toLowerCase().includes(q)) : [];
  return (
    pageTop(
      $t('Team'),
      '',
      all.length ? $tf('{n} Athleten · {a} brauchen Aufmerksamkeit', { n: all.length, a: all.length - cnt('ok') }) : $t('Lade deine Athleten und schick Einladungen.')
    ) +
    '<div class="tt-grid' + (ui.ttSel && all.some(c => c.id === ui.ttSel) ? ' has-side' : '') + '"><div class="tt-main stack">' +
    (ADMIN.err ? note('red', esc(ADMIN.err), '<button class="btn sm" data-act="adminReload" type="button">' + $t('Neu laden') + '</button>') : '') +
    '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn brand" data-act="inviteNew" type="button">' +
    $t('+ Athlet einladen') +
    '</button><a class="btn fog" href="#admin/vorlagen">' +
    $t('Vorlagen') +
    '</a><a class="btn fog" href="#admin/profil">' +
    $t('Profil') +
    '</a><a class="btn fog" href="#plan/me">' +
    $t('Mein Plan') +
    '</a><div class="grow"></div><input id="dash-q" type="search" placeholder="' +
    esc($t('Athleten oder Vorlagen suchen')) +
    '" value="' +
    esc(ui.dashQ || '') +
    '" style="width:300px"><button class="iconbtn" data-act="adminReload" type="button" aria-label="' +
    esc($t('Neu laden')) +
    '">' +
    ICON.sync +
    '</button></div><div id="dash-body" class="stack">' +
    (all.length ? tiles : '') +
    (tpl.length
      ? '<div class="card flush"><div class="list">' +
        tpl.map(t => '<a class="li" href="#plan/tpl:' + t.id + '"><div class="grow"><b>' + esc(t.name) + '</b><small>' + $t('Vorlage') + '</small></div></a>').join('') +
        '</div></div>'
      : '') +
    (all.length
      ? '<div class="row" style="gap:12px;align-items:center">' +
        seg +
        '<div class="grow"></div>' +
        (fil ? '<button class="btn sm fog" data-act="dashF" data-v="" type="button">' + $t('Alle zeigen') + '</button>' : '') +
        '</div>' +
        ttBar()
      : '') +
    (ADMIN.clients == null
      ? '<p class="muted">' + $t('Lade …') + '</p>'
      : all.length
        ? L.length
          ? '<div class="card flush tt-wrap"><table class="tt"><thead><tr><th class="tt-ck"><input type="checkbox" data-act="ttAll"' +
            (allOn ? ' checked' : '') +
            ' aria-label="' +
            esc($t('Alle auswählen')) +
            '"></th>' +
            th('name', 'Name') +
            th('urg', 'Braucht Aufmerksamkeit') +
            th('', 'Training') +
            th('', 'Ernährung') +
            th('', 'Gewohnheiten') +
            th('', 'Fragebogen') +
            th('last', 'Letzte Aktivität') +
            '<th></th></tr></thead><tbody>' +
            L.map(ttRow).join('') +
            '</tbody></table></div><p class="small muted" style="margin:0 4px">' +
            $t('Training: Punkte pro Einheit dieser Woche (grün erledigt, gelb angefangen oder verschoben, rot ausgelassen, grau offen), darunter die Umsetzung der letzten Wochen. Ernährung: erfasste Tage der letzten 7 Tage und Ø Kalorien zum Ziel. „Erledigt“ blendet die Hinweise aus, bis sich beim Athleten etwas ändert.') +
            '</p>'
          : '<p class="muted">' + $t('Niemand in diesem Filter.') + '</p>'
        : '<div class="card"><h2>' +
          $t('Noch keine Athleten') +
          '</h2><p>' +
          $t('Erstell eine Einladung. Dein Athlet installiert die App, wählt „Einladungscode“ und gibt den Code ein. Danach siehst du ihn hier.') +
          '</p></div>') +
    '</div>' +
    ttExtra() +
    '<p class="small muted" style="margin:0 4px">' +
    $t('Tipp: Klick auf eine Zeile zeigt rechts Werte und Notizen. Doppelklick öffnet die Athletenansicht.') +
    '</p></div>' +
    ttPanel(all) +
    '</div>'
  );
}
hbWrap('viewAdmin', 'teamtab', function (__next, arg) {
  const h = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  if (arg || !ttOn()) return h;
  try {
    return viewTeamTable();
  } catch (e) {
    logErr('teamtab:view', e);
    return h;
  }
});
/* Body-Klasse für die volle Breite */
hbWrap('render', 'teamtab', function (__next) {
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  queueMicrotask(() => {
    if (document.body) document.body.classList.toggle('dk-team', route.name === 'admin' && !route.arg && ttOn());
  });
  return r;
});
if (TT_MQ.addEventListener)
  TT_MQ.addEventListener('change', () => {
    if (route && route.name === 'admin' && !route.arg) render();
  });

/* ---------- Mehrfachaktionen ---------- */
const ttPicked = () => (ADMIN.clients || []).filter(c => ttPick.has(c.id));
const ttFirst = c => String(cname(c) || '').split(/\s+/)[0];
function ttTplSheet() {
  const T = tplsNeed();
  openSheet(
    sheetHead($t('Vorlage zuweisen')) +
      '<p class="small muted" style="margin-top:6px">' +
      esc($tf('für {n} Athleten', { n: ttPick.size })) +
      '</p>' +
      (T == null
        ? '<p class="muted">' + $t('Lade …') + '</p>'
        : T.length
          ? '<div class="card flush" style="margin-top:10px"><div class="list">' +
            T.map(
              t =>
                '<button class="li" style="width:100%;text-align:left;border:0;background:none;font:inherit;color:inherit" data-act="ttTplGo" data-id="' +
                t.id +
                '" type="button"><div class="grow"><b>' +
                esc(t.name) +
                '</b>' +
                ((t.tags || {}).folder ? '<small>' + esc(t.tags.folder) + '</small>' : '') +
                '</div></button>'
            ).join('') +
            '</div></div>'
          : '<p>' + $t('Noch keine Vorlagen. Leg sie unter „Vorlagen“ an.') + '</p>')
  );
}
function ttHabSheet() {
  const kinds = HB_KINDS();
  openSheet(
    sheetHead($t('Gewohnheit zuweisen')) +
      '<p class="small muted" style="margin-top:6px">' +
      esc($tf('Wird bei {n} Athleten zum Plan hinzugefügt. Bestehende Gewohnheiten bleiben.', { n: ttPick.size })) +
      '</p><div class="fields" style="margin-top:10px"><div class="field"><label for="tth-kind">' +
      $t('Art') +
      '</label><select id="tth-kind">' +
      kinds.map(x => '<option value="' + x[0] + '">' + esc(x[1]) + '</option>').join('') +
      '</select></div><div class="field"><label for="tth-n">' +
      $t('Ziel') +
      '</label><input id="tth-n" type="number" inputmode="decimal" step="any" placeholder="' +
      esc($t('Standard')) +
      '" style="width:110px"></div><div class="field" style="flex:1 1 100%"><label for="tth-t">' +
      $t('Aufgabe') +
      '</label><input id="tth-t" type="text" maxlength="80" placeholder="' +
      esc($t('nur bei „Eigene Aufgabe“, z. B. 10 Minuten Mobility')) +
      '" style="width:100%"></div></div><p class="small muted">' +
      $t('Gilt täglich. Wochentage kannst du danach im Plan des Athleten ändern.') +
      '</p><button class="btn brand block" style="margin-top:12px" data-act="ttHabGo" type="button">' +
      $t('Hinzufügen') +
      '</button>'
  );
}
async function ttHabGo() {
  const k = (document.getElementById('tth-kind') || {}).value || 'steps';
  const def = (HB_KINDS().find(x => x[0] === k) || [])[2];
  const n = num((document.getElementById('tth-n') || {}).value) || def || null;
  const t = String((document.getElementById('tth-t') || {}).value || '').trim();
  if (k === 'task' && !t) {
    toast($t('Beschreib die Aufgabe kurz.'));
    return;
  }
  const L = ttPicked();
  let ok = 0,
    skip = 0;
  for (const c of L) {
    try {
      const r = await api('/rest/v1/plans?user_id=eq.' + c.id + '&select=plan');
      const p = r && r[0] && r[0].plan;
      if (!p) {
        skip++;
        continue;
      }
      const np = Object.assign({}, p);
      np.habits = (Array.isArray(p.habits) ? p.habits : []).concat({ id: uid(), kind: k, n: k === 'task' ? null : n, t: k === 'task' ? t : '', days: [] });
      np.v = (p.v || 1) + 1;
      await pushPlan(c.id, np);
      ok++;
    } catch (e) {
      logErr('teamtab:hab', e, 1);
    }
  }
  closeSheet();
  toast(
    $tf('Gewohnheit bei {n} Athleten hinzugefügt', { n: ok }) + (skip ? ' · ' + $tf('{n} ohne Plan übersprungen', { n: skip }) : '')
  );
}
function ttMsgSheet() {
  openSheet(
    sheetHead($t('Sammelnachricht')) +
      '<p class="small muted" style="margin-top:6px">' +
      esc($tf('Geht einzeln an {n} Athleten, jeder sieht nur seinen eigenen Chat. {name} wird durch den Vornamen ersetzt.', { n: ttPick.size, name: '{name}' })) +
      '</p><textarea id="ttm-body" rows="5" maxlength="2000" style="width:100%;margin-top:10px;font-family:var(--f);font-size:15px" placeholder="' +
      esc($t('Hallo {name}, kurze Erinnerung: Check-in bis Sonntag.')) +
      '"></textarea><button class="btn brand block" style="margin-top:12px" data-act="ttMsgGo" type="button">' +
      $t('Senden') +
      '</button>'
  );
}
async function ttMsgGo() {
  const body = String((document.getElementById('ttm-body') || {}).value || '').trim();
  if (!body) {
    toast($t('Schreib zuerst eine Nachricht.'));
    return;
  }
  const btn = document.querySelector('#sheet [data-act="ttMsgGo"]');
  if (btn) btn.disabled = true;
  let ok = 0;
  for (const c of ttPicked()) {
    try {
      await chatSend(chatPair(c.id), body.split('{name}').join(ttFirst(c)));
      ok++;
    } catch (e) {
      logErr('teamtab:msg', e, 1);
    }
  }
  closeSheet();
  toast($tf('An {n} Athleten gesendet', { n: ok }));
}

/* ---------- Klicks ---------- */
document.addEventListener('click', e => {
  const pk = e.target.closest('[data-ttpick]');
  if (pk) {
    const id = pk.dataset.ttpick;
    if (pk.checked) ttPick.add(id);
    else ttPick.delete(id);
    render();
    return;
  }
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'ttSel') {
    if (e.target.closest('a,button,input') && e.target.closest('a,button,input') !== b) return;
    ui.ttSel = ui.ttSel === b.dataset.uid ? '' : b.dataset.uid;
    render();
  } else if (a === 'ttAll') {
    const ids = Array.from(document.querySelectorAll('[data-ttpick]')).map(x => x.dataset.ttpick);
    const on = b.checked;
    ids.forEach(id => (on ? ttPick.add(id) : ttPick.delete(id)));
    render();
  } else if (a === 'ttNone') {
    ttPick.clear();
    render();
  } else if (a === 'ttSort') {
    ui.dashSort = b.dataset.v;
    render();
  } else if (a === 'ttSnooze') {
    S.settings.ttSnooze = Object.assign({}, S.settings.ttSnooze, { [b.dataset.uid]: addDays(today(), 3) });
    save();
    toast($t('3 Tage pausiert'));
    render();
  } else if (a === 'ttWake') {
    S.settings.ttSnooze = Object.assign({}, S.settings.ttSnooze);
    delete S.settings.ttSnooze[b.dataset.uid];
    save();
    render();
  } else if (a === 'ttDone') {
    const c = (ADMIN.clients || []).find(x => x.id === b.dataset.uid);
    if (!c) return;
    S.settings.ttDone = Object.assign({}, S.settings.ttDone);
    if (b.dataset.on) delete S.settings.ttDone[c.id];
    else S.settings.ttDone[c.id] = ttSig(dashFlags(c));
    save();
    render();
  } else if (a === 'ttTpl') ttTplSheet();
  else if (a === 'ttTplGo') {
    const ids = [...ttPick];
    tplAssignSheet(b.dataset.id);
    ids.forEach(id => {
      const x = document.querySelector('#sheet [data-tplu="' + id + '"]');
      if (x) x.checked = true;
    });
  } else if (a === 'ttHab') ttHabSheet();
  else if (a === 'ttHabGo') ttHabGo();
  else if (a === 'ttMsg') ttMsgSheet();
  else if (a === 'ttMsgGo') ttMsgGo();
});
document.addEventListener('dblclick', e => {
  const r = e.target.closest('tr.tt-r');
  if (r && !e.target.closest('a,button,input')) location.hash = '#admin/' + r.dataset.uid;
});
