/* Hybridblock – Health Connect automatisch synchronisieren: beim Start und wenn die App wieder in den Vordergrund kommt (höchstens alle 15 Minuten).
   Still (hcSync(full, quiet)): ohne Toast; neu gezeichnet wird nur, wenn gerade nichts eingegeben wird und kein Sheet offen ist. */
'use strict';
let HC_AUTO_T = 0;
async function hcAuto() { try { if (!HEALTH.native || HEALTH.busy || S.healthMeta.source !== 'hc' || document.hidden) return; const last = S.healthMeta.lastSync ? Date.parse(S.healthMeta.lastSync) : 0;
    if (Date.now() - Math.max(last, HC_AUTO_T) < 15 * 60e3) return; HC_AUTO_T = Date.now();
    await hcSync(false, true); } catch (e) { console.warn('hcAuto', e); } }
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(hcAuto, 800); });
window.addEventListener('load', () => setTimeout(hcAuto, 2500));
