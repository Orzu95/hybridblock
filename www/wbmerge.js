/* Hybridblock – Uhr-Einheit und App-Einheit zusammenführen
   Wer im Gym die Einheit in der App loggt und parallel auf der Uhr (z. B. „Frei“/„Other“) aufzeichnet,
   bekam zwei Einträge. Entscheidend ist jetzt die Uhrzeit, nicht die Sportart der Uhr:
   - Kraft-Einheit: Zeitfenster aus den abgehakten Sätzen; Uhr-Daten (Dauer, kcal, Puls, Pulskurve) hängen danach an der Einheit (s.watch), der freie Eintrag verschwindet.
   - Ausdauer/Intervalle: Zeitfenster aus dem Timer; der Uhr-Eintrag zählt als diese Einheit (countsAs) und erscheint nicht mehr extra.
   Ohne Zeitfenster nur, wenn es am Tag genau eine passende Einheit gibt. „Uhr-Daten trennen“ macht es rückgängig. */
'use strict';
const WB = { at: 0, first: true };
const wbOv = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
const wbSrcOk = a => a && a.src && a.src !== 'manual' && a.src !== 'gps' && !a.countsAs && !a.coachFor && !a.wbNo && num(a.dur) >= 5;
function wbWin(k, s) {
  if (isGym(k)) return gymWindow(s);
  if (s.timerStart) return { start: s.timerStart, end: s.timerStart + Math.max(60, s.timerDur || 0) * 1000 };
  return null;
}
/* passende Plan-Einheit für eine Uhr-Aktivität finden */
function wbFind(a) {
  const T = ACT_MAP[a.type] || ACT_MAP.sonst;
  const timed = [],
    loose = [];
  for (let w = 1; w <= NW(); w++)
    for (const k of ORDER) {
      const s = peekSess(w, k);
      if (!s || s.skipped || s.date !== a.date) continue;
      if (isGym(k)) {
        if (s.watch || !Object.keys(s.logs || {}).length) continue;
        /* echter Lauf mit Strecke ist eher eine eigene Einheit */
        if (T.run && num(a.dist) >= 1) continue;
      } else {
        if (!T.cardio || countsAsActivity(w, k) || !(s.cardio && num(s.cardio.dur) != null)) continue;
      }
      const win = wbWin(k, s);
      if (win && a.start && a.end) {
        const ov = wbOv(a.start, a.end, win.start, win.end);
        if (ov >= 0.5 * Math.min(a.end - a.start, win.end - win.start)) timed.push({ w, k, s, ov });
      } else loose.push({ w, k, s, ov: 0 });
    }
  if (timed.length) return timed.sort((x, y) => y.ov - x.ov)[0];
  return loose.length === 1 ? loose[0] : null;
}
function wbMerge(a, m) {
  if (isGym(m.k)) {
    const tk = sKey(m.w, m.k);
    m.s.watch = {
      dur: num(a.dur),
      kcal: num(a.kcal),
      key: a.key || null,
      start: a.start || null,
      end: a.end || null,
      avgHr: a.avgHr || null,
      act: JSON.parse(JSON.stringify(a))
    };
    if (S.hrTraces[a.id] && !S.hrTraces[tk]) {
      S.hrTraces[tk] = S.hrTraces[a.id];
      delete S.hrTraces[a.id];
    }
    if (a.key && !S.healthMeta.ignored.includes(a.key)) S.healthMeta.ignored.push(a.key);
    S.activities = S.activities.filter(x => x.id !== a.id);
  } else {
    a.countsAs = m.k;
    a.week = m.w;
    a.wb = 1;
    if (a.avgHr && m.s.cardio && !m.s.cardio.avg) m.s.cardio.avg = String(a.avgHr);
  }
}
function wbSweep() {
  if ((typeof VIEW !== 'undefined' && VIEW) || !S || !Array.isArray(S.activities)) return 0;
  const since = addDays(today(), -60);
  let n = 0;
  S.activities
    .filter(a => wbSrcOk(a) && a.date >= since)
    .forEach(a => {
      const m = wbFind(a);
      if (m) {
        wbMerge(a, m);
        n++;
      }
    });
  if (n) save();
  return n;
}
/* Rückgängig */
function wbSplitGym(w, k) {
  const s = peekSess(w, k);
  if (!s || !s.watch || !s.watch.act) return;
  const a = Object.assign({}, s.watch.act, { wbNo: 1 });
  const tk = sKey(w, k);
  if (S.hrTraces[tk] && !S.hrTraces[a.id]) {
    S.hrTraces[a.id] = S.hrTraces[tk];
    delete S.hrTraces[tk];
  }
  if (a.key) S.healthMeta.ignored = S.healthMeta.ignored.filter(x => x !== a.key);
  delete s.watch;
  if (!S.activities.some(x => x.id === a.id)) S.activities.push(a);
  save();
}
function wbSplitAct(id) {
  const a = S.activities.find(x => x.id === id);
  if (!a) return;
  delete a.countsAs;
  delete a.wb;
  a.wbNo = 1;
  save();
}
const wbSplitBtn = (attrs, cls) =>
  '<button class="btn sm ghost' + (cls || '') + '" data-act="wbSplit" ' + attrs + ' type="button">' + $t('Uhr-Daten trennen') + '</button>';

hbWrap('render', 'wbmerge', function (__next) {
  const now = Date.now();
  if (now - WB.at > 4000) {
    WB.at = now;
    let n = 0;
    try {
      n = wbSweep();
    } catch (e) {
      logErr('wbmerge', e);
    }
    if (n) setTimeout(() => toast($tf('{n} doppelte Einheiten zusammengeführt (Uhr + App)', { n })), 400);
  }
  return __next.apply(this, Array.prototype.slice.call(arguments, 1));
});
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-act="wbSplit"]');
  if (!b) return;
  if (b.dataset.aid) wbSplitAct(b.dataset.aid);
  else wbSplitGym(+b.dataset.w, b.dataset.k);
  WB.at = Date.now();
  render();
  toast($t('Getrennt. Die Uhr-Einheit steht wieder als freie Aktivität drin.'));
});
