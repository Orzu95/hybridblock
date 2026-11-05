/* Hybridblock – Abnehmtempo: Stufen in % Körpergewicht, Anzeige in kg und kcal, Grenzen aus der Regel-Tabelle (FAT-120 bis FAT-131) */
'use strict';
const PACE_LV = ['Langsam', 'Moderat', 'Zügig', 'Schnell'];
const PACE_KCAL = 1100; /* kcal pro Tag für 1 kg pro Woche (7.700 / 7), wie im Check-in */
/* Stufen je Gruppe nach BMI und Alter; cap = kg-Deckel je Stufe, wp/wk = Hinweis ab % bzw. kg pro Woche */
const PACE_GRP = {
  lean: { t: 'BMI unter 25', p: [0.25, 0.5, 0.7, 1.0], wp: 0.7, rule: 'loss_lean', w: 'Über 0,7 % pro Woche verlieren schlanke Menschen anteilig mehr Muskeln und Kraft.' },
  over: { t: 'BMI 25 bis 29,9', p: [0.35, 0.6, 0.8, 1.0], wp: 0.8, rule: 'loss_rate', w: 'Über 0,8 % pro Woche steigen Hunger und Muskelverlust.' },
  ob1: { t: 'BMI 30 bis 34,9', p: [0.4, 0.7, 0.9, 1.2], cap: [null, null, null, 1.2], wp: 1.0, wk: 1.0, rule: 'loss_rate', w: 'Über 1 kg pro Woche sinkt der Ruheumsatz stärker und das Durchhalten wird schwerer.' },
  ob2: { t: 'BMI ab 35', p: [0.35, 0.5, 0.75, 1.0], cap: [null, null, 1.2, 1.5], wk: 1.0, rule: 'loss_cap_kg', w: 'Über 1 kg pro Woche sinkt der Ruheumsatz stärker und das Durchhalten wird schwerer.' },
  old: { t: 'ab 65, BMI ab 30', p: [0.2, 0.35, 0.5, 0.6], cap: [0.75, 0.75, 0.75, 0.75], wp: 0.5, rule: 'loss_older', w: 'Ab 65 schützen 0,2–0,5 % pro Woche zusammen mit Krafttraining Muskeln und Knochen am besten.' },
  oldlean: { t: 'ab 65, BMI unter 30', p: [0.2, 0.35, 0.5, 0.6], cap: [0.75, 0.75, 0.75, 0.75], wp: 0, rule: 'loss_older', w: 'Ab 65 und mit BMI unter 30 raten die Leitlinien von einem Kaloriendefizit ab. Sinnvoller: Gewicht halten und Muskeln aufbauen.' },
  std: { t: 'ohne Größe: Standardstufen', p: [0.35, 0.6, 0.8, 1.0], wp: 0.8, rule: 'loss_rate', w: 'Über 0,8 % pro Woche steigen Hunger und Muskelverlust.' } };
function paceWho(o) { o = o || paceSelf(); const w = num(o.weight), h = num(o.height), age = num(o.age); const bmi = w && h ? w / Math.pow(h / 100, 2) : null;
  const g = age >= 65 ? (bmi != null && bmi < 30 ? 'oldlean' : 'old') : bmi == null ? 'std' : bmi < 25 ? 'lean' : bmi < 30 ? 'over' : bmi < 35 ? 'ob1' : 'ob2';
  return { g, bmi, w, tdee: num(o.tdee) }; }
function paceSelf() { const st = S.settings; const wd = Object.keys(S.days).filter(d => num(S.days[d].weight) != null).sort(); const w = wd.length ? num(S.days[wd[wd.length - 1]].weight) : num(st.startWeight);
  return { weight: w, height: st.height, age: st.age, sex: st.sex, tdee: st.tdee0 }; }
function paceOpts(o) { const P = paceWho(o), G = PACE_GRP[P.g], hard = RV('loss_cap_kg'); if (!P.w) return [];
  return G.p.map((p, i) => { const raw = P.w * p / 100; let kg = raw; const c = G.cap && G.cap[i]; if (c) kg = Math.min(kg, c); kg = Math.min(kg, hard); const capped = kg < raw - 1e-9; kg = Math.round(kg * 20) / 20; return { i, pct: capped ? Math.round(kg / P.w * 10000) / 100 : p, kg, kcal: Math.round(kg * PACE_KCAL / 50) * 50 }; }); }
