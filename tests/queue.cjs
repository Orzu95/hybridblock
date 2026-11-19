/* Prüf-Warteschlange (Desktop D4) ohne Backend: Reiter, Fragebogen mit Vorwoche, Formcheck, Fotos, Senden & nächster.
   Aufruf: node tests/queue.cjs [de|en|ru]  (SHOTS=Ordner für Bildschirmfotos) */
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
  await ev(l => { localStorage.clear(); localStorage.setItem('hb_notour', '1'); localStorage.setItem('hb_lang', l); localStorage.setItem('hb_cmode', 'coach'); }, LANG);
  await page.goto(base); await page.waitForTimeout(700);
  await ev(C => {
    S.meta.onboarded = true; S.meta.consent = { v: 1, at: 1 };
    S.plan = makePlan('gk3'); applyPlan(); save();
    window.__calls = [];
    api = async (p, o) => {
      window.__calls.push([p, o && o.method, o && o.body]);
      if (/\/rest\/v1\/media_items\?owner_id=neq\./.test(p)) return window.__media;
      if (/\/rest\/v1\/rpc\/media_comment/.test(p)) return { t: JSON.parse(o.body).p_t, text: JSON.parse(o.body).p_text, coach: true };
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
      mk(1, 'Anna Berg', Object.assign({}, base, { done: 1, total: 3, hab: { p: 86, of: 14, list: [{ k: 'steps', n: 8000, d: 6, of: 7 }] }, cf: { due: today(), open: false, over: false, hist: [{ d: today(), a: [['Energie', 'sc', 7], ['Gewicht', 'num', 64.1], ['Krank?', 'yn', 'nein']] }, { d: addDays(today(), -7), a: [['Energie', 'sc', 5], ['Gewicht', 'num', 64.8], ['Krank?', 'yn', 'ja']] }] }, fz: [], pain: 'knee,shoulder', target: 60, sp: { w: Array.from({ length: 28 }, (_, i) => 66 - i * 0.07), sl: Array.from({ length: 28 }, (_, i) => 420 + (i % 5) * 10), st: Array.from({ length: 28 }, (_, i) => 8000 + (i % 7) * 400), r: Array.from({ length: 28 }, () => 52) }, trend: 64.2, rate: -0.3, sleep7: 450, rhr7: 52, steps7: 9100, ready: 78 })),
      mk(2, 'Ben Kurz', Object.assign({}, base, { readyLow: true, sleepLow: true, hab: { p: 30, of: 14, list: [] }, cf: { due: today(), open: true, over: true, hist: [] } })),
      mk(3, 'Clara Ost', Object.assign({}, base, { weeksLeft: 0 })),
      mk(4, 'Dario Neu', null, old),
      mk(5, 'Eva Lind', Object.assign({}, base, { cf: { due: today(), open: false, over: false, hist: [{ d: today(), a: [] }] }, formLast: today() }))
    ];
    const A = 'a0000001-0000-0000-0000-000000000000', E = 'a0000005-0000-0000-0000-000000000000';
    window.__media = [
      { id: 'f1', owner_id: A, kind: 'form', path: A + '/f1.mp4', meta: { ex: 'squat', name: 'Kniebeuge', w: 3 }, comments: [], created_at: addDays(today(), -2) + 'T10:00:00Z', seen_at: null },
      { id: 'p2', owner_id: E, kind: 'checkin', path: E + '/p2.jpg', meta: { view: 'vorne' }, comments: [], created_at: addDays(today(), -1) + 'T10:00:00Z', seen_at: null },
      { id: 'p1', owner_id: E, kind: 'checkin', path: E + '/p1.jpg', meta: { view: 'vorne' }, comments: [], created_at: addDays(today(), -8) + 'T10:00:00Z', seen_at: addDays(today(), -7) + 'T10:00:00Z' }
    ];
    S.settings.seenCf = { [E]: today() };
    ADMIN.invites = [{ code: 'AB12CD', name: 'Fritz', expires_at: addDays(today(), 5) + 'T00:00:00Z' }];
    ADMIN.reqs = {};
    ADMIN.notes = {};
    ADMIN.tpls = [{ id: 't1', name: 'Grundlage', descr: '', tags: { folder: 'Einsteiger' }, plan: makePlan('gk3'), assigned: [], updated_at: now }];
  }, C);
  await go('#admin');
  await page.waitForTimeout(400);
  ok(await ev(() => !!document.querySelector('a[href="#admin/pruefen"] .cnt')), 'Prüfen-Knopf mit Zähler im Team');
  ok(await ev(() => !!document.querySelector('#tabbar a[data-r="cpruefen"]')), 'Prüfen in der Seitenleiste');
  await go('#admin/pruefen');
  await page.waitForTimeout(500);
  const rows = await ev(() => [...document.querySelectorAll('.q-row')].map(r => r.textContent));
  ok(rows.length === 3, '3 zu prüfen (Formcheck, Foto, Fragebogen)', rows);
  ok((await ev(() => document.querySelector('.q-row').dataset.k)) === 'm:f1', 'älteste zuerst', rows[0]);
  ok(await ev(() => !!document.querySelector('#q-v') && document.querySelectorAll('.q-speed [data-act="qRate"]').length === 3), 'Video mit Zeitlupe');
  await shot('q_form');
  /* Kommentar an Videostelle */
  await page.fill('#q-com', 'Knie nach außen');
  await ev(() => document.querySelector('[data-act="qComment"]').click()); await page.waitForTimeout(400);
  ok(await ev(() => /Knie nach außen/.test(document.querySelector('.q-main').textContent)), 'Kommentar erscheint');
  /* Senden & nächster */
  await page.fill('#q-msg', 'Sauber, nächstes Mal 2,5 kg mehr');
  await ev(() => document.querySelector('[data-act="qSend"]').click()); await page.waitForTimeout(500);
  const sent = await ev(() => window.__calls.filter(c => /\/rest\/v1\/messages$/.test(c[0]) && c[1] === 'POST').map(c => JSON.parse(c[2])));
  ok(sent.length === 1 && sent[0].body === 'Sauber, nächstes Mal 2,5 kg mehr' && sent[0].ref && sent[0].ref.t === 'ex', 'Antwort im Chat mit Übungsbezug', sent);
  ok(await ev(() => window.__media[0].seen_at != null), 'Formcheck als gesehen markiert');
  ok((await ev(() => document.querySelectorAll('.q-row').length)) === 2, 'nächster Eintrag, 2 übrig');
  ok((await ev(() => document.getElementById('q-msg').value)) === '', 'Feld nach Senden leer');
  ok(await ev(() => document.querySelector('#tabbar a[data-r="cpruefen"]').classList.contains('on') && !document.querySelector('#tabbar a[data-r="cteam"]').classList.contains('on')), 'Seitenleiste: Prüfen aktiv');
  ok(await ev(() => !!document.querySelector('.q-ph') && document.querySelectorAll('.q-ph figure').length === 2), 'Foto neben vorigem Foto');
  await shot('q_photo');
  await ev(() => document.querySelector('[data-act="qDone"]').click()); await page.waitForTimeout(300);
  ok(await ev(() => !!document.querySelector('.q-tab')), 'Fragebogen-Tabelle');
  const dl = await ev(() => [...document.querySelectorAll('.q-tab .q-d')].map(x => x.textContent));
  ok(dl.includes('+2') && dl.some(x => /0[,.]7/.test(x)), 'Differenzen zur Vorwoche', dl);
  await shot('q_cf');
  /* Tastatur j/k im Erledigt-Reiter */
  await ev(() => document.querySelector('[data-act="qDone"]').click()); await page.waitForTimeout(300);
  ok(await ev(() => /Alles geprüft|All reviewed|Всё проверено/.test(document.querySelector('.q-grid').textContent)), 'Alles geprüft');
  await ev(() => document.querySelector('[data-act="qTab"][data-v="done"]').click()); await page.waitForTimeout(300);
  const nd = await ev(() => document.querySelectorAll('.q-row').length);
  ok(nd >= 3, 'Erledigt-Liste', nd);
  const s0 = await ev(() => ui.qSel);
  await page.keyboard.press('j'); await page.waitForTimeout(200);
  ok((await ev(() => ui.qSel)) !== s0, 'j springt weiter');
  await ev(() => document.querySelector('[data-act="qTab"][data-v="over"]').click()); await page.waitForTimeout(300);
  ok((await ev(() => document.querySelectorAll('.q-row').length)) === 1, 'Überfällig: Ben');
  /* Handy */
  await page.setViewportSize({ width: 400, height: 860 }); await page.waitForTimeout(400);
  ok(await ev(() => !!document.querySelector('.q-list') && getComputedStyle(document.querySelector('.q-grid')).display === 'flex'), 'Handy untereinander');
  ok(!errs.length, 'keine JS-Fehler', errs);
  await browser.close();
  server.close();
  console.log((fails.length ? 'FEHLER' : 'OK') + ' queue ' + LANG + ': ' + (steps - fails.length) + '/' + steps);
  fails.forEach(f => console.log('  ✗ ' + f));
  process.exit(fails.length ? 1 : 0);
})();
