import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

/* Lebensmittelsuche über Open Food Facts mit Zwischenspeicher. Umgeht CORS-Probleme im Browser und schont das Suchlimit von OFF. */
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
const UA = 'Hybridblock/2.1 (https://orzu95.github.io/hybridblock/)';
const F = 'code,product_name,product_name_de,product_name_en,product_name_ru,brands,nutriments,serving_quantity';
const TTL = 7 * 24 * 3600 * 1000;

async function get(url: string, ms = 9000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: ac.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
  finally { clearTimeout(t); }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  let q = '', langs = 'de,en', size = 30;
  try {
    if (req.method === 'POST') { const b = await req.json(); q = String(b.q || ''); langs = String(b.langs || langs); size = Math.min(50, Number(b.size) || size); }
    else { const u = new URL(req.url); q = u.searchParams.get('q') || ''; langs = u.searchParams.get('langs') || langs; size = Math.min(50, Number(u.searchParams.get('size')) || size); }
  } catch { return json({ error: 'bad_request' }, 400); }
  q = q.trim().toLowerCase().slice(0, 80); langs = langs.replace(/[^a-z,]/g, '').slice(0, 20);
  if (q.length < 2) return json({ hits: [], source: 'none' });
  const key = langs + '|' + size + '|' + q;
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: c } = await db.from('food_search_cache').select('data,at').eq('key', key).maybeSingle();
  if (c && Date.now() - Date.parse(c.at) < TTL) return json({ hits: c.data, source: 'cache' });
  const enc = encodeURIComponent(q); const errs: string[] = []; let hits: unknown[] | null = null; let source = '';
  try { const j = await get('https://search.openfoodfacts.org/search?q=' + enc + '&langs=' + langs + '&page_size=' + size + '&fields=' + F); if (Array.isArray(j.hits)) { hits = j.hits; source = 'searchalicious'; } } catch (e) { errs.push('sal: ' + (e as Error).message); }
  if (!hits || !hits.length) {
    try { const j = await get('https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + enc + '&search_simple=1&action=process&json=1&page_size=' + size + '&fields=' + F, 12000); if (Array.isArray(j.products)) { hits = j.products; source = 'searchpl'; } } catch (e) { errs.push('pl: ' + (e as Error).message); }
  }
  if (hits == null) { if (c) return json({ hits: c.data, source: 'stale' }); return json({ error: 'unreachable', detail: errs }, 502); }
  await db.from('food_search_cache').upsert({ key, data: hits, at: new Date().toISOString() });
  return json({ hits, source });
});
