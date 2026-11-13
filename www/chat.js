/* Hybridblock – Coach Teil 2:
   7.2 Chat zwischen Coach und Athlet (Text, Fotos, Kommentar an einer Einheit, Gelesen-Status, Ungelesen-Zähler, Benachrichtigung beim Abruf)
   7.3 Umschalter „Mein Training / Coaching“, Banner in der Athletenansicht, Fokus-Modus, getrennte Benachrichtigungskanäle, Ruhezeiten */
'use strict';
const CHAT = { unread: {}, list: {}, urls: {}, held: [], loading: {}, sending: false };
ICON.chat =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
ICON.photo =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/></svg>';
const chatOn = () => !!(AUTH && !VIEW && (isAdmin() || hasCoach()));
function chatPair(partner) {
  if (!AUTH) return null;
  if (isAdmin() && partner) return { coach_id: AUTH.uid, athlete_id: partner };
  if (hasCoach()) return { coach_id: AUTH.profile.coach_id, athlete_id: AUTH.uid };
  return null;
}
const chatKey = p => p.coach_id + ':' + p.athlete_id;
const chatUnreadFor = partner => CHAT.unread[partner || 'coach'] || 0;

/* ---------- Modus: Mein Training / Coaching (nur Coach-Konten) ---------- */
function cMode() {
  if (!isAdmin()) return 'own';
  try {
    return localStorage.getItem('hb_cmode') || 'own';
  } catch (e) {
    return 'own';
  }
}
function setCMode(m) {
  try {
    localStorage.setItem('hb_cmode', m);
  } catch (e) {}
}
function modeBar() {
  if (VIEW || !isAdmin()) return '';
  const m = cMode();
  const n = Object.keys(CHAT.unread).reduce((a, k) => a + (k === 'coach' ? 0 : CHAT.unread[k]), 0);
  document.body.classList.toggle('mode-coach', m === 'coach');
  return (
    '<div class="modebar" role="tablist"><button class="' +
    (m === 'own' ? 'on' : '') +
    '" data-act="cmode" data-v="own" type="button" role="tab" aria-selected="' +
    (m === 'own') +
    '">' +
    $t('Mein Training') +
    '</button><button class="' +
    (m === 'coach' ? 'on' : '') +
    '" data-act="cmode" data-v="coach" type="button" role="tab" aria-selected="' +
    (m === 'coach') +
    '">' +
    $t('Coaching') +
    (n ? ' <span class="cnt">' + n + '</span>' : '') +
    '</button></div>'
  );
}

