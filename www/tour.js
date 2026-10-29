/* ======================= EINFÜHRUNG: geführte Tour mit Spotlight auf die echten Bedienelemente ======================= */
/* Jeder Schritt hebt ein Element hervor (alles andere abgedunkelt) und erklärt es in einer Sprechblase. Überspringbar, in den Einstellungen oben wiederholbar. */
const TOUR = () => [
  { t: $t('Willkommen bei Hybridblock'), d: $t('Training, Ernährung und Erholung in einer App. Wir zeigen dir in einer Minute, wo was ist.') },
  { sel: '.tabbar a[data-r=heute]', t: $t('Heute'), d: $t('Dein Startbildschirm: die Einheit von heute, deine Bereitschaft, Gewicht und Essen auf einen Blick.') },
  { sel: '.tabbar a[data-r=training]', t: $t('Training'), d: $t('Dein Plan nach Wochen. Einheit antippen, Sätze abhaken, die Satzpause startet automatisch. Fertige Einheiten zeigen ihr Ergebnis.') },
  { sel: '.tabbar .fab', t: $t('Der Plus-Knopf'), d: $t('Für alles außerhalb des Plans: Lauf mit GPS aufzeichnen, Sport nachtragen, Essen oder Gewicht eintragen.') },
  { sel: '.tabbar a[data-r=essen]', t: $t('Essen'), d: $t('Kalorien und Makros pro Mahlzeit, Barcode-Scanner, Rezepte und Wasser. Dein Kalorienziel passt sich jede Woche an deinen Gewichtstrend an.') },
  { sel: '.tabbar a[data-r=verlauf]', t: $t('Verlauf'), d: $t('Trendgewicht, echter Kalorienbedarf, Kraft, Belastung und Schlaf über die Wochen. Tage und Balken lassen sich antippen.') },
  { sel: '.tabbar a[data-r=lernen]', t: $t('Quiz und Lernen'), d: $t('Lernkarten und kurze Quizze aus der geprüften Wissensbasis.'), opt: true },
  { sel: '.top [data-act=lvOpen]', route: 'heute', t: $t('Ansicht'), d: $t('Der Kolben zeigt, wie viel Wissenschaft du siehst: Basis, Plus oder Labor. Antippen zum Wechseln.') },
  { sel: '.top [data-act=searchOpen]', route: 'heute', t: $t('Suche'), d: $t('Findet alles in der App: Einstellungen, Übungen, Pläne, Fachbegriffe und Studien.') },
  { sel: '.top a[href="#mehr"]', route: 'heute', t: $t('Einstellungen'), d: $t('Mein Studio, Uhr verbinden, Ziele, Sprache und diese Einführung zum Wiederholen.') },
  { t: $t('Fertig!'), d: $t('Unterstrichene Begriffe wie RPE oder Deload kannst du überall antippen. Viel Erfolg beim Training.') }];
let TOUR_I = 0, TOUR_STEPS = [];
(function () { const st = document.createElement('style'); st.textContent =
  '#tour{position:fixed;inset:0;z-index:250;pointer-events:none}#tour .tdim{position:fixed;inset:0;background:rgba(20,20,20,.62);pointer-events:auto}' +
  '#tour .tspot{position:fixed;border-radius:16px;box-shadow:0 0 0 9999px rgba(20,20,20,.62),0 0 0 3px var(--ember);transition:all .28s ease;pointer-events:none}' +
  '#tour .tblock{position:fixed;inset:0;pointer-events:auto}' +
  '#tour .tbub{position:fixed;left:16px;right:16px;max-width:380px;margin:0 auto;background:var(--paper);border-radius:20px;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.3);pointer-events:auto;transition:top .28s ease}' +
  '#tour .tbub h2{margin:0 0 6px;font-size:20px}#tour .tbub p{margin:0;color:var(--graphite)}#tour .tarr{position:absolute;width:16px;height:16px;background:var(--paper);transform:rotate(45deg)}' +
  '#tour .tfoot{display:flex;align-items:center;gap:8px;margin-top:14px}#tour .tdots{display:flex;gap:5px;flex:1}#tour .tdots i{width:7px;height:7px;border-radius:50%;background:var(--rule)}#tour .tdots i.on{background:var(--ember);width:18px;border-radius:4px}' +
  '#tour .tskip{position:fixed;z-index:2;top:max(14px,env(safe-area-inset-top));left:16px;border:0;background:rgba(255,255,255,.92);border-radius:999px;padding:8px 14px;font:inherit;font-weight:700;cursor:pointer;pointer-events:auto}';
  document.head.appendChild(st); })();
