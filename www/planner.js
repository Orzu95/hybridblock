/* Hybridblock – Varianten und Geräte, eigenes Training planen, Plan-Bibliothek mit Vorschau */
'use strict';
const uniq = a => a.filter((x, i) => x && LIB[x] && a.indexOf(x) === i);

/* ======================= VARIANTEN & GERÄTE ======================= */
function variantsSheet(w, k, slot) { const spec = planFor(w, k).find(p => p.slot === slot); if (!spec) return; ui.varCtx = { w, k, slot };
  const cur = actualEx(w, k, spec), tab = ui.swapTab || 'alt'; const sc = id => SCALE[id] || { e: [], h: [] };
  const lists = { alt: uniq([spec.ex, ...LIB[spec.ex].alts, ...LIB[cur].alts]), e: uniq([...sc(cur).e, ...sc(spec.ex).e]).filter(x => x !== cur), h: uniq([...sc(cur).h, ...sc(spec.ex).h]).filter(x => x !== cur) };
  const list = lists[tab].slice().sort((a, b) => (exAvailable(a) ? 0 : 1) - (exAvailable(b) ? 0 : 1));
  const row = x => { const av = exAvailable(x); return '<div class="it' + (av ? '' : $t(' off')) + '" data-act="doswap" data-slot="' + slot + '" data-ex="' + x + '"><div class="grow"><b>' + esc(LIB[x].name) + '</b>' + (x === spec.ex ? $t('<small>Plan-Standard</small>') : '') + (!av ? $t('<small class="t-red">Gerät fehlt</small>') : '') + '</div>' +
    (x === cur ? $t('<span class="tag on-white" style="background:var(--fog)"><span class="dot green"></span>aktiv</span>') : '') + '</div>'; };
  const seg = '<div class="seg">' + [['alt', $t('Alternativen')], ['e', $t('Leichter')], ['h', $t('Schwerer')]].map(t => '<button class="' + (tab === t[0] ? 'on' : '') + '" data-act="varTab" data-v="' + t[0] + '" type="button">' + t[1] + (lists[t[0]].length ? ' ' + lists[t[0]].length : '') + '</button>').join('') + '</div>';
  const hint = { alt: $t('Gleiches Bewegungsmuster, gleiche Sätze und RPE. Der Verlauf läuft pro Übung weiter.'), e: $t('Leichtere Varianten: weniger Hebel, Unterstützung oder Maschine. Gut zum Einstieg, bei Schmerzen oder Müdigkeit.'), h: $t('Schwerere Varianten: wenn du das obere Wiederholungsziel sicher schaffst.') }[tab];
  const scope = '<div class="seg"><button class="' + (ui.swapScope !== 'always' ? 'on' : '') + $t('" data-act="swapscope" data-s="today" type="button">Nur heute</button><button class="') + (ui.swapScope === 'always' ? 'on' : '') + $t('" data-act="swapscope" data-s="always" type="button">Dauerhaft</button></div>');
  openSheet(sheetHead($t('Varianten')) + '<p class="small muted" style="margin-top:6px">' + esc(LIB[cur].name) + '</p>' + seg + '<p class="muted">' + hint + '</p>' + scope +
    '<div class="plist">' + (list.length ? list.map(row).join('') : $t('<p class="small muted">Für diese Übung gibt es hier keine Variante.</p>')) + '</div>' + eqBlock(cur, spec.ex)); }
function eqBlock(exId, alsoId) { const eq = [...new Set([...exEq(exId), ...(alsoId && alsoId !== exId ? exEq(alsoId) : [])])]; const miss = S.settings.missingEq || [], no = S.settings.noEx || [];
  return $t('<h3 style="margin:18px 0 4px">Gerät fehlt?</h3><p class="small muted">Was du abwählst, schlägt die App nicht mehr vor. Übungen damit werden automatisch ersetzt.</p><div class="chips">') +
    eq.map(e => '<button class="chip' + (miss.includes(e) ? '' : $t(' on')) + '" data-act="eqToggle" data-eq="' + e + '" type="button">' + (miss.includes(e) ? '✕ ' : '✓ ') + esc(EQUIP[e] || e) + '</button>').join('') +
    '<button class="chip' + (no.includes(exId) ? '' : $t(' on')) + '" data-act="noExToggle" data-ex="' + exId + '" type="button">' + (no.includes(exId) ? '✕ ' : '✓ ') + $t('Diese Übung vorschlagen</button></div>') +
    (eq.length ? '' : $t('<p class="small muted">Für diese Übung brauchst du kein Gerät.</p>')); }
function toggleIn(key, v) { const a = S.settings[key] = (S.settings[key] || []).slice(); const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); save(); }
function studioCard() { const miss = S.settings.missingEq || []; const n = Object.keys(EQUIP).length - miss.length;
  return $t('<div class="card" id="studiocard"><h2>Mein Studio</h2><p>Tippe an, was es bei dir nicht gibt. Übungen dafür ersetzt die App automatisch durch die nächste passende Alternative.</p>') +
    EQ_GROUP.map(g => '<div class="lbl" style="margin:14px 0 6px">' + g[0] + '</div><div class="chips">' + g[1].map(e => '<button class="chip' + (miss.includes(e) ? '' : $t(' on')) + '" data-act="eqToggle" data-eq="' + e + '" type="button">' + (miss.includes(e) ? '✕ ' : '✓ ') + esc(EQUIP[e]) + '</button>').join('') + '</div>').join('') +
    '<p class="small muted" style="margin-top:10px">' + n + $t(' von ') + Object.keys(EQUIP).length + $t(' Geräten vorhanden') + ((S.settings.noEx || []).length ? ' · ' + S.settings.noEx.length + $t(' Übung(en) ausgeschlossen <button class="linkbtn" data-act="noExReset" type="button">zurücksetzen</button>') : '') + '</p></div>'; }

