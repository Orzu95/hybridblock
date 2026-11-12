/* Hybridblock – Health Connect automatisch synchronisieren: beim Start und wenn die App wieder in den Vordergrund kommt (höchstens alle 15 Minuten).
   Still, ohne Toast; neu gezeichnet wird nur, wenn gerade nichts eingegeben wird und kein Sheet offen ist. */
'use strict';
let HC_AUTO_T = 0;
async function hcAuto() { try { if (!HEALTH.native || HEALTH.busy || S.healthMeta.source !== 'hc' || document.hidden) return; const last = S.healthMeta.lastSync ? Date.parse(S.healthMeta.lastSync) : 0;
    if (Date.now() - Math.max(last, HC_AUTO_T) < 15 * 60e3) return; HC_AUTO_T = Date.now();
    const _t = toast, _r = render; toast = function () {}; render = function () { const a = document.activeElement; const busy = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); const sh = document.querySelector('#sheet:not([hidden])'); if (!busy && !sh) return _r.apply(this, arguments); };
    try { await hcSync(false); } finally { toast = _t; render = _r; } } catch (e) { console.warn('hcAuto', e); } }
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(hcAuto, 800); });
window.addEventListener('load', () => setTimeout(hcAuto, 2500));
