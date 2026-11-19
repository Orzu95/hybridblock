/* Planauswahl für einen Athleten: Empfehlung aus den Angaben des Athleten statt des Coaches.
   Aufruf: node tests/libfor.cjs [de|en|ru]  (SHOTS=Ordner für Bildschirmfotos) */
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
  const ctx = await browser.newContext({ viewport: { width: 1300, height: 900 } });
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
  const C = '11111111-1111-1111-1111-111111111111', A = 'a0000001-0000-0000-0000-000000000000', B = 'a0000002-0000-0000-0000-000000000000';
  await ev(([C, A, B]) => {
    S.meta.onboarded = true; S.meta.consent = { v: 1, at: 1 };
    S.plan = makePlan('gk3'); applyPlan();
    S.settings.q = { goal: 'strength', level: 'advanced', days: '5', minutes: '90', place: 'gym' };
    save();
    window.__calls = [];
    window.__states = {
      [A]: { state: { settings: { q: { goal: 'fatloss', level: 'beginner', days: '3', minutes: '45', place: 'gym' }, missingEq: ['bb', 'rack'] } } },
      [B]: { state: { settings: {} } }
    };
    api = async (p, o) => {
      window.__calls.push(p);
      const m = p.match(/user_state\?user_id=eq\.([^&]+)/);
      if (m) return window.__states[m[1]] ? [window.__states[m[1]]] : [];
      return [];
    };
    AUTH = { uid: C, profile: { id: C, role: 'admin', username: 'coach', display_name: 'Coach' } };
    ADMIN.clients = [{ id: A, username: 'anna', display_name: 'Anna', summary: {} }, { id: B, username: 'ben', display_name: 'Ben', summary: {} }];
    ADMIN.states = {};
  }, [C, A, B]);
  /* Athlet ohne Angaben */
  await ev(B => { ui.libFor = B; }, B);
  await go('#library'); await page.waitForTimeout(500);
  const t1 = await ev(() => document.getElementById('view').textContent);
  ok(!/Sag der App dein Ziel|Tell the app your goal|Расскажи приложению/.test(t1), 'kein „Sag der App dein Ziel“ beim Coach');
  ok(/Ben/.test(t1) && (await ev(() => !!document.querySelector('#view a[href^="#chat/"]'))), 'Hinweis mit Name und Chat-Knopf', t1.slice(0, 300));
  ok(!(await ev(() => /Für dich empfohlen|Recommended for you/.test(document.getElementById('view').textContent))), 'keine Empfehlung aus den Coach-Angaben');
  await shot('lib_noq');
  /* Coach trägt Angaben nur für die Auswahl ein */
  await ev(() => document.querySelector('[data-act="libAsk"]').click()); await page.waitForTimeout(200);
  await page.selectOption('#q-goal', 'muscle'); await page.dispatchEvent('#q-goal', 'input');
  await page.selectOption('#q-days', '4'); await page.dispatchEvent('#q-days', 'input');
  await ev(() => document.querySelector('[data-act="goalsSave"]').click()); await page.waitForTimeout(300);
  ok(await ev(() => S.settings.q.goal === 'strength' && S.settings.q.days === '5'), 'eigene Angaben des Coaches unverändert');
  ok((await ev(() => document.querySelectorAll('.libcard').length)) > 0 && (await ev(() => /Ben/.test(document.querySelector('.section-h h2').textContent))), 'Empfehlung „Für Ben empfohlen“');
  /* Athlet mit Angaben: Empfehlung aus seinen Daten */
  await ev(A => { ui.libFor = A; }, A);
  await go('#training'); await go('#library'); await page.waitForTimeout(500);
  const q = await ev(() => libQuery());
  ok(q.goal === 'fatloss' && String(q.days) === '3', 'Angaben des Athleten genutzt', q);
  ok(await ev(() => /Anna/.test(document.querySelector('.section-h h2').textContent)), 'Für Anna empfohlen');
  await shot('lib_anna');
  /* Generator nutzt Geräte des Athleten */
  const g = await ev(() => { const p = generatePlan(libQuery()); return p.sessions.flatMap(s => (s.add || []).map(x => x.ex)); });
  ok(g.length > 0 && (await ev(g => g.every(ex => !exEq(ex).some(e => ['bb', 'rack'].includes(e))), g)), 'Generator ohne Langhantel/Rack des Athleten');
  ok(await ev(() => !(S.settings.missingEq || []).includes('bb')), 'Geräte des Coaches unverändert');
  /* eigener Modus unverändert */
  await ev(() => { ui.libFor = null; });
  await go('#training'); await go('#library'); await page.waitForTimeout(300);
  ok(await ev(() => /Für dich empfohlen|Recommended for you|Рекомендуем/.test(document.getElementById('view').textContent) || document.querySelectorAll('.libcard').length > 0), 'eigene Empfehlung weiter da');
  ok(!errs.length, 'keine JS-Fehler', errs);
  await browser.close();
  server.close();
  console.log((fails.length ? 'FEHLER' : 'OK') + ' libfor ' + LANG + ': ' + (steps - fails.length) + '/' + steps);
  fails.forEach(f => console.log('  ✗ ' + f));
  process.exit(fails.length ? 1 : 0);
})();
