/* Hybridblock – Desktop D3: Athleten-Cockpit in 3 Spalten (ab 1200 px, nur Coach)
   Kopf mit Name, Ziel, Plan, Einschränkungen. Links Stammakte (Betreuung, Kennzahlen, Kurzverläufe 28 Tage, Notizen, Konto),
   Mitte Reiter (Überblick, Plan, Check-ins & Formchecks, Fortschritt, Termine), rechts Chat dauerhaft offen inkl. Sprachnachricht.
   Die Karten kommen unverändert aus viewClient und seinen Filtern; hier werden sie nach dem Rendern nur in Spalten verteilt.
   Unter 1200 px bleibt die Athletenansicht einspaltig. */
'use strict';
const CK_MQ = window.matchMedia ? window.matchMedia('(min-width:1200px)') : { matches: false };
const ckClient = id => (ADMIN.clients || []).find(c => c.id === id);
const ckOn = () => !!(CK_MQ.matches && typeof isAdmin === 'function' && isAdmin() && !VIEW && route && route.name === 'admin' && route.arg && ckClient(route.arg));
const CK_TABS = [
  ['ueber', 'Überblick'],
  ['plan', 'Plan'],
  ['check', 'Check-ins'],
  ['prog', 'Fortschritt'],
  ['appt', 'Termine']
];

