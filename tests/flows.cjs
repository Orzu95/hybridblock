/* Ablauf-Test: spielt die wichtigsten Abläufe mit echten Klicks durch (ohne Backend) und prüft, was danach gespeichert ist.
   Ergänzt tests/smoke.cjs, das nur das Anzeigen aller Ansichten prüft. Aufruf: node tests/flows.cjs */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', 'www');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0].replace(/\/$/, '/index.html')));
  fs.readFile(p, (e, buf) => {
    if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    res.end(buf);
  });
});
const fails = [];
let steps = 0;
const ok = (cond, label, info) => { steps++; if (!cond) fails.push(label + (info !== undefined ? ' → ' + JSON.stringify(info) : '')); };

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, geolocation: { latitude: 50.1, longitude: 8.6, accuracy: 5 }, permissions: ['geolocation'] });
  await ctx.route('**/*supabase.co/**', r => r.abort());
  await ctx.route(/openfoodfacts|openfreemap|exercise-dataset/, r => r.abort());
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('dialog', d => d.accept());
  const go = async h => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(350); };
  const ev = (f, a) => page.evaluate(f, a);
  const boot = async () => { await page.goto(base); await page.waitForTimeout(700); };
  await page.goto(base);
  await ev(() => { localStorage.clear(); localStorage.setItem('hb_notour', '1'); localStorage.setItem('hb_lang', 'de'); });
  await boot();
  await ev(() => { S.meta.onboarded = true; S.meta.consent = { v: 1, at: 1 }; Object.assign(S.settings, { sex: 'm', age: 31, height: 180, startWeight: 82 }); S.plan = makePlan('gk3'); applyPlan(); S.block.startedOn = today(); S.block.startAt = today(); S.settings.mode = 'rotation'; save(); });

  /* 1. Krafteinheit: jeden Satz eintragen und abhaken, Satz hinzufügen und entfernen, Einheit beenden */
  const k = await ev(() => ORDER[0]);
  await go('#training/' + (await ev(() => sKey(1, ORDER[0]))));
  const sets = await ev(() => [...document.querySelectorAll('#view [data-act=done]')].map(b => [b.dataset.slot, b.dataset.i]));
  ok(sets.length >= 6, 'Einheit zeigt Sätze', sets.length);
  const slot0 = sets[0][0];
  const n0 = sets.filter(s => s[0] === slot0).length;
  await page.click(`#view [data-act=addSet][data-slot="${slot0}"]`); await page.waitForTimeout(150);
  ok((await ev(s => document.querySelectorAll(`#view [data-act=done][data-slot="${s}"]`).length, slot0)) === n0 + 1, 'Satz hinzufügen');
  await page.click(`#view [data-act=remSet][data-slot="${slot0}"]`); await page.waitForTimeout(150);
  ok((await ev(s => document.querySelectorAll(`#view [data-act=done][data-slot="${s}"]`).length, slot0)) === n0, 'Satz entfernen');
  for (const [slot, i] of sets) {
    for (const [f, v] of [['w', '60'], ['r', '8'], ['rpe', '8']]) {
      const sel = `#s-${slot}-${i}-${f}`;
      if (await page.$(sel)) { await page.fill(sel, v); await page.dispatchEvent(sel, 'change'); }
    }
    await page.click(`#view [data-act=done][data-slot="${slot}"][data-i="${i}"]`);
    await page.waitForTimeout(40);
  }
  const logged = await ev(key => { const s = sess(1, key); return Object.values(s.logs || {}).reduce((a, l) => a + (Array.isArray(l) ? l : Array.isArray(l && l.sets) ? l.sets : []).filter(x => x && x.done).length, 0); }, k);
  ok(logged === sets.length, 'alle Sätze abgehakt und gespeichert', [logged, sets.length]);
  await ev(() => { if (typeof closeSheet === 'function') closeSheet(); });
  await page.click('#view [data-act=finSess]'); await page.waitForTimeout(500);
  const early = await page.$('#sheet:not([hidden]) [data-act=wkEarly]');
  ok(!early, 'Beenden ohne Rückfrage, wenn alles erledigt ist');
  ok(await ev(key => sessProgress(1, key).done, k), 'Einheit gilt als erledigt');
  ok(await ev(() => liftSeries(Object.keys(LIB).find(id => exHistory(id).length)).length >= 0 && Object.keys(LIB).some(id => exHistory(id).length), 'x'), 'Übungsverlauf enthält die Einheit');
  await ev(() => { if (typeof closeSheet === 'function') closeSheet(); });

  /* 2. Neu laden: alles noch da */
  await ev(() => new Promise(r => setTimeout(r, 400)));
  await boot();
  ok(await ev(key => sessProgress(1, key).done, k), 'nach Neuladen: Einheit weiter erledigt');
  await go('#heute');
  ok(await ev(() => !!document.getElementById('tscard')), 'Startseite zeigt den Tagesvorschlag');

  /* 3. Essen: Schnell-Eintrag, Wasser, Gewicht */
  await go('#essen');
  const kc0 = await ev(() => dayObj(today()).entries.length);
  await page.click('#view [data-act=add]'); await page.waitForTimeout(400);
  ok(!!(await page.$('#sheet:not([hidden]) [data-act=nrQuick]')), 'Lebensmittel-Auswahl öffnet sich');
  await page.click('#sheet [data-act=nrQuick]'); await page.waitForTimeout(300);
  const d1 = await ev(() => { const o = dayObj(today()); return { n: o.entries.length, kcal: dayTotals(today()).kcal }; });
  ok(d1.n === kc0 + 1 && d1.kcal > 0, 'Schnell-Eintrag landet im Tagebuch', d1);
  await ev(() => closeSheet());
  await page.click('#view [data-act=water]'); await page.waitForTimeout(150);
  ok(await ev(() => (dayObj(today()).water || 0) > 0), 'Wasser gezählt');
  await page.click('#view [data-act=nrWeight]'); await page.waitForTimeout(300);
  const wIn = await page.$('#sheet:not([hidden]) input[type=number]');
  ok(!!wIn, 'Gewichts-Eingabe öffnet sich');
  if (wIn) { await wIn.fill('81.4'); await wIn.dispatchEvent('change'); const b = await page.$('#sheet:not([hidden]) .btn.brand'); if (b) await b.click(); await page.waitForTimeout(250); }
  ok(await ev(() => Math.abs((num(dayObj(today()).weight) || 0) - 81.4) < 0.01), 'Gewicht gespeichert', await ev(() => dayObj(today()).weight));
  await ev(() => closeSheet());

  /* 4. Freie Aktivität anlegen */
  await go('#training');
  const a0 = await ev(() => S.activities.length);
  await page.click('#view [data-act=newAct]'); await page.waitForTimeout(300);
  await page.click('#sheet [data-act=pickAct]'); await page.waitForTimeout(400);
  ok((await ev(() => S.activities.length)) === a0 + 1, 'Aktivität angelegt');
  ok(/^#frei\//.test(await ev(() => location.hash)), 'Aktivität öffnet sich', await ev(() => location.hash));
  ok(!(await page.$('#view [data-view-error]')), 'Aktivitäts-Ansicht ohne Fehlerkarte');

  /* 5. GPS-Aufzeichnung: starten, bewegen, beenden, speichern */
  await ev(() => closeSheet());
  await go('#track');
  const a1 = await ev(() => S.activities.length);
  await page.click('[data-act=trStart]'); await page.waitForTimeout(800);
  for (let i = 1; i <= 6; i++) { await ctx.setGeolocation({ latitude: 50.1 + i * 0.0004, longitude: 8.6, accuracy: 5 }); await page.waitForTimeout(700); }
  ok(!!(await page.$('[data-act=trStop]')), 'Aufzeichnung läuft');
  await page.click('[data-act=trStop]'); await page.waitForTimeout(600);
  for (let i = 0; i < 3 && (await ev(() => S.activities.length)) === a1; i++) {
    const b = (await page.$('#sheet:not([hidden]) [data-act=trSave]')) || (await page.$('[data-act=trSave]')) || (await page.$('#sheet:not([hidden]) .btn.brand'));
    if (!b) break; await b.click(); await page.waitForTimeout(700);
  }
  const tr = await ev(n => { const a = S.activities[S.activities.length - 1]; return { n: S.activities.length - n, dist: a && a.dist, pts: a && a.route ? a.route.length : 0 }; }, a1);
  ok(tr.n === 1, 'GPS-Lauf gespeichert', tr);
  await ev(() => closeSheet());

  /* 6. Plan wechseln über die Bibliothek */
  await go('#library/bedrock');
  ok(!!(await page.$('#view [data-act=libUse]')), 'Plan-Seite zeigt „Plan starten“');
  await page.click('#view [data-act=libUse]'); await page.waitForTimeout(500);
  ok(!!(await page.$('#view [data-act=libUseYes]')), 'Rückfrage vor dem Planwechsel erscheint');
  if (await page.$('#view [data-act=libUseYes]')) { await page.click('#view [data-act=libUseYes]'); await page.waitForTimeout(600); }
  for (let i = 0; i < 4 && (await ev(() => S.plan.tpl)) !== 'bedrock'; i++) { const b = await page.$('#sheet:not([hidden]) .btn.brand'); if (!b) break; await b.click(); await page.waitForTimeout(500); }
  ok((await ev(() => S.plan.tpl)) === 'bedrock', 'Plan gewechselt', await ev(() => S.plan.tpl));
  await ev(() => closeSheet());
  await go('#training');
  ok(!(await page.$('#view [data-view-error]')) && (await ev(() => ORDER.length)) > 0, 'Training mit neuem Plan');

  /* 7. Konto und Sync mit nachgestelltem Server: speichern lädt hoch, Coach speichert Plan, Abmelden */
  /* Uhr-Einheit + App-Einheit zusammenführen (freier Modus auf der Uhr) */
  const wb = await ev(() => {
    const d = addDays(today(), -2), base = parseISO(d).getTime() + 18 * 36e5;
    const gk = GYM()[GYM().length - 1], ck = ORDER.find(k => !isGym(k));
    const gs = sess(2, gk); gs.date = d;
    const slot = planFor(2, gk)[0].slot;
    gs.logs[slot] = { sets: [{ w: '60', r: '8', done: true, t: base + 10 * 6e4 }, { w: '60', r: '8', done: true, t: base + 70 * 6e4 }] };
    const g = { id: 'wbg', key: 'hc:wbg', type: 'sonst', date: d, week: curWeek(), dur: 82, kcal: 610, src: 'hc', start: base, end: base + 82 * 6e4 };
    S.hrTraces.wbg = { start: base, end: base + 82 * 6e4, pts: [[0, 100], [60, 140]], src: 'hc' };
    let c = null;
    if (ck) {
      const cs = sess(2, ck); cs.date = d; cs.timerStart = base - 3 * 36e5; cs.timerDur = 25 * 60; cs.cardio = { dur: '25' };
      c = { id: 'wbc', key: 'hc:wbc', type: 'laufband', date: d, week: curWeek(), dur: 31, kcal: 300, src: 'hc', avgHr: 162, start: base - 3 * 36e5 - 3 * 6e4, end: base - 3 * 36e5 + 28 * 6e4 };
    }
    const far = { id: 'wbx', key: 'hc:wbx', type: 'joggen', date: d, week: curWeek(), dur: 40, dist: 7, src: 'hc', start: base - 9 * 36e5, end: base - 9 * 36e5 + 40 * 6e4 };
    S.activities.push(g, far); if (c) S.activities.push(c);
    save(); WB.at = 0; render();
    return { gk, ck, d };
  });
  await page.waitForTimeout(300);
  const r1 = await ev(o => ({ gw: peekSess(2, o.gk).watch, gAct: S.activities.some(a => a.id === 'wbg'), tr: !!S.hrTraces[sKey(2, o.gk)], c: S.activities.find(a => a.id === 'wbc'), far: S.activities.find(a => a.id === 'wbx') }), wb);
  ok(r1.gw && r1.gw.dur === 82 && r1.gw.kcal === 610 && !r1.gAct && r1.tr, 'freie Uhr-Einheit hängt an der Gym-Einheit', r1.gw);
  if (wb.ck) ok(r1.c && r1.c.countsAs === wb.ck, 'Laufband von der Uhr zählt als Intervall-Einheit', r1.c);
  ok(r1.far && !r1.far.countsAs, 'Lauf zu anderer Uhrzeit bleibt eigene Einheit');
  ok((await ev(d => document.querySelectorAll('#view').length && S.activities.filter(a => a.date === d && !a.countsAs).length, wb.d)) === 1, 'nur noch eine freie Aktivität am Tag');
  await go('#training/' + 'w2-' + wb.gk); await page.waitForTimeout(250);
  const hasSplit = await ev(() => !!document.querySelector('[data-act=wbSplit]'));
  ok(hasSplit, 'Einheit zeigt „Uhr-Daten trennen“');
  if (hasSplit) {
    await ev(() => document.querySelector('[data-act=wbSplit]').click()); await page.waitForTimeout(300);
    const r2 = await ev(o => ({ gw: peekSess(2, o.gk).watch, a: S.activities.find(a => a.id === 'wbg') }), wb);
    ok(!r2.gw && r2.a && r2.a.wbNo, 'Trennen stellt die freie Aktivität wieder her', r2);
  }
  await ev(() => { WB.at = 0; render(); });
  ok(await ev(o => !peekSess(2, o.gk).watch, wb), 'getrennte Einheit wird nicht erneut zusammengeführt');
  await ev(o => { S.activities = S.activities.filter(a => !/^wb/.test(a.id)); delete S.sessions[sKey(2, o.gk)]; if (o.ck) delete S.sessions[sKey(2, o.ck)]; save(); }, wb);

  /* Krankmeldung rückwirkend und Zeitraum ändern */
  await go('#heute');
  await ev(() => document.querySelector('[data-act=pauseOpen]').click());
  await page.waitForTimeout(150);
  await ev(() => { document.getElementById('pz-from').value = addDays(today(), -4); });
  await ev(() => document.querySelector('[data-act=pauseGo][data-v=sick]').click());
  await page.waitForTimeout(300);
  ok(await ev(() => S.meta.pause && S.meta.pause.from === addDays(today(), -4)), 'Krankmeldung rückwirkend', await ev(() => S.meta.pause));
  ok(await ev(() => /4/.test(document.querySelector('#view').textContent) && !!document.querySelector('[data-act=pauseEdit]')), 'Karte zeigt Tage und „Zeitraum ändern“');
  await ev(() => document.querySelector('[data-act=pauseEdit]').click());
  await page.waitForTimeout(150);
  await ev(() => { document.getElementById('pz-from').value = addDays(today(), -9); document.getElementById('pz-to').value = addDays(today(), -1); });
  await ev(() => document.querySelector('[data-act=pauseEditGo]').click());
  await page.waitForTimeout(300);
  ok(await ev(() => S.meta.pause.from === addDays(today(), -9) && S.meta.pause.to === addDays(today(), -1)), 'Zeitraum geändert');
  ok(await ev(() => !!document.querySelector('#view .card [data-act=pauseEnd]') && /vorbei|over|закончился/.test(document.querySelector('#view').textContent)), 'abgelaufener Zeitraum fragt nach');
  await ev(() => document.querySelector('[data-act=pauseEnd]').click()); await page.waitForTimeout(150);
  await ev(() => document.querySelector('[data-act=pauseSev][data-v=mild]').click()); await page.waitForTimeout(150);
  await ev(() => document.querySelector('[data-act=pauseEndGo]').click()); await page.waitForTimeout(300);
  ok(await ev(() => !S.meta.pause && S.meta.reentry && S.meta.reentry.days === 9 && S.meta.reentry.wk === 2.5), 'Wiedereinstieg aus 9 Krankheitstagen', await ev(() => S.meta.reentry));
  await ev(() => { delete S.meta.reentry; save(); });

  const net = await ev(async () => {
    const calls = []; const realApi = api;
    AUTH = { uid: 'u1', access_token: 'x', refresh_token: 'y', expires_at: 9e9, profile: { role: 'admin', username: 'coach', id: 'u1' } };
    token = async () => 'x';
    api = async (p, o) => { calls.push((o && o.method ? o.method : 'GET') + ' ' + p.split('?')[0]); return []; };
    S.meta.owner = 'u1'; save();
    let e1 = null, e2 = null, e3 = null;
    try { await pushState(); } catch (e) { e1 = String(e); }
    try { await pullAll({ quiet: true }); } catch (e) { e2 = String(e); }
    PE.uid = 'a1'; PE.draft = JSON.parse(JSON.stringify(S.plan)); PE.name = 'Athlet'; PE.dirty = true;
    try { await peSave(); } catch (e) { e3 = String(e); }
    api = realApi;
    return { calls, e1, e2, e3 };
  });
  ok(!net.e1 && net.calls.some(c => /user_state/.test(c)), 'Speichern lädt den Stand hoch', net);
  ok(!net.e2, 'Abgleich mit dem Server ohne Fehler', net.e2);
  ok(!net.e3 && net.calls.some(c => /POST \/rest\/v1\/plans|PATCH \/rest\/v1\/plans|rpc/.test(c)), 'Coach speichert einen Athleten-Plan', [net.e3, net.calls.filter(c => /plan/.test(c))]);
  const out = await ev(async () => { let e = null; try { await logout(); } catch (x) { e = String(x); } return { e, auth: !!AUTH }; });
  ok(!out.e && !out.auth, 'Abmelden', out);

  const log = await ev(() => ERRLOG.list.map(x => x.ctx + ': ' + x.msg));
  ok(!log.length, 'Fehlerprotokoll leer', log);
  ok(!errs.length, 'keine JavaScript-Fehler', errs);
  await browser.close(); server.close();
  if (fails.length) { console.error(fails.join('\n')); console.error(`${fails.length} von ${steps} Prüfungen fehlgeschlagen`); process.exit(1); }
  console.log(`Ablauf-Test ok: ${steps} Prüfungen`);
})().catch(e => { console.error(e); process.exit(1); });