/* ======================= OHNE PLAN ======================= */
function noPlanCard() { const waiting = S.plan.waiting;
  return '<div class="card"><div class="row" style="margin-bottom:6px"><h2 class="grow">' + (waiting ? $t('Dein Plan kommt') : $t('Freies Training')) + '</h2></div><p>' + (waiting ? $t('Dein Coach erstellt gerade deinen Plan. Bis dahin kannst du frei trainieren, Aktivitäten eintragen und Essen loggen.') : $t('Du trainierst ohne festen Plan. Plane einzelne Trainings oder wähle einen Plan, wann immer du willst.')) + '</p>' +
    '<div class="row" style="margin-top:12px">' + (waiting ? '' : $t('<a class="btn brand sm" href="#library">Plan wählen</a>')) + $t('<a class="btn sm" href="#training">Training planen</a><button class="btn sm" data-act="newAct" type="button">+ Aktivität</button></div></div>'); }
function noPlanView() { const acts = S.activities.slice().sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 12);
  return pageTop($t('Training'), '', S.plan.waiting ? $t('Dein Coach erstellt deinen Plan') : $t('Ohne festen Plan')) + '<div class="stack">' + noPlanCard() + workoutsSection() +
    $t('<div class="section-h"><h2>Letzte Aktivitäten</h2><button class="btn sm fog" data-act="newAct" type="button">+ Aktivität</button></div>') +
    (acts.length ? '<div class="card flush"><div class="list">' + acts.map(actRow).join('') + '</div></div>' : $t('<p class="muted small" style="margin:0 4px">Noch nichts eingetragen.</p>')) +
    (S.plan.waiting ? '' : $t('<div class="card"><h2>Trainingsplan</h2><p>Wähle einen fertigen Plan aus der Bibliothek, lass dir aus deinen Angaben einen erstellen oder bau dir selbst einen.</p><div class="row" style="margin-top:12px"><a class="btn brand" href="#library">Bibliothek</a><button class="btn" data-act="genPlan" type="button">Aus meinen Angaben</button><button class="btn" data-act="blankPlan" type="button">Selbst bauen</button></div></div>')) + '</div>'; }

/* ======================= TRAINING PLANEN (Vorlagen für einzelne Einheiten) ======================= */
function workoutsSection() { const ws = S.workouts || [];
  return $t('<div class="section-h"><h2>Geplante Trainings</h2><button class="btn sm fog" data-act="woNew" type="button">+ Training planen</button></div>') +
    (ws.length ? '<div class="card flush"><div class="list">' + ws.map(x => '<div class="li"><a class="grow" href="#workout/' + x.id + '" style="text-decoration:none;color:inherit"><b>' + esc(x.name || $t('Training')) + '</b><small>' + x.items.length + $t(' Übungen · ') + x.items.reduce((a, i) => a + (num(i.sets) || 0), 0) + $t(' Sätze') + (x.last ? $t(' · zuletzt ') + fmtDay(x.last) : '') + '</small></a><button class="btn sm brand" data-act="woStart" data-id="' + x.id + $t('" type="button">Starten</button></div>')).join('') + '</div></div>'
      : $t('<p class="muted small" style="margin:0 4px">Stell dir ein Training zusammen, speichere es und starte es, wann du willst. Auch ohne festen Plan.</p>')); }
function viewWorkout(id) { const x = (S.workouts || []).find(o => o.id === id); if (!x) return '<a href="#training" class="back">' + ICON.back + $t('Training</a><p>Training nicht gefunden.</p>');
  const rows = x.items.map((it, i) => { const ex = LIB[it.ex] || { name: it.ex }; const inp = (f, wd, ph, txt) => '<label>' + { sets: $t('Sätze'), reps: $t('Wdh.'), rpe: $t('RPE'), rest: $t('Pause s') }[f] + '<input class="pe-in" type="' + (txt ? 'text' : 'number') + '"' + (txt ? '' : ' inputmode="decimal" step="any"') + ' data-wo="' + f + '" data-i="' + i + '" value="' + esc(it[f] ?? '') + '" placeholder="' + ph + '" style="width:' + wd + 'px"></label>';
    const sg = typeof ssInfo === 'function' ? ssInfo(x.items, o => o.grp, o => o.gm)[i] : null;
    return (sg && sg.pos === 1 ? ssHeadHTML(sg) : '') + '<div class="pe-row' + (sg ? ' ss-m ss-' + sg.mode : '') + '"><div class="pe-h"><button class="nm exlink" type="button" data-act="exInfo" data-ex="' + it.ex + '">' + (sg ? '<span class="sup">' + sg.label + '</span>' : '') + esc(ex.name) + '</button>' + (!exAvailable(it.ex) ? $t('<span class="small t-red">Gerät fehlt</span>') : '') +
      '<button class="btn sm" data-act="woMove" data-i="' + i + $t('" data-v="-1" type="button" aria-label="Nach oben"') + (i ? '' : $t(' disabled')) + '>↑</button><button class="btn sm" data-act="woDel" data-i="' + i + $t('" type="button" aria-label="Übung entfernen">✕</button></div>') +
      '<div class="pe-f">' + inp('sets', 64, '3') + inp('reps', 86, '8–12', true) + inp('rpe', 64, '8') + inp('rest', 76, '90') + '</div></div>' + (typeof ssLinkBar === 'function' ? ssLinkBar('wo', id, i, x.items, o => o.grp, o => o.gm) : ''); }).join('');
  return '<a href="#training" class="back">' + ICON.back + $t('Training</a>') + pageTop(...$tp('Training', 'planen'), $t('Übungen, Sätze und Ziel-RPE festlegen, dann starten')) + '<div class="stack">' +
    $t('<div class="card"><div class="field"><label for="wo-name">Name</label><input id="wo-name" type="text" data-wo="name" value="') + esc(x.name || '') + $t('" placeholder="z. B. Oberkörper kurz" style="width:100%"></div></div>') +
    '<div class="card"><div class="pe-list" style="margin-top:0">' + (rows || $t('<p class="small muted">Noch keine Übungen.</p>')) + '</div><button class="btn block" style="margin-top:10px" data-act="woAddEx" data-id="' + id + $t('" type="button">+ Übung</button></div>') +
    '<div class="row"><button class="btn danger" data-act="woRemove" data-id="' + id + '" type="button">' + (ui.confirmWo === id ? $t('Wirklich löschen?') : $t('Löschen')) + '</button><div class="grow"></div><button class="btn brand" data-act="woStart" data-id="' + id + '" type="button"' + (x.items.length ? '' : $t(' disabled')) + $t('>Jetzt starten</button></div></div>'); }
