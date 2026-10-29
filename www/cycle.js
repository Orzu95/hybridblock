/* ======================= ZYKLUS (nur bei Geschlecht weiblich, freiwillig, eigene Einwilligung) =======================
   Steuerung nach Beschwerden statt nach Kalender: Studien zeigen über die Zyklusphasen nur triviale Leistungsunterschiede
   (McNulty 2020, Colenso-Semple 2023). Darum: an Tagen mit starken Beschwerden leichter oder Ersatztraining, sonst normal.
   Bleibt die Periode über 90 Tage aus, Hinweis auf möglichen Energiemangel (RED-S) und kein weiteres Kaloriendefizit. */
const isFemale = () => S.settings.sex === 'w';
const cyc = () => (S.cycle = S.cycle || { days: {}, status: 'normal' });
const cycOn = () => isFemale() && !!S.meta.cycleConsent;
const dDiff = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const cycDay = d => (S.cycle && S.cycle.days && S.cycle.days[d]) || {};
const FLOW_OPTS = () => [[0, $t('keine')], [1, $t('leicht')], [2, $t('mittel')], [3, $t('stark')]];
const CRAMP_OPTS = () => [[0, $t('keine')], [1, $t('leicht')], [2, $t('stark')]];
const CYC_STATUS = () => [['normal', $t('natürlicher Zyklus')], ['hormonal', $t('hormonelle Verhütung')], ['pregnant', $t('schwanger oder stillend')], ['meno', $t('Wechseljahre')]];
/* Periodenbeginn: erster Blutungstag nach mindestens 3 Tagen ohne */
function periodStarts() { const days = cyc().days; const ds = Object.keys(days).filter(d => (days[d].flow || 0) > 0).sort(); const out = []; let prev = null;
  ds.forEach(d => { if (!prev || dDiff(prev, d) > 3) out.push(d); prev = d; }); return out; }
function cycleInfo(d) { d = d || today(); const st = periodStarts().filter(x => x <= d); if (!st.length) return null; const last = st[st.length - 1];
  const lens = []; for (let i = 1; i < st.length; i++) { const L = dDiff(st[i - 1], st[i]); if (L >= 21 && L <= 45) lens.push(L); }
  const mean = lens.length ? Math.round(lens.slice(-6).reduce((a, b) => a + b, 0) / Math.min(6, lens.length)) : null;
  return { last, cd: dDiff(last, d) + 1, mean, next: mean ? addDays(last, mean) : null, starts: st }; }
/* Gelerntes Muster: Wie ging es an diesem Zyklustag in früheren Zyklen? Braucht mindestens 2 Zyklen. */
function cyclePattern(cd) { const st = periodStarts(); if (st.length < 3 || cd < 1 || cd > 7) return null; let n = 0, cr = 0, feel = 0, nf = 0;
  st.slice(0, -1).forEach(s => { const d = addDays(s, cd - 1); const e = cycDay(d); if (e.cramps != null) { n++; cr += e.cramps; } const f = num((S.daily[d] || {}).feel); if (f != null) { nf++; feel += f; } });
  if (n < 2 && nf < 2) return null; const mc = n ? cr / n : 0, mf = nf ? feel / nf : 3; return { bad: mc >= 1.3 || mf <= 2.2, mc, mf, n: Math.max(n, nf) }; }
const cycleBad = d => { if (!cycOn()) return false; const e = cycDay(d); return (e.cramps || 0) >= 2 || ((e.flow || 0) >= 3 && (e.cramps || 0) >= 1); };
/* Ausbleiben über 90 Tage, nur bei natürlichem Zyklus */
function amenorrhea() { if (!cycOn() || cyc().status !== 'normal') return null; const st = periodStarts(); if (!st.length) return null; const days = dDiff(st[st.length - 1], today()); return days > 90 ? { days, last: st[st.length - 1] } : null; }

/* ---------- Einbindung in Bereitschaft, Session-Hinweise, Ernährung ---------- */
function cycleComp(d) { if (!cycOn()) return []; const e = cycDay(d); if (!(e.flow > 0 || e.cramps > 0)) return [];
  const v = clamp(100 - (e.cramps || 0) * 35 - ((e.flow || 0) >= 3 ? 15 : 0), 0, 100);
  return [{ k: $t('Zyklus'), v, w: .25, txt: [e.flow > 0 ? $t('Periode: ') + FLOW_OPTS()[e.flow][1] : '', e.cramps > 0 ? $t('Krämpfe: ') + CRAMP_OPTS()[e.cramps][1] : ''].filter(Boolean).join(', ') }]; }
