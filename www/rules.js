/* ======================= REGEL-TABELLE: jede Zahl, mit der die App rechnet, mit ihren Wissensbank-Einträgen =======================
   Einzige Quelle für Schwellen und Konstanten. Pro Regel: v = Wert, ev = Eintrags-IDs, g = Evidenzgrad (höchster Grad, den ein
   verknüpfter Eintrag direkt stützt; own = App-Setzung, dann immer D), n = Name, s = was die App damit tut.
   tests/rules_check.py prüft beim Bauen: alle IDs existieren, g passt zu den Einträgen. Zwischen den Markern steht reines JSON. */
const RULES = /*RULES*/{
  "vol_prio": {"n": "Wochenvolumen Schwerpunkt-Muskeln", "v": [12, 20], "u": "harte Sätze pro Woche", "ev": ["HYP-102", "HYP-101", "EIN-109"], "g": "A", "s": "Volumen-Balken, Muskelkarte, Wochenplanung und Plan-Ende-Auswertung", "chk": [{"id": "HYP-102", "lo": 12, "hi": 20}]},
  "vol_other": {"n": "Wochenvolumen übrige Muskeln", "v": [6, 14], "u": "harte Sätze pro Woche", "ev": ["HYP-101", "REC-112", "EIN-109"], "g": "A", "s": "Untergrenze, ab der die App fehlendes Volumen meldet", "chk": [{"id": "HYP-101", "lo": 5}]},
  "e1rm_maxreps": {"n": "e1RM nur aus Sätzen bis", "v": 10, "u": "Wiederholungen", "ev": ["ALG-102", "ALG-103", "ALG-101"], "g": "B", "s": "Höhere Sätze zählen nicht für e1RM, Verlauf und PRs", "chk": [{"id": "ALG-102", "hi": 10}]},
  "autoreg": {"n": "Gewicht hochrechnen nur aus Sätzen nah am Versagen", "v": {"rpe": 7, "reps": 12}, "d": "RPE ab 7, höchstens 12 Wdh.", "u": "", "ev": ["ALG-104", "ALG-105", "ALG-106"], "g": "A", "s": "Sonst nur ein kleiner Schritt statt Hochrechnung", "chk": [{"id": "ALG-104", "key": "reps", "hi": 12}]},
  "load_spike": {"n": "Hinweis bei Belastungssprung ab", "v": 1.3, "u": "× Vorwochen-Schnitt", "ev": ["ALG-122", "LOD-109", "LOD-110", "LOD-111"], "g": "C", "s": "Nur Hinweis im Wochen-Check-in, keine Warnung", "chk": [{"id": "LOD-109", "hi": 1.5}]},
  "acwr_band": {"n": "ACWR-Bereich „im Rahmen“", "v": [0.8, 1.3], "u": "Verhältnis 7 zu 28 Tage", "ev": ["ALG-122", "LOD-109"], "g": "C", "s": "Nur Information in der Kennzahlen-Ansicht", "chk": [{"id": "LOD-109", "lo": 0.8, "hi": 1.3}]},
  "acwr_min_days": {"n": "ACWR erst anzeigen ab", "v": 28, "u": "Tagen mit Daten", "ev": ["LOD-111"], "g": "C", "s": "Vorher ist der Quotient verzerrt", "chk": [{"id": "LOD-111", "lo": 28}]},
  "monotony": {"n": "Monotonie gilt als hoch ab", "v": 2, "u": "Mittelwert ÷ Streuung", "ev": ["LOD-108"], "g": "C", "s": "Hinweis, Trainingstage abwechslungsreicher zu gestalten"},
  "readiness": {"n": "Gewichtung der Bereitschaft", "v": {"sleep": 0.3, "rhr": 0.25, "hrv": 0.2, "feel": 0.25}, "u": "Schlaf, Ruhepuls, HRV, Gefühl", "ev": ["ALG-122", "ALG-121", "ALG-116", "LOD-112"], "own": true, "g": "D", "s": "Tagesform-Wert auf „Heute“; die Gewichtung selbst ist eine Setzung der App"},
  "hrv_ln": {"n": "HRV als", "v": "LnRMSSD, 7-Tage-Mittel gegen 30 Tage", "u": "", "ev": ["ALG-116", "ALG-120"], "g": "A", "s": "HRV-Anteil der Bereitschaft"},
  "tdee_adapt": {"n": "Kalorienbedarf aus echten Daten ab", "v": {"days": 14, "minDays": 9}, "d": "14 Tagen", "u": "mind. 9 davon vollständig geloggt", "ev": ["ALG-111", "ALG-112"], "g": "A", "s": "Davor gilt die Startformel (Mifflin-St Jeor)"},
  "watch_kcal": {"n": "Kalorien der Uhr", "v": "fließen nicht ins Tagesziel", "u": "", "ev": ["ALG-113", "ALG-114"], "g": "A", "s": "Das Ziel kommt nur aus Essen und Gewichtstrend"},
  "fat_min": {"n": "Fett mindestens", "v": 20, "u": "% der Kalorien", "ev": ["ERN-109"], "g": "C", "s": "Untergrenze für das Fettziel", "chk": [{"id": "ERN-109", "lo": 20}]},
  "protein": {"n": "Protein", "v": 2, "u": "g pro kg Zielgewicht", "ev": ["BLK-108", "NRG-115"], "g": "A", "s": "Startwert im Onboarding", "chk": [{"id": "BLK-108", "lo": 1.62, "hi": 2.2}]},
  "loss_rate": {"n": "Abnehmtempo", "v": [0.5, 1], "u": "% Körpergewicht pro Woche", "ev": ["FAT-101", "FAT-102"], "g": "A", "s": "Bereich für das Abnehmziel", "chk": [{"id": "FAT-102", "hi": 1.0}]},
  "hfmax": {"n": "Maximalpuls ohne Messung", "v": {"a": 208, "b": 0.7}, "u": "", "ev": ["CAR-110"], "g": "A", "s": "Pulszonen, bis du einen gemessenen Wert einträgst", "chk": [{"id": "CAR-110", "key": "a", "lo": 208, "hi": 208}, {"id": "CAR-110", "key": "b", "lo": 0.7, "hi": 0.7}], "d": "208 − 0,7 × Alter (Tanaka)"},
  "stall": {"n": "Stillstand", "v": "2 Wochen ohne neues e1RM", "u": "", "ev": ["PER-116", "HYP-110"], "g": "B", "s": "Vorschlag Übungstausch im Wochen-Check-in"},
  "deload": {"n": "Deload", "v": "5–7 Tage weniger Volumen und Intensität", "u": "", "ev": ["PER-113", "PER-112"], "g": "B", "s": "Vorschlag im Wochen-Check-in bei Ermüdung"},
  "adherence": {"n": "Trainingstage", "v": "Volumen auf 2+ Tage verteilt wirkt ähnlich", "u": "", "ev": ["HYP-106", "KRA-106", "EIN-116"], "g": "A", "s": "Vorschlag, Tage zu reduzieren statt Einheiten auszulassen"},
  "dietbreak": {"n": "Diätpause", "v": "1 Woche auf Erhaltung", "u": "", "ev": ["FAT-111", "FAT-110", "BLK-115"], "g": "A", "s": "Vorschlag im Check-in nach längerer Diät"},
  "rpe_drift": {"n": "RPE regelmäßig über Ziel", "v": "Last senken", "u": "", "ev": ["PER-106", "PER-107", "KRA-108"], "g": "A", "s": "Vorschlag im Wochen-Check-in"},
  "older_freq": {"n": "Krafttraining ab 65", "v": [2, 3], "u": "Einheiten pro Woche", "grp": "Ältere", "ev": ["EIN-106"], "g": "A", "s": "Plan-Empfehlung bevorzugt 2–3 Krafteinheiten", "chk": [{"id": "EIN-106", "lo": 2, "hi": 3}]},
  "older_maintain": {"n": "Muskeln erhalten ab 65", "v": "mehr Volumen als bei Jüngeren nötig", "u": "", "grp": "Ältere", "ev": ["EIN-101"], "g": "B", "s": "Erklärt unter „Warum diese Zahl?“ beim Wochenvolumen"},
  "older_protein_meal": {"n": "Protein pro Mahlzeit ab 65", "v": "rund zwei Drittel mehr als bei Jüngeren", "u": "", "grp": "Ältere", "ev": ["EIN-113", "EIN-112"], "g": "C", "s": "Erklärt unter „Warum diese Zahl?“ bei Bedarf und Kalorien"},
  "beginner_vol": {"n": "Volumen für Einsteiger", "v": "gleiche Regel wie für alle: ab 10 Sätzen pro Muskel und Woche mehr Muskelaufbau", "u": "", "grp": "Einsteiger", "ev": ["EIN-109"], "g": "A", "s": "Keine eigene Sonderregel, weil die Studienlage keine nahelegt"},
  "female_focus": {"n": "Planauswahl für Frauen", "v": "Ganzkörper mit Schwerpunkt Beine und Po, weniger Arm-Volumen", "u": "", "grp": "Frauen", "ev": ["FRA-111", "FRA-114"], "own": true, "g": "D", "s": "Plan-Empfehlung; eine Setzung der App, keine eigene Studienlage"}
}/*END*/;
const RV = id => RULES[id].v;
/* Wochen-Check-in: Vorschlagstyp → Regel */
const REV_RULE = { vol: 'vol_prio', stall: 'stall', deload: 'deload', spike: 'load_spike', adhere: 'adherence', dietbreak: 'dietbreak', rpe: 'rpe_drift' };