function startWorkout(id) { const x = (S.workouts || []).find(o => o.id === id); if (!x || !x.items.length) return; const a = newActivity('kraft'); a.title = x.name || null; a.wo = id;
  a.exercises = x.items.map(it => { const ex = exAvailable(it.ex) ? it.ex : (substituteEx(it.ex) || it.ex); return { ex, sets: Array.from({ length: Math.max(1, num(it.sets) || 3) }, () => ({})), reps: it.reps || '8–12', rpe: num(it.rpe), rest: num(it.rest) || 90, grp: it.grp || '', gm: it.gm || '' }; });
  x.last = today(); save(); location.hash = '#frei/' + a.id; }
function saveActAsWorkout(a) { const x = { id: uid(), name: a.title || ACT_MAP[a.type].name, items: (a.exercises || []).map(e => ({ ex: e.ex, sets: (e.sets || []).length || 3, reps: e.reps || '8–12', rpe: e.rpe ?? 8, rest: e.rest || 90, grp: e.grp || '', gm: e.gm || '' })) };
  S.workouts.push(x); save(); return x; }

/* ======================= PLAN WECHSELN ======================= */
function archiveHistory(exId) { for (let i = S.archive.length - 1; i >= 0; i--) { const ar = S.archive[i]; const keys = Object.keys(ar.sessions || {}).sort((a, b) => ((ar.sessions[b].date || '') > (ar.sessions[a].date || '') ? 1 : -1));
    for (const key of keys) { const m = key.match(RE_SESS); if (!m) continue; const s = ar.sessions[key]; const items = [];
      for (const slot in s.logs || {}) { const lg = s.logs[slot]; if (lg.ex !== exId) continue; const sets = loggedSets(lg); if (sets.length) items.push({ slot, sets, spec: planForP(ar.plan, +m[1], m[2]).find(p => p.slot === slot) }); }
      if (items.length) return { w: +m[1], k: m[2], items }; } } return null; }
/* neuer Plan: bisherige Einheiten wandern ins Archiv, damit Verlauf und Vorschläge erhalten bleiben */
function switchPlan(plan) { if (Object.keys(S.sessions).length) S.archive.push({ plan: S.plan, sessions: S.sessions, block: S.block, until: today() });
  S.sessions = {}; S.swaps = {}; S.block = { week: 1, startedOn: null }; S.settings.dayMap = {}; S.meta.daysSet = false; setPlan(plan, false); S.plan.sessions.forEach(x => { S.settings.dayMap[x.k] = plan.dayMap && plan.dayMap[x.k] != null ? plan.dayMap[x.k] : ''; });
  ui.week = null; save(); if (typeof AUTH !== 'undefined' && AUTH) pushPlan(AUTH.uid, S.plan).then(t2 => { S.meta.planAt = t2; persist(); }).catch(() => {}); }

/* ======================= BIBLIOTHEK ======================= */
const GRADE_TXT = { A: $t('Prinzipien durch Meta-Analysen gut belegt'), B: $t('Solide Prinzipien, einzelne Punkte wenig untersucht oder nicht optimal'), C: $t('Funktioniert in der Praxis, Teile weichen von der Evidenz ab') };
const tagsOf = p => '<div class="chips small-chips">' + p.goals.map(g => '<span class="chip on">' + esc(GOALS[g]) + '</span>').join('') + p.level.map(l => '<span class="chip">' + esc(LEVELS[l]) + '</span>').join('') + '</div>';
const factsOf = p => p.days + $t('× pro Woche · ca. ') + p.minutes + $t(' min · ') + PLACES[p.place] + ' · ' + p.weeks + $t(' Wochen');
const BY_TXT = { hb: $t('Hybridblock Coach'), coach: $t('Dein Coach'), community: $t('Community-Mitglied') };
const SEX_TXT = { both: $t('Für alle'), w: $t('Empfohlen für Frauen'), m: $t('Empfohlen für Männer') };
const DIFF_TXT = [$t('Leicht'), $t('Mittel'), $t('Schwer')];
function planDiff(p) { const lv = { beginner: 1, intermediate: 2, advanced: 3 }; const L = (p.level || ['intermediate']).map(x => lv[x] || 2); let s = L.reduce((a, b) => a + b, 0) / L.length;
  let sets = 0, rpe = [], ss = []; try { ss = p.sessions ? p.sessions() : []; } catch (e) {} ss.forEach(x => (x.add || []).forEach(a => { sets += +a.sets || 0; if (a.type === 'main' && a.rpe != null) rpe.push(a.rpe); }));
  let cmin = 0; ss.forEach(x => { const c = x.cardio && x.cardio.weeks && x.cardio.weeks[0]; if (c && c.min) cmin += c.min; });
  const d = p.days || 3; s += (d >= 5 ? .5 : 0) + (d >= 6 ? .5 : 0) - (d <= 3 ? .5 : 0); s += (sets >= 70 ? .5 : 0) + (sets >= 100 ? .5 : 0) - (sets && sets < 40 ? .5 : 0); s += cmin >= 300 ? 1 : 0;
  if (rpe.length && rpe.reduce((a, b) => a + b, 0) / rpe.length >= 8.5) s += .5;
  return s <= 1.5 ? 0 : s <= 2.5 ? 1 : 2; }