const _readinessBase = readiness;
readiness = function (w, k) { const r = _readinessBase(w, k); const s = peekSess(w, k); const d = (s && s.date) || today(); if (cycleBad(d)) { r.rpeShift = -1; r.cycleBad = true; } return r; };
function cycleFlags(w, k) { const s = peekSess(w, k); const d = (s && s.date) || today(); if (!cycleBad(d)) return '';
  return note('amber', $t('<b>Starke Regelbeschwerden heute.</b> Die RPE-Ziele sind schon eine Stufe leichter. Schwere Kniebeugen und Kreuzheben kannst du unter „Varianten“ gegen eine Maschine tauschen. Oder heute Ersatz und die Einheit an einem anderen Tag nachholen.') +
    '<div class="row" style="margin-top:8px;gap:8px"><button class="btn sm brand" data-act="trOpen" data-type="gehen" type="button">' + $t('Lockeres Cardio') + '</button><button class="btn sm" data-act="pickAct" data-type="mobility" type="button">' + $t('Mobility') + '</button></div>'); }
const _doCheckinBase = doCheckin;
doCheckin = function () { const c = _doCheckinBase(); const am = amenorrhea(); if (am && c.kcal < c.tdee) { c.kcal = Math.round(c.tdee / 50) * 50; c.c = Math.max(0, Math.round((c.kcal - 4 * c.p - 9 * c.f) / 4)); c.hold = 'cycle'; save(); setTimeout(() => toast($t('Kein Defizit, solange die Periode ausbleibt')), 300); } return c; };
function redsCard() { const am = amenorrhea(); if (!am) return '';
  return note('red', $t('<b>Deine Periode ist seit ') + am.days + $t(' Tagen ausgeblieben.</b> Bei viel Training und Kaloriendefizit kann das ein Zeichen für Energiemangel sein (RED-S). Das schadet auf Dauer Knochen, Hormonen und Leistung. Bitte ärztlich abklären lassen. Die App senkt deine Kalorien bis dahin nicht weiter.') + '<br><button class="btn sm" data-act="cycStatusSheet" type="button" style="margin-top:8px">' + $t('Anderer Grund?') + '</button>'); }

/* ---------- Check-in auf „Heute“ ---------- */
function cycleFields(d) { if (!isFemale()) return '';
  if (!cycOn()) return d === today() ? '<div class="field" style="flex:1 1 100%"><button class="btn sm" data-act="cycConsent" type="button">' + $t('Zyklus berücksichtigen') + '</button></div>' : '';
  const e = cycDay(d); const sel = (f, lab, opts) => '<div class="field"><label for="cy-' + f + '">' + lab + '</label><select id="cy-' + f + '" data-cyc="' + f + '" data-d="' + d + '"><option value="">–</option>' + opts.map(o => '<option value="' + o[0] + '"' + (e[f] != null && String(e[f]) === String(o[0]) ? $t(' selected') : '') + '>' + o[1] + '</option>').join('') + '</select></div>';
  const info = cycleInfo(d); const pat = info && (e.flow || info.cd <= 7) ? cyclePattern(info.cd) : null;
  let hint = ''; if (info && info.next) { const until = dDiff(d, info.next); if (until >= 0 && until <= 2) { const p1 = cyclePattern(1); hint = $t('Periode erwartet in etwa ') + until + $t(' Tagen.') + (p1 && p1.bad ? ' ' + $t('An Tag 1 ging es dir bisher meist schlechter, plane dafür ruhig etwas Leichtes ein.') : ''); } }
  if (pat && pat.bad && !(e.cramps >= 2)) hint = $t('Zyklustag ') + info.cd + $t(': In früheren Zyklen war dieser Tag für dich eher schwer. Wenn es heute auch so ist, trag es ein, dann passt die App das Training an.');
  return sel('flow', $t('Periode'), FLOW_OPTS()) + sel('cramps', $t('Krämpfe / Beschwerden'), CRAMP_OPTS()) + (hint ? '<p class="small muted" style="flex:1 1 100%;margin:0">' + esc(hint) + '</p>' : '') + (info ? '<p class="small muted" style="flex:1 1 100%;margin:0">' + $t('Zyklustag ') + info.cd + (info.mean ? $t(' · Ø Zyklus ') + info.mean + $t(' Tage') : '') + '</p>' : ''); }
const _readinessCardBase = readinessCard;
readinessCard = function (d) { let h = _readinessCardBase(d); const cf = cycleFields(d); if (cf) { const i = h.lastIndexOf('</div></div>'); if (i > 0) h = h.slice(0, i) + cf + h.slice(i); } return (d === today() ? redsCard() : '') + h; };

