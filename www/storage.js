/* Hybridblock – Speicher-Sicherung und Abmelden
   1. Ist der Browserspeicher (localStorage, ca. 5 MB) voll, landet der Stand automatisch in der Gerätedatenbank (IndexedDB, viel größer).
      Beim Start wird der neuere der beiden Stände geladen.
   2. Archiv alter Pläne begrenzt (die letzten 6).
   3. Abmelden fragt, ob die Daten auf dem Gerät bleiben sollen; der Stand merkt sich das Konto (uid), damit fremde Daten nicht in ein anderes Konto hochgeladen werden. */
'use strict';
const ST_DB = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('hb_store', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => {
        this.db = r.result;
        res(this.db);
      };
      r.onerror = () => rej(r.error);
    });
  },
  async get(k) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const q = db.transaction('kv').objectStore('kv').get(k);
      q.onsuccess = () => res(q.result);
      q.onerror = () => rej(q.error);
    });
  },
  async put(k, v) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(v, k);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  },
  async del(k) {
    const db = await this.open();
    return new Promise(res => {
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').delete(k);
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  }
};
const ST_FLAG = 'hb_state_in_idb';
let ST_WARNED = false;
hbWrap('persist', 'storage', function (__next) {
  if (typeof VIEW !== 'undefined' && VIEW) return;
  if (S.archive && S.archive.length > 6) S.archive = S.archive.slice(-6);
  if (AUTH && AUTH.uid && !S.meta.owner) S.meta.owner = AUTH.uid;
  let json;
  try {
    json = JSON.stringify(S);
  } catch (e) {
    return __next.apply(this, Array.prototype.slice.call(arguments, 1));
  }
  try {
    localStorage.setItem(KEY, json);
    if (localStorage.getItem(ST_FLAG)) {
      localStorage.removeItem(ST_FLAG);
      ST_DB.del('state');
    }
    return;
  } catch (e) {
    /* voll: in die Gerätedatenbank */ ST_DB.put('state', json)
      .then(() => {
        try {
          localStorage.setItem(ST_FLAG, '1');
        } catch (x) {}
        if (!ST_WARNED) {
          ST_WARNED = true;
          toast($t('Der Browserspeicher ist voll. Deine Daten werden jetzt in der Gerätedatenbank gesichert.'));
        }
      })
      .catch(() => toast($t('Speichern fehlgeschlagen. Ist der Speicher voll?')));
  }
});
/* Beim Start: Liegt ein neuerer Stand in der Gerätedatenbank, diesen nehmen */
(async () => {
  try {
    if (!localStorage.getItem(ST_FLAG)) return;
    const raw = await ST_DB.get('state');
    if (!raw) return;
    const st = loadState(raw);
    if ((st.meta.modAt || 0) > (S.meta.modAt || 0)) {
      S = st;
      try {
        applyPlan();
      } catch (e) {
        logErr('storage:23', e, 1);
      }
      if (typeof smSnap === 'function') smSnap();
      render();
    }
  } catch (e) {
    console.warn('idb state', e);
  }
})();
function stUsage() {
  let n = 0;
  try {
    for (const k of Object.keys(localStorage)) if (/^hb_/.test(k)) n += (localStorage.getItem(k) || '').length;
  } catch (e) {}
  return n * 2;
}
function storageCard() {
  return storageCardBase() + errLogCard();
}
function storageCardBase() {
  const kb = Math.round(stUsage() / 1024);
  const max = 5120;
  const pct = Math.min(100, (kb / max) * 100);
  const idb = (() => {
    try {
      return !!localStorage.getItem(ST_FLAG);
    } catch (e) {
      return false;
    }
  })();
  return (
    '<div class="card"><h2>' +
    $t('Speicher auf diesem Gerät') +
    '</h2><div class="row small" style="justify-content:space-between;margin-top:6px"><span>' +
    $t('Browserspeicher') +
    '</span><span class="num">' +
    fmt(kb, 0) +
    ' / ~' +
    fmt(max, 0) +
    ' KB</span></div>' +
    '<div class="meter" style="background:var(--paper);margin-top:4px"><i style="width:' +
    pct +
    '%;background:' +
    (pct > 80 ? 'var(--signal)' : 'var(--verdant)') +
    '"></i></div>' +
    '<p class="src" style="margin-top:8px">' +
    (idb
      ? $t('Der Browserspeicher ist voll. Deine Daten liegen sicher in der größeren Gerätedatenbank.')
      : $t('Wird der Browserspeicher voll, wechselt die App automatisch in die größere Gerätedatenbank. Mit Konto liegt zusätzlich alles in der Cloud.')) +
    '</p></div>'
  );
}
hbFilter('privacyCard', 'storage', function (__v) {
  const h = __v;
  return h ? h + storageCard() : h;
});
/* Abmelden: fragen, ob die Daten auf dem Gerät bleiben */
document.addEventListener(
  'click',
  e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const a = b.dataset.act;
    if (a === 'logoutYes' && !b.dataset.keep) {
      e.stopImmediatePropagation();
      e.preventDefault();
      openSheet(
        sheetHead($t('Abmelden')) +
          '<p class="small" style="margin-top:8px">' +
          $t(
            'Sollen deine Daten auf diesem Gerät bleiben? Nutzt noch jemand anderes dieses Gerät, lösch sie besser. In der Cloud bleibt alles erhalten und kommt beim nächsten Anmelden zurück.'
          ) +
          '</p>' +
          '<div class="menu" style="margin-top:10px"><button class="act-pick" data-act="logoutYes" data-keep="1" type="button"><span class="grow">' +
          $t('Abmelden, Daten auf dem Gerät behalten') +
          '</span></button><button class="act-pick" data-act="logoutWipe" type="button"><span class="grow">' +
          $t('Abmelden und Daten auf diesem Gerät löschen') +
          '</span></button></div>'
      );
      return;
    }
    if (a === 'logoutYes' && b.dataset.keep) closeSheet();
    if (a === 'logoutWipe') {
      e.stopImmediatePropagation();
      closeSheet();
      (async () => {
        try {
          await syncNow(true);
        } catch (x) {
          logErr('storage:37', x, 1);
        }
        try {
          await logout();
        } catch (x) {
          logErr('storage:37', x, 1);
        }
        try {
          await ST_DB.del('state');
        } catch (x) {
          logErr('storage:37', x, 1);
        }
        wipeAll();
      })();
    }
  },
  true
);
/* Beim Hochladen: Gehört der lokale Stand einem anderen Konto, nicht in dieses Konto hochladen */
let ST_ASKED = false;
hbWrap('pushState', 'storage', async function (__next) {
  if (AUTH && S.meta.owner && S.meta.owner !== AUTH.uid) {
    SYNC.err = $t('Die Daten auf diesem Gerät gehören zu einem anderen Konto.');
    if (!ST_ASKED) {
      ST_ASKED = true;
      stOwnerSheet();
    }
    return;
  }
  return __next.apply(this, Array.prototype.slice.call(arguments, 1));
});
function stOwnerSheet() {
  openSheet(
    sheetHead($t('Daten eines anderen Kontos')) +
      '<p class="small" style="margin-top:8px">' +
      $t('Auf diesem Gerät liegen noch Daten eines anderen Kontos. Sie werden nicht in dein Konto hochgeladen, solange du nicht entscheidest.') +
      '</p>' +
      '<div class="menu" style="margin-top:10px"><button class="act-pick" data-act="stOwnWipe" type="button"><span class="grow"><b>' +
      $t('Löschen und meine Cloud-Daten laden') +
      '</b><br><span class="small muted" style="font-weight:500">' +
      $t('Empfohlen, wenn das Gerät geteilt wird') +
      '</span></span></button><button class="act-pick" data-act="stOwnTake" type="button"><span class="grow">' +
      $t('Diese Daten in mein Konto übernehmen') +
      '</span></button></div>'
  );
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  if (b.dataset.act === 'stOwnTake') {
    S.meta.owner = AUTH.uid;
    S.meta.forcePush = true;
    save();
    closeSheet();
    pushState();
    toast($t('Daten übernommen'));
  } else if (b.dataset.act === 'stOwnWipe') {
    closeSheet();
    (async () => {
      const a = AUTH;
      try {
        await ST_DB.del('state');
      } catch (x) {
        logErr('storage:46', x, 1);
      }
      Object.keys(localStorage)
        .filter(k => /^hb_state/.test(k) || k === KEY)
        .forEach(k => localStorage.removeItem(k));
      S = loadState('{}');
      S.meta.owner = a.uid;
      S.meta.onboarded = true;
      try {
        await pullAll({});
      } catch (x) {
        logErr('storage:46', x, 1);
      }
      save();
      render();
      toast($t('Deine Cloud-Daten sind geladen.'));
    })();
  }
});
/* Quellen und Lizenzen ergänzen (Karte unter „Mehr“) */
const LIC_MORE = () =>
  [
    '<li>' + $t('Icons: Tabler Icons (MIT).') + '</li>',
    '<li>' + $t('Karten: Leaflet (BSD-2), MapLibre GL JS (BSD-3), Kartenkacheln von OpenFreeMap, Kartendaten © OpenStreetMap-Mitwirkende (ODbL).') + '</li>',
    '<li>' + $t('QR-Codes: qrcode-generator von Kazuhiko Arase (MIT) · App-Gerüst: Capacitor (MIT).') + '</li>',
    '<li>' + $t('Übungsbilder: exercise-dataset.com, zur Laufzeit geladen.') + '</li>',
    '<li>' + $t('Laufzonen: Formeln nach Daniels und Gilbert (1979). Mahlzeiten-Erkennung: Google Gemini API.') + '</li>'
  ].join('');
hbFilter('viewMehr', 'storage', function (__v) {
  const h = __v;
  const i = h.indexOf('MPL 2.0');
  if (i < 0) return h;
  const j = hbAt(h, '</li>', 'storage', false, i);
  return j < 0 ? h : h.slice(0, j + 5) + LIC_MORE() + h.slice(j + 5);
});
/* Sprachansage, wenn das GPS-Signal beim Aufzeichnen wegbleibt (z. B. Akkusparmodus) und wenn es zurückkommt */
hbFilter('trTick', 'storage', function (__v) {
  const r = __v;
  try {
    if (TR.active && TR.gps && !TR.paused && TR.fixAt && !TR.gpsLost && Date.now() - TR.fixAt > 30000) {
      TR.gpsLost = Date.now();
      buzz([200, 100, 200]);
      say($t('GPS-Signal verloren.'));
    }
  } catch (e) {}
  return r;
});
hbWrap('onLoc', 'storage', function (__next) {
  const lost = TR.active && TR.gpsLost;
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  if (lost && TR.active && TR.fixAt && Date.now() - TR.fixAt < 2000) {
    TR.gpsLost = 0;
    say($t('GPS-Signal wieder da.'));
  }
  return r;
});
