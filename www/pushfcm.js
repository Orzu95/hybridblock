/* Hybridblock – echtes Push bei geschlossener App (Firebase Cloud Messaging über @capacitor/push-notifications).
   Nur in der Android-App und nur, wenn der Build Firebase enthält (push.json mit ready:true, erzeugt im Build aus dem Secret).
   Gesendet wird serverseitig (Trigger → Edge Function push-send) bei: neuer Nachricht, Planänderung durch den Coach, Formcheck-Video, Coach-Kommentar. */
'use strict';
const PUSH = { st: null, tok: null, get p() { const C = window.Capacitor; return C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.PushNotifications; } };
async function pushReady() { if (PUSH.st !== null) return PUSH.st; PUSH.st = false; if (!PUSH.p) return false;
  try { const r = await fetch('push.json', { cache: 'no-store' }); if (r.ok) { const j = await r.json(); PUSH.st = !!j.ready; } } catch (e) {} return PUSH.st; }
async function pushSaveToken(token) { if (!AUTH || !AUTH.uid || !token) return; PUSH.tok = token;
  try { await api('/rest/v1/push_tokens?on_conflict=token', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ token, user_id: AUTH.uid, platform: 'android', lang: (typeof LANG !== 'undefined' && LANG) || 'de', updated_at: new Date().toISOString() }) }); } catch (e) { console.warn('push token', e); } }
let PUSH_BOUND = false;
async function pushInit() { if (!AUTH || !AUTH.uid || VIEW || !(await pushReady())) return; const P = PUSH.p;
  try { if (!PUSH_BOUND) { PUSH_BOUND = true;
      P.addListener('registration', t => pushSaveToken(t.value));
      P.addListener('registrationError', e => console.warn('push reg', e));
      P.addListener('pushNotificationActionPerformed', a => { const d = (a && a.notification && a.notification.data) || {};
        const to = d.route === 'chat' ? (d.from && typeof isAdmin === 'function' && isAdmin() ? '#chat/' + d.from : '#chat') : d.route === 'admin' ? (d.from ? '#admin/' + d.from : '#admin') : '#' + (d.route || 'heute');
        setTimeout(() => { location.hash = to; if (typeof pullAll === 'function') pullAll({ quiet: true }).then(() => render()).catch(() => {}); }, 300); }); }
    let perm = await P.checkPermissions(); if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') perm = await P.requestPermissions();
    if (perm.receive !== 'granted') return; if (typeof hbChannels === 'function') await hbChannels(); await P.register(); } catch (e) { console.warn('push', e); } }
/* Beim Abmelden den Token dieses Geräts entfernen, damit das nächste Konto keine fremden Benachrichtigungen bekommt */
async function pushDrop() { const t = PUSH.tok; if (!t || !AUTH) return; try { await api('/rest/v1/push_tokens?token=eq.' + encodeURIComponent(t), { method: 'DELETE' }); } catch (e) {} PUSH.tok = null; }
let PUSH_UID = null;
const _pullAllPush = pullAll;
pullAll = async function () { const r = await _pullAllPush.apply(this, arguments); if (AUTH && AUTH.uid && PUSH_UID !== AUTH.uid) { PUSH_UID = AUTH.uid; pushInit(); } return r; };
const _logoutPush = logout;
logout = async function () { await pushDrop(); PUSH_UID = null; return _logoutPush.apply(this, arguments); };
