/* Nachrichten in 3 Spalten (Desktop D6) ohne Backend: Liste, Filter, Suche, Chat, Bausteine, Spickzettel.
   Aufruf: node tests/msgs.cjs [de|en|ru]  (SHOTS=Ordner für Bildschirmfotos) */
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
const C = '11111111-1111-1111-1111-111111111111';

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = 'http://localhost:' + server.address().port + '/';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/*supabase.co/**', r => r.abort());
  await ctx.route(/openfoodfacts|openfreemap|exercise-dataset|ytimg/, r => r.abort());
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  const go = async h => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(350); };
  const ev = (f, a) => page.evaluate(f, a);
  const shot = async n => { if (SHOTS) { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(100); } if (SHOTS) await page.screenshot({ path: path.join(SHOTS, n + '_' + LANG + '.png') }); };
  await page.goto(base);
  await ev(l => { localStorage.clear(); localStorage.setItem('hb_notour', '1'); localStorage.setItem('hb_lang', l); }, LANG);
  await page.goto(base); await page.waitForTimeout(700);
  await ev(C => {
    S.meta.onboarded = true; S.meta.consent = { v: 1, at: 1 };
    S.plan = makePlan('gk3'); applyPlan(); save();
    window.__calls = [];
    api = async (p, o) => {
      window.__calls.push([p, o && o.method, o && o.body]);
      if (/\/rest\/v1\/plans\?user_id=eq\./.test(p) && (!o || !o.method)) return [{ plan: makePlan('gk3') }];
      if (/\/rest\/v1\/messages\?coach_id/.test(p) && (!o || !o.method)) return /athlete_id=eq\./.test(p) ? (/a0000001/.test(p) ? [{ id: 'm0', sender: 'a0000001-0000-0000-0000-000000000000', body: 'Knie zwickt etwas', created_at: new Date().toISOString(), read_at: null }] : []) : [{ id: 'm0', athlete_id: 'a0000001-0000-0000-0000-000000000000', sender: 'a0000001-0000-0000-0000-000000000000', body: 'Knie zwickt etwas', created_at: new Date().toISOString() }, { id: 'm1', athlete_id: 'a0000002-0000-0000-0000-000000000000', sender: C, body: 'Wie geht es dir?', created_at: new Date(Date.now() - 36e5).toISOString() }];
      if (/\/rest\/v1\/messages/.test(p) && o && o.method === 'POST') return [Object.assign({ id: 'm' + window.__calls.length, created_at: new Date().toISOString() }, JSON.parse(o.body))];
      return [];
    };
    AUTH = { uid: C, profile: { id: C, role: 'admin', username: 'coach', display_name: 'Coach Orzu' } };
    CC.forUid = C; CC.at = Date.now(); CC.me = {}; CC.myName = 'Coach Orzu';
    const now = new Date().toISOString(), old = new Date(Date.now() - 10 * 864e5).toISOString();
    const mk = (i, name, sum, upd) => ({ id: 'a000000' + i + '-0000-0000-0000-000000000000', username: name.toLowerCase(), display_name: name, summary: sum, updated_at: upd || now, created_at: old });
    const base = { week: 3, nw: 8, weeksLeft: 5, plan: 'Grundlage', lastTrain: addDays(today(), -1), logged7: 6, kcal7: 2300, kcalT: 2400, prot7: 150, protT: 160, quota: [{ w: 2, done: 3, total: 3 }, { w: 3, done: 1, total: 3 }], dots: ['g', 'o', 'o'] };
    ADMIN.clients = [
      mk(1, 'Anna Berg', Object.assign({}, base, { done: 1, total: 3, hab: { p: 86, of: 14, list: [{ k: 'steps', n: 8000, d: 6, of: 7 }] }, cf: { due: today(), open: false, over: false, hist: [{ d: today(), a: [] }] }, fz: [], pain: 'knee,shoulder', target: 60, sp: { w: Array.from({ length: 28 }, (_, i) => 66 - i * 0.07), sl: Array.from({ length: 28 }, (_, i) => 420 + (i % 5) * 10), st: Array.from({ length: 28 }, (_, i) => 8000 + (i % 7) * 400), r: Array.from({ length: 28 }, () => 52) }, trend: 64.2, rate: -0.3, sleep7: 450, rhr7: 52, steps7: 9100, ready: 78 })),
      mk(2, 'Ben Kurz', Object.assign({}, base, { readyLow: true, sleepLow: true, hab: { p: 30, of: 14, list: [] }, cf: { due: today(), open: true, over: true, hist: [] } })),
      mk(3, 'Clara Ost', Object.assign({}, base, { weeksLeft: 0 })),
      mk(4, 'Dario Neu', null, old),
      mk(5, 'Eva Lind', Object.assign({}, base, { cf: { due: today(), open: false, over: false, hist: [{ d: today(), a: [] }] }, formLast: today() }))
    ];
    ADMIN.invites = [{ code: 'AB12CD', name: 'Fritz', expires_at: addDays(today(), 5) + 'T00:00:00Z' }];
    ADMIN.reqs = {};
    ADMIN.notes = {};
    CHAT.unread['a0000001-0000-0000-0000-000000000000'] = 1;
    ADMIN.tpls = [{ id: 't1', name: 'Grundlage', descr: '', tags: { folder: 'Einsteiger' }, plan: makePlan('gk3'), assigned: [], updated_at: now }];
  }, C);

  await go('#chats'); await page.waitForTimeout(500);
  ok(await ev(() => document.body.classList.contains('dk-m3')), 'body.dk-m3 gesetzt');
  ok(await ev(() => !!document.querySelector('.m3 .m3-list') && !!document.querySelector('.m3 .m3-empty')), 'Liste + Platzhalter ohne Auswahl');
  ok((await ev(() => document.querySelectorAll('.m3-li').length)) === 5, '5 Gespräche');
  ok(await ev(() => /Anna/.test(document.querySelector('.m3-li').textContent)), 'neuestes oben');
  await ev(() => document.querySelector('[data-act="m3F"][data-v="wait"]').click()); await page.waitForTimeout(200);
  ok((await ev(() => document.querySelectorAll('.m3-li').length)) === 1, 'Filter Wartet auf Antwort');
  await ev(() => document.querySelector('[data-act="m3F"][data-v="unread"]').click()); await page.waitForTimeout(200);
  ok((await ev(() => document.querySelectorAll('.m3-li').length)) === 1, 'Filter Ungelesen');
  await ev(() => document.querySelector('[data-act="m3F"][data-v="all"]').click()); await page.waitForTimeout(200);
  await page.click('#m3q');
  await page.fill('#m3q', 'cla');
  await page.waitForTimeout(250);
  ok((await ev(() => [...document.querySelectorAll('.m3-li')].filter(a => !a.hidden).length)) === 1, 'Namenssuche');
  ok(await ev(() => document.activeElement && document.activeElement.id === 'm3q'), 'Suchfeld behält Fokus');
  await page.fill('#m3q', '');
  await shot('m3_list');
  const anna = await ev(() => ADMIN.clients[0].id);
  await ev(a => document.querySelector('.m3-li[href="#chat/' + a + '"]').click(), anna); await page.waitForTimeout(600);
  ok(await ev(() => !!document.querySelector('.m3 .m3-chat #chatlist') && !!document.querySelector('.m3 .m3-side')), '3 Spalten mit Chat');
  ok(await ev(() => document.querySelector('.m3-li.on') && /Anna/.test(document.querySelector('.m3-li.on').textContent)), 'aktives Gespräch markiert');
  ok(await ev(() => /Knie zwickt/.test(document.querySelector('.m3-chat').textContent)), 'Verlauf geladen');
  ok(await ev(() => !document.querySelector('.m3-chat .back')), 'kein Zurück-Link in der Mitte');
  ok(await ev(() => !!document.querySelector('.m3-side .ck-lim') && !!document.querySelector('.m3-side #note-new') && document.querySelectorAll('.m3-side .m3-kv').length >= 6), 'Spickzettel mit Einschränkungen, Kennzahlen, Notizen');
  /* Baustein einfügen */
  await ev(() => document.querySelector('[data-act="m3Snip"][data-i="0"]').click()); await page.waitForTimeout(150);
  const v = await ev(() => document.getElementById('chat-text').value);
  ok(/Anna/.test(v) && !/\{name\}/.test(v), 'Baustein mit Vorname', v);
  /* eigenen Baustein speichern */
  await page.fill('.m3-chat #chat-text', 'Super gemacht, Anna!');
  await ev(() => document.querySelector('[data-act="m3SnipAdd"]').click()); await page.waitForTimeout(300);
  const sn = await ev(() => S.settings.snips);
  ok(Array.isArray(sn) && sn[sn.length - 1] === 'Super gemacht, {name}!', 'Baustein gespeichert mit {name}', sn);
  ok((await ev(() => document.querySelectorAll('.m3-snx').length)) === sn.length, 'eigene Bausteine löschbar');
  /* Enter sendet */
  await page.fill('.m3-chat #chat-text', 'Danke, wir passen an');
  await page.press('.m3-chat #chat-text', 'Enter'); await page.waitForTimeout(500);
  const sent = await ev(() => window.__calls.filter(c => /\/rest\/v1\/messages$/.test(c[0]) && c[1] === 'POST').map(c => JSON.parse(c[2]).body));
  ok(sent.includes('Danke, wir passen an'), 'Enter sendet', sent);
  ok(await ev(() => /Danke, wir passen an/.test(document.querySelector('.m3-chat').textContent)), 'Gesendet im Verlauf');
  ok(await ev(() => /Danke, wir passen an/.test(document.querySelector('.m3-li').textContent)), 'Liste zeigt letzte Nachricht');
  /* Tempo */
  await ev(() => document.querySelector('[data-act="m3Rate"]').click()); await page.waitForTimeout(150);
  ok((await ev(() => ui.m3rate)) === 1.5, 'Tempo 1,5×');
  /* Entwurf je Gespräch */
  await page.fill('.m3-chat #chat-text', 'Entwurf Anna');
  const ben = await ev(() => ADMIN.clients[1].id);
  await go('#chat/' + ben); await page.waitForTimeout(400);
  ok((await ev(() => document.getElementById('chat-text').value)) === '', 'neues Gespräch leer');
  await go('#chat/' + anna); await page.waitForTimeout(400);
  ok((await ev(() => document.getElementById('chat-text').value)) === 'Entwurf Anna', 'Entwurf je Gespräch');
  await shot('m3_chat');
  /* Cockpit-Chat unverändert */
  await go('#admin/' + anna); await page.waitForTimeout(500);
  ok(await ev(() => !!document.querySelector('.ck-chat #chatlist') && !document.querySelector('.m3')), 'Cockpit-Chat unverändert');
  /* schmal */
  await page.setViewportSize({ width: 1100, height: 900 });
  await go('#chat/' + anna); await page.waitForTimeout(400);
  ok(await ev(() => !document.querySelector('.m3') && !document.body.classList.contains('dk-m3') && !!document.querySelector('#chatlist')), 'unter 1200 px normaler Chat');
  ok(!errs.length, 'keine JS-Fehler', errs);
  await browser.close();
  server.close();
  console.log((fails.length ? 'FEHLER' : 'OK') + ' msgs ' + LANG + ': ' + (steps - fails.length) + '/' + steps);
  fails.forEach(f => console.log('  ✗ ' + f));
  process.exit(fails.length ? 1 : 0);
})();
