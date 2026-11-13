/* Smoke-Test: lädt die App im Browser (ohne Backend) und öffnet jede Ansicht in DE, EN und RU, als Athlet und als Coach, in allen drei Ansichtsstufen.
   Schlägt fehl bei JavaScript-Fehlern, bei der Fehlerkarte „Diese Ansicht konnte nicht geladen werden“ oder bei leeren Ansichten.
   Aufruf: node tests/smoke.cjs            (braucht das Paket „playwright“ mit Chromium) */
const http = require('http'); const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..', 'www');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0].replace(/\/$/, '/index.html'))); if (!p.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (e, buf) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); res.end(buf); }); });

const SEED = `(() => {
  S.meta.onboarded = true; S.meta.consent = { v: 1, at: 1 };
  Object.assign(S.settings, { sex: 'm', age: 31, height: 180, startWeight: 82, goalWeight: 78, goalRate: 0.5, carbCycle: true });
  S.plan = makePlan('gk3'); applyPlan(); S.block.startedOn = addDays(today(), -9); S.block.startAt = addDays(today(), -9);
  const k = ORDER[0]; const s = sess(1, k); s.date = addDays(today(), -8); s.done = true; s.logs = s.logs || {};
  planFor(1, k).forEach(p => { s.logs[p.slot] = Array.from({ length: p.sets || 3 }, () => ({ w: 60, r: 8, rpe: 8, done: true })); });
  for (let i = 24; i >= 0; i--) { const d = addDays(today(), -i); const o = dayObj(d); o.weight = 82 - (24 - i) * 0.05; o.complete = i > 0;
    o.entries = [{ id: uid(), name: 'Test Quark', kcal: 650, p: 60, f: 15, c: 60, meal: 'b', qty: 500, unit: 'g' }, { id: uid(), name: 'Test Reis', kcal: 1500, p: 80, f: 40, c: 200, meal: 'l', qty: 400, unit: 'g' }]; }
  S.health = S.health || {}; for (let i = 10; i >= 0; i--) { const d = addDays(today(), -i); S.health[d] = { steps: 8000 + i * 100, rhr: 52, sleep: 7.2, hrv: 60 }; }
  const a = newActivity(Object.keys(ACT_MAP).find(t => ACT_MAP[t].run) || Object.keys(ACT_MAP)[0], addDays(today(), -2)); Object.assign(a, { dur: '42', dist: '7.5', rpe: 5 });
  S.meta.pause = null; save(); return { key: sKey(1, k), act: a.id };
})()`;
const COACH = `(() => { AUTH = { uid: 'c1', access_token: 'x', expires_at: 9e9, profile: { role: 'admin', username: 'coach' } };
  ADMIN.clients = [{ id: 'a1', username: 'athlet', display_name: 'Athlet Eins', summary: Object.assign({}, makeSummary(), { shift: 'coach', late: 1, lateList: [] }), updated_at: new Date().toISOString() }];
  ADMIN.states = ADMIN.states || {}; return 1; })()`;

(async () => {
  await new Promise(r => server.listen(0, r)); const base = 'http://localhost:' + server.address().port + '/'; const browser = await chromium.launch(); const fails = []; let views = 0;
  for (const lang of ['de', 'en', 'ru']) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); await ctx.route('**/*supabase.co/**', r => r.abort()); await ctx.route(/openfoodfacts|openfreemap|exercise-dataset/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('dialog', d => d.dismiss());
    await page.goto(base); await page.evaluate(l => { localStorage.clear(); localStorage.setItem('hb_notour', '1'); localStorage.setItem('hb_lang', l); }, lang); await page.reload(); await page.waitForTimeout(700);
    if (errs.length) fails.push(`[${lang}] Laden: ${errs.join(' | ')}`);
    const ids = await page.evaluate(SEED);
    const visit = async (hash, who) => { errs.length = 0; await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(160); await page.evaluate(() => render());
      const r = await page.evaluate(() => { const v = document.getElementById('view'); return { err: !!v.querySelector('[data-view-error]'), msg: (v.querySelector('[data-view-error] .src') || {}).textContent || '', len: v.textContent.trim().length }; }); views++;
      if (r.err) fails.push(`[${lang}/${who}] ${hash}: Fehlerkarte (${r.msg})`); else if (r.len < 20) fails.push(`[${lang}/${who}] ${hash}: leer`); if (errs.length) fails.push(`[${lang}/${who}] ${hash}: ${errs.join(' | ')}`); };
    const routes = ['#heute', '#training', '#training/' + ids.key, '#frei/' + ids.act, '#essen', '#ernaehrung', '#verlauf', '#mehr', '#library', '#wissen', '#lernen', '#datenschutz', '#track', '#planend'];
    for (const lv of [1, 2, 3]) { await page.evaluate(v => setLv(v), lv); for (const h of routes) await visit(h, 'Stufe ' + lv); }
    /* Pause und Wiedereinstieg */
    await page.evaluate(() => { S.meta.pause = { why: 'sick', from: addDays(today(), -3) }; save(); }); for (const h of ['#heute', '#training', '#essen']) await visit(h, 'Pause');
    await page.evaluate(() => { S.meta.pause = null; save(); });
    /* Coach */
    await page.evaluate(COACH); for (const h of ['#heute', '#admin', '#admin/a1', '#termine', '#chats', '#library', '#mehr']) await visit(h, 'Coach');
    await page.evaluate(() => { PE.uid = 'a1'; PE.draft = JSON.parse(JSON.stringify(S.plan)); PE.name = 'Athlet'; }); await visit('#plan/a1', 'Coach');
    await ctx.close();
  }
  await browser.close(); server.close();
  if (fails.length) { console.error(fails.join('\n')); console.error(`${fails.length} Fehler in ${views} Ansichten`); process.exit(1); }
  console.log(`Smoke-Test ok: ${views} Ansichten in 3 Sprachen ohne Fehler`);
})().catch(e => { console.error(e); process.exit(1); });
