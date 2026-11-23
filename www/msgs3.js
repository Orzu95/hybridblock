/* Hybridblock – Desktop D6: Nachrichten in 3 Spalten (ab 1200 px, nur Coach)
   Links Gesprächsliste mit Filter (Alle / Ungelesen / Wartet auf Antwort) und Namenssuche,
   Mitte der bestehende Chat mit Textbausteinen ({name}) und Abspieltempo für Sprachnachrichten,
   rechts Spickzettel zum Athleten (Plan, Woche, Einschränkungen, Kennzahlen, Notizen).
   Unter 1200 px bleiben #chats und #chat/<id> wie bisher. */
'use strict';
const M3_MQ = window.matchMedia ? window.matchMedia('(min-width:1200px)') : { matches: false };
const M3 = { inner: false, uid: null, drafts: {}, notesWait: null };
const m3Client = id => (ADMIN.clients || []).find(c => c.id === id);
const m3On = () =>
  !!(
    M3_MQ.matches &&
    typeof isAdmin === 'function' &&
    isAdmin() &&
    !VIEW &&
    route &&
    (route.name === 'chats' || (route.name === 'chat' && route.arg && (ADMIN.clients == null || m3Client(route.arg))))
  );
const m3First = c => String(cname(c) || '').split(' ')[0];
const M3_SNIPS = ['Hi {name}, wie lief das Training heute?', 'Starke Woche, {name}! Weiter so 💪', 'Denk bitte an deinen Check-in, {name}.', 'Danke dir, {name}! Ich schau es mir an und melde mich.'];
const m3Snips = () => (Array.isArray(S.settings.snips) ? S.settings.snips : M3_SNIPS.map(x => $t(x)));

/* letzte Nachricht: geladener Verlauf ist aktueller als die Übersicht */
function m3Last(uid) {
  const a = (CHATS_LAST || {})[uid];
  const p = chatPair(uid);
  const L = p && CHAT.list[chatKey(p)];
  const b = L && L.length ? L[L.length - 1] : null;
  if (!b) return a || null;
  return !a || b.created_at >= a.created_at ? b : a;
}
const m3Waits = uid => {
  const m = m3Last(uid);
  return !!(m && m.sender !== AUTH.uid);
};

/* Linke Spalte */
function m3List(cur) {
  const f = ui.m3f || 'all',
    q = String(ui.m3q || '')
      .trim()
      .toLowerCase();
  const all = (ADMIN.clients || []).slice().sort((a, b) => {
    const x = m3Last(a.id),
      y = m3Last(b.id);
    return (y ? y.created_at : '') > (x ? x.created_at : '') ? 1 : -1;
  });
  const cnt = { all: all.length, unread: all.filter(c => chatUnreadFor(c.id)).length, wait: all.filter(c => m3Waits(c.id)).length };
  const cl = all.filter(c => (f === 'unread' ? chatUnreadFor(c.id) : f === 'wait' ? m3Waits(c.id) : true));
  const chip = (k, t) =>
    '<button class="chip' + (f === k ? ' on' : '') + '" data-act="m3F" data-v="' + k + '" type="button">' + esc($t(t)) + ' <i>' + cnt[k] + '</i></button>';
  return (
    '<aside class="m3-list"><div class="m3-lh"><h1>' +
    $t('Chats') +
    '</h1><input id="m3q" type="search" autocomplete="off" placeholder="' +
    esc($t('Name suchen')) +
    '" value="' +
    esc(ui.m3q || '') +
    '"><div class="m3-chips">' +
    chip('all', 'Alle') +
    chip('unread', 'Ungelesen') +
    chip('wait', 'Wartet auf Antwort') +
    '</div></div><div class="m3-items">' +
    (cl.length
      ? cl
          .map(c => {
            const m = m3Last(c.id),
              n = chatUnreadFor(c.id),
              hide = q && cname(c).toLowerCase().indexOf(q) < 0 && String(c.username || '').toLowerCase().indexOf(q) < 0;
            return (
              '<a class="m3-li' +
              (c.id === cur ? ' on' : '') +
              (n ? ' un' : '') +
              '" href="#chat/' +
              c.id +
              '" data-n="' +
              esc((cname(c) + ' ' + (c.username || '')).toLowerCase()) +
              '"' +
              (hide ? ' hidden' : '') +
              '><span class="badge gym">' +
              esc(cname(c).slice(0, 1).toUpperCase()) +
              '</span><div class="grow" style="min-width:0"><div class="row" style="gap:6px;flex-wrap:nowrap"><b class="grow m3-nm">' +
              esc(cname(c)) +
              '</b><small class="muted">' +
              (m ? esc(ago(m.created_at)) : '') +
              '</small></div><small class="m3-pv">' +
              (m
                ? (m.sender === AUTH.uid ? $t('Du: ') : '') + esc(m.body || (m.audio ? $t('Sprachnachricht') : $t('Foto')))
                : $t('Noch keine Nachrichten')) +
              '</small></div>' +
              (n ? '<span class="cnt">' + n + '</span>' : m && m.sender !== AUTH.uid ? '<span class="m3-dot" title="' + esc($t('Wartet auf Antwort')) + '"></span>' : '') +
              '</a>'
            );
          })
          .join('')
      : '<p class="muted small" style="padding:8px 4px">' +
        (ADMIN.clients == null ? $t('Lade …') : all.length ? $t('Keine Gespräche in diesem Filter.') : $t('Noch keine Athleten im Team.')) +
        '</p>') +
    '</div></aside>'
  );
}

