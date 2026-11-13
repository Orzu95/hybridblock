/* Hybridblock – Erweiterungspunkte. Module erweitern eine Basisfunktion nicht mehr durch Überschreiben der globalen Funktion,
   sondern melden einen Filter an: hbFilter('viewEssen', 'carbs', function (html) { …; return html; }).
   Die Basisfunktion heißt <name>__base; <name>() ruft sie auf und reicht das Ergebnis der Reihe nach durch alle Filter
   (Reihenfolge = Ladereihenfolge in index.html). Ein Filter bekommt das bisherige Ergebnis und danach die Argumente des Aufrufs.
   Wirft ein Filter einen Fehler, wird er übersprungen und im Fehlerprotokoll vermerkt; die Ansicht bleibt benutzbar.
   HB_FILTERS zeigt in der Konsole, wer was erweitert. */
'use strict';
const HB_FILTERS = {};
function hbFilter(name, src, fn) { (HB_FILTERS[name] = HB_FILTERS[name] || []).push({ src, fn }); }
function hbRun(name, self, args, base) { let v = base.apply(self, args); const L = HB_FILTERS[name]; if (!L) return v; const rest = Array.prototype.slice.call(args);
  for (let i = 0; i < L.length; i++) { try { v = L[i].fn.apply(self, [v].concat(rest)); } catch (e) { logErr('filter:' + name + ':' + L[i].src, e); } } return v; }
