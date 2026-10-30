/* ======================= TAGE: Einheiten pro Tag, Trainingskalender, Belastungsdiagramm (antippbar) ======================= */
/* dayUnits(d): alle Einheiten eines Tages (Plan-Einheiten und freie Aktivitäten) mit Belastung, RPE und Ziel-Link. */
function unitHref(u) { return typeof resultHref === 'function' ? resultHref(u) : u.href; }
function dayUnits(d) { const out = [];
  for (let w = 1; w <= NW(); w++) ORDER.forEach(k => { const s = peekSess(w, k); if (!s || s.date !== d || s.skipped) return; const L = sessLoad(w, k);
    const done = isCardio(k) ? !!(s.cardio && num(s.cardio.dur)) : (!!s.end || Object.values(s.logs || {}).some(l => (l.sets || []).some(x => x.done)));
    if (!done && !L) return; out.push({ type: 'plan', w, k, title: SESS[k].title, sub: SESS[k].sub || '', kind: isCardio(k) ? 'cardio' : 'kraft', load: L ? L.load : null, rpe: L ? L.rpe : null, dur: L ? L.dur : null, href: '#training/' + sKey(w, k) }); });
  S.activities.filter(a => a.date === d).forEach(a => { const L = actLoad(a); const t = ACT_MAP[a.type] || {}; out.push({ type: 'act', id: a.id, title: a.title || t.name || $t('Aktivität'), sub: t.name || '', kind: t.cardio ? 'cardio' : 'kraft', load: L ? L.load : null, rpe: L ? L.rpe : null, dur: L ? L.dur : num(a.dur), href: '#frei/' + a.id }); });
  return out; }
/* Farbskala nach Intensität (Session-RPE) */
const RPE_COL = r => r == null ? 'var(--rule-strong)' : r <= 4 ? 'var(--verdant)' : r <= 6 ? 'var(--sky)' : r <= 8 ? 'var(--amber)' : 'var(--ember)';
const RPE_LEG = () => '<div class="clegend"><span><i style="background:var(--verdant)"></i>' + $t('locker') + '</span><span><i style="background:var(--sky)"></i>' + $t('mittel') + '</span><span><i style="background:var(--amber)"></i>' + $t('hart') + '</span><span><i style="background:var(--ember)"></i>' + $t('sehr hart') + '</span><span><i style="background:var(--rule-strong)"></i>' + $t('ohne RPE') + '</span></div>';
function openDay(d) { const us = dayUnits(d); if (!us.length) { toast($t('An diesem Tag gab es kein Training.')); return; } if (us.length === 1) { location.hash = unitHref(us[0]); return; }
  openSheet(sheetHead(esc(fmtDay(d))) + '<div class="on-white" style="margin-top:8px">' + us.map(u => '<a class="evcat" href="' + unitHref(u) + '" data-act="closeSheetNav" style="text-decoration:none;background:var(--fog)"><span class="evg" style="background:' + RPE_COL(u.rpe) + '">' + (u.kind === 'kraft' ? 'K' : 'C') + '</span><span class="grow"><b>' + esc(u.title) + '</b><br><span class="small muted">' + [u.dur ? fmt(u.dur, 0) + ' min' : '', u.rpe != null ? 'RPE ' + fmt(u.rpe) : '', u.load ? $t('Belastung ') + fmt(u.load, 0) : ''].filter(Boolean).join(' · ') + '</span></span><span class="muted">›</span></a>').join('') + '</div>'); }