/* Mitte: bestehender Chat ohne Kopf */
function m3Chat(uid) {
  const c = m3Client(uid);
  ui.chatKeepScroll = true;
  M3.inner = true;
  let h;
  try {
    h = viewChat(uid);
  } finally {
    M3.inner = false;
  }
  const i = h.indexOf('<div class="stack">');
  setTimeout(() => {
    const L = document.getElementById('chatlist');
    if (L) L.scrollTop = L.scrollHeight;
  }, 0);
  const own = Array.isArray(S.settings.snips);
  const snips = m3Snips()
    .map(
      (s, j) =>
        '<span class="m3-sn"><button class="chip" data-act="m3Snip" data-i="' +
        j +
        '" type="button" title="' +
        esc(s) +
        '">' +
        esc(s.length > 34 ? s.slice(0, 33) + '…' : s) +
        '</button>' +
        (own ? '<button class="m3-snx" data-act="m3SnipDel" data-i="' + j + '" type="button" aria-label="' + esc($t('Baustein entfernen')) + '">✕</button>' : '') +
        '</span>'
    )
    .join('');
  const rate = ui.m3rate || 1;
  return (
    '<section class="m3-chat"><div class="m3-ch"><div class="grow" style="min-width:0"><h2>' +
    esc(c ? cname(c) : $t('Athlet')) +
    '</h2><small class="muted">' +
    $t('Nur ihr beide seht diesen Chat.') +
    '</small></div><button class="btn sm ghost" data-act="m3Rate" type="button" title="' +
    esc($t('Abspieltempo für Sprachnachrichten')) +
    '">▶ ' +
    (rate === 1 ? '1' : esc(fmt(rate, 1))) +
    '×</button><a class="btn sm ghost" href="#admin/' +
    uid +
    '">' +
    $t('Cockpit öffnen') +
    '</a></div>' +
    (i < 0 ? h : h.slice(i)) +
    '<div class="m3-snips"><small class="muted">' +
    $t('Textbausteine') +
    '</small>' +
    snips +
    '<button class="chip ghost" data-act="m3SnipAdd" type="button" title="' +
    esc($t('Aktuellen Text als Baustein speichern. {name} wird durch den Vornamen ersetzt.')) +
    '">+ ' +
    $t('Baustein') +
    '</button></div></section>'
  );
}

