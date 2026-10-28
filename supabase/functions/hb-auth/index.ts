import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const DOMAIN = 'hybridblock.app';
const APP_URL = Deno.env.get('APP_URL') || 'https://orzu95.github.io/hybridblock/';
const userRe = /^[a-z0-9._-]{3,24}$/;
const mailRe = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function randCode(n = 12) { const b = new Uint8Array(n); crypto.getRandomValues(b); let s = ''; for (const x of b) s += ALPHA[x % ALPHA.length]; return s.match(/.{1,4}/g)!.join('-'); }
function randToken() { const b = new Uint8Array(32); crypto.getRandomValues(b); return Array.from(b, x => x.toString(16).padStart(2, '0')).join(''); }
async function sha(s: string) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d), x => x.toString(16).padStart(2, '0')).join(''); }
const normCode = (c: string) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  let body: any = {}; try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const me = async () => { const auth = req.headers.get('Authorization') || ''; const { data } = await admin.auth.getUser(auth.replace(/^Bearer\s+/i, '')); return data?.user || null; };
  /* neuen Wiederherstellungscode erzeugen, nur der Hash wird gespeichert */
  const newRecovery = async (uid: string) => { const code = randCode(); await admin.from('account_recovery').upsert({ user_id: uid, code_hash: await sha(uid + ':' + normCode(code)), fails: 0, locked_until: null, updated_at: new Date().toISOString() }); return code; };
  const mailOn = !!Deno.env.get('RESEND_API_KEY');

  if (body.action === 'caps') return json({ ok: true, email: mailOn });

  if (body.action === 'check') {
    const code = String(body.code || '').trim().toUpperCase();
    const { data: inv } = await admin.from('invites').select('code,name,role,used_by,expires_at,mode,plan').eq('code', code).maybeSingle();
    if (!inv || inv.used_by || new Date(inv.expires_at) < new Date()) return json({ error: 'invalid_code' }, 400);
    return json({ ok: true, name: inv.name, role: inv.role, mode: inv.mode || 'plan', hasPlan: !!inv.plan });
  }

  if (body.action === 'redeem') {
    const code = String(body.code || '').trim().toUpperCase();
    const username = String(body.username || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!userRe.test(username)) return json({ error: 'bad_username' }, 400);
    if (password.length < 8) return json({ error: 'short_password' }, 400);
    const { data: inv } = await admin.from('invites').select('*').eq('code', code).maybeSingle();
    if (!inv || inv.used_by || new Date(inv.expires_at) < new Date()) return json({ error: 'invalid_code' }, 400);
    const { data: taken } = await admin.from('profiles').select('id').eq('username', username).maybeSingle();
    if (taken) return json({ error: 'username_taken' }, 400);
    const { data: cu, error: ce } = await admin.auth.admin.createUser({ email: username + '@' + DOMAIN, password, email_confirm: true, user_metadata: { username } });
    if (ce || !cu.user) return json({ error: 'create_failed', detail: ce?.message }, 400);
    const uid = cu.user.id;
    const { error: pe } = await admin.from('profiles').insert({ id: uid, username, display_name: String(body.name || inv.name || username).slice(0, 60), role: inv.role, coach_id: inv.coach_id, lang: body.lang || 'de' });
    if (pe) { await admin.auth.admin.deleteUser(uid); return json({ error: 'profile_failed', detail: pe.message }, 400); }
    if (inv.plan) await admin.from('plans').insert({ user_id: uid, plan: inv.plan, updated_by: inv.coach_id });
    await admin.from('invites').update({ used_by: uid, used_at: new Date().toISOString() }).eq('code', code);
    const recovery = await newRecovery(uid);
    return json({ ok: true, email: username + '@' + DOMAIN, settings: inv.settings || null, role: inv.role, mode: inv.mode || 'plan', recovery });
  }

  /* eigener Wiederherstellungscode: neu erzeugen (alter wird ungültig) */
  if (body.action === 'recovery_new') {
    const u = await me(); if (!u) return json({ error: 'unauthorized' }, 401);
    return json({ ok: true, recovery: await newRecovery(u.id) });
  }

  /* Passwort mit Wiederherstellungscode zurücksetzen; nach 5 Fehlversuchen 1 h gesperrt */
  if (body.action === 'recover') {
    const username = String(body.username || '').trim().toLowerCase(); const password = String(body.password || '');
    if (password.length < 8) return json({ error: 'short_password' }, 400);
    const { data: p } = await admin.from('profiles').select('id').eq('username', username).maybeSingle();
    if (!p) return json({ error: 'recover_failed' }, 400);
    const { data: r } = await admin.from('account_recovery').select('*').eq('user_id', p.id).maybeSingle();
    if (!r || !r.code_hash) return json({ error: 'recover_failed' }, 400);
    if (r.locked_until && new Date(r.locked_until) > new Date()) return json({ error: 'locked' }, 429);
    if (await sha(p.id + ':' + normCode(body.code)) !== r.code_hash) {
      const fails = (r.fails || 0) + 1; await admin.from('account_recovery').update({ fails, locked_until: fails >= 5 ? new Date(Date.now() + 3600e3).toISOString() : null }).eq('user_id', p.id);
      return json({ error: fails >= 5 ? 'locked' : 'recover_failed' }, 400);
    }
    const { error } = await admin.auth.admin.updateUserById(p.id, { password });
    if (error) return json({ error: 'reset_failed', detail: error.message }, 400);
    return json({ ok: true, recovery: await newRecovery(p.id) });
  }

  /* freiwillige E-Mail für den Reset-Link */
  if (body.action === 'set_email') {
    const u = await me(); if (!u) return json({ error: 'unauthorized' }, 401);
    const email = String(body.email || '').trim().toLowerCase();
    if (email && !mailRe.test(email)) return json({ error: 'bad_email' }, 400);
    const { data: r } = await admin.from('account_recovery').select('user_id').eq('user_id', u.id).maybeSingle();
    if (r) await admin.from('account_recovery').update({ email: email || null, updated_at: new Date().toISOString() }).eq('user_id', u.id);
    else await admin.from('account_recovery').insert({ user_id: u.id, email: email || null });
    return json({ ok: true });
  }

  /* Reset-Link per E-Mail anfordern; Antwort immer gleich, damit niemand Benutzernamen oder Adressen ausprobieren kann */
  if (body.action === 'forgot_email') {
    if (!mailOn) return json({ error: 'email_off' }, 400);
    const username = String(body.username || '').trim().toLowerCase();
    const { data: p } = await admin.from('profiles').select('id,display_name,lang').eq('username', username).maybeSingle();
    const { data: r } = p ? await admin.from('account_recovery').select('email').eq('user_id', p.id).maybeSingle() : { data: null };
    if (p && r && r.email) {
      const token = randToken(); await admin.from('reset_tokens').insert({ token_hash: await sha(token), user_id: p.id, expires_at: new Date(Date.now() + 3600e3).toISOString() });
      const link = APP_URL + '#reset/' + token; const ru = p.lang === 'ru', en = p.lang === 'en';
      const subject = ru ? 'Сброс пароля Hybridblock' : en ? 'Reset your Hybridblock password' : 'Hybridblock: Passwort zurücksetzen';
      const text = ru ? `Привет ${p.display_name || username}!\n\nЧтобы задать новый пароль, открой ссылку (действует 1 час):\n${link}\n\nЕсли ты не запрашивал сброс, просто проигнорируй это письмо.`
        : en ? `Hi ${p.display_name || username}!\n\nOpen this link to set a new password (valid for 1 hour):\n${link}\n\nIf you didn't ask for this, just ignore this email.`
        : `Hallo ${p.display_name || username}!\n\nÜber diesen Link setzt du ein neues Passwort (1 Stunde gültig):\n${link}\n\nWenn du das nicht angefordert hast, ignoriere diese E-Mail einfach.`;
      await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + Deno.env.get('RESEND_API_KEY'), 'Content-Type': 'application/json' }, body: JSON.stringify({ from: Deno.env.get('MAIL_FROM') || 'Hybridblock <onboarding@resend.dev>', to: [r.email], subject, text }) }).catch(() => {});
    }
    return json({ ok: true });
  }

  if (body.action === 'reset_token') {
    const password = String(body.password || ''); if (password.length < 8) return json({ error: 'short_password' }, 400);
    const th = await sha(String(body.token || '')); const { data: t } = await admin.from('reset_tokens').select('*').eq('token_hash', th).maybeSingle();
    if (!t || t.used || new Date(t.expires_at) < new Date()) return json({ error: 'token_invalid' }, 400);
    const { error } = await admin.auth.admin.updateUserById(t.user_id, { password });
    if (error) return json({ error: 'reset_failed', detail: error.message }, 400);
    await admin.from('reset_tokens').update({ used: true }).eq('token_hash', th);
    const { data: p } = await admin.from('profiles').select('username').eq('id', t.user_id).maybeSingle();
    return json({ ok: true, username: p?.username || null });
  }

  if (body.action === 'reset') {
    const u = await me(); if (!u) return json({ error: 'unauthorized' }, 401);
    const target = String(body.user_id || ''); const password = String(body.password || '');
    if (password.length < 8) return json({ error: 'short_password' }, 400);
    const { data: p } = await admin.from('profiles').select('id,coach_id').eq('id', target).maybeSingle();
    if (!p || p.coach_id !== u.id) return json({ error: 'forbidden' }, 403);
    const { error } = await admin.auth.admin.updateUserById(target, { password });
    if (error) return json({ error: 'reset_failed', detail: error.message }, 400);
    return json({ ok: true });
  }

  if (body.action === 'remove') {
    const u = await me(); if (!u) return json({ error: 'unauthorized' }, 401);
    const target = String(body.user_id || '');
    const { data: p } = await admin.from('profiles').select('id,coach_id').eq('id', target).maybeSingle();
    if (!p || p.coach_id !== u.id) return json({ error: 'forbidden' }, 403);
    const { error } = await admin.from('profiles').update({ coach_id: null }).eq('id', target);
    if (error) return json({ error: 'remove_failed' }, 400);
    return json({ ok: true });
  }

  /* Eigenes Konto mit allen Daten löschen (Datenschutz, Play-Store-Pflicht). Bestätigung mit dem eigenen Benutzernamen. */
  if (body.action === 'delete') {
    const u = await me(); if (!u) return json({ error: 'unauthorized' }, 401);
    const { data: p } = await admin.from('profiles').select('id,username').eq('id', u.id).maybeSingle();
    if (p && String(body.confirm || '').trim().toLowerCase() !== p.username) return json({ error: 'confirm_mismatch' }, 400);
    await admin.from('profiles').update({ coach_id: null }).eq('coach_id', u.id);
    await admin.from('plan_requests').delete().eq('user_id', u.id);
    await admin.from('plans').delete().eq('user_id', u.id);
    await admin.from('user_state').delete().eq('user_id', u.id);
    await admin.from('invites').delete().eq('coach_id', u.id);
    if (p) { const { error: de } = await admin.from('profiles').delete().eq('id', u.id); if (de) return json({ error: 'delete_failed', detail: de.message }, 400); }
    const { error } = await admin.auth.admin.deleteUser(u.id);
    if (error) return json({ error: 'delete_failed', detail: error.message }, 400);
    return json({ ok: true });
  }
  return json({ error: 'unknown_action' }, 400);
});