/* ---------- Einstellungen ---------- */
function cycleCard() { if (VIEW || !isFemale()) return ''; const c = cyc();
  if (!cycOn()) return $t('<div class="card"><h2>Zyklus</h2><p class="small">Freiwillig: Trag an Tagen mit Periode deine Beschwerden ein. Bei starken Beschwerden schlägt die App leichteres Training oder Ersatz vor, sonst trainierst du ganz normal.</p><div class="row" style="margin-top:12px"><button class="btn brand" data-act="cycConsent" type="button">Aktivieren</button></div></div>');
  const sel = '<select id="cy-status" data-cycstatus="1">' + CYC_STATUS().map(o => '<option value="' + o[0] + '"' + (c.status === o[0] ? $t(' selected') : '') + '>' + o[1] + '</option>').join('') + '</select>';
  const info = cycleInfo(); const NPh = typeof NP === 'function' ? NP('HbHealth') : null;
  return $t('<div class="card" id="cyccard"><h2>Zyklus</h2>') + (info ? '<p class="small">' + $t('Letzte Periode: ') + fmtDay(info.last) + (info.mean ? $t(' · Ø Zyklus ') + info.mean + $t(' Tage') + (info.next ? $t(' · nächste etwa ') + fmtDay(info.next) : '') : '') + '</p>' : $t('<p class="small muted">Noch keine Periode eingetragen. Eintragen geht auf „Heute“ in der Bereitschaft.</p>')) +
    $t('<div class="fields" style="margin-top:10px"><div class="field" style="flex:1 1 100%"><label for="cy-status">Situation</label>') + sel + '</div></div>' +
    (hasCoach() ? '<div class="row" style="margin-top:10px"><button class="trtog' + (S.settings.cycleShare ? ' on' : '') + '" data-act="cycShare" type="button">' + (S.settings.cycleShare ? '✓ ' : '') + $t('Mit meinem Coach teilen') + '</button></div><p class="small muted">' + (S.settings.cycleShare ? $t('Dein Coach sieht deine Zyklusdaten.') : $t('Dein Coach sieht deine Zyklusdaten nicht. Er sieht nur, dass das Training angepasst wurde.')) + '</p>' : '') +
    (NPh ? $t('<div class="row" style="margin-top:10px"><button class="btn" data-act="cycHc" type="button">Aus Health Connect übernehmen</button></div><p class="small muted">Liest Periode und Blutungsstärke, z. B. aus Samsung Health, Fitbit, Garmin oder Zyklus-Apps, die dort schreiben.</p>') : '') +
    $t('<div class="row" style="margin-top:10px"><button class="btn danger" data-act="cycOff" type="button">Zyklusdaten löschen und ausschalten</button></div></div>'); }
const _accountCardCyc = accountCard;
accountCard = function () { return _accountCardCyc() + cycleCard(); };

/* ---------- Einwilligung ---------- */
function cycConsentSheet() { openSheet(sheetHead($t('Zyklus berücksichtigen')) + $t('<p>Zyklusdaten sind besonders persönlich. Dafür brauchen wir eine eigene Einwilligung.</p><ul class="rules small" style="margin-top:10px"><li>Nur damit die App dein Training an Beschwerden anpasst und auf ein Ausbleiben der Periode hinweist.</li><li>Gespeichert auf deinem Gerät und, mit Konto, in einem eigenen Bereich, den nur du lesen kannst.</li><li>Dein Coach sieht sie nur, wenn du das ausdrücklich einschaltest.</li><li>Jederzeit löschbar unter Einstellungen → Zyklus.</li></ul>') +
  $t('<button class="btn brand block" data-act="cycConsentYes" type="button" style="margin-top:14px">Ich willige ein</button><button class="btn block" data-act="closeSheet" type="button" style="margin-top:8px">Nicht jetzt</button>')); }
function cycStatusSheet() { openSheet(sheetHead($t('Situation')) + $t('<p class="small">Bei hormoneller Verhütung (z. B. Hormonspirale), Schwangerschaft, Stillzeit oder in den Wechseljahren ist eine ausbleibende Periode normal. Dann kommt kein Warnhinweis.</p>') +
  '<div class="menu" style="margin-top:12px">' + CYC_STATUS().map(o => '<button class="act-pick" data-act="cycSetStatus" data-v="' + o[0] + '" type="button"><span class="grow">' + o[1] + '</span></button>').join('') + '</div>'); }

