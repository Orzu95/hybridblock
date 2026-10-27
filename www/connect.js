/* ======================= VERBINDUNGEN (Health Connect, alle Uhren und Apps) =======================
   Health Connect sammelt die Daten aller Apps auf dem Handy. Jeder Eintrag trägt die App mit, aus der er stammt.
   Darüber wählt man pro Datenart die Quelle und vermeidet doppelte Werte. */
const OWN_PKG = 'de.orzu.hybridblock';
/* Bekannte Apps: Paketnamen zum Wiedererkennen, Hinweis, wo man Health Connect einschaltet (Menüs ändern sich, darum „meist“) */
const PROVIDERS = [
  { id: 'huawei', name: 'Huawei Health', pkg: ['com.huawei.health', 'nl.appyhapps.healthsync'], how: $t('Huawei Health schreibt nicht selbst in Health Connect. Die App „Health Sync“ überträgt die Daten.') },
  { id: 'apple', name: 'Apple Watch', pkg: [], ios: true, how: $t('Die Apple Watch läuft nur mit dem iPhone. Ihre Daten kommen mit der iOS-App über Apple Health. Bis dahin: Trainings in der App aufzeichnen oder nachtragen.') },
  { id: 'xiaomi', name: 'Mi Fitness / Xiaomi', pkg: ['com.mi.health', 'com.xiaomi.wearable'], how: $t('Mi Fitness: Profil → Daten teilen → Health Connect.') },
  { id: 'garmin', name: 'Garmin Connect', pkg: ['com.garmin.android.apps.connectmobile'], how: $t('Garmin Connect: Mehr → Einstellungen → Verbundene Apps → Health Connect.') + ' ' + $t('Garmin gibt Schlaf, Puls, Schritte, Gewicht und Trainings weiter, aber kein VO₂max und keinen HRV-Status.') },
  { id: 'samsung', name: 'Samsung Health', pkg: ['com.sec.android.app.shealth'], how: $t('Samsung Health: Einstellungen → Health Connect.') },
  { id: 'zepp', name: 'Zepp / Amazfit', pkg: ['com.huami.watch.hmwatchmanager'], how: $t('Zepp-App: Profil → Mit Drittanbietern verbinden → Health Connect.') },
  { id: 'google', name: 'Fitbit / Pixel Watch / Google', pkg: ['com.fitbit.FitbitMobile', 'com.google.android.apps.fitness', 'com.google.android.apps.healthdata'], how: $t('Fitbit-App: Profil → Einstellungen → Health Connect.') },
  { id: 'polar', name: 'Polar Flow', pkg: ['fi.polar.polarflow'], how: $t('Polar Flow: Einstellungen → Allgemeine Einstellungen → Health Connect.') },
  { id: 'coros', name: 'COROS', pkg: ['com.yf.smart.coros.dist'], how: $t('COROS: Profil → Einstellungen → Health Connect.') },
  { id: 'suunto', name: 'Suunto', pkg: ['com.stt.android.suunto'], how: $t('Suunto: Profil → Einstellungen → Health Connect.') },
  { id: 'withings', name: 'Withings', pkg: ['com.withings.wiscale2'], how: $t('Withings: Profil → Health Connect.') },
  { id: 'oura', name: 'Oura', pkg: ['com.ouraring.oura'], how: $t('Oura: Einstellungen → Datenfreigabe → Health Connect.') },
  { id: 'whoop', name: 'WHOOP', pkg: ['com.whoop.android'], how: $t('WHOOP: Mehr → App-Einstellungen → Integrationen → Health Connect.') },
  { id: 'ultrahuman', name: 'Ultrahuman', pkg: ['com.ultrahuman.android'], how: $t('Ultrahuman: Profil → Health Connect.') },
  { id: 'strava', name: 'Strava', pkg: ['com.strava'], how: $t('Strava: Einstellungen → Apps, Dienste und Geräte → Health Connect.') },
  { id: 'other', name: $t('Andere App oder Uhr'), pkg: [], how: $t('In der App deiner Uhr in den Einstellungen nach „Health Connect“ suchen und das Schreiben der Daten erlauben.') }
];
const PROV_BY_PKG = {}; PROVIDERS.forEach(p => p.pkg.forEach(k => PROV_BY_PKG[k] = p));
/* Datenarten mit eigener Quellenwahl */
const HC_KINDS = [['steps', $t('Schritte')], ['calories', $t('Kalorien')], ['heartRate', $t('Puls')], ['restingHeartRate', $t('Ruhepuls')], ['heartRateVariability', $t('HRV')], ['sleep', $t('Schlaf')], ['weight', $t('Gewicht')], ['vo2Max', $t('VO₂max')], ['workouts', $t('Trainings')]];
const srcName = id => { if (!id) return $t('unbekannt'); if (id === OWN_PKG) return 'Hybridblock'; const p = PROV_BY_PKG[id]; if (p) return p.name; const m = (S.healthMeta.srcNames || {})[id]; return m || id; };
function srcLabel(a) { if (a.src === 'gps') return $t('mit GPS aufgezeichnet'); if (a.src === 'zepp') return $t('aus Datei-Import'); if (a.srcId) return $t('von ') + srcName(a.srcId); return $t('von der Uhr'); }
function hcMeta() { const m = S.healthMeta; m.pick = m.pick || {}; m.sources = m.sources || {}; m.srcNames = m.srcNames || {}; return m; }
/* Quelle für einen Tag wählen: Auswahl des Nutzers, sonst die eigene Uhr, sonst die Quelle mit den meisten Einträgen */
function chooseSrc(kind, bySrc) { const m = hcMeta(); const ids = Object.keys(bySrc); if (!ids.length) return null;
  const pick = m.pick[kind]; if (pick && pick !== 'auto') return bySrc[pick] ? pick : null;
  const prov = PROVIDERS.find(p => p.id === m.provider); if (prov) { const hit = ids.find(id => prov.pkg.includes(id)); if (hit) return hit; }
  const tot = m.sources[kind] || {}; return ids.filter(id => id !== OWN_PKG).sort((a, b) => ((tot[b] || {}).n || 0) - ((tot[a] || {}).n || 0))[0] || ids[0]; }
