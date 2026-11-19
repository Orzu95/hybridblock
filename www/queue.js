/* Hybridblock – Desktop D4: Prüf-Warteschlange für Check-ins und Formchecks (#admin/pruefen, nur Coach)
   Reiter „Zu prüfen / Überfällig / Erledigt“. Links die Liste, Mitte Fragebogen neben der Vorwoche mit Differenzen,
   Formcheck-Video mit Zeitlupe und Kommentaren an der Videostelle oder Check-in-Fotos neben dem vorigen Foto,
   rechts Antwort per Text oder Sprachnachricht und „Senden & nächster“. Auf dem Handy untereinander. */
'use strict';
const QX = { media: null, loading: false, at: 0, urls: {} };
async function qLoad(force) {
  if (QX.loading || (!force && QX.media && Date.now() - QX.at < 60000)) return;
  QX.loading = true;
  try {
    const L = await api(
      '/rest/v1/media_items?owner_id=neq.' +
        AUTH.uid +
        '&select=id,owner_id,kind,path,meta,comments,created_at,seen_at&order=created_at.desc&limit=150'
    );
    QX.media = L || [];
    QX.media.forEach(x => {
      if (typeof CMX !== 'undefined') CMX.items[x.id] = x;
    });
    QX.at = Date.now();
  } catch (e) {
    if (!QX.media) QX.media = [];
    logErr('queue:load', e, 1);
  } finally {
    QX.loading = false;
    if (route.name === 'admin' && route.arg === 'pruefen') render();
  }
}
const qDays = d => daysBetween(String(d).slice(0, 10), today());
/* Alle Einträge mit Status todo / over / done */
function qItems() {
  const out = [];
  const seenCf = S.settings.seenCf || {};
  (ADMIN.clients || []).forEach(c => {
    const cf = (c.summary || {}).cf;
    if (!cf) return;
    const h0 = cf.hist && cf.hist[0];
    if (cf.over && (S.settings.qSkip || {})['over:' + c.id] !== today()) out.push({ key: 'over:' + c.id, t: 'over', uid: c.id, d: cf.due, st: 'over' });
    if (h0) {
      const st = seenCf[c.id] === h0.d ? 'done' : 'todo';
      if (st === 'todo' || qDays(h0.d) <= 30) out.push({ key: 'cf:' + c.id + ':' + h0.d, t: 'cf', uid: c.id, d: h0.d, st });
    }
  });
  const ids = new Set((ADMIN.clients || []).map(c => c.id));
  (QX.media || []).forEach(m => {
    if (!ids.has(m.owner_id)) return;
    const st = m.seen_at ? 'done' : 'todo';
    if (st === 'done' && qDays(m.created_at) > 30) return;
    out.push({ key: 'm:' + m.id, t: m.kind === 'form' ? 'form' : 'photo', uid: m.owner_id, d: String(m.created_at).slice(0, 10), st, m });
  });
  /* zu prüfen: älteste zuerst (wer am längsten wartet), erledigt: neueste zuerst */
  out.sort((a, b) => (a.st === 'done' ? (a.d < b.d ? 1 : a.d > b.d ? -1 : 0) : a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  return out;
}
const qName = uid2 => {
  const c = (ADMIN.clients || []).find(x => x.id === uid2);
  return c ? cname(c) : $t('Athlet');
};
function qLabel(it) {
  if (it.t === 'over') return $t('Fragebogen überfällig');
  if (it.t === 'cf') return $t('Check-in-Fragebogen');
  const m = it.m.meta || {};
  if (it.t === 'form') return $t('Formcheck') + ': ' + (LIB[m.ex] ? LIB[m.ex].name : m.name || $t('Übung'));
  return $tf('Check-in-Foto: {p}', { p: $t(m.view ? m.view[0].toUpperCase() + m.view.slice(1) : '') });
}
function qRow(it, sel) {
  const ic = it.t === 'form' ? '▶' : it.t === 'photo' ? '◫' : it.t === 'over' ? '!' : '≡';
  return (
    '<button class="q-row' +
    (sel ? ' on' : '') +
    ' q-' +
    it.t +
    '" data-act="qSel" data-k="' +
    esc(it.key) +
    '" type="button"><i>' +
    ic +
    '</i><span class="grow"><b>' +
    esc(qName(it.uid)) +
    '</b><small>' +
    esc(qLabel(it)) +
    '</small></span><small class="muted">' +
    esc(it.t === 'over' ? $tf('seit {d}', { d: fmtDay(it.d) }) : fmtDay(it.d)) +
    '</small></button>'
  );
}
/* Fragebogen neben der Vorwoche */
function qCfDetail(it) {
  const c = (ADMIN.clients || []).find(x => x.id === it.uid);
  const H = (c && c.summary && c.summary.cf && c.summary.cf.hist) || [];
  const a = H[0],
    p = H[1];
  if (!a) return '';
  const pv = t => (p ? (p.a.find(y => y[0] === t) || [])[2] : null);
  const show = (ty, v) =>
    v == null || v === '' ? '–' : ty === 'yn' ? (v === 'ja' ? $t('Ja') : $t('Nein')) : (ty === 'num' || ty === 'sc') && num(v) != null ? fmt(num(v), 1) : String(v);
  const rows = a.a
    .map(([t, ty, v]) => {
      const o = pv(t);
      let dlt = '';
      if ((ty === 'sc' || ty === 'num') && num(v) != null && num(o) != null) {
        const d = Math.round((num(v) - num(o)) * 10) / 10;
        dlt = d ? '<span class="q-d ' + (d > 0 ? 'up' : 'dn') + '">' + (d > 0 ? '+' : '−') + esc(fmt(Math.abs(d), 1)) + '</span>' : '<span class="q-d">±0</span>';
      } else if (o != null && String(o) !== String(v)) dlt = '<span class="q-d">' + esc($t('geändert')) + '</span>';
      return (
        '<tr><td>' + esc(t) + '</td><td><b>' + esc(show(ty, v)) + '</b></td><td class="muted">' + esc(show(ty, o)) + '</td><td>' + dlt + '</td></tr>'
      );
    })
    .join('');
  return (
    '<div class="card"><h2>' +
    $t('Check-in-Fragebogen') +
    '</h2><p class="small muted" style="margin:0 0 8px">' +
    esc($tf('Beantwortet {d}', { d: fmtDay(a.d) })) +
    (p ? ' · ' + esc($tf('verglichen mit {d}', { d: fmtDay(p.d) })) : '') +
    '</p><table class="q-tab"><thead><tr><th>' +
    $t('Frage') +
    '</th><th>' +
    $t('Jetzt') +
    '</th><th>' +
    $t('Vorher') +
    '</th><th></th></tr></thead><tbody>' +
    rows +
    '</tbody></table></div>'
  );
}
function qMediaDetail(it) {
  const m = it.m,
    meta = m.meta || {};
  const com = (m.comments || [])
    .map(
      c =>
        '<div class="q-com"><b>' +
        (c.coach ? $t('Coach') : $t('Athlet')) +
        '</b>' +
        (it.t === 'form' ? ' <button class="chip-btn" data-act="qSeek" data-t="' + num(c.t) + '" type="button">' + fmtClock(num(c.t)) + '</button>' : '') +
        ' ' +
        esc(c.text) +
        '</div>'
    )
    .join('');
  let media;
  if (it.t === 'form')
    media =
      '<video id="q-v" controls muted playsinline preload="metadata" data-qsrc="' +
      esc(m.path) +
      '"></video><div class="row q-speed" style="gap:6px;margin-top:8px;flex-wrap:wrap"><span class="small muted">' +
      $t('Tempo') +
      '</span>' +
      [0.25, 0.5, 1]
        .map(r => '<button class="chip-btn' + (r === 1 ? ' on' : '') + '" data-act="qRate" data-r="' + r + '" type="button">' + String(r).replace('.', ',') + '×</button>')
        .join('') +
      '<span class="grow"></span><button class="chip-btn" data-act="qStep" data-s="-0.1" type="button" aria-label="' +
      esc($t('Ein Stück zurück')) +
      '">◀ 0,1 s</button><button class="chip-btn" data-act="qStep" data-s="0.1" type="button" aria-label="' +
      esc($t('Ein Stück vor')) +
      '">0,1 s ▶</button></div>';
  else {
    const prev = (QX.media || []).find(x => x.kind === 'checkin' && x.owner_id === m.owner_id && (x.meta || {}).view === meta.view && x.created_at < m.created_at);
    media =
      '<div class="q-ph">' +
      (prev
        ? '<figure><img data-qsrc="' + esc(prev.path) + '" alt=""><figcaption>' + esc(fmtDay(String(prev.created_at).slice(0, 10))) + '</figcaption></figure>'
        : '') +
      '<figure><img data-qsrc="' +
      esc(m.path) +
      '" alt=""><figcaption>' +
      esc(fmtDay(it.d)) +
      '</figcaption></figure></div>';
  }
  return (
    '<div class="card"><h2>' +
    esc(qLabel(it)) +
    '</h2><p class="small muted" style="margin:0 0 10px">' +
    esc(fmtDay(it.d)) +
    (meta.w ? ' · ' + $t('Woche ') + esc(meta.w) : '') +
    '</p>' +
    media +
    '<div style="margin-top:12px">' +
    (com || '<p class="small muted" style="margin:0">' + $t('Noch keine Kommentare.') + '</p>') +
    '</div><div class="row" style="gap:8px;margin-top:10px;align-items:flex-end"><textarea id="q-com" rows="2" placeholder="' +
    esc(it.t === 'form' ? $t('Kommentar an der aktuellen Videostelle') : $t('Kommentar zum Foto')) +
    '" style="flex:1;font:inherit;padding:10px;border-radius:10px;border:1px solid var(--rule)"></textarea><button class="btn" data-act="qComment" data-id="' +
    esc(m.id) +
    '" type="button">' +
    $t('Kommentieren') +
    '</button></div></div>'
  );
}
function qReply(it) {
  return (
    '<aside class="q-reply"><div class="card"><div class="row" style="align-items:center"><h2 class="grow" style="margin:0">' +
    esc(qName(it.uid)) +
    '</h2><a class="linkbtn" href="#admin/' +
    it.uid +
    '">' +
    $t('Öffnen') +
    '</a></div><p class="small muted" style="margin:4px 0 10px">' +
    $t('Antwort geht in euren Chat.') +
    '</p><textarea id="q-msg" rows="6" style="width:100%;box-sizing:border-box;font:inherit;padding:10px;border-radius:12px;border:1px solid var(--rule)" placeholder="' +
    esc(it.t === 'over' ? $t('z. B. Kurze Erinnerung: Dein Check-in ist noch offen.') : $t('Dein Feedback')) +
    '">' +
    esc(ui.qDraft || '') +
    '</textarea><div class="row" style="gap:8px;margin-top:10px;align-items:center">' +
    (typeof voiceBtn === 'function' ? voiceBtn(it.uid) : '') +
    '<div class="grow"></div>' +
    (it.st === 'done'
      ? ''
      : '<button class="btn fog" data-act="qDone" type="button">' + (it.t === 'over' ? $t('Überspringen') : $t('Erledigt')) + '</button>') +
    '<button class="btn brand" data-act="qSend" type="button">' +
    (it.st === 'done' ? $t('Senden') : $t('Senden & nächster')) +
    '</button></div><p class="small muted" style="margin:8px 0 0">' +
    $t('Strg+Enter sendet. J / K springt zum nächsten / vorigen Eintrag.') +
    '</p></div></aside>'
  );
}
function viewQueue() {
  qLoad();
  const all = qItems();
  const tab = ui.qTab || 'todo';
  const cnt = k => all.filter(x => x.st === k).length;
  const L = all.filter(x => x.st === tab);
  let sel = L.find(x => x.key === ui.qSel);
  if (!sel && L.length) {
    sel = L[0];
    ui.qSel = sel.key;
  }
  setTimeout(qFill, 0);
  const tabs = [
    ['todo', 'Zu prüfen'],
    ['over', 'Überfällig'],
    ['done', 'Erledigt']
  ]
    .map(
      ([k, l]) =>
        '<button class="ck-tab' +
        (tab === k ? ' on' : '') +
        '" data-act="qTab" data-v="' +
        k +
        '" type="button">' +
        esc($t(l)) +
        (cnt(k) ? '<i>' + cnt(k) + '</i>' : '') +
        '</button>'
    )
    .join('');
  return (
    '<a href="#admin" class="back">' +
    ICON.back +
    $t('Team') +
    '</a>' +
    pageTop($t('Prüfen'), '', $t('Check-ins und Formchecks deiner Athleten, wer am längsten wartet, steht oben.')) +
    '<div class="ck-tabs q-tabs">' +
    tabs +
    '</div>' +
    (QX.media == null && !all.length
      ? '<p class="muted">' + $t('Lade …') + '</p>'
      : '<div class="q-grid"><div class="q-list">' +
        (L.length
          ? L.map(x => qRow(x, sel && x.key === sel.key)).join('')
          : '<div class="card"><p class="muted" style="margin:0">' +
            esc(tab === 'todo' ? $t('Alles geprüft. Gute Arbeit!') : tab === 'over' ? $t('Kein Fragebogen überfällig.') : $t('In den letzten 30 Tagen noch nichts erledigt.')) +
            '</p></div>') +
        '</div>' +
        (sel
          ? '<section class="q-main stack">' +
            (sel.t === 'cf'
              ? qCfDetail(sel)
              : sel.t === 'over'
                ? '<div class="card"><h2>' +
                  $t('Fragebogen überfällig') +
                  '</h2><p>' +
                  esc($tf('{n} hat den Check-in-Fragebogen, fällig seit {d}, noch nicht beantwortet.', { n: qName(sel.uid), d: fmtDay(sel.d) })) +
                  '</p>' +
                  (() => {
                    const c = (ADMIN.clients || []).find(x => x.id === sel.uid);
                    return c && c.summary && c.summary.cf && c.summary.cf.hist && c.summary.cf.hist[0] ? qCfDetail({ uid: sel.uid }) : '';
                  })() +
                  '</div>'
                : qMediaDetail(sel)) +
            '</section>' +
            qReply(sel)
          : '') +
        '</div>')
  );
}
/* Medien laden (signierte Blob-URLs aus coachmedia) */
function qFill() {
  document.querySelectorAll('[data-qsrc]').forEach(async el => {
    if (el.getAttribute('src')) return;
    try {
      el.src = await cmBlobUrl(el.dataset.qsrc);
    } catch (e) {
      el.alt = $t('Datei konnte nicht geladen werden.');
    }
  });
  /* gesehen markieren, sobald ein Formcheck / Foto geöffnet ist */
  const it = qCur();
  if (it && it.m && !it.m.seen_at && !it.m._seenSent) {
    it.m._seenSent = true;
    api('/rest/v1/rpc/media_seen', { method: 'POST', body: JSON.stringify({ p_id: it.m.id }) }).catch(() => {});
  }
}
function qCur() {
  return qItems().find(x => x.key === ui.qSel) || null;
}
function qMarkDone(it) {
  if (!it) return;
  if (it.t === 'cf') {
    S.settings.seenCf = Object.assign({}, S.settings.seenCf, { [it.uid]: it.d });
    save();
  } else if (it.m) {
    it.m.seen_at = new Date().toISOString();
    if (typeof CMX !== 'undefined' && CMX.unseen && CMX.unseen[it.uid]) CMX.unseen[it.uid] = Math.max(0, CMX.unseen[it.uid] - (it.t === 'form' ? 1 : 0));
    if (!it.m._seenSent) api('/rest/v1/rpc/media_seen', { method: 'POST', body: JSON.stringify({ p_id: it.m.id }) }).catch(() => {});
  } else if (it.t === 'over') {
    S.settings.qSkip = Object.assign({}, S.settings.qSkip, { [it.key]: today() });
    save();
  }
}
function qNext(dir) {
  const tab = ui.qTab || 'todo';
  const L = qItems().filter(x => x.st === tab);
  const i = L.findIndex(x => x.key === ui.qSel);
  const n = L[i + (dir || 1)];
  if (n) {
    ui.qSel = n.key;
    ui.qDraft = '';
    render();
  }
}
async function qSend(andNext) {
  const it = qCur();
  if (!it) return;
  const ta = document.getElementById('q-msg');
  const body = ta ? ta.value.trim() : '';
  if (body) {
    try {
      const prevRef = ui.chatRef;
      ui.chatRef = it.t === 'form' && it.m ? { t: 'ex', title: (LIB[(it.m.meta || {}).ex] || {}).name || (it.m.meta || {}).name || '' } : null;
      await chatSend(chatPair(it.uid), body);
      ui.chatRef = prevRef;
      toast($t('Gesendet'));
    } catch (e) {
      toast($t('Senden fehlgeschlagen: ') + errTxt(e));
      return;
    }
  } else if (!andNext) return;
  ui.qDraft = '';
  if (ta) ta.value = '';
  if (andNext && it.st !== 'done') {
    const tab = ui.qTab || 'todo';
    const L = qItems().filter(x => x.st === tab);
    const i = L.findIndex(x => x.key === it.key);
    qMarkDone(it);
    const rest = qItems().filter(x => x.st === tab);
    const nx = rest[Math.min(i, rest.length - 1)];
    ui.qSel = nx ? nx.key : '';
  }
  render();
}
const qOpenCount = () => {
  try {
    return qItems().filter(x => x.st === 'todo' || x.st === 'over').length;
  } catch (e) {
    return 0;
  }
};

hbWrap('viewAdmin', 'queue', function (__next, arg) {
  if (arg === 'pruefen' && typeof isAdmin === 'function' && isAdmin()) {
    __next.call(this);
    try {
      return viewQueue();
    } catch (e) {
      logErr('queue:view', e);
    }
  }
  let h = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  if (!arg && typeof isAdmin === 'function' && isAdmin()) {
    qLoad();
    const n = qOpenCount();
    const btn = '<a class="btn fog" href="#admin/pruefen">' + $t('Prüfen') + (n ? ' <span class="cnt">' + n + '</span>' : '') + '</a>';
    const i = h.indexOf('<a class="btn fog" href="#admin/vorlagen">');
    if (i >= 0 && h.indexOf('href="#admin/pruefen"') < 0) h = h.slice(0, i) + btn + h.slice(i);
  }
  return h;
});
/* Seitenleiste / Leiste: Eintrag „Prüfen“ */
if (typeof TAB_SVG !== 'undefined')
  TAB_SVG.check =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>';
hbWrap('render', 'queue', function (__next) {
  const ta = document.getElementById('q-msg');
  if (ta && ta.dataset.k === ui.qSel) ui.qDraft = ta.value;
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  queueMicrotask(() => {
    const bar = document.querySelector('#tabbar .in');
    if (!bar || typeof isAdmin !== 'function' || !isAdmin() || VIEW || !document.querySelector('#tabbar a[data-r="cteam"]')) return;
    let a = bar.querySelector('a[data-r="cpruefen"]');
    if (!a) {
      a = document.createElement('a');
      a.href = '#admin/pruefen';
      a.dataset.r = 'cpruefen';
      a.innerHTML = TAB_SVG.check + '<span>' + esc($t('Prüfen')) + '</span><i class="tabcnt" id="tabcnt-q"></i>';
      const tpl = bar.querySelector('a[data-r="cvorlagen"]');
      bar.insertBefore(a, tpl || null);
    }
    const on = route.name === 'admin' && route.arg === 'pruefen';
    document.body.classList.toggle('dk-q', on);
    a.classList.toggle('on', on);
    if (on) bar.querySelectorAll('a[data-r="cteam"]').forEach(x => x.classList.remove('on'));
    const n = qOpenCount(),
      c = document.getElementById('tabcnt-q');
    if (c) {
      c.textContent = n || '';
      c.hidden = !n;
    }
  });
  return r;
});

/* ---------- Klicks und Tasten ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'qTab') {
    ui.qTab = b.dataset.v;
    ui.qSel = '';
    ui.qDraft = '';
    render();
  } else if (a === 'qSel') {
    if (ui.qSel !== b.dataset.k) ui.qDraft = '';
    ui.qSel = b.dataset.k;
    render();
    if (window.innerWidth < 1024) setTimeout(() => (document.querySelector('.q-main') || {}).scrollIntoView && document.querySelector('.q-main').scrollIntoView({ behavior: 'smooth' }), 50);
  } else if (a === 'qSend') qSend(true);
  else if (a === 'qDone') {
    const it = qCur();
    const tab = ui.qTab || 'todo';
    const i = qItems()
      .filter(x => x.st === tab)
      .findIndex(x => x.key === (it && it.key));
    qMarkDone(it);
    const rest = qItems().filter(x => x.st === tab);
    const nx = rest[Math.min(Math.max(i, 0), rest.length - 1)];
    ui.qSel = nx ? nx.key : '';
    ui.qDraft = '';
    render();
  } else if (a === 'qRate') {
    const v = document.getElementById('q-v');
    if (v) v.playbackRate = num(b.dataset.r) || 1;
    document.querySelectorAll('.q-speed [data-act="qRate"]').forEach(x => x.classList.toggle('on', x === b));
  } else if (a === 'qStep') {
    const v = document.getElementById('q-v');
    if (v) {
      v.pause();
      v.currentTime = Math.max(0, v.currentTime + (num(b.dataset.s) || 0));
    }
  } else if (a === 'qSeek') {
    const v = document.getElementById('q-v');
    if (v) {
      v.currentTime = num(b.dataset.t) || 0;
      v.pause();
    }
  } else if (a === 'qComment') {
    const ta = document.getElementById('q-com');
    const txt = ta ? ta.value.trim() : '';
    if (!txt) return;
    const v = document.getElementById('q-v');
    const t = v ? Math.round(v.currentTime * 10) / 10 : 0;
    const id = b.dataset.id;
    b.disabled = true;
    api('/rest/v1/rpc/media_comment', { method: 'POST', body: JSON.stringify({ p_id: id, p_t: t, p_text: txt.slice(0, 1000) }) })
      .then(c => {
        const m = (QX.media || []).find(x => x.id === id);
        if (m) m.comments = (m.comments || []).concat([c]);
        toast($t('Kommentar gesendet'));
        render();
      })
      .catch(() => {
        b.disabled = false;
        toast($t('Senden fehlgeschlagen.'));
      });
  }
});
document.addEventListener('keydown', e => {
  if (!(route.name === 'admin' && route.arg === 'pruefen')) return;
  const tg = e.target,
    typing = tg && (tg.tagName === 'TEXTAREA' || tg.tagName === 'INPUT');
  if (typing) {
    if (tg.id === 'q-msg' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      qSend(true);
    }
    return;
  }
  if (document.getElementById('sheet') && !document.getElementById('sheet').hidden) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'j') {
    e.preventDefault();
    qNext(1);
  } else if (e.key === 'k') {
    e.preventDefault();
    qNext(-1);
  }
});
