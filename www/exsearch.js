/* Hybridblock – Übungssuche in allen Sprachen: Deutsch und Englisch werden immer erkannt (beim Russischen zusätzlich Russisch),
   dazu gängige Gym-Namen (Military Press, OHP, RDL …) und Kürzel (LH/KH, BB/DB). Jedes Suchwort muss vorkommen,
   die Reihenfolge ist egal („shoulder press“ findet „Seated dumbbell shoulder press“ und „KH-Schulterdrücken sitzend“). */
'use strict';
const EXS = { hay: {}, en: false, rev: null };
const exNorm = s =>
  String(s || '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/g, ' ')
    .trim();
/* gängige Zusatznamen pro Übung */
const EX_ALIAS = {
  ohp: 'military press ohp overhead press shoulder press strict press langhantel drucken',
  db_ohp: 'ohp overhead press shoulder press military',
  machine_ohp: 'overhead press shoulder press ohp',
  push_press: 'schwungdrucken',
  bench: 'flat bench flachbank bench press bankdrucken',
  db_bench: 'flat bench flachbank',
  cg_bench: 'close grip',
  squat: 'back squat ruckenkniebeuge',
  fs: 'frontkniebeuge',
  rdl: 'romanian deadlift rumanisches kreuzheben stiff leg',
  dl: 'deadlift kreuzheben',
  hip_thrust: 'hip thrust huftstoss glute bridge',
  pullup: 'pull up pullup klimmzug chin',
  chinup: 'chin up chinup',
  lat_pd: 'lat pulldown latziehen',
  row: 'barbell row rudern',
  tri_pd: 'pushdown trizepsdrucken',
  lunge: 'lunge ausfallschritt',
  split_squat: 'bulgarian split squat bss'
};
const EX_TOK = { lh: 'langhantel barbell bb', kh: 'kurzhantel dumbbell db', bb: 'barbell langhantel', db: 'dumbbell kurzhantel', kb: 'kettlebell' };
/* Englisches Wörterbuch einmalig nachladen (für Deutsch und Russisch), danach laufende Suche auffrischen */
function exsEnsureEn() {
  if (EXS.en || LANG === 'en' || typeof loadLangFile !== 'function') return;
  EXS.en = true;
  loadLangFile('en').then(() => {
    EXS.hay = {};
    const a = document.activeElement;
    if (a && (a.id === 'peq' || a.id === 'exq' || a.id === 'pw-q' || a.id === 'sr-q')) a.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
function exsRev() {
  if (EXS.rev || LANG === 'de') return EXS.rev;
  const D = I18N[LANG] || {};
  EXS.rev = {};
  Object.keys(D).forEach(k => {
    if (typeof D[k] === 'string' && D[k].length < 80) EXS.rev[D[k]] = k;
  });
  return EXS.rev;
}
/* deutscher Quellname einer Übung */
function exDe(e) {
  if (!e) return '';
  if (LANG === 'de') return e.name;
  const r = exsRev();
  return (r && r[e.name]) || e.name;
}
function exHay(e) {
  if (!e) return '';
  if (EXS.hay[e.id]) return EXS.hay[e.id];
  const de = exDe(e);
  const en = LANG === 'en' ? e.name : (I18N.en || {})[de] || '';
  const mus = Object.keys(e.muscles || {})
    .filter(m => e.muscles[m] >= 1)
    .map(m => {
      const md = typeof MUSCLES !== 'undefined' ? MUSCLES[m] : '';
      const mde = LANG === 'de' ? md : (exsRev() || {})[md] || md;
      return md + ' ' + mde + ' ' + ((I18N.en || {})[mde] || '');
    })
    .join(' ');
  let h = exNorm([e.name, de, en, e.id.replace(/_/g, ' '), EX_ALIAS[e.id] || '', mus].join(' '));
  const extra = h
    .split(' ')
    .map(w => EX_TOK[w] || '')
    .join(' ');
  h = h + ' ' + extra;
  if (EXS.en || LANG === 'en') EXS.hay[e.id] = h;
  return h;
}
function exMatch(e, q) {
  const w = exNorm(q).split(' ').filter(Boolean);
  if (!w.length) return true;
  exsEnsureEn();
  const h = ' ' + exHay(e) + ' ';
  return w.every(x => h.includes(' ' + x) || (x.length > 3 && h.includes(x)));
}
/* Treffer sortieren: Name beginnt mit dem Suchwort zuerst */
function exSearch(list, q) {
  const n = exNorm(q);
  const L = list.filter(e => exMatch(e, q));
  if (!n) return L;
  return L.map(e => [exNorm(e.name).startsWith(n) ? 0 : exNorm(e.name).includes(n) ? 1 : 2, e])
    .sort((a, b) => a[0] - b[0])
    .map(x => x[1]);
}