function noteSources(kind, samples) { const m = hcMeta(); const t = m.sources[kind] = m.sources[kind] || {};
  samples.forEach(x => { const id = x.sourceId || x.sourceName || '?'; t[id] = t[id] || { n: 0 }; t[id].n++; t[id].last = x.endDate || x.startDate; if (x.sourceName && x.sourceName !== id) m.srcNames[id] = x.sourceName; }); }
const groupBy = (arr, f) => { const o = {}; arr.forEach(x => { const k = f(x); (o[k] = o[k] || []).push(x); }); return o; };
const sid = x => x.sourceId || x.sourceName || '?';

/* Ersetzt den alten Zepp-Abgleich: gleiche Ergebnisfelder, aber pro Tag nur eine Quelle */
async function hcSync(full) { const H = HEALTH.plugin; if (!H || HEALTH.busy) return; HEALTH.busy = true; const m = hcMeta();
  const days = full || !m.lastSync ? 60 : 10; const end = new Date(); const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1);
  const range = { startDate: start.toISOString(), endDate: end.toISOString() }; const errs = []; const grant = m.granted && m.granted.length ? m.granted : HC_READ; const ok = t => grant.includes(t);
  const loc = s => iso(new Date(s)); const safe = async (name, fn) => { try { await fn(); } catch (e) { errs.push(name); console.warn(name, e); } };
  const read = async (dataType, limit) => (await H.readSamples({ dataType, limit: limit || 5000, ascending: true, ...range })).samples || [];
  /* Summen (Schritte, Kalorien): Automatisch = Health Connect rechnet doppelte Quellen selbst heraus; bei fester Quelle selbst summieren */
  const sumKind = async (kind, field) => { if (!ok(kind)) return; const pick = m.pick[kind];
    const probe = await H.readSamples({ dataType: kind, limit: 3000, ascending: false, startDate: addDays(today(), -2) + 'T00:00:00.000Z', endDate: end.toISOString() }); noteSources(kind, probe.samples || []);
    if (!pick || pick === 'auto') { const r = await H.queryAggregated({ dataType: kind, bucket: 'day', aggregation: 'sum', ...range }); (r.samples || []).forEach(x => setHealth(loc(x.startDate), { [field]: Math.round(x.value) }, 'hc')); return; }
    const all = (await read(kind, 50000)).filter(x => sid(x) === pick); const by = {}; all.forEach(x => { const d = loc(x.startDate); by[d] = (by[d] || 0) + x.value; });
    Object.keys(by).forEach(d => setHealth(d, { [field]: Math.round(by[d]) }, 'hc')); };
  await safe($t('Schritte'), () => sumKind('steps', 'steps'));
  await safe($t('Kalorien'), () => sumKind('calories', 'kcal'));
  await safe($t('Puls'), async () => { if (!ok('heartRate')) return; const pick = m.pick.heartRate;
    const probe = await H.readSamples({ dataType: 'heartRate', limit: 3000, ascending: false, startDate: addDays(today(), -1) + 'T00:00:00.000Z', endDate: end.toISOString() }); noteSources('heartRate', probe.samples || []);
    if (!pick || pick === 'auto') { const r = await H.queryAggregated({ dataType: 'heartRate', bucket: 'day', aggregation: ['average', 'min', 'max'], ...range });
      (r.samples || []).forEach(x => { const v = x.values || {}; setHealth(loc(x.startDate), { hrAvg: v.average != null ? Math.round(v.average) : null, hrMin: v.min != null ? Math.round(v.min) : null, hrMax: v.max != null ? Math.round(v.max) : null }, 'hc'); }); return; }
    const by = groupBy((await read('heartRate', 100000)).filter(x => sid(x) === pick && x.value > 25 && x.value < 230), x => loc(x.startDate));
    Object.keys(by).forEach(d => { const a = by[d].map(x => x.value); setHealth(d, { hrAvg: Math.round(a.reduce((s, v) => s + v, 0) / a.length), hrMin: Math.round(Math.min(...a)), hrMax: Math.round(Math.max(...a)) }, 'hc'); }); });
  /* Einzelwerte: pro Tag eine Quelle */
  const perDay = async (kind, limit, apply, dayOf) => { if (!ok(kind)) return; const all = await read(kind, limit); noteSources(kind, all);
    const byDay = groupBy(all, x => (dayOf || (y => loc(y.startDate)))(x)); Object.keys(byDay).forEach(d => { const bs = groupBy(byDay[d], sid); const c = chooseSrc(kind, bs); if (c) apply(d, bs[c]); }); };
  await safe($t('Ruhepuls'), () => perDay('restingHeartRate', 1000, (d, xs) => setHealth(d, { rhr: Math.round(xs[xs.length - 1].value) }, 'hc')));
  await safe($t('HRV'), () => perDay('heartRateVariability', 5000, (d, xs) => { const v = xs.map(x => x.value).filter(x => x > 0); if (v.length) setHealth(d, { hrv: Math.round(median(v)) }, 'hc'); }));
  Object.keys(S.health).forEach(d => { const h = S.health[d]; if (h.rhr == null && h.hrMin != null) h.rhrEst = h.hrMin; });
  await safe($t('Schlaf'), () => perDay('sleep', 600, (d, xs) => { const a = { sleepMin: 0, deep: 0, rem: 0, light: 0, awake: 0, main: 0, bed: null, wake: null };
    xs.forEach(x => { let asleep = x.value; if (x.stages && x.stages.length) { asleep = 0; x.stages.forEach(st => { const mm = st.durationMinutes || 0; if (st.stage === 'deep') a.deep += mm; else if (st.stage === 'rem') a.rem += mm; else if (st.stage === 'light') a.light += mm; else if (st.stage === 'awake') a.awake += mm; if (st.stage !== 'awake' && st.stage !== 'inBed') asleep += mm; }); }
      a.sleepMin += asleep; if (asleep > a.main) { a.main = asleep; a.bed = Date.parse(x.startDate); a.wake = Date.parse(x.endDate); } });
    setHealth(d, { sleepMin: Math.round(a.sleepMin), deep: Math.round(a.deep) || null, rem: Math.round(a.rem) || null, light: Math.round(a.light) || null, awake: Math.round(a.awake) || null, bed: a.bed, wake: a.wake }, 'hc'); }, x => loc(x.endDate)));
  await safe($t('Gewicht'), () => perDay('weight', 400, (d, xs) => { const o = dayObj(d); if (num(o.weight) == null || o.weightSrc === 'hc') { o.weight = String(Math.round(xs[xs.length - 1].value * 10) / 10); o.weightSrc = 'hc'; } }));
  await safe($t('VO2max'), () => perDay('vo2Max', 200, (d, xs) => setHealth(d, { vo2: Math.round(xs[xs.length - 1].value * 10) / 10 }, 'hc')));
  /* Trainings: gewählte Quelle, eigene Aufzeichnungen und zeitlich überlappende Doppel überspringen */
  let nw = 0, dup = 0; const toFetch = []; await safe($t('Trainings'), async () => { if (!ok('workouts')) return; const r = await H.queryWorkouts({ limit: 300, ascending: true, ...range }); const ws = r.workouts || []; noteSources('workouts', ws);
    const pick = m.pick.workouts; const prov = PROVIDERS.find(p => p.id === m.provider);
    const pref = id => (pick && pick !== 'auto' ? (id === pick ? 0 : 9) : prov && prov.pkg.includes(id) ? 0 : 1);
    ws.filter(x => sid(x) !== OWN_PKG && (!pick || pick === 'auto' || sid(x) === pick)).sort((a, b) => pref(sid(a)) - pref(sid(b))).forEach(x => {
      const st = Date.parse(x.startDate), en = Date.parse(x.endDate);
      if (overlapsExisting(st, en, 'hc:' + (x.platformId || x.startDate))) { dup++; return; }
      const res = importWorkout({ key: 'hc:' + (x.platformId || x.startDate), date: loc(x.startDate), type: HC_TYPE[x.workoutType] || 'sonst', title: null, dur: x.duration / 60, dist: x.totalDistance ? x.totalDistance / 1000 : null, kcal: x.totalEnergyBurned || null, src: 'hc', srcId: sid(x), start: st, end: en });
      if (res && res.created) nw++; if (res && res.start && Date.now() - res.start < 4 * 864e5 && !S.hrTraces[res.tkey]) toFetch.push(res); }); });
  if (ok('heartRate')) for (const res of toFetch.slice(0, 6)) await safe($t('Pulskurve'), () => fetchTrace(res.tkey, res.start, res.end));
  m.lastSync = new Date().toISOString(); m.source = 'hc'; save(); HEALTH.busy = false;
  toast(errs.length ? $t('Teilweise synchronisiert. Fehlt: ') + errs.join(', ') : $t('Daten aktualisiert') + (nw ? ' · ' + nw + $t(' neue Trainings') : '')); render(); }
