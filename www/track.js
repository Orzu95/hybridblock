/* ======================= LIVE-TRACKING: GPS, Pulsgurt, Ansagen =======================
   Android-App: GPS im Vordergrund-Dienst (läuft mit Bildschirm aus), Bluetooth-Pulsgurt, Sprachansagen, Speichern in Health Connect.
   Browser: GPS nur bei eingeschaltetem Bildschirm, Pulsgurt über Web Bluetooth (Chrome). */
const NP = name => { const C = window.Capacitor; if (!C || !C.isNativePlatform || !C.isNativePlatform()) return null; return (C.Plugins && C.Plugins[name]) || (C.registerPlugin ? C.registerPlugin(name) : null); };
const HR_SVC = '0000180d-0000-1000-8000-00805f9b34fb', HR_CHR = '00002a37-0000-1000-8000-00805f9b34fb';
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', TILE_ATTR = '© OpenStreetMap';
const TR_KEY = 'hb_track_live';

/* ---------- Pulsgurt (Bluetooth-Standard „Heart Rate“) ---------- */
const HRM = { state: 'off', bpm: null, at: 0, name: '', id: null, lsn: [], web: null, battery: null };
const hexToBytes = h => (String(h).match(/[0-9a-f]{2}/gi) || []).map(x => parseInt(x, 16));
function parseHr(b) { if (!b || b.length < 2) return null; return b[0] & 1 ? (b[1] | (b[2] << 8)) : b[1]; }
const hrFresh = () => HRM.bpm != null && Date.now() - HRM.at < 6000;
function onHr(bpm) { if (!bpm || bpm < 25 || bpm > 250) return; HRM.bpm = bpm; HRM.at = Date.now(); if (HRM.state !== 'on') { HRM.state = 'on'; hrmUi(); }
  if (TR.active && !TR.paused) { const last = TR.hr[TR.hr.length - 1]; if (!last || Date.now() - last[0] >= 1000) TR.hr.push([Date.now(), bpm]); } }
async function hrmConnect(pickNew) { const B = NP('BluetoothLe');
  if (B) { try { HRM.state = 'connecting'; hrmUi(); await B.initialize({ androidNeverForLocation: true });
      let dev = !pickNew && S.settings.hrm && S.settings.hrm.id ? S.settings.hrm : null;
      if (!dev) { const d = await B.requestDevice({ services: [HR_SVC] }); dev = { id: d.deviceId, name: d.name || $t('Pulsgurt') }; S.settings.hrm = dev; save(); }
      for (const l of HRM.lsn) { try { await l.remove(); } catch (e) {} } HRM.lsn = [];
      HRM.lsn.push(await B.addListener('disconnected|' + dev.id, () => { HRM.state = 'lost'; hrmUi(); if (TR.active) setTimeout(() => { if (TR.active && HRM.state !== 'on') hrmConnect(false); }, 4000); }));
      HRM.lsn.push(await B.addListener('notification|' + dev.id + '|' + HR_SVC + '|' + HR_CHR, ev => onHr(parseHr(hexToBytes(ev && ev.value)))));
      try { await B.disconnect({ deviceId: dev.id }); } catch (e) {}
      await B.connect({ deviceId: dev.id, timeout: 15000 }); await B.startNotifications({ deviceId: dev.id, service: HR_SVC, characteristic: HR_CHR });
      HRM.id = dev.id; HRM.name = dev.name; HRM.state = 'on'; hrmUi(); toast($t('Verbunden: ') + dev.name); }
    catch (e) { HRM.state = 'off'; hrmUi(); const msg = String((e && e.message) || e);
      if (!/cancel/i.test(msg)) toast($t('Pulsgurt nicht verbunden. Ist er angelegt und nicht mit einer anderen App verbunden?')); }
    return; }
  if (navigator.bluetooth) { try { HRM.state = 'connecting'; hrmUi();
      const dev = await navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] }); const gatt = await dev.gatt.connect();
      const ch = await (await gatt.getPrimaryService('heart_rate')).getCharacteristic('heart_rate_measurement'); await ch.startNotifications();
      ch.addEventListener('characteristicvaluechanged', ev => onHr(parseHr(new Uint8Array(ev.target.value.buffer))));
      dev.addEventListener('gattserverdisconnected', () => { HRM.state = 'lost'; hrmUi(); });
      HRM.web = dev; HRM.name = dev.name || $t('Pulsgurt'); HRM.state = 'on'; hrmUi(); toast($t('Verbunden: ') + HRM.name); }
    catch (e) { HRM.state = 'off'; hrmUi(); } return; }
  toast($t('Bluetooth geht hier nicht. In der Android-App oder in Chrome klappt es.')); }
async function hrmDisconnect(forget) { const B = NP('BluetoothLe');
  try { if (B && HRM.id) { await B.stopNotifications({ deviceId: HRM.id, service: HR_SVC, characteristic: HR_CHR }).catch(() => {}); await B.disconnect({ deviceId: HRM.id }); } if (HRM.web && HRM.web.gatt.connected) HRM.web.gatt.disconnect(); } catch (e) {}
  HRM.state = 'off'; HRM.bpm = null; if (forget) { delete S.settings.hrm; save(); } hrmUi(); }
function hrmUi() { if (route.name === 'track' && TR.active && HRM._last !== HRM.state) { HRM._last = HRM.state; render(); return; } HRM._last = HRM.state; const el = document.getElementById('hrmcard'); if (el) softPatch('hrmcard', hrmCard()); const ch = document.getElementById('tr-hrchip'); if (ch) ch.outerHTML = hrChip(); }
function hrChip() { const st = HRM.state; return '<span id="tr-hrchip" class="trchip ' + (st === 'on' ? 'ok' : st === 'connecting' ? 'wait' : st === 'lost' ? 'bad' : '') + '">' +
  (st === 'on' ? '♥ ' + esc(HRM.name || $t('Pulsgurt')) : st === 'connecting' ? $t('♥ verbinde …') : st === 'lost' ? $t('♥ Verbindung weg') : $t('♥ kein Gurt')) + '</span>'; }
