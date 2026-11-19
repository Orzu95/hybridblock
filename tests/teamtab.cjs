/* Team-Tabelle (Desktop D2) ohne Backend: Zeilen, Ursachen, Filter, Pausieren, Erledigt, Mehrfachauswahl, Sammelnachricht, Gewohnheit, Vorlage, Kurzpanel.
   Aufruf: node tests/teamtab.cjs [de|en|ru]  (SHOTS=Ordner für Bildschirmfotos) */
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
  const shot = async n => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, n + '_' + LANG + '.png') }); };
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
      if (/\/rest\/v1\/messages/.test(p) && o && o.method === 'POST') return [Object.assign({ id: 'm' + window.__calls.length, created_at: new Date().toISOString() }, JSON.parse(o.body))];
      return [];
    };
    AUTH = { uid: C, profile: { id: C, role: 'admin', username: 'coach', display_name: 'Coach Orzu' } };
    CC.forUid = C; CC.at = Date.now(); CC.me = {}; CC.myName = 'Coach Orzu';
    const now = new Date().toISOString(), old = new Date(Date.now() - 10 * 864e5).toISOString();
    const mk = (i, name, sum, upd) => ({ id: 'a000000' + i + '-0000-0000-0000-000000000000', username: name.toLowerCase(), display_name: name, summary: sum, updated_at: upd || now, created_at: old });
    const base = { week: 3, nw: 8, weeksLeft: 5, plan: 'Grundlage', lastTrain: addDays(today(), -1), logged7: 6, kcal7: 2300, kcalT: 2400, prot7: 150, protT: 160, quota: [{ w: 2, done: 3, total: 3 }, { w: 3, done: 1, total: 3 }], dots: ['g', 'o', 'o'] };
    ADMIN.clients = [
      mk(1, 'Anna Berg', Object.assign({}, base, { hab: { p: 86, of: 14, list: [{ k: 'steps', d: 6, of: 7 }] }, trend: 64.2, rate: -0.3, sleep7: 450, rhr7: 52, steps7: 9100, ready: 78 })),
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
  await go('#admin');
  ok(await ev(() => document.body.classList.contains('dk-team')), 'body.dk-team gesetzt');
  ok((await ev(() => document.querySelectorAll('table.tt tbody tr').length)) === 5, '5 Zeilen', await ev(() => document.querySelectorAll('table.tt tbody tr').length));
  ok(await ev(() => document.querySelectorAll('.tt-tiles .dtile').length >= 6), 'Filter-Kacheln');
  const first = await ev(() => document.querySelector('table.tt tbody tr .tt-name b').textContent);
  ok(first !== 'Anna Berg', 'Dringliche zuerst, Anna (auf Kurs) nicht oben', first);
  ok(await ev(() => !!document.querySelector('a[href="#admin/profil"]')), 'Profil-Knopf');
  ok(await ev(() => /AB12CD/.test(document.querySelector('.tt-extra').textContent)), 'Einladung unter der Tabelle');
  ok(await ev(() => /überfällig|overdue|просроч/i.test(document.querySelector('table.tt').textContent)), 'Fragebogen überfällig sichtbar');
  await shot('team_table');
  /* Filter */
  await ev(() => document.querySelector('.dtile[data-v="ok"]').click()); await page.waitForTimeout(200);
  ok((await ev(() => document.querySelectorAll('table.tt tbody tr').length)) === 1, 'Filter „Auf Kurs“ = 1');
  await ev(() => document.querySelector('.dtile[data-v="ok"]').click()); await page.waitForTimeout(200);
  /* Kurzpanel */
  await ev(() => [...document.querySelectorAll('table.tt tbody tr')].find(r => /Anna/.test(r.textContent)).querySelector('td:nth-child(4)').click()); await page.waitForTimeout(250);
  ok(await ev(() => /Anna Berg/.test(document.querySelector('.tt-side h2').textContent)), 'Panel zeigt Anna');
  ok(await ev(() => !!document.querySelector('.tt-side #note-new')), 'Notizen im Panel');
  await shot('team_panel');
  /* Pausieren */
  const ben = await ev(() => ADMIN.clients[1].id);
  await ev(id => document.querySelector('[data-act="ttSnooze"][data-uid="' + id + '"]').click(), ben); await page.waitForTimeout(200);
  ok(await ev(id => !!(S.settings.ttSnooze || {})[id], ben), 'Pausiert gespeichert');
  ok(await ev(() => /Ben/.test([...document.querySelectorAll('table.tt tbody tr')].pop().textContent)), 'Pausierter unten');
  await ev(id => document.querySelector('[data-act="ttWake"][data-uid="' + id + '"]').click(), ben); await page.waitForTimeout(200);
  ok(await ev(id => !(S.settings.ttSnooze || {})[id], ben), 'Pause beendet');
  /* Erledigt */
  const cla = await ev(() => ADMIN.clients[2].id);
  await ev(id => document.querySelector('[data-act="ttDone"][data-uid="' + id + '"]').click(), cla); await page.waitForTimeout(200);
  ok(await ev(id => !!(S.settings.ttDone || {})[id], cla), 'Erledigt gespeichert');
  ok(await ev(id => document.querySelector('tr[data-uid="' + id + '"]').classList.contains('tt-quiet'), cla), 'Erledigte Zeile gedimmt');
  /* Mehrfachauswahl */
  await ev(() => document.querySelector('[data-act="ttAll"]').click()); await page.waitForTimeout(200);
  ok(await ev(() => /5/.test(document.querySelector('.tt-bar b').textContent)), 'Aktionsleiste 5 ausgewählt');
  await shot('team_bar');
  await ev(() => document.querySelector('[data-act="ttMsg"]').click()); await page.waitForTimeout(200);
  await ev(() => { document.getElementById('ttm-body').value = 'Hallo {name}!'; document.querySelector('[data-act="ttMsgGo"]').click(); }); await page.waitForTimeout(500);
  const msgs = await ev(() => window.__calls.filter(c => /\/rest\/v1\/messages/.test(c[0]) && c[1] === 'POST').map(c => JSON.parse(c[2]).body));
  ok(msgs.length === 5 && msgs.includes('Hallo Anna!') && msgs.includes('Hallo Ben!'), 'Sammelnachricht mit {name}', msgs);
  await ev(() => document.querySelector('[data-act="ttHab"]').click()); await page.waitForTimeout(200);
  await ev(() => { document.getElementById('tth-kind').value = 'water'; document.querySelector('[data-act="ttHabGo"]').click(); }); await page.waitForTimeout(600);
  const plans = await ev(() => window.__calls.filter(c => /\/rest\/v1\/plans\?on_conflict/.test(c[0])).map(c => JSON.parse(c[2]).plan.habits));
  ok(plans.length === 5 && plans.every(h => h && h.some(x => x.kind === 'water' && x.n === 2.5)), 'Gewohnheit bei 5 Plänen', plans.length);
  await ev(() => document.querySelector('[data-act="ttTpl"]').click()); await page.waitForTimeout(200);
  await ev(() => document.querySelector('[data-act="ttTplGo"]').click()); await page.waitForTimeout(200);
  ok((await ev(() => document.querySelectorAll('#sheet [data-tplu]:checked').length)) === 5, 'Vorlagen-Dialog vorausgewählt');
  await ev(() => closeSheet());
  /* schmal: Karten-Liste */
  await page.setViewportSize({ width: 900, height: 900 }); await page.waitForTimeout(400);
  ok(await ev(() => !document.querySelector('table.tt') && !!document.querySelector('.dash-li')), 'unter 1024 px Karten-Liste');
  ok(!errs.length, 'keine JS-Fehler', errs);
  await browser.close();
  server.close();
  console.log((fails.length ? 'FEHLER' : 'OK') + ' teamtab ' + LANG + ': ' + (steps - fails.length) + '/' + steps);
  fails.forEach(f => console.log('  ✗ ' + f));
  process.exit(fails.length ? 1 : 0);
})();