function tourVisible(sel) { const el = sel && document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return r.width && r.height ? r : null; }
function tourDraw() { const el = document.getElementById('tour'); if (!el) return; const s = TOUR_STEPS[TOUR_I]; const last = TOUR_I === TOUR_STEPS.length - 1;
  const r = s.sel ? tourVisible(s.sel) : null; const pad = 6; const vh = window.innerHeight;
  const foot = '<div class="tfoot"><div class="tdots">' + TOUR_STEPS.map((_, i) => '<i class="' + (i === TOUR_I ? 'on' : '') + '"></i>').join('') + '</div>' + (TOUR_I ? '<button class="btn sm fog" data-act="tourPrev" type="button">' + $t('Zurück') + '</button>' : '') + '<button class="btn sm brand" data-act="' + (last ? 'tourEnd' : 'tourNext') + '" type="button">' + (last ? $t('Los geht’s') : $t('Weiter')) + '</button></div>';
  let html = '';
  if (r) { html += '<div class="tblock"></div><div class="tspot" style="left:' + (r.left - pad) + 'px;top:' + (r.top - pad) + 'px;width:' + (r.width + pad * 2) + 'px;height:' + (r.height + pad * 2) + 'px"></div>';
    const below = r.top < vh / 2; const top = below ? r.bottom + pad + 14 : null; const bottom = below ? null : vh - r.top + pad + 14;
    const ax = Math.max(24, Math.min(window.innerWidth - 40, r.left + r.width / 2)); html += '<div class="tbub" style="' + (below ? 'top:' + top + 'px' : 'bottom:' + bottom + 'px') + '"><div class="tarr" style="left:' + Math.max(14, Math.min(350, ax - Math.max(16, (window.innerWidth - 380) / 2) - 8)) + 'px;' + (below ? 'top:-7px' : 'bottom:-7px') + '"></div><h2>' + esc(s.t) + '</h2><p>' + esc(s.d) + '</p>' + foot + '</div>'; }
  else html += '<div class="tdim"></div><div class="tbub" style="top:50%;transform:translateY(-50%)"><h2>' + esc(s.t) + '</h2><p>' + esc(s.d) + '</p>' + foot + '</div>';
  el.innerHTML = html + '<button class="tskip" data-act="tourEnd" type="button">' + $t('Überspringen') + '</button>'; }
function tourGo(i) { TOUR_I = Math.max(0, Math.min(TOUR_STEPS.length - 1, i)); const s = TOUR_STEPS[TOUR_I]; if (s.route && route.name !== s.route) { location.hash = '#' + s.route; setTimeout(tourDraw, 380); } else tourDraw(); }
function tourOpen() { closeSheet(); TOUR_STEPS = TOUR().filter(s => !s.opt || document.querySelector(s.sel)); let el = document.getElementById('tour'); if (!el) { el = document.createElement('div'); el.id = 'tour'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', $t('Einführung')); document.body.appendChild(el); }
  if (route.name !== 'heute') { location.hash = '#heute'; setTimeout(() => tourGo(0), 380); } else tourGo(0); }
function tourEnd() { const el = document.getElementById('tour'); if (el) el.remove(); if (!S.meta.tourDone) { S.meta.tourDone = Date.now(); save(); } }
function tourMaybe() { if (typeof VIEW !== 'undefined' && VIEW) return; try { if (localStorage.getItem('hb_notour')) return; } catch (e) {} if (!S.meta.onboarded || S.meta.tourDone || route.name === 'start' || route.name === 'datenschutz' || document.getElementById('tour')) return; if (!$('#sheet').hidden) return; tourOpen(); }
const _renderTour = render; render = function () { const r = _renderTour.apply(this, arguments); setTimeout(tourMaybe, 300); if (document.getElementById('tour')) setTimeout(tourDraw, 60); return r; };
window.addEventListener('resize', () => { if (document.getElementById('tour')) tourDraw(); });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'tourNext') tourGo(TOUR_I + 1); else if (a === 'tourPrev') tourGo(TOUR_I - 1); else if (a === 'tourEnd') tourEnd(); else if (a === 'tourOpen') tourOpen(); });
/* Einstellungen: Einführung ganz oben */
const _viewMehrTour = viewMehr; viewMehr = function () { const h = _viewMehrTour(); if (VIEW) return h; const card = '<div class="card" style="display:flex;align-items:center;gap:12px"><div class="grow"><h2 style="margin:0">' + $t('Einführung') + '</h2><p class="small muted" style="margin:2px 0 0">' + $t('Der Rundgang durch die App, jederzeit wiederholbar.') + '</p></div><button class="btn sm brand" data-act="tourOpen" type="button">' + $t('Starten') + '</button></div>';
  const i = h.indexOf('<div class="stack">'); return i < 0 ? h + card : h.slice(0, i + 19) + card + h.slice(i + 19); };
setTimeout(tourMaybe, 600);
