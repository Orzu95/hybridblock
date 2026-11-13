/* Hybridblock – Pace-Zonen aus einem Lauftest (Daniels-Gilbert-VDOT, PACE-101 ff.)
   Test: 5 km, 3 km, Cooper (12 min), 30 min oder ein Wettkampf/Lauf mit Distanz und Zeit. Daraus VDOT und fünf Zonen (E, M, T, I, R).
   Puls: HFmax aus den Einstellungen, sonst Tanaka (208 − 0,7 × Alter); mit Ruhepuls Karvonen (% Herzfrequenzreserve). */
'use strict';
const RZ = [
  { k: 'E', n: 'Locker (Z1–2)', d: 'Grundlage, lange Läufe, Erholung', lo: 0.59, hi: 0.74, hr: [0.65, 0.79], hrr: [0.6, 0.75] },
  { k: 'M', n: 'Marathon (Z3)', d: 'Zügiger Dauerlauf', lo: 0.75, hi: 0.84, hr: [0.8, 0.89], hrr: [0.75, 0.84] },
  { k: 'T', n: 'Schwelle (Z4)', d: 'Tempodauerlauf, lange Intervalle', lo: 0.83, hi: 0.88, hr: [0.88, 0.92], hrr: [0.83, 0.88] },
  { k: 'I', n: 'Intervall (Z5)', d: '3–5 min schnell, VO₂max', lo: 0.975, hi: 1.0, hr: [0.98, 1], hrr: [0.95, 1] },
  { k: 'R', n: 'Wiederholung', d: '200–400 m sehr schnell, volle Pause', lo: 1.05, hi: 1.1, hr: null, hrr: null }
];
const RZ_TESTS = {
  t5k: { n: '5-km-Zeitlauf', dist: 5000 },
  t3k: { n: '3-km-Zeitlauf', dist: 3000 },
  cooper: { n: 'Cooper-Test (12 Minuten)', min: 12 },
  t30: { n: '30-Minuten-Lauf', min: 30 },
  race: { n: 'Wettkampf oder schneller Lauf' }
};
function vdotOf(m, sec) {
  const t = sec / 60,
    v = m / t;
  const vo2 = -4.6 + 0.182258 * v + 0.000104 * v * v;
  const f = 0.8 + 0.1894393 * Math.exp(-0.012778 * t) + 0.2989558 * Math.exp(-0.1932605 * t);
  return vo2 / f;
}
function rzVel(vdot, p) {
  const a = 0.000104,
    b = 0.182258,
    c = -(4.6 + p * vdot);
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}
const rzPace = (vdot, p) => 60000 / rzVel(vdot, p); /* s/km */
function rzHfmax() {
  const h = num(S.settings.hfmax);
  if (h) return h;
  const a = num(S.settings.age);
  return a ? Math.round(208 - 0.7 * a) : null;
}
function rzTest() {
  const t = S.settings.runTest;
  return t && t.vdot ? t : null;
}
function rzZones() {
  const t = rzTest();
  if (!t) return null;
  const hf = rzHfmax();
  const rhr = typeof rhrBaseline === 'function' ? rhrBaseline() : null;
  return RZ.map(z => {
    const out = { k: z.k, n: z.n, d: z.d, fast: rzPace(t.vdot, z.hi), slow: rzPace(t.vdot, z.lo) };
    if (z.hr && hf) {
      if (rhr) out.bpm = [Math.round(rhr + (hf - rhr) * z.hrr[0]), Math.round(rhr + (hf - rhr) * z.hrr[1])];
      else out.bpm = [Math.round(hf * z.hr[0]), Math.round(hf * z.hr[1])];
    }
    return out;
  });
}
function rzCard__base() {
  const t = rzTest();
  const zs = rzZones();
  if (!t)
    return (
      '<div class="card" id="rzcard"><h2>' +
      $t('Deine Laufzonen') +
      '</h2><p class="small muted" style="margin:6px 0 12px">' +
      $t('Mach einen kurzen Lauftest oder trag eine aktuelle Bestzeit ein. Die App berechnet daraus deine Pace für lockere Läufe, Schwelle und Intervalle.') +
      '</p><button class="btn brand" data-act="rzOpen" type="button">' +
      $t('Lauftest eintragen') +
      '</button></div>'
    );
  const age = daysBetween(t.date, today());
  const old = age > 56;
  return (
    '<div class="card" id="rzcard"><div class="row" style="align-items:baseline"><h2 class="grow" style="margin:0">' +
    $t('Deine Laufzonen') +
    '</h2><span class="small muted num">VDOT ' +
    fmt(t.vdot, 1) +
    '</span></div>' +
    '<p class="src" style="margin:4px 0 10px">' +
    esc($t(RZ_TESTS[t.type] ? RZ_TESTS[t.type].n : '')) +
    ' · ' +
    fmtDay(t.date) +
    (t.vdot ? '' : '') +
    '</p>' +
    '<div class="tbl"><table><thead><tr><th>' +
    $t('Zone') +
    '</th><th>' +
    $t('Pace /km') +
    '</th><th>' +
    $t('Puls') +
    '</th></tr></thead><tbody>' +
    zs
      .map(
        z =>
          '<tr><td><b>' +
          esc($t(z.n)) +
          '</b><br><span class="small muted">' +
          esc($t(z.d)) +
          '</span></td><td class="num">' +
          fmtPace(z.fast) +
          '–' +
          fmtPace(z.slow) +
          '</td><td class="num">' +
          (z.bpm ? z.bpm[0] + '–' + z.bpm[1] : '–') +
          '</td></tr>'
      )
      .join('') +
    '</tbody></table></div>' +
    '<p class="src" style="margin-top:8px">' +
    $t(
      'Berechnet nach Daniels und Gilbert. Puls nach Herzfrequenzreserve, wenn ein Ruhepuls vorliegt, sonst in % vom Maximalpuls. Hitze, Wind und Steigung machen dich langsamer: dann nach Puls oder Gefühl laufen.'
    ) +
    '</p>' +
    (old
      ? note(
          'ember',
          '<b>' + $t('Zeit für einen neuen Test.') + '</b> ' + $t('Dein letzter Test ist über 8 Wochen alt. Alle 4–8 Wochen neu testen hält die Zonen aktuell.')
        )
      : '') +
    '<div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><button class="btn" data-act="rzOpen" type="button">' +
    $t('Neuen Test eintragen') +
    '</button></div></div>'
  );
}
function rzCard() {
  return hbRun('rzCard', this, arguments, rzCard__base);
}
function rzSheet(type) {
  type = type || ui.rzType || 't5k';
  ui.rzType = type;
  const T = RZ_TESTS[type];
  const runs = (S.activities || [])
    .filter(a => {
      const at = ACT_MAP[a.type];
      return at && at.run && num(a.dist) >= 1 && num(a.dur) > 0 && a.date >= addDays(today(), -60);
    })
    .slice(-5)
    .reverse();
  openSheet(
    sheetHead($t('Lauftest eintragen')) +
      '<div class="wkchs" style="margin-top:8px">' +
      Object.keys(RZ_TESTS)
        .map(
          k =>
            '<button class="wkch' + (k === type ? ' on' : '') + '" data-act="rzType" data-v="' + k + '" type="button">' + esc($t(RZ_TESTS[k].n)) + '</button>'
        )
        .join('') +
      '</div>' +
      '<p class="small muted" style="margin:10px 0">' +
      (T.min
        ? $tf('Lauf {m} Minuten so weit wie möglich, gleichmäßig. Trag die Strecke ein.', { m: T.min })
        : T.dist
          ? $t('Lauf die Strecke so schnell, wie du sie gleichmäßig durchhalten kannst. Trag die Zeit ein.')
          : $t('Distanz und Zeit eines Laufs, bei dem du wirklich am Limit warst, aus den letzten Wochen.')) +
      ' ' +
      $t('Vorher 10–15 Minuten locker einlaufen. Flache Strecke, kein starker Wind.') +
      '</p>' +
      '<div class="fields on-white">' +
      (T.min
        ? ''
        : (T.dist
            ? ''
            : '<div class="field"><label for="rz-d">' + $t('Distanz (km)') + '</label><input id="rz-d" type="number" inputmode="decimal" step="0.01"></div>') +
          '<div class="field"><label for="rz-t">' +
          $t('Zeit (mm:ss oder h:mm:ss)') +
          '</label><input id="rz-t" type="text" inputmode="numeric" placeholder="25:00"></div>') +
      (T.min
        ? '<div class="field"><label for="rz-d">' + $t('Strecke (km)') + '</label><input id="rz-d" type="number" inputmode="decimal" step="0.01"></div>'
        : '') +
      '</div>' +
      (runs.length && type === 'race'
        ? '<p class="small" style="margin:10px 0 4px"><b>' +
          $t('Aus deinen Läufen übernehmen') +
          '</b></p><div class="wkchs">' +
          runs
            .map(
              a =>
                '<button class="wkch" data-act="rzRun" data-id="' +
                esc(a.id) +
                '" type="button">' +
                esc(fmtDay(a.date)) +
                ' · ' +
                fmt(num(a.dist), 1) +
                ' km · ' +
                fmt(num(a.dur), 0) +
                ' min</button>'
            )
            .join('') +
          '</div>'
        : '') +
      '<details style="margin-top:12px"><summary class="small" style="font-weight:700">' +
      $t('Ist ein Maximaltest für mich geeignet?') +
      '</summary><p class="small" style="margin:8px 0 0">' +
      $t(
        'Lass einen Maximaltest weg, wenn du gerade erst mit dem Laufen anfängst, Herz-, Kreislauf- oder Stoffwechselerkrankungen hast, Medikamente für Herz oder Blutdruck nimmst, schwanger bist oder bei Belastung schon einmal Brustschmerz, Schwindel oder Atemnot hattest. Dann zuerst ärztlich abklären. Alternative ohne Maximaltest: 20–30 Minuten so laufen, dass du noch in ganzen Sätzen sprechen kannst, und das als lockeres Tempo nutzen.'
      ) +
      '</p></details>' +
      '<div class="row" style="margin-top:14px"><div class="grow"></div><button class="btn brand" data-act="rzSave" type="button">' +
      $t('Zonen berechnen') +
      '</button></div>'
  );
}
function rzParseTime(s) {
  s = String(s || '')
    .trim()
    .replace(',', '.');
  if (!s) return null;
  const p = s.split(':').map(Number);
  if (p.some(isNaN)) return null;
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : p[0] * 60;
}
function rzSet(type, m, sec) {
  if (!(m >= 1000 && sec >= 300)) {
    toast($t('Bitte Distanz ab 1 km und Zeit ab 5 Minuten eintragen.'));
    return false;
  }
  const v = vdotOf(m, sec);
  if (!(v > 15 && v < 90)) {
    toast($t('Das Ergebnis wirkt unrealistisch. Bitte Distanz und Zeit prüfen.'));
    return false;
  }
  S.settings.runTest = { type, m: Math.round(m), sec: Math.round(sec), vdot: Math.round(v * 10) / 10, date: today() };
  save();
  return true;
}
/* In Laufeinheiten: passende Pace anzeigen */
hbFilter('cardioView', 'runzones', function (__v, w, k) {
  const h = __v;
  const zs = rzZones();
  if (!zs) return h;
  let hard = !(typeof reState === 'function' && reState()) && isHiit(k);
  try {
    const sp = cardioSpec(w, k);
    if (sp && sp.mode === 'int' && sp.hi) hard = true;
  } catch (e) {}
  const E = zs[0],
    I = zs[3];
  const tip = hard
    ? $tf('Deine Pace: schnelle Abschnitte {i} /km, Erholung locker ab {e} /km.', { i: fmtPace(I.fast) + '–' + fmtPace(I.slow), e: fmtPace(E.fast) })
    : $tf('Deine lockere Pace: {a}–{b} /km. Lieber zu langsam als zu schnell.', { a: fmtPace(E.fast), b: fmtPace(E.slow) });
  return note('green', tip, '<a class="btn sm" href="#mehr" data-act="rzGo">' + $t('Zonen') + '</a>') + h;
});
hbFilter('viewMehr', 'runzones', function (__v) {
  const h = __v;
  const i = h.indexOf('<div class="card"><h2>' + $t('Training') + '</h2>');
  return i < 0 ? h + rzCard() : h.slice(0, i) + rzCard() + h.slice(i);
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'rzOpen') rzSheet();
  else if (a === 'rzType') rzSheet(b.dataset.v);
  else if (a === 'rzGo') {
    setTimeout(() => {
      const c = document.getElementById('rzcard');
      if (c) c.scrollIntoView({ block: 'start' });
    }, 300);
  } else if (a === 'rzRun') {
    const r = S.activities.find(x => String(x.id) === b.dataset.id);
    if (r && rzSet('race', num(r.dist) * 1000, num(r.dur) * 60)) {
      closeSheet();
      render();
      doneOverlay($t('Laufzonen berechnet'), 'VDOT ' + fmt(S.settings.runTest.vdot, 1));
    }
  } else if (a === 'rzSave') {
    const T = RZ_TESTS[ui.rzType || 't5k'];
    const dEl = document.getElementById('rz-d'),
      tEl = document.getElementById('rz-t');
    const m = T.dist || (num(dEl && dEl.value) || 0) * 1000;
    const sec = T.min ? T.min * 60 : rzParseTime(tEl && tEl.value);
    if (rzSet(ui.rzType || 't5k', m, sec)) {
      closeSheet();
      render();
      doneOverlay($t('Laufzonen berechnet'), 'VDOT ' + fmt(S.settings.runTest.vdot, 1));
    }
  }
});
/* ---------- Ausbau: Bestform aus GPS-Läufen erkennen und Pace-Ansage ---------- */
/* Schnellstes zusammenhängendes Stück über 3, 5 und 10 km aus Route und Zeitstempeln; nur flache Läufe (unter 10 Höhenmeter pro km) */
function rzBestEffort(a) {
  if (!a || !a.route || !a.routeT || !(num(a.dist) >= 3)) return null;
  const at = ACT_MAP[a.type];
  if (!at || !at.run || a.type === 'laufband') return null;
  if (num(a.elev) && num(a.elev) / num(a.dist) > 10) return null;
  let pts;
  try {
    pts = decPoly(a.route);
  } catch (e) {
    return null;
  }
  const T = a.routeT;
  if (pts.length !== T.length || pts.length < 20) return null;
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + hav(pts[i - 1], pts[i]));
  let best = null;
  [3000, 5000, 10000].forEach(D => {
    if (cum[cum.length - 1] < D) return;
    let j = 0,
      bestT = Infinity;
    for (let i = 0; i < pts.length; i++) {
      while (j < pts.length && cum[j] - cum[i] < D) j++;
      if (j >= pts.length) break;
      const t = T[j] - T[i];
      if (t > 0 && t < bestT) bestT = t;
    }
    if (!isFinite(bestT) || bestT < D / 6.5) return;
    const v = vdotOf(D, bestT);
    if (v > 15 && v < 85 && (!best || v > best.vdot)) best = { vdot: Math.round(v * 10) / 10, m: D, sec: bestT };
  });
  return best;
}
function rzCheckRun(a) {
  const b = rzBestEffort(a);
  if (!b) return;
  const t = rzTest();
  if (t && b.vdot < t.vdot * 1.02) return;
  S.meta.rzSuggest = Object.assign({ date: a.date, act: a.id }, b);
  save();
  toast($tf('Neue Bestform erkannt: VDOT {v}. In den Einstellungen kannst du deine Laufzonen aktualisieren.', { v: fmt(b.vdot, 1) }));
}
const _trSaveRZ = trSave;
trSave = async function () {
  const n = (S.activities || []).length;
  const r = await _trSaveRZ.apply(this, arguments);
  try {
    const a = S.activities[S.activities.length - 1];
    if (S.activities.length > n && a && a.src === 'gps') rzCheckRun(a);
  } catch (e) {
    console.warn('rz', e);
  }
  return r;
};
hbFilter('rzCard', 'runzones', function (__v) {
  const h = __v;
  const s = S.meta.rzSuggest;
  if (!s) return h;
  const km = s.m / 1000;
  const n =
    '<div class="note green" style="display:block;margin-top:10px"><b>' +
    $tf('Neue Bestform: {km} km in {t} am {d}', { km: fmt(km, 0), t: fmtClock(s.sec), d: fmtDay(s.date) }) +
    '</b><br>' +
    $tf('Das entspricht VDOT {v}. Zonen damit aktualisieren?', { v: fmt(s.vdot, 1) }) +
    '<div class="row" style="gap:8px;margin-top:8px"><button class="btn sm brand" data-act="rzTake" type="button">' +
    $t('Übernehmen') +
    '</button><button class="btn sm" data-act="rzDrop" type="button">' +
    $t('Nein') +
    '</button></div></div>';
  const i = h.indexOf('<h2');
  const j = h.indexOf('</div>', h.indexOf('</h2>'));
  return j < 0 ? h + n : h.slice(0, j + 6) + n + h.slice(j + 6);
});
/* Pace-Ansage bei lockeren Läufen ohne Intervalle und ohne Pulszone: zu schnell oder zu langsam für die Zone „Locker“ */
hbFilter('trTick', 'runzones', function (__v) {
  const r = __v;
  try {
    const zs = rzZones();
    const at = ACT_MAP[TR.type];
    if (!zs || !TR.active || TR.paused || !TR.gps || TR.q || TR.zone != null || !at || !at.run || !trOpts().voice || !(S.settings.rzVoice ?? true)) return r;
    const easy = !TR.ctx || !isHiit(TR.ctx.k);
    if (!easy || movingSec() < 300) return r;
    const v = curSpeed();
    if (!(v > 0.5)) return r;
    const pace = 1000 / v;
    const E = zs[0];
    const out = pace < E.fast - 10 ? 'fast' : pace > E.slow + 30 ? 'slow' : null;
    if (out !== TR.rzOut) {
      TR.rzOut = out;
      TR.rzSince = Date.now();
    }
    if (out && Date.now() - TR.rzSince > 30000 && Date.now() - (TR.rzSaid || 0) > 120000) {
      TR.rzSaid = Date.now();
      say(
        out === 'fast'
          ? $tf('Etwas zu schnell für locker. Ziel {a} bis {b}.', { a: sayPace(E.fast), b: sayPace(E.slow) })
          : $t('Etwas langsamer als deine lockere Zone. Das ist in Ordnung, wenn es sich gut anfühlt.')
      );
    }
  } catch (e) {}
  return r;
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'rzTake') {
    const s = S.meta.rzSuggest;
    if (s) {
      S.settings.runTest = { type: 'race', m: s.m, sec: s.sec, vdot: s.vdot, date: s.date, auto: true };
      delete S.meta.rzSuggest;
      save();
      render();
      doneOverlay($t('Laufzonen aktualisiert'), 'VDOT ' + fmt(s.vdot, 1));
    }
  } else if (a === 'rzDrop') {
    delete S.meta.rzSuggest;
    save();
    render();
  }
});
/* Laufband: km/h ↔ Pace direkt unter dem Geschwindigkeitsfeld */
function tmHint(el) {
  if (!el) return;
  let h = el.parentNode.querySelector('.tm-hint');
  if (!h) {
    h = document.createElement('div');
    h.className = 'src tm-hint';
    el.parentNode.appendChild(h);
  }
  const v = num(el.value);
  h.textContent = v > 0 ? '= ' + fmtPace(3600 / v) + ' ' + $t('min/km') : $t('Tipp: 10 km/h = 6:00 min/km, 12 km/h = 5:00 min/km');
}
document.addEventListener('input', e => {
  if (e.target.id === 'am-speed') tmHint(e.target);
});
document.addEventListener('focusin', e => {
  if (e.target.id === 'am-speed') tmHint(e.target);
});
/* Razor: Cardio-Formate als echte Einheiten (Intervalle statt Dauerlauf-Platzhalter, Z2-Dauer steigt über die Phasen) */
hbFilter('makePlan', 'runzones', function (__v, tpl) {
  const p = __v;
  if (tpl !== 'razor' || !p || !p.sessions) return p;
  const n = (p.sessions.find(s => s.cardio && s.cardio.weeks) || {}).cardio;
  const W = n ? n.weeks.length : p.weeks || 12;
  const ramp = (i, a, b) => Math.round(a + (b - a) * (W > 1 ? i / (W - 1) : 0));
  p.sessions.forEach(s => {
    if (!s.cardio || !s.cardio.weeks) return;
    const sub0 = s.cardio.weeks[0] && s.cardio.weeks[0].sub;
    if (/^AC/.test(s.k))
      s.cardio.weeks = s.cardio.weeks.map((e, i) => ({
        mode: 'int',
        reps: ramp(i, 10, 12),
        dur: 0.25,
        rest: 0.75,
        warm: 10,
        cool: 5,
        hi: true,
        title: $tf('{n} × 15 s Sprint', { n: ramp(i, 10, 12) }),
        sub: (e && e.sub) || sub0
      }));
    else if (/^BC/.test(s.k))
      s.cardio.weeks = s.cardio.weeks.map((e, i) => ({
        mode: 'int',
        reps: ramp(i, 10, 12),
        dur: 1,
        rest: 1,
        warm: 10,
        cool: 5,
        hi: true,
        title: $tf('{n} × 1 min zügig', { n: ramp(i, 10, 12) }),
        sub: (e && e.sub) || sub0
      }));
    else if (/^KC/.test(s.k)) s.cardio.weeks = s.cardio.weeks.map((e, i) => ({ mode: 'z2', min: ramp(i, 20, 35), sub: (e && e.sub) || sub0 }));
  });
  return p;
});
/* Aerobe Entkopplung (Pa:HR): Verhältnis Tempo zu Puls in der ersten vs. zweiten Hälfte eines lockeren Laufs ab 30 min.
   Unter 5 % gilt als Zeichen guter aerober Grundlage (Friel). Braucht GPS-Route mit Zeitstempeln und Pulskurve. */
