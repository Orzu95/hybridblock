/* Hybridblock – Erweiterungspunkte. Module erweitern eine Basisfunktion nicht mehr durch Überschreiben der globalen Funktion,
   sondern melden einen Filter an: hbFilter('viewEssen', 'carbs', function (html) { …; return html; }).
   Die Basisfunktion heißt <name>__base; <name>() ruft sie auf und reicht das Ergebnis der Reihe nach durch alle Filter
   (Reihenfolge = Ladereihenfolge in index.html). Ein Filter bekommt das bisherige Ergebnis und danach die Argumente des Aufrufs.
   Wirft ein Filter einen Fehler, wird er übersprungen und im Fehlerprotokoll vermerkt; die Ansicht bleibt benutzbar.
   HB_FILTERS zeigt in der Konsole, wer was erweitert. */
'use strict';
const HB_FILTERS = {};
function hbFilter(name, src, fn) {
  (HB_FILTERS[name] = HB_FILTERS[name] || []).push({ src, fn });
}
function hbRun(name, self, args, base) {
  let v = base.apply(self, args);
  const L = HB_FILTERS[name];
  if (!L) return v;
  const rest = Array.prototype.slice.call(args);
  for (let i = 0; i < L.length; i++) {
    try {
      v = L[i].fn.apply(self, [v].concat(rest));
    } catch (e) {
      logErr('filter:' + name + ':' + L[i].src, e);
    }
  }
  return v;
}

/* Einfügepunkte: Filter suchen in fertigem HTML nach einem Anker (z. B. '<div class="nr-search">') und fügen dort ein.
   hbAt / hbAtLast / hbRep melden einen fehlenden Anker im Fehlerprotokoll, statt still nichts zu tun; so fällt eine Markup-Änderung
   im Smoke-Test auf. opt = true, wenn der Anker je nach Zustand fehlen darf. */
function hbMiss(anchor, ctx) {
  logErr('anker:' + ctx, 'Einfügepunkt fehlt: ' + String(anchor).slice(0, 80), 1);
}
function hbAt(h, anchor, ctx, opt, from) {
  const i = String(h).indexOf(anchor, from || 0);
  if (i < 0 && !opt) hbMiss(anchor, ctx);
  return i;
}
function hbAtLast(h, anchor, ctx, opt) {
  const i = String(h).lastIndexOf(anchor);
  if (i < 0 && !opt) hbMiss(anchor, ctx);
  return i;
}
function hbRep(h, anchor, ctx, to, opt) {
  if (String(h).indexOf(anchor) < 0) {
    if (!opt) hbMiss(anchor, ctx);
    return h;
  }
  return h.replace(anchor, to);
}