function hrmCard() { const d = S.settings.hrm;
  return $t('<div class="card" id="hrmcard"><h2>Pulsgurt und Live-Puls</h2><p class="small">Jeder Bluetooth-Pulsgurt (Polar, Garmin, Wahoo, Coospo …), Armbänder wie die Polar Verity Sense und Uhren mit „Puls senden“ (Garmin, Polar, Coros, Suunto, viele Amazfit-Modelle). Den Gurt vorher anlegen, damit er sendet.</p>') +
    '<div class="row" style="margin-top:12px">' + hrChip() + (HRM.state === 'on' && HRM.bpm ? '<b style="margin-left:8px">' + HRM.bpm + $t(' bpm</b>') : '') + '</div>' +
    '<div class="row" style="margin-top:12px">' + (HRM.state === 'on' ? $t('<button class="btn" data-act="hrmOff" type="button">Trennen</button>') : '<button class="btn brand" data-act="hrmOn" type="button">' + (d ? $t('Verbinden: ') + esc(d.name) : $t('Gurt suchen')) + '</button>') +
    (d ? $t('<button class="btn" data-act="hrmNew" type="button">Anderen Gurt</button><button class="btn" data-act="hrmForget" type="button">Vergessen</button>') : '') + '</div></div>'; }

/* ---------- Sprache ---------- */
const TTS_LANG = { de: 'de-DE', en: 'en-US', ru: 'ru-RU' };
async function say(txt) { if (!trOpts().voice) return; const T = NP('TextToSpeech');
  try { if (T) { await T.stop().catch(() => {}); await T.speak({ text: txt, lang: TTS_LANG[LANG] || 'de-DE', rate: 1.0, category: 'playback' }); return; }
    if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(txt); u.lang = TTS_LANG[LANG] || 'de-DE'; speechSynthesis.cancel(); speechSynthesis.speak(u); } } catch (e) {} }
const buzz = p => { try { navigator.vibrate && navigator.vibrate(p || [80, 60, 80]); } catch (e) {} };
function sayDur(sec) { const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.round(sec % 60);
  return (h ? h + $t(' Stunden ') : '') + m + $t(' Minuten') + (h ? '' : ' ' + s + $t(' Sekunden')); }
function sayPace(secPerKm) { if (!isFinite(secPerKm) || secPerKm <= 0) return ''; const m = Math.floor(secPerKm / 60), s = Math.round(secPerKm % 60); return m + ' ' + (s < 10 ? '0' : '') + s; }

/* ---------- Rechnen ---------- */
const R_EARTH = 6371000, rad = x => x * Math.PI / 180;
function hav(a, b) { const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1]); const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2; return 2 * R_EARTH * Math.asin(Math.sqrt(h)); }
const MAXV = { lauf: 9, rad: 25, wasser: 6, winter: 35, indoor: 9, ball: 10, kampf: 6, sonst: 30 }; /* m/s, darüber ist es ein GPS-Sprung */
const PAUSE_V = { lauf: 0.6, rad: 1.4, wasser: 0.3, winter: 0.8 };
function fmtPace(secPerKm) { if (!isFinite(secPerKm) || secPerKm <= 0 || secPerKm > 3600) return '–:–'; const m = Math.floor(secPerKm / 60), s = Math.round(secPerKm % 60); return m + ':' + (s < 10 ? '0' : '') + (s === 60 ? '00' : s); }
function fmtClock(sec) { sec = Math.max(0, Math.round(sec)); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s; }
/* Anzeige je nach Sportart: Pace pro km, pro 100 m (Schwimmen), pro 500 m (Rudern) oder km/h */
function speedTxt(type, mps) { const m = (ACT_MAP[type] || {}).m; if (!mps || mps < 0.1) return m === 'speed' ? '0,0' : '–:–';
  if (m === 'speed') return fmt(mps * 3.6, 1); if (m === 'p100') return fmtPace(100 / mps); if (m === 'p500') return fmtPace(500 / mps); return fmtPace(1000 / mps); }
function speedUnit(type) { const m = (ACT_MAP[type] || {}).m; return m === 'speed' ? $t('km/h') : m === 'p100' ? $t('/100 m') : m === 'p500' ? $t('/500 m') : $t('/km'); }
function hrZone(bpm) { const hf = num(S.settings.hfmax) || 186; const r = bpm / hf; let z = 0; ZONES.forEach((x, i) => { if (r >= x.lo) z = i; }); return z; }
/* Google-Polyline (kompakt speichern, ca. 5 Byte pro Punkt) */
function encPoly(pts) { let out = '', pl = 0, pg = 0; const e = v => { v = v < 0 ? ~(v << 1) : v << 1; let s = ''; while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; } return s + String.fromCharCode(v + 63); };
  pts.forEach(p => { const la = Math.round(p[0] * 1e5), lg = Math.round(p[1] * 1e5); out += e(la - pl) + e(lg - pg); pl = la; pg = lg; }); return out; }
function decPoly(str) { const pts = []; let i = 0, la = 0, lg = 0; const d = () => { let b, sh = 0, r = 0; do { b = str.charCodeAt(i++) - 63; r |= (b & 0x1f) << sh; sh += 5; } while (b >= 0x20); return r & 1 ? ~(r >> 1) : r >> 1; };
  while (i < str.length) { la += d(); lg += d(); pts.push([la / 1e5, lg / 1e5]); } return pts; }
function bodyKg() { const ds = Object.keys(S.days).sort().reverse(); for (const d of ds) { const w = num(S.days[d].weight); if (w) return w; } return num(S.settings.startWeight) || 80; }
const kcalOf = (type, sec) => Math.round(((ACT_MAP[type] || ACT_MAP.sonst).met || 5) * bodyKg() * sec / 3600);

