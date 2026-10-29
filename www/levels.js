/* ======================= ANSICHTSSTUFEN: Basis · Plus · Labor (Kolben-Knopf oben) ======================= */
/* 1 Basis: nur Eckdaten. 2 Plus: die wichtigsten Kennzahlen mit Einordnung. 3 Labor: alles (früher „SpoWi-Ansicht“).
   Umschalten über den Kolben neben dem Zahnrad. Der Füllstand des Kolbens zeigt die Stufe. */
const LV_NAMES = () => [null, { n: $t('Basis'), d: $t('Nur das Wichtigste: Training, Essen, Gewicht. Keine Fachzahlen.') }, { n: $t('Plus'), d: $t('Die wichtigsten Kennzahlen mit kurzer Einordnung: Belastung, Bereitschaft, Schlaf, Zonen.') }, { n: $t('Labor'), d: $t('Alles für Sportwissenschaftler: ACWR, Monotonie, Strain, HRV, TRIMP, Methoden, Evidenzgrade und Quellen.') }];
function viewLv() { const v = +S.settings.view; if (v >= 1 && v <= 3) return v; return S.settings.spowi ? 3 : (S.settings.q && S.settings.q.level === 'beginner' ? 1 : 2); }
function setLv(v) { S.settings.view = v; S.settings.spowi = v === 3; save(); }
const flaskSvg = (lv, size) => { const s = size || 22; const fill = [0, .22, .55, 1][lv] || .55; const top = 21.5 - 16 * fill;
  return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-hidden="true"><defs><clipPath id="fk' + lv + '"><path d="M9.5 3h5M10 3v6.2L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.6L14 9.2V3"/></clipPath></defs>' +
    '<rect x="0" y="' + top + '" width="24" height="24" fill="var(--ember)" clip-path="url(#fk' + lv + ')"/><path d="M9 3h6M10 3v6.2L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.6L14 9.2V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'; };
const SEARCH_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
(function () { const st = document.createElement('style'); st.textContent =
  'body.lv1 .lv2,body.lv1 .lv3,body.lv2 .lv3{display:none!important}.top .iconbtn+.iconbtn{margin-left:8px}.top .tbtns{display:flex;gap:8px;align-items:flex-start}' +
  '.sheet.center .sheet-card{top:50%;bottom:auto;left:16px;right:16px;transform:translateY(-50%);border-radius:var(--r);max-width:520px;max-height:86vh;padding-bottom:22px;animation:popin .18s ease-out}.sheet.center .grab{display:none}@keyframes popin{from{opacity:0;transform:translateY(-46%) scale(.96)}}' +
  '.lvopt{display:flex;gap:12px;align-items:center;width:100%;text-align:left;border:2px solid transparent;background:var(--fog);border-radius:16px;padding:12px 14px;margin-top:8px;font:inherit;color:inherit;cursor:pointer}.lvopt.on{border-color:var(--ember);background:#fff4ee}.lvopt svg{flex:0 0 34px}' +
  '.swg{margin-top:14px}.swg h3{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin:0 0 4px}.swr{display:flex;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--rule)}.swr:first-of-type{border-top:0}.swr .grow{min-width:0}.swr b.v{font-size:18px}' +
  '.pill{display:inline-block;font-size:11px;font-weight:800;border-radius:999px;padding:2px 8px;white-space:nowrap}.pill.ok{background:#e3f6ea;color:#127a3a}.pill.mid{background:#fff1d6;color:#8a5a00}.pill.hi{background:#ffe1dc;color:#b42318}.pill.na{background:var(--fog);color:var(--muted)}';
  document.head.appendChild(st); })();
