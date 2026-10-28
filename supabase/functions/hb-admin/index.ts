import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
/* Betreiber-Konsole: nur für Konten in der Tabelle operators. Zeigt bewusst keine Trainings- oder Gesundheitsdaten, nur Kontodaten. */
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rnd = (n: number, a = ALPHA) => { const b = new Uint8Array(n); crypto.getRandomValues(b); return Array.from(b, x => a[x % a.length]).join(''); };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  let body: any = {}; try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const { data: ud } = await admin.auth.getUser((req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, ''));
  const me = ud?.user; if (!me) return json({ error: 'unauthorized' }, 401);
  const { data: op } = await admin.from('operators').select('user_id').eq('user_id', me.id).maybeSingle();
  if (!op) return json({ error: 'forbidden' }, 403);
  const target = String(body.user_id || '');
  const guardSelf = () => target === me.id;

  if (body.action === 'stats') {
    const now = Date.now(), d7 = new Date(now - 7 * 864e5).toISOString(), d30 = new Date(now - 30 * 864e5).toISOString();
    const cnt = async (q: any) => { const { count } = await q; return count || 0; };
    const [users, coaches, new30, active7, invOpen, reqOpen] = await Promise.all([
      cnt(admin.from('profiles').select('id', { count: 'exact', head: true })),
      cnt(admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin')),
      cnt(admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', d30)),
      cnt(admin.from('user_state').select('user_id', { count: 'exact', head: true }).gte('updated_at', d7)),
      cnt(admin.from('invites').select('code', { count: 'exact', head: true }).is('used_by', null).gte('expires_at', new Date().toISOString())),
      cnt(admin.from('plan_requests').select('id', { count: 'exact', head: true }).eq('status', 'open')),
    ]);
    return json({ ok: true, users, coaches, new30, active7, invOpen, reqOpen });
  }

  if (body.action === 'users') {
    const q = String(body.q || '').trim().toLowerCase();
    let pq = admin.from('profiles').select('id,username,display_name,role,coach_id,lang,created_at').order('created_at', { ascending: false }).limit(200);
    if (q) pq = pq.or(`username.ilike.%${q.replace(/[%,()]/g, '')}%,display_name.ilike.%${q.replace(/[%,()]/g, '')}%`);
    const { data: ps, error } = await pq; if (error) return json({ error: 'query_failed', detail: error.message }, 400);
    const ids = (ps || []).map(p => p.id);
    const [{ data: st }, { data: ops }, au] = await Promise.all([
      ids.length ? admin.from('user_state').select('user_id,updated_at').in('user_id', ids) : Promise.resolve({ data: [] }),
      admin.from('operators').select('user_id'),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);
    const sync: Record<string, string> = {}; (st || []).forEach((r: any) => sync[r.user_id] = r.updated_at);
    const opset = new Set((ops || []).map((r: any) => r.user_id));
    const auth: Record<string, any> = {}; (au.data?.users || []).forEach((u: any) => auth[u.id] = u);
    const names: Record<string, string> = {}; (ps || []).forEach(p => names[p.id] = p.username);
    const coachIds = [...new Set((ps || []).map(p => p.coach_id).filter(Boolean))].filter(id => !names[id as string]);
    if (coachIds.length) { const { data: cs } = await admin.from('profiles').select('id,username').in('id', coachIds as string[]); (cs || []).forEach((c: any) => names[c.id] = c.username); }
    const { data: coaches } = await admin.from('profiles').select('id,username,display_name').eq('role', 'admin').order('username');
    return json({ ok: true, coaches: coaches || [], users: (ps || []).map(p => ({ ...p, coach: p.coach_id ? names[p.coach_id] || null : null, synced_at: sync[p.id] || null, last_sign_in: auth[p.id]?.last_sign_in_at || null, banned: !!(auth[p.id]?.banned_until && new Date(auth[p.id].banned_until) > new Date()), operator: opset.has(p.id) })) });
  }

  if (body.action === 'invite') {
    const role = body.role === 'admin' ? 'admin' : 'client'; const code = 'HB-' + rnd(6);
    const { error } = await admin.from('invites').insert({ code, coach_id: role === 'client' && body.coach_id ? String(body.coach_id) : me.id, role, name: String(body.name || '').slice(0, 60), mode: role === 'admin' ? 'free' : (body.mode || 'free') });
    if (error) return json({ error: 'invite_failed', detail: error.message }, 400);
    return json({ ok: true, code });
  }

  if (body.action === 'set_role') {
    const role = body.role === 'admin' ? 'admin' : 'client';
    if (role === 'client') { const { count } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('coach_id', target); if (count) return json({ error: 'has_clients' }, 400); }
    const { error } = await admin.from('profiles').update({ role }).eq('id', target); if (error) return json({ error: 'update_failed' }, 400);
    return json({ ok: true });
  }

  if (body.action === 'assign_coach') {
    const coach = body.coach_id ? String(body.coach_id) : null;
    if (coach) { const { data: c } = await admin.from('profiles').select('role').eq('id', coach).maybeSingle(); if (!c || c.role !== 'admin') return json({ error: 'not_coach' }, 400); if (coach === target) return json({ error: 'not_coach' }, 400); }
    const { error } = await admin.from('profiles').update({ coach_id: coach }).eq('id', target); if (error) return json({ error: 'update_failed' }, 400);
    return json({ ok: true });
  }

  if (body.action === 'block' || body.action === 'unblock') {
    if (guardSelf()) return json({ error: 'self' }, 400);
    const { error } = await admin.auth.admin.updateUserById(target, { ban_duration: body.action === 'block' ? '876000h' : 'none' } as any);
    if (error) return json({ error: 'update_failed', detail: error.message }, 400);
    return json({ ok: true });
  }

  if (body.action === 'reset_pw') {
    const password = rnd(4, 'abcdefghjkmnpqrstuvwxyz') + '-' + rnd(4, 'abcdefghjkmnpqrstuvwxyz23456789') + '-' + rnd(4, '23456789');
    const { error } = await admin.auth.admin.updateUserById(target, { password });
    if (error) return json({ error: 'reset_failed', detail: error.message }, 400);
    return json({ ok: true, password });
  }

  if (body.action === 'delete_user') {
    if (guardSelf()) return json({ error: 'self' }, 400);
    const { data: p } = await admin.from('profiles').select('id,username').eq('id', target).maybeSingle();
    if (!p || String(body.confirm || '').trim().toLowerCase() !== p.username) return json({ error: 'confirm_mismatch' }, 400);
    await admin.from('profiles').update({ coach_id: null }).eq('coach_id', target);
    await admin.from('plan_requests').delete().eq('user_id', target);
    await admin.from('plans').delete().eq('user_id', target);
    await admin.from('user_state').delete().eq('user_id', target);
    await admin.from('private_state').delete().eq('user_id', target);
    await admin.from('invites').delete().eq('coach_id', target);
    await admin.from('operators').delete().eq('user_id', target);
    const { error: de } = await admin.from('profiles').delete().eq('id', target); if (de) return json({ error: 'delete_failed', detail: de.message }, 400);
    const { error } = await admin.auth.admin.deleteUser(target); if (error) return json({ error: 'delete_failed', detail: error.message }, 400);
    return json({ ok: true });
  }
  return json({ error: 'unknown_action' }, 400);
});
