import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

/* Push-Benachrichtigungen über Firebase Cloud Messaging (HTTP v1).
   Aufruf nur durch Datenbank-Trigger (pg_net) mit geheimem Header x-hook-secret; der Inhalt wird hier gebaut, nicht vom Aufrufer übernommen.
   Ereignisse: msg (neue Nachricht), plan (Coach hat den Plan geändert), form (neues Formcheck-Video für den Coach), formc (Coach hat kommentiert).
   Secret FCM_SERVICE_ACCOUNT = JSON des Firebase-Dienstkontos. Ungültige Tokens werden gelöscht. */
const SB = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const TXT: Record<string, Record<string, [string, string]>> = {
  de: { msg: ['Neue Nachricht', '{n} hat dir geschrieben.'], plan: ['Neuer Plan', 'Dein Coach hat deinen Plan aktualisiert.'], form: ['Neuer Formcheck', '{n} hat ein Video hochgeladen.'], formc: ['Formcheck kommentiert', 'Dein Coach hat dein Video kommentiert.'] },
  en: { msg: ['New message', '{n} sent you a message.'], plan: ['New plan', 'Your coach updated your plan.'], form: ['New form check', '{n} uploaded a video.'], formc: ['Form check reviewed', 'Your coach commented on your video.'] },
  ru: { msg: ['Новое сообщение', '{n}: новое сообщение.'], plan: ['Новый план', 'Тренер обновил твой план.'], form: ['Новая проверка техники', '{n}: новое видео.'], formc: ['Видео прокомментировано', 'Тренер прокомментировал твоё видео.'] },
};
const ROUTE: Record<string, string> = { msg: 'chat', plan: 'training', form: 'admin', formc: 'training' };

const b64u = (b: ArrayBuffer | Uint8Array | string) => { const s = typeof b === 'string' ? b : String.fromCharCode(...new Uint8Array(b as ArrayBuffer)); return btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_'); };
let TOKEN: { v: string; exp: number } | null = null;
async function accessToken(sa: any) {
  if (TOKEN && TOKEN.exp > Date.now() + 60_000) return TOKEN.v;
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64u(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(head + '.' + claim));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + head + '.' + claim + '.' + b64u(sig) });
  const j = await r.json(); if (!j.access_token) throw new Error('oauth ' + r.status);
  TOKEN = { v: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 }; return TOKEN.v;
}

Deno.serve(async req => {
  if (req.method !== 'POST') return new Response('method', { status: 405 });
  const sec = req.headers.get('x-hook-secret') || '';
  const { data: ok } = await SB.rpc('push_hook_ok', { p_secret: sec });
  if (!ok) return new Response('forbidden', { status: 403 });
  const raw = Deno.env.get('FCM_SERVICE_ACCOUNT'); if (!raw) return new Response('not configured', { status: 200 });
  let body: any; try { body = await req.json(); } catch { return new Response('bad json', { status: 400 }); }
  const ev = String(body.event || ''); if (!ROUTE[ev] || !body.to) return new Response('bad event', { status: 400 });
  const { data: toks } = await SB.from('push_tokens').select('token,lang').eq('user_id', body.to);
  if (!toks || !toks.length) return new Response('no tokens');
  let name = '';
  if (body.from && (ev === 'msg' || ev === 'form')) { const { data: p } = await SB.from('profiles').select('display_name,username').eq('id', body.from).maybeSingle(); name = (p && (p.display_name || p.username)) || ''; }
  const sa = JSON.parse(raw); const at = await accessToken(sa); let sent = 0;
  for (const t of toks) {
    const L = TXT[t.lang || 'de'] || TXT.de; const [title, txt] = L[ev];
    const msg = { message: { token: t.token, notification: { title, body: txt.replace('{n}', name || (t.lang === 'en' ? 'Someone' : t.lang === 'ru' ? 'Кто-то' : 'Jemand')) },
      data: { route: ROUTE[ev], ref: String(body.ref || ''), from: String(body.from || '') }, android: { priority: 'HIGH', notification: { channel_id: 'coaching', tag: ev + ':' + (body.from || '') } } } };
    const r = await fetch('https://fcm.googleapis.com/v1/projects/' + sa.project_id + '/messages:send', { method: 'POST', headers: { Authorization: 'Bearer ' + at, 'Content-Type': 'application/json' }, body: JSON.stringify(msg) });
    if (r.ok) sent++; else if (r.status === 404 || r.status === 400) { const e = await r.text(); if (/UNREGISTERED|INVALID_ARGUMENT/.test(e)) await SB.from('push_tokens').delete().eq('token', t.token); }
  }
  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } });
});
