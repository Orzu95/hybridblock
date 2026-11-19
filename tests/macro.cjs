/* Makro-Regler: Athlet unter Essen und Coach im Plan-Editor.
   Aufruf: node tests/macro.cjs [de|en|ru]  (SHOTS=Ordner für Bildschirmfotos) */
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
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 } });
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
    S.plan = makePlan('gk3'); applyPlan();
    S.settings.startKcal = '2400'; S.settings.protein = '160'; S.settings.fat = '70'; S.settings.trackMode = 'full';
    S.checkins = [];
    S.days[today()] = { entries: [], weight: '80' };
    save();
  });
  await go('#essen');
  ok(await ev(() => !!document.querySelector('[data-act="msOpen"]')), 'Knopf „Makros anpassen“ unter Essen');
  const t0 = await ev(() => currentTargets());
  await ev(() => document.querySelector('[data-act="msOpen"]').click()); await page.waitForTimeout(250);
  ok(await ev(() => !!document.querySelector('.ms-ring') && document.querySelectorAll('.ms-sl').length === 3), 'Ring und 3 Regler');
  await shot('ms_open');
  /* Fett auf 100 g, Kohlenhydrate gleichen aus */
  await page.fill('[data-msk="f"]', '100'); await page.dispatchEvent('[data-msk="f"]', 'change'); await page.waitForTimeout(200);
  const o1 = await ev(() => Object.assign({}, MS.o));
  ok(o1.f === 100 && o1.c === Math.round((2400 - 4 * 160 - 900) / 4), 'Fett 100 g → Kohlenhydrate gleichen aus', o1);
  ok(await ev(() => !!document.querySelector('.ms-st.ok')), 'Status passt');
  await shot('ms_fat');
  /* Ausgleich „selbst“: Protein +20 → Differenz und Vorschläge */
  await ev(() => document.querySelector('[data-act="msRest"][data-v="none"]').click()); await page.waitForTimeout(150);
  await ev(() => { document.querySelector('[data-act="msStep"][data-k="p"][data-d="5"]').click(); }); await page.waitForTimeout(100);
  await ev(() => { document.querySelector('[data-act="msStep"][data-k="p"][data-d="5"]').click(); }); await page.waitForTimeout(150);
  ok(await ev(() => !!document.querySelector('.ms-st.off') && document.querySelector('[data-act="msSave"]').disabled), 'Differenz angezeigt, Speichern gesperrt');
  const fixes = await ev(() => [...document.querySelectorAll('[data-act="msFix"]')].map(b => b.dataset.k + b.dataset.g));
  ok(fixes.includes('c-10') && fixes.some(x => x.startsWith('f')), 'Vorschläge Kohlenhydrate −10 g / Fett', fixes);
  await shot('ms_diff');
  await ev(() => document.querySelector('[data-act="msFix"][data-k="c"]').click()); await page.waitForTimeout(150);
  ok(await ev(() => !!document.querySelector('.ms-st.ok') && !document.querySelector('[data-act="msSave"]').disabled), 'Nach Ausgleich passt es');
  await ev(() => document.querySelector('[data-act="msSave"]').click()); await page.waitForTimeout(250);
  const t1 = await ev(() => currentTargets());
  ok(t1.kcal === t0.kcal && t1.p === 170 && t1.f === 100 && Math.abs(4 * t1.p + 9 * t1.f + 4 * t1.c - t1.kcal) <= 4, 'gespeichert, Kalorienziel gleich', t1);
  ok(await ev(() => /eigene Aufteilung|own split|своё распределение/i.test(document.querySelector('.ms-entry').textContent)), 'Hinweis „eigene Aufteilung aktiv“');
  /* neues Kalorienziel aus Check-in: Fett/Protein bleiben, KH gleichen aus */
  await ev(() => { S.checkins = [{ date: today(), kcal: 2200, p: 160, f: 70, c: 0, tdee: 2700 }]; });
  const t2 = await ev(() => currentTargets());
  ok(t2.kcal === 2200 && t2.f === 100 && t2.p === 170 && t2.c === Math.round((2200 - 680 - 900) / 4), 'Check-in ändert nur das Ausgleichs-Makro', t2);
  /* Zurück zum Vorschlag */
  await ev(() => document.querySelector('[data-act="msOpen"]').click()); await page.waitForTimeout(200);
  await ev(() => document.querySelector('[data-act="msReset"]').click()); await page.waitForTimeout(200);
  ok(await ev(() => !S.settings.macro && currentTargets().f === 70), 'Vorschlag der App wiederhergestellt');
  /* Fett-Minimum */
  await ev(() => document.querySelector('[data-act="msOpen"]').click()); await page.waitForTimeout(200);
  await page.fill('[data-msk="f"]', '10'); await page.dispatchEvent('[data-msk="f"]', 'change'); await page.waitForTimeout(150);
  ok(await ev(() => MS.o.f === fatFloor(MS.o.kcal)), 'Fett nicht unter Minimum');
  await ev(() => closeSheet());
  /* Coach im Plan-Editor */
  const C = '11111111-1111-1111-1111-111111111111', A = 'a0000001-0000-0000-0000-000000000000';
  await ev(([C, A]) => {
    AUTH = { uid: C, profile: { id: C, role: 'admin', username: 'coach', display_name: 'Coach' } };
    ADMIN.clients = [{ id: A, username: 'anna', display_name: 'Anna', summary: { kcalT: 2000, protT: 130, trend: 62 } }];
    PE.uid = A; PE.draft = JSON.parse(JSON.stringify(makePlan('gk3'))); PE.draft.targets = { kcal: 2000 }; PE.dirty = false;
    msOpen('pe');
  }, [C, A]); await page.waitForTimeout(200);
  ok(await ev(() => !!document.querySelector('[data-msk="kcal"]')), 'Coach kann Kalorien einstellen');
  await page.fill('[data-msk="f"]', '80'); await page.dispatchEvent('[data-msk="f"]', 'change'); await page.waitForTimeout(150);
  await ev(() => document.querySelector('[data-act="msSave"]').click()); await page.waitForTimeout(200);
  const tg = await ev(() => Object.assign({ dirty: PE.dirty }, PE.draft.targets));
  ok(tg.fat === 80 && tg.macro && tg.macro.f === 80 && tg.macro.rest === 'c' && tg.dirty, 'Plan-Vorgabe mit Aufteilung', tg);
  /* Athlet bekommt die Vorgabe */
  await ev(([C, tg]) => {
    AUTH = { uid: 'x', profile: { id: 'x', role: 'athlete', coach_id: C } };
    S.settings.macro = { p: 200, f: 120, c: 100, rest: 'c' };
    const p = JSON.parse(JSON.stringify(S.plan)); p.targets = Object.assign({}, tg, { at: new Date().toISOString() });
    setPlan(p, true);
  }, [C, tg]); await page.waitForTimeout(200);
  const t3 = await ev(() => Object.assign({ m: S.settings.macro }, currentTargets()));
  ok(t3.f === 80 && t3.m && t3.m.by === 'coach' && t3.kcal === tg.kcal, 'Coach-Vorgabe ersetzt eigene Aufteilung', t3);
  ok(!errs.length, 'keine JS-Fehler', errs);
  await browser.close();
  server.close();
  console.log((fails.length ? 'FEHLER' : 'OK') + ' macro ' + LANG + ': ' + (steps - fails.length) + '/' + steps);
  fails.forEach(f => console.log('  ✗ ' + f));
  process.exit(fails.length ? 1 : 0);
})();