const byLine = p => esc(BY_TXT[p.by] || BY_TXT.hb) + (p.byName ? ' · ' + esc(p.byName) : '') + (p.ev ? ' · ' + $t('Evidenz') + ' ' + p.ev.g : '');
const planChips = p => '<div class="chips small-chips" style="margin-top:6px"><span class="chip">' + esc(DIFF_TXT[planDiff(p)]) + '</span><span class="chip">' + esc(SEX_TXT[p.sex || (p.focus === 'lower' ? 'w' : 'both')]) + '</span>' + (p.module ? $t('<span class="chip on">Modul</span>') : '') + '</div>';
function libCard(p, why) { return '<a class="card libcard" href="#library/' + p.id + '"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div class="grow"><h2 style="margin:0">' + esc($t(p.name)) + '</h2>' + (p.tag ? '<div class="small" style="margin-top:2px;font-weight:600">' + esc($t(p.tag)) + '</div>' : '') + '<div class="small muted" style="margin-top:2px">' + byLine(p) + '</div></div><span class="grade g' + p.ev.g + '" title="' + esc(GRADE_TXT[p.ev.g]) + '">' + p.ev.g + '</span></div>' +
  '<p class="small" style="margin-top:8px">' + esc($t(p.desc)) + '</p>' + tagsOf(p) + planChips(p) + '<div class="small muted" style="margin-top:8px">' + esc(factsOf(p)) + '</div>' + (why && why.length ? '<div class="small t-green" style="font-weight:700;margin-top:6px">' + esc(why.join(' · ')) + '</div>' : '') + '</a>'; }
function libQuery() { const st = S.settings; const q = st.q || {}; return { goal: q.goal, level: q.level, days: q.days, minutes: q.minutes, place: q.place, focus: q.focus, pain: q.pain || {} }; }
function viewLibrary() { const q = libQuery(); const filt = ui.libGoal || ''; const ctx = libCtxLine();
  const rec = q.goal ? recommendPlans(q).slice(0, 3) : []; const all = Object.values(LIBRARY).filter(p => !p.module && (!filt || p.goals.includes(filt))); const mods = Object.values(LIBRARY).filter(p => p.module);
  return '<a href="' + (ui.libFor ? '#admin/' + ui.libFor : '#training') + '" class="back">' + ICON.back + (ui.libFor ? $t('Athlet') : $t('Training')) + '</a>' + pageTop($t('Trainingspläne'), '', $t('Vom Hybridblock Coach, gegen die Studienlage geprüft')) + '<div class="stack">' + ctx +
    (rec.length ? $t('<div class="section-h"><h2>Für dich empfohlen</h2></div>') + rec.map(r => libCard(r.p, r.why)).join('') : $t('<div class="card"><p>Sag der App dein Ziel, deine Erfahrung und wie oft du trainieren kannst, dann bekommst du Empfehlungen.</p><button class="btn brand" style="margin-top:12px" data-act="libAsk" type="button">Angaben machen</button></div>')) +
    $t('<div class="card"><div class="row"><div class="grow"><h2 style="margin:0">Plan erstellen lassen</h2><p class="small">Aus Ziel, Erfahrung, Tagen, Zeit, Geräten und Beschwerden.</p></div><button class="btn brand sm" data-act="genPlan" type="button">Erstellen</button></div></div>') +
    $t('<div class="section-h"><h2>Alle Pläne</h2></div><div class="seg">') + [['', $t('Alle')], ...Object.keys(GOALS).map(g => [g, GOALS[g]])].map(g => '<button class="' + (filt === g[0] ? 'on' : '') + '" data-act="libGoal" data-v="' + g[0] + '" type="button">' + esc(g[1]) + '</button>').join('') + '</div>' +
    all.map(p => libCard(p)).join('') + (mods.length && !ui.libFor ? $t('<div class="section-h"><h2>Module</h2></div><p class="small muted" style="margin:-4px 2px 4px">Kurze Zusatzeinheiten, die du zu deinem laufenden Plan hinzufügst.</p>') + mods.map(p => libCard(p)).join('') : '') + $t('<div class="card sw-only"><h2>Bewertung</h2><ul class="rules small">') + Object.keys(GRADE_TXT).map(g => '<li><b>' + g + ':</b> ' + GRADE_TXT[g] + '</li>').join('') + $t('</ul><p class="small muted">Prozent-Vorgaben sind zusätzlich als RPE hinterlegt: Die App rechnet aus deinem geschätzten 1RM die passende Last und passt sie an deine Tagesform an. Veröffentlicht werden nur Pläne mit Bewertung A oder B.</p></div>') +
    $t('<button class="btn block" data-act="blankPlan" type="button">Leeren Plan selbst bauen</button></div>'); }
function libCtxLine() { if (ui.libFor) { const c = (ADMIN.clients || []).find(x => x.id === ui.libFor); return note('sky', $t('Du wählst einen Plan für <b>') + esc(c ? cname(c) : $t('deinen Athleten')) + $t('</b>. Du kannst ihn danach anpassen.')); } return ''; }
function planSessionsHTML(plan) { return plan.sessions.map(s => { const d = sessDef(s) || {}; const title = $t(s.title || d.title || $t('Einheit')); let body;
  if (s.kind === 'gym') { const items = planForP(plan, 1, s.k); body = items.map(it => '<li><b>' + it.sets + ' × ' + esc(it.reps) + (it.type === 'time' ? ' s' : it.type === 'carry' ? ' m' : '') + '</b> ' + esc(LIB[it.ex] ? LIB[it.ex].name : it.ex) + (it.rpe != null && it.type !== 'time' ? ' <span class="muted">@' + fmt(it.rpe) + '</span>' : '') + (it.sup ? ' <span class="sup">' + esc(it.sup) + '</span>' : '') + '</li>').join(''); }
  else { const sp = cardioSpecS(s, 1); body = '<li>' + esc(cardioTitle(sp)) + '</li><li class="muted">' + esc(cardioSub(sp)) + '</li>'; }
  return '<div class="prevsess"><div class="row"><span class="badge ' + s.kind + ' sm">' + (s.kind === 'z2' ? 'Z2' : s.kind === 'hiit' ? 'H' : s.k) + '</span><b class="grow">' + esc(title) + '</b></div><ul>' + body + '</ul></div>'; }).join(''); }