function decoupling(a) {
  if (!a || !a.route || !a.routeT || !(num(a.dur) >= 30)) return null;
  const at = ACT_MAP[a.type];
  if (!at || !at.run) return null;
  const tr = S.hrTraces[a.id] || (a.tkey && S.hrTraces[a.tkey]);
  if (!tr || !tr.pts || tr.pts.length < 20) return null;
  let pts;
  try {
    pts = decPoly(a.route);
  } catch (e) {
    return null;
  }
  const T = a.routeT;
  if (pts.length !== T.length || pts.length < 20) return null;
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + hav(pts[i - 1], pts[i]));
  const tEnd = T[T.length - 1],
    half = tEnd / 2,
    warm = Math.min(600, tEnd * 0.1);
  const distAt = t => {
    let i = T.findIndex(x => x >= t);
    if (i <= 0) return i === 0 ? 0 : cum[cum.length - 1];
    const f = (t - T[i - 1]) / Math.max(1, T[i] - T[i - 1]);
    return cum[i - 1] + (cum[i] - cum[i - 1]) * f;
  };
  const hrAvg = (t0, t1) => {
    const v = tr.pts.filter(p => p[0] >= t0 && p[0] < t1).map(p => p[1]);
    return v.length >= 5 ? v.reduce((s, x) => s + x, 0) / v.length : null;
  };
  const ef = (t0, t1) => {
    const h = hrAvg(t0, t1);
    const d = distAt(t1) - distAt(t0);
    return h && d > 200 ? d / (t1 - t0) / h : null;
  };
  const e1 = ef(warm, half),
    e2 = ef(half, tEnd);
  if (!e1 || !e2) return null;
  return { pct: Math.round(((e1 - e2) / e1) * 1000) / 10, ef1: e1 * 60, ef2: e2 * 60 };
}
const _viewFreeDC = viewFree;
viewFree = function (id) {
  const h = _viewFreeDC.apply(this, arguments);
  const a = S.activities.find(x => x.id === id);
  const dc = decoupling(a);
  if (dc == null) return h;
  const d = dc.pct;
  const card =
    '<div class="card"><div class="row" style="align-items:baseline"><h2 class="grow" style="margin:0">' +
    $t('Aerobe Entkopplung') +
    '</h2><span class="num" style="font-weight:800">' +
    fmt(d, 1) +
    ' %</span></div><p class="small muted" style="margin:6px 0 0">' +
    (d < 5
      ? $t('Unter 5 %: Tempo und Puls blieben stabil, ein gutes Zeichen für deine Grundlagenausdauer.')
      : $t('Ab 5 %: Der Puls stieg bei gleichem Tempo an. Häufig bei Hitze, zu schnellem Start oder wenn die Grundlage noch wächst.')) +
    '</p><p class="src" style="margin-top:6px">' +
    $t(
      'Vergleich Tempo zu Puls in der ersten und zweiten Hälfte, ohne die ersten 10 Minuten. Am aussagekräftigsten bei lockeren, flachen Läufen ab 45 Minuten.'
    ) +
    '</p></div>';
  const i = h.lastIndexOf('</div>');
  return i < 0 ? h + card : h.slice(0, i) + card + h.slice(i);
};
/* ---------- HYROX-Simulation im Tracker: 8 × (1 km Lauf → Roxzone → Station), Laufabschnitte enden automatisch nach 1 km (GPS), Stationen per „Weiter“ ---------- */
const HYROX_ST = () => [
  $t('SkiErg 1000 m'),
  $t('Sled Push 50 m'),
  $t('Sled Pull 50 m'),
  $t('Burpee Broad Jumps 80 m'),
  $t('Rudern 1000 m'),
  $t('Farmer’s Carry 200 m'),
  $t('Sandbag Lunges 100 m'),
  $t('Wall Balls 100')
];
hbFilter('ivPresets', 'runzones', function (__v) {
  return __v.concat([{ id: 'hyrox', name: $t('HYROX-Simulation: 8 × 1 km Lauf + Station') }]);
});
const _ivBuildHY = ivBuild;
ivBuild = function (sel) {
  if (sel !== 'hyrox') return _ivBuildHY.apply(this, arguments);
  const wm = Math.max(0, num(ivOpts().warm) || 0);
  const q = [wm ? { sec: Math.round(wm * 60), label: $t('Aufwärmen, locker'), k: 'warm' } : { sec: 10, label: $t('Gleich geht’s los'), k: 'cd' }];
  const st = HYROX_ST();
  for (let i = 1; i <= 8; i++) {
    q.push({ sec: 7200, open: true, km: 1, k: 'run', n: i, label: $tf('Lauf {n} von 8: 1 km', { n: i }) });
    q.push({ sec: 7200, open: true, k: 'rox', n: i, label: $t('Roxzone: zur Station') });
    q.push({ sec: 7200, open: true, k: 'st', n: i, label: $tf('Station {n}: {s}', { n: i, s: st[i - 1] }) });
  }
  return q;
};
hbFilter('trTick', 'runzones', function (__v) {
  const r = __v;
  try {
    const cur = TR.active && TR.q && TR.q[TR.qi];
    if (cur && cur.open) {
      if (cur.km && TR.gps && TR.dist - TR.qDist0 >= cur.km * 1000) trNext();
      const el = document.getElementById('tr-qleft');
      if (el) el.textContent = fmtClock(movingSec() - (TR.qAt || 0)) + (cur.km && TR.gps ? ' · ' + fmt((TR.dist - TR.qDist0) / 1000, 2) + ' km' : '');
    }
  } catch (e) {}
  return r;
});
function hyroxCard(a) {
  const v = (a.ivs || []).filter(x => ['run', 'rox', 'st'].includes(x.k));
  if (!v.length) return '';
  const sum = k => v.filter(x => x.k === k).reduce((s, x) => s + x.sec, 0);
  const st = HYROX_ST();
  return (
    '<div class="card"><h2>' +
    $t('HYROX-Zwischenzeiten') +
    '</h2><div class="stats" style="margin:8px 0">' +
    [
      ['run', $t('Laufen')],
      ['rox', $t('Roxzone')],
      ['st', $t('Stationen')]
    ]
      .map(([k, l]) => '<div class="stat"><div class="k">' + l + '</div><div class="v num" style="font-size:20px">' + fmtClock(sum(k)) + '</div></div>')
      .join('') +
    '</div>' +
    '<div class="tbl"><table><thead><tr><th>#</th><th>' +
    $t('Lauf') +
    '</th><th>' +
    $t('Roxzone') +
    '</th><th>' +
    $t('Station') +
    '</th></tr></thead><tbody>' +
    [1, 2, 3, 4, 5, 6, 7, 8]
      .map(n => {
        const g = k => v.find(x => x.k === k && x.n === n);
        const R = g('run'),
          X = g('rox'),
          T = g('st');
        if (!R && !X && !T) return '';
        return (
          '<tr><td>' +
          n +
          '</td><td class="num">' +
          (R ? fmtClock(R.sec) : '–') +
          '</td><td class="num">' +
          (X ? fmtClock(X.sec) : '–') +
          '</td><td class="num">' +
          (T ? fmtClock(T.sec) + '<br><span class="small muted">' + esc(st[n - 1]) + '</span>' : '–') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div></div>'
  );
}
const _viewFreeHY = viewFree;
viewFree = function (id) {
  const h = _viewFreeHY.apply(this, arguments);
  const a = S.activities.find(x => x.id === id);
  const c = a ? hyroxCard(a) : '';
  if (!c) return h;
  const i = h.lastIndexOf('</div>');
  return h.slice(0, i) + c + h.slice(i);
};
