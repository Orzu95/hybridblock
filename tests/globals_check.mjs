// Prüft die globalen Skripte in www/ (klassische <script>-Dateien, ein gemeinsamer Namensraum):
// 1) Syntax jeder Datei, 2) doppelte Top-Level-Funktionsdeklarationen (die spätere überschreibt still die frühere),
// 3) Wrapper (`const _x = fn; fn = …`) auf Funktionen, die erst später geladen werden.
// Aufruf: node tests/globals_check.mjs [--list]   (--list gibt alle Wrapper-Ketten aus)
import { readFileSync } from 'node:fs';
import { parse } from 'acorn';
const html = readFileSync('www/index.html', 'utf8');
const files = [...html.matchAll(/<script src="([^"?]+\.js)[^"]*"><\/script>/g)].map(m => m[1]).filter(f => !/^https?:/.test(f));
const decl = new Map(); const wraps = []; let bad = 0;
const ALLOW = new Set((process.env.DUP_ALLOW || '').split(',').filter(Boolean));
files.forEach((f, idx) => {
  let ast; const src = readFileSync('www/' + f, 'utf8');
  try { ast = parse(src, { ecmaVersion: 'latest', sourceType: 'script', locations: true }); } catch (e) { console.error(`SYNTAX ${f}: ${e.message}`); bad++; return; }
  for (const n of ast.body) {
    if (n.type === 'FunctionDeclaration') { const k = n.id.name; if (!decl.has(k)) decl.set(k, []); decl.get(k).push({ f, idx, line: n.loc.start.line }); }
    if (n.type === 'VariableDeclaration') for (const d of n.declarations) { if (d.id.type === 'Identifier') { const k = d.id.name; if (!decl.has(k)) decl.set(k, []); decl.get(k).push({ f, idx, line: n.loc.start.line, v: true });
        if (d.init && d.init.type === 'Identifier' && /^_/.test(k)) wraps.push({ alias: k, target: d.init.name, f, idx, line: n.loc.start.line }); } }
  }
});
for (const [k, list] of decl) { const fns = list.filter(x => !x.v); if (fns.length > 1 && !ALLOW.has(k)) { bad++; console.error(`DOPPELT ${k}: ` + fns.map(x => `${x.f}:${x.line}`).join(', ')); } }
for (const w of wraps) { const d = (decl.get(w.target) || []).filter(x => !x.v || true)[0]; if (d && d.idx > w.idx) { bad++; console.error(`REIHENFOLGE ${w.f}:${w.line} umhüllt ${w.target}, das erst in ${d.f} definiert wird`); } }
if (process.argv.includes('--list')) { const by = {}; wraps.forEach(w => (by[w.target] = by[w.target] || []).push(w.f)); Object.entries(by).sort((a, b) => b[1].length - a[1].length).forEach(([k, v]) => console.log(String(v.length).padStart(2), k, '←', v.join(', '))); }
console.log(`${files.length} Dateien, ${decl.size} globale Namen, ${wraps.length} Wrapper, ${bad} Fehler`);
process.exit(bad ? 1 : 0);
