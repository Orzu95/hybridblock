/* Hybridblock – Formcheck per Video und Check-in-Fotos für den Coach (Konkurrenzanalyse: Muss vor Pilot, 7.9/7.10)
   Speicher: privater Supabase-Bucket „media“, Pfad <uid>/coach/… Lesen dürfen nur der Athlet selbst und sein Coach (RLS).
   Videos: höchstens 30 s, im Browser ohne Ton neu kodiert (480 px). Fotos nur nach Einwilligung geteilt. Löschung nach 90 Tagen (beim App-Start).
   Kommentare über RPC media_comment (mit Zeitstempel im Video). */
'use strict';
const CM_MAX_S = 30, CM_DAYS = 90;
const cmUrl = {};
async function cmAuthH() { const tk = await token(); return { Authorization: 'Bearer ' + tk, apikey: SB.key }; }
async function cmUpload(path, blob, type) { const h = await cmAuthH(); const r = await fetch(SB.url + '/storage/v1/object/media/' + path, { method: 'POST', headers: Object.assign(h, { 'Content-Type': type, 'x-upsert': 'true' }), body: blob }); if (!r.ok) throw new Error('upload ' + r.status); }
async function cmBlobUrl(path) { if (cmUrl[path]) return cmUrl[path]; const h = await cmAuthH(); const r = await fetch(SB.url + '/storage/v1/object/authenticated/media/' + path, { headers: h }); if (!r.ok) throw new Error('get ' + r.status); return (cmUrl[path] = URL.createObjectURL(await r.blob())); }
async function cmDelete(paths) { if (!paths.length) return; const h = await cmAuthH(); await fetch(SB.url + '/storage/v1/object/media', { method: 'DELETE', headers: Object.assign(h, { 'Content-Type': 'application/json' }), body: JSON.stringify({ prefixes: paths }) }); }
const cmHasCoach = () => typeof AUTH !== 'undefined' && AUTH && AUTH.profile && AUTH.profile.coach_id && !VIEW;
/* Video ohne Ton und verkleinert neu aufnehmen (Datenschutz: keine Stimmen/Umgebungsgeräusche) */
function cmReencode(file) { return new Promise((res, rej) => { const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.src = URL.createObjectURL(file);
  v.onloadedmetadata = () => { if (!(v.duration > 0) || v.duration > CM_MAX_S + 0.5) { rej(new Error('long')); return; }
    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) { res({ blob: file, type: file.type || 'video/mp4', raw: true }); return; }
    const sc = Math.min(1, 480 / Math.max(v.videoWidth, v.videoHeight)); const c = document.createElement('canvas'); c.width = Math.round(v.videoWidth * sc / 2) * 2; c.height = Math.round(v.videoHeight * sc / 2) * 2; const g = c.getContext('2d');
    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)); if (!mime) { res({ blob: file, type: file.type || 'video/mp4', raw: true }); return; }
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: mime, videoBitsPerSecond: 900000 }); const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    rec.onstop = () => { URL.revokeObjectURL(v.src); res({ blob: new Blob(chunks, { type: 'video/webm' }), type: 'video/webm' }); };
    let raf; const draw = () => { g.drawImage(v, 0, 0, c.width, c.height); if (!v.ended) raf = requestAnimationFrame(draw); }; v.onended = () => { cancelAnimationFrame(raf); setTimeout(() => rec.stop(), 150); };
    rec.start(250); v.play().then(draw).catch(rej); };
  v.onerror = () => rej(new Error('read')); }); }
async function cmFormUpload(file, meta) { toast($t('Video wird vorbereitet …')); let enc; try { enc = await cmReencode(file); } catch (e) { toast(e.message === 'long' ? $tf('Bitte höchstens {s} Sekunden. Kürze das Video und versuch es noch einmal.', { s: CM_MAX_S }) : $t('Das Video konnte nicht gelesen werden.')); return; }
  if (enc.blob.size > 25 * 1024 * 1024) { toast($t('Das Video ist zu groß (max. 25 MB).')); return; }
  const ext = enc.type.includes('webm') ? 'webm' : enc.type.includes('quicktime') ? 'mov' : 'mp4'; const path = AUTH.uid + '/coach/form/' + uid() + '.' + ext;
  try { toast($t('Video wird hochgeladen …')); await cmUpload(path, enc.blob, enc.type.split(';')[0]); await api('/rest/v1/media_items', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ kind: 'form', path, meta }) });
    doneOverlay($t('Formcheck gesendet'), $t('Dein Coach sieht das Video und kann es kommentieren.')); } catch (e) { toast($t('Hochladen fehlgeschlagen. Bitte später noch einmal.')); } }
