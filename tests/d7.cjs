const LANG = process.argv[2] || 'de';
/* Desktop D7 Teil 1 (Essen und Training in 2 Spalten). Aufruf: node tests/d7.cjs de|ru
   Basis: Ablauf-Test: spielt die wichtigsten Abläufe mit echten Klicks durch (ohne Backend) und prüft, was danach gespeichert ist.
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
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, geolocation: { latitude: 50.1, longitude: 8.6, accuracy: 5 }, permissions: ['geolocation'] });
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
  await ev(() => { localStorage.clear(); localStorage.setItem('hb_notour', '1'); localStorage.setItem('hb_lang', LANG); });
  await boot();
  await ev(() => { S.meta.onboarded = true; S.meta.consent = { v: 1, at: 1 }; Object.assign(S.settings, { sex: 'm', age: 31, height: 180, startWeight: 82 }); S.plan = makePlan('gk3'); applyPlan(); S.block.startedOn = today(); S.block.startAt = today(); S.settings.mode = 'rotation'; save(); });


  await ev(() => { const d = today(); S.days[d] = { entries: [{ id: 'e1', meal: 'fruehstueck', name: 'Haferflocken', kcal: 380, p: 13, f: 7, c: 60, g: 100 }] }; save(); });
  await go('#essen'); await page.waitForTimeout(400);
  ok(await ev(() => document.body.classList.contains('dk-ath') && !!document.querySelector('.d7-essen')), 'Essen 2 Spalten');
  ok(await ev(() => !!document.querySelector('.d7-r .nr-hero') && document.querySelectorAll('.d7-l .nr-meal').length >= 3 && !!document.querySelector('.d7-l .nr-search')), 'Essen: Bilanz rechts, Mahlzeiten links');
  ok(await ev(() => getComputedStyle(document.querySelector('.d7-r')).position === 'sticky'), 'rechte Spalte bleibt stehen');
  await ev(() => document.querySelector('[data-act="dprev"]').click()); await page.waitForTimeout(300);
  ok(await ev(() => !!document.querySelector('.d7-essen .d7-r .nr-hero')), 'nach Tageswechsel weiter 2 Spalten');
  await go('#training'); await page.waitForTimeout(400);
  ok(await ev(() => !!document.querySelector('.d7-training .d7-r .vol') && !!document.querySelector('.d7-l .wkcard')), 'Training: Woche links, Volumen rechts');
  await go('#verlauf'); await page.waitForTimeout(300);
  ok(await ev(() => !document.querySelector('.d7') && !document.body.classList.contains('dk-ath')), 'Verlauf unverändert');
  await page.setViewportSize({ width: 1100, height: 900 });
  await go('#essen'); await page.waitForTimeout(400);
  ok(await ev(() => !document.querySelector('.d7') && !document.body.classList.contains('dk-ath')), 'unter 1200 px einspaltig');
  ok(!errs.length, 'keine JS-Fehler', errs);
  await browser.close(); server.close();
  console.log((fails.length ? 'FEHLER' : 'OK') + ' d7 ' + LANG + ': ' + (steps - fails.length) + '/' + steps);
  fails.forEach(f => console.log('  ✗ ' + f));
  process.exit(fails.length ? 1 : 0);
})();
