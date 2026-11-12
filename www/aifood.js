/* Hybridblock – Mahlzeit per Freitext, Diktat oder Foto erfassen (Edge Function food-ai, Google Gemini).
   Ablauf: Eingabe → Erkennung → Bestätigen mit Mengen-Korrektur → Einträge. Fotos werden verkleinert, nur zur Erkennung gesendet und nicht gespeichert.
   Nährwerte sind KI-Schätzungen aus Standardtabellen (pro 100 g); eigene Lebensmittel mit gleichem Namen haben Vorrang. Icons: Tabler (MIT). */
'use strict';
const AI_ICO = { spark: '<path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z"/>',
  cam: '<path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2"/><path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>',
  mic: '<path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M8 21l8 0"/><path d="M12 17l0 4"/>',
  x: '<path d="M18 6l-12 12"/><path d="M6 6l12 12"/>' };
const aiSvg = k => '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + AI_ICO[k] + '</svg>';
const AI_MEAL = { breakfast: 'Frühstück', lunch: 'Mittag', snack: 'Snack', dinner: 'Abend' };
const AI = { busy: false, items: [], meal: null, mode: 'text', text: '' };
(function () { const st = document.createElement('style'); st.textContent = '.ai-row{display:flex;gap:8px;margin:10px 0 4px}.ai-row .btn{flex:1;background:var(--fog);display:inline-flex;align-items:center;justify-content:center;gap:6px}' +
  '.ai-it{display:flex;gap:8px;align-items:center;padding:10px 0;border-bottom:1px solid var(--rule)}.ai-it:last-child{border-bottom:0}.ai-it .grow{min-width:0}.ai-it input{width:72px;box-sizing:border-box;padding:8px 6px;text-align:right;font:inherit;border:1px solid var(--rule);border-radius:10px;background:var(--paper)}.ai-it .iconbtn{background:var(--fog)}' +
  '.ai-q{display:flex;gap:4px;margin-top:4px}.ai-q button{border:0;border-radius:999px;background:var(--fog);padding:4px 9px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}.ai-unsure{color:var(--signal);font-weight:700}' +
  '.ai-wait{display:flex;align-items:center;gap:10px;padding:24px 0}.ai-spin{width:22px;height:22px;border-radius:50%;border:3px solid var(--fog);border-top-color:var(--ember);animation:aispin 0.9s linear infinite}@keyframes aispin{to{transform:rotate(360deg)}}'; document.head.appendChild(st); })();
/* Freigabe Pilotphase: Betreiber und seine Athleten (Server prüft das ebenfalls). Für alle: AI_OPEN = true und Secret FOOD_AI_OPEN=1. */
const AI_OPEN = false;
const AI_PILOT = '577b4459-ed8f-42b6-b947-6c42d0ecb677';
const aiAllowed = () => typeof AUTH !== 'undefined' && AUTH && (AI_OPEN || AUTH.uid === AI_PILOT || (AUTH.profile && AUTH.profile.coach_id === AI_PILOT));
const aiOk = () => !!(S.settings && S.settings.aiOk);
function aiConsentSheet(next) { AI.next = next; openSheet(sheetHead($t('Mahlzeit per KI erkennen')) +
  '<p class="small" style="margin-top:8px">' + $t('Deine Beschreibung oder dein Foto wird zur Erkennung an Google (Gemini) geschickt und danach nicht gespeichert, weder von uns noch zum Training von Google-Modellen. Zurück kommen nur die erkannten Lebensmittel mit geschätzten Mengen.') + '</p>' +
  '<p class="small muted">' + $t('Fotografiere nur dein Essen, keine Personen. Die Nährwerte sind Schätzungen: Prüfe die Mengen vor dem Eintragen.') + '</p>' +
  '<div class="row" style="margin-top:12px;gap:8px"><div class="grow"></div><button class="btn" data-act="closeSheet" type="button">' + $t('Abbrechen') + '</button><button class="btn brand" data-act="aiAgree" type="button">' + $t('Einverstanden') + '</button></div>'); }
function aiTextSheet() { openSheet(sheetHead($t('Mahlzeit beschreiben')) +
  '<p class="small muted" style="margin-top:6px">' + $t('Schreib oder diktiere, was du gegessen hast, mit Mengen, wenn du sie weißt.') + ' ' + aiSvg('mic') + ' ' + $t('Zum Diktieren auf das Mikrofon deiner Tastatur tippen.') + '</p>' +
  '<textarea id="ai-text" rows="4" style="width:100%;box-sizing:border-box;font:inherit;padding:12px;border-radius:12px;border:1px solid var(--rule);background:var(--paper)" placeholder="' + esc($t('z. B. Zum Mittag 200 g Reis, eine Hähnchenbrust und Brokkoli mit etwas Olivenöl')) + '">' + esc(AI.text || '') + '</textarea>' +
  '<div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="aiSend" type="button">' + aiSvg('spark') + ' ' + $t('Erkennen') + '</button></div>');
  setTimeout(() => { const t = document.getElementById('ai-text'); if (t) t.focus(); }, 250); }
