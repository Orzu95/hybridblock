# Hybridblock – Russische Übersetzung: Stand und Lücken

Stand 25.11.2026, App-Version hb-v120. Diese Datei löst die alte Korrekturseite „Hybridblock Russisch-Korrektur“ (674 Texte, Oktober) ab. Dort sind keine offenen Korrekturen gespeichert.

## 1. Zahlen

| Bereich | Umfang | Stand |
|---|---|---|
| Oberflächentexte (`www/lang-ru.js`, Schlüssel = deutscher Text) | 5.416 Einträge, gleich viele wie Englisch | vollständig vorhanden, Qualität nur stichprobenartig geprüft |
| Im Code per `$t()` / `$tf()` genutzte Texte | 3.914 | keine echten Lücken |
| Wissensbank (`www/evidence-ru.json`) | 546 Einträge, 28 Kategorien, je Thema und Lernkarte | vollständig vorhanden, Qualität ungeprüft |
| Technik-Hinweise (`www/cues.js`, Feld `ru`) | 242 Übungen × 3 Hinweise | vollständig vorhanden |
| Eigene RU-Ausführungstexte (`www/cues-ru.js`) | 76 Übungen | vorhanden |
| Push-Texte (`supabase/functions/push-send/index.ts`, Block `ru`) | wenige Zeilen | vorhanden, ungeprüft |
| Datenschutzerklärung (`www/privacypolicy.html`, `www/privacy.js`) | – | **nur DE und EN, kein Russisch** |

Geprüft wurde automatisch: alle Ansichten auf Russisch (Handy und Desktop, Athlet und Coach), jeder sichtbare Text sowie `placeholder`, `aria-label` und `title` auf lateinische bzw. deutsche Reste; dazu alle Wörterbuch-Einträge auf `(а)`-Formen, männliche Vergangenheit und Sie-Form. Nicht automatisch geprüft: Dialoge (Sheets), kurze Meldungen (Toasts), Push-Nachrichten und die inhaltliche Qualität.

## 2. Gefundene Lücken

### 2.1 Fest im Code stehende deutsche Texte (behebt Claude im Code)

Diese Stellen laufen nicht durch das Wörterbuch. Claude baut sie auf `$t()` um, GPT liefert nur die russischen Texte.

| Datei | Text (DE) | Wo sichtbar |
|---|---|---|
| `index.html` (Scanner) | Scanner schließen · Taschenlampe · Nummer eintippen · Barcode-Nummer | Barcode-Scanner, Vorlesefunktion und Eingabefeld |
| `app.js` ~1424 | „Woche {n}“ (aria-label) | Wochenleiste im Training |
| `app.js` ~1756–1787 | „Satz {n} kg“, „Satz {n} RPE“, „Satz {n} erledigt“ (aria-label) | Logger, Vorlesefunktion |
| `app.js` ~6536 | „Körperkarte vorne“, „Körperkarte hinten“ (aria-label) | Körperkarte |
| `app.js` (Essen) | Einheit „kcal“ in „0 / 651 kcal“ pro Mahlzeit | Essen, Mahlzeiten-Kopf (soll „ккал“ sein) |
| `libtabs.js` 18 | Reiter „Community“ | Bibliothek |
| `levels.js` 324 | „Impellizzeri 2020 (Kritik)“ | Verlauf, Quellenhinweis |
| `planwide.js` | Einheitenname im Hinweis „«+» добавит в Ganzkörper A“ | breiter Plan-Editor (Name wird nicht übersetzt, Übersetzung „Всё тело A“ existiert) |
| `manifest.webmanifest` | Beschreibung „Training mit Autoregulation, Ernährung …“ | Installation der Web-App |
| `privacypolicy.html`, `privacy.js` | ganze Datenschutzerklärung | auf Russisch erscheint der englische Text |

### 2.2 Geschlechtsformen mit „(а)“ und männliche Vergangenheit (Regel: geschlechtsneutral)

| DE (Schlüssel) | RU aktuell |
|---|---|
| Beschreib kurz, was du gegessen hast. | Коротко опиши, что ты съел(а). |
| Einverstanden | Согласен(на) |
| Hast du in den letzten 12 Monaten wegen Schwindel das Gleichgewicht oder das Bewusstsein verloren? | Терял(а) ли ты за последние 12 месяцев равновесие или сознание из-за головокружения? |
| Ich habe das ärztlich abgeklärt. | Я обсудил(а) это с врачом. |
| Schreib oder diktiere, was du gegessen hast, mit Mengen, wenn du sie weißt. | Напиши или продиктуй, что ты съел(а), с количеством, если знаешь. |
| Wusste ich | Знал(а) |
| Du hast schon 2 Pläne veröffentlicht. | Ты уже опубликовал 2 плана. |
| Ihr Fortschritt und die Planwoche bleiben erhalten. Was du bei einzelnen Athleten angepasst hast, wird dabei überschrieben. | Их прогресс и неделя плана сохранятся. Всё, что ты менял для отдельных спортсменов, будет перезаписано. |

### 2.3 Bewusst unübersetzt (kein Fehler)

Marken, Eigennamen und Quellen bleiben im Original: Hybridblock, Health Connect, Zepp, Garmin, Polar, Huawei Health, Samsung Health, Apple Watch, Withings, RepDB, MuscleMap, Open Food Facts, Studienzitate (z. B. „Foster 2001 (sRPE)“), Originaltitel von Programmen und Artikeln (z. B. „5/3/1 Boring But Big“, „NHS Couch to 5K“, T Nation), Bibliotheks-Plannamen (Bodyweight Base, First 5K, Engine 4×4, Squat Lab, High Tide, Bedrock, Broadside, Dual Drive, Spring Loaded, Triple Play, Tempo Shift, Long Haul, Iron Grip), Gym-Kürzel (RPE, RIR, AMRAP, EMOM, HRV, VO₂max, e1RM, ACWR, TRIMP, Deload, Superset, RDL, SkiErg, Roxzone, Wall Balls).