function libPreviewHTML(p, plan, actions) { const ev = p.ev || { g: '–', pros: [], cons: [] };
  return '<div class="stack">' + (p.id ? '<div class="card"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><p class="grow" style="margin:0">' + esc($t(p.desc)) + '</p><span class="grade g' + ev.g + '">' + ev.g + '</span></div><div class="small muted" style="margin-top:6px">' + byLine(p) + '</div>' + tagsOf(p) + planChips(p) + '<div class="small muted" style="margin-top:8px">' + esc(factsOf(p)) + '</div></div>' : '') +
    (p.who ? $t('<div class="card"><h3>Für wen</h3><p>') + esc($t(p.who)) + $t('</p><h3 style="margin-top:12px">Voraussetzungen</h3><p>') + esc($t(p.prereq)) + $t('</p><h3 style="margin-top:12px">Aufbau</h3><p>') + esc($t(p.struct)) + '</p></div>' : '') +
    $t('<div class="card"><h3>Woche 1 im Überblick</h3>') + planSessionsHTML(plan) + '</div>' +
    (p.weekly && p.weekly.length ? $t('<div class="card"><h3>Wochenverlauf</h3><ul class="rules small">') + p.weekly.map(x => { const e = x.e || {}; const lab = e.x && LIB[e.x] ? LIB[e.x].name : e.l ? $t(e.l) : ''; const DAY = { Mo: 0, Di: 1, Mi: 2, Do: 3, Fr: 4, Sa: 5, So: 6, A: -1 }; const dl = e.d && DAY[e.d] >= 0 ? ' (' + WD_SHORT_MO()[DAY[e.d]] + ')' : e.d ? ' (' + e.d + ')' : '';
      return $t('<li><b>Woche ') + x.w + '</b>' + (lab ? ' · ' + esc(lab + dl) : '') + ': ' + esc($t(x.t)) + '</li>'; }).join('') + '</ul></div>' : '') +
    (p.ev ? $t('<div class="card sw-only"><h3>Evidenz-Check: ') + ev.g + '</h3><p class="small muted">' + esc(GRADE_TXT[ev.g] || '') + '</p><ul class="rules small pros">' + ev.pros.map(x => '<li>' + esc($t(x)) + '</li>').join('') + '</ul><ul class="rules small cons">' + ev.cons.map(x => '<li>' + esc($t(x)) + '</li>').join('') + '</ul></div>' : '') +
    (p.src ? $t('<div class="card sw-only"><h3>Quellen</h3><ul class="rules small">') + p.src.map(x => '<li><a href="' + esc(x.u) + '" target="_blank" rel="noopener">' + esc($t(x.t)) + '</a></li>').join('') + '</ul></div>' : '') + actions + '</div>'; }
function libActions(id) { const LP = LIBRARY[id]; if (LP && LP.module) { const on = (S.plan.mods || []).includes(id); return on ? $t('<button class="btn block" data-act="modDel" data-id="') + id + $t('" type="button">Modul aus meinem Plan entfernen</button>') : $t('<button class="btn brand block" data-act="modAdd" data-id="') + id + $t('" type="button">Zu meinem Plan hinzufügen</button><p class="small muted" style="margin-top:6px">Die Einheiten kommen zusätzlich an die vorgesehenen Tage. Du kannst sie jederzeit verschieben oder wieder entfernen.</p>'); }
  if (ui.libFor) return '<button class="btn brand block" data-act="libUseFor" data-id="' + id + $t('" type="button">Für diesen Athleten übernehmen</button>');
  if (route.name === 'start') return '<button class="btn brand block" data-act="onbPick" data-id="' + id + $t('" type="button">Diesen Plan wählen</button>');
  return '<div class="row"><button class="btn" data-act="libEdit" data-id="' + id + $t('" type="button">Vorher anpassen</button><div class="grow"></div><button class="btn brand" data-act="libUse" data-id="') + id + $t('" type="button">Diesen Plan starten</button></div>') +
    (ui.confirmLib === id ? note('amber', $t('Dein aktueller Plan wird ersetzt. Dein Verlauf bleibt erhalten, die Wochenzählung beginnt wieder bei Woche 1.'), '<button class="btn sm dark" data-act="libUseYes" data-id="' + id + $t('" type="button">Ja, starten</button>')) : ''); }
function viewLibPlan(id) { if (id === 'gen') return viewGenPlan(); const p = LIBRARY[id]; if (!p) return '<a href="#library" class="back">' + ICON.back + $t('Bibliothek</a><p>Plan nicht gefunden.</p>');
  return '<a href="#library" class="back">' + ICON.back + $t('Bibliothek</a>') + pageTop(esc($t(p.name)), '', esc($t(p.tag || ''))) + libPreviewHTML(p, makePlan(id), libActions(id)); }
