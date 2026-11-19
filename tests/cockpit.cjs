/* Athleten-Cockpit (Desktop D3) ohne Backend: Kopf, Spalten, Reiter, Chat rechts, Kurzverläufe.
   Aufruf: node tests/cockpit.cjs [de|en|ru]  (SHOTS=Ordner für Bildschirmfotos) */
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
      if (/\/rest\/v1\/messages\?coach_id/.test(p) && (!o || !o.method)) return [{ id: 'm0', sender: 'a0000001-0000-0000-0000-000000000000', body: 'Knie zwickt etwas', created_at: new Date().toISOString(), read_at: null }];
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
    ADMIN.tpls = [{ id: 't1', name: 'Grundlage', descr: '', tags: { folder: 'Einsteiger' }, plan: makePlan('gk3'), assigned: [], updated_at: now }];
  }, C);
  const anna = await ev(() => ADMIN.clients[0].id);
  await go('#admin/' + anna);
  await page.waitForTimeout(500);
  ok(await ev(() => document.body.classList.contains('dk-ck')), 'body.dk-ck gesetzt');
  ok(await ev(() => !!document.querySelector('.ck-grid .ck-left') && !!document.querySelector('.ck-grid .ck-mid') && !!document.querySelector('.ck-grid .ck-chat')), '3 Spalten');
  ok(await ev(() => !document.getElementById('ck-src')), 'Quelle aufgeräumt');
  ok(await ev(() => /Anna Berg/.test(document.querySelector('.ck-name').textContent)), 'Name im Kopf');
  ok(await ev(() => !!document.querySelector('.ck-lim')), 'Einschränkungen im Kopf');
  ok(await ev(() => !!document.querySelector('#ck-left .stats') && !!document.querySelector('#ck-left [data-act="athMode"]') && !!document.querySelector('#ck-left #note-new') && !!document.querySelector('#ck-left [data-act="resetPw"]')), 'Stammakte links (Kennzahlen, Betreuung, Notizen, Konto)');
  ok((await ev(() => document.querySelectorAll('#ck-left .ck-sp').length)) === 4, '4 Kurzverläufe');
  ok(await ev(() => !document.querySelector('.ck-grid a.btn[href^="#chat/"]')), 'Chat-Knopf entfernt');
  ok(await ev(() => /Knie zwickt/.test(document.querySelector('.ck-chat').textContent)), 'Chat rechts geladen');
  await shot('ck_ueber');
  const tabs = await ev(() => [...document.querySelectorAll('.ck-tab')].map(b => b.dataset.v));
  ok(tabs.length === 5, '5 Reiter', tabs);
  await ev(() => document.querySelector('.ck-tab[data-v="plan"]').click()); await page.waitForTimeout(250);
  ok(await ev(() => !!document.querySelector('#ck-mid a[href^="#plan/"]')), 'Reiter Plan zeigt Plan-Karte');
  await ev(() => document.querySelector('.ck-tab[data-v="check"]').click()); await page.waitForTimeout(250);
  ok(await ev(() => !!document.querySelector('#ck-mid #cm-box')), 'Reiter Check-ins zeigt Formchecks');
  await shot('ck_check');
  await ev(() => document.querySelector('.ck-tab[data-v="prog"]').click()); await page.waitForTimeout(250);
  ok(await ev(() => !!document.querySelector('#ck-mid [data-act="viewAs"]')), 'Reiter Fortschritt');
  /* Senden per Enter */
  await page.fill('.ck-chat #chat-text', 'Danke, wir passen an');
  await page.press('.ck-chat #chat-text', 'Enter'); await page.waitForTimeout(500);
  const sent = await ev(() => window.__calls.filter(c => /\/rest\/v1\/messages$/.test(c[0]) && c[1] === 'POST').map(c => JSON.parse(c[2]).body));
  ok(sent.includes('Danke, wir passen an'), 'Enter sendet', sent);
  ok(await ev(() => /Danke, wir passen an/.test(document.querySelector('.ck-chat').textContent)), 'Gesendet im Verlauf');
  ok(await ev(() => document.querySelector('.ck-tab.on').dataset.v === 'prog'), 'Reiter bleibt nach Senden');
  /* Entwurf bleibt beim Reiterwechsel */
  await page.fill('.ck-chat #chat-text', 'Entwurf');
  await ev(() => document.querySelector('.ck-tab[data-v="ueber"]').click()); await page.waitForTimeout(250);
  ok((await ev(() => document.querySelector('.ck-chat #chat-text').value)) === 'Entwurf', 'Entwurf bleibt');
  /* Athlet ohne Daten */
  const dario = await ev(() => ADMIN.clients[3].id);
  await go('#admin/' + dario); await page.waitForTimeout(400);
  ok(await ev(() => !!document.querySelector('.ck-grid')), 'Cockpit auch ohne Daten');
  /* schmal: einspaltig */
  await page.setViewportSize({ width: 1100, height: 900 }); await page.waitForTimeout(400);
  ok(await ev(() => !document.querySelector('.ck-grid') && !document.body.classList.contains('dk-ck')), 'unter 1200 px einspaltig');
  ok(!errs.length, 'keine JS-Fehler', errs);
  await browser.close();
  server.close();
  console.log((fails.length ? 'FEHLER' : 'OK') + ' cockpit ' + LANG + ': ' + (steps - fails.length) + '/' + steps);
  fails.forEach(f => console.log('  ✗ ' + f));
  process.exit(fails.length ? 1 : 0);
})();
