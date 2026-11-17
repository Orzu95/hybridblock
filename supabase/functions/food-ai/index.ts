import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

/* Mahlzeit per Freitext oder Foto erkennen (Google Gemini). Nur für angemeldete Nutzer, Tageslimit pro Nutzer.
   Fotos werden nicht gespeichert; zurück kommt nur die Liste der Lebensmittel mit geschätzten Mengen und Nährwerten pro 100 g. */
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-3.5-flash-lite';
const LIMIT = Number(Deno.env.get('FOOD_AI_DAILY') || 30);
const LANG: Record<string, string> = { de: 'German', en: 'English', ru: 'Russian' };
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    meal: { type: 'STRING', enum: ['breakfast', 'lunch', 'snack', 'dinner', 'none'] },
    unclear: { type: 'BOOLEAN' },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          grams: { type: 'NUMBER' },
          portion: { type: 'STRING' },
          kcal100: { type: 'NUMBER' },
          p100: { type: 'NUMBER' },
          c100: { type: 'NUMBER' },
          f100: { type: 'NUMBER' },
          conf: { type: 'NUMBER' }
        },
        required: ['name', 'grams', 'kcal100', 'p100', 'c100', 'f100', 'conf']
      }
    }
  },
  required: ['items', 'meal', 'unclear']
};

function prompt(mode: string, lang: string, text: string) {
  return `You are a nutrition logging assistant for a fitness app. ${mode === 'photo' ? 'Identify every food and drink visible in the photo of a meal.' : "Parse the user's description of what they ate."}
Return each component as a separate item with:
- name: short common food name in ${LANG[lang] || 'German'} (generic, e.g. "Reis, gekocht", "Hähnchenbrust, gebraten"); keep brand names only if clearly stated
- grams: estimated eaten amount in grams (ml for drinks treated as grams). Convert pieces/slices/spoons/cups to grams with typical sizes.${mode === 'photo' ? ' Use plate size, cutlery and typical portions to estimate. Include visible oil, butter and sauces as separate items when plausible.' : ' If no amount is given, use one typical adult portion.'}
- portion: the amount in the user's words or a short description (e.g. "2 Stück", "1 Scheibe"), in ${LANG[lang] || 'German'}
- kcal100, p100, c100, f100: typical values per 100 g of that food as prepared (standard food composition tables such as BLS/USDA)
- conf: your confidence 0..1 for the amount
meal: breakfast/lunch/snack/dinner only if the user clearly states it, else none.
unclear: true if the input is not food or you cannot identify anything.
${mode === 'text' ? 'User text: """' + text.slice(0, 600) + '"""' : ''}`;
}

/* Vertex AI (Google Cloud): läuft über das Startguthaben und in der EU. Secret VERTEX_SERVICE_ACCOUNT = JSON des Dienstkontos
   (Rolle „Vertex AI-Nutzer“). Ohne dieses Secret wird wie bisher die Gemini API aus AI Studio (GEMINI_API_KEY) genutzt. */
const VLOC = Deno.env.get('VERTEX_LOCATION') || 'europe-west3';
const b64u = (b: ArrayBuffer | string) =>
  btoa(typeof b === 'string' ? b : String.fromCharCode(...new Uint8Array(b)))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