/* ---------- 8.2: Evidenzgrad steuert das Verhalten ---------- */
const RULE_GRADE_TXT = { A: 'gut belegt', B: 'belegt', C: 'erste Hinweise', D: 'Expertenmeinung' };
const ruleGrade = id => RULES[id] ? RULES[id].g : null;
const evStrict = () => !!(S && S.settings && S.settings.evStrict);
/* A/B: normaler Vorschlag; C: Vorschlag mit Hinweis „erste Hinweise“; D: nur Information. Mit „Nur gut belegte Vorschläge“ werden C/D ausgeblendet. */
const gradeMode = g => g === 'D' ? 'info' : g === 'C' ? 'weak' : 'normal';
function gradeTag(g) { return g ? '<span class="tag" title="' + esc($t(RULE_GRADE_TXT[g])) + '">' + $t('Grad ') + g + ' · ' + esc($t(RULE_GRADE_TXT[g])) + '</span>' : ''; }
function ruleBtn(ids, label) { ids = [].concat(ids).filter(id => RULES[id] && ruleFor(id)); if (!ids.length) return ''; return '<button class="evbtn" data-act="ruleOpen" data-ids="' + ids.join(',') + '" type="button">ⓘ ' + (label || $t('Warum diese Zahl?')) + '</button>'; }
function ruleRow(id) { const r = RULES[id]; return '<div class="card" style="margin-top:10px;padding:12px 14px"><div class="row" style="align-items:flex-start;gap:10px"><div class="grow"><b>' + esc($t(r.n)) + '</b><div>' + esc(ruleVal(r)) + (r.u ? ' ' + esc($t(r.u)) : '') + '</div><div class="small muted">' + esc($t(r.s)) + '</div></div>' + (r.grp ? '<span class="tag">' + esc($t(GRP_TXT[r.grp] || r.grp)) + '</span> ' : '') + '<span class="tag">' + $t('Grad ') + r.g + '</span></div>' + (typeof evBtn === 'function' ? '<div style="margin-top:6px">' + evBtn(r.ev) + '</div>' : '') + '</div>'; }

