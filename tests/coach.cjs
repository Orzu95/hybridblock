/* Coach-Paket-Test (ohne Backend): Coaching-Profil, Übungsvideo, Gewohnheiten, Check-in-Fragebogen, Fazit, Vorlagen-Ordner, Sprachnachricht-Knopf.
   Aufruf: node tests/coach.cjs [de|en|ru] */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', 'www');
const LANG = process.argv[2] || 'de';
const SHOTS = process.env.SHOTS || '';
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
const COACH = '11111111-1111-1111-1111-111111111111', ATH = '22222222-2222-2222-2222-222222222222';

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route('**/*supabase.co/**', r => r.abort());
  await ctx.route(/openfoodfacts|openfreemap|exercise-dataset|ytimg/, r => r.abort());
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  const go = async h => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(350); };
  const ev = (f, a) => page.evaluate(f, a);
  const shot = async n => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, n + '_' + LANG + '.png'), fullPage: true }); };
  await page.goto(base);
  await ev(l => { localStorage.clear(); localStorage.setItem('hb_notour', '1'); localStorage.setItem('hb_lang', l); }, LANG);
  await page.goto(base); await page.waitForTimeout(700);
  /* Grundzustand + Mock-Backend */
  await ev(([C, A]) => {
    S.meta.onboarded = true; S.meta.consent = { v: 1, at: 1 };
    Object.assign(S.settings, { sex: 'm', age: 31, height: 180, startWeight: 82, name: 'Max' });
    S.plan = makePlan('gk3'); applyPlan(); S.block.startedOn = today(); S.block.startAt = today(); S.settings.mode = 'rotation'; save();
    window.__calls = [];
    api = async (p, o) => { window.__calls.push([p, o && o.method, o && o.body]); return []; };
    window.__C = C; window.__A = A;
  }, [COACH, ATH]);

  /* ---------- Coach ---------- */
  await ev(([C, A]) => {
    AUTH = { uid: C, profile: { id: C, role: 'admin', username: 'coach', display_name: 'Coach Orzu' } };
    CC.forUid = C; CC.at = Date.now(); CC.me = {}; CC.myName = 'Coach Orzu';
    ADMIN.clients = [{ id: A, username: 'max', display_name: 'Max', summary: null, updated_at: new Date().toISOString(), created_at: new Date().toISOString() }];
    ADMIN.invites = []; ADMIN.reqs = {};
    ADMIN.tpls = [{ id: 't1', name: 'Grundlage', descr: '', tags: { folder: 'Einsteiger' }, plan: makePlan('gk3'), assigned: [], updated_at: new Date().toISOString() },
                  { id: 't2', name: 'Kraft', descr: '', tags: {}, plan: makePlan('gk3'), assigned: [], updated_at: new Date().toISOString() }];
  }, [COACH, ATH]);
  await go('#admin');
  ok(await ev(() => !!document.querySelector('#view a[href="#admin/profil"]')), 'Team-Seite hat Profil-Knopf');
  await go('#admin/profil');
  ok(await ev(() => !!document.getElementById('cc-name') && !!document.getElementById('cc-a-welcome')), 'Coaching-Profil zeigt Auftritt und Automatik');
  await shot('cc_profil');
  await page.fill('#cc-name', 'Team Orzu');
  await page.click('#view [data-act=ccCol][data-v="#0f9d58"]'); await page.waitForTimeout(150);
  await page.fill('#cc-name', 'Team Orzu');
  await page.click('#view [data-act=ccSaveBrand]'); await page.waitForTimeout(300);
  ok(await ev(() => CC.me.brand && CC.me.brand.name === 'Team Orzu' && CC.me.brand.color === '#0f9d58'), 'Auftritt gespeichert', await ev(() => CC.me));
  ok(await ev(() => window.__calls.some(c => c[0].startsWith('/rest/v1/profiles?id=eq.') && c[1] === 'PATCH')), 'Profil per PATCH gespeichert');
  await page.check('#cc-a-idle'); await page.fill('#cc-d-idle', '5');
  await page.click('#view [data-act=ccSaveAuto]'); await page.waitForTimeout(300);
  ok(await ev(() => CC.me.auto && CC.me.auto.idle.on === true && CC.me.auto.idle.days === 5 && CC.me.auto.welcome.on === false && CC.me.auto.idle.txt.includes('{name}')), 'Automatik gespeichert', await ev(() => CC.me.auto));
  const exId = await ev(() => Object.keys(LIB)[0]);
  const exName = await ev(id => ccExName(id), exId);
  await page.fill('#cc-ex', exName); await page.fill('#cc-url', 'https://youtu.be/dQw4w9WgXcQ');
  await page.click('#view [data-act=ccVidLink]'); await page.waitForTimeout(300);
  ok(await ev(id => !!(CC.me.vids && CC.me.vids[id] && CC.me.vids[id].u), exId), 'Video-Link gespeichert');
  await ev(id => exInfoSheet(id), exId); await page.waitForTimeout(600);
  ok(await ev(() => !!document.querySelector('#sheetCard .cc-yt') && !!document.querySelector('#sheetCard .cc-vidadd')), 'Übungsanleitung zeigt Coach-Video');
  await ev(() => closeSheet());
  /* Vorlagen-Ordner */
  await go('#admin/vorlagen');
  ok(await ev(() => document.querySelectorAll('#view [data-act=tplF]').length === 3), 'Ordner-Filter sichtbar');
  await page.click('#view [data-act=tplF][data-v="Einsteiger"]'); await page.waitForTimeout(200);
  ok(await ev(() => document.querySelectorAll('#view [data-act=tplAssign]').length === 1), 'Ordner filtert Vorlagen');
  await page.click('#view [data-act=tplAssign]'); await page.waitForTimeout(250);
  ok(await ev(() => !!document.querySelector('#sheet [data-tplu]')), 'Zuweisen-Sheet offen');
  await ev(() => closeSheet());
  /* Plan-Editor (Vorlage): Gewohnheit + Fragebogen */
  await go('#plan/tpl:t1'); await page.waitForTimeout(400);
  ok(await ev(() => !!document.getElementById('habedit') && !!document.getElementById('cfedit')), 'Plan-Editor zeigt Gewohnheiten und Fragebogen');
  await page.click('#view [data-act=habAdd]'); await page.waitForTimeout(200);
  await page.selectOption('#hab-kind', 'task'); await page.waitForTimeout(200);
  await page.fill('#hab-t', '10 Minuten Mobility');
  await page.click('#view [data-act=habDay][data-v="0"]'); await page.waitForTimeout(150);
  await page.fill('#hab-t', '10 Minuten Mobility');
  await page.click('#view [data-act=habAdd]'); await page.waitForTimeout(200);
  ok(await ev(() => PE.draft.habits.length === 2 && PE.draft.habits[1].kind === 'task' && PE.draft.habits[1].days[0] === 0), 'Gewohnheiten im Entwurf', await ev(() => PE.draft.habits));
  await page.click('#view [data-act=cfStd]'); await page.waitForTimeout(200);
  ok(await ev(() => PE.draft.cform.q.length === 7), 'Standardfragen eingefügt');
  await page.click('#view [data-act=cfDel][data-i="0"]'); await page.waitForTimeout(200);
  ok(await ev(() => PE.draft.cform.q.length === 6 && PE.dirty), 'Frage gelöscht, Entwurf geändert');
  await shot('cc_editor');
  const draft = await ev(() => JSON.parse(JSON.stringify(PE.draft)));

  /* ---------- Athlet ---------- */
  await ev(([C, A, d]) => {
    AUTH = { uid: A, profile: { id: A, role: 'client', username: 'max', coach_id: C } };
    CC.forUid = A; CC.me = null; CC.coachName = 'Coach Orzu';
    CC.coach = { brand: { name: 'Team Orzu', color: '#0f9d58' }, vids: { [Object.keys(LIB)[0]]: { u: 'https://youtu.be/dQw4w9WgXcQ' } } };
    PE.draft = null;
    S.plan.habits = [{ id: 'h1', kind: 'water', n: 2, days: [] }, { id: 'h2', kind: 'task', t: '10 Minuten Mobility', days: [] }];
    S.plan.cform = { day: dIdx(addDays(today(), -2)), q: d.cform.q };
    save();
  }, [COACH, ATH, draft]);
  await go('#heute'); await page.waitForTimeout(300);
  ok(await ev(() => !!document.querySelector('#view .cc-brand')), 'Heute zeigt „Betreut durch“');
  ok(await ev(() => !!document.getElementById('habcard')), 'Heute zeigt Gewohnheiten');
  ok(await ev(() => !!document.querySelector('#view [data-act=cfOpen]')), 'Heute zeigt fälligen Check-in');
  await shot('ath_heute');
  await page.click('#view [data-act=habTick][data-id=h2]'); await page.waitForTimeout(200);
  ok(await ev(() => !!(S.daily[today()].hab || {}).h2), 'Aufgabe abgehakt');
  await ev(() => { dayObj(today()).water = 2500; save(); render(); });
  await page.waitForTimeout(200);
  ok(await ev(() => document.querySelectorAll('#habcard .hb-ck.on').length === 2), 'Wasser automatisch erledigt');
  await page.click('#view [data-act=cfOpen]'); await page.waitForTimeout(300);
  const q0 = await ev(() => S.plan.cform.q.find(x => x.ty === 'sc').id);
  await page.click(`#sheet [data-act=cfSet][data-id="${q0}"][data-v="7"]`);
  const qt = await ev(() => S.plan.cform.q.find(x => x.ty === 'txt').id);
  await page.fill(`#sheet [data-cf="${qt}"]`, 'Gut geschlafen');
  await shot('ath_cform');
  await page.click('#sheet [data-act=cfSave]'); await page.waitForTimeout(300);
  ok(await ev(([a, b]) => { const c = (S.daily[today()] || {}).cf; return c && c.a[a] === 7 && c.a[b] === 'Gut geschlafen'; }, [q0, qt]), 'Check-in gespeichert');
  ok(await ev(() => !document.querySelector('#view [data-act=cfOpen]')), 'Check-in-Karte verschwindet');
  const sum = await ev(() => makeSummary());
  ok(sum.cf && sum.cf.hist.length === 1 && sum.formLast === sum.cf.hist[0].d && sum.hab && sum.hab.list.length === 2, 'Kurzfassung enthält Fragebogen und Gewohnheiten', { cf: sum.cf, hab: sum.hab });
  /* Video in der Übungsanleitung */
  await ev(() => exInfoSheet(Object.keys(LIB)[0])); await page.waitForTimeout(600);
  ok(await ev(() => !!document.querySelector('#sheetCard .cc-vid') && !document.querySelector('#sheetCard .cc-vidadd')), 'Athlet sieht Coach-Video ohne Bearbeiten');
  await ev(() => closeSheet());
  /* Chat: Name des Coaches, Mikrofon-Knopf, Audio */
  await ev(() => { CHAT.list[chatKey(chatPair(null))] = [{ id: 'm1', sender: window.__C, body: null, audio: 'x/y/z.webm', ref: { auto: 'idle' }, created_at: new Date().toISOString() }, { id: 'm2', sender: window.__C, body: 'Hallo', ref: { auto: 'welcome' }, created_at: new Date().toISOString() }]; });
  await go('#chat');
  ok(await ev(() => document.querySelector('#view h1') && document.querySelector('#view h1').textContent.includes('Team Orzu')), 'Chat zeigt Coach-Namen');
  ok(await ev(() => !!document.querySelector('#view .chat-audio')), 'Sprachnachricht wird als Audio gezeigt');
  ok(await ev(() => !document.querySelector('#view .chat-auto')), 'Athlet sieht keinen Automatik-Hinweis');
  ok(await ev(() => !!document.getElementById('voicebtn') || typeof MediaRecorder === 'undefined'), 'Mikrofon-Knopf vorhanden');
  /* Fazit nach der Einheit */
  const k = await ev(() => ORDER.find(x => isGym(x)));
  await ev(key => {
    const s = sess(1, key);
    planFor(1, key).forEach(p => {
      const rr = repRange(p.reps) || { hi: 8 };
      s.logs[p.slot] = { ex: p.ex, sets: Array.from({ length: p.sets }, () => ({ w: '50', r: String(rr.hi), rpe: String(p.rpe ?? 8), done: true })) };
    });
    s.date = today(); s.end = { dur: '60', rpe: '7' }; save(); finishSession(1, key);
  }, k);
  await page.waitForTimeout(400);
  ok(await ev(() => !!document.querySelector('#sheet .fz')), 'Fazit im Abschluss-Sheet');
  const fz = await ev(() => document.querySelector('#sheet .fz') && document.querySelector('#sheet .fz').innerText);
  ok(fz && fz.length > 30, 'Fazit hat Text', fz);
  await shot('ath_fazit');
  const sum2 = await ev(() => makeSummary());
  ok(sum2.fz && sum2.fz.length === 1 && sum2.fz[0].up.length > 0, 'Kurzfassung enthält Fazit', sum2.fz);
  await ev(() => closeSheet());

  /* ---------- Coach liest die Kurzfassung ---------- */
  await ev(([C, A, s]) => {
    AUTH = { uid: C, profile: { id: C, role: 'admin', username: 'coach' } };
    CC.forUid = C; CC.coach = null; CC.me = {};
    ADMIN.clients = [{ id: A, username: 'max', display_name: 'Max', summary: s, updated_at: new Date().toISOString(), created_at: new Date().toISOString() }];
    ADMIN.states = ADMIN.states || {};
  }, [COACH, ATH, sum2]);
  const fl = await ev(() => dashFlags(ADMIN.clients[0]));
  ok(fl.checkin && fl.checkin.length > 3, 'Team-Überblick meldet neuen Fragebogen', fl);
  await go('#admin/' + ATH); await page.waitForTimeout(400);
  const txt = await ev(() => document.getElementById('view').innerText);
  ok(txt.includes('Gut geschlafen'), 'Athletenansicht zeigt Check-in-Antworten');
  ok(await ev(() => document.querySelectorAll('#view .fz').length === 1), 'Athletenansicht zeigt Fazit');
  await shot('cc_athlet');
  ok(!(await ev(() => dashFlags(ADMIN.clients[0]).checkin)), 'nach dem Ansehen kein Hinweis mehr');
  ok(await ev(() => !(window.ERRLOG || []).length) , 'Fehlerprotokoll leer', await ev(() => (window.ERRLOG || []).slice(0, 3)));

  ok(!errs.length, 'keine JS-Fehler', errs.slice(0, 5));
  await browser.close(); server.close();
  if (fails.length) { console.log('FEHLER (' + fails.length + '/' + steps + '):\n- ' + fails.join('\n- ')); process.exit(1); }
  console.log('Coach-Test ok (' + LANG + '): ' + steps + ' Prüfungen');
})().catch(e => { console.error(e); process.exit(1); });
