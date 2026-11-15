/* Hybridblock – Coaching-Profil des Coaches (profiles.coach_cfg):
   Auftritt (Name, Logo, Farbe) → „Betreut durch …“ beim Athleten, eigene Übungsvideos (Link oder Upload bis 30 s),
   automatische Nachrichten (Willkommen, länger nicht trainiert, Check-in fällig; verschickt ein täglicher Job in Supabase).
   Athleten lesen das Profil ihres Coaches (RLS profiles_select über my_coach). */
'use strict';
const CC = { me: null, myName: '', coach: null, coachName: '', forUid: null, at: 0, loading: false };
const CC_COLORS = ['#1f6feb', '#0f9d58', '#e8710a', '#d93025', '#8e44ad', '#111827'];
try {
  const c = JSON.parse(localStorage.getItem('hb_cc') || 'null');
  if (c && c.forUid) Object.assign(CC, c);
} catch (e) {}
function ccStore() {
  try {
    localStorage.setItem('hb_cc', JSON.stringify({ me: CC.me, myName: CC.myName, coach: CC.coach, coachName: CC.coachName, forUid: CC.forUid, at: CC.at }));
  } catch (e) {}
}
const ccOk = () => typeof AUTH !== 'undefined' && AUTH && AUTH.uid && CC.forUid === AUTH.uid;
const ccMine = () => (ccOk() && CC.me) || {};
const ccCoach = () => (ccOk() && CC.coach) || null;
const ccColor = c => (/^#[0-9a-f]{6}$/i.test(c || '') ? c : '');
const ccLogo = l => (typeof l === 'string' && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(l) && l.length < 200000 ? l : '');
async function ccLoad(force) {
  if (typeof AUTH === 'undefined' || !AUTH || !AUTH.uid || CC.loading) return;
  if (!force && ccOk() && Date.now() - CC.at < 10 * 60e3) return;
  CC.loading = true;
  try {
    const me = AUTH.uid,
      cid = AUTH.profile && AUTH.profile.coach_id;
    if (isAdmin()) {
      const r = await api('/rest/v1/profiles?id=eq.' + me + '&select=coach_cfg,display_name');
      CC.me = (r && r[0] && r[0].coach_cfg) || {};
      CC.myName = (r && r[0] && r[0].display_name) || '';
    } else CC.me = null;
    if (cid) {
      const r = await api('/rest/v1/profiles?id=eq.' + cid + '&select=coach_cfg,display_name,username');
      const p = r && r[0];
      CC.coach = (p && p.coach_cfg) || {};
      CC.coachName = p ? p.display_name || p.username || '' : '';
    } else {
      CC.coach = null;
      CC.coachName = '';
    }
    CC.forUid = me;
    CC.at = Date.now();
    ccStore();
  } catch (e) {
    logErr('coachcfg:load', e, 1);
  }
  CC.loading = false;
}
async function ccSave(patch) {
  const cfg = Object.assign({}, ccMine(), patch);
  await api('/rest/v1/profiles?id=eq.' + AUTH.uid, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ coach_cfg: cfg }) });
  CC.me = cfg;
  CC.forUid = AUTH.uid;
  ccStore();
}
hbWrap('pullAll', 'coachcfg', async function (__next) {
  const r = await __next.apply(this, Array.prototype.slice.call(arguments, 1));
  ccLoad().then(() => {
    if (route.name === 'heute' || route.name === 'chat') render();
  });
  return r;
});

/* ---------- Auftritt beim Athleten ---------- */
function ccBrand() {
  const c = ccCoach();
  if (!c || !hasCoach()) return null;
  const b = c.brand || {};
  if (b.off) return null;
  const name = (b.name || CC.coachName || '').trim();
  if (!name) return null;
  return { name, logo: ccLogo(b.logo), color: ccColor(b.color) };
}
const ccCoachName = () => {
  const b = ccBrand();
  return b ? b.name : '';
};
function ccBadge(b, preview) {
  if (!b) return '';
  return (
    '<div class="cc-brand"' +
    (b.color ? ' style="--ccb:' + b.color + '"' : '') +
    '>' +
    (b.logo ? '<img src="' + b.logo + '" alt="">' : '<span class="cc-ini">' + esc(b.name.slice(0, 1).toUpperCase()) + '</span>') +
    '<div class="grow"><small>' +
    $t('Betreut durch') +
    '</small><b>' +
    esc(b.name) +
    '</b></div>' +
    (!preview && typeof chatOn === 'function' && chatOn() ? '<a class="btn sm" href="#chat">' + $t('Nachricht') + '</a>' : '') +
    '</div>'
  );
}
hbFilter('viewHeute', 'coachcfg', function (h) {
  if (VIEW || isAdmin()) return h;
  const b = ccBrand();
  if (!b) return h;
  const i = hbAt(h, '<div class="stack">', 'coachcfg', true);
  return i < 0 ? h : h.slice(0, i + 19) + ccBadge(b) + '<!--ccb-->' + h.slice(i + 19);
});