function viewGenPlan() { const q = libQuery(); if (!q.goal) { setTimeout(goalsSheet, 50); return '<a href="#library" class="back">' + ICON.back + $t('Bibliothek</a><p class="muted">Erst deine Angaben machen.</p>'); }
  ui.genPlan = ui.genPlan || generatePlan(q); const g = ui.genPlan;
  const meta = { desc: $t('Aus deinen Angaben erstellt: ') + GOALS[g.gen.goal] + ', ' + LEVELS[g.gen.level] + ', ' + g.gen.days + $t(' Tage, ') + g.gen.minutes + $t(' min. Übungen passend zu deinen Geräten') + (Object.keys(q.pain || {}).length ? $t(', Beschwerden berücksichtigt') : '') + '.' };
  const acts = ui.libFor ? $t('<button class="btn brand block" data-act="libUseFor" data-id="gen" type="button">Für diesen Athleten übernehmen</button>') : route.name === 'start' ? $t('<button class="btn brand block" data-act="onbPick" data-id="gen" type="button">Diesen Plan wählen</button>')
    : $t('<div class="row"><button class="btn" data-act="genAgain" type="button">Neu würfeln</button><button class="btn" data-act="libEdit" data-id="gen" type="button">Anpassen</button><div class="grow"></div><button class="btn brand" data-act="libUse" data-id="gen" type="button">Starten</button></div>') + (ui.confirmLib === 'gen' ? note('amber', $t('Dein aktueller Plan wird ersetzt. Dein Verlauf bleibt erhalten.'), $t('<button class="btn sm dark" data-act="libUseYes" data-id="gen" type="button">Ja, starten</button>')) : '');
  return '<a href="#library" class="back">' + ICON.back + $t('Bibliothek</a>') + pageTop(...$tp('Dein', 'Vorschlag'), $t('Regelbasiert erstellt, alles anpassbar')) + '<div class="stack"><div class="card"><p style="margin:0">' + esc(meta.desc) + $t('</p><p class="small muted">Sätze, Wiederholungen und RPE richten sich nach deinem Ziel. Deload- und Testwochen rechnet die App automatisch ein.</p></div>') + libPreviewHTML({}, g, acts) + '</div>'; }
function planFromId(id) { return id === 'gen' ? JSON.parse(JSON.stringify(ui.genPlan || generatePlan(libQuery()))) : makePlan(id); }
/* Angaben für Empfehlung und Generator */
function goalsFields(q) { q = Object.assign({ focus: S.settings.sex === 'w' ? 'lower' : 'balanced' }, q); const sel = (k, lab, opts) => '<div class="field"><label for="q-' + k + '">' + lab + '</label><select id="q-' + k + '" data-q="' + k + '">' + '<option value="">–</option>' + opts.map(o => '<option value="' + o[0] + '"' + (String(q[k] ?? '') === String(o[0]) ? $t(' selected') : '') + '>' + esc(o[1]) + '</option>').join('') + '</select></div>';
  return '<div class="fields">' + sel('goal', $t('Ziel'), Object.keys(GOALS).map(g => [g, GOALS[g]])) + sel('level', $t('Erfahrung'), [['beginner', $t('Einsteiger (unter 1 Jahr)')], ['intermediate', $t('Fortgeschritten (1–3 Jahre)')], ['advanced', $t('Erfahren (über 3 Jahre)')]]) +
    sel('days', $t('Tage pro Woche'), [2, 3, 4, 5, 6].map(d => [d, d + $t(' Tage')])) + sel('minutes', $t('Zeit pro Einheit'), [30, 45, 60, 75, 90].map(m => [m, m + $t(' min')])) + sel('place', $t('Wo trainierst du?'), Object.keys(PLACES).map(p => [p, PLACES[p]])) + sel('focus', $t('Schwerpunkt'), [['balanced', $t('Ausgewogen')], ['lower', $t('Beine und Po')]]) + '</div>'; }
function goalsSheet() { const q = S.settings.q || {}; openSheet(sheetHead($t('Deine Angaben')) + '<div class="on-white" style="margin-top:12px">' + goalsFields(q) + $t('</div><p class="small muted">Welche Geräte fehlen, legst du unter Einstellungen → Mein Studio fest.</p><div class="row" style="margin-top:14px"><div class="grow"></div><button class="btn brand" data-act="goalsSave" type="button">Fertig</button></div>')); }

