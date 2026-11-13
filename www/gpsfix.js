/* Hybridblock – GPS-Auswertung nach Zeitstempel mit Glättung (Kalman-Filter)
   1. Jeder empfangene Punkt (bis 100 m Ungenauigkeit) landet mit Messzeit und Genauigkeit in TR.raw.
      Ungenaue Punkte werden nicht verworfen, sondern im Filter schwächer gewichtet.
   2. Strecke je Intervall/Pause = geglättete Gesamtstrecke an der Endzeit minus an der Startzeit (linear interpoliert).
   3. Lücken (> 10 s ohne Punkt) werden gezählt und je Abschnitt markiert, statt still falsche Werte zu zeigen. */
'use strict';
const GPS_GAP = 10; /* s ohne Punkt = Lücke */
/* Kalman-Filter für Lat/Lng; q = erwartete Geschwindigkeitsänderung in m/s */
function gpsSmooth(pts, q) { const f = gpsKalman(pts, q), b = gpsKalman(pts.slice().reverse(), q).reverse(); return f.map((p, i) => [(p[0] + b[i][0]) / 2, (p[1] + b[i][1]) / 2, p[2]]); }
function gpsKalman(pts, q) { q = q || 3; const out = []; let lat, lng, t0, v = -1;
  pts.forEach(p => { const acc = Math.max(3, p[3] || 8), t = p[2];
    if (v < 0) { lat = p[0]; lng = p[1]; t0 = t; v = acc * acc; }
    else { const dt = Math.abs(t - t0) / 1000; if (dt > 0) { v += dt * q * q; t0 = t; } const k = v / (v + acc * acc); lat += k * (p[0] - lat); lng += k * (p[1] - lng); v = (1 - k) * v; }
    out.push([lat, lng, t]); });
  return out; }
/* Kumulierte Strecke (m) über die Zeit; kleine Schritte im Stand werden nicht gezählt */
function gpsCum(pts, g) { const P = pts.slice().sort((a, b) => a[2] - b[2]).filter((p, i, A) => i === 0 || p[2] > A[i - 1][2]); if (P.length < 2) return null;
  const S2 = gpsSmooth(P, g === 'rad' ? 6 : 3); const T = [S2[0][2]], D = [0]; let d = 0, ref = S2[0];
  for (let i = 1; i < S2.length; i++) { const s = hav(ref, S2[i]); if (s >= 1.5 || (S2[i][2] - ref[2]) > 15000) { if (s / Math.max(0.5, (S2[i][2] - ref[2]) / 1000) <= (MAXV[g] || 30)) d += s; ref = S2[i]; } T.push(S2[i][2]); D.push(d); }
  return { T, D, total: d }; }
function cumAt(c, t) { const T = c.T, D = c.D; if (t <= T[0]) return 0; if (t >= T[T.length - 1]) return D[D.length - 1]; let lo = 0, hi = T.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= t) lo = m; else hi = m; }
  return D[lo] + (D[hi] - D[lo]) * (t - T[lo]) / Math.max(1, T[hi] - T[lo]); }
/* Sekunden ohne Punkt innerhalb [t0, t1] */
function gapSecIn(times, t0, t1) { let g = 0; const ts = times.filter(t => t >= t0 && t <= t1); const all = [t0].concat(ts, [t1]); for (let i = 1; i < all.length; i++) { const dt = (all[i] - all[i - 1]) / 1000; if (dt > GPS_GAP) g += dt; } return Math.round(g); }
/* Intervalle neu berechnen: ivs mit t0/t1 (Epoch ms) */
function ivsRecalc(ivs, pts, g) { const c = gpsCum(pts, g); if (!c) return ivs; const times = pts.map(p => p[2]).sort((a, b) => a - b);
  return ivs.map(x => { if (x.t0 == null || x.t1 == null) return x; const d = Math.round(cumAt(c, x.t1) - cumAt(c, x.t0)); const gap = gapSecIn(times, x.t0, x.t1); return Object.assign({}, x, { dist: d, gap: gap >= 5 ? gap : 0, fix: 2 }); }); }
function gpsQuality(pts, t0, t1) { const ts = pts.map(p => p[2]).sort((a, b) => a - b); const all = [t0].concat(ts, [t1]); let n = 0, sec = 0, max = 0;
  for (let i = 1; i < all.length; i++) { const dt = (all[i] - all[i - 1]) / 1000; if (dt > GPS_GAP) { n++; sec += dt; max = Math.max(max, dt); } }
  const poor = pts.filter(p => (p[3] || 0) > 35).length; return { n, sec: Math.round(sec), max: Math.round(max), pts: pts.length, poor, dur: Math.round((t1 - t0) / 1000) }; }

/* --- Aufzeichnung: alle Punkte mit Messzeit und Genauigkeit merken --- */
const _onLocFix = onLoc;
onLoc = function (lat, lng, acc, alt, t) { if (TR.active && lat != null && !TR.paused && (acc == null || acc <= 100)) { TR.raw = TR.raw || []; TR.raw.push([lat, lng, t || Date.now(), acc != null ? Math.round(acc) : null]); TR.rawN = (TR.rawN || 0) + 1; }
  return _onLocFix.apply(this, arguments); };
