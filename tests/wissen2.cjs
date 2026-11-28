const LANG = process.argv[2] || 'de';
/* Wissen 2: neue Wissenskarten, Quiz je Stufe, Fakt des Tages. Aufruf: node tests/wissen2.cjs de|ru
   Alt: Desktop D7 Teil 1 (Essen und Training in 2 Spalten) und Teil 2 (Wochenplaner, Tag kopieren, Rezept mit Kochgewicht, Verlauf 2×2). Aufruf: node tests/d7.cjs de|ru
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
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, geolocation: { latitude: 50.1, longitude: 8.6, accuracy: 5 }, permissions: ['geolocation'] });
  await ctx.route('**/*supabase.co/**', r => r.abort());
  await ctx.route(/openfoodfacts|openfreemap|exercise-dataset/, r => r.abort());
  await ctx.addInitScript(l => { if (!sessionStorage.getItem('w2i')) { localStorage.clear(); localStorage.setItem('hb_notour', '1'); localStorage.setItem('hb_lang', l); sessionStorage.setItem('w2i', '1'); } }, LANG);
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('dialog', d => d.accept());
  const go = async h => { await page.evaluate(x => { location.hash = x; }, h); await page.waitForTimeout(350); };
  const ev = (f, a) => page.evaluate(f, a);
  const boot = async () => { await page.goto(base); await page.waitForTimeout(700); };
  await boot();
  await ev(() => { S.meta.onboarded = true; S.meta.consent = { v: 1, at: 1 }; Object.assign(S.settings, { sex: 'm', age: 31, height: 180, startWeight: 82, view: 1, spowi: false }); S.plan = makePlan('gk3'); applyPlan(); S.block.startedOn = today(); S.block.startAt = today(); save(); });
  await go('#heute'); await page.waitForTimeout(1500); await ev(() => render()); await page.waitForTimeout(400);
  const de = LANG === 'de';
  ok(await ev(() => !!EVID && EVID.items.length === 546), 'Wissensbasis geladen');
  const nW = await ev(() => EVID.items.filter(x => x.w).length);
  if (de) ok(nW === 546, 'alle 546 mit neuer Karte', nW); else ok(nW === 0 || nW === 546, 'RU: alt oder komplett', nW);
  ok(await ev(() => !!document.querySelector('.fct')), 'Fakt des Tages sichtbar');
  if (de) {
    ok(await ev(() => !!document.querySelector('.fct .w2 .w2t')), 'Fakt im neuen Kartenformat');
    ok(await ev(() => !document.querySelector('.fct .w2kern')), 'Fakt kurz (ohne Kernaussagen)');
    ok(await ev(() => !!document.querySelector('.fct .w2src')), 'Quelle unten klein');
    const hid = await ev(() => factPool().some(o => o.x.w && o.x.w.h));
    ok(!hid, 'Prüf-Einträge nicht im Fakt-Pool');
    ok(await ev(() => EVID.by['CAR-117'].sl === undefined), 'Prüf-Eintrag ohne Lernkarte');
    /* Stufen */
    const q1 = await ev(() => EVID.by['NRG-109'].sl.q.q);
    await ev(() => { S.settings.view = 3; S.settings.spowi = true; });
    const q3 = await ev(() => EVID.by['NRG-109'].sl.q.q);
    ok(q1 !== q3 && /Labormessung/.test(q3), 'Quizfrage folgt der Stufe', [q1, q3]);
    await ev(() => evSheet(['NRG-109'])); await page.waitForTimeout(300);
    ok(await ev(() => !!document.querySelector('#sheet .w2 .w2lab') && document.querySelectorAll('#sheet .w2kern li').length === 3), 'Labor: ganze Karte mit Studiendesign');
    await ev(() => closeSheet());
    await ev(() => { S.settings.view = 1; S.settings.spowi = false; });
    await ev(() => evSheet(['NRG-109'])); await page.waitForTimeout(300);
    ok(await ev(() => !document.querySelector('#sheet .w2lab') && !document.querySelector('#sheet .w2kern')), 'Basis: ohne Fachteile');
    await ev(() => closeSheet());
  }
  /* Quiz durchspielen */
  await ev(() => qzStart(4)); await page.waitForTimeout(500);
  ok(await ev(() => document.querySelectorAll('.qzo').length >= 2), 'Quiz zeigt Antworten');
  for (let i = 0; i < 4; i++) {
    await ev(() => document.querySelector('.qzo:not([disabled])').click()); await page.waitForTimeout(250);
    ok(await ev(() => !!document.querySelector('.qzx')), 'Erklärung nach Antwort ' + (i + 1));
    if (de && i === 0) ok(await ev(() => !!document.querySelector('.qzx .w2src')), 'Erklärung mit Quelle');
    await ev(() => document.querySelector('[data-act="qzNext"]').click()); await page.waitForTimeout(250);
  }
  ok(await ev(() => !!document.querySelector('.qzflask')), 'Quiz-Ergebnis');
  ok(await ev(() => QZ.items.every(q => !EVID.by[q.id].w || !EVID.by[q.id].w.h)), 'keine Prüf-Einträge im Quiz');
  await go('#heute'); await page.waitForTimeout(300);
  if (de) {
    await ev(() => document.querySelector('.fct').scrollIntoView()); await page.waitForTimeout(200);
    await (await page.$('.fct')).screenshot({ path: '/tmp/w2-fct.png' });
    await ev(() => { S.settings.view = 3; S.settings.spowi = true; evSheet(['NRG-109']); }); await page.waitForTimeout(400);
    await (await page.$('#sheet')).screenshot({ path: '/tmp/w2-sheet.png' });
    await ev(() => closeSheet());
    await ev(() => { S.settings.view = 2; S.settings.spowi = false; QZ = null; qzStart(3); }); await page.waitForTimeout(400);
    await ev(() => document.querySelector('.qzo').click()); await page.waitForTimeout(300);
    await page.screenshot({ path: '/tmp/w2-quiz.png', fullPage: true });
  }
  ok(!errs.length, 'keine JS-Fehler', errs.slice(0, 3));
  console.log((fails.length ? 'FEHLER ' : 'OK ') + steps + ' Prüfungen' + (fails.length ? '\n - ' + fails.join('\n - ') : ''));
  await browser.close(); server.close(); process.exit(fails.length ? 1 : 0);
})();
