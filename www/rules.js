/* ======================= REGEL-TABELLE: jede Zahl, mit der die App rechnet, mit ihren Wissensbank-Einträgen =======================
   Einzige Quelle für Schwellen und Konstanten. Pro Regel: v = Wert, ev = Eintrags-IDs, g = Evidenzgrad (höchster Grad, den ein
   verknüpfter Eintrag direkt stützt; own = App-Setzung, dann immer D), n = Name, s = was die App damit tut.
   tests/rules_check.py prüft beim Bauen: alle IDs existieren, g passt zu den Einträgen. Zwischen den Markern steht reines JSON. */
const RULES = /*RULES*/{
  "vol_prio": { "n": "Wochenvolumen Schwerpunkt-Muskeln", "v": [12, 20], "u": "harte Sätze pro Woche", "ev": ["HYP-102", "HYP-101", "EIN-109"], "g": "A", "s": "Volumen-Balken, Muskelkarte, Wochenplanung und Plan-Ende-Auswertung" },
  "vol_other": { "n": "Wochenvolumen übrige Muskeln", "v": [6, 14], "u": "harte Sätze pro Woche", "ev": ["HYP-101", "REC-112", "EIN-109"], "g": "A", "s": "Untergrenze, ab der die App fehlendes Volumen meldet" },
  "e1rm_maxreps": { "n": "e1RM nur aus Sätzen bis", "v": 10, "u": "Wiederholungen", "ev": ["ALG-102", "ALG-103", "ALG-101"], "g": "B", "s": "Höhere Sätze zählen nicht für e1RM, Verlauf und PRs" },
  "autoreg": { "n": "Gewicht hochrechnen nur aus Sätzen nah am Versagen", "v": { "rpe": 7, "reps": 12 }, "d": "RPE ab 7, höchstens 12 Wdh.", "u": "", "ev": ["ALG-104", "ALG-105", "ALG-106"], "g": "A", "s": "Sonst nur ein kleiner Schritt statt Hochrechnung" },
  "load_spike": { "n": "Hinweis bei Belastungssprung ab", "v": 1.3, "u": "× Vorwochen-Schnitt", "ev": ["ALG-122", "LOD-109", "LOD-110", "LOD-111"], "g": "C", "s": "Nur Hinweis im Wochen-Check-in, keine Warnung" },
  "acwr_band": { "n": "ACWR-Bereich „im Rahmen“", "v": [0.8, 1.3], "u": "Verhältnis 7 zu 28 Tage", "ev": ["ALG-122", "LOD-109"], "g": "C", "s": "Nur Information in der Kennzahlen-Ansicht" },
  "monotony": { "n": "Monotonie gilt als hoch ab", "v": 2, "u": "Mittelwert ÷ Streuung", "ev": ["LOD-108"], "g": "C", "s": "Hinweis, Trainingstage abwechslungsreicher zu gestalten" },
  "readiness": { "n": "Gewichtung der Bereitschaft", "v": { "sleep": 0.3, "rhr": 0.25, "hrv": 0.2, "feel": 0.25 }, "u": "Schlaf, Ruhepuls, HRV, Gefühl", "ev": ["ALG-122", "ALG-121", "ALG-116", "LOD-112"], "own": true, "g": "D", "s": "Tagesform-Wert auf „Heute“; die Gewichtung selbst ist eine Setzung der App" },
  "hrv_ln": { "n": "HRV als", "v": "LnRMSSD, 7-Tage-Mittel gegen 30 Tage", "u": "", "ev": ["ALG-116", "ALG-120"], "g": "A", "s": "HRV-Anteil der Bereitschaft" },
  "tdee_adapt": { "n": "Kalorienbedarf aus echten Daten ab", "v": { "days": 14, "minDays": 9 }, "d": "14 Tagen", "u": "mind. 9 davon vollständig geloggt", "ev": ["ALG-111", "ALG-112"], "g": "A", "s": "Davor gilt die Startformel (Mifflin-St Jeor)" },
  "watch_kcal": { "n": "Kalorien der Uhr", "v": "fließen nicht ins Tagesziel", "u": "", "ev": ["ALG-113", "ALG-114"], "g": "A", "s": "Das Ziel kommt nur aus Essen und Gewichtstrend" },
  "fat_min": { "n": "Fett mindestens", "v": 20, "u": "% der Kalorien", "ev": ["ERN-109"], "g": "C", "s": "Untergrenze für das Fettziel" },
  "protein": { "n": "Protein", "v": 2, "u": "g pro kg Zielgewicht", "ev": ["BLK-108", "NRG-115"], "g": "A", "s": "Startwert im Onboarding" },
  "loss_rate": { "n": "Abnehmtempo", "v": [0.5, 1], "u": "% Körpergewicht pro Woche", "ev": ["FAT-101", "FAT-102"], "g": "A", "s": "Bereich für das Abnehmziel" },
  "hfmax": { "n": "Maximalpuls ohne Messung", "v": "208 − 0,7 × Alter (Tanaka)", "u": "", "ev": ["CAR-110"], "g": "A", "s": "Pulszonen, bis du einen gemessenen Wert einträgst" },
  "stall": { "n": "Stillstand", "v": "2 Wochen ohne neues e1RM", "u": "", "ev": ["PER-116", "HYP-110"], "g": "B", "s": "Vorschlag Übungstausch im Wochen-Check-in" },
  "deload": { "n": "Deload", "v": "5–7 Tage weniger Volumen und Intensität", "u": "", "ev": ["PER-113", "PER-112"], "g": "B", "s": "Vorschlag im Wochen-Check-in bei Ermüdung" },
  "adherence": { "n": "Trainingstage", "v": "Volumen auf 2+ Tage verteilt wirkt ähnlich", "u": "", "ev": ["HYP-106", "KRA-106", "EIN-116"], "g": "A", "s": "Vorschlag, Tage zu reduzieren statt Einheiten auszulassen" },
  "dietbreak": { "n": "Diätpause", "v": "1 Woche auf Erhaltung", "u": "", "ev": ["FAT-111", "FAT-110", "BLK-115"], "g": "A", "s": "Vorschlag im Check-in nach längerer Diät" },
  "rpe_drift": { "n": "RPE regelmäßig über Ziel", "v": "Last senken", "u": "", "ev": ["PER-106", "PER-107", "KRA-108"], "g": "A", "s": "Vorschlag im Wochen-Check-in" }
}/*END*/;
const RV = id => RULES[id].v;
/* Wochen-Check-in: Vorschlagstyp → Regel */
const REV_RULE = { vol: 'vol_prio', stall: 'stall', deload: 'deload', spike: 'load_spike', adhere: 'adherence', dietbreak: 'dietbreak', rpe: 'rpe_drift' };