/* Rechts: Spickzettel */
function m3Side(uid) {
  const c = m3Client(uid);
  if (!c) return '<aside class="m3-side"></aside>';
  const s = c.summary || {};
  const pain = String(s.pain || '')
    .split(',')
    .filter(Boolean);
  const kv = (k, v) => (v == null || v === '' ? '' : '<div class="m3-kv"><span>' + esc($t(k)) + '</span><b>' + v + '</b></div>');
  const of = (a, b, u) => (a == null ? null : esc(fmt(a, 0)) + (b ? ' / ' + esc(fmt(b, 0)) : '') + (u ? ' ' + esc($t(u)) : ''));
  const facts =
    kv('Plan', s.plan ? esc($t(s.plan)) : null) +
    kv('Woche', s.week ? esc(s.week) + (s.nw ? '/' + esc(s.nw) : '') : null) +
    kv('Einheiten diese Woche', s.total ? esc(s.done || 0) + ' / ' + esc(s.total) : null) +
    kv('Letztes Training', s.lastTrain ? esc(ago(s.lastTrain)) : null) +
    kv('Trendgewicht', s.trend != null ? esc(fmt(s.trend, 1)) + esc($t(' kg')) + (s.target != null ? ' → ' + esc(fmt(s.target, 1)) + esc($t(' kg')) : '') : null) +
    kv('Kalorien Ø 7 Tage', of(s.kcal7, s.kcalT, 'kcal')) +
    kv('Protein Ø 7 Tage', of(s.prot7, s.protT, 'g')) +
    kv('Tage geloggt', s.logged7 != null ? esc(s.logged7) + ' / 7' : null) +
    kv('Schlaf Ø', s.sleep7 != null ? esc(fmtMin(s.sleep7)) : null) +
    kv('Schritte Ø', s.steps7 != null ? esc(fmt(s.steps7, 0)) : null) +
    kv('Readiness', s.ready != null ? esc(s.ready) : null) +
    kv('Sync', c.updated_at ? esc(ago(c.updated_at)) : null);
  if (ADMIN.notes == null || ADMIN.notes[uid] === undefined) M3.notesWait = uid;
  return (
    '<aside class="m3-side stack"><div class="card"><h2>' +
    $t('Spickzettel') +
    '</h2>' +
    (pain.length
      ? '<div class="ck-lim" style="margin:6px 0 8px"><b>' +
        $t('Einschränkungen') +
        '</b> ' +
        pain.map(r => '<span>' + esc(typeof REGION_TXT !== 'undefined' && REGION_TXT[r] ? REGION_TXT[r] : r) + '</span>').join('') +
        '</div>'
      : '') +
    (facts || '<p class="small muted">' + $t('Noch keine Daten vom Athleten.') + '</p>') +
    '<a class="btn sm ghost" style="margin-top:10px" href="#admin/' +
    uid +
    '">' +
    $t('Cockpit öffnen') +
    '</a></div>' +
    notesCard(uid) +
    '</aside>'
  );
}

function m3View(uid) {
  if (ADMIN.clients == null && !ADMIN.loading)
    loadClients().then(() => {
      if (m3On()) render();
    });
  if (CHATS_LAST == null && !CHATS_LOADING)
    chatsLoad().then(() => {
      if (m3On()) render();
    });
  /* Entwurf je Gespräch merken */
  if (M3.uid !== uid) {
    if (M3.uid) M3.drafts[M3.uid] = ui.chatDraft || '';
    if (M3.uid !== null || uid) ui.chatDraft = (uid && M3.drafts[uid]) || '';
    M3.uid = uid;
  }
  return (
    '<div class="m3">' +
    m3List(uid) +
    (uid
      ? m3Chat(uid) + m3Side(uid)
      : '<section class="m3-chat m3-empty"><div><b>' +
        $t('Wähle links ein Gespräch.') +
        '</b><p class="small muted">' +
        $t('Mit „Wartet auf Antwort“ siehst du, wer zuletzt geschrieben hat.') +
        '</p></div></section><aside class="m3-side"></aside>') +
    '</div>'
  );
}

hbWrap('viewChats', 'msgs3', function (__next) {
  if (!m3On()) return __next.apply(this, Array.prototype.slice.call(arguments, 1));
  try {
    return m3View(null);
  } catch (e) {
    logErr('msgs3:list', e);
    return __next.apply(this, Array.prototype.slice.call(arguments, 1));
  }
});
hbWrap('viewChat', 'msgs3', function (__next, arg) {
  const rest = Array.prototype.slice.call(arguments, 1);
  if (M3.inner || !m3On() || route.name !== 'chat' || !arg || arg !== route.arg) return __next.apply(this, rest);
  try {
    return m3View(arg);
  } catch (e) {
    logErr('msgs3:view', e);
    return __next.apply(this, rest);
  }
});
hbWrap('render', 'msgs3', function (__next) {
  const ta = document.querySelector('.m3-chat #chat-text');
  if (ta) ui.chatDraft = ta.value;
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  queueMicrotask(() => {
    if (document.body) document.body.classList.toggle('dk-m3', m3On());
  });
  return r;
});
if (M3_MQ.addEventListener)
  M3_MQ.addEventListener('change', () => {
    if (route && (route.name === 'chat' || route.name === 'chats')) render();
  });