let VTOK: { v: string; exp: number } | null = null;
function vertexSA() {
  const raw = Deno.env.get('VERTEX_SERVICE_ACCOUNT');
  if (!raw) return null;
  try {
    let t = raw.trim();
    if (!t.startsWith('{')) t = '{' + t;
    if (!t.endsWith('}')) t = t.replace(/,\s*$/, '') + '}';
    const sa = JSON.parse(t);
    return sa.client_email && sa.private_key && sa.project_id ? sa : null;
  } catch (e) {
    console.error('VERTEX_SERVICE_ACCOUNT ist kein gültiges JSON: ' + (e as Error).message);
    return null;
  }
}
async function vertexToken(sa: { client_email: string; private_key: string }) {
  if (VTOK && VTOK.exp > Date.now() + 60_000) return VTOK.v;
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64u(
    JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/cloud-platform', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })
  );
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\\n/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(head + '.' + claim));
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + head + '.' + claim + '.' + b64u(sig)
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('oauth ' + r.status + ' ' + JSON.stringify(j).slice(0, 200));
  VTOK = { v: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return VTOK.v;
}
async function callGemini(body: unknown, signal: AbortSignal) {
  const sa = vertexSA();
  if (sa) {
    const at = await vertexToken(sa);
    const url = (loc: string) =>
      'https://' +
      (loc === 'global' ? '' : loc + '-') +
      'aiplatform.googleapis.com/v1/projects/' +
      sa.project_id +
      '/locations/' +
      loc +
      '/publishers/google/models/' +
      MODEL +
      ':generateContent';
    const go = (loc: string) =>
      fetch(url(loc), { method: 'POST', signal, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + at }, body: JSON.stringify(body) });
    let r = await go(VLOC);
    /* Modell in der EU-Region nicht verfügbar → globaler Endpunkt */
    if (r.status === 404 && VLOC !== 'global') {
      console.warn('vertex: ' + MODEL + ' nicht in ' + VLOC + ', nutze global');
      r = await go('global');
    }
    return r;
  }
  const key = Deno.env.get('GEMINI_API_KEY')!;
  return fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify(body)
  });
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!Deno.env.get('GEMINI_API_KEY') && !Deno.env.get('VERTEX_SERVICE_ACCOUNT')) return json({ error: 'not_configured' }, 503);
  const token = (req.headers.get('authorization') || '').replace(/^Bearer /i, '');
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  /* Betriebstest: mit dem geheimen Hook-Header eine Mini-Anfrage an Gemini, ohne Nutzer und ohne Tageslimit */
  const hs = req.headers.get('x-hook-secret');
  if (hs) {
    const { data: ok } = await db.rpc('push_hook_ok', { p_secret: hs });
    if (!ok) return json({ error: 'forbidden' }, 403);
    try {
      const r = await callGemini(
        { contents: [{ role: 'user', parts: [{ text: 'Reply with the single word OK.' }] }], generationConfig: { maxOutputTokens: 20 } },
        AbortSignal.timeout(20000)
      );
      const j = await r.text();
      return json({ ping: r.status, via: vertexSA() ? 'vertex' : 'aistudio', model: MODEL, out: j.slice(0, 400) });
    } catch (e) {
      return json({ ping: 0, error: String(e).slice(0, 300) });
    }
  }
  const { data: u } = await db.auth.getUser(token);
  const uid = u && u.user && u.user.id;
  if (!uid) return json({ error: 'auth' }, 401);
  /* Pilotphase (bezahlte Gemini-Stufe aktiv seit 12.11.2026): Betreiber und seine Athleten. Für alle: Secret FOOD_AI_OPEN=1 */
  const OWNER = '577b4459-ed8f-42b6-b947-6c42d0ecb677';
  if (Deno.env.get('FOOD_AI_OPEN') !== '1' && uid !== OWNER) {
    const { data: pr } = await db.from('profiles').select('coach_id').eq('id', uid).maybeSingle();
    if (!pr || pr.coach_id !== OWNER) return json({ error: 'beta' }, 403);
  }
  let b: { mode?: string; text?: string; image?: string; lang?: string };
  try {
    b = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const mode = b.mode === 'photo' ? 'photo' : 'text';
  const lang = ['de', 'en', 'ru'].includes(String(b.lang)) ? String(b.lang) : 'de';
  const text = String(b.text || '').trim();
  const img = String(b.image || '');
  if (mode === 'text' && text.length < 2) return json({ error: 'empty' }, 400);
  if (mode === 'photo' && (img.length < 100 || img.length > 2_000_000)) return json({ error: 'image' }, 400);
  /* Tageslimit (atomar über RPC) */
  const { data: n, error: le } = await db.rpc('ai_usage_hit', { p_user: uid, p_limit: LIMIT });
  if (le) return json({ error: 'limit_check' }, 500);
  if (n === -1) return json({ error: 'limit', limit: LIMIT }, 429);
  const parts: unknown[] = [{ text: prompt(mode, lang, text) }];
  if (mode === 'photo') parts.push({ inline_data: { mime_type: 'image/jpeg', data: img } });
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 25000);
  try {
    const r = await callGemini(
      {
        contents: [{ role: 'user', parts }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json', responseSchema: SCHEMA, maxOutputTokens: 1500 }
      },
      ac.signal
    );
    const j = await r.json();
    if (!r.ok) {
      console.error('gemini', r.status, JSON.stringify(j).slice(0, 500));
      return json({ error: r.status === 402 || r.status === 429 || r.status === 503 ? 'ai_unavailable' : 'ai_failed', status: r.status }, 502);
    }
    const out =
      j.candidates &&
      j.candidates[0] &&
      j.candidates[0].content &&
      j.candidates[0].content.parts &&
      j.candidates[0].content.parts[0] &&
      j.candidates[0].content.parts[0].text;
    let res;
    try {
      res = JSON.parse(out);
    } catch {
      return json({ error: 'ai_parse' }, 502);
    }
    const clamp = (v: unknown, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number(v) || 0));
    res.items = (Array.isArray(res.items) ? res.items : [])
      .slice(0, 15)
      .map((x: Record<string, unknown>) => ({
        name: String(x.name || '').slice(0, 80),
        portion: String(x.portion || '').slice(0, 40),
        grams: clamp(x.grams, 1, 3000),
        kcal100: clamp(x.kcal100, 0, 900),
        p100: clamp(x.p100, 0, 100),
        c100: clamp(x.c100, 0, 100),
        f100: clamp(x.f100, 0, 100),
        conf: clamp(x.conf, 0, 1)
      }))
      .filter((x: { name: string }) => x.name);
    return json({ ...res, used: n, limit: LIMIT, model: MODEL });
  } catch (e) {
    return json({ error: 'ai_timeout' }, 504);
  } finally {
    clearTimeout(t);
  }
});
