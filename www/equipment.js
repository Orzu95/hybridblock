/* ======================= MEIN STUDIO: Geräte-Erklärung mit Skizze ======================= */
/* Eigene, schematische Zeichnungen (keine fremden Bilder). Orange = der Teil, der sich bewegt oder an dem du anpackst. */
const EQS = (() => {
  const L = (x1, y1, x2, y2, c) => '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"' + (c ? ' class="a"' : '') + '/>';
  const R = (x, y, w, h, r, c) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r || 3) + '"' + (c ? ' class="' + c + '"' : '') + '/>';
  const C = (x, y, r, c) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"' + (c ? ' class="' + c + '"' : '') + '/>';
  const Pth = (d, c) => '<path d="' + d + '"' + (c ? ' class="' + c + '"' : '') + '/>';
  const G = L(6, 94, 154, 94);                                                 /* Boden */
  const plate = (x, y, r) => C(x, y, r, 'p') + C(x, y, 3, 'f');
  const bar = (x1, x2, y) => L(x1, y, x2, y, 1);
  const stack = (x, y, w, h) => R(x, y, w, h, 2) + [1, 2, 3, 4].map(i => L(x, y + i * h / 5, x + w, y + i * h / 5)).join('');
  const seat = (x, y, w) => R(x, y, w, 8, 4, 'pad');
  const pad = (x, y, w, h) => R(x, y, w, h, 4, 'pad');
  const roller = (x, y) => C(x, y, 6, 'pad a2');
  const frame = (x1, x2, top) => L(x1, 94, x1, top) + L(x2, 94, x2, top) + L(x1, top, x2, top);
  const db = (x, y, s) => L(x - 12 * s, y, x + 12 * s, y, 1) + R(x - 20 * s, y - 9 * s, 7 * s, 18 * s, 2, 'f2') + R(x + 13 * s, y - 9 * s, 7 * s, 18 * s, 2, 'f2');
  return {
    bb: G + bar(8, 152, 52) + plate(34, 52, 24) + plate(126, 52, 24) + L(52, 46, 52, 58) + L(108, 46, 108, 58),
    rack: G + L(40, 94, 40, 10) + L(120, 94, 120, 10) + L(40, 10, 120, 10) + L(30, 94, 30, 70) + L(130, 94, 130, 70) + L(30, 70, 40, 70) + L(120, 70, 130, 70) + L(40, 62, 52, 62) + L(108, 62, 120, 62) + bar(14, 146, 40) + plate(26, 40, 14) + plate(134, 40, 14) + L(44, 36, 44, 44) + L(116, 36, 116, 44),
    bench: G + pad(24, 52, 112, 10) + L(40, 62, 34, 94) + L(40, 62, 50, 94) + L(120, 62, 114, 94) + L(120, 62, 128, 94),
    db: G + db(50, 72, 1.4) + db(112, 44, 1.4),
    ez: G + Pth('M14 50 L40 50 L50 44 L60 56 L70 44 L80 50 L90 56 L100 44 L110 56 L120 50 L146 50', 'a') + plate(28, 50, 18) + plate(132, 50, 18),
    kb: G + Pth('M62 46 C58 22 102 22 98 46', 'a') + C(80, 66, 26, 'f2') + R(66, 84, 28, 8, 2),
    trapbar: G + Pth('M50 30 L110 30 L126 50 L110 70 L50 70 L34 50 Z') + L(62, 50, 98, 50) + L(70, 40, 70, 60, 1) + L(90, 40, 90, 60, 1) + L(4, 50, 34, 50) + L(126, 50, 156, 50) + R(10, 36, 8, 28, 2, 'f2') + R(142, 36, 8, 28, 2, 'f2'),
    cable: G + frame(30, 130, 10) + C(40, 18, 6) + C(120, 18, 6) + L(40, 24, 40, 60, 1) + R(32, 60, 16, 6, 3, 'a2') + L(120, 24, 120, 60, 1) + R(112, 60, 16, 6, 3, 'a2') + stack(70, 54, 20, 36) + L(80, 10, 80, 54),
    smith: G + L(34, 94, 34, 10) + L(126, 94, 126, 10) + L(34, 10, 126, 10) + L(46, 94, 46, 10) + L(114, 94, 114, 10) + bar(20, 140, 44) + C(46, 44, 5, 'pad a2') + C(114, 44, 5, 'pad a2') + plate(26, 44, 12) + plate(134, 44, 12),
    legpress: G + L(20, 94, 120, 20) + L(32, 94, 132, 20) + Pth('M96 40 L120 22 L128 32 L104 50 Z', 'a') + plate(118, 18, 10) + pad(14, 70, 40, 8) + Pth('M18 70 L6 46', '') + L(30, 78, 30, 94),
    hack: G + L(30, 94, 110, 14) + L(44, 94, 124, 14) + pad(60, 40, 12, 40) + R(66, 34, 26, 8, 4, 'pad a2') + Pth('M22 86 L56 86 L56 92', 'a') + L(108, 14, 140, 14),
    pendulum: G + L(120, 94, 120, 12) + L(120, 12, 60, 12) + C(120, 14, 5, 'f') + Pth('M120 14 L76 64', 'a') + R(66, 58, 24, 8, 4, 'pad a2') + pad(70, 66, 10, 22) + Pth('M40 88 L80 88', 'a') + plate(132, 50, 12),
    legext: G + pad(40, 56, 50, 8) + pad(40, 16, 10, 40) + L(65, 64, 65, 94) + Pth('M90 60 L118 86', 'a') + roller(118, 86) + stack(126, 30, 22, 60),
    legcurl_s: G + pad(40, 60, 50, 8) + pad(36, 20, 10, 40) + pad(70, 46, 40, 7) + L(65, 68, 65, 94) + Pth('M100 64 L110 90', 'a') + roller(110, 86) + stack(128, 30, 22, 60),
    legcurl_l: G + Pth('M16 66 L108 54 L112 62 L20 74 Z', 'pad') + L(40, 72, 40, 94) + L(96, 60, 96, 94) + Pth('M108 56 L136 40', 'a') + roller(136, 40) + L(108, 62, 108, 94),
    calfm: G + L(60, 94, 60, 18) + R(60, 26, 50, 8, 4, 'pad a2') + R(86, 84, 34, 8, 2, 'f2') + stack(20, 40, 22, 50) + L(31, 40, 31, 20) + L(31, 20, 60, 20),
    htm: G + pad(20, 50, 46, 9) + L(36, 59, 36, 94) + Pth('M66 54 L120 40', 'a') + R(84, 40, 22, 10, 4, 'pad a2') + R(120, 80, 26, 8, 2, 'f2') + L(120, 40, 120, 94),
    abdm: G + pad(50, 60, 60, 8) + pad(46, 22, 10, 38) + L(80, 68, 80, 94) + Pth('M62 70 L38 84', 'a') + Pth('M98 70 L122 84', 'a') + R(30, 76, 10, 16, 4, 'pad a2') + R(120, 76, 10, 16, 4, 'pad a2') + Pth('M30 60 l-10 6 l10 4', 'a') + Pth('M130 60 l10 6 l-10 4', 'a'),
    chestpress: G + pad(36, 62, 40, 8) + pad(30, 18, 10, 44) + L(56, 70, 56, 94) + L(76, 40, 110, 40, 1) + R(104, 34, 8, 14, 3, 'a2') + Pth('M70 40 l10 -5 m-10 5 l10 5', 'a') + stack(120, 30, 24, 60),
    inclm: G + pad(30, 66, 40, 8) + Pth('M34 66 L18 30 L28 26 L44 62 Z', 'pad') + L(50, 74, 50, 94) + Pth('M44 30 L96 10', 'a') + R(92, 6, 8, 12, 3, 'a2') + stack(120, 30, 24, 60),
    shoulderm: G + pad(40, 64, 40, 8) + pad(36, 18, 10, 46) + L(60, 72, 60, 94) + L(58, 26, 58, 6, 1) + R(52, 4, 12, 8, 3, 'a2') + Pth('M58 26 l-6 8 m6 -8 l6 8', 'a') + stack(110, 30, 24, 60),
    latm: G + pad(46, 64, 50, 8) + pad(66, 24, 10, 40) + L(71, 72, 71, 94) + Pth('M66 38 L30 52', 'a') + Pth('M76 38 L112 52', 'a') + R(24, 46, 14, 10, 4, 'pad a2') + R(104, 46, 14, 10, 4, 'pad a2') + Pth('M30 28 l-8 6 l10 2', 'a') + Pth('M112 28 l8 6 l-10 2', 'a'),
    latpd: G + frame(60, 140, 8) + C(100, 14, 5) + L(100, 19, 100, 38, 1) + Pth('M66 38 Q100 30 134 38', 'a') + pad(80, 72, 40, 8) + R(84, 56, 32, 7, 3, 'pad') + L(100, 80, 100, 94) + stack(20, 40, 22, 50) + L(31, 40, 31, 8) + L(31, 8, 60, 8),
    rowm: G + L(14, 92, 104, 60) + C(14, 92, 4, 'f') + plate(110, 58, 14) + L(96, 64, 96, 50, 1) + L(88, 50, 104, 50, 1) + Pth('M84 52 l12 -6 l12 6', 'a'),
    pecdeck: G + pad(50, 64, 60, 8) + pad(76, 14, 10, 50) + L(80, 72, 80, 94) + Pth('M76 24 Q46 26 40 46', 'a') + Pth('M86 24 Q116 26 120 46', 'a') + R(34, 40, 12, 22, 4, 'pad a2') + R(114, 40, 12, 22, 4, 'pad a2'),
    dipm: G + pad(50, 60, 50, 8) + pad(46, 16, 10, 44) + L(75, 68, 75, 94) + Pth('M98 58 L126 66', 'a') + R(120, 60, 12, 10, 3, 'a2') + stack(128, 24, 22, 64),
    assist: G + frame(30, 130, 8) + L(44, 20, 58, 20, 1) + L(102, 20, 116, 20, 1) + Pth('M60 64 L100 64', 'a') + R(60, 60, 40, 8, 4, 'pad a2') + L(80, 68, 80, 88) + Pth('M44 34 L116 34'),
    abm: G + pad(44, 64, 46, 8) + pad(40, 24, 10, 40) + L(66, 72, 66, 94) + Pth('M50 26 Q76 14 90 40', 'a') + R(84, 32, 14, 12, 4, 'pad a2') + stack(118, 30, 24, 60),
    ghd: G + Pth('M30 80 L96 28 L104 36 L38 88 Z', 'pad') + R(96, 20, 18, 10, 4, 'pad a2') + L(116, 30, 132, 82) + L(126, 86, 146, 86) + L(50, 78, 46, 94) + L(84, 52, 90, 94),
    preacher: G + Pth('M70 44 L118 26 L124 36 L76 56 Z', 'pad') + L(96, 46, 96, 94) + pad(32, 64, 38, 8) + L(50, 72, 50, 94) + L(120, 26, 132, 12, 1) + R(126, 6, 14, 8, 3, 'a2'),
    pullbar: G + L(20, 94, 20, 14) + L(140, 94, 140, 14) + bar(20, 140, 20) + L(20, 30, 140, 30),
    dipbar: G + L(40, 94, 40, 46) + L(120, 94, 120, 46) + L(30, 94, 50, 94) + L(110, 94, 130, 94) + bar(20, 60, 46) + bar(100, 140, 46),
    rings: G + L(10, 6, 150, 6) + L(50, 6, 50, 56) + L(110, 6, 110, 56) + C(50, 66, 9, 'a') + C(110, 66, 9, 'a'),
    band: G + Pth('M30 60 C30 24 130 24 130 60 C130 84 30 84 30 60 Z', 'a') + Pth('M38 60 C38 32 122 32 122 60 C122 76 38 76 38 60 Z', 'a3'),
    box: G + Pth('M30 94 L44 40 L116 40 L130 94 Z') + L(44, 40, 52, 30) + L(116, 40, 124, 30) + L(52, 30, 124, 30) + L(124, 30, 138, 84) + L(138, 84, 130, 94),
    medball: G + C(80, 60, 32, 'f2') + Pth('M50 48 Q80 64 110 48') + Pth('M50 72 Q80 56 110 72') + Pth('M80 28 L80 92'),
    abwheel: G + C(80, 66, 26) + C(80, 66, 6, 'f') + L(40, 66, 120, 66, 1) + R(30, 60, 14, 12, 4, 'a2') + R(116, 60, 14, 12, 4, 'a2'),
    sled: G + Pth('M10 86 L104 86 Q114 86 114 76') + L(30, 86, 30, 70) + L(90, 86, 90, 70) + L(24, 70, 96, 70) + L(60, 70, 60, 44) + plate(60, 52, 12) + Pth('M96 70 L132 30', 'a') + L(128, 26, 138, 36, 1),
    rower: G + L(20, 82, 140, 82) + C(130, 60, 18) + R(52, 72, 22, 8, 4, 'pad') + L(30, 82, 30, 94) + L(130, 78, 130, 94) + Pth('M112 58 L96 54', 'a') + R(88, 50, 10, 8, 3, 'a2') + R(100, 70, 14, 10, 2, 'f2'),
    bike: G + C(120, 64, 26) + [0, 45, 90, 135].map(a => L(120 - 22 * Math.cos(a * Math.PI / 180), 64 - 22 * Math.sin(a * Math.PI / 180), 120 + 22 * Math.cos(a * Math.PI / 180), 64 + 22 * Math.sin(a * Math.PI / 180))).join('') + L(40, 94, 60, 40) + R(46, 34, 26, 7, 3, 'pad') + L(60, 40, 120, 64) + Pth('M110 20 L96 64', 'a') + L(104, 18, 118, 18, 1) + L(30, 94, 70, 94),
    rope: G + Pth('M30 70 C30 6 130 6 130 70', 'a') + R(24, 68, 12, 22, 4, 'f2') + R(124, 68, 12, 22, 4, 'f2'),
    nordic: G + pad(20, 76, 110, 9) + L(30, 85, 30, 94) + L(120, 85, 120, 94) + L(132, 94, 132, 66) + roller(132, 66) + roller(132, 80)
  };
})();