function aiWait(txt) { openSheet(sheetHead($t('Einen Moment')) + '<div class="ai-wait"><span class="ai-spin"></span><span>' + esc(txt) + '</span></div>'); }
function aiPickPhoto() { let inp = document.getElementById('ai-file'); if (!inp) { inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.setAttribute('capture', 'environment'); inp.id = 'ai-file'; inp.hidden = true; document.body.appendChild(inp);
    inp.addEventListener('change', async () => { const f = inp.files && inp.files[0]; inp.value = ''; if (!f) return; aiWait($t('Foto wird vorbereitet …')); try { const b64 = await aiShrink(f); await aiRun('photo', null, b64); } catch (e) { closeSheet(); toast($t('Das Foto konnte nicht gelesen werden.')); } }); }
  inp.click(); }
function aiShrink(file) { return new Promise((res, rej) => { const url = URL.createObjectURL(file); const img = new Image(); img.onload = () => { const max = 1024; let w = img.naturalWidth, h = img.naturalHeight; const s = Math.min(1, max / Math.max(w, h)); w = Math.round(w * s); h = Math.round(h * s);
  const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.8).split(',')[1]); }; img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); }; img.src = url; }); }
async function aiRun(mode, text, image) { if (AI.busy) return; AI.busy = true; AI.mode = mode; aiWait(mode === 'photo' ? $t('Ich schaue mir dein Essen an …') : $t('Ich lese deine Beschreibung …'));
  try { const tk = await token(); const r = await sbFetch('/functions/v1/food-ai', { method: 'POST', headers: { Authorization: 'Bearer ' + tk }, body: JSON.stringify({ mode, text, image, lang: LANG }) }, 35000);
    if (!r || r.unclear || !(r.items && r.items.length)) { AI.busy = false; openSheet(sheetHead($t('Nichts erkannt')) + '<p class="small" style="margin-top:8px">' + $t('Ich konnte darin kein Essen erkennen. Versuch es mit einer genaueren Beschreibung oder einem helleren Foto von oben.') + '</p><div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="' + (mode === 'photo' ? 'aiPhoto' : 'aiText') + '" type="button">' + $t('Nochmal') + '</button></div>'); return; }
    AI.items = r.items.map(x => Object.assign({}, x, { g0: x.grams })); AI.meal = AI_MEAL[r.meal] || ui.meal || guessMeal(); AI.left = r.limit != null && r.used != null ? r.limit - r.used : null; AI.busy = false; aiResult(); }
  catch (e) { AI.busy = false; closeSheet(); toast(e.status === 429 ? $t('Tageslimit für die KI-Erkennung erreicht. Morgen geht es wieder.') : e.status === 403 ? $t('Diese Funktion ist noch in der Testphase.') : e.status === 503 ? $t('Die KI-Erkennung ist noch nicht eingerichtet.') : e.message === 'not_logged_in' ? $t('Für die KI-Erkennung musst du angemeldet sein.') : $t('Die Erkennung hat nicht geklappt. Bitte versuch es noch einmal.')); } }
const aiMac = x => { const k = x.grams / 100; return { kcal: x.kcal100 * k, p: x.p100 * k, c: x.c100 * k, f: x.f100 * k }; };
function aiResult() { const its = AI.items; const tot = its.reduce((a, x) => { const m = aiMac(x); a.kcal += m.kcal; a.p += m.p; a.c += m.c; a.f += m.f; return a; }, { kcal: 0, p: 0, c: 0, f: 0 });
  const hid = S.settings.hiddenMeals || []; const meals = MEALS.filter(m => !hid.includes(m));
  openSheet(sheetHead($t('Stimmt das so?')) +
    '<div class="wkchs" style="margin:8px 0 4px">' + meals.map(m => '<button class="wkch' + (AI.meal === m ? ' on' : '') + '" data-act="aiMeal" data-v="' + esc(m) + '" type="button">' + esc($t(m)) + '</button>').join('') + '</div>' +
    '<div>' + its.map((x, i) => { const m = aiMac(x); return '<div class="ai-it"><div class="grow"><b>' + esc(x.name) + '</b><div class="small muted">' + (x.portion ? esc(x.portion) + ' · ' : '') + fmt(m.kcal, 0) + ' kcal · ' + fmt(m.p, 0) + ' g ' + $t('Eiweiß') + (x.conf < 0.6 ? ' · <span class="ai-unsure">' + $t('Menge unsicher') + '</span>' : '') + '</div>' +
      '<div class="ai-q"><button data-act="aiQ" data-i="' + i + '" data-f="0.5" type="button">½</button><button data-act="aiQ" data-i="' + i + '" data-f="0.75" type="button">−25 %</button><button data-act="aiQ" data-i="' + i + '" data-f="1.25" type="button">+25 %</button><button data-act="aiQ" data-i="' + i + '" data-f="2" type="button">2×</button></div></div>' +
      '<input type="number" inputmode="numeric" min="1" data-aig="' + i + '" value="' + Math.round(x.grams) + '" aria-label="' + esc($t('Gramm')) + '"><span class="small muted">g</span><button class="iconbtn" data-act="aiDel" data-i="' + i + '" type="button" aria-label="' + esc($t('Entfernen')) + '">' + aiSvg('x') + '</button></div>'; }).join('') + '</div>' +
    '<div class="row small" style="margin-top:10px;justify-content:space-between"><b>' + $t('Gesamt') + '</b><span class="num">' + fmt(tot.kcal, 0) + ' kcal · P ' + fmt(tot.p, 0) + ' · K ' + fmt(tot.c, 0) + ' · F ' + fmt(tot.f, 0) + '</span></div>' +
    '<p class="src" style="margin-top:6px">' + $t('KI-Schätzung aus Standard-Nährwerttabellen. Mengen auf Fotos können um 20–30 % abweichen, vor allem Öl und Soßen.') + (AI.left != null ? ' ' + $tf('Heute noch {n} Erkennungen.', { n: AI.left }) : '') + '</p>' +
    '<div class="row" style="margin-top:12px;gap:8px"><button class="btn" data-act="' + (AI.mode === 'photo' ? 'aiPhoto' : 'aiText') + '" type="button">' + $t('Nochmal') + '</button><div class="grow"></div><button class="btn brand" data-act="aiSave" type="button"' + (its.length ? '' : ' disabled') + '>' + $tf('{n} eintragen', { n: its.length }) + '</button></div>'); }