function cmPick(accept, cb) { const i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.setAttribute('capture', 'environment'); i.onchange = () => { const f = i.files && i.files[0]; if (f) cb(f); }; i.click(); }
/* Button an der Übung */
const _exCardCM = exCard;
exCard = function (w, k, spec) { const h = _exCardCM.apply(this, arguments); if (!cmHasCoach() || spec.om) return h;
  return h.replace('<div class="ex-actions">', '<div class="ex-actions"><button class="btn sm" data-act="cmForm" data-w="' + w + '" data-k="' + k + '" data-slot="' + esc(spec.slot) + '" data-ex="' + esc(spec.ex) + '" type="button">' + $t('Formcheck') + '</button>'); };
/* Liste und Detail (Athlet und Coach) */
async function cmList(owner) { return (await api('/rest/v1/media_items?owner_id=eq.' + owner + '&select=id,kind,path,meta,comments,created_at,seen_at&order=created_at.desc&limit=40')) || []; }
const cmCount = c => (c.comments || []).length;
function cmRow(it) { const m = it.meta || {}; const nm = it.kind === 'form' ? (LIB[m.ex] ? LIB[m.ex].name : (m.name || $t('Übung'))) : $tf('Check-in-Foto: {p}', { p: $t(m.view || '') });
  return '<button class="act-pick" data-act="cmOpen" data-id="' + esc(it.id) + '" type="button"><span class="grow"><b>' + esc(nm) + '</b><br><span class="small muted" style="font-weight:500">' + esc(fmtDay(String(it.created_at).slice(0, 10))) + ' · ' + (cmCount(it) === 1 ? $t('1 Kommentar') : cmCount(it) ? $tf('{n} Kommentare', { n: cmCount(it) }) : $t('noch kein Kommentar')) + '</span></span></button>'; }
const CMX = { items: {}, owner: null };
async function cmCardFill(el, owner, coach) { try { const L = await cmList(owner); L.forEach(x => { CMX.items[x.id] = x; }); CMX.owner = owner;
    const forms = L.filter(x => x.kind === 'form'), photos = L.filter(x => x.kind === 'checkin');
    if (!L.length) { el.innerHTML = '<p class="small muted" style="margin:0">' + (coach ? $t('Noch keine Formchecks oder geteilten Fotos.') : $t('Noch keine Formchecks. Tippe in einer Einheit bei einer Übung auf „Formcheck“.')) + '</p>'; return; }
    const views = ['vorne', 'seitlich', 'hinten']; const cmp = coach && photos.length >= 2 ? views.map(v => { const ps = photos.filter(p => (p.meta || {}).view === v); if (ps.length < 2) return ''; return '<div style="margin-top:10px"><div class="small" style="font-weight:700">' + esc($t(v[0].toUpperCase() + v.slice(1))) + '</div><div class="row" style="gap:6px"><img data-cmimg="' + esc(ps[ps.length - 1].path) + '" style="width:49%;border-radius:10px" alt=""><img data-cmimg="' + esc(ps[0].path) + '" style="width:49%;border-radius:10px" alt=""></div><div class="row small muted" style="justify-content:space-between"><span>' + esc(fmtDay(String(ps[ps.length - 1].created_at).slice(0, 10))) + '</span><span>' + esc(fmtDay(String(ps[0].created_at).slice(0, 10))) + '</span></div></div>'; }).join('') : '';
    el.innerHTML = '<div class="menu">' + forms.slice(0, 10).map(cmRow).join('') + '</div>' + cmp; el.querySelectorAll('[data-cmimg]').forEach(async im => { try { im.src = await cmBlobUrl(im.dataset.cmimg); } catch (e) {} }); }
  catch (e) { el.innerHTML = '<p class="small muted" style="margin:0">' + $t('Konnte nicht geladen werden.') + '</p>'; } }
