/* Hybridblock – Sync-Schutz: zusammenführen statt überschreiben.
   Jeder Eintrag (Einheit, Tag, Aktivität, Check-in, Gesundheitstag …) bekommt beim Speichern einen Zeitstempel, wenn er sich geändert hat.
   Beim Sync gewinnt pro Eintrag die neuere Änderung; Löschungen werden als Stempel ohne Wert mitgeführt.
   Schlüssel: m:<sammlung>:<key> (Objekt-Sammlungen), a:<sammlung>:<id> (Listen mit id), w:<feld> (ganzes Feld), x:<meta-feld>. */
'use strict';
const SM_MAPS = ['sessions', 'days', 'health', 'body', 'exNotes', 'daily', 'swaps', 'foods', 'hrTraces'];
const SM_ARR = { activities: 'id', checkins: 'date', workouts: 'id', mealTemplates: 'id' };
const SM_LOCAL = ['syncAt', 'syncMod', 'modAt', 'planAt', 'st', 'forcePush', 'owner'];
let SMH = null;
function smHash(v) { const s = v === undefined ? '~' : JSON.stringify(v); let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36) + s.length.toString(36); }
function smEach(s, fn) { if (!s) return; Object.keys(s).forEach(top => { const v = s[top];
  if (top === 'meta') { Object.keys(v || {}).forEach(k => { if (!SM_LOCAL.includes(k)) fn('x:' + k, v[k]); }); return; }
  if (SM_MAPS.includes(top) && v && typeof v === 'object' && !Array.isArray(v)) { Object.keys(v).forEach(k => fn('m:' + top + ':' + k, v[k])); return; }
  const idf = SM_ARR[top]; if (idf && Array.isArray(v) && v.every(x => x && x[idf] != null)) { v.forEach(x => fn('a:' + top + ':' + x[idf], x)); return; }
  fn('w:' + top, v); }); }
function smHashes(s) { const o = {}; smEach(s, (k, v) => { o[k] = smHash(v); }); return o; }
function smSnap() { try { SMH = smHashes(S); } catch (e) { SMH = null; } }
function smStamp() { if (typeof VIEW !== 'undefined' && VIEW) return; const cur = smHashes(S); if (!SMH) { SMH = cur; return; } const now = Date.now(); const st = S.meta.st = S.meta.st || {};
  for (const k in cur) if (SMH[k] !== cur[k]) st[k] = now;
  for (const k in SMH) if (!(k in cur)) st[k] = now;
  /* alte Löschstempel nach 120 Tagen aufräumen */
  const old = now - 120 * 864e5; for (const k in st) if (st[k] < old && !(k in cur)) delete st[k];
  SMH = cur; }
function smGet(s, k) { const p = k.split(':'); const t = p[0];
  if (t === 'x') return (s.meta || {})[k.slice(2)];
  if (t === 'w') return s[k.slice(2)];
  const top = p[1], key = p.slice(2).join(':');
  if (t === 'm') return (s[top] || {})[key];
  if (t === 'a') { const idf = SM_ARR[top]; return (Array.isArray(s[top]) ? s[top] : []).find(x => x && String(x[idf]) === key); } }
function smSet(s, k, v) { const p = k.split(':'); const t = p[0]; const cp = v === undefined ? undefined : JSON.parse(JSON.stringify(v));
  if (t === 'x') { s.meta = s.meta || {}; if (cp === undefined) delete s.meta[k.slice(2)]; else s.meta[k.slice(2)] = cp; return; }
  if (t === 'w') { if (cp !== undefined) s[k.slice(2)] = cp; return; }
  const top = p[1], key = p.slice(2).join(':');
  if (t === 'm') { s[top] = s[top] || {}; if (cp === undefined) delete s[top][key]; else s[top][key] = cp; return; }
  if (t === 'a') { const idf = SM_ARR[top]; const arr = Array.isArray(s[top]) ? s[top] : (s[top] = []); const i = arr.findIndex(x => x && String(x[idf]) === key);
    if (cp === undefined) { if (i >= 0) arr.splice(i, 1); } else if (i >= 0) arr[i] = cp; else arr.push(cp); } }
/* Fremden Stand in S einarbeiten. Gibt zurück, ob sich lokal etwas geändert hat und ob lokal Neueres übrig bleibt. */
function smMergeIn(remoteState) { smStamp(); const R = loadState(JSON.stringify(remoteState)); const sl = S.meta.st = S.meta.st || {}, sr = (R.meta && R.meta.st) || {};
  const keys = new Set(Object.keys(sl).concat(Object.keys(sr))); smEach(S, k => keys.add(k)); smEach(R, k => keys.add(k));
  let changed = false, localNewer = false;
  keys.forEach(k => { const tl = sl[k] || 0, tr = sr[k] || 0; const vl = smGet(S, k), vr = smGet(R, k);
    if (tr > tl || (tr === tl && vl === undefined && vr !== undefined)) { if (smHash(vl) !== smHash(vr)) { smSet(S, k, vr); changed = true; } if (tr) sl[k] = tr; }
    else if (smHash(vl) !== smHash(vr)) localNewer = true; });
  if (S.activities && S.activities.sort) S.activities.sort((a, b) => (a.date || '') < (b.date || '') ? -1 : (a.date || '') > (b.date || '') ? 1 : 0);
  if (S.checkins && S.checkins.sort) S.checkins.sort((a, b) => (a.date || '') < (b.date || '') ? -1 : 1);
  if (changed) { try { applyPlan(); } catch (e) {} }
  smSnap(); return { changed, localNewer }; }
const _persistSM = persist; persist = function () { try { smStamp(); } catch (e) { console.warn('smStamp', e); } return _persistSM.apply(this, arguments); };
const _adoptRemoteSM = adoptRemote; adoptRemote = function () { const r = _adoptRemoteSM.apply(this, arguments); smSnap(); return r; };
smSnap();
/* Beim Verlassen der App ausstehenden Upload sofort senden (der Upload wartet sonst 12 s) */
document.addEventListener('visibilitychange', () => { if (document.hidden && typeof SYNC !== 'undefined' && SYNC.t && AUTH && !VIEW) { clearTimeout(SYNC.t); SYNC.t = null; pushState(); } });