/* ======================= EVENTS ======================= */
document.addEventListener('input', e => { const t = e.target;
  if (t.dataset.q) { S.settings.q = Object.assign({}, S.settings.q || {}); S.settings.q[t.dataset.q] = t.value; ui.genPlan = null; save(); return; }
  if (t.dataset.wo) { const r = route.name === 'workout' && (S.workouts || []).find(o => o.id === route.arg); if (!r) return; if (t.dataset.wo === 'name') r.name = t.value; else { const it = r.items[+t.dataset.i]; if (it) it[t.dataset.wo] = t.dataset.wo === 'reps' ? t.value : num(t.value); } save(); return; } });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  switch (a) {
    case 'varTab': ui.swapTab = b.dataset.v; if (ui.varCtx) variantsSheet(ui.varCtx.w, ui.varCtx.k, ui.varCtx.slot); break;
    case 'eqToggle': toggleIn('missingEq', b.dataset.eq); ui.genPlan = null; if (!$('#sheet').hidden && ui.varCtx && route.name === 'training') { render(); variantsSheet(ui.varCtx.w, ui.varCtx.k, ui.varCtx.slot); } else if (!$('#sheet').hidden && ui.exEqCtx) { exEqSheet(ui.exEqCtx); render(); } else render(); break;
    case 'noExToggle': toggleIn('noEx', b.dataset.ex); if (!$('#sheet').hidden && ui.varCtx && route.name === 'training') { render(); variantsSheet(ui.varCtx.w, ui.varCtx.k, ui.varCtx.slot); } else if (ui.exEqCtx) { exEqSheet(ui.exEqCtx); render(); } break;
    case 'noExReset': S.settings.noEx = []; save(); render(); break;
    case 'woNew': { const x = { id: uid(), name: '', items: [] }; S.workouts.push(x); save(); location.hash = '#workout/' + x.id; break; }
    case 'woAddEx': ui.woPick = b.dataset.id; exPickSheet('wo:' + b.dataset.id); break;
    case 'woDel': { const x = S.workouts.find(o => o.id === route.arg); if (x) { x.items.splice(+b.dataset.i, 1); save(); render(); } break; }
    case 'woMove': { const x = S.workouts.find(o => o.id === route.arg); const i = +b.dataset.i, j = i + (+b.dataset.v); if (x && j >= 0) { [x.items[i], x.items[j]] = [x.items[j], x.items[i]]; save(); render(); } break; }
    case 'woRemove': if (ui.confirmWo !== b.dataset.id) { ui.confirmWo = b.dataset.id; render(); break; } S.workouts = S.workouts.filter(o => o.id !== b.dataset.id); ui.confirmWo = null; save(); location.hash = '#training'; break;
    case 'woStart': startWorkout(b.dataset.id); break;
    case 'woFromAct': { const act = S.activities.find(x => x.id === b.dataset.aid); if (act && (act.exercises || []).length) { const x = saveActAsWorkout(act); toast($t('Als Training gespeichert: ') + x.name); } break; }
    case 'libGoal': ui.libGoal = b.dataset.v; render(); break;
    case 'libAsk': goalsSheet(); break;
    case 'goalsSave': closeSheet(); ui.genPlan = null; render(); break;
    case 'genPlan': if (!(S.settings.q || {}).goal) { goalsSheet(); ui.afterGoals = 'gen'; break; } ui.genPlan = null; location.hash = '#library/gen'; break;
    case 'genAgain': { const q = libQuery(); const keep = S.settings.missingEq; ui.genPlan = generatePlan(Object.assign({}, q, { level: q.level })); ui.genPlan.sessions.forEach(s => (s.add || []).forEach(it => { const alts = (LIB[it.ex].alts || []).filter(x => exAvailable(x)); if (alts.length && Math.random() < .5) it.ex = alts[Math.floor(Math.random() * alts.length)]; })); render(); break; }
    case 'blankPlan': { PE.uid = ui.libFor || 'me'; PE.draft = makePlan('blank'); PE.dirty = true; PE.confirm = null; location.hash = '#plan/' + (ui.libFor || 'me'); break; }
    case 'libUse': ui.confirmLib = b.dataset.id; render(); break;
    case 'modAdd': { const id = b.dataset.id, T = PLAN_TPL[id]; if (!T || (S.plan.mods || []).includes(id)) break; const ss = JSON.parse(JSON.stringify(T.sessions())); ss.forEach(x => { x.mod = id; S.plan.sessions.push(x); S.settings.dayMap[x.k] = (TPL_DAYMAP[id] || {})[x.k] || ''; }); S.plan.mods = (S.plan.mods || []).concat(id); applyPlan(); save(); toast($t('Modul hinzugefügt: ') + $t(T.name)); render(); break; }
    case 'modDel': { const id = b.dataset.id; S.plan.sessions = S.plan.sessions.filter(x => x.mod !== id); S.plan.mods = (S.plan.mods || []).filter(x => x !== id); applyPlan(); save(); toast($t('Modul entfernt')); render(); break; }
    case 'libUseYes': { switchPlan(planFromId(b.dataset.id)); ui.confirmLib = null; toast($t('Neuer Plan: ') + $t(S.plan.name)); location.hash = '#training'; break; }
    case 'libEdit': { PE.uid = 'me'; PE.draft = planFromId(b.dataset.id); PE.dirty = true; PE.confirm = null; PE.switching = true; location.hash = '#plan/me'; break; }
    case 'libUseFor': { const uid2 = ui.libFor; const prev = PE.uid === uid2 && PE.draft ? PE.draft : null; PE.uid = uid2; PE.draft = planFromId(b.dataset.id); if (prev) { PE.draft.note = prev.note || ''; PE.draft.targets = prev.targets || null; } PE.dirty = true; PE.confirm = null; ui.libFor = null; location.hash = '#plan/' + uid2; break; }
  } });
function exEqSheet(exId) { ui.exEqCtx = exId; ui.varCtx = null; openSheet(sheetHead(esc(LIB[exId].name)) + eqBlock(exId)); }
function planInfoCard() { const meta = LIBRARY[S.plan.tpl]; return $t('<div class="card"><div class="row" style="flex-wrap:nowrap"><div class="grow"><div class="lbl">Dein Plan</div><h2 style="margin:2px 0 0">') + esc($t(S.plan.name)) + '</h2>' + '<div class="small muted">' + byLine(Object.assign({}, meta || {}, { by: S.plan.by || (meta ? meta.by : 'coach'), ev: meta && meta.ev })) + '</div>' + '</div>' + (meta && meta.ev ? '<span class="grade g' + meta.ev.g + '">' + meta.ev.g + '</span>' : '') + '</div>' +
  '<div class="row" style="margin-top:12px">' + (meta ? '<a class="btn sm" href="#library/' + S.plan.tpl + $t('">Details</a>') : '') + $t('<a class="btn sm" href="#plan/me">Bearbeiten</a><a class="btn sm" href="#library">Plan wechseln</a></div></div>'); }

/* ======================= EINHEIT ABSCHLIESSEN ======================= */
function finBtn(w, k) { const s = peekSess(w, k); if (!s || s.skipped) return '';
  return (s.end && s.end.fin) ? '<button class="btn block fin-done" data-act="finShow" data-w="' + w + '" data-k="' + k + $t('" type="button" style="margin-top:14px">✓ Einheit abgeschlossen · Zusammenfassung</button>')
    : '<button class="btn brand block" data-act="finSess" data-w="' + w + '" data-k="' + k + $t('" type="button" style="margin-top:14px">Einheit beenden</button>'); }
/* Automatisch, sobald alle Sätze erledigt und Dauer + RPE eingetragen sind */
function maybeAutoFinish(w, k) { const s = peekSess(w, k); if (!s || s.skipped || (s.end && s.end.fin)) return;
  const L = sessLoad(w, k); if (!L || !L.dur || !L.rpe) return; if (!sessProgress(w, k).done) return; finishSession(w, k); }
