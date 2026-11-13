'use strict';
/* ======================= SPOWI-ANSICHT: Evidenz, Quellen und zusätzliche Kennzahlen =======================
   Standard aus: Die App zeigt Empfehlungen in Alltagssprache. Eingeschaltet erscheinen Evidenzgrade, Quellen,
   Erklärungen der Berechnungen und zusätzliche Kennzahlen (ACWR, Monotonie, Strain, TRIMP, aerobe Entkopplung,
   Intensitätsverteilung, ln rMSSD, relative Kraft). Elemente mit der Klasse sw-only sind nur dann sichtbar. */
const spowiOn = () => !!(S && S.settings && S.settings.spowi);
const _renderSw = render;
render = function (top) {
  document.body.classList.toggle('spowi', spowiOn());
  _renderSw(top);
};
document.body.classList.toggle('spowi', !!(typeof S !== 'undefined' && S && S.settings && S.settings.spowi));

/* ---------- Einstellung ---------- */
hbFilter('accountCard', 'spowi', function (__v) {
  return __v + spowiCard();
});

/* ---------- Hilfsrechnungen ---------- */
const swMean = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const swSd = a => {
  const m = swMean(a);
  return a.length > 1 ? Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)) : null;
};
const swRow = (k, v, note) =>
  '<tr><td>' +
  k +
  (note ? '<div class="small muted" style="font-weight:500;margin-top:2px">' + note + '</div>' : '') +
  '</td><td class="num"><b>' +
  v +
  '</b></td></tr>';
const swRef = (t, q) => '<a href="https://pubmed.ncbi.nlm.nih.gov/?term=' + encodeURIComponent(q) + '" target="_blank" rel="noopener">' + esc(t) + '</a>';
/* Belastung: akut 7 Tage gegen chronisch 28 Tage (Wochenmittel), Monotonie und Strain nach Foster */
function loadMetrics(end) {
  end = end || today();
  const day = i => dailyLoad(addDays(end, -i)).load || 0;
  const d7 = Array.from({ length: 7 }, (_, i) => day(i)),
    d28 = Array.from({ length: 28 }, (_, i) => day(i));
  const a = d7.reduce((x, y) => x + y, 0),
    c = d28.reduce((x, y) => x + y, 0) / 4;
  const sd = swSd(d7),
    m = swMean(d7);
  const mono = sd ? m / sd : null;
  return { acute: a, chronic: c, acwr: c ? a / c : null, mono, strain: mono != null ? a * mono : null };
}
/* Intensitätsverteilung der letzten 28 Tage aus den Pulskurven, 3-Zonen-Modell, Polarisationsindex nach Treff et al. 2019 */
function intensityDist(days) {
  days = days || 28;
  const from = addDays(today(), -days);
  let z = [0, 0, 0, 0, 0];
  Object.keys(S.hrTraces || {}).forEach(k => {
    const tr = S.hrTraces[k];
    if (!tr || !tr.start || iso(new Date(tr.start)) < from) return;
    const zt = zoneTimes(tr);
    z = z.map((v, i) => v + (zt[i] || 0));
  });
  const tot = z.reduce((x, y) => x + y, 0);
  if (tot < 600) return null;
  const low = (z[0] + z[1]) / tot,
    mid = z[2] / tot,
    high = (z[3] + z[4]) / tot;
  const pi = low > 0 && mid > 0 && high > 0 ? Math.log10((low / mid) * high * 100) : null;
  const type =
    pi != null && pi > 2 ? $t('polarisiert') : low > mid && mid > high ? $t('pyramidal') : mid >= low ? $t('schwellenbetont') : $t('überwiegend locker');
  return { low, mid, high, pi, type, min: tot / 60 };
}
/* HRV: ln rMSSD 7-Tage-Mittel und Variationskoeffizient (Plews et al.) */
function hrvMetrics() {
  const v = [];
  for (let i = 0; i < 7; i++) {
    const h = S.health[addDays(today(), -i)];
    if (h && h.hrv > 0) v.push(Math.log(h.hrv));
  }
  if (v.length < 3) return null;
  const m = swMean(v),
    sd = swSd(v);
  return { ln: m, cv: (sd / m) * 100, n: v.length };
}
/* TRIMP nach Banister (mit Ruhepuls-Basis) und Edwards (Minuten × Zone) */
function trimpOf(tr) {
  if (!tr || !tr.pts || tr.pts.length < 5) return null;
  const hf = num(S.settings.hfmax) || 186;
  const base = rhrBaseline();
  const rest = base ? base.v : 60;
  const k = S.settings.sex === 'w' ? [0.86, 1.67] : [0.64, 1.92];
  let ban = 0,
    edw = 0;
  for (let i = 1; i < tr.pts.length; i++) {
    const dt = (tr.pts[i][0] - tr.pts[i - 1][0]) / 60;
    if (dt <= 0 || dt > 5) continue;
    const hr = tr.pts[i][1];
    const hrr = clamp((hr - rest) / (hf - rest), 0, 1);
    ban += dt * hrr * k[0] * Math.exp(k[1] * hrr);
    const r = hr / hf;
    edw += dt * (r >= 0.9 ? 5 : r >= 0.8 ? 4 : r >= 0.7 ? 3 : r >= 0.6 ? 2 : r >= 0.5 ? 1 : 0);
  }
  return { ban: Math.round(ban), edw: Math.round(edw) };
}
/* aerobe Entkopplung: Geschwindigkeit pro Herzschlag in 1. gegen 2. Hälfte (Friel); unter 5 % gilt als stabil */