/* ---------- Aufzeichnung ---------- */
let TR = { active: false };
function trOpts() { const o = S.settings.tr = S.settings.tr || {}; if (o.voice == null) o.voice = true; if (o.map == null) o.map = true; if (o.auto == null) o.auto = true; if (o.every == null) o.every = 1; if (o.hcw == null) o.hcw = true; return o; }
const movingSec = () => !TR.active ? 0 : (TR.runMs + (TR.paused ? 0 : Date.now() - TR.resumeAt)) / 1000;
function trNew(type, ctx) { const t = ACT_MAP[type] || ACT_MAP.joggen; return { active: true, type: t.id, ctx: ctx || null, gps: !!t.gps, startAt: Date.now(), resumeAt: Date.now(), runMs: 0, paused: false, pts: [], dist: 0, elevUp: 0, altRef: null,
  hr: [], laps: [], splits: [], nextSplit: 1, lastPt: null, recent: [], acc: null, q: null, qi: -1, qLeft: 0, zone: null, lastAlert: 0, out: 0, nextVoiceMin: 0, manualPause: false }; }
async function trStart(type, ctx) { if (TR.active) return; const o = trOpts(); TR = trNew(type, ctx);
  TR.zone = ui.trZone != null ? ui.trZone : null; if (ctx && isCardio(ctx.k)) { const sp = cardioSpec(ctx.w, ctx.k); if (sp.mode === 'int') { TR.q = intervalQueue(ctx.w, ctx.k).map(x => ({ ...x, hi: /hart|Laufen |hard|Run |Бег /i.test(x.label) })); } else if (TR.zone == null && Z2K() === ctx.k) TR.zone = 1; }
  if (ui.trIntervals === '4x4' && !TR.q) TR.q = intervalQueue(curWeek(), null).map(x => ({ ...x, hi: /hart|hard|Интерв/i.test(x.label) }));
  if (TR.q) { TR.qi = 0; TR.qAt = 0; TR.qLeft = TR.q[0].sec; }
  try { const LN = NP('LocalNotifications'); if (LN) await LN.requestPermissions(); } catch (e) {}
  if (TR.gps) await gpsStart(); keepAwake(); trPersist(); clearInterval(TR_TICK.iv); TR_TICK.iv = setInterval(trTick, 1000);
  if (!hrFresh() && S.settings.hrm && HRM.state !== 'connecting') hrmConnect(false);
  buzz([60]); say((ACT_MAP[TR.type].name) + $t(' gestartet') + (TR.q ? '. ' + TR.q[0].label : '')); render(); }
