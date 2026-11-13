/* Hybridblock – Essenspausen-Timer (Intervallfasten, optional). Evidenz: FAST-101 ff.
   Kein eigenes Diätprogramm: nur eine zeitliche Struktur für das bestehende Kalorien- und Eiweißziel.
   Sicherheit: Screening mit harten und weichen Ausschlüssen, Sperre langer Pausen bei niedriger Energieverfügbarkeit,
   Eiweiß mindestens 1,6 g/kg, Hinweis ohne Krafttraining, neutrale Darstellung ohne Straf-Farben und ohne Gesundheitsversprechen. */
'use strict';
const FA_PROTO = { '12:12': 12, '14:10': 14, '16:8': 16, '18:6': 18 };
const faSick = () => !!(S.meta.pause && S.meta.pause.from && S.meta.pause.why !== 'away');
const FA = () => S.settings.fast || (S.settings.fast = {});
function faKg() {
  return typeof curWeight === 'function' ? curWeight() : num(S.settings.startWeight);
}
function faHardLock() {
  const a = num(S.settings.age),
    h = num(S.settings.height),
    w = faKg();
  if (a && a < 18) return true;
  if (h && w && w / Math.pow(h / 100, 2) < 18.5) return true;
  return false;
}
function faEaLow() {
  try {
    const ffm = ffmKg();
    const ea = eaEaten();
    return ffm && ea != null && ea < eaMin();
  } catch (e) {
    return false;
  }
}
function faProto() {
  const f = FA();
  let p = f.proto || '14:10';
  if (faEaLow() && FA_PROTO[p] > 14) p = '12:12';
  return p;
}
const faHm = s => {
  const [h, m] = String(s || '08:00')
    .split(':')
    .map(Number);
  return (h || 0) * 60 + (m || 0);
};
const hmTxt = min => {
  min = ((min % 1440) + 1440) % 1440;
  return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
};
function faState(now) {
  now = now || new Date();
  const f = FA();
  const fastH = FA_PROTO[faProto()];
  const winMin = (24 - fastH) * 60;
  const st = faHm(f.start || '08:00');
  const end = st + winMin;
  const cur = now.getHours() * 60 + now.getMinutes();
  const inWin = end <= 1440 ? cur >= st && cur < end : cur >= st || cur < end - 1440;
  if (inWin) {
    const left = (((end - cur) % 1440) + 1440) % 1440;
    return { inWin, left, end: hmTxt(end), start: hmTxt(st), fastH };
  }
  const since = (((cur - end) % 1440) + 1440) % 1440;
  const until = (((st - cur) % 1440) + 1440) % 1440;
  return { inWin, since, until, end: hmTxt(end), start: hmTxt(st), fastH, hour: Math.floor(since / 60) + 1 };
}
const fmtHM = m => Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0') + ' h';
/* Eiweiß mindestens 1,6 g/kg, solange der Timer aktiv ist */
hbFilter('currentTargets', 'fasting', function (__v) {
  const t = __v;
  if (!FA().on || !t) return t;
  const kg = faKg();
  if (!kg || t.p >= 1.6 * kg) return t;
  const p = Math.round(1.6 * kg);
  return Object.assign({}, t, { p, c: Math.max(0, Math.round((t.kcal - 4 * p - 9 * t.f) / 4)) });
});
function faGymRecent() {
  return (
    Object.keys(S.sessions || {}).some(k => {
      const s = S.sessions[k];
      const m = k.match(RE_SESS);
      return m && isGym(m[2]) && s && s.date && s.date >= addDays(today(), -7) && !s.skipped;
    }) || (S.activities || []).some(a => a.type === 'kraft' && a.date >= addDays(today(), -7))
  );
}
const FA_FLAGS = () => [
  $t('Starker Schwindel beim Aufstehen, Ohnmacht, Zittern oder kalter Schweiß'),
  $t('Erbrechen, anhaltende Übelkeit, starker Durchfall oder dunkler Urin'),
  $t('Ausbleibende oder unregelmäßige Periode'),
  $t('Kontrollverlust beim Essen nach der Pause, Schuldgefühle oder der Drang, die Pause immer weiter zu verlängern'),
  $t('Kraft oder Trainingsleistung lassen über Wochen nach')
];
function faCard() {
  const f = FA();
  if (faHardLock()) return '';
  if (f.on && faSick())
    return (
      '<div class="card" id="facard"><b>' +
      $t('Essenspausen-Timer pausiert') +
      '</b><p class="small muted" style="margin:4px 0 0">' +
      $t('Während Krankheit oder Verletzung ohne feste Essenspausen essen. Der Timer läuft nach deinem Wiedereinstieg weiter.') +
      '</p></div>'
    );
  if (!f.on)
    return (
      '<div class="card" id="facard"><div class="row" style="align-items:center;gap:10px"><div class="grow"><b>' +
      $t('Essenspausen-Timer') +
      '</b><div class="small muted">' +
      $t('Optional: strukturiert deine Mahlzeiten in einem festen Zeitfenster. Dein Kalorien- und Eiweißziel bleibt gleich.') +
      '</div></div><button class="btn sm" data-act="faOpen" type="button">' +
      $t('Ansehen') +
      '</button></div></div>'
    );
  const s = faState();
  const capped = faProto() !== (f.proto || '14:10');
  const head = s.inWin
    ? '<h2 style="margin:0">' +
      $t('Essensfenster offen') +
      '</h2><p class="small muted" style="margin:4px 0 0">' +
      $tf('bis {e} Uhr, noch {l}', { e: s.end, l: fmtHM(s.left) }) +
      '</p>'
    : '<h2 style="margin:0">' +
      $tf('Stunde {h} deiner geplanten Essenspause', { h: Math.min(s.hour, s.fastH) }) +
      '</h2><p class="small muted" style="margin:4px 0 0">' +
      $tf('Nächstes Essensfenster um {s} Uhr. Denk daran, regelmäßig Wasser zu trinken.', { s: s.start }) +
      '</p>';
  const notes =
    (capped ? note('ember', $t('Deine Energieverfügbarkeit ist gerade niedrig. Lange Essenspausen sind deshalb ausgesetzt, es gilt 12:12.')) : '') +
    (!faGymRecent()
      ? note(
          'sky',
          $t('Diese Woche ist noch kein Krafttraining eingetragen. Mit 2–3 Krafteinheiten pro Woche und genug Eiweiß bleiben die Muskeln beim Fasten erhalten.')
        )
      : '');
  return (
    '<div class="card" id="facard" style="box-shadow:inset 4px 0 0 var(--sky)"><div class="row" style="align-items:flex-start"><div class="grow">' +
    head +
    '</div><span class="tag">' +
    esc(faProto()) +
    '</span></div>' +
    notes +
    '<details style="margin-top:10px"><summary class="small" style="font-weight:700">' +
    $t('Erlaubt in der Pause und Warnzeichen') +
    '</summary><p class="small" style="margin:8px 0">' +
    $t(
      'Wasser, schwarzer Kaffee und ungesüßter Tee sind in der Pause in Ordnung. Wenn du trainierst, iss möglichst im Essensfenster oder direkt danach eine eiweißreiche Mahlzeit.'
    ) +
    '</p><p class="small" style="margin:0 0 4px"><b>' +
    $t('Beende das Fasten und lass dich bei Bedarf ärztlich beraten bei:') +
    '</b></p><ul class="small" style="margin:0;padding-left:18px">' +
    FA_FLAGS()
      .map(x => '<li>' + esc(x) + '</li>')
      .join('') +
    '</ul></details>' +
    '<div class="row" style="margin-top:10px;gap:8px"><button class="btn sm" style="background:var(--fog)" data-act="faOpen" type="button">' +
    $t('Anpassen') +
    '</button><div class="grow"></div><button class="btn sm" style="background:var(--fog)" data-act="faOff" type="button">' +
    $t('Beenden') +
    '</button></div></div>'
  );
}
const FA_Q = () => [
  ['preg', $t('Bist du schwanger, stillst du oder planst du gerade eine Schwangerschaft?'), 'hard'],
  ['ed', $t('Hattest du jemals oder hast du eine Essstörung, oder lösen feste Essenszeiten bei dir Kontrollverlust oder Schuldgefühle aus?'), 'hard'],
  ['dmIns', $t('Nimmst du Insulin, Sulfonylharnstoffe oder Glinide gegen Diabetes?'), 'hard'],
  [
    'reds',
    $t('Ist deine Periode in den letzten Monaten ohne Verhütung ausgeblieben, oder wurde bei dir ein Energiemangel im Sport (REDs) festgestellt?'),
    'hard'
  ],
  ['dm', $t('Hast du einen anderen Diabetes oder nimmst du andere blutzuckersenkende Mittel (z. B. SGLT2-Hemmer)?'), 'soft'],
  ['med', $t('Nimmst du Medikamente zu festen Essenszeiten oder Blutdrucksenker, oder hast du Gicht, Herz-, Nieren- oder Lebererkrankungen?'), 'soft']
];
function faSheet() {
  const f = FA();
  ui.faA = ui.faA || {};
  if (!f.screened) {
    const A = ui.faA;
    const qs = FA_Q();
    const hard = qs.some(q => q[2] === 'hard' && A[q[0]] === 'y');
    const soft = qs.some(q => q[2] === 'soft' && A[q[0]] === 'y');
    const all = qs.every(q => A[q[0]]);
    openSheet(
      sheetHead($t('Essenspausen-Timer')) +
        '<p class="small muted" style="margin-top:6px">' +
        $t(
          'Eine optionale Timer-Funktion, um deine Mahlzeiten und Essenspausen im Trainingsalltag zu strukturieren. Vorher ein paar Fragen zu deiner Sicherheit:'
        ) +
        '</p>' +
        qs
          .map(
            q =>
              '<div style="margin:12px 0"><p class="small" style="margin:0 0 6px">' +
              esc(q[1]) +
              '</p><div class="wkchs"><button class="wkch' +
              (A[q[0]] === 'n' ? ' on' : '') +
              '" data-act="faAns" data-q="' +
              q[0] +
              '" data-v="n" type="button">' +
              $t('Nein') +
              '</button><button class="wkch' +
              (A[q[0]] === 'y' ? ' on' : '') +
              '" data-act="faAns" data-q="' +
              q[0] +
              '" data-v="y" type="button">' +
              $t('Ja') +
              '</button></div></div>'
          )
          .join('') +
        (hard
          ? note(
              'ember',
              $t(
                'Dann ist der Essenspausen-Timer für dich nicht geeignet. Dein Kalorien- und Eiweißziel funktioniert ohne festes Zeitfenster genauso. Bei Fragen hilft dir deine Ärztin oder dein Arzt.'
              )
            )
          : all
            ? (soft
                ? '<label class="small" style="display:flex;gap:8px;margin:10px 0"><input type="checkbox" id="fa-doc"> ' +
                  $t('Ich habe das ärztlich abgeklärt.') +
                  '</label>'
                : '') +
              '<div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="faScreenOk" data-soft="' +
              (soft ? 1 : 0) +
              '" type="button">' +
              $t('Weiter') +
              '</button></div>'
            : '')
    );
    return;
  }
  const p = f.proto || '12:12';
  const opts = [
    ['12:12', $t('Einstieg, gut für die ersten 2 Wochen')],
    ['14:10', $t('Standard')],
    ['16:8', $t('Fortgeschritten')],
    ['18:6', $t('Kurzes Fenster, nur mit Vorsicht')]
  ];
  openSheet(
    sheetHead($t('Essenspausen-Timer')) +
      '<p class="small muted" style="margin-top:6px">' +
      $t('Bei gleichen Kalorien nimmst du mit Fasten nicht mehr ab als ohne. Es hilft vielen aber, im Alltag weniger nebenbei zu essen.') +
      '</p>' +
      '<div class="menu" style="margin-top:8px">' +
      opts
        .map(
          o =>
            '<button class="act-pick' +
            (o[0] === p ? ' on' : '') +
            '" data-act="faProto" data-v="' +
            o[0] +
            '" type="button"><span class="grow"><b>' +
            o[0] +
            '</b><br><span class="small muted" style="font-weight:500">' +
            esc(o[1]) +
            '</span></span>' +
            (o[0] === p ? '✓' : '') +
            '</button>'
        )
        .join('') +
      '</div>' +
      (FA_PROTO[p] >= 18
        ? note('ember', $t('Essensfenster unter 8 Stunden können das Cholesterin erhöhen und machen es schwer, genug Eiweiß und Nährstoffe zu essen.'))
        : '') +
      '<div class="fields on-white" style="margin-top:10px"><div class="field"><label for="fa-start">' +
      $t('Essensfenster beginnt um') +
      '</label><input id="fa-start" type="time" value="' +
      esc(f.start || '08:00') +
      '"></div></div>' +
      '<p class="src">' +
      $tf('Dein Essensfenster: {a} bis {b} Uhr. Ein früheres Fenster (Ende bis etwa 17–19 Uhr) ist für viele günstiger als spätes Essen.', {
        a: f.start || '08:00',
        b: hmTxt(faHm(f.start || '08:00') + (24 - FA_PROTO[p]) * 60)
      }) +
      '</p>' +
      '<div class="row" style="margin-top:12px"><div class="grow"></div><button class="btn brand" data-act="faSave" type="button">' +
      (f.on ? $t('Speichern') : $t('Timer starten')) +
      '</button></div>'
  );
}
hbFilter('viewEssen', 'fasting', function (__v) {
  const h = __v;
  if (typeof VIEW !== 'undefined' && VIEW) return h;
  const c = faCard();
  if (!c) return h;
  const m = h.indexOf('<div class="nr-search">');
  return m < 0 ? h + c : h.slice(0, m) + c + h.slice(m);
});
hbFilter('heuteExtras', 'fasting', function (__v) {
  const h = __v;
  if (VIEW || !FA().on || faHardLock() || faSick()) return h;
  const s = faState();
  return (
    note(
      'sky',
      s.inWin ? $tf('Essensfenster offen bis {e} Uhr.', { e: s.end }) : $tf('Essenspause, nächstes Essensfenster um {s} Uhr.', { s: s.start }),
      '<a class="btn sm" href="#essen">' + $t('Essen') + '</a>'
    ) + h
  );
});
document.addEventListener('change', e => {
  if (e.target.id === 'fa-start') {
    FA().start = e.target.value || '08:00';
    save();
    faSheet();
  }
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  if (a === 'faOpen') {
    ui.faA = {};
    faSheet();
  } else if (a === 'faAns') {
    ui.faA = ui.faA || {};
    ui.faA[b.dataset.q] = b.dataset.v;
    faSheet();
  } else if (a === 'faScreenOk') {
    if (b.dataset.soft === '1' && !(document.getElementById('fa-doc') || {}).checked) {
      toast($t('Bitte bestätige die ärztliche Abklärung.'));
      return;
    }
    FA().screened = today();
    FA().proto = FA().proto || '12:12';
    save();
    faSheet();
  } else if (a === 'faProto') {
    FA().proto = b.dataset.v;
    save();
    faSheet();
  } else if (a === 'faSave') {
    const f = FA();
    const el = document.getElementById('fa-start');
    if (el && el.value) f.start = el.value;
    if (!f.on) {
      f.on = true;
      f.since = today();
    }
    save();
    closeSheet();
    render();
    toast($t('Essenspausen-Timer aktiv'));
  } else if (a === 'faOff') {
    FA().on = false;
    save();
    render();
    toast($t('Timer beendet'));
  }
});
/* Erinnerungen (Android): täglich zu Beginn und 30 Minuten vor Ende des Essensfensters. IDs 140–141, neutral formuliert. */
async function faNotify() {
  const N = typeof NOTIF !== 'undefined' && NOTIF.p;
  if (!N) return;
  try {
    await N.cancel({ notifications: [{ id: 140 }, { id: 141 }] });
  } catch (e) {}
  const f = FA();
  if (!f.on || f.remind === false || faHardLock() || faSick()) return;
  try {
    const st = await N.checkPermissions();
    if (st.display !== 'granted') return;
    const s = faState();
    const a = faHm(s.start),
      b = faHm(s.end) - 30;
    const at = m => ({ hour: Math.floor((((m % 1440) + 1440) % 1440) / 60), minute: ((m % 60) + 60) % 60 });
    await N.schedule({
      notifications: [
        {
          id: 140,
          title: $t('Essensfenster offen'),
          body: $tf('Bis {e} Uhr. Plane eine eiweißreiche Mahlzeit ein.', { e: s.end }),
          schedule: { on: at(a), allowWhileIdle: true }
        },
        {
          id: 141,
          title: $t('Essensfenster endet bald'),
          body: $tf('Noch etwa 30 Minuten bis {e} Uhr.', { e: s.end }),
          schedule: { on: at(b), allowWhileIdle: true }
        }
      ]
    });
  } catch (e) {}
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (b && /^fa(Save|Off|Proto)$/.test(b.dataset.act)) setTimeout(faNotify, 300);
});
setTimeout(faNotify, 5000);