/* Kurzverläufe: Athlet lädt die letzten 28 Tage kompakt mit hoch (Gewichtstrend, Schlaf, Schritte, Ruhepuls) */
hbFilter('makeSummary', 'cockpit', function (s) {
  try {
    const ser = series();
    const tr = {};
    ser.forEach(p => {
      if (p.d) tr[p.d] = p.trend;
    });
    const sp = { w: [], sl: [], st: [], r: [] };
    for (let i = 27; i >= 0; i--) {
      const d = addDays(today(), -i),
        h = S.health[d] || {};
      sp.w.push(tr[d] != null ? Math.round(tr[d] * 10) / 10 : null);
      sp.sl.push(h.sleepMin != null ? Math.round(h.sleepMin) : null);
      sp.st.push(h.steps != null ? Math.round(h.steps) : null);
      const r = h.rhr ?? h.rhrEst;
      sp.r.push(r != null ? Math.round(r) : null);
    }
    if (Object.values(sp).some(a => a.some(v => v != null))) s.sp = sp;
  } catch (e) {}
  try {
    s.tz = Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch (e) {}
  return s;
});
function ckSpark(a, lab, fmtV) {
  const v = (a || []).map((x, i) => [i, x]).filter(p => p[1] != null);
  if (v.length < 2) return '';
  const ys = v.map(p => p[1]),
    lo = Math.min(...ys),
    hi = Math.max(...ys),
    W = 120,
    H = 32,
    n = (a.length || 28) - 1;
  const pts = v.map(p => ((p[0] / n) * W).toFixed(1) + ',' + (hi === lo ? H / 2 : H - 3 - ((p[1] - lo) / (hi - lo)) * (H - 6)).toFixed(1)).join(' ');
  const lastV = ys[ys.length - 1];
  return (
    '<div class="ck-sp"><div><span>' +
    esc(lab) +
    '</span><b>' +
    esc(fmtV(lastV)) +
    '</b></div><svg viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" preserveAspectRatio="none" aria-hidden="true"><polyline points="' +
    pts +
    '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></div>'
  );
}
function ckSparks(s) {
  const sp = s.sp;
  if (!sp) return '';
  const h =
    ckSpark(sp.w, $t('Trendgewicht'), x => fmt(x, 1) + $t(' kg')) +
    ckSpark(sp.sl, $t('Schlaf'), x => fmtMin(x)) +
    ckSpark(sp.st, $t('Schritte'), x => fmt(x, 0)) +
    ckSpark(sp.r, $t('Ruhepuls'), x => String(x));
  return h ? '<div class="card ck-spcard"><h2>' + $t('Letzte 28 Tage') + '</h2>' + h + '</div>' : '';
}

/* Kopf */
function ckHead(c) {
  const s = c.summary || {};
  const pain = String(s.pain || '')
    .split(',')
    .filter(Boolean);
  const bits = [];
  if (s.plan) bits.push($t('Plan: ') + esc($t(s.plan)) + (s.week ? ' · ' + $t('Woche ') + esc(s.week) + (s.nw ? '/' + esc(s.nw) : '') : ''));
  if (s.target != null) bits.push($t('Ziel ') + esc(fmt(s.target, 1)) + $t(' kg') + (s.trend != null ? ' (' + $t('jetzt ') + esc(fmt(s.trend, 1)) + $t(' kg') + ')' : ''));
  bits.push($t('Sync ') + esc(ago(c.updated_at)));
  if (s.tz && typeof m3LocalTime === 'function' && m3LocalTime(s.tz)) bits.push($t('Ortszeit') + ' ' + m3LocalTime(s.tz));
  return (
    '<div class="ck-head"><a href="#admin" class="back">' +
    ICON.back +
    $t('Team') +
    '</a><div class="row" style="align-items:flex-end;gap:16px;flex-wrap:wrap"><div class="grow"><h1 class="ck-name">' +
    esc(cname(c)) +
    '</h1><p class="small muted" style="margin:2px 0 0">@' +
    esc(c.username || '') +
    ' · ' +
    bits.join(' · ') +
    '</p></div>' +
    (pain.length
      ? '<div class="ck-lim" title="' +
        esc($t('Einschränkungen laut Körperkarte')) +
        '"><b>' +
        $t('Einschränkungen') +
        '</b> ' +
        pain.map(r => '<span>' + esc(typeof REGION_TXT !== 'undefined' && REGION_TXT[r] ? REGION_TXT[r] : r) + '</span>').join('') +
        '</div>'
      : '') +
    '</div></div>'
  );
}

/* Chat rechts: viewChat ohne Kopf, eigener Abruf */
function ckChat(uid2) {
  const p = chatPair(uid2);
  if (!p) return '';
  const k = chatKey(p);
  if (CHAT.list[k] === undefined && !CHAT.loading[k])
    chatLoad(p)
      .then(() => chatMarkRead(p))
      .catch(() => {
        CHAT.list[k] = [];
      })
      .finally(() => {
        if (ckOn() && route.arg === uid2) render();
      });
  ui.chatKeepScroll = true;
  const h = viewChat(uid2);
  const i = h.indexOf('<div class="stack">');
  setTimeout(() => {
    const L = document.getElementById('chatlist');
    if (L) L.scrollTop = L.scrollHeight;
  }, 0);
  return (
    '<aside class="ck-chat"><div class="ck-chat-h"><b>' +
    $t('Chat') +
    '</b><small class="muted">' +
    $t('Nur ihr beide seht diesen Chat.') +
    '</small></div>' +
    (i < 0 ? h : h.slice(i)) +
    '</aside>'
  );
}

function ckView(uid2, inner) {
  const c = ckClient(uid2);
  const tab = ui.ckTab || 'ueber';
  return (
    ckHead(c) +
    '<div class="ck-grid"><aside class="ck-left stack" id="ck-left">' +
    ckSparks(c.summary || {}) +
    '</aside><section class="ck-mid"><div class="ck-tabs" role="tablist">' +
    CK_TABS.map(
      t =>
        '<button class="ck-tab' +
        (tab === t[0] ? ' on' : '') +
        '" data-act="ckTab" data-v="' +
        t[0] +
        '" type="button" role="tab" aria-selected="' +
        (tab === t[0]) +
        '">' +
        esc($t(t[1])) +
        '<i data-ckcnt="' +
        t[0] +
        '"></i></button>'
    ).join('') +
    '</div><div class="stack" id="ck-mid"></div></section>' +
    ckChat(uid2) +
    '</div><div id="ck-src" hidden>' +
    inner +
    '</div>'
  );
}
/* Karte einer Spalte / einem Reiter zuordnen */
function ckSlot(el) {
  const has = q => !!el.querySelector(q) || (el.matches && el.matches(q));
  const h2 = ((el.querySelector('h2') || {}).textContent || '').trim();
  if (has('a[href^="#chat/"]') && !el.querySelector('h2')) return 'drop';
  if (has('[data-act="athMode"]')) return 'left0';
  if (el.classList.contains('stats')) return 'left1';
  if (el.classList.contains('note') && !el.querySelector('h2')) return 'left0';
  if (has('#note-new') || has('[data-act="noteAdd"]')) return 'left2';
  if (has('[data-act="resetPw"]')) return 'left3';
  if (has('#cm-box') || h2 === $t('Check-in-Fragebogen')) return 'check';
  if (has('.fz') || has('[data-act="viewAs"]')) return 'prog';
  if (h2 === $t('Gewohnheiten')) return 'ueber';
  if (has('a[href^="#plan/"]') || has('[data-act="coachLib"]')) return 'plan';
  if (h2 === $t('Gemeinsam trainieren') || has('[data-act^="appt"]')) return 'appt';
  return 'ueber';
}
function ckArrange() {
  const src = document.getElementById('ck-src');
  if (!src) return;
  const L = document.getElementById('ck-left'),
    M = document.getElementById('ck-mid');
  const st = src.querySelector('.stack');
  const kids = st ? Array.from(st.children) : [];
  const left = { left0: [], left1: [], left2: [], left3: [] };
  const cnt = {},
    by = {};
  kids.forEach(el => {
    const k = ckSlot(el);
    if (k === 'drop') return el.remove();
    if (left[k]) return left[k].push(el);
    cnt[k] = (cnt[k] || 0) + 1;
    (by[k] = by[k] || []).push(el);
  });
  /* ohne eigene Wahl: erster Reiter mit Inhalt */
  let tab = ui.ckTab;
  if (!tab) tab = (CK_TABS.find(t => cnt[t[0]]) || CK_TABS[0])[0];
  (by[tab] || []).forEach(el => M.appendChild(el));
  document.querySelectorAll('.ck-tab').forEach(b => {
    const on = b.dataset.v === tab;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on);
  });
  const spc = L.firstChild;
  left.left0.concat(left.left1).forEach(el => L.insertBefore(el, spc));
  left.left2.concat(left.left3).forEach(el => L.appendChild(el));
  if (!M.children.length)
    M.innerHTML = '<div class="card"><p class="muted" style="margin:0">' + esc($t('Hier gibt es gerade nichts.')) + '</p></div>';
  document.querySelectorAll('[data-ckcnt]').forEach(i => {
    const n = cnt[i.dataset.ckcnt] || 0;
    i.textContent = n ? String(n) : '';
  });
  /* Inhalte, die nach dem Rendern per ID gefüllt werden (Formchecks), bleiben im DOM; Rest der Quelle entfernen */
  src.remove();
}
hbWrap('viewAdmin', 'cockpit', function (__next, arg) {
  const h = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  if (!arg || !ckOn()) return h;
  try {
    return ckView(arg, h);
  } catch (e) {
    logErr('cockpit:view', e);
    return h;
  }
});
hbWrap('render', 'cockpit', function (__next) {
  /* Entwurf im Chat-Feld über Neuzeichnen hinweg behalten */
  const ta = document.querySelector('.ck-chat #chat-text');
  if (ta) ui.chatDraft = ta.value;
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  queueMicrotask(() => {
    const on = ckOn();
    if (document.body) document.body.classList.toggle('dk-ck', on);
    if (on)
      try {
        ckArrange();
      } catch (e) {
        logErr('cockpit:arrange', e);
      }
  });
  return r;
});
if (CK_MQ.addEventListener)
  CK_MQ.addEventListener('change', () => {
    if (route && route.name === 'admin' && route.arg) render();
  });
/* Chat im Cockpit alle 8 s abrufen */
setInterval(() => {
  if (!ckOn() || document.visibilityState !== 'visible') return;
  const p = chatPair(route.arg);
  if (!p) return;
  const k = chatKey(p),
    n = (CHAT.list[k] || []).length;
  chatLoad(p)
    .then(L => {
      if (L.length !== n && ckOn()) render();
      chatMarkRead(p);
    })
    .catch(() => {});
}, 8000);
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act="ckTab"]');
  if (!b) return;
  ui.ckTab = b.dataset.v;
  render();
});
/* Enter sendet im Cockpit-Chat, Umschalt+Enter macht eine neue Zeile */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
  const ta = e.target;
  if (!ta || ta.id !== 'chat-text' || !ta.closest('.ck-chat')) return;
  e.preventDefault();
  const b = document.querySelector('.ck-chat [data-act="chatSend"]');
  if (b && !b.disabled) b.click();
});