const TR_TICK = { iv: null };
async function gpsStart() { const G = NP('BackgroundGeolocation');
  if (G) { try { TR.watch = await G.addWatcher({ backgroundTitle: $t('Training läuft'), backgroundMessage: ACT_MAP[TR.type].name + ' · Hybridblock', requestPermissions: true, stale: false, distanceFilter: 0 },
      (loc, err) => { if (err) { if (err.code === 'NOT_AUTHORIZED') { toast($t('Standort nicht erlaubt. Bitte in den Einstellungen freigeben.')); try { G.openSettings(); } catch (e) {} } return; } if (loc) onLoc(loc.latitude, loc.longitude, loc.accuracy, loc.altitude, loc.time || Date.now()); });
      TR.watchNative = true; } catch (e) { toast($t('GPS ließ sich nicht starten: ') + (e.message || e)); } return; }
  if (navigator.geolocation) { TR.watch = navigator.geolocation.watchPosition(p => onLoc(p.coords.latitude, p.coords.longitude, p.coords.accuracy, p.coords.altitude, p.timestamp), e => { if (e.code === 1) toast($t('Standort nicht erlaubt.')); }, { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
    TR.watchNative = false; toast($t('Im Browser läuft GPS nur bei eingeschaltetem Bildschirm. Für längere Einheiten die Android-App nutzen.')); } }
async function gpsStop() { if (TR.watch == null) return; try { if (TR.watchNative) await NP('BackgroundGeolocation').removeWatcher({ id: TR.watch }); else navigator.geolocation.clearWatch(TR.watch); } catch (e) {} TR.watch = null; }
function onLoc(lat, lng, acc, alt, t) { if (!TR.active || lat == null) return; TR.acc = acc; TR.fixAt = Date.now(); if (acc != null && acc > 35) return;
  const g = (ACT_MAP[TR.type] || {}).g || 'sonst'; const p = [lat, lng, t];
  TR.recent.push(p); while (TR.recent.length && t - TR.recent[0][2] > 12000) TR.recent.shift();
  const prev = TR.lastPt;
  if (prev) { const d = hav(prev, p), dt = (t - prev[2]) / 1000; if (dt <= 0) return; if (d / dt > (MAXV[g] || 30)) return;
    if (TR.paused) { TR.lastPt = p; autoPause(g); return; }
    if (d < Math.max(3, (acc || 5) * 0.6) && dt < 15) { autoPause(g); return; } /* Zittern im Stand nicht als Strecke zählen */
    TR.dist += d; }
  if (alt != null) { if (TR.altRef == null) TR.altRef = alt; else if (alt - TR.altRef > 4) { TR.elevUp += alt - TR.altRef; TR.altRef = alt; } else if (TR.altRef - alt > 4) TR.altRef = alt; }
  if (!TR.paused) { TR.pts.push([Math.round(lat * 1e6) / 1e6, Math.round(lng * 1e6) / 1e6, t, alt != null ? Math.round(alt) : null, acc != null ? Math.round(acc) : null]); TR.mapDirty = true; }
  TR.lastPt = p; autoPause(g); checkSplit(); if (TR.q) trTick(true); }
/* Auto-Pause: steht man ca. 8 s, ruht die Uhr; ab Bewegung läuft sie weiter. Nicht bei Intervallen (Gehpausen gehören dazu). */
function autoPause(g) { if (!trOpts().auto || TR.q || TR.manualPause || !PAUSE_V[g] || TR.recent.length < 2) return; const a = TR.recent[0], b = TR.recent[TR.recent.length - 1]; const dt = (b[2] - a[2]) / 1000; if (dt < 6) return;
  const v = hav(a, b) / dt;
  if (!TR.paused && v < PAUSE_V[g] && dt >= 8) { trPause(true); }
  else if (TR.paused === 'auto') { const r = TR.recent.filter(x => b[2] - x[2] <= 4000); if (r.length >= 2) { const v2 = hav(r[0], r[r.length - 1]) / Math.max(1, (r[r.length - 1][2] - r[0][2]) / 1000); if (v2 > PAUSE_V[g] * 1.5) trResume(); } } }
function trPause(auto) { if (!TR.active || TR.paused) return; TR.runMs += Date.now() - TR.resumeAt; TR.paused = auto ? 'auto' : 'manual'; TR.manualPause = !auto; if (!auto) say($t('Pause')); else buzz([40]); trLive(true); }
function trResume() { if (!TR.active || !TR.paused) return; TR.paused = false; TR.manualPause = false; TR.resumeAt = Date.now(); TR.recent = []; buzz([40]); if (TR.lastPt) TR.lastPt = null; trLive(true); }
function splitLen() { const m = (ACT_MAP[TR.type] || {}).m; return m === 'p100' || m === 'p500' ? 500 : 1000; }
function checkSplit() { const L = splitLen(); if (TR.dist < TR.nextSplit * L) return; const sec = movingSec(); const prevSec = TR.splits.reduce((a, s) => a + s.sec, 0); const hrs = TR.hr.filter(h => h[0] > (TR.splitAt || TR.startAt)).map(h => h[1]);
  const sp = { n: TR.nextSplit, len: L, sec: Math.round(sec - prevSec), hr: hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null }; TR.splits.push(sp); TR.splitAt = Date.now(); TR.nextSplit++;
  const o = trOpts(); if (o.voice && sp.n % (o.every || 1) === 0) { const km = (sp.n * L / 1000); const pace = sec / (TR.dist / 1000);
    say((L === 1000 ? $t('Kilometer ') + km : fmt(km, 1) + $t(' Kilometer')) + '. ' + $t('Zeit ') + sayDur(sec) + '. ' + ((ACT_MAP[TR.type].m === 'speed') ? $t('Schnitt ') + fmt(TR.dist / sec * 3.6, 1) + $t(' km/h') : $t('Pace ') + sayPace(pace)) + (sp.hr ? '. ' + $t('Puls ') + sp.hr : '') + '.'); buzz(); } }
function trLap() { if (!TR.active) return; const sec = movingSec(); const prev = TR.laps[TR.laps.length - 1] || { sec: 0, dist: 0 }; const lap = { n: TR.laps.length + 1, sec, dist: TR.dist, lsec: sec - prev.sec, ldist: TR.dist - prev.dist }; TR.laps.push(lap);
  say($t('Runde ') + lap.n + '. ' + sayDur(lap.lsec) + (lap.ldist > 50 ? ', ' + fmt(lap.ldist / 1000, 2) + $t(' Kilometer') : '') + '.'); buzz(); toast($t('Runde ') + lap.n + ': ' + fmtClock(lap.lsec)); }
function trTick(fromGps) { if (!TR.active) return; const o = trOpts();
  /* Intervalle nach Uhrzeit statt Takt zählen, damit sie bei ausgeschaltetem Bildschirm nicht nachgehen */
  if (TR.q && TR.qi >= 0 && TR.qi < TR.q.length) { const el = movingSec() - (TR.qAt || 0); const left = Math.ceil(TR.q[TR.qi].sec - el); if (left !== TR.qLeft && left > 0 && left <= 3) buzz([30]); TR.qLeft = left;
    if (left <= 0) { TR.qAt = (TR.qAt || 0) + TR.q[TR.qi].sec; TR.qi++; if (TR.qi < TR.q.length) { TR.qLeft = TR.q[TR.qi].sec; say(TR.q[TR.qi].label); buzz([200, 100, 200]); } else { say($t('Intervalle geschafft. Locker ausrollen oder beenden.')); buzz([300, 100, 300]); } } }
  /* Zeitansage ohne Strecke (Indoor, Ballsport): alle 5 min */
  if (!TR.paused && o.voice && !TR.gps) { const min = Math.floor(movingSec() / 60); if (min >= 5 && min % 5 === 0 && min !== TR.nextVoiceMin) { TR.nextVoiceMin = min; say(min + $t(' Minuten') + (hrFresh() ? '. ' + $t('Puls ') + HRM.bpm : '') + '.'); } }
  /* Zielzone: nach 20 s außerhalb eine Ansage, höchstens alle 60 s */
  if (!TR.paused && TR.zone != null && hrFresh() && movingSec() > 300) { const z = hrZone(HRM.bpm); if (z !== TR.zone) { if (!TR.outSince) TR.outSince = Date.now(); } else TR.outSince = 0;
    if (TR.outSince && Date.now() - TR.outSince >= 20000 && Date.now() - TR.lastAlert > 60000) { TR.lastAlert = Date.now(); TR.outSince = 0; buzz([150, 80, 150, 80, 150]); say(z > TR.zone ? $t('Puls zu hoch. Etwas langsamer.') : $t('Puls zu niedrig. Etwas schneller.')); } }
  if (Date.now() - (TR.savedAt || 0) > 15000) trPersist(); if (!fromGps) trLive(false); }
function trPersist() { try { const snap = Object.assign({}, TR, { watch: null }); localStorage.setItem(TR_KEY, JSON.stringify(snap)); TR.savedAt = Date.now(); } catch (e) {} }

/* ---------- Live-Anzeige ---------- */
function curSpeed() { const r = TR.recent; if (r.length < 2) return 0; const a = r[0], b = r[r.length - 1]; const dt = (b[2] - a[2]) / 1000; return dt > 2 ? hav(a, b) / dt : 0; }
function trLive(full) { if (route.name !== 'track') { trBar(); return; } const set = (id, v) => { const el = document.getElementById(id); if (el && el.textContent !== String(v)) el.textContent = v; };
  const sec = movingSec(); set('tr-time', fmtClock(sec)); set('tr-dist', fmt(TR.dist / 1000, 2)); set('tr-cur', speedTxt(TR.type, curSpeed())); set('tr-avg', speedTxt(TR.type, sec > 0 ? TR.dist / sec : 0));
  const hr = hrFresh() ? HRM.bpm : null; set('tr-hr', hr || '–'); const hb = document.getElementById('tr-hrbox'); if (hb) { const z = hr ? hrZone(hr) : -1; hb.style.background = z >= 0 ? ZONES[z].c : ''; hb.classList.toggle('lit', z >= 0); set('tr-zone', z >= 0 ? ZONES[z].k + ' · ' + ZONES[z].n : $t('kein Puls')); }
  set('tr-gps', !TR.gps ? $t('ohne GPS') : TR.acc == null ? $t('GPS sucht …') : '± ' + Math.round(TR.acc) + ' m'); set('tr-elev', Math.round(TR.elevUp) + ' m');
  if (TR.q) { const cur = TR.q[TR.qi]; set('tr-qlab', cur ? cur.label : $t('Intervalle fertig')); set('tr-qleft', cur ? fmtClock(TR.qLeft) : ''); set('tr-qn', cur ? (TR.qi + 1) + ' / ' + TR.q.length : ''); const qb = document.getElementById('tr-q'); if (qb) qb.classList.toggle('hi', !!(cur && cur.hi)); }
  const pb = document.getElementById('tr-pausebtn'); if (pb && full) pb.outerHTML = pauseBtn(); const st = document.getElementById('tr-state'); if (st) st.textContent = TR.paused === 'auto' ? $t('Auto-Pause') : TR.paused ? $t('Pausiert') : '';
  if (TR.map && (TR.mapDirty || full)) { TR.mapDirty = false; const ll = TR.pts.map(p => [p[0], p[1]]); TR.line.setLatLngs(ll); if (ll.length) { const last = ll[ll.length - 1]; TR.dot.setLatLng(last); if (!TR.userPanned) TR.map.setView(last, Math.max(TR.map.getZoom(), 15), { animate: false }); } } }
const pauseBtn = () => '<button id="tr-pausebtn" class="btn ' + (TR.paused ? 'brand' : '') + '" data-act="' + (TR.paused ? 'trResume' : 'trPause') + '" type="button">' + (TR.paused ? $t('Weiter') : $t('Anhalten')) + '</button>';
function trBar() { let el = document.getElementById('trbar'); if (!TR.active || route.name === 'track') { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('a'); el.id = 'trbar'; el.href = '#track'; document.body.appendChild(el); }
  el.innerHTML = '<span class="dot"></span><b>' + esc(ACT_MAP[TR.type].name) + '</b> · ' + fmtClock(movingSec()) + (TR.gps ? ' · ' + fmt(TR.dist / 1000, 2) + ' km' : '') + (hrFresh() ? ' · ♥ ' + HRM.bpm : '') + (TR.paused ? $t(' · Pause') : ''); }
function trMapInit() { const el = document.getElementById('tr-map'); if (!el || !window.L) return; if (TR.map) { try { TR.map.remove(); } catch (e) {} }
  TR.map = L.map(el, { zoomControl: false, attributionControl: true }).setView(TR.pts.length ? [TR.pts[TR.pts.length - 1][0], TR.pts[TR.pts.length - 1][1]] : [50.11, 8.68], TR.pts.length ? 16 : 5);
  L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTR }).addTo(TR.map); TR.line = L.polyline([], { color: '#ff5406', weight: 5 }).addTo(TR.map); TR.dot = L.circleMarker([0, 0], { radius: 7, color: '#fff', weight: 3, fillColor: '#ff5406', fillOpacity: 1 }).addTo(TR.map);
  TR.map.on('dragstart', () => { TR.userPanned = true; }); TR.userPanned = false; trLive(true); }