/* Geräte-Illustrationen (Canva-KI, eigener Stil: grau, Akzent #FF5A1F nur am beweglichen Teil). Fehlende Geräte nutzen die alte Skizze. */
const EQ_IMG = 'abdm abm assist band bb bench bike box cable calfm chestpress db dipbar dipm ez ghd hack htm inclm kb latm latpd legcurl_l legcurl_s legext legpress nordic pendulum preacher pullbar rack rings rope shoulderm smith trapbar'.split(' ');
const EQ_INFO = {
  bb: ['Olympia-Stange, Hantelstange', 'Die lange Stange (meist 20 kg, 2,2 m) für Scheiben. Grundlage für Kniebeuge, Kreuzheben, Bankdrücken und Rudern.'],
  rack: ['Power Rack, Kniebeugenständer, Squat-Stand', 'Gestell mit Ablagen für die Langhantel und Sicherheitsstreben. Damit kannst du schwer kniebeugen und bankdrücken, ohne dass dir jemand die Stange reicht.'],
  bench: ['Flachbank, Schrägbank', 'Gepolsterte Bank, oft verstellbar (flach, schräg, aufrecht). Für Bankdrücken, Kurzhantelübungen, Rudern einarmig und Hip Thrusts.'],
  db: ['Hanteln, Dumbbells', 'Zwei einzelne Hanteln in festen Gewichtsstufen. Jede Seite arbeitet für sich, gut für Drücken, Rudern, Ausfallschritte und Armübungen.'],
  ez: ['Curlstange, EZ-Bar', 'Kurze, gewellte Stange. Durch die Knicke greifst du schräg, das schont Handgelenke und Ellbogen bei Bizepscurls und Trizepsdrücken.'],
  kb: ['Kugelhantel', 'Kugel mit Griff. Für Swings, Goblet Squats, Carries und Türkisches Aufstehen.'],
  trapbar: ['Hex Bar, Sechskantstange', 'Sechseckige Stange, in der du stehst. Die Griffe sind seitlich, deshalb ist Kreuzheben damit rückenfreundlicher. Oft mit hohen und tiefen Griffen.'],
  cable: ['Kabelturm, Seilzug, Cable Crossover', 'Gestell mit Gewichtsblock und Seilrollen, deren Höhe du verstellst. Für Seitheben, Rudern, Trizepsdrücken, Face Pulls und Crunches am Seil.'],
  smith: ['Smith Machine', 'Langhantel, die auf Schienen geführt läuft und sich in Haken einhängen lässt. Stabil und sicher, aber die Bewegung ist fest vorgegeben.'],
  legpress: ['Leg Press, 45°-Beinpresse', 'Du liegst schräg und drückst eine Plattform mit den Füßen weg. Trainiert Oberschenkel und Po ohne Last auf dem Rücken.'],
  hack: ['Hack Squat, Hackenschmidt-Maschine', 'Schräger Schlitten mit Rückenpolster und Schulterpolstern. Du machst Kniebeugen geführt, mit Fokus auf die vorderen Oberschenkel.'],
  pendulum: ['Pendulum Squat, Pendelkniebeuge', 'Schulterpolster an einem Pendelarm, der in einem Bogen läuft. Sehr tiefe Kniebeuge mit wenig Rückenbelastung.'],
  legext: ['Leg Extension, Beinstreckmaschine', 'Sitz mit Rolle vor den Schienbeinen. Du streckst die Knie gegen den Widerstand, isoliert die vorderen Oberschenkel.'],
  legcurl_s: ['Seated Leg Curl, sitzender Beinbeuger', 'Sitz, Polster über den Oberschenkeln, Rolle hinter den Waden. Du beugst die Knie nach unten. Sitzend dehnt die Beinbeuger stärker als liegend.'],
  legcurl_l: ['Lying Leg Curl, liegender Beinbeuger', 'Du liegst bäuchlings, die Rolle sitzt an den Fersen. Du ziehst die Fersen Richtung Po.'],
  calfm: ['Wadenmaschine stehend oder sitzend', 'Schulterpolster oder Kniepolster und eine Stufe für die Fußballen. Du drückst dich auf die Zehenspitzen.'],
  htm: ['Hip Thrust Machine, Glute Drive', 'Sitz oder Bank mit einem Polster über der Hüfte. Du drückst die Hüfte nach oben, trainiert vor allem den Po.'],
  abdm: ['Abductor, Hip Abduction', 'Sitz mit Polstern außen an den Knien. Du drückst die Beine auseinander, trainiert den seitlichen Po.'],
  chestpress: ['Chest Press, Brustpresse sitzend', 'Sitz mit Rückenlehne und Griffen auf Brusthöhe. Du drückst nach vorn, wie Bankdrücken im Sitzen.'],
  inclm: ['Incline Press Machine', 'Wie die Brustpresse, aber die Griffe laufen schräg nach oben. Fokus auf die obere Brust.'],
  shoulderm: ['Shoulder Press, Schulterdrückmaschine', 'Sitz mit Griffen auf Schulterhöhe. Du drückst nach oben über den Kopf.'],
  latm: ['Lateral Raise Machine', 'Sitz mit Polstern an den Oberarmen. Du hebst die Arme seitlich an, isoliert die seitliche Schulter.'],
  latpd: ['Lat Pulldown, Latziehturm', 'Sitz mit Knierolle und langer Stange an einem Seil von oben. Du ziehst die Stange zur Brust, Alternative zu Klimmzügen.'],
  rowm: ['Seated Row, T-Bar-Row, Landmine', 'Rudermaschine mit Brustpolster oder eine Stange, die an einem Ende im Boden gelagert ist (T-Bar). Für Rudern mit schwerem Gewicht.'],
  pecdeck: ['Pec Deck, Fly-Maschine, Reverse Fly', 'Sitz mit zwei Armen, die du vor der Brust zusammenführst. Umgedreht trainiert sie die hintere Schulter.'],
  dipm: ['Dip Machine, sitzender Dip', 'Sitz mit Griffen neben dem Körper. Du drückst nach unten, trainiert Trizeps und untere Brust.'],
  assist: ['Assisted Pull-up, Klimmzughilfe', 'Klimmzug- und Dip-Griffe mit einer Plattform für die Knie, die dich mit Gegengewicht nach oben drückt. Je mehr Gewicht, desto leichter.'],
  abm: ['Ab Crunch Machine', 'Sitz mit Polstern an der Brust oder Griffen über den Schultern. Du rollst den Oberkörper nach vorn ein.'],
  ghd: ['45°-Rückenstrecker, Back Extension, Roman Chair', 'Schräge Bank mit Polster an der Hüfte und Fußhalterung. Für Rückenstrecken, Po und Beinbeuger.'],
  preacher: ['Preacher Curl, Larry-Scott-Bank', 'Schräges Armpolster mit Sitz. Die Oberarme liegen auf, so arbeitet beim Curl nur der Bizeps.'],
  pullbar: ['Pull-up Bar, Reckstange, Türreck', 'Waagerechte Stange über Kopfhöhe für Klimmzüge und hängendes Beinheben.'],
  dipbar: ['Dip Station, Barren', 'Zwei parallele Holme auf Hüfthöhe. Für Dips, Beinheben im Stütz und Rudern unter dem Holm.'],
  rings: ['Turnringe, Schlingentrainer, Suspension Trainer', 'Zwei Gurte mit Ringen oder Griffen, die von oben hängen. Für Rudern, Liegestütze, Dips und Bauchübungen mit dem eigenen Gewicht.'],
  band: ['Resistance Band, Theraband, Loop Band', 'Elastisches Band, je nach Farbe stärker oder schwächer. Für Aufwärmen, Klimmzughilfe, Face Pulls und Seitheben zu Hause.'],
  box: ['Sprungkasten, Plyo Box', 'Stabile Kiste zum Draufspringen oder als Stufe. Für Box Jumps, Step-ups und Bulgarian Split Squats.'],
  medball: ['Medizinball, Slam Ball, Wall Ball', 'Schwerer Ball zum Werfen und Fangen. Für Würfe, Slams und Rumpfübungen mit Schwung.'],
  abwheel: ['Bauchroller, Ab Roller', 'Rad mit zwei Griffen. Du rollst kniend oder stehend nach vorn und zurück, trainiert den gesamten Rumpf.'],
  sled: ['Prowler, Gewichtsschlitten', 'Schlitten mit Scheiben, den du schiebst oder ziehst. Kraft und Kondition ohne exzentrische Belastung, schont die Gelenke.'],
  rower: ['Ruderergometer, Concept2', 'Ausdauergerät mit Rollsitz und Griff an einem Seil. Ganzkörper-Cardio für Zone 2 und Intervalle.'],
  bike: ['Assault Bike, Echo Bike, Ergometer, Spinning-Rad', 'Fahrrad-Ergometer. Das Air-Bike hat einen Lüfter vorn und bewegliche Arme: je härter du trittst, desto mehr Widerstand.'],
  rope: ['Jump Rope, Speed Rope', 'Seil mit zwei Griffen. Für Aufwärmen, Koordination und kurze Intervalle.'],
  nordic: ['Nordic-Curl-Bank, Fußhalterung', 'Polster für die Knie und eine Halterung, die die Fersen festhält. Du lässt dich langsam nach vorn sinken, trainiert die Beinbeuger und senkt das Verletzungsrisiko.']
};
(function () { const st = document.createElement('style'); st.textContent =
  '.eqw{display:inline-flex;align-items:center;gap:2px}.eqq{width:22px;height:22px;border-radius:50%;border:1px solid var(--rule);background:var(--paper);color:var(--graphite);font:inherit;font-size:12px;font-weight:800;cursor:pointer;padding:0;line-height:22px;flex:0 0 22px}.on-white .eqq,#sheetCard .eqq{background:var(--fog)}' +
  '.eqimg{display:block;width:100%;max-width:320px;margin:10px auto 6px;border-radius:16px;background:#fff}.eqsvg{display:block;width:100%;max-width:320px;margin:10px auto 6px;background:var(--fog);border-radius:16px;padding:10px}.eqsvg *{fill:none;stroke:var(--charcoal);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}' +
  '.eqsvg .a{stroke:var(--ember)}.eqsvg .a2{stroke:var(--ember);fill:var(--ember)}.eqsvg .a3{stroke:var(--ember);opacity:.45}.eqsvg .f{fill:var(--charcoal)}.eqsvg .f2{fill:var(--rule);stroke:var(--charcoal)}.eqsvg .p{fill:var(--rule)}.eqsvg .pad{fill:var(--paper)}.eqsvg .pad.a2{fill:var(--ember)}';
  document.head.appendChild(st); })();
