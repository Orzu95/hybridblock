/* Plan-Editor breit (Desktop D5): Bibliothek, Wochenraster, Ziehen und Ablegen, Plan-Prüfung rechts, Strg+Z.
   Aufruf: node tests/planwide.cjs [de|en|ru]  (SHOTS=Ordner für Bildschirmfotos) */
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
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
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
  await ev(() => {
    S.meta.onboarded = true; S.meta.consent = { v: 1, at: 1 };
    S.plan = makePlan('gk3'); applyPlan(); save();
  });
  await go('#plan/me'); await page.waitForTimeout(500);
  ok(await ev(() => document.body.classList.contains('dk-pe') && !!document.querySelector('.pw-grid')), 'Layout aktiv');
  const nS = await ev(() => PE.draft.sessions.length);
  ok((await ev(() => document.querySelectorAll('.pw-week > .pe-sess').length)) === nS, 'alle Einheiten im Wochenraster', nS);
  ok(await ev(() => !!document.querySelector('.pw-side .chk-card')), 'Plan-Prüfung rechts');
  ok((await ev(() => document.querySelectorAll('.pw-ex').length)) > 20, 'Bibliothek gefüllt');
  await shot('pw_main');
  const cnt = i => ev(i => peItems(i).length, i);
  const drag = async (src, dst, dy) => {
    await src.scrollIntoViewIfNeeded();
    const a = await src.boundingBox();
    await page.mouse.move(a.x + 20, a.y + 8); await page.mouse.down(); await page.mouse.move(a.x + 40, a.y + 20, { steps: 4 });
    await dst.evaluate(el => el.scrollIntoView({ block: 'center' }));
    const b = await dst.boundingBox();
    await page.mouse.move(b.x + 30, b.y + dy, { steps: 10 }); await page.mouse.up(); await page.waitForTimeout(100);
  };
  const g = await ev(() => PE.draft.sessions.map((s, i) => (s.kind === 'gym' ? i : -1)).filter(i => i >= 0));
  ok(g.length >= 2, 'mind. 2 Kraft-Einheiten', g);
  /* Suche und Muskel-Filter */
  const qq = await ev(() => Object.values(LIB).find(e => e.name.length > 8).name.slice(0, 6));
  await page.fill('#pw-q', qq); await page.waitForTimeout(300);
  const nq = await ev(() => document.querySelectorAll('.pw-ex').length);
  ok(nq > 0 && nq < 40, 'Suche filtert', nq);
  ok(await ev(() => document.activeElement && document.activeElement.id === 'pw-q'), 'Fokus bleibt im Suchfeld');
  /* + fügt in gewählte Einheit */
  const a0 = await cnt(g[0]);
  await ev(() => document.querySelector('.pw-ex [data-act="pwAdd"]').click()); await page.waitForTimeout(250);
  ok((await cnt(g[0])) === a0 + 1, '+ fügt in Einheit 1 ein');
  ok(await ev(() => PE.dirty === true && !document.querySelector('[data-act="peSave"]').disabled), 'Speichern aktiv');
  /* Andere Einheit wählen */
  await ev(i => document.querySelector('.pe-sess[data-pwi="' + i + '"] .pe-ctl .small').click(), g[1]); await page.waitForTimeout(150);
  const b0 = await cnt(g[1]);
  await ev(() => document.querySelector('.pw-ex [data-act="pwAdd"]').click()); await page.waitForTimeout(250);
  ok((await cnt(g[1])) === b0 + 1, '+ fügt nach Klick in Einheit 2 ein');
  await page.fill('#pw-q', ''); await page.waitForTimeout(250);
  /* Bibliothek in Einheit ziehen (vor erste Übung) */
  const c0 = await cnt(g[0]);
  await drag(page.locator('.pw-ex').nth(2), page.locator('.pe-sess[data-pwi="' + g[0] + '"] .pe-row[data-slot]').first(), 3); await page.waitForTimeout(300);
  ok((await cnt(g[0])) === c0 + 1, 'Bibliothek → Einheit gezogen');
  /* Übung von Einheit 1 nach Einheit 2 verschieben */
  const mv = await ev(i => { const it = peItems(i).filter(x => !x.ss).pop(); return { slot: it.slot, ex: it.ex, sets: it.sets }; }, g[0]);
  const a1 = await cnt(g[0]), b1 = await cnt(g[1]);
  await drag(page.locator('.pe-sess[data-pwi="' + g[0] + '"] .pe-row[data-slot="' + mv.slot + '"] .pe-h'), page.locator('.pe-sess[data-pwi="' + g[1] + '"] .pe-sub'), 10); await page.waitForTimeout(300);
  ok((await cnt(g[0])) === a1 - 1 && (await cnt(g[1])) === b1 + 1, 'Übung zwischen Einheiten verschoben', [await cnt(g[0]), await cnt(g[1])]);
  ok(await ev(([i, ex]) => peItems(i).some(x => x.ex === ex), [g[1], mv.ex]), 'Übung ist in Einheit 2');
  /* Sortieren innerhalb: letzte nach oben */
  const ord0 = await ev(i => peItems(i).filter(x => !x.ss).map(x => x.slot), g[1]);
  const last = ord0[ord0.length - 1], first = await ev(i => peItems(i)[0].slot, g[1]);
  await drag(page.locator('.pe-sess[data-pwi="' + g[1] + '"] .pe-row[data-slot="' + last + '"] .pe-h'), page.locator('.pe-sess[data-pwi="' + g[1] + '"] .pe-row[data-slot="' + first + '"]'), 3); await page.waitForTimeout(300);
  ok((await ev(i => peItems(i)[0].slot, g[1])) === last, 'innerhalb der Einheit nach oben gezogen');
  await shot('pw_after');
  /* Strg+Z */
  const before = await ev(i => peItems(i)[0].slot, g[1]);
  await page.mouse.click(5, 5);
  await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
  ok((await ev(i => peItems(i)[0].slot, g[1])) !== before, 'Strg+Z nimmt zurück');
  /* schmal */
  await page.setViewportSize({ width: 1100, height: 900 }); await page.waitForTimeout(400);
  ok(await ev(() => !document.querySelector('.pw-grid') && !document.body.classList.contains('dk-pe')), 'unter 1200 px einspaltig');
  ok(!errs.length, 'keine JS-Fehler', errs);
  await browser.close();
  server.close();
  console.log((fails.length ? 'FEHLER' : 'OK') + ' planwide ' + LANG + ': ' + (steps - fails.length) + '/' + steps);
  fails.forEach(f => console.log('  ✗ ' + f));
  process.exit(fails.length ? 1 : 0);
})();