/* ---------- Seiten ---------- */
function typeSelect(cur) { return '<select id="tr-type" data-trtype="1">' + ACT_GROUPS.map(([g, lab]) => { const items = ACT_TYPES.filter(a => a.g === g && a.cardio); return items.length ? '<optgroup label="' + esc(lab) + '">' + items.map(a => '<option value="' + a.id + '"' + (a.id === cur ? $t(' selected') : '') + '>' + esc(a.name) + (a.gps ? ' · GPS' : '') + '</option>').join('') + '</optgroup>' : ''; }).join('') + '</select>'; }
function viewTrack() { const o = trOpts();
  if (!TR.active) { const type = ui.trType || S.settings.trLast || 'joggen'; const t = ACT_MAP[type] || ACT_MAP.joggen; const ctx = ui.trCtx;
    const zoneSel = $t('<select id="tr-zonesel" data-trzone="1"><option value="">keine</option>') + ZONES.map((z, i) => '<option value="' + i + '"' + (String(ui.trZone) === String(i) ? $t(' selected') : '') + '>' + z.k + ' · ' + z.n + '</option>').join('') + '</select>';
    const ivSel = ctx ? '' : $t('<div class="field"><label for="tr-iv">Intervalle</label><select id="tr-iv" data-triv="1"><option value="">keine</option><option value="4x4"') + (ui.trIntervals === '4x4' ? $t(' selected') : '') + $t('>4×4 (norwegisch)</option></select></div>');
    const tog = (k, lab) => '<button class="trtog' + (o[k] ? ' on' : '') + '" data-act="trOpt" data-k="' + k + '" type="button">' + (o[k] ? '✓ ' : '') + lab + '</button>';
    return '<a href="' + (ctx ? '#training/' + sKey(ctx.w, ctx.k) : '#training') + '" class="back">' + ICON.back + $t('Training</a>') + pageTop($t('Aufzeichnen'), '', ctx ? esc(SESS[ctx.k].title) + $t(' · Woche ') + ctx.w : $t('Laufen, Rad, Schwimmen und mehr, mit GPS und Live-Puls')) + '<div class="stack">' +
      $t('<div class="card"><div class="fields"><div class="field" style="flex:1 1 100%"><label for="tr-type">Sportart</label>') + typeSelect(t.id) + '</div>' +
      $t('<div class="field"><label for="tr-zonesel">Zielzone (Ansage)</label>') + zoneSel + '</div>' + ivSel + '</div>' +
      '<div class="row" style="margin-top:14px;gap:8px;flex-wrap:wrap">' + tog('voice', $t('Sprachansagen')) + (t.gps ? tog('map', $t('Karte')) + tog('auto', $t('Auto-Pause')) : '') + (NP('HbHealth') ? tog('hcw', $t('In Health Connect speichern')) : '') + '</div>' +
      (t.gps ? '' : $t('<p class="small muted" style="margin-top:10px">Ohne GPS: Zeit und Puls werden aufgezeichnet, die Strecke trägst du am Ende ein.</p>')) + '</div>' +
      hrmCard() +
      $t('<button class="btn brand block big" data-act="trStart" type="button">Start</button>') +
      $t('<p class="small muted">Tipp: Für genaues GPS ein paar Sekunden im Freien warten, bevor du startest. In der Android-App läuft die Aufzeichnung auch mit ausgeschaltetem Bildschirm weiter.</p>') + '</div>'; }
  const t = ACT_MAP[TR.type]; const mapOn = TR.gps && o.map;
  return '<div class="trk">' + '<div class="row trk-top"><b class="grow">' + esc(t.name) + '</b><span class="trchip" id="tr-gps"></span>' + hrChip() + '</div>' +
    '<div class="trk-time" id="tr-time">0:00</div><div class="trk-state" id="tr-state"></div>' +
    (TR.q ? '<div class="trk-q" id="tr-q"><div class="row"><span class="grow" id="tr-qlab"></span><span id="tr-qn" class="small"></span></div><div class="trk-qleft" id="tr-qleft"></div></div>' : '') +
    '<div class="trk-grid">' + (TR.gps ? '<div><b id="tr-dist">0,00</b><span>' + $t('km') + '</span></div>' : '') +
    (TR.gps ? '<div><b id="tr-cur">–</b><span>' + (t.m === 'speed' ? $t('km/h aktuell') : $t('Pace aktuell ') + speedUnit(TR.type)) + '</span></div><div><b id="tr-avg">–</b><span>' + (t.m === 'speed' ? $t('Ø km/h') : $t('Ø Pace ') + speedUnit(TR.type)) + '</span></div><div><b id="tr-elev">0 m</b><span>' + $t('Höhenmeter') + '</span></div>' : '') +
    '<div id="tr-hrbox" class="trk-hr"><b id="tr-hr">–</b><span id="tr-zone"></span></div></div>' +
    (mapOn ? '<div id="tr-map" class="trk-map"></div>' : '') +
    '<div class="row trk-btns">' + pauseBtn() + (TR.gps ? $t('<button class="btn" data-act="trLap" type="button">Runde</button>') : '') + $t('<button class="btn stop" data-act="trStop" type="button">Beenden</button>') + '</div>' +
    (HRM.state !== 'on' ? '<button class="btn block" data-act="hrmOn" type="button" style="margin-top:10px;background:var(--fog)">' + (S.settings.hrm ? $t('Pulsgurt verbinden: ') + esc(S.settings.hrm.name) : $t('Pulsgurt suchen')) + '</button>' : '') + '</div>'; }