function aiFoodId(x) { const nm = x.name.trim().toLowerCase(); const own = Object.values(S.foods).find(f => f && f.src !== 'ai' && f.base === '100g' && String(f.name || '').trim().toLowerCase() === nm); if (own) return own.id;
  const id = 'ai_' + nm.replace(/[^a-z0-9а-яёäöüß]+/gi, '_').slice(0, 40); S.foods[id] = { id, name: x.name, base: '100g', kcal: x.kcal100, p: x.p100, c: x.c100, f: x.f100, src: 'ai' }; return id; }
function aiSave() { const d = ui.day || today(); const n = AI.items.length; AI.items.forEach(x => { const id = aiFoodId(x); addEntry(d, id, AI.meal, Math.round(x.grams), 'g'); const o = S.days[d]; const e = o && o.entries[o.entries.length - 1]; if (e) e.ai = AI.mode; });
  AI.items = []; AI.text = ''; save(); closeSheet(); render(); doneOverlay($tf('{n} Lebensmittel eingetragen', { n }), $t(AI.meal)); }
/* Einstieg: oben im Hinzufügen-Sheet */
const _addSheetAI = addSheet;
addSheet = function () { const r = _addSheetAI.apply(this, arguments); if (!aiAllowed()) return r; const card = document.getElementById('sheetCard'); if (!card || card.querySelector('.ai-row')) return r; const head = card.querySelector('.row');
  const row = '<div class="ai-row"><button class="btn" data-act="aiText" type="button">' + aiSvg('spark') + ' ' + $t('Beschreiben') + '</button><button class="btn" data-act="aiPhoto" type="button">' + aiSvg('cam') + ' ' + $t('Foto') + '</button></div>';
  const anchor = card.querySelector('.scanbar'); if (anchor) anchor.insertAdjacentHTML('afterend', row); else if (head) head.insertAdjacentHTML('afterend', row); else card.insertAdjacentHTML('afterbegin', row); return r; };
document.addEventListener('input', e => { const i = e.target.dataset && e.target.dataset.aig; if (i == null) return; const x = AI.items[+i]; if (!x) return; const v = num(e.target.value); if (v > 0) x.grams = Math.min(3000, v); });
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.aig != null) aiResult(); });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'aiText' || a === 'aiPhoto') { if (typeof AUTH === 'undefined' || !AUTH) { toast($t('Für die KI-Erkennung musst du angemeldet sein.')); return; } if (!aiOk()) { aiConsentSheet(a); return; } if (a === 'aiText') aiTextSheet(); else aiPickPhoto(); }
  else if (a === 'aiAgree') { S.settings.aiOk = today(); save(); const n = AI.next; if (n === 'aiPhoto') { closeSheet(); aiPickPhoto(); } else aiTextSheet(); }
  else if (a === 'aiSend') { const t = (document.getElementById('ai-text') || {}).value || ''; AI.text = t; if (t.trim().length < 2) { toast($t('Beschreib kurz, was du gegessen hast.')); return; } aiRun('text', t.trim(), null); }
  else if (a === 'aiMeal') { AI.meal = b.dataset.v; aiResult(); }
  else if (a === 'aiQ') { const x = AI.items[+b.dataset.i]; if (x) { x.grams = Math.max(1, Math.round(x.grams * +b.dataset.f)); aiResult(); } }
  else if (a === 'aiDel') { AI.items.splice(+b.dataset.i, 1); aiResult(); }
  else if (a === 'aiSave') aiSave(); });
