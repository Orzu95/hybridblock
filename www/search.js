/* ======================= SUCHE: alles in der App finden (Seiten, Einstellungen, Begriffe, Wissen, Übungen, Pläne, Aktionen) ======================= */
let SR = { items: [], q: '' };
const SR_ACTIONS = () => [
  { g: $t('Aktion'), t: $t('Einführung ansehen'), k: 'intro tour rundgang hilfe help обзор знакомство', go: () => { closeSheet(); tourOpen(); } },
  { g: $t('Aktion'), t: $t('Aktivität aufzeichnen (GPS)'), k: 'aufzeichnen lauf laufen gps record run track запись бег', go: () => { closeSheet(); location.hash = '#track'; } },
  { g: $t('Aktion'), t: $t('Aktivität nachtragen'), k: 'nachtragen aktivität eintragen log activity внести активность', go: () => { closeSheet(); actSheet(); } },
  { g: $t('Aktion'), t: $t('Essen eintragen'), k: 'essen eintragen lebensmittel food log еда продукт', go: () => { closeSheet(); ui.day = today(); addSheet(); } },
  { g: $t('Aktion'), t: $t('Gewicht eintragen'), k: 'gewicht waage weight вес', go: () => { closeSheet(); location.hash = '#heute'; setTimeout(() => { const i = document.getElementById('wToday'); if (i) i.focus(); }, 200); } },
  { g: $t('Aktion'), t: $t('Ansicht wechseln (Basis, Plus, Labor)'), k: 'ansicht stufe spowi labor basis plus view level вид', go: () => lvSheet() },
  { g: $t('Aktion'), t: $t('Lernkarten'), k: 'lernkarten lernen flashcards карточки', go: () => { LC.id = null; lcSheet(); } },
  { g: $t('Aktion'), t: $t('Sprache ändern'), k: 'sprache language english русский deutsch язык', go: () => srGoSetting($t('Sprache')) } ];
const SR_PAGES = () => [['#heute', $t('Heute'), 'start home сегодня'], ['#training', $t('Training'), 'plan woche тренировки'], ['#essen', $t('Essen'), 'ernährung kalorien makros food еда'], ['#verlauf', $t('Verlauf'), 'fortschritt progress gewicht история'],
  ['#mehr', $t('Einstellungen'), 'settings настройки'], ['#wissen', $t('Wissen'), 'studien evidenz knowledge знания'], ['#library', $t('Trainingspläne'), 'bibliothek pläne library планы'], ['#datenschutz', $t('Datenschutz'), 'privacy конфиденциальность']].map(p => ({ g: $t('Seite'), t: p[1], k: p[2], go: () => { closeSheet(); location.hash = p[0]; } }));
function srGoSetting(h2) { closeSheet(); const go = () => { const el = [...document.querySelectorAll('#view .card h2')].find(x => x.textContent.trim() === h2); if (el) { const c = el.closest('.card'); c.scrollIntoView({ behavior: 'smooth', block: 'start' }); c.style.transition = 'box-shadow .3s'; c.style.boxShadow = '0 0 0 3px var(--ember)'; setTimeout(() => { c.style.boxShadow = ''; }, 1600); } };
  if (route.name === 'mehr') go(); else { location.hash = '#mehr'; setTimeout(go, 350); } }
function srIndex() { const out = [...SR_ACTIONS(), ...SR_PAGES()];
  try { const h = viewMehr(); const re = /<h2[^>]*>([\s\S]*?)<\/h2>/g; let m; const seen = new Set(); while ((m = re.exec(h))) { const t = m[1].replace(/<[^>]+>/g, '').trim(); if (!t || seen.has(t)) continue; seen.add(t); out.push({ g: $t('Einstellung'), t, k: '', go: () => srGoSetting(t) }); } } catch (e) {}
  if (typeof GLOSS !== 'undefined') GLOSS.forEach(x => out.push({ g: $t('Begriff'), t: glT(x.t), k: (x.p[LANG] || '') + ' ' + x.p.de + ' ' + glT(x.d), go: () => glSheet(x.id) }));
  Object.keys(LIB).forEach(id => { const e = LIB[id]; if (!e || !e.name) return; out.push({ g: $t('Übung'), t: e.name, k: id + ' ' + (e.de || ''), go: () => exInfoSheet(id) }); });
  if (typeof LIBRARY !== 'undefined') Object.keys(LIBRARY).forEach(id => { const p = LIBRARY[id]; out.push({ g: $t('Plan'), t: $t(p.name), k: $t(p.desc || ''), go: () => { closeSheet(); location.hash = '#library/' + id; } }); });
  if (EVID) EVID.items.forEach(x => out.push({ g: $t('Wissen'), t: x.u, k: x.a + ' ' + x.k.join(' ') + ' ' + x.id, sub: x.a, go: () => evSheet([x.id]) }));
  return out; }
const srNorm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
function srFind(q) { const words = srNorm(q).split(/\s+/).filter(Boolean); if (!words.length) return []; const all = srIndex(); const res = [];
  all.forEach(it => { const T = srNorm(it.t), K = srNorm(it.k); if (!words.every(w => T.includes(w) || K.includes(w))) return; let sc = 0; words.forEach(w => { if (T.startsWith(w)) sc += 6; else if (T.includes(w)) sc += 3; else sc += 1; }); if ([$t('Aktion'), $t('Seite'), $t('Einstellung')].includes(it.g)) sc += 2; res.push([sc, it]); });
  return res.sort((a, b) => b[0] - a[0]).slice(0, 40).map(x => x[1]); }
function srList() { const q = SR.q; if (!q.trim()) return '<p class="small muted" style="margin-top:12px">' + $t('Zum Beispiel: Kreatin, Mein Studio, RPE, Kniebeuge, Sprache, Deload') + '</p>';
  SR.items = srFind(q); if (!SR.items.length) return '<p class="small muted" style="margin-top:12px">' + $t('Nichts gefunden.') + '</p>';
  return SR.items.map((it, i) => '<button class="evrow" data-act="srGo" data-i="' + i + '" type="button"><span class="pill na" style="flex:0 0 auto">' + esc(it.g) + '</span><span class="grow"><span>' + esc(it.t) + '</span>' + (it.sub ? '<span class="small muted" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(it.sub) + '</span>' : '') + '</span></button>').join(''); }
function searchOpen() { if (!EVID && typeof loadEvid === 'function') loadEvid().then(() => { const l = document.getElementById('sr-list'); if (l && SR.q) l.innerHTML = srList(); }).catch(() => {});
  openPop(sheetHead($t('Suchen')) + '<input id="sr-q" type="search" value="' + esc(SR.q) + '" placeholder="' + $t('Was suchst du?') + '" style="width:100%;margin-top:8px" autocomplete="off"><div id="sr-list" style="margin-top:6px">' + srList() + '</div>');
  setTimeout(() => { const i = document.getElementById('sr-q'); if (i) { i.focus(); i.select(); } }, 60); }
document.addEventListener('input', e => { if (e.target.id !== 'sr-q') return; SR.q = e.target.value; const l = document.getElementById('sr-list'); if (l) l.innerHTML = srList(); });
document.addEventListener('keydown', e => { if (e.target.id === 'sr-q' && e.key === 'Enter' && SR.items[0]) { e.preventDefault(); SR.items[0].go(); } });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; if (b.dataset.act === 'searchOpen') searchOpen(); else if (b.dataset.act === 'srGo') { const it = SR.items[+b.dataset.i]; if (it) it.go(); } });