function finishSession(w, k) { const s = sess(w, k); markStarted(w, k);
  if (isCardio(k)) { s.end = s.end || {}; } else { s.end = s.end || {}; if (!num(s.end.dur)) { const ad = autoDur(s) || (s.watch && Math.round(s.watch.dur)); if (ad) s.end.dur = String(ad); } }
  s.end.fin = Date.now(); save(); try { clearInterval(TM.iv); TM.queue = []; showTimer(false); restCancel(); } catch (e) {}
  try { if (navigator.vibrate) navigator.vibrate([30, 60, 30]); } catch (e) {}
  if (route.name === 'training' && sessFromRoute()) { if (isCardio(k)) render(); else softPatch('endcard', endCard(w, k)); }
  finSheet(w, k, true); }
function sessStats(w, k) { const s = peekSess(w, k) || {}; let sets = 0, total = 0, vol = 0, reps = 0; const prs = [];
  planFor(w, k).forEach(p => { total += p.sets; });
  Object.keys(s.logs || {}).forEach(slot => { const lg = s.logs[slot]; const spec = planFor(w, k).find(p => p.slot === slot); const done = loggedSets(lg).filter(x => x.done);
    sets += done.length; done.forEach(x => { if (x.r) reps += x.r; if (x.w > 0 && x.r) vol += x.w * x.r; });
    const best = done.reduce((m, x) => x.w > 0 && x.r ? Math.max(m, e1rm(x.w, x.r, Math.min(10, x.rpe ?? (spec && spec.rpe) ?? 8))) : m, 0);
    if (best > 0 && LIB[lg.ex]) { const before = exHistory(lg.ex).filter(o => !(o.label.startsWith(SESS[k].title) && o.wk === w)).reduce((m, o) => Math.max(m, ...o.sets.filter(x => x.w > 0 && x.r).map(x => e1rm(x.w, x.r, Math.min(10, x.rpe ?? 8)))), 0);
      if (before > 0 && best > before * 1.005) prs.push({ name: LIB[lg.ex].name, v: best, before }); } });
  return { sets, total, vol, reps, prs, load: sessLoad(w, k) }; }
function finSheet(w, k, fresh) { const st = sessStats(w, k); const L = st.load || {}; const cardio = isCardio(k);
  const doneN = ORDER.filter(x => { const p = sessProgress(w, x); return p.done && !p.skipped; }).length;
  const next = ORDER.find(x => !sessProgress(w, x).done);
  const tile = (v, l) => '<div class="fin-tile"><b>' + v + '</b><span>' + l + '</span></div>';
  const tiles = [L.dur ? tile(fmt(L.dur, 0), $t('Minuten')) : '', cardio ? '' : tile(st.sets + (st.total ? '<small>/' + st.total + '</small>' : ''), $t('Sätze')),
    !cardio && st.vol ? tile(st.vol >= 10000 ? fmt(st.vol / 1000, 1) + ' ' + $t('t') : fmt(st.vol, 0) + ' ' + $t('kg'), $t('Volumen')) : '', !cardio && !st.vol && st.reps ? tile(st.reps, $t('Wiederholungen')) : '',
    L.rpe ? tile(fmt(L.rpe), $t('Session-RPE')) : '', L.load ? tile(fmt(L.load, 0), $t('Belastung')) : ''].filter(Boolean).join('');
  const prH = st.prs.length ? $t('<div class="fin-pr"><div class="lbl">Neue PRs</div>') + st.prs.map(p => '<div class="row"><span class="grow">🏆 ' + esc(p.name) + '</span><b>' + fmt(p.v, 0) + $t(' kg e1RM') + '</b></div>').join('') + '</div>' : '';
  const wk = '<div class="fin-week"><div class="row"><span class="grow">' + $t('Woche ') + w + '</span><b>' + doneN + ' / ' + ORDER.length + '</b></div><div class="fin-bar"><i style="width:' + Math.round(doneN / Math.max(1, ORDER.length) * 100) + '%"></i></div>' +
    '<p class="small muted" style="margin-top:8px">' + (next ? $t('Als Nächstes: ') + '<b>' + esc(SESS[next].title) + '</b> · ' + esc(dayLabel(next)) : (w < NW() ? $t('Alle Einheiten dieser Woche erledigt. Stark!') : $t('Block geschafft. Stark!'))) + '</p></div>';
  openSheet('<div class="fin' + (fresh ? ' fresh' : '') + '"><div class="fin-check"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-15"/></svg></div>' +
    '<h2>' + $t('Einheit geschafft!') + '</h2><p class="muted">' + esc(SESS[k].title) + ' · ' + $t('Woche ') + w + '</p>' +
    (tiles ? '<div class="fin-tiles">' + tiles + '</div>' : '') + prH + wk +
    '<button class="btn brand block" data-act="finClose" type="button">' + $t('Fertig') + '</button>' +
    '<button class="btn block ghost" data-act="finReopen" data-w="' + w + '" data-k="' + k + '" type="button" style="margin-top:6px">' + $t('Doch noch weitermachen') + '</button></div>'); }
document.addEventListener('change', e => { const t = e.target;
  if (t.dataset.se && (t.dataset.se === 'dur' || t.dataset.se === 'rpe')) maybeAutoFinish(+t.dataset.sw, t.dataset.sk);
  if (t.dataset.cf && (t.dataset.cf === 'dur' || t.dataset.cf === 'rpe')) maybeAutoFinish(+t.dataset.cw, t.dataset.ck2); });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  switch (b.dataset.act) {
    case 'finSess': { const w = +b.dataset.w, k = b.dataset.k; const ae = document.activeElement; if (ae && ae.dataset && (ae.dataset.se || ae.dataset.cf)) ae.blur(); finishSession(w, k); break; }
    case 'finShow': finSheet(+b.dataset.w, b.dataset.k, false); break;
    case 'finClose': closeSheet(); location.hash = '#training'; break;
    case 'finReopen': { const w = +b.dataset.w, k = b.dataset.k; const s = sess(w, k); if (s.end) delete s.end.fin; save(); closeSheet(); if (isCardio(k)) render(); else softPatch('endcard', endCard(w, k)); break; }
  } });