function eqExamples(e) { return Object.keys(LIB).filter(id => exEq(id).includes(e) && !LIB[id].cardio).slice(0, 6).map(id => LIB[id].name); }
function eqInfoSheet(e) { const inf = EQ_INFO[e]; if (!inf) return; const miss = (S.settings.missingEq || []).includes(e); const ex = eqExamples(e);
  openSheet(sheetHead(esc(EQUIP[e] || e)) + '<div class="on-white">' +
    (EQ_IMG.includes(e) ? '<img class="eqimg" src="eq/' + e + '.webp" alt="' + esc(EQUIP[e] || e) + '" loading="lazy" decoding="async"><p class="small muted" style="text-align:center;margin:0">' + $t('Orange: hier packst du an oder das bewegt sich.') + '</p>' : EQS[e] ? '<svg class="eqsvg" viewBox="0 0 160 100" role="img" aria-label="' + esc(EQUIP[e] || e) + '">' + EQS[e] + '</svg><p class="small muted" style="text-align:center;margin:0">' + $t('Skizze. Orange: hier packst du an oder das bewegt sich.') + '</p>' : '') +
    '<p style="margin-top:12px">' + esc($t(inf[1])) + '</p>' +
    '<p class="small muted" style="margin-top:6px">' + $t('Auch genannt: ') + esc($t(inf[0])) + '</p>' +
    (ex.length ? '<h3 style="margin:14px 0 4px">' + $t('Übungen damit') + '</h3><p class="small">' + ex.map(esc).join(' · ') + '</p>' : '') +
    '<button class="btn block ' + (miss ? 'brand' : 'fog') + '" style="margin-top:16px" data-act="eqInfoToggle" data-eq="' + e + '" type="button">' + (miss ? $t('Doch vorhanden') : $t('Gibt es in meinem Studio nicht')) + '</button>' + (ui.eqBack ? '<button class="btn block" style="margin-top:8px" data-act="eqBack" type="button">' + $t('Zurück zur Liste') + '</button>' : '') + '</div>'); }
