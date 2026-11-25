/* Hybridblock – Beschriftungen für Vorlesefunktion und Eingabefelder übersetzen (aria-label, placeholder, title).
   Viele Ansichten setzen diese Attribute auf Deutsch; hier werden sie nach dem Zeichnen über das Wörterbuch ersetzt.
   Zusammengesetzte Labels: „Woche {n}“, „Satz {n} …“, „Körperkarte vorne/hinten“. */
'use strict';
const IA_ATTR = ['aria-label', 'placeholder', 'title'];
function iaText(t) {
  let m;
  if ((m = t.match(/^Woche (\d+)$/))) return $tf('Woche {n}', { n: m[1] });
  if ((m = t.match(/^Satz (\d+) (kg|RPE|erledigt)$/))) return $tf('Satz {n} ' + m[2], { n: m[1] });
  if ((m = t.match(/^Satz (\d+) (.+)$/))) return $tf('Satz {n}', { n: m[1] }) + ' ' + $t(m[2]);
  if (t === 'Körperkarte vorne' || t === 'Körperkarte hinten') return $t(t);
  const r = $t(t);
  return r;
}
function iaRun(root) {
  if (typeof LANG === 'undefined' || LANG === 'de' || !root) return;
  root.querySelectorAll('[aria-label],[placeholder],[title]').forEach(el => {
    IA_ATTR.forEach(a => {
      const v = el.getAttribute(a);
      if (!v || !/[A-Za-zÄÖÜäöüß]{3}/.test(v)) return;
      const k = el.getAttribute('data-ia-' + a) || v;
      const r = iaText(k);
      if (r && r !== v) {
        el.setAttribute('data-ia-' + a, k);
        el.setAttribute(a, r);
      }
    });
  });
}
hbWrap('render', 'i18nattr', function (__next) {
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  queueMicrotask(() => {
    try {
      iaRun(document.body);
    } catch (e) {}
  });
  return r;
});
if (document.readyState !== 'loading') setTimeout(() => iaRun(document.body), 0);
else document.addEventListener('DOMContentLoaded', () => iaRun(document.body));
