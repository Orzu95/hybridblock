/* ======================= EINFÜHRUNG: kurzer Rundgang beim ersten Start (überspringbar, in den Einstellungen wiederholbar) ======================= */
const TOUR_ICO = {
  hi: '<path d="M4 12h16M7 8v8M17 8v8M2 10v4M22 10v4"/>',
  heute: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  training: '<path d="M3 10v4M6.5 7v10M17.5 7v10M21 10v4M6.5 12h11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  essen: '<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 8c0-1.5 2-1.5 2-3M14 8c0-1.5 2-1.5 2-3"/>',
  verlauf: '<path d="M4 18l5-6 4 3 7-9"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  wissen: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>' };
const TOUR = () => [
  ['hi', $t('Willkommen bei Hybridblock'), $t('Training, Ernährung und Erholung in einer App. Der Rundgang dauert eine Minute.'), [$t('Kraft mit Autoregulation nach RPE'), $t('Cardio nach Puls und Zonen'), $t('Kalorienziel, das sich an deinen Gewichtstrend anpasst')]],
  ['heute', $t('Heute'), $t('Dein Startbildschirm: was heute ansteht und wie bereit du bist.'), [$t('Bereitschaft aus Schlaf, Ruhepuls, HRV und deinem Gefühl'), $t('Die Einheit von heute oder eine zum Nachholen'), $t('Gewicht eintragen, Kalorien und Makros auf einen Blick')]],
  ['training', $t('Training'), $t('Dein Plan nach Wochen. Tippe eine Einheit an und leg los.'), [$t('Sätze abhaken, Gewicht und Wiederholungen eintragen, RPE angeben'), $t('Die Satzpause startet automatisch'), $t('Übung tauschen, Supersatz bilden, Gerät als fehlend markieren')]],
  ['plus', $t('Der Plus-Knopf'), $t('Unten rechts. Für alles, was nicht im Plan steht.'), [$t('Lauf, Rad oder Wandern mit GPS und Live-Puls aufzeichnen'), $t('Freies Krafttraining oder eine Sportart nachtragen'), $t('Essen schnell eintragen')]],
  ['essen', $t('Essen'), $t('Kalorien und Makros pro Mahlzeit.'), [$t('Barcode scannen, suchen oder eigene Rezepte und Meal-Prep anlegen'), $t('Wasser mit festen Mengen oder eigener Menge in ml'), $t('Hake den Tag als vollständig ab, nur solche Tage zählen für die Bedarfsrechnung')]],
  ['verlauf', $t('Verlauf'), $t('Wie es sich über die Wochen entwickelt.'), [$t('Trendgewicht statt Tageszacken'), $t('Echter Kalorienbedarf aus Gewicht und Essen'), $t('Kraft pro Übung, Belastung, Schlaf, Schritte')]],
  ['check', $t('Wochen-Check-in'), $t('Einmal pro Woche schaut die App auf deine Daten und macht Vorschläge.'), [$t('Neues Kalorienziel aus deinem Trend'), $t('Mehr oder weniger Sätze, Deload vorziehen'), $t('Du entscheidest. „Warum?“ zeigt die Studienlage dazu')]],
  ['wissen', $t('Einstellungen und Wissen'), $t('Oben rechts über das Zahnrad.'), [$t('Mein Studio: Geräte abwählen, die es bei dir nicht gibt'), $t('Uhr oder Fitness-App verbinden'), $t('Wissen: 321 geprüfte Aussagen aus der Sportwissenschaft, jede mit Quelle')]]];
