/* Hybridblock – Fazit nach jeder Krafteinheit, aus den geloggten Sätzen (Regeln, keine KI):
   Bestwerte, ausgelassene Sätze, Volumen gegenüber der Vorwoche, RPE gegenüber dem Ziel, Übungen bereit für mehr Gewicht.
   Gespeichert wird nur die Struktur (s.fz in der Kurzfassung), der Text entsteht in der Sprache des Lesers. */
'use strict';
function fzData(w, k) {
  if (!isGym(k)) return null;
  const s = peekSess(w, k);
  if (!s || s.skipped || !s.logs || !Object.keys(s.logs).length) return null;
  const pl = planFor(w, k),
    st = sessStats(w, k);
  const rpeD = [],
    up = [];
  let miss = 0,
    tot = 0;
  pl.forEach(p => {
    const lg = s.logs[p.slot];
    tot += p.sets;
    const done = lg ? loggedSets(lg).filter(x => x.done) : [];
    miss += Math.max(0, p.sets - done.length);
    if (!lg || !done.length) return;
    const rr = repRange(p.reps),
      tgt = p.rpe;
    const rp = done.filter(x => x.rpe != null).map(x => x.rpe);
    if (rp.length && tgt != null) rpeD.push(rp.reduce((a, b) => a + b, 0) / rp.length - tgt);
    if (rr && done.length >= p.sets && done.every(x => x.r != null && x.r >= rr.hi) && (!rp.length || tgt == null || Math.max(...rp) <= tgt) && LIB[lg.ex])
      up.push(lg.ex);
  });
  let vp = null;
  if (w > 1 && st.vol > 0) {
    const prev = peekSess(w - 1, k);
    let v = 0;
    if (prev && prev.logs)
      Object.values(prev.logs).forEach(lg =>
        loggedSets(lg)
          .filter(x => x.done && x.w > 0 && x.r)
          .forEach(x => {
            v += x.w * x.r;
          })
      );
    if (v > 0) vp = Math.round((st.vol / v - 1) * 100);
  }
  const byName = n => Object.keys(LIB).find(id => LIB[id].name === n) || null;
  return {
    k,
    w,
    t: SESS[k] ? SESS[k].title : '',
    d: s.date || null,
    pr: st.prs
      .map(p => byName(p.name))
      .filter(Boolean)
      .slice(0, 3),
    up: up.slice(0, 3),
    miss,
    tot,
    rd: rpeD.length ? Math.round((rpeD.reduce((a, b) => a + b, 0) / rpeD.length) * 10) / 10 : null,
    vp
  };
}
function fzText(z) {
  const nm = id => (LIB[id] ? $t(LIB[id].name) : id);
  const pr = (z.pr || []).map(nm),
    up = (z.up || []).map(nm);
  const missHi = z.tot && z.miss / z.tot > 0.2;
  let h;
  if (pr.length)
    h = pr.length === 1 ? $tf('Neuer Bestwert bei {e}.', { e: pr[0] }) : $tf('{n} neue Bestwerte, unter anderem bei {e}.', { n: pr.length, e: pr[0] });
  else if (missHi) h = $tf('{n} von {t} Sätzen ausgelassen.', { n: z.miss, t: z.tot });
  else if (z.vp != null && z.vp >= 5) h = $tf('Mehr bewegt als letzte Woche (+{p} % Volumen).', { p: z.vp });
  else if (z.vp != null && z.vp <= -10) h = $tf('Weniger Volumen als letzte Woche ({p} %).', { p: z.vp });
  else h = $t('Einheit sauber nach Plan erledigt.');
  if (z.rd != null && z.rd >= 1) h += ' ' + $tf('Härter als geplant (RPE im Schnitt +{d}).', { d: fmt(z.rd, 1) });
  else if (z.rd != null && z.rd <= -1.5) h += ' ' + $t('Leichter als geplant, da ist noch Luft.');
  let n;
  if (up.length) n = $tf('Nächstes Mal mehr Gewicht bei {e}: Alle Sätze waren am oberen Ende der Wiederholungen.', { e: up.join(', ') });
  else if (z.rd != null && z.rd >= 1.5) n = $t('Nächstes Mal: Gewicht leicht senken oder auf Schlaf und Essen achten.');
  else if (missHi) n = $t('Nächstes Mal: Wenn die Zeit knapp ist, nutz „Wenig Zeit“, statt Sätze auszulassen.');
  else n = $t('Nächstes Mal: gleiche Gewichte, Wiederholungen dazugewinnen.');
  return [h, n];
}
function fzHTML(z, title) {
  const [h, n] = fzText(z);
  return (
    '<div class="fz"><div class="lbl">' +
    esc(title || $t('Fazit')) +
    '</div><p style="margin:0">' +
    esc(h) +
    '</p><p class="small" style="margin:6px 0 0">' +
    esc(n) +
    '</p></div>'
  );
}
hbWrap('finSheet', 'fazit', function (__next, w, k) {
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  try {
    const z = fzData(w, k);
    const el = document.querySelector('#sheet .fin-week');
    if (z && el) el.insertAdjacentHTML('beforebegin', fzHTML(z));
  } catch (e) {
    logErr('fazit:sheet', e, 1);
  }
  return r;
});
hbFilter('makeSummary', 'fazit', function (s) {
  try {
    const w = curWeek(),
      out = [];
    [w, w - 1].forEach(ww => {
      if (ww < 1) return;
      ORDER.forEach(k => {
        const se = peekSess(ww, k);
        if (!se || !se.end || !se.end.fin) return;
        const z = fzData(ww, k);
        if (z) out.push(Object.assign(z, { fin: se.end.fin }));
      });
    });
    s.fz = out
      .sort((a, b) => b.fin - a.fin)
      .slice(0, 3)
      .map(z => {
        delete z.fin;
        return z;
      });
  } catch (e) {
    logErr('fazit:sum', e, 1);
  }
  return s;
});
hbFilter('viewClient', 'fazit', function (h, uid2) {
  const c = (ADMIN.clients || []).find(x => x.id === uid2);
  const L = (c && c.summary && c.summary.fz) || [];
  if (!L.length) return h;
  const card =
    '<div class="card"><h2>' +
    $t('Letzte Krafteinheiten') +
    '</h2>' +
    L.map(z => fzHTML(z, $t(z.t || '') + ' · ' + $t('Woche ') + z.w + (z.d ? ' · ' + fmtDay(z.d) : ''))).join('') +
    '</div>';
  const i = hbAt(h, '<div class="stats">', 'fazit', true);
  return i < 0 ? h + card : h.slice(0, i) + card + h.slice(i);
});