/* Bewertung eines Tempos (kg pro Woche): ok / warn / hard */
function paceCheck(kg, o) { const P = paceWho(o), G = PACE_GRP[P.g]; kg = num(kg) || 0; if (kg <= 0 || !P.w) return { lvl: 'ok' }; const pct = kg / P.w * 100;
  if (kg > RV('loss_cap_kg') + 0.01) return { lvl: 'hard', rule: 'loss_cap_kg', txt: $t('Mehr als 1,5 kg pro Woche erhöht das Risiko für Gallensteine deutlich. So ein Tempo gehört in ärztliche Begleitung.') };
  if (P.tdee && P.tdee - kg * PACE_KCAL < RV('kcal_floor')) return { lvl: 'hard', rule: 'kcal_floor', txt: $t('Damit läge dein Kalorienziel unter 1.200 kcal am Tag. Darunter nur mit fachlicher Begleitung.') };
  if (P.g === 'oldlean' || (G.wp != null && pct > G.wp + 0.01) || (G.wk && kg > G.wk + 0.01) || (G.cap && G.cap[0] && kg > G.cap[0] + 0.01)) return { lvl: 'warn', rule: G.rule, txt: $t(G.w) };
  return { lvl: 'ok' }; }
const PACE_RULES = ['loss_rate', 'loss_lean', 'loss_cap_kg', 'kcal_floor', 'loss_early', 'loss_older'];
/* Auswahl-Karte: where = 'onb' (Onboarding) oder 'st' (Einstellungen) */
function paceCard(where) { const st = S.settings, o = paceSelf(); const P = paceWho(o), opts = paceOpts(o); if (!opts.length) return '';
  if (num(st.targetWeight) != null && P.w && num(st.targetWeight) >= P.w - 0.3) return '';
  const cur = num(st.goalRate) || 0, chk = paceCheck(cur, o);
  const btn = x => { const on = Math.abs(cur - x.kg) < 0.026, c = paceCheck(x.kg, o);
    return '<button class="pace-opt' + (on ? ' on' : '') + '" data-act="paceSet" data-kg="' + x.kg + '" data-w="' + where + '" type="button"><b>' + esc($t(PACE_LV[x.i])) + (c.lvl !== 'ok' ? ' ⚠︎' : '') + '</b><span>' + fmt(x.pct, 2) + $t(' % · ') + fmt(x.kg, 2) + $t(' kg pro Woche') + '</span><span class="muted">' + $tf('ca. {k} kcal pro Tag unter Bedarf', { k: fmt(x.kcal, 0) }) + '</span></button>'; };
  return '<div class="pace"><div class="lbl">' + $t('Abnehmtempo') + '</div><p class="small muted" style="margin:2px 0 8px">' + $tf('Stufen für dich ({g}). Die App rechnet in % deines Gewichts, weil das mit dem Körper mitwächst.', { g: $t(PACE_GRP[P.g].t) }) + '</p>' +
    '<div class="pace-opts">' + opts.map(btn).join('') + '</div>' +
    (st.paceChanged && S.checkins.length && series().length >= 7 ? note('ember', $t('Neues Tempo gewählt. Beim nächsten Check-in rechnet die App damit, ohne die übliche 300-kcal-Bremse.'), '<button class="btn brand sm" data-act="paceNow" type="button">' + $t('Jetzt neu berechnen') + '</button>') : '') +
    (chk.lvl !== 'ok' ? note(chk.lvl === 'hard' ? 'amber' : 'sky', esc(chk.txt)) : '') +
    '<div style="margin-top:6px">' + ruleBtn(PACE_RULES, $t('Warum diese Stufen?')) + '</div></div>'; }
/* Hinweis im Verlauf: in den ersten 3 Wochen nicht bewerten, danach Trend gegen die Grenzen prüfen */
function paceNote(ser, rate) { if (!ser.length || !(num(S.settings.goalRate) > 0)) return ''; const days = daysBetween(ser[0].d, today());
  if (days < RV('loss_early')) return note('sky', $t('Die ersten 3 Wochen sind vor allem Wasser und Glykogen. Das Tempo bewertet die App erst ab Woche 3.'), ruleBtn(['loss_early'], $t('Warum?')));
  if (rate == null || rate >= 0) return ''; const c = paceCheck(-rate); if (c.lvl === 'ok') return '';
  return note('amber', $tf('Dein Trend: −{v} kg pro Woche.', { v: fmt(-rate, 2) }) + ' ' + esc(c.txt), ruleBtn([c.rule], $t('Warum?'))); }
document.addEventListener('click', e => { if (e.target.closest('[data-act="paceNow"]')) { const c = doCheckin(); toast($t('Neues Ziel: ') + fmt(c.kcal, 0) + $t(' kcal')); render(); return; }
  const b = e.target.closest('[data-act="paceSet"]'); if (!b) return; const st = S.settings, kg = num(b.dataset.kg);
  if (Math.abs((num(st.goalRate) || 0) - kg) > 0.001 && S.checkins.length) st.paceChanged = true; if (S.plan && S.plan.maint) delete S.plan.maint; st.goalRate = String(kg); const tdee = num(st.tdee0); if (tdee && (b.dataset.w === 'onb' || !S.checkins.length)) st.startKcal = String(Math.max(num(st.floor) || 0, Math.round((tdee - kg * PACE_KCAL) / 50) * 50));
  save(); render(); });
