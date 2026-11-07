/* Hybridblock – Logger-Feinschliff: fester Kopf in Gym-Einheiten (Gesamtdauer links, Pause rechts, ±10 s per Tippen)
   und nach dem letzten Satz einer Übung automatisch weiter zur nächsten offenen Übung. */
'use strict';
function sessStartMs(s) { let t0 = null; Object.values((s && s.logs) || {}).forEach(lg => (lg.sets || []).forEach(x => { if (x && x.done && x.t && (t0 == null || x.t < t0)) t0 = x.t; })); return t0; }
function lgHead(w, k) { return '<div class="lghead" id="lghead" data-w="' + w + '" data-k="' + k + '"><div class="lg-l"><span class="lg-k">' + $t('Dauer') + '</span><b class="lg-t" id="lgDur">–:–</b></div>' +
  '<div class="lg-r" id="lgRest"><button class="lg-btn" data-act="lgRest" data-v="-10" type="button" aria-label="' + esc($t('10 Sekunden weniger')) + '">−10</button><div class="lg-rt"><span class="lg-k" id="lgRestK">' + $t('Pause') + '</span><b class="lg-t" id="lgRestT">–:–</b></div><button class="lg-btn" data-act="lgRest" data-v="10" type="button" aria-label="' + esc($t('10 Sekunden mehr')) + '">+10</button></div></div>'; }
function lgTick() { const el = document.getElementById('lghead'); document.body.classList.toggle('lgon', !!el); if (!el) return; const s = peekSess(+el.dataset.w, el.dataset.k); const t0 = sessStartMs(s);
  const end = s && s.end && s.end.fin ? s.end.fin : Date.now(); const d = document.getElementById('lgDur'); if (d) d.textContent = t0 ? fmtClock((end - t0) / 1000) : '–:–';
  const on = !$('#timer').hidden && TM.end > 0, left = on ? Math.max(0, Math.round((TM.end - Date.now()) / 1000)) : 0; const r = document.getElementById('lgRest'); if (r) r.classList.toggle('on', on && left > 0);
  const rt = document.getElementById('lgRestT'); if (rt) rt.textContent = on ? Math.floor(left / 60) + ':' + pad(left % 60) : '–:–'; }
setInterval(lgTick, 500);
const _viewSessionLG = viewSession;
viewSession = function (key) { const h = _viewSessionLG.apply(this, arguments); const m = String(key || '').match(RE_SESS); if (!m || !SESS[m[2]] || !isGym(m[2])) return h;
  const i = h.indexOf('<div class="stack">'); setTimeout(lgTick, 0); return i < 0 ? lgHead(+m[1], m[2]) + h : h.slice(0, i) + lgHead(+m[1], m[2]) + h.slice(i); };
/* Satz erledigt → war es der letzte der Übung, zur nächsten offenen Übung scrollen */
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'lgRest') { if (!TM.end || $('#timer').hidden) return; const v = +b.dataset.v; TM.end += v * 1000; if (v > 0) TM.total += v; if (typeof tick === 'function') tick(); lgTick(); return; }
  if (a !== 'done' || route.name !== 'training' || !b.dataset.slot) return;
  setTimeout(() => { const card = document.getElementById('ex-' + b.dataset.slot); if (!card) return; const sets = card.querySelectorAll('.set'); if (!sets.length || [...sets].some(x => !x.classList.contains('done'))) return;
    let n = card.nextElementSibling; while (n) { if (n.classList && n.classList.contains('ex') && [...n.querySelectorAll('.set')].some(x => !x.classList.contains('done'))) break; n = n.nextElementSibling; }
    if (!n) { const all = [...document.querySelectorAll('.ex')]; n = all.find(x => x !== card && [...x.querySelectorAll('.set')].some(y => !y.classList.contains('done'))); }
    if (n) { n.scrollIntoView({ behavior: 'smooth', block: 'start' }); n.classList.add('lgnext'); setTimeout(() => n.classList.remove('lgnext'), 1600); } }, 350); });