/* ---------- 8.3: Zielgruppen ---------- */
const GRP_TXT = { 'Frauen': 'Frauen', 'Ältere': 'ab 65', 'Einsteiger': 'Einsteiger' };
function myGroups() { const st = (typeof S !== 'undefined' && S && S.settings) || {}, q = st.q || {}; const g = []; if (st.sex === 'w') g.push('Frauen'); if (num(st.age) >= 65) g.push('Ältere'); if (q.level === 'beginner') g.push('Einsteiger'); return g; }
const ruleFor = id => !RULES[id].grp || myGroups().includes(RULES[id].grp);

/* ---------- „So rechnet die App“: alle Regeln mit Grad und Studienlage ---------- */
function ruleVal(r) { if (r.d) return $t(r.d); const v = r.v; if (Array.isArray(v)) return v.map(x => fmt(x, x % 1 ? 1 : 0)).join('–'); if (typeof v === 'number') return fmt(v, v % 1 ? 1 : 0);
  if (v && typeof v === 'object') return Object.values(v).map(x => typeof x === 'number' && x < 1 ? Math.round(x * 100) + ' %' : String(x)).join(' / '); return $t(v); }
function rulesSheet() { openSheet(sheetHead($t('So rechnet die App')) + '<p class="small muted">' + $t('Jede Zahl, mit der die App rechnet, ist mit Einträgen der Wissensbank verknüpft. Der Grad zeigt, wie gut sie belegt ist; D heißt Expertenmeinung oder Setzung der App.') + '</p>' +
  '<div class="row" style="margin-top:12px"><button class="trtog' + (evStrict() ? ' on' : '') + '" data-act="evStrict" type="button">' + (evStrict() ? '✓ ' : '') + $t('Nur gut belegte Vorschläge (A/B)') + '</button></div><p class="small muted" style="margin-top:6px">' + $t('Eingeschaltet blendet der Wochen-Check-in Vorschläge mit Grad C oder D aus.') + '</p>' +
  (myGroups().length ? '<h3 style="margin-top:14px">' + $t('Für dich angepasst') + '</h3>' + (Object.keys(RULES).filter(id => RULES[id].grp && ruleFor(id)).map(ruleRow).join('') || '<p class="small muted">' + $t('Für deine Angaben gibt es keine Sonderregeln.') + '</p>') : '') +
  '<h3 style="margin-top:14px">' + $t('Für alle') + '</h3>' + Object.keys(RULES).filter(id => !RULES[id].grp).map(ruleRow).join('') +
  '<h3 style="margin-top:14px">' + $t('Für andere Gruppen') + '</h3>' + Object.keys(RULES).filter(id => RULES[id].grp && !ruleFor(id)).map(ruleRow).join('')); }
document.addEventListener('click', e => { const b = e.target.closest('[data-act="rulesOpen"],[data-act="ruleOpen"],[data-act="evStrict"]'); if (!b) return; e.preventDefault(); e.stopPropagation();
  if (b.dataset.act === 'rulesOpen') rulesSheet();
  else if (b.dataset.act === 'ruleOpen') openSheet(sheetHead($t('Warum diese Zahl?')) + b.dataset.ids.split(',').map(ruleRow).join('') + '<div style="margin-top:12px"><button class="btn sm" data-act="rulesOpen" type="button">' + $t('Alle Regeln der App') + '</button></div>');
  else { S.settings.evStrict = !evStrict(); save(); rulesSheet(); if (typeof render === 'function') render(); } }, true);