let TOUR_I = 0;
(function () { const st = document.createElement('style'); st.textContent =
  '#tour{position:fixed;inset:0;z-index:200;background:var(--paper);display:flex;flex-direction:column;padding:max(16px,env(safe-area-inset-top)) 20px max(20px,env(safe-area-inset-bottom));max-width:560px;margin:0 auto}' +
  '#tour .tskip{align-self:flex-end;border:0;background:var(--fog);border-radius:999px;padding:8px 14px;font:inherit;font-weight:700;cursor:pointer}' +
  '#tour .tbody{flex:1;display:flex;flex-direction:column;justify-content:center;gap:14px}' +
  '#tour .tico{width:84px;height:84px;border-radius:26px;background:var(--ember);display:grid;place-items:center}#tour .tico svg{width:46px;height:46px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
  '#tour h1{margin:6px 0 0;font-size:30px;line-height:1.1}#tour p{margin:0;color:var(--graphite)}#tour ul{margin:4px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}' +
  '#tour li{background:var(--fog);border-radius:14px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start}#tour li:before{content:"";flex:0 0 8px;height:8px;border-radius:50%;background:var(--ember);margin-top:7px}' +
  '#tour .tdots{display:flex;gap:6px;justify-content:center;margin:14px 0}#tour .tdots i{width:8px;height:8px;border-radius:50%;background:var(--rule)}#tour .tdots i.on{background:var(--ember);width:22px;border-radius:4px}' +
  '#tour .tnav{display:flex;gap:10px}#tour .tnav .btn{flex:1}';
  document.head.appendChild(st); })();
function tourHTML() { const sl = TOUR(), s = sl[TOUR_I], last = TOUR_I === sl.length - 1;
  return '<button class="tskip" data-act="tourEnd" type="button">' + $t('Überspringen') + '</button><div class="tbody"><div class="tico"><svg viewBox="0 0 24 24">' + TOUR_ICO[s[0]] + '</svg></div><h1>' + esc(s[1]) + '</h1><p>' + esc(s[2]) + '</p><ul>' + s[3].map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' +
    '<div class="tdots">' + sl.map((_, i) => '<i class="' + (i === TOUR_I ? 'on' : '') + '"></i>').join('') + '</div>' +
    '<div class="tnav">' + (TOUR_I ? '<button class="btn fog" data-act="tourPrev" type="button">' + $t('Zurück') + '</button>' : '') + '<button class="btn brand" data-act="' + (last ? 'tourEnd' : 'tourNext') + '" type="button">' + (last ? $t('Los geht’s') : $t('Weiter')) + '</button></div>'; }
function tourOpen() { TOUR_I = 0; let el = document.getElementById('tour'); if (!el) { el = document.createElement('div'); el.id = 'tour'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', $t('Einführung')); document.body.appendChild(el); } el.innerHTML = tourHTML(); }
function tourEnd() { const el = document.getElementById('tour'); if (el) el.remove(); if (!S.meta.tourDone) { S.meta.tourDone = Date.now(); save(); } }
function tourMaybe() { if (typeof VIEW !== 'undefined' && VIEW) return; try { if (localStorage.getItem('hb_notour')) return; } catch (e) {} if (!S.meta.onboarded || S.meta.tourDone || route.name === 'start' || route.name === 'datenschutz' || document.getElementById('tour')) return; if (!$('#sheet').hidden) return; tourOpen(); }
const _renderTour = render; render = function () { const r = _renderTour.apply(this, arguments); setTimeout(tourMaybe, 300); return r; };
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'tourNext') { TOUR_I = Math.min(TOUR().length - 1, TOUR_I + 1); document.getElementById('tour').innerHTML = tourHTML(); }
  else if (a === 'tourPrev') { TOUR_I = Math.max(0, TOUR_I - 1); document.getElementById('tour').innerHTML = tourHTML(); }
  else if (a === 'tourEnd') tourEnd();
  else if (a === 'tourOpen') tourOpen(); });
(function () { let x0 = null; document.addEventListener('touchstart', e => { if (e.target.closest('#tour')) x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => { if (x0 == null || !e.target.closest('#tour')) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) < 50) return;
    TOUR_I = Math.max(0, Math.min(TOUR().length - 1, TOUR_I + (dx < 0 ? 1 : -1))); document.getElementById('tour').innerHTML = tourHTML(); }, { passive: true }); })();
const _viewMehrTour = viewMehr; viewMehr = function () { const h = _viewMehrTour(); if (VIEW) return h; const i = h.lastIndexOf('</div>'); const card = '<div class="card"><h2>' + $t('Einführung') + '</h2><p class="small muted">' + $t('Der kurze Rundgang durch die App vom ersten Start.') + '</p><button class="btn fog" style="margin-top:10px" data-act="tourOpen" type="button">' + $t('Einführung ansehen') + '</button></div>';
  return i < 0 ? h + card : h.slice(0, i) + card + h.slice(i); };
setTimeout(tourMaybe, 600);