/* ---------- „So rechnet die App“: alle Regeln mit Grad und Studienlage ---------- */
function ruleVal(r) { if (r.d) return $t(r.d); const v = r.v; if (Array.isArray(v)) return v.map(x => fmt(x, x % 1 ? 1 : 0)).join('–'); if (typeof v === 'number') return fmt(v, v % 1 ? 1 : 0);
  if (v && typeof v === 'object') return Object.values(v).map(x => typeof x === 'number' && x < 1 ? Math.round(x * 100) + ' %' : String(x)).join(' / '); return $t(v); }
function rulesSheet() { openSheet(sheetHead($t('So rechnet die App')) + '<p class="small muted">' + $t('Jede Zahl, mit der die App rechnet, ist mit Einträgen der Wissensbank verknüpft. Der Grad zeigt, wie gut sie belegt ist; D heißt Expertenmeinung oder Setzung der App.') + '</p>' +
  Object.keys(RULES).map(id => { const r = RULES[id]; return '<div class="card" style="margin-top:10px;padding:12px 14px"><div class="row" style="align-items:flex-start;gap:10px"><div class="grow"><b>' + esc($t(r.n)) + '</b><div>' + esc(ruleVal(r)) + (r.u ? ' ' + esc($t(r.u)) : '') + '</div><div class="small muted">' + esc($t(r.s)) + '</div></div><span class="tag">' + $t('Grad ') + r.g + '</span></div>' + (typeof evBtn === 'function' ? '<div style="margin-top:6px">' + evBtn(r.ev) + '</div>' : '') + '</div>'; }).join('')); }
document.addEventListener('click', e => { const b = e.target.closest('[data-act="rulesOpen"]'); if (b) { e.preventDefault(); rulesSheet(); } });