async function cmOpen(id) { const it = CMX.items[id]; if (!it) return; const coach = it.owner_id ? it.owner_id !== AUTH.uid : CMX.owner !== AUTH.uid; const m = it.meta || {};
  const media = it.kind === 'form' ? '<video id="cm-v" controls muted playsinline style="width:100%;border-radius:12px;background:#000"></video>' : '<img id="cm-i" style="width:100%;border-radius:12px" alt="">';
  const com = (it.comments || []).map(c => '<div class="small" style="margin:6px 0"><b>' + (c.coach ? $t('Coach') : $t('Athlet')) + '</b>' + (it.kind === 'form' ? ' <button class="chip-btn" data-act="cmSeek" data-t="' + num(c.t) + '" type="button">' + fmtClock(num(c.t)) + '</button>' : '') + ' ' + esc(c.text) + '</div>').join('');
  openSheet(sheetHead(esc(it.kind === 'form' ? (LIB[m.ex] ? LIB[m.ex].name : $t('Formcheck')) : $t('Check-in-Foto'))) + media + '<div style="margin-top:10px">' + (com || '<p class="small muted">' + $t('Noch keine Kommentare.') + '</p>') + '</div>' +
    '<div class="fields on-white" style="margin-top:8px"><div class="field" style="flex:1 1 100%"><label for="cm-t">' + (it.kind === 'form' ? $t('Kommentar (wird an der aktuellen Videostelle gespeichert)') : $t('Kommentar')) + '</label><textarea id="cm-t" rows="2" style="width:100%;box-sizing:border-box;font:inherit;padding:10px;border-radius:10px;border:1px solid var(--rule)"></textarea></div></div>' +
    '<div class="row" style="margin-top:8px"><div class="grow"></div><button class="btn brand" data-act="cmSend" data-id="' + esc(id) + '" type="button">' + $t('Senden') + '</button></div>');
  try { const u = await cmBlobUrl(it.path); const el = document.getElementById(it.kind === 'form' ? 'cm-v' : 'cm-i'); if (el) el.src = u; } catch (e) { toast($t('Datei konnte nicht geladen werden.')); } }
/* Coach: Karte in der Athleten-Ansicht */
const _viewClientCM = viewClient;
viewClient = function (uid2) { const h = _viewClientCM.apply(this, arguments); setTimeout(() => { const el = document.getElementById('cm-box'); if (el && !el.dataset.done) { el.dataset.done = 1; cmCardFill(el, uid2, true); } }, 50);
  const card = '<div class="card"><h2>' + $t('Formchecks und Check-in-Fotos') + '</h2><div id="cm-box"><p class="small muted">' + $t('Lade …') + '</p></div></div>'; const i = h.lastIndexOf('</div>'); return i < 0 ? h + card : h.slice(0, i) + card + h.slice(i); };
/* Athlet: Karte im Training */
const _viewTrainingCM = viewTraining;
viewTraining = function () { const h = _viewTrainingCM.apply(this, arguments); if (!cmHasCoach()) return h; setTimeout(() => { const el = document.getElementById('cm-mine'); if (el && !el.dataset.done) { el.dataset.done = 1; cmCardFill(el, AUTH.uid, false); } }, 50);
  return h + '<div class="card"><h2>' + $t('Meine Formchecks') + '</h2><div id="cm-mine"><p class="small muted">' + $t('Lade …') + '</p></div></div>'; };
/* Check-in-Fotos mit dem Coach teilen (Einwilligung) */
const _photoCardCM = photoCard;
photoCard = async function () { const h = await _photoCardCM.apply(this, arguments); if (!cmHasCoach()) return h; const on = !!S.settings.shareCheckin;
  const row = '<label class="small" style="display:flex;gap:8px;align-items:flex-start;margin-top:10px"><input type="checkbox" data-act="cmShare"' + (on ? ' checked' : '') + '> <span>' + $t('Neue Fotos auch mit meinem Coach teilen. Sie werden dann verschlüsselt in der Cloud (Frankfurt) gespeichert, nur du und dein Coach können sie sehen, und nach 90 Tagen gelöscht.') + '</span></label>';
  const i = h.lastIndexOf('</div>'); return h.slice(0, i) + row + h.slice(i); };