/* ---------- Laden, Senden, Gelesen ---------- */
async function chatLoad(pair) {
  const k = chatKey(pair);
  CHAT.loading[k] = true;
  try {
    const r = await api(
      '/rest/v1/messages?coach_id=eq.' +
        pair.coach_id +
        '&athlete_id=eq.' +
        pair.athlete_id +
        '&select=id,sender,body,photo,ref,created_at,read_at&order=created_at.desc&limit=150'
    );
    CHAT.list[k] = (r || []).reverse();
  } finally {
    CHAT.loading[k] = false;
  }
  return CHAT.list[k];
}
async function chatMarkRead(pair) {
  const L = CHAT.list[chatKey(pair)] || [];
  if (!L.some(m => m.sender !== AUTH.uid && !m.read_at)) return;
  const now = new Date().toISOString();
  try {
    await api('/rest/v1/messages?coach_id=eq.' + pair.coach_id + '&athlete_id=eq.' + pair.athlete_id + '&sender=neq.' + AUTH.uid + '&read_at=is.null', {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ read_at: now })
    });
  } catch (e) {
    return;
  }
  L.forEach(m => {
    if (m.sender !== AUTH.uid && !m.read_at) m.read_at = now;
  });
  CHAT.unread[isAdmin() && pair.coach_id === AUTH.uid ? pair.athlete_id : 'coach'] = 0;
}
async function chatUnread() {
  if (!chatOn()) return;
  let r;
  try {
    r = await api(
      '/rest/v1/messages?read_at=is.null&sender=neq.' + AUTH.uid + '&select=id,coach_id,athlete_id,body,photo,created_at&order=created_at.desc&limit=200'
    );
  } catch (e) {
    return;
  }
  const u = {};
  (r || []).forEach(m => {
    const k = isAdmin() && m.coach_id === AUTH.uid ? m.athlete_id : 'coach';
    u[k] = (u[k] || 0) + 1;
  });
  const changed = JSON.stringify(u) !== JSON.stringify(CHAT.unread);
  CHAT.unread = u;
  const seen = S.meta.chatSeen || '';
  const fresh = (r || []).filter(m => m.created_at > seen);
  if (fresh.length) {
    S.meta.chatSeen = fresh[0].created_at;
    persist();
    fresh.forEach(m => {
      const coachSide = isAdmin() && m.coach_id === AUTH.uid;
      const partner = coachSide ? m.athlete_id : 'coach';
      if (route.name === 'chat' && (route.arg || 'coach') === partner) return;
      const c = coachSide && (ADMIN.clients || []).find(x => x.id === m.athlete_id);
      hbNotify(
        coachSide ? 'coaching' : 'own',
        700 + Math.floor(Math.random() * 200),
        coachSide ? (c ? cname(c) : $t('Nachricht von deinem Athleten')) : $t('Nachricht von deinem Coach'),
        m.body ? m.body.slice(0, 120) : $t('Foto')
      );
    });
  }
  if (changed && route.name !== 'chat') render();
  else if (changed) {
    const cb = document.querySelector('.modebar');
    if (cb) cb.outerHTML = modeBar();
  }
}
async function chatSend(pair, body, photo) {
  const ref = ui.chatRef || null;
  const row = Object.assign({ coach_id: pair.coach_id, athlete_id: pair.athlete_id, body: body || null, photo: photo || null }, ref ? { ref } : {});
  const r = await api('/rest/v1/messages', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) });
  const k = chatKey(pair);
  CHAT.list[k] = (CHAT.list[k] || []).concat(r[0]);
  ui.chatRef = null;
  ui.chatDraft = '';
}
/* Foto verkleinern (max. 1280 px, JPEG) und in den privaten Bucket laden */
function chatShrink(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, 1280 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => (b ? res(b) : rej(new Error('image'))), 'image/jpeg', 0.8);
    };
    img.onerror = () => rej(new Error('image'));
    img.src = url;
  });
}
async function chatUpload(pair, file) {
  const blob = await chatShrink(file);
  const path = pair.coach_id + '/' + pair.athlete_id + '/' + uid() + '.jpg';
  await api('/storage/v1/object/chat/' + path, { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
  return path;
}
async function chatPhotoUrl(path) {
  const c = CHAT.urls[path];
  if (c && c.until > Date.now()) return c.url;
  const r = await api('/storage/v1/object/sign/chat/' + path, { method: 'POST', body: JSON.stringify({ expiresIn: 3600 }) });
  const url = SB.url + '/storage/v1' + r.signedURL;
  CHAT.urls[path] = { url, until: Date.now() + 3500 * 1000 };
  return url;
}
function chatFillPhotos() {
  document.querySelectorAll('img[data-chatphoto]:not([src])').forEach(img => {
    chatPhotoUrl(img.dataset.chatphoto)
      .then(u => {
        img.src = u;
      })
      .catch(() => {
        img.alt = $t('Foto nicht verfügbar');
      });
  });
}

/* ---------- Ansicht ---------- */
const chatRefTxt = r =>
  r && r.t === 'sess' ? $tf('zu „{s}“ · Woche {w}', { s: $t(r.title || ''), w: r.w }) : r && r.t === 'ex' ? $tf('zu {e}', { e: r.title || '' }) : '';
function viewChat(arg) {
  if (!AUTH) return '<a href="#heute" class="back">' + ICON.back + $t('Heute') + '</a><p>' + $t('Für den Chat musst du angemeldet sein.') + '</p>';
  const pair = chatPair(arg);
  if (!pair) return '<a href="#heute" class="back">' + ICON.back + $t('Heute') + '</a><p>' + $t('Du hast noch keinen Coach verbunden.') + '</p>';
  const k = chatKey(pair),
    L = CHAT.list[k];
  const coachSide = isAdmin() && !!arg;
  const c = coachSide && (ADMIN.clients || []).find(x => x.id === arg);
  if (L === undefined && !CHAT.loading[k])
    chatLoad(pair)
      .then(() => chatMarkRead(pair))
      .catch(e => {
        CHAT.list[k] = [];
        toast(errTxt(e));
      })
      .finally(() => {
        if (route.name === 'chat') render();
      });
  const back = coachSide ? '#admin/' + arg : '#heute',
    name = coachSide ? (c ? cname(c) : $t('Athlet')) : $t('Dein Coach');
  let lastDay = '';
  const lastMine = (L || []).filter(m => m.sender === AUTH.uid).slice(-1)[0];
  const msgs = (L || [])
    .map(m => {
      const mine = m.sender === AUTH.uid,
        d = m.created_at.slice(0, 10);
      const day = d !== lastDay ? '<div class="chat-day">' + esc(fmtDay(d)) + '</div>' : '';
      lastDay = d;
      const t = new Date(m.created_at).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
      return (
        day +
        '<div class="chat-m' +
        (mine ? ' me' : '') +
        '">' +
        (m.ref ? '<div class="chat-ref">' + esc(chatRefTxt(m.ref)) + '</div>' : '') +
        (m.photo ? '<img class="chat-img" data-chatphoto="' + esc(m.photo) + '" alt="' + esc($t('Foto')) + '" loading="lazy">' : '') +
        (m.body ? '<div class="chat-b">' + esc(m.body) + '</div>' : '') +
        '<div class="chat-t">' +
        t +
        (mine && m === lastMine ? ' · ' + (m.read_at ? $t('gelesen') : $t('gesendet')) : '') +
        '</div></div>'
      );
    })
    .join('');
  setTimeout(() => {
    chatFillPhotos();
    const box = document.getElementById('chatlist');
    if (box && !ui.chatKeepScroll) window.scrollTo(0, document.body.scrollHeight);
    ui.chatKeepScroll = false;
  }, 0);
  return (
    '<a href="' +
    back +
    '" class="back">' +
    ICON.back +
    (coachSide ? esc(name) : $t('Heute')) +
    '</a>' +
    pageTop(esc(name), '', coachSide ? $t('Nur ihr beide seht diesen Chat.') : $t('Nur du und dein Coach seht diesen Chat.')) +
    '<div class="stack"><div id="chatlist" class="chat-list">' +
    (L === undefined
      ? '<p class="muted">' + $t('Lade …') + '</p>'
      : msgs || '<p class="muted small" style="text-align:center">' + $t('Noch keine Nachrichten. Schreib die erste.') + '</p>') +
    '</div>' +
    '<div class="chat-in">' +
    (ui.chatRef
      ? '<div class="chat-ref" style="margin-bottom:6px">' +
        esc(chatRefTxt(ui.chatRef)) +
        ' <button class="linkbtn" data-act="chatRefOff" type="button" aria-label="' +
        esc($t('Bezug entfernen')) +
        '">✕</button></div>'
      : '') +
    '<div class="row" style="gap:6px;flex-wrap:nowrap;align-items:flex-end"><label class="iconbtn" style="cursor:pointer" aria-label="' +
    esc($t('Foto senden')) +
    '">' +
    ICON.photo +
    '<input type="file" accept="image/*" data-act="chatPhoto" data-p="' +
    (arg || '') +
    '" hidden></label>' +
    '<textarea id="chat-text" rows="1" placeholder="' +
    esc($t('Nachricht')) +
    '" style="flex:1;font-family:var(--f);font-size:16px;resize:none;min-height:44px;max-height:140px">' +
    esc(ui.chatDraft || '') +
    '</textarea>' +
    '<button class="btn brand" data-act="chatSend" data-p="' +
    (arg || '') +
    '" type="button"' +
    (CHAT.sending ? ' disabled' : '') +
    '>' +
    $t('Senden') +
    '</button></div></div></div>'
  );
}
function chatBadge(partner) {
  const n = chatUnreadFor(partner);
  return n ? '<span class="cnt">' + n + '</span>' : '';
}
/* Einstiege */
function chatIconBtn() {
  if (!chatOn() || isAdmin()) return '';
  return '<a class="iconbtn chat-ic" href="#chat" aria-label="' + esc($t('Chat mit deinem Coach')) + '">' + ICON.chat + chatBadge('coach') + '</a>';
}
function chatClientBtn(uid2) {
  return '<div class="row"><a class="btn brand" href="#chat/' + uid2 + '">' + ICON.chat + ' ' + $t('Chat') + chatBadge(uid2) + '</a></div>';
}
function chatSessBtn(w, k) {
  if (VIEW)
    return (
      '<button class="btn block fog" data-act="chatFromView" data-w="' +
      w +
      '" data-k="' +
      k +
      '" type="button">' +
      $t('Kommentar zu dieser Einheit schreiben') +
      '</button>'
    );
  if (!chatOn() || isAdmin()) return '';
  return (
    '<button class="btn block fog" data-act="chatSess" data-w="' + w + '" data-k="' + k + '" type="button">' + $t('Kommentar an deinen Coach') + '</button>'
  );
}

/* ---------- Benachrichtigungen: Kanäle, Ruhezeiten, Fokus-Modus ---------- */
let hbChan = false;
async function hbChannels() {
  const N = NOTIF.p;
  if (!N || hbChan || !N.createChannel) return;
  hbChan = true;
  try {
    await N.createChannel({ id: 'own', name: $t('Mein Training & Ernährung'), importance: 3 });
    await N.createChannel({ id: 'coaching', name: $t('Coaching'), importance: 3 });
  } catch (e) {}
}
const coachBusy = () => (route.name === 'training' && !!route.arg) || route.name === 'track' || route.name === 'frei' || ($('#timer') && !$('#timer').hidden);
const inQuiet = () => {
  if (!S.settings.coachQuiet) return false;
  const h = new Date().getHours();
  return h >= 20 || h < 7;
};
async function hbNotify(chan, id, title, body) {
  if (chan === 'coaching' && (coachBusy() || inQuiet())) {
    CHAT.held.push([chan, id, title, body]);
    return;
  }
  const N = NOTIF.p;
  if (!N) return;
  await hbChannels();
  try {
    const st = await N.checkPermissions();
    if (st.display !== 'granted') return;
    await N.schedule({ notifications: [{ id, title, body, channelId: chan, schedule: { at: new Date(Date.now() + 1500), allowWhileIdle: true } }] });
  } catch (e) {}
}
function hbFlush() {
  if (!CHAT.held.length || coachBusy() || inQuiet()) return;
  const n = CHAT.held.length;
  const last = CHAT.held[n - 1];
  CHAT.held = [];
  hbNotify(last[0], last[1], n > 1 ? $tf('{n} neue Coaching-Meldungen', { n }) : last[2], n > 1 ? $t('Gesammelt während deines Trainings.') : last[3]);
}
/* Anfragen-Benachrichtigung über denselben Weg (Kanal Coaching, Fokus-Modus, Ruhezeiten) */
if (typeof notifyRequests === 'function')
  notifyRequests = function (open) {
    const seen = S.meta.seenReq || [];
    const fresh = open.filter(r => !seen.includes(r.id));
    if (!fresh.length) return;
    fresh.forEach((r, i) =>
      hbNotify('coaching', 300 + (i % 50), $t('Plan-Anfrage'), ((r.intake && r.intake.name) || $t('Ein Athlet')) + $t(' wartet auf seinen Plan.'))
    );
    S.meta.seenReq = seen.concat(fresh.map(r => r.id)).slice(-200);
    persist();
  };
function coachNotifCard() {
  return (
    '<div class="card"><h2>' +
    $t('Benachrichtigungen') +
    '</h2><label class="row" style="gap:10px;margin-top:8px;flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" data-act="coachQuiet"' +
    (S.settings.coachQuiet ? ' checked' : '') +
    '> <span>' +
    $t('Ruhezeiten für Coaching-Meldungen (20–7 Uhr)') +
    '</span></label>' +
    '<p class="small muted" style="margin-top:6px">' +
    $t(
      'Während du selbst trainierst, hält die App Coaching-Meldungen zurück und schickt sie danach gesammelt. Meldungen zu deinem eigenen Training laufen über einen eigenen Kanal.'
    ) +
    '</p></div>'
  );
}

/* ---------- Abruf ---------- */
setInterval(() => {
  if (document.visibilityState === 'visible') {
    chatUnread();
    hbFlush();
  }
}, 60000);
setInterval(() => {
  if (route.name === 'chat' && document.visibilityState === 'visible' && chatOn()) {
    const p = chatPair(route.arg);
    if (!p) return;
    const k = chatKey(p),
      n = (CHAT.list[k] || []).length;
    chatLoad(p)
      .then(L => {
        if (L.length !== n) {
          const ta = document.getElementById('chat-text');
          ui.chatDraft = ta ? ta.value : ui.chatDraft;
          render();
        }
        chatMarkRead(p);
      })
      .catch(() => {});
  }
}, 8000);
setTimeout(() => {
  chatUnread();
  hbChannels();
}, 3000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') setTimeout(chatUnread, 800);
});

/* ---------- Klicks und Eingaben ---------- */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  switch (a) {
    case 'cmode':
      setCMode(b.dataset.v);
      location.hash = b.dataset.v === 'coach' ? '#admin' : '#heute';
      render(true);
      break;
    case 'chatSend': {
      const p = chatPair(b.dataset.p || null);
      const ta = document.getElementById('chat-text');
      const body = ta && ta.value.trim();
      if (!p || !body || CHAT.sending) break;
      CHAT.sending = true;
      b.disabled = true;
      try {
        await chatSend(p, body);
      } catch (er) {
        toast($t('Senden fehlgeschlagen: ') + errTxt(er));
        ui.chatDraft = body;
      }
      CHAT.sending = false;
      render();
      break;
    }
    case 'chatRefOff':
      ui.chatRef = null;
      render();
      break;
    case 'chatSess': {
      const d = SESS[b.dataset.k] || {};
      ui.chatRef = { t: 'sess', w: +b.dataset.w, k: b.dataset.k, title: d.title || '' };
      location.hash = '#chat';
      break;
    }
    case 'chatFromView': {
      const u = VIEW.uid,
        d = SESS[b.dataset.k] || {};
      const ref = { t: 'sess', w: +b.dataset.w, k: b.dataset.k, title: d.title || '' };
      exitView();
      ui.chatRef = ref;
      setTimeout(() => {
        location.hash = '#chat/' + u;
      }, 50);
      break;
    }
    case 'coachQuiet':
      S.settings.coachQuiet = b.checked;
      save();
      hbFlush();
      break;
  }
});
document.addEventListener('change', async e => {
  const t = e.target;
  if (!t.dataset || t.dataset.act !== 'chatPhoto' || !t.files || !t.files[0]) return;
  const p = chatPair(t.dataset.p || null);
  if (!p) return;
  const ta = document.getElementById('chat-text');
  const body = ta && ta.value.trim();
  toast($t('Foto wird gesendet …'));
  try {
    const path = await chatUpload(p, t.files[0]);
    await chatSend(p, body || null, path);
  } catch (er) {
    toast($t('Senden fehlgeschlagen: ') + errTxt(er));
  }
  render();
});
document.addEventListener('input', e => {
  if (e.target.id === 'chat-text') {
    ui.chatDraft = e.target.value;
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(140, e.target.scrollHeight) + 'px';
  }
});
document.addEventListener('keydown', e => {
  if (e.target.id === 'chat-text' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    const b = document.querySelector('[data-act=chatSend]');
    if (b) b.click();
  }
});