/* nach dem Rendern: Karte aufbauen, Zahlen füllen */
function trAfterRender() { if (route.name === 'track' && TR.active) { if (TR.gps && trOpts().map) trMapInit(); else TR.map = null; trLive(true); } else { if (TR.map) { try { TR.map.remove(); } catch (e) {} TR.map = null; } } trBar(); }

/* ---------- Beenden und Speichern ---------- */
function trStopSheet() { const sec = movingSec(); const t = ACT_MAP[TR.type]; const hrs = TR.hr.map(h => h[1]);
  openSheet(sheetHead($t('Training beenden')) + '<div class="fin-tiles">' + '<div class="fin-tile"><b>' + fmtClock(sec) + '</b><span>' + $t('Zeit') + '</span></div>' +
    (TR.dist > 20 ? '<div class="fin-tile"><b>' + fmt(TR.dist / 1000, 2) + '</b><span>km</span></div><div class="fin-tile"><b>' + speedTxt(TR.type, TR.dist / Math.max(1, sec)) + '</b><span>' + (t.m === 'speed' ? $t('Ø km/h') : $t('Ø ') + speedUnit(TR.type)) + '</span></div>' : '') +
    (hrs.length ? '<div class="fin-tile"><b>' + Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) + '</b><span>' + $t('Ø Puls') + '</span></div>' : '') + '</div>' +
    '<div class="fields" style="margin-top:12px">' + (!TR.gps && t.dist ? $t('<div class="field"><label for="tr-mdist">Strecke (km)</label><input id="tr-mdist" type="number" inputmode="decimal" step="any" placeholder="z. B. 5"></div>') : '') +
    $t('<div class="field"><label for="tr-rpe">Wie hart? RPE 1–10</label><input id="tr-rpe" type="number" inputmode="decimal" step="0.5" min="1" max="10" placeholder="z. B. 6"></div>') +
    $t('<div class="field" style="flex:1 1 100%"><label for="tr-title">Titel (optional)</label><input id="tr-title" type="text" placeholder="') + esc(t.name) + '"></div></div>' +
    $t('<button class="btn brand block" data-act="trSave" type="button" style="margin-top:14px">Speichern</button>') +
    $t('<div class="row" style="margin-top:8px"><button class="btn grow" data-act="closeSheet" type="button">Weiter trainieren</button><button class="btn grow" data-act="trDiscard" type="button">Verwerfen</button></div>')); }
