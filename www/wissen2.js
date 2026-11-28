'use strict';
/* ======================= WISSEN 2: neue Wissenskarten und Quizfragen (Gemini-Ausarbeitung, Nov. 2026) =======================
   Daten: wissen-<LANG>.json → {items:{id:{k:Karte, z:{basis,plus,labor}, h?:1}}}. Fehlt die Datei für die Sprache,
   bleiben die alten Lernkarten (x.sl) aus evidence(-LANG).json als Rückfall.
   x.sl wird zum Getter: Titel, Schlüsselzahl, Kernaussagen und Quizfrage passend zur Ansicht (Basis · Plus · Labor).
   h = Eintrag mit offenen Prüffragen → nicht in Quiz, Lernkarten und Fakt des Tages, nur als Studiendetail. */
const W2_LV = ['basis', 'plus', 'labor'];
/* Farben und Symbole für die neueren Themen (bisher grau mit Ausrufezeichen) */
Object.assign(EVC, {
  PAC: ['#0a84c6', 'M12 13l2.5-2.5M10 2h4M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16z'],
  PAU: ['#5b6b80', 'M9 5v14M15 5v14'],
  KHP: ['#d98a00', 'M12 21V8M12 8c-2-1-3-2.5-3-5 2 0 3 1.5 3 3.5M12 8c2-1 3-2.5 3-5-2 0-3 1.5-3 3.5M12 13c-2-1-3-2.5-3-5M12 13c2-1 3-2.5 3-5M12 18c-2-1-3-2.5-3-5M12 18c2-1 3-2.5 3-5'],
  FST: ['#6a5cff', 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z']
});
const w2Lv = () => (typeof viewLv === 'function' ? viewLv() : 2);
function w2Apply(j, w) {
  if (!w || !w.items) return;
  j.items.forEach(x => {
    const d = w.items[x.id];
    if (!d) return;
    x.w = d;
    Object.defineProperty(x, 'sl', {
      configurable: true,
      enumerable: true,
      get() {
        if (d.h) return undefined;
        const lv = w2Lv(),
          k = d.k,
          q = d.z[W2_LV[lv - 1]] || d.z.plus;
        return {
          h: k.titel,
          kn: k.zahl ? [k.zahl.wert, k.zahl.label] : ['', ''],
          b: k.kern || [],
          fd: k.fuer_dich || '',
          q: { q: q.frage, r: q.richtig, w: q.falsch, d: lv, y: q.warum }
        };
      },
      set() {}
    });
  });
}
const __w2_loadEvid = loadEvid;
loadEvid = function () {
  if (EVID) return __w2_loadEvid();
  const wf = fetch('wissen-' + LANG + '.json')
    .then(r => (r.ok ? r.json() : null))
    .catch(() => null);
  return Promise.all([__w2_loadEvid(), wf]).then(([j, w]) => {
    if (!j.w2) {
      w2Apply(j, w);
      j.w2 = 1;
    }
    return j;
  });
};

/* Titel mit farbig hervorgehobenem Teil */
function w2Title(k) {
  const t = k.titel || '',
    h = k.titel_hervor || '',
    i = h ? t.indexOf(h) : -1;
  if (i < 0) return esc(t);
  return esc(t.slice(0, i)) + '<mark>' + esc(h) + '</mark>' + esc(t.slice(i + h.length));
}
const w2Src = x => {
  const s = (x.w && x.w.k.labor && x.w.k.labor.quelle) || x.q.split(';')[0];
  return '<p class="w2src">' + esc(s) + (x.y && s.indexOf(x.y) < 0 ? ', ' + x.y : '') + '</p>';
};
function w2Num(k, lv) {
  const z = k.zahl;
  if (!z || !z.wert) return '';
  return (
    '<div class="w2num"><b>' +
    esc(z.wert) +
    '</b><span>' +
    esc(z.label) +
    '</span>' +
    (z.alltag && lv >= 2 ? '<em>' + esc(z.alltag) + '</em>' : '') +
    '</div>'
  );
}
/* Ganze Karte: Basis = Titel, Zahl, Für dich · Plus = + Versuch, 3 Kernaussagen, Grenze · Labor = + Studiendesign */
function w2Card(x, short) {
  const k = x.w.k,
    lv = w2Lv();
  const lab = k.labor || {};
  const rows = [
    [$t('Studiendesign'), lab.design],
    [$t('Teilnehmende'), lab.teilnehmer],
    [$t('Ergebnis'), lab.ergebnis]
  ].filter(r => r[1]);
  return (
    '<div class="w2" style="' +
    evVars(x.c) +
    '">' +
    '<div class="w2top">' +
    evIc(x.c, 30) +
    '<span class="grow">' +
    esc(k.kopf || evCat(x.c)) +
    '</span>' +
    evG(x.e) +
    '</div>' +
    '<h3 class="w2t">' +
    w2Title(k) +
    '</h3>' +
    (!short && lv >= 2 && k.setup ? '<p class="w2set">' + esc(k.setup) + '</p>' : '') +
    w2Num(k, lv) +
    (!short && lv >= 2 && k.kern && k.kern.length
      ? '<ul class="w2kern">' + k.kern.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>'
      : '') +
    (k.fuer_dich ? '<div class="w2fd">' + ICON_BULB + '<p>' + esc(k.fuer_dich) + '</p></div>' : '') +
    (!short && lv >= 2 && k.grenze ? '<p class="w2gr"><b>' + $t('Was die Studie nicht zeigt') + '</b> ' + esc(k.grenze) + '</p>' : '') +
    (!short && lv >= 3 && rows.length
      ? '<dl class="w2lab">' + rows.map(r => '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>').join('') + '</dl>'
      : '') +
    w2Src(x) +
    '</div>'
  );
}

/* Fakt des Tages: kurze Fassung, „Mehr dazu“ klappt die ganze Karte auf */
const __w2_factBody = factBody;
factBody = function (x) {
  if (!x.w || x.w.h) return __w2_factBody(x);
  return w2Card(x, true);
};
const __w2_factPool = factPool;
factPool = function () {
  return __w2_factPool().filter(o => !(o.x.w && o.x.w.h));
};

/* Eintrag öffnen: ganze Karte statt der drei Folien */
const __w2_evSheet = evSheet;
evSheet = function (ids) {
  if (!EVID || ids.length !== 1) return __w2_evSheet(ids);
  const x = EVID.by[ids[0]];
  if (!x || !x.w || x.w.h) return __w2_evSheet(ids);
  openSheet(
    sheetHead(esc(evCat(x.c))) +
      '<div data-noglos style="margin-top:8px">' +
      w2Card(x, false) +
      '<div class="row" style="gap:8px;margin-top:12px"><button class="btn sm fog" data-act="evDet" data-id="' +
      x.id +
      '" type="button">' +
      $t('Studiendetails') +
      '</button><button class="btn sm fog" data-act="lcOne" data-id="' +
      x.id +
      '" type="button">' +
      $t('Als Lernkarte üben') +
      '</button></div>' +
      (w2Lv() < 3 ? '<p class="small muted" style="margin-top:10px">' + $t('Mehr Tiefe (Methoden, Effektgrößen) in der Ansicht Labor.') + '</p>' : '') +
      '</div>'
  );
};

/* Quiz-Erklärung: „Warum“ aus der Frage der aktuellen Stufe, Zahl ab Plus, Quelle klein */
const __w2_qzExplain = qzExplain;
qzExplain = function (x, right) {
  const s = x.sl;
  if (!x.w || !s || !s.q.y) return __w2_qzExplain(x, right);
  const lv = w2Lv(),
    k = x.w.k;
  return (
    '<div class="qzx ' +
    (right ? 'ok' : 'no') +
    '"><p class="qzv">' +
    (right ? '✓ ' + $t('Richtig!') : '✕ ' + $t('Nicht ganz.')) +
    '</p>' +
    (right ? '' : '<p style="margin:4px 0 0"><span class="muted">' + $t('Richtig ist: ') + '</span><b>' + esc(s.q.r) + '</b></p>') +
    '<p style="margin:8px 0 0">' +
    esc(s.q.y) +
    '</p>' +
    (lv >= 2 && k.zahl && k.zahl.wert ? '<p class="small" style="margin:8px 0 0"><b>' + esc(k.zahl.wert) + '</b> ' + esc(k.zahl.label) + '</p>' : '') +
    w2Src(x) +
    '</div>'
  );
};

(function () {
  const st = document.createElement('style');
  st.textContent =
    '.w2{background:var(--ct);border-radius:20px;padding:16px}.w2top{display:flex;gap:10px;align-items:center;font-size:13px;font-weight:700;color:var(--cd)}' +
    '.w2t{margin:12px 0 0;font-size:20px;line-height:1.25;font-weight:800}.w2t mark{background:none;color:var(--cc)}' +
    '.w2set{margin:8px 0 0;color:var(--muted);font-size:15px}' +
    '.w2num{margin-top:14px;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px}.w2num b{font-size:34px;line-height:1;font-weight:800;color:var(--cc)}.w2num span{font-weight:700}.w2num em{flex-basis:100%;font-style:normal;font-size:14px;color:var(--muted)}' +
    '.w2kern{margin:12px 0 0;padding:0;list-style:none}.w2kern li{position:relative;padding-left:16px;margin:6px 0;font-size:15px}.w2kern li::before{content:"";position:absolute;left:0;top:.55em;width:7px;height:7px;border-radius:50%;background:var(--cc)}' +
    '.w2fd{display:flex;gap:10px;align-items:flex-start;margin-top:12px;background:#fff;border-radius:14px;padding:10px 12px}.w2fd svg{flex:0 0 22px;color:var(--cc)}.w2fd p{margin:0;font-weight:600}' +
    '.w2gr{margin:10px 0 0;font-size:14px;color:var(--graphite)}.w2gr b{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}' +
    '.w2lab{margin:12px 0 0;display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px}.w2lab dt{color:var(--muted);font-weight:700}.w2lab dd{margin:0}' +
    '.fct .w2{background:none;padding:0;margin-top:6px}.fct .w2top .evg{display:none}.fct .w2fd{background:rgba(255,255,255,.7)}' +
    '.w2src{margin:12px 0 0;font-size:12px;color:var(--muted)}.qzx .w2src{margin-top:6px}';
  document.head.appendChild(st);
})();