/* Abschnittsgrenzen mit Uhrzeit speichern, Strecke für die Ansage aus der geglätteten Spur */
hbFilter('qClose', 'gpsfix', function (__v, sec) { const t0 = TR.qT0, r = __v; if (r) { r.t0 = t0; r.t1 = Date.now(); if (TR.gps && (TR.raw || []).length > 1) { const c = gpsCum(TR.raw, (ACT_MAP[TR.type] || {}).g); if (c) r.dist = Math.round(cumAt(c, r.t1) - cumAt(c, r.t0)); } } return r; });
/* Beim Speichern: Intervalle und Gesamtstrecke aus der geglätteten Spur, GPS-Qualität merken */
const _trSaveFix = trSave;
trSave = async function () { const raw = (TR.raw || []).slice(), key = 'gps:' + TR.startAt, g = (ACT_MAP[TR.type] || {}).g, gps = TR.gps, st = TR.startAt; const r = await _trSaveFix.apply(this, arguments);
  try { const a = (S.activities || []).find(x => x.key === key); if (a && gps && raw.length > 1) { const c = gpsCum(raw, g);
      if (a.ivs) a.ivs = ivsRecalc(a.ivs, raw, g);
      if (c && c.total > 20) a.dist = Math.round(c.total / 10) / 100;
      a.gpsQ = gpsQuality(raw, st, a.end || Date.now()); save(); } } catch (e) { console.warn(e); }
  return r; };

/* --- Gespeicherte Läufe: aus der Route neu berechnen (Grenzen aus der Reihenfolge der Abschnitte) --- */
function actPts(a) { const ll = decPoly(a.route || ''), ts = a.routeT || []; if (ll.length < 2 || ts.length !== ll.length) return null; return ll.map((p, i) => [p[0], p[1], a.start + ts[i] * 1000, 10]); }
function actRecalc(a) { const pts = actPts(a); if (!pts) return false; let t = a.start; const ivs = (a.ivs || []).map(x => { const o = Object.assign({}, x); if (o.t0 == null) { o.t0 = t; o.t1 = t + o.sec * 1000; o.approx = true; } t = o.t1; return o; });
  a.ivs = ivsRecalc(ivs, pts, (ACT_MAP[a.type] || {}).g); a.gpsQ = gpsQuality(pts, a.start, a.end || (a.start + (a.moving || 0) * 1000)); save(); return true; }

/* --- Anzeige: Lücken markieren, Qualität und Hinweis --- */
hbFilter('ivsCard', 'gpsfix', function (__v, a) { let h = __v; if (!h) return h; const v = (a.ivs || []).filter(x => x.sec >= 3);
  let i = 0; h = h.replace(/<tr( style="font-weight:700"| class="muted")><td>([^<]*)<\/td>/g, (m, at, lab) => { const x = v[i++]; return x && x.gap ? '<tr' + at + '><td>' + lab + ' <span class="t-amber" title="' + esc($t('GPS-Lücke')) + '">⚠</span></td>' : m; });
  const q = a.gpsQ; let foot = '';
  if (v.some(x => x.gap)) foot += '<p class="small t-amber" style="margin-top:6px">' + $t('⚠ In diesem Abschnitt fehlte das GPS-Signal zeitweise. Strecke und Pace sind dort zu niedrig.') + '</p>';
  if (q && q.n) foot += note('amber', '<b>' + $tf('GPS: {n} Lücken, zusammen {m} ohne Signal', { n: q.n, m: fmtClock(q.sec) }) + '</b>' + (q.max ? ' · ' + $tf('längste {s}', { s: fmtClock(q.max) }) : ''), '') +
    '<p class="small muted" style="margin-top:6px">' + $t('Meist schränkt Android die App bei ausgeschaltetem Bildschirm ein. Stell unter Einstellungen → Apps → Hybridblock → Akku auf „Nicht eingeschränkt“ und erlaube den Standort „Immer“ bzw. „Während der Nutzung“ mit genauer Position.') + '</p>';
  else if (q) foot += '<p class="small muted" style="margin-top:6px">' + $t('Aus der geglätteten GPS-Spur nach Zeitstempel berechnet.') + '</p>';
  if (a.route && (a.ivs || []).some(x => x.fix !== 2)) foot += '<button class="btn sm" style="margin-top:8px" data-act="ivRecalc" data-id="' + a.id + '" type="button">' + $t('Intervalle neu berechnen') + '</button>';
  return h.replace(/<\/div>$/, foot + '</div>'); });
document.addEventListener('click', e => { const b = e.target.closest('[data-act="ivRecalc"]'); if (!b) return; const a = findAct(b.dataset.id); if (a && actRecalc(a)) { toast($t('Intervalle neu berechnet')); render(); } else toast($t('Für diesen Lauf fehlen die GPS-Zeitstempel.')); });