/* Übersicht alle 20 s auffrischen, Notizen nachladen */
setInterval(() => {
  if (!m3On() || document.visibilityState !== 'visible') return;
  const before = JSON.stringify(CHATS_LAST || {});
  chatsLoad()
    .then(() => {
      if (m3On() && JSON.stringify(CHATS_LAST || {}) !== before) render();
    })
    .catch(() => {});
}, 20000);
setInterval(() => {
  const u = M3.notesWait;
  if (!u || !m3On()) return;
  if (ADMIN.notes && Array.isArray(ADMIN.notes[u])) {
    M3.notesWait = null;
    render();
  }
}, 700);

/* Suche ohne Neuzeichnen filtern */
document.addEventListener('input', e => {
  if (e.target.id !== 'm3q') return;
  ui.m3q = e.target.value;
  const q = ui.m3q.trim().toLowerCase();
  document.querySelectorAll('.m3-li').forEach(a => {
    a.hidden = !!q && a.dataset.n.indexOf(q) < 0;
  });
});
/* Abspieltempo auf Sprachnachrichten anwenden */
document.addEventListener(
  'play',
  e => {
    const a = e.target;
    if (a && a.tagName === 'AUDIO' && a.closest('.m3-chat')) a.playbackRate = ui.m3rate || 1;
  },
  true
);
function m3Insert(txt) {
  const ta = document.getElementById('chat-text');
  if (!ta) return;
  const a = ta.selectionStart != null ? ta.selectionStart : ta.value.length,
    b = ta.selectionEnd != null ? ta.selectionEnd : ta.value.length;
  ta.value = ta.value.slice(0, a) + txt + ta.value.slice(b);
  ui.chatDraft = ta.value;
  ta.focus();
  ta.selectionStart = ta.selectionEnd = a + txt.length;
  ta.dispatchEvent(new Event('input', { bubbles: true }));
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-act^="m3"]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'm3F') {
    ui.m3f = b.dataset.v;
    render();
  } else if (a === 'm3Rate') {
    const R = [1, 1.5, 2];
    ui.m3rate = R[(R.indexOf(ui.m3rate || 1) + 1) % R.length];
    document.querySelectorAll('.m3-chat audio').forEach(x => {
      x.playbackRate = ui.m3rate;
    });
    render();
  } else if (a === 'm3Snip') {
    const c = m3Client(route.arg);
    const s = m3Snips()[+b.dataset.i] || '';
    m3Insert(s.split('{name}').join(c ? m3First(c) : ''));
  } else if (a === 'm3SnipAdd') {
    const ta = document.getElementById('chat-text');
    let t = ta ? ta.value.trim() : '';
    if (!t) return toast($t('Schreib zuerst den Text ins Nachrichtenfeld.'), 'soft');
    const c = m3Client(route.arg);
    const fn = c && m3First(c);
    if (fn && fn.length > 1) t = t.split(fn).join('{name}');
    S.settings.snips = m3Snips().concat([t]).slice(-12);
    save();
    toast($t('Baustein gespeichert'));
    render();
  } else if (a === 'm3SnipDel') {
    const L = m3Snips().slice();
    L.splice(+b.dataset.i, 1);
    S.settings.snips = L;
    save();
    render();
  }
});
/* Enter sendet, Umschalt+Enter macht eine neue Zeile */
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
  const ta = e.target;
  if (!ta || ta.id !== 'chat-text' || !ta.closest('.m3-chat')) return;
  e.preventDefault();
  const b = document.querySelector('.m3-chat [data-act="chatSend"]');
  if (b && !b.disabled) b.click();
});