/* Überlappung mit schon vorhandenem Training (z. B. Uhr und Strava schreiben denselben Lauf) */
function overlapsExisting(st, en, key) { if (!st || !en) return false; return S.activities.some(a => { if (a.key === key || !a.start || !a.end) return false; const ov = Math.min(en, a.end) - Math.max(st, a.start); return ov > 0.5 * Math.min(en - st, a.end - a.start); }); }

/* ---------- Karte in den Einstellungen ---------- */
function connectCard() { const m = hcMeta(); const prov = PROVIDERS.find(p => p.id === m.provider);
  const provSel = $t('<div class="field" style="flex:1 1 100%"><label for="hc-prov">Deine Uhr oder App</label><select id="hc-prov" data-hcprov="1"><option value="">Bitte wählen</option>') + PROVIDERS.map(p => '<option value="' + p.id + '"' + (m.provider === p.id ? $t(' selected') : '') + '>' + esc(p.name) + '</option>').join('') + '</select></div>';
  const how = prov ? '<p class="small" style="margin-top:6px">' + esc(prov.how) + '</p>' : '';
  if (!HEALTH.native) return $t('<div class="card" id="conncard"><h2>Verbindungen</h2><p>Uhren und Fitness-Apps verbindest du in der Android-App über Health Connect. Im Browser geht das nicht, weil nur installierte Apps Health Connect lesen dürfen.</p>') +
    '<div class="fields" style="margin-top:12px">' + provSel + '</div>' + how +
    $t('<details style="margin-top:14px"><summary class="small" style="font-weight:700">Datei-Import (Zepp-Export)</summary><ol class="rules small"><li>Zepp-App: Profil → Einstellungen → Konto → Daten exportieren. Du bekommst einen Link und ein Passwort.</li><li>ZIP mit dem Passwort entpacken (am Handy z. B. mit ZArchiver).</li><li>Hier die CSV-Dateien auswählen (ACTIVITY, SLEEP, HEARTRATE_AUTO, SPORT, BODY).</li></ol><div class="row" style="margin-top:10px"><button class="btn" data-act="zepp" type="button">Dateien importieren</button></div></details>') +
    (m.lastSync ? $t('<p class="small muted">Letzter Import: ') + new Date(m.lastSync).toLocaleString(LOCALE) + '</p>' : '') + '</div>';
  const kinds = HC_KINDS.map(([k, lab]) => { const srcs = Object.keys(m.sources[k] || {}).filter(id => id !== OWN_PKG); const cur = m.pick[k] || 'auto';
    return '<div class="field"><label for="hc-k-' + k + '">' + lab + '</label><select id="hc-k-' + k + '" data-hcpick="' + k + '"><option value="auto">' + $t('Automatisch') + '</option>' + srcs.map(id => '<option value="' + esc(id) + '"' + (cur === id ? $t(' selected') : '') + '>' + esc(srcName(id)) + '</option>').join('') + '</select></div>'; }).join('');
  const found = {}; Object.values(m.sources).forEach(t => Object.keys(t).forEach(id => { if (id !== OWN_PKG) found[id] = (found[id] || 0) + t[id].n; }));
  const foundH = Object.keys(found).length ? $t('<p class="small" style="margin-top:12px"><b>Gefundene Quellen:</b> ') + Object.keys(found).map(id => esc(srcName(id))).join(', ') + '</p>' : '';
  return $t('<div class="card" id="conncard"><h2>Verbindungen</h2><p>Alle Uhren und Fitness-Apps, die in Health Connect schreiben: Zepp, Samsung, Garmin, Fitbit, Polar, Withings, Oura und viele mehr. Hybridblock liest von dort.</p>') +
    '<div class="fields" style="margin-top:12px">' + provSel + '</div>' + how +
    $t('<ol class="rules small" style="margin-top:8px"><li>In der App deiner Uhr Health Connect einschalten (siehe oben).</li><li>Hier auf „Verbinden“ tippen und alle Lese-Rechte erlauben.</li></ol>') +
    '<div class="row" style="margin-top:14px"><button class="btn brand" data-act="hcConnect" type="button">' + (m.source === 'hc' ? $t('Berechtigungen prüfen') : $t('Verbinden')) + '</button><button class="btn" data-act="hcSync" type="button">' + ICON.sync + $t('Jetzt synchronisieren</button><button class="btn" data-act="hcSettings" type="button">Health Connect öffnen</button></div>') +
    foundH + (m.source === 'hc' ? '<details id="hc-det" style="margin-top:12px"' + (ui.hcOpen ? ' open' : '') + '>' + $t('<summary class="small" style="font-weight:700">Quelle pro Datenart</summary><p class="small muted" style="margin:8px 0">Liefern zwei Apps dasselbe (z. B. Schritte vom Handy und von der Uhr), nimmt die App nur eine Quelle. „Automatisch“ bevorzugt deine oben gewählte Uhr.</p><div class="fields">') + kinds + '</div></details>' : '') +
    (m.lastSync ? $t('<p class="small muted">Zuletzt: ') + new Date(m.lastSync).toLocaleString(LOCALE) + (m.denied && m.denied.length ? $t(' · nicht erlaubt: ') + m.denied.join(', ') : '') + '</p>' : '') + '</div>'; }
document.addEventListener('change', e => { const t = e.target;
  if (t.dataset.hcprov) { hcMeta().provider = t.value || null; save(); softPatch('conncard', connectCard()); return; }
  if (t.dataset.hcpick) { hcMeta().pick[t.dataset.hcpick] = t.value; save(); toast($t('Gespeichert. Beim nächsten Abgleich gilt die neue Quelle.')); if (HEALTH.native) hcSync(true); } });
document.addEventListener('toggle', e => { if (e.target.id === 'hc-det') ui.hcOpen = e.target.open; }, true);