### 2.4 Noch nicht geprüft (Aufgabe für GPT)

1. Gesamte Qualität von `www/lang-ru.js` (5.416 Einträge): natürliche Sprache, ты-Form, geschlechtsneutral, einheitliche Begriffe (Glossar unten), Zahlen- und Platzhalter-Treue.
2. Dialoge, Meldungen und Fehlertexte, die nur in bestimmten Abläufen erscheinen (Sheets, Toasts, Bestätigungen): im Code `$t('…')` in `openSheet(`, `toast(`, `confirm`-Abläufen suchen und die RU-Werte prüfen.
3. Wissensbank `www/evidence-ru.json`: Themen (`u`) und Lernkarten (`sl`: Überschrift, 2 Kernpunkte, 3 Stichpunkte, Fazit, Quizfrage mit richtiger und 3 falschen Antworten).
4. Technik-Hinweise RU in `www/cues.js` (Feld `ru`) und `www/cues-ru.js`.
5. Push-Texte in `supabase/functions/push-send/index.ts` (Block `ru`).
6. Neue russische Fassung der Datenschutzerklärung (nach dem englischen Abschnitt in `www/privacypolicy.html`; Platzhalter in eckigen Klammern bleiben Platzhalter).
7. Beschreibung in `www/manifest.webmanifest` auf Russisch (Feld separat liefern, Claude baut Mehrsprachigkeit ein).

## 3. Stilregeln und Glossar

**Regeln**
- Anrede immer ты, nie вы, außer echte Mehrzahl („ваш чат“ zwischen Coach und Athlet ist korrekt).
- Geschlechtsneutral: keine „(а)“-Formen, keine Vergangenheitsform mit Geschlecht. Umformulieren: „Что ты ел?“ → „Что было в еде?“ / „Опиши, что было на тарелке“; „Согласен(на)“ → „Принимаю“ / „Да, согласие даю“; „Ты опубликовал“ → „У тебя уже 2 опубликованных плана“.
- Gängige Gym-Begriffe nicht eindeutschen und nicht künstlich russifizieren: RPE, RIR, AMRAP, Deload (делоуд), Superset (суперсет), PR (рекорд/PR), Split Squats (сплит-приседания), RDL (румынская тяга).
- Platzhalter `{n}`, `{name}`, `{a}`, `{b}` usw., HTML-Tags und führende/abschließende Leerzeichen exakt übernehmen.
- Zahlen: Dezimalkomma, Tausender mit Leerzeichen (1 200), Einheiten ккал, г, кг, км, мин, уд/мин.
- Kein Medizinprodukt-Ton: „ограничения“ statt „жалобы/боль“ als Kategorie, keine Diagnosen oder Heilversprechen.
- Kurze UI-Texte (Knöpfe, Reiter) möglichst kurz halten; russische Texte sprengen sonst die Knöpfe.

**Glossar (verbindlich)**

| DE | RU |
|---|---|
| Einheit (Training) | тренировка |
| Satz | подход |
| Wiederholung (Wdh.) | повторение (повт.) |
| Plan / Block | план / блок |
| Woche | неделя |
| Kraft / Ausdauer | сила / выносливость |
| Trendgewicht | трендовый вес |
| Kalorienziel / Bedarf | цель по калориям / расход |
| Makros (Protein, Fett, Kohlenhydrate) | БЖУ (белки, жиры, углеводы) |
| Check-in | чек-ин |
| Formcheck | проверка техники |
| Bereitschaft (Readiness) | готовность |
| Einschränkungen | ограничения |
| Coach / Athlet | тренер / атлет |
| Vorlage | шаблон |
| Bibliothek | библиотека |
| Wissensbank | база знаний |
| Hinweis (Plan-Prüfung) | подсказка |
| Pause (krank/verletzt/Urlaub) | пауза (болезнь / травма / отпуск) |
| Wiedereinstieg | возвращение |
| Uhr | часы |
| freie Aktivität | свободная активность |

## 4. Rückgabeformat (für die Einarbeitung durch Claude)

GPT liefert eine einzige Markdown-Datei `ru-korrekturen.md` mit genau diesen Abschnitten:

1. `## A. Wörterbuch` — ein Codeblock im TSV-Format, eine Zeile pro geänderten oder neuen Eintrag: `DE<TAB>EN<TAB>RU`. DE ist der Schlüssel exakt wie in `lang-ru.js` (ohne JSON-Escapes, Zeilenumbrüche als `\n`), EN unverändert aus `lang-en.js`. Nur geänderte Einträge, keine unveränderten.
2. `## B. Neue Texte für Code-Stellen` — Tabelle: Datei, Stelle, DE, EN, RU (für Abschnitt 2.1).
3. `## C. Wissensbank` — Codeblock JSON: `{ "ID": { "u": "...", "sl": { ... } } }`, nur geänderte Einträge, Struktur wie in `evidence-ru.json`.
4. `## D. Technik-Hinweise` — Codeblock JSON: `{ "exId": ["…","…","…"] }` für `cues.js`, getrennt davon für `cues-ru.js`.
5. `## E. Push-Texte` — die geänderten Zeilen aus dem `ru`-Block.
6. `## F. Datenschutzerklärung RU` — vollständiger HTML-Abschnitt `<section lang="ru" id="ru">…</section>`.
7. `## G. Manifest` — russische Beschreibung (eine Zeile).
8. `## H. Offene Fragen` — Stellen, bei denen Kontext fehlt oder die Bedeutung unklar ist, mit Schlüssel und Begründung.