document.addEventListener('change', e => { const t = e.target; if (t.id === 'filePhoto' && t.files && t.files[0] && S.settings.shareCheckin && cmHasCoach()) { const f = t.files[0], view = ui.photoView || 'vorne';
    (async () => { try { const blob = await compressImage(f, 1280); const path = AUTH.uid + '/coach/checkin/' + today() + '-' + view + '-' + uid() + '.jpg'; await cmUpload(path, blob, 'image/jpeg');
      await api('/rest/v1/media_items', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ kind: 'checkin', path, meta: { view, date: today() } }) }); toast($t('Foto mit deinem Coach geteilt')); } catch (x) { toast($t('Teilen mit dem Coach fehlgeschlagen.')); } })(); } }, true);
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  if (a === 'cmForm') { const ex = b.dataset.ex; cmPick('video/*', f => cmFormUpload(f, { ex, name: LIB[ex] ? LIB[ex].name : ex, w: +b.dataset.w, k: b.dataset.k, slot: b.dataset.slot, date: today() })); }
  else if (a === 'cmOpen') cmOpen(b.dataset.id);
  else if (a === 'cmSeek') { const v = document.getElementById('cm-v'); if (v) { v.currentTime = num(b.dataset.t) || 0; v.play().catch(() => {}); } }
  else if (a === 'cmShare') { S.settings.shareCheckin = !!b.checked; save(); toast(b.checked ? $t('Neue Fotos werden mit deinem Coach geteilt.') : $t('Fotos werden nicht mehr geteilt.')); }
  else if (a === 'cmSend') { const txt = (document.getElementById('cm-t') || {}).value || ''; if (!txt.trim()) return; const v = document.getElementById('cm-v'); const t = v ? Math.round(v.currentTime * 10) / 10 : 0; const id = b.dataset.id;
    api('/rest/v1/rpc/media_comment', { method: 'POST', body: JSON.stringify({ p_id: id, p_t: t, p_text: txt.trim().slice(0, 1000) }) }).then(c => { const it = CMX.items[id]; if (it) it.comments = (it.comments || []).concat([c]); cmOpen(id); toast($t('Kommentar gesendet')); }).catch(() => toast($t('Senden fehlgeschlagen.'))); } });
/* Aufräumen: eigene Medien nach 90 Tagen löschen (Speicherfrist laut Datenschutzerklärung) */
setTimeout(async () => { try { if (!cmHasCoach() || S.meta.cmPurge === today()) return; S.meta.cmPurge = today(); const old = new Date(Date.now() - CM_DAYS * 864e5).toISOString();
  const L = await api('/rest/v1/media_items?owner_id=eq.' + AUTH.uid + '&created_at=lt.' + old + '&select=id,path'); if (!L || !L.length) return; await cmDelete(L.map(x => x.path));
  await api('/rest/v1/media_items?id=in.(' + L.map(x => x.id).join(',') + ')', { method: 'DELETE' }); } catch (e) { console.warn('cm purge', e); } }, 8000);
/* Taille zu Größe (WHtR) unter den Messwerten */
const _viewMehrCM = viewMehr;
viewMehr = function () { const h = _viewMehrCM.apply(this, arguments); const hgt = num(S.settings.height); if (!hgt) return h; const ks = Object.keys(S.body || {}).filter(k => num((S.body[k] || {}).waist)).sort(); if (!ks.length) return h;
  const wst = num(S.body[ks[ks.length - 1]].waist); const r = Math.round(wst / hgt * 100) / 100; const txt = '<p class="small" style="margin:8px 0 0"><b>' + $t('Taille zu Größe (WHtR):') + '</b> ' + fmt(r, 2) + ' · ' + (r < 0.5 ? $t('unter 0,5, im empfohlenen Bereich') : $t('Ziel unter 0,5')) + '</p>';
  const i = h.indexOf('</tbody></table></div>'); return i < 0 ? h : h.slice(0, i + 22) + txt + h.slice(i + 22); };