/* Zentrierte Fenster: openPop statt openSheet */
const _openSheetLv = openSheet; openSheet = function (h) { const sh = document.getElementById('sheet'); if (sh) sh.classList.remove('center'); return _openSheetLv(h); };
function openPop(h) { openSheet(h); const sh = document.getElementById('sheet'); if (sh) sh.classList.add('center'); }
const centerize = fn => function () { const r = fn.apply(this, arguments); const sh = document.getElementById('sheet'); if (sh && !sh.hidden) sh.classList.add('center'); return r; };
if (typeof glSheet === 'function') glSheet = centerize(glSheet);
if (typeof evSheet === 'function') evSheet = centerize(evSheet);
if (typeof lcSheet === 'function') lcSheet = centerize(lcSheet);
if (typeof factPopup === 'function') factPopup = centerize(factPopup);
if (typeof whySheet === 'function') whySheet = centerize(whySheet);
if (typeof eqInfoSheet === 'function') eqInfoSheet = centerize(eqInfoSheet);
function lvSheet() { const lv = viewLv(), N = LV_NAMES();
  openPop(sheetHead($t('Ansicht')) + '<p class="small muted" style="margin:4px 0 6px">' + $t('Wie viel Wissenschaft willst du sehen? Du kannst jederzeit wechseln.') + '</p>' +
    [1, 2, 3].map(i => '<button class="lvopt' + (lv === i ? ' on' : '') + '" data-act="lvSet" data-v="' + i + '" type="button">' + flaskSvg(i, 34) + '<span class="grow"><b>' + N[i].n + '</b><br><span class="small muted">' + N[i].d + '</span></span>' + (lv === i ? '<span style="color:var(--ember);font-weight:800">✓</span>' : '') + '</button>').join('')); }
/* Knöpfe oben: Suche, Kolben, (Zahnrad) */
function topButtons() { const v = document.getElementById('view'); if (!v || VIEW || route.name === 'start') return; const top = v.querySelector('.top'); if (!top || top.querySelector('.tbtns')) return; const lv = viewLv();
  const box = document.createElement('div'); box.className = 'tbtns';
  box.innerHTML = '<button class="iconbtn" data-act="searchOpen" type="button" aria-label="' + $t('Suchen') + '">' + SEARCH_SVG + '</button><button class="iconbtn lvbtn" data-act="lvOpen" type="button" aria-label="' + $t('Ansicht') + ': ' + LV_NAMES()[lv].n + '">' + flaskSvg(lv) + '</button>';
  const gear = top.querySelector('a.iconbtn[href="#mehr"]'); if (gear) { gear.parentNode.insertBefore(box, gear); box.appendChild(gear); } else top.appendChild(box); }
/* Inhalte je Stufe ausblenden: Karten nach Überschrift, Kacheln nach Beschriftung */
const LV_CARD_MIN = () => ({ [$t('Bereitschaft')]: 2, [$t('Belastung')]: 2, [$t('Ruhepuls')]: 2, [$t('Check-ins')]: 2, [$t('SpoWi-Kennzahlen')]: 3, [$t('Trainingsreiz')]: 1 });
const LV_TILE_MIN = () => ({ HRV: 2, [$t('Belastung')]: 2, [$t('Max. Puls')]: 2, [$t('Session-RPE')]: 2, [$t('Monotonie')]: 3, [$t('Volumen')]: 2 });
function lvApply() { const lv = viewLv(); document.body.classList.remove('lv1', 'lv2', 'lv3'); document.body.classList.add('lv' + lv); document.body.classList.toggle('spowi', lv === 3);
  const v = document.getElementById('view'); if (!v) return; const CM = LV_CARD_MIN(), TM = LV_TILE_MIN();
  v.querySelectorAll('.card').forEach(c => { const h = c.querySelector('h2'); const t = h ? h.textContent.trim() : ''; const need = CM[t]; if (need) c.style.display = lv < need ? 'none' : ''; });
  v.querySelectorAll('.stat .k, .rk span, .fin-tile span').forEach(k => { const need = TM[k.textContent.trim()]; if (!need) return; const tile = k.closest('.stat, .rk, .fin-tile'); if (tile) tile.style.display = lv < need ? 'none' : ''; }); }
