#!/usr/bin/env python3
"""Prüft die Regel-Tabelle (www/rules.js) gegen die Wissensbank (www/evidence.json).
Fehlschlag, wenn eine Eintrags-ID fehlt oder der angegebene Grad nicht zum höchsten Grad der verknüpften Einträge passt
(App-Setzungen mit own=true müssen Grad D haben)."""
import json, re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / 'www'
src = (root / 'rules.js').read_text(encoding='utf-8')
m = re.search(r'/\*RULES\*/(.*?)/\*END\*/', src, re.S)
if not m: sys.exit('rules.js: Marker /*RULES*/ … /*END*/ fehlen')
rules = json.loads(m.group(1))
ev = {x['id']: x for x in json.loads((root / 'evidence.json').read_text(encoding='utf-8'))['items']}
err = []
for rid, r in rules.items():
    for k in ('n', 'v', 'ev', 'g', 's'):
        if k not in r: err.append(f'{rid}: Feld {k} fehlt')
    miss = [i for i in r.get('ev', []) if i not in ev]
    if miss: err.append(f'{rid}: unbekannte IDs {miss}')
    if not r.get('ev'): err.append(f'{rid}: keine Einträge verknüpft')
    gs = [ev[i]['e'] for i in r.get('ev', []) if i in ev]
    want = 'D' if r.get('own') else (min(gs) if gs else None)
    if want and r.get('g') != want: err.append(f'{rid}: Grad {r.get("g")} angegeben, aus den Einträgen ergibt sich {want}')
# Wertebereich: die Zahlen müssen im Eintrag stehen, der Regelwert muss im belegten Bereich liegen
def de_num(x): t = ('%g' % x).replace('.', ','); return t
def vals(r, key):
    v = r['v']
    if key: v = v[key]
    return [x for x in (v if isinstance(v, list) else [v]) if isinstance(x, (int, float))]
unchecked = []
for rid, r in rules.items():
    if not r.get('chk'):
        if isinstance(r.get('v'), (int, float, list, dict)) and not r.get('own'): unchecked.append(rid)
        continue
    for c in r['chk']:
        e = ev.get(c['id'])
        if not e: err.append(f'{rid}: chk-ID {c["id"]} fehlt'); continue
        txt = ' '.join([e.get('a', ''), e.get('z', ''), e.get('p', '')])
        for b in ('lo', 'hi'):
            if b in c and not re.search(r'(?<![\d,])' + re.escape(de_num(c[b])) + r'(?![\d])', txt):
                err.append(f'{rid}: Zahl {de_num(c[b])} steht nicht in {c["id"]}')
        for x in vals(r, c.get('key')):
            if ('lo' in c and x < c['lo']) or ('hi' in c and x > c['hi']):
                err.append(f'{rid}: Wert {x} liegt außerhalb des belegten Bereichs {c.get("lo", "–")}–{c.get("hi", "–")} ({c["id"]})')
if unchecked: print('Hinweis: Zahlenwert ohne Bereichsprüfung:', ', '.join(unchecked))
for e in err: print('FEHLER', e)
print(f'{len(rules)} Regeln geprüft, {len(err)} Fehler')
sys.exit(1 if err else 0)