/* ---------- Übungsvideos ---------- */
function ccVid(exId) {
  const c = ccCoach();
  const v = (c && c.vids && c.vids[exId]) || (isAdmin() && (ccMine().vids || {})[exId]) || null;
  if (!v) return null;
  if (v.p && typeof v.p === 'string') return { p: v.p };
  if (v.u && /^https:\/\/[^\s"'<>]+$/i.test(v.u)) return { u: v.u };
  return null;
}
const ccYt = u => {
  const m = String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};
function ccVidHTML(v, mine) {
  const lbl = mine ? $t('Dein Demo-Video') : $t('Video von deinem Coach');
  if (v.p)
    return (
      '<div class="cc-vid"><div class="lbl">' + esc(lbl) + '</div><video controls playsinline preload="metadata" data-ccvid="' + esc(v.p) + '"></video></div>'
    );
  const yt = ccYt(v.u);
  return (
    '<div class="cc-vid"><div class="lbl">' +
    esc(lbl) +
    '</div>' +
    (yt
      ? '<a href="' +
        esc(v.u) +
        '" target="_blank" rel="noopener" class="cc-yt"><img src="https://i.ytimg.com/vi/' +
        yt +
        '/hqdefault.jpg" alt="" loading="lazy"><span>▶</span></a>'
      : '') +
    '<a class="btn sm" href="' +
    esc(v.u) +
    '" target="_blank" rel="noopener">' +
    $t('Video ansehen ↗') +
    '</a></div>'
  );
}
function ccFillVids() {
  document.querySelectorAll('video[data-ccvid]:not([src])').forEach(el => {
    cmBlobUrl(el.dataset.ccvid)
      .then(u => {
        el.src = u;
      })
      .catch(e => {
        el.outerHTML = '<p class="small muted">' + esc($t('Video gerade nicht erreichbar.')) + '</p>';
        logErr('coachcfg:vid', e, 1);
      });
  });
}
const _exInfoSheetCC = exInfoSheet;
exInfoSheet = async function (exId) {
  const r = await _exInfoSheetCC.apply(this, arguments);
  try {
    const card = document.getElementById('sheetCard');
    if (!card || card.querySelector('.cc-vid,.cc-vidadd')) return r;
    const v = ccVid(exId);
    const coach = isAdmin() && !VIEW;
    let html = v ? ccVidHTML(v, coach && !ccCoach()) : '';
    if (coach)
      html +=
        '<button class="btn sm fog cc-vidadd" data-act="ccVidFor" data-ex="' +
        esc(exId) +
        '" type="button" style="margin-top:8px">' +
        (v ? $t('Demo-Video ändern') : $t('Eigenes Demo-Video für deine Athleten')) +
        '</button>';
    if (!html) return r;
    const row = card.querySelector('.row');
    const box = document.createElement('div');
    box.innerHTML = html;
    if (row && row.parentNode) row.parentNode.insertBefore(box, row.nextSibling);
    else card.appendChild(box);
    ccFillVids();
  } catch (e) {
    logErr('coachcfg:sheet', e, 1);
  }
  return r;
};
async function ccVidSet(exId, v) {
  const vids = Object.assign({}, ccMine().vids || {});
  const old = vids[exId];
  if (v) vids[exId] = v;
  else delete vids[exId];
  await ccSave({ vids });
  if (old && old.p && (!v || v.p !== old.p)) cmDelete([old.p]).catch(e => logErr('coachcfg:del', e, 1));
}

/* ---------- Coach: Seite „Coaching-Profil“ ---------- */
const CC_AUTO = () => ({
  welcome: $t('Hallo {name}, willkommen im Team! Schau dir deinen Plan an und schreib mir hier, wenn du Fragen hast.'),
  idle: $t('Hey {name}, du hast ein paar Tage nicht trainiert. Alles okay? Sag Bescheid, wenn wir etwas anpassen sollen.'),
  form: $t('Hallo {name}, heute ist dein Check-in fällig. Nimm dir 2 Minuten, damit ich deine nächste Woche planen kann.')
});
function ccExName(id) {
  return LIB[id] ? $t(LIB[id].name) : id;
}
function ccExByName(n) {
  const q = String(n || '')
    .trim()
    .toLowerCase();
  if (!q) return null;
  return Object.keys(LIB).find(id => LIB[id].name.toLowerCase() === q || $t(LIB[id].name).toLowerCase() === q) || null;
}
function viewCoachCfg() {
  if (!ccOk() && !CC.loading)
    ccLoad(true).then(() => {
      if (route.name === 'admin' && route.arg === 'profil') render();
    });
  const m = ccMine(),
    b = m.brand || {},
    a = m.auto || {},
    D = CC_AUTO();
  if (ui.ccLogo === undefined) ui.ccLogo = ccLogo(b.logo);
  if (ui.ccCol === undefined) ui.ccCol = ccColor(b.color);
  const name = b.name || CC.myName || (AUTH.profile && AUTH.profile.display_name) || '';
  const vids = Object.keys(m.vids || {}).filter(id => LIB[id]);
  const auto = (k, title, sub, extra) => {
    const o = a[k] || {};
    return (
      '<div class="cc-auto"><label class="row" style="gap:10px;align-items:flex-start;cursor:pointer"><input type="checkbox" id="cc-a-' +
      k +
      '"' +
      (o.on ? ' checked' : '') +
      '><span class="grow"><b>' +
      esc(title) +
      '</b><br><span class="small muted">' +
      esc(sub) +
      '</span></span></label>' +
      (extra || '') +
      '<textarea id="cc-t-' +
      k +
      '" rows="3" style="width:100%;margin-top:6px">' +
      esc(o.txt || D[k]) +
      '</textarea></div>'
    );
  };
  return (
    '<a href="#admin" class="back">' +
    ICON.back +
    $t('Team') +
    '</a>' +
    pageTop($t('Coaching-Profil'), '', $t('Wie deine Athleten dich in der App sehen')) +
    '<div class="stack">' +
    '<div class="card"><h2>' +
    $t('Dein Auftritt') +
    '</h2><p class="small muted">' +
    $t('Deine Athleten sehen auf „Heute“, wer sie betreut. Name und Logo stehen auch im Chat.') +
    '</p><div class="fields" style="margin-top:10px"><div class="field" style="flex:1 1 100%"><label for="cc-name">' +
    $t('Name oder Marke') +
    '</label><input id="cc-name" type="text" maxlength="40" value="' +
    esc(name) +
    '" style="width:100%"></div></div>' +
    '<div class="row" style="margin-top:10px;gap:10px;align-items:center">' +
    (ui.ccLogo
      ? '<img class="cc-logo" src="' + ui.ccLogo + '" alt="">'
      : '<span class="cc-logo cc-ini">' + esc((name || '?').slice(0, 1).toUpperCase()) + '</span>') +
    '<label class="btn sm" style="cursor:pointer">' +
    (ui.ccLogo ? $t('Logo ändern') : $t('Logo hochladen')) +
    '<input type="file" accept="image/*" data-act="ccLogo" hidden></label>' +
    (ui.ccLogo ? '<button class="btn sm fog" data-act="ccLogoOff" type="button">' + $t('Entfernen') + '</button>' : '') +
    '</div><p class="small" style="margin:12px 0 6px"><b>' +
    $t('Farbe') +
    '</b></p><div class="row" style="gap:8px">' +
    ['']
      .concat(CC_COLORS)
      .map(
        c =>
          '<button class="cc-sw' +
          ((ui.ccCol || '') === c ? ' on' : '') +
          '" data-act="ccCol" data-v="' +
          c +
          '" type="button" style="' +
          (c ? 'background:' + c : '') +
          '" aria-label="' +
          esc(c || $t('Standard')) +
          '"></button>'
      )
      .join('') +
    '</div><label class="row" style="gap:10px;margin-top:12px;cursor:pointer"><input type="checkbox" id="cc-show"' +
    (b.off ? '' : ' checked') +
    '><span>' +
    $t('In der App deiner Athleten anzeigen') +
    '</span></label><p class="small muted" style="margin:12px 0 6px">' +
    $t('Vorschau') +
    '</p>' +
    ccBadge({ name: name || $t('Dein Name'), logo: ui.ccLogo, color: ui.ccCol }, true) +
    '<button class="btn brand block" style="margin-top:12px" data-act="ccSaveBrand" type="button">' +
    $t('Auftritt speichern') +
    '</button></div>' +
    '<div class="card"><h2>' +
    $t('Eigene Übungsvideos') +
    '</h2><p class="small muted">' +
    $t(
      'Zeig deinen Athleten die Ausführung so, wie du sie willst: als Link (YouTube, Instagram, Vimeo) oder als eigenes Video bis 30 Sekunden. Es erscheint in der Übungsanleitung, auch im Training.'
    ) +
    '</p>' +
    (vids.length
      ? '<div class="list" style="margin-top:8px">' +
        vids
          .map(
            id =>
              '<div class="li" style="cursor:default"><div class="grow"><b>' +
              esc(ccExName(id)) +
              '</b><small>' +
              (m.vids[id].p
                ? $t('eigenes Video')
                : esc(
                    String(m.vids[id].u || '')
                      .replace(/^https:\/\//, '')
                      .slice(0, 40)
                  )) +
              '</small></div><button class="btn sm" data-act="ccVidShow" data-ex="' +
              esc(id) +
              '" type="button">' +
              $t('Ansehen') +
              '</button><button class="btn sm danger" data-act="ccVidDel" data-ex="' +
              esc(id) +
              '" type="button">' +
              $t('Entfernen') +
              '</button></div>'
          )
          .join('') +
        '</div>'
      : '') +
    '<div class="fields" style="margin-top:12px"><div class="field" style="flex:1 1 100%"><label for="cc-ex">' +
    $t('Übung') +
    '</label><input id="cc-ex" list="cc-exl" type="text" placeholder="' +
    esc($t('Übung suchen')) +
    '" value="' +
    esc(ui.ccEx ? ccExName(ui.ccEx) : '') +
    '" style="width:100%"><datalist id="cc-exl">' +
    Object.keys(LIB)
      .map(id => '<option value="' + esc(ccExName(id)) + '">')
      .join('') +
    '</datalist></div><div class="field" style="flex:1 1 100%"><label for="cc-url">' +
    $t('Link zum Video') +
    '</label><input id="cc-url" type="url" inputmode="url" placeholder="https://" style="width:100%"></div></div>' +
    '<div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><button class="btn brand" data-act="ccVidLink" type="button">' +
    $t('Link speichern') +
    '</button><label class="btn" style="cursor:pointer">' +
    (ui.ccUp ? $t('Lädt hoch …') : $t('Video hochladen (bis 30 s)')) +
    '<input type="file" accept="video/*" data-act="ccVidFile" hidden' +
    (ui.ccUp ? ' disabled' : '') +
    '></label></div><p class="small muted" style="margin-top:8px">' +
    $t('Hochgeladene Videos werden ohne Ton und verkleinert gespeichert und sind nur für deine Athleten sichtbar.') +
    '</p></div>' +
    '<div class="card"><h2>' +
    $t('Automatische Nachrichten') +
    '</h2><p class="small muted">' +
    $t(
      'Kommen von dir, mit deinem Namen, als normale Chat-Nachricht mit Push. Die App prüft einmal am Tag gegen 8 Uhr. {name} wird durch den Vornamen des Athleten ersetzt.'
    ) +
    '</p>' +
    auto('welcome', $t('Willkommen'), $t('sobald ein Athlet deinen Einladungscode einlöst')) +
    auto(
      'idle',
      $t('Länger nicht trainiert'),
      $t('höchstens einmal pro Zeitraum'),
      '<div class="row" style="gap:8px;margin-top:6px;align-items:center"><span class="small">' +
        $t('nach') +
        '</span><input id="cc-d-idle" type="number" inputmode="numeric" min="2" max="30" value="' +
        esc((a.idle && a.idle.days) || 4) +
        '" style="width:70px"><span class="small">' +
        $t('Tagen ohne Training') +
        '</span></div>'
    ) +
    auto('form', $t('Check-in fällig'), $t('am Check-in-Tag, wenn der Athlet noch nicht geantwortet hat (Fragebogen im Plan einrichten)')) +
    '<button class="btn brand block" style="margin-top:12px" data-act="ccSaveAuto" type="button">' +
    $t('Nachrichten speichern') +
    '</button></div></div>'
  );
}
hbWrap('viewAdmin', 'coachcfg', function (__next, arg) {
  if (arg === 'profil' && isAdmin()) return viewCoachCfg();
  const h = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  if (arg || !isAdmin()) return h;
  const i = h.indexOf('href="#admin/vorlagen"');
  const j = i < 0 ? -1 : h.indexOf('</a>', i);
  return j < 0 ? h : h.slice(0, j + 4) + '<a class="btn fog" href="#admin/profil">' + $t('Profil') + '</a>' + h.slice(j + 4);
});

function ccShrinkLogo(file) {
  return new Promise((res, rej) => {
    const img = new Image(),
      url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, 160 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * s));
      c.height = Math.max(1, Math.round(img.height * s));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      let d = c.toDataURL('image/webp', 0.85);
      if (!d.startsWith('data:image/webp')) d = c.toDataURL('image/png');
      res(d);
    };
    img.onerror = () => rej(new Error('image'));
    img.src = url;
  });
}
document.addEventListener('click', async e => {
  const b = e.target.closest && e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  const v = id => (document.getElementById(id) || {}).value;
  try {
    if (a === 'ccCol') {
      ui.ccCol = b.dataset.v;
      render();
    } else if (a === 'ccLogoOff') {
      ui.ccLogo = '';
      render();
    } else if (a === 'ccSaveBrand') {
      const show = document.getElementById('cc-show');
      await ccSave({
        brand: {
          name: String(v('cc-name') || '')
            .trim()
            .slice(0, 40),
          logo: ui.ccLogo || '',
          color: ui.ccCol || '',
          off: !!(show && !show.checked)
        }
      });
      toast($t('Auftritt gespeichert'));
      render();
    } else if (a === 'ccSaveAuto') {
      const one = k => ({
        on: !!(document.getElementById('cc-a-' + k) || {}).checked,
        txt: String(v('cc-t-' + k) || '')
          .trim()
          .slice(0, 1000)
      });
      const auto = {
        welcome: one('welcome'),
        idle: Object.assign(one('idle'), { days: Math.max(2, Math.min(30, parseInt(v('cc-d-idle'), 10) || 4)) }),
        form: one('form')
      };
      await ccSave({ auto });
      toast($t('Nachrichten gespeichert'));
      render();
    } else if (a === 'ccVidLink') {
      const ex = ccExByName(v('cc-ex')),
        u = String(v('cc-url') || '').trim();
      if (!ex) return toast($t('Wähle eine Übung aus der Liste.'));
      if (!/^https:\/\/[^\s"'<>]+$/i.test(u)) return toast($t('Bitte einen Link mit https:// eingeben.'));
      await ccVidSet(ex, { u });
      ui.ccEx = null;
      toast($t('Video gespeichert'));
      render();
    } else if (a === 'ccVidDel') {
      await ccVidSet(b.dataset.ex, null);
      toast($t('Video entfernt'));
      render();
    } else if (a === 'ccVidShow') exInfoSheet(b.dataset.ex);
    else if (a === 'ccVidFor') {
      ui.ccEx = b.dataset.ex;
      closeSheet();
      location.hash = '#admin/profil';
    }
  } catch (err) {
    toast(errTxt(err));
  }
});
document.addEventListener('change', async e => {
  const t = e.target;
  if (!t || !t.dataset) return;
  if (t.dataset.act === 'ccLogo' && t.files && t.files[0]) {
    try {
      ui.ccLogo = await ccShrinkLogo(t.files[0]);
      render();
    } catch (err) {
      toast($t('Das Bild konnte nicht gelesen werden.'));
    }
  } else if (t.dataset.act === 'ccVidFile' && t.files && t.files[0]) {
    const ex = ccExByName((document.getElementById('cc-ex') || {}).value);
    if (!ex) {
      toast($t('Wähle zuerst eine Übung aus der Liste.'));
      t.value = '';
      return;
    }
    ui.ccUp = true;
    render();
    try {
      const r = await cmReencode(t.files[0]);
      const path = AUTH.uid + '/demo/' + ex + '-' + uid() + (r.type === 'video/webm' ? '.webm' : r.type === 'video/quicktime' ? '.mov' : '.mp4');
      await cmUpload(path, r.blob, r.type);
      await ccVidSet(ex, { p: path });
      ui.ccEx = null;
      toast($t('Video gespeichert'));
    } catch (err) {
      toast(err && err.message === 'long' ? $t('Das Video ist länger als 30 Sekunden.') : errTxt(err));
    }
    ui.ccUp = false;
    render();
  }
});