const _renderLv = render; render = function () { const r = _renderLv.apply(this, arguments); try { lvApply(); topButtons(); } catch (e) {} return r; };

/* SpoWi-Kennzahlen verständlicher: Gruppen, Ampel, ein Satz Bedeutung. Zu wenig Daten = kein Wert. */
function loadDays() { let n = 0; for (let i = 0; i < 28; i++) if (dailyLoad(addDays(today(), -i)).n) n++; const first = [S.block.startedOn, ...S.activities.map(a => a.date)].filter(Boolean).sort()[0]; return { n, span: first ? Math.min(28, daysBetween(first, today()) + 1) : 0 }; }
const pill = (cls, t) => '<span class="pill ' + cls + '">' + t + '</span>';
const swR = (label, val, status, meaning) => '<div class="swr"><div class="grow"><div>' + label + '</div><div class="small muted">' + meaning + '</div></div><div style="text-align:right"><b class="v">' + val + '</b><br>' + status + '</div></div>';
spowiProgressCard = function () { const lm = loadMetrics(); const id = intensityDist(); const hv = hrvMetrics(); const base = rhrBaseline(); const ld = loadDays(); const ser = series(); const bw = ser.length ? ser[ser.length - 1].trend : null;
  const enough = ld.span >= 21; const acwr = enough && lm.acwr != null ? lm.acwr : null;
  const aSt = acwr == null ? pill('na', $tf('noch {n} von 21 Tagen', { n: ld.span })) : acwr < .8 ? pill('mid', $t('niedrig')) : acwr <= 1.3 ? pill('ok', $t('im Rahmen')) : acwr <= 1.5 ? pill('mid', $t('erhöht')) : pill('hi', $t('hoch'));
  const mSt = lm.mono == null ? pill('na', '–') : lm.mono < 1.5 ? pill('ok', $t('abwechslungsreich')) : lm.mono <= 2 ? pill('mid', $t('gleichförmig')) : pill('hi', $t('zu gleichförmig'));
  const lifts = keyLifts().filter(x => LIB[x]).map(x => { const h = exHistory(x); let best = 0; h.forEach(o => o.sets.forEach(st => { if (st.w > 0 && st.r) best = Math.max(best, e1rm(st.w, st.r, Math.min(10, st.rpe ?? 8))); })); return best ? [LIB[x].name, best] : null; }).filter(Boolean);
  const g1 = '<div class="swg"><h3>' + $t('Belastung') + '</h3>' +
    swR($t('Akute Last'), fmt(lm.acute, 0), lm.chronic ? pill(lm.acute > lm.chronic * 1.3 ? 'mid' : 'ok', (lm.acute >= lm.chronic ? '+' : '−') + fmt(Math.abs((lm.acute - lm.chronic) / (lm.chronic || 1) * 100), 0) + ' %') : pill('na', '–'), $t('Minuten × Session-RPE der letzten 7 Tage, verglichen mit deinem Wochenschnitt.')) +
    swR('ACWR', acwr == null ? '–' : fmt(acwr, 2), aSt, acwr == null ? $t('Braucht mindestens 3 Wochen Daten, sonst ist der Wert verzerrt.') : $t('Last dieser Woche geteilt durch den 4-Wochen-Schnitt. Über 1,5 steigt laut Studien das Verletzungsrisiko, das Konzept ist aber umstritten.')) +
    swR($t('Monotonie'), lm.mono != null ? fmt(lm.mono, 2) : '–', mSt, $t('Wie gleich deine Tage sind. Unter 1,5: genug leichte und harte Tage im Wechsel.')) +
    swR('Strain', lm.strain != null ? fmt(lm.strain, 0) : '–', '', $t('Wochenlast × Monotonie. Nur im Verlauf aussagekräftig: plötzliche Sprünge beachten.')) + '</div>';
  const g2 = (hv || base) ? '<div class="swg"><h3>' + $t('Erholung') + '</h3>' + (hv ? swR('HRV (ln rMSSD)', fmt(hv.ln, 2), pill(hv.cv < 7 ? 'ok' : hv.cv < 12 ? 'mid' : 'hi', $t('Schwankung ') + fmt(hv.cv, 0) + ' %'), $t('7-Tage-Mittel. Wichtig ist die Schwankung: unter 7 % stabil, über 12 % eher gestresst.')) : '') +
    (base ? swR($t('Ruhepuls-Basis'), base.v + ' bpm', pill('na', base.auto ? $t('automatisch') : $t('manuell')), $t('Dein Normalwert. Liegt der Ruhepuls mehrere Tage 5+ Schläge darüber, ist Erholung angesagt.')) : '') + '</div>' : '';
  const g3 = id ? '<div class="swg"><h3>' + $t('Ausdauer (28 Tage)') + '</h3>' + swR($t('Intensitätsverteilung'), Math.round(id.low * 100) + ' / ' + Math.round(id.mid * 100) + ' / ' + Math.round(id.high * 100) + ' %', pill(id.low >= .7 ? 'ok' : 'mid', id.type), $t('Locker / mittel / hart nach Pulszonen. Für die Grundlage gut: mindestens 70–80 % locker.')) + '</div>' : '';
  const g4 = lifts.length ? '<div class="swg"><h3>' + $t('Kraft (bestes e1RM)') + '</h3>' + lifts.map(l => swR(esc(l[0]), fmt(l[1], 0) + ' kg', bw ? pill('na', fmt(l[1] / bw, 2) + ' × ' + $t('KG')) : '', bw ? $t('Relativ zum Körpergewicht, gut für Vergleiche über die Zeit.') : '')).join('') + '</div>' : '';
  return '<div class="card sw-card"><div class="row"><h2 class="grow">' + $t('SpoWi-Kennzahlen') + '</h2><span class="tag">' + $t('Labor') + '</span></div>' + g1 + g2 + g3 + g4 +
    '<p class="src" style="margin-top:12px">' + $t('Methoden: ') + swRef('Foster 2001 (sRPE)', 'Foster 2001 new approach monitoring exercise training') + ' · ' + swRef('Gabbett 2016 (ACWR)', 'Gabbett 2016 training-injury prevention paradox') + ' · ' + swRef('Impellizzeri 2020 (Kritik)', 'Impellizzeri 2020 acute chronic workload ratio conceptual issues') + ' · ' + swRef('Plews 2012 (HRV)', 'Plews 2012 heart rate variability elite endurance') + '</p>' +
    (typeof evBtn === 'function' ? '<div>' + evBtn(['LOD-107', 'LOD-109', 'LOD-110', 'LOD-108', 'LOD-105'], $t('Studienlage zu den Kennzahlen')) + '</div>' : '') + '</div>'; };
/* Einstellungen: Stufen statt SpoWi-Schalter */
spowiCard = function () { if (VIEW) return ''; const lv = viewLv(), N = LV_NAMES(); return '<div class="card"><h2>' + $t('Ansicht') + '</h2><p class="small muted">' + $t('Wie viel Wissenschaft du sehen willst. Auch oben über den Kolben umschaltbar.') + '</p>' + [1, 2, 3].map(i => '<button class="lvopt' + (lv === i ? ' on' : '') + '" data-act="lvSet" data-v="' + i + '" type="button">' + flaskSvg(i, 30) + '<span class="grow"><b>' + N[i].n + '</b><br><span class="small muted">' + N[i].d + '</span></span></button>').join('') + '</div>'; };
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'lvOpen') lvSheet();
  else if (b.dataset.act === 'lvSet') { const v = +b.dataset.v; setLv(v); const inSheet = !!b.closest('#sheetCard'); render(); if (inSheet) lvSheet(); toast($t('Ansicht: ') + LV_NAMES()[v].n); } });
render();