/* ---------- Health Connect ---------- */
async function cycHcImport(quiet) { const P = typeof NP === 'function' ? NP('HbHealth') : null; if (!P || !cycOn()) return;
  try { let r = await P.readCycle({ start: Date.now() - 400 * 864e5, end: Date.now() }); if (!r.granted && !quiet) { await P.requestCycle(); r = await P.readCycle({ start: Date.now() - 400 * 864e5, end: Date.now() }); }
    const c = cyc(); let n = 0;
    (r.flows || []).forEach(f => { const d = iso(new Date(f[0])); const e = c.days[d] = c.days[d] || {}; const v = Math.max(1, Math.min(3, +f[1] || 2)); if (e.src !== 'manual' || e.flow == null) { e.flow = v; e.src = e.src || 'hc'; n++; } });
    (r.periods || []).forEach(p => { for (let t = p[0]; t < p[1]; t += 864e5) { const d = iso(new Date(t)); const e = c.days[d] = c.days[d] || {}; if (!(e.flow > 0)) { e.flow = 2; e.src = 'hc'; n++; } } });
    c.hc = true; save(); if (!quiet) { toast(n ? $t('Übernommen: ') + n + $t(' Tage') : $t('In Health Connect keine Zyklusdaten gefunden.')); render(); } }
  catch (e) { if (!quiet) toast($t('Zyklusdaten nicht lesbar: ') + ((e && e.message) || e)); } }
if (typeof hcSync === 'function') { const _hcSyncCyc = hcSync; hcSync = async function (full) { await _hcSyncCyc(full); if (cycOn() && cyc().hc) cycHcImport(true); }; }

/* ---------- Cloud: Zyklus getrennt und nur für die Person selbst ---------- */
const _cloudCopyCyc = cloudCopy;
cloudCopy = function () { const c = _cloudCopyCyc(); if (!S.settings.cycleShare) delete c.cycle; return c; };
const _adoptRemoteCyc = adoptRemote;
adoptRemote = function (remote) { const keep = S.cycle; _adoptRemoteCyc(remote); if (keep && !(remote.state && remote.state.cycle)) { S.cycle = keep; persist(); } };
async function pushPrivate() { if (!AUTH || VIEW || !S.cycle) return; try { await api('/rest/v1/private_state?on_conflict=user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ user_id: AUTH.uid, data: { cycle: S.cycle }, updated_at: new Date().toISOString() }) }); S.meta.privAt = Date.now(); persist(); } catch (e) { console.warn('private push', e); } }
async function pullPrivate() { if (!AUTH || VIEW) return false; try { const r = await api('/rest/v1/private_state?user_id=eq.' + AUTH.uid + '&select=data,updated_at'); const row = r && r[0]; if (!row || !row.data || !row.data.cycle) return false;
    const rc = row.data.cycle; const lc = cyc(); let changed = false; Object.keys(rc.days || {}).forEach(d => { if (!lc.days[d]) { lc.days[d] = rc.days[d]; changed = true; } });
    if (rc.status && (!S.meta.privAt || Date.parse(row.updated_at) > S.meta.privAt)) { if (lc.status !== rc.status) changed = true; lc.status = rc.status; lc.hc = lc.hc || rc.hc; }
    if (changed) persist(); return changed; } catch (e) { return false; } }
const _pushStateCyc = pushState;
pushState = async function () { await _pushStateCyc(); if (S.cycle && (S.meta.modAt || 0) > (S.meta.privAt || 0)) await pushPrivate(); };
const _pullAllCyc = pullAll;
pullAll = async function (opts) { const r = await _pullAllCyc(opts); if (r && !r.conflict && AUTH && !VIEW && isFemale()) { const ch = await pullPrivate(); if (ch) r.changed = true; } return r; };

/* ---------- Ereignisse ---------- */
document.addEventListener('change', e => { const t = e.target;
  if (t.dataset.cyc) { const c = cyc(); const d = t.dataset.d; const en = c.days[d] = c.days[d] || {}; if (t.value === '') delete en[t.dataset.cyc]; else en[t.dataset.cyc] = +t.value; en.src = 'manual'; if (!Object.keys(en).some(k => k !== 'src')) delete c.days[d]; save(); render(); return; }
  if (t.dataset.cycstatus) { cyc().status = t.value; save(); render(); } });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  switch (b.dataset.act) {
    case 'cycConsent': cycConsentSheet(); break;
    case 'cycConsentYes': S.meta.cycleConsent = { at: Date.now() }; cyc(); save(); closeSheet(); render(); break;
    case 'cycShare': S.settings.cycleShare = !S.settings.cycleShare; save(); render(); break;
    case 'cycHc': cycHcImport(false); break;
    case 'cycStatusSheet': cycStatusSheet(); break;
    case 'cycSetStatus': cyc().status = b.dataset.v; save(); closeSheet(); render(); break;
    case 'cycOff': if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = $t('Wirklich löschen?'); break; }
      delete S.cycle; delete S.meta.cycleConsent; S.settings.cycleShare = false; save(); if (AUTH) api('/rest/v1/private_state?user_id=eq.' + AUTH.uid, { method: 'DELETE' }).catch(() => {}); toast($t('Zyklusdaten gelöscht')); render(); break;
  } });