/* ---------- Kennzahlen im Verlauf ---------- */
hbFilter('viewProgress', 'spowi', function (__v) {
  const h = __v;
  if (!spowiOn()) return h;
  const i = hbAt(h, '<div class="stack">', 'spowi');
  return i < 0 ? h + spowiProgressCard() : h.slice(0, i + 19) + spowiProgressCard() + h.slice(i + 19);
});

/* ---------- Messwerte im Wochen-Check-in ---------- */
function reviewMetrics(r) {
  const m = r.m;
  if (!m) return '';
  const vol = m.vol || {};
  const lifts = (m.perf || [])
    .map(
      p =>
        '<tr><td>' +
        esc(LIB[p.id] ? LIB[p.id].name : p.id) +
        '</td><td class="num">' +
        p.cur +
        '</td><td class="num">' +
        p.ref +
        '</td><td class="num">' +
        (p.ch >= 0 ? '+' : '') +
        fmt(p.ch, 1) +
        ' %</td></tr>'
    )
    .join('');
  const vrows = Object.keys(MUSCLES)
    .filter(k => vol[k] > 0)
    .map(k => {
      const v = vol[k];
      const c = v < 10 ? 't-amber' : v > 20 ? 't-red' : 't-green';
      return '<tr><td>' + MUSCLES[k] + '</td><td class="num ' + c + '"><b>' + fmt(v, 1) + '</b></td></tr>';
    })
    .join('');
  return (
    '<details class="sw-only" style="margin-top:12px"><summary class="small" style="font-weight:700">' +
    $t('Messwerte') +
    '</summary>' +
    (lifts
      ? '<table class="tbl small" style="width:100%;margin-top:8px"><tr><th>' +
        $t('Übung') +
        '</th><th>' +
        $t('e1RM') +
        '</th><th>' +
        $t('Referenz') +
        '</th><th>Δ</th></tr>' +
        lifts +
        '</table><p class="src">' +
        $t('Referenz = bestes e1RM der letzten zwei vergleichbaren Wochen (ohne Deload und Test). Stillstand: unter +0,5 % zweimal in Folge.') +
        '</p>'
      : '') +
    '<table class="tbl small" style="width:100%;margin-top:8px">' +
    swRow($t('RPE-Abweichung Ø'), m.ovr != null ? (m.ovr >= 0 ? '+' : '') + fmt(m.ovr, 1) : '–', m.nOver + $t(' Sätze mit RPE')) +
    swRow($t('Bereitschaft Ø'), m.rdm != null ? m.rdm + ' %' : '–', '') +
    swRow($t('Tage Ruhepuls ≥ Basis + 5'), m.rhrHi, '') +
    swRow($t('Wochenlast'), m.L != null ? fmt(m.L, 0) : '–', m.Lref != null ? $t('Vorwochen Ø ') + fmt(m.Lref, 0) : '') +
    swRow($t('Verhältnis zu den Vorwochen'), m.acwr != null ? fmt(m.acwr, 2) : '–', $t('Vorschlag ab 1,3')) +
    swRow($t('Monotonie'), m.mono != null ? fmt(m.mono, 1) : '–', m.strain != null ? $t('Strain ') + fmt(m.strain, 0) : '') +
    swRow($t('Umsetzung'), m.adh + ' %', '') +
    '</table>' +
    (vrows
      ? '<div class="lbl" style="margin-top:10px">' +
        $t('Harte Sätze pro Muskel') +
        '</div><table class="tbl small" style="width:100%">' +
        vrows +
        '</table><p class="src">' +
        $t('Hilfsmuskeln zählen anteilig. Bereich 10–20 Sätze nach Schoenfeld et al. 2017.') +
        '</p>'
      : '') +
    '</details>'
  );
}
hbFilter('reviewCard', 'spowi', function (__v, key, opts) {
  let h = __v;
  if (!spowiOn()) return h;
  const r = ((opts && opts.R) || reviews())[key];
  if (!r) return h;
  const i = hbAtLast(h, '</div>', 'spowi');
  return h.slice(0, i) + reviewMetrics(r) + h.slice(i);
});