/* Trainingskalender: Zeilen = Wochen (älteste oben), Spalten = Mo bis So */
heatmapCard = function () { const end = today(); const mon = d => addDays(d, -((parseISO(d).getDay() + 6) % 7));
  const firsts = [S.block.startedOn, ...S.activities.map(a => a.date), ...Object.values(S.sessions).map(s => s.date)].filter(Boolean).sort();
  let start = mon(firsts.length ? firsts[0] : end); const minStart = addDays(mon(end), -11 * 7), maxStart = addDays(mon(end), -3 * 7); if (start < minStart) start = minStart; if (start > maxStart) start = maxStart;
  const weeks = Math.round(daysBetween(start, mon(end)) / 7) + 1; let max = 1; const rows = [];
  for (let w = 0; w < weeks; w++) { const row = []; for (let i = 0; i < 7; i++) { const d = addDays(start, w * 7 + i); if (d > end) { row.push({ d, future: true }); continue; } const us = dayUnits(d); const v = us.reduce((a, u) => a + (u.load || 0), 0) || (us.length ? 1 : 0); max = Math.max(max, v); row.push({ d, v, n: us.length }); } rows.push(row); }
  const cs = 34, gap = 5, lw = 44, hh = 18; const W = lw + 7 * (cs + gap), H = hh + weeks * (cs + gap);
  let g = WD_SHORT_MO().map((t, i) => '<text class="ax" x="' + (lw + i * (cs + gap) + cs / 2) + '" y="12" text-anchor="middle">' + t + '</text>').join('');
  rows.forEach((row, w) => { const y = hh + w * (cs + gap); const md = parseISO(row[0].d); g += '<text class="ax" x="0" y="' + (y + cs / 2 + 4) + '">' + md.getDate() + '.' + (md.getMonth() + 1) + '.</text>';
    row.forEach((c, i) => { const x = lw + i * (cs + gap); const isT = c.d === end; const fill = c.future ? 'transparent' : c.n ? mix('#e9e9e9', '#ff5406', .3 + .7 * Math.min(1, c.v / max)) : '#ececec';
      g += '<g' + (c.n ? ' data-act="dayOpen" data-d="' + c.d + '" style="cursor:pointer"' : '') + '><rect x="' + x + '" y="' + y + '" width="' + cs + '" height="' + cs + '" rx="8" fill="' + fill + '"' + (isT ? ' stroke="var(--charcoal)" stroke-width="2"' : c.future ? ' stroke="var(--rule)" stroke-dasharray="3 3"' : '') + '><title>' + fmtDay(c.d) + (c.n ? ': ' + c.n + $t(' Einheit(en)') : '') + '</title></rect>' +
        (c.future ? '' : '<text x="' + (x + cs / 2) + '" y="' + (y + cs / 2 + 4) + '" text-anchor="middle" font-size="11" font-weight="700" fill="' + (c.n && c.v / max > .45 ? '#fff' : 'var(--muted)') + '" pointer-events="none">' + parseISO(c.d).getDate() + '</text>') + '</g>'; }); });
  const n = rows.flat().filter(c => c.n).length;
  return '<div class="card"><div class="row"><h2 class="grow">' + $t('Trainingstage') + '</h2><span class="tag">' + n + $t(' Tage in ') + weeks + $t(' Wochen') + '</span></div><svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:440px;display:block;margin-top:10px" role="img" aria-label="' + $t('Kalender der Trainingstage') + '">' + g + '</svg>' +
    '<p class="small muted" style="margin-top:8px">' + $t('Dunkler = höhere Belastung. Tippe einen Tag an, um die Einheit zu öffnen.') + '</p></div>'; };
const WD_SHORT_MO = () => [$t('Mo'), $t('Di'), $t('Mi'), $t('Do'), $t('Fr'), $t('Sa'), $t('So')];

/* Belastung 28 Tage: gestapelte Balken je Einheit, Farbe nach Intensität, antippbar */
function loadBars(id) { const days = []; for (let i = 27; i >= 0; i--) { const d = addDays(today(), -i); days.push({ d, us: dayUnits(d) }); }
  const tot = x => x.us.reduce((a, u) => a + (u.load || (u.dur ? u.dur * 5 : 0)), 0); const hiRaw = Math.max(100, ...days.map(tot));
  const W = 640, H = 200, L = 46, R = 14, T = 14, B = 26; const raw = hiRaw * 1.06 / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), nr = raw / mag; const step = (nr <= 1 ? 1 : nr <= 2 ? 2 : nr <= 2.5 ? 2.5 : nr <= 5 ? 5 : 10) * mag; const hi = Math.ceil(hiRaw * 1.06 / step) * step;
  const n = days.length, bwid = (W - L - R) / n; const Y = v => T + (1 - v / hi) * (H - T - B);
  let g = ''; for (let v = 0; v <= hi + 1e-9; v += step) g += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="ax" x="' + (L - 8) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + fmt(v, 0) + '</text>';
  const lab = d => parseISO(d).getDate() + '.' + (parseISO(d).getMonth() + 1) + '.';
  g += '<text class="ax" x="' + L + '" y="' + (H - 6) + '">' + lab(days[0].d) + '</text><text class="ax" x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">' + lab(days[n - 1].d) + '</text>';
  days.forEach((x, i) => { const cx = L + i * bwid, bw = Math.min(16, bwid * 0.72), x0 = cx + (bwid - bw) / 2; let acc = 0;
    x.us.forEach(u => { const v = u.load || (u.dur ? u.dur * 5 : 0); if (!v) return; const y1 = Y(acc + v), y0 = Y(acc); g += '<rect x="' + x0 + '" y="' + y1 + '" width="' + bw + '" height="' + Math.max(1.5, y0 - y1 - 1) + '" rx="3" fill="' + RPE_COL(u.rpe) + '"/>'; acc += v; });
    if (x.us.length) g += '<rect data-act="dayOpen" data-d="' + x.d + '" x="' + cx + '" y="' + T + '" width="' + bwid + '" height="' + (H - T - B) + '" fill="transparent" style="cursor:pointer"><title>' + fmtDay(x.d) + ': ' + x.us.map(u => u.title + (u.load ? ' (' + fmt(u.load, 0) + ')' : '')).join(', ') + '</title></rect>'; });
  return '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + $t('Belastung der letzten 28 Tage') + '">' + g + '</svg></div>' + RPE_LEG(); }
const _loadCardDays = loadCard; loadCard = function () { const h = _loadCardDays(); const i = h.indexOf('<div class="chart"'); if (i < 0) return h; const j = h.indexOf('<div class="stats"', i); if (j < 0) return h;
  return h.slice(0, i) + loadBars('cld') + '<p class="small muted" style="margin-top:6px">' + $t('Tippe einen Balken an, um die Einheit zu öffnen.') + '</p>' + h.slice(j); };

document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'dayOpen') openDay(b.dataset.d);
  else if (b.dataset.act === 'closeSheetNav') closeSheet(); });
if (route.name === 'verlauf') render();
