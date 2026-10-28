/* ======================= ESSEN: Mahlzeit leeren, Tag leeren, Mahlzeiten ausblenden ======================= */
let FOOD_UNDO = null; /* { d, entries, txt } – letzte Löschung, einmal rückgängig machbar */
function foodUndoNote() { if (!FOOD_UNDO || FOOD_UNDO.d !== ui.day) return ''; return note('sky', esc(FOOD_UNDO.txt), '<button class="btn sm brand" data-act="foodUndo" type="button">' + $t('Rückgängig') + '</button>'); }
function foodExtras(d) { const hid = S.settings.hiddenMeals || []; const o = S.days[d] || { entries: [] };
  const hidH = hid.length ? '<p class="small muted" style="margin:0 4px">' + $t('Ausgeblendet: ') + hid.map(m => esc($t(m))).join(', ') + ' · <a href="#" data-act="mealShowAll">' + $t('wieder einblenden') + '</a></p>' : '';
  return hidH + ((o.entries || []).length ? '<button class="btn block" data-act="dayClear" type="button" style="background:var(--fog)">' + $t('Alle Einträge dieses Tages löschen') + '</button>' : ''); }
function mealMenu(m) { const o = dayObj(ui.day); const n = (o.entries || []).filter(e => e.meal === m).length; const hid = (S.settings.hiddenMeals || []).includes(m);
  openSheet(sheetHead(esc($t(m))) + '<div class="menu" style="margin-top:12px">' +
    (n ? '<button class="act-pick" data-act="mealClear" data-meal="' + m + '" type="button"><span class="grow">' + $t('Alle Einträge löschen') + '<br><span class="small muted" style="font-weight:500">' + n + $t(' Lebensmittel in dieser Mahlzeit') + '</span></span></button>' : '') +
    (n ? '<button class="act-pick" data-act="mealMove" data-meal="' + m + '" type="button"><span class="grow">' + $t('In andere Mahlzeit verschieben') + '</span></button>' : '') +
    '<button class="act-pick" data-act="mealHide" data-meal="' + m + '" type="button"><span class="grow">' + (hid ? $t('Mahlzeit wieder anzeigen') : $t('Mahlzeit ausblenden')) + '<br><span class="small muted" style="font-weight:500">' + (hid ? '' : $t('Z. B. wenn du Frühstück meistens auslässt. Gilt für alle Tage, jederzeit umkehrbar.')) + '</span></span></button></div>'); }
function moveSheet(m) { openSheet(sheetHead($t('Verschieben nach')) + '<div class="menu" style="margin-top:12px">' + MEALS.filter(x => x !== m).map(x => '<button class="act-pick" data-act="mealMoveTo" data-from="' + m + '" data-to="' + x + '" type="button"><span class="grow">' + esc($t(x)) + '</span></button>').join('') + '</div>'); }
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const a = b.dataset.act;
  switch (a) {
    case 'mealMenu': mealMenu(b.dataset.meal); break;
    case 'mealClear': { const o = dayObj(ui.day); const m = b.dataset.meal; const rm = o.entries.filter(x => x.meal === m); o.entries = o.entries.filter(x => x.meal !== m);
      FOOD_UNDO = { d: ui.day, entries: rm, txt: rm.length + $t(' Einträge aus ') + $t(m) + $t(' gelöscht.') }; save(); closeSheet(); render(); break; }
    case 'dayClear': if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = $t('Wirklich alle löschen?'); b.classList.add('danger'); break; }
      { const o = dayObj(ui.day); const rm = o.entries.slice(); o.entries = []; FOOD_UNDO = { d: ui.day, entries: rm, txt: rm.length + $t(' Einträge gelöscht.') }; save(); render(); window.scrollTo(0, 0); } break;
    case 'foodUndo': if (FOOD_UNDO) { const o = dayObj(FOOD_UNDO.d); o.entries = o.entries.concat(FOOD_UNDO.entries); FOOD_UNDO = null; save(); render(); toast($t('Wiederhergestellt')); } break;
    case 'mealHide': { const m = b.dataset.meal; const h = S.settings.hiddenMeals = (S.settings.hiddenMeals || []).slice(); const i = h.indexOf(m); if (i >= 0) h.splice(i, 1); else h.push(m); save(); closeSheet(); render(); break; }
    case 'mealShowAll': e.preventDefault(); S.settings.hiddenMeals = []; save(); render(); break;
    case 'mealMove': moveSheet(b.dataset.meal); break;
    case 'mealMoveTo': { const o = dayObj(ui.day); o.entries.forEach(x => { if (x.meal === b.dataset.from) x.meal = b.dataset.to; }); save(); closeSheet(); render(); toast($t('Verschoben nach ') + $t(b.dataset.to)); break; }
  } });
window.addEventListener('hashchange', () => { if (FOOD_UNDO && route.name !== 'essen') FOOD_UNDO = null; });
