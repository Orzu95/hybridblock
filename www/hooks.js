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
/* Für Erweiterungen, die vor dem Aufruf eingreifen, Argumente ändern, den Aufruf auslassen oder asynchron sind:
   hbWrap('switchPlan', 'safety', function (next, id) { if (!ok(id)) return; return next(id); });
   next ruft die Basisfunktion samt aller früher geladenen Erweiterungen auf. */
function hbWrap(name, src, fn) {
  (HB_FILTERS[name] = HB_FILTERS[name] || []).push({ src, fn, around: true });
}
/* Führt Basis und Erweiterungen in Ladereihenfolge aus: Erweiterung i sieht das Ergebnis von Basis + Erweiterungen 0 … i−1. */
function hbRun(name, self, args, base) {
  const L = HB_FILTERS[name];
  if (!L) return base.apply(self, args);
  const call = function (i, a) {
    if (i < 0) return base.apply(self, a);
    const x = L[i];
    if (x.around) {
      const next = function () {
        return call(i - 1, arguments);
      };
      return x.fn.apply(self, [next].concat(Array.prototype.slice.call(a)));
    }
    let v = call(i - 1, a);
    try {
      v = x.fn.apply(self, [v].concat(Array.prototype.slice.call(a)));
    } catch (e) {
      logErr('filter:' + name + ':' + x.src, e);
    }
    return v;
  };
  return call(L.length - 1, args);
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