/* ---------- Aktivität: TRIMP, aerobe Entkopplung ---------- */
const _viewFreeSw = viewFree;
viewFree = function (id) {
  const h = _viewFreeSw(id);
  if (!spowiOn()) return h;
  const a = findAct(id);
  if (!a) return h;
  const tr = S.hrTraces[a.id];
  const tp = trimpOf(tr);
  const dc = decoupling(a);
  if (!tp && !dc) return h;
  const card =
    '<div class="card sw-card"><div class="row"><h2 class="grow">' +
    $t('Kennzahlen') +
    '</h2><span class="tag">SpoWi</span></div><table class="tbl small" style="width:100%;margin-top:8px">' +
    (tp
      ? swRow($t('TRIMP nach Banister'), tp.ban, $t('mit Ruhepuls-Basis und HFmax')) +
        swRow($t('TRIMP nach Edwards'), tp.edw, $t('Minuten × Zone (50–100 % HFmax)'))
      : '') +
    (dc ? swRow($t('Effizienz (m pro Herzschlag)'), fmt(dc.ef1, 2) + ' → ' + fmt(dc.ef2, 2), $t('1. gegen 2. Hälfte')) : '') +
    '</table>' +
    '<p class="src" style="margin-top:8px">' +
    swRef('Banister 1991 (TRIMP)', 'Banister TRIMP training impulse') +
    ' · ' +
    swRef('Edwards 1993', 'Edwards heart rate training load zones') +
    ' · ' +
    $t('Entkopplung nach Friel (Pa:HR)') +
    '</p></div>';
  const i = hbAt(h, '<div class="stack">', 'spowi');
  return i < 0 ? h + card : h.slice(0, i + 19) + card + h.slice(i + 19);
};

/* ---------- Abschluss-Fenster: harte Sätze und Ø RPE ---------- */
function spowiFinTiles(w, k) {
  if (!spowiOn() || isCardio(k)) return '';
  const s = peekSess(w, k) || {};
  let hard = 0,
    rp = [];
  Object.values(s.logs || {}).forEach(lg =>
    loggedSets(lg)
      .filter(x => x.done)
      .forEach(x => {
        if (x.rpe != null) {
          rp.push(x.rpe);
          if (x.rpe >= 7) hard++;
        }
      })
  );
  const t = (v, l) => '<div class="fin-tile"><b>' + v + '</b><span>' + l + '</span></div>';
  return rp.length ? t(hard, $t('harte Sätze (RPE ≥ 7)')) + t(fmt(swMean(rp), 1), $t('Ø RPE der Sätze')) : '';
}
if (typeof finSheet === 'function') {
  const _finSheetSw = finSheet;
  finSheet = function (w, k, fresh) {
    _finSheetSw(w, k, fresh);
    const extra = spowiFinTiles(w, k);
    if (!extra) return;
    const g = document.querySelector('#sheetCard .fin-tiles');
    if (g) g.insertAdjacentHTML('beforeend', extra);
  };
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  if (b.dataset.act === 'spowiToggle') {
    S.settings.spowi = !S.settings.spowi;
    save();
    render();
    toast(S.settings.spowi ? $t('SpoWi-Ansicht an') : $t('SpoWi-Ansicht aus'));
  }
});
