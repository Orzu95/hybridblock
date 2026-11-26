/* Hybridblock – Desktop D7 (Teil 1): Athleten-Seiten Essen und Training in 2 Spalten ab 1200 px.
   Essen: links Tagebuch (Tag, Suche, Mahlzeiten), rechts fest stehend Tagesbilanz, Makros, Wasser/Gewicht, Tipps und Nährwerte.
   Training: links Woche, Einheiten und freies Training, rechts Plan, Muskelkarte und Volumen.
   Ordnet nur die vorhandenen Bausteine nach dem Zeichnen um; Handy und Tablet bleiben unverändert. */
'use strict';
const D7_MQ = window.matchMedia ? window.matchMedia('(min-width:1200px)') : { matches: false };
const d7On = () => !!(D7_MQ.matches && route && (route.name === 'essen' || (route.name === 'training' && !route.arg)) && !(typeof VIEW !== 'undefined' && VIEW && route.name === 'training'));
function d7Left(el) {
  if (route.name === 'essen') return el.matches('.daynav,.nr-search,.nr-meal,.nr-quick,.btn.block,.undo-note,[data-undo]');
  const t = (el.textContent || '').trim();
  if (el.querySelector('.vol')) return false;
  if (el.matches('.card') && (t.indexOf($t('Dein Plan')) === 0 || t.indexOf($t('Muskelkarte')) === 0)) return false;
  return true;
}
function d7Arrange() {
  document.body.classList.toggle('dk-ath', d7On());
  if (!d7On()) return;
  const st = document.querySelector('#view>.stack');
  if (!st || st.querySelector(':scope>.d7')) return;
  const kids = [...st.children];
  if (kids.length < 3) return;
  const g = document.createElement('div');
  g.className = 'd7 d7-' + route.name;
  const L = document.createElement('div'),
    R = document.createElement('div');
  L.className = 'd7-l stack';
  R.className = 'd7-r stack';
  kids.forEach(k => (d7Left(k) ? L : R).appendChild(k));
  if (!R.children.length) {
    kids.forEach(k => st.appendChild(k));
    return;
  }
  const det = R.querySelector('details.nr-det');
  if (det) det.open = true;
  g.appendChild(L);
  g.appendChild(R);
  st.appendChild(g);
}
hbWrap('render', 'd7', function (__next) {
  const r = __next.apply(this, Array.prototype.slice.call(arguments, 1));
  queueMicrotask(() => {
    try {
      d7Arrange();
    } catch (e) {
      logErr('d7', e);
    }
  });
  return r;
});
if (D7_MQ.addEventListener)
  D7_MQ.addEventListener('change', () => {
    if (route && (route.name === 'essen' || route.name === 'training')) render();
  });
