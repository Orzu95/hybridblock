/* ======================= BESTÄTIGUNGEN: jede abgeschlossene Aktion bekommt sichtbares Feedback ======================= */
/* doneOverlay: großes Häkchen mittig für Abschlüsse (Einheit gespeichert, Plan übernommen, Check-in).
   Für alle anderen Aktionen: Hat die Aktion selbst keine Meldung gezeigt, kommt eine kurze Bestätigung. */
(function () { const st = document.createElement('style'); st.textContent =
  '#doneov{position:fixed;inset:0;z-index:300;display:grid;place-items:center;pointer-events:none;background:rgba(0,0,0,.18);animation:dovf .18s ease-out}' +
  '#doneov .in{background:var(--paper);border-radius:24px;padding:24px 28px;min-width:200px;max-width:80vw;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.22);animation:dovp .28s cubic-bezier(.2,1.4,.4,1)}' +
  '#doneov .ck{width:64px;height:64px;border-radius:50%;background:var(--verdant);display:grid;place-items:center;margin:0 auto 12px}#doneov .ck svg{width:34px;height:34px;stroke:#fff;fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:30;stroke-dashoffset:30;animation:dovc .35s .12s forwards}' +
  '#doneov b{display:block;font-size:19px}#doneov span{display:block;color:var(--muted);font-size:14px;margin-top:4px}' +
  '@keyframes dovf{from{opacity:0}}@keyframes dovp{from{transform:scale(.7);opacity:0}}@keyframes dovc{to{stroke-dashoffset:0}}';
  document.head.appendChild(st); })();
function doneOverlay(title, sub, ms) { let el = document.getElementById('doneov'); if (el) el.remove(); el = document.createElement('div'); el.id = 'doneov'; el.setAttribute('role', 'status');
  el.innerHTML = '<div class="in"><div class="ck"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><b>' + esc(title) + '</b>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + '</div>';
  document.body.appendChild(el); try { if (navigator.vibrate) navigator.vibrate(20); } catch (e) {} setTimeout(() => { if (el.parentNode) el.remove(); }, ms || 1300); }
/* Zähler: hat eine Aktion schon selbst eine Meldung gezeigt? */
let TOAST_N = 0; const _toastCf = toast; toast = function () { TOAST_N++; return _toastCf.apply(this, arguments); };
const CONFIRM = () => ({
  saveEntry: [$t('Eingetragen')], confirmAdd: [$t('Eingetragen')], quickAdd: [$t('Eingetragen')], useTpl: [$t('Vorlage eingetragen')], copyYesterday: [$t('Von gestern übernommen')],
  delEntry: [$t('Gelöscht')], mealClear: [$t('Mahlzeit geleert')], dayClear: [$t('Tag geleert')], mealMoveTo: [$t('Verschoben')], mealHide: [$t('Ausgeblendet')], mealShowAll: [$t('Alle Mahlzeiten wieder sichtbar')],
  saveFood: [$t('Lebensmittel gespeichert')], editFood: null, saveTpl: [$t('Vorlage gespeichert')], delTpl: [$t('Vorlage gelöscht')], recSave: [$t('Rezept gespeichert')], recDel: [$t('Rezept gelöscht')],
  delActYes: [$t('Aktivität gelöscht')], goalsSave: [$t('Ziele gespeichert')], peSave: [$t('Plan gespeichert'), 1], woDel: [$t('Training gelöscht')], woRemove: [$t('Training gelöscht')],
  photoDel: [$t('Foto gelöscht')], checkin: [$t('Check-in abgeschlossen'), 1], revYes: [$t('Übernommen')], revNo: [$t('Abgelehnt')], revHide: [$t('Ausgeblendet')],
  ssSave: [$t('Superset gespeichert')], ssDelExtra: [$t('Übung entfernt')], ssUnlink: [$t('Superset aufgelöst')], inviteDel: [$t('Einladung gelöscht')], removeClient: [$t('Athlet entfernt')], libUseYes: [$t('Plan übernommen'), 1],
  skip: [$t('Einheit übersprungen')], unskip: [$t('Einheit wieder offen')], dobackswap: [$t('Originalübung zurück')], noExReset: [$t('Zurückgesetzt')],
  freeDelEx: [$t('Übung entfernt')], woFromAct: [$t('Als Training gespeichert')], woNew: null, export: [$t('Sicherung erstellt')], hrmForget: [$t('Gurt entfernt')], peSessDelYes: [$t('Einheit gelöscht')], trDiscard: [$t('Verworfen')], useZepp: [$t('Übernommen')] });
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act; const c = CONFIRM()[a]; if (!c) return; const n0 = TOAST_N;
  setTimeout(() => { if (TOAST_N !== n0 || document.getElementById('doneov')) return; if (c[1]) doneOverlay(c[0]); else toast(c[0]); }, 350); });

/* Freie Aktivität: klarer Abschluss */
const _viewFreeCf = viewFree; viewFree = function (id) { const h = _viewFreeCf(id); const a = S.activities.find(x => x.id === id); if (!a) return h;
  const btn = '<button class="btn brand block" data-act="actDone" data-aid="' + a.id + '" type="button">' + (a.done ? $t('Änderungen speichern') : $t('Fertig – speichern')) + '</button>';
  const i = h.lastIndexOf(ui.confirmDel === a.id ? '<div class="row"><span class="grow small">' : '<button class="btn block danger"'); return i < 0 ? h + btn : h.slice(0, i) + btn + h.slice(i); };
document.addEventListener('click', e => { const b = e.target.closest('[data-act=actDone]'); if (!b) return; const a = S.activities.find(x => x.id === b.dataset.aid); if (!a) return;
  if (!num(a.dur)) { toast($t('Bitte noch die Dauer eintragen.')); const el = document.getElementById('a-dur'); if (el) el.focus(); return; }
  const first = !a.done; a.done = true; save(); doneOverlay(first ? $t('Erledigt') : $t('Gespeichert'), (a.title || (ACT_MAP[a.type] || {}).name || '') + ' · ' + fmt(num(a.dur), 0) + ' min');
  setTimeout(() => { ui.editAct = null; const h = typeof resultHref === 'function' ? resultHref({ type: 'act', id: a.id }) : '#training'; if (location.hash === h) { render(); window.scrollTo(0, 0); } else location.hash = h; }, 900); });
/* Eingaben, die sofort gespeichert werden: kurze Bestätigung */
document.addEventListener('change', e => { const t = e.target; if (!t || !t.dataset) return; const n0 = TOAST_N;
  let msg = null; if (t.dataset.f === 'weight' && t.value) msg = $t('Gewicht gespeichert'); else if (t.dataset.st && t.dataset.st !== 'mode' && t.dataset.st !== 'lang') msg = $t('Gespeichert'); else if (t.dataset.f === 'complete') msg = t.checked ? $t('Tag als vollständig markiert') : $t('Tag als unvollständig markiert');
  if (msg) setTimeout(() => { if (TOAST_N === n0) toast(msg); }, 250); });