async function trSave() { if (!TR.active) return; const md = document.getElementById('tr-mdist'), rp = document.getElementById('tr-rpe'), ti = document.getElementById('tr-title');
  if (!TR.paused) TR.runMs += Date.now() - TR.resumeAt; TR.paused = 'manual'; const end = Date.now(); const sec = TR.runMs / 1000; clearInterval(TR_TICK.iv); await gpsStop();
  const t = ACT_MAP[TR.type]; const mdist = md ? num(md.value) : null; const distKm = TR.dist > 20 ? TR.dist / 1000 : mdist; const rpe = rp ? num(rp.value) : null;
  const hrs = TR.hr.map(h => h[1]); const avgHr = hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null; const maxHr = hrs.length ? Math.max(...hrs) : null;
  const thin = TR.pts.filter((p, i) => i === 0 || i === TR.pts.length - 1 || i % Math.max(1, Math.ceil(TR.pts.length / 4000)) === 0);
  const a = { id: uid(), key: 'gps:' + TR.startAt, type: TR.type, title: ti && ti.value.trim() ? ti.value.trim() : null, date: iso(new Date(TR.startAt)), week: TR.ctx ? TR.ctx.w : curWeek(), dur: Math.max(1, Math.round(sec / 60)),
    dist: distKm != null ? Math.round(distKm * 100) / 100 : null, kcal: kcalOf(TR.type, sec), avgHr, maxHr, rpe: rpe != null ? String(rpe) : '', src: 'gps', start: TR.startAt, end,
    route: thin.length > 1 ? encPoly(thin) : null, routeT: thin.length > 1 ? thin.map(p => Math.round((p[2] - TR.startAt) / 1000)) : null, elev: Math.round(TR.elevUp) || null, splits: TR.splits, laps: TR.laps.map(l => ({ n: l.n, sec: Math.round(l.lsec), dist: Math.round(l.ldist) })), moving: Math.round(sec) };
  if (TR.ctx) { const s = sess(TR.ctx.w, TR.ctx.k); a.countsAs = TR.ctx.k; s.cardio = Object.assign(s.cardio || {}, { dur: String(a.dur), avg: avgHr ? String(avgHr) : '', max: maxHr ? String(maxHr) : '', perf: a.dist ? fmt(a.dist, 2) + ' km' : '', rpe: a.rpe }); markStarted(TR.ctx.w, TR.ctx.k); }
  S.activities.push(a);
  if (TR.hr.length > 5) { const raw = TR.hr.map(h => [(h[0] - TR.startAt) / 1000, h[1]]); S.hrTraces[a.id] = { start: TR.startAt, end, pts: downsample(raw), src: 'live' }; }
  S.settings.trLast = TR.type; const full = TR; TR = { active: false }; try { localStorage.removeItem(TR_KEY); } catch (e) {} save(); closeSheet(); trBar();
  say($t('Training gespeichert.')); location.hash = '#frei/' + a.id;
  if (trOpts().hcw) hcWriteWorkout(a, full); }
async function hcWriteWorkout(a, full) { const P = NP('HbHealth'); if (!P) return;
  try { let st = await P.status(); if (!st.available) return; if (!st.session) { if (S.healthMeta.writeAsked) return; S.healthMeta.writeAsked = true; save(); st = await P.requestWrite(); if (!st.session) return; }
    const route = (full.pts || []).filter((p, i, arr) => i % Math.max(1, Math.ceil(arr.length / 3000)) === 0).map(p => [p[0], p[1], p[2], p[3], p[4]]);
    const hr = (full.hr || []).filter((p, i, arr) => i % Math.max(1, Math.ceil(arr.length / 3000)) === 0);
    const r = await P.writeWorkout({ type: (ACT_MAP[a.type] || {}).hc || 'other', start: a.start, end: a.end, title: a.title || ACT_MAP[a.type].name, distance: a.dist ? a.dist * 1000 : 0, kcal: a.kcal || 0, route, hr });
    if (r && r.ok) { a.hcWritten = true; save(); toast($t('Auch in Health Connect gespeichert')); } }
  catch (e) { console.warn('hc write', e); } }
function trDiscard() { clearInterval(TR_TICK.iv); gpsStop(); TR = { active: false }; try { localStorage.removeItem(TR_KEY); } catch (e) {} closeSheet(); trBar(); location.hash = '#training'; }

/* ---------- Ansicht eines aufgezeichneten Trainings ---------- */
function routeCard(a) { if (!a.route) return ''; return '<div class="card"><div id="rmap-' + a.id + '" class="trk-map" data-route="' + a.id + '"></div>' +
  '<div class="row" style="margin-top:10px">' + (a.elev ? '<span class="tag">↑ ' + a.elev + ' m</span>' : '') + (a.hcWritten ? $t('<span class="tag">in Health Connect</span>') : '') + '<div class="grow"></div><button class="btn sm" data-act="gpx" data-id="' + a.id + $t('" type="button">GPX exportieren</button></div></div>'); }
function splitsCard(a) { const sp = a.splits || []; if (!sp.length && !(a.laps || []).length) return ''; const t = a.type;
  const rows = sp.map(s => '<tr><td>' + fmt(s.n * s.len / 1000, s.len === 1000 ? 0 : 1) + '</td><td>' + fmtClock(s.sec) + '</td><td>' + speedTxt(t, s.len / Math.max(1, s.sec)) + '</td><td>' + (s.hr || '–') + '</td></tr>').join('');
  const laps = (a.laps || []).map(l => '<tr><td>' + $t('Runde ') + l.n + '</td><td>' + fmtClock(l.sec) + '</td><td>' + (l.dist > 50 ? fmt(l.dist / 1000, 2) + ' km' : '–') + '</td><td></td></tr>').join('');
  return $t('<div class="card"><h2>Abschnitte</h2><table class="tbl small" style="width:100%;margin-top:8px"><tr><th>km</th><th>Zeit</th><th>') + (ACT_MAP[t] && ACT_MAP[t].m === 'speed' ? $t('km/h') : $t('Pace')) + $t('</th><th>Puls</th></tr>') + rows + laps + '</table></div>'; }
function routeMapsInit() { document.querySelectorAll('[data-route]').forEach(el => { if (el._map || !window.L) return; const a = findAct(el.dataset.route); if (!a || !a.route) return; const ll = decPoly(a.route); if (ll.length < 2) return;
  const m = L.map(el, { zoomControl: false, dragging: true, scrollWheelZoom: false }); L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTR }).addTo(m); const line = L.polyline(ll, { color: '#ff5406', weight: 4 }).addTo(m);
  L.circleMarker(ll[0], { radius: 6, color: '#fff', weight: 2, fillColor: '#00b33f', fillOpacity: 1 }).addTo(m); L.circleMarker(ll[ll.length - 1], { radius: 6, color: '#fff', weight: 2, fillColor: '#ff3400', fillOpacity: 1 }).addTo(m);
  m.fitBounds(line.getBounds(), { padding: [20, 20] }); el._map = m; }); }