/* „?“ neben jedes Gerät in „Mein Studio“ und „Gerät fehlt?“ */
const eqAddHelp = h => h.replace(/(<button class="chip[^"]*" data-act="eqToggle" data-eq="([a-z_]+)"[^>]*>[\s\S]*?<\/button>)/g, (m0, btn, e) => EQ_INFO[e] ? '<span class="eqw">' + btn + '<button class="eqq" data-act="eqInfo" data-eq="' + e + '" type="button" aria-label="' + $t('Was ist das?') + '">?</button></span>' : btn);
const _studioCardEq = studioCard; studioCard = function () { return eqAddHelp(_studioCardEq.apply(this, arguments)); };
const _eqBlockEq = eqBlock; eqBlock = function () { return eqAddHelp(_eqBlockEq.apply(this, arguments)); };
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'eqBack') { e.stopPropagation(); const h = ui.eqBack; ui.eqBack = null; if (h) { $('#sheetCard').innerHTML = h; const miss = S.settings.missingEq || []; $('#sheetCard').querySelectorAll('[data-act=eqToggle]').forEach(x => { const m = miss.includes(x.dataset.eq); x.classList.toggle('on', !m); x.textContent = (m ? '✕ ' : '✓ ') + (EQUIP[x.dataset.eq] || ''); }); } }
  else if (b.dataset.act === 'eqInfo') { e.stopPropagation(); ui.eqBack = document.getElementById('sheet') && !document.getElementById('sheet').hidden ? document.getElementById('sheetCard').innerHTML : null; eqInfoSheet(b.dataset.eq); }
  else if (b.dataset.act === 'eqInfoToggle') { toggleIn('missingEq', b.dataset.eq); eqInfoSheet(b.dataset.eq); if (route.name === 'mehr') render(); } }, true);