function gpxOf(a) { const ll = decPoly(a.route || ''); const ts = a.routeT || []; const t0 = a.start || Date.parse(a.date);
  const pts = ll.map((p, i) => '<trkpt lat="' + p[0] + '" lon="' + p[1] + '">' + (ts[i] != null ? '<time>' + new Date(t0 + ts[i] * 1000).toISOString() + '</time>' : '') + '</trkpt>').join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Hybridblock" xmlns="http://www.topografix.com/GPX/1/1"><metadata><time>' + new Date(t0).toISOString() + '</time></metadata><trk><name>' + esc(a.title || ACT_MAP[a.type].name) + '</name><type>' + ((ACT_MAP[a.type] || {}).hc || 'other') + '</type><trkseg>\n' + pts + '\n</trkseg></trk></gpx>'; }
async function gpxExport(id) { const a = findAct(id); if (!a || !a.route) return; const xml = gpxOf(a); const name = 'hybridblock-' + a.date + '-' + a.type + '.gpx';
  const FS = NP('Filesystem'), SH = NP('Share');
  if (FS && SH) { try { const r = await FS.writeFile({ path: name, data: xml, directory: 'CACHE', encoding: 'utf8' }); await SH.share({ title: name, url: r.uri, dialogTitle: $t('GPX teilen') }); return; } catch (e) { if (/cancel/i.test(String(e && e.message))) return; } }
  const blob = new Blob([xml], { type: 'application/gpx+xml' }); const u = URL.createObjectURL(blob); const l = document.createElement('a'); l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
/* viewFree um Karte und Abschnitte erweitern */
const _viewFreeBase = viewFree;
viewFree = function (id) { const html = _viewFreeBase(id); const a = findAct(id); if (!a || (!a.route && !(a.splits || []).length)) return html; const extra = routeCard(a) + splitsCard(a); const i = html.indexOf('<div class="stack">'); return i < 0 ? html + extra : html.slice(0, i + 19) + extra + html.slice(i + 19); };

/* ---------- Unterbrochene Aufzeichnung wiederherstellen ---------- */
function trRecover() { let snap = null; try { snap = JSON.parse(localStorage.getItem(TR_KEY) || 'null'); } catch (e) {} if (!snap || !snap.active || TR.active) return;
  if (Date.now() - (snap.savedAt || snap.startAt) > 12 * 3600e3) { try { localStorage.removeItem(TR_KEY); } catch (e) {} return; }
  openSheet(sheetHead($t('Training unterbrochen')) + '<p>' + esc(ACT_MAP[snap.type].name) + ' · ' + fmtClock(snap.runMs / 1000 + (snap.paused ? 0 : ((snap.savedAt || Date.now()) - snap.resumeAt) / 1000)) + (snap.dist > 20 ? ' · ' + fmt(snap.dist / 1000, 2) + ' km' : '') + $t('. Die App wurde während der Aufzeichnung geschlossen.</p>') +
    $t('<div class="row" style="margin-top:14px"><button class="btn brand grow" data-act="trRecoverGo" type="button">Fortsetzen</button><button class="btn grow" data-act="trRecoverSave" type="button">Beenden und speichern</button></div><button class="btn block" data-act="trDiscard" type="button" style="margin-top:8px">Verwerfen</button>')); }
async function trRecoverGo(andSave) { let snap = null; try { snap = JSON.parse(localStorage.getItem(TR_KEY) || 'null'); } catch (e) {} if (!snap) return; closeSheet();
  TR = snap; if (!TR.paused) { TR.runMs += (TR.savedAt || Date.now()) - TR.resumeAt; TR.paused = 'manual'; } TR.lastPt = null; TR.recent = []; TR.map = null;
  if (andSave) { TR.resumeAt = Date.now(); location.hash = '#track'; setTimeout(trStopSheet, 200); return; }
  TR.paused = false; TR.resumeAt = Date.now(); if (TR.gps) await gpsStart(); clearInterval(TR_TICK.iv); TR_TICK.iv = setInterval(trTick, 1000); if (S.settings.hrm) hrmConnect(false); location.hash = '#track'; render(); }

/* ---------- Ereignisse ---------- */
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  switch (b.dataset.act) {
    case 'trOpen': ui.trCtx = b.dataset.w ? { w: +b.dataset.w, k: b.dataset.k } : null; ui.trType = b.dataset.type || (ui.trCtx ? (isHiit(ui.trCtx.k) ? 'joggen' : S.settings.trLast || 'joggen') : null); ui.trZone = null; ui.trIntervals = null; closeSheet(); location.hash = '#track'; break;
    case 'trStart': { const sel = document.getElementById('tr-type'); trStart(sel ? sel.value : 'joggen', ui.trCtx); break; }
    case 'trPause': trPause(false); break;
    case 'trResume': trResume(); break;
    case 'trLap': trLap(); break;
    case 'trStop': trStopSheet(); break;
    case 'trSave': trSave(); break;
    case 'trDiscard': if (b.dataset.sure || !TR.active || TR.dist < 200 && movingSec() < 120) trDiscard(); else { b.dataset.sure = '1'; b.textContent = $t('Wirklich verwerfen?'); } break;
    case 'trRecoverGo': trRecoverGo(false); break;
    case 'trRecoverSave': trRecoverGo(true); break;
    case 'hrmOn': hrmConnect(false); break;
    case 'hrmNew': hrmConnect(true); break;
    case 'hrmOff': hrmDisconnect(false); break;
    case 'hrmForget': hrmDisconnect(true); break;
    case 'gpx': gpxExport(b.dataset.id); break;
    case 'trOpt': { const o = trOpts(); o[b.dataset.k] = !o[b.dataset.k]; save(); render(); break; }
  } });
document.addEventListener('change', e => { const t = e.target;
  if (t.dataset.trtype) { ui.trType = t.value; render(); return; }
  if (t.dataset.trzone) { ui.trZone = t.value === '' ? null : +t.value; return; }
  if (t.dataset.triv) { ui.trIntervals = t.value || null; return; }
});
const _renderBase = render;
render = function (top) { _renderBase(top); try { trAfterRender(); routeMapsInit(); } catch (e) { console.warn(e); } };
document.addEventListener('visibilitychange', () => { if (!document.hidden && TR.active) trLive(true); });
setTimeout(trRecover, 1500);
